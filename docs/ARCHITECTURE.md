# Architecture Overview

ShipSafe is a monorepo application designed to be a lightweight, developer-focused security scanning tool.

## High-Level Structure

The project is structured as a monorepo using npm workspaces:

-   **`apps/web`**: The Next.js frontend application (Landing page, Dashboard, Reports).
-   **`apps/api`**: The backend API service (Scanner engine, User management, Logic).
-   **`packages/*`**: Shared libraries and UI components (if applicable).

## Technology Stack

### Frontend (`apps/web`)
-   **Framework**: Next.js 16.1 (App Router)
-   **UI Library**: React 19.2
-   **Styling**: Tailwind CSS v4.1
-   **Icons**: Lucide React
-   **UI Components**: Radix UI primitives + shadcn/ui
-   **Email**: Resend
-   **Authentication**: Better Auth v1.4 (cookie-based sessions, no vendor lock-in)

### Backend (`apps/api`)
-   **Runtime**: Node.js 24.x LTS
-   **Framework**: Express v5.2
-   **Database ORM**: Prisma 7.2
-   **Main Database**: PostgreSQL 18
-   **Queue System**: BullMQ 5.66
-   **Cache**: Redis 8.4
-   **PDF Generation**: PDFKit
-   **AI Integration**: OpenAI SDK (GPT-4o)
-   **Git Operations**: simple-git
-   **Scanning Tools**: Semgrep, OWASP ZAP, Trivy
-   **Language**: TypeScript

## Key Components

### 1. Landing & Pricing (Current Focus)
-   Marketing pages with "Starter", "Pro", and "Enterprise" tiers.
-   Waitlist functionality gating paid features using a modal and email collection.
-   Integration with Resend for transactional "Coming Soon" emails.

### 2. Scanner Engine
-   Analysis of GitHub repositories and Live URLs.
-   Secrets detection, dependency auditing, and DAST (Dynamic Application Security Testing) checks.
-   AI-powered analysis to translate technical findings into plain English.

## Data Flow

1.  **User Input**: User provides a Repo URL or Live URL via the frontend.
2.  **API Request**: Frontend sends request to `apps/api`.
3.  **Scanning**: Backend clones repo (ephemeral) or crawls URL.
4.  **Analysis**: Results are processed, secrets detected, and vulnerability checks run.
5.  **Persistence**: Findings are saved to PostgreSQL via Prisma.
6.  **Reporting**: Frontend fetches results and generates a secure, shareable report (PDF support planned).

## Infrastructure

-   **Docker**: Used for local database orchestration (`docker-compose.yml`).
-   **CI/CD**: GitHub Actions (currently paused for development velocity).
