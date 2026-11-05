import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "./errors.js";
import type { AuthorService } from "../modules/author/service.js";

export type VerifiedSession = {
  user: { id: string; role?: string | null | undefined };
};
export type SessionResolver = (
  headers: Headers,
) => Promise<VerifiedSession | null>;

export function requestHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (typeof value === "string") headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(", "));
  }
  return headers;
}

/** Requires a verified Better Auth session without assigning an application role. */
export function createRequireSession(
  getSession: SessionResolver,
): RequestHandler {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const session = await getSession(requestHeaders(request));
      if (!session) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required");
      }
      request.sessionIdentity = { userId: session.user.id };
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function createRequireAuthor(
  getSession: SessionResolver,
  authorService: AuthorService,
): RequestHandler {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const session = await getSession(requestHeaders(request));
      if (!session)
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required");
      const author = await authorService.findIdentity(session.user.id);
      if (!author) {
        throw new HttpError(
          403,
          "AUTHOR_NOT_LINKED",
          "No author profile is linked to this account",
        );
      }
      request.authorIdentity = author;
      next();
    } catch (error) {
      next(error);
    }
  };
}
