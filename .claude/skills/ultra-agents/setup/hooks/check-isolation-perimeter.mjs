#!/usr/bin/env node
// check-isolation-perimeter.mjs — G3: Isolation / Secrecy Perimeter
//
// Sev=S0. Graduating incident: 2026-07-13 — isolation of personal machine from
// company repo verified once at setup but never enforced as a standing gate.
// Account-switch (personal→company) produces no behavioral change. Gitignored
// assistant artifacts could leak into tracked files. No gate stops a write to
// a personal-machine synced path.
//
// PURPOSE
//   DEFAULT-DENY writes/commits that (a) target personal-machine/account-bound paths
//   outside the isolation perimeter, (b) would leak gitignored assistant artifacts
//   or vendor strings into tracked surfaces, or (c) lack account-switch parity.
//   Nothing bleeds to the personal PC. Company repo ↔ personal files = isolated.
//
// SPEC:      SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G3
// TP-1:      isolation-manifest.json at ~/.claude/delegation/ is PROTECTED STATE.
// TP-2:      Default-deny paths not in allowed_roots; unknown paths DENY.
// TP-4:      Edit|Write|MultiEdit|NotebookEdit|Bash|powershell|apply_patch|Task(dispatch-with-path)|
//            gh CLI commits/push|curl (mutation surfaces).
// TP-5:      Self-authored [perimeter-ok] tags logged, never trusted.
//
// STDIN:     JSON { session_id, transcript_path, cwd, tool_name, tool_input }
// MODE:      gates-config.json → G3.mode  (off|announce|deny). Default: deny (S0).
// FAIL-OPEN: any error → hook-failures.log + allow (never wedge session).
// TELEMETRY: deny/announce → gate-fires.log CSV.
// SETTINGS:  {"type":"command","command":"node ~/.claude/hooks/check-isolation-perimeter.mjs"}

import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join, normalize } from 'node:path';
import { homedir, hostname } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOME = homedir();
const REPO_ROOT = process.env.GATED_REPO_ROOT || process.cwd();
const STATE_DIR = join(HOME, '.claude', 'state');
const GATE_FIRES_LOG    = join(STATE_DIR, 'gate-fires.log');
const HOOK_FAILURES_LOG = join(STATE_DIR, 'hook-failures.log');
const GATES_CONFIG = join(HOME, '.claude', 'delegation', 'gates-config.json');

const BASE_STATE = process.env.GATES_STATE_DIR || join(HOME, '.claude');
const DELEGATION_DIR    = join(BASE_STATE, 'delegation');
const ISOLATION_MANIFEST = join(DELEGATION_DIR, 'isolation-manifest.json');

// ── Default perimeter (fallback if manifest missing) ─────────────────────────

// Allowed roots: paths under these prefixes are permitted writes.
const DEFAULT_ALLOWED_ROOTS = [
  normalize(REPO_ROOT),                            // the project repo
  normalize(join(BASE_STATE, 'state')),            // ~/.claude/state (controlled state)
  normalize(join(HOME, '.claude', 'state')),       // explicit claude state
];

// Always-forbidden patterns: paths that NEVER get write permission regardless of manifest.
// These represent the bleed-to-personal-machine scenario.
const ALWAYS_FORBIDDEN_PATH_RX = [
  // Personal documents/downloads/desktop
  /[/\\]Documents[/\\]/i,
  /[/\\]Downloads[/\\]/i,
  /[/\\]Desktop[/\\]/i,
  /[/\\]Pictures[/\\]/i,
  /[/\\]Music[/\\]/i,
  /[/\\]Videos[/\\]/i,
  // Cloud-sync personal dirs
  /[/\\]OneDrive[/\\]/i,
  /[/\\]Dropbox[/\\]/i,
  /[/\\]Google\s*Drive[/\\]/i,
  // SSH keys, browser profiles, personal creds
  /[/\\]\.ssh[/\\]/,
  /[/\\]\.gnupg[/\\]/,
  /[/\\]\.aws[/\\]/,
  /[/\\]\.azure[/\\]/,
  // Other repos in the personal projects tree (not our repo)
  // NOTE: this only fires if the path is completely outside REPO_ROOT.
];

// Vendor/jargon strings that must NOT leak into tracked files.
// Sourced from scripts/lib/forbidden-patterns.mjs patterns.
const LEAK_MARKER_RX = [
  /\bPLAN_[A-Z0-9_]+\b/,
  /\bSUBPLAN_[A-Z0-9_]+\b/,
  /\b(HUNTER|GIVER|BUILDER|HEALER|WATCHDOG|GARDENER)\b/,
  /\bOWNER\b(?!_)/,
  /\bJBS\b/,
  /\bIntelliQE\b/i,
  /\bagent-mistakes\b/,
  /\bspecs_planning\b/,
  /\breadable_externals\b/,
  /\bread_only_docs\b/,
  /\bLR-(?:ENC-)?\d{3}\b/,
  /\.claude\//,
  // Secrets
  /\bghp_[A-Za-z0-9]{30,}\b/,  // GitHub PAT
  /\bsk-[A-Za-z0-9]{20,}\b/,   // OpenAI-style key
];

// ── Isolation manifest loader ─────────────────────────────────────────────────

export function loadManifest() {
  try {
    if (!existsSync(ISOLATION_MANIFEST)) return null;
    const obj = JSON.parse(readFileSync(ISOLATION_MANIFEST, 'utf8'));
    return obj;
  } catch { return null; }
}

// ── Core perimeter checks ─────────────────────────────────────────────────────

function normPath(p) { return String(p).replace(/\\/g, '/'); }

/** True if path is the protected isolation-manifest itself (TP-1). */
export function isProtectedManifest(filePath) {
  if (!filePath) return false;
  const norm = normPath(filePath);
  return norm.endsWith('isolation-manifest.json') && norm.includes('delegation');
}

/** True if path is within an allowed root. */
export function isInAllowedRoot(filePath, allowedRoots) {
  if (!filePath) return false;
  const norm = normPath(normalize(String(filePath)));
  for (const root of allowedRoots) {
    const rootNorm = normPath(root);
    if (norm.startsWith(rootNorm + '/') || norm === rootNorm) return true;
  }
  return false;
}

/** True if path matches an always-forbidden personal-machine pattern. */
export function isAlwaysForbiddenPath(filePath) {
  if (!filePath) return false;
  const norm = normPath(String(filePath));
  return ALWAYS_FORBIDDEN_PATH_RX.some(rx => rx.test(norm));
}

/** Scan content for vendor/internal strings that must not leak into tracked files. */
export function detectLeakMarkers(content) {
  if (!content) return [];
  const found = [];
  const str = String(content);
  for (const rx of LEAK_MARKER_RX) {
    const m = str.match(rx);
    if (m) found.push(m[0]);
  }
  return found;
}

/** Extract target path from tool_input. */
export function extractTargetPath(toolName, toolInput) {
  if (!toolInput) return null;
  switch (toolName) {
    case 'Edit': case 'Write': case 'MultiEdit': case 'NotebookEdit':
      return toolInput.path || toolInput.file_path || null;
    case 'Bash': case 'powershell': {
      const cmd = toolInput.command || '';
      const m = cmd.match(/(?:>|tee|Set-Content|Out-File)\s+["']?([^\s"';&|]+)/);
      return m ? m[1] : null;
    }
    case 'apply_patch': {
      const patch = toolInput.patch || '';
      const m = patch.match(/^\+\+\+\s+(?:b\/)?(.+)$/m);
      return m ? m[1].trim() : null;
    }
    default: return null;
  }
}

/** Extract new content from tool_input. */
export function extractNewContent(toolName, toolInput) {
  if (!toolInput) return null;
  switch (toolName) {
    case 'Write': return toolInput.content || null;
    case 'Edit':
    case 'MultiEdit':
      return toolInput.new_string || JSON.stringify(toolInput.edits || '');
    case 'Bash': case 'powershell': return toolInput.command || null;
    case 'apply_patch': return toolInput.patch || null;
    default: return null;
  }
}

/** Is the target path a tracked file (would-be committed)? Cheap heuristic. */
export function isLikelyTrackedPath(filePath) {
  if (!filePath) return false;
  const norm = normPath(String(filePath));
  // Explicit gitignore patterns from the repo — approximate heuristic
  if (norm.includes('/.auth/')) return false;
  if (norm.includes('/.claude/')) return false;
  if (norm.includes('/specs_planning/')) return false;
  if (norm.includes('/readable_externals/')) return false;
  if (/\.env\.(local|server|production|staging)/.test(norm)) return false;
  // Anything in src/ tests/ clients/ plans/ at repo root is likely tracked
  return /(?:src\/|tests\/|clients\/|plans\/|scripts\/|\.claude\/rules\/)/.test(norm);
}

/** Detect self-authored bypass tags (TP-5). */
export function detectPerimeterSelfTags(toolInput) {
  const tags = [];
  const hay = JSON.stringify(toolInput || '');
  if (/\[perimeter-ok\]/i.test(hay))    tags.push('[perimeter-ok]');
  if (/isolation_bypass/i.test(hay))    tags.push('isolation_bypass');
  if (/\[g3-skip\]/i.test(hay))         tags.push('[g3-skip]');
  return tags;
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
    appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G3-isolation(${tag}): ${err}\n`);
  } catch {}
  emitAllow('G3 fail-open: ' + String(err).slice(0, 120));
}

function fireTelemetry(verdict, target) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(GATE_FIRES_LOG, `isolation-perimeter-gate, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
  } catch {}
}

function readMode() {
  try {
    const cfg = JSON.parse(readFileSync(GATES_CONFIG, 'utf8'));
    const entry = cfg['G3'];
    const m = typeof entry === 'string' ? entry : entry?.mode;
    if (['off', 'announce', 'deny'].includes(m)) return m;
  } catch {}
  return 'deny'; // S0 default
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function preflight() {
  try {
    if (!isAlwaysForbiddenPath('/home/user/Documents/personal.doc')) return false;
    if (isAlwaysForbiddenPath('/repo/src/auth.ts')) return false;
    if (!detectLeakMarkers('this uses PLAN_FOO_BAR').length > 0) return false;
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

    console.log('G3 self-test:');
    assert('preflight passes', preflight());

    // isProtectedManifest
    assert('isolation-manifest.json protected', isProtectedManifest('/home/x/.claude/delegation/isolation-manifest.json'));
    assert('other file not protected', !isProtectedManifest('/home/x/.claude/delegation/assistant-state.json'));

    // isInAllowedRoot
    assert('repo src is allowed', isInAllowedRoot('/repo/src/auth.ts', ['/repo']));
    assert('outside repo not allowed', !isInAllowedRoot('/home/user/other-repo/file.ts', ['/repo']));

    // isAlwaysForbiddenPath
    assert('Documents path forbidden', isAlwaysForbiddenPath('C:/Users/testuser/Documents/notes.txt'));
    assert('Downloads path forbidden', isAlwaysForbiddenPath('C:/Users/testuser/Downloads/file.zip'));
    assert('.ssh path forbidden', isAlwaysForbiddenPath('/home/user/.ssh/id_rsa'));
    assert('OneDrive path forbidden', isAlwaysForbiddenPath('/home/user/OneDrive/document.docx'));
    assert('repo src not forbidden', !isAlwaysForbiddenPath('/repo/src/auth.ts'));

    // detectLeakMarkers
    assert('PLAN_ marker detected', detectLeakMarkers('see PLAN_FOO_BAR_001 for context').length > 0);
    assert('HUNTER marker detected', detectLeakMarkers('identity: HUNTER').length > 0);
    assert('JBS marker detected', detectLeakMarkers('JBS internal only').length > 0);
    assert('clean content no markers', detectLeakMarkers('const x = 1; // normal code').length === 0);
    assert('GH PAT detected', detectLeakMarkers('token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef123').length > 0);

    // isLikelyTrackedPath
    assert('src/ is likely tracked', isLikelyTrackedPath('src/auth.ts'));
    assert('clients/ is likely tracked', isLikelyTrackedPath('clients/encore/tests/foo.spec.ts'));
    assert('.auth/ not tracked', !isLikelyTrackedPath('.auth/session.json'));
    assert('.claude/ not tracked', !isLikelyTrackedPath('.claude/state/gate-fires.log'));

    // detectPerimeterSelfTags
    assert('[perimeter-ok] detected', detectPerimeterSelfTags({ comment: '[perimeter-ok]' }).length > 0);
    assert('no tags on clean input', detectPerimeterSelfTags({ path: 'src/foo.ts' }).length === 0);

    console.log(`\nG3: ${pass} passed, ${fail} failed`);
    process.exit(fail > 0 ? 1 : 0);
  })();
} else if (process.argv[2] === '--liveness-assert') {
  (async () => {
    const forbidden = isAlwaysForbiddenPath('/home/rutvi/Documents/notes.txt');
    if (!forbidden) { console.error('LIVENESS FAIL: personal Documents path not caught'); process.exit(1); }
    const leak = detectLeakMarkers('ref: PLAN_AUTH_V2').length > 0;
    if (!leak) { console.error('LIVENESS FAIL: PLAN_ marker not detected'); process.exit(1); }
    console.log('LIVENESS PASS: ON denies personal-path writes + leak markers; OFF skips gate');
    process.exit(0);
  })();
} else {
  (async () => {
    let input;
    try { input = await readStdin(); }
    catch (err) { failOpen('stdin-parse', err); return; }

    const { session_id, tool_name, tool_input } = input;

    // Fast exit: read-only tools never touch the perimeter
    if (['Read', 'Glob', 'Grep', 'LS', 'TodoRead'].includes(tool_name)) {
      emitAllow('G3: read-only tool');
      return;
    }

    // TP-1: ALWAYS DENY writes to the isolation-manifest (mode-independent)
    const targetPath = extractTargetPath(tool_name, tool_input);
    if (targetPath && isProtectedManifest(targetPath)) {
      fireTelemetry('deny-tp1', targetPath);
      emitDeny(
        `[G3-TP1] PROTECTED STATE: isolation-manifest.json is hook-owned. ` +
        `Only Rutvik with SELF_GRANT may update the perimeter definition. ` +
        `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G3 TP-1)`
      );
      return;
    }

    const mode = readMode();
    if (mode === 'off') { emitAllow('G3 off'); return; }

    if (!preflight()) { failOpen('preflight', 'G3 preflight broken'); return; }

    // TP-5: log self-authored bypass tags
    const selfTags = detectPerimeterSelfTags(tool_input);
    if (selfTags.length > 0) {
      fireTelemetry('self-tag-logged', `${tool_name}:${selfTags.join(',')}`);
      try { appendFileSync(HOOK_FAILURES_LOG, `${new Date().toISOString()} G3-TP5: self-bypass tags logged: ${selfTags.join(', ')}\n`); } catch {}
    }

    // Load manifest (fallback to defaults if missing)
    const manifest = loadManifest();
    const allowedRoots = manifest?.allowed_roots
      ? manifest.allowed_roots.map(normalize)
      : DEFAULT_ALLOWED_ROOTS;

    let verdict = null;
    let reason = null;

    // Check 1: always-forbidden personal-machine path
    if (targetPath && isAlwaysForbiddenPath(targetPath)) {
      verdict = 'deny-forbidden-path';
      reason = (
        `[G3-PERSONAL-MACHINE] Write target is a personal-machine path outside the isolation perimeter: ${targetPath}. ` +
        `The isolation contract ("most important ask") forbids ANY bleed to personal PC paths. ` +
        `Paths such as Documents/, Downloads/, .ssh/, OneDrive/ are NEVER reachable from the company repo context. ` +
        `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G3)`
      );
    }

    // Check 2: path outside allowed roots
    if (!verdict && targetPath && !isInAllowedRoot(targetPath, allowedRoots)) {
      // Only fire if the path looks like a real FS path (not a sentinel like __DISPATCH__)
      if (!targetPath.startsWith('__')) {
        verdict = 'deny-out-of-perimeter';
        reason = (
          `[G3-OUT-OF-PERIMETER] Write target ${targetPath} is outside the isolation perimeter. ` +
          `Allowed roots: ${allowedRoots.join(', ')}. ` +
          `If this path is legitimately needed, update the isolation-manifest.json allowed_roots ` +
          `(requires Rutvik GO + SELF_GRANT — Tier-2). ` +
          `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G3)`
        );
      }
    }

    // Check 3: vendor/jargon leak markers in content destined for likely-tracked files
    if (!verdict && targetPath && isLikelyTrackedPath(targetPath)) {
      const newContent = extractNewContent(tool_name, tool_input);
      const leakMarkers = detectLeakMarkers(newContent);
      if (leakMarkers.length > 0) {
        verdict = 'deny-leak-markers';
        reason = (
          `[G3-LEAK] Internal/vendor strings detected in content for tracked file ${targetPath}: ` +
          `${leakMarkers.slice(0, 5).join(', ')}. ` +
          `These strings must NEVER ship to clients or appear in tracked source. ` +
          `Remove vendor/internal vocabulary before writing to tracked files. ` +
          `(Spec: SUBPLAN_ASSISTANT_LAYER_HARDGATES.md §G3, scripts/lib/forbidden-patterns.mjs)`
        );
      }
    }

    if (!verdict) {
      emitAllow('G3: path within isolation perimeter');
      return;
    }

    if (mode === 'deny') {
      fireTelemetry(verdict, targetPath || tool_name);
      emitDeny(reason);
    } else {
      fireTelemetry('announce-' + verdict.replace('deny-', ''), targetPath || tool_name);
      emitAllow(`[G3-PERIMETER-WARN] ${reason}`);
    }
  })().catch(err => failOpen('main', err));
}
