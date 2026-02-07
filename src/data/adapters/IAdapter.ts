/**
 * FILE: src/data/adapters/IAdapter.ts
 * PURPOSE: Defines the standard contract that all data source adapters must implement
 * CONTENTS: IAdapter interface, AdapterMetadata type, AdapterRecord type
 * DEPENDENCIES: None (pure TypeScript interface)
 * USED BY: 
 *   - src/data/adapters/excelAdapter.ts
 *   - src/data/adapters/jsonAdapter.ts
 *   - src/data/adapters/dbAdapter.ts
 *   - src/data/adapters/s3Adapter.ts
 *   - src/data/adapters/adapterFactory.ts
 *   - All test files that load data from external sources
 */

/**
 * TYPE: AdapterRecord
 * PURPOSE: Represents a single row/record from any data source
 * USAGE: Normalized format ensuring all adapters return consistent data structure
 */
export type AdapterRecord = Record<string, any>;

/**
 * TYPE: AdapterMetadata
 * PURPOSE: Provides context about where data came from and when it was loaded
 * PROPERTIES:
 *   - source: Identifier of the data source (e.g., 'excel', 'db-postgres', 's3-bucket')
 *   - loadedAt: ISO 8601 timestamp of when data was fetched
 *   - warning?: Optional warning message (e.g., when using stub mode due to missing credentials)
 *   - rowCount?: Optional count of records loaded
 * WHY NECESSARY: Enables debugging and audit trails for data-driven tests
 */
export type AdapterMetadata = {
  source: string;
  loadedAt: string;
  warning?: string;
  rowCount?: number;
};

/**
 * TYPE: AdapterResult
 * PURPOSE: Standard return type for all adapter load operations
 * PROPERTIES:
 *   - records: Array of data rows normalized to key-value pairs
 *   - metadata: Information about the data source and load operation
 * WHY NECESSARY: Ensures consistent data structure across all adapters, simplifies test code
 */
export type AdapterResult = {
  records: AdapterRecord[];
  metadata: AdapterMetadata;
};

/**
 * INTERFACE: IAdapter
 * PURPOSE: Contract that all data adapters must implement
 * RESPONSIBILITY: Defines standard method for loading data from any source
 * 
 * WHY NECESSARY: 
 * Enables data-driven testing with multiple sources (Excel, DB, S3, JSON)
 * without changing test code. Tests can swap data sources by changing adapter type.
 * 
 * IMPLEMENTATION RULES:
 * 1. load() must always return AdapterResult (never throw errors for missing credentials)
 * 2. If credentials/connection unavailable, return empty records with warning in metadata
 * 3. Log actionable error messages to artifacts/adapter-warnings.log
 * 4. Normalize all data to AdapterRecord[] format regardless of source structure
 * 
 * EXAMPLE USAGE:
 *   const adapter: IAdapter = new ExcelAdapter();
 *   const result = await adapter.load({ file: 'users.xlsx', sheet: 'Sheet1' });
 *   for (const record of result.records) {
 *     console.log(record.username, record.email);
 *   }
 */
export interface IAdapter {
  /**
   * METHOD: load
   * PURPOSE: Loads data from the adapter's source and normalizes it to standard format
   * 
   * HOW IT WORKS:
   * 1. Parse the params object to understand what data to load
   * 2. Attempt to connect to data source (file, database, API, etc.)
   * 3. If connection succeeds, fetch raw data
   * 4. Normalize raw data to array of AdapterRecord objects
   * 5. Generate metadata with source identifier and timestamp
   * 6. If connection fails due to missing credentials, return empty records with warning
   * 7. Return AdapterResult with records and metadata
   * 
   * WHY NECESSARY: 
   * Provides uniform interface for tests to load data regardless of source type.
   * Tests don't need to know if data comes from Excel, DB, or S3.
   * 
   * @param params - Adapter-specific configuration object
   *   - For Excel: { file: string, sheet?: string }
   *   - For JSON: { file: string } or { url: string }
   *   - For DB: { query: string, params?: any[] }
   *   - For S3: { bucket: string, key: string }
   * 
   * @returns Promise<AdapterResult> - Always resolves (never rejects)
   *   - On success: { records: [...data...], metadata: { source, loadedAt } }
   *   - On missing credentials: { records: [], metadata: { source, loadedAt, warning } }
   * 
   * EXAMPLE:
   *   const excel = new ExcelAdapter();
   *   const result = await excel.load({ file: 'test-data/users.xlsx' });
   *   console.log(`Loaded ${result.metadata.rowCount} users from ${result.metadata.source}`);
   * 
   * EDGE CASES:
   * - File not found: Return empty records with warning
   * - Invalid credentials: Return empty records with warning listing required env vars
   * - Parse error: Return empty records with warning describing issue
   * - Empty data source: Return empty records with metadata (no warning)
   * 
   * USED BY: All test files in src/tests/ that require external data
   */
  load(params: any): Promise<AdapterResult>;
}
