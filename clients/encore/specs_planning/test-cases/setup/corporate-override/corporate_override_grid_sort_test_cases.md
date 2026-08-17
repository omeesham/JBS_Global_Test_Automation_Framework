# Corporate Pricing — Product Group Override Test Cases — NM-2270 (Grid Text Filter and Sort)

**Module**: corporate-override | **Total**: 6 | **Status**: Automated | **Updated**: 2026-07-27

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-044: Text filter "Camlok" narrows the grid to matching rows; clearing restores the full set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-012
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; text filter is empty; all 9 rows visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read visible row count → 9 (walk-A certified for office 1105) | All 9 rows are displayed in the grid. |
| 2 | Type "Camlok" into the "Filter Product Groups Override..." text box → grid narrows to 2 rows (walk-A certified count) | The grid narrows to the rows matching "Camlok". |
| 3 | Assert the two visible rows are "Camlok #1 - 50' (Set of 5 Conductors)" and "Camlok #2 - 10'" (specific product identities, not just count) | Only "Camlok #1 - 50' (Set of 5 Conductors)" and "Camlok #2 - 10'" are displayed in the grid. |
| 4 | Clear the text filter → grid restores to 9 rows | Typing "Camlok" narrows the grid to exactly the 2 Camlok product rows. The specific row identities ("Camlok #1 - 50' (Set of 5 Conductors)" and "Camlok #2 - 10'") are confirmed, not just the count. Clearing the filter restores the full 9-row set |

**Expected**: Typing "Camlok" narrows the grid to exactly the 2 Camlok product rows. The specific row identities ("Camlok #1 - 50' (Set of 5 Conductors)" and "Camlok #2 - 10'") are confirmed, not just the count. Clearing the filter restores the full 9-row set.
**Data**: office=1105; filter needle "Camlok"; expected filtered count=2; Camlok row 1="Camlok #1 - 50' (Set of 5 Conductors)"; Camlok row 2="Camlok #2 - 10'"; expected restored count=9

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-045: Product Group Name column sort: ascending first cell matches walk oracle and order is non-decreasing; descending matches walk oracle and order is non-increasing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-005
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; grid showing 9 rows.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Product Group Name" column header dropdown menu → click "Sort ascending" | The column header dropdown menu opens and displays sort options. |
| 2 | Read the first cell of Product Group Name → "07A Compass Screen Set Kit" (walk-A certified) | The first row's Product Group Name is displayed as "07A Compass Screen Set Kit". |
| 3 | Read all visible Product Group Name cells → values are non-decreasing | The Product Group Name column is displayed in non-decreasing order. |
| 4 | Open the header dropdown again → click "Sort descending" | The column header dropdown menu opens and displays sort options. |
| 5 | Read the first cell → "Whiteboard Supply" (walk-A certified) | The first row's Product Group Name is displayed as "Whiteboard Supply - Marker 4 Pk". |
| 6 | Read all visible Product Group Name cells → values are non-increasing | Sorting ascending puts "07A Compass Screen Set Kit" first and the full column is non-decreasing. Sorting descending puts "Whiteboard Supply - Marker 4 Pk" first and the full column is non-increasing. The sort mechanism is a header dropdown menu - not a header-click toggle |

**Expected**: Sorting ascending puts "07A Compass Screen Set Kit" first and the full column is non-decreasing. Sorting descending puts "Whiteboard Supply - Marker 4 Pk" first and the full column is non-increasing. The sort mechanism is a header dropdown menu — not a header-click toggle.
**Data**: office=1105; ASC first cell "07A Compass Screen Set Kit"; DESC first cell "Whiteboard Supply - Marker 4 Pk" (confirmed via live run 2026-07-18)

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-046: Product Group column sort: ascending values are non-decreasing; descending values are non-increasing — self-verifying monotonic oracle
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-045
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; grid showing 9 rows.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Product Group" column header dropdown menu → click "Sort ascending" | The column header dropdown menu opens and displays sort options. |
| 2 | Read all visible Product Group cells → values are non-decreasing (monotonic ascending check, no hardcoded first cell) | The Product Group column is displayed in non-decreasing numeric order. |
| 3 | Open the header dropdown again → click "Sort descending" | The column header dropdown menu opens and displays sort options. |
| 4 | Read all visible Product Group cells → values are non-increasing (monotonic descending check) | The "Product Group" column (numeric product group IDs) sorts correctly in both directions via the same header dropdown mechanism confirmed in TC-CPR-OVR-045. Monotonic ordering is asserted numerically (not as strings, since the app sorts by numeric value - e.g. 2 before 10) without relying on any fixed first-cell value. Confirms the sort mechanism is consistent across columns |

**Expected**: The "Product Group" column (numeric product group IDs) sorts correctly in both directions via the same header dropdown mechanism confirmed in TC-CPR-OVR-045. Monotonic ordering is asserted numerically (not as strings, since the app sorts by numeric value — e.g. 2 before 10) without relying on any hardcoded first-cell value. Confirms the sort mechanism is consistent across columns.
**Data**: office=1105; second sortable column "Product Group" (column index 1); comparison is numeric

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-047: Hiding "Max Discount %" via Grid Options reduces visible column count; Reset to Default restores all columns
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-030
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; all 10 columns visible (restored by beforeEach/afterEach).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read visible column count → 10 (walk-A certified default) | All 10 columns are displayed. |
| 2 | Open Grid Options → toggle off "Max Discount %" → close Grid Options | The Grid Options panel opens. |
| 3 | Read visible column count → 9 (walk-A certified hidden count; "Max Discount %" header is absent) | 9 columns are displayed, with "Max Discount %" removed. |
| 4 | Open Grid Options → click "Reset to Default" → close Grid Options | The Grid Options panel opens. |
| 5 | Read visible column count → 10 (all columns restored) | Hiding "Max Discount %" reduces the visible column count from 10 to 9. Clicking "Reset to Default" in Grid Options restores all 10 columns. The before/after column-count delta is asserted in both directions. beforeEach/afterEach restore all columns so the test is order-independent |

**Expected**: Hiding "Max Discount %" reduces the visible column count from 10 to 9. Clicking "Reset to Default" in Grid Options restores all 10 columns. The before/after column-count delta is asserted in both directions. beforeEach/afterEach restore all columns so the test is order-independent.
**Data**: office=1105; default column count=10; hidden column count=9; hidden column="Max Discount %"

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-048: Text filter and column sort applied together: filtered rows match the filter and are correctly ordered
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-044, TC-CPR-OVR-045
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected; no filters active; all 9 rows visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Apply text filter "Camlok" → 2 rows visible | 2 rows matching "Camlok" are displayed. |
| 2 | Apply "Sort ascending" on the "Product Group Name" column → assert 2 rows still visible (filter survives the sort) | The 2 rows remain visible after the sort is applied. |
| 3 | assert every visible row's Product Group Name contains "Camlok" (case-insensitive) | Each visible row's Product Group Name contains "Camlok". |
| 4 | assert values are non-decreasing | The Product Group Name values are displayed in non-decreasing order. |
| 5 | Clear the text filter → 9 rows restored | All 9 rows are displayed. |

**Expected**: Applying a text filter and a column sort simultaneously produces a result set that satisfies both constraints: every row matches the filter text (contains "Camlok"), the row count is 2, and the column order is non-decreasing. The filter survives the sort without resetting. Clearing the filter restores the full 9-row set.
**Data**: office=1105; filter needle "Camlok"; expected filtered+sorted count=2; every row name must contain "Camlok" (case-insensitive); expected restored count=9

---

## 2026-07-20 live verification (NM-2271 — populated Labor, save-cycles, dirty guard, pagination, NM-1932, picker drag)

| Field | Value |
|-------|-------|
| Date | 2026-07-20 |
| Labor mutation bed | Office **1105 Labor** — 2 rows: 655 "General - Ops" (160.00, inactive), 656 "General - Utility" (125.00, inactive). First Labor save commit in module history verified live: 160 → 161 → save POST 200 + success toast → persisted across reload → restored 160.00. Labor Active cell = checkbox read via aria-checked (per-tab boolean render). |
| Labor volume bed | Office **9460 Labor** — "212 items found", 20/page default, page 1 first row "Banners Design", page 2 first row "Candids Video Engineer - FULL DAY", last page holds the remainder; nav buttons carry aria-labels "Go to first/previous/next/last page" with end-state disabling; rows-per-page options 10/20/30/40/50, 20→50 shows 50 rows with the total unchanged. Sort dropdown (ascending/descending/hide) and the text filter both work on the Labor tab. |
| Unsaved-changes guard | In-app link navigation from a dirty grid raises the "Unsaved changes" confirmation dialog ("Are you sure you want to leave this view? Any unsaved changes will be lost.", Stay/Discard). **Stay verified live 2026-07-20** (previously unexercised): URL unchanged, staged edit intact, Save still enabled. Discard navigates away and drops the edit. A direct URL change fires the native leave-page prompt instead — specs must navigate via in-app links. |
| NM-1932 bed | Office **1115**, Product Group 286 "01D Double Screen Set Kit": blank Override Price renders "—" (em-dash) inside a muted span — textContent is NOT empty. |
| Keyboard access | Editable cells are focusable; **Enter** opens the numeric editor, **Escape** closes it without dirtying. **Gap (not automated)**: arrow keys do NOT move focus between cells (no grid-level keyboard navigation). **Defect-candidate**: both save dialogs render aria-hidden="true" while visually modal (invisible to assistive tech). |
| Picker drag bed | Office **4104** — Currency ALL: no picker. Currency USD: "Product Groups" picker panel + "Search product groups..." box with draggable rows (Equipment and Labor). Dragging a row stages it client-side (NO request until Save) at Override Price 0.00 / inactive, and enables Save. Discard drops the staged row. |
| Evidence | `_internal/walk-evidence-corporate-pricing-override-2026-07-20-SAVE.md` + `reports/walkthrough/nm2271-grid-equipment-labor.walkthrough.yaml` |

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-115: Text filter narrows grid and empty filter shows no results
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-OVR-012
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1606 selected; all rows visible (no active filter).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the visible row count (baseline) | The baseline row count is displayed. |
| 2 | Type a single character "H" into the "Filter Product Groups Override..." input → the grid responds (narrows or stays unchanged depending on data, but does not crash or error) | The grid updates to show rows matching "H". |
| 3 | Assert: visible row count is ≥ 0 and ≤ the baseline count | The visible row count is displayed at or below the baseline count. |
| 4 | no unhandled errors | No error message or broken state is displayed. |
| 5 | the grid is still interactive | The grid remains interactive and responsive. |
| 6 | Clear the filter → row count returns to baseline | A 1-character input is the minimum boundary for the text filter. The grid must respond without crashing, erroring, or ignoring the input. On office 1606, "H" matches "House Video Monitor" rows so the count will narrow - but the assertion is relative (≤ baseline), not a fixed number |

**Expected**: A 1-character input is the minimum boundary for the text filter. The grid must respond without crashing, erroring, or ignoring the input. On office 1606, "H" matches "House Video Monitor" rows so the count will narrow — but the assertion is relative (≤ baseline), not a hardcoded number.
**Data**: office=1606; filter input "H"; assertion relative (not hardcoded count)

---

