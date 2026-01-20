# VibeAudit API Dockerfile
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

# Install Gitleaks
RUN curl -sSL https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_arm64.tar.gz | tar -xz -C /usr/local/bin gitleaks

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=apps/api --workspace=packages/shared

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate Prisma client
RUN npm run db:generate -w apps/api

# Build
RUN npm run build -w apps/api

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/index.js"]
