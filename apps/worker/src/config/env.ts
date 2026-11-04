import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const schema = z.object({
  INNGEST_APP_ID: z.string().min(1).default("foundation-worker"),
  INNGEST_EVENT_KEY: optionalNonEmptyString,
  INNGEST_SIGNING_KEY: optionalNonEmptyString,
});

export function getWorkerEnvironment(source: NodeJS.ProcessEnv = process.env) {
  return schema.parse(source);
}
