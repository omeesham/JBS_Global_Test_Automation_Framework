/**
 * Login page object for Navigator Cloud with Microsoft SSO.
 * Handles Microsoft authentication flow: Continue Now -> email -> password -> redirect back to app.
 */

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { Log } from '../../utils/logger';
import { AppConstants } from '../../utils/constants';
import { IConfig } from '../../types';
import { MicrosoftLoginSelectors } from '../../selectors';
import type { DiagnosticsCollector } from '../../utils/diagnostics-collector';
import { urlHostMatches } from '../../utils/url-host';

export class LoginPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LoginPage constructed for Navigator Cloud');
  }

 /**
 * Navigate to Navigator Cloud (auto-redirects to sign-in page, then Microsoft SSO)
 */
  async goto(): Promise<void> {
    const url = this.config?.base_url || this.config?.url || process.env.BASE_URL || '';
    Log.info(`Navigating to Navigator Cloud: ${url}`);
    
    await this.page.goto(url, { 
      timeout: AppConstants.PAGE_LOAD_TIMEOUT_MS,
      waitUntil: 'domcontentloaded' 
    });
    
    Log.info('Page loaded, checking authentication state...');
  }

 /**
 * Full Microsoft SSO login flow
 * Handles: email -> password -> "Stay signed in?" -> redirect
 * @param username - Microsoft email/username
 * @param password - Microsoft password
 * @returns True if login successful and redirected to Navigator Cloud
 */
  async loginWithMicrosoft(username: string, password: string): Promise<boolean> {
    const collector = (this.page as unknown as Record<string, unknown>).__diagnosticsCollector as DiagnosticsCollector | undefined;

    try {
      Log.info(`Starting Microsoft SSO login for ${username}`);

 // Step 0: Click "Continue Now" on Navigator Cloud sign-in page (pre-SSO step)
      Log.info('Waiting for Navigator Cloud sign-in page...');
      try {
        await this.page.waitForSelector(MicrosoftLoginSelectors.btnContinueNow, { state: 'visible', timeout: 15_000 });
        await this.page.click(MicrosoftLoginSelectors.btnContinueNow);
        Log.info('[OK] Clicked "Continue Now" on Navigator Cloud sign-in page');
      } catch {
        Log.info('"Continue Now" button not found -- may already be on Microsoft login page');
      }

 // Step 1: Wait for Microsoft login page
      await this.waitForMicrosoftLoginPage();
      collector?.recordUrl();

 // Step 2: Enter email
      Log.info('Entering email...');
      await this.page.fill(MicrosoftLoginSelectors.txtEmail, username);
      await this.page.click(MicrosoftLoginSelectors.btnNext);

 // Step 3: Wait for password field
      Log.info('Waiting for password field...');
      await this.page.waitForSelector(MicrosoftLoginSelectors.txtPassword, { 
        state: 'visible', 
        timeout: AppConstants.ACTION_TIMEOUT_MS 
      });

 // Step 4: Enter password
      Log.info('Entering password...');
      await this.page.fill(MicrosoftLoginSelectors.txtPassword, password);
      await this.page.click(MicrosoftLoginSelectors.btnSignIn);

 // Step 5: Handle "Stay signed in?" prompt (optional)
      await this.handleStaySignedIn();

 // Step 7: Wait for redirect back to Navigator Cloud
      Log.info('Waiting for redirect to Navigator Cloud...');
      const expectedHostname = new URL(this.config?.base_url || this.config?.url || '').hostname;

      try {
        await this.page.waitForURL(
          url => urlHostMatches(url.toString(), expectedHostname),
          { timeout: AppConstants.NAVIGATION_TIMEOUT_MS }
        );
      } catch (redirectError) {
 // Differentiate: check for OAuth errors, redirect loops, post-login failures
        collector?.recordUrl();
        const currentUrl = this.page.url();
        const authChain = collector?.getAuthChain() ?? [];
        const netFails = collector?.getNetworkFailures() ?? [];

 // Check for OAuth 400/401 in network failures
        const oauthFail = netFails.find(n =>
          (urlHostMatches(n.url, 'login.microsoftonline.com') || n.url.includes('oauth')) && n.status >= 400
        );
        if (oauthFail) {
          throw new Error(`OAuth token request returned ${oauthFail.status}: ${oauthFail.body.substring(0, 500)}`);
        }

 // Check for SSO redirect loop (>5 redirects to same domain)
        const authRedirects = authChain.filter(e => e.status >= 300 && e.status < 400);
        if (authRedirects.length > 5) {
          throw new Error(`SSO redirect loop detected -- ${authRedirects.length} redirects to ${authRedirects.at(-1)?.url ?? 'unknown'}`);
        }

 // Post-login app fail
        if (!urlHostMatches(currentUrl, 'login.microsoftonline.com') && !urlHostMatches(currentUrl, expectedHostname)) {
          throw new Error(`Post-login app failed to load -- page URL: ${currentUrl}, expected: ${expectedHostname}`);
        }

        throw redirectError;
      }

 // Wait for page resources after redirect
      Log.info('[wait] Waiting for domcontentloaded after redirect...');
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
      Log.info('[wait] Waiting for full page load...');
      await this.page.waitForLoadState('load', { timeout: 30_000 });
      Log.info('[OK] Page load complete after redirect');

      collector?.recordUrl();

 // Step 8: Verify authenticated state
      const isAuthenticated = await this.isLoggedIn();
      if (isAuthenticated) {
        Log.info('[OK] Microsoft SSO login successful');
        return true;
      } else {
        Log.error('[ERR] Login appeared successful but authentication verification failed');
        return false;
      }
    } catch (error) {
      collector?.recordUrl();
      Log.error(`Microsoft SSO login failed: ${error}`);
      await this.takeScreenshot('microsoft-sso-login-failed');
      return false;
    }
  }

 /**
 * Wait for Microsoft login page to appear
 * Microsoft auth page can take 10s average to load - wait for network idle before checking elements
 */
  private async waitForMicrosoftLoginPage(): Promise<void> {
    Log.info('Waiting for Microsoft login page...');
    
 // Step 1: Wait for URL redirect to Microsoft
    await this.page.waitForURL(
      url => urlHostMatches(url.toString(), 'login.microsoftonline.com'),
      { timeout: AppConstants.NAVIGATION_TIMEOUT_MS }
    );
    
 // Step 2: Wait for email field visibility (skip networkidle -- MS telemetry prevents it from resolving)
    await this.page.waitForSelector(MicrosoftLoginSelectors.txtEmail, { 
      state: 'visible', 
      timeout: AppConstants.ELEMENT_WAIT_TIMEOUT_MS 
    });
    
    Log.info('[OK] Microsoft login page loaded');
  }

 /**
 * Handle optional "Stay signed in?" prompt
 * Clicks "Yes" to keep session alive longer
 */
  private async handleStaySignedIn(): Promise<void> {
    try {
      await this.page.waitForSelector(MicrosoftLoginSelectors.btnYesStaySignedIn, { 
        state: 'visible', 
        timeout: 3000 
      });

      Log.info('"Stay signed in?" prompt detected, clicking Yes...');
      await this.page.click(MicrosoftLoginSelectors.btnYesStaySignedIn);
      Log.info('[OK] "Stay signed in" accepted');
    } catch {
 // Prompt didn't appear - optional
      Log.info('"Stay signed in?" prompt not shown');
    }
  }

 /**
 * Check if user is authenticated (on Navigator Cloud, not Microsoft login page)
 * @returns True if authenticated and on Navigator Cloud
 */
  async isLoggedIn(): Promise<boolean> {
    try {
      const url = this.page.url();

 // Check if NOT on Microsoft login page
      if (urlHostMatches(url, 'login.microsoftonline.com')) {
        return false;
      }

 // Check if on Navigator Cloud domain
      const expectedHostname = new URL(this.config?.base_url || this.config?.url || '').hostname;
      if (!urlHostMatches(url, expectedHostname)) {
        return false;
      }

 // Check for OAuth/auth error params in URL (NextAuth error codes)
      if (url.includes('error=OAuth') || url.includes('error=Callback') || url.includes('/auth/sign-in')) {
        Log.error(`[ERR] OAuth error detected in URL: ${url}`);
        return false;
      }

 // Wait for Navigator Cloud app to load (path-based routing)
      await this.page.waitForURL(
        u => u.toString().includes('/navigator/locations/'),
        { timeout: 5000 }
      ).catch(() => {});

 // Re-read URL after potential redirect
      const currentUrl = this.page.url();
      const isNavigatorLoaded = urlHostMatches(currentUrl, expectedHostname) && !currentUrl.includes('/auth/sign-in');

      Log.info(`Authentication check: ${isNavigatorLoaded ? '[OK] Authenticated' : '[ERR] Not authenticated'} -- URL: ${currentUrl}`);
      return isNavigatorLoaded;
    } catch (error) {
      Log.error(`isLoggedIn check failed: ${error}`);
      return false;
    }
  }

 /**
 * Detect if we've been redirected to Microsoft login (session expired)
 * @returns True if on Microsoft login page
 */
  async isOnMicrosoftLogin(): Promise<boolean> {
    const url = this.page.url();
    return urlHostMatches(url, 'login.microsoftonline.com');
  }

 /**
 * Check for authentication errors on Microsoft login page
 * @returns Error message if present, null otherwise
 */
  async getLoginError(): Promise<string | null> {
    try {
      const errorDiv = await this.page.locator(MicrosoftLoginSelectors.divError).first();
      if (await errorDiv.isVisible({ timeout: 2000 })) {
        const errorText = await errorDiv.textContent();
        return errorText?.trim() || 'Unknown error';
      }
    } catch {
 // No error visible
    }
    return null;
  }
}
