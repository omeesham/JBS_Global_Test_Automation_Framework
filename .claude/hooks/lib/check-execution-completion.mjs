#!/usr/bin/env node
// check-execution-completion.mjs — Stop-hook detector for the "silent checkpoint"
// failure mode (LR-060 / GAP-A / GAP-B).
//
// THE HOLE THIS CLOSES
//   Every plan-closure gate (LR-055 C1-C6, the Per-Identity Matrix audit, LR-040)
//   keys on the `Status: DONE` flip. An /execute that does partial work, leaves the
//   plan PENDING, writes a chat summary, and stops NEVER trips any of them — the
//   mandated phases can be silently skipped. This is exactly how the 2026-06-18
//   Pricing FCC session shipped with its Phase 0.5b baseline walk un-run.
//
//   This Stop hook fires when a session ends inside an active /execute of a plan
//   file and a mandated artifact that plan declared is missing on disk — with no
//   `## Deferral Authorization` block recorded. It is a DETECTIVE + FORCING-FUNCTION,
//   not a hard block: Stop hooks cannot veto session end. It writes a warning to
//   `.claude/state/execution-completion-warnings-<sid>.json` (read by /final-q +
//   /audit, which floor the verdict) and emits one concise stdout line.
//
// SCOPE (intentionally narrow — keeps it low-noise, unlike the removed blanket
// final-q Stop hook, LR-042 §A): fires ONLY when
//   (a) the transcript shows an active /execute of a *plan file* (not ad-hoc, not
//       a conversational stop), AND
//   (b) the plan's Status is not DONE, AND
//   (c) the plan has no `## Deferral Authorization` block, AND
//   (d) a dated FCC `_internal` artifact the plan names is genuinely absent.
// It NEVER fires on ad-hoc `/execute "do X"`, conversational stops, or DONE plans.
//
// MODE: the bash wrapper passes `--validate` as argv[2] (Stop hooks have no
// capture phase). Any non-`--no-run` invocation runs the hook.
//
// FAIL-OPEN: any error → logged to .claude/state/hook-failures.log, silent (Stop
// hooks carry no permissionDecision). A broken gate must never wedge the session.
//
// Companion: .claude/hooks/execution-completion-gate.sh (wrapper, Stop array in
// settings.json); tests in .claude/hooks/lib/test-execution-completion-fixtures.mjs.
// Rule body: LR-060 in .claude/rules/pipeline.md.

import {
  readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, appendFileSync, readdirSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, isAbsolute } from "node:path";
import { tmpdir } from "node:os";
import { coverageVerdict } from "../../../scripts/walk-coverage/lib/coverage-manifest.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const STATE_DIR = join(REPO_ROOT, ".claude", "state");
const FAILURE_LOG = join(STATE_DIR, "hook-failures.log");

const MAX_MESSAGES = 2000;

// Dated FCC `_internal` artifacts a subplan MUST emit. A plan that names one of
// these and then doesn't produce it is the silent-checkpoint signature.
const ARTIFACT_RX =
  /clients\/[^/\s)`'"]+\/specs_planning\/_internal\/(?:old-site-baseline|false-green-sweeps|field-inventories|field-case-catalogs)\/[^\s)`'"*]+\.md|clients\/[^/\s)`'"]+\/specs_planning\/_internal\/phase-0-verification-[^\s)`'"*]+\.md/g;

// Trailing date or <PLACEHOLDER> on a dated-artifact filename stem.
const DATE_TAIL_RX = /-(?:\d{4}-\d{2}-\d{2}|<[^>]+>)$/;

// Walk artifacts subject to the coverage-completeness 2nd branch (M5 / LR-062): field-inventory +
// old-site-baseline. These can be present-but-INCOMPLETE (the partial-walk-taken-as-done case the
// existence check alone cannot see). Shared verdict logic with closure Cx → cannot drift.
const WALK_COVERAGE_RX = /(?:field-inventories|old-site-baseline)\//;

// ---------------------------------------------------------------------------
// Pure helpers (exported — exercised by test-execution-completion-fixtures.mjs)
// ---------------------------------------------------------------------------

// Most-recent /execute Skill with no later /final-q Skill → returns {startIdx, args}.
// final-q after execute closes the scope → null (mirrors check-todo-injection isInExecute).
export function findActiveExecuteWindow(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const startScan = Math.max(0, messages.length - MAX_MESSAGES);
  let execIdx = -1;
  let execArgs = "";
  for (let i = messages.length - 1; i >= startScan; i--) {
    const msg = messages[i];
    if (!msg || msg.role !== "assistant" || !Array.isArray(msg.content)) continue;
    let found = false;
    for (const c of msg.content) {
      if (c?.type !== "tool_use" || c.name !== "Skill") continue;
      const skill = (c.input?.skill || "").toLowerCase();
      if (skill === "execute") {
        execIdx = i;
        execArgs = String(c.input?.args || "");
        found = true;
        break;
      }
    }
    if (found) break;
  }
  if (execIdx === -1) return null;
  for (let i = execIdx + 1; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || msg.role !== "assistant" || !Array.isArray(msg.content)) continue;
    for (const c of msg.content) {
      if (c?.type !== "tool_use" || c.name !== "Skill") continue;
      if ((c.input?.skill || "").toLowerCase() === "final-q") return null; // scope closed
    }
  }
  return { startIdx: execIdx, args: execArgs };
}

// First `*.md` token in the /execute args string (the plan file reference).
export function extractPlanFilename(args) {
  if (!args) return "";
  const m = String(args).match(/[\w./\\-]+\.md/);
  return m ? m[0].replace(/\\/g, "/") : "";
}

export function resolvePlanPath(planRef, repoRoot = REPO_ROOT) {
  if (!planRef) return "";
  const candidates = [];
  if (isAbsolute(planRef)) candidates.push(planRef);
  else {
    candidates.push(join(repoRoot, planRef));
    const base = planRef.split("/").pop();
    candidates.push(join(repoRoot, "plans", "pending", base));
    candidates.push(join(repoRoot, "plans", "done", base));
  }
  for (const c of candidates) if (existsSync(c)) return c;
  return "";
}

export function extractMandatedArtifacts(planText) {
  if (!planText) return [];
  const out = new Set();
  const re = new RegExp(ARTIFACT_RX.source, "g");
  let m;
  while ((m = re.exec(planText)) !== null) out.add(m[0].replace(/\\/g, "/"));
  return [...out];
}

export function deriveStem(artifactRel) {
  const base = String(artifactRel).split("/").pop().replace(/\.md$/, "");
  return base.replace(DATE_TAIL_RX, "");
}

// Satisfied if the literal file exists OR (for dated/placeholder names) any
// <stem>-*.md exists in its directory.
export function artifactSatisfied(artifactRel, repoRoot = REPO_ROOT) {
  if (!/[<>]/.test(artifactRel) && existsSync(join(repoRoot, artifactRel))) return true;
  const parts = String(artifactRel).split("/");
  const dirRel = parts.slice(0, -1).join("/");
  const dirAbs = join(repoRoot, dirRel);
  if (!existsSync(dirAbs)) return false;
  const stem = deriveStem(artifactRel);
  if (!stem) return false;
  const stemRx = new RegExp("^" + stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-.*\\.md$");
  try {
    return readdirSync(dirAbs).some((f) => stemRx.test(f));
  } catch {
    return false;
  }
}

export function hasDeferralAuthorization(planText) {
  return /^#{1,6}\s+Deferral Authorization\b/im.test(planText || "");
}

export function parsePlanStatus(planText) {
  const m = (planText || "").match(/\*\*Status\*\*:\s*([A-Za-z][A-Za-z-]*)/);
  return m ? m[1].toUpperCase() : "";
}

// Pure decision over loaded transcript messages. I/O confined to plan-read +
// artifact existence (both via repoRoot, injectable for tests).
export function decide({ messages, repoRoot = REPO_ROOT } = {}) {
  const win = findActiveExecuteWindow(messages);
  if (!win) return { warn: false, reason: "no-active-execute" };
  const planRef = extractPlanFilename(win.args);
  if (!planRef) return { warn: false, reason: "no-plan-file" }; // ad-hoc /execute
  const planPath = resolvePlanPath(planRef, repoRoot);
  if (!planPath) return { warn: false, reason: "plan-not-found", planRef };
  let planText = "";
  try {
    planText = readFileSync(planPath, "utf8");
  } catch {
    return { warn: false, reason: "plan-unreadable", planRef };
  }
  const status = parsePlanStatus(planText);
  if (status === "DONE") return { warn: false, reason: "plan-done", planRef };
  if (hasDeferralAuthorization(planText)) return { warn: false, reason: "deferral-authorized", planRef };
  const artifacts = extractMandatedArtifacts(planText);
  const missing = artifacts.filter((a) => !artifactSatisfied(a, repoRoot));

  // 2nd branch (M5 / LR-062): existing walk artifacts (field-inventory / old-site-baseline) that
  // are coverage-INCOMPLETE — present on disk but Coverage_Ratio<100% / CrossCheck≠clean / PARTIAL /
  // undispositioned rows. The existence filter above only catches MISSING artifacts; this catches
  // the present-but-incomplete partial-walk-taken-as-done case (the 2026-06-18 Pricing FCC signature).
  const incompleteCoverage = [];
  for (const a of artifacts) {
    if (!WALK_COVERAGE_RX.test(a)) continue;
    const abs = join(repoRoot, a);
    if (!existsSync(abs)) continue;        // missing → already captured above
    let txt = "";
    try { txt = readFileSync(abs, "utf8"); } catch { continue; }
    // artifactPath enables the provenance sub-gate's evidence verification here too, so the detective
    // Stop hook (not just closure Cx) catches oracle / missing-evidence on observation-claiming rows.
    const v = coverageVerdict(txt, undefined, { artifactPath: abs }); // grandfather + no-manifest handled inside (not-applicable)
    if (v.applicable && !v.complete) incompleteCoverage.push({ artifact: a, reasons: v.reasons });
  }

  if (missing.length === 0 && incompleteCoverage.length === 0)
    return { warn: false, reason: "all-artifacts-present", planRef };
  return { warn: true, planRef, planPath, status, missing, incompleteCoverage };
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

  const sessionId = payload.session_id || payload.sessionId || "unknown";
  const transcriptPath = payload.transcript_path || payload.transcriptPath || "";

  try {
    const messages = safeLoadTranscript(transcriptPath);
    const verdict = decide({ messages });
    if (!verdict.warn) return;

    ensureStateDir();
    const stateFile = join(STATE_DIR, `execution-completion-warnings-${safeFilename(sessionId)}.json`);
    const missing = verdict.missing || [];
    const incomplete = verdict.incompleteCoverage || [];
    appendStateEntry(stateFile, {
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      plan: verdict.planRef,
      plan_status: verdict.status,
      missing_artifacts: missing,
      incomplete_coverage: incomplete,
      transcript_path: transcriptPath || "",
    });

    const parts = [];
    if (missing.length) {
      parts.push(
        `${missing.length} mandated artifact(s) MISSING (${missing.slice(0, 3).map(shortName).join(", ")}` +
          `${missing.length > 3 ? ` +${missing.length - 3}` : ""})`
      );
    }
    if (incomplete.length) {
      parts.push(
        `${incomplete.length} walk artifact(s) coverage-INCOMPLETE per LR-062 ` +
          `(${incomplete.slice(0, 3).map((i) => shortName(i.artifact)).join(", ")}` +
          `${incomplete.length > 3 ? ` +${incomplete.length - 3}` : ""})`
      );
    }
    process.stdout.write(
      `[/execute WARN] ${verdict.planRef} (Status ${verdict.status}, no "## Deferral Authorization" block): ` +
        `${parts.join("; ")}. Silent-checkpoint / partial-walk risk per LR-060 — complete the phase(s) or ` +
        `record a user-signed Deferral Authorization block before ending. Persisted to ${shortPath(stateFile)}.\n`
    );
  } catch (e) {
    failOpen(`decide threw: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// I/O helpers (transcript load + state file, mirrored from check-rca-verdict.mjs)
// ---------------------------------------------------------------------------

function safeLoadTranscript(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return [];
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
        /* skip bad line */
      }
    }
    return messages;
  } catch {
    return [];
  }
}

function appendStateEntry(target, entry) {
  let existing = [];
  if (existsSync(target)) {
    try {
      const parsed = JSON.parse(readFileSync(target, "utf8"));
      if (Array.isArray(parsed)) existing = parsed;
    } catch {
      existing = [];
    }
  }
  existing.push(entry);
  atomicWrite(target, JSON.stringify(existing, null, 2));
}

function atomicWrite(target, contents) {
  const tmp = join(tmpdir(), `exec-completion-${process.pid}-${Date.now()}.tmp`);
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

function shortName(rel) {
  return String(rel).split("/").pop();
}

function failOpen(reason) {
  try {
    ensureStateDir();
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} check-execution-completion.mjs ${reason}\n`);
  } catch {
    /* swallow — fail-OPEN must not throw */
  }
  // Stop hook: silent on failure (no permissionDecision to emit).
}
