/**
 * Finding Triage System
 *
 * Multi-layer filtering to achieve <5% false positive rate:
 * 1. Confidence-based filtering (tool confidence scores)
 * 2. Known false positive pattern matching
 * 3. Test/example file detection
 * 4. Context-based filtering (code patterns)
 * 5. AI-powered validation (for uncertain findings)
 * 6. Severity-based final filtering
 */

import {
  RawFinding,
  TriagedFinding,
  TriageConfig,
  TriageResult,
  TriageStats,
  Severity,
  DEFAULT_TRIAGE_CONFIG,
} from './types';
import {
  findMatchingFalsePositivePattern,
  isTestFile,
  isExampleFile,
  containsFalseSecretPattern,
} from './false-positives';

/**
 * Source reliability scores (based on historical false positive rates)
 * Higher = more reliable = fewer false positives
 */
const SOURCE_RELIABILITY: Record<string, number> = {
  'npm-audit': 0.95, // Very reliable - matches known CVEs
  trivy: 0.85, // Reliable for secrets detection
  semgrep: 0.75, // Good but can have false positives on edge cases
  zap: 0.70, // DAST can be noisy
  gitleaks: 0.80, // Good for secrets
};

/**
 * Calculate base confidence for a finding
 */
function calculateBaseConfidence(finding: RawFinding): number {
  // Start with tool-provided confidence or source reliability
  let confidence = finding.confidence ?? SOURCE_RELIABILITY[finding.source] ?? 0.7;

  // Boost confidence for CRITICAL findings (usually accurate)
  if (finding.severity === 'CRITICAL') {
    confidence = Math.min(1, confidence * 1.15);
  }

  // Reduce confidence for LOW severity (often noise)
  if (finding.severity === 'LOW') {
    confidence *= 0.85;
  }

  return confidence;
}

/**
 * Apply confidence penalties based on context
 */
function applyContextPenalties(
  finding: RawFinding,
  baseConfidence: number
): { confidence: number; penalties: string[] } {
  let confidence = baseConfidence;
  const penalties: string[] = [];

  // Penalty for findings in test files
  if (isTestFile(finding.filePath)) {
    confidence *= 0.5;
    penalties.push('test_file');
  }

  // Penalty for findings in example/doc files
  if (isExampleFile(finding.filePath)) {
    confidence *= 0.4;
    penalties.push('example_file');
  }

  // Penalty for secrets that match false positive patterns
  if (finding.category === 'secrets' && finding.codeSnippet) {
    if (containsFalseSecretPattern(finding.codeSnippet)) {
      confidence *= 0.2;
      penalties.push('false_secret_pattern');
    }
  }

  // Penalty for generic/vague rule IDs
  if (finding.ruleId && /generic|unknown|possible/i.test(finding.ruleId)) {
    confidence *= 0.7;
    penalties.push('generic_rule');
  }

  // Penalty for findings without specific line numbers (less precise)
  if (!finding.lineNumber) {
    confidence *= 0.9;
    penalties.push('no_line_number');
  }

  return { confidence, penalties };
}

/**
 * Downgrade severity by one level
 */
function downgradeSeverity(severity: Severity): Severity {
  const levels: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const currentIndex = levels.indexOf(severity);
  return levels[Math.min(currentIndex + 1, levels.length - 1)];
}

/**
 * Triage a single finding through all filtering layers
 */
function triageFinding(finding: RawFinding, config: TriageConfig): TriagedFinding {
  // Initialize triaged finding
  const triaged: TriagedFinding = {
    ...finding,
    adjustedSeverity: finding.severity,
    finalConfidence: 0,
    isFiltered: false,
    filterReason: undefined,
    triageMetadata: {
      isTestFile: false,
      isKnownFalsePositive: false,
      failedConfidenceThreshold: false,
      aiValidated: false,
    },
  };

  // Layer 1: Calculate base confidence
  let confidence = calculateBaseConfidence(finding);

  // Layer 2: Apply context penalties
  const { confidence: adjustedConfidence } = applyContextPenalties(finding, confidence);
  confidence = adjustedConfidence;

  // Track test file status
  triaged.triageMetadata.isTestFile = isTestFile(finding.filePath);

  // Layer 3: Check known false positive patterns
  const fpPattern = findMatchingFalsePositivePattern(
    finding.ruleId,
    finding.source,
    finding.filePath,
    finding.codeSnippet
  );

  if (fpPattern) {
    triaged.triageMetadata.isKnownFalsePositive = true;

    if (fpPattern.action === 'filter') {
      triaged.isFiltered = true;
      triaged.filterReason = `Known false positive: ${fpPattern.reason}`;
      confidence *= 0.1; // Very low confidence
    } else {
      // Downgrade severity
      triaged.adjustedSeverity = downgradeSeverity(triaged.adjustedSeverity);
      confidence *= 0.6;
    }
  }

  // Layer 4: Handle test files
  if (triaged.triageMetadata.isTestFile) {
    if (config.filterTestFiles) {
      triaged.isFiltered = true;
      triaged.filterReason = 'Finding in test file';
    } else {
      // Downgrade to LOW severity
      triaged.adjustedSeverity = 'LOW';
    }
  }

  // Layer 5: Confidence threshold check
  if (confidence < config.confidenceThreshold) {
    triaged.triageMetadata.failedConfidenceThreshold = true;

    // If above AI validation threshold, mark for AI review
    if (confidence >= config.aiValidationThreshold && config.enableAIValidation) {
      triaged.triageMetadata.aiValidated = false; // Needs AI validation
    } else {
      // Below AI threshold - downgrade or filter
      if (confidence < 0.3) {
        triaged.isFiltered = true;
        triaged.filterReason = `Very low confidence: ${(confidence * 100).toFixed(1)}%`;
      } else {
        triaged.adjustedSeverity = 'LOW';
      }
    }
  }

  // Layer 6: Final severity filter
  if (!triaged.isFiltered && !config.includeSeverities.includes(triaged.adjustedSeverity)) {
    triaged.isFiltered = true;
    triaged.filterReason = `Severity ${triaged.adjustedSeverity} not in included severities`;
  }

  triaged.finalConfidence = Math.max(0, Math.min(1, confidence));

  return triaged;
}

/**
 * Calculate triage statistics
 */
function calculateStats(findings: TriagedFinding[]): TriageStats {
  const validFindings = findings.filter(f => !f.isFiltered);
  const filteredFindings = findings.filter(f => f.isFiltered);

  // Count filtered reasons
  const filteredByReason = {
    lowConfidence: 0,
    testFile: 0,
    knownFalsePositive: 0,
    aiRejected: 0,
  };

  for (const f of filteredFindings) {
    if (f.triageMetadata.isKnownFalsePositive) {
      filteredByReason.knownFalsePositive++;
    } else if (f.triageMetadata.isTestFile) {
      filteredByReason.testFile++;
    } else if (f.triageMetadata.failedConfidenceThreshold) {
      filteredByReason.lowConfidence++;
    } else if (f.triageMetadata.aiValidated === false) {
      filteredByReason.aiRejected++;
    }
  }

  // Estimate false positive rate based on confidence scores
  // This is a heuristic: findings with higher confidence are less likely to be FPs
  const avgConfidence = validFindings.length > 0
    ? validFindings.reduce((sum, f) => sum + f.finalConfidence, 0) / validFindings.length
    : 0;

  // Estimated FP rate = 1 - average confidence (simplified model)
  // With our filtering, we expect <5% FP rate
  const estimatedFalsePositiveRate = Math.max(0, Math.min(1, 1 - avgConfidence));

  return {
    totalReceived: findings.length,
    totalValid: validFindings.length,
    totalFiltered: filteredFindings.length,
    filteredByReason,
    estimatedFalsePositiveRate,
  };
}

/**
 * Main triage function - process all findings through filtering layers
 */
export function triageFindings(
  rawFindings: RawFinding[],
  config: Partial<TriageConfig> = {}
): TriageResult {
  const finalConfig = { ...DEFAULT_TRIAGE_CONFIG, ...config };

  // Triage each finding
  const findings = rawFindings.map(f => triageFinding(f, finalConfig));

  // Separate valid and filtered findings
  const validFindings = findings.filter(f => !f.isFiltered);
  const filteredFindings = findings.filter(f => f.isFiltered);

  // Calculate statistics
  const stats = calculateStats(findings);

  return {
    findings,
    validFindings,
    filteredFindings,
    stats,
  };
}

/**
 * Quick check if a finding should be immediately filtered
 * (before full triage for performance)
 */
export function quickFilterCheck(finding: RawFinding): { shouldFilter: boolean; reason?: string } {
  // Immediately filter test files with low severity
  if (isTestFile(finding.filePath) && (finding.severity === 'LOW' || finding.severity === 'MEDIUM')) {
    return { shouldFilter: true, reason: 'Low/medium severity in test file' };
  }

  // Immediately filter known false positive secrets
  if (finding.category === 'secrets' && finding.codeSnippet) {
    if (containsFalseSecretPattern(finding.codeSnippet)) {
      return { shouldFilter: true, reason: 'False secret pattern detected' };
    }
  }

  // Immediately filter example files
  if (isExampleFile(finding.filePath) && finding.severity !== 'CRITICAL') {
    return { shouldFilter: true, reason: 'Finding in example/documentation file' };
  }

  return { shouldFilter: false };
}

/**
 * Sort findings by priority (for display)
 */
export function sortFindingsByPriority(findings: TriagedFinding[]): TriagedFinding[] {
  const severityOrder: Record<Severity, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  return [...findings].sort((a, b) => {
    // First sort by severity
    const severityDiff = severityOrder[a.adjustedSeverity] - severityOrder[b.adjustedSeverity];
    if (severityDiff !== 0) return severityDiff;

    // Then by confidence (higher confidence first)
    return b.finalConfidence - a.finalConfidence;
  });
}

/**
 * Get findings that need AI validation
 */
export function getFindingsNeedingAIValidation(findings: TriagedFinding[]): TriagedFinding[] {
  return findings.filter(
    f =>
      !f.isFiltered &&
      f.triageMetadata.failedConfidenceThreshold &&
      f.triageMetadata.aiValidated === false
  );
}

/**
 * Apply AI validation results to findings
 */
export function applyAIValidationResults(
  findings: TriagedFinding[],
  validationResults: Map<string, { isValid: boolean; confidence: number }>
): TriagedFinding[] {
  return findings.map(finding => {
    const result = validationResults.get(finding.ruleId + finding.filePath);
    if (!result) return finding;

    const updated = { ...finding };
    updated.triageMetadata = {
      ...updated.triageMetadata,
      aiValidated: true,
      aiValidationScore: result.confidence,
    };

    if (!result.isValid) {
      updated.isFiltered = true;
      updated.filterReason = `AI validation rejected (${(result.confidence * 100).toFixed(1)}% confidence)`;
    } else {
      // Boost confidence based on AI validation
      updated.finalConfidence = Math.min(1, (updated.finalConfidence + result.confidence) / 2);
    }

    return updated;
  });
}
