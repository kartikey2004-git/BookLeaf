import { Router } from "express";
import type { ApiEnvironment } from "../config/env.js";
import { createDocumentationRouter } from "./docs.js";
import { createEventRouter } from "./events.js";
import { createHealthRouter } from "./health.js";

export function createApiRouter(environment: ApiEnvironment): Router {
  const router = Router();
  router.use(createHealthRouter(environment));
  router.use(createDocumentationRouter());
  router.use(createEventRouter());
  return router;
}
