#!/usr/bin/env node
// test-jargon-fixtures.mjs — fixtures for the LR-058 write-time jargon gate.
//
// Drives check-jargon.mjs's pure evaluate() with synthetic PreToolUse payloads
// (no stdin, no process spawn) and asserts allow/deny. Run:
//   node .claude/hooks/lib/test-jargon-fixtures.mjs
// Exits 0 on all-pass, 1 on any failure. Modeled on the --self-test convention
// in check-todo-injection.mjs.

import { evaluate, toRepoRel } from "./check-jargon.mjs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const abs = (rel) => join(REPO_ROOT, rel);

const cases = [];
const add = (name, fn) => cases.push([name, fn]);

// ── DENY: jargon written into shippable client source ────────────────────────
add("deny LR-### into clients/encore/src (absolute path)", async () => {
  const v = await evaluate({
    tool_name: "Edit",
    tool_input: { file_path: abs("clients/encore/src/pages/foo.page.ts"), old_string: "x", new_string: "// LR-999 guard" },
  });
  return v.allow === false && v.matched === "LR-999";
});
add("deny SUBPLAN_ into clients/encore/tests", async () => {
  const v = await evaluate({
    tool_name: "Write",
    tool_input: { file_path: abs("clients/encore/tests/foo.spec.ts"), content: "// see SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC" },
  });
  return v.allow === false;
});
add("deny GARDENER codename into shippable", async () => {
  const v = await evaluate({
    tool_name: "Edit",
    tool_input: { file_path: abs("clients/encore/src/pages/foo.page.ts"), old_string: "x", new_string: "// kept separate (GARDENER Phase 5)" },
  });
  return v.allow === false;
});
add("deny rca-*.md ref into shippable (gap pattern)", async () => {
  const v = await evaluate({
    tool_name: "Edit",
    tool_input: { file_path: abs("clients/encore/src/pages/foo.page.ts"), old_string: "x", new_string: "// see rca-launcher-dialog-misses-2026-06-11.md" },
  });
  return v.allow === false;
});
add("deny _internal/ path into shippable (gap pattern)", async () => {
  const v = await evaluate({
    tool_name: "Write",
    tool_input: { file_path: abs("clients/encore/tests/foo.spec.ts"), content: "// Source: _internal/field-inventories/foo.md" },
  });
  return v.allow === false;
});
add("deny doctrine-item-N into shippable (gap pattern)", async () => {
  const v = await evaluate({
    tool_name: "Edit",
    tool_input: { file_path: abs("clients/encore/tests/foo.spec.ts"), old_string: "x", new_string: "// no @fcc tag (doctrine item 3)" },
  });
  return v.allow === false;
});

// ── ALLOW: clean shippable edits ─────────────────────────────────────────────
add("allow clean plain-English shippable edit", async () => {
  const v = await evaluate({
    tool_name: "Edit",
    tool_input: { file_path: abs("clients/encore/src/data/foo.ts"), old_string: "a", new_string: "// verify-only guard, never name-anchor a restore" },
  });
  return v.allow === true;
});
add("allow @fcc + field-case-runner.ts (kept tokens) in shippable", async () => {
  const v = await evaluate({
    tool_name: "Edit",
    tool_input: { file_path: abs("clients/encore/tests/foo.spec.ts"), old_string: "a", new_string: "// no @fcc tag here; field-case-runner.ts handles the lifecycle" },
  });
  return v.allow === true;
});
add("allow scrub: jargon only in old_string, new is clean", async () => {
  const v = await evaluate({
    tool_name: "Edit",
    tool_input: { file_path: abs("clients/encore/src/foo.ts"), old_string: "// LR-057 guard", new_string: "// verify-only guard" },
  });
  return v.allow === true;
});

// ── ALLOW: jargon into NON-shippable internal paths ──────────────────────────
add("allow jargon into clients/encore/specs_planning (deny-glob)", async () => {
  const v = await evaluate({
    tool_name: "Write",
    tool_input: { file_path: abs("clients/encore/specs_planning/_internal/walk-evidence-foo.md"), content: "LR-057 SUBPLAN_X §2 doctrine item 3 GARDENER" },
  });
  return v.allow === true;
});
add("allow jargon into clients/encore/CLAUDE.md (deny-glob)", async () => {
  const v = await evaluate({
    tool_name: "Write",
    tool_input: { file_path: abs("clients/encore/CLAUDE.md"), content: "LR-057 SUBPLAN_X" },
  });
  return v.allow === true;
});
add("allow jargon into plans/ (not under clients/)", async () => {
  const v = await evaluate({
    tool_name: "Write",
    tool_input: { file_path: abs("plans/pending/PLAN_X.md"), content: "LR-057 GARDENER §2" },
  });
  return v.allow === true;
});
add("allow jargon into .claude/rules (not under clients/)", async () => {
  const v = await evaluate({
    tool_name: "Edit",
    tool_input: { file_path: abs(".claude/rules/deliverable.md"), old_string: "x", new_string: "LR-058 walk-evidence GARDENER" },
  });
  return v.allow === true;
});
add("allow jargon into pipeline/ (never ships)", async () => {
  const v = await evaluate({
    tool_name: "Write",
    tool_input: { file_path: abs("pipeline/foo.ts"), content: "SUBPLAN_X LR-057" },
  });
  return v.allow === true;
});

// ── ALLOW: binary deliverable + non-mutation + malformed ─────────────────────
add("allow xlsx binary deliverable (jargon in packed bytes)", async () => {
  const v = await evaluate({
    tool_name: "Write",
    tool_input: { file_path: abs("clients/encore/test_cases_xlsx/encore_test_cases.xlsx"), content: "LR-057 binary bytes" },
  });
  return v.allow === true;
});
add("allow non-mutation tool (Read)", async () => {
  const v = await evaluate({ tool_name: "Read", tool_input: { file_path: abs("clients/encore/src/foo.ts") } });
  return v.allow === true;
});
add("allow malformed payload (no tool_input) — fail-soft", async () => {
  const v = await evaluate({ tool_name: "Edit" });
  return v.allow === true;
});

// ── Unit: path normalization ─────────────────────────────────────────────────
add("toRepoRel strips REPO_ROOT (Windows backslash absolute)", () => {
  const p = abs("clients/encore/src/x.ts").replace(/\//g, "\\");
  return toRepoRel(p) === "clients/encore/src/x.ts";
});

let passed = 0;
let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  try {
    ok = !!(await fn());
  } catch {
    ok = false;
  }
  if (ok) {
    passed++;
    console.log(`PASS ${name}`);
  } else {
    failed++;
    console.log(`FAIL ${name}`);
  }
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
