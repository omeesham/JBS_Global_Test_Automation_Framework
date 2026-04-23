#!/usr/bin/env node
// check-rubberstamp.mjs — returns "block" if the assistant emits a rubber-stamp
// completion phrase ("nothing to fix" / "all clean" / etc.) in response to a
// user review/correctness question, AND no artifact-reading tool (Read/Grep/
// Glob/Bash) was called in any assistant turn since that user question.
//
// Structural anti-rubber-stamp gate — same shape as check-finalq-required.mjs.
// Catches AUD-001 / ALL-030 failure mode: agent narrow-checks (frontmatter,
// paths) and says "nothing to fix" without cross-reading artifacts.
//
// Contract:
//   argv[2] = path to JSONL transcript
//   stdout   = "block" | "allow"   (no trailing newline; defaults "allow" on
//              any error so a broken hook never wedges the session)
//
// Design notes (edge cases accounted for — keep it simple):
//
//   • WINDOW is multi-turn: look at all assistant turns from the last user
//     review-query forward. Reads in earlier turns count as evidence even if
//     the current turn has none. Prevents false-positive when work spans
//     turns. (e.g., reads in turn N, summary in turn N+1 is fine.)
//
//   • Rubber-stamp pattern must be the LAST assistant message (the one about
//     to be sent). Earlier turns with rubber-stamp that were already
//     superseded are ignored.
//
//   • Qualifier escape: if the assistant response names concrete findings
//     ("mismatch", "issue", "missing", "broken", "failed", "wrong") OR
//     includes a bullet list of items, the response is NOT pure rubber-stamp
//     — allow. This catches "found N issues, everything else is clean"
//     legitimately.
//
//   • Bash counts as artifact read (any Bash = evidence of verification).
//     Accept that `echo hi` technically satisfies — realistic agent behavior
//     under pressure is to run genuine greps, not game the hook.
//
//   • Fail-open: any parse error → "allow". A broken gate never wedges work.
//
//   • Loop prevention: shell wrapper handles stop_hook_active=true skip.

import { readFileSync, existsSync } from "node:fs";

const file = process.argv[2];
if (!file || !existsSync(file)) {
  process.stdout.write("allow");
  process.exit(0);
}

const ARTIFACT_READ_TOOLS = new Set(["Read", "Grep", "Glob", "Bash"]);

// Phrases that signal unqualified "done / clean / correct" claims.
const RUBBER_STAMP_PATTERNS = [
  /\bnothing to (fix|update|change|do|add)\b/i,
  /\bnothing wrong\b/i,
  /\ball (clean|correct|good|sorted|set|fine)\b/i,
  /\beverything (is )?(clean|correct|good|fine|ok|okay)\b/i,
  /\beverything (looks |checks )?(good|out|fine)\b/i,
  /\bno (issues|problems|errors|mistakes|concerns|changes|fixes) (found|needed|present|required)?\b/i,
  /\blooks (all )?(good|fine|ok|clean)\b/i,
  /\bwe['’]?re (golden|clear|good)\b/i,
  /\bno complaints\b/i,
  /\bship it\b/i,
  /\bconfirmed clean\b/i,
  /\breview (result|verdict):?\s*clean\b/i,
  /\bclean\.?\s*✓/i,
];

// Phrases in user messages that signal a review / correctness / completeness query.
const REVIEW_QUERY_PATTERNS = [
  /\breview\b/i,
  /\bis (this|it|that|everything) (correct|right|good|ok|okay|fine|clean|proper|accurate)\b/i,
  /\bis (this|that) all\b/i,
  /\bdid (you|u) (do it|get it) (correctly|right|properly|all)\b/i,
  /\beverything (correct|right|good|ok|okay|in order|check out)\b/i,
  /\bdouble[- ]?check\b/i,
  /\bverify\b/i,
  /\bmake sure (it|this|that|everything|all|whatever)\b/i,
  /\bare (you|u|we) sure\b/i,
  /\bcheck (if|whether|that) /i,
  /\bany (issues|problems|mistakes|errors|gaps|holes|concerns|bugs)\b/i,
  /\b(am i|are we|was i|did i) wrong\b/i,
  /\banything (missing|off|wrong|broken|i missed|i should (know|worry))\b/i,
  /\bsanity[- ]?check\b/i,
  /\bthoroughly (review|check|audit)\b/i,
  /\bdid (you|u) (really|actually|truly) /i,
];

// Phrases in the assistant response that signal the response CONTAINS actual
// findings (not a pure rubber-stamp). Must be specific enough to not match
// negated forms like "no issues found" / "nothing broken" / "not wrong" —
// those ARE rubber-stamps and must block.
const QUALIFIER_PATTERNS = [
  // numeric count of findings ("3 issues", "2 mismatches")
  /\b\d+\s+(issue|mismatch|finding|bug|problem|gap|error)s?\b/i,
  // singular count ("one issue", "a gap")
  /\b(one|two|three|four|five|a|an)\s+(issue|mismatch|finding|bug|problem|gap|error)\b/i,
  // colon-prefixed header of findings ("Issues:", "Findings:")
  /\b(issue|mismatch|finding|bug|problem|gap|error)s?:/i,
  // explicit mismatch verb
  /\bmismatch(es|ed)?\b/i,
  // contrast / exception markers (require following context to avoid "however" in quotes)
  /\bexcept (for|that) /i,
  /\bhowever,/i,
  /\bbut\s+(one|two|three|i|there|this|that|here|a|an)\s/i,
  // action verbs that describe required fixes
  /\bneeds? to be (fixed|updated|changed|addressed|corrected|revised)\b/i,
  /\bshould be (fixed|updated|addressed|corrected|revised)\b/i,
  // explicit status tags from /final-q
  /\bscrewed\b/i,
  /\bpartial(ly)?\b/i,
  /\bdeferred\b/i,
  // "I was wrong" / "you're right" style concession
  /\b(i was|you are|you're|i'?m) (wrong|right about)\b/i,
];

function textOf(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  let out = "";
  for (const c of content) {
    if (typeof c === "string") { out += c + "\n"; continue; }
    if (c && c.type === "text" && typeof c.text === "string") out += c.text + "\n";
  }
  return out;
}

function toolNamesOf(content) {
  if (!Array.isArray(content)) return [];
  const out = [];
  for (const c of content) {
    if (c && c.type === "tool_use" && c.name) out.push(c.name);
  }
  return out;
}

function matchesAny(text, patterns) {
  if (!text) return false;
  for (const re of patterns) if (re.test(text)) return true;
  return false;
}

let messages;
try {
  const raw = readFileSync(file, "utf8");
  messages = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    const msg = obj.message ?? obj;
    if (!msg || !msg.role) continue;
    messages.push(msg);
  }
} catch {
  process.stdout.write("allow");
  process.exit(0);
}

if (messages.length === 0) { process.stdout.write("allow"); process.exit(0); }

// 1. Last assistant message.
let lastAsstIdx = -1;
for (let i = messages.length - 1; i >= 0; i--) {
  if (messages[i].role === "assistant") { lastAsstIdx = i; break; }
}
if (lastAsstIdx === -1) { process.stdout.write("allow"); process.exit(0); }

const asstText = textOf(messages[lastAsstIdx].content);

// 2. Rubber-stamp phrase in last assistant?
if (!matchesAny(asstText, RUBBER_STAMP_PATTERNS)) {
  process.stdout.write("allow");
  process.exit(0);
}

// 3. Qualifier present? Not pure rubber-stamp — allow.
if (matchesAny(asstText, QUALIFIER_PATTERNS)) {
  process.stdout.write("allow");
  process.exit(0);
}

// 4. Find last user message with review-query phrase, scanning back from the
//    assistant message. Only look at user messages BEFORE this assistant turn.
let reviewQueryIdx = -1;
for (let i = lastAsstIdx - 1; i >= 0; i--) {
  if (messages[i].role !== "user") continue;
  const t = textOf(messages[i].content);
  if (matchesAny(t, REVIEW_QUERY_PATTERNS)) { reviewQueryIdx = i; break; }
}
if (reviewQueryIdx === -1) {
  // No review query → rubber-stamp phrase is in some other context (e.g.,
  // summarizing the user's own statement). Allow.
  process.stdout.write("allow");
  process.exit(0);
}

// 5. Any artifact-read tool_use in any assistant turn from reviewQueryIdx
//    forward (inclusive of current turn)?
let hasRead = false;
for (let i = reviewQueryIdx + 1; i <= lastAsstIdx; i++) {
  if (messages[i].role !== "assistant") continue;
  const tools = toolNamesOf(messages[i].content);
  if (tools.some((t) => ARTIFACT_READ_TOOLS.has(t))) { hasRead = true; break; }
}

if (hasRead) {
  process.stdout.write("allow");
  process.exit(0);
}

// All gates tripped → BLOCK.
process.stdout.write("block");
process.exit(0);
