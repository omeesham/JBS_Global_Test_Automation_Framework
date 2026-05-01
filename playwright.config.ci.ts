/** CI-optimized Playwright configuration (Jenkins, GitHub Actions, etc.) */

import { defineConfig } from '@playwright/test';
import baseConfig, { getArtifactSetting } from './playwright.config';

// Active client (mirrors playwright.config.ts) — needed for CI-only module projects
const ACTIVE_CLIENT = process.env.ACTIVE_CLIENT?.trim() || 'encore';
const CLIENT_ROOT = `clients/${ACTIVE_CLIENT}`;

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
      categories: require(`./clients/${process.env.ACTIVE_CLIENT?.trim() || 'encore'}/config/allure/categories.json`),
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
  // Module-parallel runs: SP-EFD-03 CI command passes --workers=2 (2 module projects).
  // Default stays 1 for conservative single-project Jenkins runs.
  workers: 1,

  // ==================== CI-ONLY MODULE PROJECTS (SP-EFD-01) ====================
  // Local config (playwright.config.ts) intentionally OMITS these — local default behavior
  // matches pre-SP-EFD-01 baseline (browser-level projects only, single sequential SSO).
  // CI / GitHub Actions opts in via: `npx playwright test --config=playwright.config.ci.ts
  //   --workers=2 --project=encore-local-office --project=encore-locations`.
  // Each module runs on its own worker; fullyParallel:false keeps specs serial within the
  // module (HIST-safe: history specs read row 0 while sibling specs write rows — same
  // worker → sequential).
  projects: [
    // EXP-AUTH-STATE-SHARED (2026-04-30): module projects depend on
    // the setup project (defined in playwright.config.ts) so auth.setup.ts fires ONCE in CI
    // and writes .auth/encore-state.json, which both module workers consume read-only via
    // storageState. Without these two lines, --project=encore-local-office --project=encore-locations
    // never fires setup → fresh-login-per-worker → MFA collision returns. Mirror of the
    // pattern on the chromium project at playwright.config.ts.
    {
      name: 'encore-local-office',
      testDir: `${CLIENT_ROOT}/tests/specs/setup/local-office`,
      fullyParallel: false,
      dependencies: ['setup'],
      use: { storageState: '.auth/encore-state.json' },
    },
    {
      name: 'encore-locations',
      testDir: `${CLIENT_ROOT}/tests/specs/setup/locations`,
      fullyParallel: false,
      dependencies: ['setup'],
      use: { storageState: '.auth/encore-state.json' },
    },
    // Inherit the browser-level projects from baseConfig (includes the `setup` project +
    // chromium with its own dependencies/storageState wiring) so existing CI commands like
    // `--project=chromium` still resolve and the setup project is part of the registered list.
    ...(baseConfig.projects ?? []),
  ],
});
