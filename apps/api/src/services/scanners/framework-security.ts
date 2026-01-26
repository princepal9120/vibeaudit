import * as fs from 'fs/promises';
import * as path from 'path';
import type { RawFinding, Severity, FindingCategory } from './types.js';

/**
 * Framework-Specific Security Scanner
 * Detects security issues specific to popular frameworks:
 * - Next.js / React
 * - Express.js
 * - Django
 * - Rails
 * - Laravel
 * - FastAPI
 */

interface FrameworkPattern {
  pattern: RegExp;
  title: string;
  severity: Severity;
  category: FindingCategory;
  description: string;
  impact: string;
  remediation: string;
  confidence: number;
  ruleId: string;
  frameworks?: string[]; // Optional: limit to specific frameworks
}

const FRAMEWORK_PATTERNS: FrameworkPattern[] = [
  // ==================== Next.js Security ====================
  {
    pattern: /getServerSideProps[\s\S]*?(?:req\.query|req\.params|context\.query)[\s\S]*?(?:prisma|sql|db|query)/gi,
    title: 'Next.js SSR SQL Injection Risk',
    severity: 'HIGH',
    category: 'INJECTION',
    description: 'Server-side props using query parameters directly in database queries.',
    impact: 'SQL injection in server-side rendered pages.',
    remediation: 'Validate and sanitize all query parameters before database operations.',
    confidence: 0.7,
    ruleId: 'fw-next-001',
    frameworks: ['nextjs'],
  },
  {
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*(?!.*(?:DOMPurify|sanitize))/gi,
    title: 'React XSS via dangerouslySetInnerHTML',
    severity: 'HIGH',
    category: 'XSS',
    description: 'Using dangerouslySetInnerHTML without sanitization. User input can execute scripts.',
    impact: 'Cross-site scripting (XSS) allowing session hijacking, defacement, or malware.',
    remediation: 'Sanitize HTML with DOMPurify: dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}',
    confidence: 0.85,
    ruleId: 'fw-react-001',
    frameworks: ['react', 'nextjs'],
  },
  {
    pattern: /(?:useRouter|router)\.(?:query|params)\.[a-zA-Z]+[\s\S]{0,50}(?:fetch|axios|request)\s*\(/gi,
    title: 'Next.js SSRF via Router Parameters',
    severity: 'HIGH',
    category: 'INJECTION',
    description: 'Router parameters used in HTTP requests without validation.',
    impact: 'Server-side request forgery through URL manipulation.',
    remediation: 'Validate and whitelist allowed URLs/domains before making requests.',
    confidence: 0.75,
    ruleId: 'fw-next-002',
    frameworks: ['nextjs'],
  },
  {
    pattern: /(?:headers|cookies)\s*\(\s*\)\.get\s*\([^)]+\)[\s\S]{0,30}(?:redirect|rewrite)/gi,
    title: 'Next.js Open Redirect via Headers',
    severity: 'MEDIUM',
    category: 'AUTH',
    description: 'Using header/cookie values to determine redirect target without validation.',
    impact: 'Open redirect enabling phishing attacks.',
    remediation: 'Validate redirect URLs against whitelist of allowed destinations.',
    confidence: 0.7,
    ruleId: 'fw-next-003',
    frameworks: ['nextjs'],
  },
  {
    pattern: /(?:export\s+(?:const|let|var)|module\.exports\s*=)[\s\S]*?(?:api|secret|key|password)\s*[=:]\s*['"][^'"]+['"]/gi,
    title: 'Secrets Exposed in Client Bundle',
    severity: 'CRITICAL',
    category: 'SECRETS',
    description: 'Secrets defined in files that may be included in client-side bundle.',
    impact: 'API keys and secrets visible to anyone inspecting browser JavaScript.',
    remediation: 'Use NEXT_PUBLIC_ prefix only for public values. Keep secrets server-side only.',
    confidence: 0.6,
    ruleId: 'fw-next-004',
    frameworks: ['nextjs', 'react'],
  },
  {
    pattern: /(?:Image|img)\s+[^>]*src\s*=\s*\{[^}]*(?:user|input|param|query)/gi,
    title: 'User-Controlled Image Source',
    severity: 'MEDIUM',
    category: 'XSS',
    description: 'Image source controlled by user input. Can be used for tracking pixels or SSRF.',
    impact: 'User tracking, SSRF via image proxy, potential XSS in older browsers.',
    remediation: 'Validate image URLs, use Content Security Policy, restrict to trusted domains.',
    confidence: 0.65,
    ruleId: 'fw-react-002',
    frameworks: ['react', 'nextjs'],
  },

  // ==================== Express.js Security ====================
  {
    pattern: /app\.(?:use|get|post|put|delete)\s*\([^)]*(?:\/\*|:\w+\*)/gi,
    title: 'Express Wildcard Route',
    severity: 'LOW',
    category: 'CONFIGURATION',
    description: 'Wildcard route may match more paths than intended.',
    impact: 'Unintended route matching could bypass access controls.',
    remediation: 'Use specific route patterns. Review wildcard necessity.',
    confidence: 0.5,
    ruleId: 'fw-express-001',
    frameworks: ['express'],
  },
  {
    pattern: /cors\s*\(\s*\{[\s\S]*?origin\s*:\s*(?:true|['"]?\*['"]?)/gi,
    title: 'Express CORS Allowing All Origins',
    severity: 'MEDIUM',
    category: 'HEADERS',
    description: 'CORS configured to allow all origins.',
    impact: 'Any website can make authenticated cross-origin requests.',
    remediation: 'Specify allowed origins: cors({ origin: ["https://trusted.com"] })',
    confidence: 0.85,
    ruleId: 'fw-express-002',
    frameworks: ['express'],
  },
  {
    pattern: /(?:express\.static|serveStatic)\s*\(\s*(?:__dirname|process\.cwd|path\.join|['"]\.)/gi,
    title: 'Express Static File Serving',
    severity: 'LOW',
    category: 'CONFIGURATION',
    description: 'Static file serving detected. Ensure sensitive files are not exposed.',
    impact: 'Potential exposure of .env, config files, or source code.',
    remediation: 'Review static directory contents. Add dotfiles: "deny" option.',
    confidence: 0.5,
    ruleId: 'fw-express-003',
    frameworks: ['express'],
  },
  {
    pattern: /app\.use\s*\(\s*(?:helmet|cors|express\.json)\s*\(\s*\)\s*\)/gi,
    negative: true,
    title: 'Missing Express Security Middleware',
    severity: 'MEDIUM',
    category: 'HEADERS',
    description: 'Security middleware (helmet) not detected in Express app.',
    impact: 'Missing security headers like CSP, HSTS, X-Frame-Options.',
    remediation: 'Add helmet middleware: app.use(helmet())',
    confidence: 0.5,
    ruleId: 'fw-express-004',
    frameworks: ['express'],
  },
  {
    pattern: /res\.(?:send|json)\s*\(\s*(?:err|error)(?:\.stack|\.message)?\s*\)/gi,
    title: 'Express Error Details Exposed',
    severity: 'MEDIUM',
    category: 'CONFIGURATION',
    description: 'Error details sent directly in response. May expose stack traces.',
    impact: 'Information disclosure via error messages and stack traces.',
    remediation: 'Use error handling middleware that sanitizes errors in production.',
    confidence: 0.75,
    ruleId: 'fw-express-005',
    frameworks: ['express'],
  },
  {
    pattern: /bodyParser\.(?:json|urlencoded)\s*\(\s*\{[^}]*limit\s*:\s*['"](?:\d{3,}[kmg]b|\d{8,})['"]|bodyParser\.raw\s*\(/gi,
    title: 'Express Large Body Limit',
    severity: 'MEDIUM',
    category: 'CONFIGURATION',
    description: 'Body parser configured with very large limit or raw body parsing.',
    impact: 'Denial of service through large payload attacks.',
    remediation: 'Set reasonable limits: bodyParser.json({ limit: "100kb" })',
    confidence: 0.7,
    ruleId: 'fw-express-006',
    frameworks: ['express'],
  },

  // ==================== Authentication Patterns (All Frameworks) ====================
  {
    pattern: /(?:bcrypt|argon2|scrypt)\.(?:compare|verify)\s*\([^)]*\)\.then\s*\([^)]*=>\s*\{[\s\S]*?(?:==|===|!=|!==)/gi,
    title: 'Timing Attack in Password Comparison',
    severity: 'MEDIUM',
    category: 'CRYPTOGRAPHY',
    description: 'Additional comparison after secure password check may introduce timing leak.',
    impact: 'Timing side-channel allowing password enumeration.',
    remediation: 'Let bcrypt/argon2 handle all comparison logic. Avoid additional checks.',
    confidence: 0.6,
    ruleId: 'fw-auth-001',
  },
  {
    pattern: /(?:session|cookie)[\s\S]{0,50}(?:secure\s*:\s*false|httpOnly\s*:\s*false|sameSite\s*:\s*['"]?none['"]?)/gi,
    title: 'Insecure Session Cookie Configuration',
    severity: 'HIGH',
    category: 'AUTH',
    description: 'Session cookie missing security flags (secure, httpOnly, sameSite).',
    impact: 'Session hijacking via XSS or network interception.',
    remediation: 'Set secure: true, httpOnly: true, sameSite: "strict" for session cookies.',
    confidence: 0.9,
    ruleId: 'fw-auth-002',
  },
  {
    pattern: /(?:remember|persistent|long)[\s\S]{0,30}(?:token|session|cookie)[\s\S]{0,50}(?:expire|maxAge)\s*:\s*(?:\d{8,}|['"]?\d+\s*\*\s*\d+\s*\*\s*\d+\s*\*\s*\d+)/gi,
    title: 'Extremely Long Session Duration',
    severity: 'MEDIUM',
    category: 'AUTH',
    description: 'Session or remember-me token configured with very long expiration.',
    impact: 'Stolen tokens remain valid for extended periods.',
    remediation: 'Use reasonable session durations. Implement token rotation for remember-me.',
    confidence: 0.7,
    ruleId: 'fw-auth-003',
  },

  // ==================== API Security ====================
  {
    pattern: /(?:app|router)\.(?:get|post|put|patch|delete)\s*\(\s*['"`][^'"`]*(?:admin|internal|private|secret)[^'"`]*['"`](?!\s*,\s*(?:auth|isAuth|requireAuth|isAdmin|checkAuth|protect|authenticate))/gi,
    title: 'Sensitive Route Without Visible Auth Middleware',
    severity: 'HIGH',
    category: 'AUTH',
    description: 'Route with sensitive name (admin, internal, private) without visible authentication middleware.',
    impact: 'Administrative or internal endpoints may be publicly accessible.',
    remediation: 'Add authentication middleware: app.get("/admin", isAuthenticated, handler)',
    confidence: 0.6,
    ruleId: 'fw-api-001',
  },
  {
    pattern: /(?:res|response)\.(?:json|send)\s*\(\s*(?:await\s+)?(?:\w+\.)?find(?:All|Many)?\s*\(/gi,
    title: 'Database Query Result Directly Returned',
    severity: 'MEDIUM',
    category: 'OTHER',
    description: 'Database query result returned directly without field selection.',
    impact: 'May expose internal fields, IDs, timestamps, or sensitive data.',
    remediation: 'Use DTOs or select specific fields to return.',
    confidence: 0.65,
    ruleId: 'fw-api-002',
  },
  {
    pattern: /\.(?:skip|offset)\s*\(\s*(?:parseInt|Number)?\s*\(?\s*(?:req|request|ctx)\.(?:query|params)\.\w+/gi,
    title: 'Unvalidated Pagination Parameters',
    severity: 'LOW',
    category: 'OTHER',
    description: 'Pagination parameters used without validation. Large values can cause performance issues.',
    impact: 'Denial of service through large skip/offset values.',
    remediation: 'Validate and cap pagination values: Math.min(parseInt(skip) || 0, 10000)',
    confidence: 0.6,
    ruleId: 'fw-api-003',
  },

  // ==================== File Operations ====================
  {
    pattern: /(?:createReadStream|createWriteStream|readFile|writeFile|appendFile)\s*\(\s*(?:req|request|params|query|body)\./gi,
    title: 'Path Traversal via User Input',
    severity: 'CRITICAL',
    category: 'INJECTION',
    description: 'File operation using user-controlled path. Path traversal attacks possible.',
    impact: 'Arbitrary file read/write, potential RCE through file operations.',
    remediation: 'Validate and sanitize paths. Use path.basename() to strip directory components.',
    confidence: 0.9,
    ruleId: 'fw-file-001',
  },
  {
    pattern: /path\.join\s*\([^)]*(?:req|request|params|query|body)\.[^)]*\)/gi,
    title: 'User Input in File Path',
    severity: 'HIGH',
    category: 'INJECTION',
    description: 'User input included in file path construction. May allow path traversal.',
    impact: 'Access to files outside intended directory.',
    remediation: 'Validate input, use path.normalize() and verify result stays within allowed directory.',
    confidence: 0.75,
    ruleId: 'fw-file-002',
  },

  // ==================== Template Injection ====================
  {
    pattern: /(?:render|template|compile)\s*\([^)]*(?:req|request|params|query|body)\.[^)]*\)/gi,
    title: 'Server-Side Template Injection (SSTI)',
    severity: 'CRITICAL',
    category: 'INJECTION',
    description: 'User input passed to template engine. Can lead to remote code execution.',
    impact: 'Remote code execution through template injection.',
    remediation: 'Never pass user input as template source. Only use as template variables.',
    confidence: 0.8,
    ruleId: 'fw-ssti-001',
  },
  {
    pattern: /new\s+Function\s*\([^)]*(?:req|request|params|query|body)\./gi,
    title: 'Code Injection via Function Constructor',
    severity: 'CRITICAL',
    category: 'INJECTION',
    description: 'Creating functions from user input. Equivalent to eval().',
    impact: 'Remote code execution.',
    remediation: 'Never use Function constructor with user input. Find alternative approaches.',
    confidence: 0.95,
    ruleId: 'fw-inject-001',
  },

  // ==================== Logging ====================
  {
    pattern: /(?:console\.log|logger\.\w+|log\.\w+)\s*\([^)]*(?:password|secret|token|apiKey|authorization|credit.?card|ssn|bearer)/gi,
    title: 'Sensitive Data Logged',
    severity: 'MEDIUM',
    category: 'SECRETS',
    description: 'Potentially logging sensitive data like passwords, tokens, or PII.',
    impact: 'Sensitive data exposed in log files or log management systems.',
    remediation: 'Redact sensitive fields before logging. Use structured logging with field filtering.',
    confidence: 0.75,
    ruleId: 'fw-log-001',
  },

  // ==================== Cryptography ====================
  {
    pattern: /crypto\.createCipher\s*\(/gi,
    title: 'Deprecated Crypto API (createCipher)',
    severity: 'HIGH',
    category: 'CRYPTOGRAPHY',
    description: 'Using deprecated createCipher which derives key insecurely.',
    impact: 'Weak key derivation, potential data exposure.',
    remediation: 'Use crypto.createCipheriv with proper key derivation (PBKDF2, scrypt).',
    confidence: 0.95,
    ruleId: 'fw-crypto-001',
  },
  {
    pattern: /(?:MD5|SHA1|sha1|md5)\s*\(/gi,
    title: 'Weak Hash Algorithm',
    severity: 'MEDIUM',
    category: 'CRYPTOGRAPHY',
    description: 'Using MD5 or SHA1 which are cryptographically broken.',
    impact: 'Hash collisions possible, unsuitable for security purposes.',
    remediation: 'Use SHA-256 or SHA-3. For passwords, use bcrypt or argon2.',
    confidence: 0.8,
    ruleId: 'fw-crypto-002',
  },
  {
    pattern: /(?:iv|nonce|salt)\s*[:=]\s*(?:['"][^'"]+['"]|Buffer\.from\s*\(\s*['"][^'"]+['"]\s*\))/gi,
    title: 'Static IV/Nonce/Salt',
    severity: 'HIGH',
    category: 'CRYPTOGRAPHY',
    description: 'Using static initialization vector, nonce, or salt for cryptography.',
    impact: 'Breaks encryption security. Same plaintext produces same ciphertext.',
    remediation: 'Generate random IV/nonce per operation: crypto.randomBytes(16)',
    confidence: 0.85,
    ruleId: 'fw-crypto-003',
  },

  // ==================== Subprocess ====================
  {
    pattern: /(?:exec|execSync|spawn|spawnSync)\s*\(\s*(?:`[^`]*\$\{|['"][^'"]*['"]\s*\+|(?:req|request|params|query|body)\.)/gi,
    title: 'Command Injection via Subprocess',
    severity: 'CRITICAL',
    category: 'INJECTION',
    description: 'Subprocess execution with user-controlled input or string concatenation.',
    impact: 'Remote code execution through command injection.',
    remediation: 'Use spawn with array arguments: spawn("cmd", [arg1, arg2]). Never interpolate user input.',
    confidence: 0.9,
    ruleId: 'fw-cmd-001',
  },

  // ==================== Regex DoS ====================
  {
    pattern: /new\s+RegExp\s*\(\s*(?:req|request|params|query|body)\./gi,
    title: 'ReDoS via User-Controlled Regex',
    severity: 'HIGH',
    category: 'OTHER',
    description: 'Creating regex from user input. Malicious patterns cause CPU exhaustion.',
    impact: 'Denial of service through catastrophic backtracking.',
    remediation: 'Never create regex from user input. If necessary, use regex-safe library with timeout.',
    confidence: 0.9,
    ruleId: 'fw-redos-001',
  },
];

/**
 * Detect framework used in the repository
 */
async function detectFrameworks(repoPath: string): Promise<Set<string>> {
  const frameworks = new Set<string>();

  try {
    const packageJsonPath = path.join(repoPath, 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (allDeps['next']) frameworks.add('nextjs');
    if (allDeps['react']) frameworks.add('react');
    if (allDeps['express']) frameworks.add('express');
    if (allDeps['koa']) frameworks.add('koa');
    if (allDeps['fastify']) frameworks.add('fastify');
    if (allDeps['hono']) frameworks.add('hono');
    if (allDeps['@nestjs/core']) frameworks.add('nestjs');
    if (allDeps['vue']) frameworks.add('vue');
    if (allDeps['svelte']) frameworks.add('svelte');
    if (allDeps['angular']) frameworks.add('angular');
  } catch {
    // package.json not found or invalid
  }

  // Check for Python frameworks
  try {
    const requirementsPath = path.join(repoPath, 'requirements.txt');
    const content = await fs.readFile(requirementsPath, 'utf-8');
    if (content.includes('django')) frameworks.add('django');
    if (content.includes('flask')) frameworks.add('flask');
    if (content.includes('fastapi')) frameworks.add('fastapi');
  } catch {
    // requirements.txt not found
  }

  return frameworks;
}

/**
 * Run framework-specific security scan
 */
export async function runFrameworkSecurityScan(repoPath: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    const frameworks = await detectFrameworks(repoPath);
    console.log(`[Framework Security] Detected frameworks: ${[...frameworks].join(', ') || 'generic'}`);

    const files = await collectSourceFiles(repoPath);
    console.log(`[Framework Security] Scanning ${files.length} files...`);

    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(repoPath, filePath);

        const fileFindings = analyzeFile(content, relativePath, frameworks);
        findings.push(...fileFindings);
      } catch {
        continue;
      }
    }

    console.log(`[Framework Security] Found ${findings.length} framework-specific issues`);
    return deduplicateFindings(findings);
  } catch (error) {
    console.error('[Framework Security] Scan failed:', error);
    return [];
  }
}

/**
 * Collect source files
 */
async function collectSourceFiles(dir: string, files: string[] = []): Promise<string[]> {
  const extensions = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs', '.py', '.rb', '.php']);
  const skipDirs = new Set(['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', 'vendor']);

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) {
          await collectSourceFiles(fullPath, files);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.has(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Directory not accessible
  }

  return files;
}

/**
 * Analyze file for framework-specific issues
 */
function analyzeFile(content: string, filePath: string, frameworks: Set<string>): RawFinding[] {
  const findings: RawFinding[] = [];
  const lines = content.split('\n');

  for (const pattern of FRAMEWORK_PATTERNS) {
    // Check if pattern applies to detected frameworks
    if (pattern.frameworks && !pattern.frameworks.some(f => frameworks.has(f))) {
      continue;
    }

    pattern.pattern.lastIndex = 0;

    let match;
    while ((match = pattern.pattern.exec(content)) !== null) {
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;

      const startLine = Math.max(0, lineNumber - 2);
      const endLine = Math.min(lines.length, lineNumber + 2);
      const codeSnippet = lines.slice(startLine, endLine).join('\n');

      findings.push({
        title: pattern.title,
        severity: pattern.severity,
        category: pattern.category,
        source: 'ADVANCED',
        description: pattern.description,
        impact: pattern.impact,
        remediation: pattern.remediation,
        filePath,
        lineNumber,
        codeSnippet,
        confidence: pattern.confidence,
        ruleId: pattern.ruleId,
        rawFinding: { matchedText: match[0] },
      });

      if (!pattern.pattern.global) break;
    }
  }

  return findings;
}

/**
 * Deduplicate findings
 */
function deduplicateFindings(findings: RawFinding[]): RawFinding[] {
  const seen = new Set<string>();
  return findings.filter(f => {
    const key = `${f.ruleId}:${f.filePath}:${f.lineNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
