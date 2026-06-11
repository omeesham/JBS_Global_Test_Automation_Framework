import { test, expect } from '../../src/fixtures/pages.fixture';
import { STRATEGY } from '../../src/data/corporate-pricing/strategy';

/**
 * Corporate Pricing — Pricebook Management / Pricing Strategy tab, P1.
 * TC-CPR-STR-001..125. Live-grounded 2026-06-05.
 *
 * Mutation safety: per-test `ensureDefaultState()` restores the strategyFixture
 * (2022-NP Tier 1) to baseline (1 strategy, original name). Save-cycle tests mutate via a REVERSIBLE
 * existing-strategy name edit (the only UI-reversible save). Add/Remove tests discard WITHOUT saving
 * (a saved new strategy becomes legacy and loses its Remove → not restorable). No fixed waits;
 * Angular dirty/save handled defensively.
 */
test.describe('Corporate Pricing — Pricing Strategy @corporate-pricing @strategy', () => {
  test.beforeEach(async ({ corporatePricingStrategyPage: p }) => {
    // Per-test baseline: guarantees persisted state = 1 strategy named "2022-NP Tier 1",
    // and lands on the (default) Pricing Strategy tab with that strategy selected.
    await p.ensureDefaultState();
  });

  // ── Entry + Header (reference-only) ─────────────────────────────────────────

  test('TC-CPR-STR-001: Pricebook Details management page loads with the pricebook header', async ({ corporatePricingStrategyPage: p }) => {
    await expect(p.page.getByRole('heading', { name: 'Corporate Pricing Details' })).toBeVisible();
    expect(await p.getHeaderField('name')).toBe(STRATEGY.header.name);
  });

  test('TC-CPR-STR-002: Header shows the Price Book Name', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.getHeaderField('name')).toBe(STRATEGY.header.name);
  });

  test('TC-CPR-STR-003: Header shows the Price Book Type (Labor/Equipment)', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.getHeaderField('type')).toBe(STRATEGY.header.type);
  });

  test('TC-CPR-STR-004: Header shows the Price Year', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.getHeaderField('year')).toBe(STRATEGY.header.year);
  });

  test('TC-CPR-STR-005: Header shows the Currency', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.getHeaderField('currency')).toBe(STRATEGY.header.currency);
  });

  test('TC-CPR-STR-006: Header shows the Active status', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.getHeaderField('active')).toBe(STRATEGY.header.active);
  });

  test('TC-CPR-STR-007: Header fields are reference-only (not editable)', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.headerFieldsAreReadOnly()).toBe(true);
  });

  // ── Tabs ────────────────────────────────────────────────────────────────────

  test('TC-CPR-STR-008: Tabs render — Pricing Strategy + Pricing Detail', async ({ corporatePricingStrategyPage: p }) => {
    const tabs = await p.getTabs();
    expect(tabs).toContain('Pricing Strategy');
    expect(tabs).toContain('Pricing Detail');
  });

  test('TC-CPR-STR-009: Pricing Strategy tab is selected by default on load', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.isStrategyTabActive()).toBe(true);
  });

  test('TC-CPR-STR-010: Pricing Detail tab is present and activates', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.getTabs()).toContain('Pricing Detail');
    await p.clickDetailTab();
    // Strategy pane should no longer be the active content once Detail is selected.
    expect(await p.isStrategyTabActive()).toBe(false);
  });

  test('TC-CPR-STR-011: History tab is absent on the live site', async ({ corporatePricingStrategyPage: p }) => {
    // The requirements specify a 3rd "History" tab; live shows only 2. Divergence raised as a
    // clarification; behavior gated to a future History coverage pass.
    expect(await p.hasHistoryTab()).toBe(false);
  });

  // ── Strategy selection + locations ──────────────────────────────────────────

  test('TC-CPR-STR-012: Clicking an existing strategy loads its details', async ({ corporatePricingStrategyPage: p }) => {
    await p.selectStrategy(STRATEGY.fixtureStrategyName);
    expect(await p.getStrategyName()).toBe(STRATEGY.fixtureStrategyName);
    // Flag checkboxes render (editor populated).
    const isProductions = await p.getFlag('Is Productions');
    expect(typeof isProductions.checked).toBe('boolean');
  });

  test('TC-CPR-STR-013: Selected strategy displays its assigned locations', async ({ corporatePricingStrategyPage: p }) => {
    await p.selectStrategy(STRATEGY.fixtureStrategyName);
    const locations = await p.getStrategyLocations();
    expect(locations.length).toBeGreaterThan(0);
    // Containment (not exact count): the known offices are present.
    const offices = locations.map((l) => l.office);
    for (const exp of STRATEGY.expectedLocations) {
      expect(offices).toContain(exp.office);
    }
  });

  // ── Edit + Save persist (reversible mutation) ───────────────────────────────

  test('TC-CPR-STR-014: Edit an existing strategy and Save persists the change', async ({ corporatePricingStrategyPage: p }) => {
    test.setTimeout(60_000); // live save-cycle: 2 saves + 2 reloads
    await p.selectFirstStrategy();
    await p.setStrategyName(STRATEGY.reversibleEdit.editedName);
    expect(await p.isSaveEnabled()).toBe(true);
    await p.saveAndConfirm();
    await p.open();
    await p.selectFirstStrategy();
    expect(await p.getStrategyName()).toBe(STRATEGY.reversibleEdit.editedName);
    // restore (cleanup)
    await p.setStrategyName(STRATEGY.reversibleEdit.restoredName);
    await p.saveAndConfirm();
    await p.open();
    await p.selectFirstStrategy();
    expect(await p.getStrategyName()).toBe(STRATEGY.reversibleEdit.restoredName);
  });

  // ── Add New (dialog) + Remove (isNew) — discard without saving ───────────────

  test('TC-CPR-STR-015: Add New opens the New Pricing Strategy dialog and appends a row', async ({ corporatePricingStrategyPage: p }) => {
    const before = await p.getStrategyTotal();
    await p.openAddStrategyDialog();
    expect(await p.isAddDialogOpen()).toBe(true);
    await p.page.locator(/* dialog name field */ '[role="dialog"]').getByRole('textbox', { name: 'Strategy Name' }).fill(STRATEGY.newStrategyPayload.name);
    await p.page.getByRole('dialog').getByRole('button', { name: 'Add', exact: true }).click();
    await expect(p.page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });
    expect(await p.getStrategyTotal()).toBe(before + 1);
    // discard (no Save) — restore baseline
    await p.removeStrategy(STRATEGY.newStrategyPayload.name);
    expect(await p.getStrategyTotal()).toBe(before);
  });

  test('TC-CPR-STR-016: Newly added strategy shows a Remove button', async ({ corporatePricingStrategyPage: p }) => {
    await p.addStrategy(STRATEGY.newStrategyPayload.name);
    expect(await p.isRemoveVisible(STRATEGY.newStrategyPayload.name)).toBe(true);
    // discard
    await p.removeStrategy(STRATEGY.newStrategyPayload.name);
  });

  test('TC-CPR-STR-017: Legacy strategies do not show a Remove button', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.isRemoveVisible(STRATEGY.fixtureStrategyName)).toBe(false);
  });

  test('TC-CPR-STR-018: Remove on a new strategy deletes it before commit', async ({ corporatePricingStrategyPage: p }) => {
    const before = await p.getStrategyTotal();
    await p.addStrategy(STRATEGY.newStrategyPayload.name);
    expect(await p.getStrategyTotal()).toBe(before + 1);
    expect(await p.isSaveEnabled()).toBe(true); // dirty
    await p.removeStrategy(STRATEGY.newStrategyPayload.name);
    expect(await p.getStrategyTotal()).toBe(before); // removed immediately, no reload
    expect(await p.isSaveEnabled()).toBe(false); // back to clean
  });

  test('TC-CPR-STR-019: Legacy strategies cannot be removed from the management view', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.isRemoveVisible(STRATEGY.fixtureStrategyName)).toBe(false);
  });

  // ── Dirty / clean state ─────────────────────────────────────────────────────

  test('TC-CPR-STR-020: Unmodified strategy list shows the clean state (Save disabled)', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.isSaveEnabled()).toBe(false);
  });

  test('TC-CPR-STR-021: Editing a strategy changes the state to dirty (Save enabled)', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.isSaveEnabled()).toBe(false);
    await p.selectFirstStrategy();
    await p.setStrategyName(STRATEGY.reversibleEdit.editedName);
    expect(await p.isSaveEnabled()).toBe(true);
    // discard without saving — reload restores the unsaved edit
    await p.open();
    expect(await p.getStrategyName().catch(() => '')).not.toBe(STRATEGY.reversibleEdit.editedName);
  });

  test('TC-CPR-STR-022: Adding a new strategy changes the state to dirty (Save enabled)', async ({ corporatePricingStrategyPage: p }) => {
    expect(await p.isSaveEnabled()).toBe(false);
    await p.addStrategy(STRATEGY.newStrategyPayload.name);
    expect(await p.isSaveEnabled()).toBe(true);
    // discard
    await p.removeStrategy(STRATEGY.newStrategyPayload.name);
  });

  // ── Save batch + feedback + reset (reversible mutation) ──────────────────────

  test('TC-CPR-STR-023: Save commits pending strategy edits in one batch', async ({ corporatePricingStrategyPage: p }) => {
    test.setTimeout(60_000); // live save-cycle
    // NOTE: a saved NEW strategy is not UI-removable, so the batch-commit is exercised via a
    // reversible existing-strategy edit; full new-strategy persistence is deferred to a follow-up
    // coverage pass with a disposable fixture.
    await p.selectFirstStrategy();
    await p.setStrategyName(STRATEGY.reversibleEdit.editedName);
    expect(await p.isSaveEnabled()).toBe(true);
    await p.saveAndConfirm();
    await p.open();
    await p.selectFirstStrategy();
    expect(await p.getStrategyName()).toBe(STRATEGY.reversibleEdit.editedName);
    expect(await p.isSaveEnabled()).toBe(false); // batch committed → clean
    // restore
    await p.setStrategyName(STRATEGY.reversibleEdit.restoredName);
    await p.saveAndConfirm();
  });

  test('TC-CPR-STR-024: Save provides confirmation feedback', async ({ corporatePricingStrategyPage: p }) => {
    test.setTimeout(60_000); // live save-cycle
    await p.selectFirstStrategy();
    await p.setStrategyName(STRATEGY.reversibleEdit.editedName);
    // The "Pricebook saved successfully" toast IS the confirmation feedback — captured
    // by saveAndConfirm at the moment it surfaces (the Notifications region is hidden when empty).
    const { toastSeen } = await p.saveAndConfirm();
    expect(toastSeen).toBe(true);
    // restore
    await p.open();
    await p.selectFirstStrategy();
    await p.setStrategyName(STRATEGY.reversibleEdit.restoredName);
    await p.saveAndConfirm();
  });

  test('TC-CPR-STR-025: Save resets the state from dirty to clean after success', async ({ corporatePricingStrategyPage: p }) => {
    test.setTimeout(60_000); // live save-cycle
    await p.selectFirstStrategy();
    await p.setStrategyName(STRATEGY.reversibleEdit.editedName);
    expect(await p.isSaveEnabled()).toBe(true); // dirty
    await p.saveAndConfirm();
    // After a successful save the form is clean → the Save button returns to "Save" and disables.
    await expect(p.page.locator('button:text-is("Save")').first()).toBeDisabled({ timeout: 10_000 });
    // restore (reload first to clear the toast → avoid a back-to-back save race)
    await p.open();
    await p.selectFirstStrategy();
    await p.setStrategyName(STRATEGY.reversibleEdit.restoredName);
    await p.saveAndConfirm();
  });
});
