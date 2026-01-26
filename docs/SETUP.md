# Developer Setup Guide

Follow these instructions to get ShipSafe running on your local machine.

## Prerequisites

-   **Node.js**: v24.x LTS (required for Next.js 16 compatibility).
-   **Docker**: For running the local PostgreSQL database.
-   **npm**: Included with Node.js.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-org/ShipSafe.git
    cd ShipSafe
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Environment Configuration

1.  **Frontend (`apps/web`)**:
    Create a `.env` file in `apps/web`:
    ```env
    # Resend API Key for email notifications
    RESEND_API_KEY=re_123456789
    
    # Internal generic variables if needed
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

2.  **Backend (`apps/api`)**:
    Create a `.env` file in `apps/api`:
    ```env
    # Database Connection
    DATABASE_URL="postgresql://user:password@localhost:5432/ShipSafe?schema=public"
    ```

## Database Setup

1.  **Start PostgreSQL**:
    ```bash
    docker-compose up -d
    ```

2.  **Push Schema**:
    Apply the Prisma schema to your local database.
    ```bash
    npm run db:push
    ```

## Running the App

You can run both the frontend and backend concurrently from the root directory:

```bash
npm run dev
```

-   **Frontend**: [http://localhost:3000](http://localhost:3000)
-   **Backend API**: [http://localhost:3001](http://localhost:3001) (or configured port)

## Common Commands

-   `npm run build`: Build all apps.
-   `npm run lint`: Lint the codebase.
-   `npm run db:studio`: Open Prisma Studio to inspect the database.
