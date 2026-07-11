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
  process.stdout.write(isGreen ? "advance" : "pause");
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

// --self-test mode (argv[2] === "--self-test"): validates the regex against v1 + v2 fixtures.
// Run via: node parse-verdict.mjs --self-test
if (process.argv[2] === "--self-test") {
  const v1Fixture = "Cross-check: file count claim → git diff --stat read → match → done";
  const v2MatchFixture = "Cross-check: scope-pushed to Track G → ran 'grep -E \"X|Y\" plans/pending/SP-21*.md' → output: '0 hits' → mismatch → screwed";
  const v2OkFixture = "Cross-check: 30 skills in INDEX → ran 'grep -c \"^|\" .claude/skills/INDEX.md' → output: '30' → match → done";

  const v1 = parseCrossCheckRow(v1Fixture);
  const v2m = parseCrossCheckRow(v2MatchFixture);
  const v2o = parseCrossCheckRow(v2OkFixture);

  const failures = [];
  if (!v1 || v1.result !== "match" || v1.tag !== "done" || v1.isV2) failures.push(`v1 fixture failed: ${JSON.stringify(v1)}`);
  if (!v2m || v2m.result !== "mismatch" || v2m.tag !== "screwed" || !v2m.isV2) failures.push(`v2 mismatch fixture failed: ${JSON.stringify(v2m)}`);
  if (!v2o || v2o.result !== "match" || v2o.tag !== "done" || !v2o.isV2) failures.push(`v2 match fixture failed: ${JSON.stringify(v2o)}`);

  // Self-test the new SP-CCE-05 modes against an ephemeral chain.json fixture.
  // We use a temp dir under the OS tmp area so the project's real chain state is untouched.
  try {
    const os = await import("node:os");
    const tmpRoot = join(os.tmpdir(), `parse-verdict-self-test-${randomBytes(4).toString("hex")}`);
    mkdirSync(tmpRoot, { recursive: true });
    const fakeChain = join(tmpRoot, "chain.json");
    writeJsonAtomic(fakeChain, {
      status: "running",
      currentIndex: 0,
      branch: "main",
      queue: [{ file: "SP-A.md" }, { file: "SP-B.md" }],
      budget: { executedToday: 0, executedThisWeek: 0, executedThisBatch: 0 },
      history: [],
    });

    // record-outcome GREEN
    const { execFileSync } = await import("node:child_process");
    const greenOut = execFileSync(process.execPath, [process.argv[1], "--record-outcome", fakeChain, "0", "GREEN", "SP-A.md"], { encoding: "utf8" });
    if (greenOut !== "advance") failures.push(`record-outcome GREEN expected 'advance' got '${greenOut}'`);
    let s = readJson(fakeChain);
    if (s.queue[0].status !== "completed") failures.push(`record-outcome GREEN: queue[0].status = ${s.queue[0].status}`);
    if (s.history.length !== 1) failures.push(`record-outcome GREEN: history length = ${s.history.length}`);

    // prep-spawn first call (enforce default)
    const firstOut = execFileSync(process.execPath, [process.argv[1], "--prep-spawn", fakeChain, "1", "SP-B.md"], { encoding: "utf8" });
    if (firstOut !== "first") failures.push(`prep-spawn first expected 'first' got '${firstOut}'`);
    s = readJson(fakeChain);
    if (s.budget.executedToday !== 1) failures.push(`prep-spawn first: executedToday = ${s.budget.executedToday}`);
    if (s.queue[1].status !== "running") failures.push(`prep-spawn first: queue[1].status = ${s.queue[1].status}`);

    // prep-spawn duplicate (enforce) — must NOT increment again
    const dupOut = execFileSync(process.execPath, [process.argv[1], "--prep-spawn", fakeChain, "1", "SP-B.md"], { encoding: "utf8" });
    if (dupOut !== "duplicate") failures.push(`prep-spawn enforce dup expected 'duplicate' got '${dupOut}'`);
    s = readJson(fakeChain);
    if (s.budget.executedToday !== 1) failures.push(`prep-spawn enforce dup: executedToday should stay 1, got ${s.budget.executedToday}`);

    // prep-spawn duplicate (soft) — DOES increment, logs warning
    const softOut = execFileSync(process.execPath, [process.argv[1], "--prep-spawn", fakeChain, "1", "SP-B.md", "--soft"], { encoding: "utf8" });
    if (softOut !== "soft-skip") failures.push(`prep-spawn soft dup expected 'soft-skip' got '${softOut}'`);
    s = readJson(fakeChain);
    if (s.budget.executedToday !== 2) failures.push(`prep-spawn soft dup: executedToday should be 2, got ${s.budget.executedToday}`);
    const softLog = join(tmpRoot, "chain-sessions", "idempotency-soft-log.txt");
    if (!existsSync(softLog)) failures.push(`prep-spawn soft dup: missing soft-log at ${softLog}`);

    // record-outcome idempotency: re-record on already-completed slot must NOT mutate or duplicate history
    const histLenBefore = readJson(fakeChain).history.length;
    const greenDupOut = execFileSync(process.execPath, [process.argv[1], "--record-outcome", fakeChain, "0", "GREEN", "SP-A.md"], { encoding: "utf8" });
    if (greenDupOut !== "advance") failures.push(`record-outcome dup expected 'advance' got '${greenDupOut}'`);
    const histLenAfter = readJson(fakeChain).history.length;
    if (histLenAfter !== histLenBefore) failures.push(`record-outcome dup: history grew ${histLenBefore}→${histLenAfter} (should stay ${histLenBefore})`);

    // record-outcome RED
    writeJsonAtomic(fakeChain, { ...readJson(fakeChain), status: "running" });
    const redOut = execFileSync(process.execPath, [process.argv[1], "--record-outcome", fakeChain, "1", "RED", "SP-B.md"], { encoding: "utf8" });
    if (redOut !== "pause") failures.push(`record-outcome RED expected 'pause' got '${redOut}'`);
    s = readJson(fakeChain);
    if (s.status !== "paused") failures.push(`record-outcome RED: status = ${s.status}`);

    // queue[1] was set to status="running" by prep-spawn earlier. Reset for fresh-RED test.
    // (above test passed because queue[1].verdict was unset, so RED could record fresh.)

    // V3.1 transcript-hash post-advance double-fire scenario (2026-04-27):
    //   1. queue[0]=A, queue[1]=B; first Stop fires for A's completion.
    //   2. record-outcome 0 GREEN A.md transcript → A marked completed; hash stored on queue[0].
    //   3. (orchestrator advances currentIndex to 1, spawns B — simulated by prep-spawn earlier.)
    //   4. Stop fires AGAIN for the same A-event (transcript-flush race / child not detached).
    //   5. record-outcome 1 GREEN B.md transcript → cross-slot hash match on queue[0] → "duplicate".
    //      WITHOUT the V3.1 guard, B would have been marked completed/GREEN before running.
    const v3FakeChain = join(tmpRoot, "chain-v31.json");
    const v3Transcript = join(tmpRoot, "transcript-A.jsonl");
    writeJsonAtomic(v3FakeChain, {
      status: "running",
      currentIndex: 0,
      branch: "main",
      queue: [{ file: "SP-A.md" }, { file: "SP-B.md", status: "running", startedAt: nowIso() }],
      budget: { executedToday: 0, executedThisWeek: 0, executedThisBatch: 0 },
      history: [],
    });
    writeFileSync(v3Transcript, '{"message":{"content":"## /final-q audit\\n**Verdict**: GREEN"}}\n', "utf8");

    const v3FirstOut = execFileSync(process.execPath, [process.argv[1], "--record-outcome", v3FakeChain, "0", "GREEN", "SP-A.md", v3Transcript], { encoding: "utf8" });
    if (v3FirstOut !== "advance") failures.push(`V3.1 first call expected 'advance' got '${v3FirstOut}'`);
    let v3State = readJson(v3FakeChain);
    if (!v3State.queue[0].endedAtTranscriptHash) failures.push(`V3.1 first call: queue[0].endedAtTranscriptHash not set`);
    const v3HashCaptured = v3State.queue[0].endedAtTranscriptHash;

    // Re-fire on advanced index (post-advance double-fire)
    const v3DupOut = execFileSync(process.execPath, [process.argv[1], "--record-outcome", v3FakeChain, "1", "GREEN", "SP-B.md", v3Transcript], { encoding: "utf8" });
    if (v3DupOut !== "duplicate") failures.push(`V3.1 post-advance dup expected 'duplicate' got '${v3DupOut}'`);
    v3State = readJson(v3FakeChain);
    if (v3State.queue[1].verdict) failures.push(`V3.1 post-advance dup: queue[1].verdict mutated to ${v3State.queue[1].verdict} (should remain unset)`);
    if (v3State.queue[1].status !== "running") failures.push(`V3.1 post-advance dup: queue[1].status = ${v3State.queue[1].status} (should remain "running")`);
    if (v3State.history.length !== 1) failures.push(`V3.1 post-advance dup: history length = ${v3State.history.length} (should remain 1)`);
    if (v3State.queue[0].endedAtTranscriptHash !== v3HashCaptured) failures.push(`V3.1 post-advance dup: queue[0].endedAtTranscriptHash changed (was ${v3HashCaptured}, now ${v3State.queue[0].endedAtTranscriptHash})`);

    // V3.1 backward-compat: omitting transcript_path keeps pre-V3.1 behavior (no cross-slot check)
    const v3NoTransChain = join(tmpRoot, "chain-v31-notrans.json");
    writeJsonAtomic(v3NoTransChain, {
      status: "running",
      currentIndex: 0,
      branch: "main",
      queue: [{ file: "SP-A.md" }, { file: "SP-B.md" }],
      budget: { executedToday: 0, executedThisWeek: 0, executedThisBatch: 0 },
      history: [],
    });
    const v3NoTransOut = execFileSync(process.execPath, [process.argv[1], "--record-outcome", v3NoTransChain, "0", "GREEN", "SP-A.md"], { encoding: "utf8" });
    if (v3NoTransOut !== "advance") failures.push(`V3.1 no-transcript expected 'advance' got '${v3NoTransOut}'`);
    const v3NoTransState = readJson(v3NoTransChain);
    if (v3NoTransState.queue[0].endedAtTranscriptHash) failures.push(`V3.1 no-transcript: endedAtTranscriptHash should be unset, got ${v3NoTransState.queue[0].endedAtTranscriptHash}`);

    // RC-2 session-ownership guard (2026-07-07): only the headless `/execute <file>`
    // session's transcript may record a verdict for that subplan. A foreign session
    // (interactive launcher, manual interrupt, or a different subplan's run) must NOT.
    const ownTranscript = join(tmpRoot, "own-NM2305.jsonl");
    writeFileSync(ownTranscript,
      '{"type":"user","message":{"role":"user","content":"/execute SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"}}\n' +
      '{"type":"assistant","message":{"content":[{"type":"text","text":"working"}]}}\n', "utf8");
    const foreignTranscript = join(tmpRoot, "foreign-interactive.jsonl");
    writeFileSync(foreignTranscript,
      '{"type":"user","message":{"role":"user","content":"whats your current context usage burn? did we fire the chain yet?"}}\n', "utf8");
    const mangledTranscript = join(tmpRoot, "mangled.jsonl");
    writeFileSync(mangledTranscript,
      '{"type":"user","message":{"role":"user","content":"C:/Program Files/Git/execute SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"}}\n', "utf8");
    const toolResultFirstTranscript = join(tmpRoot, "toolresult-first.jsonl");
    writeFileSync(toolResultFirstTranscript,
      '{"type":"user","message":{"role":"user","content":[{"type":"tool_result","content":"x"}]}}\n' +
      '{"type":"user","message":{"role":"user","content":"/execute SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md"}}\n', "utf8");

    // (a) genuine owner → true; and CLI mode prints "yes"
    if (!transcriptOwnsSubplan(ownTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md")) failures.push("owns-subplan: genuine owner returned false");
    const ownCli = execFileSync(process.execPath, [process.argv[1], "--owns-subplan", ownTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"], { encoding: "utf8" });
    if (ownCli !== "yes") failures.push(`owns-subplan CLI genuine expected 'yes' got '${ownCli}'`);
    // (b) same transcript, DIFFERENT current subplan (post-advance double-fire) → false
    if (transcriptOwnsSubplan(ownTranscript, "SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md")) failures.push("owns-subplan: cross-subplan should be false");
    // (c) foreign interactive session (the 2026-07-06 interrupt case) → false
    if (transcriptOwnsSubplan(foreignTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md")) failures.push("owns-subplan: foreign interactive should be false");
    const foreignCli = execFileSync(process.execPath, [process.argv[1], "--owns-subplan", foreignTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"], { encoding: "utf8" });
    if (foreignCli !== "no") failures.push(`owns-subplan CLI foreign expected 'no' got '${foreignCli}'`);
    // (d) MSYS-mangled launch prompt is NOT a valid /execute → false (broken launch must not record)
    if (transcriptOwnsSubplan(mangledTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md")) failures.push("owns-subplan: mangled prompt should be false");
    // (e) first user turn is a tool_result → skip to the real driving prompt (basename match, different subplan)
    if (!transcriptOwnsSubplan(toolResultFirstTranscript, "SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md")) failures.push("owns-subplan: tool_result-first should still match driving prompt");
    // (f) missing transcript → false (fail-safe, never poison)
    if (transcriptOwnsSubplan(join(tmpRoot, "does-not-exist.jsonl"), "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md")) failures.push("owns-subplan: missing transcript should be false");

    // Cleanup tmp dir
    const { rmSync } = await import("node:fs");
    rmSync(tmpRoot, { recursive: true, force: true });
  } catch (e) {
    failures.push(`SP-CCE-05 self-test crashed: ${e.message}`);
  }

  if (failures.length) {
    process.stderr.write(`parse-verdict.mjs self-test FAILED:\n  ${failures.join("\n  ")}\n`);
    process.exit(1);
  }
  process.stdout.write("OK");
  process.exit(0);
}

// Exported for the synthetic test harness.
// Input: plain text already extracted from transcript (extractText() applied by caller).
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
