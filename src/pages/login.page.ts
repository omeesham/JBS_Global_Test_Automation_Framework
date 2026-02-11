/**
 * FILE: src/pages/login.page.ts
 * PURPOSE: Login page object for EspoCRM with optional MFA support
 * WHY NECESSARY: Encapsulates login page interactions for authentication flows
 * USED BY: Login tests (tests/specs/auth/login.spec.ts), test fixtures
 *
 * HOW IT WORKS:
 * 1. Uses CSV locators from object_repository/Login_Elements.csv
 * 2. Implements loginWithMfa() for standard + MFA authentication
 * 3. Integrates with CommonMethods for CSV reading and validation
 * 4. Returns boolean success/failure for all public methods
 */

import { Page } from '@playwright/test';
import { BasePage } from '../common/base-page';
import { Log } from '../utils/logger';
import { CommonMethods, allure } from '../utils/common-methods';
import { AppConstants } from '../utils/app-constants';
import { IConfig } from '../../src/framework-contracts';

export class LoginPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('Login page constructor');
  }

  /**
   * Navigate to login page and wait for form to render
   */
  async goto(): Promise<void> {
    const url = this.config?.base_url || process.env.BASE_URL || 'https://demo.us.espocrm.com/';
    await this.page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
    const frmLogin = CommonMethods.getValuesFromCsv('frmLogin', AppConstants.LOGIN_ELEMENTS);
    if (frmLogin) {
      await this.page.waitForSelector(frmLogin, { state: 'visible', timeout: 15000 });
    }
    Log.info(`Navigated to login page: ${url}`);
  }

  /**
   * Check if login was successful (navigated away from login page)
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const divMain = CommonMethods.getValuesFromCsv('divMainContent', AppConstants.HOME_ELEMENTS);
      if (divMain) {
        return await this.page.locator(divMain).isVisible({ timeout: 10000 });
      }
      const url = this.page.url();
      return url.includes('#');
    } catch {
      return false;
    }
  }

  /**
   * Check if forgot password link exists
   */
  async isForgotPwdLinkExist(): Promise<boolean> {
    const lnkForgotPassword = CommonMethods.getValuesFromCsv(
      'lnkForgotPassword',
      AppConstants.LOGIN_ELEMENTS
    );

    if (!lnkForgotPassword) return false;
    return await this.page.locator(lnkForgotPassword).isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Check if login form is displayed
   */
  async isLoginFormDisplayed(): Promise<boolean> {
    const frmLogin = CommonMethods.getValuesFromCsv(
      'frmLogin',
      AppConstants.LOGIN_ELEMENTS
    );

    if (!frmLogin) return false;
    return await this.page.isVisible(frmLogin);
  }

  /**
   * Login to the application with MFA support
   *
   * @param username Username
   * @param password Password
   * @param config Configuration dictionary (optional, required for MFA)
   * @returns True if login successful
   */
  async loginWithMfa(
    username: string,
    password: string,
    config?: IConfig
  ): Promise<boolean> {
    try {
      // Attach test info to Allure report
      allure.before('Verify user should be able to Login Successfully');

      // Get username field locator
      const strUnLocator = CommonMethods.getValuesFromCsv(
        'txtUsername',
        AppConstants.LOGIN_ELEMENTS
      );

      if (!strUnLocator) {
        Log.error('Username field locator not found');
        return false;
      }

      // Wait for login form to be ready
      await this.page.waitForSelector(strUnLocator, { state: 'visible', timeout: 10000 });

      // Fill credentials - handle both text input and dropdown
      const usernameElement = this.page.locator(strUnLocator);
      const usernameTagName = await usernameElement.evaluate(el => el.tagName.toLowerCase());

      if (usernameTagName === 'select') {
        // Dropdown - try label first, then value
        try {
          await usernameElement.selectOption({ label: username });
          Log.info(`Selected username from dropdown: ${username}`);
        } catch {
          await usernameElement.selectOption(username);
          Log.info(`Selected username by value: ${username}`);
        }
      } else {
        // Text input
        Log.info(`Filling username: ${username}`);
        await usernameElement.fill(username);
      }

      // Get password field locator
      const strPwdLocator = CommonMethods.getValuesFromCsv(
        'txtPassword',
        AppConstants.LOGIN_ELEMENTS
      );

      if (!strPwdLocator) {
        Log.error('Password field locator not found');
        return false;
      }

      Log.info('Filling password');
      await this.page.fill(strPwdLocator, password);

      // Get login button locator
      const btnLogin = CommonMethods.getValuesFromCsv(
        'btnLogin',
        AppConstants.LOGIN_ELEMENTS
      );

      if (!btnLogin) {
        Log.error('Login button locator not found');
        return false;
      }

      await this.page.click(btnLogin);
      Log.info('Login button clicked');

      // Handle MFA if page appears
      try {
        // Get MFA input locator
        const mfaInputLocator = CommonMethods.getValuesFromCsv(
          'txtMfaCode',
          AppConstants.LOGIN_ELEMENTS
        );

        if (mfaInputLocator) {
          await this.page.waitForSelector(mfaInputLocator, { timeout: 5000 });

          Log.info('MFA page detected, generating TOTP code');

          // Determine MFA secret key based on username
          const mfaSecretKey = `mfa_secret_${username.toLowerCase()}`;

          if (!config) {
            Log.error('Config not provided for MFA authentication');
            return false;
          }

          // Try user-specific key first, then fall back to generic key
          const mfaSecret = config[mfaSecretKey] || config.mfa_secret;
          if (!mfaSecret) {
            Log.error(`MFA secret not found for ${username} (key: ${mfaSecretKey})`);
            return false;
          }

          // Generate and enter TOTP code
          const totpCode = CommonMethods.generateTotpCode(mfaSecret);
          await this.page.fill(mfaInputLocator, totpCode);
          Log.info('TOTP code entered');

          // Submit MFA
          const mfaSubmitBtn = CommonMethods.getValuesFromCsv(
            'btnMfaSubmit',
            AppConstants.LOGIN_ELEMENTS
          );

          if (mfaSubmitBtn) {
            await this.page.click(mfaSubmitBtn);
            Log.info('MFA submitted');
          }
        }
      } catch (error) {
        Log.info(`MFA not required or error: ${error}`);
        // Continue - MFA might not be required
      }

      // Wait for navigation away from login page
      await this.page.waitForLoadState('networkidle');

      // Check if login was successful by verifying URL changed
      const currentUrl = this.page.url();
      Log.info(`Current URL after login: ${currentUrl}`);

      // EspoCRM redirects to /#Home or similar after login
      const isOnLoginPage = currentUrl.includes('/login') || currentUrl.endsWith('/');
      const hasFragment = currentUrl.includes('#');

      if (hasFragment || !isOnLoginPage) {
        Log.info('Logged in Successfully - navigated away from login page');
        allure.after(`Logged in Successfully - Current URL: ${currentUrl}`);
        return true;
      } else {
        Log.error('Login unsuccessful - still on login page');
        return false;
      }
    } catch (error) {
      Log.error(`Error during login: ${error}`);
      return false;
    }
  }

  /**
   * Logout from the application
   *
   * @returns True if logout successful
   */
  async logout(): Promise<boolean> {
    try {
      // Attach test info to Allure report
      allure.before('Verify user should be Logout from the application');

      // Check for modal popup and dismiss if visible
      const btnLater = CommonMethods.getValuesFromCsv(
        'btnLater',
        AppConstants.WORKING_ELEMENTS
      );

      if (btnLater && await this.page.isVisible(btnLater)) {
        await this.page.click(btnLater);

        const icoProfile = CommonMethods.getValuesFromCsv(
          'icoProfile',
          AppConstants.LANDING_ELEMENTS
        );

        if (icoProfile) {
          await this.page.waitForSelector(icoProfile);
        }
      }

      // Click profile icon / user menu
      const icoProfile = CommonMethods.getValuesFromCsv(
        'icoProfile',
        AppConstants.LANDING_ELEMENTS
      );

      if (!icoProfile) {
        Log.error('Profile icon locator not found');
        return false;
      }

      await this.page.waitForSelector(icoProfile);
      await this.page.click(icoProfile);

      // Click logout link
      const lnkLogout = CommonMethods.getValuesFromCsv(
        'lnkLogout',
        AppConstants.LANDING_ELEMENTS
      );

      if (!lnkLogout) {
        Log.error('Logout link locator not found');
        return false;
      }

      await this.page.waitForSelector(lnkLogout);
      await this.page.click(lnkLogout);

      // Verify username field is visible (back to login page)
      const txtUsername = CommonMethods.getValuesFromCsv(
        'txtUsername',
        AppConstants.LOGIN_ELEMENTS
      );

      if (!txtUsername) {
        Log.error('Username field locator not found');
        return false;
      }

      await this.page.waitForSelector(txtUsername);
      return await this.page.isVisible(txtUsername);
    } catch (error) {
      Log.error(`Error during logout: ${error}`);
      return false;
    }
  }

  /**
   * Check if error state is shown on login form
   */
  async hasLoginError(): Promise<boolean> {
    const errGroup = CommonMethods.getValuesFromCsv('errUsernameGroup', AppConstants.LOGIN_ELEMENTS);
    if (!errGroup) return false;
    return await this.page.locator(errGroup).isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Simple login and wait for navigation (no MFA)
   */
  async loginAndWait(username: string, password: string): Promise<void> {
    const txtUsername = CommonMethods.getValuesFromCsv('txtUsername', AppConstants.LOGIN_ELEMENTS);
    const txtPassword = CommonMethods.getValuesFromCsv('txtPassword', AppConstants.LOGIN_ELEMENTS);
    const btnLogin = CommonMethods.getValuesFromCsv('btnLogin', AppConstants.LOGIN_ELEMENTS);

    if (!txtUsername || !txtPassword || !btnLogin) {
      throw new Error('Login form locators not found in CSV');
    }

    // Handle username field - could be text input or dropdown
    const usernameElement = this.page.locator(txtUsername);
    const usernameTagName = await usernameElement.evaluate(el => el.tagName.toLowerCase());

    if (usernameTagName === 'select') {
      // Dropdown
      try {
        await usernameElement.selectOption({ label: username });
      } catch {
        await usernameElement.selectOption(username);
      }
    } else {
      // Text input
      await usernameElement.fill(username);
    }

    await this.page.fill(txtPassword, password);
    await this.page.click(btnLogin);
    await this.page.waitForLoadState('networkidle');
    Log.info(`Login attempted for user: ${username}`);
  }
}
