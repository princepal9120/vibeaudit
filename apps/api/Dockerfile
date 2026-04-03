# ShipSafe API — Production Dockerfile (Monorepo optimized for Railway)
# ─────────────────────────────────────────────────────────────────────────────

# ─── Stage 1: base — security tools (CI/scan use only) ───────────────────────
FROM node:24-alpine AS base

# Install OS dependencies needed for scanning
RUN apk add --no-cache \
    git \
    python3 \
    py3-pip \
    curl \
    openssl \
    && pip3 install --break-system-packages semgrep --quiet

# Install Trivy (using latest binary directly)
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh \
    | sh -s -- -b /usr/local/bin

# Install Gitleaks (detect arch: x64 or arm64)
# Note: GitHub API calls can hit rate limits in CI — we use a stable version
RUN ARCH=$(uname -m | sed 's/x86_64/x64/;s/aarch64/arm64/') && \
    curl -sSfL "https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_${ARCH}.tar.gz" -o /tmp/gitleaks.tar.gz && \
    tar -xzf /tmp/gitleaks.tar.gz -C /usr/local/bin gitleaks && \
    rm /tmp/gitleaks.tar.gz


# ─── Stage 2: deps — install node_modules ────────────────────────────────────
FROM node:24-alpine AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root monorepo files for pnpm workspace detection
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy the api package.json for dependency resolution
COPY apps/api/package.json ./apps/api/

# Install only the API's dependencies (including workspace deps)
RUN pnpm install --frozen-lockfile --filter @ShipSafe/api


# ─── Stage 3: builder — compile TypeScript ───────────────────────────────────
FROM base AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependencies and files from previous stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/pnpm-workspace.yaml ./

# Copy the actual API source code
COPY apps/api ./apps/api

# Generate Prisma client first
RUN pnpm --filter @ShipSafe/api exec prisma generate

# Final build
RUN pnpm --filter @ShipSafe/api build


# ─── Stage 4: runner — lean production image ─────────────────────────────────
FROM base AS runner

WORKDIR /app

# Set production env
ENV NODE_ENV=production

# Copy only what production needs from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Ensure corepack is ready for any pnpm execution
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app/apps/api

# EXPOSE the port — Railway injects $PORT but this helps with documentation
EXPOSE 8000

CMD ["node", "dist/index.js"]
