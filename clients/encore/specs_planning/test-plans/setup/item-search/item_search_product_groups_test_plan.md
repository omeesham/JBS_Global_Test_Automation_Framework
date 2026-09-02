# Item Search — Product Groups Test Plan

**Module**: item-search
**Submodule**: PGR
**Page**: Product Groups (`/locations/1101/products/product-groups`) + its Add page
**Test Entity**: Office 1101
**Governing Requirement**: NM-2253
**Updated**: 2026-09-02
**Total Scenarios**: 11
**Test Cases**: `item_search_product_groups_test_cases.md`

---

## 1. Purpose

Cover the Product Groups sibling page: its search panel (text + Active checkbox + Reset/Search),
the 4-column result grid at its 20-row page size, the zero-on-empty search contract, the
leave-and-return restore, and the Add page's required-empty form with its two-panel sub-class
picker. One case goes the whole way: it completes the Add page, saves a new group, and proves it
persists by finding it again.

## 2. Scope

**In scope**: load-without-auto-search; word-search fidelity; the empty-criteria zero contract;
one pagination move + the 20-row default; Reset behavior; the Add page's field-level form state
(required flags, held-back Save, checked Active, picker structure); Cancel's silent discard;
persistence of an executed search; the Status column render; one real create — a completed Add
page saves a new group (sub-class added by double-click) and is found again by search.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| The drag path for adding a sub-class | The reliable double-click path is covered by the create case (TC-ISR-PGR-011); drag is flaky and frequently never fires the drop, so it rides the deeper pass |
| Column sorting on this grid | The per-column menus were enumerated but not probed at this tier; the deferral rows carry them to the deeper pass |
| The Service Type dropdown's option set on the Add page | Unenumerated at this tier |
| Inactive-group rendering | Needs the Active filter unchecked plus known inactive data |
| The "Products" back-link | Enumerated but unprobed; the toolbar route from the Products page is the covered entry |

## 3. Environment and data

Office 1101. `Audio` is the reference search (82 groups at verification, 20-row first page).
Counts are asserted relatively; row assertions check per-row matching, not totals.

## Shared execution constraints

| Constraint | Consequence for execution |
|---|---|
| No auto-search on load; an empty search returns zero | Cases type their word before Search; the zero-on-empty contract is its own case, never an accident |
| Executed searches are restored on return; unsearched text is dropped | Cases start from Reset when they need a clean box |
| The Add page is a route, not a dialog | Leaving it is navigation; Cancel is the covered exit |
| Only the one create case persists | Every other case clicks no Save; Cancel discards every typed value. TC-ISR-PGR-011 is the single exception — it saves a per-run unique group, proven by search-back, leaving the record as accepted e2e residue (LR-ENC-007) |
| This page turns 20 rows per page | Pagination assertions use the 20-row size, not the Products page's 50 |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-ISR-PGR-001 | The Product Groups page loads without auto-searching | Surface — render/readiness | Yes |
| TC-ISR-PGR-002 | A search word returns matching groups | Surface — result-fidelity (QUICK) | Yes |
| TC-ISR-PGR-003 | Searching with an empty box returns zero groups | Surface — empty-vol (QUICK) | Yes |
| TC-ISR-PGR-004 | Pagination pages through at twenty rows | Surface — pagination (QUICK) | Yes |
| TC-ISR-PGR-005 | Reset clears the search and keeps the Active filter | Field (Axis 1) | Yes |
| TC-ISR-PGR-006 | The Add page opens with a held-back Save | Field (Axis 1) | Yes |
| TC-ISR-PGR-007 | The sub-class picker shows its two panels | Field (Axis 1) | Yes |
| TC-ISR-PGR-008 | Cancel leaves the Add page without saving | Field (Axis 1) — guard behavior | Yes |
| TC-ISR-PGR-009 | An executed group search survives leaving and returning | Surface — persistence (QUICK) | Yes |
| TC-ISR-PGR-010 | Result rows show their status | Surface — render-state (QUICK) | Yes |
| TC-ISR-PGR-011 | A completed Add page saves a new product group and it is found again | Field (Axis 1) — create + persistence (LR-067) | Yes |
