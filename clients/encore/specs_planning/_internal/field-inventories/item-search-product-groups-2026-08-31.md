# Field Inventory — Item Search: Product Groups page (PGR)

**Module**: item-search-product-groups
**Client**: encore
**MCP_Session_Date**: 2026-08-31
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Unattended catalog walk (3 machine enumerations + agent probes) with grep-over-disk YAML snapshots; no visual/CSS assertion and no fresh-auth need, so LR-038 v2 selects the Playwright CLI path (`playwright-cli`, session isr2, state-load of the shared auth).
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups
**Test_Entity**: Office 1101 - Corporate Office Encore USA SGA (admin-only feature; plan-pinned)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md
**Walk_Mode**: quick

Coverage_Ratio: 28/28 (100%) — the resting-state machine denominator, every row dispositioned below. The two sibling states (search:executed 28, dialog:add-group 24) are fully dispositioned in the state supplements; the Add PAGE's own form (a route, not a dialog — branch label is a recorded misnomer) is agent-walked per §20-Q with snapshot evidence.
Completion_Record: reports/walk-coverage/isr-pgr.json (status=complete, elements=28) · reports/walk-coverage/isr-pgr--search-executed.json (status=complete, elements=28) · reports/walk-coverage/isr-pgr--dialog-add-group.json (status=complete, elements=24)
Walk_State: module=item-search-product-groups walked=[resting,search:executed,dialog:add-group]
CrossCheck: clean — no A△B review-set elements were flagged by the enumerator for these runs; every key sits in the union denominator and is dispositioned.
jira_tickets: [NM-2253, NM-1881, NM-1921]
baselineScope: baseline-absent (environment-blocked — see Baseline_Artifact; 6 access attempts, TLS reset for automated browsers, curl 200)

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups` — Product Groups list (search panel + 4-column grid; no rows until Search).
- `…/products/product-groups/add` — the Add Product Group PAGE (reached by the Add button; a route, not a dialog). Left: sub-class item picker (search box + long list). Right: Name* / Description* / Service Type* / Active + Sub Classes dual-list ("Drag or double-click items from the left to add sub-classes") + Cancel + Save.
- The "Products" link navigates back to the Products page (link present in the machine denominator; navigation unprobed at this tier).

## Live-state caveat

| Field | Live (2026-08-31) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Search Product Groups text | last EXECUTED search value | empty | Executed criteria persist in browser storage across reloads ("Audio" search → away-and-back → text + 82-result set restored). Unexecuted input does NOT persist (typed text without Search was dropped on return — proven live). |
| Grid rows | last executed result set (or empty) | empty until Search | Same persistence; no auto-search on load. |

## Field Inventory

### Search panel + toolbar (PGR)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Search Product Groups | `(none) — placeholder "Search Product Groups..."` | Plain text | empty (after Reset) | none observed | enabled | filters groups by name/description match | "Audio" → "82 product groups found", 20 rows/page. Empty text + Search → "0 product groups found" (divergent from the Products page's return-all; stable ×3 polls ×2 runs — discussion item). `affordance: none`. |
| Active | `e2e-checkbox` | Checkbox (native + Radix) | checked | n/a | enabled | filters to active groups | Stays checked through Reset (probed live). `affordance: none`. |
| Reset | `(none) — text "Reset"` | *(action)* | n/a | n/a | enabled | clears the text, empties results to "0 product groups found", keeps Active checked | Probed live 2026-08-31 (~15:26 UTC). |
| Search | `(none) — text "Search"` | *(action)* | n/a | n/a | enabled | executes the group search | |
| Add | `(none) — text "Add"` | *(action)* | n/a | n/a | enabled | navigates to the Add Product Group page | `affordance: navigation → …/product-groups/add`. |
| Collapse search panel | `(none) — accessible name` | *(action)* | n/a | n/a | enabled | none | Same widget as the Products page; per-state re-verification deferred. |
| Products (link) | `(none) — link text "Products"` | *(action)* | n/a | n/a | enabled | back-navigation to the Products page | Unprobed at this tier (deferral row in the manifest). |

### Result grid (PGR)

- 4 columns: Name, Description, Service Type, Status. Sample row: "Audio Adaptor · Audio Adaptor · Equipment Rental · Active".
- Column headers carry per-column menu buttons (same archetype as the Products grid) — unprobed here at this tier.
- Pagination: rows-per-page **20 default** (differs from the Products page's 50), page textbox, first/prev/next/last; "Audio" (82 found) paginates 5 pages.

### Add Product Group page (agent-walked, §20-Q — snapshot `.playwright-cli/isr-2026-08-31/pgr-add-page.yml`)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Name | `(none) — placeholder "Enter Product Group Name"` | Plain text | empty | required (Save stays disabled with it empty; typed value alone did not enable Save) | enabled | n/a | `affordance: none`. |
| Description | `(none) — placeholder "Enter Product Group Description"` | Plain text | empty | required | enabled | n/a | `affordance: none`. |
| Service Type | `(none) — trigger shows "Service Type"` | Dropdown / combobox (Radix) | placeholder | required | enabled | n/a | Options unenumerated at this tier (deferral). |
| Active | `(none) — checkbox in the form` | Checkbox (native + Radix) | checked | n/a | enabled | n/a | |
| Sub Classes | `(none) — dual-list region` | Drag-and-drop source row (dual-list picker) | empty; instruction "Drag or double-click items from the left to add sub-classes" | required (starred) | enabled | picker search box filters the left list | Left list is very large (whole sub-class catalog). Drag path + double-click add are deep-tier; structure asserted at this tier. |
| Cancel | `(none) — text "Cancel"` | *(action)* | n/a | n/a | enabled | returns to the list page; typed input discarded silently (no unsaved-changes prompt — probed live with Name="X") | |
| Save | `(none) — text "Save"` | *(action)* | n/a | n/a | **disabled** at rest and with only Name filled | validity-gated | Never clicked — nothing was persisted during this walk. |

## Labels + Section Names

- Search panel: "Search Product Groups..." · "Active" · "Reset" · "Search" · "Add" · "Products" (link).
- Grid: "Name" · "Description" · "Service Type" · "Status" · "N product groups found" · "rows per page".
- Add page: "Add" (heading) · "Name" · "Description" · "Service Type" · "Active" · "Sub Classes" · "Drag or double-click items from the left to add sub-classes" · "Cancel" · "Save".

## Save-cycle observations

### Save button behavior
Add-page Save only; disabled at rest and while required fields are incomplete (Name alone did not enable it). Never clicked in this walk — no group was created.

### Save dialog
Not observed — no save executed. Unknown, not absent.

### Post-save toast
Not observed — same reason.

### Dirty-state behavior
No unsaved-changes guard: Cancel with a typed Name returned to the list silently, input discarded (probed live). Consistent with the module-wide guard absence (3 probes across surfaces).

## Observations

### Bugs / Defects
- Empty-criteria search returns "0 product groups found" while the sibling Products page returns the full set on empty criteria — divergent sibling semantics, stable across retries (walk-evidence § Observations item 3; discussion item, behavior asserted as live truth by TC-ISR-PGR-003 with a note).

### Suggestions / Improvements
- Align the empty-search semantics (or hint "type to search") between the two sibling pages.
- Align the default rows-per-page (20 here vs 50 on Products) or make the difference deliberate.

## LR-029 missing-testid report

Verified against live DOM by the enumerator (2026-08-31 runs), not from a static grep.

| Control | Surface | Has testid | Next-best stable anchor |
|---|---|---|---|
| Active checkbox | search panel | **yes** (`e2e-checkbox`) | n/a |
| Search text, Reset, Search, Add, Products link, Collapse | search panel | no | placeholder / text content / accessible name |
| Grid headers, column menus, resize handles | grid | no | role+name |
| Pagination cluster | grid footer | no | accessible names |
| Add-page form fields | add page | no | placeholders ("Enter Product Group Name" / "Enter Product Group Description"), text content for buttons |

## Staleness signal

- **Last verified**: 2026-08-31
- **Fresh-until**: 2026-09-14
- **Stale-after**: 2026-09-30
- **Refresh triggers**: column set ≠ 4 · rows-per-page default ≠ 20 · Add becomes a dialog (route change) · empty-search semantics change (discussion item resolves) · the Sub Classes picker gains testids.

## Coverage Manifest (machine-enumerated)

Machine denominator: **28** — the resting state. Provenance: `reports/walk-coverage/isr-pgr.json` (28, resting). All 28 rows dispositioned. **Coverage_Ratio: 28/28.**

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `struct:button\|trigger-button\|div/div/skip/div/div/div` | button | 2026-08-31 | out-of-scope: outside-module — app-shell sidebar toggle (Navigator shell chrome outside every products-module denominator; the same control is enumerated by the sibling item-search inventories) |
| `struct:a\|Products\|div/div/div/div/div/div` | a | 2026-08-31 | deferred-to-DEEP: products-back-link (back-navigation link unprobed at this tier; navigation affordance only) |
| `struct:input\|Search Product Groups...\|form/div/div/div/div/div` | input | 2026-08-31 | covered-by-TC: TC-ISR-PGR-002 |
| `testid:e2e-checkbox` | checkbox | 2026-08-31 | covered-by-TC: TC-ISR-PGR-005 |
| `struct:input\|\|div/form/div/div/div/div` | input | 2026-08-31 | deferred-to-DEEP: unnamed-search-form-input (identity unresolved at this tier; no visible control maps to it on the panel) |
| `struct:button\|Reset\|div/div/div/div/form/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PGR-005 |
| `struct:button\|Search\|div/div/div/div/form/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PGR-002 |
| `struct:button\|Collapse search panel\|div/skip/div/div/div/div` | button | 2026-08-31 | deferred-to-DEEP: pgr-collapse-toggle (same widget as the products page; per-state re-verification is deep-tier here) |
| `struct:button\|Add\|div/div/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PGR-006 |
| `id:radix-_r_#_ [archetype×5]` | button | 2026-08-31 | deferred-to-DEEP: pgr-column-menu-items (menu internals unprobed at this tier; same archetype as the products-page column menus) |
| `struct:th\|Name\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/pgr-th-click-menu-open.yml (2026-09-01 probe, 4/4 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/pgr-positive-control-name-menu.yml) |
| `struct:button\|Resize column productGroupName\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-productGroupName (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Description\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/pgr-th-click-menu-open.yml (2026-09-01 probe, 4/4 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/pgr-positive-control-name-menu.yml) |
| `struct:button\|Resize column productGroupDescription\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-productGroupDescription (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Service Type\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/pgr-th-click-menu-open.yml (2026-09-01 probe, 4/4 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/pgr-positive-control-name-menu.yml) |
| `struct:button\|Resize column serviceTypeName\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-serviceTypeName (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:th\|Status\|div/div/div/table/thead/tr` | th | 2026-08-31 | affordance-probed: affordance: popover → column sort/hide menu (th click delegates to the embedded column-menu trigger; per-column menu coverage rides the colmenu dispositions) · provenance: live · evidence: .playwright-cli/isr-2026-09-01/pgr-th-click-menu-open.yml (2026-09-01 probe, 4/4 th clicks → menu:true oracle after each, aria-sort untouched, no navigation; positive control .playwright-cli/isr-2026-09-01/pgr-positive-control-name-menu.yml) |
| `struct:button\|Resize column active\|div/div/table/thead/tr/th` | button | 2026-08-31 | deferred-to-DEEP: resize-active (column-resize drag mechanics and geometry assertions are deep-tier work) |
| `struct:combobox\|20\|div/div/div/div/div/div` | combobox | 2026-08-31 | covered-by-TC: TC-ISR-PGR-004 |
| `struct:button\|Go to first page\|div/div/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PGR-004 |
| `struct:button\|Go to previous page\|div/div/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PGR-004 |
| `struct:input\|Current page number\|div/div/div/div/div/span` | input | 2026-08-31 | deferred-to-DEEP: pgr-page-number-input (direct page entry is beyond the single move-page assertion this tier carries) |
| `struct:button\|Go to next page\|div/div/div/div/div/div` | button | 2026-08-31 | covered-by-TC: TC-ISR-PGR-004 |
| `struct:button\|Go to last page\|div/div/div/div/div/div` | button | 2026-08-31 | deferred-to-DEEP: pgr-last-page-button (last-page jump is beyond the single move-page assertion this tier carries) |
| `id:radix-_r_1p_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-pgrName (per-column sort menu unprobed at this tier on the product-groups grid) |
| `id:radix-_r_1r_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-pgrDescription (per-column sort menu unprobed at this tier on the product-groups grid) |
| `id:radix-_r_1t_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-pgrServiceType (per-column sort menu unprobed at this tier on the product-groups grid) |
| `id:radix-_r_1v_` | button | 2026-08-31 | deferred-to-DEEP: colmenu-pgrStatus (per-column sort menu unprobed at this tier on the product-groups grid) |

### State supplement — search:executed (28 elements, reports/walk-coverage/isr-pgr--search-executed.json)

Re-enumerates the same controls with the grid populated; `id:radix-_r_10_` (an additional header-cluster button in this state) → deferred-to-DEEP: pgr-grid-options-state-button (unmapped header-cluster control in the searched state; same menu archetype family). All other keys carry the manifest dispositions above. Result ROWS are data (assertions ride TC-ISR-PGR-002/004/010).

### State supplement — dialog:add-group (24 elements, reports/walk-coverage/isr-pgr--dialog-add-group.json)

The branch clicked Add; the enumerated key set matches the list page (the run's snapshot preceded the route change — the label "dialog" is a recorded misnomer; Add is a page route). All 24 keys duplicate manifest dispositions above. The Add PAGE's form is agent-walked: fields inventoried in the Add-page table with snapshot evidence (`pgr-add-page.yml`), covered by TC-ISR-PGR-006/007/008; the dual-list drag path and Service Type option set are deep-tier (deferral rows conceptually ride the picker fields, recorded here: deferred-to-DEEP: pgr-add-duallist-drag (drag-to-add mechanics on the sub-class picker are deep-tier work) · deferred-to-DEEP: pgr-add-servicetype-options (option-set enumeration for the add-form dropdown is deep-tier here)).

### §3 surface families (LR-065)

The group list is a result surface. Families dispositioned —
- **result-fidelity** → TC-ISR-PGR-002 (QUICK)
- **pagination** → TC-ISR-PGR-004 (QUICK)
- **empty-vol** → TC-ISR-PGR-003 (QUICK — the live zero-on-empty contract)
- **persistence** → TC-ISR-PGR-009 (QUICK)
- **render-state** → TC-ISR-PGR-010 (QUICK — Status column shows Active under the active filter)
- `out-of-scope:sorting=per-column menus unprobed on this grid at this tier; the four colmenu deferral rows above carry the family to the deep pass`
- `out-of-scope:combination=single text filter plus one checkbox; no multi-criteria intersection exists on this panel to combine`

### Opener frontier (state-graph exhaustion)

- **Add page**: opened + walked (snapshot evidence); its dual-list drag path + dropdown options deferred.
- **Per-column menus (4)**: enumerated, unopened at this tier — deferral rows above.
- **Products back-link**: enumerated, unclicked — deferral row above.
- **Out-of-module**: app-shell chrome — enumerated, deliberately not opened.

## Save & cleanup disposition (2026-09-02)

- **Create Product Group save is now covered** by TC-ISR-PGR-011: a completed Add page (Name / Description / Service Type / ≥1 Sub Class added by double-click) saves via `POST /navigator/api/location/add-update-product-group` — verified live, product group id 4581 — and is confirmed by a Product Groups search-back per LR-067.
- **Cleanup**: there is no hard delete for a product group, and the deactivate-via-edit path was **not** pinned this pass, so the create case leaves its per-run-unique group on 1101. This accumulation is accepted test residue on the fully-writable e2e environment (LR-ENC-007), stated here rather than hidden.
- **Sub-class add path**: the reliable **double-click** path is covered; the drag path is a deferral (flaky, frequently never fires the drop).
