---
name: sse-implementation
description: Implement or review authenticated Server-Sent Events streams with durable reconnection behavior.
---

# SSE implementation

## Purpose

Build reliable one-way event streams for the Express API described by this engineering environment, without leaking data or exhausting connections.

## Activation conditions

Use for `text/event-stream`, EventSource clients, streamed notifications/progress, reconnect behavior, heartbeats, or stream infrastructure. The current repository has no source or dependency manifest; find the actual Express/API package before making assumptions about a route location or adapter.

## Required repository context

Locate the API server/route module, authentication middleware, authorization service, proxy/deployment configuration, event producer/broker, logging, shutdown lifecycle, and tests. Determine whether deployment has one process or multiple replicas; in-memory fan-out is invalid for cross-instance delivery.

## Engineering rules

- Authenticate before opening the stream and authorize the precise tenant/resource subscription; never trust an ID from the query string alone.
- Set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, and connection/proxy-safe headers using the existing server conventions; flush headers when the runtime supports it.
- Use named event types and monotonic, opaque event IDs. Honor `Last-Event-ID` only after validating stream ownership.
- Persist or broker resumable events when delivery across restarts/replicas matters. Clearly state best-effort semantics when it does not.
- Send bounded periodic heartbeat comments to keep intermediaries alive, and clean up timers, listeners, and subscriptions on `req`/response close and server shutdown.
- Apply per-user/tenant connection limits and backpressure policy. Do not let slow clients retain unlimited queued data.
- Serialize only validated, minimal payloads; do not stream secrets, authorization state, stack traces, or data from other tenants.
- Keep HTTP request/error behavior separate from post-open stream errors: send an event where possible, log safely, then close when recovery is impossible.

## Implementation workflow

1. Define the stream's audience, authorization rule, event schema, delivery guarantee, retention/replay window, and limits.
2. Reuse existing auth middleware and validate resource access before response headers are sent.
3. Implement headers, initial/replay events, listener registration, heartbeat, and close cleanup as one lifecycle unit.
4. Connect production streams to a shared broker/store when multi-instance deployment is possible; do not use a process-local `EventEmitter` as a distributed solution.
5. Document reverse-proxy buffering/timeouts and configure only the project-controlled layer.
6. Add unit/integration tests with a real HTTP client that observes chunks and closes connections.
7. Test through the local proxy/deployment path when configuration exists.

## Common failure scenarios

- Events silently buffer behind a proxy because flushing or buffering configuration is absent.
- Listeners/timers survive disconnected clients and cause memory or connection leaks.
- Reconnects replay someone else's event history or lose all ordering semantics.
- A load balancer routes reconnects to another instance while state lives in memory.
- Token expiry is ignored for long-lived connections.
- Unbounded writes/backpressure turn a slow consumer into a memory leak.

## Validation requirements

Verify response headers, event framing, named events, IDs, heartbeat behavior, reconnect with `Last-Event-ID`, authorization rejection, cross-tenant denial, disconnect cleanup, and graceful shutdown. Include a multi-instance/broker test or explicitly document why the stream is single-instance/best-effort. Run the owning package's typecheck and integration tests.

## Relevant documentation references

- The EventSource and SSE HTTP specifications.
- The installed Express/runtime version, local proxy config, and repository auth middleware.
- The repository's event contract and deployment configuration once available.
