# SP1 MCP Discovery Findings — History Integration

**Status**: DELIVERABLE (findings artifact — lives with SP1 until SP1 moves to done/)
**Parent**: SUBPLAN_HISTORY_01_MCP_DISCOVERY.md
**Session**: 2026-04-13 14:42–15:04 UTC
**Agent**: OWNER (Copilot in Claude Code Mode)
**Location**: Office 1604 (Parker Palm Springs)

---

## 1. Location Management History (87 columns)

### Structure
[MCP-VERIFIED: 2026-04-13 14:43] **Column count: 87 CONFIRMED** — matches plan exactly.
[MCP-VERIFIED: 2026-04-13 14:43] **Table populated**: 20 rows per page, pagination "20 rows per page 1 / 147". Format = **page X / total PAGES** (confirmed: last page shows "147 / 147" with 2 rows → total items = (146×20)+2 = 2922 rows).
[MCP-VERIFIED: 2026-04-13 14:43] **All 87 columns in DOM** — NOT virtual scroll. Horizontal scroll: scrollWidth=16065 vs clientWidth=1141.
[MCP-VERIFIED: 2026-04-13 14:43] **14 of 87 headers are sortable** (have button elements): Live Date, Billing Way Active, Modified By, Modified On, Oracle Product Code, Oracle Department Code, Oracle Organization, Use eSignature, Separate Master Bill Commission Invoice, Enable Product Group, Enable Job Costing, Enable Discount Guidance, Internet Asset Reservation, Warehouse Billing.

### Actual Column Headers (L-to-R, 1-indexed)

| # | Actual Header |
|---|---|
| 1 | Local Office |
| 2 | Local Office Name |
| 3 | Active |
| 4 | Live Date |
| 5 | Country |
| 6 | Currency |
| 7 | Tax Mode |
| 8 | Region |
| 9 | Servicing Branch Office |
| 10 | Pay To Address |
| 11 | Union |
| 12 | Corporate Pricing |
| 13 | Billing Type |
| 14 | Billing Cycle |
| 15 | Billing Way |
| 16 | Billing Way Active |
| 17 | Labor Pricing |
| 18 | Equip. Pricing |
| 19 | Internal Equip. Pricing |
| 20 | Production Labor Pricing |
| 21 | Production Equip. Pricing |
| 22 | Allow DPCD |
| 23 | Exclude Implied Discount |
| 24 | Prompt For Approval |
| 25 | Threshold |
| 26 | Enable LDW |
| 27 | LDW Percentage |
| 28 | Calculate LDW on Net Amount |
| 29 | ETS |
| 30 | ETS Percent |
| 31 | Allow Service Charge |
| 32 | Show Service Charge As Administrative Fee |
| 33 | Calculate Service Charge On Net Amount |
| 34 | Service Charge Name |
| 35 | Apply Cables and Consumables Fee |
| 36 | C&C Percent |
| 37 | Calculate CAC on Net Amount |
| 38 | Terms and Conditions |
| 39 | Allow Ticker Calc |
| 40 | Set/Strike/Support Labor Billing Goal |
| 41 | Enable Set/Strike Labor Minutes |
| 42 | Apply Set/Strike Labor Minutes |
| 43 | Credit Memo Approval Required |
| 44 | Display Tax |
| 45 | Company Remit Tax / GST/HST / VAT Tax |
| 46 | Remit PST Tax |
| 47 | Comm Receiver |
| 48 | Enable IDC Billing |
| 49 | Skip Billing |
| 50 | Show SubRental |
| 51 | Inventory Only |
| 52 | Intercompany |
| 53 | Calculate Commission Tax |
| 54 | Can Create External Customer Link |
| 55 | Venue/Branch Account Name |
| 56 | Venue/Branch Account Phone1 |
| 57 | Venue/Branch Account Phone2 |
| 58 | Master Bill To Address Name |
| 59 | Action of Shared Setup Location |
| 60 | Shared Setup Location ID |
| 61 | Shared Setup Location Name |
| 62 | Include Service Charge in Price Guides |
| 63 | Pricing Strategy |
| 64 | Currency |
| 65 | Pricing Action |
| 66 | Is Alternate |
| 67 | Use Effective Dates |
| 68 | Start Date |
| 69 | End Date |
| 70 | Notes |
| 71 | Modified By |
| 72 | Modified On |
| 73 | Oracle Product Code |
| 74 | Oracle Department Code |
| 75 | Oracle Organization |
| 76 | Allow Resort Tax |
| 77 | Resort Tax Percentage |
| 78 | Discount Reason |
| 79 | Offsite Event Location |
| 80 | Use eSignature |
| 81 | Separate Master Bill Commission Invoice |
| 82 | Enable Product Group |
| 83 | Allow Production Quote |
| 84 | Enable Job Costing |
| 85 | Enable Discount Guidance |
| 86 | Internet Asset Reservation |
| 87 | Warehouse Billing |

### Data Formats (from latest row)

| Format | Representation | Example |
|---|---|---|
| Boolean TRUE | Unicode checkmark "✔" | Col 3 Active, Col 12 Corporate Pricing |
| Boolean FALSE | Empty cell "" | Col 11 Union (when unchecked) |
| Date | MM/DD/YYYY | "11/07/2005" (Col 4 Live Date) |
| Timestamp | MM/DD/YYYY HH:MM:SS AM/PM | "04/10/2026 03:42:00 PM" (Col 72 Modified On) |
| Percentage | N.NN % (space before %) | "4.00 %", "55.00 %", "0.00 %" |
| Empty/null | Empty string "" | No "null", "N/A", or "-" used |
| Number | Plain text | "0000", "900", "3" |
| Pricing | Multi-currency format | "USD: 2026-Zone 3 D; CAD: ; MXN:" |
| Email | Plain text | "v-rutvik.khosariya@psav.com" |

### Plan vs Actual Column Name Differences

| Plan Col# | Plan Name | Actual Name | Issue |
|---|---|---|---|
| 1 | Local Office ID | Local Office | Name mismatch |
| 7 | Tax Mode Name | Tax Mode | Name mismatch |
| 8 | Region Name | Region | Name mismatch |
| 26 | Apply LDW | Enable LDW | Name mismatch |
| 28 | Calculate LDW on Net Amount | Calculate LDW on Net Amount | ✅ MATCHES — plan said "BUG: renders i18n key" but actual renders correctly |
| 31 | Service Charge | Allow Service Charge | Name mismatch |
| 32 | Show SC As Admin Fee | Show Service Charge As Administrative Fee | Name mismatch |
| 33 | Calculate SC On Net Amount | Calculate Service Charge On Net Amount | Name mismatch |
| 35 | Apply C&C Fee | Apply Cables and Consumables Fee | Name mismatch |
| 36 | C&C Percentage | C&C Percent | Name mismatch |
| 41 | Set/Strike/Support Labor Billing Goal (DUPLICATE) | Enable Set/Strike Labor Minutes | **NOT a duplicate** — plan was wrong |
| 62 | Include SC in Price Guides | Include Service Charge in Price Guides | Name mismatch |
| 64 | Currency (DUPLICATE) | Currency | Confirmed duplicate column name ✅ |

**Plan Bug Correction**: Col 28 "Calculate LDW on Net Amount" renders correctly — NOT an i18n key leak. Col 41 is NOT a duplicate of Col 40 — it's "Enable Set/Strike Labor Minutes" (different from "Set/Strike/Support Labor Billing Goal").

### Save Dialog

[MCP-VERIFIED: 2026-04-13 15:02] Location Settings uses **"Save Changes" dialog with Cancel/Ok buttons** (NOT Cancel/Save like Local Office Settings).

---

## 2. Local Office Settings History (42 columns)

### Structure
[MCP-VERIFIED: 2026-04-13 14:46] **Column count: 42 CONFIRMED** — matches plan exactly.
[MCP-VERIFIED: 2026-04-13 14:46] **Table populated**: 20 rows per page, pagination "20 rows per page 1 / 61". NOT empty — **plan's Key Constraint was WRONG**. Format = **page X / total PAGES** (confirmed: last page shows "61 / 61" with 4 rows → total items = (60×20)+4 = 1204 rows).
[MCP-VERIFIED: 2026-04-13 15:00] **All 42 columns in DOM** — horizontal scroll: scrollWidth=9268 vs clientWidth=1816.
[MCP-VERIFIED: 2026-04-13 15:00] **38 of 42 headers are sortable** — Local Office, Section Name, Service Type - Exempt, and Notes are NOT sortable.

### Actual Column Headers (L-to-R, 1-indexed)

| # | Actual Header |
|---|---|
| 1 | Local Office |
| 2 | Prep Date Offset |
| 3 | Return Date Offset |
| 4 | Set Date Offset |
| 5 | Strike Date Offset |
| 6 | Pickup Date Offset |
| 7 | Delivery Date Offset |
| 8 | Use Fulfillment |
| 9 | Use Availability |
| 10 | Use Equipment QC |
| 11 | Print Desc |
| 12 | Use Subrent |
| 13 | Phone1 |
| 14 | Phone2 |
| 15 | Use Sect. |
| 16 | Section Name |
| 17 | Sect. Action |
| 18 | Logo Name |
| 19 | Use On Quote |
| 20 | Use On Rental |
| 21 | Service Type - Exempt |
| 22 | ST Action |
| 23 | Action |
| 24 | Notes |
| 25 | Marriott PMS Account Enabled |
| 26 | Default Job to 1 day for Event Orders |
| 27 | Default Job to 1 day for Outside Orders |
| 28 | Default Job to 1 day for Internal Orders |
| 29 | Default Labor to Hourly |
| 30 | Allow tentative and confirmed Status to have the same priority |
| 31 | Items Filled from Requests Return to Availability |
| 32 | Default Order Type |
| 33 | Regular Hours |
| 34 | Regular Hours Multiplier |
| 35 | Over Time Hours |
| 36 | OverTime Hours Multiplier |
| 37 | Double Time Hours |
| 38 | DoubleTime Hours Multiplier |
| 39 | Holiday Multiplier |
| 40 | Recalc Labor Hours |
| 41 | Modified By |
| 42 | Modified On |

### Data Formats (from latest row)

| Format | Representation | Example |
|---|---|---|
| Boolean TRUE | SVG checkmark icon (`<svg class="lucide lucide-check">`) | Col 8 Use Fulfillment (when checked) |
| Boolean FALSE | Empty cell (no content) | Col 8 Use Fulfillment (when unchecked) |
| Date offset | Plain integer | "-1", "1", "0" |
| Timestamp | MM/DD/YYYY HH:MM:SS AM/PM | "04/08/2026 08:31:45 AM" |
| Section data | Pipe-separated key-value | "Projection - true \| Audio - true \| ..." |
| Exemption data | Pipe-separated key-value | "HSIA - Labor - true \| ..." |
| Action | Text | "Update" |
| Default Order Type | Text | "Event" |
| ECT hours | Plain number | "24" |
| ECT multipliers | Decimal | "1", "1.5", "2" |
| Empty/null | Empty string "" | No "null" or "N/A" |

**CRITICAL DIFFERENCE**: Location Management History uses Unicode "✔" for booleans, but Local Office History uses SVG checkmark icons. `textContent` returns empty for SVG checkmarks — must check `innerHTML` for `lucide-check` class to detect TRUE values.

**BUILDER ALERT — Boolean Detection Pattern for Local Office History**:
- `cell.textContent` returns `""` for BOTH true AND false cells (SVG has no text content)
- **TRUE detection**: `(await cell.innerHTML()).includes('lucide-check')` → true
- **FALSE detection**: `(await cell.innerHTML()).trim() === ''` → true
- Location Management History booleans use Unicode `"✔"` which IS readable via `textContent`
- `getColumnByHeader()` for boolean columns MUST use `innerHTML`, not `textContent`

### Plan vs Actual Column Name Differences

| Plan Col# | Plan Name | Actual Name | Issue |
|---|---|---|---|
| 26 | Default Job to 1 day Event | Default Job to 1 day for Event Orders | Name mismatch |
| 27 | Default Job to 1 day Outside | Default Job to 1 day for Outside Orders | Name mismatch |
| 28 | Default Job to 1 day Internal | Default Job to 1 day for Internal Orders | Name mismatch |
| 30 | Allow tentative+confirmed same priority | Allow tentative and confirmed Status to have the same priority | Name mismatch (full text) |
| 31 | Items Filled Return to Availability | Items Filled from Requests Return to Availability | Name mismatch |

### Save Dialog

[MCP-VERIFIED: 2026-04-13 14:49] Local Office Settings uses **"Save Changes" dialog with Cancel/Save buttons** (NOT Cancel/Ok like Location Settings).

---

## 3. Causality Tests

### Single-Field Save (Local Office)
[MCP-VERIFIED: 2026-04-13 14:49] Changed PrepDateOffset from -1 to -2 → Saved → History tab shows NEW row at top:
- Row 1: Prep=-2, Modified On=04/13/2026 02:49:42 PM (today)
- Row 2: Prep=-1, Modified On=04/08/2026 08:31:45 AM (previous)
- **Result: 1 save = 1 new history row**

### Multi-Field Save (Local Office)
[MCP-VERIFIED: 2026-04-13 14:55] Changed PrepDateOffset from -2 to -1 AND toggled UseFulfillment ON → Saved → History tab shows:
- Row 1: Prep=-1, UseFulfillment=✔(SVG), Modified On=04/13/2026 02:55:24 PM
- Row 2: Prep=-2, UseFulfillment=empty, Modified On=04/13/2026 02:49:42 PM
- **Result: 1 save = 1 row, regardless of fields changed. SNAPSHOT MODEL confirmed.**

### Single-Field Save (Location Management)
[MCP-VERIFIED: 2026-04-13 15:02] Toggled Union checkbox ON → Saved → History tab shows:
- Row 1: Union=✔, Modified On=04/13/2026 03:02:22 PM (today)
- Row 2: Modified On=04/10/2026 03:42:00 PM (previous)
- **Result: 1 save = 1 new history row. SNAPSHOT MODEL confirmed for both systems.**

### Cross-System Independence
[MCP-VERIFIED: 2026-04-13 15:00] Saves on Local Office Settings (4 saves between 14:49-14:59) did NOT create rows in Location Management History (latest row still from 04/10/2026). The two history systems are **completely independent**.

---

## 3.5 ECT Causality (added 2026-04-15)

[MCP-VERIFIED: 2026-04-15 09:36–09:41 UTC] **ECT editable-field saves do NOT create Local Office History rows.** Followup session per `plans/pending/PLAN_HIST_SP2_PER_TC_MCP_AUDIT.md` to close the open gap on TC-LOS-HISL-002.

**Method**: Two-cycle BenefitsMultiplier save test with fetch-interception save proof and pre/post pagination delta.

| Step | Action | Result |
|---|---|---|
| 1 | Capture History rowCountBefore | Page 1 / 64 pages; top row Modified On = 04/15/2026 08:43:18 AM (prior Basic Info save) |
| 2 | ECT tab → BenefitsMultiplier 20.0% → 21 (Tab → normalized to 21.0%) | Save button (`ect-settings-btn-save-fixed-costs-btn`) becomes enabled |
| 3 | Click Save | Save fires immediately — NO "Save Changes" confirmation dialog (differs from Basic Info Cancel/Save flow). Network: 1 POST `/navigator/api/location/ect-settings` at 09:39:03Z. Save button returns to disabled. |
| 4 | Switch to History tab | Page 1 / 64 pages; top row Modified On = 04/15/2026 08:43:18 AM. **Pages unchanged. Top row unchanged.** |
| 5 | Cleanup: ECT tab → BenefitsMultiplier 21.0% → 20 (restore) → Save | Save fires (button enables → click → disables). Restored to original. |
| 6 | Switch to History tab | Page 1 / 64 pages; top row Modified On = 04/15/2026 08:43:18 AM. **Still unchanged after second ECT save.** |

**Result**: 2 ECT saves = 0 new history rows. Confirms NOT-TRACKED status of ECT editable fields (BenefitsMultiplier — and by extension HistoricalSubrental and LaborCost rows, which share the same `/api/location/ect-settings` endpoint and same absence from the 42-column header list per §2).

**ECT vs Basic Info save UX difference**: Basic Info uses Cancel/Save confirmation dialog (per §2 line 241). ECT panel saves immediately on Save click — no confirmation step. Tests must NOT wait for `dlgSaveChanges` after ECT saves.

**Scope note**: Verified only for BenefitsMultiplier in this session. HistoricalSubrental and LaborCost row edits were NOT individually MCP-tested in this followup; their NOT-TRACKED status is inferred from §8 registry + shared API endpoint + this session's BenefitsMultiplier evidence. This inference is the basis for TC-LOS-HISL-002's coverage of all six ECT save TCs (ECT-005, 009, 013, 014, 015, 016).

---

## 4. Table Refresh Behavior

[MCP-VERIFIED: 2026-04-13 14:52] After save on Basic Info tab → switch to History tab (no page reload):
- New row IS visible immediately at top of table
- **Table REFRESHES on tab switch** — no page reload needed
- This was tested on BOTH systems

---

## 5. Horizontal Scroll Behavior

| System | ScrollWidth | ClientWidth | Virtual? |
|---|---|---|---|
| Location Management (87 cols) | 16,065px | 1,141px | No — all columns in DOM |
| Local Office (42 cols) | 9,268px | 1,816px | No — all columns in DOM |

**Conclusion**: Both systems use real DOM rendering for all columns. No `scrollToColumn()` method needed. Standard `locator('th')` and `locator('td')` selectors will work for any column regardless of scroll position.

**Multiple Tables in DOM**: `document.querySelectorAll('table')` returns 3 tables on the Local Office page (sidebar/nav may contain tables). All history table queries **MUST** be scoped to `[data-testid="local-office-settings-history-table"]` or the Location Management equivalent — never use bare `table` selectors.

---

## 6. Pagination

| System | Rows Per Page | Total | Format |
|---|---|---|---|
| Location Management | 20 | "1 / 147" (page/pages) | "20 rows per page 1 / 147" | ~2940 items |
| Local Office | 20 | "1 / 61" (page/pages) | "20 rows per page 1 / 61" | ~1204 items |

Both have 4 pagination buttons: first, previous, next, last (aria-labels: "Go to first page", "Go to previous page", etc.)

**RESOLVED** [MCP-VERIFIED: 2026-04-13 16:00]: Format is **"page X / total PAGES"** (not total items). Confirmed by navigating to last page: Location Management shows "147 / 147" (2 rows on last page), Local Office shows "61 / 61" (4 rows on last page). `getRowCount()` should parse the second number and multiply by 20 (minus partial last page) for approximate total.

---

## 7. History Type Dropdown

[MCP-VERIFIED: 2026-04-13 15:57] **BOTH pages have the SAME 2 dropdown options**:
1. "Location Management History" (default — always selected on page load)
2. "Location Management Legacy History" (out of scope per user instruction)

**CORRECTION**: SP1 v1 incorrectly said one option was "Location Settings History". This option does NOT exist. The TAB name on Local Office page is "Location Settings History" but the DROPDOWN inside always shows "Location Management History" as the default. The dropdown controls which DATASET version to show (current vs legacy), NOT which page's history.

**Test data file** `local-office-history.data.ts` correctly has `default: 'Location Management History'` and `options: ['Location Management History', 'Location Management Legacy History']`. SP1 v1's description was wrong — the test data was right all along.

**Selector testids**:
- Local Office: `[data-testid="local-office-settings-history-select-type"]`
- Location Settings: `[data-testid="location-settings-select-history-type"]`

---

## 8. NOT-TRACKED Fields

Fields saved by existing specs that have NO corresponding history column:

### Local Office Settings (no column in 42)

| Field | Spec Test ID | Notes |
|---|---|---|
| PO Number (txtPoNumber) | TC-LOS-BAS-023, BAS-039 | Not in 42-column history |
| PO Number Label (txtPoNumberLabel) | TC-LOS-BAS-024 | Not in 42-column history |
| Room toggle/rename | TC-LOS-BAS-048, BAS-049 | Not in 42-column history |
| BenefitsMultiplier | TC-LOS-ECT-005, ECT-016 | ECT editable — NOT in 42 cols |
| HistoricalSubrental | TC-LOS-ECT-013, ECT-016 | ECT editable — NOT in 42 cols |
| LaborCost rows | TC-LOS-ECT-009, ECT-014, ECT-015 | ECT editable — NOT in 42 cols |

### Location Management (no column in 87)

| Field | Spec Test ID | Notes |
|---|---|---|
| EnableMultidayPricing | TC-LOC-LI-071 | Not in 87-column history |
| Merchant currency selection | TC-LOC-CUR-022, CUR-024 | Not in 87-column history |
| Auto Add-On checkboxes | Auto Add-On spec | Not in 87-column history |

---

## 9. Contingency Branch Selections

Based on MCP findings, selected branches from master plan contingency table:

| Finding | Selected Branch |
|---|---|
| History populated (not empty) | Proceed with integration tests for BOTH systems |
| Per-save rows (1 save = 1 snapshot row) | Integration tests check 1 row per save |
| Table refreshes on tab switch | History checks can use tab switch without page reload |
| No virtual horizontal scroll | Page object does NOT need scrollToColumn() method |
| Modified On format is absolute timestamp | Can use timestamp matching for verification |

---

## 10. Plan Corrections Required

| Section | Correction |
|---|---|
| Context > Key Constraint | "Location 1604's Local Office History is EMPTY" → **WRONG, it has 61 pages of data** |
| Col 28 bug | "BUG: renders i18n key" → **NOT A BUG, renders correctly as "Calculate LDW on Net Amount"** |
| Col 41 duplicate | "duplicate col — KNOWN BUG" → **NOT a duplicate. Col 40 = "Set/Strike/Support Labor Billing Goal", Col 41 = "Enable Set/Strike Labor Minutes"** |
| Boolean format (Local Office) | Plan assumed same format for both systems → **DIFFERENT: Location Mgmt uses Unicode ✔, Local Office uses SVG lucide-check icons** |
| Save dialog buttons | Plan didn't distinguish → **Location Settings: Cancel/Ok. Local Office Settings: Cancel/Save** |
| Multiple column name mismatches | See §1 and §2 "Plan vs Actual" tables — 12+ header names differ from plan |
| Col 64 duplicate | "Currency" is confirmed as a duplicate column name (cols 6 and 64 both named "Currency") ✅ |

---

## 11. Integration Test Design Notes

> These notes address gaps and traps identified during post-execution audit. BUILDER agents MUST read this section before implementing Phase 1-2.

### Row Count Baseline Strategy

Office 1604 history is ALWAYS populated (61+ pages for Local Office, 146+ for Location Management). The existing assertion `isHistoryTableEmpty() === false` (TC-LOS-HIS-003) is useless for integration testing. Integration tests MUST:
1. Capture `rowCountBefore = getRowCount()` or read pagination total BEFORE the save action
2. After save → tab switch to History → assert `rowCountAfter > rowCountBefore`
3. Never use `toBeGreaterThan(0)` — it will always pass and proves nothing

### Sort Click Behavior

[MCP-VERIFIED: 2026-04-15 10:58–11:02 UTC] Sort is triggered via a **Radix dropdown menu**,
NOT a click-toggle. The `<th>`'s nested button is a
`data-slot="dropdown-menu-trigger"` with `aria-haspopup="menu"` — it **opens a menu**
rather than toggling sort direction. The headers carry **no sort-state attribute**, so any
"read current direction, reverse it" design is unimplementable. The canonical flow below
is derived from live-DOM verification on Office 1604 and matches the already-working
implementation in
[location-management-history.page.ts:172](src/pages/setup/locations/location-management-history.page.ts:172)
(`clickSortColumn`) and
[local-office-settings.page.ts:573](src/pages/setup/local-office/local-office-settings.page.ts:573)
(`sortHistoryByModifiedOnDesc`).

**Header DOM structure (sortable columns — both history systems identical):**
```
<th data-slot="table-head" class="..." style="width:Npx">
  <div class="flex items-center space-x-2">
    <button data-slot="dropdown-menu-trigger"
            aria-haspopup="menu"
            aria-expanded="false"
            data-state="closed"
            id="radix-«...»">
      <!-- header text -->
      <svg class="lucide lucide-arrow-down size-4 shrink-0">...</svg>
    </button>
    ...
  </div>
</th>
```
- No native sort-state attribute on the `<th>` — there is nothing on the element that
  reflects current sort direction. Do not probe for one. Drive sort only via menu clicks.
- `lucide-arrow-down` SVG: static menu-trigger icon, **not** a sort-direction indicator.
- `data-state` on button: `"closed"` → `"open"` when menu is showing (useful for waiting).

**Radix dropdown menu (opens in document portal after click):**
```
<div role="menu"
     data-slot="dropdown-menu-content"
     data-state="open"
     data-orientation="vertical"
     data-side="bottom"
     aria-labelledby="radix-«...»">
  <div role="menuitem" data-slot="dropdown-menu-item">Sort ascending</div>
  <div role="menuitem" data-slot="dropdown-menu-item">Sort descending</div>
</div>
```
- Menu items: **exactly 2**, literal labels `"Sort ascending"` and `"Sort descending"`.
- **No** `"Clear sort"` / `"Unsorted"` / `"Hide column"` / `"Reset"` option — verified both
  pre-sort and post-sort. Item count stays at 2 after any sort action.
- No `data-testid` on menu items — select by role + name.
- Menu auto-closes after click; wait for `[role="menu"]` hidden before reading rows.

**Canonical sort flow (for any sortable column on either history table):**
1. Locate the column's header button:
   `const btn = table.locator('th').nth(colIndex).locator('button[data-slot="dropdown-menu-trigger"]')`
2. Click the button and wait for the Radix portal menu to appear:
   `await btn.click(); await page.locator('[role="menu"]').first().waitFor({ state: 'visible', timeout: 5_000 });`
3. Click the desired direction (exact label required):
   `await page.getByRole('menuitem', { name: 'Sort descending' }).click();`
   (or `'Sort ascending'` — no other options exist)
4. Wait for menu to close and Angular to settle:
   `await page.locator('[role="menu"]').first().waitFor({ state: 'hidden', timeout: 5_000 });`
   `await waitForAngularStable();`
5. Table is now re-sorted in place. No reload, no URL change.

**Default sort direction — DO NOT rely on it.** Observed defaults differ per page and may
reflect session persistence:
- Location Management History: initial state observed as **ascending** (rows 1–3 Modified On
  = `03/10/2026 04:40:30 PM → 04:40:34 PM → 04:40:38 PM`).
- Local Office Settings History: initial state observed as **descending** (rows 1–3 Modified On
  = `04/15/2026 08:43:18 AM → 08:43:14 AM → 08:42:45 AM`).

Integration tests that need a known order MUST click `"Sort descending"` explicitly rather
than assume current ordering. Idempotent re-click is safe — clicking `"Sort descending"`
when already descending keeps rows in place.

**Sortability detection (for BUILDER's `isSortButtonPresent()` / `clickSortColumn()` guard):**
- **Sortable** `<th>`: contains `button[data-slot="dropdown-menu-trigger"]`.
- **Non-sortable** `<th>`: contains `<div class="">HEADER TEXT</div>` directly — no button.
- Local Office Settings History: **38 of 42 sortable**. Non-sortable columns (by index):
  0 `Local Office`, 15 `Section Name`, 20 `Service Type - Exempt`, 23 `Notes`.
- Location Management History: **14 of 87 sortable** (per SP1 §2; structural pattern
  matches — button-presence check is the authoritative signal).
- BUILDER's sort helpers must throw (or no-op with a clear log) when called on a
  non-sortable column rather than silently clicking a non-button element.

**Structural note — table testid wraps differently on each page:**
- `[data-testid="location-settings-table-management-history"]` is a `<div>` wrapper;
  traverse to `table th` inside.
- `[data-testid="local-office-settings-history-table"]` **is itself the `<table>`**;
  traverse to `th` directly (no intermediate `table` selector).
  Page objects already encode this asymmetry — BUILDER should not add a generic
  `.locator('table th')` traversal without checking the target page.

### No Async Write Delay Observed

All 5 save→tab-switch→history-check cycles during MCP discovery showed the new row immediately. No wait-and-retry was needed. However, under load or with slow API responses, a brief delay is possible. Integration tests should use `expect.poll()` with a short timeout (5s) for the row-count assertion rather than an immediate check.

### Timestamp Timezone

Timestamps render in `MM/DD/YYYY HH:MM:SS AM/PM` format. The timezone (UTC vs server-time vs browser-local) was **NOT determined** during discovery. For timestamp-based assertions:
- Use time-window matching: assert Modified On is within ±5 minutes of `new Date()` at test execution time
- Do NOT assert exact timestamp equality
- If precise timezone is needed, compare `new Date()` output against Modified On during a Phase 1 verification step

### Duplicate "Currency" Header (Cols 6 + 64)

Both columns are named "Currency". Values in the same row were NOT compared during discovery. Implementation notes:
- `getColumnByHeader('Currency')` will return the **first match** (col 6 — primary location currency)
- To access col 64 (pricing currency), use `getColumnByIndex(63)` (0-based) or locate by adjacent column context: col 63 = "Pricing Strategy", col 65 = "Pricing Action"
- Master plan maps col 6 → Currency tab, col 64 → Pricing tab

### Unsaved Changes Dialog on Tab Navigation

[MCP-VERIFIED: 2026-04-13 16:00] **Dirty form → History tab switch DOES trigger unsaved dialog**. Tested on BOTH pages:
- **Dialog text**: "Unsaved changes — Are you sure you want to leave this view? Any unsaved changes will be lost."
- **Buttons**: "Stay" (keeps dirty form open) and "Discard" (discards changes, switches to History)
- **Active tab remains Basic Information** until user clicks Stay or Discard
- **Same dialog on both pages** (Location Settings and Local Office Settings)

[MCP-VERIFIED: 2026-04-13 16:04] **Post-save tab switch does NOT trigger dialog** on Local Office Settings (tested: toggle UseFulfillment → Save → confirm dialog → Save disabled → click History tab → no unsaved dialog → switched cleanly).

**Integration test pattern**:
1. After save, wait for Save button disabled
2. Switch to History tab
3. If `[role="alertdialog"]` appears (LR-026 intermittent dirty state), click "Discard"
4. Verify active tab is now History before reading data

### Cascade Side-Effects

Whether toggling a parent checkbox (e.g., Union, which may cascade to related fields) creates multiple history rows was NOT tested. All causality tests used isolated fields. If a cascade field is used in integration tests, verify the row count delta matches expectations (still 1 row per save, even with cascade — likely, given snapshot model, but unverified).
