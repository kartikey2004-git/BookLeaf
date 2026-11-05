import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

async function loadHandlers() {
  const [{ serve }, { functions, inngest }] = await Promise.all([
    import("inngest/next"),
    import("@repo/jobs"),
  ]);
  return serve({ client: inngest, functions });
}

let handlers: ReturnType<typeof loadHandlers> | undefined;

function getHandlers() {
  handlers ??= loadHandlers();
  return handlers;
}

async function handle(
  method: "GET" | "POST" | "PUT",
  request: NextRequest,
  context: unknown,
) {
  const routeHandlers = await getHandlers();
  return routeHandlers[method](request, context);
}

export const GET = (request: NextRequest, context: unknown) =>
  handle("GET", request, context);
export const POST = (request: NextRequest, context: unknown) =>
  handle("POST", request, context);
export const PUT = (request: NextRequest, context: unknown) =>
  handle("PUT", request, context);
