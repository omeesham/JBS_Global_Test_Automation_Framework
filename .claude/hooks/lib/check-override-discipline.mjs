#!/usr/bin/env node
// check-override-discipline.mjs — Stop hook audit of override usage.
//
// Complementary to check-identity-switch.mjs: that hook handles the
// PreToolUse *allow* decision for a valid override. This hook handles the
// *audit* at session end — were the structural rules (request-approve
// handshake, ≤1 override per session unless explicit batch approval, required
// fields in the [OVERRIDE] log line) actually followed?
//
// Override grammar (per SP-IDS-03 + ALL-077):
//
//   [OVERRIDE-REQUEST] {identity} writing to {path} — reason: {reason}
//     emitted by assistant BEFORE the write.
//
//   (user message containing) override approved | override ok | approve override | authorized to override
//     user-typed authorization.
//
//   [OVERRIDE] {identity} wrote to {path} — reason: {reason} — authorized by: {phrase}
//     emitted by assistant AFTER the write succeeds.
//
//   [OVERRIDE-EXPLICIT-APPROVAL-BATCH]
//     user-typed tag (once per session) that pre-approves multiple overrides.
//     Without this, a SECOND override in the same session is a violation.
//
// Contract:
//   argv[2] = JSONL transcript path
//   stdout  = "block" | "allow"   (shell wrapper expands "block" into the
//             JSON decision object)
//
// Fail-open on any parse error.

import { readFileSync, existsSync } from "node:fs";

const file = process.argv[2];
if (!file || !existsSync(file)) {
  process.stdout.write("allow");
  process.exit(0);
}

// Line-anchored: [OVERRIDE] / [OVERRIDE-REQUEST] log lines must start a line,
// but tolerate common markdown wrappers (backticks, blockquote, bullet,
// emphasis). The strict `^\s*\[` anchor previously rejected legitimate
// handshakes wrapped in chat formatting (SCOPED 2026-04-23 regression fix,
// LR-043 remediation; mirror of check-identity-switch.mjs OVERRIDE_REQUEST_RX).
// Prose mentions like "the [OVERRIDE] tag" still don't match because they
// occur mid-sentence, not at line start. Malformed log lines (missing
// identity, e.g. "[OVERRIDE] wrote to X") DO match so Rule 2 can report
// the missing-field violation.
const OVERRIDE_LOG_BASIC_RX = /(?:^|\n)[\s`>*_-]*\[OVERRIDE\][\s`]*\S/;
const OVERRIDE_REQUEST_RX = /(?:^|\n)[\s`>*_-]*\[OVERRIDE-REQUEST\][\s`]*\S/;
const OVERRIDE_AUTH_RX = /\b(override approved|override ok|approve override|authorized to override|i authorize|you are authorized)\b/i;
const BATCH_APPROVAL_RX = /^\s*\[OVERRIDE-EXPLICIT-APPROVAL-BATCH\]/m;

let messages;
try {
  const raw = readFileSync(file, "utf8");
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
  process.stdout.write("allow");
  process.exit(0);
}

if (messages.length === 0) {
  process.stdout.write("allow");
  process.exit(0);
}

// Collect override events in order of occurrence.
const overrideLogs = [];
const overrideRequests = [];
const userAuths = [];
const batchApprovals = [];

for (let i = 0; i < messages.length; i++) {
  const msg = messages[i];
  const text = textOf(msg.content);
  if (!text) continue;

  if (msg.role === "assistant") {
    if (OVERRIDE_LOG_BASIC_RX.test(text)) {
      // Extract the full line containing [OVERRIDE]
      for (const line of text.split("\n")) {
        if (OVERRIDE_LOG_BASIC_RX.test(line) && !OVERRIDE_REQUEST_RX.test(line)) {
          overrideLogs.push({ index: i, line });
        }
      }
    }
    if (OVERRIDE_REQUEST_RX.test(text)) {
      for (const line of text.split("\n")) {
        if (OVERRIDE_REQUEST_RX.test(line)) {
          overrideRequests.push({ index: i, line });
        }
      }
    }
  } else if (msg.role === "user") {
    if (OVERRIDE_AUTH_RX.test(text)) userAuths.push({ index: i });
    if (BATCH_APPROVAL_RX.test(text)) batchApprovals.push({ index: i });
  }
}

if (overrideLogs.length === 0) {
  // No override used — nothing to audit.
  process.stdout.write("allow");
  process.exit(0);
}

// Rule 1: each [OVERRIDE] log must have a preceding [OVERRIDE-REQUEST] + user auth.
for (const olog of overrideLogs) {
  const precedingRequest = overrideRequests.find((r) => r.index < olog.index);
  if (!precedingRequest) {
    emitBlock(
      `Override used without preceding [OVERRIDE-REQUEST] handshake at message ${olog.index}. ` +
      `Per SP-IDS-02, every [OVERRIDE] must be preceded by assistant's [OVERRIDE-REQUEST] + user-typed authorization. ` +
      `Line: "${olog.line.trim()}"`
    );
    process.exit(0);
  }
  const precedingAuth = userAuths.find((a) => a.index > precedingRequest.index && a.index < olog.index);
  const precedingBatch = batchApprovals.find((b) => b.index <= olog.index);
  if (!precedingAuth && !precedingBatch) {
    emitBlock(
      `Override used without user-typed authorization at message ${olog.index}. ` +
      `Request was at message ${precedingRequest.index} but no "override approved" / "authorized" phrase ` +
      `appeared in a user message before the [OVERRIDE] log line. Line: "${olog.line.trim()}"`
    );
    process.exit(0);
  }
}

// Rule 2: required fields in [OVERRIDE] log — identity, path, reason.
for (const olog of overrideLogs) {
  const line = olog.line.trim();
  const hasIdentity = /\[OVERRIDE\]\s+[A-Z]+/.test(line);
  const hasPath = /(wrote to|writing to|authorized to write)\s+\S+/.test(line);
  const hasReason = /reason:\s*\S+/i.test(line);
  const missing = [];
  if (!hasIdentity) missing.push("identity (e.g., [OVERRIDE] OWNER)");
  if (!hasPath) missing.push("path (e.g., writing to scripts/foo.mjs)");
  if (!hasReason) missing.push("reason (e.g., reason: one-shot infra fix)");
  if (missing.length > 0) {
    emitBlock(
      `[OVERRIDE] log missing required field(s): ${missing.join(", ")}. ` +
      `Correct format: "[OVERRIDE] {identity} wrote to {path} — reason: {reason} — authorized by: {phrase}". ` +
      `Line: "${line}"`
    );
    process.exit(0);
  }
}

// Rule 3: multiple overrides per session require batch approval.
if (overrideLogs.length >= 2 && batchApprovals.length === 0) {
  emitBlock(
    `${overrideLogs.length} [OVERRIDE] uses in this session without user-typed ` +
    `[OVERRIDE-EXPLICIT-APPROVAL-BATCH] tag. Override is one-shot break-glass, not workflow (ALL-077). ` +
    `For recurring need, switch identity or update §2 ownership. If multiple overrides are legitimate, ` +
    `user must type "[OVERRIDE-EXPLICIT-APPROVAL-BATCH]" once.`
  );
  process.exit(0);
}

process.stdout.write("allow");

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

function emitBlock(reason) {
  const out = { decision: "block", reason };
  process.stdout.write(JSON.stringify(out));
}
