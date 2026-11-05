# Frontend API contract

Base URL: `/api/v1`. All responses are JSON. Browser must send Better Auth cookies. Protected routes return `401 UNAUTHORIZED` without a valid session. Errors are `{ error: { code, message, details? }, requestId }`.

## Authentication and authorization

Better Auth is mounted at `/api/auth/*`. Author routes resolve session user to `Author.userId`; an unlinked account gets `403 AUTHOR_NOT_LINKED`. Admin routes require `User.role === "ADMIN"`; other users get `403 ADMIN_REQUIRED`. Client never supplies author IDs.

## Author endpoints

- `GET /author/me`: `{ author }`.
- `GET /author/books?page=1&pageSize=20`: `{ books, pagination: { page, pageSize, total } }`. `pageSize` is 1–50.
- `GET /author/books/:bookId`: `{ book }`; unavailable books return `404`.
- `GET /author/overview`: `{ overview }`.
- `POST /author/tickets`: body `{ bookId?, subject, description }`; returns `201 { ticket }`. `bookId` must belong to session author.
- `GET /author/tickets?status&page&pageSize`: paginated `{ tickets, pagination }`; list items do not include messages.
- `GET /author/tickets/:ticketId`: `{ ticket }`, including public messages only.
- `POST /author/tickets/:ticketId/messages`: body `{ content }`; returns `201 { message }`. Only `OPEN` and `IN_PROGRESS` accept author messages.

## Admin endpoints

- `GET /admin/tickets?status&category&priority&assignedAdminId&createdFrom&createdTo&page&pageSize`: paginated queue.
- `GET /admin/tickets/:ticketId`: `{ ticket }`, with author, assignment, internal notes, audit events, and `ai` metadata.
- `PATCH /admin/tickets/:ticketId/status`: body `{ status, version }`.
- `PATCH /admin/tickets/:ticketId/priority`: body `{ priority, version }`.
- `PATCH /admin/tickets/:ticketId/category`: body `{ category, version }`.
- `PATCH /admin/tickets/:ticketId/assignment`: body `{ assignedAdminId: string | null, version }`.
- `POST /admin/tickets/:ticketId/messages`: body `{ content }`; explicit public reply.
- `POST /admin/tickets/:ticketId/internal-notes`: body `{ content }`; private note.
- `POST /admin/tickets/:ticketId/ai-draft`: empty body; returns `{ draft, recommendations: { category, priority } }`. It never creates a public message.

Mutation requests use current integer `version`. A competing write returns `409 TICKET_VERSION_CONFLICT`. Status transitions: `OPEN` to `IN_PROGRESS`, `RESOLVED`, or `CLOSED`; `IN_PROGRESS` to `OPEN`, `RESOLVED`, or `CLOSED`; `RESOLVED` to `IN_PROGRESS` or `CLOSED`; `CLOSED` is terminal.

## AI behavior

Ticket creation returns immediately. `ai.status` starts pending. Gemini recommendations use fixed enums but remain separate from admin-controlled values. Worker never creates public messages or overwrites administrator category or priority. Draft endpoint returns `503 AI_UNAVAILABLE` for missing config or temporary provider failure, and `502 AI_UNAVAILABLE` for provider authentication or invalid structured output.

## Environment and limits

Required runtime variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`. AI needs `GEMINI_API_KEY`; `GEMINI_MODEL` defaults to `gemini-2.5-flash`; `GEMINI_TIMEOUT_MS` defaults to `15000`. Inngest uses `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` when connected. API keys never reach frontend code.

OpenAPI endpoint: `GET /api/v1/openapi.json`. This document is frontend contract.

## Server-sent events

`GET /events` requires a valid Better Auth session. The stream sends a `connected` event with a request ID, then heartbeat comments. It is limited to three active streams per user and 100 per API process, and closes after 15 minutes. Events are best-effort: clients must not expect replay from `Last-Event-ID` or cross-instance delivery.
