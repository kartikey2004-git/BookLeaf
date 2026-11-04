import { Router } from "express";
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
} from "@repo/ai";
import type { ApiEnvironment } from "../config/env.js";
import { createInngestClient, publishTicketCreated } from "../lib/inngest.js";

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

export function createTicketRouters(
  getSession: SessionResolver,
  authorService: AuthorService,
  ticketService: TicketService,
  environment?: ApiEnvironment,
): { author: Router; admin: Router } {
  const author = Router();
  author.use("/author", createRequireAuthor(getSession, authorService));
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
      }
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
        response.status(201).json({ message });
      } catch (error) {
        next(error);
      }
    },
  );

  const admin = Router();
  admin.use("/admin", createRequireAdmin(getSession));
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
        response.json({
          ticket: await ticketService.updateStatus(
            request.adminIdentity!.userId,
            ticketId,
            statusSchema.parse(request.body).status,
            statusSchema.parse(request.body).version,
          ),
        });
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
        response.json({
          ticket: await ticketService.updatePriority(
            request.adminIdentity!.userId,
            ticketId,
            prioritySchema.parse(request.body).priority,
            prioritySchema.parse(request.body).version,
          ),
        });
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
        response.json({
          ticket: await ticketService.updateCategory(
            request.adminIdentity!.userId,
            ticketId,
            categorySchema.parse(request.body).category,
            categorySchema.parse(request.body).version,
          ),
        });
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
        response.json({
          ticket: await ticketService.updateAssignment(
            request.adminIdentity!.userId,
            ticketId,
            assignmentSchema.parse(request.body).assignedAdminId,
            assignmentSchema.parse(request.body).version,
          ),
        });
      } catch (error) {
        next(error);
      }
    },
  );
  admin.post(
    "/admin/tickets/:ticketId/ai-draft",
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
        const draft = await completeJson(
          {
            apiKey: environment.GEMINI_API_KEY,
            model: environment.GEMINI_MODEL,
            timeoutMs: environment.GEMINI_TIMEOUT_MS,
          },
          draftPrompt(
            `Subject: ${ticket.subject}\nDescription: ${ticket.description}\nConversation:\n${conversation}`,
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
          const status =
            error.kind === "AUTH"
              ? 502
              : error.kind === "INVALID_OUTPUT"
                ? 502
                : 503;
          next(new HttpError(status, "AI_UNAVAILABLE", error.message));
        } else next(error);
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
        response.status(201).json({ note });
      } catch (error) {
        next(error);
      }
    },
  );
  return { author, admin };
}
