import { Router } from "express";
import { prisma } from "@repo/database";
import type { ApiEnvironment } from "../config/env.js";

export function createHealthRouter(environment: ApiEnvironment): Router {
  const router = Router();
  router.get("/health/live", (request, response) =>
    response.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
    }),
  );
  router.get("/health/ready", async (request, response) => {
    const timestamp = new Date().toISOString();
    if (!environment.READINESS_CHECK_DATABASE) {
      response.status(200).json({
        status: "ok",
        timestamp,
        requestId: request.requestId,
        dependencies: { database: "skipped" },
      });
      return;
    }
    try {
      await prisma.$queryRaw`SELECT 1`;
      response.status(200).json({
        status: "ok",
        timestamp,
        requestId: request.requestId,
        dependencies: { database: "ok" },
      });
    } catch {
      response.status(503).json({
        status: "unavailable",
        timestamp,
        requestId: request.requestId,
        dependencies: { database: "unavailable" },
      });
    }
  });
  return router;
}
