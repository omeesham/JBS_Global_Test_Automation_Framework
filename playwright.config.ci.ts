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

  // ==================== CI REPORTERS (NO ALLURE) ====================
  // Removed: allure-playwright (causes GitCommitInfo timeout in Jenkins)
  // Kept: list (console), html (archive), json (processing), junit (CI integration)
  reporter: [
    ['list'],
    ['html', { 
      outputFolder: 'reports/html-report', 
      open: 'never',
      attachmentsBaseURL: 'none'  // Disables error-context.md and other HTML attachments
    }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    // allure-playwright REMOVED - causes git timeout in Jenkins workspace
  ],

  // ==================== CI ARTIFACT SETTINGS (Controlled via .env) ====================
  use: {
    ...baseConfig.use,

    // CI defaults: always capture for thorough debugging, env vars can override
    video: getArtifactSetting('ENABLE_VIDEO', 'on') as any,
    trace: getArtifactSetting('ENABLE_TRACING', 'on') as any,

    screenshot: {
      mode: getArtifactSetting('ENABLE_SCREENSHOTS', 'on') as any,
      fullPage: true,
    },
  },

  // ==================== CI RETRY STRATEGY ====================
  retries: 2,  // Always 2 retries in CI (handles transient failures)

  // ==================== CI WORKER PROCESSES ====================
  workers: 1,  // Single worker for predictable resource usage in Jenkins
});
