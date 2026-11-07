# Frontend API contract

Base URL: `/api/v1`. Browser clients use same-origin `/api/*` paths on Vercel; the web proxy forwards them to Render with Better Auth cookies. Responses are JSON unless the endpoint is an SSE stream. Errors use `{ error: { code, message, details? }, requestId }`.

## Authentication and authorization

Better Auth is mounted at `/api/auth/*`. Author routes resolve the session user through `Author.userId`; an unlinked user receives `403 AUTHOR_NOT_LINKED`. Admin routes require `User.role === "ADMIN"`. Clients never send author IDs.

## Author endpoints

- `GET /author/me`: `{ author }`.
- `GET /author/books?page=1&pageSize=20`: `{ books, pagination }`; `pageSize` is 1–50.
- `GET /author/books/:bookId`: `{ book }`; unavailable books return `404`.
- `GET /author/overview`: `{ overview }`.
- `POST /author/tickets`: `{ bookId?, subject, description }` → `201 { ticket }`; the book must belong to the session author.
- `POST /author/tickets/attachments/sign`: `{ fileName, mimeType, size }` → `{ storage: "minio" | "tigris", uploadUrl }`. It validates the 1–10 MB file and allowed MIME type before returning the upload route.
- `PUT /author/tickets/attachments/upload`: raw file body with `X-File-Name` and `Content-Type` headers → `201 { publicId, secureUrl }`. It stores to MinIO locally or Tigris in production.
- `POST /author/tickets/:ticketId/attachments`: `{ publicId, secureUrl, fileName, mimeType, size }` → `201 { attachment }`. The ticket must belong to the session author.
- `GET /author/tickets?status&page&pageSize`: paginated `{ tickets, pagination }`; list items omit messages.
- `GET /author/tickets/:ticketId`: `{ ticket }`, including public messages only.
- `POST /author/tickets/:ticketId/messages`: `{ content }` → `201 { message }`. Only `OPEN` and `IN_PROGRESS` accept author messages.
- `GET /author/tickets/stream`: authenticated author SSE. It emits `connected` and `ticket.updated` events with `{ ticketId, reference, reason }`, never message bodies or internal notes.

An unavailable attachment backend returns `503 ATTACHMENT_STORAGE_UNAVAILABLE`. The allowed attachment types are PDF, Word, PNG, JPEG, plain text, and Markdown.

## Admin endpoints

- `GET /admin/tickets?status&category&priority&assignedAdminId&createdFrom&createdTo&unresolved&page&pageSize`: paginated queue sorted by priority then age; list items include assignment and `ai.status`.
- `GET /admin/tickets/:ticketId`: `{ ticket }`, including author, assignment, internal notes, audit events, and AI metadata.
- `PATCH /admin/tickets/:ticketId/status`, `/priority`, `/category`, `/assignment`: mutation body includes the current `{ version }` plus the changed field.
- `POST /admin/tickets/:ticketId/messages`: public support reply.
- `POST /admin/tickets/:ticketId/internal-notes`: private administrator note.
- `POST /admin/tickets/:ticketId/ai-draft`: returns `{ draft, recommendations }`; it never posts a message.
- `POST /admin/tickets/:ticketId/ai-draft/stream`: admin SSE; `chunk`, `done`, and user-safe `error` events. Disconnecting cancels generation.

All ticket mutations use the current integer `version`; a competing update returns `409 TICKET_VERSION_CONFLICT`. `CLOSED` tickets are terminal and do not accept author replies.

## AI behavior

Ticket creation returns before AI work completes. When Inngest is configured, `ai.status` begins pending and the `bookleaf/ticket.created` event performs triage asynchronously. Without the event key, the API marks the ticket for manual classification. AI recommendations never overwrite admin-controlled category or priority, and a draft is never sent automatically.

## Runtime requirements

The API requires database and Better Auth configuration. Tigris storage is configured only in Render; MinIO is local only. Vercel's `/api/inngest` function requires the pooled database URL, Better Auth settings, Inngest keys, and Gemini settings when AI jobs are enabled. See the [environment inventory](../deployment/environment-variables.md).

OpenAPI is available at `GET /api/v1/openapi.json`. SSE delivery is best-effort: clients must refetch on events and cannot depend on replay or cross-instance fan-out.
