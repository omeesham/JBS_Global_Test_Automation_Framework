#!/usr/bin/env node
// check-plan-closure.mjs — PreToolUse hook lib for plan-closure enforcement.
//
// MODES (dispatched by argv[2]):
//
//   --edit-mode   PreToolUse on Edit|Write|NotebookEdit.
//                 1. Lock-path check FIRST (B1) — DENY if target is lock path.
//                 2. Plan-path filter — only plans/{pending,done}/*.md.
//                 3. Project post-edit body.
//                 4. Detect Status: DONE via parseField.
//                 5. Pipe to validate-plan-closure.mjs --content-from-stdin --json.
//                 6. Validator exit 0 → allow. Exit 1 → DENY.
//                 7. V5 fail-CLOSED for plan/lock paths.
//
//   --bash-mode   PreToolUse on Bash|mcp__Claude_in_Chrome__*.
//                 Hard-deny on lock-path mention with read-only allowlist (V1+NV1).
//
//   --self-test   Synthetic fixture tests.
//
// Fail-CLOSED for plan-paths + lock-paths (V5).
// Fail-OPEN only for unrelated paths.

import { readFileSync, existsSync, appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, basename } from 'node:path';
import { execSync } from 'node:child_process';
import { fireTelemetry } from './hook-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const STATE_DIR = join(REPO_ROOT, '.claude', 'state');
const FAILURE_LOG = join(STATE_DIR, 'hook-failures.log');
const GATE_FIRES_LOG = join(STATE_DIR, 'gate-fires.log');
const ATTEMPTS_DIR = join(STATE_DIR, 'closure-attempts');
const VALIDATOR_PATH = join(REPO_ROOT, 'scripts', 'validate-plan-closure.mjs');

const LOCK_PATH_RX = /\.claude[\/\\]closure-overrides(?:\.schema)?\.json|\.claude[\/\\]closure-overrides-authors\.txt|\.claude[\/\\]closure-gate-landed-at\.txt|plans[\/\\]_closure_manifests[\/\\][^\s'"]+\.manifest\.json/i;

const PLAN_PATH_RX = /^plans[\/\\](pending|done)[\/\\][^\/\\]+\.md$/;

const READ_ONLY_PREFIX_RX = /^\s*(cat\s|type\s|Get-Content\s|git\s+show\s|git\s+cat-file\s|git\s+diff\s|git\s+log\s|git\s+status\b|ls\s|dir\s|Test-Path\s)/i;

const WRITE_OP_RX = /(>\s|>>\s|\|\s*tee\b|Tee-Object|Set-Content|Add-Content|Out-File|New-Item|Move-Item|Copy-Item|mv\s|cp\s|sed\s+.*-i\b|cat\s+>|cat\s+>>|\[(?:IO|System\.IO)\.File\]::Write|fs\.writeFile|fs\.appendFile|require\(.fs.\)\.write)/i;

const MUTATION_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit']);

// === Reused from plans-reindex.mjs:55-73 (byte-exact) ===
function cleanValue(raw) {
  if (!raw) return '';
  return raw
    .replace(/^\*+|\*+$/g, '')
    .replace(/^`|`$/g, '')
    .split('|')[0]
    .trim();
}

function parseField(header, label) {
  const re = new RegExp(
    `(?:^|\\n)\\s*(?:\\*\\*)?${label}(?:\\*\\*)?\\s*:\\s*([^\\n]+)`,
    'i',
  );
  const m = header.match(re);
  return m ? cleanValue(m[1]) : '';
}

function ensureStateDir() {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
}

function failOpen(reason) {
  try {
    ensureStateDir();
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} check-plan-closure: ${reason}\n`);
  } catch { /* swallow */ }
  emitAllow();
}

function failClosed(reason, planBasename) {
  try {
    ensureStateDir();
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} check-plan-closure FAIL-CLOSED: ${reason}\n`);
    if (planBasename) {
      const counterFile = join(STATE_DIR, `closure-fail-closed-counter-${planBasename}.json`);
      let counter = 0;
      if (existsSync(counterFile)) {
        try { counter = JSON.parse(readFileSync(counterFile, 'utf-8')).count || 0; } catch { /* start fresh */ }
      }
      writeFileSync(counterFile, JSON.stringify({ count: counter + 1, last: new Date().toISOString() }) + '\n', 'utf-8');
    }
  } catch { /* swallow */ }
  fireTelemetry('check-plan-closure', 'deny', planBasename || 'lock-path');
  emitDeny(`[PLAN-CLOSURE FAIL-CLOSED] Validator error on plan-path or lock-path. ${reason}. This is NOT overridable — fix the underlying issue.`);
}

function emitAllow(reason) {
  const out = { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' } };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
}

function emitDeny(reason) {
  const out = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(out));
}

function recordAttempt(planBasename, result) {
  try {
    if (!existsSync(ATTEMPTS_DIR)) mkdirSync(ATTEMPTS_DIR, { recursive: true });
    const dateStr = new Date().toISOString().slice(0, 10);
    const attemptFile = join(ATTEMPTS_DIR, `${planBasename}-${dateStr}.json`);
    const attempts = existsSync(attemptFile) ? JSON.parse(readFileSync(attemptFile, 'utf-8')) : [];
    attempts.push({ timestamp: new Date().toISOString(), result, source: 'hook' });
    writeFileSync(attemptFile, JSON.stringify(attempts, null, 2) + '\n', 'utf-8');
  } catch { /* swallow */ }
}

function getRelativePath(absPath) {
  const norm = absPath.replace(/\\/g, '/');
  const root = REPO_ROOT.replace(/\\/g, '/');
  if (norm.startsWith(root + '/')) return norm.slice(root.length + 1);
  if (norm.startsWith(root + '\\')) return norm.slice(root.length + 1);
  return norm;
}

function projectBody(toolName, toolInput, targetPath) {
  if (toolName === 'Write') {
    return toolInput.content || '';
  }

  let existing = '';
  try {
    if (existsSync(targetPath)) existing = readFileSync(targetPath, 'utf-8');
  } catch { /* new file */ }

  if (toolName === 'Edit') {
    const oldStr = toolInput.old_string || '';
    const newStr = toolInput.new_string || '';
    if (toolInput.replace_all) {
      return existing.split(oldStr).join(newStr);
    }
    const idx = existing.indexOf(oldStr);
    if (idx === -1) return existing;
    return existing.slice(0, idx) + newStr + existing.slice(idx + oldStr.length);
  }

  return existing;
}

// === C6 announce-mode warning builder (PLAN_DONE_MEANS_DONE Phase 2.2b) ===
// When the validator runs with c6_mode=announce it MEASURES C6 + the C4 parent-cascade
// sub-check but leaves them OUT of the pass/fail verdict. This builds a non-blocking
// stderr warning so ramp-period closures see what would block once c6_mode flips to deny.
function buildC6AnnounceWarning(parsed, planBasename) {
  const checks = parsed.checks || [];
  const c6 = checks.find(c => c.check === 'C6');
  const c4 = checks.find(c => c.check === 'C4');
  const lines = [];
  if (c6 && c6.status === 'FAIL') {
    for (const it of (c6.items || [])) {
      lines.push(`  C6 matrix-delivery [${it.identity || '?'}]: ${it.reason || ''}`);
    }
  }
  if (c4) {
    for (const it of (c4.items || [])) {
      if (/cascade|phantom/i.test(it.status || '')) {
        lines.push(`  C4 parent-cascade: ${it.reason || ''}`);
      }
    }
  }
  if (lines.length === 0) return '';
  return `[PLAN-CLOSURE C6 ANNOUNCE] ${planBasename}: closure ALLOWED (c6_mode=announce) but the matrix/cascade check WOULD FAIL once c6_mode flips to deny. Fix before then:\n${lines.join('\n')}\n`;
}

// === Cx announce-mode warning builder (PLAN_EXHAUSTIVE_WALK_GUARANTEE / LR-062) ===
// Parity with buildC6AnnounceWarning: when coverage_mode=announce the validator MEASURES Cx
// (walk-coverage completeness) but leaves it OUT of the verdict. Surface a non-blocking warning so
// ramp-period closures see what would block once coverage_mode flips to deny.
function buildCoverageAnnounceWarning(parsed, planBasename) {
  const cx = (parsed.checks || []).find(c => c.check === 'Cx');
  if (!cx || cx.status !== 'FAIL') return '';
  const lines = (cx.items || []).map(it =>
    `  Cx walk-coverage [${it.artifact || '?'}]: ${(it.reasons || []).join('; ')}`);
  if (lines.length === 0) return '';
  return `[PLAN-CLOSURE Cx ANNOUNCE] ${planBasename}: closure ALLOWED (coverage_mode=announce) but the walk-coverage completeness check (LR-062) WOULD FAIL once coverage_mode flips to deny. Fix before then:\n${lines.join('\n')}\n`;
}

// === --edit-mode ===
function handleEditMode(payload) {
  const toolName = payload.tool_name || payload.toolName || '';
  if (!MUTATION_TOOLS.has(toolName)) {
    emitAllow();
    return;
  }

  const toolInput = payload.tool_input || payload.toolInput || {};
  const targetPath = toolInput.file_path || toolInput.notebook_path || toolInput.path || '';

  if (!targetPath) {
    emitAllow();
    return;
  }

  const relPath = getRelativePath(targetPath);

  // B1 + V1: LOCK-PATHS CHECK FIRST (before any plan-path filter)
  if (LOCK_PATH_RX.test(relPath) || LOCK_PATH_RX.test(targetPath)) {
    fireTelemetry('check-plan-closure', 'deny', relPath);
    emitDeny(`[PLAN-CLOSURE LOCK] "${relPath}" is a closure-gate lock path. Only the user may edit this file directly. Agent writes are denied across both Edit/Write AND Bash matchers (R2).`);
    return;
  }

  // Plan-path filter — only plans/{pending,done}/*.md
  if (!PLAN_PATH_RX.test(relPath)) {
    emitAllow();
    return;
  }

  // V5 fail-CLOSED boundary: from here, any error → fail-CLOSED (not fail-OPEN)
  const planBasename = basename(relPath);

  let projectedBody;
  try {
    projectedBody = projectBody(toolName, toolInput, targetPath);
  } catch (e) {
    failClosed(`Body projection failed: ${e.message}`, planBasename);
    return;
  }

  // Detect Status: DONE via parseField
  const header = projectedBody.slice(0, 2000);
  const status = parseField(header, 'Status');
  if (status.toUpperCase() !== 'DONE') {
    emitAllow();
    return;
  }

  // Pipe projected body to validator
  if (!existsSync(VALIDATOR_PATH)) {
    failClosed('validate-plan-closure.mjs not found', planBasename);
    return;
  }

  try {
    const result = execSync(
      `node "${VALIDATOR_PATH}" --plan "${targetPath}" --content-from-stdin --json`,
      { cwd: REPO_ROOT, encoding: 'utf-8', input: projectedBody, timeout: 30000 },
    );

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      failClosed(`Validator output not JSON: ${result.slice(0, 200)}`, planBasename);
      return;
    }

    if (parsed.status === 'PASS' || parsed.status === 'EXEMPT' || parsed.status === 'SKIP') {
      recordAttempt(planBasename, parsed.status);
      // C6 announce-mode (Phase 2.2b): non-blocking stderr warning if C6 / parent-cascade
      // would fail under deny. Validator already kept them out of the verdict (status PASS).
      if ((parsed.c6_mode || 'off') === 'announce') {
        const announceMsg = buildC6AnnounceWarning(parsed, planBasename);
        if (announceMsg) { fireTelemetry('check-plan-closure', 'announce', planBasename); process.stderr.write(announceMsg); }
      }
      if ((parsed.coverage_mode || 'off') === 'announce') {
        const covMsg = buildCoverageAnnounceWarning(parsed, planBasename);
        if (covMsg) { fireTelemetry('check-plan-closure', 'announce', planBasename); process.stderr.write(covMsg); }
      }
      emitAllow(`Plan closure validation: ${parsed.status}`);
      return;
    }

    recordAttempt(planBasename, 'FAIL');

    const checks = parsed.checks || [];
    const failedChecks = checks.filter(c => c.status === 'FAIL');
    // Validator emits per-check `items` (not `findings`); render reason/token/path/target so
    // the deny message carries actionable detail (fixes a pre-existing empty-detail bug).
    const details = failedChecks.map(c =>
      `${c.check}: ${(c.items || []).map(f =>
        f.reason || f.token || f.path || f.target || (typeof f === 'string' ? f : JSON.stringify(f))
      ).join('; ')}`
    ).join('\n');

    fireTelemetry('check-plan-closure', 'deny', planBasename);
    emitDeny(`[PLAN-CLOSURE FAIL] Status: DONE blocked by closure validation.\n\n${details}\n\nC1 is overridable via .claude/closure-overrides.json (user-only). C2/C3/C4/C5/C6 are NOT overridable — remediate the plan body.`);
  } catch (e) {
    failClosed(`Validator execution error: ${e.message}`, planBasename);
  }
}

// Walk cmd and extract every $(...) interior, recursively, using paren-depth tracking
// so nested $( inside $( are captured at every level.
function extractDollarSubContents(cmd) {
  const results = [];
  let i = 0;
  while (i < cmd.length - 1) {
    if (cmd[i] === '$' && cmd[i + 1] === '(') {
      let depth = 1;
      let j = i + 2;
      while (j < cmd.length && depth > 0) {
        if (cmd[j] === '(') depth++;
        else if (cmd[j] === ')') depth--;
        j++;
      }
      const inner = cmd.slice(i + 2, j - 1);
      results.push(inner);
      results.push(...extractDollarSubContents(inner)); // recurse into inner levels
      i = j;
    } else {
      i++;
    }
  }
  return results;
}

// Extract every command text that could execute in a shell string.
// Structural rule: the following can each introduce a new command —
//   ||  &&  ;  |  \n  & (bare background)  $(...) interior  `...` interior
// ALL of them must be classified to prevent bypass via command substitution or backgrounding.
function extractAllCommandSegments(cmd) {
  // Split on all top-level shell command separators.
  // & alone (background) is treated as a separator; || and && are tried first in alternation
  // so && is never split as two bare &.
  const topLevel = cmd.split(/\|\||&&|[;|\n&]/);

  // Extract $(...) interiors at all nesting depths via paren-depth tracking.
  // Extract `...` backtick substitution interiors (single-depth; backticks don't nest).
  const inner = extractDollarSubContents(cmd);
  const backtickRx = /`([^`]*)`/g;
  let m;
  while ((m = backtickRx.exec(cmd)) !== null) inner.push(m[1]);

  return [...topLevel, ...inner];
}

// === --bash-mode (R2 + V1 + NV1) ===
function handleBashMode(payload) {
  const toolName = payload.tool_name || payload.toolName || '';

  // Only apply to Bash commands, not MCP tools
  if (toolName !== 'Bash') {
    emitAllow();
    return;
  }

  const toolInput = payload.tool_input || payload.toolInput || {};
  const cmd = toolInput.command || '';

  if (!LOCK_PATH_RX.test(cmd)) {
    emitAllow();
    return;
  }

  // Lock path mentioned — extract ALL command segments (top-level separators +
  // command-substitution interiors) and classify every one.
  // A command is read-only only when ALL segments are read-only (no write ops).
  const segments = extractAllCommandSegments(cmd);
  const allReadOnly = segments.every(seg => {
    const trimmed = seg.trim();
    if (!trimmed) return true;
    return READ_ONLY_PREFIX_RX.test(trimmed) && !WRITE_OP_RX.test(trimmed);
  });

  if (allReadOnly) {
    emitAllow('Lock-path read-only inspection allowed');
    return;
  }

  fireTelemetry('check-plan-closure', 'deny', cmd.slice(0, 80));
  emitDeny(`[PLAN-CLOSURE LOCK] Bash command mentions closure-gate lock path. Only read-only inspection commands (cat, type, Get-Content, git show/diff/log/status, ls, dir, Test-Path) without write/redirect operators are allowed. Agent writes to lock paths are denied (R2).`);
}

// === Entry point ===
const mode = process.argv[2] || '';

if (mode === '--self-test') {
  runSelfTest();
} else {
  runHookMode(mode);
}

function runHookMode(modeArg) {
  let stdin = '';
  try {
    stdin = readFileSync(0, 'utf8');
  } catch (e) {
    failOpen(`stdin read failed: ${e.message}`);
    return;
  }

  let payload;
  try {
    payload = JSON.parse(stdin);
  } catch (e) {
    failOpen(`stdin JSON parse failed: ${e.message}`);
    return;
  }

  try {
    if (modeArg === '--edit-mode') {
      handleEditMode(payload);
    } else if (modeArg === '--bash-mode') {
      handleBashMode(payload);
    } else {
      failOpen(`unknown mode: ${modeArg}`);
    }
  } catch (e) {
    failOpen(`${modeArg} threw: ${e.message}`);
  }
}

// === --self-test ===
function runSelfTest() {
  let pass = 0;
  let fail = 0;

  function assert(label, condition) {
    if (condition) {
      pass++;
    } else {
      console.error(`FAIL: ${label}`);
      fail++;
    }
  }

  // Lock-path detection
  assert('LOCK_PATH_RX matches overrides.json',
    LOCK_PATH_RX.test('.claude/closure-overrides.json'));
  assert('LOCK_PATH_RX matches schema.json',
    LOCK_PATH_RX.test('.claude/closure-overrides.schema.json'));
  assert('LOCK_PATH_RX matches authors.txt',
    LOCK_PATH_RX.test('.claude/closure-overrides-authors.txt'));
  assert('LOCK_PATH_RX matches landed-at.txt',
    LOCK_PATH_RX.test('.claude/closure-gate-landed-at.txt'));
  assert('LOCK_PATH_RX matches manifest',
    LOCK_PATH_RX.test('plans/_closure_manifests/SOME_PLAN.md.manifest.json'));
  assert('LOCK_PATH_RX matches backslash paths (NV1)',
    LOCK_PATH_RX.test('.claude\\closure-overrides.json'));

  // Plan-path detection
  assert('PLAN_PATH_RX matches plans/done/*.md',
    PLAN_PATH_RX.test('plans/done/PLAN_X.md'));
  assert('PLAN_PATH_RX matches plans/pending/*.md',
    PLAN_PATH_RX.test('plans/pending/SUBPLAN_Y.md'));
  assert('PLAN_PATH_RX rejects plans/done/subdir/x.md',
    !PLAN_PATH_RX.test('plans/done/subdir/x.md'));
  assert('PLAN_PATH_RX rejects non-plan paths',
    !PLAN_PATH_RX.test('src/foo.ts'));

  // Bash read-only allowlist
  assert('READ_ONLY_PREFIX_RX allows cat',
    READ_ONLY_PREFIX_RX.test('cat .claude/closure-overrides.json'));
  assert('READ_ONLY_PREFIX_RX allows git show',
    READ_ONLY_PREFIX_RX.test('git show HEAD:.claude/closure-overrides.json'));
  assert('READ_ONLY_PREFIX_RX allows type (PowerShell)',
    READ_ONLY_PREFIX_RX.test('type .claude\\closure-overrides.json'));
  assert('READ_ONLY_PREFIX_RX allows Get-Content (PowerShell)',
    READ_ONLY_PREFIX_RX.test('Get-Content .claude\\closure-overrides.json'));
  assert('READ_ONLY_PREFIX_RX allows Test-Path (PowerShell)',
    READ_ONLY_PREFIX_RX.test('Test-Path .claude\\closure-overrides.json'));
  assert('READ_ONLY_PREFIX_RX rejects node -e',
    !READ_ONLY_PREFIX_RX.test('node -e "require(\'fs\').writeFileSync()"'));

  // Write-op detection (V1)
  assert('WRITE_OP_RX catches redirect >',
    WRITE_OP_RX.test('echo "bad" > .claude/closure-overrides.json'));
  assert('WRITE_OP_RX catches Set-Content (PowerShell)',
    WRITE_OP_RX.test('Set-Content .claude\\closure-overrides.json "bad"'));
  assert('WRITE_OP_RX catches Out-File (PowerShell)',
    WRITE_OP_RX.test('"bad" | Out-File .claude\\closure-overrides.json'));
  assert('WRITE_OP_RX catches Tee-Object (PowerShell)',
    WRITE_OP_RX.test('"bad" | Tee-Object .claude\\closure-overrides.json'));
  assert('WRITE_OP_RX catches node fs.writeFile',
    WRITE_OP_RX.test('node -e "fs.writeFile()"'));
  assert('WRITE_OP_RX catches sed -i',
    WRITE_OP_RX.test('sed -i "s/bad/good/" .claude/closure-overrides.json'));
  assert('WRITE_OP_RX catches [IO.File]::Write',
    WRITE_OP_RX.test('[IO.File]::WriteAllText(".claude/closure-overrides.json", "bad")'));

  // Combined: read-only + no write op = allow
  assert('Read-only cat with no write op → would allow',
    READ_ONLY_PREFIX_RX.test('cat .claude/closure-overrides.json') && !WRITE_OP_RX.test('cat .claude/closure-overrides.json'));
  // Combined: read-only prefix BUT with redirect = deny
  assert('cat with redirect → write op detected',
    WRITE_OP_RX.test('cat .claude/closure-overrides.json > /tmp/stolen.json'));

  // parseField
  assert('parseField extracts bold Status',
    parseField('---\n**Status**: DONE\n---', 'Status') === 'DONE');
  assert('parseField extracts plain Status',
    parseField('---\nStatus: DONE\n---', 'Status') === 'DONE');

  // projectBody
  assert('projectBody Write returns content',
    projectBody('Write', { content: 'hello' }, '/tmp/nonexistent') === 'hello');

  console.log(`\ncheck-plan-closure --self-test: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}
