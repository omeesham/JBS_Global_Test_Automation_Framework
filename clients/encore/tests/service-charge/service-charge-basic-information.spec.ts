import { test, expect } from '../../src/fixtures/pages.fixture';
import { ServiceChargePage } from '../../src/pages/service-charge/service-charge.page';
import {
  SC_OFFICE,
  SC_ROW_COUNT,
  SC_BASIC_COLUMN_HEADERS,
  SC_SERVICE_TYPE_INDEX,
} from '../../src/data/service-charge/service-charge';

/**
 * Service Charge — Basic Information tab (NM-3344).
 *
 * Per-test baseline: beforeEach calls sc.goto() — a fresh page load is the reset mechanism,
 * ensuring no test inherits state from a prior run. Tests that perform a real save restore the original value in the
 * test body via try/finally. No sibling spec (service-charge-text) uses a dedicated
 * ensureDefaultState helper for percentage inputs; try/finally is the closest equivalent
 * for save-restoring tests here.
 *
 * Save behavior: the app completes Save with no confirmation dialog on this page.
 * Restore paths call waitUntilLoaded() after clickSave() — no dialog to dismiss.
 *
 * RUNTIME VERIFICATION OUTSTANDING: these specs have NOT been run. The e2e environment
 * was degraded at authoring time. No test result is verified.
 */


const AUDIO_IDX = SC_SERVICE_TYPE_INDEX['Audio Conferencing'] as number; // 8
const APP_IDX   = SC_SERVICE_TYPE_INDEX['APP Downloaded']     as number; // 0
const EQ_IDX    = SC_SERVICE_TYPE_INDEX['Equipment Rental']   as number; // 23

const DEFAULT_AUDIO_NUM = '24.00';
const DEFAULT_APP_NUM   = '0.00';


test.describe('Service Charge Basic Information', () => {
  let sc: ServiceChargePage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    test.setTimeout(120_000);
    sc = new ServiceChargePage(authenticatedSession.page, config);
    await sc.goto(SC_OFFICE);
  });

  // ---------------------------------------------------------------- positive acceptance

  test('TC-SVC-BAS-001: Editing a percentage field to a valid mid-range value is accepted', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    // Read the live value before any edit so the restore target matches the actual database state.
    const originalAudio = await sc.getPercentageByIndex(AUDIO_IDX);

    await sc.setPercentageByIndex(AUDIO_IDX, '50.00');
    expect(await sc.waitForSaveActive()).toBe(true);

    try {
      await sc.setPercentageByIndex(AUDIO_IDX, originalAudio);
      // When restoring to the original value the form registers a net-zero change and the app
      // disables Save — the database already holds the correct value, so no save is needed.
      if (await sc.isSaveEnabled()) {
        await sc.clickSave();
        await sc.waitUntilLoaded();
      }
    } catch {
      throw new Error('TC-SVC-BAS-001: restore failed — environment may be dirty');
    }
  });

  test('TC-SVC-BAS-002: Editing a percentage field to 0.00 is accepted and enables Save', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    // Read the live value before any edit so the restore target matches the actual database state.
    const originalAudio = await sc.getPercentageByIndex(AUDIO_IDX);

    await sc.setPercentageByIndex(AUDIO_IDX, '0.00');
    expect(await sc.waitForSaveActive()).toBe(true);

    try {
      await sc.setPercentageByIndex(AUDIO_IDX, originalAudio);
      // When restoring to the original value the form registers a net-zero change and the app
      // disables Save — the database already holds the correct value, so no save is needed.
      if (await sc.isSaveEnabled()) {
        await sc.clickSave();
        await sc.waitUntilLoaded();
      }
    } catch {
      throw new Error('TC-SVC-BAS-002: restore failed');
    }
  });

  test('TC-SVC-BAS-003: Editing a percentage field to 100.00 is accepted', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    const originalAudio = await sc.getPercentageByIndex(AUDIO_IDX);
    const input = authenticatedSession.page.locator(`[data-testid="service-charge-percentage-${AUDIO_IDX}"]`);

    await sc.setPercentageByIndex(AUDIO_IDX, '100.00');

    // Observed live: 100.00 is accepted — value shows "100.00 %", aria-invalid absent, Save enables.
    expect(await input.inputValue()).toContain('100.00');
    expect(await input.getAttribute('aria-invalid')).not.toBe('true');
    expect(await sc.waitForSaveActive()).toBe(true);

    try {
      await sc.setPercentageByIndex(AUDIO_IDX, originalAudio);
      if (await sc.isSaveEnabled()) {
        await sc.clickSave();
        await sc.waitUntilLoaded();
      }
    } catch {
      throw new Error('TC-SVC-BAS-003: restore failed — environment may be dirty');
    }
  });

  // ---------------------------------------------------------------- persistence

  test('TC-SVC-BAS-004: Saved percentage value persists after page reload', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    try {
      await sc.setPercentageByIndex(AUDIO_IDX, '30.00');
      await sc.clickSave();
      await sc.waitUntilLoaded();

      await sc.goto(SC_OFFICE);
      expect(await sc.getPercentageByIndex(AUDIO_IDX)).toContain('30.00');
    } finally {
      await sc.setPercentageByIndex(AUDIO_IDX, DEFAULT_AUDIO_NUM);
      await sc.clickSave();
      await sc.waitUntilLoaded();
    }
  });

  // ---------------------------------------------------------------- boundary / negative

  test('TC-SVC-BAS-005: Entering a value just below zero (negative boundary)', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    await sc.setPercentageByIndex(AUDIO_IDX, '-0.01');

    // NEEDS-LIVE-CONFIRM: verify the field rejects -0.01 with aria-invalid="true" and that
    // Tab moves focus out (not a focus trap).
    const ariaInvalid = await authenticatedSession.page
      .locator(`[data-testid="service-charge-percentage-${AUDIO_IDX}"]`)
      .getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('true');
  });

  test('TC-SVC-BAS-006: Entering a value just above 100', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    await sc.setPercentageByIndex(AUDIO_IDX, '100.01');

    // NEEDS-LIVE-CONFIRM: verify whether over-100 is rejected with aria-invalid="true".
    const ariaInvalid = await authenticatedSession.page
      .locator(`[data-testid="service-charge-percentage-${AUDIO_IDX}"]`)
      .getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('true');
  });

  test('TC-SVC-BAS-007: Entering a value with three decimal places silently rounds to two', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    const input = authenticatedSession.page.locator(`[data-testid="service-charge-percentage-${AUDIO_IDX}"]`);

    await sc.setPercentageByIndex(AUDIO_IDX, '24.005');

    // Observed live: 24.005 is silently rounded to "24.00 %" — the third decimal is discarded.
    // aria-invalid is absent; the validator treats the rounded value as valid.
    // Save state is not asserted: the rounded result equals the original "24.00 %" for Audio
    // Conferencing, producing a net-zero edit that keeps Save disabled.
    expect(await input.inputValue()).toContain('24.00');
    expect(await input.getAttribute('aria-invalid')).not.toBe('true');
  });

  test('TC-SVC-BAS-008: Reverting an edited field to its original value keeps Save disabled', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    await sc.setPercentageByIndex(APP_IDX, '5.00');
    await sc.setPercentageByIndex(APP_IDX, DEFAULT_APP_NUM);
    expect(await sc.waitForSaveInactive()).toBe(true);
  });

  test('TC-SVC-BAS-009: Entering alphabetic text into a percentage field is rejected on blur', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    const input = authenticatedSession.page.locator(`[data-testid="service-charge-percentage-${APP_IDX}"]`);

    await sc.setPercentageByIndex(APP_IDX, 'abc');

    // Observed live: alpha characters are not blocked at entry — they appear in the field.
    // After blur, aria-invalid="true" is set and Save is disabled.
    // No error message text is rendered; aria-invalid is the only rejection signal.
    expect(await input.getAttribute('aria-invalid')).toBe('true');
    expect(await sc.waitForSaveInactive()).toBe(true);
  });

  test('TC-SVC-BAS-010: Entering a malformed decimal value is rejected on blur', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    const input = authenticatedSession.page.locator(`[data-testid="service-charge-percentage-${AUDIO_IDX}"]`);

    await sc.setPercentageByIndex(AUDIO_IDX, '1.2.3');

    // Observed live: "1.2.3" is kept verbatim in input.value — the browser does not filter it.
    // After blur, aria-invalid="true" is set and Save is disabled.
    // No error message text is rendered alongside the invalid field.
    expect(await input.inputValue()).toBe('1.2.3');
    expect(await input.getAttribute('aria-invalid')).toBe('true');
    expect(await sc.waitForSaveInactive()).toBe(true);
  });

  test('TC-SVC-BAS-011: Entering a negative number into a percentage field', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    await sc.setPercentageByIndex(AUDIO_IDX, '-5');

    // NEEDS-LIVE-CONFIRM: verify whether negative numbers are rejected with aria-invalid="true".
    const ariaInvalid = await authenticatedSession.page
      .locator(`[data-testid="service-charge-percentage-${AUDIO_IDX}"]`)
      .getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('true');
  });

  test('TC-SVC-BAS-012: Entering a leading-zero number normalises to the standard format', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    const input = authenticatedSession.page.locator(`[data-testid="service-charge-percentage-${APP_IDX}"]`);

    await sc.setPercentageByIndex(APP_IDX, '024');

    // Observed live: "024" is normalised to "24.00 %" — the leading zero is stripped and the
    // standard two-decimal format is applied. aria-invalid is absent; the value is accepted.
    expect(await input.inputValue()).toContain('24.00');
    expect(await input.getAttribute('aria-invalid')).not.toBe('true');
  });

  test('TC-SVC-BAS-013: Entering scientific notation is accepted by the validator', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    const input = authenticatedSession.page.locator(`[data-testid="service-charge-percentage-${AUDIO_IDX}"]`);

    await sc.setPercentageByIndex(AUDIO_IDX, '2e1');

    // Observed live: aria-invalid is absent after entering "2e1" — the validator accepts
    // scientific notation as a valid numeric value.
    // The display format after normalisation was ambiguous in the probe and is not asserted.
    // Save state is not asserted: the probe for this value used eval injection rather than
    // the keyboard path, making the observed Save state unreliable to assert here.
    expect(await input.getAttribute('aria-invalid')).not.toBe('true');
  });

  test('TC-SVC-BAS-014: Clearing a percentage field completely is treated as valid by the validator', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    const input = authenticatedSession.page.locator(`[data-testid="service-charge-percentage-${AUDIO_IDX}"]`);

    await sc.setPercentageByIndex(AUDIO_IDX, '');

    // Observed via keyboard path: Angular normalises an empty fill to "0.00 %" — the field
    // does not remain empty when cleared via keyboard. aria-invalid is absent.
    // (The eval-injection probe showed value="" but that bypassed Angular's normalisation;
    // the keyboard path is the authoritative observation for this test.)
    expect(await input.inputValue()).toContain('0.00');
    expect(await input.getAttribute('aria-invalid')).not.toBe('true');
  });

  test('TC-SVC-BAS-015: Entering whitespace only into a percentage field is treated as valid', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    const input = authenticatedSession.page.locator(`[data-testid="service-charge-percentage-${AUDIO_IDX}"]`);

    await sc.setPercentageByIndex(AUDIO_IDX, '   ');

    // Observed live: whitespace is preserved in input.value and aria-invalid is absent — the
    // validator does not flag whitespace-only input as invalid.
    // Save state is not asserted: the probe observed this via eval injection rather than the
    // keyboard path, making the observed Save state unreliable to assert here.
    expect(await input.getAttribute('aria-invalid')).not.toBe('true');
  });

  test('TC-SVC-BAS-016: Pasting a very long numeric string is rejected by the validator', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    const longNum = '12345678901234567890123456789012345678901234567890'; // 50 digits
    const input = authenticatedSession.page.locator(`[data-testid="service-charge-percentage-${APP_IDX}"]`);

    await sc.setPercentageByIndex(APP_IDX, longNum);

    // The keyboard/paste path converts the 50-digit number to scientific notation
    // (observed: "1.2345678901234567e+49 %") — the raw digit string is not preserved in input.value.
    // The earlier eval-injection probe that saw raw digit retention used a different code path and
    // produced distorted evidence. The real path: paste → scientific-notation conversion.
    // aria-invalid="true" is set because the value is out of range for a percentage field.
    // Save is disabled while the field is invalid.
    expect(await input.inputValue()).toContain('e+');
    expect(await input.getAttribute('aria-invalid')).toBe('true');
    expect(await sc.waitForSaveInactive()).toBe(true);
  });

  test('TC-SVC-BAS-017: The percent suffix is part of input.value — the application renders it, not the user', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    // Observed live: input.value carries the "%" sign at rest (e.g. "0.00 %") — the application
    // adds the suffix without any user input. The user types only the numeric part.
    const value = await sc.getPercentageByIndex(APP_IDX);
    expect(value).toContain(' %');
  });

  // ---------------------------------------------------------------- dirty state / save-cycle

  test('TC-SVC-BAS-018: Editing any percentage field enables the Save button', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    expect(await sc.isSaveEnabled()).toBe(false);
    await sc.setPercentageByIndex(AUDIO_IDX, '50.00');
    expect(await sc.waitForSaveActive()).toBe(true);

    // Reload without saving — discards the unsaved edit.
    await sc.goto(SC_OFFICE);
    expect(await sc.isSaveEnabled()).toBe(false);
  });

  test('TC-SVC-BAS-019: Reverting an edited percentage field to its original value disables Save', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    // Read the live value first so the revert targets the actual current DB value.
    const originalValue = await sc.getPercentageByIndex(AUDIO_IDX);

    await sc.setPercentageByIndex(AUDIO_IDX, '50.00');
    expect(await sc.waitForSaveActive()).toBe(true);

    await sc.setPercentageByIndex(AUDIO_IDX, originalValue);
    expect(await sc.waitForSaveInactive()).toBe(true);
  });

  test('TC-SVC-BAS-020: Saving an edited percentage field persists the new value after reload', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    try {
      await sc.setPercentageByIndex(AUDIO_IDX, '30.00');
      await sc.clickSave();
      await sc.waitUntilLoaded();

      await sc.goto(SC_OFFICE);
      expect(await sc.getPercentageByIndex(AUDIO_IDX)).toContain('30.00');
    } finally {
      await sc.setPercentageByIndex(AUDIO_IDX, DEFAULT_AUDIO_NUM);
      await sc.clickSave();
      await sc.waitUntilLoaded();
    }
  });

  test('TC-SVC-BAS-021: Overwriting an edited value before saving persists the second value', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    try {
      await sc.setPercentageByIndex(AUDIO_IDX, '30.00');
      expect(await sc.waitForSaveActive()).toBe(true);
      await sc.setPercentageByIndex(AUDIO_IDX, '40.00');
      expect(await sc.isSaveEnabled()).toBe(true);

      await sc.clickSave();
      await sc.waitUntilLoaded();

      await sc.goto(SC_OFFICE);
      expect(await sc.getPercentageByIndex(AUDIO_IDX)).toContain('40.00');
    } finally {
      await sc.setPercentageByIndex(AUDIO_IDX, DEFAULT_AUDIO_NUM);
      await sc.clickSave();
      await sc.waitUntilLoaded();
    }
  });

  test('TC-SVC-BAS-022: Navigating away from the page with unsaved edits triggers a confirmation prompt', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);
    const authPage = authenticatedSession.page;

    await sc.setPercentageByIndex(AUDIO_IDX, '50.00');
    expect(await sc.waitForSaveActive()).toBe(true);

    await authPage.goBack();

    // NEEDS-LIVE-CONFIRM: verify whether an "Unsaved changes" alertdialog appears on
    // navigation away. The shared "Save Changes" dialog (dlgSaveChanges / btnSaveChangesConfirm) is
    // assumed unless a live walk proves otherwise.
    const dialog = authPage.locator('[role="alertdialog"], [role="dialog"]').first();
    const dialogVisible = await dialog.isVisible().catch(() => false);
    expect(dialogVisible).toBe(true);

    if (dialogVisible) {
      // Dismiss so the page is not left blocking — click the last button (Discard/Leave).
      await authPage.locator('[role="alertdialog"] button, [role="dialog"] button').last().click().catch(() => {});
    }
  });

  test('TC-SVC-BAS-023: Saving edits to multiple percentage fields in a single Save action', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    // Read live values before any edit so the restore targets match the actual database state.
    const originalAudio = await sc.getPercentageByIndex(AUDIO_IDX);
    const originalEq    = await sc.getPercentageByIndex(EQ_IDX);

    try {
      await sc.setPercentageByIndex(AUDIO_IDX, '30.00');
      await sc.setPercentageByIndex(EQ_IDX, '25.00');
      expect(await sc.isSaveEnabled()).toBe(true);

      await sc.clickSave();
      await sc.waitUntilLoaded();

      await sc.goto(SC_OFFICE);
      expect(await sc.getPercentageByIndex(AUDIO_IDX)).toContain('30.00');
      expect(await sc.getPercentageByIndex(EQ_IDX)).toContain('25.00');
    } finally {
      await sc.setPercentageByIndex(AUDIO_IDX, originalAudio);
      await sc.setPercentageByIndex(EQ_IDX, originalEq);
      // If both restores create a net-zero change the app disables Save — the database already
      // holds the correct values, so no save is needed.
      if (await sc.isSaveEnabled()) {
        await sc.clickSave();
        await sc.waitUntilLoaded();
      }
    }
  });

  // ---------------------------------------------------------------- read-only label column

  test('TC-SVC-BAS-024: Service Type column renders correct labels', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);
    const authPage = authenticatedSession.page;

    // DOM row 0 is the column header; data rows start at 1.
    const label8 = (await authPage.getByRole('row').nth(AUDIO_IDX + 1).getByRole('cell').first().textContent() ?? '').trim();
    expect(label8).toBe('Audio Conferencing');

    const label0 = (await authPage.getByRole('row').nth(APP_IDX + 1).getByRole('cell').first().textContent() ?? '').trim();
    expect(label0).toBe('APP Downloaded');
  });

  test('TC-SVC-BAS-025: Clicking a Service Type label cell does not open any editor or dialog', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);
    const authPage = authenticatedSession.page;

    await authPage.getByRole('row').nth(AUDIO_IDX + 1).getByRole('cell').first().click();
    expect(await sc.isSaveEnabled()).toBe(false);

    await authPage.getByRole('row').nth(APP_IDX + 1).getByRole('cell').first().click();
    expect(await sc.isSaveEnabled()).toBe(false);

    expect(await authPage.locator('[role="dialog"], [role="alertdialog"]').first().isVisible().catch(() => false)).toBe(false);
  });

  // ---------------------------------------------------------------- save button state

  test('TC-SVC-BAS-026: Save button is disabled on page load with no edits', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);
    expect(await sc.isSaveEnabled()).toBe(false);
  });

  test('TC-SVC-BAS-027: Save button enables after any percentage edit', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    expect(await sc.isSaveEnabled()).toBe(false);
    await sc.setPercentageByIndex(AUDIO_IDX, '50.00');
    expect(await sc.waitForSaveActive()).toBe(true);

    await sc.goto(SC_OFFICE);
    expect(await sc.isSaveEnabled()).toBe(false);
  });

  // ---------------------------------------------------------------- render state

  test('TC-SVC-BAS-028: Column headers render with correct labels', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);
    const headers = await sc.getBasicInfoHeaders();
    expect(headers).toEqual([...SC_BASIC_COLUMN_HEADERS]);
  });

  test('TC-SVC-BAS-029: All 79 rows render and a named row is readable', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);
    const rowCount = await authenticatedSession.page
      .locator('[data-testid^="service-charge-percentage-"]')
      .count();
    expect(rowCount).toBe(SC_ROW_COUNT);

    // Confirm the method resolves without error for a named row.
    await sc.getPercentageByIndex(AUDIO_IDX);

    // NEEDS-LIVE-CONFIRM: verify no pagination control or "load more" button is present
    // when the environment is stable (all 79 rows shown at once without virtualization).
  });

  // ---------------------------------------------------------------- persistence (QUICK surface)

  test('TC-SVC-BAS-030: A saved value persists after page reload (surface persistence)', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    try {
      await sc.setPercentageByIndex(AUDIO_IDX, '35.00');
      await sc.clickSave();
      await sc.waitUntilLoaded();

      await sc.goto(SC_OFFICE);
      expect(await sc.getPercentageByIndex(AUDIO_IDX)).toContain('35.00');

      // NEEDS-LIVE-CONFIRM: verify no column sort affordance (sortable column header) is present —
      // row order is application-defined and fixed per inventory.
    } finally {
      await sc.setPercentageByIndex(AUDIO_IDX, DEFAULT_AUDIO_NUM);
      await sc.clickSave();
      await sc.waitUntilLoaded();
    }
  });
});
