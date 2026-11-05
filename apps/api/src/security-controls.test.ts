import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp, type AuthorRouteDependencies } from "./app.js";
import { createFixedWindowRateLimit } from "./middleware/rate-limit.js";
import type { AuthorService } from "./modules/author/service.js";

const environment = {
  NODE_ENV: "test" as const,
  API_HOST: "127.0.0.1",
  API_PORT: 4000,
  WEB_ORIGIN: "http://localhost:3000",
  LOG_LEVEL: "silent" as const,
  READINESS_CHECK_DATABASE: false,
  GEMINI_MODEL: "gemini-2.5-flash",
  GEMINI_TIMEOUT_MS: 15_000,
};

describe("security controls", () => {
  it("denies SSE connections without a verified session", async () => {
    const dependencies: AuthorRouteDependencies = {
      getSession: async () => null,
      authorService: {} as AuthorService,
    };
    const app = createApp(environment, undefined, dependencies);

    const response = await request(app).get("/api/v1/events");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("enforces a fixed-window quota and communicates its limit", async () => {
    const app = express();
    app.use(
      createFixedWindowRateLimit({
        max: 2,
        windowMs: 60_000,
        key: () => "test-principal",
      }),
    );
    app.get("/limited", (_request, response) => response.status(204).end());
    app.use((error: unknown, _request, response, _next) =>
      response.status((error as { status?: number }).status ?? 500).json({
        error: { code: (error as { code?: string }).code },
      }),
    );

    expect((await request(app).get("/limited")).status).toBe(204);
    expect(
      (await request(app).get("/limited")).headers["ratelimit-limit"],
    ).toBe("2");
    const limited = await request(app).get("/limited");
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe("RATE_LIMITED");
    expect(limited.headers["retry-after"]).toBeTruthy();
  });

  it("rejects unsafe requests from an untrusted browser origin", async () => {
    const dependencies: AuthorRouteDependencies = {
      getSession: async () => ({ user: { id: "author" } }),
      authorService: {
        findIdentity: async () => ({
          id: "author-1",
          externalId: "AUTH001",
          userId: "author",
        }),
      } as AuthorService,
    };
    const app = createApp(environment, undefined, dependencies);

    const response = await request(app)
      .post("/api/v1/author/tickets")
      .set("Origin", "https://untrusted.example");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN_ORIGIN");
  });
});
