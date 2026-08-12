# Location Pricing Test Cases
**Module**: locations | **Total**: 37 | **Status**: Automated | **Updated**: 2026-06-19

> Reconciled 2026-06-19 against the live app and the dated field inventory
> (`pricing-2026-06-19.md`). The pricing save API is healthy: dropdown and date changes save
> (HTTP 200) and round-trip after reload. One application defect remains open — see TC-025.

---

## FIELD INVENTORY & DISCOVERY

**Top Section Fields** (4 fields):
- **Checkboxes**: 2 (Corporate Pricing, Include Service Fee in Price Guides)
- **Dropdowns**: 1 (Currency filter)
- **Button**: 1 (Save — dedicated to the Pricing tab)

**Primary Pricing Section** — editable dropdownes, enabled when Corporate Pricing is checked:
- Office 1604 (single-currency): 5 USD dropdowns — Primary Labor, Primary Equipment, Primary Internal Equipment, Primary Production Labor, Primary Production Equipment.
- Office 1605 (multi-currency): 15 dropdowns — the same five per currency for USD, CAD, and MXN.

**Location Secondary Pricing Grid Columns** (7 columns, left to right):
1. **Pricing Strategy** (read-only text)
2. **Pricebook** (read-only text)
3. **Currency** (read-only text)
4. **Is Alternative** (checkbox)
5. **Use Effective Dates** (checkbox)
6. **Start Date** (calendar-only date picker, read-only input)
7. **End Date** (calendar-only date picker, read-only input)

**Grid Rows**: 32 price book rows on office 1604 (live count 2026-06-19). The automated office-1604
tests act on three stable USD rows: `2021-Tier 3 Urban A` (primary), `2022-Zone 5 A` (secondary),
`2022-Zone 1 A` (tertiary).

**Cascading Dependencies** (per row):
1. **Is Alternative** unchecked -> **Use Effective Dates** disabled
2. **Is Alternative** checked -> **Use Effective Dates** enabled
3. **Use Effective Dates** unchecked -> **Start Date** and **End Date** disabled
4. **Use Effective Dates** checked -> **Start Date** and **End Date** enabled
5. Unchecking **Is Alternative** disables and clears the row's date fields

**Corporate Pricing master toggle** (confirmed live 2026-06-19):
- Unchecking Corporate Pricing disables the primary pricing dropdowns only.
- The secondary grid (Is Alternative, Use Effective Dates, Start/End Date) stays editable.

**Date inputs**: the Start/End date inputs are read-only — values are entered only by selecting a day
in the calendar popover, not by typing. A missing required date shows a validation message while the
popover is open.

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| All five primary pricing dropdowns are disabled when Corporate Pricing is unchecked | Unchecking Corporate Pricing disables all primary dropdowns; the grid fields are unaffected |
| Use Effective Dates is disabled until Is Alternate is checked | Checking Is Alternate enables the Use Effective Dates checkbox for that row |
| Start Date and End Date are disabled until Use Effective Dates is checked | Both date inputs enable only after Use Effective Dates is checked for that row |
| Start Date must be before End Date | A Start date equal to or after End date blocks Save |
| Missing Start or End Date blocks Save | A row with Use Effective Dates checked but a date field empty blocks Save |

---

## MCP_VERIFICATION_LOG

Observed on office 1604 in the sessions recorded in the field inventory
`pricing-2026-06-19.md` (machine-enumerated walk 2026-06-19, denominator 79/79). Each row is an
observation, not an expectation. Rows marked "Not settled" are recorded because they were reached
for and not resolved; no test case asserts them as fact.

| # | Verified | Result |
|---|---|---|
| 1 | Corporate Pricing checkbox default | Checked (true) |
| 2 | Include Service Fee in Price Guides default | Checked (true); old-site label is "Include Service Charge" — wording divergence, not a defect |
| 3 | Currency filter options on office 1604 | "All" and "USD" (2 options; office 1604 is USD-only) |
| 4 | Primary pricing dropdowns on office 1604 | Exactly 5, all USD; all default to "--Select--" (unset on 1604) |
| 5 | Unchecking Corporate Pricing | Disables all 5 primary dropdowns; does NOT disable grid fields |
| 6 | BUG-LOC-PRI-001 | Unchecking Corporate Pricing and saving returns HTTP 200 but the value reverts on reload |
| 7 | Location Secondary Pricing grid | 32 rows on office 1604; 7 columns: Pricing Strategy, Pricebook, Currency, Is Alternate, Use Effective Dates, Start Date, End Date |
| 8 | Grid cascade | Is Alternate checked → Use Effective Dates becomes enabled → Start and End date inputs become enabled |
| 9 | Save button default | Disabled on clean load; enables when form is dirty |
| 10 | Save dialog | "Are you sure you want to save the changes?" with Cancel and Ok |
| 11 | Save endpoints (live) | `POST .../upsert-location-pricebook` and `PUT .../update-properties` (both HTTP 200); the spec-comment endpoint name "POST update-location-pricing" is stale |

---
## TC-LOC-PRI-001: Verify Pricing tab default state
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Default State |

**Depends_On**: none (per-test baseline restore runs first)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Setup > Location > 1604, then open the "Pricing" tab and verify it loads. | The Pricing tab loads and its content is visible. |
| 2 | Verify the "Corporate Pricing" checkbox is checked. | The "Corporate Pricing" checkbox is checked. |
| 3 | Verify the "Include Service Fee in Price Guides" checkbox is checked. | The "Include Service Fee in Price Guides" checkbox is checked. |
| 4 | Verify the "Currency" filter shows "All". | The Currency filter shows "All". |

**Expected**: Pricing tab loads with Corporate Pricing and Include Service Fee both checked and the Currency filter set to "All"
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §3 — office 1604 defaults: Corporate Pricing checked, Include Service Fee checked, Currency filter "All"
**Automatable**: Yes

---

## TC-LOC-PRI-002: Verify Primary Pricing fields default state (5 editable dropdowns)
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Default State |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Pricing" tab and verify it loads. | The Pricing tab loads and its content is visible. |
| 2 | Verify the five USD primary pricing dropdowns are present: Primary Labor, Primary Equipment, Primary Internal Equipment, Primary Production Labor, and Primary Production Equipment. | All five USD primary pricing dropdowns are present: Primary Labor, Primary Equipment, Primary Internal Equipment, Primary Production Labor, and Primary Production Equipment. |
| 3 | Verify all five are enabled when "Corporate Pricing" is checked. | All five primary pricing dropdowns are enabled. |

**Expected**: All five USD primary pricing dropdowns are enabled when Corporate Pricing is checked
**Data**: office=1604
**Notes**: Primary pricing fields are editable dropdownes, not read-only display fields.
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §1 — five USD primary dropdowns render and are enabled on office 1604 with Corporate Pricing checked
**Automatable**: Yes

---

## TC-LOC-PRI-003: Verify Location Secondary Pricing grid structure (7 columns)
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Structure |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Pricing" tab and verify it loads. | The Pricing tab loads and its content is visible. |
| 2 | Locate the "Location Secondary Pricing" grid. | The Location Secondary Pricing grid is visible in the lower section of the tab. |
| 3 | Verify the seven column headers in order: Pricing Strategy, Pricebook, Currency, Is Alternative, Use Effective Dates, Start Date, End Date. | The seven column headers appear in order: Pricing Strategy, Pricebook, Currency, Is Alternative, Use Effective Dates, Start Date, End Date. |
| 4 | Verify the primary test row "2021-Tier 3 Urban A" is present. | The "2021-Tier 3 Urban A" row is present in the grid. |

**Expected**: The grid shows seven columns in the correct order and the primary test row is present
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §2 — seven grid column headers in order; primary test row present
**Automatable**: Yes

---

## TC-LOC-PRI-004: Verify grid row default state
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Default State |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Pricing" tab and verify it loads. | The Pricing tab loads and its content is visible. |
| 2 | On the "2021-Tier 3 Urban A" and "2022-Zone 5 A" rows: verify "Is Alternative" is unchecked, "Use Effective Dates" is disabled, "Start Date" is disabled, and "End Date" is disabled. | On both rows, "Is Alternative" is unchecked, "Use Effective Dates" is disabled, "Start Date" is disabled, and "End Date" is disabled. |

**Expected**: Test rows start with Is Alternative unchecked and the cascaded date fields disabled
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — clean grid rows: Is Alternative unchecked, dependent date fields disabled
**Automatable**: Yes

---

## TC-LOC-PRI-005: Enable Use Effective Dates by checking Is Alternative
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2021-Tier 3 Urban A" row, verify "Use Effective Dates" is disabled. | "Use Effective Dates" is disabled. |
| 2 | Check "Is Alternative". | "Is Alternative" is checked. |
| 3 | Verify "Use Effective Dates" becomes enabled. | "Use Effective Dates" becomes enabled and can now be clicked. |

**Expected**: Checking Is Alternative enables the Use Effective Dates checkbox
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — cascade: Is Alternative checked enables Use Effective Dates
**Automatable**: Yes

---

## TC-LOC-PRI-006: Use Effective Dates stays disabled when Is Alternative unchecked
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2022-Zone 5 A" row, verify "Is Alternative" is unchecked. | "Is Alternative" is unchecked. |
| 2 | Verify "Use Effective Dates" is disabled and not clickable. | "Use Effective Dates" is disabled and cannot be clicked. |
| 3 | Verify "Is Alternative" is still unchecked. | "Is Alternative" remains unchecked. |

**Expected**: Use Effective Dates cannot be checked while Is Alternative is unchecked (one-way cascade)
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — Use Effective Dates disabled while Is Alternative unchecked
**Automatable**: Yes

---

## TC-LOC-PRI-007: Full cascade — Is Alternative + Use Effective Dates enables Start/End Date
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2021-Tier 3 Urban A" row, verify "Start Date" and "End Date" are disabled. | "Start Date" and "End Date" are both disabled. |
| 2 | Check "Is Alternative". | "Is Alternative" is checked. |
| 3 | Check "Use Effective Dates". | "Use Effective Dates" becomes enabled. |
| 4 | Verify "Start Date" and "End Date" both become enabled. | Both "Start Date" and "End Date" become enabled. |

**Expected**: Turning on "Is Alternative" and then "Use Effective Dates" enables the Start and End date fields
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — full cascade enables Start/End date fields
**Automatable**: Yes

---

## TC-LOC-PRI-008: Start/End Date remain disabled when Use Effective Dates unchecked
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2022-Zone 1 A" row, check "Is Alternative" so "Use Effective Dates" becomes enabled. | "Is Alternative" is checked and "Use Effective Dates" is now enabled. |
| 2 | Leave "Use Effective Dates" unchecked. | "Use Effective Dates" remains unchecked. |
| 3 | Verify "Start Date" and "End Date" are both disabled. | "Start Date" and "End Date" are both disabled. |

**Expected**: Date fields stay disabled until Use Effective Dates is checked
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — dates disabled while Use Effective Dates unchecked
**Automatable**: Yes

---

## TC-LOC-PRI-009: Uncheck Use Effective Dates clears Start/End Date values
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2021-Tier 3 Urban A" row, enable the full cascade. | The full cascade is enabled and the date fields are available for input. |
| 2 | Enter "Start Date" = 03/01/2026 and "End Date" = 03/31/2026. | "Start Date" shows 03/01/2026 and "End Date" shows 03/31/2026. |
| 3 | Uncheck "Use Effective Dates". | "Use Effective Dates" is unchecked. |
| 4 | Re-check "Use Effective Dates". | "Use Effective Dates" is checked. |
| 5 | Verify "Start Date" and "End Date" are both cleared. | "Start Date" and "End Date" are both empty. |

**Expected**: Unchecking Use Effective Dates clears the date values
**Data**: office=1604 | startDate=03/01/2026 | endDate=03/31/2026
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — unchecking Use Effective Dates clears Start/End values
**Automatable**: Yes

---

## TC-LOC-PRI-010: Uncheck Is Alternative disables and clears all row fields
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2021-Tier 3 Urban A" row, enable the full cascade and enter "Start Date" = 05/15/2026. | The cascade is enabled and "Start Date" shows 05/15/2026. |
| 2 | Uncheck "Is Alternative". | "Is Alternative" is unchecked. |
| 3 | Verify "Use Effective Dates" is disabled and unchecked. | "Use Effective Dates" is disabled and unchecked. |
| 4 | Verify "Start Date" and "End Date" are disabled. | "Start Date" and "End Date" are both disabled. |

**Expected**: Unchecking Is Alternative disables Use Effective Dates and the date fields and clears their values
**Data**: office=1604 | startDate=05/15/2026
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — unchecking Is Alternative cascades down (disable + clear)
**Automatable**: Yes

---

## TC-LOC-PRI-011: Corporate Pricing unchecked disables all Primary pricing dropdowns
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify the five primary dropdowns are enabled. | All five primary pricing dropdowns are enabled. |
| 2 | Uncheck "Corporate Pricing". | "Corporate Pricing" is unchecked. |
| 3 | Verify all five primary dropdowns become disabled. | All five primary pricing dropdowns are disabled. |
| 4 | Restore: re-check "Corporate Pricing". | "Corporate Pricing" is checked again. |

**Expected**: Unchecking Corporate Pricing disables all five primary pricing dropdowns
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — Corporate Pricing unchecked disables the primary dropdowns
**Automatable**: Yes

---

## TC-LOC-PRI-012: Corporate Pricing toggle does NOT disable grid fields
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2021-Tier 3 Urban A" row, check "Is Alternative" and "Use Effective Dates". | "Is Alternative" and "Use Effective Dates" are both checked on the row. |
| 2 | Uncheck "Corporate Pricing". | "Corporate Pricing" is unchecked. |
| 3 | Verify "Is Alternative" is still enabled. | "Is Alternative" remains enabled and checked. |
| 4 | Verify "Use Effective Dates" is still enabled. | "Use Effective Dates" remains enabled and checked. |
| 5 | Restore: re-check "Corporate Pricing" and reset the row. | "Corporate Pricing" is restored and the row is reset to its default state. |

**Expected**: Unchecking Corporate Pricing leaves the secondary grid fields editable
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — Corporate Pricing toggle does not disable grid fields
**Automatable**: Yes

---

## TC-LOC-PRI-013: Re-enable Primary fields by checking Corporate Pricing
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Uncheck "Corporate Pricing" and verify the primary dropdowns become disabled. | The five primary pricing dropdowns are disabled. |
| 2 | Check "Corporate Pricing". | "Corporate Pricing" is checked. |
| 3 | Verify all five primary dropdowns are re-enabled. | All five primary pricing dropdowns are enabled. |

**Expected**: Re-checking Corporate Pricing re-enables the primary pricing dropdowns
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — re-checking Corporate Pricing re-enables the primary dropdowns
**Automatable**: Yes

---

## TC-LOC-PRI-014: Currency filter displays "All" by default
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | Default State |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Pricing" tab. | The Pricing tab loads and its content is visible. |
| 2 | Verify the "Currency" filter shows "All". | The Currency filter shows "All". |

**Expected**: The Currency filter defaults to "All"
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §3 — Currency filter default "All"
**Automatable**: Yes

---

## TC-LOC-PRI-015: Currency filter dropdown has expected options
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | Default State |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Currency" filter dropdown. | The Currency filter dropdown opens and displays its options. |
| 2 | Verify the option set contains "All" and "USD". | The options include "All" and "USD". |

**Expected**: On a clean office 1604 the Currency filter shows ["All", "USD"]
**Data**: office=1604
**Notes**: The filter options are computed from the grid's price-book rows. On office 1604 (USD-only rows) the option set is ["All", "USD"]. A multi-currency office shows additional currencies.
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §7 — Currency filter option set on clean office 1604 = [All, USD]
**Automatable**: Yes

---

## TC-LOC-PRI-016: Filter grid by selecting USD keeps USD rows visible
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | Behavior |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Record the grid row count | The current grid row count is recorded. |
| 2 | Select **USD** in the Currency filter | The Currency filter is set to "USD". |
| 3 | Verify the row count is unchanged (office 1604 rows are all USD) and the primary test row stays visible | The row count is unchanged and the primary test row remains visible. |
| 4 | Reset the filter to **All** | The Currency filter returns to "All" and the grid shows its default view. |

**Expected**: Filtering by USD keeps the USD rows visible; resetting to All restores the default view
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §7 — USD filter keeps USD rows visible on office 1604
**Automatable**: Yes

---

## TC-LOC-PRI-017: Primary pricing dropdowns accept selections
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | Behavior |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Ensure "Corporate Pricing" is checked. | "Corporate Pricing" is checked. |
| 2 | Verify the "Primary Labor Pricing" dropdown is enabled and interactive. | The "Primary Labor Pricing" dropdown is enabled and can be opened. |

**Expected**: The primary pricing dropdowns are interactive when Corporate Pricing is checked
**Data**: office=1604
**Notes**: Specific option selection and persistence are covered by TC-026..030.
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §1 — primary dropdowns interactive when Corporate Pricing checked
**Automatable**: Yes

---

## TC-LOC-PRI-018: Start Date is calendar-only with a missing-date validation message
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Validation |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2021-Tier 3 Urban A" row, enable the full cascade. | The full cascade is enabled and the date fields are available. |
| 2 | Verify the "Start Date" input is read-only and cannot be typed into. | The "Start Date" input is read-only and does not accept typed input. |
| 3 | Open the "Start Date" calendar popover with no date set. | The Start Date calendar popover opens with no date selected. |
| 4 | Verify a missing-date validation message appears. | A validation message appears indicating that a date is required. |
| 5 | Close the popover and reset the row. | The popover closes and the row returns to its default state. |

**Expected**: The Start Date input is read-only (calendar selection only); a missing required date shows a validation message
**Data**: office=1604
**Notes**: The date inputs are read-only by design, so invalid manual entry is impossible — validation is exercised via the calendar popover.
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §1 — Start Date input read-only; validation message on missing date
**Automatable**: Yes

---

## TC-LOC-PRI-019: End Date is calendar-only with a missing-date validation message
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Validation |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2021-Tier 3 Urban A" row, reset the row and enable the full cascade. | The row is reset and the full cascade is enabled. |
| 2 | Verify the "End Date" input is read-only. | The "End Date" input is read-only and does not accept typed input. |
| 3 | Verify "End Date" is empty before any calendar selection. | "End Date" shows no value. |
| 4 | Open the "End Date" calendar popover with no date set. | The End Date calendar popover opens with no date selected. |
| 5 | Verify a missing-date validation message appears. | A validation message appears indicating that a date is required. |
| 6 | Close the popover and reset the row. | The popover closes and the row returns to its default state. |

**Expected**: The End Date input is read-only (calendar selection only); a missing required date shows a validation message
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §1 — End Date input read-only; validation message on missing date
**Automatable**: Yes

---

## TC-LOC-PRI-020: Valid dates persist after save
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2021-Tier 3 Urban A" row, enable the full cascade. | The full cascade is enabled and the date fields are available. |
| 2 | Enter "Start Date" = 04/01/2026 and "End Date" = 04/30/2026. | "Start Date" shows 04/01/2026 and "End Date" shows 04/30/2026. |
| 3 | Click "Save" and verify it completes. | The save completes and the Pricing tab reflects the saved state. |
| 4 | Reload the "Pricing" tab. | The Pricing tab reloads showing the saved data. |
| 5 | Verify "Start Date" = 04/01/2026, "End Date" = 04/30/2026, and "Is Alternative" and "Use Effective Dates" are both checked. | "Start Date" shows 04/01/2026, "End Date" shows 04/30/2026, and both "Is Alternative" and "Use Effective Dates" are checked. |
| 6 | Reset the row and save. | The row is reset and the save completes. |

**Expected**: Date values and the related checkbox states persist after save and reload
**Data**: office=1604 | startDate=04/01/2026 | endDate=04/30/2026
**Notes**: Re-enabled 2026-06-19 — the save round-trips correctly (verified live on office 1604).
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §4 — date save round-trips after reload on office 1604
**Cleanup**: Reset the test row after save
**Automatable**: Yes

---

## TC-LOC-PRI-021: Multiple price books can have alternate pricing simultaneously
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | Behavior |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Check "Is Alternative" for the "2021-Tier 3 Urban A", "2022-Zone 5 A", and "2022-Zone 1 A" rows. | All three rows show "Is Alternative" checked. |
| 2 | Verify all three rows show "Is Alternative" checked at the same time. | All three rows show "Is Alternative" checked simultaneously with no exclusion constraint applied. |
| 3 | Reset all three rows. | All three rows are reset to their default unchecked state. |

**Expected**: Multiple price books can be marked as alternate pricing concurrently (no single-selection constraint)
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §1 — Is Alternative is per-row; multiple rows can be checked together
**Automatable**: Yes

---

## TC-LOC-PRI-022: Grid validates all rows — missing date shows validation error
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Validation |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the "2021-Tier 3 Urban A" row, enable the full cascade and leave the dates empty. | The full cascade is enabled on the first row and both date fields are empty. |
| 2 | On the "2022-Zone 5 A" row, enable the full cascade and enter "Start Date" = 05/01/2026. | The full cascade is enabled on the second row and "Start Date" shows 05/01/2026. |
| 3 | Open the "Start Date" calendar popover on the first row. | The Start Date calendar popover opens on the first row. |
| 4 | Verify a missing-date validation message appears for the row with empty dates. | A validation message appears on the first row indicating a date is required. |
| 5 | Reset both rows. | Both rows are reset to their default state. |

**Expected**: Grid validation flags the row with missing required dates while a valid row is unaffected
**Data**: office=1604 | validDate=05/01/2026
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — all-rows date validation flags the empty row
**Automatable**: Yes

---

## TC-LOC-PRI-023: Verify Pricing tab has a dedicated Save button
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Behavior |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload the "Pricing" tab. | The Pricing tab loads and its content is visible. |
| 2 | Verify the dedicated Pricing "Save" button is disabled on a clean load. | The Pricing "Save" button is disabled. |
| 3 | Uncheck "Corporate Pricing" to make a top-level change. | "Corporate Pricing" is unchecked. |
| 4 | Verify the "Save" button enables. | The "Save" button becomes enabled. |
| 5 | Discard the change by reloading. | The change is discarded and the tab returns to its saved state. |

**Expected**: The Pricing tab has its own Save button that is disabled when there are no changes and enables when a change is made
**Data**: office=1604
**Notes**: The Pricing tab uses its own Save button, separate from the main left-panel Save used by other tabs.
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §4 — dedicated Pricing Save button; disabled-on-clean, enables on dirty
**Automatable**: Yes

---

## TC-LOC-PRI-024: Include Service Fee toggle persists across save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Pricing" tab. | The Pricing tab loads and its content is visible. |
| 2 | Verify "Include Service Fee in Price Guides" is checked by default. | "Include Service Fee in Price Guides" is checked. |
| 3 | Uncheck it. | "Include Service Fee in Price Guides" is unchecked. |
| 4 | Click "Save" and verify it completes. | The save completes. |
| 5 | Reload the "Pricing" tab. | The Pricing tab reloads showing the saved data. |
| 6 | Verify it stays unchecked. | "Include Service Fee in Price Guides" is unchecked. |
| 7 | Re-check it. | "Include Service Fee in Price Guides" is checked. |
| 8 | Click "Save". | The save completes. |
| 9 | Reload and verify it is checked again. | "Include Service Fee in Price Guides" is checked. |

**Expected**: The Include Service Fee checkbox state persists through save and reload
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §4 — Include Service Fee checkbox round-trips after save+reload
**Cleanup**: Step 9 restores the default checked state
**Automatable**: Yes

---

## TC-LOC-PRI-025: Corporate Pricing toggle persists across save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | ⛔ Skipped (application defect) | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Pricing" tab with "Corporate Pricing" checked by default. | The Pricing tab loads with "Corporate Pricing" checked. |
| 2 | Uncheck "Corporate Pricing". | "Corporate Pricing" is unchecked. |
| 3 | Click "Save" and verify the save returns success. | The save returns a success response. |
| 4 | Reload the "Pricing" tab. | The Pricing tab reloads. |
| 5 | Verify "Corporate Pricing" stays unchecked. | "Corporate Pricing" is unchecked. |
| 6 | Re-check and save to restore. | "Corporate Pricing" is checked and the save completes. |

**Expected**: The Corporate Pricing checkbox state should persist through save and reload
**Data**: office=1604
**Notes**: Skipped — open application defect (BUG-LOC-PRI-001). Unchecking Corporate Pricing saves successfully (HTTP 200) but the value reverts to checked after reload. Reproduced on offices 1604 and 1605 (application-wide, not data-specific). Distinct from TC-020 and TC-026..030, which now persist correctly.
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §6 — Corporate Pricing uncheck reverts to checked after reload (BUG-LOC-PRI-001)
**Automatable**: Blocked by application defect

---

## TC-LOC-PRI-026: Primary Labor Pricing — bidirectional persist (toggle pattern)
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select **2026-Zone 3 E** in Primary Labor Pricing | "Primary Labor Pricing" shows "2026-Zone 3 E". |
| 2 | Save, reload, verify it persists | The save completes and after reload, "Primary Labor Pricing" shows "2026-Zone 3 E". |
| 3 | Select **2026-Zone 3 D** | "Primary Labor Pricing" shows "2026-Zone 3 D". |
| 4 | Save, reload, verify it persists | The save completes and after reload, "Primary Labor Pricing" shows "2026-Zone 3 D". |

**Expected**: Primary Labor Pricing selections persist after save and reload in both directions
**Data**: office=1604 | option=2026-Zone 3 D | alternateOption=2026-Zone 3 E
**Notes**: Re-enabled 2026-06-19 — the save round-trips. The earlier block was a stale option-picker search-box label, since corrected, not a server error.
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §4 — primary dropdown selection round-trips after save+reload (office 1604)
**Cleanup**: Phase 2 of the toggle restores the original value
**Automatable**: Yes

---

## TC-LOC-PRI-027: Primary Equipment Pricing — bidirectional persist (toggle pattern)
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select **2026-Tier 2 Resort A** in Primary Equipment Pricing | "Primary Equipment Pricing" shows "2026-Tier 2 Resort A". |
| 2 | Save, reload, verify it persists | The save completes and after reload, "Primary Equipment Pricing" shows "2026-Tier 2 Resort A". |
| 3 | Select **2026-Tier 2 Resort B** | "Primary Equipment Pricing" shows "2026-Tier 2 Resort B". |
| 4 | Save, reload, verify it persists | The save completes and after reload, "Primary Equipment Pricing" shows "2026-Tier 2 Resort B". |

**Expected**: Primary Equipment Pricing selections persist after save and reload in both directions
**Data**: office=1604 | option=2026-Tier 2 Resort B | alternateOption=2026-Tier 2 Resort A
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §4 — primary dropdown selection round-trips after save+reload (office 1604)
**Cleanup**: Phase 2 of the toggle restores the original value
**Automatable**: Yes

---

## TC-LOC-PRI-028: Primary Internal Equipment Pricing — bidirectional persist (toggle pattern)
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select **2023-Internal1** in Primary Internal Equipment Pricing | "Primary Internal Equipment Pricing" shows "2023-Internal1". |
| 2 | Save, reload, verify it persists | The save completes and after reload, "Primary Internal Equipment Pricing" shows "2023-Internal1". |
| 3 | Select **2023-Internal2** | "Primary Internal Equipment Pricing" shows "2023-Internal2". |
| 4 | Save, reload, verify it persists | The save completes and after reload, "Primary Internal Equipment Pricing" shows "2023-Internal2". |

**Expected**: Primary Internal Equipment Pricing selections persist after save and reload in both directions
**Data**: office=1604 | option=2023-Internal2 | alternateOption=2023-Internal1
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §4 — primary dropdown selection round-trips after save+reload (office 1604)
**Cleanup**: Phase 2 of the toggle restores the original value
**Automatable**: Yes

---

## TC-LOC-PRI-029: Primary Production Labor Pricing — bidirectional persist (toggle pattern)
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select **2026-NP LB2** in Primary Production Labor Pricing | "Primary Production Labor Pricing" shows "2026-NP LB2". |
| 2 | Save, reload, verify it persists | The save completes and after reload, "Primary Production Labor Pricing" shows "2026-NP LB2". |
| 3 | Select **2026-NP LB3** | "Primary Production Labor Pricing" shows "2026-NP LB3". |
| 4 | Save, reload, verify it persists | The save completes and after reload, "Primary Production Labor Pricing" shows "2026-NP LB3". |

**Expected**: Primary Production Labor Pricing selections persist after save and reload in both directions
**Data**: office=1604 | option=2026-NP LB3 | alternateOption=2026-NP LB2
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §4 — primary dropdown selection round-trips after save+reload (office 1604)
**Cleanup**: Phase 2 of the toggle restores the original value
**Automatable**: Yes

---

## TC-LOC-PRI-030: Primary Production Equipment Pricing — bidirectional persist (toggle pattern)
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select **2026-NP Tier 1** in Primary Production Equipment Pricing | "Primary Production Equipment Pricing" shows "2026-NP Tier 1". |
| 2 | Save, reload, verify it persists | The save completes and after reload, "Primary Production Equipment Pricing" shows "2026-NP Tier 1". |
| 3 | Select **2026-NP Tier 2** | "Primary Production Equipment Pricing" shows "2026-NP Tier 2". |
| 4 | Save, reload, verify it persists | The save completes and after reload, "Primary Production Equipment Pricing" shows "2026-NP Tier 2". |

**Expected**: Primary Production Equipment Pricing selections persist after save and reload in both directions
**Data**: office=1604 | option=2026-NP Tier 2 | alternateOption=2026-NP Tier 1
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §4 — primary dropdown selection round-trips after save+reload (office 1604)
**Cleanup**: Phase 2 of the toggle restores the original value
**Automatable**: Yes

---

## TC-LOC-PRI-031: Save dialog Cancel — edit, Save, Cancel, form stays dirty, no data saved
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Check "Is Alternative" on the "2021-Tier 3 Urban A" row. | "Is Alternative" is checked on the "2021-Tier 3 Urban A" row. |
| 2 | Verify "Save" is enabled. | The "Save" button is enabled. |
| 3 | Click "Save" and verify the "Save Changes" dialog appears. | The "Save Changes" dialog appears. |
| 4 | Click "Cancel" and verify the dialog is dismissed. | The dialog is dismissed and the Pricing tab remains with the unsaved change in place. |
| 5 | Verify "Save" is still enabled because the form is still dirty. | The "Save" button is still enabled. |
| 6 | Reload the "Pricing" tab. | The Pricing tab reloads. |
| 7 | Verify "Is Alternative" is unchecked, confirming data was not saved. | "Is Alternative" is unchecked, confirming the change was not saved. |

**Expected**: Cancelling the Save Changes dialog discards nothing yet but persists nothing; reload shows the original state
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §6 — Save dialog Cancel keeps the form dirty and saves no data
**Automatable**: Yes

---

## TC-LOC-PRI-032: Unsaved changes dialog — edit, navigate away, Stay returns to form
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Pricing" tab. | The Pricing tab loads and its content is visible. |
| 2 | Uncheck "Corporate Pricing" to make a change. | "Corporate Pricing" is unchecked. |
| 3 | Verify "Save" is enabled. | The "Save" button is enabled. |
| 4 | Click the sidebar Home link and verify the "Unsaved changes" dialog appears. | The "Unsaved changes" dialog appears. |
| 5 | Click "Stay". | The dialog is dismissed and the Pricing tab remains visible. |
| 6 | Verify you are still on the Pricing page. | The Pricing tab is visible with the unsaved change still present. |
| 7 | Verify "Save" is still enabled with the unsaved change preserved. | The "Save" button is still enabled and "Corporate Pricing" remains unchecked. |
| 8 | Restore: re-check "Corporate Pricing" and reload to discard. | "Corporate Pricing" is re-checked and the tab reloads to its saved state. |

**Expected**: Clicking Stay on the unsaved changes dialog returns to the form with the unsaved changes preserved
**Data**: office=1604
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §6 — unsaved-changes dialog Stay returns to the dirty form
**Cleanup**: Re-check Corporate Pricing, reload to discard
**Automatable**: Yes

---

## TC-LOC-PRI-033: Grid validation errors block Save — missing dates with cascade enabled
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Validation |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload the "Pricing" tab to a clean state. | The Pricing tab loads with no pending changes. |
| 2 | Verify "Save" is disabled. | The "Save" button is disabled. |
| 3 | On the "2021-Tier 3 Urban A" row, check "Is Alternative", wait for "Use Effective Dates" to become enabled, check it, then wait for the date fields to become enabled. | "Is Alternative" is checked, "Use Effective Dates" becomes enabled and is checked, and the date fields become enabled. |
| 4 | Verify "Save" stays disabled while the required date fields are empty. | The "Save" button remains disabled while both date fields are empty. |
| 5 | Enter valid "Start Date" and "End Date" values. | "Start Date" shows 05/01/2026 and "End Date" shows 05/31/2026. |
| 6 | Verify "Save" enables. | The "Save" button becomes enabled. |
| 7 | Reset the row and reload. | The row is reset and the tab reloads to its saved state. |

**Expected**: Save stays disabled while required date fields are empty and enables once valid dates are entered
**Data**: office=1604 | startDate=05/01/2026 | endDate=05/31/2026
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §5 — empty required dates block Save; valid dates enable it
**Cleanup**: Reset the row, reload
**Automatable**: Yes

---

## TC-LOC-PRI-035: Verify read-only columns have no interactive elements
| Priority | Status | Type |
|----------|--------|------|
| Low | ✅ Automated | Structure |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Pricing" tab. | The Pricing tab loads and its content is visible. |
| 2 | Inspect the first three columns (Pricing Strategy, Pricebook, Currency) on the primary test row. | The first three columns (Pricing Strategy, Pricebook, Currency) are visible on the primary test row. |
| 3 | Verify no button, checkbox, or input elements exist in those cells. | No button, checkbox, or input element appears in the Pricing Strategy, Pricebook, or Currency cells. |

**Expected**: The read-only columns contain only display text — no interactive elements
**Data**: office=1604
**Notes**: TC-LOC-PRI-034 intentionally does not exist (reserved/skipped ID).
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §1 — read-only columns (Pricing Strategy/Pricebook/Currency) are non-interactive
**Automatable**: Yes

---

## TC-LOC-PRI-036: Per-currency primary pricing dropdowns all render and are enabled
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Structure |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Setup > Location > 1605, then open the "Pricing" tab. | The Pricing tab for office 1605 loads and its content is visible. |
| 2 | Ensure "Corporate Pricing" is checked. | "Corporate Pricing" is checked. |
| 3 | Verify all fifteen primary pricing dropdowns render and are enabled: the five fields each for USD, CAD, and MXN. | All fifteen primary pricing dropdowns are present and enabled: five each for USD, CAD, and MXN. |

**Expected**: A multi-currency office renders all fifteen primary pricing dropdowns (five fields x three currencies), enabled when Corporate Pricing is checked
**Data**: office=1605
**Notes**: Office 1604 is single-currency (USD only). Office 1605 renders the per-currency dropdowns. The CAD dropdowns and three of the MXN dropdowns have no pricing strategies configured for their currency (they render and open but show no options).
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §7 — office 1605 renders 15 primary dropdowns (5 USD + 5 CAD + 5 MXN), all present and enabled
**Automatable**: Yes

---

## TC-LOC-PRI-037: Primary Labor Pricing (MXN) — select, save, persists after reload
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 1605, open the "Pricing" tab, and ensure "Corporate Pricing" is checked. | The Pricing tab for office 1605 loads with "Corporate Pricing" checked. |
| 2 | Ensure the "Primary Labor Pricing (MXN)" dropdown is unset. | The "Primary Labor Pricing (MXN)" dropdown shows no selection. |
| 3 | Select "MEX DYN LB1 MXN 2025". | "Primary Labor Pricing (MXN)" shows "MEX DYN LB1 MXN 2025". |
| 4 | Save. | The save completes. |
| 5 | Reload the "Pricing" tab. | The Pricing tab reloads. |
| 6 | Verify the dropdown shows "MEX DYN LB1 MXN 2025". | "Primary Labor Pricing (MXN)" shows "MEX DYN LB1 MXN 2025". |
| 7 | Restore the dropdown to unset and save. | The dropdown is cleared and the save completes. |

**Expected**: An MXN primary labor pricing selection persists after save and reload
**Data**: office=1605 | option=MEX DYN LB1 MXN 2025
**Notes**: MXN Labor is one of the two per-currency dropdowns on 1605 that have selectable pricing strategies.
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §7 — MXN Labor Pricing select+save round-trips on office 1605
**Cleanup**: Restore the dropdown to unset and save
**Automatable**: Yes

---

## TC-LOC-PRI-038: Primary Equipment Pricing (MXN) — select, save, persists after reload
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Persistence |

**Depends_On**: TC-LOC-PRI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 1605, open the "Pricing" tab, and ensure "Corporate Pricing" is checked. | The Pricing tab for office 1605 loads with "Corporate Pricing" checked. |
| 2 | Ensure the "Primary Equipment Pricing (MXN)" dropdown is unset. | The "Primary Equipment Pricing (MXN)" dropdown shows no selection. |
| 3 | Select "MEX BO CDMX MXN 2025". | "Primary Equipment Pricing (MXN)" shows "MEX BO CDMX MXN 2025". |
| 4 | Save. | The save completes. |
| 5 | Reload the "Pricing" tab. | The Pricing tab reloads. |
| 6 | Verify the dropdown shows "MEX BO CDMX MXN 2025". | "Primary Equipment Pricing (MXN)" shows "MEX BO CDMX MXN 2025". |
| 7 | Restore the dropdown to unset and save. | The dropdown is cleared and the save completes. |

**Expected**: An MXN primary equipment pricing selection persists after save and reload
**Data**: office=1605 | option=MEX BO CDMX MXN 2025
**Notes**: MXN Equipment is one of the two per-currency dropdowns on 1605 that have selectable pricing strategies.
**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §7 — MXN Equipment Pricing select+save round-trips on office 1605
**Cleanup**: Restore the dropdown to unset and save
**Automatable**: Yes
