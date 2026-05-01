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
exports.Log = exports.Logger = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class Logger {
    static logFile = path.join(process.cwd(), 'logs', 'test-execution.log');
    static specContext = 'global';
    static setSpecContext(specFile) {
        this.specContext = path.basename(specFile, '.spec.ts');
        const specLogDir = path.join(process.cwd(), 'logs', this.specContext);
        if (!fs.existsSync(specLogDir)) {
            fs.mkdirSync(specLogDir, { recursive: true });
        }
    }
    static get currentLogFile() {
        if (this.specContext === 'global') {
            return this.logFile;
        }
        return path.join(process.cwd(), 'logs', this.specContext, 'test-execution.log');
    }
    static write(level, message) {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const line = `${timestamp} [${process.pid}] ${level.padEnd(5)} AutomationFramework - ${message}`;
        console.log(line);
        const logPath = this.currentLogFile;
        const logsDir = path.dirname(logPath);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        fs.appendFileSync(logPath, line + '\n', 'utf-8');
    }
    static info(message) {
        this.write('INFO', message);
    }
    static error(message) {
        this.write('ERROR', message);
    }
    static warn(message) {
        this.write('WARN', message);
    }
    static debug(message) {
        if (process.env.LOG_LEVEL === 'debug') {
            this.write('DEBUG', message);
        }
    }
}
exports.Logger = Logger;
exports.Log = Logger;
