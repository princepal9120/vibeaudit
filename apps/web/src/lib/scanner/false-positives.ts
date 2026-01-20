/**
 * Known false positive patterns for security scanning tools
 *
 * This database is curated from common false positive patterns across
 * Semgrep, OWASP ZAP, npm audit, and other security tools.
 *
 * Target: <5% false positive rate
 */

import { ScanSource, FindingCategory } from './types';

export interface FalsePositivePattern {
  /** Rule ID or pattern to match */
  ruleIdPattern: string | RegExp;
  /** Which scanner this applies to */
  source: ScanSource;
  /** Category of the finding */
  category?: FindingCategory;
  /** Optional file path pattern (if the FP only occurs in certain files) */
  filePathPattern?: string | RegExp;
  /** Reason this is a false positive */
  reason: string;
  /** How to handle: 'filter' removes entirely, 'downgrade' reduces severity to LOW */
  action: 'filter' | 'downgrade';
  /** Additional context patterns that must match for this to be considered FP */
  contextPatterns?: (string | RegExp)[];
}

/**
 * Known Semgrep false positive patterns
 *
 * These are common rules that generate many false positives in typical
 * web applications, especially for indie builders using modern frameworks.
 */
export const SEMGREP_FALSE_POSITIVES: FalsePositivePattern[] = [
  // Test file false positives - test code often contains "vulnerable" patterns intentionally
  {
    ruleIdPattern: /^javascript\..*$/,
    source: 'semgrep',
    filePathPattern: /\.(test|spec|mock)\.(js|ts|jsx|tsx)$/,
    reason: 'Security patterns in test files are intentional for testing purposes',
    action: 'downgrade',
  },
  {
    ruleIdPattern: /^typescript\..*$/,
    source: 'semgrep',
    filePathPattern: /\.(test|spec|mock)\.(js|ts|jsx|tsx)$/,
    reason: 'Security patterns in test files are intentional for testing purposes',
    action: 'downgrade',
  },

  // Framework-specific false positives
  {
    ruleIdPattern: 'javascript.express.security.audit.express-cookie-settings',
    source: 'semgrep',
    reason: 'Often flags development-only cookie settings that are properly configured in production',
    action: 'downgrade',
  },
  {
    ruleIdPattern: 'javascript.lang.security.audit.unknown-value-with-script-tag',
    source: 'semgrep',
    reason: 'Modern React/Next.js escapes values by default, making this a false positive in JSX',
    action: 'downgrade',
  },
  {
    ruleIdPattern: 'typescript.react.security.audit.react-dangerously-set-innerhtml',
    source: 'semgrep',
    filePathPattern: /\.md$|markdown/i,
    reason: 'Markdown rendering requires dangerouslySetInnerHTML with sanitized content',
    action: 'downgrade',
  },

  // Common hardcoded values that aren't secrets
  {
    ruleIdPattern: 'generic.secrets.security.detected-generic-api-key',
    source: 'semgrep',
    filePathPattern: /example|sample|demo|template|stub/i,
    reason: 'Example/demo API keys are intentionally included as placeholders',
    action: 'filter',
  },
  {
    ruleIdPattern: /secrets.*example/i,
    source: 'semgrep',
    reason: 'Example secrets in documentation or templates',
    action: 'filter',
  },

  // Environment variable patterns (not hardcoded if using env vars correctly)
  {
    ruleIdPattern: 'javascript.lang.security.detect-non-literal-require',
    source: 'semgrep',
    reason: 'Dynamic requires are common in module systems and bundlers',
    action: 'downgrade',
  },

  // SQL injection false positives in ORMs
  {
    ruleIdPattern: /sql-injection/i,
    source: 'semgrep',
    filePathPattern: /prisma|drizzle|sequelize|typeorm/i,
    reason: 'ORMs handle SQL parameterization automatically',
    action: 'downgrade',
  },

  // Crypto false positives
  {
    ruleIdPattern: 'javascript.lang.security.audit.crypto-createcipher-is-deprecated',
    source: 'semgrep',
    filePathPattern: /polyfill|shim|compat/i,
    reason: 'Compatibility code for older systems',
    action: 'downgrade',
  },

  // CORS false positives
  {
    ruleIdPattern: /cors.*wildcard/i,
    source: 'semgrep',
    filePathPattern: /development|dev\.|local/i,
    reason: 'Development CORS settings are expected to be permissive',
    action: 'downgrade',
  },
];

/**
 * Known OWASP ZAP false positive patterns
 */
export const ZAP_FALSE_POSITIVES: FalsePositivePattern[] = [
  // CSP false positives for specific frameworks
  {
    ruleIdPattern: '10038', // Content Security Policy Header Not Set
    source: 'zap',
    reason: 'CSP may be set via meta tag or handled by framework/CDN',
    action: 'downgrade',
  },

  // Cookie flags on non-sensitive cookies
  {
    ruleIdPattern: '10010', // Cookie No HttpOnly Flag
    source: 'zap',
    contextPatterns: [/analytics|tracking|_ga|_gid/i],
    reason: 'Analytics cookies intentionally omit HttpOnly to allow client-side access',
    action: 'filter',
  },
  {
    ruleIdPattern: '10011', // Cookie Without Secure Flag
    source: 'zap',
    contextPatterns: [/localhost|127\.0\.0\.1/i],
    reason: 'Local development does not require Secure flag',
    action: 'filter',
  },

  // X-Content-Type-Options on non-HTML resources
  {
    ruleIdPattern: '10021', // X-Content-Type-Options Header Missing
    source: 'zap',
    filePathPattern: /\.(json|xml|txt)$/,
    reason: 'MIME sniffing protection less critical for data endpoints',
    action: 'downgrade',
  },

  // Information disclosure that's intentional
  {
    ruleIdPattern: '10027', // Information Disclosure - Suspicious Comments
    source: 'zap',
    contextPatterns: [/TODO|FIXME|NOTE|HACK/i],
    reason: 'Development comments are not security vulnerabilities',
    action: 'filter',
  },

  // Server header disclosure (low risk)
  {
    ruleIdPattern: '10036', // Server Leaks Version Information
    source: 'zap',
    reason: 'Version disclosure is low risk if software is kept updated',
    action: 'downgrade',
  },

  // Timestamp disclosure
  {
    ruleIdPattern: '10096', // Timestamp Disclosure
    source: 'zap',
    reason: 'Timestamps in responses are standard API behavior',
    action: 'filter',
  },
];

/**
 * Known npm audit false positive patterns
 */
export const NPM_AUDIT_FALSE_POSITIVES: FalsePositivePattern[] = [
  // Development-only vulnerabilities
  {
    ruleIdPattern: /^npm-audit-dev-/,
    source: 'npm-audit',
    reason: 'Vulnerabilities in devDependencies do not affect production',
    action: 'downgrade',
  },

  // Prototype pollution in dev tools
  {
    ruleIdPattern: /prototype.*pollution/i,
    source: 'npm-audit',
    filePathPattern: /node_modules\/(jest|mocha|webpack|babel|eslint)/,
    reason: 'Prototype pollution in build tools does not affect production runtime',
    action: 'downgrade',
  },

  // ReDoS in non-user-input contexts
  {
    ruleIdPattern: /redos|regex.*denial/i,
    source: 'npm-audit',
    reason: 'ReDoS requires user-controlled input reaching the regex',
    action: 'downgrade',
  },
];

/**
 * Known Trivy/secrets scanner false positive patterns
 */
export const TRIVY_FALSE_POSITIVES: FalsePositivePattern[] = [
  // Example/placeholder secrets
  {
    ruleIdPattern: /secret.*detected/i,
    source: 'trivy',
    contextPatterns: [/example|placeholder|your[-_]?key[-_]?here|xxx|changeme|TODO/i],
    reason: 'Placeholder secrets are not real credentials',
    action: 'filter',
  },

  // Test fixtures
  {
    ruleIdPattern: /.*secret.*/i,
    source: 'trivy',
    filePathPattern: /fixture|__tests__|__mocks__|testdata/i,
    reason: 'Test fixtures may contain fake credentials for testing',
    action: 'filter',
  },

  // Base64 that isn't a secret
  {
    ruleIdPattern: 'base64-encoded-secret',
    source: 'trivy',
    contextPatterns: [/logo|image|icon|font|data:image/i],
    reason: 'Base64 encoded assets are not secrets',
    action: 'filter',
  },

  // JWT in examples
  {
    ruleIdPattern: /jwt/i,
    source: 'trivy',
    filePathPattern: /example|sample|docs|readme/i,
    reason: 'Example JWTs in documentation',
    action: 'filter',
  },
];

/**
 * Combined list of all known false positive patterns
 */
export const ALL_FALSE_POSITIVE_PATTERNS: FalsePositivePattern[] = [
  ...SEMGREP_FALSE_POSITIVES,
  ...ZAP_FALSE_POSITIVES,
  ...NPM_AUDIT_FALSE_POSITIVES,
  ...TRIVY_FALSE_POSITIVES,
];

/**
 * File path patterns that indicate test/mock/fixture files
 */
export const TEST_FILE_PATTERNS: RegExp[] = [
  /\.(test|spec)\.(js|ts|jsx|tsx|mjs|cjs)$/i,
  /__(tests|mocks|fixtures)__\//i,
  /\/(test|tests|spec|specs|__tests__|__mocks__|fixtures|testdata)\//i,
  /\.mock\.(js|ts|jsx|tsx)$/i,
  /\.stub\.(js|ts|jsx|tsx)$/i,
  /\/mocks?\//i,
  /\/stubs?\//i,
  /\/fixtures?\//i,
  /cypress\//i,
  /playwright\//i,
  /e2e\//i,
];

/**
 * File path patterns that indicate example/documentation files
 */
export const EXAMPLE_FILE_PATTERNS: RegExp[] = [
  /example/i,
  /sample/i,
  /demo/i,
  /template/i,
  /boilerplate/i,
  /\.example\./i,
  /\.sample\./i,
  /README/i,
  /CONTRIBUTING/i,
  /docs?\//i,
];

/**
 * Code patterns that indicate false positive secrets
 */
export const FALSE_SECRET_PATTERNS: RegExp[] = [
  /your[-_]?(api[-_]?)?key[-_]?here/i,
  /xxx+/i,
  /placeholder/i,
  /changeme/i,
  /replace[-_]?me/i,
  /insert[-_]?here/i,
  /example[-_]?(key|token|secret|password)/i,
  /test[-_]?(key|token|secret|password)/i,
  /fake[-_]?(key|token|secret|password)/i,
  /dummy[-_]?(key|token|secret|password)/i,
  /sk[-_]?test[-_]/i, // Stripe test keys
  /pk[-_]?test[-_]/i, // Stripe test keys
  /AKIA[A-Z0-9]{12}EXAMPLE/i, // AWS example key pattern
];

/**
 * Check if a string matches a pattern (string or RegExp)
 */
export function matchesPattern(value: string, pattern: string | RegExp): boolean {
  if (typeof pattern === 'string') {
    return value.toLowerCase().includes(pattern.toLowerCase()) || value === pattern;
  }
  return pattern.test(value);
}

/**
 * Check if a finding matches any of the false positive patterns
 */
export function findMatchingFalsePositivePattern(
  ruleId: string,
  source: ScanSource,
  filePath?: string,
  context?: string
): FalsePositivePattern | null {
  for (const pattern of ALL_FALSE_POSITIVE_PATTERNS) {
    // Must match source
    if (pattern.source !== source) continue;

    // Must match rule ID pattern
    if (!matchesPattern(ruleId, pattern.ruleIdPattern)) continue;

    // If file path pattern is specified, must match
    if (pattern.filePathPattern && filePath) {
      if (!matchesPattern(filePath, pattern.filePathPattern)) continue;
    }

    // If context patterns are specified, at least one must match
    if (pattern.contextPatterns && pattern.contextPatterns.length > 0 && context) {
      const hasContextMatch = pattern.contextPatterns.some(cp => matchesPattern(context, cp));
      if (!hasContextMatch) continue;
    }

    return pattern;
  }

  return null;
}

/**
 * Check if a file path is a test/mock/fixture file
 */
export function isTestFile(filePath: string): boolean {
  return TEST_FILE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if a file path is an example/documentation file
 */
export function isExampleFile(filePath: string): boolean {
  return EXAMPLE_FILE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if a code snippet contains patterns indicating a false secret
 */
export function containsFalseSecretPattern(codeSnippet: string): boolean {
  return FALSE_SECRET_PATTERNS.some(pattern => pattern.test(codeSnippet));
}
