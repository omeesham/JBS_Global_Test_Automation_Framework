# Item Search — Search For Product Groups Test Plan

**Module**: item-search
**Submodule**: PGR (Search For Product Groups)
**Page**: Product Groups list (`/locations/1101/products/product-groups`)
**Test Entity**: Office 1101
**Governing Requirement**: NM-2258 (Automate → Product → Search For Product Groups); parent story NM-2253
**Updated**: 2026-09-09
**Total Scenarios**: 39
**Test Cases**: `item_search_product_groups_test_cases.md`
**Sibling file**: `item_search_add_product_group_test_plan.md` — the Add Product Group page (NM-2259)

---

## 1. Purpose

Cover the Product Groups list page end to end: the search panel (text box with its clear control,
the Active status switch, Reset, Search, Enter), the search contract (phrase match over Name and
Description, case and space handling, special characters, empty and no-match states), the result grid
(row click to the Edit page, status render, literal rendering of markup names, the in-flight loader),
sorting (default, per column, persistence, page reset), pagination (first/last, the page box, rows
per page and its retention), the Grid Options layout controls (hide/show, reorder, resize, Reset to
Default View), the collapsible search panel and the two return paths that restore an executed search.
The 2026-08-31 quick pass (TC-001–005, 009, 010) stays; the 2026-09-09 deep re-walk adds TC-008–062.
The create flow behind the page's Add button is the sibling sub-task NM-2259 and is planned separately.

## 2. Scope

**In scope**: everything on the list page a user can click, type into or read — see §4. One case
(TC-016) pins a confirmed defect and stays skipped until the fix lands.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| The Add Product Group page and its create flow | A separate sub-task (NM-2259), covered by the sibling Add Product Group plan |
| Editing a group on the Edit page | No ticket among NM-2253 / NM-2258 / NM-2259 covers editing (NM-1863 Won't Do); TC-019 asserts the landing only |
| The table-height layout rule (NM-1707) | A layout rule with no behavioural assertion; visual review only |
| A listing of both statuses at once | The Active checkbox is a two-way switch; no state lists active and inactive groups together |

## 3. Environment and data

Office 1101. `Audio` is the quick-pass reference search (82 groups at verification). The deep cases
use the automation-owned `ZZ E2E` family (22 groups on 2026-09-09: 17 active, 5 inactive; two pages at
20 rows) because its composition is known: `ZZ E2E Group 1788335968232` (description "Automated group
create check 1788335968232") is the single-match anchor, the `ZZ E2E Special <b>&'"</b> …` groups carry
the special characters, `ZZ E2E Inactive …` and `ZZ E2E Walk 2026-09-09 B` are the inactive rows, and
the `Automated group create check` description phrase appears in no name. Counts are asserted
relatively (page totals are computed from the count label); row assertions check per-row matching.
The create spec adds `ZZ E2E Group <timestamp>` rows over time, which only grows the family.

## Shared execution constraints

| Constraint | Consequence for execution |
|---|---|
| No auto-search on load; an empty search returns zero | Cases type their word before Search; the zero-on-empty contract is its own case, never an accident |
| A submit within about 250 ms of the last keystroke runs the previous term (known defect, TC-016) | The page object settles at least 400 ms after typing, reads the box back, then presses Enter; no case submits at once except TC-016 |
| The executed search, the Active flag, the sort, the page and the page size are restored from session storage; the grid layout from local storage | Every case starts from Reset; cases that touch sorting or the layout end with Grid Options → Reset to Default View, because the form Reset does not clear a sort |
| Nothing on this page saves | Every case here reads, resets or navigates; the module's only create lives in the NM-2259 plan |
| This page turns 20 rows per page | Pagination assertions use the 20-row size and restore it after a rows-per-page case |
| Reorder and resize are mouse-sequence drags | The page object drives them with move / press / move in steps / release; resize asserts "wider than before" plus the stored delta, not a one-to-one rendered change (BUG-CANDIDATE PGR-RESIZE-DAMPED) |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-ISR-PGR-001 | The Product Groups page loads without auto-searching | Surface — render/readiness | Yes |
| TC-ISR-PGR-002 | A search word returns matching groups | Surface — result-fidelity (QUICK) | Yes |
| TC-ISR-PGR-003 | Searching with an empty box returns zero groups | Surface — empty-vol (QUICK) | Yes |
| TC-ISR-PGR-004 | Pagination pages through at twenty rows | Surface — pagination (QUICK) | Yes |
| TC-ISR-PGR-007 | Reset clears the search and keeps the Active filter | Field (Axis 1) | Yes |
| TC-ISR-PGR-005 | An executed group search survives leaving and returning | Surface — persistence (QUICK) | Yes |
| TC-ISR-PGR-006 | Result rows show their status | Surface — render-state (QUICK) | Yes |
| TC-ISR-PGR-008 | The Enter key runs the group search | Surface — result-fidelity (DEEP) | Yes |
| TC-ISR-PGR-009 | The description column is searched too | Surface — result-fidelity (DEEP) | Yes |
| TC-ISR-PGR-010 | Search ignores case and surrounding spaces; a spaces-only search counts as empty | Surface — result-fidelity (DEEP) | Yes |
| TC-ISR-PGR-011 | Search matches the typed words in order, as one phrase | Surface — result-fidelity (DEEP) | Yes |
| TC-ISR-PGR-012 | Special characters are searched literally | Surface — result-fidelity (DEEP) | Yes |
| TC-ISR-PGR-013 | A term matching nothing shows zero groups and "No results"; a 200-character term is accepted | Surface — empty-vol (DEEP) | Yes |
| TC-ISR-PGR-014 | A single match reports a count of 1 with one row | Surface — result-fidelity (DEEP) | Yes |
| TC-ISR-PGR-017 | Clearing the Active filter lists inactive groups only | Surface — combination (QUICK) | Yes |
| TC-ISR-PGR-018 | The Active filter and its results survive a full reload | Surface — persistence (DEEP) | Yes |
| TC-ISR-PGR-019 | Clicking a result row opens that group's Edit page | Surface — render-state (DEEP) | Yes |
| TC-ISR-PGR-020 | Returning from the Edit page restores the results and the page number | Surface — persistence (DEEP) | Yes |
| TC-ISR-PGR-024 | Last and first page jumps and the page-of-total label | Surface — pagination (DEEP) | Yes |
| TC-ISR-PGR-025 | The page-number box jumps to a valid page and snaps back on invalid input | Surface — pagination (DEEP) | Yes |
| TC-ISR-PGR-026 | Rows per page offers 10 to 50 and reshapes the pages | Surface — pagination (DEEP) | Yes |
| TC-ISR-PGR-027 | The chosen rows-per-page and page survive leaving and returning | Surface — persistence (DEEP) | Yes |
| TC-ISR-PGR-029 | Results default to Name ascending | Surface — sorting (QUICK) | Yes |
| TC-ISR-PGR-030 | The Name column menu sorts descending and ascending | Surface — sorting (DEEP) | Yes |
| TC-ISR-PGR-031 | Description and Service Type sort through their column menus | Surface — sorting (DEEP) | Yes |
| TC-ISR-PGR-032 | Sorting from a later page returns to page 1 | Surface — sorting (DEEP) | Yes |
| TC-ISR-PGR-033 | The applied sort survives a new search, a Reset and a reload | Surface — persistence (DEEP) | Yes |
| TC-ISR-PGR-034 | Every column header opens a sort menu and Escape closes it | Surface — sorting (DEEP) | Yes |
| TC-ISR-PGR-035 | Grid Options hides and shows columns and remembers the choice | Surface — persistence (DEEP) | Yes |
| TC-ISR-PGR-036 | Reset to Default View restores columns, sort, page and stored preferences | Surface — persistence (DEEP) | Yes |
| TC-ISR-PGR-028 | Reset from a later page returns the pager to page 1 of 1 | Surface — pagination (DEEP) | Yes |
| TC-ISR-PGR-037 | Dragging a column header reorders the columns and the order persists | Surface — persistence (DEEP) | Yes |
| TC-ISR-PGR-038 | Dragging a column edge resizes it and the width persists | Surface — persistence (DEEP) | Yes |
| TC-ISR-PGR-039 | The search panel collapses and expands; the state is not remembered | Surface — render/readiness | Yes |
| TC-ISR-PGR-021 | The clear control empties the box but keeps the results | Field (Axis 1) | Yes |
| TC-ISR-PGR-022 | A loader shows in the search box while a search runs | Surface — render-state (DEEP) | Yes |
| TC-ISR-PGR-015 | Names containing markup render as literal text | Surface — render-state (DEEP) | Yes |
| TC-ISR-PGR-023 | The Products breadcrumb returns to the Products page | Surface — render/readiness | Yes |
| TC-ISR-PGR-016 | A search submitted within the typing debounce runs the previous term (known defect) | Surface — result-fidelity (DEEP) | Yes (skipped — known defect) |
