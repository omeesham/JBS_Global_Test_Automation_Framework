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
import { CheckboxState } from '../pages/locations/location-form-helpers.page';

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

  // ─────────────────────────────────────────────────────────────────────────────
  // SHARED PAGE OBJECT HELPERS (PLAN_04 — extracted from Currency/Pricing/LocalInfo)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Click a save button and confirm the Save Changes dialog if it appears.
   * Extracted from LocationCurrencyPage, LocationPricingPage, LocationLocalInfoPage (identical pattern).
   * ALL-020: shared pattern used by 3+ page objects → belongs in BasePage.
   * @param saveBtnKey - Selector key for the save button (e.g., 'btnSavePricing')
   * @param dialogKey - Selector key for the confirmation dialog (default: 'dlgSaveChanges')
   * @param confirmBtnKey - Selector key for the confirm button (default: 'btnSaveChangesConfirm')
   * @param dialogTimeout - ms to wait for dialog to appear before assuming none (default: 5000)
   */
  protected async clickSaveWithDialog(
    saveBtnKey: string,
    dialogKey: string = 'dlgSaveChanges',
    confirmBtnKey: string = 'btnSaveChangesConfirm',
    dialogTimeout: number = 5_000,
  ): Promise<void> {
    const saveBtn = this.getElement(saveBtnKey);
    await saveBtn.waitFor({ state: 'visible', timeout: 5_000 });
    if (await saveBtn.isDisabled()) {
      Log.info(`Save button disabled (${saveBtnKey}) -- skipping click`);
      return;
    }
    await saveBtn.click();
    const dialog = this.getElement(dialogKey);
    const dialogVisible = await dialog.waitFor({ state: 'visible', timeout: dialogTimeout })
      .then(() => true).catch(() => false);
    if (dialogVisible) {
      Log.info(`Save confirmation dialog appeared -- confirming`);
      await this.getElement(confirmBtnKey).click();
      await dialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    }
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    Log.info(`[OK] Save complete (${saveBtnKey})`);
  }

  /**
   * Navigate to a settings sub-tab for a given office, clicking the tab only if not already active.
   * Extracted from LocationCurrencyPage, LocationPricingPage, LocationLocalInfoPage (identical pattern).
   * ALL-020: shared pattern used by 3+ page objects → belongs in BasePage.
   * @param tabKey - Selector key for the tab element
   * @param readinessElementKey - Selector key for an element confirming the tab content is loaded
   * @param officeNo - Office number (default: '1604')
   * @param settingsPath - The sub-path after /settings/ to navigate to (default: 'location')
   */
  protected async navigateToSubTab(
    tabKey: string,
    readinessElementKey: string,
    officeNo: string = '1604',
    settingsPath: string = 'location',
  ): Promise<void> {
    const currentUrl = this.page.url();
    const expectedPath = `locations/${officeNo}/settings`;
    if (!currentUrl.includes(expectedPath)) {
      const baseUrl = this.config?.base_url || '';
      Log.info(`Navigating to ${expectedPath}/${settingsPath}`);
      await this.navigateTo(`${baseUrl}${expectedPath}/${settingsPath}`);
      await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    }
    const tab = this.getElement(tabKey);
    await tab.waitFor({ state: 'visible', timeout: 30_000 });
    const isSelected = await tab.getAttribute('aria-selected').catch(() => null);
    if (isSelected !== 'true') {
      await tab.click();
      await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    }
    await this.getElement(readinessElementKey).waitFor({ state: 'visible', timeout: 15_000 });
    Log.info(`[OK] Tab active: ${tabKey}`);
  }

  /**
   * Get the checked/disabled state of a Radix UI checkbox (button[role="checkbox"] using aria-checked).
   * Native HTML checkboxes use isChecked(); Radix uses aria-checked attribute — this handles Radix.
   * ALL-020: shared Radix pattern used by Pricing + future pages → belongs in BasePage.
   * @param elementKey - Selector key for the Radix checkbox element
   */
  protected async getRadixCheckboxState(elementKey: string): Promise<CheckboxState> {
    const el = this.getElement(elementKey);
    const ariaChecked = await el.getAttribute('aria-checked').catch(() => null);
    const disabled = await el.isDisabled().catch(() => true);
    return { checked: ariaChecked === 'true', disabled };
  }

  /**
   * Set a Radix UI checkbox to a target checked state (clicks only if state differs).
   * ALL-020: shared Radix pattern → BasePage.
   * @param elementKey - Selector key for the Radix checkbox
   * @param checked - Desired state: true = checked, false = unchecked
   */
  protected async setRadixCheckbox(elementKey: string, checked: boolean): Promise<void> {
    const state = await this.getRadixCheckboxState(elementKey);
    if (state.checked !== checked) {
      await this.getElement(elementKey).click();
      Log.info(`${checked ? 'Checked' : 'Unchecked'} Radix checkbox: ${elementKey}`);
    }
  }

  /**
   * Open a combobox/dropdown, read all [role="option"] text contents, close it, return the list.
   * Handles Radix UI dropdowns that render a [role="listbox"] on click.
   * ALL-020: shared pattern used by Currency + Pricing → BasePage.
   * @param dropdownKey - Selector key for the combobox trigger element
   * @returns Array of trimmed, non-empty option strings
   */
  protected async getComboboxOptions(dropdownKey: string): Promise<string[]> {
    await this.getElement(dropdownKey).click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    const options = await listbox.locator('[role="option"]').allTextContents();
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    return options.map(o => o.trim()).filter(o => o.length > 0);
  }

  /**
   * Open a combobox/dropdown and click the option matching the given text.
   * ALL-020: shared pattern -> BasePage.
   * @param dropdownKey - Selector key for the combobox trigger element
   * @param optionText - Exact display text of the option to select
   */
  protected async selectComboboxOption(dropdownKey: string, optionText: string): Promise<void> {
    await this.getElement(dropdownKey).click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    await listbox.locator(`[role="option"]:has-text("${optionText}")`).click();
    Log.info(`[OK] Selected combobox option "${optionText}" for ${dropdownKey}`);
  }

  /**
   * Get column header texts by iterating over an array of selector keys.
   * MNT-012: shared pattern used by Currency (4 cols) + Pricing (7 cols) -> BasePage.
   * @param keys - Array of selector keys for column header elements
   * @returns Array of trimmed header texts in the same order as keys
   */
  protected async getColumnHeadersByKeys(keys: readonly string[]): Promise<string[]> {
    const headers: string[] = [];
    for (const key of keys) {
      const text = await this.getElement(key).textContent().catch(() => '');
      headers.push((text || '').trim());
    }
    return headers;
  }

  /**
   * Get displayed value of a form field (input or text element).
   * Tries inputValue() first (for input elements), falls back to textContent().
   * MNT-012: shared pattern used by Currency (getMerchantValue) + Pricing (getDropdownValue, getCurrencyFilterValue) -> BasePage.
   * @param selectorKey - Selector key for the field element
   * @returns Trimmed field display value
   */
  protected async getFieldDisplayValue(selectorKey: string): Promise<string> {
    const el = this.getElement(selectorKey);
    const value = await el.inputValue().catch(() => '') || await el.textContent().catch(() => '');
    return (value || '').trim();
  }

  /**
   * Wait for a save button to become enabled (form dirty state propagation).
   * Polls the button disabled state efficiently.
   * MNT-012: extracted from LocationPricingPage -- all tabs have save buttons.
   * @param saveBtnKey - Selector key for the save button
   * @param timeout - Maximum wait time in ms (default: 5000)
   * @returns true if save became enabled within timeout, false otherwise
   */
  protected async waitForSaveEnabled(saveBtnKey: string, timeout = 5_000): Promise<boolean> {
    try {
      const btn = this.getElement(saveBtnKey);
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        if (!(await btn.isDisabled().catch(() => true))) {
          Log.info('[OK] Save button enabled');
          return true;
        }
        await this.page.waitForTimeout(200);
      }
      Log.info('[WARN] Save button did not enable within timeout');
      return false;
    } catch {
      Log.info('[WARN] Save button did not enable within timeout');
      return false;
    }
  }
}
