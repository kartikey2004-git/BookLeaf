import type { RequestHandler } from "express";
import { HttpError } from "./errors.js";

type RateLimitOptions = {
  max: number;
  windowMs: number;
  key: (request: Parameters<RequestHandler>[0]) => string;
};

type RateLimitEntry = { count: number; resetAt: number };

export function createFixedWindowRateLimit({
  max,
  windowMs,
  key,
}: RateLimitOptions): RequestHandler {
  const entries = new Map<string, RateLimitEntry>();
  return (request, response, next) => {
    const now = Date.now();
    if (entries.size >= 10_000) {
      for (const [entryKey, entry] of entries) {
        if (entry.resetAt <= now) entries.delete(entryKey);
      }
      if (entries.size >= 10_000 && !entries.has(key(request))) {
        next(new HttpError(429, "RATE_LIMITED", "Too many requests"));
        return;
      }
    }
    const requestKey = key(request);
    const current = entries.get(requestKey);
    const entry =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current;
    entry.count += 1;
    entries.set(requestKey, entry);
    response.set("RateLimit-Limit", String(max));
    response.set("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    response.set("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
    if (entry.count > max) {
      response.set(
        "Retry-After",
        String(Math.ceil((entry.resetAt - now) / 1000)),
      );
      next(new HttpError(429, "RATE_LIMITED", "Too many requests"));
      return;
    }
    next();
  };
}
