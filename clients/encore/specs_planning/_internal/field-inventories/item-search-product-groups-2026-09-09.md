# Field Inventory — Item Search: Product Groups list page (PGR) — deep re-walk

**Module**: item-search-product-groups
**Client**: encore
**MCP_Session_Date**: 2026-09-09
**MCP_Session_Tool**: Playwright CLI (`playwright-cli`, session `pgr`, state-load of the suite's auth) + `scripts/walk-coverage/enumerate-page.mjs` for the machine denominator (exit 0 once the list config stopped following the Add button — see Completion_Record) + eight standalone Playwright probe scripts kept beside their outputs in `.playwright-cli/pgr-2026-09-09/` (mouse-sequence drags, an in-page MutationObserver for the loader, fresh-context timing runs)
**MCP_Tool_Reason**: Unattended catalog walk with on-disk YAML snapshots, DOM reads and screenshots (LR-038 v2). Drags and sub-second timing need raw `mouse.move/down/move/up` and page-side observers the CLI does not expose, so those probes run as scripts against the same saved auth state.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups
**Test_Entity**: Office 1101 - Corporate Office Encore USA SGA (admin-only feature; plan-pinned)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md
**Stale_After**: 2026-10-09
**Walk_Mode**: deep

Coverage_Ratio: 27/27 (100%) — the machine denominator (resting + search:executed, one run), every row dispositioned in the Coverage Manifest. Nine further agent-census keys cover the states the enumerator cannot reach (a populated grid, opened menus, the collapsed panel, the Edit-page landing); all nine are dispositioned in the State supplements.
Completion_Record: reports/walk-coverage/1101-item-search-product-groups.json (status=complete, elements=27, raw=32 before archetype collapse). Produced 2026-09-09 after the list module's `dialog:add-group` opener was removed from the enumerator config: the Add button is a route to the Add Product Group page, which has its own config, and following it hung the 2026-09-09 run on that page's 7,394-row catalog (the 2026-08-31 branch snapshotted before the route change and only duplicated the list keys).
Walk_State: office=1101 module=item-search-product-groups walked=[resting,search:executed] (machine) + [search:populated, active:off, sort:name|description|service-type, menu:column×4, menu:grid-options, rows-per-page:open, page:2-of-2|3-of-3, panel:collapsed, row:edit-landing, reload:restored] (agent)
CrossCheck: clean — the A△B review set holds 8 elements (the four header cells and the four pager buttons, A-only because none is focusable at rest: the cells are not tabbable and the pager is disabled without results); each is classified in the manifest.
jira_tickets: [NM-2253, NM-2258, NM-972, NM-1617, NM-1618, NM-1620, NM-1622, NM-1633, NM-1756, NM-1852, NM-1909, NM-1910, NM-1924, NM-1939, NM-2064, NM-1707, NM-1644, NM-1863]
Provenance: RE-WALK (deep tier) of `item-search-product-groups-2026-08-31.md` (quick tier). Every one of that artifact's 15 `deferred-to-DEEP` rows is dispositioned here from live evidence; nothing is inherited from the quick pass without a fresh probe.
Subtask_Ownership: NM-2258 (Search For Product Groups) owns this artifact and TC-ISR-PGR-001–005, 009, 010, 031–062. NM-2259 (Create new Product Groups) owns `item-search-add-product-group-2026-09-09.md`.
baselineScope: baseline-absent (environment-blocked — see Baseline_Artifact; the old site could not be reached by automated browsers on 2026-08-31 and was not retried here)

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups` — the list page: a search panel (text box, Active checkbox, Reset, Search), a toolbar (count label, Add, Grid Options), a 4-column grid (Name, Description, Service Type, Status) and a pager (rows-per-page, first/previous/next/last, a page-number box with a "/ N" total).
- `…/products/product-groups/edit/4583`, `…/edit/4594`, `…/edit/4596` — the Edit Product Group page a result row opens (NM-972 AC-4). Walked only as the landing target: heading "Edit", the row's Name and Description in the form, Active checked, a "Not Priced" badge, a translations button, Save disabled at rest, Cancel enabled, breadcrumb Products › Product Groups. Editing itself has no ticket among NM-2253/2258/2259.
- `…/products` — the Products page, reached by the Products breadcrumb (probed for navigation and once as the sibling grid for the resize comparison).

## Live-state caveat

| Field | Live (2026-09-09) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Search text, Active, sort, page, rows-per-page | the last EXECUTED search — text, Active flag, `sortBy`/`sortDirection`, `pageIndex`, `pageSize` | empty box, Active checked, Name ascending, page 1, 20 rows | `sessionStorage['navigator:productGroups:searchState']` (+ `…:hasSearched`) is written on every submit, page move, sort and size change and is replayed on reload, on browser Back and on the breadcrumb return (NM-1924, NM-1910). A fresh browser context starts clean. |
| Column visibility, order, width | the user's last grid layout | all four columns, default order, default widths | `localStorage['product-groups-table-settings']` = `{columnVisibility, columnOrder, columnSizing, sorting: []}` (NM-1852). `sorting` stays `[]` there — the applied sort lives in the session state above. |
| Grid rows | the restored result set (or empty) | empty until Search | same session-state replay; no auto-search on a clean context. |

## Jira/Confluence Findings (PLN-051 / LR-063)

Tool: Rovo Jira (`getJiraIssue` / `searchJiraIssuesUsingJql`) earlier this session; every fact below was re-verified live before it entered a case.

| Ticket | Intent (Jira) | Live on 2026-09-09 | Classification → case |
|---|---|---|---|
| NM-2253 / NM-2258 | Parent story / sub-task: automate the Product Groups search page | this artifact's scope | scope only |
| NM-972 | Product Groups story: no results until a search; search matches Name and Description; row click opens the Update page; paginated grid | no auto-search on a clean context; "Automated group create check" (a description-only phrase) returns 15 rows; any cell of a row opens `/edit/<id>`; 20-row pages | consistent → TC-001, 009, 019, 004 |
| NM-1617 | Enter in the search box must trigger the search | Enter and the Search button return the same 22 rows | fixed as stated → TC-008 |
| NM-1618 | Default order is Name ascending (A → Z) | the first page ascends with letter case ignored (`<` still sorts before `A`; the case-insensitive collation was proven 2026-09-10 on the Description column: descending reads walk, Toast, special, Probe, Automated); the Name header carries the ascending arrow from the first render — at rest, after a search and after Reset to Default View (spot-check 2026-09-09 15:40Z, fresh context; an earlier draft of this row said "no arrow until a sort" — wrong, corrected before the specs were written) | fixed as stated → TC-029 |
| NM-1620, NM-1756 | Names with special characters are searchable, fully and partially; a special character is part of the term, not ignored | `&'` and `<b>` each return exactly the 5 groups carrying them; `%` returns only the 4 names containing a literal `%`; `_` and `@` find nothing (no such names) — no wildcard behaviour | fixed as stated → TC-012 |
| NM-1622, NM-1633 | Existing groups must be found; two-word searches must be accurate | the term is matched as one in-order phrase inside Name or Description: `Group 1788335968232` → 1 row, `1788335968232 Group` → 0, a Name word + a Description word → 0 | live contract documented → TC-011 |
| NM-1852 | Grid Options: column visibility, order, width and sorting persist locally; Reset to Default View clears them | Grid Options offers Reset to Default View + Description / Service Type / Status toggles (Name is mandatory); column menus of the hideable columns also carry "Hide column"; drags reorder and resize with the values stored and restored after reload; Reset restores all of it and re-sets Name ascending | fixed as stated → TC-035, 036, 037, 038 |
| NM-1909 | The form Reset must reset pagination | Reset from page 2 empties the grid to "0 product groups found", page box 1, total "/ 1" | fixed as stated → TC-028 |
| NM-1910 | Not a bug: rows-per-page is a retained preference and changing it re-runs the search | 10 rows/page and page 3 of 3 survive leaving through the Products breadcrumb and a fresh navigation | as designed → TC-027 |
| NM-1924 | Search results must be retained when returning from Add/Update | browser Back and the Product Groups breadcrumb both restore the 22 rows and the page the user was on | fixed as stated → TC-020 |
| NM-1939 | A loader must show inside the search box during a search | `svg.lucide-loader-circle.animate-spin` appears in the form together with 132 skeleton cells, ~370 ms | fixed as stated → TC-022 |
| NM-2064 | Sorting from a later page must return to page 1 | Description sort from page 2 lands on page 1 | fixed as stated → TC-032 |
| NM-1707 | Table height 100% | a layout rule; not probed (no pixel assertion in this walk) | out-of-scope (visual) |
| NM-1644 | Priced / Not Priced badge right of Active on the maintenance UI | the Edit landing shows "Not Priced" beside the form's Active checkbox | consistent → TC-019 (landing only) |
| NM-1863 | Edit permission from the host | Won't Do | nothing to test |

Divergences found live that no ticket states are listed under Observations (three readings withdrawn by owner ruling on 2026-09-10 as accepted behaviour, one withdrawn during the walk).

## Field Inventory

### Search panel (agent-walked; machine keys 2–8 of the manifest)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Search Product Groups | `(MISSING — using placeholder "Search Product Groups..."; tracked in testid-gap-report)` | Plain text (no `name`, no maxlength; a 200-character term is accepted) | empty on a clean context; the last executed term otherwise | none client-side; the server matches the trimmed term case-insensitively as one in-order phrase against Name and Description; spaces-only and empty terms return zero | enabled | drives the count label, the grid and the pager | Enter and the Search button submit. A submit within ~250 ms of the last keystroke runs the PREVIOUS term (Observations #1). `affordance: none`. |
| × (clear) inside the box | `(MISSING — using svg.lucide-x inside the form's unlabeled button; tracked in testid-gap-report)` | Icon button | hidden while the box is empty | n/a | present only while the box holds text | clears the box only — the results, the count and the stored term stay | Evidence: batch-4 read (box "" → still "22 product groups found", session `searchText` unchanged). `affordance: none`. |
| Active | `e2e-checkbox` (a Radix `button[role=checkbox]` with a hidden native companion input) | Checkbox | checked | n/a | enabled | a STATUS FILTER: checked → Active groups only, cleared → Inactive groups only (there is no "both") | Cleared + `ZZ E2E` → "5 product groups found", every row Inactive (06-active-unchecked.yml). The flag persists with the executed search and survives a reload. The label "Active" is not associated with the control (accessible name empty). `affordance: none`. |
| Reset | `(MISSING — using text "Reset"; tracked in testid-gap-report)` | Action | n/a | n/a | enabled | clears the box, empties the grid to "0 product groups found", re-checks Active, returns the pager to 1 / 1 — it does NOT clear an applied sort | Probed from page 2 (NM-1909). `affordance: none`. |
| Search | `(MISSING — using text "Search" (type=submit); tracked in testid-gap-report)` | Action | n/a | n/a | enabled during a search too (never disabled) | runs the search | Same debounce caveat as Enter. `affordance: none`. |
| Collapse / Expand search panel | `(MISSING — using aria-label "Collapse search panel" / "Expand search panel"; tracked in testid-gap-report)` | Icon toggle on the divider | expanded | n/a | enabled | collapsing shrinks the panel container from 360 px to 0 and widens the grid (table left 638 → 278, width 915 → 1002); the label flips; a reload reopens the panel (not persisted) | 12-panel-before.png, 13-panel-collapsed.png, 11-panel-collapsed.yml. `affordance: none`. |
| Products (breadcrumb link) | `(MISSING — using link text "Products"; tracked in testid-gap-report)` | Link | n/a | n/a | enabled | leaves the page | navigates to `/locations/1101/products`; the executed search is still restored on return. `affordance: navigation → …/products`. |

### Toolbar + grid header (machine keys 9–21)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Count label | `(none — text)` | Static text | "0 product groups found" | n/a | n/a | reflects the executed search + Active filter | Reads "1 product groups found" for a single match (Observations #3). |
| Add | `(MISSING — using text "Add"; tracked in testid-gap-report)` | Action | n/a | n/a | enabled | navigates to the Add page | `affordance: navigation → …/product-groups/add` (covered by the NM-2259 file). |
| Grid Options | `(MISSING — using the only `button[aria-haspopup=menu]` outside `thead`, accessible name "Grid Options"; tracked in testid-gap-report)` | Menu trigger (Radix, id changes per render) | closed | n/a | enabled with or without results | the menu holds "Reset to Default View" and three `menuitemcheckbox` toggles: Description, Service Type, Status (all checked by default; Name is not offered) | 14-grid-options-open.yml. `affordance: popover → "Grid Options" menu`. |
| Name / Description / Service Type / Status header cells | `(none — `thead th`, `draggable=true`)` | Column header: grip (reorder), menu trigger (named after the column, `aria-haspopup=menu`), resize handle (`button[aria-label="Resize column <field>"]`) | Name shows the ascending arrow (`svg.lucide-arrow-up`) at rest and after a search — the default sort is drawn, not hidden (spot-check 2026-09-09, corrected from an earlier "no arrow until a sort" reading); Description and Service Type show the neutral up-down icon; Status shows no sort icon | n/a | enabled | see the two rows below | A click anywhere on the cell opens the column menu. Fields: `productGroupName`, `productGroupDescription`, `serviceTypeName`, `active`. |
| Column menus | `(none — Radix menu; items by role+name)` | Menu | closed | n/a | enabled | Name: Sort ascending, Sort descending · Description and Service Type: Sort ascending, Sort descending, Hide column · Status: Hide column only (a non-sortable column) | 09-name-menu-open.yml, 25-description-menu-open.yml, 23-th-click-status-menu.yml. Escape closes. `affordance: popover → column menu`. |
| Resize handles ×4 | `(MISSING — using aria-label "Resize column <field>"; tracked in testid-gap-report)` | Drag handle | default widths 400/450/350/150 px requested, rendered 317/370/181/94 inside a 962 px table | n/a | enabled | a drag stores the pointer delta 1:1 in `columnSizing.<field>` and persists across reload; the rendered column moves only ~6 % of the drag (Observations #2) | probes-resize-response.json, probes-resize-all-handles.json, 20-resize-response.png. `affordance: none` (drag only). |
| Reorder grips ×4 | `(none — svg.lucide-grip-vertical inside the cell)` | Drag handle | Name, Description, Service Type, Status | n/a | enabled | a mouse-sequence drag of the Name grip onto Service Type yields Description, Name, Service Type, Status; `columnOrder` is stored and restored after reload | 18-after-reorder.png, probes-resize-loader.json § reorder. |

### Result grid (agent-walked, populated state — the enumerator's own search runs with an empty box and therefore sees no rows)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Result rows | `(none — `tbody tr`)` | Clickable rows (4 cells) | none until a search | n/a | enabled | any cell click navigates to `/product-groups/edit/<id>`; the search state is kept for the return | Names with markup (`ZZ E2E Special <b>&'"</b> …`) render as literal text — no HTML injection (04-search-zz.yml). |
| Empty state | `(none — text "No results")` | Static | shown at rest and for a no-match term | n/a | n/a | n/a | 08-no-results.yml. |
| Loading state | `(none — svg.lucide-loader-circle.animate-spin in the form; [data-slot=skeleton] cells in the grid)` | Transient | n/a | n/a | n/a | shown between submit and results (~370 ms on 22 rows) | 16-loader-during-search.png, probes-resize-loader.json § loader (NM-1939). |

### Pager (machine keys 22–27)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Rows per page | `(MISSING — using the only `[role=combobox]` on the page; tracked in testid-gap-report)` | Radix select | 20 | options 10 / 20 / 30 / 40 / 50 | enabled | 50 shows all 22 on one page; 10 makes 3 pages; a change re-runs the search and is retained as a preference (NM-1910) | 15-rpp-open.yml. |
| Page number box | `(MISSING — using aria-label "Current page number"; tracked in testid-gap-report)` | Text box, `inputmode=numeric` | "1" | digits only are accepted while typing (`abc`, `2.5`, ` 2`, `-1` leave the box unchanged); Enter on an out-of-range value (`0`, `9`) snaps back to the current page; a valid page + Enter jumps | enabled | followed by the "/ N" total | probed on 2 pages (batch-2/3 reads). |
| Go to first / previous / next / last page | `(MISSING — using the accessible names; tracked in testid-gap-report)` | Buttons | all disabled at rest | n/a | first/previous disabled on page 1; next/last disabled on the last page | page moves keep the sort and the filter | 04-search-zz.yml (page 1 of 2). |

### Edit-page landing (outside-module target of the row click — landing assertions only)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Edit page | n/a | Page | heading "Edit"; `input[name=productGroupName]` = the row's Name (maxlength 50); `input[name=productGroupDescription]` = the row's Description (maxlength 100); Active checked; badge "Not Priced"; button "Click to show translations popup"; Save disabled, Cancel enabled; breadcrumb Products › Product Groups | not walked | n/a | Back and the Product Groups crumb restore the list (page kept) | 05-row-click.yml. The form's own behaviour is out of scope (no ticket among NM-2253/2258/2259; NM-1863 Won't Do). |

## Labels + option sets

- Search panel: card "PRODUCT GROUPS" · placeholder "Search Product Groups..." · card "STATUS" · "Active" · "Reset" · "Search".
- Toolbar: "N product groups found" · "Add" · Grid Options (icon; menu: "Reset to Default View", "Description", "Service Type", "Status").
- Grid: "Name" · "Description" · "Service Type" · "Status"; column menus: "Sort ascending" · "Sort descending" · "Hide column" (per the table above); Status values "Active" / "Inactive"; service types seen: "Equipment Rental", "ZSub Rental Specialty".
- Pager: rows-per-page "10 / 20 / 30 / 40 / 50" · "rows per page" · page box + "/ N" · first / previous / next / last (accessible names "Go to … page").
- Empty state: "No results". Breadcrumb: "Products" › "Product Groups".

## Interaction-axis deltas (§20 BEFORE/AFTER, every filter / toggle / sort / pagination / guard control)

| Control | BEFORE | Action | AFTER | Evidence |
|---|---|---|---|---|
| Search box + Enter | empty grid, "0 product groups found" | type `ZZ E2E`, Enter | "22 product groups found", 20 rows, next/last enabled, "1 / 2" | 04-search-zz.yml, probes-search-matrix.json |
| Search button | same | `ZZ E2E Walk` + Search | "2 product groups found" | batch-2 read; probes-first-submit.json (button variant) |
| Search, empty box | 22 rows | clear, Search | "0 product groups found", No results (the Products page returns everything here) | probes-search-matrix.json row 17 |
| Active filter | checked, 22 Active rows | clear, search | "5 product groups found", all Inactive; re-check, search → 22 Active | 06-active-unchecked.yml |
| Reset (form) | page 2 of 2, sorted by Description | Reset | box empty, "0 product groups found", "1 / 1", Active checked; the next search is still Description-sorted | batch-3 read (session state kept `sortBy`) |
| × clear | box `ZZ E2E`, 22 rows | click × | box empty, 22 rows and count kept, stored term kept; × hidden until text returns | batch-4 read |
| Next / first / last / previous | page 1 of 2 | next → first → last | 2 rows on page 2 (first/previous enabled, next/last disabled) → 20 rows → 2 rows | batch-1/2 reads |
| Page box | "1" | `2` + Enter · `9` + Enter · `0` + Enter · `abc` | page 2 · stays on the current page · stays · box unchanged | batch-2/3 reads |
| Rows per page | 20, "1 / 2" | 50 · 10 · last | 22 rows "1 / 1" · 10 rows "1 / 3" · page 3 with 2 rows | 15-rpp-open.yml, batch-6 read |
| Rows per page persistence | 10 rows, page 3 | Products breadcrumb → Back · fresh navigation | 10 rows, page 3, 22 found — both paths | batch-6 read (NM-1910) |
| Name menu → Sort descending / ascending | ascending by default | menu items | descending (arrow-down, order flipped) → ascending (arrow-up) | 09-name-menu-open.yml, batch-5 reads |
| Description / Service Type menus | unsorted | Sort descending / ascending | order flips on that column, arrow moves to it | 10-sorted-svc-desc.yml |
| Status menu | — | open | "Hide column" only — no sort items, no sort icon (non-sortable by design; the sibling Products grid does the same for Available / In Sequence) | 23-th-click-status-menu.yml |
| Sort from page 2 | page 2 | Description → Sort descending | page 1 (NM-2064) | batch-6 read |
| Sort persistence | Service Type descending | re-search · Reset + search · fresh navigation | sort kept in all three | batch-3/5 reads; session state `sortBy` |
| Grid Options → Description | 4 columns | uncheck | 3 columns (Name, Service Type, Status), `columnVisibility.productGroupDescription=false`; kept after reload; re-check → 4 | 14-grid-options-open.yml, batch-6 read |
| Column menu → Hide column (Description) | 4 columns | click | 3 columns, same stored flag | 25-description-menu-open.yml, batch-8 read |
| Reset to Default View | Status hidden, Name descending, page 2 | click | 4 columns, Name ascending (arrow-up, `sortBy: productGroupName asc`), page 1, stored prefs back to defaults, results kept | 19-after-reset-default-view.png, batch-6 read |
| Column resize (Name) | requested 400 px, rendered 317 | drag +50 / +150 / +300 / −300 | stored 450 / 600 / 900 / 600; rendered 320 / 328 / 336 / 328 | probes-resize-response.json, 20-resize-response.png |
| Column resize (all four) | defaults | +60 px each | stored 460 / 510 / 410 / 210 (each key its own); rendered ±2–4 px | probes-resize-all-handles.json, 24-resize-all-handles.png |
| Column reorder | Name, Description, Service Type, Status | mouse-drag the Name grip onto Service Type | Description, Name, Service Type, Status; `columnOrder` stored; kept after reload | 18-after-reorder.png |
| Collapse search panel | panel 360 px, table left 638 | click · click again · reload while collapsed | container 0 px, table left 278, label "Expand search panel" · restored · reload reopens the panel | 12/13 png, 11-panel-collapsed.yml |
| Row click | list | click a Name cell · a Description cell | `/edit/4583` · `/edit/4594`, form pre-filled | 05-row-click.yml |
| Return from Edit | page 2 of 2 | browser Back · Product Groups crumb | page 2 restored with its 2 rows, both paths | batch-2 reads (NM-1924) |
| Loader | idle | Enter | loader-circle in the form + 132 skeleton cells for ~370 ms, then 20 rows | probes-resize-loader.json § loader |
| Typing debounce | fresh context | type `ZZ E2E`, Enter after 0 / 250 / 500 … 2500 ms | 0 ms → the EMPTY term is searched ("0 product groups found", `searchText: ""`); ≥ 250 ms → the typed term | probes-debounce.json, probes-first-submit.json, probes-dead-window.json |
| Fast second search | `ZZ E2E` executed | select-all, type `Audio`, Enter at once | the grid and the stored term stay `ZZ E2E` while the box shows `Audio` | 21-stale-second-search.png |
| Escape on an open column menu | menu open | Escape | closed | batch-6 read |

## Search semantics (server contract, probes-search-matrix.json — typed by keys with a 600 ms settle)

| Term | Result | Reading |
|---|---|---|
| `ZZ E2E` · `zz e2e` · `   ZZ E2E   ` | 22 found each | case-insensitive; surrounding spaces ignored (the box keeps them) |
| `Group 1788335968232` | 1 | in-order phrase within a Name |
| `1788335968232 Group` | 0 | word order matters — not a word-AND search |
| `Automated group create check` | 15 | a Description-only phrase matches (NM-972) |
| `Group Automated` | 0 | a Name word plus a Description word does not match — one field per phrase |
| `&'` · `<b>` | 5 each | special characters are part of the term (NM-1620, NM-1756) |
| `%` | 4, every row carries a literal `%` | not a wildcard |
| `_` · `@` | 0 | not wildcards; no such names |
| `zzzz-no-match-9f3` · 200 × `a` | 0, "No results" | no error on a long term; no maxlength |
| `     ` (spaces) · empty box | 0 | blank counts as empty; empty returns nothing (the Products page differs) |
| `ZZ E2E Group 1788335968232` | "1 product groups found" | the singular reads plural (Observations #3) |

## Save-cycle observations

Nothing on this surface saves. The module's only create lives on the Add page (`item-search-add-product-group-2026-09-09.md`); the Edit page reached by a row click was not driven beyond its landing.

## Observations

### Bugs / Defects

1. **WITHDRAWN 2026-09-10 by owner ruling (accepted behaviour; was BUG-ISR-PGR-001, filed from BUG-CANDIDATE PGR-SEARCH-DEBOUNCE, functional, medium). TC-ISR-PGR-016 now pins the behaviour instead of failing on it.** — the search runs the PREVIOUS term when Enter or Search follows the last keystroke within roughly a quarter second. On a fresh page the first search therefore runs empty: the box shows the typed text, the grid says "0 product groups found", and the stored term is `""`; a quick edit of an executed search re-runs the old term while the box shows the new one (the results and the persisted term disagree with the box). Reproduced in 10 of 10 fresh contexts (Enter and the button; a neutral click first changes nothing) and cured by a pause of 250 ms or more before submitting. Evidence: `probes-first-submit.json` (6 variants), `probes-debounce.json` (0 → stale, 250–2500 → correct; second-search repro), `probes-dead-window.json` (4 runs, attempt 2 always succeeds), `21-stale-second-search.png`. A fast typist hits this; automation must settle before submitting (Automation notes).
2. **WITHDRAWN 2026-09-10 by owner ruling (accepted behaviour; was BUG-ISR-PGR-002, filed from BUG-CANDIDATE PGR-RESIZE-DAMPED, UX, low).** — dragging a column edge moves the column only ~6 % of the drag. The handle stores the pointer delta exactly (`columnSizing.productGroupName` 400 → 450 → 600 → 900 for +50 / +150 / +300) but the table is pinned to `width: 100%` (962 px) with requested widths that already exceed it, so the browser renormalises: the Name column renders 317 → 320 → 328 → 336 px. All four handles behave the same. On the sibling Products grid the table width grows with the drag (1315 → 1515 px for +200) and the column follows the pointer. Evidence: `probes-resize-response.json`, `probes-resize-all-handles.json`, `probes-products-resize-compare.json`, `20-resize-response.png`, `22-products-resize-compare.png`.
3. **WITHDRAWN 2026-09-10 by owner ruling (accepted behaviour; was BUG-ISR-PGR-003, filed from BUG-CANDIDATE PGR-COUNT-GRAMMAR, cosmetic, low).** — a single match reads "1 product groups found". Evidence: `probes-search-matrix.json` (two single-row terms).
- Withdrawn during the walk: "the Status column's sort items are inert". The Status menu carries only "Hide column"; my earlier clicks on non-existent sort items had their errors suppressed and the unchanged grid read as inertness (agent-mistakes CEO-M29). Status is non-sortable by design, as are Available / In Sequence on the Products grid.

### Suggestions / Improvements

- Empty-criteria search returns zero here while the Products page returns everything (carried from 2026-08-31; still true — matrix row 17).
- Default rows-per-page 20 here vs 50 on Products (carried).
- The page box snaps back silently on an out-of-range page; a hint or clamping to the nearest valid page would read better.
- The form Reset keeps the applied sort while Reset to Default View clears it; worth deciding on purpose.
- The Active checkbox's visible label is not wired to the control (accessible name empty) — recorded as a selector-strategy constraint only (LR-ENC-009), the testid anchors the case.

## LR-029 missing / misnamed testid report

Verified against the live DOM on 2026-09-09 (form-control census, header census, enumerator run), not from a static grep.

| Control | Has testid | Next-best stable anchor |
|---|---|---|
| Active checkbox | **yes** (`e2e-checkbox`, shared with the Add page's Labor filter) | n/a |
| Search text · × clear · Reset · Search · Add · Products link · Collapse/Expand | no | placeholder · `svg.lucide-x` in the form · text · text · text · link text · aria-label |
| Grid Options trigger · column menu triggers | no (Radix ids change per render) | the only `button[aria-haspopup=menu]` outside `thead` · first button in each `th` (named after the column) |
| Resize handles | no | aria-label "Resize column <field>" |
| Reorder grips | no | `thead th svg.lucide-grip-vertical` (drag by mouse) |
| Pager buttons · page box · rows-per-page | no | accessible names "Go to … page" · aria-label "Current page number" · `[role=combobox]` |
| Result rows | no | `tbody tr` (cell text anchors) |

## Automation notes

- Settle at least 400 ms after the last keystroke before Enter / Search (measured: a 0 ms gap runs the previous term, 250 ms is already safe; 400 keeps a margin without becoming a sleep-for-luck). Read the box back after typing.
- `fill()` appended instead of replacing twice in this walk, right after a checkbox click and after a menu interaction (`ZZ E2EZZ E2E`); type with select-all + keys, or verify and refill.
- The search is a POST to the page route itself (a server action), not an `/api` path — wait for the skeleton-then-rows transition, never for an API URL.
- Grid state: `sessionStorage['navigator:productGroups:searchState']` carries `{searchText, active, sortBy, sortDirection, pageIndex, pageSize}`; `localStorage['product-groups-table-settings']` carries `{columnVisibility, columnOrder, columnSizing, sorting: []}`. Per-test baselines should Reset the form and, when a case touches the grid layout, Reset to Default View.
- The loader is observable only with a MutationObserver armed before the submit (about 370 ms on 22 rows).
- Reorder and resize need `mouse.move → down → move(steps) → up`; `dragTo()` is not required (the mouse sequence worked first time on both).
- Radix ids (`radix-_r_…`) change on every render — resolve the Grid Options trigger and the column triggers by role and name each time.

## Staleness signal

- **Last verified**: 2026-09-09
- **Fresh-until**: 2026-09-23
- **Stale-after**: 2026-10-09
- **Refresh triggers**: column set ≠ 4 · rows-per-page options ≠ 10/20/30/40/50 · Status gains sort items · the empty-search contract changes · the debounce is fixed (re-read the timing probes) · the table stops being pinned to 100 % width · Grid Options gains or loses an item.

## Coverage Manifest (machine-enumerated)

Machine denominator: **27** (`reports/walk-coverage/1101-item-search-product-groups.json`, states resting + search:executed in one run; raw 32 before archetype collapse; A∪B 27, A∩B 19, A△B 8). All 27 rows dispositioned. **Coverage_Ratio: 27/27.** TC IDs 031–062 are the cases added by this re-walk; 001–010 pre-date it.

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `struct:button\|trigger-button\|div/div/skip/div/div/div` | button | 2026-09-09 | out-of-scope: outside-module — app-shell sidebar toggle (Navigator shell chrome outside every products-module denominator) |
| `struct:a\|Products\|div/div/div/div/div/div` | a | 2026-09-09 | covered-by-TC: TC-ISR-PGR-023 |
| `struct:input\|Search Product Groups...\|form/div/div/div/div/div` | input | 2026-09-09 | covered-by-TC: TC-ISR-PGR-002, 008, 009, 010, 011, 012, 013, 014, 016 |
| `testid:e2e-checkbox` | checkbox | 2026-09-09 | covered-by-TC: TC-ISR-PGR-007, 017, 018 |
| `struct:input\|\|div/form/div/div/div/div` | input | 2026-09-09 | out-of-scope: duplicate-of: testid:e2e-checkbox — the Radix checkbox's hidden native companion input (16×16 inside the same wrapper, no behaviour of its own; form-control census 2026-09-09) |
| `struct:button\|Reset\|div/div/div/div/form/div` | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-007, 028 |
| `struct:button\|Search\|div/div/div/div/form/div` | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-002, 003, 013 |
| `struct:button\|Collapse search panel\|div/skip/div/div/div/div` | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-039 |
| `struct:button\|Add\|div/div/div/div/div/div` | button | 2026-09-09 | covered-by-TC: TC-ISR-APG-001 (sibling file, NM-2259) |
| `id:radix-_r_#_ [archetype×6]` (Grid Options trigger + column-menu triggers) | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-034, 035, 036 |
| `struct:th\|Name\|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-09-09 | affordance-probed: affordance: popover → column menu "Sort ascending / Sort descending" (a cell click opens it; Name has no Hide item) · provenance: live · evidence: .playwright-cli/pgr-2026-09-09/09-name-menu-open.yml · covered-by-TC: TC-ISR-PGR-030 |
| `struct:button\|Resize column productGroupName\|div/div/table/thead/tr/th` | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-038 (evidence probes-resize-response.json) |
| `struct:th\|Description\|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-09-09 | affordance-probed: affordance: popover → column menu "Sort ascending / Sort descending / Hide column" · provenance: live · evidence: .playwright-cli/pgr-2026-09-09/25-description-menu-open.yml · covered-by-TC: TC-ISR-PGR-031, 035 |
| `struct:button\|Resize column productGroupDescription\|div/div/table/thead/tr/th` | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-038 (evidence probes-resize-all-handles.json) |
| `struct:th\|Service Type\|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-09-09 | affordance-probed: affordance: popover → column menu "Sort ascending / Sort descending / Hide column" · provenance: live · evidence: .playwright-cli/pgr-2026-09-09/10-sorted-svc-desc.yml (the applied sort) · covered-by-TC: TC-ISR-PGR-031 |
| `id:radix-_r_1b_` (Service Type menu trigger) | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-031, 034 |
| `id:radix-_r_2b_` (Status menu trigger, second render) | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-034 (menu = Hide column only) |
| `struct:button\|Resize column serviceTypeName\|div/div/table/thead/tr/th` | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-038 (evidence probes-resize-all-handles.json) |
| `struct:th\|Status\|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-09-09 | affordance-probed: affordance: popover → column menu "Hide column" only (non-sortable column, no sort icon) · provenance: live · evidence: .playwright-cli/pgr-2026-09-09/23-th-click-status-menu.yml · covered-by-TC: TC-ISR-PGR-034 |
| `id:radix-_r_1d_` (Status menu trigger) | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-034 |
| `struct:button\|Resize column active\|div/div/table/thead/tr/th` | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-038 (evidence probes-resize-all-handles.json) |
| `struct:combobox\|20\|div/div/div/div/div/div` | combobox | 2026-09-09 | covered-by-TC: TC-ISR-PGR-004, 026, 027 |
| `struct:button\|Go to first page\|div/div/div/div/div/div` _(A∖B review, disabled at rest)_ | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-004, 024 |
| `struct:button\|Go to previous page\|div/div/div/div/div/div` _(A∖B review, disabled at rest)_ | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-004, 024 |
| `struct:input\|Current page number\|div/div/div/div/div/span` | input | 2026-09-09 | covered-by-TC: TC-ISR-PGR-025 |
| `struct:button\|Go to next page\|div/div/div/div/div/div` _(A∖B review, disabled at rest)_ | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-004, 024, 032 |
| `struct:button\|Go to last page\|div/div/div/div/div/div` _(A∖B review, disabled at rest)_ | button | 2026-09-09 | covered-by-TC: TC-ISR-PGR-024 |

A△B classification: the four `th` cells are A-only because they are not focusable (their menu triggers are; the cells delegate the click) — classified above as menu launchers; the four pager buttons are A-only because they are disabled at rest — classified above through the multi-page cases.

### State supplements (agent-walked census — states the enumerator cannot reach because its own search runs with an empty box)

| census-key | role | found (date / evidence) | disposition |
|---|---|---|---|
| `census:row\|tbody tr ×20 (page 1) / ×2 (page 2)\|search:populated` | row | 2026-09-09 / 04-search-zz.yml, 05-row-click.yml | covered-by-TC: TC-ISR-PGR-006, 019, 015 |
| `census:button\|× clear (svg.lucide-x)\|search box with text` | button | 2026-09-09 / batch-4 read | covered-by-TC: TC-ISR-PGR-021 |
| `census:menu\|Grid Options: Reset to Default View, Description, Service Type, Status\|menu open` | menu | 2026-09-09 / 14-grid-options-open.yml | covered-by-TC: TC-ISR-PGR-035, 036 |
| `census:menu\|column menu items: Sort ascending, Sort descending (Name, Description, Service Type); Hide column (Description, Service Type, Status)\|menu open` | menu | 2026-09-09 / 09, 25, 23 snapshots | covered-by-TC: TC-ISR-PGR-030, 031, 034, 035 |
| `census:listbox\|rows-per-page options 10, 20 (selected), 30, 40, 50\|select open` | listbox | 2026-09-09 / 15-rpp-open.yml | covered-by-TC: TC-ISR-PGR-026 |
| `census:button\|Expand search panel\|panel collapsed` | button | 2026-09-09 / 11-panel-collapsed.yml, 13-panel-collapsed.png | covered-by-TC: TC-ISR-PGR-039 |
| `census:drag\|header grips svg.lucide-grip-vertical ×4 (th[draggable=true])` | drag handle | 2026-09-09 / 18-after-reorder.png | covered-by-TC: TC-ISR-PGR-037 |
| `census:loader\|svg.lucide-loader-circle.animate-spin (form) + [data-slot=skeleton] ×132\|search in flight` | transient | 2026-09-09 / probes-resize-loader.json, 16-loader-during-search.png | covered-by-TC: TC-ISR-PGR-022 |
| `census:landing\|Edit Product Group page /product-groups/edit/<id>\|row clicked` | page | 2026-09-09 / 05-row-click.yml | covered-by-TC: TC-ISR-PGR-019 (landing assertions); the page's own controls: out-of-scope: outside-module — no ticket among NM-2253/2258/2259 covers editing a group (NM-1863 Won't Do) |

### §3 surface families (LR-065)

The group list is a result surface. Families dispositioned —
- **result-fidelity** → TC-ISR-PGR-002 (QUICK), 032, 034, 035, 037 (DEEP)
- **pagination** → TC-ISR-PGR-004 (QUICK), 042, 043, 044 (DEEP)
- **sorting** → TC-ISR-PGR-029 (QUICK — the NM-1618 default), 047, 048, 049, 050, 051 (DEEP)
- **combination** → TC-ISR-PGR-017 (QUICK — text × Active filter intersection), 039 (DEEP)
- **render-state** → TC-ISR-PGR-006 (QUICK), 040, 059, 060 (DEEP)
- **empty-vol** → TC-ISR-PGR-003 (QUICK), 036, 044 (DEEP — 50 rows on one page)
- **persistence** → TC-ISR-PGR-005 (QUICK), 041, 045, 050, 052, 053, 055, 056 (DEEP)

### Opener frontier (state-graph exhaustion)

- **Column menus (4)**: opened, items read, every item exercised (sorts, Hide column) — closed.
- **Grid Options**: opened, every toggle and Reset to Default View exercised — closed.
- **Rows-per-page select**: opened, three options chosen — closed.
- **Collapse toggle**: both states, plus a reload in the collapsed state — closed.
- **Row click → Edit page**: landing walked; the Edit form itself is outside every ticket in scope — named boundary, not a blocker.
- **Add button**: the Add page's frontier lives in `item-search-add-product-group-2026-09-09.md`.
- **Out-of-module**: sidebar toggle, Products breadcrumb target — not opened beyond navigation.
