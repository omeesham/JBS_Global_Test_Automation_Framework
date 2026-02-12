/**
 * FILE: tests/imports.ts
 * PURPOSE: Single barrel import for all test dependencies
 * WHY NECESSARY: Reduces import boilerplate from 8+ lines to 1 line per test file.
 *   Inspired by Python's local_imports.py pattern for cleaner test files.
 * USED BY: All test specs - replaces individual imports with one-liner
 *
 * HOW IT WORKS:
 * 1. Re-exports fixtures (test, expect) from tests/fixtures.ts
 * 2. Re-exports common utilities (Log, CommonMethods, AppConstants, StealthHelpers)
 * 3. Re-exports frequently used types (Page, BrowserContext, IConfig)
 * 4. Re-exports Node.js built-ins used in tests (path, fs)
 *
 * USAGE - BEFORE (8+ lines):
 * ```typescript
 * import { test, expect } from '../../fixtures';
 * import { Log } from '../../../src/utils/logger';
 * import { CommonMethods } from '../../../src/utils/common-methods';
 * import { AppConstants } from '../../../src/utils/app-constants';
 * import { StealthHelpers } from '../../../src/utils/stealth-helpers';
 * import { DocumentsPage } from '../../../src/pages/documents.page';
 * import { Page, BrowserContext } from '@playwright/test';
 * import * as path from 'path';
 * import * as fs from 'fs';
 * ```
 *
 * USAGE - AFTER (1 line):
 * ```typescript
 * import { test, expect, Log, CommonMethods, AppConstants, StealthHelpers, path, fs } from '../../imports';
 * ```
 *
 * PATTERN INSPIRATION:
 * Python pytest repos use: `from utils.local_imports import *`
 * This TypeScript equivalent provides the same DX while keeping imports explicit.
 *
 * @see tests/fixtures.ts - Test fixtures definition
 * @see src/utils/logger.ts - Log utility
 * @see src/utils/common-methods.ts - CommonMethods utility
 */

// ==================== FIXTURES ====================
// Re-export test fixtures and expect assertion library
export { test, expect } from './fixtures';

// ==================== UTILITIES ====================
// Re-export commonly used utilities
export { Log } from '../src/utils/logger';
export { CommonMethods } from '../src/utils/common-methods';
export { AppConstants } from '../src/utils/app-constants';
export { StealthHelpers } from '../src/utils/stealth-helpers';

// ==================== TYPES ====================
// Re-export common Playwright types
export type { Page, BrowserContext } from '@playwright/test';
export type { IConfig } from '../src/framework-contracts';

// ==================== NODE.JS BUILT-INS ====================
// Re-export frequently used Node.js modules
export { default as path } from 'path';
export { default as fs } from 'fs';
