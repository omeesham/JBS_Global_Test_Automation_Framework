/**
 * FILE: src/utils/common-methods.ts
 * PURPOSE: Shared utility methods for framework-wide operations
 * WHY NECESSARY: Centralizes ALL common operations — CSV, config, MFA, scroll, timing, validation
 * USED BY: All page objects, test files, workflow methods
 *
 * HOW IT WORKS:
 * 1. Provides initProp() to load IConfig from .env files
 * 2. getValuesFromCsv() reads element locators from CSV files
 * 3. getSelector() unified lookup (TypeScript first, CSV fallback)
 * 4. generateMfaCode() creates TOTP codes for authentication
 * 5. Scroll, timing, and validation utilities (consolidated from separate files)
 * 6. Integrates with Allure reporting for test documentation
 */

import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { authenticator } from 'otplib';
import * as dotenv from 'dotenv';
import { Log } from './logger';
import { IConfig, ILocatorRepository, IValidationFields } from '../../src/framework-contracts';

// Load environment variables
dotenv.config();

/**
 * Allure Helper for reporting
 */
export class AllureHelper {
  static before(message: string, name: string = 'Test Info'): void {
    try {
      const allure = require('allure-js-commons');
      allure.attachment(name, message, 'text/plain');
    } catch (error) {
      // Allure not available, skip
    }
  }

  static after(message: string): void {
    this.before(message, 'Test Result');
  }
}

export const allure = AllureHelper;

/**
 * Common Methods — single utility class for the entire framework
 */
export class CommonMethods {
  private static _page: Page | null = null;
  private static _props: IConfig | null = null;
  private static _locators: ILocatorRepository = {};
  private static _loadedFiles: Set<string> = new Set();

  constructor(page: Page) {
    Log.info('CommonMethods constructor');
    CommonMethods._page = page;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREENSHOT
  // ═══════════════════════════════════════════════════════════════════════════

  static async takeScreenshot(): Promise<string> {
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const screenshotPath = path.join(reportsDir, `${timestamp}.png`);

    try {
      if (this._page) {
        await this._page.screenshot({ path: screenshotPath, fullPage: true });
      }
    } catch (error) {
      Log.error(`Error taking screenshot: ${error}`);
    }

    return screenshotPath;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG
  // ═══════════════════════════════════════════════════════════════════════════

  static initProp(): IConfig {
    const baseUrl = process.env.BASE_URL || 'https://your-app-url.com';
    const config: IConfig = {
      browser: process.env.DEFAULT_BROWSER || 'chrome',
      url: baseUrl,
      base_url: baseUrl,
      home_url: process.env.HOME_URL || 'https://your-app-url.com',
      username_automation: process.env.USERNAME_AUTOMATION || 'test_user',
      password_automation: process.env.PASSWORD_AUTOMATION || 'test_password',
      mfa_secret: process.env.MFA_SECRET,
    };

    this._props = config;
    return config;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CSV LOCATOR OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  static getValuesFromCsv(elementName: string, fileName: string): string | null {
    let locator: string | null | undefined = null;

    if (this._loadedFiles.has(fileName)) {
      Log.info(`Locators already loaded for ${fileName}`);
    } else {
      const newLocators = this._loadCsv(fileName);
      this._locators = { ...this._locators, ...newLocators };
      this._loadedFiles.add(fileName);
    }

    if (elementName in this._locators) {
      locator = this._locators[elementName];
    } else {
      Log.info(`Element '${elementName}' not found in the file.`);
      const keys = Object.keys(this._locators).slice(0, 10);
      Log.info(`Available keys in _locators: ${keys.join(', ')}`);
    }

    return locator || null;
  }

  /**
   * Unified selector lookup — TypeScript selectors first, CSV fallback
   */
  static getSelector(elementName: string, csvFile?: string): string | null {
    try {
      const { getTsSelector } = require('../selectors');
      const tsSelector = getTsSelector(elementName);
      if (tsSelector) return tsSelector;
    } catch {
      // TypeScript selectors module not loaded, fall through to CSV
    }
    if (csvFile) return this.getValuesFromCsv(elementName, csvFile);
    return null;
  }

  static updateLocator(elementName: string, locator: string, fileName: string): void {
    this._locators = this._loadCsv(fileName);

    if (elementName in this._locators) {
      Log.info(`Updating locator for element: ${elementName}`);
    } else {
      Log.info(`Adding new element: ${elementName}`);
    }

    this._locators[elementName] = locator;
    this._saveLocators(this._locators, fileName);
  }

  private static _saveLocators(locators: ILocatorRepository, fileName: string): void {
    const csvFile = path.join(process.cwd(), 'object_repository', fileName);

    try {
      const records = Object.entries(locators).map(([key, value]) => ({
        'Element Name': key,
        'Locator': value,
      }));

      const csvContent = stringify(records, {
        header: true,
        columns: ['Element Name', 'Locator'],
      });

      fs.writeFileSync(csvFile, csvContent, 'utf-8');
      Log.info('Locators saved successfully.');
    } catch (error) {
      Log.error(`Error writing to the file: ${error}`);
    }
  }

  private static _loadCsv(fileName: string): ILocatorRepository {
    const csvFile = path.join(process.cwd(), 'object_repository', fileName);
    const locators: ILocatorRepository = {};

    try {
      const fileContent = fs.readFileSync(csvFile, 'utf-8');

      // Filter out full-line comments (lines starting with #) before parsing
      // This preserves field values that start with # (like #login-form selectors)
      const filteredContent = fileContent
        .split('\n')
        .filter(line => !line.trim().startsWith('#'))
        .join('\n');

      const records = parse(filteredContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      for (const row of records) {
        const key = row['Element Name']?.trim();
        const value = row['Locator']?.trim();

        if (key && value) {
          locators[key] = value;
        }
      }

      Log.info(`Locators loaded successfully. Loaded ${Object.keys(locators).length} locators from ${fileName}`);
      if (Object.keys(locators).length > 0) {
        const sampleKeys = Object.keys(locators).slice(0, 5);
        Log.info(`Sample locator keys: ${sampleKeys.join(', ')}`);
      }
    } catch (error) {
      Log.error(`Error reading the file: ${error}`);
    }

    return locators;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MFA / TOTP
  // ═══════════════════════════════════════════════════════════════════════════

  static generateTotpCode(secret: string): string {
    try {
      const code = authenticator.generate(secret);
      Log.info(`Generated TOTP code: ${code}`);
      return code;
    } catch (error) {
      Log.error(`Error generating TOTP code: ${error}`);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELEMENT VALIDATION (Page-based)
  // ═══════════════════════════════════════════════════════════════════════════

  static async validateText(
    page: Page, csvKey: string, expected: string, csvFile: string, timeout: number = 5000
  ): Promise<boolean> {
    const locator = this.getValuesFromCsv(csvKey, csvFile);
    if (!locator) throw new Error(`Locator not found for ${csvKey}`);

    await page.waitForSelector(locator, { timeout });
    const actualContent = await page.textContent(locator);
    let actual = (actualContent || '').trim();
    actual = actual.replace(/\u00a0/g, ' ');

    Log.info(`Validating ${csvKey}: expected='${expected}', actual='${actual}'`);
    if (actual !== expected) {
      throw new Error(`Text mismatch for ${csvKey}: expected '${expected}', got '${actual}'`);
    }
    allure.after(`✓ Validated ${csvKey}: ${expected}`);
    return true;
  }

  static async validatePopup(
    page: Page, expectedTitle: string, expectedMessage: string, csvFile: string, timeout: number = 5000
  ): Promise<boolean> {
    const titleLocator = this.getValuesFromCsv('lbl_DialogTitle', csvFile);
    if (!titleLocator) throw new Error('Dialog title locator not found');

    await page.waitForSelector(titleLocator, { timeout });
    const actualTitle = (await page.textContent(titleLocator))?.trim() || '';
    if (actualTitle !== expectedTitle) {
      throw new Error(`Popup title mismatch: expected '${expectedTitle}', got '${actualTitle}'`);
    }

    const msgLocator = this.getValuesFromCsv('lbl_DialogText', csvFile);
    if (!msgLocator) throw new Error('Dialog message locator not found');

    const actualMsg = (await page.textContent(msgLocator))?.trim() || '';
    if (actualMsg !== expectedMessage) {
      throw new Error(`Popup message mismatch: expected '${expectedMessage}', got '${actualMsg}'`);
    }

    Log.info(`✓ Popup validated: '${actualTitle}' - '${actualMsg}'`);
    allure.after(`✓ Popup: ${expectedTitle}`);
    return true;
  }

  static async validateListOptions(
    page: Page, csvKey: string, expectedOptions: string[], csvFile: string, timeout: number = 5000
  ): Promise<boolean> {
    const locatorStr = this.getValuesFromCsv(csvKey, csvFile);
    if (!locatorStr) throw new Error(`Locator not found for ${csvKey}`);

    await page.waitForSelector(locatorStr, { timeout });
    const elements = page.locator(locatorStr);
    const count = await elements.count();

    if (count !== expectedOptions.length) {
      throw new Error(`Option count mismatch: expected ${expectedOptions.length}, got ${count}`);
    }

    for (let i = 0; i < count; i++) {
      const actual = (await elements.nth(i).textContent())?.trim() || '';
      const expected = expectedOptions[i];
      if (actual !== expected) {
        throw new Error(`Option ${i} mismatch: expected '${expected}', got '${actual}'`);
      }
    }

    Log.info(`✓ Validated ${count} options for ${csvKey}`);
    allure.after(`✓ List options validated: ${csvKey}`);
    return true;
  }

  static async validateFields(
    page: Page, fields: IValidationFields, csvFile: string, timeout: number = 5000
  ): Promise<boolean> {
    for (const [csvKey, expected] of Object.entries(fields)) {
      await this.validateText(page, csvKey, expected, csvFile, timeout);
    }
    Log.info(`✓ Validated ${Object.keys(fields).length} fields`);
    return true;
  }

  static async validateSearchList(page: Page, csvFile: string, timeout: number = 5000): Promise<boolean> {
    const { AppConstants } = require('./app-constants');
    const expectedOptions = AppConstants.SEARCH_LIST;
    return await this.validateListOptions(page, 'lst_SearchList', expectedOptions, csvFile, timeout);
  }

  static normalizeDate(dateStr: string): string {
    const formats = [
      { regex: /^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/, format: 'MMM DD, YYYY' },
      { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, format: 'M/D/YYYY' },
      { regex: /^(\d{4})-(\d{2})-(\d{2})$/, format: 'YYYY-MM-DD' },
    ];

    for (const { regex } of formats) {
      if (regex.test(dateStr.trim())) {
        return dateStr.trim();
      }
    }
    return dateStr.trim();
  }

  static clearLocatorCache(): void {
    this._locators = {};
    this._loadedFiles.clear();
    Log.info('Cleared locator cache');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCROLL UTILITIES (merged from scroll-utils.ts)
  // ═══════════════════════════════════════════════════════════════════════════

  static async scrollIntoView(
    page: Page, selector: string | Locator, _behavior: 'auto' | 'smooth' = 'smooth'
  ): Promise<void> {
    const locator = typeof selector === 'string' ? page.locator(selector) : selector;
    await locator.scrollIntoViewIfNeeded();
    Log.info(`Scrolled element into view: ${typeof selector === 'string' ? selector : 'locator'}`);
  }

  static async scrollToTop(page: Page): Promise<void> {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    Log.info('Scrolled to top of page');
  }

  static async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    Log.info('Scrolled to bottom of page');
  }

  static async scrollBy(page: Page, x: number, y: number): Promise<void> {
    await page.evaluate(({ x, y }) => window.scrollBy({ left: x, top: y, behavior: 'smooth' }), { x, y });
    Log.info(`Scrolled by offset: x=${x}, y=${y}`);
  }

  static async scrollUntil(
    page: Page, condition: () => Promise<boolean>, maxScrolls: number = 10, scrollAmount: number = 500
  ): Promise<void> {
    let scrollCount = 0;
    while (scrollCount < maxScrolls) {
      if (await condition()) {
        Log.info(`Scroll condition met after ${scrollCount} scrolls`);
        return;
      }
      await this.scrollBy(page, 0, scrollAmount);
      await page.waitForTimeout(500);
      scrollCount++;
    }
    Log.warn(`Max scrolls (${maxScrolls}) reached without meeting condition`);
  }

  static async getScrollPosition(page: Page): Promise<{ x: number; y: number }> {
    return await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMING UTILITIES (merged from timing-utils.ts)
  // ═══════════════════════════════════════════════════════════════════════════

  static async retryWithBackoff<T>(
    action: () => Promise<T>,
    options?: { maxRetries?: number; initialDelay?: number; maxDelay?: number; backoffFactor?: number }
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? 3;
    const initialDelay = options?.initialDelay ?? 1000;
    const maxDelay = options?.maxDelay ?? 10000;
    const backoffFactor = options?.backoffFactor ?? 2;

    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await action();
        if (attempt > 1) Log.info(`Action succeeded on attempt ${attempt}`);
        return result;
      } catch (error: any) {
        lastError = error;
        Log.warn(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
        if (attempt < maxRetries) {
          Log.info(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
          delay = Math.min(delay * backoffFactor, maxDelay);
        }
      }
    }
    throw new Error(`Action failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  static async waitForCondition(
    condition: () => Promise<boolean>,
    options?: { timeout?: number; pollInterval?: number; errorMessage?: string }
  ): Promise<boolean> {
    const timeout = options?.timeout ?? 30000;
    const pollInterval = options?.pollInterval ?? 500;
    const errorMessage = options?.errorMessage ?? 'Condition not met within timeout';

    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        if (await condition()) {
          Log.info(`Condition met after ${Date.now() - startTime}ms`);
          return true;
        }
      } catch {
        // Condition check failed, continue polling
      }
      await this.sleep(pollInterval);
    }

    Log.warn(`${errorMessage} (timeout: ${timeout}ms)`);
    return false;
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async executeWithTimeout<T>(action: () => Promise<T>, timeout: number, errorMessage?: string): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage || `Action timed out after ${timeout}ms`)), timeout);
    });
    return Promise.race([action(), timeoutPromise]);
  }

  static async poll<T>(
    pollFunction: () => Promise<T | null | undefined>, timeout: number = 30000, pollInterval: number = 500
  ): Promise<T | null> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const result = await pollFunction();
      if (result !== null && result !== undefined) return result;
      await this.sleep(pollInterval);
    }
    Log.warn(`Polling timed out after ${timeout}ms`);
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA VALIDATION UTILITIES (merged from validation-utils.ts)
  // ═══════════════════════════════════════════════════════════════════════════

  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^\+?1?\d{10,14}$/.test(cleaned);
  }

  static validateDate(date: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parts = date.split('-').map(Number);
    if (parts.length !== 3) return false;
    const year = parts[0]!;
    const month = parts[1]!;
    const day = parts[2]!;
    const dateObj = new Date(year, month - 1, day);
    return dateObj.getFullYear() === year && dateObj.getMonth() === month - 1 && dateObj.getDate() === day;
  }

  static extractNumbers(text: string): string {
    return text.replace(/\D/g, '');
  }

  static compareTexts(
    expected: string, actual: string,
    options?: { ignoreCase?: boolean; trim?: boolean; ignoreWhitespace?: boolean }
  ): boolean {
    let exp = expected;
    let act = actual;
    if (options?.trim !== false) { exp = exp.trim(); act = act.trim(); }
    if (options?.ignoreWhitespace) { exp = exp.replace(/\s+/g, ''); act = act.replace(/\s+/g, ''); }
    if (options?.ignoreCase) { exp = exp.toLowerCase(); act = act.toLowerCase(); }
    return exp === act;
  }

  static formatDate(date: Date | string, format: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    switch (format) {
      case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
      default: return `${year}-${month}-${day}`;
    }
  }

  /**
   * Add or subtract days from a date
   * @param date - Date object or string
   * @param days - Number of days (positive = future, negative = past)
   * @returns New Date object
   */
  static addDays(date: Date | string, days: number): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    dateObj.setDate(dateObj.getDate() + days);
    return dateObj;
  }

  /**
   * Add or subtract months from a date
   * @param date - Date object or string
   * @param months - Number of months (positive = future, negative = past)
   * @returns New Date object
   */
  static addMonths(date: Date | string, months: number): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    dateObj.setMonth(dateObj.getMonth() + months);
    return dateObj;
  }

  static matchesPattern(text: string, pattern: string | RegExp): boolean {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(text);
  }

  static validateUrl(url: string): boolean {
    try { new URL(url); return true; } catch { return false; }
  }
}
