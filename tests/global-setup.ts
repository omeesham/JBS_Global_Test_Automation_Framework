/**
 * Global Setup
 * Runs once before all tests
 * Global setup executed once before all tests
 */

import { chromium, FullConfig } from '@playwright/test';
import { Log } from '../src/utils/logger';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  // Load environment variables
  dotenv.config();

  Log.info('=== Global Test Setup Started ===');
  Log.info(`Workers: ${config.workers}`);
  Log.info(`Projects: ${config.projects?.length || 0}`);
  
  // You can add any global setup logic here
  // For example: database connection, API authentication, etc.
  
  Log.info('=== Global Test Setup Completed ===');
}

export default globalSetup;
