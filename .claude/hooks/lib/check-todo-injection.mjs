#!/usr/bin/env node
// check-todo-injection.mjs — TodoWrite context-injection enforcement (SP02B).
//
// MODES (dispatched by argv[2]):
//
//   --capture   PostToolUse on TodoWrite. Read tool_input.todos array;
//               for each todo extract content + activeForm; run TAG_RE against
//               both; record {count, tagged_count, untagged_indices,
//               tags_per_item} to .claude/state/todo-state-${session_id}.json
//               (atomic write via tmp+rename). Always exits 0.
//
//   --validate  PreToolUse on Edit|Write|NotebookEdit. Decision flow:
//                 1. Parse transcript for active /execute (option D — no marker).
//                    Active iff: transcript contains a `Skill` tool_use with
//                    input.skill === "execute" in last N assistant turns AND no
//                    subsequent `Skill` tool_use of "final-q".
//                 2. If NOT in /execute → emit allow.
//                 3. If in /execute → read .claude/state/todo-state-${sid}.json.
//                    - Missing OR count == 0 → deny ("Build TodoWrite first…").
//                    - untagged_indices.length > 0 → deny ("entry #N missing tag…").
//                    - Otherwise → allow.
//
//   --self-test Runs synthetic fixtures inline (no I/O). Exits 0 on pass,
//               1 on any failure. Stdout reports per-case pass/fail.
//
// FAIL-OPEN: any uncaught exception in --capture or --validate is logged to
// .claude/state/hook-failures.log and the hook returns allow (PreToolUse) /
// silent (PostToolUse). A broken gate must never wedge the session.
//
// Override path: same handshake convention as LR-043 §A — assistant emits
// `[OVERRIDE-REQUEST]` referencing the path, user types one of the
// authorization phrases (`override approved` etc.) within 3 assistant turns
// before the denied tool call.

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const STATE_DIR = join(REPO_ROOT, ".claude", "state");
const FAILURE_LOG = join(STATE_DIR, "hook-failures.log");

// 4 tag types — covers every TodoWrite obligation per pipeline.md TodoWrite
// Tagging Contract section. Match against (content + " " + activeForm).
//   [/skill:matchtype]    where matchtype ∈ direct|wrap|inform|verify
//   LR-NNN(reason)        reason is non-empty parenthetical
//   [manual](reason)      reason is non-empty parenthetical
//   [ceremony]            bare ceremony tag (Phase 0 / Phase 0.1 / Phase 0.5 /
//                         Phase 2.5 / Phase 3.5 / activity-log / final-q)
const TAG_RE = /(\[\/[a-z-]+:(?:direct|wrap|inform|verify)\])|(LR-\d{3}\([^)]+\))|(\[manual\]\([^)]+\))|(\[ceremony\])/;

const OVERRIDE_AUTH_RX = /\b(override approved|override ok|approve override|authorized to override|i authorize|you are authorized)\b/i;
const OVERRIDE_REQUEST_RX = /(?:^|\n)[\s`>*_-]*\[OVERRIDE-REQUEST\][\s`]*\S/;

// /execute detection window: scan last 80 messages (≈40 assistant turns) for the
// Skill invocation; cap prevents O(n) on very long sessions.
const EXECUTE_LOOKBACK = 80;

const MUTATION_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);

// ---------------------------------------------------------------------------
// LR-054 / ALL-077 — manufactured-blocker banned-phrase scanner.
//
// Scope (intentionally narrow):
//   - Inspects ONLY tool_input.new_string (Edit) / tool_input.content (Write) /
//     tool_input.new_source (NotebookEdit). NEVER inspects old_string /
//     old_source — that would block
//     DELETION of banned content, which is the opposite of intent (e.g.
//     quarantining a manufactured Section 0 prose block).
//   - Fires only on a path matching BANNED_PATH_TARGETS (walk-evidence,
//     neutral-eye-audits, field-inventories, plans). Other paths exempt.
//   - Skips BANNED_PATH_EXEMPT (LR-054 body, ALL-077 row, the plan that
//     authored this rule, the feedback memory file) — they legitimately
//     discuss the pattern.
//
// Override path: same handshake convention as the rest of this gate — assistant
// emits `[OVERRIDE-REQUEST] <path>`, user types an authorization phrase within
// 3 assistant turns, the next write to that path is allowed (one-shot).
// ---------------------------------------------------------------------------

const BANNED_PHRASES = [
  /Section 0 — Live-Walk Blocker/i,
  /Section 0 — .{0,40}Blocker\b/i,
  /UNFILLED-BLOCKED-SECTION/,
  /\bstructural blocker\b/i,
  /\bprovisioning invariant\b/i,
  /\bunattended execution risks?\b/i,
  /\bindefinite if .{1,80} fires\b/i,
  /\bPath \d+ \(NOT taken in this session\)/i,
  /\bcannot complete .{0,80}strict.{0,40}line.{0,80}in this single session\b/i,
];

const BANNED_PATH_TARGETS = [
  /clients\/[^/]+\/specs_planning\/_internal\/walk-evidence-[^/]+\.md$/,
  /clients\/[^/]+\/specs_planning\/_internal\/neutral-eye-audits\/.+\.md$/,
  /clients\/[^/]+\/specs_planning\/_internal\/field-inventories\/.+\.md$/,
  /(^|[\\\/])plans[\\\/](pending|done)[\\\/].+\.md$/,
];

const BANNED_PATH_EXEMPT = [
  /\.claude[\\\/]rules[\\\/]browser-tool\.md$/,
  /clients\/[^/]+\/specs_planning\/_internal\/agent-mistakes\.md$/,
  /plans[\\\/](pending|done)[\\\/]PLAN_FIX_CLI_HALLUCINATION_AND_SSL_A_BLOCKER\.md$/,
  /feedback_browser_tool_selection\.md$/,
];

function isBannedPhraseTarget(targetPath) {
  if (!targetPath) return false;
  const norm = String(targetPath).replace(/\\/g, "/");
  if (BANNED_PATH_EXEMPT.some((re) => re.test(norm) || re.test(targetPath))) return false;
  return BANNED_PATH_TARGETS.some((re) => re.test(norm) || re.test(targetPath));
}

// ---------------------------------------------------------------------------
// Skip/fixme escape-hatch gate — backstop for REJECT bucket Class 3
// in .claude/skills/rca/SKILL.md.
//
// Denies Edit|Write to *.spec.ts (or *.test.ts) when the edit
// ADDS A NEW test.skip(/test.fixme( line AND no BUG-XXX-NNN reference
// appears on the same line OR the immediately-adjacent lines (prev/next).
//
// Net-new semantics (grandfather existing skips):
//   - For Edit: compare new_string skip lines to old_string skip lines.
//     A skip line present verbatim in old_string is grandfathered.
//   - For Write: read the existing file from disk (if present) and grandfather
//     any skip line that already exists verbatim. A new file (file_path absent
//     on disk) treats every skip line as net-new.
//
// Rationale: pre-existing test.skip / test.fixme entries authored before this
// gate landed (e.g., the SSL-007/026/030, MGH-006/008/019, PRI-020/025/028,
// LOS-BAS-048 set audited 2026-05-21) carry "Blocked by app bug: ..." prose
// but no BUG-XXX-NNN cite because the user files Encore bugs externally and
// the IDs aren't always assigned. Net-new semantics let the gate keep its
// teeth on FUTURE skips while not locking out edits to the existing ones.
//
// node_modules exclusion: third-party packages ship their own test.skip
// examples (zod / pg-protocol / pino, etc.). Path containing "/node_modules/"
// is excluded from the spec-path check.
//
// Same fail-OPEN posture as the banned-phrase gate. Same LR-043 §A override
// handshake.
// ---------------------------------------------------------------------------

const SPEC_PATH_RX = /[\\\/](.+\.spec\.ts|.+\.test\.ts)$/i;
const NODE_MODULES_RX = /(^|[\\\/])node_modules[\\\/]/i;
const SKIP_FIXME_RX = /\btest\.(skip|fixme)\s*\(/;
// Bug IDs have 2 or 3 letter-segments (e.g., BUG-HIS-001, BUG-LOC-SHR-001,
// BUG-LOC-ECT-001). Match BUG- followed by one-or-more LETTERS-dash groups,
// terminating in digits.
const BUG_CITE_RX = /\bBUG-(?:[A-Z]+-)+\d+\b/;

function isSpecPath(targetPath) {
  if (!targetPath) return false;
  const norm = String(targetPath).replace(/\\/g, "/");
  if (NODE_MODULES_RX.test(norm)) return false;
  return SPEC_PATH_RX.test(norm);
}

// Legacy: still used by self-tests for the pure-scan path. Net-new logic below
// wraps this for the live grandfather check.
function scanSkipFixmeWithoutBugCite(content) {
  if (!content) return [];
  const lines = content.split(/\r?\n/);
  const offenders = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!SKIP_FIXME_RX.test(line)) continue;
    const prevLine = i > 0 ? lines[i - 1] : "";
    const nextLine = i < lines.length - 1 ? lines[i + 1] : "";
    const adjacent = `${prevLine}\n${line}\n${nextLine}`;
    if (!BUG_CITE_RX.test(adjacent)) {
      const match = line.match(/\btest\.(skip|fixme)\s*\([^)]{0,60}/);
      offenders.push(match ? match[0] : line.trim().slice(0, 80));
    }
  }
  return offenders;
}

function scanSkipFixmeNetNewWithoutBugCite(newContent, oldContent) {
  // Grandfather skip/fixme lines that already exist verbatim in oldContent.
  // Only NEW (net-additional) skip/fixme lines without BUG- cite are returned
  // as offenders.
  if (!newContent) return [];
  const newLines = newContent.split(/\r?\n/);
  const oldLines = oldContent ? oldContent.split(/\r?\n/) : [];
  const oldSkipLines = new Set();
  for (const l of oldLines) {
    if (SKIP_FIXME_RX.test(l)) oldSkipLines.add(l);
  }

  const offenders = [];
  for (let i = 0; i < newLines.length; i++) {
    const line = newLines[i];
    if (!SKIP_FIXME_RX.test(line)) continue;
    if (oldSkipLines.has(line)) continue; // grandfathered
    const prevLine = i > 0 ? newLines[i - 1] : "";
    const nextLine = i < newLines.length - 1 ? newLines[i + 1] : "";
    const adjacent = `${prevLine}\n${line}\n${nextLine}`;
    if (!BUG_CITE_RX.test(adjacent)) {
      const match = line.match(/\btest\.(skip|fixme)\s*\([^)]{0,60}/);
      offenders.push(match ? match[0] : line.trim().slice(0, 80));
    }
  }
  return offenders;
}

function extractWriteContent(toolName, toolInput) {
  // Returns the NEW content fragments to scan. Old content fragments are
  // intentionally excluded so deletions are never blocked.
  const out = [];
  if (!toolInput || typeof toolInput !== "object") return out;
  if (toolName === "Edit") {
    if (typeof toolInput.new_string === "string") out.push(toolInput.new_string);
  } else if (toolName === "Write") {
    if (typeof toolInput.content === "string") out.push(toolInput.content);
  } else if (toolName === "NotebookEdit") {
    if (typeof toolInput.new_source === "string") out.push(toolInput.new_source);
    else if (typeof toolInput.content === "string") out.push(toolInput.content);
  }
  return out;
}

function extractWriteContentPairs(toolName, toolInput) {
  // Returns array of {newContent, oldContent} pairs for net-new comparison.
  // For Edit: oldContent = the corresponding old_string from input.
  // For Write: oldContent = the file on disk (if it exists; "" otherwise).
  // For NotebookEdit: oldContent = "" (no exposed old).
  const out = [];
  if (!toolInput || typeof toolInput !== "object") return out;
  if (toolName === "Edit") {
    out.push({
      newContent: typeof toolInput.new_string === "string" ? toolInput.new_string : "",
      oldContent: typeof toolInput.old_string === "string" ? toolInput.old_string : "",
    });
  } else if (toolName === "Write") {
    let oldContent = "";
    const filePath = toolInput.file_path;
    try {
      if (filePath && existsSync(filePath)) oldContent = readFileSync(filePath, "utf8");
    } catch { /* fall through to empty oldContent */ }
    out.push({
      newContent: typeof toolInput.content === "string" ? toolInput.content : "",
      oldContent,
    });
  } else if (toolName === "NotebookEdit") {
    out.push({
      newContent: typeof toolInput.new_source === "string"
        ? toolInput.new_source
        : (typeof toolInput.content === "string" ? toolInput.content : ""),
      oldContent: "",
    });
  }
  return out;
}

function scanBannedPhrases(content) {
  if (!content) return [];
  const hits = [];
  for (const re of BANNED_PHRASES) {
    const m = content.match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}

const mode = process.argv[2] || "";

if (mode === "--self-test") {
  runSelfTest();
} else {
  runHookMode(mode);
}

// ---------------------------------------------------------------------------
// Hook-mode entry point (capture / validate). Reads stdin JSON from harness.
// ---------------------------------------------------------------------------

function runHookMode(modeArg) {
  let stdin = "";
  try {
    stdin = readFileSync(0, "utf8");
  } catch (e) {
    failOpen(`stdin read failed: ${e.message}`);
    return;
  }

  let payload;
  try {
    payload = JSON.parse(stdin);
  } catch (e) {
    failOpen(`stdin JSON parse failed: ${e.message}`);
    return;
  }

  const sessionId = payload.session_id || payload.sessionId || "unknown";
  const transcriptPath = payload.transcript_path || payload.transcriptPath || "";

  try {
    if (modeArg === "--capture") {
      handleCapture(payload, sessionId);
    } else if (modeArg === "--validate") {
      handleValidate(payload, sessionId, transcriptPath);
    } else {
      failOpen(`unknown mode: ${modeArg}`);
    }
  } catch (e) {
    failOpen(`${modeArg} threw: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// --capture: PostToolUse on TodoWrite. Persist tag state.
// ---------------------------------------------------------------------------

// Two-mode dispatch helpers — exported as module-scope for self-test access.
//
// Legacy harness exposed `TodoWrite` with payload `tool_input.todos[]` (each
// item = {content, activeForm, status}). Post-rename harness exposes
// `TaskCreate` (single task per call — useless as a capture trigger because
// payload carries only the just-created task) AND `TaskList` (returns full
// task list in `tool_response`). The PostToolUse matcher is
// `TodoWrite|TaskList` (post-Phase-1) so both shapes reach this hook.
//
// extractCaptureEntries — returns the array to iterate. For TaskList,
// returns `tool_response.tasks` when that is an array (production shape,
// verified 2026-05-26 across 246 JSONL transcripts: top-level keys exactly
// `["tasks"]`, task objects exactly `{id, subject, status, blockedBy}`);
// falls back to `tool_response` itself only if that's an array (defensive
// against a future harness flattening); else returns null (fail-open:
// preserve prior state file instead of overwriting with empty/garbage).
function extractCaptureEntries(toolName, toolInput, toolResponse) {
  if (toolName === "TaskList") {
    // Production tool_response shape: {tasks: [...]} (verified from real
    // transcript toolUseResult, 2026-05-26).
    if (Array.isArray(toolResponse?.tasks)) return toolResponse.tasks;
    // Defensive: if a future harness flattens to a top-level array, take it.
    if (Array.isArray(toolResponse)) return toolResponse;
    // Unknown shape → fail-open (preserve prior state, log to hook-failures).
    return null;
  }
  // TodoWrite (legacy) and any unmatched variant fall through to the
  // tool_input.todos[] shape.
  return Array.isArray(toolInput?.todos) ? toolInput.todos : [];
}

// extractEntryProbe — returns the string to tag-scan.
// TaskList responses carry {id, subject, status, owner, blockedBy} — NO
// activeForm — so probe collapses to subject alone. TodoWrite entries carry
// {content, activeForm, status} — probe = content + " " + activeForm.
function extractEntryProbe(toolName, entry) {
  if (toolName === "TaskList") {
    return String(entry.subject || "");
  }
  const content = String(entry?.content || "");
  const activeForm = String(entry?.activeForm || "");
  return `${content} ${activeForm}`;
}

function handleCapture(payload, sessionId) {
  const toolName = payload.tool_name || payload.toolName || "";
  const toolInput = payload.tool_input || payload.toolInput || {};
  const toolResponse = payload.tool_response ?? payload.toolResponse;

  const entries = extractCaptureEntries(toolName, toolInput, toolResponse);
  if (entries === null) {
    // TaskList tool_response wasn't an array — preserve prior state per fail-open
    // policy (a corrupted capture would deny the next Edit; better to keep the
    // last good state and surface the issue via hook-failures.log).
    failOpen(`TaskList tool_response.tasks is not an array (got ${typeof toolResponse} keys=${toolResponse && typeof toolResponse === "object" ? Object.keys(toolResponse).join(",") || "{}" : "n/a"}); preserving prior state`);
    return;
  }

  const tagsPerItem = [];
  const untaggedIndices = [];
  let taggedCount = 0;

  entries.forEach((t, idx) => {
    const probe = extractEntryProbe(toolName, t);
    const tags = extractTags(probe);
    tagsPerItem.push(tags);
    if (tags.length > 0) taggedCount++;
    else untaggedIndices.push(idx);
  });

  const state = {
    session_id: sessionId,
    captured_at: new Date().toISOString(),
    count: entries.length,
    tagged_count: taggedCount,
    untagged_indices: untaggedIndices,
    tags_per_item: tagsPerItem,
  };

  ensureStateDir();
  const target = join(STATE_DIR, `todo-state-${safeFilename(sessionId)}.json`);
  atomicWrite(target, JSON.stringify(state, null, 2));
  // Capture mode: no stdout, no decision; PostToolUse is observational.
}

// ---------------------------------------------------------------------------
// --validate: PreToolUse on mutation tools.
// ---------------------------------------------------------------------------

function handleValidate(payload, sessionId, transcriptPath) {
  const toolName = payload.tool_name || payload.toolName || "";
  if (!MUTATION_TOOLS.has(toolName)) {
    emitAllow();
    return;
  }

  const toolInput = payload.tool_input || payload.toolInput || {};
  const targetPath =
    toolInput.file_path || toolInput.notebook_path || toolInput.path || "";

  // Transcript-driven /execute detection (option D — no agent-side marker).
  const messages = safeLoadTranscript(transcriptPath);
  const inExecute = isInExecute(messages);

  // -------------------------------------------------------------------------
  // LR-054 / ALL-077 banned-phrase gate — fires regardless of /execute state.
  // Path-scoped to artifact files where the manufactured-blocker pattern ships
  // (walk-evidence / neutral-eye-audits / field-inventories / plans). Scans
  // ONLY the new content fragments (never old_string) so deletions are
  // never blocked. Override handshake = same LR-043 §A protocol.
  // -------------------------------------------------------------------------
  if (isBannedPhraseTarget(targetPath)) {
    const fragments = extractWriteContent(toolName, toolInput);
    for (const frag of fragments) {
      const hits = scanBannedPhrases(frag);
      if (hits.length > 0) {
        if (hasOverrideAuthorization(messages, targetPath)) {
          emitAllow(
            `[OVERRIDE] banned-phrase gate bypassed for ${shortPath(targetPath)} ` +
              `(matched: ${hits.slice(0, 2).join(" | ")})`
          );
          return;
        }
        const sample = hits.slice(0, 3).map((h) => JSON.stringify(h)).join(", ");
        emitDeny(
          `Manufactured-blocker prose denied by LR-039 + LR-054 + ALL-077 banned-phrase gate ` +
            `(${shortPath(targetPath)}). Matched: ${sample}. ` +
            "Default auth-refresh path = LoginPage.loginWithMicrosoft (config-driven, e2e). " +
            "HALT prose is forbidden unless ALL THREE LR-039 preconditions hold: (a) creds missing " +
            "from clients/encore/config/environments/.env.e2e, (b) MFA documented active in " +
            "clients/encore/CLAUDE.md, (c) `playwright-cli open --persistent` unavailable. " +
            "See .claude/rules/browser-tool.md LR-054 + Gate 3, docs/read_only_docs/CLI_BROWSER_GUIDE.md " +
            "Table 2, clients/encore/specs_planning/_internal/agent-mistakes.md ALL-077. " +
            "Override path (one-shot, LR-043 §A): emit `[OVERRIDE-REQUEST] " +
            shortPath(targetPath) + "` and have the user type 'override approved'."
        );
        return;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Skip/fixme escape-hatch gate — backstop for /rca REJECT bucket Class 3.
  // Fires on Edit|Write to *.spec.ts / *.test.ts when new content
  // ADDS A NEW test.skip( or test.fixme( without a BUG-XXX-NNN cite on the
  // same or adjacent line. Existing skip/fixme lines (verbatim match in
  // old_string for Edit, or on-disk file for Write) are
  // grandfathered so this gate does not lock out edits to pre-existing skips
  // authored before the gate landed.
  //
  // Independent of /execute state (specs may be edited outside /execute).
  // Override = LR-043 §A handshake, same posture as banned-phrase.
  // -------------------------------------------------------------------------
  if (isSpecPath(targetPath)) {
    const pairs = extractWriteContentPairs(toolName, toolInput);
    for (const pair of pairs) {
      const offenders = scanSkipFixmeNetNewWithoutBugCite(pair.newContent, pair.oldContent);
      if (offenders.length > 0) {
        if (hasOverrideAuthorization(messages, targetPath)) {
          emitAllow(
            `[OVERRIDE] skip/fixme-without-BUG gate bypassed for ${shortPath(targetPath)} ` +
              `(matched: ${offenders.slice(0, 2).join(" | ")})`
          );
          return;
        }
        const sample = offenders.slice(0, 3).map((h) => JSON.stringify(h)).join(", ");
        emitDeny(
          `NEW test.skip / test.fixme without BUG-XXX-NNN cite denied by /rca REJECT bucket Class 3 ` +
            `(${shortPath(targetPath)}). Matched: ${sample}. ` +
            "Required: add a BUG-XXX-NNN reference on the same line or an adjacent line " +
            "(e.g., `test.skip('TC-001', ...);  // BUG-LOC-SHR-001 — appears under role X only`). " +
            "Bugs are filed via reports/bugs/BUG-{MOD}-{NNN}.json per LR-034. " +
            "If no bug exists, file one first OR pick a non-skip fix. " +
            "Pre-existing skip/fixme lines (verbatim match in old_string or on-disk file) are grandfathered. " +
            "See .claude/skills/rca/SKILL.md § REJECT bucket → Class 3. " +
            "Override path (one-shot, LR-043 §A): emit `[OVERRIDE-REQUEST] " +
            shortPath(targetPath) + "` and have the user type 'override approved'."
        );
        return;
      }
    }
  }

  if (!inExecute) {
    emitAllow();
    return;
  }

  // In /execute — load captured state.
  const statePath = join(STATE_DIR, `todo-state-${safeFilename(sessionId)}.json`);
  if (!existsSync(statePath)) {
    if (hasOverrideAuthorization(messages, targetPath)) {
      emitAllow(`[OVERRIDE] todo-injection-gate bypassed for ${targetPath}`);
      return;
    }
    emitDeny(
      "Build TodoWrite first per /execute Phase 0.5 — every /execute must todo-list before editing. " +
        `Session ${sessionId.slice(0, 8)} has no captured todo state at ${shortPath(statePath)}. ` +
        "Options: (1) call TodoWrite with at least one tagged entry before retrying this Edit/Write, " +
        "(2) emit '[OVERRIDE-REQUEST] <target-path>' and have the user type 'override approved' (one-shot). " +
        "Tag formats: [/skill:direct|wrap|inform|verify] | LR-NNN(reason) | [manual](reason) | [ceremony]."
    );
    return;
  }

  let state;
  try {
    state = JSON.parse(readFileSync(statePath, "utf8"));
  } catch (e) {
    failOpen(`todo-state JSON parse failed: ${e.message}`);
    return;
  }

  if (!state.count || state.count === 0) {
    if (hasOverrideAuthorization(messages, targetPath)) {
      emitAllow(`[OVERRIDE] todo-injection-gate bypassed (zero-count) for ${targetPath}`);
      return;
    }
    emitDeny(
      "TodoWrite captured but the todo list is empty — every /execute must todo-list before editing. " +
        "Call TodoWrite with at least one tagged entry, OR request override per LR-043 §A handshake."
    );
    return;
  }

  if (Array.isArray(state.untagged_indices) && state.untagged_indices.length > 0) {
    if (hasOverrideAuthorization(messages, targetPath)) {
      emitAllow(`[OVERRIDE] todo-injection-gate bypassed (untagged) for ${targetPath}`);
      return;
    }
    const idx = state.untagged_indices[0];
    const total = state.untagged_indices.length;
    emitDeny(
      `TodoWrite entry #${idx + 1} missing required tag (skill / LR-NNN / manual / ceremony). ` +
        `${total} of ${state.count} todo items are untagged. ` +
        "Fix: call TodoWrite again with every entry carrying at least one tag. " +
        "Tag formats: [/skill:direct|wrap|inform|verify] | LR-NNN(reason) | [manual](reason) | [ceremony]. " +
        "OR request override per LR-043 §A handshake."
    );
    return;
  }

  emitAllow();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractTags(text) {
  if (!text) return [];
  const out = [];
  const re = new RegExp(TAG_RE.source, "g");
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push(m[0]);
  }
  return out;
}

function safeLoadTranscript(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return [];
  try {
    const raw = readFileSync(transcriptPath, "utf8");
    const lines = raw.split(/\r?\n/);
    const messages = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        const msg = obj.message ?? obj;
        if (msg && msg.role) messages.push(msg);
      } catch {
        /* skip bad line */
      }
    }
    return messages;
  } catch {
    return [];
  }
}

// Option D: walk back from the most recent message; an /execute is "active" iff
// we encounter a Skill tool_use of "execute" before encountering a Skill
// tool_use of "final-q". Bounded by EXECUTE_LOOKBACK to keep cost ~O(1) on long
// sessions.
function isInExecute(messages) {
  const start = messages.length - 1;
  const stop = Math.max(0, start - EXECUTE_LOOKBACK);
  for (let i = start; i >= stop; i--) {
    const msg = messages[i];
    if (!msg || msg.role !== "assistant") continue;
    const content = msg.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (c?.type !== "tool_use") continue;
      if (c.name !== "Skill") continue;
      const skillName = (c.input?.skill || "").toLowerCase();
      if (skillName === "final-q") return false; // /final-q closed the /execute scope.
      if (skillName === "execute") return true;
    }
  }
  return false;
}

function hasOverrideAuthorization(messages, targetPath) {
  // Walk backward; track sawRequest + sawAuth as flags; return true when both
  // appear within the last 3 assistant turns. Mirrors check-identity-switch.mjs
  // semantics — chronological "AFTER" is satisfied by the asstTurnCount cap.
  let sawRequest = false;
  let sawAuth = false;
  let asstTurnCount = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant") {
      asstTurnCount++;
      if (asstTurnCount > 3) break;
      const t = textOf(msg.content);
      if (OVERRIDE_REQUEST_RX.test(t) && (!targetPath || t.includes(targetPath))) sawRequest = true;
    } else if (msg.role === "user") {
      const t = textOf(msg.content);
      if (OVERRIDE_AUTH_RX.test(t)) sawAuth = true;
    }
    if (sawRequest && sawAuth) return true;
  }
  return false;
}

function textOf(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  let out = "";
  for (const c of content) {
    if (typeof c === "string") { out += c + "\n"; continue; }
    if (c?.type === "text" && typeof c.text === "string") out += c.text + "\n";
  }
  return out;
}

function safeFilename(s) {
  return String(s).replace(/[^a-zA-Z0-9._-]/g, "_");
}

function shortPath(p) {
  return p.replace(REPO_ROOT, "").replace(/\\/g, "/");
}

function ensureStateDir() {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
}

function atomicWrite(target, contents) {
  const tmp = join(tmpdir(), `todo-state-${process.pid}-${Date.now()}.tmp`);
  writeFileSync(tmp, contents);
  renameSync(tmp, target);
}

function failOpen(reason) {
  try {
    ensureStateDir();
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} ${reason}\n`);
  } catch {
    /* swallow — fail-OPEN must not throw */
  }
  // Validate-mode default: explicit allow JSON. Capture-mode: silent.
  if (mode === "--validate") emitAllow();
}

function emitAllow(reason) {
  const out = {
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "allow" },
  };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
}

function emitDeny(reason) {
  const out = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(out));
}

// ---------------------------------------------------------------------------
// --self-test: synthetic fixtures (no I/O). Exits 0 on pass, 1 on fail.
// ---------------------------------------------------------------------------

function runSelfTest() {
  const cases = [];

  // 1. TAG_RE — accept all 4 tag types.
  cases.push(["TAG accepts [/skill:direct]", () => TAG_RE.test("foo [/skill:direct] bar")]);
  cases.push(["TAG accepts [/skill:wrap]", () => TAG_RE.test("[/skill:wrap]")]);
  cases.push(["TAG accepts [/skill:inform]", () => TAG_RE.test("[/skill:inform]")]);
  cases.push(["TAG accepts [/skill:verify]", () => TAG_RE.test("[/skill:verify]")]);
  cases.push(["TAG accepts LR-027(reason)", () => TAG_RE.test("hit LR-027(plan finalization)")]);
  cases.push(["TAG accepts [manual](reason)", () => TAG_RE.test("[manual](just a doc)")]);
  cases.push(["TAG accepts [ceremony]", () => TAG_RE.test("hello [ceremony] world")]);
  cases.push(["TAG rejects bare LR-027", () => !TAG_RE.test("just LR-027 mentioned")]);
  cases.push(["TAG rejects [/skill:badtype]", () => !TAG_RE.test("[/skill:explode]")]);
  cases.push(["TAG rejects bare [manual]", () => !TAG_RE.test("[manual] without parens")]);

  // 2. extractTags — multiple tags in one string.
  cases.push([
    "extractTags multi",
    () => {
      const tags = extractTags("[/skill:direct] thing LR-007(verify) more [ceremony]");
      return tags.length === 3;
    },
  ]);

  // 3. isInExecute — positive (execute, no final-q).
  cases.push([
    "isInExecute positive",
    () => {
      const msgs = [
        { role: "user", content: "do thing" },
        {
          role: "assistant",
          content: [
            { type: "tool_use", name: "Skill", input: { skill: "execute", args: "PLAN.md" } },
          ],
        },
        { role: "assistant", content: [{ type: "text", text: "working on it" }] },
      ];
      return isInExecute(msgs) === true;
    },
  ]);

  // 4. isInExecute — negative (final-q after execute).
  cases.push([
    "isInExecute negative after final-q",
    () => {
      const msgs = [
        {
          role: "assistant",
          content: [{ type: "tool_use", name: "Skill", input: { skill: "execute" } }],
        },
        {
          role: "assistant",
          content: [{ type: "tool_use", name: "Skill", input: { skill: "final-q" } }],
        },
      ];
      return isInExecute(msgs) === false;
    },
  ]);

  // 5. isInExecute — never invoked.
  cases.push([
    "isInExecute negative no execute",
    () => {
      const msgs = [
        { role: "user", content: "hi" },
        { role: "assistant", content: [{ type: "text", text: "hello" }] },
      ];
      return isInExecute(msgs) === false;
    },
  ]);

  // 6. hasOverrideAuthorization — request + auth.
  cases.push([
    "override accepted",
    () => {
      const msgs = [
        {
          role: "assistant",
          content: [{ type: "text", text: "[OVERRIDE-REQUEST] foo/bar.ts edit\n" }],
        },
        { role: "user", content: "override approved" },
      ];
      return hasOverrideAuthorization(msgs, "foo/bar.ts") === true;
    },
  ]);

  // 7. hasOverrideAuthorization — request without auth.
  cases.push([
    "override rejected (no auth)",
    () => {
      const msgs = [
        {
          role: "assistant",
          content: [{ type: "text", text: "[OVERRIDE-REQUEST] foo/bar.ts edit" }],
        },
        { role: "user", content: "ok thanks" },
      ];
      return hasOverrideAuthorization(msgs, "foo/bar.ts") === false;
    },
  ]);

  // 8. extractTags — zero tags.
  cases.push([
    "extractTags zero",
    () => extractTags("plain prose with no tags").length === 0,
  ]);

  // 9. isBannedPhraseTarget — positive cases.
  cases.push([
    "banned-target walk-evidence",
    () => isBannedPhraseTarget("clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md"),
  ]);
  cases.push([
    "banned-target neutral-eye-audits nested",
    () => isBannedPhraseTarget("clients/encore/specs_planning/_internal/neutral-eye-audits/module-x/audit.md"),
  ]);
  cases.push([
    "banned-target field-inventories nested",
    () => isBannedPhraseTarget("clients/encore/specs_planning/_internal/field-inventories/foo-2026-05-15.md"),
  ]);
  cases.push([
    "banned-target plans/pending",
    () => isBannedPhraseTarget("plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_A.md"),
  ]);
  cases.push([
    "banned-target plans backslash (Windows)",
    () => isBannedPhraseTarget("plans\\pending\\SUBPLAN_FOO.md"),
  ]);

  // 10. isBannedPhraseTarget — exemptions.
  cases.push([
    "banned-target EXEMPT browser-tool rule",
    () => !isBannedPhraseTarget(".claude/rules/browser-tool.md"),
  ]);
  cases.push([
    "banned-target EXEMPT agent-mistakes",
    () => !isBannedPhraseTarget("clients/encore/specs_planning/_internal/agent-mistakes.md"),
  ]);
  cases.push([
    "banned-target EXEMPT this plan",
    () => !isBannedPhraseTarget("plans/done/PLAN_FIX_CLI_HALLUCINATION_AND_SSL_A_BLOCKER.md"),
  ]);
  cases.push([
    "banned-target EXEMPT feedback memory",
    () => !isBannedPhraseTarget("/home/rutvik/.claude/projects/foo/memory/feedback_browser_tool_selection.md"),
  ]);

  // 11. isBannedPhraseTarget — non-target paths.
  cases.push([
    "banned-target negative src/",
    () => !isBannedPhraseTarget("src/components/foo.ts"),
  ]);
  cases.push([
    "banned-target negative clients/encore/specs/",
    () => !isBannedPhraseTarget("clients/encore/specs/foo.spec.ts"),
  ]);

  // 12. scanBannedPhrases — positive matches.
  cases.push([
    "scan matches Section 0 Live-Walk Blocker",
    () => scanBannedPhrases("## Section 0 — Live-Walk Blocker\nstuff").length > 0,
  ]);
  cases.push([
    "scan matches UNFILLED-BLOCKED-SECTION",
    () => scanBannedPhrases("here is UNFILLED-BLOCKED-SECTION placeholder").length > 0,
  ]);
  cases.push([
    "scan matches structural blocker",
    () => scanBannedPhrases("This is a structural blocker for the run").length > 0,
  ]);
  cases.push([
    "scan matches provisioning invariant",
    () => scanBannedPhrases("violates the provisioning invariant").length > 0,
  ]);
  cases.push([
    "scan matches Path N NOT taken phrase",
    () => scanBannedPhrases("Two paths: Path 1 (NOT taken in this session)").length > 0,
  ]);
  cases.push([
    "scan matches cannot complete strict line single session",
    () => scanBannedPhrases("subplan cannot complete its strict-line acceptance criteria in this single session").length > 0,
  ]);

  // 13. scanBannedPhrases — clean content.
  cases.push([
    "scan clean prose passes",
    () => scanBannedPhrases("Normal documentation about CLI commands.").length === 0,
  ]);

  // 14. extractWriteContent — Edit reads new_string only.
  cases.push([
    "extractWriteContent Edit returns new_string",
    () => {
      const r = extractWriteContent("Edit", { old_string: "banned: Section 0 — Live-Walk Blocker", new_string: "clean replacement" });
      return r.length === 1 && r[0] === "clean replacement";
    },
  ]);
  cases.push([
    "extractWriteContent Edit ignores old_string",
    () => {
      // Deletion case: new_string is empty, old_string has banned content.
      // Scan should NOT trip — gates deletions in.
      const r = extractWriteContent("Edit", { old_string: "Section 0 — Live-Walk Blocker text", new_string: "" });
      return r.length === 1 && scanBannedPhrases(r[0]).length === 0;
    },
  ]);
  cases.push([
    "extractWriteContent Write returns content",
    () => {
      const r = extractWriteContent("Write", { content: "the file body" });
      return r.length === 1 && r[0] === "the file body";
    },
  ]);
  // 15. isSpecPath — positive + negative.
  cases.push([
    "isSpecPath positive .spec.ts",
    () => isSpecPath("clients/encore/specs/locations/location-shared-setup.spec.ts"),
  ]);
  cases.push([
    "isSpecPath positive .test.ts",
    () => isSpecPath("apps/web/src/utils/foo.test.ts"),
  ]);
  cases.push([
    "isSpecPath positive Windows backslash",
    () => isSpecPath("clients\\encore\\specs\\foo.spec.ts"),
  ]);
  cases.push([
    "isSpecPath negative page object",
    () => !isSpecPath("clients/encore/src/pages/local-office/local-office-settings.page.ts"),
  ]);
  cases.push([
    "isSpecPath negative markdown",
    () => !isSpecPath("plans/pending/PLAN_FOO.md"),
  ]);

  // 16. scanSkipFixmeWithoutBugCite — denies skip/fixme without BUG- cite.
  cases.push([
    "skip-fixme deny: test.skip with no cite",
    () => {
      const c = "test.skip('TC-001 something', async ({ page }) => { /* body */ });";
      return scanSkipFixmeWithoutBugCite(c).length === 1;
    },
  ]);
  cases.push([
    "skip-fixme deny: test.fixme with no cite",
    () => {
      const c = "test.fixme('TC-002 broken', async ({ page }) => {});";
      return scanSkipFixmeWithoutBugCite(c).length === 1;
    },
  ]);
  cases.push([
    "skip-fixme deny: two skips with no cite",
    () => {
      const c = "test.skip('TC-A', () => {});\ntest.skip('TC-B', () => {});";
      return scanSkipFixmeWithoutBugCite(c).length === 2;
    },
  ]);

  // 17. scanSkipFixmeWithoutBugCite — allows skip/fixme with BUG- cite.
  cases.push([
    "skip-fixme allow: same-line trailing comment",
    () => {
      const c = "test.skip('TC-001', async () => {}); // BUG-LOC-SHR-001 appears for role X";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme allow: previous-line comment",
    () => {
      const c = "// BUG-LOC-SHR-001 — net-zero revert bug, see ssl-007 plan\ntest.skip('TC-001', () => {});";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme allow: next-line comment",
    () => {
      const c = "test.fixme('TC-002', () => {});\n// BUG-LOC-NTS-003 — deferred until app fix";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme allow: inline BUG cite in test body",
    () => {
      const c = "test.skip('TC-003 BUG-MGH-001 reproducer', () => {});";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);

  // 18. scanSkipFixmeWithoutBugCite — ignores non-skip code.
  cases.push([
    "skip-fixme noop: plain test()",
    () => {
      const c = "test('TC-001 normal', async ({ page }) => { await page.goto('/'); });";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme noop: test.describe()",
    () => {
      const c = "test.describe('Block A', () => { test('TC-001', () => {}); });";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme noop: empty content",
    () => scanSkipFixmeWithoutBugCite("").length === 0,
  ]);

  // 19. scanSkipFixmeWithoutBugCite — mixed: some have cite, some don't.
  cases.push([
    "skip-fixme partial: cite on one, missing on other",
    () => {
      const c = [
        "test.skip('TC-A', () => {}); // BUG-LOC-001",
        "test.skip('TC-B', () => {});",
      ].join("\n");
      // First has cite (allow), second doesn't (offender). But adjacency check
      // means second line also sees prev line which has BUG-LOC-001 → ALLOWED.
      // To test the deny path, separate them.
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme partial: distant skips, only one cited",
    () => {
      const c = [
        "test.skip('TC-A', () => {}); // BUG-LOC-001",
        "",
        "// unrelated comment",
        "",
        "test.skip('TC-B', () => {});",
      ].join("\n");
      // Second skip has no BUG- in prev/same/next line → 1 offender.
      return scanSkipFixmeWithoutBugCite(c).length === 1;
    },
  ]);

  // 20. isSpecPath — node_modules exclusion (false-positive guard).
  cases.push([
    "isSpecPath excludes node_modules .test.ts",
    () => !isSpecPath("node_modules/zod/src/v3/tests/array.test.ts"),
  ]);
  cases.push([
    "isSpecPath excludes node_modules .spec.ts (backslash)",
    () => !isSpecPath("C:\\proj\\node_modules\\pkg\\foo.spec.ts"),
  ]);
  cases.push([
    "isSpecPath excludes nested node_modules",
    () => !isSpecPath("website/backend/node_modules/zod/src/foo.test.ts"),
  ]);

  // 21. scanSkipFixmeNetNewWithoutBugCite — grandfather behavior.
  cases.push([
    "net-new deny: NEW skip without cite (oldContent empty)",
    () => {
      const newC = "test.skip('TC-NEW', () => {});";
      return scanSkipFixmeNetNewWithoutBugCite(newC, "").length === 1;
    },
  ]);
  cases.push([
    "net-new allow: same skip line exists verbatim in oldContent (grandfathered)",
    () => {
      const oldC = "  test.skip('TC-OLD', () => {});";
      const newC = "  test.skip('TC-OLD', () => {});";
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 0;
    },
  ]);
  cases.push([
    "net-new allow: editing AROUND existing skip (skip line preserved verbatim)",
    () => {
      const oldC = [
        "// preamble",
        "  test.skip('TC-OLD-SSL-007', 'Blocked by app bug', () => {});",
        "// trailer",
      ].join("\n");
      const newC = [
        "// preamble UPDATED",
        "  test.skip('TC-OLD-SSL-007', 'Blocked by app bug', () => {});",
        "// trailer UPDATED",
      ].join("\n");
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 0;
    },
  ]);
  cases.push([
    "net-new deny: NEW skip added alongside existing-grandfathered skip",
    () => {
      const oldC = "  test.skip('TC-OLD', 'Blocked by app bug', () => {});";
      const newC = [
        "  test.skip('TC-OLD', 'Blocked by app bug', () => {});",
        "  test.skip('TC-FRESH', 'no bug filed', () => {});",
      ].join("\n");
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 1;
    },
  ]);
  cases.push([
    "net-new allow: NEW skip added WITH BUG- cite",
    () => {
      const oldC = "";
      const newC = [
        "// BUG-LOC-SSL-007 — net-zero revert",
        "  test.skip('TC-NEW', () => {});",
      ].join("\n");
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 0;
    },
  ]);
  cases.push([
    "net-new deny: skip line text CHANGED (reason rewrite) → no longer grandfathered",
    () => {
      const oldC = "  test.skip('TC-OLD', 'old reason', () => {});";
      const newC = "  test.skip('TC-OLD', 'new reason text', () => {});";
      // Text differs → treated as net-new. Documents the workflow friction
      // explicitly: reason rewrites on existing skips require a BUG- cite
      // OR override. Documented behavior, not a bug.
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 1;
    },
  ]);

  // 22. extractWriteContentPairs — Edit returns paired old+new.
  cases.push([
    "pairs Edit returns {newContent, oldContent}",
    () => {
      const r = extractWriteContentPairs("Edit", {
        old_string: "test.skip('TC-OLD', () => {});",
        new_string: "test.skip('TC-OLD', () => {});\ntest.skip('TC-FRESH', () => {});",
      });
      return r.length === 1
        && r[0].oldContent.includes("TC-OLD")
        && r[0].newContent.includes("TC-FRESH");
    },
  ]);
  cases.push([
    "pairs Write reads on-disk oldContent when file exists",
    () => {
      // Self-test runs in same process as the hook lib file → use this file's
      // own path as a known-existing disk file.
      const selfPath = fileURLToPath(import.meta.url);
      const r = extractWriteContentPairs("Write", { file_path: selfPath, content: "stub" });
      return r.length === 1 && r[0].newContent === "stub" && r[0].oldContent.length > 0;
    },
  ]);
  cases.push([
    "pairs Write returns empty oldContent for nonexistent file (net-new file)",
    () => {
      const r = extractWriteContentPairs("Write", {
        file_path: "C:/does/not/exist/zzz.spec.ts",
        content: "new file body",
      });
      return r.length === 1 && r[0].newContent === "new file body" && r[0].oldContent === "";
    },
  ]);

  // 23. extractCaptureEntries — two-mode dispatch (TodoWrite vs TaskList post-rename).
  cases.push([
    "extractCaptureEntries TaskList wrapped {tasks: [...]} returns inner array",
    () => {
      // Production tool_response shape, verified 2026-05-26 across 246
      // transcript JSONLs (11/11 conformant; 0 divergent).
      const wrapped = { tasks: [
        { id: "1", subject: "[ceremony] x", status: "pending", blockedBy: [] },
        { id: "2", subject: "untagged", status: "pending", blockedBy: [] },
      ] };
      const r = extractCaptureEntries("TaskList", {}, wrapped);
      return Array.isArray(r) && r.length === 2 && r[0].subject === "[ceremony] x";
    },
  ]);
  cases.push([
    "extractCaptureEntries TaskList non-array tool_response returns null (fail-open trigger)",
    () => {
      // String, object-without-tasks, null, wrapped-with-non-array-tasks, and
      // wrapped-with-null-tasks all return null → handleCapture fails-open.
      return extractCaptureEntries("TaskList", {}, "not an array") === null
        && extractCaptureEntries("TaskList", {}, { not: "array" }) === null
        && extractCaptureEntries("TaskList", {}, null) === null
        && extractCaptureEntries("TaskList", {}, { tasks: "not-an-array" }) === null
        && extractCaptureEntries("TaskList", {}, { tasks: null }) === null;
    },
  ]);
  cases.push([
    "extractEntryProbe TaskList uses subject only (no activeForm in response)",
    () => {
      // Tagged TaskList subject → tag is found.
      const tagged = extractEntryProbe("TaskList", { subject: "[manual](Phase 1) settings.json matcher" });
      const taggedHit = extractTags(tagged).length > 0;
      // Untagged TaskList subject → no tag found.
      const untagged = extractEntryProbe("TaskList", { subject: "plain prose with no tag" });
      const untaggedHit = extractTags(untagged).length > 0;
      // TodoWrite legacy probe concatenates content + activeForm.
      const legacy = extractEntryProbe("TodoWrite", { content: "do work", activeForm: "doing [ceremony] work" });
      const legacyHit = extractTags(legacy).length > 0;
      return taggedHit && !untaggedHit && legacyHit;
    },
  ]);
  cases.push([
    "extractCaptureEntries TaskList defensive flat-array fallback (legacy v14 shape)",
    () => {
      // If a future harness flattens the payload to a top-level array, take it.
      // Documents the second branch of extractCaptureEntries' TaskList handler.
      const flat = [{ id: "1", subject: "x", status: "pending", blockedBy: [] }];
      const r = extractCaptureEntries("TaskList", {}, flat);
      return Array.isArray(r) && r.length === 1 && r[0].subject === "x";
    },
  ]);

  // 18. File-driven fixture consumption (SUBPLAN_XLSX_PREP_01 Phase 6a, 2026-05-26).
  // The 6 fixtures under pipeline/tests/hooks/fixtures/ were previously
  // illustrative reference payloads with no test harness consuming them. The
  // assertions below now actually LOAD each fixture from disk and exercise it
  // through the relevant hook helper so the files become consumed (not dead).
  // Per stale-file-verification-2026-05-26.md item #1 AMBIGUOUS resolution.
  const FIXTURE_DIR = join(REPO_ROOT, "pipeline", "tests", "hooks", "fixtures");
  const tryReadJsonFixture = (rel) => {
    const fp = join(FIXTURE_DIR, rel);
    if (!existsSync(fp)) return null;
    try {
      return JSON.parse(readFileSync(fp, "utf8"));
    } catch (_e) {
      return null;
    }
  };
  const tryReadJsonlFixture = (rel) => {
    const fp = join(FIXTURE_DIR, rel);
    if (!existsSync(fp)) return null;
    try {
      return readFileSync(fp, "utf8")
        .split(/\r?\n/)
        .filter((l) => l.trim().length > 0)
        .map((l) => JSON.parse(l));
    } catch (_e) {
      return null;
    }
  };

  cases.push([
    "fixture v12-no-todo-marker-active: Edit payload shape (parses + key fields)",
    () => {
      const d = tryReadJsonFixture("v12-no-todo-marker-active.json");
      return (
        d !== null &&
        d.tool_name === "Edit" &&
        typeof d.session_id === "string" &&
        typeof d.transcript_path === "string" &&
        d.transcript_path.endsWith("transcript-in-execute.jsonl")
      );
    },
  ]);

  cases.push([
    "fixture v13-capture-payload: TodoWrite with every todo TAG_RE-tagged",
    () => {
      const d = tryReadJsonFixture("v13-capture-payload.json");
      if (d === null) return false;
      if (d.tool_name !== "TodoWrite") return false;
      const todos = d.tool_input && d.tool_input.todos;
      if (!Array.isArray(todos) || todos.length === 0) return false;
      // Every todo's content (legacy probe) must match TAG_RE — illustrates the
      // shape the --capture path is supposed to record as fully-tagged.
      return todos.every((t) => TAG_RE.test(t.content));
    },
  ]);

  cases.push([
    "fixture v13-todo-tagged-then-edit: Edit follow-up payload after tagged TodoWrite",
    () => {
      const d = tryReadJsonFixture("v13-todo-tagged-then-edit.json");
      return (
        d !== null &&
        d.tool_name === "Edit" &&
        typeof d.tool_input === "object" &&
        typeof d.tool_input.file_path === "string"
      );
    },
  ]);

  cases.push([
    "fixture v14-tasklist-capture-payload: TaskList tool_response shape",
    () => {
      const d = tryReadJsonFixture("v14-tasklist-capture-payload.json");
      if (d === null) return false;
      if (d.tool_name !== "TaskList") return false;
      // Either nested .tool_response.tasks (current shape) OR top-level array
      // (legacy v14 flat shape) — both are illustrative of valid harness payloads.
      const tasks =
        (d.tool_response && Array.isArray(d.tool_response.tasks) && d.tool_response.tasks) ||
        (Array.isArray(d.tool_response) && d.tool_response) ||
        null;
      return Array.isArray(tasks) && tasks.length > 0 && typeof tasks[0].subject === "string";
    },
  ]);

  cases.push([
    "fixture transcript-in-execute.jsonl: isInExecute returns true",
    () => {
      const msgs = tryReadJsonlFixture("transcript-in-execute.jsonl");
      return Array.isArray(msgs) && msgs.length > 0 && isInExecute(msgs) === true;
    },
  ]);

  cases.push([
    "fixture transcript-in-execute-with-todo.jsonl: isInExecute true + TodoWrite mention",
    () => {
      const msgs = tryReadJsonlFixture("transcript-in-execute-with-todo.jsonl");
      if (!Array.isArray(msgs) || msgs.length === 0) return false;
      if (isInExecute(msgs) !== true) return false;
      // Confirm the transcript mentions the TodoWrite event (capture trigger).
      const serialized = JSON.stringify(msgs);
      return serialized.includes("TodoWrite") || serialized.includes("Built TodoWrite");
    },
  ]);

  let passed = 0;
  let failed = 0;
  for (const [name, fn] of cases) {
    let ok = false;
    try {
      ok = !!fn();
    } catch (e) {
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
}
