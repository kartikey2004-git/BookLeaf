import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./errors.js";

export async function requireAuthenticatedSession(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!request.headers.cookie) {
      throw new HttpError(401, "UNAUTHORIZED", "Authentication is required");
    }
    next();
  } catch (error) {
    next(error);
  }
}
