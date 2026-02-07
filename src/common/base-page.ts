/**
 * FILE: src/common/base-page.ts
 * PURPOSE: Base class for all Page Object Model (POM) classes
 * WHY NECESSARY: Centralize common page operations, reduce duplication, enforce patterns
 * USED BY: All page objects (LoginPage, HomePage, etc.) extend this class
 * 
 * HOW IT WORKS:
 * 1. All page objects inherit from BasePage
 * 2. BasePage provides common methods (click, fill, wait, etc.)
 * 3. Page-specific logic in child classes
 * 4. Integrates with CSV locators, logging, error handling
 */

import { Page, Locator } from '@playwright/test';
import { CommonMethods } from '../utils/common-methods';
import { Log } from '../utils/logger';
import { IConfig } from '../../types';

export class BasePage {
  protected page: Page;
  protected config?: IConfig;

  constructor(page: Page, config?: IConfig) {
    this.page = page;
    this.config = config;
  }

  // Locator helpers
  protected getLocator(elementName: string, csvFile: string): string {
    const locator = CommonMethods.getValuesFromCsv(elementName, csvFile);
    if (!locator) {
      Log.error(`Locator not found: ${elementName} in ${csvFile}`);
      throw new Error(`Locator '${elementName}' not found in '${csvFile}'`);
    }
    return locator;
  }

  protected getElement(elementName: string, csvFile: string): Locator {
    const selector = this.getLocator(elementName, csvFile);
    return this.page.locator(selector);
  }

  // Navigation
  async navigateTo(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; timeout?: number; maxRetries?: number }): Promise<boolean> {
    const { waitUntil = 'domcontentloaded', timeout = 30000, maxRetries = 2 } = options || {};
    Log.info(`Navigating to: ${url}`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.page.goto(url, { waitUntil, timeout });
        Log.info(`✅ Navigation successful: ${url}`);
        return true;
      } catch (error) {
        Log.warn(`⚠️ Navigation attempt ${attempt}/${maxRetries} failed: ${error}`);
        if (attempt === maxRetries) {
          Log.error(`❌ Navigation failed after ${maxRetries} attempts: ${url}`);
          throw error;
        }
        await this.page.waitForTimeout(1000);
      }
    }
    return false;
  }

  // Element interactions
  async clickWithRetry(elementName: string, csvFile: string, options?: { timeout?: number; maxRetries?: number }): Promise<boolean> {
    const { timeout = 10000, maxRetries = 3 } = options || {};
    Log.info(`Clicking element: ${elementName}`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const element = this.getElement(elementName, csvFile);
        await element.click({ timeout });
        Log.info(`✅ Click successful: ${elementName}`);
        return true;
      } catch (error) {
        Log.warn(`⚠️ Click attempt ${attempt}/${maxRetries} failed: ${elementName}`);
        if (attempt === maxRetries) {
          Log.error(`❌ Click failed after ${maxRetries} attempts: ${elementName}`);
          await this.takeScreenshot(`click-failed-${elementName}`);
          throw error;
        }
        await this.page.waitForTimeout(500);
      }
    }
    return false;
  }

  async fillWithValidation(elementName: string, csvFile: string, value: string, options?: { timeout?: number; verify?: boolean; clear?: boolean }): Promise<boolean> {
    const { timeout = 10000, verify = true, clear = true } = options || {};
    Log.info(`Filling element: ${elementName} with value: ${value.substring(0, 20)}...`);

    try {
      const element = this.getElement(elementName, csvFile);
      if (clear) await element.clear({ timeout });
      await element.fill(value, { timeout });

      if (verify) {
        const actualValue = await element.inputValue();
        if (actualValue !== value) {
          Log.warn(`⚠️ Fill verification mismatch. Retrying...`);
          await element.clear({ timeout });
          await element.fill(value, { timeout });
        }
      }

      Log.info(`✅ Fill successful: ${elementName}`);
      return true;
    } catch (error) {
      Log.error(`❌ Fill failed: ${elementName} - ${error}`);
      await this.takeScreenshot(`fill-failed-${elementName}`);
      throw error;
    }
  }

  // Waits
  async waitForElement(elementName: string, csvFile: string, timeout: number = 10000): Promise<boolean> {
    Log.info(`Waiting for element: ${elementName}`);
    try {
      const element = this.getElement(elementName, csvFile);
      await element.waitFor({ state: 'visible', timeout });
      Log.info(`✅ Element visible: ${elementName}`);
      return true;
    } catch (error) {
      Log.error(`❌ Element not visible: ${elementName} - ${error}`);
      await this.takeScreenshot(`wait-failed-${elementName}`);
      throw error;
    }
  }

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
    
    Log.info('✅ Page loaded');
  }

  // Utilities
  async takeScreenshot(name: string, fullPage: boolean = true): Promise<string> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `screenshot-${name}-${timestamp}.png`;
    const path = `test-results/screenshots/${filename}`;

    try {
      await this.page.screenshot({ path, fullPage });
      Log.info(`📸 Screenshot saved: ${path}`);
      return path;
    } catch (error) {
      Log.error(`❌ Screenshot failed: ${error}`);
      throw error;
    }
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getTextContent(elementName: string, csvFile: string, options?: { trim?: boolean }): Promise<string> {
    const { trim = true } = options || {};
    try {
      const element = this.getElement(elementName, csvFile);
      let text = await element.textContent() || '';
      if (trim) text = text.trim();
      Log.info(`Text content from ${elementName}: ${text.substring(0, 50)}...`);
      return text;
    } catch (error) {
      Log.error(`❌ Failed to get text content: ${elementName} - ${error}`);
      throw error;
    }
  }

  async isElementVisible(elementName: string, csvFile: string, timeout: number = 5000): Promise<boolean> {
    try {
      const element = this.getElement(elementName, csvFile);
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}
