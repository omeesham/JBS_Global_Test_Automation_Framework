/**
 * FILE: src/data/adapters/__tests__/adapterFactory.spec.ts
 * PURPOSE: Unit tests for AdapterFactory to ensure proper adapter registration and retrieval
 * CONTENTS: Test cases for factory methods, registration, and error handling
 * - @playwright/test: Test framework
 * - AdapterFactory: System under test
 * - All adapter implementations: To verify factory returns correct types
 * USED BY: npm run test:adapters
 */

import { test, expect } from '@playwright/test';
import { AdapterFactory, AdapterType } from '../adapterFactory';
import { ExcelAdapter } from '../excelAdapter';
import { JsonAdapter } from '../jsonAdapter';
import { DbAdapter } from '../dbAdapter';
import { S3Adapter } from '../s3Adapter';
import { IAdapter, AdapterResult } from '../IAdapter';

/**
 * TEST SUITE: AdapterFactory
 * PURPOSE: Validates factory pattern for adapter creation and registration
 * TEST STRATEGY:
 * 1. Test getAdapter returns correct adapter types
 * 2. Test error handling for unknown adapter types
 * 3. Test custom adapter registration
 * 4. Test getSupportedTypes returns all available types
 * 5. Test factory doesn't create singletons (each call = new instance)
 */
test.describe('AdapterFactory', () => {

 /**
 * TEST: Get Excel adapter
 * VALIDATES: Factory returns ExcelAdapter instance
 */
  test('should return ExcelAdapter for type "excel"', () => {
    const adapter = AdapterFactory.getAdapter('excel');
    
    expect(adapter).toBeInstanceOf(ExcelAdapter);
  });

 /**
 * TEST: Get JSON adapter
 * VALIDATES: Factory returns JsonAdapter instance
 */
  test('should return JsonAdapter for type "json"', () => {
    const adapter = AdapterFactory.getAdapter('json');
    
    expect(adapter).toBeInstanceOf(JsonAdapter);
  });

 /**
 * TEST: Get DB adapter
 * VALIDATES: Factory returns DbAdapter instance
 */
  test('should return DbAdapter for type "db"', () => {
    const adapter = AdapterFactory.getAdapter('db');
    
    expect(adapter).toBeInstanceOf(DbAdapter);
  });

 /**
 * TEST: Get S3 adapter
 * VALIDATES: Factory returns S3Adapter instance
 */
  test('should return S3Adapter for type "s3"', () => {
    const adapter = AdapterFactory.getAdapter('s3');
    
    expect(adapter).toBeInstanceOf(S3Adapter);
  });

 /**
 * TEST: All adapters implement IAdapter
 * VALIDATES: Every adapter has load method
 */
  test('should return adapters implementing IAdapter interface', () => {
    const types: AdapterType[] = ['excel', 'json', 'db', 's3'];
    
    for (const type of types) {
      const adapter = AdapterFactory.getAdapter(type);
      
 // Check interface compliance
      expect(adapter).toHaveProperty('load');
      expect(typeof adapter.load).toBe('function');
    }
  });

 /**
 * TEST: Unknown adapter type
 * VALIDATES: Throws error with helpful message for unknown types
 */
  test('should throw error for unknown adapter type', () => {
    expect(() => {
      AdapterFactory.getAdapter('unknown' as AdapterType);
    }).toThrow();
  });

 /**
 * TEST: Error message includes supported types
 * VALIDATES: Error message lists available adapters
 */
  test('should include supported types in error message', () => {
    try {
      AdapterFactory.getAdapter('invalid' as AdapterType);
 // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toContain('excel');
      expect(error.message).toContain('json');
      expect(error.message).toContain('db');
      expect(error.message).toContain('s3');
      expect(error.message).toContain('Supported types');
    }
  });

 /**
 * TEST: Get supported types
 * VALIDATES: getSupportedTypes returns all built-in adapters
 */
  test('should return all supported adapter types', () => {
    const types = AdapterFactory.getSupportedTypes();
    
    expect(types).toContain('excel');
    expect(types).toContain('json');
    expect(types).toContain('db');
    expect(types).toContain('s3');
    expect(types.length).toBe(4);
  });

 /**
 * TEST: Register custom adapter
 * VALIDATES: Custom adapters can be registered and retrieved
 */
  test('should register and retrieve custom adapter', () => {
 // Create custom adapter
    class CustomAdapter implements IAdapter {
      async load(params: any): Promise<AdapterResult> {
        return {
          records: [{ custom: true }],
          metadata: {
            source: 'custom-adapter',
            loadedAt: new Date().toISOString(),
            rowCount: 1
          }
        };
      }
    }

 // Register it
    AdapterFactory.registerAdapter('custom' as AdapterType, CustomAdapter);

 // Should be retrievable
    const adapter = AdapterFactory.getAdapter('custom' as AdapterType);
    expect(adapter).toBeInstanceOf(CustomAdapter);

 // Should appear in supported types
    const types = AdapterFactory.getSupportedTypes();
    expect(types).toContain('custom');
  });

 /**
 * TEST: Register adapter logs to console
 * VALIDATES: Registration confirmation is logged
 */
  test.skip('should log when custom adapter registered', () => {
 // Note: Playwright test doesn't have access to jest.spyOn for console mocking
 // This test would require integration with actual console output capture
    class AnotherAdapter implements IAdapter {
      async load(params: any): Promise<AdapterResult> {
        return { records: [], metadata: { source: 'another', loadedAt: new Date().toISOString() } };
      }
    }

    AdapterFactory.registerAdapter('another' as AdapterType, AnotherAdapter);
    
 // Manual verification: Check console output shows "Registered custom adapter"
  });

 /**
 * TEST: Factory doesn't create singletons
 * VALIDATES: Each getAdapter call returns new instance
 */
  test('should create new instance on each call', () => {
    const adapter1 = AdapterFactory.getAdapter('excel');
    const adapter2 = AdapterFactory.getAdapter('excel');
    
 // Should be different instances
    expect(adapter1).not.toBe(adapter2);
  });

 /**
 * TEST: Type safety
 * VALIDATES: TypeScript enforces valid adapter types (compile-time check)
 */
  test('should enforce type safety at compile time', () => {
 // This is more of a TypeScript compile check
 // Valid types should not cause errors
    const validTypes: AdapterType[] = ['excel', 'json', 'db', 's3'];
    
    for (const type of validTypes) {
      const adapter = AdapterFactory.getAdapter(type);
      expect(adapter).toBeTruthy();
    }
  });

 /**
 * TEST: Factory methods are static
 * VALIDATES: Can use factory without instantiation
 */
  test('should work without instantiation (static methods)', () => {
 // Should not need to create AdapterFactory instance
 // All methods are static
    
    const adapter = AdapterFactory.getAdapter('excel');
    const types = AdapterFactory.getSupportedTypes();
    
    expect(adapter).toBeTruthy();
    expect(types.length).toBeGreaterThan(0);
  });

 /**
 * FUNCTIONAL TEST: Complete workflow
 * VALIDATES: End-to-end factory usage pattern
 */
  test('should support complete adapter workflow', async () => {
 // 1. Get list of available adapters
    const availableTypes = AdapterFactory.getSupportedTypes();
    expect(availableTypes.length).toBeGreaterThan(0);

 // 2. Get adapter for specific type
    const adapter = AdapterFactory.getAdapter('json');
    expect(adapter).toBeTruthy();

 // 3. Use adapter to load data
    const result = await adapter.load({ 
      file: 'non-existent.json' 
    });

 // 4. Verify result structure (even in error case)
    expect(result).toHaveProperty('records');
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('source');
    expect(result.metadata).toHaveProperty('loadedAt');
  });
});
