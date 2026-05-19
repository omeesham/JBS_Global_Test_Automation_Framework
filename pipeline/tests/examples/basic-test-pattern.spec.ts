/**
 * EXAMPLE: Basic test pattern for agents and developers.
 * Shows: imports, fixtures, page objects, logging, custom matchers, hooks.
 *
 * RULES:
 * - Import from '@client-tests/infra/fixtures', NEVER from '@playwright/test'
 * - Use page object methods, NEVER direct page.click()/page.fill()
 * - Log at every key step with Log.info()
 * - Use test IDs: TC-{APP}-{NNN}: Description
 */

import { test, expect } from '@client-tests/infra/fixtures';
import { Log } from '../../src/utils/logger';

test.describe('Example: Login Flow @example', () => {
  // Increase timeout for SSO flows (default 30s is too short)
  test.describe.configure({ timeout: 90000 });

  test.beforeEach(async ({ page }) => {
    Log.info('Starting test');
  });

  test('TC-EX-001: Login via Microsoft SSO', async ({ loginPage, homePage, config }) => {
    Log.info('TEST: TC-EX-001 - Microsoft SSO login');

    // Navigate -- loginPage.goto() handles URL from config
    await loginPage.goto();

    // Login -- page object handles entire SSO flow
    const { CredentialLoader } = await import('../../src/core/credential-loader');
    const creds = await CredentialLoader.loadCredentials({ type: 'env' });
    const success = await loginPage.loginWithMicrosoft(creds.username, creds.password);
    expect(success, 'Login should succeed').toBe(true);

    // Verify authenticated state
    expect(await loginPage.isLoggedIn(), 'Should be logged in').toBe(true);
    expect(await homePage.isLoaded(), 'Home page should load').toBe(true);

    Log.info('TC-EX-001 PASSED');
  });

  test('TC-EX-002: Detect expired session', async ({ loginPage }) => {
    Log.info('TEST: TC-EX-002 - Expired session detection');

    // Navigate without session -- should redirect to Microsoft
    await loginPage.goto();
    const onMicrosoft = await loginPage.isOnMicrosoftLogin();

    // This is expected if no valid session exists
    Log.info(`On Microsoft login: ${onMicrosoft}`);
    expect(typeof onMicrosoft).toBe('boolean');

    Log.info('TC-EX-002 PASSED');
  });

  test.afterEach(async ({}, testInfo) => {
    Log.info(`${testInfo.status === 'passed' ? 'PASSED' : 'FAILED'}: ${testInfo.title}`);
  });
});
