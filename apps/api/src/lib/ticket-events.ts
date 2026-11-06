import type { PoolClient } from "pg";
import type { Response } from "express";
import { eventBusPool } from "@repo/database";

export const TICKET_EVENTS_CHANNEL = "ticket_events";

export type TicketChangeReason =
  | "ticket-created"
  | "admin-message"
  | "author-message"
  | "status-changed"
  | "priority-changed"
  | "category-changed"
  | "assignment-changed"
  | "internal-note-added"
  | "attachment-added";

export type AuthorTicketEvent = {
  ticketId: string;
  reference: string;
  reason: TicketChangeReason;
};

export type TicketStreamSubscription = {
  authorId: string;
  response: Response;
  lastEventId: number;
  client: PoolClient | null;
};

const subscriptionsByAuthor = new Map<string, Set<TicketStreamSubscription>>();

function writeTicketEvent(
  response: Response,
  event: AuthorTicketEvent & { id: number },
): void {
  if (response.destroyed || response.writableEnded) return;
  response.write(
    `id: ${event.id}\nevent: ticket.updated\ndata: ${JSON.stringify({
      ticketId: event.ticketId,
      reference: event.reference,
      reason: event.reason,
    })}\n\n`,
  );
}

async function attachListener(
  subscription: TicketStreamSubscription,
): Promise<void> {
  const client = await eventBusPool.connect();
  subscription.client = client;
  client.on("notification", (notification) => {
    if (notification.channel !== TICKET_EVENTS_CHANNEL) return;
    try {
      const payload = JSON.parse(
        notification.payload ?? "{}",
      ) as AuthorTicketEvent & {
        id: number;
      };
      writeTicketEvent(subscription.response, payload);
    } catch {}
  });
  await client.query(`LISTEN ${TICKET_EVENTS_CHANNEL}`);
}

async function detachListener(
  subscription: TicketStreamSubscription,
): Promise<void> {
  const client = subscription.client;
  subscription.client = null;
  if (!client) return;
  client.removeAllListeners("notification");
  try {
    await client.query(`UNLISTEN ${TICKET_EVENTS_CHANNEL}`);
  } catch {}
  client.release();
}

export async function subscribeAuthorTicketEvents(
  authorId: string,
  response: Response,
  lastEventId: number,
): Promise<() => void> {
  const existing = subscriptionsByAuthor.get(authorId);
  const subscriptions = existing ?? new Set<TicketStreamSubscription>();
  subscriptionsByAuthor.set(authorId, subscriptions);

  const replay = await eventBusPool.query(
    `SELECT "id", "ticketId", "reference", "reason" FROM "TicketEvent" WHERE "authorId" = $1 AND "id" > $2 ORDER BY "id" ASC`,
    [authorId, lastEventId],
  );
  for (const row of replay.rows) {
    writeTicketEvent(response, {
      id: Number(row.id),
      ticketId: String(row.ticketId),
      reference: String(row.reference),
      reason: String(row.reason) as AuthorTicketEvent["reason"],
    });
  }

  const subscription: TicketStreamSubscription = {
    authorId,
    response,
    lastEventId,
    client: null,
  };
  subscriptions.add(subscription);
  await attachListener(subscription);

  const unsubscribe = async (): Promise<void> => {
    const current = subscriptionsByAuthor.get(authorId);
    if (current) {
      current.delete(subscription);
      if (current.size === 0) subscriptionsByAuthor.delete(authorId);
    }
    await detachListener(subscription);
  };
  const done = () => {
    void unsubscribe();
  };
  response.on("close", done);
  return done;
}

export async function publishAuthorTicketEvent(
  authorId: string,
  event: AuthorTicketEvent,
): Promise<void> {
  const result = await eventBusPool.query(
    `INSERT INTO "TicketEvent" ("authorId", "ticketId", "reference", "reason") VALUES ($1, $2, $3, $4) RETURNING "id"`,
    [authorId, event.ticketId, event.reference, event.reason],
  );
  const id = Number(result.rows[0].id);
  const payload = JSON.stringify({ ...event, id });
  const client = await eventBusPool.connect();
  await client.query(`NOTIFY ${TICKET_EVENTS_CHANNEL}, '${payload}'`);
  client.release();
}
