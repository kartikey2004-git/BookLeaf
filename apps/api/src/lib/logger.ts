import { pinoHttp } from "pino-http";

export const logger = pinoHttp({
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
