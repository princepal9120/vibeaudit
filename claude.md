# VibeAudit: Unified Product Requirements Document

**Version:** 1.0 (MVP)  
**Last Updated:** January 2026  
**Status:** Pre-Development

---

## Executive Summary

**VibeAudit** is a security scanning platform built for indie builders, vibe coders, freelancers, and early-stage teams who ship code fast using AI tools. It validates code and live apps for security vulnerabilities, translates findings into plain English, and generates client-friendly reports—without the complexity, cost, or setup friction of enterprise security tools.

| Attribute           | Value                                                                        |
| ------------------- | ---------------------------------------------------------------------------- |
| **Target Customer** | Solo SaaS founder shipping production software built 50%+ with Cursor/Claude |
| **Pricing Model**   | Security Scan uses pay-per-scan credits, PRD Review is a separate subscription product |
| **Core Value**      | Democratize security for people who code without security teams              |

### Current Product Reality

- **VibeAudit Security Scan:** 1 free scan, then $29 for 1, $99 for 5, or $179 for 10.
- **PRD Review:** separate product with a free tier and PRD Review Pro for unlimited reviews.
- **Auth:** Better Auth, not NextAuth.
- **Billing:** current checkout flow uses Dodo Payments.

---

## 1. Problem Statement

### Current Pain Points

| Problem                                                          | Impact                            |
| ---------------------------------------------------------------- | --------------------------------- |
| 48% of AI-generated code contains security flaws (Veracode 2025) | Widespread vulnerability exposure |
| Enterprise security tools cost $125+/month minimum               | Inaccessible for indie builders   |
| Solo builders ship production code without validation            | Security breaches destroy trust   |
| Vibe coders don't understand findings ("CWE-94? SAST?")          | Knowledge gaps lead to inaction   |
| No tool scans GitHub repos + live URLs in unified report         | Fragmented security workflow      |

### Solution

**VibeAudit** scans code and live apps, flags vulnerabilities, explains findings in plain English, suggests AI-powered fixes, and generates reports for stakeholders—all in 2-3 minutes, no setup required.

---

## 2. User Personas

### Primary: Solo Builders (Indie Hackers)

```
Profile: Shipping fast with AI tools (Cursor, Copilot, Claude)
         Tech-savvy but not security specialists
Budget:  $0-50/month, willing to pay for peace of mind
Pain:    "Did my AI code break security?"

Goals:   → Validate code before public launch
         → Prove security was considered
         → Sleep soundly after deploying

Pattern: Once per project (pre-launch), occasionally before major updates
```

### Secondary 1: Freelancers & Agencies

```
Profile: Solo freelancer or 2-5 person team
         Per-project work, high reputational risk
Pain:    "My freelancer delivered insecure code" / "I need proof I audited this"

Goals:   → Add "security audit" as paid service
         → Validate code before client handoff
         → Reduce post-delivery liability

Pattern: Once per project before delivery, want co-branded reports
```

### Secondary 2: Vibe Coders (Non-Technical)

```
Profile: Designer, PM, marketer, or "I learned to code with AI"
         Shipping fast, understanding less
Budget:  $0-20/month, price-sensitive
Pain:    "Is this safe? What does 'injection' mean?"

Goals:   → Assure client/themselves that app is safe
         → Understand security in plain English

Pattern: Once per project, need visual/simple scoring
```

---

## 3. Core Use Cases

### Use Case 1: Pre-Launch Security Validation

| Attribute           | Detail                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| **Actor**           | Solo SaaS founder                                                                                       |
| **Trigger**         | "Shipping tomorrow, want to validate code"                                                              |
| **Input**           | GitHub repo URL + live staging URL                                                                      |
| **Output**          | Pass/fail scoring, prioritized issues, fix recommendations                                              |
| **Expected Result** | "3 findings: 1 CRITICAL (auth), 1 MEDIUM (headers), 1 LOW (dep update)" with plain-English explanations |

### Use Case 2: Client Handoff Audit

| Attribute           | Detail                                                    |
| ------------------- | --------------------------------------------------------- |
| **Actor**           | Freelancer                                                |
| **Trigger**         | "Code done, about to deliver to client"                   |
| **Input**           | GitHub repo + staging URL                                 |
| **Output**          | Professional PDF report, co-branded, client-friendly      |
| **Expected Result** | Client sees "Your app passed 4 automated security checks" |

### Use Case 3: AI Code Validation

| Attribute           | Detail                                                                |
| ------------------- | --------------------------------------------------------------------- |
| **Actor**           | Vibe coder                                                            |
| **Trigger**         | "I built 90% with Claude, is it vulnerable?"                          |
| **Input**           | Live URL (no GitHub access needed)                                    |
| **Output**          | Plain-English vulnerability list with severity                        |
| **Expected Result** | "Hardcoded API keys (CRITICAL)", "Client-side auth (HIGH)" with fixes |

### Use Case 4: Dependency & Secrets Audit

| Attribute   | Detail                                                 |
| ----------- | ------------------------------------------------------ |
| **Actor**   | Freelancer reviewing legacy code                       |
| **Trigger** | "Client handed me their old repo, I'm adding features" |
| **Input**   | GitHub repo                                            |
| **Output**  | Dependencies, secrets, code issues—prioritized         |

---

## 4. Success Metrics

### Business Goals

| Goal             | Target                      | Timeline |
| ---------------- | --------------------------- | -------- |
| MVP Users        | 100 users                   | 8 weeks  |
| Paying Customers | 20+ customers               | 12 weeks |
| Monthly Revenue  | $5k MRR                     | 6 months |
| Retention        | 30%+ return for second scan | Ongoing  |
| NPS              | 40+                         | Ongoing  |

### User Success Metrics

| Metric                   | Target                                          |
| ------------------------ | ----------------------------------------------- |
| Scan Completion Time     | <3 minutes (input to report)                    |
| Setup Required           | Zero (no CLI knowledge needed)                  |
| Finding Clarity          | 90% understood by non-technical users           |
| Fix Suggestions Coverage | 80%+ of findings have guidance                  |
| Report Quality           | Professional enough for client/investor sharing |

### MVP Success Criteria

- [x] First 10 users sign up organically (no paid ads)
- [x] 3+ users willing to pay for a scan ($25+)
- [x] NPS > 30
- [x] <5% of findings are false positives
- [x] Average scan time <3 minutes
- [x] 50%+ of users say "I'd use this before shipping"

---

## 5. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    VibeAudit System                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   Frontend (Next.js) │  (Authentication, Dashboard, Report View)
└──────────────────────┘
         │
         │ (REST API)
         │
┌──────────────────────┐
│  Backend (Node.js)   │  (Auth, API, Orchestration, Database)
└──────────────────────┘
         │
    ┌────┴─────────────────────────────┐
    │                                   │
┌─────────────────┐          ┌──────────────────┐
│ Scanning Queue  │          │  LLM Integration │
│ (Bull/Redis)    │          │  (OpenAI GPT-4)  │
└─────────────────┘          └──────────────────┘
    │                              │
    │                              │
┌────┴──────────────────────────────┴────┐
│         Worker Process                  │
│  (Semgrep + ZAP + npm audit + Trivy)   │
└────────────────────────────────────────┘
    │
    └─────→ Database (PostgreSQL)
    └─────→ Storage (S3 for reports/artifacts)
```

### Tech Stack Summary (Verified Latest - January 2026)

| Layer          | Technology         | Version  | Rationale                                  |
| -------------- | ------------------ | -------- | ------------------------------------------ |
| **Frontend**   | Next.js            | 16.1.x   | App Router, React Compiler support         |
| **Frontend**   | React              | 19.2.x   | Concurrent features, improved hydration    |
| **Frontend**   | TailwindCSS        | 4.1.x    | JIT compiler, modern CSS features          |
| **Frontend**   | shadcn/ui          | Latest   | Accessible, customizable components        |
| **Backend**    | Node.js            | 24.x LTS | Latest active LTS (released Oct 2025)      |
| **Backend**    | Express.js         | 5.2.x    | ✅ **Chosen** - Native async/await support |
| **Database**   | PostgreSQL         | 18.1     | JSONB, better performance                  |
| **ORM**        | Prisma             | 7.2.x    | Type-safe queries, new migrations engine   |
| **Cache**      | Redis              | 8.4.x    | Streams, better memory efficiency          |
| **Queue**      | BullMQ             | 5.66.x   | Modern Bull replacement, better DX         |
| **LLM**        | OpenAI GPT-4o      | Latest   | Best quality, multimodal support           |
| **Scanning**   | Semgrep            | 1.148.x  | 2026 release with improved rules           |
| **Scanning**   | OWASP ZAP          | 2.17.x   | DAST, API scanning                         |
| **Scanning**   | Trivy              | 0.68.x   | Secrets, containers, IaC                   |
| **Deployment** | Vercel             | -        | Next.js native, edge functions             |
| **Deployment** | AWS ECS Fargate    | -        | Serverless containers                      |
| **Auth**       | Better Auth        | 1.4.x    | No vendor lock-in, Prisma adapter, cookie sessions |

### Backend Framework Comparison

| Criteria                | Express.js             | NestJS                              | FastAPI                      |
| ----------------------- | ---------------------- | ----------------------------------- | ---------------------------- |
| **Language**            | JavaScript/TypeScript  | TypeScript                          | Python                       |
| **Architecture**        | Minimal, unopinionated | Opinionated, modular (Angular-like) | Modern, async-first          |
| **Learning Curve**      | Low                    | Medium-High                         | Low-Medium                   |
| **Performance**         | Good                   | Good (Express under the hood)       | Excellent (async, Starlette) |
| **Type Safety**         | Optional (TS)          | Built-in (TS)                       | Built-in (Pydantic)          |
| **DX (Dev Experience)** | Simple, flexible       | Structured, enterprise-ready        | Auto-docs, validation        |
| **Ecosystem**           | Massive (npm)          | Growing (npm)                       | Growing (PyPI)               |
| **Microservices**       | Manual setup           | Built-in support                    | Manual setup                 |
| **Testing**             | Manual setup           | Built-in (Jest)                     | Built-in (pytest)            |
| **OpenAPI/Swagger**     | Manual (swagger-jsdoc) | Built-in (@nestjs/swagger)          | Auto-generated               |
| **Worker Processes**    | Bull/BullMQ            | Bull/BullMQ                         | Celery/ARQ                   |
| **Team Familiarity**    | Common                 | Less common                         | Python teams                 |

#### Recommendation for VibeAudit

| Framework      | Pros                                         | Cons                                                         | Verdict                                   |
| -------------- | -------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| **Express.js** | Fast to build MVP, huge ecosystem, simple    | No structure enforcement, manual setup for everything        | ✅ **Best for MVP speed**                 |
| **NestJS**     | Enterprise-grade, decorators, DI, modules    | Steeper learning curve, more boilerplate                     | ✅ **Best for long-term maintainability** |
| **FastAPI**    | Fastest performance, auto-docs, async-native | Python ecosystem (different from Next.js), Celery complexity | ⚠️ **Consider if Python team**            |

> [!IMPORTANT]
> **Final Decision: Express.js 5.2.x**
>
> We're proceeding with Express.js 5.2.1 (stable release Dec 2025) for the following reasons:
>
> - **Native Promise Support:** No more async wrapper middleware needed.
> - **Performance:** Faster routing engine and lower overhead compared to v4.
> - **Stability:** Officially default on npm since March 2025.
> - **Compatibility:** Seamless integration with Node.js 24 LTS and modern ESM.
> - **MVP:** Fastest path to delivery with familiar ecosystem.

---

## 6. Functional Requirements

### 6.1 Code Scanning Engine

#### GitHub Repository Scanning

- Accept GitHub repo URL (public or private with auth token)
- Clone repo, analyze code for vulnerabilities
- **Supported Languages:** JavaScript/TypeScript, Python, Go, Java, Ruby, PHP, C#
- **Detects:** SQL injection, XSS, CSRF, hardcoded secrets, insecure dependencies

#### Secrets Detection

- Flag hardcoded API keys, passwords, DB credentials, access tokens
- Scan environment variable usage (check if `.env` exposed)
- Detect common secret patterns (AWS keys, GitHub tokens, Stripe keys)

#### Dependency Vulnerabilities

- Scan package.json, requirements.txt, go.mod, Gemfile, etc.
- Cross-reference against NVD, CVE databases
- Prioritize known exploits over hypothetical vulnerabilities

#### Code Quality Issues (Security-Focused)

- SAST analysis: Injection flaws, improper auth, missing validation
- Rules focus on OWASP Top 10, CWE Top 25
- Minimize false positives (common SAST complaint)

### 6.2 Live Application Scanning (DAST)

| Feature               | Description                                             |
| --------------------- | ------------------------------------------------------- |
| Dynamic Web Scanning  | Non-destructive security tests on live URL (HTTPS only) |
| SSL/TLS Validation    | Certificate validity, expiration, chain, cipher suites  |
| Security Headers      | CSP, HSTS, X-Frame-Options, X-Content-Type-Options      |
| API Endpoint Analysis | Authentication/authorization testing if API detected    |
| Test Endpoints        | /login, /api, /admin, /robots.txt                       |

**Detects:**

- XSS vulnerabilities
- CSRF token issues
- Missing security headers
- Weak SSL/TLS configuration
- Cookie security issues (HttpOnly, Secure flags)

### 6.3 AI Explanations & Fix Suggestions

#### Plain-English Translation

Template: `"[Issue Name]. What it is: [explanation]. Why it matters: [impact]. How to fix: [steps]"`

**Example:**

> **Client-Side Authentication**  
> _What it is:_ Your login logic runs in the browser, which anyone can modify.  
> _Why it matters:_ Attackers can bypass your login by editing JavaScript.  
> _How to fix:_ Move all authentication logic to your backend server.

#### Severity Scoring

| Level    | Criteria                 |
| -------- | ------------------------ |
| CRITICAL | Immediate data exposure  |
| HIGH     | Auth bypass possible     |
| MEDIUM   | Best practice violation  |
| LOW      | Nice-to-have improvement |

#### Fix Suggestions

- 80%+ of findings include "how to fix" guidance
- Code snippets where applicable
- Examples: "Use environment variables", "Add server-side validation", "Update to v2.5.0"

#### Security Glossary

- Inline definitions for all security terms via hover/tooltip
- Example: "Injection" → "When user input is treated as code, allowing attackers to execute arbitrary commands"

### 6.4 Dashboard & Reports

#### Scan History Dashboard

- View all past scans (paginated, sortable by date/severity/project)
- One-click re-scan any previous scan
- Compare scans: "Issues fixed since last scan?"

#### Security Score

- Simple 0-100 score: "Your app is 72% secure"
- Color-coded: Red (<50), Yellow (50-75), Green (>75)
- Based on severity of findings, number of issues, complexity

#### PDF Report Generation

- Professional report for client/investor sharing
- Sections: Executive summary, findings, severity breakdown, fix recommendations
- Co-branding: Option to add freelancer/agency logo
- Export: PDF or email

#### Shareable Report Link

- Generate read-only link for anyone (no account required)
- Revokable access
- 30-day expiration by default

### 6.5 Authentication & Access Control

| Feature               | Description                                                         |
| --------------------- | ------------------------------------------------------------------- |
| User Auth             | Email/password signup, GitHub OAuth login                           |
| GitHub Integration    | One-click login, read-only repo access, encrypted token storage     |
| Permission Management | Manage report visibility, share with specific emails, revoke access |

---

## 7. Database Schema

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String?   // null if OAuth
  name      String?
  avatar    String?   // GitHub avatar
  githubId  String?   @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  scans     Scan[]
  reports   Report[]
}

model Scan {
  id              Int       @id @default(autoincrement())
  userId          Int
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  githubRepoUrl   String?
  liveUrl         String?
  status          String    @default("queued") // queued, scanning, completed, failed
  progress        String?   // "Scanning repo...", "Running DAST...", etc
  errorMessage    String?
  report          Report?
  createdAt       DateTime  @default(now())
  completedAt     DateTime?
  @@index([userId])
  @@index([createdAt])
}

model Report {
  id              Int       @id @default(autoincrement())
  scanId          Int       @unique
  scan            Scan      @relation(fields: [scanId], references: [id], onDelete: Cascade)
  userId          Int
  user            User      @relation(fields: [userId], references: [id])
  securityScore   Int       // 0-100
  findings        Finding[]
  pdfUrl          String?   // S3 URL
  shareToken      String?   @unique
  createdAt       DateTime  @default(now())
}

model Finding {
  id              Int       @id @default(autoincrement())
  reportId        Int
  report          Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)
  title           String    // "SQL Injection", "Hardcoded API Key"
  severity        String    // CRITICAL, HIGH, MEDIUM, LOW
  category        String    // "injection", "secrets", "auth", "headers"
  source          String    // "semgrep", "zap", "secrets-scan", "npm-audit"
  description     String    // "What it is"
  impact          String    // "Why it matters"
  remediation     String    // "How to fix"
  codeSnippet     String?   // Optional code example
  rawFinding      Json      // Original finding from tool
  createdAt       DateTime  @default(now())
  @@index([reportId])
  @@index([severity])
}
```

---

## 8. API Endpoints

### Authentication

```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/github/callback
```

### Scans

```
GET    /api/scans                    # List user's scans
GET    /api/scans/:id                # Get single scan details
POST   /api/scans                    # Create new scan
DELETE /api/scans/:id                # Delete scan
POST   /api/scans/:id/rescan         # Re-run existing scan
GET    /api/scans/:id/progress       # Get scan progress (SSE)
```

### Reports

```
GET  /api/reports/:id              # Get report
GET  /api/reports/:id/pdf          # Download PDF
POST /api/reports/:id/share        # Generate share link
GET  /api/reports/shared/:token    # View shared report (no auth)
```

### Billing (Phase 2)

```
POST /api/billing/checkout        # Create checkout session
GET  /api/billing/invoices        # List user invoices
POST /api/billing/update-method   # Update payment method
```

---

## 9. Frontend Pages

| Route           | Purpose             | Key Components                               |
| --------------- | ------------------- | -------------------------------------------- |
| `/`             | Landing / Auth      | AuthForm, OAuthButton, PricingCard           |
| `/dashboard`    | Scan history, stats | ScanList, ScanCard, DashboardStats           |
| `/scan/new`     | New scan form       | ScanForm, URLInput, CostBreakdown            |
| `/scans/{id}`   | Progress & results  | ScanProgressBar, SecurityScore, FindingsList |
| `/reports/{id}` | Read-only report    | FindingDetail, PDFExport                     |
| `/account`      | Settings            | ProfileForm, BillingManager, DataDeletion    |

---

## 10. Scanning Workers

### Scan Pipeline

```
Queue (Redis)
  ↓ (Job: scan GitHub repo)
Worker
  ├─ 1. Clone repo to temp directory
  ├─ 2. Run Semgrep (code vulnerabilities)
  ├─ 3. Run npm audit (dependencies)
  ├─ 4. Run Trivy (secrets detection)
  ├─ 5. Run OWASP ZAP (DAST on live URL)
  ├─ 6. Combine all findings
  ├─ 7. Generate LLM explanations
  ├─ 8. Calculate security score
  ├─ 9. Store in database
  └─ 10. Clean up temp files
```

### Scan Prioritization

```
IF secrets found:
  PRIORITY = CRITICAL
  Return immediately with secrets findings

ELSE IF npm audit finds high-severity vuln:
  PRIORITY = HIGH
  Run npm audit, then Semgrep

ELSE:
  Run all scans in parallel
```

### Tool Configuration

| Tool          | Purpose      | Key Settings                             |
| ------------- | ------------ | ---------------------------------------- |
| **Semgrep**   | SAST         | OWASP Top 10, CWE Top 25 rules           |
| **OWASP ZAP** | DAST         | Non-destructive, 5s timeout, max depth 3 |
| **npm audit** | Dependencies | JSON output, severity filtering          |
| **Trivy**     | Secrets      | HIGH severity minimum                    |

---

## 11. AI Layer

### LLM Integration

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content:
        "You are a security expert. Explain vulnerabilities to non-technical developers.",
    },
    {
      role: "user",
      content: `Finding: ${finding.title}
               Details: ${finding.rawDetails}
               
               Provide:
               1. What it is (simple explanation)
               2. Why it matters (business impact)
               3. How to fix (step-by-step)
               Keep each under 2 sentences. Use simple words.`,
    },
  ],
  temperature: 0.7,
  max_tokens: 300,
});
```

### Triage & Filtering

```javascript
// Reduce false positives
if (finding.confidence < 0.6) finding.severity = "LOW";
if (finding.filePath.includes("test")) finding.severity = "LOW";
if (knownFalsePositives.includes(finding.rule)) finding.severity = "LOW";

// Filter: Only show meaningful findings
const importantFindings = findings.filter((f) =>
  ["CRITICAL", "HIGH", "MEDIUM"].includes(f.severity),
);
```

### Explanation Examples

**Hardcoded Secrets:**

> Your code contains a sensitive string directly visible in source code. Anyone who can read your code can steal it. **Fix:** Move to environment variables, add to .gitignore, rotate the exposed key immediately.

**Missing Security Headers:**

> Your website doesn't tell browsers how to protect users. Attackers can trick users into running malicious scripts. **Fix:** Add CSP, X-Frame-Options, HSTS, X-Content-Type-Options headers.

---

## 12. Infrastructure

### Deployment Architecture

```
┌─────────────────────────────────────────────┐
│           AWS Infrastructure                │
├─────────────────────────────────────────────┤
│  Vercel      → Frontend (Next.js, CDN)      │
│  AWS ECS     → Backend (Express.js workers) │
│  AWS RDS     → PostgreSQL (Multi-AZ)        │
│  ElastiCache → Redis (job queue)            │
│  AWS S3      → Report PDFs, artifacts       │
│  Secrets Mgr → API keys, OAuth secrets      │
└─────────────────────────────────────────────┘
```

### Environment Variables

**Frontend:**

```
NEXT_PUBLIC_API_URL=https://api.vibeaudit.site
NEXT_PUBLIC_GA_ID=<analytics>
```

**Backend:**

```
DATABASE_URL=postgresql://user:pass@host/db
REDIS_URL=redis://host:6379
OPENAI_API_KEY=sk-...
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
AWS_S3_BUCKET=vibeaudit-reports
BETTER_AUTH_SECRET=xxx
DODO_PAYMENTS_API_KEY=xxx
```

---

## 13. Non-Functional Requirements

### Performance

| Metric                  | Target      |
| ----------------------- | ----------- |
| Scan completion time    | <3 minutes  |
| Dashboard load          | <2 seconds  |
| Report generation       | <30 seconds |
| API response time (p95) | <500ms      |

### Security

- All data encrypted at rest and in transit (HTTPS only)
- No code stored longer than necessary (deleted after report)
- PCI DSS not required for MVP (no payment processing)
- GDPR/CCPA compliance: Users can delete data on request

### Code Handling

```
1. Clone to ephemeral temp directory (/tmp/)
2. Scan it
3. Delete directory immediately
4. NO code stored in database (only findings)

Each scan runs in separate Docker container with:
- No network access (except to GitHub)
- Auto-cleared temp storage
- Container destroyed after scan
```

### Scalability

| Stage                   | Infrastructure               | Cost      |
| ----------------------- | ---------------------------- | --------- |
| MVP (100 scans/day)     | 2 API + 2 workers, single DB | ~$300/mo  |
| Growth (1000 scans/day) | Auto-scaling 5-10 instances  | ~$2000/mo |

### Cost Breakdown (Per Scan)

| Item           | Cost        |
| -------------- | ----------- |
| LLM (GPT-4)    | ~$0.50      |
| ECS compute    | ~$0.50      |
| GitHub API, S3 | ~$0.01      |
| **Total**      | ~$1.00-1.50 |
| **Charge**     | $30/scan    |
| **Margin**     | ~95%        |

---

## 14. MVP Scope

### In Scope (Weeks 1-3)

- [x] GitHub repo scanning (public repos)
- [x] Live URL scanning (basic DAST: headers, SSL, XSS)
- [x] Secrets detection (hardcoded keys)
- [x] Dependency vulnerability scan
- [x] AI explanations (GPT-4 powered)
- [x] Security score (0-100)
- [x] PDF report generation
- [x] Email signup + GitHub login
- [x] Scan history dashboard
- [x] 1 free scan, then pay-per-scan credits for Security Scan
- [x] Separate PRD Review product with its own subscription flow

### Out of Scope (MVP)

- Private GitHub repo scanning → Phase 2
- Advanced DAST (complex logic flows, API testing)
- Custom rule engine
- CI/CD integration
- Team collaboration features
- Compliance framework mapping (PCI-DSS, HIPAA)
- On-premise deployment
- Multi-language support (English only)

---

## 15. Development Roadmap

### Phase 1: MVP (Weeks 1-3)

**Week 1:**

- [ ] Setup: Vercel + GitHub OAuth + ECS + RDS
- [x] Frontend: Landing, signup, dashboard
- [x] Backend: Auth endpoints, scan creation

**Week 2:**

- [x] Integrate Semgrep, OWASP ZAP, npm audit
- [x] Worker process: Queue + execution

**Week 3:**

- [x] LLM integration: GPT-4 explanations
- [ ] PDF report generation
- [ ] Frontend: Scan results page
- [ ] Testing + bug fixes

**Launch:** Week 3 Friday

### Phase 2: Iteration (Weeks 4-8)

- [ ] Private GitHub repo scanning (OAuth)
- [ ] Advanced DAST: API endpoint testing
- [ ] Freelancer features: Co-branded reports
- [ ] Repeat scanning: Before/after comparison
- [ ] Billing polish and subscription lifecycle improvements
- [ ] Admin dashboard: Usage, revenue

### Phase 3+ (Months 2-3)

- [ ] Team collaboration
- [ ] Scheduled/recurring scans
- [ ] Slack/webhook notifications
- [ ] Compliance mapping (PCI-DSS, SOC 2, ISO 27001)
- [ ] Custom rule engine
- [ ] Third-party integrations (GitHub Actions, GitLab CI)

---

## 16. Risks & Mitigations

| Risk                                   | Likelihood | Mitigation                                                          |
| -------------------------------------- | ---------- | ------------------------------------------------------------------- |
| **Demand weaker than expected**        | Medium     | MVP launch to indie hacker communities, gather feedback early       |
| **False positives overwhelm users**    | Medium     | Aggressive AI triage, user feedback loop                            |
| **LLM explanations still confusing**   | Medium     | User testing with vibe coders, iterate on language                  |
| **Privacy concerns (analyzing code)**  | High       | Clear privacy policy, no code stored >24hrs, encrypted transit/rest |
| **Security liability (missing vulns)** | Medium     | Clear ToS: "Not a substitute for professional security review"      |
| **Scaling costs too high**             | Low        | Optimize pipeline, batch processing, negotiate licensing            |

### Key Assumptions

1. Solo builders will pay $25-50 for pre-launch security validation
2. LLM-powered explanations reduce jargon better than human writing
3. Developers prefer 3-min scan over manual code review
4. Semgrep + ZAP + secrets detection covers 80% of real vulnerabilities
5. Pay-per-scan works better for the Security Scan product, while PRD Review can sustain a separate subscription

---

## 17. Privacy & Compliance

### Privacy Commitments

1. We do not sell user data
2. We do not use user code for AI model training
3. We do not share findings with third parties
4. User scans are private by default
5. Users own all reports and findings
6. GDPR (EU) / CCPA (CA) compliant

### Data Retention

| Data Type                         | Retention                            |
| --------------------------------- | ------------------------------------ |
| Findings                          | Indefinitely (user data)             |
| Temp artifacts (code, ZAP output) | Deleted after 24 hours               |
| PDFs                              | Indefinitely (user reports)          |
| On deletion request               | All scans, reports, findings deleted |

---

**Document Status:** Unified PRD (MVP)  
**Last Updated:** January 2026  
**Owners:** Product Team + Engineering Team
