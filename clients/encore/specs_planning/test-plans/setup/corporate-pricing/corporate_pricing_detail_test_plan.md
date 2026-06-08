# Corporate Pricing — Pricing Detail Test Plan (NM-1443)

**Module**: corporate-pricing
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_detail_test_cases.md
**Field Inventory**: specs_planning/_internal/field-inventories/corporate-pricing-detail-2026-06-05.md
**Updated**: 2026-06-05 (S3 / NM-1443 Pricing Detail P1, Management mode)

## Selector Mapping

> Page has **0 data-testids** (Doctrine 4 / D8) → text/role/grid-header/content-anchored selectors.
> Keys mirror `clients/encore/src/selectors/corporate-pricing/{details,pricing-detail}.ts`.

| Key | Selector | Element |
|-----|----------|---------|
| tabPricingDetail | `button:has-text("Pricing Detail")` | Pricing Detail tab |
| btnSaveDetails | top-level `button:text-is("Save")` (page action bar) | Save button (disabled when clean) |
| tblDetailGrid | `table:has(th:has-text("Product Group Name"))` | Pricing Detail grid table |
| rowDetailAny | `<grid> tr` | Grid rows (content-anchored by Product Group Name) |
| colDetailId | `th:has-text("ID")` | Column header "ID" |
| colDetailProductGroupName | `th:has-text("Product Group Name")` | Column header "Product Group Name" |
| colDetailPrice | `th:has-text("Price")` | Column header "Price" (Base Price, read-only) |
| colDetailNewPrice | `th:has-text("New Price")` | Column header "New Price" (Override, editable) |
| colDetailMaxDiscount | `th:has-text("Max Discount")` | Column header "Max Discount" (Override Discount, editable) |
| gridRowByName | `<grid> tr:has-text("<Product Group Name>")` | Row anchored by unique product-group name |
| newPriceInput | anchored row `td:nth(3) input` | New Price (Override) input |
| maxDiscountInput | anchored row `td:nth(4) input` | Max Discount (Override Discount) input |
| priceCell | anchored row `td:nth(2)` (no input) | Base Price read-only cell |
| itemDraggableAny | `[draggable="true"][role="button"]` | Available Product Groups source items |
| txtSourceFilter | `input[placeholder="Search ID or Name..."]` | Source-list filter |
| dlgSaveChanges | `[role="alertdialog"]` ("Save Changes") | Save confirmation dialog |
| btnDlgConfirmSave | dialog `button` matching `/^(save|ok)$/i` | Dialog confirm |

> **Save endpoint** (LR-056): `POST /navigator/api/location/pricing/save`. Persistence is asserted by
> reload + re-read, NOT a page-URL network listener (Next.js RSC POSTs share the page URL).
> **Mutation fixture** (S3 only): `detailFixture` = 2021-PB6 (Inactive). Anchors: "Balloon Light Decor"
> (277, base 615.00) for Max-Discount cycle; "Analog Mixer 12 - 23 Ch" (280, base 195.00) for New-Price cycle.

---

## Scenario: TC-LOC-CPR-201 - Pricing Detail tab activates and grid renders
1. Step: Open Pricebook Details for detailFixture (office 1604), expected: page loads (Strategy tab)
2. Step: Click tabPricingDetail, expected: Detail tab activates, grid renders
3. Step: Count grid rows, expected: one or more product-group rows (content-anchored)

---

## Scenario: TC-LOC-CPR-202 - Grid renders five columns
1. Step: Open Pricing Detail tab, expected: grid renders
2. Step: Read column headers, expected: ID / Product Group Name / Price / New Price / Max Discount

---

## Scenario: TC-LOC-CPR-203 - Available Product Groups source list loads
1. Step: Open Pricing Detail tab, expected: grid + source list render
2. Step: Count itemDraggableAny, expected: greater than zero

---

## Scenario: TC-LOC-CPR-204 - Source list provides a Search filter
1. Step: Open Pricing Detail tab, expected: source list renders
2. Step: Locate txtSourceFilter, expected: "Search ID or Name..." input present

---

## Scenario: TC-LOC-CPR-205 - Pricing details load on tab activation
1. Step: Open pricebook in management mode, click Pricing Detail tab, expected: tab activates
2. Step: Observe grid, expected: product-group rows with Price + override cells load

---

## Scenario: TC-LOC-CPR-206 - Base Price (Price) is read-only
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Inspect priceCell, expected: read-only text, no input

---

## Scenario: TC-LOC-CPR-207 - New Price and Max Discount are editable
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Inspect newPriceInput + maxDiscountInput, expected: both editable (not readonly/disabled)

---

## Scenario: TC-LOC-CPR-208 - Single-click source group does not add a row
1. Step: Open Pricing Detail tab, capture grid row count, expected: count captured
2. Step: Single-click a source item, expected: selection acknowledged
3. Step: Re-read grid row count, expected: unchanged

---

## Scenario: TC-LOC-CPR-209 - Double-click source group does NOT add (defensive)
1. Step: Open Pricing Detail tab, capture grid row count, expected: count captured
2. Step: Double-click a source item, expected: no add
3. Step: Re-read grid row count, expected: unchanged; Save disabled; no dialog

---

## Scenario: TC-LOC-CPR-210 - Drag source group does NOT add (defensive)
1. Step: Open Pricing Detail tab, capture grid row count, expected: count captured
2. Step: Drag a source item onto tblDetailGrid, expected: drop rejected / not initiated
3. Step: Re-read grid row count, expected: unchanged

---

## Scenario: TC-LOC-CPR-211 - Existing rows expose no Add/Remove affordance
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Inspect the row for buttons, expected: none

---

## Scenario: TC-LOC-CPR-212 - Clean grid shows Save disabled
1. Step: Open Pricing Detail tab, make no changes, expected: grid loads
2. Step: Observe btnSaveDetails, expected: disabled

---

## Scenario: TC-LOC-CPR-213 - Editing Max Discount enables Save
1. Step: Open Pricing Detail tab (clean), expected: Save disabled
2. Step: Edit a row's maxDiscountInput, expected: Save enables
3. Step: Reload without Save, expected: baseline restored

---

## Scenario: TC-LOC-CPR-214 - Save is dialog-gated
1. Step: Make a reversible Max Discount edit, expected: Save enables
2. Step: Click Save, expected: dlgSaveChanges appears ("Save Changes" / Cancel / Save)
3. Step: Confirm dialog, expected: Save proceeds; restore after

---

## Scenario: TC-LOC-CPR-215 - Max Discount edit persists across reload (with restore)
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Edit maxDiscountInput to a new value and Save (confirm), expected: Save completes
3. Step: Reload + reopen Detail tab, expected: new Max Discount persists for the row
4. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-LOC-CPR-216 - Save resets dirty to clean
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Reversible Max Discount edit, expected: Save enabled
3. Step: Save + confirm, expected: Save returns to disabled
4. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-LOC-CPR-217 - Save commits grid edits in one batch (with restore)
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Edit Max Discount on two rows, expected: Save enabled
3. Step: Save + confirm, expected: Save completes
4. Step: Reload + reopen, expected: both rows reflect committed values
5. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-LOC-CPR-218 - New Price override becomes Price after reload (with restore)
1. Step: ensureDefaultState (anchorB at base 195.00), expected: clean baseline
2. Step: Enter New Price override on the row and commit via grid Save (confirm), expected: Save completes
3. Step: Reload + reopen, expected: Price column shows the override; New Price input cleared
4. Step: ensureDefaultState, expected: Price restored to base

---

## Scenario: TC-LOC-CPR-219 - Empty New Price leaves Base Price in effect
1. Step: Open Pricing Detail tab, locate a row with no override, expected: row visible
2. Step: Read newPriceInput + priceCell, expected: New Price empty, Price shows base price

---

## Scenario: TC-LOC-CPR-220 - Save accepts a valid currency-formatted New Price
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Enter a valid two-decimal New Price and commit via Save, expected: Save accepts value
3. Step: Reload + reopen, expected: value persisted (Price reflects it)
4. Step: ensureDefaultState, expected: baseline restored
