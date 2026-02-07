/**
 * Barrel Export File
 * Central import point for all framework utilities
 * Migrated from utils/local_imports.py
 * 
 * Usage:
 *   import { Log, CommonMethods, AppConstants, Page } from '@utils';
 */

// Re-export Playwright types
export { Page, expect, Browser, BrowserContext } from '@playwright/test';

// Re-export utility classes
export { Log, Logger } from './logger';
export { CommonMethods, AllureHelper, allure } from './common-methods';
export { OpenAIUtils } from './openai-utils';
export { AppConstants } from './app-constants';

// Re-export types
export * from '../types';

// Standard library re-exports that are commonly used
export type { Locator } from '@playwright/test';
