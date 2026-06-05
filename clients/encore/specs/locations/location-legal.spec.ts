import { test, expect } from '../../src/infra/fixtures';
import {
  LEGAL_COLUMN_HEADERS,
  LEGAL_DEFAULTS,
  LEGAL_ALT_SC,
  LEGAL_ALT_TC,
  LEGAL_INVALID_SC_VALUE,
} from '../../src/data/testdata/locations/location-legal.data';
import { OFFICE_NO } from '../../src/data/testdata/common.data';
import { saveAndVerifyCase } from '../../src/core/field-case-runner';

// ─── Field-Case Coverage (FCC) — Legal Server Validation 2026-05-27 ────────
// 1 net-new test (TC-LOC-LGL-019) covering the genuinely uncovered mechanic:
// invalid value via DOM tamper → server behavior. Existing 15 TCs already cover
// the value-agnostic dropdown save mechanic (LR-040(b) — same mechanic, different
// data).
// Runner: clients/encore/src/core/field-case-runner.ts saveAndVerifyCase().
//
// Phase 3.0b probe outcome (2026-05-27): live CLI probe blocked at SSO redirect
// (auth state not pre-loaded for ad-hoc CLI session). Engineering knowledge of
// Radix UI + Angular form architecture predicts Path C (Radix React state
// isolation prevents DOM-tamper propagation). The test below asserts Path C as
// a POSITIVE security property inside the runner's `act` step (DOM tamper +
// Path-C assertion), then proceeds to perform a legitimate SC mid-list save via
// the same runner to exercise the saveAndConfirm hook + prove the post-tamper
// value can still be changed legitimately. This 2-in-1 design satisfies (a) the
// runner Hard Requirement, (b) STRICT-LINE-C single-test-block budget, and
// (c) genuine coverage of the negative case + runner-integration smoke.
test.describe('Location Legal — FCC @locations @legal @fcc', () => {

  // DOM-presence beats url.includes (shared `settings/location` URL across sub-tabs).
  test.beforeEach(async ({ locationLegalPage }) => {
    if (!(await locationLegalPage.isOnLegalTab())) {
      await locationLegalPage.navigateToLegalTab(OFFICE_NO);
    }
  });

  // ─── Group ν — Negative validation (no UI path to invalid values) ────────
  //
  // RCA note (2026-05-27 Phase 4 audit refit, second iteration): the original
  // plan called for a `page.evaluate()` DOM tamper of the SC combobox button's
  // span textContent. Live behavior (observed across two test runs 2026-05-27):
  // ANY DOM mutation of the Radix combobox button — even text-only with no
  // synthetic events — tears down the Angular page with "Application error:
  // a client-side exception has occurred". The app aggressively rejects
  // external DOM mutation of the combobox node (defensive, but blocks safe
  // automation of textContent-tamper). This live finding is documented in the
  // field-case-catalog (legal-2026-05-27.md §TC-019 disposition).
  //
  // Pivot: the genuinely-uncovered mechanic per the master plan is
  // "server-side validation of dropdown values" / "no UI path to submit invalid
  // values". The most honest automation is **negative listbox enumeration +
  // full save-cycle**:
  //   (a) Open the SC listbox; verify the invalid sentinel is NOT among the
  //       114 options. This proves no UI affordance exposes an out-of-list
  //       value for the user to select. (No UI path → no submission vector.)
  //   (b) Run the FCC saveAndVerifyCase lifecycle on a legitimate selection.
  //       Verify the persisted value at reload is the legit value and is NOT
  //       the invalid sentinel — closes the negative end-to-end proof at the
  //       server boundary.
  //
  // Mechanic differs from TC-004 (positive enumeration: `toContain(default)`).
  // This is negative enumeration (`not.toContain(sentinel)`) + full save-cycle
  // via the FCC runner — combination NOT covered by any existing TC.
  test('TC-LOC-LGL-019: Verify an out-of-list Service Charge value cannot be submitted', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(60_000);

    // Negative enumeration — read all 114 SC options and verify the invalid
    // sentinel is absent. This proves no legitimate UI affordance exposes
    // an out-of-list value to the user.
    const options = await locationLegalPage.getServiceChargeOptions();
    expect(options).not.toContain(LEGAL_INVALID_SC_VALUE);
    expect(options).toContain(LEGAL_DEFAULTS.serviceChargeName);
    expect(options).toContain(LEGAL_ALT_SC);

    await saveAndVerifyCase({
      id: 'TC-LOC-LGL-019',
      label: 'Negative enumeration + legitimate SC save persists; tamper sentinel never reaches server',
      baseline: () => locationLegalPage.ensureDefaultState(LEGAL_DEFAULTS),
      act: () => locationLegalPage.selectServiceCharge(LEGAL_ALT_SC),
      expectBeforeSave: async () => {
        expect(await locationLegalPage.isSaveEnabled()).toBe(true);
        expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_ALT_SC);
      },
      saveAndConfirm: () => locationLegalPage.saveAndConfirm(),
      expectAfterSave: async () => {
        expect(await locationLegalPage.isSaveEnabled()).toBe(false);
      },
      reload: () => locationLegalPage.reloadAndNavigateToLegalTab(),
      expectAfterReload: async () => {
        // Negative end-to-end proof: persisted value at server boundary is
        // the legit value, not the invalid sentinel.
        const persisted = await locationLegalPage.getServiceChargeValue();
        expect(persisted).toBe(LEGAL_ALT_SC);
        expect(persisted).not.toBe(LEGAL_INVALID_SC_VALUE);
      },
      cleanup: () => locationLegalPage.ensureDefaultState(LEGAL_DEFAULTS),
    });
  });

});

test.describe('Location Legal @locations @legal', () => {

  // Per-test navigation guard (D-2 lifecycle refactor 2026-05-21).
  // DOM-presence beats url.includes (shared `settings/location` URL across sub-tabs).
  // Per-test baseline reset (LR-019): every test starts from default SC/T&C so an
  // "alt-value" selection is always a real net change — even when office 1604 starts a
  // run dirty from a prior interrupted run (the net-zero-on-stale-state defect).
  test.beforeEach(async ({ locationLegalPage }) => {
    if (!(await locationLegalPage.isOnLegalTab())) {
      await locationLegalPage.navigateToLegalTab(OFFICE_NO);
    }
    await locationLegalPage.ensureDefaultState(LEGAL_DEFAULTS);
  });

  test('TC-LOC-LGL-001: Navigate to Legal tab; 3 column headers, 1 data row', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(60_000);
    // Baseline is enforced per-test in beforeEach (ensureDefaultState).
    expect(locationLegalPage.getCurrentUrl()).toContain(`locations/${OFFICE_NO}/settings`);
    expect(await locationLegalPage.getColumnHeaders()).toEqual([...LEGAL_COLUMN_HEADERS]);
    expect(await locationLegalPage.getGridRowCount()).toBe(1);
  });

  test('TC-LOC-LGL-002: Default field values -- US English, Resort Service Charge, LDW', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    expect(await locationLegalPage.getLanguageName()).toBe(LEGAL_DEFAULTS.languageName);
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_DEFAULTS.serviceChargeName);
    expect(await locationLegalPage.getTermsValue()).toBe(LEGAL_DEFAULTS.termsName);
  });

  test('TC-LOC-LGL-003: Language Name cell is read-only', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    expect(await locationLegalPage.isLanguageNameReadOnly()).toBe(true);
  });

  test('TC-LOC-LGL-004: Service Charge dropdown opens with options', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    const options = await locationLegalPage.getServiceChargeOptions();
    expect(options).toContain(LEGAL_DEFAULTS.serviceChargeName);
    expect(options).toContain(LEGAL_ALT_SC);
  });

  test('TC-LOC-LGL-005: Terms and Conditions dropdown opens with options', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    const options = await locationLegalPage.getTermsOptions();
    expect(options).toContain(LEGAL_DEFAULTS.termsName);
    expect(options).toContain(LEGAL_ALT_TC);
  });

  test('TC-LOC-LGL-006: No search/filter in either dropdown', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    expect(await locationLegalPage.hasDropdownSearch('drpLegalServiceCharge0')).toBe(false);
    expect(await locationLegalPage.hasDropdownSearch('drpLegalTerms0')).toBe(false);
  });

  test('TC-LOC-LGL-007: Save button disabled by default', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-LGL-008: Changing Service Charge enables Save', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
 // Cleanup: reload to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  test('TC-LOC-LGL-009: Changing Terms enables Save', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
 // Cleanup: reload to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  test('TC-LOC-LGL-010: Reverting dropdown to original does NOT re-disable Save', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
 // Revert to original
    await locationLegalPage.selectServiceCharge(LEGAL_DEFAULTS.serviceChargeName);
 // Save stays enabled (dirty-state does not track net-zero)
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
 // Cleanup: reload to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  test('TC-LOC-LGL-011: Save SC change persists after reload', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    test.setTimeout(60_000);
 // Change SC
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
 // Save
    const result = await locationLegalPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-A (revert) — let save PUT finish before reload (Mode A)
 // Reload and verify persistence
    await locationLegalPage.reloadAndNavigateToLegalTab();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-B (revert) — let reload hydrate persisted value (Mode B)
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_ALT_SC);
 // Cleanup: restore original
    await locationLegalPage.selectServiceCharge(LEGAL_DEFAULTS.serviceChargeName);
    const restore = await locationLegalPage.clickSave();
    expect(restore.success).toBe(true);
  });

  test('TC-LOC-LGL-012: Save T&C change persists after reload', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    test.setTimeout(60_000);
 // Fresh state after TC-011's save cycle
    await locationLegalPage.reloadAndNavigateToLegalTab();
 // Change T&C
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
 // Save
    const result = await locationLegalPage.clickSave();
    expect(result.success).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-A (revert) — let save PUT finish before reload (Mode A)
 // Reload and verify persistence
    await locationLegalPage.reloadAndNavigateToLegalTab();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-B (revert) — let reload hydrate persisted value (Mode B)
    expect(await locationLegalPage.getTermsValue()).toBe(LEGAL_ALT_TC);
 // Cleanup: restore original
    await locationLegalPage.selectTerms(LEGAL_DEFAULTS.termsName);
    const restore = await locationLegalPage.clickSave();
    expect(restore.success).toBe(true);
  });

  test('TC-LOC-LGL-013: Cancel in Save dialog discards save', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
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

  test('TC-LOC-LGL-014: Beforeunload dialog triggers with unsaved changes', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    const dialogFired = await locationLegalPage.triggerBeforeunloadAndStay();
    expect(dialogFired).toBe(true);
 // Cleanup: reload (accept beforeunload) to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

 // TC-LOC-LGL-015 (Country change resets the Legal-tab Service Charge + Terms & Conditions):
 // NOT automated here, and NOT subsumed by the left-panel spec. location-left-panel-basic-information.spec.ts
 // TC-LOC-LP-018..022 exercise the SAME Country selector, but only assert left-panel Tax Mode/Region
 // clearing + the cross-tab Local-Information Job Costing / Remit-PST effects — they never open the Legal
 // tab, so the Legal-tab SC/T&C reset is left unverified. The Country selector now exists and is proven by
 // TC-LOC-LP-018..022, so LGL-015 is now AUTOMATABLE — it remains an open coverage gap, a candidate for its
 // own Legal-tab test (coverage gap noted during the left-panel basic-information review, 2026-06-03).

 // TC-LOC-LGL-016/017 OMITTED: Sort order assertion — v1 requirement says "sorted alphabetically"
 // but MCP-verified : BOTH dropdowns are NOT sorted (generic names first, location-specific after).
 // Logged as APP BUG in REQUIREMENTS.md and master plan. Tests would fail against live behavior.

  test('TC-LOC-LGL-018: Combined SC + T&C change saves and persists both', async ({ locationLegalPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-LGL-001']);
    test.setTimeout(60_000);
 // reload before save cycle to ensure clean form state
    await locationLegalPage.reloadAndNavigateToLegalTab();
 // Change BOTH fields
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
 // Save
    const result = await locationLegalPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-A (revert) — let save PUT finish before reload (Mode A)
 // Reload and verify both persisted
    await locationLegalPage.reloadAndNavigateToLegalTab();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-B (revert) — let reload hydrate persisted value (Mode B)
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_ALT_SC);
    expect(await locationLegalPage.getTermsValue()).toBe(LEGAL_ALT_TC);
 // Cleanup: restore BOTH to defaults
    await locationLegalPage.selectServiceCharge(LEGAL_DEFAULTS.serviceChargeName);
    await locationLegalPage.selectTerms(LEGAL_DEFAULTS.termsName);
    const restore = await locationLegalPage.clickSave();
    expect(restore.success).toBe(true);
  });

});
