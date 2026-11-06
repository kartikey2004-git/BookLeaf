import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    WORKER_HOST: z.string().default("127.0.0.1"),
    WORKER_PORT: z.coerce.number().int().min(1).max(65535).default(4001),
    INNGEST_APP_ID: z.string().min(1).default("foundation-worker"),
    INNGEST_EVENT_KEY: optionalNonEmptyString,
    INNGEST_SIGNING_KEY: optionalNonEmptyString,
    GEMINI_API_KEY: optionalNonEmptyString,
    GEMINI_MODEL: z.string().min(1).default("gemini-3.6-flash"),
    GEMINI_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .max(120000)
      .default(60000),
  })
  .superRefine((environment, context) => {
    if (
      environment.NODE_ENV === "production" &&
      !environment.INNGEST_SIGNING_KEY
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["INNGEST_SIGNING_KEY"],
        message: "INNGEST_SIGNING_KEY is required in production",
      });
    }
  });

export function getWorkerEnvironment(source: NodeJS.ProcessEnv = process.env) {
  return schema.parse({
    ...source,
    WORKER_PORT: source.WORKER_PORT ?? source.PORT,
  });
}
