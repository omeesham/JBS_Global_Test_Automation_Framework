/**
 * FILE: src/data/adapters/__tests__/s3Adapter.spec.ts
 * PURPOSE: Unit tests for S3Adapter focusing on stub mode behavior
 * CONTENTS: Test cases for stub mode, credential validation, and structure validation
 * - @playwright/test: Test framework
 * - S3Adapter: System under test
 * USED BY: npm run test:adapters
 * NOTE: Tests focus on stub mode since S3 integration tests would require
 * AWS infrastructure. Real S3 tests should be in integration test suite.
 */

import { test, expect } from '@playwright/test';
import { S3Adapter } from '../s3Adapter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TEST SUITE: S3Adapter
 * PURPOSE: Validates S3 adapter with focus on stub mode behavior
 * TEST STRATEGY:
 * 1. Test stub mode when AWS credentials missing
 * 2. Test credential validation logic
 * 3. Test warning messages are actionable
 * 4. Test AdapterResult structure compliance
 */
test.describe('S3Adapter', () => {
  let adapter: S3Adapter;
  let originalEnv: NodeJS.ProcessEnv;

 /**
 * SETUP: Before all tests
 */
  test.beforeAll(() => {
    originalEnv = { ...process.env };
  });

 /**
 * SETUP: Before each test
 * Clears AWS env vars to ensure clean state
 */
  test.beforeEach(() => {
 // Clear AWS environment variables
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_SESSION_TOKEN;

    adapter = new S3Adapter();
  });

 /**
 * TEARDOWN: After all tests
 */
  test.afterAll(() => {
    process.env = originalEnv;
  });

 /**
 * TEST: Stub mode - all credentials missing
 * VALIDATES: Returns empty records with warning when no AWS credentials
 */
  test('should enter stub mode when AWS credentials missing', async () => {
    const result = await adapter.load({ 
      bucket: 'test-bucket',
      key: 'data/users.json'
    });

 // Should return empty records
    expect(result.records.length).toBe(0);

 // Should have warning
    expect(result.metadata.source).toBe('s3-stub');
    expect(result.metadata.warning).toContain('S3 credentials missing');
    expect(result.metadata.warning).toContain('AWS_REGION');
    expect(result.metadata.warning).toContain('AWS_ACCESS_KEY_ID');
    expect(result.metadata.warning).toContain('AWS_SECRET_ACCESS_KEY');
    expect(result.metadata.rowCount).toBe(0);
  });

 /**
 * TEST: Stub mode - partial credentials
 * VALIDATES: Enters stub mode when some credentials missing
 */
  test('should enter stub mode with partial credentials', async () => {
 // Only set region, missing keys
    process.env.AWS_REGION = 'us-east-1';

    const partialAdapter = new S3Adapter();
    const result = await partialAdapter.load({ 
      bucket: 'test-bucket',
      key: 'data.json'
    });

    expect(result.records.length).toBe(0);
    expect(result.metadata.source).toBe('s3-stub');
    expect(result.metadata.warning).toContain('S3 credentials missing');
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

    await adapter.load({ bucket: 'test', key: 'data.json' });

 // Check log created
    expect(fs.existsSync(logPath)).toBe(true);
    const logContent = fs.readFileSync(logPath, 'utf-8');
    expect(logContent).toContain('[S3Adapter]');
    expect(logContent).toContain('S3 credentials missing');
  });

 /**
 * TEST: Warning message actionability
 * VALIDATES: Warning includes exact env vars needed
 */
  test('should provide actionable warning message', async () => {
    const result = await adapter.load({ 
      bucket: 'my-bucket',
      key: 'path/to/data.json'
    });

    const warning = result.metadata.warning!;
    expect(warning).toContain('AWS_REGION');
    expect(warning).toContain('AWS_ACCESS_KEY_ID');
    expect(warning).toContain('AWS_SECRET_ACCESS_KEY');
  });

 /**
 * TEST: AdapterResult structure
 * VALIDATES: Returns proper structure in stub mode
 */
  test('should return proper AdapterResult structure', async () => {
    const result = await adapter.load({ 
      bucket: 'test-bucket',
      key: 'data.json'
    });

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
 * TEST: Accepts bucket and key parameters
 * VALIDATES: Adapter accepts required parameters in stub mode
 */
  test('should accept bucket and key parameters', async () => {
    const result = await adapter.load({ 
      bucket: 'my-test-bucket',
      key: 'fixtures/users.json'
    });

    expect(result.records.length).toBe(0);
    expect(result.metadata.source).toBe('s3-stub');
  });

 /**
 * TEST: Accepts optional region override
 * VALIDATES: Region parameter is accepted
 */
  test('should accept optional region parameter', async () => {
    const result = await adapter.load({ 
      bucket: 'my-bucket',
      key: 'data.json',
      region: 'eu-west-1'
    });

    expect(result.metadata.source).toBe('s3-stub');
  });

 /**
 * TEST: Timestamp generation
 * VALIDATES: loadedAt timestamp is valid ISO format
 */
  test('should generate valid ISO timestamp', async () => {
    const result = await adapter.load({ 
      bucket: 'test',
      key: 'data.json'
    });

    expect(result.metadata.loadedAt).toBeTruthy();
    
 // Should be valid ISO 8601 format
    const timestamp = new Date(result.metadata.loadedAt);
    expect(timestamp.toISOString()).toBe(result.metadata.loadedAt);
  });

 /**
 * INTEGRATION TEST (Skipped): Real S3 connection
 * PURPOSE: Validates real S3 operations when credentials available
 * NOTE: Requires AWS credentials and S3 bucket - skip in CI
 */
  test.skip('should fetch from real S3 when credentials present', async () => {
 // This would run only in environments with AWS credentials
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'your-key-id';
    process.env.AWS_SECRET_ACCESS_KEY = 'your-secret';

    const connectedAdapter = new S3Adapter();
    const result = await connectedAdapter.load({ 
      bucket: 'test-data-bucket',
      key: 'test-data.json'
    });

 // With real S3, should get results
    expect(result.metadata.source).not.toBe('s3-stub');
    expect(result.metadata.source).toContain('s3:');
  });
});
