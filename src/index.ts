/**
 * @agent-doc
 * PURPOSE: Barrel export -- single entry point for the compiled framework (dist/). All public types, classes, and utilities are re-exported here.
 * OWNER: human-only
 * IMPACT: critical - Client tests import everything from dist/ via this file. Breaking exports breaks all client tests.
 * DEPENDS-ON: All src/ modules (pages, utils, common, security, selectors, data, framework-contracts)
 * USED-BY: Client tests (via dist/index.js), tsconfig.build.json (entry point)
 * RULES: Only add exports here. Never remove existing exports (breaking change for clients). Keep organized by category.
 */

// ==================== TYPES & CONTRACTS ====================
// Side-effect import to activate declare module augmentation (custom matchers)
import './framework-contracts';
export type {
  IConfig,
  IValidationFields,
} from './framework-contracts';

// ==================== PAGE OBJECTS ====================
export { LoginPage } from './pages/login.page';
export { HomePage } from './pages/home.page';

// ==================== BASE CLASS ====================
export { BasePage } from './common/base-page';

// ==================== COMMON ====================
export { CredentialLoader } from './common/credential-loader';
export type { CredentialSource, Credentials } from './common/credential-loader';
// ==================== UTILITIES ====================
export { Log, Logger } from './utils/logger';
export { CommonMethods } from './utils/common-methods';
export { AppConstants } from './utils/app-constants';
export { FileUtils } from './utils/file-utils';

// ==================== SELECTORS ====================
export {
  getTsSelector,
  ALL_SELECTORS,
  MicrosoftLoginSelectors,
  LocationSettingsSelectors,
  LocalOfficeSettingsSelectors,
  DynamicSelectors,
} from './selectors';

// ==================== SECURITY ====================
export { Vault } from './security/vault';

// ==================== DATA ADAPTERS ====================
export { AdapterFactory } from './data/adapters/adapterFactory';
export { ExcelAdapter } from './data/adapters/excelAdapter';
export { JsonAdapter } from './data/adapters/jsonAdapter';
export { DbAdapter } from './data/adapters/dbAdapter';
export { S3Adapter } from './data/adapters/s3Adapter';
export type { IAdapter, AdapterRecord, AdapterMetadata, AdapterResult } from './data/adapters/IAdapter';
export type { AdapterType } from './data/adapters/adapterFactory';

// ==================== RE-EXPORT PLAYWRIGHT TYPES ====================
export type { Page, Browser, BrowserContext, Locator } from '@playwright/test';
export { expect } from '@playwright/test';
