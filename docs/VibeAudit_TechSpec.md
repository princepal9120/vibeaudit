# Technical Specification: VibeAudit

**Version:** 1.0 (MVP)  
**Last Updated:** January 2026  
**Status:** Pre-Development

---

## 1. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    VibeAudit System                               │
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
    └─────→ Storage (ImageKit / cloud file storage for reports)
```

### Key Components

1. **Frontend:** Next.js SPA with auth, dashboard, scan UI, report viewer
2. **Backend API:** Express.js REST API with auth middleware, scan orchestration
3. **Scanning Workers:** Dedicated service running Semgrep, OWASP ZAP, npm audit, Trivy
4. **LLM Service:** OpenAI GPT-4 API for explanations and fix suggestions
5. **Database:** PostgreSQL (user data, scan history, findings)
6. **Queue:** Redis + Bull for job queue management
7. **Storage:** Cloud file storage for PDFs and shareable artifacts, ImageKit in the current implementation

---

## 2. Frontend

### Tech Stack
- **Framework:** Next.js 16.1 (App Router, React Compiler support)
- **UI Library:** React 19.2 (Concurrent features, improved hydration)
- **Styling:** Tailwind CSS v4.1 + shadcn/ui components
- **State Management:** Custom React hooks + fetch-based API client for server interactions
- **Auth:** Better Auth v1.4 with GitHub/Google OAuth + email/password (cookie-based, no vendor lock-in)

### Key Pages

#### 2.1 Landing / Authentication
- **Route:** `/`
- **Features:**
  - GitHub login button (OAuth)
  - Email/password signup
  - Return user sign-in
  - Pricing/feature info
- **Components:** AuthForm, OAuthButton, PricingCard

#### 2.2 Dashboard
- **Route:** `/dashboard`
- **Features:**
  - List of past scans (paginated, sortable)
  - Quick stats: "Total scans: 5", "Critical issues found: 3"
  - "New Scan" button (primary CTA)
  - Filters: By date, severity, project name
  - "Re-scan" button per scan
- **Components:** ScanList, ScanCard, DashboardStats, QuickActions

#### 2.3 New Scan Form
- **Route:** `/scan/new`
- **Features:**
  - Form field: GitHub repo URL (text input + validation)
  - Form field: Live site URL (text input + validation)
  - Checkbox: "Scan GitHub repo for secrets"
  - Checkbox: "Scan GitHub dependencies"
  - Checkbox: "Scan live site (DAST)"
  - "Scan" button (submits, shows loading)
  - Credit-aware UX: show available scan credits and checkout prompts when needed
  - First-use path: one free scan before paid credits are required
- **Components:** ScanForm, URLInput, AdvancedOptions, CostBreakdown

#### 2.4 Scan Progress / Results
- **Route:** `/scans/{scanId}`
- **Features (During Scan):**
  - Loading indicator with progress
  - Status: "Analyzing GitHub repo...", "Running DAST...", "Generating report..."
  - Estimated time remaining
- **Features (After Scan):**
  - Security score (0-100, color-coded)
  - Findings count by severity (CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 1)
  - Sortable/filterable findings list
  - Per-finding detail:
    - Name, severity, category
    - Plain-English explanation
    - Impact summary
    - How to fix (steps + code snippet if applicable)
    - Link to security glossary term
  - "Download PDF" button
  - "Share Report" button
- **Components:** ScanProgressBar, SecurityScore, FindingsList, FindingDetail, PDFExport

#### 2.5 Report Detail View
- **Route:** `/reports/{reportId}`
- **Features:**
  - Same as scan results, but read-only
  - Can be viewed by anyone with share link (unauthenticated)
  - "Print to PDF" button (browser native)
  - No edit/re-scan options for shared links

#### 2.6 Account Settings
- **Route:** `/account`
- **Features:**
  - Profile: Email, name
  - GitHub integration status
  - Scan history
  - Billing: Payment method, past invoices
  - Privacy: Data deletion request
- **Components:** ProfileForm, BillingManager, DataDeletion

### State Management (Current Frontend Data Flow)

```javascript
// Current pattern in the app
// - fetch-based API client in apps/web/src/lib/api.ts
// - page-level useEffect/useState for loading and mutations
// - lightweight custom hooks for scan list/detail flows
```

### Authentication Flow

```
1. User lands on /
2. Clicks "Login with GitHub" or "Sign up"
3. Better Auth completes OAuth or email auth flow
4. Session stored via secure httpOnly cookies
5. Middleware checks authenticated session on protected routes
6. Redirect to /dashboard if authenticated
7. Logout: Clear session, redirect to /
```

---

## 3. Backend

### Tech Stack
- **Framework:** Express.js (Node.js)
- **Database:** PostgreSQL with ORM (Prisma)
- **Auth:** Better Auth session cookies, plus authenticated API routes
- **Job Queue:** BullMQ (Redis-backed)
- **External APIs:** OpenAI, GitHub, ImageKit, Dodo Payments

### API Endpoints (REST)

#### Authentication
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/auth/github/callback
```

#### Scans
```
GET /api/scans                    # List user's scans
GET /api/scans/:id                # Get single scan details
POST /api/scans                   # Create new scan
DELETE /api/scans/:id             # Delete scan
POST /api/scans/:id/rescan        # Re-run existing scan
GET /api/scans/:id/progress       # Get scan progress (SSE)
```

#### Reports
```
GET /api/reports/:id              # Get report (read-only view)
GET /api/reports/:id/pdf          # Download PDF
POST /api/reports/:id/share       # Generate share link
GET /api/reports/shared/:token    # View shared report (no auth)
```

#### Billing (Phase 2)
```
POST /api/billing/checkout        # Create checkout session
GET /api/billing/invoices         # List user invoices
POST /api/billing/update-method   # Update payment method
```

### Database Schema (Prisma)

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
  
  // Input
  githubRepoUrl   String?
  liveUrl         String?
  
  // Status
  status          String    @default("queued") // queued, scanning, completed, failed
  progress        String?   // "Scanning repo...", "Running DAST...", etc
  errorMessage    String?
  
  // Results
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
  
  // Aggregated results
  securityScore   Int       // 0-100
  findings        Finding[]
  
  // Report metadata
  pdfUrl          String?   // Cloud file URL for generated PDF
  shareToken      String?   @unique // For public sharing
  
  createdAt       DateTime  @default(now())
}

model Finding {
  id              Int       @id @default(autoincrement())
  reportId        Int
  report          Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)
  
  // Finding details
  title           String    // "SQL Injection", "Hardcoded API Key", etc
  severity        String    // CRITICAL, HIGH, MEDIUM, LOW
  category        String    // "injection", "secrets", "auth", "headers", etc
  source          String    // "semgrep", "zap", "secrets-scan", "npm-audit", etc
  
  // Plain-English explanation
  description     String    // "What it is"
  impact          String    // "Why it matters"
  remediation     String    // "How to fix"
  codeSnippet     String?   // Optional code example or location
  
  // Raw data (for debugging)
  rawFinding      Json      // Original finding from tool
  
  createdAt       DateTime  @default(now())
  
  @@index([reportId])
  @@index([severity])
}
```

### Middleware

```javascript
// Authentication middleware
app.use(requireAuth) // Checks authenticated session / auth token

// Rate limiting (500 reqs/hour per IP)
app.use(rateLimit)

// Request logging
app.use(requestLogger)

// Error handling
app.use(errorHandler)
```

### Key Services

#### ScanOrchestrator Service
```javascript
// Coordinates the scanning workflow
async startScan(userId, githubUrl, liveUrl) {
  1. Create Scan record (status: queued)
  2. Queue scanning job
  3. Return scanId
}

async processScan(scanId) {
  1. Fetch GitHub repo (if URL provided)
  2. Run Semgrep on code
  3. Run npm audit on dependencies
  4. Run Trivy on repo
  5. Scan secrets (gitleaks)
  6. Run DAST on live URL (if provided)
  7. Combine all findings
  8. Update Scan status: completed
}
```

#### LLMExplainer Service
```javascript
// Uses GPT-4 to generate explanations
async generateExplanations(findings) {
  for each finding:
    1. Call GPT-4 with finding details
    2. Prompt: "Explain this security issue in plain English for a non-technical developer"
    3. Extract: description, impact, remediation, code snippet
    4. Store in Finding model
}
```

#### ReportGenerator Service
```javascript
// Generates PDF reports
async generatePDF(reportId) {
  1. Fetch report + findings
  2. Render HTML template (findings list, severity breakdown, score)
  3. Generate PDF buffer
  4. Upload to ImageKit (or another cloud file provider)
  5. Return shareable file URL
}
```

---

## 4. Scanning Workers

### Architecture

**Worker Process** runs continuously, pulls jobs from Redis queue, executes scanning tools, stores results.

```
Queue (Redis)
  ↓ (Job: scan GitHub repo for semgrep findings)
Worker
  ├─ 1. Clone repo to temp directory
  ├─ 2. Run Semgrep
  ├─ 3. Parse findings
  ├─ 4. Store in database
  ├─ 5. Mark job complete
  ↓
Next job in queue
```

### 4.1 GitHub Code Scanner (Semgrep)

**Purpose:** Detect code vulnerabilities using static analysis

**Tools:**
- Semgrep (open-source SAST engine)
- Semgrep Pro rules (if we pay for premium)

**Process:**
```bash
1. git clone <github-url> --depth 1 /tmp/scan-<scanId>
2. cd /tmp/scan-<scanId>
3. semgrep --json --json-stats --config=<our-rules> . > semgrep-output.json
4. Parse JSON, extract findings
5. Categorize by severity
6. rm -rf /tmp/scan-<scanId>
```

**Detects:**
- SQL Injection
- XSS (cross-site scripting)
- Command Injection
- CSRF (cross-site request forgery)
- Insecure deserialization
- Broken authentication
- Missing input validation

**Rules to Enable:**
- OWASP Top 10
- CWE Top 25
- Custom rules for common patterns (hardcoded keys, client-side auth, etc)

### 4.2 Live Web App Scanner (OWASP ZAP)

**Purpose:** Test running web apps for security issues

**Tools:**
- OWASP ZAP (dynamic application security testing)

**Process:**
```bash
1. Start ZAP daemon
2. zapcli quick-scan --self-contained --url https://app.example.com
3. Parse findings JSON
4. Extract vulnerabilities
5. Categorize by severity
```

**Detects:**
- Missing security headers (CSP, HSTS, X-Frame-Options, etc)
- XSS vulnerabilities
- CSRF token issues
- Weak SSL/TLS configuration
- Outdated server headers (reveals tech stack)
- Cookie security issues (HttpOnly, Secure flags)
- API authentication/authorization issues

**Config:**
```yaml
# ZAP scan policy (custom rules)
- Skip authentication (no login required)
- Non-destructive (no data modification)
- Timeout per request: 5 seconds
- Max crawl depth: 3
- Stop after first 20 alerts
```

### 4.3 Dependency & Secrets Scanner

**Dependency Vulnerabilities:**
- **Tool:** npm audit (for JavaScript), pip audit (Python), etc
- **Process:**
  ```bash
  cd /tmp/scan-<scanId>
  npm audit --json
  # Parse, extract vulnerabilities
  # Check if fix available
  ```
- **Detects:** Known CVEs in node_modules, outdated packages

**Secrets Detection:**
- **Tool:** Trivy (multi-language secrets scanning)
- **Process:**
  ```bash
  trivy fs --secret-severity HIGH /tmp/scan-<scanId>
  ```
- **Detects:** API keys, AWS credentials, GitHub tokens, DB passwords, etc

**Scanning Order (Prioritized):**
```
1. Secrets scan (highest priority, most critical)
2. npm audit (dependencies)
3. Semgrep (code issues)
4. DAST on live URL (if provided)
```

### 4.4 Scan Prioritization Logic

**Why Prioritization Matters:**
- Running all tools takes 5-10 minutes
- We want results in <3 minutes
- Prioritize: Most critical issues first

**Algorithm:**
```
IF secrets found:
  PRIORITY = CRITICAL
  Return immediately with secrets findings
  (Skip other scans if >10 findings)

ELSE IF npm audit finds high-severity vuln:
  PRIORITY = HIGH
  Run npm audit, then Semgrep

ELSE:
  Run all scans in parallel (npm audit + Semgrep + DAST)
```

---

## 5. AI Layer

### 5.1 LLM Integration (OpenAI GPT-4)

**Purpose:** Translate security findings into plain English, generate fix suggestions

**API Usage:**
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You are a security expert. Explain vulnerabilities to non-technical developers."
    },
    {
      role: "user",
      content: `Finding: ${finding.title}
               Source: ${finding.source}
               Details: ${finding.rawDetails}
               
               Please provide:
               1. What it is (simple explanation)
               2. Why it matters (business impact)
               3. How to fix (step-by-step for developers)
               Keep each under 2 sentences. Use simple words, avoid jargon.`
    }
  ],
  temperature: 0.7,
  max_tokens: 300
});
```

### 5.2 Prompting Strategy

**Finding Types & Custom Prompts:**

#### For Hardcoded Secrets
```
"Finding: Hardcoded API key detected in code

What is it? Your code contains a sensitive string (e.g., AWS access key, API token) 
directly visible in the source code. Anyone who can read your code can steal it.

Why it matters? An attacker with your API key can access your cloud account, 
delete databases, or run expensive compute. Your costs spike and data is compromised.

How to fix? 
1. Move the key to environment variables (e.g., process.env.AWS_KEY)
2. Add to .gitignore and .env files
3. Rotate the exposed key immediately (generate new one)
4. Example: Instead of const key = 'aws_...', use const key = process.env.AWS_KEY"
```

#### For Client-Side Authentication
```
"Finding: Authentication logic running in browser

What is it? Your login validation runs in the browser (JavaScript). 
Users can inspect/modify this code to bypass login.

Why it matters? Anyone can access protected features without valid password. 
Your app's security is fiction.

How to fix?
1. Move ALL validation to your backend
2. Backend checks: Is password correct? Is user authorized?
3. Browser sends login request → Backend validates → Returns auth token
4. Backend checks every protected request: Is token valid?"
```

#### For Missing Security Headers
```
"Finding: Missing security headers

What is it? Your website doesn't tell browsers how to protect users. 
Without these headers, browsers can't defend against XSS, clickjacking, etc.

Why it matters? Attackers can trick users into running malicious scripts, 
steal data, or hijack sessions.

How to fix?
Add these HTTP headers:
- Content-Security-Policy: default-src 'self'
- X-Frame-Options: DENY (blocks clickjacking)
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: max-age=31536000 (forces HTTPS)"
```

### 5.3 Triage & Filtering

**Goal:** Reduce false positives, prioritize real issues

**Triage Algorithm:**
```javascript
findings.forEach(finding => {
  // Check if Semgrep finding is likely false positive
  if (finding.source === 'semgrep') {
    // Check Semgrep confidence score (if available)
    if (finding.confidence < 0.6) {
      finding.severity = 'LOW'
    }
    
    // Check if finding is in a comment or test file
    if (finding.filePath.includes('test') || finding.filePath.includes('spec')) {
      finding.severity = 'LOW'
    }
    
    // Check against known FP patterns
    if (knownFalsePositives.includes(finding.rule)) {
      finding.severity = 'LOW'
    }
  }
})

// Filter: Only show HIGH/CRITICAL for MVP
const importantFindings = findings.filter(f => 
  f.severity === 'CRITICAL' || f.severity === 'HIGH' || f.severity === 'MEDIUM'
)
```

### 5.4 Explanation Generation Pipeline

```javascript
async function generateExplanations(findings) {
  // Batch findings by type (reduce API calls)
  const batches = batchByType(findings)
  
  for (const batch of batches) {
    // Call GPT-4 with batch prompt
    const explanations = await callGPT4(batch)
    
    // Store explanations
    for (let i = 0; i < batch.length; i++) {
      batch[i].description = explanations[i].description
      batch[i].impact = explanations[i].impact
      batch[i].remediation = explanations[i].remediation
      await saveFinding(batch[i])
    }
  }
}
```

**Batch Example:**
```
Input findings: 5 hardcoded keys, 3 missing headers
Batch them: "Here are 5 findings of type X, explain all of them"
Reduce API calls from 8 to 2
```

---

## 6. Data Model

### Core Entities

#### User
```javascript
{
  id: String (UUID),
  email: String (unique),
  password: String (hashed),
  name: String,
  avatar: String (GitHub URL),
  githubId: String,
  createdAt: Date,
  updatedAt: Date,
  // Derived
  totalScans: Number,
  freeScanUsed: Boolean,
}
```

#### Scan
```javascript
{
  id: String (UUID),
  userId: String,
  githubRepoUrl: String,
  liveUrl: String,
  status: Enum ('queued', 'scanning', 'completed', 'failed'),
  progress: String, // "Analyzing GitHub repo (50%)"
  report: Object (nested), // Full report data
  createdAt: Date,
  completedAt: Date,
}
```

#### Finding
```javascript
{
  id: String (UUID),
  reportId: String,
  title: String, // "SQL Injection", "Hardcoded API Key"
  severity: Enum ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
  category: String, // "injection", "secrets", "auth", "headers"
  source: String, // "semgrep", "zap", "npm-audit", "secrets"
  
  // Plain-English explanation
  description: String, // "What it is"
  impact: String, // "Why it matters"
  remediation: String, // "How to fix"
  codeSnippet: String, // Example fix or code location
  
  // Raw data (for debugging)
  rawFinding: Object, // Original output from scanning tool
  
  createdAt: Date,
}
```

#### Report
```javascript
{
  id: String (UUID),
  scanId: String,
  userId: String,
  
  // Aggregated
  securityScore: Number, // 0-100
  severityBreakdown: {
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
  },
  findings: Finding[], // Array of findings
  
  // Sharing
  pdfUrl: String, // Cloud file URL
  shareToken: String, // For public access
  shareTokenCreatedAt: Date,
  shareTokenExpiresAt: Date, // 30 days default
  
  createdAt: Date,
}
```

---

## 7. Infrastructure

### Deployment Architecture

```
┌─────────────────────────────────────────────┐
│      Example Production Infrastructure      │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Vercel (Frontend: Next.js)          │  │
│  │  auto-scaled, CDN-backed             │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  AWS ECS (Backend: Express.js)       │  │
│  │  - Task: api-server (2 tasks)        │  │
│  │  - Task: worker-process (2 tasks)    │  │
│  │  Auto-scaling based on queue depth   │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  AWS RDS (PostgreSQL)                │  │
│  │  Multi-AZ for HA                     │  │
│  │  Automated backups                   │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  AWS ElastiCache (Redis)             │  │
│  │  For job queue (Bull)                │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  ImageKit / File Storage             │  │
│  │  Report PDFs and shareable assets    │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  AWS Secrets Manager                 │  │
│  │  - GitHub OAuth secret               │  │
│  │  - OpenAI API key                    │  │
│  │  - Dodo Payments API key             │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### Hosting Choices

| Component | Platform | Rationale |
|-----------|----------|-----------|
| Frontend | Vercel | Next.js native, auto-scale, CDN included |
| Backend | AWS ECS (Fargate) | Containers, auto-scale, cost-efficient for variable load |
| Database | AWS RDS PostgreSQL | Managed, HA, backups automatic |
| Cache/Queue | AWS ElastiCache Redis | Managed, fast |
| Secrets | AWS Secrets Manager | Rotatable, secure |
| Storage | ImageKit or equivalent | Durable, easy public/private file delivery |

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://api.vibeaudit.site
NEXT_PUBLIC_GA_ID=<analytics>
```

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@host/db
REDIS_URL=redis://host:6379
OPENAI_API_KEY=sk-...
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_TOKEN=ghp_... (for API access)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
IMAGEKIT_PUBLIC_KEY=xxx
IMAGEKIT_PRIVATE_KEY=xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...
DODO_PAYMENTS_API_KEY=xxx
BETTER_AUTH_SECRET=xxx
```

### Monitoring & Logging

- **Logs:** CloudWatch / platform logs (API), Vercel logs (frontend)
- **Metrics:** CloudWatch (CPU, memory, queue depth)
- **Alerts:** CloudWatch alarms (error rate > 5%, queue > 100 jobs)
- **APM:** DataDog or New Relic (optional, post-MVP)

---

## 8. Security & Compliance

### Handling User Code Safely

**Principle:** Never store, never train on, never expose user code

**Implementation:**
```javascript
// When cloning repo:
1. Clone to ephemeral temp directory (/tmp/)
2. Scan it
3. Delete directory immediately
4. NO code stored in database (only findings)

// Scanning tools run in isolation:
1. Each scan runs in separate Docker container
2. Container has no network access (except to GitHub)
3. Container temp storage auto-cleared after scan
4. Container is destroyed after scan completes
```

### Access Isolation

```
User A scan → Storage: /tmp/scan-uuid-a
User B scan → Storage: /tmp/scan-uuid-b
No cross-contamination
```

**In Database:**
- Store only metadata (repo URL, findings summary)
- Never store full code
- Never store raw scanning tool output

### Data Retention

```javascript
// Findings: Kept indefinitely (user data)
// Temp artifacts (code, ZAP output): Deleted after 24 hours
// PDFs: Kept indefinitely (user reports)

// Deletion on request:
User requests account deletion
  → Delete all scans, reports, findings
  → Keep anonymized usage stats (e.g., "1000 scans processed")
```

### Privacy Policy Commitments

```
1. We do not sell user data
2. We do not use user code for AI model training
3. We do not share findings with third parties
4. User scans are private by default (must explicitly share)
5. Users own all reports and findings
6. We comply with GDPR (EU users), CCPA (CA users)
```

### Compliance Notes

- **PCI DSS:** Not needed yet (no payment processing in MVP)
- **SOC 2:** Target for enterprise sales (Phase 2+)
- **GDPR:** Implemented (data deletion, privacy policy)
- **CCPA:** Implemented (data deletion, opt-out)

---

## 9. Scalability & Cost Considerations

### Cost Breakdown (MVP)

**Per Scan:**
- GitHub API calls: ~$0.001 (negligible)
- LLM (GPT-4) for explanations: ~$0.50 per scan
  - 10 findings × $0.05 per finding explanation
  - Input: 200 tokens, Output: 150 tokens → ~2000 tokens total
  - GPT-4: $0.03/1K input + $0.06/1K output = ~$0.15-0.30
- Semgrep: Free (open-source)
- OWASP ZAP: Free (open-source)
- npm audit: Free
- ECS compute: ~$0.50 per scan (15 min @ t3.small)
- Storage (S3): ~$0.001 per PDF (small file)

**Total per scan: ~$1.00-1.50**

**Pricing Strategy:**
- Charge $30 per scan
- Gross margin: 95% (assuming scale)
- Cost at scale: $0.50 per scan (optimized)

### Scaling Path

**MVP (100 concurrent scans/day):**
- 2 API servers (t3.small)
- 2 worker tasks (t3.medium)
- Single PostgreSQL instance (db.t3.small)
- Single Redis instance (cache.t3.micro)
- Cost: ~$300/month

**Growth (1000 concurrent scans/day):**
- Auto-scaling (5-10 API servers)
- Auto-scaling (5-10 worker tasks)
- PostgreSQL read replicas (db.r5.large)
- Redis cluster (cache.r5.large)
- Cost: ~$2000/month

**Optimizations:**
- Cache LLM responses (same finding → same explanation)
- Batch LLM calls (reduce API overhead)
- Parallel scanning tools (run Semgrep + DAST + npm audit simultaneously)
- Worker deduplication (if two users scan same repo, reuse results)

---

## 10. Development Roadmap

### Phase 1: MVP (Weeks 1-3)

**Week 1:**
- [ ] Setup: Vercel + GitHub OAuth
- [ ] Setup: ECS + RDS + ElastiCache
- [ ] Frontend: Landing, signup, dashboard
- [ ] Backend: Auth endpoints, scan creation endpoint

**Week 2:**
- [ ] Integrate Semgrep scanning
- [ ] Integrate OWASP ZAP (basic setup)
- [ ] Integrate npm audit
- [ ] Worker process: Queue + execution

**Week 3:**
- [ ] LLM integration: GPT-4 explanations
- [ ] PDF report generation
- [ ] Frontend: Scan results page
- [ ] Testing + bug fixes

**Launch:** Week 3 end (Friday)

### Phase 2: Iteration (Weeks 4-8)

**Week 4:**
- [ ] Private GitHub repo scanning (OAuth)
- [ ] User feedback loop: Survey, NPS
- [ ] Bug fixes from MVP feedback

**Week 5-6:**
- [ ] Advanced DAST: API endpoint testing
- [ ] Freelancer features: Co-branded reports
- [ ] Repeat scanning: Before/after comparison

**Week 7-8:**
- [ ] Billing polish and lifecycle improvements
- [ ] Admin dashboard: Usage, revenue
- [ ] Promotional campaign: Indie Hackers launch

---

## 11. Tech Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 16.1, React 19.2, Tailwind CSS v4.1 | App Router, React Compiler, modern CSS |
| **Backend** | Express.js 5.2, Node.js 24.x LTS | Native async/await, latest LTS |
| **Database** | PostgreSQL 18 | Reliable, JSONB support for findings |
| **Cache/Queue** | Redis 8.4 + BullMQ 5.66 | Fast, modern Bull replacement |
| **LLM** | OpenAI GPT-4o | Best quality, multimodal support |
| **Scanning** | Semgrep 1.148, OWASP ZAP 2.17, Trivy 0.68 | Best-in-class open-source tools |
| **Deployment** | Vercel + containerized API host | Flexible deployment without changing app architecture |
| **Auth** | Better Auth v1.4 | No vendor lock-in, Prisma adapter, cookie sessions |
| **ORM** | Prisma 7.2 | Type-safe, new migrations engine |
| **Job Queue** | BullMQ + Redis | Modern, better DX |

---

**Document Status:** Technical Specification (MVP)  
**Last Updated:** January 2026  
**Owner:** Engineering Team
