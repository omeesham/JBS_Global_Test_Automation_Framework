/**
 * @agent-doc
 * PURPOSE: Diagnostic types for runtime failure capture -- console errors, network failures, auth chain, page errors.
 * OWNER: human-only
 * IMPACT: medium - Used by DiagnosticsCollector and AgentReporter for structured failure data.
 * DEPENDS-ON: none
 * USED-BY: src/utils/diagnostics-collector.ts, src/utils/agent-reporter.ts, tests/setup/fixtures.ts
 * RULES: Keep types aligned with AgentReporter FailureEntry fields. FailureCategory values must match AGENT_SHARED_RULES §12.
 */

/** Failure classification categories -- used for agent routing in RCA protocol (§12). */
export enum FailureCategory {
  AUTH = 'AUTH',
  NETWORK = 'NETWORK',
  SELECTOR = 'SELECTOR',
  TIMING = 'TIMING',
  APPLICATION = 'APPLICATION',
  DATA = 'DATA',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  UNKNOWN = 'UNKNOWN',
}

/** Captured 4xx/5xx HTTP response or failed request. */
export interface NetworkFailure {
  url: string;
  status: number;
  statusText: string;
  /** Response body, truncated to 2KB. */
  body: string;
  timestamp: number;
}

/** Browser console message (all types captured, filtered on retrieval). */
export interface ConsoleEntry {
  type: string;        // 'error' | 'warning' | 'log' | 'info'
  text: string;
  location: string;
  timestamp: number;
}

/** Single entry in the OAuth redirect chain. */
export interface AuthChainEntry {
  url: string;
  status: number;
  redirectedFrom: string | null;
  timestamp: number;
}

/** URL navigation breadcrumb with timestamp. */
export interface UrlBreadcrumb {
  url: string;
  timestamp: number;
}

// ── Triage & Bug Detection (48D) ──

/** Triage disposition — what kind of failure is this? */
export enum TriageDisposition {
  BUG = 'BUG',
  FEATURE_CHANGE = 'FEATURE_CHANGE',
  TEST_DEFECT = 'TEST_DEFECT',
  UNCERTAIN = 'UNCERTAIN',
}

/** Confidence in triage classification. */
export enum TriageConfidence { HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW' }

/** Bug severity when triage = BUG. */
export enum BugSeverity { CRITICAL = 'CRITICAL', HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW' }

/** Individual signal contributing to a triage decision. */
export interface TriageSignal {
  signalId: string;
  weight: 'strong' | 'moderate' | 'weak';
  direction: TriageDisposition;
  evidence: string;
}

/** Complete triage result for a single failure. */
export interface TriageResult {
  disposition: TriageDisposition;
  confidence: TriageConfidence;
  reasoning: string;
  signals: TriageSignal[];
  mcpVerified: boolean;
  tcExpectedValue: string | null;
  actualValue: string | null;
  changeDescription: string | null;
  bugSeverity: BugSeverity | null;
  /** Detailed classification from 4-category rulebook. When present, takes precedence over disposition. */
  bugHuntCategory?: BugHuntCategory;
  /** Feature change magnitude (only set when bugHuntCategory is FEATURE_CHANGED_*). */
  changeSize?: ChangeSize;
  /** Test-ID status (only set when bugHuntCategory is TESTID_*). */
  testIdStatus?: TestIdStatus;
  /** Whether this was auto-decided or needs human review. */
  autonomyDecision?: AutonomyDecision;
}

/** Structured bug report for application bugs discovered during test healing. */
export interface BugReport {
  id: string;
  testCaseId: string;
  testFile: string;
  module: string;
  feature: string;
  severity: BugSeverity;
  title: string;
  description: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  pageUrl: string;
  screenshotPath: string | null;
  failureCategory: FailureCategory;
  triageResult: TriageResult;
  status: BugStatus;
  createdAt: string;
  queueItemId: string;
  /** Which agent filed this bug (healer, generator, planner). */
  sourceAgent?: string;
  /** Hash for dedup: hash(testName + failureCategory + truncatedError). */
  errorHash?: string;
  /** Detailed bug hunt classification. */
  bugHuntCategory?: BugHuntCategory;
  /** Full RCA evidence JSONB for rich display. */
  rcaEvidence?: {
    consoleErrors?: string[];
    networkFailures?: string[];
    domSnippet?: string;
    screenshotUrl?: string;
    traceUrl?: string;
    harEntries?: string[];
  };
  /** Pipeline run ID. */
  runId?: string;
  /** Confidence level (LOW when from force-continued runs). */
  confidence?: TriageConfidence;
  updatedAt?: string;
}

/** Bug lifecycle status — from discovery to verified resolution. */
export type BugStatus = 'open' | 'confirmed' | 'in_progress' | 'fixed' | 'verified' | 'closed' | 'wont_fix' | 'not_a_bug';

/** Single failure item in a triage report — includes plain English RCA for non-technical users. */
export interface TriageItem {
  testName: string;
  testFile: string;
  pageUrl: string;
  failureCategory: FailureCategory;
  triage: TriageResult;
  /** Plain English: what happened (1-2 sentences a non-technical person can understand). */
  whatHappened: string;
  /** Plain English: why it happened (root cause in plain language). */
  whyItHappened: string;
  /** Plain English: recommended action for the user. */
  whatToDo: string;
}

/** Group of failures sharing the same root cause. */
export interface TriageGroup {
  rootCause: string;
  disposition: TriageDisposition;
  confidence: TriageConfidence;
  severity: BugSeverity | null;
  items: TriageItem[];
}

/** Complete triage report for a pipeline run — produced by Audit agent Mode 5. */
export interface TriageReport {
  runId: string;
  timestamp: string;
  totalFailures: number;
  groups: TriageGroup[];
  summary: {
    bugs: number;
    featureChanges: number;
    testDefects: number;
    uncertain: number;
  };
  mcpVerificationAvailable: boolean;
}

/** Aggregated diagnostic data from a single worker/page session. */
export interface DiagnosticSnapshot {
  consoleErrors: ConsoleEntry[];
  networkFailures: NetworkFailure[];
  pageErrors: string[];
  urlHistory: string[];
  urlBreadcrumbs: UrlBreadcrumb[];
  authChain: AuthChainEntry[];
  /** DOM content at failure time, truncated to 50KB. Only populated on test failure. */
  domSnippet?: string;
  /** HAR entries: failed requests + surrounding context. Optional, controlled by HAR_MAX_SIZE env. */
  harEntries?: HarEntry[];
  /** Full DOM serialization at failure point. Optional. */
  domState?: string;
}

/** Single HAR entry — captured for failed requests + context. */
export interface HarEntry {
  url: string;
  method: string;
  status: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  timestamp: number;
  duration: number;
}

// ── Bug Hunt Classification (4-Category Rulebook) ──

/**
 * Detailed bug hunt classification — extends the coarse TriageDisposition.
 * Maps to disposition for backward compat:
 *   UNCHANGED_FAILURE, TESTID_MISSING → BUG
 *   TESTID_CHANGED, FEATURE_CHANGED_SMALL, FEATURE_CHANGED_BIG → FEATURE_CHANGE
 *   FLAKE, INFRASTRUCTURE_TRANSIENT → TEST_DEFECT
 */
export enum BugHuntCategory {
  /** Feature intact, test fails (console/network/value errors) — this IS a bug. */
  UNCHANGED_FAILURE = 'UNCHANGED_FAILURE',
  /** Feature change, small scope (≤ threshold) — heal autonomously. */
  FEATURE_CHANGED_SMALL = 'FEATURE_CHANGED_SMALL',
  /** Feature change, big scope (> threshold) — deny, escalate to prior agents. */
  FEATURE_CHANGED_BIG = 'FEATURE_CHANGED_BIG',
  /** data-testid gone or never existed — report bug. */
  TESTID_MISSING = 'TESTID_MISSING',
  /** data-testid value changed — report + adapt, user reviews. */
  TESTID_CHANGED = 'TESTID_CHANGED',
  /** Transient failure, passes on retry — not a bug, track for flake patterns. */
  FLAKE = 'FLAKE',
  /** Network-only failure with no DOM evidence — retry once before classifying. */
  INFRASTRUCTURE_TRANSIENT = 'INFRASTRUCTURE_TRANSIENT',
}

/** Change magnitude for feature change classification. */
export enum ChangeSize {
  SMALL = 'SMALL',
  BIG = 'BIG',
}

/** Test-ID (data-testid) status for selector tracking. */
export enum TestIdStatus {
  PRESENT = 'PRESENT',
  MISSING = 'MISSING',
  CHANGED = 'CHANGED',
}

/** Whether the system handles this autonomously or requires human review. */
export enum AutonomyDecision {
  AUTONOMOUS = 'AUTONOMOUS',
  HUMAN_REVIEW = 'HUMAN_REVIEW',
}

/** Maps BugHuntCategory to coarse TriageDisposition for backward compat. */
export const BUG_HUNT_TO_DISPOSITION: Record<BugHuntCategory, TriageDisposition> = {
  [BugHuntCategory.UNCHANGED_FAILURE]: TriageDisposition.BUG,
  [BugHuntCategory.TESTID_MISSING]: TriageDisposition.BUG,
  [BugHuntCategory.TESTID_CHANGED]: TriageDisposition.FEATURE_CHANGE,
  [BugHuntCategory.FEATURE_CHANGED_SMALL]: TriageDisposition.FEATURE_CHANGE,
  [BugHuntCategory.FEATURE_CHANGED_BIG]: TriageDisposition.FEATURE_CHANGE,
  [BugHuntCategory.FLAKE]: TriageDisposition.TEST_DEFECT,
  [BugHuntCategory.INFRASTRUCTURE_TRANSIENT]: TriageDisposition.TEST_DEFECT,
};

/** Inter-agent notification for stale artifacts, selector changes, or escalations. */
export interface AgentNotification {
  id: string;
  fromAgent: string;
  toAgent: string;
  type: 'stale_artifact' | 'selector_change' | 'big_change_escalation';
  affectedFiles: string[];
  changeSummary: string;
  timestamp: string;
  acknowledged: boolean;
}

/** Escalation request when a change is too big for current agent to handle. */
export interface BugHuntEscalation {
  id: string;
  sourceAgent: string;
  targetAgent: string;
  reason: string;
  changeScopeFiles: string[];
  affectedSelectors: string[];
  blockedItemId: string;
  pageId?: string;
  status: 'open' | 'resolved' | 'overridden' | 'rework_in_progress';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

/** Test-ID tracking entry for the selector registry. */
export interface TestIdTracker {
  selectorKey: string;
  expectedTestId: string;
  actualTestId: string | null;
  status: TestIdStatus;
  lastVerified: string;
  pageUrl: string;
}

/** Complete bug hunt classification result from the classifier. */
export interface BugHuntClassification {
  bugHuntCategory: BugHuntCategory;
  disposition: TriageDisposition;
  changeSize: ChangeSize | null;
  testIdStatus: TestIdStatus | null;
  autonomyDecision: AutonomyDecision;
  confidence: TriageConfidence;
  reasoning: string;
}
