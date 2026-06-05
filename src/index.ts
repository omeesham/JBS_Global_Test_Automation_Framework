// ==================== TYPES & CONTRACTS ====================
export type {
  IConfig,
  IValidationFields,
} from './framework-contracts';

// ==================== COMMON ====================
export { CredentialLoader } from './common/credential-loader';
export type { CredentialSource, Credentials } from './common/credential-loader';

// ==================== UTILITIES ====================
// SP-MT-02 note: LoginPage, HomePage, BasePage, AppConstants, and all selectors are
// encore-specific and now live under clients/encore/ — consumers import them via the
// `@client/*` alias, not from this framework barrel. Keeping this barrel framework-only
// preserves tsconfig.build.json's `rootDir: src/` contract.
export { Log, Logger } from './utils/logger';
export { CommonMethods } from './utils/common-methods';

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
