#!/usr/bin/env node
// check-allowlist-write.mjs — PreToolUse hook lib. Denies agent writes to the unresolved-probe allowlist.
// Sev: S0 | Graduating incident: PLAN_70 Phase 5 (agent self-exemption defeats the gate entirely)
//
// PURPOSE: The allowlist at .claude/walk-unresolved-allowlist.json is owner-gated: an agent that
// can author its own exemption has no gate at all. This hook denies any Edit/Write/Create targeting
// that path, plus shell commands that name the file alongside a write operator.
// Only the human owner may edit the allowlist directly in their terminal.
//
// THIS IS A SPEED BUMP, NOT A SECURITY BOUNDARY.
// Residual (stated plainly per LR-074 §74.4): this hook does NOT protect against:
//   - In-session shell writes via indirect means (cp, mv, sed -i, node -e fs.writeFileSync,
//     string-concatenated paths, aliased commands, or any shell construct not matching the
//     simple heuristic below)
//   - Writes from separate worker processes (sub-agents spawned via `task` tool) which do not
//     pass through the parent session's PreToolUse hooks
//   - Path obfuscation (.claude/./walk-..., symlinks, Windows case variance)
// The REAL protection is the validator layer: it requires `reviewed: true` plus every field,
// so an agent-authored exemption must falsely claim human review — detectable in audit.
// That detective control scales; this matcher does not (LR-074 §74.2 precedent: the prior
// write-protection gate was deleted after six adversarial rounds each producing a fresh bypass).
//
// Posture: fail-OPEN on read/parse error (never wedge a session); DENY only on positive match.

import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const STATE_DIR = join(REPO_ROOT, '.claude', 'state');
const FAILURE_LOG = join(STATE_DIR, 'hook-failures.log');

const PROTECTED_PATHS = [
  '.claude/walk-unresolved-allowlist.json',
];

const PROTECTED_BASENAME = 'walk-unresolved-allowlist.json';

const DENY_MSG =
  '[ALLOWLIST-WRITE-GATE] Denied: write targets .claude/walk-unresolved-allowlist.json which is ' +
  'owner-gated. An agent must not author its own exemptions. Only the human owner may edit the ' +
  'allowlist directly in their terminal.';

/**
 * Check whether a tool invocation targets a protected allowlist file.
 * @param {object} input - The hook input (tool_name, tool_input with file_path/path/command)
 * @returns {{ decision: string, reason?: string }}
 */
export function checkAllowlistWrite(input) {
  try {
    const toolName = input?.tool_name || '';
    const toolInput = input?.tool_input || {};

    // The tool names Claude actually emits for file writes
    const writeTools = ['Edit', 'Write', 'Create', 'MultiEdit'];
    if (writeTools.includes(toolName)) {
      const targetPath = toolInput.file_path || toolInput.path || toolInput.target || '';
      const normalized = targetPath.replace(/\\/g, '/');
      for (const protectedPath of PROTECTED_PATHS) {
        if (normalized.includes(protectedPath)) {
          return { decision: 'deny', reason: DENY_MSG };
        }
      }
      return { decision: 'allow' };
    }

    // Shell tools: deny if the command names the protected file AND contains a write operator
    if (toolName === 'Bash' || toolName === 'PowerShell') {
      const cmd = toolInput.command || toolInput.input || '';
      if (cmd.includes(PROTECTED_BASENAME)) {
        // LR-074 §74.3: deny an unmodeled context that names the target.
        // We allow pure reads (cat, type, Get-Content without redirect) but deny anything else.
        const readOnly = /^\s*(cat|type|less|more|head|tail|Get-Content|gc)\s/.test(cmd.trim())
          && !/>/.test(cmd) && !/tee\b/.test(cmd) && !/\|/.test(cmd);
        if (!readOnly) {
          return { decision: 'deny', reason: DENY_MSG };
        }
      }
      return { decision: 'allow' };
    }

    // Any other tool — not our concern
    return { decision: 'allow' };
  } catch {
    // Fail-open: never wedge a session
    return { decision: 'allow' };
  }
}

// --- Production hook entry point (reads stdin, emits hook decision JSON) ---

function emitAllow(reason) {
  const out = { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' } };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
}

function emitDeny(reason) {
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(
      join(STATE_DIR, 'gate-fires.log'),
      `allowlist-write-gate, ${new Date().toISOString()}, deny, allowlist\n`
    );
  } catch { /* swallow */ }
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
}

function failOpen(reason) {
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} check-allowlist-write: ${reason}\n`);
  } catch { /* swallow */ }
  emitAllow();
}

function runHook() {
  let stdin = '';
  try { stdin = readFileSync(0, 'utf8'); } catch (e) { return failOpen(`stdin read failed: ${e.message}`); }

  let payload;
  try { payload = JSON.parse(stdin); } catch (e) { return failOpen(`stdin JSON parse failed: ${e.message}`); }

  try {
    const result = checkAllowlistWrite(payload);
    if (result.decision === 'deny') return emitDeny(result.reason);
    emitAllow();
  } catch (e) {
    failOpen(`hook threw: ${e.message}`);
  }
}

// --- Self-test ---

function runSelfTest() {
  let pass = 0; let fail = 0;
  function assert(label, cond) {
    if (cond) { console.log(`  PASS: ${label}`); pass++; }
    else { console.error(`  FAIL: ${label}`); fail++; }
  }

  // Direct file-write tools (the names Claude actually emits)
  const r1 = checkAllowlistWrite({ tool_name: 'Edit', tool_input: { file_path: '/repo/.claude/walk-unresolved-allowlist.json' } });
  assert('Edit to allowlist denied', r1.decision === 'deny');

  const r1b = checkAllowlistWrite({ tool_name: 'Write', tool_input: { file_path: '.claude/walk-unresolved-allowlist.json' } });
  assert('Write to allowlist denied', r1b.decision === 'deny');

  const r1c = checkAllowlistWrite({ tool_name: 'Create', tool_input: { path: 'C:\\Users\\x\\.claude\\walk-unresolved-allowlist.json' } });
  assert('Create to allowlist denied (backslash path)', r1c.decision === 'deny');

  // Edit targeting other file → allow
  const r2 = checkAllowlistWrite({ tool_name: 'Edit', tool_input: { file_path: '/repo/.claude/guardrail-config.json' } });
  assert('Edit to other file allowed', r2.decision === 'allow');

  // Bash with redirect to allowlist → deny
  const r4 = checkAllowlistWrite({ tool_name: 'Bash', tool_input: { command: 'echo "{}" > .claude/walk-unresolved-allowlist.json' } });
  assert('Bash redirect to allowlist denied', r4.decision === 'deny');

  // Bash naming the file without a pure-read form → deny (LR-074 §74.3: unmodeled = deny)
  const r4b = checkAllowlistWrite({ tool_name: 'Bash', tool_input: { command: 'node -e "fs.writeFileSync(\'walk-unresolved-allowlist.json\',\'{}\')"' } });
  assert('Bash node -e writing allowlist denied', r4b.decision === 'deny');

  // Bash with pure read → allow
  const r5 = checkAllowlistWrite({ tool_name: 'Bash', tool_input: { command: 'cat .claude/walk-unresolved-allowlist.json' } });
  assert('Bash cat of allowlist allowed', r5.decision === 'allow');

  // Null/undefined input → fail-open (allow)
  const r6 = checkAllowlistWrite(null);
  assert('null input fails open', r6.decision === 'allow');

  // PowerShell Set-Content targeting allowlist → deny
  const r7 = checkAllowlistWrite({ tool_name: 'PowerShell', tool_input: { command: 'Set-Content .claude/walk-unresolved-allowlist.json -Value "{}"' } });
  assert('PowerShell Set-Content to allowlist denied', r7.decision === 'deny');

  // Unrelated tool → allow
  const r8 = checkAllowlistWrite({ tool_name: 'Read', tool_input: { file_path: '.claude/walk-unresolved-allowlist.json' } });
  assert('Read tool always allowed', r8.decision === 'allow');

  console.log(`\ncheck-allowlist-write self-test: ${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

const mode = process.argv[2] || '';
if (mode === '--self-test') runSelfTest();
else runHook();
