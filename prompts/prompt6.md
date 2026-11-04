# Engineering Task 04: Production-Oriented AI Intelligence Layer

Act as a Senior/Staff Software Engineer responsible for implementing the AI intelligence capabilities of the BookLeaf Author Support & Communication Portal.

You are extending an existing application. Your responsibility is to integrate AI into the established ticket domain without compromising existing business correctness, security, reliability or maintainability.

## EXISTING SYSTEM

The following milestones are implemented:

### Data Foundation

- Prisma 7 and PostgreSQL.
- Author, Book, Platform and BookDistribution models.
- Validated and idempotent sample dataset import.
- 10 authors, 18 books and 46 distribution associations.

### Authentication

- Better Auth.
- User roles: AUTHOR and ADMIN.
- Author-to-user identity mapping.
- Protected author resource APIs.

### Ticket Domain

- Ticket, TicketMessage, TicketInternalNote and TicketAuditEvent.
- Author ticket creation, listing, details and replies.
- Admin queue, details, status, priority, category and assignment operations.
- Explicit ticket state machine.
- Optimistic concurrency checks.
- Transactional mutations and audit events.
- Author ownership enforcement.
- Private-note isolation.

### Existing Infrastructure

- Next.js frontend.
- Express API.
- Existing worker infrastructure, including Inngest where already configured.
- Prisma 7.
- PostgreSQL.
- Zod.
- Better Auth.
- pnpm monorepo.
- Vitest.

These are existing components, not instructions to recreate them.

# PHASE 1 — REPOSITORY DISCOVERY

Before implementation, inspect the current codebase thoroughly.

Inspect:

1. Existing architecture and package boundaries.
2. Current worker implementation and Inngest configuration.
3. Ticket domain models and service layer.
4. Ticket category and priority enums.
5. Existing admin authorization.
6. Existing transaction and optimistic concurrency patterns.
7. Environment configuration.
8. Existing AI SDKs or provider integrations, if any.
9. Logging, retry and error-handling conventions.
10. Existing testing and documentation.

Determine what can be reused.

Do not create another worker, queue, database package or AI abstraction if the existing infrastructure already supports the requirement.

Produce an implementation plan based on actual repository findings, then execute it.

# PHASE 2 — AI DOMAIN DESIGN

Design AI capabilities as an independent intelligence layer.

The system must support three distinct operations:

1. Ticket classification.
2. Ticket priority recommendation.
3. AI-generated response drafting.

Separate AI-generated suggestions from authoritative business values.

An AI recommendation must never silently overwrite a human decision.

Evaluate the existing schema and determine how to persist:

- Suggested category.
- Suggested priority.
- Classification confidence.
- Priority reasoning.
- AI processing status.
- Model/provider metadata.
- Processing timestamps.
- Error/retry information where useful.
- Human override information.

Use the smallest appropriate schema changes.

Avoid unnecessary AI-specific tables if existing models can support the requirements cleanly.

The data model must distinguish:

- AI suggestion.
- Effective ticket category.
- Effective ticket priority.
- Human override.

An AI retry must never overwrite an existing admin override.

# PHASE 3 — PROVIDER INTEGRATION

Inspect the existing AI infrastructure before selecting a provider.

If no provider integration exists, choose a cost-effective model suitable for structured classification and professional response drafting.

Requirements:

- Server-side API key management.
- No API keys in frontend code.
- Configurable model and provider.
- Explicit request timeouts.
- Structured output validation using Zod.
- Bounded input and output tokens.
- Appropriate rate-limit handling.
- Provider-independent business logic.
- Useful structured logs.

Do not introduce a complex multi-provider framework unless the actual requirements justify it.

Document model selection and reasoning.

# PHASE 4 — KNOWLEDGE BASE

Use the exact BookLeaf Knowledge Base provided in the assignment.

Create a centralized, version-controlled source of truth for:

- Company overview.
- Royalty policy.
- ISBN policy.
- Printing and quality.
- Distribution and availability.
- Production stages.
- Communication tone.
- Sample query-response examples.

Inspect whether a knowledge-base representation already exists.

Do not duplicate the same business policies across multiple prompts or source files.

Implement a lightweight retrieval strategy appropriate to the small, static knowledge base.

For this assignment, avoid introducing vector databases, embeddings or RAG infrastructure without a concrete need.

Select only relevant policy sections for each operation.

The AI must distinguish between:

1. General BookLeaf policies.
2. Actual author/book/ticket data.
3. Information that is unavailable and requires investigation.

Never fabricate:

- Royalty payout dates.
- Actual payment status.
- Production progress.
- ISBN corrections.
- Distribution synchronization results.
- Actions that the system has not actually performed.

# PHASE 5 — AUTOMATIC TICKET CLASSIFICATION

When a ticket is created, trigger asynchronous AI classification.

Supported categories:

- ROYALTY_AND_PAYMENTS
- ISBN_AND_METADATA
- PRINTING_AND_QUALITY
- DISTRIBUTION_AND_AVAILABILITY
- BOOK_STATUS_AND_PRODUCTION
- GENERAL_INQUIRY

The classifier should return structured output containing:

- Suggested category.
- Confidence score.
- Short reasoning.
- Relevant knowledge-base section identifiers.

Requirements:

- Use constrained structured output.
- Validate all model output.
- Handle ambiguous queries.
- Use GENERAL_INQUIRY as a safe fallback when classification is uncertain.
- Do not allow arbitrary model-generated enum values.
- Preserve admin overrides.

Do not make classification a synchronous dependency of ticket creation.

# PHASE 6 — AUTOMATIC PRIORITY SCORING

Implement AI-assisted priority recommendation.

Supported priorities:

- CRITICAL
- HIGH
- MEDIUM
- LOW

The model should evaluate:

- Severity of the issue.
- Financial impact.
- Operational impact.
- Potential author harm.
- Urgency.
- Time sensitivity.
- Business policy context.

Examples:

- Royalty not received for six months: HIGH or CRITICAL depending on circumstances.
- Incorrect ISBN associated with a published book: HIGH.
- Defective printed copies: HIGH or MEDIUM depending on severity.
- Book unavailable on a distribution platform: MEDIUM or HIGH depending on impact.
- Author bio update: LOW.

Do not simply ask the model to assign a number without providing criteria.

Return:

- Suggested priority.
- Confidence.
- Short explanation.
- Supporting signals.

Keep the AI suggestion separate from effective priority.

Document how uncertain cases are handled.

# PHASE 7 — ASYNCHRONOUS PROCESSING

Use the existing durable worker infrastructure.

When a ticket is created:

1. Ticket is persisted successfully.
2. A processing event is triggered.
3. Worker performs classification.
4. Worker performs priority recommendation.
5. Results are validated.
6. AI suggestions are persisted.
7. Processing status is updated.
8. Admin-facing ticket data can expose the recommendations.

The workflow must be recoverable.

Requirements:

- Idempotent processing.
- Safe retries.
- Bounded retry attempts.
- Exponential backoff where supported.
- Provider rate-limit handling.
- Timeout handling.
- No duplicate AI analysis records.
- No lost ticket when the AI provider is unavailable.

Consider concurrent ticket updates and admin overrides.

Use conditional writes or appropriate optimistic concurrency controls.

Do not assume that receiving an event guarantees exactly-once processing.

The database remains the source of truth.

# PHASE 8 — AI-GENERATED RESPONSE DRAFTING

When an admin requests a draft, generate a response based on:

1. Original ticket description.
2. Relevant public conversation history.
3. Relevant BookLeaf Knowledge Base sections.
4. Actual available author/book information.
5. Current ticket context.

The output should sound like a real BookLeaf support representative.

Communication rules:

- Empathetic and professional.
- Acknowledge the concern first.
- Be specific.
- Explain relevant policies accurately.
- Own BookLeaf mistakes directly where applicable.
- Give realistic investigation timelines when appropriate.
- Never invent completed actions.
- End with a clear next step.

The draft must be editable.

AI must never automatically send the response.

Implement an admin-protected API endpoint following existing route conventions.

For example:

POST /api/v1/admin/tickets/:ticketId/ai-draft

Requirements:

- ADMIN authorization.
- Ticket existence validation.
- Context construction.
- Token budgeting.
- Structured validation where appropriate.
- Provider error handling.
- No automatic message persistence as a sent response.
- No automatic ticket status changes.

An admin must explicitly send the final edited message through the existing public-message endpoint.

# PHASE 9 — PROMPT ENGINEERING

Maintain centralized, versioned prompts.

Avoid scattered prompt strings inside controllers and workers.

Separate prompts for:

- Classification.
- Priority recommendation.
- Response drafting.

Use clear sections for:

- Role.
- Task.
- Trusted policy context.
- Untrusted author input.
- Output schema.
- Constraints.
- Safety instructions.

Treat ticket descriptions and messages as untrusted data.

Defend against prompt injection attempts contained inside author messages.

The model must never interpret author-supplied content as system instructions.

Do not expose internal prompts or sensitive operational context through public APIs.

# PHASE 10 — COST AND PERFORMANCE MANAGEMENT

Implement practical cost controls.

Consider:

- Token budgets.
- Relevant context selection.
- Conversation truncation.
- Prompt versioning.
- Model selection.
- Avoiding unnecessary repeated calls.
- Avoiding duplicate analysis.
- Request timeouts.
- Logging model usage where available.

Do not send the entire ticket history unnecessarily.

Do not regenerate classification every time an admin opens a ticket.

Document the estimated cost assumptions and optimization strategy without inventing exact provider pricing.

# PHASE 11 — FAILURE AND DEGRADATION

Explicitly handle:

1. AI provider unavailable.
2. API key missing.
3. Invalid model output.
4. Rate limits.
5. Request timeout.
6. Worker crash.
7. Duplicate event delivery.
8. Retry after partial completion.
9. Admin override during AI processing.
10. Ticket updated while a draft is being generated.

Expected behavior:

- Ticket creation always works independently.
- AI processing failure is observable.
- Admins can still manually classify tickets.
- Admins can still manually assign priority.
- Admins can write responses without AI.
- AI failure never blocks ticket resolution.
- Failed AI processing can be retried safely.

Do not return fake successful AI output when the provider fails.

# PHASE 12 — TESTING

Use the existing Vitest infrastructure.

Test:

### Classification

- Correct category for royalty queries.
- Correct category for ISBN issues.
- Correct category for printing issues.
- Ambiguous query handling.
- Invalid structured output.
- Prompt injection attempts.

### Priority

- Financial urgency.
- ISBN severity.
- Quality issues.
- Low-priority general inquiries.
- Invalid model responses.

### Worker reliability

- Duplicate event delivery.
- Retry behavior.
- Provider failure.
- Partial processing.
- Admin override preservation.
- Concurrent updates.

### Response generation

- Correct knowledge-base context.
- Correct communication tone.
- No invented author-specific information.
- No automatic sending.
- Admin authorization.
- Provider timeout and fallback.

Mock external AI providers in automated tests.

Do not make real LLM API calls part of the normal test suite.

# PHASE 13 — OBSERVABILITY

Record useful operational metadata:

- AI operation.
- Ticket identifier.
- Provider.
- Model.
- Prompt version.
- Processing duration.
- Token usage.
- Success/failure.
- Retry count.
- Error category.

Never log:

- API keys.
- Full sensitive author information.
- Unnecessary private conversation content.

Use existing structured logging infrastructure.

# PHASE 14 — DOCUMENTATION

Update architecture and AI documentation.

Explain:

- AI pipeline architecture.
- Worker execution.
- Provider selection.
- Prompt strategy.
- Knowledge-base usage.
- Classification logic.
- Priority reasoning.
- Human override semantics.
- Idempotency and retries.
- Cost controls.
- Failure handling.
- Local environment setup.

# SCOPE RESTRICTIONS

Do not implement:

- Frontend AI UI.
- SSE or WebSockets.
- Email notifications.
- File upload.
- Automatic sending of AI-generated replies.
- Unnecessary RAG/vector infrastructure.
- Unnecessary new queues or workers.

Keep the implementation focused on backend AI intelligence.

# DEFINITION OF DONE

1. Ticket classification works asynchronously.
2. Priority recommendations work asynchronously.
3. AI suggestions are separate from human decisions.
4. Admins can request response drafts.
5. Drafts use the provided BookLeaf Knowledge Base.
6. AI never invents author-specific facts.
7. AI failures do not affect ticket operations.
8. Worker processing is idempotent and retry-safe.
9. Prompt injection is handled.
10. Cost and usage are observable.
11. Automated tests cover failure scenarios.
12. Documentation reflects actual implementation.
13. Existing ticket workflows remain intact.

# FINAL ENGINEERING REPORT

Report:

1. Existing infrastructure reused.
2. AI provider and model selection.
3. Database changes.
4. Knowledge-base implementation.
5. Prompt architecture.
6. Classification implementation.
7. Priority implementation.
8. Response drafting implementation.
9. Worker execution and retry strategy.
10. Human override protection.
11. Cost-control strategy.
12. Test results.
13. Remaining limitations.
14. Recommended next milestone.

Inspect first, make decisions based on the actual repository, and then implement the complete task.

Do not rewrite working ticket infrastructure or introduce complexity merely to demonstrate architectural sophistication.
