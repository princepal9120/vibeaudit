import * as fs from 'fs/promises';
import * as path from 'path';
import OpenAI from 'openai';
import { config } from '../../config.js';
import type { RawFinding, Severity, FindingCategory } from './types.js';

/**
 * AI-Powered Deep Security Analysis
 * Uses LLM to detect complex security vulnerabilities that pattern matching cannot find:
 * - Business logic flaws
 * - Complex authentication/authorization issues
 * - Subtle race conditions
 * - Context-dependent vulnerabilities
 * - Multi-file security issues
 */

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// File types to analyze deeply
const DEEP_ANALYSIS_FILES = [
  // Auth-related files
  /auth/i,
  /login/i,
  /session/i,
  /middleware/i,
  /guard/i,
  /protect/i,
  // Payment/sensitive operations
  /payment/i,
  /checkout/i,
  /billing/i,
  /subscription/i,
  /transaction/i,
  // API routes
  /routes?/i,
  /api/i,
  /controller/i,
  /handler/i,
  // Data access
  /repository/i,
  /service/i,
  /model/i,
];

interface DeepAnalysisResult {
  findings: Array<{
    title: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    description: string;
    impact: string;
    remediation: string;
    lineNumber?: number;
    codeReference?: string;
  }>;
}

/**
 * Run AI-powered deep security analysis
 */
export async function runAIDeepAnalysis(repoPath: string): Promise<RawFinding[]> {
  if (!config.openaiApiKey) {
    console.log('[AI Deep Analysis] Skipping - OpenAI API key not configured');
    return [];
  }

  try {
    const findings: RawFinding[] = [];

    // Collect security-critical files
    const criticalFiles = await collectCriticalFiles(repoPath);
    console.log(`[AI Deep Analysis] Analyzing ${criticalFiles.length} security-critical files...`);

    // Batch files for analysis (to manage token limits)
    const batches = createBatches(criticalFiles, 3); // 3 files per batch

    for (const batch of batches) {
      try {
        const batchFindings = await analyzeFileBatch(batch, repoPath);
        findings.push(...batchFindings);
      } catch (error) {
        console.error('[AI Deep Analysis] Batch analysis failed:', error);
        // Continue with next batch
      }
    }

    console.log(`[AI Deep Analysis] Found ${findings.length} issues`);
    return findings;
  } catch (error) {
    console.error('[AI Deep Analysis] Scan failed:', error);
    return [];
  }
}

/**
 * Collect files that are security-critical
 */
async function collectCriticalFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const extensions = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.go', '.java']);
  const skipDirs = new Set(['node_modules', '.git', 'dist', 'build', 'test', '__tests__', 'spec', '__pycache__']);

  async function walk(currentDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!skipDirs.has(entry.name)) {
            await walk(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.has(ext)) {
            // Check if file name suggests security-critical code
            if (DEEP_ANALYSIS_FILES.some(pattern => pattern.test(entry.name) || pattern.test(fullPath))) {
              files.push(fullPath);
            }
          }
        }
      }
    } catch {
      // Directory not accessible
    }
  }

  await walk(dir);

  // Limit to most important files (max 15)
  return files.slice(0, 15);
}

/**
 * Create batches of files for analysis
 */
function createBatches(files: string[], batchSize: number): string[][] {
  const batches: string[][] = [];
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Analyze a batch of files using AI
 */
async function analyzeFileBatch(filePaths: string[], repoPath: string): Promise<RawFinding[]> {
  const fileContents: Array<{ path: string; content: string }> = [];

  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(repoPath, filePath);

      // Truncate very large files
      const truncatedContent = content.length > 8000 ? content.slice(0, 8000) + '\n// ... truncated' : content;

      fileContents.push({
        path: relativePath,
        content: truncatedContent,
      });
    } catch {
      // Skip unreadable files
    }
  }

  if (fileContents.length === 0) {
    return [];
  }

  const filesText = fileContents
    .map(f => `=== FILE: ${f.path} ===\n${f.content}`)
    .join('\n\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert security auditor specializing in finding vulnerabilities that automated tools miss.

Analyze the provided code for these HIGH-LEVEL security issues:

1. **Business Logic Flaws**
   - Price/amount manipulation opportunities
   - Order of operations issues
   - State machine vulnerabilities
   - Bypass of business rules

2. **Authentication & Authorization**
   - Broken access control (IDOR)
   - Privilege escalation paths
   - Session management issues
   - Missing authorization checks

3. **Race Conditions**
   - Time-of-check to time-of-use (TOCTOU)
   - Double-spend vulnerabilities
   - Concurrent modification issues

4. **Data Exposure**
   - Sensitive data in responses
   - Logging of secrets
   - Information disclosure

5. **Injection & Input Handling**
   - SQL/NoSQL injection paths
   - Command injection
   - Template injection
   - Path traversal

6. **Cryptographic Issues**
   - Weak algorithms
   - Hardcoded secrets
   - Improper key management

Focus on REAL vulnerabilities, not theoretical concerns. Only report findings with HIGH confidence.

Return JSON with this exact structure:
{
  "findings": [
    {
      "title": "Brief descriptive title",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "AUTH|INJECTION|CRYPTOGRAPHY|CONFIGURATION|SECRETS|OTHER",
      "description": "What the vulnerability is",
      "impact": "What could happen if exploited",
      "remediation": "How to fix it",
      "lineNumber": 42,
      "codeReference": "The specific code snippet"
    }
  ]
}

If no significant vulnerabilities found, return: {"findings": []}`,
        },
        {
          role: 'user',
          content: `Analyze these files for security vulnerabilities:\n\n${filesText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 4000,
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      return [];
    }

    const result: DeepAnalysisResult = JSON.parse(responseContent);

    // Convert to RawFinding format
    return result.findings.map((f, index) => ({
      title: `[AI] ${f.title}`,
      severity: validateSeverity(f.severity),
      category: mapCategory(f.category),
      source: 'ADVANCED' as const,
      description: f.description,
      impact: f.impact,
      remediation: f.remediation,
      filePath: fileContents[0]?.path, // Associate with first file in batch
      lineNumber: f.lineNumber,
      codeSnippet: f.codeReference,
      confidence: 0.75, // AI findings have moderate confidence
      ruleId: `ai-deep-${index + 1}`,
      rawFinding: {
        aiGenerated: true,
        originalFinding: f,
      },
    }));
  } catch (error) {
    console.error('[AI Deep Analysis] OpenAI API error:', error);
    return [];
  }
}

/**
 * Validate severity value
 */
function validateSeverity(severity: string): Severity {
  const valid: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const upper = severity?.toUpperCase() as Severity;
  return valid.includes(upper) ? upper : 'MEDIUM';
}

/**
 * Map category string to FindingCategory
 */
function mapCategory(category: string): FindingCategory {
  const upper = category?.toUpperCase() || '';
  if (upper.includes('AUTH')) return 'AUTH';
  if (upper.includes('INJECT')) return 'INJECTION';
  if (upper.includes('CRYPTO')) return 'CRYPTOGRAPHY';
  if (upper.includes('CONFIG')) return 'CONFIGURATION';
  if (upper.includes('SECRET')) return 'SECRETS';
  if (upper.includes('XSS')) return 'XSS';
  if (upper.includes('CSRF')) return 'CSRF';
  return 'OTHER';
}
