# Contributing to VibeAudit

Thanks for helping make VibeAudit better. This project is open source and welcomes bug reports, documentation fixes, feature ideas, design feedback, and code contributions.

## Ways to contribute

- **Report bugs:** Open a bug report with reproduction steps, expected behavior, actual behavior, logs, and screenshots when helpful.
- **Request features:** Explain the user problem, who it helps, and the smallest useful version.
- **Improve docs:** Fix unclear setup steps, missing environment variables, API examples, or screenshots.
- **Fix issues:** Look for issues labeled `good first issue`, `help wanted`, or `documentation`.
- **Review pull requests:** Test the branch locally, leave focused feedback, and suggest simpler alternatives when possible.

## Code of conduct

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security reports

Do not open public issues for vulnerabilities. Follow the private reporting process in [SECURITY.md](SECURITY.md).

## Development setup

### Prerequisites

- Node.js 24.x
- npm 10+
- Docker and Docker Compose
- PostgreSQL and Redis, or the services from `docker-compose.yml`

### Local setup

```bash
git clone https://github.com/princepal9120/vibeaudit.git
cd vibeaudit
npm install
cp .env.example .env
# Fill in required environment values in .env
docker compose up -d
npm run db:migrate
npm run dev
```

Default local services:

- Web app: <http://localhost:3000>
- API: <http://localhost:5000>

## Branch and pull request workflow

1. Fork the repository.
2. Create a branch from `master` with a descriptive name:

   ```bash
   git checkout -b fix/short-description
   ```

3. Keep changes focused and small enough to review.
4. Add or update tests when behavior changes. If a package does not have tests yet, document the manual verification you performed.
5. Run the relevant checks before opening a pull request.
6. Open a pull request into `master` and fill out the template.

## Commit style

Use short, imperative commit messages. Conventional Commits are preferred:

- `feat: add repository scan queue status`
- `fix(api): validate scan target URLs`
- `docs: clarify local Redis setup`
- `chore: update issue templates`

## Checks before opening a PR

Run the smallest relevant checks for the area you changed:

```bash
# Frontend lint
npm run lint

# Full workspace build
npm run build

# API build only
npm run build:api

# Web build only
npm run build:web

# Prisma client generation
npm run db:generate
```

If a check cannot run because it needs secrets or external services, note that in the pull request.

## Project areas

- `apps/web` — Next.js frontend and UI components
- `apps/api` — Express API, Prisma schema, authentication, scan orchestration
- `packages/shared` — Shared TypeScript schemas and utilities
- `docs` — Architecture, setup, product, and technical documentation
- `.github` — GitHub Actions, issue templates, and PR templates

## Review expectations

A good pull request includes:

- A clear summary of the user-visible change
- Screenshots or recordings for UI changes
- Notes for schema, auth, billing, scanning, or environment changes
- Verification steps and results
- Linked issues, when applicable

Maintainers may ask for changes to keep the project secure, understandable, and easy to operate.
