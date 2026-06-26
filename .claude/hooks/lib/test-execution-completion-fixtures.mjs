#!/usr/bin/env node
// test-execution-completion-fixtures.mjs — fixtures for the silent-checkpoint Stop hook.
//
// Drives check-execution-completion.mjs's exported pure functions + decide() with
// synthetic transcripts and a temp repo (no stdin, no process spawn). Run:
//   node .claude/hooks/lib/test-execution-completion-fixtures.mjs
// Exits 0 on all-pass, 1 on any failure. Modeled on test-jargon-fixtures.mjs.

import {
  findActiveExecuteWindow,
  extractPlanFilename,
  resolvePlanPath,
  extractMandatedArtifacts,
  deriveStem,
  artifactSatisfied,
  hasDeferralAuthorization,
  parsePlanStatus,
  decide,
} from "./check-execution-completion.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cases = [];
const add = (name, fn) => cases.push([name, fn]);

const skillMsg = (skill, args = "") => ({
  role: "assistant",
  content: [{ type: "tool_use", name: "Skill", input: { skill, args } }],
});
const textMsg = (role, text) => ({ role, content: [{ type: "text", text }] });

// ── findActiveExecuteWindow ──────────────────────────────────────────────────
add("window: execute with no final-q is active", () => {
  const w = findActiveExecuteWindow([textMsg("user", "go"), skillMsg("execute", "PLAN.md")]);
  return w && w.args === "PLAN.md";
});
add("window: final-q after execute closes the scope → null", () => {
  return findActiveExecuteWindow([skillMsg("execute", "PLAN.md"), skillMsg("final-q", "")]) === null;
});
add("window: no execute at all → null", () => {
  return findActiveExecuteWindow([textMsg("user", "hi"), skillMsg("audit", "")]) === null;
});
add("window: most-recent execute wins (re-invoke)", () => {
  const w = findActiveExecuteWindow([skillMsg("execute", "OLD.md"), skillMsg("execute", "NEW.md")]);
  return w && w.args === "NEW.md";
});

// ── extractPlanFilename ──────────────────────────────────────────────────────
add("planfile: bare filename", () => extractPlanFilename("SUBPLAN_X.md") === "SUBPLAN_X.md");
add("planfile: path + trailing skill args", () =>
  extractPlanFilename("plans/pending/SUBPLAN_X.md /ultrathink") === "plans/pending/SUBPLAN_X.md");
add("planfile: none (ad-hoc execute)", () => extractPlanFilename("just do the thing") === "");

// ── deriveStem ───────────────────────────────────────────────────────────────
add("stem: dated artifact", () => deriveStem("a/b/pricing-2026-06-18.md") === "pricing");
add("stem: placeholder date", () => deriveStem("a/b/pricing-<DATE>.md") === "pricing");
add("stem: phase-0-verification keeps its prefix", () =>
  deriveStem("x/phase-0-verification-pricing-2026-06-18.md") === "phase-0-verification-pricing");

// ── extractMandatedArtifacts ─────────────────────────────────────────────────
add("artifacts: pulls the 4 dated _internal dirs + phase-0-verification", () => {
  const txt = `
    emit clients/encore/specs_planning/_internal/old-site-baseline/pricing-2026-06-18.md
    and clients/encore/specs_planning/_internal/false-green-sweeps/pricing-2026-06-18.md
    plus clients/encore/specs_planning/_internal/field-inventories/pricing-2026-06-18.md
    and clients/encore/specs_planning/_internal/phase-0-verification-pricing-2026-06-18.md
    (this src/foo.ts path must NOT match)`;
  const a = extractMandatedArtifacts(txt);
  return a.length === 4 && a.every((p) => p.includes("/_internal/")) && !a.some((p) => p.includes("src/foo.ts"));
});

// ── hasDeferralAuthorization / parsePlanStatus ───────────────────────────────
add("deferral: detects heading", () => hasDeferralAuthorization("## Deferral Authorization\nuser ok"));
add("deferral: absent", () => !hasDeferralAuthorization("## Context\nstuff"));
add("status: PENDING", () => parsePlanStatus("**Status**: PENDING") === "PENDING");
add("status: DONE", () => parsePlanStatus("**Status**: DONE") === "DONE");

// ── decide() integration against a synthetic temp repo ───────────────────────
let root;
try {
  root = mkdtempSync(join(tmpdir(), "exec-comp-"));
  mkdirSync(join(root, "plans", "pending"), { recursive: true });
  const internal = join(root, "clients", "encore", "specs_planning", "_internal");
  mkdirSync(join(internal, "false-green-sweeps"), { recursive: true });
  mkdirSync(join(internal, "old-site-baseline"), { recursive: true });
  // Present artifact (false-green sweep emitted); baseline artifact deliberately ABSENT.
  writeFileSync(join(internal, "false-green-sweeps", "pricing-2026-06-18.md"), "sweep");

  const refs = [
    "clients/encore/specs_planning/_internal/false-green-sweeps/pricing-2026-06-18.md",
    "clients/encore/specs_planning/_internal/old-site-baseline/pricing-2026-06-18.md",
  ];
  const planPENDING = `**Status**: PENDING\n\nPhase 0.5fg emits ${refs[0]}\nPhase 0.5b emits ${refs[1]} FIRST.\n`;
  writeFileSync(join(root, "plans", "pending", "SUBPLAN_FAKE.md"), planPENDING);

  add("artifactSatisfied: present file true / absent file false (temp repo)", () => {
    return artifactSatisfied(refs[0], root) === true && artifactSatisfied(refs[1], root) === false;
  });

  add("resolvePlanPath: finds plans/pending fallback in temp repo", () => {
    return resolvePlanPath("SUBPLAN_FAKE.md", root).endsWith("SUBPLAN_FAKE.md");
  });

  add("decide: WARNS — baseline artifact missing, plan PENDING, no deferral-auth", () => {
    const v = decide({ messages: [skillMsg("execute", "SUBPLAN_FAKE.md")], repoRoot: root });
    return v.warn === true && v.missing.length === 1 && v.missing[0].includes("old-site-baseline");
  });

  add("decide: SILENT — final-q after execute (scope closed)", () => {
    const v = decide({
      messages: [skillMsg("execute", "SUBPLAN_FAKE.md"), skillMsg("final-q", "")],
      repoRoot: root,
    });
    return v.warn === false && v.reason === "no-active-execute";
  });

  add("decide: SILENT — ad-hoc execute (no plan file)", () => {
    const v = decide({ messages: [skillMsg("execute", "fix the thing")], repoRoot: root });
    return v.warn === false && v.reason === "no-plan-file";
  });

  // Same plan + a Deferral Authorization block → silent.
  writeFileSync(
    join(root, "plans", "pending", "SUBPLAN_DEFER.md"),
    `${planPENDING}\n## Deferral Authorization\nUser approved deferring the baseline walk.\n`
  );
  add("decide: SILENT — Deferral Authorization block present", () => {
    const v = decide({ messages: [skillMsg("execute", "SUBPLAN_DEFER.md")], repoRoot: root });
    return v.warn === false && v.reason === "deferral-authorized";
  });

  // Same plan but Status DONE → silent (closure gates own DONE).
  writeFileSync(
    join(root, "plans", "pending", "SUBPLAN_DONE.md"),
    planPENDING.replace("PENDING", "DONE")
  );
  add("decide: SILENT — plan Status DONE", () => {
    const v = decide({ messages: [skillMsg("execute", "SUBPLAN_DONE.md")], repoRoot: root });
    return v.warn === false && v.reason === "plan-done";
  });

  add("decide: SILENT — all declared artifacts present", () => {
    writeFileSync(join(internal, "old-site-baseline", "pricing-2026-06-18.md"), "baseline");
    const v = decide({ messages: [skillMsg("execute", "SUBPLAN_FAKE.md")], repoRoot: root });
    return v.warn === false && v.reason === "all-artifacts-present";
  });

  // ── 2nd branch (M5 / LR-062): walk artifact present-but-INCOMPLETE / complete / grandfathered ──
  mkdirSync(join(internal, "field-inventories"), { recursive: true });
  const fiIncomplete = "clients/encore/specs_planning/_internal/field-inventories/widget-2026-06-20.md";
  const fiComplete = "clients/encore/specs_planning/_internal/field-inventories/gadget-2026-06-20.md";
  const fiGrand = "clients/encore/specs_planning/_internal/field-inventories/legacy-2026-06-10.md";
  const cov = (date, ratio, cc, scope, disp) =>
    `MCP_Session_Date: ${date}\nCoverage_Ratio: ${ratio}\nCrossCheck: ${cc}\n` +
    (scope ? `coverageScope: ${scope}\n` : "") +
    `\n## Coverage Manifest (machine-enumerated)\n| key | role | found | disposition |\n| \`testid:x\` | button | ${date} | ${disp} |\n`;
  writeFileSync(join(root, fiIncomplete), cov("2026-06-20", "5/47 (11%)", "3 to review", "PARTIAL", "_undispositioned_"));
  writeFileSync(join(root, fiComplete), cov("2026-06-20", "47/47 (100%)", "clean", null, "covered-by-TC: TC-1"));
  writeFileSync(join(root, fiGrand), cov("2026-06-10", "1/47 (2%)", "dirty", "PARTIAL", "_undispositioned_"));
  writeFileSync(join(root, "plans", "pending", "SUBPLAN_COV_INCOMPLETE.md"), `**Status**: PENDING\n\nPhase 1 emits ${fiIncomplete}\n`);
  writeFileSync(join(root, "plans", "pending", "SUBPLAN_COV_COMPLETE.md"), `**Status**: PENDING\n\nPhase 1 emits ${fiComplete}\n`);
  writeFileSync(join(root, "plans", "pending", "SUBPLAN_COV_GRAND.md"), `**Status**: PENDING\n\nPhase 1 emits ${fiGrand}\n`);

  add("decide: WARNS — walk artifact present but coverage-INCOMPLETE (2nd branch)", () => {
    const v = decide({ messages: [skillMsg("execute", "SUBPLAN_COV_INCOMPLETE.md")], repoRoot: root });
    return v.warn === true && (v.incompleteCoverage || []).length === 1 &&
      v.incompleteCoverage[0].artifact.includes("widget-2026-06-20") && (v.missing || []).length === 0;
  });
  add("decide: SILENT — walk artifact present AND coverage-complete", () => {
    const v = decide({ messages: [skillMsg("execute", "SUBPLAN_COV_COMPLETE.md")], repoRoot: root });
    return v.warn === false && v.reason === "all-artifacts-present";
  });
  add("decide: SILENT — incomplete walk artifact but GRANDFATHERED (MCP_Session_Date < landing)", () => {
    const v = decide({ messages: [skillMsg("execute", "SUBPLAN_COV_GRAND.md")], repoRoot: root });
    return v.warn === false && v.reason === "all-artifacts-present";
  });
} catch (e) {
  add("temp-repo setup", () => {
    console.log(`  (setup error: ${e.message})`);
    return false;
  });
}

let passed = 0;
let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  try {
    ok = !!fn();
  } catch (e) {
    ok = false;
    console.log(`  (${name} threw: ${e.message})`);
  }
  if (ok) {
    passed++;
    console.log(`PASS ${name}`);
  } else {
    failed++;
    console.log(`FAIL ${name}`);
  }
}
if (root) {
  try {
    rmSync(root, { recursive: true, force: true });
  } catch {
    /* best-effort temp cleanup */
  }
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
