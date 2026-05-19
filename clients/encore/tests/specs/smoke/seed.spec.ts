/**
 * Auth smoke test -- verifies SSO login works via the authenticatedSession fixture.
 * Run this first to confirm credentials and SSO flow are functional.
 */
// spec: Auth smoke test for test runner
// seed: true -- run this to verify SSO login works before other specs
import { test, expect } from '../../infra/fixtures';

test.describe('Seed: Auth Smoke Test @seed', () => {
  test.describe.configure({ timeout: 120_000 });

  test('SEED-001: Authenticate and verify session', async ({ authenticatedSession, config }) => {
    const { page } = authenticatedSession;
    await page.goto(config.base_url, { waitUntil: 'domcontentloaded' });
    expect(page.url()).not.toContain('login.microsoftonline.com');
  });
});
