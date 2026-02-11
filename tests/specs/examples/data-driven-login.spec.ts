/**
 * FILE: tests/specs/examples/data-driven-login.spec.ts
 * PURPOSE: Example of data-driven testing using adapters
 * WHY NECESSARY: Demonstrate adapter usage pattern
 * USED BY: Reference for writing data-driven tests
 * 
 * HOW IT WORKS:
 * 1. Load test data from Excel/JSON using AdapterFactory
 * 2. Iterate through data records
 * 3. Run test for each data set
 */

import { test, expect } from '../../fixtures';
import { AdapterFactory } from '../../../src/data/adapters/adapterFactory';
import { Log } from '../../../src/utils/logger';
import { UiCommon } from '../../../src/common/ui-common';

/**
 * Example: Data-driven login tests using Excel adapter
 * 
 * WHAT: Tests login with multiple user scenarios from Excel file
 * WHY: Avoid hardcoding test data, enable easy data updates
 * HOW: Uses AdapterFactory to load users.xlsx
 */
test.describe('Data-Driven Login Tests', () => {
  test('should login with multiple users from Excel', async ({ page, config }) => {
    // Load test data from Excel (CSV format also supported)
    const adapter = AdapterFactory.getAdapter('excel');
    const testData = await adapter.load({
      file: 'config/test-data/users.csv',
      sheet: 'Sheet1'  // For CSV, sheet parameter is optional
    });

    Log.info(`Loaded ${testData.records.length} test scenarios from Excel`);

    // Iterate through each user scenario using UiCommon workflow
    for (const user of testData.records) {
      Log.info(`Testing login for: ${user.username}`);

      // Use UiCommon workflow (handles navigation, cookies, loading, MFA)
      const result = await UiCommon.navigateToAuthenticatedPage(
        page, config.base_url,
        { type: 'inline', username: user.username, password: user.password },
        config
      );

      // Assert based on expected_result column in Excel
      const shouldSucceed = user.expected_result === 'success';
      expect(result.authenticated, `Login should ${shouldSucceed ? 'succeed' : 'fail'} for ${user.username}`).toBe(shouldSucceed);

      // Proper logout with session clearing
      if (result.authenticated) {
        await UiCommon.performCompleteLogout(page);
      }
    }
  });

  /**
   * Example: Load test data from JSON
   */
  test('should load user data from JSON', async ({ page }) => {
    const adapter = AdapterFactory.getAdapter('json');
    const testData = await adapter.load({
      file: 'config/test-data/test-users.json'
    });

    Log.info(`Loaded ${testData.records.length} users from JSON`);

    // Use test data as needed
    const firstUser = testData.records[0];
    expect(firstUser).toHaveProperty('username');
    expect(firstUser).toHaveProperty('password');
  });
});
