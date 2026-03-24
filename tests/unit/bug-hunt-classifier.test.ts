/**
 * Unit tests for bug-hunt-classifier.ts — 4-Category Bug Hunting Rulebook.
 * Tests every category, edge case, dedup, and flake promotion.
 */

import {
  classifyBugHuntCategory,
  classifyChangeSize,
  determineAutonomy,
  computeErrorHash,
  checkFlakePromotion,
  ClassifierInput,
  ChangeSizeThreshold,
  FailureHistoryEntry,
} from '../../src/utils/bug-hunt-classifier';
import {
  BugHuntCategory,
  ChangeSize,
  TestIdStatus,
  AutonomyDecision,
  TriageDisposition,
  TriageConfidence,
} from '../../src/framework-contracts/diagnostics';

const DEFAULT_THRESHOLDS: ChangeSizeThreshold = { maxFilesForSmall: 3, maxSelectorsForSmall: 5 };

function makeInput(overrides: Partial<ClassifierInput> = {}): ClassifierInput {
  return {
    signals: [],
    isTestIdFailure: false,
    testIdOldValue: null,
    testIdNewValue: null,
    affectedSelectors: [],
    affectedFiles: [],
    passedOnRetry: false,
    retryAttempt: 0,
    isFirstRun: false,
    testName: 'TC-TEST-001',
    errorMessage: 'some error',
    ...overrides,
  };
}

// ── Category 1: Feature Changed ──

describe('FEATURE_CHANGED_SMALL', () => {
  it('classifies small feature change (within thresholds)', () => {
    const result = classifyBugHuntCategory(makeInput({
      signals: [{ signalId: 'SIG-LABEL-CHANGE', weight: 'moderate', direction: TriageDisposition.FEATURE_CHANGE, evidence: 'label changed' }],
      affectedSelectors: ['btn1', 'btn2'],
      affectedFiles: ['file1.ts'],
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.FEATURE_CHANGED_SMALL);
    expect(result.disposition).toBe(TriageDisposition.FEATURE_CHANGE);
    expect(result.changeSize).toBe(ChangeSize.SMALL);
    expect(result.autonomyDecision).toBe(AutonomyDecision.AUTONOMOUS);
  });
});

describe('FEATURE_CHANGED_BIG', () => {
  it('classifies big feature change (exceeds file threshold)', () => {
    const result = classifyBugHuntCategory(makeInput({
      signals: [{ signalId: 'SIG-LAYOUT-CHANGE', weight: 'strong', direction: TriageDisposition.FEATURE_CHANGE, evidence: 'layout restructured' }],
      affectedSelectors: ['s1', 's2'],
      affectedFiles: ['f1.ts', 'f2.ts', 'f3.ts', 'f4.ts'],
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.FEATURE_CHANGED_BIG);
    expect(result.changeSize).toBe(ChangeSize.BIG);
    expect(result.autonomyDecision).toBe(AutonomyDecision.HUMAN_REVIEW);
  });

  it('classifies big feature change (exceeds selector threshold)', () => {
    const result = classifyBugHuntCategory(makeInput({
      signals: [{ signalId: 'SIG-SELECTOR-GONE', weight: 'moderate', direction: TriageDisposition.FEATURE_CHANGE, evidence: '6 selectors gone' }],
      affectedSelectors: ['s1', 's2', 's3', 's4', 's5', 's6'],
      affectedFiles: ['f1.ts'],
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.FEATURE_CHANGED_BIG);
    expect(result.changeSize).toBe(ChangeSize.BIG);
  });
});

// ── Category 2: Test-ID Failures ──

describe('TESTID_MISSING', () => {
  it('classifies missing testid (never existed)', () => {
    const result = classifyBugHuntCategory(makeInput({
      isTestIdFailure: true,
      testIdOldValue: null,
      testIdNewValue: null,
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.TESTID_MISSING);
    expect(result.disposition).toBe(TriageDisposition.BUG);
    expect(result.testIdStatus).toBe(TestIdStatus.MISSING);
    expect(result.autonomyDecision).toBe(AutonomyDecision.AUTONOMOUS);
  });

  it('classifies missing testid (was present, now gone)', () => {
    const result = classifyBugHuntCategory(makeInput({
      isTestIdFailure: true,
      testIdOldValue: 'btnSave',
      testIdNewValue: null,
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.TESTID_MISSING);
    expect(result.testIdStatus).toBe(TestIdStatus.MISSING);
  });
});

describe('TESTID_CHANGED', () => {
  it('classifies changed testid', () => {
    const result = classifyBugHuntCategory(makeInput({
      isTestIdFailure: true,
      testIdOldValue: 'drpCurrency',
      testIdNewValue: 'drpCurrencySelector',
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.TESTID_CHANGED);
    expect(result.disposition).toBe(TriageDisposition.FEATURE_CHANGE);
    expect(result.testIdStatus).toBe(TestIdStatus.CHANGED);
    expect(result.autonomyDecision).toBe(AutonomyDecision.HUMAN_REVIEW);
  });

  it('cannot detect TESTID_CHANGED on first run', () => {
    const result = classifyBugHuntCategory(makeInput({
      isTestIdFailure: true,
      isFirstRun: true,
      testIdOldValue: null,
      testIdNewValue: null,
    }), DEFAULT_THRESHOLDS);

    // On first run with no testid: MISSING, not CHANGED
    expect(result.bugHuntCategory).toBe(BugHuntCategory.TESTID_MISSING);
  });
});

// ── Category 3: Unchanged Failure (Real Bug) ──

describe('UNCHANGED_FAILURE', () => {
  it('classifies console error with no change signals as bug', () => {
    const result = classifyBugHuntCategory(makeInput({
      signals: [{ signalId: 'SIG-CONSOLE-ERROR', weight: 'strong', direction: TriageDisposition.BUG, evidence: 'TypeError' }],
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.UNCHANGED_FAILURE);
    expect(result.disposition).toBe(TriageDisposition.BUG);
    expect(result.autonomyDecision).toBe(AutonomyDecision.AUTONOMOUS);
  });

  it('classifies network 500 + value mismatch as bug', () => {
    const result = classifyBugHuntCategory(makeInput({
      signals: [
        { signalId: 'SIG-NETWORK-500', weight: 'strong', direction: TriageDisposition.BUG, evidence: '500 on POST /api/settings' },
        { signalId: 'SIG-VALUE-MISMATCH', weight: 'strong', direction: TriageDisposition.BUG, evidence: 'expected "Active", got "Error"' },
      ],
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.UNCHANGED_FAILURE);
  });
});

// ── Flake / Infrastructure ──

describe('FLAKE', () => {
  it('classifies passed-on-retry as flake', () => {
    const result = classifyBugHuntCategory(makeInput({
      passedOnRetry: true,
      retryAttempt: 1,
      signals: [{ signalId: 'SIG-NETWORK-500', weight: 'strong', direction: TriageDisposition.BUG, evidence: 'transient 500' }],
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.FLAKE);
    expect(result.autonomyDecision).toBe(AutonomyDecision.AUTONOMOUS);
  });
});

describe('INFRASTRUCTURE_TRANSIENT', () => {
  it('classifies network-only failure as infra transient', () => {
    const result = classifyBugHuntCategory(makeInput({
      signals: [{ signalId: 'SIG-NETWORK-500', weight: 'strong', direction: TriageDisposition.BUG, evidence: '503 server overloaded' }],
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.INFRASTRUCTURE_TRANSIENT);
    expect(result.autonomyDecision).toBe(AutonomyDecision.AUTONOMOUS);
  });

  it('does NOT classify as infra if console error also present', () => {
    const result = classifyBugHuntCategory(makeInput({
      signals: [
        { signalId: 'SIG-NETWORK-500', weight: 'strong', direction: TriageDisposition.BUG, evidence: '500' },
        { signalId: 'SIG-CONSOLE-ERROR', weight: 'strong', direction: TriageDisposition.BUG, evidence: 'TypeError' },
      ],
    }), DEFAULT_THRESHOLDS);

    expect(result.bugHuntCategory).toBe(BugHuntCategory.UNCHANGED_FAILURE);
  });
});

// ── Utility Functions ──

describe('classifyChangeSize', () => {
  it('returns SMALL within thresholds', () => {
    expect(classifyChangeSize(['s1'], ['f1'], DEFAULT_THRESHOLDS)).toBe(ChangeSize.SMALL);
  });

  it('returns BIG when files exceed threshold', () => {
    expect(classifyChangeSize(['s1'], ['f1', 'f2', 'f3', 'f4'], DEFAULT_THRESHOLDS)).toBe(ChangeSize.BIG);
  });

  it('returns BIG when selectors exceed threshold', () => {
    expect(classifyChangeSize(['s1', 's2', 's3', 's4', 's5', 's6'], ['f1'], DEFAULT_THRESHOLDS)).toBe(ChangeSize.BIG);
  });
});

describe('determineAutonomy', () => {
  it('UNCHANGED_FAILURE = AUTONOMOUS', () => {
    expect(determineAutonomy(BugHuntCategory.UNCHANGED_FAILURE)).toBe(AutonomyDecision.AUTONOMOUS);
  });

  it('FEATURE_CHANGED_BIG = HUMAN_REVIEW', () => {
    expect(determineAutonomy(BugHuntCategory.FEATURE_CHANGED_BIG)).toBe(AutonomyDecision.HUMAN_REVIEW);
  });

  it('TESTID_CHANGED = HUMAN_REVIEW', () => {
    expect(determineAutonomy(BugHuntCategory.TESTID_CHANGED)).toBe(AutonomyDecision.HUMAN_REVIEW);
  });
});

describe('computeErrorHash', () => {
  it('produces consistent hash for same input', () => {
    const h1 = computeErrorHash('TC-001', 'SELECTOR', 'element not found');
    const h2 = computeErrorHash('TC-001', 'SELECTOR', 'element not found');
    expect(h1).toBe(h2);
  });

  it('produces different hash for different input', () => {
    const h1 = computeErrorHash('TC-001', 'SELECTOR', 'element not found');
    const h2 = computeErrorHash('TC-002', 'SELECTOR', 'element not found');
    expect(h1).not.toBe(h2);
  });

  it('truncates long error messages', () => {
    const longError = 'x'.repeat(500);
    const hash = computeErrorHash('TC-001', 'SELECTOR', longError);
    expect(hash).toHaveLength(16);
  });
});

describe('checkFlakePromotion', () => {
  const config = { promotionThreshold: 3, promotionWindow: 5 };

  it('promotes when threshold met', () => {
    const history: FailureHistoryEntry[] = [
      { testName: 'TC-001', errorHash: 'abc', bugHuntCategory: 'FLAKE', runId: 'r1', createdAt: '2026-03-20T01:00:00Z' },
      { testName: 'TC-001', errorHash: 'abc', bugHuntCategory: 'FLAKE', runId: 'r2', createdAt: '2026-03-20T02:00:00Z' },
      { testName: 'TC-001', errorHash: 'abc', bugHuntCategory: 'FLAKE', runId: 'r3', createdAt: '2026-03-20T03:00:00Z' },
    ];
    expect(checkFlakePromotion('TC-001', 'abc', history, config)).toBe(true);
  });

  it('does not promote below threshold', () => {
    const history: FailureHistoryEntry[] = [
      { testName: 'TC-001', errorHash: 'abc', bugHuntCategory: 'FLAKE', runId: 'r1', createdAt: '2026-03-20T01:00:00Z' },
      { testName: 'TC-001', errorHash: 'abc', bugHuntCategory: 'FLAKE', runId: 'r2', createdAt: '2026-03-20T02:00:00Z' },
    ];
    expect(checkFlakePromotion('TC-001', 'abc', history, config)).toBe(false);
  });

  it('does not promote if different error hash', () => {
    const history: FailureHistoryEntry[] = [
      { testName: 'TC-001', errorHash: 'abc', bugHuntCategory: 'FLAKE', runId: 'r1', createdAt: '2026-03-20T01:00:00Z' },
      { testName: 'TC-001', errorHash: 'def', bugHuntCategory: 'FLAKE', runId: 'r2', createdAt: '2026-03-20T02:00:00Z' },
      { testName: 'TC-001', errorHash: 'ghi', bugHuntCategory: 'FLAKE', runId: 'r3', createdAt: '2026-03-20T03:00:00Z' },
    ];
    expect(checkFlakePromotion('TC-001', 'abc', history, config)).toBe(false);
  });
});
