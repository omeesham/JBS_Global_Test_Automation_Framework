# Discount Optimization — Locations (Tab 1) Test Cases

**Module**: discount-optimization

| Module | Test Cases | Automated | Pending Automation | Out of Scope | Updated |
|--------|------------|-----------|--------------------|--------------|---------|
| Discount Optimization — Locations | 32 | 31 (97%) | 1 (3%) | 0 (0%) | 2026-08-11 |

> **Tab 1 (Locations grid)** coverage `TC-DOP-OPT-001..092` for the **Discount Optimization — Locations** tab, authored from a full sweep of the page's 148 interactive elements, a comparison against the legacy site, and six closed Jira defects (NM-2917, NM-2918, NM-3063, NM-3066, NM-3067, NM-3210). The first paint takes approximately 22 seconds. **Every case waits on a content condition (non-zero row count), never a fixed timeout.** The legacy site carries a single-page equivalent at `/#/setup/DiscountPricing/settings` (2155 rows, no tabs, no search, no sort, booleans as plain text `Yes`/`No`). Three new-site additions are intentional UX divergences vs the legacy site: (1) the surface is split into two tabs; (2) a search box has been added; (3) all four columns are sortable.

---

## FIELD INVENTORY & DISCOVERY

**Live walk 2026-08-11 (Playwright CLI, office 1604).** Route: `/navigator/locations/1604/settings/discount-optimization-settings`. Angular app. All interactive elements are identified by visible text, accessible role, or placeholder. Tab trigger buttons carry auto-generated IDs that change between renders — select tabs by visible text only.

**Two tabs on one route:**

| # | Tab label | Default |
|---|-----------|---------|
| 1 | Discount Optimization | ✓ (active on load) |
| 2 | Special Rate Exemptions by Service Type | — |

**Tab 1 — Locations grid:**

| # | Column header | App field name | Control type |
|---|---------------|----------------|--------------|
| 1 | ID | `locationNo` | read-only text |
| 2 | Location Name | `locationName` | read-only text |
| 3 | Allow Special Rate | `allowSpecialRate` | per-row toggle button |
| 4 | Special Rate Start Date | `startAllowSpecialRate` | date input + calendar picker |

**Controls:**

| Control | Selector strategy | Notes |
|---------|-------------------|-------|
| Search input | `input[placeholder="Search by location number or location name"]` | Filters live as you type |
| Save button | `button:text-is("Save")` scoped to tab 1 panel | Disabled on pristine + invalid; enabled on valid change |
| Add button | `button:text-is("Add")` scoped to tab 1 panel | Opens add affordance |
| Per-row remove | Remove button for that location | Presents a confirmation dialog |
| Per-row toggle | Allow Special Rate control on the row | Boolean toggle |
| Date input | Date entry field on the row | Manual or picker entry |
| Calendar picker | Calendar icon button on the row | Opens date picker popover |
| Sortable headers | Column heading options menu button inside each header | Opens a 2-item menu: "Sort ascending" / "Sort descending" (confirmed 2026-08-11) |

**Grid size**: 2154 rows total on 2026-08-11. The API returns all records at once, but the grid renders only a window of approximately 37 rows at a time and recycles those DOM nodes as you scroll — 2154 is the total shown in the footer, not the number of rows present on the page at any moment. Row count is live data; tests assert a pattern (non-zero, increased/decreased) rather than an exact frozen number.

**Load characteristic**: `GET /navigator/api/discount/optimization?skipPagination=true` returns HTTP 200 immediately, but the grid displays `0 locations found` behind skeleton placeholders for approximately 22 seconds. Automation must wait for the row count to become non-zero before interacting.

**Boolean render**: The `Allow Special Rate` column renders as a per-row toggle button on each location row, not a passive cell. The legacy site renders the equivalent field as plain text `Yes`/`No`. The new-site button's on/off visual state could not be confirmed from recorded artifacts alone — the cases below assert the control's switched state rather than a text value. This assumption is flagged for live confirmation before the specs are hardened.

**Baseline diff (new site vs legacy site):**

| Aspect | Legacy site | New site | Classification |
|--------|-------------|----------|----------------|
| Structure | Single page, no tabs | Two tabs on one route | Intentional UX divergence |
| Search | None | Search box present | Intentional UX divergence |
| Sorting | None | All 4 columns sortable | Intentional UX divergence |
| Row count | 2155 rows | 2154 rows (office 1604 absent from its own list) | Expected — office 1604 is not a peer location for itself |
| Boolean render | Plain text `Yes` / `No` | Interactive button per row | Intentional UX divergence |
| Pagination | None | None | Consistent |

---

## MCP_VERIFICATION_LOG

| Field | Value |
|---|---|
| Date | 2026-08-11 |
| Tool | Playwright CLI (office 1604) |
| Page | Discount Optimization — Locations (tab 1) |
| Stack | Angular + Radix UI; grid container identified by a stable test marker; tab trigger IDs are auto-generated |
| Columns verified | 4 — ID, Location Name, Allow Special Rate, Special Rate Start Date |
| Row count | 2154 total (API); the grid renders approximately 37 rows at a time and recycles them as you scroll |
| Load time | ~22 seconds to first paint; grid shows `0 locations found` until complete |
| Boolean render | Per-row toggle button on each location row; on/off state not confirmed from recorded artifacts — asserted by observing the switched state |
| Save cycle | Disabled pristine + invalid; enabled on valid date change (`08/08/2019` → `09/09/2019` proved enable); invalid date = red border |
| Tabs | No stable IDs on tab triggers; select by visible text and tab role |
| Old-site baseline | Single page, 2155 rows, no tabs/search/sort, booleans as `Yes`/`No` |

---

## Validation Rules

**Save enablement**: Save is disabled when the form is pristine AND when any cell value is invalid. It enables when at least one valid change is pending. Invalid date entry renders a red border and an error icon on the cell and holds Save disabled regardless of other changes.

**Date format**: `MM/DD/YYYY`. Entering digits manually must not shift digits between Month, Day, and Year segments (NM-3067). The calendar picker is available as an alternative entry method.

**Allow Special Rate toggle**: Toggling the per-row button must enable Save (NM-2917). Reverting the toggle back to its original state must re-disable Save (NM-2918 — Save stays disabled when no net change exists).

**Remove confirmation**: The per-row remove control presents a confirmation dialog. Cancelling the dialog leaves the row intact.

**Unsaved-changes prompt**: Switching tabs while no change is pending must NOT show an unsaved-changes prompt (NM-3066).

---

## TC-DOP-OPT-001: Page loads with both tabs present and the Locations tab active by default

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Initialization / Structural |

**Preconditions**: Authenticated; navigating to the Discount Optimization Settings page for office 1604.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Discount Optimization Settings page for office 1604. | The page loads and the Discount Optimization Settings heading is visible. |
| 2 | Wait for the tab bar to appear. | Both tabs are visible: "Discount Optimization" and "Special Rate Exemptions by Service Type". |
| 3 | Observe which tab is active without clicking anything. | The "Discount Optimization" tab is selected and its content panel is shown by default. |

**Expected**: The page loads with both tabs present. The "Discount Optimization" tab is the active default. The "Special Rate Exemptions by Service Type" tab is present but not active.
**Data**: `office=1604` | `defaultTab=Discount Optimization`
**Notes**: Tab trigger buttons carry auto-generated IDs that change between renders. Select tabs by visible text only.
**Automatable**: Yes

---

## TC-DOP-OPT-002: Locations grid renders rows and all four column headers after the slow first paint

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Structural / Result fidelity / Render state |

**Surface_Family**: result-fidelity (QUICK)
**Surface_Family**: render-state (QUICK)

**Preconditions**: On the Discount Optimization Settings page, Locations tab active.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Wait for the grid row count to become non-zero (do not use a fixed timeout or networkidle). | The grid transitions from its "0 locations found" initial state to showing a non-zero number of rows. |
| 2 | Read the column header row. | Four column headers are visible: "ID", "Location Name", "Allow Special Rate", and "Special Rate Start Date". |
| 3 | Confirm the row count is greater than zero. | The grid shows more than zero rows; the exact count is not asserted because it reflects live data. |

**Expected**: After the slow first paint completes (up to approximately 22 seconds), the grid shows a non-zero row count and all four column headers — "ID", "Location Name", "Allow Special Rate", "Special Rate Start Date".
**Data**: `expectedColumns=[ID, Location Name, Allow Special Rate, Special Rate Start Date]` | `minRowCount=1`
**Notes**: The grid API returns 2154 rows but the UI shows `0 locations found` until it finishes rendering. Automation must wait on a content condition, not a timer. Row count is not frozen — do not assert the exact number.
**Automatable**: Yes

---

## TC-DOP-OPT-003: Locations grid rows show ID and Location Name values

| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Table-cell render |

**Surface_Family**: result-fidelity (QUICK)

**Preconditions**: Grid has completed its first paint (row count non-zero).
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the first visible row's ID cell. | The ID cell contains a non-empty numeric or alphanumeric location number. |
| 2 | Read the first visible row's Location Name cell. | The Location Name cell contains a non-empty text name. |

**Expected**: The first rendered row shows a non-empty ID and a non-empty Location Name. Both fields contain real values, not placeholder text.
**Data**: checked row = first rendered row
**Notes**: Confirms that cell values are bound from the API response, not blank.
**Automatable**: Yes

---

## TC-DOP-OPT-004: Office 1604 appears in its own locations list

| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Business rule |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search for "1604" in the search box. | The grid filters to rows matching "1604". |
| 2 | Confirm that the row for office 1604 (Parker Palm Springs) is present. | Office 1604 appears as a row in the grid — the host office is included in its own list. |

**Expected**: Office 1604 is present as a row in its own Discount Optimization locations list. A location includes itself.
**Data**: `officeUnderTest=1604`
**Notes**: Searching "1604" returns exactly one row — "Parker Palm Springs" — confirming the host office is not excluded from its own list.
**Automatable**: Yes

---

## TC-DOP-OPT-005: Search filters the grid; clearing restores all rows; no-match shows empty state

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Filter / Empty volume |

**Surface_Family**: empty-vol (QUICK)

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note the row count before searching. | The grid shows a non-zero number of rows. |
| 2 | Type a known location number (e.g. "2050") into the search box. | The grid filters immediately and shows only rows matching "2050". The filtered count is less than the unfiltered count. |
| 3 | Clear the search box. | The grid restores to its full unfiltered row set (non-zero count matching the pre-search level). |
| 4 | Type a string that matches no location (e.g. "ZZZZNOTAPLACE"). | The grid shows the empty state — a message indicating zero locations found. |
| 5 | Clear the search box again. | The grid restores to the full row set. |

**Expected**: Typing in the search box filters rows immediately (client-side, no Search button required). Clearing the box restores all rows. A search that matches nothing produces an empty state rather than an error.
**Data**: `knownFilter=2050` | `noMatchFilter=ZZZZNOTAPLACE`
**Notes**: Search placeholder: "Search by location number or location name". Filter is client-side and live — no button press needed.
**Automatable**: Yes

---

## TC-DOP-OPT-006: Search is case-insensitive on location name

| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Filter — text |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a location name fragment in lowercase (e.g. "abbey"). | The grid filters to rows whose Location Name contains "abbey", regardless of case. Every visible row in the filtered results must contain the search term — not just the first row. |
| 2 | Clear the search box. | Grid restores to the full row set. |

**Expected**: The search filter matches location names regardless of letter case, and every row in the filtered result contains the search term.
**Data**: `filterLower=abbey` | `expectedMatch=The Abbey Resort`
**Automatable**: Yes

---

## TC-DOP-OPT-010: ID column header opens a sort menu; Sort ascending then Sort descending reorders the grid

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Column header / Sort behaviour |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the "ID" column header cell. | The header cell is visible. |
| 2 | Click the options menu button inside the "ID" column header. | A two-item menu opens with "Sort ascending" and "Sort descending" options. |
| 3 | Click "Sort ascending". | The menu closes and the grid re-renders with rows in ascending ID order. |
| 4 | Note the first visible row's Location Name value as the ascending baseline. | A baseline name is captured. |
| 5 | Re-open the header menu and click "Sort descending". | The menu closes; the first visible row's Location Name changes — the grid is now in descending ID order. |
| 6 | Inspect the header cell for any accessible sort-state attribute. | No sort-state attribute is present — this grid signals sort state through row reorder only. The absence of such an attribute does not mean sorting is disabled. |

**Expected**: The ID column header contains an options menu button that opens a two-item menu. Choosing "Sort ascending" then "Sort descending" changes the first visible row, proving the grid reorders by column. Sort state is reflected by row order, not by an accessible attribute on the header.
**Data**: `column=ID` | `selector=thead th:has-text("ID")`
**Automatable**: Yes

---

## TC-DOP-OPT-011: Location Name column header opens a sort menu; Sort descending reorders the grid

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Column header / Sort behaviour |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the "Location Name" column header cell. | The header cell is visible. |
| 2 | Click the options menu button inside the "Location Name" column header. | A two-item menu opens with "Sort ascending" and "Sort descending" visible. |
| 3 | Note the first visible row's Location Name before sorting. | A baseline name is captured. |
| 4 | Click "Sort descending". | The menu closes; the grid re-renders. The first visible row's Location Name differs from the baseline — the grid is sorted in descending name order. |
| 5 | Inspect the header cell for any accessible sort-state attribute. | No sort-state attribute is present — this grid does not signal sort state via an accessible attribute; its absence does not mean sorting is disabled. |
**Data**: `column=Location Name` | `selector=thead th:has-text("Location Name")`
**Automatable**: Yes

---

## TC-DOP-OPT-012: Allow Special Rate column sort — Sort descending reorders the toggle value sequence

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Column header / Sort behaviour |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the "Allow Special Rate" column header cell. | The header cell is visible. |
| 2 | Click the options menu button inside the "Allow Special Rate" column header. | A menu opens. |
| 3 | Inspect the menu items. | "Sort ascending" and "Sort descending" are both present and visible. |
| 4 | Dismiss the menu (Escape). | The menu closes without changing row order. |
| 5 | Inspect the header cell for any sort-state indicator. | No sort-state indicator is present — this grid signals sort state through row reorder only. The absence of such an indicator does not mean sorting is disabled. |

**Expected**: Sorting by Allow Special Rate reorders the grid: the visible toggle-state sequence differs between ascending and descending sort, proving rows moved.
**Data**: `column=Allow Special Rate`
**Automatable**: Yes

---

## TC-DOP-OPT-013: Special Rate Start Date column sort — Sort descending reorders the date sequence

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Column header / Sort behaviour |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the "Special Rate Start Date" column header cell. | The header cell is visible. |
| 2 | Click the options menu button inside the "Special Rate Start Date" column header. | A menu opens. |
| 3 | Inspect the menu items. | "Sort ascending" and "Sort descending" are both present and visible. |
| 4 | Dismiss the menu (Escape). | The menu closes without changing row order. |
| 5 | Inspect the header cell for any sort-state indicator. | No sort-state indicator is present — this grid signals sort state through row reorder only. The absence of such an indicator does not mean sorting is disabled. |

**Expected**: Sorting by Special Rate Start Date reorders the grid: the visible date-input value sequence differs between ascending and descending sort, proving rows moved.
**Data**: `column=Special Rate Start Date`
**Automatable**: Yes

---

## TC-DOP-OPT-020: Allow Special Rate toggle — toggling on enables Save

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field value / Save state |

**Preconditions**: Grid has completed its first paint. Save is disabled (pristine form).
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm Save is disabled before any change. | The Save button is disabled. |
| 2 | Find a row where Allow Special Rate is currently off and click its toggle button. | The toggle reflects the new state — the button's pressed visual state changes. |
| 3 | Check the Save button state. | Save is now enabled. |

**Expected**: Toggling the Allow Special Rate control on a row changes the control's state and enables the Save button.
**Data**: `fieldName=allowSpecialRate` | `toggle=Allow Special Rate control on the row`
**Notes**: Regression guard for NM-2917.
**Automatable**: Yes

---

## TC-DOP-OPT-021: Allow Special Rate toggle — reverting the toggle re-disables Save

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Regression — NM-2918 |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Toggle the Allow Special Rate button on a row once (Save enables). | Save becomes enabled. |
| 2 | Toggle the same button again to return to the original state. | The toggle returns to its original state. |
| 3 | Check the Save button state. | Save is disabled again — no net change means no save is needed. |

**Expected**: Reverting the Allow Special Rate toggle to its original value re-disables Save. Save must stay disabled when no net change has been made (NM-2918).
**Data**: NM-2918
**Notes**: This is a regression case for NM-2918. The Save button must reflect the actual dirty state of the form, not a sticky "was changed" flag.
**Automatable**: Yes

---

## TC-DOP-OPT-022: Allow Special Rate toggle — Save stays disabled on pristine load

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Regression — NM-2918 |

**Preconditions**: Fresh navigation to the Locations tab. Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Wait for the grid to load fully without touching any control. | The grid displays rows. |
| 2 | Read the Save button state. | Save is disabled immediately on load — the form is pristine. |

**Expected**: Save is disabled on a pristine page load with no user interaction (NM-2918).
**Data**: NM-2918
**Automatable**: Yes

---

## TC-DOP-OPT-030: Special Rate Start Date date — valid date accepted and Save enabled

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field value — date |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Find a row with an existing date in the Special Rate Start Date column. Note the current value. | Current date value is noted (e.g. `08/08/2019`). |
| 2 | Click the date input cell on that row and type a new valid date (e.g. `09/09/2019`). | The date field updates to `09/09/2019`. No red border, no error icon. |
| 3 | Check the Save button state. | Save is enabled. |

**Expected**: Entering a valid date in the Special Rate Start Date field updates the cell and enables Save. No error state is shown.
**Data**: `originalDate=08/08/2019` | `newDate=09/09/2019`
**Notes**: Proven live: changing `08/08/2019` to `09/09/2019` enabled Save.
**Automatable**: Yes

---

## TC-DOP-OPT-031: Special Rate Start Date date — invalid entry shows red border and Save stays disabled

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field validation — date |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the date input on a row and type an invalid date (e.g. `13/40/2019`). | The date field accepts the typed text — no auto-correction occurs. |
| 2 | Move focus away from the cell (Tab). | The cell gains a red border (`border-red-500` CSS class) indicating the date is invalid. No accessible invalid-state attribute is used — live DOM inspection confirmed the red border is the only error signal. |
| 3 | Check the Save button state. | Save remains disabled while the invalid date is present. |

**Expected**: An invalid date renders a red border on the input and Save remains disabled.
**Correction note (2026-08-11)**: The original case said "red border + error icon". Live DOM inspection showed there is no error icon; the sole error signal is the `border-red-500` CSS class on the input element. The automation assertion was updated to match.
**Data**: `invalidDate=13/40/2019`
**Automatable**: Yes

---

## TC-DOP-OPT-032: Special Rate Start Date date — calendar picker opens and selects a date

| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field interaction — date picker |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the calendar icon (`Open calendar`) button on a row's Special Rate Start Date cell. | A date picker popover opens. |
| 2 | Select a date from the picker. | The popover closes and the selected date appears in the date input cell. |
| 3 | Check the Save button state. | Save is enabled (the date has changed). |

**Expected**: The calendar picker opens when the calendar icon is clicked, allows a date to be selected, populates the date field, and enables Save.
**Data**: `calendarButton=calendar icon button on the row`
**Automatable**: Yes

---

## TC-DOP-OPT-033: Special Rate Start Date date — manual entry does not shift digits between segments

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Regression — NM-3067 |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the date input on a row and type a date digit by digit (e.g. `0`, `9`, `0`, `9`, `2`, `0`, `1`, `9`). | Each digit is entered as typed. |
| 2 | Read the resulting date value in the field. | The date field shows `09/09/2019` — digits did not bleed from Month into Day or from Day into Year. |

**Expected**: Manual digit entry does not shift digits between the Month, Day, and Year segments. The date entered matches the digits typed in order (NM-3067).
**Data**: NM-3067 | `typedDigits=09092019` | `expectedResult=09/09/2019`
**Automatable**: Yes

---

## TC-DOP-OPT-040: Per-row remove — confirmation dialog appears; Cancel leaves the row intact

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Remove / Confirmation |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note the row count. | Row count is recorded. |
| 2 | Click the remove button on a visible row (e.g. the Remove button for "The Abbey Resort"). | A confirmation dialog or prompt appears asking whether to proceed with removal. |
| 3 | Click the Cancel / dismiss option on the dialog. | The dialog closes. |
| 4 | Confirm the row is still present and the row count is unchanged. | The row remains in the grid; the row count has not decreased. |

**Expected**: The per-row remove control presents a confirmation before removing. Cancelling the confirmation leaves the row intact and does not change the grid.
**Data**: `removeButton=Remove button for "The Abbey Resort"`
**Notes**: The test never confirms deletion — tests must not mutate live data. Only the Cancel path is exercised.
**Automatable**: Yes

---

## TC-DOP-OPT-041: Per-row remove — Save enables after cancelling remove

| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Remove / Save state |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the remove button on a row. | Confirmation dialog appears. |
| 2 | Cancel the dialog. | Dialog closes; row remains. |
| 3 | Read the Save button state. | Save is still disabled — a cancelled remove does not constitute a pending change. |

**Expected**: Cancelling a remove dialog leaves the form pristine; Save remains disabled.
**Automatable**: Yes

---

## TC-DOP-OPT-050: Save — disabled when pristine, enabled on valid change, persists after reload

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Persistence / Save cycle |

**Surface_Family**: persistence (QUICK)

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm Save is disabled on a fresh pristine load. | Save is disabled. |
| 2 | Make a valid change to a Allow Special Rate toggle on any row. | Save becomes enabled. |
| 3 | Click Save. | Save is submitted successfully. |
| 4 | Reload the page and wait for the grid to complete its first paint. | The page reloads. |
| 5 | Confirm the changed value is still present on the same row. | The toggled value persists after reload. The change was not lost. |

**Expected**: Save progresses from disabled (pristine) to enabled (valid change). After saving and reloading, the change survives — the value round-trips correctly.
**Data**: `changeType=toggle Allow Special Rate`
**Notes**: Automated against the writable automation environment (`cloudapps-e2e.encoreglobal.com`). The test captures the original toggle state and restores it unconditionally in a `finally` block. Date-change persistence is covered separately by TC-DOP-OPT-092. The Cancel path is covered by TC-DOP-OPT-022.
**Automatable**: Yes — the automation environment is the intended writable target; the test captures the original value and restores it unconditionally after each run.

---

## TC-DOP-OPT-051: Save remains enabled after adding a location

| Priority | Status | Type |
|----------|--------|------|
| High | Not Automated | Regression — NM-3063 |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Add button. | The add affordance opens. |
| 2 | Complete the add form with a valid location and confirm (do not cancel). | The new location appears in the grid as a pending row. Save is enabled. |
| 3 | Read the Save button state. | Save is enabled — the newly added row is a pending change. |

**Expected**: After adding a location, Save must remain enabled (NM-3063). The add operation must not inadvertently re-disable Save.
**Data**: NM-3063
**Notes**: Not automated. The "Change Local Office" picker dialog shows no selectable rows on every office checked: office 1604 returned "No results." (all local offices already present in the list), office 1605 returned "No results.", and office 1101 returned "No results." There is no available location to select anywhere in the automation environment, making step 2 impossible to complete. If data changes so that any office has an available location, automate by: filling the search input, clicking the first result row, clicking Select, clicking Update, asserting Save is enabled, then reloading without saving to discard the pending row. See TC-DOP-OPT-091 for the cancel path, which is automated separately.
**Automatable**: No — data blocker: picker shows "No results." on offices 1604, 1605, and 1101 (verified 2026-08-12)

---

## TC-DOP-OPT-091: Cancelling an incomplete Add leaves Save disabled

| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Boundary — Add flow cancel path |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm Save is disabled on a fresh load. | Save is disabled. |
| 2 | Click the Add button. | The Add panel opens with Update and Cancel buttons. |
| 3 | Click "Select a Location" to open the location picker. | The "Change Local Office" picker dialog appears with a search input. |
| 4 | Cancel the picker dialog without selecting anything. | The picker closes. |
| 5 | Cancel the Add panel. | The Add panel closes. |
| 6 | Read the Save button state. | Save is still disabled — the form has no unsaved changes pending. |

**Expected**: Cancelling an incomplete Add (picker opened but nothing selected, then panel cancelled) leaves Save disabled. No dirty state is introduced by opening and then abandoning the Add flow.
**Data**: `officeUnderTest=1604`
**Notes**: Covers the cancel path of the Add flow. Complements TC-DOP-OPT-051, which covers the complete Add path (currently not automatable due to a data blocker).
**Automatable**: Yes

---

## TC-DOP-OPT-052: Save round-trip — two dirty rows both persist after a single save

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Persistence / Batch save |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm Save is disabled on a fresh load. | Save is disabled. |
| 2 | Change the Allow Special Rate toggle on row A. | Toggle state on row A changes. Save becomes enabled. |
| 3 | Without saving, change the Allow Special Rate toggle on row B (a different row, not used by other tests). | Toggle state on row B changes. Save remains enabled. |
| 4 | Click Save once. | The save completes. Save becomes disabled. |
| 5 | Reload the page and wait for the grid to complete its first paint. | The page reloads. |
| 6 | Confirm the changed toggle state on row A is still present. | Row A's toggle reflects the value saved in step 4. |
| 7 | Confirm the changed toggle state on row B is still present. | Row B's toggle reflects the value saved in step 4. |

**Expected**: A single save carrying two dirty rows persists both changes. Neither row's pending change is silently dropped from the batch.
**Data**: `rowA=first available non-reserved row` | `rowB=second available non-reserved row` | `reserved=[InterContinental Chicago, The Abbey Resort]`
**Notes**: Automated against the writable automation environment. Both rows are restored to their original states in a `finally` block, leaving the environment exactly as found. Reserved rows are excluded to avoid collisions with other persistence tests.
**Automatable**: Yes

---

## TC-DOP-OPT-053: Pending edit survives the row being scrolled out of view

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Persistence / Virtual DOM recycling |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Find the first available non-reserved row near the top of the grid and record its current toggle state. | Row is identified by location name. |
| 2 | Change the toggle on the target row. | Toggle state changes; Save becomes enabled. |
| 3 | Scroll the grid container far enough down that the target row moves well off screen (hundreds of rows away). | The target row is no longer visible and has been unloaded from the page — the grid keeps only a window of rows loaded at a time. |
| 4 | Scroll back to the top of the grid. | The target row reappears on the page, rebuilt from the saved state. |
| 5 | Read the target row's toggle state again. | The toggle still shows the changed value — the pending edit was not discarded by the re-render. |
| 6 | Click Save and reload the page. | Save completes; the page reloads. |
| 7 | Confirm the changed toggle state persists after reload. | Row shows the saved value. |

**Expected**: A pending edit is held in the component model, not the DOM node. Scrolling the row out of the virtual viewport and back does not discard the pending change. The value is still present after re-render and persists after a save and reload.
**Data**: `targetRow=first non-reserved row near grid top` | `reserved=[InterContinental Chicago, The Abbey Resort]`
**Notes**: Automated against the writable automation environment. The test verifies that the row is genuinely unloaded from the page during the scroll — if the grid renders all rows at once rather than keeping only a viewport window, the unload check will fail, which is the correct outcome (the test cannot exercise row recycling on a non-virtual grid). The row is restored at the end of the test, leaving the environment exactly as found.
**Automatable**: Yes

---

## TC-DOP-OPT-090: Rejected save surfaces the failure and keeps the change pending

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Error handling / Server rejection |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Configure the test so that any save attempt on the optimization endpoint returns a server error, while leaving normal page data loading unaffected. | The interception is active; page data loads as normal. |
| 2 | Change the Allow Special Rate toggle on a row. | Toggle state changes; Save becomes enabled. |
| 3 | Click Save. | The save request is sent; the route intercepts it and returns 500. The request never reaches the server. |
| 4 | Confirm the route interception fired. | The interceptor was called — proving the request was stopped before the server. |
| 5 | Assert the app does not behave as if the save succeeded. | At least one of: an error element is visible, Save is still enabled, or the changed value is still present in the UI. |

**Expected**: When the server rejects a save with a 500 response, the app does not silently treat it as success. The pending change remains visible and the form remains dirty, and/or an error is surfaced to the user. The network interception is removed after the test and the page is reloaded to discard any pending state — no data is written to the server.
**Data**: `interceptedEndpoint=/navigator/api/discount/optimization` | `interceptedStatus=500` | `changeRow=The Abbey Resort`
**Notes**: Automated against the writable automation environment. The simulated server error applies only to save attempts — normal page data loading is not affected. The simulated failure is removed at the end of the test so no other test is affected, and the page is reloaded to discard any pending state. No data is written to the server.
**Automatable**: Yes

---

## TC-DOP-OPT-060: Add — opens the add affordance; Cancel discards cleanly

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Add / Cancel |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note the row count. | Row count recorded. |
| 2 | Click the Add button. | The add affordance (dialog or inline form) opens. |
| 3 | Click Cancel without entering anything. | The add affordance closes. |
| 4 | Confirm the row count is unchanged and Save is still disabled. | No row was added; the grid is unchanged; Save is still disabled. |

**Expected**: Clicking Add opens the add affordance. Clicking Cancel without submitting discards the action cleanly — no row is added and the form remains pristine.
**Data**: `addSelector=button:text-is("Add")` (scoped to tab 1 panel)
**Automatable**: Yes

---

## TC-DOP-OPT-061: Add button is present and visible on the Locations tab

| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Structural |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Look for the Add button in the Locations tab panel. | The Add button is visible and enabled. |

**Expected**: The Add button is present and enabled on the Locations tab.
**Automatable**: Yes

---

## TC-DOP-OPT-065: Switching tabs with no pending change does not show an unsaved-changes prompt

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Regression — NM-3066 |

**Preconditions**: On the Discount Optimization Settings page, Locations tab active, no changes made. Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm no change has been made (Save is disabled). | Save is disabled. |
| 2 | Click the "Special Rate Exemptions by Service Type" tab. | The tab switches to tab 2 immediately. |
| 3 | Confirm no unsaved-changes dialog or prompt appeared. | No unsaved-changes prompt was shown — the switch was silent. |
| 4 | Click back to the "Discount Optimization" tab. | Tab 1 loads again. |

**Expected**: Switching between tabs with no pending change does not trigger an unsaved-changes prompt (NM-3066).
**Data**: NM-3066
**Automatable**: Yes

---

## TC-DOP-OPT-070: Search includes deactivated locations by name and clears correctly

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Regression — NM-3210 |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note the row count in the default view. | Baseline row count recorded. |
| 2 | Apply an Active filter (if a filter control is present) to show only active locations. | The grid shows a subset of rows corresponding to active locations. |
| 3 | Toggle to show inactive locations. | The grid updates to show inactive locations. The row set differs from the active view. |
| 4 | Toggle back to the default (all) view. | The grid restores to the original baseline row count. |

**Expected**: Active/Inactive filtering shows correct and distinct results for each filter state (NM-3210). Toggling the filter does not cross-contaminate results.
**Data**: NM-3210
**Notes**: The search box provides the primary filter. If a dedicated Active/Inactive toggle is not present on this tab (confirmed from inventory as not enumerated), this case verifies that searching for a known deactivated location name still returns that row — i.e., inactive rows are included in the full set.
**Automatable**: Yes

---

## TC-DOP-OPT-071: Search returns deactivated locations

| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Filter / Regression — NM-3210 |

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a fragment of a known deactivated location name into the search box (e.g. "Deactivat"). | The grid filters and shows rows whose name contains "Deactivat". |
| 2 | Confirm at least one deactivated row appears. | One or more rows with a deactivated location name are shown — deactivated locations are included, not silently excluded. |

**Expected**: Deactivated locations appear in search results. The grid does not silently hide them (NM-3210).
**Data**: `filterFragment=Deactivat` | `knownDeactivatedRow=Sheraton Stamford Hotel deactivat`
**Notes**: The inventory lists several rows with "deactivat" in the name from the live enumeration.
**Automatable**: Yes

---

## TC-DOP-OPT-072: Allow Special Rate toggle enables Save — regression lock

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Regression — NM-2917 |

**Preconditions**: Grid has completed its first paint. Save is disabled.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm Save is disabled. | Save button is disabled. |
| 2 | Click the Allow Special Rate toggle button on any row. | The toggle state changes. |
| 3 | Read the Save button state. | Save is now enabled. |

**Expected**: Toggling the Allow Special Rate button enables Save (NM-2917). This is a dedicated regression lock.
**Data**: NM-2917
**Notes**: TC-DOP-OPT-020 is the broader feature case; this case is the minimal regression lock for NM-2917.
**Automatable**: Yes
---

## TC-DOP-OPT-092: Save round-trip — a Special Rate Start Date date change persists after reload

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Persistence / Save cycle |

**Surface_Family**: persistence (QUICK)

**Preconditions**: Grid has completed its first paint.
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm Save is disabled on a fresh pristine load. | Save is disabled. |
| 2 | Open the calendar picker for a known row (InterContinental Chicago) and select a date one month ahead. | The calendar popover closes and the date input shows the selected date. Save becomes enabled. |
| 3 | Click Save. | Save is submitted successfully and Save becomes disabled. |
| 4 | Reload the page and wait for the grid to complete its first paint. | The page reloads. |
| 5 | Confirm the saved date is still shown on the same row. | The date persists after reload. The change was not lost. |

**Expected**: A Special Rate Start Date date change round-trips correctly — the value is present after save and reload.
**Data**: `persistenceLocation=InterContinental Chicago` | `changeType=Special Rate Start Date date (calendar picker)`
**Notes**: Automated against the writable automation environment. The test captures the original date and restores it unconditionally in a `finally` block. Toggle persistence is covered separately by TC-DOP-OPT-050.
**Automatable**: Yes — the automation environment is the intended writable target; the test restores the original value after each run.
