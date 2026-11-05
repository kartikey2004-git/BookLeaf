# Environment variables

This inventory is derived from .env.example and runtime references. Configure secret values in Google Secret Manager for Cloud Run and Vercel encrypted environment variables only where the frontend truly requires a public value. Never commit values.

| Variable                    | Owner                      | Secret    | Production configuration                                                                              |
| --------------------------- | -------------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| NODE_ENV                    | API, worker, database      | No        | Cloud Run: production.                                                                                |
| API_HOST                    | API                        | No        | 0.0.0.0 for Cloud Run.                                                                                |
| API_PORT                    | API                        | No        | Local override. Cloud Run `PORT` is used when this is unset.                                          |
| WORKER_HOST                 | Worker                     | No        | 0.0.0.0 for Cloud Run.                                                                                |
| WORKER_PORT                 | Worker                     | No        | Local override. Cloud Run `PORT` is used when this is unset.                                          |
| WEB_ORIGIN                  | API                        | No        | Exact Vercel origin, for example https://<project>.vercel.app.                                        |
| CORS_ORIGINS                | API                        | No        | Comma-separated origins; must exactly match BETTER_AUTH_TRUSTED_ORIGINS.                              |
| API_PROXY_URL               | Web server                 | No        | Required Vercel server-only value: Cloud Run API origin for the same-origin `/api/*` proxy.           |
| NEXT_PUBLIC_API_URL         | Web                        | Public    | Optional server-side API origin. Browser requests use relative `/api/*` through the proxy.            |
| LOG_LEVEL                   | API                        | No        | Default is info.                                                                                      |
| READINESS_CHECK_DATABASE    | API                        | No        | Set true in production.                                                                               |
| DATABASE_URL                | Prisma, API, worker        | Yes       | Secret Manager. Use pooled Neon URL at runtime.                                                       |
| DIRECT_URL                  | Prisma migration tooling   | Yes       | Direct Neon URL used preferentially by Prisma migration commands; never inject into runtime services. |
| POSTGRES_USER               | local Docker only          | Sensitive | Do not set for Neon/Cloud Run.                                                                        |
| POSTGRES_PASSWORD           | local Docker only          | Yes       | Do not set for Neon/Cloud Run.                                                                        |
| POSTGRES_DB                 | local Docker only          | Sensitive | Do not set for Neon/Cloud Run.                                                                        |
| POSTGRES_PORT               | local Docker only          | No        | Do not set for Neon/Cloud Run.                                                                        |
| BETTER_AUTH_SECRET          | Auth/API                   | Yes       | Secret Manager, high entropy.                                                                         |
| BETTER_AUTH_URL             | Auth/API                   | No        | Vercel origin when same-origin proxy is deployed.                                                     |
| BETTER_AUTH_TRUSTED_ORIGINS | Auth/API                   | No        | Exact comma-separated browser origins; match CORS origins.                                            |
| BOOKLEAF_DEMO_PASSWORD      | demo provisioner           | Yes       | Development-only; do not set in production.                                                           |
| INNGEST_EVENT_KEY           | API, worker                | Yes       | Secret Manager.                                                                                       |
| INNGEST_SIGNING_KEY         | API, worker                | Yes       | Secret Manager; required by worker in production.                                                     |
| INNGEST_APP_ID              | Worker                     | No        | Defaults to foundation-worker; set a production-unique value if desired.                              |
| INNGEST_BASE_URL            | local only                 | No        | Current .env.example points to local Dev Server; do not set for Cloud production unless required.     |
| GEMINI_API_KEY              | API AI endpoints, worker   | Yes       | Secret Manager.                                                                                       |
| GEMINI_MODEL                | API, worker                | No        | Default gemini-2.5-flash.                                                                             |
| GEMINI_TIMEOUT_MS           | API, worker                | No        | Default 15000; supported range 1000-120000.                                                           |
| GITHUB_CLIENT_ID            | optional Better Auth OAuth | Sensitive | Secret Manager when enabled.                                                                          |
| GITHUB_CLIENT_SECRET        | optional Better Auth OAuth | Yes       | Secret Manager when enabled.                                                                          |

Cloud Run should use secret references rather than literal values. GitHub Actions should use protected environment secrets and Workload Identity Federation, never permanent GCP JSON keys.
