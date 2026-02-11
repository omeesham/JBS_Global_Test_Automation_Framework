/**
 * FILE: src/data/adapters/__tests__/jsonAdapter.spec.ts
 * PURPOSE: Unit tests for JsonAdapter to ensure reliable JSON data loading from files and URLs
 * CONTENTS: Test cases for file mode, URL mode, stub mode, and error scenarios
 * DEPENDENCIES:
 *   - @playwright/test: Test framework and assertions
 *   - JsonAdapter: System under test
 * USED BY: npm run test:adapters
 */

import { test, expect } from '@playwright/test';
import { JsonAdapter } from '../jsonAdapter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TEST SUITE: JsonAdapter
 * PURPOSE: Validates JSON loading from files and URLs with graceful error handling
 * 
 * TEST STRATEGY:
 * 1. Test file mode with valid JSON
 * 2. Test URL mode (requires network - may skip in offline environments)
 * 3. Test nested key extraction (rootKey parameter)
 * 4. Test stub mode when resources unavailable
 * 5. Test normalization of different JSON structures
 */
test.describe('JsonAdapter', () => {
  let adapter: JsonAdapter;
  let testDataDir: string;
  let testJsonFile: string;
  let testNestedJsonFile: string;

  /**
   * SETUP: Before all tests
   * Creates test fixtures directory and sample JSON files
   */
  test.beforeAll(() => {
    // Create test data directory
    testDataDir = path.join(process.cwd(), 'artifacts', 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Create simple JSON file
    testJsonFile = path.join(testDataDir, 'users.json');
    const jsonContent = JSON.stringify([
      { id: 1, name: 'Alice', role: 'admin' },
      { id: 2, name: 'Bob', role: 'user' },
      { id: 3, name: 'Charlie', role: 'user' }
    ], null, 2);
    fs.writeFileSync(testJsonFile, jsonContent, 'utf-8');

    // Create nested JSON file
    testNestedJsonFile = path.join(testDataDir, 'nested.json');
    const nestedContent = JSON.stringify({
      status: 'success',
      data: {
        users: [
          { username: 'admin', password: 'secret' },
          { username: 'guest', password: 'guest123' }
        ]
      }
    }, null, 2);
    fs.writeFileSync(testNestedJsonFile, nestedContent, 'utf-8');
  });

  /**
   * SETUP: Before each test
   */
  test.beforeEach(() => {
    adapter = new JsonAdapter();
  });

  /**
   * TEARDOWN: After all tests
   */
  test.afterAll(() => {
    if (fs.existsSync(testJsonFile)) {
      fs.unlinkSync(testJsonFile);
    }
    if (fs.existsSync(testNestedJsonFile)) {
      fs.unlinkSync(testNestedJsonFile);
    }
  });

  /**
   * TEST: Load from local file
   * VALIDATES: Adapter loads JSON arrays correctly
   */
  test('should load JSON file and return records', async () => {
    const result = await adapter.load({ file: testJsonFile });

    expect(result.records.length).toBe(3);
    expect(result.records.length).toBeGreaterThan(0);
    
    const firstRecord = result.records[0]!;
    expect(firstRecord.id).toBe(1);
    expect(firstRecord.name).toBe('Alice');
    expect(firstRecord.role).toBe('admin');

    expect(result.metadata.source).toContain('users.json');
    expect(result.metadata.loadedAt).toBeTruthy();
    expect(result.metadata.rowCount).toBe(3);
    expect(result.metadata.warning).toBeUndefined();
  });

  /**
   * TEST: Stub mode - missing file
   * VALIDATES: Returns empty records when file doesn't exist
   */
  test('should return empty records when file not found', async () => {
    const result = await adapter.load({ file: 'non-existent.json' });

    expect(result.records.length).toBe(0);
    expect(result.metadata.warning).toContain('Failed to load JSON: File not found');
    expect(result.metadata.rowCount).toBe(0);
  });

  /**
   * TEST: Nested key extraction
   * VALIDATES: rootKey parameter extracts nested data
   */
  test('should extract nested data using rootKey', async () => {
    const result = await adapter.load({ 
      file: testNestedJsonFile,
      rootKey: 'data.users'
    });

    expect(result.records.length).toBe(2);
    expect(result.records.length).toBeGreaterThan(0);
    
    const firstRecord = result.records[0]!;
    const secondRecord = result.records[1]!;
    expect(firstRecord.username).toBe('admin');
    expect(secondRecord.username).toBe('guest');
    expect(result.metadata.warning).toBeUndefined();
  });

  /**
   * TEST: Invalid rootKey
   * VALIDATES: Returns empty when rootKey doesn't exist
   */
  test('should return empty records when rootKey not found', async () => {
    const result = await adapter.load({ 
      file: testNestedJsonFile,
      rootKey: 'data.nonexistent'
    });

    expect(result.records.length).toBe(0);
    expect(result.metadata.rowCount).toBe(0);
  });

  /**
   * TEST: Normalize object to array
   * VALIDATES: Single objects are converted to arrays
   */
  test('should normalize single object to array', async () => {
    const singleObjectFile = path.join(testDataDir, 'single.json');
    const content = JSON.stringify({ id: 1, name: 'Test' });
    fs.writeFileSync(singleObjectFile, content, 'utf-8');

    const result = await adapter.load({ file: singleObjectFile });

    expect(result.records.length).toBe(1);
    expect(result.records.length).toBeGreaterThan(0);
    
    const firstRecord = result.records[0]!;
    expect(firstRecord.id).toBe(1);
    expect(firstRecord.name).toBe('Test');

    fs.unlinkSync(singleObjectFile);
  });

  /**
   * TEST: Invalid JSON
   * VALIDATES: Returns empty records with warning for malformed JSON
   */
  test('should handle invalid JSON gracefully', async () => {
    const invalidFile = path.join(testDataDir, 'invalid.json');
    fs.writeFileSync(invalidFile, '{ invalid json }', 'utf-8');

    const result = await adapter.load({ file: invalidFile });

    expect(result.records.length).toBe(0);
    expect(result.metadata.warning).toBeTruthy();

    fs.unlinkSync(invalidFile);
  });

  /**
   * TEST: Empty JSON array
   * VALIDATES: Handles empty arrays without errors
   */
  test('should handle empty JSON array', async () => {
    const emptyFile = path.join(testDataDir, 'empty.json');
    fs.writeFileSync(emptyFile, '[]', 'utf-8');

    const result = await adapter.load({ file: emptyFile });

    expect(result.records.length).toBe(0);
    expect(result.metadata.rowCount).toBe(0);
    expect(result.metadata.warning).toBeUndefined();

    fs.unlinkSync(emptyFile);
  });

  /**
   * TEST: URL loading (requires network)
   * VALIDATES: Adapter can fetch JSON from remote URLs
   * NOTE: Skipped by default to avoid network dependencies
   */
  test.skip('should load JSON from URL', async () => {
    // This test requires network access
    const result = await adapter.load({ 
      url: 'https://jsonplaceholder.typicode.com/users' 
    });

    expect(result.records.length).toBeGreaterThan(0);
    
    if (result.records.length > 0) {
      const firstRecord = result.records[0]!;
      expect(firstRecord.id).toBeTruthy();
    }
    
    expect(result.metadata.source).toContain('jsonplaceholder.typicode.com');
  });

  /**
   * TEST: Invalid URL
   * VALIDATES: Returns empty records when URL unreachable
   */
  test('should handle unreachable URL gracefully', async () => {
    const result = await adapter.load({
      url: 'https://invalid-domain-that-does-not-exist-12345.com/data.json'
    });

    expect(result.records.length).toBe(0);
    expect(result.metadata.warning).toContain('Failed to load JSON');
  });

  /**
   * TEST: No file or URL parameter
   * VALIDATES: Returns empty when neither file nor url provided
   */
  test('should require either file or url parameter', async () => {
    const result = await adapter.load({} as any);

    expect(result.records.length).toBe(0);
    expect(result.metadata.warning).toContain('JsonAdapter requires either "file" or "url" parameter');
  });

  /**
   * TEST: Warning logging
   * VALIDATES: Warnings are logged to artifacts/adapter-warnings.log
   */
  test('should log warnings to file', async () => {
    const logPath = path.join(process.cwd(), 'artifacts', 'adapter-warnings.log');
    
    // Clear log if exists
    if (fs.existsSync(logPath)) {
      fs.unlinkSync(logPath);
    }

    await adapter.load({ file: 'missing.json' });

    expect(fs.existsSync(logPath)).toBe(true);
    const logContent = fs.readFileSync(logPath, 'utf-8');
    expect(logContent).toContain('[JsonAdapter]');
  });
});
