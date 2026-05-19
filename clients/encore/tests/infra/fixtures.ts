/** Custom Playwright test fixtures for dependency injection of page objects */

import './custom-matchers';
import { test as base, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../src/pages/auth/login.page';
import { HomePage } from '../../src/pages/auth/home.page';
import { LocationCurrencyPage } from '../../src/pages/setup/locations/location-currency.page';
import { LocationLocalInfoPage } from '../../src/pages/setup/locations/location-local-info.page';
import { LocationPricingPage } from '../../src/pages/setup/locations/location-pricing.page';
import { LocationAccountAddressPage } from '../../src/pages/setup/locations/location-account-address.page';
import { LocationNotesPage } from '../../src/pages/setup/locations/location-notes.page';
import { LocationLegalPage } from '../../src/pages/setup/locations/location-legal.page';
import { LocationSharedSetupLocationsPage } from '../../src/pages/setup/locations/location-shared-setup-locations.page';
import { LocalOfficeSettingsPage } from '../../src/pages/setup/local-office/local-office-settings.page';
import { LocationAutoAddonPage } from '../../src/pages/setup/locations/location-auto-addon.page';
import { LocationManagementHistoryPage } from '../../src/pages/setup/locations/location-management-history.page';
import { CommonMethods } from '../../src/utils/common-methods';
import { Log, Logger } from '../../src/utils/logger';
import { IConfig } from '../../src/types';
import { CredentialLoader } from '../../src/utils/credential-loader';
import { attachDiagnostics, DiagnosticsCollector } from '../../src/utils/diagnostics-collector';
import * as fs from 'fs';
import * as path from 'path';
import {
  STATE_PATH,
  acquireLock,
  validateState,
  writeStateAtomic,
} from './auth-storage';
import { dependencyGateExt } from './dependency-gate';

// Define worker-scoped fixtures (shared across tests in same worker)
type WorkerFixtures = {
  config: IConfig;
  authenticatedSession: { page: Page; context: BrowserContext };
};

// Define test-scoped fixtures (fresh instance per test)
type TestFixtures = {
  diagnosticsHandler: void;
  commonMethods: CommonMethods;
  loginPage: LoginPage;
  homePage: HomePage;
  locationCurrencyPage: LocationCurrencyPage;
  locationLocalInfoPage: LocationLocalInfoPage;
  locationPricingPage: LocationPricingPage;
  locationAccountAddressPage: LocationAccountAddressPage;
  locationNotesPage: LocationNotesPage;
  locationLegalPage: LocationLegalPage;
  locationSharedSetupLocationsPage: LocationSharedSetupLocationsPage;
  localOfficeSettingsPage: LocalOfficeSettingsPage;
  locationAutoAddonPage: LocationAutoAddonPage;
  locationManagementHistoryPage: LocationManagementHistoryPage;
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
        const probe = await browser.newContext(
          fs.existsSync(STATE_PATH) ? { storageState: STATE_PATH } : undefined,
        );
        const probePage = await probe.newPage();
        const stillStale = !(await validateState(probePage, config.base_url));
        await probe.close();
        if (!stillStale) {
          Log.info('[fixture] peer worker refreshed state while we waited -- reusing');
          return;
        }

        // Full SSO login (file-lock guarantees only this worker is here).
        const loginCtx = await browser.newContext();
        const loginPg = await loginCtx.newPage();
        loginPg.on('dialog', async (dialog) => {
          if (dialog.type() === 'beforeunload') await dialog.accept();
        });
        await loginPg.goto(config.base_url, { timeout: 78_000 });
        const lp = new LoginPage(loginPg, config);
        const ok = await lp.loginWithMicrosoft(
          credentials.username,
          credentials.password,
        );
        if (!ok) {
          await loginCtx.close();
          throw new Error('SSO login failed during state refresh');
        }
        await loginPg
          .getByRole('heading', { name: 'Dashboard', level: 1 })
          .waitFor({ state: 'visible', timeout: 60_000 });
        await writeStateAtomic(loginCtx);
        await loginCtx.close();
        Log.info('[fixture] shared state refreshed and saved');
      } finally {
        await release();
      }
    };

    let { ctx: context, pg: page } = await newSharedContext();

    // AUTH-STATE-SHARED test hook: when EXP_FORCE_STALE_FIRST=1, simulate mid-run
    // expiry on the first pre-test guard call per worker process. Forces both workers
    // through refreshSharedState() simultaneously to verify the file-lock serialization.
    const forceStaleFirst =
      process.env.EXP_FORCE_STALE_FIRST === '1' &&
      !(globalThis as unknown as { __expForceStaleConsumed?: boolean }).__expForceStaleConsumed;
    if (forceStaleFirst) {
      (globalThis as unknown as { __expForceStaleConsumed?: boolean }).__expForceStaleConsumed = true;
      Log.info('[fixture] EXP_FORCE_STALE_FIRST=1 -- forcing stale path for mid-run sim');
    }

    // Pre-test guard — validateState in a throwaway probe context. The fresh-context
    // browser render check (heading visibility) is unreliable for this app because
    // Playwright's storageState does not capture sessionStorage / in-memory MSAL state,
    // so cookie-only restoration leaves the SPA in a skeleton-loading state in a context
    // that did not go through SSO. We rely on auth.setup's file-based validation; here
    // we only force a refresh when the EXP_FORCE_STALE_FIRST hook is set or the state
    // file is missing entirely.
    const stateMissing = !fs.existsSync(STATE_PATH);
    if (forceStaleFirst || stateMissing) {
      await context.close();
      await refreshSharedState();
      ({ ctx: context, pg: page } = await newSharedContext());
    }
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
 * CommonMethods fixture
 * Provides utility methods with page instance
 */
  commonMethods: async ({ page }, use, testInfo) => {
 // R14 exception (intentional): Uses bare `page` not `authenticatedSession.page`.
 // CommonMethods only provides static utilities (initProp) -- no page interaction.
 // Diagnostics teardown is handled by auto-use `diagnosticsHandler` fixture (reads from authenticatedSession.page).
    Logger.setSpecContext(testInfo.file);
    const commonMethods = new CommonMethods(page);
    await use(commonMethods);
  },

 /**
 * LoginPage fixture
 * Auto-initialized LoginPage instance with config
 */
  loginPage: async ({ page, config }, use) => {
    const loginPage = new LoginPage(page, config);
    await use(loginPage);
  },

 /**
 * HomePage fixture
 * Auto-initialized HomePage instance with config
 */
  homePage: async ({ page, config }, use) => {
    const homePage = new HomePage(page, config);
    await use(homePage);
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

  locationAutoAddonPage: async ({ authenticatedSession, config }, use) => {
    const locationAutoAddonPage = new LocationAutoAddonPage(authenticatedSession.page, config);
    await use(locationAutoAddonPage);
  },

  locationManagementHistoryPage: async ({ authenticatedSession, config }, use) => {
    const locationManagementHistoryPage = new LocationManagementHistoryPage(authenticatedSession.page, config);
    await use(locationManagementHistoryPage);
  },

});

// Re-export expect
export { expect } from '@playwright/test';
