# System overview

## Responsibilities and dependency direction

`apps/web` is the Next.js App Router presentation layer. It renders the marketing pages and protected author/admin portal, uses the shared Better Auth client seam, and calls the API through a small fetch client. It does not access PostgreSQL directly.

`apps/api` is the Express HTTP boundary. Its lifecycle is security headers, CORS and body limits, request ID and structured logging, route handling, and centralized error/404 responses. It owns liveness/readiness, OpenAPI, the authentication integration seam, and reusable SSE transport.

`packages/jobs` owns Inngest client configuration and durable function definitions. `apps/web` can expose the same functions through a Next.js serverless endpoint at `/api/inngest`. Deploy only one serving endpoint for each Inngest environment.

Shared packages are lower-level dependencies: `validation` owns environment and primitives; `contracts` owns HTTP response schemas; `database` owns Prisma/PostgreSQL access; `auth` owns the shared Better Auth configuration; `config` owns TypeScript and ESLint presets; and `ui` is reserved for framework-compatible primitives when they exist. Applications may depend on packages, but packages do not depend on applications.

## Request and authentication flow

An API request receives a request ID, structured logger, security headers, CORS decision, unsafe-origin check, and a 1 MB body limit before route dispatch. Routes return a consistent error envelope and route failures to one error handler. Protected routes validate the Better Auth session server-side, then enforce resource-level authorization in the owning module.

The web client talks to Better Auth at the configured API origin and sends cookies with API requests. Better Auth uses the shared Prisma adapter and PostgreSQL. Origins and cookie security behavior are derived from validated environment variables; secrets never reach `NEXT_PUBLIC_*` variables.

## Data, jobs, and events

Prisma stores Better Auth identities plus Author, Book, Platform, ticket, and ticket-AI records. An optional unique `Author.userId` links one verified Better Auth User to one author business record. Application code imports one shared Prisma client. Inngest functions use versioned event names, atomic database claims, bounded retries, and a recovery sweep; they do not rely on detached HTTP promises.

## Author resource authorization

The API verifies every author request with Better Auth server-side session lookup. It resolves `session.user.id` through `Author.userId`; the frontend never supplies an author ID. Unauthenticated requests return `401`; authenticated users without a link return `403 AUTHOR_NOT_LINKED`; unavailable books return `404`. Book queries include `authorId` in the database predicate, preventing cross-author access before serialization.

The User table has a minimal `AUTHOR` or `ADMIN` role field for future policy checks. Current author routes do not grant special admin access.

## AI intelligence

The server-only `@repo/ai` package uses Google's official `@google/genai` SDK with configurable Gemini model and timeout. It validates all JSON through Zod, treats ticket text as untrusted input, and includes selected sections from the canonical knowledge base. Ticket-created events invoke the Inngest worker, which writes only `aiSuggested*` fields and processing metadata. A bounded ten-minute recovery sweep picks up `PENDING` or retryable `FAILED` work. The worker uses a conditional database update to claim a ticket once and caps attempts at five. It never updates administrator-owned category or priority fields, so retries cannot overwrite a manual decision. Draft generation is an authenticated admin API action and cannot create a public message.

## Ticket operations

Tickets belong to one Author and may link to one of that author's Books. `TicketMessage` stores public author/support conversation. `TicketInternalNote` is administrator-only and never selected by author routes. `TicketAuditEvent` records actor, action, timestamp, and minimal change metadata for creates, updates, messages, and notes.

Ticket states are `OPEN`, `IN_PROGRESS`, `RESOLVED`, and `CLOSED`. `OPEN` may move to `IN_PROGRESS`, `RESOLVED`, or `CLOSED`; `IN_PROGRESS` may move to `OPEN`, `RESOLVED`, or `CLOSED`; `RESOLVED` may reopen only to `IN_PROGRESS` or close; `CLOSED` is terminal. Authors can reply only while tickets are `OPEN` or `IN_PROGRESS`.

Author ticket reads and writes include `authorId` at the database boundary. Admin routes require the verified Better Auth `ADMIN` role. Administrator changes require the current integer `version`; compare-and-update prevents silent concurrent overwrites. State changes and their audit events, assignments and their audit events, and messages/notes and their audit events are committed in one transaction.

SSE endpoints require a verified session, set standard event-stream headers, issue UUID event IDs, send heartbeats, observe disconnects, and clean up timers/listeners. Streams are capped globally and per user and end after 15 minutes. Delivery is best-effort: there is no replay from `Last-Event-ID` and no multi-instance fan-out without a shared event transport.
