# Corporate Pricing — Product Group Override Test Cases — NM-2269 (Active and Currency Filters)

**Module**: corporate-override | **Total**: 6 | **Status**: Automated | **Updated**: 2026-07-27

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-042: Active-only removes inactive rows and restores the full set on uncheck
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-010
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; Active-only is OFF (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read Active-only state and row count → Active-only is unchecked; 9 rows visible | Active-only is displayed unchecked and 9 rows are visible. |
| 2 | Check Active-only → row count drops to 7 | 7 rows are displayed. |
| 3 | the Camlok #1 and Camlok #2 rows are absent | The Camlok #1 and Camlok #2 rows are not present in the grid. |
| 4 | Uncheck Active-only → 9 rows restored | All 9 rows are displayed again. |
| 5 | both Camlok rows are visible again | Both Camlok rows are visible in the grid. |

**Expected**: Checking Active-only filters the grid to the 7 active rows (removes the 2 inactive product groups Camlok #1 and Camlok #2). Unchecking restores all 9 rows. The identity delta — which specific rows disappear — is asserted in both directions.
**Data**: office=1105 (9 total / 7 active / 2 inactive: Product Groups 1482 and 1484)

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-043: Currency filter yields the exact row count for the present currency, 0 for an absent currency, and restores the full set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-009
**Automatable**: Yes

**Preconditions**: On the Override screen with the standard test office selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select the currency present in the data (USD) from the Currency dropdown → grid shows the full expected row count | The grid narrows to the rows carrying the USD currency. |
| 2 | Select a currency with no matching rows → grid shows zero rows | The grid displays zero rows. |
| 3 | Select ALL → full row set restores | Selecting the present currency yields the exact expected row count; selecting a currency with no matching rows yields exactly 0; selecting ALL restores the full set. Asserting both directions proves the filter reads its input - a filter that ignored the selection could not satisfy both the exact-count and the zero-count assertion |

**Expected**: Selecting the present currency yields the exact expected row count; selecting a currency with no matching rows yields exactly 0; selecting ALL restores the full set. Asserting both directions proves the filter reads its input — a filter that ignored the selection could not satisfy both the exact-count and the zero-count assertion.

**Note**: The available corporate-group offices carry USD-only override rows (1101 = 0 rows; 1105/1606/1107 all USD — verified during the sprint walk), so cross-currency narrowing (USD → CAD) cannot be exercised. The absent-currency → 0 assertion covers the same behavior from the reachable direction. A multi-currency office would allow the stronger cross-currency form.
**Data**: `CORP_PRICING_OVERRIDE_ACTIVE_BED` (standard test office)

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-044: Active-only and text filter applied simultaneously produce the correct intersection; filter order does not affect the result; resetting all restores the full row set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-042
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; no filters active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Filter by text "Camlok" → 2 rows (both inactive) | 2 rows matching "Camlok" are displayed. |
| 2 | Check Active-only on top → 0 rows (intersection: Camlok rows are inactive, filtered out) | The grid displays zero rows. |
| 3 | Reset both filters → 9 rows restored | All 9 rows are displayed. |
| 4 | Check Active-only first → 7 rows | 7 rows are displayed. |
| 5 | then filter "Camlok" on top → 0 rows (same intersection as step 2 — order independent) | The grid displays zero rows. |
| 6 | Uncheck Active-only while "Camlok" text filter active → 2 rows (inactive Camlok rows visible again) | 2 rows are displayed. |
| 7 | Clear text filter → 9 rows fully restored | All 9 rows are displayed. |

**Expected**: The Active-only and text filter combine correctly regardless of application order (order independence). The intersection of "Camlok" text filter + Active-only is 0 rows because both Camlok product groups are inactive. Resetting each filter independently produces the expected intermediate counts; clearing all filters fully restores the 9-row set.
**Data**: office=1105; text filter needle "Camlok"

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-125: Currency filter USD — yields only USD rows, CAD row absent (OVR-CUR-3)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-043 (skipped — this replaces it)
**Automatable**: Yes
**Surface_Family**: dropdown (QUICK)

**Preconditions**: On the Override screen with office 1145 selected; Equipment tab active; filter=ALL; 11 rows visible (10 USD + 1 CAD).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 1145, Equipment tab | Office 1145 loads on the Equipment tab. |
| 2 | confirm baseline: 11 rows visible with filter=ALL | 11 rows are displayed with the Currency filter at ALL. |
| 3 | Select "USD" from the Currency dropdown | The grid narrows to the rows carrying USD. |
| 4 | Read visible row count → assert exactly 10 rows | 10 rows are displayed. |
| 5 | Assert PG 425 ("Box Truss 20.5x20.5 - 5'") is NOT present in the grid (this is the sole CAD row) | PG 425 ("Box Truss 20.5x20.5 - 5'") is absent from the grid. |
| 6 | Assert PG 4298 ("Project Manager (Pre/Post) - Hourly") IS present (a known USD row) | PG 4298 ("Project Manager (Pre/Post) - Hourly") is displayed in the grid. |
| 7 | Reset filter to "ALL" → assert 11 rows restored | The USD currency filter removes all non-USD rows from the grid. Exactly 10 rows remain (all USD). The single CAD row (PG 425) is absent. An inactive filter would leave all 11 rows visible - the assertion of exactly 10 with PG 425 absent distinguishes a working filter from an inactive one |

**Expected**: The USD currency filter removes all non-USD rows from the grid. Exactly 10 rows remain (all USD). The single CAD row (PG 425) is absent. An inactive filter would leave all 11 rows visible — the assertion of exactly 10 with PG 425 absent distinguishes a working filter from an inactive one.
**Data**: office=1145; tab=Equipment; filter=USD; expected count=10; absent PG=425; present PG=4298

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-126: Currency filter CAD — yields only CAD rows, identifies the single CAD row (OVR-CUR-4)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-043 (skipped — this replaces it)
**Automatable**: Yes
**Surface_Family**: dropdown (QUICK)

**Preconditions**: On the Override screen with office 1145 selected; Equipment tab active; filter=ALL; 11 rows visible (10 USD + 1 CAD).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 1145, Equipment tab | Office 1145 loads on the Equipment tab. |
| 2 | confirm baseline: 11 rows visible with filter=ALL | 11 rows are displayed with the Currency filter at ALL. |
| 3 | Select "CAD" from the Currency dropdown | The grid narrows to the row carrying CAD. |
| 4 | Read visible row count → assert exactly 1 row | 1 row is displayed. |
| 5 | Assert PG 425 ("Box Truss 20.5x20.5 - 5'") IS present (this is the sole CAD row) | PG 425 ("Box Truss 20.5x20.5 - 5'") is displayed in the grid. |
| 6 | Assert PG 4298 ("Project Manager (Pre/Post) - Hourly") is NOT present (a USD row must be filtered out) | PG 4298 ("Project Manager (Pre/Post) - Hourly") is absent from the grid. |
| 7 | Reset filter to "ALL" → assert 11 rows restored | The CAD currency filter removes all non-CAD rows. Exactly 1 row remains - PG 425. An inactive filter would leave all 11 rows (fail: count ≠ 1). A filter that clears everything would leave 0 rows (fail: count ≠ 1 and PG 425 absent). Only a correct filter yields exactly 1 row with PG 425 present |

**Expected**: The CAD currency filter removes all non-CAD rows. Exactly 1 row remains — PG 425. An inactive filter would leave all 11 rows (fail: count ≠ 1). A filter that clears everything would leave 0 rows (fail: count ≠ 1 and PG 425 absent). Only a correct filter yields exactly 1 row with PG 425 present.
**Data**: office=1145; tab=Equipment; filter=CAD; expected count=1; present PG=425; absent PG=4298

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-127: Currency filter MXN — yields 0 rows on a USD/CAD-only office (OVR-CUR-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-043 (skipped — this replaces it)
**Automatable**: Yes
**Surface_Family**: dropdown (QUICK)

**Preconditions**: On the Override screen with office 1145 selected; Equipment tab active; filter=ALL; 11 rows visible (10 USD + 1 CAD; 0 MXN).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 1145, Equipment tab | Office 1145 loads on the Equipment tab. |
| 2 | confirm baseline: 11 rows visible with filter=ALL | 11 rows are displayed with the Currency filter at ALL. |
| 3 | Select "MXN" from the Currency dropdown | The grid narrows to zero rows. |
| 4 | Read visible row count → assert exactly 0 rows | 0 rows are displayed. |
| 5 | Assert PG 425 is NOT present and PG 4298 is NOT present (grid is empty) | Neither PG 425 nor PG 4298 is displayed in the grid. |
| 6 | Reset filter to "ALL" → assert 11 rows restored (filter is reversible, not destructive) | MXN exists in the dropdown (it is a system-wide option) but office 1145 has zero MXN rows. The filter correctly yields an empty grid. An inactive filter would leave all 11 rows (fail: count ≠ 0). This proves the filter actively excludes non-matching rows even when the result set is empty |

**Expected**: MXN exists in the dropdown (it is a system-wide option) but office 1145 has zero MXN rows. The filter correctly yields an empty grid. An inactive filter would leave all 11 rows (fail: count ≠ 0). This proves the filter actively excludes non-matching rows even when the result set is empty.
**Data**: office=1145; tab=Equipment; filter=MXN; expected count=0; absent PGs=all

---


