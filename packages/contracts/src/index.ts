import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
});

export const readinessResponseSchema = z.object({
  status: z.enum(["ok", "unavailable"]),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
  dependencies: z.object({ database: z.enum(["ok", "unavailable"]) }),
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    requestId: z.string().uuid(),
  }),
});

export const HealthResponseSchema = healthResponseSchema;
export const ReadinessResponseSchema = readinessResponseSchema;
export const ApiErrorSchema = errorResponseSchema;

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
export type ApiError = z.infer<typeof errorResponseSchema>;
