# Engineering Directive: Build a Production-Grade AI Engineering Agent System

You are acting as a Senior Staff Engineer, AI Tooling Architect, and Developer Productivity Engineer.

Your task is to transform this repository into an AI-assisted engineering environment with specialized agents, reusable skills, coding standards, automated quality gates, and reliable development workflows.

This is an implementation task, not a recommendation or documentation-only task.

You must inspect the repository, understand its actual architecture, and implement the complete agent system based on the existing codebase.

---

# 1. Existing Technology Stack

The project uses:

- Frontend: Next.js App Router + TypeScript
- Backend: Express.js + TypeScript
- Authentication: Better Auth
- ORM: Prisma
- Database: PostgreSQL
- Background processing: Inngest
- Validation: Zod
- API: REST + OpenAPI
- Real-time: Server-Sent Events
- Monorepo: Turborepo + pnpm

Do not assume the repository follows this architecture perfectly. Inspect and document the actual implementation first.

# 2. Phase One: Repository Intelligence

Before making changes:

1. Crawl every relevant file and directory.
2. Inspect all workspace manifests and package configurations.
3. Inspect existing Claude Code configuration.
4. Inspect existing agents, skills, MCP configurations, hooks and commands.
5. Inspect architecture documentation.
6. Inspect application boundaries and package dependencies.
7. Inspect linting, formatting, testing and CI configurations.
8. Identify duplicated, conflicting, obsolete or missing agent instructions.
9. Identify existing tools that already provide equivalent functionality.

Do not read generated or irrelevant directories unnecessarily:

- node_modules
- .git
- .next
- dist
- build
- coverage
- generated Prisma output
- package caches

Inspect their configuration and references when necessary.

Create:

`.claude/audit/agent-system-audit.md`

Include:

- Existing configuration inventory.
- Existing capabilities.
- Missing capabilities.
- Conflicts and duplication.
- Recommended changes.
- Security considerations.
- Final implementation plan.

Do not stop after creating the audit. Continue to implementation.

# 3. Phase Two: Specialized Subagents

Create the following five specialized agents inside `.claude/agents/`.

## Agent 1: architect

Responsibility:
- System architecture.
- Module boundaries.
- Dependency direction.
- Architectural consistency.
- Scalability considerations.
- Architecture decision records.
- Technical tradeoffs.

Must understand:
- Next.js App Router boundaries.
- Express service architecture.
- Monorepo package boundaries.
- Authentication and authorization boundaries.
- Event-driven architecture.
- Distributed systems implications.

Must not introduce unnecessary microservices or abstractions.

## Agent 2: backend-engineer

Responsibility:
- Express.js APIs.
- TypeScript backend implementation.
- Middleware.
- REST conventions.
- Error handling.
- Zod validation.
- OpenAPI contracts.
- SSE implementation.
- Inngest integration.

Enforce:
- Clear separation of routes, controllers, services and repositories where appropriate.
- Consistent API response contracts.
- Centralized error handling.
- Authentication and authorization at protected boundaries.
- Idempotency for operations that require it.
- Structured logging.
- Correct async error handling.

## Agent 3: database-engineer

Responsibility:
- Prisma schema design.
- PostgreSQL architecture.
- Query optimization.
- Transactions.
- Indexing.
- Data integrity.
- Migration safety.
- Database performance.

Enforce:
- Correct relational modeling.
- Explicit constraints.
- Appropriate indexes.
- Safe migration practices.
- Transaction boundaries.
- Avoidance of N+1 queries.
- Correct pagination.
- Appropriate PostgreSQL data types.

Never modify production data without explicit authorization.

## Agent 4: security-reviewer

Responsibility:
- Better Auth implementation.
- Authentication.
- Authorization.
- Session management.
- RBAC.
- API security.
- Input validation.
- Secret management.
- Dependency security.
- Security-focused code reviews.

Inspect:
- Broken access control.
- IDOR.
- Privilege escalation.
- Session vulnerabilities.
- CSRF and CORS.
- Injection vulnerabilities.
- SSRF.
- Sensitive data exposure.
- Insecure defaults.

Never expose secrets or copy environment values into generated documentation.

## Agent 5: test-engineer

Responsibility:
- Unit testing.
- Integration testing.
- API testing.
- Database testing.
- E2E testing.
- Regression testing.
- Test architecture.
- CI quality gates.

Enforce:
- Meaningful test coverage.
- Realistic integration scenarios.
- Authentication and authorization tests.
- Database transaction tests.
- Background job failure scenarios.
- SSE reconnection tests.
- Regression coverage for fixed bugs.

Do not create meaningless tests merely to increase coverage percentages.

# 4. Phase Three: Specialized Skills

Create the following reusable skills inside `.claude/skills/`.

Each skill must have its own `SKILL.md` with:

- Purpose.
- Activation conditions.
- Required repository context.
- Engineering rules.
- Implementation workflow.
- Common failure scenarios.
- Validation requirements.
- Relevant documentation references.

Create these skills:

1. `nextjs-app-router`
   - Server Components and Client Components.
   - Server Actions where appropriate.
   - Route handlers.
   - Caching and revalidation.
   - Rendering strategies.
   - Performance.
   - Next.js security boundaries.

2. `better-auth`
   - Authentication architecture.
   - Session lifecycle.
   - OAuth.
   - Cookies.
   - Plugins.
   - Role-based authorization.
   - Express integration.
   - Security configuration.

3. `express-api-design`
   - REST architecture.
   - Middleware.
   - Error handling.
   - Request lifecycle.
   - API versioning.
   - Zod validation.
   - OpenAPI contracts.

4. `prisma-postgres`
   - Prisma 7 conventions based on the installed version.
   - Schema design.
   - PostgreSQL constraints.
   - Transactions.
   - Indexes.
   - Query optimization.
   - Migration safety.

5. `inngest-workflows`
   - Event-driven workflows.
   - Durable execution.
   - Retries.
   - Idempotency.
   - Concurrency.
   - Rate limits.
   - Step execution.
   - Failure handling.

6. `sse-implementation`
   - Event streaming.
   - Event IDs.
   - Last-Event-ID.
   - Reconnection.
   - Heartbeats.
   - Connection lifecycle.
   - Authorization.
   - Multi-instance deployment.
   - Resource cleanup.

7. `openapi-contracts`
   - API contract design.
   - Request and response schemas.
   - Zod integration.
   - Documentation generation.
   - Contract validation.
   - Breaking change detection.

8. `monorepo-management`
   - Turborepo.
   - pnpm workspaces.
   - Package boundaries.
   - Dependency management.
   - Task pipelines.
   - Shared configurations.
   - Build optimization.

9. `production-code-review`
   - Correctness.
   - Security.
   - Performance.
   - Maintainability.
   - Error handling.
   - Database consistency.
   - Regression risks.
   - Production readiness.

Do not blindly copy generic instructions from the internet. Adapt each skill to the actual repository and installed package versions.

# 5. Phase Four: CLAUDE.md

Create or improve the root `CLAUDE.md`.

It must serve as the central engineering instruction manual.

Include:

- Actual architecture.
- Workspace structure.
- Package responsibilities.
- Dependency boundaries.
- Technology versions.
- Development commands.
- Build and test commands.
- Coding conventions.
- Naming conventions.
- Error handling conventions.
- Authentication rules.
- Database rules.
- API conventions.
- Testing requirements.
- Security requirements.
- Agent delegation rules.
- Definition of Done.

Keep it concise and actionable.

Do not duplicate entire skill documents inside CLAUDE.md.

If the repository contains existing instructions, preserve valid project-specific rules and consolidate conflicting ones.

# 6. Phase Five: MCP Configuration

Configure useful MCP integrations only when their official packages and setup methods are verified.

Prioritize:

1. Context7: version-specific documentation retrieval.
2. Playwright: browser automation and E2E verification.
3. GitHub: repository, issue and PR workflows.
4. Inngest: workflow inspection and debugging, where officially supported.
5. Chrome DevTools: browser diagnostics, where useful.
6. PostgreSQL: read-only database inspection, where useful.

Rules:

- Inspect existing MCP configuration first.
- Do not duplicate existing integrations.
- Use official documentation and installation instructions.
- Do not invent package names or endpoints.
- Never hardcode API keys or secrets.
- Use environment-variable references for credentials.
- Prefer read-only database permissions.
- Do not connect an agent to production databases by default.
- Do not install unnecessary MCP servers.
- Document any integration that requires manual authentication.

Create or update `.mcp.json` only when the configuration is verified and appropriate.

# 7. Phase Six: CLI and Developer Tooling

Inspect existing dependencies before adding anything.

Verify and configure where appropriate:

- GitHub CLI.
- Prisma CLI.
- Inngest CLI.
- Playwright.
- Vitest.
- ESLint.
- Prettier.
- Knip.
- TypeScript.
- Turbo.
- pnpm.

Do not globally install tools unnecessarily.

Do not replace existing tools simply because another tool is available.

Ensure commands work with the existing workspace structure.

# 8. Phase Seven: Quality Gates and Hooks

Implement appropriate engineering checks.

Consider:

- Formatting.
- Linting.
- Type checking.
- Unit tests.
- Integration tests.
- Build verification.
- Secret detection.
- Dependency vulnerability checks.
- Unused dependency detection.
- Git diff validation.

Use the existing package manager and scripts.

Add pre-commit hooks only if justified.

Avoid running expensive full-repository checks on every small commit.

Never silently bypass failed checks.

# 9. Phase Eight: Engineering Workflow

Establish a consistent workflow for future development tasks.

## Feature implementation

1. Understand the requirement.
2. Inspect relevant code.
3. Identify architectural impact.
4. Create an implementation plan.
5. Delegate specialized work where useful.
6. Implement the feature.
7. Validate types and contracts.
8. Run relevant tests.
9. Perform security review.
10. Review the final diff.
11. Report completed work and outstanding risks.

## Bug fixing

1. Reproduce the issue.
2. Identify the root cause.
3. Add a regression test.
4. Implement the smallest correct fix.
5. Run affected tests.
6. Inspect related failure paths.
7. Report the root cause and verification.

## Code review

Review in this priority order:

1. Correctness.
2. Security.
3. Data integrity.
4. Concurrency.
5. Performance.
6. Maintainability.
7. Style.

Report actual defects, not subjective stylistic preferences.

# 10. Phase Nine: Verification

After implementation:

- Validate every agent's frontmatter and configuration.
- Validate every skill's structure.
- Check that referenced files exist.
- Check for duplicated instructions.
- Check for invalid MCP configurations.
- Check that project commands are valid.
- Run available linting and type checks.
- Run relevant tests.
- Inspect the final Git diff.
- Ensure no secrets or credentials were introduced.

Do not claim a check passed if it was not executed.

# 11. Final Deliverables

The completed repository should contain:

.claude/
  agents/
    architect.md
    backend-engineer.md
    database-engineer.md
    security-reviewer.md
    test-engineer.md

  skills/
    nextjs-app-router/SKILL.md
    better-auth/SKILL.md
    express-api-design/SKILL.md
    prisma-postgres/SKILL.md
    inngest-workflows/SKILL.md
    sse-implementation/SKILL.md
    openapi-contracts/SKILL.md
    monorepo-management/SKILL.md
    production-code-review/SKILL.md

  audit/
    agent-system-audit.md

CLAUDE.md

.mcp.json (only if appropriate)

Additional hook and configuration files where justified.

# 12. Strict Execution Rules

- Do not ask me for confirmation for ordinary implementation decisions.
- Do not stop after producing a plan or audit.
- Do not create placeholder agents or empty skills.
- Do not invent integrations.
- Do not install redundant tools.
- Do not change the existing application architecture.
- Do not refactor application code as part of this tooling task.
- Do not modify business logic.
- Do not introduce unnecessary dependencies.
- Do not expose secrets.
- Do not overwrite valid existing configuration without inspecting it.
- Preserve existing project conventions.
- Make reasonable engineering decisions autonomously.
- If an integration requires external authentication, document the exact manual step and continue with the rest.
- If a tool is unavailable, report the limitation and use an appropriate alternative.

# Final Instruction

Act as the owner of this engineering tooling initiative.

Inspect → Audit → Design → Implement → Configure → Validate → Report.

Complete the entire initiative in one execution.

At the end, provide:

1. What existed before.
2. What you created.
3. What you modified.
4. Tools and integrations configured.
5. Commands to use the agents and skills.
6. Verification results.
7. Remaining manual setup.
8. Security considerations.

The goal is not to make Claude Code look powerful through excessive tooling.

The goal is to make it behave like a disciplined engineering team that understands this repository, follows its architecture, writes reliable code, tests its work, and catches production risks before they ship.