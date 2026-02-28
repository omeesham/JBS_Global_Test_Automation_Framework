// spec: navigator-login -- Microsoft SSO login flow with MFA and session management
// seed: manual -- created during initial framework setup

import { test, expect } from '../../setup/fixtures';

test.describe('Navigator Cloud Authentication @auth', () => {
  test.describe.configure({ timeout: 90000 });

  test('TC-NAV-001: Login via Microsoft SSO with MFA', async ({ loginPage, homePage, config }) => {
    await loginPage.goto();
    const loginSuccess = await loginPage.loginWithMicrosoft(
      config.username_automation, config.password_automation, config.mfa_secret ?? '',
    );
    expect(loginSuccess).toBe(true);
    expect(await loginPage.isLoggedIn()).toBe(true);
    expect(await homePage.isLoaded()).toBe(true);
  });

  test('TC-NAV-002: Authenticated fixture provides pre-logged-in page', async ({ authenticatedSession }) => {
    const { page } = authenticatedSession;
    const url = page.url();
    expect(url).not.toContain('login.microsoftonline.com');
  });

  test('TC-NAV-003: Expired session triggers re-authentication', async ({ loginPage }) => {
    // Navigate without session -- should redirect to Microsoft SSO
    await loginPage.goto();
    expect(await loginPage.isOnMicrosoftLogin()).toBe(true);
  });
});
