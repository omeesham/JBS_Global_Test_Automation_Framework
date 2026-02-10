/**
 * FILE: src/data/adapters/adapterFactory.ts
 * PURPOSE: Central registry for creating data adapter instances at runtime
 * CONTENTS: AdapterFactory class with adapter registration and retrieval
 * DEPENDENCIES:
 *   - All adapter implementations (ExcelAdapter, JsonAdapter, DbAdapter, S3Adapter)
 *   - IAdapter: Interface all adapters implement
 * USED BY:
 *   - src/tests/[any]/[file].spec.ts (tests requesting adapters by type)
 *   - src/utils/testDataLoader.ts (centralized data loading utility)
 */

import { IAdapter } from './IAdapter';
import { ExcelAdapter } from './excelAdapter';
import { JsonAdapter } from './jsonAdapter';
import { DbAdapter } from './dbAdapter';
import { S3Adapter } from './s3Adapter';

/**
 * TYPE: AdapterType
 * PURPOSE: Defines valid adapter type identifiers
 * WHY NECESSARY: Type safety for adapter selection, prevents runtime errors from invalid types
 */
export type AdapterType = 'excel' | 'json' | 'db' | 's3';

/**
 * TYPE: AdapterConstructor
 * PURPOSE: Defines the shape of adapter class constructors
 * WHY NECESSARY: Allows factory to instantiate adapters dynamically without knowing concrete types
 */
type AdapterConstructor = new () => IAdapter;

/**
 * CLASS: AdapterFactory
 * RESPONSIBILITY: Manages registration and creation of data adapter instances
 * 
 * PROPERTIES:
 *   - adapters: Map<AdapterType, AdapterConstructor> - Registry of adapter types to constructors
 * 
 * METHODS OVERVIEW:
 *   - getAdapter(type): Creates and returns adapter instance by type
 *   - registerAdapter(type, constructor): Adds custom adapter to registry
 *   - getSupportedTypes(): Lists all available adapter types
 * 
 * USAGE EXAMPLE:
 *   // Basic adapter retrieval
 *   const adapter = AdapterFactory.getAdapter('excel');
 *   const data = await adapter.load({ file: 'users.xlsx' });
 *   
 *   // Custom adapter registration
 *   AdapterFactory.registerAdapter('custom', MyCustomAdapter);
 *   const customAdapter = AdapterFactory.getAdapter('custom');
 * 
 * INHERITANCE: None (static class pattern)
 * 
 * WHY NECESSARY:
 * Decouples test code from adapter implementation details.
 * Centralizes adapter creation logic for consistency.
 * Enables runtime selection of data sources based on configuration.
 * Makes it easy to add new adapter types without modifying test code.
 * Supports dynamic adapter registration and runtime selection.
 */
export class AdapterFactory {
  /**
   * PROPERTY: adapters
   * PURPOSE: Static registry mapping adapter types to their constructors
   * 
   * HOW IT WORKS:
   * 1. Pre-populated with built-in adapters ('excel', 'json', 'db', 's3')
   * 2. Can be extended via registerAdapter() method
   * 3. Used by getAdapter() to instantiate adapters
   * 
   * WHY NECESSARY:
   * Provides single source of truth for available adapters.
   * Supports dynamic adapter creation without switch/if statements.
   */
  private static adapters: Map<AdapterType, AdapterConstructor> = new Map([
    ['excel', ExcelAdapter],
    ['json', JsonAdapter],
    ['db', DbAdapter],
    ['s3', S3Adapter]
  ] as Array<[AdapterType, AdapterConstructor]>);

  /**
   * METHOD: getAdapter (static)
   * PURPOSE: Creates new instance of requested adapter type
   * 
   * HOW IT WORKS:
   * 1. Validate that requested type exists in registry
   * 2. If not found: Throw error with helpful message listing supported types
   * 3. If found: Retrieve constructor from Map
   * 4. Instantiate new adapter using constructor
   * 5. Return adapter instance
   * 
   * WHY NECESSARY:
   * Single entry point for all adapter creation.
   * Ensures consistent adapter lifecycle (each test gets fresh instance).
   * Provides clear error messages when invalid types requested.
   * 
   * USED BY:
   *   - src/tests/login.spec.ts (loads user credentials from Excel)
   *   - src/tests/api.spec.ts (loads API endpoints from JSON)
   *   - src/utils/testDataLoader.ts (centralized data loading)
   * 
   * @param type - Adapter type identifier ('excel', 'json', 'db', 's3')
   *               Example: 'excel' returns new ExcelAdapter instance
   * 
   * @returns IAdapter - Fresh adapter instance implementing IAdapter interface
   * 
   * @throws Error if type not found in registry
   * 
   * EXAMPLE:
   *   // Load Excel data
   *   const excelAdapter = AdapterFactory.getAdapter('excel');
   *   const users = await excelAdapter.load({ file: 'users.xlsx' });
   *   
   *   // Load S3 data
   *   const s3Adapter = AdapterFactory.getAdapter('s3');
   *   const config = await s3Adapter.load({ 
   *     bucket: 'test-data', 
   *     key: 'config.json'
   *   });
   *   
   *   // Load DB data
   *   const dbAdapter = AdapterFactory.getAdapter('db');
   *   const products = await dbAdapter.load({ 
   *     query: 'SELECT * FROM products WHERE active = ?',
   *     params: [true]
   *   });
   * 
   * EDGE CASES:
   * - Invalid type: Throws descriptive error listing valid types
   * - Type is valid but adapter constructor fails: Error propagates to caller
   * - Multiple calls with same type: Returns NEW instance each time (not singleton)
   */
  static getAdapter(type: AdapterType): IAdapter {
    // Step 1 & 2: Validate type
    if (!this.adapters.has(type)) {
      const supportedTypes = Array.from(this.adapters.keys()).join(', ');
      throw new Error(
        `Unknown adapter type: "${type}". Supported types: ${supportedTypes}\n` +
        `To add custom adapter: AdapterFactory.registerAdapter('${type}', YourAdapterClass)`
      );
    }

    // Step 3: Retrieve constructor
    const AdapterConstructor = this.adapters.get(type)!;

    // Step 4 & 5: Instantiate and return
    return new AdapterConstructor();
  }

  /**
   * METHOD: registerAdapter (static)
   * PURPOSE: Adds custom adapter type to registry
   * 
   * HOW IT WORKS:
   * 1. Accept adapter type identifier and constructor
   * 2. Add entry to adapters Map
   * 3. Log registration for debugging
   * 4. Future getAdapter() calls can use this type
   * 
   * WHY NECESSARY:
   * Enables extensibility - users can add adapters without modifying framework code.
   * Supports specialized data sources (GraphQL, gRPC, custom APIs).
   * Allows dynamic adapter registration discovered at runtime.
   * 
   * USED BY:
   *   - src/setup/customAdapters.ts (registers organization-specific adapters)
   * 
   * @param type - Unique identifier for the adapter
   *               Example: 'graphql', 'redis', 'kafka'
   * @param constructor - Class constructor implementing IAdapter
   *                      Example: class GraphQLAdapter implements IAdapter { ... }
   * 
   * @returns void
   * 
   * EXAMPLE:
   *   // Create custom Redis adapter
   *   class RedisAdapter implements IAdapter {
   *     async load(params: { key: string }): Promise<AdapterResult> {
   *       // Redis implementation
   *     }
   *   }
   *   
   *   // Register it
   *   AdapterFactory.registerAdapter('redis', RedisAdapter);
   *   
   *   // Now can use like built-in adapters
   *   const adapter = AdapterFactory.getAdapter('redis');
   *   const cache = await adapter.load({ key: 'user:123' });
   * 
   * EDGE CASES:
   * - Overwriting existing type: Replaces previous adapter (logs warning)
   * - Invalid constructor: Error occurs when getAdapter() attempts instantiation
   */
  static registerAdapter(type: AdapterType, constructor: AdapterConstructor): void {
    // Check if overwriting
    if (this.adapters.has(type)) {
      console.warn(`⚠️  AdapterFactory: Overwriting existing adapter type "${type}"`);
    }

    // Step 2: Add to registry
    this.adapters.set(type, constructor);

    // Step 3: Log registration
    console.log(`✅ AdapterFactory: Registered custom adapter type "${type}"`);
  }

  /**
   * METHOD: getSupportedTypes (static)
   * PURPOSE: Returns list of all available adapter types
   * 
   * HOW IT WORKS:
   * 1. Extract keys from adapters Map
   * 2. Convert to array
   * 3. Return array of type identifiers
   * 
   * WHY NECESSARY:
   * Supports dynamic UI generation (dropdown menus, config validators).
   * Useful for documentation generation and error messages.
   * 
   * USED BY:
   *   - src/utils/configValidator.ts (validates test config files)
   * 
   * @returns AdapterType[] - Array of available adapter type identifiers
   *                          Example: ['excel', 'json', 'db', 's3']
   * 
   * EXAMPLE:
   *   // In agent code
   *   const types = AdapterFactory.getSupportedTypes();
   *   console.log('Available data sources:', types.join(', '));
   *   // Output: "Available data sources: excel, json, db, s3"
   *   
   *   // In config validator
   *   const userConfig = { adapter: 'xml' };
   *   const validTypes = AdapterFactory.getSupportedTypes();
   *   if (!validTypes.includes(userConfig.adapter)) {
   *     throw new Error(`Invalid adapter: ${userConfig.adapter}`);
   *   }
   * 
   * EDGE CASES:
   * - No adapters registered: Returns empty array (shouldn't happen with defaults)
   * - Custom adapters added: Includes them in returned array
   */
  static getSupportedTypes(): AdapterType[] {
    return Array.from(this.adapters.keys());
  }
}
