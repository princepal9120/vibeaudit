import { safeSpawn } from '../../lib/safe-exec.js';
import type { RawFinding, Severity } from './types.js';
import { SCANNER_TIMEOUTS } from './types.js';

interface GitleaksResult {
  Description: string;
  StartLine: number;
  EndLine: number;
  StartColumn: number;
  EndColumn: number;
  Match: string;
  Secret: string;
  File: string;
  SymlinkFile: string;
  Commit: string;
  Entropy: number;
  Author: string;
  Email: string;
  Date: string;
  Message: string;
  Tags: string[];
  RuleID: string;
  Fingerprint: string;
}

export async function runGitleaks(repoPath: string): Promise<RawFinding[]> {
  try {
    // Run gitleaks detect
    // Using safeSpawn with args array to prevent command injection
    const { stdout, exitCode } = await safeSpawn(
      'gitleaks',
      ['detect', '--source', repoPath, '--report-format', 'json', '--no-git', '--exit-code', '0'],
      {
        timeout: SCANNER_TIMEOUTS.GITLEAKS,
        maxBuffer: 20 * 1024 * 1024,
      }
    );

    if (!stdout.trim() || stdout.trim() === '[]' || stdout.trim() === 'null') {
      return [];
    }

    const results: GitleaksResult[] = JSON.parse(stdout);
    return results
      .filter(r => !isTestOrPlaceholderSecret(r))
      .map(r => parseGitleaksResult(r));
  } catch (error) {
    // Gitleaks might return exit code 1 when secrets are found
    if (error instanceof Error && 'stdout' in error) {
      try {
        const stdout = (error as { stdout: string }).stdout;
        if (stdout.trim() && stdout.trim() !== '[]') {
          const results: GitleaksResult[] = JSON.parse(stdout);
          return results
            .filter(r => !isTestOrPlaceholderSecret(r))
            .map(r => parseGitleaksResult(r));
        }
      } catch {
        // JSON parse failed
      }
    }
    console.error('Gitleaks scan failed:', error);
    return [];
  }
}

function parseGitleaksResult(result: GitleaksResult): RawFinding {
  return {
    title: formatTitle(result.RuleID, result.Description),
    severity: determineSeverity(result),
    category: 'SECRETS',
    source: 'GITLEAKS',
    description: result.Description || `Potential secret detected: ${result.RuleID}`,
    impact: generateImpact(result),
    remediation: generateRemediation(result),
    filePath: result.File,
    lineNumber: result.StartLine,
    codeSnippet: maskSecret(result.Match, result.Secret),
    confidence: calculateConfidence(result),
    ruleId: result.RuleID,
    rawFinding: {
      ...result,
      Secret: '[REDACTED]', // Don't store actual secrets
      Match: maskSecret(result.Match, result.Secret),
    },
  };
}

function formatTitle(ruleId: string, description: string): string {
  // Map common rule IDs to user-friendly titles
  const titleMap: Record<string, string> = {
    'aws-access-key-id': 'AWS Access Key',
    'aws-secret-access-key': 'AWS Secret Access Key',
    'github-pat': 'GitHub Personal Access Token',
    'github-oauth': 'GitHub OAuth Token',
    'github-app-token': 'GitHub App Token',
    'github-refresh-token': 'GitHub Refresh Token',
    'github-fine-grained-pat': 'GitHub Fine-Grained PAT',
    'generic-api-key': 'API Key',
    'private-key': 'Private Key',
    'jwt': 'JWT Token',
    'jwt-base64': 'Base64 JWT Token',
    'stripe-access-token': 'Stripe Access Token',
    'stripe-api-key': 'Stripe API Key',
    'slack-webhook': 'Slack Webhook URL',
    'slack-token': 'Slack Token',
    'discord-webhook': 'Discord Webhook URL',
    'discord-token': 'Discord Token',
    'npm-access-token': 'NPM Access Token',
    'pypi-upload-token': 'PyPI Upload Token',
    'sendgrid-api-key': 'SendGrid API Key',
    'twilio-api-key': 'Twilio API Key',
    'mailchimp-api-key': 'Mailchimp API Key',
    'firebase-key': 'Firebase Key',
    'google-api-key': 'Google API Key',
    'gcp-service-account': 'GCP Service Account Key',
    'azure-storage-key': 'Azure Storage Key',
    'heroku-api-key': 'Heroku API Key',
    'digitalocean-pat': 'DigitalOcean PAT',
    'databricks-api-token': 'Databricks API Token',
  };

  return titleMap[ruleId] || description || `Exposed ${ruleId.replace(/-/g, ' ')}`;
}

function determineSeverity(result: GitleaksResult): Severity {
  const ruleId = result.RuleID.toLowerCase();

  // Critical: Cloud provider credentials, private keys
  if (
    ruleId.includes('aws') ||
    ruleId.includes('gcp') ||
    ruleId.includes('azure') ||
    ruleId.includes('private-key') ||
    ruleId.includes('service-account')
  ) {
    return 'CRITICAL';
  }

  // High: API keys for services with financial/access implications
  if (
    ruleId.includes('stripe') ||
    ruleId.includes('github') ||
    ruleId.includes('npm') ||
    ruleId.includes('pypi') ||
    ruleId.includes('jwt') ||
    ruleId.includes('oauth')
  ) {
    return 'HIGH';
  }

  // Medium: Communication/notification service keys
  if (
    ruleId.includes('slack') ||
    ruleId.includes('discord') ||
    ruleId.includes('sendgrid') ||
    ruleId.includes('twilio') ||
    ruleId.includes('mailchimp')
  ) {
    return 'MEDIUM';
  }

  // Default to HIGH for unknown secrets (better safe than sorry)
  return 'HIGH';
}

function generateImpact(result: GitleaksResult): string {
  const ruleId = result.RuleID.toLowerCase();
  const impactMap: Record<string, string> = {
    'aws': 'Attackers could access your AWS infrastructure, spin up resources, or access sensitive data.',
    'gcp': 'Attackers could access your Google Cloud resources and potentially incur charges.',
    'azure': 'Attackers could access your Azure resources and potentially sensitive data.',
    'github': 'Attackers could access your repositories, modify code, or access private data.',
    'stripe': 'Attackers could make fraudulent charges or access payment information.',
    'private-key': 'Attackers could impersonate your server or decrypt sensitive communications.',
    'jwt': 'Attackers could forge authentication tokens and impersonate users.',
    'slack': 'Attackers could send messages to your Slack channels or access workspace data.',
    'npm': 'Attackers could publish malicious packages under your account.',
  };

  for (const [key, impact] of Object.entries(impactMap)) {
    if (ruleId.includes(key)) {
      return impact;
    }
  }

  return 'Exposed credentials could allow unauthorized access to your systems and data.';
}

function generateRemediation(result: GitleaksResult): string {
  const ruleId = result.RuleID.toLowerCase();

  // Step 1: Always rotate
  let remediation = '1. Rotate/revoke this credential immediately.\n';

  // Step 2: Service-specific instructions
  if (ruleId.includes('aws')) {
    remediation += '2. Use IAM roles or AWS Secrets Manager instead of hardcoded credentials.\n';
  } else if (ruleId.includes('github')) {
    remediation += '2. Go to GitHub Settings → Developer settings → Tokens to revoke and regenerate.\n';
  } else if (ruleId.includes('stripe')) {
    remediation += '2. Go to Stripe Dashboard → Developers → API keys to roll the key.\n';
  } else if (ruleId.includes('private-key')) {
    remediation += '2. Generate a new key pair and update all systems using this key.\n';
  } else {
    remediation += '2. Generate a new credential from the service dashboard.\n';
  }

  // Step 3: Store securely
  remediation += '3. Store secrets in environment variables or a secrets manager (not in code).\n';

  // Step 4: Prevent in future
  remediation += '4. Add pre-commit hooks to prevent future secret commits.';

  return remediation;
}

function isTestOrPlaceholderSecret(result: GitleaksResult): boolean {
  const file = result.File.toLowerCase();
  const secret = result.Secret.toLowerCase();
  const match = result.Match.toLowerCase();

  // Check file path for test/example indicators
  const testPaths = [
    'test', 'spec', 'mock', 'fixture', 'example', 'sample',
    'demo', 'docs', '.md', 'readme', 'template',
  ];

  if (testPaths.some(p => file.includes(p))) {
    return true;
  }

  // Check for placeholder values
  const placeholders = [
    'test', 'fake', 'dummy', 'example', 'sample', 'xxx',
    'placeholder', 'changeme', 'insert', 'your_', 'your-',
    '<', '>', 'todo', 'fixme', 'replace', 'secret_here',
    '000000', '111111', 'abcdef', 'aaaaaa',
  ];

  if (placeholders.some(p => secret.includes(p) || match.includes(p))) {
    return true;
  }

  // Check entropy - very low entropy likely means placeholder
  if (result.Entropy < 2.0) {
    return true;
  }

  return false;
}

function calculateConfidence(result: GitleaksResult): number {
  let confidence = 0.8; // Base confidence

  // Higher entropy = more likely to be real secret
  if (result.Entropy > 4.0) {
    confidence += 0.1;
  } else if (result.Entropy < 3.0) {
    confidence -= 0.1;
  }

  // Known high-confidence patterns
  const highConfidenceRules = [
    'aws-access-key-id', 'aws-secret-access-key',
    'github-pat', 'private-key', 'stripe',
  ];

  if (highConfidenceRules.some(r => result.RuleID.includes(r))) {
    confidence += 0.1;
  }

  return Math.min(Math.max(confidence, 0.5), 0.99);
}

function maskSecret(match: string, secret: string): string {
  if (!secret || secret.length < 8) {
    return match;
  }

  // Show first 4 and last 4 characters, mask the rest
  const masked = secret.slice(0, 4) + '****' + secret.slice(-4);
  return match.replace(secret, masked);
}
