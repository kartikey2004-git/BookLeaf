import { Router } from "express";

const openApiDocument = {
  openapi: "3.1.0",
  info: { title: "Foundation API", version: "0.1.0" },
  paths: {
    "/api/v1/health/live": {
      get: {
        summary: "Liveness probe",
        responses: { "200": { description: "Process is alive" } },
      },
    },
    "/api/v1/health/ready": {
      get: {
        summary: "Readiness probe",
        responses: {
          "200": { description: "Required dependencies are ready" },
          "503": { description: "A required dependency is unavailable" },
        },
      },
    },
    "/api/v1/events": {
      get: {
        summary: "Authenticated best-effort server-sent event stream",
        description:
          "The stream sends a connected event and heartbeats. It is capped per user and process, closes after 15 minutes, and does not replay missed events.",
        responses: {
          "200": { description: "SSE stream established" },
          "401": { description: "Unauthenticated" },
          "429": { description: "Active stream limit reached" },
        },
      },
    },
    "/api/v1/author/me": {
      get: {
        summary: "Authenticated author profile",
        responses: {
          "200": { description: "Author profile" },
          "401": { description: "Unauthenticated" },
          "403": { description: "Account is not linked" },
        },
      },
    },
    "/api/v1/author/books": {
      get: {
        summary: "Authenticated author books",
        parameters: [
          { name: "page", in: "query" },
          { name: "pageSize", in: "query" },
        ],
        responses: { "200": { description: "Paginated author books" } },
      },
    },
    "/api/v1/author/books/{bookId}": {
      get: {
        summary: "Authenticated author book",
        parameters: [{ name: "bookId", in: "path", required: true }],
        responses: {
          "200": { description: "Author book" },
          "404": { description: "Book is unavailable" },
        },
      },
    },
    "/api/v1/author/overview": {
      get: {
        summary: "Authenticated author overview",
        responses: { "200": { description: "Author aggregate summary" } },
      },
    },
    "/api/v1/author/tickets": {
      post: {
        summary: "Create an author support ticket",
        responses: {
          "201": { description: "Created ticket" },
          "401": { description: "Unauthenticated" },
        },
      },
      get: {
        summary: "List authenticated author tickets",
        parameters: [
          { name: "status", in: "query" },
          { name: "page", in: "query" },
          { name: "pageSize", in: "query" },
        ],
        responses: { "200": { description: "Paginated ticket list" } },
      },
    },
    "/api/v1/author/tickets/{ticketId}": {
      get: {
        summary: "Get an authenticated author's ticket and public messages",
        parameters: [{ name: "ticketId", in: "path", required: true }],
        responses: {
          "200": { description: "Ticket" },
          "404": { description: "Unavailable ticket" },
        },
      },
    },
    "/api/v1/author/tickets/{ticketId}/messages": {
      post: {
        summary: "Add a public author message to an open or in-progress ticket",
        parameters: [{ name: "ticketId", in: "path", required: true }],
        responses: {
          "201": { description: "Created message" },
          "409": { description: "Ticket is not replyable" },
        },
      },
    },
    "/api/v1/admin/tickets": {
      get: {
        summary: "List operational tickets for administrators",
        parameters: [
          { name: "status", in: "query" },
          { name: "category", in: "query" },
          { name: "priority", in: "query" },
          { name: "assignedAdminId", in: "query" },
          { name: "createdFrom", in: "query" },
          { name: "createdTo", in: "query" },
        ],
        responses: {
          "200": { description: "Prioritized ticket queue" },
          "403": { description: "Administrator access required" },
        },
      },
    },
    "/api/v1/admin/tickets/{ticketId}": {
      get: {
        summary: "Get full administrator ticket detail",
        parameters: [{ name: "ticketId", in: "path", required: true }],
        responses: {
          "200": { description: "Ticket with notes and audit history" },
        },
      },
    },
    "/api/v1/admin/tickets/{ticketId}/status": {
      patch: {
        summary: "Change ticket status using current ticket version",
        responses: {
          "200": { description: "Updated ticket" },
          "409": { description: "Invalid transition or concurrent change" },
        },
      },
    },
    "/api/v1/admin/tickets/{ticketId}/priority": {
      patch: {
        summary: "Change ticket priority using current ticket version",
        responses: {
          "200": { description: "Updated ticket" },
          "409": { description: "Concurrent change" },
        },
      },
    },
    "/api/v1/admin/tickets/{ticketId}/category": {
      patch: {
        summary: "Change ticket category using current ticket version",
        responses: {
          "200": { description: "Updated ticket" },
          "409": { description: "Concurrent change" },
        },
      },
    },
    "/api/v1/admin/tickets/{ticketId}/assignment": {
      patch: {
        summary: "Assign or unassign a ticket using current ticket version",
        responses: {
          "200": { description: "Updated ticket" },
          "422": { description: "Assignee is not an administrator" },
        },
      },
    },
    "/api/v1/admin/tickets/{ticketId}/messages": {
      post: {
        summary: "Add a public administrator response",
        responses: { "201": { description: "Created message" } },
      },
    },
    "/api/v1/admin/tickets/{ticketId}/ai-draft": {
      post: {
        summary: "Generate an administrator-reviewable Gemini support draft",
        description:
          "Requires an administrator session. The draft is never sent or stored as a public ticket message.",
        parameters: [{ name: "ticketId", in: "path", required: true }],
        responses: {
          "200": {
            description: "Structured draft and current AI recommendations",
          },
          "401": { description: "Unauthenticated" },
          "403": { description: "Administrator access required" },
          "404": { description: "Ticket not found" },
          "502": { description: "Invalid provider response" },
          "503": { description: "Gemini unavailable or unconfigured" },
        },
      },
      "/api/v1/admin/tickets/{ticketId}/ai-draft/stream": {
        post: {
          summary: "Stream an administrator-reviewable Gemini support draft",
          description:
            "Requires an administrator session. Emits server-sent events: chunk with text, done with the complete draft and recommendations, or error. The draft is never sent or stored as a public ticket message.",
          parameters: [{ name: "ticketId", in: "path", required: true }],
          responses: {
            "200": {
              description: "Server-sent events containing the generated draft",
              content: { "text/event-stream": {} },
            },
            "401": { description: "Unauthenticated" },
            "403": { description: "Administrator access required" },
            "404": { description: "Ticket not found" },
            "502": { description: "Invalid provider response" },
            "503": { description: "Gemini unavailable or unconfigured" },
          },
        },
      },
    },
    "/api/v1/admin/tickets/{ticketId}/internal-notes": {
      post: {
        summary: "Add a private administrator note",
        responses: { "201": { description: "Created private note" } },
      },
    },
  },
} as const;

export function createDocumentationRouter(): Router {
  const router = Router();
  router.get("/openapi.json", (_request, response) =>
    response.json(openApiDocument),
  );
  return router;
}
