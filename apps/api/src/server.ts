import { createServer } from "node:http";
import { auth, getVerifiedSession, trustedOrigins } from "@repo/auth";
import { prisma } from "@repo/database";
import { functions, inngest } from "@repo/jobs";
import { toNodeHandler } from "better-auth/node";
import { serve } from "inngest/express";
import { createApp } from "./app.js";
import { getEnvironment } from "./config/env.js";
import { prismaAuthorService } from "./modules/author/service.js";
import { prismaTicketService } from "./modules/ticket/service.js";

const environment = getEnvironment();
const inngestHandler = environment.INNGEST_SIGNING_KEY
  ? serve({ client: inngest, functions })
  : undefined;
const corsOrigins = (environment.CORS_ORIGINS ?? environment.WEB_ORIGIN)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .sort();
const authOrigins = [...trustedOrigins].sort();

if (
  corsOrigins.length !== authOrigins.length ||
  corsOrigins.some((origin, index) => origin !== authOrigins[index])
) {
  throw new Error(
    "CORS origins must match BETTER_AUTH_TRUSTED_ORIGINS before starting the API.",
  );
}
const server = createServer(
  createApp(
    environment,
    toNodeHandler(auth) as never,
    {
      getSession: getVerifiedSession,
      authorService: prismaAuthorService,
    },
    {
      getSession: getVerifiedSession,
      authorService: prismaAuthorService,
      ticketService: prismaTicketService,
    },
    inngestHandler,
  ),
);

server.listen(environment.API_PORT, environment.API_HOST, () => {
  console.info(
    `API listening on http://${environment.API_HOST}:${environment.API_PORT}`,
  );
});

function shutdown(signal: NodeJS.Signals): void {
  console.info(`${signal} received; shutting down API`);
  server.close(async (error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
    process.exit();
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
