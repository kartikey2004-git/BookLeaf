import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const optionalNonEmptyString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  CORS_ORIGINS: z.string().optional(),
  INNGEST_EVENT_KEY: optionalNonEmptyString,
  INNGEST_SIGNING_KEY: optionalNonEmptyString,
  GEMINI_API_KEY: optionalNonEmptyString,
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  GEMINI_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(120000)
    .default(15000),
  READINESS_CHECK_DATABASE: booleanFromString.optional().default(false),
});

export type ApiEnvironment = z.infer<typeof environmentSchema>;

export function getEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): ApiEnvironment {
  return environmentSchema.parse(source);
}
