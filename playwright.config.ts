import { defineConfig, devices } from '@playwright/test';
import * as dotenvFlow from 'dotenv-flow';
import * as path from 'path';

// Load environment-specific variables using dotenv-flow
// Loads: .env → .env.local → .env.{environment} → .env.{environment}.local
dotenvFlow.config({
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
  // No testDir specified - searches entire project for .spec.ts files
  // This allows tests in both tests/ (UI) and api-testing/api-tests/ (API)
  testMatch: '**/*.spec.ts',  // Match all .spec.ts files recursively
  
  // ==================== TIMEOUTS ====================
  timeout: 30 * 1000,  // Per-test timeout (increase for long E2E flows)
  
  expect: {
    timeout: 5000,  // Assertion auto-retry timeout
  },
  
  // ==================== PARALLELIZATION ====================
  fullyParallel: false,  // Disabled: tests may share state (login, data)
  forbidOnly: !!process.env.CI,  // Prevent accidental test.only() in CI
  
  // ==================== RETRY STRATEGY ====================
  retries: process.env.CI ? 2 : 0,  // CI: 2 retries for flaky tests; Local: 0 for fast feedback
  
  // ==================== WORKER PROCESSES ====================
  workers: process.env.CI ? 1 : 1,  // 1 worker for predictable debugging (increase for high-spec machines)
  
  // ==================== REPORTERS ====================
  // Available: 'list', 'html', 'json', 'junit', 'allure-playwright', 'dot', 'github'
  preserveOutput: 'always',
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['allure-playwright', { 
      outputFolder: 'reports/allure-results',
      detail: true,
      suiteTitle: true 
    }],
  ],
  
  // ==================== SHARED SETTINGS (ALL BROWSERS) ====================
  use: {
    baseURL: process.env.BASE_URL || 'https://demo.us.espocrm.com/',  // EspoCRM demo instance
    
    // ==================== DEBUGGING ARTIFACTS (Controlled via .env) ====================
    trace: getArtifactSetting('ENABLE_TRACING', 'on-first-retry') as any,

    screenshot: {
      mode: getArtifactSetting('ENABLE_SCREENSHOTS', 'only-on-failure') as any,
      fullPage: true,
    },

    video: getArtifactSetting('ENABLE_VIDEO', 'retain-on-failure') as any,
    
    // ==================== BROWSER SETTINGS ====================
    viewport: null,  // null = maximized; { width: 1920, height: 1080 } for fixed size
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
    {
      name: 'chrome',
      use: { 
        channel: 'chrome',
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
    
    {
      name: 'chromium',
      use: { 
        viewport: null,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-blink-features=AutomationControlled',
            '--excludeSwitches=enable-automation',
            '--disable-features=VizDisplayCompositor',
          ],
        },
      },
    },
    
    {
      name: 'firefox',
      use: { 
        viewport: null,
      },
    },
    
    {
      name: 'webkit',
      use: { 
        viewport: null,
      },
    },

    // ==================== MOBILE EMULATION (Examples) ====================
    // { name: 'Mobile Chrome', use: { ...devices['iPhone 13 Pro'] } },
    // { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
    // { name: 'Tablet', use: { ...devices['iPad Pro'] } },
  ],
  
  // ==================== OUTPUT DIRECTORIES ====================
  outputDir: 'test-results/',
  snapshotDir: 'test-results/snapshots',  // Visual regression baseline images
  
  // ==================== GLOBAL HOOKS (Examples) ====================
  // globalSetup: require.resolve('./tests/global-setup'),
  // globalTeardown: require.resolve('./tests/global-teardown'),
  
  // ==================== DEV SERVER (Example) ====================
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});


