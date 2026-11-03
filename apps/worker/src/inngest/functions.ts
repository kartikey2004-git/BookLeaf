import { inngest } from "./client.js";

/** Infrastructure-only function proving registration, retries, and observability.
 * Product events must be added by their owning module, with idempotency keys. */
export const infrastructureHeartbeat = inngest.createFunction(
  { id: "infrastructure-heartbeat", retries: 2 },
  { event: "foundation/heartbeat.requested" },
  async ({ event, logger }) => {
    logger.info({ eventId: event.id }, "received infrastructure heartbeat");
    return { receivedAt: new Date().toISOString() };
  },
);

export const functions = [infrastructureHeartbeat];
