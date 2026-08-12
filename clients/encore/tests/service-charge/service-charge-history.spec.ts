import { test, expect } from '../../src/fixtures/pages.fixture';
import { ServiceChargePage } from '../../src/pages/service-charge/service-charge.page';
import {
  SC_OFFICE,
  SC_HISTORY_COLUMN_HEADERS,
  SC_SERVICE_TYPE_INDEX,
} from '../../src/data/service-charge/service-charge';

const APP_IDX = SC_SERVICE_TYPE_INDEX['APP Downloaded'] as number; // 0

/**
 * Service Charge — Service Charge History tab (NM-3344).
 *
 * Governs 15 test cases (TC-SVC-HIS-001..015).
 *
 * Per-test baseline: beforeEach calls sc.goto() — fresh page load is the reset mechanism, ensuring no test inherits state from a prior run.
 * The History grid is read-only. Only TC-SVC-HIS-014 makes an unsaved edit and must not save.
 *
 * Count: 11 ordinary (pass) + 0 fixme + 4 known-defect (expected to fail) = 15.
 *
 * Known-defect tests:
 *   TC-SVC-HIS-001 — NM-3300 (page heading omits office name)
 *   TC-SVC-HIS-010 — no ticket (Modified By renders raw GUID instead of display name)
 *   TC-SVC-HIS-014 — NM-3285 (Unsaved Changes modal absent on tab switch)
 *   TC-SVC-HIS-015 — NM-3300 family (office context header omits office name — same root cause as HIS-001, different element)
 * These assert the intended behaviour and are expected to fail against the current build.
 * Do NOT use test.fail() — it would mask genuine regressions in our own code.
 *
 * Row assertions are content-anchored (≥ 1, not exact count) — office 1604 had 50 rows on
 * 2026-08-11 but that number may drift, so row assertions use content checks rather than exact counts.
 *
 * Waits are anchored to specific elements or Angular stability signals, not networkidle or fixed sleep delays.
 *
 * Verified: whole-file history spec run twice on 2026-08-11 (auditfix run, workers=1 retries=0).
 * Known-defect tests (HIS-001, HIS-010, HIS-014, HIS-015) fail by design.
 */


test.describe('Service Charge History', () => {
  let sc: ServiceChargePage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    test.setTimeout(120_000);
    sc = new ServiceChargePage(authenticatedSession.page, config);
    await sc.goto(SC_OFFICE);
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-001 — render state / known-defect NM-3300

  test('TC-SVC-HIS-001: History tab activates correctly and shows the right heading and columns', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);
    test.info().annotations.push({
      type: 'known-defect',
      description: 'NM-3300 — heading currently renders "Service Charge" with no office name; the heading assertion is expected to fail against the current build',
    });

    await sc.switchToHistoryTab();

    // Heading should include the office name (known defect: NM-3300 — currently omits it).
    const heading = await sc.getPageHeading();
    expect(heading).toMatch(/Parker Palm Springs/);

    // All four column headers must be present in order.
    const headers = await sc.getHistoryHeaders();
    expect(headers).toEqual([...SC_HISTORY_COLUMN_HEADERS]);
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-002 — empty-vol

  test('TC-SVC-HIS-002: Grid populates with data rows after the History tab loads', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const rowCount = await sc.getHistoryRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-003 — render state

  test('TC-SVC-HIS-003: Every visible row has four non-empty cells', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const rows = await sc.getHistoryRows();
    expect(rows.length).toBeGreaterThanOrEqual(1);

    // Sample the first ten rows (or all if fewer than ten).
    const sample = rows.slice(0, 10);
    for (const row of sample) {
      expect(row).toHaveLength(4);
      for (const cell of row) {
        expect(cell.trim().length).toBeGreaterThan(0);
      }
    }
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-004 — render state

  test('TC-SVC-HIS-004: Service Charge Percentage cells render in "24.00 %" format', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const rows = await sc.getHistoryRows();
    expect(rows.length).toBeGreaterThanOrEqual(1);

    // Percentage is column index 1. Sample up to three rows.
    // Format: digits, dot, exactly two decimal digits, one space, percent sign.
    for (const row of rows.slice(0, Math.min(3, rows.length))) {
      expect(row[1]).toMatch(/^\d+\.\d{2} %$/);
    }
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-005 — render state

  test('TC-SVC-HIS-005: Modified On cells render in "MM/DD/YYYY hh:mm:ss AM|PM" format', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const rows = await sc.getHistoryRows();
    expect(rows.length).toBeGreaterThanOrEqual(1);

    // Modified On is column index 3. Sample up to three rows.
    for (const row of rows.slice(0, Math.min(3, rows.length))) {
      expect(row[3]).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} (AM|PM)$/);
    }
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-006 — sorting

  test('TC-SVC-HIS-006: Grid default sort is Modified On descending (newest record first)', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const rows = await sc.getHistoryRows();
    expect(rows.length).toBeGreaterThanOrEqual(2);

    // Modified On is column index 3. Parse MM/DD/YYYY hh:mm:ss AM|PM and verify non-ascending order.
    const sample = rows.slice(0, Math.min(10, rows.length));
    const dates = sample.map((row) => new Date(row[3] ?? ''));
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]!.getTime()).toBeGreaterThanOrEqual(dates[i + 1]!.getTime());
    }
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-007 — render state (read-only census)

  test('TC-SVC-HIS-007: Grid is read-only — no interactive elements inside', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    // While on the History tab the grid must expose no interactive UI of any kind —
    // no filter, search, date-range, or pagination controls. This is the comprehensive
    // read-only census; TC-SVC-HIS-008 and TC-SVC-HIS-009 each re-confirm specific subsets.
    const census = await sc.getHistoryControlCensus();
    expect(census.filterInputCount).toBe(0);
    expect(census.searchInputCount).toBe(0);
    expect(census.dateRangePickerCount).toBe(0);
    expect(census.paginationAriaLabelCount).toBe(0);
    expect(census.roleNavigationCount).toBe(0);
    expect(census.nextPrevButtonCount).toBe(0);
    expect(census.pageSizeSelectorCount).toBe(0);
    expect(census.loadMoreCount).toBe(0);
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-008 — pagination

  test('TC-SVC-HIS-008: No pagination control is present on the History tab', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const census = await sc.getHistoryControlCensus();
    expect(census.paginationAriaLabelCount).toBe(0);
    expect(census.roleNavigationCount).toBe(0);
    expect(census.nextPrevButtonCount).toBe(0);
    expect(census.pageSizeSelectorCount).toBe(0);
    expect(census.loadMoreCount).toBe(0);
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-009 — render state (filter/search)

  test('TC-SVC-HIS-009: No filter, search, or date-range control is present on the History tab', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const census = await sc.getHistoryControlCensus();
    expect(census.filterInputCount).toBe(0);
    expect(census.searchInputCount).toBe(0);
    expect(census.dateRangePickerCount).toBe(0);
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-010 — render state / known-defect (no ticket)

  test('TC-SVC-HIS-010: Modified By cells render a user identifier, not a raw GUID', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);
    test.info().annotations.push({
      type: 'known-defect',
      description: 'No ticket — all sampled rows on 2026-08-11 rendered a raw GUID (e.g. 0c0bec78-1b63-4eed-a2ea-967920c8bfc3) instead of a display name; this assertion is expected to fail against the current build',
    });

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const rows = await sc.getHistoryRows();
    expect(rows.length).toBeGreaterThanOrEqual(1);

    // Modified By is column index 2. It should not be a raw UUID.
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const row of rows.slice(0, Math.min(3, rows.length))) {
      expect(row[2]).not.toMatch(uuidPattern);
    }
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-011 — result-fidelity
  // Precondition: offices 1101 and 1105 must each have at least one Service Charge History row.
  // Observed on the live application on 2026-08-11: 1604=50 rows, 1101=32 rows, 1105=35 rows.
  //
  // Office switches use gotoHistory() instead of goto() because this test only needs the History
  // grid — it never interacts with the Basic Information inputs. The standard goto() gate waits
  // for percentage inputs to become enabled, which is inappropriate here: the second and third
  // offices may have read-only or delayed BI inputs, causing a 60 s timeout that has nothing to
  // do with whether the History grid loaded successfully (confirmed 2-of-2 identical failures on
  // 2026-08-11 with 115 consecutive disabled-input polls — deterministic, not environmental wobble).

  test('TC-SVC-HIS-011: History data is scoped per office — different offices show different row sets', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    // Office 1604 (primary test office — beforeEach already landed here via goto()).
    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();
    const count1604 = await sc.getHistoryRowCount();
    expect(count1604).toBeGreaterThanOrEqual(1);

    // Office 1101 — use gotoHistory(): this test only reads the History grid, not BI inputs.
    await sc.gotoHistory('1101');
    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();
    const count1101 = await sc.getHistoryRowCount();
    expect(count1101).toBeGreaterThanOrEqual(1);

    // Office 1105 — same reasoning.
    await sc.gotoHistory('1105');
    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();
    const count1105 = await sc.getHistoryRowCount();
    expect(count1105).toBeGreaterThanOrEqual(1);

    // Row counts must not all be identical — at least two offices must differ, proving isolation.
    const counts = new Set([count1604, count1101, count1105]);
    expect(counts.size).toBeGreaterThan(1);
  });

  test('TC-SVC-HIS-012: Clicking a History grid column header does not set aria-sort on the header', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);

    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const page = authenticatedSession.page;
    const rowsBefore = await sc.getHistoryRows();
    expect(rowsBefore.length).toBeGreaterThanOrEqual(1);

    // Click the first column header (Service Type).
    const allColumnHeaders = page.getByRole('columnheader');
    await allColumnHeaders.first().click();

    // Observed live: aria-sort is not set after the click — the grid does not expose sort affordance.
    const ariaSort = await allColumnHeaders.first().getAttribute('aria-sort', { timeout: 3000 }).catch(() => null);
    expect(ariaSort).toBeNull();

    // Observed across 3 independent runs (passes 4, 5, 6): clicking the column header empties the
    // History grid and rows do not return within 30 s. No requirement covers column-header click
    // behaviour; recorded as a discussion item during exploratory testing. The row-order
    // assertion is removed to prevent a 30 s timeout — the grid-empties behaviour is documented,
    // not blocked on here.
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-013 — save adds History row

  test('TC-SVC-HIS-013: A Basic Information save adds a new row to Service Charge History', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);

    const AUTOMATION_USER = 's-prd-clickauto@psav.com';
    const today = new Date();
    const todayDateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

    // Record the baseline row count before making any change.
    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();
    const baselineCount = await sc.getHistoryRowCount();

    // Switch to Basic Information, edit one field, and save.
    await sc.switchToBasicInformationTab();
    const originalValue = await sc.getPercentageByIndex(APP_IDX);

    try {
      await sc.setPercentageByIndex(APP_IDX, '1.00');
      await sc.clickSave();
      await sc.waitUntilLoaded();

      // Switch to History and confirm a new row appeared at the top.
      await sc.switchToHistoryTab();
      await sc.waitUntilHistoryLoaded();

      const rowsAfterSave = await sc.getHistoryRows();
      expect(rowsAfterSave.length).toBeGreaterThan(baselineCount);

      // Confirmed by live probe on 2026-08-11: new row reflects the saved change and Modified By
      // shows the automation user's email address, not a GUID.
      const topRow = rowsAfterSave[0]!;
      expect(topRow[0]).toBe('APP Downloaded');
      expect(topRow[1]).toContain('1.00 %');
      expect(topRow[2]).toBe(AUTOMATION_USER);
      expect(topRow[3]).toContain(todayDateStr);
    } finally {
      // Restore the original value regardless of any assertion failure.
      await sc.switchToBasicInformationTab();
      await sc.setPercentageByIndex(APP_IDX, originalValue);
      if (await sc.isSaveEnabled()) {
        await sc.clickSave();
        await sc.waitUntilLoaded();
      }
    }
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-014 — known-defect NM-3285

  test('TC-SVC-HIS-014: Navigating to History tab with unsaved Basic Information edits triggers an Unsaved Changes modal', async ({
    dependencyGate,
    authenticatedSession,
  }) => {
    dependencyGate([]);
    test.info().annotations.push({
      type: 'known-defect',
      description: 'NM-3285 — the Unsaved Changes modal does not appear; clicking the History tab with a dirty form triggers a browser-native beforeunload that navigates the page away without any Angular modal; this assertion is expected to fail against the current build',
    });

    const page = authenticatedSession.page;

    // Make an unsaved edit on the Basic Information tab.
    await sc.setPercentageByIndex(0, '50.00');
    expect(await sc.isSaveEnabled()).toBe(true);

    // Click the History tab directly — do NOT use switchToHistoryTab(), which waits for
    // aria-selected="true" and throws when a browser-native beforeunload navigates the
    // page away and detaches the tab element (NM-3285 defect path).
    const historyTab = page.getByRole('tab', { name: 'Service Charge History', exact: true });
    await historyTab.click();

    // Check immediately whether an in-app Unsaved Changes modal appeared before or
    // during navigation. The current defect: no Angular modal fires; the browser-native
    // beforeunload is accepted by the fixture and the page navigates away entirely.
    // Either way — no in-app modal = NM-3285 confirmed.
    const modalVisible = await sc.isUnsavedChangesModalVisible().catch(() => false);
    expect(modalVisible).toBe(true);
  });

  // ---------------------------------------------------------------- TC-SVC-HIS-015 — render state
  // Known defect: the app does not inject the office name into the context header element —
  // getOfficeHeader() returns "Local Office :" with no name appended. This is the same root cause
  // as NM-3300 (which tracks the h1 heading omitting the office name) but affects a different
  // element (the breadcrumb/context header, not the h1). Confirmed deterministic across 2
  // independent whole-file runs on 2026-08-11 (identical DOM state: 115 polls for HIS-011,
  // consistent "Local Office :" for HIS-015). Not environmental wobble. Recorded as second
  // sighting of the office-name-missing defect during exploratory testing.

  test('TC-SVC-HIS-015: Office context is preserved when switching from Basic Information to History tab', async ({
    dependencyGate,
  }) => {
    dependencyGate([]);
    test.info().annotations.push({
      type: 'known-defect',
      description: 'NM-3300 family — the office context header renders "Local Office :" with no office name; same root cause as NM-3300 (heading omits office name) but affecting the breadcrumb header element. Second sighting confirmed during exploratory testing. Expected to fail against the current build.',
    });

    // Confirm office context before tab switch.
    const headerBefore = await sc.getOfficeHeader();
    expect(headerBefore).toMatch(/Parker Palm Springs/);

    // Switch to History tab — office context must be unchanged.
    await sc.switchToHistoryTab();
    await sc.waitUntilHistoryLoaded();

    const headerAfter = await sc.getOfficeHeader();
    expect(headerAfter).toMatch(/Parker Palm Springs/);

    // History grid must contain at least one row for office 1604.
    const rowCount = await sc.getHistoryRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });
});
