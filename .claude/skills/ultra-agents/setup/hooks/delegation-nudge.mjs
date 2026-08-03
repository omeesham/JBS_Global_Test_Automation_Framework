#!/usr/bin/env node
// delegation-nudge.mjs — PreToolUse hook on Bash (LCD_02 Phase 1).
//
// Sev=S1 — WARN-only, never DENY. Graduated by delegation-audit-B (2026-07-13):
// Bash legwork completely ungated → silent inline work bypasses worker routing.
//
// PURPOSE
//   Speed-bump for delegable Bash legwork: emit allow + nudge reason on patterns
//   a copilot worker could handle. Never blocks. Increments a per-session counter
//   and escalates text at count ≥3.
//
// LCD03 (2026-07-16): nudge reason gains "You are in CEO mode this session — delegate this. "
//   prefix (Phase 2 wording spec). OFF-mode: exits silently, unchanged. Count ≥3 escalation
//   text unchanged. Dispatch-reset unchanged.
//
// CONFIG PATHS (all env-overridable for testability — tests never touch user home)
//   NUDGE_CONFIG_PATH            default ~/.claude/delegation/config.json
//   NUDGE_ASSISTANT_STATE_PATH   default ~/.claude/delegation/assistant-state.json
//   NUDGE_COUNTER_PATH           default ~/.claude/state/session-bash-nudges.json
//   NUDGE_FAILURE_LOG            default ~/.claude/state/delegation-nudge-failures.log
//   NUDGE_TELEMETRY_PATH         env override; default is <payload-cwd>/.claude/state/gate-fires.log (cwd-derived at WARN time)
//
// FAIL-OPEN: any error → allow + append failure log. Never throws to stdout.

import {
  readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, renameSync, unlinkSync,
  readdirSync, statSync
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';

const HOME = homedir();
// Telemetry default is cwd-derived at WARN time (see appendTelemetry).
// Correct at any install location — the hook derives the repo log from the validated
// payload cwd, not from __dirname (which resolves to C:\ when installed at ~/.claude/hooks/).

const NUDGE_CONFIG_PATH     = process.env.NUDGE_CONFIG_PATH         || join(HOME, '.claude', 'delegation', 'config.json');
const NUDGE_ASSISTANT_STATE = process.env.NUDGE_ASSISTANT_STATE_PATH || join(HOME, '.claude', 'delegation', 'assistant-state.json');
const NUDGE_COUNTER_PATH    = process.env.NUDGE_COUNTER_PATH         || join(HOME, '.claude', 'state', 'session-bash-nudges.json');
const NUDGE_FAILURE_LOG     = process.env.NUDGE_FAILURE_LOG          || join(HOME, '.claude', 'state', 'delegation-nudge-failures.log');
const NUDGE_TELEMETRY_PATH  = process.env.NUDGE_TELEMETRY_PATH       || null;
// LCD04 Phase 3: stall-queue dir (env-overridable for tests)
const NUDGE_STALL_QUEUE_DIR = process.env.NUDGE_STALL_QUEUE_DIR      || join(HOME, '.claude', 'delegation', 'stall-queue');

const REPO_CWD_PREFIX = (process.env.GATED_REPO_ROOT || process.cwd()).replace(/\\/g, '/').toLowerCase();

// ── I/O helpers ──────────────────────────────────────────────────────────────

function allow(reason) {
  const out = { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' } };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out) + '\n');
}

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function appendFailure(msg) {
  try {
    ensureDir(NUDGE_FAILURE_LOG);
    appendFileSync(NUDGE_FAILURE_LOG, `${new Date().toISOString()} ${msg}\n`);
  } catch (_) { /* truly fail-open */ }
}

function readJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

// ── Counter (atomic tmp+rename) ──────────────────────────────────────────────

function incrementCounter(sessionId) {
  let counters = {};
  if (existsSync(NUDGE_COUNTER_PATH)) {
    try { counters = readJSON(NUDGE_COUNTER_PATH); } catch (_) { counters = {}; }
  }
  counters[sessionId] = (counters[sessionId] || 0) + 1;
  const tmp = NUDGE_COUNTER_PATH + '.tmp.' + randomBytes(4).toString('hex');
  ensureDir(NUDGE_COUNTER_PATH);
  writeFileSync(tmp, JSON.stringify(counters, null, 2));
  try {
    renameSync(tmp, NUDGE_COUNTER_PATH);
  } catch (_) {
    // Fallback: overwrite directly (non-atomic but acceptable for a nudge counter)
    writeFileSync(NUDGE_COUNTER_PATH, JSON.stringify(counters, null, 2));
    try { unlinkSync(tmp); } catch (_) {}
  }
  return counters[sessionId];
}

function resetCounter(sessionId) {
  let counters = {};
  if (existsSync(NUDGE_COUNTER_PATH)) {
    try { counters = readJSON(NUDGE_COUNTER_PATH); } catch (_) { counters = {}; }
  }
  counters[sessionId] = 0;
  ensureDir(NUDGE_COUNTER_PATH);
  writeFileSync(NUDGE_COUNTER_PATH, JSON.stringify(counters, null, 2));
}

function appendTelemetry(sessionId, normCwd) {
  try {
    const telPath = NUDGE_TELEMETRY_PATH || join(normCwd, '.claude', 'state', 'gate-fires.log');
    ensureDir(telPath);
    appendFileSync(telPath, `delegation-nudge, ${new Date().toISOString()}, announce, ${sessionId}\n`);
  } catch (_) { /* fail-open */ }
}

// ── LCD04 Phase 3: stall-queue check ────────────────────────────────────────

function hasFreshStallFile(dir) {
  try {
    if (!existsSync(dir)) return false;
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));
    if (files.length === 0) return false;
    const tenMinMs = 10 * 60 * 1000;
    const now = Date.now();
    return files.some(f => {
      try { return (now - statSync(join(dir, f)).mtimeMs) < tenMinMs; }
      catch (_) { return false; }
    });
  } catch (_) { return false; }
}

// ── Exempt patterns ──────────────────────────────────────────────────────────

const EXEMPT_GIT        = /^git (log|diff|status)\b/;
const EXEMPT_SIMPLE_CMD = /^(ls|dir|echo|pwd|which)\b/;
const PEEK_CMD_RE       = /^(cat|head|tail|grep|sed -n)\b/;
const DISPATCH_RE       = /copilot-worker\.sh.*--(ticket|task)/;

function isExemptHookPath(cmd) {
  // Allow commands whose ONLY non-flag args are under .claude/hooks/, .claude/delegation/, ~/.claude/
  const args = cmd.split(/\s+/).slice(1).filter(t => t && !t.startsWith('-'));
  if (args.length === 0) return false;
  return args.every(t =>
    t.startsWith('.claude/hooks/') ||
    t.startsWith('.claude/delegation/') ||
    t.startsWith('~/.claude/')
  );
}

function isSingleFilePeek(cmd) {
  if (!PEEK_CMD_RE.test(cmd)) return false;
  if (cmd.includes('|')) return false;
  // Count path-like tokens (contain / or .) — at most 1 allowed
  const args = cmd.split(/\s+/).slice(1).filter(t => t && !t.startsWith('-'));
  const pathLike = args.filter(t => t.includes('/') || t.includes('.'));
  return pathLike.length <= 1;
}

function isExemptNodeCheck(cmd) {
  return /^node --check \S+$/.test(cmd.trim());
}

function isExemptScorecard(cmd) {
  return cmd.includes('scorecard.mjs') || cmd.includes('envelope.mjs') || cmd.includes('verify-run.mjs');
}

// ── WARN patterns ────────────────────────────────────────────────────────────

const WARN_PLAYWRIGHT   = /npx playwright|playwright-cli/;
const WARN_NPM_TEST     = /\bnpm (test|run (test|lint|check)[^ ]*)\b/;
const SOURCE_PATH_SEG   = /(?:clients\/|src\/|pipeline\/|scripts\/)/;

function isMultiGrep(cmd) {
  return cmd.includes('|') && (cmd.match(/\b(grep|rg)\b/g) || []).length >= 2;
}

function isRecursiveGrepLong(cmd) {
  if (!/(rg|grep)\b.*(?:-r|--recursive)/.test(cmd) && !/(rg|grep) (?:-r|--recursive)/.test(cmd)) {
    // Also catch: rg 'long pattern' -r  or  grep -r 'long pattern'
    if (!/(rg|grep)/.test(cmd)) return false;
    if (!/-r|--recursive/.test(cmd)) return false;
  }
  const quoted = cmd.match(/(['"])(.*?)\1/);
  if (quoted && quoted[2].length > 50) return true;
  // Unquoted: check longest non-flag token after rg/grep
  const parts = cmd.split(/\s+/);
  const gIdx = parts.findIndex(p => p === 'rg' || p === 'grep');
  if (gIdx < 0) return false;
  const candidates = parts.slice(gIdx + 1).filter(p => !p.startsWith('-') && p.length > 50);
  return candidates.length > 0;
}

// 200-char threshold: transcribed from the Bash-legwork-gate spec in
// .claude/skills/delegation-temp/SKILL.md ("any command >200 chars carrying repo paths").
// The value was set by judgment, not measured against real command distributions.
// To retune: sample a representative session's bash payloads, find the length that
// separates single-file peeks from multi-step searches, and update the SKILL.md spec
// and this constant together. Do not change one without the other.
function isLongSourceCmd(cmd) {
  return cmd.length > 200 && SOURCE_PATH_SEG.test(cmd);
}

function isWarn(cmd) {
  return (
    WARN_PLAYWRIGHT.test(cmd) ||
    WARN_NPM_TEST.test(cmd) ||
    isLongSourceCmd(cmd) ||
    isMultiGrep(cmd) ||
    isRecursiveGrepLong(cmd)
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  let payload;
  try {
    const raw = await readStdin();
    payload = JSON.parse(raw);
  } catch (e) {
    appendFailure(`parse-stdin: ${e.message}`);
    allow();
    return;
  }

  const { session_id = 'unknown', cwd = '', tool_name, tool_input = {} } = payload;
  const cmd = (tool_input.command || '').trim();

  // 2. Only Bash
  if (tool_name !== 'Bash') { allow(); return; }

  // 4. cwd scope: normalize \ → /, lowercase
  const normCwd = cwd.replace(/\\/g, '/').toLowerCase();
  if (!normCwd.startsWith(REPO_CWD_PREFIX)) { allow(); return; }

  try {
    // 3a. Config — GATE must be "on"
    if (!existsSync(NUDGE_CONFIG_PATH)) { allow(); return; }
    let cfg;
    try { cfg = readJSON(NUDGE_CONFIG_PATH); } catch (_) { allow(); return; }
    if (cfg.GATE !== 'on') { allow(); return; }

    // 3b. Assistant state — "off" means copilot layer inactive, nudges meaningless
    if (existsSync(NUDGE_ASSISTANT_STATE)) {
      try {
        const st = readJSON(NUDGE_ASSISTANT_STATE);
        if (st.assistant === 'off') { allow(); return; }
      } catch (_) { /* absent/unparseable ≠ off — continue */ }
    }

    // 5. DISPATCH DETECTION — checked first, resets counter
    if (DISPATCH_RE.test(cmd)) {
      resetCounter(session_id);
      allow('delegation-nudge: dispatch detected — counter reset');
      return;
    }

    // 6. EXEMPT (allow silently)
    if (EXEMPT_GIT.test(cmd))       { allow(); return; }
    if (isExemptScorecard(cmd))     { allow(); return; }
    if (EXEMPT_SIMPLE_CMD.test(cmd)){ allow(); return; }
    if (isSingleFilePeek(cmd))      { allow(); return; }
    if (isExemptHookPath(cmd))      { allow(); return; }
    if (isExemptNodeCheck(cmd))     { allow(); return; }

    // 7. WARN patterns → allow + nudge reason
    // LCD03 Phase 2: leading CEO-mode prefix on ALL warn messages.
    if (isWarn(cmd)) {
      const n = incrementCounter(session_id);
      appendTelemetry(session_id, normCwd);
      let msg = `You are in CEO mode this session — delegate this. delegation-nudge [${n} this session]: this looks like delegable legwork — a copilot worker with shell could run this. Ticket it (copilot-worker.sh --ticket) unless this is a genuine CEO peek.`;
      if (n >= 3) {
        msg += ' 3+ inline legwork calls — log a routing incident to ~/.claude/delegation/self_incidents.log and expect this to appear in the Receipt audit.';
      }
      // LCD04 Phase 3: anti-rescue stall signal
      if (hasFreshStallFile(NUDGE_STALL_QUEUE_DIR)) {
        msg += ' A worker just stalled — a bounce ticket is queued. Self-rescue = routing incident. Dispatch the bounce instead.';
      }
      allow(msg);
      return;
    }

    // Default: allow silently
    allow();

  } catch (e) {
    appendFailure(`runtime: ${e.message}`);
    allow();
  }
}

main().catch(e => {
  try { appendFailure(`unhandled: ${e.message}`); } catch (_) {}
  allow();
});
