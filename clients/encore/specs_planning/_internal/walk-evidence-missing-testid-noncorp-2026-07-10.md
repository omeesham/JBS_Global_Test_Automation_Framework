---
title: Walk Evidence — Locations + Local Office missing data-testid, 2026-07-10
date: 2026-07-10
ticket: TICKET-NONCORP-MISSING-TESTID-20260710
method: LR-029 — live DOM dump via playwright-cli, headless Chromium, office 1604, storageState .auth/encore-state.json
script: TEMP_DUMP_NONCORP_20260710.cjs (deleted after run per CLEANUP duty)
---

# Walk Evidence — Locations + Local Office Missing data-testid (2026-07-10)

## 1. Method

Single-pass Playwright script: auth once via storageState, navigate to all surfaces in order, dump ALL `data-testid` values (incl. shadow root pierce) per surface. Best-effort dialog triggers (dirty field → click Save; dirty field → navigate away). All surfaces reached successfully; no ERROR entries in dump JSON.

## 2. Raw testid counts per surface

| Surface label | testid count |
|---|---:|
| LOC_basic_information | 92 |
| LOC_local_information | 92 |
| LOC_currency | 50 |
| LOC_pricing | 53 |
| LOC_auto_addon | 42 |
| LOC_legal | 42 |
| LOC_notes | 41 |
| LOC_shared_setup_locations | 46 |
| LOC_account_address | 44 |
| LOC_history | 8 |
| LOC_dialog_save_changes | 92 |
| LOC_dialog_unsaved_changes | 93 |
| LOC_dialog_pay_to_list | 92 |
| LOC_dialog_account_list | 55 |
| LOC_dialog_select_address | 44 |
| LOC_dialog_change_local_office | 50 |
| LOC_dialog_auto_addon_save_changes | 42 |
| LOC_dialog_auto_addon_unsaved_changes | 43 |
| LO_settings_basic | 69 |
| LO_ect_settings | 112 |
| LO_history | 11 |
| LO_dialog_save_changes | 70 |
| LO_dialog_unsaved_changes | 70 |

## 3. Key dialog deltas (new testids added when dialog is open vs base surface)

| Dialog surface | Delta testids (vs base page) | Interpretation |
|---|---|---|
| LOC_dialog_save_changes | (none — 0 new) | LOC Save Changes dialog has NO data-testid |
| LOC_dialog_unsaved_changes | `location-settings-modal-unsaved-changes` | Already in our shared.ts as bare testid; inner buttons have no testids |
| LOC_dialog_pay_to_list | (none — 0 new) | Pay To List dialog has NO data-testid (all role/text fallbacks confirmed missing) |
| LOC_dialog_account_list | `location-settings-modal-account-list`, `...input-account-number/name/address/city`, `...select-account-state/country`, `...btn-search/reset/select/cancel-account-search` | These already have testids in our selectors; Close btn + row checkboxes + table still missing |
| LOC_dialog_select_address | (none — 0 new) | Select Customer Address dialog has NO data-testid |
| LOC_dialog_change_local_office | `location-settings-modal-change-local-office`, `...input-search`, `...btn-select`, `...btn-cancel` | Already in shared-setup-locations.ts; h2, table, Close btn still missing |
| LOC_dialog_auto_addon_save_changes | (none — 0 new) | Auto Add-On Save Changes dialog has NO data-testid |
| LOC_dialog_auto_addon_unsaved_changes | `location-settings-modal-unsaved-changes` | Dialog container now has testid (DROP for autoAddonDlgUnsavedChanges); inner buttons still missing |
| LO_dialog_save_changes | `location-settings-modal-save-changes` | LO Save Changes dialog container NOW has testid (DROP for dlgSaveChanges in LO); inner buttons still missing |
| LO_dialog_unsaved_changes | `location-settings-modal-unsaved-changes` | LO Unsaved dialog container NOW has testid (DROP for dlgUnsavedLocalOffice in LO); inner buttons still missing |

## 4. DROPS (controls that now have a data-testid — NOT in workbook)

| Selector key | Now-present testid | Evidence surface |
|---|---|---|
| tblNotes (notes.ts) | `location-settings-table-notes` | LOC_notes |
| btnSharedAdd (shared-setup-locations.ts) | `location-settings-btn-add-shared-location-1` | LOC_shared_setup_locations |
| dlgSaveChanges (local-office-settings.ts) | `location-settings-modal-save-changes` | LO_dialog_save_changes |
| dlgUnsavedLocalOffice (local-office-settings.ts) | `location-settings-modal-unsaved-changes` | LO_dialog_unsaved_changes |
| autoAddonDlgUnsavedChanges (auto-addon.ts) | `location-settings-modal-unsaved-changes` | LOC_dialog_auto_addon_unsaved_changes |

## 5. CONFIRMED-MISSING — Locations module (workbook rows, with live-DOM backing)

Each row below corresponds 1:1 to a workbook row in `LOCATIONS_MISSING_TESTID`.

| # | Sub Module | Element | Evidence: surface dumped + no testid found |
|---|---|---|---|
| 1 | Error Dialog | dialog "Error" container (alertdialog) | LOC_dialog_save_changes (dialog triggered; 0 new testids; comment confirms no testid on error alertdialog) |
| 2 | Error Dialog | label "Error Message" body text (p) | LOC_dialog_save_changes (dialog triggered; 0 new testids; comment confirms no testid on error alertdialog) |
| 3 | Error Dialog | button "Ok" dismiss | LOC_dialog_save_changes (dialog triggered; 0 new testids; comment confirms no testid on error alertdialog) |
| 4 | Save Changes Dialog | dialog "Save Changes" container (alertdialog) | LOC_dialog_save_changes (92 testids = base; 0 new; comment confirms no dialog container testid) |
| 5 | Save Changes Dialog | button "Cancel" | LOC_dialog_save_changes (92 testids = base; 0 new; comment confirms no dialog container testid) |
| 6 | Save Changes Dialog | button "Ok" confirm save | LOC_dialog_save_changes (92 testids = base; 0 new; comment confirms no dialog container testid) |
| 7 | Save Changes Dialog | paragraph confirmation message text | LOC_dialog_save_changes (92 testids = base; 0 new; comment confirms no dialog container testid) |
| 8 | Unsaved Changes Dialog | button "Discard" (leave / affirm navigate-away) | LOC_dialog_unsaved_changes (delta = only location-settings-modal-unsaved-changes; inner Discard/Stay buttons have no testid) |
| 9 | Unsaved Changes Dialog | button "Stay" (cancel-leave / keep on page) | LOC_dialog_unsaved_changes (delta = only location-settings-modal-unsaved-changes; inner Discard/Stay buttons have no testid) |
| 10 | Auto Add-On | button "Ok" in Auto Add-On Save Changes dialog | LOC_dialog_auto_addon_save_changes / LOC_dialog_auto_addon_unsaved_changes (0/1 delta; buttons inside have no testid) |
| 11 | Auto Add-On | button "Stay" in Auto Add-On Unsaved Changes dialog | LOC_dialog_auto_addon_save_changes / LOC_dialog_auto_addon_unsaved_changes (0/1 delta; buttons inside have no testid) |
| 12 | Auto Add-On | button "Discard" in Auto Add-On Unsaved Changes dialog | LOC_dialog_auto_addon_save_changes / LOC_dialog_auto_addon_unsaved_changes (0/1 delta; buttons inside have no testid) |
| 13 | Basic Information | combobox "Line Of Business" (disabled, label-anchored) | LOC_basic_information (92 testids; no live-date / tax-mode / line-of-business / pay-to-label testid present) |
| 14 | Basic Information | button "Live Date" datepicker (label-anchored) | LOC_basic_information (92 testids; no live-date / tax-mode / line-of-business / pay-to-label testid present) |
| 15 | Basic Information | combobox "Tax Mode" (label-anchored) | LOC_basic_information (92 testids; no live-date / tax-mode / line-of-business / pay-to-label testid present) |
| 16 | Basic Information | label "Pay To Address" launcher (opens Pay To List dialog) | LOC_basic_information (92 testids; no live-date / tax-mode / line-of-business / pay-to-label testid present) |
| 17 | Pay To List Dialog | dialog "Pay To List" container | LOC_dialog_pay_to_list (92 testids = base; 0 new; no Pay To List dialog testids) |
| 18 | Pay To List Dialog | button "Search" submit filters | LOC_dialog_pay_to_list (92 testids = base; 0 new; no Pay To List dialog testids) |
| 19 | Pay To List Dialog | button "Reset" clear filters | LOC_dialog_pay_to_list (92 testids = base; 0 new; no Pay To List dialog testids) |
| 20 | Pay To List Dialog | button "Select" confirm row choice (disabled until row checked) | LOC_dialog_pay_to_list (92 testids = base; 0 new; no Pay To List dialog testids) |
| 21 | Pay To List Dialog | button "Cancel" close without selection | LOC_dialog_pay_to_list (92 testids = base; 0 new; no Pay To List dialog testids) |
| 22 | Pay To List Dialog | button "Close" X dismiss | LOC_dialog_pay_to_list (92 testids = base; 0 new; no Pay To List dialog testids) |
| 23 | Pay To List Dialog | table "Results" Pay To rows | LOC_dialog_pay_to_list (92 testids = base; 0 new; no Pay To List dialog testids) |
| 24 | Pay To List Dialog | checkbox "Select row" first-row radio-style checkbox | LOC_dialog_pay_to_list (92 testids = base; 0 new; no Pay To List dialog testids) |
| 25 | Local Information | toast "Local information updated" success notification | LOC_local_information (92 testids; no toast / error-p / radio-button / hri-checkbox testid) |
| 26 | Local Information | validation error "Number must be" boundary message | LOC_local_information (92 testids; no toast / error-p / radio-button / hri-checkbox testid) |
| 27 | Local Information | validation error "greater than or equal to 0" (min boundary) | LOC_local_information (92 testids; no toast / error-p / radio-button / hri-checkbox testid) |
| 28 | Local Information | validation error "less than or equal to 100" (max boundary) | LOC_local_information (92 testids; no toast / error-p / radio-button / hri-checkbox testid) |
| 29 | Local Information | radio "Master" in Billing Type radio group | LOC_local_information (92 testids; no toast / error-p / radio-button / hri-checkbox testid) |
| 30 | Local Information | radio "Direct" in Billing Type radio group | LOC_local_information (92 testids; no toast / error-p / radio-button / hri-checkbox testid) |
| 31 | Local Information | radio "Event" in Billing Way radio group | LOC_local_information (92 testids; no toast / error-p / radio-button / hri-checkbox testid) |
| 32 | Local Information | radio "Daily" in Billing Way radio group | LOC_local_information (92 testids; no toast / error-p / radio-button / hri-checkbox testid) |
| 33 | Local Information | checkbox "HRI Remit Tax 2" (label-anchored via dt+dd) | LOC_local_information (92 testids; no toast / error-p / radio-button / hri-checkbox testid) |
| 34 | Notes | cell "No Notes Available" empty-state table cell | LOC_notes (41 testids; no textarea / delete-btn / no-notes-cell testid; tblNotes is DROP) |
| 35 | Notes | textarea "Type notes here..." row 0 (name-anchored) | LOC_notes (41 testids; no textarea / delete-btn / no-notes-cell testid; tblNotes is DROP) |
| 36 | Notes | textarea "Type notes here..." generic all-rows accessor | LOC_notes (41 testids; no textarea / delete-btn / no-notes-cell testid; tblNotes is DROP) |
| 37 | Notes | button "Delete" note row | LOC_notes (41 testids; no textarea / delete-btn / no-notes-cell testid; tblNotes is DROP) |
| 38 | History | combobox "Rows per page" pagination selector | LOC_history (8 testids; no pagination button / rows-per-page testid) |
| 39 | History | button "Go to first page" pagination | LOC_history (8 testids; no pagination button / rows-per-page testid) |
| 40 | History | button "Go to previous page" pagination | LOC_history (8 testids; no pagination button / rows-per-page testid) |
| 41 | History | button "Go to next page" pagination | LOC_history (8 testids; no pagination button / rows-per-page testid) |
| 42 | History | button "Go to last page" pagination | LOC_history (8 testids; no pagination button / rows-per-page testid) |
| 43 | Currency | text "No Matches Found" merchant dropdown empty state | LOC_currency (50 testids; no listbox/no-matches testid) |
| 44 | Account List Dialog | button "Close" X dismiss | LOC_dialog_account_list (55 testids; no close-btn / row-checkbox / table testid in dialog) |
| 45 | Account List Dialog | checkbox "Select row" first-row radio-style checkbox | LOC_dialog_account_list (55 testids; no close-btn / row-checkbox / table testid in dialog) |
| 46 | Account List Dialog | table "Results" account rows | LOC_dialog_account_list (55 testids; no close-btn / row-checkbox / table testid in dialog) |
| 47 | Select Customer Address Dialog | dialog "Select Customer Address" container | LOC_dialog_select_address (44 testids = account_address base; 0 new; no Select Customer Address dialog testids) |
| 48 | Select Customer Address Dialog | input "Search..." client-side filter | LOC_dialog_select_address (44 testids = account_address base; 0 new; no Select Customer Address dialog testids) |
| 49 | Select Customer Address Dialog | button "Select" confirm address choice | LOC_dialog_select_address (44 testids = account_address base; 0 new; no Select Customer Address dialog testids) |
| 50 | Select Customer Address Dialog | button "Cancel" | LOC_dialog_select_address (44 testids = account_address base; 0 new; no Select Customer Address dialog testids) |
| 51 | Select Customer Address Dialog | button "Save" (disabled — always) | LOC_dialog_select_address (44 testids = account_address base; 0 new; no Select Customer Address dialog testids) |
| 52 | Select Customer Address Dialog | button "Close" X dismiss | LOC_dialog_select_address (44 testids = account_address base; 0 new; no Select Customer Address dialog testids) |
| 53 | Select Customer Address Dialog | checkbox "Select row" first-row radio-style checkbox | LOC_dialog_select_address (44 testids = account_address base; 0 new; no Select Customer Address dialog testids) |
| 54 | Select Customer Address Dialog | table "Results" address rows | LOC_dialog_select_address (44 testids = account_address base; 0 new; no Select Customer Address dialog testids) |
| 55 | Select Customer Address Dialog | text "Total Addresses:" footer count | LOC_dialog_select_address (44 testids = account_address base; 0 new; no Select Customer Address dialog testids) |
| 56 | Change Local Office Dialog | heading h2 "Change Local Office" (no testid on h2) | LOC_dialog_change_local_office (50 testids; delta has 4 testids; no h2/table/close-btn testid in dialog) |
| 57 | Change Local Office Dialog | table "Location results" search results grid | LOC_dialog_change_local_office (50 testids; delta has 4 testids; no h2/table/close-btn testid in dialog) |
| 58 | Change Local Office Dialog | button "Close" X last-button fallback | LOC_dialog_change_local_office (50 testids; delta has 4 testids; no h2/table/close-btn testid in dialog) |
| 59 | Pricing | row "{pricebook name}" in Secondary Pricing grid (text-scoped) | LOC_pricing (53 testids; grid has table+column headers but no row-level or cell-level testids) |
| 60 | Pricing | checkbox "Is Alternative" in Secondary Pricing grid row (positional) | LOC_pricing (53 testids; grid has table+column headers but no row-level or cell-level testids) |
| 61 | Pricing | checkbox "Use Effective Dates" in Secondary Pricing grid row (positional) | LOC_pricing (53 testids; grid has table+column headers but no row-level or cell-level testids) |
| 62 | Pricing | input "Start Date" in Secondary Pricing grid row (positional) | LOC_pricing (53 testids; grid has table+column headers but no row-level or cell-level testids) |
| 63 | Pricing | input "End Date" in Secondary Pricing grid row (positional) | LOC_pricing (53 testids; grid has table+column headers but no row-level or cell-level testids) |
| 64 | Pricing | option "{currency}" in currency filter listbox (text-scoped) | LOC_pricing (53 testids; grid has table+column headers but no row-level or cell-level testids) |

## 6. CONFIRMED-MISSING — Local Office module (workbook rows, with live-DOM backing)

Each row below corresponds 1:1 to a workbook row in `LOCAL_OFFICE_MISSING_TESTID`.

| # | Sub Module | Element | Evidence: surface dumped + no testid found |
|---|---|---|---|
| 1 | Save Changes Dialog | button "Save" confirm (no testid on button; dialog container has location-settings-modal-save-changes) | LO_dialog_save_changes (70 testids = base 69 + 1 new = location-settings-modal-save-changes; inner Save/Cancel buttons have NO testid) |
| 2 | Save Changes Dialog | button "Cancel" (no testid on button) | LO_dialog_save_changes (70 testids = base 69 + 1 new = location-settings-modal-save-changes; inner Save/Cancel buttons have NO testid) |
| 3 | Unsaved Changes Dialog | button "Stay" cancel-leave (no testid on button) | LO_dialog_unsaved_changes (70 testids = base 69 + 1 new = location-settings-modal-unsaved-changes; inner Stay/Discard buttons have NO testid) |
| 4 | Unsaved Changes Dialog | button "Discard" leave-confirm (no testid on button) | LO_dialog_unsaved_changes (70 testids = base 69 + 1 new = location-settings-modal-unsaved-changes; inner Stay/Discard buttons have NO testid) |

## 7. UNVERIFIED (excluded from workbook — surface not in scope of this run)

- **lnkOfficeCode (dynamic.ts)**: Location Search Results page (/navigator/locations) — not a settings surface; outside the LOC/LO settings dump scope. Must be LR-029 verified separately against the search results page.

## 8. SSO / login controls — confirmed excluded

`clients/encore/src/selectors/auth/login.ts` was explicitly excluded from the candidate set per ticket spec (Microsoft SSO is external and un-instrumentable). Zero login.ts selectors appear in the workbook.

## Observations

### Bugs / Defects

none (retrofitted — original walk did not record findings)

### Suggestions / Improvements

none (retrofitted — original walk did not record findings)
