/**
 * @agent-doc
 * PURPOSE: Base class that ALL page objects extend. Provides click, fill, wait, scroll methods with built-in retry logic.
 * OWNER: generator, healer
 * IMPACT: critical - changes break every single page object in the framework
 * DEPENDS-ON: selectors/index.ts (getTsSelector), logger.ts, playwright
 * USED-BY: every *.page.ts file (LoginPage, HomePage, all page objects)
 * RULES: Never remove methods - breaks all page objects. Add new helpers only. Keep retry logic working. All methods must use getTsSelector() for element lookup.
 */

import { Page, Locator } from '@playwright/test';
import { Log } from '../utils/logger';
import { getTsSelector } from '../selectors';
import { IConfig } from '../framework-contracts';

export class BasePage {
  protected page: Page;
  protected config?: IConfig;

  constructor(page: Page, config?: IConfig) {
    this.page = page;
    this.config = config;
  }

  /**
   * Get Playwright selector string from TypeScript selector repository.
   * @param elementName - Element name from selectors/index.ts (e.g., 'txtUsername', 'btnLogin')
   * @returns CSS selector string
   * @throws Error if selector not found in repository
   */
  protected getLocator(elementName: string): string {
    const locator = getTsSelector(elementName);
    if (!locator) {
      Log.error(`Selector not found: ${elementName}`);
      throw new Error(`Selector '${elementName}' not found in TypeScript selectors`);
    }
    return locator;
  }

  /**
   * Get selector from TypeScript repository without throwing error if not found.
   * @param elementName - Element name from selectors/index.ts
   * @returns CSS selector string or null if not found
   */
  protected getSelectorFromTs(elementName: string): string | null {
    return getTsSelector(elementName);
  }

  /**
   * Get Playwright Locator object for element.
   * @param elementName - Element name from selectors/index.ts
   * @returns Playwright Locator ready for interactions
   */
  protected getElement(elementName: string): Locator {
    const selector = this.getLocator(elementName);
    return this.page.locator(selector);
  }

  /**
   * Navigate to URL with retry logic.
   * @param url - Target URL
   * @param options - Configuration (waitUntil: 'domcontentloaded', timeout: 30000ms, maxRetries: 2)
   * @throws Error if navigation fails after all retry attempts
   */
  async navigateTo(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; timeout?: number; maxRetries?: number }): Promise<void> {
    const { waitUntil = 'domcontentloaded', timeout = 30000, maxRetries = 2 } = options || {};
    Log.info(`Navigating to: ${url}`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.page.goto(url, { waitUntil, timeout });
        Log.info(`[OK] Navigation successful: ${url}`);
        return;
      } catch (error) {
        Log.warn(`[WARN] Navigation attempt ${attempt}/${maxRetries} failed: ${error}`);
        if (attempt === maxRetries) {
          Log.error(`[ERR] Navigation failed after ${maxRetries} attempts: ${url}`);
          throw error;
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Click element with retry logic on failure.
   * @param elementName - Element name from selectors/index.ts
   * @param options - Configuration (timeout: 10000ms, maxRetries: 3)
   * @returns true if click successful
   */
  async clickWithRetry(elementName: string, options?: { timeout?: number; maxRetries?: number }): Promise<boolean> {
    const { timeout = 10000, maxRetries = 3 } = options || {};
    Log.info(`Clicking element: ${elementName}`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const element = this.getElement(elementName);
        await element.click({ timeout });
        Log.info(`[OK] Click successful: ${elementName}`);
        return true;
      } catch (error) {
        Log.warn(`[WARN] Click attempt ${attempt}/${maxRetries} failed: ${elementName}`);
        if (attempt === maxRetries) {
          Log.error(`[ERR] Click failed after ${maxRetries} attempts: ${elementName}`);
          throw error;
        }
        await this.page.waitForTimeout(500);
      }
    }
    // Unreachable: loop always returns true or throws on final attempt
    throw new Error(`Click failed: ${elementName}`);
  }

  /**
   * Fill input field with value and optional verification.
   * @param elementName - Element name from selectors/index.ts
   * @param value - Text value to fill
   * @param options - Configuration (timeout: 10000ms, verify: true, clear: true)
   * @returns true if fill successful
   * @throws Error if fill operation fails
   */
  async fillWithValidation(elementName: string, value: string, options?: { timeout?: number; verify?: boolean; clear?: boolean }): Promise<boolean> {
    const { timeout = 10000, verify = true, clear = true } = options || {};
    Log.info(`Filling element: ${elementName} with value: ${value.substring(0, 20)}...`);

    try {
      const element = this.getElement(elementName);
      if (clear) await element.clear({ timeout });
      await element.fill(value, { timeout });

      if (verify) {
        const actualValue = await element.inputValue();
        if (actualValue !== value) {
          Log.warn(`[WARN] Fill verification mismatch. Retrying...`);
          await element.clear({ timeout });
          await element.fill(value, { timeout });
        }
      }

      Log.info(`[OK] Fill successful: ${elementName}`);
      return true;
    } catch (error) {
      Log.error(`[ERR] Fill failed: ${elementName} - ${error}`);
      throw error;
    }
  }

  /**
   * Wait for element to become visible.
   * @param elementName - Element name from selectors/index.ts
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @throws Error if element does not become visible within timeout
   */
  async waitForElement(elementName: string, timeout: number = 10000): Promise<void> {
    Log.info(`Waiting for element: ${elementName}`);
    try {
      const element = this.getElement(elementName);
      await element.waitFor({ state: 'visible', timeout });
      Log.info(`[OK] Element visible: ${elementName}`);
    } catch (error) {
      Log.error(`[ERR] Element not visible: ${elementName} - ${error}`);
      throw error;
    }
  }

  /**
   * Wait for page to fully load and spinners to disappear.
   * @param options - Configuration (state: 'domcontentloaded', spinnerSelectors: ['.spinner', '.loading'], timeout: 30000)
   */
  async waitForPageLoad(options?: { state?: 'load' | 'domcontentloaded' | 'networkidle'; spinnerSelectors?: string[]; timeout?: number }): Promise<void> {
    const { state = 'domcontentloaded', spinnerSelectors = ['.spinner', '.loading'], timeout = 30000 } = options || {};
    Log.info('Waiting for page load...');
    
    await this.page.waitForLoadState(state, { timeout });
    
    for (const selector of spinnerSelectors) {
      const spinner = this.page.locator(selector).first();
      if (await spinner.isVisible().catch(() => false)) {
        await spinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => Log.warn(`Spinner still visible: ${selector}`));
      }
    }
    
    Log.info('[OK] Page loaded');
  }

  /**
   * Take screenshot and save to reports/test-results/screenshots/.
   * @param name - Screenshot filename prefix
   * @param fullPage - Capture full scrollable page (default: true)
   * @returns Path to saved screenshot file
   */
  async takeScreenshot(name: string, fullPage: boolean = true): Promise<string> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `screenshot-${name}-${timestamp}.png`;
    const path = `reports/test-results/screenshots/${filename}`;

    try {
      await this.page.screenshot({ path, fullPage });
      Log.info(`[screenshot] Screenshot saved: ${path}`);
      return path;
    } catch (error) {
      Log.error(`[ERR] Screenshot failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get current page URL.
   * @returns Current page URL as string
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Navigate to URL only if not already there. Reusable across page objects.
   * Checks if current URL contains the target path before calling page.goto().
   * @param url - Full target URL
   * @param pathCheck - Substring to check in current URL (e.g. 'locations/1604/settings')
   * @returns true if navigation occurred, false if skipped
   */
  async navigateIfNeeded(url: string, pathCheck: string): Promise<boolean> {
    if (this.page.url().includes(pathCheck)) {
      Log.info(`Already at ${pathCheck}, skipping navigation`);
      return false;
    }
    await this.navigateTo(url);
    return true;
  }

  /**
   * Get page title.
   * @returns Page title as string
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get text content from element.
   * @param elementName - Element name from selectors/index.ts
   * @param options - Configuration (trim: true)
   * @returns Element text content
   */
  async getTextContent(elementName: string, options?: { trim?: boolean }): Promise<string> {
    const { trim = true } = options || {};
    try {
      const element = this.getElement(elementName);
      let text = await element.textContent() || '';
      if (trim) text = text.trim();
      Log.info(`Text content from ${elementName}: ${text.substring(0, 50)}...`);
      return text;
    } catch (error) {
      Log.error(`[ERR] Failed to get text content: ${elementName} - ${error}`);
      throw error;
    }
  }

  /**
   * Check if element is visible on page.
   * @param elementName - Element name from selectors/index.ts
   * @param timeout - Maximum wait time in milliseconds (default: 5000)
   * @returns true if element is visible, false otherwise
   */
  async isElementVisible(elementName: string, timeout: number = 5000): Promise<boolean> {
    try {
      const element = this.getElement(elementName);
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}
