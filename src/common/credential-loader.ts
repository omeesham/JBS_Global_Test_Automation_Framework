/**
 * @agent-doc
 * PURPOSE: Loads test credentials from env vars, inline, or config files. Reads NAVIGATOR_* env vars from .env files.
 * OWNER: generator, healer
 * IMPACT: high - broken = can't authenticate to Navigator Cloud
 * DEPENDS-ON: dotenv, adapterFactory.ts
 * USED-BY: fixtures.ts (authenticatedSession credential loading)
 * RULES: NEVER log credentials or secrets.
 */

import { AdapterFactory } from '../data/adapters/adapterFactory';
import { Log } from '../utils/logger';

export interface CredentialSource {
  type: 'excel' | 'json' | 'db' | 's3' | 'env' | 'inline';
  path?: string;
  query?: string;
  role?: string;
  sheet?: string;
  username?: string;
  password?: string;
}

export interface Credentials {
  username: string;
  password: string;
  mfaSecret?: string;
  role?: string;
  metadata?: Record<string, any>;
}

export class CredentialLoader {
  /**
   * Load credentials from specified source.
   * @example await CredentialLoader.loadCredentials({ type: 'env' })
   */
  static async loadCredentials(source: CredentialSource): Promise<Credentials> {
    Log.info(`Loading credentials from ${source.type} source`);
    try {
      const { records } = await this._resolveSource(source);
      const record = source.role
        ? records.find((r: any) => r.role === source.role || r.username === source.role)
        : records[0];
      if (!record) throw new Error(`No credentials found for role: ${source.role || 'default'}`);
      const credentials = this._mapRecord(record, source.role);
      this.validateCredentials(credentials);
      Log.info(`[OK] Credentials loaded for: ${credentials.username}`);
      return credentials;
    } catch (error) {
      Log.error(`Failed to load credentials: ${error}`);
      throw error;
    }
  }

  /** Load credentials by role (convenience wrapper). */
  static async loadCredentialsByRole(role: string, source: Omit<CredentialSource, 'role'>): Promise<Credentials> {
    return this.loadCredentials({ ...source, role });
  }

  /** Load multiple credentials (data-driven testing). */
  static async loadAllCredentials(source: CredentialSource): Promise<Credentials[]> {
    Log.info(`Loading all credentials from ${source.type} source`);
    const { records } = await this._resolveSource(source);
    const credentialsList = records.map((r: any) => this._mapRecord(r));
    Log.info(`[OK] Loaded ${credentialsList.length} credential sets`);
    return credentialsList;
  }

  /** Validate credentials -- required fields present and non-trivial. */
  static validateCredentials(credentials: Credentials): boolean {
    if (!credentials.username || !credentials.password) {
      throw new Error('Invalid credentials: username and password required');
    }
    if (credentials.username.length < 3) throw new Error('Invalid credentials: username too short');
    if (credentials.password.length < 3) throw new Error('Invalid credentials: password too short');
    return true;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /** Centralized source resolution: env/inline/file-adapter -> raw records. */
  private static async _resolveSource(source: CredentialSource): Promise<{ records: any[] }> {
    if (source.type === 'env') {
      return { records: [this._loadEnvRecord()] };
    }

    if (source.type === 'inline') {
      if (!source.username || !source.password) {
        throw new Error('Inline credentials require username and password');
      }
      return { records: [{ username: source.username, password: source.password, role: 'inline', _source: 'inline' }] };
    }

    if (!source.path) throw new Error(`Path required for ${source.type} credential source`);
    const adapter = AdapterFactory.getAdapter(source.type as Exclude<CredentialSource['type'], 'env' | 'inline'>);
    const data = await adapter.load({ file: source.path, query: source.query, sheet: source.sheet });
    return { records: data.records };
  }

  /** Map raw record fields to standardized Credentials (supports common field name variations). */
  private static _mapRecord(record: any, role?: string): Credentials {
    return {
      username: record.username || record.user || record.email,
      password: record.password || record.pass,
      mfaSecret: record.mfaSecret || record.mfa_secret || record.totp_secret,
      role: record.role || role,
      metadata: record,
    };
  }

  /** Load credentials from environment variables (.env files). */
  private static _loadEnvRecord(): Record<string, any> {
    return {
      username: process.env.NAVIGATOR_USERNAME || process.env.USERNAME_AUTOMATION || 'admin',
      password: process.env.NAVIGATOR_PASSWORD || process.env.PASSWORD_AUTOMATION || 'admin',
      mfaSecret: process.env.NAVIGATOR_MFA_SECRET || process.env.MFA_SECRET,
      role: 'env',
      _source: 'environment variables',
    };
  }
}
