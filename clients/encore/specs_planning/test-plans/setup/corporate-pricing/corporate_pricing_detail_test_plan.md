# Corporate Pricing — Pricing Detail Test Plan (NM-1443)

**Module**: corporate-pricing
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_detail_test_cases.md
**Field Inventory**: specs_planning/_internal/field-inventories/corporate-pricing-detail-2026-06-05.md
**Updated**: 2026-06-24 (S3 / NM-1443 Pricing Detail P1, Management mode + DET-021..055 BVA/Watch/SBC expansion)

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

## Scenario: TC-CPR-DET-001 - Pricing Detail tab activates and grid renders
1. Step: Open Pricebook Details for detailFixture (office 1604), expected: page loads (Strategy tab)
2. Step: Click tabPricingDetail, expected: Detail tab activates, grid renders
3. Step: Count grid rows, expected: one or more product-group rows (content-anchored)

---

## Scenario: TC-CPR-DET-002 - Grid renders five columns
1. Step: Open Pricing Detail tab, expected: grid renders
2. Step: Read column headers, expected: ID / Product Group Name / Price / New Price / Max Discount

---

## Scenario: TC-CPR-DET-003 - Available Product Groups source list loads
1. Step: Open Pricing Detail tab, expected: grid + source list render
2. Step: Count itemDraggableAny, expected: greater than zero

---

## Scenario: TC-CPR-DET-004 - Source list provides a Search filter
1. Step: Open Pricing Detail tab, expected: source list renders
2. Step: Locate txtSourceFilter, expected: "Search ID or Name..." input present

---

## Scenario: TC-CPR-DET-005 - Pricing details load on tab activation
1. Step: Open pricebook in management mode, click Pricing Detail tab, expected: tab activates
2. Step: Observe grid, expected: product-group rows with Price + override cells load

---

## Scenario: TC-CPR-DET-006 - Base Price (Price) is read-only
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Inspect priceCell, expected: read-only text, no input

---

## Scenario: TC-CPR-DET-007 - New Price and Max Discount are editable
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Inspect newPriceInput + maxDiscountInput, expected: both editable (not readonly/disabled)

---

## Scenario: TC-CPR-DET-008 - Single-click source group does not add a row
1. Step: Open Pricing Detail tab, capture grid row count, expected: count captured
2. Step: Single-click a source item, expected: selection acknowledged
3. Step: Re-read grid row count, expected: unchanged

---

## Scenario: TC-CPR-DET-009 - Double-click source group does NOT add (defensive)
1. Step: Open Pricing Detail tab, capture grid row count, expected: count captured
2. Step: Double-click a source item, expected: no add
3. Step: Re-read grid row count, expected: unchanged; Save disabled; no dialog

---

## Scenario: TC-CPR-DET-010 - Drag source group does NOT add (defensive)
1. Step: Open Pricing Detail tab, capture grid row count, expected: count captured
2. Step: Drag a source item onto tblDetailGrid, expected: drop rejected / not initiated
3. Step: Re-read grid row count, expected: unchanged

---

## Scenario: TC-CPR-DET-011 - Existing rows expose no Add/Remove affordance
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Inspect the row for buttons, expected: none

---

## Scenario: TC-CPR-DET-012 - Clean grid shows Save disabled
1. Step: Open Pricing Detail tab, make no changes, expected: grid loads
2. Step: Observe btnSaveDetails, expected: disabled

---

## Scenario: TC-CPR-DET-013 - Editing Max Discount enables Save
1. Step: Open Pricing Detail tab (clean), expected: Save disabled
2. Step: Edit a row's maxDiscountInput, expected: Save enables
3. Step: Reload without Save, expected: baseline restored

---

## Scenario: TC-CPR-DET-014 - Save is dialog-gated
1. Step: Make a reversible Max Discount edit, expected: Save enables
2. Step: Click Save, expected: dlgSaveChanges appears ("Save Changes" / Cancel / Save)
3. Step: Confirm dialog, expected: Save proceeds; restore after

---

## Scenario: TC-CPR-DET-015 - Max Discount edit persists across reload (with restore)
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Edit maxDiscountInput to a new value and Save (confirm), expected: Save completes
3. Step: Reload + reopen Detail tab, expected: new Max Discount persists for the row
4. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-016 - Save resets dirty to clean
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Reversible Max Discount edit, expected: Save enabled
3. Step: Save + confirm, expected: Save returns to disabled
4. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-017 - Save commits grid edits in one batch (with restore)
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Edit Max Discount on two rows, expected: Save enabled
3. Step: Save + confirm, expected: Save completes
4. Step: Reload + reopen, expected: both rows reflect committed values
5. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-018 - New Price override becomes Price after reload (with restore)
1. Step: ensureDefaultState (anchorB at base 195.00), expected: clean baseline
2. Step: Enter New Price override on the row and commit via grid Save (confirm), expected: Save completes
3. Step: Reload + reopen, expected: Price column shows the override; New Price input cleared
4. Step: ensureDefaultState, expected: Price restored to base

---

## Scenario: TC-CPR-DET-019 - Empty New Price leaves Base Price in effect
1. Step: Open Pricing Detail tab, locate a row with no override, expected: row visible
2. Step: Read newPriceInput + priceCell, expected: New Price empty, Price shows base price

---

## Scenario: TC-CPR-DET-020 - Save accepts a valid currency-formatted New Price
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Enter a valid two-decimal New Price and commit via Save, expected: Save accepts value
3. Step: Reload + reopen, expected: value persisted (Price reflects it)
4. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-021 - New Price = 0 stores 0.00 and enables Save
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor" with no override, expected: row clean
2. Step: Click newPriceInput, Ctrl+A, Delete, type "0", blur, expected: input shows "0"; Save enabled
3. Step: Save + confirm dialog, expected: Save completes
4. Step: Reload + reopen, expected: Price column shows 0.00; New Price input empty (staging cleared)
5. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-022 - New Price = -10 triggers NaN/invalid reload guard (LR-011)
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Click newPriceInput, Ctrl+A, Delete, type "-10", blur, expected: cell processes input
3. Step: Read cell value, expected: reverts to last-valid (LR-011 guard fires); "-10" rejected
4. Step: Observe Save button, expected: Save remains disabled

---

## Scenario: TC-CPR-DET-023 - New Price = 9999999.99 accepted with comma-thousands + 2dp
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Click newPriceInput, Ctrl+A, Delete, type "9999999.99", blur, expected: input accepts value
3. Step: Read rendered value, expected: "9,999,999.99" (comma-thousands, 2 decimal places); Save enabled
4. Step: Reload without saving, expected: baseline restored

---

## Scenario: TC-CPR-DET-024 - New Price 12.3456 rounds/truncates to 2dp on blur
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Click newPriceInput, Ctrl+A, Delete, type "12.3456", blur, expected: cell processes on blur
3. Step: Read input value, expected: exactly 2 decimal places (e.g., "12.35" or "12.34")
4. Step: Observe Save button, expected: Save enabled (value accepted); reload without saving

---

## Scenario: TC-CPR-DET-025 - New Price overflow triggers NaN reload guard (LR-011)
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Click newPriceInput, Ctrl+A, Delete, type an overflow string (beyond max double range), blur, expected: cell processes input
3. Step: Read cell value, expected: reverts to last-valid (LR-011 guard fires)
4. Step: Observe Save button, expected: Save remains disabled

---

## Scenario: TC-CPR-DET-026 - New Price non-numeric ("abc", "!@#") triggers NaN reload guard
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Click newPriceInput, Ctrl+A, Delete, type "abc", blur, expected: cell reverts to last-valid (LR-011)
3. Step: Observe Save button, expected: Save remains disabled
4. Step: Repeat with "!@#", expected: same rejection behavior

---

## Scenario: TC-CPR-DET-027 - New Price renders with locale comma-thousands and exactly 2 decimal places
1. Step: Open Pricing Detail tab, locate a row with a saved New Price override > 1000, expected: row visible
2. Step: Read New Price cell value, expected: comma-thousands separator + exactly 2 decimal places (e.g., "1,234.56")
3. Step: Confirm no extra decimal digits, expected: format fidelity verified

---

## Scenario: TC-CPR-DET-028 - Max Discount = 0 stores 0.00 and enables Save
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor" with no Max Discount override, expected: row clean
2. Step: Click maxDiscountInput, Ctrl+A, Delete, type "0", blur, expected: input shows "0"; Save enabled
3. Step: Save + confirm dialog, expected: Save completes
4. Step: Reload + reopen, expected: Max Discount shows 0.00
5. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-029 - Max Discount = -5 rejected; Save does not enable
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Click maxDiscountInput, Ctrl+A, Delete, type "-5", blur, expected: cell reverts to last-valid (LR-011)
3. Step: Observe Save button, expected: Save remains disabled

---

## Scenario: TC-CPR-DET-030 - Max Discount > 100 (150) sets aria-invalid + tooltip + blocks Save
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Click maxDiscountInput, Ctrl+A, Delete, type "150", blur, expected: input keeps "150" with aria-invalid="true"
3. Step: Inspect tooltip/validation message, expected: "Please enter a valid percentage with up to two decimal places. Enter 0.0 for no discount."
4. Step: Observe Save button, expected: Save blocked while invalid value present

---

## Scenario: TC-CPR-DET-031 - Max Discount 33.33 stored as 2dp and enables Save
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor" clean, expected: row at default
2. Step: Click maxDiscountInput, Ctrl+A, Delete, type "33.33", blur, expected: input shows "33.33"; Save enabled
3. Step: Save + confirm, expected: Save completes
4. Step: Reload + reopen, expected: Max Discount shows "33.33" (2dp preserved)
5. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-032 - Max Discount non-numeric triggers NaN reload guard
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: row visible
2. Step: Click maxDiscountInput, Ctrl+A, Delete, type "xyz", blur, expected: cell reverts to last-valid (LR-011)
3. Step: Observe Save button, expected: Save remains disabled

---

## Scenario: TC-CPR-DET-033 - Reverting New Price to original value returns Save to disabled (LR-009)
1. Step: Open Pricing Detail tab (clean), expected: Save disabled
2. Step: Click newPriceInput for "Balloon Light Decor", Ctrl+A, Delete, type "99.00", blur, expected: Save enabled (dirty)
3. Step: Click same newPriceInput, Ctrl+A, Delete (revert to empty — original state), blur, expected: value reverts
4. Step: Observe Save button, expected: Save returns to disabled (Angular dirty-flag reset per LR-009)

---

## Scenario: TC-CPR-DET-034 - Clearing New Price to empty leaves Base Price in effect (override fallback)
1. Step: Open Pricing Detail tab; locate row with an existing New Price override, expected: override visible
2. Step: Click newPriceInput, Ctrl+A, Delete (clear to empty), blur, expected: input is empty
3. Step: Enable Save via Max Discount edit if needed, expected: Save enabled
4. Step: Save + confirm, expected: Save completes
5. Step: Reload + reopen, expected: Price column shows base price; New Price input empty
6. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-035 - Click/type on read-only Price cell resolves no input; value unchanged
1. Step: Open Pricing Detail tab, locate row "Balloon Light Decor", expected: Base Price cell visible with non-empty value
2. Step: Click priceCell and attempt to type "999", expected: no input element resolves; cell text content unchanged
3. Step: Observe Save button, expected: Save remains disabled; no edit registered

---

## Scenario: TC-CPR-DET-036 - Off-screen row read by content anchor (not nth index) on 2430-row grid
1. Step: Open Pricing Detail tab, expected: grid loads with multiple pages
2. Step: Navigate to a page or scroll to a row not visible in initial viewport, expected: row not initially visible
3. Step: Locate row via content-anchored selector (Product Group Name or ID — no nth(N)), expected: row located by text content
4. Step: Read New Price and Max Discount values for that row, expected: values read successfully without positional index (LR-022/LR-053)

---

## Scenario: TC-CPR-DET-037 - Positive control: CREATE MODE double-click and full-pointer drag both add a row
1. Step: Navigate to /locations/1604/settings/corporate-pricing/add?type=equipment, expected: create-mode page loads; source list and grid rendered
2. Step: Note current grid row count (content-anchored), expected: count captured
3. Step: Double-click a source list item, expected: new row appears in grid; count increases by one
4. Step: Perform full-pointer drag (mouse.move→down→move(steps)→up) of a second source item to the grid drop zone, expected: second new row appears; count increases again (NOTE: .dragTo() banned — use full pointer sequence)
5. Step: Confirm both added rows by Product Group Name anchor, expected: both rows present

---

## Scenario: TC-CPR-DET-038 - NM-2301 watch: Max Discount NULL row after New Price + Save does not silently mutate NULL→0.00
1. Step: Open Pricing Detail tab, locate row with Max Discount empty (NULL), expected: row identified; Max Discount is empty
2. Step: Click newPriceInput for that row, type valid price "100.00", blur, expected: New Price shows value
3. Step: Enable Save via Max Discount edit on a different row, expected: Save enabled
4. Step: Save + confirm, expected: Save completes
5. Step: Reload + reopen; read Max Discount for the NULL row, expected: if NULL remained NULL → test passes; if NULL→0.00 → assert bug behavior and flag for BUG-CPR-DET-NM2301

---

## Scenario: TC-CPR-DET-039 - CPR-DETAIL-BUG-A: New-Price-only edit Save-enable reliability (drive exact steps, observe)
1. Step: Open Pricing Detail tab on fresh page load (clean), expected: Save disabled
2. Step: Click newPriceInput for "Analog Mixer 12 - 23 Ch", Ctrl+A, Delete, type "200.00", blur, expected: New Price shows "200.00"
3. Step: Do NOT touch any other cell — maintain isolation, expected: isolation maintained
4. Step: Observe Save button immediately after blur, expected: record actual state (ENABLED or DISABLED)
5. Step: If disabled → assert CPR-DETAIL-BUG-A confirmed; if enabled → record as not reproduced this run with session date

---

## Scenario: TC-CPR-DET-040 - NM-1874 Save-enable spec: New Price edit alone should enable Save per requirement
1. Step: Open Pricing Detail tab on fresh page load (clean), expected: Save disabled
2. Step: Click newPriceInput for any row, Ctrl+A, Delete, type valid price, blur, expected: New Price updated
3. Step: Observe Save button per NM-1874 requirement, expected: per spec Save should be enabled; if not → gap confirmed traceable to NM-1874 (see DET-039 for live verdict)

---

## Scenario: TC-CPR-DET-041 - NM-2094 "value clears by design": clearing New Price shows base price or empty post-save
1. Step: Open Pricing Detail tab; locate row with existing New Price override; note base price, expected: override visible; base price recorded
2. Step: Click newPriceInput, Ctrl+A, Delete (clear), blur, expected: input empty
3. Step: Enable Save via Max Discount edit if needed; Save + confirm, expected: Save completes
4. Step: Reload + reopen; read Price column for the anchor row, expected: assert actual value — if base price → fallback confirmed; if empty/0 → flag discrepancy (NM-2094)

---

## Scenario: TC-CPR-DET-042 - NM-2095 cross-row price loss: row A edit + Save does not affect row B
1. Step: Open Pricing Detail tab; note Max Discount for "Analog Mixer 12 - 23 Ch" (row B), expected: value recorded
2. Step: Edit Max Discount on "Balloon Light Decor" (row A), expected: Save enabled
3. Step: Save + confirm, expected: Save completes
4. Step: Reload + reopen; read Max Discount for row B ("Analog Mixer 12 - 23 Ch"), expected: unchanged from pre-save value
5. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-043 - NM-1967 Max Discount focus 100→1%: verify live behavior after focus
1. Step: Ensure "Balloon Light Decor" has Max Discount saved as 100; reload + reopen, expected: Max Discount shows 100
2. Step: Click (focus) maxDiscountInput for "Balloon Light Decor" without typing, expected: input receives focus
3. Step: Read input value immediately after focus, expected: if "1" → NM-1967 reproduced (annotate // BUG NM-1967); if "100" → not reproduced
4. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-044 - Pagination QUICK: page-size change re-renders; next/prev navigates
1. Step: Open Pricing Detail tab, expected: grid loads; pagination controls render
2. Step: Change page-size selector to 10, expected: grid re-renders at new page size; no console errors
3. Step: Click next-page button, expected: grid advances to page 2; rows differ from page 1 (content-anchored)
4. Step: Click previous-page button, expected: grid returns to page 1; first-page rows reappear

---

## Scenario: TC-CPR-DET-045 - Pagination DEEP: every page size 10/20/30/40/50 renders without error
1. Step: Open Pricing Detail tab, expected: pagination controls visible
2. Step: For each of 10, 20, 30, 40, 50: select page size, expected: grid renders rows up to that page size; no console errors for all five options

---

## Scenario: TC-CPR-DET-046 - Pagination DEEP: partial last page renders correctly
1. Step: Navigate to the last page of the Detail grid (last-page nav button), expected: last page visible
2. Step: Count rows on last page (content-anchored), expected: fewer rows than the page size; no duplicates or empty placeholder rows

---

## Scenario: TC-CPR-DET-047 - Pagination DEEP: first/prev disabled on page 1; last/next disabled on last page
1. Step: Ensure grid is on page 1, expected: on page 1
2. Step: Observe first-page + previous-page buttons, expected: both disabled
3. Step: Observe next-page + last-page buttons, expected: both enabled
4. Step: Navigate to last page, expected: last page loaded
5. Step: Observe next-page + last-page buttons, expected: both disabled
6. Step: Observe first-page + previous-page buttons, expected: both enabled

---

## Scenario: TC-CPR-DET-048 - Pagination DEEP: no duplicate or skipped rows across page navigation
1. Step: On page 1, note Product Group Names of first and last visible rows (content-anchored), expected: names recorded
2. Step: Navigate to page 2, expected: page 2 renders
3. Step: Verify page-1 anchor names do not appear on page 2, expected: no duplicates
4. Step: Navigate to last page; note last row name, expected: name recorded
5. Step: Return to page 1, expected: first-page rows reappear matching step 1 names

---

## Scenario: TC-CPR-DET-049 - Sorting DEEP/FLAG: column-header sort behavior (sibling showed no reorder)
1. Step: Note Product Group Name of first visible row; note aria-sort on all column headers, expected: values recorded
2. Step: Click "Product Group Name" column header, expected: observe whether first row changes and aria-sort updates
3. Step: Click same header again, expected: observe whether sort direction reverses
4. Step: Assert actually-observed behavior: if reorder → assert sorted order; if no reorder → assert no-reorder and flag for RCA (NEVER blind-file)

---

## Scenario: TC-CPR-DET-050 - Render-state QUICK: New Price cell renders currency-format; Price column non-editable
1. Step: Open Pricing Detail tab, locate row with saved New Price override > 1000, expected: row visible
2. Step: Read New Price cell value, expected: comma-thousands + exactly 2 decimal places
3. Step: Inspect Price cell on same row, expected: no input element; text only

---

## Scenario: TC-CPR-DET-051 - Render-state DEEP: every editable cell currency-format fidelity; empty-override→base-price render
1. Step: Open Pricing Detail tab, expected: grid loaded
2. Step: For 3+ rows with New Price overrides: read each New Price cell, expected: comma-thousands + 2dp format for each
3. Step: For 3+ rows with no New Price override: read New Price (empty) + Price cell, expected: New Price input empty; Price shows base price
4. Step: For rows with Max Discount overrides: verify Max Discount cell format, expected: up to 2 decimal places

---

## Scenario: TC-CPR-DET-052 - Empty-vol QUICK: 1-row pricebook renders Detail grid correctly
1. Step: Open Pricing Detail tab for 1-row pricebook, expected: tab activates
2. Step: Confirm single row visible (content-anchored by Product Group Name), expected: row present and readable
3. Step: Confirm no error state or empty-state placeholder, expected: grid renders the 1 row without error

---

## Scenario: TC-CPR-DET-053 - Empty-vol DEEP: 0/1/N row states; off-screen content anchor; 2430-row volume integrity
1. Step: Open Pricing Detail tab for 0-row pricebook, expected: empty-state shown; no error
2. Step: Open Pricing Detail tab for 1-row pricebook, expected: single row renders by content anchor
3. Step: Open Pricing Detail tab for 2430-row fixture (2021-PB6), expected: grid renders without hang or error; row count not asserted as exact number (LR-022/LR-053)
4. Step: Navigate past first page; locate a row by Product Group Name anchor (no nth(N)), expected: row located; values readable

---

## Scenario: TC-CPR-DET-054 - Persistence QUICK: Max Discount edit saved; survives reload (content-anchored)
1. Step: Open Pricing Detail tab; locate "Balloon Light Decor", expected: row visible
2. Step: Edit maxDiscountInput to "22.50" (Ctrl+A → Delete → type → blur), expected: Save enabled
3. Step: Save + confirm, expected: Save completes; grid returns to clean
4. Step: Reload + reopen; locate "Balloon Light Decor" by content anchor, expected: Max Discount shows "22.50"
5. Step: ensureDefaultState, expected: baseline restored

---

## Scenario: TC-CPR-DET-055 - Persistence DEEP: dirty survives tab-switch; navigate-away fires unsaved guard; revert→Save-disabled
1. Step: Open Pricing Detail tab; edit maxDiscountInput for "Balloon Light Decor", expected: Save enabled (dirty)
2. Step: Click Pricing Strategy tab while dirty, expected: observe whether dirty state preserved or unsaved guard fires; record actual behavior
3. Step: Return to Pricing Detail tab, expected: dirty edit still present (not lost by tab switch)
4. Step: Navigate away from pricebook page while dirty (click breadcrumb), expected: "Leave site?" / "Unsaved Changes" guard fires
5. Step: Cancel navigation, expected: page remains on Pricing Detail tab with dirty state intact
6. Step: Revert maxDiscountInput to original value (Ctrl+A → Delete → type original → blur), expected: Save returns to disabled (LR-009 / ref DET-033)

---

## Coverage Index (regenerated 2026-06-24 from the test-cases file)

Authoritative current case list (55 cases). Scenario prose above may lag; this index is mechanically regenerated.

- TC-CPR-DET-001 — Pricing Detail tab activates and the product-group grid renders
- TC-CPR-DET-002 — Verify the Pricing Detail grid shows its five columns
- TC-CPR-DET-003 — The Available Product Groups source list loads
- TC-CPR-DET-004 — The source list provides a Search (ID or Name) filter
- TC-CPR-DET-005 — Pricing details load on tab activation
- TC-CPR-DET-006 — Base Price (Price column) is read-only
- TC-CPR-DET-007 — New Price and Max Discount cells are editable
- TC-CPR-DET-008 — Single-clicking a source product group does not add a grid row
- TC-CPR-DET-009 — Double-click a source-list product group does NOT add a grid row (defensive)
- TC-CPR-DET-010 — Drag a source-list product group onto the grid does NOT add (defensive)
- TC-CPR-DET-011 — Existing grid rows expose no Add/Remove affordance (Management mode)
- TC-CPR-DET-012 — Unmodified grid shows the clean state (Save disabled)
- TC-CPR-DET-013 — Editing a Max Discount changes the state to dirty (Save enabled)
- TC-CPR-DET-014 — Save is dialog-gated (Save Changes confirmation)
- TC-CPR-DET-015 — Edit a Max Discount, Save, and the change persists across reload (with restore)
- TC-CPR-DET-016 — Save resets the state from dirty to clean after success
- TC-CPR-DET-017 — Save commits grid override edits in one batch (with restore)
- TC-CPR-DET-018 — Verify a saved New Price override becomes the row Price after reload
- TC-CPR-DET-019 — An empty New Price leaves the Base Price in effect
- TC-CPR-DET-020 — Save accepts a valid currency-formatted New Price
- TC-CPR-DET-021 — New Price = 0 stores 0.00 and enables Save
- TC-CPR-DET-022 — New Price negative (-10) triggers NaN/invalid reload guard (LR-011)
- TC-CPR-DET-023 — New Price very large (9999999.99) accepted with currency formatting
- TC-CPR-DET-024 — New Price extra decimals (12.3456) rounds/truncates to 2dp on blur
- TC-CPR-DET-025 — New Price overflow (beyond max double) triggers NaN reload guard (LR-011)
- TC-CPR-DET-026 — New Price non-numeric ("abc", "!@#") triggers NaN reload guard and reverts
- TC-CPR-DET-027 — New Price renders with locale comma-thousands and exactly 2 decimal places
- TC-CPR-DET-028 — Max Discount = 0 stores 0.00 and enables Save
- TC-CPR-DET-029 — Max Discount negative (-5) rejected; Save does not enable
- TC-CPR-DET-030 — Max Discount > 100 (150) sets aria-invalid + tooltip + blocks Save
- TC-CPR-DET-031 — Max Discount decimals (33.33) stored as 2dp and enables Save
- TC-CPR-DET-032 — Max Discount non-numeric triggers NaN reload guard
- TC-CPR-DET-033 — Reverting New Price to original value returns Save to disabled (LR-009)
- TC-CPR-DET-034 — Clearing New Price to empty leaves Base Price in effect (override fallback)
- TC-CPR-DET-035 — Read-only Price rejects edit: no input resolves, value unchanged
- TC-CPR-DET-036 — Off-screen row read by content anchor on 2430-row grid (LR-022)
- TC-CPR-DET-037 — Positive control: CREATE MODE double-click and full-pointer drag both add a row
- TC-CPR-DET-038 — NM-2301 watch: Max Discount NULL row after New Price + Save does not silently mutate NULL to 0.00
- TC-CPR-DET-039 — CPR-DETAIL-BUG-A: New-Price-only edit Save-enable reliability (drive exact steps, observe)
- TC-CPR-DET-040 — NM-1874 Save-enable spec: New Price edit alone should enable Save per requirement
- TC-CPR-DET-041 — NM-2094 "value clears by design": clearing New Price shows base price or empty post-save
- TC-CPR-DET-042 — NM-2095 cross-row price loss: row A edit + Save does not affect row B
- TC-CPR-DET-043 — NM-1967 Max Discount focus 100→1%: verify live behavior after focus
- TC-CPR-DET-044 — Pagination QUICK: page-size change re-renders; next/prev navigates
- TC-CPR-DET-045 — Pagination DEEP: every page size 10/20/30/40/50 renders without error
- TC-CPR-DET-046 — Pagination DEEP: partial last page renders correctly
- TC-CPR-DET-047 — Pagination DEEP: first/prev disabled on page 1; last/next disabled on last page
- TC-CPR-DET-048 — Pagination DEEP: no duplicate or skipped rows across page navigation
- TC-CPR-DET-049 — Sorting DEEP/FLAG: column-header sort behavior (sibling showed no reorder)
- TC-CPR-DET-050 — Render-state QUICK: New Price cell renders currency-format; Price column non-editable
- TC-CPR-DET-051 — Render-state DEEP: every editable cell currency-format fidelity; empty-override renders base price
- TC-CPR-DET-052 — Empty-vol QUICK: 1-row pricebook renders Detail grid correctly
- TC-CPR-DET-053 — Empty-vol DEEP: 0/1/N row states; off-screen content anchor; 2430-row volume integrity
- TC-CPR-DET-054 — Persistence QUICK: Max Discount edit saved; survives reload (content-anchored)
- TC-CPR-DET-055 — Persistence DEEP: dirty survives tab-switch; navigate-away fires unsaved guard; revert returns Save to disabled
