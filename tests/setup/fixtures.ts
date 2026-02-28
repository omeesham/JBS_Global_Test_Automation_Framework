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
import { LocationCurrencyPage } from '../../src/pages/location-currency.page';
import { LocationLocalInfoPage } from '../../src/pages/location-local-info.page';
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
  commonMethods: CommonMethods;
  loginPage: LoginPage;
  homePage: HomePage;
  locationCurrencyPage: LocationCurrencyPage;
  locationLocalInfoPage: LocationLocalInfoPage;
};

/**
 * Extended test with custom fixtures
 * Usage: import { test, expect } from './fixtures';
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
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
   * Fresh login per worker -- authenticates via Microsoft SSO + MFA using vault credentials.
   * No session persistence. Reuses the authenticated page directly (no about:blank).
   * Each spec file gets its own worker, so this = one login per spec file.
   */
  authenticatedSession: [async ({ browser, config }, use) => {
    // Create clean browser context -- no saved state, no storageState
    const context = await browser.newContext();
    const page = await context.newPage();

    // Attach runtime diagnostics collector (console, network, page errors, auth chain)
    const collector = attachDiagnostics(page);

    // Load credentials from encrypted vault
    const credentials = await CredentialLoader.loadCredentials({ type: 'vault' });

    // Navigate to app -- triggers redirect to Navigator Cloud sign-in page
    // 78s (1.3 min) timeout: allows SSO redirect chain to initiate; no waitUntil to avoid networkidle stall
    await page.goto(config.base_url, { timeout: 78_000 });

    // Full SSO + MFA login flow
    const loginPage = new LoginPage(page, config);
    const loginSuccess = await loginPage.loginWithMicrosoft(
      credentials.username,
      credentials.password,
      credentials.mfaSecret,
    );

    if (!loginSuccess) {
      throw new Error('Authenticated session creation failed -- SSO login did not succeed');
    }

    // Wait for the Setup nav button to become visible -- signals the app has fully loaded
    // after the post-SSO redirect chain. 60s timeout: Navigator Cloud loads fast (no Angular bundle).
    // Element is a <button> in the sidebar navigation.
    Log.info('[wait] Waiting for Setup button to be visible (app ready signal)...');
    const setupWaitStart = Date.now();
    try {
      await page.getByRole('button', { name: 'Setup' }).waitFor({ state: 'visible', timeout: 60_000 });
    } catch (setupError) {
      const elapsed = Date.now() - setupWaitStart;
      Log.error(`[TIMEOUT] Setup button not visible after ${elapsed}ms. URL: ${page.url()}`);
      const bodyText = await page.locator('body').textContent({ timeout: 5_000 }).catch(() => '');
      if (!bodyText || bodyText.trim().length < 10) {
        Log.error('[DIAGNOSIS] Page body is empty -- app likely did not load');
      } else {
        Log.error(`[DIAGNOSIS] Page body has content (${bodyText.trim().length} chars) -- app may have loaded but Setup button not found`);
      }
      throw setupError;
    }
    Log.info(`[OK] Fresh login complete -- Setup button visible after ${Date.now() - setupWaitStart}ms`);

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
    Logger.setSpecContext(testInfo.file);
    const commonMethods = new CommonMethods(page);
    await use(commonMethods);

    // Teardown -- attach diagnostics snapshot to testInfo for AgentReporter consumption
    const collector = (page as unknown as Record<string, unknown>).__diagnosticsCollector as DiagnosticsCollector | undefined;
    if (collector) {
      collector.recordUrl();
      const snapshot = collector.getSnapshot();

      // C1: Capture DOM snapshot on failure -- equivalent to browser_snapshot but automatic
      if (testInfo.status !== 'passed') {
        try {
          const domContent = await page.content();
          snapshot.domSnippet = domContent.slice(0, 50_000);
        } catch { /* page may be closed -- best effort */ }
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
          // Append test result to existing file or create new
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

});

// Re-export expect
export { expect } from '@playwright/test';
