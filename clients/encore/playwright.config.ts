/** Encore Playwright configuration. */

import { defineConfig } from '@playwright/test';
import * as dotenvFlow from 'dotenv-flow';
import * as path from 'path';

// Local-first: bare `npm test` loads .env.local; CI sets CI_ENV=e2e to load .env.e2e.
dotenvFlow.config({
  path: path.join(__dirname, 'config', 'environments'),
  node_env: process.env.CI_ENV || process.env.NODE_ENV || 'local',
  silent: true,
});

function getArtifactSetting(envVar: string, defaultValue: string): string {
  const value = process.env[envVar]?.toLowerCase();
  if (!value || value === 'true') return defaultValue;
  if (value === 'false') return 'off';
  return value;
}

export default defineConfig({
  testDir: __dirname,
  testMatch: ['specs/**/*.spec.ts'],

  timeout: process.env.CI ? 60 * 1000 : 30 * 1000,
  expect: { timeout: 5000 },

  // HARD RULE: 1 spec = 1 worker, always (no within-file split). Required so each
  // spec's TC-001 baseline-reset (per LR-019) runs first in source order before
  // dependent tests. Within-file parallel would race TC-002+ against the baseline
  // state TC-001 establishes. Workers still run DIFFERENT specs in parallel via
  // AUTH-STATE-SHARED (storageState shared via .auth/encore-state.json).
  // Do not flip back to true.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 1,
  // Dynamic workers: CI default 4; local 2; override via `MAX_WORKERS=N` env.
  workers: process.env.MAX_WORKERS
    ? Math.max(1, parseInt(process.env.MAX_WORKERS, 10))
    : (process.env.CI ? 4 : 2),

  preserveOutput: 'always',

  reporter: [
    ['list'],
    // AgentReporter writes reports/failure-summary.json on every failing run — primary /rca input.
    // Bundled by `npm run share-for-debugging` and shipped to CI artifact `share-for-debugging-*.zip`.
    // Relocated 2026-05-19 from dist/framework/ to clients/encore/src/utils/ so the reporter
    // ships with the deliverable (git archive --strip-components=2 excludes anything above clients/encore/).
    ['./src/utils/agent-reporter.ts'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    // Group F (lifecycle refactor 2026-05-21, v3 corrected):
    // Skip Allure on CI — GitCommitInfo plugin times out on shallow-clone runners
    // (M365 build agents have no full git history). Replaces the deleted
    // playwright.config.ci.ts which was a thin override deleted intentionally per
    // colleague's one-config-to-ship decision. This inline guard folds its only
    // behavior back into the surviving single config.
    ...(process.env.CI ? [] : [['allure-playwright', {
      resultsDir: 'reports/allure-results',
      detail: true,
      suiteTitle: true,
      environmentInfo: {
        Framework: 'Encore Playwright',
        Environment: process.env.CI_ENV || 'local',
        'Base URL': process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/',
        Node: process.version,
        Platform: process.platform,
      },
      categories: require('./config/allure/categories.json'),
    }]] as const),
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/',

    trace: getArtifactSetting('ENABLE_TRACING', process.env.CI ? 'on-first-retry' : 'retain-on-failure') as any,
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
    // Group B-1 (lifecycle refactor 2026-05-21):
    // chrome/firefox/webkit are kept invokable for manual `--project=<name>` debugging,
    // but removed from the default suite because they have no `dependencies: ['setup']`
    // and no storageState — they always run unauthenticated and produce false-greens
    // by hitting login pages instead of the app.
    {
      name: 'chrome',
      testMatch: [],
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
    // Group B-2 (lifecycle refactor 2026-05-21):
    // chromium becomes the generic catch-all for non-module-scoped specs. The
    // `testIgnore` keeps it from double-running module specs that are already owned
    // by the `encore-locations` and `encore-local-office` projects below.
    {
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: ['specs/locations/**', 'specs/local-office/**'],
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
      testMatch: [],
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'webkit',
      testMatch: [],
      use: { viewport: { width: 1920, height: 1080 } },
    },
    // CI-only module projects — opt-in via:
    //   npx playwright test --workers=2 --project=encore-local-office --project=encore-locations
    // AUTH-STATE-SHARED: depend on `setup` so auth.setup.ts fires ONCE and writes
    // .auth/encore-state.json, which both module workers consume read-only.
    {
      name: 'encore-local-office',
      testDir: './specs/local-office',
      fullyParallel: false,
      dependencies: ['setup'],
      use: { storageState: '.auth/encore-state.json' },
    },
    {
      name: 'encore-locations',
      testDir: './specs/locations',
      fullyParallel: false,
      dependencies: ['setup'],
      use: { storageState: '.auth/encore-state.json' },
    },
  ],

  outputDir: 'reports/test-results/',
  snapshotDir: 'reports/test-results/snapshots',

  globalSetup: require.resolve('./src/infra/global-setup'),
  globalTeardown: require.resolve('./src/infra/global-teardown'),
});
