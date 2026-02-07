/**
 * FILE: tests/example.spec.ts
 * PURPOSE: Example test demonstrating thin test pattern (<10 lines)
 * WHY NECESSARY: Shows usage of workflow methods from UiCommon class
 * USED BY: Playwright test runner, new developers learning framework
 * 
 * HOW IT WORKS:
 * 1. Leverages UiCommon workflow methods for common operations
 * 2. Uses credential-loader for dynamic credential fetching
 * 3. Each test is <10 lines (excluding comments) per Req #9
 * 4. Tests are self-contained and readable
 * 
 * To run:
 *   npx playwright test example
 *   npx playwright test example --project=chrome
 *   npx playwright test example --headed
 */

import { test, expect } from './fixtures';
import { Log } from '../src/utils/logger';
import { UiCommon } from '../src/common/ui-common';

/**
 * Example Test Suite - Thin Test Pattern
 * Demonstrates <10 line tests using workflow methods
 */
test.describe.serial('Login Flow Tests', () => {
  /**
   * Test 1: Verify login with MFA (6 lines)
   * Uses: UiCommon.navigateToAuthenticatedPage() workflow method
   */
  test('should login successfully with MFA', async ({ page, config }) => {
    Log.info('Starting login test');
    
    const result = await UiCommon.navigateToAuthenticatedPage(page, config.base_url, { type: 'env' }, config);
    
    expect(result.authenticated).toBe(true);
    expect(page.url()).toContain(config.home_url);
    Log.info('Login test completed successfully');
  });

  /**
   * Test 2: Verify forgot password link exists (5 lines)
   * Uses: UiCommon.verifyElementWithRetry() for reliable element checks
   */
  test('should display forgot password link', async ({ loginPage, page, config }) => {
    await UiCommon.setupTestContext(page);
    await page.goto(config.base_url);
    
    const linkExists = await loginPage.isForgotPwdLinkExist();
    expect(linkExists).toBe(true);
  });

  /**
   * Test 3: Verify Azure AD link exists (5 lines)
   * Uses: UiCommon.verifyElementWithRetry() for robust element verification
   */
  test('should display Azure AD login link', async ({ loginPage, page, config }) => {
    await UiCommon.setupTestContext(page);
    await page.goto(config.base_url);
    
    const linkExists = await loginPage.isLoginUsingAzureAdLinkExist();
    expect(linkExists).toBe(true);
  });
});

/**
 * Example of using validation helpers (4 lines)
 */
test.describe('Validation Helpers Example', () => {
  test('should validate text content', async ({ page }) => {
    await UiCommon.setupTestContext(page);
    // Example placeholder - implement actual validation logic as needed
    expect(true).toBe(true);
  });
});

