# Corporate Pricing — Product Group Override Test Cases (NM-1463, Wave-1.5-A FCC)

**Module**: corporate-pricing | **Total**: 28 | **Status**: Automated | **Updated**: 2026-06-09

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
- **Max Discount %**: numeric, renders "N.00 %"; **capped at 100** — entering >100 is REJECTED (the inline editor refuses to commit). Valid 0–100 incl. decimals commit (CPR-WV15-Q3).
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

**Expected**: Selecting office 1604 populates the override grid (content-anchored, not count-asserted per LR-022).
**Data**: office=1604

---

## TC-CPR-OVR-005: Grid renders all 10 column headers
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected.

**Steps**:
1. Read the grid column headers -> Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By

**Expected**: All 10 columns render, including the Updated By column.
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

**Expected**: The client-side filter narrows the rendered grid by Product Group Name (no Search button).
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

## TC-CPR-OVR-015: No-match filter empties the grid; clearing restores rows
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

**Expected**: The Override Price accepts BVA values 0 and a large number (client does not block; no commit).
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

**Expected**: The Override Price input is `type=number` — non-numeric text is rejected (coerced to empty); no alpha retained (LR-011). Editor is Escaped (no commit).
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-023: Max Discount % — out-of-range (>100) handling (under review)
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

**Expected**: A normal percentage (incl. decimals) commits and dirties the form. For a value over 100, the field currently does not commit AND does not show a validation error or release focus (the cursor stays trapped until the value is lowered to <=100) — this is a defect under review, so the case is parked. Once resolved, an out-of-range entry should surface a clear validation message and still allow the user to leave the field.
**Data**: office=1604, product group=2605

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

**Preconditions**: On the Override screen with 1604 selected; fixture row 2605 at its default (445.00).

**Steps**:
1. (baseline) Ensure 2605 Override Price = 445.00
2. Edit Override Price to a new value -> Save enabled
3. Save -> "Save Changes" dialog -> confirm -> `POST corporate-price-pg-override` -> toast
4. Reload + re-select location -> the new value persists in the grid
5. (cleanup) Restore 2605 to 445.00 via `ensureDefaultState()`

**Expected**: A saved Override Price persists after reload; the fixture is restored to its baseline (no drift).
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-026: Max Discount % save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-023
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected; fixture row 2605 at its default.

**Steps**:
1. (baseline) Ensure 2605 at default
2. Edit Max Discount % to a value -> Save enabled
3. Save -> dialog -> confirm -> reload + re-select -> the Max Discount value persists
4. (cleanup) Restore 2605 via `ensureDefaultState()`

**Expected**: A saved Max Discount % persists after reload; the fixture is restored.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-027: Active toggle save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-024
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected; fixture row 2605 at its default Active state.

**Steps**:
1. (baseline) Ensure 2605 at default
2. Toggle the Active checkbox -> Save enabled
3. Save -> dialog -> confirm -> reload + re-select -> the toggled Active state persists
4. (cleanup) Restore 2605 Active via `ensureDefaultState()`

**Expected**: A saved Active toggle persists after reload; the fixture is restored.
**Data**: office=1604, product group=2605

---

## TC-CPR-OVR-028: Save opens the "Save Changes" dialog; Cancel aborts without committing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-018
**Automatable**: Yes

**Preconditions**: On the Override screen with 1604 selected; fixture row 2605 at its default.

**Steps**:
1. Edit the Override Price -> Save enabled
2. Click Save -> a "Save Changes" dialog appears ("Are you sure you want to save the changes?", Cancel/Save)
3. Click Cancel -> dialog closes; no commit
4. (cleanup) `ensureDefaultState()` reloads + restores

**Expected**: Save opens the shared "Save Changes" confirmation dialog; Cancel aborts without committing.
**Data**: office=1604, product group=2605
