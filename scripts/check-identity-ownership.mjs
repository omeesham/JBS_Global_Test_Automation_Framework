// check-identity-ownership.mjs — parity check: AGENT_SHARED_RULES.md §2 table
// vs the machine mirror in identity-ownership.mjs.
//
// Exits 0 on byte-exact row parity (pattern + 7 grant cells per row, in
// declaration order). Exits 1 with diff on drift.
//
// Used by:
//   - CI: `node scripts/check-identity-ownership.mjs`
//   - Hook (SP-IDS-01 Stop mode): invoked inline to detect §2 edits without
//     mirror update
//
// Fail-open policy: if AGENT_SHARED_RULES.md is unreadable or the §2 table
// can't be located, exit 2 with an error message — distinct from drift (1)
// so automation can treat "infra broken" differently from "drift detected".

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { OWNERSHIP_ROWS, IDENTITIES, ownershipFor, ownerRoleFor, isPipelineArtifact } from "./identity-ownership.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rulesPath = resolve(__dirname, "..", "docs", "read_only_docs", "AGENT_SHARED_RULES.md");

if (!existsSync(rulesPath)) {
  console.error(`[check-identity-ownership] missing: ${rulesPath}`);
  process.exit(2);
}

const raw = readFileSync(rulesPath, "utf8");

// Locate §2 table. Look for the "## §2. File Ownership" heading, then the
// first table starting with "| Path |".
const sectionStart = raw.indexOf("## §2. File Ownership");
if (sectionStart === -1) {
  console.error("[check-identity-ownership] §2 heading not found");
  process.exit(2);
}
const sectionText = raw.slice(sectionStart);

// Find the "Agent-Maintained" table header row. Look for "| Path | Req | Pln |"
const headerRx = /\|\s*Path\s*\|\s*Req\s*\|\s*Pln\s*\|/;
const headerMatch = headerRx.exec(sectionText);
if (!headerMatch) {
  console.error("[check-identity-ownership] §2 table header not found");
  process.exit(2);
}

// Parse rows starting after the separator row (line of pipes + dashes).
const tableStart = sectionStart + headerMatch.index;
const tableSlice = raw.slice(tableStart);
const lines = tableSlice.split(/\r?\n/);

// skip lines[0] (header) and lines[1] (separator)
const parsedRows = [];
for (let i = 2; i < lines.length; i++) {
  const line = lines[i];
  if (!line.startsWith("|")) break; // end of table
  const cells = line.split("|").slice(1, -1).map((s) => s.trim());
  if (cells.length !== 8) continue; // row must have Path + 7 identities
  parsedRows.push({
    pattern: cells[0].replace(/`/g, ""),
    grants: {
      HUNTER: cells[1],
      GIVER: cells[2],
      BUILDER: cells[3],
      HEALER: cells[4],
      WATCHDOG: cells[5],
      GARDENER: cells[6],
      OWNER: cells[7],
    },
  });
}

// Header abbreviations → codename mapping:
//   Req -> HUNTER, Pln -> GIVER, Gen -> BUILDER, Heal -> HEALER,
//   Audit -> WATCHDOG, Maint -> GARDENER, Owner -> OWNER

// — Zero-row guards (vacuous-on-zero defense) —
if (parsedRows.length === 0) {
  console.error("[check-identity-ownership] §2 table header found but zero data rows parsed — expected ownership rows after the header/separator in " + rulesPath);
  process.exit(2);
}

if (OWNERSHIP_ROWS.length === 0) {
  console.error("[check-identity-ownership] OWNERSHIP_ROWS import is empty — identity-ownership.mjs must declare at least one ownership row");
  process.exit(2);
}

// Compare to OWNERSHIP_ROWS declaration order.
const expected = OWNERSHIP_ROWS;
const drifts = [];

if (expected.length !== parsedRows.length) {
  drifts.push(
    `row count mismatch: §2 has ${parsedRows.length}, mirror has ${expected.length}`
  );
}

const maxLen = Math.max(expected.length, parsedRows.length);
for (let i = 0; i < maxLen; i++) {
  const e = expected[i];
  const p = parsedRows[i];
  if (!e) { drifts.push(`extra §2 row ${i}: ${p.pattern}`); continue; }
  if (!p) { drifts.push(`mirror row ${i} missing in §2: ${e.pattern}`); continue; }
  if (e.pattern !== p.pattern) {
    drifts.push(`row ${i} pattern drift:\n    §2:     ${p.pattern}\n    mirror: ${e.pattern}`);
    continue;
  }
  for (const id of IDENTITIES) {
    // Normalize parenthetical annotations: "RW (quality gate)" -> "RW"
    // The annotation is a human hint, not a semantic distinction; the mirror
    // keeps only the action verb. Both sides are normalized before compare.
    const normE = e.grants[id].replace(/\s*\(.*?\)\s*$/, "").trim();
    const normP = p.grants[id].replace(/\s*\(.*?\)\s*$/, "").trim();
    if (normE !== normP) {
      drifts.push(
        `row ${i} (${e.pattern}) identity ${id}:\n    §2:     "${p.grants[id]}"\n    mirror: "${e.grants[id]}"`
      );
    }
  }
}

// ── Derivation-consistency drift guard (PLAN_IDENTITY_ENFORCEMENT Layer 1) ──
// Assert ownerRoleFor() + isPipelineArtifact() stay consistent with OWNERSHIP_ROWS
// for every row (drift guard — mirrors the parity discipline above). Independent
// second implementations of the grant sets so a priority/definition change in
// identity-ownership.mjs that diverges from intent is caught here.
const WRITE_GRANTS = new Set(["RW", "CREATE", "UPDATE", "ADD", "APPEND", "FIX", "REFACTOR"]);
const STRONG_GRANTS = new Set(["CREATE", "RW", "UPDATE", "ADD", "FIX", "REFACTOR"]); // APPEND excluded (shared logs)
const PIPELINE_IDS = IDENTITIES.filter((id) => id !== "OWNER");

function samplePathFor(pattern) {
  return pattern
    .replaceAll("${ACTIVE_CLIENT}", "encore")
    .replace(/\*\*/g, "x")
    .replace(/\*/g, "x")
    .replace(/<[^>]+>/g, "x");
}

for (const row of OWNERSHIP_ROWS) {
  const p = samplePathFor(row.pattern);
  // Resolve the row the function actually treats as most-specific for this path
  // (could be a later, more-specific row — use ownershipFor's reason to find it).
  const reason = ownershipFor("OWNER", p).reason || "";
  const m = reason.startsWith("§2 row: ") ? OWNERSHIP_ROWS.find((r) => r.pattern === reason.slice(8)) : null;
  if (!m) continue; // sample path didn't resolve to a §2 row (catch-all/default) — skip

  const role = ownerRoleFor(p);
  const art = isPipelineArtifact(p);

  // Invariant 1 — a returned primary role must actually have a write grant on the matched row.
  if (role !== null && !WRITE_GRANTS.has(m.grants[role])) {
    drifts.push(`derivation: ownerRoleFor("${p}") = ${role}, but ${role} grant on row "${m.pattern}" is "${m.grants[role]}" (not a write)`);
  }
  // Invariant 2 — isPipelineArtifact must equal: some pipeline id has a STRONG write AND OWNER ≠ APPEND.
  const expectArt = m.grants.OWNER !== "APPEND" && PIPELINE_IDS.some((id) => STRONG_GRANTS.has(m.grants[id]));
  if (art !== expectArt) {
    drifts.push(`derivation: isPipelineArtifact("${p}") = ${art}, expected ${expectArt} from row "${m.pattern}" grants`);
  }
  // Invariant 3 — a pipeline artifact must have a pipeline owner role.
  if (art && role === null) {
    drifts.push(`derivation: isPipelineArtifact("${p}") = true but ownerRoleFor = null (no pipeline owner) for row "${m.pattern}"`);
  }
}

if (drifts.length === 0) {
  console.log("[check-identity-ownership] OK — §2 table matches identity-ownership.mjs mirror + ownerRoleFor/isPipelineArtifact consistent");
  process.exit(0);
}

console.error("[check-identity-ownership] DRIFT DETECTED");
for (const d of drifts) console.error("  - " + d);
console.error("");
console.error("Resolution: update scripts/identity-ownership.mjs OWNERSHIP_ROWS to match §2, OR");
console.error("revert §2 if the mirror is authoritative for this change.");
process.exit(1);
