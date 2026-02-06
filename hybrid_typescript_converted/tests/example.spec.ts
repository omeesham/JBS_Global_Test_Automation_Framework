/**
 * Example Test Spec
 * Demonstrates usage of the migrated framework
 * 
 * To run:
 *   npx playwright test
 *   npx playwright test --project=chrome
 *   npx playwright test --headed
 */

import { test, expect } from './fixtures';
import { Log } from '../utils/logger';

/**
 * Example Test Suite
 * Tests are executed in order using test.describe.serial()
 */
test.describe.serial('Login Flow Tests', () => {
  /**
   * Test 1: Verify login with MFA
   */
  test('should login successfully with MFA', async ({ loginPage, config, page }) => {
    Log.info('Starting login test');

    const result = await loginPage.loginWithMfa(
      config.username_automation,
      config.password_automation,
      config
    );

    expect(result).toBe(true);
    expect(page.url()).toContain(config.home_url);
    
    Log.info('Login test completed successfully');
  });

  /**
   * Test 2: Verify forgot password link exists
   */
  test('should display forgot password link', async ({ loginPage, page }) => {
    // Navigate to login page
    await page.goto('/');

    const linkExists = await loginPage.isForgotPwdLinkExist();
    expect(linkExists).toBe(true);
  });

  /**
   * Test 3: Verify Azure AD link exists
   */
  test('should display Azure AD login link', async ({ loginPage, page }) => {
    // Navigate to login page
    await page.goto('/');

    const linkExists = await loginPage.isLoginUsingAzureAdLinkExist();
    expect(linkExists).toBe(true);
  });
});

/**
 * Example of using validation helpers
 */
test.describe('Validation Helpers Example', () => {
  test('should validate text content', async ({ page, commonMethods }) => {
    // Example of using CommonMethods validation helpers
    // await CommonMethods.validateText(page, 'element_key', 'expected_text', 'CSV_FILE');
    
    // This is a placeholder - implement actual test logic
    expect(true).toBe(true);
  });
});
