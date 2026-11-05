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
      "res.headers.set-cookie",
    ],
    customSuccessMessage: (_request, response, _responseTime) =>
      `request completed (${response.statusCode})`,
    customErrorMessage: (_request, _response, error) =>
      `request failed: ${error.message}`,
  });
}
