import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { SessionResolver } from "../middleware/author-auth.js";
import { createRequireSession } from "../middleware/author-auth.js";
import { HttpError } from "../middleware/errors.js";
import {
  canOpenEventStream,
  initializeEventStream,
  writeEvent,
} from "../lib/sse.js";

export function createEventRouter(getSession: SessionResolver): Router {
  const router = Router();
  router.use("/events", createRequireSession(getSession));
  router.get("/events", (request, response) => {
    const userId = request.sessionIdentity!.userId;
    if (!canOpenEventStream(userId)) {
      throw new HttpError(
        429,
        "SSE_LIMIT_REACHED",
        "Too many active event streams",
      );
    }
    const cleanup = initializeEventStream(request, response, userId);
    writeEvent(response, {
      id: randomUUID(),
      event: "connected",
      data: {
        requestId: request.requestId,
        replay: "not-supported",
      },
    });
    request.once("close", cleanup);
  });
  return router;
}
