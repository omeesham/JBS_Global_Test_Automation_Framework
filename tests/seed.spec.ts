import { test, expect } from './fixtures';
import { Log } from '../src/utils/logger';

/**
 * Seed Test for EspoCRM
 * Provides ready-to-use page context for Playwright Agents
 * Agents use this to understand EspoCRM environment and workflows
 *
 * IMPORTANT: This test uses Page Object Model pattern
 * Agents should learn from this to generate tests using fixtures, not raw page methods
 */
test.describe('EspoCRM Environment Setup', () => {
  test('seed', async ({ page, config, loginPage }) => {
    Log.info('SEED: Setting up EspoCRM environment context');

    // Navigate to EspoCRM application using config
    await page.goto(config.base_url);
    Log.info(`Navigated to: ${config.base_url}`);

    // Verify EspoCRM application loads correctly
    await expect(page).toHaveTitle(/EspoCRM/i);
    Log.info('EspoCRM title verified');

    // Verify login form elements exist using page object methods
    const loginFormExists = await loginPage.isLoginFormDisplayed();
    Log.info(`Login form visible: ${loginFormExists}`);

    const forgotPwdExists = await loginPage.isForgotPwdLinkExist();
    Log.info(`Forgot password link visible: ${forgotPwdExists}`);

    // This seed test provides agents with:
    // - How to use config fixture for URLs (config.base_url)
    // - How to use page object fixtures (loginPage)
    // - How to call page object methods (isLoginFormDisplayed, isForgotPwdLinkExist)
    // - How to add logging (Log.info)
    // - Clean test structure (method calls, no raw page.locator/click)

    Log.info('SEED: EspoCRM environment context ready for agents');
  });
});
