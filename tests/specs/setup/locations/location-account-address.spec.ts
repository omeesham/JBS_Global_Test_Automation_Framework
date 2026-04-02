// spec: specs_planning/test-plans/locations/locations_account_address_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../setup/fixtures';
import {
  VENUE_NAME, PHONE1_BASELINE, ACCOUNT_SEARCH, ADDRESS_SEARCH,
  TEST_PHONE2_VALUE, ACCOUNT_TEST_PHONE, VENUE_DISPLAY_FIELDS, MASTER_DISPLAY_FIELDS,
} from '../../../test-data/setup/locations/location-account-address.data';
import { OFFICE_NO } from '../../../test-data/common.data';

test.describe.serial('Location Account and Address @locations @account-address', () => {

  test('TC-LOC-ACC-001: Navigate to Account and Address tab; two-card layout visible', async ({ locationAccountAddressPage }) => {
    test.setTimeout(60_000);
    await locationAccountAddressPage.navigateToAccountAndAddressTab(OFFICE_NO);
    expect(await locationAccountAddressPage.isVenueCardVisible()).toBe(true);
    expect(await locationAccountAddressPage.isMasterCardVisible()).toBe(true);
  });

  test('TC-LOC-ACC-002: Venue Name field is disabled with correct value', async ({ locationAccountAddressPage }) => {
    expect(await locationAccountAddressPage.isVenueNameDisabled()).toBe(true);
    expect(await locationAccountAddressPage.getVenueNameValue()).toBe(VENUE_NAME);
  });

  test('TC-LOC-ACC-003: Name button opens Account List dialog', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.openAccountListDialog();
    expect(await locationAccountAddressPage.isAccountListDialogVisible()).toBe(true);
    expect(await locationAccountAddressPage.hasAccountListFilters()).toBe(true);
    expect(await locationAccountAddressPage.hasAccountListActionButtons()).toBe(true);
    expect(await locationAccountAddressPage.hasAccountListTable()).toBe(true);
    await locationAccountAddressPage.cancelAccountListDialog();
  });

  test('TC-LOC-ACC-004: Account List search returns results', async ({ locationAccountAddressPage }) => {
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

  test('TC-LOC-ACC-005: Account List Select button disabled until row checked', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.openAccountListDialog();
    await locationAccountAddressPage.searchAccountByName(ACCOUNT_SEARCH.term);
    expect(await locationAccountAddressPage.isAccountListSelectDisabled()).toBe(true);
    await locationAccountAddressPage.checkAccountListFirstRow();
    expect(await locationAccountAddressPage.isAccountListSelectDisabled()).toBe(false);
    await locationAccountAddressPage.cancelAccountListDialog();
  });

  test('TC-LOC-ACC-006: Account List Cancel closes without changes', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.openAccountListDialog();
    await locationAccountAddressPage.searchAccountByName(ACCOUNT_SEARCH.term);
    await locationAccountAddressPage.checkAccountListFirstRow();
    await locationAccountAddressPage.cancelAccountListDialog();
    expect(await locationAccountAddressPage.getVenueNameValue()).toBe(VENUE_NAME);
  });

  test('TC-LOC-ACC-007: Account List Reset clears search fields', async ({ locationAccountAddressPage }) => {
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

  test('TC-LOC-ACC-008: Venue Address button opens Select Customer Address dialog', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.openVenueAddressDialog();
    expect(await locationAccountAddressPage.isAddressDialogVisible()).toBe(true);
    expect(await locationAccountAddressPage.isAddressSearchVisible()).toBe(true);
    expect(await locationAccountAddressPage.getAddressRowCount()).toBe(ADDRESS_SEARCH.totalRows);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-009: Address dialog Select button disabled until row checked', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.openVenueAddressDialog();
    expect(await locationAccountAddressPage.isAddressSelectDisabled()).toBe(true);
    await locationAccountAddressPage.checkAddressFirstRow();
    expect(await locationAccountAddressPage.isAddressSelectDisabled()).toBe(false);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-010: Address dialog search bar filters results client-side', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.openVenueAddressDialog();
    const initialRows = await locationAccountAddressPage.getAddressRowCount();
    await locationAccountAddressPage.searchAddress(ADDRESS_SEARCH.filterTerm);
    const filteredRows = await locationAccountAddressPage.getAddressRowCount();
    expect(filteredRows).toBeLessThan(initialRows);
    expect(await locationAccountAddressPage.addressResultsContain(ADDRESS_SEARCH.expectedMatch)).toBe(true);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-011: Address dialog Save button always disabled', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.openVenueAddressDialog();
    expect(await locationAccountAddressPage.isAddressSaveDisabled()).toBe(true);
    await locationAccountAddressPage.checkAddressFirstRow();
    expect(await locationAccountAddressPage.isAddressSaveDisabled()).toBe(true);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-012: Master Address button opens same Select Customer Address dialog', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.openMasterAddressDialog();
    expect(await locationAccountAddressPage.isAddressDialogVisible()).toBe(true);
    expect(await locationAccountAddressPage.getAddressRowCount()).toBe(ADDRESS_SEARCH.totalRows);
    await locationAccountAddressPage.cancelAddressDialog();
  });

  test('TC-LOC-ACC-013: Venue address display fields are read-only', async ({ locationAccountAddressPage }) => {
    for (const field of VENUE_DISPLAY_FIELDS) {
      expect(await locationAccountAddressPage.isDisplayFieldReadOnly('Venue/Branch Account', field.expected),
        `${field.label} should be read-only`).toBe(true);
    }
  });

  test('TC-LOC-ACC-014: Master address display fields are read-only', async ({ locationAccountAddressPage }) => {
    for (const field of MASTER_DISPLAY_FIELDS) {
      expect(await locationAccountAddressPage.isDisplayFieldReadOnly('Master Bill To Address', field.expected),
        `${field.label} should be read-only`).toBe(true);
    }
  });

  test('TC-LOC-ACC-015: Phone 1 required field shows inline error when cleared', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.clearPhone1AndBlur();
    expect(await locationAccountAddressPage.isPhone1Invalid()).toBe(true);
    expect(await locationAccountAddressPage.isPhone1ErrorIconVisible()).toBe(true);
    // Restore baseline
    await locationAccountAddressPage.fillPhone1(PHONE1_BASELINE);
    await locationAccountAddressPage.clickSave();
  });

  test('TC-LOC-ACC-016: Phone 2 optional, no validation error when empty', async ({ locationAccountAddressPage }) => {
    expect(await locationAccountAddressPage.isPhone2Invalid()).toBe(false);
  });

  test('TC-LOC-ACC-017: Save button disabled when no pending changes', async ({ locationAccountAddressPage }) => {
    expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-ACC-018: Save button enables on field change', async ({ locationAccountAddressPage }) => {
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

  test('TC-LOC-ACC-019: Save flow -- confirmation dialog then success', async ({ locationAccountAddressPage }) => {
    await locationAccountAddressPage.fillPhone2(TEST_PHONE2_VALUE);
    await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await locationAccountAddressPage.clickSave();
    expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-ACC-020: Save changes persist after page reload', async ({ locationAccountAddressPage }) => {
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

});
