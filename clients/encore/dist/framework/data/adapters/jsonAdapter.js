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
exports.JsonAdapter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
class JsonAdapter {
    async load(params) {
        const timestamp = new Date().toISOString();
        if (!params.file && !params.url) {
            const warning = 'JsonAdapter requires either "file" or "url" parameter';
            this.logWarning(warning);
            return {
                records: [],
                metadata: {
                    source: 'json:unknown',
                    loadedAt: timestamp,
                    warning,
                    rowCount: 0
                }
            };
        }
        let rawData;
        let sourceName;
        try {
            if (params.file) {
                rawData = await this.loadFromFile(params.file);
                sourceName = `json:${path.basename(params.file)}`;
            }
            else {
                rawData = await this.loadFromUrl(params.url);
                sourceName = `json:${new URL(params.url).hostname}`;
            }
            const records = this.normalizeData(rawData, params.rootKey);
            const metadata = {
                source: sourceName,
                loadedAt: timestamp,
                rowCount: records.length
            };
            console.log(`[OK] JsonAdapter: Loaded ${records.length} records from ${params.file || params.url}`);
            return { records, metadata };
        }
        catch (error) {
            const warning = `Failed to load JSON: ${error.message}`;
            this.logWarning(warning);
            return {
                records: [],
                metadata: {
                    source: params.file ? `json:${path.basename(params.file)}` : `json:${params.url}`,
                    loadedAt: timestamp,
                    warning,
                    rowCount: 0
                }
            };
        }
    }
    async loadFromFile(file) {
        const filePath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${file}`);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    async loadFromUrl(url) {
        const response = await axios_1.default.get(url, {
            timeout: 10000,
            headers: { 'Accept': 'application/json' }
        });
        return response.data;
    }
    normalizeData(data, rootKey) {
        let target = data;
        if (rootKey) {
            const keys = rootKey.split('.');
            for (const key of keys) {
                target = target?.[key];
                if (target === undefined) {
                    return [];
                }
            }
        }
        if (!Array.isArray(target)) {
            target = [target];
        }
        return target.map((item) => {
            if (typeof item === 'object' && item !== null) {
                return item;
            }
            return { value: item };
        });
    }
    logWarning(message) {
        const logMessage = `[${new Date().toISOString()}] [JsonAdapter] ${message}\n`;
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
exports.JsonAdapter = JsonAdapter;
