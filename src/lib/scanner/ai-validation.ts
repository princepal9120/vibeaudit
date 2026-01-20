/**
 * AI-Powered Validation Layer
 *
 * Uses LLM to validate uncertain findings and reduce false positives.
 * This layer is called for findings that fall between the confidence
 * threshold and AI validation threshold.
 */

import { TriagedFinding, Severity } from './types';

/**
 * AI validation result for a single finding
 */
export interface AIValidationResult {
  /** Whether the AI considers this a real vulnerability */
  isValid: boolean;
  /** AI's confidence in its assessment (0-1) */
  confidence: number;
  /** Brief explanation of the AI's reasoning */
  reasoning: string;
  /** Suggested severity (may differ from original) */
  suggestedSeverity?: Severity;
}

/**
 * Batch validation request
 */
export interface BatchValidationRequest {
  findings: TriagedFinding[];
  /** Additional context about the project (optional) */
  projectContext?: {
    framework?: string;
    language?: string;
    isProduction?: boolean;
  };
}

/**
 * Generate the system prompt for AI validation
 */
function getSystemPrompt(): string {
  return `You are an expert security analyst tasked with validating security findings from automated scanning tools.

Your job is to determine whether each finding is a TRUE POSITIVE (real security vulnerability) or a FALSE POSITIVE (not a real issue).

When evaluating findings, consider:
1. Is this actually exploitable in a real-world scenario?
2. Is this a test/example file where "vulnerabilities" are intentional?
3. Is the context (file path, code snippet) consistent with a real vulnerability?
4. Does the code pattern actually represent a security risk?
5. Are there framework-specific protections that mitigate this?

Be conservative - when in doubt, err on the side of marking as TRUE POSITIVE.
However, clearly mark obvious false positives to reduce noise.

Target: Achieve <5% false positive rate in final results.`;
}

/**
 * Generate the prompt for validating a single finding
 */
function generateFindingPrompt(finding: TriagedFinding): string {
  const contextInfo = [];

  if (finding.filePath) {
    contextInfo.push(`File: ${finding.filePath}`);
  }
  if (finding.lineNumber) {
    contextInfo.push(`Line: ${finding.lineNumber}`);
  }
  if (finding.codeSnippet) {
    contextInfo.push(`Code:\n\`\`\`\n${finding.codeSnippet}\n\`\`\``);
  }

  return `
Finding: ${finding.title}
Rule ID: ${finding.ruleId}
Severity: ${finding.severity}
Category: ${finding.category}
Source: ${finding.source}
Message: ${finding.message}
${contextInfo.join('\n')}

Current Confidence: ${(finding.finalConfidence * 100).toFixed(1)}%
Test File: ${finding.triageMetadata.isTestFile ? 'Yes' : 'No'}

Is this a TRUE POSITIVE (real vulnerability) or FALSE POSITIVE?
Respond with JSON: { "isValid": boolean, "confidence": 0-1, "reasoning": "brief explanation", "suggestedSeverity": "CRITICAL|HIGH|MEDIUM|LOW" (optional) }
`;
}

/**
 * Generate the prompt for batch validation
 */
function generateBatchPrompt(findings: TriagedFinding[]): string {
  const findingsText = findings
    .map((f, i) => `--- Finding ${i + 1} ---\n${generateFindingPrompt(f)}`)
    .join('\n\n');

  return `
Validate the following ${findings.length} security findings.
For each finding, determine if it's a TRUE POSITIVE or FALSE POSITIVE.

${findingsText}

Respond with a JSON array containing your assessment for each finding (in order):
[
  { "isValid": boolean, "confidence": 0-1, "reasoning": "brief explanation" },
  ...
]
`;
}

/**
 * Parse AI response for a single finding
 */
function parseAIResponse(response: string): AIValidationResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      isValid: Boolean(parsed.isValid),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      reasoning: String(parsed.reasoning || 'No reasoning provided'),
      suggestedSeverity: parsed.suggestedSeverity as Severity | undefined,
    };
  } catch {
    // Default to valid if parsing fails (conservative approach)
    return {
      isValid: true,
      confidence: 0.5,
      reasoning: 'Failed to parse AI response, defaulting to valid',
    };
  }
}

/**
 * Parse AI response for batch validation
 */
function parseBatchAIResponse(response: string, count: number): AIValidationResult[] {
  try {
    // Try to extract JSON array from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as unknown[];
    return parsed.map(item => {
      const typedItem = item as Record<string, unknown>;
      return {
        isValid: Boolean(typedItem.isValid),
        confidence: Math.max(0, Math.min(1, Number(typedItem.confidence) || 0.5)),
        reasoning: String(typedItem.reasoning || 'No reasoning provided'),
        suggestedSeverity: typedItem.suggestedSeverity as Severity | undefined,
      };
    });
  } catch {
    // Default to all valid if parsing fails
    return Array(count).fill({
      isValid: true,
      confidence: 0.5,
      reasoning: 'Failed to parse AI response, defaulting to valid',
    });
  }
}

/**
 * Interface for LLM client (to be implemented with actual OpenAI client)
 */
export interface LLMClient {
  complete(systemPrompt: string, userPrompt: string): Promise<string>;
}

/**
 * Validate a single finding using AI
 */
export async function validateFinding(
  finding: TriagedFinding,
  llmClient: LLMClient
): Promise<AIValidationResult> {
  const systemPrompt = getSystemPrompt();
  const userPrompt = generateFindingPrompt(finding);

  const response = await llmClient.complete(systemPrompt, userPrompt);
  return parseAIResponse(response);
}

/**
 * Validate multiple findings in batch using AI
 * More cost-efficient than validating individually
 */
export async function validateFindingsBatch(
  findings: TriagedFinding[],
  llmClient: LLMClient,
  batchSize: number = 5
): Promise<Map<string, AIValidationResult>> {
  const results = new Map<string, AIValidationResult>();

  // Process in batches
  for (let i = 0; i < findings.length; i += batchSize) {
    const batch = findings.slice(i, i + batchSize);
    const systemPrompt = getSystemPrompt();
    const userPrompt = generateBatchPrompt(batch);

    const response = await llmClient.complete(systemPrompt, userPrompt);
    const batchResults = parseBatchAIResponse(response, batch.length);

    // Map results back to findings
    batch.forEach((finding, idx) => {
      const key = finding.ruleId + finding.filePath;
      results.set(key, batchResults[idx]);
    });
  }

  return results;
}

/**
 * Create a mock LLM client for testing
 */
export function createMockLLMClient(): LLMClient {
  return {
    async complete(_systemPrompt: string, userPrompt: string): Promise<string> {
      // Simple heuristic-based mock for testing
      const isTestFile = /test|spec|mock|fixture/i.test(userPrompt);
      const isExample = /example|sample|placeholder|changeme/i.test(userPrompt);
      const isCritical = /CRITICAL/i.test(userPrompt);

      const isValid = isCritical || (!isTestFile && !isExample);
      const confidence = isCritical ? 0.9 : isTestFile || isExample ? 0.3 : 0.7;

      return JSON.stringify({
        isValid,
        confidence,
        reasoning: isValid
          ? 'Finding appears to be a legitimate security concern'
          : 'Finding is likely a false positive due to context',
      });
    },
  };
}

/**
 * Calculate the expected improvement in false positive rate from AI validation
 */
export function calculateAIValidationImpact(
  beforeResults: Map<string, AIValidationResult>
): { rejectedCount: number; acceptedCount: number; averageConfidence: number } {
  let rejectedCount = 0;
  let acceptedCount = 0;
  let totalConfidence = 0;

  for (const result of beforeResults.values()) {
    if (result.isValid) {
      acceptedCount++;
    } else {
      rejectedCount++;
    }
    totalConfidence += result.confidence;
  }

  return {
    rejectedCount,
    acceptedCount,
    averageConfidence: beforeResults.size > 0 ? totalConfidence / beforeResults.size : 0,
  };
}
