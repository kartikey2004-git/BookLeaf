# Engineering Directive: Complete Task 04 — Gemini-Powered AI Intelligence & Decision Support

You are acting as a Senior Staff Backend Engineer responsible for completing Task 04 of the BookLeaf Publishing Author Support & Communication Portal.

Your job is to take ownership of the existing partially implemented codebase and deliver a fully integrated, tested, documented, production-conscious AI backend using **Google Gemini instead of OpenAI**.

This is an implementation task, not an architecture proposal. Inspect the repository, make the necessary changes, execute verification, and finish the entire scope.

Do not stop at scaffolding.

---

# 1. Existing Project State

The following work has already been completed.

### Existing architecture

- Existing monorepo architecture.
- `@repo/ai` shared package.
- Better Auth authentication.
- Prisma 7 and PostgreSQL.
- Express API.
- Existing Inngest infrastructure.
- Zod validation.
- Existing ticket domain and author/admin APIs.
- Existing test infrastructure.

Inspect the actual repository before making assumptions about paths, package boundaries, or implementation details.

### Existing AI implementation

The `@repo/ai` package currently includes:

- An OpenAI-compatible provider client.
- Server-only API key input.
- Configurable model, base URL, and timeout.
- Typed errors:
  - `AUTH`
  - `RATE_LIMIT`
  - `TIMEOUT`
  - `TRANSIENT`
  - `INVALID_OUTPUT`
- Zod validation for structured model output.
- Central knowledge-base loading.
- Prompt construction using relevant knowledge-base sections.
- Ticket content explicitly treated as untrusted input.

### Remaining incomplete work

1. Gemini provider integration.
2. Environment validation and wiring.
3. Ticket-created Inngest event.
4. Background AI worker.
5. AI persistence and administrator override protection.
6. Admin AI draft endpoint.
7. Tests.
8. Database migration validation and deployment.
9. OpenAPI documentation.
10. Architecture and local development documentation.
11. Complete verification.

---

# 2. Non-Negotiable Engineering Rules

1. Do not restart or recreate Tasks 01–03.
2. Do not replace the existing architecture.
3. Do not introduce a second queue system.
4. Do not duplicate the canonical BookLeaf Knowledge Base.
5. Do not automatically send AI-generated responses to authors.
6. Do not allow AI retries to overwrite administrator decisions.
7. Do not make ticket creation dependent on Gemini availability.
8. Do not expose provider credentials to the frontend.
9. Do not invent BookLeaf policies, account facts, payment dates, or operational actions.
10. Do not introduce unnecessary abstractions or infrastructure.
11. Do not reset or destroy the existing database.
12. Do not leave TODOs or placeholder implementations for required functionality.

Make routine engineering decisions autonomously.

---

# 3. Phase One: Repository Audit

Before implementation, inspect:

- Complete `@repo/ai` package.
- Existing provider client and interfaces.
- Existing Zod output schemas.
- `BOOKLEAF_KNOWLEDGE_BASE.md`.
- Existing environment validation packages.
- Prisma schema and drafted AI migration.
- Ticket creation transaction.
- Existing author and admin ticket APIs.
- Existing authentication and admin authorization middleware.
- Inngest client, event conventions, and worker registration.
- Existing logging and error-handling conventions.
- Existing tests and package scripts.
- OpenAPI generation and documentation structure.

Create an internal implementation checklist.

Determine exactly what is implemented, partially implemented, or missing.

Do not recreate existing functionality simply because it appears in this directive.

---

# 4. Phase Two: Migrate AI Provider to Google Gemini

**Google Gemini is the required provider. OpenAI must not remain the active provider.**

Use Google's official supported server-side Gemini SDK, preferably `@google/genai`, if compatible with the repository's runtime and package conventions.

Do not assume SDK APIs. Inspect the installed version and use its actual supported interfaces.

## Provider requirements

Implement Gemini integration inside `@repo/ai`.

Responsibilities:

- Initialize the Gemini client server-side.
- Read the API key from server-side environment variables.
- Support configurable model selection.
- Support configurable request timeout.
- Generate structured model output.
- Preserve existing Zod validation.
- Normalize provider failures into existing typed errors.

Use configuration similar to:

```env
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_TIMEOUT_MS=
```

Choose an appropriate inexpensive Gemini model for classification and short support drafts. Keep the model configurable instead of hardcoding it throughout the application.

Do not expose the key through `NEXT_PUBLIC_*` variables.

If the current provider implementation uses a generic OpenAI-compatible HTTP endpoint, replace the provider-specific implementation rather than simply changing the base URL.

## Error handling

Maintain these normalized error categories:

| Error          | Meaning                                                 |
| -------------- | ------------------------------------------------------- |
| AUTH           | Invalid or unauthorized provider credentials            |
| RATE_LIMIT     | Provider rate limit or quota restriction                |
| TIMEOUT        | Request exceeded configured timeout                     |
| TRANSIENT      | Temporary provider/network/server failure               |
| INVALID_OUTPUT | Model returned invalid or unparseable structured output |

Requirements:

- Map Gemini SDK/API errors into these categories.
- Retry only transient failures and rate limits where appropriate.
- Use bounded retries and exponential backoff.
- Respect provider retry guidance when available.
- Do not retry authentication failures.
- Do not retry invalid model output indefinitely.
- Do not create nested retry loops between the SDK, application, and Inngest worker.
- Never log API keys.

Document the provider choice and model selection briefly.

---

# 5. Phase Three: Environment Integration

Integrate Gemini configuration into the existing environment validation architecture.

Requirements:

- Server-side only.
- Validate required variables at the appropriate runtime boundary.
- Avoid breaking unrelated applications that do not execute AI functionality.
- Provide clear startup/configuration errors.
- Document all variables in `.env.example` and the appropriate local development documentation.
- Ensure the application can run its test suite without a real Gemini API key.

Do not create competing environment-validation systems.

---

# 6. Phase Four: AI Intelligence Pipeline

Implement three distinct AI capabilities.

## A. Ticket classification

Use the exact assignment categories:

1. Royalty & Payments
2. ISBN & Metadata Issues
3. Printing & Quality
4. Distribution & Availability
5. Book Status & Production Updates
6. General Inquiry

## B. Priority recommendation

Use:

- Critical
- High
- Medium
- Low

The recommendation must be based on the ticket content and relevant context.

Examples from the assignment:

- Royalty not received for six months: higher priority.
- Routine author bio update: lower priority.
- Incorrect ISBN association: high priority and production escalation.

Do not invent a rigid priority policy beyond what is supported by the assignment.

## C. AI response drafting

Generate a professional, empathetic, context-aware response using:

- Original ticket subject and description.
- Relevant book information when available.
- Relevant ticket conversation context when useful.
- Relevant sections from `BOOKLEAF_KNOWLEDGE_BASE.md`.
- Verified application data.

Do not send the entire ticket history or entire knowledge base unnecessarily.

Keep classification, priority, and response drafting independently testable.

## Output validation

Every structured model output must pass Zod validation.

Reject:

- Unsupported categories.
- Unsupported priority values.
- Missing required fields.
- Invalid confidence values if confidence is part of the schema.
- Unexpected output structures.

Do not trust the model's response simply because the SDK returned successfully.

---

# 7. Phase Five: Knowledge Base Integrity

Use `BOOKLEAF_KNOWLEDGE_BASE.md` as the single canonical BookLeaf policy source.

The existing module-relative loading implementation must be retained and verified.

Requirements:

- No duplicated policy summaries in prompts or services.
- Prompt instructions and business policy content must remain separate.
- Select relevant sections per ticket.
- Preserve exact policy values and timelines.
- Treat author-provided ticket content as untrusted data.
- Ignore instructions embedded in ticket descriptions that attempt to change system behavior.
- Do not allow ticket content to override system instructions or BookLeaf policies.

Important policy facts include:

- Royalty split: 80/20.
- Minimum payout: ₹1,000.
- Quarterly royalty calculation.
- Payout within 45 days after quarter ending.
- Printing turnaround: 5–7 business days.
- New distribution listings: 7–10 business days.
- Stock resync: 24–48 hours.
- Metadata updates: 3–5 business days.
- ISBN errors: high priority.
- Verified print defects: free reprint.

Do not fabricate a specific author's payment date, transaction, production status, or completed operational action.

---

# 8. Phase Six: Database Persistence

Inspect the existing drafted migration and Prisma changes.

Complete the AI persistence model only where necessary.

The system must persist enough information to support:

- AI classification recommendation.
- AI priority recommendation.
- AI processing status.
- AI-generated response draft or its appropriate persisted representation.
- Processing timestamps.
- Failure state or useful failure metadata.
- Idempotency and retry safety.

Follow existing schema conventions.

## Critical: Administrator Override Protection

AI recommendations must remain separate from administrator-controlled ticket values.

For example:

- `aiSuggestedCategory` is not the effective category.
- `aiSuggestedPriority` is not the effective priority.
- The administrator's selected category and priority remain authoritative.

A background retry must never silently overwrite a manual override.

Use appropriate transaction boundaries, conditional updates, version checks, or equivalent concurrency controls.

Do not add redundant fields without a concrete requirement.

Validate:

- Nullability.
- Defaults.
- Unique constraints.
- Foreign keys.
- Indexes.
- Migration consistency with Prisma schema.

Apply the migration locally without resetting the database.

Preserve all existing Task 01–03 records.

---

# 9. Phase Seven: Inngest Event and Background Worker

Use the existing Inngest infrastructure.

Do not introduce BullMQ, RabbitMQ, Redis queues, or another job system for this task.

## Event contract

Implement a typed ticket-created event using the existing event naming conventions.

The event should contain the minimum necessary identifiers and metadata.

Avoid passing sensitive or unnecessarily large ticket payloads.

## Ticket creation integration

After a ticket is successfully created:

- Dispatch the AI-processing event.
- Ensure the ticket transaction has committed before processing begins.
- Do not make the ticket creation response depend on Gemini availability.

## Important reliability requirement

Do not ignore the possibility of a lost-event window:

1. Ticket is committed.
2. Event dispatch fails.
3. Ticket remains without AI processing.

Inspect the existing event infrastructure and determine whether it provides sufficient delivery guarantees.

If it does not, implement a transactional outbox or another appropriately small recovery mechanism compatible with the existing architecture.

Do not build a distributed workflow framework.

## Worker responsibilities

The worker should:

1. Receive the ticket-created event.
2. Load the current ticket and relevant book/author context.
3. Build the AI context.
4. Run classification and priority recommendation.
5. Persist recommendations safely.
6. Record processing status.
7. Handle failures and retries.
8. Avoid duplicate results on repeated event execution.

## Idempotency

Ensure repeated events cannot produce conflicting or duplicate persistence writes.

Handle:

- Duplicate event delivery.
- Worker retry after partial failure.
- Ticket deletion.
- Ticket changes while AI processing is running.
- Administrator changes during AI processing.

AI processing must not overwrite administrator-controlled ticket values.

Use bounded retries and useful operational logs.

---

# 10. Phase Eight: Admin AI Draft API

Implement the following endpoint using existing API conventions:

`POST /api/v1/admin/tickets/:ticketId/ai-draft`

## Requirements

- Admin authentication.
- Admin role authorization.
- Ticket existence validation.
- Zod request validation.
- Relevant knowledge-base section selection.
- Gemini response drafting.
- Structured output validation.
- Consistent error responses.
- Appropriate request timeout.
- Safe handling of provider failures.

Return a useful structured response containing the generated draft and any applicable AI recommendations.

Do not automatically send the draft.

Do not create a public ticket message during draft generation.

The admin must be able to review, edit, and explicitly send the response using the existing public-reply endpoint.

Avoid duplicating ticket reply logic.

If the endpoint generates new recommendations, persist them using the same override-safe rules as the background worker.

---

# 11. Phase Nine: Tests

Add meaningful tests using the existing testing infrastructure.

All external Gemini calls must be mocked in normal tests.

No real API key should be required.

## Provider tests

- Successful Gemini response.
- Invalid credentials.
- Rate limiting.
- Timeout.
- Transient provider error.
- Malformed structured response.
- Zod validation failure.
- Retry behavior.

## Knowledge base tests

- Module-relative loading.
- Required section availability.
- Relevant section selection.
- No duplicated policy content.
- Exact policy values and categories.

## Worker tests

- Successful event processing.
- Event dispatch after ticket creation.
- Duplicate event execution.
- Retry after transient failure.
- Invalid model output.
- Ticket deleted during processing.
- Administrator category override preservation.
- Administrator priority override preservation.
- Processing failure persistence.
- Outbox recovery if implemented.

## API tests

- Authorized admin.
- Unauthorized user.
- Missing ticket.
- Valid draft response.
- Invalid model response.
- Gemini unavailable.
- No public reply created automatically.
- Existing admin override remains unchanged.

Use integration tests for actual database constraints and transactions where appropriate.

Avoid tests that only assert that mocked functions were called without verifying important behavior.

---

# 12. Phase Ten: OpenAPI and Documentation

Update the existing OpenAPI documentation.

Document:

- Admin AI draft endpoint.
- Request schema.
- Response schema.
- Authentication and authorization.
- Possible error responses.
- AI processing behavior.
- Gemini configuration.

Update relevant documentation:

- AI architecture.
- Gemini provider choice.
- Prompt strategy.
- Knowledge-base usage.
- Environment variables.
- Local setup.
- Inngest event and worker behavior.
- Retry and failure handling.
- Cost management.
- Known limitations.

Do not create multiple conflicting sources of documentation.

---

# 13. Phase Eleven: Security and Reliability Review

Review the implementation for:

- API key exposure.
- Prompt injection through ticket content.
- Author/admin authorization bypass.
- Cross-author data leakage.
- Sensitive ticket data in logs.
- Unbounded retries.
- Duplicate AI processing.
- Stale worker writes.
- Administrator override loss.
- Public message creation without admin approval.
- Unhandled promise rejections.
- Missing timeout handling.
- Database writes after failed processing.
- Lost-event scenarios.

Fix issues discovered within Task 04 scope.

---

# 14. Phase Twelve: Full Verification

Run all relevant checks from the repository root or the appropriate package boundaries.

At minimum:

1. Prisma generation.
2. Prisma schema validation.
3. Migration deployment against the local database.
4. Database tests.
5. AI package tests.
6. API tests.
7. Worker/Inngest tests.
8. TypeScript typechecks.
9. Lint.
10. Production builds.
11. `git diff --check`.

Inspect the final diff.

Confirm:

- Tasks 01–03 remain intact.
- Existing APIs still behave correctly.
- Gemini is the active provider.
- No OpenAI dependency or configuration remains unnecessarily active.
- No credentials are committed.
- No duplicated BookLeaf policy content exists.
- No automatic public response sending exists.
- No destructive migration was introduced.
- No unrelated refactoring occurred.

Do not claim a check passed unless it actually ran successfully.

If a check cannot run because of an external dependency, report the exact reason and complete all other checks.

---

# 15. Definition of Done

Task 04 is complete only when:

- Gemini integration works through the existing AI package.
- Environment configuration is integrated.
- Classification and priority recommendations work.
- Background processing works through Inngest.
- AI results are persisted safely.
- Administrator overrides are protected.
- The admin AI draft endpoint works.
- AI responses are never automatically sent.
- Migrations are validated and applied locally.
- Tests cover important success and failure paths.
- OpenAPI and documentation are updated.
- Relevant checks pass.
- The final diff has been reviewed.

Do not stop at scaffolding or partial implementation.

---

# 16. Final Engineering Report

At completion, provide:

1. Initial repository findings.
2. Gemini integration details and selected model.
3. Environment variables added.
4. AI classification and priority implementation.
5. Database schema and migration changes.
6. Inngest event and worker architecture.
7. Idempotency and retry guarantees.
8. Administrator override protection.
9. Admin AI draft API contract.
10. Tests added and actual results.
11. Migration application result.
12. Typecheck, lint, and build results.
13. Files created and modified.
14. Remaining limitations or blockers.

Also provide the final Git diff summary.

**Execute the complete Task 04 implementation now. Do not ask me to approve routine decisions. Do not move to Task 05. Do not commit changes.**
