// check-dispatch-visibility.mjs — S0 dispatch-visibility gate logic
// LR-069 Sev S0 — deny on landing, no ramp, no knob, no off-switch.
// Graduating incident: 2026-08-14 — a CEO session dispatched workers with shell `&`
// detachment inside foreground Bash calls; no task tracking, no notification.
// S0 rationale: an agent-writable knob on an anti-deception gate lets the gated party
// ungate itself — definitionally self-defeating.
//
// RESIDUAL GAP (M2): Direct process creation outside the wrapper ledger cannot be fully closed
// by source inspection. An encoded child-process launch (e.g. Node spawnSync called via
// String.fromCharCode or a base64-decoded Buffer) that carries no literal keyword signature
// will pass this gate undetected. This is why two independent layers exist (preventive
// PreToolUse + detective Stop-hook reconciliation) and why neither layer may be described as
// complete on its own. Do not interpret a clean pass from either layer as proof that no
// invisible dispatch occurred.

import { existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { fireTelemetry } from './hook-utils.mjs';

// A5 — files the gate itself protects from deletion/overwrite/rename.
const PROTECTED_PATHS = [
  '.claude/settings.json',
  '.claude/hooks/dispatch-visibility-gate.sh',
  '.claude/hooks/lib/check-dispatch-visibility.mjs',
  '.claude/hooks/visibility-reconcile.sh',
  '.claude/hooks/lib/check-visibility-reconcile.mjs',
];

// A5-L — write-protected ledger path. Separated from PROTECTED_PATHS to avoid
// ancestor-aware matching (a token like `.claude/state` would false-deny via the
// p.startsWith(ct+'/') ancestor rule). Exact-match and endsWith only.
const LEDGER_PROTECTED_PATHS = [
  '.claude/state/ua-worker/ledger.jsonl',
];

// A5 — containing directories: deletion of these also destroys the gate.
// Note: .claude/state/** telemetry writes are NORMAL and must ALLOW — only .claude/hooks is protected.
const PROTECTED_DIRS = [
  '.claude/hooks',
];

// A1 — executable-name detachment primitives (checked via executableOf per split statement,
// NOT via whole-command regex — prevents false-deny on English words in arguments/comments).
const EXEC_DETACH_NAMES = new Set(['nohup', 'setsid', 'disown', 'coproc', 'at', 'wsl.exe']);

// A1 — executable-position detachment patterns (executable name must match, then pattern
// is tested on the individual statement, not the whole command).
const EXEC_DETACH_PATTERNS = [
  { exec: 'screen',   rx: /\bscreen\s+-d\b/ },
  { exec: 'screen',   rx: /\bscreen\s+-dm\b/ },
  { exec: 'tmux',     rx: /\btmux\s+new\s+-d\b/ },
  { exec: 'tmux',     rx: /\btmux\s+new-session\s+-d\b/ },
  { exec: 'schtasks', rx: /\bschtasks\s+\/create\b/i },
  { exec: 'cmd.exe',  rx: /\bcmd\.exe\s+\/c\s+start\b/i },
  { exec: 'start',    rx: /\bstart\s+\/b\b/i },
  { exec: 'start',    rx: /\bstart\s+""/i },
];

// A1 — syntax-based detachment patterns (not executable names; tested on full command text).
const SYNTAX_DETACH_PATTERNS = [
  /detached\s*:\s*true/,
  /start_new_session\s*=\s*True/,
];

// A1 PowerShell detachment primitives (A4).
// Case policy: pre-lowercased so the single canonicalizePath normalizer can be used on both sides.
const PS_DETACH_TOKENS = ['start-process', 'start-job', '-windowstyle hidden', 'invoke-command -asjob'];

// Destructive filesystem ops for A5 self-protection.
// C3: expanded to cover find -delete, copy-overwrite, language file APIs, directory ops.
const DESTRUCTIVE_BASH = [
  /\brm\b/,
  /\bmv\b/,
  /\bgit\s+checkout\s+--/,
  /\bsed\s+-i\b/,
  /\btruncate\b/,
  />\s*\S/,
  /\bcp\b/,
  /\binstall\b/,
  /-delete\b/,
  /-exec\s+rm\b/,
  /os\.(remove|unlink|rename)\s*\(/,
  /shutil\.(rmtree|move|copy2?)\s*\(/,
  // /i required: normalizeCmd() lowercases the subject; camelCase patterns without /i are dead.
  // Also covers `require('fs').unlinkSync(` form (the 'fs') prefix) alongside plain `fs.unlinkSync(`.
  /(?:\bfs|['"]fs['"]\s*\))\.(unlinkSync|writeFileSync|rmSync|rmdirSync|renameSync)\s*\(/i,
];
const DESTRUCTIVE_PS   = [/Remove-Item/i, /Move-Item/i, /Set-Content/i, /Clear-Content/i, /Rename-Item/i];

// §C — risky markers: commands containing these get fail-CLOSED on internal error.
const RISKY_MARKERS = [
  /\b(bash|sh|zsh|wsl|cmd|powershell|pwsh)\b/i,
  /\bcopilot\b/i,
  /\bnode\b/i,
  /\bpython\b/i,
  /\.claude[\\/]settings\.json/i,
  /dispatch-visibility-gate/i,
  /check-dispatch-visibility/i,
];

// Canonical wrapper repo-relative path (consumed by A2 and the detective reconcile layer).
export const CANONICAL_WRAPPER_PATH = '.claude/skills/ultra-agents/copilot-worker.sh';

// Compute the absolute canonical wrapper path anchored to the repo root (derived from this module's location).
const __gate_dirname = dirname(fileURLToPath(import.meta.url));
const CANONICAL_WRAPPER_ABS = canonicalizePath(resolve(__gate_dirname, '../../..', CANONICAL_WRAPPER_PATH));

/** Check if a canonicalized path resolves to the canonical wrapper (repo-relative or repo-absolute). */
export function isCanonicalWrapper(resolvedPath) {
  if (!resolvedPath) return false;
  return resolvedPath === CANONICAL_WRAPPER_PATH || resolvedPath === CANONICAL_WRAPPER_ABS;
}

// Unified runner family (LR-074 §74.3: one widened rule, not parallel matchers).
// Single-word runners: next token is the target package/binary.
const PACKAGE_RUNNERS = new Set(['npx', 'bunx', 'pnpx']);
// Two-word runners: <manager> <subcommand> <target>.
const TWO_WORD_RUNNERS = {
  'npm':  ['exec'],
  'pnpm': ['dlx', 'exec'],
  'yarn': ['dlx'],
  'bun':  ['x'],
};

/**
 * resolveRunnerTarget — unified resolver for the runner family.
 * Given a token array and the index of the executable token, returns the
 * target token index if the executable is a package runner, or -1 if not.
 * Handles both single-word (npx/bunx/pnpx) and two-word (npm exec, etc.) forms.
 * Skips '--' separators between runner subcommand and target.
 */
function resolveRunnerTarget(tokens, execIdx) {
  const execNorm = canonicalizePath(tokens[execIdx]);
  const execBase = execNorm.split('/').pop() || execNorm;

  if (PACKAGE_RUNNERS.has(execBase)) {
    return execIdx + 1 < tokens.length ? execIdx + 1 : -1;
  }

  const subs = TWO_WORD_RUNNERS[execBase];
  if (subs) {
    const subToken = tokens[execIdx + 1];
    if (subToken && subs.includes(canonicalizePath(subToken))) {
      let targetIdx = execIdx + 2;
      while (targetIdx < tokens.length && tokens[targetIdx] === '--') targetIdx++;
      return targetIdx < tokens.length ? targetIdx : -1;
    }
  }

  return -1;
}

// ── Path helpers (C4) ─────────────────────────────────────────────────────────

/**
 * canonicalizePath — the ONE documented path-normalization function consumed by every
 * path decision in this gate (Edit/Write/NotebookEdit file_path, protected-path sets,
 * canonical-wrapper allow-rule). Replacing the old `normalizeSinglePath` which did not
 * collapse `..` segments.
 *
 * Applied in order:
 *  1. Strip surrounding double or single quotes.
 *  2. Convert all backslashes to forward slashes.
 *  3. Collapse duplicate separators (// → /).
 *  4. Resolve `.` (skip) and `..` (pop previous segment) — prevents traversal bypasses.
 *  5. Strip a leading `./` left after resolution.
 *  6. Case policy: lowercase both subject and expected values (Windows is case-insensitive;
 *     lowercasing BOTH sides avoids the dead-pattern defect where subject is lowercased but
 *     patterns retain mixed case). DESTRUCTIVE_BASH patterns that contain uppercase MUST
 *     carry the /i flag — any pattern without /i must be all-lowercase.
 *
 * Absolute paths are preserved as-is (lowercased); repo-relative paths stay repo-relative
 * with no leading `./`.
 */
export function canonicalizePath(p) {
  if (!p || typeof p !== 'string') return '';
  let s = p.trim();
  // 1. Strip surrounding quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  // 2. Backslash → forward slash
  s = s.replace(/\\/g, '/');
  // 3. Collapse duplicate separators
  s = s.replace(/\/\/+/g, '/');
  // 4. Resolve . and .. segments
  const parts = s.split('/');
  const resolved = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '') {
      // Preserve leading empty string for absolute paths (e.g. '/foo' splits to ['','foo'])
      if (resolved.length === 0) resolved.push('');
      continue;
    }
    if (part === '..') {
      // Do not pop the root sentinel or escape above top
      if (resolved.length > 0 && resolved[resolved.length - 1] !== '' && resolved[resolved.length - 1] !== '..') {
        resolved.pop();
      }
      continue;
    }
    resolved.push(part);
  }
  s = resolved.join('/');
  // 5. Strip leading ./
  if (s.startsWith('./')) s = s.slice(2);
  // 6. Lowercase (Windows case-insensitive policy — apply to both subject and expected values)
  return s.toLowerCase();
}

/**
 * parseDispatchWrapperPath — extract the canonicalized path of the binary/script in
 * executable (or launcher+script) position from a Bash command string.
 *
 * Handles:
 *   - optional `set -o pipefail &&` prefix
 *   - optional `| tee …` trailing suffix
 *   - `bash <script>` / `sh <script>` (shell launcher + script argument)
 *   - `npx <pkg>` / `bunx <pkg>` / `pnpx <pkg>` (package runner + package name)
 *   - bare `<binary>` (first token is the executable itself)
 *
 * Returns the canonicalized path string, or null for empty/unrecognized input.
 * Consumed by the A2 copilot-invocation check (M1) and the B1 reconcile wrapper check.
 */
export function parseDispatchWrapperPath(cmd) {
  if (!cmd || typeof cmd !== 'string') return null;
  let s = cmd.trim();
  // Strip trailing | tee ...
  s = s.replace(/\s*\|\s*tee\s+\S.*$/, '').trim();
  // Strip optional set -o pipefail &&
  s = s.replace(/^set\s+-o\s+pipefail\s*&&\s*/, '').trim();
  const tokens = s.split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const unquote = (t) =>
    (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))
      ? t.slice(1, -1)
      : t;
  const firstNorm = canonicalizePath(unquote(tokens[0]));
  const firstBase = firstNorm.split('/').pop() || firstNorm;
  // Shell launchers: script is token[1]
  if (/^(bash|sh)$/.test(firstBase)) {
    if (tokens.length < 2) return firstNorm;
    return canonicalizePath(unquote(tokens[1]));
  }
  // Unified runner family (single-word and two-word): target is the package/binary token.
  const runnerTargetIdx = resolveRunnerTarget(tokens, 0);
  if (runnerTargetIdx >= 0) {
    return canonicalizePath(unquote(tokens[runnerTargetIdx]));
  }
  // Bare binary/script
  return firstNorm;
}

/**
 * commandHasWrapperInExecutablePosition — split a multi-statement command into
 * individual statements (on newlines, &&, ;, |) then check whether ANY statement
 * invokes the canonical wrapper in executable position.
 *
 * Generalizes over all known real dispatch shapes without special-casing `cd` or
 * `set` by name:
 *   - set -o pipefail && bash .../copilot-worker.sh --run-id X 2>&1 | tee …
 *   - cd <path>\nset -o pipefail && bash .../copilot-worker.sh --run-id X 2>&1 | tee …
 *
 * Leading environment assignments (VAR=value) are skipped when locating the
 * executable so `FOO=bar bash script.sh` resolves correctly.
 *
 * Laundering attacks are preserved: `echo '--run-id X'` and
 * `echo "bash …copilot-worker.sh --run-id X"` both have `echo` in executable
 * position → no match.
 */
export function commandHasWrapperInExecutablePosition(cmd) {
  if (!cmd || typeof cmd !== 'string') return false;
  for (const stmt of splitStatements(cmd)) {
    // Skip leading environment assignments (KEY=VALUE) to find the real executable.
    const tokens = stmt.split(/\s+/).filter(Boolean);
    let execIdx = 0;
    while (execIdx < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[execIdx])) {
      execIdx++;
    }
    if (execIdx >= tokens.length) continue;
    const execStmt = tokens.slice(execIdx).join(' ');
    if (isCanonicalWrapper(parseDispatchWrapperPath(execStmt))) return true;
  }
  return false;
}

// ── §A shared statement-tokenizer primitives ─────────────────────────────────

/**
 * splitStatements — quote-aware statement splitter.
 *
 * Splits a shell command string into individual statements, honoring single
 * quotes, double quotes, backslash escapes, and $'…' ANSI-C quoting. Text
 * inside quotes is NEVER a statement boundary and NEVER an executable position.
 *
 * Recognized statement separators (outside quotes):
 *   newline, ;, &&, ||, |, and bare & (detachment/background operator).
 *
 * Redirect operators that contain & (2>&1, &>, >&2) are NOT treated as
 * separators: a & preceded by > or a digit, or followed by > or -, is a
 * redirect component, not a detachment operator.
 *
 * Returns a trimmed-non-empty string array.
 *
 * Every detector that makes an executable-position decision MUST consume this
 * function — never split the raw command string directly. The structural test
 * STRUCT03–05 enforces this.
 */
export function splitStatements(cmd) {
  if (!cmd || typeof cmd !== 'string') return [];
  const stmts = [];
  let cur = '';
  let i = 0;
  while (i < cmd.length) {
    const c = cmd[i];

    // $'…' ANSI-C quoting — consume whole token as opaque (check before single-quote)
    if (c === '$' && i + 1 < cmd.length && cmd[i + 1] === "'") {
      cur += c + cmd[i + 1]; i += 2;
      while (i < cmd.length) {
        if (cmd[i] === '\\' && i + 1 < cmd.length) { cur += cmd[i] + cmd[i + 1]; i += 2; continue; }
        if (cmd[i] === "'") { cur += cmd[i]; i++; break; }
        cur += cmd[i]; i++;
      }
      continue;
    }

    // Single quotes — no escaping inside
    if (c === "'") {
      cur += c; i++;
      while (i < cmd.length && cmd[i] !== "'") { cur += cmd[i]; i++; }
      if (i < cmd.length) { cur += cmd[i]; i++; }
      continue;
    }

    // Double quotes — backslash escaping inside
    if (c === '"') {
      cur += c; i++;
      while (i < cmd.length) {
        if (cmd[i] === '\\' && i + 1 < cmd.length) { cur += cmd[i] + cmd[i + 1]; i += 2; continue; }
        if (cmd[i] === '"') { cur += cmd[i]; i++; break; }
        cur += cmd[i]; i++;
      }
      continue;
    }

    // Backslash outside quotes — escape next character
    if (c === '\\' && i + 1 < cmd.length) {
      cur += c + cmd[i + 1]; i += 2;
      continue;
    }

    // Newline — always a separator
    if (c === '\r' || c === '\n') {
      stmts.push(cur); cur = ''; i++;
      if (c === '\r' && i < cmd.length && cmd[i] === '\n') i++;
      continue;
    }

    // Semicolon — separator
    if (c === ';') {
      stmts.push(cur); cur = ''; i++;
      continue;
    }

    // & — separator (&&, bare &) or redirect component (&>, 2>&1, >&2)
    if (c === '&') {
      const next = i + 1 < cmd.length ? cmd[i + 1] : '';
      if (next === '&') {
        // && — logical AND separator
        stmts.push(cur); cur = ''; i += 2;
      } else if (next === '>' || next === '-') {
        // &> redirect or &- close fd — not a separator
        cur += c; i++;
      } else {
        // fd redirect like 2>&1 or >&2: cur ends with > or a digit → not a separator
        const lastChar = cur.length > 0 ? cur[cur.length - 1] : '';
        if (lastChar === '>' || /\d/.test(lastChar)) {
          cur += c; i++;
        } else {
          // Bare & — background/detachment separator
          stmts.push(cur); cur = ''; i++;
        }
      }
      continue;
    }

    // | — pipe separator (|) or logical OR separator (||)
    if (c === '|') {
      const next = i + 1 < cmd.length ? cmd[i + 1] : '';
      if (next === '|') {
        stmts.push(cur); cur = ''; i += 2;
      } else {
        stmts.push(cur); cur = ''; i++;
      }
      continue;
    }

    cur += c; i++;
  }
  stmts.push(cur);
  return stmts.map(s => s.trim()).filter(Boolean);
}

/**
 * executableOf — extract the executable token from a single statement string.
 *
 * Skips leading environment variable assignments (KEY=value …) per POSIX
 * shell semantics (e.g. FOO=1 bash script.sh → executable is bash).
 *
 * Returns the raw executable token string, or null for empty/all-assignment input.
 */
export function executableOf(stmt) {
  if (!stmt || typeof stmt !== 'string') return null;
  const tokens = stmt.trim().split(/\s+/).filter(Boolean);
  let idx = 0;
  while (idx < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[idx])) idx++;
  return idx < tokens.length ? tokens[idx] : null;
}

/**
 * hasExecPositionDetach — check if any split statement has a detachment primitive
 * in executable position. Routes EXEC_DETACH_NAMES and EXEC_DETACH_PATTERNS through
 * executableOf so words like "at", "screen", "start" in arguments/comments don't fire.
 */
function hasExecPositionDetach(cmd) {
  for (const stmt of splitStatements(cmd)) {
    const exec = executableOf(stmt);
    if (!exec) continue;
    const execBase = canonicalizePath(exec).split('/').pop() || '';

    if (EXEC_DETACH_NAMES.has(execBase)) {
      return { deny: true, reason: `S0 visibility gate: detachment primitive '${execBase}' in executable position denied (A1)` };
    }

    for (const { exec: expectedExec, rx } of EXEC_DETACH_PATTERNS) {
      if (execBase === expectedExec && rx.test(stmt)) {
        return { deny: true, reason: `S0 visibility gate: detachment pattern '${rx.source}' denied (A1)` };
      }
    }
  }
  return { deny: false };
}

// ── §B tokenizer ─────────────────────────────────────────────────────────────

/**
 * Replace content inside matched quotes with spaces.
 * Double-quoted strings handle backslash escaping inside; single-quoted strings do not.
 * Outside quotes, backslashes are preserved as-is so \& still contains a bare `&`
 * (intentional over-deny per §B — a surviving `\&` is flagged, which is conservative).
 */
function stripQuotedContent(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    if (s[i] === '"') {
      out += ' '; i++;
      while (i < s.length) {
        if (s[i] === '\\' && i + 1 < s.length) { out += '  '; i += 2; continue; }
        if (s[i] === '"') { out += ' '; i++; break; }
        out += ' '; i++;
      }
      continue;
    }
    if (s[i] === "'") {
      out += ' '; i++;
      while (i < s.length) {
        if (s[i] === "'") { out += ' '; i++; break; }
        out += ' '; i++;
      }
      continue;
    }
    // Outside quotes: preserve character verbatim (including backslashes).
    out += s[i]; i++;
  }
  return out;
}

/**
 * §B tokenizer — returns true if a detachment `&` survives after:
 * 1. Strip quoted content.
 * 2. Consume &&, &>, >&\d, >&-, \d+>&\d+.
 * 3. Any remaining `&` = detachment operator → DENY.
 */
function hasDetachAmpersand(cmd) {
  const stripped = stripQuotedContent(cmd);
  const safe = stripped
    .replace(/&&/g, '  ')
    .replace(/&>/g, '  ')
    .replace(/>&[-\d]/g, '   ')
    .replace(/\d+>&\d+/g, '     ');
  return safe.includes('&');
}

// ── Rule checkers ─────────────────────────────────────────────────────────────

/** A5 — deny commands that destructively target a protected gate file or directory.
 *
 * Ancestor-aware: a command targeting `.claude` (which contains `.claude/hooks`) is
 * denied because it would destroy protected dirs/files. Only named protected paths and
 * `.claude/hooks` are protected — `.claude/state/**` telemetry appends are ALLOWED.
 */
function hasProtectedFileDestruction(cmd, isPowerShell) {
  const ops = isPowerShell ? DESTRUCTIVE_PS : DESTRUCTIVE_BASH;
  // Case policy: op detection uses original cmd (Bash ops are lowercase; PS patterns carry /i).
  // canonicalizePath is the sole normalizer for all path comparisons below.
  if (!ops.some(rx => rx.test(cmd))) return false;
  const normPaths = PROTECTED_PATHS.map(canonicalizePath);
  const normDirs  = PROTECTED_DIRS.map(canonicalizePath);
  // Substring check on the full normalized command for protected file paths only
  // (catches inline string forms like `node -e "...writeFileSync('.claude/settings.json'...)"`).
  // Not applied to dirs — that would match .claude/state/* telemetry writes.
  const normCmd = canonicalizePath(cmd);
  if (normPaths.some(p => normCmd.includes(p))) return true;
  // Token check: canonicalize each whitespace-delimited token to catch absolute and UNC paths.
  // (e.g. C:\...\encore_framework\.claude\settings.json or \\?\C:\...\.claude\settings.json).
  // Ancestor-aware: token t is dangerous when:
  //   - it equals a protected path/dir directly
  //   - it is inside a protected dir (starts with dir + '/')
  //   - it ends with a protected path (absolute form)
  //   - it is an ANCESTOR of a protected path/dir (p or d starts with t + '/')
  return cmd.split(/\s+/).some(t => {
    if (!t) return false;
    const ct = canonicalizePath(t);
    if (normPaths.some(p => ct === p || ct.endsWith('/' + p) || p.startsWith(ct + '/'))) return true;
    if (normDirs.some(d => ct === d || ct.startsWith(d + '/') || ct.endsWith('/' + d) || d.startsWith(ct + '/'))) return true;
    return false;
  });
}

/** A5-L — deny destructive commands targeting the wrapper ledger.
 *  Exact-match only (no ancestor-awareness) to avoid false-deny on commands
 *  that mention `.claude/state` as a token without targeting the ledger.
 */
function hasLedgerDestruction(cmd, isPowerShell) {
  const ops = isPowerShell ? DESTRUCTIVE_PS : DESTRUCTIVE_BASH;
  if (!ops.some(rx => rx.test(cmd))) return false;
  const normLedger = LEDGER_PROTECTED_PATHS.map(canonicalizePath);
  const normCmd = canonicalizePath(cmd);
  if (normLedger.some(p => normCmd.includes(p))) return true;
  return cmd.split(/\s+/).some(t => {
    if (!t) return false;
    const ct = canonicalizePath(t);
    return normLedger.some(p => ct === p || ct.endsWith('/' + p));
  });
}

/**
 * A2 — deny direct `copilot` CLI invocation.
 * Resolves the executable through executableOf (V19 fix) so env-prefixed forms like
 * `FOO=1 copilot --agent x` are caught. For package runners (npx/bunx/pnpx) and shell
 * launchers (bash/sh), also checks the invocation target derived from subsequent tokens
 * so `npx copilot` and `bash ./copilot-worker.sh` are still caught.
 */
function hasDirectCopilotInvocation(cmd) {
  for (const stmt of splitStatements(cmd)) {
    // Step 1: resolve the executable through executableOf — handles env-var prefix skipping.
    const rawExec = executableOf(stmt);
    if (rawExec === null) continue;
    const execNorm = canonicalizePath(rawExec);
    const execBase = execNorm.split('/').pop() || execNorm;

    // Step 2: executable IS copilot → deny.
    if (/\bcopilot(?:\.ps1|\.cmd)?\b/.test(execNorm)) return true;

    // Step 3: unified runner family target detection (single-word and two-word).
    const tokens = stmt.trim().split(/\s+/).filter(Boolean);
    let execIdx = 0;
    while (execIdx < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[execIdx])) execIdx++;

    const runnerTargetIdx = resolveRunnerTarget(tokens, execIdx);
    if (runnerTargetIdx >= 0) {
      const targetToken = tokens[runnerTargetIdx];
      if (targetToken && /\bcopilot(?:\.ps1|\.cmd)?\b/.test(canonicalizePath(targetToken))) return true;
    }

    if (/^(bash|sh)$/.test(execBase)) {
      // bash/sh: skip any flag tokens (e.g. -e, -x) to find the script path.
      let scriptIdx = execIdx + 1;
      while (scriptIdx < tokens.length && /^-/.test(tokens[scriptIdx])) scriptIdx++;
      const scriptToken = tokens[scriptIdx];
      if (!scriptToken) continue;
      const scriptNorm = canonicalizePath(scriptToken.replace(/^['"]|['"]$/g, ''));
      if (isCanonicalWrapper(scriptNorm)) continue; // canonical sanctioned dispatch — allow
      if (/\bcopilot\b/.test(scriptNorm)) return true;
    }
  }
  return false;
}

// M2 — encoded / direct process-creation constructs.
// These are used to spawn external processes outside the wrapper ledger, often
// with obfuscated command strings. See module-level gap comment for the honest residual.
const ENCODED_SPAWN_PATTERNS = [
  { rx: /\bchild_process\b/,               label: 'child_process' },
  { rx: /\bspawnSync\b/,                    label: 'spawnSync' },
  { rx: /\bspawn_sync\b/,                   label: 'spawn_sync' },
  { rx: /\bexecSync\b/,                     label: 'execSync' },
  { rx: /\bexecFile\b/,                     label: 'execFile' },
  { rx: /\bexecFileSync\b/,                 label: 'execFileSync' },
  { rx: /\bworker_threads\b/,               label: 'worker_threads' },
  { rx: /String\.fromCharCode\s*\(/,        label: 'String.fromCharCode' },
  { rx: /Buffer\.from\s*\([^)]*['"]base64['"]/, label: 'Buffer.from(base64)' },
];

/**
 * isNodeInlineEval — returns true when a single statement invokes `node` (directly, via a
 * package runner, or via a shell -c wrapper) with an inline-eval flag (-e/--eval/-p/--print).
 * Uses executableOf and resolveRunnerTarget — no parallel normalization site.
 */
function isNodeInlineEval(stmt) {
  const exec = executableOf(stmt);
  if (!exec) return false;
  const execBase = canonicalizePath(exec).split('/').pop() || '';
  const tokens = stmt.trim().split(/\s+/).filter(Boolean);
  let execIdx = 0;
  while (execIdx < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[execIdx])) execIdx++;

  // Direct node invocation: check for eval flags after the executable
  if (/^node(\.exe)?$/.test(execBase)) {
    return hasEvalFlag(tokens, execIdx + 1);
  }

  // Runner family (npx node -e "..."): resolve target, check if it's node with eval flag
  const runnerTargetIdx = resolveRunnerTarget(tokens, execIdx);
  if (runnerTargetIdx >= 0) {
    const targetBase = canonicalizePath(tokens[runnerTargetIdx]).split('/').pop() || '';
    if (/^node(\.exe)?$/.test(targetBase)) {
      return hasEvalFlag(tokens, runnerTargetIdx + 1);
    }
  }

  // Shell wrapper: bash/sh -c '...node -e "..."...'
  if (/^(bash|sh)$/.test(execBase)) {
    for (let i = execIdx + 1; i < tokens.length; i++) {
      if (tokens[i] === '-c' && i + 1 < tokens.length) {
        const innerCmd = tokens.slice(i + 1).join(' ');
        if (/\bnode\b/i.test(innerCmd) && /\s-[ep]\b|\s--eval\b|\s--print\b/.test(innerCmd)) {
          return true;
        }
        break;
      }
    }
  }

  return false;
}

/** Check if tokens starting at startIdx contain a node inline-eval flag. */
function hasEvalFlag(tokens, startIdx) {
  for (let i = startIdx; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '-e' || t === '--eval' || t === '-p' || t === '--print') return true;
    // Combined short flags containing e or p (e.g. -pe, -ep)
    if (/^-[a-z]*[ep]/i.test(t) && !t.startsWith('--')) return true;
  }
  return false;
}

/**
 * hasEncodedSpawn — M2 process-creation construct detector.
 * Scoped to inline-eval contexts: patterns fire only when a statement evaluates inline
 * JavaScript (node -e/--eval/-p/--print), not when keywords appear as search terms,
 * commit messages, filenames, or documentation prose.
 * Routes through splitStatements + executableOf (no parallel normalization site).
 */
function hasEncodedSpawn(cmd) {
  for (const stmt of splitStatements(cmd)) {
    if (!isNodeInlineEval(stmt)) continue;
    for (const { rx, label } of ENCODED_SPAWN_PATTERNS) {
      if (rx.test(stmt)) {
        return { found: true, reason: `S0 visibility gate: risky process-creation construct '${label}' detected in inline-eval context (M2)` };
      }
    }
  }
  return { found: false };
}

// V19 — dispatch token regex used by hasUnmodeledDispatch.
// Matches the CLI name or the wrapper script basename anywhere in the command text.
const DISPATCH_TOKEN_RX = /\bcopilot\b|copilot-worker\.sh/i;

// V19 — unmodeled execution contexts: constructs the tokenizer cannot parse at gate time.
// Each entry carries a label used in the deny reason so the operator knows which construct fired.
// Rule: if ANY unmodeled context is present AND a dispatch token appears in the command text,
// the command is DENIED. If the unmodeled context carries no dispatch token, ALLOW (ordinary
// `$(date)`, `timeout 60 npm test`, `bash -c "npm run typecheck"` must keep working).
// The mirror rule on the detective side: a wrapper appearing inside an unmodeled context
// (e.g. a heredoc body) never counts as a visible dispatch.
const UNMODELED_CONTEXTS = [
  { rx: /\beval\b/,                    label: 'eval' },
  { rx: /`[^`]*`/,                     label: 'backtick substitution' },
  { rx: /\$\(/,                        label: 'command substitution $()' },
  { rx: /(?:^|[\s;|&])\(/,             label: 'subshell ()' },
  { rx: /\bxargs\b/,                   label: 'xargs' },
  { rx: /\b(bash|sh)\s+-c\b/,          label: 'bash -c / sh -c' },
  { rx: /\b(env|nice|timeout|sudo|exec|time|command|builtin)\b/, label: 'launcher/prefix command' },
  { rx: /<<\s*\w/,                     label: 'heredoc' },
  // V22: new unmodeled contexts for defense-in-depth
  { rx: /(?:^|[\s;|&])(?:source|\.)\s+\S/, label: 'source/dot-source' },
  { rx: /<\(/,                         label: 'process substitution <()' },
  { rx: /\balias\s+\w+=/,              label: 'alias assignment' },
  { rx: /\w+\s*\(\)\s*[{(]/,           label: 'function definition' },
  { rx: /\btrap\s+['"].*\S/,           label: 'trap with command string' },
  { rx: /\\\n/,                        label: 'line-continuation (backslash-newline)' },
  { rx: /\{[^{}]*,[^{}]*\}/,           label: 'brace expansion' },
  { rx: /\bIFS\s*=/,                   label: 'IFS reassignment' },
  { rx: /\bpython[23]?\s+-c\b/,        label: 'python -c interpreter' },
];

/**
 * V19 — deny unmodeled execution contexts that carry a dispatch token.
 *
 * Returns { found: true, reason } when an unmodeled context AND a dispatch token are both
 * present. Returns { found: false } when no unmodeled context fires, OR when the unmodeled
 * context carries no dispatch token (safe: ordinary shell scripting must keep working).
 *
 * This rule converges: the deny set is "unmodeled context I cannot parse that could be hiding
 * a dispatch" rather than "every attack someone has thought of".
 */
function hasUnmodeledDispatch(cmd) {
  for (const { rx, label } of UNMODELED_CONTEXTS) {
    if (rx.test(cmd)) {
      if (DISPATCH_TOKEN_RX.test(cmd)) {
        return {
          found: true,
          reason: `S0 visibility gate: unmodeled execution context '${label}' contains a dispatch token — cannot verify visibility (V19)`,
        };
      }
      // Unmodeled context without dispatch token: ordinary scripting — allow.
    }
  }
  return { found: false };
}

// V22 — dispatch-argument integrity: deny when dispatch args appear on a non-wrapper executable.
const DISPATCH_ARGS_RX = /--run-id\s|--agent\s|--ticket\s/;

function hasDispatchArgsOnNonWrapper(cmd) {
  // Quote-aware: dispatch args inside quoted content (echo "--run-id X", grep --run-id) don't fire.
  if (!DISPATCH_ARGS_RX.test(stripQuotedContent(cmd))) return { found: false };
  for (const stmt of splitStatements(cmd)) {
    if (!DISPATCH_ARGS_RX.test(stripQuotedContent(stmt))) continue;
    const tokens = stmt.trim().split(/\s+/).filter(Boolean);
    let execIdx = 0;
    while (execIdx < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[execIdx])) execIdx++;
    if (execIdx >= tokens.length) continue;
    const execStmt = tokens.slice(execIdx).join(' ');
    const wrapperPath = parseDispatchWrapperPath(execStmt);
    if (isCanonicalWrapper(wrapperPath)) continue;
    return {
      found: true,
      reason: 'S0 visibility gate: dispatch arguments (--run-id/--agent/--ticket) on non-wrapper executable — possible renamed/symlinked dispatch (V22)',
    };
  }
  return { found: false };
}


/**
 * A3 — deny launcher constructs that can smuggle `&` past a literal scanner.
 * Over-denial is intentional: the sanctioned path is a plain foreground command.
 */
function hasRiskyLauncherConstruct(cmd) {
  // ANSI-C quoting: $'...' can encode detachment characters via hex/unicode/octal escapes.
  // Narrowed: only deny when content contains risky escapes (\xNN, \uNNNN, \0NNN) or dispatch
  // tokens. Safe escapes (\n, \t, \r, \\, \', etc.) are allowed through.
  if (/(?:^|[\s;|&(])\$'/.test(cmd)) {
    const ansiRx = /(?:^|[\s;|&(])\$'((?:[^'\\]|\\.)*)'/g;
    let m;
    let hasRisky = false;
    while ((m = ansiRx.exec(cmd)) !== null) {
      const body = m[1];
      if (/\\x[0-9a-fA-F]/i.test(body) || /\\u[0-9a-fA-F]/i.test(body) || /\\[0-7]{3}/.test(body)) {
        hasRisky = true; break;
      }
      if (DISPATCH_TOKEN_RX.test(body)) {
        hasRisky = true; break;
      }
    }
    if (hasRisky) {
      return { found: true, reason: "ANSI-C quoting $'...' contains risky escape or dispatch token (A3)" };
    }
  }

  const hasShellLauncher = /\b(bash|sh|zsh|wsl|cmd|powershell|pwsh)\b/i.test(cmd);
  if (!hasShellLauncher) return { found: false };

  // here-string / here-doc / stdin redirection to a shell launcher
  if (/\b(bash|sh|zsh|wsl|cmd|powershell|pwsh)\s*<<</.test(cmd))
    return { found: true, reason: 'here-string fed to shell launcher can carry `&`' };
  if (/\b(bash|sh|zsh|wsl|cmd|powershell|pwsh)\s*<<\s/.test(cmd))
    return { found: true, reason: 'here-doc fed to shell launcher can carry `&`' };
  if (/\b(bash|sh|zsh|wsl|cmd|powershell|pwsh)\s*<\s+\S/.test(cmd))
    return { found: true, reason: 'stdin redirection to shell launcher can carry `&`' };

  // NOTE: Command substitution $(), backtick, and variable expansion sub-checks were here
  // but are removed (V20A). They are now handled by hasUnmodeledDispatch, which gates on
  // BOTH the unmodeled context AND a dispatch token — so ordinary scripts (e.g. pre-push
  // hooks with `$(git rev-parse ...)`) keep working while dispatch-carrying forms still DENY.
  // Modeled shell constructs: set, cd, plain binary invocations, &&, ;, |, 2>&1, here-string
  //   feeds to a launcher (<<<, <<, <), nested bash -c beyond one level.
  // Unmodeled (handed to hasUnmodeledDispatch): eval, $(), backticks, $( ), subshells,
  //   xargs, case, bash -c / sh -c single-level, env / nice / timeout / sudo, heredoc bodies.

  // bash -c nesting beyond one level: count exact `bash -c` occurrences (quotes not stripped)
  const bashCCount = (cmd.match(/\bbash\s+-c\b/g) || []).length;
  if (bashCCount > 1)
    return { found: true, reason: 'nested bash -c beyond one level can smuggle `&` in inner argument' };

  return { found: false };
}

/** §C — does this command contain a risky marker requiring fail-closed on error? */
function hasRiskyMarker(cmd) {
  return RISKY_MARKERS.some(rx => rx.test(cmd));
}

// ── Log failure helper ────────────────────────────────────────────────────────

function logFailure(msg) {
  try {
    if (!existsSync('.claude/state')) mkdirSync('.claude/state', { recursive: true });
    appendFileSync('.claude/state/hook-failures.log', `${new Date().toISOString()} dispatch-visibility-gate: ${msg}\n`);
  } catch { /* swallow */ }
}

// ── Emit helpers (M4/M7: match house gate shape from check-graft-ship.mjs) ──────

function emitAllow() {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' },
  }));
}

function emitDeny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Check a single command string.
 * @param {string} cmd      — raw command text from tool_input.command
 * @param {string} toolName — 'Bash' | 'PowerShell'
 * @returns {{ deny: boolean, reason: string }}
 */
export function checkCommand(cmd, toolName) {
  const isPowerShell = /powershell/i.test(toolName);

  // A5 — self-protection (both modes)
  if (hasProtectedFileDestruction(cmd, isPowerShell)) {
    return { deny: true, reason: 'S0 visibility gate: command targets a protected gate file (A5 self-protection)' };
  }

  // A5-L — ledger write-protection
  if (hasLedgerDestruction(cmd, isPowerShell)) {
    return { deny: true, reason: 'S0 visibility gate: command targets the wrapper ledger (A5-L write-protection)' };
  }

  if (isPowerShell) {
    // A4 — PowerShell detachment primitives (case policy: canonicalizePath lowercases both sides;
    // PS_DETACH_TOKENS are pre-lowercased so this is the only normalization site)
    const normPsCmd = canonicalizePath(cmd);
    for (const token of PS_DETACH_TOKENS) {
      if (normPsCmd.includes(token)) {
        return { deny: true, reason: `S0 visibility gate: PowerShell detachment primitive '${token}' denied (A4/A1)` };
      }
    }
    // A4 — dispatch is Bash-only; deny any copilot reference in PowerShell
    if (/\bcopilot[\w.-]*/i.test(cmd)) {
      return { deny: true, reason: 'S0 visibility gate: Copilot dispatch via PowerShell is denied — Bash-only dispatch path (A4)' };
    }
    return { deny: false, reason: 'allow' };
  }

  // Bash path — apply rules in order: A3, A2, A1 (primitives), A1 (& tokenizer)

  // A3 — launcher constructs (over-denial intentional; sanctioned path is plain foreground)
  const launcherCheck = hasRiskyLauncherConstruct(cmd);
  if (launcherCheck.found) {
    return { deny: true, reason: `S0 visibility gate: ${launcherCheck.reason} (A3)` };
  }

  // V19 — unmodeled execution contexts carrying a dispatch token
  const unmodeledCheck = hasUnmodeledDispatch(cmd);
  if (unmodeledCheck.found) {
    return { deny: true, reason: unmodeledCheck.reason };
  }

  // V22 — dispatch arguments on non-wrapper executable
  const dispatchArgCheck = hasDispatchArgsOnNonWrapper(cmd);
  if (dispatchArgCheck.found) {
    return { deny: true, reason: dispatchArgCheck.reason };
  }

  // M2 — encoded / direct process-creation constructs
  const spawnCheck = hasEncodedSpawn(cmd);
  if (spawnCheck.found) {
    return { deny: true, reason: spawnCheck.reason };
  }

  // A2 — direct copilot CLI bypasses ledger
  if (hasDirectCopilotInvocation(cmd)) {
    return { deny: true, reason: "S0 visibility gate: direct 'copilot' CLI invocation bypasses wrapper ledger (A2); use copilot-worker.sh" };
  }

  // A1 — executable-position detachment (tokens + patterns + V2 vectors)
  const execDetach = hasExecPositionDetach(cmd);
  if (execDetach.deny) {
    return { deny: true, reason: execDetach.reason };
  }

  // A1 — syntax-based detachment patterns (not executable names; whole-command text match)
  for (const pattern of SYNTAX_DETACH_PATTERNS) {
    if (pattern.test(cmd)) {
      return { deny: true, reason: `S0 visibility gate: detachment pattern denied (A1): ${pattern.source}` };
    }
  }

  // A1 — §B & tokenizer
  if (hasDetachAmpersand(cmd)) {
    return { deny: true, reason: "S0 visibility gate: unquoted detachment '&' detected by §B tokenizer (A1)" };
  }

  return { deny: false, reason: 'allow' };
}

/**
 * checkPayload — full payload routing: handles Edit/Write/NotebookEdit (C2),
 * M6 non-string command validation, and delegates Bash/PowerShell to checkCommand.
 * @returns {{ deny: boolean, reason: string }}
 */
export function checkPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { deny: true, reason: 'S0 visibility gate: non-object payload (fail-closed)' };
  }
  const toolName = payload.tool_name ?? '';

  // C2 — Edit/Write/NotebookEdit: inspect file_path against protected set
  if (/^(Edit|Write|NotebookEdit)$/.test(toolName)) {
    const filePath = payload.tool_input?.file_path ?? payload.tool_input?.notebook_path ?? '';
    if (filePath && typeof filePath === 'string') {
      // canonicalizePath collapses .. segments — prevents traversal bypass (C1/C2 fix)
      const normPath = canonicalizePath(filePath);
      const normPaths = PROTECTED_PATHS.map(canonicalizePath);
      const normDirs  = PROTECTED_DIRS.map(canonicalizePath);
      const hit = normPaths.some(p => normPath === p || normPath.endsWith('/' + p)) ||
                  normDirs.some(d => normPath === d || normPath.startsWith(d + '/') ||
                                    normPath.endsWith('/' + d) || normPath.includes('/' + d + '/'));
      if (hit) {
        return { deny: true, reason: `S0 visibility gate: Edit/Write to protected gate path denied (A5/C2): ${filePath}` };
      }
      // A5-L — ledger write-protection for Edit/Write
      const normLedger = LEDGER_PROTECTED_PATHS.map(canonicalizePath);
      if (normLedger.some(p => normPath === p || normPath.endsWith('/' + p))) {
        return { deny: true, reason: `S0 visibility gate: Edit/Write to wrapper ledger denied (A5-L): ${filePath}` };
      }
    }
    return { deny: false, reason: 'allow' };
  }

  const cmd = payload.tool_input?.command;

  // M6 — gated tools with non-string command: deny instead of silently skipping
  const isGated = /^(Bash|PowerShell)$/i.test(toolName);
  if (isGated && (cmd === undefined || cmd === null || typeof cmd !== 'string')) {
    return { deny: true, reason: 'S0 visibility gate: malformed tool_input (command absent or non-string) — fail-closed (M6)' };
  }

  if (!cmd || typeof cmd !== 'string') return { deny: false, reason: 'allow' };
  return checkCommand(cmd, toolName);
}

/**
 * main() — PreToolUse hook entry point.
 * Reads stdin JSON, checks command, emits permissionDecision or nothing (allow).
 */
export async function main() {
  let raw = '';
  try {
    for await (const chunk of process.stdin) raw += chunk;
  } catch (err) {
    const msg = 'S0 visibility gate: failed to read stdin (fail-closed)';
    emitDeny(msg);
    fireTelemetry('visibility-gate', 'deny', 'stdin-read-error');
    logFailure(`stdin read error: ${err?.message}`);
    return;
  }

  const MAX_STDIN_BYTES = 10 * 1024 * 1024; // 10 MB ceiling
  if (raw.length > MAX_STDIN_BYTES) {
    const msg = `S0 visibility gate: stdin payload exceeds 10 MB ceiling (fail-closed per §C)`;
    emitDeny(msg);
    fireTelemetry('visibility-gate', 'deny', 'oversized-stdin');
    logFailure(`stdin oversized: ${raw.length} chars`);
    return;
  }

  if (!raw.trim()) {
    const msg = 'S0 visibility gate: empty stdin (fail-closed per §C)';
    emitDeny(msg);
    fireTelemetry('visibility-gate', 'deny', 'empty-stdin');
    return;
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    const msg = 'S0 visibility gate: malformed stdin JSON (fail-closed per §C)';
    emitDeny(msg);
    fireTelemetry('visibility-gate', 'deny', 'malformed-stdin');
    return;
  }

  if (!payload || typeof payload !== 'object') {
    const msg = 'S0 visibility gate: non-object stdin payload (fail-closed per §C)';
    emitDeny(msg);
    fireTelemetry('visibility-gate', 'deny', 'non-object-stdin');
    return;
  }

  let result;
  try {
    result = checkPayload(payload);
  } catch (err) {
    const cmd = payload.tool_input?.command ?? '';
    const risky = hasRiskyMarker(typeof cmd === 'string' ? cmd : '');
    logFailure(`internal error (${risky ? 'fail-closed' : 'fail-open'}): ${err?.message}`);
    if (risky) {
      const msg = `S0 visibility gate: internal error, fail-closed per §C: ${err?.message ?? String(err)}`;
      emitDeny(msg);
      fireTelemetry('visibility-gate', 'deny', `error:${String(cmd).slice(0, 80)}`);
    }
    return;
  }

  if (result.deny) {
    emitDeny(result.reason);
    fireTelemetry('visibility-gate', 'deny', result.reason.slice(0, 120));
  } else {
    // M4: emit allow JSON matching house gate convention (check-graft-ship.mjs / check-todo-injection.mjs)
    emitAllow();
  }
}

// Run if invoked directly (e.g. `node check-dispatch-visibility.mjs`)
const isMain = process.argv[1] && canonicalizePath(import.meta.url).endsWith(canonicalizePath(process.argv[1]));
if (isMain || process.argv[1]?.includes('check-dispatch-visibility')) {
  main().catch(err => {
    process.stderr.write(`dispatch-visibility-gate fatal: ${err?.message}\n`);
    process.exit(1);
  });
}
