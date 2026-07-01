# Corporate Pricing — New Pricebook Test Plan (NM-1440 + NM-2263)

**Module**: corporate-pricing
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md
**Field Inventory**: specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-09.md
**Divergences**: specs_planning/_internal/encore-questions-drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md
**Updated**: 2026-06-30 (Labor Save coverage — TC-051 dialog→Cancel + TC-052 commit→persist→Search, mirroring the Equipment Save flow on the Labor route)

## Scope boundary

This plan owns the **create-flow destination page** (`/add?type=equipment|labor`) — header, strategy add, product-group ADD, Save reachability — for BOTH options. It does NOT re-cover the Search `+ New ▾` dropdown affordance itself (that is TC-CPR-SRC-016/017). **No-commit default**: a created pricebook is irreversible via UI (CPR-1440-Q4), so the field-coverage save-cycle scenarios assert Save *reachability* and Cancel the confirm dialog. **ONE committing scenario (TC-CPR-NPB-031)** actually saves a pricebook and proves it persists — this environment is single-tenant (ours), so the permanent record is accepted (authorized 2026-06-26). Baseline (LR-019) = navigate fresh to the always-empty create page per test.

## Selector Mapping

> Near-zero data-testids (Doctrine 4 / D8) → text/role/placeholder/content-anchored. One usable `id` (`#new-strategy-name`). Keys mirror `clients/encore/src/selectors/corporate-pricing/new-pricebook.ts`.

| Key | Selector | Element |
|-----|----------|---------|
| hdgNewPricebook | `heading[level=1]:has-text("New Pricebook")` | Page heading |
| txtPricebookName | `input[placeholder="Pricebook..."]` | Pricebook Name (React controlled) |
| cmbType | `[role="combobox"]` near label "Labor / Equipment" | Price Book Type (disabled, route-fixed) |
| txtPriceYear | `input[placeholder="e.g. 2026"]` | Price Year (numeric-sanitized) |
| cmbCurrency | `[role="combobox"]` near label "Currency" | Currency (default USD) |
| tabPricingStrategy | `button:has-text("Pricing Strategy")` | Pricing Strategy tab |
| tabPricingDetail | `button:has-text("Pricing Detail")` | Pricing Detail tab |
| btnSave | top-level `button:text-is("Save")` | Save (disabled until savable) |
| btnNewStrategy | `getByRole('button', { name: 'New Pricing Strategy' })` | Add-strategy (+) icon button |
| lblStrategyTotal | `text=/Total:\s*\d+/` | Strategy count ("Total: N") |
| lblNoStrategies | `*:text-is("No strategies yet")` | Empty-state text |
| dlgNewStrategy | `[role="dialog"]:has-text("New Pricing Strategy")` | Add-strategy dialog |
| txtDlgStrategyName | `#new-strategy-name` (also `getByRole('textbox',{name:'Strategy Name'})`) | Dialog Strategy Name |
| chkDlgIsActive / IsGSO / IsInternal / IsProductions | dialog `getByRole('checkbox',{name})` | Dialog flags (Is Active default checked) |
| btnDlgAdd | dialog `getByRole('button',{name:'Add', exact:true})` | Dialog Add |
| btnDlgCancel | dialog `getByRole('button',{name:'Cancel', exact:true})` | Dialog Cancel |
| optCurrency | `[role="option"]` (within open Currency listbox) | Currency options USD/CAD/MXN |
| pgSourceRow | `[draggable="true"]` (Product Groups source list) | Product-group source item |
| txtSearchProductGroups | `input[placeholder="Search ID or Name..."]` | Product-group filter |
| tblDetailGrid | `table` (headers ID/Product Group Name/Price/New Price/Max Discount) | Pricebook detail grid |
| dlgSaveChanges | `[role="alertdialog"]:has-text("Save Changes")` | Save confirmation dialog |
| btnSaveChangesCancel | dialog `getByRole('button',{name:'Cancel'})` | Save-dialog Cancel (no-commit) |

## Save mechanics (page-object contract)

- React inputs filled via **native value-setter + input/change** (`setReactInput`) — `.fill()` does not commit React state.
- Strategy add: open dialog (`btnNewStrategy`) → fill `txtDlgStrategyName` → `btnDlgAdd`. Empty name ⇒ Add disabled (the guard).
- Product-group add: **double-click** a `pgSourceRow` (content-anchored).
- Save reachability: `btnSave` enabled → click → `dlgSaveChanges` appears → `btnSaveChangesCancel` (NEVER confirm in CI).

---

## Scenario: TC-CPR-NPB-001 - Equipment create page loads via route param
1. Step: Navigate to `/add?type=equipment` (office 1604), expected: page loads
2. Step: Verify title "New Pricebook | Navigator" + hdgNewPricebook, expected: visible

## Scenario: TC-CPR-NPB-002 - Pricebook Name field present + editable
1. Step: Open Equipment create page, expected: loads
2. Step: setReactInput(txtPricebookName, "X"), expected: field shows value

## Scenario: TC-CPR-NPB-003 - Type shows Equipment, disabled (route-fixed)
1. Step: Open Equipment create page, expected: loads
2. Step: Read cmbType value, expected: "Equipment"
3. Step: Assert cmbType disabled, expected: true (CPR-1440-Q1)

## Scenario: TC-CPR-NPB-004 - Price Year field present + editable
1. Step: Open create page, expected: loads
2. Step: setReactInput(txtPriceYear, "2026"), expected: field shows "2026"

## Scenario: TC-CPR-NPB-005 - Currency defaults to USD
1. Step: Open create page fresh, expected: loads
2. Step: Read cmbCurrency value, expected: "USD"

## Scenario: TC-CPR-NPB-006 - Currency dropdown offers USD/CAD/MXN
1. Step: Open create page, expected: loads
2. Step: Click cmbCurrency, expected: listbox opens
3. Step: Read optCurrency texts, expected: ["USD","CAD","MXN"]; Escape to close

## Scenario: TC-CPR-NPB-007 - Tabs render Strategy + Detail
1. Step: Open create page, expected: loads
2. Step: Verify tabPricingStrategy + tabPricingDetail present, expected: both visible

## Scenario: TC-CPR-NPB-008 - Single-char Name keeps savable
1. Step: Set Year=2026 + add one strategy, expected: Name is the only missing precondition
2. Step: setReactInput(txtPricebookName, "A"), expected: btnSave enabled

## Scenario: TC-CPR-NPB-009 - Long Name (250) accepted
1. Step: Year=2026 + one strategy, expected: ready
2. Step: setReactInput(txtPricebookName, "Z"×250), expected: value length 250, btnSave enabled

## Scenario: TC-CPR-NPB-010 - Special chars in Name accepted
1. Step: Year=2026 + one strategy, expected: ready
2. Step: setReactInput(txtPricebookName, `AT&T <Tag> #1 "Q" é`), expected: value preserved, btnSave enabled

## Scenario: TC-CPR-NPB-011 - Empty Name blocks Save
1. Step: Year=2026 + one strategy; Name empty, expected: ready except Name
2. Step: Assert btnSave, expected: disabled

## Scenario: TC-CPR-NPB-012 - Whitespace-only Name blocks Save
1. Step: Year=2026 + one strategy, expected: ready except Name
2. Step: setReactInput(txtPricebookName, "   "), expected: btnSave disabled

## Scenario: TC-CPR-NPB-013 - Empty Year blocks Save
1. Step: Name=valid + one strategy; Year empty, expected: ready except Year
2. Step: Assert btnSave, expected: disabled

## Scenario: TC-CPR-NPB-014 - Non-numeric Year rejected
1. Step: setReactInput(txtPriceYear, "2026") then attempt "abcd", expected: value stays numeric (alpha rejected)

## Scenario: TC-CPR-NPB-015 - Valid Year savable; decimal not blocked
1. Step: Name=valid + one strategy + Year="2026", expected: btnSave enabled
2. Step: setReactInput(txtPriceYear, "20.5"), expected: value "20.5", btnSave still enabled (CPR-1440-Q3 documented)

## Scenario: TC-CPR-NPB-016 - New Pricing Strategy opens dialog (Name + flags, no Type)
1. Step: Click btnNewStrategy, expected: dlgNewStrategy opens
2. Step: Inspect dialog, expected: txtDlgStrategyName + 4 flag checkboxes + Add/Cancel; no Type control (CPR-1440-Q2)

## Scenario: TC-CPR-NPB-017 - Dialog Is Active default checked
1. Step: Open dlgNewStrategy, expected: opens
2. Step: Read flags, expected: Is Active checked; others unchecked

## Scenario: TC-CPR-NPB-018 - Adding a strategy appends (Total 0->1)
1. Step: Confirm lblNoStrategies + Total: 0, expected: empty
2. Step: addStrategy("QA-Tier"), expected: dialog closes; empty-state clears; Total 1

## Scenario: TC-CPR-NPB-019 - Add second strategy (Total ->2)
1. Step: addStrategy A then addStrategy B, expected: Total 2

## Scenario: TC-CPR-NPB-020 - Add with empty name is a no-op
1. Step: Open dlgNewStrategy, leave name empty, expected: Add button disabled (the guard); Total unchanged; dialog stays open

## Scenario: TC-CPR-NPB-021 - Save disabled on empty form
1. Step: Open create page fresh, expected: loads
2. Step: Assert btnSave, expected: disabled

## Scenario: TC-CPR-NPB-022 - Save disabled without a strategy
1. Step: setReactInput Name + Year (no strategy), expected: header complete, Total 0
2. Step: Assert btnSave, expected: disabled (CPR-1440-Q5)

## Scenario: TC-CPR-NPB-023 - Save enabled with Name+Year+strategy, 0 product groups (Empty-Shell)
1. Step: setReactInput Name + Year + addStrategy; add no product groups, expected: ready
2. Step: Assert btnSave, expected: enabled

## Scenario: TC-CPR-NPB-024 - Save opens confirm dialog; Cancel aborts (no commit)
1. Step: Build a savable form (Name+Year+strategy), expected: btnSave enabled
2. Step: Click btnSave, expected: dlgSaveChanges appears ("Save Changes" / "Are you sure...?")
3. Step: Click btnSaveChangesCancel, expected: dialog closes; still on create page; nothing committed

## Scenario: TC-CPR-NPB-025 - Pricing Detail tab shows Product Groups source list (Equipment)
1. Step: Click tabPricingDetail, expected: tab activates
2. Step: Read pgSourceRow count + txtSearchProductGroups, expected: > 0 draggable rows; search input present

## Scenario: TC-CPR-NPB-026 - Double-click adds a product group
1. Step: On Pricing Detail tab, double-click pgSourceRow("Balloon Light Decor"), expected: added to tblDetailGrid (Price 0.00)
2. Step: Read tblDetailGrid by content, expected: "Balloon Light Decor" present

## Scenario: TC-CPR-NPB-027 - Adding multiple product groups appends rows
1. Step: Double-click "Balloon Light Decor" then "Analog Mixer 12 - 23 Ch", expected: grid has both (2 content rows)

## Scenario: TC-CPR-NPB-028 - Labor create page loads; Type=Labor disabled
1. Step: Navigate to `/add?type=labor`, expected: "New Pricebook" loads
2. Step: Read cmbType, expected: "Labor", disabled

## Scenario: TC-CPR-NPB-029 - Labor header parity + Save gating
1. Step: Read header (Name+Year fields; cmbCurrency=USD), expected: present
2. Step: Assert btnSave disabled initially, expected: disabled
3. Step: setReactInput Name + Year + addStrategy, expected: btnSave enabled

## Scenario: TC-CPR-NPB-030 - Labor Pricing Detail shows Labor catalog
1. Step: Click tabPricingDetail, expected: activates
2. Step: Read pgSourceRow content, expected: Labor product groups (e.g. "Banners Design", "Content Development")

## Scenario: TC-CPR-NPB-031 - Saving a new pricebook persists it (the ONE committing test)
1. Step: Build a savable, non-empty book — unique Name (prefix + run-stamp from `PRICEBOOK_RUN_STAMP` env, pid fallback; never clock/random) + Year + one strategy + one product group (Balloon Light Decor) on the Pricing Detail tab, expected: btnSave enabled
2. Step: Click btnSave → confirm dlgSaveChanges (COMMIT), expected: redirect to `/details/<new-guid>`
3. Step: Reload the new book's Details page, click tabPricingDetail, read tblDetailGrid by content, expected: "Balloon Light Decor" still present
4. Step: Open Search, turn Active-Only off, filter by the unique name, Search, expected: the new book row is found

---

## NM-2263 extension scenarios

> Drag-add (real pointer sequence, never `.dragTo()`), the toolbar New ▾ menu clicks, an
> update-existing management-mode entry pair (deep inline-edit/save/persist owned by TC-CPR-DET-* /
> TC-CPR-STR-*, cited not duplicated), the NM-2022/NM-2057 validation-lead dispositions, and the
> Axis-2 Surface-Behavior Cases. New selector keys: `btnNew` (toolbar New split-button),
> `mnuNewEquipmentPricing` / `mnuNewLaborPricing` (menu items) — from
> `clients/encore/src/selectors/corporate-pricing/search.ts`.

## Scenario: TC-CPR-NPB-032 - Drag (real pointer sequence) adds a product group in create mode
1. Step: On Pricing Detail tab, drag pgSourceRow("Balloon Light Decor") onto tblDetailGrid via mouse move→down→multi-move→settle→up (never `.dragTo()`), expected: row added
2. Step: Read tblDetailGrid by content, expected: "Balloon Light Decor" present (create-mode drag positive control)

## Scenario: TC-CPR-NPB-033 - Drag-add → Save reachable → Cancel (NO-COMMIT)
1. Step: Name+Year+one strategy set; drag a product group onto the grid, expected: row lands
2. Step: Assert btnSave enabled, expected: enabled
3. Step: Click btnSave → dlgSaveChanges → btnSaveChangesCancel, expected: dialog cancels, nothing committed

## Scenario: TC-CPR-NPB-034 - New ▾ menu presents Equipment Pricing + Labor Pricing
1. Step: On Search, click btnNew to open the dropdown, expected: menu opens
2. Step: Read menu items, expected: "Equipment Pricing" + "Labor Pricing" present

## Scenario: TC-CPR-NPB-035 - New ▾ → Equipment Pricing navigates to /add?type=equipment
1. Step: Open New ▾ menu, click mnuNewEquipmentPricing, expected: navigates
2. Step: Read URL, expected: contains `/add?type=equipment`

## Scenario: TC-CPR-NPB-036 - New ▾ → Labor Pricing navigates to /add?type=labor
1. Step: Open New ▾ menu, click mnuNewLaborPricing, expected: navigates
2. Step: Read URL, expected: contains `/add?type=labor`

## Scenario: TC-CPR-NPB-037 - Existing pricebook opens in management mode (both tabs, Save disabled)
1. Step: Navigate to the detailFixture pricebook Details (2021-PB6), expected: loads in management mode
2. Step: Read tabs + Save state, expected: both tabs present; "New Pricebook" create heading absent; Save disabled on clean load
3. Note: deep inline-edit/save/persist owned by TC-CPR-DET-* / TC-CPR-STR-* (cited, not duplicated)

## Scenario: TC-CPR-NPB-038 - Management-mode Max Discount edit enables Save (save-gate; NO-COMMIT)
1. Step: On the existing pricebook Pricing Detail tab, set an anchored row's Max Discount to a different value (keyboard — the reliable dirty lever), expected: form dirty
2. Step: Assert Save enabled, expected: enabled (save-gate)
3. Step: Reload to discard (reversible mgmt mode) — do NOT commit, expected: fixture unchanged

## Scenario: TC-CPR-NPB-039 - Empty Year shows visible required/invalid indicator
1. Step: On a fresh create page, read txtPriceYear aria-invalid + border with year empty, expected: aria-invalid="true" + red/destructive border
2. Step: Enter a valid year, re-read, expected: aria-invalid="false" + border clears (NOT-REPRODUCED — indicator present)

## Scenario: TC-CPR-NPB-040 - Existing name raises no client-side uniqueness error
1. Step: setReactInput(txtPricebookName, existing name "2022-NP Tier 1"), blur + settle, expected: no inline "already exists" error
2. Step: Read aria-invalid, expected: false; form stays client-savable (server name+strategy semantics NOT-AUTOMATABLE no-commit)

## Scenario: TC-CPR-NPB-041 - [render-state QUICK] Search pricebook-name cells navigate
1. Step: Read a pricebook-name cell in the Search grid first column, expected: link affordance
2. Step: Click it, expected: navigates to `/details/<guid>` (link-cell render-state; non-link → RCA, never blind-file)

## Scenario: TC-CPR-NPB-042 - [render-state DEEP] every name cell is a link + sample navigates + Currency renders
1. Step: Enumerate every pricebook-name cell on the first page, assert each has the link affordance (no strict count), expected: all links
2. Step: Click a sample → Details; read a Currency cell, expected: navigates; Currency renders a code (e.g. USD)

## Scenario: TC-CPR-NPB-043 - [render-state DEEP] boolean columns render per table format (LR-036)
1. Step: Read the 5 boolean column headers (Is GSO/Is Internal/Is Labor/Is Active/Is Productions), expected: present
2. Step: Read boolean cells across rows, expected: TRUE vs FALSE distinguishable by render (Unicode ✔ / empty), no count

## Scenario: TC-CPR-NPB-044 - [empty-vol QUICK] empty-state hint verbatim + one-product grid
1. Step: Read the empty grid's empty-state hint, expected: "No items added yet — Double-click or drag product groups from the sidebar"
2. Step: Add one product group, read grid, expected: exactly that one group present (content-anchored)

## Scenario: TC-CPR-NPB-045 - [empty-vol DEEP] 0/1/N volume + source virtualization integrity
1. Step: Confirm 0 rows; add group A (1) then group B (N), expected: grid renders 0→1→N by content
2. Step: Type a known off-screen group into the source search, expected: it becomes reachable by content (virtualization integrity, no count)

## Scenario: TC-CPR-NPB-046 - [persistence QUICK] dirty survives Strategy↔Detail tab switch
1. Step: Add a strategy + a product group (dirty), expected: Total 1 + one grid row
2. Step: Switch to Pricing Strategy tab then back to Pricing Detail, read state, expected: strategy + grid row both retained

## Scenario: TC-CPR-NPB-047 - [persistence DEEP] dirty discards on navigate-away (beforeunload) → reload empty
1. Step: Make form dirty (Name+Year+strategy), navigate away (beforeunload auto-accepted), expected: leaves
2. Step: Re-open the create page, read fields, expected: empty (Name blank, zero strategies — nothing persisted)

## Scenario: TC-CPR-NPB-048 - [persistence DEEP] remove the only strategy → Save returns disabled (no net change)
1. Step: Name+Year set; add one strategy → Save enabled, expected: enabled
2. Step: Remove that strategy, assert Save, expected: disabled (≥1 strategy required; reverting leaves no net change)

## Scenario: TC-CPR-NPB-049 - [result-fidelity QUICK] source search filters the catalog
1. Step: On Pricing Detail tab, type a known group fragment into txtSearchProductGroups, expected: list filters
2. Step: Read visible source rows, expected: the searched group present (result reflects query, content-anchored)

## Scenario: TC-CPR-NPB-050 - [result-fidelity DEEP] exact-name search narrows then clear restores full catalog
1. Step: Confirm unfiltered source catalog has > 1 item; search an exact name, expected: narrows to match(es)
2. Step: Clear the source search, expected: full catalog restored (> 1 item; no strict count)

---

## Labor Save scenarios (2026-06-30)

> The Labor route previously had only a Save-enable check (029). These two mirror the Equipment
> Save flow (024 + 031) on the Labor route, proving the core Save action actually fires on Labor.

## Scenario: TC-CPR-NPB-051 - Labor Save opens the confirmation dialog; Cancel aborts without committing
1. Step: On the Labor create page, fill Name + Year + one strategy, expected: btnSave enabled
2. Step: Click btnSave, expected: the "Save Changes" dialog (dlgSaveChanges) appears
3. Step: Click Cancel in the dialog, expected: dialog closes, still on `/add?type=labor` (no commit)

## Scenario: TC-CPR-NPB-052 - Saving a new Labor pricebook persists it (the Labor committing test)
1. Step: Build a savable, non-empty Labor book — unique Name (distinct Labor prefix + run-stamp from `PRICEBOOK_RUN_STAMP` env, pid fallback; never clock/random) + Year + one strategy + one Labor product group (Banners Design) on the Pricing Detail tab, expected: btnSave enabled
2. Step: Click btnSave → confirm dlgSaveChanges (COMMIT), expected: redirect to `/details/<new-guid>`
3. Step: Reload the new book's Details page, click tabPricingDetail, read tblDetailGrid by content, expected: "Banners Design" still present
4. Step: Open Search, turn Active-Only off, turn the "Is Labor" filter ON, filter by the unique name, Search, expected: the new book row is found (the Search hides Labor pricebooks unless Is Labor is on)

## Coverage Index (regenerated 2026-06-30 from the test-cases file)

Authoritative current case list (52 cases). Scenario prose above may lag; this index is mechanically regenerated.

- TC-CPR-NPB-001 — New Pricebook (Equipment) create page loads via the type route param
- TC-CPR-NPB-002 — Pricebook Name field is present and editable
- TC-CPR-NPB-003 — Price Book Type shows Equipment and is read-only (route-param-fixed)
- TC-CPR-NPB-004 — Price Year field is present and editable
- TC-CPR-NPB-005 — Currency defaults to USD
- TC-CPR-NPB-006 — Currency dropdown offers USD, CAD, MXN
- TC-CPR-NPB-007 — Tabs render — Pricing Strategy + Pricing Detail
- TC-CPR-NPB-008 — Single-character Pricebook Name keeps the form savable
- TC-CPR-NPB-009 — Long Pricebook Name (250 chars) is accepted
- TC-CPR-NPB-010 — Special characters in Pricebook Name are accepted
- TC-CPR-NPB-011 — Empty Pricebook Name blocks Save
- TC-CPR-NPB-012 — Whitespace-only Pricebook Name is treated as empty (blocks Save)
- TC-CPR-NPB-013 — Empty Price Year blocks Save
- TC-CPR-NPB-014 — Non-numeric Price Year input is rejected
- TC-CPR-NPB-015 — Valid Price Year keeps the form savable (decimal/short not blocked client-side)
- TC-CPR-NPB-016 — New Pricing Strategy (+) opens the add dialog (Name + flags, no Type field)
- TC-CPR-NPB-017 — Strategy dialog defaults — Is Active checked
- TC-CPR-NPB-018 — Adding a strategy appends it to the list
- TC-CPR-NPB-019 — Adding a second strategy lists both
- TC-CPR-NPB-020 — Add with an empty Strategy Name does nothing
- TC-CPR-NPB-021 — Save is disabled on the empty create form
- TC-CPR-NPB-022 — Save stays disabled without a strategy (≥1 strategy required)
- TC-CPR-NPB-023 — Save enables with Name + Year + one strategy and zero product groups (Empty-Shell)
- TC-CPR-NPB-024 — Save opens the confirmation dialog; Cancel aborts without committing
- TC-CPR-NPB-025 — Pricing Detail tab shows the Product Groups source list (Equipment catalog)
- TC-CPR-NPB-026 — Double-clicking a product group adds it to the pricebook grid
- TC-CPR-NPB-027 — Adding multiple product groups appends rows
- TC-CPR-NPB-028 — New Pricebook (Labor) create page loads; Type shows Labor (read-only)
- TC-CPR-NPB-029 — Labor flow header parity + Save gating
- TC-CPR-NPB-030 — Labor Pricing Detail shows a Labor-specific product-group catalog
- TC-CPR-NPB-031 — Saving a new pricebook persists it — created book reloads + is found by Search with its product group
- TC-CPR-NPB-032 — Dragging a product group (real pointer sequence) adds it to the create grid
- TC-CPR-NPB-033 — Drag-add → edit New Price + Max Discount → Save reachable (NO-COMMIT)
- TC-CPR-NPB-034 — New ▾ menu presents Equipment Pricing + Labor Pricing items
- TC-CPR-NPB-035 — New ▾ → Equipment Pricing navigates to the Equipment create route
- TC-CPR-NPB-036 — New ▾ → Labor Pricing navigates to the Labor create route
- TC-CPR-NPB-037 — An existing pricebook opens in management mode (both tabs, Save disabled on clean load)
- TC-CPR-NPB-038 — Management-mode inline New-Price edit enables Save (save-gate; NO-COMMIT)
- TC-CPR-NPB-039 — Empty Price Year shows a visible required/invalid indicator (Save disabled)
- TC-CPR-NPB-040 — An existing pricebook name raises no client-side inline uniqueness error
- TC-CPR-NPB-041 — Search pricebook-name cells navigate to the pricebook Details (render-state QUICK)
- TC-CPR-NPB-042 — Every rendered pricebook-name cell is a navigable link + Currency renders (render-state DEEP)
- TC-CPR-NPB-043 — Search boolean columns render per the table's boolean format (render-state DEEP, LR-036)
- TC-CPR-NPB-044 — Create-mode empty-state hint reads verbatim + a one-product grid renders (empty-vol QUICK)
- TC-CPR-NPB-045 — Create-mode 0/1/N volume + source-catalog virtualization integrity (empty-vol DEEP)
- TC-CPR-NPB-046 — Create-mode dirty state survives a Strategy ↔ Detail tab switch (persistence QUICK)
- TC-CPR-NPB-047 — Create-mode dirty discards on navigate-away (beforeunload) → reload shows empty form (persistence DEEP)
- TC-CPR-NPB-048 — Removing the only strategy returns Save to disabled — no net change (persistence DEEP)
- TC-CPR-NPB-049 — Source-list search filters the product-group catalog to matches (result-fidelity QUICK)
- TC-CPR-NPB-050 — Source search by exact name narrows then clears to restore the full catalog (result-fidelity DEEP)
- TC-CPR-NPB-051 — Labor Save opens the confirmation dialog; Cancel aborts without committing (Labor mirror of 024)
- TC-CPR-NPB-052 — Saving a new Labor pricebook persists it — created book reloads + is found by Search with Is-Labor filter on (Labor mirror of 031)
