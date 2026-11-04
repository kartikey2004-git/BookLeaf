# Engineering Directive: Complete Task 04 — AI Intelligence & Decision Support

Act as a Senior Backend/Platform Engineer taking ownership of the partially implemented Task 04.

The following work has already been started:

- `BOOKLEAF_KNOWLEDGE_BASE.md` added as the canonical policy source.
- `@repo/ai` shared package created.
- AI ticket persistence migration drafted.

Your responsibility is to finish Task 04 completely, integrating with the existing architecture.

## 1. First: Inspect the Current State

Before modifying anything:

1. Inspect the complete AI package and its exports.
2. Inspect `BOOKLEAF_KNOWLEDGE_BASE.md`.
3. Inspect the drafted Prisma schema changes and migration.
4. Inspect existing ticket creation and admin ticket APIs.
5. Inspect the existing Inngest configuration, event conventions, worker registration, and retry behavior.
6. Inspect provider integrations, environment validation, Zod schemas, logging, and testing conventions.
7. Identify incomplete implementations, duplicated policy content, dead code, and inconsistencies.

Do not assume the previous implementation is correct.

## 2. Centralized Knowledge Base

Use `BOOKLEAF_KNOWLEDGE_BASE.md` as the single canonical policy source.

- Remove duplicated policy summaries from the AI package.
- Do not independently rewrite or maintain the same policies in prompts, services, or constants.
- Load the central source through a maintainable mechanism compatible with the existing monorepo.
- Keep prompt instructions separate from business-policy content.
- Select only relevant knowledge-base sections for each ticket.
- Preserve exact policy values, timelines, categories, and communication guidance.
- Never introduce unsupported BookLeaf policies.

The application must not depend on an arbitrary working directory to locate the knowledge base.

## 3. AI Provider Integration

Implement a provider abstraction consistent with the existing stack.

Requirements:

- API credentials exclusively through server-side environment variables.
- Structured outputs validated using Zod.
- Explicit timeout handling.
- Rate-limit and transient failure handling.
- Bounded retries.
- Clear distinction between provider failures and invalid model output.
- No API key exposure to frontend or logs.
- Cost-conscious context construction.
- No unnecessary vector database or RAG infrastructure for this small static knowledge base.

## 4. Classification and Priority

Implement AI recommendations for:

**Categories**

- Royalty & Payments
- ISBN & Metadata Issues
- Printing & Quality
- Distribution & Availability
- Book Status & Production Updates
- General Inquiry

**Priorities**

- Critical
- High
- Medium
- Low

Persist AI recommendations separately from effective ticket values and administrator overrides.

An administrator's manual changes must never be silently overwritten by a subsequent AI retry.

## 5. Durable Background Processing

Use the existing Inngest infrastructure.

Implement:

- A well-defined ticket-created event.
- Event dispatch after successful ticket creation.
- Durable worker execution.
- Retry-safe persistence.
- Idempotency protection.
- Bounded retries and failure handling.
- Safe behavior when the ticket has already been deleted or updated.
- Logging and observability for AI processing.

Ticket creation must succeed even if the AI provider is unavailable.

Avoid introducing a second queue system.

## 6. Admin AI Draft API

Implement:

`POST /api/v1/admin/tickets/:ticketId/ai-draft`

Requirements:

- Admin authentication and authorization.
- Validate request input.
- Verify ticket existence.
- Generate a draft using ticket context and relevant knowledge-base sections.
- Return structured classification, priority recommendation, and response draft where appropriate.
- Handle unavailable AI results gracefully.
- Never automatically send an AI-generated response.
- Preserve the distinction between AI recommendations and administrator-approved values.

Follow existing API response and error conventions.

## 7. Testing

Add meaningful tests for:

- Knowledge-base loading and section selection.
- Exact policy values and category consistency.
- Structured AI output validation.
- Invalid and malformed model responses.
- Provider timeout.
- Provider rate limiting.
- Provider unavailable scenarios.
- Classification and priority recommendations.
- Inngest event dispatch.
- Worker retries and idempotency.
- Duplicate event execution.
- Admin authorization.
- Missing ticket.
- AI draft generation failure.
- Preservation of administrator overrides.
- No automatic public response sending.

Use the existing test infrastructure. Mock external AI calls; do not require a live API key for normal test execution.

## 8. Database and Migration

Inspect the drafted migration before applying it.

- Ensure schema and migration are consistent.
- Check nullability, indexes, defaults, and relationships.
- Preserve existing Task 01–03 data.
- Validate migration against the local database.
- Do not reset the database.
- Do not modify unrelated domain migrations.

## 9. Documentation

Update:

- OpenAPI documentation.
- AI integration documentation.
- Environment variable documentation.
- Local development instructions.
- Architecture documentation where necessary.

Document provider choice, prompt strategy, failure handling, retries, and cost controls.

## 10. Strict Scope Boundaries

Do not:

- Reimplement Tasks 01–03.
- Modify completed author or ticket APIs unnecessarily.
- Build frontend AI components.
- Implement SSE or email.
- Implement file uploads.
- Automatically send AI responses.
- Add unnecessary abstractions or infrastructure.
- Introduce unsupported BookLeaf business policies.

If an existing implementation already satisfies a requirement, verify it and retain it.

## 11. Final Verification

Run all relevant checks:

- Prisma validation and generation.
- Migration validation/application.
- Database tests.
- AI package tests.
- API tests.
- Worker tests.
- TypeScript typechecks.
- Lint.
- Production builds.
- `git diff --check`.

Inspect the final diff for accidental changes to Tasks 01–03.

Do not claim a check passed unless it actually ran successfully.

## Completion Report

Report:

1. What was already present.
2. What you implemented.
3. Files created and modified.
4. Database migration status.
5. AI provider and configuration.
6. Inngest event and worker behavior.
7. API contract.
8. Tests and actual results.
9. Known limitations.
10. Any remaining blockers.

**Definition of done:** All Task 04 requirements are implemented, integrated, tested, documented, and verified. Do not stop after creating files or scaffolding. Continue until the task is genuinely complete.
