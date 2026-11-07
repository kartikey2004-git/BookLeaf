# Environment variables

This inventory is derived from .env.example and runtime references. Configure API secrets in Render and Vercel job secrets in encrypted Vercel environment variables. Never commit values.

| Variable                    | Owner                                     | Secret    | Production configuration                                                                                       |
| --------------------------- | ----------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| NODE_ENV                    | API, web jobs (Inngest functions)         | No        | Set to production in deployed services.                                                                        |
| API_HOST                    | API                                       | No        | 0.0.0.0 for Render.                                                                                            |
| API_PORT                    | API                                       | No        | Local override. Render `PORT` is used when this is unset.                                                      |
| WEB_ORIGIN                  | API                                       | No        | Exact Vercel origin, for example https://<project>.vercel.app.                                                 |
| CORS_ORIGINS                | API                                       | No        | Comma-separated origins; must exactly match BETTER_AUTH_TRUSTED_ORIGINS.                                       |
| API_PROXY_URL               | Web server                                | No        | Required Vercel server-only value: Render API origin for the same-origin `/api/*` proxy.                       |
| NEXT_PUBLIC_API_URL         | Web                                       | Public    | Optional server-side API origin. Browser requests use relative `/api/*` through the proxy.                     |
| LOG_LEVEL                   | API                                       | No        | Default is info.                                                                                               |
| READINESS_CHECK_DATABASE    | API                                       | No        | Set true in production.                                                                                        |
| DATABASE_URL                | Prisma, API, web jobs (Inngest functions) | Yes       | Use the selected Neon branch's pooled URL at runtime; configure it in the serverless function environment too. |
| DIRECT_URL                  | Prisma migration tooling                  | Yes       | Direct Neon URL used preferentially by Prisma migration commands; never inject into runtime services.          |
| POSTGRES_USER               | local Docker only                         | Sensitive | Do not set for Neon/Render.                                                                                    |
| POSTGRES_PASSWORD           | local Docker only                         | Yes       | Do not set for Neon/Render.                                                                                    |
| POSTGRES_DB                 | local Docker only                         | Sensitive | Do not set for Neon/Render.                                                                                    |
| POSTGRES_PORT               | local Docker only                         | No        | Do not set for Neon/Render.                                                                                    |
| BETTER_AUTH_SECRET          | Auth/API                                  | Yes       | Secret Manager, high entropy.                                                                                  |
| BETTER_AUTH_URL             | Auth/API                                  | No        | Vercel origin when same-origin proxy is deployed.                                                              |
| BETTER_AUTH_TRUSTED_ORIGINS | Auth/API                                  | No        | Exact comma-separated browser origins; match CORS origins.                                                     |
| BOOKLEAF_DEMO_PASSWORD      | demo provisioner                          | Yes       | Development-only; do not set in production.                                                                    |
| INNGEST_EVENT_KEY           | API, web jobs (Inngest functions)         | Yes       | Configure in Render API and the Vercel job-serving environment.                                                |
| INNGEST_SIGNING_KEY         | Web jobs (Inngest functions)              | Yes       | Required by /api/inngest; configure in its encrypted Vercel environment.                                       |
| INNGEST_APP_ID              | Web jobs (Inngest functions)              | No        | Defaults to foundation-worker (legacy id kept for continuity); set explicitly to override.                     |
| INNGEST_BASE_URL            | local only                                | No        | Current .env.example points to local Dev Server; do not set for Cloud production unless required.              |
| GEMINI_API_KEY              | API AI endpoints, web jobs                | Yes       | Configure only where AI jobs execute.                                                                          |
| GEMINI_MODEL                | API, web jobs                             | No        | Default gemini-3.6-flash.                                                                                      |
| GEMINI_TIMEOUT_MS           | API, web jobs                             | No        | Default 60000; supported range 1000-120000.                                                                    |
| GITHUB_CLIENT_ID            | optional Better Auth OAuth                | Sensitive | Secret Manager when enabled.                                                                                   |
| GITHUB_CLIENT_SECRET        | optional Better Auth OAuth                | Yes       | Secret Manager when enabled.                                                                                   |

Use Render secret values for the API and Vercel Secret values for `/api/inngest`. The API's `WEB_ORIGIN`, `CORS_ORIGINS`, `BETTER_AUTH_URL`, and `BETTER_AUTH_TRUSTED_ORIGINS` must be the exact Vercel production origin. Configure `API_PROXY_URL` on Vercel to the Render HTTPS origin. The Render Blueprint declares every required key and prompts for secret values during its initial sync.
