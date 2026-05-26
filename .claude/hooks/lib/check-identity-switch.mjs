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

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ownershipFor, canWrite } from "../../../scripts/identity-ownership.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MUTATION_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);
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

  // Scan backward from most recent; only consider last 3 assistant turns.
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant") {
      asstTurnCount++;
      if (asstTurnCount > 3) break;
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

function normalizePath(p) {
  let n = p.replace(/\\/g, "/");
  // Strip absolute prefixes (C:/Users/.../repo/ → "")
  const repoName = "encore_framework/";
  const idx = n.lastIndexOf(repoName);
  if (idx !== -1) n = n.slice(idx + repoName.length);
  n = n.replace(/^\.\//, "");
  return n;
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
