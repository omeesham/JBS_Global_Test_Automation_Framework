#!/usr/bin/env node
// delegation-primer.mjs — LOCAL-ONLY (this PC). Lives in the home dir, never tracked/pushed.
// SessionStart hook: injects the delegation-first doctrine into EVERY session (startup, resume,
// /clear, post-compaction) whose cwd carries the worker extension and whose GATE is on.
// Installed 2026-07-10 with Rutvik's explicit in-chat GO (grant PRIMER-INSTALL-GO-2026-07-10).
//
// v2 (2026-07-16, Rutvik in-chat decision, hand-applied): /assistants is the copilot MASTER
// switch — it selects which HARNESS the session runs under. Explicit {"assistant":"off"} =
// copilot layer OFF = plain Claude Code harness: the delegation-first doctrine is NOT injected;
// a short solo-mode notice is injected instead. ON = CEO harness (full doctrine, unchanged).
// Fail-safe polarity: absent/unparseable state file = NOT off (doctrine injects as before).
//
// LCD03 (2026-07-16): identity block prepended to ON-mode output (after ASSISTANT MODE line,
// before delegation rules) so CEO identity survives /compact SessionStart re-fire.
// OFF-mode: no CEO identity, no AUTO-IDENTITY token — solo means solo (dispatcher constraint).
//
// Why: a live session personally ran ~13 browser testid dumps because nothing at session start
// told it the worker fleet exists — its work shape (Bash + .md writes) never hits the delegation
// gate's denied paths, so the gate alone can't teach. This closes the awareness escape at the
// START of the session; final-q's Receipt closes it at the END.
//
// Fail policy: never brick a session (SessionStart can't block anyway), but failures are NOT
// invisible — every caught error is appended to ~/.claude/state/delegation-gate-failures.log
// (cross-family review finding 2026-07-10: a fully silent no-op = an undetectable doctrine bypass).
//
// CONFIG PATHS (all env-overridable for testability — tests never touch user home)
//   PRIMER_CONFIG_PATH          default ~/.claude/delegation/config.json
//   PRIMER_ASSISTANT_STATE_PATH default ~/.claude/delegation/assistant-state.json
//   PRIMER_LESSONS_PATH         default ~/.claude/delegation/dispatcher-lessons.md
//   PRIMER_FAILURE_LOG          default ~/.claude/state/delegation-gate-failures.log
//   PRIMER_EXT_PATH             default <cwd>/.claude/skills/ultra-agents/worker-ext.md

import { readFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";

const HOME = homedir();

const PRIMER_CONFIG_PATH     = process.env.PRIMER_CONFIG_PATH          || join(HOME, ".claude", "delegation", "config.json");
const PRIMER_ASSISTANT_STATE = process.env.PRIMER_ASSISTANT_STATE_PATH || join(HOME, ".claude", "delegation", "assistant-state.json");
const PRIMER_LESSONS_PATH    = process.env.PRIMER_LESSONS_PATH         || join(HOME, ".claude", "delegation", "dispatcher-lessons.md");
const PRIMER_FAILURE_LOG     = process.env.PRIMER_FAILURE_LOG          || join(HOME, ".claude", "state", "delegation-gate-failures.log");

function logFailure(msg) {
  try { mkdirSync(dirname(PRIMER_FAILURE_LOG), { recursive: true }); appendFileSync(PRIMER_FAILURE_LOG, `${new Date().toISOString()} delegation-primer: ${msg}\n`); }
  catch { /* last resort only */ }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

try {
  const payload = JSON.parse(await readStdin());
  const cwd = String(payload.cwd || "");
  const ext = process.env.PRIMER_EXT_PATH || join(cwd, ".claude", "skills", "ultra-agents", "worker-ext.md");
  if (!existsSync(ext)) process.exit(0);

  let gate = "off";
  try {
    gate = String(JSON.parse(readFileSync(PRIMER_CONFIG_PATH, "utf8")).GATE || "off");
  } catch (e) { logFailure(`config unreadable (${e.message}) — primer skipped in a gated repo`); }
  if (gate.toLowerCase() !== "on") process.exit(0);

  // A1: read assistant-state.json — the /assistants MASTER switch (Rutvik 2026-07-16).
  let assistantMode = "off";
  let stateFileExists = false;
  try {
    stateFileExists = existsSync(PRIMER_ASSISTANT_STATE);
    if (stateFileExists) {
      const astate = JSON.parse(readFileSync(PRIMER_ASSISTANT_STATE, "utf8"));
      assistantMode = String(astate.assistant || "off").toLowerCase();
    }
  } catch { /* unparseable = treated below as NOT explicitly off (fail-safe) */ }
  const explicitlyOff = stateFileExists && assistantMode === "off";

  // D12 sentinels (SessionStart, warn-only): (a) doctrine-version drift vs the worker-ext.md stamp;
  // (b) re-clone-disarm — core.hooksPath + .git/info/exclude secrecy entries are LOCAL-ONLY and a fresh
  // clone silently loses both. Never blocks; surfaces the risk in the injection so a re-clone is caught.
  // Kept in BOTH modes — leak-gate integrity matters regardless of the copilot switch.
  const EXPECTED_DOCTRINE_VERSION = 2;
  const drift = [];
  try {
    const m = readFileSync(ext, "utf8").match(/doctrine-version:\s*(\d+)/);
    if (!m) drift.push("worker-ext.md has no doctrine-version stamp");
    else if (Number(m[1]) !== EXPECTED_DOCTRINE_VERSION) drift.push(`doctrine-version drift (worker-ext.md=${m[1]}, primer expects ${EXPECTED_DOCTRINE_VERSION})`);
  } catch { drift.push("worker-ext.md unreadable for doctrine-version check"); }
  try {
    const cfg = readFileSync(join(cwd, ".git", "config"), "utf8");
    if (!/hooksPath\s*=\s*\.githooks/.test(cfg)) drift.push("core.hooksPath != .githooks — leak-gate hooks DISARMED (`git config core.hooksPath .githooks`)");
  } catch { drift.push(".git/config unreadable — cannot confirm core.hooksPath"); }
  try {
    const excl = readFileSync(join(cwd, ".git", "info", "exclude"), "utf8");
    for (const pat of ["worker-ext.md", "copilot-worker.sh", "state/ua-worker/"]) {
      if (!excl.includes(pat)) drift.push(`.git/info/exclude missing '${pat}' — secret files may get tracked`);
    }
  } catch { drift.push(".git/info/exclude unreadable — cannot confirm secrecy exclusions"); }

  let msg;
  if (explicitlyOff) {
    // /assistants OFF — plain Claude Code harness. No delegation doctrine, no dispatcher lessons.
    // LCD03 dispatcher constraint: explicit OFF = NO CEO identity, NO AUTO-IDENTITY token.
    // Claude-solo means solo — do not weaken this branch.
    msg = [
      "ASSISTANT MODE: OFF — COPILOT LAYER OFF (/assistants master switch, Rutvik 2026-07-16).",
      "Claude does ALL work itself this period — no copilot dispatches, no worker tickets, no chief.",
      "Work exactly as pre-integration: pipeline identities, skills, direct execution. The delegation",
      "stack is dormant, not dismantled — `/assistants on` restores the CEO harness.",
      ...(drift.length ? ["- ⚠️  DRIFT/DISARM (D12 sentinel): " + drift.join("; ") + " — fix before relying on the leak gates."] : []),
    ].join("\n");
  } else {
    // ON-mode or fail-safe (absent/unparseable state = NOT explicitly off).
    const assistantModeLine = assistantMode === "on"
      ? "ASSISTANT MODE: ON — brief the chief; you interrogate + compact"
      : "ASSISTANT MODE: (state file absent/unreadable — treating as CEO harness, fail-safe)";

    // LCD03 Phase 1: identity block.
    // Order: (1) ASSISTANT MODE line — FIRST, unchanged.
    //        (2) ═══ YOU ARE THE CEO ═══ block — new, LCD03.
    //        (3) DELEGATION-FIRST rules + lessons splice — unchanged.
    const identityBlock = [
      "═══ YOU ARE THE CEO ═══",
      "[AUTO-IDENTITY: CEO — structural, primer-asserted, survives compaction]",
      "Identity: OWNER (CEO/Guarantor). Decompose → ticket → dispatch → read verdict → report.",
      "You do NOT: write code, run verifications, do RCA, deep-read repos, draft specs.",
      "If your next action is Bash/grep for anything beyond ticket-prep: STOP and ticket it.",
      "",
    ].join("\n");

    // A9.3: read dispatcher-lessons for replay.
    let dispatcherLessons = "";
    try {
      if (existsSync(PRIMER_LESSONS_PATH)) dispatcherLessons = readFileSync(PRIMER_LESSONS_PATH, "utf8").trim();
    } catch { /* fail-open */ }

    msg = [
      assistantModeLine,
      identityBlock,
      "DELEGATION-FIRST IS LIVE (structural session-start reminder — this is doctrine, not a suggestion):",
      "- Substantive work is NOT done inline by Claude. Before your first substantive task, Read .claude/skills/ultra-agents/worker-ext.md and route the work through `bash .claude/skills/ultra-agents/copilot-worker.sh --ticket <file> --agent council-worker`.",
      "- DEFAULT-DELEGATE includes: live playwright-cli browser walks / DOM+testid dumps, verification batteries (greps/typecheck/spec runs/artifact checks), drafting (report rows, specs, docs, xlsx content), RCA legwork, and diff review (cross-family reviewer digest — do NOT line-read a diff after a green review).",
      "- OFF-REPO tickets (live walks, anything not provable from the repo diff): the review layer independently RE-EXECUTES the same actions (pyramid layer 4 in worker-ext.md) — paper-only review can never green off-repo work. Reviewer stance: worker is guilty until its evidence proves otherwise.",
      "- CLAUDE-ONLY: talking to the user, ticket writing/dispatch/digest reading, /identity + activity-log + plan-status ceremony, auto-memory writes, control-file edits (approval + grant), Chrome-MCP visual checks, publishing (git push/Jira/deploys), final judgment calls.",
      "- Simple case = 1 worker + 1 cross-family reviewer; both green = accept and move on.",
      "- Worker defect found? BOUNCE it back to the worker — do not self-fix via SELF_GRANT until a bounce has failed.",
      "- Any inline self-work a worker could have done = routing incident: log to ~/.claude/delegation/self_incidents.log and confess under 'I coded myself' in the Receipt.",
      "- EVERY session with mutations ends with the Receipt block (spec: worker-ext.md 'Receipt v3').",
      ...(drift.length ? ["- ⚠️  DRIFT/DISARM (D12 sentinel): " + drift.join("; ") + " — fix before relying on the delegation gates."] : []),
      ...(dispatcherLessons ? ["\nDISPATCHER LESSONS (learned the hard way — do not re-learn):\n" + dispatcherLessons] : []),
    ].join("\n");
  }

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: msg },
  }));
} catch (e) {
  logFailure(`injection failed: ${e && e.message ? e.message : e}`);
  process.exit(0);
}
