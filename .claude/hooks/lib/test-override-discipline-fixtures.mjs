#!/usr/bin/env node
// test-override-discipline-fixtures.mjs — fixture tests for check-override-discipline.mjs.
// Run: node .claude/hooks/lib/test-override-discipline-fixtures.mjs

import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

const dir = mkdtempSync(join(tmpdir(), "override-"));
const checker = new URL("./check-override-discipline.mjs", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

let failures = 0;

function asst(text) {
  return JSON.stringify({ message: { role: "assistant", content: [{ type: "text", text }] } });
}
function user(text) {
  return JSON.stringify({ message: { role: "user", content: [{ type: "text", text }] } });
}

function run(name, fixture, expect) {
  const path = join(dir, `${name}.jsonl`);
  writeFileSync(path, fixture.join("\n"));
  let out;
  try {
    out = execSync(`node "${checker}" "${path}"`, { encoding: "utf8" }).trim();
  } catch (e) {
    out = `ERROR(${e.message})`;
  }
  let actual = "unknown";
  if (out === "allow") actual = "allow";
  else if (out.includes('"decision"') && out.includes('"block"')) actual = "block";
  else actual = out;
  const ok = actual === expect;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  expect=${expect}  got=${actual}`);
  if (!ok) failures++;
}

// 1. CLEAN — full handshake + complete log → allow
run("clean_handshake", [
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/foo.mjs — reason: one-shot infra fix."),
  user("override approved"),
  asst("[OVERRIDE] HUNTER wrote to scripts/foo.mjs — reason: one-shot infra fix — authorized by: override approved"),
], "allow");

// 2. NO-REQUEST — [OVERRIDE] without [OVERRIDE-REQUEST] preceding → block
run("no_request", [
  user("just do it"),
  asst("[OVERRIDE] HUNTER wrote to scripts/foo.mjs — reason: user asked"),
], "block");

// 3. NO-USER-AUTH — request present but no user authorization → block
run("no_user_auth", [
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/foo.mjs — reason: one-shot infra."),
  asst("[OVERRIDE] HUNTER wrote to scripts/foo.mjs — reason: one-shot infra — authorized by: nobody"),
], "block");

// 4. MISSING-IDENTITY — log lacks identity → block
run("missing_identity", [
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/foo.mjs — reason: one-shot."),
  user("override approved"),
  asst("[OVERRIDE] wrote to scripts/foo.mjs — reason: one-shot"),
], "block");

// 5. MISSING-REASON — log lacks reason → block
run("missing_reason", [
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/foo.mjs — reason: one-shot."),
  user("override approved"),
  asst("[OVERRIDE] HUNTER wrote to scripts/foo.mjs — authorized by: override approved"),
], "block");

// 6. MULTIPLE-NO-BATCH — 2 overrides, no batch approval → block
run("multiple_no_batch", [
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/a.mjs — reason: r1."),
  user("override approved"),
  asst("[OVERRIDE] HUNTER wrote to scripts/a.mjs — reason: r1 — authorized by: override approved"),
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/b.mjs — reason: r2."),
  user("override approved"),
  asst("[OVERRIDE] HUNTER wrote to scripts/b.mjs — reason: r2 — authorized by: override approved"),
], "block");

// 7. MULTIPLE-WITH-BATCH — 2 overrides with batch tag → allow
run("multiple_with_batch", [
  user("[OVERRIDE-EXPLICIT-APPROVAL-BATCH] I approve all overrides for this session."),
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/a.mjs — reason: r1."),
  user("override approved"),
  asst("[OVERRIDE] HUNTER wrote to scripts/a.mjs — reason: r1 — authorized by: override approved"),
  asst("[OVERRIDE-REQUEST] HUNTER writing to scripts/b.mjs — reason: r2."),
  user("override approved"),
  asst("[OVERRIDE] HUNTER wrote to scripts/b.mjs — reason: r2 — authorized by: override approved"),
], "allow");

// 8. EMPTY — empty transcript → allow
run("empty_transcript", [], "allow");

// 9. ZERO-OVERRIDES — normal session with no override usage → allow
run("zero_overrides", [
  user("hello"),
  asst("hi there"),
  user("edit foo"),
  asst("Done."),
], "allow");

// 10. PROSE-MENTION — agent writing about [OVERRIDE] in backticks or
// mid-sentence design discussion must NOT trigger the hook. Regression guard
// for the self-reference case caught on 2026-04-23 (/final-q on this very work).
run("prose_mention_backticks", [
  user("design override discipline"),
  asst("Q2. Override discipline when `[OVERRIDE]` is used (Component B): should we block?"),
], "allow");

// 11. PROSE-MENTION-MID-SENTENCE — no backticks but mid-sentence → allow
run("prose_mention_mid_sentence", [
  user("explain"),
  asst("The [OVERRIDE] tag is emitted after a write. It must be preceded by request."),
], "allow");

console.log("");
if (failures > 0) {
  console.error(`FAILED — ${failures} fixture(s) did not match expected decision.`);
  process.exit(1);
}
console.log("ALL PASS — 11 fixtures.");
