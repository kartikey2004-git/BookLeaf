# Engineering instructions

## Current verified state

This is a pnpm 10/Turborepo monorepo. `apps/web` is a Next.js 15 App Router UI (including the `/api/inngest` endpoint that serves the shared Inngest functions), and `apps/api` is the Express 5 REST/SSE boundary. Shared packages own Better Auth, Prisma 7/PostgreSQL access, Zod validation, contracts, configuration, and UI utilities. Exact resolved versions are in `pnpm-lock.yaml`; use root scripts rather than global tools.

The repository has backend and dependency-security CI workflows. Database-backed and authentication integration checks use a disposable local PostgreSQL container and isolated environment values; never point them at a shared database.

## Workspace workflow

1. Read the affected package manifest, source, and this file before editing.
2. Map package responsibility and dependency direction before cross-package changes.
3. Use `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, and `pnpm build` from the root when applicable.
4. Keep frontend, API, data-access, authentication, contracts, and background-jobs boundaries explicit. Do not introduce microservices or refactor unrelated business logic.
5. Follow the matching skill in `.claude/skills/` for Next.js, Better Auth, Express, Prisma/Postgres, Inngest, SSE, OpenAPI, monorepo work, or production review.

## Engineering conventions

- TypeScript: preserve the repository’s compiler and lint settings; avoid `any`, unchecked casts, and unvalidated external input.
- APIs: use versioned, documented contracts where the application establishes them; validate request input at the boundary; centralize errors; enforce authentication and authorization before resource access; never return secrets.
- Database: model constraints and indexes deliberately; keep migrations reviewable; use transactions for multi-write invariants; avoid N+1 queries and unbounded reads.
- Authentication: treat identity, session, role, tenant, and resource ownership as server-side concerns. Do not trust client-provided authorization state.
- Background jobs and SSE: design for retries, duplicate delivery, reconnection, cancellation, authorization, and cleanup.
- Tests: add focused regression coverage for bugs and behavior-driven tests for features. Run the narrowest relevant checks first, then required workspace gates.
- Security: never commit credentials; use environment references; minimize logging of personal, credential, and session data; review CORS, CSRF, IDOR, injection, and SSRF exposure.

## Delegation

- Ask `architect` to assess boundaries and tradeoffs before cross-package or system-wide changes.
- Ask `backend-engineer`, `database-engineer`, and `security-reviewer` for work touching their boundaries; use `test-engineer` to plan meaningful verification.
- Agents provide recommendations and scoped implementation help. The primary engineer remains accountable for integrating changes, resolving conflicts, and validating the final diff.

## Definition of Done

1. Requirement and affected boundaries are understood.
2. Implementation is minimal, typed, validated, and consistent with local conventions.
3. Authorization, error paths, data integrity, retries/concurrency, and resource cleanup have been considered where relevant.
4. Relevant tests, type checks, lint, formatting, and build commands have run when they exist; report any unavailable or failing checks plainly.
5. The final diff has no unintended files, generated artifacts, or secrets.
6. Document required migration, deployment, configuration, or manual-authentication steps.
