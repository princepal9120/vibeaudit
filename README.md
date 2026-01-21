# VibeAudit

<div align="center">

![VibeAudit](https://img.shields.io/badge/VibeAudit-v1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-MVP-yellow)

**Security scanning platform for indie builders, vibe coders, freelancers, and early-stage teams**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## 🎯 About VibeAudit

VibeAudit is a security scanning platform built for developers who ship code fast using AI tools. It validates code and live apps for security vulnerabilities, translates findings into plain English, and generates client-friendly reports—without the complexity, cost, or setup friction of enterprise security tools.

### Why VibeAudit?

- **Built for speed:** 2-3 minute scans, zero setup required
- **Plain-English explanations:** No security expertise needed
- **Pay-per-scan:** No subscriptions, no minimums ($15-50/scan)
- **Comprehensive coverage:** Code repositories + live applications
- **AI-powered fixes:** GPT-4 powered remediation suggestions

### Target Users

| User Type | Use Case |
|-----------|----------|
| **Solo Builders** | Pre-launch security validation |
| **Freelancers/Agencies** | Client handoff audit reports |
| **Vibe Coders** | AI-generated code validation |

---

## ✨ Features

### Code Scanning
- ✅ GitHub repository analysis (public & private)
- ✅ SAST with Semgrep (OWASP Top 10, CWE Top 25)
- ✅ Dependency vulnerability detection (npm, pip, go, etc.)
- ✅ Secrets detection (API keys, tokens, credentials)
- ✅ Multi-language support: JavaScript/TypeScript, Python, Go, Java, Ruby, PHP, C#

### Live App Scanning
- ✅ Dynamic Application Security Testing (DAST)
- ✅ OWASP ZAP integration
- ✅ Security headers validation (CSP, HSTS, X-Frame-Options)
- ✅ SSL/TLS certificate analysis
- ✅ XSS vulnerability detection
- ✅ CSRF token validation

### AI-Powered Insights
- ✅ Plain-English vulnerability explanations
- ✅ Severity scoring (CRITICAL, HIGH, MEDIUM, LOW)
- ✅ Step-by-step fix recommendations
- ✅ Code snippets and examples
- ✅ Security glossary with inline definitions

### Reporting & Sharing
- ✅ Security score (0-100) with visual indicators
- ✅ Professional PDF report generation
- ✅ Shareable report links (30-day expiration)
- ✅ Co-branded reports for freelancers
- ✅ Scan history dashboard
- ✅ Before/after comparison

### Pricing
- **1 free scan** per user
- **$30 per additional scan**
- No subscriptions, no hidden fees

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    VibeAudit System                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   Frontend (Next.js) │  ← Vercel Deployment
└──────────────────────┘
         │ REST API
         ↓
┌──────────────────────┐
│  Backend (Express.js) │  ← AWS ECS Fargate
└──────────────────────┘
         │
    ┌────┴─────────────────────────────┐
    │                                   │
┌─────────────────┐          ┌──────────────────┐
│ Scanning Queue  │          │  LLM Integration │
│  (BullMQ/Redis) │          │  (OpenAI GPT-4o) │
└─────────────────┘          └──────────────────┘
    │                              │
    ↓                              ↓
┌─────────────────────────────────────────────┐
│         Worker Process                       │
│  Semgrep | OWASP ZAP | Trivy | npm audit    │
└─────────────────────────────────────────────┘
    │
    ↓
┌─────────────────────────────────────────────┐
│  PostgreSQL (AWS RDS) + S3 (Report Storage) │
└─────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 16.1.x |
| | React | 19.2.x |
| | TailwindCSS | 4.1.x |
| | shadcn/ui | Latest |
| **Backend** | Node.js | 24.x LTS |
| | Express.js | 5.2.x |
| | BullMQ | 5.66.x |
| **Database** | PostgreSQL | 18.1 |
| | Redis | 8.4.x |
| | Prisma ORM | 7.2.x |
| **Scanning** | Semgrep | 1.148.x |
| | OWASP ZAP | 2.17.x |
| | Trivy | 0.68.x |
| **AI** | OpenAI GPT-4o | Latest |
| **Deployment** | Vercel | Frontend |
| | AWS ECS Fargate | Backend |
| | AWS RDS | Database |
| | AWS S3 | Storage |
| **Auth** | Auth.js (NextAuth) | 5.x |

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for detailed system design.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 24.x LTS
- Docker & Docker Compose
- PostgreSQL 18.1
- Redis 8.4.x
- OpenAI API key

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourorg/vibeaudit.git
cd vibeaudit

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your environment variables
nano .env

# Start local services (PostgreSQL, Redis)
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development servers
npm run dev
```

Access the application at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://vibeaudit:password@localhost:5432/vibeaudit

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# AWS (Optional - for S3 reports)
AWS_S3_BUCKET=vibeaudit-reports
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# API
API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

See [`SETUP.md`](SETUP.md) for detailed setup instructions.

---

## 📁 Project Structure

```
vibeaudit/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities & helpers
│   │   └── public/         # Static assets
│   │
│   └── api/                 # Express.js backend application
│       ├── src/
│       │   ├── routes/     # API endpoints
│       │   ├── services/   # Business logic
│       │   ├── workers/    # Background jobs
│       │   └── utils/      # Utilities
│       └── prisma/         # Database schema
│
├── packages/
│   └── shared/              # Shared TypeScript types & utilities
│       ├── src/
│       │   ├── types/      # Shared type definitions
│       │   └── utils/      # Shared utilities
│       └── package.json
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   └── API.md
│
├── docker-compose.yml       # Local development services
├── package.json            # Root package.json
├── turbo.json              # Turborepo configuration
└── README.md
```

---

## 🔧 Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start all apps (web + api)
npm run dev:web          # Start frontend only
npm run dev:api          # Start backend only

# Build
npm run build            # Build all apps
npm run build:web        # Build frontend only
npm run build:api        # Build backend only

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Linting & Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting errors
npm run format           # Run Prettier
npm run format:fix       # Fix formatting issues

# Type Checking
npm run typecheck        # Run TypeScript type checks

# Docker
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run docker:logs      # View Docker logs
```

### Code Quality

- **Linting:** ESLint + TypeScript
- **Formatting:** Prettier
- **Type Checking:** TypeScript strict mode
- **Testing:** Jest + Playwright (E2E)
- **Pre-commit Hooks:** Husky + lint-staged

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Detailed system architecture, database schema, API design |
| [`SETUP.md`](SETUP.md) | Development environment setup, deployment guide |
| [`API.md`](API.md) | API endpoint documentation (auto-generated) |
| [CLAUDE.md](CLAUDE.md) | Complete PRD and technical specifications |

---

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
npm run build:web
vercel --prod
```

### Backend (AWS ECS)

```bash
npm run build:api
docker build -t vibeaudit-api .
docker push your-registry/vibeaudit-api:latest
# Deploy via AWS Console or Terraform
```

### Database Migrations

```bash
# Production
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

See [`SETUP.md`](SETUP.md) for complete deployment guide.

---

## 🔒 Security & Privacy

### Security Commitments
- ✅ All data encrypted at rest and in transit (HTTPS/TLS 1.3)
- ✅ No code stored longer than necessary (deleted after report)
- ✅ User scans are private by default
- ✅ GDPR/CCPA compliant
- ✅ No user code used for AI training

### Data Retention

| Data Type | Retention |
|-----------|-----------|
| Findings | Indefinitely (user-owned) |
| Temp artifacts | Deleted after 24 hours |
| PDFs | Indefinitely (user-owned) |

### Privacy

- We do not sell user data
- We do not use user code for AI model training
- Users can request full data deletion

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint && npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

- **Documentation:** Check the [`docs/`](docs/) folder
- **Issues:** Open a GitHub issue
- **Discussions:** Join our GitHub Discussions
- **Email:** support@vibeaudit.dev

---

## 🗺️ Roadmap

### MVP (Weeks 1-3) ✅
- [x] GitHub repo scanning
- [x] Live URL scanning
- [x] Secrets detection
- [x] AI explanations
- [x] PDF reports

### Phase 2 (Weeks 4-8)
- [ ] Private GitHub repo scanning
- [ ] Advanced DAST (API testing)
- [ ] Stripe integration
- [ ] Freelancer features

### Phase 3+ (Months 2-3)
- [ ] Team collaboration
- [ ] Scheduled scans
- [ ] Slack/webhook notifications
- [ ] Compliance mapping

---

## 🌟 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Security scanning powered by [Semgrep](https://semgrep.dev), [OWASP ZAP](https://www.zaproxy.org), and [Trivy](https://aquasecurity.github.io/trivy)
- AI explanations powered by [OpenAI GPT-4o](https://openai.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

<div align="center">

**Built with ❤️ for indie developers everywhere**

[⬆ Back to top](#vibeaudit)

</div>
