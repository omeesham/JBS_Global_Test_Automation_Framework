#!/usr/bin/env node
/**
 * check-per-row-await.test.mjs — fixture tests for the per-element-await-under-a-wait-budget guard.
 * Mirrors scripts/check-reload-wait.test.mjs.
 *
 * The corpus is deliberately REAL CODE, not invented shapes:
 *   - the tier-1 positive control is the verbatim pre-fix `getHistoryRows` / `waitUntilHistoryLoaded`
 *     pair from `git show 76b5abb43:clients/encore/src/pages/service-charge/service-charge.page.ts`,
 *     the pair that killed 14 of 15 tests on 2026-08-20;
 *   - the tier-1 negative control is the verbatim fixed version of the same method;
 *   - the must-not-block corpus is lifted verbatim from corporate-pricing-new-pricebook.page.ts,
 *     corporate-pricing-search.page.ts, corporate-override.page.ts and corporate-pricing.page.ts.
 *     Those are correct bounded reads that ship today; a gate that blocks them is worse than no gate.
 * A closing integration test re-scans the real page objects on disk when they are present, so the
 * corpus can never drift into agreement with a transcription the detector was tuned against.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findPerRowAwaits, scrubSource, classifyBound, walkScanFiles, buildReport,
} from './check-per-row-await.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function makeTmpRepo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'per-row-await-')); }
function write(repoRoot, relPath, body) {
  const full = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, body);
  return full;
}
const cases = [];
function test(name, fn) { cases.push({ name, fn }); }
function assertEq(actual, expected, msg) {
  if (actual !== expected) throw new Error(`${msg || 'assertEq'} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assert failed'); }

// =============================================================================================
// The measured defect — verbatim pre-fix source (commit 76b5abb43).
// =============================================================================================

const PREFIX_SERVICE_CHARGE = String.raw`
export class ServiceChargePage extends BasePage {
  @step('Wait for the Service Charge History grid to finish loading')
  async waitUntilHistoryLoaded(timeout = 90_000): Promise<void> {
    await expect(this.page.locator(sc.skeleton)).toHaveCount(0, { timeout });
    await expect
      .poll(async () => (await this.getHistoryRows()).length > 0, { timeout: 30_000 })
      .toBe(true);
  }

  @step('Count the rows in the Service Charge History grid')
  async getHistoryRowCount(): Promise<number> {
    return (await this.getHistoryRows()).length;
  }

  @step('Read all rows from the Service Charge History table')
  async getHistoryRows(): Promise<string[][]> {
    const rows = this.page.getByRole('row');
    const count = await rows.count();
    const result: string[][] = [];
    // Row at index 0 is the header row — start from 1.
    for (let i = 1; i < count; i++) {
      const cells = await rows.nth(i).getByRole('cell').allTextContents();
      const clean = cells.map((c) => c.replace(/\s+/g, ' ').trim());
      // Skip skeleton rows — they render as empty cells.
      if (clean.some((c) => c.length > 0)) {
        result.push(clean);
      }
    }
    return result;
  }
}
`;

// Verbatim fixed version — one evaluateAll round-trip regardless of row count.
const FIXED_SERVICE_CHARGE = String.raw`
export class ServiceChargePage extends BasePage {
  @step('Wait for the Service Charge History grid to finish loading')
  async waitUntilHistoryLoaded(timeout = 90_000): Promise<void> {
    await expect(this.page.locator(sc.skeleton)).toHaveCount(0, { timeout });
    await expect
      .poll(async () => (await this.getHistoryRows()).length > 0, { timeout: 30_000 })
      .toBe(true);
  }

  @step('Read all rows from the Service Charge History table')
  async getHistoryRows(): Promise<string[][]> {
    // Read every row in one pass inside the page. Reading them one at a time
    // costs a separate browser round-trip per row, and this grid gains a row
    // on every save and never loses one, so a per-row read keeps getting
    // slower until it outlasts the wait that depends on it.
    const rows = await this.page
      .getByRole('row')
      .evaluateAll((elements) =>
        elements.map((row) =>
          Array.from(row.querySelectorAll('td, [role="cell"]')).map((cell) =>
            (cell.textContent ?? '').replace(/\s+/g, ' ').trim(),
          ),
        ),
      );
    // Row at index 0 is the header row, so start from 1.
    // Skip skeleton rows, which render as empty cells.
    return rows.slice(1).filter((cells) => cells.some((c) => c.length > 0));
  }
}
`;

test('TIER 1 fires on the verbatim pre-fix getHistoryRows / waitUntilHistoryLoaded pair', () => {
  const r = findPerRowAwaits(PREFIX_SERVICE_CHARGE);
  assertEq(r.tier1.length, 1, 'the killer combination must be caught');
  assert(/for \(let i = 1; i < count; i\+\+\)/.test(r.tier1[0].snippet), 'points at the per-row loop');
  assert(/poll/.test(r.tier1[0].detail), 'names the wait budget it sits under');
  assertEq(r.tier2.length, 1, 'the same site is also the broader class');
});

test('TIER 1 does NOT fire on the fixed evaluateAll version of the same file', () => {
  const r = findPerRowAwaits(FIXED_SERVICE_CHARGE);
  assertEq(r.tier1.length, 0, 'one round-trip under the same poll is correct');
  assertEq(r.tier2.length, 0);
});

// =============================================================================================
// A DESCRIPTION MUST NOT TRIGGER THE GATE — a detector a comment can trip is a known failure mode.
// =============================================================================================

test('a comment describing the pattern does NOT trigger either tier', () => {
  const src = String.raw`
export class HistoryNotesPage extends BasePage {
  /**
   * NOTE ON A PAST DEFECT: we used to await rows.nth(i) inside a for loop over await count(),
   * i.e. "const count = await rows.count(); for (let i = 1; i < count; i++) { await rows.nth(i)
   * .getByRole('cell').allTextContents(); }" and that loop was reachable from
   * expect.poll(async () => (await this.getHistoryRows()).length > 0, { timeout: 30_000 }).
   * Do not reintroduce it.
   */
  // we used to await rows.nth(i) inside a for loop over await count()
  async getHistoryRows(): Promise<string[][]> {
    return this.page.getByRole('row').evaluateAll((els) => els.map((e) => [e.textContent ?? '']));
  }
}
`;
  const r = findPerRowAwaits(src);
  assertEq(r.tier1.length, 0, 'prose about the pattern is not the pattern');
  assertEq(r.tier2.length, 0);
});

test('a string literal describing the pattern does NOT trigger either tier', () => {
  const src = String.raw`
export class DocPage extends BasePage {
  async explain(): Promise<string> {
    const advice = 'never await rows.nth(i) inside for (let i = 1; i < count; i++) after await rows.count()';
    const more = "expect.poll(async () => (await this.getHistoryRows()).length > 0, { timeout: 30_000 })";
    return advice + more;
  }
}
`;
  const r = findPerRowAwaits(src);
  assertEq(r.tier1.length, 0, 'a string about the pattern is not the pattern');
  assertEq(r.tier2.length, 0);
});

test('scrubSource blanks comments/strings/regex but preserves line count and offsets', () => {
  const src = "const a = 1; // await rows.nth(i)\nconst b = '/x/ await rows.count()';\nconst c = /await rows.nth(i)/g;\nconst d = 2;";
  const out = scrubSource(src);
  assertEq(out.length, src.length, 'offsets must be preserved 1:1');
  assertEq(out.split('\n').length, src.split('\n').length, 'line numbers must be preserved');
  assert(!/rows\.nth/.test(out), 'no per-element accessor survives inside comment/string/regex');
  assert(/const a = 1;/.test(out) && /const d = 2;/.test(out), 'real code survives untouched');
});

// =============================================================================================
// MUST-NOT-BLOCK CORPUS — real, correct, currently-shipping bounded reads.
// =============================================================================================

// clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts (verbatim)
const NEW_PRICEBOOK_BOUNDED = String.raw`
export class NewPricebookPage extends BasePage {
  @step('Get source group sample')
  async getSourceGroupSample(n = 5): Promise<string[]> {
    const out: string[] = [];
    const rows = this.page.locator(S.npSourceRow);
    const count = Math.min(await rows.count(), n);
    for (let i = 0; i < count; i++) out.push((await rows.nth(i).innerText()).replace(/\s+/g, ' ').trim());
    return out;
  }
}
`;

// clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts (verbatim, two methods)
const SEARCH_BOUNDED = String.raw`
export class SearchPage extends BasePage {
  @step('Boolean cells valid')
  async booleanCellsValid(maxRows = 15): Promise<{ hasTrue: boolean; allValid: boolean }> {
    const boolIdx = [3, 4, 5, 6, 7];
    const rows = this.page.locator(S.rowGridAny);
    const n = Math.min(await rows.count(), maxRows);
    let hasTrue = false;
    let allValid = true;
    for (let r = 0; r < n; r++) {
      for (const c of boolIdx) {
        const t = (await rows.nth(r).locator('td').nth(c).innerText()).trim();
        if (t.includes(CORP_PRICING_SEARCH.booleanTrueMarker)) hasTrue = true;
        else if (t !== '') allValid = false;
      }
    }
    return { hasTrue, allValid };
  }

  @step('Get first n price book names')
  async getFirstNPriceBookNames(n: number): Promise<string[]> {
    const rows = this.page.locator(S.rowGridAny);
    const count = Math.min(await rows.count(), n);
    const out: string[] = [];
    for (let r = 0; r < count; r++) out.push((await rows.nth(r).locator('td').nth(0).innerText()).replace(/\s+/g, ' ').trim());
    return out;
  }
}
`;

// clients/encore/src/pages/corporate-override/corporate-override.page.ts (verbatim: a poll with a
// single per-element read and no loop; a literal-bounded retry loop; a for-of over a plain array).
const OVERRIDE_BOUNDED = String.raw`
export class CorporatePricingOverridePage extends BasePage {
  async waitForLocationPickerRows(): Promise<void> {
    await expect
      .poll(
        async () => {
          const rows = this.page.locator('[role="dialog"] tbody tr');
          const count = await rows.count();
          if (count === 0) return false;
          const firstText = await rows.first().innerText();
          return firstText.trim().length > 0;
        },
        { timeout: 60_000, intervals: [500, 500, 1_000, 1_000, 2_000] },
      )
      .toBe(true);
  }

  async ensureDefaultState(anchor: string, defaults: Defaults, needle: string, office: string, tab: OverrideTab): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.reloadAndReselect(needle, office);
      if (tab !== 'Equipment') await this.switchOverrideTab(tab);
      const row = await this.findRowByProductGroup(anchor);
      if (!row) throw new Error('ensureDefaultState: row not found');
      const priceOk = CorporatePricingOverridePage.numEq(await this.readOverridePrice(row), defaults.overridePrice);
      if (!priceOk) await this.setOverridePrice(row, defaults.overridePrice);
      if (await this.isOverrideSaveEnabled()) await this.saveAndConfirm();
    }
  }

  async checkAllGridColumns(needle: string, office: string): Promise<void> {
    await this.openGridOptions();
    const cols = await this.getGridOptionColumns();
    for (const c of cols) if (!c.checked) await this.toggleGridColumn(c.label);
    await this.closeGridOptions();
  }
}
`;

// clients/encore/src/pages/corporate-pricing/corporate-pricing.page.ts (verbatim) — a scroll-bounded
// retry loop whose bound is a parameter, not a grid size.
const PRICING_BOUNDED = String.raw`
export class CorporatePricingPage extends BasePage {
  @step('Find grid row by content')
  async findGridRowByContent(needle: string, maxScrolls = 40): Promise<Locator | null> {
    for (let s = 0; s < maxScrolls; s++) {
      const row = this.page.locator(S.rowGridAny, { hasText: needle }).first();
      if ((await row.count()) > 0 && (await row.isVisible().catch(() => false))) return row;
      await this.page.mouse.wheel(0, 600);
      await this.waitForAngularStable(2_000).catch(() => { /* best-effort */ });
    }
    return null;
  }
}
`;

test('real bounded read: Math.min(await rows.count(), n) is silent in BOTH tiers', () => {
  const r = findPerRowAwaits(NEW_PRICEBOOK_BOUNDED);
  assertEq(r.tier1.length, 0, 'a capped read is correct code');
  assertEq(r.tier2.length, 0, 'a capped read is not the broader class either');
});

test('real bounded reads: booleanCellsValid + getFirstNPriceBookNames stay silent', () => {
  const r = findPerRowAwaits(SEARCH_BOUNDED);
  assertEq(r.tier1.length, 0);
  assertEq(r.tier2.length, 0);
});

test('real code: an expect.poll with a single first() read and no loop stays silent', () => {
  const r = findPerRowAwaits(OVERRIDE_BOUNDED);
  assertEq(r.tier1.length, 0, 'a poll is not itself the defect — the per-element loop under it is');
  assertEq(r.tier2.length, 0, 'a literal-bounded retry loop and a for-of over a plain array are fine');
});

test('real code: a parameter-bounded scroll retry loop stays silent', () => {
  const r = findPerRowAwaits(PRICING_BOUNDED);
  assertEq(r.tier1.length, 0);
  assertEq(r.tier2.length, 0);
});

// =============================================================================================
// TIER 2 — the broader class is announced, never enforced.
// =============================================================================================

// clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts (verbatim) — an
// uncapped count-bounded per-element read that is NOT under a wait budget: tier 2 only.
const SEARCH_UNCAPPED = String.raw`
export class SearchPage extends BasePage {
  @step('Read column for visible rows')
  async readColumnForVisibleRows(name: string): Promise<string[]> {
    const idx = await this.getColumnIndexByName(name);
    if (idx < 0) throw new Error('column not found');
    const rows = this.page.locator(S.rowGridAny);
    const n = await rows.count();
    const out: string[] = [];
    for (let r = 0; r < n; r++) out.push((await rows.nth(r).locator('td').nth(idx).innerText()).replace(/\s+/g, ' ').trim());
    return out;
  }
}
`;

test('real uncapped read with no wait budget above it is TIER 2 only', () => {
  const r = findPerRowAwaits(SEARCH_UNCAPPED);
  assertEq(r.tier1.length, 0, 'no fixed budget above it → announce, do not enforce');
  assertEq(r.tier2.length, 1);
  assertEq(r.tier2[0].alsoTier1, false);
});

test('the same method DOES become TIER 1 once a poll depends on it', () => {
  const withPoll = SEARCH_UNCAPPED.replace('export class SearchPage extends BasePage {', String.raw`
export class SearchPage extends BasePage {
  async waitForGrid(): Promise<void> {
    await expect.poll(async () => (await this.readColumnForVisibleRows('Name')).length > 0, { timeout: 30_000 }).toBe(true);
  }
`);
  const r = findPerRowAwaits(withPoll);
  assertEq(r.tier1.length, 1, 'the budget is what makes the unbounded cost fatal');
  assertEq(r.tier2[0].alsoTier1, true);
});

// =============================================================================================
// Reachability, other wait shapes, escape hatch, edges.
// =============================================================================================

test('reachability is transitive across same-file this.method() hops', () => {
  const src = String.raw`
export class P extends BasePage {
  async waitReady(): Promise<void> {
    await expect.poll(() => this.hopOne(), { timeout: 15_000 }).toBe(true);
  }
  async hopOne(): Promise<boolean> { return (await this.hopTwo()).length > 0; }
  async hopTwo(): Promise<string[]> {
    const rows = this.page.locator('tbody tr');
    const n = await rows.count();
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(await rows.nth(i).innerText());
    return out;
  }
}
`;
  const r = findPerRowAwaits(src);
  assertEq(r.tier1.length, 1, 'poll -> hopOne -> hopTwo -> loop');
  assert(/hopOne -> hopTwo/.test(r.tier1[0].detail), 'the report names the path');
});

test('page.waitForFunction and a generic { timeout } predicate helper both count as budgets', () => {
  const body = String.raw`
  async readAll(): Promise<string[]> {
    const rows = this.page.locator('tbody tr');
    const n = await rows.count();
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(await rows.nth(i).innerText());
    return out;
  }
`;
  const wf = String.raw`
export class P extends BasePage {
  async wait(): Promise<void> {
    await this.page.waitForFunction(async () => (await this.readAll()).length > 0);
  }
` + body + '}';
  const helper = String.raw`
export class P extends BasePage {
  async wait(): Promise<void> {
    await this.retryUntil(async () => (await this.readAll()).length > 0, { timeout: 20_000 });
  }
` + body + '}';
  assertEq(findPerRowAwaits(wf).tier1.length, 1, 'waitForFunction is a budget');
  assertEq(findPerRowAwaits(helper).tier1.length, 1, 'a helper taking a predicate + { timeout } is a budget');
});

test('a for-of over await loc.all() under a poll is TIER 1 (grid-sized, not count-derived)', () => {
  const src = String.raw`
export class P extends BasePage {
  async wait(): Promise<void> {
    await expect.poll(async () => (await this.readAll()).length > 0, { timeout: 30_000 }).toBe(true);
  }
  async readAll(): Promise<string[]> {
    const out: string[] = [];
    for (const row of await this.page.locator('tbody tr').all()) out.push(await row.innerText());
    return out;
  }
}
`;
  const r = findPerRowAwaits(src);
  assertEq(r.tier1.length, 1);
  assertEq(r.tier2.length, 0, 'tier 2 is scoped to the count()-bounded shape by design');
});

test('a test() block containing an arrow and a timeout key is NOT read as a wait budget', () => {
  const src = String.raw`
test('reads the grid', async ({ page }) => {
  const rows = page.locator('tbody tr');
  const n = await rows.count();
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(await rows.nth(i).innerText());
  await expect(page.locator('h1')).toBeVisible({ timeout: 5_000 });
  expect(out.length).toBeGreaterThan(0);
});
`;
  const r = findPerRowAwaits(src);
  assertEq(r.tier1.length, 0, 'a test body is not a fixed wait budget');
  assertEq(r.tier2.length, 1, 'but the loop is still the broader class');
});

test('the per-row-await-exempt marker suppresses a TIER 1 finding', () => {
  const src = PREFIX_SERVICE_CHARGE.replace(
    '    for (let i = 1; i < count; i++) {',
    '    // per-row-await-exempt: header-only grid, capped by the app at 3 rows\n    for (let i = 1; i < count; i++) {',
  );
  assertEq(findPerRowAwaits(src).tier1.length, 0);
});

test('classifyBound distinguishes capped from uncapped', () => {
  const origins = new Map([['n', 'Math.min(await rows.count(), 5)'], ['m', 'await rows.count()'], ['k', '25']]);
  assertEq(classifyBound('n', origins), 'count-capped');
  assertEq(classifyBound('m', origins), 'count-uncapped');
  assertEq(classifyBound('k', origins), 'literal');
  assertEq(classifyBound('3', origins), 'literal');
  assertEq(classifyBound('maxScrolls', origins), 'unknown');
});

test('empty / undefined input is safe', () => {
  assertEq(findPerRowAwaits('').tier1.length, 0);
  assertEq(findPerRowAwaits(undefined).tier1.length, 0);
  assertEq(findPerRowAwaits(undefined).tier2.length, 0);
});

test('walkScanFiles + buildReport across a temp repo (pages AND specs)', () => {
  const repo = makeTmpRepo();
  write(repo, 'clients/acme/src/pages/bad.page.ts', PREFIX_SERVICE_CHARGE);
  write(repo, 'clients/acme/src/pages/good.page.ts', FIXED_SERVICE_CHARGE);
  write(repo, 'clients/acme/src/pages/bounded.page.ts', NEW_PRICEBOOK_BOUNDED);
  write(repo, 'clients/acme/tests/a.spec.ts', "test('x', async () => { await page.click('#a'); });");
  const filePaths = walkScanFiles(repo);
  assertEq(filePaths.length, 4, 'both page objects and specs are in scope');
  const report = buildReport({ repoRoot: repo, filePaths });
  assertEq(report.tier1Total, 1);
  assertEq(report.tier2Total, 1);
  assert(report.files.some((f) => f.file.endsWith('bad.page.ts')));
  assert(!report.files.some((f) => f.file.endsWith('bounded.page.ts')), 'the bounded read is not reported at all');
});

// =============================================================================================
// Integration — re-scan the REAL page objects so the corpus cannot drift into self-agreement.
// =============================================================================================

test('INTEGRATION: the real repo has zero TIER 1 findings, and the real bounded reads are silent', () => {
  const clientsDir = path.join(REPO_ROOT, 'clients');
  if (!fs.existsSync(clientsDir)) { console.log('     (skipped — clients/ not present)'); return; }
  const filePaths = walkScanFiles(REPO_ROOT);
  assert(filePaths.length > 0, 'vacuous-on-zero: nothing to scan means the walker is broken');
  const report = buildReport({ repoRoot: REPO_ROOT, filePaths });
  assertEq(report.tier1Total, 0, 'the repo is clean at tier 1 — any hit here is a real defect or a false positive');

  // The known-correct capped reads must not appear in the tier-2 announce list either.
  const capped = [
    ['clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts', 191],
    ['clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts', 192],
    ['clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts', 1467],
  ];
  for (const [rel, boundLine] of capped) {
    if (!fs.existsSync(path.join(REPO_ROOT, rel))) continue;
    const f = report.files.find((x) => x.file === rel);
    const near = (f?.tier2 ?? []).filter((v) => Math.abs(v.line - boundLine) <= 3);
    assertEq(near.length, 0, `capped read at ${rel}:~${boundLine} must not be announced`);
  }
});

// ---------- runner ----------
let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-per-row-await.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
