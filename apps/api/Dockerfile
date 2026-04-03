# ShipSafe API Dockerfile
FROM node:24-alpine AS base

# Install security scanning tools
RUN apk add --no-cache \
    git \
    python3 \
    py3-pip \
    curl \
    openssl \
    && pip3 install --break-system-packages semgrep

# Install Trivy
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Install Gitleaks (auto-detect architecture)
RUN ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') && \
    curl -sSL "https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_${ARCH}.tar.gz" | tar -xz -C /usr/local/bin gitleaks

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @ShipSafe/api

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma client
RUN pnpm --filter @ShipSafe/api exec prisma generate

# Build
RUN pnpm --filter @ShipSafe/api build

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/index.js"]
