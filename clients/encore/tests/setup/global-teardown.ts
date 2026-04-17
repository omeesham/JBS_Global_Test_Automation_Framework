/**
 * Global teardown -- runs once after all tests complete.
 * Add cleanup logic as needed (close DB, cleanup test data, etc.).
 */

import { FullConfig } from '@playwright/test';
import { Log } from '@framework/utils/logger';

async function globalTeardown(_config: FullConfig) {
  Log.info('Global teardown complete');
}

export default globalTeardown;
