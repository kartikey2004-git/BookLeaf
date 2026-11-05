# syntax=docker/dockerfile:1
FROM node:26-bookworm-slim AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @repo/database generate \
 && pnpm --filter @repo/ai build \
 && pnpm --filter @repo/api build

FROM node:26-bookworm-slim AS runtime

ENV NODE_ENV=production \
    API_HOST=0.0.0.0
WORKDIR /app
RUN groupadd --system bookleaf && useradd --system --gid bookleaf --home-dir /app bookleaf

# Workspace packages currently export TypeScript source. Keep the workspace
# runtime intact and use tsx only as the production TypeScript loader.
COPY --from=build --chown=bookleaf:bookleaf /app /app
USER bookleaf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8080) + '/api/v1/health/live').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["pnpm", "--filter", "@repo/api", "exec", "tsx", "src/server.ts"]
