/**
 * Global Setup
 * Runs once before all tests
 * Migrated from conftest.py global setup logic
 */

import { chromium, FullConfig } from '@playwright/test';
import { Log } from '../utils/logger';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  // Load environment variables
  dotenv.config();

  Log.info('=== Global Test Setup Started ===');
  Log.info(`Base URL: ${config.use?.baseURL || 'Not set'}`);
  Log.info(`Workers: ${config.workers}`);
  Log.info(`Retries: ${config.retries}`);
  
  // You can add any global setup logic here
  // For example: database connection, API authentication, etc.
  
  Log.info('=== Global Test Setup Completed ===');
}

export default globalSetup;
