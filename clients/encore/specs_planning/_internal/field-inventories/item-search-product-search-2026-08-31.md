# Field Inventory — Item Search: Product Search page (PRS)

**Module**: item-search
**Client**: encore
**MCP_Session_Date**: 2026-08-31
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Unattended multi-state catalog walk (3 machine enumerations + agent probes) with grep-over-disk YAML snapshots; no visual/CSS assertion and no fresh-auth need, so LR-038 v2 selects the Playwright CLI path (`playwright-cli`, session isr2, state-load of the shared auth).
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products
**Test_Entity**: Office 1101 - Corporate Office Encore USA SGA (admin-only feature; plan-pinned)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md
**Walk_Mode**: quick

Coverage_Ratio: 70/70 (100%) — the resting-state machine denominator, every row dispositioned below. The two sibling states (search:executed 29, expand:grid-options 63) are fully dispositioned in the state supplements after the manifest; their elements are the same controls re-enumerated in those states plus the Grid Options menu internals.
Completion_Record: reports/walk-coverage/isr.json (status=complete, elements=70) · reports/walk-coverage/isr--search-executed.json (status=complete, elements=29) · reports/walk-coverage/isr--expand-grid-options.json (status=complete, elements=63)
Walk_State: module=item-search walked=[resting,search:executed,expand:grid-options]
CrossCheck: clean — no A△B review-set elements were flagged by the enumerator for these runs; every key sits in the union denominator and is dispositioned.
jira_tickets: [NM-2253, NM-1493, NM-1495, NM-1616, NM-1829, NM-1903, NM-1921, NM-2077, NM-2100, NM-2111]
baselineScope: baseline-absent (environment-blocked — see Baseline_Artifact; 6 access attempts, TLS reset for automated browsers, curl 200)

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products` — the Products (Item Search) page. Single route; three walked states:
  - **resting** — search panel + 13-column grid chrome + pagination (no rows until Search).
  - **search:executed** — Search clicked; result rows, count label, row-selection toolbar reachable.
  - **expand:grid-options** — Grid Options menu open (Reset to Default View + 12 column checkboxes).
- The row-selection toolbar and its dialogs (View/Add Product Code, availability) are multi-step states the one-click branch mechanism cannot reach — they are agent-walked and inventoried in the sibling artifact `item-search-product-code-2026-08-31.md` (§20-Q opener-frontier walk).
- The Product Group button navigates to `…/products/product-groups` — sibling artifact `item-search-product-groups-2026-08-31.md`.

## Live-state caveat

| Field | Live (2026-08-31) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Location | `1101 - Corporate Office Encore USA SGA` on a true first load; whatever the last executed search used on later loads | current office | Executed search criteria persist in browser storage and survive reloads (mechanism change vs the ticketed URL-parameter design — see crossref). A defaults assertion is only reliable immediately after Reset. |
| Any Field / Barcode / Region | last executed values | empty | Same persistence. Unexecuted input does NOT persist (proven live on the sibling page; same store). |
| Sort order | last applied sort | Category ascending (server default `MajorCategory`, ascending) | Sort persists across full reload — caught by the blind re-drive (Video-first survived a cold navigation). |
| Grid Options info | menu itemization | all 12 toggles checked | The resting machine run itself enumerated `Reset to Default View`, proving the enumerator's self-expansion opened the menu; column set restored before authoring. |

## Field Inventory

### Search panel (PRS) — search card, present in all three states

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Keyword Search (radio) | `e2e-toggle-keyword` | Checkbox (native + Radix) — single-option radio group | checked | not probed (QUICK depth) | enabled | selects which help text the Search help popover shows | The only radio in the group (`e2e-toggle-group`). `affordance: none` beyond selection. |
| Any Field | `e2e-search-input` | Plain text | empty (after Reset) | none observed — free text, any length tried accepted | enabled | drives result filtering across item number, description, category, product group (help popover text verbatim) | "Amp" → 376/15,874 rows, all sampled rows match. `affordance: none`. |
| Barcode | `e2e-barcode-input` | Plain text | empty (after Reset) | `maxlength=42` enforced (50-char input truncates to 42, matching NM-1494's Code 39 ceiling); no `pattern` — charset NOT policed on entry ("AB@#12" accepted, `aria-invalid` null, returns 0) | enabled | resolves an asset barcode to the ONE product it is scanned under — exactly 1 row per valid barcode; many barcodes legitimately map to one product | **OR-4 CLOSED 2026-09-01** (owner supplied 12 barcodes; all 12 resolved live → 5 distinct products: 5052320→28592, 1013104→627, 5148547+5192290→73551, 5056210/5056526/5056530/5056516→29205, DFW0082529/DFW0082517/DFW0082547/5189939→71154). Exact-match only (6-digit prefix → 0); case-insensitive; mutually exclusive with Any Field (each clears the other, both directions); leading space → 0 but trailing space → still 1. **Root cause found 2026-09-01 — the asymmetry is server-side, not an app trim**: calling `POST /navigator/api/location/navigator-legacy/getItemSearchByBarcodeAction` directly (bypassing the UI) reproduces it on two barcodes — `"5052320 "`→1, `" 5052320"`→0, `"DFW0082529 "`→1, `" DFW0082529"`→0 — with the string sent untrimmed every time, so nothing in the front end is stripping either end. Consistent with SQL's trailing-blank-insensitive character comparison (inferred, NOT verified against the query). Same probe proved matching is truly exact (`%`, `% %`, `_`, `505232%` all → 0) and that an EMPTY barcode returns 1001 rows (parameter skipped, not matched — unreachable from the UI). Still an owner-ruling question, not filed; evidence in `walk-evidence-item-search-barcode-whitespace-2026-09-01.md`. Garbage value → "0 products found" + "No results". `affordance: none`. Covered by TC-ISR-PRS-022…030. |
| Quantity Greater Than Zero | `e2e-checkbox` (shared testid — first instance) | Checkbox (native + Radix) | unchecked | n/a | enabled | narrows results to rows with stock | Read ×3 (pristine, restored, blind re-drive). `affordance: none`. |
| Active | `e2e-checkbox` (shared testid — second instance) | Checkbox (native + Radix) | checked | n/a | enabled | filters to active products (server flag `active:true` in the search request) | Read ×3. `affordance: none`. |
| Location | `(none) — role-name "Select Location"` | Dropdown / combobox (Radix) with typeahead | current office `1101 - Corporate Office Encore USA SGA` (restored by Reset; first-load default) | n/a | enabled | mutually exclusive with Region — setting one clears the other (both directions proven live) | 5,102 options incl. placeholder. Accessible name stays "Select Location" regardless of value — read the trigger's text content for the value. `affordance: none`. |
| Region | `(none) — role-name "Select Region"` | Dropdown / combobox (Radix) | empty (placeholder) | n/a | enabled | mutually exclusive with Location (owner ruling verified bidirectionally) | 106 options. `affordance: none`. |
| Product Organization | `(none) — popover trigger button next to the label` | Dropdown / multi-select popover | None | n/a | enabled | country-level filter (effect on results deferred — needs org-tagged data) | Popover lists Select All / None / United States / Canada / Mexico as checkboxes. `affordance: popover → product-organization checklist`. |
| Prep Date Time | `(none) — first "Open popover" button in the dates row` | Date/offset (calendar popover + time spinner) | today 12:00 AM | field-level + pair validation (2026-09-01: Prep past Return → red "Prep date cannot be after the return date." + Search DISABLED until corrected/Reset; result-side behavior still excluded per owner ruling) | enabled | both dates ride every search request (availability enrichment) — excluded from assertions per owner ruling | `affordance: popover → calendar with time spinner`. **DEFECT 2026-09-01**: wide values overspill the box — 22nd picked in each of 12 months, 7 overflow (Oct +12, Nov +27, Dec +27, Jan +11, Feb +17, Aug +5, Sep-2027 +30 px; Mar–Jul fit); "AM" renders outside the border (screenshot `.playwright-cli/page-2026-09-01T10-59-30-124Z.png`). TC-ISR-PRS-021 pins it expected-to-fail. Filed as `BUG-ISR-PRS-001` (2026-09-01). |
| Return Date Time | `(none) — second "Open popover" button in the dates row` | Date/offset (calendar popover + time spinner) | today 11:59 PM | field-level + pair validation (same 2026-09-01 proof, opposite side of the rule) | enabled | same | `affordance: popover → calendar with time spinner`. **DEFECT 2026-09-01**: same overspill — "November 22nd, 2026 11:59 PM" +23 px, "PM" outside the border (same screenshot). Same filing: `BUG-ISR-PRS-001`. |
| Search | `e2e-search-button` | *(action)* | n/a | n/a | enabled at rest | executes POST search + availability enrichment | ~11s to full render on the unfiltered set. |
| Reset | `e2e-reset-button` | *(action)* | n/a | n/a | enabled at rest | clears text/region/barcode, restores Location=current office + checkbox defaults, empties results to "0 products found" until the next Search (stable ×3 polls) | |
| Search help | `e2e-popover-trigger` | *(action)* | n/a | n/a | enabled | popover content varies with the selected search type | CLICK-triggered popover (hover does nothing). `affordance: popover → search-type help`. |
| More information | `(none) — aria-label "More information"` | *(action)* | n/a | n/a | enabled | none | Hover tooltip: "This is the future products page for the location." |
| Collapse search panel | `(none) — accessible name "Collapse search panel"` | *(action)* | n/a | n/a | enabled | none | Tooltip "Hide search"; collapse/expand probed live. |

### Result grid chrome (present at rest; rows only after Search)

- 13 columns: Category, Sub Category, Class, Product Group, Sub Class, Item, Product Code ID, Description, Available, Owned, Out of Service, In Sequence, Location Name.
- Column headers are buttons opening a per-column menu (Sort ascending / Sort descending / Hide column) — sorting is menu-driven, server-side (`sortBy`/`sortDescending` in the search request; default `MajorCategory` ascending; descending flip proven Video-first).
- Every cell is a truncation-conditional tooltip trigger (tooltip shows full text only when truncated — positive + negative proven; re-proven 2026-09-01). **Measurement pin (2026-09-01)**: the cut-off state lives on the cell's INNER text span (`overflow-hidden whitespace-nowrap text-ellipsis` longhand — there is NO literal `truncate` class), while the `td` caps at a fixed `max-width` and always reports its own text as fitting (probe: span scrollWidth 332 vs clientWidth 147 inside a 160-px td). An interim same-day rescind of this row ("cells never truncate/tooltip") was itself a misread — every census behind it measured the td box or a `[class*="truncate"]` element that does not exist, a systematically blind instrument whose zero never varied across 1920/1024/900-px widths — and was withdrawn the same day after the span-level probe found 192 clipped cells and a live tooltip ("4ch 300W @ 4 Ohm Analog Power Amp 70V/100V", row 39 col 7). The table ALSO scrolls sideways (1,925-px table in a 575-px window at 900-px width) — both mechanisms coexist.
- Some rows carry an empty Category cell (empty sort-key in the search projection while the details dialog shows the category) — those rows float first under ascending sort. Observation, not a sort defect.
- Pagination: rows-per-page 50 default (options 10/20/30/40/50), page textbox "1 / N", first/prev/next/last buttons; 15,874 unfiltered rows → 318 pages.
- Grid Options button (tooltip "Grid Options"): menu = Reset to Default View + 12 column checkboxes (Item column absent = non-hideable). Hide→sync→restore cycle proven on Owned.

## Labels + Section Names

- Card header: "PRODUCT" area with "Products" heading · count label "N products found" · info icon.
- Search panel: "Any Field" · "Enter barcode" · "Filters" · "Quantity Greater Than Zero" · "Active" · "Location" ("Select Location") · "Region" ("Select Region") · "Product Organization" · "Prep Date Time" · "Return Date Time" · "Reset" · "Search" · "Search help".
- Toolbar (row selected): "Product Group" · "View Availability" · "View Product Code" · "Add Product Code" · "Grid Options".
- Pagination: "rows per page" · "Go to first/previous/next/last page" · "Current page number".
- Empty state: "0 products found" + "No results".

## Save-cycle observations

### Save button behavior
The search page itself has NO save — Search/Reset are query actions. Save buttons live inside the Product Code dialogs (sibling artifact): disabled at rest, enablement condition recorded there.

### Save dialog
n/a on this page — no save flow exists on the search surface.

### Post-save toast
n/a — no save executed anywhere in this module's walk (nothing was persisted; dialogs were closed without saving).

### Dirty-state behavior
No unsaved-changes guard exists anywhere in this module: three independent dirty-close probes (View dialog with edited name, Add dialog with a selected type, sibling Add page with typed name) all discarded silently with no Stay/Leave prompt. TCs assert the actual discard behavior; the absence is recorded as a suggestion.

## Observations

### Bugs / Defects
Recorded in the walk-evidence artifact (`walk-evidence-item-search-2026-08-31.md` § Observations): the View Product Code → Category silent no-op (dialog-side, sibling artifact scope — **INVALIDATED 2026-09-01 by LR-044 live re-verification: Category opens its dialog; BUG-ISR-PCD-001 → invalid**), the inert View Availability button (owner-ruling-adjacent: date-driven behavior not functional yet), the sibling-page empty-search divergence, and the blank sort-key projection observation. None of the four sits on the search panel itself.

### Suggestions / Improvements
- Extend the `e2e-*` data-testid pattern (already on the search panel) to the grid, toolbar, and pagination — those controls have no testids and fall back to role/name anchors.
- Persistence restores criteria silently; a visible "restored previous search" hint would reduce surprise.

## LR-029 missing-testid report

Verified against live DOM by the enumerator (2026-08-31 runs) + live snapshots, not from a static grep.

| Control | Surface | Has testid | Next-best stable anchor |
|---|---|---|---|
| Keyword radio, Any Field, Barcode, both checkboxes, Search, Reset, Search help, form/card wrappers | search panel | **yes** (`e2e-*` set) | n/a |
| Location / Region dropdowns | search panel | no | role-name "Select Location" / "Select Region" (names stable; value read from text content) |
| Product Organization trigger, date popover buttons | search panel | no | accessible name "Open popover" + position within the labeled field row |
| More information, Collapse search panel | header | no | aria-label / accessible name |
| Column header menus, resize handles, grid cells | grid | no | role+name (`button "Category"` etc.); cells by row/column position |
| Pagination cluster | grid footer | no | accessible names "Go to first/previous/next/last page", "Current page number", rows-per-page by role+value |
| Toolbar buttons (row selected) | toolbar | no | accessible names ("View Product Code", "Add Product Code", "View Availability", "Product Group", "Grid Options") |

## Staleness signal

- **Last verified**: 2026-08-31
- **Fresh-until**: 2026-09-14
- **Stale-after**: 2026-09-30
- **Refresh triggers**: search-panel testid set changes · column set ≠ 13 · Grid Options item count ≠ 12 · pagination option set changes · the search or availability request shapes change · date-driven behavior goes functional (owner ruling lifts — re-walk dates + View Availability).

## Coverage Manifest (machine-enumerated)

Machine denominator: **70** — the resting state. Provenance: `reports/walk-coverage/isr.json` (70, resting). All 70 rows dispositioned. **Coverage_Ratio: 70/70.**

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `struct:button\|trigger-button\|div/div/skip/div/div/div` | button | 2026-08-31 | out-of-scope: outside-module — app-shell sidebar toggle (Navigator shell chrome outside every products-module denominator; the same control is enumerated by the sibling item-search inventories) |
| `struct:button\|More information\|skip/div/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-005 |
| `testid:e2e-search-section-wrapper` | div | 2026-08-31 | out-of-scope: not-interactive structural wrapper carrying no behavior of its own |
| `testid:e2e-search-form` | form | 2026-08-31 | out-of-scope: not-interactive form container — submission rides the Search button, not the form node |
| `testid:e2e-card` | div | 2026-08-31 | out-of-scope: not-interactive card wrapper carrying no behavior of its own |
| `testid:e2e-card-header` | div | 2026-08-31 | out-of-scope: not-interactive card header wrapper carrying no behavior of its own |
| `testid:e2e-card-title` | div | 2026-08-31 | out-of-scope: not-interactive title element carrying no behavior of its own |
| `testid:e2e-popover-trigger` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-004 |
| `testid:e2e-card-content` | div | 2026-08-31 | out-of-scope: not-interactive content wrapper carrying no behavior of its own |
| `testid:e2e-toggle-group` | group | 2026-08-31 | out-of-scope: not-interactive radio-group container — behavior carried by the toggle-keyword radio row below |
| `testid:e2e-toggle-keyword` | radio | 2026-08-31 | covered-by-TC: TC-ISR-PRS-002 |
| `testid:e2e-search-input` | input | 2026-08-31 | covered-by-TC: TC-ISR-PRS-003 |
| `testid:e2e-barcode-input` | input | 2026-08-31 | covered-by-TC: TC-ISR-PRS-013 |
| `testid:e2e-checkbox` | checkbox | 2026-08-31 | covered-by-TC: TC-ISR-PRS-002 (defaults via Reset) + TC-ISR-PRS-012 (quantity filter) |
| `struct:input\|\|e2e-search-section-wrapper/e2e-search-form/div/div/div/div` | input | 2026-08-31 | covered-by-TC: TC-ISR-PRS-007 (the location dropdown's typeahead input, exercised when the list opens) |
| `struct:combobox\|Select Location\|e2e-search-form/div/div/div/div/div` | combobox | 2026-08-31 | covered-by-TC: TC-ISR-PRS-007 + TC-ISR-PRS-009 |
| `struct:button\|Open popover\|e2e-search-section-wrapper/e2e-search-form/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-011 |
| `testid:e2e-reset-button` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-002 |
| `testid:e2e-search-button` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-003 |
| `struct:button\|Collapse search panel\|div/skip/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-019 |
| `struct:button\|Product Group\|div/div/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PGR-001 (navigation opener to the sibling page; probed live 2026-08-31) |
| `id:radix-_r_83_` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-017 (Grid Options trigger in the resting state) |
| `struct:th\|Category\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9d_` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-014 (Category header menu — sort both directions) · provenance: live · evidence: reports/walk-coverage/isr.json |
| `struct:button\|Resize column MajorCategory\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-MajorCategory (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Sub Category\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9f_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-SubCategory (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `struct:button\|Resize column SubCategory\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-SubCategory (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Class\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9h_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-Class (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `struct:button\|Resize column Class\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-Class (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Product Group\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9j_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-ProductGroup (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `struct:button\|Resize column GroupName\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-GroupName (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Sub Class\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9l_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-SubClass (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `struct:button\|Resize column SubClass\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-SubClass (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Item\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9n_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-Item (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `struct:button\|Resize column Item\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-Item (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Product Code ID\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9p_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-ProductCodeID (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `struct:button\|Resize column ProductCodeID\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-ProductCodeID (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Description\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9r_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-Description (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `struct:button\|Resize column Description\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-Description (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Available\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9t_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-Available (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `struct:button\|Resize column Available\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-Available (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Owned\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_9v_` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-017 (Owned header menu — hide/restore cycle) · provenance: live · evidence: .playwright-cli/isr-2026-08-31/col-menu-owned.yml |
| `struct:button\|Resize column Owned\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-Owned (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Out of Service\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `id:radix-_r_a1_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-OutofService (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `id:radix-_r_a3_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-InSequence (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `id:radix-_r_a5_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-LocationName (same sort and hide menu archetype as the live-probed Category and Owned columns) |
| `struct:button\|Resize column OutOfService\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-OutOfService (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|In Sequence\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `struct:button\|Resize column InSequence\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-InSequence (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Location Name\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/prs-th-click-menu-open.yml (2026-09-01 probe, 13/13 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/prs-positive-control-category-menu.yml) |
| `struct:button\|Resize column Location\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-Location (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:combobox\|50\|div/div/div/div/div/div` | combobox | 2026-08-31 | covered-by-TC: TC-ISR-PRS-016 |
| `struct:button\|Go to first page\|div/div/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-015 |
| `struct:button\|Go to previous page\|div/div/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-015 |
| `struct:input\|Current page number\|div/div/div/div/div/span` | input | 2026-08-31 | deferred-to-DEEP: page-number-input (direct page entry is beyond the single move-page assertion this tier carries) |
| `struct:button\|Go to next page\|div/div/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PRS-015 |
| `struct:button\|Go to last page\|div/div/div/div/div/div` | button | 2026-08-31 | deferred-to-DEEP: last-page-button (last-page jump is beyond the single move-page assertion this tier carries) |
| `role:menuitem:Reset to Default View` | menuitem | 2026-08-31 | covered-by-TC: TC-ISR-PRS-017 (menu itemization assert; invoking the reset is deep-tier) |
| `struct:combobox\|Select Region\|e2e-search-form/div/div/div/div/div` | combobox | 2026-08-31 | covered-by-TC: TC-ISR-PRS-008 + TC-ISR-PRS-009 |
| `struct:combobox\|Open popover\|e2e-search-form/div/div/div/div/div` | combobox | 2026-08-31 | covered-by-TC: TC-ISR-PRS-010 |

### State supplement — search:executed (29 elements, reports/walk-coverage/isr--search-executed.json)

All 29 keys re-enumerate controls already dispositioned above (search panel 18, Product Group button, Collapse, pagination cluster 6, rows-per-page, More information, sidebar toggle) plus `id:radix-_r_17_` — the Grid Options trigger as re-mounted in this state → covered-by-TC: TC-ISR-PRS-017. No new un-dispositioned element exists in this state; result ROWS are data (assertions ride TC-ISR-PRS-003/012/014/015), and the row-selection toolbar is the sibling artifact's opener frontier.

### State supplement — expand:grid-options (63 elements, reports/walk-coverage/isr--expand-grid-options.json)

Adds the full column-header set (13 th + 13 menu ids + 13 resize — dispositions identical to the manifest rows above) and `id:radix-_r_#_ [archetype×6]` — the archetype-collapsed Grid Options menu internals (Reset to Default View + column checkboxes) → covered-by-TC: TC-ISR-PRS-017 (hide/restore cycle + menu itemization) · provenance: live · evidence: .playwright-cli/isr-2026-08-31/grid-options-menu.yml. Remaining keys duplicate the resting dispositions.

### §3 surface families (LR-065)

The result grid is a genuine result surface. Families dispositioned `behavior-cases:` as follows —
- **result-fidelity** → TC-ISR-PRS-003 (QUICK)
- **pagination** → TC-ISR-PRS-015 + 016 (QUICK)
- **sorting** → TC-ISR-PRS-014 (QUICK)
- **empty-vol** → TC-ISR-PRS-013 (QUICK)
- **persistence** → TC-ISR-PRS-018 (QUICK)
- **combination** → TC-ISR-PRS-009 + 012 (QUICK — exclusivity + additive filter)
- `out-of-scope:render-state=no link-cells or state-badge cells in this grid; all cells are plain text or numbers and none navigates`

### Opener frontier (state-graph exhaustion)

Not empty — recorded per §20-Q:
- **Row-selection toolbar + Product Code dialogs + availability**: agent-walked with snapshots; inventoried in `item-search-product-code-2026-08-31.md`.
- **Per-column menus**: Category + Owned opened live; the remaining 11 are the same archetype → deferred rows above.
- **Product Organization popover / date calendars / Search-help popover**: opened live (snapshots in `.playwright-cli/isr-2026-08-31/`).
- **Out-of-module**: app-shell chrome (sidebar, office switcher, top navigation) — enumerated, deliberately not opened; page chrome outside the module denominator.
