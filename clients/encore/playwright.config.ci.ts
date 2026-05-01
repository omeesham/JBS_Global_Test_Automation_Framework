/** Encore CI Playwright configuration — extends per-client base; no parent-tree dependencies. */

import { defineConfig } from '@playwright/test';
import baseConfig, { getArtifactSetting } from './playwright.config';

export default defineConfig({
  ...baseConfig,

  testIgnore: [
    '**/tests/examples/**',
    '**/api-testing/**',
  ],

  timeout: 60 * 1000,

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
        Environment: process.env.CI_ENV || 'ci',
        'Base URL': process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/',
        Node: process.version,
        Platform: process.platform,
      },
      categories: require('./config/allure/categories.json'),
    }],
  ],

  use: {
    ...baseConfig.use,
    video: getArtifactSetting('ENABLE_VIDEO', 'retain-on-failure') as any,
    trace: getArtifactSetting('ENABLE_TRACING', 'on-first-retry') as any,
    screenshot: {
      mode: getArtifactSetting('ENABLE_SCREENSHOTS', 'only-on-failure') as any,
      fullPage: true,
    },
  },

  retries: 2,
  workers: 1,

  // CI-only module projects (SP-EFD-01) — opt-in via:
  //   npx playwright test --config=playwright.config.ci.ts --workers=2
  //     --project=encore-local-office --project=encore-locations
  projects: [
    // EXP-AUTH-STATE-SHARED: module projects depend on setup (defined in base playwright.config.ts)
    // so auth.setup.ts fires ONCE in CI and writes .auth/encore-state.json, which both module
    // workers consume read-only via storageState.
    {
      name: 'encore-local-office',
      testDir: './tests/specs/setup/local-office',
      fullyParallel: false,
      dependencies: ['setup'],
      use: { storageState: '.auth/encore-state.json' },
    },
    {
      name: 'encore-locations',
      testDir: './tests/specs/setup/locations',
      fullyParallel: false,
      dependencies: ['setup'],
      use: { storageState: '.auth/encore-state.json' },
    },
    ...(baseConfig.projects ?? []),
  ],
});
