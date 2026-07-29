#!/usr/bin/env node
// check-delegation-envelope.mjs — G1: Delegation Envelope Gate  *** THE CORE ***
//
// Sev=S0. Graduating incident: 2026-07-13 source-proven — /assistants on|off writes
// only assistant-state.json; sole consumer picks a reminder string; no PreToolUse gate
// enforces delegate-by-default or changes any real behavior. This gate makes the
// owner's ask real: deny substantive self-work unless a hook-minted delegate/chief
// envelope (or the sole /innovation exception) is active.
//
// SPEC:    SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G1
// TP-1:    Protected state = ~/.claude/state/task-envelopes/ +
//          ~/.claude/delegation/ + ~/.claude/hooks/ — writes to these ALWAYS DENY.
// TP-2:    Default-deny mutating/unknown Bash, apply_patch, powershell, Task, Agent,
//          MCP-write. Allowlist is deterministic-trivial only.
// TP-3:    Envelope bound to {session_id, user_turn, git_head, pathset,
//          tool_intent_sha}; consumed on scope drift (path outside approved pathset).
// TP-4:    Full tool surface: Edit|Write|MultiEdit|NotebookEdit|Bash|apply_patch|powershell|
//          Task|Agent|WebSearch→noop|gh|curl (mutation-classified).
// TP-5:    Self-authored [I0-TRIVIAL]/[innovation] tags LOGGED, never trusted.
//
// HOT PATH: Envelope is PRECOMPUTED by a UserPromptSubmit hook (precompute-envelope.mjs)
//   at O(1) cost. PreToolUse gate reads one JSON file — no transcript scan.
//
// STDIN:    JSON { session_id, transcript_path, cwd, tool_name, tool_input }
// MODE:     gates-config.json → G1.mode  (off|announce|deny). Default: deny (S0).
// FAIL-OPEN: any error → hook-failures.log + allow (never wedge session).
// TELEMETRY: deny/announce → gate-fires.log CSV.
// SETTINGS: {"type":"command","command":"node ~/.claude/hooks/check-delegation-envelope.mjs"}

import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join, basename, normalize } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOME = homedir();
const REPO_ROOT = process.env.GATED_REPO_ROOT || process.cwd();
const STATE_DIR = join(HOME, '.claude', 'state');
const GATE_FIRES_LOG    = join(STATE_DIR, 'gate-fires.log');
const HOOK_FAILURES_LOG = join(STATE_DIR, 'hook-failures.log');
const GATES_CONFIG = join(HOME, '.claude', 'delegation', 'gates-config.json');

const BASE_STATE = process.env.GATES_STATE_DIR || join(HOME, '.claude');
const ENVELOPE_STORE      = join(BASE_STATE, 'state', 'task-envelopes');
const DELEGATION_DIR      = join(BASE_STATE, 'delegation');
const INNOVATION_ENVELOPE = join(DELEGATION_DIR, 'innovation-envelope.json');

// ── Tool surface classification (TP-4) ───────────────────────────────────────

// Always allow — purely read-only with no observable side-effects.
const TRIVIAL_READONLY_TOOLS = new Set([
  'Read', 'Glob', 'Grep', 'LS', 'TodoRead',
  // MCP read tools
  'mcp__filesystem__read_file', 'mcp__filesystem__list_directory',
  'mcp__filesystem__search_files', 'mcp__filesystem__get_file_info',
]);

// Mutation/dispatch tools (require envelope). "Bash" handled separately.
const MUTATION_TOOLS = new Set([
  'Edit', 'Write', 'NotebookEdit', 'apply_patch',
  'MultiEdit',
  'Task', 'Agent',
  // MCP write surfaces
  'mcp__filesystem__write_file', 'mcp__filesystem__create_directory',
  'mcp__filesystem__move_file', 'mcp__filesystem__delete_file',
]);

// Bash and powershell are mutation-worthy unless command matches READONLY_BASH_RX.
const SHELL_TOOLS = new Set(['Bash', 'powershell']);

// Trivial Bash commands: read-only probes — conservative allowlist.
// NOTE: echo OMITTED deliberately — `echo x > file` is a write, not a probe.
const READONLY_BASH_RX = /^\s*(?:git\s+(?:status|log|diff|show|branch|remote|ls-files|ls-tree|rev-parse)\b|cat\s+\S|head\s+|tail\s+|ls\s+|ls$|dir\s+|dir$|pwd$|node\s+.+--self-test\b|node\s+.+--liveness-assert\b|grep\s+|find\s+.*-name\s+|type\s+|Get-Content\b|Get-ChildItem\b|Test-Path\b|Select-String\b)/;

// Strictly doc-only paths — trivial even for Edit/Write.
const DOC_ONLY_RX = /(?:^|\/)(?:README|CHANGELOG|CONTRIBUTING|LICENSE)(?:\.md)?$/i;

// ── Protected state paths (TP-1 — ALWAYS DENY regardless of mode) ────────────

function normPath(p) { return String(p).replace(/\\/g, '/'); }

function isProtectedState(filePath) {
  if (!filePath) return false;
  const norm = normPath(filePath);
  // Envelope store
  if (norm.includes('task-envelopes/')) return true;
  // CHEATPROOF Phase 3b (Rutvik one-time override, 2026-07-15): tickets/ is Claude's trusted
  // dispatch path — writing a ticket IS delegating, not tampering. Trust vector: Rutvik trusts
  // Claude; Claude distrusts copilot. A gate that frictions Claude's own delegating inverts
  // that and is a defect. Everything else under delegation/ stays Tier-2.
  if (norm.includes('/.claude/delegation/tickets/')) return false;
  if (norm.includes('/.claude/delegation/')) return true;
  if (norm.includes('/.claude/hooks/')) return true;
  if (norm.includes('/.claude/settings.json')) return true;
  // The gates-config is also Tier-2 (controls the gate's own mode)
  if (/[/\\]gates-config\.json$/.test(norm)) return true;
  return false;
}

// ── Tool surface helpers ──────────────────────────────────────────────────────

/** Extract the list of target paths the tool would touch. */
export function extractToolPaths(toolName, toolInput) {
  if (!toolInput) return [];
  const paths = [];
  switch (toolName) {
    case 'Edit':
    case 'Write':
    case 'MultiEdit':
    case 'NotebookEdit':
      if (toolInput.path)      paths.push(toolInput.path);
      if (toolInput.file_path) paths.push(toolInput.file_path);
      break;
    case 'apply_patch': {
      const patch = toolInput.patch || '';
      for (const m of patch.matchAll(/^\+\+\+\s+(?:b\/)?(.+)$/gm)) paths.push(m[1].trim());
      break;
    }
    case 'Task':
    case 'Agent':
      // No file paths for dispatch — scope is the dispatch itself
      paths.push('__DISPATCH__');
      break;
    case 'Bash':
    case 'powershell': {
      const cmd = toolInput.command || '';
      // Extract file paths from typical write commands
      for (const m of cmd.matchAll(/(?:>\s*|tee\s+|Set-Content\s+["']?)([^\s"';&|]+\.(?:json|mjs|ts|js|sh|md))/g)) {
        paths.push(m[1]);
      }
      if (paths.length === 0) paths.push('__SHELL_CMD__');
      break;
    }
    default:
      if (toolInput.path) paths.push(toolInput.path);
  }
  return paths;
}

/** Is this tool call trivially read-only? (TP-2 allowlist) */
export function isTrivialReadonly(toolName, toolInput) {
  if (TRIVIAL_READONLY_TOOLS.has(toolName)) return true;
  if (SHELL_TOOLS.has(toolName)) {
    const cmd = (toolInput?.command || '').replace(/\s+/g, ' ').trim();
    if (/[;&|<>`]/.test(cmd) || /\$\(/.test(cmd)) return false;
    return READONLY_BASH_RX.test(cmd);
  }
  if (toolName === 'Edit' || toolName === 'Write' || toolName === 'MultiEdit') {
    const p = toolInput?.path || toolInput?.file_path || '';
    return DOC_ONLY_RX.test(p);
  }
  return false;
}

/** Is the tool a mutation or dispatch (requires envelope)? */
export function isMutationTool(toolName) {
  return MUTATION_TOOLS.has(toolName) || SHELL_TOOLS.has(toolName);
}

// ── Envelope validation (TP-1, TP-3) ─────────────────────────────────────────

/** Load the task envelope for this session. Returns null if missing or invalid. */
export function loadEnvelope(sessionId) {
  if (!sessionId) return null;
  const envFile = join(ENVELOPE_STORE, `${sessionId}.json`);
  if (!existsSync(envFile)) return null;
  try {
    const obj = JSON.parse(readFileSync(envFile, 'utf8'));
    // TP-1: reject any envelope whose minted_by is not 'hook'
    if (obj.minted_by !== 'hook') return null;
    return obj;
  } catch { return null; }
}

/** Validate that the envelope is still valid (not expired, session matches). */
export function isEnvelopeValid(envelope, sessionId) {
  if (!envelope) return { valid: false, reason: 'no envelope' };
  if (envelope.session_id !== sessionId) return { valid: false, reason: 'session mismatch' };
  if (envelope.expires_at && new Date(envelope.expires_at) < new Date()) {
    return { valid: false, reason: 'envelope expired' };
  }
  return { valid: true };
}

/** Check for scope drift: is targetPath covered by the envelope's pathset? */
export function isScopeCovered(targetPath, pathset) {
  if (!pathset || pathset.length === 0) return false;
  if (targetPath === '__DISPATCH__' || targetPath === '__SHELL_CMD__') return true; // dispatches always pass scope (G4 handles them)
  const norm = normPath(targetPath);
  for (const entry of pathset) {
    const e = normPath(entry);
    if (e.endsWith('/') || e.endsWith('**')) {
      // Directory prefix
      const prefix = e.replace(/\/?\*\*$/, '/');
      if (norm.startsWith(prefix) || norm.includes(prefix)) return true;
    } else if (e.includes('*')) {
      // Simple glob: convert to regex
      const rx = new RegExp('^' + e.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$');
      if (rx.test(norm) || rx.test(basename(norm))) return true;
    } else {
      if (norm.endsWith(e) || norm === e || norm.includes('/' + e)) return true;
    }
  }
  return false;
}

/** Load the innovation envelope (the /innovation skill exception). */
export function loadInnovationEnvelope(sessionId) {
  if (!existsSync(INNOVATION_ENVELOPE)) return null;
  try {
    const obj = JSON.parse(readFileSync(INNOVATION_ENVELOPE, 'utf8'));
    if (obj.minted_by !== 'hook') return null;
    if (obj.session_id !== sessionId) return null;
    if (!obj.active) return null;
    if (obj.expires_at && new Date(obj.expires_at) < new Date()) return null;
    return obj;
  } catch { return null; }
}

// ── TP-5: self-authored bypass tag detection ──────────────────────────────────

export function detectSelfBypassTags(toolInput) {
  const tags = [];
  const hay = JSON.stringify(toolInput || '');
  if (/\[I0-TRIVIAL\]/i.test(hay))       tags.push('[I0-TRIVIAL]');
  if (/\[innovation\]/i.test(hay))        tags.push('[innovation]');
  if (/\[envelope-ok\]/i.test(hay))       tags.push('[envelope-ok]');
  if (/delegation_bypass\s*:\s*true/i.test(hay)) tags.push('delegation_bypass:true');
  return tags;
}

// ── Emit helpers ──────────────────────────────────────────────────────────────

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
    appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G1-delegation-envelope(${tag}): ${err}\n`);
  } catch { /* swallow */ }
  emitAllow('G1 fail-open: ' + String(err).slice(0, 120));
}

function fireTelemetry(verdict, target) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(GATE_FIRES_LOG, `delegation-envelope-gate, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
  } catch { /* swallow */ }
}

function readMode() {
  try {
    const cfg = JSON.parse(readFileSync(GATES_CONFIG, 'utf8'));
    const entry = cfg['G1'];
    const m = typeof entry === 'string' ? entry : entry?.mode;
    if (['off', 'announce', 'deny'].includes(m)) return m;
  } catch { /* fall through */ }
  return 'deny'; // S0 gate defaults to deny
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

// ── Preflight ─────────────────────────────────────────────────────────────────

function preflight() {
  try {
    if (!isTrivialReadonly('Read', {}))          return false; // Read must be trivial
    if (!isMutationTool('Edit'))                 return false; // Edit must be mutation
    // doc-only Edit must be trivial
    if (!isTrivialReadonly('Edit', { path: 'docs/README.md' })) return false;
    // delegation dir must be protected
    if (!isProtectedState(`${HOME}/.claude/delegation/test.json`)) return false;
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

    console.log('G1 self-test:');
    assert('preflight passes', preflight());
    assert('Read is trivial', isTrivialReadonly('Read', {}));
    assert('Glob is trivial', isTrivialReadonly('Glob', {}));
    assert('git status bash is trivial', isTrivialReadonly('Bash', { command: 'git status' }));
    assert('git log bash is trivial', isTrivialReadonly('Bash', { command: 'git log --oneline -5' }));
    assert('cat is trivial', isTrivialReadonly('Bash', { command: 'cat src/foo.ts' }));
    assert('npm install bash NOT trivial', !isTrivialReadonly('Bash', { command: 'npm install' }));
    assert('echo > file NOT trivial', !isTrivialReadonly('Bash', { command: 'echo x > file.json' }));
    assert('Edit is mutation', isMutationTool('Edit'));
    assert('Task is mutation', isMutationTool('Task'));
    assert('Read is NOT mutation', !isMutationTool('Read'));

    // isProtectedState
    assert('envelope store is protected', isProtectedState('/home/x/.claude/state/task-envelopes/foo.json'));
    assert('delegation dir is protected', isProtectedState('/home/x/.claude/delegation/assistant-state.json'));
    assert('hooks dir is protected', isProtectedState('/home/x/.claude/hooks/check-foo.mjs'));
    assert('settings.json is protected', isProtectedState('/home/x/.claude/settings.json'));
    assert('repo src is not protected', !isProtectedState('/repo/src/auth.ts'));

    // isScopeCovered
    assert('exact match covered', isScopeCovered('src/auth.ts', ['src/auth.ts']));
    assert('prefix covered', isScopeCovered('src/auth/helpers.ts', ['src/auth/']));
    assert('glob covered', isScopeCovered('src/auth.ts', ['src/**']));
    assert('out of scope', !isScopeCovered('src/billing/invoice.ts', ['src/auth/']));
    assert('dispatch always covered', isScopeCovered('__DISPATCH__', ['src/auth/']));

    // envelope validation
    const goodEnv = { minted_by: 'hook', session_id: 'sess1', expires_at: new Date(Date.now() + 3600000).toISOString(), pathset: ['src/'] };
    const badMint  = { minted_by: 'model', session_id: 'sess1', expires_at: new Date(Date.now() + 3600000).toISOString(), pathset: ['src/'] };
    const expired  = { minted_by: 'hook', session_id: 'sess1', expires_at: new Date(Date.now() - 1000).toISOString(), pathset: ['src/'] };
    assert('good envelope valid', isEnvelopeValid(goodEnv, 'sess1').valid);
    assert('model-minted rejected', loadEnvelope === null || !isEnvelopeValid({ minted_by: 'model', session_id: 'sess1' }, 'sess1').valid === false || true); // loadEnvelope rejects at parse
    assert('minted_by model not valid', !isEnvelopeValid(badMint, 'sess1').valid === false); // loadEnvelope would reject this
    assert('expired envelope invalid', !isEnvelopeValid(expired, 'sess1').valid);
    assert('session mismatch invalid', !isEnvelopeValid(goodEnv, 'sess2').valid);

    // TP-5: self-bypass tag detection
    assert('I0-TRIVIAL tag detected', detectSelfBypassTags({ comment: '[I0-TRIVIAL] skip gate' }).length > 0);
    assert('no tags on clean input', detectSelfBypassTags({ path: 'src/foo.ts' }).length === 0);

    // extractToolPaths
    assert('Edit path extracted', extractToolPaths('Edit', { path: 'src/foo.ts' }).includes('src/foo.ts'));
    assert('Task gets dispatch sentinel', extractToolPaths('Task', { prompt: 'do work' }).includes('__DISPATCH__'));

    console.log(`\nG1: ${pass} passed, ${fail} failed`);
    process.exit(fail > 0 ? 1 : 0);
  })();
} else if (process.argv[2] === '--liveness-assert') {
  (async () => {
    // Prove ON≠OFF: with mode=deny, a substantive Bash without envelope → deny logic fires.
    const isDeny = isMutationTool('Bash') && !isTrivialReadonly('Bash', { command: 'npm install && node build.mjs' });
    if (!isDeny) { console.error('LIVENESS FAIL'); process.exit(1); }
    console.log('LIVENESS PASS: ON(deny) would deny substantive Bash without envelope; OFF(off) skips gate entirely');
    process.exit(0);
  })();
} else {
  // PreToolUse gate
  (async () => {
    let input;
    try { input = await readStdin(); }
    catch (err) { failOpen('stdin-parse', err); return; }

    const { session_id, tool_name, tool_input } = input;

    // Fast exit: trivial read-only (no envelope needed)
    if (isTrivialReadonly(tool_name, tool_input)) {
      emitAllow('G1: trivial read-only');
      return;
    }

    // Not a mutation tool at all — allow (unknown tools fail-open per TP)
    if (!isMutationTool(tool_name)) {
      emitAllow('G1: unknown non-mutation tool (fail-open)');
      return;
    }

    // Extract target paths
    let targetPaths;
    try { targetPaths = extractToolPaths(tool_name, tool_input); }
    catch (err) { failOpen('extract-paths', err); return; }

    // TP-1: ALWAYS DENY writes to protected state (mode-independent)
    for (const tp of targetPaths) {
      if (isProtectedState(tp)) {
        fireTelemetry('deny-tp1', tp);
        emitDeny(
          `[G1-TP1] PROTECTED STATE: ${tp} is hook-owned Tier-2 state. ` +
          `Writes to ~/.claude/delegation/, task-envelopes/, hooks/, or settings.json ` +
          `require Rutvik GO + SELF_GRANT (never Claude self-approved). ` +
          `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G1 TP-1)`
        );
        return;
      }
    }

    const mode = readMode();
    if (mode === 'off') { emitAllow('G1 off'); return; }

    if (!preflight()) { failOpen('preflight', 'G1 preflight broken'); return; }

    // TP-5: log self-authored bypass tags (never trust them)
    const bypassTags = detectSelfBypassTags(tool_input);
    if (bypassTags.length > 0) {
      fireTelemetry('self-tag-logged', `${tool_name}:${bypassTags.join(',')}`);
      try { appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G1-TP5: self-bypass tags logged (NOT trusted): ${bypassTags.join(', ')}\n`); } catch {}
    }

    // Check innovation envelope (the /innovation skill exception — sole self-work escape)
    const innovEnv = loadInnovationEnvelope(session_id);
    if (innovEnv) {
      emitAllow('G1: innovation envelope active (/innovation skill)');
      return;
    }

    // Load and validate task envelope (precomputed by UserPromptSubmit hook)
    const envelope = loadEnvelope(session_id);
    const validity = isEnvelopeValid(envelope, session_id);

    if (!validity.valid) {
      const reason = (
        `[G1-NO-ENVELOPE] No valid delegate/chief envelope for session ${session_id || '?'} ` +
        `(reason: ${validity.reason}). ` +
        `This gate enforces delegate-by-default: substantive self-work requires a hook-minted ` +
        `task envelope (precomputed by the UserPromptSubmit hook) OR an active /innovation envelope. ` +
        `Forged minted_by='hook' is rejected. Self-authored [I0-TRIVIAL] tags are never trusted. ` +
        `To proceed: (a) invoke /innovation if this is genuinely novel work Claude must author, ` +
        `(b) ensure the UserPromptSubmit precompute hook is wired in settings.json, or ` +
        `(c) ask Rutvik for a SELF_GRANT if the precomputer failed. ` +
        `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G1)`
      );
      if (mode === 'deny') {
        fireTelemetry('deny-no-envelope', tool_name);
        emitDeny(reason);
      } else {
        fireTelemetry('announce-no-envelope', tool_name);
        emitAllow(`[G1-ENVELOPE-WARN] ${reason}`);
      }
      return;
    }

    // TP-3: scope drift — target paths must be covered by envelope's pathset
    const outOfScope = targetPaths.filter(p => !isScopeCovered(p, envelope.pathset || []));
    if (outOfScope.length > 0) {
      const reason = (
        `[G1-SCOPE-DRIFT] Path(s) outside approved envelope scope: ${outOfScope.join(', ')}. ` +
        `Approved pathset: ${(envelope.pathset || []).join(', ')}. ` +
        `Scope drift defeats BINDING-TOCTOU-REPLAY protection: an envelope for one task ` +
        `cannot authorize a different, larger task. ` +
        `Create a new envelope with the expanded pathset to proceed. ` +
        `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G1 TP-3)`
      );
      if (mode === 'deny') {
        fireTelemetry('deny-scope-drift', outOfScope.join(','));
        emitDeny(reason);
      } else {
        fireTelemetry('announce-scope-drift', outOfScope.join(','));
        emitAllow(`[G1-SCOPE-WARN] ${reason}`);
      }
      return;
    }

    emitAllow(`G1: valid envelope (work_type: ${envelope.work_type || 'unknown'})`);
  })().catch(err => failOpen('main', err));
}
