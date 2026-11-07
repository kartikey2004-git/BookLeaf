import { pinoHttp } from "pino-http";
import type { ApiEnvironment } from "../config/env.js";

export function createLogger(
  level: ApiEnvironment["LOG_LEVEL"],
  environment: ApiEnvironment["NODE_ENV"],
) {
  return pinoHttp({
    level,
    base: { service: "bookleaf-api", environment },
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers.forwarded",
      "req.headers.cf-connecting-ip",
      "req.headers.true-client-ip",
      "req.headers.x-forwarded-for",
      "req.headers.x-vercel-forwarded-for",
      "req.headers.x-vercel-oidc-token",
      "req.headers.x-vercel-proxy-signature",
      "req.headers.x-vercel-proxy-signature-ts",
      "req.headers.x-vercel-proxied-for",
      "req.headers.x-vercel-sc-headers",
      "res.headers.set-cookie",
    ],
    customSuccessMessage: (_request, response, _responseTime) =>
      `request completed (${response.statusCode})`,
    customErrorMessage: (_request, _response, error) =>
      `request failed: ${error.message}`,
  });
}
