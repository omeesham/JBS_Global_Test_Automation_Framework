/**
 * Shared UI utility functions for common test automation operations.
 * Provides navigation, authentication, and UI interaction helpers.
 */

/**
 * @agent-doc
 * PURPOSE: Shared UI workflows used across multiple tests - login, navigation, common multi-step actions.
 * OWNER: generator, healer
 * IMPACT: high - login flow used by ALL authenticated tests. Breaking this = all tests fail.
 * DEPENDS-ON: base-page.ts, page objects
 * USED-BY: test specs that need auth, fixtures.ts for session setup
 * RULES: Keep Microsoft SSO login flow working at all costs. Authentication via LoginPage + vault credentials. Never log credentials.
 */

import { Page } from '@playwright/test';
import { Log } from '../utils/logger';

export class UiCommon {
  /**
   * Navigate to URL and verify expected element loads
   */
  static async navigateAndVerify(page: Page, url: string, expectedElement: string, timeout: number = 30000): Promise<boolean> {
    Log.info(`Navigating to ${url} and verifying ${expectedElement}`);
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
      await page.locator(expectedElement).waitFor({ state: 'visible', timeout: 10000 });
      Log.info(`[OK] Navigation verified: ${url}`);
      return true;
    } catch (error) {
      Log.error(`[ERR] Navigation verification failed: ${error}`);
      throw error;
    }
  }

  // waitForLoadingToComplete() -- DELETED: duplicates BasePage.waitForPageLoad()

  // acceptCookieConsent() -- DELETED: speculative code for cookie banners; Navigator Cloud is internal SSO app with no cookie consent

  /**
   * Select from dropdown (native select or custom)
   */
  static async selectFromDropdown(page: Page, dropdownLocator: string, value: string, byLabel: boolean = false): Promise<void> {
    Log.info(`Selecting ${value} from dropdown: ${dropdownLocator}`);
    
    const dropdown = page.locator(dropdownLocator);
    
    // Try native select first
    if (await dropdown.evaluate(el => el.tagName === 'SELECT')) {
      if (byLabel) {
        await dropdown.selectOption({ label: value });
      } else {
        await dropdown.selectOption(value);
      }
    } else {
      // Handle custom dropdown
      await dropdown.click();
      await page.locator(`text=${value}`).first().click();
    }
    
    Log.info(`[OK] Selected: ${value}`);
  }

  // navigateToAuthenticatedPage -- removed (phantom selectors; actual login uses LoginPage.loginWithMicrosoft())

  /**
   * WORKFLOW METHOD: Element verification with retry logic
   * 
   * @param page - Playwright page object
   * @param selector - Element selector
   * @param options - Verification options
   * @returns true if element verified
   */
  static async verifyElementWithRetry(
    page: Page,
    selector: string,
    options: { timeout?: number; state?: 'visible' | 'attached' | 'hidden'; retries?: number } = {}
  ): Promise<boolean> {
    const { timeout = 5000, state = 'visible', retries = 3 } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await page.locator(selector).waitFor({ state, timeout });
        Log.info(`[OK] Element verified: ${selector} (attempt ${attempt})`);
        return true;
      } catch (error) {
        if (attempt === retries) {
          Log.error(`[ERR] Element verification failed after ${retries} attempts: ${selector}`);
          return false;
        }
        Log.warn(`[WARN]  Element not found, retrying... (${attempt}/${retries})`);
        await page.waitForTimeout(1000);
      }
    }

    return false;
  }

  // performCompleteLogout -- removed (phantom selectors, pending Planner discovery)

  /**
   * WORKFLOW METHOD: Setup test context (cookies, loading indicators)
   * Run at start of each test for clean state
   * 
   * @param page - Playwright page object
   */
  static async setupTestContext(page: Page): Promise<void> {
    Log.info('Setting up test context');

    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle').catch(() => {});

    Log.info('[OK] Test context ready');
  }
}

