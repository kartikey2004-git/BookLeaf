import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "./errors.js";
import type { SessionResolver } from "./author-auth.js";

function requestHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (typeof value === "string") headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(", "));
  }
  return headers;
}

export function createRequireAdmin(
  getSession: SessionResolver,
): RequestHandler {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const session = await getSession(requestHeaders(request));
      if (!session) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required");
      }
      if (session.user.role !== "ADMIN") {
        throw new HttpError(
          403,
          "ADMIN_REQUIRED",
          "Administrator access is required",
        );
      }
      request.adminIdentity = { userId: session.user.id, role: "ADMIN" };
      next();
    } catch (error) {
      next(error);
    }
  };
}
