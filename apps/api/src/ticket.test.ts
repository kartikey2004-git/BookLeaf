import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  createApp,
  type AuthorRouteDependencies,
  type TicketRouteDependencies,
} from "./app.js";
import { HttpError } from "./middleware/errors.js";
import type { AuthorService } from "./modules/author/service.js";
import type { TicketService } from "./modules/ticket/service.js";

const ticket = {
  id: "ticket-1",
  reference: "BL-2026-EXAMPLE",
  subject: "Royalty question",
  description: "When is my next payment?",
  category: "GENERAL_INQUIRY",
  priority: "MEDIUM",
  status: "OPEN",
  version: 0,
  book: null,
  createdAt: "2026-11-04T00:00:00.000Z",
  updatedAt: "2026-11-04T00:00:00.000Z",
  resolvedAt: null,
  closedAt: null,
  messages: [],
};

const authorService: AuthorService = {
  findIdentity: async (userId) =>
    userId === "author-user"
      ? { id: "author-1", externalId: "AUTH001", userId }
      : null,
  getProfile: async () => null,
  listBooks: async () => ({ books: [], total: 0 }),
  getBook: async () => null,
  getOverview: async () => ({
    totalBooks: 0,
    publishedBooks: 0,
    booksInProduction: 0,
    totalCopiesSold: 0,
    totalRoyaltyEarned: "0.00",
    totalRoyaltyPaid: "0.00",
    totalRoyaltyPending: "0.00",
  }),
};

const ticketService = {
  create: async (
    _authorId: string,
    _userId: string,
    input: { bookId?: string; subject: string; description: string },
  ) => {
    if (input.bookId === "BK003")
      throw new HttpError(404, "NOT_FOUND", "Book was not found");
    return {
      ...ticket,
      subject: input.subject,
      description: input.description,
    };
  },
  listAuthor: async () => ({ tickets: [ticket], total: 1 }),
  getAuthor: async (_authorId: string, ticketId: string) =>
    ticketId === "ticket-1" ? ticket : null,
  addAuthorMessage: async () => ({
    id: "message-1",
    content: "More detail",
    createdAt: "2026-11-04T00:00:00.000Z",
    editedAt: null,
    sender: { name: "Priya", role: "AUTHOR" },
  }),
  listAdmin: async () => ({ tickets: [ticket], total: 1 }),
  getAdmin: async (ticketId: string) =>
    ticketId === "ticket-1"
      ? {
          ...ticket,
          author: {
            externalId: "AUTH001",
            name: "Priya",
            email: "priya@example.com",
            city: "Mumbai",
          },
          assignedAdmin: null,
          internalNotes: [
            {
              id: "note-1",
              content: "Private",
              createdAt: "2026-11-04T00:00:00.000Z",
              admin: {
                id: "admin-user",
                name: "Admin",
                email: "admin@example.com",
              },
            },
          ],
          auditEvents: [],
        }
      : null,
  updateStatus: async () => ({ ...ticket, status: "IN_PROGRESS" }),
  updatePriority: async () => ({ ...ticket, priority: "HIGH" }),
  updateCategory: async () => ({ ...ticket, category: "ROYALTY_AND_PAYMENTS" }),
  updateAssignment: async () => ticket,
  addAdminMessage: async () => ({
    id: "message-2",
    content: "Support reply",
    createdAt: "2026-11-04T00:00:00.000Z",
    editedAt: null,
    sender: { name: "Admin", role: "ADMIN" },
  }),
  addInternalNote: async () => ({
    id: "note-2",
    content: "Private",
    createdAt: "2026-11-04T00:00:00.000Z",
  }),
} as unknown as TicketService;

const dependencies: AuthorRouteDependencies = {
  getSession: async (headers) => {
    if (headers.get("cookie") === "session=author")
      return { user: { id: "author-user", role: "AUTHOR" } };
    if (headers.get("cookie") === "session=admin")
      return { user: { id: "admin-user", role: "ADMIN" } };
    return null;
  },
  authorService,
};

const app = createApp(
  {
    NODE_ENV: "test",
    API_HOST: "127.0.0.1",
    API_PORT: 4000,
    WEB_ORIGIN: "http://localhost:3000",
    LOG_LEVEL: "silent",
    READINESS_CHECK_DATABASE: false,
    GEMINI_MODEL: "gemini-2.5-flash",
    GEMINI_TIMEOUT_MS: 15_000,
  },
  undefined,
  dependencies,
  { ...dependencies, ticketService } as TicketRouteDependencies,
);

describe("ticket HTTP APIs", () => {
  it("creates general and book tickets for the session author only", async () => {
    const created = await request(app)
      .post("/api/v1/author/tickets")
      .set("Cookie", "session=author")
      .send({
        subject: "Royalty question",
        description: "When is my next payment?",
      });
    const foreignBook = await request(app)
      .post("/api/v1/author/tickets")
      .set("Cookie", "session=author")
      .send({
        bookId: "BK003",
        subject: "Wrong book",
        description: "This is not mine",
      });
    expect(created.status).toBe(201);
    expect(foreignBook.status).toBe(404);
  });

  it("keeps author ticket access and public messages scoped", async () => {
    const list = await request(app)
      .get("/api/v1/author/tickets")
      .set("Cookie", "session=author");
    const detail = await request(app)
      .get("/api/v1/author/tickets/ticket-1")
      .set("Cookie", "session=author");
    const missing = await request(app)
      .get("/api/v1/author/tickets/other-ticket")
      .set("Cookie", "session=author");
    const reply = await request(app)
      .post("/api/v1/author/tickets/ticket-1/messages")
      .set("Cookie", "session=author")
      .send({ content: "More detail" });
    expect(list.body.pagination.total).toBe(1);
    expect(detail.body.ticket.internalNotes).toBeUndefined();
    expect(missing.status).toBe(404);
    expect(reply.status).toBe(201);
  });

  it("rejects missing sessions and non-admin ticket operations", async () => {
    expect((await request(app).get("/api/v1/author/tickets")).status).toBe(401);
    expect(
      (
        await request(app)
          .get("/api/v1/admin/tickets")
          .set("Cookie", "session=author")
      ).status,
    ).toBe(403);
  });

  it("allows an admin queue, ticket changes, and private notes", async () => {
    const queue = await request(app)
      .get("/api/v1/admin/tickets?priority=MEDIUM")
      .set("Cookie", "session=admin");
    const detail = await request(app)
      .get("/api/v1/admin/tickets/ticket-1")
      .set("Cookie", "session=admin");
    const status = await request(app)
      .patch("/api/v1/admin/tickets/ticket-1/status")
      .set("Cookie", "session=admin")
      .send({ status: "IN_PROGRESS", version: 0 });
    const note = await request(app)
      .post("/api/v1/admin/tickets/ticket-1/internal-notes")
      .set("Cookie", "session=admin")
      .send({ content: "Private" });
    expect(queue.status).toBe(200);
    expect(detail.body.ticket.internalNotes).toHaveLength(1);
    expect(status.status).toBe(200);
    expect(note.status).toBe(201);
  });

  it("protects AI drafts and never creates a public reply when AI is unavailable", async () => {
    const author = await request(app)
      .post("/api/v1/admin/tickets/ticket-1/ai-draft")
      .set("Cookie", "session=author");
    const admin = await request(app)
      .post("/api/v1/admin/tickets/ticket-1/ai-draft")
      .set("Cookie", "session=admin");
    expect(author.status).toBe(403);
    expect(admin.status).toBe(503);
    expect(admin.body.error.code).toBe("AI_UNAVAILABLE");
  });

  it("protects the streaming AI draft endpoint and validates configuration before streaming", async () => {
    const anonymous = await request(app).post(
      "/api/v1/admin/tickets/ticket-1/ai-draft/stream",
    );
    const author = await request(app)
      .post("/api/v1/admin/tickets/ticket-1/ai-draft/stream")
      .set("Cookie", "session=author");
    const admin = await request(app)
      .post("/api/v1/admin/tickets/ticket-1/ai-draft/stream")
      .set("Cookie", "session=admin");

    expect(anonymous.status).toBe(401);
    expect(author.status).toBe(403);
    expect(admin.status).toBe(503);
    expect(admin.headers["content-type"]).toContain("application/json");
    expect(admin.body.error.code).toBe("AI_UNAVAILABLE");
  });
});
