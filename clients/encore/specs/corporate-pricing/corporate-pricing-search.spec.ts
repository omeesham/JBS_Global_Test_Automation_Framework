import { test, expect } from '../../src/infra/fixtures';
import { CORP_PRICING_SEARCH } from '../../src/data/testdata/corporate-pricing/search.data';

/**
 * Corporate Pricing — Search screen (NM-1445) — P1 DOCX-functional coverage.
 *
 * 18 P1 cases (TC-LOC-CPR-001..018, Search band) authored by SUBPLAN_CORP_PRICING_1445_SEARCH_P1
 * from the NM-1445 DOCX intent + 30 verified `TC-ENC-PRC-1445-*` helpers + a live walk
 * (field-inventories/corporate-pricing-search-2026-06-05.md). Read-only screen — no mutation.
 *
 * TWO divergences asserted-as-live + RAISED via /encore-questions (Doctrine 2, never silently absorbed):
 *  - D1: DOCX names 8 columns; live renders 9 ("Productions Currency" → Is Productions + Currency).
 *  - D2: DOCX says filtering is client-side; live filters are SERVER-SIDE, on the Search button
 *        (GET /navigator/api/location/pricing/strategies?<staged params>). Typing/selecting only STAGES.
 *
 * React/Next.js + shadcn DataTable (NOT Angular). Network listeners filter `/navigator/api/` (LR-056).
 * Checkboxes via .check()/.uncheck() (ALL-089). No fixed waits (LR-052). No hardcoded 591 (LR-022).
 */
test.describe('Corporate Pricing — Search @corporate-pricing @search', () => {

  test.beforeEach(async ({ corporatePricingSearchPage: cp }) => {
    test.setTimeout(120_000);
    // Per-test nav guard: fresh navigation resets all staged filter state (read-only screen — no
    // ensureDefaultState needed; a fresh load IS the baseline). Mirrors the per-test guard pattern.
    await cp.open('1604');
  });

  // ── Load + structure ────────────────────────────────────────────────────────

  test('TC-LOC-CPR-001: Component loads and calls the Pricebook list endpoint exactly once', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      await cp.open('1604'); // re-navigate with the counter attached
      expect(counter.count()).toBe(1); // exactly one /pricing/strategies call on mount
      expect(await cp.getVisibleRowCount()).toBeGreaterThan(0); // grid populated
      // default query reflects the default filter state (Active Only checked)
      expect(counter.urls()[0]).toContain('isActive=true');
    } finally {
      counter.dispose();
    }
  });

  test('TC-LOC-CPR-002: Grid shows all 8 DOCX columns; live renders 9 (8↔9 split raised)', async ({ corporatePricingSearchPage: cp }) => {
    const headers = await cp.getColumnHeaders();
    // all 7 directly-named DOCX columns present
    for (const name of ['Price Book', 'Price Book Strategy', 'Price Year', 'Is GSO', 'Is Internal', 'Is Labor', 'Is Active']) {
      expect(headers).toContain(name);
    }
    // the DOCX "Productions Currency" is covered by the live split → both must be present
    expect(headers).toContain('Is Productions');
    expect(headers).toContain('Currency');
    // live renders 9 (D1 — divergence raised in encore-questions draft, not silently absorbed)
    expect(await cp.getColumnCount()).toBe(CORP_PRICING_SEARCH.liveColumnCount);
  });

  test('TC-LOC-CPR-003: Filter baseline / default state', async ({ corporatePricingSearchPage: cp }) => {
    expect(await cp.getPricebookFilterValue()).toBe('');
    expect(await cp.getStrategyFilterValue()).toBe('');
    expect(await cp.getLocationDefaultText()).toContain('All Locations');
    expect(await cp.getCurrencyDefaultText()).toContain('All Currencies');
    expect(await cp.getCheckboxState('isInternal')).toBe(false);
    expect(await cp.getCheckboxState('isLabor')).toBe(false);
    expect(await cp.getCheckboxState('activeOnly')).toBe(true); // default CHECKED
    expect(await cp.getItemCountText()).toMatch(CORP_PRICING_SEARCH.itemCountPattern);
  });

  test('TC-LOC-CPR-004: Boolean columns render Unicode ✔ / empty', async ({ corporatePricingSearchPage: cp }) => {
    const { hasTrue, allValid } = await cp.booleanCellsValid();
    expect(hasTrue).toBe(true); // at least one ✔ among rendered rows
    expect(allValid).toBe(true); // every boolean cell is ✔ or empty (LR-036)
  });

  // ── Text filters (stage → Search server-side) ────────────────────────────────

  test('TC-LOC-CPR-005: Pricebook filter stages on type, then Search narrows server-side', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      const before = await cp.getItemCountNumber();
      await cp.fillPricebookFilter(CORP_PRICING_SEARCH.pricebookFilterSample.value);
      expect(counter.count()).toBe(0); // staged — no call on type
      expect(await cp.getItemCountNumber()).toBe(before); // grid unchanged while staged

      const url = await cp.searchAndWaitForList();
      expect(url).toContain(`pricebookName=${CORP_PRICING_SEARCH.pricebookFilterSample.value}`);
      // poll for the count to settle (server response → grid re-render has a brief lag; LR-052-clean)
      await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeLessThan(before);
      const row = await cp.findRowByName(CORP_PRICING_SEARCH.pricebookFilterSample.expectedName);
      expect(row).not.toBeNull();

      // clearing + Search broadens again. NOTE: the broadened query reverts to the default
      // (isActive=true, no name) which equals the initial-load query → the app serves it from cache
      // and fires NO new request (verified via trace — only 2 strategies calls total). So do NOT wait
      // for a response here; just click Search and assert the grid broadens (LR-052-clean poll).
      await cp.clearPricebookFilter();
      await cp.clickSearch();
      await expect.poll(async () => cp.getItemCountNumber(), { timeout: 15_000 }).toBeGreaterThan(1);
    } finally {
      counter.dispose();
    }
  });

  test('TC-LOC-CPR-006: Pricing Strategy is a text filter (not a dropdown); stages then Search applies', async ({ corporatePricingSearchPage: cp }) => {
    expect(await cp.getStrategyFilterValue()).toBe(''); // it is an <input> (would throw if a combobox)
    const counter = cp.attachListCallCounter();
    try {
      await cp.fillStrategyFilter('Tier');
      expect(counter.count()).toBe(0); // staged — no call on type
      expect(await cp.getStrategyFilterValue()).toBe('Tier');

      await cp.searchAndWaitForList(); // Search fires exactly one server query
      expect(counter.count()).toBe(1);
    } finally {
      counter.dispose();
    }
  });

  // ── Dropdown filters ─────────────────────────────────────────────────────────

  test('TC-LOC-CPR-007: Currency dropdown options + select stages then Search applies', async ({ corporatePricingSearchPage: cp }) => {
    const opts = await cp.getCurrencyOptions();
    expect(opts).toEqual([...CORP_PRICING_SEARCH.currencyOptions]); // [All Currencies, USD, CAD, MXN]

    const counter = cp.attachListCallCounter();
    try {
      await cp.selectCurrency('USD');
      expect(counter.count()).toBe(0); // selection staged — no call
      await cp.searchAndWaitForList();
      expect(counter.count()).toBe(1); // Search submits the server query
    } finally {
      counter.dispose();
    }
  });

  test('TC-LOC-CPR-008: Location dropdown default + searchable options present', async ({ corporatePricingSearchPage: cp }) => {
    expect(await cp.getLocationDefaultText()).toContain('All Locations');
    // Virtualized/lazy popover (live 2652) — poll until it populates; exact count NOT asserted (LR-022/LR-025).
    await expect
      .poll(async () => (await cp.getLocationOptions()).length, { timeout: 15_000 })
      .toBeGreaterThan(CORP_PRICING_SEARCH.locationOptionFloor);
    const opts = await cp.getLocationOptions();
    expect(opts).toContain(CORP_PRICING_SEARCH.locationFirstEntry); // "Clear selection" present
  });

  // ── Checkbox filters (stage → Search server-side) ────────────────────────────

  test('TC-LOC-CPR-009: Is Internal stages then Search narrows to internal pricebooks', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      const before = await cp.getItemCountNumber();
      await cp.setCheckbox('isInternal', true);
      expect(await cp.getCheckboxState('isInternal')).toBe(true);
      expect(counter.count()).toBe(0); // staged
      expect(await cp.getItemCountNumber()).toBe(before); // grid unchanged while staged

      const url = await cp.searchAndWaitForList();
      expect(url).toContain('isInternal=true');
      await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeLessThan(before); // narrowed to internal rows
    } finally {
      counter.dispose();
    }
  });

  test('TC-LOC-CPR-010: Is Labor stages then Search submits the labor filter', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      await cp.setCheckbox('isLabor', true);
      expect(await cp.getCheckboxState('isLabor')).toBe(true);
      expect(counter.count()).toBe(0); // staged
      const url = await cp.searchAndWaitForList();
      expect(url).toContain('isLabor=true');
    } finally {
      counter.dispose();
    }
  });

  test('TC-LOC-CPR-011: Active Only default-checked; unchecking + Search reveals inactive rows', async ({ corporatePricingSearchPage: cp }) => {
    expect(await cp.getCheckboxState('activeOnly')).toBe(true); // default
    const before = await cp.getItemCountNumber();
    await cp.setCheckbox('activeOnly', false);
    expect(await cp.getCheckboxState('activeOnly')).toBe(false);
    await cp.searchAndWaitForList();
    // turning off Active Only includes inactive pricebooks too → count does not shrink
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeGreaterThanOrEqual(before);
  });

  // ── Reset ────────────────────────────────────────────────────────────────────

  test('TC-LOC-CPR-012: Reset clears every filter input and restores the full list', async ({ corporatePricingSearchPage: cp }) => {
    // stage + apply a narrowing filter
    await cp.fillPricebookFilter(CORP_PRICING_SEARCH.pricebookFilterSample.value);
    await cp.setCheckbox('isInternal', true);
    await cp.searchAndWaitForList();
    const narrowed = await cp.getItemCountNumber();

    await cp.clickReset();

    expect(await cp.getPricebookFilterValue()).toBe('');
    expect(await cp.getStrategyFilterValue()).toBe('');
    expect(await cp.getCheckboxState('isInternal')).toBe(false);
    expect(await cp.getCheckboxState('isLabor')).toBe(false);
    expect(await cp.getCheckboxState('activeOnly')).toBe(true); // default restored
    expect(await cp.getLocationDefaultText()).toContain('All Locations');
    expect(await cp.getCurrencyDefaultText()).toContain('All Currencies');
    // full list restored (client-side) — count back above the narrowed subset
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeGreaterThan(narrowed);
  });

  // ── D2 network classification ────────────────────────────────────────────────

  test('TC-LOC-CPR-013: No network request fires while typing or selecting filters (client-side staging)', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      await cp.fillPricebookFilter('abc');
      await cp.setCheckbox('isInternal', true);
      await cp.getCurrencyOptions(); // open + close dropdown
      expect(counter.count()).toBe(0); // zero list calls during staging (D2 — staged client-side)
    } finally {
      counter.dispose();
    }
  });

  test('TC-LOC-CPR-014: Search submits the staged filters as a single server query', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      await cp.setCheckbox('isInternal', true);
      expect(counter.count()).toBe(0);
      const url = await cp.searchAndWaitForList();
      expect(counter.count()).toBe(1); // exactly one server query on Search
      expect(url).toContain('/navigator/api/location/pricing/strategies');
      expect(url).toContain('isInternal=true');
    } finally {
      counter.dispose();
    }
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  test('TC-LOC-CPR-015: Clicking a Price Book name navigates to the Pricebook Details route', async ({ corporatePricingSearchPage: cp }) => {
    await cp.clickPricebookName(CORP_PRICING_SEARCH.pricebookFilterSample.expectedName);
    await expect(cp.page).toHaveURL(/\/corporate-pricing\/details\/[0-9a-f-]+/i);
    await expect(cp.page.locator('h1', { hasText: 'Corporate Pricing Details' })).toBeVisible();
  });

  test('TC-LOC-CPR-016: New Equipment Pricing option opens the equipment add page', async ({ corporatePricingSearchPage: cp }) => {
    await cp.clickNewEquipmentPricing();
    await expect(cp.page).toHaveURL(/\/corporate-pricing\/add\?type=equipment/i, { timeout: 15_000 });
  });

  test('TC-LOC-CPR-017: New Labor Pricing option opens the labor add page', async ({ corporatePricingSearchPage: cp }) => {
    await cp.clickNewLaborPricing();
    await expect(cp.page).toHaveURL(/\/corporate-pricing\/add\?type=labor/i, { timeout: 15_000 });
  });

  // ── Action bar ───────────────────────────────────────────────────────────────

  test('TC-LOC-CPR-018: Action-bar buttons are present and New behaves as a button', async ({ corporatePricingSearchPage: cp }) => {
    // Assert via the shadow-pierced textContent set (Playwright's :text-is misses these labels at the
    // test render). Poll until the action bar has rendered (it lands shortly after the grid row).
    await expect
      .poll(async () => (await cp.getAllButtonTexts()).filter((t) => CORP_PRICING_SEARCH.actionButtons.includes(t as never)).length, { timeout: 10_000 })
      .toBe(CORP_PRICING_SEARCH.actionButtons.length);
    const btns = await cp.getAllButtonTexts();
    for (const label of CORP_PRICING_SEARCH.actionButtons) {
      expect(btns, `action-bar button "${label}" present`).toContain(label);
    }
    // New opens its Equipment/Labor menu (affordance) — then dismiss
    await cp.openNewMenu();
    await cp.page.keyboard.press('Escape');
  });

});
