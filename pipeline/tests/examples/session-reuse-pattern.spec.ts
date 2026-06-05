// spec: example-session-reuse
// seed: Demonstrates authenticatedSession fixture for worker-scoped SSO reuse

import { test, expect } from '@client/fixtures/pages.fixture';

/**
 * Session Reuse Pattern Example
 *
 * Key concept: authenticatedSession is WORKER-SCOPED, meaning:
 * - One SSO login per spec file (not per test)
 * - All tests in this file share the same authenticated context
 * - Use for tests that need authenticated access but don't mutate shared state
 *
 * Usage in fixtures:
 * - locationCurrencyPage and locationLocalInfoPage fixtures use authenticatedSession.page
 * - Tests get pre-authenticated page objects via fixture injection
 */

test.describe('Session Reuse Pattern', () => {
  test('TC-EX-SR-001: authenticated session is available', async ({ locationCurrencyPage }) => {
    // The fixture automatically provides an authenticated page
    // No login code needed in the test
    expect(locationCurrencyPage).toBeDefined();
  });

  test('TC-EX-SR-002: multiple tests share same session', async ({ locationLocalInfoPage }) => {
    // This test reuses the SAME authenticated session as TC-EX-SR-001
    // Worker-scoped session means: 1 login, many tests
    expect(locationLocalInfoPage).toBeDefined();
  });

  test('TC-EX-SR-003: config fixture provides environment data', async ({ config }) => {
    // Config is also worker-scoped -- loaded once, shared across tests
    expect(config.base_url).toBeTruthy();
    expect(config.username_automation).toBeTruthy();
  });
});
