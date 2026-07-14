#!/usr/bin/env node
// check-md-first.mjs — MD-first write-time gate (PreToolUse on Edit|Write|NotebookEdit).
//
// Sev=S1 — graduated by the 2026-07-08 MD↔XLSX↔spec parity slip: a spec test()
// whose TC-ID had no MD source row was committed via --no-verify (commit 664ae0cc),
// silently drifting the test-case deliverable from the MD/XLSX source of truth.
//
// PURPOSE
//   Refuses writing a Playwright spec test() whose TC-<MOD>-<SUB>-NNN ID has no
//   matching header row in the module's MD test-case file. MD leads; spec follows.
//
// MODE KNOB (.claude/guardrail-config.json → md_first_mode)
//   off      — no-op (gate disabled)
//   announce — ALLOW + warning + fire telemetry appended to .claude/state/gate-fires.log
//   deny     — DENY the write + fire telemetry
//
// SCOPE (narrow — fast path for non-spec writes)
//   Fires ONLY on clients/*/tests/**/*.spec.ts writes. Non-spec paths exit after a
//   single regex test with no FS I/O (<200ms PreToolUse budget, Phase 3.4).
//   Scans only the NEW content fragment (new_string / content); never inspects old.
//
// PATTERN REUSE
//   TC_ID_RX and MD_HEADER_TC_RX are byte-identical to check-tc-parity.ts TC_PATTERN
//   and MD_HEADER_TC_PATTERN. Keeping them in sync prevents a second parser dialect.
//
// FAIL-OPEN
//   Any uncaught error → one line appended to .claude/state/hook-failures.log, allow.
//   A broken gate must never wedge a session.
//
// TELEMETRY
//   Every deny/announce verdict appends one CSV line to .claude/state/gate-fires.log:
//     md-first-gate, <ISO timestamp>, <verdict>, <target-path>
//
// Companion: .claude/hooks/md-first-gate.sh (thin bash wrapper wired in settings.json).

import { readFileSync, existsSync, mkdirSync, appendFileSync, readdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const STATE_DIR = join(REPO_ROOT, '.claude', 'state');
const FAILURE_LOG = join(STATE_DIR, 'hook-failures.log');
const GATE_FIRES_LOG = join(STATE_DIR, 'gate-fires.log');
const GUARDRAIL_CONFIG = join(REPO_ROOT, '.claude', 'guardrail-config.json');

// TC ID regex — mirrors check-tc-parity.ts TC_PATTERN (identical dialect; no second parser).
const TC_ID_SOURCE = 'TC-[A-Z]+-[A-Z]+-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*';

// MD header regex — mirrors check-tc-parity.ts MD_HEADER_TC_PATTERN.
const MD_HEADER_TC_SOURCE = '^#{2,3}\\s+(TC-[A-Z]+(?:-[A-Z]+){1,3}-(?:\\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*):';

// Spec path — only `clients/*/tests/**/*.spec.ts` triggers the gate.
const SPEC_PATH_RX = /clients\/([^/]+)\/tests\/.+\.spec\.ts$/;

const MUTATION_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit']);

// ── Pure helpers (exported for self-test) ─────────────────────────────────────

export function isSpecPath(filePath) {
  if (!filePath) return false;
  return SPEC_PATH_RX.test(String(filePath).replace(/\\/g, '/'));
}

export function extractClient(filePath) {
  const m = String(filePath).replace(/\\/g, '/').match(SPEC_PATH_RX);
  return m ? m[1] : null;
}

export function extractTcIds(content) {
  const ids = new Set();
  if (!content) return ids;
  for (const m of String(content).matchAll(new RegExp(TC_ID_SOURCE, 'g'))) {
    ids.add(m[0]);
  }
  return ids;
}

export function extractNewContent(toolName, toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return '';
  if (toolName === 'Edit') return typeof toolInput.new_string === 'string' ? toolInput.new_string : '';
  if (toolName === 'Write') return typeof toolInput.content === 'string' ? toolInput.content : '';
  if (toolName === 'NotebookEdit') {
    if (typeof toolInput.new_source === 'string') return toolInput.new_source;
    if (typeof toolInput.content === 'string') return toolInput.content;
  }
  return '';
}

export function scanMdFiles(testCasesDir) {
  const ids = new Set();
  if (!existsSync(testCasesDir)) return ids;
  const pat = new RegExp(MD_HEADER_TC_SOURCE, 'gm');
  const walkDir = (dir) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.name.startsWith('_')) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { walkDir(full); continue; }
      if (!entry.name.endsWith('.md')) continue;
      let content;
      try { content = readFileSync(full, 'utf8'); } catch { continue; }
      pat.lastIndex = 0;
      let m;
      while ((m = pat.exec(content)) !== null) ids.add(m[1]);
    }
  };
  walkDir(testCasesDir);
  return ids;
}

export function readGateMode() {
  try {
    if (!existsSync(GUARDRAIL_CONFIG)) return 'announce';
    const cfg = JSON.parse(readFileSync(GUARDRAIL_CONFIG, 'utf8'));
    const v = cfg.md_first_mode;
    if (v === 'deny' || v === 'announce' || v === 'off') return v;
    return 'announce';
  } catch { return 'announce'; }
}

function toRepoRel(p) {
  if (!p) return '';
  const norm = String(p).replace(/\\/g, '/');
  const root = REPO_ROOT.replace(/\\/g, '/').replace(/\/$/, '');
  if (norm.startsWith(root + '/')) return norm.slice(root.length + 1);
  return norm.replace(/^\.?\//, '');
}

// ── Logging ───────────────────────────────────────────────────────────────────

export function appendToLog(logPath, line) {
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(logPath, line + '\n');
  } catch { /* swallow — logging failure must never wedge a session */ }
}

function fireTelemetry(verdict, targetPath) {
  appendToLog(GATE_FIRES_LOG, `md-first-gate, ${new Date().toISOString()}, ${verdict}, ${toRepoRel(targetPath)}`);
}

// ── Decision engine ────────────────────────────────────────────────────────────

function buildDenyMsg(missing, rel) {
  return (
    `[MD-FIRST BLOCKED] spec write refused — ${missing.length} TC ID(s) have no MD source row: ` +
    `${missing.join(', ')}. Author the test-case header(s) in the module MD file before writing ` +
    `the spec test(). MD-first ensures the deliverable (MD → XLSX) leads the implementation. ` +
    `(Sev=S1; graduating incident: 2026-07-08 parity slip commit 664ae0cc; ` +
    `knob: md_first_mode in .claude/guardrail-config.json)`
  );
}

function buildAnnounceMsg(missing, rel) {
  return (
    `[MD-FIRST WARNING] ${missing.length} TC ID(s) in ${rel} have no MD source row: ` +
    `${missing.join(', ')}. Author the MD header(s) before the spec test() ` +
    `(mode=announce; gate will ramp to deny — see .claude/guardrail-config.json md_first_mode).`
  );
}

/**
 * Core decision. Pure-ish: accepts opts.mdTcIds, opts.mode, opts.skipTelemetry for testing.
 * Returns { allow: boolean, warn?: boolean, missing?: string[], rel?: string, reason?: string }.
 */
export function evaluate(payload, opts = {}) {
  const toolName = payload.tool_name || payload.toolName || '';
  if (!MUTATION_TOOLS.has(toolName)) return { allow: true };

  const toolInput = payload.tool_input || payload.toolInput || {};
  const targetPath = toolInput.file_path || toolInput.path || toolInput.notebook_path || '';

  if (!isSpecPath(targetPath)) return { allow: true };

  const newContent = extractNewContent(toolName, toolInput);
  if (!newContent) return { allow: true };

  const tcIds = extractTcIds(newContent);
  if (tcIds.size === 0) return { allow: true };

  let mdIds;
  if (opts.mdTcIds !== undefined) {
    mdIds = opts.mdTcIds;
  } else {
    const client = extractClient(targetPath);
    if (!client) return { allow: true };
    const testCasesDir = join(REPO_ROOT, 'clients', client, 'specs_planning', 'test-cases');
    mdIds = scanMdFiles(testCasesDir);
  }

  const missing = [...tcIds].filter(id => !mdIds.has(id));
  if (missing.length === 0) return { allow: true };

  const mode = opts.mode !== undefined ? opts.mode : readGateMode();
  if (mode === 'off') return { allow: true };

  const rel = toRepoRel(targetPath);

  if (!opts.skipTelemetry) fireTelemetry(mode === 'deny' ? 'deny' : 'announce', targetPath);

  if (mode === 'deny') {
    return { allow: false, missing, rel, reason: buildDenyMsg(missing, rel) };
  }
  return { allow: true, warn: true, missing, rel, reason: buildAnnounceMsg(missing, rel) };
}

// ── Hook I/O ──────────────────────────────────────────────────────────────────

function emitAllow(reason) {
  const out = { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' } };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
}

function emitDeny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }));
}

function failOpen(reason) {
  appendToLog(FAILURE_LOG, `${new Date().toISOString()} check-md-first.mjs: ${reason}`);
  emitAllow();
}

function runHook() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, 'utf8'));
  } catch (e) {
    failOpen(`stdin parse failed: ${e.message}`);
    return;
  }
  try {
    const result = evaluate(payload);
    if (!result.allow) emitDeny(result.reason);
    else if (result.warn) emitAllow(result.reason);
    else emitAllow();
  } catch (e) {
    failOpen(`evaluate threw: ${e.message}`);
  }
}

// ── Self-test ──────────────────────────────────────────────────────────────────

function runSelfTest() {
  let pass = 0, fail = 0;
  const t = (label, cond) => {
    if (cond) { pass++; }
    else { console.error(`FAIL: ${label}`); fail++; }
  };

  const ABSENT_ID  = 'TC-LOC-CUR-999';
  const PRESENT_ID = 'TC-LOC-CUR-001';
  const MD_IDS = new Set([PRESENT_ID]);

  const makeWritePayload = (filePath, content) => ({
    tool_name: 'Write',
    tool_input: { path: filePath, content },
  });
  const makeEditPayload = (filePath, newStr) => ({
    tool_name: 'Edit',
    tool_input: { file_path: filePath, new_string: newStr },
  });

  const SPEC_PATH  = 'clients/encore/tests/locations/test.spec.ts';
  const OTHER_PATH = 'clients/encore/src/pages/location-currency.ts';
  const specContent = (id) => `test('${id}: some test title', async () => {});`;

  // 1. DENY on spec write with TC ID absent from MD (mode=deny)
  const r1 = evaluate(makeWritePayload(SPEC_PATH, specContent(ABSENT_ID)), {
    mode: 'deny', mdTcIds: MD_IDS, skipTelemetry: true,
  });
  t('deny: absent TC → allow=false',              r1.allow === false);
  t('deny: absent TC → missing list has ID',       r1.missing && r1.missing.includes(ABSENT_ID));
  t('deny: reason includes [MD-FIRST BLOCKED]',   typeof r1.reason === 'string' && r1.reason.includes('[MD-FIRST BLOCKED]'));

  // 2. ANNOUNCE-allow with warning (mode=announce)
  const r2 = evaluate(makeWritePayload(SPEC_PATH, specContent(ABSENT_ID)), {
    mode: 'announce', mdTcIds: MD_IDS, skipTelemetry: true,
  });
  t('announce: absent TC → allow=true',           r2.allow === true);
  t('announce: absent TC → warn=true',            r2.warn === true);
  t('announce: reason includes [MD-FIRST WARNING]', typeof r2.reason === 'string' && r2.reason.includes('[MD-FIRST WARNING]'));

  // 3. Allow when MD row exists
  const r3 = evaluate(makeWritePayload(SPEC_PATH, specContent(PRESENT_ID)), {
    mode: 'deny', mdTcIds: MD_IDS, skipTelemetry: true,
  });
  t('present TC, deny mode → allow=true',         r3.allow === true);
  t('present TC → no warn',                        !r3.warn);

  // 4a. Allow on non-spec path (page object file, not in tests/)
  const r4a = evaluate(makeWritePayload(OTHER_PATH, specContent(ABSENT_ID)), {
    mode: 'deny', mdTcIds: MD_IDS, skipTelemetry: true,
  });
  t('non-spec path → allow=true',                 r4a.allow === true);

  // 4b. Allow when tool is not a mutation tool
  const r4b = evaluate({ tool_name: 'Read', tool_input: { path: SPEC_PATH } }, {
    mode: 'deny', mdTcIds: MD_IDS, skipTelemetry: true,
  });
  t('non-mutation tool → allow=true',             r4b.allow === true);

  // 4c. Allow when no TC IDs in content
  const r4c = evaluate(makeWritePayload(SPEC_PATH, 'import { test } from "@playwright/test";'), {
    mode: 'deny', mdTcIds: MD_IDS, skipTelemetry: true,
  });
  t('no TC IDs in content → allow=true',          r4c.allow === true);

  // Edit tool variant — deny on absent TC
  const r5 = evaluate(makeEditPayload(SPEC_PATH, specContent(ABSENT_ID)), {
    mode: 'deny', mdTcIds: MD_IDS, skipTelemetry: true,
  });
  t('Edit tool: absent TC → deny',                r5.allow === false);

  // mode=off → allow regardless
  const r6 = evaluate(makeWritePayload(SPEC_PATH, specContent(ABSENT_ID)), {
    mode: 'off', mdTcIds: MD_IDS, skipTelemetry: true,
  });
  t('mode=off → allow=true',                      r6.allow === true);
  t('mode=off → no warn',                         !r6.warn);

  // extractTcIds handles multiple IDs and 4-segment IDs
  const extracted = extractTcIds("test('TC-LOC-CUR-001: a') test('TC-LOC-LI-NE-011: b')");
  t('extractTcIds: LOC-CUR-001 extracted',        extracted.has('TC-LOC-CUR-001'));
  t('extractTcIds: LOC-LI-NE-011 extracted',      extracted.has('TC-LOC-LI-NE-011'));
  t('extractTcIds: size=2',                       extracted.size === 2);

  // isSpecPath coverage
  t('isSpecPath: clients/enc/tests/x.spec.ts',    isSpecPath('clients/encore/tests/locations/x.spec.ts'));
  t('isSpecPath: page object → false',            !isSpecPath('clients/encore/src/pages/x.ts'));
  t('isSpecPath: empty → false',                  !isSpecPath(''));
  t('isSpecPath: Windows backslash path',         isSpecPath('clients\\encore\\tests\\locations\\x.spec.ts'));

  // 5. Fail-open: verify appendToLog appends + is readable (uses throwaway temp file, never real log)
  const tmpLog = join(tmpdir(), `md-first-selftest-${process.pid}-${Date.now()}.log`);
  const syntheticMsg = `self-test-${Date.now()}`;
  appendToLog(tmpLog, `${new Date().toISOString()} check-md-first.mjs: ${syntheticMsg}`);
  let logContent = '';
  try { logContent = readFileSync(tmpLog, 'utf8'); } catch { /* ok if missing */ }
  t('fail-open: line appended to log', logContent.includes(syntheticMsg));
  try { unlinkSync(tmpLog); } catch { /* best-effort cleanup */ }

  console.log(`check-md-first self-test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

const modeArg = process.argv[2] || '';
if (modeArg === '--self-test') runSelfTest();
else runHook();
