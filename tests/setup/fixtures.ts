/**
 * @agent-doc
 * PURPOSE: Custom Playwright test fixtures for dependency injection of page objects. Provides loginPage, homePage, commonMethods, and config to all tests.
 * OWNER: generator
 * IMPACT: critical - All tests depend on fixtures. Breaking this breaks every test. Fixture initialization logic is critical.
 * DEPENDS-ON: custom-matchers.ts, all page objects, CommonMethods, CredentialLoader, framework-contracts/index.ts
 * USED-BY: All test files in tests/specs/ directory
 * RULES: Never delete existing fixtures (loginPage, homePage, config). Always test new fixtures thoroughly. Keep auto-use config fixture. Generator adds new fixtures as new page objects are created.
 */

/** Custom Playwright test fixtures for dependency injection of page objects */

import './custom-matchers';
import { test as base, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { HomePage } from '../../src/pages/home.page';
import { LocationCurrencyPage } from '../../src/pages/setup/locations/location-currency.page';
import { LocationLocalInfoPage } from '../../src/pages/setup/locations/location-local-info.page';
import { LocationPricingPage } from '../../src/pages/setup/locations/location-pricing.page';
import { LocationAccountAddressPage } from '../../src/pages/setup/locations/location-account-address.page';
import { LocationNotesPage } from '../../src/pages/setup/locations/location-notes.page';
import { LocationLegalPage } from '../../src/pages/setup/locations/location-legal.page';
import { LocationSharedSetupLocationsPage } from '../../src/pages/setup/locations/location-shared-setup-locations.page';
import { LocalOfficeSettingsPage } from '../../src/pages/setup/local-office/local-office-settings.page';
import { LocationAutoAddonPage } from '../../src/pages/setup/locations/location-auto-addon.page';
import { CommonMethods } from '../../src/utils/common-methods';
import { Log, Logger } from '../../src/utils/logger';
import { IConfig } from '../../src/framework-contracts';
import { CredentialLoader } from '../../src/common/credential-loader';
import { attachDiagnostics, DiagnosticsCollector } from '../../src/utils/diagnostics-collector';
import * as fs from 'fs';
import * as path from 'path';

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
};

/**
 * Extended test with custom fixtures
 * Usage: import { test, expect } from './fixtures';
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
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

        // Generate error-context.md for RCA Step 0.2
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

      // Persist per-spec diagnostics file for agent drill-down
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
   * Fresh login per worker -- authenticates via Microsoft SSO + MFA using env credentials.
   * No session persistence. Reuses the authenticated page directly (no about:blank).
   * Each spec file gets its own worker, so this = one login per spec file.
   */
  authenticatedSession: [async ({ browser, config }, use) => {
    // Create clean browser context -- no saved state, no storageState
    const context = await browser.newContext();
    const page = await context.newPage();

    // Global safety net: auto-accept native beforeunload dialogs to prevent test hangs.
    // ALL-052 enforcement: Angular forms fire beforeunload when navigating with unsaved edits.
    // Tests that need to control beforeunload dialogs can set page.__skipBeforeunloadAutoAccept = true.
    page.on('dialog', async (dialog) => {
      if (dialog.type() === 'beforeunload') {
        const skip = (page as unknown as Record<string, unknown>).__skipBeforeunloadAutoAccept;
        if (skip) {
          Log.info('[fixture] beforeunload dialog deferred to test handler (skip flag set)');
          return;
        }
        Log.info('[fixture] Auto-accepting beforeunload dialog');
        await dialog.accept();
      }
    });

    // Attach runtime diagnostics collector (console, network, page errors, auth chain)
    const collector = attachDiagnostics(page);

    // Load credentials from environment variables
    const credentials = await CredentialLoader.loadCredentials({ type: 'env' });

    // SSO login with retry -- OAuth callback can fail transiently (CSRF/state mismatch, B2C hiccup)
    const MAX_LOGIN_ATTEMPTS = 3;
    let loginSuccess = false;

    for (let attempt = 1; attempt <= MAX_LOGIN_ATTEMPTS; attempt++) {
      if (attempt > 1) {
        Log.info(`[retry] Login attempt ${attempt}/${MAX_LOGIN_ATTEMPTS} -- resetting page state and retrying`);
        await page.goto('about:blank', { timeout: 5_000 }).catch(() => {});
        await context.clearCookies();
      }

      // Navigate to app -- triggers redirect to Navigator Cloud sign-in page
      // 78s (1.3 min) timeout: allows SSO redirect chain to initiate; no waitUntil to avoid networkidle stall
      await page.goto(config.base_url, { timeout: 78_000 });

      // Full SSO + MFA login flow
      const loginPage = new LoginPage(page, config);
      loginSuccess = await loginPage.loginWithMicrosoft(
        credentials.username,
        credentials.password,
        credentials.mfaSecret,
      );

      if (loginSuccess) break;
      Log.error(`[ERR] Login attempt ${attempt}/${MAX_LOGIN_ATTEMPTS} failed`);
    }

    if (!loginSuccess) {
      throw new Error(`Authenticated session creation failed -- SSO login did not succeed after ${MAX_LOGIN_ATTEMPTS} attempts`);
    }

    // Wait for the Dashboard heading to become visible -- signals the app has fully loaded
    // after the post-SSO redirect chain. 60s timeout: Navigator Cloud loads fast (no Angular bundle).
    // Landing page shows "Dashboard" h1 on the main home page.
    Log.info('[wait] Waiting for Dashboard heading to be visible (app ready signal)...');
    const setupWaitStart = Date.now();
    try {
      await page.getByRole('heading', { name: 'Dashboard', level: 1 }).waitFor({ state: 'visible', timeout: 60_000 });
    } catch (setupError) {
      const elapsed = Date.now() - setupWaitStart;
      Log.error(`[TIMEOUT] Dashboard heading not visible after ${elapsed}ms. URL: ${page.url()}`);
      const bodyText = await page.locator('body').textContent({ timeout: 5_000 }).catch(() => '');
      if (!bodyText || bodyText.trim().length < 10) {
        Log.error('[DIAGNOSIS] Page body is empty -- app likely did not load');
      } else {
        Log.error(`[DIAGNOSIS] Page body has content (${bodyText.trim().length} chars) -- app may have loaded but Dashboard heading not found`);
      }
      throw setupError;
    }
    Log.info(`[OK] Fresh login complete -- Dashboard visible after ${Date.now() - setupWaitStart}ms`);

    // Record URL after successful auth for diagnostics
    collector.recordUrl();

    // Hand the SAME page (now on Navigator Cloud) to tests -- no about:blank, no leaked page
    await use({ page, context });

    // Teardown: close the entire context (page + cookies)
    await context.close();
  }, { scope: 'worker', timeout: 300_000 }],

  /**
   * CommonMethods fixture
   * Provides utility methods with page instance
   */
  commonMethods: async ({ page }, use, testInfo) => {
    // R14 exception (intentional): Uses bare `page` not `authenticatedSession.page`.
    // CommonMethods only provides static utilities (initProp, generateTotpCode) -- no page interaction.
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

});

// Re-export expect
export { expect } from '@playwright/test';
