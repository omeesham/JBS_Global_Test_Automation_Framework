#!/usr/bin/env node
// delegation-gate.mjs — LOCAL-ONLY (this PC). Lives in the home dir, never tracked/pushed.
// PreToolUse hook for Edit|Write|MultiEdit|NotebookEdit.
//
// Purpose: the orchestrator (Claude, "CEO") must not labor on source — source mutations route
// through the Copilot worker fleet (tickets). This hook makes that structural, not advisory.
//
// v2 loophole-hardening (2026-07-09, Rutvik standing approval):
//  - PROTECTED control files: the gate's own kill-switch (config.json), the hooks, settings.json,
//    DUTY_STACK.md, and the repo wrapper/doctrine are DENIED even inside allowed prefixes —
//    Claude cannot silently weaken its own enforcement. Escape = Rutvik-approved SELF_GRANT with
//    reason ≥20 chars; every protected use is appended to grants-audit.log (visibility, receipts).
//  - Anchored allow-paths: repo-root-anchored .claude/ plans/ .git/ and absolute scratchpad prefix —
//    `src/plans/evil.ts` / `src/.claude/evil.ts` substring tricks no longer pass.
//  - Target-based scoping (not cwd-based): repo source + protected files are gated from ANY session,
//    including ones started in other projects.
//  - Grant TTL cap: expires must be ≤60 min in the future — no standing passes.
//
// v3 R-532 wrapper-edit interlock (2026-07-12, Sev S2, incident R-532, Rutvik go): editing
// copilot-worker.sh while a dispatch runs THROUGH it crashes the live bash parse. A fresh slot-lock
// (active dispatch) DENIES the edit even WITH a valid grant — a safety interlock, not a permission check.
//
// v4 /assistants master-switch wiring (2026-07-16, Rutvik in-chat decision, hand-applied):
// "/assistants off" = the ENTIRE copilot layer is OFF = plain Claude Code harness — Claude works
// solo, exactly like pre-integration. When ~/.claude/delegation/assistant-state.json is EXPLICITLY
// {"assistant":"off"}, SOURCE-write gating stands down (emitAllow). Fail-safe polarity: absent or
// unparseable state file = NOT off = enforcement stays. PROTECTED control files remain gated in
// EVERY mode, always — the switch turns copilot off, never the safety layer.
//
// v5 LCD_02 enforcement-holes close + PBUG-08/09 (2026-07-16, SUBPLAN_LCD_02_ENFORCEMENT_HOLES,
// Rutvik in-chat GO; council-built, owner hand-applied). Builds ON v4:
//  - Phase 2 (AH-09): .md gate is scope-aware. Worker-surface .md (clients/<c>/{tests,src}/) stays
//    ALLOWED (WARN-only, never deny) but carries a "consider ticketing" advisory + an announce
//    telemetry line, so inline .md legwork is visible/countable. Protected .md still excluded.
//  - Phase 3 (AH-01): a SELF_GRANT's reason must cite a real work anchor (TICKET-*/PLAN_*/SUBPLAN_*),
//    not just a generic ≥20-char string.
//  - Phase 4 (AH-20): doctrine paths join PROTECTED — .claude/rules/, docs/read_only_docs/, and skill
//    definitions (.claude/skills/**/SKILL.md). Doctrine edits now require an audited grant.
//  - PBUG-08: every deny verdict (and the Phase-2 .md announce) appends one LR-069 §3.4 CSV line to
//    .claude/state/gate-fires.log (GATE_FIRES_PATH-overridable for probes; best-effort, never throws).
//  - PBUG-09: hasPipelineIdentity now scans a message's content in REVERSE, so the LAST identity Skill
//    call in a message decides (the forward loop returned on the FIRST, contradicting its own comment).
//  - Probe-hooks: SELF_GRANT_PATH / DGATE_CONFIG_PATH / DGATE_ASSISTANT_STATE_PATH / GATE_FIRES_PATH are
//    env-overridable (defaults UNCHANGED) so fixture probes never read/write the real home/repo files.
//
// Honest limit: Bash is ungated (approved trade — pattern detection was a false-positive engine),
//
// v6 LCD07 AH-02 (ledger protection, 2026-07-16, SUBPLAN_LCD_07_OBSERVABILITY, staging-only):
// Sev: S1 (silent quality drift — direct ledger write bypasses the audit trail integrity contract).
// Graduating incident: AH-02 — Claude could directly edit ledger.jsonl, forging or removing
// dispatch records without a SELF_GRANT; telemetry integrity violated silently.
// Gate: adds ledger.jsonl to PROTECTED — direct Claude writes require SELF_GRANT;
// the copilot-worker.sh Bash append remains unblocked (gate hooks Edit/Write/MultiEdit/
// NotebookEdit tool calls only — Bash shell children are NOT intercepted by this hook).
// Ramp: announce-first per LR-069 §3.3 (S1 never straight to deny); promote after ≥20
// clean sessions with zero false fires. Config knob: ramp tracked in guardrail-config.json.
//
// so tamper-resistance at the tool layer is friction + mandatory audit visibility, not cryptography.
// The Claude Code auto-mode classifier is the independent second layer.
//
// Fail policy: fail-CLOSED once the target is confirmed repo-source/protected; fail-open otherwise.
// Failure log: ~/.claude/state/delegation-gate-failures.log

import { readFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, dirname } from "node:path";

const HOME = homedir();
// LCD_02 probe-hooks: env-overridable, defaults UNCHANGED. Lets fixture probes point config /
// assistant-state / SELF_GRANT / gate-fires at scratch copies without touching the real home files.
const CONFIG_PATH = process.env.DGATE_CONFIG_PATH || join(HOME, ".claude", "delegation", "config.json");
const ASSISTANT_STATE_PATH = process.env.DGATE_ASSISTANT_STATE_PATH || join(HOME, ".claude", "delegation", "assistant-state.json");
const SELF_GRANT_PATH = process.env.SELF_GRANT_PATH || join(HOME, ".claude", "delegation", "SELF_GRANT");
const GRANTS_AUDIT_LOG = join(HOME, ".claude", "delegation", "grants-audit.log");
const FAILURE_LOG = join(HOME, ".claude", "state", "delegation-gate-failures.log");
const GATED_REPO = (process.env.GATED_REPO_ROOT || process.cwd()).replace(/\\/g, "/").toLowerCase();
const SCRATCH_PREFIX = tmpdir().replace(/\\/g, "/").toLowerCase() + "/claude/";
const LOOKBACK_LINES = 2000;
const GRANT_MAX_TTL_MS = 60 * 60 * 1000; // 60 min — no standing grants

// PBUG-08 (LR-069 §3.4): fire telemetry destination. Env-overridable for probes; default = the repo's
// single shared append-only gate-fires.log.
const GATE_FIRES_PATH = process.env.GATE_FIRES_PATH || (GATED_REPO + "/.claude/state/gate-fires.log");

// R-532 wrapper-edit safety interlock (2026-07-12, Sev S2, incident R-532): copilot-worker.sh is
// re-read from disk by bash AS it executes, so editing it while a dispatch runs THROUGH it corrupts
// the live parse and crashes the dispatch — even WITH a valid grant. These drive the interlock below.
const WRAPPER_PATH = GATED_REPO + "/.claude/skills/ultra-agents/copilot-worker.sh";
const LOCKS_DIR = join(HOME, ".claude", "delegation", "locks");
const LOCK_FRESH_SECS = 40 * 60; // slot-lock older than 40 min = stale (crashed/killed dispatch) — ignore

const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
const PIPELINE_IDENTITIES = new Set(["hunter", "giver", "builder", "healer", "watchdog", "gardener"]);

// LCD_02 Phase 2: worker-surface .md marker — clients/<client>/tests/ or clients/<client>/src/.
const WORKER_SURFACE_MD_RX = /\/clients\/[^/]+\/(tests|src)\//;

// LCD_02 Phase 4: skill-definition prefix — .claude/skills/**/SKILL.md (norm() lowercases → skill.md).
const SKILL_DEFS_PREFIX = GATED_REPO + "/.claude/skills/";

function norm(p) { return String(p || "").replace(/\\/g, "/").toLowerCase(); }
const HOME_NORM = norm(HOME);

// The delegation system's own control surface — Claude may not edit these without a Rutvik-approved,
// audit-logged grant. Protected beats every allow rule below.
const PROTECTED = [
  HOME_NORM + "/.claude/hooks/",
  HOME_NORM + "/.claude/settings.json",
  HOME_NORM + "/.claude/delegation/config.json",
  HOME_NORM + "/.claude/delegation/duty_stack.md",
  GATED_REPO + "/.claude/skills/ultra-agents/copilot-worker.sh",
  GATED_REPO + "/.claude/skills/ultra-agents/worker-ext.md",
  HOME_NORM + "/.claude/delegation/scorecard.mjs",       // D11: the scoring engine — Claude cannot silently rig how models are ranked
  HOME_NORM + "/.claude/delegation/routing-policy.json", // D11: the rulebook — only the deterministic `scorecard commit` path may write it
  HOME_NORM + "/.claude/delegation/gates/",              // CHEATPROOF Ph6: the verifier — agents must not edit the instrument that judges them
  HOME_NORM + "/.claude/delegation/private/",            // CHEATPROOF Ph6: the answer key (fixture corpus + sha pin)
  GATED_REPO + "/.claude/rules/",                        // LCD_02 Phase 4 (AH-20): framework doctrine rules — read-only intent, edits need a grant
  GATED_REPO + "/docs/read_only_docs/",                  // LCD_02 Phase 4 (AH-20): read-only docs — read-only intent, edits need a grant
  GATED_REPO + "/.claude/state/ua-worker/ledger.jsonl", // LCD07 AH-02: direct writes denied; wrapper Bash append unblocked (gate is tool-layer only)
  HOME_NORM + "/.claude/delegation/ledger.jsonl",       // LCD07 AH-02: home-delegation ledger guarded symmetrically
];
function isProtected(n) {
  if (PROTECTED.some((p) => n === p || (p.endsWith("/") && n.startsWith(p)))) return true;
  // LCD_02 Phase 4 (AH-20): skill definitions (.claude/skills/**/SKILL.md, any depth). PROTECTED is
  // prefix-based and can't express "under skills/ AND named SKILL.md" without over-protecting the
  // whole skills tree — so this one pattern case is inline. (norm() already lowercased → /skill.md.)
  if (n.startsWith(SKILL_DEFS_PREFIX) && n.endsWith("/skill.md")) return true;
  return false;
}

// LCD_02 Phase 2 helper: a worker-surface .md is a non-protected .md under clients/<c>/{tests,src}/.
// It stays ALLOWED (never denied); the caller emits its advisory + announce telemetry.
function workerSurfaceMd(n) {
  return n.endsWith(".md") && !isProtected(n) && WORKER_SURFACE_MD_RX.test(n);
}

function emitAllow(reason) {
  const out = { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "allow" } };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}
function emitDeny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason },
  }));
  process.exit(0);
}
function logFailure(msg) {
  try { mkdirSync(dirname(FAILURE_LOG), { recursive: true }); appendFileSync(FAILURE_LOG, `${new Date().toISOString()} ${msg}\n`); }
  catch { /* best-effort only */ }
}
function auditGrantUse(entry) {
  try { mkdirSync(dirname(GRANTS_AUDIT_LOG), { recursive: true }); appendFileSync(GRANTS_AUDIT_LOG, JSON.stringify(entry) + "\n"); }
  catch (e) { logFailure(`grant-audit write failed: ${e.message}`); }
}

// PBUG-08 (LR-069 §3.4): every deny/announce verdict appends one CSV line to gate-fires.log —
// `<gate>, <ISO>, <verdict>, <target>`. One shared append-only log; without it the demotion review
// is unauditable. Best-effort: telemetry failure must NEVER wedge a write (matches logFailure posture).
function fireTelemetry(gate, verdict, target) {
  try {
    mkdirSync(dirname(GATE_FIRES_PATH), { recursive: true });
    appendFileSync(GATE_FIRES_PATH, `${gate}, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
  } catch { /* best-effort only — telemetry must never throw */ }
}

// Counts FRESH slot-locks under ~/.claude/delegation/locks = active dispatches. Each slot-<pid>-<run>
// dir holds a `born` file (epoch secs). The wrapper removes its lock on EXIT (trap set before any crash
// point, so even a syntax-error crash cleans up), so a fresh present lock reliably means a dispatch is
// LIVE. Locks older than LOCK_FRESH_SECS (a hard-kill that skipped the trap) are ignored so a stale
// lock can never permanently block. Never throws — worst case returns 0 (fail-open).
function activeDispatchCount() {
  try {
    if (!existsSync(LOCKS_DIR)) return 0;
    const nowSec = Date.now() / 1000;
    let n = 0;
    for (const entry of readdirSync(LOCKS_DIR)) {
      if (!entry.startsWith("slot-")) continue;
      let bornSec;
      try { bornSec = parseInt(String(readFileSync(join(LOCKS_DIR, entry, "born"), "utf8")).trim(), 10); }
      catch { bornSec = nowSec; } // lock dir present but `born` not written yet → just-created → fresh
      if (!Number.isFinite(bornSec)) bornSec = nowSec;
      if (nowSec - bornSec <= LOCK_FRESH_SECS) n++;
    }
    return n;
  } catch { return 0; }
}

// Allowed (non-source) CEO surfaces. Anchored — substring tricks (`src/plans/evil.ts`,
// `src/.claude/evil.ts`) do NOT pass. Protected files are excluded before any allow.
function isAllowedPath(n) {
  if (isProtected(n)) return false;
  // LCD_02 Phase 2: .md stays a CEO surface (WARN-only, never deny). Protected .md was already
  // excluded above; worker-surface .md is still allowed here but the caller (main) adds an advisory
  // + announce telemetry via workerSurfaceMd(). All other .md allowed exactly as before.
  if (n.endsWith(".md")) return true;
  if (n.startsWith(HOME_NORM + "/.claude/")) return true;
  if (n.startsWith(HOME_NORM + "/.copilot/")) return true;
  if (n.startsWith(GATED_REPO + "/.claude/")) return true;
  if (n.startsWith(GATED_REPO + "/plans/")) return true;
  if (n.startsWith(GATED_REPO + "/.git/")) return true;
  if (n.startsWith(SCRATCH_PREFIX)) return true;
  return false;
}

// NOTE: Bash is intentionally NOT gated (matcher = Edit|Write|MultiEdit|NotebookEdit). Pattern-based
// bash write-detection false-positived on `>`/`sed` inside echo strings (observed live 2026-07-09)
// and is unfixable without a shell parser. Claude authors source via Edit/Write — fully gated here.

function readConfig() {
  try { if (!existsSync(CONFIG_PATH)) return { GATE: "off" }; return JSON.parse(readFileSync(CONFIG_PATH, "utf8")); }
  catch { return { GATE: "off" }; }
}

// v4 /assistants master-switch (Rutvik 2026-07-16): explicit {"assistant":"off"} = copilot layer OFF
// = Claude-solo mode — SOURCE gating stands down. Absent or unparseable state file = NOT off
// (fail-safe: enforcement stays). PROTECTED handling above this check is untouched in every mode.
function assistantExplicitlyOff() {
  try {
    return existsSync(ASSISTANT_STATE_PATH) &&
      String(JSON.parse(readFileSync(ASSISTANT_STATE_PATH, "utf8")).assistant).toLowerCase() === "off";
  } catch { return false; }
}

// Scoped SELF_GRANT: session-bound, time-bound (≤60 min), explicit non-empty paths (segment-boundary
// match, no wildcard), and a real reason (≥20 chars AND — LCD_02 Phase 3 — citing a real work anchor).
// Protected targets additionally get audit-logged.
function checkSelfGrant(sessionId, targets) {
  try {
    if (!existsSync(SELF_GRANT_PATH)) return { granted: false, reason: "no SELF_GRANT file" };
    const g = JSON.parse(readFileSync(SELF_GRANT_PATH, "utf8"));
    if (g.session_id !== sessionId) return { granted: false, reason: `session mismatch (grant=${g.session_id})` };
    if (typeof g.reason !== "string" || g.reason.trim().length < 20) return { granted: false, reason: "grant.reason missing or <20 chars" };
    // LCD_02 Phase 3 (AH-01): a bare ≥20-char reason is not enough — it must cite a real work anchor
    // (a ticket or a plan/subplan filename), so a self-minted grant is tied to auditable, real work.
    if (!/TICKET-[\w-]+|PLAN_[\w-]+|SUBPLAN_[\w-]+/i.test(g.reason)) return { granted: false, reason: "grant.reason lacks ticket/plan reference (LCD_02 Phase 3)" };
    const exp = new Date(g.expires);
    const now = new Date();
    if (isNaN(exp.getTime()) || now >= exp) return { granted: false, reason: `expired/invalid expires (${g.expires})` };
    if (exp.getTime() - now.getTime() > GRANT_MAX_TTL_MS) return { granted: false, reason: "grant TTL exceeds 60 min cap (no standing grants)" };
    if (!Array.isArray(g.paths) || g.paths.length === 0) return { granted: false, reason: "grant has no explicit paths[] (wildcard forbidden)" };
    const gpaths = g.paths.map(norm);
    const covers = (t) => gpaths.some((p) => t === p || t.startsWith(p.endsWith("/") ? p : p + "/"));
    for (const t of targets) if (!covers(t)) return { granted: false, reason: `paths[] does not cover ${t}` };
    return { granted: true, grant: g };
  } catch (e) { return { granted: false, reason: `parse error: ${e.message}` }; }
}

// Pipeline identity = the LAST /identity Skill tool_use in the transcript names a pipeline role.
// Assistant tool_use entries only — user-text mentions never count.
function hasPipelineIdentity(transcriptPath) {
  try {
    if (!transcriptPath || !existsSync(transcriptPath)) return false;
    const lines = readFileSync(transcriptPath, "utf8").split(/\r?\n/);
    const start = Math.max(0, lines.length - LOOKBACK_LINES);
    for (let i = lines.length - 1; i >= start; i--) {
      const line = lines[i].trim(); if (!line) continue;
      let obj; try { obj = JSON.parse(line); } catch { continue; }
      const msg = obj.message ?? obj;
      if (!msg || msg.role !== "assistant" || !Array.isArray(msg.content)) continue;
      // PBUG-09: scan content in REVERSE so the LAST identity Skill call in the message decides.
      // The old forward loop returned on the FIRST identity call, contradicting its "last decides"
      // comment — a message like [identity OWNER, identity builder] wrongly resolved to OWNER.
      for (let ci = msg.content.length - 1; ci >= 0; ci--) {
        const c = msg.content[ci];
        if (c?.type !== "tool_use" || c.name !== "Skill") continue;
        if (c.input?.skill !== "identity") continue;
        const arg = String(c.input.args || "").trim().split(/\s+/)[0].toLowerCase();
        return PIPELINE_IDENTITIES.has(arg); // LAST identity call in the message decides
      }
    }
    return false;
  } catch { return false; }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  let payload;
  try { payload = JSON.parse(await readStdin()); }
  catch (e) { logFailure(`stdin parse: ${e.message}`); emitAllow("delegation-gate: stdin parse fail — open"); return; }

  const { session_id, transcript_path, cwd, tool_name, tool_input } = payload;
  const isEditFamily = EDIT_TOOLS.has(tool_name || "");
  let scopedGated = false;
  let fileNorm = ""; // PBUG-08: hoisted so the catch-block deny telemetry can name the target.

  try {
    if (!isEditFamily) { emitAllow("delegation-gate: unrecognized tool — allow"); return; }

    // Resolve the target: absolute paths stand alone; relative paths resolve against cwd.
    fileNorm = norm(tool_input?.file_path || tool_input?.notebook_path || tool_input?.path || "");
    if (fileNorm && !/^[a-z]:\//.test(fileNorm)) fileNorm = norm(cwd) + "/" + fileNorm;

    // PROTECTED control files — gated from ANY session, even when GATE is off (the kill-switch
    // itself is protected; otherwise flipping GATE=off would be the loophole). NOTE (v4): protected
    // handling deliberately sits ABOVE the /assistants stand-down — the switch never opens this layer.
    if (isProtected(fileNorm)) {
      scopedGated = true;
      // R-532 safety interlock: block ANY edit of the dispatch wrapper while a dispatch is LIVE.
      // Fires BEFORE the grant check — a valid SELF_GRANT does not override a live-crash hazard.
      if (fileNorm === WRAPPER_PATH) {
        const live = activeDispatchCount();
        if (live > 0) {
          fireTelemetry("delegation-gate", "deny", fileNorm); // PBUG-08
          emitDeny(
            `delegation-gate: BLOCKED — ${live} worker dispatch(es) are running THROUGH copilot-worker.sh right now. ` +
            "bash re-reads the script from disk as it runs, so editing it now WILL crash them (incident R-532). " +
            "Wait for every dispatch to finish, then retry. This is a SAFETY interlock — a SELF_GRANT does not override it. " +
            "(Certain nothing is running? A stale lock may remain: inspect/clear ~/.claude/delegation/locks/slot-*.)"
          );
          return;
        }
      }
      const grant = checkSelfGrant(session_id, [fileNorm]);
      if (grant.granted) {
        auditGrantUse({ ts: new Date().toISOString(), kind: "protected", target: fileNorm, ticket_id: grant.grant.ticket_id || "", reason: grant.grant.reason, session_id });
        emitAllow(`delegation-gate: PROTECTED edit allowed by audited grant (${fileNorm}) — must appear in the Delegation receipt`);
        return;
      }
      fireTelemetry("delegation-gate", "deny", fileNorm); // PBUG-08
      emitDeny(
        "delegation-gate: PROTECTED delegation-control file — Claude may not modify its own enforcement " +
        "layer unprompted. Get Rutvik's explicit in-chat approval, then write a SELF_GRANT " +
        "({ticket_id, session_id, paths:[this file], reason ≥20 chars citing a ticket/plan, expires ≤60min}); the use is " +
        `audit-logged and must appear in the Delegation receipt. (grant: ${grant.reason})`
      );
      return;
    }

    if (String(readConfig().GATE).toLowerCase() !== "on") { emitAllow("delegation-gate: GATE not on"); return; }

    // v4 /assistants master-switch: explicit OFF = copilot layer off = Claude-solo — source gating
    // stands down for this write. PROTECTED files were already handled above and stay gated.
    if (assistantExplicitlyOff()) { emitAllow("delegation-gate: /assistants OFF — Claude-solo mode (copilot layer disabled)"); return; }

    // Repo source scoping is TARGET-based: gated from any session, any cwd.
    const inRepo = fileNorm.startsWith(GATED_REPO + "/");
    if (!inRepo) { emitAllow("delegation-gate: target outside gated repo"); return; }
    if (isAllowedPath(fileNorm)) {
      // LCD_02 Phase 2: a worker-surface .md is still ALLOWED (WARN-only, never deny) but carries a
      // "consider ticketing" advisory + an announce telemetry line so inline .md legwork is
      // visible/countable. Protected .md was already caught above; all other .md allowed as before.
      if (workerSurfaceMd(fileNorm)) {
        fireTelemetry("delegation-gate", "announce", fileNorm); // PBUG-08 + LCD_02 Phase 2
        emitAllow("delegation-gate: worker-surface .md — consider ticketing (advisory; allowed)");
        return;
      }
      emitAllow("delegation-gate: allowed non-source path");
      return;
    }

    scopedGated = true;
    const grant = checkSelfGrant(session_id, [fileNorm]);
    if (grant.granted) {
      auditGrantUse({ ts: new Date().toISOString(), kind: "source", target: fileNorm, ticket_id: grant.grant.ticket_id || "", reason: grant.grant.reason, session_id });
      emitAllow(`delegation-gate: SELF_GRANT valid for ${fileNorm} (audited)`);
      return;
    }
    if (hasPipelineIdentity(transcript_path)) { emitAllow("pipeline identity active (Phase-1 exemption)"); return; }
    fireTelemetry("delegation-gate", "deny", fileNorm); // PBUG-08
    emitDeny(
      "delegation-gate: source edits route through the worker fleet. Write a ticket " +
      "(~/.claude/delegation/ticket-template.md) and dispatch via copilot-worker.sh --ticket. " +
      `Ladder exhausted? AUTO_SELF writes a scoped SELF_GRANT. (grant: ${grant.reason})`
    );
  } catch (e) {
    logFailure(`internal: ${e.message} | ${e.stack}`);
    if (scopedGated) {
      fireTelemetry("delegation-gate", "deny", fileNorm || "internal-error"); // PBUG-08
      emitDeny("delegation-gate: internal error — failing closed for gated write. See ~/.claude/state/delegation-gate-failures.log");
    } else emitAllow("delegation-gate: internal error — failing open (unscoped)");
  }
}

main();
