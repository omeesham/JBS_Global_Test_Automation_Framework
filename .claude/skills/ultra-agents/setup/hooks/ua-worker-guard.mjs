#!/usr/bin/env node
// ua-worker-guard.mjs — LOCAL-ONLY (this PC only). Lives in the home dir, never
// tracked/pushed by any repo. Registered user-level in ~/.claude/settings.json.
//
// PURPOSE: once /ultra-agents has been invoked in the CURRENT session (evidenced
// by a `Skill` tool_use with input.skill === "ultra-agents" in the transcript)
// AND the current project has the local Copilot worker extension on disk
// (.claude/skills/ultra-agents/worker-ext.md), BLOCK further Claude `Agent`
// (subagent) spawns unless the prompt carries a `[UA-SPAWN-JUSTIFIED: <reason>]`
// token. This is the structural guarantee that critical-artifact work actually
// routes through the free Copilot council instead of silently burning Claude
// quota — an instruction in worker-ext.md alone can't enforce that, this hook
// can (it runs at the tool-call layer, not the prompt layer).
//
// v2 (2026-07-16, Rutvik in-chat decision, hand-applied): /assistants is the copilot
// MASTER switch. Explicit {"assistant":"off"} in ~/.claude/delegation/assistant-state.json
// = copilot layer OFF = Claude-solo mode: this guard stands down (Claude subagent spawns
// are the intended mode). Fail-safe polarity: absent/unparseable state file = NOT off.
//
// v5 PBUG-08 (2026-07-16, SUBPLAN_LCD_02_ENFORCEMENT_HOLES, owner hand-applied): the deny
// verdict now appends one LR-069 §3.4 CSV line to .claude/state/gate-fires.log
// (`ua-worker-guard, <ISO>, deny, <session-id>`) via a shared fireTelemetry helper
// (GATE_FIRES_PATH-overridable for probes; best-effort, never throws). Without it the
// demotion review saw zero fires for this gate and could wrongly retire a live guard.
//
// Scope / safety: this hook is registered GLOBALLY (fires on every project's
// `Agent` tool call), but it only ever DENIES when BOTH gates below are true.
// In any project without worker-ext.md on disk it is an instant no-op allow —
// harmless everywhere else on this machine.
//
// Session-wide latch (deliberately conservative): there is no clean "skill
// closed" signal for /ultra-agents (unlike /execute -> /final-q), so once the
// skill invocation is seen anywhere in this session's transcript, the guard
// stays ON for the rest of the session. Start a fresh session to reset. This
// errs toward over-blocking per explicit user request ("I do not want agents
// to overlook the skill and use claude subagents and destroy my limits").
//
// Escape hatch: [UA-SPAWN-JUSTIFIED: <reason>] in the Agent prompt allows the
// spawn through. The token is transcript-visible and MUST reappear in the
// /ultra-agents "Delegation receipt" block (worker-ext.md contract) — abuse is
// audit-catchable, not silent.
//
// Fail-OPEN on any internal error — a broken guard must never wedge a session.
// Failures logged to ~/.claude/state/ua-worker-guard-failures.log.

import { readFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";

const HOME = homedir();
const FAILURE_LOG = join(HOME, ".claude", "state", "ua-worker-guard-failures.log");
const CONFIG_PATH = join(HOME, ".claude", "delegation", "config.json");
const ASSISTANT_STATE_PATH = join(HOME, ".claude", "delegation", "assistant-state.json");
const JUSTIFY_RX = /\[UA-SPAWN-JUSTIFIED:\s*[^\]]{3,}\]/;
const LOOKBACK_LINES = 2000; // ultra-agents goals can run long; generous window
// v2: pipeline agent sessions keep spawning normally (Phase-1 exemption) — the takeover gate is for
// the CEO's own ad-hoc Claude-subagent spawns, not the encore test pipeline.
const PIPELINE_AGENTS = new Set(["requirements", "planner", "generator", "healer", "audit", "maintainer"]);

// PBUG-08 (LR-069 §3.4): fire telemetry destination — the repo's single shared append-only
// gate-fires.log. Env-overridable for probes; default UNCHANGED. GATED_REPO is the same hardcoded
// path the delegation-gate uses (this machine's single gated repo; the guard only ever DENIES in a
// project that carries worker-ext.md, which on this PC is that repo).
const GATED_REPO = (process.env.GATED_REPO_ROOT || process.cwd()).replace(/\\/g, "/").toLowerCase();
const GATE_FIRES_PATH = process.env.GATE_FIRES_PATH || (GATED_REPO + "/.claude/state/gate-fires.log");
function fireTelemetry(gate, verdict, target) {
  try {
    mkdirSync(dirname(GATE_FIRES_PATH), { recursive: true });
    appendFileSync(GATE_FIRES_PATH, `${gate}, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
  } catch { /* best-effort only — telemetry must never throw */ }
}

function readConfig() {
  try { if (!existsSync(CONFIG_PATH)) return { GATE: "off" }; return JSON.parse(readFileSync(CONFIG_PATH, "utf8")); }
  catch { return { GATE: "off" }; }
}

// /assistants master switch (Rutvik 2026-07-16): only an EXPLICIT "off" stands the guard down.
function assistantExplicitlyOff() {
  try {
    return existsSync(ASSISTANT_STATE_PATH) &&
      String(JSON.parse(readFileSync(ASSISTANT_STATE_PATH, "utf8")).assistant).toLowerCase() === "off";
  } catch { return false; }
}

function emitAllow(reason) {
  const out = { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "allow" } };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
}

function emitDeny(reason) {
  const out = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(out));
}

function logFailure(msg) {
  try {
    mkdirSync(dirname(FAILURE_LOG), { recursive: true });
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} ${msg}\n`);
  } catch {
    /* best-effort only — never throw from the logger */
  }
}

function wasUltraAgentsInvoked(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return false;
  const raw = readFileSync(transcriptPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const start = Math.max(0, lines.length - LOOKBACK_LINES);
  for (let i = start; i < lines.length; i++) {
    let entry;
    try {
      entry = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    const msg = entry?.message || entry; // some transcript formats wrap under .message
    if (msg?.role !== "assistant") continue;
    const content = msg.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (c?.type !== "tool_use") continue;
      if (c.name !== "Skill") continue;
      const skillName = String(c.input?.skill || "").toLowerCase().trim();
      if (skillName === "ultra-agents") return true;
    }
  }
  return false;
}

function main() {
  let payload;
  try {
    const input = readFileSync(0, "utf8");
    payload = JSON.parse(input);
  } catch (e) {
    logFailure(`parse-failure: ${e?.message || e}`);
    emitAllow();
    return;
  }

  try {
    const cwd = payload.cwd || process.cwd();
    const workerExtPath = join(cwd, ".claude", "skills", "ultra-agents", "worker-ext.md");
    const workerExtExists = existsSync(workerExtPath);
    if (!workerExtExists) {
      emitAllow(); // no local worker extension in this project — not our concern
      return;
    }

    // /assistants master switch (Rutvik 2026-07-16): copilot layer explicitly OFF →
    // Claude-solo mode; subagent spawns are the intended path — stand down.
    if (assistantExplicitlyOff()) {
      emitAllow("/assistants OFF — Claude-solo mode; subagent spawns permitted");
      return;
    }

    // v2 activation (OR): (a) legacy — /ultra-agents Skill invoked this session, OR
    //                     (b) takeover — delegation GATE=on (worker-ext confirmed present above).
    const transcriptPath = payload.transcript_path || payload.transcriptPath || "";
    const activatedBySkill = wasUltraAgentsInvoked(transcriptPath);
    const activatedByConfig = String(readConfig().GATE).toLowerCase() === "on";
    if (!activatedBySkill && !activatedByConfig) {
      emitAllow();
      return;
    }

    // Phase-1 exemption: encore pipeline agents keep spawning normally.
    const subagentType = String(payload.tool_input?.subagent_type || "").toLowerCase();
    if (PIPELINE_AGENTS.has(subagentType)) {
      emitAllow(`pipeline agent (Phase-1 exemption): ${subagentType}`);
      return;
    }

    const prompt = payload.tool_input?.prompt || "";
    if (JUSTIFY_RX.test(prompt)) {
      emitAllow("UA-SPAWN-JUSTIFIED token present");
      return;
    }

    // PBUG-08 (LR-069 §3.4): record the deny before emitting. A spawn has no file target, so the
    // target field is the session id (per the "<target-path-or-session-id>" spec).
    fireTelemetry("ua-worker-guard", "deny", payload.session_id || subagentType || "agent-spawn");
    emitDeny(
      "ua-worker-guard: worker-delegation is active this session — Claude Agent spawns burn paid quota; " +
      "critical-artifact work must route through the local Copilot worker/council (copilot-worker.sh), not a " +
      "Claude Agent spawn. If this specific spawn is genuinely necessary, add [UA-SPAWN-JUSTIFIED: <reason>] to " +
      "the Agent prompt — the token is transcript-visible and must reappear in the Delegation receipt."
    );
  } catch (e) {
    logFailure(`runtime-failure: ${e?.message || e}`);
    emitAllow();
  }
}

main();
