# Corporate Pricing - Search (NM-1445) Test Cases

**Module**: corporate-pricing

| Module | Test Cases | Automated | Pending Automation | Out of Scope | Updated |
|--------|------------|-----------|--------------------|--------------|---------|
| Corporate Pricing | 56 | 56 (100%) | 0 (0%) | 0 (0%) | 2026-06-25 |

> **P1 (DOCX-functional)** coverage `TC-CPR-SRC-001..018` for the Corporate Pricing **Search** page (NM-1445), authored by SUBPLAN_CORP_PRICING_1445_SEARCH_P1 from the NM-1445 DOCX intent + the 30 `TC-ENC-PRC-1445-*` helper workbook cases (verified/corrected/dropped against live DOM — mapping at the bottom) + a fresh live walk (`field-inventories/corporate-pricing-search-2026-06-05.md`). **P2 (FCC field-matrix)** coverage `TC-CPR-SRC-019..030` added by SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2 from a live FCC walk (`field-inventories/corporate-pricing-search-2026-06-10.md` + `field-case-catalogs/corporate-pricing-search-fcc-2026-06-10.md`). Implemented in `clients/encore/tests/corporate-pricing/corporate-pricing-search.spec.ts`. Read-only screen — no mutation. **baselineScope: baseline-absent** (net-new on e2e; intent oracle = DOCX NM-1445; companion `old-site-baseline/corporate-pricing-2026-06-05.md`).
>
> **Two divergences RAISED (Doctrine 2 — asserted as live, not silently absorbed; see `_internal/encore-questions-drafts/corporate-pricing-search-divergences-2026-06-05.md`):** **D1** — DOCX names 8 columns; live renders 9 ("Productions Currency" → `Is Productions` + `Currency`). **D2** — DOCX says filtering is client-side; live filters are SERVER-SIDE, submitted by the Search button (`GET /navigator/api/location/pricing/strategies?<staged params>`). Tests assert live reality.

---

## FIELD INVENTORY & DISCOVERY

**Live walk 2026-06-05 (Playwright CLI, office 1604).** Corporate Pricing is **React/Next.js** (component `corporate-pricing-container.tsx`), content in shadow roots (deep-pierce for reads; Playwright pierces automatically). Near-zero `data-testid` (3 generic only) → text/role/placeholder/grid-`<th>`/content-anchored selectors.

**Search Criteria filters (7) + defaults:**

| # | Filter | Control | Default (live) | Selector strategy |
|---|--------|---------|----------------|-------------------|
| 1 | Pricebook | text input | (empty) | `input[placeholder="Enter name"]` |
| 2 | Pricing Strategy | text input (**not a dropdown** — helper-corrected) | (empty) | `input[placeholder="Enter strategy"]` |
| 3 | Location | combobox (searchable popover, **2652 options**, LR-025) | All Locations | `button[role="combobox"]:has-text("All Locations")` |
| 4 | Currency | combobox (4 options) | All Currencies | `button[role="combobox"]:has-text("All Currencies")` |
| 5 | Is Internal | checkbox (Radix) | unchecked | `div:has(> *:text-is("Is Internal")) [role="checkbox"]` |
| 6 | Is Labor | checkbox (Radix) | unchecked | `div:has(> *:text-is("Is Labor")) [role="checkbox"]` |
| 7 | Active Only | checkbox (Radix) | **checked** | `div:has(> *:text-is("Active Only")) [role="checkbox"]` |

Actions: **Reset**, **Search** (both `button:text-is(...)`).

**Results grid — real HTML `<table>`, 9 columns:** Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency. Rows = `tbody tr` (50 rendered, **virtualized** of 591). Cells = `td`. Pricebook name cell = `<button class="cursor-pointer hover:underline">` → `/details/<guid>`. Boolean TRUE = `✔` (`<span class="text-primary font-bold">`); FALSE = empty cell (**LR-036 Unicode**). Item count text "591 items found" (**VOLATILE** — assert pattern, not number, LR-022). Per-column anchor: `button[aria-label="Resize column <key>"]`.

**Currency options (live):** All Currencies, USD, CAD, MXN.

**Action bar:** Pricing Override, Loc Pricing Export, Loc Pricing Import, New (split-button → Equipment Pricing / Labor Pricing → `/add?type=equipment|labor`), Export, Import, Grid Options.

**FILTER SUBMISSION MODEL (D2 — verified by network capture):** typing / toggling / selecting **stages** the filter (no API call, grid unchanged). **Search** fires `GET /navigator/api/location/pricing/strategies?<staged params as query string>` → server-side re-query → grid narrows. **Reset** restores defaults + full 591 list client-side (no call). Component load fires this endpoint exactly once.

---

## MCP_VERIFICATION_LOG

| Field | Value |
|---|---|
| Date | 2026-06-05 |
| Tool | Playwright CLI (office 1604) |
| Page | Corporate Pricing — Search (NM-1445) |
| Stack | React/Next.js (`corporate-pricing-container.tsx`); shadow-root content; 3 generic data-testids only |
| Filters verified | 7 — Pricebook, Pricing Strategy, Location (combobox, 2652 opts), Currency (4 opts), Is Internal, Is Labor, Active Only (default checked); see FIELD INVENTORY & DISCOVERY above |
| Grid verified | real `<table>`, 9 columns, virtualized (50 of 591 rendered); boolean TRUE = `✔` Unicode, FALSE = empty (LR-036) |
| Filter model (D2) | SERVER-SIDE — staging on input; `GET …/pricing/strategies?<params>` on **Search**; **Reset** restores defaults client-side; load fires the endpoint once |
| Divergences raised | D1 (live 9 cols vs DOCX 8), D2 (server-side vs DOCX client-side) — `_internal/encore-questions-drafts/corporate-pricing-search-divergences-2026-06-05.md` |

## Validation Rules

N/A — read-only search/filter screen with no input validations. Filters stage on change and submit server-side via **Search** (`GET …/pricing/strategies`); **Reset** restores defaults client-side (D2, verified by network capture). No mutation, no Save.

## TC-CPR-SRC-001: Page loads and shows the default pricebook list
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Initialization / Behavioural |

**Preconditions**: Authenticated; navigating to the Corporate Pricing Search page fresh.
**Steps**: 1. Open the Corporate Pricing Search page for office 1604. 2. Wait for the results grid to populate. 3. Watch the grid while the page sits idle.
**Expected**: When the page opens, the grid populates once with the default pricebook list and does not reload on its own while idle. The default view reflects the default filters: Active Only on, Is Internal off, Is Labor off, first page of results.
**Data**: `expectedListRequests=1`
**Notes**: Confirmed exactly one request on load, with no background polling.
**Automatable**: Yes

---

## TC-CPR-SRC-002: Results grid shows the expected pricebook columns
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Structural / Table headers |

**Preconditions**: On the Search page after initial load.
**Steps**: 1. Read the grid header row. 2. Confirm each expected column is present. 3. Count the columns shown.
**Expected**: All expected columns are present — "Price Book", "Price Book Strategy", "Price Year", "Is GSO", "Is Internal", "Is Labor", "Is Active", "Is Productions", and "Currency". The grid shows nine columns in total.
**Data**: `expectedColumnCount=9` | `splitColumn="Productions Currency" → ["Is Productions","Currency"]`
**Notes**: The "Productions Currency" requirement maps to two live columns ("Is Productions" and "Currency"); the test confirms every required column name appears and that the grid shows nine columns.
**Automatable**: Yes

---

## TC-CPR-SRC-003: Search filter baseline / default state
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Baseline |

**Preconditions**: Fresh page load (no interaction).
**Steps**: 1. Observe the 7 filters without interacting. 2. Verify Pricebook + Pricing Strategy inputs are empty. 3. Verify Location shows "All Locations" and Currency shows "All Currencies". 4. Verify Is Internal + Is Labor checkboxes are unchecked. 5. Verify **Active Only is checked** (default). 6. Verify the item-count footer matches the `N items found` pattern.
**Expected**: All filters are at their defaults: Pricebook and Pricing Strategy empty, Location "All Locations", Currency "All Currencies", Is Internal and Is Labor unchecked, and Active Only checked. The item-count footer reads in the normal "N items found" format.
**Data**: `activeOnlyDefault=checked` | `isInternalDefault=unchecked` | `isLaborDefault=unchecked`
**Notes**: Confirmed on a fresh load that Active Only is checked by default while the other checkboxes are unchecked.
**Automatable**: Yes

---

## TC-CPR-SRC-004: Boolean columns render a visible indicator for true and empty for false
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Table-cell render |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Read the boolean columns (Is GSO, Is Internal, Is Labor, Is Active, Is Productions) across the rendered rows. 2. Confirm true cells show a check mark and false cells are empty.
**Expected**: Boolean columns show a check mark for true and an empty cell for false. At least one check mark is present among the displayed rows; every boolean cell is either a check mark or empty (no other text).
**Data**: `trueMarker=check mark` | `falseMarker=(empty)` | `booleanColumns=[Is GSO, Is Internal, Is Labor, Is Active, Is Productions]`
**Notes**: Observed example rows — "2021-PB6" shows a check only in Is Active; "2022-NP Tier 1" shows checks in Is Active and Is Productions.
**Automatable**: Yes

---

## TC-CPR-SRC-005: Pricebook text filter stages on type, then Search narrows the grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter — text |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Type part of a pricebook name into the "Pricebook" filter. 2. Observe the grid (it does NOT change yet — the filter is staged). 3. Click **Search**. 4. Observe the grid narrow to the matching rows.
**Expected**: Typing stages the filter (the grid does not change immediately). Clicking Search applies the pricebook-name filter, and the grid narrows to rows whose Price Book name contains the typed value. Observed example — typing "2021-PB6" narrows the grid to "1 items found" (the 2021-PB6 row). Clearing the filter and clicking Search restores the broader list.
**Data**: `filterValue=2021-PB6` | `expectedNarrowedName=2021-PB6`
**Notes**: The narrowing happens when Search is clicked, not while typing — the page re-queries the server on Search rather than filtering immediately as you type.
**Automatable**: Yes

---

## TC-CPR-SRC-006: Pricing Strategy text filter stages, then Search applies it
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — text |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Confirm "Pricing Strategy" is a free-text box (placeholder "Enter strategy"), not a dropdown. 2. Type part of a strategy name. 3. Observe the grid is unchanged (staged). 4. Click Search and observe the grid narrow. 5. Clear the field and click Search to restore the list.
**Expected**: Pricing Strategy is a free-text filter. Typing stages the filter; clicking Search applies it and narrows the grid to matching strategy names; clearing the field and clicking Search restores the list.
**Data**: `control=text box` | `placeholder=Enter strategy`
**Notes**: The Pricing Strategy filter is a free-text box, not a dropdown.
**Automatable**: Yes

---

## TC-CPR-SRC-007: Currency dropdown options + select-then-Search narrows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — dropdown |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Open the "Currency" dropdown. 2. Verify the options: All Currencies, USD, CAD, MXN. 3. Select a currency (e.g. USD). 4. Observe the grid is unchanged (staged). 5. Click Search and observe the grid reload its results. 6. Clear back to "All Currencies" and click Search to restore.
**Expected**: The Currency dropdown lists exactly [All Currencies, USD, CAD, MXN]. Selecting a value stages it (no immediate change); clicking Search applies the currency filter and the grid reflects the chosen currency; resetting to "All Currencies" and clicking Search restores the full set.
**Data**: `currencyOptions=[All Currencies, USD, CAD, MXN]`
**Notes**: Covers one representative dropdown filter narrowing the grid and then clearing back to the full list.
**Automatable**: Yes

---

## TC-CPR-SRC-008: Location dropdown default + searchable options present
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — dropdown |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Verify the Location filter default shows "All Locations". 2. Open the dropdown. 3. Verify it renders many location options (a searchable popover; first entry "Clear selection", then rows showing each office number and name). 4. Press Escape to close.
**Expected**: Location defaults to "All Locations" and opens a searchable popover listing the location options (more than 200). The narrowing behavior for each individual location is covered separately.
**Data**: `default=All Locations` | `firstEntry=Clear selection`
**Notes**: This case confirms the default value and that the searchable list of locations is present; per-location narrowing is covered separately.
**Automatable**: Yes

---

## TC-CPR-SRC-009: Is Internal checkbox stages then Search narrows to internal pricebooks
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter — checkbox |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Tick the "Is Internal" checkbox. 2. Observe the grid is unchanged (the filter is staged, not yet applied). 3. Click Search. 4. Observe that the grid narrows to internal pricebooks. 5. Untick the checkbox and click Search to restore the list.
**Expected**: Ticking Is Internal stages the filter (the checkbox shows as checked; the grid stays unchanged). Clicking Search applies the internal-only filter and narrows the grid to internal rows (observed example — "3 items found", the first being "2023-Internal1" with Is Internal checked). Unticking and clicking Search restores the list.
**Data**: `filter=Is Internal` | `verifiedNarrowed=3 items`
**Notes**: The narrowing happens on Search, not when the checkbox is ticked.
**Automatable**: Yes

---

## TC-CPR-SRC-010: Is Labor checkbox stages then Search narrows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — checkbox |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Tick "Is Labor". 2. Observe the filter is staged (the grid is unchanged). 3. Click Search and observe that the grid narrows to labor rows. 4. Untick the checkbox and click Search to restore the list.
**Expected**: Is Labor stages while ticked, then applies on Search; the grid narrows to labor rows; unticking and clicking Search restores the list.
**Data**: `filter=Is Labor`
**Notes**: The narrowing happens on Search, not when the checkbox is ticked.
**Automatable**: Yes

---

## TC-CPR-SRC-011: Active Only default-checked, unchecking and Search reveals inactive rows
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter — checkbox |

**Preconditions**: Fresh page load (Active Only checked by default).
**Steps**: 1. Verify Active Only is checked. 2. Uncheck it. 3. Observe the change is staged (the grid is unchanged). 4. Click Search and observe that the grid now includes inactive pricebooks as well. 5. Re-check Active Only and click Search to return to active-only.
**Expected**: Active Only defaults to checked (the page loads showing active pricebooks only). Unchecking stages the change; clicking Search re-queries without the active-only restriction, so inactive pricebooks appear alongside active ones. Re-checking and clicking Search returns to active-only.
**Data**: `default=checked`
**Notes**: The grid's "Is Active" column and the "Active Only" filter both refer to the pricing strategy's active flag, not the pricebook record's status — do not conflate the two.
**Automatable**: Yes

---

## TC-CPR-SRC-012: Reset clears every filter input and restores the full list
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Reset |

**Preconditions**: At least one text filter typed, one dropdown selected, one checkbox toggled, and a Search performed (grid narrowed).
**Steps**: 1. With filters applied and the grid narrowed, click **Reset**. 2. Observe every input.
**Expected**: Reset clears the text inputs (Pricebook and Pricing Strategy become empty), resets the dropdowns to "All Locations"/"All Currencies", returns the checkboxes to their defaults (Is Internal and Is Labor unchecked, **Active Only re-checked**), AND restores the grid to the full original list — and the full list returns instantly. A second Reset on the already-clean state has no effect.
**Data**: `resetCheckboxes=[false, false, true]` (Is Internal, Is Labor, Active Only) | `resetText=["",""]`
**Notes**: Reset clears all filter inputs and restores the original list immediately, without sending a new request to the server.
**Automatable**: Yes

---

## TC-CPR-SRC-013: The grid does not change while typing or selecting filters (staged until Search)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Network assertion |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Type into the Pricebook filter. 2. Toggle the Is Internal checkbox. 3. Open the Currency dropdown and select a value. 4. Observe the grid after each action.
**Expected**: The grid does not change during typing, toggling, or selecting — the filters are held until Search is clicked.
**Data**: `expectedNewRequests=0`
**Notes**: Confirms that entering filter values sends no request until Search is clicked.
**Automatable**: Yes

---

## TC-CPR-SRC-014: Search applies the staged filters all at once
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Network assertion |

**Preconditions**: On the Search page; a filter staged (for example, Is Internal ticked).
**Steps**: 1. With Is Internal staged, click **Search**. 2. Observe the grid update.
**Expected**: Clicking Search applies the staged filter (the internal-only filter) and the grid re-renders to show the matching rows. This confirms the filters are applied only when Search is clicked, not instantly as values are entered.
**Data**: `expectedNewRequests=1` | `carriesFilter=Is Internal`
**Notes**: Confirms the filters are applied on the server only when Search is clicked.
**Automatable**: Yes

---

## TC-CPR-SRC-015: Clicking a Price Book name navigates to the Pricebook Details route
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Navigation |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Click a Price Book name in the grid (for example, "2021-PB6"). 2. Observe where it lands.
**Expected**: The browser opens that pricebook's Corporate Pricing Details page (a details URL that includes the pricebook's unique identifier); the page heading reads "Corporate Pricing Details".
**Data**: `sampleName=2021-PB6` | `destination=Corporate Pricing Details page for that pricebook` | `detailsHeading=Corporate Pricing Details`
**Notes**: Each Price Book name in the grid is a clickable link that opens its own details page.
**Automatable**: Yes

---

## TC-CPR-SRC-016: New Equipment Pricing option opens the equipment add page
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Navigation / Route-param |

**Preconditions**: On the Search page.
**Steps**: 1. Click the **New** button (it opens a menu). 2. Click "Equipment Pricing". 3. Observe where it lands.
**Expected**: The browser opens the add-pricing page in **equipment** mode — the destination carries an "equipment" type indicator, so the add page knows to create an equipment pricing record (a required behavior).
**Data**: `menuItem=Equipment Pricing` | `mode=equipment`
**Notes**: New is a menu button; a normal click opens the menu, exposing the Equipment Pricing and Labor Pricing choices.
**Automatable**: Yes

---

## TC-CPR-SRC-017: New Labor Pricing option opens the labor add page
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Navigation / Route-param |

**Preconditions**: On the Search page.
**Steps**: 1. Click the **New** button. 2. Click "Labor Pricing". 3. Observe where it lands.
**Expected**: The browser opens the add-pricing page in **labor** mode — the destination carries a "labor" type indicator, so the add page knows to create a labor pricing record (a required behavior).
**Data**: `menuItem=Labor Pricing` | `mode=labor`
**Notes**: Selecting Labor Pricing from the New menu opens the add page set up for a labor pricing record.
**Automatable**: Yes

---

## TC-CPR-SRC-018: Action-bar buttons are present and the New control behaves as a button
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | UI affordance |

**Preconditions**: On the Search page.
**Steps**: 1. Locate the action-bar buttons. 2. Confirm each is present. 3. Confirm "New" is a focusable, clickable button (opens its menu).
**Expected**: The action bar shows: New, Pricing Override, Loc Pricing Export, Loc Pricing Import, Export, Import, Grid Options — all present as buttons. "New" behaves as a button (opens the Equipment/Labor menu). The "Pricing Override" button is present; its destination page is not yet built, so where it leads is checked separately once that page ships.
**Data**: `actionBar=[New, Pricing Override, Loc Pricing Export, Loc Pricing Import, Export, Import, Grid Options]`
**Notes**: This case confirms the action-bar buttons are present and that New behaves as a button. Where the Pricing Override button leads is covered separately, once that destination page is built.
**Automatable**: Yes

---

# FCC P2 — Field-Case Coverage (TC-CPR-SRC-019..030)

> Wave-2 field-coverage cases — boundary values, special characters, each dropdown option, combined filters, and reset behaviour. The Search screen is read-only, so each case stages a filter, clicks Search, checks the server response, then restores. Boundary and special-character cases also confirm the field shows no false error and that focus can leave the field naturally. The full set of search filters is exercised — Pricebook name, Pricing Strategy name, Currency, Location, Is Internal, Is Labor, and Active Only.

## TC-CPR-SRC-019: Pricebook no-match input returns zero results
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — text / negative |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Type a pricebook name that matches nothing (e.g. "ZZZ-NOPE-NOMATCH-9999"). 2. Click Search. 3. Observe the grid.
**Expected**: Clicking Search applies the Pricebook-name filter and the grid shows "0 items found" — a clean empty result, no error.
**Data**: `noMatchExample=ZZZ-NOPE-NOMATCH-9999` | `param=pricebookName` | `expectedCount=0`
**Notes**: A non-matching filter returns an empty grid; the filtering happens on the server when Search is clicked.
**Automatable**: Yes

---

## TC-CPR-SRC-020: Pricebook 250-character overflow accepted with no error and returns zero results
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — text / boundary overflow |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Type a 250-character value into the Pricebook filter. 2. Confirm the field staged the full value (no length cap). 3. Confirm a natural Tab moves focus out of the field. 4. Click Search.
**Expected**: The field accepts all 250 characters (no length limit); the field shows no validation error and focus can leave it naturally; Search returns "0 items found" and the page does not crash.
**Data**: `overflowLen=250` | `param=pricebookName` | `expectedCount=0` | `maxlength=none`
**Notes**: The Pricebook input has no length limit; a 250-character value returns an empty grid without error. The field shows no false error and focus exits normally.
**Automatable**: Yes

---

## TC-CPR-SRC-021: Pricebook special characters accepted literally with no error and no crash
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter — text / negative special-chars |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Type a string of special characters (`%_'"<>&#`) into the Pricebook filter. 2. Confirm the field staged the literal text and shows no validation error. 3. Confirm a natural Tab moves focus out of the field (recorded before any cleanup key). 4. Click Search. 5. Confirm the page did not throw an error.
**Expected**: The field accepts the special characters literally (no validation error); the value is accepted as a literal text filter; the grid shows "0 items found"; the page stays healthy (no error page). A natural Tab moves focus out of the field — no focus-trap.
**Data**: `special=%_'"<>&#` | `param=pricebookName` | `expectedCount=0` | `pageError=0`
**Notes**: Unlike the dropdown filters (which can break when tampered with), the plain text input handles arbitrary characters safely — no error, and focus exits normally.
**Automatable**: Yes

---

## TC-CPR-SRC-022: Pricebook whitespace-only input returns the full unfiltered list
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Filter — text / negative whitespace |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Type only spaces ("   ") into the Pricebook filter. 2. Confirm the field accepts it and a natural Tab moves focus out. 3. Click Search.
**Expected**: The whitespace-only value stages and submits; the server treats it as no meaningful filter and returns the full list (the item count shows the full size, not zero); no error.
**Data**: `whitespace="   "` | `param=pricebookName` | `expectedResult=full list`
**Notes**: Whitespace alone is not a zero-result and not an error — the server returns the full set. The field shows no false error and focus exits normally.
**Automatable**: Yes

---

## TC-CPR-SRC-023: Pricing Strategy no-match filter returns zero results
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — text / negative |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Type a strategy name that matches nothing into the "Pricing Strategy" filter. 2. Click Search. 3. Observe that the grid updates.
**Expected**: Clicking Search applies the Pricing-Strategy-name filter and the grid shows "0 items found".
**Data**: `noMatchExample=ZZZ-NOPE-STRAT` | `param=pricingStrategyName` | `expectedCount=0`
**Notes**: The Pricing Strategy filter is searched on the server by strategy name; a non-matching value returns an empty grid.
**Automatable**: Yes

---

## TC-CPR-SRC-024: Currency each-option (USD/CAD/MXN) submits the matching currency
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — dropdown / each-option |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. For each currency (USD, CAD, MXN): open the Currency dropdown, select it, click Search, observe the grid update, then Reset.
**Expected**: Each currency selection stages (no immediate change) and clicking Search applies the selected currency; the grid updates to reflect the chosen currency.
**Data**: `options=[USD, CAD, MXN]` | `param=currencyId`
**Notes**: Extends the single representative currency (USD) checked in P1 to all three available options; each selection produces its own server query. CAD may return no rows depending on the data, so the count is not asserted.
**Automatable**: Yes

---

## TC-CPR-SRC-025: Location filter narrows the grid by the chosen office (representative)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — dropdown / each-option (representative) |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Open the Location dropdown. 2. Select the first real location option (skip "Clear selection"). 3. Click Search. 4. Observe that the grid updates.
**Expected**: Selecting a specific location stages it and clicking Search applies the location filter; the grid narrows to that location's pricebooks (count is at or below the full list).
**Data**: `param=locationNo` | `pick=first real option`
**Notes**: The Location filter narrows by the chosen office; the representative option is read from the list dynamically rather than hardcoded.
**Automatable**: Yes

---

## TC-CPR-SRC-026: Is Internal toggle and revert restores the baseline
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — checkbox / toggle and revert |

**Preconditions**: Fresh page load (Is Internal unchecked).
**Steps**: 1. Note the baseline count. 2. Tick Is Internal and click Search. 3. Note the new count. 4. Untick Is Internal and click Search. 5. Compare to baseline.
**Expected**: Ticking applies the internal-only filter and the grid changes to internal rows; unticking and clicking Search restores the baseline count. The toggle is symmetric.
**Data**: `param=isInternal` | `revert=baseline`
**Notes**: Adds the revert (untick → restore) half that the P1 internal-filter case did not assert.
**Automatable**: Yes

---

## TC-CPR-SRC-027: Is Labor toggle and revert restores the baseline count
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — checkbox / toggle and revert |

**Preconditions**: Fresh page load (Is Labor unchecked).
**Steps**: 1. Note the baseline count. 2. Tick Is Labor and click Search. 3. Note the new count. 4. Untick Is Labor and click Search. 5. Compare to baseline.
**Expected**: Ticking applies the labor filter and the grid switches to the labor population (which may be LARGER than the non-labor default — not a narrowing); unticking and clicking Search restores the baseline count.
**Data**: `param=isLabor` | `revert=baseline` | `note=labor is a different population, not a subset`
**Notes**: Is Labor switches between the non-labor (default) and labor sets — the labor set can be larger. The check is symmetry and revert, not "fewer rows".
**Automatable**: Yes

---

## TC-CPR-SRC-028: Active Only toggle and revert restores the active-only baseline
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter — checkbox / toggle and revert |

**Preconditions**: Fresh page load (Active Only checked by default).
**Steps**: 1. Note the baseline count (Active Only checked by default). 2. Uncheck Active Only and click Search. 3. Note the new count. 4. Re-check Active Only and click Search. 5. Compare to baseline.
**Expected**: Unchecking Active Only drops the active-only restriction entirely; the grid reveals inactive pricebooks alongside active ones (count grows to at least the baseline). Re-checking restores the active-only view and the baseline count.
**Data**: `param=isActive` | `uncheckedBehavior=restriction dropped` | `revert=baseline`
**Notes**: Adds the re-check → restore half and the detail that unchecking drops the active filter entirely — neither of which the P1 active-only case captured.
**Automatable**: Yes

---

## TC-CPR-SRC-029: Reset restores the full list and is repeatable
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Reset / idempotency |

**Preconditions**: On the Search page; several filters applied and the grid narrowed.
**Steps**: 1. Apply a text filter and a checkbox, then click Search. 2. Click Reset and note the result. 3. Click Reset a second time and note the result.
**Expected**: The first Reset restores the full list and clears the inputs. A second Reset on the already-clean state has no further effect — the result is unchanged. After both resets, all inputs are cleared (Pricebook empty, Is Internal unchecked).
**Data**: `resetServerCalls=0` | `doubleReset=no further effect`
**Notes**: Reset restores in the browser; a second Reset adds nothing.
**Automatable**: Yes

---

## TC-CPR-SRC-030: Combined multi-filter applies every staged filter at once
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter — combined |

**Preconditions**: Fresh page load.
**Steps**: 1. Stage a Pricebook text value, a Currency selection, and the Is Internal checkbox together (no Search yet). 2. Confirm the grid does not change yet while staging. 3. Click Search once. 4. Observe that the grid updates.
**Expected**: Staging multiple filters does not change the grid; clicking Search applies all the staged filters together (Pricebook name, Currency, and Is Internal) and the grid narrows by all conditions at once.
**Data**: `stagedRequests=0` | `searchRequests=1` | `filters=[Pricebook, Currency, Is Internal]`
**Notes**: Exercises several filters at once — a single request, all conditions applied together.
**Automatable**: Yes

---

---

# Grid Options Cases (TC-CPR-SRC-031..033)

## TC-CPR-SRC-031: Grid Options menu opens and exposes column toggles and Reset to Default View
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: grid-options (QUICK)

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Click the "Grid Options" button and expect a menu or panel to open.
2. Read the list of items in the menu.
3. Confirm "Reset to Default View" is present.
4. Confirm exactly 9 column-toggle items are present, one for each column: Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency.

**Expected**: The Grid Options menu opens and presents "Reset to Default View" plus one toggle entry per grid column (9 total). All 9 toggles are visible in the menu before any column has been hidden.
**Data**: `expectedToggles=9` | `toggleNames=[Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency]` | `resetOption=Reset to Default View`
**Notes**: Column count and names mirror the live 9-column grid. This case confirms menu presence and structure only; column hide/show and persistence are covered in SRC-032 and SRC-033.
**Automatable**: Yes

---

## TC-CPR-SRC-032: Toggling a column off hides it from the grid and persists on reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: grid-options (DEEP)

**Preconditions**: On the Search page with all 9 columns visible (default state).
**Steps**:
1. Open Grid Options.
2. Click the toggle for "Is GSO" to turn it off.
3. Close the menu and observe the grid.
4. Reload the page and observe the grid again.

**Expected**: After toggling "Is GSO" off, the "Is GSO" column disappears from the grid (no header, no cells). After a full page reload, "Is GSO" remains hidden — the column-visibility setting is persisted (not reset on navigation).
**Data**: `testedColumn=Is GSO` | `expectedColumnCountAfterHide=8` | `persistenceCheck=reload`
**Notes**: Any column may be used as the test subject; "Is GSO" is the representative. Persistence mechanism (local storage, server preference, or URL param) is not asserted — only the observable outcome (still hidden after reload) matters.
**Automatable**: Yes

---

## TC-CPR-SRC-033: Reset to Default View restores all 9 columns and persists on reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Surface_Family**: grid-options (DEEP)

**Preconditions**: At least one column has been hidden via Grid Options (e.g. SRC-032 left "Is GSO" hidden). On the Search page.
**Steps**:
1. Open Grid Options.
2. Click "Reset to Default View".
3. Close the menu and observe the grid.
4. Reload the page and observe the grid again.

**Expected**: After "Reset to Default View", all 9 columns reappear in the grid. After a full page reload, all 9 columns are still present — the reset to defaults is persisted and survives navigation.
**Data**: `expectedColumnCountAfterReset=9` | `persistenceCheck=reload`
**Notes**: This case is the complement of SRC-032. If the app does not persist the reset (only the hide persists), that is a Flag-worthy asymmetry.
**Automatable**: Yes

---

# Filter → Grid Content Validation Cases (TC-CPR-SRC-034..040)

> These cases assert that the CONTENT of visible grid rows actually obeys the applied filter. Each case stages a single filter, clicks Search, then reads rows to verify every returned row satisfies the criterion.

## TC-CPR-SRC-034: Currency filter set to USD shows only USD rows in the grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Preconditions**: On the Search page with results loaded. Currency filter set to "All Currencies" (default).
**Steps**:
1. Open the Currency dropdown and select "USD".
2. Click Search and wait for the grid to re-render.
3. Read the Currency column value for every visible row.

**Expected**: Every visible row in the Currency column shows "USD". No row shows "CAD", "MXN", or any other value. The "N items found" text reflects the narrowed set.
**Data**: `filterValue=USD` | `columnToCheck=Currency` | `expectedCellValue=USD`
**Notes**: Content-anchored row read; exact count not asserted (LR-022/LR-053). CAD or MXN equivalents are separate cases or covered under SRC-041 multi-filter testing.
**Automatable**: Yes

---

## TC-CPR-SRC-035: Is Internal filter ON shows only internal rows in the grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Preconditions**: On the Search page with results loaded. Is Internal checkbox unchecked (default).
**Steps**:
1. Tick the "Is Internal" checkbox.
2. Click Search and wait for the grid to re-render.
3. Read the "Is Internal" column value for every visible row.

**Expected**: Every visible row shows a checkmark in the Is Internal column (LR-036). No row has an empty Is Internal cell. The "N items found" text reflects the narrowed set.
**Data**: `filter=Is Internal` | `columnToCheck=Is Internal` | `expectedCellValue=✔ (Unicode)` | `booleanFormat=LR-036`
**Notes**: Verifies filter–column coherence, not just request params. Uses LR-036 Unicode detection for boolean cells.
**Automatable**: Yes

---

## TC-CPR-SRC-036: Is Labor filter ON returns the labor pricebook population
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Preconditions**: On the Search page with results loaded. Is Labor checkbox unchecked (default). Note the baseline "items found" count.
**Steps**:
1. Tick "Is Labor".
2. Click Search and wait for the grid to re-render.
3. Read the Is Labor column value for every visible row.
4. Note the new "items found" count and compare to baseline.

**Expected**: Every visible row shows a checkmark in the Is Labor column. The returned item count may be LARGER than the baseline (the labor population is a separate set, not a subset of the default view). No non-labor row appears.
**Data**: `filter=Is Labor` | `columnToCheck=Is Labor` | `expectedCellValue=✔ (Unicode)` | `countNote=labor set may be larger than non-labor default`
**Notes**: Is Labor switches the view to the labor pricing population; the count behavior differs from Is Internal (which narrows). Asserts content coherence, not a count comparison.
**Automatable**: Yes

---

## TC-CPR-SRC-037: Active Only OFF reveals inactive rows and ON restricts to active rows
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Preconditions**: Fresh page load (Active Only checked by default). Note the baseline "items found" count.
**Steps**:
1. Uncheck "Active Only".
2. Click Search and wait for the grid to re-render.
3. Confirm the Is Active column has at least one empty cell (inactive row present).
4. Re-check "Active Only".
5. Click Search and wait for the grid to re-render.
6. Read the Is Active column for every visible row.

**Expected**: With Active Only OFF, at least one row has an empty Is Active cell (an inactive pricebook is now visible) and the "items found" count is at or above the Active-Only baseline. With Active Only ON, every visible row shows a checkmark in the Is Active column and the count returns to the baseline.
**Data**: `filter=Active Only` | `columnToCheck=Is Active` | `offExpected=at least one empty Is Active cell` | `onExpected=every Is Active cell is ✔`
**Notes**: Asserts column content, not just request params. Uses LR-036 Unicode detection.
**Automatable**: Yes

---

## TC-CPR-SRC-038: Location filter narrows the grid to rows belonging to the selected location
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Preconditions**: On the Search page with results loaded. Location filter at "All Locations" (default).
**Steps**:
1. Open the Location dropdown and select one specific location (read the option label to capture the office number).
2. Click Search and wait for the grid to re-render.
3. Verify the "items found" count is at or below the unfiltered baseline.
4. Spot-check a sample of visible rows to confirm they belong to the selected location (e.g. via the Price Book name or any location-identifying cell).

**Expected**: After selecting a specific location and clicking Search, the grid narrows to pricebooks belonging to that location's office number. The "items found" count is at or below the all-locations baseline. No row from a different location appears (within the visible sample).
**Data**: `filterControl=Location dropdown` | `param=locationNo` | `countCheck=lessOrEqual baseline`
**Notes**: A representative single location is sufficient (LR-025 — exhaustive 2652-location enumeration is out of scope). The exact office number is read dynamically from the dropdown, never hardcoded.
**Automatable**: Yes

---

## TC-CPR-SRC-039: Pricing Strategy text filter narrows the grid to matching rows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Type a partial or full strategy name known to exist into the "Pricing Strategy" text filter.
2. Click Search and wait for the grid to re-render.
3. Read the Price Book Strategy column for every visible row.

**Expected**: Every visible row's Price Book Strategy value contains the entered string (contains match — the filter is a name/substring filter, not an exact-match filter). The "items found" count reflects the narrowed set.
**Data**: `filterControl=Pricing Strategy text input` | `matchType=contains` | `columnToCheck=Price Book Strategy`
**Notes**: Strategy name used in the test should be read from a real row in the grid so it is content-anchored and not hardcoded.
**Automatable**: Yes

---

## TC-CPR-SRC-040: Pricebook text filter narrows the grid (contains match or exact ID match)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Type a partial pricebook name substring (e.g. a prefix that should match multiple rows) into the Pricebook filter.
2. Click Search and wait for the grid to re-render.
3. Verify every visible row's Price Book column contains the entered substring.
4. Clear the filter, type an exact ID-style value (e.g. "2021-PB6"), click Search.
5. Verify the returned row's Price Book column matches exactly.

**Expected**: A partial name entry returns every row whose Price Book name contains the entered string (contains semantics). An ID-style exact entry returns only the exact-matching row(s). Every visible row satisfies the filter condition.
**Data**: `filterControl=Pricebook text input` | `partialMatchType=contains` | `exactMatchType=exact` | `columnToCheck=Price Book`
**Notes**: The filter serves both name-contains and ID-exact use cases. The representative ID example "2021-PB6" was live-confirmed in P1 (SRC-005); the partial-match leg is the new content added here.
**Automatable**: Yes

---

# Compound, Order-Independence, and Reset Cases (TC-CPR-SRC-041..043)

## TC-CPR-SRC-041: Multi-filter combined search applies all criteria simultaneously
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Set Is Labor to checked, Currency to "USD", Active Only to checked (default).
2. Click Search and wait for the grid to re-render.
3. For a sample of visible rows (at least the first 5, or all rows if fewer than 5 returned), read Is Labor, Currency, and Is Active column values.

**Expected**: Every sampled row satisfies all three criteria simultaneously: Is Labor column shows a checkmark, Currency column = "USD", Is Active column shows a checkmark. No row violates any of the three conditions. The "items found" count reflects the intersection.
**Data**: `filters=[Is Labor=true, Currency=USD, Active Only=true]` | `andSemantics=true` | `sampleSize=first 5 rows (or all if fewer)`
**Notes**: AND semantics — a row must satisfy all staged filters, not just any one of them. Content-anchored sample; exact count not asserted (LR-022/LR-053).
**Automatable**: Yes

---

## TC-CPR-SRC-042: Filter application order does not affect the result set
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Preconditions**: On the Search page with results loaded. Three distinct filters chosen: (A) Currency=USD, (B) Is Internal=checked, (C) Active Only=checked (default).
**Steps**:
1. Apply filters in order A, B, C (Currency first, then Is Internal, then Active Only). Click Search. Record the "items found" count and the Price Book names of the first N visible rows.
2. Click Reset. Verify the grid returns to the unfiltered state.
3. Apply the same filters in order C, B, A (Active Only first, then Is Internal, then Currency). Click Search.
4. Record the "items found" count and the first N row names again.
5. Compare the two runs.

**Expected**: The "items found" count is identical between both filter-application orders. The first N visible rows are the same set in both runs (order of row appearance may vary; content of the set does not). Filter staging order has no effect on the final results.
**Data**: `filtersA=[Currency=USD, Is Internal=true, Active Only=true]` | `filtersB=[Active Only=true, Is Internal=true, Currency=USD]` | `assertionTarget=count + first N row names equal`
**Notes**: Tests the commutativity of filter staging. Reset between the two runs confirms a clean slate. Exact count is content-anchored; no hardcoded number asserted.
**Automatable**: Yes

---

## TC-CPR-SRC-043: Reset restores the unfiltered baseline (Grid Options visibility unchanged)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Preconditions**: On the Search page with results loaded. Note the unfiltered "items found" count (baseline). Optionally: hide one column via Grid Options before this test to verify column visibility is independent of Reset.
**Steps**:
1. Stage at least 3 filters (e.g. Pricebook text, Currency=USD, Is Internal=checked). Click Search — observe the narrowed count.
2. Click Reset.
3. Observe the grid and all filter inputs.
4. If a column was hidden before this test, verify it is still hidden after Reset.

**Expected**: After Reset: all filter inputs return to their defaults (Pricebook empty, Pricing Strategy empty, Location="All Locations", Currency="All Currencies", Is Internal=unchecked, Is Labor=unchecked, Active Only=checked); the grid count returns to the baseline unfiltered value. Grid Options column visibility is NOT affected by Reset — a hidden column remains hidden.
**Data**: `filters=[Pricebook text, Currency=USD, Is Internal=true]` | `baselineRestore=unfiltered items found count` | `columnVisibilityUnchanged=true`
**Notes**: Reset operates on filters only, not on the Grid Options column-visibility state. The unfiltered baseline count is captured dynamically at the start of the test, never hardcoded.
**Automatable**: Yes

---

# Surface-Behavior Cases (SBC)

> SBC cases assert the OBSERVABLE SURFACE behaviors of the Search grid across 7 families. Each case carries a `Surface_Family` line, `Type=Surface`, and a QUICK or DEEP depth marker. QUICK = one targeted happy-path assertion. DEEP = exhaustive coverage of edge states, boundary conditions, and cross-state interactions within the family.

## TC-CPR-SRC-044: Result fidelity — a single filter returns rows that actually match the query
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Surface |

**Surface_Family**: result-fidelity (QUICK)

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Apply one filter (e.g. Currency = USD).
2. Click Search.
3. Read the Currency column for every visible row.

**Expected**: Every visible row satisfies the filter. No row with a different currency appears. The "items found" count reflects the narrowed set.
**Data**: `singleFilter=Currency=USD` | `columnToCheck=Currency`
**Notes**: Smoke-level fidelity check. Deep coverage across all filters and combined-filter scenarios is in SRC-045.
**Automatable**: Yes

---

## TC-CPR-SRC-045: Result fidelity across all filter types and combined scenarios
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Surface |

**Surface_Family**: result-fidelity (DEEP)

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. For each filter type (Pricebook text, Pricing Strategy text, Currency dropdown, Location dropdown, Is Internal, Is Labor, Active Only): stage the filter, click Search, read the relevant column for all visible rows, confirm every row satisfies the criterion.
2. Confirm that typing or selecting a filter does not change the grid.
3. Confirm clicking Search applies all the staged filters at once.
4. Apply a combined filter (at least 3 criteria). Confirm every visible row satisfies all criteria simultaneously (AND semantics).
5. Stage a Pricebook ID-style value (e.g. "2021-PB6") — confirm exact-match semantics. Stage a partial name — confirm contains-match semantics.
6. Confirm a cross-criteria row (e.g. a CAD row returned by a USD filter) is treated as a defect.

**Expected**: All filter types individually return only matching rows. Combined filters apply AND semantics — no cross-criteria row appears. Typing or selecting stages the filters without changing the grid; clicking Search applies them. ID-style filter matches exactly; name/strategy filter matches by contains. Any cross-criteria row in the result is a defect.
**Data**: `coverageScope=all 7 filters + combined` | `serverCallModel=staged client-side, submitted server-side on Search` | `idFilterSemantics=exact` | `nameFilterSemantics=contains`
**Notes**: Consolidates fidelity coverage across all filter types. Cross-criteria row = defect — do NOT blind-file; investigate first.
**Automatable**: Yes

---

## TC-CPR-SRC-046: Pagination page-size change re-renders correctly and next-page works
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: pagination (QUICK)

**Preconditions**: On the Search page with the default 50-row page size. Grid has more than 10 rows.
**Steps**:
1. Open the page-size combobox and select "10".
2. Wait for the grid to re-render.
3. Confirm no error appears.
4. Confirm the grid shows no more than one page of rows (the page size).
5. Click "Go to next page".
6. Confirm the grid re-renders with the next page of results.

**Expected**: Changing the page size re-renders the grid so that the number of visible rows does not exceed the selected page size, and no error appears. The "Go to next page" button navigates to the next page of results. The "items found" count remains consistent across the page change.
**Data**: `defaultPageSize=50` | `testPageSize=10` | `expectNoConsoleError=true`
**Notes**: Smoke-level pagination check. Full boundary and state coverage (disabled buttons, last page) is in SRC-047.
**Automatable**: Yes

---

## TC-CPR-SRC-047: Pagination covers all page sizes, boundary nav states, and row continuity
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: pagination (DEEP)

**Preconditions**: On the Search page with results loaded. Grid has sufficient rows to exercise multiple pages (use the unfiltered default state which has many rows).
**Steps**:
1. For each page size [10, 20, 30, 40, 50]: set the page-size combobox, verify the grid renders with at most that many rows.
2. Navigate to page 1 — assert "Go to first page" and "Go to previous page" are disabled.
3. Navigate to the last page (click "Go to last page") and confirm "Go to next page" and "Go to last page" are disabled. Confirm the last page may have fewer rows than the selected page size.
4. Navigate through all pages at page size 10. Collect the Price Book name from the first cell of each page and confirm no name appears on more than one page and no gaps in the sequence suggest skipped rows.
5. Confirm the "items found" count remains unchanged throughout all pagination operations.

**Expected**: All five page sizes render without error. Page 1 disables first/prev buttons; last page disables next/last buttons. The final page may contain fewer rows than the page size (partial page). No row appears twice across pages; no rows are skipped. The "items found" count is stable across all pagination actions.
**Data**: `pageSizes=[10, 20, 30, 40, 50]` | `page1Disabled=[Go to first page, Go to previous page]` | `lastPageDisabled=[Go to next page, Go to last page]` | `noItemsFoundHeader=true (no X-Y of Z footer)`
**Notes**: The grid has no "X-Y of Z" footer — count is only available via "items found" text (LR-022). Duplicate/skip detection uses content-anchored row identity (Price Book name), never a row index.
**Automatable**: Yes

---

## TC-CPR-SRC-048: Sorting ascending and descending by clicking a column header
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: sorting (DEEP)

**Flag**: Live probe 2026-06-24 (3 attempts across Price Year ×2 and Price Book + Search) showed header click does NOT reorder the grid — `aria-sort` stays null and the first row is unchanged after the click. RCA is required before asserting sort behavior as working. NEVER blind-file this as a bug; verify with the RCA process first.

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Confirm each of the 9 column headers is a clickable button.
2. Click a column header (e.g. "Price Year") once and observe whether the grid reorders into ascending order.
3. Click the same header again and observe whether the order flips to descending.
4. Click a different column header and observe whether the sort moves to the new column.
5. Record the first-row value before and after each click.

**Expected**: Clicking a column header is intended to sort the grid by that column — once for ascending, again for descending — and clicking a different header moves the sort to that column, with the first row changing to reflect the new order. Observed in testing: clicking a header did not reorder the grid, so this behavior should be confirmed on the live site.
**Data**: `columnHeaders=9 (all grid columns)`
**Notes**: This case documents the intended sort behavior; the observed result (no reordering on header click) needs live confirmation before the sort is treated as working.
**Automatable**: Pending live confirmation

---

## TC-CPR-SRC-049: Combination — filter + paginate together return a coherent set
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: combination (QUICK)

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Apply a single filter (e.g. Currency = USD). Click Search.
2. Change the page size to 10.
3. Navigate to page 2 (if available).
4. Read the Currency column for all visible rows on page 2.

**Expected**: Every visible row on page 2 of the filtered result still shows "USD" in the Currency column. Pagination within a filtered result set does not break the filter — rows on subsequent pages satisfy the active filter.
**Data**: `filter=Currency=USD` | `pageSize=10` | `pageToCheck=2`
**Notes**: Smoke-level combination check. Deep decision-table coverage and order-independence verification is in SRC-050.
**Automatable**: Yes

---

## TC-CPR-SRC-050: Combination multi-filter, Reset, and order-independence in one deep case
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: combination (DEEP)

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Apply a 3-filter combination (Currency=USD, Is Internal=checked, Active Only=checked). Verify every visible row satisfies all 3 criteria (all three filters apply together).
2. Click Reset. Verify all filter inputs are cleared/defaulted AND the grid count returns to the unfiltered baseline. No filter residue remains.
3. Apply the same 3 filters in reverse order (Active Only first, then Is Internal, then Currency). Click Search.
4. Compare the "items found" count and first N row names to the forward-order result.
5. Apply 4 filters simultaneously (add Is Labor=checked). Verify AND semantics still hold across 4 criteria.

**Expected**: AND semantics hold for all combined-filter scenarios — no row violates any active criterion. Reset clears ALL filters (not just some) and restores the unfiltered baseline. Filter application order does not affect results. Adding more filter criteria narrows or maintains the result set (never expands it beyond the intersection).
**Data**: `combinedFilters3=[Currency=USD, Is Internal=true, Active Only=true]` | `combinedFilters4=[+ Is Labor=true]` | `orderIndependence=true` | `resetScope=all filters`
**Notes**: Extends SRC-041 (content validation) and SRC-042 (order-independence) into a surface-level integration test. Reset scope is filters only — Grid Options column visibility is not affected (ref SRC-043).
**Automatable**: Yes

---

## TC-CPR-SRC-051: Render state smoke check for pricebook link navigation and boolean format
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Surface |

**Surface_Family**: render-state (QUICK)

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Locate any Price Book name cell in the grid. Confirm it is a clickable link.
2. Click the Price Book name.
3. Confirm navigation to the Corporate Pricing Details page for that pricebook.
4. Navigate back. Read the Is Active column for one row. Confirm the value is either a check mark or empty.

**Expected**: The Price Book name cell is a link. Clicking it navigates to the Details route. At least one boolean cell in Is Active shows a check mark for a true value. No boolean cell shows unexpected text.
**Data**: `linkCell=Price Book name` | `destination=Corporate Pricing Details route` | `booleanFormat=Unicode ✔ (LR-036)` | `testedBooleanColumn=Is Active`
**Notes**: Smoke-level render check. Full coverage of all link-cells and all 5 boolean columns is in SRC-052.
**Automatable**: Yes

---

## TC-CPR-SRC-052: Render state deep check of link-cells, all boolean columns, and currency values
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Surface |

**Surface_Family**: render-state (DEEP)

**Preconditions**: On the Search page with results loaded (unfiltered default, all 9 columns visible).
**Steps**:
1. For a sample of Price Book name cells (e.g. the first 5 visible rows), confirm each is a link. Click each link, confirm it navigates to the correct Corporate Pricing Details page for that pricebook, and navigate back. A cell that is not a link where a link is expected is a defect — investigate before reporting.
2. For each of the 5 boolean columns (Is GSO, Is Internal, Is Labor, Is Active, Is Productions), read all visible cells. Confirm every cell is either a check mark or empty string — no other text (LR-036).
3. For the Currency column, read all visible cells. Confirm every cell value is one of: USD, CAD, MXN. No unexpected currency code or blank cell (unless the row genuinely has no currency) should appear.

**Expected**: All sampled Price Book name cells are link elements that navigate to the correct Details route. All 5 boolean columns show a check mark for true and are empty for false — no other text. All Currency cells contain a valid currency code (USD, CAD, MXN).
**Data**: `sampleSize=first 5 rows` | `booleanColumns=[Is GSO, Is Internal, Is Labor, Is Active, Is Productions]` | `booleanFormat=LR-036 check mark` | `validCurrencies=[USD, CAD, MXN]`
**Notes**: A non-link Price Book name cell is a defect — investigate before filing (the "purple pricebook links" check from the live probe). An unexpected boolean cell value (not a check mark or "") is an LR-036 format violation. Currency column values beyond USD/CAD/MXN would require investigation.
**Automatable**: Yes

---

## TC-CPR-SRC-053: No-match filter shows the empty-state message and zero items found
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Surface |

**Surface_Family**: empty-vol (QUICK)

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. Enter a pricebook name that matches nothing (e.g. "ZZZ-NOPE-NOMATCH-9999") into the Pricebook filter.
2. Click Search and wait for the grid to settle.
3. Observe the grid body, item count text, and any empty-state message.

**Expected**: The grid body has zero data rows. The "items found" text reads "0 items found". An empty-state message reading exactly "No results." (with the period) is displayed. No error page or script error appears.
**Data**: `noMatchValue=ZZZ-NOPE-NOMATCH-9999` | `expectedItemsFound=0 items found` | `expectedEmptyMessage=No results. (verbatim)` | `expectedTbodyRows=0`
**Notes**: The empty-state message "No results." was live-confirmed. The exact text including the period is asserted verbatim.
**Automatable**: Yes

---

## TC-CPR-SRC-054: Empty and volume states across 0-row, 1-row, and large N-row results
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: empty-vol (DEEP)

**Preconditions**: On the Search page with results loaded.
**Steps**:
1. **0-row state**: apply a no-match filter and click Search. Confirm "0 items found", "No results." verbatim message, and no data rows visible in the grid body.
2. **1-row state**: apply a filter that is known to return exactly one row (e.g. the exact pricebook ID "2021-PB6"). Confirm "1 items found" and exactly one data row visible in the grid body.
3. **Large N-row state**: load the default unfiltered view. Confirm that a row which is not visible in the initial view can still be found by its Price Book name after scrolling.
4. **Volume integrity**: confirm the "items found" count reads in the normal "N items found" format.

**Expected**: All three result states (0, 1, and many rows) render correctly with their indicators. Off-screen rows can still be found by name after scrolling. The "items found" text always reflects the actual result count and reads in the normal "N items found" format.
**Data**: `0rowFilter=ZZZ-NOPE-NOMATCH-9999` | `1rowFilter=2021-PB6 (exact ID)` | `nRowState=unfiltered default` | `virtualizationCheck=content-anchored scroll lookup` | `countPattern=/\d[\d,]*\s+items found/`
**Notes**: The grid is virtualized (only ~50 of the full result set are rendered at a time per the live walk). Content-anchored lookup is the correct approach — never assert `tbody tr` count equals "items found" number in a virtualized grid (LR-022/LR-053).
**Automatable**: Yes

---

## TC-CPR-SRC-055: Persistence — a page-size change or an active filter survives a reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: persistence (QUICK)

**Preconditions**: On the Search page with the default state (50 rows, no filters applied beyond Active Only default).
**Steps**:
1. Change the page size to 10.
2. Reload the page.
3. Observe the page-size combobox value and the grid row count.

**Expected**: After a full page reload, the page-size setting is still set to 10 (it did not revert to the default). The grid renders with no more rows than the selected page size. The page-size setting is persisted across navigation.
**Data**: `testedSetting=page size` | `setValue=10` | `defaultValue=50` | `persistenceCheck=page reload`
**Notes**: Smoke-level persistence check. Full persistence coverage (sort + page-size + filter + column visibility + nav-away) is in SRC-056.
**Automatable**: Yes

---

## TC-CPR-SRC-056: Persistence of page-size, filters, and column visibility across reload and back
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: persistence (DEEP)

**Flag**: Sort persistence depends on whether column-header sort is functional. Live probe 2026-06-24 showed sort may be non-functional (ref SRC-048). If sort is confirmed non-functional, the sort-persistence leg of this case should be marked as N/A or deferred until sort is implemented.

**Preconditions**: On the Search page. Default state (all columns visible, 50-row page size, no active filters beyond Active Only).
**Steps**:
1. Set the page size to 20.
2. Reload the page.
3. Confirm the page size is still 20 (page-size persistence).
4. Apply Currency=USD and click Search.
5. Reload the page.
6. Confirm whether the Currency filter is still set to USD and the grid reflects USD results, or whether the grid has returned to the unfiltered state with Active Only still checked. Either outcome is acceptable. Record which one occurs.
7. Hide the "Is GSO" column via Grid Options.
8. Reload the page.
9. Confirm "Is GSO" is still hidden (column-visibility persistence).
10. Navigate to a pricebook Details page by clicking a pricebook link, then use browser back.
11. Confirm the page size and column visibility are intact after returning via browser back.
12. Type a value into the Pricebook filter without clicking Search, then navigate away (for example, click a pricebook link).
13. Observe whether the app shows a confirmation prompt or silently discards the staged value.

**Expected**: Page-size setting persists across reload. Column-visibility setting (Grid Options) persists across reload and browser-back. Active filters after a Search persist across reload OR are cleanly reset — the behavior is observable and consistent (no partial or corrupt state). Nav-away with a staged-but-unsearched filter either presents a discard confirmation or discards silently — both are acceptable; the case asserts which behavior occurs.
**Data**: `testedSettings=[page size, active filter, column visibility]` | `persistenceChecks=[reload, browser-back]` | `navAwayBehavior=observe and record (prompt or silent)`
**Notes**: Sort persistence is flagged as N/A pending SRC-048 investigation. Active-filter persistence behavior (persisted vs. cleared) is observable at implementation time — assert the observed behavior, not a hardcoded expectation, and flag any inconsistency for product review.
**Automatable**: Partially (sort leg deferred pending SRC-048 RCA)

---

## TC-CPR-SRC-057: Every grid column toggle is enabled (checked) by default
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: render-state

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604); all columns visible (baseline).

**Steps**:
1. Open Grid Options -> the column menu opens
2. Read the column toggles -> every column's checkbox is checked

**Expected**: The Grid Options menu shows every grid column enabled (checked) by default. The per-column toggle listing + Reset to Default View are covered by TC-CPR-SRC-031.
**Data**: office=1604

---

## TC-CPR-SRC-058: Toggling a hidden column back ON restores its header
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Surface_Family**: render-state

**Depends_On**: TC-CPR-SRC-032
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604); "Is GSO" column visible (baseline).

**Steps**:
1. Open Grid Options, uncheck "Is GSO", close -> the "Is GSO" header is gone from the grid
2. Open Grid Options, re-check "Is GSO", close -> the header reappears

**Expected**: Toggling a hidden column back ON via its individual checkbox restores its header. The bulk "Reset to Default View" path is covered by TC-CPR-SRC-033.
**Data**: office=1604, column="Is GSO"

---

## Helper → TC mapping (all 30 `TC-ENC-PRC-1445-*` verified/corrected/dropped per LR-040)

| Helper | Disposition | Mapped to |
|---|---|---|
| 001 component-load 1 call | CONFIRM (endpoint corrected to `/pricing/strategies`) | TC-CPR-SRC-001 |
| 002 8 columns + order | CORRECT (live 9, raise 8↔9) | TC-CPR-SRC-002 |
| 003 Active Only default | CONFIRM (checked) | TC-CPR-SRC-003 |
| 004 boolean render | CONFIRM (Unicode ✔) | TC-CPR-SRC-004 |
| 005 Pricebook narrows | CORRECT (stage→Search server-side) | TC-CPR-SRC-005 |
| 006 empty Pricebook restores | CONFIRM | TC-CPR-SRC-005 |
| 007 Pricebook >200 char BVA | **(b) DEFER** → FCC P2 | `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md` (Pricebook BVA) |
| 008 special chars literal | **(b) DEFER** → FCC P2 | `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md` (special chars) |
| 009 Price Strategy narrows | CORRECT (textbox, not dropdown) | TC-CPR-SRC-006 |
| 010 clear Price Strategy | CONFIRM | TC-CPR-SRC-006 |
| 011 Location narrows | CORRECT (stage→Search) | TC-CPR-SRC-008 |
| 012 default Location | CONFIRM | TC-CPR-SRC-003 / 008 |
| 013 Currency narrows | CORRECT (stage→Search) | TC-CPR-SRC-007 |
| 014 default Currency | CONFIRM | TC-CPR-SRC-003 / 007 |
| 015 Is Internal narrows | CORRECT (stage→Search) | TC-CPR-SRC-009 |
| 016 uncheck Is Internal | CONFIRM | TC-CPR-SRC-009 |
| 017 Is Labor narrows | CORRECT | TC-CPR-SRC-010 |
| 018 uncheck Is Labor | CONFIRM | TC-CPR-SRC-010 |
| 019 Active Only hides inactive | CONFIRM | TC-CPR-SRC-011 |
| 020 uncheck Active Only | CONFIRM | TC-CPR-SRC-011 |
| 021 Reset clears inputs | CONFIRM | TC-CPR-SRC-012 |
| 022 Reset restores list | CONFIRM | TC-CPR-SRC-012 |
| 023 Reset idempotent | CONFIRM | TC-CPR-SRC-012 |
| 024 no network on typing | CONFIRM | TC-CPR-SRC-013 |
| 025 no network on dropdowns | CONFIRM | TC-CPR-SRC-013 |
| 026 New equipment route-param | CONFIRM | TC-CPR-SRC-016 |
| 027 New labor route-param | CONFIRM | TC-CPR-SRC-017 |
| 028 Price Over-ride destination | **(c) DEFER** — DOCX "URL: TBD", destination unbuilt; presence covered | presence → TC-CPR-SRC-018; navigation → (c) documented |
| 029 New Pricing affordance | CONFIRM | TC-CPR-SRC-018 |
| 030 compound multi-filter | **(b) DEFER** → FCC P2 | `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md` (compound row) |

**Summary**: 27 helpers → 18 P1 cases (CONFIRM/CORRECT); 3 helpers (007/008/030) → (b) FCC P2; 1 (028 destination) → (c) DOCX-TBD. All `[ASSUMPTION]` flags resolved on live DOM.

---

## Deferred coverage (documented per LR-040)

- **(b) DISCHARGED 2026-06-10 by SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2** (now `plans/done/`): Pricebook BVA/overflow (helper 007 → TC-020), special-chars literal (helper 008 → TC-021), compound multi-filter (helper 030 → TC-030), per-option enumeration for Currency (TC-024) / Location (TC-025) / Pricing Strategy (TC-023). See `field-case-catalogs/corporate-pricing-search-fcc-2026-06-10.md`.
- **(c) documented**: "Pricing Override" / "Price Over-ride" navigation destination — DOCX line 22 "URL: TBD"; the destination page is not built. Presence + button affordance covered in TC-018; deep navigation is not automatable until the destination ships.
- **(c) documented**: Location **exhaustive** each-option across 2652 options (LR-025) — the representative each-option mechanic is now proven (TC-025); enumerating all 2652 is low-ROI and out of scope. 591-row virtualization stress under compound filters → `SUBPLAN_CORP_PRICING_EDGE_P3.md`.
