/** CI-optimized Playwright configuration (Jenkins, GitHub Actions, etc.) */

import { defineConfig } from '@playwright/test';
import baseConfig, { getArtifactSetting } from './playwright.config';

export default defineConfig({
  ...baseConfig,

  // ==================== CI TEST SCOPE ====================
  // Run ONLY user-built deployment tests (UI specs)
  // Excludes: framework infrastructure tests, examples, API placeholders
  testIgnore: [
    '**/tests/examples/**',               // Example patterns (not for CI)
    '**/api-testing/**',
  ],

  // ==================== CI-SPECIFIC TIMEOUTS ====================
  timeout: 60 * 1000,  // Longer timeout for CI (60s vs 30s base)

  // ==================== CI REPORTERS ====================
  // allure-playwright re-enabled with ALLURE_RESULTS_WITHOUT_GIT=true (set in CI env)
  // to prevent GitCommitInfo timeout in Jenkins. See .ci/Jenkinsfile.ubuntu.
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
        Environment: process.env.CI_ENV || 'ci',
        'Base URL': process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/',
        Node: process.version,
        Platform: process.platform,
      },
      categories: require('./config/allure/categories.json'),
    }],
  ],

  // ==================== CI ARTIFACT SETTINGS (Controlled via .env) ====================
  use: {
    ...baseConfig.use,

    // CI defaults: capture only on failure to avoid storage bloat (~95% reduction)
    video: getArtifactSetting('ENABLE_VIDEO', 'retain-on-failure') as any,
    trace: getArtifactSetting('ENABLE_TRACING', 'on-first-retry') as any,

    screenshot: {
      mode: getArtifactSetting('ENABLE_SCREENSHOTS', 'only-on-failure') as any,
      fullPage: true,
    },
  },

  // ==================== CI RETRY STRATEGY ====================
  retries: 2,  // Always 2 retries in CI (handles transient failures)

  // ==================== CI WORKER PROCESSES ====================
  workers: 1,  // Single worker for predictable resource usage in Jenkins
});
