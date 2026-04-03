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

# Install Gitleaks (fetch latest release dynamically)
RUN ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') && \
    GITLEAKS_VERSION=$(curl -s https://api.github.com/repos/gitleaks/gitleaks/releases/latest | grep '"tag_name"' | head -1 | sed 's/.*"v\(.*\)".*/\1/') && \
    echo "Installing gitleaks v${GITLEAKS_VERSION} for ${ARCH}" && \
    curl -sSfL "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_${ARCH}.tar.gz" -o /tmp/gitleaks.tar.gz && \
    tar -xzf /tmp/gitleaks.tar.gz -C /usr/local/bin gitleaks && \
    rm /tmp/gitleaks.tar.gz

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

EXPOSE 8000

CMD ["node", "dist/index.js"]
