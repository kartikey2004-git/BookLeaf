# Engineering Task 03: Ticket Domain & Support Operations

You are acting as a Senior Software Engineer responsible for implementing the core support ticket management system for the BookLeaf Author Support & Communication Portal.

The previous milestones are complete:

## Existing Foundation

- Prisma 7 + PostgreSQL.
- Better Auth authentication.
- User roles: AUTHOR and ADMIN.
- Author-to-user identity mapping through Author.userId.
- Express REST API.
- Zod validation.
- Vitest testing infrastructure.
- OpenAPI documentation.
- pnpm monorepo.
- Author resource APIs.
- Validated and idempotent sample-data seed pipeline.

Your responsibility is to implement the complete ticket lifecycle and communication domain on top of this existing foundation.

Do not rebuild existing infrastructure.

---

# PHASE 1 — Repository Discovery

Before implementation, inspect:

1. Existing Prisma schema and migrations.
2. Better Auth session and role implementation.
3. Author identity and ownership middleware.
4. Existing API route and service architecture.
5. Existing error-handling conventions.
6. Existing Zod contracts.
7. Existing database transaction patterns.
8. Existing OpenAPI documentation.
9. Existing tests and fixtures.
10. Existing logging and configuration.

Understand how previous milestones were implemented.

Reuse existing abstractions and conventions.

Do not introduce unnecessary dependencies or restructure the monorepo.

# PHASE 2 — Design the Ticket Domain

Design a relational domain model that supports the following entities:

## Ticket

Required business attributes:

- Internal ID.
- Human-readable ticket reference.
- Author relationship.
- Optional book relationship.
- Subject.
- Description.
- Category.
- Priority.
- Status.
- Assigned admin.
- Created timestamp.
- Updated timestamp.
- Resolved timestamp.
- Closed timestamp.

## TicketMessage

Represents communication visible to the author and support team.

Attributes:

- ID.
- Ticket relationship.
- Sender user.
- Message content.
- Created timestamp.
- Optional edited timestamp.

Messages must preserve their sender identity.

## TicketInternalNote

Represents private operational communication.

Attributes:

- ID.
- Ticket relationship.
- Admin author.
- Note content.
- Created timestamp.

Internal notes must never be returned through author-facing APIs.

## TicketAuditEvent

Track important ticket operations:

- Ticket creation.
- Status changes.
- Priority changes.
- Category changes.
- Assignment changes.
- Admin responses.
- Internal note creation.
- Resolution and closure.

Record actor, action, timestamp and relevant change metadata.

Avoid storing unnecessary sensitive information.

## Modeling decisions

Evaluate whether additional entities are genuinely necessary.

Do not create abstractions simply for theoretical extensibility.

Keep the domain normalized and consistent with existing Prisma conventions.

# PHASE 3 — Define Domain Rules

Before writing API handlers, establish explicit business invariants.

## Ticket ownership

- Every ticket belongs to exactly one author.
- A ticket may optionally reference one of that author's books.
- General / Account Level tickets must support a null book relationship.
- A ticket cannot reference another author's book.
- Authors cannot change ticket ownership.
- Admins can access all tickets.

## Ticket categories

Implement the assignment's categories:

- ROYALTY_AND_PAYMENTS
- ISBN_AND_METADATA
- PRINTING_AND_QUALITY
- DISTRIBUTION_AND_AVAILABILITY
- BOOK_STATUS_AND_PRODUCTION
- GENERAL_INQUIRY

## Priority

Support:

- CRITICAL
- HIGH
- MEDIUM
- LOW

## Status

Support:

- OPEN
- IN_PROGRESS
- RESOLVED
- CLOSED

Define explicit allowed state transitions.

Do not allow arbitrary status mutations.

Document decisions around reopening resolved tickets and handling replies to closed tickets.

## Human ownership

- Admins can assign tickets to themselves.
- Admins can reassign tickets.
- Authors cannot modify assignment.
- Assignment must reference an authorized admin user.

Do not allow AI-generated fields to override manual decisions in future integrations.

# PHASE 4 — Author Ticket APIs

Implement authenticated author-facing REST endpoints.

### POST /api/v1/author/tickets

Create a ticket.

Input:

- Optional bookId.
- Subject.
- Description.

Requirements:

- Resolve author from the verified session.
- Never accept authorId as an ownership authority.
- Validate book ownership when bookId is supplied.
- Support general/account-level tickets.
- Persist the ticket.
- Generate a unique human-readable ticket reference.
- Return the created ticket.

Ticket creation must not depend on any external AI provider.

### GET /api/v1/author/tickets

List tickets belonging exclusively to the authenticated author.

Support:

- Pagination.
- Status filtering.
- Deterministic sorting.
- Useful summary fields.

### GET /api/v1/author/tickets/:ticketId

Return ticket details including:

- Original query.
- Book association.
- Status.
- Category.
- Priority.
- Public conversation history.
- Relevant timestamps.

Never expose internal notes, private audit metadata or another author's resources.

### POST /api/v1/author/tickets/:ticketId/messages

Allow an author to respond to an existing ticket when permitted by the lifecycle rules.

Verify ticket ownership.

Persist messages before publishing any future realtime event.

Do not allow authors to submit internal notes.

# PHASE 5 — Admin Ticket APIs

Implement role-protected admin REST endpoints.

### GET /api/v1/admin/tickets

Build an operational ticket queue.

Support filtering by:

- Status.
- Category.
- Priority.
- Creation date.
- Assigned admin.

Support pagination and deterministic ordering.

The queue should prioritize urgent and older unresolved tickets.

Avoid loading entire message histories in queue queries.

### GET /api/v1/admin/tickets/:ticketId

Return ticket details including:

- Author information.
- Associated book.
- Original description.
- Public messages.
- Internal notes.
- Assignment.
- Category and priority.
- Audit history.

### PATCH /api/v1/admin/tickets/:ticketId/status

Update ticket status through validated domain transitions.

### PATCH /api/v1/admin/tickets/:ticketId/priority

Allow admins to override priority.

### PATCH /api/v1/admin/tickets/:ticketId/category

Allow admins to override category.

### PATCH /api/v1/admin/tickets/:ticketId/assignment

Allow admins to assign or reassign tickets.

### POST /api/v1/admin/tickets/:ticketId/messages

Allow admins to send public responses to authors.

### POST /api/v1/admin/tickets/:ticketId/internal-notes

Allow admins to create private internal notes.

All admin routes must verify ADMIN authorization server-side.

# PHASE 6 — Transactional Correctness

Pay special attention to consistency.

Operations that update ticket state and create corresponding audit events should have appropriate transactional guarantees.

Consider:

- Concurrent admin updates.
- Duplicate message submissions.
- Duplicate ticket creation requests.
- Invalid state transitions.
- Assignment races.
- Concurrent ticket reference generation.

Do not introduce distributed transactions.

Use PostgreSQL constraints and transactions where appropriate.

Consider optimistic concurrency only where it provides real value.

Do not claim that an operation is idempotent without implementing and testing the guarantee.

# PHASE 7 — API Contracts

Use the existing Zod infrastructure.

Requirements:

- Strict input validation.
- Consistent response contracts.
- Standardized error responses.
- Pagination validation.
- Enum validation.
- Proper HTTP status codes.
- Safe serialization.
- OpenAPI documentation.

Never expose:

- Password hashes.
- Authentication internals.
- Private internal notes to authors.
- Unauthorized audit metadata.
- Other authors' personal information.

# PHASE 8 — Testing

Use existing Vitest infrastructure.

Implement tests covering:

## Author workflows

- Author creates a general ticket.
- Author creates a book-specific ticket.
- Author cannot create a ticket against another author's book.
- Author sees only their tickets.
- Author cannot retrieve another author's ticket.
- Author can respond to their ticket.
- Author cannot create internal notes.
- Author cannot change assignment or priority.

## Admin workflows

- Non-admin users cannot access admin endpoints.
- Admin can list tickets across authors.
- Admin can view ticket details.
- Admin can assign tickets.
- Admin can change status.
- Admin can override category and priority.
- Admin can send public messages.
- Admin can create internal notes.

## Domain correctness

- Invalid status transitions are rejected.
- Ticket references remain unique.
- Audit events are persisted correctly.
- Failed transactions do not leave partial updates.
- Concurrent updates do not silently lose changes.
- Internal notes never leak into author responses.
- Pagination and filtering work correctly.

Test security at the actual HTTP boundary, not only through mocked service functions.

# PHASE 9 — Documentation

Update existing documentation.

Include:

1. Ticket domain model.
2. Entity relationships.
3. Ticket state machine.
4. Author and admin authorization boundaries.
5. API endpoints.
6. Message visibility rules.
7. Assignment behavior.
8. Transaction boundaries.
9. Known limitations.

Update OpenAPI documentation.

# PHASE 10 — Explicit Scope Boundaries

Do not implement:

- AI classification.
- AI priority generation.
- AI response generation.
- SSE or WebSocket infrastructure.
- Email notifications.
- File upload infrastructure.
- Frontend dashboard redesign.
- Additional queue infrastructure.

These will be handled in subsequent engineering milestones.

Keep the domain ready for future AI integration without prematurely implementing AI-specific infrastructure.

# DEFINITION OF DONE

The task is complete when:

1. Ticket domain is implemented.
2. Authors can create and view their own tickets.
3. Authors can respond to permitted tickets.
4. Admins can manage all tickets.
5. Assignment works correctly.
6. Status transitions are enforced.
7. Category and priority overrides work.
8. Public messages and private notes are isolated.
9. Audit events are recorded.
10. Ownership and role authorization are tested.
11. OpenAPI documentation is updated.
12. Existing functionality remains intact.
13. Relevant tests, typechecks, lint and build pass.

# FINAL ENGINEERING REPORT

Report:

1. Existing architecture reused.
2. Domain modeling decisions.
3. Database migrations.
4. Files created and modified.
5. Author APIs implemented.
6. Admin APIs implemented.
7. Authorization strategy.
8. Transaction and concurrency decisions.
9. Test execution results.
10. Known limitations.
11. Recommended next milestone.

Execute the complete task after repository discovery.

Do not stop at producing an implementation plan.

Think like an engineer responsible for the correctness and long-term maintainability of a production support system.
