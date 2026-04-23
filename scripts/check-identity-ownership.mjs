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

import { OWNERSHIP_ROWS, IDENTITIES } from "./identity-ownership.mjs";

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

if (drifts.length === 0) {
  console.log("[check-identity-ownership] OK — §2 table matches identity-ownership.mjs mirror");
  process.exit(0);
}

console.error("[check-identity-ownership] DRIFT DETECTED");
for (const d of drifts) console.error("  - " + d);
console.error("");
console.error("Resolution: update scripts/identity-ownership.mjs OWNERSHIP_ROWS to match §2, OR");
console.error("revert §2 if the mirror is authoritative for this change.");
process.exit(1);
