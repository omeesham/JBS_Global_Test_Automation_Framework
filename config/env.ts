/**
 * FILE: config/env.ts
 * PURPOSE: Multi-environment .env file loader using dotenv-flow
 * WHY NECESSARY: Loads environment-specific configuration (dev/staging/prod)
 * USED BY: Auto-loaded on application start
 * 
 * HOW IT WORKS:
 * 1. Determines environment from CI_ENV or NODE_ENV
 * 2. Loads .env files in order: .env → .env.{environment}
 * 3. Later files override earlier files
 * 4. All values available in process.env
 * 
 * NOTE: Actual config object created by CommonMethods.initProp()
 * IConfig interface defined in types/index.d.ts (single source of truth)
 */

import * as dotenvFlow from 'dotenv-flow';
import * as path from 'path';

/**
 * Determine current environment
 */
function getEnvironment(): 'development' | 'staging' | 'production' | 'test' {
  const env = (process.env.CI_ENV || process.env.NODE_ENV || 'development').toLowerCase();
  const validEnvironments = ['development', 'staging', 'production', 'test'];
  
  if (validEnvironments.includes(env)) {
    return env as any;
  }
  
  console.warn(`⚠️  Invalid environment "${env}", defaulting to "development"`);
  return 'development';
}

/**
 * Load environment-specific .env files
 */
function loadEnv(): void {
  const environment = getEnvironment();
  const projectRoot = path.resolve(__dirname, '..');
  
  dotenvFlow.config({
    path: projectRoot,
    node_env: environment,
    silent: true
  });
  
  console.log(`✅ Environment loaded: ${environment}`);
}

// Auto-load on import
loadEnv();
