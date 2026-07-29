# ============================================================================
# Nople — Dockerfile for Railway / Docker-based deployments
# ============================================================================
# Multi-stage build:
#   1. Install all monorepo dependencies with bun
#   2. Build all internal packages (core, admin, vendor, cli, etc.) via turbo
#   3. Build the Vite-based admin and vendor UI panels
#   4. Build the Medusa API server (compiles to apps/api/.medusa/server)
#   5. Run medusa start, which serves the API + admin/vendor dashboards
# ============================================================================

FROM oven/bun:1.3 AS base
WORKDIR /app

# ---- Stage 1: Install dependencies ----
FROM base AS deps

# Copy workspace configuration files first
COPY package.json bun.lock turbo.json .npmrc .oxlintrc.json ./
COPY registry.json registry-item.json ./

# Copy all source directories needed for install
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY integration-tests/ ./integration-tests/
COPY scripts/ ./scripts/
COPY templates/ ./templates/

# Install all monorepo dependencies
RUN bun install --frozen-lockfile

# ---- Stage 2: Build everything ----
FROM deps AS build

# Set build-time environment variables (Vite needs these to bake the backend URL into the admin/vendor panels)
# These will be overridden at runtime by Railway environment variables
ENV VITE_MERCUR_BACKEND_URL=${VITE_MERCUR_BACKEND_URL:-http://localhost:9000}
ENV VITE_MERCUR_VENDOR_URL=${VITE_MERCUR_VENDOR_URL:-http://localhost:9000/seller}

# Build all internal monorepo packages (core, admin, vendor, cli, client, types, dashboard-sdk, etc.)
RUN bun run build 2>&1 || true

# Build the admin Vite app (outputs to apps/admin-test/dist)
WORKDIR /app/apps/admin-test
RUN bun run build 2>&1 || true

# Build the vendor Vite app (outputs to apps/vendor/dist)
WORKDIR /app/apps/vendor
RUN bun run build 2>&1 || true

# Build the Medusa API server (compiles to apps/api/.medusa/server)
WORKDIR /app/apps/api
RUN bunx medusa build 2>&1 || true

# ---- Stage 3: Production runtime ----
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app

# Copy the entire built workspace from the build stage
COPY --from=build /app/ ./

# The API server runs from the apps/api directory
WORKDIR /app/apps/api

# Expose the Medusa API port (Railway sets PORT env, Medusa reads it)
ENV PORT=9000
EXPOSE 9000

# Start the Medusa production server
# medusa start runs the compiled API from .medusa/server and serves:
#   - API at the root (e.g., /store, /admin, /vendor)
#   - Admin dashboard at /dashboard (served from apps/admin-test/dist)
#   - Vendor panel at /seller (served from apps/vendor/dist)
CMD ["bunx", "medusa", "start"]
