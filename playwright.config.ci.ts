/**
 * FILE: playwright.config.ci.ts
 * PURPOSE: CI-optimized Playwright configuration (Jenkins, GitHub Actions, etc.)
 * WHY NECESSARY: Fixes Jenkins GitCommitInfo timeout caused by allure-playwright reporter
 * USED BY: Jenkins pipelines (.ci/Jenkinsfile.windows, .ci/Jenkinsfile.ubuntu)
 *
 * HOW IT WORKS:
 * 1. Extends base playwright.config.ts configuration
 * 2. Removes allure-playwright reporter (causes git timeout in Jenkins)
 * 3. Reduces artifact generation (video/trace only on failure)
 * 4. Shorter timeouts for faster CI feedback
 *
 * ISSUE BACKGROUND:
 * - allure-playwright v2.15.1 captures git commit info via `git log -1`
 * - Hardcoded 3000ms timeout causes failures in Jenkins workspace isolation
 * - Jenkins shallow clones + file locks = git commands timeout
 * - This config eliminates allure reporter in CI, avoiding git operations entirely
 *
 * USAGE:
 * Jenkins: npx playwright test --config=playwright.config.ci.ts --project=chromium
 * Local: Use base playwright.config.ts (includes allure for local reports)
 */

import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

  // ==================== CI TEST SCOPE ====================
  // Run ONLY user-built deployment tests (UI specs)
  // Excludes: framework infrastructure tests, examples/demos, seed tests, API placeholders
  testIgnore: [
    '**/src/data/adapters/__tests__/**',  // Framework unit tests (not for deployment)
    '**/tests/example.spec.ts',
    '**/tests/seed.spec.ts',
    '**/tests/specs/examples/**',
    '**/api-testing/**',
  ],

  // ==================== CI-SPECIFIC TIMEOUTS ====================
  timeout: 60 * 1000,  // Shorter timeout for CI (60s vs 30s base)

  // ==================== CI REPORTERS (NO ALLURE) ====================
  // Removed: allure-playwright (causes GitCommitInfo timeout in Jenkins)
  // Kept: list (console), html (archive), json (processing), junit (CI integration)
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    // allure-playwright REMOVED - causes git timeout in Jenkins workspace
  ],

  // ==================== CI ARTIFACT SETTINGS ====================
  use: {
    ...baseConfig.use,

    // Only capture artifacts on failure (reduces CI storage)
    video: 'retain-on-failure',  // Base config also uses this
    trace: 'retain-on-failure',  // Changed from 'on-first-retry' to save space

    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
  },

  // ==================== CI RETRY STRATEGY ====================
  retries: 2,  // Always 2 retries in CI (handles transient failures)

  // ==================== CI WORKER PROCESSES ====================
  workers: 1,  // Single worker for predictable resource usage in Jenkins
});
