#!/usr/bin/env node
// check-no-verify.mjs — PreToolUse hook lib. Hard-blocks git hook-bypass on Bash
// commands so the local pre-commit / pre-push gates can never be skipped.
//
// WHY (COUNCIL AUDIT 2026-07-08): the spec↔MD↔XLSX parity gate + xlsx-freshness
// gate are correct and were live, but they live ONLY in per-clone git hooks —
// advisory, not mandatory. Commit 467cbeb1 committed a spec+workbook WITHOUT the
// MD by skipping the hooks (`git commit --no-verify`; its message even claimed
// "parity gate green" while the tree deterministically failed). This gate removes
// the bypass at the source: an agent (over-eager, or prompt-injected) may not run
// --no-verify / disable core.hooksPath. Server-side CI is the real backstop; this
// stops the local vector.
//
// NON-OVERRIDABLE BY DESIGN — there is deliberately no override handshake. If a
// gate is genuinely broken, the *human* runs the command manually in a terminal
// (this only gates Claude's Bash tool, never the user's own shell).
//
// Posture: fail-OPEN on read/parse error (never wedge a session); DENY only on a
// positive bypass match. `--self-test` runs fixtures.

import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const STATE_DIR = join(REPO_ROOT, '.claude', 'state');
const FAILURE_LOG = join(STATE_DIR, 'hook-failures.log');
const GATE_FIRES_LOG = join(STATE_DIR, 'gate-fires.log');

const DENY_MSG =
  '[NO-VERIFY BLOCKED] This command skips the git pre-commit/pre-push gates ' +
  '(spec↔MD↔XLSX parity + xlsx-freshness). Bypassing those gates is exactly how the ' +
  'toolbar_io deliverable drifted at commit 467cbeb1 (see COUNCIL AUDIT). This block is ' +
  'NON-OVERRIDABLE by the agent. Fix the underlying gate failure and commit normally. ' +
  'If a gate is truly broken, the human must run the command manually in a terminal — ' +
  'the agent may not skip it.';

// Detects git hook-bypass in a Bash command string. Quote-stripping removes
// commit-message bodies so `-m "fix -n bug"` cannot false-trigger the short-flag
// check; the short-flag check is scoped to the `git commit` shell-segment only so
// an unrelated chained `... && foo -n` cannot false-trigger either.
export function isBypass(cmdRaw) {
  const cmd = String(cmdRaw || '');
  if (!cmd) return false;
  // Quote-stripped view: commit-message bodies are removed. Real flags are never
  // inside quotes, so flag checks run on this to avoid message false-positives.
  const unquoted = cmd.replace(/"[^"]*"/g, ' ').replace(/'[^']*'/g, ' ');

  // 1. Explicit --no-verify (commit / push / merge) — the primary, demonstrated
  //    vector. Checked on unquoted so a message mentioning "--no-verify" is not a
  //    false positive.
  if (/--no-verify\b/.test(unquoted)) return true;

  // 2. Inline hooks-disable: `git -c core.hooksPath=<anything> commit ...`.
  //    Checked on RAW — a quoted `-c "core.hooksPath=x"` is still a real bypass;
  //    a message literally containing "core.hooksPath=" is a negligible over-block.
  if (/\bcore\.hooksPath\s*=/.test(cmd)) return true;

  // 3. Persistent hooks-disable: `git config [...] core.hooksPath <value>` (write
  //    forms); read forms (--get / --list) stay allowed.
  if (/\bgit\s+config\b/.test(cmd) && /\bcore\.hooksPath\b/.test(cmd) && !/--get\b|--list\b/.test(cmd)) return true;

  // 4. `git commit -n` / clustered short flag containing n (e.g. -nm, -anm).
  //    Scoped to the git-commit shell-segment so neither message bodies nor an
  //    unrelated chained `... && foo -n` can false-match.
  const commitSeg = unquoted.split(/&&|\|\||;|\|/).find(s => /\bgit\s+commit\b/.test(s));
  if (commitSeg && /(?:^|\s)-[a-zA-Z]*n[a-zA-Z]*(?=\s|$)/.test(commitSeg)) return true;

  return false;
}

function emitAllow(reason) {
  const out = { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' } };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
}

function emitDeny(reason) {
  try { if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true }); appendFileSync(GATE_FIRES_LOG, `no-verify-gate, ${new Date().toISOString()}, deny, bash-command\n`); } catch {}
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
}

function failOpen(reason) {
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} check-no-verify: ${reason}\n`);
  } catch { /* swallow */ }
  emitAllow();
}

function runHook() {
  let stdin = '';
  try { stdin = readFileSync(0, 'utf8'); } catch (e) { return failOpen(`stdin read failed: ${e.message}`); }

  let payload;
  try { payload = JSON.parse(stdin); } catch (e) { return failOpen(`stdin JSON parse failed: ${e.message}`); }

  try {
    const toolName = payload.tool_name || payload.toolName || '';
    if (toolName !== 'Bash') return emitAllow();            // only Bash commands can carry the flag
    const toolInput = payload.tool_input || payload.toolInput || {};
    const cmd = toolInput.command || '';
    if (isBypass(cmd)) return emitDeny(DENY_MSG);
    emitAllow();
  } catch (e) {
    failOpen(`hook threw: ${e.message}`);
  }
}

function runSelfTest() {
  let pass = 0, fail = 0;
  const t = (label, cond) => { if (cond) pass++; else { console.error(`FAIL: ${label}`); fail++; } };

  // Should BLOCK
  t('commit --no-verify',        isBypass('git commit --no-verify -m "x"') === true);
  t('commit -m then --no-verify', isBypass('git commit -m "x" --no-verify') === true);
  t('push --no-verify',          isBypass('git push --no-verify') === true);
  t('merge --no-verify',         isBypass('git merge --no-verify foo') === true);
  t('commit -n',                 isBypass('git commit -n -m "x"') === true);
  t('commit -nm cluster',        isBypass('git commit -nm "x"') === true);
  t('commit -anm cluster',       isBypass('git commit -anm "x"') === true);
  t('inline core.hooksPath',     isBypass('git -c core.hooksPath=/dev/null commit -m "x"') === true);
  t('inline hooksPath quoted',   isBypass('git -c "core.hooksPath=/dev/null" commit -m "x"') === true);
  t('config set hooksPath',      isBypass('git config core.hooksPath /dev/null') === true);
  t('config set hooksPath =',    isBypass('git config core.hooksPath=/dev/null') === true);

  // Should ALLOW
  t('plain commit -m',           isBypass('git commit -m "x"') === false);
  t('commit -am',                isBypass('git commit -am "msg"') === false);
  t('commit --amend',            isBypass('git commit --amend -m "x"') === false);
  t('message contains -n',       isBypass('git commit -m "fix -n flag bug"') === false);
  t('message contains no-verify', isBypass('git commit -m "note about --no-verify usage"') === false); // flag text inside message → NOT blocked
  t('chained unrelated -n',      isBypass('git commit -m "x" && npm run build -n') === false);
  t('config --get hooksPath',    isBypass('git config --get core.hooksPath') === false);
  t('non-git -n',                isBypass('npm run test -n') === false);
  t('empty',                     isBypass('') === false);
  t('git status',                isBypass('git status') === false);

  console.log(`check-no-verify self-test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

const mode = process.argv[2] || '';
if (mode === '--self-test') runSelfTest();
else runHook();
