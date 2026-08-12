# Discount Optimization — Special Rate Exemptions by Service Type Test Cases

**Module**: discount-optimization (tab 2 — Special Rate Exemptions by Service Type)

| Module | Test Cases | Automated | Pending Automation | Out of Scope | Updated |
|--------|------------|-----------|--------------------|--------------|---------|
| Discount Optimization — Exemptions | 6 | 6 (100%) | 0 (0%) | 0 (0%) | 2026-08-11 |

> **Tab 2 — "Special Rate Exemptions by Service Type"** — editable grid listing service types with a per-row `Exempt` checkbox toggle, a `Search by service type` text box, and `Cancel` / `Save` action buttons. Surface is net-new on the new Navigator site; it does not exist on the legacy site, so there is no legacy behaviour to compare against. Source API: `GET /navigator/api/discount/optimization/service-types?skipPagination=true` returns 29 service-type objects; exactly 3 carry `isSpecialRateAllowed: true` at time of enumeration (Equipment Rental, HSIA - Equipment, HSIA - Subrental Equipment). Ticket NM-3340 (open, Blocker) will change which service types appear — cases assert structure and the rule, not a frozen membership list. The parent surface takes roughly 22 seconds to first paint; all preconditions must wait on a content condition (rows visible), never a fixed timeout or `networkidle`. Tabs carry no stable test IDs (auto-generated Radix ids only); select the tab by visible text and accessible role. Machine-enumeration artifact: `reports/walk-coverage/dop-tab2.json` (2026-08-11).
>
> **Boolean render — `Exempt` column status**: The `Exempt` column shows a checkbox on each service-type row. Reading whether the box is ticked is the reliable approach; reading the cell's text content is NOT used because boolean rendering differs per table in this app and the `Exempt` column's text content was not independently confirmed. Cases check whether each checkbox is ticked or unticked — see `## Assumptions pending live confirmation`.

---

## FIELD INVENTORY & DISCOVERY

**Machine walk 2026-08-11 (Playwright CLI, office 1604).** Tab 2 of the Discount Optimization Settings page.

**Controls on tab 2:**

| # | Control | Role | Selector strategy |
|---|---------|------|-------------------|
| 1 | Search by service type | text input | `input[placeholder="Search by service type"]` |
| 2 | Cancel | button | `button:text-is("Cancel")` (scoped inside tab 2 panel) |
| 3 | Save | button | `button:text-is("Save")` (scoped inside tab 2 panel) |
| 4 | Service Type column | table header | `th:text-is("Service Type")` |
| 5 | Exempt column | table header | `th:text-is("Exempt")` |
| 6 | Data rows | table body | `tbody tr` (scoped inside tab 2 panel) |
| 7 | Per-row Exempt checkbox | checkbox | Exempt checkbox for that service type |

**Tab navigation:**
- Tab list: the tab bar containing "Discount Optimization" and "Special Rate Exemptions by Service Type"
- Activate tab 2: click the tab labelled "Special Rate Exemptions by Service Type"
- Tab 2 panel: the tab's content panel that becomes visible after activation

**Data facts (measured 2026-08-11, subject to NM-3340):**
- API: `GET /navigator/api/discount/optimization/service-types?skipPagination=true`
- Row count: 29 at time of enumeration
- Exempt at enumeration: Equipment Rental, HSIA - Equipment, HSIA - Subrental Equipment (3 of 29)

**Save cycle (from inventory observations):**
- Save is disabled on arrival (pristine state)
- Save enables on a valid change
- Cancel discards uncommitted changes

---

## MCP_VERIFICATION_LOG

| Field | Value |
|---|---|
| Date | 2026-08-11 |
| Tool | Playwright CLI enumeration (script family) |
| Page | Discount Optimization Settings — tab 2: Special Rate Exemptions by Service Type |
| Office | 1604 (Parker Palm Springs) |
| Controls verified | input `Search by service type`; button `Cancel`; button `Save`; columns `Service Type`, `Exempt`; 29 checkbox rows |
| Boolean render | Checkbox per row; ticked/unticked state used for assertions; text content not used (render format not independently confirmed via live DOM) |
| Baseline scope | baseline-absent (tab 2 does not exist on legacy site) |
| Source API | `GET /navigator/api/discount/optimization/service-types?skipPagination=true` — 29 objects |
| NM-3340 | Open blocker; will change service-type membership — cases assert rule and structure, not frozen list |
| Tab selector | By accessible role + visible text; no stable test IDs (auto-generated Radix ids excluded) |

---

## Validation Rules

- **Save disabled in pristine state**: the Save button is disabled when the form has no uncommitted changes. It enables only after a valid toggle change.
- **Cancel discards**: clicking Cancel while there are uncommitted changes discards them and returns the form to its last-saved state.
- **Search filters in-page**: typing in the search box filters the visible service-type rows without calling the API again (the API returns all rows on load via `skipPagination=true`; filtering is client-side).
- **Exempt toggle per row**: each service-type row carries a checkbox that toggles the `isSpecialRateAllowed` flag for that service type under this office's discount optimization settings.

---

## Assumptions pending live confirmation

- **Exempt checkbox assertion**: The text content of the `Exempt` column checkboxes was not confirmed live. The enumeration captured standard checkbox elements. Cases check whether each checkbox is ticked or unticked. If the implementation uses a non-checkbox indicator (e.g., a read-only check icon), the assertions in TC-DOP-EXM-001 and TC-DOP-EXM-020 must be updated to match the actual render format after live verification.
- **Search is client-side**: the API is called once on load (`skipPagination=true`); filtering is assumed to be client-side. If the search box triggers an API call per keystroke, TC-DOP-EXM-010 must be updated.
- **Save writes to API and survives reload**: assumed based on standard Navigator save-cycle behaviour. TC-DOP-EXM-020 must be manually verified if the app's save mechanics on this tab differ.
- **Cancel does not call the API**: assumed; cancel is observed to discard local state only.

---

## TC-DOP-EXM-001: Tab activates and surface renders with expected columns and rows

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Initialization / Structural |

**Preconditions**: Authenticated user; navigated to the Discount Optimization Settings page for office 1604; the page has completed its initial load (wait for the tab list to be visible — the parent surface takes roughly 22 seconds to first paint, so wait on a content condition such as the tab list becoming visible, never a fixed timeout).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the tab with visible text "Special Rate Exemptions by Service Type" and click it. | The tab becomes active and its panel is displayed. |
| 2 | Wait for the service-type rows to appear inside the tab panel. | At least one row is visible inside the panel (content condition met; do not use a fixed wait). |
| 3 | Read the table column headers inside the tab panel. | Exactly two columns are present: "Service Type" and "Exempt". |
| 4 | Count the data rows in the table body. | At least one service-type row is present. The row count matches what the API returned (do not assert a specific number — membership is subject to change). |
| 5 | Confirm the Cancel and Save buttons are present inside the tab panel. | Both the "Cancel" button and the "Save" button are visible inside the tab 2 panel. |

**Expected**: The tab activates, the panel shows two columns ("Service Type" and "Exempt"), at least one data row renders, and both Cancel and Save buttons are present.
**Data**: none
**Notes**: Row count must not be hardcoded. The assertion is structural: columns present, rows present, action buttons present.
**Automatable**: Yes

---

## TC-DOP-EXM-002: Save is disabled when no changes have been made (pristine state)

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Behavioural / Save-cycle |

**Preconditions**: Tab 2 is active; rows are visible; no changes have been made since the panel loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Without toggling any checkbox or interacting with any row, read the Save button's enabled state. | The Save button is disabled (greyed out). |
| 2 | Confirm the Cancel button state. | The Cancel button is also present; its enabled state may vary by implementation (assert only Save is disabled in pristine state). |

**Expected**: Save is disabled when the form is in a pristine (unchanged) state.
**Data**: none
**Notes**: This is the pristine-disabled half of the TC-DOP-EXM-020 save-cycle contract, broken out for clarity.
**Automatable**: Yes

---

## TC-DOP-EXM-010: Search box filters service-type rows; clearing restores the full list; a no-match query shows the empty state

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Behavioural / Search — result-fidelity (QUICK), empty-vol (QUICK) |

**Surface_Family**: result-fidelity (QUICK), empty-vol (QUICK)

**Preconditions**: Tab 2 is active; all service-type rows are visible (full list).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the number of visible rows (baseline count). | A positive number of rows is present; record it as the baseline. |
| 2 | Type a substring that matches a known service type (e.g., "HSIA") into the "Search by service type" input. | The row list narrows to only rows whose service-type name contains the typed substring. The row count is less than or equal to the baseline count. |
| 3 | Confirm that every visible row's "Service Type" cell contains the typed substring (case-insensitive). | All visible rows match the filter term; non-matching rows are hidden. |
| 4 | Clear the search input (set it to empty). | The full list of service-type rows is restored; the row count returns to the baseline. |
| 5 | Type a string that matches no service type (e.g., "ZZZNO-MATCH-99999"). | All service-type rows are hidden; an empty state is displayed (e.g., a "no results" message or an empty table body). |
| 6 | Clear the search input again. | The full list is restored (baseline row count). |

**Expected**: The search box filters rows in-page; clearing it restores the full list; a no-match term produces the empty state.
**Data**: Filter term: `"HSIA"` (known to match at least 3 rows at time of enumeration). No-match term: `"ZZZNO-MATCH-99999"`.
**Notes**: Do not assert exact row counts — NM-3340 will change the membership. Assert that the filtered count is ≤ baseline and that every visible row's service-type text contains the filter term. The search is client-side (API called once on load); no network assertion is needed here.
**Automatable**: Yes

---

## TC-DOP-EXM-011: Search is case-insensitive

| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Behavioural / Search — result-fidelity (QUICK) |

**Surface_Family**: result-fidelity (QUICK)

**Preconditions**: Tab 2 is active; all service-type rows are visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type an uppercase-only version of a known service type substring (e.g., "EQUIPMENT") into the search box. | At least one row is visible, and every visible row's service-type name contains "equipment" (case-insensitive). |
| 2 | Clear the input. Type the same substring in lowercase (e.g., "equipment"). | Exactly the same set of rows is returned as in step 1 — the same service-type names appear, not merely the same count. |
| 3 | Clear the input. | Full list restored. |

**Expected**: The search filter is case-insensitive; the same rows appear regardless of the case of the search term.
**Data**: Uppercase term: `"EQUIPMENT"`. Lowercase term: `"equipment"`.
**Notes**: If the search is case-sensitive by design, this case should be marked as a defect finding.
**Automatable**: Yes

---

## TC-DOP-EXM-020: Save cycle — pristine disabled, enabled by valid change, change persists after reload; Cancel discards

| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Behavioural / Save-cycle — persistence (QUICK) |

**Surface_Family**: persistence (QUICK)

**Preconditions**: Tab 2 is active; rows are visible; no uncommitted changes.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm Save is disabled in pristine state. | Save button is disabled; no changes pending. |
| 2 | Record the current checked state of the "Exempt Equipment Rental" row checkbox (the known-exempt row). | State is recorded (either checked or unchecked depending on current data). |
| 3 | Click the "Exempt Equipment Rental" checkbox to toggle it to the opposite state. | The checkbox toggles to the opposite value. The Save button becomes enabled. |
| 4 | Click the "Cancel" button. | The checkbox returns to its pre-toggle state (the change is discarded). The Save button returns to disabled. |
| 5 | Toggle the "Exempt Equipment Rental" checkbox again to the opposite of its current (original) state. | The Save button becomes enabled again. |
| 6 | Click "Save". | The Save button is clicked; the page accepts the save (no error state; Save returns to disabled after the operation completes). |
| 7 | Reload the page; navigate back to tab 2 and wait for rows to appear. | The toggled value from step 5 persists: the "Exempt Equipment Rental" checkbox shows the checked state that was saved in step 6. |
| 8 | Restore the original state: toggle the checkbox back to its original value from step 2 and save again. | The Save completes; the row is back to its original state. Data is left clean. |

**Expected**: Save is disabled when pristine; enabling on a valid toggle; Cancel discards the change; Save persists the change after reload; the original value can be restored.
**Data**: Row used: "Equipment Rental" (confirmed exempt at enumeration, `isSpecialRateAllowed: true`).
**Notes**: This test mutates live data and must restore it in step 8. If the automation account does not have write permission on this tab, mark this test as Manual with reason "write permission not confirmed for automation account." The save assertion must wait on a content condition (Save re-disabling or a success indicator), not a fixed timeout.
**Automatable**: Yes — with write-permission caveat above. Mark Manual if write permission cannot be confirmed.

---

## TC-DOP-EXM-021: Cancel discards multiple simultaneous checkbox changes

| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Behavioural / Save-cycle |

**Preconditions**: Tab 2 is active; rows are visible; no uncommitted changes.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Record the current checked state for at least two rows (e.g., "Equipment Rental" and "Digital Branding"). | States recorded. |
| 2 | Toggle both checkboxes to the opposite state. | Both checkboxes show the new state; Save is enabled. |
| 3 | Click "Cancel". | Both checkboxes return to their original states (both changes are discarded). Save is disabled. |

**Expected**: Cancel discards all pending changes, not just the most recent one.
**Data**: Rows: "Equipment Rental" and "Digital Branding" (one currently exempt, one not — at time of enumeration).
**Notes**: Does not require a Save; safe to run without write permission.
**Automatable**: Yes
