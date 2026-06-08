# Corporate Pricing - Search (NM-1445) Test Plan

**Module**: corporate-pricing (search)
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_search_test_cases.md
**Location Under Test**: 1604 (Parker Palm Springs)
**Implemented**: clients/encore/specs/corporate-pricing/corporate-pricing-search.spec.ts (2026-06-05)
**Field Inventory**: clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.md
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

## Scenario: TC-LOC-CPR-001 — Component loads, list endpoint called once
1. Before navigation, attach `page.on('request')` counting URLs containing `/navigator/api/location/pricing/strategies`.
2. `gotoSearch('1604')` — wait for the grid (`lblItemsFound` visible / `rowGridAny` count > 0).
3. Assert: `hdgCorporatePricing` visible.
4. Assert: list-endpoint request count === 1.
5. Assert: `rowGridAny` count > 0 (grid populated).

## Scenario: TC-LOC-CPR-002 — 8 DOCX columns present, live renders 9
1. Read `colHeaderAny` (`th`) text into an array.
2. Assert: each of the 8 DOCX names present — "Price Book", "Price Book Strategy", "Price Year", "Is GSO", "Is Internal", "Is Labor", "Is Active" + (Productions Currency intent →) both "Is Productions" and "Currency".
3. Assert: header count === 9 (D1 — live split; divergence raised in encore-questions draft).

## Scenario: TC-LOC-CPR-003 — Filter baseline/default state
1. `gotoSearch('1604')` fresh.
2. Assert: `txtFilterPricebook` value === "" and `txtFilterStrategy` value === "".
3. Assert: `drpFilterLocation` text contains "All Locations"; `drpFilterCurrency` text contains "All Currencies".
4. Assert: `chkFilterIsInternal` aria-checked="false"; `chkFilterIsLabor` aria-checked="false".
5. Assert: `chkFilterActiveOnly` aria-checked="true" (default).
6. Assert: `lblItemsFound` text matches `/\d[\d,]*\s+items found/` (count not asserted — volatile).

## Scenario: TC-LOC-CPR-004 — Boolean columns render ✔ / empty
1. For the rendered rows, read each boolean column cell (`td` at the column index of Is GSO / Is Internal / Is Labor / Is Active / Is Productions).
2. Assert: at least one cell across the boolean columns has textContent === "✔".
3. Assert: every boolean cell textContent is either "✔" or "" (no other text). (LR-036 Unicode)

## Scenario: TC-LOC-CPR-005 — Pricebook text filter stage → Search narrows server-side
1. Record list-endpoint request count.
2. `txtFilterPricebook.pressSequentially("2021-PB6")`.
3. Assert: count unchanged (staged, no call); grid count unchanged from baseline.
4. Click `btnSearch`; wait for the list-endpoint response (count increments) AND `lblItemsFound` to settle.
5. Assert: a request fired whose URL contains `pricebookName=2021-PB6`.
6. Assert: the grid shows the "2021-PB6" row (content-anchored); item count text reflects the narrow (e.g. "1 items found").
7. Clear `txtFilterPricebook` (`fill('')`) + `btnSearch` → assert the list broadens again.

## Scenario: TC-LOC-CPR-006 — Pricing Strategy text filter (corrected to text input)
1. Assert: `txtFilterStrategy` is an `<input>` with placeholder "Enter strategy" (NOT a combobox).
2. `pressSequentially` a strategy substring; assert grid unchanged (staged).
3. Click `btnSearch`; wait for response; assert grid narrows to matching strategy rows.
4. Clear + `btnSearch` → list restores.

## Scenario: TC-LOC-CPR-007 — Currency dropdown options + select→Search
1. Click `drpFilterCurrency`; read `[role="option"]` texts.
2. Assert: options === ["All Currencies", "USD", "CAD", "MXN"].
3. Select "USD"; assert grid unchanged (staged) + no list call.
4. Click `btnSearch`; wait for response; assert a list call fired (currency reflected).
5. Re-select "All Currencies" + `btnSearch` → restores.

## Scenario: TC-LOC-CPR-008 — Location dropdown default + options present
1. Assert: `drpFilterLocation` text contains "All Locations".
2. Click it; assert `[role="option"]` count > 200 (LR-022 — exact 2652 not asserted); assert first option text contains "Clear selection".
3. Press Escape — popover closes.

## Scenario: TC-LOC-CPR-009 — Is Internal stage → Search narrows
1. Record list-endpoint count.
2. `chkFilterIsInternal.check()`; assert aria-checked="true"; assert count unchanged (staged) + grid unchanged.
3. Click `btnSearch`; wait for response; assert the request URL contains `isInternal=true`; assert the grid narrowed (row count decreased; e.g. "2023-Internal1" present).
4. `chkFilterIsInternal.uncheck()` + `btnSearch` → restores.

## Scenario: TC-LOC-CPR-010 — Is Labor stage → Search narrows
1. `chkFilterIsLabor.check()`; assert staged (no call, grid unchanged).
2. Click `btnSearch`; assert request URL contains `isLabor=true`; grid re-queried.
3. `chkFilterIsLabor.uncheck()` + `btnSearch` → restores.

## Scenario: TC-LOC-CPR-011 — Active Only default-checked; uncheck + Search reveals inactive
1. Assert: `chkFilterActiveOnly` aria-checked="true" on load.
2. `chkFilterActiveOnly.uncheck()`; assert staged.
3. Click `btnSearch`; assert request URL reflects active-only off (`isActive=false` or param dropped); grid count >= the active-only count (inactive rows now included).
4. `chkFilterActiveOnly.check()` + `btnSearch` → back to active-only.

## Scenario: TC-LOC-CPR-012 — Reset clears inputs + restores full list
1. Stage filters: `pressSequentially` Pricebook, `check()` Is Internal, then `btnSearch` (grid narrows).
2. Click `btnReset`.
3. Assert: `txtFilterPricebook` value === "" ; `txtFilterStrategy` value === "".
4. Assert: `chkFilterIsInternal` "false", `chkFilterIsLabor` "false", `chkFilterActiveOnly` "true".
5. Assert: `drpFilterLocation` "All Locations", `drpFilterCurrency` "All Currencies".
6. Assert: grid restored (row count back to the full-list level; item count matches the load-time pattern).

## Scenario: TC-LOC-CPR-013 — No network while staging (D2 client-side staging)
1. Record list-endpoint count.
2. `pressSequentially` Pricebook; `check()` Is Internal; open + select Currency.
3. Assert: list-endpoint count delta === 0 (no call during staging). (Filter `/navigator/api/` per LR-056.)

## Scenario: TC-LOC-CPR-014 — Search submits a server query (D2 server-side)
1. `check()` Is Internal (staged); record list-endpoint count.
2. Click `btnSearch`.
3. Assert: exactly one new list-endpoint request fired; its URL contains `isInternal=true`; the grid re-rendered.

## Scenario: TC-LOC-CPR-015 — Price Book name → Details navigation
1. Locate a Price Book name button (content-anchored, e.g. "2021-PB6") via `findGridRowByContent`.
2. Click it; wait for navigation.
3. Assert: `page.url()` matches `/corporate-pricing/details/[0-9a-f-]+`.
4. Assert: details h1 "Corporate Pricing Details" visible.

## Scenario: TC-LOC-CPR-016 — New → Equipment Pricing route-param
1. Click `btnNew` (Playwright `.click()` dispatches the pointer sequence → menu opens).
2. Click `mnuNewEquipmentPricing`.
3. Assert: `page.url()` contains `/corporate-pricing/add?type=equipment`.
4. Navigate back to Search for isolation.

## Scenario: TC-LOC-CPR-017 — New → Labor Pricing route-param
1. Click `btnNew`; click `mnuNewLaborPricing`.
2. Assert: `page.url()` contains `/corporate-pricing/add?type=labor`.
3. Navigate back to Search.

## Scenario: TC-LOC-CPR-018 — Action-bar presence + New affordance
1. Assert each action-bar button visible: New, Pricing Override, Loc Pricing Export, Loc Pricing Import, Export, Import, Grid Options.
2. Assert `btnNew` is enabled + opens its menu on click (then Escape).
3. (Pricing Override navigation destination deferred — DOCX "URL: TBD".)

---

## Notes for BUILDER
- Per-test nav guard in `beforeEach`: `gotoSearch('1604')` + wait for grid (mirrors local-office-settings.spec.ts:33 pattern). Search is read-only so no `ensureDefaultState`; resetting filter state per-test via fresh nav is sufficient.
- **Network listener filters on `/navigator/api/`** — never the page URL (LR-056/ALL-086). Attach BEFORE the action being measured.
- Checkboxes: `.check()/.uncheck()` (Radix `role=checkbox`; ALL-089 — bare click can focus-without-toggle).
- Text filters: `pressSequentially` (not `fill`) for staging fidelity; `fill('')` to clear.
- After Search, wait for the list-endpoint **response** (or the item-count to change), NOT a fixed timeout (LR-052).
- No hardcoded 591/structural counts (LR-022) — content-anchored row lookup (`findGridRowByContent`), assert narrowed < baseline or content presence.
- Route-param tests navigate away → re-`gotoSearch` after (handled by `beforeEach`).
