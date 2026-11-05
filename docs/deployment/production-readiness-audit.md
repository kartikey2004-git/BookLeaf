# Production readiness audit

Audit date: 2026-11-05. This is an observed-state record, not a deployment
claim. No provider resource was created, modified, committed, or deployed.

## Verified locally

- Repository remote is `https://github.com/kartikey2004-git/BookLeaf.git` and
  the checked-out branch is `master`.
- Node is `v26.5.0`, pnpm is `10.23.0`, Vercel CLI is `65.11.0`, and GitHub CLI
  is `2.103.3`.
- `.env` and `.env.local` are ignored; neither is tracked. `.env.example` is
  intentionally tracked and contains placeholders only.
- The frontend root is `apps/web`; API and worker entry points are
  `apps/api/src/server.ts` and `apps/worker/src/index.ts`.
- Node `v26.5.0`, pnpm `10.23.0`, Vercel CLI `65.11.0`, GitHub CLI `2.103.3`,
  Docker CLI `29.7.2`, and Google Cloud SDK `592.0.0` were resolved from this
  Codex session. `gcloud` is installed outside `PATH` at the documented
  executable location.
- The complete unit suite passes: 5 database, 2 auth, 17 API, and 2 worker
  tests. Root `pnpm test`, `pnpm typecheck`, `pnpm lint`, and
  `pnpm format:check` passed. Prisma validation, AI build/artifact validation,
  API build, worker build, and frontend production build passed.

## Prepared configuration

- `apps/api/Dockerfile` and `apps/worker/Dockerfile` build from the monorepo
  root, generate Prisma, package the AI knowledge-base artifact, run as an
  unprivileged user, expose Cloud Run port 8080, and define health checks.
- API and worker map Cloud Run's `PORT` to their existing local port settings.
- The web app proxies `/api/auth/*` and `/api/v1/*` through `API_PROXY_URL`.
  It streams the upstream body, forwards credentials and `Last-Event-ID`, and
  preserves separate `Set-Cookie` headers for Better Auth. It also uses the
  incoming request signal to cancel the upstream request when the browser
  disconnects.
- Prisma migration commands use `DIRECT_URL` when available and otherwise
  retain `DATABASE_URL` for local development. Runtime applications continue
  to use the pooled `DATABASE_URL`.
- `.github/workflows/production-deploy.yml` is manual-dispatch only, protected
  by the `production` environment, uses GitHub OIDC Workload Identity
  Federation, validates a disposable PostgreSQL integration database, builds
  immutable images, runs one direct-URL migration step, deploys both Cloud Run
  services, and smoke-tests them. It does not use a service-account key.

## Required configuration before a release

Create or select a dedicated, billed BookLeaf GCP project only after approval.
Use `asia-south1`, create the Artifact Registry repository and least-privilege
runtime/deployment service accounts, enable Cloud Run, Artifact Registry,
Secret Manager, IAM Credentials, and Cloud Build APIs, then configure WIF for
repository `kartikey2004-git/BookLeaf` and its protected release ref.

Set these protected GitHub environment values: `GCP_PROJECT_ID`, `GCP_REGION`,
`ARTIFACT_REPOSITORY`, `GCP_WORKLOAD_IDENTITY_PROVIDER`,
`GCP_DEPLOY_SERVICE_ACCOUNT`, `WEB_ORIGIN`, `VERCEL_ORG_ID`, and
`VERCEL_PROJECT_ID`. Set `NEON_DIRECT_DATABASE_URL` and `VERCEL_TOKEN` as
protected environment secrets. The former must be the verified direct
production Neon URL with TLS enabled; do not use a pooled URL for migrations.

Create Secret Manager secrets for the pooled `DATABASE_URL`, Better Auth
secret, Inngest event/signing keys, Gemini key, and any enabled OAuth secret.
Grant each Cloud Run runtime service account access only to its required
secrets. The API must receive exact `WEB_ORIGIN`, `CORS_ORIGINS`,
`BETTER_AUTH_URL`, and `BETTER_AUTH_TRUSTED_ORIGINS` values matching the final
Vercel URL.

In Vercel, configure `apps/web` as the root directory, configure the monorepo
install/build commands, and set the server-only `API_PROXY_URL` to the API
Cloud Run URL. `NEXT_PUBLIC_API_URL` is only needed for server-side API access;
browser traffic is intentionally relative and goes through the proxy. Add the
same URL to Better Auth OAuth callback configuration if OAuth is enabled.

Register `<worker-cloud-run-url>/api/inngest` in Inngest Cloud and verify
function discovery before sending a non-production heartbeat event. Confirm the
production event and signing keys are stored only in Secret Manager.

## Resolved local blockers

### Missing database fixture

`packages/database/src/tests/seed.test.ts` and the seed command referenced
`prompts/sample.json`. The current commit deleted that file while also ignoring
the entire `prompts/` directory, but Git history proved that commit
`1730d1d` introduced the exact synthetic 10-author/18-book fixture and the
current commit deleted it. The historical fixture was recovered without
inventing data into `packages/database/fixtures/bookleaf-sample.json`, which is
not ignored. Both callers now use that tracked package fixture. The affected
database tests and full root test suite pass.

### Formatting and type safety

The root formatting gate initially found an unformatted worker function file;
the repository formatter was applied to that one file and `pnpm format:check`
now passes. The browser-aware Better Auth client was adjusted to avoid relying
on a DOM global in a package compiled with Node-only TypeScript settings; root
type checking now passes.

## Current blockers and reproducible evidence

### Local environment and authorization

- **GCP network access:** the SDK executable works and reports the configured
  account, but project listing cannot refresh OAuth because connections to
  `oauth2.googleapis.com:443` fail with Windows socket error `10013`. No
  active project is configured. The GCP configuration/log directories are
  writable; this is a network-policy failure, not an SDK or directory failure.
- **Docker daemon access:** the Docker CLI resolves, the `docker-users` group
  contains the Windows account, and the `docker_engine` named pipe exists.
  Docker Desktop processes are present, but its demand-start `com.docker.service`
  service is stopped. Starting it from this medium-integrity session fails with
  `Cannot open com.docker.service service on computer '.'`. More importantly,
  the current Codex token does not contain the `docker-users` group SID, and
  `docker info` using an empty diagnostic Docker configuration still fails with
  `permission denied while trying to connect to the docker API at
npipe:////./pipe/docker_engine`. This is a service/UAC and Codex restricted-
  token issue, not an image or Dockerfile issue. The normal Docker configuration
  directory is also unreadable to this session. Images, containers, integration
  tests, and startup probes are therefore blocked; Docker security and data were
  not changed.
- **GitHub:** GitHub CLI resolves, but saved tokens for the listed accounts are
  invalid and GitHub API access also fails with socket error `10013`. Repository
  access, Actions configuration, and workflow execution remain unverified.
- **Vercel:** Vercel CLI resolves, but `whoami` fails with `fetch failed`.
  `apps/web` has no project linkage. The correct team/project cannot be safely
  discovered while network access is blocked, and no link was created.

### External infrastructure

- No dedicated GCP project, billing state, Artifact Registry repository,
  runtime service account, WIF provider, Secret Manager secret, Cloud Run
  service, Neon production database, or Inngest endpoint has been inspected or
  changed.
- No direct/pool Neon URLs were verified. No production migration ran.
- Docker-dependent local integration testing is blocked by the daemon access
  issue; it was not substituted with a shared or production database.

## Approval boundary

Approval is required before enabling billing, creating a GCP project or paid
resource, creating or updating Secret Manager values, configuring WIF/IAM,
creating/linking a Vercel project, applying the production migration, deploying
Cloud Run/Vercel, or committing/pushing this prepared configuration.

To complete local container validation, an administrator must start Docker
Desktop's service with `Start-Service -Name com.docker.service` in an elevated
PowerShell session, then the Codex runtime must be launched with the current
user's `docker-users` group token (or be granted access specifically to
`\\.\pipe\docker_engine`). This must be a scoped session permission; do not
disable sandboxing globally or alter the pipe ACL for unrelated users.
