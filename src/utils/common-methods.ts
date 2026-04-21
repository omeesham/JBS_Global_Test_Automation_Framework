import { Page } from '@playwright/test';
import { authenticator } from 'otplib';
import { Log } from './logger';
import { IConfig } from '../framework-contracts';

/**
 * Common Methods -- config loading and TOTP generation.
 * Used by fixtures (initProp) and login page.
 */
export class CommonMethods {
  constructor(_page: Page) {
    Log.info('CommonMethods constructor');
  }

 /**
 * Load configuration from environment variables.
 * Reads .env files from config/environments/ using dotenv-flow cascade.
 * @returns IConfig object with URLs and credentials
 */
  static initProp(): IConfig {
    const baseUrl = process.env.BASE_URL || '';
    const config: IConfig = {
      browser: process.env.DEFAULT_BROWSER || 'chrome',
      url: baseUrl,
      base_url: baseUrl,
      home_url: process.env.HOME_URL || '',
      username_automation: process.env.NAVIGATOR_USERNAME || process.env.USERNAME_AUTOMATION || 'test_user',
      password_automation: process.env.NAVIGATOR_PASSWORD || process.env.PASSWORD_AUTOMATION || 'test_password',
      mfa_secret: process.env.NAVIGATOR_MFA_SECRET || process.env.MFA_SECRET,
    };

    return config;
  }

 /**
 * Generate 6-digit TOTP code for multi-factor authentication.
 * @param secret - Base32-encoded MFA secret from authenticator app
 * @returns 6-digit TOTP code valid for 30 seconds
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
}
