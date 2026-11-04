# Engineering Task 02: Author Identity, Authorization & Resource APIs

Act as a Senior Software Engineer continuing the existing BookLeaf Author Support & Communication Portal.

Task 01 has been implemented:

- Prisma 7 + PostgreSQL domain models
- 10 authors and 18 books seeded
- 46 book distribution associations
- Zod validation and idempotent seed pipeline
- Optional `Author.userId` mapping to Better Auth
- Existing tests and infrastructure

Your responsibility is to implement the authenticated author resource layer using the existing architecture.

## Phase 1 — Mandatory Repository Inspection

Before making changes:

1. Inspect the current repository and relevant architecture documentation.
2. Read the existing Better Auth server/client configuration.
3. Inspect Prisma Author, Book, Platform and BookDistribution models.
4. Inspect the existing Express API routing conventions.
5. Identify existing session validation, middleware, errors and Zod contracts.
6. Inspect test patterns and existing authorization utilities.
7. Review the Task 01 implementation and its limitations.

Do not trust this prompt as a substitute for inspecting the actual codebase.

Reuse existing infrastructure. Do not introduce another authentication system or restructure the monorepo.

## Phase 2 — Establish Author Identity

Implement a reliable mapping:

Authenticated Better Auth User → Author.userId → Author record.

Requirements:

- Every protected author request must derive user identity from the verified server-side session.
- Never trust an author ID supplied by the frontend for determining ownership.
- Never resolve ownership from email alone during resource requests.
- Reject unauthenticated requests with 401.
- Handle authenticated users without linked Author records explicitly.
- Prevent multiple author records from being linked to the same user.
- Preserve the existing optional one-to-one database relationship.

Inspect whether the existing authentication configuration supports roles.

If roles are absent, introduce only the minimum role model necessary to distinguish AUTHOR and ADMIN, consistent with Better Auth conventions.

Do not create a parallel role system unnecessarily.

## Phase 3 — Author Account Provisioning

The dataset contains authors but no authentication credentials.

Design and implement a safe, deterministic development account provisioning strategy.

Requirements:

- Reuse Better Auth's supported account creation mechanisms.
- Never insert handcrafted password hashes or authentication sessions.
- Never hardcode shared production credentials.
- Never automatically link accounts based solely on matching email during ordinary login.
- Provisioning must explicitly establish the Author.userId relationship.
- Existing links must not be overwritten silently.
- Provisioning must be idempotent.
- Demo credentials must be development-only and documented appropriately.

Do not introduce public author self-registration that automatically grants access to seeded records.

## Phase 4 — Author Resource APIs

Implement the following authenticated REST endpoints, adapting route names to established repository conventions.

### GET /api/v1/author/me

Return the authenticated author's profile.

### GET /api/v1/author/books

Return books belonging exclusively to the authenticated author.

Support sensible pagination and deterministic ordering.

### GET /api/v1/author/books/:bookId

Return a single book belonging to the authenticated author.

Include:

- Book metadata
- Publication status
- ISBN
- Sales information
- Royalty summary
- Distribution platforms

Return 404 for inaccessible or nonexistent book resources to avoid leaking ownership information.

### GET /api/v1/author/overview

Return an author dashboard summary using existing persisted data.

Possible fields:

- Total books
- Published books
- Books in production
- Total copies sold
- Total royalty earned
- Total royalty paid
- Total royalty pending

Do not invent missing business data.

Use database aggregation where appropriate.

## Phase 5 — Application Architecture

Follow the repository's established layering and dependency rules.

Separate responsibilities:

- Routes: HTTP wiring.
- Middleware: authentication and authorization.
- Validation: request contracts.
- Services: business operations.
- Repository/data access: Prisma queries.
- Presenters/serializers: safe API responses, where the existing architecture supports them.

Avoid unnecessary abstractions.

Ensure all resource queries enforce author ownership at the database query boundary.

Never fetch arbitrary author resources and rely solely on frontend filtering.

## Phase 6 — API Contracts

Use existing Zod infrastructure.

Implement:

- Request validation.
- Response contracts where appropriate.
- Consistent HTTP status codes.
- Standardized error responses.
- Pagination validation.
- Stable response shapes.
- OpenAPI documentation using existing tooling.

Avoid exposing internal authentication fields or unrelated user information.

## Phase 7 — Security & Failure Scenarios

Explicitly handle:

1. Missing session.
2. Expired session.
3. Invalid session.
4. Authenticated user without Author mapping.
5. User attempting to access another author's book.
6. Unknown book ID.
7. Malformed pagination parameters.
8. Duplicate or conflicting author-account linkage.
9. Concurrent provisioning attempts.
10. Database failures.

Do not expose sensitive internal error details to API consumers.

## Phase 8 — Tests

Use the existing Vitest setup.

Cover:

- Unauthenticated requests return 401.
- Authenticated author can retrieve their profile.
- Author can retrieve only their books.
- Author cannot retrieve another author's book.
- Unknown book returns 404.
- Overview aggregates are correct.
- Pagination is deterministic.
- Unlinked accounts cannot access author resources.
- Provisioning is idempotent.
- Conflicting account linkage is rejected.

Test authorization at the HTTP/API boundary, not only through mocked service calls.

## Phase 9 — Verification

Run the existing repository checks:

- Prisma validation.
- Relevant database tests.
- Auth tests.
- API tests.
- Typechecks.
- Lint.
- Build where practical.
- Git diff check.

Report actual results. Never claim success for checks that were not executed.

## Phase 10 — Documentation

Update existing documentation with:

- Authentication-to-author mapping.
- Account provisioning strategy.
- Authorization boundaries.
- API endpoint contracts.
- Local demo account setup.
- Security assumptions.
- Known limitations.

## Constraints

- No ticket implementation yet.
- No admin dashboard.
- No AI integration.
- No frontend redesign.
- No new infrastructure unless strictly necessary.
- No unnecessary database migrations.
- No changes to working seed behavior without justification.
- No unrelated cleanup or refactoring.
- No hardcoded production credentials.

Make reasonable implementation decisions autonomously.

## Definition of Done

The task is complete when:

1. Authenticated users are securely mapped to authors.
2. Development/demo accounts can be provisioned safely.
3. Author profile API works.
4. Author books API works.
5. Book details API works.
6. Author overview API works.
7. Cross-author access is prevented.
8. API contracts are documented.
9. Tests pass.
10. Existing baseline functionality remains intact.

## Final Report

Provide:

1. Repository components reused.
2. Files created or modified.
3. Authentication and role decisions.
4. Account provisioning implementation.
5. API endpoints implemented.
6. Authorization strategy.
7. Tests executed and results.
8. Remaining limitations.
9. Recommended Task 03.

Implement the complete task after repository discovery. Do not stop at planning or ask for confirmation unless a genuinely blocking decision cannot be safely inferred.
