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
exports.recordCall = recordCall;
exports.readAndAggregate = readAndAggregate;
exports.reset = reset;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const TELEMETRY_FILE = path.join(process.cwd(), 'reports', 'retry-telemetry.jsonl');
function ensureReportsDir() {
    const dir = path.dirname(TELEMETRY_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}
function recordCall(layer, attempts) {
    if (attempts.length === 0)
        return;
    try {
        ensureReportsDir();
        const entry = { layer, attempts, pid: process.pid, ts: Date.now() };
        fs.appendFileSync(TELEMETRY_FILE, JSON.stringify(entry) + '\n', 'utf-8');
    }
    catch {
    }
}
function readAndAggregate() {
    const out = {};
    if (!fs.existsSync(TELEMETRY_FILE))
        return out;
    let raw = '';
    try {
        raw = fs.readFileSync(TELEMETRY_FILE, 'utf-8');
    }
    catch {
        return out;
    }
    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        let entry;
        try {
            entry = JSON.parse(trimmed);
        }
        catch {
            continue;
        }
        if (!entry || !Array.isArray(entry.attempts) || entry.attempts.length === 0)
            continue;
        let stats = out[entry.layer];
        if (!stats) {
            stats = {
                callCount: 0,
                totalAttempts: 0,
                recoveredAtAttempt: {},
                wastedAttempts: 0,
                wastedMs: 0,
                succeededOnFirstAttempt: 0,
                failedAfterAllAttempts: 0,
            };
            out[entry.layer] = stats;
        }
        stats.callCount += 1;
        stats.totalAttempts += entry.attempts.length;
        const passIdx = entry.attempts.findIndex(a => a.outcome === 'pass');
        if (passIdx === 0) {
            stats.succeededOnFirstAttempt += 1;
        }
        else if (passIdx > 0) {
            const passAttempt = entry.attempts[passIdx];
            if (passAttempt) {
                stats.recoveredAtAttempt[passAttempt.attemptN] = (stats.recoveredAtAttempt[passAttempt.attemptN] || 0) + 1;
            }
            for (let i = 0; i < passIdx; i++) {
                const att = entry.attempts[i];
                if (att) {
                    stats.wastedAttempts += 1;
                    stats.wastedMs += att.durationMs;
                }
            }
        }
        else {
            stats.failedAfterAllAttempts += 1;
            stats.wastedAttempts += entry.attempts.length;
            stats.wastedMs += entry.attempts.reduce((sum, a) => sum + a.durationMs, 0);
        }
    }
    return out;
}
function reset() {
    try {
        if (fs.existsSync(TELEMETRY_FILE))
            fs.unlinkSync(TELEMETRY_FILE);
    }
    catch {
    }
}
