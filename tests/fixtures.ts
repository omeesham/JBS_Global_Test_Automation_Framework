/**
 * Playwright Test Fixtures
 * Custom fixtures for page objects and configuration
 */

import './custom-matchers';
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { LandingPage } from '../src/pages/landing.page';
import { HomePage } from '../src/pages/home.page';
import { WorkingScreenPage } from '../src/pages/working-screen.page';
import { WorkingScreenPageAudit } from '../src/pages/working-screen-audit.page';
import { CommonMethods } from '../src/utils/common-methods';
import { IConfig } from '../src/framework-contracts';

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
