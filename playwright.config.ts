/**
 * @agent-doc
 * PURPOSE: Main Playwright configuration for local test runs. Defines browsers (Chrome, Firefox, Edge), viewport settings, timeouts, and artifact collection. Multi-environment support via dotenv-flow.
 * OWNER: human-only
 * IMPACT: critical - All local test runs depend on this. Breaking browser configs stops all tests. Timeout changes affect test stability.
 * DEPENDS-ON: @playwright/test, dotenv-flow, config/environments/.env files
 * USED-BY: Playwright test runner (npx playwright test), all local development
 * RULES: NEVER spread device presets (causes deviceScaleFactor conflict). Keep chrome anti-phoning-home args. Don't reduce timeouts below current values. CI uses playwright.config.ci.ts instead.
 */

import { defineConfig } from '@playwright/test';
import * as dotenvFlow from 'dotenv-flow';
import * as path from 'path';

// Active client — SP-MT-03 scopes env/allure paths by client; SP-MT-06 will read from process.env.ACTIVE_CLIENT.
const ACTIVE_CLIENT = process.env.ACTIVE_CLIENT?.trim() || 'encore';
const CLIENT_ROOT = `clients/${ACTIVE_CLIENT}`;

// Load environment-specific variables using dotenv-flow from the active client.
// Loads in order: .env -> .env.local -> .env.{environment} -> .env.{environment}.local
dotenvFlow.config({
  path: path.join(__dirname, CLIENT_ROOT, 'config', 'environments'),
  node_env: process.env.CI_ENV || process.env.NODE_ENV || 'development',
  silent: true
});

/**
 * Helper: Map env var to Playwright artifact setting
 * @param envVar - Environment variable name (e.g., 'ENABLE_VIDEO')
 * @param defaultValue - Default Playwright value (e.g., 'retain-on-failure')
 * @returns Playwright artifact setting value
 */
export function getArtifactSetting(envVar: string, defaultValue: string): string {
  const value = process.env[envVar]?.toLowerCase();
  if (!value || value === 'true') return defaultValue;
  if (value === 'false') return 'off';
  // Pass-through explicit Playwright values: 'on', 'retain-on-failure', 'on-first-retry', etc.
  return value;
}

/**
 * Playwright Test Configuration
 *
 * Central configuration for test execution: browsers, timeouts, reporters, artifacts.
 * See: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // ==================== TEST DISCOVERY ====================
  // Scoped to active client's tests/ and api-testing/ -- prevents stray root-level specs from running.
  // Framework unit tests (tests/unit/, tests/examples/) and adapter tests (src/data/adapters/__tests__/)
  // are excluded from the main suite.
  testMatch: [`${CLIENT_ROOT}/tests/**/*.spec.ts`, `${CLIENT_ROOT}/api-testing/**/*.spec.ts`],
  testIgnore: ['**/examples/**'],
  
  // ==================== TIMEOUTS ====================
  timeout: 30 * 1000,  // Per-test timeout (increase for long E2E flows)
  
  expect: {
    timeout: 5000,  // Assertion auto-retry timeout
  },
  
  // ==================== PARALLELIZATION ====================
  // EXP-AUTH-STATE-SHARED (TEMP_RUTVIK_EXPERIMENT 2026-04-30): bumped to fullyParallel + 2 workers
  // for the shared-storage-state experiment. Revert to (false, 1) if experiment fails.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,  // Prevent accidental test.only() in CI

  // ==================== RETRY STRATEGY ====================
  // EXP-AUTH-STATE-SHARED: retries: 1 locally so a mid-spec auth-state expiry (D1 case)
  // can be auto-recovered by Playwright re-running with refreshed state.
  retries: process.env.CI ? 2 : 1,

  // ==================== WORKER PROCESSES ====================
  // EXP-AUTH-STATE-SHARED: 2 workers prove parallel auth via shared storageState.
  workers: process.env.CI ? 1 : 2,
  
  // ==================== REPORTERS ====================
  // Available: 'list', 'html', 'json', 'junit', 'allure-playwright', 'dot', 'github'
  preserveOutput: 'always',
  
  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'reports/html-report',
      open: 'never',
    }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['./src/utils/agent-reporter.ts'],
    ['allure-playwright', {
      resultsDir: 'reports/allure-results',
      detail: true,
      suiteTitle: true,
      environmentInfo: {
        Framework: 'Encore Playwright',
        Environment: process.env.CI_ENV || 'development',
        'Base URL': process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/',
        Node: process.version,
        Platform: process.platform,
      },
      categories: require(`./${CLIENT_ROOT}/config/allure/categories.json`),
    }],
  ],
  
  // ==================== SHARED SETTINGS (ALL BROWSERS) ====================
  use: {
    baseURL: process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/',  // Navigator Cloud
    
    // ==================== DEBUGGING ARTIFACTS (Controlled via .env) ====================
    trace: getArtifactSetting('ENABLE_TRACING', 'retain-on-failure') as any,

    screenshot: {
      mode: getArtifactSetting('ENABLE_SCREENSHOTS', 'only-on-failure') as any,
      fullPage: true,
    },

    video: getArtifactSetting('ENABLE_VIDEO', 'retain-on-failure') as any,
    
    // ==================== BROWSER SETTINGS ====================
    // RCA 2026-02-27: viewport:null is ignored in headless mode -- browser uses narrow default
    // causing Navigator Cloud's responsive sidebar to collapse, hiding the Setup button.
    // Fixed to 1920x1080 for consistent headless+headed behavior.
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: [],  // Example: ['geolocation', 'notifications']
    
    // ==================== ACTION TIMEOUTS ====================
    actionTimeout: 10 * 1000,  // Single action timeout (click, fill, etc.)
    navigationTimeout: 30 * 1000,  // Page navigation timeout (page.goto())
  },
  
  // ==================== BROWSER PROJECTS ====================
  // Usage: npx playwright test --project=chrome
  projects: [
    // EXP-AUTH-STATE-SHARED setup project (TEMP_RUTVIK_EXPERIMENT 2026-04-30):
    // Runs ONCE before any test project to acquire/refresh shared auth state at .auth/encore-state.json.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'chrome',
      use: {
        channel: 'chrome',
        // viewport:null defers sizing to --start-maximized (headed-only).
        // Not suitable for headless runs -- use the chromium project for CI/headless.
        viewport: null,
        launchOptions: {
          args: [
            '--start-maximized',
            '--disable-default-apps',
            '--no-first-run',
            '--disable-translate',
            '--disable-sync',
            '--disable-features=TranslateUI,OptimizationHints,MediaRouter',
            '--disable-component-extensions-with-background-pages',
            '--disable-domain-reliability',
            '--metrics-recording-only'
          ],
        },
      },
    },
    
    {
      name: 'chromium',
      // EXP-AUTH-STATE-SHARED: depends on setup project; consumes saved storageState.
      dependencies: ['setup'],
      use: {
        viewport: { width: 1920, height: 1080 },  // explicit -- headless ignores null
        storageState: '.auth/encore-state.json',
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-features=VizDisplayCompositor',
            '--disable-default-apps',
            '--no-first-run',
            '--disable-domain-reliability',
          ],
        },
      },
    },
    
    {
      name: 'firefox',
      use: {
        // viewport:null is ignored in headless mode (no --start-maximized equivalent).
        // Explicit size ensures consistent layout in both headed and headless runs.
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    {
      name: 'webkit',
      use: {
        // viewport:null is ignored in headless mode (no --start-maximized equivalent).
        // Explicit size ensures consistent layout in both headed and headless runs.
        viewport: { width: 1920, height: 1080 },
      },
    },

    // ==================== MOBILE EMULATION (Examples) ====================
    // { name: 'Mobile Chrome', use: { ...devices['iPhone 13 Pro'] } },
    // { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
    // { name: 'Tablet', use: { ...devices['iPad Pro'] } },
  ],
  
  // ==================== OUTPUT DIRECTORIES ====================
  outputDir: 'reports/test-results/',
  snapshotDir: 'reports/test-results/snapshots',  // Visual regression baseline images
  
  // ==================== GLOBAL HOOKS ====================
  globalSetup: require.resolve(`./${CLIENT_ROOT}/tests/setup/global-setup`),
  globalTeardown: require.resolve(`./${CLIENT_ROOT}/tests/setup/global-teardown`),
  
  // ==================== DEV SERVER (Example) ====================
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});


