#!/usr/bin/env node
// check-agent-parity.mjs — G4: All-Agent Wrapper Parity Gate
//
// Sev=S1. Graduating incident: 2026-07-13 — raw Task/Agent dispatches observed
// without duty-stack inheritance, nested-depth cap, budget cap, or untrusted-content
// flag. Workers get more permissions than their envelope authorized, and Claude
// self-researches when a grantable worker limb could do it instead.
//
// PURPOSE
//   Every worker/chief/subagent launch (via Task | Agent | copilot-worker.sh) MUST
//   inherit the wrapper parity fields: {duty-stack-hash, tool-denylist, nested-depth-cap,
//   cost-cap, evidence-schema}. Skill-governed tickets carry a methodology bundle.
//   External-content-consuming dispatches carry UNTRUSTED-CONTENT:yes.
//   Every dispatch carries --max-ai-credits from the goal budget.
//
// SPEC:      SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G4
// TP-1:      Agent-dispatch ledger at ~/.claude/state/agent-dispatches/ is protected state.
// TP-2:      Default-deny raw launch outside the envelope wrapper.
// TP-3:      Per-dispatch receipt bound to run_id + session.
// TP-4:      Task | Agent | Bash(copilot-worker.sh dispatch) + result-accept patterns.
// TP-5:      Self-authored "parity-ok", "skip-wrapper" tags LOGGED, never trusted.
//
// STDIN:     JSON { session_id, transcript_path, cwd, tool_name, tool_input }
// MODE:      gates-config.json → G4.mode  (off|announce|deny). Default: announce.
// FAIL-OPEN: any error → hook-failures.log + allow.
// TELEMETRY: deny/announce → gate-fires.log CSV.
// SETTINGS:  {"type":"command","command":"node ~/.claude/hooks/check-agent-parity.mjs"}

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
const ENVELOPE_STORE     = join(BASE_STATE, 'state', 'task-envelopes');
const AGENT_DISPATCH_LOG = join(BASE_STATE, 'state', 'agent-dispatches');

// ── Constants ─────────────────────────────────────────────────────────────────

// Tools that are agent dispatches.
const DISPATCH_TOOLS = new Set(['Task', 'Agent']);

// Max nested depth (spec: "nested-depth cap"). Workers are depth-1; subagents depth-2.
const MAX_NESTED_DEPTH = 2;

// Budget warning threshold (70%) — see spec ask Q.
const BUDGET_WARN_FRACTION = 0.70;

// copilot-worker.sh invocation pattern in Bash commands.
const WORKER_DISPATCH_RX = /copilot-worker\.sh\b|copilot\s+worker\b/i;

// Skill-governed keywords that indicate a methodology bundle is required.
const SKILL_KEYWORD_RX = /(?:\/(execute|rca|bugfix|planning|review|audit|healer|planner|generator|requirements))\b/i;

// Untrusted-content consuming patterns (external sources).
const UNTRUSTED_CONTENT_RX = /(?:tavily|web.search|web.extract|http[s]?:\/\/|--allow-url|external.source|untrusted)/i;

// ── Wrapper parity field names (required in task envelope or tool_input) ─────

const REQUIRED_WRAPPER_FIELDS = [
  'duty_stack_hash',
  'tool_denylist',
  'evidence_schema',
  'nested_depth_cap',
  'cost_cap',
];

// ── Core detection ────────────────────────────────────────────────────────────

/** Is this tool call an agent/worker dispatch? */
export function isDispatch(toolName, toolInput) {
  if (DISPATCH_TOOLS.has(toolName)) return true;
  if ((toolName === 'Bash' || toolName === 'powershell') && toolInput) {
    const cmd = toolInput.command || toolInput.script || '';
    return WORKER_DISPATCH_RX.test(cmd);
  }
  return false;
}

/** Extract dispatch prompt/description from tool_input. */
export function extractDispatchContent(toolName, toolInput) {
  if (!toolInput) return '';
  return [
    toolInput.prompt, toolInput.description, toolInput.task,
    toolInput.command, toolInput.script,
  ].filter(Boolean).join(' ');
}

/** Check if the dispatch is skill-governed (requires methodology bundle). */
export function isSkillGoverned(content) {
  return SKILL_KEYWORD_RX.test(content);
}

/** Check if the dispatch consumes untrusted external content. */
export function consumesUntrustedContent(content) {
  return UNTRUSTED_CONTENT_RX.test(content);
}

/**
 * Validate wrapper parity fields in the tool_input or associated envelope.
 * Returns { valid: true } or { valid: false, missing: [...], detail: '...' }.
 */
export function validateWrapperParity(toolInput, envelope) {
  // Wrapper fields can be in the tool_input itself OR in the envelope (either is fine).
  const source = Object.assign({}, envelope || {}, toolInput || {});
  const hay = JSON.stringify(source);

  const missing = [];
  const details = [];

  for (const field of REQUIRED_WRAPPER_FIELDS) {
    // Check both camelCase and snake_case variants, plus JSON-serialized presence
    const variants = [field, field.replace(/_/g, '-'), field.replace(/_([a-z])/g, (_, c) => c.toUpperCase())];
    const found = variants.some(v => source[v] !== undefined) || variants.some(v => hay.includes(`"${v}"`));
    if (!found) {
      missing.push(field);
      details.push(`missing ${field}: every dispatch must inherit this from the wrapper`);
    }
  }

  // Nested depth cap: value must be ≤ MAX_NESTED_DEPTH
  const depthVal = source.nested_depth_cap ?? source['nested-depth-cap'] ?? source.nestedDepthCap;
  if (depthVal !== undefined && Number(depthVal) > MAX_NESTED_DEPTH) {
    missing.push('nested_depth_cap.value');
    details.push(`nested_depth_cap ${depthVal} exceeds maximum ${MAX_NESTED_DEPTH} — prevents DEADLOCK-IN-DESCENDANTS`);
  }

  // Budget: cost_cap must be present and numeric
  const costVal = source.cost_cap ?? source['cost-cap'] ?? source.costCap ?? source['max-ai-credits'] ?? source.maxAiCredits;
  if (costVal === undefined) {
    if (!missing.includes('cost_cap')) {
      missing.push('cost_cap');
      details.push('cost_cap / --max-ai-credits missing: dispatches must carry a credit budget');
    }
  }

  if (missing.length > 0) {
    return { valid: false, missing, detail: details.join('; ') };
  }
  return { valid: true };
}

/** Validate skill-governed dispatch carries methodology bundle. */
export function validateSkillMethodology(toolInput) {
  const hay = JSON.stringify(toolInput || '');
  if (hay.includes('methodology_bundle') || hay.includes('skill_methodology') || hay.includes('SKILL.md')) {
    return { valid: true };
  }
  return {
    valid: false,
    missing: ['methodology_bundle'],
    detail: 'skill-governed dispatch requires methodology_bundle compiled from SKILL.md — workers cannot invoke /execute directly without parity bundle',
  };
}

/** Check untrusted-content flag presence. */
export function validateUntrustedContent(toolInput) {
  const hay = JSON.stringify(toolInput || '');
  // Handle various serialization forms: key:value, JSON key-value, flag presence
  if (/UNTRUSTED.CONTENT[^:]*:[^"]*"?yes"?/i.test(hay) ||
      /"untrusted_content"\s*:\s*true/.test(hay) ||
      /"untrusted"\s*:\s*true/.test(hay) ||
      /untrusted.content.*yes/i.test(hay)) {
    return { valid: true };
  }
  return {
    valid: false,
    missing: ['UNTRUSTED_CONTENT:yes'],
    detail: 'dispatch consumes external content but lacks UNTRUSTED-CONTENT:yes flag — hostile external content must be explicitly declared (ask P)',
  };
}

/** Detect self-authored parity bypass tags (TP-5). */
export function detectParitySelfTags(toolInput) {
  const tags = [];
  const hay = JSON.stringify(toolInput || '');
  if (/parity.ok/i.test(hay))     tags.push('parity-ok');
  if (/skip.wrapper/i.test(hay))  tags.push('skip-wrapper');
  if (/\[g4-skip\]/i.test(hay))   tags.push('[g4-skip]');
  if (/wrapper_exempt/i.test(hay)) tags.push('wrapper_exempt');
  return tags;
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
    appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G4-agent-parity(${tag}): ${err}\n`);
  } catch {}
  emitAllow('G4 fail-open: ' + String(err).slice(0, 120));
}

function fireTelemetry(verdict, target) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(GATE_FIRES_LOG, `agent-parity-gate, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
  } catch {}
}

function readMode() {
  try {
    const cfg = JSON.parse(readFileSync(GATES_CONFIG, 'utf8'));
    const entry = cfg['G4'];
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
    if (!isDispatch('Task', { prompt: 'do work' })) return false;
    if (isDispatch('Read', {})) return false;
    const r = validateWrapperParity({}, null);
    if (r.valid) return false; // should be invalid with empty input
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

    console.log('G4 self-test:');
    assert('preflight passes', preflight());
    assert('Task is dispatch', isDispatch('Task', {}));
    assert('Agent is dispatch', isDispatch('Agent', {}));
    assert('Read is not dispatch', !isDispatch('Read', {}));
    assert('copilot-worker.sh bash is dispatch', isDispatch('Bash', { command: './copilot-worker.sh --ticket=T1' }));
    assert('normal bash not dispatch', !isDispatch('Bash', { command: 'cat src/foo.ts' }));

    assert('/execute skill-governed', isSkillGoverned('node copilot-worker.sh /execute PLAN_FOO.md'));
    assert('/rca skill-governed', isSkillGoverned('task: /rca investigate failure'));
    assert('normal task not skill-governed', !isSkillGoverned('fix auth bug'));

    assert('tavily untrusted', consumesUntrustedContent('query tavily for external data'));
    assert('http url untrusted', consumesUntrustedContent('fetch https://external.api/data'));
    assert('internal task trusted', !consumesUntrustedContent('run unit tests'));

    // validateWrapperParity
    const fullInput = {
      duty_stack_hash: 'abc123',
      tool_denylist: ['Edit_hooks', 'Write_settings'],
      evidence_schema: 'parity-report-v1',
      nested_depth_cap: 2,
      cost_cap: 100,
    };
    assert('full parity input valid', validateWrapperParity(fullInput, null).valid);
    assert('empty input invalid', !validateWrapperParity({}, null).valid);
    assert('over-depth invalid', !validateWrapperParity({ ...fullInput, nested_depth_cap: 5 }, null).valid);

    // validateSkillMethodology
    assert('methodology bundle valid', validateSkillMethodology({ methodology_bundle: { skill: 'execute', steps: [] } }).valid);
    assert('no bundle invalid', !validateSkillMethodology({ prompt: 'do /execute work' }).valid);

    // validateUntrustedContent
    assert('UNTRUSTED-CONTENT:yes valid', validateUntrustedContent({ 'UNTRUSTED-CONTENT': 'yes' }).valid);
    assert('untrusted_content:true valid', validateUntrustedContent({ untrusted_content: true }).valid);
    assert('missing flag invalid', !validateUntrustedContent({ prompt: 'fetch external data' }).valid);

    // detectParitySelfTags
    assert('parity-ok tag detected', detectParitySelfTags({ note: 'parity-ok skip this' }).length > 0);
    assert('no tags on clean input', detectParitySelfTags({ prompt: 'do work' }).length === 0);

    console.log(`\nG4: ${pass} passed, ${fail} failed`);
    process.exit(fail > 0 ? 1 : 0);
  })();
} else if (process.argv[2] === '--liveness-assert') {
  (async () => {
    const r = validateWrapperParity({}, null);
    if (r.valid) { console.error('LIVENESS FAIL: empty wrapper passed'); process.exit(1); }
    console.log('LIVENESS PASS: ON announces dispatch without parity fields; OFF skips gate');
    process.exit(0);
  })();
} else {
  (async () => {
    let input;
    try { input = await readStdin(); }
    catch (err) { failOpen('stdin-parse', err); return; }

    const { session_id, tool_name, tool_input } = input;

    // Only fires on dispatch tools
    if (!isDispatch(tool_name, tool_input)) {
      emitAllow('G4: not a dispatch');
      return;
    }

    const mode = readMode();
    if (mode === 'off') { emitAllow('G4 off'); return; }

    if (!preflight()) { failOpen('preflight', 'G4 preflight broken'); return; }

    // TP-5: log self-authored bypass tags
    const selfTags = detectParitySelfTags(tool_input);
    if (selfTags.length > 0) {
      fireTelemetry('self-tag-logged', `${tool_name}:${selfTags.join(',')}`);
      try { appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G4-TP5: self-bypass tags logged: ${selfTags.join(', ')}\n`); } catch {}
    }

    const envelope = loadEnvelope(session_id);
    const content = extractDispatchContent(tool_name, tool_input);

    const findings = [];

    // Check wrapper parity fields
    const parityResult = validateWrapperParity(tool_input, envelope);
    if (!parityResult.valid) {
      findings.push(`WRAPPER-PARITY: ${parityResult.detail}`);
    }

    // Check skill methodology bundle for skill-governed tasks
    if (isSkillGoverned(content)) {
      const skillResult = validateSkillMethodology(tool_input);
      if (!skillResult.valid) {
        findings.push(`SKILL-PROXY: ${skillResult.detail}`);
      }
    }

    // Check untrusted-content flag for external-consuming dispatches
    if (consumesUntrustedContent(content)) {
      const untrustedResult = validateUntrustedContent(tool_input);
      if (!untrustedResult.valid) {
        findings.push(`UNTRUSTED-CONTENT: ${untrustedResult.detail}`);
      }
    }

    if (findings.length === 0) {
      emitAllow('G4: wrapper parity validated');
      return;
    }

    const reason = (
      `[G4-PARITY] Agent dispatch missing wrapper compliance fields. ` +
      `Findings: ${findings.join(' | ')}. ` +
      `Every Task/Agent/copilot-worker.sh dispatch must inherit ` +
      `{duty_stack_hash, tool_denylist, nested_depth_cap, cost_cap, evidence_schema} ` +
      `from the wrapper. Skill-governed tickets carry a methodology bundle. ` +
      `External-content dispatches declare UNTRUSTED-CONTENT:yes. ` +
      `Self-authored 'parity-ok' tags are never trusted (TP-5). ` +
      `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G4)`
    );

    if (mode === 'deny') {
      fireTelemetry('deny', tool_name);
      emitDeny(reason);
    } else {
      fireTelemetry('announce', tool_name);
      emitAllow(`[G4-PARITY-WARN] ${reason}`);
    }
  })().catch(err => failOpen('main', err));
}
