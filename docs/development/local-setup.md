# Local development

## Prerequisites

Use Node.js 22 or later, Docker Compose, and pnpm 10. The root package declares the exact pnpm release. Enable Corepack when it is available, then run `pnpm install` from the repository root.

## Configure and start

1. Copy `.env.example` to `.env` and replace the local Better Auth secret with a long random value.
2. Start PostgreSQL with `pnpm docker:up` and wait for its health check.
3. Generate Prisma Client with `pnpm db:generate`.
4. Create the initial local migration with `pnpm --filter @repo/database migrate:dev -- --name init`.
5. Start the applications with `pnpm dev`; use package filters to run one process when needed.

The web app uses port 3000, API port 4000, and worker port 4001 by default. OpenAPI JSON is exposed at `/api/v1/openapi.json`; liveness and readiness are `/api/v1/health/live` and `/api/v1/health/ready`.

## Verification

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`. Tests that need PostgreSQL or a real Inngest development server must start those dependencies first. Optional Inngest credentials are intentionally blank in `.env.example`; configure them only when connecting to Inngest.

## Troubleshooting

If Prisma cannot connect, check the Docker health status and ensure `DATABASE_URL` uses the same credentials as Compose. If browser authentication fails, ensure `WEB_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_TRUSTED_ORIGINS` match actual origins exactly. Do not disable cookie security in production to work around origin mistakes.
