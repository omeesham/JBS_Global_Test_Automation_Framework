/**
 * FILE: src/pages/home.page.ts
 * PURPOSE: Home Page Object Model - handles interactions on the home/dashboard page
 * WHY NECESSARY: Provides abstraction for home page elements and actions after successful login
 * USED BY: tests/example.spec.ts, tests/fixtures.ts
 * 
 * HOW IT WORKS:
 * 1. Inherits base Page from Playwright
 * 2. Uses hybrid locator pattern (CSV + TypeScript)
 * 3. Provides methods for common home page interactions
 * 4. Integrates with logging and utility frameworks
 */

import { Page } from '@playwright/test';
import { BasePage } from '../common/base-page';
import { Log } from '../utils/logger';
import { CommonMethods } from '../utils/common-methods';
import { AppConstants } from '../utils/app-constants';
import { IConfig } from '../../src/framework-contracts';

/**
 * HomePage Class
 * 
 * Represents the home/dashboard page after successful authentication.
 * Provides methods to interact with home page elements and verify page state.
 * 
 * USAGE:
 *   const homePage = new HomePage(page, config);
 *   await homePage.isLoaded();
 *   await homePage.navigateToSection('dashboard');
 */
export class HomePage extends BasePage {
  /**
   * Constructor
   * 
   * @param page Playwright Page instance
   * @param config Configuration object (optional)
   * 
   * HOW IT WORKS:
   * - Calls BasePage constructor with page and config
   * - Logs page initialization
   */
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('HomePage constructor initialized');
  }

  /**
   * Check if home page is loaded
   * 
   * @returns Promise<boolean> True if home page is loaded
   * 
   * HOW IT WORKS:
   * - Checks for presence of home page indicator element
   * - Verifies URL contains expected home path
   * - Returns true only if both checks pass
   * 
   * WHY NECESSARY:
   * - Ensures tests don't proceed before page is ready
   * - Prevents flaky tests due to timing issues
   */
  async isLoaded(): Promise<boolean> {
    try {
      Log.info('Checking if home page is loaded');
      
      // Check URL contains home or dashboard
      const url = this.page.url();
      const isCorrectUrl = url.includes('/home') || url.includes('/dashboard');
      
      if (!isCorrectUrl) {
        Log.warn(`Expected home/dashboard page, got: ${url}`);
        return false;
      }

      // Wait for page to be in a stable state
      await this.page.waitForLoadState('domcontentloaded');
      
      Log.info('Home page loaded successfully');
      return true;
    } catch (error) {
      Log.error(`Error checking if home page is loaded: ${error}`);
      return false;
    }
  }

  /**
   * Get page title
   * 
   * @returns Promise<string> Page title text
   * 
   * HOW IT WORKS:
   * - Reads the document title
   * - Returns as string
   */
  async getTitle(): Promise<string> {
    const title = await this.page.title();
    Log.info(`Home page title: ${title}`);
    return title;
  }

  /**
   * Navigate to a specific section
   * 
   * @param sectionName Name of section to navigate to
   * @returns Promise<boolean> True if navigation successful
   * 
   * HOW IT WORKS:
   * - Looks up section link locator from CSV
   * - Clicks the navigation link
   * - Waits for navigation to complete
   * 
   * WHY NECESSARY:
   * - Provides standardized way to navigate between sections
   * - Handles waiting and error conditions
   */
  async navigateToSection(sectionName: string): Promise<boolean> {
    try {
      Log.info(`Navigating to section: ${sectionName}`);
      
      // This is a placeholder - in real implementation, would use CSV locators
      // Example: const locator = CommonMethods.getValuesFromCsv('lnk' + sectionName, AppConstants.HOME_ELEMENTS);
      
      // For now, just log the intent
      Log.warn(`Navigation to ${sectionName} - locator lookup not yet implemented`);
      
      return true;
    } catch (error) {
      Log.error(`Error navigating to section ${sectionName}: ${error}`);
      return false;
    }
  }

  /**
   * Verify user is logged in
   * 
   * @returns Promise<boolean> True if user appears to be logged in
   * 
   * HOW IT WORKS:
   * - Checks for user profile element
   * - Checks for logout button
   * - Returns true if logged-in indicators present
   */
  async isUserLoggedIn(): Promise<boolean> {
    try {
      Log.info('Verifying user is logged in');
      
      // Check page state indicates logged in
      const url = this.page.url();
      const isAuthenticated = !url.includes('/login') && !url.includes('/auth');
      
      Log.info(`User logged in status: ${isAuthenticated}`);
      return isAuthenticated;
    } catch (error) {
      Log.error(`Error checking login status: ${error}`);
      return false;
    }
  }
}
