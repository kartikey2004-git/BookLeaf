---
name: prisma-postgres
description: Design and review safe Prisma and PostgreSQL changes with migration, integrity, and performance discipline.
---

# Prisma + PostgreSQL

## Purpose

Guide relational modeling, query work, and migrations using the Prisma version actually installed by the future workspace. The requested architecture mentions Prisma 7, but no manifest or schema was present in the initial scan; never claim Prisma 7 conventions until the dependency is verified.

## Activation conditions

Use for `schema.prisma`, Prisma Client queries, PostgreSQL data modeling, indexes, constraints, migrations, transactions, pagination, performance investigations, or adapter schema changes.

## Required repository context

Inspect the Prisma package version, `prisma.config.*` if present, schema(s), migration history, datasource/provider setup, generated-client location, database access patterns, authorization/tenant keys, query logging policy, test database setup, and deployment migration process. Read the installed Prisma documentation for exact generator/configuration behavior.

## Engineering rules

- Model business invariants in PostgreSQL: non-nullability, foreign keys, unique/composite unique constraints, enums/check constraints where supported by the established migration approach, and deliberate delete behavior.
- Add indexes based on actual filter, join, sort, and tenant scope patterns; avoid duplicate, speculative, or write-heavy indexes. Composite index order must match query predicates and ordering.
- Scope every tenant/user-owned query in the `where` clause. Authorization cannot rely on filtering results after an unscoped lookup.
- Use cursor pagination for large/mutable collections with deterministic order; bound page sizes and avoid offset scans when scale matters.
- Use interactive transactions only for short, necessary atomic operations. Keep network calls and long computation outside transactions; choose isolation/retry policy consciously for contention-sensitive writes.
- Prevent N+1 queries via relation selection/batching appropriate to the existing Prisma patterns. Select only needed fields, especially for sensitive models.
- Treat generated Prisma output as generated: edit schema/migrations, not client artifacts. Make migrations additive and deploy-safe; never run destructive production data changes without explicit authorization.
- Use database-backed idempotency/unique constraints for duplicate-sensitive writes where feasible, not process-local checks.

## Implementation workflow

1. Inspect existing schema, query call sites, migrations, and deployed-data compatibility.
2. Write the invariant, access pattern, rollout sequence, and rollback/mitigation plan.
3. Change schema and create a reviewed migration using the project's Prisma command; inspect generated SQL for locks, table rewrites, and destructive operations.
4. Update typed queries with transaction and authorization boundaries.
5. Test against the sanctioned development/test database, including integrity failure and concurrent/retry behavior where relevant.
6. Run schema validation, generated-client/type checks, affected tests, and query-plan inspection for material performance changes.

## Common failure scenarios

- Adding a nullable field then treating it as required before a safe backfill/rollout.
- Missing unique constraint allows duplicate concurrent records.
- `skip` pagination becomes slow or inconsistent under inserts.
- N+1 relation loading or broad `include` leaks data and degrades endpoints.
- Long transaction holds locks while awaiting an HTTP call/job.
- Hand-editing migration history or generated client causes environment drift.

## Validation requirements

Run the repository's Prisma schema/migration validation and affected type/tests when available. Inspect migration SQL and confirm foreign keys, uniqueness, indexes, delete behavior, tenant scopes, and rollback/forward-fix plan. Do not execute against production or expose connection strings.

## Relevant documentation references

- Installed Prisma package, schema, config, and migration directory once present
- PostgreSQL documentation for selected data types/indexes/locking behavior
- `.claude/skills/better-auth/SKILL.md`
- `.claude/skills/express-api-design/SKILL.md`

