import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';
import type { RawFinding, Severity } from './types.js';
import { SCANNER_TIMEOUTS } from './types.js';

const execAsync = promisify(exec);

interface NpmAuditResult {
  vulnerabilities: Record<string, {
    name: string;
    severity: string;
    isDirect: boolean;
    via: Array<string | {
      source: number;
      name: string;
      dependency: string;
      title: string;
      url: string;
      severity: string;
      cwe: string[];
      cvss: { score: number };
      range: string;
    }>;
    effects: string[];
    range: string;
    nodes: string[];
    fixAvailable: boolean | {
      name: string;
      version: string;
      isSemVerMajor: boolean;
    };
  }>;
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
  };
}

export async function runNpmAudit(repoPath: string): Promise<RawFinding[]> {
  // Check if package.json exists
  const packageJsonPath = join(repoPath, 'package.json');
  if (!existsSync(packageJsonPath)) {
    return [];
  }

  try {
    // npm audit returns exit code 1 if vulnerabilities found, so we handle that
    const { stdout } = await execAsync(
      `cd "${repoPath}" && npm audit --json 2>/dev/null || true`,
      {
        timeout: SCANNER_TIMEOUTS.NPM_AUDIT,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    );

    if (!stdout.trim()) {
      return [];
    }

    const result: NpmAuditResult = JSON.parse(stdout);
    return parseNpmAuditResult(result);
  } catch (error) {
    console.error('npm audit scan failed:', error);
    return [];
  }
}

function parseNpmAuditResult(result: NpmAuditResult): RawFinding[] {
  const findings: RawFinding[] = [];

  for (const [packageName, vuln] of Object.entries(result.vulnerabilities || {})) {
    // Get detailed vulnerability info from 'via' field
    const viaDetails = vuln.via.filter(v => typeof v !== 'string') as Array<{
      source: number;
      name: string;
      dependency: string;
      title: string;
      url: string;
      severity: string;
      cwe: string[];
      cvss: { score: number };
      range: string;
    }>;

    if (viaDetails.length > 0) {
      // Use the first detailed vulnerability info
      const detail = viaDetails[0];
      findings.push({
        title: `Vulnerable Dependency: ${packageName}`,
        severity: mapSeverity(detail.severity || vuln.severity),
        category: 'DEPENDENCIES',
        source: 'NPM_AUDIT',
        description: detail.title || `Vulnerability in ${packageName}`,
        impact: generateImpact(detail, vuln),
        remediation: generateRemediation(vuln, detail),
        confidence: 0.95, // npm audit is highly reliable
        ruleId: detail.source ? `GHSA-${detail.source}` : undefined,
        rawFinding: { packageName, vuln, detail },
      });
    } else {
      // Fallback for vulnerabilities without detailed info
      findings.push({
        title: `Vulnerable Dependency: ${packageName}`,
        severity: mapSeverity(vuln.severity),
        category: 'DEPENDENCIES',
        source: 'NPM_AUDIT',
        description: `Security vulnerability found in ${packageName}`,
        impact: `This dependency has known security vulnerabilities that could be exploited.`,
        remediation: generateRemediation(vuln),
        confidence: 0.9,
        rawFinding: { packageName, vuln },
      });
    }
  }

  return findings;
}

function mapSeverity(severity: string): Severity {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'CRITICAL';
    case 'high':
      return 'HIGH';
    case 'moderate':
    case 'medium':
      return 'MEDIUM';
    case 'low':
    case 'info':
    default:
      return 'LOW';
  }
}

function generateImpact(
  detail: { cwe?: string[]; cvss?: { score: number }; url?: string },
  vuln: { effects?: string[] }
): string {
  const parts: string[] = [];

  if (detail.cvss?.score) {
    parts.push(`CVSS Score: ${detail.cvss.score}/10.`);
  }

  if (detail.cwe?.length) {
    parts.push(`CWE: ${detail.cwe.join(', ')}.`);
  }

  if (vuln.effects?.length) {
    parts.push(`Affects: ${vuln.effects.slice(0, 3).join(', ')}.`);
  }

  if (parts.length === 0) {
    parts.push('This vulnerability could allow attackers to compromise your application.');
  }

  if (detail.url) {
    parts.push(`More info: ${detail.url}`);
  }

  return parts.join(' ');
}

function generateRemediation(
  vuln: { fixAvailable?: boolean | { name: string; version: string; isSemVerMajor: boolean }; range?: string },
  detail?: { range?: string }
): string {
  if (vuln.fixAvailable === true) {
    return 'Run `npm audit fix` to automatically update to a patched version.';
  }

  if (typeof vuln.fixAvailable === 'object' && vuln.fixAvailable) {
    const fix = vuln.fixAvailable;
    if (fix.isSemVerMajor) {
      return `Update to ${fix.name}@${fix.version} (major version change). Run \`npm audit fix --force\` or manually update. Review for breaking changes.`;
    }
    return `Update to ${fix.name}@${fix.version} by running \`npm audit fix\`.`;
  }

  if (detail?.range || vuln.range) {
    return `Affected versions: ${detail?.range || vuln.range}. Check for updates or consider alternative packages.`;
  }

  return 'Check for package updates or consider using an alternative package without known vulnerabilities.';
}
