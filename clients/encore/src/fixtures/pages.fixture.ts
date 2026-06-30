/** Custom Playwright test fixtures for dependency injection of page objects */

import { test as base, Page, BrowserContext } from '@playwright/test';
import { LocationCurrencyPage } from '../pages/locations/location-currency.page';
import { LocationLocalInfoPage } from '../pages/locations/location-local-info.page';
import { LocationPricingPage } from '../pages/locations/location-pricing.page';
import { LocationAccountAddressPage } from '../pages/locations/location-account-address.page';
import { LocationNotesPage } from '../pages/locations/location-notes.page';
import { LocationLegalPage } from '../pages/locations/location-legal.page';
import { LocationLeftPanelBasicInformationPage } from '../pages/locations/location-left-panel-basic-information.page';
import { LocationSharedSetupLocationsPage } from '../pages/locations/location-shared-setup-locations.page';
import { LocalOfficeSettingsPage } from '../pages/local-office/local-office-settings.page';
import { LocalOfficeHistoryPage } from '../pages/local-office/local-office-history.page';
import { LocalOfficeEctPage } from '../pages/local-office/local-office-ect.page';
import { LocationAutoAddonPage } from '../pages/locations/location-auto-addon.page';
import { LocationManagementHistoryPage } from '../pages/locations/location-management-history.page';
import { CorporatePricingBasePage } from '../pages/corporate-pricing/corporate-pricing.page';
import { CorporatePricingSearchPage } from '../pages/corporate-pricing/corporate-pricing-search.page';
import { CorporatePricingStrategyPage } from '../pages/corporate-pricing/corporate-pricing-strategy.page';
import { CorporatePricingDetailPage } from '../pages/corporate-pricing/corporate-pricing-detail.page';
import { CorporatePricingOverridePage } from '../pages/corporate-pricing/corporate-pricing-override.page';
import { CorporatePricingNewPricebookPage } from '../pages/corporate-pricing/corporate-pricing-new-pricebook.page';
import { CommonMethods } from '../utils/env-config';
import { Log } from '../utils/logger';
import { IConfig } from '../types';
import { CredentialLoader } from '../utils/credential-loader';
import { attachDiagnostics, DiagnosticsCollector } from '../utils/diagnostics-collector';
import * as fs from 'fs';
import * as path from 'path';
import {
  STATE_PATH,
  acquireLock,
  performSsoLogin,
  readEarliestSessionExpiry,
  validateState,
  writeStateAtomic,
} from '../utils/auth-storage';
import { dependencyGateExt } from './dependency-gate';

// Define worker-scoped fixtures (shared across tests in same worker)
type WorkerFixtures = {
  config: IConfig;
  authenticatedSession: { page: Page; context: BrowserContext };
};

// Define test-scoped fixtures (fresh instance per test)
type TestFixtures = {
  diagnosticsHandler: void;
  locationCurrencyPage: LocationCurrencyPage;
  locationLocalInfoPage: LocationLocalInfoPage;
  locationPricingPage: LocationPricingPage;
  locationAccountAddressPage: LocationAccountAddressPage;
  locationNotesPage: LocationNotesPage;
  locationLegalPage: LocationLegalPage;
  locationLeftPanelBasicInformationPage: LocationLeftPanelBasicInformationPage;
  locationSharedSetupLocationsPage: LocationSharedSetupLocationsPage;
  localOfficeSettingsPage: LocalOfficeSettingsPage;
  localOfficeHistoryPage: LocalOfficeHistoryPage;
  localOfficeEctPage: LocalOfficeEctPage;
  locationAutoAddonPage: LocationAutoAddonPage;
  locationManagementHistoryPage: LocationManagementHistoryPage;
  corporatePricingBasePage: CorporatePricingBasePage;
  corporatePricingSearchPage: CorporatePricingSearchPage;
  corporatePricingStrategyPage: CorporatePricingStrategyPage;
  corporatePricingDetailPage: CorporatePricingDetailPage;
  corporatePricingOverridePage: CorporatePricingOverridePage;
  corporatePricingNewPricebookPage: CorporatePricingNewPricebookPage;
  dependencyGate: (deps: string[]) => void;
};

/**
 * Extended test with custom fixtures
 * Usage: import { test, expect } from './fixtures';
 */
export const test = dependencyGateExt.extend<TestFixtures, WorkerFixtures>({
 /**
 * Diagnostics handler fixture (auto-use)
 * Reads from authenticatedSession.page (where collector is attached).
 * Runs for EVERY test — ensures diagnostics are captured even when
 * tests only use page object fixtures (locationPricingPage, etc.).
 */
  diagnosticsHandler: [async ({ authenticatedSession }, use, testInfo) => {
    const { page } = authenticatedSession;

    await use(undefined as unknown as void);

    // Group C-1 (lifecycle refactor 2026-05-21):
    // Best-effort page-topology check at fixture post-use. Detects context leaks that survive
    // teardown. Worker-scoped browser → contexts() is scoped to this worker.
    //
    // Known limitation (Phase 0 verification 2026-05-21): the bare-page-collision "bare page + page-object"
    // destructure collision pattern does NOT trigger this check, because Playwright tears down
    // the bare-page test-scoped context BEFORE this auto-use fixture's post-use code runs. The
    // structural defense for bare-page-collision is the Group E lint guard at pre-commit / pre-push.
    // This check IS still useful for: (a) contexts created by test code via explicit
    // browser.newContext() that aren't cleaned up; (b) future page-object code that
    // creates side-contexts; (c) any case where >1 context survives test teardown.
    {
      const browser = authenticatedSession.context.browser();
      const ctxList = browser ? browser.contexts() : [];
      if (ctxList.length > 1) {
        Log.warn(`[diag] multi-context detected count=${ctxList.length} test="${testInfo.title}"`);
        for (const ctx of ctxList) {
          const tag = ctx === authenticatedSession.context ? 'auth' : 'other';
          for (const pg of ctx.pages()) {
            Log.warn(`[diag]   ctx=${tag} url=${pg.url()}`);
          }
        }
      }
    }

 // Teardown — extract diagnostics from the CORRECT page (authenticatedSession.page)
    const collector = (page as unknown as Record<string, unknown>).__diagnosticsCollector as DiagnosticsCollector | undefined;
    if (collector) {
      collector.recordUrl();
      const snapshot = collector.getSnapshot();

      if (testInfo.status !== 'passed') {
        try {
          const domContent = await page.content();
          snapshot.domSnippet = domContent.slice(0, 50_000);
        } catch { /* page may be closed */ }

 // Generate for RCA Step 0.2
        try {
 // Extract failing selector from error (same prefixes as AgentReporter)
          const selectorPrefixes = ['btn', 'txt', 'drp', 'chk', 'lnk', 'rdo', 'dlg', 'tbl', 'err', 'col', 'spin', 'tab', 'pnl'];
          const errorText = testInfo.errors.map(e => e.message || '').join(' ');
          const selectorMatch = errorText.match(
            new RegExp(`['"\`]((?:${selectorPrefixes.join('|')})[A-Z]\\w+)['"\`]`)
          );
          const errorContext = await collector.generateErrorContext(testInfo.title, selectorMatch?.[1] ?? null);
          const ecPath = testInfo.outputPath('error-context.md');
          fs.writeFileSync(ecPath, errorContext, 'utf-8');
        } catch { /* best-effort — never block teardown */ }
      }

      testInfo.attach('diagnostics', {
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(snapshot)),
      });

 // Persist per-spec diagnostics file for failure analysis
      if (testInfo.status !== 'passed') {
        const specName = path.basename(testInfo.file, '.spec.ts');
        const diagDir = path.join(process.cwd(), 'reports', 'diagnostics');
        if (!fs.existsSync(diagDir)) fs.mkdirSync(diagDir, { recursive: true });
        const diagFile = path.join(diagDir, `${specName}.diagnostics.json`);
        try {
          let existing: { spec: string; tests: unknown[] } = { spec: specName, tests: [] };
          if (fs.existsSync(diagFile)) {
            existing = JSON.parse(fs.readFileSync(diagFile, 'utf-8'));
          }
          existing.tests.push({
            name: testInfo.title,
            status: testInfo.status,
            consoleErrors: snapshot.consoleErrors,
            networkFailures: snapshot.networkFailures,
            pageErrors: snapshot.pageErrors,
            pageUrl: snapshot.urlHistory.at(-1) ?? '',
            authChain: snapshot.authChain,
          });
          fs.writeFileSync(diagFile, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
        } catch { /* best-effort persistence */ }
      }
    }
  }, { auto: true }],

 /**
 * Configuration fixture (worker-scoped)
 * Loads environment config once per worker process for efficiency
 */
  config: [async ({}, use) => {
    const config = CommonMethods.initProp();
    await use(config);
  }, { scope: 'worker' }],

 /**
 * Authenticated session fixture (worker-scoped)
 *
 * AUTH-STATE-SHARED (2026-04-30):
 * Loads shared storageState from .auth/encore-state.json (created by the `setup` project).
 * Pre-test guard: validates state; on stale, acquires file-lock and refreshes (single re-login
 * across all workers). Falls back to fresh per-worker login only if state is missing entirely.
 */
  authenticatedSession: [async ({ browser, config }, use) => {
    const credentials = await CredentialLoader.loadCredentials({ type: 'env' });

    const newSharedContext = async () => {
      const ctx = fs.existsSync(STATE_PATH)
        ? await browser.newContext({ storageState: STATE_PATH })
        : await browser.newContext();
      const pg = await ctx.newPage();

      pg.on('dialog', async (dialog) => {
        if (dialog.type() === 'beforeunload') {
          const skip = (pg as unknown as Record<string, unknown>).__skipBeforeunloadAutoAccept;
          if (skip) {
            Log.info('[fixture] beforeunload dialog deferred to test handler (skip flag set)');
            return;
          }
          Log.info('[fixture] Auto-accepting beforeunload dialog');
          await dialog.accept();
        }
      });

      attachDiagnostics(pg);
      return { ctx, pg };
    };

    const refreshSharedState = async (): Promise<void> => {
      Log.info('[fixture] state stale -- acquiring lock to refresh');
      const release = await acquireLock();
      try {
        // Re-check: a peer worker may have refreshed while we waited for the lock.
        // Group A-5 (lifecycle refactor 2026-05-21): probe context
        // closed under try/finally so a validateState throw doesn't leak the probe context.
        const probe = await browser.newContext(
          fs.existsSync(STATE_PATH) ? { storageState: STATE_PATH } : undefined,
        );
        let stillStale: boolean;
        try {
          const probePage = await probe.newPage();
          stillStale = !(await validateState(probePage, config.base_url));
        } finally {
          await probe.close();
        }
        if (!stillStale) {
          Log.info('[fixture] peer worker refreshed state while we waited -- reusing');
          return;
        }

        // Full SSO login (file-lock guarantees only this worker is here).
        // Group A-2 (lifecycle refactor 2026-05-21): SSO step extracted to
        // performSsoLogin (auth-storage). On throw, the helper has already closed the context;
        // the surrounding catch is no longer needed for cleanup. Caller-specific error wrapping
        // preserved so the prior error message ("SSO login failed during state refresh") still
        // identifies the call path in logs.
        let loginCtx: import('@playwright/test').BrowserContext;
        try {
          ({ ctx: loginCtx } = await performSsoLogin(browser, config.base_url, config, credentials));
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          throw new Error(`SSO login failed during state refresh: ${msg}`);
        }
        await writeStateAtomic(loginCtx);
        await loginCtx.close();
        Log.info('[fixture] shared state refreshed and saved');
      } finally {
        await release();
      }
    };

    // Group A-3 (lifecycle refactor 2026-05-21): hoist the stateMissing
    // check ABOVE newSharedContext(). The old order created a context, closed it on stale, then
    // recreated — wasted one context per cold-start worker. With the hoist, refresh runs first
    // when needed and newSharedContext() runs exactly once.

    // AUTH-STATE-SHARED test hook: when EXP_FORCE_STALE_FIRST=1, simulate mid-run
    // expiry on the first pre-test guard call per worker process. Forces both workers
    // through refreshSharedState() simultaneously to verify the file-lock serialization.
    // Pre-test guard rationale: the fresh-context browser render check (heading visibility) is
    // unreliable for this app because Playwright's storageState does not capture sessionStorage
    // / in-memory MSAL state, so cookie-only restoration leaves the SPA in a skeleton-loading
    // state in a context that did not go through SSO. We rely on auth.setup's file-based
    // validation; here we only force a refresh when EXP_FORCE_STALE_FIRST is set or the state
    // file is missing entirely.
    const forceStaleFirst =
      process.env.EXP_FORCE_STALE_FIRST === '1' &&
      !(globalThis as unknown as { __expForceStaleConsumed?: boolean }).__expForceStaleConsumed;
    if (forceStaleFirst) {
      (globalThis as unknown as { __expForceStaleConsumed?: boolean }).__expForceStaleConsumed = true;
      Log.info('[fixture] EXP_FORCE_STALE_FIRST=1 -- forcing stale path for mid-run sim');
    }
    const stateMissing = !fs.existsSync(STATE_PATH);
    // Fix #3: cheap cookie-expiry pre-check.
    // Refreshes shared state when the earliest `next-auth.session-token*`
    // expiry is past (with 60s grace). Catches "cookies expired per their own
    // expires field" before the 60s Dashboard timeout fires. Tri-state per
    // auth.setup.ts:121 — `null` from readEarliestSessionExpiry() means missing
    // or all-session-cookies, both already handled by `stateMissing` + existing
    // fail-eventual safety net at validateState's Dashboard wait.
    const earliestExpiry = stateMissing ? null : readEarliestSessionExpiry();
    const stateExpired =
      earliestExpiry !== null && earliestExpiry * 1000 < Date.now() + 60_000;
    if (forceStaleFirst || stateMissing || stateExpired) {
      await refreshSharedState();
    }

    const { ctx: context, pg: page } = await newSharedContext();
    // Navigate primary page to base_url and confirm Dashboard.
    // BOTH fresh-after-refresh AND pre-existing-valid-state contexts start on about:blank
    // (probe-context wrap moved validateState off the primary page; primary page from
    // newSharedContext() is a brand-new blank page). Closes Phase A warm-up regression
    // (parent plan post-depgate framework fixes deferred item) -- without this
    // navigation, tests on the not-stale path start on about:blank -> SELECTOR failures.
    await page.goto(config.base_url, { timeout: 78_000 });
    await page
      .getByRole('heading', { name: 'Dashboard', level: 1 })
      .waitFor({ state: 'visible', timeout: 60_000 });

    Log.info('[OK] Authenticated session ready via shared storageState');

    await use({ page, context });

    await context.close();
  }, { scope: 'worker', timeout: 300_000 }],

 /**
 * Fix #2: runtime guard for bare-page-collision page-fixture collision.
 *
 * Background: when a spec destructures `{ page, locationXxxPage }`, Playwright resolves
 * BOTH fixtures. The page-object fixtures use `authenticatedSession.page` (the legitimate
 * authenticated context), but the default `page` fixture is a separate fixture that calls
 * `browser.newContext({ storageState })` — producing a second about:blank context that
 * diagnostics cannot see. This override intercepts the destructure point itself and throws
 * loudly so the bug is unmissable at the test boundary.
 *
 * Why throw (Option A) rather than redirect to `authenticatedSession.page` (Option B):
 * redirecting changes test semantics silently AND loses Playwright's built-in trace/video/
 * screenshot capture (those bind to the page returned by THIS `page` fixture). Throwing
 * fails loudly with a [diag:bare-page-collision] pointer.
 *
 * Layered with .githooks/pre-commit grep guard (Fix #1a) + CI lint step (Fix #1b). If a
 * spec escapes both static checks (e.g. `--no-verify` push, fresh clone without hooks),
 * this runtime override is the final net.
 *
 * P0-7 gate: pre-land, the `_p0-7-smoke.spec.ts` no-op spec confirmed trace+video still
 * attach via `authenticatedSession.context` for tests that route through page-object
 * fixtures (never destructure bare {page}). No regression to debugging artifacts.
 */
  page: async ({}, _use, testInfo) => {
    const msg =
      `[diag:bare-page-collision] test "${testInfo.titlePath.join(' > ')}" requested bare {page} from ` +
      `fixture destructure. This causes Playwright to create a separate about:blank context ` +
      `(diagnostics blind to it). Fix: drop 'page' from the destructure; use a *Page fixture ` +
      `(e.g. {locationNotesPage}) or authenticatedSession.page for direct page operations.`;
    Log.error(msg);
    throw new Error(msg);
  },

 /**
 * LocationCurrencyPage fixture
 * Uses authenticatedSession page so tests start pre-authenticated.
 */
  locationCurrencyPage: async ({ authenticatedSession, config }, use) => {
    const locationCurrencyPage = new LocationCurrencyPage(authenticatedSession.page, config);
    await use(locationCurrencyPage);
  },

 /**
 * LocationLocalInfoPage fixture
 * Uses authenticatedSession page so tests start pre-authenticated (no login flow needed).
 * R14 exception (intentional): Must use authenticatedSession.page to access Navigator Cloud.
 */
  locationLocalInfoPage: async ({ authenticatedSession, config }, use) => {
    const locationLocalInfoPage = new LocationLocalInfoPage(authenticatedSession.page, config);
    await use(locationLocalInfoPage);
  },

 /**
 * LocationPricingPage fixture
 * Uses authenticatedSession page so tests start pre-authenticated.
 */
  locationPricingPage: async ({ authenticatedSession, config }, use) => {
    const locationPricingPage = new LocationPricingPage(authenticatedSession.page, config);
    await use(locationPricingPage);
  },

 /**
 * LocationAccountAddressPage fixture
 * Uses authenticatedSession page so tests start pre-authenticated.
 */
  locationAccountAddressPage: async ({ authenticatedSession, config }, use) => {
    const locationAccountAddressPage = new LocationAccountAddressPage(authenticatedSession.page, config);
    await use(locationAccountAddressPage);
  },

 /**
 * LocationNotesPage fixture
 * Uses authenticatedSession page so tests start pre-authenticated.
 */
  locationNotesPage: async ({ authenticatedSession, config }, use) => {
    const locationNotesPage = new LocationNotesPage(authenticatedSession.page, config);
    await use(locationNotesPage);
  },

 /**
 * LocationLegalPage fixture
 * Uses authenticatedSession page so tests start pre-authenticated.
 */
  locationLegalPage: async ({ authenticatedSession, config }, use) => {
    const locationLegalPage = new LocationLegalPage(authenticatedSession.page, config);
    await use(locationLegalPage);
  },

 /**
 * LocationLeftPanelBasicInformationPage fixture
 * Uses authenticatedSession page so tests start pre-authenticated.
 */
  locationLeftPanelBasicInformationPage: async ({ authenticatedSession, config }, use) => {
    const locationLeftPanelBasicInformationPage = new LocationLeftPanelBasicInformationPage(authenticatedSession.page, config);
    await use(locationLeftPanelBasicInformationPage);
  },

 /**
 * LocationSharedSetupLocationsPage fixture
 * Uses authenticatedSession page so tests start pre-authenticated.
 */
  locationSharedSetupLocationsPage: async ({ authenticatedSession, config }, use) => {
    const locationSharedSetupLocationsPage = new LocationSharedSetupLocationsPage(authenticatedSession.page, config);
    await use(locationSharedSetupLocationsPage);
  },

  localOfficeSettingsPage: async ({ authenticatedSession, config }, use) => {
    const localOfficeSettingsPage = new LocalOfficeSettingsPage(authenticatedSession.page, config);
    await use(localOfficeSettingsPage);
  },

  localOfficeHistoryPage: async ({ authenticatedSession, config }, use) => {
    const localOfficeHistoryPage = new LocalOfficeHistoryPage(authenticatedSession.page, config);
    await use(localOfficeHistoryPage);
  },

  localOfficeEctPage: async ({ authenticatedSession, config }, use) => {
    const localOfficeEctPage = new LocalOfficeEctPage(authenticatedSession.page, config);
    await use(localOfficeEctPage);
  },

  locationAutoAddonPage: async ({ authenticatedSession, config }, use) => {
    const locationAutoAddonPage = new LocationAutoAddonPage(authenticatedSession.page, config);
    await use(locationAutoAddonPage);
  },

  locationManagementHistoryPage: async ({ authenticatedSession, config }, use) => {
    const locationManagementHistoryPage = new LocationManagementHistoryPage(authenticatedSession.page, config);
    await use(locationManagementHistoryPage);
  },

  /**
   * CorporatePricingBasePage fixture (S0 foundation — shared base).
   * S1/S2/S3 add their own per-screen page-object fixtures extending CorporatePricingBasePage.
   */
  corporatePricingBasePage: async ({ authenticatedSession, config }, use) => {
    const corporatePricingBasePage = new CorporatePricingBasePage(authenticatedSession.page, config);
    await use(corporatePricingBasePage);
  },

  /**
   * CorporatePricingSearchPage fixture (S1 — Search screen, NM-1445).
   * Extends CorporatePricingBasePage; uses authenticatedSession page so tests start pre-authenticated.
   */
  corporatePricingSearchPage: async ({ authenticatedSession, config }, use) => {
    const corporatePricingSearchPage = new CorporatePricingSearchPage(authenticatedSession.page, config);
    await use(corporatePricingSearchPage);
  },

  /**
   * CorporatePricingStrategyPage fixture (S2 — Pricing Strategy tab, NM-1441).
   * Extends CorporatePricingBasePage; uses authenticatedSession page so tests start pre-authenticated.
   */
  corporatePricingStrategyPage: async ({ authenticatedSession, config }, use) => {
    const corporatePricingStrategyPage = new CorporatePricingStrategyPage(authenticatedSession.page, config);
    await use(corporatePricingStrategyPage);
  },

  /**
   * CorporatePricingDetailPage fixture (S3 — Pricing Detail tab, NM-1443).
   * Extends CorporatePricingBasePage; uses authenticatedSession page so tests start pre-authenticated.
   */
  corporatePricingDetailPage: async ({ authenticatedSession, config }, use) => {
    const corporatePricingDetailPage = new CorporatePricingDetailPage(authenticatedSession.page, config);
    await use(corporatePricingDetailPage);
  },

  /**
   * CorporatePricingOverridePage fixture (Product Group Override screen, /pg-override).
   * Extends CorporatePricingBasePage; uses authenticatedSession page so tests start pre-authenticated.
   */
  corporatePricingOverridePage: async ({ authenticatedSession, config }, use) => {
    const corporatePricingOverridePage = new CorporatePricingOverridePage(authenticatedSession.page, config);
    await use(corporatePricingOverridePage);
  },

  /**
   * CorporatePricingNewPricebookPage fixture (NM-1440 — New Pricebook create flow, /add?type=...).
   * Extends CorporatePricingBasePage; uses authenticatedSession page so tests start pre-authenticated.
   */
  corporatePricingNewPricebookPage: async ({ authenticatedSession, config }, use) => {
    const corporatePricingNewPricebookPage = new CorporatePricingNewPricebookPage(authenticatedSession.page, config);
    await use(corporatePricingNewPricebookPage);
  },

});

// Re-export expect
export { expect } from '@playwright/test';
