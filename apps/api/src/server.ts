import { createServer } from "node:http";
import { auth, getVerifiedSession } from "@repo/auth";
import { toNodeHandler } from "better-auth/node";
import { createApp } from "./app.js";
import { getEnvironment } from "./config/env.js";
import { prismaAuthorService } from "./modules/author/service.js";
import { prismaTicketService } from "./modules/ticket/service.js";

const environment = getEnvironment();
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
  ),
);

server.listen(environment.API_PORT, environment.API_HOST, () => {
  console.info(
    `API listening on http://${environment.API_HOST}:${environment.API_PORT}`,
  );
});

function shutdown(signal: NodeJS.Signals): void {
  console.info(`${signal} received; shutting down API`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
    process.exit();
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
