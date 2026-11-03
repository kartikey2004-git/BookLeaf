# Engineering Directive: Establish a Production-Grade Application Baseline

You are acting as a Senior Staff Software Engineer and Principal Application Architect.

Your responsibility is to establish the foundational application architecture and implement its working codebase from scratch.

This is a greenfield engineering foundation task.

You are NOT implementing a product, assignment, business requirement, demo application, or specific feature.

You are building the reusable technical foundation upon which future product development will happen.

Think like an engineer establishing the initial architecture of a serious production software system.

The result must be executable, maintainable, secure by default, testable, modular, and ready for future feature development.

Do not deliver a theoretical architecture or a collection of empty folders. Implement the actual working baseline.

---

# 1. Technology Stack

Use the following technology stack:

### Frontend
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend
- Express.js
- TypeScript
- Node.js

### Authentication
- Better Auth

### Database
- PostgreSQL
- Prisma ORM

### Background Processing
- Inngest

### Validation
- Zod

### API
- REST
- OpenAPI

### Real-time
- Server-Sent Events (SSE)

### Monorepo
- Turborepo
- pnpm workspaces

Use compatible, stable versions of dependencies. Verify package compatibility before installation.

Do not blindly upgrade packages or use outdated APIs.

---

# 2. First: Repository Inspection

Before implementation, inspect the entire repository.

Understand:

- Existing directory structure.
- Existing Claude Code agents and skills.
- CLAUDE.md instructions.
- Existing configuration.
- Existing dependencies.
- Existing source code, if any.
- Available environment variables.
- Existing Git state.

Important: The existing Claude Code engineering scaffold must be preserved.

Do not overwrite or remove:

- .claude/agents/
- .claude/skills/
- .claude/audit/
- Existing CLAUDE.md
- Existing engineering instructions.

Use the existing agents and skills as your engineering team.

If the repository is empty, establish the application workspace from scratch.

If application code already exists, preserve valid work and integrate the baseline without destructive restructuring.

---

# 3. Target Monorepo Architecture

Establish this architecture:

project-root/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── app.ts
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── modules/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   └── package.json
│   │
│   └── worker/
│       ├── src/
│       │   ├── index.ts
│       │   ├── inngest/
│       │   ├── config/
│       │   └── lib/
│       └── package.json
│
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── auth/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── validation/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── contracts/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── config/
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── package.json
│   │
│   └── ui/
│       ├── src/
│       └── package.json
│
├── infrastructure/
│   └── docker/
│
├── docs/
│   ├── architecture/
│   └── development/
│
├── .claude/
│   ├── agents/
│   ├── skills/
│   └── audit/
│
├── CLAUDE.md
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
├── .npmrc
└── README.md

This is the initial target structure, not an instruction to create unnecessary files.

Adjust internal folder structures where engineering reasoning justifies it.

Do not create empty directories or placeholder modules.

---

# 4. Architecture Responsibilities

Establish strict application boundaries.

## A. apps/web — Frontend Application

Responsibilities:

- UI rendering.
- Routing.
- Layouts.
- Server Components.
- Client Components.
- Frontend authentication integration.
- API consumption.
- Loading and error states.
- Reusable UI components.

Rules:

- Use Next.js App Router correctly.
- Prefer Server Components by default.
- Use Client Components only when interaction requires them.
- Avoid unnecessary client-side JavaScript.
- Keep API communication isolated in a reusable client layer.
- Do not put Express backend business logic inside Next.js.
- Do not duplicate authentication implementation.
- Do not expose server-side secrets.
- Avoid unnecessary global state.

Establish:
- Root layout.
- Global styles.
- Basic application shell.
- A clean, minimal landing page.
- Not-found page.
- Error boundary.
- Loading boundary.
- Reusable UI primitives.

The landing page must be a neutral application shell, not an assignment-specific UI.

## B. apps/api — Backend Application

Responsibilities:

- HTTP server.
- REST API.
- Middleware.
- Authentication integration.
- Authorization boundaries.
- Request validation.
- Error handling.
- API documentation.
- SSE endpoints.
- Inngest endpoint integration where appropriate.

Establish a clear request lifecycle:

Request
→ Security middleware
→ Request context
→ Authentication
→ Authorization
→ Validation
→ Route handler
→ Service layer
→ Database or external integration
→ Response

Use modular architecture without creating unnecessary abstractions.

Separate application bootstrap from server startup.

Implement:

- Express application factory.
- HTTP server entry point.
- Centralized error handling.
- 404 handling.
- Request ID middleware.
- Structured logging.
- Security headers.
- CORS configuration.
- Request body limits.
- Health endpoints.
- OpenAPI documentation endpoint.
- Basic route registration.

Use appropriate graceful shutdown handling.

Do not create hypothetical business modules.

## C. apps/worker — Background Processing

Responsibilities:

- Inngest client.
- Background function registration.
- Event handling infrastructure.
- Durable execution.
- Retry configuration.
- Failure handling.
- Worker observability.

Establish:

- Inngest client initialization.
- Function registration pattern.
- Worker entry point.
- Development execution support.
- Environment configuration.

Create only a generic infrastructure-level example if needed to verify the integration.

Do not invent business events, queues, or assignment workflows.

Keep background processing independent from the HTTP application lifecycle.

---

# 5. Shared Packages

Create shared packages only where they establish genuine ownership and reuse.

## packages/database

Responsibilities:

- Prisma configuration.
- PostgreSQL connection.
- Prisma Client initialization.
- Database lifecycle.
- Shared database exports.

Requirements:

- Follow the installed Prisma major version.
- If using Prisma 7, use its current configuration and client initialization conventions.
- Configure environment-based database connectivity.
- Avoid creating multiple Prisma Client instances.
- Support clean shutdown.
- Do not expose database internals to the frontend.
- Include a minimal valid initial schema without invented business entities.

## packages/auth

Responsibilities:

- Better Auth server configuration.
- Better Auth client configuration.
- Shared authentication types where appropriate.
- Session and authentication utilities.

Requirements:

- Integrate Better Auth with Prisma and PostgreSQL.
- Follow current official Better Auth documentation.
- Configure the correct trusted origins.
- Configure secure cookie behavior for development and production.
- Establish server-side and frontend authentication integration.
- Support email/password authentication as a baseline.
- Keep OAuth providers configurable through environment variables.
- Never hardcode secrets.
- Ensure authentication can be consumed by Express without duplicating auth logic.
- Establish an authorization extension point without inventing product-specific roles.

Do not confuse authentication with authorization.

Do not introduce unnecessary custom session management.

## packages/validation

Responsibilities:

- Shared Zod schemas.
- Environment validation utilities where appropriate.
- Common primitive validation schemas.

Do not invent business-specific validation schemas.

## packages/contracts

Responsibilities:

- Shared API contracts.
- Request and response types.
- OpenAPI-compatible schemas.
- Common error response contracts.

Requirements:

- Keep API contracts independent from Express implementation.
- Use Zod as the source of truth where appropriate.
- Avoid duplicating types manually.
- Ensure frontend and backend consume the same contracts.

## packages/config

Centralize:

- TypeScript configurations.
- ESLint configuration.
- Shared development conventions.
- Formatting configuration where appropriate.

Avoid excessive configuration abstraction.

## packages/ui

Responsibilities:

- Shared UI primitives.
- shadcn/ui configuration.
- Reusable components.
- Theme foundations.

Requirements:

- Ensure compatibility with Next.js.
- Keep components framework-compatible.
- Use Tailwind consistently.
- Avoid putting application-specific business UI here.

---

# 6. Authentication Architecture

Implement a working Better Auth foundation.

The expected flow:

Frontend
→ Better Auth Client
→ Better Auth API integration
→ Session validation
→ PostgreSQL through Prisma

Express must be able to authenticate incoming requests using the same Better Auth configuration.

Requirements:

- Correct cookie forwarding.
- Session verification.
- Protected route middleware.
- Public route handling.
- Consistent unauthorized responses.
- Secure session configuration.
- Trusted origin configuration.
- Proper development and production behavior.

Do not build a complete sign-in/sign-up product experience.

A minimal authentication verification page or test route is sufficient.

Follow Better Auth's current Express integration documentation. Do not invent middleware APIs.

---

# 7. Database Foundation

Establish a clean PostgreSQL and Prisma foundation.

Implement:

- Valid Prisma schema.
- Prisma configuration.
- Database client lifecycle.
- Environment validation.
- Migration workflow.
- Local Docker PostgreSQL setup.

Add a Docker Compose configuration for local development.

Requirements:

- Persistent database volume.
- Configurable database credentials.
- Health check.
- No hardcoded production credentials.
- Clear startup and shutdown behavior.

Do not add hypothetical tables, entities, seed records, or relationships.

A minimal initial schema must contain only what the infrastructure requires, including Better Auth's required models.

---

# 8. API Architecture

Establish a consistent REST API foundation.

Implement:

- API versioning convention.
- Health endpoint.
- Readiness endpoint.
- Centralized error format.
- Request validation.
- Request ID.
- Structured logging.
- OpenAPI documentation.
- Consistent HTTP status codes.

Keep liveness and readiness distinct.

Readiness may verify required infrastructure dependencies. Liveness should not fail simply because PostgreSQL is temporarily unavailable.

Establish a clean API contract strategy using Zod and OpenAPI.

Do not create hypothetical CRUD endpoints.

---

# 9. Real-Time Foundation: SSE

Implement a reusable SSE infrastructure layer without creating business-specific streams.

Establish:

- SSE response headers.
- Connection lifecycle.
- Client disconnect handling.
- Heartbeats.
- Event IDs.
- Last-Event-ID handling where supported.
- Reconnection compatibility.
- Authentication and authorization hooks.
- Cleanup of listeners and resources.
- Appropriate connection limits and timeouts.

Document how this architecture should scale across multiple API instances.

Do not introduce Redis or another broker just to make the initial baseline look scalable.

Document the point at which a shared event transport becomes necessary.

---

# 10. Inngest Integration

Establish Inngest as the background workflow infrastructure.

Requirements:

- Shared client initialization.
- Function registration.
- API integration.
- Worker integration where appropriate.
- Development server configuration.
- Retry and failure conventions.
- Idempotency guidance.
- Observability.

Do not confuse durable execution with ordinary background promises.

Do not create unnecessary abstractions around Inngest.

---

# 11. Environment Configuration

Create a comprehensive `.env.example`.

Include only variables actually required by the baseline.

Organize environment variables by responsibility:

- Application.
- Database.
- Authentication.
- Frontend/backend URLs.
- Inngest.
- OAuth providers.
- Logging.

Use Zod for environment validation.

Rules:

- Fail fast when required configuration is missing.
- Validate URLs.
- Distinguish optional development integrations from required infrastructure.
- Never commit real secrets.
- Never use NEXT_PUBLIC for server-only secrets.
- Document which application consumes each variable.

Do not create multiple conflicting environment configurations.

---

# 12. Development Experience

Implement a functional local development workflow.

Root scripts should support:

- Development.
- Build.
- Type checking.
- Linting.
- Formatting.
- Testing.
- Database generation.
- Database migration.
- Docker services.

Use Turborepo correctly.

Requirements:

- Correct task dependencies.
- Correct build outputs.
- Appropriate caching.
- Environment variable handling.
- No unnecessary serial execution.
- No hidden dependency on manually running scripts in a specific order.

Ensure pnpm workspace dependencies use proper workspace references.

Use a single package manager and commit its lockfile.

---

# 13. Testing Foundation

Set up testing infrastructure without writing fake tests.

Use an appropriate combination of:

- Vitest.
- Supertest.
- Playwright.

Establish:

- Unit test conventions.
- API integration testing.
- Database integration testing.
- Authentication testing.
- Frontend E2E testing.
- Test environment configuration.

Write a small number of meaningful infrastructure smoke tests.

At minimum verify:

- API health.
- API error handling.
- Zod validation.
- Database client initialization.
- Authentication session verification.
- Frontend rendering.

Tests requiring external credentials or unavailable infrastructure must be clearly identified.

Never report unexecuted tests as passing.

---

# 14. Security Baseline

Apply production-minded defaults.

Inspect:

- CORS configuration.
- Security headers.
- Cookie settings.
- Authentication boundaries.
- Authorization boundaries.
- Request size limits.
- Input validation.
- Error leakage.
- Environment secret exposure.
- SQL injection risks.
- Dependency vulnerabilities.
- Logging of sensitive data.
- Graceful shutdown.
- Resource cleanup.

Do not introduce unnecessary security packages.

Use secure defaults while keeping local development practical.

---

# 15. Documentation

Create concise engineering documentation.

## docs/architecture/system-overview.md

Explain:

- System architecture.
- Application responsibilities.
- Package boundaries.
- Request lifecycle.
- Authentication flow.
- Database access.
- Background processing.
- SSE architecture.
- Dependency direction.

## docs/architecture/decisions.md

Document important architectural decisions and tradeoffs.

## docs/development/local-setup.md

Explain:

- Prerequisites.
- Installation.
- Environment setup.
- Docker startup.
- Database migration.
- Development commands.
- Testing.
- Troubleshooting.

## README.md

Include:

- Project overview.
- Technology stack.
- Architecture summary.
- Setup instructions.
- Available scripts.
- Development workflow.

Documentation must describe the actual implemented code, not an imagined architecture.

---

# 16. Engineering Standards

Follow these principles throughout implementation:

1. Separation of concerns.
2. Explicit module ownership.
3. Strong TypeScript typing.
4. Dependency inversion where justified.
5. Minimal abstractions.
6. Predictable error handling.
7. Secure-by-default configuration.
8. Observable applications.
9. Reproducible development.
10. Testable infrastructure.
11. Maintainable package boundaries.
12. No premature optimization.

Avoid:

- Overengineering.
- Unnecessary design patterns.
- Generic repository abstractions without a real need.
- Excessive interfaces.
- Premature microservices.
- Unnecessary Redis.
- Unnecessary event buses.
- Duplicate configurations.
- Circular package dependencies.
- Business logic inside infrastructure packages.
- Massive utility files.
- `any` as a shortcut.
- Fake implementations.
- Dead code.
- Placeholder features.

---

# 17. Use Your Existing Claude Engineering Team

Use the agents already created in `.claude/agents/`.

Delegate appropriately:

- architect: establish and review architecture.
- backend-engineer: API foundation.
- database-engineer: Prisma and PostgreSQL foundation.
- security-reviewer: authentication and security review.
- test-engineer: testing infrastructure and verification.

Use the existing skills in `.claude/skills/`.

Do not recreate these agents or skills.

The main agent owns integration and final architectural consistency.

---

# 18. Execution Strategy

Work in the following sequence:

Phase 1: Repository inspection and architecture assessment.

Phase 2: Workspace and package manager configuration.

Phase 3: Shared configurations and packages.

Phase 4: Database and Prisma foundation.

Phase 5: Better Auth integration.

Phase 6: Express API foundation.

Phase 7: Next.js frontend foundation.

Phase 8: Inngest worker foundation.

Phase 9: REST, OpenAPI and SSE infrastructure.

Phase 10: Docker and local development.

Phase 11: Testing and security.

Phase 12: Documentation and final verification.

Work incrementally.

After each major phase, verify the implementation before continuing.

Resolve integration issues rather than leaving disconnected packages.

---

# 19. Strict Constraints

These rules are mandatory.

- Do not implement anything related to an assignment.
- Do not inspect assignment-specific requirements to derive features.
- Do not create assignment-specific entities, APIs, screens, workflows or business rules.
- Do not invent a product domain.
- Do not create demo CRUD modules.
- Do not add unnecessary sample data.
- Do not change the requested technology stack without a documented technical reason.
- Do not replace Express with Next.js route handlers.
- Do not move backend business responsibilities into the frontend.
- Do not mix worker responsibilities into the API application.
- Do not bypass Better Auth with custom authentication.
- Do not bypass Prisma with raw database clients unnecessarily.
- Do not add tools simply to increase the number of dependencies.
- Do not delete existing engineering configuration.
- Do not stop at documentation or scaffolding.
- Do not ask me to approve ordinary engineering decisions.
- Do not claim success without execution and verification.

Make reasonable architectural decisions autonomously.

If an external integration requires credentials, configure its structure and document the missing manual setup.

If a feature cannot be verified because infrastructure is unavailable, report it honestly.

---

# 20. Definition of Done

The task is complete only when:

- The pnpm monorepo installs successfully.
- Turborepo recognizes all applications and packages.
- Next.js starts successfully.
- Express starts successfully.
- Worker development setup is functional.
- PostgreSQL starts through Docker Compose.
- Prisma Client generates successfully.
- Database migrations work.
- Better Auth configuration is integrated.
- Frontend and backend share authentication correctly.
- Zod validation works.
- OpenAPI documentation is accessible.
- SSE infrastructure is functional.
- Inngest integration is configured.
- TypeScript checks pass.
- Linting passes.
- Relevant tests pass.
- Build succeeds.
- No accidental business-specific features exist.
- Architecture documentation matches the actual implementation.

---

# Final Deliverable

Build the actual baseline codebase.

At completion, provide:

1. Final directory structure.
2. Architecture explanation.
3. Implemented application and package responsibilities.
4. Important architectural decisions.
5. Installed dependencies and versions.
6. Environment variables required.
7. Commands to start the complete system.
8. Database setup and migration instructions.
9. Test and build results.
10. Known limitations and manual configuration.

Final objective:

Establish a clean, production-minded, extensible engineering foundation that can accept any future product requirements without requiring architectural restructuring.

Build the foundation first. Product features come later.

Start inspecting the repository and execute the implementation now.