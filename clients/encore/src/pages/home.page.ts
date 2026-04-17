/**
 * @agent-doc
 * PURPOSE: Home Page Object Model - handles interactions on Navigator Cloud dashboard/home page. Generic scaffold with placeholders for Planner agent to discover actual selectors.
 * OWNER: generator
 * IMPACT: medium - Post-login navigation and dashboard tests depend on this. Breaking it fails dashboard tests.
 * DEPENDS-ON: BasePage, logger.ts, framework-contracts/index.ts
 * USED-BY: tests/specs/navigator/*.spec.ts, tests/setup/fixtures.ts
 * RULES: Planner adds selectors to src/selectors/index.ts first. Generator implements methods. Keep placeholder structure until real selectors discovered.
 */

import { Page } from '@playwright/test';
import { BasePage } from '../common/base-page';
import { Log } from '@framework/utils/logger';
import { IConfig } from '@framework/framework-contracts';

export class HomePage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('HomePage initialized for Navigator Cloud');
  }

  /**
   * Check if home/dashboard page is loaded
   * @returns True if home page loaded successfully
   */
  async isLoaded(): Promise<boolean> {
    try {
      Log.info('Checking if home page is loaded');
      
      // Check URL contains Navigator Cloud path
      const url = this.page.url();
      const expectedHost = new URL(this.config?.base_url || this.config?.url || '').hostname;
      const isNavigatorUrl = expectedHost ? url.includes(expectedHost) : false;
      
      if (!isNavigatorUrl) {
        Log.warn(`Not on Navigator Cloud, URL: ${url}`);
        return false;
      }

      // Wait for page to be in stable state
      await this.page.waitForLoadState('domcontentloaded');
      
      Log.info(`[OK] Home page loaded (URL: ${url})`);
      return true;
    } catch (error) {
      Log.error(`Error checking if home page is loaded: ${error}`);
      return false;
    }
  }

  /**
   * Get page title
   * @returns Page title text
   */
  async getTitle(): Promise<string> {
    const title = await this.page.title();
    Log.info(`Page title: ${title}`);
    return title;
  }

}

