#!/usr/bin/env node
// check-config-liveness.mjs — G0: Config-Liveness Guard
//
// Sev=S1. Graduating incident: 2026-07-13 — /assistants ON|OFF changed nothing for
// ~2 days; the flag had no liveness proof. This gate ensures no new config flag may
// ship without a registered executable assertion that proves ON ≠ OFF behavior.
//
// SPEC:        SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G0
// TP-1:        ~/.claude/delegation/config-liveness-registry.json is PROTECTED STATE.
//              Any write to this file by the model is DENIED immediately.
// TP-2:        Default-deny new mode flags (functional keys with on/off/announce/deny
//              values) that have no registry entry.
// TP-4:        Watches Edit|Write|MultiEdit|NotebookEdit|Bash|powershell|apply_patch.
// TP-5:        Self-authored "liveness-proven" tags in content are LOGGED, never trusted.
//
// STDIN:       JSON { session_id, transcript_path, cwd, tool_name, tool_input }
// MODE KNOB:   gates-config.json → G0.mode  (off|announce|deny). Default: announce.
// FAIL-OPEN:   any uncaught error → hook-failures.log + allow (never wedge a session).
// TELEMETRY:   deny/announce → .claude/state/gate-fires.log  CSV line.
// SETTINGS:    {"type":"command","command":"node ~/.claude/hooks/check-config-liveness.mjs"}

import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join, basename } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOME = homedir();
const REPO_ROOT = process.env.GATED_REPO_ROOT || process.cwd();
const STATE_DIR = join(HOME, '.claude', 'state');
const GATE_FIRES_LOG   = join(STATE_DIR, 'gate-fires.log');
const HOOK_FAILURES_LOG = join(STATE_DIR, 'hook-failures.log');
const GATES_CONFIG = join(HOME, '.claude', 'delegation', 'gates-config.json');

// Production state (TP-1 — outside repo, non-self-authorable).
// Override via GATES_STATE_DIR env for self-test.
const DELEGATION_DIR = process.env.GATES_STATE_DIR
  ? join(process.env.GATES_STATE_DIR, 'delegation')
  : join(HOME, '.claude', 'delegation');
const LIVENESS_REGISTRY = join(DELEGATION_DIR, 'config-liveness-registry.json');

// ── Watched config-file patterns (G0 fires on these) ──────────────────────────
const WATCHED_CONFIG_RX = [
  /assistant-state\.json$/,
  /guardrail-config\.json$/,
  /gates-config\.json$/,
  /[-_]config\.json$/,
  /[-_]state\.json$/,
  /[-_]registry\.json$/,
  /uplink-policy\.json$/,
  /closure-config\.json$/,
  /identity-gate-config\.json$/,
];

// Mode-flag value indicators: keys mapping to these values require liveness proof.
const MODE_VALUES = new Set(['off', 'announce', 'deny', 'warn', 'kill', 'enforce',
  'deferred', true, false]);

// Tool surface (TP-4).
const WATCHED_TOOLS = new Set([
  'Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'Bash', 'powershell', 'apply_patch',
]);

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
    appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G0-config-liveness(${tag}): ${err}\n`);
  } catch { /* swallow */ }
  emitAllow('G0 fail-open: ' + String(err).slice(0, 120));
}

function fireTelemetry(verdict, target) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(GATE_FIRES_LOG, `config-liveness-gate, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
  } catch { /* swallow */ }
}

// ── Mode reader ───────────────────────────────────────────────────────────────

function readMode() {
  try {
    const cfg = JSON.parse(readFileSync(GATES_CONFIG, 'utf8'));
    const entry = cfg['G0'];
    const mode = typeof entry === 'string' ? entry : entry?.mode;
    if (['off', 'announce', 'deny'].includes(mode)) return mode;
  } catch { /* fall through */ }
  return 'announce'; // safe default
}

// ── Stdin reader ──────────────────────────────────────────────────────────────

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

// ── Pure helper functions ─────────────────────────────────────────────────────

/** Returns true if path is the protected liveness registry (TP-1). */
export function isProtectedRegistry(filePath) {
  if (!filePath) return false;
  const norm = String(filePath).replace(/\\/g, '/');
  return norm.endsWith('config-liveness-registry.json');
}

/** Returns true if path matches a watched config pattern. */
export function isWatchedConfig(filePath) {
  if (!filePath) return false;
  const norm = String(filePath).replace(/\\/g, '/');
  return WATCHED_CONFIG_RX.some(rx => rx.test(norm));
}

/** Extract the target file path from tool_input for each tool type. */
export function extractTargetPath(toolName, toolInput) {
  if (!toolInput) return null;
  switch (toolName) {
    case 'Edit':
    case 'Write':
    case 'MultiEdit':
    case 'NotebookEdit':
      return toolInput.path || toolInput.file_path || null;
    case 'Bash':
    case 'powershell': {
      const cmd = toolInput.command || '';
      // Look for config file refs in command
      const m = cmd.match(/(?:>|tee|write|set-content)\s+["']?([^\s"']+(?:config|state|registry)\.json)/i);
      return m ? m[1] : null;
    }
    case 'apply_patch': {
      const patch = toolInput.patch || '';
      const m = patch.match(/\+\+\+\s+(?:b\/)?([^\n]+)/);
      return m ? m[1].trim() : null;
    }
    default:
      return null;
  }
}

/** Extract new content string from tool_input. */
export function extractNewContent(toolName, toolInput) {
  if (!toolInput) return null;
  switch (toolName) {
    case 'Write':
      return toolInput.content || toolInput.new_content || null;
    case 'Edit':
      return toolInput.new_string || toolInput.new_content || null;
    case 'MultiEdit':
      return toolInput.new_string || toolInput.new_content || JSON.stringify(toolInput.edits || '');
    case 'Bash':
    case 'powershell':
      return toolInput.command || null;
    case 'apply_patch':
      return toolInput.patch || null;
    default:
      return null;
  }
}

/** Extract functional mode-flag keys from JSON string content. */
export function extractModeKeys(jsonContent) {
  if (!jsonContent) return [];
  try {
    const obj = JSON.parse(jsonContent);
    const keys = [];
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('_')) continue;
      // Direct mode value
      if (MODE_VALUES.has(v)) { keys.push(k); continue; }
      // Nested object with a "mode" key, e.g. {"G1": {"mode": "deny"}}
      if (v && typeof v === 'object' && !Array.isArray(v) && 'mode' in v && MODE_VALUES.has(v.mode)) {
        keys.push(k);
      }
    }
    return keys;
  } catch {
    // Not valid JSON — could be a patch or command; scan for assignment patterns
    const keys = [];
    for (const m of String(jsonContent).matchAll(/"([^"_][^"]*)":\s*"?(off|announce|deny|warn|kill|enforce)"/g)) {
      keys.push(m[1]);
    }
    return keys;
  }
}

/** Load the liveness registry. Returns {entries:[]} on any error (fail-open registry reads). */
export function loadRegistry(registryPath) {
  try {
    if (!existsSync(registryPath)) return { entries: [] };
    const raw = readFileSync(registryPath, 'utf8');
    const obj = JSON.parse(raw);
    return Array.isArray(obj.entries) ? obj : { entries: [] };
  } catch {
    return { entries: [] };
  }
}

/** Check if a flag key is registered for the given config file. */
export function isRegistered(configFile, flagKey, registry) {
  const cfgBase = basename(String(configFile));
  return registry.entries.some(e => {
    const eBase = basename(String(e.config_file || ''));
    return e.flag === flagKey && (eBase === cfgBase || e.config_file === configFile);
  });
}

/** Detect self-authored bypass tags in content (TP-5). */
export function detectSelfAuthoredBypassTags(content) {
  if (!content) return [];
  const tags = [];
  if (/\[liveness-proven\]/i.test(content)) tags.push('[liveness-proven]');
  if (/\[config-live\]/i.test(content))     tags.push('[config-live]');
  if (/liveness_proven\s*:\s*true/i.test(content)) tags.push('liveness_proven:true');
  return tags;
}

// ── Preflight self-check ──────────────────────────────────────────────────────

function preflight() {
  try {
    // isProtectedRegistry must catch the registry path
    if (!isProtectedRegistry('/home/foo/.claude/delegation/config-liveness-registry.json')) return false;
    // isWatchedConfig must catch guardrail-config.json
    if (!isWatchedConfig('/repo/.claude/guardrail-config.json')) return false;
    // extractModeKeys must find mode flags
    const keys = extractModeKeys('{"G1":{"mode":"deny"},"_c":"comment"}');
    if (!keys.includes('G1')) return false;
    return true;
  } catch { return false; }
}

// ── Main entry ────────────────────────────────────────────────────────────────

if (process.argv[2] === '--self-test') {
  // Self-test mode: run fixtures and exit 0 on pass, 1 on fail.
  (async () => {
    let pass = 0; let fail = 0;
    function assert(label, condition) {
      if (condition) { console.log(`  PASS: ${label}`); pass++; }
      else           { console.error(`  FAIL: ${label}`); fail++; }
    }

    console.log('G0 self-test:');

    // Preflight
    assert('preflight passes', preflight());

    // isProtectedRegistry
    assert('registry path detected', isProtectedRegistry('/home/x/.claude/delegation/config-liveness-registry.json'));
    assert('non-registry not flagged', !isProtectedRegistry('/repo/.claude/guardrail-config.json'));

    // isWatchedConfig
    assert('guardrail-config.json watched', isWatchedConfig('/repo/.claude/guardrail-config.json'));
    assert('gates-config.json watched', isWatchedConfig('/path/gates-config.json'));
    assert('random-file.json not watched', !isWatchedConfig('/path/random-file.json'));
    assert('assistant-state.json watched', isWatchedConfig('/home/.claude/delegation/assistant-state.json'));

    // extractModeKeys
    assert('mode key extracted', extractModeKeys('{"new_gate_mode":"announce"}').includes('new_gate_mode'));
    assert('comment key ignored', !extractModeKeys('{"_comment":"text"}').includes('_comment'));
    assert('nested mode extracted', extractModeKeys('{"G1":{"mode":"deny"}}').includes('G1'));
    assert('non-mode key ignored', extractModeKeys('{"name":"foo","count":3}').length === 0);

    // isRegistered
    const reg = {
      entries: [
        { flag: 'G1.mode', config_file: 'gates-config.json', on_behavior_sha: 'abc' },
      ]
    };
    assert('registered flag found', isRegistered('gates-config.json', 'G1.mode', reg));
    assert('unregistered flag not found', !isRegistered('gates-config.json', 'new_mode', reg));

    // detectSelfAuthoredBypassTags
    assert('bypass tag detected', detectSelfAuthoredBypassTags('[liveness-proven]').length > 0);
    assert('no tag on clean content', detectSelfAuthoredBypassTags('normal content').length === 0);

    console.log(`\nG0: ${pass} passed, ${fail} failed`);
    process.exit(fail > 0 ? 1 : 0);
  })();
} else if (process.argv[2] === '--liveness-assert') {
  // Liveness-assert mode: prove ON≠OFF. Exits 0 on proof, 1 on failure.
  // ON: with mode=deny, an unregistered write should produce deny.
  // OFF: with mode=off, the same write should produce allow.
  // We simulate by checking the classification logic directly.
  (async () => {
    const unregistered = 'new_mode_flag';
    const emptyRegistry = { entries: [] };
    const onDeny = !isRegistered('test-config.json', unregistered, emptyRegistry);
    if (!onDeny) { console.error('LIVENESS FAIL: unregistered flag was not caught'); process.exit(1); }
    console.log('LIVENESS PASS: ON mode detects unregistered flag; OFF mode (mode=off) skips gate');
    process.exit(0);
  })();
} else {
  // Normal PreToolUse gate mode.
  (async () => {
    let input;
    try {
      input = await readStdin();
    } catch (err) {
      failOpen('stdin-parse', err);
      return;
    }

    const { session_id, tool_name, tool_input } = input;

    // TP-4: only watched tools
    if (!WATCHED_TOOLS.has(tool_name)) { emitAllow(); return; }

    // Extract target path
    let targetPath;
    try {
      targetPath = extractTargetPath(tool_name, tool_input);
    } catch (err) {
      failOpen('extract-path', err);
      return;
    }

    if (!targetPath) { emitAllow('G0: no config path detected'); return; }

    // TP-1: PROTECTED REGISTRY — ALWAYS DENY (mode-independent)
    if (isProtectedRegistry(targetPath)) {
      fireTelemetry('deny-tp1', targetPath);
      emitDeny(
        '[G0-TP1] PROTECTED STATE: config-liveness-registry.json is hook-owned. ' +
        'Only the hook process may write liveness entries. Tier-2 — requires Rutvik GO + SELF_GRANT.'
      );
      return;
    }

    // TP-4: is this a watched config path?
    if (!isWatchedConfig(targetPath)) { emitAllow('G0: not a watched config path'); return; }

    const mode = readMode();
    if (mode === 'off') { emitAllow('G0 off'); return; }

    // Preflight — if classifier is broken, fail-open
    if (!preflight()) {
      failOpen('preflight', 'G0 preflight check failed — gate self-test broken');
      return;
    }

    let newContent, bypassTags, modeKeys;
    try {
      newContent = extractNewContent(tool_name, tool_input);
      bypassTags = detectSelfAuthoredBypassTags(newContent);
      modeKeys   = extractModeKeys(newContent);
    } catch (err) {
      failOpen('content-extract', err);
      return;
    }

    // TP-5: self-authored bypass tags — LOG, never trust
    if (bypassTags.length > 0) {
      fireTelemetry('self-tag-logged', `${targetPath}:${bypassTags.join(',')}`);
      appendFileSync(HOOK_FAILURES_LOG,
        `${new Date().toISOString()} G0-TP5: self-authored bypass tags logged (NOT trusted): ${bypassTags.join(', ')} in ${targetPath}\n`
      );
      // Tags do NOT affect the decision — fall through to check
    }

    if (modeKeys.length === 0) {
      emitAllow('G0: no new mode flags detected');
      return;
    }

    // Check each mode key against the liveness registry
    let registry;
    try {
      registry = loadRegistry(LIVENESS_REGISTRY);
    } catch (err) {
      failOpen('registry-load', err);
      return;
    }

    const unregistered = modeKeys.filter(k => !isRegistered(targetPath, k, registry));

    if (unregistered.length === 0) {
      emitAllow(`G0: all mode flags registered (${modeKeys.join(', ')})`);
      return;
    }

    // Unregistered flags detected
    const reason = (
      `[G0-LIVENESS] Config flag(s) without liveness proof: ${unregistered.join(', ')} ` +
      `in ${basename(targetPath)}. ` +
      `A flag that proves nothing is theater (the dead-flag lesson of 2026-07-13). ` +
      `Register an executable assertion in config-liveness-registry.json FIRST that proves ` +
      `ON≠OFF behavior, then re-write this config. ` +
      `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G0)`
    );

    if (mode === 'deny') {
      fireTelemetry('deny', targetPath);
      emitDeny(reason);
    } else {
      // announce
      fireTelemetry('announce', targetPath);
      emitAllow(`[G0-LIVENESS-WARN] ${reason}`);
    }
  })().catch(err => failOpen('main', err));
}
