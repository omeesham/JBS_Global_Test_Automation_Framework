---
title: Reviewer Walk Evidence - Bounce Reconciliation Review
date: 2026-07-10
ticket: TICKET-TESTID-BOUNCE-REVIEW-20260710
auth_state: clients\encore\.auth\encore-state.json
fresh_dump_utc: 2026-07-10T12:23:47.002Z
verdict: RED
---

# Reviewer Walk Evidence - Bounce Reconciliation 2026-07-10

Method: fresh headless Chromium Playwright launch using shared storage state `clients\encore\.auth\encore-state.json`; pages walked live on office 1604 Search and office 1606 Product Group Override. Workbook read-back before walk: `CORP_PRICING_MISSING_TESTID` = 105 data rows.

## Raw per-surface testid dump

### Search 1604 - `/locations/1604/settings/corporate-pricing`

| Surface | Live node text | Live `data-testid` |
|---|---|---|
| Filter Location dropdown | All Locations | null |
| Filter Currency dropdown | All Currencies | null |
| Filter Is Internal checkbox | role=checkbox, ancestor text `Is Internal` | `e2e-checkbox` |
| Filter Is Labor checkbox | role=checkbox, ancestor text `Is Labor` | `e2e-checkbox` |
| Filter Active Only checkbox | role=checkbox, ancestor text `Active Only` | `e2e-checkbox` |
| Loc Pricing Export button | Loc Pricing Export | null |
| Loc Pricing Import button | Loc Pricing Import | null |
| Export button | Export | null |
| Import button | Import | null |
| Grid Options button | Grid Options | null |
| Grid Options menuitemcheckboxes | Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency | null on all 9 |
| Export menu items | All Equipment Pricing, All Labor Pricing, All Equipment Max Discount, All Labor Max Discount | null on all 4 |
| Export dialog | Export / Year(s) / Currency | null |
| Export dialog dropdowns | Select years..., Select currency... | null on both |
| Export dialog options | 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028 | null on all 8 sampled |
| Import menu items | All Equipment Pricing, All Labor Pricing, All Equipment Max Discount, All Labor Max Discount | null on all 4 |
| Import precondition dialog | Import / Year(s) / Currency | null |
| Import precondition dropdowns | Select years..., Select currency... | null on both |
| Import precondition options | 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028 | null on all 8 sampled |
| Loc Pricing Import upload dialog | Import All Location Pricing | `corporate-pricing-import-dialog` |
| Loc Pricing Import Browse button | Browse | `corporate-pricing-import-dialog-browse` |
| Loc Pricing Import file input | input[type=file] | `corporate-pricing-import-dialog-file-input` |
| Loc Pricing Import Upload button | Upload | `corporate-pricing-import-dialog-upload` |
| Select items to publish review modal | not triggered | COULD-NOT-REACH without completing real CSV import |

### Product Group Override 1606 - `/locations/1606/settings/corporate-pricing/pg-override`

| Surface | Live node text | Live `data-testid` |
|---|---|---|
| Select a location trigger | Select a location | null |
| Location picker dialog | Change Local Office | `location-settings-modal-change-local-office` |
| Location picker search input | Search by Location Name, Number | `location-settings-modal-change-local-office-input-search` |
| Location picker row checkbox | aria-label `Select row` | null |
| Location picker Select button before row check | Select, disabled | `location-settings-modal-change-local-office-btn-select` |
| Location picker Select button after row check | Select, enabled | `location-settings-modal-change-local-office-btn-select` |
| Location picker Cancel button | Cancel | `location-settings-modal-change-local-office-btn-cancel` |
| Override grid rows after selecting 1606 | 7 sampled rows, starting `1606 2606 House Video Monitor LED 40"-49"` | null on all sampled `<tr>` |
| Currency dropdown | ALL | null |
| Active only checkbox | role=checkbox aria-checked=false | null |
| First row Active checkbox | role=checkbox aria-checked=true | null |
| Toolbar Save button | Save | null |
| Toolbar Export button | Export | null |
| Toolbar Import button | Import | null |
| Grid Options button | Grid Options | null |
| Footer rows-per-page dropdown | 20 | null |
| Grid Options menuitemcheckboxes | Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By | null on all 10 |
| Grid Options Reset to Default item | Reset to Default View | null |
| Import All Pricing Overrides dialog | Import All Pricing Overrides | `pg-override-upload-dialog` |
| Import All Pricing Overrides Browse button | Browse | `pg-override-upload-dialog-browse` |
| Import All Pricing Overrides file input | input[type=file] | `pg-override-upload-dialog-file-input` |
| Import All Pricing Overrides Upload button | Upload | `pg-override-upload-dialog-upload` |
| Save confirmation dialog | Save Changes / Cancel / Save | `location-settings-modal-save-changes` |
| Save dialog Close button | aria-label Close | null |
| Save dialog Cancel button | Cancel | null |
| Save dialog Save button | Save | null |

## Five removals plus one add

| Item | Live evidence | Verdict |
|---|---|---|
| Search Import file-upload dialog container | `corporate-pricing-import-dialog` on live Loc Pricing Import upload dialog | CONFIRMED-REMOVED-CORRECTLY |
| Override Location picker dialog container | `location-settings-modal-change-local-office` | CONFIRMED-REMOVED-CORRECTLY |
| Override Location picker Select button | `location-settings-modal-change-local-office-btn-select` before and after row selection | CONFIRMED-REMOVED-CORRECTLY |
| Override Save-confirm dialog container | `location-settings-modal-save-changes` | CONFIRMED-REMOVED-CORRECTLY |
| Override Import All Pricing Overrides dialog | `pg-override-upload-dialog` | CONFIRMED-REMOVED-CORRECTLY |
| Override Save-confirm dialog Save button | null on `[role="alertdialog"] button:text-is("Save")` | CONFIRMED-MISSING |

## Residual-FP sweep - 37 current Corp Search/Override dialog-family rows

| Current row(s) | Element family | Live `data-testid` | Verdict |
|---|---|---|---|
| Search rows 5-6 | filter Location/Currency dropdowns | null | OK-NULL |
| Search rows 7-9 | filter Is Internal / Is Labor / Active Only checkboxes | `e2e-checkbox` on all 3 role=checkbox nodes | RESIDUAL-FP |
| Search rows 16-20 | action buttons Loc Pricing Export / Loc Pricing Import / Export / Import / Grid Options | null | OK-NULL |
| Search row 21 | Export/Import variant menu items | null on all 4 sampled items | OK-NULL |
| Search row 22 | Grid Options column toggles | null on all 9 sampled toggles | OK-NULL |
| Search rows 23-24 | Export dialog dropdowns/options | null on dialog, both dropdowns, and 8 sampled options | OK-NULL |
| Search rows 25-27 | Import precondition dialog dropdowns/options | null on dialog, both dropdowns, and 8 sampled options | OK-NULL |
| Search rows 28-29 | Select items to publish review modal + modal checkboxes | not live-triggered; requires completing a real CSV import | COULD-NOT-REACH |
| Search row 43 | Pagination rows-per-page dropdown | null | OK-NULL |
| Override rows 47-48 | Select-location trigger + picker row checkbox | null | OK-NULL |
| Override rows 49-50 | Currency dropdown + Active only checkbox | null | OK-NULL |
| Override row 57 | grid Active checkbox | null | OK-NULL |
| Override rows 58-61 | toolbar Save / Export / Import / Grid Options | null | OK-NULL |
| Override rows 62-63 | Grid Options toggles + Reset to Default | null | OK-NULL |
| Override row 64 | footer rows-per-page dropdown | null | OK-NULL |
| Override rows 67-68 | Save dialog Cancel + Save buttons | null | OK-NULL |

## R29-class recommendation

Rows 28-29 (`Select items to publish` import delta review modal and modal checkboxes) were not safely triggerable without completing a real CSV import/upload. Recommendation: move both rows to `UNVERIFIED_NEEDS_TRIGGER` until a controlled import fixture can open the review modal without changing production-like data.

## Discrepancies

1. Search filter checkbox rows 7-9 are residual false positives under this ticket's strict "genuinely has NO data-testid" rule: each live checkbox has `data-testid="e2e-checkbox"` (generic/non-unique, but not null).
2. Search rows 28-29 remain unverified trigger-gated rows and should not stay asserted in the shipping missing-testid sheet as live-null rows.

VERDICT: RED
