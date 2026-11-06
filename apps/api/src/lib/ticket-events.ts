import type { Response } from "express";

export type TicketChangeReason =
  | "ticket-created"
  | "admin-message"
  | "author-message"
  | "status-changed"
  | "priority-changed"
  | "category-changed"
  | "assignment-changed"
  | "internal-note-added";

export type AuthorTicketEvent = {
  ticketId: string;
  reference: string;
  reason: TicketChangeReason;
};

const MAX_SUBSCRIBERS_PER_AUTHOR = 5;
const subscribers = new Map<string, Set<Response>>();

export function subscribeAuthorTicketEvents(
  authorId: string,
  response: Response,
): () => void {
  let authorStreams = subscribers.get(authorId);
  if (!authorStreams) {
    authorStreams = new Set();
    subscribers.set(authorId, authorStreams);
  }
  if (authorStreams.size >= MAX_SUBSCRIBERS_PER_AUTHOR) {
    const oldest = authorStreams.values().next().value;
    if (oldest) {
      authorStreams.delete(oldest);
      if (!oldest.destroyed && !oldest.writableEnded) oldest.end();
    }
  }
  authorStreams.add(response);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const current = subscribers.get(authorId);
    if (!current) return;
    current.delete(response);
    if (current.size === 0) subscribers.delete(authorId);
  };
}

export function publishAuthorTicketEvent(
  authorId: string,
  event: AuthorTicketEvent,
): void {
  const authorStreams = subscribers.get(authorId);
  if (!authorStreams || authorStreams.size === 0) return;
  const frame = `event: ticket.updated\ndata: ${JSON.stringify(event)}\n\n`;
  for (const response of [...authorStreams]) {
    if (response.destroyed || response.writableEnded) {
      authorStreams.delete(response);
      continue;
    }
    try {
      response.write(frame);
    } catch {
      authorStreams.delete(response);
    }
  }
}
