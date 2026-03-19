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
  status: 'open' | 'confirmed' | 'fixed' | 'wont_fix' | 'not_a_bug';
  createdAt: string;
  queueItemId: string;
}

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
}
