import type { Request, Response } from "express";

export type ServerEvent<T> = { id: string; event: string; data: T };

const MAX_STREAMS = 100;
const MAX_STREAMS_PER_USER = 3;
const MAX_STREAM_LIFETIME_MS = 15 * 60 * 1000;
let activeStreams = 0;
const streamsByUser = new Map<string, number>();

export function initializeEventStream(
  request: Request,
  response: Response,
  userId: string,
): () => void {
  const initialUserStreams = streamsByUser.get(userId) ?? 0;
  if (
    activeStreams >= MAX_STREAMS ||
    initialUserStreams >= MAX_STREAMS_PER_USER
  ) {
    return () => undefined;
  }
  activeStreams += 1;
  streamsByUser.set(userId, initialUserStreams + 1);
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
  const lifetime = setTimeout(() => response.end(), MAX_STREAM_LIFETIME_MS);
  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    clearInterval(heartbeat);
    clearTimeout(lifetime);
    activeStreams = Math.max(0, activeStreams - 1);
    const remainingUserStreams = Math.max(
      0,
      (streamsByUser.get(userId) ?? 1) - 1,
    );
    if (remainingUserStreams === 0) streamsByUser.delete(userId);
    else streamsByUser.set(userId, remainingUserStreams);
  };
  request.on("close", cleanup);
  return cleanup;
}

export function canOpenEventStream(userId: string): boolean {
  return (
    activeStreams < MAX_STREAMS &&
    (streamsByUser.get(userId) ?? 0) < MAX_STREAMS_PER_USER
  );
}

export function writeEvent<T>(response: Response, event: ServerEvent<T>): void {
  response.write(
    `id: ${event.id}\nevent: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`,
  );
}
