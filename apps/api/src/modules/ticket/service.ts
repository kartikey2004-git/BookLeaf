import { randomUUID } from "node:crypto";
import { prisma } from "@repo/database";
import { HttpError } from "../../middleware/errors.js";

export const ticketCategories = [
  "ROYALTY_AND_PAYMENTS",
  "ISBN_AND_METADATA",
  "PRINTING_AND_QUALITY",
  "DISTRIBUTION_AND_AVAILABILITY",
  "BOOK_STATUS_AND_PRODUCTION",
  "GENERAL_INQUIRY",
] as const;
export const ticketPriorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export const ticketStatuses = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export type TicketCategory = (typeof ticketCategories)[number];
export type TicketPriority = (typeof ticketPriorities)[number];
export type TicketStatus = (typeof ticketStatuses)[number];

type TicketInput = {
  bookId?: string | undefined;
  subject: string;
  description: string;
};
type MessageInput = { content: string };
type AdminListInput = {
  page: number;
  pageSize: number;
  status?: TicketStatus | undefined;
  category?: TicketCategory | undefined;
  priority?: TicketPriority | undefined;
  assignedAdminId?: string | undefined;
  createdFrom?: Date | undefined;
  createdTo?: Date | undefined;
};

const authorTicketSelection = {
  id: true,
  reference: true,
  subject: true,
  description: true,
  category: true,
  priority: true,
  status: true,
  version: true,
  assignedAdminId: true,
  resolvedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  book: { select: { externalId: true, title: true } },
  messages: {
    select: {
      id: true,
      content: true,
      createdAt: true,
      editedAt: true,
      sender: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  },
} as const;

const adminTicketSelection = {
  ...authorTicketSelection,
  aiSuggestedCategory: true,
  aiSuggestedPriority: true,
  aiClassificationConfidence: true,
  aiPriorityConfidence: true,
  aiClassificationReasoning: true,
  aiPriorityReasoning: true,
  aiKnowledgeSections: true,
  aiStatus: true,
  aiProcessedAt: true,
  aiError: true,
  author: { select: { externalId: true, name: true, email: true, city: true } },
  assignedAdmin: { select: { id: true, name: true, email: true } },
  internalNotes: {
    select: {
      id: true,
      content: true,
      createdAt: true,
      admin: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  },
  auditEvents: {
    select: {
      id: true,
      action: true,
      metadata: true,
      createdAt: true,
      actor: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  },
} as const;

function date(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

function message(message: {
  id: string;
  content: string;
  createdAt: Date;
  editedAt: Date | null;
  sender: { name: string; role: string };
}) {
  return {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    editedAt: date(message.editedAt),
    sender: { name: message.sender.name, role: message.sender.role },
  };
}

function authorTicket(ticket: {
  id: string;
  reference: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  version: number;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  book: { externalId: string; title: string } | null;
  messages?: Array<{
    id: string;
    content: string;
    createdAt: Date;
    editedAt: Date | null;
    sender: { name: string; role: string };
  }>;
}) {
  return {
    id: ticket.id,
    reference: ticket.reference,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    version: ticket.version,
    book: ticket.book
      ? { id: ticket.book.externalId, title: ticket.book.title }
      : null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    resolvedAt: date(ticket.resolvedAt),
    closedAt: date(ticket.closedAt),
    ...(ticket.messages ? { messages: ticket.messages.map(message) } : {}),
  };
}

function adminTicket(
  ticket: Parameters<typeof authorTicket>[0] & {
    aiSuggestedCategory: string | null;
    aiSuggestedPriority: string | null;
    aiClassificationConfidence: number | null;
    aiPriorityConfidence: number | null;
    aiClassificationReasoning: string | null;
    aiPriorityReasoning: string | null;
    aiKnowledgeSections: unknown;
    aiStatus: string;
    aiProcessedAt: Date | null;
    aiError: string | null;
    author: { externalId: string; name: string; email: string; city: string };
    assignedAdmin: { id: string; name: string; email: string } | null;
    internalNotes: Array<{
      id: string;
      content: string;
      createdAt: Date;
      admin: { id: string; name: string; email: string };
    }>;
    auditEvents: Array<{
      id: string;
      action: string;
      metadata: unknown;
      createdAt: Date;
      actor: { id: string; name: string; role: string };
    }>;
  },
) {
  return {
    ...authorTicket(ticket),
    ai: {
      suggestedCategory: ticket.aiSuggestedCategory,
      suggestedPriority: ticket.aiSuggestedPriority,
      classificationConfidence: ticket.aiClassificationConfidence,
      priorityConfidence: ticket.aiPriorityConfidence,
      classificationReasoning: ticket.aiClassificationReasoning,
      priorityReasoning: ticket.aiPriorityReasoning,
      knowledgeSections: ticket.aiKnowledgeSections,
      status: ticket.aiStatus,
      processedAt: date(ticket.aiProcessedAt),
      error: ticket.aiError,
    },
    author: ticket.author,
    assignedAdmin: ticket.assignedAdmin,
    internalNotes: ticket.internalNotes.map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      admin: note.admin,
    })),
    auditEvents: ticket.auditEvents.map((event) => ({
      id: event.id,
      action: event.action,
      metadata: event.metadata,
      createdAt: event.createdAt.toISOString(),
      actor: event.actor,
    })),
  };
}

function reference(): string {
  return `BL-${new Date().getUTCFullYear()}-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

const allowedTransitions: Record<TicketStatus, ReadonlySet<TicketStatus>> = {
  OPEN: new Set(["IN_PROGRESS", "RESOLVED", "CLOSED"]),
  IN_PROGRESS: new Set(["OPEN", "RESOLVED", "CLOSED"]),
  RESOLVED: new Set(["IN_PROGRESS", "CLOSED"]),
  CLOSED: new Set(),
};

export type TicketService = {
  create(
    authorId: string,
    actorUserId: string,
    input: TicketInput,
  ): Promise<ReturnType<typeof authorTicket>>;
  listAuthor(
    authorId: string,
    page: number,
    pageSize: number,
    status?: TicketStatus,
  ): Promise<{
    tickets: Array<ReturnType<typeof authorTicket>>;
    total: number;
  }>;
  getAuthor(
    authorId: string,
    ticketId: string,
  ): Promise<ReturnType<typeof authorTicket> | null>;
  addAuthorMessage(
    authorId: string,
    actorUserId: string,
    ticketId: string,
    input: MessageInput,
  ): Promise<ReturnType<typeof message>>;
  listAdmin(input: AdminListInput): Promise<{
    tickets: Array<ReturnType<typeof authorTicket>>;
    total: number;
  }>;
  getAdmin(ticketId: string): Promise<ReturnType<typeof adminTicket> | null>;
  updateStatus(
    actorUserId: string,
    ticketId: string,
    status: TicketStatus,
    version: number,
  ): Promise<ReturnType<typeof adminTicket>>;
  updatePriority(
    actorUserId: string,
    ticketId: string,
    priority: TicketPriority,
    version: number,
  ): Promise<ReturnType<typeof adminTicket>>;
  updateCategory(
    actorUserId: string,
    ticketId: string,
    category: TicketCategory,
    version: number,
  ): Promise<ReturnType<typeof adminTicket>>;
  updateAssignment(
    actorUserId: string,
    ticketId: string,
    assignedAdminId: string | null,
    version: number,
  ): Promise<ReturnType<typeof adminTicket>>;
  addAdminMessage(
    actorUserId: string,
    ticketId: string,
    input: MessageInput,
  ): Promise<ReturnType<typeof message>>;
  addInternalNote(
    actorUserId: string,
    ticketId: string,
    input: MessageInput,
  ): Promise<{ id: string; content: string; createdAt: string }>;
};

async function ticketForAdmin(ticketId: string) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    select: adminTicketSelection,
  });
}

async function requiredAdminTicket(ticketId: string) {
  const ticket = await ticketForAdmin(ticketId);
  if (!ticket) throw new HttpError(404, "NOT_FOUND", "Ticket was not found");
  return ticket;
}

export const prismaTicketService: TicketService = {
  async create(authorId, actorUserId, input) {
    if (input.bookId) {
      const book = await prisma.book.findFirst({
        where: { externalId: input.bookId, authorId },
        select: { id: true },
      });
      if (!book) throw new HttpError(404, "NOT_FOUND", "Book was not found");
      const ticket = await prisma.$transaction(async (tx) => {
        const created = await tx.ticket.create({
          data: {
            reference: reference(),
            authorId,
            bookId: book.id,
            subject: input.subject,
            description: input.description,
          },
        });
        await tx.ticketAuditEvent.create({
          data: { ticketId: created.id, actorUserId, action: "CREATED" },
        });
        return created;
      });
      return authorTicket({
        ...ticket,
        book: await prisma.book.findUnique({
          where: { id: book.id },
          select: { externalId: true, title: true },
        })!,
        messages: [],
      });
    }
    const ticket = await prisma.$transaction(async (tx) => {
      const created = await tx.ticket.create({
        data: {
          reference: reference(),
          authorId,
          subject: input.subject,
          description: input.description,
        },
      });
      await tx.ticketAuditEvent.create({
        data: { ticketId: created.id, actorUserId, action: "CREATED" },
      });
      return created;
    });
    return authorTicket({ ...ticket, book: null, messages: [] });
  },
  async listAuthor(authorId, page, pageSize, status) {
    const where = { authorId, ...(status ? { status } : {}) };
    const [tickets, total] = await prisma.$transaction([
      prisma.ticket.findMany({
        where,
        select: authorTicketSelection,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);
    return { tickets: tickets.map(authorTicket), total };
  },
  async getAuthor(authorId, ticketId) {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, authorId },
      select: authorTicketSelection,
    });
    return ticket ? authorTicket(ticket) : null;
  },
  async addAuthorMessage(authorId, actorUserId, ticketId, input) {
    return prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: { id: ticketId, authorId },
        select: { id: true, status: true },
      });
      if (!ticket)
        throw new HttpError(404, "NOT_FOUND", "Ticket was not found");
      if (ticket.status !== "OPEN" && ticket.status !== "IN_PROGRESS") {
        throw new HttpError(
          409,
          "TICKET_NOT_REPLYABLE",
          "Only open or in-progress tickets accept author replies",
        );
      }
      const created = await tx.ticketMessage.create({
        data: { ticketId, senderUserId: actorUserId, content: input.content },
        select: {
          id: true,
          content: true,
          createdAt: true,
          editedAt: true,
          sender: { select: { name: true, role: true } },
        },
      });
      await tx.ticketAuditEvent.create({
        data: { ticketId, actorUserId, action: "AUTHOR_MESSAGE_CREATED" },
      });
      return message(created);
    });
  },
  async listAdmin(input) {
    const where = {
      ...(input.status ? { status: input.status } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.priority ? { priority: input.priority } : {}),
      ...(input.assignedAdminId
        ? { assignedAdminId: input.assignedAdminId }
        : {}),
      ...(input.createdFrom || input.createdTo
        ? {
            createdAt: {
              ...(input.createdFrom ? { gte: input.createdFrom } : {}),
              ...(input.createdTo ? { lte: input.createdTo } : {}),
            },
          }
        : {}),
    };
    const [tickets, total] = await prisma.$transaction([
      prisma.ticket.findMany({
        where,
        select: { ...authorTicketSelection, messages: false },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);
    return { tickets: tickets.map(authorTicket), total };
  },
  async getAdmin(ticketId) {
    const ticket = await ticketForAdmin(ticketId);
    return ticket ? adminTicket(ticket) : null;
  },
  async updateStatus(actorUserId, ticketId, status, version) {
    const current = await requiredAdminTicket(ticketId);
    if (!allowedTransitions[current.status as TicketStatus].has(status)) {
      throw new HttpError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Cannot change ${current.status} to ${status}`,
      );
    }
    const now = new Date();
    if (current.version !== version)
      throw new HttpError(
        409,
        "TICKET_VERSION_CONFLICT",
        "Ticket was changed by another administrator",
      );
    await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.updateMany({
        where: { id: ticketId, version },
        data: {
          status,
          version: { increment: 1 },
          resolvedAt:
            status === "RESOLVED"
              ? now
              : status === "CLOSED"
                ? current.resolvedAt
                : null,
          closedAt: status === "CLOSED" ? now : null,
        },
      });
      if (updated.count !== 1)
        throw new HttpError(
          409,
          "TICKET_VERSION_CONFLICT",
          "Ticket was changed by another administrator",
        );
      await tx.ticketAuditEvent.create({
        data: {
          ticketId,
          actorUserId,
          action: "STATUS_CHANGED",
          metadata: { from: current.status, to: status },
        },
      });
    });
    return adminTicket(await requiredAdminTicket(ticketId));
  },
  async updatePriority(actorUserId, ticketId, priority, version) {
    const current = await requiredAdminTicket(ticketId);
    if (current.version !== version)
      throw new HttpError(
        409,
        "TICKET_VERSION_CONFLICT",
        "Ticket was changed by another administrator",
      );
    await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.updateMany({
        where: { id: ticketId, version },
        data: {
          priority,
          priorityOverriddenAt: new Date(),
          version: { increment: 1 },
        },
      });
      if (updated.count !== 1)
        throw new HttpError(
          409,
          "TICKET_VERSION_CONFLICT",
          "Ticket was changed by another administrator",
        );
      await tx.ticketAuditEvent.create({
        data: {
          ticketId,
          actorUserId,
          action: "PRIORITY_CHANGED",
          metadata: { from: current.priority, to: priority },
        },
      });
    });
    return adminTicket(await requiredAdminTicket(ticketId));
  },
  async updateCategory(actorUserId, ticketId, category, version) {
    const current = await requiredAdminTicket(ticketId);
    if (current.version !== version)
      throw new HttpError(
        409,
        "TICKET_VERSION_CONFLICT",
        "Ticket was changed by another administrator",
      );
    await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.updateMany({
        where: { id: ticketId, version },
        data: {
          category,
          categoryOverriddenAt: new Date(),
          version: { increment: 1 },
        },
      });
      if (updated.count !== 1)
        throw new HttpError(
          409,
          "TICKET_VERSION_CONFLICT",
          "Ticket was changed by another administrator",
        );
      await tx.ticketAuditEvent.create({
        data: {
          ticketId,
          actorUserId,
          action: "CATEGORY_CHANGED",
          metadata: { from: current.category, to: category },
        },
      });
    });
    return adminTicket(await requiredAdminTicket(ticketId));
  },
  async updateAssignment(actorUserId, ticketId, assignedAdminId, version) {
    const current = await requiredAdminTicket(ticketId);
    if (assignedAdminId) {
      const admin = await prisma.user.findFirst({
        where: { id: assignedAdminId, role: "ADMIN" },
        select: { id: true },
      });
      if (!admin)
        throw new HttpError(
          422,
          "INVALID_ASSIGNEE",
          "Assignee must be an administrator",
        );
    }
    if (current.version !== version)
      throw new HttpError(
        409,
        "TICKET_VERSION_CONFLICT",
        "Ticket was changed by another administrator",
      );
    await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.updateMany({
        where: { id: ticketId, version },
        data: { assignedAdminId, version: { increment: 1 } },
      });
      if (updated.count !== 1)
        throw new HttpError(
          409,
          "TICKET_VERSION_CONFLICT",
          "Ticket was changed by another administrator",
        );
      await tx.ticketAuditEvent.create({
        data: {
          ticketId,
          actorUserId,
          action: "ASSIGNMENT_CHANGED",
          metadata: { from: current.assignedAdminId, to: assignedAdminId },
        },
      });
    });
    return adminTicket(await requiredAdminTicket(ticketId));
  },
  async addAdminMessage(actorUserId, ticketId, input) {
    return prisma.$transaction(async (tx) => {
      const exists = await tx.ticket.findUnique({
        where: { id: ticketId },
        select: { id: true },
      });
      if (!exists)
        throw new HttpError(404, "NOT_FOUND", "Ticket was not found");
      const created = await tx.ticketMessage.create({
        data: { ticketId, senderUserId: actorUserId, content: input.content },
        select: {
          id: true,
          content: true,
          createdAt: true,
          editedAt: true,
          sender: { select: { name: true, role: true } },
        },
      });
      await tx.ticketAuditEvent.create({
        data: { ticketId, actorUserId, action: "ADMIN_MESSAGE_CREATED" },
      });
      return message(created);
    });
  },
  async addInternalNote(actorUserId, ticketId, input) {
    return prisma.$transaction(async (tx) => {
      const exists = await tx.ticket.findUnique({
        where: { id: ticketId },
        select: { id: true },
      });
      if (!exists)
        throw new HttpError(404, "NOT_FOUND", "Ticket was not found");
      const note = await tx.ticketInternalNote.create({
        data: { ticketId, adminUserId: actorUserId, content: input.content },
      });
      await tx.ticketAuditEvent.create({
        data: { ticketId, actorUserId, action: "INTERNAL_NOTE_CREATED" },
      });
      return {
        id: note.id,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
      };
    });
  },
};
