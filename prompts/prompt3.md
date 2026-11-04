# Engineering Task 01: Repository Discovery & Sample Dataset Foundation

You are acting as a Senior Software Engineer responsible for implementing the data foundation of the BookLeaf Author Support & Communication Portal.

Your first responsibility is to understand the existing repository. Do not assume its structure, technology choices, conventions, abstractions, or implementation details.

## PHASE 1 — Repository Discovery (MANDATORY)

Before changing anything, inspect the existing codebase thoroughly.

Examine:

1. Repository directory structure.
2. Existing architecture and application boundaries.
3. Package manager, workspace configuration and scripts.
4. Prisma schema, migrations and database configuration.
5. Existing Better Auth configuration and user model.
6. Existing API architecture, routing, middleware and validation.
7. Existing shared packages and their responsibilities.
8. Existing TypeScript, ESLint and formatting conventions.
9. Existing seed scripts and database utilities.
10. Existing testing infrastructure.
11. Environment variable management.
12. Existing documentation and architecture decisions.

Inspect relevant files rather than relying exclusively on filenames.

Understand how the existing system works before deciding where anything belongs.

### Discovery Rules

- Do not recreate existing infrastructure.
- Do not introduce alternative libraries when equivalent infrastructure already exists.
- Do not restructure the repository.
- Do not modify authentication unnecessarily.
- Do not introduce new applications or packages without a concrete architectural reason.
- Reuse existing abstractions and conventions.
- Identify incomplete, conflicting or problematic implementations.
- Distinguish existing functionality from planned functionality.

First produce an internal understanding of the repository and its current state.

## PHASE 2 — Define the Data Domain

The first implementation task is integrating the BookLeaf sample dataset into the existing application.

The provided dataset contains:

- 10 authors.
- 18 books.
- Author identity and contact information.
- Book publication information.
- Sales figures.
- Royalty information.
- Distribution platform information.
- Print partner information.

Inspect the actual JSON file available in the repository.

Do not assume that the sample excerpt represents the complete dataset.

Understand the relationships and determine the appropriate database representation.

Evaluate the following domain entities:

- Author
- Book
- Book distribution/platform availability
- Royalty information
- User-to-author identity mapping

Do not create unnecessary entities. Choose the simplest normalized representation that supports the assignment requirements and foreseeable business workflows.

## PHASE 3 — Data Modeling Decisions

Before implementation, evaluate:

### Author
- Internal primary key.
- External author identifier.
- Name.
- Email.
- Phone.
- City.
- Joined date.

### Book
- Internal primary key.
- External book identifier.
- Author relationship.
- Title.
- ISBN.
- Genre.
- Publication date.
- Publication status.
- MRP.
- Print partner.

### Sales and Royalties
- Total copies sold.
- Royalty per copy.
- Total royalty earned.
- Royalty paid.
- Royalty pending.
- Last royalty payout date.

### Distribution
- Book-to-platform relationship.
- Unique platform association per book.

Preserve the original source identifiers and all supplied values.

Consider:
- Appropriate database types.
- Decimal and monetary precision.
- Date-only semantics.
- Unique constraints.
- Foreign keys.
- Useful indexes.
- Referential integrity.
- Future extensibility.

Do not introduce a royalty ledger or quarterly accounting system unless the existing requirements justify it. Document any future considerations separately.

## PHASE 4 — Authentication Integration

Inspect the existing Better Auth implementation.

Determine how seeded authors should be associated with authenticated application users.

Requirements:

- Preserve the existing authentication architecture.
- Do not invent credentials.
- Do not expose or hardcode passwords.
- Maintain a clear distinction between authentication identity and author business identity.
- Ensure author records cannot be accessed by another author.
- Admin access must remain compatible with the existing role system.

If account provisioning requires a decision that cannot safely be inferred, document the decision and implement only the safe data-layer portion.

## PHASE 5 — Implement the Seed Pipeline

After completing discovery and data modeling, implement the sample dataset integration.

Requirements:

1. Validate the complete JSON dataset before importing it.
2. Normalize the nested author/book structure.
3. Import authors.
4. Import books with correct author relationships.
5. Import distribution platforms.
6. Preserve every provided field and value.
7. Make seed execution repeatable and idempotent.
8. Use transactions where appropriate.
9. Provide meaningful validation and database errors.
10. Avoid destructive operations.
11. Avoid overwriting unrelated user-generated records.
12. Use the repository's existing database and Prisma conventions.

The import must be deterministic.

Running the seed multiple times must not create duplicate authors, books or platform associations.

Do not silently discard malformed records.

## PHASE 6 — Integrity Verification

Implement verification for the following invariants:

- Every book belongs to an existing author.
- Author external IDs are unique.
- Book external IDs are unique.
- Distribution associations are not duplicated.
- Monetary values use appropriate precision.
- Royalty paid and pending values reconcile with total earned for the supplied records.
- No negative royalty balances exist unless explicitly supported by source data.

Do not silently modify inconsistent source data to make validation pass.

Report discrepancies explicitly.

After seeding, provide a summary containing:

- Authors imported.
- Books imported.
- Distribution associations imported.
- Records updated.
- Validation failures.
- Integrity verification results.

Do not log sensitive author information.

## PHASE 7 — Tests

Add tests using the existing testing infrastructure.

Cover:

- Complete dataset validation.
- Nested JSON normalization.
- Duplicate external identifiers.
- Missing author references.
- Royalty reconciliation.
- Idempotent seed execution.
- Correct author-book relationships.
- Distribution mapping.
- Protection against accidental destructive updates.

Do not introduce a new testing framework unnecessarily.

## PHASE 8 — Engineering Documentation

Update the relevant documentation with:

1. Final data model and relationships.
2. Important schema decisions.
3. Seed execution instructions.
4. Idempotency strategy.
5. Data integrity rules.
6. Authentication-to-author mapping decisions.
7. Known limitations and assumptions.

Keep documentation consistent with actual implementation.

## EXECUTION RULES

- First inspect, then decide, then implement.
- Do not stop after generating an audit report.
- Do not ask for confirmation for ordinary implementation decisions.
- Do not make unrelated architectural changes.
- Do not rewrite working baseline infrastructure.
- Do not generate mock data when the supplied dataset is available.
- Do not silently skip requirements.
- Do not claim tests passed unless they were actually executed.
- Fix issues introduced by your implementation.
- Preserve existing project conventions.

If an essential decision cannot be safely inferred, explain the blocker and complete all independent work that can safely proceed.

## DEFINITION OF DONE

This task is complete only when:

1. Existing architecture has been understood and reused.
2. Data modeling is implemented.
3. Complete sample dataset is imported.
4. All 10 authors and 18 books are preserved.
5. Referential integrity is verified.
6. Seed execution is idempotent.
7. Tests pass.
8. Documentation is updated.
9. No unrelated baseline infrastructure has been modified.

## FINAL ENGINEERING REPORT

At completion, report:

1. Existing architecture discovered.
2. Files inspected.
3. Existing components reused.
4. Data model implemented.
5. Files created or modified.
6. Important engineering decisions and reasoning.
7. Seed execution results.
8. Test execution results.
9. Remaining limitations.
10. Recommended next engineering task.

Think and execute like an engineer owning a production system, not someone merely completing a CRUD assignment.