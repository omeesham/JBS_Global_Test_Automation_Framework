/**
 * FILE: src/pages/login.page.ts
 * PURPOSE: Login page object with MFA support
 * WHY NECESSARY: Encapsulates login page interactions for authentication flows
 * USED BY: Login tests (tests/specs/auth/login.spec.ts), test fixtures
 * 
 * HOW IT WORKS:
 * 1. Uses CSV locators from object_repository/Login_Elements.csv
 * 2. Implements loginWithMfa() for standard + MFA authentication
 * 3. Supports OpenAI self-healing for element location
 * 4. Integrates with CommonMethods for CSV reading and validation
 * 5. Returns boolean success/failure for all public methods
 */

import { Page } from '@playwright/test';
import { Log } from '../utils/logger';
import { CommonMethods, allure } from '../utils/common-methods';
import { OpenAIUtils } from '../utils/openai-utils';
import { AppConstants } from '../utils/app-constants';
import { IConfig } from '../types';

export class LoginPage {
  private page: Page;
  private openaiUtils: OpenAIUtils;

  constructor(page: Page) {
    Log.info('Login page constructor');
    this.page = page;
    this.openaiUtils = new OpenAIUtils();
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
    return await this.page.isVisible(lnkForgotPassword);
  }

  /**
   * Check if Azure AD login link exists
   */
  async isLoginUsingAzureAdLinkExist(): Promise<boolean> {
    const lnkAzureAd = CommonMethods.getValuesFromCsv(
      'lnkAzureAd',
      AppConstants.LOGIN_ELEMENTS
    );
    
    if (!lnkAzureAd) return false;
    return await this.page.isVisible(lnkAzureAd);
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

      // Wait and reload page
      await this.page.waitForTimeout(3000);
      await this.page.reload();

      // Fill credentials
      Log.info(`Filling username: ${username}`);
      await this.page.fill(strUnLocator, username);

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
      await this.page.waitForTimeout(6000);

      // Check if login was successful by verifying URL changed
      const currentUrl = this.page.url();
      Log.info(`Current URL after login: ${currentUrl}`);

      const homeUrl = config?.home_url;
      if (currentUrl === homeUrl) {
        Log.info('Logged in Successfully - navigated to home page from login page');
        allure.after(`Logged in Successfully - Current URL: ${currentUrl}`);
        return true;
      } else {
        Log.error('Login unsuccessful - still on main login page');
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

      // Check for "Later" button and click if visible
      const btnLater = CommonMethods.getValuesFromCsv(
        'btn_Later',
        AppConstants.WORKING_ELEMENTS
      );

      if (btnLater && await this.page.isVisible(btnLater)) {
        await this.page.click(btnLater);
        
        const icoProfile = CommonMethods.getValuesFromCsv(
          'ico_Profile',
          AppConstants.LANDING_ELEMENTS
        );
        
        if (icoProfile) {
          await this.page.waitForSelector(icoProfile);
        }
      }

      // Click profile icon
      const icoProfile = CommonMethods.getValuesFromCsv(
        'ico_Profile',
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
        'lnk_Logout',
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
}
