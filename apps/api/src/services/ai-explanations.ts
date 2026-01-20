import OpenAI from 'openai';
import { config } from '../config.js';
import type { TriagedFinding, EnhancedFinding } from './scanners/types.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const BATCH_SIZE = 5; // Process findings in batches to reduce API calls

export async function generateAIExplanations(
  findings: TriagedFinding[]
): Promise<EnhancedFinding[]> {
  if (!config.openaiApiKey) {
    console.warn('OpenAI API key not configured, skipping AI explanations');
    return findings.map(f => ({ ...f, aiValidated: false }));
  }

  const enhanced: EnhancedFinding[] = [];

  // Process in batches
  for (let i = 0; i < findings.length; i += BATCH_SIZE) {
    const batch = findings.slice(i, i + BATCH_SIZE);

    try {
      const batchResults = await Promise.all(
        batch.map(f => enhanceFinding(f))
      );
      enhanced.push(...batchResults);
    } catch (error) {
      console.error('AI explanation batch failed:', error);
      // Fall back to original findings on error
      enhanced.push(...batch.map(f => ({ ...f, aiValidated: false })));
    }

    // Rate limiting: small delay between batches
    if (i + BATCH_SIZE < findings.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return enhanced;
}

async function enhanceFinding(finding: TriagedFinding): Promise<EnhancedFinding> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
      messages: [
        {
          role: 'system',
          content: `You are a security expert explaining vulnerabilities to non-technical developers and indie hackers.

Your explanations should be:
- Simple and jargon-free (explain terms if you must use them)
- Focused on practical impact (what could happen)
- Actionable (specific fix steps)

Keep each section under 2 sentences. Use everyday language, not security jargon.`,
        },
        {
          role: 'user',
          content: `Explain this security finding for a solo developer:

Title: ${finding.title}
Severity: ${finding.severity}
Category: ${finding.category}
Tool: ${finding.source}
File: ${finding.filePath || 'N/A'}
Line: ${finding.lineNumber || 'N/A'}

Current Description: ${finding.description}

Code Context:
${finding.codeSnippet ? '```\n' + finding.codeSnippet.slice(0, 500) + '\n```' : 'Not available'}

Provide JSON with these fields:
{
  "description": "What this vulnerability is, in simple terms",
  "impact": "Why this matters - what could happen if exploited",
  "remediation": "Step-by-step fix instructions"
}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content) as {
      description?: string;
      impact?: string;
      remediation?: string;
    };

    return {
      ...finding,
      description: parsed.description || finding.description,
      impact: parsed.impact || finding.impact,
      remediation: parsed.remediation || finding.remediation,
      aiValidated: true,
    };
  } catch (error) {
    console.error(`AI enhancement failed for finding "${finding.title}":`, error);
    // Return original finding on error
    return { ...finding, aiValidated: false };
  }
}

export async function validateFinding(
  finding: TriagedFinding
): Promise<{ isValid: boolean; confidence: number; reason: string }> {
  if (!config.openaiApiKey) {
    return { isValid: true, confidence: finding.confidence, reason: 'AI validation skipped' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a security expert determining if a scan finding is a TRUE POSITIVE or FALSE POSITIVE.

Consider:
1. Is this in test/example code? (likely false positive)
2. Is this an obvious placeholder? (likely false positive)
3. Does the context suggest this is intentional/safe?
4. Is this a real security concern in production?

Be conservative - when in doubt, say TRUE POSITIVE.`,
        },
        {
          role: 'user',
          content: `Analyze this finding:

Title: ${finding.title}
File: ${finding.filePath || 'N/A'}
Code:
${finding.codeSnippet ? '```\n' + finding.codeSnippet.slice(0, 300) + '\n```' : 'Not available'}

Respond with JSON:
{
  "verdict": "TRUE_POSITIVE" or "FALSE_POSITIVE",
  "confidence": 0.0 to 1.0,
  "reason": "Brief explanation"
}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent judgments
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { isValid: true, confidence: finding.confidence, reason: 'Empty AI response' };
    }

    const parsed = JSON.parse(content) as {
      verdict?: string;
      confidence?: number;
      reason?: string;
    };

    return {
      isValid: parsed.verdict === 'TRUE_POSITIVE',
      confidence: parsed.confidence || finding.confidence,
      reason: parsed.reason || 'AI validated',
    };
  } catch (error) {
    console.error('AI validation failed:', error);
    return { isValid: true, confidence: finding.confidence, reason: 'AI validation error' };
  }
}

export async function generateExecutiveSummary(
  findings: EnhancedFinding[],
  repoUrl?: string,
  liveUrl?: string,
  securityScore?: number
): Promise<string> {
  if (!config.openaiApiKey || findings.length === 0) {
    return generateBasicSummary(findings, repoUrl, liveUrl, securityScore);
  }

  try {
    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;
    const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
    const lowCount = findings.filter(f => f.severity === 'LOW').length;

    const topFindings = findings
      .slice(0, 5)
      .map(f => `- ${f.severity}: ${f.title}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are writing an executive summary for a security scan report.
Write for a non-technical audience (solo founders, indie hackers).
Be concise (3-5 sentences max) and focus on:
1. Overall security posture
2. Most important issues to fix
3. Recommended next steps

Do NOT use security jargon. Write like you're explaining to a friend.`,
        },
        {
          role: 'user',
          content: `Write an executive summary for this scan:

Target: ${repoUrl || liveUrl || 'Application'}
Security Score: ${securityScore}/100
Findings: ${criticalCount} Critical, ${highCount} High, ${mediumCount} Medium, ${lowCount} Low

Top Issues:
${topFindings}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content || generateBasicSummary(findings, repoUrl, liveUrl, securityScore);
  } catch (error) {
    console.error('Executive summary generation failed:', error);
    return generateBasicSummary(findings, repoUrl, liveUrl, securityScore);
  }
}

function generateBasicSummary(
  findings: EnhancedFinding[],
  repoUrl?: string,
  liveUrl?: string,
  securityScore?: number
): string {
  const total = findings.length;
  const critical = findings.filter(f => f.severity === 'CRITICAL').length;
  const high = findings.filter(f => f.severity === 'HIGH').length;

  let summary = `Security scan of ${repoUrl || liveUrl || 'the application'} completed`;

  if (securityScore !== undefined) {
    summary += ` with a score of ${securityScore}/100.`;
  } else {
    summary += '.';
  }

  if (total === 0) {
    summary += ' No security vulnerabilities were detected.';
  } else {
    summary += ` Found ${total} potential security issue${total === 1 ? '' : 's'}.`;

    if (critical > 0) {
      summary += ` ${critical} critical issue${critical === 1 ? '' : 's'} require${critical === 1 ? 's' : ''} immediate attention.`;
    } else if (high > 0) {
      summary += ` ${high} high-severity issue${high === 1 ? '' : 's'} should be addressed before production.`;
    }
  }

  return summary;
}
