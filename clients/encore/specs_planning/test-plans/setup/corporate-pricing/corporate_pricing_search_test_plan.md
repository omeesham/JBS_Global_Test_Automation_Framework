# Corporate Pricing - Search (NM-1445) Test Plan

**Module**: corporate-pricing (search)
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_search_test_cases.md
**Location Under Test**: 1604 (Parker Palm Springs)
**Updated**: 2026-06-24
**Implemented**: clients/encore/tests/corporate-pricing/corporate-pricing-search.spec.ts (P1 2026-06-05; FCC P2 2026-06-10)
**Field Inventory**: clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.md (P1) + corporate-pricing-search-2026-06-10.md (FCC param contract)
**FCC Catalog**: clients/encore/specs_planning/_internal/field-case-catalogs/corporate-pricing-search-fcc-2026-06-10.md
**Baseline**: baseline-absent (net-new on e2e; oracle = DOCX NM-1445)

> **Live model (D2)**: filters STAGE on input (no call, no grid change) and submit SERVER-SIDE on **Search** (`GET /navigator/api/location/pricing/strategies?<staged params>`); Reset restores defaults + full list client-side. Read-only screen — no save. Selectors are text/role/placeholder/grid-`<th>`/content-anchored (near-zero data-testid). React/Next.js (not Angular).

---

## Selector Mapping (alias → live selector)

| Alias | Element | Live selector | Stability |
|---|---|---|---|
| `hdgCorporatePricing` | h1 heading | `h1:text-is("Corporate Pricing")` | STABLE |
| `txtFilterPricebook` | Pricebook text filter | `input[placeholder="Enter name"]` | STABLE |
| `txtFilterStrategy` | Pricing Strategy text filter | `input[placeholder="Enter strategy"]` | STABLE |
| `drpFilterLocation` | Location combobox | `button[role="combobox"]:has-text("All Locations")` | label-anchored |
| `drpFilterCurrency` | Currency combobox | `button[role="combobox"]:has-text("All Currencies")` | label-anchored |
| `chkFilterIsInternal` | Is Internal checkbox | `div:has(> *:text-is("Is Internal")) [role="checkbox"]` | label-anchored |
| `chkFilterIsLabor` | Is Labor checkbox | `div:has(> *:text-is("Is Labor")) [role="checkbox"]` | label-anchored |
| `chkFilterActiveOnly` | Active Only checkbox | `div:has(> *:text-is("Active Only")) [role="checkbox"]` | label-anchored |
| `btnSearch` | Search button | `button:text-is("Search")` | STABLE |
| `btnReset` | Reset button | `button:text-is("Reset")` | STABLE |
| `btnNew` | New split-button | `button:text-is("New")` | STABLE |
| `mnuNewEquipmentPricing` | New menu → Equipment | `[role="menuitem"]:text-is("Equipment Pricing")` | STABLE |
| `mnuNewLaborPricing` | New menu → Labor | `[role="menuitem"]:text-is("Labor Pricing")` | STABLE |
| `gridResults` | results table | `table` | STABLE |
| `rowGridAny` | data rows | `tbody tr` | STABLE |
| `colHeaderAny` | column headers | `th` | STABLE |
| (column anchor) | per-column resize handle | `button[aria-label="Resize column <key>"]` | STABLE |
| (name cell) | Price Book name link | `tbody tr td button.cursor-pointer` (content-anchored) | content-anchored |
| (boolean cell) | true marker | `td span.text-primary` (text `✔`) / empty `td` = false | LR-036 |
| `lblItemsFound` | item count footer | `text=/\d[\d,]*\s+items found/` | content-anchored |
| (action bar) | action buttons | `button:text-is("Pricing Override"|"Loc Pricing Export"|"Loc Pricing Import"|"Export"|"Import"|"Grid Options")` | STABLE |
| (list endpoint) | server data call | request URL contains `/navigator/api/location/pricing/strategies` | LR-056 |

Page route: `gotoSearch(office)` → `{base}locations/{office}/settings/corporate-pricing`.

---

## Scenario: TC-CPR-SRC-001 — Component loads, list endpoint called once
1. Before navigation, attach `page.on('request')` counting URLs containing `/navigator/api/location/pricing/strategies`.
2. `gotoSearch('1604')` — wait for the grid (`lblItemsFound` visible / `rowGridAny` count > 0).
3. Assert: `hdgCorporatePricing` visible.
4. Assert: list-endpoint request count === 1.
5. Assert: `rowGridAny` count > 0 (grid populated).

## Scenario: TC-CPR-SRC-002 — 8 DOCX columns present, live renders 9
1. Read `colHeaderAny` (`th`) text into an array.
2. Assert: each of the 8 DOCX names present — "Price Book", "Price Book Strategy", "Price Year", "Is GSO", "Is Internal", "Is Labor", "Is Active" + (Productions Currency intent →) both "Is Productions" and "Currency".
3. Assert: header count === 9 (D1 — live split; divergence raised in encore-questions draft).

## Scenario: TC-CPR-SRC-003 — Filter baseline/default state
1. `gotoSearch('1604')` fresh.
2. Assert: `txtFilterPricebook` value === "" and `txtFilterStrategy` value === "".
3. Assert: `drpFilterLocation` text contains "All Locations"; `drpFilterCurrency` text contains "All Currencies".
4. Assert: `chkFilterIsInternal` aria-checked="false"; `chkFilterIsLabor` aria-checked="false".
5. Assert: `chkFilterActiveOnly` aria-checked="true" (default).
6. Assert: `lblItemsFound` text matches `/\d[\d,]*\s+items found/` (count not asserted — volatile).

## Scenario: TC-CPR-SRC-004 — Boolean columns render ✔ / empty
1. For the rendered rows, read each boolean column cell (`td` at the column index of Is GSO / Is Internal / Is Labor / Is Active / Is Productions).
2. Assert: at least one cell across the boolean columns has textContent === "✔".
3. Assert: every boolean cell textContent is either "✔" or "" (no other text). (LR-036 Unicode)

## Scenario: TC-CPR-SRC-005 — Pricebook text filter stage → Search narrows server-side
1. Record list-endpoint request count.
2. `txtFilterPricebook.pressSequentially("2021-PB6")`.
3. Assert: count unchanged (staged, no call); grid count unchanged from baseline.
4. Click `btnSearch`; wait for the list-endpoint response (count increments) AND `lblItemsFound` to settle.
5. Assert: a request fired whose URL contains `pricebookName=2021-PB6`.
6. Assert: the grid shows the "2021-PB6" row (content-anchored); item count text reflects the narrow (e.g. "1 items found").
7. Clear `txtFilterPricebook` (`fill('')`) + `btnSearch` → assert the list broadens again.

## Scenario: TC-CPR-SRC-006 — Pricing Strategy text filter (corrected to text input)
1. Assert: `txtFilterStrategy` is an `<input>` with placeholder "Enter strategy" (NOT a combobox).
2. `pressSequentially` a strategy substring; assert grid unchanged (staged).
3. Click `btnSearch`; wait for response; assert grid narrows to matching strategy rows.
4. Clear + `btnSearch` → list restores.

## Scenario: TC-CPR-SRC-007 — Currency dropdown options + select→Search
1. Click `drpFilterCurrency`; read `[role="option"]` texts.
2. Assert: options === ["All Currencies", "USD", "CAD", "MXN"].
3. Select "USD"; assert grid unchanged (staged) + no list call.
4. Click `btnSearch`; wait for response; assert a list call fired (currency reflected).
5. Re-select "All Currencies" + `btnSearch` → restores.

## Scenario: TC-CPR-SRC-008 — Location dropdown default + options present
1. Assert: `drpFilterLocation` text contains "All Locations".
2. Click it; assert `[role="option"]` count > 200 (LR-022 — exact 2652 not asserted); assert first option text contains "Clear selection".
3. Press Escape — popover closes.

## Scenario: TC-CPR-SRC-009 — Is Internal stage → Search narrows
1. Record list-endpoint count.
2. `chkFilterIsInternal.check()`; assert aria-checked="true"; assert count unchanged (staged) + grid unchanged.
3. Click `btnSearch`; wait for response; assert the request URL contains `isInternal=true`; assert the grid narrowed (row count decreased; e.g. "2023-Internal1" present).
4. `chkFilterIsInternal.uncheck()` + `btnSearch` → restores.

## Scenario: TC-CPR-SRC-010 — Is Labor stage → Search narrows
1. `chkFilterIsLabor.check()`; assert staged (no call, grid unchanged).
2. Click `btnSearch`; assert request URL contains `isLabor=true`; grid re-queried.
3. `chkFilterIsLabor.uncheck()` + `btnSearch` → restores.

## Scenario: TC-CPR-SRC-011 — Active Only default-checked; uncheck + Search reveals inactive
1. Assert: `chkFilterActiveOnly` aria-checked="true" on load.
2. `chkFilterActiveOnly.uncheck()`; assert staged.
3. Click `btnSearch`; assert request URL reflects active-only off (`isActive=false` or param dropped); grid count >= the active-only count (inactive rows now included).
4. `chkFilterActiveOnly.check()` + `btnSearch` → back to active-only.

## Scenario: TC-CPR-SRC-012 — Reset clears inputs + restores full list
1. Stage filters: `pressSequentially` Pricebook, `check()` Is Internal, then `btnSearch` (grid narrows).
2. Click `btnReset`.
3. Assert: `txtFilterPricebook` value === "" ; `txtFilterStrategy` value === "".
4. Assert: `chkFilterIsInternal` "false", `chkFilterIsLabor` "false", `chkFilterActiveOnly` "true".
5. Assert: `drpFilterLocation` "All Locations", `drpFilterCurrency` "All Currencies".
6. Assert: grid restored (row count back to the full-list level; item count matches the load-time pattern).

## Scenario: TC-CPR-SRC-013 — No network while staging (D2 client-side staging)
1. Record list-endpoint count.
2. `pressSequentially` Pricebook; `check()` Is Internal; open + select Currency.
3. Assert: list-endpoint count delta === 0 (no call during staging). (Filter `/navigator/api/` per LR-056.)

## Scenario: TC-CPR-SRC-014 — Search submits a server query (D2 server-side)
1. `check()` Is Internal (staged); record list-endpoint count.
2. Click `btnSearch`.
3. Assert: exactly one new list-endpoint request fired; its URL contains `isInternal=true`; the grid re-rendered.

## Scenario: TC-CPR-SRC-015 — Price Book name → Details navigation
1. Locate a Price Book name button (content-anchored, e.g. "2021-PB6") via `findGridRowByContent`.
2. Click it; wait for navigation.
3. Assert: `page.url()` matches `/corporate-pricing/details/[0-9a-f-]+`.
4. Assert: details h1 "Corporate Pricing Details" visible.

## Scenario: TC-CPR-SRC-016 — New → Equipment Pricing route-param
1. Click `btnNew` (Playwright `.click()` dispatches the pointer sequence → menu opens).
2. Click `mnuNewEquipmentPricing`.
3. Assert: `page.url()` contains `/corporate-pricing/add?type=equipment`.
4. Navigate back to Search for isolation.

## Scenario: TC-CPR-SRC-017 — New → Labor Pricing route-param
1. Click `btnNew`; click `mnuNewLaborPricing`.
2. Assert: `page.url()` contains `/corporate-pricing/add?type=labor`.
3. Navigate back to Search.

## Scenario: TC-CPR-SRC-018 — Action-bar presence + New affordance
1. Assert each action-bar button visible: New, Pricing Override, Loc Pricing Export, Loc Pricing Import, Export, Import, Grid Options.
2. Assert `btnNew` is enabled + opens its menu on click (then Escape).
3. (Pricing Override navigation destination deferred — DOCX "URL: TBD".)

---

## FCC P2 Scenarios (TC-CPR-SRC-019..030) — live-grounded 2026-06-10

> Query-param contract (verified): `pricebookName` / `pricingStrategyName` / `currencyId` (USD=1,CAD=2,MXN=3) / `locationNo` / `isInternal` / `isLabor` / `isActive` (omitted when Active Only unchecked). Read-only → Search-cycle (stage→Search→server→restore). New page-object helpers: `probePricebookBoundary(value)` (focus→setReactInput→read aria-invalid→Tab→read escaped/pageError, §2.1), `selectFirstRealLocation()` (LR-025 retry), `selectCurrency(value)` (exists).

## Scenario: TC-CPR-SRC-019 — Pricebook no-match → 0 results
1. `fillPricebookFilter('ZZZ-NOPE-NOMATCH-9999')`; `searchAndWaitForList()` → assert URL contains `pricebookName=ZZZ-NOPE-NOMATCH-9999`.
2. `expect.poll(getItemCountNumber)` → 0.

## Scenario: TC-CPR-SRC-020 — Pricebook overflow (250 chars), no maxlength, 0 results (§2.1)
1. `const probe = await probePricebookBoundary('A'.repeat(250))` → assert `probe.stagedLen === 250` (no truncation), `probe.escaped === true`, `probe.ariaInvalid === null`, `probe.pageError === 0`.
2. `searchAndWaitForList()` → `expect.poll(getItemCountNumber)` → 0.

## Scenario: TC-CPR-SRC-021 — Pricebook special chars literal + URL-encoded + no crash + escapable (§2.1)
1. `const probe = await probePricebookBoundary("%_'\"<>&#")` → assert `probe.staged === "%_'\"<>&#"`, `probe.ariaInvalid === null`, `probe.escaped === true`, `probe.pageError === 0`.
2. `const url = await searchAndWaitForList()` → assert url contains `pricebookName=%25_%27%22%3C%3E%26%23`; `expect.poll(getItemCountNumber)` → 0.

## Scenario: TC-CPR-SRC-022 — Pricebook whitespace-only → full list
1. `const probe = await probePricebookBoundary('   ')` → assert `probe.escaped === true`, `probe.pageError === 0`.
2. `searchAndWaitForList()` → assert item-count text matches the `N items found` pattern (full list; count NOT zero — `expect.poll(getItemCountNumber).toBeGreaterThan(1)`).

## Scenario: TC-CPR-SRC-023 — Pricing Strategy no-match (pricingStrategyName) → 0
1. `fillStrategyFilter('ZZZ-NOPE-STRAT')`; `const url = await searchAndWaitForList()` → assert url contains `pricingStrategyName=ZZZ-NOPE-STRAT`.
2. `expect.poll(getItemCountNumber)` → 0.

## Scenario: TC-CPR-SRC-024 — Currency each-option carries currencyId
1. For `[['USD',1],['CAD',2],['MXN',3]]`: `selectCurrency(name)`; `const url = await searchAndWaitForList()`; assert url contains `currencyId=${id}`; `clickReset()`. (Counts volatile — not asserted; CAD may be 0.)

## Scenario: TC-CPR-SRC-025 — Location representative each-option carries locationNo (LR-025)
1. `const picked = await selectFirstRealLocation()` (opens combobox, clicks option[1] with retry, returns its label).
2. Parse the office number from `picked` (leading digits).
3. `const url = await searchAndWaitForList()` → assert url contains `locationNo=${officeNo}`; `expect.poll(getItemCountNumber).toBeLessThanOrEqual(baseline)`.

## Scenario: TC-CPR-SRC-026 — Is Internal toggle+revert restores baseline
1. `const base = await getItemCountNumber()`; `setCheckbox('isInternal', true)`; `const url = await searchAndWaitForList()` → assert `isInternal=true`.
2. `setCheckbox('isInternal', false)`; `clickSearch()`; `expect.poll(getItemCountNumber)` → `base`.

## Scenario: TC-CPR-SRC-027 — Is Labor toggle+revert restores baseline (labor = different set)
1. `const base = await getItemCountNumber()`; `setCheckbox('isLabor', true)`; `const url = await searchAndWaitForList()` → assert `isLabor=true`.
2. `setCheckbox('isLabor', false)`; `clickSearch()`; `expect.poll(getItemCountNumber)` → `base`. (Do NOT assert on→narrow; labor set may be larger.)

## Scenario: TC-CPR-SRC-028 — Active Only uncheck omits isActive + reveals inactive; re-check restores
1. `const base = await getItemCountNumber()`; `setCheckbox('activeOnly', false)`; `const url = await searchAndWaitForList()` → assert url does NOT contain `isActive`.
2. `expect.poll(getItemCountNumber).toBeGreaterThanOrEqual(base)` (inactive revealed).
3. `setCheckbox('activeOnly', true)`; `clickSearch()`; `expect.poll(getItemCountNumber)` → `base`.

## Scenario: TC-CPR-SRC-029 — Reset idempotency, no server call
1. `const counter = attachListCallCounter()`; stage Pricebook + Is Internal; `searchAndWaitForList()` (calls=1).
2. `clickReset()`; assert `counter.count()` unchanged; `getItemCountNumber()` back to full.
3. `clickReset()` again; assert `counter.count()` STILL unchanged (double-reset no-op); assert `getPricebookFilterValue()===''` and `getCheckboxState('isInternal')===false`. `counter.dispose()`.

## Scenario: TC-CPR-SRC-030 — Compound multi-filter, single query, all params
1. Fresh `open('1604')`; `const counter = attachListCallCounter()`.
2. `fillPricebookFilter('2')`; `selectCurrency('USD')`; `setCheckbox('isInternal', true)`; assert `counter.count()===0` (staged, no call).
3. `const url = await searchAndWaitForList()`; assert `counter.count()===1`; assert url contains `pricebookName=2` AND `currencyId=1` AND `isInternal=true`; `expect.poll(getItemCountNumber).toBeGreaterThan(0)`. `counter.dispose()`.

---

## Grid Options Scenarios (TC-CPR-SRC-031..033)

## Scenario: TC-CPR-SRC-031 — Grid Options menu opens with 9 column toggles and Reset to Default View
1. `gotoSearch('1604')` — wait for grid.
2. Click `button[aria-label="Grid Options"]`.
3. Assert: a menu/panel appears containing a "Reset to Default View" item.
4. Assert: exactly 9 column-toggle items are present, one for each: Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency.

## Scenario: TC-CPR-SRC-032 — Toggle OFF a column, reload, confirm column still hidden (persisted)
1. `gotoSearch('1604')`.
2. Open Grid Options; click the "Is GSO" toggle to turn it off. Close menu.
3. Assert: `th:text("Is GSO")` is not visible in the grid (column hidden).
4. `page.reload()` — wait for grid.
5. Assert: `th:text("Is GSO")` is still not visible (persistence confirmed).

## Scenario: TC-CPR-SRC-033 — Reset to Default View restores all 9 columns; reload confirms persistence
1. Precondition: "Is GSO" hidden (from SRC-032, or set up inline).
2. Open Grid Options; click "Reset to Default View". Close menu.
3. Assert: all 9 `th` column headers are visible.
4. `page.reload()` — wait for grid.
5. Assert: all 9 column headers are still visible (reset-to-default persists).

---

## Filter → Grid Content Validation Scenarios (TC-CPR-SRC-034..040)

## Scenario: TC-CPR-SRC-034 — Currency filter = USD → every visible row Currency = USD
1. `gotoSearch('1604')`.
2. `selectCurrency('USD')`; `btnSearch`; wait for list response.
3. Read every `td` in the Currency column.
4. Assert: every cell value === "USD".

## Scenario: TC-CPR-SRC-035 — Is Internal ON → every visible row Is Internal = ✔
1. `gotoSearch('1604')`.
2. `setCheckbox('isInternal', true)`; `btnSearch`; wait for response.
3. Read every `td` in the Is Internal column.
4. Assert: every cell `textContent` === "✔" (LR-036 Unicode).

## Scenario: TC-CPR-SRC-036 — Is Labor ON → returned set is labor pricebooks (different set, count may be larger)
1. `const base = await getItemCountNumber()`.
2. `setCheckbox('isLabor', true)`; `btnSearch`; wait for response.
3. Read every `td` in the Is Labor column; assert every cell === "✔".
4. Note new item count — do NOT assert it is less than `base` (labor set may be larger).

## Scenario: TC-CPR-SRC-037 — Active Only OFF reveals inactive rows; ON restricts to active rows
1. `gotoSearch('1604')` (Active Only checked by default).
2. `setCheckbox('activeOnly', false)`; `btnSearch`; wait for response.
3. Assert: at least one `td` in Is Active column is empty (inactive row present).
4. `setCheckbox('activeOnly', true)`; `btnSearch`; wait for response.
5. Read every `td` in Is Active column; assert every cell === "✔".

## Scenario: TC-CPR-SRC-038 — Location filter narrows rows to selected location
1. `gotoSearch('1604')`.
2. `const base = await getItemCountNumber()`.
3. `selectFirstRealLocation()` — capture office number from the picked option label.
4. `btnSearch`; wait for response.
5. Assert: `expect.poll(getItemCountNumber).toBeLessThanOrEqual(base)`.
6. Spot-check visible rows to confirm they belong to the selected location.

## Scenario: TC-CPR-SRC-039 — Pricing Strategy text filter narrows to matching strategy rows (contains-match)
1. `gotoSearch('1604')`.
2. Read a sample strategy name from a visible row's Price Book Strategy cell.
3. Enter a substring of that strategy name into `txtFilterStrategy`.
4. `btnSearch`; wait for response.
5. Read the Price Book Strategy column for all visible rows.
6. Assert: every row's strategy value contains the entered substring.

## Scenario: TC-CPR-SRC-040 — Pricebook filter: partial name → contains-match; ID-exact → exact match
1. `gotoSearch('1604')`.
2. `fillPricebookFilter('2021')` (partial); `btnSearch`; wait for response.
3. Read Price Book column for all visible rows; assert every name contains "2021".
4. `clickReset()`.
5. `fillPricebookFilter('2021-PB6')` (exact ID); `btnSearch`; wait for response.
6. Read Price Book column; assert the returned row name === "2021-PB6".

---

## Compound, Order-Independence, and Reset Scenarios (TC-CPR-SRC-041..043)

## Scenario: TC-CPR-SRC-041 — Compound multi-filter: every visible row satisfies ALL active criteria
1. `gotoSearch('1604')`.
2. `setCheckbox('isLabor', true)`; `selectCurrency('USD')`; `setCheckbox('activeOnly', true)`.
3. `btnSearch`; wait for response.
4. For first 5 visible rows (or all if fewer): read Is Labor, Currency, Is Active cells.
5. Assert: Is Labor === "✔" AND Currency === "USD" AND Is Active === "✔" for every sampled row.

## Scenario: TC-CPR-SRC-042 — Filter order-independence: A→B→C same result as C→B→A
1. `gotoSearch('1604')`.
2. **Run 1**: set Currency=USD → Is Internal=checked → Active Only=checked. `btnSearch`. Record `count1` and first 5 row names as `rows1`.
3. `clickReset()`.
4. **Run 2**: set Active Only=checked → Is Internal=checked → Currency=USD. `btnSearch`. Record `count2` and first 5 row names as `rows2`.
5. Assert: `count1 === count2`; `rows1` and `rows2` contain the same names.

## Scenario: TC-CPR-SRC-043 — Reset from compound restores unfiltered baseline; Grid Options column visibility unaffected
1. `gotoSearch('1604')`.
2. `const baseline = await getItemCountNumber()`.
3. Hide "Is GSO" column via Grid Options (optional setup for column-visibility assertion).
4. `fillPricebookFilter('2')`; `selectCurrency('USD')`; `setCheckbox('isInternal', true)`. `btnSearch` — assert grid narrowed.
5. `clickReset()`.
6. Assert: all filter inputs at default values (Pricebook empty, Currency "All Currencies", Is Internal unchecked, Active Only checked).
7. Assert: `expect.poll(getItemCountNumber)` === `baseline`.
8. Assert: "Is GSO" column still hidden (if hidden in step 3) — Reset did not restore it.

---

## Surface-Behavior Scenarios (TC-CPR-SRC-044..056)

> SBC scenarios. Each carries the Surface_Family marker from the test-cases file. QUICK = targeted happy-path; DEEP = exhaustive edge-state coverage.

## Scenario: TC-CPR-SRC-044 — Result fidelity QUICK: one filter returns matching rows only
1. `gotoSearch('1604')`.
2. `selectCurrency('USD')`; `btnSearch`; wait for response.
3. Read Currency column for all visible rows.
4. Assert: every cell === "USD".

## Scenario: TC-CPR-SRC-045 — Result fidelity DEEP: every filter type + compound; server-side submission; ID-exact vs name-contains
1. For each filter type, apply singly, click Search, assert column values match (ref SRC-034..040 oracles).
2. After each single-filter test, reset to confirm no residue.
3. Assert: typing/selecting a filter fires no server request (ref SRC-013).
4. Assert: Search fires exactly one server request with all staged params (ref SRC-014).
5. Apply a 3-filter compound (Currency=USD, Is Internal=true, Active Only=true); assert every visible row satisfies all 3.
6. Apply Pricebook ID-exact ("2021-PB6"); assert single-row exact return. Apply partial prefix ("2021"); assert every row contains "2021".
7. Verify: no cross-criteria row in any result; if one appears, flag as RCA-required defect — NEVER blind-file.

## Scenario: TC-CPR-SRC-046 — Pagination QUICK: page-size change no error; next navigates
1. `gotoSearch('1604')`.
2. Open page-size combobox; select "10"; wait for re-render.
3. Assert: grid `tbody tr` count <= 10; no console errors.
4. Click "Go to next page"; wait for re-render.
5. Assert: grid updated (first row differs from page 1 first row).

## Scenario: TC-CPR-SRC-047 — Pagination DEEP: all 5 page sizes; partial last page; nav button states; no duplicates/skips
1. `gotoSearch('1604')`.
2. For each size in [10, 20, 30, 40, 50]: set combobox, wait for render, assert `tbody tr` count <= size.
3. Navigate to page 1: assert `aria-disabled="true"` (or `disabled` attr) on "Go to first page" and "Go to previous page".
4. Click "Go to last page"; assert `aria-disabled="true"` on "Go to next page" and "Go to last page"; assert last page may have fewer rows than page size.
5. With page size 10: navigate all pages, collect first Price Book name cell from each; assert no name repeated; assert item count stays constant throughout.

## Scenario: TC-CPR-SRC-048 — Sorting DEEP/FLAG: header buttons present; expected asc/desc behavior documented; live probe 2026-06-24 showed sort non-functional
1. `gotoSearch('1604')`.
2. Assert: each of 9 column-header `<th>` elements contains a `<button>` (or is itself a `button` role).
3. Read the first row Price Year value; record `aria-sort` on "Price Year" header (expect null).
4. Click "Price Year" header; wait; re-read `aria-sort` and first row value.
5. Assert what actually occurred — if `aria-sort` changed to "ascending" and first row changed: sort IS functional. If unchanged: record as FLAG (non-functional sort, probe-confirmed 2026-06-24).
6. **BUILDER NOTE**: Assertions in step 5 should adapt to observed live behavior at implementation time. Do NOT assert sort works if the live probe result is confirmed. Do NOT blind-file a bug — RCA first.

## Scenario: TC-CPR-SRC-049 — Combination QUICK: filter + paginate return a coherent set
1. `gotoSearch('1604')`.
2. `selectCurrency('USD')`; `btnSearch`; wait for response.
3. Open page-size combobox; select "10"; wait.
4. If "Go to next page" is enabled: click it; wait.
5. Read Currency column for all visible rows on the current page.
6. Assert: every cell === "USD" (filter is maintained across pages).

## Scenario: TC-CPR-SRC-050 — Combination DEEP: multi-filter AND decision table; Reset clears ALL; order-independent
1. `gotoSearch('1604')`.
2. Apply 3 filters (Currency=USD, Is Internal=true, Active Only=true); `btnSearch`; assert every visible row satisfies all 3 (AND semantics).
3. `clickReset()`; assert all inputs at default; assert item count == unfiltered baseline.
4. Apply same 3 filters in reverse; `btnSearch`; compare count and first N rows to step 2 result.
5. Add Is Labor=true (4 filters); `btnSearch`; assert every visible row satisfies all 4 criteria.
6. `clickReset()`; assert no filter residue.

## Scenario: TC-CPR-SRC-051 — Render state QUICK: one pricebook link navigates to Details; one boolean column reads ✔
1. `gotoSearch('1604')`.
2. Find first Price Book name button; assert it has `cursor-pointer` class or link-style.
3. Click it; wait for navigation.
4. Assert: `page.url()` matches `/corporate-pricing/details/[0-9a-f-]+`.
5. Navigate back; read Is Active column first cell; assert value is "✔" or "" (LR-036).

## Scenario: TC-CPR-SRC-052 — Render state DEEP: all sampled link-cells navigate; all 5 boolean columns ✔/empty; Currency badge valid
1. `gotoSearch('1604')`.
2. Collect first 5 Price Book name cells; for each: assert is a `button.cursor-pointer`; click; assert navigation to `/corporate-pricing/details/<guid>`; navigate back.
3. For each boolean column in [Is GSO, Is Internal, Is Labor, Is Active, Is Productions]: read all visible cells; assert every value is "✔" or "" (LR-036 — no other text).
4. Read Currency column for all visible rows; assert each value is in ["USD", "CAD", "MXN"].
5. If any Price Book name cell is NOT a link: flag as RCA-required — NEVER blind-file.

## Scenario: TC-CPR-SRC-053 — Empty/volume QUICK: no-match filter → "No results." + "0 items found" + zero rows
1. `gotoSearch('1604')`.
2. `fillPricebookFilter('ZZZ-NOPE-NOMATCH-9999')`; `btnSearch`; wait for response.
3. Assert: `text("0 items found")` visible.
4. Assert: `text("No results.")` (verbatim with period) visible.
5. Assert: `tbody tr` count === 0.
6. Assert: no JavaScript exception on the page.

## Scenario: TC-CPR-SRC-054 — Empty/volume DEEP: 0/1/N row states; virtualized rows readable by content anchor; volume integrity pattern
1. **0-row**: `fillPricebookFilter('ZZZ-NOPE-NOMATCH-9999')`; `btnSearch`; assert 0 items found, "No results.", 0 `tbody tr`.
2. `clickReset()`.
3. **1-row**: `fillPricebookFilter('2021-PB6')`; `btnSearch`; assert `tbody tr` count === 1; assert item-count text contains "1".
4. `clickReset()`.
5. **N-row (virtualized)**: load unfiltered default. Assert `tbody tr` count approximately 50 (virtual window). Scroll down; assert new rows rendered (virtualization working). Use `findGridRowByContent(someNameFromLateInTheList)` to locate a row not in the initial viewport — assert it is findable.
6. Assert: `lblItemsFound` text matches `/\d[\d,]*\s+items found/` throughout — NEVER assert a specific number (LR-022/LR-053).

## Scenario: TC-CPR-SRC-055 — Persistence QUICK: page-size change survives a reload
1. `gotoSearch('1604')`.
2. Open page-size combobox; select "10"; wait for render.
3. `page.reload()`; wait for grid.
4. Assert: page-size combobox value === "10" (not reverted to 50).
5. Assert: `tbody tr` count <= 10.

## Scenario: TC-CPR-SRC-056 — Persistence DEEP: page-size + filter + column-visibility survive reload + browser-back; nav-away with staged filter is prompt-or-silent
1. `gotoSearch('1604')`.
2. **Page-size**: set to 20; reload; assert still 20.
3. **Active filter**: apply Currency=USD; `btnSearch`; reload; assert Currency filter state is USD or clearly reset (observe and record — either is acceptable; flag inconsistency).
4. **Column visibility**: hide "Is GSO" via Grid Options; reload; assert "Is GSO" still hidden (ref SRC-032).
5. **Browser-back**: navigate to a Details page via a pricebook link; press browser back; assert page size and column visibility are intact.
6. **Staged-filter nav-away**: type a Pricebook value WITHOUT clicking Search; click a pricebook link (navigate away); assert either: (a) a confirmation/discard dialog appears, OR (b) navigation proceeds silently and the staged value is discarded. Record which behavior occurs — both are acceptable; flag if behavior is inconsistent or confusing.

---

## Notes for BUILDER
- Per-test nav guard in `beforeEach`: `gotoSearch('1604')` + wait for grid (mirrors local-office-settings.spec.ts:33 pattern). Search is read-only so no `ensureDefaultState`; resetting filter state per-test via fresh nav is sufficient.
- **Network listener filters on `/navigator/api/`** — never the page URL (LR-056/ALL-086). Attach BEFORE the action being measured.
- Checkboxes: `.check()/.uncheck()` (Radix `role=checkbox`; ALL-089 — bare click can focus-without-toggle).
- Text filters: `pressSequentially` (not `fill`) for staging fidelity; `fill('')` to clear.
- After Search, wait for the list-endpoint **response** (or the item-count to change), NOT a fixed timeout (LR-052).
- No hardcoded 591/structural counts (LR-022) — content-anchored row lookup (`findGridRowByContent`), assert narrowed < baseline or content presence.
- Route-param tests navigate away → re-`gotoSearch` after (handled by `beforeEach`).

## Coverage Index (regenerated 2026-06-24 from the test-cases file)

Authoritative current case list (56 cases). Scenario prose above may lag; this index is mechanically regenerated.

- TC-CPR-SRC-001 — Page loads and requests the pricebook list exactly once
- TC-CPR-SRC-002 — Results grid shows the expected pricebook columns
- TC-CPR-SRC-003 — Search filter baseline / default state
- TC-CPR-SRC-004 — Boolean columns render a visible indicator for true and empty for false
- TC-CPR-SRC-005 — Pricebook text filter stages on type, then Search narrows the grid server-side
- TC-CPR-SRC-006 — Pricing Strategy text filter stages, then Search applies it
- TC-CPR-SRC-007 — Currency dropdown options + select-then-Search narrows
- TC-CPR-SRC-008 — Location dropdown default + searchable options present
- TC-CPR-SRC-009 — Is Internal checkbox stages then Search narrows to internal pricebooks
- TC-CPR-SRC-010 — Is Labor checkbox stages then Search narrows
- TC-CPR-SRC-011 — Active Only default-checked; unchecking + Search reveals inactive rows
- TC-CPR-SRC-012 — Reset clears every filter input and restores the full list
- TC-CPR-SRC-013 — No request fires while typing or selecting filters (staged until Search)
- TC-CPR-SRC-014 — Search submits the staged filters as a single server request
- TC-CPR-SRC-015 — Clicking a Price Book name navigates to the Pricebook Details route
- TC-CPR-SRC-016 — New Equipment Pricing option opens the equipment add page
- TC-CPR-SRC-017 — New Labor Pricing option opens the labor add page
- TC-CPR-SRC-018 — Action-bar buttons are present and the New control behaves as a button
- TC-CPR-SRC-019 — Pricebook no-match input returns zero results
- TC-CPR-SRC-020 — Pricebook accepts an over-long (250-character) value with no truncation; server returns zero, no crash
- TC-CPR-SRC-021 — Pricebook accepts special characters literally, searches them safely, and does not crash
- TC-CPR-SRC-022 — Pricebook whitespace-only input returns the full list (server ignores whitespace)
- TC-CPR-SRC-023 — Pricing Strategy no-match filter returns zero results
- TC-CPR-SRC-024 — Currency each-option (USD/CAD/MXN) submits the matching currency
- TC-CPR-SRC-025 — Location filter narrows the grid by the chosen office (representative)
- TC-CPR-SRC-026 — Is Internal toggle and revert restores the baseline
- TC-CPR-SRC-027 — Is Labor toggle and revert restores the baseline (labor is a different set, not a narrow)
- TC-CPR-SRC-028 — Active Only toggle and revert (unchecking reveals inactive rows; re-checking restores)
- TC-CPR-SRC-029 — Reset is idempotent and fires no server request
- TC-CPR-SRC-030 — Combined multi-filter submits a single server query carrying every staged filter
- TC-CPR-SRC-031 — Grid Options menu opens and exposes column toggles and Reset to Default View
- TC-CPR-SRC-032 — Toggling a column off hides it from the grid and the setting persists across a reload
- TC-CPR-SRC-033 — Reset to Default View restores all 9 columns and the setting persists across a reload
- TC-CPR-SRC-034 — Currency filter = USD causes every visible row to show USD in the Currency column
- TC-CPR-SRC-035 — Is Internal filter ON causes every visible row to have the Is Internal column marked true
- TC-CPR-SRC-036 — Is Labor filter ON returns the labor pricebook population (a different set, not just a narrowing)
- TC-CPR-SRC-037 — Active Only OFF reveals inactive rows; Active Only ON restricts to active rows
- TC-CPR-SRC-038 — Location filter narrows the grid to rows belonging to the selected location
- TC-CPR-SRC-039 — Pricing Strategy text filter narrows the grid to rows matching the entered strategy name
- TC-CPR-SRC-040 — Pricebook text filter narrows the grid: name filter uses contains-match; ID-style entry uses exact match
- TC-CPR-SRC-041 — Multi-filter compound search — every visible row satisfies ALL active criteria simultaneously
- TC-CPR-SRC-042 — Filter order-independence — applying filters A→B→C yields the same result count and rows as C→B→A
- TC-CPR-SRC-043 — Reset from a compound-filter state restores the unfiltered baseline count; Grid Options column visibility is unaffected
- TC-CPR-SRC-044 — Result fidelity — a single filter returns rows that actually match the query (QUICK)
- TC-CPR-SRC-045 — Result fidelity — every filter type and compound combinations return matching rows; server-side submission confirmed; ID-exact vs name-contains semantics verified (DEEP)
- TC-CPR-SRC-046 — Pagination — page-size change re-renders with no console error; next-page navigation works (QUICK)
- TC-CPR-SRC-047 — Pagination — all five page sizes render correctly; partial last page; first/prev disabled on page 1; next/last disabled on last page; no duplicate or skipped rows across pages (DEEP)
- TC-CPR-SRC-048 — Sorting — column headers are buttons; expected sort behavior is asc/desc toggle per click; live probe 2026-06-24 showed sort may be non-functional (DEEP/FLAG)
- TC-CPR-SRC-049 — Combination — filter + paginate together return a coherent set (QUICK)
- TC-CPR-SRC-050 — Combination — multi-filter AND decision table; Reset clears ALL filters; order-independent (DEEP)
- TC-CPR-SRC-051 — Render state — a pricebook link-cell navigates to Details; one boolean column reads per Unicode ✔ format (QUICK)
- TC-CPR-SRC-052 — Render state — every pricebook link-cell navigates correctly; all 5 boolean columns use Unicode ✔ format; Currency badge shows valid values (DEEP)
- TC-CPR-SRC-053 — Empty/volume — no-match filter shows "No results." message, "0 items found", and zero rows (QUICK)
- TC-CPR-SRC-054 — Empty/volume — 0-row, 1-row, and N-row result states; virtualized rows readable by content anchor; volume integrity content-anchored (DEEP)
- TC-CPR-SRC-055 — Persistence — a page-size change or an active filter survives a reload (QUICK)
- TC-CPR-SRC-056 — Persistence — sort preference, page-size, active filter, and Grid Options column visibility all survive reload and browser-back; nav-away with staged filters is either prompt-guarded or silent (DEEP)
