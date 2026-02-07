/**
 * FILE: src/data/adapters/__tests__/excelAdapter.spec.ts
 * PURPOSE: Unit tests for ExcelAdapter to ensure reliable Excel/CSV data loading
 * CONTENTS: Test cases covering success, stub mode, and error scenarios
 * DEPENDENCIES:
 *   - @playwright/test: Test framework and assertions
 *   - ExcelAdapter: System under test
 * USED BY: npm run test:adapters (dedicated adapter test suite)
 */

import { test, expect } from '@playwright/test';
import { ExcelAdapter } from '../excelAdapter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TEST SUITE: ExcelAdapter
 * PURPOSE: Validates Excel/CSV loading with stub mode and error handling
 * 
 * TEST STRATEGY:
 * 1. Create temporary test fixtures (Excel/CSV files)
 * 2. Test successful loading with valid files
 * 3. Test stub mode when files missing
 * 4. Test error handling for invalid formats
 * 5. Clean up test fixtures after suite
 */
test.describe('ExcelAdapter', () => {
  let adapter: ExcelAdapter;
  let testDataDir: string;
  let testCsvFile: string;

  /**
   * SETUP: Before all tests
   * Creates test fixtures directory and sample CSV file
   */
  test.beforeAll(() => {
    // Create test data directory
    testDataDir = path.join(process.cwd(), 'artifacts', 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Create sample CSV file
    testCsvFile = path.join(testDataDir, 'users.csv');
    const csvContent = `username,password,email
user1,pass123,user1@test.com
user2,pass456,user2@test.com
user3,pass789,user3@test.com`;
    fs.writeFileSync(testCsvFile, csvContent, 'utf-8');
  });

  /**
   * SETUP: Before each test
   * Creates fresh adapter instance to avoid state pollution
   */
  test.beforeEach(() => {
    adapter = new ExcelAdapter();
  });

  /**
   * TEARDOWN: After all tests
   * Cleans up test fixtures
   */
  test.afterAll(() => {
    // Remove test CSV file
    if (fs.existsSync(testCsvFile)) {
      fs.unlinkSync(testCsvFile);
    }
  });

  /**
   * TEST: Successful CSV loading
   * VALIDATES: Adapter loads CSV file and normalizes data correctly
   */
  test('should load CSV file and return records', async () => {
    const result = await adapter.load({ file: testCsvFile });

    // Should have records
    expect(result.records.length).toBe(3);
    expect(result.records.length).toBeGreaterThan(0);
    
    // First record should have correct data
    const firstRecord = result.records[0]!;
    expect(firstRecord.username).toBe('user1');
    expect(firstRecord.password).toBe('pass123');
    expect(firstRecord.email).toBe('user1@test.com');

    // Metadata should be present
    expect(result.metadata.source).toContain('users.csv');
    expect(result.metadata.loadedAt).toBeTruthy();
    expect(result.metadata.rowCount).toBe(3);
    expect(result.metadata.warning).toBeUndefined();
  });

  /**
   * TEST: Stub mode - missing file
   * VALIDATES: Returns empty records with warning when file doesn't exist
   */
  test('should return empty records when file not found (stub mode)', async () => {
    const result = await adapter.load({ file: 'non-existent-file.xlsx' });

    // Should return empty records
    expect(result.records.length).toBe(0);

    // Should have warning in metadata
    expect(result.metadata.warning).toContain('File not found');
    expect(result.metadata.rowCount).toBe(0);
    expect(result.metadata.loadedAt).toBeTruthy();
  });

  /**
   * TEST: Relative path resolution
   * VALIDATES: Adapter resolves paths relative to project root
   */
  test('should resolve relative paths correctly', async () => {
    // Create file with relative path
    const relativePath = 'artifacts/test-data/users.csv';
    const result = await adapter.load({ file: relativePath });

    // Should load successfully
    expect(result.records.length).toBe(3);
    expect(result.metadata.warning).toBeUndefined();
  });

  /**
   * TEST: Absolute path support
   * VALIDATES: Adapter handles absolute paths
   */
  test('should handle absolute paths', async () => {
    const result = await adapter.load({ file: testCsvFile });

    expect(result.records.length).toBe(3);
    expect(result.metadata.warning).toBeUndefined();
  });

  /**
   * TEST: Empty file handling
   * VALIDATES: Returns empty records for files with only headers
   */
  test('should handle empty CSV (headers only)', async () => {
    const emptyFile = path.join(testDataDir, 'empty.csv');
    fs.writeFileSync(emptyFile, 'header1,header2,header3\n', 'utf-8');

    const result = await adapter.load({ file: emptyFile });

    expect(result.records.length).toBe(0);
    expect(result.metadata.rowCount).toBe(0);

    // Cleanup
    fs.unlinkSync(emptyFile);
  });

  /**
   * TEST: Warning logging
   * VALIDATES: Warnings are logged to artifacts/adapter-warnings.log
   */
  test('should log warnings to file when file not found', async () => {
    const logPath = path.join(process.cwd(), 'artifacts', 'adapter-warnings.log');
    
    // Clear log if exists
    if (fs.existsSync(logPath)) {
      fs.unlinkSync(logPath);
    }

    await adapter.load({ file: 'missing.xlsx' });

    // Check log was created and contains warning
    expect(fs.existsSync(logPath)).toBe(true);
    const logContent = fs.readFileSync(logPath, 'utf-8');
    expect(logContent).toContain('[ExcelAdapter]');
    expect(logContent).toContain('File not found');
  });
});
