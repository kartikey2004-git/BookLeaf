---
name: inngest-workflows
description: Design and review durable Inngest workflows only after locating an installed Inngest integration in this workspace.
---

# Inngest workflows

## Purpose

Implement, review, or troubleshoot durable background workflows with correct event contracts, retries, idempotency, and observability.

## Activation conditions

Use for Inngest events, functions, scheduled jobs, asynchronous work, retries, rate limits, or webhook-driven work. This repository currently contains no workspace manifest or application source, so first confirm that Inngest is actually installed and identify the owning package. Do not create an integration just because this guide exists.

## Required repository context

Before changing code, locate the workspace root, `package.json`, Inngest client, function registrations, event schemas, API/route handler exposing Inngest, environment validation, and test setup. Read the installed package version from the owning manifest and use its local types/docs. Check callers and consumers of every event name.

## Engineering rules

- Treat event names and payloads as versioned public contracts; validate payloads at the producer boundary.
- Use deterministic idempotency keys for externally visible side effects. Store or derive them from a stable business identifier.
- Put each retryable or independently observable unit in a durable step; do not repeat non-idempotent side effects outside a step.
- Set retry, concurrency, rate-limit, debounce, and cancellation policies deliberately from workload characteristics. Document the reason near non-default configuration.
- Prefer explicit, bounded batch/pagination loops. Avoid unbounded fan-out, recursive self-triggering, and long in-memory work.
- Propagate correlation IDs and use structured logs without secrets, raw session tokens, or unnecessary personal data.
- Make failure behavior explicit: compensate where needed, emit an alertable terminal failure, and preserve enough safe context for diagnosis.
- Protect event ingress and function endpoints using the installed Inngest signing/serving mechanism; do not expose arbitrary job execution routes.

## Implementation workflow

1. Trace synchronous request work that must become asynchronous and define success/failure ownership.
2. Define or update a Zod/TypeScript event contract next to the event registry, including compatibility strategy.
3. Identify stable idempotency and concurrency keys before writing the function.
4. Implement small durable steps, passing only serializable data and re-reading mutable records when correctness requires it.
5. Register the function in the existing serving entrypoint and ensure its package owns the dependency.
6. Add tests for happy path, duplicate delivery, retries, terminal failure, and relevant authorization/tenant boundaries.
7. Run the owning package's typecheck, tests, and any Inngest local/dev validation script.

## Common failure scenarios

- Duplicate event delivery creates duplicated emails, charges, or writes because no idempotency key exists.
- A step retries after an external side effect that was outside the step or not idempotent.
- Event payload changes break delayed consumers because fields were renamed without a compatibility plan.
- Concurrency is global rather than tenant/resource scoped, causing starvation or unsafe races.
- Functions are authored but omitted from the served registration array.
- A workflow assumes an in-memory request context, transaction, or database connection survives across durable steps.

## Validation requirements

Confirm registration is reachable, schema/type checking passes, event validation rejects malformed data, and retry/idempotency tests demonstrate no duplicate business effect. Verify logs redact secrets and tests cover terminal failure handling. In this currently scaffold-only repository, record any validation that cannot run until manifests and source exist.

## Relevant documentation references

- The installed `inngest` package version and local type definitions in the owning workspace.
- The repository's event registry, environment schema, and API/route-handler integration once present.
- Official Inngest documentation matching the installed major version.
