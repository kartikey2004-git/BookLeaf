import { z } from "zod";

const schema = z.object({
  INNGEST_APP_ID: z.string().min(1).default("foundation-worker"),
  INNGEST_EVENT_KEY: z.string().min(1).optional(),
  INNGEST_SIGNING_KEY: z.string().min(1).optional(),
});

export function getWorkerEnvironment(source: NodeJS.ProcessEnv = process.env) {
  return schema.parse(source);
}
