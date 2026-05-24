# Repository Guidelines

## Project Structure & Module Organization
VibeAudit is a `pnpm` workspace with three packages:
- `apps/web`: Next.js 16 frontend. Code lives in `src/app`, `src/components`, `src/hooks`, and `src/lib`; assets live in `public/`.
- `apps/api`: Express API and scan workers. Use `src/routes` for endpoints, `src/services` for domain logic, `src/workers` for queues, and `prisma/` for the schema.
- `packages/mcp-server`: Model Context Protocol server in `src/`.

Prefer the existing `@/*` alias inside each app over deep relative imports.

## Build, Test, and Development Commands
- `pnpm install`: install workspace dependencies.
- `pnpm dev`: run web and API together.
- `pnpm dev:web` / `pnpm dev:api` / `pnpm dev:mcp`: run one package.
- `pnpm build`: build web, API, and MCP server.
- `pnpm lint`: run Next.js ESLint for `apps/web`.
- `pnpm db:generate`, `pnpm db:push`, `pnpm db:migrate`, `pnpm db:studio`: Prisma workflows for `apps/api`.
- `docker compose up -d`: start local Postgres and Redis.

## Coding Style & Naming Conventions
Follow the surrounding file’s style: the web app currently uses double quotes, while API and MCP code use single quotes. Use 2-space indentation, semicolons, and focused modules.

Name React components in PascalCase, hooks as `use-*.ts`, and utility/component files in kebab-case (for example `hero-section.tsx`, `prd-reviews.ts`). Run `pnpm lint`; use package builds as the type-check gate for API and MCP changes.

## Testing Guidelines
There is no dedicated automated test suite yet. Verify changes with the smallest relevant checks:
- `pnpm lint` for frontend edits.
- `pnpm --filter @vibeaudit/api build` for API changes.
- `pnpm --filter @vibeaudit/mcp-server build` for MCP changes.
- Manual smoke testing for auth, scan creation, report views, and PRD review uploads.

When adding tests, place them beside the feature as `*.test.ts` / `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history favors Conventional Commits such as `feat:`, `fix(qa):`, and `style(design):`. Use an imperative summary and optional scope.

PRs should include a short summary, affected workspace(s), linked issue, verification steps, and screenshots for UI changes. Call out schema, env, auth, billing, or scanning-tool changes explicitly.

## Security & Configuration Tips
Never commit secrets. Review changes touching `apps/api/src/config.ts`, auth flows, CORS, payments, or scan tooling carefully. Keep environment changes documented in the PR and prefer Docker-backed local services over ad hoc machine-specific setup.
