# Item Search — Search For Product Groups Test Plan

**Module**: item-search
**Submodule**: PGR (Search For Product Groups)
**Page**: Product Groups list (`/locations/1101/products/product-groups`)
**Test Entity**: Office 1101
**Governing Requirement**: NM-2258 (Automate → Product → Search For Product Groups); parent story NM-2253
**Updated**: 2026-09-08
**Total Scenarios**: 7
**Test Cases**: `item_search_product_groups_test_cases.md`
**Sibling file**: `item_search_add_product_group_test_plan.md` — the Add Product Group page (NM-2259)

---

## 1. Purpose

Cover the Product Groups sibling page: its search panel (text + Active checkbox + Reset/Search),
the 4-column result grid at its 20-row page size, the zero-on-empty search contract, the
leave-and-return restore, and the Status column render. The create flow behind the page's Add
button is the sibling sub-task NM-2259 and is planned separately.

## 2. Scope

**In scope**: load-without-auto-search; word-search fidelity; the empty-criteria zero contract;
one pagination move + the 20-row default; Reset behavior; persistence of an executed search; the
Status column render.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| The Add Product Group page and its create flow | A separate sub-task (NM-2259), covered by the sibling Add Product Group plan |
| Column sorting on this grid | The per-column menus were enumerated but not probed at this tier; the deferral rows carry them to the deeper pass |
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
| Nothing on this page saves | Every case here reads or resets; the module's only create lives in the NM-2259 plan |
| This page turns 20 rows per page | Pagination assertions use the 20-row size, not the Products page's 50 |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-ISR-PGR-001 | The Product Groups page loads without auto-searching | Surface — render/readiness | Yes |
| TC-ISR-PGR-002 | A search word returns matching groups | Surface — result-fidelity (QUICK) | Yes |
| TC-ISR-PGR-003 | Searching with an empty box returns zero groups | Surface — empty-vol (QUICK) | Yes |
| TC-ISR-PGR-004 | Pagination pages through at twenty rows | Surface — pagination (QUICK) | Yes |
| TC-ISR-PGR-005 | Reset clears the search and keeps the Active filter | Field (Axis 1) | Yes |
| TC-ISR-PGR-009 | An executed group search survives leaving and returning | Surface — persistence (QUICK) | Yes |
| TC-ISR-PGR-010 | Result rows show their status | Surface — render-state (QUICK) | Yes |
