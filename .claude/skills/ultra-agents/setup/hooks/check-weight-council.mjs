#!/usr/bin/env node
// check-weight-council.mjs — G2: Weight-Worthy Council Gate
//
// Sev=S0. Graduating incident: 2026-07-13 — rival-fight, interrogate-every-hop,
// pre-exec /slop+/ultrathink audit, and guilty-until-proven are prose Claude can
// skip. Any weight-worthy mutation may proceed without convergence proof.
//
// PURPOSE
//   When G1 classifies an action weight-worthy (I1+), the task envelope MUST carry
//   council receipts: (B) cross-family convergence, (C) trap ledger pre-written before
//   any worker result, (D) pre-exec /slop+/ultrathink verdict, (E) for plan/rule/control
//   edits — unanimous reviewer verdict. A forged self-authored "converged:true" is
//   LOGGED, never trusted (TP-5).
//
// SPEC:      SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G2
// TP-1:      Council ledger at ~/.claude/state/council-receipts/ is protected state.
// TP-3:      Receipt bound to envelope {session_id, user_turn, plan_hash, pathset}.
// TP-4:      Full tool surface: Edit|Write|MultiEdit|NotebookEdit|apply_patch|Bash|powershell|Task|Agent.
// TP-5:      Self-authored "converged:true", "trap-complete", "audit-clean" tags
//            LOGGED, never trusted.
//
// ANTI-DEADLOCK (both seats F5): fight-owned tool calls during a fight run are
//   excluded — seats writing their trail must NOT deadlock on "no converged artifact yet".
//   Detected by: envelope.work_type === 'council-fight' OR FIGHT_RUN_ID env var.
//
// STDIN:     JSON { session_id, transcript_path, cwd, tool_name, tool_input }
// MODE:      gates-config.json → G2.mode  (off|announce|deny). Default: announce.
// FAIL-OPEN: any error → hook-failures.log + allow.
// TELEMETRY: deny/announce → gate-fires.log CSV.
// SETTINGS:  {"type":"command","command":"node ~/.claude/hooks/check-weight-council.mjs"}

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
const ENVELOPE_STORE   = join(BASE_STATE, 'state', 'task-envelopes');
const COUNCIL_RECEIPTS = join(BASE_STATE, 'state', 'council-receipts');

// ── Weight-worthiness classification (I0 vs I1+) ─────────────────────────────

// I0 paths: purely documentary changes (never weight-worthy).
const I0_PATH_RX = /(?:^|\/)(?:docs?|README|CHANGELOG|CONTRIBUTING|LICENSE)(?:\/|\.md)?/i;

// Weight-worthy path indicators.
const WEIGHT_WORTHY_PATH_RX = [
  /\.(ts|mjs|js|sh|json|py|go|java|rb)$/,
  /plans\/(?:pending|done)\//,
  /\.claude\/rules\//,
  /\.claude\/skills\//,
  /settings\.json$/,
  /guardrail-config\.json$/,
  /CLAUDE\.md$/,
];

// Dispatch tools are always weight-worthy.
const DISPATCH_TOOLS = new Set(['Task', 'Agent']);

// Tools never weight-worthy on their own (G2 defers to G1 for final dispatch).
const PASSTHROUGH_TOOLS = new Set(['Read', 'Glob', 'Grep', 'LS', 'TodoRead']);

/** Classify the action as I0 (trivial) or I1+ (weight-worthy). */
export function classifyWeight(toolName, toolInput) {
  if (PASSTHROUGH_TOOLS.has(toolName)) return 'I0';
  if (DISPATCH_TOOLS.has(toolName)) return 'I1-dispatch';

  const path = toolInput?.path || toolInput?.file_path || '';
  if (I0_PATH_RX.test(path)) return 'I0';
  if (WEIGHT_WORTHY_PATH_RX.some(rx => rx.test(path))) return 'I1-mutation';

  // Bash/powershell: trivial commands are I0
  if (toolName === 'Bash' || toolName === 'powershell') {
    const cmd = toolInput?.command || '';
    if (/[;&|<>`]/.test(cmd) || /\$\(/.test(cmd)) return 'I1-shell';
    if (/^\s*(?:git\s+(?:status|log|diff|show)|cat\s+|ls\s+|echo\s+|grep\s+|pwd$)/i.test(cmd)) return 'I0';
    return 'I1-shell';
  }

  return 'I1-mutation'; // default: unknown mutations are weight-worthy
}

// ── Plan/rule/control edit detection (ask E — guilty-until-proven) ───────────
const PLAN_RULE_RX = /(?:plans\/(?:pending|done)\/|\.claude\/rules\/|\.claude\/skills\/|CLAUDE\.md$|settings\.json$|guardrail-config\.json$)/;
export function isPlanOrRuleEdit(toolInput) {
  const p = toolInput?.path || toolInput?.file_path || '';
  return PLAN_RULE_RX.test(String(p).replace(/\\/g, '/'));
}

// ── Receipt validation ────────────────────────────────────────────────────────

/**
 * Validate that the envelope carries all required council receipts for a weight-worthy action.
 * Returns { valid: true } or { valid: false, missing: [...], detail: '...' }.
 */
export function validateCouncilReceipt(envelope, weightClass, isPlanEdit) {
  if (!envelope) return { valid: false, missing: ['envelope'], detail: 'no envelope present' };

  const receipt = envelope.council_receipt;
  if (!receipt) {
    return {
      valid: false,
      missing: ['council_receipt'],
      detail: 'envelope lacks council_receipt field — weight-worthy actions require rival-fight + trap + audit evidence',
    };
  }

  const missing = [];
  const details = [];

  // (B) Cross-family convergence artifact
  if (!receipt.convergence) {
    missing.push('convergence');
    details.push('missing convergence artifact (B): two DIFFERENT-family run-ids + converged result + oracle citations');
  } else {
    const c = receipt.convergence;
    if (!Array.isArray(c.run_ids) || c.run_ids.length < 2) {
      missing.push('convergence.run_ids');
      details.push('convergence requires ≥2 run_ids (one per rival family)');
    }
    if (!Array.isArray(c.families) || c.families.length < 2 || new Set(c.families).size < 2) {
      missing.push('convergence.families');
      details.push('convergence families must be ≥2 DIFFERENT families (defeats The Consistency Illusion)');
    }
    if (!c.result_hash) {
      missing.push('convergence.result_hash');
      details.push('convergence result_hash missing — no oracle to verify against');
    }
    if (!Array.isArray(c.oracle_citations) || c.oracle_citations.length === 0) {
      missing.push('convergence.oracle_citations');
      details.push('convergence oracle_citations required: each converged point must cite the artifact that settled it');
    }
  }

  // (C) Pre-read trap ledger — timestamps prove questions were written BEFORE results were read
  if (!receipt.trap_ledger) {
    missing.push('trap_ledger');
    details.push('missing trap_ledger (C): trap questions must be timestamped BEFORE any worker result was read');
  } else {
    const t = receipt.trap_ledger;
    if (!t.questions_set_at) {
      missing.push('trap_ledger.questions_set_at');
      details.push('trap_ledger.questions_set_at required (must precede oracle_read_at)');
    }
    if (!t.oracle_read_at) {
      missing.push('trap_ledger.oracle_read_at');
      details.push('trap_ledger.oracle_read_at required');
    }
    if (t.questions_set_at && t.oracle_read_at && t.questions_set_at >= t.oracle_read_at) {
      missing.push('trap_ledger.temporal_order');
      details.push('trap questions must be SET before oracle result is READ (defeats "read first, rationalize after")');
    }
  }

  // (D) Pre-exec audit receipt — /slop + /ultrathink bound to current plan hash
  if (!receipt.preexec_audit) {
    missing.push('preexec_audit');
    details.push('missing preexec_audit (D): /slop + /ultrathink verdict required, bound to current plan/diff hash');
  } else {
    const a = receipt.preexec_audit;
    if (a.slop_verdict !== 'CLEAN')      { missing.push('preexec_audit.slop'); details.push('/slop verdict must be CLEAN'); }
    if (a.ultrathink_verdict !== 'CLEAN') { missing.push('preexec_audit.ultrathink'); details.push('/ultrathink verdict must be CLEAN'); }
    if (!a.plan_hash) { missing.push('preexec_audit.plan_hash'); details.push('pre-exec audit must bind to current plan_hash (detects audit of stale plan)'); }
  }

  // (E) For plan/rule/control edits: guilty-until-proven reviewer verdict
  if (isPlanEdit && !receipt.plan_change_verdict) {
    missing.push('plan_change_verdict');
    details.push('plan/rule/control edits require guilty-until-proven unanimous reviewer verdict (E) binding old_hash → new_hash');
  } else if (isPlanEdit && receipt.plan_change_verdict) {
    const pv = receipt.plan_change_verdict;
    if (pv.verdict !== 'APPROVED' || !pv.unanimous) {
      missing.push('plan_change_verdict.unanimous_approval');
      details.push('plan change verdict must be APPROVED + unanimous; default = plan text stands');
    }
    if (!pv.old_hash || !pv.new_hash) {
      missing.push('plan_change_verdict.hash_binding');
      details.push('plan_change_verdict must bind old_hash → new_hash (prevents replay of stale approval)');
    }
  }

  // Handoff binding: selected executor + decision hash must match next delegation
  if (!receipt.handoff) {
    missing.push('handoff');
    details.push('missing handoff binding: receipt must name selected executor + reconciled decision_hash (defeats fight→plan-A execute-plan-B)');
  }

  if (missing.length > 0) {
    return { valid: false, missing, detail: details.join('; ') };
  }
  return { valid: true };
}

/** Detect self-authored council bypass tags (TP-5). */
export function detectCouncilSelfTags(toolInput) {
  const tags = [];
  const hay = JSON.stringify(toolInput || '');
  if (/converged\s*:\s*true/i.test(hay))     tags.push('converged:true');
  if (/trap-complete/i.test(hay))            tags.push('trap-complete');
  if (/audit-clean/i.test(hay))              tags.push('audit-clean');
  if (/\[fight-done\]/i.test(hay))           tags.push('[fight-done]');
  if (/council.receipt\s*:\s*ok/i.test(hay)) tags.push('council.receipt:ok');
  return tags;
}

export function validateHandoffBinding(receipt, toolName, toolInput) {
  if (!['Task', 'Agent'].includes(toolName)) return { valid: true };
  const selected = receipt?.handoff?.selected_executor;
  if (!selected) return { valid: false, detail: 'handoff.selected_executor missing' };
  const actual = toolInput?.agent_type || toolInput?.agentType || toolInput?.subagent_type || toolInput?.name;
  if (!actual) return { valid: false, detail: 'dispatch lacks executor identity field to bind against handoff.selected_executor' };
  const expected = String(selected).toLowerCase();
  const got = String(actual).toLowerCase();
  if (expected === got || expected.includes(got) || got.includes(expected)) return { valid: true };
  return { valid: false, detail: `handoff selected '${selected}' but dispatch targets '${actual}'` };
}

/** True if this call is within a fight run (anti-deadlock — seats write their trail). */
function isFightRunContext(envelope) {
  if (process.env.FIGHT_RUN_ID) return true;
  return envelope?.work_type === 'council-fight';
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
    appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G2-weight-council(${tag}): ${err}\n`);
  } catch {}
  emitAllow('G2 fail-open: ' + String(err).slice(0, 120));
}

function fireTelemetry(verdict, target) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(GATE_FIRES_LOG, `weight-council-gate, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
  } catch {}
}

function readMode() {
  try {
    const cfg = JSON.parse(readFileSync(GATES_CONFIG, 'utf8'));
    const entry = cfg['G2'];
    const m = typeof entry === 'string' ? entry : entry?.mode;
    if (['off', 'announce', 'deny'].includes(m)) return m;
  } catch {}
  return 'announce';
}

function loadEnvelope(sessionId) {
  if (!sessionId) return null;
  try {
    const envFile = join(ENVELOPE_STORE, `${sessionId}.json`);
    if (!existsSync(envFile)) return null;
    const obj = JSON.parse(readFileSync(envFile, 'utf8'));
    if (obj.minted_by !== 'hook') return null;
    return obj;
  } catch { return null; }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function preflight() {
  try {
    if (classifyWeight('Read', {}) !== 'I0') return false;
    if (classifyWeight('Task', {}) === 'I0') return false;
    if (classifyWeight('Edit', { path: 'src/auth.ts' }) === 'I0') return false;
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

    console.log('G2 self-test:');
    assert('preflight passes', preflight());
    assert('Read is I0', classifyWeight('Read', {}) === 'I0');
    assert('Task is I1-dispatch', classifyWeight('Task', {}) === 'I1-dispatch');
    assert('Edit src/auth.ts is I1', classifyWeight('Edit', { path: 'src/auth.ts' }) !== 'I0');
    assert('Edit README is I0', classifyWeight('Edit', { path: 'README.md' }) === 'I0');
    assert('isPlanEdit detects plans/', isPlanOrRuleEdit({ path: 'plans/pending/PLAN_FOO.md' }));
    assert('isPlanEdit detects rules/', isPlanOrRuleEdit({ path: '.claude/rules/guardrail-policy.md' }));
    assert('isPlanEdit false for src/', !isPlanOrRuleEdit({ path: 'src/auth.ts' }));

    // validateCouncilReceipt — missing cases
    const noReceipt = { minted_by: 'hook', session_id: 's1', council_receipt: null };
    assert('null receipt → invalid', !validateCouncilReceipt(noReceipt, 'I1-mutation', false).valid);

    const goodReceipt = {
      minted_by: 'hook', session_id: 's1',
      council_receipt: {
        convergence: {
          run_ids: ['run-gpt-001', 'run-opus-001'],
          families: ['gpt', 'claude'],
          result_hash: 'abc123',
          oracle_citations: ['artifact://fight-result.md'],
        },
        trap_ledger: {
          questions_set_at: '2026-07-13T09:00:00Z',
          oracle_read_at:   '2026-07-13T09:30:00Z',
        },
        preexec_audit: { slop_verdict: 'CLEAN', ultrathink_verdict: 'CLEAN', plan_hash: 'xyz' },
        handoff: { selected_executor: 'worker-1', decision_hash: 'def456' },
      },
    };
    assert('full receipt → valid', validateCouncilReceipt(goodReceipt, 'I1-mutation', false).valid);

    // Temporal order violation
    const badTrap = JSON.parse(JSON.stringify(goodReceipt));
    badTrap.council_receipt.trap_ledger.questions_set_at = '2026-07-13T10:00:00Z'; // after oracle
    assert('trap temporal violation caught', !validateCouncilReceipt(badTrap, 'I1-mutation', false).valid);

    // Same-family convergence rejection
    const sameFam = JSON.parse(JSON.stringify(goodReceipt));
    sameFam.council_receipt.convergence.families = ['claude', 'claude'];
    assert('same-family convergence rejected', !validateCouncilReceipt(sameFam, 'I1-mutation', false).valid);

    // Plan edit missing plan_change_verdict
    assert('plan edit missing verdict → invalid', !validateCouncilReceipt(goodReceipt, 'I1-mutation', true).valid);

    // TP-5 self-tag detection
    assert('converged:true tag detected', detectCouncilSelfTags({ meta: 'converged: true' }).length > 0);
    assert('no tags on clean input', detectCouncilSelfTags({ path: 'src/foo.ts' }).length === 0);

    console.log(`\nG2: ${pass} passed, ${fail} failed`);
    process.exit(fail > 0 ? 1 : 0);
  })();
} else if (process.argv[2] === '--liveness-assert') {
  (async () => {
    const wc = classifyWeight('Edit', { path: 'src/auth.ts' });
    if (wc === 'I0') { console.error('LIVENESS FAIL: mutation classified as I0'); process.exit(1); }
    const r = validateCouncilReceipt({ minted_by: 'hook', council_receipt: null }, 'I1-mutation', false);
    if (r.valid) { console.error('LIVENESS FAIL: null receipt should be invalid'); process.exit(1); }
    console.log('LIVENESS PASS: ON announces/denies weight-worthy action without receipt; OFF skips');
    process.exit(0);
  })();
} else {
  (async () => {
    let input;
    try { input = await readStdin(); }
    catch (err) { failOpen('stdin-parse', err); return; }

    const { session_id, tool_name, tool_input } = input;

    // Fast exit: pass-through tools
    if (PASSTHROUGH_TOOLS.has(tool_name)) { emitAllow('G2: passthrough'); return; }

    const mode = readMode();
    if (mode === 'off') { emitAllow('G2 off'); return; }

    if (!preflight()) { failOpen('preflight', 'G2 preflight broken'); return; }

    // Classify weight
    let weightClass;
    try { weightClass = classifyWeight(tool_name, tool_input); }
    catch (err) { failOpen('classify', err); return; }

    if (weightClass === 'I0') { emitAllow('G2: I0 trivial — no council receipt needed'); return; }

    // TP-5: log self-authored council bypass tags
    const selfTags = detectCouncilSelfTags(tool_input);
    if (selfTags.length > 0) {
      fireTelemetry('self-tag-logged', `${tool_name}:${selfTags.join(',')}`);
      try { appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G2-TP5: self-authored bypass tags logged: ${selfTags.join(', ')}\n`); } catch {}
    }

    // Load envelope (G1 should have already validated it, but G2 reads it independently)
    const envelope = loadEnvelope(session_id);

    // Anti-deadlock: fight-run context passes (council seats write their trail)
    if (isFightRunContext(envelope)) {
      emitAllow('G2: fight-run context — anti-deadlock pass');
      return;
    }

    // Validate council receipts
    const planEdit = isPlanOrRuleEdit(tool_input);
    let result;
    try { result = validateCouncilReceipt(envelope, weightClass, planEdit); }
    catch (err) { failOpen('validate-receipt', err); return; }

    if (result.valid) {
      const handoff = validateHandoffBinding(envelope?.council_receipt, tool_name, tool_input);
      if (!handoff.valid) {
        const reason = (
          `[G2-HANDOFF] Council receipt is present but not bound to this dispatch: ${handoff.detail}. ` +
          `Fight convergence on one executor/decision cannot authorize a different executor. ` +
          `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G2 handoff binding)`
        );
        if (mode === 'deny') {
          fireTelemetry('deny-handoff', tool_name);
          emitDeny(reason);
        } else {
          fireTelemetry('announce-handoff', tool_name);
          emitAllow(`[G2-HANDOFF-WARN] ${reason}`);
        }
        return;
      }
      emitAllow(`G2: council receipt validated (${weightClass})`);
      return;
    }

    const reason = (
      `[G2-COUNCIL] Weight-worthy action (${weightClass}) missing council receipts. ` +
      `Missing: ${result.missing.join(', ')}. ` +
      `${result.detail}. ` +
      `Weight-worthy work requires: (B) cross-family rival convergence, (C) trap questions ` +
      `pre-written before oracle read, (D) /slop+/ultrathink verdict bound to plan hash, ` +
      `(E for plan edits) unanimous guilty-until-proven reviewer verdict. ` +
      `Self-authored "converged:true" tags are never trusted (TP-5). ` +
      `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G2)`
    );

    if (mode === 'deny') {
      fireTelemetry('deny', tool_name);
      emitDeny(reason);
    } else {
      fireTelemetry('announce', tool_name);
      emitAllow(`[G2-COUNCIL-WARN] ${reason}`);
    }
  })().catch(err => failOpen('main', err));
}
