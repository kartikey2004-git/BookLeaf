import { Router } from "express";
import type { ApiEnvironment } from "../config/env.js";

export function createHealthRouter(environment: ApiEnvironment): Router {
  const router = Router();
  router.get("/health/live", (_request, response) =>
    response.status(200).json({ status: "ok" }),
  );
  router.get("/health/ready", async (_request, response) => {
    response.status(200).json({
      status: "ok",
      checks: {
        database: environment.READINESS_CHECK_DATABASE
          ? "not-configured"
          : "skipped",
      },
    });
  });
  return router;
}
