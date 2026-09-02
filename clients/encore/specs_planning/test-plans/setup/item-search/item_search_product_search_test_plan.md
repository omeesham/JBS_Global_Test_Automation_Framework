# Item Search — Product Search Test Plan

**Module**: item-search
**Submodule**: PRS
**Page**: Products (`/locations/1101/products`) — search panel + result grid
**Test Entity**: Office 1101
**Governing Requirement**: NM-2253
**Updated**: 2026-09-02
**Total Scenarios**: 32
**Test Cases**: `item_search_product_search_test_cases.md`

---

## 1. Purpose

Cover the Products search page pinned to office 1101 (an admin-only feature): the search panel
(keyword radio, Any Field, barcode, two filter checkboxes, Location/Region dropdowns, Product
Organization multi-select, two date fields), the Search/Reset actions, the 13-column result grid
with menu-driven sorting, pagination, Grid Options column management, tooltips, and the
app-managed restore of executed searches.

## 2. Scope

**In scope**: field-level verification of every search-panel control; word-search fidelity;
no-match empty state; quantity filter narrowing; location/region mutual exclusivity; option-set
reads for both dropdowns and the organization popover; one sort flip and restore; one pagination
move plus the size options; the Grid Options hide/restore cycle; the leave-and-return restore of
an executed search; panel collapse; the tooltip set.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| Date-driven result behavior | Product owner ruling: dates do not shape RESULTS yet — result-side cases wait on that. The pair's own validation and its render integrity ARE covered (rows 20–21 below, added 2026-09-01 at the owner's request after a live validation message and a value-overspill defect surfaced) |
| Positive barcode filtering | The owner will supply real barcode numbers; the case lands as a follow-up when the data arrives |
| Region/location result reshaping | Needs region-tagged expected data; the exclusivity contract is covered, the result contents are not |
| Per-column menus beyond Category and Owned | Same menu on all 13 columns; the remaining 11 ride the deeper pass |
| Column resize, direct page-number entry, last-page jump | Layout drag mechanics and extra pagination affordances are deeper-pass items |
| Row-selection toolbar and its dialogs | Covered by the Product Code plan (`item_search_product_code_test_plan.md`) |

## 3. Environment and data

Office 1101 only (plan-pinned; the feature is admin-scoped). The unfiltered set held 15,874
products at verification; counts are asserted relatively (drops below the unfiltered total,
returns to it) — never as absolute numbers. `Amp` is the reference search word (376 matches at
verification, all rows matching).

## Shared execution constraints

| Constraint | Consequence for execution |
|---|---|
| Results only load on Search; Reset empties to zero until the next Search | Cases click Search themselves and never treat the post-Reset zero as a failure |
| Executed criteria, results and sort order are restored on later visits | Every case starts from Reset (or sets its own criteria); defaults are asserted immediately after Reset, never on a bare load |
| The page hydrates in stages (~20s cold, ~11s per unfiltered search) | Readiness gates on the loading-placeholder census reaching zero — never on row count |
| Sorting flips only through the column-header menu | Cases open the menu; a bare header click is not a sort action |
| Cell tooltips fire only on cut-off text | The tooltip case computes the cut-off state on each cell's inner text element (the cell box always reads as fitting) instead of hardcoding a product; measurement point pinned 2026-09-01 |
| Office 1101 is live shared data | This plan's cases mutate nothing but filter state; each restores defaults via Reset |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-ISR-PRS-001 | The Products page loads with the search panel and grid ready | Surface — render/readiness | Yes |
| TC-ISR-PRS-002 | Reset restores the default criteria and empties the results | Field (Axis 1) | Yes |
| TC-ISR-PRS-003 | An Any Field word returns only matching products | Surface — result-fidelity (QUICK) | Yes |
| TC-ISR-PRS-004 | Search help opens guidance for the selected search type | Field (Axis 1) | Yes |
| TC-ISR-PRS-005 | The header icons show their tooltips | Field (Axis 1) | Yes |
| TC-ISR-PRS-006 | Grid cells show a tooltip only when their text is cut off | Surface — render detail | Yes |
| TC-ISR-PRS-007 | The Location dropdown lists offices | Field (Axis 1) | Yes |
| TC-ISR-PRS-008 | The Region dropdown lists regions | Field (Axis 1) | Yes |
| TC-ISR-PRS-009 | Location and Region clear each other | Surface — combination (QUICK) | Yes |
| TC-ISR-PRS-010 | The Product Organization popover offers the country checklist | Field (Axis 1) | Yes |
| TC-ISR-PRS-011 | The date fields open a calendar with a time spinner | Field (Axis 1) — field-level per owner ruling | Yes |
| TC-ISR-PRS-012 | Quantity Greater Than Zero narrows the results | Surface — combination (QUICK) | Yes |
| TC-ISR-PRS-013 | A barcode with no match shows the empty state | Surface — empty-vol (QUICK) | Yes |
| TC-ISR-PRS-014 | Sorting flips through the column menu | Surface — sorting (QUICK) | Yes |
| TC-ISR-PRS-015 | Pagination moves between pages | Surface — pagination (QUICK) | Yes |
| TC-ISR-PRS-016 | Rows-per-page offers five sizes | Surface — pagination (QUICK) | Yes |
| TC-ISR-PRS-017 | Grid Options hides and restores a column | Field (Axis 1) | Yes |
| TC-ISR-PRS-018 | An executed search survives leaving and returning | Surface — persistence (QUICK) | Yes |
| TC-ISR-PRS-019 | The search panel collapses and expands | Field (Axis 1) | Yes |
| TC-ISR-PRS-020 | A Prep date after the Return date is rejected with a message | Field (Axis 1) — cross-field validation | Yes |
| TC-ISR-PRS-021 | A date value renders fully inside its box in every month | Surface — render detail (expected-to-fail on a reported defect) | Yes |
| TC-ISR-PRS-022 | A numeric barcode returns the single product it is scanned under | Surface — result-fidelity (QUICK) | Yes |
| TC-ISR-PRS-023 | A barcode with letters resolves the same way as a numeric one | Surface — result-fidelity (QUICK) | Yes |
| TC-ISR-PRS-024 | Different barcodes on the same product all return that product | Surface — result-fidelity (QUICK) | Yes |
| TC-ISR-PRS-025 | Barcode matching ignores letter case | Field (Axis 1) — case handling | Yes |
| TC-ISR-PRS-026 | A shortened barcode matches nothing | Field (Axis 1) — negative/BVA with positive control | Yes |
| TC-ISR-PRS-027 | The barcode box and the Any Field box clear each other | Surface — combination (QUICK) | Yes |
| TC-ISR-PRS-028 | A barcode search survives leaving and returning | Surface — persistence (QUICK) | Yes |
| TC-ISR-PRS-029 | A product found by barcode opens in the product-code dialog | Surface — combination (QUICK) | Yes |
| TC-ISR-PRS-030 | The barcode box stops accepting characters at its limit | Field (Axis 1) — length boundary per NM-1494 | Yes |
| TC-ISR-PRS-031 | The Active filter narrows the results to active products | Surface — combination (QUICK) | Yes |
| TC-ISR-PRS-032 | The Product Organization filter narrows the results and clearing it restores them | Surface — combination (QUICK) | Yes |
