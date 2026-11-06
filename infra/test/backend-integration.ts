import "./integration-env.js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import request from "supertest";
import { prisma } from "@repo/database";
import { auth, getVerifiedSession } from "@repo/auth";
import { toNodeHandler } from "better-auth/node";
import { createApp } from "../../apps/api/src/app.js";
import { prismaTicketService } from "../../apps/api/src/modules/ticket/service.js";
import { claimTicketForAi } from "../../packages/jobs/src/inngest/functions.js";

const databaseUrl = process.env.DATABASE_URL ?? "";
const database = new URL(databaseUrl);
if (
  !["127.0.0.1", "localhost"].includes(database.hostname) ||
  database.pathname !== "/bookleaf_integration"
) {
  throw new Error(
    "Integration tests require the dedicated local integration database.",
  );
}

const suffix = randomUUID().slice(0, 8);
const email = `integration-${suffix}@example.test`;
const password = "integration-test-password";
const api = createApp(undefined, toNodeHandler(auth) as never, {
  getSession: getVerifiedSession,
  authorService: {
    findIdentity: async (userId: string) => {
      const author = await prisma.author.findUnique({
        where: { userId },
        select: { id: true, externalId: true, userId: true },
      });
      return author?.userId ? { ...author, userId: author.userId } : null;
    },
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
  },
});

test("Better Auth, PostgreSQL transactions, and AI claim races use real local infrastructure", async () => {
  const anonymous = await request(api).get("/api/v1/author/me");
  assert.equal(anonymous.status, 401);

  const agent = request.agent(api);
  const signup = await agent
    .post("/api/auth/sign-up/email")
    .set("Origin", "http://localhost:3000")
    .send({ name: "Integration Author", email, password });
  assert.equal(signup.status, 200);
  const userId = signup.body.user.id as string;
  assert.ok(userId);

  await prisma.author.create({
    data: {
      externalId: `AUTH-${suffix}`,
      name: "Integration Author",
      email,
      phone: "+1-555-0100",
      city: "Test City",
      joinedDate: new Date("2026-01-01"),
      userId,
    },
  });
  assert.equal((await agent.get("/api/auth/get-session")).status, 200);
  assert.equal((await agent.get("/api/v1/author/me")).status, 404);

  const rejectedOrigin = await request(api)
    .post("/api/v1/author/tickets")
    .set("Origin", "https://untrusted.example");
  assert.equal(rejectedOrigin.status, 403);

  const rollbackKey = `rollback-${suffix}`;
  await assert.rejects(
    prisma.$transaction(async (tx) => {
      await tx.platform.create({ data: { name: rollbackKey } });
      throw new Error("rollback");
    }),
  );
  assert.equal(
    await prisma.platform.count({ where: { name: rollbackKey } }),
    0,
  );

  const author = await prisma.author.findUniqueOrThrow({ where: { userId } });
  const admin = await prisma.user.create({
    data: {
      id: `admin-${suffix}`,
      name: "Integration Admin",
      email: `admin-${suffix}@example.test`,
      role: "ADMIN",
    },
  });
  const ticket = await prisma.ticket.create({
    data: {
      reference: `BL-${suffix}`,
      authorId: author.id,
      subject: "Integration ticket",
      description: "Testing transaction integrity.",
    },
  });
  const updates = await Promise.allSettled([
    prismaTicketService.updatePriority(admin.id, ticket.id, "HIGH", 0),
    prismaTicketService.updatePriority(admin.id, ticket.id, "LOW", 0),
  ]);
  assert.equal(
    updates.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    updates.filter((result) => result.status === "rejected").length,
    1,
  );

  const claimResults = await Promise.all([
    claimTicketForAi(ticket.id),
    claimTicketForAi(ticket.id),
  ]);
  assert.deepEqual(claimResults.sort(), [false, true]);

  const signout = await agent.post("/api/auth/sign-out").send({});
  assert.equal(signout.status, 200);
  assert.equal((await agent.get("/api/v1/author/me")).status, 401);
});

test.after(async () => {
  await prisma.$disconnect();
});
