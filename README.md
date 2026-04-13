# VibeAudit

Security scanning for builders shipping fast with AI.

VibeAudit scans code and live apps for security issues, explains what matters in plain English, and generates shareable reports. The repo also includes a separate PRD Review product with its own subscription flow.

## What’s in this repo

- `apps/web` — Next.js 16 frontend
- `apps/api` — Express API, scan workers, Prisma schema
- `packages/mcp-server` — MCP server for scan/report workflows

## Current product split

### 1. VibeAudit Security Scan
- 1 free scan
- Then scan credits:
  - $30 for 1
  - $125 for 5
  - $200 for 10
- No recurring subscription

### 2. PRD Review
- Separate product
- Free tier with limited usage
- PRD Review Pro subscription for unlimited reviews

## Core capabilities

- GitHub repo scanning
- Live URL scanning
- Secrets and dependency checks
- Plain-English findings and fix guidance
- Security score and PDF export
- Shareable report links

## Local development

### Prerequisites

- Node.js 24+
- pnpm 10+
- Docker

### Install

```bash
pnpm install
docker compose up -d
```

### Useful commands

```bash
pnpm dev          # web + api
pnpm dev:web      # frontend only
pnpm dev:api      # api only
pnpm dev:mcp      # mcp server only

pnpm build
pnpm lint

pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
```

## Environment notes

Important backend env vars:

- `DATABASE_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- `OPENAI_API_KEY`

Common frontend env vars:

- `NEXT_PUBLIC_API_URL`

Optional product integrations:

- GitHub / Google OAuth
- ImageKit
- Dodo Payments
- `ENABLE_SCAN_WORKER=true` if you want this API instance to run BullMQ workers (recommended only on a dedicated worker service, especially with Upstash)

See `docs/SETUP.md` for a fuller setup walkthrough.

## Verification

This repo does not have a dedicated automated test suite yet. The main checks are:

```bash
pnpm lint
pnpm --filter @vibeaudit/api build
pnpm --filter @vibeaudit/mcp-server build
pnpm --filter @vibeaudit/web build
```

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/SETUP.md`
- `docs/VibeAudit_PRD.md`
- `docs/VibeAudit_TechSpec.md`
- `packages/mcp-server/README.md`

## Notes

- Branding is now `VibeAudit`
- Main domain is `vibeaudit.site`
- Some MCP config still accepts legacy `ShipSafe_*` env vars as compatibility fallbacks

## Support

- Website: https://vibeaudit.site
- Email: support@vibeaudit.site
