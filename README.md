# BookLeaf Author Portal

BookLeaf is a TypeScript monorepo for an author publishing portal. Authors can review books and royalties, create support tickets, and follow support updates. Administrators manage ticket workflows and AI-assisted drafts.

## Architecture

- `apps/web` — Next.js App Router marketing pages and protected author/admin portal.
- `apps/api` — Express REST API, health probes, OpenAPI, authenticated SSE, and middleware.
- `apps/worker` — Inngest worker serving AI job recovery and processing.
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
