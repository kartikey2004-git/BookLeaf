# Local development

## Prerequisites

Use Node.js 22 or later, Docker Compose, and pnpm 10. The root package declares the exact pnpm release. Enable Corepack when it is available, then run `pnpm install` from the repository root.

## Configure and start

1. Copy `.env.example` to ignored `.env.local`, then edit `.env.local` for local-only values. `.env` is reserved for production-only values and is never read by local commands. Replace the local Better Auth secret with a long random value before sharing a local environment.
2. Start PostgreSQL and MinIO with `pnpm docker:up` and wait for their health checks. MinIO is the local ticket-attachment store; its console is available at `http://localhost:9001` using the credentials in `.env.local`.
3. Generate Prisma Client with `pnpm db:generate`.
4. Apply committed migrations with `pnpm --filter @repo/database migrate:deploy`.
5. Import BookLeaf sample data with `pnpm --filter @repo/database seed`.
6. Start the applications with `pnpm dev`; use package filters to run one process when needed.

The web app's same-origin `/api/*` proxy requires `API_PROXY_URL`; for local
development, set it to `http://localhost:4000` in the workspace-root `.env.local`.
The web app loads that file when its Next.js config starts; restart `pnpm dev`
after changing the proxy URL.

## BookLeaf sample data

`packages/database/fixtures/bookleaf-sample.json` is the tracked, synthetic source dataset. The database seed validates it before writing, then normalizes its nested authors and books. It upserts Authors and Books by their supplied external IDs, Platforms by name, and BookDistribution rows by their composite book/platform key. Re-running the command is idempotent and does not delete records.

Author business records are separate from Better Auth users. An Author may later be linked to one existing `User` through `Author.userId`; the seed creates neither user accounts nor credentials. Resource routes derive the Author from the verified user session and enforce ownership.

Money uses PostgreSQL decimal columns: MRP and per-copy royalty use `DECIMAL(12,2)`; aggregate royalties use `DECIMAL(14,2)`. Dates use PostgreSQL `DATE`. Validation rejects duplicate external IDs or per-book platforms, missing author links, negative values, and royalty records where paid plus pending differs from earned. A royalty ledger is intentionally not modeled; the dataset contains current aggregate balances only.

## Author accounts and APIs

Users have a minimal `AUTHOR` default role and an `ADMIN` extension value. Author APIs authenticate server-side with Better Auth, map the verified user ID to `Author.userId`, and return `403 AUTHOR_NOT_LINKED` for a valid user without an author mapping. Admin APIs require the server-side `ADMIN` role. Books are always queried with the resolved author ID; inaccessible and unknown books both return `404`.

Available endpoints are `GET /api/v1/author/me`, `GET /api/v1/author/books?page=1&pageSize=20`, `GET /api/v1/author/books/:bookId`, and `GET /api/v1/author/overview`. Monetary API fields are decimal strings to preserve precision.

To provision local demo accounts, set a unique development-only `BOOKLEAF_DEMO_PASSWORD` with at least 12 characters, keep `NODE_ENV=development`, then run `pnpm --filter @repo/auth provision:demo`. The script creates accounts through Better Auth, links each seeded author explicitly, is idempotent, and never overwrites a conflicting link. Do not run it in production or commit the password.

To provision a local admin account, use the same development-only password and
run `pnpm --filter @repo/auth provision:admin -- admin@example.test`. Replace the
email with the local admin address. This development-only command creates the
account through Better Auth when needed and sets its role to `ADMIN`; it never
logs the password.

## Ticket operations

Run `pnpm --filter @repo/database migrate:deploy` after pulling the ticket migration, then restart the API. Author ticket APIs are `POST`/`GET /api/v1/author/tickets`, `GET /api/v1/author/tickets/:ticketId`, and `POST /api/v1/author/tickets/:ticketId/messages`. Admin ticket APIs are under `/api/v1/admin/tickets` for queue, detail, status, priority, category, assignment, public messages, and private notes.

Ticket categories and priorities are fixed enums. An author can only link a ticket to their own book and never receives internal notes or audit events. Admin mutations require `{ "version": <current ticket version> }`; reload on `409 TICKET_VERSION_CONFLICT`. Closed tickets cannot be reopened or receive author replies.

For local attachments, the API writes permitted uploads to MinIO. Keep the `MINIO_*` values in `.env.local` aligned with Docker Compose; the bucket is created automatically on first upload and attachment links use a private, time-limited download URL. Production uses Tigris through the `TIGRIS_*` configuration instead.

## Gemini AI support

Set `GEMINI_API_KEY` in the repository-root `.env.local` for local development; the API development commands load that file at startup. Restart after changing AI settings. In production, configure the key only in the Render API and Vercel Inngest-function secret environments where it runs. `GEMINI_MODEL` defaults to the stable `gemini-3.6-flash`, and `GEMINI_TIMEOUT_MS` defaults to 60000 (60 seconds; configurable up to 120000). AI processing runs via Inngest steps connected to `bookleaf/ticket.created`. The API never sends a public reply. `POST /api/v1/admin/tickets/:ticketId/ai-draft` produces a reviewable draft only. Gemini failures are bounded-retried for transient/rate-limit failures; credentials and ticket content are not logged.

The web app uses port 3000, API port 4000 by default. OpenAPI JSON is exposed at `/api/v1/openapi.json`; liveness and readiness are `/api/v1/health/live` and `/api/v1/health/ready`.

## Verification

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`. Tests that need PostgreSQL or a real Inngest development server must start those dependencies first. Optional Inngest credentials are intentionally blank in `.env.example`; configure them only when connecting to Inngest.

## Troubleshooting

If Prisma cannot connect, check the Docker health status and ensure `DATABASE_URL` uses the same credentials as Compose. If browser authentication fails, ensure `WEB_ORIGIN`, `CORS_ORIGINS`, `BETTER_AUTH_URL`, and `BETTER_AUTH_TRUSTED_ORIGINS` match actual origins exactly. The API refuses to start when its CORS and Better Auth origin sets differ. Do not disable cookie security in production to work around origin mistakes.
