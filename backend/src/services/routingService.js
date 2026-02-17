/**
 * Routing Service - Intelligent question routing and escalation
 *
 * This service determines when questions should be escalated to humans
 * based on confidence scores, complexity, and scope.
 */

import { assessConfidence } from './llmService.js';
import { estimateComplexity } from '../utils/sqlSanitizer.js';

/**
 * Complexity levels
 */
export const COMPLEXITY_LEVELS = {
  SIMPLE: 'simple',
  MODERATE: 'moderate',
  COMPLEX: 'complex'
};

/**
 * Escalation thresholds
 */
const THRESHOLDS = {
  LOW_CONFIDENCE: 0.6,
  COMPLEX_WITH_MODERATE_CONFIDENCE: 0.8
};

/**
 * Determine complexity level from complexity score
 *
 * @param {number} complexityScore - Numeric complexity score
 * @returns {string} - Complexity level (simple, moderate, complex)
 */
export function getComplexityLevel(complexityScore) {
  if (complexityScore <= 2) return COMPLEXITY_LEVELS.SIMPLE;
  if (complexityScore <= 5) return COMPLEXITY_LEVELS.MODERATE;
  return COMPLEXITY_LEVELS.COMPLEX;
}

/**
 * Assess question complexity from SQL query
 *
 * @param {string} sqlQuery - The SQL query
 * @param {string} userQuestion - The original question
 * @returns {Object} - { level: string, score: number, factors: Array }
 */
export function assessComplexity(sqlQuery, userQuestion) {
  const score = estimateComplexity(sqlQuery);
  const level = getComplexityLevel(score);

  // Track what contributed to complexity
  const factors = [];
  const upper = sqlQuery.toUpperCase();

  if (upper.includes('JOIN')) {
    const joinCount = (upper.match(/JOIN/g) || []).length;
    factors.push(`${joinCount} JOIN(s)`);
  }

  if (upper.match(/\(\s*SELECT/)) {
    factors.push('Subquery');
  }

  if (upper.includes('GROUP BY') || upper.includes('HAVING')) {
    factors.push('Aggregation');
  }

  // Check question for complexity indicators
  const questionUpper = userQuestion.toUpperCase();
  if (/COMPARE|TREND|YEAR.OVER.YEAR|YOY|CORRELATION/i.test(questionUpper)) {
    factors.push('Comparative analysis');
  }

  return {
    level,
    score,
    factors
  };
}

/**
 * Determine if a question should be escalated to humans
 *
 * @param {Object} params - Parameters for escalation decision
 * @param {number} params.confidenceScore - Confidence score (0-1)
 * @param {string} params.complexityLevel - Complexity level
 * @param {boolean} params.isInScope - Is question in scope?
 * @param {boolean} params.manualEscalation - User requested escalation?
 * @param {boolean} params.hadError - Did processing encounter errors?
 * @returns {Object} - { shouldEscalate: boolean, reason: string }
 */
export function shouldEscalate({
  confidenceScore,
  complexityLevel,
  isInScope = true,
  manualEscalation = false,
  hadError = false
}) {
  // Manual escalation always wins
  if (manualEscalation) {
    return {
      shouldEscalate: true,
      reason: 'User requested human assistance'
    };
  }

  // Processing errors should be escalated
  if (hadError) {
    return {
      shouldEscalate: true,
      reason: 'Error occurred during processing'
    };
  }

  // Out of scope questions
  if (!isInScope) {
    return {
      shouldEscalate: true,
      reason: 'Question outside database domain'
    };
  }

  // Low confidence
  if (confidenceScore < THRESHOLDS.LOW_CONFIDENCE) {
    return {
      shouldEscalate: true,
      reason: 'Low confidence in automated response'
    };
  }

  // Complex questions with moderate confidence
  if (complexityLevel === COMPLEXITY_LEVELS.COMPLEX &&
      confidenceScore < THRESHOLDS.COMPLEX_WITH_MODERATE_CONFIDENCE) {
    return {
      shouldEscalate: true,
      reason: 'Complex question requiring expert review'
    };
  }

  // No escalation needed
  return {
    shouldEscalate: false,
    reason: null
  };
}

/**
 * Full routing analysis for a question/answer pair
 *
 * @param {Object} params - Parameters for routing analysis
 * @param {string} params.userQuestion - The user's question
 * @param {string} params.sqlQuery - Generated SQL query
 * @param {Array} params.results - Query results
 * @param {boolean} params.isInScope - Is question in scope?
 * @param {boolean} params.manualEscalation - Manual escalation flag
 * @param {boolean} params.hadError - Error flag
 * @returns {Promise<Object>} - Complete routing analysis
 */
export async function analyzeRouting({
  userQuestion,
  sqlQuery = null,
  results = [],
  isInScope = true,
  manualEscalation = false,
  hadError = false
}) {
  try {
    // Assess confidence (skip if there was an error or out of scope)
    let confidenceScore = 0.5; // Default
    if (isInScope && !hadError && sqlQuery) {
      confidenceScore = await assessConfidence(userQuestion, sqlQuery, results);
    }

    // Assess complexity (skip if no SQL query)
    let complexity = {
      level: COMPLEXITY_LEVELS.SIMPLE,
      score: 0,
      factors: []
    };
    if (sqlQuery) {
      complexity = assessComplexity(sqlQuery, userQuestion);
    }

    // Determine if escalation is needed
    const escalation = shouldEscalate({
      confidenceScore,
      complexityLevel: complexity.level,
      isInScope,
      manualEscalation,
      hadError
    });

    return {
      confidenceScore,
      complexity,
      isInScope,
      needsEscalation: escalation.shouldEscalate,
      escalationReason: escalation.reason
    };

  } catch (error) {
    console.error('Routing analysis error:', error);

    // On error, default to cautious escalation
    return {
      confidenceScore: 0.3,
      complexity: {
        level: COMPLEXITY_LEVELS.MODERATE,
        score: 0,
        factors: []
      },
      isInScope: true,
      needsEscalation: true,
      escalationReason: 'Error during routing analysis'
    };
  }
}

/**
 * Get confidence level label for UI display
 *
 * @param {number} confidenceScore - Confidence score (0-1)
 * @returns {string} - 'high', 'moderate', or 'low'
 */
export function getConfidenceLabel(confidenceScore) {
  if (confidenceScore >= 0.9) return 'high';
  if (confidenceScore >= 0.7) return 'moderate';
  return 'low';
}

/**
 * Get confidence color for UI display
 *
 * @param {number} confidenceScore - Confidence score (0-1)
 * @returns {string} - 'green', 'yellow', or 'red'
 */
export function getConfidenceColor(confidenceScore) {
  if (confidenceScore >= 0.9) return 'green';
  if (confidenceScore >= 0.7) return 'yellow';
  return 'red';
}

export default {
  assessComplexity,
  shouldEscalate,
  analyzeRouting,
  getComplexityLevel,
  getConfidenceLabel,
  getConfidenceColor,
  COMPLEXITY_LEVELS
};
