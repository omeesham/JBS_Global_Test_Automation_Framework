#!/usr/bin/env node
// check-finalq-required.mjs — returns "block" if the transcript contains any
// file-modifying tool_use (Edit/Write/NotebookEdit/MultiEdit) AND has no
// /final-q invocation. Otherwise "allow".
//
// This is the LR-042 mechanism behind final-q-gate.sh. It replaces the old
// completion-phrase regex (too narrow — missed "SP-XXX complete.", "done.",
// "✅", etc.). Detecting WORK (mutation tool_use) is structural; detecting
// CLAIM (phrases) is fragile.
//
// Contract:
//   argv[2] = path to JSONL transcript
//   stdout   = "block" | "allow"   (no trailing newline)
//
// /final-q is considered invoked ONLY by a STRUCTURAL, unforgeable signal:
//   - Skill tool_use with input.skill === "final-q"  (programmatic invocation)
//
// Textual heading matches ("## /final-q audit" in assistant prose) were
// previously accepted as a second reset signal but were REMOVED 2026-04-23:
// any agent could emit the heading as plain text with zero underlying audit
// work and satisfy the hook, turning the gate into a rubber stamp. The
// heading alone is spoofable; only the Skill tool_use is unforgeable. If a
// legitimate invocation path ever lands that does NOT produce a Skill
// tool_use in the transcript, add a second STRUCTURAL signal (not textual).
//
// Robustness (SCOPED 2026-04-23 — LR-043 remediation):
//   - mutationsSinceLastFinalq RESETS to 0 on every structural /final-q
//     signal. Without this, any session that ran /final-q once and then
//     continued with more work would re-block at Stop without a fresh
//     /final-q.
//   - Mutations to harness plan-mode files (`~/.claude/plans/*`) are SKIPPED
//     — those are plan-mode scratch, not work artifacts.
//   - Mutations whose tool_result has is_error=true are SKIPPED — failed
//     writes aren't work either.

import { readFileSync, existsSync } from "node:fs";

const file = process.argv[2];
if (!file || !existsSync(file)) {
  process.stdout.write("allow");
  process.exit(0);
}

const MUTATION_TOOLS = new Set(["Edit", "Write", "NotebookEdit", "MultiEdit"]);
const PLAN_MODE_PATH_RX = /[\/\\]\.claude[\/\\]plans[\/\\]/i;

const raw = readFileSync(file, "utf8");
const lines = raw.split(/\r?\n/).filter(Boolean);

// First pass: build tool_use_id → is_error map from tool_result blocks.
const errorByUseId = new Map();
for (const line of lines) {
  let obj;
  try { obj = JSON.parse(line); } catch { continue; }
  const msg = obj.message ?? obj;
  const content = msg?.content;
  if (!content) continue;
  const arr = Array.isArray(content) ? content : [content];
  for (const c of arr) {
    if (c && typeof c === "object" && c.type === "tool_result" && c.tool_use_id) {
      errorByUseId.set(c.tool_use_id, c.is_error === true);
    }
  }
}

// Second pass: walk in order, resetting the counter on every /final-q signal.
let mutationsSinceLastFinalq = 0;

for (const line of lines) {
  let obj;
  try { obj = JSON.parse(line); } catch { continue; }
  const msg = obj.message ?? obj;
  const content = msg?.content;
  if (!content) continue;
  const arr = Array.isArray(content) ? content : [content];
  // Only ASSISTANT messages count for the heading-based reset signal;
  // prose in user messages (e.g., "why didn't /final-q fire?") must not
  // reset the counter.
  const role = msg?.role;
  for (const c of arr) {
    if (typeof c === "string") continue;                       // raw string bodies ignored (no structure to parse)
    if (!c || typeof c !== "object") continue;

    if (c.type === "tool_use") {
      if (MUTATION_TOOLS.has(c.name)) {
        const p = c.input?.file_path || c.input?.notebook_path || c.input?.path || "";
        if (PLAN_MODE_PATH_RX.test(p)) continue;               // harness plan-mode scratch
        if (errorByUseId.get(c.id) === true) continue;          // failed write
        mutationsSinceLastFinalq++;
      }
      if (c.name === "Skill" && c.input?.skill === "final-q") {
        mutationsSinceLastFinalq = 0;                           // structural invocation
      }
    }
    if (c.type === "text" && role === "assistant" && textHasFinalqHeading(c.text)) {
      mutationsSinceLastFinalq = 0;                             // structural heading emission
    }
  }
}

if (mutationsSinceLastFinalq > 0) process.stdout.write("block");
else process.stdout.write("allow");
