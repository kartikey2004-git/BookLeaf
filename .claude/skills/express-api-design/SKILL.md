---
name: express-api-design
description: Implement and review consistent Express REST APIs with validation, authorization, errors, and OpenAPI contracts.
---

# Express API Design

## Purpose

Maintain dependable REST endpoints in the repository's Express/TypeScript backend. The initial scan found no backend source or package manifest, so first locate the API workspace and existing conventions rather than creating a parallel structure.

## Activation conditions

Use for Express routes, controllers, middleware, services, repositories, Zod validation, OpenAPI changes, error handling, logging, SSE endpoints, or Inngest-triggering APIs.

## Required repository context

Read the API workspace manifest, server composition/entrypoint, router layout, validation/error middleware, authentication middleware, OpenAPI source/generator, logging configuration, Prisma access layer, test harness, and any shared contract package. Establish the existing response envelope before making endpoint changes.

## Engineering rules

- Keep routing thin: route registration and middleware composition in routes, HTTP translation in controllers, business policy in services, and persistence in repositories where those layers exist. Do not manufacture layers for trivial code.
- Validate `params`, `query`, headers, and body at the boundary with Zod; use normalized parsed values thereafter. Reject unknown or malformed input according to project conventions.
- Authenticate and authorize before resource reads/writes. Enforce tenant/ownership scope in the data query itself to prevent IDOR.
- Use stable resource-oriented paths, correct HTTP status codes, pagination bounds, and explicit response/error schemas. Update OpenAPI with every public contract change.
- Send operational errors through centralized async-safe error middleware. Avoid `try/catch` boilerplate that hides errors; never return stack traces or database details to clients.
- Make retries safe: accept/require idempotency keys for externally retried state-changing operations where duplicate effects matter, and persist/coordinate them atomically.
- Use structured logs with request/correlation IDs and safe metadata. Redact authorization headers, cookies, tokens, secrets, and sensitive payloads.
- Configure CORS, rate limits, body limits, proxy trust, and security headers intentionally at server composition, not ad hoc per route.

## Implementation workflow

1. Find the endpoint owner, current contract, authorization rule, and affected database/event behavior.
2. Define Zod request/response schemas and OpenAPI change before implementing public behavior.
3. Compose auth, validation, controller, and error middleware in correct order.
4. Put transactional domain work in the service/repository boundary and publish background events safely.
5. Test happy path, validation, 401, 403, 404, conflict/idempotency, and unexpected-failure response shapes.
6. Run type check, lint, API/integration tests, and contract validation configured for that workspace.

## Common failure scenarios

- Async controller rejection bypasses error middleware.
- Validation occurs after a database query or only in the frontend.
- Generic `findUnique({ id })` permits cross-tenant access.
- Documented OpenAPI and runtime Zod/API response drift.
- A retry submits duplicate payments/jobs/events because idempotency is absent.
- A streaming endpoint is treated like ordinary JSON and leaks connections.

## Validation requirements

Verify OpenAPI/runtime agreement, authorization at resource scope, status/error contracts, pagination limits, sensitive-log redaction, and relevant tests. Exercise real middleware order in integration tests; only claim contract generation/validation if executed.

## Relevant documentation references

- API workspace manifest, entrypoint, and existing router/error middleware
- Installed Zod and OpenAPI tooling documentation
- `.claude/skills/openapi-contracts/SKILL.md`
- `.claude/skills/sse-implementation/SKILL.md`
- `.claude/skills/inngest-workflows/SKILL.md`

