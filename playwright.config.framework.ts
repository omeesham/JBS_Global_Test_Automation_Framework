/**
 * @agent-doc
 * PURPOSE: Framework-scoped Playwright config — runs only the adapter unit tests under
 *   src/data/adapters/__tests__/. Separate from the per-client Playwright config so framework
 *   tests stay runnable after the multi-purpose root playwright configs were removed in
 *   SUBPLAN_RCD_A Phase 5 (2026-05-07).
 * OWNER: human-only
 * IMPACT: framework-internal — no CI dependency (test:adapters is local-only per /audit 2026-05-07,
 *   zero refs in .github/ or .ci/).
 * USED-BY: npm run test:adapters
 * RULES: Keep scoped to src/data/adapters/__tests__/. Do NOT add client paths. Do NOT add allure
 *   or junit reporters (unit tests, stdout is enough).
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: __dirname,
  testMatch: ['src/data/adapters/__tests__/**/*.spec.ts'],
  timeout: 30 * 1000,
  expect: { timeout: 5000 },

  // Unit tests, no shared state — simple settings.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,

  // Stdout only — no allure / no junit / no html for unit tests.
  reporter: [['list']],

  use: {
    actionTimeout: 5 * 1000,
    navigationTimeout: 10 * 1000,
  },

  projects: [
    { name: 'framework-adapters', use: {} },
  ],
});
