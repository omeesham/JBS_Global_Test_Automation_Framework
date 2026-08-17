#!/usr/bin/env node
// check-client-surface-write.mjs — client-surface write-time gate (PreToolUse on Edit|Write|NotebookEdit).
//
// Sev=S0 — graduated by the 2026-07-30 client-surface bloat measurement: clients/encore/
// contained a self-nested clients/ dir, 26 loose scratch files, five stray .claude/ state
// dirs, and a 418 MB in-place _internal.zip. Nothing noticed for six months.
//
// PURPOSE
//   Denies agent writes to clients/<id>/ that fall outside a declared allowlist or match
//   one of four proven deny classes (self-nesting, stray dot-dirs, root-level loose files,
//   in-place archives). The four classes are evaluated BEFORE the allowlist so that an
//   allowlisted prefix (e.g. specs_planning/) cannot shield a graduating-incident path
//   like specs_planning/_internal.zip.
//
// MODE KNOB (.claude/guardrail-config.json → client_surface_write_mode)
//   off      — gate disabled (all verdicts allow)
//   announce — A1-A4 deny regardless; allowlist tier allows with reason + fires telemetry
//   deny     — A1-A4 deny; allowlist violations denied + fires telemetry
//   (default on any read error or unknown value: announce)
//   Env CLIENT_SURFACE_MODE overrides the config file (tests rely on this).
//
// DECISION ORDER (load-bearing — do not reorder)
//   Step 0: scope check — non-clients paths exit immediately with no telemetry
//   Step 1: A1-A4 proven classes — deny regardless of mode (mode off disables all)
//   Step 1b: B1 raw-runner-output-tree under specs_planning/ — announce-ramp (honours mode)
//   Step 2: allowlist default-deny — verdict honours mode
//
// FAIL-OPEN
//   Any uncaught error → one line appended to .claude/state/hook-failures.log, allow.
//   A broken gate must never wedge a session.
//
// TELEMETRY
//   Every deny/announce verdict on the allowlist tier appends one CSV line to
//   .claude/state/gate-fires.log: client-surface-write, <ISO>, <verdict>, <target>
//   (A1-A4 denies are structural; they also fire telemetry as 'deny'.)
//
// Companion: .claude/hooks/client-surface-gate.sh (thin bash wrapper wired in settings.json).

import { readFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { fireTelemetry } from './hook-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const STATE_DIR = join(REPO_ROOT, '.claude', 'state');
const FAILURE_LOG = join(STATE_DIR, 'hook-failures.log');
const GUARDRAIL_CONFIG = join(REPO_ROOT, '.claude', 'guardrail-config.json');

const REPO_ROOT_NORM = REPO_ROOT.replace(/\\/g, '/').replace(/\/$/, '');

// ── Allowlist constants ───────────────────────────────────────────────────────

const ALLOWED_DIRS = new Set([
  'src', 'tests', 'config', 'testcases', 'docs', 'specs_planning',
  'reports', 'scripts', 'node_modules', '.auth', '.playwright', '.playwright-cli',
]);

const ALLOWED_ROOT_FILES = new Set([
  'package.json', 'package-lock.json', 'playwright.config.ts', 'tsconfig.json',
  '.gitignore', 'README.md', '.env.e2e', '.env.local', 'CLAUDE.md',
]);

// A2: dot-directory exemptions (directory segments only, never filenames)
const DOT_DIR_EXEMPT = new Set(['.auth', '.playwright', '.playwright-cli']);

// A4: archive extensions
const ARCHIVE_SUFFIXES = ['.zip', '.tar.gz', '.tgz', '.tar', '.7z'];

// ── Gate-mode reader ──────────────────────────────────────────────────────────

export function readGateMode() {
  try {
    const envVal = process.env.CLIENT_SURFACE_MODE;
    if (envVal === 'off' || envVal === 'announce' || envVal === 'deny') return envVal;
    if (!existsSync(GUARDRAIL_CONFIG)) return 'announce';
    const cfg = JSON.parse(readFileSync(GUARDRAIL_CONFIG, 'utf8'));
    const v = cfg.client_surface_write_mode;
    if (v === 'off' || v === 'announce' || v === 'deny') return v;
    return 'announce';
  } catch { return 'announce'; }
}

// ── Pure decision function ────────────────────────────────────────────────────
// No filesystem access inside this function (LR-069 §3.4 ≤200ms PreToolUse budget).

/**
 * Decide whether a write to the given path is allowed.
 * @param {string} rawPath  - repo-relative or absolute path
 * @param {string} mode     - 'off' | 'announce' | 'deny'
 * @returns {{ verdict: 'allow'|'deny', rule: string, reason: string }}
 */
export function decide(rawPath, mode) {
  // Step 0: normalize and scope check
  const norm = String(rawPath || '').replace(/\\/g, '/');
  let rel = norm;
  if (norm.startsWith(REPO_ROOT_NORM + '/')) {
    rel = norm.slice(REPO_ROOT_NORM.length + 1);
  } else if (norm.startsWith('/') || /^[A-Za-z]:\//.test(norm)) {
    // Absolute path that doesn't match REPO_ROOT — out of scope
    return { verdict: 'allow', rule: 'out-of-scope', reason: '' };
  }

  // Must match clients/<id>/<rest>
  const clientsMatch = rel.match(/^clients\/([^/]+)\/(.+)$/);
  if (!clientsMatch) {
    return { verdict: 'allow', rule: 'out-of-scope', reason: '' };
  }

  if (mode === 'off') {
    return { verdict: 'allow', rule: 'gate-off', reason: '' };
  }

  const clientId = clientsMatch[1];
  const rest = clientsMatch[2]; // path after clients/<id>/
  const segments = rest.split('/');
  const basename = segments[segments.length - 1];
  const dirSegments = segments.slice(0, -1); // all except filename

  // Step 1: A1-A4 proven classes — deny regardless of mode
  // (mode off already returned above)

  // A1 — self-nesting: any segment in rest that equals 'clients'
  if (segments.some(seg => seg === 'clients')) {
    fireTelemetry('client-surface-write', 'deny', rel);
    return {
      verdict: 'deny',
      rule: 'A1',
      reason: `[CLIENT-SURFACE A1] Self-nested clients/ directory detected: "${rel}". ` +
        `Writing a clients/ subdirectory inside clients/${clientId}/ recreates the graduating incident. ` +
        `(Sev=S0; graduating incident: 2026-07-30 self-nested clients/ found on disk for six months.)`,
    };
  }

  // A2 — stray dot-directory: any DIRECTORY segment (not filename) starting with '.'
  //       that is not in the exempt set (.auth, .playwright, .playwright-cli)
  for (const seg of dirSegments) {
    if (seg.startsWith('.') && !DOT_DIR_EXEMPT.has(seg)) {
      fireTelemetry('client-surface-write', 'deny', rel);
      return {
        verdict: 'deny',
        rule: 'A2',
        reason: `[CLIENT-SURFACE A2] Stray dot-directory "${seg}" detected in path: "${rel}". ` +
          `Only .auth, .playwright, and .playwright-cli are exempt dot-directories under clients/${clientId}/. ` +
          `(Sev=S0; graduating incident: 2026-07-30 five stray .claude/ state dirs found in clients/encore/.)`,
      };
    }
  }

  // A4 — in-place archive: basename ends with an archive extension,
  //       excluding anything under clients/<id>/reports/
  //       (evaluated before A3 so archive paths at root get the A4 rule, not A3)
  const isUnderReports = rest.startsWith('reports/');
  if (!isUnderReports) {
    for (const ext of ARCHIVE_SUFFIXES) {
      if (basename.endsWith(ext)) {
        fireTelemetry('client-surface-write', 'deny', rel);
        return {
          verdict: 'deny',
          rule: 'A4',
          reason: `[CLIENT-SURFACE A4] Archive written in place: "${rel}". ` +
            `Archiving a tree inside clients/${clientId}/ is the graduating incident class. ` +
            `(Archives under reports/ are exempt — Playwright writes trace.zip there.) ` +
            `(Sev=S0; graduating incident: 2026-07-30 418 MB _internal.zip found in clients/encore/specs_planning/.)`,
        };
      }
    }
  }

  // A3 — new file at client root: depth-1 file whose basename is not in the allowed root set
  if (dirSegments.length === 0) {
    if (!ALLOWED_ROOT_FILES.has(basename)) {
      fireTelemetry('client-surface-write', 'deny', rel);
      return {
        verdict: 'deny',
        rule: 'A3',
        reason: `[CLIENT-SURFACE A3] Loose file at client root: "${rel}". ` +
          `Only these files are allowed directly under clients/${clientId}/: ` +
          `${[...ALLOWED_ROOT_FILES].join(', ')}. ` +
          `(Sev=S0; graduating incident: 2026-07-30 26 loose scratch files found at client root.)`,
      };
    }
  }

  // Step 1b: B1 — raw runner-output tree under specs_planning/
  // Announce-ramp per LR-069 §3.3: honours mode (off=skip, announce=allow+telemetry, deny=deny+telemetry).
  // Targets allure-results/** and test-results/** trees inside specs_planning/ only.
  // trace.zip and other archives are already caught by A4 above; B1 does not duplicate that.
  if (rest.startsWith('specs_planning/')) {
    const hasRunnerDir = segments.some(seg => seg === 'allure-results' || seg === 'test-results');
    if (hasRunnerDir) {
      const b1Reason = `[CLIENT-SURFACE B1] Raw runner-output tree under specs_planning/: "${rel}". ` +
        `Paths matching specs_planning/**/allure-results/** or specs_planning/**/test-results/** are ` +
        `evidence-capture artifacts (637 MB class). Store test output under reports/ instead. ` +
        `(client_surface_write_mode in .claude/guardrail-config.json)`;
      fireTelemetry('client-surface-write', mode === 'deny' ? 'deny' : 'announce', rel);
      if (mode === 'deny') {
        return { verdict: 'deny', rule: 'B1', reason: b1Reason };
      }
      return { verdict: 'allow', rule: 'B1', reason: b1Reason };
    }
  }

  // Step 2: allowlist — reached only when A1-A4 and B1 all pass
  // Depth-1 files checked against root file set; deeper paths checked by top-level dir.
  const topSegment = segments[0];
  const inAllowlist = dirSegments.length === 0
    ? ALLOWED_ROOT_FILES.has(basename)
    : ALLOWED_DIRS.has(topSegment);

  if (inAllowlist) {
    return { verdict: 'allow', rule: 'allowlist', reason: '' };
  }

  // Not in allowlist
  const denyReason = `[CLIENT-SURFACE DENY] Path not in the declared allowlist: "${rel}". ` +
    `Allowed top-level dirs: ${[...ALLOWED_DIRS].join(', ')}. ` +
    `Allowed root files: ${[...ALLOWED_ROOT_FILES].join(', ')}. ` +
    `(client_surface_write_mode in .claude/guardrail-config.json)`;

  const announceReason = `[CLIENT-SURFACE WARN] Path not in declared allowlist: "${rel}". ` +
    `This write will be allowed (mode=announce) but would be blocked in deny mode. ` +
    `Allowed top-level dirs: ${[...ALLOWED_DIRS].join(', ')}. ` +
    `(client_surface_write_mode in .claude/guardrail-config.json)`;

  if (mode === 'deny') {
    fireTelemetry('client-surface-write', 'deny', rel);
    return { verdict: 'deny', rule: 'allowlist', reason: denyReason };
  }

  // announce mode
  fireTelemetry('client-surface-write', 'announce', rel);
  return { verdict: 'allow', rule: 'allowlist', reason: announceReason };
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

function appendToLog(logPath, line) {
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(logPath, line + '\n');
  } catch { /* swallow — logging must never wedge a session */ }
}

function failOpen(reason) {
  appendToLog(FAILURE_LOG, `${new Date().toISOString()} check-client-surface-write.mjs: ${reason}`);
  emitAllow();
}

const MUTATION_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit']);

function runHook() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, 'utf8'));
  } catch (e) {
    failOpen(`stdin parse failed: ${e.message}`);
    return;
  }
  try {
    const toolName = payload.tool_name || payload.toolName || '';
    if (!MUTATION_TOOLS.has(toolName)) { emitAllow(); return; }

    const toolInput = payload.tool_input || payload.toolInput || {};
    const targetPath = toolInput.file_path || toolInput.path || toolInput.notebook_path || '';

    const mode = readGateMode();
    const result = decide(targetPath, mode);

    if (result.verdict === 'deny') {
      emitDeny(result.reason);
    } else if (result.reason) {
      emitAllow(result.reason);
    } else {
      emitAllow();
    }
  } catch (e) {
    failOpen(`decide threw: ${e.message}`);
  }
}

// ── Self-test ──────────────────────────────────────────────────────────────────

async function runSelfTest() {
  const { FIXTURES } = await import('./test-client-surface-fixtures.mjs');

  let pass = 0;
  let fail = 0;

  for (const fx of FIXTURES) {
    const result = decide(fx.path, fx.mode || 'deny');
    const verdictOk = result.verdict === fx.expectedVerdict;
    const ruleOk = fx.expectedRule ? result.rule === fx.expectedRule : true;
    const ok = verdictOk && ruleOk;

    if (ok) {
      console.log(`PASS  ${fx.path}  [${result.rule}]`);
      pass++;
    } else {
      const got = `verdict=${result.verdict} rule=${result.rule}`;
      const want = `verdict=${fx.expectedVerdict}${fx.expectedRule ? ` rule=${fx.expectedRule}` : ''}`;
      console.error(`FAIL  ${fx.path}  got: ${got}  want: ${want}`);
      fail++;
    }
  }

  // Budget assertion: 1000 calls well under 200ms total
  const t0 = Date.now();
  for (let i = 0; i < 1000; i++) decide('clients/encore/src/pages/x.page.ts', 'deny');
  const elapsed = Date.now() - t0;
  const budgetOk = elapsed < 200;
  if (budgetOk) {
    console.log(`PASS  budget: 1000 decide() calls in ${elapsed}ms (<200ms)`);
    pass++;
  } else {
    console.error(`FAIL  budget: 1000 decide() calls took ${elapsed}ms (>=200ms)`);
    fail++;
  }

  console.log(`\nTotal: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (process.argv.includes('--self-test')) {
  runSelfTest().catch(e => {
    console.error('Self-test error:', e.message);
    process.exit(1);
  });
} else {
  runHook();
}
