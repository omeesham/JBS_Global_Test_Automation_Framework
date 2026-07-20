# Corporate Pricing — Product Group Override Test Cases (NM-1463, Wave-1.5-A FCC)

**Module**: corporate-pricing | **Total**: 49 (TC-023 skipped — app defect; TC-041 skipped — RBAC blocked; TC-043 skipped — data-blocked) | **Status**: Automated | **Updated**: 2026-07-18

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
| **Edit mechanism (Q-WV15-1 RESOLVED)** | Click the Override Price / Max Discount `div[role=button]` cell → active `spinbutton` → **native value-setter** (React-controlled; `.fill()` does not commit) + **`Enter`** → Save enables. Active = Radix `checkbox` (LR-036 4th render) toggles + dirties. **Recon's "inert cells" was a FALSE NEGATIVE.** |
| Save | dialog-gated "Save Changes" alertdialog (`Are you sure you want to save the changes?`) → **`POST /navigator/api/location/corporate-price-pg-override`** (LR-056 — NOT the page-URL RSC POSTs) → toast "Pricing overrides saved successfully." |
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
| Q-WV15-1 (item 5) | edit mechanism / possible RBAC (NM-2126) | click-to-edit cell → spinbutton → native-set + Enter; automation user edits + saves | **RESOLVED** — not RBAC-blocked; full save-cycle FCC automatable |
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
| Currency filter | Radix combobox | `ALL` | enabled | ALL/USD/CAD/MXN (TC-CPR-OVR-009) |
| Active only | Radix checkbox | OFF | enabled | toggles (TC-CPR-OVR-010) |
| Filter Product Groups Override | text input | `""` | enabled | client-side; matches ID + Name only (TC-CPR-OVR-012..016) |
| Override Price | `div[role=button]` → `spinbutton` | e.g. `445.00` | **editable** | native-set + Enter; numeric (TC-CPR-OVR-017..022) |
| Max Discount % | `div[role=button]` → `spinbutton` | `—` (unset) | **editable** | numeric %, renders "N.00 %"; a value >100 currently will not commit and the field shows no error / traps focus — defect under review (TC-CPR-OVR-023 parked, BUG-CPR-OVR-001) |
| Active (cell) | Radix `checkbox` (`aria-checked`) | per row | **editable** | LR-036 4th render; toggles + dirties (TC-CPR-OVR-007/024/027) |
| Current Price | read-only `<td>` | `0.00` | read-only | displayed (NM-1870 not-reproduced, TC-CPR-OVR-006) |
| Mod Date / Updated By | read-only `<td>` | volatile | read-only | assert by pattern, not value |
| Save | button | disabled | enables on dirty | dialog-gated; net-zero disables (TC-CPR-OVR-018/019/028) |
| Rows per page | Radix combobox | `20` | enabled | 10/20/30/40/50 (TC-CPR-OVR-011) |

## Validation Rules

- **Edit**: click cell → spinbutton; commit on Enter (native value-setter required; `.fill()` no-ops React state).
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
1. Navigate to the Product Group Override screen -> Page loads on `/pg-override`
2. Read the active tab -> "Equipment" is selected by default

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
1. Click the Labor tab -> `aria-selected` flips to Labor
2. Click the Equipment tab -> `aria-selected` flips back to Equipment

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
1. Open the Override screen without selecting a location -> "No results." is shown
2. Read the grid -> zero data rows; the "Select a location" card is visible

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
1. Open the "Select a location" picker, search 1604, check the row, click Select -> Grid loads
2. Read the grid -> rows > 0; the anchor "House Video Monitor - Specialty" is present

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
1. Read the grid column headers -> Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By

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
1. Read the Current Price cell of the anchor row -> a numeric value (e.g. "0.00")

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
1. Read the Active cell of the anchor row via `aria-checked` -> resolves to a real boolean

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
1. Switch to the Labor tab -> active tab = Labor
2. Read the grid -> 0 rows; the column headers still render

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
1. Open the Currency filter -> options render
2. Read the option list -> ALL, USD, CAD, MXN

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
1. Read the Active-only checkbox -> unchecked (default OFF)
2. Toggle it on -> checked; toggle it off -> unchecked

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
1. Open the rows-per-page control -> options render
2. Read the list -> 10, 20, 30, 40, 50

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
1. Type "House Video" into the "Filter Product Groups Override..." input -> grid narrows
2. Read the grid -> rows > 0 and <= the unfiltered count; the anchor row is present

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
1. Type the Product Group ID "2605" into the filter -> grid narrows
2. Read the grid -> the anchor row is present; rows > 0

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
1. Type a Currency value "USD" (present in every row's Currency column, no Product Group ID/Name) -> grid shows 0 rows
2. Clear the filter -> rows restore

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
1. Type a non-matching term -> grid shows 0 rows
2. Clear the filter -> rows restore (> 0)

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
1. Type whitespace-only and special characters into the filter -> no crash
2. Clear the filter -> rows restore

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
1. Click the Override Price cell of the anchor row -> a numeric editor (spinbutton) reveals
2. Read the editor value, then press Escape (no change) -> editor exposes the current value (445)

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
1. Edit the Override Price to a new value and commit (Enter) -> cell updates
2. Observe the Save button -> Enabled

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
1. Edit the Override Price to a new value -> Save enabled
2. Edit it back to the original saved value -> Save disabled

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
1. Edit the Override Price to a decimal (e.g. 123.45) and commit -> cell shows the decimal; Save enabled

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
1. Edit the Override Price to 0 -> cell shows 0
2. Edit it to a large number (e.g. 999999) -> cell shows the value

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
1. Open the Override Price editor and attempt to enter alphabetic text ("abc") -> the numeric input retains no alphabetic characters

**Expected**: The Override Price field accepts numbers only — non-numeric text is rejected (cleared to empty); no letters are retained. The editor is closed with Escape (no commit).
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-023: Max Discount % — out-of-range (>100) handling
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
1. Edit the Max Discount % cell to a normal percentage (10) -> commits; Save enabled (renders "10.00 %")
2. Edit it to a decimal (12.5) -> commits
3. Attempt to set it to a value over 100 (e.g. 150 / 333), then try to click or tab out of the cell

**Expected**: A normal percentage (incl. decimals) commits and dirties the form. An out-of-range value (over 100) should surface a clear message and still let the user leave the field. Live on office 1606: over 100 sets the input invalid (aria-invalid + a red border) and refuses to commit — a real indicator, not silent — but the field does not recover cleanly (it will not dismiss on a click to another cell and leaves the cell blank), so an out-of-range entry wedges the row. Correct behavior is undefined until the app is fixed; kept skipped. The valid boundary (values up to and including 100) is covered by TC-CPR-OVR-037.
**Data**: location=1606, product group=2609

---

## TC-CPR-OVR-024: Toggling the Active checkbox dirties the form (Save enables)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
1. Read the anchor row's Active state, then click the Active checkbox -> `aria-checked` flips
2. Observe the Save button -> Enabled

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
1. (baseline) Ensure 2605 Override Price = 445.00
2. Edit Override Price to a new value -> Save enabled
3. Save -> "Save Changes" dialog -> confirm -> `POST corporate-price-pg-override` -> toast
4. Reload + re-select location -> the new value persists in the grid
5. (cleanup) Restore 2605 to 445.00 via `ensureDefaultState()`

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
1. (baseline) Ensure 2605 at default
2. Edit Max Discount % to a value -> Save enabled
3. Save -> dialog -> confirm -> reload + re-select -> the Max Discount value persists
4. (cleanup) Restore 2605 via `ensureDefaultState()`

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
1. (baseline) Ensure 2605 at default
2. Toggle the Active checkbox -> Save enabled
3. Save -> dialog -> confirm -> reload + re-select -> the toggled Active state persists
4. (cleanup) Restore 2605 Active via `ensureDefaultState()`

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
1. Edit the Override Price -> Save enabled
2. Click Save -> a "Save Changes" dialog appears ("Are you sure you want to save the changes?", Cancel/Save)
3. Click Cancel -> dialog closes; no commit
4. (cleanup) `ensureDefaultState()` reloads + restores

**Expected**: Save opens the shared "Save Changes" confirmation dialog; Cancel aborts without committing.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-029: The Search action bar "Pricing Override" button navigates to the Override screen
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated on the Corporate Pricing Search screen.

**Steps**:
1. Click the Search action bar "Pricing Override" button -> the app navigates to `/pg-override`
2. Read the URL and heading -> URL contains `/pg-override`; heading is "Product Group Override"

**Expected**: The "Pricing Override" action-bar button navigates from the Search screen to the Override screen.
**Data**: office context (default)

---

## TC-CPR-OVR-030: The "Change Local Office" picker gates Select until a row is checked; Cancel applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-003
**Automatable**: Yes

**Preconditions**: On the Override screen with no location selected.

**Steps**:
1. Open the "Select a location" picker -> the "Change Local Office" modal opens
2. Read the Select button before checking any row -> disabled
3. Search the office and check its row -> Select becomes enabled
4. Click Cancel -> the modal closes and the grid stays empty (no location applied)

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
1. Open Grid Options -> a toggle per column (all 10) renders, all checked; "Reset to Default" is present
2. Toggle the "Updated By" column off -> its header is removed from the grid
3. Reload the page and re-select the location -> the "Updated By" column is still hidden (server-persisted)
4. (baseline) Restore all columns before and after the test

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
1. Click the Override toolbar "Export" button -> a CSV file downloads directly (no Year/Currency dialog)
2. Read the download -> filename `ProductGroupOverrides_<timestamp>UTC.csv`; the request hits `corporate-price-pg-override/export?locale=en-US`; the file is a non-empty CSV with a header row

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
1. Click the Override toolbar "Import" button -> the "Import All Pricing Overrides" dialog opens
2. Read the dialog -> buttons Browse / Cancel / Upload / Close; a file input exists
3. Click Cancel -> the dialog closes (no file uploaded)

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
1. Set the anchor row inactive (staged only) -> Active reads false
2. Edit the Override Price to a new value -> Active flips to true automatically
3. Observe Save -> Enabled

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
1. Click a column header (e.g. "Product Group Name") -> no active sort state (`aria-sort` is not ascending/descending)
2. Read the first row before and after -> row order is unchanged

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
1. Read the Current Price cell of every visible row -> each contains a numeric value (never blank / missing)

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
1. Edit the Max Discount % to a normal percentage (10) -> commits
2. Edit it to the cap value (100) -> commits (the cap is inclusive); the cell shows "100.00 %"
3. Observe Save -> Enabled

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
1. Click the Override toolbar "Export" button -> a CSV file downloads
2. Read the header row -> the 9 columns are present (Location Id, Product Group Id, Product Group Name, Is Labor, Currency, Current Price, Override Price, Override Discount, Is Active)
3. Validate every data row against its column's expected format -> no offenders

**Expected**: Every row in the downloaded file has the full 9-column shape, a numeric Location Id and Product Group Id, a supported Currency (USD/CAD/MXN), 0/1 values in the Is Labor and Is Active flag columns, an always-populated Current Price money value, an Override Price that is either blank or a money value, and an Override Discount that is either blank or a plain decimal. The file is a tenant-wide dump (not scoped to the selected location); Product Group Name is free text and is not asserted for content.
**Data**: location=1606 (trigger only; the file itself spans all locations)

---

## TC-CPR-OVR-039: Typing a partial office number narrows picker rows; clearing restores the full list
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected.

**Steps**:
1. Open the Change Local Office picker dialog
2. Type "1107" into the "Search by Location Name, Number" textbox -> the table narrows to offices matching "1107"; at least one row with "1107" is visible
3. Clear the search box -> the table restores to show more rows than the narrowed set

**Expected**: The picker search box filters the location table client-side (no API call per keystroke). Typing a partial office number narrows the visible rows to matching entries; clearing the input restores the full list. Cancel closes the picker with no location applied to the grid.
**Data**: location=1606 (trigger); search needle "1107"

---

## TC-CPR-OVR-040: Picker Active checkbox defaults to unchecked; toggling is a client-side filter — no location-lookup server request fires on toggle
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected.

**Steps**:
1. Open the Change Local Office picker dialog — a location-lookup API call fires (positive control proving the network listener works); assert postFired=true and locationCount > 0
2. Assert: Active checkbox is UNCHECKED (aria-checked=false / data-state=unchecked) by default
3. Toggle Active to CHECKED — assert NO location-lookup API call fires (toggle is a client-side filter; server ignores activeOnly parameter); assert checkbox is CHECKED; assert row list still renders rows
4. Search "1107" while Active is CHECKED — list narrows to matching offices (search and Active compose)
5. Clear search; toggle Active back to UNCHECKED — assert still NO location-lookup API call fires; assert checkbox is UNCHECKED; assert rows visible
6. Cancel -> the original 1606 grid is unaffected (no new location applied)

**Expected**: Opening the picker fires a location-lookup API call (positive control). Toggling the Active checkbox is a client-side filter — no location-lookup API call fires on toggle (server ignores the activeOnly parameter; both checked and unchecked return the same 2,651 active-only location set). Default state is UNCHECKED. Search composes with the Active filter. This test fails when the app is fixed to honor activeOnly server-side (the postFired=false assertions flip).

Note: BUG-CONFIRMED-B — activeOnly ignored server-side (1222 evidence walk-evidence-F); open fires a POST (positive control), toggle fires 0 POSTs (reviewer-confirmed attempt 4). On fix, flip the postFired assertions to toBe(true) and assert that unchecked -> inactive offices appear and checked -> they are hidden.
**Data**: location=1606 (trigger)

---

## TC-CPR-OVR-041: Non-Revenue-Management user sees a read-only Override grid — no edit, no Save, no Import
| Priority | Status | Type |
|----------|--------|------|
| High | Skipped (blocked) | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes — pending a second test account with a non-RM role

**Preconditions**: Logged in as a non-Revenue-Management user.

**Steps**:
1. Navigate to the Corporate Pricing Override screen
2. Attempt to click an Override Price cell -> no spinbutton editor reveals (cell is inert)
3. Observe the Save button -> absent or permanently disabled
4. Observe the Import button -> absent or disabled

**Expected**: A non-Revenue-Management user cannot edit Override cells, trigger Save, or access Import. The grid renders in read-only mode (Revenue Management role required for edit access).

**Blocked reason**: blocked-pending-question: RBAC-role-switch — the automation environment provisions a single account with full edit rights; no in-app role-switch is available. Test is authored but `.skip`-annotated until a second non-RM account is provisioned.
**Data**: non-RM test account (not yet provisioned)

---

## TC-CPR-OVR-042: Active-only removes inactive rows and restores the full set on uncheck
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-010
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; Active-only is OFF (default).

**Steps**:
1. Read Active-only state and row count → Active-only is unchecked; 9 rows visible
2. Check Active-only → row count drops to 7; the Camlok #1 and Camlok #2 rows are absent
3. Uncheck Active-only → 9 rows restored; both Camlok rows are visible again

**Expected**: Checking Active-only filters the grid to the 7 active rows (removes the 2 inactive product groups Camlok #1 and Camlok #2). Unchecking restores all 9 rows. The identity delta — which specific rows disappear — is asserted in both directions.
**Data**: office=1105 (9 total / 7 active / 2 inactive: Product Groups 1482 and 1484)

---

## TC-CPR-OVR-043: Currency filter yields the exact row count for the present currency, 0 for an absent currency, and restores the full set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-009
**Automatable**: Yes

**Preconditions**: On the Override screen with the standard test office selected.

**Steps**:
1. Select the currency present in the data (USD) from the Currency dropdown → grid shows the full expected row count
2. Select a currency with no matching rows → grid shows zero rows
3. Select ALL → full row set restores

**Expected**: Selecting the present currency yields the exact expected row count; selecting a currency with no matching rows yields exactly 0; selecting ALL restores the full set. Asserting both directions proves the filter reads its input — a filter that ignored the selection could not satisfy both the exact-count and the zero-count assertion.

**Note**: The available corporate-group offices carry USD-only override rows (1101 = 0 rows; 1105/1606/1107 all USD — verified during the sprint walk), so cross-currency narrowing (USD → CAD) cannot be exercised. The absent-currency → 0 assertion covers the same behavior from the reachable direction. A multi-currency office would allow the stronger cross-currency form.
**Data**: `CORP_PRICING_OVERRIDE_ACTIVE_BED` (standard test office)

---

## TC-CPR-OVR-044: Active-only and text filter applied simultaneously produce the correct intersection; filter order does not affect the result; resetting all restores the full row set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-042
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; no filters active.

**Steps**:
1. Filter by text "Camlok" → 2 rows (both inactive)
2. Check Active-only on top → 0 rows (intersection: Camlok rows are inactive, filtered out)
3. Reset both filters → 9 rows restored
4. Check Active-only first → 7 rows; then filter "Camlok" on top → 0 rows (same intersection as step 2 — order independent)
5. Uncheck Active-only while "Camlok" text filter active → 2 rows (inactive Camlok rows visible again)
6. Clear text filter → 9 rows fully restored

**Expected**: The Active-only and text filter combine correctly regardless of application order (order independence). The intersection of "Camlok" text filter + Active-only is 0 rows because both Camlok product groups are inactive. Resetting each filter independently produces the expected intermediate counts; clearing all filters fully restores the 9-row set.
**Data**: office=1105; text filter needle "Camlok"

---

## TC-CPR-OVR-045: Text filter "Camlok" narrows the grid to matching rows; clearing restores the full set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-012
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; text filter is empty; all 9 rows visible.

**Steps**:
1. Read visible row count → 9 (walk-A certified for office 1105)
2. Type "Camlok" into the "Filter Product Groups Override..." text box → grid narrows to 2 rows (walk-A certified count)
3. Assert the two visible rows are "Camlok #1 - 50' (Set of 5 Conductors)" and "Camlok #2 - 10'" (specific product identities, not just count)
4. Clear the text filter → grid restores to 9 rows

**Expected**: Typing "Camlok" narrows the grid to exactly the 2 Camlok product rows. The specific row identities ("Camlok #1 - 50' (Set of 5 Conductors)" and "Camlok #2 - 10'") are confirmed, not just the count. Clearing the filter restores the full 9-row set.
**Data**: office=1105; filter needle "Camlok"; expected filtered count=2; Camlok row 1="Camlok #1 - 50' (Set of 5 Conductors)"; Camlok row 2="Camlok #2 - 10'"; expected restored count=9

---

## TC-CPR-OVR-046: Product Group Name column sort: ascending first cell matches walk oracle and order is non-decreasing; descending matches walk oracle and order is non-increasing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-005
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; grid showing 9 rows.

**Steps**:
1. Open the "Product Group Name" column header dropdown menu → click "Sort ascending"
2. Read the first cell of Product Group Name → "07A Compass Screen Set Kit" (walk-A certified)
3. Read all visible Product Group Name cells → values are non-decreasing
4. Open the header dropdown again → click "Sort descending"
5. Read the first cell → "Whiteboard Supply" (walk-A certified)
6. Read all visible Product Group Name cells → values are non-increasing

**Expected**: Sorting ascending puts "07A Compass Screen Set Kit" first and the full column is non-decreasing. Sorting descending puts "Whiteboard Supply - Marker 4 Pk" first and the full column is non-increasing. The sort mechanism is a header dropdown menu — not a header-click toggle.
**Data**: office=1105; ASC first cell "07A Compass Screen Set Kit"; DESC first cell "Whiteboard Supply - Marker 4 Pk" (confirmed via live run 2026-07-18)

---

## TC-CPR-OVR-047: Product Group column sort: ascending values are non-decreasing; descending values are non-increasing — self-verifying monotonic oracle
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-046
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; grid showing 9 rows.

**Steps**:
1. Open the "Product Group" column header dropdown menu → click "Sort ascending"
2. Read all visible Product Group cells → values are non-decreasing (monotonic ascending check, no hardcoded first cell)
3. Open the header dropdown again → click "Sort descending"
4. Read all visible Product Group cells → values are non-increasing (monotonic descending check)

**Expected**: The "Product Group" column (numeric product group IDs) sorts correctly in both directions via the same header dropdown mechanism confirmed in TC-CPR-OVR-046. Monotonic ordering is asserted numerically (not as strings, since the app sorts by numeric value — e.g. 2 before 10) without relying on any hardcoded first-cell value. Confirms the sort mechanism is consistent across columns.
**Data**: office=1105; second sortable column "Product Group" (column index 1); comparison is numeric

---

## TC-CPR-OVR-048: Hiding "Max Discount %" via Grid Options reduces visible column count; Reset to Default restores all columns
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-031
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; all 10 columns visible (restored by beforeEach/afterEach).

**Steps**:
1. Read visible column count → 10 (walk-A certified default)
2. Open Grid Options → toggle off "Max Discount %" → close Grid Options
3. Read visible column count → 9 (walk-A certified hidden count; "Max Discount %" header is absent)
4. Open Grid Options → click "Reset to Default" → close Grid Options
5. Read visible column count → 10 (all columns restored)

**Expected**: Hiding "Max Discount %" reduces the visible column count from 10 to 9. Clicking "Reset to Default" in Grid Options restores all 10 columns. The before/after column-count delta is asserted in both directions. beforeEach/afterEach restore all columns so the test is order-independent.
**Data**: office=1105; default column count=10; hidden column count=9; hidden column="Max Discount %"

---

## TC-CPR-OVR-049: Text filter and column sort applied together: filtered rows match the filter and are correctly ordered
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-045, TC-CPR-OVR-046
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; no filters active; all 9 rows visible.

**Steps**:
1. Apply text filter "Camlok" → 2 rows visible
2. Apply "Sort ascending" on the "Product Group Name" column → assert 2 rows still visible (filter survives the sort); assert every visible row's Product Group Name contains "Camlok" (case-insensitive); assert values are non-decreasing
3. Clear the text filter → 9 rows restored

**Expected**: Applying a text filter and a column sort simultaneously produces a result set that satisfies both constraints: every row matches the filter text (contains "Camlok"), the row count is 2, and the column order is non-decreasing. The filter survives the sort without resetting. Clearing the filter restores the full 9-row set.
**Data**: office=1105; filter needle "Camlok"; expected filtered+sorted count=2; every row name must contain "Camlok" (case-insensitive); expected restored count=9
