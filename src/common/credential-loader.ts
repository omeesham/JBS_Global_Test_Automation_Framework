/**
 * FILE: src/common/credential-loader.ts
 * PURPOSE: Centralized credential loading from multiple data sources
 * WHY NECESSARY: Implements Req #2 - fetch credentials from Excel/DB/S3/JSON/etc
 * USED BY: ui-common.ts workflow methods, test files
 * 
 * HOW IT WORKS:
 * 1. Accepts credential source specification (type, path, role)
 * 2. Uses AdapterFactory to load from specified source
 * 3. Validates credential format
 * 4. Returns standardized Credentials object
 * 
 * SUPPORTS:
 * - Excel files (XLSX, CSV)
 * - JSON files
 * - Database queries
 * - AWS S3 objects
 * - .env fallback
 */

import { AdapterFactory } from '../data/adapters/adapterFactory';
import { Log } from '../utils/logger';

/**
 * Credential source specification
 */
export interface CredentialSource {
  type: 'excel' | 'json' | 'db' | 's3' | 'env' | 'inline';
  path?: string;         // File path or S3 key
  query?: string;        // SQL query for DB source
  role?: string;         // Role/user identifier (e.g., 'admin', 'standard_user')
  sheet?: string;        // Excel sheet name (optional)
  username?: string;     // For inline credentials (data-driven tests)
  password?: string;     // For inline credentials (data-driven tests)
}

/**
 * Standardized credentials object
 */
export interface Credentials {
  username: string;
  password: string;
  mfaSecret?: string;
  role?: string;
  metadata?: Record<string, any>;
}

/**
 * CredentialLoader class
 * Centralizes credential fetching from multiple sources
 */
export class CredentialLoader {
  /**
   * Load credentials from specified source
   * 
   * @param source - Credential source specification
   * @returns Promise<Credentials>
   * 
   * @example
   * // Load admin credentials from Excel
   * const creds = await CredentialLoader.loadCredentials({
   *   type: 'excel',
   *   path: 'tests/test-data/users.csv',
   *   role: 'admin'
   * });
   * 
   * @example
   * // Load from JSON
   * const creds = await CredentialLoader.loadCredentials({
   *   type: 'json',
   *   path: 'tests/test-data/test-users.json',
   *   role: 'standard_user'
   * });
   * 
   * @example
   * // Load from .env (fallback)
   * const creds = await CredentialLoader.loadCredentials({
   *   type: 'env'
   * });
   */
  static async loadCredentials(source: CredentialSource): Promise<Credentials> {
    Log.info(`Loading credentials from ${source.type} source`);

    try {
      if (source.type === 'env') {
        return this.loadFromEnv();
      }

      if (source.type === 'inline') {
        if (!source.username || !source.password) {
          throw new Error('Inline credentials require username and password');
        }
        const credentials: Credentials = {
          username: source.username,
          password: source.password,
          role: 'inline',
          metadata: { source: 'inline' }
        };
        this.validateCredentials(credentials);
        Log.info(`Using inline credentials for: ${credentials.username}`);
        return credentials;
      }

      if (!source.path) {
        throw new Error(`Path required for ${source.type} credential source`);
      }

      const adapter = AdapterFactory.getAdapter(source.type);
      const data = await adapter.load({
        file: source.path,
        query: source.query,
        sheet: source.sheet
      });

      // Find credentials by role if specified
      const record = source.role
        ? data.records.find((r: any) => r.role === source.role || r.username === source.role)
        : data.records[0];

      if (!record) {
        throw new Error(`No credentials found for role: ${source.role || 'default'}`);
      }

      const credentials: Credentials = {
        username: record.username || record.user || record.email,
        password: record.password || record.pass,
        mfaSecret: record.mfaSecret || record.mfa_secret || record.totp_secret,
        role: record.role || source.role,
        metadata: record
      };

      this.validateCredentials(credentials);
      Log.info(`✅ Credentials loaded for: ${credentials.username}`);

      return credentials;
    } catch (error) {
      Log.error(`Failed to load credentials: ${error}`);
      throw error;
    }
  }

  /**
   * Load credentials by role (convenience method)
   * 
   * @param role - User role identifier
   * @param source - Credential source specification
   * @returns Promise<Credentials>
   */
  static async loadCredentialsByRole(
    role: string,
    source: Omit<CredentialSource, 'role'>
  ): Promise<Credentials> {
    return this.loadCredentials({ ...source, role });
  }

  /**
   * Load credentials from environment variables
   * Fallback method when no data source specified
   * 
   * @returns Credentials from .env
   */
  private static loadFromEnv(): Credentials {
    const credentials: Credentials = {
      username: process.env.USERNAME_AUTOMATION || 'admin',
      password: process.env.PASSWORD_AUTOMATION || 'admin',
      mfaSecret: process.env.MFA_SECRET,
      role: 'env',
      metadata: { source: 'environment variables' }
    };

    Log.warn('⚠️  Using credentials from .env (not from data source)');
    return credentials;
  }

  /**
   * Validate credentials object
   * Ensures required fields are present
   * 
   * @param credentials - Credentials to validate
   * @throws Error if validation fails
   */
  static validateCredentials(credentials: Credentials): boolean {
    if (!credentials.username || !credentials.password) {
      throw new Error('Invalid credentials: username and password required');
    }

    if (credentials.username.length < 3) {
      throw new Error('Invalid credentials: username too short');
    }

    if (credentials.password.length < 3) {
      throw new Error('Invalid credentials: password too short');
    }

    return true;
  }

  /**
   * Load multiple credentials (e.g., for data-driven testing)
   * 
   * @param source - Credential source specification
   * @returns Promise<Credentials[]>
   * 
   * @example
   * // Load all users from Excel for data-driven test
   * const allUsers = await CredentialLoader.loadAllCredentials({
   *   type: 'excel',
   *   path: 'tests/test-data/users.csv'
   * });
   */
  static async loadAllCredentials(source: CredentialSource): Promise<Credentials[]> {
    Log.info(`Loading all credentials from ${source.type} source`);

    if (source.type === 'env') {
      return [this.loadFromEnv()];
    }

    if (source.type === 'inline') {
      if (!source.username || !source.password) {
        throw new Error('Inline credentials require username and password');
      }
      return [{ username: source.username, password: source.password, role: 'inline', metadata: { source: 'inline' } }];
    }

    if (!source.path) {
      throw new Error(`Path required for ${source.type} credential source`);
    }

    const adapter = AdapterFactory.getAdapter(source.type as Exclude<CredentialSource['type'], 'env' | 'inline'>);
    const data = await adapter.load({
      file: source.path,
      query: source.query,
      sheet: source.sheet
    });

    const credentialsList: Credentials[] = data.records.map((record: any) => ({
      username: record.username || record.user || record.email,
      password: record.password || record.pass,
      mfaSecret: record.mfaSecret || record.mfa_secret || record.totp_secret,
      role: record.role || record.expected_result,
      metadata: record
    }));

    Log.info(`✅ Loaded ${credentialsList.length} credential sets`);
    return credentialsList;
  }
}
