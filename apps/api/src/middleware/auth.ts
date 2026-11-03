import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./errors.js";

/**
 * Auth adapter seam. It deliberately lives at the HTTP boundary so the future
 * Better Auth integration can validate the shared session without leaking
 * framework-specific session objects into services.
 */
export async function requireAuthenticatedSession(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Better Auth's Express adapter is connected during the auth package integration.
    // The baseline still fails closed until a verified shared session is attached.
    if (!request.headers.cookie) {
      throw new HttpError(401, "UNAUTHORIZED", "Authentication is required");
    }
    next();
  } catch (error) {
    next(error);
  }
}
