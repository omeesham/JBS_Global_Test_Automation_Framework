#!/usr/bin/env node
// check-browsertool-parity.mjs — parity check for the BrowserTool gate.
//
// Exits 0 if:
//   (a) the hook's BROWSERTOOL_VALUES export matches the spec in
//       PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md §BrowserTool
//       frontmatter field spec (canonical set: cli|chrome|both|none);
//   (b) the hook fixture test passes all scenarios.
//
// Exit 1 on drift (value-set mismatch or fixture failure); exit 2 on infra
// failure (unreadable plan, missing files) — distinct so CI can
// distinguish "drift detected" from "infra broken" (same posture as
// scripts/check-identity-ownership.mjs L13).
//
// Usage:
//   node scripts/check-browsertool-parity.mjs
//   npm run check:browsertool-parity
//
// Part of the SP-PWC2-06 package. Runs at CI time + before any
// settings.json enable of browsertool-gate.sh (hook header documents this
// as step 1 of the enablement procedure).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { execSync } from "node:child_process";

import { BROWSERTOOL_VALUES } from "../.claude/hooks/lib/check-browsertool.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const planPath = resolve(
  repoRoot,
  "plans",
  "pending",
  "PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md",
);

// -------------------------------------------------------------------------
// (a) Value-set parity check
// -------------------------------------------------------------------------

if (!existsSync(planPath)) {
  // Parent plan may have moved to plans/done/ after execution. Check there.
  const donePath = resolve(repoRoot, "plans", "done", "PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md");
  if (!existsSync(donePath)) {
    console.error(`[check-browsertool-parity] missing parent plan in both plans/pending and plans/done`);
    process.exit(2);
  }
  // Fall through — use donePath below.
  var effectivePlanPath = donePath;
} else {
  var effectivePlanPath = planPath;
}

let planRaw;
try {
  planRaw = readFileSync(effectivePlanPath, "utf8");
} catch (e) {
  console.error(`[check-browsertool-parity] cannot read ${effectivePlanPath}: ${e.message}`);
  process.exit(2);
}

// Locate the spec section. PLAN L100 reads:
//   - **Allowed values**: `cli` | `chrome` | `both` | `none`
// Extract the four backtick-quoted tokens from that line.
const specLineRx = /^\s*-\s*\*\*Allowed values\*\*:\s*(.+)$/m;
const specMatch = specLineRx.exec(planRaw);
if (!specMatch) {
  console.error(
    `[check-browsertool-parity] "Allowed values" line not found in parent plan. ` +
    `Expected line like: "- **Allowed values**: \`cli\` | \`chrome\` | \`both\` | \`none\`"`,
  );
  process.exit(2);
}

const specTokensRx = /`([a-z]+)`/g;
const specTokens = [];
let m;
while ((m = specTokensRx.exec(specMatch[1])) !== null) specTokens.push(m[1]);

if (specTokens.length === 0) {
  console.error(`[check-browsertool-parity] no backtick-quoted tokens on the Allowed values line`);
  process.exit(2);
}

// Compare sorted arrays for set equality.
const specSorted = [...specTokens].sort();
const hookSorted = [...BROWSERTOOL_VALUES].sort();

if (JSON.stringify(specSorted) !== JSON.stringify(hookSorted)) {
  console.error(`[check-browsertool-parity] DRIFT — hook's BROWSERTOOL_VALUES diverges from plan spec`);
  console.error(`  plan spec (${effectivePlanPath}): [${specSorted.join(", ")}]`);
  console.error(`  hook:                                 [${hookSorted.join(", ")}]`);
  console.error(`  fix: update one side so they match, OR amend this parity test if the spec intentionally changed`);
  process.exit(1);
}

console.log(`[check-browsertool-parity] value-set parity OK — ${hookSorted.join(", ")}`);

// -------------------------------------------------------------------------
// (b) Fixture-test delegation
// -------------------------------------------------------------------------

const fixturesPath = join(repoRoot, ".claude", "hooks", "lib", "test-browsertool-fixtures.mjs");
if (!existsSync(fixturesPath)) {
  console.error(`[check-browsertool-parity] missing fixture test: ${fixturesPath}`);
  process.exit(2);
}

try {
  const out = execSync(`node "${fixturesPath}"`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  process.stdout.write(out);
} catch (e) {
  // execSync throws on non-zero exit. The fixture runner prints line-per-
  // fixture results; surface them verbatim.
  if (e.stdout) process.stdout.write(e.stdout);
  if (e.stderr) process.stderr.write(e.stderr);
  console.error(`[check-browsertool-parity] fixture test failed`);
  process.exit(1);
}

console.log(`[check-browsertool-parity] ALL CHECKS PASSED`);
process.exit(0);
