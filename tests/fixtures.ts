/**
 * Playwright Test Fixtures
 * Custom fixtures for page objects and configuration
 * Migrated from tests/conftest.py
 */

import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { LandingPage } from '../src/pages/landing.page';
import { HomePage } from '../src/pages/home.page';
import { WorkingScreenPage } from '../src/pages/working-screen.page';
import { WorkingScreenPageAudit } from '../src/pages/working-screen-audit.page';
import { CommonMethods } from '../src/utils/common-methods';
import { IConfig } from '../types';

// Define fixture types
type MyFixtures = {
  config: IConfig;
  commonMethods: CommonMethods;
  loginPage: LoginPage;
  landingPage: LandingPage;
  homePage: HomePage;
  workingScreenPage: WorkingScreenPage;
  workingScreenPageAudit: WorkingScreenPageAudit;
};

/**
 * Extended test with custom fixtures
 * Usage: import { test, expect } from './fixtures';
 */
export const test = base.extend<MyFixtures>({
  /**
   * Configuration fixture
   * Loads configuration from environment variables and config files
   */
  config: async ({}, use) => {
    const config = CommonMethods.initProp();
    await use(config);
  },

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
   * Auto-initialized LoginPage instance
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * LandingPage fixture
   * Auto-initialized LandingPage instance
   */
  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await use(landingPage);
  },

  /**
   * HomePage fixture
   * Auto-initialized HomePage instance
   */
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  /**
   * WorkingScreenPage fixture
   * Auto-initialized WorkingScreenPage instance
   */
  workingScreenPage: async ({ page }, use) => {
    const workingScreenPage = new WorkingScreenPage(page);
    await use(workingScreenPage);
  },

  /**
   * WorkingScreenPageAudit fixture
   * Auto-initialized WorkingScreenPageAudit instance
   */
  workingScreenPageAudit: async ({ page }, use) => {
    const workingScreenPageAudit = new WorkingScreenPageAudit(page);
    await use(workingScreenPageAudit);
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
