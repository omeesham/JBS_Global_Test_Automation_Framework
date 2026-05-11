/**
 * Per-layer per-attempt retry telemetry — Phase C of PLAN_POSTDEPGATE_FRAMEWORK_FIXES.
 *
 * Layered retry calls (clickWithRetry, login, validateState, etc.) record their
 * per-attempt outcomes here. Agent-reporter aggregates on test-run end and
 * writes a `retryStats` field to failure-summary.json.
 *
 * Cross-process aggregation via shared JSONL file at reports/retry-telemetry.jsonl.
 * Append-only writes are safe across worker processes without explicit locking.
 *
 * Pure-additive: callers record outcomes; the telemetry never changes test behavior.
 */

import * as fs from 'fs';
import * as path from 'path';

export type RetryLayer = 'click' | 'login' | 'validateState' | 'radix' | 'expectPoll' | 'perTest';

export interface AttemptRecord {
  attemptN: number; // 1-based attempt index within a single call
  durationMs: number;
  outcome: 'pass' | 'fail';
}

export interface PerLayerStats {
  callCount: number;
  totalAttempts: number;
  recoveredAtAttempt: Record<number, number>;
  wastedAttempts: number;
  wastedMs: number;
  succeededOnFirstAttempt: number;
  failedAfterAllAttempts: number;
}

export type RetryStats = Partial<Record<RetryLayer, PerLayerStats>>;

interface JsonlEntry {
  layer: RetryLayer;
  attempts: AttemptRecord[];
  pid: number;
  ts: number;
}

const TELEMETRY_FILE = path.join(process.cwd(), 'reports', 'retry-telemetry.jsonl');

function ensureReportsDir(): void {
  const dir = path.dirname(TELEMETRY_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Record a single retry-layer call's per-attempt outcomes.
 * Appends one JSONL line; safe across worker processes.
 * Telemetry must NEVER break tests — IO errors are swallowed silently.
 */
export function recordCall(layer: RetryLayer, attempts: AttemptRecord[]): void {
  if (attempts.length === 0) return;
  try {
    ensureReportsDir();
    const entry: JsonlEntry = { layer, attempts, pid: process.pid, ts: Date.now() };
    fs.appendFileSync(TELEMETRY_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  } catch {
    // telemetry must never break tests; swallow IO errors
  }
}

/**
 * Read all JSONL entries from disk and aggregate by layer.
 * Returns an empty RetryStats if the file does not exist.
 */
export function readAndAggregate(): RetryStats {
  const out: RetryStats = {};
  if (!fs.existsSync(TELEMETRY_FILE)) return out;

  let raw = '';
  try {
    raw = fs.readFileSync(TELEMETRY_FILE, 'utf-8');
  } catch {
    return out;
  }

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let entry: JsonlEntry;
    try {
      entry = JSON.parse(trimmed) as JsonlEntry;
    } catch {
      continue; // skip malformed lines
    }
    if (!entry || !Array.isArray(entry.attempts) || entry.attempts.length === 0) continue;

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
    } else if (passIdx > 0) {
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
    } else {
      // never passed — all attempts wasted
      stats.failedAfterAllAttempts += 1;
      stats.wastedAttempts += entry.attempts.length;
      stats.wastedMs += entry.attempts.reduce((sum, a) => sum + a.durationMs, 0);
    }
  }

  return out;
}

/**
 * Delete the JSONL file. Called by the reporter `onBegin` to start fresh per run.
 * No-op if file is absent. Errors swallowed silently.
 */
export function reset(): void {
  try {
    if (fs.existsSync(TELEMETRY_FILE)) fs.unlinkSync(TELEMETRY_FILE);
  } catch {
    // telemetry must never break tests
  }
}
