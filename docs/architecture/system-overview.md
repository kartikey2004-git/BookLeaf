# System overview

## Responsibilities and dependency direction

`apps/web` is the Next.js App Router presentation layer. It renders the neutral application shell, uses the shared Better Auth client seam, and calls the public API through a small fetch client. It does not access PostgreSQL directly.

`apps/api` is the Express HTTP boundary. Its lifecycle is security headers, CORS and body limits, request ID and structured logging, route handling, and centralized error/404 responses. It owns liveness/readiness, OpenAPI, the authentication integration seam, and reusable SSE transport.

`apps/worker` owns the Inngest serving endpoint and function registration. It remains independent of API process lifecycle.

Shared packages are lower-level dependencies: `validation` owns environment and primitives; `contracts` owns HTTP response schemas; `database` owns Prisma/PostgreSQL access; `auth` owns the shared Better Auth configuration; `config` owns TypeScript and ESLint presets; and `ui` is reserved for framework-compatible primitives when they exist. Applications may depend on packages, but packages do not depend on applications.

## Request and authentication flow

An API request receives a request ID, structured logger, security headers, CORS decision, and a 1 MB body limit before route dispatch. Routes return the shared success/error contract and route failures to one error handler. Protected routes must use the shared authentication adapter, validate the session server-side, then enforce resource-level authorization in the owning module.

The web client talks to Better Auth at the configured API origin and sends cookies with API requests. Better Auth uses the shared Prisma adapter and PostgreSQL. Origins and cookie security behavior are derived from validated environment variables; secrets never reach `NEXT_PUBLIC_*` variables.

## Data, jobs, and events

Prisma stores Better Auth identities plus Author, Book, Platform, and BookDistribution records. An optional unique `Author.userId` links one verified Better Auth User to one author business record. Application code imports the one shared Prisma client. Inngest functions use event names as versioned contracts, must make writes idempotent, and rely on durable Inngest steps instead of detached promises.

## Author resource authorization

The API verifies every author request with Better Auth server-side session lookup. It resolves `session.user.id` through `Author.userId`; the frontend never supplies an author ID. Unauthenticated requests return `401`; authenticated users without a link return `403 AUTHOR_NOT_LINKED`; unavailable books return `404`. Book queries include `authorId` in the database predicate, preventing cross-author access before serialization.

The User table has a minimal `AUTHOR` or `ADMIN` role field for future policy checks. Current author routes do not grant special admin access.

SSE endpoints set standard event-stream headers, issue monotonic per-connection event IDs, send heartbeats, observe disconnects, and clean up timers/listeners. `Last-Event-ID` is an extension seam; durable replay and multi-instance fan-out require a shared event transport once streams must cross API processes.
