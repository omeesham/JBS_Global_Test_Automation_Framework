import { Page } from '@playwright/test';
import { Log } from './logger';
import { IConfig } from '../framework-contracts';

/**
 * Common Methods -- config loading.
 * Used by fixtures (initProp) and login page.
 */
export class CommonMethods {
  constructor(_page: Page) {
    Log.info('CommonMethods constructor');
  }

 /**
 * Load configuration from environment variables.
 * Reads .env files from config/environments/ using dotenv-flow cascade.
 * @returns IConfig object with URLs
 */
  static initProp(): IConfig {
    const baseUrl = process.env.BASE_URL || '';
    const config: IConfig = {
      browser: process.env.DEFAULT_BROWSER || 'chrome',
      url: baseUrl,
      base_url: baseUrl,
      home_url: process.env.HOME_URL || '',
    };

    return config;
  }
}
