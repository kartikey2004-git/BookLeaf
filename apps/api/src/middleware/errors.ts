import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  public constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const notFound: RequestHandler = (request, _response, next) => {
  next(
    new HttpError(
      404,
      "NOT_FOUND",
      `No route matches ${request.method} ${request.path}`,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
) => {
  const normalized =
    error instanceof ZodError
      ? new HttpError(
          400,
          "VALIDATION_ERROR",
          "Request validation failed",
          error.flatten(),
        )
      : error instanceof HttpError
        ? error
        : new HttpError(500, "INTERNAL_ERROR", "An unexpected error occurred");

  request.log?.error(
    { err: error, requestId: request.requestId, code: normalized.code },
    "request error",
  );

  // If headers are already committed (e.g. an SSE stream started writing
  // text/event-stream before the error occurred), we cannot send a JSON
  // error body. Log and return instead of crashing with
  // ERR_HTTP_HEADERS_SENT.
  if (response.headersSent) {
    return;
  }

  response.status(normalized.status).json({
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
    },
    requestId: request.requestId,
  });
};
