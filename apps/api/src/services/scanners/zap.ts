import { safeSpawn } from '../../lib/safe-exec.js';
import type { RawFinding, Severity, FindingCategory } from './types.js';
import { SCANNER_TIMEOUTS } from './types.js';

interface ZapAlert {
  pluginid: string;
  alertRef: string;
  alert: string;
  name: string;
  riskcode: string;
  confidence: string;
  riskdesc: string;
  desc: string;
  solution: string;
  reference: string;
  cweid: string;
  wascid: string;
  instances: Array<{
    uri: string;
    method: string;
    param: string;
    attack: string;
    evidence: string;
  }>;
}

interface ZapResult {
  '@version': string;
  '@generated': string;
  site: Array<{
    '@name': string;
    alerts: ZapAlert[];
  }>;
}

export async function runZap(liveUrl: string): Promise<RawFinding[]> {
  try {
    // Validate URL
    new URL(liveUrl);

    // Run ZAP baseline scan (non-invasive)
    // This uses the ZAP Docker image or CLI
    // Using safeSpawn with args array to prevent command injection
    const { stdout } = await safeSpawn(
      'zap-baseline.py',
      ['-t', liveUrl, '-J', '/tmp/zap-report.json', '-I', '--auto'],
      {
        timeout: SCANNER_TIMEOUTS.ZAP + 10000, // Extra buffer for ZAP
        maxBuffer: 20 * 1024 * 1024,
      }
    );

    // Read the report file if ZAP succeeded
    if (stdout.trim()) {
      try {
        const { stdout: reportContent } = await safeSpawn('cat', ['/tmp/zap-report.json']);
        if (reportContent.trim()) {
          const result: ZapResult = JSON.parse(reportContent);
          return parseZapResult(result, liveUrl);
        }
      } catch {
        // Report file may not exist
      }
    }

    // Try alternative ZAP command if baseline not available
    return await runZapAlternative(liveUrl);
  } catch (error) {
    console.error('ZAP scan failed, trying alternative:', error);
    // Try alternative scan methods
    return await runZapAlternative(liveUrl);
  }
}

async function runZapAlternative(liveUrl: string): Promise<RawFinding[]> {
  // Fallback: Run basic security checks if ZAP is not available
  const findings: RawFinding[] = [];

  try {
    // Check security headers
    const headerFindings = await checkSecurityHeaders(liveUrl);
    findings.push(...headerFindings);

    // Check SSL/TLS
    const sslFindings = await checkSSL(liveUrl);
    findings.push(...sslFindings);
  } catch (error) {
    console.error('Alternative security checks failed:', error);
  }

  return findings;
}

async function checkSecurityHeaders(url: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    // Using safeSpawn with args array to prevent command injection
    const { stdout } = await safeSpawn(
      'curl',
      ['-sI', '-X', 'HEAD', '--max-time', '10', url],
      { timeout: 15000 }
    );

    const headers = parseHeaders(stdout);
    const requiredHeaders = [
      {
        name: 'Strict-Transport-Security',
        title: 'Missing HSTS Header',
        impact: 'Users can be vulnerable to protocol downgrade attacks.',
        remediation: 'Add Strict-Transport-Security header with max-age of at least 31536000.',
      },
      {
        name: 'Content-Security-Policy',
        title: 'Missing Content Security Policy',
        impact: 'XSS attacks may be easier to execute without CSP restrictions.',
        remediation: 'Implement a Content-Security-Policy header to restrict resource loading.',
      },
      {
        name: 'X-Content-Type-Options',
        title: 'Missing X-Content-Type-Options Header',
        impact: 'Browsers may MIME-sniff content, leading to security issues.',
        remediation: 'Add X-Content-Type-Options: nosniff header.',
      },
      {
        name: 'X-Frame-Options',
        title: 'Missing X-Frame-Options Header',
        impact: 'The site may be vulnerable to clickjacking attacks.',
        remediation: 'Add X-Frame-Options: DENY or X-Frame-Options: SAMEORIGIN header.',
      },
    ];

    for (const header of requiredHeaders) {
      if (!headers[header.name.toLowerCase()]) {
        findings.push({
          title: header.title,
          severity: header.name === 'Strict-Transport-Security' ? 'MEDIUM' : 'LOW',
          category: 'HEADERS',
          source: 'ZAP',
          description: `The ${header.name} header is not set on the response.`,
          impact: header.impact,
          remediation: header.remediation,
          confidence: 0.95,
          ruleId: `missing-header-${header.name.toLowerCase()}`,
          rawFinding: { url, missingHeader: header.name },
        });
      }
    }

    // Check for insecure cookies
    const setCookie = headers['set-cookie'];
    if (setCookie) {
      if (!setCookie.toLowerCase().includes('httponly')) {
        findings.push({
          title: 'Cookie Without HttpOnly Flag',
          severity: 'MEDIUM',
          category: 'CONFIGURATION',
          source: 'ZAP',
          description: 'A cookie is set without the HttpOnly flag.',
          impact: 'The cookie can be accessed via JavaScript, increasing XSS risk.',
          remediation: 'Set the HttpOnly flag on all sensitive cookies.',
          confidence: 0.9,
          ruleId: 'cookie-no-httponly',
          rawFinding: { url, cookie: setCookie },
        });
      }
      if (!setCookie.toLowerCase().includes('secure')) {
        findings.push({
          title: 'Cookie Without Secure Flag',
          severity: 'MEDIUM',
          category: 'CONFIGURATION',
          source: 'ZAP',
          description: 'A cookie is set without the Secure flag.',
          impact: 'The cookie may be transmitted over unencrypted connections.',
          remediation: 'Set the Secure flag on all cookies to ensure HTTPS-only transmission.',
          confidence: 0.9,
          ruleId: 'cookie-no-secure',
          rawFinding: { url, cookie: setCookie },
        });
      }
    }
  } catch (error) {
    console.error('Header check failed:', error);
  }

  return findings;
}

async function checkSSL(url: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    const urlObj = new URL(url);

    // Only check HTTPS URLs
    if (urlObj.protocol !== 'https:') {
      findings.push({
        title: 'Site Not Using HTTPS',
        severity: 'HIGH',
        category: 'CONFIGURATION',
        source: 'ZAP',
        description: 'The site is not using HTTPS encryption.',
        impact: 'All data transmitted to and from the site can be intercepted.',
        remediation: 'Enable HTTPS with a valid SSL/TLS certificate.',
        confidence: 1.0,
        ruleId: 'no-https',
        rawFinding: { url },
      });
      return findings;
    }

    // Validate hostname format strictly to prevent injection
    // Only allow alphanumeric, dots, and hyphens (standard DNS hostname chars)
    const hostname = urlObj.hostname;
    if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/.test(hostname) && hostname.length > 1) {
      console.warn('Invalid hostname format for SSL check:', hostname);
      return findings;
    }

    // Check SSL certificate using openssl
    // Using safeSpawn with validated hostname to prevent command injection
    const { stdout } = await safeSpawn(
      'openssl',
      ['s_client', '-servername', hostname, '-connect', `${hostname}:443`],
      { timeout: 10000 }
    );

    // Parse the certificate from stdout and check expiration
    if (stdout) {
      // Run x509 to check certificate expiration (30 days = 2592000 seconds)
      const { stdout: certOutput, exitCode } = await safeSpawn(
        'openssl',
        ['x509', '-noout', '-dates', '-checkend', '2592000'],
        { timeout: 5000 }
      );

      // Exit code 1 from checkend means certificate will expire
      if (exitCode === 1 || certOutput.includes('Certificate will expire')) {
        findings.push({
          title: 'SSL Certificate Expiring Soon',
          severity: 'MEDIUM',
          category: 'CONFIGURATION',
          source: 'ZAP',
          description: 'The SSL certificate will expire within 30 days.',
          impact: 'Users will see security warnings if the certificate expires.',
          remediation: 'Renew the SSL certificate before expiration.',
          confidence: 0.95,
          ruleId: 'ssl-expiring',
          rawFinding: { url, output: certOutput },
        });
      }
    }
  } catch (error) {
    // Certificate might be expired or invalid
    if (error instanceof Error && error.message.includes('expired')) {
      findings.push({
        title: 'SSL Certificate Expired or Invalid',
        severity: 'HIGH',
        category: 'CONFIGURATION',
        source: 'ZAP',
        description: 'The SSL certificate is expired or invalid.',
        impact: 'Users will see security warnings and connections may fail.',
        remediation: 'Replace the SSL certificate with a valid one.',
        confidence: 0.95,
        ruleId: 'ssl-invalid',
        rawFinding: { url, error: error.message },
      });
    }
  }

  return findings;
}

function parseHeaders(rawHeaders: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const lines = rawHeaders.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const name = line.slice(0, colonIndex).trim().toLowerCase();
      const value = line.slice(colonIndex + 1).trim();
      headers[name] = value;
    }
  }

  return headers;
}

function parseZapResult(result: ZapResult, url: string): RawFinding[] {
  const findings: RawFinding[] = [];

  for (const site of result.site || []) {
    for (const alert of site.alerts || []) {
      findings.push({
        title: alert.name || alert.alert,
        severity: mapRiskCode(alert.riskcode),
        category: mapCategory(alert),
        source: 'ZAP',
        description: cleanHtml(alert.desc),
        impact: `Risk: ${alert.riskdesc}. ${alert.cweid ? `CWE-${alert.cweid}` : ''}`,
        remediation: cleanHtml(alert.solution),
        confidence: mapConfidence(alert.confidence),
        ruleId: alert.pluginid,
        rawFinding: { url, alert },
      });
    }
  }

  return findings;
}

function mapRiskCode(riskcode: string): Severity {
  switch (riskcode) {
    case '3':
      return 'CRITICAL';
    case '2':
      return 'HIGH';
    case '1':
      return 'MEDIUM';
    case '0':
    default:
      return 'LOW';
  }
}

function mapConfidence(confidence: string): number {
  switch (confidence?.toLowerCase()) {
    case 'high':
      return 0.9;
    case 'medium':
      return 0.7;
    case 'low':
      return 0.5;
    default:
      return 0.6;
  }
}

function mapCategory(alert: ZapAlert): FindingCategory {
  const name = (alert.name || alert.alert || '').toLowerCase();

  if (name.includes('injection') || name.includes('sql')) return 'INJECTION';
  if (name.includes('xss') || name.includes('cross-site scripting')) return 'XSS';
  if (name.includes('csrf') || name.includes('cross-site request')) return 'CSRF';
  if (name.includes('header') || name.includes('hsts') || name.includes('csp')) return 'HEADERS';
  if (name.includes('auth') || name.includes('session')) return 'AUTH';
  if (name.includes('ssl') || name.includes('tls') || name.includes('crypto')) return 'CRYPTOGRAPHY';
  if (name.includes('config') || name.includes('cookie')) return 'CONFIGURATION';

  return 'OTHER';
}

function cleanHtml(html: string): string {
  if (!html) return '';
  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
