import { serve } from "inngest/express";
import express from "express";
import { prisma } from "@repo/database";
import { inngest } from "./inngest/client.js";
import { functions } from "./inngest/functions.js";
import { getWorkerEnvironment } from "./config/env.js";

const app = express();
const environment = getWorkerEnvironment();
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
    ...(environment.INNGEST_SIGNING_KEY
      ? { signingKey: environment.INNGEST_SIGNING_KEY }
      : {}),
  }),
);

const port = Number(process.env.WORKER_PORT ?? 4001);
const server = app.listen(port, environment.WORKER_HOST, () =>
  console.info(
    `Worker Inngest endpoint listening on http://localhost:${port}/api/inngest`,
  ),
);

function shutdown(signal: NodeJS.Signals): void {
  console.info(`${signal} received; shutting down worker`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => shutdown(signal));
}
