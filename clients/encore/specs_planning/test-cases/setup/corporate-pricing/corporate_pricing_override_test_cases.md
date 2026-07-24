# Corporate Pricing — Product Group Override Test Cases (NM-1463, Wave-1.5-A FCC)

**Module**: corporate-pricing | **Total**: 127 (TC-041 skipped — RBAC blocked; TC-043 skipped — data-blocked) | **Status**: Automated | **Updated**: 2026-07-20

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

## TC-CPR-OVR-023: Max Discount % rejects above-cap (100.01) with full rejection oracle
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', '100.01')`
3. Assert full rejection signature BEFORE escape: committed=false, aria-invalid=true, border-color oklch(0.577 0.245 27.325), errorText empty, Save disabled, escapable=true

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

---

## 2026-07-20 live verification (NM-2271 — populated Labor, save-cycles, dirty guard, pagination, NM-1932, picker drag)

| Field | Value |
|-------|-------|
| Date | 2026-07-20 |
| Labor mutation bed | Office **1105 Labor** — 2 rows: 655 "General - Ops" (160.00, inactive), 656 "General - Utility" (125.00, inactive). First Labor save commit in module history verified live: 160 → 161 → save POST 200 + success toast → persisted across reload → restored 160.00. Labor Active cell = checkbox read via aria-checked (per-tab boolean render). |
| Labor volume bed | Office **9460 Labor** — "212 items found", 20/page default, page 1 first row "Banners Design", page 2 first row "Candids Video Engineer - FULL DAY", last page holds the remainder; nav buttons carry aria-labels "Go to first/previous/next/last page" with end-state disabling; rows-per-page options 10/20/30/40/50, 20→50 shows 50 rows with the total unchanged. Sort dropdown (ascending/descending/hide) and the text filter both work on the Labor tab. |
| Unsaved-changes guard | In-app link navigation from a dirty grid raises the "Unsaved changes" alertdialog ("Are you sure you want to leave this view? Any unsaved changes will be lost.", Stay/Discard). **Stay verified live 2026-07-20** (previously unexercised): URL unchanged, staged edit intact, Save still enabled. Discard navigates away and drops the edit. A direct URL change fires the native leave-page prompt instead — specs must navigate via in-app links. |
| NM-1932 bed | Office **1115**, Product Group 286 "01D Double Screen Set Kit": blank Override Price renders "—" (em-dash) inside a muted span — textContent is NOT empty. |
| Keyboard access | Editable cells are focusable; **Enter** opens the numeric editor, **Escape** closes it without dirtying. **Gap (not automated)**: arrow keys do NOT move focus between cells (no grid-level keyboard navigation). **Defect-candidate**: both save dialogs render aria-hidden="true" while visually modal (invisible to assistive tech). |
| Picker drag bed | Office **4104** — Currency ALL: no picker. Currency USD: "Product Groups" picker panel + "Search product groups..." box with draggable rows (Equipment and Labor). Dragging a row stages it client-side (NO request until Save) at Override Price 0.00 / inactive, and enables Save. Discard drops the staged row. |
| Evidence | `_internal/walk-evidence-corporate-pricing-override-2026-07-20-SAVE.md` + `reports/walkthrough/nm2271-grid-equipment-labor.walkthrough.yaml` |

---

## TC-CPR-OVR-050: Labor tab renders a populated grid with real data on office 9460
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: On the Override screen with office 9460 selected; Labor tab active.

**Steps**:
1. Select office 9460 via the Change Local Office picker → switch to the Labor tab
2. Read the visible row count → greater than 0 (populated grid, not the empty state)
3. Read the "items found" total → greater than 100 (triple-digit data set)
4. Find the row "Banners Design" → present

**Expected**: The Labor tab renders a populated grid with real data: rows are visible, the items-found total is in the triple digits, and the known anchor row is present.
**Data**: office=9460; anchor row "Banners Design"; items-found floor=100

---

## TC-CPR-OVR-051: Labor grid text filter narrows to matching rows and clearing restores the page
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 9460 selected; Labor tab active; no filter applied.

**Steps**:
1. Read the visible row count (full page)
2. Type "Banners" into the filter box → row count narrows below the full page and stays above 0; the "Banners Design" row is visible
3. Clear the filter → the visible row count grows back above the narrowed count

**Expected**: The client-side text filter works identically on the Labor tab: it narrows the grid to matching rows and clearing it restores the fuller page. Relative row-count assertions only (no brittle totals).
**Data**: office=9460; filter needle "Banners"; anchor row "Banners Design"

---

## TC-CPR-OVR-052: Labor grid column sort orders Product Group Name ascending and descending
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 9460 selected; Labor tab active.

**Steps**:
1. Open the "Product Group Name" header dropdown → click "Sort ascending" → read every visible name → assert the sequence is non-decreasing (case-insensitive)
2. Open the header dropdown → click "Sort descending" → read every visible name → assert the sequence is non-increasing

**Expected**: The Labor grid sorts via the same header dropdown mechanism as Equipment. The oracle is self-verifying monotonic order — resilient to data drift on the shared bed.
**Data**: office=9460; column "Product Group Name"; live-probed 2026-07-20 (ASC first "AS - Floor Supervisor Triple Time", DESC first "Weeknight Shadow Labor" — recorded for reference, not asserted)

---

## TC-CPR-OVR-053: Labor Override Price save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1105 Labor row 655 "General - Ops" at its 160.00 baseline (per-test baseline restore enforces this).

**Steps**:
1. Baseline: restore row 655 to Override Price 160.00 / inactive (bounded-retry restore)
2. Edit Override Price to 161 → Save enables
3. Save → confirm the "Save Changes" dialog → success toast
4. Reload + re-select office 1105 + Labor tab → Override Price reads 161
5. Cleanup: restore 160.00 and verify the restore persisted

**Expected**: A Labor-tab Override Price edit commits through the same save pipeline as Equipment (backend save call + toast) and persists across reload. The fixture restores itself and fails loudly if the restore does not verify.
**Data**: office=1105; row 655 "General - Ops"; default 160.00; edited 161

---

## TC-CPR-OVR-054: Labor Max Discount % save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1105 Labor row 655 at baseline (Max Discount unset "—").

**Steps**:
1. Baseline restore → edit Max Discount % to 10 → Save enables
2. Save + confirm → reload + re-select + Labor tab → Max Discount reads 10
3. Cleanup: restore the unset baseline and verify

**Expected**: A Labor-tab Max Discount % edit persists across reload and the fixture returns to its unset ("—") baseline afterwards.
**Data**: office=1105; row 655; edited 10; baseline unset ("—")

---

## TC-CPR-OVR-055: Labor Active toggle save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1105 Labor row 655 at baseline (inactive).

**Steps**:
1. Baseline restore → read the Active checkbox state → toggle it → Save enables
2. Save + confirm → reload + re-select + Labor tab → the toggled state persisted
3. Cleanup: restore the inactive baseline and verify

**Expected**: The Labor Active checkbox (read via its checked state) toggles, commits, persists across reload, and restores. Exercises the Labor tab's per-table boolean render.
**Data**: office=1105; row 655; baseline inactive

---

## TC-CPR-OVR-056: Navigating away from a dirty grid raises the unsaved-changes dialog; Stay keeps the page and the edit
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1105 Labor tab loaded; grid clean.

**Steps**:
1. Edit row 655 Override Price to a value differing from the saved one → Save enables (dirty)
2. Click the in-app Home link → the "Unsaved changes" dialog appears with the verbatim title, body, Stay and Discard buttons
3. Click "Stay" → the dialog closes; the URL still points at the Override screen; the staged edit is intact; Save is still enabled
4. Cleanup: navigate Home again → Discard

**Expected**: In-app navigation from a dirty grid is guarded. Stay keeps the user on the page with the uncommitted edit intact (the Stay path was live-verified before authoring — previously unexercised). The dialog contract is asserted verbatim.
**Data**: office=1105; dialog title "Unsaved changes"; body "Are you sure you want to leave this view? Any unsaved changes will be lost."; buttons Stay/Discard

---

## TC-CPR-OVR-057: Discard in the unsaved-changes dialog leaves the page and drops the edit
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-056
**Automatable**: Yes

**Preconditions**: Office 1105 Labor tab loaded; grid clean.

**Steps**:
1. Edit row 655 Override Price → dirty
2. Click the in-app Home link → dialog → click "Discard"
3. Assert navigation to the home page
4. Re-open the Override screen + re-select 1105 + Labor tab → the row still shows its original value

**Expected**: Discard navigates away and the dropped edit never persists — proven by re-reading the value after a full reload.
**Data**: office=1105; row 655

---

## TC-CPR-OVR-058: Page navigation changes the visible rows and enables or disables the nav buttons at each end
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: Office 9460 Labor tab loaded (multi-page data set); page 1; default rows-per-page.

**Steps**:
1. On page 1: "Go to first page" + "Go to previous page" disabled; "Go to next page" + "Go to last page" enabled; read the first row name
2. Click "Go to next page" → the first row name changes; "Go to previous page" enables
3. Click "Go to last page" → "Go to next page" + "Go to last page" disabled; the visible row count is above 0 and no more than the rows-per-page setting

**Expected**: Page navigation works end to end: row content changes per page, and the nav buttons disable exactly at each end of the range.
**Data**: office=9460 Labor; identity assertions on first-row content, no hardcoded totals

---

## TC-CPR-OVR-059: Raising rows-per-page shows more rows without changing the total
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: Office 9460 Labor tab loaded; default rows-per-page (20).

**Steps**:
1. Read the visible row count and the "items found" total
2. Change rows-per-page to 50
3. Assert the visible row count increased and the "items found" total is unchanged

**Expected**: A larger page size shows more rows on the page while the underlying record total stays constant. Relative assertions only.
**Data**: office=9460 Labor; rows-per-page 20→50

---

## TC-CPR-OVR-060: A page-1 row reads back identically after paging to the last page and returning
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-058
**Automatable**: Yes

**Preconditions**: Office 9460 Labor tab loaded; page 1.

**Steps**:
1. Read the first row Product Group Name (content anchor)
2. Page to the last page → rows render
3. Page back to the first page → the same content anchor reads back identically and its row is findable

**Expected**: Content-anchored read integrity holds across a full page-range round trip on the largest available data set — no windowing or render corruption. Content anchor, never row index.
**Data**: office=9460 Labor (212-row bed at verification time; asserted by anchor, not count)

---

## TC-CPR-OVR-061: A blank Override Price renders as an em-dash in a muted style, not an empty cell
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1115 selected (Equipment tab); row "01D Double Screen Set Kit" carries a blank Override Price.

**Steps**:
1. Find the row "01D Double Screen Set Kit"
2. Read its Override Price cell text → exactly "—" (em-dash), NOT an empty string
3. Read the cell markup → the muted-style placeholder span is present

**Expected**: A blank/never-set Override Price renders the muted em-dash placeholder. Asserting empty-string would pass on the wrong render — the test asserts the em-dash explicitly (read-only bed; no mutation).
**Data**: office=1115; row PG 286 "01D Double Screen Set Kit"; expected text "—"

---

## TC-CPR-OVR-062: Enter opens the Override Price editor on a focused cell; Escape closes it without dirtying the form
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1606 fixture row at its default; grid clean.

**Steps**:
1. Focus the anchor row Override Price display cell (it is keyboard-focusable)
2. Press Enter → the numeric editor opens showing the current value
3. Press Escape → the editor closes; Save remains disabled (no dirty state)

**Expected**: Editable cells support keyboard activation: Enter opens the editor, Escape cancels cleanly. **Documented gaps (live-verified, not automated)**: arrow keys do not move focus between cells (no grid-level keyboard navigation), and the save dialogs render hidden from assistive technology while visually modal — both recorded as findings for the accessibility review, not asserted.
**Data**: office=1606; anchor row 2609

---

## TC-CPR-OVR-063: The Product Group picker appears only when a specific currency is selected
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 4104 selected; Currency at its ALL default.

**Steps**:
1. With Currency = ALL: the "Product Groups" picker panel (search box) is absent
2. Select Currency = USD → the picker panel appears with its search box
3. Count the picker draggable product-group rows → greater than 0

**Expected**: The add-override affordance is a currency-gated picker: absent on ALL, present with draggable rows once a specific currency is selected.
**Data**: office=4104; gating currency USD; picker search placeholder "Search product groups..."

---

## TC-CPR-OVR-064: Dragging a picker row stages a new override row with no request until Save; Discard drops it
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Functional |

**Depends_On**: TC-CPR-OVR-063
**Automatable**: Yes

**Preconditions**: Office 4104 selected; Currency USD; picker visible; Equipment tab.

**Steps**:
1. Read the grid row count → attach a network listener for the backend save endpoint
2. Drag the picker first row into the Equipment grid panel
3. Assert: row count +1; ZERO save requests fired during the drag; Save button enabled; the staged row shows Override Price 0.00 and inactive
4. Navigate Home → "Unsaved changes" dialog → Discard
5. Re-open + re-select 4104 + USD → the row count is back to its pre-drag value

**Expected**: Drag staging is purely client-side (no request until Save), lands at 0.00/inactive, dirties the form, and evaporates on Discard — proven by a post-reload recount. Nothing is ever saved.
**Data**: office=4104; currency USD; staged defaults 0.00/inactive

---

## TC-CPR-OVR-065: The picker serves the Labor tab and drag staging works there too
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-063, TC-CPR-OVR-064
**Automatable**: Yes

**Preconditions**: Office 4104 selected; Currency USD; picker visible.

**Steps**:
1. Switch to the Labor tab → the picker panel persists and lists draggable Labor rows
2. Read the Labor grid row count → drag the picker first row into the Labor grid panel
3. Assert the row count increased by 1 and Save enabled
4. Navigate Home → Discard (nothing persists)

**Expected**: The same currency-gated picker serves Labor product groups, and drag staging behaves identically on the Labor tab.
**Data**: office=4104; currency USD; Labor tab


---

## Wave-2 Coverage Expansion (NM-2271) — TC-CPR-OVR-066 through TC-CPR-OVR-127

## TC-CPR-OVR-066: Override Price rejects negative input (−5) with full rejection oracle
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 4107 selected, Equipment tab active.

**Steps**:
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'overridePrice', '-5')`
3. Assert full rejection signature BEFORE escape: committed=false, aria-invalid=true, border-color oklch(0.577 0.245 27.325), errorText empty, Save disabled, escapable=true

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'overridePrice', '-0.01')`
3. Assert rejection: committed=false, aria-invalid=true, Save disabled

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'overridePrice', '0.001')`
3. Assert committed=true, observe displayedValue

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'overridePrice', '999999')`
3. Assert committed=true, saveEnabled=true

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'overridePrice', '1.2.3')` (real keyboard input — browser swallows second dot)
3. Assert the DEFECT: committed=true, displayedValue=`1.23`, saveEnabled=true

**Expected (asserting the BUG — test FAILS when app is fixed)**: `1.2.3` commits as `1.23` — the browser swallows the second decimal point and the app accepts the resulting value without rejection. When fixed, this input should be rejected (multi-dot is not a valid number). Failure signal: `committed` becomes `false` or `displayedValue` changes.
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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'overridePrice', '007')`
3. Assert committed=true, observe displayedValue

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'overridePrice', '1e5')`
3. Observe whether committed or rejected

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', '50')`
3. Assert committed=true, displayedValue=`50.00 %`, saveEnabled=true

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', '-0.01')`
3. Assert rejection: committed=false, aria-invalid=true, Save disabled

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', '0.5')`
3. Assert the DEFECT: committed=true, displayedValue=`50.00 %`, saveEnabled=true

**Expected (asserting the BUG — test FAILS when app is fixed)**:
Typing `0.5` into the Max Discount % field commits and displays as `50.00 %`. This is a **100× multiplier bug**: a user intending a half-percent discount cap (0.5%) silently gets a fifty-percent cap. The same stored value is produced by typing `50`, so two fundamentally different business intents collapse to one stored number — with direct money impact.

**When the app is fixed**: `displayedValue` will become `0.50 %` (the correct interpretation of 0.5 as a percentage). The test will FAIL on the `expect(result.displayedValue).toBe('50.00 %')` line, and the failure message will show `Expected: "50.00 %" / Received: "0.50 %"` — making the fix immediately visible.
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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', '99.99')`
3. Assert committed=true, displayedValue=`99.99 %`

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', '100.01')`
3. Assert full rejection signature BEFORE escape: committed=false, aria-invalid=true, border-color oklch(0.577 0.245 27.325), errorText empty, Save disabled, escapable=true

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', 'abc')`
3. Assert the DEFECT: committed=true, displayedValue=`—`, saveEnabled=true

**Expected (asserting the BUG — test FAILS when app is fixed)**:
`abc` commits (editor closes) and blanks the cell to `—`. Save stays ENABLED despite the displayed value matching the original baseline (`—`). Two bugs: (1) non-numeric input should be rejected, not committed; (2) Save enables on what is effectively an unchanged result (baseline was already `—`). When fixed, `committed` will become `false` (proper rejection) and/or `saveEnabled` will become `false`.
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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', '1.2.3')` (real keyboard input)
3. Assert the DEFECT: committed=true, displayedValue=`1.23 %`, saveEnabled=true

**Expected (asserting the BUG — test FAILS when app is fixed)**: `1.2.3` commits as `1.23 %` — the browser swallows the second dot during real keyboard typing, producing a plausible-looking but corrupted value. No warning, no rejection. Note: Override Price renders the same bug as `1.23` (no `%` suffix) — the two fields format differently. When fixed, this input should be rejected.
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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', '1e5')`
3. Assert rejection: committed=false, aria-invalid=true, Save disabled

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `probeEditOracle(row, 'maxDiscount', '007')`
3. Assert committed=true, displayedValue=`7.00 %`, saveEnabled=true

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Call `editAndRevertToOriginal(row, 'maxDiscount', '50', '')`
3. Assert saveEnabledAfterEdit=true, saveDisabledAfterRevert=true

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
1. Navigate to office 4107, Equipment tab, find row PG 4298
2. Toggle the Active checkbox (uncheck) → Save enables
3. Toggle the Active checkbox again (recheck to original) → Save disables

**Expected**: Toggling Active away from its saved state enables Save; toggling it back to the original state disables Save (LR-009 — no net change, no save needed).
**Data**: office=4107, product group=4298, field=Active, baseline=checked

---

## TC-CPR-OVR-084: Clicking Override Price cell on Labor reveals an editable spinbutton
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated; on the Override screen with office 1134 selected, Labor tab active.

**Steps**:
1. Navigate to Labor tab on office 1134, find row by Product Group 565 -> row resolves
2. Click the Override Price cell (role=button) -> a numeric editor (spinbutton) reveals
3. Read the editor value -> pre-filled with `13.00`
4. Press Escape -> editor closes without committing

**Expected**: The Override Price cell on Labor is click-to-edit — clicking reveals a spinbutton pre-filled with the current value (13.00 for PG 565).
**Data**: office=1134, tab=Labor, productGroup=565

---

## TC-CPR-OVR-085: Override Price accepts 0 on Labor (min valid)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '0')`
3. Assert committed=true, displayedValue='0.00', saveEnabled=true

**Expected**: Override Price accepts 0 as a valid value; editor closes; cell displays `0.00`; Save enables.
**Data**: office=1134, tab=Labor, productGroup=565, input=0, expectedDisplay=`0.00`

---

## TC-CPR-OVR-086: Override Price accepts mid-value decimal on Labor (25.50)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '25.50')`
3. Assert committed=true, displayedValue='25.50', saveEnabled=true

**Expected**: Override Price accepts a mid-range decimal; editor closes; cell displays `25.50`; Save enables.
**Data**: office=1134, tab=Labor, productGroup=565, input=25.50, expectedDisplay=`25.50`

---

## TC-CPR-OVR-087: Override Price accepts a large value on Labor (9999.99)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '9999.99')`
3. Assert committed=true, displayedValue='9,999.99', saveEnabled=true

**Expected**: Override Price accepts a large value; editor closes; cell renders with thousands separator as `9,999.99`; Save enables.
**Data**: office=1134, tab=Labor, productGroup=565, input=9999.99, expectedDisplay=`9,999.99`

---

## TC-CPR-OVR-088: Override Price rejects -0.01 on Labor (below-min boundary)
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '-0.01')`
3. Assert: committed=false, ariaInvalid='true', borderColor contains oklch(0.577 0.245 27.325), errorText='' (no message — defect #4), saveEnabled=false, escapable=true

**Expected**: `-0.01` is rejected — editor stays open, aria-invalid=true, red border, Save disabled, no error message (defect #4), escapable via Tab.
**Data**: office=1134, tab=Labor, productGroup=565, input=-0.01, oracle=REJECTED

---

## TC-CPR-OVR-089: Override Price accepts 0.01 on Labor (just above zero)
| Priority | Status | Type |
|----------|--------|------|
| Low | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 893 row visible.

**Steps**:
1. Navigate to Labor row PG 893 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '0.01')`
3. Assert committed=true, displayedValue='0.01', saveEnabled=true

**Expected**: The smallest positive decimal step commits — cell displays `0.01`, Save enables.
**Data**: office=1134, tab=Labor, productGroup=893, input=0.01, expectedDisplay=`0.01`

---

## TC-CPR-OVR-090: Override Price 3rd decimal precision on Labor (12.345)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '12.345')`
3. Assert committed=true; read displayedValue — **Pending verification**: expected `12.35` (rounded) or `12.345` (3 decimals) or `12.34` (truncated)

**Expected**: A 3rd-decimal-place input commits (editor closes, Save enables). Exact displayed format is **Pending verification** — precision/rounding behavior on Override Price has not been probed.
**Data**: office=1134, tab=Labor, productGroup=565, input=12.345, expectedDisplay=Pending verification

---

## TC-CPR-OVR-091: Override Price above-max probe on Labor (999999.99)
| Priority | Status | Type |
|----------|--------|------|
| Low | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 893 row visible.

**Steps**:
1. Navigate to Labor row PG 893 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '999999.99')`
3. Assert committed=true, displayedValue='999,999.99', saveEnabled=true — **Pending verification**: no confirmed hard max for Override Price; if rejected, apply OVERRIDE_REJECTION_SIGNATURE instead

**Expected**: **Pending verification** — no confirmed hard max for Override Price exists. If accepted: displays `999,999.99`. If rejected: full rejection signature applies. TC-021 on Equipment states "a large number" is accepted, so acceptance is the expected path.
**Data**: office=1134, tab=Labor, productGroup=893, input=999999.99, expectedDisplay=Pending verification

---

## TC-CPR-OVR-092: Defect — abc blanks Override Price to dash, Save stays enabled (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Defect evidence |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', 'abc')`
3. Assert the DEFECT: committed=true, displayedValue='—' (em-dash, blanked), saveEnabled=true

**Expected (asserting the BUG — test FAILS when app is fixed)**: `abc` is not rejected — it blanks the cell to `—` and Save stays enabled, meaning an emptied price can be saved. When the app is fixed, `committed` will become `false` (proper rejection) and this test fails loudly.
**Data**: office=1134, tab=Labor, productGroup=565, input=abc, oracle=DEFECT-COMMITTED

---

## TC-CPR-OVR-093: Defect — 1.2.3 silently corrupts Override Price to 1.23 (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Defect evidence |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '1.2.3')` — real keyboard input (method rule)
3. Assert the DEFECT: committed=true, displayedValue='1.23' (no % suffix — Override Price format), saveEnabled=true

**Expected (asserting the BUG — test FAILS when app is fixed)**: `1.2.3` (a typo) is not rejected — the browser swallows the second dot, committing `1.23` as if valid. When fixed, the app will reject `1.2.3` and `committed` will become `false`.
**Data**: office=1134, tab=Labor, productGroup=565, input=1.2.3, oracle=DEFECT-COMMITTED, expectedDisplay=`1.23`

---

## TC-CPR-OVR-094: Rejected — negative -5 on Override Price with full affordance oracle (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '-5')` — captures step-5 order BEFORE escape
3. Assert rejection oracle (all 7 affordances):
   - committed = false (editor stays open, value NOT committed)
   - ariaInvalid = 'true'
   - borderColor contains `oklch(0.577 0.245 27.325)` (red)
   - errorText = '' (empty — defect #4: no error message ever shown)
   - saveEnabled = false (Save DISABLED)
   - escapable = true (Tab moves focus out — NOT a focus trap)
4. Assert `[role="alert"]` displayed text is empty (defect #4 evidence)

**Expected**: `-5` is rejected with the full OVERRIDE_REJECTION_SIGNATURE. The rejection is LOUD (visual cues) but SILENT (no error text — defect #4). Editor stays open; Save is disabled; focus is NOT trapped.
**Data**: office=1134, tab=Labor, productGroup=565, input=-5, oracle=OVERRIDE_REJECTION_SIGNATURE

---

## TC-CPR-OVR-095: Override Price leading zeros stripped on Labor (007 → 7.00)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 893 row visible.

**Steps**:
1. Navigate to Labor row PG 893 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '007')`
3. Assert committed=true, displayedValue='7.00', saveEnabled=true

**Expected**: Leading zeros are stripped — `007` commits as `7.00` (no `%` suffix on Override Price). Save enables.
**Data**: office=1134, tab=Labor, productGroup=893, input=007, expectedDisplay=`7.00`

---

## TC-CPR-OVR-096: Override Price scientific notation 1e5 on Labor
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 893 row visible.

**Steps**:
1. Navigate to Labor row PG 893 (reload restores originals)
2. Call `probeEditOracle(row, 'overridePrice', '1e5')`
3. Assert committed=true, displayedValue='100,000.00', saveEnabled=true

**Expected**: `1e5` commits on Override Price and displays as `100,000.00`. Save enables. Max Discount % rejects `1e5` because the >100 cap fires (1e5 = 100000 > 100), not because the app refuses scientific notation; Override Price has no such cap, so it accepts the value.
**Data**: office=1134, tab=Labor, productGroup=893, input=1e5, expectedDisplay=`100,000.00`

---

## TC-CPR-OVR-097: Reverting Override Price to original disables Save on Labor
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Call `editAndRevertToOriginal(row, 'overridePrice', '99.99', '13.00')`
3. Assert saveEnabledAfterEdit=true, saveDisabledAfterRevert=true

**Expected**: Editing Override Price to `99.99` enables Save; reverting to the original `13.00` disables Save (no net change, LR-009). No data is committed — reload would restore regardless.
**Data**: office=1134, tab=Labor, productGroup=565, editValue=99.99, originalValue=13.00

---

## TC-CPR-OVR-098: Active toggle-then-revert disables Save on Labor
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
1. Navigate to Labor row PG 565 (reload restores originals)
2. Read initial Active state (aria-checked)
3. Toggle the Active checkbox -> Save enables (form is dirty)
4. Toggle the Active checkbox again (revert to original state) -> Save disables (no net change)

**Expected**: Toggling Active then toggling back to the original state leaves zero net change — Save returns to disabled (LR-009). No data is committed.
**Data**: office=1134, tab=Labor, productGroup=565

---

## TC-CPR-OVR-099: Committed — Max Discount % accepts 0 as min valid (Labor)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending | BVA / Positive |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 565
3. Call `probeEditOracle(row, 'maxDiscount', '0')`
4. Assert value commits as `0.00 %`

**Expected**:
- `committed` = `true`
- `displayedValue` = `'0.00 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---

## TC-CPR-OVR-100: Committed — Max Discount % accepts 50 as mid-value (Labor)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending | BVA / Positive |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 893
3. Call `probeEditOracle(row, 'maxDiscount', '50')`
4. Assert value commits as `50.00 %`

**Expected**:
- `committed` = `true`
- `displayedValue` = `'50.00 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---

## TC-CPR-OVR-101: Committed — Max Discount % accepts 100 as inclusive cap (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Positive |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 565
3. Call `probeEditOracle(row, 'maxDiscount', '100')`
4. Assert value commits as `100.00 %`

**Expected**:
- `committed` = `true`
- `displayedValue` = `'100.00 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---

## TC-CPR-OVR-102: Rejected — Max Discount % rejects -0.01 just below minimum (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Boundary |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 893
3. Call `probeEditOracle(row, 'maxDiscount', '-0.01')`
4. Assert result matches OVERRIDE_REJECTION_SIGNATURE

**Expected**:
- `committed` = `false`
- `ariaInvalid` = `'true'`
- `borderColor` contains `oklch(0.577 0.245 27.325)`
- `errorText` = `''` (empty — no message ever shown)
- `saveEnabled` = `false`
- `escapable` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---

## TC-CPR-OVR-103: Defect — Max Discount % 0.5 misread as 50.00 % (100× multiplier bug, Labor)
| Priority | Status | Type |
|----------|--------|------|
| Critical | Pending | BVA / Defect evidence |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 565
3. Call `probeEditOracle(row, 'maxDiscount', '0.5')`
4. Assert the DEFECT: value commits as `50.00 %` instead of the correct `0.50 %`

**Expected (asserting the BUG — test FAILS when app is fixed)**:
- `committed` = `true` (editor closes — the app accepted this)
- `displayedValue` = `'50.00 %'` (WRONG — should be `0.50 %`; a half-percent cap silently becomes fifty percent)
- `saveEnabled` = `true`

**When the app is fixed**: `displayedValue` will change to `'0.50 %'`. The test fails, naming both values — the 100× multiplier bug is gone.

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---

## TC-CPR-OVR-104: Committed — Max Discount % accepts 99.99 just below cap (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Boundary |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 893
3. Call `probeEditOracle(row, 'maxDiscount', '99.99')`
4. Assert value commits as `99.99 %`

**Expected**:
- `committed` = `true`
- `displayedValue` = `'99.99 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---

## TC-CPR-OVR-105: Rejected — Max Discount % rejects 150 above 100 cap (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Boundary |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 565
3. Call `probeEditOracle(row, 'maxDiscount', '150')`
4. Assert result matches OVERRIDE_REJECTION_SIGNATURE

**Expected**:
- `committed` = `false`
- `ariaInvalid` = `'true'`
- `borderColor` contains `oklch(0.577 0.245 27.325)`
- `errorText` = `''` (empty — no message ever shown)
- `saveEnabled` = `false`
- `escapable` = `true`

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---

## TC-CPR-OVR-106: Rejected — Max Discount % rejects -5 negative value (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Boundary |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 893
3. Call `probeEditOracle(row, 'maxDiscount', '-5')`
4. Assert result matches OVERRIDE_REJECTION_SIGNATURE

**Expected**:
- `committed` = `false`
- `ariaInvalid` = `'true'`
- `borderColor` contains `oklch(0.577 0.245 27.325)`
- `errorText` = `''` (empty — no message ever shown)
- `saveEnabled` = `false`
- `escapable` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---

## TC-CPR-OVR-107: Defect — Max Discount % 'abc' blanks cell to dash, Save stays enabled (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | Negative / Defect evidence |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 565
3. Call `probeEditOracle(row, 'maxDiscount', 'abc')`
4. Assert the DEFECT: value blanks to `—` and Save remains enabled

**Expected (asserting the BUG — test FAILS when app is fixed)**:
- `committed` = `true` (editor closes — the app accepted this non-numeric input)
- `displayedValue` = `'—'` (cell blanked — an emptied discount cap can be saved)
- `saveEnabled` = `true` (WRONG — a blanked value should not be saveable)

**When the app is fixed**: either the input is rejected (editor stays open, `committed`=false) or Save is disabled. The test fails, exposing the fix.

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---

## TC-CPR-OVR-108: Defect — Max Discount % '1.2.3' silently corrupts to 1.23 % (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | Negative / Defect evidence |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 893
3. Call `probeEditOracle(row, 'maxDiscount', '1.2.3')`
4. Assert the DEFECT: value commits as `1.23 %` (second dot swallowed)

**Expected (asserting the BUG — test FAILS when app is fixed)**:
- `committed` = `true` (editor closes — should have been rejected)
- `displayedValue` = `'1.23 %'` (WRONG — a multi-dot input is silently corrupted)
- `saveEnabled` = `true`

**When the app is fixed**: the input is rejected (editor stays open, `committed`=false, aria-invalid=true). The test fails, naming the change.

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---

## TC-CPR-OVR-109: Committed — Max Discount % strips leading zeros from 007 (Labor)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending | Negative / Coercion |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 565
3. Call `probeEditOracle(row, 'maxDiscount', '007')`
4. Assert value commits with leading zeros stripped

**Expected**:
- `committed` = `true`
- `displayedValue` = `'7.00 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---

## TC-CPR-OVR-110: Rejected — Max Discount % rejects scientific notation 1e5 (Labor)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending | Negative / Coercion |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 893
3. Call `probeEditOracle(row, 'maxDiscount', '1e5')`
4. Assert result matches OVERRIDE_REJECTION_SIGNATURE

**Expected**:
- `committed` = `false`
- `ariaInvalid` = `'true'`
- `borderColor` contains `oklch(0.577 0.245 27.325)`
- `errorText` = `''` (empty — no message ever shown)
- `saveEnabled` = `false`
- `escapable` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---

## TC-CPR-OVR-111: Save-cycle — reverting Max Discount % to original disables Save on Labor
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | Save-cycle / Net-zero |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
1. Navigate to Labor tab on office 1134
2. Find row by product group anchor PG 565
3. Call `editAndRevertToOriginal(row, 'maxDiscount', '50', '14.00')`
4. Assert Save enables after edit, then disables after revert

**Expected**:
- `saveEnabledAfterEdit` = `true` (editing to 50 dirties the form)
- `saveDisabledAfterRevert` = `true` (reverting to 14.00 — the original — disables Save)

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---

## TC-CPR-OVR-112: Pressing Escape closes the location picker without applying a location
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-030
**Automatable**: Yes
**Surface_Family**: launcher (QUICK)

**Preconditions**: On the Override screen with office 1606 selected (grid populated).

**Steps**:
1. Open the "Change Local Office" picker dialog
2. Press Escape → the dialog closes
3. Read the grid → the same rows are present; Save remains disabled (no location change applied)

**Expected**: Pressing Escape dismisses the location picker without applying a new location or dirtying the form. The grid content and Save state are unchanged.
**Data**: office=1606

---

## TC-CPR-OVR-113: Cancel closes the location picker without applying a location
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-030
**Automatable**: Yes
**Surface_Family**: launcher (QUICK)

**Preconditions**: On the Override screen with office 1606 selected (grid populated).

**Steps**:
1. Open the "Change Local Office" picker dialog
2. Click the Close (X) button in the dialog header → the dialog closes
3. Read the grid → the same rows are present; Save remains disabled

**Expected**: The Close-X button dismisses the picker identically to Cancel — no location is applied, no dirty state.
**Data**: office=1606

---

## TC-CPR-OVR-114: No-results empty state in the location picker when search matches nothing
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-039
**Automatable**: Yes
**Surface_Family**: launcher (QUICK)

**Preconditions**: On the Override screen with office 1606 selected.

**Steps**:
1. Open the "Change Local Office" picker dialog
2. Type a nonsense string (e.g. "zzz999nonexistent") into the search box → the location table shows zero rows
3. Assert the empty state is announced (a "no results" message or zero-row indicator is visible, not a silent blank)
4. Close the dialog (Cancel or Escape)

**Expected**: Searching for a term that matches no office renders an explicit empty state — the picker does not show a silent blank table. The empty state is visually distinguishable from a loading state.
**Data**: office=1606; search needle "zzz999nonexistent"

---

## TC-CPR-OVR-115: Re-selecting the current office does not dirty the form (no net change)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-030
**Automatable**: Yes
**Surface_Family**: launcher (QUICK)

**Preconditions**: On the Override screen with office 1606 already selected and the grid populated; Save is disabled.

**Steps**:
1. Open the "Change Local Office" picker dialog
2. Search "1606", check the office 1606 row, click Select → the dialog closes
3. Read Save button state → still disabled (re-selecting the same office is a no-op)
4. Read the grid → rows unchanged; anchor row PG 2609 still present

**Expected**: Re-selecting the already-active office is a revert-to-same operation (LR-009, no net change) — no dirty flag, Save stays disabled, grid content unchanged. The picker does not treat a same-office selection as a mutation.
**Data**: office=1606; anchor PG 2609

---

## TC-CPR-OVR-116: Text filter narrows grid and empty filter shows no results
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-OVR-012
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1606 selected; all rows visible (no active filter).

**Steps**:
1. Read the visible row count (baseline)
2. Type a single character "H" into the "Filter Product Groups Override..." input → the grid responds (narrows or stays unchanged depending on data, but does not crash or error)
3. Assert: visible row count is ≥ 0 and ≤ the baseline count; no unhandled errors; the grid is still interactive
4. Clear the filter → row count returns to baseline

**Expected**: A 1-character input is the minimum boundary for the text filter. The grid must respond without crashing, erroring, or ignoring the input. On office 1606, "H" matches "House Video Monitor" rows so the count will narrow — but the assertion is relative (≤ baseline), not a hardcoded number.
**Data**: office=1606; filter input "H"; assertion relative (not hardcoded count)

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
1. Open the Import dialog via the toolbar "Import" button
2. Prepare and attach a CSV file containing at least one row with an empty Override Price cell (the minimum reproduction for this known defect)
3. The upload fires (auto-submit on file-choose per agent-mistakes.md:206) → capture the server response
4. Assert: the import is REJECTED (not success); the grid is unchanged (no rows modified); a rejection indicator is visible (error message or the dialog remains open with an error state)

**Expected**: A CSV with an empty Override Price causes the entire file to be rejected — no partial import, no silent truncation. This is a known filed defect (unfixed). The test asserts the rejection and confirms zero mutation.

**Pending verification**: The exact rejection mechanism (HTTP status, error message wording, dialog behavior on rejection) has not been live-verified for this specific defect. The reported symptom may differ from reality (per agent-mistakes.md:208-210). The structural assertion (rejection = no mutation) is safe; the specific error-message wording has not been confirmed.
**Data**: office=1606; defect NM-1940

---

## TC-CPR-OVR-118: Tab-switch from dirty Equipment grid to Labor — dirty state persists without a guard dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-018
**Automatable**: Yes — pending live verification of tab-switch dirty behavior
**Surface_Family**: persistence (QUICK)

**Preconditions**: On the Override screen with office 1606 selected; Equipment tab active; grid clean (Save disabled).

**Steps**:
1. Edit the anchor row (PG 2609) Override Price to a different value → Save enables (Equipment grid dirty)
2. Click the Labor tab → observe: does the "Unsaved changes" dialog fire?
3. Assert: NO dialog fires (tab-switch is within the same page/URL — not a navigation event)
4. Click back to the Equipment tab → read the anchor row value and Save button state
5. Assert: the staged edit is still present; Save is still enabled (dirty state preserved across tab round-trip)

**Expected**: Switching tabs on the same Override page does not trigger the unsaved-changes guard (the URL does not change). The Equipment grid's dirty state persists through a Labor-tab visit and is intact on return. This is a persistence (SBC) assertion, not a guard assertion.

**Pending verification**: The tab-switch dirty behavior was identified as a gap during the live walk ("state preserved? No TC covers this transition") but was not itself probed live. The expectation (no dialog, state preserved) is the architecturally likely behavior but unconfirmed.
**Data**: office=1606; anchor PG 2609; tab sequence Equipment→Labor→Equipment

---

## TC-CPR-OVR-119: Sort produces verifiable monotonic order on Labor tab
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes
**Surface_Family**: combination (QUICK)

**Preconditions**: On the Override screen with office 1134 selected; Labor tab active; 2 rows visible (PG 565, PG 893); no filter or sort active.

**Steps**:
1. Read the visible row count → 2 (baseline)
2. Type "565" into the text filter → grid narrows to 1 row (PG 565 only)
3. Open the "Product Group" column header dropdown → click "Sort ascending"
4. Assert: still 1 row visible (filter survives the sort); the row is PG 565
5. Clear the text filter → 2 rows restored; assert sort order is maintained (Product Group values non-decreasing)

**Expected**: Filter and sort compose without resetting each other on the Labor tab. Applying a sort while a text filter is active does not clear the filter; clearing the filter preserves the active sort. The 2-row dataset on 1134 is minimal but exercises the composition.
**Data**: office=1134; Labor tab; filter needle "565"; sort column "Product Group"; expected filtered count=1; expected full count=2

---

## TC-CPR-OVR-120: Tab-switch from dirty Labor grid to Equipment — dirty state persists without a guard dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-053
**Automatable**: Yes — pending live verification of tab-switch dirty behavior
**Surface_Family**: persistence (QUICK)

**Preconditions**: On the Override screen with office 1134 selected; Labor tab active; grid clean (Save disabled).

**Steps**:
1. Edit Labor row PG 565 Override Price to a different value (e.g. 14) → Save enables (Labor grid dirty)
2. Click the Equipment tab → observe: no "Unsaved changes" dialog fires
3. Click back to the Labor tab → read row PG 565 value and Save button state
4. Assert: the staged edit is still present; Save is still enabled (dirty state preserved across tab round-trip)

**Expected**: Mirrors TC-CPR-OVR-D-07 for the Labor→Equipment direction. Tab-switching does not trigger the nav-away guard and dirty state persists across the round-trip.

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

## TC-CPR-OVR-121: Select 10 rows-per-page → grid renders exactly 10 rows (OVR-RPP-2)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011
**Automatable**: Yes
**Surface_Family**: combobox (QUICK)

**Preconditions**: On the Override screen with office 9460 selected (via `CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED`); Labor tab active; grid populated with 212 rows; default rows-per-page is 20.

**Steps**:
1. Navigate to office 9460, Labor tab (via volume bed constant)
2. Confirm the grid loads with the default page size (20 visible rows)
3. Open the rows-per-page selector and choose "10"
4. Count visible grid rows → assert exactly 10
5. Confirm pagination state is consistent (page indicator shows page 1 of a page count > what 20/page would produce)

**Expected**: Selecting "10" re-renders the grid to show exactly 10 rows on page 1. The pagination updates to reflect 10-row pages. The default of 20 differs from 10, so this assertion **fails if the control does nothing** (an inactive control yields 20 visible rows ≠ 10).
**Data**: office=9460 (CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED); Labor tab; page size=10; default page size=20

---

## TC-CPR-OVR-122: Select 30 rows-per-page → grid renders exactly 30 rows (OVR-RPP-4)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011
**Automatable**: Yes
**Surface_Family**: combobox (QUICK)

**Preconditions**: On the Override screen with office 9460 selected (via `CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED`); Labor tab active; grid populated with 212 rows; default rows-per-page is 20.

**Steps**:
1. Navigate to office 9460, Labor tab (via volume bed constant)
2. Confirm the grid loads with the default page size (20 visible rows)
3. Open the rows-per-page selector and choose "30"
4. Count visible grid rows → assert exactly 30
5. Confirm pagination state is consistent (page count decreased relative to default 20-per-page)

**Expected**: Selecting "30" re-renders the grid to show exactly 30 rows on page 1. The pagination updates to reflect 30-row pages. The default of 20 differs from 30, so this assertion **fails if the control does nothing** (an inactive control yields 20 visible rows ≠ 30).
**Data**: office=9460 (CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED); Labor tab; page size=30; default page size=20

---

## TC-CPR-OVR-123: Select 40 rows-per-page → grid renders exactly 40 rows (OVR-RPP-5)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011
**Automatable**: Yes
**Surface_Family**: combobox (QUICK)

**Preconditions**: On the Override screen with office 9460 selected (via `CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED`); Labor tab active; grid populated with 212 rows; default rows-per-page is 20.

**Steps**:
1. Navigate to office 9460, Labor tab (via volume bed constant)
2. Confirm the grid loads with the default page size (20 visible rows)
3. Open the rows-per-page selector and choose "40"
4. Count visible grid rows → assert exactly 40
5. Confirm pagination state is consistent (page count decreased relative to default 20-per-page)

**Expected**: Selecting "40" re-renders the grid to show exactly 40 rows on page 1. The pagination updates to reflect 40-row pages. The default of 20 differs from 40, so this assertion **fails if the control does nothing** (an inactive control yields 20 visible rows ≠ 40).
**Data**: office=9460 (CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED); Labor tab; page size=40; default page size=20

---

## TC-CPR-OVR-124: Select 50 rows-per-page → grid renders exactly 50 rows (OVR-RPP-6)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011
**Automatable**: Yes
**Surface_Family**: combobox (QUICK)

**Preconditions**: On the Override screen with office 9460 selected (via `CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED`); Labor tab active; grid populated with 212 rows; default rows-per-page is 20.

**Steps**:
1. Navigate to office 9460, Labor tab (via volume bed constant)
2. Confirm the grid loads with the default page size (20 visible rows)
3. Open the rows-per-page selector and choose "50"
4. Count visible grid rows → assert exactly 50
5. Confirm pagination state is consistent (page count decreased relative to default 20-per-page)

**Expected**: Selecting "50" re-renders the grid to show exactly 50 rows on page 1. The pagination updates to reflect 50-row pages. The default of 20 differs from 50, so this assertion **fails if the control does nothing** (an inactive control yields 20 visible rows ≠ 50).
**Data**: office=9460 (CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED); Labor tab; page size=50; default page size=20

---

## TC-CPR-OVR-125: Currency filter USD — yields only USD rows, CAD row absent (OVR-CUR-3)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-043 (skipped — this replaces it)
**Automatable**: Yes
**Surface_Family**: combobox (QUICK)

**Preconditions**: On the Override screen with office 1145 selected; Equipment tab active; filter=ALL; 11 rows visible (10 USD + 1 CAD).

**Steps**:
1. Navigate to office 1145, Equipment tab; confirm baseline: 11 rows visible with filter=ALL
2. Select "USD" from the Currency dropdown
3. Read visible row count → assert exactly 10 rows
4. Assert PG 425 ("Box Truss 20.5x20.5 - 5'") is NOT present in the grid (this is the sole CAD row)
5. Assert PG 4298 ("Project Manager (Pre/Post) - Hourly") IS present (a known USD row)
6. Reset filter to "ALL" → assert 11 rows restored

**Expected**: The USD currency filter removes all non-USD rows from the grid. Exactly 10 rows remain (all USD). The single CAD row (PG 425) is absent. An inactive filter would leave all 11 rows visible — the assertion of exactly 10 with PG 425 absent distinguishes a working filter from an inactive one.
**Data**: office=1145; tab=Equipment; filter=USD; expected count=10; absent PG=425; present PG=4298

---

## TC-CPR-OVR-126: Currency filter CAD — yields only CAD rows, identifies the single CAD row (OVR-CUR-4)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-043 (skipped — this replaces it)
**Automatable**: Yes
**Surface_Family**: combobox (QUICK)

**Preconditions**: On the Override screen with office 1145 selected; Equipment tab active; filter=ALL; 11 rows visible (10 USD + 1 CAD).

**Steps**:
1. Navigate to office 1145, Equipment tab; confirm baseline: 11 rows visible with filter=ALL
2. Select "CAD" from the Currency dropdown
3. Read visible row count → assert exactly 1 row
4. Assert PG 425 ("Box Truss 20.5x20.5 - 5'") IS present (this is the sole CAD row)
5. Assert PG 4298 ("Project Manager (Pre/Post) - Hourly") is NOT present (a USD row must be filtered out)
6. Reset filter to "ALL" → assert 11 rows restored

**Expected**: The CAD currency filter removes all non-CAD rows. Exactly 1 row remains — PG 425. An inactive filter would leave all 11 rows (fail: count ≠ 1). A filter that clears everything would leave 0 rows (fail: count ≠ 1 and PG 425 absent). Only a correct filter yields exactly 1 row with PG 425 present.
**Data**: office=1145; tab=Equipment; filter=CAD; expected count=1; present PG=425; absent PG=4298

---

## TC-CPR-OVR-127: Currency filter MXN — yields 0 rows on a USD/CAD-only office (OVR-CUR-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-043 (skipped — this replaces it)
**Automatable**: Yes
**Surface_Family**: combobox (QUICK)

**Preconditions**: On the Override screen with office 1145 selected; Equipment tab active; filter=ALL; 11 rows visible (10 USD + 1 CAD; 0 MXN).

**Steps**:
1. Navigate to office 1145, Equipment tab; confirm baseline: 11 rows visible with filter=ALL
2. Select "MXN" from the Currency dropdown
3. Read visible row count → assert exactly 0 rows
4. Assert PG 425 is NOT present and PG 4298 is NOT present (grid is empty)
5. Reset filter to "ALL" → assert 11 rows restored (filter is reversible, not destructive)

**Expected**: MXN exists in the dropdown (it is a system-wide option) but office 1145 has zero MXN rows. The filter correctly yields an empty grid. An inactive filter would leave all 11 rows (fail: count ≠ 0). This proves the filter actively excludes non-matching rows even when the result set is empty.
**Data**: office=1145; tab=Equipment; filter=MXN; expected count=0; absent PGs=all

---


## TC-CPR-OVR-128: Export returns every location in the tenant, not just the selected office
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and the grid loaded.

**Steps**:
1. Click Export and capture the downloaded CSV
2. Read the Location Id column from every data row
3. Count the distinct values

**Expected**: The file contains many different Location Ids — hundreds of offices, not just the one selected on screen. Export is tenant-wide and takes no notice of the location picker.
**Data**: floor: more than 500 distinct Location Ids (observed 1,782 on 2026-07-21)

---

## TC-CPR-OVR-129: Export carries the full override population, well above any single office
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and the grid loaded.

**Steps**:
1. Read the grid row count
2. Click Export and capture the CSV
3. Count the data rows in the file

**Expected**: The exported file carries thousands of rows and strictly more than the grid is showing, confirming it is the whole tenant rather than the current view.
**Data**: floor: more than 5,000 data rows (observed 8,996 on 2026-07-21); file rows > grid rows

---

## TC-CPR-OVR-130: Switching to the Labor tab re-scopes the grid but not the export
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-002, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with an office selected that has rows on both the Equipment and Labor tabs.

**Steps**:
1. On the Equipment tab, export and record both the file content and the grid row count
2. Switch to the Labor tab and confirm aria-selected moved and the grid row count changed
3. Export again
4. Compare the two files and read the distinct Is Labor values in the second one

**Expected**: The tab visibly re-scopes the grid but the two exports are identical, and the file still carries both Is Labor 0 and Is Labor 1 rows. The tab is a view filter the export ignores.
**Data**: Equipment/Labor tabs; Is Labor values 0 and 1 both present in the file

---

## TC-CPR-OVR-131: Choosing a different office re-scopes the grid but not the export
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-030, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and the grid loaded.

**Steps**:
1. Export and record the file and the grid row count
2. Open the Change Local Office picker and select office 1974
3. Confirm the grid now shows a different number of rows
4. Export again and compare the two files

**Expected**: Choosing a different office visibly changes the grid, and the two exports are identical. The location picker does not scope the export.
**Data**: second office 1974 (161 Equipment rows on 2026-07-21)

---

## TC-CPR-OVR-132: Active only hides inactive rows in the grid; the export keeps them
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-042, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected — the only walk-verified bed carrying inactive rows (9 total, 7 active).

**Steps**:
1. With Active only off, record the grid row count
2. Check Active only and confirm the grid row count dropped
3. Export and read the Is Active column

**Expected**: Active only visibly removes rows from the grid, yet the exported file still contains Is Active = 0 rows. The filter never reaches the file.
**Data**: office 1105; 9 rows unfiltered, 7 with Active only; inactive rows present in the export

---

## TC-CPR-OVR-133: The Currency filter empties the grid for an absent currency; the export still carries every currency
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-043, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with an office selected and the Currency filter at ALL.

**Steps**:
1. Record the grid row count at Currency ALL
2. Select a specific currency and confirm the grid row count changed
3. Export and read the distinct Currency values in the file

**Expected**: The Currency filter visibly re-scopes the grid — down to zero rows for a currency with no data — while the export still carries every currency in the tenant.
**Data**: currencies USD / CAD / MXN; at least 3 distinct currencies in the export

---

## TC-CPR-OVR-134: The text filter narrows the grid; the export is unchanged
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-045, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with an office selected and no text filter applied.

**Steps**:
1. Export and record the file and the grid row count
2. Type the first six characters of the first row’s Product Group Name into the filter box
3. Confirm the grid narrowed but still shows at least one row
4. Export again and compare the two files

**Expected**: The text filter visibly narrows the grid while the export is byte-for-byte unchanged. The needle is taken from a real row so the filter is guaranteed to match something.
**Data**: needle derived live from the first visible Product Group Name

---

## TC-CPR-OVR-135: Rows-per-page changes how much of the grid is drawn; the export is unchanged
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1974 selected (161 Equipment rows, enough to span pages).

**Steps**:
1. Set rows per page to 10, record how many rows are drawn, and export
2. Set rows per page to 50 and confirm more rows are drawn
3. Export again and compare the two files

**Expected**: Page size visibly changes how much of the grid is drawn while both exports are identical. Pagination is a view concern the export does not share.
**Data**: office 1974; page sizes 10 and 50

---

## TC-CPR-OVR-136: Export on an empty, unscoped grid still returns the whole tenant
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-003, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: A fresh load of the Override screen with no office selected — the grid reads "No results." / "0 items found".

**Steps**:
1. Confirm the grid is empty and shows zero rows
2. Click Export (the button stays enabled on an empty grid)
3. Count the data rows and the distinct Location Ids in the file

**Expected**: Export is enabled on an empty grid and downloads the entire tenant. What the screen shows and what the file contains are unrelated — this is the surprising branch, recorded deliberately so a future change to it is caught.
**Data**: no office selected; floors of 5,000 rows and 500 locations

---

## TC-CPR-OVR-137: The Equipment grid row count reconciles with the export rows for that office
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected, the Equipment tab active and Active only off.

**Steps**:
1. Read the grid row count
2. Export and keep only the rows whose Location Id matches the selected office
3. Split those rows on Is Labor

**Expected**: The Is Labor = 0 rows for this office match the Equipment grid row count exactly, and the office’s total rows in the file are greater than or equal to that. The file folds both tabs together; the grid shows one half at a time. This is why a raw "grid count equals file count" comparison would be wrong.
**Data**: Equipment grid count vs Is Labor = 0 rows for the same Location Id

---

## TC-CPR-OVR-138: The export tolerates rows with no Override Price and never drops them
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-038
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected.

**Steps**:
1. Export and capture the CSV
2. Read the Override Price column from every data row
3. Count the blank values

**Expected**: The file is allowed to contain rows with no Override Price and they are never dropped, while the vast majority of rows do carry one. Asserting the current contract rather than the desired one: the app’s own import rejects these rows, so a test demanding a price on every row would fail on every run today.
**Data**: blank Override Price rows tolerated but fewer than the total

---

## TC-CPR-OVR-139: The CSV is well-formed — consistent line endings, a full column set on every row, and quoted inch marks
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-038
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected.

**Steps**:
1. Export and read the raw bytes of the downloaded file
2. Check the line endings on the bytes, not on the decoded text
3. Split every data row and compare its field count to the header
4. Find the rows that use doubled quotes and check the quoting is well formed

**Expected**: Line endings are plain LF with no carriage returns anywhere, every data row has the full nine fields, and product group names containing inch marks are correctly quoted with doubled quote characters. Checked on the raw bytes because reading the file as text hides the line-ending difference.
**Data**: LF endings, zero CR bytes; 9 fields per row; more than 100 quoted rows

---

## TC-CPR-OVR-140: The header row follows the requested locale while the data rows stay identical
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen, signed in. The export endpoint is called directly because the Export button always sends en-US.

**Steps**:
1. Request the export at en-US and record the header row and data rows
2. Request it at each translating locale and compare the header and the data
3. Request it at each fallback locale and compare the header

**Expected**: French and Mexican Spanish translate the header row; German and British English fall back to the English header. In every case the data rows are identical to English — a locale that reformatted numbers would corrupt every row of a comma-delimited file, so this is the half that matters.
**Data**: translating: fr-FR, es-MX; fallback: de-DE, en-GB

---

## TC-CPR-OVR-141: A malformed or unknown locale falls back to English instead of failing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-079
**Automatable**: Yes

**Preconditions**: On the Override screen, signed in.

**Steps**:
1. Request the export with each malformed locale value
2. Compare each response status, header row and row count against en-US
3. Request the export with the locale parameter omitted entirely

**Expected**: Every malformed or unknown locale returns 200 with the English header and the same data — the endpoint degrades gracefully instead of failing. Omitting the parameter behaves the same as English.
**Data**: malformed values: zz-ZZ, xx, %20; plus the parameter omitted

---

## TC-CPR-OVR-142: The grid loads for every healthy office, and office 1604 still fails the way we recorded it
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-001
**Automatable**: Yes

**Preconditions**: On the Override screen, signed in.

**Steps**:
1. Ask the grid’s data endpoint for each known-healthy office and check the status code
2. Ask it for office 1604 and check the status code and the error body

**Expected**: Every healthy office returns 200. Office 1604 still returns a server error carrying the same duplicate-key signature that was recorded, or 200 if it has since been fixed. Reads the status code rather than the grid because the screen renders a failed request as "0 items found" — indistinguishable from a genuinely empty office, which would let an ordinary emptiness assertion pass on a broken screen.
**Data**: healthy: 1105, 1974, 9187, 9019, 9185, 1115; known-bad: 1604 ("same key has already been added")

---

## TC-CPR-OVR-143: Tab, Currency and Active only combine without losing rows or breaking the export
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-044, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and no filters applied.

**Steps**:
1. Export to establish a baseline file
2. Record the unfiltered grid row count
3. Apply Active only and record the count
4. Add a specific Currency and record the count
5. Switch to the Labor tab with both filters still applied
6. Export again and compare against the baseline

**Expected**: Each filter added narrows the result or leaves it unchanged — never widens it — the tab still switches with two filters applied, and no combination of filters changes the exported file.
**Data**: Active only + a specific Currency + the Labor tab, applied together

---

## TC-CPR-OVR-144: Rows-per-page survives a reload, and the export is unaffected either way
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-073
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1974 selected.

**Steps**:
1. Export to establish a baseline file
2. Set rows per page to 50 and confirm more rows are drawn than the default
3. Reload the page and re-select the office
4. Read the grid row count and export again

**Expected**: Whether the page-size choice survives a reload is the app’s decision and is read rather than assumed; what must hold either way is that the grid still renders rows and the export is identical to the baseline.
**Data**: office 1974; default page size 20, changed to 50, then reloaded

---

## TC-CPR-OVR-145: Sorting the grid does not reorder the exported file
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-046, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and no sort applied.

**Steps**:
1. Export and record the file and the first row’s Product Group Name
2. Sort Product Group Name descending via the column header menu
3. Confirm the first grid row changed
4. Export again and compare the two files

**Expected**: Sorting visibly re-orders the grid while the exported file keeps its own server-side order, unchanged. Note that sorting lives on the header dropdown, not on a header click — a header click is inert.
**Data**: Product Group Name sorted descending via the header menu

---

## TC-CPR-OVR-146: A row visible in the grid appears in the export with the same price, and text values survive intact
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-038, TC-CPR-OVR-066
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected and the grid loaded.

**Steps**:
1. Read the first grid row's Product Group Id, Product Group Name and Override Price
2. Click Export and capture the CSV
3. Find the file row matching that office and product group
4. Compare the Override Price numerically (the grid adds thousands separators)
5. Collect every product group name that begins with a leading zero and check it survived as text
6. Check the final data row is complete and the whole file decodes as valid UTF-8

**Expected**: The override a user sees on screen is present in the exported file with the same price, so the grid and the file agree on the same record. Product group names with leading zeros (for example "07A Compass Screen Set Kit") keep them, which is what proves the value was not passed through a number type. The final row carries its full field set, proving the download was not truncated, and no character was mangled in decoding.

**Data**: office 1105; first grid row matched by Location Id + Product Group Id; leading-zero names present in the tenant

---

## TC-CPR-OVR-147: Override Discount stays on the fraction scale, and the known percent-scale rows do not spread
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-037, TC-CPR-OVR-038
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected and the grid loaded.

**Steps**:
1. Click Export and capture the CSV
2. Read every non-empty Override Discount value with its office and product group
3. Split them into values at or below 1 (the fraction scale) and values above 1
4. Check the fraction scale is overwhelmingly the norm
5. Check the count of above-1 rows has not grown, and report each one as the percentage it renders

**Expected**: Override Discount is stored as a fraction and displayed as a percentage — 0.06 in the file reads as "6.00 %" in the grid. A small number of rows break that convention and store a raw percentage instead (13, 14, 20), so the grid renders them as 1300.00 %, 1400.00 % and 2000.00 % — well above the 0-100 cap the app enforces when the value is typed in. Confirmed independently against the export file, the grid's data API and the rendered grid. The count is pinned in both directions: growth means the bad rows are spreading, and a drop to zero means they were cleaned up and this guard can be retired.

**Data**: office 1105; 260 rows at or below 1 versus 4 rows above; cap 100; offices 1174 (product groups 4298 and 2609), 1312 and 1604 (product group 907)

---

## TC-CPR-OVR-148: Import dialog keeps Upload disabled until a file is attached
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-033
**Automatable**: Yes

**Preconditions**: On the Override screen with the certified import target office 4107 selected; no file attached.

**Steps**:
1. Open the Import toolbar action → the "Import All Pricing Overrides" dialog opens with a Cancel control
2. Read the Upload button state before attaching a file → disabled; the "No file selected" hint is shown
3. Attach a file to the dialog's file input → the Upload button becomes enabled
4. Cancel the dialog → it closes with nothing uploaded

**Expected**: The Upload button stays disabled and "No file selected" is shown until a file is attached; attaching a file enables Upload. This gate prevents an empty upload. Cancel dismisses the dialog without importing.
**Data**: office=4107; dialog title="Import All Pricing Overrides"; attached fixture=malformed.csv (any file exercises the enable transition)

---

## TC-CPR-OVR-149: Malformed CSV is rejected with a readable error and changes zero rows
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; the target row (product group 4298) present with its baseline Override Price.

**Steps**:
1. Capture the target row's Override Price and the visible row count before the import
2. Open the Import dialog → attach malformed.csv → click Upload
3. Read the rejection alert → matches "Error Row#:N, Msg: LocationId, ProductGroupId, OverridePrice is required."
4. Reload + re-select office 4107 and re-read the grid

**Expected**: A malformed CSV is rejected with a readable required-field error and the dialog stays open. After a reload the Override Price and row count are unchanged — the rejection prevented any mutation (the reload is the oracle, not the upload's own signal).
**Data**: office=4107; fixture=malformed.csv (import-all); reject pattern=/Error Row#:\d+, Msg: LocationId, ProductGroupId, OverridePrice is required\./

---

## TC-CPR-OVR-150: Empty CSV is rejected with a file-format error and changes zero rows
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; the target row (product group 4298) present with its baseline Override Price.

**Steps**:
1. Capture the target row's Override Price and the visible row count before the import
2. Open the Import dialog → attach empty.csv (0 bytes) → click Upload
3. Read the rejection alert → equals "Please check the upload file format."
4. Reload + re-select office 4107 and re-read the grid

**Expected**: An empty file is rejected with a readable file-format error (a distinct message from the malformed-row error) and the dialog stays open. After a reload the Override Price and row count are unchanged.
**Data**: office=4107; fixture=empty.csv (import-all); reject message="Please check the upload file format."

---

## TC-CPR-OVR-151: Valid import round-trip updates the Override Price then restores it (office 4107 / product group 4298)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The Export toolbar action produces the tenant-wide CSV (used here only to read the exact target row).

**Steps**:
1. Export the CSV and extract the single target row (office 4107 / product group 4298) verbatim, together with the header line
2. Read the target row's live baseline Override Price; compute a modified value = baseline + 0.01
3. Build a minimal 2-line file (header + the one target row) with only the Override Price rewritten; upload it and wait for the import request to return
4. Assert the import request is accepted (HTTP 200), then reload and assert the target's Override Price equals the modified value
5. Canary: re-select office 1105 and assert its full row set is intact (a minimal import upserts only the rows in the file, so a location absent from the file must keep every row)
6. Build and upload the baseline file the same way to restore; reload and assert the Override Price is back to the original

**Expected**: A minimal valid import updates the target Override Price and restores it. The import commits directly (no preview) and upserts only the rows present in the file, so a location absent from the file is left untouched. A minimal file returns a clean HTTP 200 — unlike the full tenant dump, which stalls the client at "Uploading… 50%" with no response — giving the round-trip a deterministic completion signal.
**Data**: office=4107; product group=4298; modified=baseline+0.01; canary office=1105 (9 rows); upload file = header + the single target row

---

## TC-CPR-OVR-152: Raw export with an empty Override Price row is rejected and changes nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present with its baseline Override Price. The raw tenant-wide export still contains one empty-Override-Price row.

**Steps**:
1. Capture the target row's Override Price before the import
2. Export the tenant-wide CSV and confirm it still carries the empty-Override-Price row
3. Open the Import dialog → attach the raw unmodified export → click Upload
4. Read the rejection alert → matches "Error Row#:N, Msg: LocationId, ProductGroupId, OverridePrice is required."
5. Reload + re-select office 4107 and re-read the grid

**Expected**: The raw export is rejected on its empty-Override-Price row and the whole import aborts with no partial apply (full rollback). The target Override Price is unchanged after a reload. Documents the live regression where a freshly exported file cannot be re-imported without first removing its empty-price row. The row number is data-position-dependent (observed at Row#:19), so the stable required-field message is asserted, not a fixed row index.
**Data**: office=4107; empty-price row prefix "1115,286,"; reject pattern=/Error Row#:\d+, Msg: LocationId, ProductGroupId, OverridePrice is required\./

---

## TC-CPR-OVR-153: Import rejects a row with an invalid currency and applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The import is a per-row partial-success upload that returns a result body with success/failure counts — a 200 response does not by itself mean a row applied.

**Steps**:
1. Read the target row's Override Price before the import
2. Open the Import dialog → attach a file whose single row carries an unsupported currency → click Upload
3. Read the import result: the request returns HTTP 200 but reports 0 rows applied, 1 failed, with an error naming the Currency field
4. Reload + re-select office 4107 and re-read the grid

**Expected**: The invalid-currency row is refused (0 applied, 1 failed) and the grid is unchanged. Confirms a 200 response alone is not proof of application — the per-row result body is the oracle.
**Data**: office=4107; product group=4298; fixture=override-invalid-currency.csv; error contains "invalid data for Currency"

---

## TC-CPR-OVR-154: Import rejects a negative Override Price and applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Read the target row's Override Price before the import
2. Attach a file whose row sets a negative Override Price → click Upload
3. Read the result: HTTP 200, 0 applied, 1 failed, error naming the Override Price field
4. Reload and re-read the grid

**Expected**: The negative-price row is refused and the grid is unchanged.
**Data**: office=4107; product group=4298; fixture=override-negative-price.csv; error contains "invalid data for OverridePrice"

---

## TC-CPR-OVR-155: Import rejects an Override Discount above 100 — the 100 cap is enforced on import too
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The grid caps Max Discount at 100 on manual edit.

**Steps**:
1. Read the target row's Override Price before the import
2. Attach a file whose row sets an Override Discount greater than 100 → click Upload
3. Read the result: HTTP 200, 0 applied, 1 failed, error naming the Override Discount field
4. Reload and re-read the grid

**Expected**: The over-100 discount row is refused — import enforces the same 100 cap as the grid (no import backdoor around the cap). The grid is unchanged.
**Data**: office=4107; product group=4298; fixture=override-discount-over-100.csv; error contains "invalid data for OverrideDiscount"

---

## TC-CPR-OVR-156: Import rejects a non-numeric Override Price with a decimal-format error
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Read the target row's Override Price before the import
2. Attach a file whose row sets a non-numeric Override Price → click Upload
3. Read the rejection alert
4. Reload and re-read the grid

**Expected**: A non-numeric price is rejected with a message that the Override Price must be a decimal within two decimal places; the grid is unchanged. (This is a parse-level rejection surfaced as an alert, distinct from the body-level semantic rejections.)
**Data**: office=4107; product group=4298; fixture=override-nonnumeric-price.csv; alert pattern=/Error Row#:\d+, Msg: The Override Price should be decimal format within two decimal places\./

---

## TC-CPR-OVR-157: Import rejects a nonexistent Product Group Id and applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Read the target row's Override Price before the import
2. Attach a file whose row references a product group id that does not exist → click Upload
3. Read the result: HTTP 200, 0 applied, 1 failed, error stating the product group id does not exist
4. Reload and re-read the grid

**Expected**: The row referencing a nonexistent product group is refused (referential integrity) and the grid is unchanged.
**Data**: office=4107; fixture=override-nonexistent-pg.csv; error contains "ProductGroupId '9999999' does not exist"

---

## TC-CPR-OVR-158: Import rejects a nonexistent Location and applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Read the target row's Override Price before the import
2. Attach a file whose row references a location number that does not exist → click Upload
3. Read the result: HTTP 200, 0 applied, 1 failed, error stating the location does not exist
4. Reload and re-read the grid

**Expected**: The row referencing a nonexistent location is refused and the grid is unchanged.
**Data**: office=4107; fixture=override-nonexistent-location.csv; error contains "LocationNo '9999999' does not exist"

---

## TC-CPR-OVR-159: Import rejects a row with too few columns naming the required fields
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Read the target row's Override Price before the import
2. Attach a file whose data row has fewer columns than the header → click Upload
3. Read the rejection alert
4. Reload and re-read the grid

**Expected**: A row with missing columns is rejected with a message naming the required Location / Product Group / Override Price fields; the grid is unchanged.
**Data**: office=4107; product group=4298; fixture=override-too-few-columns.csv; alert pattern=/Error Row#:\d+, Msg: LocationId, ProductGroupId, OverridePrice is required\./

---

## TC-CPR-OVR-160: Import ignores extra trailing columns and applies the valid row
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The fixture keeps the certified baseline Override Price so acceptance is proven without changing the value.

**Steps**:
1. Attach a file whose row carries two extra trailing columns beyond the header → click Upload
2. Read the result: HTTP 200, 1 applied, 0 failed
3. Reload and re-read the grid

**Expected**: Extra trailing columns are ignored (not an error); the leading fields are taken and the row is applied. The grid holds the certified baseline value (no drift).
**Data**: office=4107; product group=4298; fixture=override-extra-columns.csv; baseline Override Price 152.00

---

## TC-CPR-OVR-161: Import rejects a header-only file with a file-format error
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Read the target row's Override Price before the import
2. Attach a file that has only the header and no data rows → click Upload
3. Read the rejection alert
4. Reload and re-read the grid

**Expected**: A header-only file is rejected with a "Please check the upload file format." message; the grid is unchanged.
**Data**: office=4107; product group=4298; fixture=override-header-only.csv; alert="Please check the upload file format."

---

## TC-CPR-OVR-162: Import blocks a non-CSV file — Upload stays disabled with an unsupported-type message
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Open the Import dialog → attach a plain-text (.txt) file
2. Read the Upload button state and the dialog message

**Expected**: A non-CSV file leaves the Upload button disabled and the dialog shows "Unsupported file type. Allowed: .csv" — the upload never fires. The file-type gate is client-side.
**Data**: office=4107; fixture=wrong-format.txt; message="Unsupported file type. Allowed: .csv"

---

## TC-CPR-OVR-163: Import dialog shows the attached file and dismisses without uploading
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Open the Import dialog → confirm it starts with a "No file selected" hint and offers both a Cancel and a Close control
2. Attach a file → confirm the "No file selected" hint is gone (the attached file registered)
3. Dismiss the dialog

**Expected**: The dialog offers two redundant dismiss controls (Cancel and Close). Attaching a file clears the "No file selected" hint, and dismissing closes the dialog with nothing uploaded.
**Data**: office=4107; fixture=malformed.csv (attach only, no upload)

---

## TC-CPR-OVR-164: A file mixing one valid row and one invalid row is a partial success — the valid row applies, the invalid one fails
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The import processes rows independently (a per-row partial-success upload), not all-or-nothing.

**Steps**:
1. Read the target row's baseline Override Price
2. Build a two-row file: row 1 re-imports the target at its current baseline value (a valid row that changes nothing), row 2 references a nonexistent product group
3. Upload the file and read the import result
4. Reload + re-read the grid

**Expected**: The upload is a partial success — the valid row applies (1 applied) while the invalid row fails independently (1 failed) with an error naming the nonexistent product group. Rows are NOT all-or-nothing. The target keeps its baseline value.
**Data**: office=4107; product group=4298; valid row at baseline + invalid product group 9999999; error contains "ProductGroupId '9999999' does not exist"

---

## TC-CPR-OVR-165: A file with duplicate rows for the same override is accepted (both rows succeed, no duplicate error)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Read the target row's baseline Override Price
2. Build a file with the same target row twice, both at the current baseline value (so the import changes nothing)
3. Upload the file and read the import result
4. Reload + re-read the grid

**Expected**: Both duplicate rows are accepted (2 applied, 0 failed) — the import does not reject duplicate keys; it is idempotent. The target keeps its baseline value.
**Data**: office=4107; product group=4298; target row duplicated at baseline

---

## TC-CPR-OVR-166: A large batch (6000 rows) is processed per-row without a stall or size limit
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
1. Read the target row's baseline Override Price
2. Build a 6000-row file, every row referencing a nonexistent product group (reject-safe — no row can change data)
3. Upload the file and read the import result
4. Reload + re-read the grid

**Expected**: The large batch returns a normal per-row result (0 applied, 6000 failed) without a stall or a "file too large" error — there is no separate oversized-file gate, and a large all-invalid file does not exhibit the full-valid-dump stuck-upload behavior. The target is unchanged.
**Data**: office=4107; 6000 rows referencing product group 9999999
