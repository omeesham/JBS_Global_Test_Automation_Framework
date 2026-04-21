/** Loads test data from SQL databases (PostgreSQL, SQL Server, MySQL) with graceful fallback when credentials missing */

import knex, { Knex } from 'knex';
import * as fs from 'fs';
import * as path from 'path';
import { IAdapter, AdapterResult, AdapterRecord, AdapterMetadata } from './IAdapter';

/** Loads data from SQL databases with graceful stub mode when credentials unavailable */
export class DbAdapter implements IAdapter {
  private client: Knex | null = null;
  private isStubMode: boolean = false;

 /** Executes SQL query or returns stub data if credentials missing */
  async load(params: { query: string; params?: any[]; database?: string }): Promise<AdapterResult> {
    const timestamp = new Date().toISOString();
    await this.initializeClient(params.database);

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
      const results = await this.client!.raw(params.query, params.params || []);
      let records: AdapterRecord[];

      if (results.rows) {
        records = results.rows;
      }
      else if (Array.isArray(results)) {
        records = results[0] || results;
      }
      else {
        records = results;
      }

      const dbType = process.env.DB_TYPE || 'pg';
      const dbName = params.database || process.env.DB_NAME || 'unknown';
      const metadata: AdapterMetadata = {
        source: `db-${dbType}:${dbName}`,
        loadedAt: timestamp,
        rowCount: records.length
      };

      console.log(`[OK] DbAdapter: Loaded ${records.length} records from ${dbType}/${dbName}`);
      await this.client!.destroy();
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

 /** Creates Knex connection or sets stub mode if credentials missing */
  private async initializeClient(database?: string): Promise<void> {
    if (!this.checkCredentials()) {
      this.isStubMode = true;
      this.client = null;
      return;
    }

    try {
      const dbType = process.env.DB_TYPE || 'pg';
      const config: Knex.Config = {
        client: dbType,
        connection: {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || (dbType === 'pg' ? '5432' : '3306')),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: database || process.env.DB_NAME
        },
        pool: { min: 0, max: 5 }
      };

      this.client = knex(config);
      await this.client.raw('SELECT 1');
      
      this.isStubMode = false;

    } catch (error) {
      this.isStubMode = true;
      this.client = null;
    }
  }

 /** Validates that required DB environment variables are present */
  private checkCredentials(): boolean {
    const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    return required.every(envVar => process.env[envVar]);
  }

 /** Writes warning to artifacts/adapter-warnings.log */
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
    
    console.warn(`[WARN]  ${message}`);
  }
}
