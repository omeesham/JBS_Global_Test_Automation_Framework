# Corporate Pricing — Pricing Strategy Test Plan (NM-1441)

**Module**: corporate-pricing
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_strategy_test_cases.md
**Field Inventory**: specs_planning/_internal/field-inventories/corporate-pricing-strategy-2026-06-05.md
**Updated**: 2026-06-05 (S2 / NM-1441 Pricing Strategy P1)

## Selector Mapping

> Page has **0 data-testids** (Doctrine 4 / D8) → text/role/content-anchored selectors. Keys mirror
> `clients/encore/src/selectors/corporate-pricing/{details,strategy}.ts`.

| Key | Selector | Element |
|-----|----------|---------|
| hdgPricebookDetails | `heading[level=1]:has-text("Corporate Pricing Details")` | Page heading |
| tabPricingStrategy | `button:has-text("Pricing Strategy")` | Pricing Strategy tab |
| tabPricingDetail | `button:has-text("Pricing Detail")` | Pricing Detail tab |
| btnSaveDetails | top-level `button:has-text("Save")` (page action bar) | Save button (disabled when clean) |
| hdgPricebookName | `heading[level=2]` (within details header) | Pricebook name (h2) |
| lblHeaderType | text "Labor/Equipment" → sibling paragraph | Type value ("Equipment") |
| lblHeaderYear | text "Year" → sibling paragraph | Year value ("2022") |
| lblHeaderCurrency | text "Currency" → sibling paragraph | Currency value ("USD") |
| lblHeaderActive | text "Active" (header badge) | Active status |
| hdgPriceStrategies | `*:text-is("Price Strategies")` | Left-pane heading |
| txtSearchStrategies | `input[placeholder="Search strategies..."]` | Strategy search box |
| lblStrategyTotal | `text=/Total:\s*\d+/` | Strategy count ("Total: N") |
| btnAddStrategy | icon button in the "Price Strategies" pane header | Add ("+") strategy |
| strategyListItemByName | `button:has-text("<name>")` within the strategies list | Strategy list item |
| btnRemoveStrategyByName | nested icon button inside the new strategy's list item | Remove (isNew only) |
| txtStrategyName | editor textbox under label "Pricing Strategy" | Strategy name (editable) |
| chkStrategyIsProductions | `div:has(> *:text-is("Is Productions")) [role="checkbox"]` | Is Productions |
| chkStrategyIsInternal | `div:has(> *:text-is("Is Internal")) [role="checkbox"]` | Is Internal (disabled on fixture) |
| chkStrategyIsGSO | `div:has(> *:text-is("Is GSO")) [role="checkbox"]` | Is GSO (disabled on fixture) |
| chkStrategyIsActive | `div:has(> *:text-is("Is Active")) [role="checkbox"]` | Is Active |
| hdgLocationsUsingDefault | `*:text-is("Locations Using Pricing As Default")` | Locations section heading |
| tblLocationsUsingDefault | `table:has(th:text-is("Local Office"))` | Locations table |
| dlgNewStrategy | `[role="dialog"]:has-text("New Pricing Strategy")` | Add-strategy modal |
| txtDlgStrategyName | dialog `input[placeholder^="e.g."]` (label "Strategy Name") | Dialog name field |
| btnDlgAdd | dialog `button:has-text("Add")` | Dialog Add |
| btnDlgCancel | dialog `button:has-text("Cancel")` | Dialog Cancel |

---

## Scenario: TC-LOC-CPR-101 - Pricebook link entry loads management page
1. Step: Navigate to Pricebook Details for strategyFixture (office 1604), expected: page loads
2. Step: Verify heading[hdgPricebookDetails], expected: "Corporate Pricing Details" visible
3. Step: Verify hdgPricebookName text, expected: "2022-NP Tier 1"

---

## Scenario: TC-LOC-CPR-102 - Header shows Price Book Name
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read hdgPricebookName, expected: "2022-NP Tier 1"

---

## Scenario: TC-LOC-CPR-103 - Header shows Type (Labor/Equipment)
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read lblHeaderType value, expected: "Equipment"

---

## Scenario: TC-LOC-CPR-104 - Header shows Price Year
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read lblHeaderYear value, expected: "2022"

---

## Scenario: TC-LOC-CPR-105 - Header shows Currency
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read lblHeaderCurrency value, expected: "USD"

---

## Scenario: TC-LOC-CPR-106 - Header shows Active status
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read lblHeaderActive, expected: "Active"

---

## Scenario: TC-LOC-CPR-107 - Header fields are reference-only
1. Step: Open Pricebook Details, expected: page loads
2. Step: Assert each header field is read-only text (no input/textbox/combobox), expected: 0 editable controls in header

---

## Scenario: TC-LOC-CPR-108 - Tabs render (Pricing Strategy + Pricing Detail)
1. Step: Open Pricebook Details, expected: page loads
2. Step: Verify tabPricingStrategy present, expected: visible
3. Step: Verify tabPricingDetail present, expected: visible

---

## Scenario: TC-LOC-CPR-109 - Pricing Strategy tab selected by default
1. Step: Open Pricebook Details fresh, expected: page loads
2. Step: Verify Pricing Strategy content (hdgPriceStrategies) visible, expected: Strategy editor rendered (Strategy tab active)

---

## Scenario: TC-LOC-CPR-110 - Pricing Detail tab present and activates
1. Step: Open Pricebook Details, expected: Strategy active
2. Step: Click tabPricingDetail, expected: Detail tab activates (content changes)

---

## Scenario: TC-LOC-CPR-111 - History tab absent (NM-1444 not built)
1. Step: Open Pricebook Details, expected: page loads
2. Step: Query tab row for a "History" tab button, expected: not present (count 0)

---

## Scenario: TC-LOC-CPR-112 - Clicking existing strategy loads details
1. Step: Open Pricebook Details, expected: list shows "2022-NP Tier 1"
2. Step: Click strategyListItemByName("2022-NP Tier 1"), expected: editor populates
3. Step: Verify txtStrategyName + flag checkboxes present, expected: visible

---

## Scenario: TC-LOC-CPR-113 - Selected strategy displays locations
1. Step: Open Pricebook Details and select "2022-NP Tier 1", expected: editor loads
2. Step: Read tblLocationsUsingDefault rows, expected: assigned locations listed (e.g. 1991, 7011)

---

## Scenario: TC-LOC-CPR-114 - Edit existing strategy + Save persists (restore)
1. Step: ensureDefaultState, expected: clean baseline (strategy "2022-NP Tier 1")
2. Step: Edit txtStrategyName (reversible marker), expected: btnSaveDetails enables
3. Step: Save and wait for completion, expected: Save disables
4. Step: Reload, expected: edited value persists
5. Step: ensureDefaultState cleanup, expected: baseline restored

---

## Scenario: TC-LOC-CPR-115 - Add New opens dialog and appends row
1. Step: Open Pricebook Details, expected: lblStrategyTotal "Total: 1"
2. Step: Click btnAddStrategy, expected: dlgNewStrategy opens (txtDlgStrategyName + flags + btnDlgAdd/btnDlgCancel)
3. Step: Fill txtDlgStrategyName and click btnDlgAdd, expected: dialog closes, new row appended (Total increments)
4. Step: Remove new strategy (no Save), expected: baseline restored

---

## Scenario: TC-LOC-CPR-116 - New strategy shows Remove
1. Step: Add a new strategy via dialog, expected: new row appears
2. Step: Inspect new strategy item for btnRemoveStrategyByName, expected: Remove icon present
3. Step: Remove (no Save), expected: baseline restored

---

## Scenario: TC-LOC-CPR-117 - Legacy strategy hides Remove
1. Step: Open Pricebook Details, expected: legacy "2022-NP Tier 1" in list
2. Step: Inspect legacy item for a Remove control, expected: none present

---

## Scenario: TC-LOC-CPR-118 - Remove new strategy deletes pre-commit
1. Step: Add a new strategy via dialog, expected: Total increments, btnSaveDetails enabled
2. Step: Click the new strategy's Remove, expected: row removed immediately
3. Step: Verify lblStrategyTotal back to "Total: 1" and btnSaveDetails disabled, expected: clean, no reload

---

## Scenario: TC-LOC-CPR-119 - Legacy strategy cannot be removed
1. Step: Open Pricebook Details with legacy strategy, expected: page loads
2. Step: Assert no remove/delete affordance on the legacy item, expected: none

---

## Scenario: TC-LOC-CPR-120 - Clean state = Save disabled
1. Step: Open Pricebook Details, make no changes, expected: page loads
2. Step: Verify btnSaveDetails, expected: disabled

---

## Scenario: TC-LOC-CPR-121 - Editing makes dirty (Save enables)
1. Step: Open Pricebook Details (clean), expected: btnSaveDetails disabled
2. Step: Edit txtStrategyName, expected: btnSaveDetails enables
3. Step: Discard (reload/restore), expected: baseline restored

---

## Scenario: TC-LOC-CPR-122 - Adding makes dirty (Save enables)
1. Step: Open Pricebook Details (clean), expected: btnSaveDetails disabled
2. Step: Add a new strategy via dialog, expected: btnSaveDetails enables
3. Step: Remove (no Save), expected: baseline restored

---

## Scenario: TC-LOC-CPR-123 - Save commits edits + additions in batch (restore)
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Edit existing strategy AND add a new strategy, expected: btnSaveDetails enabled
3. Step: Save, expected: completes
4. Step: Reload, expected: both edit + new strategy reflected
5. Step: ensureDefaultState cleanup, expected: baseline restored

---

## Scenario: TC-LOC-CPR-124 - Save provides confirmation feedback
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Make a reversible change and Save, expected: completes
3. Step: Observe notifications area, expected: success indicator visible
4. Step: ensureDefaultState cleanup, expected: baseline restored

---

## Scenario: TC-LOC-CPR-125 - Save resets dirty to clean
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Make a reversible change, expected: btnSaveDetails enabled (dirty)
3. Step: Save and wait for success, expected: btnSaveDetails disabled (clean)
4. Step: ensureDefaultState cleanup, expected: baseline restored
