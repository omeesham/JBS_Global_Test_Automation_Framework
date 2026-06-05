import { test, expect } from '../../src/fixtures/pages.fixture';
import { OFFICE_NO } from '../../src/data/common';
import {
  LP_DEFAULTS,
  LP_DROPDOWN,
  LP_TEST_VALUES,
} from '../../src/data/locations/location-left-panel-basic-information';

/**
 * Location Settings — Left Panel (Basic Information).
 *
 * Automates 23 of the 24 documented manual TCs (TC-LOC-LP-001..023) + 3 net-new save-persist TCs
 * (025 Local Office Name, 026 Tax Mode, 027 Region). Field states live-verified 2026-06-03
 * (field-inventories/left-panel-basic-information-2026-06-03.md).
 *
 * Corrections vs the original MD (live DOM + old-site baseline both win): Line Of Business is
 * read-only in EDIT mode by design (Encore NM-831/NM-1140) → TC-016 asserts disabled; Servicing
 * Branch has 218 options (not 215); Live Date = "June 15th, 1990".
 *
 * TC-024 (cross-tab Legal-invalid Save gating) is documented (c) in the catalog/MD — see the note
 * below TC-023 — flagged for a design decision (no-leak mandate vs Legal Path D teardown).
 *
 * Per-test baseline reset via ensureDefaultState (LR-019). Mutating-and-persisting tests restore
 * office-1604 defaults themselves so nothing leaks into sibling specs. No bare `page` destructure.
 */
test.describe('Location Left Panel — Basic Information @locations @left-panel-basic-information', () => {

  test.beforeEach(async ({ locationLeftPanelBasicInformationPage: lp }) => {
    test.setTimeout(120_000);
    if (!(await lp.isOnBasicInformation())) {
      await lp.navigateToBasicInformation(OFFICE_NO);
    }
    // LR-019: enforce office-1604 baseline per-test (not first-test-only) so a prior crashed/retried
    // run cannot poison defaults. No-op (cheap reads) when already clean.
    await lp.ensureDefaultState();
  });

  // ── Baseline + read-only field states ──────────────────────────────────────

  test('TC-LOC-LP-001: Left panel field baseline state', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.getLocalOfficeValue()).toBe(LP_DEFAULTS.localOffice);
    expect(await lp.getLocalOfficeName()).toBe(LP_DEFAULTS.localOfficeName);
    expect((await lp.getActiveState()).checked).toBe(true);
    // Live Date renders "Month Dayth, YYYY". Office 1604 is a SHARED office whose Live Date drifts
    // (CI bots write to it — observed June 15 1990 / Sep 6 1989 / Aug 28 1989 across runs), so assert
    // the FORMAT, not a fixed value (LR-022 spirit).
    expect(await lp.getLiveDateText()).toMatch(/^[A-Z][a-z]+ \d{1,2}(st|nd|rd|th), \d{4}$/);
    expect(await lp.getTaxMode()).toBe(LP_DEFAULTS.taxMode);
    expect(await lp.getCountry()).toBe(LP_DEFAULTS.country);
    expect(await lp.getRegion()).toBe(LP_DEFAULTS.region);
    expect(await lp.getServicingBranch()).toContain('Select Servicing Branch Office');
    expect(await lp.getLineOfBusiness()).toBe(LP_DEFAULTS.lineOfBusiness);
    expect(await lp.getPayToAddress()).toBe(LP_DEFAULTS.payToAddress);
    expect((await lp.getUnionState()).checked).toBe(false);
    expect(await lp.getECommerceState()).toEqual({ checked: true, disabled: true });
    expect(await lp.getProductionOrdersState()).toEqual({ checked: true, disabled: true });
  });

  test('TC-LOC-LP-002: Office field is always disabled', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.isFieldDisabled('txtOffice')).toBe(true);
  });

  test('TC-LOC-LP-003: Local Office field is always disabled', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.isFieldDisabled('txtLocalOffice')).toBe(true);
    expect(await lp.getLocalOfficeValue()).toBe(LP_DEFAULTS.localOffice);
  });

  test('TC-LOC-LP-004: Pay To Address field is always disabled', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.isFieldDisabled('txtPayToAddress')).toBe(true);
    expect(await lp.getPayToAddress()).toBe(LP_DEFAULTS.payToAddress);
  });

  test('TC-LOC-LP-005: eCommerce Active is permanently checked + disabled', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.getECommerceState()).toEqual({ checked: true, disabled: true });
  });

  test('TC-LOC-LP-006: Enable Productions Orders is permanently checked + disabled', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.getProductionOrdersState()).toEqual({ checked: true, disabled: true });
  });

  // ── Save button enable/disable ─────────────────────────────────────────────

  test('TC-LOC-LP-007: Save button disabled on fresh page load', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-LP-008: Save button enables after a form change', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.isSaveEnabled()).toBe(false);
    await lp.setUnion(true);
    expect(await lp.waitForSaveButtonEnabled()).toBe(true); // change enables Save (async Angular dirty)
    // Reverting the toggle is a NET-ZERO change → Save returns to DISABLED (Angular net-zero
    // detection, LR-009/LR-026). The original MD's "stays dirty after revert" does not reproduce live.
    await lp.setUnion(false);
    expect(await lp.waitForSaveButtonDisabled()).toBe(true);
    await lp.reloadAndNavigate(OFFICE_NO); // clean
  });

  // ── Local Office Name validation ───────────────────────────────────────────

  test('TC-LOC-LP-009: Local Office Name required — empty disables Save', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.clearLocalOfficeName();
    expect(await lp.getLocalOfficeName()).toBe('');
    // Live (2026-06-03): clearing the required Local Office Name leaves Save DISABLED — the empty
    // required field gates Save. This MATCHES the requirement; the original MD's anomalous
    // "Save enables on empty" observation no longer reproduces (corrected per LR-020).
    expect(await lp.isSaveEnabled()).toBe(false);
    await lp.reloadAndNavigate(OFFICE_NO); // discard
  });

  test('TC-LOC-LP-010: Local Office Name maxlength (live=255)', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    // The input enforces maxlength=255 (browser-enforced on keystroke). The original MD claimed 50
    // — corrected per LR-020 and flagged to Encore (is 255 intended, or should the limit be 50?).
    expect(await lp.getLocalOfficeNameMaxLength()).toBe(LP_TEST_VALUES.localOfficeNameMaxLength);
  });

  // ── Checkbox toggles (save+reload persistence) ─────────────────────────────

  test('TC-LOC-LP-011: Active checkbox toggle persists through save+reload', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.setActive(false);
    await lp.saveAndConfirm();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-A (revert) — let save PUT finish before reload (Mode A)
    await lp.reloadAndNavigate(OFFICE_NO);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-B (revert) — let reload hydrate persisted value (Mode B)
    expect((await lp.getActiveState()).checked).toBe(false);
    // restore
    await lp.setActive(true);
    await lp.saveAndConfirm();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-A (revert) — let save PUT finish before reload (Mode A)
    await lp.reloadAndNavigate(OFFICE_NO);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // DIAGNOSTIC-PAUSE-B (revert) — let reload hydrate persisted value (Mode B)
    expect((await lp.getActiveState()).checked).toBe(true);
  });

  test('TC-LOC-LP-012: Union checkbox toggle persists through save+reload', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.setUnion(true);
    await lp.saveAndConfirm();
    await lp.reloadAndNavigate(OFFICE_NO);
    expect((await lp.getUnionState()).checked).toBe(true);
    // restore
    await lp.setUnion(false);
    await lp.saveAndConfirm();
    await lp.reloadAndNavigate(OFFICE_NO);
    expect((await lp.getUnionState()).checked).toBe(false);
  });

  // ── Dropdown enumerations ──────────────────────────────────────────────────

  test('TC-LOC-LP-013: Tax Mode dropdown options (US, International)', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.getTaxModeOptions()).toEqual([...LP_DROPDOWN.taxMode]);
    expect(await lp.getTaxMode()).toBe(LP_DEFAULTS.taxMode);
  });

  test('TC-LOC-LP-014: Country dropdown options (US, Mexico, Canada, Bahamas)', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.getCountryOptions()).toEqual([...LP_DROPDOWN.country]);
    expect(await lp.getCountry()).toBe(LP_DEFAULTS.country);
  });

  test('TC-LOC-LP-015: Region dropdown options + non-persist on reload', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    const options = await lp.getRegionOptions();
    expect(options.length).toBeGreaterThan(LP_DROPDOWN.regionLowerBound); // live: 59 (LR-022 — no exact assert)
    expect(options).toContain(LP_DROPDOWN.regionContains);
    expect(await lp.getRegion()).toBe(LP_DEFAULTS.region);
    await lp.selectRegion(LP_TEST_VALUES.regionAlt);
    expect(await lp.getRegion()).toBe(LP_TEST_VALUES.regionAlt);
    await lp.reloadAndNavigate(OFFICE_NO); // no save -> reverts
    expect(await lp.getRegion()).toBe(LP_DEFAULTS.region);
  });

  test('TC-LOC-LP-016: Line Of Business is read-only/disabled in edit mode (NM-831)', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    // Corrected from the original MD ("3-option dropdown"): LOB is disabled when EDITING an existing
    // location by Encore design (NM-831 / NM-1140 — selectable only at creation). A disabled Radix
    // combobox cannot open, so the assertion is the disabled state + the displayed value.
    expect(await lp.isFieldDisabled('drpLineOfBusiness')).toBe(true);
    expect(await lp.getLineOfBusiness()).toBe(LP_DEFAULTS.lineOfBusiness);
  });

  test('TC-LOC-LP-017: Servicing Branch Office dropdown + unselected default', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    const options = await lp.getServicingBranchOptions();
    expect(options.length).toBeGreaterThan(LP_DROPDOWN.servicingBranchLowerBound); // live: 218 (LR-022)
    expect(await lp.getServicingBranch()).toContain('Select Servicing Branch Office');
    // selecting a value enables Save (validation satisfied); discard without saving (required field
    // has no "unselect" — saving would leak into 1604).
    const firstBranch = options[0];
    expect(firstBranch).toBeTruthy();
    await lp.selectServicingBranch(firstBranch as string);
    expect(await lp.isSaveEnabled()).toBe(true);
    await lp.reloadAndNavigate(OFFICE_NO);
    expect(await lp.getServicingBranch()).toContain('Select Servicing Branch Office');
  });

  // ── Country cascade ────────────────────────────────────────────────────────

  test('TC-LOC-LP-018: Country change clears Tax Mode + Region', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    expect(await lp.getTaxMode()).toBe(LP_DEFAULTS.taxMode);
    expect(await lp.getRegion()).toBe(LP_DEFAULTS.region);
    await lp.selectCountry(LP_TEST_VALUES.countryAlt); // Canada
    expect(await lp.getTaxMode()).toBe('');
    expect(await lp.getRegion()).toBe('');
    expect(await lp.isSaveEnabled()).toBe(false); // TaxModeID = 0
    await lp.reloadAndNavigate(OFFICE_NO); // discard
  });

  test('TC-LOC-LP-019: Save disabled after Country change (TaxModeID=0); re-select Tax Mode re-enables', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.selectCountry(LP_TEST_VALUES.countryAlt);
    expect(await lp.isSaveEnabled()).toBe(false);
    await lp.selectTaxMode('International');
    expect(await lp.isSaveEnabled()).toBe(true);
    await lp.reloadAndNavigate(OFFICE_NO); // discard
  });

  test('TC-LOC-LP-020: Tax Mode + Region NOT auto-restored after Country change', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.selectCountry(LP_TEST_VALUES.countryAlt); // Canada -> clears Tax/Region
    expect(await lp.getTaxMode()).toBe('');
    await lp.selectCountry(LP_DEFAULTS.country); // back to United States
    expect(await lp.getTaxMode()).toBe(''); // still empty (not auto-restored)
    expect(await lp.getRegion()).toBe('');
    await lp.reloadAndNavigate(OFFICE_NO); // discard
  });

  test('TC-LOC-LP-021: Country=USA enables Job Costing; Canada unchecks it (Local Information)', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.clickLocalInformationTab();
    expect((await lp.getJobCostingState()).checked).toBe(true); // USA default
    await lp.selectCountry(LP_TEST_VALUES.countryAlt); // Canada
    expect((await lp.getJobCostingState()).checked).toBe(false);
    await lp.reloadAndNavigate(OFFICE_NO); // discard
  });

  test('TC-LOC-LP-022: Country=Canada reveals Remit PST Tax (Local Information)', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.clickLocalInformationTab();
    expect(await lp.isRemitPstVisible()).toBe(false); // USA: not present
    await lp.selectCountry(LP_TEST_VALUES.countryAlt); // Canada
    expect(await lp.isRemitPstVisible()).toBe(true);
    await lp.reloadAndNavigate(OFFICE_NO); // discard
  });

  // ── Live Date popover ──────────────────────────────────────────────────────

  test('TC-LOC-LP-023: Live Date button opens a date popover', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    // Value-agnostic (1604 Live Date drifts — shared office); assert format + that the popover opens.
    expect(await lp.getLiveDateText()).toMatch(/^[A-Z][a-z]+ \d{1,2}(st|nd|rd|th), \d{4}$/);
    expect(await lp.openLiveDatePopover()).toBe(true);
    await lp.closeLiveDatePopover();
    // Pay To Address above remains read-only regardless.
    expect(await lp.isFieldDisabled('txtPayToAddress')).toBe(true);
  });

  // TC-LOC-LP-024 (Cross-tab Save validation — Legal tab invalid): NOT automated here. Driving the
  // Legal tab into an INVALID state (clearing the required Service Charge) has no UI "clear"
  // affordance on the Radix required select AND risks Legal state-leak per the Legal Path D teardown
  // finding (a DOM mutation of a Radix SC combobox tears down the Angular page). Save-gating on an
  // invalid Basic-Information state is already proven by TC-019 (TaxModeID=0). Documented (c) in the
  // field-case catalog + flagged for a design decision (no-leak mandate vs Legal Path D) — see the
  // subplan Execution Summary + chat handoff. NOT a bug → no BUG cite, no test.fixme stub.

  // ── Net-new: save+reload persistence per distinct editable field ───────────

  test('TC-LOC-LP-025: Local Office Name persists through save+reload', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.setLocalOfficeName(LP_TEST_VALUES.localOfficeNamePersist);
    await lp.saveAndConfirm();
    await lp.reloadAndNavigate(OFFICE_NO);
    expect(await lp.getLocalOfficeName()).toBe(LP_TEST_VALUES.localOfficeNamePersist);
    // restore
    await lp.setLocalOfficeName(LP_DEFAULTS.localOfficeName);
    await lp.saveAndConfirm();
    await lp.reloadAndNavigate(OFFICE_NO);
    expect(await lp.getLocalOfficeName()).toBe(LP_DEFAULTS.localOfficeName);
  });

  test('TC-LOC-LP-026: Tax Mode persists through save+reload', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.selectTaxMode(LP_TEST_VALUES.taxModeAlt); // International
    await lp.saveAndConfirm();
    await lp.reloadAndNavigate(OFFICE_NO);
    expect(await lp.getTaxMode()).toBe(LP_TEST_VALUES.taxModeAlt);
    // restore
    await lp.selectTaxMode(LP_DEFAULTS.taxMode);
    await lp.saveAndConfirm();
    await lp.reloadAndNavigate(OFFICE_NO);
    expect(await lp.getTaxMode()).toBe(LP_DEFAULTS.taxMode);
  });

  test('TC-LOC-LP-027: Region persists through save+reload', async ({ locationLeftPanelBasicInformationPage: lp }) => {
    await lp.selectRegion(LP_TEST_VALUES.regionAlt); // Boston
    await lp.saveAndConfirm();
    await lp.reloadAndNavigate(OFFICE_NO);
    expect(await lp.getRegion()).toBe(LP_TEST_VALUES.regionAlt);
    // restore
    await lp.selectRegion(LP_DEFAULTS.region);
    await lp.saveAndConfirm();
    await lp.reloadAndNavigate(OFFICE_NO);
    expect(await lp.getRegion()).toBe(LP_DEFAULTS.region);
  });

});
