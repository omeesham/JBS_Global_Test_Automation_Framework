# Corporate Pricing — Import ▾ All Test Cases (NM-2265)

**Module**: corporate-pricing (import_all) | **Total**: 18 | **Status**: Automated | **Updated**: 2026-07-09

> Import ▾ All — the grid-scoped upload → browser diff → publish flow (NM-2265). Split into its own module
> (`CPR.IMA` → sheet `corporate_pricing_import_all`) so this deliverable ships independently of the rest of
> the toolbar I/O surface. Spec: `clients/encore/tests/corporate-pricing/corporate-pricing-import-all.spec.ts`.
> Cases are TC-CPR-IMA-001..018 (renumbered from the toolbar_io band TC-052..069 when split into this module).

---

## TC-CPR-IMA-001: Each Import variant opens the shared "Import" Year(s)+Currency dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. For each of the 4 Import variants: open Import and click the variant -> the "Import" dialog opens
2. Confirm the dialog prompts to select 1-3 years and a currency, offers Cancel/Continue/Close, and Continue is disabled before any field is set
3. Cancel the dialog

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
1. Open Import -> "All Equipment Pricing" -> the precondition dialog opens
2. Select a year only -> Continue stays disabled (a currency is still required)

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
1. Open Import -> "All Equipment Pricing" -> the precondition dialog opens
2. Select a currency only -> Continue stays disabled (Year(s) still required)

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
1. Open Import -> "All Equipment Pricing" -> the precondition dialog opens
2. Select a year and a currency -> Continue enables

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
1. Open the precondition dialog and select a single year -> it is accepted; cancel
2. Reopen and select three years -> all three are accepted
3. Attempt to add a fourth year (the option is present and clicked) -> the selection stays at three; the fourth is refused

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
1. Open the precondition dialog and open the Currency selector
2. Read the options -> USD, CAD, MXN present

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
1. Open the precondition dialog, set a year and a currency
2. Click Cancel -> the dialog closes and no upload dialog appears

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
1. Build a file whose values match the current server pricebook exactly
2. Open Import -> All Equipment Pricing -> set year + currency -> Continue -> the upload dialog
3. Choose the unchanged file -> the app reports there are no changes between the imported and server pricebook

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
1. Open the Import All upload dialog for a variant
2. Choose an empty CSV file -> the app reports none of the server pricebooks match the imported file; nothing is staged

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
1. Open the Import All upload dialog for a variant
2. Choose a malformed CSV (garbage rows, no valid header) -> the app reports none of the server pricebooks match; nothing is staged

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
1. Open the Import All upload dialog for a variant
2. Choose a plain-text (.txt) file -> the app shows "Unsupported file type. Allowed: .csv" and fires no import request

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
1. Open the Import All upload dialog and choose a file that changes one price -> the "Select items to publish" modal opens with the staged change
2. Click Cancel instead of Publish -> no import request fires
3. Confirm from a fresh export that the server value is unchanged

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
1. Capture the target cell's current server value from a fresh export
2. Build a file that changes only that one cell to a distinctive value; open Import All -> set year + currency -> Continue -> choose the file -> the "Select items to publish" modal stages exactly that cell (old price -> new price)
3. Select the row and Publish -> the import request returns success and a "Pricing import complete" confirmation shows
4. Reload the page (the grid still renders) and confirm from a fresh export the value is the imported one (it persisted)
5. Re-import the original value and Publish; confirm from a fresh export the value is restored

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
1. Build a file that changes one price; open Import All -> set year + currency -> Continue -> choose the file
2. Read the "Select items to publish" modal -> exactly one row shows the pricebook, product group, the old price and the new price
3. Cancel without publishing

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
1. For a bounded pairwise set of combinations across the 4 variants, a 1-year and a 3-year selection, and USD/CAD/MXN: open the variant, set Year(s) and Currency
2. Confirm Continue enables and, on Continue, the "Import All <variant>" upload dialog opens with a file input
3. Close each without choosing a file

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
1. Build an Equipment-scoped changed file
2. Open the "All Labor Pricing" import, set year + currency, Continue, and choose the Equipment file
3. The Labor pricebooks differ, so the app reports none match; nothing is staged and no import fires

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
1. Build an import file that changes TWO product-group cells in one pricebook — the throwaway target (271) and one untouched neighbour product group
2. Open the Import All flow and choose the file — both changed cells stage in the "Select items to publish" modal
3. Publish with ONLY the target row checked (the neighbour stays deselected)
4. Re-export and confirm the target committed while the deselected neighbour is unchanged; then restore the target

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
1. Pick a real Labor target live from the Labor export (a product group with a numeric price in a Labor pricebook column)
2. Build a single-cell change file for the Labor variant and open the "All Labor Pricing" import
3. Choose the file — the app stages the one Labor delta in the publish modal
4. Cancel without publishing — no Labor pricebook is mutated

**Expected**: A real Labor delta positively stages (proving staging works for a variant other than Equipment, whose pricebook population differs); Cancel commits nothing and no import request fires.
**Data**: office=1604, variant=All Labor Pricing, year=2026, currency=USD, target picked live from the Labor export (non-committing)
