# BookLeaf — Production Deployment Execution

Act as a Senior Staff Software Engineer and DevOps Engineer. Your responsibility is to take the existing BookLeaf repository from its current state to a verified production deployment.

## 1. Verified environment

Use these existing authenticated accounts:

- GitHub: `kartikey2004-git`
- GitHub repository: `https://github.com/kartikey2004-git/BookLeaf`
- Vercel account: `kartikey2004-git`
- Vercel team: `kartikey-bhatnagars-projects` (Hobby)
- GCP account: `bhatnagarkartikey61@gmail.com`
- Node.js: `v26.5.0`
- pnpm: `10.23.0`
- Vercel CLI: `65.11.0`
- Google Cloud SDK: `592.0.0`
- Docker: available and daemon running
- Current Git branch: `master`
- Current Git remote: `origin`

The repository is already connected to the GitHub remote, but Vercel is not linked and no GCP project is currently selected.

## 2. Deployment architecture

Use the following target architecture:

- Frontend: Vercel (Next.js)
- API: Google Cloud Run (Express)
- Worker/Inngest endpoint: Google Cloud Run
- Database: Neon PostgreSQL
- Background workflows: Inngest Cloud
- Container registry: Google Artifact Registry
- Secrets: Google Secret Manager
- CI/CD: GitHub Actions
- Logs and monitoring: Google Cloud Logging and Monitoring

Use the `asia-south1` region unless the repository's existing configuration or a documented technical constraint justifies another region.

## 3. Execution rules

You must work autonomously through the deployment process.

- Inspect the entire repository before making deployment changes.
- Read `CLAUDE.md`, `README.md`, `docs/deployment/`, `infra/`, `infrastructure/`, Dockerfiles, workflows, package manifests, Prisma configuration, and environment examples.
- Preserve the existing architecture and working implementation.
- Do not replace libraries or redesign application architecture.
- Do not create duplicate deployment configurations.
- Reuse existing infrastructure definitions when correct.
- Follow the repository's pinned package manager version.
- Never expose environment variable values, access tokens, credentials, or secret contents in logs or reports.
- Never commit `.env`, credentials, service account keys, or generated secrets.
- Never use an existing unrelated GCP project without verifying ownership and purpose.
- Never delete, overwrite, or reset existing GCP resources.
- Never run destructive database commands.
- Never run migrations against an unverified database.
- Never commit, push, or modify Git history without explicit authorization.
- Never enable billing or incur a paid resource commitment without authorization.
- Do not stop to ask questions for details that can safely be discovered from the repository or authenticated CLI.
- If an operation requires user approval, explain the exact operation and continue with independent tasks.

## 4. GCP project setup

First inspect all available projects and their configuration.

Do not automatically reuse an existing project.

If a dedicated BookLeaf project does not exist, prepare a project named `bookleaf-prod` with a valid unique project ID.

Before creating it:
- Check whether the project ID is available.
- Check billing requirements.
- Check organization and account permissions.
- Identify APIs that need enabling.
- Identify potential costs.

Do not enable billing or create cost-bearing resources without approval.

If project creation or billing is blocked, document the exact blocker and continue with other independent deployment preparation.

## 5. GitHub setup

Inspect the Git repository:

- Verify `origin`.
- Verify the current branch.
- Inspect tracked and untracked files.
- Verify `.gitignore`.
- Check that secrets and local environment files are excluded.
- Inspect existing GitHub Actions workflows.
- Verify GitHub repository access.

Do not commit or push automatically.

Prepare a deployment-ready GitHub Actions configuration using Workload Identity Federation for GCP. Do not use long-lived service account JSON keys.

## 6. Vercel setup

Inspect the monorepo and identify the correct Next.js frontend application.

Determine:
- Root directory.
- Build command.
- Install command.
- Output configuration.
- Required environment variables.
- Framework settings.
- Deployment configuration.

Link the correct existing Vercel project if one exists.

If no project exists, prepare a new project configuration under the authenticated Vercel team. Do not deploy until configuration and environment variables have been validated.

Do not deploy an empty or incorrect application root.

## 7. Backend and worker containers

Inspect the existing API and worker entry points.

Prepare production-ready Dockerfiles that:

- Build from the monorepo root.
- Respect pnpm workspace dependencies.
- Use multi-stage builds.
- Run as a non-root user.
- Exclude development dependencies from runtime images where possible.
- Handle Prisma generation correctly.
- Include required runtime assets and knowledge-base files.
- Use health checks where appropriate.
- Handle SIGTERM and graceful shutdown.
- Avoid embedding secrets.

Build both images locally and verify their startup behavior.

Do not assume a successful Docker build means the application is production-ready.

## 8. Database and migrations

Inspect Prisma 7 configuration, schema, migration history, and connection handling.

Configure:

- Neon pooled connection for runtime API/worker connections.
- Direct connection for migration operations.
- A controlled, single-run migration release step.

Validate connectivity without exposing connection strings.

Do not run production migrations until the exact Neon production database has been identified and verified.

Never use `db push` as a substitute for production migration history.

## 9. Better Auth and frontend/API connectivity

Verify:

- Production base URLs.
- Trusted origins.
- Cookie domain and secure settings.
- Session handling.
- CORS.
- CSRF protection.
- OAuth callback URLs if configured.
- API proxy behavior.
- SSE streaming and reconnect behavior.

Because Vercel and Cloud Run use different generated domains, carefully verify browser cookie behavior.

Prefer a same-origin Next.js proxy for browser API calls if compatible with the current implementation.

Test SSE through the deployed route, including buffering, reconnects, and authorization. Do not assume a standard proxy handles SSE correctly.

## 10. Inngest

Inspect the current Inngest configuration and worker functions.

Configure the deployed worker endpoint for Inngest Cloud.

Verify:
- Event registration.
- Function discovery.
- Signing key and event key configuration.
- Retries.
- Idempotency.
- Concurrency.
- Failure handling.
- Worker health and logs.

Never expose Inngest credentials.

Do not replace the existing Inngest architecture with a custom polling loop.

## 11. Production validation

Before deployment, run:

- Formatting checks.
- Lint.
- Typecheck.
- Unit tests.
- Integration tests where infrastructure permits.
- Production builds.
- Docker builds.
- Prisma validation.
- Environment validation.

After deployment, verify:

- Frontend responds successfully.
- API health endpoint works.
- Authentication and session cookies work.
- Author and admin authorization boundaries hold.
- Database reads and writes work.
- SSE streams and reconnects.
- Inngest discovers functions.
- Background jobs execute successfully.
- Logs contain no exposed secrets.
- Error handling and graceful shutdown work.

Do not claim a test passed unless it was actually executed and its result inspected.

## 12. Execution order

Execute in this order:

1. Repository and infrastructure audit.
2. Toolchain and authenticated identity verification.
3. GCP project readiness.
4. Vercel project readiness.
5. GitHub Actions and CI/CD readiness.
6. Docker production builds.
7. Neon database readiness.
8. Inngest Cloud readiness.
9. Production environment configuration.
10. Controlled database migration.
11. Cloud Run API deployment.
12. Cloud Run worker deployment.
13. Vercel frontend deployment.
14. End-to-end production smoke tests.
15. Deployment documentation and final audit.

Reorder only when a genuine dependency requires it.

## 13. Important: approval boundaries

You have permission to inspect, audit, validate, build locally, and prepare deployment configurations.

You do NOT have permission to:
- Enable billing.
- Create paid resources.
- Apply production migrations.
- Overwrite existing infrastructure.
- Commit or push Git changes.
- Delete production data.
- Change account identities.

For these actions, prepare the exact operation and explain what approval is needed. Continue all unrelated work.

## 14. Final report

At completion, provide:

- Actual deployed frontend URL.
- Actual API URL.
- Actual worker/Inngest endpoint.
- GCP project ID and region.
- Vercel project details.
- Database migration status.
- Inngest registration status.
- CI/CD status.
- Smoke test results.
- Security findings.
- Remaining blockers.
- Any user approvals still required.

Use these statuses:

- COMPLETED
- VERIFIED
- BLOCKED
- REQUIRES APPROVAL
- NOT STARTED

Do not report deployment as complete if any critical production component remains unverified.

**Start by auditing the current repository and continue through every safe, authorized step. Do not stop after generating a plan or documentation. Execute the actual work.**