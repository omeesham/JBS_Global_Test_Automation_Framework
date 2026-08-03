#!/usr/bin/env node
// parse-verdict.mjs — verdict parser + chain-orchestrator companion (SP-CCE-05 P5.5).
//
// Three modes:
//
//   1. Verdict parse (default) — extract /final-q verdict from transcript.
//        argv[2] = transcript path
//        stdout  = GREEN | YELLOW | RED | NONE
//
//   2. Self-test
//        argv[2] = "--self-test"
//        stdout  = "OK" on pass, non-zero exit + diagnostic on fail
//
//   3. --record-outcome <chain.json> <idx> <verdict> <current_file> [transcript_path]   (P5.5; transcript-hash V3.1, 2026-04-27)
//        Atomically records verdict outcome + history entry for queue[idx].
//        GREEN     → queue[idx].status="completed", verdict="GREEN", endedAt=now;
//                    history append; stdout "advance"; exit 0.
//        Y/R/NONE  → queue[idx].status="failed", verdict=<verdict>, endedAt=now;
//                    history append; state.status="paused", pauseReason=<...>;
//                    stdout "pause"; exit 0.
//        Replaces 4× cs_set + 1× cs_history_append shell calls (5 lock ops → 1).
//        Eliminates fragile shell JSON construction (cs_history_append "{\"subplan\":...").
//        V3.1 transcript-hash idempotency: if transcript_path is provided + readable,
//        SHA-256 the transcript content and store as queue[idx].endedAtTranscriptHash.
//        Before recording, scan ALL queue slots for a matching endedAtTranscriptHash;
//        on hit, this is a Stop-event re-fire AFTER currentIndex advanced (the same-
//        slot guard above does not protect this case because the new idx points at a
//        freshly-spawned "running" slot with no verdict). Output "duplicate"; no mutation.
//        Closes the post-advance double-fire scenario documented in V3.1 of
//        reports/cce-alignment/V0-V11-summary-2026-04-27.md.
//
//   4. --prep-spawn <chain.json> <new_idx> <next_file> [--enforce|--soft]  (P5.1+P5.5)
//        Idempotent guard for the spawn-time budget increment.
//        Marker path: {dirname chain.json}/chain-sessions/.spawn.{new_idx}.{next_file}.marker
//        First call:  touch marker → increment budget.{executedToday,Week,Batch} +
//                     queue[new_idx].status="running" + .startedAt=now (atomic).
//                     stdout "first". exit 0.
//        Marker exists, mode=enforce: stdout "duplicate"; exit 0; NO mutation.
//        Marker exists, mode=soft: log to chain-sessions/idempotency-soft-log.txt,
//                     proceed with mutation (one-cycle observation period).
//                     stdout "soft-skip".
//        Default mode: enforce. Override via env CHAIN_IDEMPOTENCY_MODE=soft.
//        Replaces 3× cs_inc + 2× cs_set shell calls (5 lock ops → 1).
//        Closes the double-counting bug at chain-orchestrator.sh:137-140.
//
// Rules (D23 in PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md):
//   - Find the LAST "## /final-q audit" heading in the transcript text.
//   - Within the next ~3000 chars after that heading, match a tolerant Verdict pattern.
//     Accepted formats: `**Verdict**: GREEN`, `**Verdict: GREEN**`, `Verdict: GREEN`,
//     with flexible asterisks/whitespace. Case-insensitive on the label.
//   - If no audit heading OR no verdict → NONE.
//
// Cross-check row parsing (v1 + v2, 2026-04-27 SUBPLAN_CCE_00):
//   v1 (legacy, rubber-stampable):
//     Cross-check: <claim> → <artifact read> → <match|mismatch> → <tag>
//   v2 (evidence-emission, mandated by /final-q Step 4.5 from 2026-04-27):
//     Cross-check: <claim> → ran '<cmd>' → output: '<snippet>' → <match|mismatch> → <tag>
//   Backward compat is required so historical chain-sessions-green/ logs still parse.

import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes, createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

// Cross-check regex — matches both v1 and v2 formats.
// The (?:→ ran '...' → output: '...') group is optional; v1 omits it, v2 requires it.
// Capture group 1: match | mismatch.  Capture group 2: tag (e.g. done, screwed, ignored).
export const CROSS_CHECK_RE = /Cross-check:.*?(?:→\s*ran\s*'[^']*'\s*→\s*output:\s*'[^']*')?\s*→\s*(match|mismatch)\s*→\s*(\w+)/i;

// V2-only detector — true iff the row was emitted in the post-2026-04-27 evidence-emission format.
// Used by future audit tooling to distinguish rubber-stampable v1 rows from evidence-bearing v2 rows.
export const CROSS_CHECK_V2_RE = /Cross-check:.*?→\s*ran\s*'[^']*'\s*→\s*output:\s*'[^']*'\s*→\s*(match|mismatch)\s*→\s*(\w+)/i;

export function parseCrossCheckRow(line) {
  const m = CROSS_CHECK_RE.exec(line);
  if (!m) return null;
  return {
    result: m[1].toLowerCase(),  // "match" | "mismatch"
    tag: m[2].toLowerCase(),      // "done" | "screwed" | "ignored" | etc.
    isV2: CROSS_CHECK_V2_RE.test(line),
  };
}

// ---------------------------------------------------------------------------
// Atomic state-mutation helpers shared with chain-state.mjs (P5.5)
// ---------------------------------------------------------------------------

function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJsonAtomic(path, obj) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${randomBytes(4).toString("hex")}.tmp`;
  writeFileSync(tmp, JSON.stringify(obj, null, 2) + "\n", "utf8");
  renameSync(tmp, path);
}

// Sanitize a subplan filename so it's safe in marker filenames.
// Allows alnum, dot, underscore, hyphen; replaces everything else with "_".
function safeFileToken(s) {
  return String(s ?? "").replace(/[^A-Za-z0-9._-]/g, "_");
}

function nowIso() { return new Date().toISOString(); }

// V3.1 transcript-hash idempotency helper. SHA-256 of transcript file content;
// returns null if path is empty/unreadable so the caller can fall through to the
// pre-V3.1 behavior (no cross-slot duplicate detection).
function hashTranscript(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return null;
  try {
    const buf = readFileSync(transcriptPath);
    return createHash("sha256").update(buf).digest("hex");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Phase 5.5 Assumptions-disposition helpers (PLAN_UPLINK_PROTOCOL P5.5)
// ---------------------------------------------------------------------------

// Extracts plain text from a JSONL or plain-text transcript for audit block parsing.
// Module-level counterpart to extractText() in the main execution path.
function extractTextFromTranscript(raw) {
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

// Returns text of the last "## /final-q audit" block (up to 8000 chars), or null.
function findLastAuditBlock(text) {
  const auditRe = /(^|\n)[#\s]*\/?final-q audit\b/gi;
  let lastIdx = -1, m;
  while ((m = auditRe.exec(text)) !== null) lastIdx = m.index + m[1].length;
  if (lastIdx < 0) return null;
  return text.slice(lastIdx, lastIdx + 8000);
}

// Parses AuditFormat version and Assumptions line from a /final-q audit block.
// Returns { hasV3: boolean, assumptionsLine: string|null }.
// assumptionsLine is null when the **Assumptions**: line is absent; a trimmed string
// (possibly empty) when present. "none — checked" is the canonical no-assumptions signal.
// Legacy blocks (no **AuditFormat**: v3 marker) return { hasV3: false, assumptionsLine: null }.
export function parseAuditFormatV3(block) {
  const vm = /\*\*AuditFormat\*\*\s*:\s*v(\d+)/i.exec(block);
  if (!vm || parseInt(vm[1], 10) < 3) return { hasV3: false, assumptionsLine: null };
  const am = /\*\*Assumptions\*\*\s*:\s*([^\n\r]*)/i.exec(block);
  return { hasV3: true, assumptionsLine: am ? am[1].trim() : null };
}

// ---------------------------------------------------------------------------
// RC-2 session-ownership guard (2026-07-07). The chain-orchestrator Stop hook
// fires on EVERY session's turn-end — the interactive launcher, a manual
// interrupt (Stop button / Ctrl-C), or an unrelated subplan's headless run —
// not just the headless `/execute <current_file>` session it means to grade.
// Without this guard the orchestrator reads currentIndex, parses the STOPPING
// session's (verdict-less) transcript, and stamps verdict-NONE onto the current
// subplan — poisoning the chain. Observed 2026-07-06: an interactive interrupt
// paused NM2305 22s after spawn while its headless session was still alive.
//
// A headless `claude -p "/execute X"` session's transcript ALWAYS opens with a
// user turn whose string content is exactly "/execute X". That is the unique,
// deterministic signature we match. Foreign sessions (whose first user prompt is
// anything else) → "no" → the orchestrator silently ignores their Stop.
// Fail-safe: any parse/read error → "no" (never record, never poison; a genuine
// session's transcript is readable — we just parsed it for the verdict).

function basenameOf(p) {
  return String(p ?? "").replace(/^.*[\\/]/, "").trim();
}

// First user-turn STRING prompt in a transcript (skips tool_result user turns).
function firstUserPrompt(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return null;
  const raw = readFileSync(transcriptPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if ((obj.type ?? obj.message?.role) !== "user") continue;
    const content = obj.message?.content ?? obj.content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      for (const c of content) {
        if (typeof c === "string") return c;
        if (c && typeof c === "object" && c.type === "text" && typeof c.text === "string") return c.text;
      }
    }
    // user turn carrying only tool_result blocks → not the driving prompt; keep looking.
  }
  return null;
}

// True iff the transcript is the headless `/execute <currentFile>` run.
// Exported for the self-test harness.
export function transcriptOwnsSubplan(transcriptPath, currentFile) {
  try {
    const prompt = firstUserPrompt(transcriptPath);
    if (!prompt) return false;
    const m = /^\s*\/execute\s+(.+?)\s*$/.exec(prompt);
    if (!m) return false;
    const target = basenameOf(m[1]);
    const want = basenameOf(currentFile);
    return Boolean(target) && Boolean(want) && target === want;
  } catch {
    return false;
  }
}

// --owns-subplan <transcript> <current_file>  → stdout "yes" | "no"
function modeOwnsSubplan(transcriptPath, currentFile) {
  process.stdout.write(transcriptOwnsSubplan(transcriptPath, currentFile) ? "yes" : "no");
}

// --record-outcome <chain.json> <idx> <verdict> <current_file> [transcript_path]
function modeRecordOutcome(chainPath, idxStr, verdict, currentFile, transcriptPath) {
  const idx = Number.parseInt(idxStr, 10);
  if (Number.isNaN(idx)) { process.stderr.write(`bad idx: ${idxStr}\n`); process.exit(2); }
  const state = readJson(chainPath);
  if (!state) { process.stderr.write(`chain.json missing: ${chainPath}\n`); process.exit(2); }
  state.queue ??= [];
  state.queue[idx] ??= {};
  state.history ??= [];

  // Idempotency #1 (same-slot, P5.1): if queue[idx] is already in a terminal state
  // with a verdict, a re-fire of the same Stop event must NOT re-record. Pre-fix
  // behavior was to overwrite (e.g., mark a freshly-spawned "running" entry as
  // "completed").
  const existing = state.queue[idx];
  if (existing.verdict && (existing.status === "completed" || existing.status === "failed")) {
    process.stdout.write(existing.status === "completed" ? "advance" : "pause");
    return;
  }

  // Idempotency #2 (cross-slot transcript-hash, V3.1, 2026-04-27): if a transcript
  // path is provided and its SHA-256 matches an `endedAtTranscriptHash` already
  // recorded on ANY queue slot, this is a Stop-event re-fire AFTER currentIndex
  // advanced. The same-slot guard above does not protect this case because the
  // new idx points at a freshly-spawned "running" slot with no verdict. Output
  // "duplicate" with no mutation; chain-orchestrator.sh treats "duplicate" as a
  // silent exit (no spawn, no advance).
  const hash = hashTranscript(transcriptPath);
  if (hash) {
    for (let i = 0; i < state.queue.length; i++) {
      if (i === idx) continue;
      if (state.queue[i] && state.queue[i].endedAtTranscriptHash === hash) {
        process.stdout.write("duplicate");
        return;
      }
    }
  }

  const ts = nowIso();
  const isGreen = verdict === "GREEN";

  // Phase 5.5: Assumptions-disposition check (PLAN_UPLINK_PROTOCOL P5.5).
  // Only applies to GREEN transcripts that carry the **AuditFormat**: v3 marker.
  // Legacy transcripts (no marker) are UNCHANGED — backward compat is preserved.
  // Returns: null (legacy/no-check), "missing" (v3 + Assumptions line absent),
  //          or a trimmed non-empty string (v3 + non-empty assumptions list).
  let assumptionsDisposition = null;
  if (isGreen && transcriptPath && existsSync(transcriptPath)) {
    try {
      const raw = readFileSync(transcriptPath, "utf8");
      const text = extractTextFromTranscript(raw);
      const auditBlock = findLastAuditBlock(text);
      if (auditBlock) {
        const { hasV3, assumptionsLine } = parseAuditFormatV3(auditBlock);
        if (hasV3) {
          if (assumptionsLine === null) {
            assumptionsDisposition = "missing";
          } else if (!/^none\s*[—–-]\s*checked\s*$/i.test(assumptionsLine) && assumptionsLine.trim()) {
            assumptionsDisposition = assumptionsLine.trim();
          }
        }
      }
    } catch {
      // Transcript read/parse error → skip assumptions check (fail-open, backward compat).
    }
  }

  // Contract violation: v3 + GREEN + Assumptions line missing → treat as failed.
  // The session broke the v3 output contract; mark failed and pause with a DISTINCT reason
  // so Rutvik sees "assumptions-line-missing" in the notice rather than the generic verdict-NONE.
  if (assumptionsDisposition === "missing") {
    state.queue[idx].status = "failed";
    state.queue[idx].verdict = verdict;
    state.queue[idx].endedAt = ts;
    if (hash) state.queue[idx].endedAtTranscriptHash = hash;
    state.history.push({ subplan: currentFile, verdict, endedAt: ts });
    state.status = "paused";
    state.pauseReason = `assumptions-line-missing: ${currentFile}`;
    state.updatedAt = ts;
    writeJsonAtomic(chainPath, state);
    process.stdout.write("assumptions-line-missing");
    return;
  }

  // Normal state mutation (GREEN or non-GREEN, or v3 with "none — checked"/legacy).
  state.queue[idx].status = isGreen ? "completed" : "failed";
  state.queue[idx].verdict = verdict;
  state.queue[idx].endedAt = ts;
  if (hash) state.queue[idx].endedAtTranscriptHash = hash;
  state.history.push({ subplan: currentFile, verdict, endedAt: ts });

  if (!isGreen) {
    state.status = "paused";
    state.pauseReason = `verdict-${verdict}: ${currentFile}`;
  }
  state.updatedAt = ts;
  writeJsonAtomic(chainPath, state);

  if (isGreen) {
    // v3 + GREEN + non-empty assumptions list → advance (chain not stalled) but expose the list
    // to the orchestrator via a second stdout line so it can append to ASSUMPTIONS_LOG.
    if (assumptionsDisposition) {
      process.stdout.write(`advance\nassumptions-list:${assumptionsDisposition}`);
    } else {
      process.stdout.write("advance");
    }
  } else {
    process.stdout.write("pause");
  }
}

// --prep-spawn <chain.json> <new_idx> <next_file> [--enforce|--soft]
function modePrepSpawn(chainPath, newIdxStr, nextFile, modeFlag) {
  const newIdx = Number.parseInt(newIdxStr, 10);
  if (Number.isNaN(newIdx)) { process.stderr.write(`bad new_idx: ${newIdxStr}\n`); process.exit(2); }

  const envMode = process.env.CHAIN_IDEMPOTENCY_MODE === "soft" ? "soft" : null;
  const flagMode = modeFlag === "--soft" ? "soft" : modeFlag === "--enforce" ? "enforce" : null;
  const mode = flagMode ?? envMode ?? "enforce";

  const stateDir = dirname(chainPath);
  const sessionsDir = join(stateDir, "chain-sessions");
  mkdirSync(sessionsDir, { recursive: true });
  const markerName = `.spawn.${newIdx}.${safeFileToken(nextFile)}.marker`;
  const markerPath = join(sessionsDir, markerName);

  const ts = nowIso();
  const markerExists = existsSync(markerPath);

  if (markerExists && mode === "enforce") {
    process.stdout.write("duplicate");
    return;
  }
  if (markerExists && mode === "soft") {
    appendFileSync(
      join(sessionsDir, "idempotency-soft-log.txt"),
      `${ts} would-have-skipped: idx=${newIdx} file=${nextFile}\n`,
      "utf8",
    );
  }

  // Touch marker (idempotent — overwrite ok).
  writeFileSync(markerPath, `${ts}\n`, "utf8");

  const state = readJson(chainPath);
  if (!state) { process.stderr.write(`chain.json missing: ${chainPath}\n`); process.exit(2); }
  state.budget ??= {};
  state.queue ??= [];
  state.queue[newIdx] ??= {};
  state.budget.executedToday = Number(state.budget.executedToday ?? 0) + 1;
  state.budget.executedThisWeek = Number(state.budget.executedThisWeek ?? 0) + 1;
  state.budget.executedThisBatch = Number(state.budget.executedThisBatch ?? 0) + 1;
  state.queue[newIdx].status = "running";
  state.queue[newIdx].startedAt = ts;
  state.updatedAt = ts;
  writeJsonAtomic(chainPath, state);

  process.stdout.write(markerExists ? "soft-skip" : "first");
}

// Dispatch new modes BEFORE the verdict-parse path (which expects argv[2] to be a file).
if (process.argv[2] === "--owns-subplan") {
  modeOwnsSubplan(process.argv[3], process.argv[4]);
  process.exit(0);
}
if (process.argv[2] === "--record-outcome") {
  modeRecordOutcome(process.argv[3], process.argv[4], process.argv[5], process.argv[6], process.argv[7]);
  process.exit(0);
}
if (process.argv[2] === "--prep-spawn") {
  modePrepSpawn(process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
  process.exit(0);
}

// --self-test mode removed: suite lives in parse-verdict.test.mjs (P2-LOT03-06).
// Run: node .claude/hooks/lib/parse-verdict.test.mjs
if (process.argv[2] === "--self-test") {
  process.stderr.write("--self-test removed: run `node parse-verdict.test.mjs` instead.\n");
  process.exit(1);
}

// Exported for the synthetic test harness.
// Input: plain text already extracted from transcript (extractTextFromTranscript() applied by caller).
// Returns "GREEN" | "YELLOW" | "RED" (uppercase) or null.
//
// PRIMARY: window anchored at LAST "## /final-q audit" heading, 8000 chars, tolerant pattern.
// FALLBACK (no heading or no match in window): scan forward to find LAST strict match of
//   **Verdict**: (GREEN|YELLOW|RED) — bold label required; NEVER matches bare keywords or
//   plain "Verdict: X" to prevent stale-quoted tokens from overriding the real verdict.
export function extractVerdictFromText(text) {
  // Locate the LAST "## /final-q audit" heading.
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

  // PRIMARY: window 8000 chars from last audit heading (belt-and-braces for long outputs).
  // Takes the LAST match in the window so a quoted/earlier verdict never beats the real one.
  if (lastAuditIdx >= 0) {
    const window = text.slice(lastAuditIdx, lastAuditIdx + 8000);
    const vm = window.match(verdictRe);
    if (vm) {
      const v = vm[vm.length - 1].match(/GREEN|YELLOW|RED/i)?.[0];
      if (v) return v.toUpperCase();
    }
  }

  // FALLBACK: strict pattern only — requires **Verdict**: to prevent bare quoted tokens
  // (e.g. plan body citing "GREEN") from beating the real verdict in later prose.
  const strictRe = /\*\*Verdict\*\*:\s*(GREEN|YELLOW|RED)/gi;
  let lastStrict = null;
  let sm;
  while ((sm = strictRe.exec(text)) !== null) lastStrict = sm;
  if (lastStrict) return lastStrict[1].toUpperCase();

  return null;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
const file = process.argv[2];
if (!file || !existsSync(file)) {
  process.stdout.write("NONE");
  process.exit(0);
}

// Transcript flush is async — Stop hook may fire before the final assistant message
// reaches disk. Retry up to 5× with exponential back-off (~7s total runway).
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

let text = "";
let attempt = 0;
while (attempt < 5) {
  const raw = readFileSync(file, "utf8");
  text = extractTextFromTranscript(raw);
  if (/final-q/i.test(text) && /Verdict[\s\S]{0,80}(GREEN|YELLOW|RED)/i.test(text)) break;
  sleepSync([100, 300, 900, 2700, 3000][attempt] ?? 3000);
  attempt++;
}

// Guard: /final-q must have been invoked at least once in this transcript
// (as a heading, skill tool_use, or TodoWrite/TaskList activeForm/subject mentioning it).
// Otherwise a casual prose mention of a verdict elsewhere must not count.
if (!/final-q/i.test(text)) {
  process.stdout.write("NONE");
  process.exit(0);
}

const verdict = extractVerdictFromText(text);
process.stdout.write(verdict ?? "NONE");
}
