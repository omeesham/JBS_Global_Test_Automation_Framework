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
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Adapter = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class S3Adapter {
    client = null;
    isStubMode = false;
    async load(params) {
        const timestamp = new Date().toISOString();
        await this.initializeClient(params.region);
        if (this.isStubMode) {
            const warning = 'S3 credentials missing. Required environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY';
            this.logWarning(warning);
            this.logWarning('To enable S3 adapter, set these variables in your .env file:');
            this.logWarning('  AWS_REGION=us-east-1  # or your preferred region');
            this.logWarning('  AWS_ACCESS_KEY_ID=your_access_key');
            this.logWarning('  AWS_SECRET_ACCESS_KEY=your_secret_key');
            this.logWarning('  AWS_SESSION_TOKEN=your_token  # optional, for temp credentials');
            return {
                records: [],
                metadata: {
                    source: 's3-stub',
                    loadedAt: timestamp,
                    warning,
                    rowCount: 0
                }
            };
        }
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: params.bucket,
                Key: params.key
            });
            const response = await this.client.send(command);
            const content = await this.streamToString(response.Body);
            const contentType = response.ContentType || 'application/json';
            const records = this.parseContent(content, contentType);
            const metadata = {
                source: `s3:${params.bucket}/${params.key}`,
                loadedAt: timestamp,
                rowCount: records.length
            };
            console.log(`[OK] S3Adapter: Loaded ${records.length} records from s3://${params.bucket}/${params.key}`);
            return { records, metadata };
        }
        catch (error) {
            const warning = error.name === 'NoSuchKey'
                ? `S3 object not found: s3://${params.bucket}/${params.key}`
                : `S3 operation failed: ${error.message}`;
            this.logWarning(warning);
            return {
                records: [],
                metadata: {
                    source: `s3:${params.bucket}/${params.key}`,
                    loadedAt: timestamp,
                    warning,
                    rowCount: 0
                }
            };
        }
    }
    async initializeClient(region) {
        if (!this.checkCredentials()) {
            this.isStubMode = true;
            this.client = null;
            return;
        }
        try {
            this.client = new client_s3_1.S3Client({
                region: region || process.env.AWS_REGION || 'us-east-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN })
                }
            });
            this.isStubMode = false;
        }
        catch (error) {
            this.isStubMode = true;
            this.client = null;
        }
    }
    checkCredentials() {
        const required = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
        return required.every(envVar => process.env[envVar]);
    }
    async streamToString(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        });
    }
    parseContent(content, contentType) {
        try {
            if (contentType.includes('json') || content.trim().startsWith('{') || content.trim().startsWith('[')) {
                const data = JSON.parse(content);
                return Array.isArray(data) ? data : [data];
            }
            if (contentType.includes('csv') || contentType.includes('text')) {
                const lines = content.trim().split('\n');
                if (lines.length === 0 || !lines[0])
                    return [];
                const headers = lines[0].split(',').map(h => h.trim());
                const records = [];
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (!line)
                        continue;
                    const values = line.split(',').map(v => v.trim());
                    const record = {};
                    headers.forEach((header, index) => {
                        record[header] = values[index] || '';
                    });
                    records.push(record);
                }
                return records;
            }
            return JSON.parse(content);
        }
        catch (error) {
            this.logWarning(`Failed to parse S3 content: ${error}`);
            return [];
        }
    }
    logWarning(message) {
        const logMessage = `[${new Date().toISOString()}] [S3Adapter] ${message}\n`;
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
exports.S3Adapter = S3Adapter;
