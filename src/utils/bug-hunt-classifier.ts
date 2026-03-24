/**
 * @agent-doc
 * PURPOSE: Pure-function classifier implementing the 4-Category Bug Hunting Rulebook.
 * OWNER: human-only
 * IMPACT: high - Core decision logic for all bug classification across agents.
 * DEPENDS-ON: src/framework-contracts/diagnostics.ts
 * USED-BY: Healer (Phase 0 triage), Generator (walkthrough classification), Audit (verification)
 * RULES:
 *   - Every classification produces BOTH bugHuntCategory AND disposition (backward compat).
 *   - Change size thresholds come from pipeline-config.json, NOT hardcoded.
 *   - Retry/flake awareness: passed-on-retry = FLAKE, not bug.
 *   - Dedup via errorHash before filing new bug reports.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  BugHuntCategory,
  BugHuntClassification,
  ChangeSize,
  TestIdStatus,
  AutonomyDecision,
  TriageDisposition,
  TriageConfidence,
  TriageSignal,
  BUG_HUNT_TO_DISPOSITION,
  BugReport,
} from '../framework-contracts/diagnostics';

// ── Types ──

export interface ChangeSizeThreshold {
  maxFilesForSmall: number;
  maxSelectorsForSmall: number;
}

export interface FlakeConfig {
  promotionThreshold: number;
  promotionWindow: number;
}

export interface ClassifierInput {
  signals: TriageSignal[];
  /** Was this a data-testid related failure? */
  isTestIdFailure: boolean;
  /** If testid failure: was testid missing entirely, or changed to a different value? */
  testIdOldValue?: string | null;
  testIdNewValue?: string | null;
  /** Selectors affected by this failure. */
  affectedSelectors: string[];
  /** Files affected by this failure. */
  affectedFiles: string[];
  /** Did the test pass on a retry? */
  passedOnRetry: boolean;
  /** Retry attempt number (0 = first run). */
  retryAttempt: number;
  /** Is this the first run for this page (no historical data)? */
  isFirstRun: boolean;
  /** Test name for dedup/correlation. */
  testName: string;
  /** Error message for dedup hash. */
  errorMessage: string;
}

export interface FailureHistoryEntry {
  testName: string;
  errorHash: string;
  bugHuntCategory: string;
  runId: string;
  createdAt: string;
}

// ── Core Classifier ──

/**
 * Classify a failure according to the 4-Category Bug Hunting Rulebook.
 * Returns both bugHuntCategory (detailed) and disposition (coarse, backward compat).
 */
export function classifyBugHuntCategory(
  input: ClassifierInput,
  thresholds: ChangeSizeThreshold,
): BugHuntClassification {
  // Step 0: Retry/flake check
  if (input.passedOnRetry) {
    return buildResult(BugHuntCategory.FLAKE, null, null, AutonomyDecision.AUTONOMOUS,
      TriageConfidence.HIGH, 'Test passed on retry — transient failure (flake), not a real bug.');
  }

  // Step 1: Check for infrastructure-only transient (network 500 alone, no other signals)
  if (isInfrastructureTransient(input.signals)) {
    return buildResult(BugHuntCategory.INFRASTRUCTURE_TRANSIENT, null, null, AutonomyDecision.AUTONOMOUS,
      TriageConfidence.MEDIUM, 'Network-only failure with no DOM/console evidence. Auto-retry recommended.');
  }

  // Step 2: Check test-ID specific failures
  if (input.isTestIdFailure) {
    return classifyTestIdFailure(input);
  }

  // Step 3: Check for feature changes
  const changeSignals = input.signals.filter(s =>
    s.direction === TriageDisposition.FEATURE_CHANGE ||
    ['SIG-LABEL-CHANGE', 'SIG-LAYOUT-CHANGE', 'SIG-SELECTOR-MOVED', 'SIG-SELECTOR-GONE'].includes(s.signalId)
  );

  if (changeSignals.length > 0) {
    const size = classifyChangeSize(input.affectedSelectors, input.affectedFiles, thresholds);
    if (size === ChangeSize.BIG) {
      return buildResult(BugHuntCategory.FEATURE_CHANGED_BIG, ChangeSize.BIG, null, AutonomyDecision.HUMAN_REVIEW,
        TriageConfidence.HIGH, `Feature change exceeds threshold (${input.affectedFiles.length} files, ${input.affectedSelectors.length} selectors). Escalation required.`);
    }
    return buildResult(BugHuntCategory.FEATURE_CHANGED_SMALL, ChangeSize.SMALL, null, AutonomyDecision.AUTONOMOUS,
      TriageConfidence.HIGH, `Small feature change (${input.affectedFiles.length} files, ${input.affectedSelectors.length} selectors). Auto-heal + notify.`);
  }

  // Step 4: No change signals but failure occurred → real bug
  const bugSignals = input.signals.filter(s =>
    s.direction === TriageDisposition.BUG ||
    ['SIG-CONSOLE-ERROR', 'SIG-PAGE-ERROR', 'SIG-NETWORK-500', 'SIG-VALUE-MISMATCH'].includes(s.signalId)
  );

  if (bugSignals.length > 0) {
    return buildResult(BugHuntCategory.UNCHANGED_FAILURE, null, null, AutonomyDecision.AUTONOMOUS,
      TriageConfidence.HIGH, 'Feature intact but failure occurred — this is a bug. Auto-report.');
  }

  // Step 5: Insufficient signals → uncertain
  return buildResult(BugHuntCategory.UNCHANGED_FAILURE, null, null, AutonomyDecision.HUMAN_REVIEW,
    TriageConfidence.LOW, 'Insufficient signals for confident classification. Needs human review.');
}

// ── Helper Functions ──

function classifyTestIdFailure(input: ClassifierInput): BugHuntClassification {
  // First run: TESTID_CHANGED is impossible (no baseline to compare)
  if (input.isFirstRun) {
    if (!input.testIdNewValue) {
      // TestId not in DOM at all
      return buildResult(BugHuntCategory.TESTID_MISSING, null, TestIdStatus.MISSING, AutonomyDecision.AUTONOMOUS,
        TriageConfidence.HIGH, 'data-testid missing from DOM on first run. Bug report filed.');
    }
    // TestId present on first run — this is baseline establishment, not a failure
    return buildResult(BugHuntCategory.UNCHANGED_FAILURE, null, TestIdStatus.PRESENT, AutonomyDecision.AUTONOMOUS,
      TriageConfidence.LOW, 'First run — testid present but test still failed. Treating as potential bug.');
  }

  // Subsequent runs: can detect CHANGED
  if (!input.testIdNewValue && !input.testIdOldValue) {
    // Never existed
    return buildResult(BugHuntCategory.TESTID_MISSING, null, TestIdStatus.MISSING, AutonomyDecision.AUTONOMOUS,
      TriageConfidence.HIGH, 'data-testid never existed on this element. Bug report — missing testid.');
  }

  if (input.testIdOldValue && !input.testIdNewValue) {
    // Was there, now gone
    return buildResult(BugHuntCategory.TESTID_MISSING, null, TestIdStatus.MISSING, AutonomyDecision.AUTONOMOUS,
      TriageConfidence.HIGH, `data-testid "${input.testIdOldValue}" disappeared from DOM. Bug report.`);
  }

  if (input.testIdOldValue && input.testIdNewValue && input.testIdOldValue !== input.testIdNewValue) {
    // Changed value
    return buildResult(BugHuntCategory.TESTID_CHANGED, null, TestIdStatus.CHANGED, AutonomyDecision.HUMAN_REVIEW,
      TriageConfidence.MEDIUM, `data-testid changed: "${input.testIdOldValue}" → "${input.testIdNewValue}". Could be known change or bug — user review required.`);
  }

  // Fallback: testid present and unchanged but still failing
  return buildResult(BugHuntCategory.UNCHANGED_FAILURE, null, TestIdStatus.PRESENT, AutonomyDecision.AUTONOMOUS,
    TriageConfidence.MEDIUM, 'data-testid present and unchanged but test failed. Likely an application bug.');
}

/** Check if failure is infrastructure-only (network 500 with no other DOM/console evidence). */
function isInfrastructureTransient(signals: TriageSignal[]): boolean {
  const networkSignals = signals.filter(s =>
    ['SIG-NETWORK-500', 'SIG-NETWORK-4XX'].includes(s.signalId)
  );
  const otherSignals = signals.filter(s =>
    !['SIG-NETWORK-500', 'SIG-NETWORK-4XX', 'SIG-INFRA'].includes(s.signalId)
  );
  return networkSignals.length > 0 && otherSignals.length === 0;
}

/** Determine change size based on affected files and selectors vs thresholds. */
export function classifyChangeSize(
  affectedSelectors: string[],
  affectedFiles: string[],
  thresholds: ChangeSizeThreshold,
): ChangeSize {
  if (affectedFiles.length > thresholds.maxFilesForSmall || affectedSelectors.length > thresholds.maxSelectorsForSmall) {
    return ChangeSize.BIG;
  }
  return ChangeSize.SMALL;
}

/** Determine if system handles autonomously or needs human review. */
export function determineAutonomy(category: BugHuntCategory): AutonomyDecision {
  const AUTONOMY_MAP: Record<BugHuntCategory, AutonomyDecision> = {
    [BugHuntCategory.UNCHANGED_FAILURE]: AutonomyDecision.AUTONOMOUS,
    [BugHuntCategory.TESTID_MISSING]: AutonomyDecision.AUTONOMOUS,
    [BugHuntCategory.TESTID_CHANGED]: AutonomyDecision.HUMAN_REVIEW,
    [BugHuntCategory.FEATURE_CHANGED_SMALL]: AutonomyDecision.AUTONOMOUS,
    [BugHuntCategory.FEATURE_CHANGED_BIG]: AutonomyDecision.HUMAN_REVIEW,
    [BugHuntCategory.FLAKE]: AutonomyDecision.AUTONOMOUS,
    [BugHuntCategory.INFRASTRUCTURE_TRANSIENT]: AutonomyDecision.AUTONOMOUS,
  };
  return AUTONOMY_MAP[category];
}

// ── Dedup ──

/** Generate an error hash for deduplication. */
export function computeErrorHash(testName: string, failureCategory: string, errorMessage: string): string {
  const input = `${testName}::${failureCategory}::${errorMessage.slice(0, 200)}`;
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

/** Check if a bug report with this errorHash already exists. Returns the existing bug or null. */
export function findExistingBug(errorHash: string, bugReportDir: string): BugReport | null {
  if (!fs.existsSync(bugReportDir)) return null;

  const files = fs.readdirSync(bugReportDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(bugReportDir, file), 'utf-8');
      const report: BugReport = JSON.parse(content);
      if (report.errorHash === errorHash && report.status !== 'closed' && report.status !== 'not_a_bug') {
        return report;
      }
    } catch {
      // Skip corrupted files
    }
  }
  return null;
}

// ── Flake Promotion ──

/**
 * Check if a flake should be auto-promoted to a real bug.
 * Returns true if the same errorHash appears >= promotionThreshold times
 * in the last promotionWindow runs.
 */
export function checkFlakePromotion(
  testName: string,
  errorHash: string,
  history: FailureHistoryEntry[],
  config: FlakeConfig,
): boolean {
  const recentForTest = history
    .filter(h => h.testName === testName && h.errorHash === errorHash)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, config.promotionWindow);

  return recentForTest.length >= config.promotionThreshold;
}

// ── Internal ──

function buildResult(
  category: BugHuntCategory,
  changeSize: ChangeSize | null,
  testIdStatus: TestIdStatus | null,
  autonomy: AutonomyDecision,
  confidence: TriageConfidence,
  reasoning: string,
): BugHuntClassification {
  return {
    bugHuntCategory: category,
    disposition: BUG_HUNT_TO_DISPOSITION[category],
    changeSize,
    testIdStatus,
    autonomyDecision: autonomy,
    confidence,
    reasoning,
  };
}
