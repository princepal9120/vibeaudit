import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// Security frameworks to check against
export const SECURITY_FRAMEWORKS = {
  OWASP_TOP_10: {
    id: 'owasp-top-10',
    name: 'OWASP Top 10',
    description: 'Web application security risks',
    items: [
      'A01 - Broken Access Control',
      'A02 - Cryptographic Failures',
      'A03 - Injection',
      'A04 - Insecure Design',
      'A05 - Security Misconfiguration',
      'A06 - Vulnerable Components',
      'A07 - Authentication Failures',
      'A08 - Software/Data Integrity Failures',
      'A09 - Security Logging Failures',
      'A10 - Server-Side Request Forgery',
    ],
  },
  NIST_CSF: {
    id: 'nist-csf',
    name: 'NIST Cybersecurity Framework',
    description: 'Core security functions',
    items: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
  },
  SOC2: {
    id: 'soc2',
    name: 'SOC 2 Trust Principles',
    description: 'Security compliance criteria',
    items: [
      'Security',
      'Availability',
      'Confidentiality',
      'Processing Integrity',
      'Privacy',
    ],
  },
  API_SECURITY: {
    id: 'api-security',
    name: 'API Security',
    description: 'API-specific security controls',
    items: [
      'Rate Limiting',
      'Authentication (OAuth/JWT)',
      'CORS Configuration',
      'API Versioning',
      'Input Validation',
    ],
  },
  SECRETS_MANAGEMENT: {
    id: 'secrets',
    name: 'Secrets Management',
    description: 'Credential and secret handling',
    items: [
      'Environment Variables',
      'Secret Rotation',
      'Vault Integration',
      'No Hardcoded Secrets',
    ],
  },
  COMPLIANCE: {
    id: 'compliance',
    name: 'Compliance Requirements',
    description: 'Regulatory compliance',
    items: ['GDPR', 'CCPA', 'HIPAA', 'PCI-DSS'],
  },
} as const;

export interface PrdFinding {
  id: string;
  framework: string;
  frameworkItem: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  recommendation: string;
  section?: string;
}

export interface FrameworkCoverage {
  framework: string;
  frameworkName: string;
  coveredItems: string[];
  missingItems: string[];
  coveragePercent: number;
}

export interface PrdAnalysisResult {
  securedContent: string;
  securityScore: number;
  findings: PrdFinding[];
  frameworkCoverage: FrameworkCoverage[];
  processingTimeMs: number;
}

/**
 * Analyze a PRD for security gaps and generate a secured version
 */
export async function analyzePrd(
  content: string,
  title: string
): Promise<PrdAnalysisResult> {
  const startTime = Date.now();

  if (!config.openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Step 1: Analyze the PRD for security gaps
  const analysisResult = await analyzeSecurityGaps(content);

  // Step 2: Generate secured PRD content
  const securedContent = await generateSecuredPrd(content, analysisResult.findings);

  // Step 3: Calculate security score and framework coverage
  const frameworkCoverage = calculateFrameworkCoverage(analysisResult.findings, content);
  const securityScore = calculateSecurityScore(analysisResult.findings, frameworkCoverage);

  return {
    securedContent,
    securityScore,
    findings: analysisResult.findings,
    frameworkCoverage,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Analyze PRD content for security gaps against all frameworks
 */
async function analyzeSecurityGaps(content: string): Promise<{ findings: PrdFinding[] }> {
  const frameworkList = Object.values(SECURITY_FRAMEWORKS)
    .map(f => `${f.name}: ${f.items.join(', ')}`)
    .join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a security architect reviewing a Product Requirements Document (PRD) for security gaps.

Analyze the PRD against these security frameworks:
${frameworkList}

For each security gap or missing requirement, provide:
1. Which framework and item it relates to
2. Severity (CRITICAL, HIGH, MEDIUM, LOW)
3. Clear title
4. Description of the gap
5. Specific recommendation to address it
6. Which section of the PRD it applies to (if identifiable)

Focus on:
- Missing authentication/authorization requirements
- Missing data protection measures
- Missing security headers and configurations
- Missing input validation
- Missing logging and monitoring
- Missing compliance requirements
- Missing secrets management
- Missing rate limiting and abuse prevention

Be thorough but avoid false positives. Only flag genuine security gaps.`,
      },
      {
        role: 'user',
        content: `Analyze this PRD for security gaps and missing security requirements:

${content.slice(0, 15000)}

Return JSON with this structure:
{
  "findings": [
    {
      "id": "unique-id",
      "framework": "framework-id",
      "frameworkItem": "specific item from framework",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "title": "Brief title",
      "description": "What's missing or insecure",
      "recommendation": "How to fix it",
      "section": "PRD section if identifiable"
    }
  ]
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 4000,
  });

  const responseContent = response.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error('Empty response from OpenAI');
  }

  const parsed = JSON.parse(responseContent) as { findings: PrdFinding[] };

  // Ensure each finding has an ID
  parsed.findings = parsed.findings.map((f, i) => ({
    ...f,
    id: f.id || `finding-${i + 1}`,
  }));

  return parsed;
}

/**
 * Generate a secured version of the PRD with security requirements added
 */
async function generateSecuredPrd(
  originalContent: string,
  findings: PrdFinding[]
): Promise<string> {
  // Group findings by section/category for better organization
  const groupedFindings = findings.reduce(
    (acc, f) => {
      const key = f.framework;
      if (!acc[key]) acc[key] = [];
      acc[key].push(f);
      return acc;
    },
    {} as Record<string, PrdFinding[]>
  );

  const findingsSummary = Object.entries(groupedFindings)
    .map(([framework, items]) => {
      const frameworkName =
        Object.values(SECURITY_FRAMEWORKS).find(f => f.id === framework)?.name || framework;
      return `${frameworkName}:\n${items.map(f => `  - ${f.title}: ${f.recommendation}`).join('\n')}`;
    })
    .join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a security architect enhancing a Product Requirements Document (PRD) with security requirements.

Your task is to:
1. Keep all original content intact
2. Add a new "Security Requirements" section with comprehensive security requirements
3. Add security notes inline where relevant (marked with 🔐)
4. Ensure all security gaps are addressed

Format the output as valid Markdown. Be comprehensive but concise.`,
      },
      {
        role: 'user',
        content: `Enhance this PRD with security requirements based on these findings:

FINDINGS:
${findingsSummary}

ORIGINAL PRD:
${originalContent.slice(0, 12000)}

Create an enhanced version with:
1. All original content preserved
2. A new "## Security Requirements" section
3. Inline security notes where appropriate
4. Coverage for: Authentication, Authorization, Data Protection, API Security, Logging, Compliance`,
      },
    ],
    temperature: 0.5,
    max_tokens: 8000,
  });

  return response.choices[0]?.message?.content || originalContent;
}

/**
 * Calculate framework coverage based on findings and original content
 */
function calculateFrameworkCoverage(
  findings: PrdFinding[],
  originalContent: string
): FrameworkCoverage[] {
  const coverage: FrameworkCoverage[] = [];

  for (const [key, framework] of Object.entries(SECURITY_FRAMEWORKS)) {
    const frameworkFindings = findings.filter(f => f.framework === framework.id);

    // Items that have findings (missing/incomplete)
    const missingItems = [...new Set(frameworkFindings.map(f => f.frameworkItem))];

    // Items that are covered (no findings)
    const coveredItems = framework.items.filter(item => !missingItems.includes(item));

    const coveragePercent = Math.round((coveredItems.length / framework.items.length) * 100);

    coverage.push({
      framework: framework.id,
      frameworkName: framework.name,
      coveredItems,
      missingItems,
      coveragePercent,
    });
  }

  return coverage;
}

/**
 * Calculate overall security score (0-100)
 */
function calculateSecurityScore(
  findings: PrdFinding[],
  frameworkCoverage: FrameworkCoverage[]
): number {
  // Base score starts at 100
  let score = 100;

  // Deduct points based on finding severity
  const severityDeductions = {
    CRITICAL: 15,
    HIGH: 10,
    MEDIUM: 5,
    LOW: 2,
  };

  for (const finding of findings) {
    score -= severityDeductions[finding.severity] || 0;
  }

  // Factor in framework coverage (average coverage weighted)
  const avgCoverage =
    frameworkCoverage.reduce((sum, fc) => sum + fc.coveragePercent, 0) /
    frameworkCoverage.length;

  // Blend findings-based score with coverage-based score
  score = Math.round(score * 0.6 + avgCoverage * 0.4);

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get all available security frameworks
 */
export function getSecurityFrameworks(): typeof SECURITY_FRAMEWORKS {
  return SECURITY_FRAMEWORKS;
}
