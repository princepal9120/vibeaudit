import type { TriagedFinding, EnhancedFinding } from './scanners/types.js';

/**
 * Calculate security score (0-100) based on findings
 *
 * Scoring algorithm:
 * - Start with 100 points
 * - Deduct points based on severity:
 *   - CRITICAL: -25 points each (max -50)
 *   - HIGH: -10 points each (max -30)
 *   - MEDIUM: -5 points each (max -15)
 *   - LOW: -2 points each (max -5)
 * - Minimum score is 0
 *
 * Score interpretation:
 * - 90-100: Excellent - minimal or no issues
 * - 75-89: Good - some issues but generally secure
 * - 50-74: Fair - significant issues need attention
 * - 25-49: Poor - serious security concerns
 * - 0-24: Critical - immediate action required
 */
export function calculateSecurityScore(
  findings: (TriagedFinding | EnhancedFinding)[]
): number {
  let score = 100;

  // Count by severity
  const counts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  for (const finding of findings) {
    // Only count findings above confidence threshold
    if (finding.confidence >= 0.5) {
      counts[finding.severity]++;
    }
  }

  // Apply deductions with caps
  const criticalDeduction = Math.min(counts.CRITICAL * 25, 50);
  const highDeduction = Math.min(counts.HIGH * 10, 30);
  const mediumDeduction = Math.min(counts.MEDIUM * 5, 15);
  const lowDeduction = Math.min(counts.LOW * 2, 5);

  score -= criticalDeduction;
  score -= highDeduction;
  score -= mediumDeduction;
  score -= lowDeduction;

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): 'red' | 'yellow' | 'green' {
  if (score < 50) return 'red';
  if (score < 75) return 'yellow';
  return 'green';
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 25) return 'Poor';
  return 'Critical';
}

/**
 * Get score description for users
 */
export function getScoreDescription(score: number): string {
  if (score >= 90) {
    return 'Your application has excellent security with minimal or no issues detected.';
  }
  if (score >= 75) {
    return 'Your application has good security overall, with some issues to address.';
  }
  if (score >= 50) {
    return 'Your application has fair security but significant issues need attention before production.';
  }
  if (score >= 25) {
    return 'Your application has serious security concerns that require immediate attention.';
  }
  return 'Your application has critical security vulnerabilities. Do not deploy until these are fixed.';
}

/**
 * Calculate score breakdown for reporting
 */
export function getScoreBreakdown(
  findings: (TriagedFinding | EnhancedFinding)[]
): {
  score: number;
  label: string;
  color: 'red' | 'yellow' | 'green';
  description: string;
  breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  deductions: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
} {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const finding of findings) {
    if (finding.confidence >= 0.5) {
      switch (finding.severity) {
        case 'CRITICAL':
          counts.critical++;
          break;
        case 'HIGH':
          counts.high++;
          break;
        case 'MEDIUM':
          counts.medium++;
          break;
        case 'LOW':
          counts.low++;
          break;
      }
    }
  }

  const deductions = {
    critical: Math.min(counts.critical * 25, 50),
    high: Math.min(counts.high * 10, 30),
    medium: Math.min(counts.medium * 5, 15),
    low: Math.min(counts.low * 2, 5),
    total: 0,
  };
  deductions.total = deductions.critical + deductions.high + deductions.medium + deductions.low;

  const score = Math.max(0, 100 - deductions.total);

  return {
    score,
    label: getScoreLabel(score),
    color: getScoreColor(score),
    description: getScoreDescription(score),
    breakdown: counts,
    deductions,
  };
}

/**
 * Compare two scores and provide improvement/regression info
 */
export function compareScores(
  previousScore: number,
  currentScore: number
): {
  change: number;
  direction: 'improved' | 'regressed' | 'unchanged';
  message: string;
} {
  const change = currentScore - previousScore;

  if (change > 0) {
    return {
      change,
      direction: 'improved',
      message: `Security improved by ${change} points since last scan.`,
    };
  }

  if (change < 0) {
    return {
      change: Math.abs(change),
      direction: 'regressed',
      message: `Security decreased by ${Math.abs(change)} points since last scan.`,
    };
  }

  return {
    change: 0,
    direction: 'unchanged',
    message: 'Security score unchanged since last scan.',
  };
}
