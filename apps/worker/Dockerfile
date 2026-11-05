# syntax=docker/dockerfile:1
FROM node:26-bookworm-slim AS build

WORKDIR /app
RUN npm install --global pnpm@10.23.0

COPY . .
RUN pnpm install --frozen-lockfile
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build \
 pnpm --filter @repo/database generate \
 && pnpm --filter @repo/ai build \
 && pnpm --filter @repo/ai test:artifact \
 && pnpm --filter @repo/worker build

FROM node:26-bookworm-slim AS runtime

ENV NODE_ENV=production \
    WORKER_HOST=0.0.0.0
WORKDIR /app
RUN npm install --global pnpm@10.23.0 \
 && groupadd --system bookleaf \
 && useradd --system --gid bookleaf --home-dir /app bookleaf

# See the API Dockerfile: shared workspace packages intentionally execute from
# source, so tsx is retained as the minimal runtime loader.
COPY --from=build --chown=bookleaf:bookleaf /app /app
USER bookleaf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8080) + '/api/inngest').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["pnpm", "--filter", "@repo/worker", "exec", "tsx", "src/index.ts"]
