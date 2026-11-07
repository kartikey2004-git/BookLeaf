import { randomUUID } from "node:crypto";
import express, { Router, type Request } from "express";
import { z } from "@repo/validation";
import { createRequireAdmin } from "../middleware/admin-auth.js";
import { HttpError } from "../middleware/errors.js";
import {
  createRequireAuthor,
  type SessionResolver,
} from "../middleware/author-auth.js";
import {
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  type TicketService,
} from "../modules/ticket/service.js";
import type { AuthorService } from "../modules/author/service.js";
import {
  AiProviderError,
  completeJson,
  draftPrompt,
  draftSchema,
  draftTextPrompt,
  streamDraft,
  buildAccountDataBlock,
} from "@repo/ai";
import { prisma } from "@repo/database";
import type { ApiEnvironment } from "../config/env.js";
import { createInngestClient, publishTicketCreated } from "../lib/inngest.js";
import {
  createAttachmentObjectKey,
  getMinioAttachmentStorage,
  getTigrisAttachmentStorage,
  uploadAttachment,
  validateAttachmentFile,
} from "../lib/attachment-storage.js";
import { createFixedWindowRateLimit } from "../middleware/rate-limit.js";
import {
  initializeEventStream,
  canOpenEventStream,
  writeEvent,
} from "../lib/sse.js";
import {
  publishAuthorTicketEvent,
  subscribeAuthorTicketEvents,
  type TicketChangeReason,
} from "../lib/ticket-events.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
const ticketIdSchema = z.object({ ticketId: z.string().min(1).max(255) });
const ticketInputSchema = z.object({
  bookId: z.string().min(1).max(255).optional(),
  subject: z.string().trim().min(3).max(200),
  description: z.string().trim().min(1).max(10_000),
});
const messageSchema = z.object({
  content: z.string().trim().min(1).max(10_000),
});
const authorListSchema = paginationSchema.extend({
  status: z.enum(ticketStatuses).optional(),
});
const adminListSchema = paginationSchema.extend({
  status: z.enum(ticketStatuses).optional(),
  category: z.enum(ticketCategories).optional(),
  priority: z.enum(ticketPriorities).optional(),
  assignedAdminId: z.string().min(1).max(255).optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
  unresolved: z.coerce.boolean().optional(),
});
const versionSchema = z.object({ version: z.coerce.number().int().min(0) });
const statusSchema = versionSchema.extend({ status: z.enum(ticketStatuses) });
const prioritySchema = versionSchema.extend({
  priority: z.enum(ticketPriorities),
});
const categorySchema = versionSchema.extend({
  category: z.enum(ticketCategories),
});
const assignmentSchema = versionSchema.extend({
  assignedAdminId: z.string().min(1).max(255).nullable(),
});
const authorAttachmentSignSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(128),
  size: z.coerce
    .number()
    .int()
    .min(1)
    .max(10 * 1024 * 1024),
});
const authorAttachmentInputSchema = z.object({
  publicId: z.string().min(1).max(255),
  secureUrl: z.string().url().max(2048),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(128),
  size: z.coerce
    .number()
    .int()
    .min(1)
    .max(10 * 1024 * 1024),
});

async function notifyTicketChanged(
  request: Request,
  ticketService: TicketService,
  ticketId: string,
  reason: TicketChangeReason,
): Promise<void> {
  try {
    const audience = await ticketService.getTicketAudience(ticketId);
    if (audience) {
      await publishAuthorTicketEvent(audience.authorId, {
        ticketId,
        reference: audience.reference,
        reason,
      });
    }
  } catch (error) {
    request.log?.warn?.(
      {
        requestId: request.requestId,
        failureKind: "TICKET_EVENT_PUBLISH_FAILED",
        reason,
        err: error instanceof Error ? error.message : String(error),
      },
      "Could not publish ticket update event",
    );
  }
}

async function draftAccountData(ticketId: string): Promise<string> {
  const linked = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { authorId: true, bookId: true },
  });
  if (!linked?.bookId) return buildAccountDataBlock(null);
  const book = await prisma.book.findFirst({
    where: { id: linked.bookId, authorId: linked.authorId },
    select: {
      title: true, publicationStatus: true, isbn: true, publicationDate: true,
      mrp: true, totalCopiesSold: true, totalRoyaltyEarned: true, royaltyPaid: true,
      royaltyPending: true, lastRoyaltyPayoutDate: true,
      distributions: { select: { platform: { select: { name: true } } } },
    },
  });
  return buildAccountDataBlock(
    book
      ? { ...book, status: book.publicationStatus, platforms: book.distributions.map((item) => item.platform.name) }
      : null,
  );
}

export function createTicketRouters(
  getSession: SessionResolver,
  authorService: AuthorService,
  ticketService: TicketService,
  environment?: ApiEnvironment,
  markAiTriageUnavailable: (ticketId: string) => Promise<void> = async (
    ticketId,
  ) => {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        aiStatus: "FAILED",
        aiError: "AI triage is unavailable. Classify this ticket manually.",
      },
    });
  },
): { author: Router; admin: Router } {
  const author = Router();
  author.use("/author", createRequireAuthor(getSession, authorService));
  author.use(
    "/author",
    createFixedWindowRateLimit({
      max: 60,
      windowMs: 60_000,
      key: (request) => `author:${request.authorIdentity!.userId}`,
    }),
  );
  author.post(
    "/author/tickets/attachments/sign",
    async (request, response, next) => {
      try {
        const input = authorAttachmentSignSchema.parse(request.body);
        const minio = getMinioAttachmentStorage(environment);
        const tigris = getTigrisAttachmentStorage(environment);
        if (minio) {
          validateAttachmentFile(input.fileName, input.mimeType, input.size);
          response.json({
            storage: "minio",
            uploadUrl: "/api/v1/author/tickets/attachments/upload",
          });
          return;
        }
        if (!tigris) {
          throw new HttpError(
            503,
            "ATTACHMENT_STORAGE_UNAVAILABLE",
            "Ticket attachment storage is not configured",
          );
        }
        validateAttachmentFile(input.fileName, input.mimeType, input.size);
        response.json({
          storage: "tigris",
          uploadUrl: "/api/v1/author/tickets/attachments/upload",
        });
      } catch (error) {
        next(error);
      }
    },
  );
  author.put(
    "/author/tickets/attachments/upload",
    express.raw({ type: () => true, limit: "10mb" }),
    async (request, response, next) => {
      try {
        const fileName = request.header("x-file-name") ?? "";
        const mimeType = request.header("content-type")?.split(";")[0] ?? "";
        const content = request.body;
        if (!Buffer.isBuffer(content)) {
          throw new HttpError(
            400,
            "VALIDATION_ERROR",
            "Attachment content is required",
          );
        }
        validateAttachmentFile(fileName, mimeType, content.length);
        const minio = getMinioAttachmentStorage(environment);
        const tigris = getTigrisAttachmentStorage(environment);
        const storage = minio ?? tigris;
        if (!storage) {
          throw new HttpError(
            503,
            "ATTACHMENT_STORAGE_UNAVAILABLE",
            "Attachment storage is not configured",
          );
        }
        const publicId = createAttachmentObjectKey(fileName);
        const secureUrl = await uploadAttachment(storage, publicId, content, mimeType);
        response.status(201).json({ publicId, secureUrl });
      } catch (error) {
        next(error);
      }
    },
  );
  author.post(
    "/author/tickets/:ticketId/attachments",
    async (request, response, next) => {
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const input = authorAttachmentInputSchema.parse(request.body);
        const attachment = await ticketService.addAttachment(
          request.authorIdentity!.id,
          request.authorIdentity!.userId,
          ticketId,
          {
            fileName: input.fileName,
            mimeType: input.mimeType,
            size: input.size,
            cloudinaryPublicId: input.publicId,
            secureUrl: input.secureUrl,
          },
        );
        await notifyTicketChanged(
          request,
          ticketService,
          ticketId,
          "attachment-added",
        );
        response.status(201).json({ attachment });
      } catch (error) {
        next(error);
      }
    },
  );
  author.post("/author/tickets", async (request, response, next) => {
    try {
      const ticket = await ticketService.create(
        request.authorIdentity!.id,
        request.authorIdentity!.userId,
        ticketInputSchema.parse(request.body),
      );
      if (environment?.INNGEST_EVENT_KEY) {
        publishTicketCreated(createInngestClient(environment), ticket.id).catch(
          () => undefined,
        );
      } else {
        markAiTriageUnavailable(ticket.id).catch((error: unknown) => {
          request.log?.warn?.(
            {
              requestId: request.requestId,
              ticketId: ticket.id,
              err: error instanceof Error ? error.message : String(error),
            },
            "Could not mark ticket AI triage as unavailable",
          );
        });
      }
      await notifyTicketChanged(
        request,
        ticketService,
        ticket.id,
        "ticket-created",
      );
      response.status(201).json({ ticket });
    } catch (error) {
      next(error);
    }
  });
  author.get("/author/tickets", async (request, response, next) => {
    try {
      const { page, pageSize, status } = authorListSchema.parse(request.query);
      const result = await ticketService.listAuthor(
        request.authorIdentity!.id,
        page,
        pageSize,
        status,
      );
      response.json({
        tickets: result.tickets,
        pagination: { page, pageSize, total: result.total },
      });
    } catch (error) {
      next(error);
    }
  });
  author.get("/author/tickets/stream", async (request, response, next) => {
    const identity = request.authorIdentity!;
    if (!canOpenEventStream(identity.userId)) {
      response.status(503).json({
        error: {
          code: "EVENT_STREAM_UNAVAILABLE",
          message:
            "Too many live update streams are open. Please try again shortly.",
        },
      });
      return;
    }
    const lastEventIdHeader = request.headers["last-event-id"];
    const rawLastEventId = Array.isArray(lastEventIdHeader)
      ? lastEventIdHeader[0]
      : lastEventIdHeader;
    const parsedLastEventId =
      rawLastEventId && /^\d+$/.test(rawLastEventId)
        ? Number(rawLastEventId)
        : 0;
    const cleanup = initializeEventStream(request, response, identity.userId);
    try {
      const unsubscribe = await subscribeAuthorTicketEvents(
        identity.id,
        response,
        parsedLastEventId,
      );
      request.on("close", () => {
        unsubscribe();
        cleanup();
      });
      writeEvent(response, {
        id: String(parsedLastEventId),
        event: "connected",
        data: { ok: true },
      });
    } catch (error) {
      cleanup();
      next(error);
    }
  });
  author.get("/author/tickets/:ticketId", async (request, response, next) => {
    try {
      const { ticketId } = ticketIdSchema.parse(request.params);
      const ticket = await ticketService.getAuthor(
        request.authorIdentity!.id,
        ticketId,
      );
      if (!ticket)
        throw new HttpError(404, "NOT_FOUND", "Ticket was not found");
      response.json({ ticket });
    } catch (error) {
      next(error);
    }
  });
  author.post(
    "/author/tickets/:ticketId/messages",
    async (request, response, next) => {
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const message = await ticketService.addAuthorMessage(
          request.authorIdentity!.id,
          request.authorIdentity!.userId,
          ticketId,
          messageSchema.parse(request.body),
        );
        await notifyTicketChanged(
          request,
          ticketService,
          ticketId,
          "author-message",
        );
        response.status(201).json({ message });
      } catch (error) {
        next(error);
      }
    },
  );

  const admin = Router();
  admin.use("/admin", createRequireAdmin(getSession));
  admin.use(
    "/admin",
    createFixedWindowRateLimit({
      max: 120,
      windowMs: 60_000,
      key: (request) => `admin:${request.adminIdentity!.userId}`,
    }),
  );
  admin.get("/admin/tickets", async (request, response, next) => {
    try {
      const input = adminListSchema.parse(request.query);
      if (
        input.createdFrom &&
        input.createdTo &&
        input.createdFrom > input.createdTo
      ) {
        throw new HttpError(
          400,
          "VALIDATION_ERROR",
          "createdFrom must not be after createdTo",
        );
      }
      const result = await ticketService.listAdmin(input);
      response.json({
        tickets: result.tickets,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  });
  admin.get("/admin/tickets/:ticketId", async (request, response, next) => {
    try {
      const { ticketId } = ticketIdSchema.parse(request.params);
      const ticket = await ticketService.getAdmin(ticketId);
      if (!ticket)
        throw new HttpError(404, "NOT_FOUND", "Ticket was not found");
      response.json({ ticket });
    } catch (error) {
      next(error);
    }
  });
  admin.patch(
    "/admin/tickets/:ticketId/status",
    async (request, response, next) => {
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const ticket = await ticketService.updateStatus(
          request.adminIdentity!.userId,
          ticketId,
          statusSchema.parse(request.body).status,
          statusSchema.parse(request.body).version,
        );
        await notifyTicketChanged(
          request,
          ticketService,
          ticketId,
          "status-changed",
        );
        response.json({ ticket });
      } catch (error) {
        next(error);
      }
    },
  );
  admin.patch(
    "/admin/tickets/:ticketId/priority",
    async (request, response, next) => {
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const ticket = await ticketService.updatePriority(
          request.adminIdentity!.userId,
          ticketId,
          prioritySchema.parse(request.body).priority,
          prioritySchema.parse(request.body).version,
        );
        await notifyTicketChanged(
          request,
          ticketService,
          ticketId,
          "priority-changed",
        );
        response.json({ ticket });
      } catch (error) {
        next(error);
      }
    },
  );
  admin.patch(
    "/admin/tickets/:ticketId/category",
    async (request, response, next) => {
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const ticket = await ticketService.updateCategory(
          request.adminIdentity!.userId,
          ticketId,
          categorySchema.parse(request.body).category,
          categorySchema.parse(request.body).version,
        );
        await notifyTicketChanged(
          request,
          ticketService,
          ticketId,
          "category-changed",
        );
        response.json({ ticket });
      } catch (error) {
        next(error);
      }
    },
  );
  admin.patch(
    "/admin/tickets/:ticketId/assignment",
    async (request, response, next) => {
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const ticket = await ticketService.updateAssignment(
          request.adminIdentity!.userId,
          ticketId,
          assignmentSchema.parse(request.body).assignedAdminId,
          assignmentSchema.parse(request.body).version,
        );
        await notifyTicketChanged(
          request,
          ticketService,
          ticketId,
          "assignment-changed",
        );
        response.json({ ticket });
      } catch (error) {
        next(error);
      }
    },
  );
  admin.post(
    "/admin/tickets/:ticketId/ai-draft",
    createFixedWindowRateLimit({
      max: 5,
      windowMs: 60_000,
      key: (request) => `ai-draft:${request.adminIdentity!.userId}`,
    }),
    async (request, response, next) => {
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const ticket = await ticketService.getAdmin(ticketId);
        if (!ticket)
          throw new HttpError(404, "NOT_FOUND", "Ticket was not found");
        if (!environment?.GEMINI_API_KEY)
          throw new HttpError(
            503,
            "AI_UNAVAILABLE",
            "AI drafting is not configured",
          );
        const conversation = (ticket.messages ?? [])
          .slice(-8)
          .map((item) => `${item.sender.role}: ${item.content}`)
          .join("\n");
        const accountData = await draftAccountData(ticketId);
        const draft = await completeJson(
          {
            apiKey: environment.GEMINI_API_KEY,
            model: environment.GEMINI_MODEL,
            timeoutMs: environment.GEMINI_TIMEOUT_MS,
          },
          draftPrompt(
            `Subject: ${ticket.subject}\nDescription: ${ticket.description}\nConversation:\n${conversation}`,
            accountData,
          ),
          draftSchema,
        );
        response.json({
          draft: draft.draft,
          recommendations: {
            category: ticket.ai.suggestedCategory,
            priority: ticket.ai.suggestedPriority,
          },
        });
      } catch (error) {
        if (error instanceof AiProviderError) {
          request.log?.error(
            {
              provider: "google-gemini",
              model: environment?.GEMINI_MODEL,
              failureKind: error.kind,
              providerStatus: error.providerStatus,
              requestId: request.requestId,
            },
            "Gemini draft generation failed",
          );
          const status =
            error.kind === "AUTH" ||
            error.kind === "INVALID_REQUEST" ||
            error.kind === "INVALID_OUTPUT"
              ? 502
              : 503;
          next(new HttpError(status, "AI_UNAVAILABLE", error.message));
        } else next(error);
      }
    },
  );
  admin.post(
    "/admin/tickets/:ticketId/ai-draft/stream",
    createFixedWindowRateLimit({
      max: 5,
      windowMs: 60_000,
      key: (request) => `ai-draft:${request.adminIdentity!.userId}`,
    }),
    async (request, response, next) => {
      let streamStarted = false;
      let controller: AbortController | undefined;
      let onClose: (() => void) | undefined;
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const ticket = await ticketService.getAdmin(ticketId);
        if (!ticket)
          throw new HttpError(404, "NOT_FOUND", "Ticket was not found");
        if (!environment?.GEMINI_API_KEY)
          throw new HttpError(
            503,
            "AI_UNAVAILABLE",
            "AI drafting is not configured",
          );
        const conversation = (ticket.messages ?? [])
          .slice(-8)
          .map((item) => `${item.sender.role}: ${item.content}`)
          .join("\n");
        const accountData = await draftAccountData(ticketId);

        response.status(200).set({
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        });
        response.flushHeaders();
        streamStarted = true;
        controller = new AbortController();
        onClose = () => {
          if (!response.writableEnded) controller?.abort();
        };
        response.once("close", onClose);

        const draft = await streamDraft(
          {
            apiKey: environment.GEMINI_API_KEY,
            model: environment.GEMINI_MODEL,
            timeoutMs: environment.GEMINI_TIMEOUT_MS,
          },
          draftTextPrompt(
            `Subject: ${ticket.subject}\nDescription: ${ticket.description}\nConversation:\n${conversation}`,
            accountData,
          ),
          (text) => {
            if (!controller?.signal.aborted && !response.destroyed) {
              writeEvent(response, {
                id: randomUUID(),
                event: "chunk",
                data: { text },
              });
            }
          },
          controller.signal,
        );
        if (!controller.signal.aborted && !response.destroyed) {
          writeEvent(response, {
            id: randomUUID(),
            event: "done",
            data: {
              draft,
              recommendations: {
                category: ticket.ai.suggestedCategory,
                priority: ticket.ai.suggestedPriority,
              },
            },
          });
          response.end();
        }
      } catch (error) {
        if (error instanceof AiProviderError) {
          request.log?.error(
            {
              provider: "google-gemini",
              model: environment?.GEMINI_MODEL,
              failureKind: error.kind,
              providerStatus: error.providerStatus,
              requestId: request.requestId,
            },
            "Gemini draft stream failed",
          );
        } else if (streamStarted) {
          request.log?.error(
            { requestId: request.requestId, failureKind: "INTERNAL" },
            "AI draft stream failed",
          );
        }
        if (!streamStarted) {
          if (error instanceof AiProviderError) {
            const status =
              error.kind === "AUTH" ||
              error.kind === "INVALID_REQUEST" ||
              error.kind === "INVALID_OUTPUT"
                ? 502
                : 503;
            next(new HttpError(status, "AI_UNAVAILABLE", error.message));
          } else next(error);
        } else if (
          !controller?.signal.aborted &&
          !response.destroyed &&
          !response.writableEnded
        ) {
          writeEvent(response, {
            id: randomUUID(),
            event: "error",
            data: {
              message:
                "Draft generation is temporarily unavailable. Please try again shortly.",
            },
          });
          response.end();
        }
      } finally {
        if (onClose) response.off("close", onClose);
      }
    },
  );
  admin.post(
    "/admin/tickets/:ticketId/messages",
    async (request, response, next) => {
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const message = await ticketService.addAdminMessage(
          request.adminIdentity!.userId,
          ticketId,
          messageSchema.parse(request.body),
        );
        await notifyTicketChanged(
          request,
          ticketService,
          ticketId,
          "admin-message",
        );
        response.status(201).json({ message });
      } catch (error) {
        next(error);
      }
    },
  );
  admin.post(
    "/admin/tickets/:ticketId/internal-notes",
    async (request, response, next) => {
      try {
        const { ticketId } = ticketIdSchema.parse(request.params);
        const note = await ticketService.addInternalNote(
          request.adminIdentity!.userId,
          ticketId,
          messageSchema.parse(request.body),
        );
        await notifyTicketChanged(
          request,
          ticketService,
          ticketId,
          "internal-note-added",
        );
        response.status(201).json({ note });
      } catch (error) {
        next(error);
      }
    },
  );
  return { author, admin };
}
