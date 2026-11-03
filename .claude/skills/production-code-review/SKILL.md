---
name: production-code-review
description: Conduct evidence-based production readiness reviews in the repository's established engineering conventions.
---

# Production code review

## Purpose

Review changes for real defects and regression risk, prioritizing behavior, security, data integrity, and operability above style preferences.

## Activation conditions

Use for pull-request reviews, pre-merge reviews, risky changes, incident follow-ups, or requests to assess production readiness. The repository currently has no application source or Git baseline visible beyond the supplied tooling scaffold, so reviews must state this limitation and must not invent defects.

## Required repository context

Read the requested diff and surrounding code, relevant tests, package scripts, ownership boundaries, schemas/migrations, API contracts, auth middleware, background workflows, deployment config, and prior behavior. Run available targeted checks before making a pass/fail claim.

## Engineering rules

- Review in this order: correctness, security, data integrity, concurrency, performance, maintainability, then style.
- Report only actionable findings with severity, affected path/behavior, proof or a plausible execution path, and a concrete remedy. Separate assumptions from verified facts.
- Check authorization at every data/resource boundary; look specifically for IDOR, tenant bypass, privilege escalation, CSRF/CORS mistakes, injection, SSRF, and secret disclosure.
- Inspect persistence changes for constraints, transactions, race conditions, migration reversibility, pagination, and N+1 query risk.
- Inspect async/workflow changes for duplicate delivery, retries, idempotency, timeout/cancellation behavior, and failure observability.
- Inspect API changes for input validation, contract compatibility, error behavior, status codes, and redaction.
- Require tests that exercise changed behavior and plausible failure paths; do not ask for meaningless coverage-only tests.
- Never reveal `.env` values, access tokens, session data, or production records in review output.

## Implementation workflow

1. Establish the change's intended outcome and affected packages/contracts.
2. Read the diff followed by callers, callees, schemas, tests, and configuration—not just changed lines.
3. Trace happy paths and important failures, including unauthorized and concurrent requests.
4. Run narrow checks/tests first, expanding to build/type/lint only when the change or CI scope warrants it.
5. Produce findings ordered by severity with file/line references, then list residual risks and checks actually run.
6. If no defects are found, say "no findings" and name the review scope and unverified areas; never claim full assurance.

## Common failure scenarios

- A route validates input but never verifies ownership of the requested record.
- A database write is correct alone but races under concurrent retries.
- Error middleware turns expected validation failures into 500 responses or leaks internals.
- A Next.js client component imports server-only credentials/dependencies.
- A migration applies but makes rollback, backfill, or existing rows unsafe.
- A test mocks the layer that contains the actual regression and cannot detect it.

## Validation requirements

Use the repository's existing scripts to run relevant tests, type checks, lint, contract/database checks, and build when available. Inspect `git diff --check` and search changed content for tokens/secrets without printing values. State every command executed and every limitation. In this scaffold state, only configuration/documentation validation is possible until project code is supplied.

## Relevant documentation references

- Root `CLAUDE.md`, the responsible agent guide, and the relevant specialized skill.
- Repository CI, test configuration, environment schema, and deployment documentation once present.
- OWASP guidance and official framework documentation appropriate to installed versions.
