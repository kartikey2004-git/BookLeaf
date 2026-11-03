---
name: openapi-contracts
description: Maintain REST API contracts, Zod validation, and OpenAPI compatibility in the API-owning package.
---

# OpenAPI contracts

## Purpose

Keep REST endpoints, runtime validation, documentation, and consumers aligned, with explicit compatibility decisions.

## Activation conditions

Use when adding or changing an API endpoint, request/response body, query/path parameter, error contract, OpenAPI document, generated client, or contract test. First find the actual OpenAPI/Zod tooling: none is currently present in this scaffold-only repository.

## Required repository context

Inspect the API package manifest, route/controller/service boundaries, validation schemas, error middleware, OpenAPI source/generator, consumer packages, auth middleware, and test scripts. Establish whether the API is versioned by URL, headers, or compatibility policy before changing a public shape.

## Engineering rules

- Make a single schema source authoritative where project tooling supports it; avoid hand-maintained Zod and OpenAPI definitions that drift.
- Validate path, query, headers, and body at the transport boundary. Coerce only intentional input formats.
- Specify success and error responses for every status code, including the project's standard machine-readable error fields.
- Use stable, predictable resource naming, HTTP verbs, pagination, filtering, sort order, and idempotency semantics.
- Require auth and document authorization behavior without revealing implementation details. Do not place credentials, tokens, or sensitive samples in the spec.
- Treat deletion/renaming/tightening validation or changing enum meanings as breaking unless a documented policy says otherwise.
- Pin generated artifacts to their source and do not commit generated output unless the repository convention requires it.
- Validate examples against their schemas and ensure response types match actual serialization (dates, nullability, decimals, pagination cursors).

## Implementation workflow

1. Identify existing endpoint conventions and consumers; choose a compatible extension when possible.
2. Write/update request, response, and error schemas, plus safe examples.
3. Wire runtime Zod validation before controller logic; keep business validation in the domain/service layer.
4. Update the OpenAPI operation, security requirements, tags, parameters, responses, and reusable components through the established generator/source.
5. Add contract tests that call the route and validate representative responses; add negative validation and authorization cases.
6. Run the actual OpenAPI generation/lint/diff commands from the owning workspace, then update consumers only when required by policy.

## Common failure scenarios

- Docs say a field is optional while runtime requires it, or vice versa.
- A `200` response is documented but handlers return `201`, `204`, or a different error shape.
- Pagination is unstable because ordering is not deterministic.
- OpenAPI security metadata exists but middleware is absent on the route.
- Query parameters are not validated, enabling surprising casts or broad data access.
- A generated client is updated without detecting breaking changes for other packages.

## Validation requirements

Run schema/type checks, OpenAPI validation/linting, contract tests for success/error/auth cases, and a breaking-change diff when a prior spec is available. Confirm all `$ref` targets resolve and no examples contain secrets. If the project has no OpenAPI tooling yet, do not invent a generator; document the missing capability in the audit and add it only after a real API package exists.

## Relevant documentation references

- OpenAPI Specification version used by the repository.
- Installed Zod and OpenAPI bridge/generator documentation, if present.
- Repository API error, pagination, and auth conventions once established.
