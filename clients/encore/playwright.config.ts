/** Encore Playwright configuration. Paths are __dirname-relative. */

import { defineConfig } from '@playwright/test';
import * as dotenvFlow from 'dotenv-flow';
import * as path from 'path';

dotenvFlow.config({
  path: path.join(__dirname, 'config', 'environments'),
  node_env: process.env.CI_ENV || process.env.NODE_ENV || 'e2e',
  silent: true,
});

export function getArtifactSetting(envVar: string, defaultValue: string): string {
  const value = process.env[envVar]?.toLowerCase();
  if (!value || value === 'true') return defaultValue;
  if (value === 'false') return 'off';
  return value;
}

export default defineConfig({
  testDir: __dirname,
  testMatch: ['tests/**/*.spec.ts', 'api-testing/**/*.spec.ts'],
  testIgnore: ['**/examples/**'],

  timeout: 30 * 1000,
  expect: { timeout: 5000 },

  // AUTH-STATE-SHARED: fullyParallel + 2 workers via shared storageState.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,

  preserveOutput: 'always',

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['./dist/framework/utils/agent-reporter.js'],
    ['allure-playwright', {
      resultsDir: 'reports/allure-results',
      detail: true,
      suiteTitle: true,
      environmentInfo: {
        Framework: 'Encore Playwright',
        Environment: process.env.CI_ENV || 'e2e',
        'Base URL': process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/',
        Node: process.version,
        Platform: process.platform,
      },
      categories: require('./config/allure/categories.json'),
    }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/',

    trace: getArtifactSetting('ENABLE_TRACING', 'retain-on-failure') as any,
    screenshot: {
      mode: getArtifactSetting('ENABLE_SCREENSHOTS', 'only-on-failure') as any,
      fullPage: true,
    },
    video: getArtifactSetting('ENABLE_VIDEO', 'retain-on-failure') as any,

    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: [],

    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    // AUTH-STATE-SHARED setup project: runs ONCE before any test project to acquire/refresh
    // shared auth state at .auth/encore-state.json.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'chrome',
      use: {
        channel: 'chrome',
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
            '--metrics-recording-only',
          ],
        },
      },
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        viewport: { width: 1920, height: 1080 },
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
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'webkit',
      use: { viewport: { width: 1920, height: 1080 } },
    },
  ],

  outputDir: 'reports/test-results/',
  snapshotDir: 'reports/test-results/snapshots',

  globalSetup: require.resolve('./tests/setup/global-setup'),
  globalTeardown: require.resolve('./tests/setup/global-teardown'),
});
