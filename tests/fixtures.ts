/**
 * FILE: tests/fixtures.ts
 * PURPOSE: Custom Playwright test fixtures for dependency injection of page objects
 * WHY NECESSARY: Provides auto-initialized page objects and config to every test,
 *   avoiding manual setup boilerplate. Single import gives tests everything they need.
 * USED BY:
 * - All test files via: import { test, expect } from './fixtures'
 * - Automatically injects loginPage, homePage, config, etc. into test functions
 *
 * HOW IT WORKS:
 * 1. Extends base Playwright test with typed custom fixtures (MyFixtures)
 * 2. Each fixture auto-creates a page object with config and page instance
 * 3. Imports custom-matchers.ts to register domain-specific assertions globally
 * 4. Clears locator cache before each test for clean state
 *
 * FIXTURE SCOPING PATTERNS:
 *
 * 1. **Test-Level Scope (Default)** - Fresh instance per test
 *    - Use: { scope: 'test' } or omit scope parameter
 *    - Example: loginPage, documentsPage (current behavior)
 *    - Best for: Isolation, clean state, parallel execution
 *    - Python equivalent: @pytest.fixture(scope='function')
 *
 * 2. **Worker-Level Scope** - Shared across tests in same worker process
 *    - Use: { scope: 'worker' }
 *    - Example: config (optimized to worker scope below)
 *    - Best for: Expensive initialization, immutable data
 *    - Python equivalent: @pytest.fixture(scope='session')
 *
 * 3. **Describe-Block State Sharing** - Serial tests with shared variables
 *    - Use: test.describe.serial() + let variables in describe block
 *    - Example: See tests/examples/class-based-pattern.spec.ts
 *    - Best for: Multi-step workflows, session persistence
 *    - Python equivalent: Class-based tests with class attributes
 *
 * LIFECYCLE:
 * - Before each test: CommonMethods.clearLocatorCache() clears cached selectors
 * - Test runs: Fixtures injected as function parameters
 * - After test: Playwright auto-cleanup (browser context, page instances)
 *
 * @see {@link LoginPage} - src/pages/login.page.ts
 * @see {@link HomePage} - src/pages/home.page.ts
 * @see tests/custom-matchers.ts - Custom assertions (toBeLoggedIn, toHaveNotification)
 * @see tests/examples/class-based-pattern.spec.ts - Class-based test pattern example
 */

import './custom-matchers';
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { LandingPage } from '../src/pages/landing.page';
import { HomePage } from '../src/pages/home.page';
import { WorkingScreenPage } from '../src/pages/working-screen.page';
import { WorkingScreenPageAudit } from '../src/pages/working-screen-audit.page';
import { DocumentsPage } from '../src/pages/documents.page'; // DEMO_TARGET
import { CommonMethods } from '../src/utils/common-methods';
import { StealthHelpers } from '../src/utils/stealth-helpers';
import { AppConstants } from '../src/utils/app-constants';
import { IConfig } from '../src/framework-contracts';
import { BrowserContext } from '@playwright/test';

// Define worker-scoped fixtures (shared across tests in same worker)
type WorkerFixtures = {
  config: IConfig;
  stealthSession: { page: Page; context: BrowserContext };
};

// Define test-scoped fixtures (fresh instance per test)
type TestFixtures = {
  commonMethods: CommonMethods;
  loginPage: LoginPage;
  landingPage: LandingPage;
  homePage: HomePage;
  workingScreenPage: WorkingScreenPage;
  workingScreenPageAudit: WorkingScreenPageAudit;
  documentsPage: DocumentsPage; // DEMO_TARGET
};

/**
 * Extended test with custom fixtures
 * Usage: import { test, expect } from './fixtures';
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  /**
   * Configuration fixture (Worker-scoped for efficiency)
   * Loads configuration once per worker process, not per test
   * 
   * OPTIMIZATION: Config is immutable during test execution, no need to reload per test.
   * This reduces CommonMethods.initProp() calls from N tests → 1 per worker.
   * 
   * Python equivalent: @pytest.fixture(scope='session')
   */
  config: [async ({}, use) => {
    const config = CommonMethods.initProp();
    await use(config);
  }, { scope: 'worker' }],

  /**
   * StealthSession fixture (Worker-scoped for session persistence)
   * Provides stealth-enabled browser context with auto-login for EspoCRM demo site
   * 
   * PURPOSE: Eliminates 30+ lines of beforeAll boilerplate in specs by handling:
   * - Stealth context creation with anti-bot detection measures
   * - Stealth init scripts injection
   * - Random viewport configuration
   * - Navigation to base_url
   * - Auto-login (for demo sites with simple login flow)
   * 
   * USAGE:
   * ```typescript
   * test('TC-001', async ({ stealthSession, config }) => {
   *   const { page, context } = stealthSession;
   *   // Already logged in and stealth-enabled
   *   await page.goto(config.base_url + '/#Documents');
   * });
   * ```
   * 
   * IMPORTANT: This fixture is worker-scoped, meaning ONE login per worker process.
   * All tests in a describe.serial() block will share the same session.
   * 
   * @see src/utils/stealth-helpers.ts - Stealth implementation
   * @see tests/specs/espocrm/demo-espocrm.spec.ts - Original pattern
   */
  stealthSession: [async ({ browser, config }, use) => {
    // Create context with stealth options (MUST be set at creation time)
    const context = await browser.newContext(StealthHelpers.getStealthContextOptions());
    
    // Add stealth init script BEFORE creating page (critical timing)
    await StealthHelpers.addStealthScript(context);
    
    // Create page from stealth context
    const page = await context.newPage();
    
    // Randomize viewport to avoid fingerprinting
    await StealthHelpers.randomViewport(page);
    
    // Navigate to base URL with extended timeout (EspoCRM demo is slow)
    await page.goto(config.base_url, { 
      waitUntil: 'domcontentloaded',
      timeout: AppConstants.STEALTH_PAGE_LOAD_TIMEOUT_MS || 90000
    });
    
    // Auto-login for EspoCRM demo (simple click-to-login flow)
    await page.waitForSelector('button:has-text("Login")', { timeout: 30000 });
    await StealthHelpers.humanClick(page, 'button:has-text("Login")');
    await page.waitForSelector('.navbar', { timeout: 30000 });
    
    // Provide logged-in page and context to tests
    await use({ page, context });
    
    // Cleanup after worker finishes
    await context.close();
  }, { scope: 'worker' }],

  /**
   * CommonMethods fixture
   * Provides utility methods with page instance
   */
  commonMethods: async ({ page }, use) => {
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
   * LandingPage fixture
   * Auto-initialized LandingPage instance with config
   */
  landingPage: async ({ page, config }, use) => {
    const landingPage = new LandingPage(page, config);
    await use(landingPage);
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
   * WorkingScreenPage fixture
   * Auto-initialized WorkingScreenPage instance with config
   */
  workingScreenPage: async ({ page, config }, use) => {
    const workingScreenPage = new WorkingScreenPage(page, config);
    await use(workingScreenPage);
  },

  /**
   * WorkingScreenPageAudit fixture
   * Auto-initialized WorkingScreenPageAudit instance with config
   */
  workingScreenPageAudit: async ({ page, config }, use) => {
    const workingScreenPageAudit = new WorkingScreenPageAudit(page, config);
    await use(workingScreenPageAudit);
  },

  /**
   * DocumentsPage fixture
   * Auto-initialized DocumentsPage instance with config
   * DEMO_TARGET: For EspoCRM Documents module testing
   */
  documentsPage: async ({ page, config }, use) => {
    const documentsPage = new DocumentsPage(page, config);
    await use(documentsPage);
  },

  /**
   * Page fixture override
   * Clear locator cache before each test class
   */
  page: async ({ page }, use) => {
    // Clear cached locators before each test
    CommonMethods.clearLocatorCache();
    await use(page);
  },
});

// Re-export expect
export { expect } from '@playwright/test';
