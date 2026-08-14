// dispatch-command-parse.mjs — shared command-parsing helpers for the dispatch-visibility
// Stop hook (check-visibility-reconcile.mjs), which is their only consumer.
//
// These functions were extracted verbatim from check-dispatch-visibility.mjs when that
// module was deleted. That module implemented a PreToolUse gate that tried to BLOCK
// dispatch-hiding commands. It was removed because it was scoped to the wrong actor: a
// PreToolUse hook inspects Claude's own tool calls, and a dispatched worker is a separate
// process that never reaches it. See LR-074 §74.2 in .claude/rules/guardrail-policy.md —
// "Extend the detective layer. Do not resurrect the matcher."
//
// Nothing here denies anything. It parses a shell command well enough to answer one
// question: does this command invoke the canonical dispatch wrapper in executable
// position? The Stop hook uses that to tell a real dispatch from a mention of one.

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

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
