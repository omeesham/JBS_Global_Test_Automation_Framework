/**
 * @experiment EXP-AUTH-STATE-SHARED throwaway verification spec (2026-04-30).
 *
 * Goal: prove that 2 parallel workers can both reach Dashboard via shared storageState,
 * with no Microsoft login UI in either trace, and the session remains stable across a
 * 30s idle window.
 *
 * Cleanup target: deleted on experiment failure or auto-user provisioning.
 */

import { test, expect } from '../../setup/fixtures';

test.describe.configure({ mode: 'parallel' });

// 90s budget = 30s idle wait + ~30s fixture overhead + ~30s assertions/buffer.
test.setTimeout(90_000);

test('shared-state: dashboard reachable + stable for 30s [worker A]', async ({
  authenticatedSession,
}) => {
  const { page } = authenticatedSession;
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  expect(page.url().toLowerCase()).not.toContain('login.microsoftonline.com');

  await page.waitForTimeout(30_000);

  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  expect(page.url().toLowerCase()).not.toContain('login.microsoftonline.com');
});

test('shared-state: dashboard reachable + stable for 30s [worker B]', async ({
  authenticatedSession,
}) => {
  const { page } = authenticatedSession;
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  expect(page.url().toLowerCase()).not.toContain('login.microsoftonline.com');

  await page.waitForTimeout(30_000);

  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  expect(page.url().toLowerCase()).not.toContain('login.microsoftonline.com');
});
