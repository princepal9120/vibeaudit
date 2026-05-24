import { safeSpawn } from '../../lib/safe-exec.js';
import type { RawFinding, Severity, FindingCategory } from './types.js';
import { SCANNER_TIMEOUTS } from './types.js';

interface SemgrepResult {
  results: Array<{
    check_id: string;
    path: string;
    start: { line: number; col: number };
    end: { line: number; col: number };
    extra: {
      message: string;
      severity: string;
      metadata: {
        category?: string;
        confidence?: string;
        cwe?: string[];
        owasp?: string[];
        impact?: string;
        likelihood?: string;
        subcategory?: string[];
      };
      lines: string;
    };
  }>;
  errors: unknown[];
}

export async function runSemgrep(repoPath: string): Promise<RawFinding[]> {
  try {
    // Run Semgrep with auto config (uses OWASP Top 10, CWE Top 25 rules)
    // Using safeSpawn with args array to prevent command injection
    const { stdout, exitCode } = await safeSpawn(
      'semgrep',
      [
        'scan',
        '--config', 'auto',
        '--json',
        '--timeout', String(Math.floor(SCANNER_TIMEOUTS.SEMGREP / 1000)),
        repoPath,
      ],
      {
        timeout: SCANNER_TIMEOUTS.SEMGREP + 5000, // Extra buffer
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large outputs
      }
    );

    // Semgrep returns exit code 1 if findings exist, but still outputs valid JSON
    if (stdout.trim()) {
      try {
        const result: SemgrepResult = JSON.parse(stdout);
        return result.results.map(finding => parseSemgrepFinding(finding));
      } catch {
        // JSON parse failed
      }
    }

    return [];
  } catch (error) {
    // Handle errors that still contain stdout (e.g., non-zero exit with findings)
    if (error instanceof Error && 'stdout' in error) {
      try {
        const result: SemgrepResult = JSON.parse((error as { stdout: string }).stdout);
        return result.results.map(finding => parseSemgrepFinding(finding));
      } catch {
        // JSON parse failed
      }
    }
    console.error('Semgrep scan failed:', error);
    return [];
  }
}

function parseSemgrepFinding(finding: SemgrepResult['results'][0]): RawFinding {
  return {
    title: formatTitle(finding.check_id),
    severity: mapSeverity(finding.extra.severity),
    category: mapCategory(finding.extra.metadata.category, finding.extra.metadata.subcategory),
    source: 'SEMGREP',
    description: finding.extra.message,
    impact: generateImpact(finding),
    remediation: generateRemediation(finding),
    filePath: finding.path,
    lineNumber: finding.start.line,
    codeSnippet: finding.extra.lines,
    confidence: mapConfidence(finding.extra.metadata.confidence),
    ruleId: finding.check_id,
    rawFinding: finding,
  };
}

function formatTitle(checkId: string): string {
  // Convert rule ID to readable title
  // e.g., "python.lang.security.audit.dangerous-subprocess-use" -> "Dangerous Subprocess Use"
  const parts = checkId.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function mapSeverity(severity: string): Severity {
  switch (severity?.toUpperCase()) {
    case 'ERROR':
    case 'CRITICAL':
      return 'CRITICAL';
    case 'WARNING':
    case 'HIGH':
      return 'HIGH';
    case 'INFO':
    case 'MEDIUM':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
}

function mapCategory(category?: string, subcategory?: string[]): FindingCategory {
  const cat = (category || '').toLowerCase();
  const sub = (subcategory || []).join(' ').toLowerCase();

  if (cat.includes('injection') || sub.includes('injection')) return 'INJECTION';
  if (cat.includes('secret') || sub.includes('secret') || sub.includes('credential')) return 'SECRETS';
  if (cat.includes('auth') || sub.includes('auth')) return 'AUTH';
  if (cat.includes('xss') || sub.includes('xss')) return 'XSS';
  if (cat.includes('csrf') || sub.includes('csrf')) return 'CSRF';
  if (cat.includes('crypto') || sub.includes('crypto')) return 'CRYPTOGRAPHY';
  if (cat.includes('config') || sub.includes('config')) return 'CONFIGURATION';
  return 'OTHER';
}

function mapConfidence(confidence?: string): number {
  switch (confidence?.toUpperCase()) {
    case 'HIGH':
      return 0.9;
    case 'MEDIUM':
      return 0.7;
    case 'LOW':
      return 0.5;
    default:
      return 0.7;
  }
}

function generateImpact(finding: SemgrepResult['results'][0]): string {
  const { metadata } = finding.extra;
  const cwe = metadata.cwe?.join(', ') || '';
  const owasp = metadata.owasp?.join(', ') || '';

  let impact = '';
  if (metadata.impact) {
    impact = metadata.impact;
  } else {
    impact = `This vulnerability could allow attackers to compromise your application's security.`;
  }

  if (cwe) impact += ` Related to ${cwe}.`;
  if (owasp) impact += ` Mapped to OWASP ${owasp}.`;

  return impact;
}

function generateRemediation(finding: SemgrepResult['results'][0]): string {
  // Basic remediation based on category
  const message = finding.extra.message.toLowerCase();

  if (message.includes('sql') && message.includes('injection')) {
    return 'Use parameterized queries or prepared statements instead of string concatenation.';
  }
  if (message.includes('hardcoded') || message.includes('secret') || message.includes('password')) {
    return 'Move sensitive values to environment variables or a secure secrets manager.';
  }
  if (message.includes('eval') || message.includes('exec')) {
    return 'Avoid using eval() or exec(). Use safer alternatives for dynamic code execution.';
  }
  if (message.includes('xss') || message.includes('escape')) {
    return 'Sanitize and escape user input before rendering in HTML or JavaScript.';
  }

  return 'Review the code and apply secure coding practices to address this vulnerability.';
}
