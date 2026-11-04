import cors from "cors";
import express, { type Express, type RequestHandler } from "express";
import helmet from "helmet";
import { getEnvironment, type ApiEnvironment } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { requestId } from "./middleware/request-id.js";
import { logger } from "./lib/logger.js";
import { createApiRouter } from "./routes/index.js";
import { createAuthorRouter } from "./routes/author.js";
import type { SessionResolver } from "./middleware/author-auth.js";
import type { AuthorService } from "./modules/author/service.js";
import type { TicketService } from "./modules/ticket/service.js";
import { createTicketRouters } from "./routes/tickets.js";

export type AuthorRouteDependencies = {
  getSession: SessionResolver;
  authorService: AuthorService;
};

export type TicketRouteDependencies = AuthorRouteDependencies & {
  ticketService: TicketService;
};

export function createApp(
  environment: ApiEnvironment = getEnvironment(),
  authHandler?: RequestHandler,
  authorDependencies?: AuthorRouteDependencies,
  ticketDependencies?: TicketRouteDependencies,
): Express {
  const app = express();
  const allowedOrigins = new Set(
    (environment.CORS_ORIGINS ?? environment.WEB_ORIGIN)
      .split(",")
      .map((origin) => origin.trim()),
  );
  app.disable("x-powered-by");
  app.use(requestId);
  app.use(logger);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: (origin, callback) =>
        callback(null, !origin || allowedOrigins.has(origin)),
      credentials: true,
    }),
  );
  // Better Auth must receive its route before JSON parsing and application routes.
  if (authHandler) app.all("/api/auth/*splat", authHandler);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use("/api/v1", createApiRouter(environment));
  if (authorDependencies) {
    app.use(
      "/api/v1",
      createAuthorRouter(
        authorDependencies.getSession,
        authorDependencies.authorService,
      ),
    );
  }
  if (ticketDependencies) {
    const tickets = createTicketRouters(
      ticketDependencies.getSession,
      ticketDependencies.authorService,
      ticketDependencies.ticketService,
    );
    app.use("/api/v1", tickets.author);
    app.use("/api/v1", tickets.admin);
  }
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
