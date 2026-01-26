import * as fs from 'fs/promises';
import * as path from 'path';
import type { RawFinding, Severity, FindingCategory } from './types.js';

/**
 * Configuration Security Scanner
 * Scans configuration files for security misconfigurations:
 * - Docker/docker-compose files
 * - Nginx/Apache configs
 * - Environment files
 * - Kubernetes manifests
 * - CI/CD pipelines
 * - Package.json security settings
 */

interface ConfigPattern {
  filePatterns: RegExp[];
  checks: ConfigCheck[];
}

interface ConfigCheck {
  pattern: RegExp;
  negative?: boolean; // If true, trigger when pattern is NOT found
  title: string;
  severity: Severity;
  category: FindingCategory;
  description: string;
  impact: string;
  remediation: string;
  confidence: number;
  ruleId: string;
}

const CONFIG_PATTERNS: ConfigPattern[] = [
  // ==================== Dockerfile Security ====================
  {
    filePatterns: [/Dockerfile$/i, /\.dockerfile$/i, /Containerfile$/i],
    checks: [
      {
        pattern: /^FROM\s+\S+\s*$/gm,
        title: 'Docker Image Without Version Tag',
        severity: 'MEDIUM',
        category: 'CONFIGURATION',
        description: 'Docker image pulled without specific version tag. Using "latest" or no tag can lead to unpredictable builds.',
        impact: 'Build reproducibility issues, potential security vulnerabilities from unexpected image updates.',
        remediation: 'Always specify image versions: FROM node:20.10.0-alpine instead of FROM node or FROM node:latest',
        confidence: 0.8,
        ruleId: 'config-docker-001',
      },
      {
        pattern: /USER\s+root|^(?!.*USER)/gm,
        title: 'Docker Container Running as Root',
        severity: 'HIGH',
        category: 'CONFIGURATION',
        description: 'Container runs as root user. If compromised, attackers have full container access.',
        impact: 'Container escape vulnerabilities become more severe, privilege escalation risks.',
        remediation: 'Add USER directive: RUN adduser -D appuser && USER appuser',
        confidence: 0.75,
        ruleId: 'config-docker-002',
      },
      {
        pattern: /COPY\s+\.\s+|ADD\s+\.\s+/gi,
        title: 'Copying Entire Directory into Docker Image',
        severity: 'MEDIUM',
        category: 'SECRETS',
        description: 'Copying entire directory may include sensitive files like .env, .git, or credentials.',
        impact: 'Secrets, credentials, or sensitive source code may be exposed in the final image.',
        remediation: 'Use .dockerignore and copy only necessary files. Be explicit: COPY package*.json ./; COPY src/ ./src/',
        confidence: 0.7,
        ruleId: 'config-docker-003',
      },
      {
        pattern: /--privileged|--cap-add|SYS_ADMIN|NET_ADMIN|securityContext:\s*privileged:\s*true/gi,
        title: 'Privileged Container or Dangerous Capabilities',
        severity: 'CRITICAL',
        category: 'CONFIGURATION',
        description: 'Container running with privileged mode or dangerous Linux capabilities.',
        impact: 'Container can access host system, modify kernel, or escape container isolation.',
        remediation: 'Remove --privileged flag. Only add specific capabilities if absolutely necessary.',
        confidence: 0.95,
        ruleId: 'config-docker-004',
      },
      {
        pattern: /ENV\s+\w*(?:PASSWORD|SECRET|KEY|TOKEN|CREDENTIAL)\w*\s*=/gi,
        title: 'Secrets Hardcoded in Dockerfile ENV',
        severity: 'CRITICAL',
        category: 'SECRETS',
        description: 'Sensitive environment variable hardcoded in Dockerfile. This is visible in image history.',
        impact: 'Credentials exposed in image layers, accessible via docker history.',
        remediation: 'Use docker secrets, runtime environment variables, or secret management tools.',
        confidence: 0.9,
        ruleId: 'config-docker-005',
      },
      {
        pattern: /EXPOSE\s+22\b/gi,
        title: 'SSH Port Exposed in Container',
        severity: 'MEDIUM',
        category: 'CONFIGURATION',
        description: 'Container exposes SSH port 22. SSH in containers is an anti-pattern.',
        impact: 'Increased attack surface, potential for unauthorized access.',
        remediation: 'Remove SSH from containers. Use docker exec for debugging, kubernetes exec for k8s.',
        confidence: 0.85,
        ruleId: 'config-docker-006',
      },
    ],
  },

  // ==================== docker-compose Security ====================
  {
    filePatterns: [/docker-compose\.ya?ml$/i, /compose\.ya?ml$/i],
    checks: [
      {
        pattern: /privileged:\s*true/gi,
        title: 'Privileged Container in docker-compose',
        severity: 'CRITICAL',
        category: 'CONFIGURATION',
        description: 'Service running in privileged mode with full host access.',
        impact: 'Complete host system access, container escape trivial.',
        remediation: 'Remove privileged: true. Use specific capabilities if needed.',
        confidence: 0.95,
        ruleId: 'config-compose-001',
      },
      {
        pattern: /network_mode:\s*["']?host["']?/gi,
        title: 'Host Network Mode',
        severity: 'HIGH',
        category: 'CONFIGURATION',
        description: 'Container uses host network stack, bypassing network isolation.',
        impact: 'Container can access all host network interfaces, sniff traffic, bind to any port.',
        remediation: 'Use bridge networking with explicit port mappings.',
        confidence: 0.9,
        ruleId: 'config-compose-002',
      },
      {
        pattern: /volumes:[\s\S]*?(?:\/var\/run\/docker\.sock|docker\.sock)/gi,
        title: 'Docker Socket Mounted',
        severity: 'CRITICAL',
        category: 'CONFIGURATION',
        description: 'Docker socket mounted in container, allowing full Docker API access.',
        impact: 'Container can create privileged containers, access host filesystem, effectively root on host.',
        remediation: 'Remove docker.sock mount. Use Docker-in-Docker or rootless alternatives if needed.',
        confidence: 0.95,
        ruleId: 'config-compose-003',
      },
      {
        pattern: /environment:[\s\S]*?(?:PASSWORD|SECRET|KEY|TOKEN|CREDENTIAL)\s*[=:]/gi,
        title: 'Secrets in docker-compose Environment',
        severity: 'HIGH',
        category: 'SECRETS',
        description: 'Sensitive values defined directly in docker-compose file.',
        impact: 'Secrets committed to version control, visible to anyone with repo access.',
        remediation: 'Use .env files (in .gitignore), docker secrets, or external secret management.',
        confidence: 0.85,
        ruleId: 'config-compose-004',
      },
    ],
  },

  // ==================== Kubernetes Security ====================
  {
    filePatterns: [/\.ya?ml$/i],
    checks: [
      {
        pattern: /securityContext:[\s\S]*?runAsUser:\s*0/gi,
        title: 'Kubernetes Pod Running as Root',
        severity: 'HIGH',
        category: 'CONFIGURATION',
        description: 'Pod explicitly configured to run as root user.',
        impact: 'Compromised container has root privileges, easier privilege escalation.',
        remediation: 'Set runAsUser to non-root UID, use runAsNonRoot: true.',
        confidence: 0.9,
        ruleId: 'config-k8s-001',
      },
      {
        pattern: /allowPrivilegeEscalation:\s*true/gi,
        title: 'Kubernetes Privilege Escalation Allowed',
        severity: 'HIGH',
        category: 'CONFIGURATION',
        description: 'Container can gain more privileges than its parent process.',
        impact: 'Attackers can escalate to root inside the container.',
        remediation: 'Set allowPrivilegeEscalation: false in securityContext.',
        confidence: 0.95,
        ruleId: 'config-k8s-002',
      },
      {
        pattern: /hostNetwork:\s*true|hostPID:\s*true|hostIPC:\s*true/gi,
        title: 'Kubernetes Host Namespace Sharing',
        severity: 'CRITICAL',
        category: 'CONFIGURATION',
        description: 'Pod shares host network, PID, or IPC namespace.',
        impact: 'Pod can see host processes, network traffic, or communicate with host IPC.',
        remediation: 'Remove hostNetwork, hostPID, hostIPC unless absolutely required.',
        confidence: 0.95,
        ruleId: 'config-k8s-003',
      },
      {
        pattern: /readOnlyRootFilesystem:\s*false/gi,
        title: 'Kubernetes Writable Root Filesystem',
        severity: 'MEDIUM',
        category: 'CONFIGURATION',
        description: 'Container has writable root filesystem.',
        impact: 'Attackers can modify container filesystem, plant malware, modify binaries.',
        remediation: 'Set readOnlyRootFilesystem: true, use emptyDir volumes for writable paths.',
        confidence: 0.8,
        ruleId: 'config-k8s-004',
      },
    ],
  },

  // ==================== Nginx Configuration ====================
  {
    filePatterns: [/nginx\.conf$/i, /\.nginx$/i, /sites-(?:available|enabled)\//i],
    checks: [
      {
        pattern: /server_tokens\s+on|(?!server_tokens\s+off)/gi,
        title: 'Nginx Server Version Exposed',
        severity: 'LOW',
        category: 'HEADERS',
        description: 'Nginx version exposed in Server header. Helps attackers identify vulnerable versions.',
        impact: 'Information disclosure aiding targeted attacks.',
        remediation: 'Add server_tokens off; in http or server block.',
        confidence: 0.7,
        ruleId: 'config-nginx-001',
      },
      {
        pattern: /ssl_protocols\s+[^;]*(?:SSLv2|SSLv3|TLSv1(?:\.0)?(?:\s|;))/gi,
        title: 'Deprecated SSL/TLS Protocols Enabled',
        severity: 'HIGH',
        category: 'CRYPTOGRAPHY',
        description: 'Nginx allows deprecated SSL/TLS protocols (SSLv2, SSLv3, TLS 1.0).',
        impact: 'Vulnerable to POODLE, BEAST, and other protocol attacks.',
        remediation: 'Use ssl_protocols TLSv1.2 TLSv1.3; only.',
        confidence: 0.95,
        ruleId: 'config-nginx-002',
      },
      {
        pattern: /add_header\s+Access-Control-Allow-Origin\s+["']\*["']/gi,
        title: 'Nginx Wildcard CORS',
        severity: 'MEDIUM',
        category: 'HEADERS',
        description: 'CORS allows any origin to make requests.',
        impact: 'Any website can make authenticated requests to your API.',
        remediation: 'Specify allowed origins explicitly or validate Origin header dynamically.',
        confidence: 0.85,
        ruleId: 'config-nginx-003',
      },
      {
        pattern: /autoindex\s+on/gi,
        title: 'Nginx Directory Listing Enabled',
        severity: 'MEDIUM',
        category: 'CONFIGURATION',
        description: 'Directory listing is enabled, exposing file structure.',
        impact: 'Information disclosure, potential exposure of sensitive files.',
        remediation: 'Set autoindex off; or remove the directive.',
        confidence: 0.9,
        ruleId: 'config-nginx-004',
      },
    ],
  },

  // ==================== Environment Files ====================
  {
    filePatterns: [/\.env(?:\.\w+)?$/i, /\.env\.example$/i, /\.env\.sample$/i],
    checks: [
      {
        pattern: /(?:PASSWORD|SECRET|KEY|TOKEN|CREDENTIAL|API_KEY|PRIVATE_KEY)\s*=\s*(?![\$\{])[^\s\n]+/gi,
        title: 'Hardcoded Secret in Environment File',
        severity: 'CRITICAL',
        category: 'SECRETS',
        description: 'Actual secret value in .env file. If committed, secrets are exposed.',
        impact: 'Direct credential exposure if .env is committed or shared.',
        remediation: 'Use placeholder values in .env.example, add .env to .gitignore, use secret management.',
        confidence: 0.7, // Lower confidence as .env might be gitignored
        ruleId: 'config-env-001',
      },
      {
        pattern: /DATABASE_URL\s*=\s*[^\s]*:\/\/[^:]+:[^@]+@/gi,
        title: 'Database Credentials in URL',
        severity: 'HIGH',
        category: 'SECRETS',
        description: 'Database connection string contains embedded credentials.',
        impact: 'Database credentials exposed if file is leaked.',
        remediation: 'Use separate env vars for username/password, or use IAM authentication.',
        confidence: 0.75,
        ruleId: 'config-env-002',
      },
      {
        pattern: /DEBUG\s*=\s*(?:true|1|yes)/gi,
        title: 'Debug Mode Enabled in Environment',
        severity: 'MEDIUM',
        category: 'CONFIGURATION',
        description: 'Debug mode enabled. May expose sensitive information in errors.',
        impact: 'Detailed error messages, stack traces, and debug info exposed.',
        remediation: 'Set DEBUG=false in production environments.',
        confidence: 0.8,
        ruleId: 'config-env-003',
      },
    ],
  },

  // ==================== GitHub Actions ====================
  {
    filePatterns: [/\.github\/workflows\/.*\.ya?ml$/i],
    checks: [
      {
        pattern: /\$\{\{\s*github\.event\.(?:issue|pull_request|comment)\.body\s*\}\}/gi,
        title: 'GitHub Actions Script Injection',
        severity: 'CRITICAL',
        category: 'INJECTION',
        description: 'User-controlled input directly used in run command. Attackers can inject commands via PR/issue.',
        impact: 'Arbitrary command execution in CI, secret theft, supply chain attacks.',
        remediation: 'Use environment variables or actions/github-script with proper escaping.',
        confidence: 0.9,
        ruleId: 'config-gha-001',
      },
      {
        pattern: /pull_request_target:/gi,
        title: 'GitHub Actions pull_request_target Trigger',
        severity: 'HIGH',
        category: 'CONFIGURATION',
        description: 'Workflow uses pull_request_target which runs with repo write access on external PRs.',
        impact: 'External contributors can trigger workflows with write access to secrets.',
        remediation: 'Use pull_request trigger instead, or carefully validate inputs.',
        confidence: 0.75,
        ruleId: 'config-gha-002',
      },
      {
        pattern: /permissions:\s*write-all|permissions:[\s\S]*?contents:\s*write/gi,
        title: 'Overly Permissive GitHub Actions Permissions',
        severity: 'MEDIUM',
        category: 'CONFIGURATION',
        description: 'Workflow has write permissions that may not be necessary.',
        impact: 'Compromised workflow can modify repository contents.',
        remediation: 'Use minimum required permissions. Specify permissions: contents: read explicitly.',
        confidence: 0.7,
        ruleId: 'config-gha-003',
      },
    ],
  },

  // ==================== package.json Security ====================
  {
    filePatterns: [/package\.json$/i],
    checks: [
      {
        pattern: /"scripts"[\s\S]*?(?:"pre|post)?\w+":\s*"[^"]*(?:rm\s+-rf|sudo|chmod\s+777|curl\s+[^"]*\|\s*(?:bash|sh))/gi,
        title: 'Dangerous npm Script Command',
        severity: 'HIGH',
        category: 'INJECTION',
        description: 'Package script contains potentially dangerous commands (rm -rf, sudo, chmod 777, curl|bash).',
        impact: 'Script may execute destructive or malicious commands.',
        remediation: 'Review and remove dangerous commands. Use safer alternatives.',
        confidence: 0.85,
        ruleId: 'config-npm-001',
      },
      {
        pattern: /"(?:dependencies|devDependencies)"[\s\S]*?"[^"]+"\s*:\s*"(?:git\+https?:|git:\/\/|github:)/gi,
        title: 'Git-based Dependency Without Integrity',
        severity: 'MEDIUM',
        category: 'DEPENDENCIES',
        description: 'Dependency installed from git URL without commit hash pinning.',
        impact: 'Supply chain attack via malicious updates to the git repository.',
        remediation: 'Pin to specific commit hash or use npm registry packages.',
        confidence: 0.8,
        ruleId: 'config-npm-002',
      },
    ],
  },

  // ==================== Terraform Security ====================
  {
    filePatterns: [/\.tf$/i],
    checks: [
      {
        pattern: /cidr_blocks\s*=\s*\[\s*"0\.0\.0\.0\/0"\s*\]/gi,
        title: 'Terraform Security Group Open to World',
        severity: 'HIGH',
        category: 'CONFIGURATION',
        description: 'Security group allows traffic from any IP address (0.0.0.0/0).',
        impact: 'Resources exposed to the entire internet.',
        remediation: 'Restrict CIDR blocks to known IP ranges or use VPN/bastion.',
        confidence: 0.9,
        ruleId: 'config-tf-001',
      },
      {
        pattern: /(?:password|secret|key)\s*=\s*"[^"]+"/gi,
        title: 'Terraform Hardcoded Secret',
        severity: 'CRITICAL',
        category: 'SECRETS',
        description: 'Secret hardcoded in Terraform configuration.',
        impact: 'Secrets exposed in state file and version control.',
        remediation: 'Use terraform variables, vault provider, or environment variables.',
        confidence: 0.85,
        ruleId: 'config-tf-002',
      },
      {
        pattern: /encrypted\s*=\s*false/gi,
        title: 'Terraform Resource Without Encryption',
        severity: 'HIGH',
        category: 'CRYPTOGRAPHY',
        description: 'Resource explicitly configured without encryption.',
        impact: 'Data at rest is not encrypted, violates compliance requirements.',
        remediation: 'Set encrypted = true and configure KMS key.',
        confidence: 0.9,
        ruleId: 'config-tf-003',
      },
      {
        pattern: /publicly_accessible\s*=\s*true/gi,
        title: 'Terraform Publicly Accessible Resource',
        severity: 'HIGH',
        category: 'CONFIGURATION',
        description: 'Database or resource marked as publicly accessible.',
        impact: 'Resource directly accessible from the internet.',
        remediation: 'Set publicly_accessible = false, use VPC and bastion hosts.',
        confidence: 0.9,
        ruleId: 'config-tf-004',
      },
    ],
  },
];

/**
 * Run configuration security scan
 */
export async function runConfigSecurityScan(repoPath: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    const files = await collectConfigFiles(repoPath);
    console.log(`[Config Security] Scanning ${files.length} configuration files...`);

    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(repoPath, filePath);

        const fileFindings = analyzeConfigFile(content, relativePath);
        findings.push(...fileFindings);
      } catch {
        continue;
      }
    }

    console.log(`[Config Security] Found ${findings.length} configuration security issues`);
    return findings;
  } catch (error) {
    console.error('[Config Security] Scan failed:', error);
    return [];
  }
}

/**
 * Collect configuration files
 */
async function collectConfigFiles(dir: string, files: string[] = []): Promise<string[]> {
  const skipDirs = new Set(['node_modules', '.git', 'dist', 'build', 'vendor', '.venv']);

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) {
          await collectConfigFiles(fullPath, files);
        }
      } else if (entry.isFile()) {
        // Check if this file matches any config pattern
        for (const config of CONFIG_PATTERNS) {
          if (config.filePatterns.some(p => p.test(fullPath))) {
            files.push(fullPath);
            break;
          }
        }
      }
    }
  } catch {
    // Directory not accessible
  }

  return files;
}

/**
 * Analyze a configuration file
 */
function analyzeConfigFile(content: string, filePath: string): RawFinding[] {
  const findings: RawFinding[] = [];
  const lines = content.split('\n');

  for (const config of CONFIG_PATTERNS) {
    // Check if file matches this config type
    if (!config.filePatterns.some(p => p.test(filePath))) {
      continue;
    }

    for (const check of config.checks) {
      check.pattern.lastIndex = 0;

      let match;
      while ((match = check.pattern.exec(content)) !== null) {
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;

        const startLine = Math.max(0, lineNumber - 2);
        const endLine = Math.min(lines.length, lineNumber + 2);
        const codeSnippet = lines.slice(startLine, endLine).join('\n');

        findings.push({
          title: check.title,
          severity: check.severity,
          category: check.category,
          source: 'ADVANCED',
          description: check.description,
          impact: check.impact,
          remediation: check.remediation,
          filePath,
          lineNumber,
          codeSnippet,
          confidence: check.confidence,
          ruleId: check.ruleId,
          rawFinding: { matchedText: match[0] },
        });

        if (!check.pattern.global) break;
      }
    }
  }

  return findings;
}
