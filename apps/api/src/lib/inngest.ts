import { Inngest } from "inngest";
import type { ApiEnvironment } from "../config/env.js";

export type TicketCreatedEvent = {
  name: "bookleaf/ticket.created";
  data: { ticketId: string };
};

export function createInngestClient(environment: ApiEnvironment) {
  return new Inngest({
    id: "bookleaf-api",
    ...(environment.INNGEST_EVENT_KEY
      ? { eventKey: environment.INNGEST_EVENT_KEY }
      : {}),
  });
}

export async function publishTicketCreated(
  client: Inngest,
  ticketId: string,
): Promise<void> {
  await client.send({ name: "bookleaf/ticket.created", data: { ticketId } });
}
