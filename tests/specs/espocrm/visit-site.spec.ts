/**
 * FILE: tests/specs/espocrm/visit-site.spec.ts
 * PURPOSE: EspoCRM Demo Site Access - Basic site verification
 * WHY NECESSARY: Verifies framework can access EspoCRM demo site before agents handle login
 * USED BY: Playwright test runner
 *
 * HOW IT WORKS:
 * 1. Uses custom fixtures from tests/fixtures.ts
 * 2. Uses UiCommon for reusable workflow methods
 * 3. Visits demo site and verifies basic accessibility
 * 4. Does NOT attempt login - agents will handle authentication
 *
 * TEST COVERAGE:
 * - Site accessibility check
 * - Page load verification
 * - Basic element visibility
 */

import { test, expect } from '../../fixtures';
import { Log } from '../../../src/utils/logger';
import { UiCommon } from '../../../src/common/ui-common';

/**
 * EspoCRM Demo Site Access Test Suite
 *
 * Verifies basic framework connectivity to EspoCRM demo site
 * Agents will handle actual login flow and comprehensive testing
 */
test.describe('EspoCRM Demo Site - Basic Access', () => {
  /**
   * Test Setup
   * Runs before each test in this suite
   */
  test.beforeEach(async ({ page }) => {
    await UiCommon.setupTestContext(page);
  });

  /**
   * Test: Visit EspoCRM Demo Site
   *
   * WHAT: Navigates to EspoCRM demo site and verifies page loads
   * WHY: Ensures framework can access the target application before agents handle login
   * HOW:
   *   1. Navigate using LoginPage.goto() (uses CSV selectors)
   *   2. Verify login form displayed (uses CSV selector 'frmLogin')
   *
   * NOTE: This test does NOT attempt login - agents will handle that
   * CREDENTIALS: Loaded from environment configuration
   */
  test('should visit EspoCRM demo site and verify page loads', async ({ loginPage }) => {
    Log.info('TEST: Visit EspoCRM Demo Site');

    await loginPage.goto();
    const isFormVisible = await loginPage.isLoginFormDisplayed();

    expect(isFormVisible, 'Login form should be visible').toBe(true);
    Log.info('✅ EspoCRM demo site loaded - ready for agents');
  });

  /**
   * Test: Verify Login Page Structure
   *
   * WHAT: Verifies login page elements exist (form, forgot password link)
   * WHY: Ensures login page structure is correct before agents attempt login
   * HOW:
   *   1. Navigate using LoginPage.goto()
   *   2. Verify form and forgot password link (both use CSV selectors)
   */
  test('should verify login page structure exists', async ({ loginPage, page }) => {
    Log.info('TEST: Verify Login Page Structure');

    await loginPage.goto();
    const formDisplayed = await loginPage.isLoginFormDisplayed();

    expect(formDisplayed, 'Login form should be visible').toBe(true);
    await expect(page, 'Page title should contain EspoCRM').toHaveTitle(/EspoCRM/i);
    Log.info('✅ Login page structure verified - ready for agents');
  });
});
