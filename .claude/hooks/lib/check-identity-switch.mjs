#!/usr/bin/env node
// check-identity-switch.mjs — returns JSON decision for identity-switch gate.
//
// MODES (dispatched by presence of argv[3]):
//
//   PreToolUse mode: argv[2]=transcript, argv[3]=tool_input JSON (from hook
//     stdin). Decide whether the pending Edit/Write/NotebookEdit
//     is permitted under the ground-truth identity. Emits JSON with
//     hookSpecificOutput.permissionDecision.
//
//   Stop mode: argv[2]=transcript only. Audit the transcript for banner-drift
//     or identity-switch-without-constraint-emission. Emits "block"/"allow".
//
// GROUND-TRUTH IDENTITY rule (IDS-D1):
//   The identity that constrains the session is determined by the LAST
//   `Skill` tool_use in the transcript with input.skill === "identity".
//   Banner text is UX-only; agents relabeling banners without invoking the
//   skill do not actually switch. Default = OWNER if no invocation exists.
//
// OVERRIDE path (IDS-D3):
//   A denied PreToolUse call is upgraded to allow if the transcript has, in
//   the last ≤3 assistant-turn window BEFORE the current tool_use:
//     (a) assistant text containing `[OVERRIDE-REQUEST]` referencing the
//         SAME target path, AND
//     (b) a user message containing one of the authorization phrases
//         (see OVERRIDE_AUTH_RX) AFTER (a).
//
// Fail-open policy: any parse error → allow (same posture as
// check-finalq-required.mjs + check-rubberstamp.mjs).

import { readFileSync, existsSync, writeFileSync, mkdirSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { ownershipFor, canWrite, isPipelineArtifact, ownerRoleFor } from "../../../scripts/identity-ownership.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");

const MUTATION_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);
// Layer-1 /execute-context lookback window (mirrors check-todo-injection). Declared
// at top level — the PreToolUse dispatch runs during module load, before the helper
// block below, so this const must initialize before isInExecuteContext() can run (TDZ).
// keep in sync with check-todo-injection.mjs (EXECUTE_LOOKBACK twin)
const EXECUTE_LOOKBACK = 200;
// Override window: env-configurable, default 3, hard ceiling 10 (not overridable by env).
const OVERRIDE_TURNS = Math.min(10, Math.max(1, parseInt(process.env.IDENTITY_OVERRIDE_TURNS ?? "3", 10) || 3));
const OVERRIDE_AUTH_RX = /\b(override approved|override ok|approve override|authorized to override|i authorize|you are authorized)\b/i;
// Line-anchored to avoid matching prose mentions like "the [OVERRIDE-REQUEST]
// convention" (mid-sentence; must start a line). Tolerates common markdown
// wrappers around the tag — backticks (`[OVERRIDE-REQUEST]`), blockquote
// (`> [OVERRIDE-REQUEST]`), bullet (`- [OVERRIDE-REQUEST]` / `* ...`), and
// emphasis (`_[OVERRIDE-REQUEST]_`) — because natural chat formatting adds
// these and the strict `^\s*\[` anchor rejected legitimate handshakes
// (SCOPED 2026-04-23 regression fix, LR-043 remediation).
const OVERRIDE_REQUEST_RX = /(?:^|\n)[\s`>*_-]*\[OVERRIDE-REQUEST\][\s`]*\S/;
const BATCH_APPROVAL_RX = /^\s*\[OVERRIDE-EXPLICIT-APPROVAL-BATCH\]/m;
const BANNER_RX = /\[([A-Z]+)\s*\|/;
const IDENTITY_SWITCH_RX = /IDENTITY SWITCH:\s*\[?([A-Z]+)\]?\s*(?:->|→)\s*\[?([A-Z]+)\]?/;
const CONSTRAINT_EXTRACT_RX = /^##\s*\[IDENTITY-ACTIVE:\s*([A-Z]+)\]/m;

const transcript = process.argv[2];
const toolInputJson = process.argv[3];

if (!transcript || !existsSync(transcript)) {
  emitAllow();
  process.exit(0);
}

let messages;
try {
  const raw = readFileSync(transcript, "utf8");
  messages = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      const msg = obj.message ?? obj;
      if (msg && msg.role) messages.push(msg);
    } catch { /* skip */ }
  }
} catch {
  emitAllow();
  process.exit(0);
}

// Ground-truth identity: last Skill tool_use invoking "identity".
let currentIdentity = "OWNER"; // default
for (let i = messages.length - 1; i >= 0; i--) {
  const content = messages[i].content;
  if (!Array.isArray(content)) continue;
  let found = false;
  for (const c of content) {
    if (c?.type === "tool_use" && c.name === "Skill" && c.input?.skill === "identity") {
      // Single-token extraction: take only the first whitespace-delimited token as the
      // codename. Anything after is descriptive context for the human reader (e.g.
      // `/identity GIVER (selector migration)` → identity = GIVER). Without this split,
      // free-form descriptions corrupt the identity comparison and cause "unknown identity"
      // false-denials. See LR-047 + .claude/skills/identity/SKILL.md Step 1.
      const arg = (c.input.args || "").trim().split(/\s+/)[0].toUpperCase();
      if (arg) currentIdentity = arg;
      found = true;
      break;
    }
  }
  if (found) break;
}

if (toolInputJson) {
  // PRE-TOOL-USE MODE
  handlePreToolUse(toolInputJson);
} else {
  // STOP MODE
  handleStop();
}

function handlePreToolUse(rawInput) {
  let toolInput;
  try { toolInput = JSON.parse(rawInput); } catch { emitAllow(); return; }
  const toolName = toolInput.tool_name || toolInput.name;
  if (!MUTATION_TOOLS.has(toolName)) { emitAllow(); return; }

  const input = toolInput.tool_input || toolInput.input || {};
  const targetPath = input.file_path || input.notebook_path || input.path;
  if (!targetPath) { emitAllow(); return; }

  // Normalize to repo-relative forward-slash path.
  const relPath = normalizePath(targetPath);

  // --- Layer 1 (PLAN_IDENTITY_ENFORCEMENT): OWNER pipeline-artifact write-gate ---
  // Fires BEFORE the canWrite OWNER short-circuit (which returns true for OWNER
  // unconditionally). Scoped to ALL of: ground-truth OWNER + an active /execute
  // context + a pipeline-role-owned test deliverable. LR-043-safe by construction
  // — framework paths (scripts/**, plans/**, .claude/**, docs/**, website/**) are
  // not pipeline-artifact territory, so OWNER framework work is never gated. The
  // canWrite() OWNER short-circuit is UNTOUCHED; this is an ADDITIONAL hook-level
  // context-loading check ("adopt the role before writing the role's artifacts"),
  // not a re-introduction of blanket OWNER access-control. Honors the
  // identity-gate-config.json ramp knob; fail-open on any error.
  if (currentIdentity === "OWNER" && isPipelineArtifact(relPath) && isInExecuteContext()) {
    const mode = readGateMode();
    if (mode !== "off") {
      const role = ownerRoleFor(relPath) || "a pipeline role";
      const msg =
        `[IDENTITY-GATE] ${relPath} is ${role}-owned pipeline territory. You are OWNER — ` +
        `its HARD STOPs are NOT loaded. Run /identity ${role} (loads the agent file + emits ` +
        `the Step 6.5 Constraint Extract) before writing — OWNER authoring of a pipeline ` +
        `role's test deliverable silently skips that role's gates. ` +
        `Override = one-shot break-glass ([OVERRIDE-REQUEST] ${relPath} + user "override approved").`;
      if (mode === "deny") {
        if (hasOverrideAuthorization(relPath)) {
          emitAllow(`[OVERRIDE] OWNER authorized to write ${relPath} — user-typed approval matched`);
          return;
        }
        emitDenyReason(msg);
        return;
      }
      // announce: allow + persist a warning that the Layer-4 /final-q + /audit nets read.
      const sessionId = toolInput.session_id || toolInput.sessionId || "unknown";
      persistAnnounceWarning(sessionId, relPath, role);
      emitAllow(`[IDENTITY-GATE announce] ${msg}`);
      return;
    }
  }

  // §2 check for ground-truth identity.
  if (canWrite(currentIdentity, relPath)) { emitAllow(); return; }

  const o = ownershipFor(currentIdentity, relPath);

  // Override path: in last 3 assistant turns, OVERRIDE-REQUEST for this path + user authorization.
  if (hasOverrideAuthorization(relPath)) {
    emitAllow(`[OVERRIDE] ${currentIdentity} authorized to write ${relPath} — user-typed approval matched`);
    return;
  }

  emitDeny(currentIdentity, relPath, o);
}

function hasOverrideAuthorization(path) {
  let sawRequest = false;
  let sawAuth = false;
  let asstTurnCount = 0;

  // Scan backward from most recent; only consider last OVERRIDE_TURNS assistant turns.
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant") {
      asstTurnCount++;
      if (asstTurnCount > OVERRIDE_TURNS) break;
      const t = textOf(msg.content);
      if (OVERRIDE_REQUEST_RX.test(t) && t.includes(path)) sawRequest = true;
    } else if (msg.role === "user") {
      const t = textOf(msg.content);
      if (OVERRIDE_AUTH_RX.test(t) || BATCH_APPROVAL_RX.test(t)) sawAuth = true;
    }
    if (sawRequest && sawAuth) return true;
  }
  return false;
}

// --- Layer 1 (PLAN_IDENTITY_ENFORCEMENT) helpers ---
// (EXECUTE_LOOKBACK is declared with the top-level constants — TDZ-safe for the
// PreToolUse dispatch that runs during module load.)

// Is an /execute active? Mirror of check-todo-injection.mjs isInExecute: walking
// back from the latest message, /execute is active iff we hit a Skill=execute
// before a Skill=final-q (final-q closes the /execute scope). Bounded lookback.
function isInExecuteContext() {
  const start = messages.length - 1;
  const stop = Math.max(0, start - EXECUTE_LOOKBACK);
  for (let i = start; i >= stop; i--) {
    const msg = messages[i];
    if (!msg || msg.role !== "assistant" || !Array.isArray(msg.content)) continue;
    for (const c of msg.content) {
      if (c?.type !== "tool_use" || c.name !== "Skill") continue;
      const skill = (c.input?.skill || "").toLowerCase();
      if (skill === "final-q") return false; // /final-q closed the /execute scope
      if (skill === "execute") return true;
    }
  }
  return false;
}

// Ramp knob: .claude/identity-gate-config.json {mode: off|announce|deny}, ramped
// exactly like closure-config.json's c6_mode. Env IDENTITY_GATE_MODE overrides
// (tests). Any read/parse error → "off" (fail-open: a broken config neither
// gates nor warns — the hook's existing posture).
function readGateMode() {
  const envMode = (process.env.IDENTITY_GATE_MODE || "").toLowerCase();
  if (envMode === "off" || envMode === "announce" || envMode === "deny") return envMode;
  try {
    const cfgPath = join(REPO_ROOT, ".claude", "identity-gate-config.json");
    if (!existsSync(cfgPath)) return "off";
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    const m = String(cfg.mode || "").toLowerCase();
    return m === "off" || m === "announce" || m === "deny" ? m : "off";
  } catch {
    return "off";
  }
}

// Persist an announce-mode warning for /final-q + /audit to read (Layer 4) —
// array format mirrors LR-060's execution-completion-warnings. Best-effort,
// fail-open (never throws). IDENTITY_GATE_STATE_DIR overrides the dir (tests).
function persistAnnounceWarning(sessionId, relPath, role) {
  try {
    const stateDir = process.env.IDENTITY_GATE_STATE_DIR || join(REPO_ROOT, ".claude", "state");
    if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
    const safe = String(sessionId).replace(/[^a-zA-Z0-9._-]/g, "_");
    const target = join(stateDir, `identity-gate-warnings-${safe}.json`);
    let arr = [];
    if (existsSync(target)) {
      try { const p = JSON.parse(readFileSync(target, "utf8")); if (Array.isArray(p)) arr = p; } catch { /* reset on corrupt */ }
    }
    arr.push({ timestamp: new Date().toISOString(), session_id: sessionId, path: relPath, role, mode: "announce" });
    const tmp = join(tmpdir(), `idgate-${process.pid}-${Date.now()}.tmp`);
    writeFileSync(tmp, JSON.stringify(arr, null, 2));
    renameSync(tmp, target);
  } catch { /* fail-open — must never throw */ }
}

function handleStop() {
  // Banner drift: last assistant message banner identity vs currentIdentity.
  const lastAsst = findLastAssistant();
  if (lastAsst) {
    const t = textOf(lastAsst.content);
    const bm = BANNER_RX.exec(t);
    if (bm && bm[1] !== currentIdentity) {
      emitBlock(
        `Banner drift: last /identity Skill invocation set identity=${currentIdentity}, ` +
        `but banner text shows [${bm[1]}]. The banner is UX; ground truth is /identity. ` +
        `Either (a) re-invoke /identity ${bm[1]} properly (re-reads rules + emits Step 6.5 ` +
        `Constraint Extract), or (b) fix the banner to match ${currentIdentity}. ` +
        `Never relabel without invoking /identity.`
      );
      return;
    }
  }

  // Identity switch without constraint-extract emission.
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== "assistant") continue;
    const t = textOf(msg.content);
    const swm = IDENTITY_SWITCH_RX.exec(t);
    if (!swm) continue;
    const newIdent = swm[2];
    // Look forward up to 5 assistant turns for the constraint-extract heading.
    let extractSeen = false;
    let forwardAsstCount = 0;
    for (let j = i; j < messages.length && forwardAsstCount < 5; j++) {
      if (messages[j].role !== "assistant") continue;
      forwardAsstCount++;
      const tj = textOf(messages[j].content);
      const cm = CONSTRAINT_EXTRACT_RX.exec(tj);
      if (cm && cm[1] === newIdent) { extractSeen = true; break; }
    }
    if (!extractSeen) {
      emitBlock(
        `Identity switch to ${newIdent} detected but no "## [IDENTITY-ACTIVE: ${newIdent}] ` +
        `Constraint Extract" block emitted within 5 turns. /identity Step 6.5 (SP-IDS-03) ` +
        `mandates a visible constraint block before any tool call under the new identity. ` +
        `Either emit the block now, or revert the switch.`
      );
      return;
    }
  }

  emitAllow();
}

function findLastAssistant() {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") return messages[i];
  }
  return null;
}

function textOf(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  let out = "";
  for (const c of content) {
    if (typeof c === "string") { out += c + "\n"; continue; }
    if (c?.type === "text" && typeof c.text === "string") out += c.text + "\n";
  }
  return out;
}

// Relativize a target path to a repo-root-relative forward-slash path before the
// §2 ownership lookup. The Edit/Write/NotebookEdit tools pass ABSOLUTE paths
// (mandatory on Windows, where this repo root contains spaces), but OWNERSHIP_ROWS
// patterns are relative + `^…$`-anchored — so an absolute path matches nothing and
// every pipeline identity default-denies. Strip the REPO_ROOT prefix (derived from
// this hook's own location at load, so it tracks repo renames automatically) rather
// than a hardcoded repo-dir name. Windows paths are case-insensitive, so the prefix
// compare is case-folded; the remainder keeps its original case for the (case-
// sensitive) glob match. A relative path (fixtures, or a tool that passed one)
// shares no prefix with REPO_ROOT and simply passes through unchanged.
function normalizePath(p) {
  let n = p.replace(/\\/g, "/");
  const root = REPO_ROOT.replace(/\\/g, "/").replace(/\/+$/, "");
  const nLower = n.toLowerCase();
  const rootLower = root.toLowerCase();
  if (root && nLower === rootLower) {
    n = "";
  } else if (root && nLower.startsWith(rootLower + "/")) {
    n = n.slice(root.length + 1);
  }
  // A path that shares no prefix with REPO_ROOT (an already-relative fixture
  // input, or a foreign absolute path) passes through unchanged: relatives then
  // match the §2 rows directly, and a genuine foreign absolute path matches no
  // rule and safely default-denies for pipeline identities.
  return n.replace(/^\.\//, "").replace(/^\/+/, "");
}

function emitAllow(reason) {
  if (toolInputJson) {
    // PreToolUse — emit hookSpecificOutput
    const out = { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "allow" } };
    if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
    process.stdout.write(JSON.stringify(out));
  } else {
    process.stdout.write("allow");
  }
}

// Emit a deny with a caller-supplied reason (Layer-1 gate uses this; the §2
// gate uses emitDeny below, which builds an ownership-specific message).
function emitDenyReason(reason) {
  const out = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(out));
}

function emitDeny(identity, path, ownership) {
  const reason =
    `[IDENTITY-GATE] ${identity} cannot ${ownership.action === "READ" ? "write (READ only)" : "access"} ${path} per ${ownership.reason}. ` +
    `Options: (1) invoke /identity <NEW> to switch to a compatible identity (re-reads rules + emits Step 6.5 Constraint Extract), ` +
    `(2) user types "override approved" in chat before this tool call (ONE-SHOT break-glass, not workflow — see ALL-077), ` +
    `(3) update AGENT_SHARED_RULES.md §2 to grant ${identity} access (governance change, preferred for recurring need). ` +
    `Ground truth: last /identity invocation set identity=${identity}; banner text is UX-only.`;
  const out = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(out));
}

function emitBlock(reason) {
  if (toolInputJson) {
    // PreToolUse mode shouldn't use emitBlock, but defensively:
    const out = { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason } };
    process.stdout.write(JSON.stringify(out));
  } else {
    // Stop mode uses root-level decision (per docs).
    process.stdout.write(JSON.stringify({ decision: "block", reason }));
  }
}
