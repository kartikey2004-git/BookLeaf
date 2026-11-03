import type { Request, Response } from "express";

export type ServerEvent<T> = { id: string; event: string; data: T };

export function initializeEventStream(
  request: Request,
  response: Response,
): () => void {
  response.status(200).set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  response.flushHeaders();

  const heartbeat = setInterval(
    () => response.write(`: heartbeat ${Date.now()}\n\n`),
    25_000,
  );
  const cleanup = () => clearInterval(heartbeat);
  request.on("close", cleanup);
  return cleanup;
}

export function writeEvent<T>(response: Response, event: ServerEvent<T>): void {
  response.write(
    `id: ${event.id}\nevent: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`,
  );
}
