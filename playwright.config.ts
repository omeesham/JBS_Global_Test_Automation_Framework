import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env files
// WHAT: Uses dotenv to load environment-specific variables
// WHY: Enables configuration for dev/staging/production without code changes
// HOW: Loads .env.{environment} files via dotenv-flow (configured in env.ts)
dotenv.config();

/**
 * Playwright Test Configuration
 * Migrated from pytest.ini and conftest.py
 * 
 * WHAT: Centralized test execution configuration for Playwright
 * WHY: Control parallelization, retries, timeouts, browsers, and artifacts
 * HOW: Uses defineConfig() with typed options for IntelliSense support
 * 
 * KEY SECTIONS:
 * 1. Test Discovery (testDir, testMatch)
 * 2. Execution Control (workers, retries, fullyParallel)
 * 3. Timeouts (timeout, expect.timeout, actionTimeout, navigationTimeout)
 * 4. Reporters (HTML, JSON, JUnit, Allure, List)
 * 5. Artifacts (trace, screenshot, video)
 * 6. Browser Projects (Chrome, Chromium, Firefox, WebKit)
 * 
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // ==================== TEST DISCOVERY ====================
  // WHAT: Specifies where test files are located
  // WHY: Playwright needs to know which directory to scan for tests
  // HOW: Relative path from project root, scans recursively
  testDir: './tests',
  
  // WHAT: Glob pattern to match test files
  // WHY: Filters which .ts files are treated as tests vs utilities
  // HOW: Uses glob syntax - **/*.spec.ts matches any .spec.ts in any subfolder
  // TUNING: Add patterns like '**/*.test.ts' or exclude with '!**/*.skip.spec.ts'
  testMatch: '**/*.spec.ts',
  
  // ==================== TIMEOUTS ====================
  // WHAT: Maximum time (ms) for a single test to complete
  // WHY: Prevents tests from hanging indefinitely and blocking CI/CD
  // HOW: Applies to entire test() function from start to finish
  // TUNING: Increase for E2E tests with long workflows (60000+ ms)
  //         Decrease for unit tests (10000 ms)
  //         Override per-test with: test.setTimeout(60000)
  timeout: 30 * 1000,
  
  // WHAT: Maximum time (ms) expect() assertions wait for conditions
  // WHY: Auto-retry assertions until condition is true or timeout
  // HOW: Applies to all expect() calls unless overridden
  // TUNING: Increase for slow-loading elements (10000+ ms)
  //         Keep low for fast-feedback on failures (5000 ms default)
  expect: {
    timeout: 5000,
  },
  
  // ==================== PARALLELIZATION ====================
  // WHAT: Run tests within each file in parallel
  // WHY: Speed up execution when tests are independent
  // HOW: When true, tests in same file run concurrently in separate workers
  // TUNING: Enable (true) for independent tests
  //         Disable (false) when tests share state or global resources
  //         Currently FALSE - tests may have shared dependencies (login state, etc.)
  fullyParallel: false,
  
  // WHAT: Prevent test.only() from passing in CI
  // WHY: Developers use test.only() locally but shouldn't commit it
  // HOW: Checks process.env.CI environment variable
  forbidOnly: !!process.env.CI,
  
  // ==================== RETRY STRATEGY ====================
  // WHAT: Number of times to retry failed tests
  // WHY: Handle flaky tests caused by timing, network, or race conditions
  // HOW: Retries ENTIRE test (not individual actions)
  // TUNING: CI: 2 retries (balance stability vs build time)
  //         Local: 0 retries (fast feedback for development)
  //         For very flaky tests, consider fixing root cause instead
  retries: process.env.CI ? 2 : 0,
  
  // ==================== WORKER PROCESSES ====================
  // WHAT: Number of parallel worker processes
  // WHY: Distribute tests across CPU cores for speed
  // HOW: Each worker runs tests independently (separate browser contexts)
  // TUNING: Local: 1 worker (predictable, easier debugging)
  //         CI: 1 worker (prevents resource contention in containers)
  //         High-spec machines: use undefined or 4+ (auto-detect cores)
  //         Formula: workers = Math.floor(CPU_CORES / 2) for balanced load
  workers: process.env.CI ? 1 : 1,
  
  // ==================== REPORTERS ====================
  // WHAT: Output formats for test results
  // WHY: Different consumers need different formats (CI, developers, dashboards)
  // HOW: Array of reporters - all execute simultaneously
  // AVAILABLE:
  //   - 'list': Console output with real-time progress (developer-friendly)
  //   - 'html': Interactive HTML report with screenshots/traces (debugging)
  //   - 'json': Machine-readable for custom processing
  //   - 'junit': XML format for CI/CD integration (Jenkins, Azure DevOps)
  //   - 'allure-playwright': Rich reporting with history and trends
  // TUNING: Add 'dot' for minimal CI output, 'github' for GitHub Actions annotations
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['allure-playwright', { 
      outputFolder: 'reports/allure-results',
      detail: true,
      suiteTitle: true 
    }],
  ],
  
  // ==================== SHARED SETTINGS (ALL BROWSERS) ====================
  // WHAT: Default configuration for all browser projects
  // WHY: Avoid repeating settings for each browser
  // HOW: Individual projects can override these settings
  use: {
    // WHAT: Base URL for relative navigation paths
    // WHY: Enables environment-specific URLs without changing test code
    // HOW: page.goto('/login') → BASE_URL + '/login'
    // TUNING: Set in .env files: .env.development, .env.staging, .env.production
    baseURL: process.env.BASE_URL || 'https://your-app-url.com',
    
    // ==================== DEBUGGING ARTIFACTS ====================
    // WHAT: Playwright trace (timeline of all actions, network, console)
    // WHY: Essential for debugging flaky or failed tests
    // HOW: Captures DOM snapshots, network, console, screenshots
    // OPTIONS: 'on' (always), 'off' (never), 'retain-on-failure', 'on-first-retry'
    // TUNING: 'on-first-retry' = only collect when test fails and retries (saves disk space)
    //         'on' for deep debugging but generates large files (~10MB+ per test)
    trace: 'on-first-retry',
    
    // WHAT: Capture screenshot when test fails
    // WHY: Visual debugging - see UI state at failure point
    // HOW: Screenshots saved to test-results/ directory
    // TUNING: 'only-on-failure' (default) - minimal disk usage
    //         'on' - screenshot every test (for visual regression)
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,  // Capture entire scrollable page vs just viewport
    },
    
    // WHAT: Record video of test execution
    // WHY: See exact user interactions and timing issues
    // HOW: Videos saved to test-results/ directory (WebM format)
    // OPTIONS: 'on', 'off', 'retain-on-failure', 'on-first-retry'
    // TUNING: 'retain-on-failure' = keep only failed test videos (saves space)
    //         WARNING: Videos add ~2MB+ per test, can fill disk quickly
    video: 'retain-on-failure',
    
    // ==================== BROWSER SETTINGS ====================
    // WHAT: Browser viewport size
    // WHY: Control responsive behavior and screen size
    // HOW: null = use browser's default (maximized window)
    //      { width: 1920, height: 1080 } = fixed size
    // TUNING: null for desktop apps (uses full screen)
    //         { width: 1920, height: 1080 } for consistent screenshots
    //         { width: 375, height: 667 } for mobile testing
    viewport: null,
    
    // WHAT: Browser locale/language
    // WHY: Test localization and region-specific features
    // HOW: Affects navigator.language and accept-language header
    locale: 'en-US',
    
    // WHAT: Browser timezone
    // WHY: Test date/time formatting and timezone-sensitive features
    // HOW: Emulates system timezone without changing machine settings
    timezoneId: 'America/New_York',
    
    // WHAT: Browser permissions (notifications, geolocation, camera, etc.)
    // WHY: Auto-grant permissions to avoid manual clicks
    // HOW: Array of permission names
    // EXAMPLE: ['geolocation', 'notifications']
    permissions: [],
    
    // ==================== ACTION TIMEOUTS ====================
    // WHAT: Maximum time (ms) for single action (click, fill, etc.)
    // WHY: Prevent individual actions from hanging
    // HOW: Applies to page.click(), page.fill(), etc.
    // TUNING: 10000 ms default is usually sufficient
    //         Increase for slow-rendering elements (animations)
    actionTimeout: 10 * 1000,
    
    // WHAT: Maximum time (ms) for page navigation
    // WHY: Page loads can be slow (network, backend processing)
    // HOW: Applies to page.goto(), page.reload(), etc.
    // TUNING: 30000 ms good for most apps
    //         Increase for slow-loading pages or slow networks
    navigationTimeout: 30 * 1000,
  },
  
  // ==================== BROWSER PROJECTS ====================
  // WHAT: Different browser configurations to run tests against
  // WHY: Cross-browser testing ensures compatibility
  // HOW: Each project runs ALL tests in specified browser
  // USAGE: npx playwright test --project=chrome
  //        npx playwright test --project=chrome --project=firefox
  // TUNING: Remove unused browsers to speed up CI
  //         Add mobile emulation projects (see examples below)
  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
    
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chromium'],
        viewport: null,
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: null,
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: null,
      },
    },

    // ==================== MOBILE EMULATION (Examples - commented out) ====================
    // WHAT: Emulate mobile devices (viewport, user agent, touch)
    // WHY: Test mobile-responsive layouts without physical devices
    // HOW: Use predefined device descriptors from '@playwright/test'
    // UNCOMMENT BELOW TO ENABLE:
    /*
    {
      name: 'Mobile Chrome',
      use: { ...devices['iPhone 13 Pro'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
    */
  ],
  
  // ==================== OUTPUT DIRECTORIES ====================
  // WHAT: Where test execution artifacts are saved
  // WHY: Organize test results, screenshots, videos, traces
  // HOW: Created automatically, cleaned on next run
  outputDir: 'test-results/',
  
  // WHAT: Directory for visual regression snapshots
  // WHY: Stores expected images for expect(page).toHaveScreenshot()
  // HOW: First run saves baseline, subsequent runs compare
  snapshotDir: 'test-results/snapshots',
  
  // ==================== GLOBAL HOOKS (Examples - commented out) ====================
  // WHAT: Run code once before/after ALL tests
  // WHY: Setup test database, start servers, configure test environment
  // HOW: Point to .ts files with setup/teardown logic
  // EXAMPLES:
  //   - Setup: Create test database, seed data, start mock servers
  //   - Teardown: Cleanup database, stop servers, send metrics
  // globalSetup: require.resolve('./tests/global-setup'),
  // globalTeardown: require.resolve('./tests/global-teardown'),
  
  // ==================== DEV SERVER (Example - commented out) ====================
  // WHAT: Start local development server before tests
  // WHY: Test against local build instead of deployed app
  // HOW: Runs command, waits for URL to respond, then starts tests
  // USE CASE: Frontend apps that need 'npm run dev' or 'npm start'
  // TUNING: reuseExistingServer=true to avoid killing active dev server
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,  // Time to wait for server startup
  // },
});

/**
 * ==================== CONFIGURATION BEST PRACTICES ====================
 * 
 * 1. TIMEOUTS:
 *    - Test timeout: 30s (simple tests) to 90s (complex E2E flows)
 *    - Expect timeout: 5s (fast feedback) to 10s (slow elements)
 *    - Navigation timeout: 30s (standard) to 60s (slow backends)
 * 
 * 2. PARALLELIZATION:
 *    - Local dev: 1 worker (easier debugging)
 *    - CI with 2 CPU: 1 worker (prevent resource contention)
 *    - CI with 4+ CPU: 2-4 workers (balance speed vs stability)
 *    - High-spec machine: undefined (auto-detect, use 50% of cores)
 * 
 * 3. RETRIES:
 *    - Local: 0 (fail fast, fix immediately)
 *    - CI: 2 (handle transient failures)
 *    - If retries regularly needed, fix flakiness at source
 * 
 * 4. ARTIFACTS:
 *    - Small test suites: trace='on', video='on' (full debugging)
 *    - Large test suites: trace='on-first-retry', video='retain-on-failure' (save space)
 *    - CI with tight disk: screenshots only
 * 
 * 5. BROWSERS:
 *    - Development: Chrome only (fast iteration)
 *    - PR validation: Chrome + Firefox (critical browsers)
 *    - Release: All browsers (full coverage)
 *    - Mobile testing: Add device emulation projects
 * 
 * 6. URL STRATEGY:
 *    - Use baseURL + relative paths in tests: page.goto('/login')
 *    - Configure via .env files per environment
 *    - Never hardcode URLs in test files
 * 
 * ==================== TROUBLESHOOTING ====================
 * 
 * - Tests timeout: Increase timeout, check for infinite waits
 * - Flaky tests: Enable trace='on', review timing issues
 * - Slow CI: Reduce workers, disable parallel, remove unnecessary browsers
 * - Disk space issues: Disable video, use 'retain-on-failure' for trace
 * - Memory issues: Reduce workers, run tests in batches
 * 
 */
