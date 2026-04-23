#!/usr/bin/env node
// test-identity-switch-fixtures.mjs — sanity check check-identity-switch.mjs
// against hand-crafted JSONL fixtures. Exit 1 on mismatch.
//
// Run: node .claude/hooks/lib/test-identity-switch-fixtures.mjs
//
// Covers both PreToolUse (argv[3] present) and Stop (argv[3] absent) modes.

import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

const dir = mkdtempSync(join(tmpdir(), "idsw-"));
const checker = new URL("./check-identity-switch.mjs", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

let failures = 0;

// Build helpers for JSONL lines.
function asst(text, tools = []) {
  const content = [{ type: "text", text }];
  for (const t of tools) {
    if (typeof t === "string") content.push({ type: "tool_use", name: t, input: {} });
    else content.push({ type: "tool_use", name: t.name, input: t.input || {} });
  }
  return JSON.stringify({ message: { role: "assistant", content } });
}
function user(text) {
  return JSON.stringify({ message: { role: "user", content: [{ type: "text", text }] } });
}
function identitySkillCall(codename) {
  return { name: "Skill", input: { skill: "identity", args: codename } };
}

function runPreToolUse(name, fixture, toolInput, expectDecision) {
  const path = join(dir, `${name}.jsonl`);
  writeFileSync(path, fixture.join("\n"));
  const toolInputArg = JSON.stringify(toolInput).replace(/"/g, '\\"');
  let out;
  try {
    out = execSync(`node "${checker}" "${path}" "${toolInputArg}"`, { encoding: "utf8" }).trim();
  } catch (e) {
    out = `ERROR(${e.message})`;
  }
  let decision = "parse-error";
  try { decision = JSON.parse(out).hookSpecificOutput?.permissionDecision ?? "missing"; } catch { /* */ }
  const ok = decision === expectDecision;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  expect=${expectDecision}  got=${decision}  ${ok ? "" : "raw=" + out}`);
  if (!ok) failures++;
}

function runStop(name, fixture, expect) {
  const path = join(dir, `${name}.jsonl`);
  writeFileSync(path, fixture.join("\n"));
  let out;
  try {
    out = execSync(`node "${checker}" "${path}"`, { encoding: "utf8" }).trim();
  } catch (e) {
    out = `ERROR(${e.message})`;
  }
  // Expect: "allow" or a JSON block containing "decision":"block"
  let actual = "unknown";
  if (out === "allow") actual = "allow";
  else if (out.includes('"decision"') && out.includes('"block"')) actual = "block";
  else actual = out;
  const ok = actual === expect;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  expect=${expect}  got=${actual}`);
  if (!ok) failures++;
}

// === PreToolUse fixtures ===

// 1. TRUE-POSITIVE — last /identity=HUNTER, Edit scripts/foo.mjs → deny
runPreToolUse("pretool_hunter_scripts_deny", [
  user("/identity HUNTER"),
  asst("[HUNTER | REQ-* ALL-* LR-*] > Loaded.", [identitySkillCall("HUNTER")]),
], { tool_name: "Edit", tool_input: { file_path: "scripts/foo.mjs" } }, "deny");

// 2. TRUE-NEGATIVE — last /identity=OWNER, Edit scripts/foo.mjs → allow
runPreToolUse("pretool_owner_scripts_allow", [
  user("/identity OWNER"),
  asst("[OWNER | ALL-* LR-*] > Loaded.", [identitySkillCall("OWNER")]),
], { tool_name: "Edit", tool_input: { file_path: "scripts/foo.mjs" } }, "allow");

// 3. OVERRIDE-PATH — HUNTER + override-request + user authorization → allow
runPreToolUse("pretool_override_allow", [
  user("/identity HUNTER"),
  asst("[HUNTER | REQ-* ALL-* LR-*] > Loaded.", [identitySkillCall("HUNTER")]),
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/foo.mjs — reason: one-shot infra fix."),
  user("override approved"),
], { tool_name: "Edit", tool_input: { file_path: "scripts/foo.mjs" } }, "allow");

// 4. OVERRIDE-WRONG-PATH — override-request names different path → deny
runPreToolUse("pretool_override_wrong_path_deny", [
  user("/identity HUNTER"),
  asst("[HUNTER | REQ-* ALL-* LR-*] > Loaded.", [identitySkillCall("HUNTER")]),
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/other.mjs — reason: one-shot."),
  user("override approved"),
], { tool_name: "Edit", tool_input: { file_path: "scripts/foo.mjs" } }, "deny");

// 5. NO-IDENTITY — no /identity Skill call, Edit .claude/hooks/foo.sh → allow
// (default OWNER can write .claude/hooks/ per catch-all RW)
runPreToolUse("pretool_default_owner_hooks_allow", [
  user("hi"),
  asst("hello"),
], { tool_name: "Edit", tool_input: { file_path: ".claude/hooks/foo.sh" } }, "allow");

// 6. DEFAULT-OWNER-ALLOW — no /identity, Edit clients/encore/docs/REQUIREMENTS.md → allow
// (SCOPED 2026-04-23, LR-043 §A: OWNER is short-circuited in canWrite() to allow all
// writes. §2 write-gate applies only to pipeline identities. Previously this fixture
// asserted deny based on §2's READ-only grant; after the scoping fix, OWNER bypasses
// §2 entirely. Pipeline-identity denies are covered by fixture 1 above.)
runPreToolUse("pretool_default_owner_req_allow", [
  user("hi"),
  asst("hello"),
], { tool_name: "Edit", tool_input: { file_path: "clients/encore/docs/REQUIREMENTS.md" } }, "allow");

// 7. NON-MUTATION-TOOL — Bash invocation → allow (only mutation tools gated)
runPreToolUse("pretool_bash_allow", [
  user("/identity HUNTER"),
  asst("[HUNTER | ...] > Loaded.", [identitySkillCall("HUNTER")]),
], { tool_name: "Bash", tool_input: { command: "ls" } }, "allow");

// === Stop fixtures ===

// 8. STOP-BANNER-DRIFT — last /identity=OWNER, last banner=[GARDENER] → block
runStop("stop_banner_drift_block", [
  user("/identity OWNER"),
  asst("[OWNER | ALL-* LR-*] > Loaded.", [identitySkillCall("OWNER")]),
  asst("[GARDENER | MNT-* ALL-* LR-*] > Working..."),
], "block");

// 9. STOP-BANNER-MATCH — banner matches ground truth → allow
runStop("stop_banner_match_allow", [
  user("/identity OWNER"),
  asst("[OWNER | ALL-* LR-*] > Loaded.", [identitySkillCall("OWNER")]),
  asst("[OWNER | ALL-* LR-*] > Done."),
], "allow");

// 10. STOP-SWITCH-NO-EXTRACT — IDENTITY SWITCH logged but no Constraint Extract → block
runStop("stop_switch_no_extract_block", [
  user("/identity OWNER"),
  asst("[OWNER | ...] > Loaded.", [identitySkillCall("OWNER")]),
  asst("IDENTITY SWITCH: [OWNER] -> [BUILDER]", [identitySkillCall("BUILDER")]),
  asst("[BUILDER | GEN-* ALL-* LR-*] > Working, no extract block emitted."),
], "block");

// 11. STOP-SWITCH-WITH-EXTRACT — switch properly followed by Constraint Extract → allow
runStop("stop_switch_with_extract_allow", [
  user("/identity OWNER"),
  asst("[OWNER | ...] > Loaded.", [identitySkillCall("OWNER")]),
  asst("IDENTITY SWITCH: [OWNER] -> [BUILDER]", [identitySkillCall("BUILDER")]),
  asst(
    "[BUILDER | GEN-* ALL-* LR-*] >\n\n## [IDENTITY-ACTIVE: BUILDER] Constraint Extract\n\n**Hard stops**: ...",
  ),
], "allow");

// 12. STOP-EMPTY-TRANSCRIPT — empty JSONL → allow
runStop("stop_empty_transcript_allow", [], "allow");

console.log("");
if (failures > 0) {
  console.error(`FAILED — ${failures} fixture(s) did not match expected decision.`);
  process.exit(1);
}
console.log(`ALL PASS — ${12} fixtures.`);
