# Task 04 Continuation — Complete the AI Backend

You are taking over the current partially implemented Task 04 as a Senior Backend Engineer.

## Verified Current State

Already completed:

- `@repo/ai` loads `BOOKLEAF_KNOWLEDGE_BASE.md` using module-relative resolution.
- Duplicated policy summaries have been removed.
- Prompts select relevant source sections.
- Ticket content is explicitly treated as untrusted input.

Still incomplete:

1. AI provider client.
2. Environment validation.
3. Timeout and rate-limit error handling.
4. Inngest ticket-created event.
5. Background worker.
6. AI persistence writes.
7. Administrator override protection.
8. Admin AI draft endpoint.
9. Tests.
10. Migration application and validation.
11. OpenAPI and documentation.
12. Full verification.

## Execution Directive

Do not restart Task 04.

Do not recreate the knowledge-base integration.

Do not modify completed Tasks 01–03 unless a specific integration defect makes it necessary.

First inspect the actual working tree, current diffs, package structure, and existing implementation. Treat the current repository as the source of truth.

Then implement all remaining requirements.

## Phase 1 — Provider Integration

Build the provider client inside the existing AI package.

Requirements:

- Follow the repository's existing provider and SDK conventions.
- Validate required environment variables through the existing environment validation system.
- Keep credentials server-side.
- Add configurable request timeout.
- Normalize provider failures into typed errors.
- Distinguish authentication failures, rate limits, timeouts, transient failures, and malformed model output.
- Apply bounded retries only where appropriate.
- Validate every structured model response with Zod.
- Avoid logging secrets or complete sensitive ticket content.

Do not add unnecessary provider abstractions.

## Phase 2 — Durable AI Processing

Use the existing Inngest infrastructure.

Implement:

- Ticket-created event contract.
- Event dispatch after successful ticket creation.
- Worker registration.
- Classification and priority recommendation.
- Retry-safe database writes.
- Idempotent event processing.
- Safe behavior when a ticket is deleted or updated during processing.
- Appropriate failure logging.

Important:

- Ticket creation must not depend on AI availability.
- Do not dispatch an event before the ticket transaction successfully commits.
- Do not allow AI retries to overwrite administrator overrides.
- Keep AI recommendations separate from effective category and priority.
- Do not create duplicate AI results for the same processing attempt.

## Phase 3 — AI Persistence

Inspect the drafted migration and Prisma changes.

Complete the persistence model only where required.

Requirements:

- Store classification recommendation.
- Store priority recommendation.
- Store confidence or supporting metadata only where justified by the existing design.
- Store processing state and failure information safely.
- Preserve administrator overrides.
- Add appropriate indexes and constraints.
- Keep migrations consistent with the Prisma schema.

Apply the migration locally without resetting or destroying existing data.

## Phase 4 — Admin AI Draft Endpoint

Implement:

`POST /api/v1/admin/tickets/:ticketId/ai-draft`

Requirements:

- Existing admin authentication and authorization.
- Zod request validation.
- Ticket existence checks.
- Relevant knowledge-base section selection.
- AI-generated response draft.
- Structured classification and priority recommendations where applicable.
- Consistent API errors.
- No automatic public response sending.
- Admin remains responsible for reviewing and sending the draft.

Follow existing API conventions rather than inventing new response formats.

## Phase 5 — Tests

Add tests for:

- Provider success.
- Invalid credentials.
- Timeout.
- Rate limiting.
- Transient provider failure.
- Invalid structured output.
- Knowledge-base integration.
- Ticket-created event dispatch.
- Worker execution.
- Duplicate event execution.
- Retry behavior.
- Ticket deletion during processing.
- Administrator override preservation.
- Admin authorization.
- Missing ticket.
- Draft generation failure.
- No automatic response sending.

Mock external AI provider calls.

Tests must run without a real API key.

## Phase 6 — Documentation

Update:

- OpenAPI specification.
- AI architecture documentation.
- Environment variable documentation.
- Local development instructions.
- Worker execution and retry documentation.
- Known limitations.

Document why the selected provider and model are appropriate for this workload.

## Phase 7 — Verification

Run the relevant checks:

- Prisma generate and validate.
- Migration application.
- Database tests.
- AI package tests.
- API tests.
- Worker tests.
- TypeScript typechecks.
- Lint.
- Production builds.
- `git diff --check`.

Review the complete diff.

Confirm that:

- Tasks 01–03 remain intact.
- No secrets are committed.
- No duplicated knowledge-base policy content has returned.
- No automatic response sending was introduced.
- No unrelated files were modified.

## Execution Rules

- Proceed autonomously.
- Do not stop after creating scaffolding.
- Do not ask for approval for routine engineering decisions.
- Do not silently skip incomplete requirements.
- If blocked by a genuine external dependency, complete all independent work and report the exact blocker.
- Do not claim tests, builds, or migrations passed unless they actually ran.

## Final Report

Provide:

1. Implemented functionality.
2. Files created and modified.
3. Database migration status.
4. Provider and failure-handling design.
5. Inngest event and worker behavior.
6. Persistence and override guarantees.
7. Admin API contract.
8. Test results.
9. Build and verification results.
10. Remaining blockers.

**Definition of done: Task 04 must be fully integrated and verified, not merely scaffolded.**
