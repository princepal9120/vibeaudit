import * as fs from 'fs/promises';
import * as path from 'path';
import type { RawFinding, Severity, FindingCategory, ScanSource } from './types.js';

/**
 * Advanced Security Scanner
 * Detects high-level security vulnerabilities that automated tools often miss:
 * - IDOR (Insecure Direct Object Reference)
 * - Race Conditions
 * - JWT Security Issues
 * - Mass Assignment
 * - SSRF (Server-Side Request Forgery)
 * - Prototype Pollution
 * - Authentication Bypass Patterns
 * - Missing Rate Limiting
 * - GraphQL Vulnerabilities
 * - Insecure Deserialization
 */

// File extensions to scan
const SCAN_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs',
  '.py', '.rb', '.php', '.java', '.go', '.cs',
  '.vue', '.svelte',
]);

// Directories to skip
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage',
  '__pycache__', '.next', '.nuxt', 'vendor', '.venv',
]);

interface PatternMatch {
  pattern: RegExp;
  title: string;
  severity: Severity;
  category: FindingCategory;
  description: string;
  impact: string;
  remediation: string;
  confidence: number;
  ruleId: string;
}

// Advanced security patterns
const SECURITY_PATTERNS: PatternMatch[] = [
  // ==================== IDOR (Insecure Direct Object Reference) ====================
  {
    pattern: /(?:findById|findOne|getById|get|fetch)\s*\(\s*(?:req\.params\.|req\.query\.|params\.|query\.)\w+\s*\)/gi,
    title: 'Potential IDOR Vulnerability',
    severity: 'HIGH',
    category: 'AUTH',
    description: 'Direct object reference using user-supplied ID without authorization check. Attackers can access other users\' data by manipulating the ID parameter.',
    impact: 'Unauthorized access to sensitive data belonging to other users. This can lead to data breaches and privacy violations.',
    remediation: 'Always verify that the authenticated user has permission to access the requested resource. Add authorization checks like: if (resource.userId !== req.user.id) return 403.',
    confidence: 0.75,
    ruleId: 'advanced-idor-001',
  },
  {
    pattern: /\.findUnique\s*\(\s*\{[^}]*where\s*:\s*\{[^}]*id\s*:\s*(?:parseInt|Number)?\s*\(?\s*(?:req\.params|params|ctx\.params)/gi,
    title: 'Prisma IDOR - Missing User Verification',
    severity: 'HIGH',
    category: 'AUTH',
    description: 'Prisma query uses user-supplied ID without verifying ownership. This is a common pattern leading to IDOR vulnerabilities.',
    impact: 'Attackers can access or modify any database record by guessing or enumerating IDs.',
    remediation: 'Add userId to the where clause: where: { id, userId: req.user.id } to ensure users can only access their own records.',
    confidence: 0.8,
    ruleId: 'advanced-idor-002',
  },

  // ==================== Race Conditions ====================
  {
    pattern: /(?:balance|credits?|points?|quantity|stock|inventory|amount|count)\s*(?:>=?|<=?|===?|!==?)\s*\d+[\s\S]{0,100}(?:update|decrement|increment|set)/gi,
    title: 'Potential Race Condition - Check-Then-Act',
    severity: 'HIGH',
    category: 'OTHER',
    description: 'Check-then-act pattern detected on sensitive values (balance, credits, inventory). This can lead to race conditions where multiple requests can bypass the check.',
    impact: 'Attackers can exploit timing windows to overdraw balances, duplicate items, or bypass limits by sending concurrent requests.',
    remediation: 'Use database transactions with row-level locking (SELECT FOR UPDATE), or atomic operations like UPDATE ... WHERE balance >= amount RETURNING *.',
    confidence: 0.7,
    ruleId: 'advanced-race-001',
  },
  {
    pattern: /if\s*\([^)]*(?:exists|count|length)[^)]*\)[\s\S]{0,50}(?:create|insert|add|save)/gi,
    title: 'Race Condition - Existence Check Before Create',
    severity: 'MEDIUM',
    category: 'OTHER',
    description: 'Checking if a record exists before creating it without using database constraints. Two concurrent requests can both pass the check.',
    impact: 'Duplicate records, constraint violations, or data corruption from concurrent requests.',
    remediation: 'Use unique database constraints and handle constraint violation errors, or use upsert/ON CONFLICT operations.',
    confidence: 0.65,
    ruleId: 'advanced-race-002',
  },

  // ==================== JWT Security Issues ====================
  {
    pattern: /jwt\.(?:sign|verify)\s*\([^)]*(?:algorithm|alg)\s*:\s*['"](?:none|HS256)['"][^)]*\)/gi,
    title: 'Weak JWT Algorithm',
    severity: 'CRITICAL',
    category: 'CRYPTOGRAPHY',
    description: 'JWT using weak or no algorithm. "none" algorithm allows unsigned tokens. HS256 with weak secrets is vulnerable to brute force.',
    impact: 'Attackers can forge valid JWT tokens and impersonate any user, including administrators.',
    remediation: 'Use RS256 or ES256 algorithms with proper key management. Never allow "none" algorithm. Use strong secrets (256+ bits) for symmetric algorithms.',
    confidence: 0.9,
    ruleId: 'advanced-jwt-001',
  },
  {
    pattern: /jwt\.verify\s*\([^)]*\{\s*(?:algorithms\s*:\s*\[[^\]]*\])?[^}]*\}\s*\)/gi,
    title: 'JWT Verify Without Algorithm Restriction',
    severity: 'HIGH',
    category: 'CRYPTOGRAPHY',
    description: 'JWT verification without explicitly specifying allowed algorithms. This can enable algorithm confusion attacks.',
    impact: 'Attackers may trick the server into using a different algorithm, potentially forging tokens.',
    remediation: 'Always specify the expected algorithm: jwt.verify(token, secret, { algorithms: ["RS256"] })',
    confidence: 0.7,
    ruleId: 'advanced-jwt-002',
  },
  {
    pattern: /(?:jwt|token|secret|JWT_SECRET)\s*[:=]\s*['"][^'"]{1,20}['"]/gi,
    title: 'Weak JWT Secret',
    severity: 'CRITICAL',
    category: 'SECRETS',
    description: 'JWT secret appears to be too short (less than 20 characters). Short secrets can be brute-forced.',
    impact: 'Attackers can brute-force the secret and forge valid authentication tokens.',
    remediation: 'Use a cryptographically random secret of at least 256 bits (32+ characters). Store in environment variables, not in code.',
    confidence: 0.75,
    ruleId: 'advanced-jwt-003',
  },

  // ==================== Mass Assignment ====================
  {
    pattern: /(?:create|update|insert|save)\s*\(\s*(?:req\.body|request\.body|body|ctx\.request\.body|data)\s*\)/gi,
    title: 'Mass Assignment Vulnerability',
    severity: 'HIGH',
    category: 'AUTH',
    description: 'Directly passing user input to database operations. Attackers can set unauthorized fields like isAdmin, role, or balance.',
    impact: 'Privilege escalation - attackers can modify fields they shouldn\'t have access to, potentially gaining admin access.',
    remediation: 'Whitelist allowed fields: const { name, email } = req.body; await db.create({ name, email }). Never spread request body directly.',
    confidence: 0.8,
    ruleId: 'advanced-mass-001',
  },
  {
    pattern: /Object\.assign\s*\(\s*\w+\s*,\s*(?:req\.body|request\.body|body|ctx\.body)\s*\)/gi,
    title: 'Mass Assignment via Object.assign',
    severity: 'HIGH',
    category: 'AUTH',
    description: 'Using Object.assign to merge user input into an object. This allows attackers to override any property.',
    impact: 'Attackers can modify internal object properties, potentially bypassing security controls.',
    remediation: 'Explicitly pick allowed properties instead of merging entire objects from user input.',
    confidence: 0.85,
    ruleId: 'advanced-mass-002',
  },
  {
    pattern: /\{\s*\.\.\.(?:req\.body|request\.body|body|ctx\.body|data)\s*[,}]/gi,
    title: 'Mass Assignment via Spread Operator',
    severity: 'HIGH',
    category: 'AUTH',
    description: 'Spreading user input directly into objects. All properties from the request are included without validation.',
    impact: 'Attackers can inject additional properties like role: "admin" or verified: true.',
    remediation: 'Destructure only expected properties: const { name, email } = req.body; return { name, email };',
    confidence: 0.85,
    ruleId: 'advanced-mass-003',
  },

  // ==================== SSRF (Server-Side Request Forgery) ====================
  {
    pattern: /(?:axios|fetch|request|http\.get|https\.get|got|superagent|urllib)\s*\(\s*(?:req\.|request\.|params\.|query\.|body\.)\w*(?:url|uri|link|href|endpoint|host|target)/gi,
    title: 'SSRF Vulnerability - User-Controlled URL',
    severity: 'CRITICAL',
    category: 'INJECTION',
    description: 'HTTP request made to a user-controlled URL. Attackers can make requests to internal services, cloud metadata endpoints, or localhost.',
    impact: 'Access to internal services, cloud credentials (169.254.169.254), localhost admin panels, and internal network scanning.',
    remediation: 'Validate and whitelist allowed domains. Block private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x). Use URL parsing to extract and validate host.',
    confidence: 0.9,
    ruleId: 'advanced-ssrf-001',
  },
  {
    pattern: /new\s+URL\s*\(\s*(?:req|request|params|query|body)\.\w+\s*\)[\s\S]{0,50}(?:fetch|axios|request|http)/gi,
    title: 'SSRF - URL Object from User Input',
    severity: 'HIGH',
    category: 'INJECTION',
    description: 'URL object created from user input used in HTTP request. Even with URL parsing, internal addresses can be accessed.',
    impact: 'Server-side request forgery allowing access to internal resources.',
    remediation: 'After parsing the URL, validate the hostname against an allowlist. Block requests to private IP ranges.',
    confidence: 0.8,
    ruleId: 'advanced-ssrf-002',
  },

  // ==================== Prototype Pollution ====================
  {
    pattern: /(?:merge|extend|deepMerge|assign|defaults)\s*\([^)]*(?:req\.body|request\.body|body|JSON\.parse)/gi,
    title: 'Prototype Pollution Risk',
    severity: 'HIGH',
    category: 'INJECTION',
    description: 'Deep merge or extend operation with user-controlled input. Attackers can inject __proto__ to pollute Object.prototype.',
    impact: 'Remote code execution, denial of service, or security bypass by modifying object prototypes.',
    remediation: 'Use Object.create(null) for objects, filter out __proto__, constructor, and prototype keys. Use libraries like lodash with prototype pollution protection.',
    confidence: 0.75,
    ruleId: 'advanced-proto-001',
  },
  {
    pattern: /\[(?:req|request|body|params|query)\.\w+\]\s*=/gi,
    title: 'Dynamic Property Assignment',
    severity: 'MEDIUM',
    category: 'INJECTION',
    description: 'Object property set using user-controlled key. Can lead to prototype pollution if key is __proto__.',
    impact: 'Prototype pollution leading to application-wide security issues.',
    remediation: 'Validate property names against an allowlist. Reject keys like __proto__, constructor, prototype.',
    confidence: 0.7,
    ruleId: 'advanced-proto-002',
  },

  // ==================== Authentication Bypass ====================
  {
    pattern: /if\s*\(\s*!?\s*(?:req\.user|user|session|currentUser|ctx\.user)\s*\)\s*(?:return|next|throw)?[^}]*(?:isAdmin|role|admin|permission)/gi,
    title: 'Authentication Check After Authorization',
    severity: 'HIGH',
    category: 'AUTH',
    description: 'Authorization check (isAdmin, role) appears near authentication check but may execute before authentication is verified.',
    impact: 'Unauthenticated users might bypass authorization checks or gain elevated privileges.',
    remediation: 'Always verify authentication before authorization. Use middleware that guarantees req.user exists before route handlers.',
    confidence: 0.65,
    ruleId: 'advanced-auth-001',
  },
  {
    pattern: /(?:password|pwd|passwd)\s*(?:===?|==)\s*(?:req\.|body\.|params\.|query\.)\w+/gi,
    title: 'Plain Text Password Comparison',
    severity: 'CRITICAL',
    category: 'AUTH',
    description: 'Password appears to be compared directly without hashing. Passwords should never be stored or compared in plain text.',
    impact: 'Passwords stored in plain text can be stolen in a database breach.',
    remediation: 'Use bcrypt or argon2 to hash passwords: await bcrypt.compare(inputPassword, hashedPassword)',
    confidence: 0.85,
    ruleId: 'advanced-auth-002',
  },
  {
    pattern: /(?:Bearer|token|jwt)\s+\$\{|\`.*(?:Bearer|token|jwt).*\$\{/gi,
    title: 'Token in URL or Interpolated String',
    severity: 'MEDIUM',
    category: 'AUTH',
    description: 'Authentication token appears to be interpolated into a string, possibly a URL. Tokens in URLs can leak via referer headers and logs.',
    impact: 'Token leakage through browser history, server logs, or HTTP referer headers.',
    remediation: 'Send tokens in Authorization header only, never in URLs or query parameters.',
    confidence: 0.7,
    ruleId: 'advanced-auth-003',
  },

  // ==================== Missing Rate Limiting ====================
  {
    pattern: /(?:post|put|patch)\s*\(\s*['"`]\/(?:login|signin|auth|register|signup|password|reset|forgot|otp|verify|2fa)/gi,
    title: 'Missing Rate Limiting on Auth Endpoint',
    severity: 'HIGH',
    category: 'AUTH',
    description: 'Authentication endpoint without visible rate limiting. These endpoints are primary targets for brute force attacks.',
    impact: 'Brute force attacks on login, credential stuffing, OTP bypass, and account enumeration.',
    remediation: 'Add rate limiting middleware: rateLimit({ windowMs: 15*60*1000, max: 5 }) for auth routes. Consider progressive delays.',
    confidence: 0.6,
    ruleId: 'advanced-rate-001',
  },
  {
    pattern: /(?:post|put|patch)\s*\(\s*['"`]\/(?:payment|checkout|purchase|transaction|transfer|withdraw)/gi,
    title: 'Missing Rate Limiting on Financial Endpoint',
    severity: 'HIGH',
    category: 'OTHER',
    description: 'Financial endpoint without visible rate limiting. Attackers can spam transactions or exploit race conditions.',
    impact: 'Financial fraud, transaction flooding, or exploitation of race conditions in payment logic.',
    remediation: 'Add strict rate limiting and implement idempotency keys for financial operations.',
    confidence: 0.6,
    ruleId: 'advanced-rate-002',
  },

  // ==================== GraphQL Vulnerabilities ====================
  {
    pattern: /introspection\s*:\s*true|enableIntrospection|introspectionEnabled/gi,
    title: 'GraphQL Introspection Enabled',
    severity: 'MEDIUM',
    category: 'CONFIGURATION',
    description: 'GraphQL introspection is enabled. This exposes your entire API schema to attackers.',
    impact: 'Attackers can discover all queries, mutations, types, and fields in your API.',
    remediation: 'Disable introspection in production: introspection: process.env.NODE_ENV !== "production"',
    confidence: 0.9,
    ruleId: 'advanced-gql-001',
  },
  {
    pattern: /graphql[\s\S]{0,200}(?:!(?:depthLimit|queryDepth|maxDepth)|depth\s*:\s*(?:undefined|null|Infinity))/gi,
    title: 'GraphQL Missing Depth Limit',
    severity: 'HIGH',
    category: 'CONFIGURATION',
    description: 'GraphQL API without query depth limiting. Attackers can craft deeply nested queries causing DoS.',
    impact: 'Denial of service through deeply nested queries that consume excessive server resources.',
    remediation: 'Add depth limiting: depthLimit(10). Also consider query complexity analysis.',
    confidence: 0.7,
    ruleId: 'advanced-gql-002',
  },

  // ==================== Insecure Deserialization ====================
  {
    pattern: /JSON\.parse\s*\(\s*(?:req\.|request\.|body|Buffer|readFile)/gi,
    title: 'JSON Parsing User Input Without Schema Validation',
    severity: 'MEDIUM',
    category: 'INJECTION',
    description: 'JSON.parse on user input without schema validation. While JSON.parse itself is safe, the parsed data should be validated.',
    impact: 'Type confusion, unexpected data shapes, or business logic bypass.',
    remediation: 'Validate parsed JSON against a schema using Zod, Yup, or JSON Schema before processing.',
    confidence: 0.6,
    ruleId: 'advanced-deser-001',
  },
  {
    pattern: /(?:pickle\.loads?|yaml\.load|marshal\.loads?|unserialize|ObjectInputStream|readObject)\s*\(/gi,
    title: 'Dangerous Deserialization Function',
    severity: 'CRITICAL',
    category: 'INJECTION',
    description: 'Using unsafe deserialization (pickle, yaml.load, PHP unserialize, Java readObject). These can execute arbitrary code.',
    impact: 'Remote code execution through crafted serialized payloads.',
    remediation: 'Use safe alternatives: yaml.safe_load instead of yaml.load. Never deserialize untrusted data with pickle/marshal.',
    confidence: 0.95,
    ruleId: 'advanced-deser-002',
  },
  {
    pattern: /eval\s*\(\s*(?:req\.|request\.|body|params|query|JSON\.parse)/gi,
    title: 'Code Injection via eval()',
    severity: 'CRITICAL',
    category: 'INJECTION',
    description: 'Using eval() with user input. This allows arbitrary JavaScript code execution.',
    impact: 'Complete server compromise through arbitrary code execution.',
    remediation: 'Never use eval() with user input. Use JSON.parse() for JSON data, or a safe expression parser.',
    confidence: 0.95,
    ruleId: 'advanced-deser-003',
  },

  // ==================== Timing Attacks ====================
  {
    pattern: /(?:===?|!==?)\s*['"][^'"]+['"]\s*(?:&&|\|\||\?|;|$)|['"][^'"]+['"]\s*(?:===?|!==?)/g,
    title: 'Potential Timing Attack on Secret Comparison',
    severity: 'LOW',
    category: 'CRYPTOGRAPHY',
    description: 'String comparison that might involve secrets (tokens, keys). Regular comparison leaks timing information.',
    impact: 'Attackers can gradually determine secret values by measuring response times.',
    remediation: 'Use constant-time comparison: crypto.timingSafeEqual() for comparing secrets, tokens, or hashes.',
    confidence: 0.4,
    ruleId: 'advanced-timing-001',
  },

  // ==================== Sensitive Data Exposure ====================
  {
    pattern: /console\.log\s*\([^)]*(?:password|secret|token|key|credential|auth|bearer|jwt|session)/gi,
    title: 'Sensitive Data in Logs',
    severity: 'MEDIUM',
    category: 'SECRETS',
    description: 'Potentially logging sensitive data (passwords, tokens, keys). Logs are often stored insecurely.',
    impact: 'Credential leakage through log files, log aggregation services, or error tracking.',
    remediation: 'Never log sensitive data. Redact or mask sensitive fields before logging.',
    confidence: 0.7,
    ruleId: 'advanced-exposure-001',
  },
  {
    pattern: /(?:res|response)\.(?:json|send|render)\s*\([^)]*(?:password|secret|token|apiKey|privateKey)/gi,
    title: 'Sensitive Data in Response',
    severity: 'HIGH',
    category: 'SECRETS',
    description: 'Potentially returning sensitive data in API response. Internal fields should not be exposed.',
    impact: 'Exposure of secrets, internal tokens, or credentials to clients.',
    remediation: 'Use DTOs or explicitly select fields to return. Never include sensitive fields in responses.',
    confidence: 0.75,
    ruleId: 'advanced-exposure-002',
  },

  // ==================== SQL Injection (Advanced Patterns) ====================
  {
    pattern: /(?:\$\{|\+\s*)\s*(?:req\.|request\.|params\.|query\.|body\.)\w+[\s\S]{0,20}(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|ORDER BY|GROUP BY)/gi,
    title: 'SQL Injection - String Interpolation',
    severity: 'CRITICAL',
    category: 'INJECTION',
    description: 'SQL query built using string interpolation with user input. This is a classic SQL injection vulnerability.',
    impact: 'Complete database compromise - attackers can read, modify, or delete any data.',
    remediation: 'Use parameterized queries or ORM methods: db.query("SELECT * FROM users WHERE id = $1", [userId])',
    confidence: 0.9,
    ruleId: 'advanced-sql-001',
  },
  {
    pattern: /\.(?:raw|rawQuery|query)\s*\(\s*`[^`]*\$\{/gi,
    title: 'SQL Injection in Raw Query',
    severity: 'CRITICAL',
    category: 'INJECTION',
    description: 'Raw SQL query with template literal interpolation. Even in ORMs, raw queries can be vulnerable.',
    impact: 'SQL injection leading to data breach or manipulation.',
    remediation: 'Use parameterized raw queries: prisma.$queryRaw`SELECT * FROM users WHERE id = ${Prisma.raw(userId)}`',
    confidence: 0.85,
    ruleId: 'advanced-sql-002',
  },

  // ==================== NoSQL Injection ====================
  {
    pattern: /\.find\s*\(\s*\{[^}]*(?:req\.|request\.|params\.|query\.|body\.)\w+/gi,
    title: 'NoSQL Injection Risk',
    severity: 'HIGH',
    category: 'INJECTION',
    description: 'MongoDB/NoSQL query using user input directly. Attackers can inject operators like $gt, $ne to bypass authentication.',
    impact: 'Authentication bypass, data extraction, or denial of service.',
    remediation: 'Sanitize input: reject objects with $ keys. Use mongoose schema validation. Cast to expected types.',
    confidence: 0.75,
    ruleId: 'advanced-nosql-001',
  },

  // ==================== File Upload Vulnerabilities ====================
  {
    pattern: /(?:originalname|filename|name)\s*(?:\.|['"])\s*(?:split|slice|substring|match)/gi,
    title: 'Insecure File Name Handling',
    severity: 'MEDIUM',
    category: 'INJECTION',
    description: 'File name from upload being manipulated. Original filenames can contain path traversal sequences.',
    impact: 'Path traversal to overwrite system files or execute uploaded files.',
    remediation: 'Generate random filenames. If preserving names, sanitize thoroughly: remove paths, limit to alphanumeric + extension.',
    confidence: 0.65,
    ruleId: 'advanced-upload-001',
  },
  {
    pattern: /(?:mimetype|contentType|type)\s*(?:===?|\.includes)\s*(?:req\.|file\.)/gi,
    title: 'Client-Controlled MIME Type Check',
    severity: 'MEDIUM',
    category: 'INJECTION',
    description: 'Checking MIME type from client-provided value. MIME types can be spoofed.',
    impact: 'Uploading malicious files (PHP, HTML, SVG with JS) disguised as images.',
    remediation: 'Validate file content using magic bytes, not MIME type. Use libraries like file-type to detect actual file type.',
    confidence: 0.7,
    ruleId: 'advanced-upload-002',
  },
];

/**
 * Run advanced security analysis on a repository
 */
export async function runAdvancedSecurityScan(repoPath: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    const files = await collectSourceFiles(repoPath);
    console.log(`[Advanced Security] Scanning ${files.length} files for high-level vulnerabilities...`);

    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(repoPath, filePath);

        const fileFindings = analyzeFile(content, relativePath);
        findings.push(...fileFindings);
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    console.log(`[Advanced Security] Found ${findings.length} advanced security issues`);
    return deduplicateFindings(findings);
  } catch (error) {
    console.error('[Advanced Security] Scan failed:', error);
    return [];
  }
}

/**
 * Collect all source files from repository
 */
async function collectSourceFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        await collectSourceFiles(fullPath, files);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SCAN_EXTENSIONS.has(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Analyze a single file for security issues
 */
function analyzeFile(content: string, filePath: string): RawFinding[] {
  const findings: RawFinding[] = [];
  const lines = content.split('\n');

  for (const pattern of SECURITY_PATTERNS) {
    // Reset regex state for global patterns
    pattern.pattern.lastIndex = 0;

    let match;
    while ((match = pattern.pattern.exec(content)) !== null) {
      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;

      // Get code snippet (context around the match)
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
        rawFinding: {
          matchedText: match[0],
          pattern: pattern.pattern.source,
        },
      });

      // Prevent infinite loops for non-global regexes
      if (!pattern.pattern.global) break;
    }
  }

  return findings;
}

/**
 * Remove duplicate findings (same rule, same file, same line)
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
