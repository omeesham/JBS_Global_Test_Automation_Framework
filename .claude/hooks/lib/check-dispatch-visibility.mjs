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

// ── A5/A5-L path-first read-only allowlist ────────────────────────────────────
// When a command mentions a protected path or the ledger, it is allowed ONLY when
// every statement's executable is a known non-destructive shape AND no redirect
// lands on a protected path. Everything else denies — including shapes nobody has
// thought of — naming the unmodeled construct in the deny reason.
// This is NOT a second normalization site: all path comparisons flow through
// canonicalizePath (the single funnel enforced by STRUCT01/02).

const KNOWN_SAFE_EXEC_BASH = new Set([
  'cat', 'head', 'tail', 'less', 'more', 'wc',
  'grep', 'egrep', 'fgrep', 'rg', 'ag',
  'ls', 'file', 'stat', 'test', '[',
  'diff', 'cmp', 'comm',
  'sha256sum', 'sha1sum', 'md5sum', 'cksum', 'b2sum',
  'readlink', 'realpath', 'basename', 'dirname', 'pwd',
  'echo', 'printf', 'true', 'false',
  'sort', 'uniq', 'cut', 'tr', 'column', 'paste', 'fold', 'fmt',
  'hexdump', 'xxd', 'od', 'strings', 'nl', 'rev',
  'jq', 'yq',
  'set', 'cd', 'export', 'unset',
  'tac',
  'find', 'du', 'sed',
]);

const KNOWN_SAFE_EXEC_PS = new Set([
  'get-content', 'select-string', 'test-path', 'get-item',
  'get-itemproperty', 'resolve-path', 'get-filehash',
  'get-childitem', 'measure-object', 'format-list', 'format-table',
  'write-output', 'write-host', 'write-verbose', 'write-debug',
  'select-object', 'where-object', 'foreach-object',
  'compare-object', 'group-object', 'sort-object',
  'cat', 'type', 'gc',
  // Data converters and formatters — read-only transforms, no file writes
  'convertto-json', 'convertfrom-json',
  'convertto-csv', 'convertfrom-csv',
  'convertto-xml', 'convertto-html',
  'out-string', 'out-null',
  'format-wide', 'format-custom',
]);

// ── Invocation-level write-mode patterns for allowlisted executables ──────────
// Safety is a property of an invocation, not a program. These patterns detect
// write-mode flags that make an otherwise read-only program destructive.
// Every spelling the tool accepts must be covered: short, long, joined, separated, bundled.
const EXEC_WRITE_MODE_PATTERNS = {
  'sed':  [/\s-i\b/, /\s--in-place\b/, /\bw\s+\S/],
  'find': [/-delete\b/, /-fls\b/, /-fprint\b/, /-fprint0\b/, /-fprintf\b/],
  'sort': [/\s-o\b/, /\s--output\b/, /\s--output=\S/],
  'yq':   [/\s-i\b/, /\s--in-place\b/],
};

// Pure-reader subset of KNOWN_SAFE_EXEC_BASH: executables with NO write mode at all.
// Used to validate find -exec targets — only these are safe after -exec.
const PURE_READER_EXEC = new Set([
  'cat', 'head', 'tail', 'less', 'more', 'wc',
  'grep', 'egrep', 'fgrep', 'rg', 'ag',
  'file', 'stat', 'test', '[',
  'diff', 'cmp', 'comm',
  'sha256sum', 'sha1sum', 'md5sum', 'cksum', 'b2sum',
  'readlink', 'realpath', 'basename', 'dirname', 'pwd',
  'echo', 'printf', 'true', 'false',
  'hexdump', 'xxd', 'od', 'strings', 'nl', 'rev', 'tac',
  'ls', 'du',
]);

/**
 * findHasUnsafeExec — returns true if a find statement contains -exec/-execdir/-ok/-okdir
 * with a command that is NOT a known pure reader. Returns false if no exec option present
 * or if the exec'd command is a pure reader.
 */
function findHasUnsafeExec(stmt) {
  const tokens = stmt.trim().split(/\s+/).filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    if (/^-(exec|execdir|ok|okdir)$/.test(tokens[i])) {
      const cmdToken = i + 1 < tokens.length ? tokens[i + 1] : '';
      const cmdBase = canonicalizePath(cmdToken).split('/').pop() || '';
      if (!PURE_READER_EXEC.has(cmdBase)) {
        return { unsafe: true, option: `${tokens[i]} ${cmdToken}` };
      }
      // Skip past the terminator (\; or +)
      while (i < tokens.length && tokens[i] !== ';' && tokens[i] !== '\\;' && tokens[i] !== '+') i++;
    }
  }
  return { unsafe: false };
}

// Git read-only subcommands: allowed against protected paths. Unrecognised subcommands deny (fail-closed).
const GIT_READONLY_SUBCOMMANDS = new Set([
  'log', 'diff', 'show', 'status', 'blame', 'shortlog', 'whatchanged',
  'reflog', 'describe', 'rev-parse', 'rev-list', 'name-rev', 'merge-base',
  'ls-files', 'ls-tree', 'cat-file', 'for-each-ref', 'verify-commit', 'verify-tag',
  'branch', 'tag', 'remote', 'stash', 'grep',
]);
// Git write-capable subcommands: always deny. Listed for documentation; the deny is the default for non-read-only.
// checkout, restore, apply, reset, clean, rm, mv, rebase, merge, cherry-pick, revert, push, pull, fetch, commit, add, init, clone

/**
 * gitSubcommandOf — extract the git subcommand from a statement whose executable is 'git'.
 * Skips flags (tokens starting with -) between 'git' and the subcommand, per git's own parsing.
 */
function gitSubcommandOf(stmt) {
  const tokens = stmt.trim().split(/\s+/).filter(Boolean);
  let i = 0;
  // skip env assignments
  while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i])) i++;
  // skip 'git' itself
  i++;
  // skip global flags (e.g. --no-pager, -C dir, -c key=val)
  while (i < tokens.length) {
    const t = tokens[i];
    if (!t.startsWith('-')) break;
    // flags that consume the next token
    if (/^(-C|-c|--git-dir|--work-tree|--namespace)$/.test(t)) { i += 2; continue; }
    i++;
  }
  return i < tokens.length ? canonicalizePath(tokens[i]) : '';
}

// Node write APIs that disqualify a node -e statement from path-first read-only.
const NODE_WRITE_RX = [
  /\bwriteFileSync\b/i, /\bwriteFile\b/i,
  /\bappendFileSync\b/i, /\bappendFile\b/i,
  /\bcreateWriteStream\b/i,
  /\bunlinkSync\b/i, /\bunlink\b/i,
  /\brmSync\b/i, /\brmdirSync\b/i,
  /\brenameSync\b/i, /\brename\b/i,
  /\bcopyFileSync\b/i, /\bcopyFile\b/i,
  /\bmkdirSync\b/i,
  // Computed property access on fs module: fs['writeFileSync'] bypasses literal name checks
  /(?:\bfs|['"]fs['"]\s*\))\s*\[/i,
];

// V19 fix: launcher names checked via executableOf per statement, not whole-command regex.
const LAUNCHER_EXEC_NAMES = new Set(['env', 'nice', 'timeout', 'sudo', 'exec', 'time', 'command', 'builtin']);

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

// V22 fix: preflight script canonical path (legitimate consumer of dispatch flags).
const PREFLIGHT_CANONICAL_PATH = canonicalizePath('scripts/dispatch-preflight.mjs');

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

/**
 * hasInlineEvalWrite — deny any node inline-eval that reaches a filesystem write API,
 * regardless of whether a protected path appears literally. A payload that constructs
 * the path from fragments bypasses the path-first literal-path check; this closes it
 * the same way hasEncodedSpawn closes process-creation: the payload's contents cannot
 * be trusted to declare their own targets.
 */
function hasInlineEvalWrite(cmd) {
  for (const stmt of splitStatements(cmd)) {
    if (!isNodeInlineEval(stmt)) continue;
    for (const rx of NODE_WRITE_RX) {
      if (rx.test(stmt)) {
        return { found: true, reason: `S0 visibility gate: filesystem write API '${rx.source}' in inline-eval context — path may be constructed dynamically (A5-eval)` };
      }
    }
  }
  return { found: false };
}

// ── A5/A5-L path-first self-protection ────────────────────────────────────────

/** Check if a command text mentions any protected path or ancestor dir (no destructive-op gate). */
function commandTouchesProtectedPath(cmd) {
  const normPaths = PROTECTED_PATHS.map(canonicalizePath);
  const normDirs  = PROTECTED_DIRS.map(canonicalizePath);
  const normCmd = canonicalizePath(cmd);
  if (normPaths.some(p => normCmd.includes(p))) return true;
  return cmd.split(/\s+/).some(t => {
    if (!t) return false;
    const ct = canonicalizePath(t);
    if (normPaths.some(p => ct === p || ct.endsWith('/' + p) || p.startsWith(ct + '/'))) return true;
    if (normDirs.some(d => ct === d || ct.startsWith(d + '/') || ct.endsWith('/' + d) || d.startsWith(ct + '/'))) return true;
    return false;
  });
}

/** Check if a command text mentions the ledger path (no destructive-op gate). */
function commandTouchesLedgerPath(cmd) {
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
 * extractRedirectTargets — quote-aware extraction of redirect targets from raw statement text.
 * Scans outside quotes for redirect operators (>, >>, N>, &>, etc.) and extracts the target
 * token, properly handling quoted targets by stripping delimiters but preserving the value.
 * This is the primitive fix: the old approach used stripQuotedContent first, which blanked
 * out quoted targets entirely — a quoted path was invisible to every downstream check.
 */
function extractRedirectTargets(stmt) {
  const targets = [];
  let i = 0;
  const len = stmt.length;

  while (i < len) {
    const c = stmt[i];

    // Skip single-quoted strings (content is opaque, no redirect inside)
    if (c === "'") {
      i++;
      while (i < len && stmt[i] !== "'") i++;
      if (i < len) i++;
      continue;
    }
    // Skip double-quoted strings
    if (c === '"') {
      i++;
      while (i < len) {
        if (stmt[i] === '\\' && i + 1 < len) { i += 2; continue; }
        if (stmt[i] === '"') { i++; break; }
        i++;
      }
      continue;
    }
    // Skip backslash escapes outside quotes
    if (c === '\\' && i + 1 < len) { i += 2; continue; }

    // Detect redirect operators outside quotes
    let isRedirect = false;
    let redirEnd = i;

    if (c === '>') {
      redirEnd = i + 1;
      if (redirEnd < len && stmt[redirEnd] === '>') redirEnd++; // >>
      isRedirect = true;
    } else if (c === '&' && i + 1 < len && stmt[i + 1] === '>') {
      redirEnd = i + 2;
      if (redirEnd < len && stmt[redirEnd] === '>') redirEnd++; // &>>
      isRedirect = true;
    } else if (/\d/.test(c)) {
      let j = i + 1;
      while (j < len && /\d/.test(stmt[j])) j++;
      if (j < len && stmt[j] === '>') {
        redirEnd = j + 1;
        if (redirEnd < len && stmt[redirEnd] === '>') redirEnd++; // N>>
        isRedirect = true;
      }
    }

    if (isRedirect) {
      i = redirEnd;
      // Skip whitespace between operator and target
      while (i < len && /\s/.test(stmt[i])) i++;
      if (i >= len) break;

      // fd dup (&N, &-) — not a file target
      if (stmt[i] === '&') { i++; while (i < len && /[\d-]/.test(stmt[i])) i++; continue; }

      // Extract target token — may be quoted
      let target = '';
      if (stmt[i] === '"') {
        i++;
        while (i < len) {
          if (stmt[i] === '\\' && i + 1 < len) {
            const next = stmt[i + 1];
            // In double quotes, only \$, \`, \", \\, \newline are true escapes.
            // All other \X pairs preserve the backslash (shell semantics).
            if (next === '$' || next === '`' || next === '"' || next === '\\' || next === '\n') {
              target += next; i += 2;
            } else {
              target += '\\' + next; i += 2;
            }
            continue;
          }
          if (stmt[i] === '"') { i++; break; }
          target += stmt[i]; i++;
        }
      } else if (stmt[i] === "'") {
        i++;
        while (i < len && stmt[i] !== "'") { target += stmt[i]; i++; }
        if (i < len) i++;
      } else {
        while (i < len && !/\s/.test(stmt[i])) { target += stmt[i]; i++; }
      }

      if (target) targets.push(target);
      continue;
    }

    i++;
  }
  return targets;
}

/** Check if any redirect in a statement lands on a protected or ledger path. */
function redirectTargetsProtectedPath(stmt) {
  const allProtected = [...PROTECTED_PATHS, ...LEDGER_PROTECTED_PATHS].map(canonicalizePath);
  const allDirs = PROTECTED_DIRS.map(canonicalizePath);
  const targets = extractRedirectTargets(stmt);
  for (const target of targets) {
    const ct = canonicalizePath(target);
    // Safe targets: /dev/null, nul, fd dup (&N), close (&-), bare fd number
    if (ct === '/dev/null' || ct === 'nul' || /^\d+$/.test(ct) || ct === '-' || ct.startsWith('&')) continue;
    if (allProtected.some(p => ct === p || ct.endsWith('/' + p))) return true;
    if (allDirs.some(d => ct === d || ct.startsWith(d + '/') || ct.endsWith('/' + d))) return true;
  }
  return false;
}

/**
 * stmtReferencesProtectedPath — check if a single statement references any protected
 * or ledger path, either in its tokens or in its redirect targets (quote-aware).
 * Used by checkPathFirst to skip statements that don't touch protected paths,
 * preventing false-deny on piped/chained commands (e.g. xargs, ConvertTo-Json).
 */
function stmtReferencesProtectedPath(stmt, checkProtected, checkLedger) {
  const normPaths = checkProtected ? PROTECTED_PATHS.map(canonicalizePath) : [];
  const normDirs = checkProtected ? PROTECTED_DIRS.map(canonicalizePath) : [];
  const normLedger = checkLedger ? LEDGER_PROTECTED_PATHS.map(canonicalizePath) : [];

  // Check full statement text (substring match catches partial/inline references)
  const normStmt = canonicalizePath(stmt);
  if (normPaths.some(p => normStmt.includes(p))) return true;
  if (normLedger.some(p => normStmt.includes(p))) return true;

  // Check individual tokens
  const tokens = stmt.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    const ct = canonicalizePath(t);
    if (normPaths.some(p => ct === p || ct.endsWith('/' + p) || p.startsWith(ct + '/'))) return true;
    if (normDirs.some(d => ct === d || ct.startsWith(d + '/') || ct.endsWith('/' + d) || d.startsWith(ct + '/'))) return true;
    if (normLedger.some(p => ct === p || ct.endsWith('/' + p))) return true;
  }

  // Check redirect targets (quote-aware)
  const targets = extractRedirectTargets(stmt);
  for (const target of targets) {
    const ct = canonicalizePath(target);
    if (normPaths.some(p => ct === p || ct.endsWith('/' + p))) return true;
    if (normDirs.some(d => ct === d || ct.startsWith(d + '/') || ct.endsWith('/' + d))) return true;
    if (normLedger.some(p => ct === p || ct.endsWith('/' + p))) return true;
  }

  return false;
}

/**
 * checkPathFirst — path-first self-protection for A5 and A5-L.
 *
 * When a command mentions a protected path or the ledger, only statements that
 * actually reference the protected path are checked against the allowlist.
 * Statements in a pipeline/chain that don't reference any protected path are
 * skipped — they can't modify what they don't name. This prevents false-deny
 * on piped transforms (xargs, ConvertTo-Json, Format-Table, etc.).
 */
function checkPathFirst(cmd, isPowerShell) {
  const touchesProtected = commandTouchesProtectedPath(cmd);
  const touchesLedger = commandTouchesLedgerPath(cmd);
  if (!touchesProtected && !touchesLedger) return { deny: false, reason: 'allow' };

  const pathType = touchesProtected ? 'protected gate file' : 'wrapper ledger';
  const ruleTag = touchesProtected ? 'A5' : 'A5-L';
  const stmts = splitStatements(cmd);
  const readers = isPowerShell ? KNOWN_SAFE_EXEC_PS : KNOWN_SAFE_EXEC_BASH;

  for (const stmt of stmts) {
    const exec = executableOf(stmt);
    if (!exec) continue; // pure env assignments — safe

    // Skip statements that don't reference any protected path — they can't write to it
    if (!stmtReferencesProtectedPath(stmt, touchesProtected, touchesLedger)) continue;

    const execNorm = canonicalizePath(exec);
    const execBase = execNorm.split('/').pop() || '';

    // Known safe executable — verify no write-mode flags and no redirect to protected path
    if (readers.has(execBase)) {
      const writeModes = EXEC_WRITE_MODE_PATTERNS[execBase];
      if (writeModes && writeModes.length > 0 && writeModes.some(rx => rx.test(stmt))) {
        return { deny: true, reason: `S0 visibility gate: write-mode invocation of '${execBase}' targets ${pathType} (${ruleTag} path-first)` };
      }
      // find -exec/-execdir/-ok/-okdir: check what command follows; deny if not a pure reader
      if (execBase === 'find') {
        const execCheck = findHasUnsafeExec(stmt);
        if (execCheck.unsafe) {
          return { deny: true, reason: `S0 visibility gate: find exec option '${execCheck.option}' targets ${pathType} — executed command is not a proven reader (${ruleTag} path-first)` };
        }
      }
      if (redirectTargetsProtectedPath(stmt)) {
        return { deny: true, reason: `S0 visibility gate: redirect targets ${pathType} (${ruleTag} path-first)` };
      }
      continue;
    }

    // Modeled VCS: git with read-only subcommand is safe; write-capable or unrecognised denies
    if (execBase === 'git') {
      const gitSub = gitSubcommandOf(stmt);
      if (GIT_READONLY_SUBCOMMANDS.has(gitSub)) {
        if (redirectTargetsProtectedPath(stmt)) {
          return { deny: true, reason: `S0 visibility gate: redirect targets ${pathType} (${ruleTag} path-first)` };
        }
        continue;
      }
      return {
        deny: true,
        reason: `S0 visibility gate: git subcommand '${gitSub || '(none)'}' is not a proven read-only shape targeting ${pathType} (${ruleTag} path-first)`,
      };
    }

    // Modeled read-only node -e: inline-eval with only read APIs (no write/spawn patterns)
    if (!isPowerShell && /^node(\.exe)?$/.test(execBase) && isNodeInlineEval(stmt)) {
      const hasWrite = NODE_WRITE_RX.some(rx => rx.test(stmt));
      const hasSpawn = ENCODED_SPAWN_PATTERNS.some(({ rx }) => rx.test(stmt));
      if (!hasWrite && !hasSpawn) {
        if (redirectTargetsProtectedPath(stmt)) {
          return { deny: true, reason: `S0 visibility gate: redirect targets ${pathType} (${ruleTag} path-first)` };
        }
        continue;
      }
      return { deny: true, reason: `S0 visibility gate: node inline-eval with write/spawn pattern targets ${pathType} (${ruleTag} path-first)` };
    }

    // Unmodeled executable touching a protected path — deny
    return {
      deny: true,
      reason: `S0 visibility gate: unmodeled construct '${execBase}' targets ${pathType} — not a proven read-only shape (${ruleTag} path-first)`,
    };
  }

  return { deny: false, reason: 'allow' };
}
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
  // V19 fix: launcher/prefix commands moved to LAUNCHER_EXEC_NAMES, checked via
  // executableOf per statement below — prevents --flag names containing launcher
  // words (e.g. --timeout) from false-denying.
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
    }
  }

  // V19 fix: launcher names via executableOf per statement (not whole-command regex).
  // Prevents --timeout flag from matching as timeout launcher while keeping real
  // launcher-position uses (e.g. `timeout 60 copilot ...`) denied.
  if (DISPATCH_TOKEN_RX.test(cmd)) {
    for (const stmt of splitStatements(cmd)) {
      const exec = executableOf(stmt);
      if (!exec) continue;
      const execBase = canonicalizePath(exec).split('/').pop() || '';
      if (LAUNCHER_EXEC_NAMES.has(execBase)) {
        return {
          found: true,
          reason: `S0 visibility gate: launcher '${execBase}' in executable position with dispatch token — cannot verify visibility (V19)`,
        };
      }
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
    // V22 fix: preflight script is a legitimate consumer of dispatch flags
    // (--ticket, --run-id, --agent) — it validates them, not executes them.
    if (wrapperPath === PREFLIGHT_CANONICAL_PATH || (wrapperPath && wrapperPath.endsWith('/' + PREFLIGHT_CANONICAL_PATH))) continue;
    // Also check if any token in the statement is the preflight script (handles node launcher)
    {
      const stmtTokens = stmt.trim().split(/\s+/).filter(Boolean);
      const isPreflight = stmtTokens.some(tk => {
        const ct = canonicalizePath(tk.replace(/^['"]|['"]$/g, ''));
        return ct === PREFLIGHT_CANONICAL_PATH || ct.endsWith('/' + PREFLIGHT_CANONICAL_PATH);
      });
      if (isPreflight) continue;
    }
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

  // A5/A5-L — path-first self-protection (both modes)
  const pathFirstResult = checkPathFirst(cmd, isPowerShell);
  if (pathFirstResult.deny) {
    return { deny: true, reason: pathFirstResult.reason };
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

  // A5-eval — inline-eval with filesystem write APIs (path may be constructed dynamically)
  const evalWriteCheck = hasInlineEvalWrite(cmd);
  if (evalWriteCheck.found) {
    return { deny: true, reason: evalWriteCheck.reason };
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
