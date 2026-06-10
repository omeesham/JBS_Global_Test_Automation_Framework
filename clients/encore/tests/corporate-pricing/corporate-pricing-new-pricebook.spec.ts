import { test, expect } from '../../src/fixtures/pages.fixture';
import { NEW_PRICEBOOK } from '../../src/data/corporate-pricing/new-pricebook';

/**
 * Corporate Pricing — New Pricebook create flow, NM-1440.
 * TC-LOC-CPR-301..330. Live-grounded 2026-06-09 (Equipment + Labor route options).
 *
 * MUTATION SAFETY: NO-COMMIT. A created pricebook is irreversible via the UI (no delete/deactivate),
 * so save-cycle TCs assert Save *reachability* (Save enabled → "Save Changes" dialog →
 * Cancel) and never confirm. Baseline = a fresh, always-empty create page per test
 * (`open(type)` in `beforeEach`). React-controlled inputs filled via the page object's `setReactInput`
 * (native value-setter — `.fill()` does not commit React state). No fixed waits.
 *
 * Divergences raised: Type is disabled, the strategy dialog has no Type field, a decimal year is
 * accepted client-side, there is no delete, and ≥1 strategy is required before Save.
 */
test.describe('Corporate Pricing — New Pricebook (Equipment) @corporate-pricing @new-pricebook', () => {
  test.beforeEach(async ({ corporatePricingNewPricebookPage: p }) => {
    await p.open('equipment'); // baseline: fresh, empty create page
  });

  // ── Page + header presence / defaults ───────────────────────────────────────

  test('TC-LOC-CPR-301: Equipment create page loads via the type route param', async ({ corporatePricingNewPricebookPage: p }) => {
    expect(await p.getHeading()).toBe('New Pricebook');
    expect(p.page.url()).toContain('type=equipment');
  });

  test('TC-LOC-CPR-302: Pricebook Name field is present and editable', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setName(NEW_PRICEBOOK.validName);
    expect(await p.getName()).toBe(NEW_PRICEBOOK.validName);
  });

  test('TC-LOC-CPR-303: Price Book Type shows Equipment and is read-only (route-fixed)', async ({ corporatePricingNewPricebookPage: p }) => {
    expect(await p.getTypeValue()).toBe(NEW_PRICEBOOK.typeDisplay.equipment);
    expect(await p.isTypeDisabled()).toBe(true); // Type is route-fixed (display-only)
  });

  test('TC-LOC-CPR-304: Price Year field is present and editable', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setYear(NEW_PRICEBOOK.validYear);
    expect(await p.getYear()).toBe(NEW_PRICEBOOK.validYear);
  });

  test('TC-LOC-CPR-305: Currency defaults to USD', async ({ corporatePricingNewPricebookPage: p }) => {
    expect(await p.getCurrencyValue()).toBe(NEW_PRICEBOOK.currencyDefault);
  });

  test('TC-LOC-CPR-306: Currency dropdown offers USD, CAD, MXN', async ({ corporatePricingNewPricebookPage: p }) => {
    const opts = await p.getCurrencyOptions();
    for (const c of NEW_PRICEBOOK.currencyOptions) expect(opts).toContain(c);
  });

  test('TC-LOC-CPR-307: Tabs render — Pricing Strategy + Pricing Detail', async ({ corporatePricingNewPricebookPage: p }) => {
    const tabs = await p.getTabs();
    expect(tabs).toContain('Pricing Strategy');
    expect(tabs).toContain('Pricing Detail');
  });

  // ── Name field-coverage ─────────────────────────────────────────────────────────────────

  test('TC-LOC-CPR-308: Single-character Pricebook Name keeps the form savable', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setYear(NEW_PRICEBOOK.validYear);
    await p.addStrategy();
    await p.setName(NEW_PRICEBOOK.singleCharName);
    expect(await p.isSaveEnabled()).toBe(true);
  });

  test('TC-LOC-CPR-309: Long Pricebook Name (250 chars) is accepted', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setYear(NEW_PRICEBOOK.validYear);
    await p.addStrategy();
    await p.setName(NEW_PRICEBOOK.longName);
    expect((await p.getName()).length).toBe(250); // no client truncation
    expect(await p.isSaveEnabled()).toBe(true);
  });

  test('TC-LOC-CPR-310: Special characters in Pricebook Name are accepted', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setYear(NEW_PRICEBOOK.validYear);
    await p.addStrategy();
    await p.setName(NEW_PRICEBOOK.specialName);
    expect(await p.getName()).toBe(NEW_PRICEBOOK.specialName);
    expect(await p.isSaveEnabled()).toBe(true);
  });

  test('TC-LOC-CPR-311: Empty Pricebook Name blocks Save', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setYear(NEW_PRICEBOOK.validYear);
    await p.addStrategy();
    // Name left empty
    expect(await p.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-CPR-312: Whitespace-only Pricebook Name is treated as empty (blocks Save)', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setYear(NEW_PRICEBOOK.validYear);
    await p.addStrategy();
    await p.setName(NEW_PRICEBOOK.whitespaceName);
    expect(await p.isSaveEnabled()).toBe(false);
  });

  // ── Year field-coverage ───────────────────────────────────────────────────────────────

  test('TC-LOC-CPR-313: Empty Price Year blocks Save', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setName(NEW_PRICEBOOK.validName);
    await p.addStrategy();
    // Year left empty
    expect(await p.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-CPR-314: Non-numeric Price Year input is rejected', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setYear(NEW_PRICEBOOK.validYear);
    await p.setYear(NEW_PRICEBOOK.alphaYear); // native-set "abcd" → React sanitizer reverts
    expect(/[a-z]/i.test(await p.getYear())).toBe(false); // no alpha retained
  });

  test('TC-LOC-CPR-315: Valid year keeps the form savable; a decimal is not blocked client-side', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setName(NEW_PRICEBOOK.validName);
    await p.addStrategy();
    await p.setYear(NEW_PRICEBOOK.validYear);
    expect(await p.isSaveEnabled()).toBe(true);
    // Decimal: client does NOT reject (server validation unverified, no-commit).
    await p.setYear(NEW_PRICEBOOK.decimalYear);
    expect(await p.getYear()).toBe(NEW_PRICEBOOK.decimalYear);
    expect(await p.isSaveEnabled()).toBe(true);
  });

  // ── Strategy add (dialog) ────────────────────────────────────────────────────

  test('TC-LOC-CPR-316: New Pricing Strategy (+) opens the add dialog (Name + flags, no Type field)', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.openAddStrategyDialog();
    expect(await p.isAddDialogOpen()).toBe(true);
    // Dialog presents the Strategy Name field + flag checkboxes (no separate "Type" control).
    await expect(p.page.locator('#new-strategy-name')).toBeVisible();
    await expect(p.page.getByRole('dialog').getByRole('checkbox', { name: 'Is Active' })).toBeVisible();
    await p.cancelAddDialog();
  });

  test('TC-LOC-CPR-317: Strategy dialog defaults — Is Active checked, others unchecked', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.openAddStrategyDialog();
    expect((await p.getDialogFlag('Is Active')).checked).toBe(true);
    expect((await p.getDialogFlag('Is GSO')).checked).toBe(false);
    expect((await p.getDialogFlag('Is Internal')).checked).toBe(false);
    expect((await p.getDialogFlag('Is Productions')).checked).toBe(false);
    await p.cancelAddDialog();
  });

  test('TC-LOC-CPR-318: Adding a strategy appends it to the list', async ({ corporatePricingNewPricebookPage: p }) => {
    expect(await p.hasNoStrategiesYet()).toBe(true);
    expect(await p.getStrategyTotal()).toBe(0);
    await p.addStrategy(NEW_PRICEBOOK.strategyName);
    expect(await p.getStrategyTotal()).toBe(1);
    expect(await p.hasNoStrategiesYet()).toBe(false);
  });

  test('TC-LOC-CPR-319: Adding a second strategy lists both', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.addStrategy(NEW_PRICEBOOK.strategyName);
    await p.addStrategy(NEW_PRICEBOOK.secondStrategyName);
    expect(await p.getStrategyTotal()).toBe(2);
  });

  test('TC-LOC-CPR-320: Add with an empty Strategy Name is a no-op', async ({ corporatePricingNewPricebookPage: p }) => {
    const before = await p.getStrategyTotal();
    const { stillOpen } = await p.tryAddStrategyWithEmptyName();
    expect(stillOpen).toBe(true); // dialog stays open
    expect(await p.getStrategyTotal()).toBe(before); // nothing added
    await p.cancelAddDialog();
  });

  // ── Save gating + reachability (NO-COMMIT) ───────────────────────────────────

  test('TC-LOC-CPR-321: Save is disabled on the empty create form', async ({ corporatePricingNewPricebookPage: p }) => {
    expect(await p.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-CPR-322: Save stays disabled without a strategy (≥1 strategy required)', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setName(NEW_PRICEBOOK.validName);
    await p.setYear(NEW_PRICEBOOK.validYear);
    // No strategy added.
    expect(await p.getStrategyTotal()).toBe(0);
    expect(await p.isSaveEnabled()).toBe(false); // ≥1 strategy required before Save enables
  });

  test('TC-LOC-CPR-323: Save enables with Name + Year + one strategy and zero product groups (Empty-Shell)', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.setName(NEW_PRICEBOOK.validName);
    await p.setYear(NEW_PRICEBOOK.validYear);
    await p.addStrategy();
    // No product groups added (Empty-Shell — DOCX R1440-9 / helper 021 / 1443-010).
    expect(await p.isSaveEnabled()).toBe(true);
  });

  test('TC-LOC-CPR-324: Save opens the confirmation dialog; Cancel aborts without committing', async ({ corporatePricingNewPricebookPage: p }) => {
    await p.fillMinimalSavable();
    expect(await p.isSaveEnabled()).toBe(true);
    const dialogText = await p.clickSaveExpectDialog();
    expect(dialogText).toContain(NEW_PRICEBOOK.saveDialog.title);
    expect(dialogText).toContain(NEW_PRICEBOOK.saveDialog.body);
    // NO-COMMIT: Cancel (a created pricebook is irreversible via UI).
    await p.cancelSaveDialog();
    // Still on the create page (no redirect to /details).
    expect(await p.getHeading()).toBe('New Pricebook');
    expect(p.page.url()).toContain('/add');
  });

  // ── Product-group ADD (Pricing Detail tab, create mode) ──────────────────────

  test('TC-LOC-CPR-325: Pricing Detail tab shows the Product Groups source list (Equipment catalog)', async ({ corporatePricingNewPricebookPage: p }) => {
    test.setTimeout(90_000); // heavy detail tab (~3707 source items)
    await p.clickDetailTab();
    expect(await p.getSourceGroupCount()).toBeGreaterThan(0);
    await expect(p.page.locator('input[placeholder="Search ID or Name..."]')).toBeVisible();
  });

  test('TC-LOC-CPR-326: Double-clicking a product group adds it to the pricebook grid', async ({ corporatePricingNewPricebookPage: p }) => {
    test.setTimeout(90_000);
    await p.clickDetailTab();
    await p.addProductGroupByName(NEW_PRICEBOOK.equipmentGroupA);
    const rows = (await p.getDetailGridRows()).join(' | ');
    expect(rows).toContain(NEW_PRICEBOOK.equipmentGroupA);
  });

  test('TC-LOC-CPR-327: Adding multiple product groups appends rows', async ({ corporatePricingNewPricebookPage: p }) => {
    test.setTimeout(90_000);
    await p.clickDetailTab();
    await p.addProductGroupByName(NEW_PRICEBOOK.equipmentGroupA);
    await p.addProductGroupByName(NEW_PRICEBOOK.equipmentGroupB);
    const rows = (await p.getDetailGridRows()).join(' | ');
    expect(rows).toContain(NEW_PRICEBOOK.equipmentGroupA);
    expect(rows).toContain(NEW_PRICEBOOK.equipmentGroupB);
  });
});

test.describe('Corporate Pricing — New Pricebook (Labor) @corporate-pricing @new-pricebook', () => {
  test.beforeEach(async ({ corporatePricingNewPricebookPage: p }) => {
    await p.open('labor'); // baseline: fresh, empty create page
  });

  test('TC-LOC-CPR-328: Labor create page loads via the type route param; Type shows Labor (read-only)', async ({ corporatePricingNewPricebookPage: p }) => {
    expect(await p.getHeading()).toBe('New Pricebook');
    expect(p.page.url()).toContain('type=labor');
    expect(await p.getTypeValue()).toBe(NEW_PRICEBOOK.typeDisplay.labor);
    expect(await p.isTypeDisabled()).toBe(true);
  });

  test('TC-LOC-CPR-329: Labor flow header parity + Save gating', async ({ corporatePricingNewPricebookPage: p }) => {
    expect(await p.getCurrencyValue()).toBe(NEW_PRICEBOOK.currencyDefault);
    expect(await p.isSaveEnabled()).toBe(false); // empty
    await p.setName(NEW_PRICEBOOK.validName);
    await p.setYear(NEW_PRICEBOOK.validYear);
    await p.addStrategy();
    expect(await p.isSaveEnabled()).toBe(true);
  });

  test('TC-LOC-CPR-330: Labor Pricing Detail shows a Labor-specific product-group catalog', async ({ corporatePricingNewPricebookPage: p }) => {
    test.setTimeout(90_000);
    await p.clickDetailTab();
    expect(await p.getSourceGroupCount()).toBeGreaterThan(0);
    const sample = (await p.getSourceGroupSample(40)).join(' | ');
    // At least one known Labor product group is present (different catalog than Equipment).
    const hit = NEW_PRICEBOOK.laborGroupSample.some((g) => sample.includes(g));
    expect(hit).toBe(true);
  });
});
