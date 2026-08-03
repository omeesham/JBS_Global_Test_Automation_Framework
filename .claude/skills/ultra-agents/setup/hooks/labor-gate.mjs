#!/usr/bin/env node
/**
 * Labor Gate v4 — PreToolUse hook binary + library.
 *
 * When run as a binary: reads JSON hook payload from stdin, emits hook decision JSON to stdout.
 * When imported: exports checkCommand() for testing.
 *
 * Fires only on the EXECUTED program — never on suite runners mentioned inside data
 * (heredoc bodies, redirect payloads, echo/printf strings, grep patterns).
 *
 * v5: Grouping / substitution handling (subshell, $(), backticks), command-runner
 * stripping (xargs, timeout, nohup, etc.), newline splitting, npx-flag tolerance.
 * Reuses the v4 recursion depth bound for all recursive classification.
 *
 * @module build/labor-gate
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Configuration ────────────────────────────────────────────────────────────

const HOME = process.env.HOME || process.env.USERPROFILE || '';
const DELEG_DIR = join(HOME, '.claude', 'delegation');
const CONFIG_PATH = process.env.LABOR_GATE_CONFIG || join(DELEG_DIR, 'labor-gate-config.json');
const AUDIT_LOG  = process.env.LABOR_GATE_AUDIT_LOG || join(DELEG_DIR, 'labor-gate-audit.log');
const PIPELINE_IDENTITIES = new Set(['hunter', 'giver', 'builder', 'healer', 'watchdog', 'gardener']);
const LOOKBACK_LINES = 2000;

// ─── Command Analysis (data-aware parsing) ────────────────────────────────────

const HEREDOC_RE = /<<-?\s*['"]?(\w+)['"]?/;

const DATA_COMMANDS = new Set([
  'cat', 'echo', 'printf', 'grep', 'sed', 'awk', 'tee',
]);

/** Shells that support -c for inline command strings */
const SHELL_PROGRAMS = new Set(['bash', 'sh']);

/** Regex for shell -c flags: -c, -lc, -ec, -lec, -elc, etc. (any combo of e/l + c) */
const SHELL_C_FLAG_RE = /^-[el]*c$/;

const SPEC_PATTERN_NAME = 'SPEC_RUN_OR_BROWSER_WALK';

/**
 * Strip heredoc bodies from a command string.
 * Detects <<DELIM (quoted or unquoted) and removes everything from
 * the next line until the closing DELIM on its own line.
 */
function stripHeredocBodies(command) {
  const lines = command.split('\n');
  const result = [];
  let skipUntilDelim = null;

  for (let i = 0; i < lines.length; i++) {
    if (skipUntilDelim !== null) {
      if (lines[i].trim() === skipUntilDelim) {
        skipUntilDelim = null;
      }
      continue;
    }

    const match = lines[i].match(HEREDOC_RE);
    if (match) {
      result.push(lines[i]);
      skipUntilDelim = match[1];
    } else {
      result.push(lines[i]);
    }
  }

  return result.join('\n');
}

/**
 * Split a command string into segments on &&, ||, ;
 */
function splitCompoundCommand(command) {
  const segments = [];
  let current = '';
  let i = 0;

  while (i < command.length) {
    if (command[i] === '&' && command[i + 1] === '&') {
      segments.push(current);
      current = '';
      i += 2;
    } else if (command[i] === '|' && command[i + 1] === '|') {
      segments.push(current);
      current = '';
      i += 2;
    } else if (command[i] === ';' || command[i] === '\n') {
      segments.push(current);
      current = '';
      i += 1;
    } else if (command[i] === '&') {
      // bare background operator — starts a new command segment
      segments.push(current);
      current = '';
      i += 1;
    } else {
      current += command[i];
      i += 1;
    }
  }
  if (current) segments.push(current);
  return segments;
}

/**
 * Split a segment into pipeline parts on single `|` (not `||`).
 */
function splitPipeline(segment) {
  const parts = [];
  let current = '';
  let i = 0;

  while (i < segment.length) {
    if (segment[i] === '|' && segment[i + 1] !== '|' && (i === 0 || segment[i - 1] !== '|')) {
      parts.push(current);
      current = '';
      i += 1;
    } else {
      current += segment[i];
      i += 1;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/**
 * Get the leading program from a simple command string.
 * Strips variable assignments, redirections, and leading whitespace.
 */
function getLeadingProgram(cmd) {
  let s = cmd.trim();

  // Strip leading variable assignments (FOO=bar ...)
  while (/^\w+=\S*\s/.test(s)) {
    s = s.replace(/^\w+=\S*\s+/, '');
  }

  // The first word is the program
  const wordMatch = s.match(/^([\w./@-]+)/);
  return wordMatch ? wordMatch[1] : '';
}

/**
 * Tokenise a simple one-line command into an array of tokens, handling single/double-quoted
 * strings as single tokens (stripping the outer quotes).
 */
function tokenise(cmd) {
  const tokens = [];
  let i = 0;
  const s = cmd.trim();

  while (i < s.length) {
    // skip whitespace
    if (/\s/.test(s[i])) { i++; continue; }

    if (s[i] === '"' || s[i] === "'") {
      const q = s[i];
      i++;
      let tok = '';
      while (i < s.length && s[i] !== q) {
        // Inside double-quotes, unescape \" -> " and \\ -> \
        if (q === '"' && s[i] === '\\' && i + 1 < s.length && (s[i + 1] === '"' || s[i + 1] === '\\')) {
          tok += s[i + 1];
          i += 2;
        } else {
          tok += s[i];
          i++;
        }
      }
      i++; // skip closing quote
      tokens.push(tok);
    } else {
      let tok = '';
      while (i < s.length && !/\s/.test(s[i])) { tok += s[i]; i++; }
      tokens.push(tok);
    }
  }
  return tokens;
}

/**
 * If `cmd` is a shell-wrapper invocation (bash/sh -c "..." or env VAR=val bash -c "..."),
 * return the inner command string; otherwise return null.
 *
 * Handles:
 *   bash -c "..."
 *   sh -c '...'
 *   bash -lc "..."
 *   env CI=1 bash -c "..."
 */
function extractShellCPayload(cmd) {
  const tokens = tokenise(cmd);
  if (tokens.length < 3) return null;

  let idx = 0;

  // Optional: skip `env [VAR=val ...]`
  if (tokens[idx] === 'env') {
    idx++;
    while (idx < tokens.length && /^\w+=/.test(tokens[idx])) { idx++; }
  }

  // Must be a shell program
  if (!SHELL_PROGRAMS.has(tokens[idx])) return null;
  idx++;

  // Must have a -c style flag (skip optional non-c flags before it)
  if (idx >= tokens.length) return null;
  if (!SHELL_C_FLAG_RE.test(tokens[idx])) return null;
  idx++;

  // The next token is the payload string
  if (idx >= tokens.length) return null;
  return tokens[idx];
}

/**
 * Check if a simple command segment (single pipeline part) is a spec execution.
 */
function isSpecExecution(cmd) {
  let program = getLeadingProgram(cmd);
  const trimmed = cmd.trim();

  let normalized = trimmed;
  while (/^\w+=\S*\s/.test(normalized)) {
    normalized = normalized.replace(/^\w+=\S*\s+/, '');
  }

  // Normalize: strip leading ./ and Windows .cmd/.exe suffixes from the leading program
  program = program.replace(/^\.\//, '').replace(/\.(cmd|exe)$/i, '');
  normalized = normalized.replace(/^\.\//, '').replace(/^(\S+)\.(cmd|exe)(\s)/i, '$1$3');

  // Normalize Windows backslash path separators (e.g. node_modules\.bin\playwright)
  if (/^node_modules\\/.test(normalized)) {
    normalized = normalized.replace(/\\/g, '/');
    program = getLeadingProgram(normalized);
  }

  if (program === 'npx') {
    // Tokenize to handle flag-value pairs (e.g. npx -p @playwright/test playwright test)
    const npxTokens = tokenise(normalized);
    const NPX_VALUE_FLAGS = new Set(['-p', '-c', '--package', '--registry', '--cache', '--prefix', '--call']);
    let i = 1;
    while (i < npxTokens.length && npxTokens[i].startsWith('-')) {
      i += NPX_VALUE_FLAGS.has(npxTokens[i]) ? 2 : 1;
    }
    if (i < npxTokens.length && /^playwright(@\S*)?$/.test(npxTokens[i]) &&
        i + 1 < npxTokens.length && npxTokens[i + 1] === 'test') {
      return true;
    }
  } else if (program === 'npm' || program === 'pnpm' || program === 'yarn') {
    // Tokenize to handle flags between 'run' and the script name (e.g. --silent, -s)
    if (/^(npm|pnpm|yarn)\s+run\b/.test(normalized)) {
      const runTokens = tokenise(normalized);
      let k = 2;
      while (k < runTokens.length && runTokens[k].startsWith('-')) k++;
      if (k < runTokens.length && /\S*(e2e|test|spec|suite|playwright|regression|smoke)\S*/i.test(runTokens[k])) return true;
    }
    if (/^(npm|pnpm|yarn)\s+test\b/.test(normalized)) return true;
    // exec / dlx — binary execution (npm exec, pnpm exec, pnpm dlx, yarn dlx)
    if (/^(npm|pnpm|yarn)\s+(exec|dlx)\s+/.test(normalized)) {
      const execTokens = tokenise(normalized);
      let j = 2;
      while (j < execTokens.length && execTokens[j].startsWith('-')) j++;
      if (j < execTokens.length && /^playwright(@\S*)?$/.test(execTokens[j]) &&
          j + 1 < execTokens.length && execTokens[j + 1] === 'test') {
        return true;
      }
    }
    // pnpm/yarn can run local binaries directly (pnpm playwright test)
    if (/^(pnpm|yarn)\s+playwright(@\S*)?\s+test\b/.test(normalized)) return true;
  } else if (program === 'node_modules/.bin/playwright') {
    if (/^node_modules\/\.bin\/playwright\s+test\b/.test(normalized)) return true;
  } else if (program === 'playwright') {
    if (/^playwright(@\S*)?\s+test\b/.test(normalized)) return true;
  }

  return false;
}

/**
 * Detect browser-walk commands (playwright-cli).
 */
function isBrowserWalk(cmd) {
  let program = getLeadingProgram(cmd);
  const trimmed = cmd.trim();
  let normalized = trimmed;
  while (/^\w+=\S*\s/.test(normalized)) {
    normalized = normalized.replace(/^\w+=\S*\s+/, '');
  }
  // Normalize: strip leading ./ and Windows .cmd/.exe suffixes from the leading program
  program = program.replace(/^\.\//, '').replace(/\.(cmd|exe)$/i, '');
  normalized = normalized.replace(/^\.\//, '').replace(/^(\S+)\.(cmd|exe)(\s)/i, '$1$3');
  if (program === 'playwright-cli' || program === 'npx') {
    if (/^(npx\s+(?:-\S+\s+)*)?playwright-cli(@\S*)?\b/.test(normalized)) return true;
  }
  return false;
}

/** Programs whose argument is itself a command — strip the runner and its flags, classify the rest */
const COMMAND_RUNNERS = new Set(['xargs', 'timeout', 'nohup', 'time', 'stdbuf', 'nice', 'command']);

/**
 * If `cmd`'s leading program is a command runner, strip the runner and its flags,
 * return the remaining command string. Otherwise return null.
 */
function extractRunnerPayload(cmd) {
  const tokens = tokenise(cmd);
  if (tokens.length < 2) return null;

  let idx = 0;
  // Skip leading variable assignments (FOO=bar ...)
  while (idx < tokens.length && /^\w+=/.test(tokens[idx])) idx++;
  if (idx >= tokens.length) return null;

  const program = tokens[idx];
  if (!COMMAND_RUNNERS.has(program)) return null;
  idx++;

  // Skip the runner's own flags
  while (idx < tokens.length && tokens[idx].startsWith('-')) idx++;

  // For timeout, also skip the duration argument (first positional after flags)
  if (program === 'timeout' && idx < tokens.length) idx++;

  if (idx >= tokens.length) return null;
  return tokens.slice(idx).join(' ');
}

/**
 * Extract command payloads from grouping / substitution constructs.
 * Handles: subshell ( ... ), command substitution $( ... ), backtick ` ... `.
 * Respects single-quote boundaries (content inside '...' is literal, not a substitution).
 */
function extractGroupingPayloads(cmd) {
  const payloads = [];
  const trimmed = cmd.trim();

  // 1. Entire part is a subshell: ( ... )
  if (trimmed.length >= 2 && trimmed[0] === '(' && trimmed[0] !== '$') {
    let depth = 1;
    let j = 1;
    while (j < trimmed.length && depth > 0) {
      if (trimmed[j] === '(') depth++;
      else if (trimmed[j] === ')') depth--;
      j++;
    }
    if (depth === 0 && j === trimmed.length) {
      payloads.push(trimmed.slice(1, j - 1));
      return payloads; // subshell consumes the entire part
    }
  }

  // 2. Scan for $(...) and `...` outside single quotes
  let i = 0;
  let inSingle = false;

  while (i < trimmed.length) {
    const ch = trimmed[i];

    if (ch === "'" && !inSingle) { inSingle = true; i++; continue; }
    if (ch === "'" && inSingle)  { inSingle = false; i++; continue; }
    if (inSingle) { i++; continue; }

    // $( ... ) command substitution (skip $(( arithmetic )))
    if (ch === '$' && i + 1 < trimmed.length && trimmed[i + 1] === '(') {
      if (i + 2 < trimmed.length && trimmed[i + 2] === '(') { i++; continue; }
      let depth = 1;
      const start = i + 2;
      let j = start;
      while (j < trimmed.length && depth > 0) {
        if (trimmed[j] === '(') depth++;
        else if (trimmed[j] === ')') depth--;
        if (depth > 0) j++;
      }
      if (depth === 0) payloads.push(trimmed.slice(start, j));
      i = j + 1;
      continue;
    }

    // Backtick substitution
    if (ch === '`') {
      const start = i + 1;
      let j = start;
      while (j < trimmed.length && trimmed[j] !== '`') j++;
      if (j < trimmed.length) payloads.push(trimmed.slice(start, j));
      i = j + 1;
      continue;
    }

    i++;
  }

  return payloads;
}

/**
 * Data-aware command analysis. Fires only on the EXECUTED program.
 * v4: per-pipeline-part classification — every part is checked for shell-c wrappers
 * (recursively), spec execution, and browser walks. No segment-level data-command
 * skip runs before classification; a data prefix can never hide a gated part.
 * v5: grouping/substitution ($(), backticks, subshell parens), command-runner stripping
 * (xargs, timeout, nohup, time, stdbuf, nice), newline splitting, npx-flag tolerance.
 * @param {string} command - The full bash command string from the Bash tool
 * @param {number} [_depth=0] - Internal recursion depth for shell-c unwrap
 * @returns {{ allow: boolean, pattern?: string, reason?: string }}
 */
export function checkCommand(command, _depth = 0) {
  // Recursion bound: 5 levels far exceeds real-world nesting (1–2 typical).
  // Deeper is pathological — deny rather than hang the hook.
  if (_depth > 5) {
    return {
      allow: false,
      pattern: SPEC_PATTERN_NAME,
      reason: 'Shell wrapper recursion depth exceeded (>5) — denied',
    };
  }

  // Step 1: Strip heredoc bodies — text inside heredocs is data, not code
  const stripped = stripHeredocBodies(command);

  // Step 2: Split into compound segments (&&, ||, ;)
  const segments = splitCompoundCommand(stripped);

  // Step 3: For each segment, classify every pipeline part by the full logic
  for (const segment of segments) {
    if (!segment.trim()) continue;

    const pipelineParts = splitPipeline(segment);

    for (const part of pipelineParts) {
      const trimmedPart = part.trim();
      if (!trimmedPart) continue;

      // 3a: shell -c wrapper → recurse the full check on the payload
      const shellPayload = extractShellCPayload(trimmedPart);
      if (shellPayload !== null) {
        const inner = checkCommand(shellPayload, _depth + 1);
        if (!inner.allow) {
          return {
            allow: false,
            pattern: SPEC_PATTERN_NAME,
            reason: `Detected spec/test execution inside shell wrapper: ${trimmedPart.slice(0, 80)}`,
          };
        }
        continue;
      }

      // 3b: command runner (xargs, timeout, nohup, etc.) → strip runner + flags, recurse
      const runnerPayload = extractRunnerPayload(trimmedPart);
      if (runnerPayload !== null) {
        const inner = checkCommand(runnerPayload, _depth + 1);
        if (!inner.allow) {
          return {
            allow: false,
            pattern: SPEC_PATTERN_NAME,
            reason: `Detected spec/test execution via command runner: ${trimmedPart.slice(0, 80)}`,
          };
        }
        continue;
      }

      // 3c: grouping / substitution — ( ... ), $( ... ), backticks → recurse each payload
      const groupPayloads = extractGroupingPayloads(trimmedPart);
      for (const payload of groupPayloads) {
        const inner = checkCommand(payload, _depth + 1);
        if (!inner.allow) {
          return {
            allow: false,
            pattern: SPEC_PATTERN_NAME,
            reason: `Detected spec/test execution inside grouping construct: ${trimmedPart.slice(0, 80)}`,
          };
        }
      }

      // 3d: direct spec execution or browser walk → deny
      if (isSpecExecution(trimmedPart) || isBrowserWalk(trimmedPart)) {
        return {
          allow: false,
          pattern: SPEC_PATTERN_NAME,
          reason: `Detected spec/test execution in segment: ${segment.trim().slice(0, 80)}`,
        };
      }
    }
    // 3c: no part triggered — segment is safe regardless of data-command status
  }

  return { allow: true };
}

// ─── Hook Binary Infrastructure ───────────────────────────────────────────────

function emit(decision, reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision,
      permissionDecisionReason: reason,
    },
  }) + '\n');
}

function readMode() {
  try {
    const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
    if (['off', 'announce', 'deny'].includes(cfg.mode)) return cfg.mode;
  } catch { /* absent or unreadable — default to announce */ }
  return 'announce';
}

function hasPipelineIdentity(transcriptPath) {
  try {
    if (!transcriptPath || !existsSync(transcriptPath)) return false;
    const lines = readFileSync(transcriptPath, 'utf8').split(/\r?\n/);
    const start = Math.max(0, lines.length - LOOKBACK_LINES);
    for (let i = lines.length - 1; i >= start; i--) {
      const line = lines[i].trim();
      if (!line) continue;
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }
      const msg = obj.message ?? obj;
      if (!msg || msg.role !== 'assistant' || !Array.isArray(msg.content)) continue;
      // PBUG-09: scan content in REVERSE so the LAST identity Skill call in the message decides.
      for (let ci = msg.content.length - 1; ci >= 0; ci--) {
        const c = msg.content[ci];
        if (c?.type !== 'tool_use' || c.name !== 'Skill') continue;
        if (c.input?.skill !== 'identity') continue;
        const arg = String(c.input.args || '').trim().split(/\s+/)[0].toLowerCase();
        return PIPELINE_IDENTITIES.has(arg);
      }
    }
    return false;
  } catch { return false; }
}

function fireTelemetry(gate, verdict, target, cwdPath) {
  try {
    const logPath = join(cwdPath || '.', '.claude', 'state', 'gate-fires.log');
    mkdirSync(dirname(logPath), { recursive: true });
    appendFileSync(logPath, `${gate}, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
  } catch { /* swallow — telemetry failure must never affect gate verdict */ }
}

function logAudit(sessionId, command, pattern) {
  try {
    mkdirSync(dirname(AUDIT_LOG), { recursive: true });
    const entry = JSON.stringify({ ts: new Date().toISOString(), session_id: sessionId, command: command.slice(0, 500), pattern }) + '\n';
    appendFileSync(AUDIT_LOG, entry, 'utf8');
  } catch (e) {
    process.stderr.write(`labor-gate: audit log write failed: ${e.message}\n`);
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  try {
    let payload;
    try {
      payload = JSON.parse(await readStdin());
    } catch {
      emit('allow', 'labor-gate: stdin parse failed — fail-open');
      return;
    }

    const { session_id, transcript_path, tool_name, tool_input, cwd = '' } = payload;

    if (tool_name !== 'Bash') {
      emit('allow', 'labor-gate: not Bash — allow');
      return;
    }

    const command = tool_input?.command || '';

    // Use data-aware analysis instead of raw regex
    const result = checkCommand(command);

    if (result.allow) {
      emit('allow', 'labor-gate: no real execution detected — allow');
      return;
    }

    const matchedPattern = result.pattern;
    const mode = readMode();

    if (mode === 'off') {
      emit('allow', 'labor-gate: mode=off — allow');
      return;
    }

    if (hasPipelineIdentity(transcript_path)) {
      emit('allow', 'labor-gate: pipeline identity active — allow');
      return;
    }

    if (mode === 'announce') {
      logAudit(session_id, command, matchedPattern);
      fireTelemetry('labor-gate', 'announce', session_id, cwd);
      emit('allow', 'labor-gate: mode=announce — allow (audit logged)');
      return;
    }

    // mode === 'deny'
    logAudit(session_id, command, matchedPattern);
    fireTelemetry('labor-gate', 'deny', session_id, cwd);
    emit('deny',
      `LABOR GATE: Spec/test execution detected (${matchedPattern}). ` +
      'Spec runs and browser walks must be ticketed to a T0/T1 worker via copilot-worker.sh.'
    );
  } catch (e) {
    process.stderr.write(`labor-gate: error: ${e.message}\n`);
    emit('allow', 'labor-gate: internal error — fail-open');
  }
}

// Run as binary only when executed directly (not imported)
const isMainModule = process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  main().catch(e => {
    process.stderr.write(`labor-gate: fatal: ${e.message}\n`);
    emit('allow', 'labor-gate: fatal error — fail-open');
  });
}
