#!/usr/bin/env node
/**
 * Save-route parity gate (LR-066).
 *
 * For each registered spec, every declared save-capable describe block MUST contain at least one call
 * to a "real save" helper (one that drives the actual Save action) OR an explicit
 * `parity-waived: <reason >= 20 chars>` marker. A save-capable sibling route closed on load +
 * field-enable checks alone fails the gate — "the field enables Save" is not "Save works."
 *
 * Deterministic and AST-free: it slices each declared describe block by text (from its `test.describe(`
 * line to the next `test.describe(` or EOF) and scans that slice for a real-save helper call / the
 * waiver marker. Registry-driven — to cover a new module with >=2 route-param/mode siblings on a shared
 * save page, add a row to REGISTRY listing its save-capable describe titles.
 *
 * Usage:
 *   node scripts/check-save-route-parity.mjs            # scan every registered spec
 *   node scripts/check-save-route-parity.mjs --staged   # scan only registered specs that are git-staged
 *
 * Exit 0 = every registered save route drives a real Save (or is explicitly waived).
 * Exit 1 = a thin save-capable route (or a title-drifted registry entry) was found.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { stagedFiles } from './lib/git-staged.mjs';

// --- Registry: modules whose sibling create/save routes share one page (differ only by route param / mode).
const REGISTRY = [
  {
    specPath: 'clients/encore/tests/corporate-pricing/corporate-pricing-new-pricebook.spec.ts',
    // `?type=equipment` vs `?type=labor` — same create page, two routes; each must drive a real Save.
    saveRouteDescribes: [
      'Corporate Pricing — New Pricebook (Equipment)',
      'Corporate Pricing — New Pricebook (Labor)',
    ],
  },
  {
    specPath: 'clients/encore/tests/item-search/add-product-code.spec.ts',
    // Item Search Add Product Code — the Item segment is the save-capable create route; its
    // real-Save test commits a product code and re-reads it after reload (LR-067). The route
    // moved out of product-code.spec.ts on 2026-09-04 when NM-2257 split into its own
    // deliverable; the base spec keeps only the View dialog, whose save path is NM-2255 work.
    saveRouteDescribes: ['Item Search Add Product Code'],
  },
  {
    specPath: 'clients/encore/tests/item-search/product-groups.spec.ts',
    // Item Search Create Product Group — the Add-page describe carries the real-Save
    // create-and-find-again test.
    saveRouteDescribes: ['Item Search Product Groups panel and Add page'],
  },
];

// Helpers that drive a REAL Save (reach the confirm dialog and/or commit). A describe that calls any of
// these has exercised the Save action, not merely asserted the button enables.
const REAL_SAVE_HELPERS = [
  'clickSaveExpectDialog',
  'clickSaveWithDialog',
  'clickSaveAndCaptureDialog',
  'confirmSaveAndGetNewId',
  'saveAndVerifyCase',
  'saveAndConfirm',
  'saveNewCodeAndConfirm',
  'saveNewGroupAndConfirm',
];

const WAIVER_RE = /parity-waived:\s*\S.{19,}/; // marker + a non-space + >=19 more chars => reason >= 20 chars

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Slice the describe block whose title begins with `title` (titles carry trailing tags). */
function describeBlock(src, title) {
  const startRe = new RegExp('test\\.describe\\(\\s*[\'"`]\\s*' + escapeRe(title), 'm');
  const m = startRe.exec(src);
  if (!m) return null;
  const from = m.index;
  const nextRe = /test\.describe\(/g;
  nextRe.lastIndex = from + m[0].length;
  const next = nextRe.exec(src);
  return src.slice(from, next ? next.index : src.length);
}

function drivesRealSave(block) {
  return REAL_SAVE_HELPERS.some((h) => new RegExp('\\b' + h + '\\s*\\(').test(block));
}

const stagedOnly = process.argv.includes('--staged');
const staged = stagedOnly ? stagedFiles() : null;

const failures = [];
let checked = 0;

for (const entry of REGISTRY) {
  if (stagedOnly && !staged.has(entry.specPath)) continue;
  if (!existsSync(entry.specPath)) {
    failures.push(`${entry.specPath}: registered spec not found on disk`);
    continue;
  }
  const src = readFileSync(entry.specPath, 'utf8');
  for (const title of entry.saveRouteDescribes) {
    checked++;
    const block = describeBlock(src, title);
    if (block === null) {
      failures.push(`${entry.specPath} :: describe "${title}" — not found (title drift? update the registry)`);
      continue;
    }
    if (!drivesRealSave(block) && !WAIVER_RE.test(block)) {
      failures.push(
        `${entry.specPath} :: describe "${title}" — save-capable route does NOT drive a real Save ` +
          `(no ${REAL_SAVE_HELPERS.join('/')} call) and carries no \`parity-waived: <reason>\` marker. ` +
          `LR-066: every sibling save route must exercise a real Save (dialog-reach minimum), not just field-enable.`,
      );
    }
  }
}

if (!stagedOnly && checked === 0) {
  console.error('FAIL: save-route parity (LR-066) — REGISTRY is empty; the gate has nothing to check.');
  console.error('  Expected: at least one entry in REGISTRY with saveRouteDescribes. Found: 0 checked routes.');
  process.exit(1);
}

if (stagedOnly && checked === 0) {
  console.log('SKIP: save-route parity (LR-066) — no registered spec is staged.');
  process.exit(0);
}

if (failures.length) {
  console.error('FAIL: save-route parity (LR-066) — a save-capable sibling route is not exercising a real Save:\n');
  for (const f of failures) console.error('  - ' + f);
  console.error(`\n${failures.length} violation(s) across ${checked} checked route(s). See LR-066 in .claude/rules/specs.md.`);
  process.exit(1);
}

console.log(`PASS: save-route parity (LR-066) — all ${checked} registered save route(s) drive a real Save or are explicitly waived.`);
process.exit(0);
