#!/usr/bin/env node
// test-rubberstamp-fixtures.mjs — sanity check check-rubberstamp.mjs against
// 6 hand-crafted JSONL fixtures. No assertions framework — just exit 1 on
// mismatch. Run: node .claude/hooks/lib/test-rubberstamp-fixtures.mjs

import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

const dir = mkdtempSync(join(tmpdir(), "rubberstamp-"));
const checker = new URL("./check-rubberstamp.mjs", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

let failures = 0;

function asst(text, tools = []) {
  const content = [{ type: "text", text }];
  for (const t of tools) content.push({ type: "tool_use", name: t, input: {} });
  return JSON.stringify({ message: { role: "assistant", content } });
}
function user(text) {
  return JSON.stringify({ message: { role: "user", content: [{ type: "text", text }] } });
}

function run(name, fixture, expected) {
  const path = join(dir, `${name}.jsonl`);
  writeFileSync(path, fixture.join("\n"));
  let out;
  try {
    out = execSync(`node "${checker}" "${path}"`, { encoding: "utf8" }).trim();
  } catch (e) {
    out = `ERROR(${e.message})`;
  }
  const ok = out === expected;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  expected=${expected}  got=${out}`);
  if (!ok) failures++;
}

// Fixture 1 — TRUE POSITIVE: review query + rubber-stamp + zero reads → block
run("rubberstamp_no_reads", [
  user("review what u did, did you do it correctly"),
  asst("Nothing to fix. Everything is correct."),
], "block");

// Fixture 2 — TRUE NEGATIVE: review query + rubber-stamp + Read in same turn → allow
run("rubberstamp_with_read_same_turn", [
  user("review if all is correct"),
  asst("Verified. Nothing to fix.", ["Read", "Grep"]),
], "allow");

// Fixture 3 — TRUE NEGATIVE: review query + rubber-stamp + Read in EARLIER turn → allow (multi-turn window)
run("rubberstamp_read_earlier_turn", [
  user("review the file"),
  asst("Reading...", ["Read", "Bash"]),
  user("so all good?"),
  asst("Yes, nothing to fix."),
], "allow");

// Fixture 4 — TRUE NEGATIVE: rubber-stamp phrase but NO review query → allow (false-positive defense)
run("rubberstamp_no_query", [
  user("update the README"),
  asst("Done. All clean."),
], "allow");

// Fixture 5 — TRUE NEGATIVE: review query + rubber-stamp WITH qualifier ("but X") → allow
run("rubberstamp_with_qualifier", [
  user("is this correct?"),
  asst("Mostly clean, but one mismatch found at line 42."),
], "allow");

// Fixture 6 — TRUE POSITIVE: complex multi-turn, review query, multiple later turns with NO reads → block
run("rubberstamp_long_no_reads", [
  user("review the work"),
  asst("Sure."),
  user("anything broken?"),
  asst("No issues found. Everything is correct."),
], "block");

// Fixture 7 — Edge: empty transcript → allow
run("empty_transcript", [], "allow");

// Fixture 8 — Edge: rubber-stamp phrase appears in user message (quoted, not assistant) → allow
run("phrase_in_user_only", [
  user("review and tell me if there's nothing to fix"),
  asst("Looking into it.", ["Read"]),
], "allow");

// Fixture 9 — REAL SESSION REPLAY: the exact scenario that triggered this hook.
// User asked "should u review once more what u did was all correct until now?"
// Agent replied "Nothing to fix" after only grep-frontmatter check. That grep
// DID read an artifact though, so THIS specific session wouldn't have blocked
// — which reveals a harder truth: narrow grep still counts as "read". The hook
// catches the complete-no-tool-call case; depth of reading is a human judgment.
run("real_session_narrow_read", [
  user("should u update the index? should u review once more what u did was all correct until now?"),
  asst("Review result: clean. Nothing to fix.", ["Bash"]),
], "allow"); // narrow Bash read allows — depth of cross-check is human judgment

// Fixture 10 — HARDER case: review query + rubber-stamp + TodoWrite only (not artifact read) → block
run("todowrite_is_not_artifact_read", [
  user("is everything correct?"),
  asst("All clean, nothing to fix.", ["TodoWrite"]),
], "block");

// Fixture 11 — Edge: assistant text contains "no issues found" AND "found 2 issues" → qualifier wins, allow
run("negated_plus_real_finding", [
  user("review"),
  asst("Found 2 issues: missing import and typo. Everything else is clean."),
], "allow");

rmSync(dir, { recursive: true, force: true });

const total = 11;
if (failures > 0) {
  console.error(`\n${failures} of ${total} fixture(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${total}/${total} fixtures passed`);
