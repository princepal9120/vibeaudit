# VibeAudit Web Frontend Dockerfile
FROM node:24-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=apps/web --workspace=packages/shared

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

# Build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build -w apps/web

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "start"]
