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

## Scenario: TC-CPR-STR-001 - Pricebook link entry loads management page
1. Step: Navigate to Pricebook Details for strategyFixture (office 1604), expected: page loads
2. Step: Verify heading[hdgPricebookDetails], expected: "Corporate Pricing Details" visible
3. Step: Verify hdgPricebookName text, expected: "2022-NP Tier 1"

---

## Scenario: TC-CPR-STR-002 - Header shows Price Book Name
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read hdgPricebookName, expected: "2022-NP Tier 1"

---

## Scenario: TC-CPR-STR-003 - Header shows Type (Labor/Equipment)
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read lblHeaderType value, expected: "Equipment"

---

## Scenario: TC-CPR-STR-004 - Header shows Price Year
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read lblHeaderYear value, expected: "2022"

---

## Scenario: TC-CPR-STR-005 - Header shows Currency
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read lblHeaderCurrency value, expected: "USD"

---

## Scenario: TC-CPR-STR-006 - Header shows Active status
1. Step: Open Pricebook Details, expected: page loads
2. Step: Read lblHeaderActive, expected: "Active"

---

## Scenario: TC-CPR-STR-007 - Header fields are reference-only
1. Step: Open Pricebook Details, expected: page loads
2. Step: Assert each header field is read-only text (no input/textbox/combobox), expected: 0 editable controls in header

---

## Scenario: TC-CPR-STR-008 - Tabs render (Pricing Strategy + Pricing Detail)
1. Step: Open Pricebook Details, expected: page loads
2. Step: Verify tabPricingStrategy present, expected: visible
3. Step: Verify tabPricingDetail present, expected: visible

---

## Scenario: TC-CPR-STR-009 - Pricing Strategy tab selected by default
1. Step: Open Pricebook Details fresh, expected: page loads
2. Step: Verify Pricing Strategy content (hdgPriceStrategies) visible, expected: Strategy editor rendered (Strategy tab active)

---

## Scenario: TC-CPR-STR-010 - Pricing Detail tab present and activates
1. Step: Open Pricebook Details, expected: Strategy active
2. Step: Click tabPricingDetail, expected: Detail tab activates (content changes)

---

## Scenario: TC-CPR-STR-011 - History tab absent (NM-1444 not built)
1. Step: Open Pricebook Details, expected: page loads
2. Step: Query tab row for a "History" tab button, expected: not present (count 0)

---

## Scenario: TC-CPR-STR-012 - Clicking existing strategy loads details
1. Step: Open Pricebook Details, expected: list shows "2022-NP Tier 1"
2. Step: Click strategyListItemByName("2022-NP Tier 1"), expected: editor populates
3. Step: Verify txtStrategyName + flag checkboxes present, expected: visible

---

## Scenario: TC-CPR-STR-013 - Setting a location's Primary Pricing surfaces that office in the strategy grid
1. Step: On office 1604's Pricing tab, set Primary Equipment Pricing to "2026-Tier 2 Resort B" and Save (skip save if already selected), expected: selection persists
2. Step: Open the "2026-Tier 2 Resort B" strategy and read tblLocationsUsingDefault rows, expected: at least one row, and office 1604 is present
3. Step: Restore office 1604's Primary Equipment Pricing to its original value, expected: net-zero

---

## Scenario: TC-CPR-STR-014 - Edit existing strategy + Save persists (restore)
1. Step: ensureDefaultState, expected: clean baseline (strategy "2022-NP Tier 1")
2. Step: Edit txtStrategyName (reversible marker), expected: btnSaveDetails enables
3. Step: Save and wait for completion, expected: Save disables
4. Step: Reload, expected: edited value persists
5. Step: ensureDefaultState cleanup, expected: baseline restored

---

## Scenario: TC-CPR-STR-015 - Add New opens dialog and appends row
1. Step: Open Pricebook Details, expected: lblStrategyTotal "Total: 1"
2. Step: Click btnAddStrategy, expected: dlgNewStrategy opens (txtDlgStrategyName + flags + btnDlgAdd/btnDlgCancel)
3. Step: Fill txtDlgStrategyName and click btnDlgAdd, expected: dialog closes, new row appended (Total increments)
4. Step: Remove new strategy (no Save), expected: baseline restored

---

## Scenario: TC-CPR-STR-016 - New strategy shows Remove
1. Step: Add a new strategy via dialog, expected: new row appears
2. Step: Inspect new strategy item for btnRemoveStrategyByName, expected: Remove icon present
3. Step: Remove (no Save), expected: baseline restored

---

## Scenario: TC-CPR-STR-017 - Legacy strategy hides Remove
1. Step: Open Pricebook Details, expected: legacy "2022-NP Tier 1" in list
2. Step: Inspect legacy item for a Remove control, expected: none present

---

## Scenario: TC-CPR-STR-018 - Remove new strategy deletes pre-commit
1. Step: Add a new strategy via dialog, expected: Total increments, btnSaveDetails enabled
2. Step: Click the new strategy's Remove, expected: row removed immediately
3. Step: Verify lblStrategyTotal back to "Total: 1" and btnSaveDetails disabled, expected: clean, no reload

---

## Scenario: TC-CPR-STR-019 - Legacy strategy cannot be removed
1. Step: Open Pricebook Details with legacy strategy, expected: page loads
2. Step: Assert no remove/delete affordance on the legacy item, expected: none

---

## Scenario: TC-CPR-STR-020 - Clean state = Save disabled
1. Step: Open Pricebook Details, make no changes, expected: page loads
2. Step: Verify btnSaveDetails, expected: disabled

---

## Scenario: TC-CPR-STR-021 - Editing makes dirty (Save enables)
1. Step: Open Pricebook Details (clean), expected: btnSaveDetails disabled
2. Step: Edit txtStrategyName, expected: btnSaveDetails enables
3. Step: Discard (reload/restore), expected: baseline restored

---

## Scenario: TC-CPR-STR-022 - Adding makes dirty (Save enables)
1. Step: Open Pricebook Details (clean), expected: btnSaveDetails disabled
2. Step: Add a new strategy via dialog, expected: btnSaveDetails enables
3. Step: Remove (no Save), expected: baseline restored

---

## Scenario: TC-CPR-STR-023 - Save commits edits + additions in batch (restore)
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Edit existing strategy AND add a new strategy, expected: btnSaveDetails enabled
3. Step: Save, expected: completes
4. Step: Reload, expected: both edit + new strategy reflected
5. Step: ensureDefaultState cleanup, expected: baseline restored

---

## Scenario: TC-CPR-STR-024 - Save provides confirmation feedback
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Make a reversible change and Save, expected: completes
3. Step: Observe notifications area, expected: success indicator visible
4. Step: ensureDefaultState cleanup, expected: baseline restored

---

## Scenario: TC-CPR-STR-025 - Save resets dirty to clean
1. Step: ensureDefaultState, expected: clean baseline
2. Step: Make a reversible change, expected: btnSaveDetails enabled (dirty)
3. Step: Save and wait for success, expected: btnSaveDetails disabled (clean)
4. Step: ensureDefaultState cleanup, expected: baseline restored

# Deep Coverage Scenarios (NM-2261 — create multiple Pricing Strategies)

> Live-verified 2026-06-26. Mutation-safe: new-strategy add/remove + multi-row run in-session (reload discards — a committed new strategy is irreversible); save-cycle uses reversible existing-strategy edits; save-gating + delete-all run on the no-commit New Pricebook create page.

## Scenario: TC-CPR-STR-026 - Add multiple strategies in one session (N=2)
1. Step: Open dialog, add strategy A, Add, expected: Total 2, A in list
2. Step: Open dialog, add strategy B, Add, expected: Total 3, both in list; Save enabled
3. Step: Reload (discard), expected: Total 1 restored

## Scenario: TC-CPR-STR-027 - Add multiple strategies in one session (N=3, edge)
1. Step: Add three unique strategies (A, B, C) via dialog, expected: Total 4, all present, Save enabled
2. Step: Reload (discard), expected: Total 1 restored

## Scenario: TC-CPR-STR-028 - Edit each row's name in a multi-row session
1. Step: Add two strategies (A, B), expected: Total 3
2. Step: Select A, rename in editor to A2, expected: list shows A2
3. Step: Select B, rename to B2, expected: list shows B2
4. Step: Reload (discard), expected: Total 1 restored

## Scenario: TC-CPR-STR-029 - Remove each new strategy in sequence
1. Step: Add three strategies (Total 4, Save enabled), expected: dirty
2. Step: Remove A, B, C in turn, expected: Total 4→3→2→1
3. Step: After all removed, expected: Save disabled (clean baseline)

## Scenario: TC-CPR-STR-030 - Remove the last strategy on a new pricebook disables Save (delete-all)
1. Step: New Pricebook (/add?type=equipment): set Name+Year + add one strategy, expected: Save enabled
2. Step: Remove the strategy, expected: 0 strategies, empty state, Save disabled

## Scenario: TC-CPR-STR-031 - Re-add a strategy after delete-all re-enables Save
1. Step: From the 0-strategy new-pricebook state, add a strategy, expected: Save enabled

## Scenario: TC-CPR-STR-032 - Reverting the strategy name disables Save (LR-009)
1. Step: Edit the name (marker), expected: Save enabled
2. Step: Clear back to "2022-NP Tier 1", expected: Save disabled (net-zero)

## Scenario: TC-CPR-STR-033 - Reverting a flag toggle disables Save
1. Step: Toggle Is Active off, expected: Save enabled
2. Step: Toggle Is Active back on, expected: Save disabled

## Scenario: TC-CPR-STR-034 - Partial revert keeps Save enabled until all changes revert
1. Step: Edit name AND toggle Is Active, expected: Save enabled
2. Step: Revert only the name, expected: Save still enabled
3. Step: Revert Is Active, expected: Save disabled

## Scenario: TC-CPR-STR-035 - Dialog Is Active defaults checked
1. Step: Open New Pricing Strategy dialog, read Is Active, expected: checked

## Scenario: TC-CPR-STR-036 - Dialog Is GSO defaults unchecked
1. Step: Open dialog, read Is GSO, expected: unchecked

## Scenario: TC-CPR-STR-037 - Dialog Is Internal defaults unchecked
1. Step: Open dialog, read Is Internal, expected: unchecked

## Scenario: TC-CPR-STR-038 - Dialog Is Productions defaults unchecked
1. Step: Open dialog, read Is Productions, expected: unchecked

## Scenario: TC-CPR-STR-039 - Dialog flag carries to the new strategy (Is Active off)
1. Step: Open dialog, uncheck Is Active, fill name, Add, expected: new row appended
2. Step: Select the new strategy, expected: editor Is Active unchecked
3. Step: Reload (discard), expected: Total 1 restored

## Scenario: TC-CPR-STR-040 - Dialog Is GSO carries to the new strategy
1. Step: Open dialog, check Is GSO, fill name, Add; select new strategy, expected: editor Is GSO checked
2. Step: Reload (discard), expected: Total 1 restored

## Scenario: TC-CPR-STR-041 - Dialog Is Internal carries to the new strategy
1. Step: Open dialog, check Is Internal, fill name, Add; select new strategy, expected: editor Is Internal checked
2. Step: Reload (discard), expected: Total 1 restored

## Scenario: TC-CPR-STR-042 - Dialog Is Productions carries + mutual-exclusion applies
1. Step: Open dialog, check Is Productions, expected: Is Internal + Is GSO disabled in dialog
2. Step: Fill name, Add; select new strategy, expected: editor Is Productions checked
3. Step: Reload (discard), expected: Total 1 restored

## Scenario: TC-CPR-STR-043 - NM-2047 Is Productions disables Is Internal and Is GSO
1. Step: Select the strategy (Is Productions checked), expected: Is Internal + Is GSO disabled in editor
2. Step: Open dialog, check Is Productions, expected: Is Internal + Is GSO disabled in dialog

## Scenario: TC-CPR-STR-044 - NM-2047 Type and Currency read-only after create
1. Step: Inspect header Type (Labor/Equipment) + Currency, expected: read-only reference text (no editable controls)

## Scenario: TC-CPR-STR-045 - Empty Strategy Name blocks Add
1. Step: Open dialog, leave name empty, expected: Add button disabled

## Scenario: TC-CPR-STR-046 - Whitespace-only name blocks Add
1. Step: Open dialog, enter spaces only, expected: Add button disabled (trimmed)

## Scenario: TC-CPR-STR-047 - NM-2059 duplicate name blocked with inline error
1. Step: Open dialog, enter "2022-NP Tier 1", click Add, expected: inline error "A pricing strategy with this name already exists.", dialog stays open, Total unchanged
2. Step: Cancel, expected: no change

## Scenario: TC-CPR-STR-048 - Cancel discards a pending strategy
1. Step: Open dialog, fill name, Cancel, expected: not in list, Total unchanged

## Scenario: TC-CPR-STR-049 - Close (X) discards a pending strategy
1. Step: Open dialog, fill name, click Close (X), expected: not in list, Total unchanged

## Scenario: TC-CPR-STR-050 - New pricebook with 0 strategies has Save disabled
1. Step: New Pricebook: set Name + Year, no strategies, expected: Save disabled

## Scenario: TC-CPR-STR-051 - Adding one strategy enables Save on a new pricebook
1. Step: From TC-050 state, add one strategy, expected: Save enabled

## Scenario: TC-CPR-STR-052 - Removing the last strategy re-disables Save on a new pricebook
1. Step: From TC-051 state, remove the strategy, expected: Save disabled

## Scenario: TC-CPR-STR-053 - Strategy Name field caps input at 100 characters
1. Step: Open dialog, enter a 255-char name, expected: value truncated to 100 (maxlength=100)
2. Step: Cancel (discard)

## Scenario: TC-CPR-STR-054 - Special characters in the Strategy Name accepted and preserved
1. Step: Open dialog, enter `ZZ-Test & <Strategy> "2026"`, expected: preserved verbatim, Add enabled
2. Step: Cancel (discard)

## Scenario: TC-CPR-STR-055 - Special-character name round-trips across save and reload
1. Step: Rename existing strategy to `2022-NP Tier 1 & "QA"`, Save, reload, expected: editor name equals input exactly
2. Step: Restore original name + Save, expected: baseline restored

## Scenario: TC-CPR-STR-056 - A strategy flag reads correctly from its rendered checkbox [render-state QUICK]
1. Step: Select the strategy, read Is Active via the rendered checkbox, expected: reads true (Radix aria-checked)

## Scenario: TC-CPR-STR-057 - Every editor flag reads per its render format; the list has no boolean columns [render-state DEEP]
1. Step: Read all four editor flags' checked/disabled state, expected: each reads live state per Radix aria-checked
2. Step: Inspect the strategy list rows, expected: only name buttons (no boolean columns)

## Scenario: TC-CPR-STR-058 - 0-strategy and 1-strategy states render correctly [empty-vol QUICK]
1. Step: Existing pricebook, expected: 1-row list (Total: 1)
2. Step: New pricebook with 0 strategies, expected: empty state renders, Save disabled

## Scenario: TC-CPR-STR-059 - Strategy list renders at 0 / 1 / N strategies [empty-vol DEEP]
1. Step: 0 (new pricebook) / 1 (fixture) / N (multi-add in-session), expected: each renders, Total reflects count
2. Step: Reload (discard)

## Scenario: TC-CPR-STR-060 - A saved strategy edit survives reload [persistence QUICK]
1. Step: Rename existing strategy reversibly, Save, reload, expected: change persists
2. Step: Restore + Save (cleanup)

## Scenario: TC-CPR-STR-061 - Dirty survives sub-tab switch; nav-away prompts "Unsaved changes" [persistence DEEP]
1. Step: Edit name (dirty), switch to Pricing Detail tab, expected: Save still enabled, no dialog
2. Step: Trigger full nav-away (breadcrumb) while dirty, expected: "Unsaved changes" alertdialog (Stay/Discard), nav blocked
3. Step: Click Discard, expected: change abandoned, nav proceeds

## Scenario: TC-CPR-STR-062 - The strategy search box filters the list [result-fidelity QUICK]
1. Step: Type "zzzz" in Search strategies, expected: 0 rows (Total: 0)
2. Step: Type "2022", expected: the strategy shows
3. Step: Clear, expected: full list returns

## Scenario: TC-CPR-STR-063 - Search narrows to matching names among multiple strategies [result-fidelity DEEP]
1. Step: Add two in-session strategies (A, B), expected: Total 3
2. Step: Filter by A's name, expected: only A shows (content-anchored)
3. Step: Clear, expected: all show; Total reflects filtered vs full
4. Step: Reload (discard), expected: Total 1 restored

> Surface-family out-of-scope (live-confirmed 2026-06-26): `out-of-scope:pagination` (small managed list, no rows-per-page control), `out-of-scope:sorting` (no sortable column header), `out-of-scope:combination` (only the name filter present; needs ≥2 of filter/sort/paginate).

## Coverage Index (regenerated 2026-06-26 from the test-cases file)

Authoritative current case list (63 cases). Scenario prose above may lag; this index is mechanically regenerated.

- TC-CPR-STR-001 — Pricebook link entry loads the Pricebook Details management page
- TC-CPR-STR-002 — Header shows the Price Book Name
- TC-CPR-STR-003 — Header shows the Price Book Type (Labor/Equipment)
- TC-CPR-STR-004 — Header shows the Price Year
- TC-CPR-STR-005 — Header shows the Currency
- TC-CPR-STR-006 — Header shows the Active status
- TC-CPR-STR-007 — Header fields are reference-only (not editable)
- TC-CPR-STR-008 — Tabs render — Pricing Strategy + Pricing Detail
- TC-CPR-STR-009 — Pricing Strategy tab is selected by default on load
- TC-CPR-STR-010 — Pricing Detail tab is present and activates
- TC-CPR-STR-011 — History tab is absent on the live site
- TC-CPR-STR-012 — Clicking an existing strategy loads its details
- TC-CPR-STR-013 — Setting a location's Primary Pricing surfaces that office in the strategy grid
- TC-CPR-STR-014 — Edit an existing strategy and Save persists the change (with restore)
- TC-CPR-STR-015 — Add New opens the New Pricing Strategy dialog and appends a row
- TC-CPR-STR-016 — Newly added strategy shows a Remove button
- TC-CPR-STR-017 — Legacy strategies do not show a Remove button
- TC-CPR-STR-018 — Remove on a new strategy deletes it before commit
- TC-CPR-STR-019 — Legacy strategies cannot be removed from the management view
- TC-CPR-STR-020 — Unmodified strategy list shows the clean state (Save disabled)
- TC-CPR-STR-021 — Editing a strategy changes the state to dirty (Save enabled)
- TC-CPR-STR-022 — Adding a new strategy changes the state to dirty (Save enabled)
- TC-CPR-STR-023 — Save commits strategy edits and additions in one batch (with restore)
- TC-CPR-STR-024 — Save provides confirmation feedback
- TC-CPR-STR-025 — Save resets the state from dirty to clean after success
- TC-CPR-STR-026 — Add multiple strategies in one session (N=2)
- TC-CPR-STR-027 — Add multiple strategies in one session (N=3, edge)
- TC-CPR-STR-028 — Edit each row's name in a multi-row session
- TC-CPR-STR-029 — Remove each new strategy in sequence
- TC-CPR-STR-030 — Remove the last strategy on a new pricebook disables Save (delete-all)
- TC-CPR-STR-031 — Re-add a strategy after delete-all re-enables Save
- TC-CPR-STR-032 — Reverting the strategy name disables Save (LR-009)
- TC-CPR-STR-033 — Reverting a flag toggle disables Save
- TC-CPR-STR-034 — Partial revert keeps Save enabled until all changes revert
- TC-CPR-STR-035 — Dialog — Is Active defaults checked
- TC-CPR-STR-036 — Dialog — Is GSO defaults unchecked
- TC-CPR-STR-037 — Dialog — Is Internal defaults unchecked
- TC-CPR-STR-038 — Dialog — Is Productions defaults unchecked
- TC-CPR-STR-039 — Dialog flag carries to the new in-session strategy (Is Active off)
- TC-CPR-STR-040 — Dialog Is GSO carries to the new strategy
- TC-CPR-STR-041 — Dialog Is Internal carries to the new strategy
- TC-CPR-STR-042 — Dialog Is Productions carries + mutual-exclusion applies on the new strategy
- TC-CPR-STR-043 — NM-2047 — Is Productions disables Is Internal and Is GSO (mutual-exclusion)
- TC-CPR-STR-044 — NM-2047 — Type and Currency are read-only after create (IsLabor/Currency lock)
- TC-CPR-STR-045 — Empty Strategy Name blocks Add
- TC-CPR-STR-046 — Whitespace-only name blocks Add
- TC-CPR-STR-047 — NM-2059 — duplicate strategy name is blocked with an inline error
- TC-CPR-STR-048 — Cancel discards a pending strategy
- TC-CPR-STR-049 — Close (X) discards a pending strategy
- TC-CPR-STR-050 — New pricebook with 0 strategies has Save disabled
- TC-CPR-STR-051 — Adding one strategy enables Save on a new pricebook
- TC-CPR-STR-052 — Removing the last strategy re-disables Save on a new pricebook
- TC-CPR-STR-053 — Strategy Name field caps input at 100 characters
- TC-CPR-STR-054 — Special characters in the Strategy Name are accepted and preserved
- TC-CPR-STR-055 — A special-character name round-trips exactly across save and reload
- TC-CPR-STR-056 — A strategy flag reads correctly from its rendered checkbox (render-state QUICK)
- TC-CPR-STR-057 — Every editor flag reads per its render format; the list has no boolean columns (render-state DEEP)
- TC-CPR-STR-058 — 0-strategy and 1-strategy states render correctly (empty-vol QUICK)
- TC-CPR-STR-059 — Strategy list renders at 0 / 1 / N strategies (empty-vol DEEP)
- TC-CPR-STR-060 — A saved strategy edit survives reload (persistence QUICK)
- TC-CPR-STR-061 — Dirty state survives sub-tab switch; nav-away prompts "Unsaved changes" (persistence DEEP)
- TC-CPR-STR-062 — The strategy search box filters the list (result-fidelity QUICK)
- TC-CPR-STR-063 — Search narrows to matching names among multiple strategies (result-fidelity DEEP)
