# Local development

## Prerequisites

Use Node.js 22 or later, Docker Compose, and pnpm 10. The root package declares the exact pnpm release. Enable Corepack when it is available, then run `pnpm install` from the repository root.

## Configure and start

1. Copy `.env.example` to `.env` and replace the local Better Auth secret with a long random value.
2. Start PostgreSQL with `pnpm docker:up` and wait for its health check.
3. Generate Prisma Client with `pnpm db:generate`.
4. Create the initial local migration with `pnpm --filter @repo/database migrate:dev -- --name init`.
5. Import BookLeaf sample data with `pnpm --filter @repo/database seed`.
6. Start the applications with `pnpm dev`; use package filters to run one process when needed.

## BookLeaf sample data

`prompts/sample.json` is the source dataset. The database seed validates it before writing, then normalizes its nested authors and books. It upserts Authors and Books by their supplied external IDs, Platforms by name, and BookDistribution rows by their composite book/platform key. Re-running the command is idempotent and does not delete records.

Author business records are separate from Better Auth users. An Author may later be linked to one existing `User` through `Author.userId`; the seed creates neither user accounts nor credentials. Resource routes derive the Author from the verified user session and enforce ownership.

Money uses PostgreSQL decimal columns: MRP and per-copy royalty use `DECIMAL(12,2)`; aggregate royalties use `DECIMAL(14,2)`. Dates use PostgreSQL `DATE`. Validation rejects duplicate external IDs or per-book platforms, missing author links, negative values, and royalty records where paid plus pending differs from earned. A royalty ledger is intentionally not modeled; the dataset contains current aggregate balances only.

## Author accounts and APIs

Users have a minimal `AUTHOR` default role and an `ADMIN` extension value. Author APIs authenticate server-side with Better Auth, map the verified user ID to `Author.userId`, and return `403 AUTHOR_NOT_LINKED` for a valid user without an author mapping. Admin APIs require the server-side `ADMIN` role. Books are always queried with the resolved author ID; inaccessible and unknown books both return `404`.

Available endpoints are `GET /api/v1/author/me`, `GET /api/v1/author/books?page=1&pageSize=20`, `GET /api/v1/author/books/:bookId`, and `GET /api/v1/author/overview`. Monetary API fields are decimal strings to preserve precision.

To provision local demo accounts, set a unique development-only `BOOKLEAF_DEMO_PASSWORD` with at least 12 characters, keep `NODE_ENV=development`, then run `pnpm --filter @repo/auth provision:demo`. The script creates accounts through Better Auth, links each seeded author explicitly, is idempotent, and never overwrites a conflicting link. Do not run it in production or commit the password.

## Ticket operations

Run `pnpm --filter @repo/database migrate:deploy` after pulling the ticket migration, then restart the API. Author ticket APIs are `POST`/`GET /api/v1/author/tickets`, `GET /api/v1/author/tickets/:ticketId`, and `POST /api/v1/author/tickets/:ticketId/messages`. Admin ticket APIs are under `/api/v1/admin/tickets` for queue, detail, status, priority, category, assignment, public messages, and private notes.

Ticket categories and priorities are fixed enums. An author can only link a ticket to their own book and never receives internal notes or audit events. Admin mutations require `{ "version": <current ticket version> }`; reload on `409 TICKET_VERSION_CONFLICT`. Closed tickets cannot be reopened or receive author replies.

## Gemini AI support

Set `GEMINI_API_KEY` only in server/worker environments. `GEMINI_MODEL` defaults to `gemini-2.5-flash`, an inexpensive model suitable for short classifications and drafts, and `GEMINI_TIMEOUT_MS` defaults to 15000. The worker receives `bookleaf/ticket.created`, retrieves only relevant canonical knowledge-base sections, and stores AI recommendations separately from administrator category and priority values. It never sends a public reply. `POST /api/v1/admin/tickets/:ticketId/ai-draft` produces a reviewable draft only. Gemini failures are bounded-retried for transient/rate-limit failures; credentials and ticket content are not logged.

The web app uses port 3000, API port 4000, and worker port 4001 by default. OpenAPI JSON is exposed at `/api/v1/openapi.json`; liveness and readiness are `/api/v1/health/live` and `/api/v1/health/ready`.

## Verification

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`. Tests that need PostgreSQL or a real Inngest development server must start those dependencies first. Optional Inngest credentials are intentionally blank in `.env.example`; configure them only when connecting to Inngest.

## Troubleshooting

If Prisma cannot connect, check the Docker health status and ensure `DATABASE_URL` uses the same credentials as Compose. If browser authentication fails, ensure `WEB_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_TRUSTED_ORIGINS` match actual origins exactly. Do not disable cookie security in production to work around origin mistakes.
