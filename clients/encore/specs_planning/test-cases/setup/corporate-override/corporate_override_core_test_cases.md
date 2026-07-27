# Corporate Pricing — Product Group Override Test Cases — Core

**Module**: corporate-override | **Total**: 61 | **Status**: Automated | **Updated**: 2026-07-27

---

## MCP_VERIFICATION_LOG — Product Group Override (NM-1463)

| Field | Value |
|-------|-------|
| Date | 2026-06-09 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override |
| Office/Entity | 1604 (Parker Palm Springs), Equipment tab (8 override rows); Labor tab = 0 rows for 1604 |
| Intent oracle | **baseline-absent + DOCX-absent** — the Override screen is undocumented; live DOM is the sole intent oracle (Q-WV15-1). Jira story lead NM-1463 (unconfirmed). |
| Field-inventory | `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-09.md` (supersedes 2026-06-08 — edit-mechanism GAP CLOSED) |
| Divergences | `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md` (Q-WV15-1 resolution + NM verdicts) |
| Stack | React/Next.js (App Router, RSC); grid in **shadow roots** (Playwright locators pierce); `waitForAngularStable` is a no-op (wait for `tbody tr`) |
| **Edit mechanism (Q-WV15-1 RESOLVED)** | Click the Override Price / Max Discount `div[role=button]` cell → active `field` → **native value-setter** (React-controlled; `.fill()` does not commit) + **`Enter`** → Save enables. Active = Radix `checkbox` (LR-036 4th render) toggles + dirties. **Recon's "inert cells" was a FALSE NEGATIVE.** |
| Save | dialog-gated "Save Changes" confirmation dialog (`Are you sure you want to save the changes?`) → **`POST /navigator/api/location/corporate-price-pg-override`** (LR-056 — NOT the page-URL RSC POSTs) → toast "Pricing overrides saved successfully." |
| Persistence / reversibility | reload + DOM re-read (Tier 1). Round-trip 445.00→446.00→445.00 verified reversible; Updated By becomes the automation user on save (audit columns volatile → assert by pattern). |
| Net-zero (LR-009) | reverting Override Price to its saved value DISABLES Save (verified) |
| Mutation safety | save-cycle commits only on fixture row **2605 House Video Monitor - Specialty** (default Override Price 445.00); restored by bounded-retry `ensureDefaultState()`. Distinct screen/data-model from Strategy/Detail fixtures (zero collision). |
| data-testid coverage | **ZERO** on the grid (text/role/grid-header/content-anchored — Doctrine 4). The shared "Change Local Office" picker modal has testids (e.g. `location-settings-modal-change-local-office-input-search`). |

---

## 2026-07-09 re-verification (office 1606) + net-new coverage (TC-029..037)

| Field | Value |
|-------|-------|
| Date | 2026-07-09 |
| Runtime | Spec re-anchored to **location 1606** (office 1604 no longer carries Override data on this environment — an open item with the Encore product team; 1606 is the healthy control). Anchor row 2609 "House Video Monitor LED 70\"-79\"" (Override Price 500.00, active). All 7 rows on 1606 render active. |
| Navigation (TC-029) | The Search action bar "Pricing Override" button navigates to `/pg-override` (heading "Product Group Override"). |
| Location picker (TC-030) | "Change Local Office" modal — Select is disabled until a row is checked, then enabled; a search finds the office row; Cancel closes with no location applied. (No "All Locations" row on 1606.) |
| Grid Options (TC-031) | Override toolbar has its OWN Grid Options (`button[aria-label="Grid Options"]`): 10 column toggles + "Reset to Default"; hiding a column removes its header and persists across reload (server preference). |
| Export (TC-032) | Override Export is a **direct** CSV download `ProductGroupOverrides_<timestamp>UTC.csv` via `GET corporate-price-pg-override/export?locale=en-US` — NO Year/Currency dialog (distinct from the Search screen's Export menu). |
| Export header/row pinning (TC-038, added 2026-07-09) | The file is a **tenant-wide** dump (rows begin around office 1101, not scoped to the on-screen selection) with **9** columns — `Location Id, Product Group Id, Product Group Name, Is Labor, Currency, Current Price, Override Price, Override Discount, Is Active` — a different shape from the 10-column on-screen grid. Live-verified against a real download (8,995 rows): IDs always numeric, Currency always USD/CAD/MXN, Is Labor/Is Active always 0/1, Current Price always populated money, Override Price money-or-blank (1 blank row), Override Discount decimal-or-blank (mostly blank). Product Group Name may itself carry a literal `"` (e.g. an inch-mark size) but is not asserted for content. |
| Import (TC-033) | Override Import opens the "Import All Pricing Overrides" dialog (Browse / Cancel / Upload / Close + a file input); tests never upload a real file. |
| NM-1463 (TC-034) | Editing the Override Price on an **inactive** row auto-activates it. |
| NM-2206 (TC-036) | Every row shows a Current Price value on 1606 + USD (no blank / red-circle). |
| Sorting (TC-035) | **Inactive** — a column-header click sets no active sort state and does not reorder (consistent with the Search + Detail grids). |
| Pagination | Behavior not exercised on 1606 (7 rows < the 10-row minimum page size); the options list (10/20/30/40/50) is already covered by TC-CPR-OVR-011. |
| Max Discount % cap (TC-037) | **Inclusive at 100** — values up to and including 100 commit. Over 100 sets aria-invalid + a red border and refuses to commit, but does not recover cleanly (still defective — TC-CPR-OVR-023 kept skipped, see its note). |

---

### Clarifications (RAISED — Doctrine 2; Jira leads live-verified per LR-044) — see the wave15 divergences draft

| # | Intent / lead | Live reality (2026-06-09) | Disposition |
|---|---|---|---|
| Q-WV15-1 (item 5) | edit mechanism / possible RBAC (NM-2126) | click-to-edit cell → field → native-set + Enter; automation user edits + saves | **RESOLVED** — not RBAC-blocked; full save-cycle FCC automatable |
| Q-WV15-1 (items 2/3) | Override Price / Max Discount validation rules | client accepts 0 / decimal / large / >100% Max Discount; non-numeric rejected by `type=number` | intended min/max/format = product-team clarification (still RAISED); client behavior asserted live |
| Q-WV15-1 (item 4) | 9 vs 10 columns | 10 columns (adds `Updated By`) | benign audit-column addition; asserted live (TC-CPR-OVR-005) |
| NM-1870 | Current Price not displayed | renders `0.00` (a value) | **not-reproduced** (TC-CPR-OVR-006) |
| NM-1889 | search matches unintended columns | client filter scoped to Product Group ID + Name only | **not-reproduced** (TC-CPR-OVR-014) |
| NM-2126 | RBAC canEdit gate | automation user edits + saves | **not-reproduced**; RBAC negative NOT-AUTOMATABLE (single account) |
| NM-1675 | Current Price computed not stored | Current Price `0.00`; cross-page recompute = PRE_EDGE scope | consistent (noted) |
| NM-1932 | saves Max Discount without Override Price | no blank-Override-Price row on 1604 to test | blocked-data (clarification) |
| NM-1961 | new rows not shown until refresh | no "add override row" affordance on this screen | not-applicable |

---

## FIELD INVENTORY — Product Group Override

Full dated inventory: `field-inventories/corporate-pricing-override-2026-06-09.md`. ZERO grid data-testids; text/role/grid-header/content-anchored.

| Field | Type | Default (live) | State | Notes |
|---|---|---|---|---|
| Equipment / Labor tabs | Radix `role=tab` | Equipment selected | enabled | switch flips `aria-selected`, reloads grid (TC-CPR-OVR-002) |
| Select a location | card → "Change Local Office" modal | placeholder | enabled | grid location-gated (TC-CPR-OVR-003/004) |
| Currency filter | Radix dropdown | `ALL` | enabled | ALL/USD/CAD/MXN (TC-CPR-OVR-009) |
| Active only | Radix checkbox | OFF | enabled | toggles (TC-CPR-OVR-010) |
| Filter Product Groups Override | text input | `""` | enabled | client-side; matches ID + Name only (TC-CPR-OVR-012..016) |
| Override Price | `div[role=button]` → `field` | e.g. `445.00` | **editable** | native-set + Enter; numeric (TC-CPR-OVR-017..022) |
| Max Discount % | `div[role=button]` → `field` | `—` (unset) | **editable** | numeric %, renders "N.00 %"; a value >100 currently will not commit and the field shows no error / traps focus — defect under review (TC-CPR-OVR-023 parked, BUG-CPR-OVR-001) |
| Active (cell) | Radix `checkbox` (`aria-checked`) | per row | **editable** | LR-036 4th render; toggles + dirties (TC-CPR-OVR-007/024/027) |
| Current Price | read-only `<td>` | `0.00` | read-only | displayed (NM-1870 not-reproduced, TC-CPR-OVR-006) |
| Mod Date / Updated By | read-only `<td>` | volatile | read-only | assert by pattern, not value |
| Save | button | disabled | enables on dirty | dialog-gated; net-zero disables (TC-CPR-OVR-018/019/028) |
| Rows per page | Radix dropdown | `20` | enabled | 10/20/30/40/50 (TC-CPR-OVR-011) |

## Validation Rules

- **Edit**: click cell → field; commit on Enter (native value-setter required; `.fill()` no-ops React state).
- **Save gate**: any dirty cell (Override Price / Max Discount / Active) enables Save; reverting to the saved value disables it (LR-009 net-zero).
- **Override Price**: `type=number` — non-numeric coerced to empty (LR-011); 0 / decimal / large accepted (renders with thousands separators, e.g. "999,999.00").
- **Max Discount %**: numeric, renders "N.00 %"; **cap is inclusive at 100** — 0–100 (incl. decimals) commit (TC-037). Over 100 is flagged invalid (aria-invalid + red border) and refuses to commit, but does not recover cleanly — kept skipped as TC-023 (see its note).
- **Save**: dialog-gated ("Save Changes") → `POST corporate-price-pg-override` → toast; persists after reload.
- **Mutation safety**: save-cycle on fixture row 2605 only, restored via `ensureDefaultState()` (no-drift, bounded retry + throw).

---

## TC-CPR-OVR-001: Override screen loads with Equipment selected by default
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: Authenticated on office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Product Group Override screen -> Page loads on `/pg-override` | The Product Group Override screen loads and is displayed. |
| 2 | Read the active tab -> "Equipment" is selected by default | The Override screen loads and the Equipment tab is selected by default |

**Expected**: The Override screen loads and the Equipment tab is selected by default.
**Data**: office=1604

---

## TC-CPR-OVR-002: Equipment + Labor tabs render and switching flips aria-selected
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-001
**Automatable**: Yes

**Preconditions**: On the Override screen with a location selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Labor tab -> `aria-selected` flips to Labor | The Labor tab becomes active and its content is displayed. |
| 2 | Click the Equipment tab -> `aria-selected` flips back to Equipment | Both tabs render; switching updates the active tab |

**Expected**: Both tabs render; switching updates the active tab (`aria-selected`).
**Data**: office=1604

---

## TC-CPR-OVR-003: Grid is location-gated — empty before a location is selected
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-001
**Automatable**: Yes

**Preconditions**: Fresh Override screen load, no location chosen.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Override screen without selecting a location -> "No results." is shown | The Override screen displays "No results." in the grid area. |
| 2 | Read the grid -> zero data rows | Zero data rows are displayed in the grid. |
| 3 | the "Select a location" card is visible | The "Select a location" card is visible on screen. |

**Expected**: The grid is location-gated — it shows the empty state ("No results.") and zero rows until a location is selected.
**Data**: office=1604

---

## TC-CPR-OVR-004: Selecting a location populates the grid with the anchor row
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-003
**Automatable**: Yes

**Preconditions**: On the Override screen.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Select a location" picker, search 1604, check the row, click Select -> Grid loads | The grid populates with rows for office 1604. |
| 2 | Read the grid -> rows > 0 | Rows are displayed in the grid. |
| 3 | the anchor "House Video Monitor - Specialty" is present | The "House Video Monitor - Specialty" row is present in the grid. |

**Expected**: Selecting office 1604 populates the override grid.
**Data**: office=1604

---

## TC-CPR-OVR-005: Grid renders all column headers
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the grid column headers -> Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By | All columns render, including the Updated By column |

**Expected**: All columns render, including the Updated By column.
**Data**: office=1604

---

## TC-CPR-OVR-006: Current Price column renders a value
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Current Price cell of the anchor row -> a numeric value (e.g. "0.00") | The Current Price column displays a value (e.g. "0.00"), not an empty cell |

**Expected**: The Current Price column displays a value (e.g. "0.00"), not an empty cell.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-007: Active column renders as a checkbox with a readable checked state
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Active cell of the anchor row via `aria-checked` -> resolves to a real boolean | The Active column renders as a checkbox whose checked / unchecked state is readable |

**Expected**: The Active column renders as a checkbox whose checked / unchecked state is readable.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-008: Labor tab shows the empty state for office 1604 with headers rendered
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-002
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Switch to the Labor tab -> active tab = Labor | The Labor tab becomes the active tab. |
| 2 | Read the grid -> 0 rows | Zero rows are displayed in the Labor grid. |
| 3 | the column headers still render | The column headers are still displayed. |

**Expected**: Office 1604 has no Labor overrides — the Labor grid is empty (0 rows) but the structure (headers) still renders.
**Data**: office=1604

---

## TC-CPR-OVR-009: Currency filter offers ALL/USD/CAD/MXN
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Currency filter -> options render | The Currency filter dropdown opens and displays its list of options. |
| 2 | Read the option list -> ALL, USD, CAD, MXN | The Currency filter lists ALL, USD, CAD, MXN (default ALL) |

**Expected**: The Currency filter lists ALL, USD, CAD, MXN (default ALL).
**Data**: office=1604

---

## TC-CPR-OVR-010: Active-only filter defaults OFF and toggles
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Active-only checkbox -> unchecked (default OFF) | The Active-only checkbox is displayed unchecked. |
| 2 | Toggle it on -> checked | The Active-only checkbox is displayed checked. |
| 3 | toggle it off -> unchecked | The Active-only checkbox is displayed unchecked. |

**Expected**: The Active-only filter defaults OFF and toggles (differs from the Search-screen Active Only, which defaults ON).
**Data**: office=1604

---

## TC-CPR-OVR-011: Rows-per-page offers 10/20/30/40/50
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the rows-per-page control -> options render | The rows-per-page control opens and displays its list of values. |
| 2 | Read the list -> 10, 20, 30, 40, 50 | The rows-per-page control offers 10/20/30/40/50 (default 20) |

**Expected**: The rows-per-page control offers 10/20/30/40/50 (default 20).
**Data**: office=1604

---

## TC-CPR-OVR-012: Client filter by Product Group Name narrows the grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type "House Video" into the "Filter Product Groups Override..." input -> grid narrows | The grid narrows to rows matching "House Video". |
| 2 | Read the grid -> rows > 0 and <= the unfiltered count | Rows are displayed, at or below the unfiltered count. |
| 3 | the anchor row is present | The anchor row is present in the grid. |

**Expected**: The filter narrows the rendered grid by Product Group Name (no Search button).
**Data**: office=1604

---

## TC-CPR-OVR-013: Client filter by Product Group ID narrows to the matching row
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type the Product Group ID "2605" into the filter -> grid narrows | The grid narrows to rows matching "2605". |
| 2 | Read the grid -> the anchor row is present | The anchor row for product group 2605 is present in the grid. |
| 3 | rows > 0 | At least one row is displayed. |

**Expected**: The client filter matches the Product Group ID column.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-014: Client filter is scoped to ID and Name only
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a Currency value "USD" (present in every row's Currency column, no Product Group ID/Name) -> grid shows 0 rows | The value "USD" is entered into the filter input and the grid re-renders. |
| 2 | Clear the filter -> rows restore | The filter is scoped to Product Group ID and Name; a Currency value yields no matches (it does not match the Currency column) |

**Expected**: The filter is scoped to Product Group ID and Name; a Currency value yields no matches (it does not match the Currency column).
**Data**: office=1604

---

## TC-CPR-OVR-015: No-match filter empties the grid, and clearing restores rows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a non-matching term -> grid shows 0 rows | The non-matching term is entered into the filter input and the grid updates. |
| 2 | Clear the filter -> rows restore (> 0) | A no-match filter renders an empty grid; clearing restores the rows |

**Expected**: A no-match filter renders an empty grid; clearing restores the rows.
**Data**: office=1604

---

## TC-CPR-OVR-016: Filter tolerates whitespace and special characters without crashing
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type whitespace-only and special characters into the filter -> no crash | The whitespace and special characters are entered into the filter input without error. |
| 2 | Clear the filter -> rows restore | The filter accepts whitespace / special characters without erroring; the app stays responsive |

**Expected**: The filter accepts whitespace / special characters without erroring; the app stays responsive.
**Data**: office=1604

---

## TC-CPR-OVR-017: Clicking the Override Price cell reveals an editable numeric input
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Override Price cell of the anchor row -> a numeric editor (field) reveals | The Override Price cell switches to edit mode and displays a numeric input. |
| 2 | Read the editor value, then press Escape (no change) -> editor exposes the current value (445) | The Override Price cell is click-to-edit - clicking reveals an editable numeric input pre-filled with the current value |

**Expected**: The Override Price cell is click-to-edit — clicking reveals an editable numeric input pre-filled with the current value.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-018: Editing the Override Price enables Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-017
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit the Override Price to a new value and commit (Enter) -> cell updates | The new value is committed and the Override Price editor closes. |
| 2 | Observe the Save button -> Enabled | Committing a new Override Price dirties the form (Save enables) |

**Expected**: Committing a new Override Price dirties the form (Save enables).
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-019: Reverting the Override Price to its original value disables Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-018
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit the Override Price to a new value -> Save enabled | The new value commits and the Save button becomes enabled. |
| 2 | Edit it back to the original saved value -> Save disabled | Reverting to the saved value leaves the form with no net change, so the Save button becomes disabled again |

**Expected**: Reverting to the saved value leaves the form with no net change, so the Save button becomes disabled again.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-020: Override Price accepts a decimal value
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-017
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit the Override Price to a decimal (e.g. 123.45) and commit -> cell shows the decimal | The Override Price cell displays the decimal value. |
| 2 | Save enabled | The Save button becomes enabled. |

**Expected**: The Override Price accepts a decimal value. (No commit — discarded on the next navigation.)
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-021: Override Price accepts boundary values (0 and a large number)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-017
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit the Override Price to 0 -> cell shows 0 | The value 0 is accepted and committed to the Override Price cell. |
| 2 | Edit it to a large number (e.g. 999999) -> cell shows the value | The Override Price accepts boundary values 0 and a large number (the client does not block them; no commit) |

**Expected**: The Override Price accepts boundary values 0 and a large number (the client does not block them; no commit).
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-022: Override Price input rejects non-numeric text (LR-011)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-017
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Override Price editor and attempt to enter alphabetic text ("abc") -> the numeric input retains no alphabetic characters | The Override Price field accepts numbers only - non-numeric text is rejected (cleared to empty); no letters are retained. The editor is closed with Escape (no commit) |

**Expected**: The Override Price field accepts numbers only — non-numeric text is rejected (cleared to empty); no letters are retained. The editor is closed with Escape (no commit).
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-023: Max Discount % rejects above-cap (100.01) with full rejection oracle
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', '100.01')` | The value 100.01 is entered into the Max Discount % field and Enter is pressed. |
| 3 | Assert full rejection signature BEFORE escape: committed=false, aria-invalid=true, border-color oklch(0.577 0.245 27.325), errorText empty, Save disabled, escapable=true | 100.01 (BVA: first value above the inclusive-100 cap) is rejected - editor stays open, is invalid, red border, Save disabled. "Bug-evidence: no error message" - [ ] displayed text is empty (defect #4: the screen has the mechanism to announce errors and never does). The editor IS escapable (Tab moves focus out - NOT a focus trap, cross-vendor verified). This supersedes the previously-skipped TC-CPR-OVR-023 whose skip reason ("intended behaviour unknown") is now dead - the contract is established |

**Expected**: `100.01` (BVA: first value above the inclusive-100 cap) is rejected — editor stays open, `aria-invalid="true"`, red border, Save disabled. **Bug-evidence: no error message** — `[role="alert"]` displayed text is empty (defect #4: the screen has the mechanism to announce errors and never does). The editor IS escapable (Tab moves focus out — NOT a focus trap, cross-vendor verified). This supersedes the previously-skipped TC-CPR-OVR-023 whose skip reason ("intended behaviour unknown") is now dead — the contract is established.
**Data**: office=4107, product group=4298, field=Max Discount %, input=`100.01`
---

## TC-CPR-OVR-024: Toggling the Active checkbox dirties the form (Save enables)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the anchor row's Active state, then click the Active checkbox -> `aria-checked` flips | The Active checkbox flips to the opposite state. |
| 2 | Observe the Save button -> Enabled | The Save button is now enabled. |

**Expected**: Toggling the Active checkbox flips its state and dirties the form (Save enables). (No commit.)
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-025: Override Price save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-018
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected; test row 2605 at its default (445.00).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | (baseline) Ensure 2605 Override Price = 445.00 | Override Price for product group 2605 is confirmed at 445.00. |
| 2 | Edit Override Price to a new value -> Save enabled | The new value commits to the Override Price cell and the Save button becomes enabled. |
| 3 | Save -> "Save Changes" dialog -> confirm -> `POST corporate-price-pg-override` -> toast | The save dialog is confirmed, the save request completes, and a success toast appears. |
| 4 | Reload + re-select location -> the new value persists in the grid | The new Override Price value is displayed after reload. |
| 5 | (cleanup) Restore 2605 to 445.00 via `ensureDefaultState()` | Override Price for product group 2605 is restored to 445.00. |

**Expected**: A saved Override Price persists after reload; the test row is restored to its starting value.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-026: Max Discount % save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-023
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected; test row 2605 at its default.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | (baseline) Ensure 2605 at default | Max Discount % for product group 2605 is confirmed at its default value. |
| 2 | Edit Max Discount % to a value -> Save enabled | The new value commits to the Max Discount % cell and the Save button becomes enabled. |
| 3 | Save -> dialog -> confirm -> reload + re-select -> the Max Discount value persists | The Max Discount % value is displayed after reload. |
| 4 | (cleanup) Restore 2605 via `ensureDefaultState()` | Max Discount % for product group 2605 is restored to its default. |

**Expected**: A saved Max Discount % persists after reload; the test row is restored to its starting value.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-027: Active toggle save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-024
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected; test row 2605 at its default Active state.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | (baseline) Ensure 2605 at default | The Active state for product group 2605 is confirmed at its default. |
| 2 | Toggle the Active checkbox -> Save enabled | The Active checkbox toggles to the opposite state and the Save button becomes enabled. |
| 3 | Save -> dialog -> confirm -> reload + re-select -> the toggled Active state persists | The toggled Active state is displayed after reload. |
| 4 | (cleanup) Restore 2605 Active via `ensureDefaultState()` | The Active state for product group 2605 is restored to its default. |

**Expected**: A saved Active toggle persists after reload; the test row is restored to its starting value.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-028: Save opens the "Save Changes" dialog, and Cancel aborts without committing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-018
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected; test row 2605 at its default.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit the Override Price -> Save enabled | The new value commits to the cell and the Save button becomes enabled. |
| 2 | Click Save -> a "Save Changes" dialog appears ("Are you sure you want to save the changes?", Cancel/Save) | The "Save Changes" dialog opens with "Are you sure you want to save the changes?" and Cancel/Save buttons. |
| 3 | Click Cancel -> dialog closes | The dialog closes. |
| 4 | no commit | The Override Price value in the grid is unchanged. |
| 5 | (cleanup) `ensureDefaultState()` reloads + restores | The test row is restored to its default state. |

**Expected**: Save opens the shared "Save Changes" confirmation dialog; Cancel aborts without committing.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-030: The "Change Local Office" picker gates Select until a row is checked; Cancel applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-003
**Automatable**: Yes

**Preconditions**: On the Override screen with no location selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Select a location" picker -> the "Change Local Office" modal opens | The "Change Local Office" picker dialog opens. |
| 2 | Read the Select button before checking any row -> disabled | The Select button is displayed disabled. |
| 3 | Search the office and check its row -> Select becomes enabled | The matching office row is displayed and its checkbox becomes checked. |
| 4 | Click Cancel -> the modal closes and the grid stays empty (no location applied) | The picker is titled "Change Local Office"; Select is disabled until a row is checked, then enabled; Cancel closes it without applying a location |

**Expected**: The picker is titled "Change Local Office"; Select is disabled until a row is checked, then enabled; Cancel closes it without applying a location.
**Data**: location=1606

---

## TC-CPR-OVR-031: Grid Options lists every column; toggling one hides its header and it persists across reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected; all columns visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Grid Options -> a toggle per column (all 10) renders, all checked; "Reset to Default" is present | The Grid Options panel opens and lists a toggle for every column. |
| 2 | Toggle the "Updated By" column off -> its header is removed from the grid | The "Updated By" column header is removed from the grid. |
| 3 | Reload the page and re-select the location -> the "Updated By" column is still hidden (server-persisted) | The page reloads and the grid re-populates with the "Updated By" column still hidden. |
| 4 | (baseline) Restore all columns before and after the test | Grid Options exposes a toggle per column plus Reset to Default; hiding a column removes its header and the hidden state persists across a reload |

**Expected**: Grid Options exposes a toggle per column plus Reset to Default; hiding a column removes its header and the hidden state persists across a reload.
**Data**: location=1606, column="Updated By"

---

## TC-CPR-OVR-032: Export downloads a Product Group Overrides CSV directly (no dialog)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Override toolbar "Export" button -> a CSV file downloads directly (no Year/Currency dialog) | A CSV file downloads immediately. |
| 2 | Read the download -> filename `ProductGroupOverrides_<timestamp>UTC.csv` | The downloaded file is named in the format "ProductGroupOverrides_<timestamp>UTC.csv". |
| 3 | the request hits `corporate-price-pg-override/export?locale=en-US` | The download request is sent to the corporate-price-pg-override export endpoint. |
| 4 | the file is a non-empty CSV with a header row | The file contains a header row and at least one data row. |

**Expected**: Export triggers a direct Product Group Overrides CSV download from the override export endpoint, carrying the exact 9-column header set in order (per-row content is a separate concern, covered by TC-CPR-OVR-038).
**Data**: location=1606

---

## TC-CPR-OVR-033: Import opens the "Import All Pricing Overrides" dialog with a file input; Cancel closes it without uploading
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Override toolbar "Import" button -> the "Import All Pricing Overrides" dialog opens | The "Import All Pricing Overrides" dialog opens. |
| 2 | Read the dialog -> buttons Browse / Cancel / Upload / Close | The dialog displays Browse, Cancel, Upload, and Close buttons. |
| 3 | a file input exists | The dialog contains a file input control. |
| 4 | Click Cancel -> the dialog closes (no file uploaded) | The dialog closes. |

**Expected**: Import opens the "Import All Pricing Overrides" dialog with Browse/Cancel/Upload/Close and a file input; Cancel dismisses it without uploading. (No real upload is performed — shared-environment data safety.)
**Data**: location=1606

---

## TC-CPR-OVR-034: Editing the Override Price on an inactive row auto-activates it
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-017
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected; anchor row at its default (active).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set the anchor row inactive (staged only) -> Active reads false | The Active checkbox becomes unchecked. |
| 2 | Edit the Override Price to a new value -> Active flips to true automatically | The new value commits to the Override Price cell and the Active checkbox becomes checked again. |
| 3 | Observe Save -> Enabled | Editing the Override Price on an inactive row automatically re-activates it. (No commit - staged edit discarded on the next navigation.) |

**Expected**: Editing the Override Price on an inactive row automatically re-activates it. (No commit — staged edit discarded on the next navigation.)
**Data**: location=1606, product group=2609

---

## TC-CPR-OVR-035: Clicking a column header does not sort (no active sort state, row order unchanged)
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click a column header (e.g. "Product Group Name") -> no active sort state (`aria-sort` is not ascending/descending) | The grid row order remains unchanged and no sort indicator is displayed. |
| 2 | Read the first row before and after -> row order is unchanged | The Override grid headers are not sort triggers on this build - a header click sets no active sort state and does not reorder rows (consistent with the Search and Detail grids) |

**Expected**: The Override grid headers are not sort triggers on this build — a header click sets no active sort state and does not reorder rows (consistent with the Search and Detail grids).
**Data**: location=1606

---

## TC-CPR-OVR-036: Every row shows a Current Price value on office 1606 (no blank cell)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected (USD data).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Current Price cell of every visible row -> each contains a numeric value (never blank / missing) | Current Price renders a value for every row on office 1606 + USD - the blank / red-circle state does not occur here |

**Expected**: Current Price renders a value for every row on office 1606 + USD — the blank / red-circle state does not occur here.
**Data**: location=1606

---

## TC-CPR-OVR-037: Max Discount % accepts values up to the 100 cap (inclusive)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected; anchor row at its default.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit the Max Discount % to a normal percentage (10) -> commits | The value 10 is accepted and displayed in the Max Discount % cell. |
| 2 | Edit it to the cap value (100) -> commits (the cap is inclusive) | The value 100 is accepted and displayed in the Max Discount % cell. |
| 3 | the cell shows "100.00 %" | The Max Discount % cell displays "100.00 %". |
| 4 | Observe Save -> Enabled | The Save button becomes enabled. |

**Expected**: The Max Discount % cap is inclusive at 100 — values up to and including 100 commit. (The over-100 path is a known defect, covered and kept skipped as TC-CPR-OVR-023. No commit — staged edit discarded.)
**Data**: location=1606, product group=2609

---

## TC-CPR-OVR-038: Every downloaded CSV row is well-formed with valid IDs, currency, 0/1 flags, and money fields
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Override toolbar "Export" button -> a CSV file downloads | The Product Group Overrides CSV file downloads. |
| 2 | Read the header row -> the 9 columns are present (Location Id, Product Group Id, Product Group Name, Is Labor, Currency, Current Price, Override Price, Override Discount, Is Active) | The header row displays the full 9-column set. |
| 3 | Validate every data row against its column's expected format -> no offenders | Every row in the downloaded file has the full 9-column shape, a numeric Location Id and Product Group Id, a supported Currency (USD/CAD/MXN), 0/1 values in the Is Labor and Is Active flag columns, an always-populated Current Price money value, an Override Price that is either blank or a money value, and an Override Discount that is either blank or a plain decimal. The file is a tenant-wide dump (not scoped to the selected location); Product Group Name is free text and is not asserted for content |

**Expected**: Every row in the downloaded file has the full 9-column shape, a numeric Location Id and Product Group Id, a supported Currency (USD/CAD/MXN), 0/1 values in the Is Labor and Is Active flag columns, an always-populated Current Price money value, an Override Price that is either blank or a money value, and an Override Discount that is either blank or a plain decimal. The file is a tenant-wide dump (not scoped to the selected location); Product Group Name is free text and is not asserted for content.
**Data**: location=1606 (trigger only; the file itself spans all locations)

---

## TC-CPR-OVR-061: A blank Override Price renders as an em-dash in a muted style, not an empty cell
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1115 selected (Equipment tab); row "01D Double Screen Set Kit" carries a blank Override Price.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Find the row "01D Double Screen Set Kit" | The row "01D Double Screen Set Kit" is displayed in the grid. |
| 2 | Read its Override Price cell text → exactly "—" (em-dash), NOT an empty string | The Override Price cell displays an em-dash. |
| 3 | Read the cell markup → the muted-style placeholder span is present | A blank/never-set Override Price renders the muted em-dash placeholder. Asserting empty-string would pass on the wrong render - the test asserts the em-dash explicitly (read-only bed; no mutation) |

**Expected**: A blank/never-set Override Price renders the muted em-dash placeholder. Asserting empty-string would pass on the wrong render — the test asserts the em-dash explicitly (read-only bed; no mutation).
**Data**: office=1115; row PG 286 "01D Double Screen Set Kit"; expected text "—"

---

## TC-CPR-OVR-066: Override Price rejects negative input (−5) with full rejection oracle
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '-5')` | The value -5 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert full rejection signature BEFORE escape: committed=false, aria-invalid=true, border-color oklch(0.577 0.245 27.325), errorText empty, Save disabled, escapable=true | -5 is rejected - the editor stays open, is invalid, red border, Save disabled. No error message is announced ([ ] displayed text is empty - defect #4). The editor is escapable via Tab (NOT a focus trap) |

**Expected**: `-5` is rejected — the editor stays open, `aria-invalid="true"`, red border, Save disabled. No error message is announced (`[role="alert"]` displayed text is empty — defect #4). The editor is escapable via Tab (NOT a focus trap).
**Data**: office=4107, product group=4298, field=Override Price, input=`-5`

---

## TC-CPR-OVR-067: Override Price rejects below-min boundary (−0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '-0.01')` | The value -0.01 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert rejection: committed=false, aria-invalid=true, Save disabled | -0.01 (BVA: smallest step below zero) is rejected with the standard rejection signature - editor keeps -0.01, Save DISABLED |

**Expected**: `-0.01` (BVA: smallest step below zero) is rejected with the standard rejection signature — editor keeps `-0.01`, Save DISABLED.
**Data**: office=4107, product group=4298, field=Override Price, input=`-0.01`

---

## TC-CPR-OVR-068: Override Price accepts 3rd-decimal precision (0.001)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '0.001')` | The value 0.001 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, observe displayedValue | 0.001 commits (editor closes). "Pending verification" - decimal inputs are accepted per existing TCs; the exact display format for 3-decimal precision has not been confirmed (likely 0.00 due to 2-decimal rendering) |

**Expected**: `0.001` commits (editor closes). **Pending verification** — decimal inputs are accepted per existing TCs; the exact display format for 3-decimal precision has not been confirmed (likely `0.00` due to 2-decimal rendering).
**Data**: office=4107, product group=4298, field=Override Price, input=`0.001`

---

## TC-CPR-OVR-069: Override Price accepts large value — no hard upper max (999999)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '999999')` | The value 999999 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, saveEnabled=true | 999999 commits - the Override Price field has no hard upper maximum. Save enables (value changed from baseline 152.00) |

**Expected**: `999999` commits — the Override Price field has no hard upper maximum. Save enables (value changed from baseline 152.00).
**Data**: office=4107, product group=4298, field=Override Price, input=`999999`

---

## TC-CPR-OVR-070: Defect — Override Price silently commits 1.2.3 as 1.23 (multi-dot corruption)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '1.2.3')` (real keyboard input — browser swallows second dot) | The characters 1.2.3 are typed into the Override Price field and Enter is pressed. |
| 3 | Assert the DEFECT: committed=true, displayedValue=`1.23`, saveEnabled=true | The value commits as 1.23, the editor closes, and the Save button becomes enabled. |
| 4 | **Expected (asserting the BUG — test FAILS when app is fixed)**: `1.2.3` commits as `1.23` — the browser swallows the second decimal point and the app accepts the resulting value without rejection. When fixed, this input should be rejected (multi-dot is not a valid number). Failure signal: `committed` becomes `false` or `displayedValue` changes. | The defect is documented: the app accepts 1.2.3 as 1.23 instead of rejecting the malformed multi-dot input. |

**Data**: office=4107, product group=4298, field=Override Price, input=`1.2.3`

---

## TC-CPR-OVR-071: Override Price with leading zeros (007) — zeros stripped
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '007')` | The value 007 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, observe displayedValue | 007 commits with leading zeros stripped - displays as 7.00 (no % suffix). Save ENABLED |

**Expected**: `007` commits with leading zeros stripped — displays as `7.00` (no `%` suffix). Save ENABLED.
**Data**: office=4107, product group=4298, field=Override Price, input=`007`

---

## TC-CPR-OVR-072: Override Price with scientific notation (1e5)
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '1e5')` | The value 1e5 is entered into the Override Price field and Enter is pressed. |
| 3 | Observe whether committed or rejected | 1e5 commits on Override Price - displays as 100,000.00. Save ENABLED. Max Discount % rejects 1e5 because the >100 cap fires, not because the app refuses scientific notation; Override Price has no such cap, so it accepts the value |

**Expected**: `1e5` commits on Override Price — displays as `100,000.00`. Save ENABLED. Max Discount % rejects `1e5` because the >100 cap fires, not because the app refuses scientific notation; Override Price has no such cap, so it accepts the value.
**Data**: office=4107, product group=4298, field=Override Price, input=`1e5`

---

## TC-CPR-OVR-073: Max Discount % accepts mid-range value (50)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', '50')` | The value 50 is entered into the Max Discount % field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue=`50.00 %`, saveEnabled=true | 50 commits and displays as 50.00 %. Save enables (changed from baseline) |

**Expected**: `50` commits and displays as `50.00 %`. Save enables (changed from baseline `—`).
**Data**: office=4107, product group=4298, field=Max Discount %, input=`50`

---

## TC-CPR-OVR-074: Max Discount % rejects below-min boundary (−0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', '-0.01')` | The value -0.01 is entered into the Max Discount % field and Enter is pressed. |
| 3 | Assert rejection: committed=false, aria-invalid=true, Save disabled | -0.01 (BVA: smallest step below the 0% floor) is rejected - editor keeps -0.01, Save DISABLED |

**Expected**: `-0.01` (BVA: smallest step below the 0% floor) is rejected — editor keeps `-0.01`, Save DISABLED.
**Data**: office=4107, product group=4298, field=Max Discount %, input=`-0.01`

---

## TC-CPR-OVR-075: Defect — 0.5 in Max Discount % displays as 50.00 % (100× multiplier bug)
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', '0.5')` | The value 0.5 is entered into the Max Discount % field and Enter is pressed. |
| 3 | Assert the DEFECT: committed=true, displayedValue=`50.00 %`, saveEnabled=true | The value commits and displays as 50.00 %, and the Save button becomes enabled. |
| 4 | **Expected (asserting the BUG — test FAILS when app is fixed)**: | The 100x multiplier defect is documented: 0.5 is interpreted as fifty percent instead of half a percent. |
| 5 | Typing `0.5` into the Max Discount % field commits and displays as `50.00 %`. This is a **100× multiplier bug**: a user intending a half-percent discount cap (0.5%) silently gets a fifty-percent cap. The same stored value is produced by typing `50`, so two fundamentally different business intents collapse to one stored number — with direct money impact. | The stored value for 0.5 matches the stored value produced by typing 50, confirming the two intents collapse to one number. |
| 6 | **When the app is fixed**: `displayedValue` will become `0.50 %` (the correct interpretation of 0.5 as a percentage). The test will FAIL on the `expect(result.displayedValue).toBe('50.00 %')` line, and the failure message will show `Expected: "50.00 %" / Received: "0.50 %"` — making the fix immediately visible. | The comparison against the corrected display value of 0.50 % is recorded so a future fix is caught immediately. |

**Data**: office=4107, product group=4298, field=Max Discount %, input=`0.5`

---

## TC-CPR-OVR-076: Max Discount % accepts just-below-cap boundary (99.99)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', '99.99')` | The value 99.99 is entered into the Max Discount % field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue=`99.99 %` | 99.99 commits and displays as 99.99 % (BVA: just below the inclusive 100 cap). Save ENABLED |

**Expected**: `99.99` commits and displays as `99.99 %` (BVA: just below the inclusive 100 cap). Save ENABLED.
**Data**: office=4107, product group=4298, field=Max Discount %, input=`99.99`

---

## TC-CPR-OVR-077: Max Discount % rejects above-cap (100.01) with full oracle — supersedes skipped TC-023
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', '100.01')` | The value 100.01 is entered into the Max Discount % field and Enter is pressed. |
| 3 | Assert full rejection signature BEFORE escape: committed=false, aria-invalid=true, border-color oklch(0.577 0.245 27.325), errorText empty, Save disabled, escapable=true | 100.01 (BVA: first value above the inclusive-100 cap) is rejected - editor stays open, is invalid, red border, Save disabled. "Bug-evidence: no error message" - [ ] displayed text is empty (defect #4: the screen has the mechanism to announce errors and never does). The editor IS escapable (Tab moves focus out - NOT a focus trap, cross-vendor verified). This supersedes the previously-skipped TC-CPR-OVR-023 whose skip reason ("intended behaviour unknown") is now dead - the contract is established |

**Expected**: `100.01` (BVA: first value above the inclusive-100 cap) is rejected — editor stays open, `aria-invalid="true"`, red border, Save disabled. **Bug-evidence: no error message** — `[role="alert"]` displayed text is empty (defect #4: the screen has the mechanism to announce errors and never does). The editor IS escapable (Tab moves focus out — NOT a focus trap, cross-vendor verified). This supersedes the previously-skipped TC-CPR-OVR-023 whose skip reason ("intended behaviour unknown") is now dead — the contract is established.
**Data**: office=4107, product group=4298, field=Max Discount %, input=`100.01`

---

## TC-CPR-OVR-078: Defect — abc blanks Max Discount % to em-dash with Save enabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', 'abc')` | The characters abc are entered into the Max Discount % field and Enter is pressed. |
| 3 | Assert the DEFECT: committed=true, displayedValue=`—`, saveEnabled=true | The cell blanks to an em-dash, the editor closes, and the Save button stays enabled. |
| 4 | **Expected (asserting the BUG — test FAILS when app is fixed)**: | The defect is documented: non-numeric input blanks the cell instead of being rejected. |
| 5 | `abc` commits (editor closes) and blanks the cell to `—`. Save stays ENABLED despite the displayed value matching the original baseline (`—`). Two bugs: (1) non-numeric input should be rejected, not committed | The cell displays an em-dash after the non-numeric entry, with the value neither rejected nor retained. |
| 6 | (2) Save enables on what is effectively an unchanged result (baseline was already `—`). When fixed, `committed` will become `false` (proper rejection) and/or `saveEnabled` will become `false`. | The Save button stays enabled even though the displayed value matches the original baseline. |

**Data**: office=4107, product group=4298, field=Max Discount %, input=`abc`

---

## TC-CPR-OVR-079: Defect — 1.2.3 in Max Discount % silently commits as 1.23 %
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', '1.2.3')` (real keyboard input) | The characters 1.2.3 are typed into the Max Discount % field and Enter is pressed. |
| 3 | Assert the DEFECT: committed=true, displayedValue=`1.23 %`, saveEnabled=true | The value commits as 1.23 %, the editor closes, and the Save button becomes enabled. |
| 4 | **Expected (asserting the BUG — test FAILS when app is fixed)**: `1.2.3` commits as `1.23 %` — the browser swallows the second dot during real keyboard typing, producing a plausible-looking but corrupted value. No warning, no rejection. Note: Override Price renders the same bug as `1.23` (no `%` suffix) — the two fields format differently. When fixed, this input should be rejected. | The defect is documented: the app accepts 1.2.3 as 1.23 % instead of rejecting the malformed multi-dot input. |

**Data**: office=4107, product group=4298, field=Max Discount %, input=`1.2.3`

---

## TC-CPR-OVR-080: Max Discount % rejects scientific notation (1e5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', '1e5')` | The value 1e5 is entered into the Max Discount % field and Enter is pressed. |
| 3 | Assert rejection: committed=false, aria-invalid=true, Save disabled | 1e5 is rejected - the editor stays open, is invalid, Save disabled. Verified on Equipment Max Discount % |

**Expected**: `1e5` is rejected — the editor stays open, `aria-invalid="true"`, Save disabled. Verified on Equipment Max Discount %.
**Data**: office=4107, product group=4298, field=Max Discount %, input=`1e5`

---

## TC-CPR-OVR-081: Max Discount % strips leading zeros (007 → 7.00 %)
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `probeEditOracle(row, 'maxDiscount', '007')` | The value 007 is entered into the Max Discount % field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue=`7.00 %`, saveEnabled=true | 007 commits as 7.00 % - leading zeros are stripped. Save enables |

**Expected**: `007` commits as `7.00 %` — leading zeros are stripped. Save enables.
**Data**: office=4107, product group=4298, field=Max Discount %, input=`007`

---

## TC-CPR-OVR-082: Max Discount % revert-to-original disables Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active. Max Discount % baseline is `—` (empty).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Call `editAndRevertToOriginal(row, 'maxDiscount', '50', '')` | The value 50 is entered, then the field is cleared and reverted to the original empty value. |
| 3 | Assert saveEnabledAfterEdit=true, saveDisabledAfterRevert=true | Editing Max Discount % to 50 enables Save; reverting to the original empty value via Ctrl+A -> Delete -> Enter disables Save (true revert-to-original confirmed, no net change) |

**Expected**: Editing Max Discount % to `50` enables Save; reverting to the original empty value via `Ctrl+A` → `Delete` → `Enter` disables Save (LR-009 — true revert-to-original confirmed, no net change).
**Data**: office=4107, product group=4298, field=Max Discount %, editValue=`50`, originalValue=``

---

## TC-CPR-OVR-083: Active toggle-then-revert disables Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active. Active baseline is checked (true).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 4107, Equipment tab, find row PG 4298 | Office 4107 loads on the Equipment tab with row PG 4298 visible. |
| 2 | Toggle the Active checkbox (uncheck) → Save enables | The Active checkbox becomes unchecked and the Save button becomes enabled. |
| 3 | Toggle the Active checkbox again (recheck to original) → Save disables | Toggling Active away from its saved state enables Save; toggling it back to the original state disables Save (no net change, no save needed) |

**Expected**: Toggling Active away from its saved state enables Save; toggling it back to the original state disables Save (LR-009 — no net change, no save needed).
**Data**: office=4107, product group=4298, field=Active, baseline=checked

---

## TC-CPR-OVR-117: Import rejects a CSV with an empty Override Price — whole-file rejection (known defect)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-033
**Automatable**: Yes — pending live verification of the exact rejection mechanism
**Surface_Family**: launcher (QUICK)

**Preconditions**: On the Override screen with office 1606 selected; the import dialog open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Import dialog via the toolbar "Import" button | The Import dialog opens. |
| 2 | Prepare and attach a CSV file containing at least one row with an empty Override Price cell (the minimum reproduction for this known defect) | The file is attached and the Upload button becomes enabled. |
| 3 | The upload fires (auto-submit on file-choose per agent-mistakes.md:206) → capture the server response | The upload request fires automatically. |
| 4 | Assert: the import is REJECTED (not success) | The import is rejected. |
| 5 | the grid is unchanged (no rows modified) | The grid rows remain unchanged. |
| 6 | a rejection indicator is visible (error message or the dialog remains open with an error state) | A rejection indicator is visible on screen confirming the import was not successful. |

"Pending verification": The exact rejection mechanism (HTTP status, error message wording, dialog behavior on rejection) has not been live-verified for this specific defect. The reported symptom may differ from reality. The structural assertion (rejection = no mutation) is safe; the specific error-message wording has not been confirmed.

**Expected**: A CSV with an empty Override Price causes the entire file to be rejected — no partial import, no silent truncation. This is a known filed defect (unfixed). The test asserts the rejection and confirms zero mutation.

**Pending verification**: The exact rejection mechanism (HTTP status, error message wording, dialog behavior on rejection) has not been live-verified for this specific defect. The reported symptom may differ from reality (per agent-mistakes.md:208-210). The structural assertion (rejection = no mutation) is safe; the specific error-message wording has not been confirmed.
**Data**: office=1606; defect NM-1940

---

## TC-CPR-OVR-118: Tab-switch from dirty Equipment grid to Labor — unsaved changes persists without a guard dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-018
**Automatable**: Yes — pending live verification of tab-switch dirty behavior
**Surface_Family**: persistence (QUICK)

**Preconditions**: On the Override screen with office 1606 selected; Equipment tab active; grid clean (Save disabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit the anchor row (PG 2609) Override Price to a different value → Save enables (Equipment grid dirty) | The new value commits to the Override Price cell and the Save button becomes enabled. |
| 2 | Click the Labor tab → observe: does the "Unsaved changes" dialog fire? | The Labor tab becomes active with no dialog shown. |
| 3 | Assert: NO dialog fires (tab-switch is within the same page/URL — not a navigation event) | No unsaved-changes dialog is displayed. |
| 4 | Click back to the Equipment tab → read the anchor row value and Save button state | The Equipment tab becomes active again. |
| 5 | Assert: the staged edit is still present | The staged Override Price edit is still displayed on the anchor row. |
| 6 | Save is still enabled (unsaved changes preserved across tab round-trip) | Save remains enabled confirming the unsaved changes persisted across the tab round-trip. |

"Pending verification": The tab-switch dirty behavior was identified as a gap during the live walk ("state preserved? No TC covers this transition") but was not itself probed live. The expectation (no dialog, state preserved) is the architecturally likely behavior but unconfirmed.

**Expected**: Switching tabs on the same Override page does not trigger the unsaved-changes guard (the URL does not change). The Equipment grid's unsaved changes persists through a Labor-tab visit and is intact on return. This is a persistence (SBC) assertion, not a guard assertion.

**Pending verification**: The tab-switch dirty behavior was identified as a gap during the live walk ("state preserved? No TC covers this transition") but was not itself probed live. The expectation (no dialog, state preserved) is the architecturally likely behavior but unconfirmed.
**Data**: office=1606; anchor PG 2609; tab sequence Equipment→Labor→Equipment

---

## TC-CPR-OVR-120: Tab-switch from dirty Labor grid to Equipment — unsaved changes persists without a guard dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-053
**Automatable**: Yes — pending live verification of tab-switch dirty behavior
**Surface_Family**: persistence (QUICK)

**Preconditions**: On the Override screen with office 1134 selected; Labor tab active; grid clean (Save disabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit Labor row PG 565 Override Price to a different value (e.g. 14) → Save enables (Labor grid dirty) | The new value commits to the Override Price cell and the Save button becomes enabled. |
| 2 | Click the Equipment tab → observe: no "Unsaved changes" dialog fires | The Equipment tab becomes active with no dialog shown. |
| 3 | Click back to the Labor tab → read row PG 565 value and Save button state | The Labor tab becomes active again. |
| 4 | Assert: the staged edit is still present | The staged Override Price edit is still displayed on row PG 565. |
| 5 | Save is still enabled (unsaved changes preserved across tab round-trip) | Save remains enabled confirming the unsaved changes persisted across the tab round-trip. |

"Pending verification": Same as D-07 — tab-switch dirty behavior not live-verified.

**Expected**: Mirrors TC-CPR-OVR-D-07 for the Labor→Equipment direction. Tab-switching does not trigger the nav-away guard and unsaved changes persists across the round-trip.

**Pending verification**: Same as D-07 — tab-switch dirty behavior not live-verified.
**Data**: office=1134; Labor tab; anchor PG 565; tab sequence Labor→Equipment→Labor

---

## BLOCKED SLOTS

### OVR-CUR-3 / OVR-CUR-4 / OVR-CUR-5 — Currency filter (3 slots) — BLOCKED

**Reason**: Every known office with Override rows (1105, 1106, 1107, 1115, 1134, 1606, 4107, 9460) carries only USD-currency rows. No multi-currency office has been found. A test asserting "USD filter yields only USD rows" on a single-currency grid passes trivially — it cannot distinguish a working filter from a filter that does nothing.

**Named unlock**: An office whose Override grid carries rows in ≥2 currencies (e.g., both USD and CAD rows). With such an office, the 3 slots would be: (1) select USD → only USD rows visible, (2) select CAD → only CAD rows visible, (3) select a currency with 0 rows → 0 rows shown.

---

### OVR-RPP-2 / OVR-RPP-4 / OVR-RPP-5 / OVR-RPP-6 — Rows-per-page per-option (4 slots) — BLOCKED

**Reason**: Office 1606 (Equipment tab) has 7 rows. The minimum rows-per-page option is 10. All options (10/20/30/40/50) show all 7 rows regardless of selection. A test asserting "select 10 → grid shows ≤10 rows" passes trivially when total=7. This violates the constraint: "never write a test that passes trivially on data that cannot exercise it."

TC-059 already covers the one meaningful assertion available today (20→50 shows more rows on office 9460 which has 212 rows), but my assigned office (1606) cannot exercise per-option assertions.

**Named unlock**: Authorize an office with >50 rows (e.g., office 9460 Labor with 212 rows) for per-option row-count verification. With such an office, the 4 slots would be: (1) select 10 → ≤10 rows visible, (2) select 30 → ≤30, (3) select 40 → ≤40, (4) select 50 → ≤50.

---

### OVR-IMP-3 — Import valid CSV stalls at 50% (NM-2186) — BLOCKED

**Reason**: NM-2186 describes a valid CSV that stalls at 50% in the UI while applying server-side. Per the ticket: "This rewrites every row of an office. Only automate it against a designated e2e office with a verified restore step." No restore step for a full-import overwrite has been established in the repo. Additionally, per agent-mistakes.md:208-210, import write semantics are "per-LOCATION replace" (not per-row upsert) — a successful import DELETES omitted rows. Automating without a verified restore risks irreversible data loss on the shared environment.

**Named unlock**: (1) A designated throwaway e2e office with a verified restore CSV (full row set that can be re-imported to undo the test), AND (2) live verification of the stall behavior (HTTP status, timeout threshold, UI state during stall).

---

## TC-CPR-OVR-138: The export tolerates rows with no Override Price and never drops them
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-038
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Export and capture the CSV | The CSV file downloads. |
| 2 | Read the Override Price column from every data row | The Override Price values are displayed for every data row in the file. |
| 3 | Count the blank values | The file is allowed to contain rows with no Override Price and they are never dropped, while the vast majority of rows do carry one. Asserting the current contract rather than the desired one: the app's own import rejects these rows, so a test demanding a price on every row would fail on every run today |

**Expected**: The file is allowed to contain rows with no Override Price and they are never dropped, while the vast majority of rows do carry one. Asserting the current contract rather than the desired one: the app’s own import rejects these rows, so a test demanding a price on every row would fail on every run today.
**Data**: blank Override Price rows tolerated but fewer than the total

---

## TC-CPR-OVR-152: Raw export with an empty Override Price row is rejected and changes nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present with its baseline Override Price. The raw tenant-wide export still contains one empty-Override-Price row.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Capture the target row's Override Price before the import | The target row's Override Price is displayed. |
| 2 | Export the tenant-wide CSV and confirm it still carries the empty-Override-Price row | The downloaded CSV file still contains the row with an empty Override Price. |
| 3 | Open the Import dialog → attach the raw unmodified export → click Upload | The Import dialog opens. |
| 4 | Read the rejection alert → matches "Error Row#:N, Msg: LocationId, ProductGroupId, OverridePrice is required." | A required-field rejection alert is displayed. |
| 5 | Reload + re-select office 4107 and re-read the grid | The raw export is rejected on its empty-Override-Price row and the whole import aborts with no partial apply (full rollback). The target Override Price is unchanged after a reload. Documents the live regression where a freshly exported file cannot be re-imported without first removing its empty-price row. The row number is data-position-dependent, so the stable required-field message is asserted, not a fixed position |

**Expected**: The raw export is rejected on its empty-Override-Price row and the whole import aborts with no partial apply (full rollback). The target Override Price is unchanged after a reload. Documents the live regression where a freshly exported file cannot be re-imported without first removing its empty-price row. The row number is data-position-dependent (observed at Row#:19), so the stable required-field message is asserted, not a fixed row index.
**Data**: office=4107; empty-price row prefix "1115,286,"; reject pattern=/Error Row#:\d+, Msg: LocationId, ProductGroupId, OverridePrice is required\./

---

