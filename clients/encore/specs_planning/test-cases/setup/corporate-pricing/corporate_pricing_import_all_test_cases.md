# Corporate Pricing — Import ▾ All Test Cases (NM-2265)

**Module**: corporate-pricing (import_all) | **Total**: 18 | **Status**: Automated | **Updated**: 2026-07-09

> Import ▾ All — the grid-scoped upload → browser diff → publish flow (NM-2265). Split into its own module
> (`CPR.IMA` → sheet `corporate_pricing_import_all`) so this deliverable ships independently of the rest of
> the toolbar I/O surface. Spec: `clients/encore/tests/corporate-pricing/corporate-pricing-import-all.spec.ts`.
> Cases are TC-CPR-IMA-001..018 (renumbered from the toolbar_io band TC-052..069 when split into this module).

---

## FIELD INVENTORY

| Field | Control Type | Default | Required |
|---|---|---|---|
| Import ▾ trigger | Dropdown trigger button | Closed | Not applicable |
| Import ▾ › All Equipment Pricing | Menu item | Not applicable | Not applicable |
| Import ▾ › All Labor Pricing | Menu item | Not applicable | Not applicable |
| Import ▾ › All Equipment Max Discount | Menu item | Not applicable | Not applicable |
| Import ▾ › All Labor Max Discount | Menu item | Not applicable | Not applicable |
| Year(s) (precondition dialog) | Multi-select combobox (Radix popover) | None selected | Yes (1–3 selections) |
| Currency (precondition dialog) | Single-select combobox | None selected | Yes |
| Continue (precondition dialog) | Button | Disabled | Not applicable |
| Cancel (precondition dialog) | Button | Enabled | Not applicable |
| File input (upload dialog) | File input (accept=.csv) | No file selected | Yes |
| Browse (upload dialog) | Button | Enabled | Not applicable |
| Upload (upload dialog) | Button | Disabled | Not applicable |
| Cancel (upload dialog) | Button | Enabled | Not applicable |
| Staged row checkboxes (publish modal) | Checkbox | Unchecked | Yes (≥1 to enable Publish) |
| Publish (publish modal) | Button | Disabled | Not applicable |
| Cancel (publish modal) | Button | Enabled | Not applicable |

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| Year(s) selection is required | Continue stays disabled while no year is selected |
| Currency selection is required | Continue stays disabled while no currency is selected |
| Year(s) maximum is 3 | Selecting a fourth year is refused; selection stays at 3 |
| Continue is gated on both Year(s) and Currency | Continue enables only when at least one year and a currency are both set |
| File must be CSV | Non-CSV files are rejected client-side with "Unsupported file type" before any network request |
| Upload is gated on file selection | Upload button stays disabled until a file is chosen |
| Publish is gated on at least one staged row | Publish button stays disabled until at least one row checkbox is checked |

---

## MCP_VERIFICATION_LOG

Observed on office 1604 in the session recorded in the field inventory
`corporate-pricing-import-all-2026-07-21.md` (live walk 2026-07-21, headless Playwright script,
storageState `encore-state.json`). Each row is an observation, not an expectation. Rows marked
"Not settled" are recorded because they were reached for and not resolved; no test case asserts them
as fact.

| # | Verified | Result |
|---|---|---|
| 1 | Import ▾ trigger present; 4 variants | Labels identical to Export ▾: "All Equipment Pricing", "All Labor Pricing", "All Equipment Max Discount", "All Labor Max Discount" |
| 2 | Precondition dialog — Year(s) and Currency both required | Continue button disabled until both fields are set; live-verified |
| 3 | Year(s) combobox option count and selection cap | 8 options (2021–2028); a 4th selection is refused (stays at 3) |
| 4 | Currency combobox options | 3 options: USD, CAD, MXN |
| 5 | Upload dialog testid | `corporate-pricing-import-dialog` confirmed present live 2026-07-21 |
| 6 | File input accept constraint | accept=.csv only; non-CSV rejected client-side as "Unsupported file type" before any network request |
| 7 | File display default text | "No file selected"; shows "Attached file / {filename}" after a file is chosen |
| 8 | Upload button gate | Disabled until a file is chosen; enables on file selection |
| 9 | "No changes" outcome message | "There are no changes between the imported and server pricebook" (shown when the file matches server exactly) |
| 10 | "No matching pricebooks" outcome message | "None of the pricebooks on the server match the imported pricebook" (shown for empty or malformed CSV) |
| 11 | Publish modal row-selection gate | Publish button disabled until at least one staged row is checked; "Total Items" count displayed |
| 12 | Publish success toast | "Pricing import complete. There were N pricing change updates." |
| 13 | Precondition dialog data-testid coverage | Zero data-testid attributes on all precondition dialog elements — **Not settled** (tracked in testid-gap-report; locators use role/aria-label/text) |

---
## TC-CPR-IMA-001: Each Import variant opens the shared "Import" Year(s)+Currency dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | For each of the 4 Import variants: open Import and click the variant -> the "Import" dialog opens | The same Import Year(s)+Currency precondition dialog opens for each of the 4 variants clicked. |
| 2 | Confirm the dialog prompts to select 1-3 years and a currency, offers Cancel/Continue/Close, and Continue is disabled before any field is set | The dialog prompts for 1-3 years and a currency, offers Cancel, Continue and Close, and Continue is disabled before any field is set. |
| 3 | Cancel the dialog | Every Import variant opens the same "Import" Year(s)+Currency precondition dialog with Continue disabled until both fields are set |

**Expected**: Every Import variant opens the same "Import" Year(s)+Currency precondition dialog with Continue disabled until both fields are set.
**Data**: office=1604

---

## TC-CPR-IMA-002: Continue stays disabled with only Year(s) set
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Import -> "All Equipment Pricing" -> the precondition dialog opens | The Import Year(s)+Currency precondition dialog opens with Continue disabled. |
| 2 | Select a year only -> Continue stays disabled (a currency is still required) | Setting only Year(s) does not enable Continue |

**Expected**: Setting only Year(s) does not enable Continue.
**Data**: office=1604, year=2026

---

## TC-CPR-IMA-003: Continue stays disabled with only Currency set
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Import -> "All Equipment Pricing" -> the precondition dialog opens | The Import Year(s)+Currency precondition dialog opens with Continue disabled. |
| 2 | Select a currency only -> Continue stays disabled (Year(s) still required) | Setting only Currency does not enable Continue |

**Expected**: Setting only Currency does not enable Continue.
**Data**: office=1604, currency=USD

---

## TC-CPR-IMA-004: Continue enables when BOTH Year(s) and Currency are set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Import -> "All Equipment Pricing" -> the precondition dialog opens | The Import Year(s)+Currency precondition dialog opens with Continue disabled. |
| 2 | Select a year and a currency -> Continue enables | Continue enables only once both Year(s) and Currency are set |

**Expected**: Continue enables only once both Year(s) and Currency are set.
**Data**: office=1604, year=2026, currency=USD

---

## TC-CPR-IMA-005: Year(s) boundary — 1 accepted, 3 accepted, a 4th refused
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the precondition dialog and select a single year -> it is accepted | The precondition dialog opens and one year is accepted in the Year(s) selector. |
| 2 | cancel | The dialog closes without proceeding to the upload step. |
| 3 | Reopen and select three years -> all three are accepted | The dialog reopens and three years are shown as selected in the Year(s) selector. |
| 4 | Attempt to add a fourth year (the option is present and clicked) -> the selection stays at three | After clicking a fourth year option, the Year(s) selector still shows exactly three years selected. |
| 5 | the fourth is refused | The Year(s) selector holds at three selections; the fourth year is not added. |

**Expected**: The Year(s) selector accepts 1 to 3 years; a fourth selection is refused (stays at three).
**Data**: office=1604, years=2026/2027/2028, attempted-fourth=2025

---

## TC-CPR-IMA-006: Currency options present — USD, CAD, MXN
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the precondition dialog and open the Currency selector | The precondition dialog opens and the Currency selector expands to show its options. |
| 2 | Read the options -> USD, CAD, MXN present | The Currency selector offers USD, CAD and MXN |

**Expected**: The Currency selector offers USD, CAD and MXN.
**Data**: office=1604

---

## TC-CPR-IMA-007: Cancel on the precondition dialog aborts — no upload dialog opens
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the precondition dialog, set a year and a currency | The precondition dialog opens with the selected year and currency set and Continue enabled. |
| 2 | Click Cancel -> the dialog closes and no upload dialog appears | Cancelling the precondition dialog aborts the flow before the upload dialog opens |

**Expected**: Cancelling the precondition dialog aborts the flow before the upload dialog opens.
**Data**: office=1604, year=2026, currency=USD

---

## TC-CPR-IMA-008: An unchanged file diffs to "no changes" and offers nothing to publish
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Build a file whose values match the current server pricebook exactly | The generated file's values match the current server pricebook exactly. |
| 2 | Open Import -> All Equipment Pricing -> set year + currency -> Continue -> the upload dialog | The Import Year(s)+Currency precondition dialog opens. |
| 3 | Choose the unchanged file -> the app reports there are no changes between the imported and server pricebook | An unchanged file is detected as no-change; nothing is staged and nothing can be published |

**Expected**: An unchanged file is detected as no-change; nothing is staged and nothing can be published.
**Data**: office=1604, variant=All Equipment Pricing, year=2026, currency=USD

---

## TC-CPR-IMA-009: An empty file is rejected as "no matching pricebooks" and runs no import
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Import All upload dialog for a variant | The Import All upload dialog opens for the selected variant. |
| 2 | Choose an empty CSV file -> the app reports none of the server pricebooks match the imported file | The app reports that no server pricebooks match the uploaded empty file. |
| 3 | nothing is staged | No import is staged and nothing can be published. |

**Expected**: An empty file is rejected as no-match and no import runs.
**Data**: office=1604, variant=All Equipment Pricing, year=2026, currency=USD

---

## TC-CPR-IMA-010: A malformed CSV is rejected as "no matching pricebooks" and runs no import
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Import All upload dialog for a variant | The Import All upload dialog opens for the selected variant. |
| 2 | Choose a malformed CSV (garbage rows, no valid header) -> the app reports none of the server pricebooks match | The app reports that no server pricebooks match the uploaded malformed file. |
| 3 | nothing is staged | No import is staged and nothing can be published. |

**Expected**: A malformed CSV is rejected as no-match and no import runs.
**Data**: office=1604, variant=All Equipment Pricing, year=2026, currency=USD

---

## TC-CPR-IMA-011: A non-CSV file is rejected by type before any network
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Import All upload dialog for a variant | The Import All upload dialog opens with a file input control. |
| 2 | Choose a plain-text (.txt) file -> the app shows "Unsupported file type. Allowed: .csv" and fires no import request | A non-CSV file is rejected client-side by type; no import request is sent |

**Expected**: A non-CSV file is rejected client-side by type; no import request is sent.
**Data**: office=1604, variant=All Equipment Pricing, year=2026, currency=USD

---

## TC-CPR-IMA-012: Cancelling the publish modal after staging changes commits nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Import All upload dialog and choose a file that changes one price -> the "Select items to publish" modal opens with the staged change | The changed price stages as a delta row in the Select items to publish modal. |
| 2 | Click Cancel instead of Publish -> no import request fires | The Select items to publish modal closes and the staged change is discarded. |
| 3 | Confirm from a fresh export that the server value is unchanged | Cancelling after staging commits nothing; the server value is unchanged |

**Expected**: Cancelling after staging commits nothing; the server value is unchanged.
**Data**: office=1604, variant=All Equipment Pricing, year=2026, currency=USD, product group 271 / pricebook 2026-LV-PB-9025

---

## TC-CPR-IMA-013: Import All publishes a changed price, it persists across reload, then restores
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded. Mutation-safe: mutates one product-group price in one pricebook (2026-LV-PB-9025 / product group 271) that no other test reads, and restores it.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Capture the target cell's current server value from a fresh export | The fresh export shows the target cell's current baseline server value. |
| 2 | Build a file that changes only that one cell to a distinctive value | The generated file changes only the target cell, to the distinctive value. |
| 3 | open Import All -> set year + currency -> Continue -> choose the file -> the "Select items to publish" modal stages exactly that cell (old price -> new price) | The Import All upload dialog opens with a file input control. |
| 4 | Select the row and Publish -> the import request returns success and a "Pricing import complete" confirmation shows | The selected row publishes and the Select items to publish modal closes. |
| 5 | Reload the page (the grid still renders) and confirm from a fresh export the value is the imported one (it persisted) | After reload the grid still renders, and a fresh export shows the target cell holding the imported value. |
| 6 | Re-import the original value and Publish | The original value publishes and the Select items to publish modal closes. |
| 7 | confirm from a fresh export the value is restored | A published change persists across reload, and the value can be restored to its original - proven by re-downloading the export both times |

**Expected**: A published change persists across reload, and the value can be restored to its original — proven by re-downloading the export both times.
**Data**: office=1604, variant=All Equipment Pricing, year=2026, currency=USD, product group 271 / pricebook 2026-LV-PB-9025, imported value 424.24

---

## TC-CPR-IMA-014: The staged delta shows the exact changed cell (old price → new price), then Cancel commits nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Build a file that changes one price | The generated file contains a single changed price, with all other cells unchanged. |
| 2 | open Import All -> set year + currency -> Continue -> choose the file | The Import All upload dialog opens with a file input control. |
| 3 | Read the "Select items to publish" modal -> exactly one row shows the pricebook, product group, the old price and the new price | The Select items to publish modal lists the one changed row with pricebook, product group, old and new price. |
| 4 | Cancel without publishing | The staged delta reflects the file precisely (one row: correct pricebook, product group, old price, new price); cancelling commits nothing |

**Expected**: The staged delta reflects the file precisely (one row: correct pricebook, product group, old price, new price); cancelling commits nothing.
**Data**: office=1604, variant=All Equipment Pricing, year=2026, currency=USD, product group 271 / pricebook 2026-LV-PB-9025

---

## TC-CPR-IMA-015: Combination — a bounded pairwise of variant × Year(s) × Currency all reach the upload dialog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | For a bounded pairwise set of combinations across the 4 variants, a 1-year and a 3-year selection, and USD/CAD/MXN: open the variant, set Year(s) and Currency | Each variant's precondition dialog accepts the selected Year(s) and Currency combination. |
| 2 | Confirm Continue enables and, on Continue, the "Import All <variant>" upload dialog opens with a file input | Continue enables, and clicking it opens the correctly titled Import All upload dialog with a file input. |
| 3 | Close each without choosing a file | Every variant x Year(s) x Currency combination in the pairwise set enables Continue and opens the correct titled upload dialog |

**Expected**: Every variant × Year(s) × Currency combination in the pairwise set enables Continue and opens the correct titled upload dialog.
**Data**: office=1604, 4 variants × {1 year, 3 years} × {USD, CAD, MXN}

---

## TC-CPR-IMA-016: An Equipment file imported into the Labor variant matches no pricebooks (no commit)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Build an Equipment-scoped changed file | The generated file contains a changed price scoped to an Equipment pricebook. |
| 2 | Open the "All Labor Pricing" import, set year + currency, Continue, and choose the Equipment file | The All Labor Pricing upload dialog opens, Continue enables, and the Equipment file is accepted for upload. |
| 3 | The Labor pricebooks differ, so the app reports none match | The app reports that no pricebooks match the uploaded file. |
| 4 | nothing is staged and no import fires | Feeding an Equipment file into the Labor import matches no pricebooks and commits nothing |

**Expected**: Feeding an Equipment file into the Labor import matches no pricebooks and commits nothing.
**Data**: office=1604, file variant=Equipment, import variant=All Labor Pricing, year=2026, currency=USD

---

## TC-CPR-IMA-017: Publishing a subset of staged rows commits only the selected rows
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded; the throwaway target cell at its captured baseline.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Build an import file that changes TWO product-group cells in one pricebook — the throwaway target (271) and one untouched neighbour product group | The generated file changes two product-group cells in one pricebook: the target (271) and one neighbouring group. |
| 2 | Open the Import All flow and choose the file — both changed cells stage in the "Select items to publish" modal | The Select items to publish modal lists both changed rows: the target and the neighbouring product group. |
| 3 | Publish with ONLY the target row checked (the neighbour stays deselected) | Only the checked target row publishes and the modal closes. |
| 4 | Re-export and confirm the target committed while the deselected neighbour is unchanged | A fresh export shows the target product group updated while the neighbouring product group is unchanged. |
| 5 | then restore the target | Both cells stage; publishing a strict subset commits only the checked row - the deselected staged row is left unchanged (only selected staged rows publish) |

**Expected**: Both cells stage; publishing a strict subset commits only the checked row — the deselected staged row is left unchanged (only selected staged rows publish).
**Data**: office=1604, variant=All Equipment Pricing, year=2026, currency=USD, pricebook 2026-LV-PB-9025, rows: target 271 + one untouched neighbour PG

---

## TC-CPR-IMA-018: A Labor-variant change stages a delta, then Cancel commits nothing
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Pick a real Labor target live from the Labor export (a product group with a numeric price in a Labor pricebook column) | The Labor export identifies a valid product group with a numeric price in a Labor pricebook column. |
| 2 | Build a single-cell change file for the Labor variant and open the "All Labor Pricing" import | The single-cell change file loads and the All Labor Pricing upload dialog opens. |
| 3 | Choose the file — the app stages the one Labor delta in the publish modal | The Select items to publish modal stages the one Labor delta row. |
| 4 | Cancel without publishing — no Labor pricebook is mutated | A real Labor delta positively stages (proving staging works for a variant other than Equipment, whose pricebook population differs); Cancel commits nothing and no import request fires |

**Expected**: A real Labor delta positively stages (proving staging works for a variant other than Equipment, whose pricebook population differs); Cancel commits nothing and no import request fires.
**Data**: office=1604, variant=All Labor Pricing, year=2026, currency=USD, target picked live from the Labor export (non-committing)
