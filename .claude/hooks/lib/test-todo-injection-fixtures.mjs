#!/usr/bin/env node
// test-todo-injection-fixtures.mjs — contract-derived control suite for the
// todo-injection gate (SP02B). Exercises the --validate path end-to-end via
// subprocess, same shape as test-identity-switch-fixtures.mjs.
//
// Each fixture derives its expectation from .claude/rules/pipeline.md SP02B
// "Hook enforcement behavior" section — NOT from what the code happens to do.
//
// Run: node .claude/hooks/lib/test-todo-injection-fixtures.mjs

import { writeFileSync, mkdtempSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const checker = resolve(__dirname, "check-todo-injection.mjs");
const repoRoot = resolve(__dirname, "..", "..", "..");
const stateDir = join(repoRoot, ".claude", "state");
const tmpDir = mkdtempSync(join(tmpdir(), "todofx-"));

let failures = 0;
let total = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Build a JSONL transcript line from a message object.
function jsonlLine(role, content) {
  const msg = { role, content: Array.isArray(content) ? content : [{ type: "text", text: content }] };
  return JSON.stringify({ message: msg });
}

function asstSkill(skillName, text = "Working.") {
  return jsonlLine("assistant", [
    { type: "text", text },
    { type: "tool_use", name: "Skill", input: { skill: skillName, args: "PLAN_FOO.md" } },
  ]);
}

function asstText(text) {
  return jsonlLine("assistant", text);
}

function userText(text) {
  return jsonlLine("user", text);
}

// Write a transcript JSONL file and return its path.
function writeTranscript(name, lines) {
  const path = join(tmpDir, `${name}.jsonl`);
  writeFileSync(path, lines.join("\n"));
  return path;
}

// Write a todo-state file for a given session ID.
function writeTodoState(sessionId, state) {
  if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
  const path = join(stateDir, `todo-state-${sessionId}.json`);
  writeFileSync(path, JSON.stringify(state, null, 2));
  return path;
}

// Remove a todo-state file.
function removeTodoState(sessionId) {
  const path = join(stateDir, `todo-state-${sessionId}.json`);
  try { rmSync(path); } catch { /* ignore if missing */ }
}

// Run the --validate mode with given stdin payload and return the decision.
function runValidate(name, sessionId, transcriptPath, toolName, toolInput) {
  total++;
  const stdinPayload = JSON.stringify({
    session_id: sessionId,
    transcript_path: transcriptPath,
    tool_name: toolName,
    tool_input: toolInput,
  });

  let out;
  try {
    out = execSync(`node "${checker}" --validate`, {
      encoding: "utf8",
      input: stdinPayload,
      timeout: 10000,
    }).trim();
  } catch (e) {
    // execSync throws on non-zero exit; stdout may still be in e.stdout
    out = (e.stdout || "").trim() || `ERROR(${e.message.slice(0, 80)})`;
  }

  let decision = "parse-error";
  try {
    const parsed = JSON.parse(out);
    decision = parsed.hookSpecificOutput?.permissionDecision ?? "missing";
  } catch { /* leave as parse-error */ }

  return { decision, raw: out };
}

function assertDecision(name, actual, expected, raw) {
  const ok = actual === expected;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  expect=${expected}  got=${actual}${ok ? "" : "  raw=" + raw.slice(0, 120)}`);
  if (!ok) failures++;
}

// ---------------------------------------------------------------------------
// Transcript templates
// ---------------------------------------------------------------------------

// Transcript showing an active /execute context (Skill execute, no final-q after).
const EXECUTE_ACTIVE = [
  userText("/execute PLAN_FOO.md"),
  asstSkill("execute", "Starting execution."),
  asstText("Working on Phase 1."),
];

// Transcript showing NO /execute context (plain chat).
const NO_EXECUTE = [
  userText("hi"),
  asstText("hello"),
];

// Transcript with /execute followed by final-q (execute closed).
const EXECUTE_CLOSED = [
  userText("/execute PLAN_FOO.md"),
  asstSkill("execute", "Starting execution."),
  asstSkill("final-q", "Running final questions."),
];

// ---------------------------------------------------------------------------
// Fixtures — derived from .claude/rules/pipeline.md SP02B § Hook enforcement
// ---------------------------------------------------------------------------

const SID_PREFIX = "fixture-tdg-";
const stateFiles = [];

try {
  // --- CASE 1: Outside /execute → allow ---
  // Contract: "If NOT in /execute → emit allow." (pipeline.md line 338)
  {
    const sid = SID_PREFIX + "1-no-execute";
    const tp = writeTranscript("case1", NO_EXECUTE);
    const { decision, raw } = runValidate("case1_outside_execute", sid, tp, "Edit", { file_path: "src/foo.ts", new_string: "x", old_string: "y" });
    assertDecision("outside_execute_allow", decision, "allow", raw);
  }

  // --- CASE 2: In /execute, missing state file → deny ---
  // Contract: "Missing OR count == 0 → deny ('Build TodoWrite first…')" (pipeline.md line 339)
  {
    const sid = SID_PREFIX + "2-missing-state";
    removeTodoState(sid); // ensure no state file exists
    const tp = writeTranscript("case2", EXECUTE_ACTIVE);
    const { decision, raw } = runValidate("case2_missing_state", sid, tp, "Edit", { file_path: "src/foo.ts", new_string: "x", old_string: "y" });
    assertDecision("in_execute_missing_state_deny", decision, "deny", raw);
  }

  // --- CASE 3: In /execute, count == 0 → deny ---
  // Contract: "Missing OR count == 0 → deny" (pipeline.md line 339)
  {
    const sid = SID_PREFIX + "3-zero-count";
    writeTodoState(sid, { session_id: sid, count: 0, tagged_count: 0, untagged_indices: [], tags_per_item: [] });
    stateFiles.push(sid);
    const tp = writeTranscript("case3", EXECUTE_ACTIVE);
    const { decision, raw } = runValidate("case3_zero_count", sid, tp, "Edit", { file_path: "src/foo.ts", new_string: "x", old_string: "y" });
    assertDecision("in_execute_zero_todos_deny", decision, "deny", raw);
  }

  // --- CASE 4: In /execute, untagged entries → deny ---
  // Contract: "untagged_indices.length > 0 → deny ('entry #N missing tag…')" (pipeline.md line 339)
  {
    const sid = SID_PREFIX + "4-untagged";
    writeTodoState(sid, {
      session_id: sid, count: 3, tagged_count: 2, untagged_indices: [1],
      tags_per_item: [["[/skill:direct]"], [], ["[ceremony]"]],
    });
    stateFiles.push(sid);
    const tp = writeTranscript("case4", EXECUTE_ACTIVE);
    const { decision, raw } = runValidate("case4_untagged", sid, tp, "Edit", { file_path: "src/foo.ts", new_string: "x", old_string: "y" });
    assertDecision("in_execute_untagged_todos_deny", decision, "deny", raw);
  }

  // --- CASE 5: In /execute, all tagged → allow ---
  // Contract: "Otherwise → allow" (pipeline.md line 339)
  {
    const sid = SID_PREFIX + "5-tagged";
    writeTodoState(sid, {
      session_id: sid, count: 2, tagged_count: 2, untagged_indices: [],
      tags_per_item: [["[/skill:direct]"], ["LR-027(plan finalization)"]],
    });
    stateFiles.push(sid);
    const tp = writeTranscript("case5", EXECUTE_ACTIVE);
    const { decision, raw } = runValidate("case5_tagged", sid, tp, "Edit", { file_path: "src/foo.ts", new_string: "x", old_string: "y" });
    assertDecision("in_execute_all_tagged_allow", decision, "allow", raw);
  }

  // --- CASE 6: In /execute, malformed state JSON → fail-OPEN (allow) ---
  // Contract: "any uncaught exception … hook returns allow" (pipeline.md line 340 — Fail-OPEN policy)
  {
    const sid = SID_PREFIX + "6-malformed";
    // Write invalid JSON to the state file
    if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
    const malformedPath = join(stateDir, `todo-state-${sid}.json`);
    writeFileSync(malformedPath, "{{not valid json at all");
    stateFiles.push(sid);
    const tp = writeTranscript("case6", EXECUTE_ACTIVE);
    const { decision, raw } = runValidate("case6_malformed", sid, tp, "Edit", { file_path: "src/foo.ts", new_string: "x", old_string: "y" });
    assertDecision("in_execute_malformed_state_failopen_allow", decision, "allow", raw);
  }

  // --- CASE 7: Correct-order override bypasses deny (missing state) → allow ---
  // Contract: "assistant emits [OVERRIDE-REQUEST] … user types authorization …
  //   within 3 assistant turns, the next Edit/Write on that path is allowed"
  //   (pipeline.md lines 344-348)
  {
    const sid = SID_PREFIX + "7-override-ok";
    removeTodoState(sid);
    const tp = writeTranscript("case7", [
      ...EXECUTE_ACTIVE,
      asstText("[OVERRIDE-REQUEST] src/foo.ts — legitimate reason for bypass."),
      userText("override approved"),
    ]);
    const { decision, raw } = runValidate("case7_override_ok", sid, tp, "Edit", { file_path: "src/foo.ts", new_string: "x", old_string: "y" });
    assertDecision("override_correct_order_allow", decision, "allow", raw);
  }

  // --- CASE 8: Wrong-order override (auth before request) → deny ---
  // Contract: P2-LOT11-09 security fix — auth must appear AFTER request chronologically.
  // Same ordering enforcement as identity gate (hook-utils.mjs hasOverrideAuthorization).
  {
    const sid = SID_PREFIX + "8-override-wrong";
    removeTodoState(sid);
    const tp = writeTranscript("case8", [
      ...EXECUTE_ACTIVE,
      userText("override approved"),
      asstText("[OVERRIDE-REQUEST] src/foo.ts — attempting bypass after auth."),
    ]);
    const { decision, raw } = runValidate("case8_override_wrong", sid, tp, "Edit", { file_path: "src/foo.ts", new_string: "x", old_string: "y" });
    assertDecision("override_wrong_order_deny", decision, "deny", raw);
  }

  // --- CASE 9: /execute closed by final-q → allow (not in /execute anymore) ---
  // Contract: "If NOT in /execute → emit allow" — final-q closes the execute scope.
  {
    const sid = SID_PREFIX + "9-closed";
    removeTodoState(sid); // no state — would deny if in execute, but we're not
    const tp = writeTranscript("case9", EXECUTE_CLOSED);
    const { decision, raw } = runValidate("case9_closed", sid, tp, "Edit", { file_path: "src/foo.ts", new_string: "x", old_string: "y" });
    assertDecision("execute_closed_by_finalq_allow", decision, "allow", raw);
  }

  // --- CASE 10: Non-mutation tool in /execute → allow (only Edit|Write|NotebookEdit gated) ---
  // Contract: "PreToolUse on Edit|Write|NotebookEdit" — other tools not gated.
  {
    const sid = SID_PREFIX + "10-non-mutation";
    removeTodoState(sid);
    const tp = writeTranscript("case10", EXECUTE_ACTIVE);
    const { decision, raw } = runValidate("case10_non_mutation", sid, tp, "Bash", { command: "ls" });
    assertDecision("non_mutation_tool_allow", decision, "allow", raw);
  }

} finally {
  // Cleanup: remove all fixture state files
  for (const sid of stateFiles) {
    removeTodoState(sid);
  }
  // Clean tmp dir
  try { rmSync(tmpDir, { recursive: true }); } catch { /* best effort */ }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log("");
if (failures > 0) {
  console.error(`FAILED — ${failures} of ${total} fixture(s) did not match contract-derived expectation.`);
  process.exit(1);
}
console.log(`ALL PASS — ${total} fixtures verified against SP02B contract.`);
