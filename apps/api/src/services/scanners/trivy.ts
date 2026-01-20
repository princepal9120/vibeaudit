import { exec } from 'child_process';
import { promisify } from 'util';
import type { RawFinding, Severity } from './types.js';
import { SCANNER_TIMEOUTS } from './types.js';

const execAsync = promisify(exec);

interface TrivyResult {
  Results?: Array<{
    Target: string;
    Class: string;
    Type: string;
    Secrets?: Array<{
      RuleID: string;
      Category: string;
      Severity: string;
      Title: string;
      StartLine: number;
      EndLine: number;
      Code: {
        Lines: Array<{
          Number: number;
          Content: string;
          Highlighted: string;
        }>;
      };
      Match: string;
    }>;
    Vulnerabilities?: Array<{
      VulnerabilityID: string;
      PkgName: string;
      InstalledVersion: string;
      FixedVersion: string;
      Severity: string;
      Title: string;
      Description: string;
      References: string[];
      CVSS?: Record<string, { V3Score: number }>;
    }>;
    Misconfigurations?: Array<{
      Type: string;
      ID: string;
      Title: string;
      Description: string;
      Message: string;
      Severity: string;
      Resolution: string;
      References: string[];
    }>;
  }>;
}

export async function runTrivy(repoPath: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    // Run Trivy for secrets detection
    const { stdout: secretsOutput } = await execAsync(
      `trivy fs --scanners secret --format json --timeout ${Math.floor(SCANNER_TIMEOUTS.TRIVY / 1000)}s "${repoPath}"`,
      {
        timeout: SCANNER_TIMEOUTS.TRIVY + 5000,
        maxBuffer: 50 * 1024 * 1024,
      }
    );

    if (secretsOutput.trim()) {
      const secretsResult: TrivyResult = JSON.parse(secretsOutput);
      findings.push(...parseSecretsResult(secretsResult));
    }
  } catch (error) {
    console.error('Trivy secrets scan failed:', error);
  }

  try {
    // Run Trivy for vulnerability detection
    const { stdout: vulnOutput } = await execAsync(
      `trivy fs --scanners vuln --format json --timeout ${Math.floor(SCANNER_TIMEOUTS.TRIVY / 1000)}s "${repoPath}"`,
      {
        timeout: SCANNER_TIMEOUTS.TRIVY + 5000,
        maxBuffer: 50 * 1024 * 1024,
      }
    );

    if (vulnOutput.trim()) {
      const vulnResult: TrivyResult = JSON.parse(vulnOutput);
      findings.push(...parseVulnResult(vulnResult));
    }
  } catch (error) {
    console.error('Trivy vuln scan failed:', error);
  }

  try {
    // Run Trivy for misconfigurations
    const { stdout: misconfigOutput } = await execAsync(
      `trivy fs --scanners misconfig --format json --timeout ${Math.floor(SCANNER_TIMEOUTS.TRIVY / 1000)}s "${repoPath}"`,
      {
        timeout: SCANNER_TIMEOUTS.TRIVY + 5000,
        maxBuffer: 50 * 1024 * 1024,
      }
    );

    if (misconfigOutput.trim()) {
      const misconfigResult: TrivyResult = JSON.parse(misconfigOutput);
      findings.push(...parseMisconfigResult(misconfigResult));
    }
  } catch (error) {
    console.error('Trivy misconfig scan failed:', error);
  }

  return findings;
}

function parseSecretsResult(result: TrivyResult): RawFinding[] {
  const findings: RawFinding[] = [];

  for (const target of result.Results || []) {
    for (const secret of target.Secrets || []) {
      // Skip low-confidence or test file secrets
      if (isTestOrExampleSecret(target.Target, secret.Match)) {
        continue;
      }

      findings.push({
        title: formatSecretTitle(secret.Category, secret.RuleID),
        severity: mapSeverity(secret.Severity),
        category: 'SECRETS',
        source: 'TRIVY',
        description: secret.Title || `Potential ${secret.Category} detected in code`,
        impact: `Exposed secrets can be used by attackers to gain unauthorized access to your systems and data.`,
        remediation: generateSecretsRemediation(secret.Category),
        filePath: target.Target,
        lineNumber: secret.StartLine,
        codeSnippet: secret.Code?.Lines?.map(l => l.Content).join('\n'),
        confidence: 0.85,
        ruleId: secret.RuleID,
        rawFinding: { target: target.Target, secret },
      });
    }
  }

  return findings;
}

function parseVulnResult(result: TrivyResult): RawFinding[] {
  const findings: RawFinding[] = [];

  for (const target of result.Results || []) {
    for (const vuln of target.Vulnerabilities || []) {
      findings.push({
        title: `${vuln.PkgName}: ${vuln.VulnerabilityID}`,
        severity: mapSeverity(vuln.Severity),
        category: 'DEPENDENCIES',
        source: 'TRIVY',
        description: vuln.Title || vuln.Description?.slice(0, 200) || `Vulnerability in ${vuln.PkgName}`,
        impact: generateVulnImpact(vuln),
        remediation: vuln.FixedVersion
          ? `Update ${vuln.PkgName} from ${vuln.InstalledVersion} to ${vuln.FixedVersion}`
          : `No fix available yet. Monitor for updates to ${vuln.PkgName}.`,
        filePath: target.Target,
        confidence: 0.95,
        ruleId: vuln.VulnerabilityID,
        rawFinding: { target: target.Target, vuln },
      });
    }
  }

  return findings;
}

function parseMisconfigResult(result: TrivyResult): RawFinding[] {
  const findings: RawFinding[] = [];

  for (const target of result.Results || []) {
    for (const misconfig of target.Misconfigurations || []) {
      findings.push({
        title: misconfig.Title || misconfig.ID,
        severity: mapSeverity(misconfig.Severity),
        category: 'CONFIGURATION',
        source: 'TRIVY',
        description: misconfig.Description || misconfig.Message,
        impact: `Misconfiguration in ${target.Target} could lead to security vulnerabilities.`,
        remediation: misconfig.Resolution || 'Review and fix the configuration according to security best practices.',
        filePath: target.Target,
        confidence: 0.8,
        ruleId: misconfig.ID,
        rawFinding: { target: target.Target, misconfig },
      });
    }
  }

  return findings;
}

function mapSeverity(severity: string): Severity {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'CRITICAL';
    case 'HIGH':
      return 'HIGH';
    case 'MEDIUM':
      return 'MEDIUM';
    case 'LOW':
    case 'UNKNOWN':
    default:
      return 'LOW';
  }
}

function formatSecretTitle(category: string, ruleId: string): string {
  const categoryMap: Record<string, string> = {
    'AWS': 'AWS Credentials',
    'GitHub': 'GitHub Token',
    'Stripe': 'Stripe API Key',
    'Generic': 'Hardcoded Secret',
    'PrivateKey': 'Private Key',
    'JWT': 'JWT Secret',
  };

  return categoryMap[category] || `Exposed ${category || 'Secret'}`;
}

function isTestOrExampleSecret(filePath: string, match: string): boolean {
  // Check file path for test/example indicators
  const testPatterns = [
    /test/i,
    /spec/i,
    /mock/i,
    /fixture/i,
    /example/i,
    /sample/i,
    /demo/i,
    /\.md$/,
    /docs?\//i,
  ];

  if (testPatterns.some(p => p.test(filePath))) {
    return true;
  }

  // Check for obviously fake/placeholder secrets
  const placeholderPatterns = [
    /^(test|fake|dummy|example|sample|your[-_]?)/i,
    /xxx+/i,
    /^0{8,}/,
    /^1{8,}/,
    /placeholder/i,
    /change[-_]?me/i,
    /insert[-_]?here/i,
  ];

  return placeholderPatterns.some(p => p.test(match));
}

function generateSecretsRemediation(category: string): string {
  const remediations: Record<string, string> = {
    'AWS': 'Rotate the AWS credentials immediately. Use IAM roles or environment variables instead of hardcoding.',
    'GitHub': 'Revoke and regenerate the GitHub token. Use GitHub secrets or environment variables.',
    'Stripe': 'Rotate the Stripe API key immediately. Use environment variables for API keys.',
    'Generic': 'Remove the hardcoded secret and use environment variables or a secrets manager.',
    'PrivateKey': 'Remove the private key from the repository. Generate a new key pair and store securely.',
    'JWT': 'Rotate the JWT secret immediately. Use a strong, randomly generated secret stored in environment variables.',
  };

  return remediations[category] || 'Remove the secret from code and store it securely using environment variables or a secrets manager.';
}

function generateVulnImpact(vuln: { CVSS?: Record<string, { V3Score: number }>; References?: string[] }): string {
  const parts: string[] = [];

  // Get highest CVSS score
  if (vuln.CVSS) {
    const scores = Object.values(vuln.CVSS).map(c => c.V3Score).filter(Boolean);
    if (scores.length > 0) {
      const maxScore = Math.max(...scores);
      parts.push(`CVSS Score: ${maxScore}/10.`);
    }
  }

  parts.push('This vulnerability could be exploited to compromise your application.');

  if (vuln.References?.length) {
    parts.push(`Reference: ${vuln.References[0]}`);
  }

  return parts.join(' ');
}
