import { serve } from "inngest/express";
import express from "express";
import { inngest } from "./inngest/client.js";
import { functions } from "./inngest/functions.js";

const app = express();
app.use("/api/inngest", serve({ client: inngest, functions }));

const port = Number(process.env.WORKER_PORT ?? 4001);
const server = app.listen(port, () =>
  console.info(
    `Worker Inngest endpoint listening on http://localhost:${port}/api/inngest`,
  ),
);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
