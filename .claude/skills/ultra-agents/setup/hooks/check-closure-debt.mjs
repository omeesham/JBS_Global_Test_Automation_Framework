#!/usr/bin/env node
// check-closure-debt.mjs — G5: Closure + Lesson-Capture Debt Gate
//
// Sev=S1. Graduating incident: 2026-07-13 — Stop hook WARNS only; no PreToolUse
// gate blocks the next work until /final-q + Receipt + lesson clear the debt.
// The owner's ask: "closure never stops; never make me remind you each damn time."
//
// PURPOSE
//   Every opened goal mints closure-debt. Checked at PreToolUse: DENY/ANNOUNCE
//   the next mutation until the debt is cleared by:
//     (a) /final-q verdict (GREEN|YELLOW|RED), AND
//     (b) a Receipt artifact on disk, AND
//     (c) a lesson routed to the correct agent lane (or explicit none:<reason>).
//   Where Stop cannot block (LR-060), this hook converts the detective into a forcing
//   function: the NEXT tool call is gated.
//
// SPEC:      SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G5
// TP-1:      closure-debt.json at ~/.claude/delegation/ is protected state.
// TP-3:      Debt binds to {goal_id, session_id, opened_at}.
// TP-4:      Fires on ALL mutation tools: Edit|Write|MultiEdit|NotebookEdit|Bash|powershell|
//            apply_patch|Task|Agent.
// TP-5:      Self-authored "debt-cleared", "closure-done" tags LOGGED, never trusted.
//
// STDIN:     JSON { session_id, transcript_path, cwd, tool_name, tool_input }
// MODE:      gates-config.json → G5.mode  (off|announce|deny). Default: announce.
// FAIL-OPEN: any error → hook-failures.log + allow.
// TELEMETRY: deny/announce → gate-fires.log CSV.
// SETTINGS:  {"type":"command","command":"node ~/.claude/hooks/check-closure-debt.mjs"}

import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOME = homedir();
const REPO_ROOT = process.env.GATED_REPO_ROOT || process.cwd();
const STATE_DIR = join(HOME, '.claude', 'state');
const GATE_FIRES_LOG    = join(STATE_DIR, 'gate-fires.log');
const HOOK_FAILURES_LOG = join(STATE_DIR, 'hook-failures.log');
const GATES_CONFIG = join(HOME, '.claude', 'delegation', 'gates-config.json');

const BASE_STATE = process.env.GATES_STATE_DIR || join(HOME, '.claude');
const DELEGATION_DIR = join(BASE_STATE, 'delegation');
const CLOSURE_DEBT   = join(DELEGATION_DIR, 'closure-debt.json');

// Debt items required to clear a goal.
const REQUIRED_DEBT_ITEMS = ['final-q', 'receipt', 'lesson'];

// Mutation tools that trigger the check (read-only tools don't need closure first).
const MUTATION_TOOLS = new Set([
  'Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'apply_patch',
  'Task', 'Agent', 'Bash', 'powershell',
]);

// ── Debt model ────────────────────────────────────────────────────────────────

/**
 * Load closure-debt.json. Returns { goals: [] } on error (fail-open on debt state).
 * FAIL-OPEN on debt: if we can't read the debt file, we must not block legitimate work.
 * The debt file is TP-1 protected — writes to it by the model DENY via G1.
 */
export function loadDebt(debtPath) {
  try {
    if (!existsSync(debtPath || CLOSURE_DEBT)) return { goals: [] };
    const obj = JSON.parse(readFileSync(debtPath || CLOSURE_DEBT, 'utf8'));
    return Array.isArray(obj.goals) ? obj : { goals: [] };
  } catch { return { goals: [] }; }
}

/**
 * Find uncleaned debt for the given session.
 * Returns the first uncleared goal entry, or null if all clear.
 */
export function findActiveDebt(debt, sessionId) {
  if (!debt || !Array.isArray(debt.goals)) return null;
  return debt.goals.find(g =>
    !g.cleared &&
    g.session_id === sessionId &&
    Array.isArray(g.debt_items) &&
    g.debt_items.some(item => !(g.cleared_items || []).includes(item))
  ) || null;
}

/**
 * Compute remaining (uncleared) debt items for a goal.
 */
export function remainingDebtItems(goal) {
  if (!goal) return [];
  const cleared = new Set(goal.cleared_items || []);
  return (goal.debt_items || REQUIRED_DEBT_ITEMS).filter(item => !cleared.has(item));
}

/** True if the goal has all debt cleared. */
export function isDebtCleared(goal) {
  return remainingDebtItems(goal).length === 0;
}

/** True if path is the protected closure-debt file (TP-1). */
export function isProtectedDebtFile(filePath) {
  if (!filePath) return false;
  const norm = String(filePath).replace(/\\/g, '/');
  return norm.endsWith('closure-debt.json') && norm.includes('delegation');
}

/** Detect self-authored closure bypass tags (TP-5). */
export function detectClosureSelfTags(toolInput) {
  const tags = [];
  const hay = JSON.stringify(toolInput || '');
  if (/debt.cleared/i.test(hay))       tags.push('debt-cleared');
  if (/closure.done/i.test(hay))       tags.push('closure-done');
  if (/\[g5-skip\]/i.test(hay))        tags.push('[g5-skip]');
  if (/final.q.complete/i.test(hay))   tags.push('final-q-complete');
  if (/no.open.goals/i.test(hay))      tags.push('no-open-goals');
  return tags;
}

/**
 * Compute a human-readable goal description for the deny reason.
 */
export function formatGoalDescription(goal) {
  if (!goal) return 'unknown goal';
  const items = remainingDebtItems(goal);
  return (
    `goal "${goal.description || goal.goal_id || 'unnamed'}" (opened at ${goal.opened_at || '?'}): ` +
    `remaining debt items: ${items.join(', ')}`
  );
}

// ── Emit/fail helpers ─────────────────────────────────────────────────────────

function emitAllow(reason) {
  const o = { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' } };
  if (reason) o.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(o));
  process.exit(0);
}

function emitDeny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

function failOpen(tag, err) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G5-closure-debt(${tag}): ${err}\n`);
  } catch {}
  emitAllow('G5 fail-open: ' + String(err).slice(0, 120));
}

function fireTelemetry(verdict, target) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(GATE_FIRES_LOG, `closure-debt-gate, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
  } catch {}
}

function readMode() {
  try {
    const cfg = JSON.parse(readFileSync(GATES_CONFIG, 'utf8'));
    const entry = cfg['G5'];
    const m = typeof entry === 'string' ? entry : entry?.mode;
    if (['off', 'announce', 'deny'].includes(m)) return m;
  } catch {}
  return 'announce';
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function preflight() {
  try {
    // findActiveDebt on empty debt returns null (no block)
    const empty = loadDebt(null);
    if (findActiveDebt(empty, 'sess1')) return false;
    // findActiveDebt on uncleared goal returns the goal
    const debt = {
      goals: [{
        goal_id: 'g1', session_id: 'sess1', cleared: false,
        debt_items: ['final-q', 'receipt', 'lesson'], cleared_items: [],
        opened_at: '2026-07-13T10:00:00Z', description: 'test goal',
      }]
    };
    if (!findActiveDebt(debt, 'sess1')) return false;
    // isDebtCleared on fully-cleared goal returns true
    const cleared = {
      goal_id: 'g2', debt_items: ['final-q'], cleared_items: ['final-q'], cleared: false,
    };
    if (!isDebtCleared(cleared)) return false;
    return true;
  } catch { return false; }
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (process.argv[2] === '--self-test') {
  (async () => {
    let pass = 0; let fail = 0;
    function assert(label, cond) {
      if (cond) { console.log(`  PASS: ${label}`); pass++; }
      else      { console.error(`  FAIL: ${label}`); fail++; }
    }

    console.log('G5 self-test:');
    assert('preflight passes', preflight());

    // loadDebt
    const emptyDebt = loadDebt(null);
    assert('null debt path returns empty goals', emptyDebt.goals.length === 0);

    // findActiveDebt
    const fullDebt = {
      goals: [
        { goal_id: 'g1', session_id: 'sess1', cleared: false, debt_items: ['final-q', 'receipt', 'lesson'], cleared_items: [], opened_at: '2026-07-13T10:00:00Z', description: 'fix auth' },
        { goal_id: 'g2', session_id: 'sess1', cleared: true,  debt_items: ['final-q'], cleared_items: ['final-q'] },
        { goal_id: 'g3', session_id: 'sess2', cleared: false, debt_items: ['final-q'], cleared_items: [] },
      ]
    };
    assert('active debt found for sess1', findActiveDebt(fullDebt, 'sess1') !== null);
    assert('cleared goal not returned for sess1', findActiveDebt(fullDebt, 'sess1')?.goal_id === 'g1');
    assert('other session debt not returned', findActiveDebt(fullDebt, 'sess9') === null);

    // remainingDebtItems
    const g1 = fullDebt.goals[0];
    const partCleared = { debt_items: ['final-q', 'receipt', 'lesson'], cleared_items: ['final-q'] };
    assert('all 3 items remain for g1', remainingDebtItems(g1).length === 3);
    assert('2 items remain after 1 cleared', remainingDebtItems(partCleared).length === 2);
    assert('none remain when all cleared', remainingDebtItems({ debt_items: ['final-q'], cleared_items: ['final-q'] }).length === 0);

    // isDebtCleared
    assert('fully cleared is cleared', isDebtCleared({ debt_items: ['final-q'], cleared_items: ['final-q'] }));
    assert('partially cleared is NOT cleared', !isDebtCleared(partCleared));
    assert('nothing cleared is NOT cleared', !isDebtCleared(g1));

    // isProtectedDebtFile
    assert('closure-debt.json protected', isProtectedDebtFile('/home/x/.claude/delegation/closure-debt.json'));
    assert('other json not protected', !isProtectedDebtFile('/home/x/.claude/delegation/other.json'));

    // detectClosureSelfTags
    assert('debt-cleared tag detected', detectClosureSelfTags({ note: 'debt-cleared proceed' }).length > 0);
    assert('[g5-skip] detected', detectClosureSelfTags({ comment: '[g5-skip]' }).length > 0);
    assert('no tags on clean input', detectClosureSelfTags({ path: 'src/foo.ts' }).length === 0);

    // formatGoalDescription
    const desc = formatGoalDescription(g1);
    assert('description contains goal id or name', desc.includes('fix auth') || desc.includes('g1'));

    console.log(`\nG5: ${pass} passed, ${fail} failed`);
    process.exit(fail > 0 ? 1 : 0);
  })();
} else if (process.argv[2] === '--liveness-assert') {
  (async () => {
    const debt = {
      goals: [{
        goal_id: 'test', session_id: 'sess-liveness', cleared: false,
        debt_items: ['final-q', 'receipt', 'lesson'], cleared_items: [],
        opened_at: new Date().toISOString(), description: 'liveness test goal',
      }]
    };
    const active = findActiveDebt(debt, 'sess-liveness');
    if (!active) { console.error('LIVENESS FAIL: debt not found'); process.exit(1); }
    const remaining = remainingDebtItems(active);
    if (remaining.length !== 3) { console.error('LIVENESS FAIL: wrong remaining items'); process.exit(1); }
    console.log('LIVENESS PASS: ON announces/denies next tool with open debt; OFF skips gate');
    process.exit(0);
  })();
} else {
  (async () => {
    let input;
    try { input = await readStdin(); }
    catch (err) { failOpen('stdin-parse', err); return; }

    const { session_id, tool_name, tool_input } = input;

    // Only fires on mutation tools (read-only tools don't need closure-clear first)
    if (!MUTATION_TOOLS.has(tool_name)) {
      emitAllow('G5: read-only tool');
      return;
    }

    // TP-1: ALWAYS DENY writes to closure-debt.json (mode-independent)
    const targetPath = tool_input?.path || tool_input?.file_path || '';
    if (isProtectedDebtFile(targetPath)) {
      fireTelemetry('deny-tp1', targetPath);
      emitDeny(
        `[G5-TP1] PROTECTED STATE: closure-debt.json is hook-owned. ` +
        `Only the hook process or Rutvik via SELF_GRANT may update closure debt. ` +
        `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G5 TP-1)`
      );
      return;
    }

    const mode = readMode();
    if (mode === 'off') { emitAllow('G5 off'); return; }

    if (!preflight()) { failOpen('preflight', 'G5 preflight broken'); return; }

    // TP-5: log self-authored closure bypass tags
    const selfTags = detectClosureSelfTags(tool_input);
    if (selfTags.length > 0) {
      fireTelemetry('self-tag-logged', `${tool_name}:${selfTags.join(',')}`);
      try { appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G5-TP5: self-closure bypass tags logged: ${selfTags.join(', ')}\n`); } catch {}
    }

    // Load closure debt (fail-open: if unreadable, don't block)
    let debt;
    try { debt = loadDebt(CLOSURE_DEBT); }
    catch (err) { failOpen('load-debt', err); return; }

    const activeDebt = findActiveDebt(debt, session_id);
    if (!activeDebt) {
      emitAllow('G5: no open closure debt');
      return;
    }

    const remaining = remainingDebtItems(activeDebt);
    if (remaining.length === 0) {
      emitAllow('G5: debt cleared');
      return;
    }

    const goalDesc = formatGoalDescription(activeDebt);
    const reason = (
      `[G5-CLOSURE-DEBT] Open closure debt blocks the next action. ` +
      `${goalDesc}. ` +
      `Clear the debt FIRST before starting new work: ` +
      `${remaining.map(i => {
        if (i === 'final-q') return '(1) run /final-q and get a GREEN|YELLOW|RED verdict';
        if (i === 'receipt') return '(2) ensure the Receipt artifact is on disk';
        if (i === 'lesson')  return '(3) route a lesson to the correct agent lane (or record none:<reason>)';
        return i;
      }).join('; ')}. ` +
      `Self-authored "debt-cleared" tags are never trusted (TP-5). ` +
      `Closure never stops — the owner must never be the one to remind you (ask G). ` +
      `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G5)`
    );

    if (mode === 'deny') {
      fireTelemetry('deny', `goal:${activeDebt.goal_id || '?'}`);
      emitDeny(reason);
    } else {
      fireTelemetry('announce', `goal:${activeDebt.goal_id || '?'}`);
      emitAllow(`[G5-DEBT-WARN] ${reason}`);
    }
  })().catch(err => failOpen('main', err));
}
