# Corporate Pricing - Search (NM-1445) Test Cases

| Module | Test Cases | Automated | Pending Automation | Out of Scope | Updated |
|--------|------------|-----------|--------------------|--------------|---------|
| Corporate Pricing | 18 | 18 (100%) | 0 (0%) | 0 (0%) | 2026-06-05 |

> P1 (DOCX-functional) coverage for the Corporate Pricing **Search** page (NM-1445). Authored by SUBPLAN_CORP_PRICING_1445_SEARCH_P1 from the NM-1445 DOCX intent + the 30 `TC-ENC-PRC-1445-*` helper workbook cases (verified/corrected/dropped against live DOM — mapping at the bottom) + a fresh live walk (`field-inventories/corporate-pricing-search-2026-06-05.md`). Implemented in `clients/encore/specs/corporate-pricing/corporate-pricing-search.spec.ts`. Read-only screen — no mutation. **baselineScope: baseline-absent** (net-new on e2e; intent oracle = DOCX NM-1445; companion `old-site-baseline/corporate-pricing-2026-06-05.md`).
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

## TC-LOC-CPR-001: Page loads and requests the pricebook list exactly once
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Initialization / Behavioural |

**Preconditions**: Authenticated; navigating to the Corporate Pricing Search page fresh.
**Steps**: 1. Begin watching for the pricebook-list request. 2. Open the Corporate Pricing Search page for office 1604. 3. Wait for the results grid to populate. 4. Count how many pricebook-list requests were sent.
**Expected**: The page sends the pricebook-list request **exactly once** when it opens; the grid populates with pricebook rows; no duplicate list request fires while the page sits idle. That initial request reflects the default filter state (Active Only on, Is Internal off, Is Labor off, first page of results).
**Data**: `expectedListRequests=1`
**Notes**: Confirmed exactly one request on load, with no background polling.
**Automatable**: Yes

---

## TC-LOC-CPR-002: Results grid shows the expected pricebook columns
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Structural / Table headers |

**Preconditions**: On the Search page after initial load.
**Steps**: 1. Read the grid header row. 2. Confirm each expected column is present. 3. Count the columns shown.
**Expected**: All expected columns are present — "Price Book", "Price Book Strategy", "Price Year", "Is GSO", "Is Internal", "Is Labor", "Is Active", "Is Productions", and "Currency". The grid shows nine columns in total. (The original requirement listed "Productions Currency" as a single column; the live page presents it as two separate columns, "Is Productions" and "Currency".)
**Data**: `expectedColumnCount=9` | `splitColumn="Productions Currency" → ["Is Productions","Currency"]`
**Notes**: The "Productions Currency" requirement maps to two live columns ("Is Productions" and "Currency"); the test confirms every required column name appears and that the grid shows nine columns.
**Automatable**: Yes

---

## TC-LOC-CPR-003: Search filter baseline / default state
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Baseline |

**Preconditions**: Fresh page load (no interaction).
**Steps**: 1. Observe the 7 filters without interacting. 2. Verify Pricebook + Pricing Strategy inputs are empty. 3. Verify Location shows "All Locations" and Currency shows "All Currencies". 4. Verify Is Internal + Is Labor checkboxes are unchecked. 5. Verify **Active Only is checked** (default). 6. Verify the item-count footer matches the `N items found` pattern.
**Expected**: Pricebook="" , Pricing Strategy="", Location="All Locations", Currency="All Currencies", Is Internal=unchecked, Is Labor=unchecked, **Active Only=checked**; item count matches `/\d[\d,]*\s+items found/` (live 591 — not asserted exactly, volatile).
**Data**: `activeOnlyDefault=checked` | `isInternalDefault=unchecked` | `isLaborDefault=unchecked`
**Notes**: Confirmed on a fresh load that Active Only is checked by default while the other checkboxes are unchecked.
**Automatable**: Yes

---

## TC-LOC-CPR-004: Boolean columns render a visible indicator for true and empty for false
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Table-cell render |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Read the boolean columns (Is GSO, Is Internal, Is Labor, Is Active, Is Productions) across the rendered rows. 2. Confirm true cells show a `✔` marker and false cells are empty.
**Expected**: Boolean columns show a check mark for true and an empty cell for false. At least one check mark is present among the displayed rows; every boolean cell is either a check mark or empty (no other text).
**Data**: `trueMarker=check mark` | `falseMarker=(empty)` | `booleanColumns=[Is GSO, Is Internal, Is Labor, Is Active, Is Productions]`
**Notes**: Observed example rows — "2021-PB6" shows a check only in Is Active; "2022-NP Tier 1" shows checks in Is Active and Is Productions.
**Automatable**: Yes

---

## TC-LOC-CPR-005: Pricebook text filter stages on type, then Search narrows the grid server-side
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter — text |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Type part of a pricebook name into the "Pricebook" filter. 2. Observe the grid (it does NOT change yet — the filter is staged). 3. Click **Search**. 4. Observe the grid narrow and the pricebook-list request fire.
**Expected**: Typing stages the filter (the grid does not change immediately). Clicking Search sends a fresh pricebook-list request carrying the pricebook-name filter, and the grid narrows to rows whose Price Book name contains the typed value. Observed example — typing "2021-PB6" narrows the grid to "1 items found" (the 2021-PB6 row). Clearing the filter and clicking Search restores the broader list.
**Data**: `filterValue=2021-PB6` | `expectedNarrowedName=2021-PB6`
**Notes**: The narrowing happens when Search is clicked, not while typing — the page re-queries the server on Search rather than filtering immediately as you type.
**Automatable**: Yes

---

## TC-LOC-CPR-006: Pricing Strategy text filter stages, then Search applies it
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — text |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Confirm "Pricing Strategy" is a free-text box (placeholder "Enter strategy"), not a dropdown. 2. Type part of a strategy name. 3. Observe the grid is unchanged (staged). 4. Click Search → grid narrows. 5. Clear the field and click Search → the list restores.
**Expected**: Pricing Strategy is a free-text filter. Typing stages the filter; clicking Search applies it and narrows the grid to matching strategy names; clearing the field and clicking Search restores the list.
**Data**: `control=text box` | `placeholder=Enter strategy`
**Notes**: The Pricing Strategy filter is a free-text box, not a dropdown.
**Automatable**: Yes

---

## TC-LOC-CPR-007: Currency dropdown options + select-then-Search narrows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — dropdown |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Open the "Currency" dropdown. 2. Verify the options: All Currencies, USD, CAD, MXN. 3. Select a currency (e.g. USD). 4. Observe the grid is unchanged (staged). 5. Click Search → grid re-queries server-side. 6. Clear back to "All Currencies" + Search → restores.
**Expected**: The Currency dropdown lists exactly [All Currencies, USD, CAD, MXN]. Selecting a value stages it (no immediate change, no request fires); clicking Search applies the currency filter and the grid reflects the chosen currency; resetting to "All Currencies" and clicking Search restores the full set.
**Data**: `currencyOptions=[All Currencies, USD, CAD, MXN]`
**Notes**: Covers one representative dropdown filter narrowing the grid and then clearing back to the full list.
**Automatable**: Yes

---

## TC-LOC-CPR-008: Location dropdown default + searchable options present
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — dropdown |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Verify the Location filter default shows "All Locations". 2. Open the dropdown. 3. Verify it renders many location options (a searchable popover; first entry "Clear selection", then `<office#> - <name>` rows). 4. Press Escape to close.
**Expected**: Location defaults to "All Locations" and opens a searchable popover listing the location options (more than 200; the exact count is not asserted as it varies). The narrowing behavior for each individual location is covered separately.
**Data**: `default=All Locations` | `firstEntry=Clear selection`
**Notes**: This case confirms the default value and that the searchable list of locations is present; per-location narrowing is covered separately.
**Automatable**: Yes

---

## TC-LOC-CPR-009: Is Internal checkbox stages then Search narrows to internal pricebooks
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter — checkbox |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Tick the "Is Internal" checkbox. 2. Observe the grid is unchanged (staged, no request fires). 3. Click Search. 4. Observe the grid narrow to internal pricebooks. 5. Untick the checkbox and click Search → the list restores.
**Expected**: Ticking Is Internal stages the filter (the checkbox shows as checked; the grid and the network stay unchanged). Clicking Search applies the internal-only filter and narrows the grid to internal rows (observed example — "3 items found", the first being "2023-Internal1" with Is Internal checked). Unticking and clicking Search restores the list.
**Data**: `filter=Is Internal` | `verifiedNarrowed=3 items`
**Notes**: The narrowing happens on Search, not when the checkbox is ticked.
**Automatable**: Yes

---

## TC-LOC-CPR-010: Is Labor checkbox stages then Search narrows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter — checkbox |

**Preconditions**: On the Search page with results loaded.
**Steps**: 1. Tick "Is Labor". 2. Observe the filter is staged (grid unchanged, no request fires). 3. Click Search → the grid narrows to labor rows. 4. Untick the checkbox and click Search → the list restores.
**Expected**: Is Labor stages while ticked, then applies on Search; the grid narrows to labor rows; unticking and clicking Search restores the list.
**Data**: `filter=Is Labor`
**Notes**: The narrowing happens on Search, not when the checkbox is ticked.
**Automatable**: Yes

---

## TC-LOC-CPR-011: Active Only default-checked; unchecking + Search reveals inactive rows
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter — checkbox |

**Preconditions**: Fresh page load (Active Only checked by default).
**Steps**: 1. Verify Active Only is checked. 2. Uncheck it. 3. Observe the change is staged (grid unchanged, no request fires). 4. Click Search → the grid now includes inactive pricebooks as well. 5. Re-check Active Only and click Search → back to active-only.
**Expected**: Active Only defaults to checked (the page loads showing active pricebooks only). Unchecking stages the change; clicking Search re-queries without the active-only restriction, so inactive pricebooks appear alongside active ones. Re-checking and clicking Search returns to active-only.
**Data**: `default=checked`
**Notes**: The grid's "Is Active" column and the "Active Only" filter both refer to the pricing strategy's active flag, not the pricebook record's status — do not conflate the two.
**Automatable**: Yes

---

## TC-LOC-CPR-012: Reset clears every filter input and restores the full list
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Reset |

**Preconditions**: At least one text filter typed, one dropdown selected, one checkbox toggled, and a Search performed (grid narrowed).
**Steps**: 1. With filters applied and the grid narrowed, click **Reset**. 2. Observe every input.
**Expected**: Reset clears the text inputs (Pricebook, Pricing Strategy → empty), resets the dropdowns to "All Locations"/"All Currencies", returns the checkboxes to their defaults (Is Internal and Is Labor unchecked, **Active Only re-checked**), AND restores the grid to the full original list — without sending another request to the server. A second Reset on the already-clean state has no effect.
**Data**: `resetCheckboxes=[false, false, true]` (Is Internal, Is Labor, Active Only) | `resetText=["",""]`
**Notes**: Reset clears all filter inputs and restores the original list immediately, without sending a new request to the server.
**Automatable**: Yes

---

## TC-LOC-CPR-013: No request fires while typing or selecting filters (staged until Search)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Network assertion |

**Preconditions**: On the Search page with results loaded; watching for the pricebook-list request.
**Steps**: 1. Record how many pricebook-list requests have been sent. 2. Type into the Pricebook filter. 3. Toggle the Is Internal checkbox. 4. Open the Currency dropdown and select a value. 5. Re-record the count.
**Expected**: **Zero** new pricebook-list requests fire during typing, toggling, or selecting — the filters are held until Search is clicked. (Entering filter values triggers no request on its own.)
**Data**: `expectedNewRequests=0`
**Notes**: Confirms that entering filter values sends no request until Search is clicked.
**Automatable**: Yes

---

## TC-LOC-CPR-014: Search submits the staged filters as a single server request
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Network assertion |

**Preconditions**: On the Search page; a filter staged (for example, Is Internal ticked); watching for the pricebook-list request.
**Steps**: 1. With Is Internal staged, click **Search**. 2. Capture the request that fires.
**Expected**: Exactly one new pricebook-list request fires, carrying the staged filter (the internal-only filter), and the grid re-renders from the server's response. This confirms that filtering happens on the server when Search is clicked, rather than instantly in the browser as values are entered.
**Data**: `expectedNewRequests=1` | `carriesFilter=Is Internal`
**Notes**: Confirms the filters are applied on the server only when Search is clicked.
**Automatable**: Yes

---

## TC-LOC-CPR-015: Clicking a Price Book name navigates to the Pricebook Details route
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

## TC-LOC-CPR-016: New Equipment Pricing option opens the equipment add page
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

## TC-LOC-CPR-017: New Labor Pricing option opens the labor add page
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

## TC-LOC-CPR-018: Action-bar buttons are present and the New control behaves as a button
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

## Helper → TC mapping (all 30 `TC-ENC-PRC-1445-*` verified/corrected/dropped per LR-040)

| Helper | Disposition | Mapped to |
|---|---|---|
| 001 component-load 1 call | CONFIRM (endpoint corrected to `/pricing/strategies`) | TC-LOC-CPR-001 |
| 002 8 columns + order | CORRECT (live 9, raise 8↔9) | TC-LOC-CPR-002 |
| 003 Active Only default | CONFIRM (checked) | TC-LOC-CPR-003 |
| 004 boolean render | CONFIRM (Unicode ✔) | TC-LOC-CPR-004 |
| 005 Pricebook narrows | CORRECT (stage→Search server-side) | TC-LOC-CPR-005 |
| 006 empty Pricebook restores | CONFIRM | TC-LOC-CPR-005 |
| 007 Pricebook >200 char BVA | **(b) DEFER** → FCC P2 | `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md` (Pricebook BVA) |
| 008 special chars literal | **(b) DEFER** → FCC P2 | `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md` (special chars) |
| 009 Price Strategy narrows | CORRECT (textbox, not dropdown) | TC-LOC-CPR-006 |
| 010 clear Price Strategy | CONFIRM | TC-LOC-CPR-006 |
| 011 Location narrows | CORRECT (stage→Search) | TC-LOC-CPR-008 |
| 012 default Location | CONFIRM | TC-LOC-CPR-003 / 008 |
| 013 Currency narrows | CORRECT (stage→Search) | TC-LOC-CPR-007 |
| 014 default Currency | CONFIRM | TC-LOC-CPR-003 / 007 |
| 015 Is Internal narrows | CORRECT (stage→Search) | TC-LOC-CPR-009 |
| 016 uncheck Is Internal | CONFIRM | TC-LOC-CPR-009 |
| 017 Is Labor narrows | CORRECT | TC-LOC-CPR-010 |
| 018 uncheck Is Labor | CONFIRM | TC-LOC-CPR-010 |
| 019 Active Only hides inactive | CONFIRM | TC-LOC-CPR-011 |
| 020 uncheck Active Only | CONFIRM | TC-LOC-CPR-011 |
| 021 Reset clears inputs | CONFIRM | TC-LOC-CPR-012 |
| 022 Reset restores list | CONFIRM | TC-LOC-CPR-012 |
| 023 Reset idempotent | CONFIRM | TC-LOC-CPR-012 |
| 024 no network on typing | CONFIRM | TC-LOC-CPR-013 |
| 025 no network on dropdowns | CONFIRM | TC-LOC-CPR-013 |
| 026 New equipment route-param | CONFIRM | TC-LOC-CPR-016 |
| 027 New labor route-param | CONFIRM | TC-LOC-CPR-017 |
| 028 Price Over-ride destination | **(c) DEFER** — DOCX "URL: TBD", destination unbuilt; presence covered | presence → TC-LOC-CPR-018; navigation → (c) documented |
| 029 New Pricing affordance | CONFIRM | TC-LOC-CPR-018 |
| 030 compound multi-filter | **(b) DEFER** → FCC P2 | `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md` (compound row) |

**Summary**: 27 helpers → 18 P1 cases (CONFIRM/CORRECT); 3 helpers (007/008/030) → (b) FCC P2; 1 (028 destination) → (c) DOCX-TBD. All `[ASSUMPTION]` flags resolved on live DOM.

---

## Deferred coverage (documented per LR-040)

- **(b) → `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md`** (exists in `plans/pending/`, seed list grep-verifiable): Pricebook BVA/overflow (helper 007), special-chars literal (helper 008), compound multi-filter (helper 030), per-option enumeration for Currency / Location / Pricing Strategy.
- **(c) documented**: "Pricing Override" / "Price Over-ride" navigation destination — DOCX line 22 "URL: TBD"; the destination page is not built. Presence + button affordance covered in TC-018; deep navigation is not automatable until the destination ships.
- **(c) documented**: Location each-option narrowing across 2652 options (LR-025) — representative dropdown-filter behavior proven by Currency (TC-007); exhaustive enumeration → FCC P2.
