#!/usr/bin/env node
// check-visibility-reconcile.mjs — detective Stop-hook for invisible-dispatch detection.
//
// WHAT THIS CLOSES: this is the ONLY layer. A preventive PreToolUse gate was built
// alongside it and deleted on 2026-08-14 — it inspected Claude's own tool calls, so a
// dispatched worker never reached it (LR-074 §74.2). This layer reconciles at session end:
// every dispatch recorded in the ledger must correspond to a visible tool call. Matching
// is done ONE-TO-ONE by run_id (the unique UUID passed as --run-id <id> to copilot-worker.sh),
// never by substring or timestamp window (V2-ATTACK MAJOR finding).
//
// ALGORITHM:
//   1. Read session_id + transcript_path from stdin JSON.
//   2. Collect ledger rows in .claude/state/ua-worker/ledger.jsonl whose session_id matches.
//      Rows with missing/empty session_id → "unattributed" bucket (suspicious, not ignored).
//   3. From transcript tool_use blocks (Bash + PowerShell), extract all command strings.
//   4. Match by run_id: a row is "visible" if some command contains "--run-id <run_id>" AND
//      no other row has already claimed that command (one-to-one).
//   5. Unmatched rows → invisible_dispatches. Unattributed rows → reported separately.
//   6. Emit WARN to stderr + persist alert JSON + fireTelemetry. Always exit 0.
//
// EXPORTED pure functions are exercised by test-visibility-reconcile-fixtures.mjs without
// any live session or stdin.
//
// Rule refs: LR-069 (S0 detective), LR-001 (real schema, no inference), LR-003 (no swallowed
// errors), LR-020 (verify anchors).

import {
  readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, appendFileSync,
} from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { fireTelemetry } from "./hook-utils.mjs";
import { commandHasWrapperInExecutablePosition } from "./dispatch-command-parse.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const STATE_DIR = join(REPO_ROOT, ".claude", "state");
const LEDGER_PATH = join(STATE_DIR, "ua-worker", "ledger.jsonl");
const FAILURE_LOG = join(STATE_DIR, "hook-failures.log");

// ---------------------------------------------------------------------------
// Pure helpers (exported — exercised by fixture suite without live session)
// ---------------------------------------------------------------------------

/**
 * Parse a JSONL file into an array of objects. Malformed lines are logged and
 * skipped (LR-003: no swallowed errors — they are logged, never silently dropped).
 * Returns { rows: object[], malformed: number }.
 */
export function parseLedger(text) {
  const rows = [];
  let malformed = 0;
  for (const rawLine of (text || "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      rows.push(obj);
    } catch {
      malformed++;
      // Logged by caller — pure function does not perform I/O.
    }
  }
  return { rows, malformed };
}

/**
 * Partition ledger rows into three buckets for a given session_id.
 * - matched: rows whose session_id equals the target session_id
 * - unattributed: rows with a missing or empty session_id
 * - other: rows belonging to a different session (ignored)
 */
export function partitionLedger(rows, sessionId) {
  const matched = [];
  const unattributed = [];
  for (const row of rows) {
    const sid = row.session_id || "";
    if (!sid) {
      unattributed.push(row);
    } else if (sid === sessionId) {
      matched.push(row);
    }
    // other sessions: silently ignored
  }
  return { matched, unattributed };
}

/**
 * Extract all Bash and PowerShell tool_use command strings from a transcript
 * (array of message objects in Claude Code conversation format).
 */
export function extractToolCallCommands(messages) {
  const cmds = [];
  if (!Array.isArray(messages)) return cmds;
  for (const msg of messages) {
    if (!msg || msg.role !== "assistant" || !Array.isArray(msg.content)) continue;
    for (const c of msg.content) {
      if (c?.type !== "tool_use") continue;
      if (c.name !== "Bash" && c.name !== "PowerShell") continue;
      const cmd = c.input?.command || c.input?.cmd || "";
      if (typeof cmd === "string" && cmd) cmds.push(cmd);
    }
  }
  return cmds;
}

/**
 * Build a regex that matches the run_id as it appears in a dispatch command:
 *   --run-id <run_id>
 * The run_id is a UUID (alphanumeric + hyphen); we match it literally.
 * Returns null for empty/unsafe run_ids.
 */
export function runIdPattern(runId) {
  if (!runId || typeof runId !== "string") return null;
  // Escape regex metacharacters (UUIDs only contain [a-f0-9-] but be safe).
  const escaped = runId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("--run-id\\s+" + escaped + "(?:\\s|$|'|\")");
}

/**
 * Strip heredoc bodies from a command string so that wrapper invocations
 * inside a heredoc body are not visible to commandHasWrapperInExecutablePosition.
 *
 * The rule: a wrapper invocation appearing inside an execution context that
 * cannot be parsed with confidence must NEVER count as a visible dispatch. The
 * deleted preventive gate carried the mirror of this rule; it is written out
 * here so it survives that file.
 *
 * Heredoc bodies require special handling here because splitStatements() splits
 * on newlines, making each body line appear as a separate "statement" — this
 * would cause the wrapper line inside `cat <<EOF\nbash copilot-worker.sh\nEOF`
 * to falsely match as being in executable position.
 *
 * The other contexts of that kind (eval, backticks,
 * $(), subshells, xargs, bash -c, env/nice/timeout/sudo) are already safe in
 * the reconcile path because their payloads are inside shell quotes, which
 * splitStatements treats as opaque — the wrapper never ends up as the exec
 * token. Heredoc is the sole exception: its body is newline-delimited, not
 * quote-delimited, so explicit stripping is required.
 *
 * @param {string} cmd  raw tool-call command string
 * @returns {string}    command with every heredoc body removed (opening and
 *                      closing markers are retained as inert tokens)
 */
function stripHeredocBodies(cmd) {
  if (!cmd || typeof cmd !== 'string') return cmd || '';
  // Quick bail: no heredoc marker present.
  if (!/<</.test(cmd)) return cmd;

  const lines = cmd.split('\n');
  const out = [];
  // Matches:  <<[-] [optional-quote] WORD [optional-quote]
  // Captures: WORD (the terminator string, without surrounding quotes).
  const HEREDOC_OPEN = /<<-?\s*['"]?(\w+)['"]?\s*(?:$|\s)/;
  let skipUntil = null; // non-null = we are inside a heredoc body

  for (const line of lines) {
    if (skipUntil !== null) {
      // Check for the terminator on its own line (bash requires no leading whitespace
      // for unindented heredocs; <<- allows tabs but we match trim() for safety).
      if (line.trim() === skipUntil) {
        skipUntil = null;
        out.push(line); // keep the terminator line — it is not an executable statement
      }
      // Drop every body line — do not push.
      continue;
    }

    const m = HEREDOC_OPEN.exec(line);
    if (m) {
      skipUntil = m[1]; // start skipping from the next line onward
      out.push(line);   // keep the opening line (e.g. "cat <<EOF")
      continue;
    }

    out.push(line);
  }

  return out.join('\n');
}

/**
 * Reconcile ledger rows against visible tool-call commands.
 *
 * Returns:
 *   invisible: ledger rows that have no matching visible tool call
 *   unattributed: ledger rows with no session_id (cannot be attributed)
 *   visible: ledger rows that were successfully matched
 *
 * Matching is ONE-TO-ONE: once a tool-call command has been claimed by a ledger
 * row it cannot be reused to match another row. This prevents a single visible
 * call from silently covering multiple invisible dispatches.
 *
 * A tool-call command containing a run_id in a prose context (e.g. a comment or
 * echo statement) without the "--run-id" prefix does NOT count as a match.
 * Rationale: only "--run-id <id>" is the canonical dispatch marker; bare
 * occurrence of the UUID string could appear in log output or comments and must
 * not be treated as proof of a visible dispatch.
 */
export function reconcile(matchedRows, toolCallCommands) {
  // Track which command indices have been claimed (one-to-one).
  const claimed = new Set();
  const invisible = [];
  const visible = [];

  for (const row of matchedRows) {
    const runId = row.run_id || "";
    if (!runId) {
      // No run_id on a matched row — cannot verify; treat as invisible.
      invisible.push(row);
      continue;
    }
    const pat = runIdPattern(runId);
    if (!pat) {
      invisible.push(row);
      continue;
    }
    let found = false;
    for (let i = 0; i < toolCallCommands.length; i++) {
      if (claimed.has(i)) continue;
      if (pat.test(toolCallCommands[i])) {
        // B1: require the matching command to actually invoke the canonical wrapper
        // in executable/launcher position — not just mention the run-id in prose
        // (e.g. `echo '--run-id ghost-123'` or `echo "bash …copilot-worker.sh --run-id X"`).
        // commandHasWrapperInExecutablePosition splits on newlines/&&/;/| so multi-statement
        // commands (e.g. `cd <path>\nset -o pipefail && bash …copilot-worker.sh …`) match.
        // Strip heredoc bodies before the executable-position check: a wrapper
        // invocation inside a heredoc body is NOT a visible dispatch (unmodeled
        // execution context — V19 mirror rule, see stripHeredocBodies above).
        if (!commandHasWrapperInExecutablePosition(stripHeredocBodies(toolCallCommands[i]))) continue;
        claimed.add(i);
        found = true;
        break;
      }
    }
    if (found) {
      visible.push(row);
    } else {
      invisible.push(row);
    }
  }

  return { invisible, visible };
}

/**
 * Classify live worker processes as expected (in-flight) or orphaned.
 * Pure function — no I/O.
 *
 * DETECTION, NOT PREVENTION. This makes an orphan visible after the fact;
 * it does not stop one from being created. LR-074 §74.4's residual
 * (runtime-assembled launches) remains permanently invisible to both layers.
 *
 * A worker is ORPHANED if its run_id appears in the ledger with a truthy
 * ts_end (meaning the tracked call completed/stopped/errored) but the
 * process is still alive.
 *
 * A worker is EXPECTED if its run_id exists in the ledger without ts_end
 * (still in-flight).
 *
 * A worker with no ledger entry or no extractable run_id is UNTRACKED
 * (suspicious but not classified as orphan — could be a runtime-assembled
 * launch per §74.4, which this layer cannot see).
 *
 * CANNOT DISTINGUISH: a worker whose ledger row was never written (§74.4),
 * or a worker whose ts_end was never recorded due to a crash. Both appear
 * as untracked, not orphaned.
 *
 * @param {Array<{pid: number, runId: string|null, commandLine: string}>} liveWorkers
 * @param {object[]} ledgerRows — all rows from the ledger file
 * @returns {{ orphans: Array<{pid, runId, ticketId, model, staleSince}>,
 *             expected: Array<{pid, runId}>,
 *             untracked: Array<{pid, runId, commandLine}> }}
 */
export function classifyOrphans(liveWorkers, ledgerRows) {
  const orphans = [];
  const expected = [];
  const untracked = [];

  for (const worker of liveWorkers) {
    if (!worker.runId) {
      untracked.push(worker);
      continue;
    }
    const rows = ledgerRows.filter(r => r.run_id === worker.runId);
    if (rows.length === 0) {
      untracked.push(worker);
      continue;
    }
    const endedRow = rows.find(r => r.ts_end);
    if (endedRow) {
      orphans.push({
        pid: worker.pid,
        runId: worker.runId,
        ticketId: endedRow.ticket_id || null,
        model: endedRow.model || null,
        staleSince: endedRow.ts_end,
      });
    } else {
      expected.push({ pid: worker.pid, runId: worker.runId });
    }
  }

  return { orphans, expected, untracked };
}

/**
 * Top-level decision: given parsed inputs, return an alert object or null.
 * Pure — no I/O.
 *
 * Unattributed rows are time-scoped: only rows whose `ts` falls at or after
 * `sessionStart` (the earliest `ts` of any matched row for this session) are
 * included in the live `unattributed` bucket. Rows that predate the session
 * window are historical backlog — summarized in one line, never listed, so the
 * live signal is never drowned by chronic noise (LR-003: not dropped, just
 * summarized).  When this session has no matched rows at all there is no window
 * to compute, so all unattributed rows are treated as historical (no alert).
 *
 * @param {object} opts
 * @param {string} opts.sessionId
 * @param {object[]} opts.ledgerRows   — all rows from the ledger file
 * @param {object[]} opts.messages     — transcript messages
 * @param {number}   opts.malformedCount — count of malformed ledger lines
 * @param {string}   [opts.sessionWindowStart] — ISO timestamp from the Stop payload or
 *                    caller; used as the session window floor when no matched rows exist.
 *                    When absent and no matched rows exist, all unattributed rows are
 *                    treated as in-window (alert rather than suppress — B2 fix).
 * @returns {{ hasAlert: boolean, sessionId, invisible, unattributed,
 *             historicalSummary: string|null, malformedCount }}
 */
export function decide({ sessionId, ledgerRows, messages, malformedCount = 0, sessionWindowStart = null }) {
  const { matched, unattributed } = partitionLedger(ledgerRows, sessionId);
  const toolCmds = extractToolCallCommands(messages);
  const { invisible } = reconcile(matched, toolCmds);

  // Session window: prefer matched-row timestamps, then caller-supplied sessionWindowStart.
  // When no window can be derived at all, fall back to a 24-hour recency guard so fresh
  // unattributed rows alert rather than being silently suppressed (B2 fix — LR-003).
  const FALLBACK_WINDOW_MS = 24 * 60 * 60 * 1000;
  const matchedTs = matched.map((r) => r.ts).filter(Boolean).sort();
  const sessionStart =
    matchedTs.length > 0
      ? matchedTs[0]
      : sessionWindowStart !== null
        ? sessionWindowStart
        : new Date(Date.now() - FALLBACK_WINDOW_MS).toISOString();

  const unattributedInWindow = unattributed.filter((r) => r.ts && r.ts >= sessionStart);
  const unattributedHistorical = unattributed.filter((r) => !r.ts || r.ts < sessionStart);

  // One-line summary for the historical backlog — visible but not listed.
  let historicalSummary = null;
  if (unattributedHistorical.length > 0) {
    const hTs = unattributedHistorical.map((r) => r.ts).filter(Boolean).sort();
    const range =
      hTs.length > 0
        ? `${hTs[0].slice(0, 10)} → ${hTs[hTs.length - 1].slice(0, 10)}`
        : "no-ts";
    historicalSummary =
      `${unattributedHistorical.length} unattributed row(s) predate this session ` +
      `(${range}) — historical backlog, not this session's signal`;
  }

  const hasAlert = invisible.length > 0 || unattributedInWindow.length > 0;
  return {
    hasAlert,
    sessionId,
    invisible: invisible.map((r) => ({
      run_id: r.run_id || null,
      ticket_id: r.ticket_id || null,
      work_type: r.work_type || null,
      ts: r.ts || null,
    })),
    unattributed: unattributedInWindow.map((r) => ({
      run_id: r.run_id || null,
      ticket_id: r.ticket_id || null,
      work_type: r.work_type || null,
      ts: r.ts || null,
    })),
    historicalSummary,
    malformedCount,
  };
}

// ---------------------------------------------------------------------------
// Hook entry point (skipped when imported by the fixtures file)
// ---------------------------------------------------------------------------

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly && process.argv[2] !== "--no-run") {
  runHookMode();
}

function runHookMode() {
  let stdin = "";
  try {
    stdin = readFileSync(0, "utf8");
  } catch (e) {
    failOpen(`stdin read failed: ${e.message}`);
    return;
  }
  if (!stdin || !stdin.trim()) return; // routine Stop with no payload → silent
  if (/"stop_hook_active"\s*:\s*true/.test(stdin)) return; // re-fire guard

  let payload;
  try {
    payload = JSON.parse(stdin);
  } catch (e) {
    failOpen(`stdin JSON parse failed: ${e.message}`);
    return;
  }

  const sessionId = payload.session_id || payload.sessionId || "";
  const transcriptPath = payload.transcript_path || payload.transcriptPath || "";

  // Missing transcript: cannot prove visibility — alert conservatively.
  const transcriptMissing = !transcriptPath || !existsSync(transcriptPath);
  let messages = [];
  if (transcriptMissing) {
    // Conservative: we can still report ledger rows, but cannot prove any are visible.
    // We proceed with empty messages — every ledger row for this session will be invisible.
    // The alert will note transcript_missing: true.
  } else {
    messages = safeLoadTranscript(transcriptPath);
  }

  // Load ledger.
  let ledgerRows = [];
  let malformedCount = 0;
  if (existsSync(LEDGER_PATH)) {
    try {
      const raw = readFileSync(LEDGER_PATH, "utf8");
      const parsed = parseLedger(raw);
      ledgerRows = parsed.rows;
      malformedCount = parsed.malformed;
      if (malformedCount > 0) {
        failOpen(`${malformedCount} malformed line(s) in ledger.jsonl — skipped`);
      }
    } catch (e) {
      failOpen(`ledger read failed: ${e.message}`);
      // Proceed with empty ledger — no false positives from I/O error.
      return;
    }
  }
  // Missing ledger file → no dispatches recorded → nothing to reconcile.
  if (!existsSync(LEDGER_PATH)) return;

  if (!sessionId) {
    // Cannot attribute any rows without a session_id — still process unattributed bucket.
    // Treat as session with empty id: partitionLedger will put all rows in "other" (ignored),
    // so no false alerts. Log and return.
    failOpen("stdin missing session_id — cannot reconcile");
    return;
  }

  let result;
  try {
    // Derive session window start from current time; matched-row timestamps take precedence
    // inside decide(), but this ensures a window always exists for the B2 unattributed check.
    const sessionWindowStart = new Date().toISOString();
    result = decide({ sessionId, ledgerRows, messages, malformedCount, sessionWindowStart });
  } catch (e) {
    failOpen(`decide threw: ${e.message}`);
    return;
  }

  if (!result.hasAlert) {
    // no invisible-dispatch alert — fall through to orphan check
  } else {
  try {
    ensureStateDir();

    const alertFile = join(
      STATE_DIR,
      `invisible-dispatch-alerts-${safeFilename(sessionId)}.json`
    );
    const alertEntry = {
      session_id: sessionId,
      ts: new Date().toISOString(),
      invisible: result.invisible,
      unattributed: result.unattributed,
      historical_summary: result.historicalSummary || null,
      transcript_missing: transcriptMissing,
      malformed_ledger_lines: malformedCount,
    };
    writeAlertFile(alertFile, alertEntry);
    fireTelemetry("visibility-reconcile", "warn", sessionId);

    const parts = [];
    if (result.invisible.length) {
      parts.push(
        `${result.invisible.length} INVISIBLE dispatch(es): ` +
          result.invisible
            .map((r) => `run_id=${r.run_id || "?"}`)
            .join(", ")
      );
    }
    if (result.unattributed.length) {
      parts.push(
        `${result.unattributed.length} UNATTRIBUTED dispatch(es) in session window (no session_id): ` +
          result.unattributed
            .map((r) => `run_id=${r.run_id || "?"}`)
            .join(", ")
      );
    }
    if (result.historicalSummary) {
      parts.push(result.historicalSummary);
    }
    if (transcriptMissing) {
      parts.push("WARNING: transcript missing — all ledger rows treated as invisible");
    }

    process.stdout.write(
      `[INVISIBLE-DISPATCH WARN] Session ${sessionId}: ${parts.join("; ")}. ` +
        `Alert persisted to ${shortPath(alertFile)}.\n`
    );
  } catch (e) {
    failOpen(`alert emit failed: ${e.message}`);
  }
  }

  // --- V24: Orphaned worker detection ---
  // DETECTION, NOT PREVENTION. An orphaned worker is made visible after the
  // fact; this does not stop one from being created. LR-074 §74.4's residual
  // (runtime-assembled launches) remains permanently invisible to both layers.
  try {
    const liveWorkers = enumerateLiveWorkers();
    if (liveWorkers.length > 0) {
      const classification = classifyOrphans(liveWorkers, ledgerRows);
      if (classification.orphans.length > 0) {
        ensureStateDir();
        const orphanAlertFile = join(
          STATE_DIR,
          `orphaned-worker-alerts-${safeFilename(sessionId)}.json`
        );
        const orphanEntry = {
          session_id: sessionId,
          ts: new Date().toISOString(),
          orphans: classification.orphans,
          untracked: classification.untracked.map(w => ({ pid: w.pid, runId: w.runId })),
        };
        writeAlertFile(orphanAlertFile, orphanEntry);
        fireTelemetry("orphan-worker", "warn", sessionId);

        const orphanLines = classification.orphans.map(o => {
          const staleMs = o.staleSince ? Date.now() - new Date(o.staleSince).getTime() : null;
          const staleStr = staleMs !== null ? `${Math.round(staleMs / 60000)}min` : '?';
          return `PID=${o.pid} run_id=${o.runId} ticket=${o.ticketId || '?'} model=${o.model || '?'} stale=${staleStr}`;
        }).join('; ');

        process.stdout.write(
          `[ORPHANED-WORKER WARN] Session ${sessionId}: ${classification.orphans.length} orphaned worker(s) ` +
          `still alive after their dispatch ended: ${orphanLines}. ` +
          `Alert persisted to ${shortPath(orphanAlertFile)}.\n`
        );
      }
    }
  } catch (e) {
    failOpen(`orphan detection failed: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// I/O helpers
// ---------------------------------------------------------------------------

/**
 * Enumerate live worker processes by querying the OS process table.
 * Windows: Get-CimInstance Win32_Process. Unix: ps aux.
 * Returns array of { pid, runId, commandLine }.
 * Fail-open: returns [] on any error (broken enumeration must not block Stop).
 */
function enumerateLiveWorkers() {
  try {
    const isWin = process.platform === "win32";
    let output;
    if (isWin) {
      output = execSync(
        'powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | ' +
        "Where-Object { $_.CommandLine -and $_.CommandLine.Contains('copilot-worker.sh') } | " +
        'Select-Object ProcessId, CommandLine | ConvertTo-Json"',
        { encoding: "utf8", timeout: 15000, windowsHide: true }
      );
    } else {
      output = execSync("ps aux 2>/dev/null || ps -ef 2>/dev/null", {
        encoding: "utf8",
        timeout: 10000,
      });
    }
    return parseLiveWorkerOutput(output, isWin);
  } catch {
    return [];
  }
}

function parseLiveWorkerOutput(output, isWin) {
  const workers = [];
  if (!output || !output.trim()) return workers;
  if (isWin) {
    try {
      let parsed = JSON.parse(output.trim());
      if (!Array.isArray(parsed)) parsed = [parsed];
      for (const p of parsed) {
        const pid = p.ProcessId;
        const cmdLine = p.CommandLine || "";
        const m = cmdLine.match(/--run-id\s+(\S+)/);
        workers.push({ pid, runId: m ? m[1] : null, commandLine: cmdLine });
      }
    } catch { /* malformed JSON — fail-open */ }
  } else {
    for (const line of output.split("\n")) {
      if (!line.includes("copilot-worker.sh")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parseInt(parts[1], 10) || 0;
      const m = line.match(/--run-id\s+(\S+)/);
      workers.push({ pid, runId: m ? m[1] : null, commandLine: line });
    }
  }
  return workers;
}

function safeLoadTranscript(transcriptPath) {
  try {
    const raw = readFileSync(transcriptPath, "utf8");
    const messages = [];
    for (const line of raw.split(/\r?\n/)) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        const msg = obj.message ?? obj;
        if (msg && msg.role) messages.push(msg);
      } catch {
        /* skip bad transcript line */
      }
    }
    return messages;
  } catch {
    return [];
  }
}

function writeAlertFile(alertFile, entry) {
  let existing = [];
  if (existsSync(alertFile)) {
    try {
      const p = JSON.parse(readFileSync(alertFile, "utf8"));
      if (Array.isArray(p)) existing = p;
    } catch { /* start fresh */ }
  }
  existing.push(entry);
  const tmp = join(tmpdir(), `vis-reconcile-${process.pid}-${Date.now()}.tmp`);
  writeFileSync(tmp, JSON.stringify(existing, null, 2));
  // Atomic write: rename over destination (on Windows, destination must not exist).
  try { renameSync(tmp, alertFile); } catch {
    // Fallback: overwrite directly (Windows rename-over-existing may fail).
    writeFileSync(alertFile, JSON.stringify(existing, null, 2));
    try { renameSync(tmp, tmp + ".done"); } catch { /* best-effort cleanup */ }
  }
}

function ensureStateDir() {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
}

function safeFilename(s) {
  return String(s).replace(/[^a-zA-Z0-9._-]/g, "_");
}

function shortPath(p) {
  return String(p).replace(REPO_ROOT, "").replace(/\\/g, "/");
}

function failOpen(reason) {
  try {
    ensureStateDir();
    appendFileSync(
      FAILURE_LOG,
      `${new Date().toISOString()} check-visibility-reconcile.mjs ${reason}\n`
    );
  } catch {
    /* swallow — fail-OPEN must not throw */
  }
}
