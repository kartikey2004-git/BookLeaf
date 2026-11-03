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
  },
} as const;

export function createDocumentationRouter(): Router {
  const router = Router();
  router.get("/openapi.json", (_request, response) =>
    response.json(openApiDocument),
  );
  return router;
}
