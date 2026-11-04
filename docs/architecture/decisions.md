# Architecture decisions

## AD-001: pnpm workspaces and Turborepo

The baseline uses pnpm workspace protocols for local packages and Turbo for dependency-aware tasks. This keeps application ownership explicit while avoiding a premature deployment topology.

## AD-002: Express remains the API boundary

Next.js renders the frontend; Express owns REST, auth-facing API integration, OpenAPI, health, and SSE. This prevents backend concerns from leaking into route handlers.

## AD-003: Prisma 7 adapter-based PostgreSQL client

The database package uses the generated Prisma client with the PostgreSQL adapter and an environment-provided connection string. A process-local singleton prevents connection proliferation during development. Schema contains only Better Auth’s required storage models.

## AD-004: Better Auth is centralized

Server configuration belongs in `@repo/auth`; the web app imports only its client factory. Authentication is distinct from authorization: future protected resource modules must perform ownership/permission checks after session validation.

## AD-005: No broker in the first SSE iteration

The baseline provides correct single-process connection handling without Redis. A shared broker becomes necessary when events originate in another process or clients require replay/fan-out across multiple API replicas.

## AD-006: BookLeaf aggregate data is normalized without a royalty ledger

Authors and Books retain their source external identifiers. Platforms are normalized and connected through a composite-key distribution table. Current royalty figures are stored as decimal aggregates because the supplied dataset has no payout events or statements. Better Auth Users remain separate from Author records; a nullable one-to-one link supports safe account provisioning later without creating credentials during data import.
