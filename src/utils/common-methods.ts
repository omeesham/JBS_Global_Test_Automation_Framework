/**
 * Common Methods Utility
 * Shared utility methods for framework operations
 * Migrated from utils/common_methods.py
 */

import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { authenticator } from 'otplib';
import * as dotenv from 'dotenv';
import { Log } from './logger';
import { IConfig, ILocatorRepository, IValidationFields } from '../types';

// Load environment variables
dotenv.config();

/**
 * Allure Helper for reporting
 */
export class AllureHelper {
  /**
   * Attach text information to Allure report before test execution
   */
  static before(message: string, name: string = 'Test Info'): void {
    try {
      const allure = require('allure-js-commons');
      allure.attachment(name, message, 'text/plain');
    } catch (error) {
      // Allure not available, skip
    }
  }

  /**
   * Attach test result to Allure report after test execution
   */
  static after(message: string): void {
    this.before(message, 'Test Result');
  }
}

// Alias for consistent usage
export const allure = AllureHelper;

/**
 * Common Methods class with utility functions
 */
export class CommonMethods {
  private static _page: Page | null = null;
  private static _props: IConfig | null = null;
  private static _locators: ILocatorRepository = {};
  private static _loadedFiles: Set<string> = new Set();

  /**
   * Initialize with page instance
   */
  constructor(page: Page) {
    Log.info('CommonMethods constructor');
    CommonMethods._page = page;
  }

  /**
   * Take a screenshot of the current page
   */
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

  /**
   * Initialize properties from config file
   * Supports both .env and config.json
   */
  static initProp(): IConfig {
    const baseUrl = process.env.BASE_URL || 'https://your-app-url.com';
    const config: IConfig = {
      browser: process.env.DEFAULT_BROWSER || 'chrome',
      url: baseUrl,
      base_url: baseUrl,  // Alias for test compatibility
      home_url: process.env.HOME_URL || 'https://your-app-url.com',
      username_automation: process.env.USERNAME_AUTOMATION || 'test_user',
      password_automation: process.env.PASSWORD_AUTOMATION || 'test_password',
      mfa_secret: process.env.MFA_SECRET,
    };

    // Try to load from config.json if it exists
    const configPath = path.join(process.cwd(), 'config', 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        Object.assign(config, fileConfig);
      } catch (error) {
        Log.error(`Error loading config.json: ${error}`);
      }
    }

    this._props = config;
    return config;
  }

  /**
   * Retrieve value from CSV file
   */
  static getValuesFromCsv(elementName: string, fileName: string): string | null {
    let locator: string | null = null;

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

    return locator;
  }

  /**
   * Update or add a locator
   */
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

  /**
   * Save locators back to the CSV file
   */
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

  /**
   * Load CSV file
   */
  private static _loadCsv(fileName: string): ILocatorRepository {
    const csvFile = path.join(process.cwd(), 'object_repository', fileName);
    const locators: ILocatorRepository = {};

    try {
      const fileContent = fs.readFileSync(csvFile, 'utf-8');
      const records = parse(fileContent, {
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

  /**
   * Generate TOTP code from secret key
   */
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

  /**
   * Validate element text matches expected value
   */
  static async validateText(
    page: Page,
    csvKey: string,
    expected: string,
    csvFile: string,
    timeout: number = 5000
  ): Promise<boolean> {
    const locator = this.getValuesFromCsv(csvKey, csvFile);
    if (!locator) throw new Error(`Locator not found for ${csvKey}`);

    await page.waitForSelector(locator, { timeout });
    const actualContent = await page.textContent(locator);
    let actual = (actualContent || '').trim();
    
    // Clean non-breaking spaces
    actual = actual.replace(/\u00a0/g, ' ');

    Log.info(`Validating ${csvKey}: expected='${expected}', actual='${actual}'`);
    
    if (actual !== expected) {
      throw new Error(`Text mismatch for ${csvKey}: expected '${expected}', got '${actual}'`);
    }
    
    allure.after(`✓ Validated ${csvKey}: ${expected}`);
    return true;
  }

  /**
   * Validate popup/dialog title and message
   */
  static async validatePopup(
    page: Page,
    expectedTitle: string,
    expectedMessage: string,
    csvFile: string,
    timeout: number = 5000
  ): Promise<boolean> {
    // Validate title
    const titleLocator = this.getValuesFromCsv('lbl_DialogTitle', csvFile);
    if (!titleLocator) throw new Error('Dialog title locator not found');
    
    await page.waitForSelector(titleLocator, { timeout });
    const actualTitle = (await page.textContent(titleLocator))?.trim() || '';
    
    if (actualTitle !== expectedTitle) {
      throw new Error(`Popup title mismatch: expected '${expectedTitle}', got '${actualTitle}'`);
    }

    // Validate message
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

  /**
   * Validate dropdown/list options match expected array
   */
  static async validateListOptions(
    page: Page,
    csvKey: string,
    expectedOptions: string[],
    csvFile: string,
    timeout: number = 5000
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

  /**
   * Validate multiple fields at once using a dictionary
   */
  static async validateFields(
    page: Page,
    fields: IValidationFields,
    csvFile: string,
    timeout: number = 5000
  ): Promise<boolean> {
    for (const [csvKey, expected] of Object.entries(fields)) {
      await this.validateText(page, csvKey, expected, csvFile, timeout);
    }

    Log.info(`✓ Validated ${Object.keys(fields).length} fields`);
    return true;
  }

  /**
   * Validate search list options
   */
  static async validateSearchList(
    page: Page,
    csvFile: string,
    timeout: number = 5000
  ): Promise<boolean> {
    const { AppConstants } = require('./app-constants');
    const expectedOptions = AppConstants.SEARCH_LIST;

    return await this.validateListOptions(page, 'lst_SearchList', expectedOptions, csvFile, timeout);
  }

  /**
   * Normalize date string to a common format for comparison
   */
  static normalizeDate(dateStr: string): string {
    const formats = [
      { regex: /^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/, format: 'MMM DD, YYYY' }, // Jun 28, 1953
      { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, format: 'M/D/YYYY' },          // 6/28/1953
      { regex: /^(\d{4})-(\d{2})-(\d{2})$/, format: 'YYYY-MM-DD' },              // 1953-06-28
    ];

    for (const { regex, format } of formats) {
      if (regex.test(dateStr.trim())) {
        // Simple normalization - just return trimmed for now
        // Full date parsing can use moment.js or date-fns if needed
        return dateStr.trim();
      }
    }

    return dateStr.trim();
  }

  /**
   * Clear cached locators (useful between test classes)
   */
  static clearLocatorCache(): void {
    this._locators = {};
    this._loadedFiles.clear();
    Log.info('Cleared locator cache');
  }
}
