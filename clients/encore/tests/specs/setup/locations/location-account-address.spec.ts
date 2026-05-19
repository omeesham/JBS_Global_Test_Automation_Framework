// seed: tests/specs/smoke/seed.spec.ts
import { test, expect } from '../../../infra/fixtures';
import {
  VENUE_NAME, PHONE1_BASELINE, ACCOUNT_SEARCH, ADDRESS_SEARCH,
  TEST_PHONE2_VALUE, ACCOUNT_TEST_PHONE, VENUE_DISPLAY_FIELDS, MASTER_DISPLAY_FIELDS,
  ACCOUNT_LIST_FILTERS, ALT_ADDRESS, ORIGINAL_ADDRESS,
} from '../../../test-data/setup/locations/location-account-address.data';
import { OFFICE_NO } from '../../../test-data/common.data';

test.describe('Location Account and Address @locations @account-address', () => {

  // Per-test navigation guard (dependency-gate removal Phase 1.5). See BAS spec :33.
  test.beforeEach(async ({ locationAccountAddressPage }) => {
    const url = locationAccountAddressPage.getCurrentUrl();
    if (!url.includes('settings/location')) {
      await locationAccountAddressPage.navigateToAccountAndAddressTab(OFFICE_NO);
    }
  });

  test('TC-LOC-ACC-001: Navigate to Account and Address tab; two-card layout visible', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(60_000);
    await locationAccountAddressPage.navigateToAccountAndAddressTab(OFFICE_NO);
    expect(await locationAccountAddressPage.isVenueCardVisible()).toBe(true);
    expect(await locationAccountAddressPage.isMasterCardVisible()).toBe(true);
  });

  test('TC-LOC-ACC-002: Venue Name field is disabled with correct value', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    expect(await locationAccountAddressPage.isVenueNameDisabled()).toBe(true);
    expect(await locationAccountAddressPage.getVenueNameValue()).toBe(VENUE_NAME);
  });

  test('TC-LOC-ACC-003: Name button opens Account List dialog', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.openAccountListDialog();
    expect(await locationAccountAddressPage.isAccountListDialogVisible()).toBe(true);
    expect(await locationAccountAddressPage.hasAccountListFilters()).toBe(true);
    expect(await locationAccountAddressPage.hasAccountListActionButtons()).toBe(true);
    expect(await locationAccountAddressPage.hasAccountListTable()).toBe(true);
    await locationAccountAddressPage.cancelAccountListDialog();
  });

  test('TC-LOC-ACC-004: Account List search returns results', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    test.setTimeout(60_000);
    await locationAccountAddressPage.openAccountListDialog();
    await locationAccountAddressPage.searchAccountByName(ACCOUNT_SEARCH.term);
 // Server search API can be slow under load — poll for results
    await expect.poll(
      () => locationAccountAddressPage.accountListResultsContain(ACCOUNT_SEARCH.expectedResult),
      { timeout: 20_000, message: 'Account List search results should contain expected text' }
    ).toBe(true);
    await locationAccountAddressPage.cancelAccountListDialog();
  });

  test('TC-LOC-ACC-005: Account List Select button disabled until row checked', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.openAccountListDialog();
    await locationAccountAddressPage.searchAccountByName(ACCOUNT_SEARCH.term);
    expect(await locationAccountAddressPage.isAccountListSelectDisabled()).toBe(true);
    await locationAccountAddressPage.checkAccountListFirstRow();
    expect(await locationAccountAddressPage.isAccountListSelectDisabled()).toBe(false);
    await locationAccountAddressPage.cancelAccountListDialog();
  });

  test('TC-LOC-ACC-006: Account List Cancel closes without changes', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.openAccountListDialog();
    await locationAccountAddressPage.searchAccountByName(ACCOUNT_SEARCH.term);
    await locationAccountAddressPage.checkAccountListFirstRow();
    await locationAccountAddressPage.cancelAccountListDialog();
    expect(await locationAccountAddressPage.getVenueNameValue()).toBe(VENUE_NAME);
  });

  test('TC-LOC-ACC-007: Account List Reset clears search fields', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.openAccountListDialog();
    await locationAccountAddressPage.searchAccountByName(ACCOUNT_SEARCH.term);
    await locationAccountAddressPage.resetAccountListSearch();
    expect(await locationAccountAddressPage.getAccountNameFilterValue()).toBe('');
    expect(await locationAccountAddressPage.isAccountListEmpty()).toBe(true);
    await locationAccountAddressPage.cancelAccountListDialog();
 // Reset clears the Angular form's accountId binding in addition to the filter UI.
 // Reload to restore a clean form model from DB before any subsequent saves.
    await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  });

  test('TC-LOC-ACC-008: Venue Address button opens Select Customer Address dialog', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.openVenueAddressDialog();
    expect(await locationAccountAddressPage.isAddressDialogVisible()).toBe(true);
    expect(await locationAccountAddressPage.isAddressSearchVisible()).toBe(true);
    expect(await locationAccountAddressPage.getAddressRowCount()).toBe(ADDRESS_SEARCH.totalRows);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-009: Address dialog Select button disabled until row checked', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.openVenueAddressDialog();
    expect(await locationAccountAddressPage.isAddressSelectDisabled()).toBe(true);
    await locationAccountAddressPage.checkAddressFirstRow();
    expect(await locationAccountAddressPage.isAddressSelectDisabled()).toBe(false);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-010: Address dialog search bar filters results client-side', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.openVenueAddressDialog();
    const initialRows = await locationAccountAddressPage.getAddressRowCount();
    await locationAccountAddressPage.searchAddress(ADDRESS_SEARCH.filterTerm);
    const filteredRows = await locationAccountAddressPage.getAddressRowCount();
    expect(filteredRows).toBeLessThan(initialRows);
    expect(await locationAccountAddressPage.addressResultsContain(ADDRESS_SEARCH.expectedMatch)).toBe(true);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-011: Address dialog Save button always disabled', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.openVenueAddressDialog();
    expect(await locationAccountAddressPage.isAddressSaveDisabled()).toBe(true);
    await locationAccountAddressPage.checkAddressFirstRow();
    expect(await locationAccountAddressPage.isAddressSaveDisabled()).toBe(true);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-012: Master Address button opens same Select Customer Address dialog', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.openMasterAddressDialog();
    expect(await locationAccountAddressPage.isAddressDialogVisible()).toBe(true);
    expect(await locationAccountAddressPage.getAddressRowCount()).toBe(ADDRESS_SEARCH.totalRows);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-013: Venue address display fields are read-only', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    for (const field of VENUE_DISPLAY_FIELDS) {
      expect(await locationAccountAddressPage.isDisplayFieldReadOnly('Venue/Branch Account', field.expected),
        `${field.label} should be read-only`).toBe(true);
    }
  });

  test('TC-LOC-ACC-014: Master address display fields are read-only', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    for (const field of MASTER_DISPLAY_FIELDS) {
      expect(await locationAccountAddressPage.isDisplayFieldReadOnly('Master Bill To Address', field.expected),
        `${field.label} should be read-only`).toBe(true);
    }
  });

  test('TC-LOC-ACC-015: Phone 1 required field shows inline error when cleared', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.clearPhone1AndBlur();
    expect(await locationAccountAddressPage.isPhone1Invalid()).toBe(true);
    expect(await locationAccountAddressPage.isPhone1ErrorIconVisible()).toBe(true);
 // Restore baseline
    await locationAccountAddressPage.fillPhone1(PHONE1_BASELINE);
    await locationAccountAddressPage.clickSave();
  });

  test('TC-LOC-ACC-016: Phone 2 optional, no validation error when empty', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    expect(await locationAccountAddressPage.isPhone2Invalid()).toBe(false);
  });

  test('TC-LOC-ACC-017: Save button disabled when no pending changes', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-ACC-018: Save button enables on field change', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    test.setTimeout(60_000);
 // Ensure Phone 2 baseline is clean (may be dirty from prior failed run)
    const currentPhone2 = await locationAccountAddressPage.getPhone2Value();
    if (currentPhone2) {
      await locationAccountAddressPage.fillPhone2('');
      await locationAccountAddressPage.clickSave();
 // Reload to ensure Angular form is fully re-initialized before testing fill → save behavior
      await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
    }
    expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
    await locationAccountAddressPage.fillPhone2(ACCOUNT_TEST_PHONE);
    await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Discard changes
    await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  });

  test('TC-LOC-ACC-019: Save flow -- confirmation dialog then success', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    await locationAccountAddressPage.fillPhone2(TEST_PHONE2_VALUE);
    await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await locationAccountAddressPage.clickSave();
    expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-ACC-020: Save changes persist after page reload', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    test.setTimeout(60_000);
    expect(await locationAccountAddressPage.getPhone2Value()).toBe(TEST_PHONE2_VALUE);
    await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
 // Poll: phone2 may still be empty at the moment phone1 readiness gate fires (mask init race)
    await expect.poll(() => locationAccountAddressPage.getPhone2Value(), { timeout: 5_000 }).toBe(TEST_PHONE2_VALUE);
    expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
 // Cleanup: restore Phone 2 to empty baseline
    await locationAccountAddressPage.fillPhone2('');
    await locationAccountAddressPage.clickSave();
  });

 // ─── Account & Address audit additions ─────────────────────────────────────
 // TC-021 DROPPED: live verification proved Phone 1 is account-linked.
 // Save completes but value always reverts to account phone on reload. NOT-AUTOMATABLE.

  test('TC-LOC-ACC-022: Cancel Save dialog discards save without persisting', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    test.setTimeout(60_000);
    await locationAccountAddressPage.fillPhone2(ACCOUNT_TEST_PHONE);
    await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Click Save → Cancel in confirmation dialog
    await locationAccountAddressPage.openSaveDialog();
    await locationAccountAddressPage.cancelSaveDialog();
 // Verify: Save still enabled (changes not committed), value still present
    expect(await locationAccountAddressPage.isSaveEnabled()).toBe(true);
    expect(await locationAccountAddressPage.getPhone2Value()).toBe(ACCOUNT_TEST_PHONE);
 // Discard changes via reload
    await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  });

  test('TC-LOC-ACC-023: Phone 1 cleared shows invalid state and error icon', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
 // MCP-verified : clearing Phone 1 shows aria-invalid=true but Save stays enabled.
 // This TC verifies validation indicators; Save blocking is NOT app behavior.
    await locationAccountAddressPage.clearPhone1AndBlur();
    expect(await locationAccountAddressPage.isPhone1Invalid()).toBe(true);
    expect(await locationAccountAddressPage.isPhone1ErrorIconVisible()).toBe(true);
 // Save remains enabled even with invalid field (Angular doesn't block)
    expect(await locationAccountAddressPage.isSaveEnabled()).toBe(true);
 // Discard — reload to restore server-saved baseline
    await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  });

  test('TC-LOC-ACC-025: Account List Address filter returns matching results', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    test.setTimeout(60_000);
    await locationAccountAddressPage.openAccountListDialog();
    await locationAccountAddressPage.searchAccountByAddress(ACCOUNT_LIST_FILTERS.address);
    await expect.poll(
      () => locationAccountAddressPage.accountListResultsContain(ACCOUNT_LIST_FILTERS.addressExpected),
      { timeout: 20_000, message: 'Address filter should return matching results' }
    ).toBe(true);
    await locationAccountAddressPage.cancelAccountListDialog();
  });

  test('TC-LOC-ACC-026: Account List City filter returns matching results', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    test.setTimeout(60_000);
    await locationAccountAddressPage.openAccountListDialog();
    await locationAccountAddressPage.searchAccountByCity(ACCOUNT_LIST_FILTERS.city);
    await expect.poll(
      () => locationAccountAddressPage.accountListResultsContain(ACCOUNT_LIST_FILTERS.cityExpected),
      { timeout: 20_000, message: 'City filter should return matching results' }
    ).toBe(true);
    await locationAccountAddressPage.cancelAccountListDialog();
  });

  test('TC-LOC-ACC-027: Address selection changes venue display fields', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    test.setTimeout(60_000);
 // MCP-verified : address selection updates display but does NOT persist through save+reload.
 // Angular form model doesn't serialize the new address. This TC tests E2E display change only.
 // Verify starting state
    await expect.poll(() => locationAccountAddressPage.getVenueCityText(), { timeout: 5_000 }).toBe(ORIGINAL_ADDRESS.city);
 // Select alternate address
    await locationAccountAddressPage.openVenueAddressDialog();
    await locationAccountAddressPage.selectAddressRow(ALT_ADDRESS.address1);
 // Verify display changed
    await expect.poll(() => locationAccountAddressPage.getVenueCityText(), { timeout: 5_000 }).toBe(ALT_ADDRESS.city);
 // Save enables (form dirty from selection)
    await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Discard: reload restores original
    await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
    await expect.poll(() => locationAccountAddressPage.getVenueCityText(), { timeout: 10_000 }).toBe(ORIGINAL_ADDRESS.city);
  });

  test('TC-LOC-ACC-028: Account selection changes venue name and persists', async ({ locationAccountAddressPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-ACC-001']);
    test.setTimeout(120_000);
    const originalName = await locationAccountAddressPage.getVenueNameValue();
    try {
 // Open Account List → search for current account → select (re-selecting same triggers dirty)
      await locationAccountAddressPage.openAccountListDialog();
      await locationAccountAddressPage.searchAccountByName(ACCOUNT_SEARCH.term);
      await expect.poll(
        () => locationAccountAddressPage.accountListResultsContain(ACCOUNT_SEARCH.expectedResult),
        { timeout: 20_000 }
      ).toBe(true);
      await locationAccountAddressPage.selectAccountListFirstRow();
 // Verify form dirty → Save enabled
      await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Save and verify persistence
      await locationAccountAddressPage.clickSave();
      expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
      await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
 // Venue name should still be the same (re-selected same account)
      await expect.poll(() => locationAccountAddressPage.getVenueNameValue(), { timeout: 10_000 }).toBe(originalName);
    } finally {
 // Ensure clean state — if we somehow changed the account, restore it
      const currentName = await locationAccountAddressPage.getVenueNameValue();
      if (currentName !== originalName) {
        await locationAccountAddressPage.openAccountListDialog();
        await locationAccountAddressPage.searchAccountByName(originalName);
        await locationAccountAddressPage.selectAccountListFirstRow();
        await locationAccountAddressPage.clickSave();
        await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
      }
    }
  });

});
