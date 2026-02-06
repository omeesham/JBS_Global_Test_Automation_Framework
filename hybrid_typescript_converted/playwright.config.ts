import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

/**
 * Playwright Test Configuration
 * Migrated from pytest.ini and conftest.py
 * 
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Test file patterns (equivalent to pytest.ini python_files)
  testMatch: '**/*.spec.ts',
  
  // Timeout per test (30 seconds)
  timeout: 30 * 1000,
  
  // Maximum time expect() should wait for condition (5 seconds)
  expect: {
    timeout: 5000,
  },
  
  // Run tests in files in parallel
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : 1,
  
  // Reporter to use (equivalent to pytest --html and --alluredir)
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
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'https://your-app-url.com',
    
    // Collect trace on first retry of each test (for debugging)
    trace: 'on-first-retry',
    
    // Screenshot on failure (equivalent to conftest.py hook)
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    
    // Video on first retry
    video: 'retain-on-failure',
    
    // Viewport (null = no viewport, equivalent to Python no_viewport=True)
    viewport: null,
    
    // Emulate browser locale
    locale: 'en-US',
    
    // Emulate timezone
    timezoneId: 'America/New_York',
    
    // Permissions
    permissions: [],
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },
  
  // Configure projects for major browsers (equivalent to PlaywrightFactory browser support)
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
  ],
  
  // Output folders
  outputDir: 'test-results/',
  
  // Folder for test artifacts such as screenshots, videos, traces, etc.
  snapshotDir: 'test-results/snapshots',
  
  // Global setup/teardown
  // globalSetup: require.resolve('./tests/global-setup'),
  // globalTeardown: require.resolve('./tests/global-teardown'),
  
  // Run your local dev server before starting the tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
