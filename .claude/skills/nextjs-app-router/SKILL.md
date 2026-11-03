---
name: nextjs-app-router
description: Implement or review Next.js App Router work after the web workspace exists.
---

# Next.js App Router

## Purpose

Guide safe, performant Next.js App Router changes. This repository currently has no application manifests or source files; before using this skill, identify the web workspace, installed Next.js version, and its `app/` root. Do not infer an `apps/web` layout merely from the intended stack.

## Activation conditions

Use for pages, layouts, route handlers, Server/Client Component boundaries, server actions, caching, streaming, metadata, or Next.js security and performance changes.

## Required repository context

Read the root and workspace `package.json` files, `next.config.*`, `tsconfig.json`, the nearest `app/` tree, shared UI packages, auth client/server modules, and existing lint/test conventions. Confirm the installed Next.js documentation for version-specific APIs. Map the backend API base URL and where its contracts are defined before adding a route handler or server action.

## Engineering rules

- Keep components server-rendered by default. Add `'use client'` only at the smallest interactive leaf and never import server-only code into it.
- Put request mutations behind authenticated server boundaries; validate all untrusted input with the project Zod schemas and authorize the resource, not merely the session.
- Prefer direct server-side service/API calls for server components where the architecture permits. Do not expose database credentials or privileged backend tokens to the browser.
- Use route handlers for HTTP endpoints with explicit methods, status codes, cache headers, and stable response contracts. Keep business logic outside page and handler files.
- Choose caching deliberately: use dynamic rendering for user/session data, revalidate tagged public data after mutations, and document any `no-store` decision. Do not cache personalized responses in shared caches.
- Provide loading, error, and not-found states appropriate to each route segment. Avoid waterfall fetches; parallelize independent work and keep client bundles lean.
- Treat redirect targets, query strings, rich text, uploads, and external URLs as hostile input. Use framework escaping; avoid raw HTML unless sanitized by an approved library.

## Implementation workflow

1. Locate the owning workspace and closest route conventions.
2. Decide rendering, data ownership, cache/revalidation, and auth behavior before code.
3. Reuse shared types/contracts and place domain logic in the established backend/service layer.
4. Implement accessible UI states and bounded error handling.
5. Test the server/client boundary, anonymous and unauthorized behavior, cache invalidation, and error paths.
6. Run the workspace type check, lint, relevant tests, and production build when available.

## Common failure scenarios

- A Client Component imports Prisma, Node APIs, or secret-bearing modules.
- A Server Action trusts form fields or skips resource-level authorization.
- `fetch` caching leaks one user's data to another or leaves mutations stale.
- Browser code duplicates backend validation and drifts from OpenAPI/Zod contracts.
- A route handler becomes a second backend with inconsistent errors or auth.

## Validation requirements

Verify TypeScript and lint for the affected workspace, route-level rendering/error behavior, authenticated and unauthenticated cases, bundle impact for new client boundaries, and a production build where configured. Record unavailable checks rather than claiming success.

## Relevant documentation references

- `package.json` and the selected web workspace manifest (source of installed versions)
- Next.js App Router, caching, and security documentation matching that version
- `.claude/skills/express-api-design/SKILL.md`
- `.claude/skills/better-auth/SKILL.md`

