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
exports.ExcelAdapter = void 0;
const XLSX = __importStar(require("xlsx"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ExcelAdapter {
    async load(params) {
        const timestamp = new Date().toISOString();
        const filePath = path.isAbsolute(params.file)
            ? params.file
            : path.resolve(process.cwd(), params.file);
        if (!fs.existsSync(filePath)) {
            const warning = `File not found: ${params.file}`;
            this.logWarning(warning);
            return {
                records: [],
                metadata: {
                    source: `excel:${path.basename(params.file)}`,
                    loadedAt: timestamp,
                    warning,
                    rowCount: 0
                }
            };
        }
        try {
            const fileBuffer = fs.readFileSync(filePath);
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = params.sheet || workbook.SheetNames[0];
            if (!sheetName || !workbook.Sheets[sheetName]) {
                const warning = `Sheet '${params.sheet}' not found. Available sheets: ${workbook.SheetNames.join(', ')}`;
                this.logWarning(warning);
                return {
                    records: [],
                    metadata: {
                        source: `excel:${path.basename(params.file)}`,
                        loadedAt: timestamp,
                        warning,
                        rowCount: 0
                    }
                };
            }
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet);
            const records = rawData.map(row => ({ ...row }));
            const metadata = {
                source: `excel:${path.basename(params.file)}${params.sheet ? `:${params.sheet}` : ''}`,
                loadedAt: timestamp,
                rowCount: records.length
            };
            console.log(`[OK] ExcelAdapter: Loaded ${records.length} records from ${params.file}${params.sheet ? ` [${params.sheet}]` : ''}`);
            return { records, metadata };
        }
        catch (error) {
            const warning = `Failed to parse Excel file: ${error.message}`;
            this.logWarning(warning);
            return {
                records: [],
                metadata: {
                    source: `excel:${path.basename(params.file)}`,
                    loadedAt: timestamp,
                    warning,
                    rowCount: 0
                }
            };
        }
    }
    logWarning(message) {
        const logMessage = `[${new Date().toISOString()}] [ExcelAdapter] ${message}\n`;
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
exports.ExcelAdapter = ExcelAdapter;
