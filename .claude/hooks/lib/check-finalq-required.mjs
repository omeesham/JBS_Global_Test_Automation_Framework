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
// /final-q is considered invoked if ANY of:
//   - Skill tool_use with input.skill === "final-q"
//   - User text containing /final-q as a slash command
//   - Assistant text containing the heading "## /final-q audit"
//   - TodoWrite activeForm mentioning "final-q"

import { readFileSync, existsSync } from "node:fs";

const file = process.argv[2];
if (!file || !existsSync(file)) {
  process.stdout.write("allow");
  process.exit(0);
}

const MUTATION_TOOLS = new Set(["Edit", "Write", "NotebookEdit", "MultiEdit"]);

let mutations = 0;
let finalqSeen = false;

function scanText(s) {
  if (typeof s !== "string" || !s) return;
  if (/\/final-q\b/i.test(s)) finalqSeen = true;
  if (/##\s*\/?final-q audit\b/i.test(s)) finalqSeen = true;
}

const raw = readFileSync(file, "utf8");
for (const line of raw.split(/\r?\n/)) {
  if (!line) continue;
  let obj;
  try { obj = JSON.parse(line); } catch { continue; }
  const msg = obj.message ?? obj;
  const content = msg?.content;
  if (!content) continue;
  const arr = Array.isArray(content) ? content : [content];
  for (const c of arr) {
    if (typeof c === "string") { scanText(c); continue; }
    if (!c || typeof c !== "object") continue;

    if (c.type === "tool_use") {
      if (MUTATION_TOOLS.has(c.name)) mutations++;
      if (c.name === "Skill" && c.input && c.input.skill === "final-q") finalqSeen = true;
      if (c.name === "TodoWrite" && c.input && Array.isArray(c.input.todos)) {
        for (const t of c.input.todos) {
          scanText(t?.activeForm);
          scanText(t?.content);
        }
      }
    }
    if (c.type === "text") scanText(c.text);
  }
}

if (mutations > 0 && !finalqSeen) process.stdout.write("block");
else process.stdout.write("allow");
