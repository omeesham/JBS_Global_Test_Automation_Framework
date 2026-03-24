/**
 * @agent-doc
 * PURPOSE: Runtime diagnostics collector -- attaches page listeners for console, network, page errors and auth chain. Provides snapshots for AgentReporter enrichment.
 * OWNER: human-only
 * IMPACT: medium - Captures diagnostic evidence during test runs. Does not affect test behavior.
 * DEPENDS-ON: @playwright/test (Page), framework-contracts/diagnostics.ts
 * USED-BY: tests/setup/fixtures.ts (authenticatedSession), src/utils/agent-reporter.ts
 * RULES: Listeners must never throw -- wrap in try/catch. Body reads may fail for WebSocket/redirect responses. Keep networkFailures filtered to 4xx/5xx only.
 */

import type { Page, ConsoleMessage, Response, Request } from '@playwright/test';
import {
  FailureCategory,
  type NetworkFailure,
  type ConsoleEntry,
  type AuthChainEntry,
  type DiagnosticSnapshot,
  type UrlBreadcrumb,
  type HarEntry,
} from '../framework-contracts/diagnostics';

/** Max response body length to capture (2KB). */
const MAX_BODY_LENGTH = 2048;

/** Known selector prefixes -- mirrors agent-reporter.ts list. */
const SELECTOR_PREFIXES = ['btn', 'txt', 'drp', 'chk', 'lnk', 'rdo', 'dlg', 'tbl', 'err', 'col', 'spin', 'tab', 'pnl'];

/**
 * Collects runtime diagnostic data from a Playwright page.
 * Attach once per worker via `attachDiagnostics(page)`. Retrieve snapshot via `getSnapshot()`.
 */
export class DiagnosticsCollector {
  private consoleEntries: ConsoleEntry[] = [];
  private networkFailures: NetworkFailure[] = [];
  private pageErrors: string[] = [];
  private urlHistory: string[] = [];
  private urlBreadcrumbs: UrlBreadcrumb[] = [];
  private authChain: AuthChainEntry[] = [];
  /** All HTTP responses (for HAR context window around failures). */
  private allResponses: HarEntry[] = [];

  constructor(private readonly page: Page) {
    this.attachListeners();
  }

  // ---- Listeners ----

  private attachListeners(): void {
    this.page.on('console', (msg: ConsoleMessage) => {
      try {
        this.consoleEntries.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location() ? `${msg.location().url}:${msg.location().lineNumber}` : '',
          timestamp: Date.now(),
        });
      } catch { /* never throw from listener */ }
    });

    this.page.on('pageerror', (error: Error) => {
      try {
        this.pageErrors.push(error.message || String(error));
      } catch { /* never throw from listener */ }
    });

    this.page.on('response', async (response: Response) => {
      try {
        const status = response.status();
        const url = response.url();

        // Track auth chain entries (any response from login.microsoftonline.com, b2clogin.com, or oauth URLs)
        if (url.includes('login.microsoftonline.com') || url.includes('b2clogin.com') || url.includes('oauth')) {
          this.authChain.push({
            url,
            status,
            redirectedFrom: response.request().redirectedFrom()?.url() ?? null,
            timestamp: Date.now(),
          });
        }

        // Track all responses for HAR context window
        try {
          const req = response.request();
          this.allResponses.push({
            url,
            method: req.method(),
            status,
            timestamp: Date.now(),
            duration: 0, // precise timing not available from listener
          });
        } catch { /* best-effort HAR tracking */ }

        // Only persist 4xx/5xx failures
        if (status >= 400) {
          let body = '';
          try {
            body = (await response.text()).substring(0, MAX_BODY_LENGTH);
          } catch { /* WebSocket upgrade, redirect -- body unavailable */ }

          this.networkFailures.push({
            url,
            status,
            statusText: response.statusText(),
            body,
            timestamp: Date.now(),
          });
        }
      } catch { /* never throw from listener */ }
    });

    this.page.on('requestfailed', (request: Request) => {
      try {
        const failure = request.failure();
        this.networkFailures.push({
          url: request.url(),
          status: 0,
          statusText: failure?.errorText ?? 'Request failed',
          body: '',
          timestamp: Date.now(),
        });
      } catch { /* never throw from listener */ }
    });

    // C3: Auto URL tracking -- capture every main-frame navigation automatically
    this.page.on('framenavigated', (frame) => {
      try {
        if (frame === this.page.mainFrame()) {
          this.urlBreadcrumbs.push({ url: frame.url(), timestamp: Date.now() });
        }
      } catch { /* never throw from listener */ }
    });
  }

  // ---- URL tracking ----

  /** Record current page URL at a key moment (call after goto, after login, on error). */
  recordUrl(): void {
    try {
      this.urlHistory.push(this.page.url());
    } catch { /* page may be closed */ }
  }

  // ---- Filtered accessors ----

  /** All network failures (4xx/5xx + request failures). */
  getNetworkFailures(): NetworkFailure[] {
    return this.networkFailures;
  }

  /** Console entries filtered to 'error' and 'warning' types only. */
  getConsoleErrors(): ConsoleEntry[] {
    return this.consoleEntries.filter(e => e.type === 'error' || e.type === 'warning');
  }

  /** C2: All console entries including info level -- API responses, routing info, SPA state changes. */
  getConsoleLogs(): ConsoleEntry[] {
    return this.consoleEntries.filter(e => e.type === 'error' || e.type === 'warning' || e.type === 'info');
  }

  /** C3: Full URL navigation breadcrumbs with timestamps. */
  getUrlBreadcrumbs(): UrlBreadcrumb[] {
    return [...this.urlBreadcrumbs];
  }

  /** Full auth chain (all responses from auth-related URLs). */
  getAuthChain(): AuthChainEntry[] {
    return this.authChain;
  }

  // ---- HAR & DOM capture ----

  /**
   * Capture HAR entries: all FAILED requests (4xx/5xx) plus 5 requests before and after each failure
   * for context. Respects HAR_MAX_SIZE env (default 1MB = 1048576 bytes).
   */
  captureHar(): HarEntry[] {
    const maxSize = parseInt(process.env.HAR_MAX_SIZE ?? '1048576', 10);
    const failedIndices: number[] = [];

    // Find indices of failed responses
    for (let i = 0; i < this.allResponses.length; i++) {
      const resp = this.allResponses[i];
      if (resp && resp.status >= 400) {
        failedIndices.push(i);
      }
    }

    if (failedIndices.length === 0) return [];

    // Build context window: include 5 before and 5 after each failure
    const includeIndices = new Set<number>();
    for (const idx of failedIndices) {
      for (let j = Math.max(0, idx - 5); j <= Math.min(this.allResponses.length - 1, idx + 5); j++) {
        includeIndices.add(j);
      }
    }

    const entries: HarEntry[] = [];
    let totalSize = 0;

    for (const idx of Array.from(includeIndices).sort((a, b) => a - b)) {
      const entry = this.allResponses[idx];
      if (!entry) continue;
      const entrySize = JSON.stringify(entry).length;
      if (totalSize + entrySize > maxSize) break;
      entries.push(entry);
      totalSize += entrySize;
    }

    return entries;
  }

  /**
   * Capture full DOM serialization as a string via page.evaluate.
   * Higher size limit than domSnippet (50KB vs 10KB).
   * Returns empty string if page is closed or evaluation fails.
   */
  async captureDomState(): Promise<string> {
    try {
      const dom = await this.page.evaluate(() => document.documentElement.outerHTML);
      return (dom ?? '').substring(0, 51_200); // 50KB cap
    } catch {
      return '';
    }
  }

  // ---- Summaries ----

  /** Human-readable summary of API errors (4xx/5xx) for agent diagnostics. */
  getNetworkErrorSummary(): string {
    const errors = this.networkFailures.filter(n => n.status >= 400);
    if (errors.length === 0) return 'No API errors';
    return errors.map(e => `${e.status} ${e.url.split('/').pop()}: ${e.body.substring(0, 200)}`).join('\n');
  }

  // ---- Snapshot ----

  /** Returns full diagnostic snapshot for attachment/persistence. */
  getSnapshot(): DiagnosticSnapshot {
    return {
      consoleErrors: this.getConsoleLogs(),
      networkFailures: [...this.networkFailures],
      pageErrors: [...this.pageErrors],
      urlHistory: [...this.urlHistory],
      urlBreadcrumbs: this.getUrlBreadcrumbs(),
      authChain: [...this.authChain],
    };
  }

  // ---- Classification ----

  /**
   * Classify a failure error string + collected evidence into a FailureCategory.
   * Priority-ordered pattern matching per §12 RCA Protocol.
   */
  classifyFailure(errorMsg: string): FailureCategory {
    const lower = errorMsg.toLowerCase();

    // P1: Auth failures
    if (
      lower.includes('login.microsoftonline.com') ||
      lower.includes('b2clogin.com') ||
      lower.includes('oauth') ||
      lower.includes('401') ||
      lower.includes('403') ||
      this.networkFailures.some(n =>
        (n.url.includes('login.microsoftonline.com') || n.url.includes('b2clogin.com') || n.url.includes('oauth')) && n.status >= 400
      )
    ) {
      return FailureCategory.AUTH;
    }

    // P2: Network/API failures (non-auth)
    if (this.networkFailures.some(n => n.status >= 400 && !n.url.includes('login.microsoftonline.com'))) {
      return FailureCategory.NETWORK;
    }

    // P3: Selector issues
    const selectorPattern = new RegExp(`['"\`]((?:${SELECTOR_PREFIXES.join('|')})[A-Z]\\w+)['"\`]`);
    if (selectorPattern.test(errorMsg) || lower.includes('locator') || lower.includes('selector')) {
      return FailureCategory.SELECTOR;
    }

    // P4: Timing issues
    if (lower.includes('timeout') || lower.includes('waiting for')) {
      return FailureCategory.TIMING;
    }

    // P5: Infrastructure
    if (lower.includes('browser has been closed') || lower.includes('context closed') || lower.includes('target closed')) {
      return FailureCategory.INFRASTRUCTURE;
    }

    // P6: Application errors (SPA crashes, unhandled rejections)
    if (
      this.pageErrors.length > 0 ||
      this.consoleEntries.some(e => e.type === 'error' && (e.text.includes('unhandled') || e.text.includes('Uncaught')))
    ) {
      return FailureCategory.APPLICATION;
    }

    // P6.5: Data issues
    if (lower.includes('expected') && lower.includes('received') && !selectorPattern.test(errorMsg)) {
      return FailureCategory.DATA;
    }

    return FailureCategory.UNKNOWN;
  }
}

/**
 * Factory -- attaches diagnostic listeners to a page and returns the collector.
 * Stores collector on the page object for later retrieval.
 */
export function attachDiagnostics(page: Page): DiagnosticsCollector {
  const collector = new DiagnosticsCollector(page);
  // Store on page for retrieval in test-scoped fixtures
  (page as unknown as Record<string, unknown>).__diagnosticsCollector = collector;
  return collector;
}
