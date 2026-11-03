---
name: better-auth
description: Implement or review Better Auth integration without weakening session or authorization boundaries.
---

# Better Auth

## Purpose

Provide a disciplined workflow for Better Auth session, OAuth, cookie, role, and Express integration work. No Better Auth configuration was found during the initial repository scan, so resolve actual modules and installed version before changing authentication.

## Activation conditions

Use for sign-in/up, sessions, cookies, OAuth providers, roles/permissions, account linking, protected UI/API routes, or auth adapter/database changes.

## Required repository context

Inspect the owning manifests, auth server and client modules, Better Auth version and plugins, environment-variable names (never values), Prisma adapter/schema, Express middleware order, CORS/CSRF configuration, and existing role model. Confirm the documented API against the installed Better Auth version.

## Engineering rules

- Centralize auth configuration and create one authoritative session-to-principal mapping. Do not parse cookies or trust client-provided roles manually.
- Authenticate first, then authorize every protected resource/action by ownership or explicit permission. A valid session alone is not permission to access arbitrary IDs.
- Use secure, HTTP-only cookies and production-safe `secure`, `sameSite`, domain, and trusted-origin settings appropriate to deployment topology.
- Keep provider secrets, session secrets, and database URLs in environment variables; do not log tokens, cookies, reset links, or full user records.
- Apply CSRF protections to cookie-authenticated state changes. Configure Express CORS as an explicit allowlist with credentials only when required.
- Treat account linking, password resets, email verification, and role assignment as high-risk flows requiring explicit authorization and auditability.
- Make backend middleware return consistent 401 (not authenticated) and 403 (authenticated but forbidden) contracts. Frontend redirects must not replace API authorization.

## Implementation workflow

1. Trace request flow from browser/cookie to Better Auth session and Express/Next boundary.
2. Identify principal, role/permission source, resource ownership rule, and trusted origins.
3. Reuse established auth helpers/middleware; add schema migrations only when the adapter requires them.
4. Implement least-privilege behavior and avoid exposing auth internals in errors.
5. Test anonymous, expired, revoked, malformed, cross-origin, and insufficient-permission cases plus valid flows.
6. Review configuration diff for secret exposure and production cookie/CORS settings.

## Common failure scenarios

- Checking a role passed in JSON, a client store, or an unverified header.
- Allowing arbitrary redirect URLs after login or OAuth completion.
- Broad `*` CORS combined with credentials, missing CSRF protection, or insecure production cookies.
- Protecting a page but leaving its REST endpoint subject to IDOR.
- Leaking session/access tokens through logs, error objects, browser storage, or generated docs.

## Validation requirements

Run relevant type/lint/tests and add integration coverage for 401/403/resource ownership. Confirm no secret values appear in diffs, fixtures, logs, or documentation. Validate callback/redirect allowlists and production environment configuration without accessing production data.

## Relevant documentation references

- Installed Better Auth package/version and its official documentation
- Auth configuration, adapter, and Express/Next entrypoints once present
- `.claude/skills/express-api-design/SKILL.md`
- `.claude/skills/prisma-postgres/SKILL.md`

