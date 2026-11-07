# BookLeaf Author Portal

BookLeaf is a TypeScript monorepo for an author publishing portal. Authors can review books and royalties, create support tickets, and follow support updates. Administrators manage ticket workflows and AI-assisted drafts.

## Architecture

- `apps/web` — Next.js App Router marketing pages and protected author/admin portal.
- `apps/api` — Express REST API, health probes, OpenAPI, authenticated SSE, and middleware.
- `packages/jobs` — Inngest functions (ticket AI triage and recovery), served by the `apps/web` `/api/inngest` endpoint.
- `packages/*` — shared auth, database, validation, contracts, configuration, AI, and UI code.

See the [system overview](docs/architecture/system-overview.md) and [local setup](docs/development/local-setup.md) for detail.

## Quick start

```sh
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm --filter @repo/database migrate:deploy
pnpm --filter @repo/database seed
pnpm dev
```

## Common commands

`pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm format:check`, `pnpm docker:down`.

Read the [frontend API contract](docs/development/frontend-api-contract.md), [testing policy](docs/engineering/testing-policy.md), and [observability baseline](docs/engineering/observability.md) before changing a cross-service workflow.

## Security

Keep `.env` private, use a unique Better Auth secret, and grant database access only to required services. Production requires exact CORS origins, TLS, managed database credentials, and an Inngest project configuration.

## AI integration

BookLeaf uses Gemini `gemini-3.6-flash`, the configured default for both API and job execution. The implementation chooses a Flash model for cost and latency suitability for short ticket triage and reviewable drafts, while requesting structured JSON for classification and non-streaming drafts.

Triage supplies a category-selected slice of the canonical knowledge base plus tone guidance. Ticket text is explicitly untrusted and delimited separately from trusted policy and `<account_data>` blocks. Drafts receive only the linked book fields needed for a response; when account data is unavailable or incomplete, the prompt requires `[ADMIN TO VERIFY]` instead of guessed facts. ISBN/metadata recommendations have a code-side minimum priority of `HIGH`.

Gemini calls use request timeouts, retry transient, rate-limit, and timeout failures with backoff plus jitter, and Zod validates structured output. Ticket triage runs asynchronously through Inngest, has a recovery sweep, and leaves manual classification and replies available when AI is unavailable. Drafts are generated only at an administrator's request and are never sent automatically.

Cost controls limit ticket text to 6,000 characters, include at most eight public messages in a draft, retrieve only one matching KB category plus tone guidance, and cap output at 700 tokens for JSON calls and 1,024 for streaming drafts. Pino records per-call model, token usage metadata when Gemini provides it, and latency; prompts, ticket text, and keys are not logged.

## Known limitations

- Rate limiting is an in-memory, per-process fixed window rather than a shared distributed limiter.
- Drafts and prompts are not cached.
- Attachment `secureUrl` and `publicId` are accepted from the client after format validation; the API does not independently verify the stored object.
- The audit actor is recorded in ticket audit events, not in dedicated category/priority override fields on the ticket row.
- Knowledge-base retrieval is keyword-based rather than semantic search.
- Local integration tests require a dedicated PostgreSQL integration database.
