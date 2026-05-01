"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbAdapter = void 0;
const knex_1 = __importDefault(require("knex"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class DbAdapter {
    client = null;
    isStubMode = false;
    async load(params) {
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
            const results = await this.client.raw(params.query, params.params || []);
            let records;
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
            const metadata = {
                source: `db-${dbType}:${dbName}`,
                loadedAt: timestamp,
                rowCount: records.length
            };
            console.log(`[OK] DbAdapter: Loaded ${records.length} records from ${dbType}/${dbName}`);
            await this.client.destroy();
            return { records, metadata };
        }
        catch (error) {
            const warning = `Database query failed: ${error.message}`;
            this.logWarning(warning);
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
    async initializeClient(database) {
        if (!this.checkCredentials()) {
            this.isStubMode = true;
            this.client = null;
            return;
        }
        try {
            const dbType = process.env.DB_TYPE || 'pg';
            const config = {
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
            this.client = (0, knex_1.default)(config);
            await this.client.raw('SELECT 1');
            this.isStubMode = false;
        }
        catch (error) {
            this.isStubMode = true;
            this.client = null;
        }
    }
    checkCredentials() {
        const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
        return required.every(envVar => process.env[envVar]);
    }
    logWarning(message) {
        const logMessage = `[${new Date().toISOString()}] [DbAdapter] ${message}\n`;
        try {
            const artifactsDir = path.resolve(process.cwd(), 'artifacts');
            if (!fs.existsSync(artifactsDir)) {
                fs.mkdirSync(artifactsDir, { recursive: true });
            }
            const logPath = path.join(artifactsDir, 'adapter-warnings.log');
            fs.appendFileSync(logPath, logMessage, 'utf-8');
        }
        catch (err) {
        }
        console.warn(`[WARN]  ${message}`);
    }
}
exports.DbAdapter = DbAdapter;
