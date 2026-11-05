# Architecture Decisions

This record captures the key decisions behind BookLeaf's current application shape.

## AD-001: Keep delivery applications thin

The web, API, and worker applications own transport concerns: routing, request validation, authentication boundaries, and deployment entry points. Shared domain types, configuration, authentication helpers, database access, UI primitives, and AI orchestration live in packages.

This keeps cross-application behavior consistent without turning the applications into a single tightly coupled runtime.

## AD-002: Use Express for the API boundary

The API is an Express application composed through route and middleware modules. It serves REST endpoints, OpenAPI, health probes, and a small SSE stream.

The design intentionally avoids framework-specific domain code so handlers can be tested with the package-layer dependencies they use.

## AD-003: Keep Better Auth and product data in one Prisma schema

The database package owns the Prisma client, schema, migrations, seed data, and repository helpers. The schema includes both Better Auth storage models and BookLeaf product models such as authors, books, messages, AI jobs, and tickets.

One schema keeps relational integrity, migrations, and local development setup in one place.

## AD-004: Use Inngest for asynchronous AI work

AI generation is represented by durable job records and handled asynchronously by the worker. A scheduler recovers eligible work; each worker claim is atomic, and failed jobs have a bounded retry policy.

This avoids holding API requests open for model calls and gives operations a durable record of work state.

## AD-005: Use best-effort SSE without a broker

The API exposes an authenticated `/events` stream for lightweight connection feedback and heartbeats. Connections are capped per user and process and are closed after a bounded lifetime. Event identifiers are UUIDs, not replay cursors.

There is no broker, replay store, or cross-instance fanout. Clients must treat the stream as best effort and refetch authoritative data after reconnecting.

## AD-006: Keep observability structured and bounded

Request logs are structured JSON with a request identifier. API errors use a stable response shape; health endpoints separate liveness from readiness. Sensitive headers and payloads are not logged.

This provides useful operational signals without making logs an uncontrolled data store.
