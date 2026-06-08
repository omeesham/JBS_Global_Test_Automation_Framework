# Local Office Settings — Location Settings History Test Plan

**Module**: local-office | **Test Cases**: [../../../test-cases/setup/local-office/local_office_history_test_cases.md](../../../test-cases/setup/local-office/local_office_history_test_cases.md)
**Spec**: `tests/specs/setup/local-office/local-office-history.spec.ts`
**URL**: `/navigator/locations/{officeId}/settings/local-office` (Location Settings History tab)
**Updated**: 2026-04-13 | **Status**: Manual | **Total TCs**: 7 (TC-LOS-HIS-*)
**Sibling test plans**: [BAS](local_office_settings_test_plan.md) · [ECT](local_office_ect_test_plan.md)

**Split note**: This file was split from the combined `local_office_settings_test_plan.md` on 2026-05-05 to match the 1:1 spec→md convention used by the locations module (the underlying spec breakdown landed in commit f721e15, 2026-03-26). Sibling test plans: [HIS](local_office_history_test_plan.md), [ECT](local_office_ect_test_plan.md).

---

## Coverage Summary

| Sub-Module | TC ID Range | Count | Key Risks |
|---|---|---|---|
| History Tab | HIS-001 to HIS-007 | 7 | Read-only audit log, 42 columns, history type selector, pagination |

---

## Preconditions (All Scenarios)

- User authenticated with Read+Write on location 1604
- Browser at `/navigator/locations/1604/settings/local-office`
- No unsaved changes on page load
- Save button disabled on fresh load


---

## Scenario Group 12: History Tab — Navigation & Structure

### TC-LOS-HIS-001
1. Click `[data-testid="local-office-settings-tab-location-settings-history"]`
2. Assert tab `aria-selected="true"`
3. Assert `[data-testid="local-office-settings-history-select-type"]` visible with text "Location Management History"
4. Assert `[data-testid="local-office-settings-history-table"]` visible
5. Expected: History tab shows type selector and data table

### TC-LOS-HIS-002
1. On History tab, assert `[data-testid="local-office-settings-history-table"]` has 42 `th` elements
2. Assert first 5 headers: Local Office, Prep Date Offset, Return Date Offset, Set Date Offset, Strike Date Offset
3. Assert last 4 headers: Holiday Multiplier, Recalc Labor Hours, Modified By, Modified On
4. Expected: 42 column headers present in correct order

### TC-LOS-HIS-003
1. On History tab, assert `isHistoryTableEmpty()` returns `false`
2. Expected: Table populated for office 1604 (SP1 MCP 2026-04-13: 61 pages of data). Rewritten 2026-04-15 — original "empty state" assertion was factually wrong.

### TC-LOS-HIS-004
1. Click `[data-testid="local-office-settings-history-select-type"]` to open dropdown
2. Assert 2 options: "Location Management History" (selected), "Location Management Legacy History"
3. Close dropdown; assert original selection maintained
4. Expected: 2 history type options

### TC-LOS-HIS-005
1. On History tab, assert rows-per-page combobox value = "20"
2. Assert page indicator "1 / 1"
3. Assert 4 nav buttons present (first, prev, next, last)
4. Expected: Pagination controls present; default 20 rows/page

### TC-LOS-HIS-006
1. On History tab, assert no `button[type="submit"]` or Save button within tabpanel
2. Assert no `input`, `textarea`, or editable fields within tabpanel (except pagination)
3. Expected: History tab is read-only

### TC-LOS-HIS-007
1. On History tab, count `th button` elements inside `[data-testid="local-office-settings-history-table"]`
2. Assert 38 sort buttons (42 columns - 4 non-sortable: Local Office, Section Name, Service Type - Exempt, Notes)
3. Assert non-sortable columns contain only text, no button child
4. Expected: 38 sortable + 4 non-sortable columns


---

## History Coverage (42-col)

Per PLAN_HIST_COLUMN_FIRST_PIVOT (2026-04-20), Local Office Settings History (42-col) tracking is verified by the dedicated per-column hist suite (see SP-C1 for Basic Info, SP-C2 for ECT). Scenario Group 12 above covers Navigation & Structure of the History tab itself; this section records field-coverage expectations for the pivoted hist tests.

**Basic Info (BAS) field coverage in 42-col:**
- Prep Date Offset, Use Fulfillment, Default Order Type (spot-check columns)
- **NOT-TRACKED:** PO Number, PO Number Label, Room toggle — no columns in 42.

**ECT field coverage:**
- BenefitsMultiplier, HistoricalSubrental, LaborCost are all confirmed NOT-TRACKED (cols 33-40 are read-only ECT globals, not editable-field columns).

**Formats (per SUBPLAN_HISTORY_01_MCP_FINDINGS.md §§2-3 and CLAUDE.md LR-036):** SVG `lucide-check` icons for booleans; MM/DD/YYYY HH:MM:SS AM/PM timestamps; plain integers for date offsets.

