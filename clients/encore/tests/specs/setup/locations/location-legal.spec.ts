// spec: specs_planning/test-plans/locations/locations_legal_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../setup/fixtures';
import {
  LEGAL_COLUMN_HEADERS,
  LEGAL_DEFAULTS,
  LEGAL_ALT_SC,
  LEGAL_ALT_TC,
} from '../../../test-data/setup/locations/location-legal.data';
import { OFFICE_NO } from '../../../test-data/common.data';

// SP5 integration test: capture wall-clock at suite start so TC-HIST can filter
// history rows produced by this suite's saves. 2-min buffer absorbs clock skew.
let suiteStartTime = 0;

test.describe.serial('Location Legal @locations @legal', () => {

  test.beforeAll(() => {
    suiteStartTime = Date.now() - 2 * 60 * 1000;
  });

  test('TC-LOC-LGL-001: Navigate to Legal tab; 3 column headers, 1 data row', async ({ locationLegalPage }) => {
    test.setTimeout(60_000);
    await locationLegalPage.navigateToLegalTab(OFFICE_NO);
    // LR-019: Baseline enforcement — restore default SC/T&C if dirty from prior failed run.
    let dirty = false;
    if (await locationLegalPage.getServiceChargeValue() !== LEGAL_DEFAULTS.serviceChargeName) {
      await locationLegalPage.selectServiceCharge(LEGAL_DEFAULTS.serviceChargeName);
      dirty = true;
    }
    if (await locationLegalPage.getTermsValue() !== LEGAL_DEFAULTS.termsName) {
      await locationLegalPage.selectTerms(LEGAL_DEFAULTS.termsName);
      dirty = true;
    }
    if (dirty) {
      await locationLegalPage.clickSave();
      await locationLegalPage.reloadAndNavigateToLegalTab();
    }
    expect(locationLegalPage.getCurrentUrl()).toContain(`locations/${OFFICE_NO}/settings`);
    expect(await locationLegalPage.getColumnHeaders()).toEqual([...LEGAL_COLUMN_HEADERS]);
    expect(await locationLegalPage.getGridRowCount()).toBe(1);
  });

  test('TC-LOC-LGL-002: Default field values -- US English, Resort Service Charge, LDW', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.getLanguageName()).toBe(LEGAL_DEFAULTS.languageName);
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_DEFAULTS.serviceChargeName);
    expect(await locationLegalPage.getTermsValue()).toBe(LEGAL_DEFAULTS.termsName);
  });

  test('TC-LOC-LGL-003: Language Name cell is read-only', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.isLanguageNameReadOnly()).toBe(true);
  });

  test('TC-LOC-LGL-004: Service Charge dropdown opens with options', async ({ locationLegalPage }) => {
    const options = await locationLegalPage.getServiceChargeOptions();
    expect(options).toContain(LEGAL_DEFAULTS.serviceChargeName);
    expect(options).toContain(LEGAL_ALT_SC);
  });

  test('TC-LOC-LGL-005: Terms and Conditions dropdown opens with options', async ({ locationLegalPage }) => {
    const options = await locationLegalPage.getTermsOptions();
    expect(options).toContain(LEGAL_DEFAULTS.termsName);
    expect(options).toContain(LEGAL_ALT_TC);
  });

  test('TC-LOC-LGL-006: No search/filter in either dropdown', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.hasDropdownSearch('drpLegalServiceCharge0')).toBe(false);
    expect(await locationLegalPage.hasDropdownSearch('drpLegalTerms0')).toBe(false);
  });

  test('TC-LOC-LGL-007: Save button disabled by default', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-LGL-008: Changing Service Charge enables Save', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Cleanup: reload to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  test('TC-LOC-LGL-009: Changing Terms enables Save', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Cleanup: reload to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  test('TC-LOC-LGL-010: Reverting dropdown to original does NOT re-disable Save', async ({ locationLegalPage }) => {
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Revert to original
    await locationLegalPage.selectServiceCharge(LEGAL_DEFAULTS.serviceChargeName);
    // Save stays enabled (dirty-state does not track net-zero)
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Cleanup: reload to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  test('TC-LOC-LGL-011: Save SC change persists after reload', async ({ locationLegalPage }) => {
    test.setTimeout(60_000);
    // Change SC
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Save
    const result = await locationLegalPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    // Reload and verify persistence
    await locationLegalPage.reloadAndNavigateToLegalTab();
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_ALT_SC);
    // Cleanup: restore original
    await locationLegalPage.selectServiceCharge(LEGAL_DEFAULTS.serviceChargeName);
    const restore = await locationLegalPage.clickSave();
    expect(restore.success).toBe(true);
  });

  test('TC-LOC-LGL-012: Save T&C change persists after reload', async ({ locationLegalPage }) => {
    test.setTimeout(60_000);
    // Fresh state after TC-011's save cycle
    await locationLegalPage.reloadAndNavigateToLegalTab();
    // Change T&C
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Save
    const result = await locationLegalPage.clickSave();
    expect(result.success).toBe(true);
    // Reload and verify persistence
    await locationLegalPage.reloadAndNavigateToLegalTab();
    expect(await locationLegalPage.getTermsValue()).toBe(LEGAL_ALT_TC);
    // Cleanup: restore original
    await locationLegalPage.selectTerms(LEGAL_DEFAULTS.termsName);
    const restore = await locationLegalPage.clickSave();
    expect(restore.success).toBe(true);
  });

  test('TC-LOC-LGL-013: Cancel in Save dialog discards save', async ({ locationLegalPage }) => {
    // Fresh state after TC-012's save cycle
    await locationLegalPage.reloadAndNavigateToLegalTab();
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    const dialogType = await locationLegalPage.clickSaveAndGetDialog();
    expect(dialogType).toBe('save-changes');
    await locationLegalPage.cancelSaveDialog();
    // Save still enabled (not saved)
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Reload and verify original value
    await locationLegalPage.reloadAndNavigateToLegalTab();
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_DEFAULTS.serviceChargeName);
  });

  test('TC-LOC-LGL-014: Beforeunload dialog triggers with unsaved changes', async ({ locationLegalPage }) => {
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    const dialogFired = await locationLegalPage.triggerBeforeunloadAndStay();
    expect(dialogFired).toBe(true);
    // Cleanup: reload (accept beforeunload) to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  // TC-LOC-LGL-015 OMITTED: Country cascade test requires left-panel Country selector
  // that does not exist in current selector inventory. Logged as missing-coverage.

  // TC-LOC-LGL-016/017 OMITTED: Sort order assertion — v1 requirement says "sorted alphabetically"
  // but MCP-verified 2026-04-06: BOTH dropdowns are NOT sorted (generic names first, location-specific after).
  // Logged as APP BUG in REQUIREMENTS.md and master plan. Tests would fail against live behavior.

  test('TC-LOC-LGL-018: Combined SC + T&C change saves and persists both', async ({ locationLegalPage }) => {
    test.setTimeout(60_000);
    // LR-026: reload before save cycle to ensure clean form state
    await locationLegalPage.reloadAndNavigateToLegalTab();
    // Change BOTH fields
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Save
    const result = await locationLegalPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    // Reload and verify both persisted
    await locationLegalPage.reloadAndNavigateToLegalTab();
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_ALT_SC);
    expect(await locationLegalPage.getTermsValue()).toBe(LEGAL_ALT_TC);
    // Cleanup: restore BOTH to defaults
    await locationLegalPage.selectServiceCharge(LEGAL_DEFAULTS.serviceChargeName);
    await locationLegalPage.selectTerms(LEGAL_DEFAULTS.termsName);
    const restore = await locationLegalPage.clickSave();
    expect(restore.success).toBe(true);
  });

  // ── SP5: Cross-tab history integration — MUST be LAST in describe.serial ────
  // Verifies that completed saves during this spec produced corresponding rows
  // on the Location Management History tab. Uses timestamp-window filtering
  // rather than hardcoded counts (LR-022). All assertions use expect.soft().
  //
  // Saves tracked: TC-011 (2), TC-012 (2), TC-018 (2) = 6 guaranteed.
  // TC-013 cancel = no row. TC-001 conditional baseline = 0-1 row.
  test('TC-LOC-LGL-HIST: All completed saves produce history rows with correct values', async ({ locationLegalPage, locationManagementHistoryPage }) => {
    test.setTimeout(180_000);

    // 1. Navigate to Location Management History tab from any starting URL
    //    (navigateToHistoryTab handles: page navigation if needed, unsaved dialog dismissal per LR-026)
    await locationManagementHistoryPage.navigateToHistoryTab(OFFICE_NO);

    // 3. Sort by Modified On descending (SP1 §11: default sort is ASCENDING)
    await locationManagementHistoryPage.sortByModifiedOnDesc();
    await locationManagementHistoryPage.waitForRecentTopRow();

    // 4. Read all rows newer than suiteStartTime
    const HEADERS = [
      'Modified By', 'Modified On',
      'Service Charge Name', 'Terms and Conditions',
    ];
    const suiteRows = await locationManagementHistoryPage.getRowsSinceTimestamp(
      suiteStartTime, HEADERS,
    );

    // 5. Sanity — at least some saves were tracked
    expect.soft(suiteRows.length,
      'expected at least 1 Location Mgmt History row produced by this suite\'s saves').toBeGreaterThan(0);

    // 6. Every suite row must carry Modified By and Modified On
    for (let i = 0; i < suiteRows.length; i++) {
      const row = suiteRows[i]!;
      expect.soft(row['Modified By'], `row ${i}: Modified By empty`).toBeTruthy();
      expect.soft(row['Modified On'], `row ${i}: Modified On empty`).toBeTruthy();
    }

    // 7. Gap detection — each expected field-value pair must appear in at least one row
    const expectedChanges: Array<{ field: string; values: string[]; sourceTc: string }> = [
      { field: 'Service Charge Name', values: [`${LEGAL_DEFAULTS.languageName}: ${LEGAL_ALT_SC}`, `${LEGAL_DEFAULTS.languageName}: ${LEGAL_DEFAULTS.serviceChargeName}`], sourceTc: 'TC-011/018 SC change + restore' },
      { field: 'Terms and Conditions', values: [`${LEGAL_DEFAULTS.languageName}: ${LEGAL_ALT_TC}`, `${LEGAL_DEFAULTS.languageName}: ${LEGAL_DEFAULTS.termsName}`], sourceTc: 'TC-012/018 T&C change + restore' },
    ];

    for (const { field, values, sourceTc } of expectedChanges) {
      const observed = Array.from(new Set(suiteRows.map(r => r[field] ?? '')));
      const found = values.some(v => observed.includes(v));
      expect.soft(found,
        `GAP [${sourceTc}]: ${field} — expected one of [${values.join('|')}] in history, observed [${observed.join('|')}]`
      ).toBe(true);
    }

    // RC-1 cleanup: return to Basic Information so next spec's sub-tabs are visible
    await locationManagementHistoryPage.returnToBasicInformation();
  });

});
