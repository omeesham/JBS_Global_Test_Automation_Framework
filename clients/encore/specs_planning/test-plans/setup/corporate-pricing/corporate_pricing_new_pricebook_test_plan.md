# Corporate Pricing — New Pricebook Test Plan (NM-1440)

**Module**: corporate-pricing
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md
**Field Inventory**: specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-09.md
**Divergences**: specs_planning/_internal/encore-questions-drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md
**Updated**: 2026-06-09 (NM-1440 New Pricebook create flow, Wave-1.5 priority)

## Scope boundary

This plan owns the **create-flow destination page** (`/add?type=equipment|labor`) — header, strategy add, product-group ADD, Save reachability — for BOTH options. It does NOT re-cover the Search `+ New ▾` dropdown affordance itself (that is TC-CPR-SRC-016/017). **No-commit**: a created pricebook is irreversible via UI (CPR-1440-Q4), so save-cycle scenarios assert Save *reachability* and Cancel the confirm dialog; actual persistence is NOT-AUTOMATED-IN-CI. Baseline (LR-019) = navigate fresh to the always-empty create page per test.

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
- Strategy add: open dialog (`btnNewStrategy`) → fill `txtDlgStrategyName` → `btnDlgAdd`. Empty name ⇒ Add no-op.
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
1. Step: Open dlgNewStrategy, leave name empty, click btnDlgAdd, expected: Total unchanged; dialog stays open

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

## Coverage Index (regenerated 2026-06-11 from the test-cases file)

Authoritative current case list (30 cases). Scenario prose above may lag; this index is mechanically regenerated.

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
