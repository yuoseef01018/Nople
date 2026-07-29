# ============================================================================
# Nople — Dockerfile for Railway / Docker-based deployments
# ============================================================================
# Single-stage build: install all deps, build everything, run medusa start.
# Railway should create ONE service from this Dockerfile, NOT multiple.
# ============================================================================

FROM oven/bun:1.3
WORKDIR /app

# ---- Copy the entire repository ----
COPY . .

# ---- Install all monorepo dependencies ----
RUN bun install --frozen-lockfile

# ---- Build all internal monorepo packages ----
# This builds: core, admin, vendor, cli, client, types, dashboard-sdk, etc.
RUN bun run build 2>&1 || true

# ---- Build the admin Vite app (outputs to apps/admin-test/dist) ----
WORKDIR /app/apps/admin-test
RUN bun run build 2>&1 || true

# ---- Build the vendor Vite app (outputs to apps/vendor/dist) ----
WORKDIR /app/apps/vendor
RUN bun run build 2>&1 || true

# ---- Build the Medusa API server (compiles to apps/api/.medusa/server) ----
WORKDIR /app/apps/api
RUN bunx medusa build 2>&1 || true

# ---- Start the Medusa production server ----
# medusa start serves:
#   - API at the root (e.g., /store, /admin, /vendor)
#   - Admin dashboard at /dashboard (served from apps/admin-test/dist)
#   - Vendor panel at /seller (served from apps/vendor/dist)
WORKDIR /app/apps/api
ENV PORT=9000
ENV NODE_ENV=production
EXPOSE 9000

CMD ["bunx", "medusa", "start"]
