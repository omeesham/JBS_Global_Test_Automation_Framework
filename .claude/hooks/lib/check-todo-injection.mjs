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
//   --validate  PreToolUse on Edit|Write|NotebookEdit|MultiEdit. Decision flow:
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

const MUTATION_TOOLS = new Set(["Edit", "Write", "NotebookEdit", "MultiEdit"]);

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

function handleCapture(payload, sessionId) {
  const toolInput = payload.tool_input || payload.toolInput || {};
  const todos = Array.isArray(toolInput.todos) ? toolInput.todos : [];

  const tagsPerItem = [];
  const untaggedIndices = [];
  let taggedCount = 0;

  todos.forEach((t, idx) => {
    const content = String(t.content || "");
    const activeForm = String(t.activeForm || "");
    const probe = `${content} ${activeForm}`;
    const tags = extractTags(probe);
    tagsPerItem.push(tags);
    if (tags.length > 0) taggedCount++;
    else untaggedIndices.push(idx);
  });

  const state = {
    session_id: sessionId,
    captured_at: new Date().toISOString(),
    count: todos.length,
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
