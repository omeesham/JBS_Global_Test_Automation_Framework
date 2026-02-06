/**
 * Global Teardown
 * Runs once after all tests
 * Migrated from conftest.py global teardown logic
 */

import { FullConfig } from '@playwright/test';
import { Log } from '../utils/logger';

async function globalTeardown(config: FullConfig) {
  Log.info('=== Global Test Teardown Started ===');
  
  // Add any cleanup logic here
  // For example: close database connections, cleanup test data, etc.
  
  // Close logger
  Log.close();
  
  Log.info('=== Global Test Teardown Completed ===');
}

export default globalTeardown;
