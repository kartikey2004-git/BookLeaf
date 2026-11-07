# Environment variables

Copy `.env.example` to ignored `.env.local` for local work. Production values are configured in Render, Vercel, Inngest Cloud, Neon, and Tigris—not in a committed file. Do not expose a secret with `NEXT_PUBLIC_*`.

## API on Render

| Variable                                                  | Required          | Purpose                                                     |
| --------------------------------------------------------- | ----------------- | ----------------------------------------------------------- |
| `NODE_ENV`                                                | Yes               | `production`                                                |
| `API_HOST`                                                | No                | Defaults to `0.0.0.0`                                       |
| `API_PORT`                                                | No                | Local override; Render's `PORT` is used when absent         |
| `LOG_LEVEL`                                               | No                | Defaults to `info`                                          |
| `WEB_ORIGIN`                                              | Yes               | Exact Vercel web origin                                     |
| `CORS_ORIGINS`                                            | Yes               | Comma-separated browser origins; must equal trusted origins |
| `DATABASE_URL`                                            | Yes               | Neon pooled runtime URL                                     |
| `BETTER_AUTH_SECRET`                                      | Yes               | Stable, high-entropy secret                                 |
| `BETTER_AUTH_URL`                                         | Yes               | Exact Vercel origin                                         |
| `BETTER_AUTH_TRUSTED_ORIGINS`                             | Yes               | Same origins as `CORS_ORIGINS`                              |
| `INNGEST_EVENT_KEY`                                       | For ticket triage | Sends ticket-created events to Inngest Cloud                |
| `GEMINI_API_KEY`                                          | For AI drafts     | Server-side Gemini credential                               |
| `GEMINI_MODEL`                                            | No                | Defaults to `gemini-3.6-flash`                              |
| `GEMINI_TIMEOUT_MS`                                       | No                | Defaults to 60000; allowed range is 1000–120000             |
| `TIGRIS_ENDPOINT`                                         | For attachments   | S3-compatible endpoint host or URL                          |
| `TIGRIS_PORT`, `TIGRIS_USE_SSL`                           | No                | Defaults are 443 and `true`                                 |
| `TIGRIS_ACCESS_KEY`, `TIGRIS_SECRET_KEY`, `TIGRIS_BUCKET` | For attachments   | Bucket-scoped object-storage credentials                    |
| `READINESS_CHECK_DATABASE`                                | Recommended       | Set `true` in production                                    |

## Web and Inngest endpoint on Vercel

| Variable                                                               | Required    | Purpose                                                      |
| ---------------------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `NODE_ENV`                                                             | Yes         | `production`                                                 |
| `API_PROXY_URL`                                                        | Yes         | Render HTTPS origin used by the same-origin `/api/*` proxy   |
| `NEXT_PUBLIC_API_URL`                                                  | No          | Optional server-side API base; browser requests are relative |
| `DATABASE_URL`                                                         | Yes         | Neon pooled URL used by `/api/inngest`                       |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS` | Yes         | Required when shared auth code initializes in the function   |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`                             | Yes         | Production event delivery and request verification           |
| `INNGEST_APP_ID`                                                       | No          | Defaults to `foundation-worker`                              |
| `GEMINI_API_KEY`                                                       | For AI jobs | Server-side key used in Inngest functions                    |
| `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS`                                    | No          | Same defaults/limits as the API                              |

Do not configure `TIGRIS_*` in Vercel: attachment uploads are performed by the Render API.

## Local-only values

| Variable family                                    | Purpose                                          |
| -------------------------------------------------- | ------------------------------------------------ |
| `POSTGRES_*` and local `DATABASE_URL`/`DIRECT_URL` | Docker PostgreSQL                                |
| `MINIO_*`                                          | Docker MinIO attachment store                    |
| `BOOKLEAF_DEMO_PASSWORD`                           | Development-only demo/admin account provisioning |
| `INNGEST_BASE_URL`                                 | Optional Inngest Dev Server URL                  |

`DIRECT_URL` is intentionally absent from runtime platform services. It is used only by the controlled Prisma migration step with the Neon direct URL.
