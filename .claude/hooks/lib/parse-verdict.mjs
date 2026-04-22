#!/usr/bin/env node
// parse-verdict.mjs — extract /final-q verdict from a Claude transcript file.
// Handles both JSONL transcripts (Claude Code stores these in ~/.claude/projects/*)
// and plain-text fixtures (test/fixtures/chain/transcript-*.txt).
//
// Contract:
//   argv[2] = path to transcript file
//   stdout   = GREEN | YELLOW | RED | NONE   (no trailing newline)
//
// Rules (D23 in PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md):
//   - Find the LAST "## /final-q audit" heading in the transcript text.
//   - Within the next ~3000 chars after that heading, match a tolerant Verdict pattern.
//     Accepted formats: `**Verdict**: GREEN`, `**Verdict: GREEN**`, `Verdict: GREEN`,
//     with flexible asterisks/whitespace. Case-insensitive on the label.
//   - If no audit heading OR no verdict → NONE.

import { readFileSync, existsSync } from "node:fs";

const file = process.argv[2];
if (!file || !existsSync(file)) {
  process.stdout.write("NONE");
  process.exit(0);
}

// Transcript flush is async — Stop hook may fire before the final assistant message
// reaches disk. Retry up to 5× (2s apart, ~10s total) before giving up.
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function extractText(raw) {
  // Heuristic: JSONL starts with '{'. Plain text fixtures start with anything else.
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("{")) return raw;

  let text = "";
  for (const line of raw.split(/\r?\n/)) {
    if (!line) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    const msg = obj.message ?? obj;
    const content = msg?.content;
    if (typeof content === "string") {
      text += content + "\n";
    } else if (Array.isArray(content)) {
      for (const c of content) {
        if (typeof c === "string") text += c + "\n";
        else if (c && typeof c === "object" && c.type === "text" && typeof c.text === "string") {
          text += c.text + "\n";
        }
      }
    }
  }
  return text;
}

let text = "";
let attempt = 0;
while (attempt < 5) {
  const raw = readFileSync(file, "utf8");
  text = extractText(raw);
  if (/final-q/i.test(text) && /Verdict[\s\S]{0,80}(GREEN|YELLOW|RED)/i.test(text)) break;
  attempt++;
  if (attempt < 5) sleepSync(2000);
}

// Guard: /final-q must have been invoked at least once in this transcript
// (as a heading, skill tool_use, or TodoWrite activeForm mentioning it).
// Otherwise a casual prose mention of a verdict elsewhere must not count.
if (!/final-q/i.test(text)) {
  process.stdout.write("NONE");
  process.exit(0);
}

// Prefer anchored search: LAST "## /final-q audit" heading + next 3000 chars.
const auditRe = /(^|\n)[#\s]*\/?final-q audit\b/gi;
let lastAuditIdx = -1;
let m;
while ((m = auditRe.exec(text)) !== null) {
  lastAuditIdx = m.index + m[1].length;
}

// Tolerant Verdict pattern — accepts:
//   **Verdict**: GREEN        (bold label + colon outside)
//   **Verdict: GREEN**        (bold spans the whole phrase)
//   Verdict: GREEN            (plain)
//   **Verdict**: **GREEN**    (each side bolded)
const verdictRe = /\*{0,2}\s*Verdict\s*\*{0,2}\s*:\s*\*{0,2}\s*\b(GREEN|YELLOW|RED)\b/gi;

let verdict = null;

if (lastAuditIdx >= 0) {
  const window = text.slice(lastAuditIdx, lastAuditIdx + 3000);
  const vm = window.match(verdictRe);
  if (vm) verdict = vm[0].match(/GREEN|YELLOW|RED/i)?.[0];
}

// Fallback: if no audit heading present but /final-q was invoked (skill tool_use or
// TodoWrite activeForm "Running final-q audit"), take the LAST Verdict mention in the
// full transcript. Covers sessions where the model summarizes the verdict in prose
// instead of emitting the exact "## /final-q audit" heading.
if (!verdict) {
  let lastMatch = null;
  verdictRe.lastIndex = 0;
  while ((m = verdictRe.exec(text)) !== null) lastMatch = m;
  if (lastMatch) verdict = lastMatch[0].match(/GREEN|YELLOW|RED/i)?.[0];
}

process.stdout.write(verdict ? verdict.toUpperCase() : "NONE");
