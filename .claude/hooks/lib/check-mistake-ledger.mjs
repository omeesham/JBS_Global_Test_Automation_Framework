#!/usr/bin/env node
// check-mistake-ledger.mjs — Stop-hook detector for missing mistake attestation.
//
// Closes the "voluntary self-reporting" gap: /reflect + /final-q now require a
// mandatory attestation block ("Mistakes this session: N" or "none — 6 triggers
// checked"), but a session that skips /final-q entirely can still end silently.
// This hook fires on Stop events and warns when a mutating session ends with
// no mistake attestation token in the transcript.
//
// MODES (dispatched by argv[2]):
//
//   --validate  Stop hook. Read transcript, check for mutating tool_use +
//               attestation. WARN + write state file when mutating AND no
//               attestation. Always exits 0 (Stop hooks don't block).
//
//   --self-test Synthetic fixtures (plus temp-file I/O for cleanup test).
//               Exits 0 on pass, 1 on fail.
//
// MODE KNOB (.claude/guardrail-config.json → mistake_ledger_mode):
//   off      — gate disabled (fail-open)
//   announce — warn + persist state entry (mode=announce, verdict floor YELLOW)
//              + telemetry verdict=warn
//   deny     — escalation: same as announce (Stop hooks never veto — LR-060)
//              but persists mode=deny in state entry (verdict floor RED) and
//              emits warn-deny in telemetry. Distinct from announce in floor only.
//   unknown  — unrecognized or missing key fails SAFE to announce (noisy > silent)
//
// DETECTION LOGIC:
//   mutating  = transcript contains any Edit/Write/NotebookEdit/create tool_use
//               (assistant role)
//   attested  = transcript contains "Mistakes this session:" OR
//               "none — 6 triggers checked" in assistant text
//   warn when: (mode == announce OR mode == deny) AND mutating AND NOT attested
//   verdict floor: YELLOW (announce) | RED (deny)
//
// FAIL-OPEN: any uncaught exception → logged to .claude/state/hook-failures.log,
// silent exit 0. A broken gate must never wedge the session.
//
// TELEMETRY: on warn, appends one line to .claude/state/gate-fires.log:
//   mistake-ledger-gate, <ISO timestamp>, warn, <session-id>
//
// Sev=S1 (silent omission of session mistake record surviving to session end).
// Graduating incident: 2026-07-10 owner directive — /reflect +/final-q prose
// mandate is Tier-3 (weakest layer) without a structural backstop.
// Rule body: LR-069 §3.2 in .claude/rules/guardrail-policy.md.
//
// Companion: .claude/hooks/mistake-ledger-gate.sh (wrapper). State file:
// .claude/state/mistake-ledger-warnings-<sid>.json (read by /final-q + /audit).

import {
  readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, appendFileSync, unlinkSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { safeLoadTranscript } from './hook-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const STATE_DIR = join(REPO_ROOT, ".claude", "state");
const FAILURE_LOG = join(STATE_DIR, "hook-failures.log");
const GATE_FIRES_LOG = join(STATE_DIR, "gate-fires.log");
const GUARDRAIL_CONFIG = join(REPO_ROOT, ".claude", "guardrail-config.json");

const MUTATING_TOOLS = new Set(["Edit", "Write", "NotebookEdit", "create"]);

// Both tokens that the /final-q mandatory attestation block may emit.
const ATTESTATION_PATTERNS = [
  /Mistakes this session:/,
  /none\s+\u2014\s+6 triggers checked/,  // em-dash (—)
  /none\s+--\s+6 triggers checked/,      // fallback: double-hyphen
];

const MAX_MESSAGES = 2000;

// ---------------------------------------------------------------------------
// Pure helpers (exported — exercised by --self-test)
// ---------------------------------------------------------------------------

export function readGateMode(configPath = GUARDRAIL_CONFIG) {
  try {
    const cfg = JSON.parse(readFileSync(configPath, "utf8"));
    const m = cfg.mistake_ledger_mode;
    if (m === "off") return "off";
    if (m === "announce") return "announce";
    if (m === "deny") return "deny";
    return "announce"; // unknown or missing key → fail-SAFE (noisy > silent)
  } catch {
    return "off"; // unreadable/missing config → fail-open (disabled)
  }
}

// Does this transcript contain any mutating tool calls in assistant messages?
export function hasMutatingToolUse(messages) {
  if (!Array.isArray(messages)) return false;
  const startScan = Math.max(0, messages.length - MAX_MESSAGES);
  for (let i = startScan; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || msg.role !== "assistant" || !Array.isArray(msg.content)) continue;
    for (const c of msg.content) {
      if (c?.type === "tool_use" && MUTATING_TOOLS.has(c.name)) return true;
    }
  }
  return false;
}

// Does this transcript contain a mistake attestation in any assistant text?
export function hasAttestationBlock(messages) {
  if (!Array.isArray(messages)) return false;
  const startScan = Math.max(0, messages.length - MAX_MESSAGES);
  for (let i = startScan; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || msg.role !== "assistant" || !Array.isArray(msg.content)) continue;
    for (const c of msg.content) {
      if (c?.type !== "text") continue;
      const text = c.text || "";
      for (const rx of ATTESTATION_PATTERNS) {
        if (rx.test(text)) return true;
      }
    }
  }
  return false;
}

// Main decision: returns {warn: bool, reason: string}.
// Pure — no I/O (injectable repoRoot/mode for tests).
export function decide({ messages, mode = "announce" } = {}) {
  if (mode === "off") return { warn: false, reason: "mode-off" };
  if (!hasMutatingToolUse(messages)) return { warn: false, reason: "non-mutating" };
  if (hasAttestationBlock(messages)) return { warn: false, reason: "attested" };
  if (mode === "deny") return { warn: true, reason: "mutating-no-attestation-deny" };
  return { warn: true, reason: "mutating-no-attestation" };
}

// Clears stale mid-session warning file for the given session (bug fix: attested
// sessions must not leave a warning that floors a future session's verdict).
// Fail-open: any exception is swallowed. Returns true if a file was deleted.
export function clearStaleWarning(stateDir, sessionId) {
  try {
    const f = join(stateDir, `mistake-ledger-warnings-${safeFilename(sessionId)}.json`);
    if (existsSync(f)) { unlinkSync(f); return true; }
  } catch { /* fail-open */ }
  return false;
}

// ---------------------------------------------------------------------------
// Hook entry point (skipped when imported or --no-run)
// ---------------------------------------------------------------------------

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly && process.argv[2] !== "--no-run") {
  if (process.argv[2] === "--self-test") runSelfTest();
  else runHookMode();
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

  try {
    const mode = readGateMode();
    if (mode === "off") return;

    const sessionId = payload.session_id || payload.sessionId || "unknown";
    const transcriptPath = payload.transcript_path || payload.transcriptPath || "";
    const messages = safeLoadTranscript(transcriptPath);

    const verdict = decide({ messages, mode });

    // Bug fix: attested session → delete stale mid-session warning file so it
    // cannot floor a future /final-q verdict after a subsequent non-attest run.
    if (verdict.reason === "attested") {
      clearStaleWarning(STATE_DIR, sessionId);
    }

    if (!verdict.warn) return;

    ensureStateDir();

    // Persist warning for /final-q + /audit to read.
    const stateFile = join(STATE_DIR, `mistake-ledger-warnings-${safeFilename(sessionId)}.json`);
    appendStateEntry(stateFile, {
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      reason: verdict.reason,
      mode,
      transcript_path: transcriptPath || "",
    });

    // Fire telemetry (LR-069 §3.4).
    const telemetryVerdict = mode === "deny" ? "warn-deny" : "warn";
    try {
      appendFileSync(
        GATE_FIRES_LOG,
        `mistake-ledger-gate, ${new Date().toISOString()}, ${telemetryVerdict}, ${sessionId}\n`
      );
    } catch { /* swallow — telemetry must never crash the hook */ }

    const floorNote = mode === "deny" ? "Verdict floor: RED (deny-mode escalation). " : "";
    process.stdout.write(
      `[mistake-ledger WARN] Mutating session ended with no mistake attestation ` +
      `(neither "Mistakes this session:" nor "none \u2014 6 triggers checked" found in transcript). ` +
      `Run /reflect before session end and emit the mandatory Step 4.7 attestation block in /final-q. ` +
      `LR-069 \u00A73.2 \u2014 silence makes mistakes invisible. ${floorNote}` +
      `Persisted to ${shortPath(stateFile)}.\n`
    );
  } catch (e) {
    failOpen(`hook threw: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Self-test (no real I/O except the stale-file-cleanup test)
// ---------------------------------------------------------------------------

function runSelfTest() {
  let pass = 0, fail = 0;
  const t = (label, cond) => {
    if (cond) { pass++; }
    else { console.error(`FAIL: ${label}`); fail++; }
  };

  // hasMutatingToolUse -------------------------------------------------------
  t("empty messages → not mutating",
    !hasMutatingToolUse([]));
  t("null messages → not mutating",
    !hasMutatingToolUse(null));
  t("user-only text message → not mutating",
    !hasMutatingToolUse([{ role: "user", content: [{ type: "text", text: "hi" }] }]));
  t("Read tool_use only → not mutating",
    !hasMutatingToolUse([{
      role: "assistant",
      content: [{ type: "tool_use", name: "Read", input: {} }],
    }]));
  t("Edit tool_use → mutating",
    hasMutatingToolUse([{
      role: "assistant",
      content: [{ type: "tool_use", name: "Edit", input: {} }],
    }]));
  t("Write tool_use → mutating",
    hasMutatingToolUse([{
      role: "assistant",
      content: [{ type: "tool_use", name: "Write", input: {} }],
    }]));
  t("NotebookEdit tool_use → mutating",
    hasMutatingToolUse([{
      role: "assistant",
      content: [{ type: "tool_use", name: "NotebookEdit", input: {} }],
    }]));
  t("create tool_use → mutating",
    hasMutatingToolUse([{
      role: "assistant",
      content: [{ type: "tool_use", name: "create", input: {} }],
    }]));

  // hasAttestationBlock ------------------------------------------------------
  t("empty → not attested",
    !hasAttestationBlock([]));
  t("unrelated text → not attested",
    !hasAttestationBlock([{
      role: "assistant",
      content: [{ type: "text", text: "all done, nothing to note" }],
    }]));
  t("Mistakes this session: present → attested",
    hasAttestationBlock([{
      role: "assistant",
      content: [{ type: "text", text: "**Mistakes this session:** 1 (R-042 S1)" }],
    }]));
  t("none — 6 triggers checked (em-dash) → attested",
    hasAttestationBlock([{
      role: "assistant",
      content: [{ type: "text", text: "none \u2014 6 triggers checked" }],
    }]));
  t("none -- 6 triggers checked (double-hyphen) → attested",
    hasAttestationBlock([{
      role: "assistant",
      content: [{ type: "text", text: "none -- 6 triggers checked" }],
    }]));
  t("attestation in user message → not attested (wrong role)",
    !hasAttestationBlock([{
      role: "user",
      content: [{ type: "text", text: "Mistakes this session: 0" }],
    }]));

  // decide -------------------------------------------------------------------
  const mutatingMsg = { role: "assistant", content: [{ type: "tool_use", name: "Edit", input: {} }] };
  const attestedMsg = { role: "assistant", content: [{ type: "text", text: "none \u2014 6 triggers checked" }] };

  t("mode=off → no warn (gate disabled)",
    decide({ messages: [mutatingMsg], mode: "off" }).warn === false);
  t("non-mutating session → silent pass",
    decide({ messages: [{ role: "user", content: [{ type: "text", text: "hi" }] }], mode: "announce" }).warn === false);
  t("mutating + attested → silent pass",
    decide({ messages: [mutatingMsg, attestedMsg], mode: "announce" }).warn === false);
  t("mutating + no attestation → warn (state persisted in hook mode)",
    decide({ messages: [mutatingMsg], mode: "announce" }).warn === true);

  // deny mode ----------------------------------------------------------------
  t("mode=deny + mutating + no attestation → warn=true (non-veto escalation)",
    decide({ messages: [mutatingMsg], mode: "deny" }).warn === true);
  t("mode=deny + mutating + no attestation → reason=mutating-no-attestation-deny",
    decide({ messages: [mutatingMsg], mode: "deny" }).reason === "mutating-no-attestation-deny");
  t("mode=deny + attested → no warn (same as announce)",
    decide({ messages: [mutatingMsg, attestedMsg], mode: "deny" }).warn === false);
  t("readGateMode: garbage value in config → announce (fail-SAFE)",
    (() => {
      try {
        const tmpCfg = join(tmpdir(), `mistake-test-cfg-${process.pid}.json`);
        writeFileSync(tmpCfg, JSON.stringify({ mistake_ledger_mode: "garbage-value" }));
        const result = readGateMode(tmpCfg);
        unlinkSync(tmpCfg);
        return result === "announce";
      } catch { return false; }
    })());

  // Fail-OPEN: malformed/null input must not crash ----------------------------
  t("null messages in decide → no crash, no warn",
    (() => {
      try { return decide({ messages: null, mode: "announce" }).warn === false; }
      catch { return false; }
    })());
  t("missing content array → no crash, no warn",
    (() => {
      try {
        return decide({
          messages: [{ role: "assistant" }], // no content array
          mode: "announce",
        }).warn === false;
      } catch { return false; }
    })());

  // Bug fix: stale warning file cleanup on attested session ------------------
  t("warning file + attested transcript → file deleted + verdict allow",
    (() => {
      try {
        const testDir = join(tmpdir(), `mistake-test-${process.pid}`);
        mkdirSync(testDir, { recursive: true });
        const testSid = "test-session-stale";
        const warnFile = join(testDir, `mistake-ledger-warnings-${safeFilename(testSid)}.json`);
        writeFileSync(warnFile, JSON.stringify([{ timestamp: "x" }]));
        const v = decide({
          messages: [
            { role: "assistant", content: [{ type: "tool_use", name: "Edit", input: {} }] },
            { role: "assistant", content: [{ type: "text", text: "Mistakes this session: 0" }] },
          ],
          mode: "announce",
        });
        const cleared = clearStaleWarning(testDir, testSid);
        return v.warn === false && v.reason === "attested" && cleared && !existsSync(warnFile);
      } catch { return false; }
    })());

  console.log(`check-mistake-ledger self-test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

// ---------------------------------------------------------------------------
// I/O helpers (state file, mirrored from check-rca-verdict.mjs)
// ---------------------------------------------------------------------------

function appendStateEntry(target, entry) {
  let existing = [];
  if (existsSync(target)) {
    try {
      const parsed = JSON.parse(readFileSync(target, "utf8"));
      if (Array.isArray(parsed)) existing = parsed;
    } catch { existing = []; }
  }
  existing.push(entry);
  atomicWrite(target, JSON.stringify(existing, null, 2));
}

function atomicWrite(target, contents) {
  const tmp = join(tmpdir(), `mistake-ledger-${process.pid}-${Date.now()}.tmp`);
  writeFileSync(tmp, contents);
  renameSync(tmp, target);
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
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} check-mistake-ledger.mjs ${reason}\n`);
  } catch {
    /* swallow — fail-OPEN must not throw */
  }
}
