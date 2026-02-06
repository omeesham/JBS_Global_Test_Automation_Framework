/**
 * TypeScript Type Definitions
 * Global types and interfaces for the framework
 */

/**
 * Configuration interface matching config.properties
 */
export interface IConfig {
  browser: string;
  url: string;
  home_url: string;
  username_automation: string;
  password_automation: string;
  mfa_secret?: string;
  [key: string]: string | undefined;
}

/**
 * Locator repository entry
 */
export interface ILocator {
  elementName: string;
  locator: string;
}

/**
 * CSV locator file structure
 */
export interface ILocatorRepository {
  [elementName: string]: string;
}

/**
 * Test markers (equivalent to pytest markers)
 */
export type TestMarker = 'smoke' | 'regression' | 'audit' | 'prospective';

/**
 * Browser types supported
 */
export type BrowserType = 'chrome' | 'chromium' | 'firefox' | 'webkit' | 'safari';

/**
 * Log levels
 */
export type LogLevel = 'info' | 'error' | 'warn' | 'debug';

/**
 * Validation field dictionary
 */
export interface IValidationFields {
  [csvKey: string]: string;
}

/**
 * Date format types
 */
export type DateFormat = 
  | '%b %d, %Y'      // Jun 28, 1953
  | '%B %d, %Y'      // June 28, 1953
  | '%m/%d/%Y'       // 6/28/1953
  | '%Y-%m-%d'       // 1953-06-28
  | '%d/%m/%Y';      // 28/06/1953
