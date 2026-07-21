---
title: Reviewer Walk Evidence - Noncorp missing data-testid independent verification
date: 2026-07-10
ticket: TICKET-NONCORP-MISSING-TESTID-REVIEW-20260710
method: Fresh out-of-repo Playwright script, office 1604, storageState clients/encore/.auth/encore-state.json, shadow-root-piercing data-testid dump
script: session-state/files/review-missing-testid-noncorp-20260710.cjs (deleted after run)
---

# Reviewer Walk Evidence - Locations + Local Office Missing data-testid (2026-07-10)

## Method
- Independent reproduction: read workbook rows with exceljs, then drove a new Playwright Chromium context from the saved storageState.
- Testid dump: recursive DOM walker over `document` plus every open `shadowRoot`; selector probes checked the target element own `data-testid`, with ancestor/descendant testids retained as non-covering context.
- Reversible mutation note: the Local Information success toast was reached with a temporary Oracle Product edit and restored to its original value in the same script. All other dirty states were unsaved and closed without confirm.
- Targeted follow-up: a second scratch Playwright probe attempted Error dialog triggers (offline save + forced 500 API intercept), Local Information validation (empty/negative values), HRI text search, and Account List search (`AC000107`); scratch script/output were deleted after use.

## Row-count reconciliation
- LOCATIONS_MISSING_TESTID data rows: 64
- LOCAL_OFFICE_MISSING_TESTID data rows: 4
- Total workbook data rows: 68
- Rows adjudicated: 68

## Overall verdict
VERDICT: RED
- REPRODUCED-MISSING: 59
- FALSE-POSITIVE: 1
- COULD-NOT-REACH: 8
- Wrongly-dropped gaps: 0

## Discrepancies
- FALSE-POSITIVE LOCATIONS_MISSING_TESTID row 58: target has data-testid=location-settings-modal-change-local-office-btn-cancel

## Could-not-reach items
- LOCATIONS_MISSING_TESTID row 1 (LOC_dialog_error_unreached): offline save and forced 500 API intercept did not render an Error alertdialog; no persistence attempted.
- LOCATIONS_MISSING_TESTID row 2 (LOC_dialog_error_unreached): offline save and forced 500 API intercept did not render an Error alertdialog; no persistence attempted.
- LOCATIONS_MISSING_TESTID row 3 (LOC_dialog_error_unreached): offline save and forced 500 API intercept did not render an Error alertdialog; no persistence attempted.
- LOCATIONS_MISSING_TESTID row 26 (LOC_local_information): empty and negative Local Information values did not render a `p` validation message matching "Number must be".
- LOCATIONS_MISSING_TESTID row 27 (LOC_local_information): empty and negative Local Information values did not render the "greater than or equal to 0" message.
- LOCATIONS_MISSING_TESTID row 28 (LOC_local_information): empty and negative Local Information values did not render the "less than or equal to 100" message.
- LOCATIONS_MISSING_TESTID row 33 (LOC_local_information): Local Information loaded, but "HRI Remit Tax 2" text was absent and the selector matched 0.
- LOCATIONS_MISSING_TESTID row 45 (LOC_dialog_account_list): Account List dialog loaded and `AC000107` search was attempted, but no row checkbox rendered.

## Script warnings
- LOC_local_information_validation_min: locator.waitFor: Timeout 10000ms exceeded. Call log: [2m - waiting for locator('p:has-text("Number must be")').first() to be visible[22m
- LOC_local_information_validation_max: locator.waitFor: Timeout 10000ms exceeded. Call log: [2m - waiting for locator('p:has-text("less than or equal to 100")').first() to be visible[22m

## Targeted follow-up probes
| Target | Result |
|---|---|
| Error dialog | Offline save and forced `500` responses for non-GET `/navigator/api/**` did not render `[role="alertdialog"]:has-text("Error")`. |
| Local Information validation | Empty and negative values on percentage/amount fields produced no matching `p:has-text("Number must be")`, min, or max validation message. |
| HRI Remit Tax 2 | `document.body.innerText` contained no `HRI` or `Tax 2` snippet on office 1604 Local Information; selector matched 0. |
| Account List row checkbox | Opened Account List, searched `AC000107`, and still found 0 `button[role="checkbox"]` inside `location-settings-modal-account-list`. |

## Surface testid-count summary
| Surface | Count | URL / note |
|---|---:|---|
| LO_dialog_save_changes | 70 | Dirty Prep Date Offset, clicked Save, did not confirm. |
| LO_dialog_unsaved_changes | 68 | Dirty Prep Date Offset, clicked Local Office History tab. |
| LO_ect_settings | 16 | Local Office ECT Settings surface. |
| LO_history | 10 | Local Office History surface. |
| LO_settings_basic | 67 | Local Office Basic Information surface. |
| LOC_account_address | 36 | Account and Address base surface. |
| LOC_auto_addon | 42 | Auto Add-On base surface. |
| LOC_basic_information | 88 | Location Settings default Basic Information surface. |
| LOC_currency | 48 | Currency base surface. |
| LOC_currency_no_matches_listbox | 50 | Opened merchant dropdown with No Matches Found empty state. |
| LOC_dialog_account_list | 55 | Clicked Venue/Branch Account Name lookup. |
| LOC_dialog_auto_addon_save_changes | 42 | Toggled first Auto Add-On checkbox, clicked Save, did not confirm. |
| LOC_dialog_auto_addon_unsaved_changes | 43 | Toggled Auto Add-On checkbox, clicked Home to trigger unsaved dialog. |
| LOC_dialog_change_local_office | 50 | Clicked Shared Setup Locations Add. |
| LOC_dialog_error_unreached | 92 | Tried offline save; Error alertdialog did not render. |
| LOC_dialog_pay_to_list | 88 | Dispatched Pay To Address label click. |
| LOC_dialog_save_changes | 92 | Dirty Basic Information field, clicked Save, did not confirm. |
| LOC_dialog_select_address | 44 | Clicked Venue Address launcher. |
| LOC_dialog_unsaved_changes | 93 | Dirty Basic Information field, clicked Location Management History tab. |
| LOC_history | 8 | Location Management History surface. |
| LOC_legal | 36 | Legal base surface. |
| LOC_local_information | 88 | Local Information base surface. |
| LOC_local_information_success_toast | 92 | Reversible Oracle Product edit saved to render success toast; original restored after probe. |
| LOC_notes | 41 | Notes base surface before unsaved Add. |
| LOC_notes_unsaved_row | 41 | Clicked Add and typed unsaved note row; no save. |
| LOC_pricing | 53 | Pricing base surface. |
| LOC_pricing_currency_listbox | 53 | Opened Pricing currency filter listbox. |
| LOC_shared_setup_locations | 46 | Shared Setup Locations base surface for Change Local Office launcher. |

## Worker DROP spot-checks
| Item | Claimed present data-testid | Surface checked | Verdict | Detail |
|---|---|---|---|---|
| tblNotes (notes.ts) | `location-settings-table-notes` | LOC_notes/LOC_notes_unsaved_row | CONFIRMED-DROP | checked Notes base and unsaved-row dumps |
| btnSharedAdd (shared-setup-locations.ts) | `location-settings-btn-add-shared-location-1` | LOC_shared_setup_locations | CONFIRMED-DROP | checked Shared Setup Locations base dump |
| dlgSaveChanges (local-office-settings.ts) | `location-settings-modal-save-changes` | LO_dialog_save_changes | CONFIRMED-DROP | checked Local Office Save Changes dialog dump |
| dlgUnsavedLocalOffice (local-office-settings.ts) | `location-settings-modal-unsaved-changes` | LO_dialog_unsaved_changes | CONFIRMED-DROP | checked Local Office Unsaved Changes dialog dump |
| autoAddonDlgUnsavedChanges (auto-addon.ts) | `location-settings-modal-unsaved-changes` | LOC_dialog_auto_addon_unsaved_changes | CONFIRMED-DROP | checked Auto Add-On Unsaved Changes dialog dump |

## Per-row verdict table
| Sheet | Row | Module | Sub Module | Element | Surface | Verdict | Covering data-testid / reason | Current Selector |
|---|---:|---|---|---|---|---|---|---|
| LOCATIONS_MISSING_TESTID | 1 | Locations | Error Dialog | dialog "Error" container (alertdialog) | LOC_dialog_error_unreached | COULD-NOT-REACH | Offline save and forced 500 API intercept did not render an Error alertdialog; no persistence attempted. | `[role="alertdialog"]:has-text("Error")` |
| LOCATIONS_MISSING_TESTID | 2 | Locations | Error Dialog | label "Error Message" body text (p) | LOC_dialog_error_unreached | COULD-NOT-REACH | Offline save and forced 500 API intercept did not render an Error alertdialog; no persistence attempted. | `[role="alertdialog"]:has-text("Error") p` |
| LOCATIONS_MISSING_TESTID | 3 | Locations | Error Dialog | button "Ok" dismiss | LOC_dialog_error_unreached | COULD-NOT-REACH | Offline save and forced 500 API intercept did not render an Error alertdialog; no persistence attempted. | `[role="alertdialog"]:has-text("Error") button:has-text("Ok")` |
| LOCATIONS_MISSING_TESTID | 4 | Locations | Save Changes Dialog | dialog "Save Changes" container (alertdialog) | LOC_dialog_save_changes | REPRODUCED-MISSING | target div[role=alertdialog] has no own data-testid | `[role="alertdialog"]:has-text("Save Changes")` |
| LOCATIONS_MISSING_TESTID | 5 | Locations | Save Changes Dialog | button "Cancel" | LOC_dialog_save_changes | REPRODUCED-MISSING | target button has no own data-testid | `[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")` |
| LOCATIONS_MISSING_TESTID | 6 | Locations | Save Changes Dialog | button "Ok" confirm save | LOC_dialog_save_changes | REPRODUCED-MISSING | target button has no own data-testid | `[role="alertdialog"]:has-text("Save Changes") button:has-text("Ok")` |
| LOCATIONS_MISSING_TESTID | 7 | Locations | Save Changes Dialog | paragraph confirmation message text | LOC_dialog_save_changes | REPRODUCED-MISSING | target p has no own data-testid | `[role="alertdialog"]:has-text("Save Changes") p` |
| LOCATIONS_MISSING_TESTID | 8 | Locations | Unsaved Changes Dialog | button "Discard" (leave / affirm navigate-away) | LOC_dialog_unsaved_changes | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-modal-unsaved-changes | `[data-testid="location-settings-modal-unsaved-changes"] button:has-text("Discard")` |
| LOCATIONS_MISSING_TESTID | 9 | Locations | Unsaved Changes Dialog | button "Stay" (cancel-leave / keep on page) | LOC_dialog_unsaved_changes | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-modal-unsaved-changes | `[data-testid="location-settings-modal-unsaved-changes"] button:has-text("Stay")` |
| LOCATIONS_MISSING_TESTID | 10 | Locations | Auto Add-On | button "Ok" in Auto Add-On Save Changes dialog | LOC_dialog_auto_addon_save_changes | REPRODUCED-MISSING | target button has no own data-testid | `[role="alertdialog"]:has(h2:text-is("Save Changes")) button:has-text("Ok")` |
| LOCATIONS_MISSING_TESTID | 11 | Locations | Auto Add-On | button "Stay" in Auto Add-On Unsaved Changes dialog | LOC_dialog_auto_addon_unsaved_changes | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-modal-unsaved-changes | `[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Stay")` |
| LOCATIONS_MISSING_TESTID | 12 | Locations | Auto Add-On | button "Discard" in Auto Add-On Unsaved Changes dialog | LOC_dialog_auto_addon_unsaved_changes | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-modal-unsaved-changes | `[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Discard")` |
| LOCATIONS_MISSING_TESTID | 13 | Locations | Basic Information | combobox "Line Of Business" (disabled, label-anchored) | LOC_basic_information | REPRODUCED-MISSING | target button[role=combobox] has no own data-testid; ancestor testids=location-settings-section-details, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `div:has(> label:text-is("Line Of Business")) button[role="combobox"]` |
| LOCATIONS_MISSING_TESTID | 14 | Locations | Basic Information | button "Live Date" datepicker (label-anchored) | LOC_basic_information | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-section-details, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `div:has(> label:text-is("Live Date")) button` |
| LOCATIONS_MISSING_TESTID | 15 | Locations | Basic Information | combobox "Tax Mode" (label-anchored) | LOC_basic_information | REPRODUCED-MISSING | target button[role=combobox] has no own data-testid; ancestor testids=location-settings-section-details, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `div:has(> label:text-is("Tax Mode")) button[role="combobox"]` |
| LOCATIONS_MISSING_TESTID | 16 | Locations | Basic Information | label "Pay To Address" launcher (opens Pay To List dialog) | LOC_basic_information | REPRODUCED-MISSING | target label has no own data-testid; ancestor testids=location-settings-section-details, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `label:has-text("Pay To Address")` |
| LOCATIONS_MISSING_TESTID | 17 | Locations | Pay To List Dialog | dialog "Pay To List" container | LOC_dialog_pay_to_list | REPRODUCED-MISSING | target div[role=dialog] has no own data-testid | `[role="dialog"]:has-text("Pay To List")` |
| LOCATIONS_MISSING_TESTID | 18 | Locations | Pay To List Dialog | button "Search" submit filters | LOC_dialog_pay_to_list | REPRODUCED-MISSING | target button has no own data-testid | `[role="dialog"]:has-text("Pay To List") button:has-text("Search")` |
| LOCATIONS_MISSING_TESTID | 19 | Locations | Pay To List Dialog | button "Reset" clear filters | LOC_dialog_pay_to_list | REPRODUCED-MISSING | target button has no own data-testid | `[role="dialog"]:has-text("Pay To List") button:has-text("Reset")` |
| LOCATIONS_MISSING_TESTID | 20 | Locations | Pay To List Dialog | button "Select" confirm row choice (disabled until row checked) | LOC_dialog_pay_to_list | REPRODUCED-MISSING | target button has no own data-testid | `[role="dialog"]:has-text("Pay To List") button:text-is("Select")` |
| LOCATIONS_MISSING_TESTID | 21 | Locations | Pay To List Dialog | button "Cancel" close without selection | LOC_dialog_pay_to_list | REPRODUCED-MISSING | target button has no own data-testid | `[role="dialog"]:has-text("Pay To List") button:has-text("Cancel")` |
| LOCATIONS_MISSING_TESTID | 22 | Locations | Pay To List Dialog | button "Close" X dismiss | LOC_dialog_pay_to_list | REPRODUCED-MISSING | target button has no own data-testid | `[role="dialog"]:has-text("Pay To List") button:has-text("Close")` |
| LOCATIONS_MISSING_TESTID | 23 | Locations | Pay To List Dialog | table "Results" Pay To rows | LOC_dialog_pay_to_list | REPRODUCED-MISSING | target table has no own data-testid | `[role="dialog"]:has-text("Pay To List") table` |
| LOCATIONS_MISSING_TESTID | 24 | Locations | Pay To List Dialog | checkbox "Select row" first-row radio-style checkbox | LOC_dialog_pay_to_list | REPRODUCED-MISSING | target button[role=checkbox] has no own data-testid | `[role="dialog"]:has-text("Pay To List") tbody tr:first-child td:first-child button[role="checkbox"]` |
| LOCATIONS_MISSING_TESTID | 25 | Locations | Local Information | toast "Local information updated" success notification | LOC_local_information_success_toast | REPRODUCED-MISSING | target li has no own data-testid | `li:has-text("Local information updated")` |
| LOCATIONS_MISSING_TESTID | 26 | Locations | Local Information | validation error "Number must be" boundary message | LOC_local_information | COULD-NOT-REACH | Empty and negative Local Information values did not render a p validation message matching "Number must be". | `p:has-text("Number must be")` |
| LOCATIONS_MISSING_TESTID | 27 | Locations | Local Information | validation error "greater than or equal to 0" (min boundary) | LOC_local_information | COULD-NOT-REACH | Empty and negative Local Information values did not render the "greater than or equal to 0" message. | `p:has-text("Number must be greater than or equal to 0")` |
| LOCATIONS_MISSING_TESTID | 28 | Locations | Local Information | validation error "less than or equal to 100" (max boundary) | LOC_local_information | COULD-NOT-REACH | Empty and negative Local Information values did not render the "less than or equal to 100" message. | `p:has-text("Number must be less than or equal to 100")` |
| LOCATIONS_MISSING_TESTID | 29 | Locations | Local Information | radio "Master" in Billing Type radio group | LOC_local_information | REPRODUCED-MISSING | target button[role=radio] has no own data-testid; ancestor testids=location-settings-input-billing-type, location-settings-sub-tab-content-local-information, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `[data-testid="location-settings-input-billing-type"] button[role="radio"][value="true"]` |
| LOCATIONS_MISSING_TESTID | 30 | Locations | Local Information | radio "Direct" in Billing Type radio group | LOC_local_information | REPRODUCED-MISSING | target button[role=radio] has no own data-testid; ancestor testids=location-settings-input-billing-type, location-settings-sub-tab-content-local-information, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `[data-testid="location-settings-input-billing-type"] button[role="radio"][value="false"]` |
| LOCATIONS_MISSING_TESTID | 31 | Locations | Local Information | radio "Event" in Billing Way radio group | LOC_local_information | REPRODUCED-MISSING | target button[role=radio] has no own data-testid; ancestor testids=location-settings-input-billing-way, location-settings-sub-tab-content-local-information, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `[data-testid="location-settings-input-billing-way"] button[role="radio"][value="true"]` |
| LOCATIONS_MISSING_TESTID | 32 | Locations | Local Information | radio "Daily" in Billing Way radio group | LOC_local_information | REPRODUCED-MISSING | target button[role=radio] has no own data-testid; ancestor testids=location-settings-input-billing-way, location-settings-sub-tab-content-local-information, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `[data-testid="location-settings-input-billing-way"] button[role="radio"][value="false"]` |
| LOCATIONS_MISSING_TESTID | 33 | Locations | Local Information | checkbox "HRI Remit Tax 2" (label-anchored via dt+dd) | LOC_local_information | COULD-NOT-REACH | Local Information loaded, but "HRI Remit Tax 2" text was absent and the selector matched 0. | `dt:has-text("HRI Remit Tax 2") + dd button[role="checkbox"]` |
| LOCATIONS_MISSING_TESTID | 34 | Locations | Notes | cell "No Notes Available" empty-state table cell | LOC_notes | REPRODUCED-MISSING | target td has no own data-testid; ancestor testids=location-settings-table-notes, location-settings-section-notes, location-settings-sub-tab-content-notes, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs | `[data-testid="location-settings-section-notes"] td:has-text("No Notes Available")` |
| LOCATIONS_MISSING_TESTID | 35 | Locations | Notes | textarea "Type notes here..." row 0 (name-anchored) | LOC_notes_unsaved_row | REPRODUCED-MISSING | target textarea has no own data-testid; ancestor testids=location-settings-table-notes, location-settings-section-notes, location-settings-sub-tab-content-notes, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs | `textarea[name="notes.notes.0.note"]` |
| LOCATIONS_MISSING_TESTID | 36 | Locations | Notes | textarea "Type notes here..." generic all-rows accessor | LOC_notes_unsaved_row | REPRODUCED-MISSING | target textarea has no own data-testid; ancestor testids=location-settings-table-notes, location-settings-section-notes, location-settings-sub-tab-content-notes, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs | `[data-testid="location-settings-section-notes"] textarea` |
| LOCATIONS_MISSING_TESTID | 37 | Locations | Notes | button "Delete" note row | LOC_notes_unsaved_row | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-table-notes, location-settings-section-notes, location-settings-sub-tab-content-notes, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs | `[data-testid="location-settings-section-notes"] button:has-text("Delete")` |
| LOCATIONS_MISSING_TESTID | 38 | Locations | History | combobox "Rows per page" pagination selector | LOC_history | REPRODUCED-MISSING | target button[role=combobox] has no own data-testid; ancestor testids=location-settings-table-management-history, location-settings-tab-content-management-history, location-settings-tabs, location-settings-page | `[data-testid="location-settings-tab-content-management-history"] button[role="combobox"]:not([data-testid="location-settings-select-history-type"])` |
| LOCATIONS_MISSING_TESTID | 39 | Locations | History | button "Go to first page" pagination | LOC_history | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-table-management-history, location-settings-tab-content-management-history, location-settings-tabs, location-settings-page | `button[aria-label="Go to first page"]` |
| LOCATIONS_MISSING_TESTID | 40 | Locations | History | button "Go to previous page" pagination | LOC_history | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-table-management-history, location-settings-tab-content-management-history, location-settings-tabs, location-settings-page | `button[aria-label="Go to previous page"]` |
| LOCATIONS_MISSING_TESTID | 41 | Locations | History | button "Go to next page" pagination | LOC_history | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-table-management-history, location-settings-tab-content-management-history, location-settings-tabs, location-settings-page | `button[aria-label="Go to next page"]` |
| LOCATIONS_MISSING_TESTID | 42 | Locations | History | button "Go to last page" pagination | LOC_history | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-table-management-history, location-settings-tab-content-management-history, location-settings-tabs, location-settings-page | `button[aria-label="Go to last page"]` |
| LOCATIONS_MISSING_TESTID | 43 | Locations | Currency | text "No Matches Found" merchant dropdown empty state | LOC_currency_no_matches_listbox | REPRODUCED-MISSING | target div[role=listbox] has no own data-testid | `[role="listbox"]:has-text("No Matches Found")` |
| LOCATIONS_MISSING_TESTID | 44 | Locations | Account List Dialog | button "Close" X dismiss | LOC_dialog_account_list | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-modal-account-list | `[data-testid="location-settings-modal-account-list"] button:has-text("Close")` |
| LOCATIONS_MISSING_TESTID | 45 | Locations | Account List Dialog | checkbox "Select row" first-row radio-style checkbox | LOC_dialog_account_list | COULD-NOT-REACH | Account List dialog loaded and AC000107 search was attempted, but no row checkbox rendered. | `[data-testid="location-settings-modal-account-list"] tbody tr:first-child td:first-child button[role="checkbox"]` |
| LOCATIONS_MISSING_TESTID | 46 | Locations | Account List Dialog | table "Results" account rows | LOC_dialog_account_list | REPRODUCED-MISSING | target table has no own data-testid; ancestor testids=location-settings-modal-account-list | `[data-testid="location-settings-modal-account-list"] table` |
| LOCATIONS_MISSING_TESTID | 47 | Locations | Select Customer Address Dialog | dialog "Select Customer Address" container | LOC_dialog_select_address | REPRODUCED-MISSING | target div[role=dialog] has no own data-testid | `[role="dialog"]:has-text("Select Customer Address")` |
| LOCATIONS_MISSING_TESTID | 48 | Locations | Select Customer Address Dialog | input "Search..." client-side filter | LOC_dialog_select_address | REPRODUCED-MISSING | target input has no own data-testid | `[role="dialog"]:has-text("Select Customer Address") input[placeholder="Search..."]` |
| LOCATIONS_MISSING_TESTID | 49 | Locations | Select Customer Address Dialog | button "Select" confirm address choice | LOC_dialog_select_address | REPRODUCED-MISSING | target button has no own data-testid | `[role="dialog"]:has-text("Select Customer Address") button:has-text("Select")` |
| LOCATIONS_MISSING_TESTID | 50 | Locations | Select Customer Address Dialog | button "Cancel" | LOC_dialog_select_address | REPRODUCED-MISSING | target button has no own data-testid | `[role="dialog"]:has-text("Select Customer Address") button:has-text("Cancel")` |
| LOCATIONS_MISSING_TESTID | 51 | Locations | Select Customer Address Dialog | button "Save" (disabled — always) | LOC_dialog_select_address | REPRODUCED-MISSING | target button has no own data-testid | `[role="dialog"]:has-text("Select Customer Address") button:has-text("Save")` |
| LOCATIONS_MISSING_TESTID | 52 | Locations | Select Customer Address Dialog | button "Close" X dismiss | LOC_dialog_select_address | REPRODUCED-MISSING | target button has no own data-testid | `[role="dialog"]:has-text("Select Customer Address") button:has-text("Close")` |
| LOCATIONS_MISSING_TESTID | 53 | Locations | Select Customer Address Dialog | checkbox "Select row" first-row radio-style checkbox | LOC_dialog_select_address | REPRODUCED-MISSING | target button[role=checkbox] has no own data-testid | `[role="dialog"]:has-text("Select Customer Address") tbody tr:first-child td:first-child button[role="checkbox"]` |
| LOCATIONS_MISSING_TESTID | 54 | Locations | Select Customer Address Dialog | table "Results" address rows | LOC_dialog_select_address | REPRODUCED-MISSING | target table has no own data-testid | `[role="dialog"]:has-text("Select Customer Address") table` |
| LOCATIONS_MISSING_TESTID | 55 | Locations | Select Customer Address Dialog | text "Total Addresses:" footer count | LOC_dialog_select_address | REPRODUCED-MISSING | target span has no own data-testid | `[role="dialog"]:has-text("Select Customer Address") :text("Total Addresses")` |
| LOCATIONS_MISSING_TESTID | 56 | Locations | Change Local Office Dialog | heading h2 "Change Local Office" (no testid on h2) | LOC_dialog_change_local_office | REPRODUCED-MISSING | target h2 has no own data-testid; ancestor testids=location-settings-modal-change-local-office | `[data-testid="location-settings-modal-change-local-office"] h2` |
| LOCATIONS_MISSING_TESTID | 57 | Locations | Change Local Office Dialog | table "Location results" search results grid | LOC_dialog_change_local_office | REPRODUCED-MISSING | target table has no own data-testid; ancestor testids=location-settings-modal-change-local-office | `[data-testid="location-settings-modal-change-local-office"] table` |
| LOCATIONS_MISSING_TESTID | 58 | Locations | Change Local Office Dialog | button "Close" X last-button fallback | LOC_dialog_change_local_office | FALSE-POSITIVE | target has data-testid=location-settings-modal-change-local-office-btn-cancel | `[data-testid="location-settings-modal-change-local-office"] button:last-of-type` |
| LOCATIONS_MISSING_TESTID | 59 | Locations | Pricing | row "{pricebook name}" in Secondary Pricing grid (text-scoped) | LOC_pricing | REPRODUCED-MISSING | target tr has no own data-testid; ancestor testids=location-settings-table-secondary-pricing, location-settings-sub-tab-content-pricing, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `tr:has(td:has-text("${priceBookName}"))` |
| LOCATIONS_MISSING_TESTID | 60 | Locations | Pricing | checkbox "Is Alternative" in Secondary Pricing grid row (positional) | LOC_pricing | REPRODUCED-MISSING | target button[role=checkbox] has no own data-testid; ancestor testids=location-settings-table-secondary-pricing, location-settings-sub-tab-content-pricing, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `tr:has(td:has-text("${priceBookName}")) td:nth-child(4) button[role="checkbox"]` |
| LOCATIONS_MISSING_TESTID | 61 | Locations | Pricing | checkbox "Use Effective Dates" in Secondary Pricing grid row (positional) | LOC_pricing | REPRODUCED-MISSING | target button[role=checkbox] has no own data-testid; ancestor testids=location-settings-table-secondary-pricing, location-settings-sub-tab-content-pricing, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `tr:has(td:has-text("${priceBookName}")) td:nth-child(5) button[role="checkbox"]` |
| LOCATIONS_MISSING_TESTID | 62 | Locations | Pricing | input "Start Date" in Secondary Pricing grid row (positional) | LOC_pricing | REPRODUCED-MISSING | target input has no own data-testid; ancestor testids=location-settings-table-secondary-pricing, location-settings-sub-tab-content-pricing, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `tr:has(td:has-text("${priceBookName}")) td:nth-child(6) input[data-slot="input"]` |
| LOCATIONS_MISSING_TESTID | 63 | Locations | Pricing | input "End Date" in Secondary Pricing grid row (positional) | LOC_pricing | REPRODUCED-MISSING | target input has no own data-testid; ancestor testids=location-settings-table-secondary-pricing, location-settings-sub-tab-content-pricing, location-settings-sub-tabs, location-settings-tab-content-basic-information, location-settings-tabs, location-settings-page | `tr:has(td:has-text("${priceBookName}")) td:nth-child(7) input[data-slot="input"]` |
| LOCATIONS_MISSING_TESTID | 64 | Locations | Pricing | option "{currency}" in currency filter listbox (text-scoped) | LOC_pricing_currency_listbox | REPRODUCED-MISSING | target div[role=option] has no own data-testid | `[role="listbox"] [role="option"]:has-text("${currency}")` |
| LOCAL_OFFICE_MISSING_TESTID | 1 | Local Office | Save Changes Dialog | button "Save" confirm (no testid on button; dialog container has location-settings-modal-save-changes) | LO_dialog_save_changes | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-modal-save-changes | `[role="alertdialog"]:has-text("Save Changes") button:has-text("Save")` |
| LOCAL_OFFICE_MISSING_TESTID | 2 | Local Office | Save Changes Dialog | button "Cancel" (no testid on button) | LO_dialog_save_changes | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-modal-save-changes | `[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")` |
| LOCAL_OFFICE_MISSING_TESTID | 3 | Local Office | Unsaved Changes Dialog | button "Stay" cancel-leave (no testid on button) | LO_dialog_unsaved_changes | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-modal-unsaved-changes | `[role="alertdialog"] button:has-text("Stay")` |
| LOCAL_OFFICE_MISSING_TESTID | 4 | Local Office | Unsaved Changes Dialog | button "Discard" leave-confirm (no testid on button) | LO_dialog_unsaved_changes | REPRODUCED-MISSING | target button has no own data-testid; ancestor testids=location-settings-modal-unsaved-changes | `[role="alertdialog"] button:has-text("Discard")` |

## Raw per-surface data-testid dump

### LO_dialog_save_changes (70)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `local-office-settings-btn-default-section` | button |  |  | Default |
| `local-office-settings-btn-save` | button |  |  | Save |
| `local-office-settings-checkbox-default-job-one-day-event` | button | checkbox |  |  |
| `local-office-settings-checkbox-default-job-one-day-internal` | button | checkbox |  |  |
| `local-office-settings-checkbox-default-job-one-day-outside` | button | checkbox |  |  |
| `local-office-settings-checkbox-default-labor-to-hourly` | button | checkbox |  |  |
| `local-office-settings-checkbox-print-description` | button | checkbox |  |  |
| `local-office-settings-checkbox-request-items-return` | button | checkbox |  |  |
| `local-office-settings-checkbox-same-priority` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-availability` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-equipments-qc` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-fulfillment` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-quote-logo` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-rental-logo` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-section` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-subrent-service-type` | button | checkbox |  |  |
| `local-office-settings-field-default-job-one-day` | div |  |  | Default new job to 1 day Event Outside Internal |
| `local-office-settings-field-default-labor-to-hourly` | div |  |  | Default Labor to Hourly |
| `local-office-settings-field-default-order-type` | div |  |  | Default Order Type Event Event Outside |
| `local-office-settings-field-phone-1` | div |  |  | Phone 1 |
| `local-office-settings-field-phone-2` | div |  |  | Phone 2 |
| `local-office-settings-field-po-number` | div |  |  | PO Number |
| `local-office-settings-field-po-number-label` | div |  |  | PO Number Label |
| `local-office-settings-field-print-description` | div |  |  | Print Description (Default) |
| `local-office-settings-field-request-items-return` | div |  |  | Items Filled from Requests Return to Availability |
| `local-office-settings-field-same-priority` | div |  |  | Allow tentative and confirmed Status to have the same priority |
| `local-office-settings-field-select-company-logo` | div |  |  | Company Logo SAVLogoNew Header with Dust Ears and Text PSAV Presentation Services (V3) PSAV DEG Red... |
| `local-office-settings-field-use-availability` | div |  |  | Use Availability |
| `local-office-settings-field-use-equipments-qc` | div |  |  | Use Equipments QC |
| `local-office-settings-field-use-fulfillment` | div |  |  | Use Fulfillment |
| `local-office-settings-field-use-section` | div |  |  | Use Section |
| `local-office-settings-field-use-subrent-service-type` | div |  |  | Use ServiceType for Subrental Inventory Sources |
| `local-office-settings-form` | form |  |  | 1604 - Parker Palm Springs Save DEFAULT DATE OFFSETS Prep Date Offset (Relative to Start) Hrs Retur... |
| `local-office-settings-input-delivery-date-offset` | input |  |  |  |
| `local-office-settings-input-phone-1` | input |  |  |  |
| `local-office-settings-input-phone-2` | input |  |  |  |
| `local-office-settings-input-pickup-date-offset` | input |  |  |  |
| `local-office-settings-input-po-number` | input |  |  |  |
| `local-office-settings-input-po-number-label` | input |  |  |  |
| `local-office-settings-input-prep-date-offset` | input |  |  |  |
| `local-office-settings-input-return-date-offset` | input |  |  |  |
| `local-office-settings-input-set-date-offset` | input |  |  |  |
| `local-office-settings-input-strike-date-offset` | input |  |  |  |
| `local-office-settings-location-header` | h3 |  |  | 1604 - Parker Palm Springs |
| `local-office-settings-logo-preview` | img |  |  |  |
| `local-office-settings-section-date-offsets` | div |  |  | DEFAULT DATE OFFSETS Prep Date Offset (Relative to Start) Hrs Return Date Offset (Relative to End) ... |
| `local-office-settings-section-default-logo` | div |  |  | DEFAULT LOGO Quotes Rental Orders/DROs Company Logo SAVLogoNew Header with Dust Ears and Text PSAV ... |
| `local-office-settings-section-discount-exemptions` | div |  |  | DISCOUNT EXEMPTIONS SERVICE TYPE EXEMPT APP Downloaded App Quality Assurance App Quality Assurance ... |
| `local-office-settings-section-misc-settings` | div |  |  | MISC SETTINGS Use Fulfillment Use Availability Use Equipments QC Items Filled from Requests Return ... |
| `local-office-settings-section-room-config` | div |  |  | ROOM CONFIGURATION ROOM CONFIGURATION NAME ACTIVE |
| `local-office-settings-section-sections` | div |  |  | SECTION Use Section Default SECTION NAME ACTIVE |
| `local-office-settings-section-title-date-offsets` | div |  |  | DEFAULT DATE OFFSETS |
| `local-office-settings-section-title-default-logo` | div |  |  | DEFAULT LOGO |
| `local-office-settings-section-title-discount-exemptions` | div |  |  | DISCOUNT EXEMPTIONS |
| `local-office-settings-section-title-misc-settings` | div |  |  | MISC SETTINGS |
| `local-office-settings-section-title-room-config` | div |  |  | ROOM CONFIGURATION |
| `local-office-settings-section-title-sections` | div |  |  | SECTION |
| `local-office-settings-select-company-logo` | button | combobox |  | SAVLogoNew |
| `local-office-settings-select-default-order-type` | button | combobox |  | Event |
| `local-office-settings-tab-basic-information` | button | tab |  | Basic Information |
| `local-office-settings-tab-content-basic-information` | div | tabpanel |  | 1604 - Parker Palm Springs Save DEFAULT DATE OFFSETS Prep Date Offset (Relative to Start) Hrs Retur... |
| `local-office-settings-tab-content-ect-settings` | div | tabpanel |  |  |
| `local-office-settings-tab-content-history` | div | tabpanel |  |  |
| `local-office-settings-tab-ect-settings` | button | tab |  | ECT Settings |
| `local-office-settings-tab-location-settings-history` | button | tab |  | Location Settings History |
| `local-office-settings-table-discount-exemptions` | div | region | local settings table | SERVICE TYPE EXEMPT APP Downloaded App Quality Assurance App Quality Assurance – M App Remote Acces... |
| `local-office-settings-table-room-config` | div | region | local settings table | ROOM CONFIGURATION NAME ACTIVE |
| `local-office-settings-table-sections` | div | region | local settings table | SECTION NAME ACTIVE |
| `local-office-settings-tabs` | div |  |  | Basic Information Location Settings History ECT Settings 1604 - Parker Palm Springs Save DEFAULT DA... |
| `location-settings-modal-save-changes` | div | alertdialog |  | Save Changes Are you sure you want to save the changes? Cancel Save |

### LO_dialog_unsaved_changes (68)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `local-office-settings-btn-default-section` | button |  |  | Default |
| `local-office-settings-btn-save` | button |  |  | Save |
| `local-office-settings-checkbox-default-job-one-day-event` | button | checkbox |  |  |
| `local-office-settings-checkbox-default-job-one-day-internal` | button | checkbox |  |  |
| `local-office-settings-checkbox-default-job-one-day-outside` | button | checkbox |  |  |
| `local-office-settings-checkbox-default-labor-to-hourly` | button | checkbox |  |  |
| `local-office-settings-checkbox-print-description` | button | checkbox |  |  |
| `local-office-settings-checkbox-request-items-return` | button | checkbox |  |  |
| `local-office-settings-checkbox-same-priority` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-availability` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-equipments-qc` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-fulfillment` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-quote-logo` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-rental-logo` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-section` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-subrent-service-type` | button | checkbox |  |  |
| `local-office-settings-field-default-job-one-day` | div |  |  | Default new job to 1 day Event Outside Internal |
| `local-office-settings-field-default-labor-to-hourly` | div |  |  | Default Labor to Hourly |
| `local-office-settings-field-default-order-type` | div |  |  | Default Order Type Event Event Outside |
| `local-office-settings-field-phone-1` | div |  |  | Phone 1 |
| `local-office-settings-field-phone-2` | div |  |  | Phone 2 |
| `local-office-settings-field-po-number` | div |  |  | PO Number |
| `local-office-settings-field-po-number-label` | div |  |  | PO Number Label |
| `local-office-settings-field-print-description` | div |  |  | Print Description (Default) |
| `local-office-settings-field-request-items-return` | div |  |  | Items Filled from Requests Return to Availability |
| `local-office-settings-field-same-priority` | div |  |  | Allow tentative and confirmed Status to have the same priority |
| `local-office-settings-field-select-company-logo` | div |  |  | Company Logo |
| `local-office-settings-field-use-availability` | div |  |  | Use Availability |
| `local-office-settings-field-use-equipments-qc` | div |  |  | Use Equipments QC |
| `local-office-settings-field-use-fulfillment` | div |  |  | Use Fulfillment |
| `local-office-settings-field-use-section` | div |  |  | Use Section |
| `local-office-settings-field-use-subrent-service-type` | div |  |  | Use ServiceType for Subrental Inventory Sources |
| `local-office-settings-form` | form |  |  | 1604 - Parker Palm Springs Save DEFAULT DATE OFFSETS Prep Date Offset (Relative to Start) Hrs Retur... |
| `local-office-settings-input-delivery-date-offset` | input |  |  |  |
| `local-office-settings-input-phone-1` | input |  |  |  |
| `local-office-settings-input-phone-2` | input |  |  |  |
| `local-office-settings-input-pickup-date-offset` | input |  |  |  |
| `local-office-settings-input-po-number` | input |  |  |  |
| `local-office-settings-input-po-number-label` | input |  |  |  |
| `local-office-settings-input-prep-date-offset` | input |  |  |  |
| `local-office-settings-input-return-date-offset` | input |  |  |  |
| `local-office-settings-input-set-date-offset` | input |  |  |  |
| `local-office-settings-input-strike-date-offset` | input |  |  |  |
| `local-office-settings-location-header` | h3 |  |  | 1604 - Parker Palm Springs |
| `local-office-settings-section-date-offsets` | div |  |  | DEFAULT DATE OFFSETS Prep Date Offset (Relative to Start) Hrs Return Date Offset (Relative to End) ... |
| `local-office-settings-section-default-logo` | div |  |  | DEFAULT LOGO Quotes Rental Orders/DROs Company Logo |
| `local-office-settings-section-discount-exemptions` | div |  |  | DISCOUNT EXEMPTIONS SERVICE TYPE EXEMPT APP Downloaded App Quality Assurance App Quality Assurance ... |
| `local-office-settings-section-misc-settings` | div |  |  | MISC SETTINGS Use Fulfillment Use Availability Use Equipments QC Items Filled from Requests Return ... |
| `local-office-settings-section-room-config` | div |  |  | ROOM CONFIGURATION ROOM CONFIGURATION NAME ACTIVE |
| `local-office-settings-section-sections` | div |  |  | SECTION Use Section Default SECTION NAME ACTIVE |
| `local-office-settings-section-title-date-offsets` | div |  |  | DEFAULT DATE OFFSETS |
| `local-office-settings-section-title-default-logo` | div |  |  | DEFAULT LOGO |
| `local-office-settings-section-title-discount-exemptions` | div |  |  | DISCOUNT EXEMPTIONS |
| `local-office-settings-section-title-misc-settings` | div |  |  | MISC SETTINGS |
| `local-office-settings-section-title-room-config` | div |  |  | ROOM CONFIGURATION |
| `local-office-settings-section-title-sections` | div |  |  | SECTION |
| `local-office-settings-select-default-order-type` | button | combobox |  | Event |
| `local-office-settings-tab-basic-information` | button | tab |  | Basic Information |
| `local-office-settings-tab-content-basic-information` | div | tabpanel |  | 1604 - Parker Palm Springs Save DEFAULT DATE OFFSETS Prep Date Offset (Relative to Start) Hrs Retur... |
| `local-office-settings-tab-content-ect-settings` | div | tabpanel |  |  |
| `local-office-settings-tab-content-history` | div | tabpanel |  |  |
| `local-office-settings-tab-ect-settings` | button | tab |  | ECT Settings |
| `local-office-settings-tab-location-settings-history` | button | tab |  | Location Settings History |
| `local-office-settings-table-discount-exemptions` | div | region | local settings table | SERVICE TYPE EXEMPT APP Downloaded App Quality Assurance App Quality Assurance – M App Remote Acces... |
| `local-office-settings-table-room-config` | div | region | local settings table | ROOM CONFIGURATION NAME ACTIVE |
| `local-office-settings-table-sections` | div | region | local settings table | SECTION NAME ACTIVE |
| `local-office-settings-tabs` | div |  |  | Basic Information Location Settings History ECT Settings 1604 - Parker Palm Springs Save DEFAULT DA... |
| `location-settings-modal-unsaved-changes` | div | alertdialog |  | Unsaved changes Are you sure you want to leave this view? Any unsaved changes will be lost. Stay Di... |

### LO_ect_settings (16)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `ect-settings-btn-save-fixed-costs` | div |  |  | Save |
| `ect-settings-btn-save-fixed-costs-btn` | button |  |  | Save |
| `ect-settings-btn-save-labor-costs` | div |  |  | Save |
| `ect-settings-btn-save-labor-costs-btn` | button |  |  | Save |
| `ect-settings-header` | div |  |  | 1604 - Parker Palm Springs Edit/View : Commission structure Select Currency : USD |
| `ect-settings-label-location-name` | h6 |  |  | 1604 - Parker Palm Springs |
| `ect-settings-link-commission-structure` | a |  |  | Commission structure |
| `ect-settings-section-header` | div |  |  | 1604 - Parker Palm Springs Edit/View : Commission structure Select Currency : USD |
| `ect-settings-select-currency` | button | combobox |  | USD |
| `local-office-settings-tab-basic-information` | button | tab |  | Basic Information |
| `local-office-settings-tab-content-basic-information` | div | tabpanel |  |  |
| `local-office-settings-tab-content-ect-settings` | div | tabpanel |  | 1604 - Parker Palm Springs Edit/View : Commission structure Select Currency : USD Save EVENT PROFIT... |
| `local-office-settings-tab-content-history` | div | tabpanel |  |  |
| `local-office-settings-tab-ect-settings` | button | tab |  | ECT Settings |
| `local-office-settings-tab-location-settings-history` | button | tab |  | Location Settings History |
| `local-office-settings-tabs` | div |  |  | Basic Information Location Settings History ECT Settings 1604 - Parker Palm Springs Edit/View : Com... |

### LO_history (10)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `local-office-settings-history-select-type` | button | combobox |  | Location Management History |
| `local-office-settings-history-table-container` | div |  |  |  |
| `local-office-settings-history-type-selector` | div |  |  | Location Management History |
| `local-office-settings-tab-basic-information` | button | tab |  | Basic Information |
| `local-office-settings-tab-content-basic-information` | div | tabpanel |  |  |
| `local-office-settings-tab-content-ect-settings` | div | tabpanel |  |  |
| `local-office-settings-tab-content-history` | div | tabpanel |  | Location Management History |
| `local-office-settings-tab-ect-settings` | button | tab |  | ECT Settings |
| `local-office-settings-tab-location-settings-history` | button | tab |  | Location Settings History |
| `local-office-settings-tabs` | div |  |  | Basic Information Location Settings History ECT Settings Location Management History |

### LO_settings_basic (67)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `local-office-settings-btn-default-section` | button |  |  | Default |
| `local-office-settings-btn-save` | button |  |  | Save |
| `local-office-settings-checkbox-default-job-one-day-event` | button | checkbox |  |  |
| `local-office-settings-checkbox-default-job-one-day-internal` | button | checkbox |  |  |
| `local-office-settings-checkbox-default-job-one-day-outside` | button | checkbox |  |  |
| `local-office-settings-checkbox-default-labor-to-hourly` | button | checkbox |  |  |
| `local-office-settings-checkbox-print-description` | button | checkbox |  |  |
| `local-office-settings-checkbox-request-items-return` | button | checkbox |  |  |
| `local-office-settings-checkbox-same-priority` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-availability` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-equipments-qc` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-fulfillment` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-quote-logo` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-rental-logo` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-section` | button | checkbox |  |  |
| `local-office-settings-checkbox-use-subrent-service-type` | button | checkbox |  |  |
| `local-office-settings-field-default-job-one-day` | div |  |  | Default new job to 1 day Event Outside Internal |
| `local-office-settings-field-default-labor-to-hourly` | div |  |  | Default Labor to Hourly |
| `local-office-settings-field-default-order-type` | div |  |  | Default Order Type |
| `local-office-settings-field-phone-1` | div |  |  | Phone 1 |
| `local-office-settings-field-phone-2` | div |  |  | Phone 2 |
| `local-office-settings-field-po-number` | div |  |  | PO Number |
| `local-office-settings-field-po-number-label` | div |  |  | PO Number Label |
| `local-office-settings-field-print-description` | div |  |  | Print Description (Default) |
| `local-office-settings-field-request-items-return` | div |  |  | Items Filled from Requests Return to Availability |
| `local-office-settings-field-same-priority` | div |  |  | Allow tentative and confirmed Status to have the same priority |
| `local-office-settings-field-select-company-logo` | div |  |  | Company Logo |
| `local-office-settings-field-use-availability` | div |  |  | Use Availability |
| `local-office-settings-field-use-equipments-qc` | div |  |  | Use Equipments QC |
| `local-office-settings-field-use-fulfillment` | div |  |  | Use Fulfillment |
| `local-office-settings-field-use-section` | div |  |  | Use Section |
| `local-office-settings-field-use-subrent-service-type` | div |  |  | Use ServiceType for Subrental Inventory Sources |
| `local-office-settings-form` | form |  |  | 1604 - Parker Palm Springs Save DEFAULT DATE OFFSETS Prep Date Offset (Relative to Start) Hrs Retur... |
| `local-office-settings-input-delivery-date-offset` | input |  |  |  |
| `local-office-settings-input-phone-1` | input |  |  |  |
| `local-office-settings-input-phone-2` | input |  |  |  |
| `local-office-settings-input-pickup-date-offset` | input |  |  |  |
| `local-office-settings-input-po-number` | input |  |  |  |
| `local-office-settings-input-po-number-label` | input |  |  |  |
| `local-office-settings-input-prep-date-offset` | input |  |  |  |
| `local-office-settings-input-return-date-offset` | input |  |  |  |
| `local-office-settings-input-set-date-offset` | input |  |  |  |
| `local-office-settings-input-strike-date-offset` | input |  |  |  |
| `local-office-settings-location-header` | h3 |  |  | 1604 - Parker Palm Springs |
| `local-office-settings-section-date-offsets` | div |  |  | DEFAULT DATE OFFSETS Prep Date Offset (Relative to Start) Hrs Return Date Offset (Relative to End) ... |
| `local-office-settings-section-default-logo` | div |  |  | DEFAULT LOGO Quotes Rental Orders/DROs Company Logo |
| `local-office-settings-section-discount-exemptions` | div |  |  | DISCOUNT EXEMPTIONS SERVICE TYPE EXEMPT APP Downloaded App Quality Assurance App Quality Assurance ... |
| `local-office-settings-section-misc-settings` | div |  |  | MISC SETTINGS Use Fulfillment Use Availability Use Equipments QC Items Filled from Requests Return ... |
| `local-office-settings-section-room-config` | div |  |  | ROOM CONFIGURATION ROOM CONFIGURATION NAME ACTIVE |
| `local-office-settings-section-sections` | div |  |  | SECTION Use Section Default SECTION NAME ACTIVE |
| `local-office-settings-section-title-date-offsets` | div |  |  | DEFAULT DATE OFFSETS |
| `local-office-settings-section-title-default-logo` | div |  |  | DEFAULT LOGO |
| `local-office-settings-section-title-discount-exemptions` | div |  |  | DISCOUNT EXEMPTIONS |
| `local-office-settings-section-title-misc-settings` | div |  |  | MISC SETTINGS |
| `local-office-settings-section-title-room-config` | div |  |  | ROOM CONFIGURATION |
| `local-office-settings-section-title-sections` | div |  |  | SECTION |
| `local-office-settings-select-default-order-type` | button | combobox |  |  |
| `local-office-settings-tab-basic-information` | button | tab |  | Basic Information |
| `local-office-settings-tab-content-basic-information` | div | tabpanel |  | 1604 - Parker Palm Springs Save DEFAULT DATE OFFSETS Prep Date Offset (Relative to Start) Hrs Retur... |
| `local-office-settings-tab-content-ect-settings` | div | tabpanel |  |  |
| `local-office-settings-tab-content-history` | div | tabpanel |  |  |
| `local-office-settings-tab-ect-settings` | button | tab |  | ECT Settings |
| `local-office-settings-tab-location-settings-history` | button | tab |  | Location Settings History |
| `local-office-settings-table-discount-exemptions` | div | region | local settings table | SERVICE TYPE EXEMPT APP Downloaded App Quality Assurance App Quality Assurance – M App Remote Acces... |
| `local-office-settings-table-room-config` | div | region | local settings table | ROOM CONFIGURATION NAME ACTIVE |
| `local-office-settings-table-sections` | div | region | local settings table | SECTION NAME ACTIVE |
| `local-office-settings-tabs` | div |  |  | Basic Information Location Settings History ECT Settings 1604 - Parker Palm Springs Save DEFAULT DA... |

### LOC_account_address (36)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_auto_addon (42)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_encore music` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_express content design session` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_wireless presenter` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_wordly` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-true_labor` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-form-auto-add-on` | form |  |  | Encore Music Wireless Presenter Express Content Design Session Wordly Labor |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  | Encore Music Wireless Presenter Express Content Design Session Wordly Labor |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_basic_information (88)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-effective-date` | button |  | Open popover | March 3rd, 2007 |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-allow-dpcd` | button | checkbox |  |  |
| `location-settings-checkbox-allow-ets` | button | checkbox |  |  |
| `location-settings-checkbox-allow-internet-asset-reservation` | button | checkbox |  |  |
| `location-settings-checkbox-allow-production-quote` | button | checkbox |  |  |
| `location-settings-checkbox-allow-resort-tax` | button | checkbox |  |  |
| `location-settings-checkbox-allow-service-charge` | button | checkbox |  |  |
| `location-settings-checkbox-allow-tick-calc` | button | checkbox |  |  |
| `location-settings-checkbox-apply-cables-consumables` | button | checkbox |  |  |
| `location-settings-checkbox-apply-ldw` | button | checkbox |  |  |
| `location-settings-checkbox-apply-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-calc-cac-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-ldw-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-service-charge-on-net` | button | checkbox |  |  |
| `location-settings-checkbox-calculate-commission-tax` | button | checkbox |  |  |
| `location-settings-checkbox-can-create-external-link` | button | checkbox |  |  |
| `location-settings-checkbox-check-discount` | button | checkbox |  |  |
| `location-settings-checkbox-comm-receiver` | button | checkbox |  |  |
| `location-settings-checkbox-company-remit-tax` | button | checkbox |  |  |
| `location-settings-checkbox-compass-integration` | button | checkbox |  |  |
| `location-settings-checkbox-credit-memo-approval` | button | checkbox |  |  |
| `location-settings-checkbox-discount-guidance` | button | checkbox |  |  |
| `location-settings-checkbox-display-tax` | button | checkbox |  |  |
| `location-settings-checkbox-enable-idc-billing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-job-costing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-multiday-pricing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-product-group` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-enable-proposal` | button | checkbox |  |  |
| `location-settings-checkbox-enable-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-exclude-implied-discount` | button | checkbox |  |  |
| `location-settings-checkbox-exhibit-show-rate` | button | checkbox |  |  |
| `location-settings-checkbox-intercompany` | button | checkbox |  |  |
| `location-settings-checkbox-inventory-only` | button | checkbox |  |  |
| `location-settings-checkbox-is-administrative-fee` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-offsite-event-location` | button | checkbox |  |  |
| `location-settings-checkbox-prompt-for-approval` | button | checkbox |  |  |
| `location-settings-checkbox-separate-commission-invoice` | button | checkbox |  |  |
| `location-settings-checkbox-show-sub-rental` | button | checkbox |  |  |
| `location-settings-checkbox-skip-billing` | button | checkbox |  |  |
| `location-settings-checkbox-suppress-discount` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-checkbox-use-esign` | button | checkbox |  |  |
| `location-settings-checkbox-warehouse-billing` | button | checkbox |  |  |
| `location-settings-enable-multiday-pricing` | div |  |  | Enable Multiday Pricing |
| `location-settings-input-billing-type` | div | radiogroup |  | Master Direct |
| `location-settings-input-billing-way` | div | radiogroup |  | Event Daily |
| `location-settings-input-cables-consumables-percentage` | input |  |  |  |
| `location-settings-input-default-ldw-percentage` | input |  |  |  |
| `location-settings-input-ets-percentage` | input |  |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-oracle-dept` | input |  |  |  |
| `location-settings-input-oracle-product` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-input-resort-tax-percent` | input |  |  |  |
| `location-settings-input-set-strike-labor-billing` | input |  |  |  |
| `location-settings-input-threshold-amount` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode Country Reg... |
| `location-settings-select-billing-cycle` | button | combobox |  | Weekly |
| `location-settings-select-oracle-org` | button | combobox |  | --Select-- |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  | Apply LDW LDW Percentage Calculate LDW on Net Amount Apply Cables and Consumables Fee C&C Percentag... |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode Country Reg... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_currency (48)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-currency-CAD-default` | button | checkbox |  |  |
| `location-settings-checkbox-currency-CAD-selected` | button | checkbox |  |  |
| `location-settings-checkbox-currency-MXN-default` | button | checkbox |  |  |
| `location-settings-checkbox-currency-MXN-selected` | button | checkbox |  |  |
| `location-settings-checkbox-currency-USD-default` | button | checkbox |  |  |
| `location-settings-checkbox-currency-USD-selected` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode Country Reg... |
| `location-settings-select-currency-CAD-merchant` | button | combobox |  | 316446 - PSAV Canada/CAD |
| `location-settings-select-currency-MXN-merchant` | button | combobox |  |  |
| `location-settings-select-currency-USD-merchant` | button | combobox |  | 316370 - PSAV US/USD |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  | CURRENCY CODE SELECTED IS DEFAULT MERCHANT USD 316370 - PSAV US/USD 316370 - PSAV US/USD 316426 - E... |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode Country Reg... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-table-currency` | table |  |  | CURRENCY CODE SELECTED IS DEFAULT MERCHANT USD 316370 - PSAV US/USD 316370 - PSAV US/USD 316426 - E... |
| `location-settings-table-currency-col-code` | th |  |  | CURRENCY CODE |
| `location-settings-table-currency-col-is-default` | th |  |  | IS DEFAULT |
| `location-settings-table-currency-col-merchant` | th |  |  | MERCHANT |
| `location-settings-table-currency-col-selected` | th |  |  | SELECTED |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_currency_no_matches_listbox (50)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-currency-CAD-default` | button | checkbox |  |  |
| `location-settings-checkbox-currency-CAD-selected` | button | checkbox |  |  |
| `location-settings-checkbox-currency-MXN-default` | button | checkbox |  |  |
| `location-settings-checkbox-currency-MXN-selected` | button | checkbox |  |  |
| `location-settings-checkbox-currency-USD-default` | button | checkbox |  |  |
| `location-settings-checkbox-currency-USD-selected` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-currency-CAD-merchant` | button | combobox |  | 316446 - PSAV Canada/CAD |
| `location-settings-select-currency-MXN-merchant` | button | combobox |  |  |
| `location-settings-select-currency-USD-merchant` | button | combobox |  | 316370 - PSAV US/USD |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  | CURRENCY CODE SELECTED IS DEFAULT MERCHANT USD 316370 - PSAV US/USD 316370 - PSAV US/USD 316426 - E... |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-table-currency` | table |  |  | CURRENCY CODE SELECTED IS DEFAULT MERCHANT USD 316370 - PSAV US/USD 316370 - PSAV US/USD 316426 - E... |
| `location-settings-table-currency-col-code` | th |  |  | CURRENCY CODE |
| `location-settings-table-currency-col-is-default` | th |  |  | IS DEFAULT |
| `location-settings-table-currency-col-merchant` | th |  |  | MERCHANT |
| `location-settings-table-currency-col-selected` | th |  |  | SELECTED |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_dialog_account_list (55)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-cancel-account-search` | button |  |  | Cancel |
| `location-settings-btn-lookup-venue` | button |  |  | Name |
| `location-settings-btn-master-address` | button |  |  | Address |
| `location-settings-btn-reset-account-search` | button |  |  | Reset |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-btn-search-account` | button |  |  | Search |
| `location-settings-btn-select-account` | button |  |  | Select |
| `location-settings-btn-venue-address` | button |  |  | Address |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-account-address` | input |  |  |  |
| `location-settings-input-account-city` | input |  |  |  |
| `location-settings-input-account-name` | input |  |  |  |
| `location-settings-input-account-number` | input |  |  |  |
| `location-settings-input-contact-phone-1` | input |  |  |  |
| `location-settings-input-contact-phone-2` | input |  |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-input-venue-name` | input |  |  |  |
| `location-settings-modal-account-list` | div | dialog |  | Account List Account Number Account Name Address City State Select State AK AL AR AS AZ CA CO CT DC... |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-bill-to-address` | div |  |  | MASTER BILL TO ADDRESS Address 8899 Beverly Blvd Ste 412 WEST HOLLYWOOD CA 90048 United States |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-section-venue-address` | div |  |  | VENUE/BRANCH ACCOUNT Name Address 8899 Beverly Blvd Ste 412 WEST HOLLYWOOD CA 90048 United States P... |
| `location-settings-select-account-country` | button | combobox |  | Select Country |
| `location-settings-select-account-state` | button | combobox |  | Select State |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  | VENUE/BRANCH ACCOUNT Name Address 8899 Beverly Blvd Ste 412 WEST HOLLYWOOD CA 90048 United States P... |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_dialog_auto_addon_save_changes (42)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_encore music` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_express content design session` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_wireless presenter` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_wordly` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-true_labor` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-form-auto-add-on` | form |  |  | Encore Music Wireless Presenter Express Content Design Session Wordly Labor |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  | Encore Music Wireless Presenter Express Content Design Session Wordly Labor |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_dialog_auto_addon_unsaved_changes (43)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_encore music` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_express content design session` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_wireless presenter` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-false_wordly` | button | checkbox |  |  |
| `location-settings-checkbox-auto-add-on-true_labor` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-form-auto-add-on` | form |  |  | Encore Music Wireless Presenter Express Content Design Session Wordly Labor |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-modal-unsaved-changes` | div | alertdialog |  | Unsaved changes Are you sure you want to leave this view? Any unsaved changes will be lost. Stay Di... |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  | Encore Music Wireless Presenter Express Content Design Session Wordly Labor |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_dialog_change_local_office (50)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-add-shared-location-1` | button |  |  | Add |
| `location-settings-btn-delete-shared-location-0` | button |  |  | Delete |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-shared-location-0-primary` | button | checkbox |  |  |
| `location-settings-checkbox-shared-location-0-shares-inventory` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-modal-change-local-office` | div | dialog |  | Change Local Office Current: 1604 - Parker Palm Springs Select Cancel Close |
| `location-settings-modal-change-local-office-btn-cancel` | button |  |  | Cancel |
| `location-settings-modal-change-local-office-btn-select` | button |  |  | Select |
| `location-settings-modal-change-local-office-input-search` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  | LOCAL OFFICE LOCAL OFFICE NAME PRIMARY OFFICE SHARES INVENTORY 1604 Parker Palm Springs Delete Add |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-table-shared-setup` | table |  |  | LOCAL OFFICE LOCAL OFFICE NAME PRIMARY OFFICE SHARES INVENTORY 1604 Parker Palm Springs Delete Add |
| `location-settings-table-shared-setup-col-actions` | th |  |  |  |
| `location-settings-table-shared-setup-col-local-office` | th |  |  | LOCAL OFFICE |
| `location-settings-table-shared-setup-col-local-office-name` | th |  |  | LOCAL OFFICE NAME |
| `location-settings-table-shared-setup-col-primary-office` | th |  |  | PRIMARY OFFICE |
| `location-settings-table-shared-setup-col-shares-inventory` | th |  |  | SHARES INVENTORY |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_dialog_error_unreached (92)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-effective-date` | button |  | Open popover | March 3rd, 2007 |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-allow-dpcd` | button | checkbox |  |  |
| `location-settings-checkbox-allow-ets` | button | checkbox |  |  |
| `location-settings-checkbox-allow-internet-asset-reservation` | button | checkbox |  |  |
| `location-settings-checkbox-allow-production-quote` | button | checkbox |  |  |
| `location-settings-checkbox-allow-resort-tax` | button | checkbox |  |  |
| `location-settings-checkbox-allow-service-charge` | button | checkbox |  |  |
| `location-settings-checkbox-allow-tick-calc` | button | checkbox |  |  |
| `location-settings-checkbox-apply-cables-consumables` | button | checkbox |  |  |
| `location-settings-checkbox-apply-ldw` | button | checkbox |  |  |
| `location-settings-checkbox-apply-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-calc-cac-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-ldw-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-service-charge-on-net` | button | checkbox |  |  |
| `location-settings-checkbox-calculate-commission-tax` | button | checkbox |  |  |
| `location-settings-checkbox-can-create-external-link` | button | checkbox |  |  |
| `location-settings-checkbox-check-discount` | button | checkbox |  |  |
| `location-settings-checkbox-comm-receiver` | button | checkbox |  |  |
| `location-settings-checkbox-company-remit-tax` | button | checkbox |  |  |
| `location-settings-checkbox-compass-integration` | button | checkbox |  |  |
| `location-settings-checkbox-credit-memo-approval` | button | checkbox |  |  |
| `location-settings-checkbox-discount-guidance` | button | checkbox |  |  |
| `location-settings-checkbox-display-tax` | button | checkbox |  |  |
| `location-settings-checkbox-enable-idc-billing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-job-costing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-multiday-pricing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-product-group` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-enable-proposal` | button | checkbox |  |  |
| `location-settings-checkbox-enable-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-exclude-implied-discount` | button | checkbox |  |  |
| `location-settings-checkbox-exhibit-show-rate` | button | checkbox |  |  |
| `location-settings-checkbox-intercompany` | button | checkbox |  |  |
| `location-settings-checkbox-inventory-only` | button | checkbox |  |  |
| `location-settings-checkbox-is-administrative-fee` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-offsite-event-location` | button | checkbox |  |  |
| `location-settings-checkbox-prompt-for-approval` | button | checkbox |  |  |
| `location-settings-checkbox-separate-commission-invoice` | button | checkbox |  |  |
| `location-settings-checkbox-show-sub-rental` | button | checkbox |  |  |
| `location-settings-checkbox-skip-billing` | button | checkbox |  |  |
| `location-settings-checkbox-suppress-discount` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-checkbox-use-esign` | button | checkbox |  |  |
| `location-settings-checkbox-warehouse-billing` | button | checkbox |  |  |
| `location-settings-enable-multiday-pricing` | div |  |  | Enable Multiday Pricing |
| `location-settings-input-billing-type` | div | radiogroup |  | Master Direct |
| `location-settings-input-billing-way` | div | radiogroup |  | Event Daily |
| `location-settings-input-cables-consumables-percentage` | input |  |  |  |
| `location-settings-input-default-ldw-percentage` | input |  |  |  |
| `location-settings-input-ets-percentage` | input |  |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-oracle-dept` | input |  |  |  |
| `location-settings-input-oracle-product` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-input-resort-tax-percent` | input |  |  |  |
| `location-settings-input-set-strike-labor-billing` | input |  |  |  |
| `location-settings-input-threshold-amount` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode US Country ... |
| `location-settings-select-billing-cycle` | button | combobox |  | Weekly |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-oracle-org` | button | combobox |  | Encore US BU |
| `location-settings-select-product-org` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  | Apply LDW LDW Percentage Calculate LDW on Net Amount Apply Cables and Consumables Fee C&C Percentag... |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_dialog_pay_to_list (88)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-effective-date` | button |  | Open popover | March 3rd, 2007 |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-allow-dpcd` | button | checkbox |  |  |
| `location-settings-checkbox-allow-ets` | button | checkbox |  |  |
| `location-settings-checkbox-allow-internet-asset-reservation` | button | checkbox |  |  |
| `location-settings-checkbox-allow-production-quote` | button | checkbox |  |  |
| `location-settings-checkbox-allow-resort-tax` | button | checkbox |  |  |
| `location-settings-checkbox-allow-service-charge` | button | checkbox |  |  |
| `location-settings-checkbox-allow-tick-calc` | button | checkbox |  |  |
| `location-settings-checkbox-apply-cables-consumables` | button | checkbox |  |  |
| `location-settings-checkbox-apply-ldw` | button | checkbox |  |  |
| `location-settings-checkbox-apply-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-calc-cac-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-ldw-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-service-charge-on-net` | button | checkbox |  |  |
| `location-settings-checkbox-calculate-commission-tax` | button | checkbox |  |  |
| `location-settings-checkbox-can-create-external-link` | button | checkbox |  |  |
| `location-settings-checkbox-check-discount` | button | checkbox |  |  |
| `location-settings-checkbox-comm-receiver` | button | checkbox |  |  |
| `location-settings-checkbox-company-remit-tax` | button | checkbox |  |  |
| `location-settings-checkbox-compass-integration` | button | checkbox |  |  |
| `location-settings-checkbox-credit-memo-approval` | button | checkbox |  |  |
| `location-settings-checkbox-discount-guidance` | button | checkbox |  |  |
| `location-settings-checkbox-display-tax` | button | checkbox |  |  |
| `location-settings-checkbox-enable-idc-billing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-job-costing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-multiday-pricing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-product-group` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-enable-proposal` | button | checkbox |  |  |
| `location-settings-checkbox-enable-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-exclude-implied-discount` | button | checkbox |  |  |
| `location-settings-checkbox-exhibit-show-rate` | button | checkbox |  |  |
| `location-settings-checkbox-intercompany` | button | checkbox |  |  |
| `location-settings-checkbox-inventory-only` | button | checkbox |  |  |
| `location-settings-checkbox-is-administrative-fee` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-offsite-event-location` | button | checkbox |  |  |
| `location-settings-checkbox-prompt-for-approval` | button | checkbox |  |  |
| `location-settings-checkbox-separate-commission-invoice` | button | checkbox |  |  |
| `location-settings-checkbox-show-sub-rental` | button | checkbox |  |  |
| `location-settings-checkbox-skip-billing` | button | checkbox |  |  |
| `location-settings-checkbox-suppress-discount` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-checkbox-use-esign` | button | checkbox |  |  |
| `location-settings-checkbox-warehouse-billing` | button | checkbox |  |  |
| `location-settings-enable-multiday-pricing` | div |  |  | Enable Multiday Pricing |
| `location-settings-input-billing-type` | div | radiogroup |  | Master Direct |
| `location-settings-input-billing-way` | div | radiogroup |  | Event Daily |
| `location-settings-input-cables-consumables-percentage` | input |  |  |  |
| `location-settings-input-default-ldw-percentage` | input |  |  |  |
| `location-settings-input-ets-percentage` | input |  |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-oracle-dept` | input |  |  |  |
| `location-settings-input-oracle-product` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-input-resort-tax-percent` | input |  |  |  |
| `location-settings-input-set-strike-labor-billing` | input |  |  |  |
| `location-settings-input-threshold-amount` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode Country Reg... |
| `location-settings-select-billing-cycle` | button | combobox |  | --Select-- |
| `location-settings-select-oracle-org` | button | combobox |  | --Select-- |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  | Apply LDW LDW Percentage Calculate LDW on Net Amount Apply Cables and Consumables Fee C&C Percentag... |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode Country Reg... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_dialog_save_changes (92)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-effective-date` | button |  | Open popover | March 3rd, 2007 |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-allow-dpcd` | button | checkbox |  |  |
| `location-settings-checkbox-allow-ets` | button | checkbox |  |  |
| `location-settings-checkbox-allow-internet-asset-reservation` | button | checkbox |  |  |
| `location-settings-checkbox-allow-production-quote` | button | checkbox |  |  |
| `location-settings-checkbox-allow-resort-tax` | button | checkbox |  |  |
| `location-settings-checkbox-allow-service-charge` | button | checkbox |  |  |
| `location-settings-checkbox-allow-tick-calc` | button | checkbox |  |  |
| `location-settings-checkbox-apply-cables-consumables` | button | checkbox |  |  |
| `location-settings-checkbox-apply-ldw` | button | checkbox |  |  |
| `location-settings-checkbox-apply-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-calc-cac-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-ldw-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-service-charge-on-net` | button | checkbox |  |  |
| `location-settings-checkbox-calculate-commission-tax` | button | checkbox |  |  |
| `location-settings-checkbox-can-create-external-link` | button | checkbox |  |  |
| `location-settings-checkbox-check-discount` | button | checkbox |  |  |
| `location-settings-checkbox-comm-receiver` | button | checkbox |  |  |
| `location-settings-checkbox-company-remit-tax` | button | checkbox |  |  |
| `location-settings-checkbox-compass-integration` | button | checkbox |  |  |
| `location-settings-checkbox-credit-memo-approval` | button | checkbox |  |  |
| `location-settings-checkbox-discount-guidance` | button | checkbox |  |  |
| `location-settings-checkbox-display-tax` | button | checkbox |  |  |
| `location-settings-checkbox-enable-idc-billing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-job-costing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-multiday-pricing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-product-group` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-enable-proposal` | button | checkbox |  |  |
| `location-settings-checkbox-enable-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-exclude-implied-discount` | button | checkbox |  |  |
| `location-settings-checkbox-exhibit-show-rate` | button | checkbox |  |  |
| `location-settings-checkbox-intercompany` | button | checkbox |  |  |
| `location-settings-checkbox-inventory-only` | button | checkbox |  |  |
| `location-settings-checkbox-is-administrative-fee` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-offsite-event-location` | button | checkbox |  |  |
| `location-settings-checkbox-prompt-for-approval` | button | checkbox |  |  |
| `location-settings-checkbox-separate-commission-invoice` | button | checkbox |  |  |
| `location-settings-checkbox-show-sub-rental` | button | checkbox |  |  |
| `location-settings-checkbox-skip-billing` | button | checkbox |  |  |
| `location-settings-checkbox-suppress-discount` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-checkbox-use-esign` | button | checkbox |  |  |
| `location-settings-checkbox-warehouse-billing` | button | checkbox |  |  |
| `location-settings-enable-multiday-pricing` | div |  |  | Enable Multiday Pricing |
| `location-settings-input-billing-type` | div | radiogroup |  | Master Direct |
| `location-settings-input-billing-way` | div | radiogroup |  | Event Daily |
| `location-settings-input-cables-consumables-percentage` | input |  |  |  |
| `location-settings-input-default-ldw-percentage` | input |  |  |  |
| `location-settings-input-ets-percentage` | input |  |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-oracle-dept` | input |  |  |  |
| `location-settings-input-oracle-product` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-input-resort-tax-percent` | input |  |  |  |
| `location-settings-input-set-strike-labor-billing` | input |  |  |  |
| `location-settings-input-threshold-amount` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode US Country ... |
| `location-settings-select-billing-cycle` | button | combobox |  | Weekly |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-oracle-org` | button | combobox |  | Encore US BU |
| `location-settings-select-product-org` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  | Apply LDW LDW Percentage Calculate LDW on Net Amount Apply Cables and Consumables Fee C&C Percentag... |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_dialog_select_address (44)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-lookup-venue` | button |  |  | Name |
| `location-settings-btn-master-address` | button |  |  | Address |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-btn-venue-address` | button |  |  | Address |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-contact-phone-1` | input |  |  |  |
| `location-settings-input-contact-phone-2` | input |  |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-input-venue-name` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-bill-to-address` | div |  |  | MASTER BILL TO ADDRESS Address 8899 Beverly Blvd Ste 412 WEST HOLLYWOOD CA 90048 United States |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-section-venue-address` | div |  |  | VENUE/BRANCH ACCOUNT Name Address 8899 Beverly Blvd Ste 412 WEST HOLLYWOOD CA 90048 United States P... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  | VENUE/BRANCH ACCOUNT Name Address 8899 Beverly Blvd Ste 412 WEST HOLLYWOOD CA 90048 United States P... |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_dialog_unsaved_changes (93)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-effective-date` | button |  | Open popover | March 3rd, 2007 |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-allow-dpcd` | button | checkbox |  |  |
| `location-settings-checkbox-allow-ets` | button | checkbox |  |  |
| `location-settings-checkbox-allow-internet-asset-reservation` | button | checkbox |  |  |
| `location-settings-checkbox-allow-production-quote` | button | checkbox |  |  |
| `location-settings-checkbox-allow-resort-tax` | button | checkbox |  |  |
| `location-settings-checkbox-allow-service-charge` | button | checkbox |  |  |
| `location-settings-checkbox-allow-tick-calc` | button | checkbox |  |  |
| `location-settings-checkbox-apply-cables-consumables` | button | checkbox |  |  |
| `location-settings-checkbox-apply-ldw` | button | checkbox |  |  |
| `location-settings-checkbox-apply-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-calc-cac-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-ldw-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-service-charge-on-net` | button | checkbox |  |  |
| `location-settings-checkbox-calculate-commission-tax` | button | checkbox |  |  |
| `location-settings-checkbox-can-create-external-link` | button | checkbox |  |  |
| `location-settings-checkbox-check-discount` | button | checkbox |  |  |
| `location-settings-checkbox-comm-receiver` | button | checkbox |  |  |
| `location-settings-checkbox-company-remit-tax` | button | checkbox |  |  |
| `location-settings-checkbox-compass-integration` | button | checkbox |  |  |
| `location-settings-checkbox-credit-memo-approval` | button | checkbox |  |  |
| `location-settings-checkbox-discount-guidance` | button | checkbox |  |  |
| `location-settings-checkbox-display-tax` | button | checkbox |  |  |
| `location-settings-checkbox-enable-idc-billing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-job-costing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-multiday-pricing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-product-group` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-enable-proposal` | button | checkbox |  |  |
| `location-settings-checkbox-enable-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-exclude-implied-discount` | button | checkbox |  |  |
| `location-settings-checkbox-exhibit-show-rate` | button | checkbox |  |  |
| `location-settings-checkbox-intercompany` | button | checkbox |  |  |
| `location-settings-checkbox-inventory-only` | button | checkbox |  |  |
| `location-settings-checkbox-is-administrative-fee` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-offsite-event-location` | button | checkbox |  |  |
| `location-settings-checkbox-prompt-for-approval` | button | checkbox |  |  |
| `location-settings-checkbox-separate-commission-invoice` | button | checkbox |  |  |
| `location-settings-checkbox-show-sub-rental` | button | checkbox |  |  |
| `location-settings-checkbox-skip-billing` | button | checkbox |  |  |
| `location-settings-checkbox-suppress-discount` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-checkbox-use-esign` | button | checkbox |  |  |
| `location-settings-checkbox-warehouse-billing` | button | checkbox |  |  |
| `location-settings-enable-multiday-pricing` | div |  |  | Enable Multiday Pricing |
| `location-settings-input-billing-type` | div | radiogroup |  | Master Direct |
| `location-settings-input-billing-way` | div | radiogroup |  | Event Daily |
| `location-settings-input-cables-consumables-percentage` | input |  |  |  |
| `location-settings-input-default-ldw-percentage` | input |  |  |  |
| `location-settings-input-ets-percentage` | input |  |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-oracle-dept` | input |  |  |  |
| `location-settings-input-oracle-product` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-input-resort-tax-percent` | input |  |  |  |
| `location-settings-input-set-strike-labor-billing` | input |  |  |  |
| `location-settings-input-threshold-amount` | input |  |  |  |
| `location-settings-modal-unsaved-changes` | div | alertdialog |  | Unsaved changes Are you sure you want to leave this view? Any unsaved changes will be lost. Stay Di... |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode US Country ... |
| `location-settings-select-billing-cycle` | button | combobox |  | --Select-- |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-oracle-org` | button | combobox |  | Encore US BU |
| `location-settings-select-product-org` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  | Apply LDW LDW Percentage Calculate LDW on Net Amount Apply Cables and Consumables Fee C&C Percentag... |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_history (8)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-page` | div |  |  | Basic Information Location Management History Location Management History |
| `location-settings-select-history-type` | button | combobox |  | Location Management History |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  |  |
| `location-settings-tab-content-management-history` | div | tabpanel |  | Location Management History |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-table-management-history` | div |  |  |  |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Location Management History |

### LOC_legal (36)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_local_information (88)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-effective-date` | button |  | Open popover | March 3rd, 2007 |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-allow-dpcd` | button | checkbox |  |  |
| `location-settings-checkbox-allow-ets` | button | checkbox |  |  |
| `location-settings-checkbox-allow-internet-asset-reservation` | button | checkbox |  |  |
| `location-settings-checkbox-allow-production-quote` | button | checkbox |  |  |
| `location-settings-checkbox-allow-resort-tax` | button | checkbox |  |  |
| `location-settings-checkbox-allow-service-charge` | button | checkbox |  |  |
| `location-settings-checkbox-allow-tick-calc` | button | checkbox |  |  |
| `location-settings-checkbox-apply-cables-consumables` | button | checkbox |  |  |
| `location-settings-checkbox-apply-ldw` | button | checkbox |  |  |
| `location-settings-checkbox-apply-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-calc-cac-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-ldw-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-service-charge-on-net` | button | checkbox |  |  |
| `location-settings-checkbox-calculate-commission-tax` | button | checkbox |  |  |
| `location-settings-checkbox-can-create-external-link` | button | checkbox |  |  |
| `location-settings-checkbox-check-discount` | button | checkbox |  |  |
| `location-settings-checkbox-comm-receiver` | button | checkbox |  |  |
| `location-settings-checkbox-company-remit-tax` | button | checkbox |  |  |
| `location-settings-checkbox-compass-integration` | button | checkbox |  |  |
| `location-settings-checkbox-credit-memo-approval` | button | checkbox |  |  |
| `location-settings-checkbox-discount-guidance` | button | checkbox |  |  |
| `location-settings-checkbox-display-tax` | button | checkbox |  |  |
| `location-settings-checkbox-enable-idc-billing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-job-costing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-multiday-pricing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-product-group` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-enable-proposal` | button | checkbox |  |  |
| `location-settings-checkbox-enable-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-exclude-implied-discount` | button | checkbox |  |  |
| `location-settings-checkbox-exhibit-show-rate` | button | checkbox |  |  |
| `location-settings-checkbox-intercompany` | button | checkbox |  |  |
| `location-settings-checkbox-inventory-only` | button | checkbox |  |  |
| `location-settings-checkbox-is-administrative-fee` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-offsite-event-location` | button | checkbox |  |  |
| `location-settings-checkbox-prompt-for-approval` | button | checkbox |  |  |
| `location-settings-checkbox-separate-commission-invoice` | button | checkbox |  |  |
| `location-settings-checkbox-show-sub-rental` | button | checkbox |  |  |
| `location-settings-checkbox-skip-billing` | button | checkbox |  |  |
| `location-settings-checkbox-suppress-discount` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-checkbox-use-esign` | button | checkbox |  |  |
| `location-settings-checkbox-warehouse-billing` | button | checkbox |  |  |
| `location-settings-enable-multiday-pricing` | div |  |  | Enable Multiday Pricing |
| `location-settings-input-billing-type` | div | radiogroup |  | Master Direct |
| `location-settings-input-billing-way` | div | radiogroup |  | Event Daily |
| `location-settings-input-cables-consumables-percentage` | input |  |  |  |
| `location-settings-input-default-ldw-percentage` | input |  |  |  |
| `location-settings-input-ets-percentage` | input |  |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-oracle-dept` | input |  |  |  |
| `location-settings-input-oracle-product` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-input-resort-tax-percent` | input |  |  |  |
| `location-settings-input-set-strike-labor-billing` | input |  |  |  |
| `location-settings-input-threshold-amount` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode Country Reg... |
| `location-settings-select-billing-cycle` | button | combobox |  | Weekly |
| `location-settings-select-oracle-org` | button | combobox |  | --Select-- |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  | Apply LDW LDW Percentage Calculate LDW on Net Amount Apply Cables and Consumables Fee C&C Percentag... |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 23rd, 1975 Tax Mode Country Reg... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_local_information_success_toast (92)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-effective-date` | button |  | Open popover | March 3rd, 2007 |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-allow-dpcd` | button | checkbox |  |  |
| `location-settings-checkbox-allow-ets` | button | checkbox |  |  |
| `location-settings-checkbox-allow-internet-asset-reservation` | button | checkbox |  |  |
| `location-settings-checkbox-allow-production-quote` | button | checkbox |  |  |
| `location-settings-checkbox-allow-resort-tax` | button | checkbox |  |  |
| `location-settings-checkbox-allow-service-charge` | button | checkbox |  |  |
| `location-settings-checkbox-allow-tick-calc` | button | checkbox |  |  |
| `location-settings-checkbox-apply-cables-consumables` | button | checkbox |  |  |
| `location-settings-checkbox-apply-ldw` | button | checkbox |  |  |
| `location-settings-checkbox-apply-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-calc-cac-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-ldw-on-net-amount` | button | checkbox |  |  |
| `location-settings-checkbox-calc-service-charge-on-net` | button | checkbox |  |  |
| `location-settings-checkbox-calculate-commission-tax` | button | checkbox |  |  |
| `location-settings-checkbox-can-create-external-link` | button | checkbox |  |  |
| `location-settings-checkbox-check-discount` | button | checkbox |  |  |
| `location-settings-checkbox-comm-receiver` | button | checkbox |  |  |
| `location-settings-checkbox-company-remit-tax` | button | checkbox |  |  |
| `location-settings-checkbox-compass-integration` | button | checkbox |  |  |
| `location-settings-checkbox-credit-memo-approval` | button | checkbox |  |  |
| `location-settings-checkbox-discount-guidance` | button | checkbox |  |  |
| `location-settings-checkbox-display-tax` | button | checkbox |  |  |
| `location-settings-checkbox-enable-idc-billing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-job-costing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-multiday-pricing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-product-group` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-enable-proposal` | button | checkbox |  |  |
| `location-settings-checkbox-enable-set-strike-minutes` | button | checkbox |  |  |
| `location-settings-checkbox-exclude-implied-discount` | button | checkbox |  |  |
| `location-settings-checkbox-exhibit-show-rate` | button | checkbox |  |  |
| `location-settings-checkbox-intercompany` | button | checkbox |  |  |
| `location-settings-checkbox-inventory-only` | button | checkbox |  |  |
| `location-settings-checkbox-is-administrative-fee` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-offsite-event-location` | button | checkbox |  |  |
| `location-settings-checkbox-prompt-for-approval` | button | checkbox |  |  |
| `location-settings-checkbox-separate-commission-invoice` | button | checkbox |  |  |
| `location-settings-checkbox-show-sub-rental` | button | checkbox |  |  |
| `location-settings-checkbox-skip-billing` | button | checkbox |  |  |
| `location-settings-checkbox-suppress-discount` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-checkbox-use-esign` | button | checkbox |  |  |
| `location-settings-checkbox-warehouse-billing` | button | checkbox |  |  |
| `location-settings-enable-multiday-pricing` | div |  |  | Enable Multiday Pricing |
| `location-settings-input-billing-type` | div | radiogroup |  | Master Direct |
| `location-settings-input-billing-way` | div | radiogroup |  | Event Daily |
| `location-settings-input-cables-consumables-percentage` | input |  |  |  |
| `location-settings-input-default-ldw-percentage` | input |  |  |  |
| `location-settings-input-ets-percentage` | input |  |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-oracle-dept` | input |  |  |  |
| `location-settings-input-oracle-product` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-input-resort-tax-percent` | input |  |  |  |
| `location-settings-input-set-strike-labor-billing` | input |  |  |  |
| `location-settings-input-threshold-amount` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 22nd, 1975 Tax Mode US Country ... |
| `location-settings-select-billing-cycle` | button | combobox |  | Weekly |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-oracle-org` | button | combobox |  | Encore US BU |
| `location-settings-select-product-org` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  | Apply LDW LDW Percentage Calculate LDW on Net Amount Apply Cables and Consumables Fee C&C Percentag... |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 22nd, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_notes (41)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-add-note` | button |  |  | Add |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-label-note-character-counter` | div |  |  | 0/4000(4000 Left) |
| `location-settings-label-note-character-progress` | div | progressbar |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-section-notes` | div |  |  | No Notes Available Add 0/4000(4000 Left) |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  | No Notes Available Add 0/4000(4000 Left) |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-table-notes` | table |  |  | No Notes Available |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_notes_unsaved_row (41)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-add-note` | button |  |  | Add |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-label-note-character-counter` | div |  |  | 29/4000(3971 Left) |
| `location-settings-label-note-character-progress` | div | progressbar |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-section-notes` | div |  |  | Delete Add 29/4000(3971 Left) |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  | Delete Add 29/4000(3971 Left) |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-table-notes` | table |  |  | Delete |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_pricing (53)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-btn-toggle-settings-panel` | button |  | Collapse pricing settings panel |  |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-corporate-pricing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-price-guide-inclusion` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-pricing-currency` | button | combobox |  | All |
| `location-settings-select-primary-equipment-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-primary-internal-equipment-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-primary-labor-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-primary-production-equipment-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-primary-production-labor-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  | CORPORATE PRICING Corporate Pricing Include Service Fee in Price Guides Currency All USD Primary La... |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-table-pricing-col-currency` | div |  |  | Currency |
| `location-settings-table-pricing-col-end-date` | div |  |  | End Date |
| `location-settings-table-pricing-col-is-alternate` | div |  |  | Is Alternate |
| `location-settings-table-pricing-col-pricebook` | div |  |  | Pricebook |
| `location-settings-table-pricing-col-pricing-strategy` | div |  |  | Pricing Strategy |
| `location-settings-table-pricing-col-start-date` | div |  |  | Start Date |
| `location-settings-table-pricing-col-use-effective-dates` | div |  |  | Use Effective Dates |
| `location-settings-table-secondary-pricing` | table |  |  | Pricing Strategy Pricebook Currency Is Alternate Use Effective Dates Start Date End Date 2021-Tier ... |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_pricing_currency_listbox (53)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-btn-toggle-settings-panel` | button |  | Collapse pricing settings panel |  |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-corporate-pricing` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-price-guide-inclusion` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-pricing-currency` | button | combobox |  | All |
| `location-settings-select-primary-equipment-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-primary-internal-equipment-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-primary-labor-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-primary-production-equipment-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-primary-production-labor-pricing-usd` | button | combobox | Open popover | --Select-- |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  | CORPORATE PRICING Corporate Pricing Include Service Fee in Price Guides Currency All USD Primary La... |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  |  |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-table-pricing-col-currency` | div |  |  | Currency |
| `location-settings-table-pricing-col-end-date` | div |  |  | End Date |
| `location-settings-table-pricing-col-is-alternate` | div |  |  | Is Alternate |
| `location-settings-table-pricing-col-pricebook` | div |  |  | Pricebook |
| `location-settings-table-pricing-col-pricing-strategy` | div |  |  | Pricing Strategy |
| `location-settings-table-pricing-col-start-date` | div |  |  | Start Date |
| `location-settings-table-pricing-col-use-effective-dates` | div |  |  | Use Effective Dates |
| `location-settings-table-secondary-pricing` | table |  |  | Pricing Strategy Pricebook Currency Is Alternate Use Effective Dates Start Date End Date 2021-Tier ... |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |

### LOC_shared_setup_locations (46)

| data-testid | tag | role | aria-label | text sample |
|---|---|---|---|---|
| `location-settings-btn-add-shared-location-1` | button |  |  | Add |
| `location-settings-btn-delete-shared-location-0` | button |  |  | Delete |
| `location-settings-btn-save` | button |  |  | Save |
| `location-settings-checkbox-active` | button | checkbox |  |  |
| `location-settings-checkbox-enable-productions-orders` | button | checkbox |  |  |
| `location-settings-checkbox-is-union` | button | checkbox |  |  |
| `location-settings-checkbox-shared-location-0-primary` | button | checkbox |  |  |
| `location-settings-checkbox-shared-location-0-shares-inventory` | button | checkbox |  |  |
| `location-settings-checkbox-use-ecommerce` | button | checkbox |  |  |
| `location-settings-input-location-name` | input |  |  |  |
| `location-settings-input-location-no` | input |  |  |  |
| `location-settings-input-pay-to-name` | input |  |  |  |
| `location-settings-input-primary-location-no` | input |  |  |  |
| `location-settings-page` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
| `location-settings-section-details` | div |  |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-select-country` | button | combobox |  | United States |
| `location-settings-select-region` | button | combobox |  | Palm Springs |
| `location-settings-select-servicing-branch` | button | combobox |  | Select Servicing Branch Office |
| `location-settings-sub-tab-account-and-address` | button | tab |  | Account and Address |
| `location-settings-sub-tab-auto-add-on` | button | tab |  | Auto Add-On |
| `location-settings-sub-tab-content-account-and-address` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-auto-add-on` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-currency` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-legal` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-local-information` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-notes` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-pricing` | div | tabpanel |  |  |
| `location-settings-sub-tab-content-shared-setup-locations` | div | tabpanel |  | LOCAL OFFICE LOCAL OFFICE NAME PRIMARY OFFICE SHARES INVENTORY 1604 Parker Palm Springs Delete Add |
| `location-settings-sub-tab-currency` | button | tab |  | Currency |
| `location-settings-sub-tab-legal` | button | tab |  | Legal |
| `location-settings-sub-tab-local-information` | button | tab |  | Local Information |
| `location-settings-sub-tab-notes` | button | tab |  | Notes |
| `location-settings-sub-tab-pricing` | button | tab |  | Pricing |
| `location-settings-sub-tab-shared-setup-locations` | button | tab |  | Shared Setup Locations |
| `location-settings-sub-tabs` | div |  |  | Local Information Currency Pricing Account and Address Legal Notes Shared Setup Locations Auto Add-... |
| `location-settings-tab-basic-information` | button | tab |  | Basic Information |
| `location-settings-tab-content-basic-information` | div | tabpanel |  | Save Office Local Office Local Office Name Active Live Date October 21st, 1975 Tax Mode US Country ... |
| `location-settings-tab-content-management-history` | div | tabpanel |  |  |
| `location-settings-tab-management-history` | button | tab |  | Location Management History |
| `location-settings-table-shared-setup` | table |  |  | LOCAL OFFICE LOCAL OFFICE NAME PRIMARY OFFICE SHARES INVENTORY 1604 Parker Palm Springs Delete Add |
| `location-settings-table-shared-setup-col-actions` | th |  |  |  |
| `location-settings-table-shared-setup-col-local-office` | th |  |  | LOCAL OFFICE |
| `location-settings-table-shared-setup-col-local-office-name` | th |  |  | LOCAL OFFICE NAME |
| `location-settings-table-shared-setup-col-primary-office` | th |  |  | PRIMARY OFFICE |
| `location-settings-table-shared-setup-col-shares-inventory` | th |  |  | SHARES INVENTORY |
| `location-settings-tabs` | div |  |  | Basic Information Location Management History Save Office Local Office Local Office Name Active Liv... |
