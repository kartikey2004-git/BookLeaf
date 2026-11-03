# Engineering foundation

A production-minded TypeScript monorepo baseline with Next.js, Express, Better Auth, Prisma/PostgreSQL, Inngest, Zod, OpenAPI, SSE, pnpm, and Turborepo. It intentionally has no product domain, CRUD module, sample data, or assignment-specific behavior.

## Architecture

- `apps/web` — Next.js App Router UI shell.
- `apps/api` — Express REST, health, OpenAPI, SSE, and API middleware.
- `apps/worker` — Inngest function serving and registration.
- `packages/*` — shared auth, database, validation, contracts, and configuration ownership.

See [system overview](docs/architecture/system-overview.md) and [local setup](docs/development/local-setup.md) for details.

## Quick start

```sh
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm --filter @repo/database migrate:dev -- --name init
pnpm dev
```

## Common commands

`pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format:check`, `pnpm docker:down`.

## Security

Keep `.env` private, use a unique Better Auth secret, and grant database access only to the services that need it. Production deployment requires real CORS origins, TLS, managed database credentials, and an Inngest project configuration.
