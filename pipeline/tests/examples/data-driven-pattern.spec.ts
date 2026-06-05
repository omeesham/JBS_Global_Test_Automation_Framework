/**
 * EXAMPLE: Data-driven testing using AdapterFactory.
 * Shows: loading test data from Excel/CSV/JSON, iterating records, using fixtures.
 *
 * Adapters available: 'excel' (xlsx/csv), 'json', 'db', 's3'
 * Adapters never throw -- empty records with warning if file missing.
 *
 * TEST DATA CONVENTION (ALL-065):
 * - All test data constants go in `tests/test-data/<section>/<module>/<feature>.data.ts`
 * - Each data file starts with a traceability header:
 *     /**
 *      * Test data for: <Feature Name>
 *      * Consumed by: tests/specs/<path>.spec.ts
 *      * Office: 1604 (Parker Palm Springs)
 *      * Last verified: YYYY-MM-DD
 *      * @office-dependent — (if values are tied to a specific office)
 *      *\/
 * - Shared constants (dialog text, office number) → `tests/test-data/common.data.ts`
 * - Import pattern: `import { CONSTANT } from '../../../test-data/<path>.data';`
 */

import { test, expect } from '@client/fixtures/pages.fixture';
import { AdapterFactory } from '../../src/data/adapters/adapterFactory';
import { Log } from '../../src/utils/logger';

test.describe('Example: Data-Driven Tests @example', () => {
  test('TC-EX-DD-001: Login scenarios from Excel/CSV', async ({ loginPage, config }) => {
    Log.info('TEST: TC-EX-DD-001 - Data-driven login from Excel');

    const adapter = AdapterFactory.getAdapter('excel');
    const testData = await adapter.load({ file: 'tests/test-data/users.csv', sheet: 'Sheet1' });
    Log.info(`Loaded ${testData.records.length} scenarios`);

    // Skip if no test data file (adapter returns empty, never throws)
    if (testData.records.length === 0) {
      Log.warn('No test data found -- skipping');
      test.skip();
      return;
    }

    for (const user of testData.records) {
      Log.info(`Testing: ${user.username} (expected: ${user.expected_result})`);
      await loginPage.goto();

      // Use page object -- never direct page.fill()
      const success = await loginPage.loginWithMicrosoft(user.username, user.password);
      expect(success, `Login for ${user.username}`).toBe(user.expected_result === 'success');
    }
  });

  test('TC-EX-DD-002: Load data from JSON', async ({}) => {
    Log.info('TEST: TC-EX-DD-002 - JSON adapter');

    const adapter = AdapterFactory.getAdapter('json');
    const testData = await adapter.load({ file: 'tests/test-data/test-users.json' });

    Log.info(`Loaded ${testData.records.length} records from JSON`);
    if (testData.records.length > 0) {
      expect(testData.records[0]).toHaveProperty('username');
    }
  });
});
