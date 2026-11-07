# Production readiness checklist

This is a release checklist for the active BookLeaf stack. It does not claim that a provider resource has been inspected or deployed.

## Code and release checks

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Prisma migration is reviewed and applied once with Neon's direct URL.

## Render API

- [ ] Render service builds from repository root with `apps/api/Dockerfile`.
- [ ] `DATABASE_URL` is the Neon pooled production URL.
- [ ] Better Auth URL, trusted origins, web origin, and CORS origins use the exact Vercel browser origin.
- [ ] Tigris credentials are configured only in Render.
- [ ] `READINESS_CHECK_DATABASE=true` is set.
- [ ] Liveness and readiness endpoints both return success after deployment.

## Vercel and Inngest

- [ ] Vercel Root Directory is `apps/web`.
- [ ] `API_PROXY_URL` points to the Render HTTPS origin without a trailing slash.
- [ ] The Vercel environment contains the server-side database, Better Auth, Inngest, and Gemini variables required by `/api/inngest`.
- [ ] Inngest Cloud has exactly one production serve endpoint: `https://<vercel-origin>/api/inngest`.
- [ ] Inngest discovers the expected functions before production ticket traffic is enabled.

## Smoke test

- [ ] Sign in as an author and an administrator.
- [ ] Load books and royalty data through the Vercel proxy.
- [ ] Create a ticket and verify the expected initial classification status.
- [ ] Confirm an Inngest job completes or that manual-classification fallback is visible when AI is intentionally unavailable.
- [ ] Generate an administrator AI draft and confirm it remains a draft.
- [ ] Upload and download one Tigris attachment.
- [ ] Review Render, Vercel, and Inngest logs for errors without logging credentials or ticket content.

For configuration ownership and rollback guidance, use the [production deployment guide](./render-production-deployment-guide.md).
