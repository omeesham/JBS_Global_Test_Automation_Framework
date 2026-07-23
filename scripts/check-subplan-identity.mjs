// check-subplan-identity.mjs — /execute Phase 0.1 gate per ALL-077.
//
// Verifies that the subplan's declared bootstrap `Identity:` can write every
// path listed under "Artifacts produced" (or "Key Files") per
// AGENT_SHARED_RULES.md §2 (via scripts/identity-ownership.mjs mirror).
//
// Exits:
//   0 — all artifacts writable by declared identity
//   1 — violation found (prints JSON report to stdout)
//   2 — infra error (unreadable plan, no Identity declaration, etc.)
//
// Usage:
//   node scripts/check-subplan-identity.mjs plans/pending/SUBPLAN_X.md
//
// Parses the subplan markdown for:
//   - Identity declaration: `**Identity**: CODENAME` or `Identity: CODENAME`
//     in frontmatter / bootstrap section.
//   - Artifact paths: rows in a `## Artifacts produced` table of the form:
//       | {path} | {action} | ... |
//     Also accepts `## Key Files` / `## Artifacts` / `## Deliverables`.
//
// NOTE: This check only fires when /execute is invoked with a plan file.
// Ad-hoc /execute "do X" skips Phase 0.1 entirely (no plan to cross-check).
// The PreToolUse hook (SP-IDS-01) remains as second-line defense for those
// ad-hoc cases.

import { readFileSync, existsSync } from "node:fs";
import { ownershipFor, canWrite, IDENTITIES } from "./identity-ownership.mjs";

const planPath = process.argv[2];
if (!planPath) {
  console.error("usage: node check-subplan-identity.mjs <plan-file-path>");
  process.exit(2);
}
if (!existsSync(planPath)) {
  console.error(`[check-subplan-identity] not found: ${planPath}`);
  process.exit(2);
}

const raw = readFileSync(planPath, "utf8");

// 1. Extract Identity declaration.
const identityRx = /^\*{0,2}Identity\*{0,2}:\s*([A-Z]+)/m;
const idMatch = identityRx.exec(raw);
if (!idMatch) {
  // No identity declaration — treat as ad-hoc plan; skip check.
  console.log(JSON.stringify({
    ok: true,
    skipped: true,
    reason: "no Identity: declaration found in subplan; Phase 0.1 not applicable",
  }));
  process.exit(0);
}
const identity = idMatch[1];
if (!IDENTITIES.includes(identity)) {
  console.error(JSON.stringify({
    ok: false,
    error: `unknown identity "${identity}" — must be one of ${IDENTITIES.join(", ")}`,
  }));
  process.exit(2);
}

// 2. Find artifact table(s). Look for "## Artifacts produced", "## Key Files",
//    "## Artifacts", or "## Deliverables". Parse the first markdown table after.
const sectionRx = /^##\s+(Artifacts produced|Artifacts|Key Files|Deliverables)\s*$/m;
const sectionMatch = sectionRx.exec(raw);
if (!sectionMatch) {
  console.log(JSON.stringify({
    ok: true,
    skipped: true,
    reason: "no Artifacts produced / Key Files / Deliverables section found; Phase 0.1 not applicable",
  }));
  process.exit(0);
}

const afterSection = raw.slice(sectionMatch.index + sectionMatch[0].length);

// Find first markdown table: lines starting with "|" within the section.
const paths = [];
const lines = afterSection.split(/\r?\n/);
let inTable = false;
let rowCount = 0;
for (const line of lines) {
  if (line.startsWith("##")) break; // hit next section
  if (line.startsWith("|")) {
    inTable = true;
    rowCount++;
    if (rowCount <= 2) continue; // skip header + separator
    const cells = line.split("|").slice(1, -1).map((s) => s.trim());
    if (cells.length < 1) continue;
    // First cell may be wrapped in backticks
    let p = cells[0].replace(/`/g, "").trim();
    // Skip obvious non-paths (empty, "—", section markers)
    if (!p || p === "—" || /^https?:\/\//.test(p) || p.startsWith("*")) continue;
    // Detect "DO NOT MODIFY" annotations — still include if path is real
    paths.push(p);
  } else if (inTable && line.trim() === "") {
    // End of table
    break;
  }
}

if (paths.length === 0) {
  console.error(JSON.stringify({
    ok: false,
    error: `artifact section "${sectionMatch[1]}" found in ${planPath} but zero paths could be parsed from it — the table may be malformed or empty`,
    identity,
    sectionFound: sectionMatch[1],
  }));
  process.exit(2);
}

// 3. Check each path against §2 ownership for declared identity.
const violations = [];
for (const p of paths) {
  // Some rows in subplans include "DO NOT MODIFY" or "HARD STOP" annotations as
  // the ownership cell — those are intentional non-writes; skip.
  const o = ownershipFor(identity, p);
  if (o.action === "HARD_STOP") {
    // HARD_STOP is expected for listed-but-don't-modify paths like package.json
    // in the SP-IDS-01 subplan. Don't flag as violation.
    continue;
  }
  if (!canWrite(identity, p)) {
    violations.push({ path: p, identity, cell: o.action, reason: o.reason });
  }
}

if (violations.length === 0) {
  console.log(JSON.stringify({
    ok: true,
    identity,
    pathsChecked: paths.length,
    message: `${identity} can write all ${paths.length} artifact paths in ${planPath}`,
  }));
  process.exit(0);
}

// 4. Report violations + options per ALL-077.
const report = {
  ok: false,
  identity,
  pathsChecked: paths.length,
  violations,
  options: [
    `(a) Reassign subplan Identity: ${identity} → a compatible identity that owns these paths`,
    `(b) Update AGENT_SHARED_RULES.md §2 to grant ${identity} write access (governance change; also update scripts/identity-ownership.mjs mirror)`,
    `(c) Plan a clean mid-session identity switch: start as ${identity} for research phase, switch to owner of these paths for write phase (see feedback_identity_switch_protocol.md + ALL-077)`,
  ],
  rationale: `ALL-077 structural gate: subplan identity must match §2 file ownership for every Artifacts-produced path. Do NOT use "override" to plow through — override is one-shot break-glass, not a workflow.`,
};
console.log(JSON.stringify(report, null, 2));
process.exit(1);
