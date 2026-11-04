import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const app = createApp({
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 4000,
  WEB_ORIGIN: "http://localhost:3000",
  LOG_LEVEL: "silent",
  READINESS_CHECK_DATABASE: false,
  GEMINI_MODEL: "gemini-2.5-flash",
  GEMINI_TIMEOUT_MS: 15_000,
});

describe("API foundation", () => {
  it("serves liveness without infrastructure dependencies", async () => {
    const response = await request(app).get("/api/v1/health/live");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
  it("returns a structured error for missing routes", async () => {
    const response = await request(app).get("/api/v1/missing");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
    expect(response.headers["x-request-id"]).toBeTruthy();
  });
});
