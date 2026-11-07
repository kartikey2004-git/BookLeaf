# BookLeaf Author Portal

BookLeaf is a pnpm/TypeScript monorepo for an author publishing portal. Authors view books and royalties and open support tickets; administrators manage the support queue and review AI-assisted drafts.

## Production topology

| Responsibility                       | Platform              | Application/configuration                                         |
| ------------------------------------ | --------------------- | ----------------------------------------------------------------- |
| Web UI and Inngest function endpoint | Vercel                | `apps/web`, including `/api/inngest`                              |
| REST API and Better Auth server      | Render                | `apps/api`, built from `apps/api/Dockerfile`                      |
| PostgreSQL                           | Neon                  | Prisma runtime uses the pooled URL; migrations use the direct URL |
| Durable events and retries           | Inngest Cloud         | Delivers `bookleaf/ticket.created` to Vercel `/api/inngest`       |
| Ticket attachments                   | Tigris object storage | S3-compatible storage used by the Render API                      |
| AI triage and reply drafts           | Gemini                | Called only from server-side API/jobs code                        |

The browser calls same-origin `/api/*` routes on Vercel. The Next.js proxy forwards those requests and auth cookies to Render; browsers do not need the Render URL.

## Run locally

### Prerequisites

- Node.js 22 or newer
- Corepack (or pnpm 10.23.0)
- Docker Desktop with Docker Compose running

### Setup

Run these commands at the repository root. Use PowerShell equivalents on Windows when necessary.

```sh
corepack enable
cp .env.example .env.local
pnpm install
pnpm docker:up
pnpm db:generate
pnpm --filter @repo/database migrate:deploy
pnpm --filter @repo/database seed
pnpm dev
```

`.env.local` is ignored and is the only local configuration file loaded by the development commands. Do not point it at production or copy production secrets into it. The template contains working local PostgreSQL and MinIO values; add a local Gemini key only if you want AI features, and local Inngest keys only if you are using an Inngest Dev Server.

Open `http://localhost:3000`. The API is available at `http://localhost:4000`; its liveness and readiness probes are `/api/v1/health/live` and `/api/v1/health/ready`.

To create local demo accounts after seeding:

```sh
pnpm --filter @repo/auth provision:demo
pnpm --filter @repo/auth provision:admin -- admin@example.test
```

Both commands are deliberately blocked outside development and read the local `BOOKLEAF_DEMO_PASSWORD`; neither prints it.

## Common commands

```sh
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm docker:down
```

`pnpm docker:down` retains local volumes. To reset local data, remove the Docker volumes manually only when that data is no longer needed.

## Production configuration

Do not use the local Docker setup in production. Configure environment variables directly in Render and Vercel, keep Neon/Tigris credentials server-side, and register the Vercel Inngest endpoint in Inngest Cloud. The exact variable ownership and release checklist are in:

- [Render, Vercel, Neon, Inngest, and Tigris deployment guide](docs/deployment/render-production-deployment-guide.md)
- [Environment-variable inventory](docs/deployment/environment-variables.md)
- [Local development reference](docs/development/local-setup.md)

## AI behavior and limits

BookLeaf uses Gemini `gemini-3.6-flash` for ticket triage and administrator-requested reply drafts. Ticket text is untrusted input, structured responses are validated, and drafts are never sent automatically. ISBN/metadata tickets have a code-enforced minimum suggested priority of `HIGH`. Pino logs model, token-usage metadata, and latency without logging prompts, ticket content, or credentials.

## Known limitations

- Rate limiting is an in-memory, per-process fixed window.
- Drafts and prompts are not cached.
- The API accepts validated attachment references but does not independently verify a pre-existing remote object.
- Knowledge-base retrieval is keyword-based rather than semantic search.
- SSE is best-effort; it has no cross-instance fan-out or event replay.
