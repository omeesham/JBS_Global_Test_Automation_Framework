#!/usr/bin/env node
// test-visibility-reconcile-fixtures.mjs — fixture suite for the invisible-dispatch detective.
//
// Drives pure exported functions from check-visibility-reconcile.mjs with synthetic
// ledger + transcript pairs. No live session, no stdin, no process spawn.
// Run: node .claude/hooks/lib/test-visibility-reconcile-fixtures.mjs
// Exits 0 on all-pass, 1 on any failure.

import {
  parseLedger,
  partitionLedger,
  extractToolCallCommands,
  runIdPattern,
  reconcile,
  decide,
  classifyOrphans,
} from "./check-visibility-reconcile.mjs";

const cases = [];
const add = (name, fn) => cases.push([name, fn]);

// Helpers
const ledgerRow = (overrides = {}) => ({
  run_id: "aaa-111",
  ts: "2026-08-14T00:00:00Z",
  ts_end: "2026-08-14T00:01:00Z",
  session_id: "sess-abc",
  ticket_id: "TICKET-X",
  work_type: "build",
  ...overrides,
});

const bashMsg = (cmd) => ({
  role: "assistant",
  content: [{ type: "tool_use", name: "Bash", input: { command: cmd } }],
});

const psMsg = (cmd) => ({
  role: "assistant",
  content: [{ type: "tool_use", name: "PowerShell", input: { command: cmd } }],
});

const textMsg = (text) => ({ role: "user", content: [{ type: "text", text }] });

// ── parseLedger ─────────────────────────────────────────────────────────────

add("parseLedger: valid lines parsed correctly", () => {
  const row = { run_id: "r1", session_id: "s1", work_type: "build" };
  const { rows, malformed } = parseLedger(JSON.stringify(row) + "\n");
  return rows.length === 1 && rows[0].run_id === "r1" && malformed === 0;
});

add("parseLedger: malformed line skipped, count incremented", () => {
  const good = JSON.stringify({ run_id: "r1", session_id: "s1" });
  const bad = "NOT-JSON{{{";
  const { rows, malformed } = parseLedger(good + "\n" + bad + "\n");
  return rows.length === 1 && malformed === 1;
});

add("parseLedger: empty text returns empty rows, zero malformed", () => {
  const { rows, malformed } = parseLedger("");
  return rows.length === 0 && malformed === 0;
});

add("parseLedger: blank lines and whitespace-only lines skipped safely", () => {
  const { rows, malformed } = parseLedger("   \n\n  \n");
  return rows.length === 0 && malformed === 0;
});

// ── partitionLedger ──────────────────────────────────────────────────────────

add("partitionLedger: matching session row goes to matched bucket", () => {
  const rows = [ledgerRow({ session_id: "sess-abc" })];
  const { matched, unattributed } = partitionLedger(rows, "sess-abc");
  return matched.length === 1 && unattributed.length === 0;
});

add("partitionLedger: different session_id goes to neither bucket (ignored)", () => {
  const rows = [ledgerRow({ session_id: "sess-other" })];
  const { matched, unattributed } = partitionLedger(rows, "sess-abc");
  return matched.length === 0 && unattributed.length === 0;
});

add("partitionLedger: empty session_id goes to unattributed bucket", () => {
  const rows = [ledgerRow({ session_id: "" })];
  const { matched, unattributed } = partitionLedger(rows, "sess-abc");
  return matched.length === 0 && unattributed.length === 1;
});

add("partitionLedger: null session_id goes to unattributed bucket", () => {
  const rows = [ledgerRow({ session_id: null })];
  const { matched, unattributed } = partitionLedger(rows, "sess-abc");
  return matched.length === 0 && unattributed.length === 1;
});

// ── extractToolCallCommands ──────────────────────────────────────────────────

add("extractToolCallCommands: Bash tool_use command extracted", () => {
  const msgs = [bashMsg("bash copilot-worker.sh --run-id abc-123")];
  const cmds = extractToolCallCommands(msgs);
  return cmds.length === 1 && cmds[0].includes("--run-id abc-123");
});

add("extractToolCallCommands: PowerShell tool_use command extracted", () => {
  const msgs = [psMsg("copilot-worker.sh --run-id ps-run-1")];
  const cmds = extractToolCallCommands(msgs);
  return cmds.length === 1 && cmds[0].includes("--run-id ps-run-1");
});

add("extractToolCallCommands: non-tool messages ignored", () => {
  const msgs = [textMsg("hello"), { role: "assistant", content: [{ type: "text", text: "ok" }] }];
  return extractToolCallCommands(msgs).length === 0;
});

// ── runIdPattern ─────────────────────────────────────────────────────────────

add("runIdPattern: matches --run-id followed by the uuid", () => {
  const pat = runIdPattern("aaa-111");
  return pat !== null && pat.test("bash copilot-worker.sh --run-id aaa-111");
});

add("runIdPattern: does NOT match bare uuid without --run-id prefix", () => {
  const pat = runIdPattern("aaa-111");
  // Prose mention of run_id (e.g. in a log echo) without the dispatch prefix must not match.
  return pat !== null && !pat.test("echo 'run was aaa-111'");
});

add("runIdPattern: returns null for empty run_id", () => {
  return runIdPattern("") === null && runIdPattern(null) === null;
});

// ── reconcile ────────────────────────────────────────────────────────────────

add("reconcile: clean session — every row has matching call → no invisible", () => {
  const rows = [ledgerRow({ run_id: "run-1", session_id: "s1" })];
  const cmds = ["bash .claude/skills/ultra-agents/copilot-worker.sh --run-id run-1 --work-type build"];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 0 && visible.length === 1;
});

add("reconcile: one detached dispatch — ledger row present, no matching tool call → alert", () => {
  const rows = [ledgerRow({ run_id: "run-ghost", session_id: "s1" })];
  const cmds = ["bash something-else.sh --run-id run-other"];
  const { invisible } = reconcile(rows, cmds);
  return invisible.length === 1 && invisible[0].run_id === "run-ghost";
});

add("reconcile: two dispatches one visible one not → exactly one invisible", () => {
  const rows = [
    ledgerRow({ run_id: "run-visible", session_id: "s1" }),
    ledgerRow({ run_id: "run-hidden", session_id: "s1", ticket_id: "T2" }),
  ];
  const cmds = ["bash .claude/skills/ultra-agents/copilot-worker.sh --run-id run-visible"];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 1 && invisible[0].run_id === "run-hidden" && visible.length === 1;
});

add("reconcile: two rows sharing ticket_id but different run_ids, both visible → no invisible", () => {
  const rows = [
    ledgerRow({ run_id: "run-a", ticket_id: "T1", session_id: "s1" }),
    ledgerRow({ run_id: "run-b", ticket_id: "T1", session_id: "s1" }),
  ];
  const cmds = [
    "bash .claude/skills/ultra-agents/copilot-worker.sh --run-id run-a --ticket T1",
    "bash .claude/skills/ultra-agents/copilot-worker.sh --run-id run-b --ticket T1",
  ];
  const { invisible } = reconcile(rows, cmds);
  return invisible.length === 0;
});

add("reconcile: one-to-one — single visible call cannot cover two ledger rows", () => {
  const rows = [
    ledgerRow({ run_id: "run-same", session_id: "s1" }),
    ledgerRow({ run_id: "run-same", session_id: "s1", ticket_id: "T2" }),
  ];
  // Same run_id in two ledger rows (pathological, but must not double-count).
  const cmds = ["bash .claude/skills/ultra-agents/copilot-worker.sh --run-id run-same"];
  const { invisible, visible } = reconcile(rows, cmds);
  // First row claims the call; second cannot reuse it.
  return visible.length === 1 && invisible.length === 1;
});

// ── decide ───────────────────────────────────────────────────────────────────

// F2: clean fixture must assert the WHOLE result is clean, not just hasAlert.
add("decide: clean session → hasAlert false, no invisible, no unattributed (F2)", () => {
  const rows = [ledgerRow({ run_id: "r1", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const messages = [bashMsg("bash .claude/skills/ultra-agents/copilot-worker.sh --run-id r1")];
  const result = decide({ sessionId: "s1", ledgerRows: rows, messages });
  return (
    result.hasAlert === false &&
    result.invisible.length === 0 &&
    result.unattributed.length === 0
  );
});

add("decide: row from different session_id → ignored, no alert", () => {
  const rows = [ledgerRow({ run_id: "r1", session_id: "sess-other" })];
  const messages = [];
  const result = decide({ sessionId: "s1", ledgerRows: rows, messages });
  return result.hasAlert === false;
});

// F1: unattributed row WITHIN session window → alert.
add("decide: unattributed row within session window → alert (F1)", () => {
  const sessionTs = "2026-08-14T00:00:00Z";
  const matchedRow = ledgerRow({ run_id: "r-matched", session_id: "s1", ts: sessionTs });
  const inWindow = ledgerRow({ run_id: "r-unattr", session_id: "", ts: "2026-08-14T00:01:00Z" });
  const messages = [bashMsg("bash copilot-worker.sh --run-id r-matched")];
  const result = decide({ sessionId: "s1", ledgerRows: [matchedRow, inWindow], messages });
  return result.hasAlert === true && result.unattributed.length === 1;
});

// F1: historical backlog (all unattributed predate session window) → no alert, summarized.
add("decide: large historical backlog predating session → no alert, summary line (F1/F3)", () => {
  const sessionTs = "2026-08-14T00:00:00Z";
  const matchedRow = ledgerRow({ run_id: "r-matched", session_id: "s1", ts: sessionTs });
  const backlog = Array.from({ length: 10 }, (_, i) =>
    ledgerRow({ run_id: `old-${i}`, session_id: "", ts: "2026-07-01T00:00:00Z" })
  );
  const messages = [bashMsg("bash .claude/skills/ultra-agents/copilot-worker.sh --run-id r-matched")];
  const result = decide({ sessionId: "s1", ledgerRows: [matchedRow, ...backlog], messages });
  return (
    result.hasAlert === false &&
    result.unattributed.length === 0 &&
    result.historicalSummary !== null &&
    result.historicalSummary.includes("10 unattributed")
  );
});

// F1 (updated for B2 fix): no matched rows + no sessionWindowStart → 24h fallback window.
// A fresh unattributed row (recent ts) falls within that window → alerts.
// An ancient row (year 2025) is outside the 24h window → treated as historical.
add("decide: no matched rows + recent unattributed → alerts via 24h fallback window (B2)", () => {
  // Use a future ts that will always be within 24h of now at test runtime.
  const futureTs = new Date(Date.now() + 60000).toISOString(); // 1 min in the future
  const rows = [ledgerRow({ run_id: "r-unattr", session_id: "", ts: futureTs })];
  const result = decide({ sessionId: "s1", ledgerRows: rows, messages: [] });
  return result.hasAlert === true && result.unattributed.length === 1;
});

add("decide: no matched rows + ancient unattributed → historical, no alert (B2)", () => {
  const rows = [ledgerRow({ run_id: "r-old", session_id: "", ts: "2025-01-01T00:00:00Z" })];
  const result = decide({ sessionId: "s1", ledgerRows: rows, messages: [] });
  return result.hasAlert === false && result.unattributed.length === 0 && result.historicalSummary !== null;
});

add("decide: malformed_ledger_lines reported in result", () => {
  const result = decide({ sessionId: "s1", ledgerRows: [], messages: [], malformedCount: 3 });
  return result.malformedCount === 3;
});

add("decide: missing transcript (empty messages) with ledger row → invisible alert", () => {
  // When transcript is missing all ledger rows for the session appear invisible.
  const rows = [ledgerRow({ run_id: "r1", session_id: "s1" })];
  const result = decide({ sessionId: "s1", ledgerRows: rows, messages: [] });
  return result.hasAlert === true && result.invisible.length === 1 && result.invisible[0].run_id === "r1";
});

// ── B1 prove-it fixtures ─────────────────────────────────────────────────────

add("B1: echo '--run-id X' does NOT reconcile (echo is executable, not wrapper)", () => {
  const rows = [ledgerRow({ run_id: "ghost-123", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["echo '--run-id ghost-123'"];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 1 && visible.length === 0;
});

add("B1: echo 'bash .../copilot-worker.sh --run-id X' does NOT reconcile (echo in exe position)", () => {
  const rows = [ledgerRow({ run_id: "ghost-456", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["echo 'bash .claude/skills/ultra-agents/copilot-worker.sh --run-id ghost-456'"];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 1 && visible.length === 0;
});

add("B1: genuine bash copilot-worker.sh invocation DOES reconcile", () => {
  const rows = [ledgerRow({ run_id: "real-789", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["bash .claude/skills/ultra-agents/copilot-worker.sh --run-id real-789 --work-type build"];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 0 && visible.length === 1;
});

// ── B2 prove-it fixtures ─────────────────────────────────────────────────────

add("B2: sessionWindowStart used as window when no matched rows — fresh unattributed alerts", () => {
  // Unattributed row timestamp is after the supplied window start → in-window → alerts.
  const rows = [ledgerRow({ run_id: "r-unattr", session_id: "", ts: "2026-08-14T01:00:00Z" })];
  const result = decide({ sessionId: "s1", ledgerRows: rows, messages: [], sessionWindowStart: "2026-08-14T00:00:00Z" });
  return result.hasAlert === true && result.unattributed.length === 1;
});

add("B2: window derived without any matched row (window from sessionWindowStart)", () => {
  // No matched rows at all — window comes from caller, not from matched ts.
  const result = decide({
    sessionId: "s1",
    ledgerRows: [ledgerRow({ session_id: "", ts: "2026-08-14T01:00:00Z" })],
    messages: [],
    sessionWindowStart: "2026-08-14T00:30:00Z",
  });
  // Row ts 01:00 >= window start 00:30 → in-window → alert.
  return result.hasAlert === true;
});

// ── V15: real dispatch shapes + non-dispatch prefixes ───────────────────────

// Shape 1 (16x in real transcript): set -o pipefail && bash … | tee …
add("V15 shape1: set -o pipefail && bash wrapper --run-id X 2>&1 | tee … DOES reconcile", () => {
  const rows = [ledgerRow({ run_id: "shape1-run", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = [
    "set -o pipefail && bash .claude/skills/ultra-agents/copilot-worker.sh --ticket T1 --run-id shape1-run 2>&1 | tee /tmp/out.txt",
  ];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 0 && visible.length === 1;
});

// Shape 2 (15x in real transcript): cd <path>\nset -o pipefail && bash … | tee …
add("V15 shape2: cd<newline>set -o pipefail && bash wrapper --run-id X 2>&1 | tee … DOES reconcile", () => {
  const rows = [ledgerRow({ run_id: "shape2-run", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = [
    "cd /c/Users/RutvikKhorasiya/projects/encore_framework\nset -o pipefail && bash .claude/skills/ultra-agents/copilot-worker.sh --ticket T2 --run-id shape2-run 2>&1 | tee /tmp/out2.txt",
  ];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 0 && visible.length === 1;
});

// Non-dispatch: cd … && node … — must NOT reconcile
add("V15 non-dispatch: cd && node … does NOT reconcile", () => {
  const rows = [ledgerRow({ run_id: "nd-run-1", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = [
    'cd "C:/Users/RutvikKhorasiya/projects/encore_framework" && node .claude/hooks/lib/check-visibility-reconcile.mjs --run-id nd-run-1',
  ];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 1 && visible.length === 0;
});

// Non-dispatch: && grep … (mentions wrapper in text but grep in exe position)
add("V15 non-dispatch: grep mentioning wrapper does NOT reconcile", () => {
  const rows = [ledgerRow({ run_id: "nd-run-2", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["rg copilot .claude/hooks --run-id nd-run-2"];
  const { invisible } = reconcile(rows, cmds);
  return invisible.length === 1;
});

// Non-dispatch: echo … — must NOT reconcile (echo in exe position, not wrapper)
add("V15 non-dispatch: echo mentioning wrapper+run-id does NOT reconcile", () => {
  const rows = [ledgerRow({ run_id: "nd-run-3", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["echo 'bash .claude/skills/ultra-agents/copilot-worker.sh --run-id nd-run-3'"];
  const { invisible } = reconcile(rows, cmds);
  return invisible.length === 1;
});

// Non-dispatch: sed … — must NOT reconcile
add("V15 non-dispatch: sed mentioning wrapper+run-id does NOT reconcile", () => {
  const rows = [ledgerRow({ run_id: "nd-run-4", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["sed -n 's/--run-id nd-run-4/x/p' file.txt"];
  const { invisible } = reconcile(rows, cmds);
  return invisible.length === 1;
});

// ── V20B: heredoc laundering fixtures ───────────────────────────────────────

add("V20B: heredoc body wrapping copilot-worker.sh does NOT reconcile (heredoc laundering)", () => {
  const rows = [ledgerRow({ run_id: "naming-rca-0813", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  // This is the attack: the wrapper invocation lives inside a heredoc body (cat <<EOF … EOF).
  // The heredoc body must be stripped before the executable-position check — only the
  // opening line "cat <<EOF" and the closing "EOF" survive, neither of which has the
  // wrapper in executable position.
  const cmds = [
    "cat <<EOF\nbash .claude/skills/ultra-agents/copilot-worker.sh --run-id naming-rca-0813\nEOF",
  ];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 1 && visible.length === 0;
});

add("V20B: genuine dispatch after heredoc stripping still reconciles (non-regression)", () => {
  const rows = [ledgerRow({ run_id: "naming-rca-0813", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  // Real dispatch shape — no heredoc — must still be visible.
  const cmds = [
    "set -o pipefail && bash .claude/skills/ultra-agents/copilot-worker.sh --run-id naming-rca-0813 2>&1 | tee /tmp/out.txt",
  ];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 0 && visible.length === 1;
});

add("V20B: echo '--run-id <id>' still does NOT reconcile (echo in exe position)", () => {
  const rows = [ledgerRow({ run_id: "naming-rca-0813", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["echo '--run-id naming-rca-0813'"];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 1 && visible.length === 0;
});

add("V20B: echo 'bash .../copilot-worker.sh --run-id <id>' still does NOT reconcile", () => {
  const rows = [ledgerRow({ run_id: "naming-rca-0813", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["echo \"bash .claude/skills/ultra-agents/copilot-worker.sh --run-id naming-rca-0813\""];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 1 && visible.length === 0;
});

add("V20B: echo 'noise; bash .../copilot-worker.sh --run-id <id>' still does NOT reconcile", () => {
  const rows = [ledgerRow({ run_id: "naming-rca-0813", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["echo 'noise; bash .claude/skills/ultra-agents/copilot-worker.sh --run-id naming-rca-0813'"];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 1 && visible.length === 0;
});

// ── V23: two-word runner wrapper detection in detective layer ────────────────

add("V23: npm exec wrapper --run-id X DOES reconcile (two-word runner in detective layer)", () => {
  const rows = [ledgerRow({ run_id: "v23-npm-exec", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = [
    "npm exec .claude/skills/ultra-agents/copilot-worker.sh -- --run-id v23-npm-exec --work-type build",
  ];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 0 && visible.length === 1;
});

add("V23: pnpm dlx wrapper --run-id X DOES reconcile (two-word runner in detective layer)", () => {
  const rows = [ledgerRow({ run_id: "v23-pnpm-dlx", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = [
    "pnpm dlx .claude/skills/ultra-agents/copilot-worker.sh --run-id v23-pnpm-dlx --work-type build",
  ];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 0 && visible.length === 1;
});

add("V23: yarn dlx non-wrapper --run-id X does NOT reconcile (non-wrapper target)", () => {
  const rows = [ledgerRow({ run_id: "v23-yarn-nw", session_id: "s1", ts: "2026-08-14T00:00:00Z" })];
  const cmds = ["yarn dlx some-other-script.sh --run-id v23-yarn-nw"];
  const { invisible, visible } = reconcile(rows, cmds);
  return invisible.length === 1 && visible.length === 0;
});

// ── V24: orphan detection (classifyOrphans) ─────────────────────────────────

add("V24: worker with ts_end in ledger → classified as orphan", () => {
  const workers = [{ pid: 12345, runId: "orphan-run-1", commandLine: "bash copilot-worker.sh --run-id orphan-run-1" }];
  const rows = [ledgerRow({ run_id: "orphan-run-1", ts_end: "2026-08-14T00:05:00Z" })];
  const { orphans, expected, untracked } = classifyOrphans(workers, rows);
  return orphans.length === 1 && orphans[0].runId === "orphan-run-1" && orphans[0].pid === 12345 && expected.length === 0;
});

add("V24: worker without ts_end in ledger → classified as expected (in-flight)", () => {
  const workers = [{ pid: 12345, runId: "live-run-1", commandLine: "bash copilot-worker.sh --run-id live-run-1" }];
  const rows = [ledgerRow({ run_id: "live-run-1", ts_end: null })];
  const { orphans, expected } = classifyOrphans(workers, rows);
  return orphans.length === 0 && expected.length === 1 && expected[0].runId === "live-run-1";
});

add("V24: worker with no ledger row → classified as untracked", () => {
  const workers = [{ pid: 99999, runId: "unknown-run", commandLine: "bash copilot-worker.sh --run-id unknown-run" }];
  const { orphans, expected, untracked } = classifyOrphans(workers, []);
  return orphans.length === 0 && expected.length === 0 && untracked.length === 1;
});

add("V24: worker with no extractable run-id → classified as untracked", () => {
  const workers = [{ pid: 11111, runId: null, commandLine: "bash copilot-worker.sh" }];
  const { untracked } = classifyOrphans(workers, []);
  return untracked.length === 1;
});

add("V24: mixed — one orphan, one expected, one untracked", () => {
  const workers = [
    { pid: 1, runId: "done-run", commandLine: "..." },
    { pid: 2, runId: "live-run", commandLine: "..." },
    { pid: 3, runId: "mystery-run", commandLine: "..." },
  ];
  const rows = [
    ledgerRow({ run_id: "done-run", ts_end: "2026-08-14T00:05:00Z" }),
    ledgerRow({ run_id: "live-run", ts_end: null }),
  ];
  const { orphans, expected, untracked } = classifyOrphans(workers, rows);
  return orphans.length === 1 && orphans[0].runId === "done-run"
    && expected.length === 1 && expected[0].runId === "live-run"
    && untracked.length === 1 && untracked[0].runId === "mystery-run";
});

add("V24: orphan reports ticketId, model, and staleSince from ledger", () => {
  const workers = [{ pid: 42, runId: "meta-run", commandLine: "..." }];
  const rows = [ledgerRow({ run_id: "meta-run", ts_end: "2026-08-14T01:00:00Z", ticket_id: "TICKET-99", model: "claude-sonnet-4.6" })];
  const { orphans } = classifyOrphans(workers, rows);
  return orphans.length === 1 && orphans[0].ticketId === "TICKET-99"
    && orphans[0].model === "claude-sonnet-4.6" && orphans[0].staleSince === "2026-08-14T01:00:00Z";
});

add("V24: empty liveWorkers → all arrays empty", () => {
  const rows = [ledgerRow({ run_id: "r1", ts_end: "2026-08-14T00:05:00Z" })];
  const { orphans, expected, untracked } = classifyOrphans([], rows);
  return orphans.length === 0 && expected.length === 0 && untracked.length === 0;
});

// ── Run suite ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
for (const [name, fn] of cases) {
  try {
    const ok = fn();
    if (ok) {
      console.log(`  ✓  ${name}`);
      passed++;
    } else {
      console.error(`  ✗  ${name} — returned falsy`);
      failed++;
    }
  } catch (e) {
    console.error(`  ✗  ${name} — threw: ${e.message}`);
    failed++;
  }
}

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
