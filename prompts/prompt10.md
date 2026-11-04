# Engineering Gate: Pre-Frontend Backend Verification

Act as a Senior Staff Software Engineer conducting a release-readiness review before frontend development begins.

## Objective

Verify that Tasks 01–04 of the BookLeaf Author Support & Communication Portal are stable, integrated, documented, and ready to serve as the backend contract for Task 05.

This is a verification and remediation task, NOT an architecture redesign.

## 1. Repository reconnaissance

Inspect the actual repository before doing anything.

- Read architecture and engineering documentation.
- Inspect Prisma schema and migrations.
- Inspect API routes, middleware, services, and validation.
- Inspect Better Auth integration and role authorization.
- Inspect AI provider integration, prompts, Knowledge Base retrieval, and error handling.
- Inspect Inngest event dispatch, workers, retries, and recovery mechanisms.
- Inspect existing tests, scripts, and environment configuration.
- Review git status, tracked changes, and untracked files.

Do not assume paths, package names, or implementation details. Discover them.

## 2. Verify critical workflows

Test the complete author-to-admin ticket lifecycle:

1. Author creates a ticket.
2. Ticket is persisted.
3. Ticket-created event is dispatched.
4. Worker classifies the ticket using Gemini.
5. AI category and priority recommendations are persisted.
6. Admin can override category and priority.
7. AI processing cannot silently overwrite manual decisions.
8. Admin requests an AI response draft.
9. Draft is returned for review and editing without being sent.
10. Admin sends a public response.
11. Author can retrieve the response.
12. Status transitions and audit events remain consistent.

Also verify provider failure, event publication failure, retries, recovery sweep, and duplicate worker execution.

## 3. Security and authorization audit

Verify:

- Authentication is enforced on protected routes.
- Author resources are scoped at the database query boundary.
- Cross-author access is impossible.
- ADMIN authorization is enforced server-side.
- Internal notes and private audit information are never exposed to authors.
- AI-generated content cannot execute instructions embedded in user ticket content.
- Provider API keys remain server-side.
- Validation and error responses do not leak internal implementation details.

Fix confirmed vulnerabilities.

## 4. API contract audit

Verify every existing author and admin endpoint against its actual implementation.

Check:

- Request and response schemas.
- Status codes and error formats.
- Pagination and filtering.
- Sorting and deterministic ordering.
- Ownership and role checks.
- OpenAPI accuracy.
- Missing frontend-critical response fields.

Do not add endpoints merely because they might be useful. Only add or correct something when an actual requirement or integration gap justifies it.

## 5. Database and operational readiness

Verify:

- Prisma schema and migrations are consistent.
- A clean database can migrate successfully.
- Seed operations are idempotent.
- Demo data has valid relationships.
- No credentials are hardcoded.
- Environment variables are documented.
- API and worker startup instructions are accurate.
- Existing transaction and audit guarantees are preserved.

## 6. Test and build verification

Run the relevant checks for every affected package:

- Prisma generation and validation.
- Migration verification.
- Database tests.
- API tests.
- Authentication and authorization tests.
- AI provider tests.
- Worker tests.
- TypeScript checks.
- Lint.
- Production builds.
- OpenAPI validation.
- `git diff --check`.

Do not report a check as passed unless you actually ran it.

If an external service credential is unavailable, clearly distinguish an untested integration from a passing mocked test.

## 7. Remediation rules

- Fix verified defects within the existing architecture.
- Add regression tests for every meaningful fix.
- Do not replace working implementations.
- Do not introduce speculative abstractions.
- Do not change the database model without a demonstrated need.
- Do not modify the assignment scope.
- Preserve the Knowledge Base and all existing useful documentation.
- Do not remove unrelated user work or untracked files.
- Never ask for confirmation for routine engineering decisions.

If a problem cannot be safely resolved, document its impact and the exact reason.

## 8. Frontend readiness contract

Produce a concise document describing:

- Authentication and session behavior.
- Author API endpoints.
- Admin API endpoints.
- Request and response shapes.
- Ticket lifecycle and allowed transitions.
- AI recommendation and draft behavior.
- Authorization boundaries.
- Pagination and filtering conventions.
- Error response conventions.
- Required environment variables.
- Known limitations.

Save it in the repository's existing documentation structure. Use the filename `frontend-api-contract.md` only if no suitable existing document exists.

## 9. Final report

Report:

1. What was inspected.
2. What was tested and actual results.
3. Defects discovered and fixes made.
4. Tests added.
5. Remaining risks and limitations.
6. Exact commands used.
7. Whether Tasks 01–04 are ready for frontend integration.

Do not start Task 05. Do not implement frontend components, pages, styling, SSE, or unrelated features.

**Completion criterion:** The existing backend is verified, its contracts are documented, critical regressions are covered, and remaining limitations are explicitly known.
