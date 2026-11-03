import { randomUUID } from "node:crypto";
import { Router } from "express";
import { initializeEventStream, writeEvent } from "../lib/sse.js";

export function createEventRouter(): Router {
  const router = Router();
  router.get("/events", (request, response) => {
    const cleanup = initializeEventStream(request, response);
    writeEvent(response, {
      id: request.header("last-event-id") ?? randomUUID(),
      event: "connected",
      data: { requestId: request.requestId },
    });
    request.once("close", cleanup);
  });
  return router;
}
