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
  },
} as const;

export function createDocumentationRouter(): Router {
  const router = Router();
  router.get("/openapi.json", (_request, response) =>
    response.json(openApiDocument),
  );
  return router;
}
