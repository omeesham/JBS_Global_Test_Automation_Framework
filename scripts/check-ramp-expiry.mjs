#!/usr/bin/env node
/**
 * check-ramp-expiry.mjs — Self-expiring ramp deadline enforcer.
 *
 * WHY THIS EXISTS: LR-062 opt-in precedent. A gate that lands in `announce`
 * with no owner and no deadline is the original bug wearing a new name —
 * nobody flips it, and the ramp is indistinguishable from no gate at all.
 * This script makes every date-bearing ramp_target self-enforcing: if the
 * deadline passes and the gate is still in `announce`, the check FAILS loudly.
 *
 * BEHAVIOR:
 *   For every key in .claude/guardrail-config.json whose name ends in
 *   `_ramp_target` (or equals `ramp_target`) and whose value is a valid
 *   YYYY-MM-DD date:
 *     - If today > that date AND the gate's mode is still `announce`
 *       AND ramp_complete is not true → exit 1 (FAIL), naming the key,
 *       the target date, and how many days overdue.
 *   Clean exit 0 when every ramp is inside its window, already at `deny`,
 *   or marked ramp_complete: true.
 *
 * FLAGS:
 *   --json    Emit machine-readable JSON instead of human summary.
 *
 * FAIL-CLOSED: unreadable or malformed config → exit 1, never silent skip.
 * No empty catch blocks (LR-003).
 *
 * Sev: S1 (LR-069 §3.3). Graduating incident: LR-062 opt-in — no deadline
 * means no gate. Part of PLAN_WALK_DEPTH_GATE Phase 6.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, '../.claude/guardrail-config.json');
const IS_JSON = process.argv.includes('--json');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toDateUTC(str) {
  // Parse as UTC midnight to avoid timezone-shifting the date
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function daysDiff(a, b) {
  return Math.round((a - b) / 86_400_000);
}

let config;
try {
  const raw = readFileSync(CONFIG_PATH, 'utf8');
  config = JSON.parse(raw);
} catch (err) {
  const msg = `FAIL: cannot read/parse ${CONFIG_PATH}: ${err.message}`;
  if (IS_JSON) {
    process.stdout.write(JSON.stringify({ ok: false, error: msg }) + '\n');
  } else {
    process.stderr.write(msg + '\n');
  }
  process.exit(1);
}

const today = todayUTC();
const overdue = [];
const ok = [];

for (const [key, value] of Object.entries(config)) {
  // Only consider keys whose value is a YYYY-MM-DD date string
  const isRampTargetKey = key === 'ramp_target' || key.endsWith('_ramp_target');
  if (!isRampTargetKey) continue;
  if (typeof value !== 'string' || !DATE_RE.test(value)) continue;

  // Derive the gate prefix (strip trailing _ramp_target, or use 'md_first' for bare key)
  const prefix = key === 'ramp_target' ? '' : key.slice(0, -'_ramp_target'.length);

  const modeKey = prefix ? `${prefix}_mode` : 'md_first_mode';
  const completeKey = prefix ? `${prefix}_ramp_complete` : 'ramp_complete';

  const mode = config[modeKey];
  const rampComplete = config[completeKey];

  // Only fail if mode is `announce` and ramp is not yet complete
  if (mode !== 'announce') {
    ok.push({ key, value, reason: `mode=${mode} (not announce)` });
    continue;
  }
  if (rampComplete === true) {
    ok.push({ key, value, reason: 'ramp_complete=true' });
    continue;
  }

  const deadline = toDateUTC(value);
  const daysOver = daysDiff(today, deadline);
  if (daysOver > 0) {
    overdue.push({ key, modeKey, deadline: value, daysOver });
  } else {
    ok.push({ key, value, reason: `inside window (${-daysOver} days remaining)` });
  }
}

if (IS_JSON) {
  process.stdout.write(JSON.stringify({ ok: overdue.length === 0, overdue, clean: ok }, null, 2) + '\n');
} else {
  if (ok.length > 0) {
    for (const entry of ok) {
      process.stdout.write(`  OK  ${entry.key}: ${entry.reason}\n`);
    }
  }
  if (overdue.length > 0) {
    process.stderr.write('\nFAIL: the following ramps are overdue and still in announce mode:\n');
    for (const entry of overdue) {
      process.stderr.write(
        `  OVERDUE  ${entry.key} (${entry.modeKey}=announce) — target was ${entry.deadline}, now ${entry.daysOver} day(s) overdue.\n`
      );
    }
    process.stderr.write('\nAction required: either promote the gate to deny or extend the ramp_target with justification.\n');
  }
}

process.exit(overdue.length > 0 ? 1 : 0);
