#!/usr/bin/env node
/**
 * Per-test baseline gate (LR-019).
 *
 * LR-019: a spec that mutates persisted state (toggle / set / fill / select, then asserts Save
 * enables or a value persists after reload) MUST reset to a known baseline PER-TEST, in
 * `test.beforeEach` (after the nav guard) — a first-test-only baseline (a reset inside the first
 * test's body) is INSUFFICIENT, because Playwright retries/parallel re-run a single test's
 * `beforeEach` but NOT the first test's body.
 *
 * This gate is registry-driven (no TypeScript parser; deterministic text-slicing), modelled on
 * check-save-route-parity.mjs (LR-066). It recognises EVERY legitimate per-test mechanism, so it
 * does not false-flag the FCC runner or fresh-open create pages:
 *   - beforeEach-reset : `ensureDefaultState` / `ensureEmptyState` / `ensureClean*` /
 *                        `ensureAllGridColumnsVisible` / `reloadAndReselect` called inside the
 *                        describe's `test.beforeEach`.
 *   - fcc              : the describe drives tests through the FCC runner `saveAndVerifyCase({ baseline })`,
 *                        whose `baseline` is compile-required and runs per-test.
 *   - fresh-open       : the describe's `test.beforeEach` opens a fresh page (`open(...)`), which is the
 *                        per-test baseline for read-only / create-page describes.
 *
 * Two registry kinds:
 *   - WAIVED  : a whole spec whose per-test-baseline fix is deferred to that submodule's FCC subplan
 *               (tracked in plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md). Passes with a recorded reason —
 *               the waiver is the durable backlog marker; the FCC subplan removes it when it lands the fix.
 *   - ENFORCED: a compliant spec whose save-capable describes each declare the mechanism they use. The
 *               gate verifies that mechanism's token is actually present, so a future edit that strips the
 *               baseline (a regression) fails the gate.
 *
 * Scope note (logged, not silent): the ENFORCED set covers the Location Settings tab family — the same
 * `ensureDefaultState`-in-`beforeEach` pattern the WAIVED gaps will adopt, so a regression in that family
 * is caught. Corporate-pricing / local-office save specs are protected by their own mechanisms + the
 * LR-066 gate + the FCC runner; they are surfaced by the glob WARN pass below (visible, not blocking)
 * rather than transcribed describe-by-describe. Add an ENFORCED entry to ratchet any of them into hard
 * coverage.
 *
 * Usage:
 *   node scripts/check-per-test-baseline.mjs            # scan every registered spec + glob-warn the rest
 *   node scripts/check-per-test-baseline.mjs --staged   # scan only registered/save-capable specs that are git-staged
 *
 * Exit 0 = every enforced save-capable describe has a recognised per-test mechanism (or is waived).
 * Exit 1 = an enforced describe lost its mechanism, a registered spec is missing, or a waiver reason is too short.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { execSync } from 'node:child_process';

const TESTS_GLOB_ROOT = 'clients';

// --- WAIVED: per-test-baseline fix deferred to the submodule's FCC subplan (FCC master backlog). ----
// Reason must be >= 20 chars. These are tracked promises, not fixes — the spec still has the gap.
const WAIVED = [
  {
    specPath: 'clients/encore/tests/locations/location-local-information.spec.ts',
    reason: 'deferred to the Local Information FCC subplan — per-test baseline bundled with the FCC upgrade (FCC master backlog)',
  },
  {
    specPath: 'clients/encore/tests/local-office/local-office-settings.spec.ts',
    reason: 'deferred to the Local Office Settings FCC subplan — per-test baseline bundled with the FCC upgrade (FCC master backlog)',
  },
  {
    specPath: 'clients/encore/tests/local-office/local-office-ect.spec.ts',
    reason: 'deferred to the ECT Settings FCC subplan — per-test baseline + Labor Cost default capture bundled with the FCC upgrade (FCC master backlog)',
  },
];

// --- ENFORCED: compliant specs; each save-capable describe declares the mechanism it uses. ----------
// `title` is a unique prefix of the describe title (titles carry trailing @tags). The gate verifies the
// declared mechanism's token is present in the right scope, so a regression that strips it fails here.
const ENFORCED = [
  {
    specPath: 'clients/encore/tests/locations/location-legal.spec.ts',
    describes: [
      { title: 'Location Legal — FCC', mechanism: 'fcc' },
      { title: 'Location Legal @locations @legal', mechanism: 'beforeEach-reset' },
    ],
  },
  {
    specPath: 'clients/encore/tests/locations/location-pricing.spec.ts',
    describes: [
      { title: 'Location Pricing @locations @pricing', mechanism: 'beforeEach-reset' },
      { title: 'Location Pricing — Multi-currency', mechanism: 'fcc' },
    ],
  },
  {
    specPath: 'clients/encore/tests/locations/location-auto-addon.spec.ts',
    describes: [{ title: 'Location Auto Add-On', mechanism: 'beforeEach-reset' }],
  },
  {
    specPath: 'clients/encore/tests/locations/location-currency.spec.ts',
    describes: [{ title: 'Location Currency', mechanism: 'beforeEach-reset' }],
  },
  {
    specPath: 'clients/encore/tests/locations/location-left-panel-basic-information.spec.ts',
    describes: [{ title: 'Location Left Panel', mechanism: 'beforeEach-reset' }],
  },
  {
    specPath: 'clients/encore/tests/locations/location-notes.spec.ts',
    describes: [
      { title: 'Location Notes — FCC', mechanism: 'fcc' },
      { title: 'Location Notes @locations @notes', mechanism: 'beforeEach-reset' },
    ],
  },
  {
    specPath: 'clients/encore/tests/locations/location-shared-setup-locations.spec.ts',
    describes: [
      { title: 'Location Shared Setup Locations @locations @shared-setup', occurrence: 1, mechanism: 'fcc' },
      { title: 'Location Shared Setup Locations @locations @shared-setup', occurrence: 2, mechanism: 'beforeEach-reset' },
    ],
  },
  {
    specPath: 'clients/encore/tests/locations/location-account-address.spec.ts',
    describes: [{ title: 'Location Account and Address @locations @account-address', mechanism: 'beforeEach-reset' }],
  },
  {
    // Equipment Override save-cycle — split from the former monolithic corporate-pricing-override.spec.ts.
    // Drives real saves through the field-case runner whose `baseline` is required per case.
    specPath: 'clients/encore/tests/corporate-override/corporate-override-core.spec.ts',
    describes: [
      { title: 'Corporate Pricing — Product Group Override: save-cycle (mutation, fixture-restored)', mechanism: 'fcc' },
    ],
  },
  {
    // Labor Override save-cycle — split from the former monolithic corporate-pricing-override.spec.ts.
    // Drives real saves through the field-case runner whose `baseline` is required per case.
    specPath: 'clients/encore/tests/corporate-override/corporate-override-nm2271.spec.ts',
    describes: [
      { title: 'Corporate Pricing — Product Group Override: Labor save-cycle (mutation, fixture-restored)', mechanism: 'fcc' },
    ],
  },
];

// Helpers that drive a REAL Save — used by the glob WARN pass to spot save-capable describes.
const REAL_SAVE_HELPERS = [
  'clickSaveExpectDialog',
  'clickSaveWithDialog',
  'confirmSaveAndGetNewId',
  'saveAndVerifyCase',
  'saveAndConfirm',
  'clickSave',
];

// Per-test reset helpers that establish a known baseline (NOT plain navigation — a bare nav guard
// like navigateToXTab / isOnXTab does NOT reset state and must not be credited).
const RESET_HELPER_RE = /\b(ensureDefaultState|ensureEmptyState|ensureClean\w*|ensureAllGridColumnsVisible|reloadAndReselect)\s*\(/;
const FCC_RE = /\bsaveAndVerifyCase\s*\(/;
const FRESH_OPEN_RE = /\bopen\s*\(/;
const SAVE_CAPABLE_RE = new RegExp('\\b(' + REAL_SAVE_HELPERS.join('|') + ')\\s*\\(');

/** Slice the Nth (1-based, default 1) describe block whose title begins with `title` (titles carry
 *  trailing tags). The occurrence index disambiguates duplicate-titled describes — e.g. a spec with
 *  both an FCC describe and a non-FCC describe under the same title string. occurrence = 1 reproduces
 *  the prior first-match behaviour, so existing single-describe registrations are unaffected. */
function describeBlock(src, title, occurrence = 1) {
  const matches = allDescribeBlocks(src).filter((b) => b.title.trimStart().startsWith(title));
  const hit = matches[occurrence - 1];
  return hit ? hit.block : null;
}

/** All describe blocks in a spec, in order: [{ title, block }]. Positional — robust to duplicate titles. */
function allDescribeBlocks(src) {
  const re = /test\.describe\(\s*['"`]([^'"`]*)['"`]/g;
  const starts = [];
  let m;
  while ((m = re.exec(src))) starts.push({ title: m[1], index: m.index });
  return starts.map((s, i) => ({
    title: s.title,
    block: src.slice(s.index, i + 1 < starts.length ? starts[i + 1].index : src.length),
  }));
}

/** The `test.beforeEach(...)` body within a describe block (up to its first real test), or '' if none.
 * The boundary is a real test declaration — `test(` / `test.skip|only|fixme|fail|slow(` — NOT
 * `test.setTimeout(` (which legitimately appears INSIDE a beforeEach, before the reset call). */
function beforeEachSlice(block) {
  const be = /test\.beforeEach\(/.exec(block);
  if (!be) return '';
  const from = be.index;
  const after = block.slice(from + 'test.beforeEach('.length);
  const firstTest = /\n\s*test\s*\(|\n\s*test\.(?:skip|only|fixme|fail|slow)\s*\(/.exec(after);
  return firstTest ? after.slice(0, firstTest.index) : after;
}

function hasMechanism(block, mechanism) {
  if (mechanism === 'fcc') return FCC_RE.test(block);
  const be = beforeEachSlice(block);
  if (mechanism === 'beforeEach-reset') return RESET_HELPER_RE.test(be);
  if (mechanism === 'fresh-open') return FRESH_OPEN_RE.test(be) || RESET_HELPER_RE.test(be);
  return false;
}

/** Does a describe block carry ANY recognised per-test mechanism? (for the glob WARN pass) */
function hasAnyMechanism(block) {
  return FCC_RE.test(block) || RESET_HELPER_RE.test(beforeEachSlice(block)) || FRESH_OPEN_RE.test(beforeEachSlice(block));
}

function stagedFiles() {
  try {
    return new Set(
      execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n').map((s) => s.trim()).filter(Boolean),
    );
  } catch {
    return new Set();
  }
}

function walkSpecs(dir, out) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walkSpecs(full, out);
    } else if (e.isFile() && e.name.endsWith('.spec.ts')) {
      const rel = relative(process.cwd(), full).split(sep).join('/');
      if (/^clients\/[^/]+\/tests\//.test(rel)) out.push(rel);
    }
  }
}

const stagedOnly = process.argv.includes('--staged');
const staged = stagedOnly ? stagedFiles() : null;

const failures = [];
const warnings = [];
let checked = 0;

const registeredPaths = new Set([...WAIVED.map((w) => w.specPath), ...ENFORCED.map((e) => e.specPath)]);

// 1) WAIVED — record the deferral; validate the reason is substantive.
for (const w of WAIVED) {
  if (stagedOnly && !staged.has(w.specPath)) continue;
  if (!existsSync(w.specPath)) {
    failures.push(`${w.specPath}: WAIVED spec not found on disk (stale registry entry?)`);
    continue;
  }
  if (!w.reason || w.reason.trim().length < 20) {
    failures.push(`${w.specPath}: waiver reason must be >= 20 chars (got "${w.reason ?? ''}")`);
    continue;
  }
  checked++;
  console.log(`WAIVED: ${w.specPath} — ${w.reason}`);
}

// 2) ENFORCED — verify each declared describe carries its declared mechanism.
for (const entry of ENFORCED) {
  if (stagedOnly && !staged.has(entry.specPath)) continue;
  if (!existsSync(entry.specPath)) {
    failures.push(`${entry.specPath}: ENFORCED spec not found on disk`);
    continue;
  }
  const src = readFileSync(entry.specPath, 'utf8');
  for (const d of entry.describes) {
    checked++;
    const block = describeBlock(src, d.title, d.occurrence ?? 1);
    if (block === null) {
      failures.push(`${entry.specPath} :: describe "${d.title}" — not found (title drift? update the registry)`);
      continue;
    }
    if (!hasMechanism(block, d.mechanism)) {
      failures.push(
        `${entry.specPath} :: describe "${d.title}" — declared per-test mechanism "${d.mechanism}" is MISSING. ` +
          `LR-019: a save-capable describe must reset baseline per-test (ensureDefaultState in beforeEach, ` +
          `the FCC runner baseline, or a fresh open()). If the mechanism legitimately changed, update the registry.`,
      );
    }
  }
}

// 3) GLOB WARN — surface save-capable specs that are neither WAIVED nor ENFORCED, so the registry can't rot.
const allSpecs = [];
walkSpecs(TESTS_GLOB_ROOT, allSpecs);
for (const rel of allSpecs) {
  if (registeredPaths.has(rel)) continue;
  if (stagedOnly && !staged.has(rel)) continue;
  let src;
  try { src = readFileSync(rel, 'utf8'); } catch { continue; }
  for (const { title, block } of allDescribeBlocks(src)) {
    if (!SAVE_CAPABLE_RE.test(block)) continue; // not save-capable → no baseline needed
    if (hasAnyMechanism(block)) continue; // already has a recognised mechanism → fine
    warnings.push(`${rel} :: describe "${title.slice(0, 60)}" — save-capable, no recognised per-test mechanism and not registered.`);
  }
}

if (stagedOnly && checked === 0 && warnings.length === 0) {
  console.log('SKIP: per-test baseline (LR-019) — no registered or save-capable spec is staged.');
  process.exit(0);
}

if (warnings.length) {
  console.warn('\nWARN: per-test baseline (LR-019) — save-capable describe(s) not covered by the registry (review; not blocking):');
  for (const w of warnings) console.warn('  ? ' + w);
}

if (failures.length) {
  console.error('\nFAIL: per-test baseline (LR-019) — a save-capable describe is missing its per-test baseline:\n');
  for (const f of failures) console.error('  - ' + f);
  console.error(`\n${failures.length} violation(s) across ${checked} checked entr(y/ies). See LR-019 in .claude/rules/specs.md.`);
  process.exit(1);
}

console.log(`\nPASS: per-test baseline (LR-019) — ${checked} registered entr(y/ies) compliant (${WAIVED.length} waived, ${ENFORCED.reduce((n, e) => n + e.describes.length, 0)} enforced), ${warnings.length} warning(s).`);
process.exit(0);
