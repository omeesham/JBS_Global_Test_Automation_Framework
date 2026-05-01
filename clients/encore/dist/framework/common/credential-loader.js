"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialLoader = void 0;
const adapterFactory_1 = require("../data/adapters/adapterFactory");
const logger_1 = require("../utils/logger");
class CredentialLoader {
    static async loadCredentials(source) {
        logger_1.Log.info(`Loading credentials from ${source.type} source`);
        try {
            const { records } = await this._resolveSource(source);
            const record = source.role
                ? records.find((r) => r.role === source.role || r.username === source.role)
                : records[0];
            if (!record)
                throw new Error(`No credentials found for role: ${source.role || 'default'}`);
            const credentials = this._mapRecord(record, source.role);
            this.validateCredentials(credentials);
            logger_1.Log.info(`[OK] Credentials loaded for: ${credentials.username}`);
            return credentials;
        }
        catch (error) {
            logger_1.Log.error(`Failed to load credentials: ${error}`);
            throw error;
        }
    }
    static async loadCredentialsByRole(role, source) {
        return this.loadCredentials({ ...source, role });
    }
    static async loadAllCredentials(source) {
        logger_1.Log.info(`Loading all credentials from ${source.type} source`);
        const { records } = await this._resolveSource(source);
        const credentialsList = records.map((r) => this._mapRecord(r));
        logger_1.Log.info(`[OK] Loaded ${credentialsList.length} credential sets`);
        return credentialsList;
    }
    static validateCredentials(credentials) {
        if (!credentials.username || !credentials.password) {
            throw new Error('Invalid credentials: username and password required');
        }
        if (credentials.username.length < 3)
            throw new Error('Invalid credentials: username too short');
        if (credentials.password.length < 3)
            throw new Error('Invalid credentials: password too short');
        return true;
    }
    static async _resolveSource(source) {
        if (source.type === 'env') {
            return { records: [this._loadEnvRecord()] };
        }
        if (source.type === 'inline') {
            if (!source.username || !source.password) {
                throw new Error('Inline credentials require username and password');
            }
            return { records: [{ username: source.username, password: source.password, role: 'inline', _source: 'inline' }] };
        }
        if (!source.path)
            throw new Error(`Path required for ${source.type} credential source`);
        const adapter = adapterFactory_1.AdapterFactory.getAdapter(source.type);
        const data = await adapter.load({ file: source.path, query: source.query, sheet: source.sheet });
        return { records: data.records };
    }
    static _mapRecord(record, role) {
        return {
            username: record.username || record.user || record.email,
            password: record.password || record.pass,
            mfaSecret: record.mfaSecret || record.mfa_secret || record.totp_secret,
            role: record.role || role,
            metadata: record,
        };
    }
    static _loadEnvRecord() {
        return {
            username: process.env.NAVIGATOR_USERNAME || process.env.USERNAME_AUTOMATION || 'admin',
            password: process.env.NAVIGATOR_PASSWORD || process.env.PASSWORD_AUTOMATION || 'admin',
            mfaSecret: process.env.NAVIGATOR_MFA_SECRET || process.env.MFA_SECRET,
            role: 'env',
            _source: 'environment variables',
        };
    }
}
exports.CredentialLoader = CredentialLoader;
