# Architecture Overview

VibeAudit is a monorepo application designed to be a lightweight, developer-focused security scanning tool.

## High-Level Structure

The project is structured as a monorepo using npm workspaces:

-   **`apps/web`**: The Next.js frontend application (Landing page, Dashboard, Reports).
-   **`apps/api`**: The backend API service (Scanner engine, User management, Logic).
-   **`packages/*`**: Shared libraries and UI components (if applicable).

## Technology Stack

### Frontend (`apps/web`)
-   **Framework**: Next.js 16 (React 19)
-   **Styling**: Tailwind CSS v4
-   **Icons**: Lucide React
-   **UI Components**: Radix UI primitives
-   **Email**: Resend
-   **Authentication**: Better Auth (in progress/planned)

### Backend (`apps/api`)
-   **Runtime**: Node.js
-   **Framework**: Express v5
-   **Database ORM**: Prisma
-   **Main Database**: PostgreSQL
-   **Queue System**: BullMQ
-   **PDF Generation**: PDFKit
-   **AI Integration**: OpenAI SDK
-   **Git Operations**: simple-git
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
