/**
 * FILE: tests/examples/class-based-pattern.spec.ts
 * PURPOSE: Example showing class-based test pattern (Python Pytest style)
 * WHY NECESSARY: Demonstrates how to organize tests with shared state across test methods,
 *   similar to Python's class-based Pytest patterns with class-scoped fixtures.
 * USED BY: Reference for developers familiar with Python Pytest class-based tests
 *
 * HOW IT WORKS:
 * 1. test.describe.serial() ensures tests run in order (like test methods in a class)
 * 2. Shared variables in describe block act as "class attributes"
 * 3. beforeAll/beforeEach hooks replace Python's class-scoped/function-scoped fixtures
 * 4. State persists across test "methods" within the same describe block
 *
 * PYTHON PYTEST EQUIVALENT:
 *
 * class TestLoginWorkflow:
 *     @pytest.fixture(scope='class', autouse=True)
 *     def setup(self):
 *         self.session_data = {'username': '', 'logged_in': False}
 *
 *     @pytest.fixture(scope='function')
 *     def cleanup(self):
 *         yield
 *         # teardown logic
 *
 *     def test_step_1_login(self, loginPage, config):
 *         result = loginPage.login_with_mfa(config.username, config.password, config)
 *         assert result is True
 *         self.session_data['logged_in'] = True
 *
 *     def test_step_2_navigate(self, homePage):
 *         assert self.session_data['logged_in'] is True
 *         homePage.navigate_to_module('Contacts')
 *
 * TypeScript equivalent below uses describe.serial() for ordered execution
 * and shared variables for state persistence.
 */

import { test, expect } from '../fixtures';
import { Log } from '../../src/utils/logger';

test.describe.serial('LoginWorkflow (Class-Based Pattern)', () => {
  // ============================================================
  // "CLASS ATTRIBUTES" - Shared state across all test methods
  // ============================================================
  // Python equivalent: class attributes in TestLoginWorkflow
  let isSetupComplete = false;
  let sessionData: { username: string; loggedIn: boolean; currentModule: string } = {
    username: '',
    loggedIn: false,
    currentModule: '',
  };

  // ============================================================
  // "CLASS SETUP METHOD" - Runs once before all tests
  // ============================================================
  // Python equivalent: @pytest.fixture(scope='class', autouse=True)
  test.beforeAll(async ({ page, config }) => {
    Log.info('🔧 CLASS SETUP: Initializing test suite (runs ONCE)');
    
    // Navigate once for entire test suite (session persistence)
    Log.info('🌐 Navigating to base URL (shared across all tests)');
    await page.goto(config.base_url);
    
    // One-time expensive setup could go here
    // Example: database seeding, test data preparation
    isSetupComplete = true;
  });

  // ============================================================
  // "TEST METHOD 1" - Login with MFA
  // ============================================================
  // Python equivalent: def test_step_1_login(self, loginPage, config):
  test('step_1_login', async ({ loginPage, config }) => {
    Log.info('TEST METHOD 1: Login with MFA');
    
    // Verify setup ran
    expect(isSetupComplete).toBe(true);

    // Perform login action
    const result = await loginPage.loginWithMfa(
      config.username_automation,
      config.password_automation,
      config
    );

    // Assert success
    expect(result).toBe(true);

    // Update shared state (like setting self.session_data in Python)
    sessionData.username = config.username_automation;
    sessionData.loggedIn = true;

    Log.info(`✅ Login successful - User: ${sessionData.username}`);
  });

  // ============================================================
  // "TEST METHOD 2" - Navigate to Module
  // ============================================================
  // Python equivalent: def test_step_2_navigate(self, homePage):
  test('step_2_navigate_to_contacts', async ({ homePage, page }) => {
    Log.info('TEST METHOD 2: Navigate to Contacts module');

    // This test depends on state from step_1
    expect(sessionData.loggedIn).toBe(true);
    Log.info(`📍 Current session: User=${sessionData.username}, LoggedIn=${sessionData.loggedIn}`);

    // Check if home page is loaded
    const isLoaded = await homePage.isLoaded();
    expect(isLoaded).toBe(true);

    // Update shared state
    sessionData.currentModule = 'Home';

    Log.info(`✅ Verified home page loaded`);
  });

  // ============================================================
  // "TEST METHOD 3" - Perform action in module
  // ============================================================
  // Python equivalent: def test_step_3_verify_module(self):
  test('step_3_verify_user_logged_in', async ({ homePage }) => {
    Log.info('TEST METHOD 3: Verify user is still logged in');

    // Assert we're still logged in (using state from previous tests)
    expect(sessionData.loggedIn).toBe(true);

    // Verify user is logged in via page object method
    const isLoggedIn = await homePage.isUserLoggedIn();
    expect(isLoggedIn).toBe(true);

    Log.info('✅ User login state verified');
  });

  // ============================================================
  // "CLASS TEARDOWN METHOD" - Runs once after all tests
  // ============================================================
  // Python equivalent: @pytest.fixture(scope='class', autouse=True) with yield
  test.afterAll(async ({ page }) => {
    Log.info('🧹 CLASS TEARDOWN: Cleaning up test suite (runs ONCE)');

    // Cleanup logic here
    // Example: logout, database cleanup, delete test data
    if (sessionData.loggedIn) {
      // In real tests, you might call logout here
      Log.info('Logging out...');
    }

    // Reset shared state
    sessionData = { username: '', loggedIn: false, currentModule: '' };
    isSetupComplete = false;
  });
});

// ============================================================
// ALTERNATIVE PATTERN: Non-serial tests with test-level fixtures
// ============================================================
/**
 * For comparison, here's a traditional Playwright pattern without shared state.
 * Each test is fully independent and can run in parallel.
 *
 * Python equivalent:
 * def test_login_independent(loginPage, config):
 *     # Fresh page for each test
 */
test.describe('Independent Tests (Traditional Pattern)', () => {
  test.beforeEach(async ({ page, config }) => {
    // Navigate fresh for EVERY test
    await page.goto(config.base_url);
  });

  test('login_test_1', async ({ loginPage, config }) => {
    // This test has no dependency on other tests
    const result = await loginPage.loginWithMfa(
      config.username_automation,
      config.password_automation,
      config
    );
    expect(result).toBe(true);
  });

  test('login_test_2', async ({ loginPage, config }) => {
    // This test runs independently, can run in parallel
    const result = await loginPage.loginWithMfa(
      config.username_automation,
      config.password_automation,
      config
    );
    expect(result).toBe(true);
  });
});

/**
 * KEY DIFFERENCES:
 *
 * | Feature | Class-Based (Serial) | Independent (Parallel) |
 * |---------|---------------------|------------------------|
 * | Execution | Sequential (describe.serial) | Parallel (default) |
 * | State | Shared variables | Fresh every test |
 * | Speed | Slower (dependent order) | Faster (parallel) |
 * | Use Case | Multi-step workflows | Isolated unit tests |
 * | Debugging | Harder (depends on state) | Easier (self-contained) |
 *
 * WHEN TO USE CLASS-BASED PATTERN:
 * ✅ Multi-step workflows (login → navigate → action → verify)
 * ✅ Session persistence needed across tests
 * ✅ Expensive setup that you want to run once
 * ✅ Tests that naturally follow a sequence
 *
 * WHEN TO USE INDEPENDENT PATTERN:
 * ✅ Tests are isolated and don't depend on each other
 * ✅ Want maximum parallelization for speed
 * ✅ Each test should be runnable independently
 * ✅ Easier debugging and maintenance
 */
