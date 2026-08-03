#!/usr/bin/env node
// parse-verdict.test.mjs — extracted self-test suite for parse-verdict.mjs.
//
// Run: node .claude/hooks/lib/parse-verdict.test.mjs
// Exit 1 on any fixture failure.
//
// Covers:
//   - parseCrossCheckRow (v1 + v2 formats)
//   - --record-outcome (GREEN, RED, idempotency, V3.1 hash, P5.5 assumptions)
//   - --prep-spawn (first, enforce-dup, soft-dup)
//   - --owns-subplan (genuine, cross-subplan, foreign, mangled, tool_result-first, missing)
//
// Extracted from parse-verdict.mjs --self-test (P2-LOT03-06).

import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

import {
  parseCrossCheckRow,
  transcriptOwnsSubplan,
} from "./parse-verdict.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PARSE_VERDICT = join(__dirname, "parse-verdict.mjs");

// Helpers that mirror parse-verdict.mjs internals — used only for fixture setup and result checks.
function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
function writeJsonFixture(path, obj) {
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

const failures = [];
let total = 0;

function assert(condition, label) {
  total++;
  if (!condition) failures.push(label);
}

// ---------------------------------------------------------------------------
// parseCrossCheckRow — v1 + v2 formats
// ---------------------------------------------------------------------------

const v1Fixture  = "Cross-check: file count claim → git diff --stat read → match → done";
const v2Mismatch = "Cross-check: scope-pushed to Track G → ran 'grep -E \"X|Y\" plans/pending/SP-21*.md' → output: '0 hits' → mismatch → screwed";
const v2Ok       = "Cross-check: 30 skills in INDEX → ran 'grep -c \"^|\" .claude/skills/INDEX.md' → output: '30' → match → done";

const v1  = parseCrossCheckRow(v1Fixture);
const v2m = parseCrossCheckRow(v2Mismatch);
const v2o = parseCrossCheckRow(v2Ok);

assert(v1 && v1.result === "match" && v1.tag === "done" && !v1.isV2,    "v1 fixture: result=match tag=done isV2=false");
assert(v2m && v2m.result === "mismatch" && v2m.tag === "screwed" && v2m.isV2, "v2 mismatch fixture: result=mismatch tag=screwed isV2=true");
assert(v2o && v2o.result === "match" && v2o.tag === "done" && v2o.isV2, "v2 ok fixture: result=match tag=done isV2=true");

// ---------------------------------------------------------------------------
// SP-CCE-05 modes — ephemeral chain.json fixture
// ---------------------------------------------------------------------------

const tmpRoot = join(tmpdir(), `parse-verdict-test-${randomBytes(4).toString("hex")}`);
mkdirSync(tmpRoot, { recursive: true });

try {
  const fakeChain = join(tmpRoot, "chain.json");
  writeJsonFixture(fakeChain, {
    status: "running", currentIndex: 0, branch: "main",
    queue: [{ file: "SP-A.md" }, { file: "SP-B.md" }],
    budget: { executedToday: 0, executedThisWeek: 0, executedThisBatch: 0 },
    history: [],
  });

  // record-outcome GREEN
  const greenOut = execFileSync(process.execPath, [PARSE_VERDICT, "--record-outcome", fakeChain, "0", "GREEN", "SP-A.md"], { encoding: "utf8" });
  assert(greenOut === "advance", `record-outcome GREEN: expected 'advance' got '${greenOut}'`);
  let s = readJson(fakeChain);
  assert(s.queue[0].status === "completed", `record-outcome GREEN: queue[0].status = '${s.queue[0].status}'`);
  assert(s.history.length === 1, `record-outcome GREEN: history.length = ${s.history.length}`);

  // prep-spawn first call (enforce default)
  const firstOut = execFileSync(process.execPath, [PARSE_VERDICT, "--prep-spawn", fakeChain, "1", "SP-B.md"], { encoding: "utf8" });
  assert(firstOut === "first", `prep-spawn first: expected 'first' got '${firstOut}'`);
  s = readJson(fakeChain);
  assert(s.budget.executedToday === 1, `prep-spawn first: executedToday = ${s.budget.executedToday}`);
  assert(s.queue[1].status === "running", `prep-spawn first: queue[1].status = '${s.queue[1].status}'`);

  // prep-spawn duplicate (enforce) — must NOT increment
  const dupOut = execFileSync(process.execPath, [PARSE_VERDICT, "--prep-spawn", fakeChain, "1", "SP-B.md"], { encoding: "utf8" });
  assert(dupOut === "duplicate", `prep-spawn enforce dup: expected 'duplicate' got '${dupOut}'`);
  s = readJson(fakeChain);
  assert(s.budget.executedToday === 1, `prep-spawn enforce dup: executedToday should stay 1, got ${s.budget.executedToday}`);

  // prep-spawn duplicate (soft) — DOES increment, logs warning
  const softOut = execFileSync(process.execPath, [PARSE_VERDICT, "--prep-spawn", fakeChain, "1", "SP-B.md", "--soft"], { encoding: "utf8" });
  assert(softOut === "soft-skip", `prep-spawn soft dup: expected 'soft-skip' got '${softOut}'`);
  s = readJson(fakeChain);
  assert(s.budget.executedToday === 2, `prep-spawn soft dup: executedToday should be 2, got ${s.budget.executedToday}`);
  const softLog = join(tmpRoot, "chain-sessions", "idempotency-soft-log.txt");
  assert(existsSync(softLog), `prep-spawn soft dup: missing soft-log at ${softLog}`);

  // record-outcome idempotency: re-record on already-completed slot must NOT grow history
  const histLenBefore = readJson(fakeChain).history.length;
  const greenDupOut = execFileSync(process.execPath, [PARSE_VERDICT, "--record-outcome", fakeChain, "0", "GREEN", "SP-A.md"], { encoding: "utf8" });
  assert(greenDupOut === "advance", `record-outcome dup: expected 'advance' got '${greenDupOut}'`);
  assert(readJson(fakeChain).history.length === histLenBefore, `record-outcome dup: history grew unexpectedly`);

  // record-outcome RED
  writeJsonFixture(fakeChain, { ...readJson(fakeChain), status: "running" });
  const redOut = execFileSync(process.execPath, [PARSE_VERDICT, "--record-outcome", fakeChain, "1", "RED", "SP-B.md"], { encoding: "utf8" });
  assert(redOut === "pause", `record-outcome RED: expected 'pause' got '${redOut}'`);
  s = readJson(fakeChain);
  assert(s.status === "paused", `record-outcome RED: chain.status = '${s.status}'`);

  // ---------------------------------------------------------------------------
  // V3.1 transcript-hash post-advance double-fire scenario
  // ---------------------------------------------------------------------------

  const v3FakeChain = join(tmpRoot, "chain-v31.json");
  const v3Transcript = join(tmpRoot, "transcript-A.jsonl");
  writeJsonFixture(v3FakeChain, {
    status: "running", currentIndex: 0, branch: "main",
    queue: [{ file: "SP-A.md" }, { file: "SP-B.md", status: "running", startedAt: new Date().toISOString() }],
    budget: { executedToday: 0, executedThisWeek: 0, executedThisBatch: 0 },
    history: [],
  });
  writeFileSync(v3Transcript, '{"message":{"content":"## /final-q audit\\n**Verdict**: GREEN"}}\n', "utf8");

  const v3FirstOut = execFileSync(process.execPath, [PARSE_VERDICT, "--record-outcome", v3FakeChain, "0", "GREEN", "SP-A.md", v3Transcript], { encoding: "utf8" });
  assert(v3FirstOut === "advance", `V3.1 first call: expected 'advance' got '${v3FirstOut}'`);
  let v3State = readJson(v3FakeChain);
  assert(Boolean(v3State.queue[0].endedAtTranscriptHash), "V3.1 first call: endedAtTranscriptHash not set");
  const v3HashCaptured = v3State.queue[0].endedAtTranscriptHash;

  const v3DupOut = execFileSync(process.execPath, [PARSE_VERDICT, "--record-outcome", v3FakeChain, "1", "GREEN", "SP-B.md", v3Transcript], { encoding: "utf8" });
  assert(v3DupOut === "duplicate", `V3.1 post-advance dup: expected 'duplicate' got '${v3DupOut}'`);
  v3State = readJson(v3FakeChain);
  assert(!v3State.queue[1].verdict, `V3.1 post-advance dup: queue[1].verdict mutated to '${v3State.queue[1].verdict}'`);
  assert(v3State.queue[1].status === "running", `V3.1 post-advance dup: queue[1].status = '${v3State.queue[1].status}'`);
  assert(v3State.history.length === 1, `V3.1 post-advance dup: history.length = ${v3State.history.length}`);
  assert(v3State.queue[0].endedAtTranscriptHash === v3HashCaptured, "V3.1 post-advance dup: hash changed");

  // V3.1 backward-compat: no transcript_path → no cross-slot check
  const v3NoTransChain = join(tmpRoot, "chain-v31-notrans.json");
  writeJsonFixture(v3NoTransChain, {
    status: "running", currentIndex: 0, branch: "main",
    queue: [{ file: "SP-A.md" }, { file: "SP-B.md" }],
    budget: { executedToday: 0, executedThisWeek: 0, executedThisBatch: 0 },
    history: [],
  });
  const v3NoTransOut = execFileSync(process.execPath, [PARSE_VERDICT, "--record-outcome", v3NoTransChain, "0", "GREEN", "SP-A.md"], { encoding: "utf8" });
  assert(v3NoTransOut === "advance", `V3.1 no-transcript: expected 'advance' got '${v3NoTransOut}'`);
  assert(!readJson(v3NoTransChain).queue[0].endedAtTranscriptHash, "V3.1 no-transcript: endedAtTranscriptHash should be unset");

  // ---------------------------------------------------------------------------
  // Phase 5.5 assumptions-disposition cases
  // ---------------------------------------------------------------------------

  // Case 1: v3 + GREEN + Assumptions line MISSING → assumptions-line-missing, chain paused
  const p55Chain1 = join(tmpRoot, "chain-p55-1.json");
  const p55Trans1 = join(tmpRoot, "trans-p55-1.jsonl");
  writeJsonFixture(p55Chain1, { status: "running", currentIndex: 0, branch: "main", queue: [{ file: "SP-P55-1.md" }], budget: {}, history: [] });
  writeFileSync(p55Trans1, '{"message":{"content":"## /final-q audit\\n**AuditFormat**: v3\\n**Verdict**: GREEN"}}\n', "utf8");
  const p55Out1 = execFileSync(process.execPath, [PARSE_VERDICT, "--record-outcome", p55Chain1, "0", "GREEN", "SP-P55-1.md", p55Trans1], { encoding: "utf8" });
  assert(p55Out1 === "assumptions-line-missing", `P5.5 case 1: expected 'assumptions-line-missing' got '${p55Out1}'`);
  const p55s1 = readJson(p55Chain1);
  assert(p55s1.queue[0].status === "failed", `P5.5 case 1: queue[0].status = '${p55s1.queue[0].status}'`);
  assert(p55s1.status === "paused", `P5.5 case 1: chain.status = '${p55s1.status}'`);
  assert(/assumptions-line-missing/.test(p55s1.pauseReason ?? ""), `P5.5 case 1: pauseReason '${p55s1.pauseReason}'`);

  // Case 2: v3 + GREEN + non-empty Assumptions list → advance + assumptions-list line
  const p55Chain2 = join(tmpRoot, "chain-p55-2.json");
  const p55Trans2 = join(tmpRoot, "trans-p55-2.jsonl");
  writeJsonFixture(p55Chain2, { status: "running", currentIndex: 0, branch: "main", queue: [{ file: "SP-P55-2.md" }], budget: {}, history: [] });
  writeFileSync(p55Trans2, '{"message":{"content":"## /final-q audit\\n**AuditFormat**: v3\\n**Assumptions**: assumed X; assumed Y\\n**Verdict**: GREEN"}}\n', "utf8");
  const p55Out2 = execFileSync(process.execPath, [PARSE_VERDICT, "--record-outcome", p55Chain2, "0", "GREEN", "SP-P55-2.md", p55Trans2], { encoding: "utf8" });
  const p55Lines2 = p55Out2.split(/\r?\n/);
  assert(p55Lines2[0] === "advance", `P5.5 case 2 line-0: expected 'advance' got '${p55Lines2[0]}'`);
  assert(p55Lines2[1]?.startsWith("assumptions-list:"), `P5.5 case 2 line-1: should start with 'assumptions-list:'`);
  assert(p55Lines2[1]?.includes("assumed X; assumed Y"), `P5.5 case 2: assumptions list not in output`);
  assert(readJson(p55Chain2).queue[0].status === "completed", `P5.5 case 2: queue[0].status expected 'completed'`);

  // Case 3: legacy (no AuditFormat v3) + GREEN → advance unchanged
  const p55Chain3 = join(tmpRoot, "chain-p55-3.json");
  const p55Trans3 = join(tmpRoot, "trans-p55-3.jsonl");
  writeJsonFixture(p55Chain3, { status: "running", currentIndex: 0, branch: "main", queue: [{ file: "SP-P55-3.md" }], budget: {}, history: [] });
  writeFileSync(p55Trans3, '{"message":{"content":"## /final-q audit\\n**Verdict**: GREEN"}}\n', "utf8");
  const p55Out3 = execFileSync(process.execPath, [PARSE_VERDICT, "--record-outcome", p55Chain3, "0", "GREEN", "SP-P55-3.md", p55Trans3], { encoding: "utf8" });
  assert(p55Out3 === "advance", `P5.5 case 3: expected 'advance' got '${p55Out3}'`);
  assert(readJson(p55Chain3).queue[0].status === "completed", `P5.5 case 3: queue[0].status expected 'completed'`);

  // ---------------------------------------------------------------------------
  // RC-2 session-ownership guard (--owns-subplan)
  // ---------------------------------------------------------------------------

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

  // (a) genuine owner → true; CLI → "yes"
  assert(transcriptOwnsSubplan(ownTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"), "owns-subplan: genuine owner returned false");
  const ownCli = execFileSync(process.execPath, [PARSE_VERDICT, "--owns-subplan", ownTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"], { encoding: "utf8" });
  assert(ownCli === "yes", `owns-subplan CLI genuine: expected 'yes' got '${ownCli}'`);
  // (b) same transcript, different subplan → false
  assert(!transcriptOwnsSubplan(ownTranscript, "SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md"), "owns-subplan: cross-subplan should be false");
  // (c) foreign interactive session → false; CLI → "no"
  assert(!transcriptOwnsSubplan(foreignTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"), "owns-subplan: foreign interactive should be false");
  const foreignCli = execFileSync(process.execPath, [PARSE_VERDICT, "--owns-subplan", foreignTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"], { encoding: "utf8" });
  assert(foreignCli === "no", `owns-subplan CLI foreign: expected 'no' got '${foreignCli}'`);
  // (d) MSYS-mangled launch prompt → false
  assert(!transcriptOwnsSubplan(mangledTranscript, "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"), "owns-subplan: mangled prompt should be false");
  // (e) first user turn is tool_result → skip to real driving prompt
  assert(transcriptOwnsSubplan(toolResultFirstTranscript, "SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md"), "owns-subplan: tool_result-first should match driving prompt");
  // (f) missing transcript → false
  assert(!transcriptOwnsSubplan(join(tmpRoot, "does-not-exist.jsonl"), "SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md"), "owns-subplan: missing transcript should be false");

} catch (e) {
  failures.push(`test suite crashed: ${e.message}\n${e.stack}`);
} finally {
  try { rmSync(tmpRoot, { recursive: true, force: true }); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`FAILED — ${failures.length} of ${total} tests failed:`);
  for (const f of failures) console.error(`  FAIL  ${f}`);
  process.exit(1);
}
console.log(`ALL PASS — ${total} tests.`);
