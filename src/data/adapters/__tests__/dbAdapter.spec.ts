/**
 * FILE: src/data/adapters/__tests__/dbAdapter.spec.ts
 * PURPOSE: Unit tests for DbAdapter focusing on stub mode behavior
 * CONTENTS: Test cases for stub mode, credential validation, and basic functionality
 * - @playwright/test: Test framework and assertions
 * - DbAdapter: System under test
 * USED BY: npm run test:adapters
 * NOTE: These tests focus on stub mode behavior since full DB integration tests
 * would require running database infrastructure. Integration tests with
 * real DB should be in separate test suite.
 */

import { test, expect } from '@playwright/test';
import { DbAdapter } from '../dbAdapter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TEST SUITE: DbAdapter
 * PURPOSE: Validates database adapter with focus on stub mode
 * TEST STRATEGY:
 * 1. Test stub mode when credentials missing
 * 2. Test credential validation logic
 * 3. Test warning messages are actionable
 * 4. Integration tests with real DB in separate suite (not here)
 */
test.describe('DbAdapter', () => {
  let adapter: DbAdapter;
  let originalEnv: NodeJS.ProcessEnv;

 /**
 * SETUP: Before all tests
 * Saves original environment variables
 */
  test.beforeAll(() => {
    originalEnv = { ...process.env };
  });

 /**
 * SETUP: Before each test
 * Clears DB env vars to ensure clean state
 */
  test.beforeEach(() => {
 // Clear DB environment variables
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    delete process.env.DB_PORT;
    delete process.env.DB_TYPE;

    adapter = new DbAdapter();
  });

 /**
 * TEARDOWN: After all tests
 * Restores original environment
 */
  test.afterAll(() => {
    process.env = originalEnv;
  });

 /**
 * TEST: Stub mode - all credentials missing
 * VALIDATES: Returns empty records with warning when no DB credentials
 */
  test('should enter stub mode when all credentials missing', async () => {
    const result = await adapter.load({ query: 'SELECT * FROM users' });

 // Should return empty records
    expect(result.records.length).toBe(0);

 // Should have warning
    expect(result.metadata.source).toBe('db-stub');
    expect(result.metadata.warning).toContain('DB credentials missing');
    expect(result.metadata.warning).toContain('DB_HOST');
    expect(result.metadata.warning).toContain('DB_USER');
    expect(result.metadata.warning).toContain('DB_PASSWORD');
    expect(result.metadata.warning).toContain('DB_NAME');
    expect(result.metadata.rowCount).toBe(0);
  });

 /**
 * TEST: Stub mode - partial credentials
 * VALIDATES: Enters stub mode even when some credentials present
 */
  test('should enter stub mode when only some credentials present', async () => {
 // Set only some credentials
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'testuser';
 // Missing DB_PASSWORD and DB_NAME

 // Need fresh adapter to pick up env changes
    const partialAdapter = new DbAdapter();
    const result = await partialAdapter.load({ query: 'SELECT 1' });

    expect(result.records.length).toBe(0);
    expect(result.metadata.source).toBe('db-stub');
    expect(result.metadata.warning).toContain('DB credentials missing');
  });

 /**
 * TEST: Warning logging
 * VALIDATES: Stub mode warnings are logged to file
 */
  test('should log stub mode warning to file', async () => {
    const logPath = path.join(process.cwd(), 'artifacts', 'adapter-warnings.log');
    
 // Clear log if exists
    if (fs.existsSync(logPath)) {
      fs.unlinkSync(logPath);
    }

    await adapter.load({ query: 'SELECT 1' });

 // Check log created
    expect(fs.existsSync(logPath)).toBe(true);
    const logContent = fs.readFileSync(logPath, 'utf-8');
    expect(logContent).toContain('[DbAdapter]');
    expect(logContent).toContain('DB credentials missing');
    expect(logContent).toContain('Required environment variables');
  });

 /**
 * TEST: Warning message is actionable
 * VALIDATES: Warning includes exact env vars needed
 */
  test('should provide actionable warning message', async () => {
    const result = await adapter.load({ query: 'SELECT 1' });

 // Warning should list exact variables needed
    const warning = result.metadata.warning!;
    expect(warning).toContain('DB_HOST');
    expect(warning).toContain('DB_USER');
    expect(warning).toContain('DB_PASSWORD');
    expect(warning).toContain('DB_NAME');
  });

 /**
 * TEST: Metadata structure
 * VALIDATES: Stub mode returns proper AdapterResult structure
 */
  test('should return proper AdapterResult structure in stub mode', async () => {
    const result = await adapter.load({ query: 'SELECT 1' });

 // Validate structure
    expect(result).toHaveProperty('records');
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('source');
    expect(result.metadata).toHaveProperty('loadedAt');
    expect(result.metadata).toHaveProperty('warning');
    expect(result.metadata).toHaveProperty('rowCount');

 // Validate types
    expect(Array.isArray(result.records)).toBe(true);
    expect(typeof result.metadata.source).toBe('string');
    expect(typeof result.metadata.loadedAt).toBe('string');
    expect(typeof result.metadata.rowCount).toBe('number');
  });

 /**
 * TEST: Query parameter acceptance
 * VALIDATES: Adapter accepts query parameters in stub mode
 */
  test('should accept query with parameters in stub mode', async () => {
    const result = await adapter.load({ 
      query: 'SELECT * FROM users WHERE active = ?',
      params: [true]
    });

 // Should still return empty in stub mode
    expect(result.records.length).toBe(0);
    expect(result.metadata.source).toBe('db-stub');
  });

 /**
 * TEST: Database override parameter
 * VALIDATES: Accepts database parameter even in stub mode
 */
  test('should accept database parameter in stub mode', async () => {
    const result = await adapter.load({ 
      query: 'SELECT 1',
      database: 'custom_db'
    });

    expect(result.records.length).toBe(0);
    expect(result.metadata.source).toBe('db-stub');
  });

 /**
 * INTEGRATION TEST (Skipped): Real database connection
 * PURPOSE: Validates real DB operations when credentials available
 * NOTE: Requires actual database running - skip in CI without DB
 */
  test.skip('should connect to real database when credentials present', async () => {
 // This test would run only in environments with actual DB
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_pass';
    process.env.DB_NAME = 'test_db';
    process.env.DB_PORT = '5432';

    const connectedAdapter = new DbAdapter();
    const result = await connectedAdapter.load({ query: 'SELECT 1 as test' });

 // With real DB, should get results
    expect(result.metadata.source).not.toBe('db-stub');
 // Actual assertions would depend on DB state
  });
});
