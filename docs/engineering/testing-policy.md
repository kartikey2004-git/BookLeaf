# Testing policy

## Scope

Every workspace must expose `typecheck`, `lint`, and, where executable behavior exists, `test`. API, auth, database, worker, and contract changes require the relevant suite before merge.

## Test levels

- Unit tests cover deterministic parsing, configuration, and service behavior. External providers may be mocked only here.
- API tests exercise Express routes, validation, errors, authorization, rate limits, and response contracts.
- Integration tests use the disposable PostgreSQL database on `127.0.0.1:55432`; they run migrations and never target an arbitrary database.
- Authentication integration tests use the real Better Auth node handler, cookies, session retrieval, sign-out, protected routes, and origin checks.
- Worker integration checks execute the real claim path against PostgreSQL. Inngest delivery is exercised through its served handler in deployment smoke tests.
- End-to-end browser tests are required only when a user-visible cross-service flow changes.

## Isolation and cleanup

Use unique test identifiers. The integration runner rejects any database URL other than the dedicated local `bookleaf_integration` instance. The named disposable container is removed after the suite; no shared or production database is reset or truncated.

## CI gate

CI runs frozen dependency installation, API and worker typecheck/lint/build, API tests, worker tests, Prisma validation, and the PostgreSQL integration suite. Failures block merge. Coverage thresholds are not set until coverage collection is consistently measured.

## Local integration command

Start the disposable integration PostgreSQL container, apply migrations, then run `pnpm test:integration` with the test environment values documented in `infra/test/backend-integration.ts`. Do not reuse a development or production database.
