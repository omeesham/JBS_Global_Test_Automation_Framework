#!/usr/bin/env node
// test-identity-switch-fixtures.mjs — sanity check check-identity-switch.mjs
// against hand-crafted JSONL fixtures. Exit 1 on mismatch.
//
// Run: node .claude/hooks/lib/test-identity-switch-fixtures.mjs
//
// Covers both PreToolUse (argv[3] present) and Stop (argv[3] absent) modes.

import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const dir = mkdtempSync(join(tmpdir(), "idsw-"));
// fileURLToPath (not `new URL(...).pathname`) — pathname leaves spaces
// percent-encoded (%20) and keeps the leading slash before the drive letter, so
// on a repo root WITH SPACES it yields a non-existent path → MODULE_NOT_FOUND.
// fileURLToPath decodes and returns an OS-native path the subprocess can load.
const checker = fileURLToPath(new URL("./check-identity-switch.mjs", import.meta.url));
// Repo root, computed the SAME way the hook computes its REPO_ROOT
// (checker is at <root>/.claude/hooks/lib/…). Used to build absolute-path
// fixtures that exercise normalizePath's REPO_ROOT strip against THIS checkout's
// root — spaces and all — so the test is portable across machines.
const repoRoot = resolve(dirname(checker), "..", "..", "..").replace(/\\/g, "/");
const absFromRoot = (rel) => `${repoRoot}/${rel}`;

let failures = 0;
let total = 0;

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
function executeSkillCall(plan = "PLAN_FOO.md") {
  return { name: "Skill", input: { skill: "execute", args: plan } };
}

function runPreToolUse(name, fixture, toolInput, expectDecision, env = {}) {
  total++;
  const path = join(dir, `${name}.jsonl`);
  writeFileSync(path, fixture.join("\n"));
  const toolInputArg = JSON.stringify(toolInput).replace(/"/g, '\\"');
  let out;
  try {
    out = execSync(`node "${checker}" "${path}" "${toolInputArg}"`, { encoding: "utf8", env: { ...process.env, ...env } }).trim();
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
  total++;
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

// === Absolute-path normalization fixtures (Windows Edit/Write tool paths) ===
// The Edit/Write tools pass ABSOLUTE paths; on this repo the root contains spaces.
// normalizePath must relativize them against REPO_ROOT before the §2 lookup, or
// every pipeline-identity write default-denies (the 2026-07-09 regression). These
// build the absolute path from THIS checkout's root so they run anywhere.

// A1. REGRESSION REPRO — BUILDER + Edit of an ABSOLUTE selectors path (spaces in
// root) → allow. BUILDER has ADD on clients/${ACTIVE_CLIENT}/src/selectors/**;
// pre-fix this default-denied because the absolute path matched no §2 row.
runPreToolUse("pretool_builder_abs_selectors_allow", [
  user("/identity BUILDER"),
  asst("[BUILDER | GEN-* ALL-* LR-*] > Loaded.", [identitySkillCall("BUILDER")]),
], { tool_name: "Edit", tool_input: { file_path: absFromRoot("clients/encore/src/selectors/corporate-pricing/override.ts") } }, "allow");

// A2. ANTI-BLANKET-ALLOW — BUILDER + Edit of an ABSOLUTE base.page.ts path
// (backslash separators) → deny. BUILDER = "—" on base.page.ts, so relativization
// must still resolve to the correct §2 row and DENY — proving the fix normalizes
// rather than short-circuiting every absolute path to allow.
runPreToolUse("pretool_builder_abs_basepage_deny", [
  user("/identity BUILDER"),
  asst("[BUILDER | GEN-* ALL-* LR-*] > Loaded.", [identitySkillCall("BUILDER")]),
], { tool_name: "Edit", tool_input: { file_path: absFromRoot("clients/encore/src/pages/base.page.ts").replace(/\//g, "\\") } }, "deny");

// A3. LAYER-1 ON ABSOLUTE PATH — OWNER + /execute + Write to an ABSOLUTE
// test-cases path in deny mode → deny. Proves isPipelineArtifact() also sees the
// relativized path (pre-fix the Layer-1 OWNER gate silently no-op'd on absolutes).
runPreToolUse("layer1_owner_execute_abs_testcases_deny", [
  user("/execute PLAN_FOO.md"),
  asst("Starting execution.", [executeSkillCall()]),
], { tool_name: "Write", tool_input: { file_path: absFromRoot("clients/encore/specs_planning/test-cases/foo.md"), session_id: "tA3" } }, "deny",
  { IDENTITY_GATE_MODE: "deny" });

// === Layer-1 OWNER pipeline-artifact gate fixtures (PLAN_IDENTITY_ENFORCEMENT) ===
// The gate fires only when ALL hold: ground-truth OWNER + active /execute (Skill=execute,
// no later final-q) + target is a pipeline-role-owned deliverable. Mode is forced via
// IDENTITY_GATE_MODE env; announce-mode writes its warning into the temp dir via
// IDENTITY_GATE_STATE_DIR so real .claude/state/ is untouched.
const PIPE_ARTIFACT = "clients/encore/specs_planning/test-cases/foo.md";

// L1. deny mode — OWNER + /execute + Write to GIVER-owned test-cases → deny.
runPreToolUse("layer1_owner_execute_testcases_deny", [
  user("/execute PLAN_FOO.md"),
  asst("Starting execution.", [executeSkillCall()]),
], { tool_name: "Write", tool_input: { file_path: PIPE_ARTIFACT }, session_id: "t1" }, "deny",
  { IDENTITY_GATE_MODE: "deny" });

// L2. announce mode — same situation → allow (warn + persist, never block).
runPreToolUse("layer1_owner_execute_testcases_announce_allow", [
  user("/execute PLAN_FOO.md"),
  asst("Starting execution.", [executeSkillCall()]),
], { tool_name: "Write", tool_input: { file_path: PIPE_ARTIFACT }, session_id: "t2" }, "allow",
  { IDENTITY_GATE_MODE: "announce", IDENTITY_GATE_STATE_DIR: dir });

// L3. off mode — gate disabled → allow.
runPreToolUse("layer1_owner_execute_testcases_off_allow", [
  user("/execute PLAN_FOO.md"),
  asst("Starting execution.", [executeSkillCall()]),
], { tool_name: "Write", tool_input: { file_path: PIPE_ARTIFACT }, session_id: "t3" }, "allow",
  { IDENTITY_GATE_MODE: "off" });

// L4. framework path — OWNER + /execute + Write to scripts/ → allow even in deny (LR-043 safe;
// scripts/ is not pipeline-artifact territory, so the Layer-1 branch is skipped).
runPreToolUse("layer1_owner_execute_scripts_allow", [
  user("/execute PLAN_FOO.md"),
  asst("Starting execution.", [executeSkillCall()]),
], { tool_name: "Write", tool_input: { file_path: "scripts/foo.mjs" }, session_id: "t4" }, "allow",
  { IDENTITY_GATE_MODE: "deny" });

// L5. no /execute — OWNER quick-edit of a pipeline artifact OUTSIDE /execute → allow
// (ad-hoc OWNER edits preserved; the gate only fires inside an execution context).
runPreToolUse("layer1_owner_no_execute_testcases_allow", [
  user("hi"),
  asst("hello"),
], { tool_name: "Write", tool_input: { file_path: PIPE_ARTIFACT }, session_id: "t5" }, "allow",
  { IDENTITY_GATE_MODE: "deny" });

// L6. role adopted — GIVER (not OWNER) + /execute + Write to test-cases → allow (Layer-1 skipped
// for non-OWNER; GIVER has CREATE on test-cases per §2).
runPreToolUse("layer1_giver_execute_testcases_allow", [
  user("/identity GIVER"),
  asst("[GIVER | PLN-* ...] > Loaded.", [identitySkillCall("GIVER")]),
  asst("Starting execution.", [executeSkillCall()]),
], { tool_name: "Write", tool_input: { file_path: PIPE_ARTIFACT }, session_id: "t6" }, "allow",
  { IDENTITY_GATE_MODE: "deny" });

// L7. deny + override handshake — OWNER + /execute + [OVERRIDE-REQUEST] same path + user auth → allow.
runPreToolUse("layer1_owner_execute_testcases_override_allow", [
  user("/execute PLAN_FOO.md"),
  asst("Starting execution.", [executeSkillCall()]),
  asst(`[OVERRIDE-REQUEST] ${PIPE_ARTIFACT} — one-shot OWNER edit, reason: trivial typo.`),
  user("override approved"),
], { tool_name: "Write", tool_input: { file_path: PIPE_ARTIFACT }, session_id: "t7" }, "allow",
  { IDENTITY_GATE_MODE: "deny" });

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
console.log(`ALL PASS — ${total} fixtures.`);
