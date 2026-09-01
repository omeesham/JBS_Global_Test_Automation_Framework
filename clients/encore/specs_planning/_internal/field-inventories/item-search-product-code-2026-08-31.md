# Field Inventory — Item Search: Product Code dialogs (PCD)

**Module**: item-search-product-code
**Client**: encore
**MCP_Session_Date**: 2026-08-31
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Agent-driven dialog walk (multi-step states beyond the one-click machine branches) with grep-over-disk YAML snapshots; LR-038 v2 selects the Playwright CLI path (`playwright-cli`, session isr2).
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products (dialogs mount over the searched grid with a row selected)
**Test_Entity**: Office 1101 - Corporate Office Encore USA SGA
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md
**Walk_Mode**: quick

Coverage_Ratio: 94/94 (100%) — the dialog:view-product-code machine denominator (re-enumerated 2026-09-01 after the portal-scan disabled-status fix), every row dispositioned in the Coverage Manifest below. The sibling dialog:add-product-code state (82 elements) is fully dispositioned in the state supplement after the manifest: 80 of its keys re-enumerate view-state controls (same dispositions) and its 2 add-only keys are dispositioned in the supplement.
Completion_Record: reports/walk-coverage/isr-pcd--dialog-view-product-code.json (status=complete, elements=94) · reports/walk-coverage/isr-pcd--dialog-add-product-code.json (status=complete, elements=82)
Walk_State: module=item-search-product-code walked=[dialog:view-product-code,dialog:add-product-code]
CrossCheck: clean — no A△B review-set elements were flagged by the enumerator for these runs; every key sits in the union denominator and is dispositioned.

> **Denominator note (updated 2026-09-01)**: the original 2026-08-31 walk carried no machine
> manifest — the dialogs are multi-step states (search → row click → toolbar button) the one-click
> branch mechanism could not reach, so this artifact was a §20-Q opener-frontier record only. On
> 2026-09-01 `enumerate-page.mjs` gained a `preSteps` branch mechanism (search → row select →
> opener click, with dialog `readySelector` + portal-aware branch scanning), and both dialog
> states were machine-enumerated: the Coverage Manifest below is that machine denominator. The
> agent-driven census (per-element snapshot evidence `.playwright-cli/isr-2026-08-31/dlg-*.yml`,
> `caret-*.yml`, `add-*.yml`, cross-verified in `walk-evidence-item-search-2026-08-31.md`) remains
> the per-element PROBE record the machine rows corroborate. Nothing was saved: every dialog was
> closed without persisting (close-discards proven).

jira_tickets: [NM-2253, NM-1921, NM-1982, NM-1983, NM-2077, NM-2100, NM-2111]
baselineScope: baseline-absent (environment-blocked — see Baseline_Artifact)

---

## URL(s) visited

- Products page (office 1101), searched grid, row selected → toolbar:
  - **View Product Code** → "Product Code Details" dialog, 3 tabs (Item / Product Code History / Translations), default scope Item.
  - **View caret** → segment menu (Item / Sub Class / Class / Sub Category / Category) rescoping the dialog (first tab renames).
  - **Add Product Code** → same-named dialog, single tab, new-entry form for the chosen segment.
  - **Add caret** → same 5-segment menu for the add flow.
  - **View Availability** → no UI response (defect candidate under the owner's dates-not-functional ruling; see Observations).

## Live-state caveat

| Field | Live (2026-08-31) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Dialog field values (View) | the selected row's hierarchy chain | row-dependent | The dialog renders the selected product's data; nothing here is a fixed default except the Add form's empty state. |
| Save (both dialogs) | disabled | disabled until the form is valid (Add) / enablement condition undetermined (View) | Typing into the View dialog's Name changed the value but Save stayed disabled after blur — view-mode vs validity-gate is undetermined on a row whose required chain is incomplete. Never asserted either way. |

## Coverage Manifest (machine-enumerated, 2026-09-01)

Machine denominator: **94** — the dialog:view-product-code state. Provenance: `reports/walk-coverage/isr-pcd--dialog-view-product-code.json` (94, dialog:view-product-code; re-enumerated 2026-09-01). All 94 rows dispositioned, in machine order, keys verbatim. **Coverage_Ratio: 94/94.** Tally: 30 covered-by-TC · 63 out-of-scope (62 host-page controls beneath the open dialog → dispositioned by the product-search inventory; 1 app-shell sidebar toggle) · 1 deferred-to-DEEP (recipient seed `owned-count-cell-edit` in plans/pending/SUBPLAN_PRODUCTS_DQU.md).

Reading notes:
- The two segment-menu carets enumerate as unnamed session-variant `id:radix` buttons; they are bound by DOM order (first = View toolbar caret, second = Add toolbar caret) — the binding is stated in each row's disposition.
- Radix id → control map (this run's session-variant ids, informational only): `_r_1b_`=Grid Options · `_r_15b_`=Out of Service · `_r_14n_`=Category · `_r_14p_`=Sub Category · `_r_14r_`=Class · `_r_14t_`=Product Group · `_r_14v_`=Sub Class · `_r_#_`=Item (+archetype siblings) · `_r_15d_`=In Sequence · `_r_15f_`=Location Name.
- Disabled-at-rest controls (Save, Select service type, Barcodeable checkbox, the read-only input, first/previous pagination) carry `disabled: true` in the enumeration JSON — the machine evidence of the disabled contracts the TCs assert.

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `struct:button|trigger-button|div/div/skip/div/div/div` | button | 2026-09-01 | out-of-scope: outside-module — app-shell sidebar toggle (Navigator shell chrome outside every products-module denominator; the same control is enumerated by the sibling item-search inventories) |
| `struct:button|More information|skip/div/div/div/div/div` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-search-section-wrapper` | div | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-search-form` | form | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-card` | div | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-card-header` | div | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-card-title` | div | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-popover-trigger` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-card-content` | div | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-toggle-group` | group | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-toggle-keyword` | radio | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-search-input` | input | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-barcode-input` | input | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-checkbox` | checkbox | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:input||e2e-search-section-wrapper/e2e-search-form/div/div/div/div` | input | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:combobox|Select Location|e2e-search-form/div/div/div/div/div` | combobox | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:combobox|Select Region|e2e-search-form/div/div/div/div/div` | combobox | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:combobox|Open popover|e2e-search-form/div/div/div/div/div` | combobox | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Open popover|e2e-search-section-wrapper/e2e-search-form/div/div/div/div` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-reset-button` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `testid:e2e-search-button` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Collapse search panel|div/skip/div/div/div/div` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Product Group|div/div/div/div/div/div` | button | 2026-09-01 | covered-by-TC: TC-ISR-PCD-001 |
| `struct:button|View Availability|div/div/div/div/div/div` | button | 2026-09-01 | covered-by-TC: TC-ISR-PCD-010 |
| `struct:button|View Product Code|div/div/div/div/div/div` | button | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `id:radix-_r_k5_` | button | 2026-09-01 | covered-by-TC: TC-ISR-PCD-005 (View toolbar segment-menu caret — unnamed session-variant Radix trigger, first unnamed toolbar caret in DOM order) |
| `id:radix-_r_k7_` | button | 2026-09-01 | covered-by-TC: TC-ISR-PCD-008 (Add toolbar segment-menu caret — unnamed session-variant Radix trigger, second unnamed toolbar caret in DOM order) |
| `struct:button|Add Product Code|div/div/div/div/div/div` | button | 2026-09-01 | covered-by-TC: TC-ISR-PCD-006 |
| `id:radix-_r_1b_` | button | 2026-09-01 | covered-by-TC: TC-ISR-PRS-017 |
| `id:radix-_r_15b_` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Category|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `id:radix-_r_14n_` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column MajorCategory|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Sub Category|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `id:radix-_r_14p_` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column SubCategory|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Class|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `id:radix-_r_14r_` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column Class|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Product Group|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `id:radix-_r_14t_` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column GroupName|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Sub Class|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `id:radix-_r_14v_` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column SubClass|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Item|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `id:radix-_r_#_ [archetype×5]` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column Item|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Product Code ID|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column ProductCodeID|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Description|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column Description|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Available|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column Available|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Owned|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column Owned|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Out of Service|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column OutOfService|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|In Sequence|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `id:radix-_r_15d_` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column InSequence|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:th|Location Name|div/div/div/table/thead/tr` | th | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `id:radix-_r_15f_` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Resize column Location|div/div/table/thead/tr/th` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|locations.product.ownedCount|div/div/table/tbody/tr/td` | button | 2026-09-01 | deferred-to-DEEP: owned-count-cell-edit (in-grid quantity editing is beyond the QUICK L1 case set for this module) |
| `struct:button|locations.product.selectItem|div/div/table/tbody/tr/td` | button | 2026-09-01 | covered-by-TC: TC-ISR-PCD-001 |
| `struct:combobox|50|div/div/div/div/div/div` | combobox | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Go to first page|div/div/div/div/div/div` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Go to previous page|div/div/div/div/div/div` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:input|Current page number|div/div/div/div/div/span` | input | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Go to next page|div/div/div/div/div/div` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `struct:button|Go to last page|div/div/div/div/div/div` | button | 2026-09-01 | out-of-scope: outside-module — host Products page control beneath the open dialog; enumerated and dispositioned by the product-search inventory (item-search-product-search-2026-08-31.md) |
| `role:tab:Item` | tab | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:tab:Product Code History` | tab | 2026-09-01 | covered-by-TC: TC-ISR-PCD-003 |
| `role:tab:Translations` | tab | 2026-09-01 | covered-by-TC: TC-ISR-PCD-004 |
| `role:combobox:Digital Services Labor` | combobox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:select:Administrative LaborAudio LaborBusiness ` | select | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:combobox:Setup Charges` | combobox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:select:Application DevelopmentApplication Devel` | select | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:combobox:Content1 Labor` | combobox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:select:Attendee Tracking LaborBespoke Programmi` | select | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:combobox:Operator Labor` | combobox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:combobox:Please select` | combobox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-007 |
| `role:select:Abstracts - Project ManagementContent1 L` | select | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:combobox:Select service type` | combobox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-007 |
| `role:checkbox:` | checkbox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:input:` | input | 2026-09-01 | covered-by-TC: TC-ISR-PCD-009 |
| `role:combobox:NoneNone` | combobox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:combobox:CONSUMABLE` | combobox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:select:CABLES AND CONSUMABLECONSUMABLEDAMAGE WA` | select | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:combobox:Audio Conferencing` | combobox | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:select:APP DownloadedApp Quality AssuranceApp Q` | select | 2026-09-01 | covered-by-TC: TC-ISR-PCD-002 |
| `role:button:Save` | button | 2026-09-01 | covered-by-TC: TC-ISR-PCD-006 |
| `role:button:Close` | button | 2026-09-01 | covered-by-TC: TC-ISR-PCD-009 |

### State supplement — dialog:add-product-code (82 elements, reports/walk-coverage/isr-pcd--dialog-add-product-code.json)

80 of the 82 keys re-enumerate controls already dispositioned in the manifest above (host-page substrate + shared dialog chrome + toolbar; dispositions identical). The 2 add-only keys:

- `role:combobox:Select product type` (combobox) → covered-by-TC: TC-ISR-PCD-007
- `role:select:` (select, disabled at rest) → covered-by-TC: TC-ISR-PCD-007 (empty-name native select backing the Add form cascade pair; options populate on Product Type selection)

## Field Inventory

### View Product Code — "Product Code Details" dialog, Item tab (snapshot dlg-view-pc.yml)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Category section (Name / Product Type / Service Type) | `(none)` | read-only text trio | selected row's category chain | n/a | static | n/a | `affordance: none` (display trio). |
| Sub-Category Name | `(none) — combobox in the Sub Category section` | Dropdown / combobox (Radix) | row value | starred (required) | enabled | its Service Type pairs with it | `affordance: none` beyond selection. |
| Sub-Category Service Type | `(none)` | Dropdown / combobox (Radix) | row value | starred | enabled | n/a | |
| Class Name / Class Service Type | `(none)` | Dropdown / combobox (Radix) ×2 | row values | starred | enabled | n/a | |
| Sub-Class Name | `(none)` | Dropdown / combobox (Radix) | "Please select" on the probed row | starred | enabled | **cascade**: while unset, the Sub-Class Service Type below is disabled | Cascade evidenced at rest in this dialog. |
| Sub-Class Service Type | `(none)` | Cascading dropdown | "Select service type" | starred | **disabled** until Sub-Class Name chosen | cascades from Sub-Class Name | |
| Barcodeable | `(none)` | Checkbox (native + Radix) | unchecked (probed row) | n/a | **disabled** | n/a | |
| Product Organization (section + item) | `(none) — "Open popover" trigger` | Dropdown / multi-select popover | None | n/a | enabled | n/a | Same country checklist as the search panel. |
| Item Name | `(none) — placeholder "Enter name"` | Plain text | row value | starred | enabled | n/a | Typed "X" → value committed, Save stayed disabled (see caveat). |
| Item Description | `(none) — placeholder "Enter item description"` | Plain text | row value | starred | enabled | n/a | |
| Oracle Item Number | `(none) — placeholder "Enter oracle item number"` | Plain text | empty (probed row) | none observed | enabled | n/a | |
| Item Product Type | `(none)` | Dropdown / combobox (Radix) | row value (CONSUMABLE on probed row) | starred | enabled | pairs with Item Service Type | |
| Item Service Type | `(none)` | Dropdown / combobox (Radix) | row value | starred | enabled | n/a | |
| Active | `(none)` | Checkbox (native + Radix) | checked (probed row) | n/a | enabled | n/a | |
| Product Code ID | `(none)` | read-only text | row value (73753 probed) | n/a | static | n/a | `affordance: none`. |
| Save | `(none) — text "Save"` | *(action)* | disabled | n/a | disabled (see caveat) | n/a | Never clicked. |
| Close (footer) + Close (X) | `(none) — text/name "Close"` | *(action)* ×2 | n/a | n/a | enabled | n/a | Both close; a dirty form closes silently (no prompt) — probed. |

### Product Code History tab (snapshot dlg-pc-history.yml)

15-column read-only audit grid: Action, Parent Name, Product Name, Product Description, Product Type, Service Type Name, Product Group, Barcodeable, Weight, Eligible, Oracle Item Number, Active, Product Organization, Modified By, Modified Date — plus the tab's OWN Grid Options button (per-state chrome, separate from the page-level one). Column menus/resize as on the main grid. Deep-tier: in-dialog grid behaviors.

### Translations tab (snapshot dlg-pc-translations.yml)

"Translations for Item" — 4 rows (English (Canada), US English, Spanish (Mexico), French (Canada)) × editable Name + Description textboxes. Save-cycle deep-tier (nothing typed was saved).

### Segment caret menus (View + Add; snapshots caret-view-pc.yml / caret-add-pc.yml)

Both menus list: Item · Sub Class · Class · Sub Category · Category. Selecting rescopes the dialog (first tab renames to the segment). ~~**View → Category silently no-ops**~~ **RESCINDED 2026-09-01**: the walk-time "View → Category no-op" was a stale-ref blind-instrument zero (CEO-M17 class) — owner-triggered LR-044 live re-verification proved Category OPENS the dialog scoped to Category via the toolbar caret (twice, error-checked clicks; evidence `.playwright-cli/isr-2026-09-01/pcd-category-dialog-open-reverify.yml`). `BUG-ISR-PCD-001` → status invalid; TC-ISR-PCD-005 extended to all-five sampling (Sub Category, Class, Category), run green 2026-09-01. All five View segments AND all five Add segments rescope correctly.

### Add Product Code — dialog, Item scope (snapshot dlg-add-pc2.yml)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Ancestor chain (Category → Sub Class) | `(none)` | read-only text sections | selected row's chain ("—" where absent) | n/a | static | n/a | |
| Name | `(none) — placeholder "Enter name"` | Plain text | empty, flagged invalid at rest | required | enabled | n/a | Error icon adjacent while empty. |
| Item Description | `(none) — placeholder "Enter item description"` | Plain text | empty, flagged invalid | required | enabled | n/a | |
| Oracle Item Number | `(none)` | Plain text | empty | none observed | enabled | n/a | |
| Product Type | `(none) — "Select product type"` | Dropdown / combobox (Radix) | placeholder | required | enabled | **cascade parent** for Service Type | 10 options: EQUIPMENT, CONSUMABLE, FREIGHT, LABOR, EXPENSE, SERVICE CHARGE, DAMAGE WAIVER, EVENT TECHNOLOGY SUPPORT, FEE, CABLES AND CONSUMABLE. |
| Service Type | `(none) — "Select service type"` | Cascading dropdown | placeholder | required | **disabled at rest**; enables on Product Type selection | filtered by the chosen Product Type (LABOR → labor-specific list of 15+: Application Development, Operator Labor, Rigging Labor, Setup Charges, …) | Cascade proven live both halves (enable + filter). |
| Product Organization | `(none) — "Open popover"` | Dropdown / multi-select popover | None | n/a | enabled | n/a | |
| Product Code ID | `(none)` | read-only text | "—" | n/a | static | n/a | |
| Save | `(none)` | *(action)* | disabled | validity-gated | disabled while required fields incomplete | n/a | Never clicked — nothing persisted. |
| Close (footer + X) | `(none)` | *(action)* | n/a | n/a | enabled | n/a | Dirty close (Product Type selected) discarded silently — probed. |

## Labels + Section Names

- Dialog: "Product Code Details" · tabs "Item" / "Product Code History" / "Translations" (View) — single scoped tab (Add).
- Sections: "Category" · "Sub Category" · "Class" · "Sub Class" · "Item"; per-section "…Name*" · "Product Type" · "Service Type*"; "Barcodeable" · "Product Organization" · "Product Code ID" · "Oracle Item Number" · "Active".
- Footer: "Save" · "Close".
- Toolbar (openers): "View Product Code" · "Add Product Code" · "View Availability" · "Product Group" · "Grid Options".

## Save-cycle observations

### Save button behavior
Both dialogs: Save disabled at rest. Add: validity-gated (stays disabled while required fields incomplete). View: stayed disabled after a committed text edit + blur on a row with an incomplete required chain — enablement condition undetermined (view-mode vs validity-gate); deliberately not asserted.

### Save dialog
Not observed — no save executed anywhere in this walk. Unknown, not absent.

### Post-save toast
Not observed — same reason.

### Dirty-state behavior
No unsaved-changes guard on either dialog: dirty View (edited Name) and dirty Add (selected Product Type) both closed silently on Close. TC-ISR-PCD-009 asserts the actual discard behavior.

## Observations

### Bugs / Defects
- **View Product Code → Category silent no-op** — full evidence + positive controls in `walk-evidence-item-search-2026-08-31.md` § Observations item 1; **filed 2026-09-01 as `BUG-ISR-PCD-001`** (the audit-phase filing note resolved — filing landed under the spec-generation identity, which holds the create right per §2). **INVALIDATED later the same day**: owner-triggered LR-044 re-verification returned FALSE/MISREAD (stale-ref blind-instrument zero; Category opens its dialog via the only reachable path — see the walk-evidence INVALIDATED annotation). Bug status → invalid; TC-ISR-PCD-005 extended to include Category and run green.
- **View Availability inert** (both a labor row and an equipment row, zero network) — owner-ruling-adjacent (dates not functional yet); walk-evidence item 2. TC-ISR-PCD-010 asserts presence/enabled only.

### Suggestions / Improvements
- Add an unsaved-changes prompt to both dialogs (silent discard of edits).
- Disable or hide View Availability while the availability feature is non-functional.

## Staleness signal

- **Last verified**: 2026-08-31
- **Fresh-until**: 2026-09-14
- **Stale-after**: 2026-09-30
- **Refresh triggers**: tab set ≠ 3 · segment menu set ≠ 5 · ~~the Category segment starts opening~~ (RESOLVED 2026-09-01: Category always opened — the walk reading was an instrument artifact; TC-ISR-PCD-005 extended) · availability goes functional (owner ruling lifts) · Save enablement condition determined (View dialog).
