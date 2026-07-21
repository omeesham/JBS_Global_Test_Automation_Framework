# Reviewer walk evidence - CHIP testid adoption - 2026-07-10

Reviewer: council-reviewer / GPT-5.5
Target office: 1604
Run mode: fresh headless Chromium using `clients/encore/.auth/encore-state.json`
Base URL: `https://cloudapps-e2e.encoreglobal.com/navigator`

## Selector diff reviewed

`git --no-pager diff --stat clients/encore/src/selectors/` showed only:
- `clients/encore/src/selectors/local-office/local-office-settings.ts`
- `clients/encore/src/selectors/locations/auto-addon.ts`
- `clients/encore/src/selectors/locations/notes.ts`
- `clients/encore/src/selectors/locations/shared-setup-locations.ts`

`clients/encore/src/selectors/locations/shared.ts` `dlgSaveChanges` had no diff.

## Live DOM per-control dump

1. `SetupNotesSelectors.tblNotes` - selector `[data-testid="location-settings-table-notes"]`
   - count: `1`
   - tag: `TABLE`
   - role: `null`
   - data-testid: `location-settings-table-notes`
   - text: `No Notes Available`
   - verdict: `CONFIRMED-present`

2. `LocalOfficeSettingsSelectors.dlgSaveChanges` - selector `[data-testid="location-settings-modal-save-changes"]`
   - trigger: changed Prep Date Offset `-1 -> -2`, clicked Save, then Cancel
   - count: `1`
   - tag: `DIV`
   - role: `alertdialog`
   - data-testid: `location-settings-modal-save-changes`
   - text: `Save Changes Are you sure you want to save the changes? Cancel Save`
   - verdict: `CONFIRMED-present`

3. `LocalOfficeSettingsSelectors.dlgUnsavedLocalOffice` - selector `[data-testid="location-settings-modal-unsaved-changes"]`
   - trigger: changed Prep Date Offset `-1 -> -3`, clicked Location Settings History tab
   - count: `1`
   - tag: `DIV`
   - role: `alertdialog`
   - data-testid: `location-settings-modal-unsaved-changes`
   - text: `Unsaved changes Are you sure you want to leave this view? Any unsaved changes will be lost. Stay Discard`
   - verdict: `CONFIRMED-present`

4. `SetupAutoAddonSelectors.autoAddonDlgUnsavedChanges` - selector `[data-testid="location-settings-modal-unsaved-changes"]`
   - trigger: toggled Encore Music, clicked Home
   - count: `1`
   - tag: `DIV`
   - role: `alertdialog`
   - data-testid: `location-settings-modal-unsaved-changes`
   - text: `Unsaved changes Are you sure you want to leave this view? Any unsaved changes will be lost. Stay Discard`
   - inner unchanged selector counts:
     - `[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Stay")`: `1`
     - `[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Discard")`: `1`
   - verdict: `CONFIRMED-container-present-buttons-still-role-text`

5. `SetupSharedSetupLocationsSelectors.btnSharedAdd` - selector `[data-testid="location-settings-table-shared-setup"] tbody tr:last-child button`
   - initial table: `tbodyRows=2`, `dataRowsBeforeAddRow=1`, add button row index `1`, add button data-testid `location-settings-btn-add-shared-location-1`
   - after unsaved add of office `1606`: `tbodyRows=3`, `dataRowsBeforeAddRow=2`, add button row index `2`, add button data-testid `location-settings-btn-add-shared-location-2`
   - after unsaved add of office `1101`: `tbodyRows=4`, `dataRowsBeforeAddRow=3`, add button row index `3`, add button data-testid `location-settings-btn-add-shared-location-3`
   - verdict: `CONFIRMED-unstable-so-positional-correct`

## Spec and typecheck summary

- `npx playwright test --config=playwright.config.ts --project=encore-locations location-notes.spec.ts location-auto-addon.spec.ts location-shared-setup-locations.spec.ts`
  - first run: `2 failed`, `1 flaky`, `10 skipped`, `109 passed (18.2m)`
  - failures were Shared Setup baseline-data drift: self Shares Inventory was already checked; not a selector/testid failure.
  - reset via UI: self Shares Inventory `true -> false`, saved, reloaded.
- `npx playwright test --config=playwright.config.ts --project=encore-locations location-shared-setup-locations.spec.ts`
  - rerun: `9 skipped`, `36 passed (4.4m)`
- `npx playwright test --config=playwright.config.ts --project=encore-local-office local-office-settings.spec.ts local-office-ect.spec.ts local-office-history.spec.ts`
  - `1 skipped`, `83 passed (5.2m)`
- `npx tsc --noEmit`
  - exit code `0`

## Discrepancies and verdict

- Discrepancy: initial Shared Setup batch failed because live baseline data had self Shares Inventory checked; a UI reset restored the expected baseline and the affected Shared Setup spec passed on rerun.
- Status deviation: `_internal` already had pre-existing dirty files before this evidence file was created, and `specs_planning/` is gitignored; this evidence file was marked intent-to-add so the requested status command can see it.
- No selector adoption discrepancies found.
- `VERDICT: GREEN`
