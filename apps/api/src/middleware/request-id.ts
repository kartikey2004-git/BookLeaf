import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export type RequestId = string & { readonly __brand: "RequestId" };

export function requestId(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const supplied = request.header("x-request-id");
  request.requestId = (
    supplied && /^[a-zA-Z0-9._-]{1,128}$/.test(supplied)
      ? supplied
      : randomUUID()
  ) as RequestId;
  response.setHeader("x-request-id", request.requestId);
  next();
}
