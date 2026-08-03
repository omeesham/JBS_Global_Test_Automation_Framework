#!/usr/bin/env node
// check-jargon.mjs — LR-058 write-time jargon gate (PreToolUse on Edit|Write|NotebookEdit).
// Sev: S3 | Graduating incident: P3-08 (jargon telemetry gap 2026-08-03)
//
// PURPOSE
//   The ship/commit-time gate (scripts/verify-no-forbidden.mjs) only catches internal jargon
//   at `git add` time. Both 2026-06-11 build sessions left work uncommitted, so 25 jargon comment
//   lines lived undetected in 9 client-shippable files until the push session staged them. This
//   hook closes that window: it blocks the token from EVER being written into a shippable file.
//
// SCOPE (intentionally narrow — same reach as the ship gate's client-shipping scope)
//   - Fires ONLY when tool_input.file_path resolves to an isClientShipping() path
//     (clients/<id>/ minus the DENY_GLOB internal classes). Framework files (.claude/, plans/,
//     specs_planning/, docs/, pipeline/, scripts/, root) are NEVER scanned — they legitimately
//     reference internal IDs/artifacts.
//   - Scans ONLY the NEW content fragment (new_string / content / new_source). Old content is
//     never inspected, so an edit that REMOVES jargon (e.g. this session's scrub) always passes.
//   - Binary deliverables (xlsx/png/…) are skipped (a utf-8 scan over packed bytes false-positives;
//     the workbook is content-checked separately by xlsx-vocab-lint).
//
// PATTERNS: imported from scripts/lib/forbidden-patterns.mjs (the single source of truth shared
//   with the ship gate). MARKER_GREP_CLIENT_ONLY (hard tokens: PLAN_/SUBPLAN_/identities/…) +
//   SOURCE_COMMENT_JARGON (soft tokens: LR-###/§/doctrine/walk-evidence/rca-*.md/_internal/…).
//
// NO OVERRIDE PATH (deliberate): internal IDs/artifact names never legitimately belong in shipped
//   client source. The fix is always to express the reason in plain English — not to bypass. If a
//   token is a genuine false-positive, add it to the DELIBERATELY-EXCLUDED list in
//   forbidden-patterns.mjs (which updates both gates at once), don't override per-write.
//
// FAIL-OPEN: any error → logged to .claude/state/hook-failures.log, returns allow. A broken gate
//   must never wedge the session.
//
// Companion: .claude/hooks/jargon-gate.sh (the thin bash wrapper wired in settings.json).
// Rule body: .claude/rules/deliverable.md (LR-058).

import { readFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { fireTelemetry } from "./hook-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const STATE_DIR = join(REPO_ROOT, ".claude", "state");
const FAILURE_LOG = join(STATE_DIR, "hook-failures.log");
const GATE_FIRES_LOG = join(STATE_DIR, "gate-fires.log");

const MUTATION_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);
const BINARY_RX = /\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|pdf|zip|tar|gz|7z|xlsx|xlsm|xls|mp4|webm|wav|mp3)$/i;

// Lazy-loaded so a missing/broken module fails-open rather than crashing on import.
let PATTERNS = null;
let isClientShipping = null;
async function loadPatterns() {
  if (PATTERNS) return true;
  const mod = await import("../../../scripts/lib/forbidden-patterns.mjs");
  PATTERNS = [...mod.MARKER_GREP_CLIENT_ONLY, ...mod.SOURCE_COMMENT_JARGON];
  isClientShipping = mod.isClientShipping;
  return true;
}

// Normalize an absolute (or already-relative) target path to a repo-relative,
// forward-slashed path so isClientShipping() can match `^clients/<id>/...`.
export function toRepoRel(targetPath) {
  if (!targetPath) return "";
  const norm = String(targetPath).replace(/\\/g, "/");
  const rootNorm = REPO_ROOT.replace(/\\/g, "/").replace(/\/$/, "");
  if (norm.startsWith(rootNorm + "/")) return norm.slice(rootNorm.length + 1);
  return norm.replace(/^\.?\//, "");
}

export function isBinaryPath(rel) {
  return BINARY_RX.test(rel || "");
}

// Returns the NEW content fragment(s) to scan. Old content is deliberately excluded
// so scrubs / deletions of jargon always pass.
export function extractNewContent(toolName, toolInput) {
  const out = [];
  if (!toolInput || typeof toolInput !== "object") return out;
  if (toolName === "Edit") {
    if (typeof toolInput.new_string === "string") out.push(toolInput.new_string);
  } else if (toolName === "Write") {
    if (typeof toolInput.content === "string") out.push(toolInput.content);
  } else if (toolName === "NotebookEdit") {
    if (typeof toolInput.new_source === "string") out.push(toolInput.new_source);
    else if (typeof toolInput.content === "string") out.push(toolInput.content);
  }
  return out;
}

// Returns the first matched token string (e.g. "LR-057", "SUBPLAN_FOO") or null.
export function scanJargon(content, patterns) {
  if (!content) return null;
  for (const re of patterns) {
    const m = content.match(re);
    if (m) return m[0];
  }
  return null;
}

// Pure decision function — testable without stdin/process. Returns
// { allow: boolean, reason?: string, matched?: string, rel?: string }.
export async function evaluate(payload) {
  const toolName = payload.tool_name || payload.toolName || "";
  if (!MUTATION_TOOLS.has(toolName)) return { allow: true };

  const toolInput = payload.tool_input || payload.toolInput || {};
  const targetPath = toolInput.file_path || toolInput.notebook_path || toolInput.path || "";
  if (!targetPath) return { allow: true };

  const rel = toRepoRel(targetPath);
  await loadPatterns();
  if (!isClientShipping(rel)) return { allow: true };
  if (isBinaryPath(rel)) return { allow: true };

  for (const frag of extractNewContent(toolName, toolInput)) {
    const token = scanJargon(frag, PATTERNS);
    if (token) {
      return {
        allow: false,
        matched: token,
        rel,
        reason:
          `LR-058: internal jargon "${token}" cannot be written into the client-shippable file ` +
          `${rel}. Shipped source is customer-facing — express the reason in PLAIN ENGLISH instead ` +
          `(e.g. "verify-only guard" not "LR-057"; "the search dialog" not "SUBPLAN_…"; drop ` +
          `internal artifact paths like _internal/… and rca-*.md / walk-evidence / §-refs / ` +
          `pipeline identity codenames). Internal IDs/artifacts belong in plans, specs_planning, ` +
          `and the activity log — never in shipped client source. (Token set: ` +
          `scripts/lib/forbidden-patterns.mjs; rule: .claude/rules/deliverable.md.)`,
      };
    }
  }
  return { allow: true };
}

// ---------------------------------------------------------------------------
// Hook entry point (skipped under --self-test or when imported).
// ---------------------------------------------------------------------------
const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly && process.argv[2] !== "--no-run") {
  runHook();
}

async function runHook() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, "utf8"));
  } catch (e) {
    failOpen(`stdin parse failed: ${e.message}`);
    return;
  }
  try {
    const verdict = await evaluate(payload);
    if (verdict.allow) emitAllow();
    else {
      fireTelemetry('jargon-gate', 'deny', verdict.rel || 'unknown');
      emitDeny(verdict.reason);
    }
  } catch (e) {
    failOpen(`evaluate threw: ${e.message}`);
  }
}

function emitAllow(reason) {
  const out = { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "allow" } };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
}

function emitDeny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
}

function failOpen(reason) {
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} check-jargon.mjs: ${reason}\n`);
  } catch {
    /* swallow — fail-OPEN must not throw */
  }
  emitAllow();
}
