#!/usr/bin/env node
// check-graft-ship.mjs — PreToolUse hook lib. BACKSTOP for the Claude-Bash git-commit vector:
// Sev: S3 | Graduating incident: P3-06 (graft-ship telemetry gap 2026-08-03)
// blocks a `git commit` when a file is staged AND has further unstaged worktree changes — i.e.
// the commit would capture the STALE index copy, not the tested working tree (the NM-2265
// stale-index defect: a graft was `git add`-ed, then corrected in the worktree, never re-staged).
//
// SCOPE — do NOT overclaim. This gates ONLY Claude's Bash tool. It does NOT gate a human's own
// terminal, a GUI client, another agent, or server-side CI. The real PREVENTION is the /graft
// skill's "index == tested worktree" completion invariant; this is defense-in-depth for the one
// vector a PreToolUse hook can actually see.
//
// NON-OVERRIDABLE by the agent (mirrors check-no-verify.mjs): there is deliberately NO ack token.
// A genuine partial-stage commit is performed by the human in their own terminal (ungated). An
// over-eager or prompt-injected agent must not be able to wave this gate through.
//
// Posture: fail-OPEN on ANY error (never wedge a session); DENY only on confirmed drift.
// `--self-test` runs fixtures.

import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { fireTelemetry } from './hook-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const STATE_DIR = join(REPO_ROOT, '.claude', 'state');
const FAILURE_LOG = join(STATE_DIR, 'hook-failures.log');
const GATE_FIRES_LOG = join(STATE_DIR, 'gate-fires.log');

// --- Emit helpers (identical contract to check-no-verify.mjs) ---

function emitAllow(reason) {
  const out = { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' } };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
}

function emitDeny(reason) {
  fireTelemetry('graft-ship-gate', 'deny', 'bash-command');
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
}

function failOpen(reason) {
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} check-graft-ship: ${reason}\n`);
  } catch { /* swallow */ }
  emitAllow();
}

// --- Pure detection (unit-testable without a real git repo) ---

/**
 * True iff the command contains at least one `git commit` that does NOT auto-stage the worktree
 * (no -a / --all / clustered short flag containing 'a'). Scans EVERY shell segment, so a safe
 * `commit -am` earlier in a chain cannot mask a later unsafe `commit -m` (`git commit -am x &&
 * git commit -m y` → true). Tolerates git global options before the subcommand
 * (`git -c k=v commit`, `git -C path commit`, `git --no-pager commit`). Excludes `git commit-tree`.
 */
export function isCommit(cmdRaw) {
  const cmd = String(cmdRaw || '');
  if (!cmd) return false;

  // Drop quoted strings so a commit MESSAGE can never trigger the flag/keyword checks.
  const unquoted = cmd.replace(/"[^"]*"/g, ' ').replace(/'[^']*'/g, ' ');

  // Scan each shell segment independently.
  const segments = unquoted.split(/&&|\|\||;|\|/);

  // `git`, then zero+ global options (incl. `-c key=val` / `-C path` value tokens and
  // `--opt` / `--opt=val`), then the `commit` subcommand as a whole word (not `commit-tree`).
  const COMMIT_SEG = /\bgit\s+(?:-[A-Za-z]\S*(?:\s+[^\s-]\S*)?\s+|--[A-Za-z][\w-]*(?:=\S+)?\s+)*commit(?![\w-])/;

  let gateEligible = false;
  for (const seg of segments) {
    if (!COMMIT_SEG.test(seg)) continue;
    const commitPart = seg.slice(seg.search(/\bcommit(?![\w-])/)); // `commit ...` onward
    if (/--all\b/.test(commitPart)) continue;                              // auto-stage → drift-safe
    if (/(?:^|\s)-[a-zA-Z]*a[a-zA-Z]*(?=\s|$)/.test(commitPart)) continue; // -a / -am / cluster → safe
    gateEligible = true;                                                    // a plain, non-auto-stage commit
  }
  return gateEligible;
}

/**
 * Intersection of the staged set (index vs HEAD) and the unstaged set (worktree vs index).
 * A path in BOTH is staged AND further modified in the worktree — a plain commit captures the
 * stale staged copy of exactly these files. Robust to every status code (M/T/A/D/R/C) and to
 * paths with spaces because the inputs come from `git diff ... -z` (NUL-delimited).
 */
export function driftedPaths(stagedList, unstagedList) {
  const unstaged = new Set(unstagedList);
  const out = [];
  for (const p of stagedList) {
    if (p && unstaged.has(p)) out.push(p);
  }
  return out;
}

// --- Hook entry point ---

function gitNames(args) {
  const out = execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', timeout: 10000 });
  return out.split('\0').filter(Boolean);
}

function runHook() {
  let stdin = '';
  try { stdin = readFileSync(0, 'utf8'); } catch (e) { return failOpen(`stdin read failed: ${e.message}`); }

  let payload;
  try { payload = JSON.parse(stdin); } catch (e) { return failOpen(`stdin JSON parse failed: ${e.message}`); }

  try {
    const toolName = payload.tool_name || payload.toolName || '';
    if (toolName !== 'Bash') return emitAllow();

    const cmd = (payload.tool_input || payload.toolInput || {}).command || '';

    // Cheap string check first — only shell out to git when it IS a gate-eligible commit.
    if (!isCommit(cmd)) return emitAllow();

    let staged, unstaged;
    try {
      staged = gitNames(['diff', '--cached', '--name-only', '-z']);
      unstaged = gitNames(['diff', '--name-only', '-z']);
    } catch (e) {
      return failOpen(`git diff failed: ${e.message}`);
    }

    const drift = driftedPaths(staged, unstaged);
    if (drift.length === 0) return emitAllow();

    const list = drift.map(f => `  • ${f}`).join('\n');
    emitDeny(
      `[GRAFT-SHIP BLOCKED] ${drift.length} file(s) are staged but changed again in the working tree:\n` +
      `${list}\n\n` +
      `A commit now captures the STALE staged copy — not the code you tested (NM-2265 class defect).\n` +
      `Run \`git add\` on those paths to sync the index to the working tree, then commit.\n` +
      `(This gate applies only to Claude's Bash tool — a deliberate partial-stage commit is done from your own terminal.)`,
    );
  } catch (e) {
    failOpen(`hook threw: ${e.message}`);
  }
}

// --- Self-test ---

function runSelfTest() {
  let pass = 0, fail = 0;
  const t = (label, cond) => { if (cond) pass++; else { console.error(`FAIL: ${label}`); fail++; } };

  // === isCommit — should GATE (true): plain commits without auto-stage ===
  t('plain commit -m',                 isCommit('git commit -m "x"') === true);
  t('commit then push',                isCommit('git commit -m "x" && git push') === true);
  t('commit --amend',                  isCommit('git commit --amend -m "x"') === true);
  t('commit with pathspec',            isCommit('git commit -m "x" -- src/') === true);
  t('git -c k=v commit (global opt)',  isCommit('git -c core.hooksPath=/dev/null commit -m "y"') === true);
  t('git --no-pager commit',           isCommit('git --no-pager commit -m "z"') === true);
  t('chained safe-then-unsafe commit', isCommit('git commit -am "safe" && git commit -m "unsafe"') === true);

  // === isCommit — should NOT gate (false): auto-stage, or not a plain git commit ===
  t('commit -am (auto-stage)',         isCommit('git commit -am "x"') === false);
  t('commit -a -m (auto-stage)',       isCommit('git commit -a -m "x"') === false);
  t('commit --all -m (auto-stage)',    isCommit('git commit --all -m "x"') === false);
  t('commit -nam cluster (auto)',      isCommit('git commit -nam "x"') === false);
  t('both segments auto-stage',        isCommit('git commit -am "a" && git commit -a -m "b"') === false);
  t('git status (not commit)',         isCommit('git status') === false);
  t('git push (not commit)',           isCommit('git push') === false);
  t('npm run commit (not git)',        isCommit('npm run commit') === false);
  t('git commit-tree (plumbing)',      isCommit('git commit-tree abc123') === false);
  t('git log commit (arg, not subcmd)',isCommit('git log commit') === false);
  t('empty string',                    isCommit('') === false);
  t('message body contains commit',    isCommit('git status -m "commit stuff"') === false);

  // === driftedPaths — intersection of staged and unstaged sets ===
  t('drift: basic intersection',       JSON.stringify(driftedPaths(['a.ts', 'b.ts', 'c.ts'], ['b.ts', 'c.ts', 'd.ts'])) === JSON.stringify(['b.ts', 'c.ts']));
  t('drift: no overlap → []',          driftedPaths(['x.ts'], ['y.ts']).length === 0);
  t('drift: empty staged → []',        driftedPaths([], ['a.ts']).length === 0);
  t('drift: empty unstaged → []',      driftedPaths(['a.ts'], []).length === 0);
  t('drift: path with spaces',         JSON.stringify(driftedPaths(['a b.ts'], ['a b.ts'])) === JSON.stringify(['a b.ts']));

  console.log(`check-graft-ship self-test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

const mode = process.argv[2] || '';
if (mode === '--self-test') runSelfTest();
else runHook();
