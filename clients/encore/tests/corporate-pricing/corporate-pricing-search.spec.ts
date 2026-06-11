import { test, expect } from '../../src/fixtures/pages.fixture';
import { CORP_PRICING_SEARCH } from '../../src/data/corporate-pricing/search';

/**
 * Corporate Pricing — Search screen — functional + field-coverage (two-describe shape).
 *
 *  - Field-coverage describe (top, 12 cases TC-CPR-SRC-019..030): BVA / special / each-option / compound / reset-idempotency,
 *    live-walked 2026-06-10. Read-only → Search-cycle (stage→Search→server→restore).
 *  - Functional describe (below, 18 cases TC-CPR-SRC-001..018): the requirements + a live walk, 2026-06-05.
 *
 * Read-only screen — no mutation. Query-param contract (verified): pricebookName / pricingStrategyName /
 * currencyId (USD=1,CAD=2,MXN=3) / locationNo / isInternal / isLabor / isActive (omitted when Active Only unchecked).
 *
 * TWO functional divergences asserted-as-live + raised as clarifications (never silently absorbed):
 *  - Columns: the requirements name 8 columns; live renders 9 ("Productions Currency" → Is Productions + Currency).
 *  - Filtering: the requirements say filtering is client-side; live filters are SERVER-SIDE, on the Search button.
 *
 * React/Next.js + shadcn DataTable (NOT Angular). Network listeners filter `/navigator/api/`.
 * Checkboxes via .check()/.uncheck(). No fixed waits. No hardcoded 591.
 */
test.describe('Corporate Pricing — Search FCC: BVA, each-option, combined & reset @corporate-pricing @search', () => {

  test.beforeEach(async ({ corporatePricingSearchPage: cp }) => {
    test.setTimeout(120_000);
    // Read-only screen → a fresh nav IS the per-test baseline: it resets every staged filter.
    await cp.open();
  });

  // ── Pricebook text filter — BVA / negative (each carries the announced + escapable rejection check) ──

  test('TC-CPR-SRC-019: Pricebook no-match input returns zero results server-side', async ({ corporatePricingSearchPage: cp }) => {
    await cp.fillPricebookFilter(CORP_PRICING_SEARCH.fcc.pricebookNoMatch);
    const url = await cp.searchAndWaitForList();
    expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.pricebook}=${CORP_PRICING_SEARCH.fcc.pricebookNoMatch}`);
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBe(0);
  });

  test('TC-CPR-SRC-020: Pricebook accepts a 250-char value with no truncation; server returns zero, no crash', async ({ corporatePricingSearchPage: cp }) => {
    const probe = await cp.probePricebookBoundary(CORP_PRICING_SEARCH.fcc.pricebookOverflow);
    expect(probe.stagedLen).toBe(250); // no maxlength truncation
    expect(probe.ariaInvalid).toBeNull(); // (a): no false rejection signal
    expect(probe.escaped).toBe(true); // (b): a natural Tab escapes — no focus-trap
    expect(probe.pageError).toBe(0); // no client-side exception
    const url = await cp.searchAndWaitForList();
    expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.pricebook}=`);
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBe(0);
  });

  test('TC-CPR-SRC-021: Pricebook accepts special characters literally, URL-encodes them, no crash, escapable', async ({ corporatePricingSearchPage: cp }) => {
    const probe = await cp.probePricebookBoundary(CORP_PRICING_SEARCH.fcc.pricebookSpecial);
    expect(probe.staged).toBe(CORP_PRICING_SEARCH.fcc.pricebookSpecial); // accepted literally
    expect(probe.ariaInvalid).toBeNull(); // (a)
    expect(probe.escaped).toBe(true); // (b)
    expect(probe.pageError).toBe(0); // crash-safe (unlike the Radix combobox)
    const url = await cp.searchAndWaitForList();
    expect(url).toContain(CORP_PRICING_SEARCH.fcc.pricebookSpecialEncoded); // URL-encoded in the query
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBe(0);
  });

  test('TC-CPR-SRC-022: Pricebook whitespace-only returns the full list (server ignores whitespace)', async ({ corporatePricingSearchPage: cp }) => {
    const probe = await cp.probePricebookBoundary(CORP_PRICING_SEARCH.fcc.pricebookWhitespace);
    expect(probe.escaped).toBe(true); // (b)
    expect(probe.pageError).toBe(0);
    const url = await cp.searchAndWaitForList();
    expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.pricebook}=`);
    // whitespace is NOT a 0-result — the server returns the full list
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeGreaterThan(1);
    expect(await cp.getItemCountText()).toMatch(CORP_PRICING_SEARCH.itemCountPattern);
  });

  test('TC-CPR-SRC-023: Pricing Strategy no-match filter (pricingStrategyName) returns zero results', async ({ corporatePricingSearchPage: cp }) => {
    await cp.fillStrategyFilter(CORP_PRICING_SEARCH.fcc.strategyNoMatch);
    const url = await cp.searchAndWaitForList();
    expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.strategy}=${CORP_PRICING_SEARCH.fcc.strategyNoMatch}`);
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBe(0);
  });

  // ── Dropdown each-option ──────────────────────────────────────────────────────

  test('TC-CPR-SRC-024: Currency each-option (USD/CAD/MXN) submits the matching currencyId', async ({ corporatePricingSearchPage: cp }) => {
    for (const [name, id] of Object.entries(CORP_PRICING_SEARCH.fcc.currencyId)) {
      await cp.selectCurrency(name);
      const url = await cp.searchAndWaitForList();
      expect(url, `currency ${name} → ${CORP_PRICING_SEARCH.fcc.params.currency}=${id}`)
        .toContain(`${CORP_PRICING_SEARCH.fcc.params.currency}=${id}`);
      await cp.clickReset(); // restores the combobox to "All Currencies" for the next option
    }
  });

  test('TC-CPR-SRC-025: Location filter submits locationNo and narrows the grid (representative)', async ({ corporatePricingSearchPage: cp }) => {
    const baseline = await cp.getItemCountNumber();
    const label = await cp.selectFirstRealLocation(); // e.g. "1101 - Corporate Office …"
    const officeNo = (label.match(/^(\d+)/) ?? [])[1];
    expect(officeNo, `office number parsed from "${label}"`).toBeTruthy();
    const url = await cp.searchAndWaitForList();
    expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.location}=${officeNo}`);
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeLessThanOrEqual(baseline);
  });

  // ── Checkbox toggle + revert symmetry ─────────────────────────────────────────

  test('TC-CPR-SRC-026: Is Internal toggle + revert restores the baseline', async ({ corporatePricingSearchPage: cp }) => {
    const base = await cp.getItemCountNumber();
    await cp.setCheckbox('isInternal', true);
    const url = await cp.searchAndWaitForList();
    expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.isInternal}=true`);
    await cp.setCheckbox('isInternal', false);
    await cp.clickSearch(); // revert query equals the default load → served from cache (no response to await)
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 15_000 }).toBe(base);
  });

  test('TC-CPR-SRC-027: Is Labor toggle + revert restores the baseline (labor is a different set, not a narrow)', async ({ corporatePricingSearchPage: cp }) => {
    const base = await cp.getItemCountNumber();
    await cp.setCheckbox('isLabor', true);
    const url = await cp.searchAndWaitForList();
    expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.isLabor}=true`);
    // do NOT assert on→narrow: the labor population can be LARGER than the non-labor default. Assert the revert.
    await cp.setCheckbox('isLabor', false);
    await cp.clickSearch();
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 15_000 }).toBe(base);
  });

  test('TC-CPR-SRC-028: Active Only uncheck omits isActive and reveals inactive rows; re-check restores', async ({ corporatePricingSearchPage: cp }) => {
    const base = await cp.getItemCountNumber();
    expect(await cp.getCheckboxState('activeOnly')).toBe(true); // default checked
    await cp.setCheckbox('activeOnly', false);
    const url = await cp.searchAndWaitForList();
    expect(url).not.toContain(CORP_PRICING_SEARCH.fcc.params.isActive); // param OMITTED when unchecked
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeGreaterThanOrEqual(base);
    await cp.setCheckbox('activeOnly', true);
    await cp.clickSearch(); // re-checked query equals the default load → cached
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 15_000 }).toBe(base);
  });

  // ── Reset idempotency + compound ──────────────────────────────────────────────

  test('TC-CPR-SRC-029: Reset is idempotent and fires no server request', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      await cp.fillPricebookFilter(CORP_PRICING_SEARCH.fcc.pricebookBroad);
      await cp.setCheckbox('isInternal', true);
      await cp.searchAndWaitForList();
      const afterSearch = counter.count(); // 1
      await cp.clickReset();
      await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeGreaterThan(1); // full list restored
      expect(counter.count()).toBe(afterSearch); // Reset fired NO server call (client-side restore)
      await cp.clickReset(); // double Reset on the already-clean state
      expect(counter.count()).toBe(afterSearch); // still no call — no-op
      expect(await cp.getPricebookFilterValue()).toBe(''); // inputs cleared
      expect(await cp.getCheckboxState('isInternal')).toBe(false);
    } finally {
      counter.dispose();
    }
  });

  test('TC-CPR-SRC-030: Combined multi-filter submits a single server query carrying every staged filter', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      await cp.fillPricebookFilter(CORP_PRICING_SEARCH.fcc.pricebookBroad);
      await cp.selectCurrency('USD');
      await cp.setCheckbox('isInternal', true);
      expect(counter.count()).toBe(0); // staged — no call while staging multiple filters
      const url = await cp.searchAndWaitForList();
      expect(counter.count()).toBe(1); // exactly one server query on Search
      expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.pricebook}=${CORP_PRICING_SEARCH.fcc.pricebookBroad}`);
      expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.currency}=${CORP_PRICING_SEARCH.fcc.currencyId.USD}`);
      expect(url).toContain(`${CORP_PRICING_SEARCH.fcc.params.isInternal}=true`);
      await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeGreaterThanOrEqual(0); // grid re-rendered (numeric count)
    } finally {
      counter.dispose();
    }
  });

});

test.describe('Corporate Pricing — Search @corporate-pricing @search', () => {

  test.beforeEach(async ({ corporatePricingSearchPage: cp }) => {
    test.setTimeout(120_000);
    // Per-test nav guard: fresh navigation resets all staged filter state (read-only screen — no
    // ensureDefaultState needed; a fresh load IS the baseline). Mirrors the per-test guard pattern.
    await cp.open('1604');
  });

  // ── Load + structure ────────────────────────────────────────────────────────

  test('TC-CPR-SRC-001: Component loads and calls the Pricebook list endpoint exactly once', async ({ corporatePricingSearchPage: cp }) => {
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

  test('TC-CPR-SRC-002: Grid shows all 8 named columns; live renders 9 (8↔9 split raised)', async ({ corporatePricingSearchPage: cp }) => {
    const headers = await cp.getColumnHeaders();
    // all 7 directly-named columns present
    for (const name of ['Price Book', 'Price Book Strategy', 'Price Year', 'Is GSO', 'Is Internal', 'Is Labor', 'Is Active']) {
      expect(headers).toContain(name);
    }
    // the requirements' "Productions Currency" is covered by the live split → both must be present
    expect(headers).toContain('Is Productions');
    expect(headers).toContain('Currency');
    // live renders 9 (divergence raised as a clarification, not silently absorbed)
    expect(await cp.getColumnCount()).toBe(CORP_PRICING_SEARCH.liveColumnCount);
  });

  test('TC-CPR-SRC-003: Filter baseline / default state', async ({ corporatePricingSearchPage: cp }) => {
    expect(await cp.getPricebookFilterValue()).toBe('');
    expect(await cp.getStrategyFilterValue()).toBe('');
    expect(await cp.getLocationDefaultText()).toContain('All Locations');
    expect(await cp.getCurrencyDefaultText()).toContain('All Currencies');
    expect(await cp.getCheckboxState('isInternal')).toBe(false);
    expect(await cp.getCheckboxState('isLabor')).toBe(false);
    expect(await cp.getCheckboxState('activeOnly')).toBe(true); // default CHECKED
    expect(await cp.getItemCountText()).toMatch(CORP_PRICING_SEARCH.itemCountPattern);
  });

  test('TC-CPR-SRC-004: Boolean columns render Unicode ✔ / empty', async ({ corporatePricingSearchPage: cp }) => {
    const { hasTrue, allValid } = await cp.booleanCellsValid();
    expect(hasTrue).toBe(true); // at least one ✔ among rendered rows
    expect(allValid).toBe(true); // every boolean cell is ✔ or empty
  });

  // ── Text filters (stage → Search server-side) ────────────────────────────────

  test('TC-CPR-SRC-005: Pricebook filter stages on type, then Search narrows server-side', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      const before = await cp.getItemCountNumber();
      await cp.fillPricebookFilter(CORP_PRICING_SEARCH.pricebookFilterSample.value);
      expect(counter.count()).toBe(0); // staged — no call on type
      expect(await cp.getItemCountNumber()).toBe(before); // grid unchanged while staged

      const url = await cp.searchAndWaitForList();
      expect(url).toContain(`pricebookName=${CORP_PRICING_SEARCH.pricebookFilterSample.value}`);
      // poll for the count to settle (server response → grid re-render has a brief lag)
      await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeLessThan(before);
      const row = await cp.findRowByName(CORP_PRICING_SEARCH.pricebookFilterSample.expectedName);
      expect(row).not.toBeNull();

      // clearing + Search broadens again. NOTE: the broadened query reverts to the default
      // (isActive=true, no name) which equals the initial-load query → the app serves it from cache
      // and fires NO new request (verified via trace — only 2 strategies calls total). So do NOT wait
      // for a response here; just click Search and assert the grid broadens (no fixed sleep).
      await cp.clearPricebookFilter();
      await cp.clickSearch();
      await expect.poll(async () => cp.getItemCountNumber(), { timeout: 15_000 }).toBeGreaterThan(1);
    } finally {
      counter.dispose();
    }
  });

  test('TC-CPR-SRC-006: Pricing Strategy is a text filter (not a dropdown); stages then Search applies', async ({ corporatePricingSearchPage: cp }) => {
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

  test('TC-CPR-SRC-007: Currency dropdown options + select stages then Search applies', async ({ corporatePricingSearchPage: cp }) => {
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

  test('TC-CPR-SRC-008: Location dropdown default + searchable options present', async ({ corporatePricingSearchPage: cp }) => {
    expect(await cp.getLocationDefaultText()).toContain('All Locations');
    // Virtualized/lazy popover (live 2652) — poll until it populates; exact count NOT asserted.
    await expect
      .poll(async () => (await cp.getLocationOptions()).length, { timeout: 15_000 })
      .toBeGreaterThan(CORP_PRICING_SEARCH.locationOptionFloor);
    const opts = await cp.getLocationOptions();
    expect(opts).toContain(CORP_PRICING_SEARCH.locationFirstEntry); // "Clear selection" present
  });

  // ── Checkbox filters (stage → Search server-side) ────────────────────────────

  test('TC-CPR-SRC-009: Is Internal stages then Search narrows to internal pricebooks', async ({ corporatePricingSearchPage: cp }) => {
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

  test('TC-CPR-SRC-010: Is Labor stages then Search submits the labor filter', async ({ corporatePricingSearchPage: cp }) => {
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

  test('TC-CPR-SRC-011: Active Only default-checked; unchecking + Search reveals inactive rows', async ({ corporatePricingSearchPage: cp }) => {
    expect(await cp.getCheckboxState('activeOnly')).toBe(true); // default
    const before = await cp.getItemCountNumber();
    await cp.setCheckbox('activeOnly', false);
    expect(await cp.getCheckboxState('activeOnly')).toBe(false);
    await cp.searchAndWaitForList();
    // turning off Active Only includes inactive pricebooks too → count does not shrink
    await expect.poll(async () => cp.getItemCountNumber(), { timeout: 10_000 }).toBeGreaterThanOrEqual(before);
  });

  // ── Reset ────────────────────────────────────────────────────────────────────

  test('TC-CPR-SRC-012: Reset clears every filter input and restores the full list', async ({ corporatePricingSearchPage: cp }) => {
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

  // ── Network classification ────────────────────────────────────────────────

  test('TC-CPR-SRC-013: No network request fires while typing or selecting filters (client-side staging)', async ({ corporatePricingSearchPage: cp }) => {
    const counter = cp.attachListCallCounter();
    try {
      await cp.fillPricebookFilter('abc');
      await cp.setCheckbox('isInternal', true);
      await cp.getCurrencyOptions(); // open + close dropdown
      expect(counter.count()).toBe(0); // zero list calls during staging (staged client-side)
    } finally {
      counter.dispose();
    }
  });

  test('TC-CPR-SRC-014: Search submits the staged filters as a single server query', async ({ corporatePricingSearchPage: cp }) => {
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

  test('TC-CPR-SRC-015: Clicking a Price Book name navigates to the Pricebook Details route', async ({ corporatePricingSearchPage: cp }) => {
    await cp.clickPricebookName(CORP_PRICING_SEARCH.pricebookFilterSample.expectedName);
    await expect(cp.page).toHaveURL(/\/corporate-pricing\/details\/[0-9a-f-]+/i);
    await expect(cp.page.locator('h1', { hasText: 'Corporate Pricing Details' })).toBeVisible();
  });

  test('TC-CPR-SRC-016: New Equipment Pricing option opens the equipment add page', async ({ corporatePricingSearchPage: cp }) => {
    await cp.clickNewEquipmentPricing();
    await expect(cp.page).toHaveURL(/\/corporate-pricing\/add\?type=equipment/i, { timeout: 15_000 });
  });

  test('TC-CPR-SRC-017: New Labor Pricing option opens the labor add page', async ({ corporatePricingSearchPage: cp }) => {
    await cp.clickNewLaborPricing();
    await expect(cp.page).toHaveURL(/\/corporate-pricing\/add\?type=labor/i, { timeout: 15_000 });
  });

  // ── Action bar ───────────────────────────────────────────────────────────────

  test('TC-CPR-SRC-018: Action-bar buttons are present and New behaves as a button', async ({ corporatePricingSearchPage: cp }) => {
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
