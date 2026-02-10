/**
 * Barrel Export File
 * Central import point for all framework utilities
 *
 * Usage:
 *   import { Log, CommonMethods, AppConstants, Page } from '@utils';
 */

// Re-export Playwright types
export type { Page, Browser, BrowserContext } from '@playwright/test';
export { expect } from '@playwright/test';

// Re-export utility classes
export { Log, Logger } from './logger';
export { CommonMethods, AllureHelper, allure } from './common-methods';
export { AppConstants } from './app-constants';
export { FileUtils } from './file-utils';

// Re-export types
export type * from '../../src/framework-contracts';

// Standard library re-exports that are commonly used
export type { Locator } from '@playwright/test';
