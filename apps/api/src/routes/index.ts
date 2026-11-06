import { Router } from "express";
import type { ApiEnvironment } from "../config/env.js";
import type { SessionResolver } from "../middleware/author-auth.js";
import { createDocumentationRouter } from "./docs.js";
import { createEventRouter } from "./events.js";
import { createHealthRouter } from "./health.js";

export function createApiRouter(
  environment: ApiEnvironment,
  getSession?: SessionResolver,
): Router {
  const router = Router();
  router.use(createHealthRouter(environment));
  router.use(createDocumentationRouter());
  if (getSession) router.use(createEventRouter(getSession));
  return router;
}
