import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp, type AuthorRouteDependencies } from "./app.js";
import type { AuthorBook, AuthorService } from "./modules/author/service.js";

const authorOneBook: AuthorBook = {
  id: "BK001",
  title: "Whispers of the Ganges",
  isbn: "978-93-5XXXX-01-1",
  genre: "Literary Fiction",
  publicationDate: "2023-06-20",
  status: "Published & Live",
  mrp: "399.00",
  royaltyPerCopy: "35.00",
  totalCopiesSold: 342,
  totalRoyaltyEarned: "11970.00",
  royaltyPaid: "8400.00",
  royaltyPending: "3570.00",
  lastRoyaltyPayoutDate: "2025-10-15",
  printPartner: "In-House",
  platforms: ["Amazon India", "BookLeaf Store", "Flipkart"],
};

const authorService: AuthorService = {
  findIdentity: async (userId) =>
    userId === "user-1"
      ? { id: "author-1", externalId: "AUTH001", userId }
      : null,
  getProfile: async (authorId) =>
    authorId === "author-1"
      ? {
          externalId: "AUTH001",
          name: "Priya Sharma",
          email: "priya.sharma@email.com",
          phone: "+91-98765-43210",
          city: "Mumbai",
          joinedDate: "2023-03-15",
        }
      : null,
  listBooks: async (authorId, page, _pageSize) =>
    authorId === "author-1"
      ? { books: page === 1 ? [authorOneBook] : [], total: 1 }
      : { books: [], total: 0 },
  getBook: async (authorId, bookId) =>
    authorId === "author-1" && bookId === "BK001" ? authorOneBook : null,
  getOverview: async () => ({
    totalBooks: 2,
    publishedBooks: 2,
    booksInProduction: 0,
    totalCopiesSold: 531,
    totalRoyaltyEarned: "19908.00",
    totalRoyaltyPaid: "16338.00",
    totalRoyaltyPending: "3570.00",
  }),
};

const authorDependencies: AuthorRouteDependencies = {
  getSession: async (headers) =>
    headers.get("cookie") === "session=user-1"
      ? { user: { id: "user-1" } }
      : null,
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
  },
  undefined,
  authorDependencies,
);

describe("author resource API", () => {
  it("rejects a missing or invalid session", async () => {
    expect((await request(app).get("/api/v1/author/me")).status).toBe(401);
    expect(
      (
        await request(app)
          .get("/api/v1/author/me")
          .set("Cookie", "session=invalid")
      ).status,
    ).toBe(401);
  });

  it("rejects an authenticated account without an Author link", async () => {
    const unlinkedApp = createApp(
      {
        NODE_ENV: "test",
        API_HOST: "127.0.0.1",
        API_PORT: 4000,
        WEB_ORIGIN: "http://localhost:3000",
        LOG_LEVEL: "silent",
        READINESS_CHECK_DATABASE: false,
      },
      undefined,
      {
        ...authorDependencies,
        getSession: async () => ({ user: { id: "unlinked" } }),
      },
    );
    const response = await request(unlinkedApp).get("/api/v1/author/me");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("AUTHOR_NOT_LINKED");
  });

  it("returns only the authenticated author's profile and books", async () => {
    const profile = await request(app)
      .get("/api/v1/author/me")
      .set("Cookie", "session=user-1");
    const books = await request(app)
      .get("/api/v1/author/books?page=1&pageSize=1")
      .set("Cookie", "session=user-1");
    expect(profile.body.author.externalId).toBe("AUTH001");
    expect(books.body).toMatchObject({
      pagination: { page: 1, pageSize: 1, total: 1 },
      books: [{ id: "BK001" }],
    });
  });

  it("returns 404 for another author's or unknown book", async () => {
    const otherAuthorBook = await request(app)
      .get("/api/v1/author/books/BK002")
      .set("Cookie", "session=user-1");
    const unknownBook = await request(app)
      .get("/api/v1/author/books/BK999")
      .set("Cookie", "session=user-1");
    expect(otherAuthorBook.status).toBe(404);
    expect(unknownBook.status).toBe(404);
  });

  it("validates pagination and returns the author overview", async () => {
    const invalid = await request(app)
      .get("/api/v1/author/books?page=0")
      .set("Cookie", "session=user-1");
    const overview = await request(app)
      .get("/api/v1/author/overview")
      .set("Cookie", "session=user-1");
    expect(invalid.status).toBe(400);
    expect(overview.body.overview).toMatchObject({
      totalBooks: 2,
      totalCopiesSold: 531,
      totalRoyaltyPending: "3570.00",
    });
  });
});
