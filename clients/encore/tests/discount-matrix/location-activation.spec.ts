import { test, expect } from '../../src/fixtures/pages.fixture';
import { LocationActivationPage } from '../../src/pages/discount-matrix/location-activation.page';
import {
  DM_OFFICE,
  DM_SECOND_OFFICE,
  DM_CRITERIA_AT_REST,
  LOA_COLUMNS,
  LOA_ANCHOR_LOCATION,
  LOA_TOGGLE_LOCATION,
  LOA_SEARCH_NUMBER,
} from '../../src/data/discount-matrix/discount-matrix';

/**
 * Discount Matrix — Location Activation tab (NM-3530; grid behaviour per NM-2221).
 *
 * The grid lists every location for the selected country (2041 for United States when this
 * was written) on either authorized office. Data lands ~43s after the tab click; until then
 * the grid paints textless placeholder rows with the search box disabled, so the ready gate
 * requires rendered rows to carry text. Totals are asserted as format plus non-zero — the
 * listing grows as locations are added, so no fixed number is ever expected.
 *
 * The search box honours input only after a warm-up of roughly two minutes past the tab
 * render — it is enabled well before it is functional, and earlier typing is silently
 * ignored. The product owner accepted that window as loading behaviour (2026-08-26), so
 * the search case retypes in bounded rounds until the app responds and then asserts the
 * steady-state filter. The owner also confirmed the grid's headers are display-only by
 * design (sorting is not a feature here, and the legacy page does not sort either), so
 * the header case pins that no click ever reorders the listing.
 *
 * The Active-flag case edits and discards through Cancel. Nothing in this file saves.
 */
test.describe.configure({ timeout: 420_000 });

test.describe('SBC — Discount Matrix Location Activation surface behaviors @discount-matrix @location-activation', () => {
  let loa: LocationActivationPage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    loa = new LocationActivationPage(authenticatedSession.page, config);
    await loa.ensureCleanLoa(DM_OFFICE);
  });

  test('TC-DSM-LOA-001: The tab opens and shows its three columns', async ({ dependencyGate }) => {
    dependencyGate([]);
    await loa.openTab();
    expect(await loa.readColumnHeaders()).toEqual([...LOA_COLUMNS]);
  });

  test('TC-DSM-LOA-002: The loaded grid reports its record count in the footer', async ({ dependencyGate }) => {
    dependencyGate([]);
    const total = await loa.readFooterTotal();
    expect(total).toBeGreaterThan(0);
    const rows = await loa.readBodyRows();
    // Loaded means every rendered data row carries text; the single full-width height-spacer
    // row that implements virtual scrolling is counted separately, not as data.
    expect(rows.dataRows).toBeGreaterThan(0);
    expect(rows.rowsWithText).toBe(rows.dataRows);
    // The grid renders a bounded window against a listing in the thousands — it virtualizes
    // instead of paginating. If the listing ever shrinks below one window this premise changes.
    expect(rows.dataRows).toBeLessThan(total);
  });

  test('TC-DSM-LOA-005: The listing loads with criteria fully set and belongs to the selected country', async ({ dependencyGate }) => {
    dependencyGate([]);
    // Starts from the landing tab by contract, so this test pays its own reload.
    await loa.discardReload(DM_OFFICE);
    expect(await loa.readCriteriaValues()).toEqual([...DM_CRITERIA_AT_REST]);
    await loa.openTab();
    expect(await loa.readFooterTotal()).toBeGreaterThan(0);
    // The corporate office is the most stable row in the country-scoped listing.
    expect(await loa.readLeadingLocations()).toContain(LOA_ANCHOR_LOCATION);
  });

  test('TC-DSM-LOA-006: The listing is country-scoped, not office-specific', async ({ dependencyGate }) => {
    dependencyGate([]);
    await loa.discardReload(DM_OFFICE);
    await loa.openTab();
    const firstOfficeTotal = await loa.readFooterTotal();
    expect(firstOfficeTotal).toBeGreaterThan(0);
    // Same country, different office — the listing must agree because it is country-keyed.
    await loa.discardReload(DM_SECOND_OFFICE);
    await loa.openTab();
    const secondOfficeTotal = await loa.readFooterTotal();
    expect(secondOfficeTotal).toBe(firstOfficeTotal);
  });

  test('TC-DSM-LOA-007: Every column header offers a resize control', async ({ dependencyGate }) => {
    dependencyGate([]);
    const { headers, resizeHandles } = await loa.readResizeCounts();
    expect(headers).toBeGreaterThan(0);
    // Asserted against the header set, not a fixed number, so a new column cannot silently pass.
    expect(resizeHandles).toBe(headers);
  });

  test('TC-DSM-LOA-008: Location Activation keeps the criteria bar above it', async ({ dependencyGate }) => {
    dependencyGate([]);
    await loa.discardReload(DM_OFFICE);
    expect(await loa.readCriteriaValues()).toEqual([...DM_CRITERIA_AT_REST]);
    await loa.openTab();
    expect(await loa.readCriteriaValues()).toEqual([...DM_CRITERIA_AT_REST]);
  });

  test('TC-DSM-LOA-011: Column headers are display-only and never reorder the listing', async ({ dependencyGate }) => {
    dependencyGate([]);
    // Sorting is not part of this grid's design — the product owner confirmed the
    // display-only headers as the intended behaviour (2026-08-26), and the legacy page
    // does not sort either. This pins that design: clicking a header changes nothing,
    // and no sort indicator ever appears. The headers' only control is the resize handle.
    const before = await loa.readLeadingLocations();
    await loa.clickHeader('Location');
    const afterOne = await loa.readLeadingLocations();
    expect(afterOne).toEqual(before);
    await loa.clickHeader('Location');
    expect(await loa.readLeadingLocations()).toEqual(before);
  });
});

test.describe('Discount Matrix Location Activation — fields @discount-matrix @location-activation', () => {
  let loa: LocationActivationPage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    loa = new LocationActivationPage(authenticatedSession.page, config);
    await loa.ensureCleanLoa(DM_OFFICE);
  });

  test('TC-DSM-LOA-003: The search box is disabled while loading and enabled once locations arrive', async ({ dependencyGate }) => {
    dependencyGate([]);
    // A fresh tab click is the point: the disabled phase lasts ~40s, so the early read is stable.
    await loa.discardReload(DM_OFFICE);
    await loa.openTabRaw();
    await expect(loa.searchBox()).toBeVisible();
    await expect(loa.searchBox()).toBeDisabled();
    await loa.waitForLoaReady();
    await expect(loa.searchBox()).toBeEnabled();
  });

  test('TC-DSM-LOA-004: Cancel and Save are disabled while no change is pending', async ({ dependencyGate }) => {
    dependencyGate([]);
    await expect(loa.toolbarButton('Cancel')).toBeDisabled();
    await expect(loa.toolbarButton('Save')).toBeDisabled();
  });

  test('TC-DSM-LOA-009: Toggling a location\'s Active flag dirties the form and Cancel discards it', async ({ dependencyGate }) => {
    dependencyGate([]);
    const atRest = await loa.readActiveCellState(LOA_TOGGLE_LOCATION);
    expect(atRest.mode).toBe('label');
    expect(['Yes', 'No']).toContain(atRest.label ?? '');
    const restingChecked = atRest.label === 'Yes' ? 'true' : 'false';
    try {
      // Entering edit mode: the label swaps to a checkbox mirroring the value — not yet a change.
      await loa.clickActiveLabel(LOA_TOGGLE_LOCATION);
      await expect.poll(async () => (await loa.readActiveCellState(LOA_TOGGLE_LOCATION)).mode).toBe('checkbox');
      expect((await loa.readActiveCellState(LOA_TOGGLE_LOCATION)).checked).toBe(restingChecked);
      expect(await loa.toolbarButton('Save').isDisabled()).toBe(true);
      // Flipping the value is the change: both toolbar actions open.
      await loa.clickActiveCheckbox(LOA_TOGGLE_LOCATION);
      await expect.poll(async () => (await loa.readActiveCellState(LOA_TOGGLE_LOCATION)).checked).not.toBe(restingChecked);
      expect(await loa.waitForLoaSave(true)).toBe(true);
      await expect(loa.toolbarButton('Cancel')).toBeEnabled();
    } finally {
      // Discard the pending edit — nothing in this test may reach the server.
      if (!(await loa.toolbarButton('Cancel').isDisabled())) {
        await loa.clickLoaCancel();
      }
    }
    // Cancel restores the label, the original value, and the closed toolbar.
    await expect.poll(async () => (await loa.readActiveCellState(LOA_TOGGLE_LOCATION)).mode).toBe('label');
    expect((await loa.readActiveCellState(LOA_TOGGLE_LOCATION)).label).toBe(atRest.label);
    expect(await loa.waitForLoaSave(false)).toBe(true);
  });

  test('TC-DSM-LOA-010: Searching filters the listing by location number', async ({ dependencyGate }) => {
    dependencyGate([]);
    // The search box honours input only once the tab's warm-up ends, roughly two minutes
    // after the tab renders — it is enabled well before it is functional, and earlier
    // typing is silently ignored with no feedback. The product owner accepted that window
    // as loading behaviour (2026-08-26), so this case retypes the query in bounded rounds
    // until the app responds, then asserts the steady-state filter contract.
    test.setTimeout(600_000);
    const fullTotal = await loa.readFooterTotal();
    let filtered = false;
    for (let round = 0; round < 8 && !filtered; round++) {
      await loa.typeSearch(LOA_SEARCH_NUMBER);
      await expect(loa.searchBox()).toHaveValue(LOA_SEARCH_NUMBER);
      filtered = await expect
        .poll(async () => loa.readFooterTotal(), { timeout: 30_000 })
        .toBeLessThan(fullTotal)
        .then(() => true)
        .catch(() => false);
      if (!filtered) await loa.clearSearch();
    }
    expect(filtered, 'the search must start filtering once the warm-up ends').toBe(true);
    const filteredNames = await loa.readLeadingLocations();
    expect(filteredNames.length).toBeGreaterThan(0);
    for (const name of filteredNames) {
      expect(name).toContain(LOA_SEARCH_NUMBER);
    }
    await loa.clearSearch();
    await expect.poll(async () => loa.readFooterTotal(), { timeout: 15_000 }).toBe(fullTotal);
  });
});
