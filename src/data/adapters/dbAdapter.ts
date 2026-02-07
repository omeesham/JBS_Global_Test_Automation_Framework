/**
 * FILE: src/data/adapters/dbAdapter.ts
 * PURPOSE: Loads test data from SQL databases (PostgreSQL, SQL Server, MySQL) with graceful fallback when credentials missing
 * CONTENTS: DbAdapter class implementing IAdapter interface
 * DEPENDENCIES:
 *   - knex: SQL query builder for multiple database types
 *   - pg: PostgreSQL driver (install: npm install pg)
 *   - IAdapter: Contract this adapter implements
 * USED BY:
 *   - src/tests/[any]/[file].spec.ts (tests requiring database test data)
 *   - src/data/adapters/adapterFactory.ts (when type='db' is requested)
 */

import knex, { Knex } from 'knex';
import * as fs from 'fs';
import * as path from 'path';
import { IAdapter, AdapterResult, AdapterRecord, AdapterMetadata } from './IAdapter';

/**
 * CLASS: DbAdapter
 * RESPONSIBILITY: Handles loading data from SQL databases with stub mode when credentials unavailable
 * 
 * PROPERTIES:
 *   - client: Knex instance (null if in stub mode)
 *   - isStubMode: boolean flag indicating if adapter is using stub behavior
 * 
 * METHODS OVERVIEW:
 *   - load(params): Main method to execute SQL query and return results
 *   - (private) initializeClient(): Creates Knex connection or enters stub mode
 *   - (private) checkCredentials(): Validates required environment variables
 *   - (private) logWarning(message): Writes warnings to artifacts/adapter-warnings.log
 * 
 * USAGE EXAMPLE:
 *   // With credentials in .env:
 *   const adapter = new DbAdapter();
 *   const result = await adapter.load({ 
 *     query: 'SELECT * FROM users WHERE role = ?',
 *     params: ['tester']
 *   });
 *   
 *   // Without credentials (stub mode):
 *   const result = await adapter.load({ query: 'SELECT * FROM users' });
 *   // Returns: { records: [], metadata: { warning: 'DB credentials missing...' } }
 * 
 * INHERITANCE: Implements IAdapter
 * 
 * WHY NECESSARY:
 * Enables testing against live databases without hardcoding test data.
 * Stub mode allows tests to run in environments without database access (CI, local dev).
 * Supports multiple database types through Knex abstraction layer.
 */
export class DbAdapter implements IAdapter {
  private client: Knex | null = null;
  private isStubMode: boolean = false;

  /**
   * METHOD: load
   * PURPOSE: Executes SQL query against database or returns stub data if credentials missing
   * 
   * HOW IT WORKS:
   * 1. Initialize Knex client (or set stub mode if credentials missing)
   * 2. If stub mode: Return empty records with warning listing required env vars
   * 3. If connected: Execute the SQL query with optional parameters
   * 4. Normalize query results to AdapterRecord[] format
   * 5. Generate metadata with source identifier and timestamp
   * 6. Close database connection (important for connection pooling)
   * 7. Return AdapterResult with records and metadata
   * 
   * WHY NECESSARY:
   * Provides database test data without requiring credentials in all environments.
   * Tests can run locally (stub mode) or in CI with real DB (when secrets available).
   * Prevents test failures due to missing database access.
   * 
   * USED BY:
   *   - src/tests/integration/**.spec.ts (tests requiring live database data)
   *   - src/tests/data-validation/**.spec.ts (tests validating data integrity)
   * 
   * @param params - Configuration object:
   *   - query: string - SQL query to execute (supports parameterized queries)
   *                     Example: 'SELECT * FROM users WHERE active = ?'
   *   - params?: any[] - (Optional) Parameters for parameterized query
   *                      Example: [true] for above query
   *   - database?: string - (Optional) Override DB_NAME from environment
   * 
   * @returns Promise<AdapterResult>
   *   Stub mode: {
   *     records: [],
   *     metadata: {
   *       source: 'db-stub',
   *       loadedAt: '2026-02-06T...',
   *       warning: 'DB credentials missing. Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME'
   *     }
   *   }
   *   Connected: {
   *     records: [{id: 1, username: 'test'}, ...],
   *     metadata: {
   *       source: 'db-postgres:testdb',
   *       loadedAt: '2026-02-06T...',
   *       rowCount: 5
   *     }
   *   }
   * 
   * EXAMPLE:
   *   const adapter = new DbAdapter();
   *   
   *   // Parameterized query
   *   const result = await adapter.load({
   *     query: 'SELECT * FROM test_users WHERE role = ? AND active = ?',
   *     params: ['tester', true]
   *   });
   *   
   *   for (const user of result.records) {
   *     await loginPage.login(user.username, user.password);
   *   }
   * 
   * EDGE CASES:
   * - Missing credentials: Returns empty records with warning (DOES NOT THROW)
   * - Invalid query: Returns empty records with SQL error message in warning
   * - Connection timeout: Returns empty records with timeout warning
   * - Empty result set: Returns empty records (no warning - valid scenario)
   * - Database unavailable: Returns empty records with connection error warning
   */
  async load(params: { query: string; params?: any[]; database?: string }): Promise<AdapterResult> {
    const timestamp = new Date().toISOString();
    
    // Step 1: Initialize client
    await this.initializeClient(params.database);
    
    // Step 2: Check stub mode
    if (this.isStubMode) {
      const warning = 'DB credentials missing. Required environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (also optional: DB_PORT, DB_TYPE)';
      this.logWarning(warning);
      this.logWarning('To enable database adapter, set these variables in your .env file:');
      this.logWarning('  DB_HOST=localhost');
      this.logWarning('  DB_PORT=5432');
      this.logWarning('  DB_USER=your_db_user');
      this.logWarning('  DB_PASSWORD=your_db_password');
      this.logWarning('  DB_NAME=your_database_name');
      this.logWarning('  DB_TYPE=pg  # or mysql, mssql');
      
      return {
        records: [],
        metadata: {
          source: 'db-stub',
          loadedAt: timestamp,
          warning,
          rowCount: 0
        }
      };
    }

    try {
      // Step 3: Execute query
      const results = await this.client!.raw(params.query, params.params || []);
      
      // Step 4: Normalize results (different drivers return results differently)
      let records: AdapterRecord[];
      
      // PostgreSQL returns results in .rows
      if (results.rows) {
        records = results.rows;
      }
      // MySQL/MSSQL return results directly in array
      else if (Array.isArray(results)) {
        records = results[0] || results;
      }
      // Generic fallback
      else {
        records = results;
      }

      // Step 5: Generate metadata
      const dbType = process.env.DB_TYPE || 'pg';
      const dbName = params.database || process.env.DB_NAME || 'unknown';
      const metadata: AdapterMetadata = {
        source: `db-${dbType}:${dbName}`,
        loadedAt: timestamp,
        rowCount: records.length
      };

      console.log(`✅ DbAdapter: Loaded ${records.length} records from ${dbType}/${dbName}`);

      // Step 6: Close connection
      await this.client!.destroy();

      // Step 7: Return result
      return { records, metadata };

    } catch (error: any) {
      const warning = `Database query failed: ${error.message}`;
      this.logWarning(warning);
      
      // Clean up connection on error
      if (this.client) {
        await this.client.destroy();
      }

      return {
        records: [],
        metadata: {
          source: 'db-error',
          loadedAt: timestamp,
          warning,
          rowCount: 0
        }
      };
    }
  }

  /**
   * METHOD: initializeClient (private)
   * PURPOSE: Creates Knex database connection or sets stub mode if credentials missing
   * 
   * HOW IT WORKS:
   * 1. Call checkCredentials() to validate environment variables
   * 2. If credentials missing: Set isStubMode=true, client=null, return
   * 3. If credentials present: Create Knex configuration object
   * 4. Initialize Knex client with config
   * 5. Test connection with simple query
   * 
   * WHY NECESSARY:
   * Implements graceful degradation - tests don't fail when DB unavailable.
   * Centralizes connection logic for reuse.
   * 
   * @param database - Optional database name override
   * 
   * EDGE CASES:
   * - Invalid credentials: Sets stub mode (connection test fails)
   * - Unsupported DB_TYPE: Defaults to 'pg' (PostgreSQL)
   */
  private async initializeClient(database?: string): Promise<void> {
    // Step 1 & 2: Check credentials
    if (!this.checkCredentials()) {
      this.isStubMode = true;
      this.client = null;
      return;
    }

    try {
      // Step 3: Create Knex config
      const dbType = process.env.DB_TYPE || 'pg';  // Default to PostgreSQL
      const config: Knex.Config = {
        client: dbType,
        connection: {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || (dbType === 'pg' ? '5432' : '3306')),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: database || process.env.DB_NAME
        },
        pool: { min: 0, max: 5 }  // Connection pooling
      };

      // Step 4: Initialize client
      this.client = knex(config);

      // Step 5: Test connection
      await this.client.raw('SELECT 1');
      
      this.isStubMode = false;

    } catch (error) {
      // Connection failed - enter stub mode
      this.isStubMode = true;
      this.client = null;
    }
  }

  /**
   * METHOD: checkCredentials (private)
   * PURPOSE: Validates that required database environment variables are present
   * 
   * HOW IT WORKS:
   * 1. Check for presence of DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
   * 2. Return true if all present, false if any missing
   * 
   * @returns boolean - true if all required credentials present
   * 
   * WHY NECESSARY:
   * Determines whether to use real DB connection or stub mode.
   * Provides clear feedback about missing variables.
   */
  private checkCredentials(): boolean {
    const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    return required.every(envVar => process.env[envVar]);
  }

  /**
   * METHOD: logWarning (private)
   * PURPOSE: Writes adapter warnings to log file for debugging
   * 
   * @param message - Warning message to log
   */
  private logWarning(message: string): void {
    const logMessage = `[${new Date().toISOString()}] [DbAdapter] ${message}\n`;
    
    try {
      const artifactsDir = path.resolve(process.cwd(), 'artifacts');
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }
      
      const logPath = path.join(artifactsDir, 'adapter-warnings.log');
      fs.appendFileSync(logPath, logMessage, 'utf-8');
    } catch (err) {
      // Silently fail if can't write to log
    }
    
    console.warn(`⚠️  ${message}`);
  }
}
