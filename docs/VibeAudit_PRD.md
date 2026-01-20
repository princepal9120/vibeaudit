# Product Requirements Document: VibeAudit

## Executive Summary

**VibeAudit** is a security scanning platform built for indie builders, vibe coders, freelancers, and early-stage teams who ship code fast using AI tools. It validates code and live apps for security vulnerabilities, translates findings into plain English, and generates client-friendly reports—without the complexity, cost, or setup friction of enterprise security tools.

**Target Customer:** Solo SaaS founder shipping production software built 50%+ with Cursor/Claude, needing security validation before public launch.

**Pricing Model:** Pay-per-scan ($15-50), no subscriptions, no minimums.

---

## 1. Product Overview

### Vision
Democratize security for people who code (but don't have security teams).

### Problem Statement

**Current pain:**
- 48% of AI-generated code contains security flaws (Veracode 2025)
- Enterprise security tools cost $125+/month minimum and require DevOps expertise
- Solo builders ship production code without security validation
- Freelancers can't quickly audit client code before handoff
- Vibe coders don't understand security findings ("CWE-94? SAST?")
- No tool scans GitHub repos + live URLs in one unified report
- No client-friendly security report generator

**Consequence:**
- Security breaches at indie startups destroy trust and companies
- Freelancers face legal liability and reputation damage
- Undetected vulnerabilities become expensive to fix post-launch
- Knowledge gaps force developers to "hope" their code is secure

### Solution
**VibeAudit** scans code and live apps, flags vulnerabilities, explains findings in plain English, suggests AI-powered fixes, and generates reports for stakeholders—all in 2-3 minutes, no setup required.

### Core Use Cases

1. **Pre-Launch Security Checkpoint**
   - Solo builder: "I'm shipping tomorrow, let me scan for obvious holes"
   - Input: GitHub repo + live staging URL
   - Output: Pass/fail scoring, list of issues to fix before deploy

2. **Client-Facing Compliance Report**
   - Freelancer: "I need to show my client I audited this code"
   - Input: GitHub repo
   - Output: Professional PDF report, plain-English findings, fix suggestions

3. **AI-Generated Code Validation**
   - Vibe coder: "I built 90% with Claude, is it safe?"
   - Input: Live URL
   - Output: "You have hardcoded API keys (CRITICAL), client-side auth (HIGH), outdated dependencies (MEDIUM)"

4. **Pre-Delivery QA Checkpoint**
   - Freelancer: "Before I hand off to my client, let me validate"
   - Input: GitHub repo + staging URL
   - Output: Issues to fix, then re-scan to confirm

---

## 2. Goals & Success Metrics

### Business Goals

1. **Customer Acquisition**
   - 100 MVP users within 8 weeks of launch
   - 20+ paying customers within 12 weeks
   - $5k MRR within 6 months

2. **Retention & Expansion**
   - 30%+ of customers return for second scan
   - 15%+ month-over-month growth in returning customers
   - Net Promoter Score (NPS) 40+

3. **Category Leadership**
   - Become the default security tool for indie builders
   - 80% customer awareness of VibeAudit among active indie hacker communities

### User Success Metrics

1. **Ease of Use**
   - Scan completion in <3 minutes (from input to report)
   - No setup or configuration required
   - Zero terminal/CLI knowledge needed

2. **Finding Clarity**
   - 90% of findings understood by non-technical users (NPS survey)
   - Plain-English translation for every finding
   - Fix suggestion provided for 80%+ of findings

3. **Actionability**
   - 70% of findings have "how to fix" guidance
   - Users can fix issues without re-scanning tool multiple times
   - Reports shareable with non-technical stakeholders

4. **Trust Building**
   - Security score easy to explain ("You're 72% secure")
   - Report looks professional enough to share with clients/investors
   - Users feel confident shipping after VibeAudit scan

---

## 3. User Personas

### Primary: Solo Builders (Indie Hackers)

**Description:**
- Shipping fast with AI tools (Cursor, Copilot, Claude)
- Tech-savvy but not security specialists
- Budget: $0-50/month, willing to pay for peace of mind
- Pain: "Did my AI code break security?"

**Goals:**
- Validate code before public launch
- Prove to investors/customers that security was considered
- Sleep soundly after deploying

**Usage Pattern:**
- Once per project (pre-launch)
- Occasionally before major updates
- Likely to reference report during investor meetings

---

### Secondary 1: Freelancers & Agencies

**Description:**
- Solo freelancer or 2-5 person team
- Per-project work, not recurring
- High reputational risk (code quality = trust)
- Pain: "My freelancer delivered insecure code" / "I need proof I audited this"

**Goals:**
- Add "security audit" as paid service
- Validate code before client handoff
- Reduce post-delivery liability

**Usage Pattern:**
- Once per project, before delivery
- Want co-branded report for client
- Potential to upsell security audit as premium service

---

### Secondary 2: Vibe Coders (Non-Technical)

**Description:**
- Designer, PM, marketer, or "I learned to code with AI"
- Shipping fast, understanding less
- Budget: $0-20/month, price-sensitive
- Pain: "Is this safe? What does 'injection' mean?"

**Goals:**
- Assure client/themselves that app is safe
- Understand security in plain English
- Not become a security expert

**Usage Pattern:**
- Once per project
- Won't read technical docs
- Need visual, simple scoring

---

## 4. Core Use Cases (Expanded)

### Use Case 1: Pre-Launch Security Validation

**Actor:** Solo SaaS founder  
**Trigger:** "Shipping tomorrow, want to validate code"  
**Steps:**
1. Navigate to VibeAudit dashboard
2. Enter GitHub repo URL + live staging URL
3. Click "Scan"
4. Wait 2-3 minutes
5. Review findings

**Expected Result:**
- "3 findings: 1 CRITICAL (auth), 1 MEDIUM (headers), 1 LOW (dep update)"
- Plain-English explanation for each
- "Fix these before shipping" recommendation
- Can download PDF report

---

### Use Case 2: Client Handoff Audit

**Actor:** Freelancer  
**Trigger:** "Code done, about to deliver to client"  
**Steps:**
1. Scan GitHub repo + staging URL
2. Get findings
3. Fix any HIGH/CRITICAL issues
4. Re-scan to verify
5. Generate co-branded PDF report
6. Share with client before handoff

**Expected Result:**
- Professional report, not technical jargon
- Client sees "Your app passed 4 automated security checks"
- Freelancer includes in handoff documentation
- Client confidence increases, dispute risk decreases

---

### Use Case 3: AI Code Validation

**Actor:** Vibe coder  
**Trigger:** "I built 90% with Claude, is it vulnerable?"  
**Steps:**
1. Deploy app to live URL
2. Scan live URL (no GitHub access needed)
3. Get findings
4. Read plain-English explanations
5. Ask for fix guidance

**Expected Result:**
- "Your app has hardcoded API keys (CRITICAL)" with fix
- "Client-side auth detected (HIGH)" with fix
- "Outdated dependency (MEDIUM)" with fix
- Vibe coder can ship with confidence or delay to fix

---

### Use Case 4: Dependency & Secrets Audit

**Actor:** Freelancer reviewing legacy code  
**Trigger:** "Client handed me their old repo, I'm adding features"  
**Steps:**
1. Scan GitHub repo
2. Get findings on dependencies, secrets, code issues
3. Prioritize: Which are show-stoppers?
4. Document findings in report

**Expected Result:**
- Quick audit without manual npm audit / git secret scanning
- Dependency vulnerabilities prioritized
- Secrets flagged (API keys, DB passwords)
- Report ready for client discussion

---

## 5. Functional Requirements

### 5.1 Code Scanning Engine

**Requirement 5.1.1:** GitHub Repository Scanning
- Accept GitHub repo URL (public or private with auth token)
- Clone repo, analyze code for vulnerabilities
- Support: JavaScript/TypeScript, Python, Go, Java, Ruby, PHP, C#
- Detect: SQL injection, XSS, CSRF, hardcoded secrets, insecure dependencies

**Requirement 5.1.2:** Secrets Detection
- Flag hardcoded API keys, passwords, DB credentials, access tokens
- Scan environment variable usage (check if `.env` exposed in repo)
- Detect common secret patterns (AWS keys, GitHub tokens, Stripe keys)

**Requirement 5.1.3:** Dependency Vulnerabilities
- Scan package.json, requirements.txt, go.mod, Gemfile, etc.
- Cross-reference against vulnerability databases (NVD, CVE)
- Prioritize: Show known exploits before hypothetical vulnerabilities

**Requirement 5.1.4:** Code Quality Issues (Security-Focused)
- SAST analysis: Injection flaws, improper auth, missing validation
- Rules focus on top 10 security patterns, not code style
- Avoid "false positives" (common complaint about SAST tools)

---

### 5.2 Live Application Scanning

**Requirement 5.2.1:** Dynamic Web Scanning (DAST)
- Accept live URL (https only)
- Perform non-destructive security tests
- Detect: XSS, CSRF token issues, missing security headers, SSL/TLS misconfig
- Test common endpoints: /login, /api, /admin, /robots.txt

**Requirement 5.2.2:** SSL/TLS Certificate Validation
- Check certificate validity, expiration, chain
- Flag weak cipher suites, TLS version issues
- Check for security headers: CSP, HSTS, X-Frame-Options, etc.

**Requirement 5.2.3:** API Endpoint Analysis
- If API detected, test for common API issues
- Authentication: Missing, weak, or bypassable auth
- Authorization: Can unauthenticated users access protected resources?

---

### 5.3 AI Explanations & Fix Suggestions

**Requirement 5.3.1:** Plain-English Finding Translation
- For each vulnerability, generate human-readable explanation
- Template: "[Issue Name]. What it is: [explanation]. Why it matters: [impact]. How to fix: [steps]"
- Example: "Client-Side Authentication. What it is: Your login logic runs in the browser, which anyone can modify. Why it matters: Attackers can bypass your login by editing JavaScript. How to fix: Move all authentication logic to your backend server."

**Requirement 5.3.2:** Severity Scoring & Triage
- Assign severity: CRITICAL, HIGH, MEDIUM, LOW
- Triage logic: Critical = immediate data exposure, High = auth bypass, Medium = best practice, Low = nice-to-have
- AI triage: Use LLM to filter out noisy findings, highlight real issues

**Requirement 5.3.3:** Fix Suggestions
- For 80%+ of findings, provide "how to fix" guidance
- Examples: "Use environment variables" (for hardcoded keys), "Add server-side validation" (for XSS), "Update dependency to v2.5.0" (for vulnerable dep)
- Code snippets where possible

**Requirement 5.3.4:** Security Glossary
- Inline glossary for all security terms
- "Injection" → "When user input is treated as code, allowing attackers to execute arbitrary commands"
- Accessible via hover/tooltip

---

### 5.4 Dashboard & Reports

**Requirement 5.4.1:** Scan History Dashboard
- View all past scans
- Sorting: by date, by severity, by project
- Re-scan button: One-click re-scan any previous scan
- Compare scans: "Issues fixed since last scan?"

**Requirement 5.4.2:** Security Score
- Simple 0-100 score: "Your app is 72% secure"
- Calculation: Based on severity of findings, number of issues, complexity
- Visual: Color-coded (red = <50, yellow = 50-75, green = >75)

**Requirement 5.4.3:** PDF Report Generation
- Professional report, suitable for client/investor sharing
- Sections: Executive summary, findings, severity breakdown, fix recommendations
- Co-branding: Option to add freelancer/agency logo/name
- Export: PDF, or option to email

**Requirement 5.4.4:** Shareable Report Link
- Generate link to view report (read-only)
- Can share with client without VibeAudit account
- Option to revoke access later

---

### 5.5 Authentication & Access Control

**Requirement 5.5.1:** User Authentication
- Email/password signup (initial MVP)
- OAuth: GitHub login (easy for developers)
- No credit card required for free tier

**Requirement 5.5.2:** GitHub Integration
- One-click GitHub login
- Request repo access (only read access, for public/private repo scanning)
- Securely store GitHub token (encrypted)

**Requirement 5.5.3:** Permission Management
- Users can manage who can see their scan reports
- Option to share report with specific email addresses
- Admin can revoke access to report

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Scan completion time: <3 minutes (GitHub repo + live URL)
- Dashboard load: <2 seconds
- Report generation: <30 seconds
- API response time: <500ms (p95)

### 6.2 Security

- All code/findings stored encrypted at rest
- HTTPS only, no plain HTTP
- No code stored longer than necessary (delete after report generated)
- PCI DSS compliance not required (no payment processing at MVP)
- GDPR compliance: Users can delete their data on request

### 6.3 Scalability

- MVP: Handle 100 concurrent scans
- Architecture prepared to scale to 1000+ concurrent scans
- Database: Designed for growth (not single SQLite file)

### 6.4 Cost Constraints

- Each scan costs ~$1-3 to run (LLM + scanning tools)
- Pricing: $25-50 per scan to maintain 50%+ margin
- Free tier: 1 free scan per user, then pay-per-scan

### 6.5 Availability

- Uptime target: 99% (MVP), 99.9% (scale)
- Graceful degradation if scanning tools down (queue scan, retry)

---

## 7. MVP Scope vs Future Scope

### MVP (Weeks 1-3)

**In Scope:**
- GitHub repo scanning (public repos, no private auth yet)
- Live URL scanning (basic DAST: headers, SSL, simple XSS)
- Secrets detection (hardcoded keys)
- Dependency vulnerability scan (package.json → npm audit equivalent)
- AI explanations (GPT-4 powered)
- Security score (simple algorithm)
- PDF report generation
- Email signup + GitHub login
- Scan history dashboard
- 1 free scan per user, $30 per additional scan

**Out of Scope (MVP):**
- Private GitHub repo scanning (will add in weeks 4-6)
- Advanced DAST (complex logic flows, API testing)
- Custom rule engine
- CI/CD integration
- Team collaboration features
- Compliance framework mapping (PCI-DSS, HIPAA, etc.)
- On-premise deployment
- Multi-language support (English only, MVP)

### Phase 2 (Weeks 4-8)

**Add:**
- Private repo scanning (OAuth GitHub app)
- API endpoint enumeration + testing
- Advanced DAST: Logic flow testing, state machine exploration
- Freelancer co-branded reports
- Report sharing with email invites
- Admin dashboard (usage, billing, users)
- Pay-per-scan billing (Stripe integration)
- CLI tool for local scanning

### Phase 3+ (Months 2-3)

**Add:**
- Team collaboration (invite teammates, shared scans)
- Scheduled/recurring scans
- Slack/webhook notifications
- Compliance mapping (PCI-DSS, SOC 2, ISO 27001)
- Advanced analytics (trend over time, risk dashboard)
- Custom rule engine
- Third-party integrations (Zapier, GitHub Actions, GitLab CI)

---

## 8. Risks & Assumptions

### Key Assumptions

1. **Market Demand:** Solo builders will pay $25-50 for pre-launch security validation (untested, need MVP validation)
2. **AI Works:** LLM-powered explanations reduce jargon better than human writing (needs testing with users)
3. **Speed is Valuable:** Developers prefer 3-min scan over manual code review (untested)
4. **Scanning Tools Sufficient:** Combining Semgrep + OWASP ZAP + secrets detection covers 80% of real vulnerabilities (assumption, not proven)
5. **Pricing Model:** Pay-per-scan better than subscription for indie builders (need A/B test)

### Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| **Demand is weaker than expected** | Product fails to gain traction | Medium | MVP launch to indie hacker communities, gather feedback early, adjust messaging |
| **False positives overwhelm users** | Users dismiss findings as noise | Medium | Aggressive AI triage to filter false positives, user feedback loop |
| **Scanning too slow** | Users abandon before report completes | Low | Pre-optimize scanning pipeline, cache results |
| **LLM explanations are still confusing** | Non-technical users still don't understand findings | Medium | User testing with vibe coders, iterate on language |
| **Competitors move faster** | Enterprise tools copy our positioning | Low | Focus on indie builder community first (they're under-monetized), build moat with brand loyalty |
| **Security liability:** We miss a real vulnerability | Indie builder ships insecure code after VibeAudit scan | Medium | Clear ToS: "VibeAudit is not a substitute for professional security review"; highlight we're automated, not human expert |
| **Privacy concern:** We're analyzing user code** | Users hesitant to scan proprietary code | High | Clear privacy policy, no code stored >24hrs, no code used for model training, encrypted transit/rest |
| **Scaling costs too high** | Each scan costs more than pricing allows | Low | Optimize scanning pipeline, batch processing, negotiate tool licensing |

---

## 9. Success Criteria (MVP Launch)

**We'll consider MVP successful if:**

1. ✅ First 10 users sign up organically (no paid ads)
2. ✅ 3+ users willing to pay for a scan ($25+)
3. ✅ NPS > 30 (at least users happy it exists)
4. ✅ <5% of findings are false positives (user feedback)
5. ✅ Average scan time <3 minutes
6. ✅ 50%+ of users say "I'd use this before shipping my next project"

**If we hit these metrics, we proceed to Phase 2. If not, iterate on UX/messaging before scaling.**

---

**Document Status:** MVP Specification  
**Last Updated:** January 2026  
**Owner:** Product Team
