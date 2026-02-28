/**
 * @agent-doc
 * PURPOSE: Diagnostic types for runtime failure capture -- console errors, network failures, auth chain, page errors.
 * OWNER: human-only
 * IMPACT: medium - Used by DiagnosticsCollector and AgentReporter for structured failure data.
 * DEPENDS-ON: none
 * USED-BY: src/utils/diagnostics-collector.ts, src/utils/agent-reporter.ts, tests/setup/fixtures.ts
 * RULES: Keep types aligned with AgentReporter FailureEntry fields. FailureCategory values must match AGENT_SHARED_RULES §15.
 */

/** Failure classification categories -- used for agent routing in RCA protocol (§15). */
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
