/**
 * FILE: src/common/ui-common.ts
 * PURPOSE: Shared UI utility functions for test automation
 * WHY NECESSARY: Reusable UI operations across tests, reduces code duplication
 * USED BY: Test files import and use these helpers
 * 
 * HOW IT WORKS:
 * 1. Provides high-level UI operations (nav, login, waits)
 * 2. Integrates with data adapters for dynamic data
 * 3. Handles common UI patterns (modals, dropdowns, etc.)
 */

import { Page } from '@playwright/test';
import { Log } from '../utils/logger';
import { IConfig } from '../../src/framework-contracts';
import { CredentialLoader, CredentialSource, Credentials } from './credential-loader';
import { CommonMethods } from '../utils/common-methods';
import { AppConstants } from '../utils/app-constants';

export class UiCommon {
  /**
   * Navigate to URL and verify expected element loads
   */
  static async navigateAndVerify(page: Page, url: string, expectedElement: string, timeout: number = 30000): Promise<boolean> {
    Log.info(`Navigating to ${url} and verifying ${expectedElement}`);
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
      await page.locator(expectedElement).waitFor({ state: 'visible', timeout: 10000 });
      Log.info(`✅ Navigation verified: ${url}`);
      return true;
    } catch (error) {
      Log.error(`❌ Navigation verification failed: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for loading spinners to disappear
   */
  static async waitForLoadingToComplete(page: Page, selectors: string[] = ['.spinner', '.loading', '[data-loading]'], timeout: number = 10000): Promise<void> {
    Log.info('Waiting for loading indicators...');
    
    for (const selector of selectors) {
      const spinner = page.locator(selector).first();
      if (await spinner.isVisible().catch(() => false)) {
        await spinner.waitFor({ state: 'hidden', timeout }).catch(() => 
          Log.warn(`Spinner still visible: ${selector}`)
        );
      }
    }
    
    Log.info('✅ Loading complete');
  }

  /**
   * Accept cookie consent banner if present
   */
  static async acceptCookieConsent(page: Page): Promise<boolean> {
    const cookieSelectors = [
      'button:has-text("Accept")',
      'button:has-text("Accept All")',
      '[id*="cookie"] button',
      '.cookie-banner button'
    ];

    for (const selector of cookieSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible().catch(() => false)) {
        await button.click();
        Log.info(`✅ Accepted cookie consent`);
        return true;
      }
    }
    
    return false;
  }

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
    
    Log.info(`✅ Selected: ${value}`);
  }

  /**
   * WORKFLOW METHOD: Complete login workflow with credential loading
   * Enables thin tests (<10 lines)
   * 
   * @param page - Playwright page object
   * @param url - Login page URL
   * @param credentialSource - Where to load credentials from
   * @param config - Config object for selectors
   * @returns Object with authentication status
   * 
   * @example
   * // Load admin credentials from Excel and login
   * const result = await UiCommon.navigateToAuthenticatedPage(
   *   page,
   *   'https://app.com/login',
   *   { type: 'excel', path: 'config/test-data/users.csv', role: 'admin' },
   *   config
   * );
   * expect(result.authenticated).toBe(true);
   */
  static async navigateToAuthenticatedPage(
    page: Page,
    url: string,
    credentialSource: CredentialSource,
    config: IConfig
  ): Promise<{ authenticated: boolean; username: string; redirectUrl: string }> {
    Log.info('🚀 Starting complete authentication workflow');

    try {
      // Step 1: Navigate to login page
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      Log.info(`✅ Navigated to: ${url}`);

      // Step 2:Setup test context (cookies, loading indicators)
      await this.setupTestContext(page);

      // Step 3: Load credentials from specified source
      const credentials = await CredentialLoader.loadCredentials(credentialSource);
      Log.info(`✅ Credentials loaded for: ${credentials.username}`);

      // Step 4: Get login selectors from CSV
      const usernameField = CommonMethods.getValuesFromCsv('txtUsername', AppConstants.LOGIN_ELEMENTS) || 'input[name="username"]';
      const passwordField = CommonMethods.getValuesFromCsv('txtPassword', AppConstants.LOGIN_ELEMENTS) || 'input[name="password"]';
      const loginButton = CommonMethods.getValuesFromCsv('btnLogin', AppConstants.LOGIN_ELEMENTS) || 'button[type="submit"]';

      // Step 5: Perform login
      await page.fill(usernameField, credentials.username);
      await page.fill(passwordField, credentials.password);
      await page.click(loginButton);

      // Step 6: Wait for navigation
      await page.waitForLoadState('networkidle');
      await this.waitForLoadingToComplete(page);

      // Step 7: Verify authentication successful
      const currentUrl = page.url();
      const authenticated = !currentUrl.includes('/login') && currentUrl !== url;

      if (authenticated) {
        Log.info(`✅ Authentication successful for: ${credentials.username}`);
      } else {
        Log.error(`❌ Authentication failed for: ${credentials.username}`);
      }

      return {
        authenticated,
        username: credentials.username,
        redirectUrl: currentUrl
      };
    } catch (error) {
      Log.error(`❌ Authentication workflow failed: ${error}`);
      return {
        authenticated: false,
        username: '',
        redirectUrl: page.url()
      };
    }
  }

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
        Log.info(`✅ Element verified: ${selector} (attempt ${attempt})`);
        return true;
      } catch (error) {
        if (attempt === retries) {
          Log.error(`❌ Element verification failed after ${retries} attempts: ${selector}`);
          return false;
        }
        Log.warn(`⚠️  Element not found, retrying... (${attempt}/${retries})`);
        await page.waitForTimeout(1000);
      }
    }

    return false;
  }

  /**
   * WORKFLOW METHOD: Complete logout workflow
   * 
   * @param page - Playwright page object
   * @returns true if logout successful
   */
  static async performCompleteLogout(page: Page): Promise<boolean> {
    Log.info('Performing complete logout');

    try {
      // Get logout button from CSV
      const profileIcon = CommonMethods.getValuesFromCsv('ico_Profile', AppConstants.LANDING_ELEMENTS) || '[data-testid="profile-icon"]';
      const logoutLink = CommonMethods.getValuesFromCsv('lnkLogout', AppConstants.LANDING_ELEMENTS) || 'text=Logout';

      // Click profile menu
      await page.locator(profileIcon).click();
      await page.waitForTimeout(500);

      // Click logout
      await page.locator(logoutLink).click();

      // Wait for redirect to login
      await page.waitForURL('**/login**', { timeout: 10000 }).catch(() => {});

      // Clear session and local storage
      await page.context().clearCookies();
      // Browser storage clearing (using globalThis with type assertion for cross-context safety)
      await page.evaluate(() => {
        try {
          const ctx = globalThis as any;
          ctx.sessionStorage?.clear();
          ctx.localStorage?.clear();
        } catch (e) {
          // Ignore storage clearing errors (may not be available in all contexts)
        }
      });

      const currentUrl = page.url();
      const loggedOut = currentUrl.includes('/login') || currentUrl.includes('/auth');

      if (loggedOut) {
        Log.info('✅ Logout successful');
      } else {
        Log.warn('⚠️  Logout may not have completed');
      }

      return loggedOut;
    } catch (error) {
      Log.error(`❌ Logout failed: ${error}`);
      return false;
    }
  }

  /**
   * WORKFLOW METHOD: Setup test context (cookies, loading indicators)
   * Run at start of each test for clean state
   * 
   * @param page - Playwright page object
   */
  static async setupTestContext(page: Page): Promise<void> {
    Log.info('Setting up test context');

    // Accept cookies if present
    await this.acceptCookieConsent(page);

    // Wait for any initial loading
    await this.waitForLoadingToComplete(page);

    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle').catch(() => {});

    Log.info('✅ Test context ready');
  }
}

