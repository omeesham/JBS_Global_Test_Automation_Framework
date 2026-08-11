# Service Charge — History Test Plan

**Module**: service-charge
**Submodule**: HIS
**Page**: Location Settings → Service Charge (`/settings/service-charge`) — Service Charge History tab
**Test Entity**: Office 1604
**Governing story**: NM-2210
**Updated**: 2026-08-11
**Total Scenarios**: 15
**Test Cases**: `service_charge_history_test_cases.md`

---

## 1. Purpose

Cover the Service Charge History tab: a read-only audit grid recording changes made via the Basic
Information tab, with four columns (`Service Type`, `Service Charge Percentage`, `Modified By`,
`Modified On`) and a page heading.

## 2. Scope

**In scope**: tab navigation and heading, column header render, grid population, cell format
assertions (percentage, date), default sort order, read-only interactive census, absence of
pagination and filter controls, per-office data isolation, office-context preservation on tab
switch, unsaved-changes modal on tab switch, and cross-tab dependency (save on Basic Information
creates a history row).

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| Column sorting (interactive) | Sort probe contaminated — grid empty at time of click; sort behaviour unconfirmed — NEEDS-LIVE-CONFIRM (TC-SVC-HIS-012 blocked) |
| After-save History row | Not observed; save-then-History run not performed — NEEDS-LIVE-CONFIRM (TC-SVC-HIS-013 blocked) |
| Empty-state text | No empty History grid available in test data; exact message not observed |
| Error state on History load failure | No way to force an API failure in test today (NM-2210 AC8) |
| All deep families (sort exhaustive, volume, combination, cross-tab dirty-state deep) | Deferred to DEEP per case file |

## 3. Environment

Office 1604 (Parker Palm Springs) on the standard test environment. The History tab was
successfully walked on **2026-08-11**: the grid loaded with 50 rows. Walk artifacts:
`nm3344-histwalk2-0811` (50 rows, first-ten rows cell-for-cell),
`nm3344-histwalkfull-0811` (column headers, interactive census, pagination/filter census,
offices 1101 and 1105 row counts), `nm3344-sortprobe-0811` (sorting probe — contaminated,
grid was unpopulated at probe time).

Previous walk attempts on 2026-08-10 (`nm3344-histwalk-0810`, `nm3344-histwalk2-0810`) were
defeated by a degraded e2e environment; those blockers are now resolved.

## 4. Open Items — NEEDS-LIVE-CONFIRM (2 items)

| # | Item |
|---|---|
| NLC-HIS-04 | Whether clicking a column header button reorders grid rows (sort probe was contaminated — see TC-SVC-HIS-012) |
| NLC-HIS-05 | Whether a save on Basic Information immediately adds a new row to the History grid (TC-SVC-HIS-013) |

## 5. Risks

1. **Known defect NM-3300** — the page `<h1>` renders `Service Charge` with no office name. TC-SVC-HIS-001 step 3 is expected to fail against the current build and records this defect.
2. **Known defect NM-3285** — navigating from Basic Information to History with unsaved edits does not show an Unsaved Changes modal. TC-SVC-HIS-014 is expected to fail against the current build and records this defect.
3. **Unticketed defect** — `Modified By` renders a raw GUID instead of a display name across all sampled rows. TC-SVC-HIS-010 is expected to fail against the current build; no covering ticket was found at walk time.
4. TC-SVC-HIS-013 (after-save row) depends on performing a save on the Basic Information tab and confirming the applicable save dialog (LR-012 default assumed, not verified for this tab).
5. TC-SVC-HIS-012 (column sorting) requires a clean sort probe on a fully populated grid before any sort assertion can be made.

## 6. Scenarios

| TC | Scenario | Automatable |
|---|---|---|
| TC-SVC-HIS-001 | History tab activates correctly and shows the right heading and columns | Yes — **Step 3 expected to fail (NM-3300)** |
| TC-SVC-HIS-002 | Grid populates with data rows after the History tab loads | Yes |
| TC-SVC-HIS-003 | Every visible row has four non-empty cells | Yes |
| TC-SVC-HIS-004 | Service Charge Percentage cells render in `24.00 %` format | Yes |
| TC-SVC-HIS-005 | Modified On cells render in `MM/DD/YYYY hh:mm:ss AM\|PM` format | Yes |
| TC-SVC-HIS-006 | Grid default sort is Modified On descending (newest record first) | Yes |
| TC-SVC-HIS-007 | Grid is read-only — no interactive elements inside | Yes |
| TC-SVC-HIS-008 | No pagination control is present on the History tab | Yes |
| TC-SVC-HIS-009 | No filter, search, or date-range control is present on the History tab | Yes |
| TC-SVC-HIS-010 | Modified By cells render a raw GUID, not a person name or email | Yes — **expected to fail (unticketed defect)** |
| TC-SVC-HIS-011 | History data is scoped per office — different offices show different row sets | Yes |
| TC-SVC-HIS-012 | Sorting by column header | Blocked: NEEDS-LIVE-CONFIRM |
| TC-SVC-HIS-013 | A save on Basic Information adds a new row to History | Blocked: NEEDS-LIVE-CONFIRM |
| TC-SVC-HIS-014 | Navigating to History tab with unsaved Basic Information edits triggers an Unsaved Changes modal | Yes — **expected to fail (NM-3285)** |
| TC-SVC-HIS-015 | Office context is preserved when switching from Basic Information to History tab | Yes |

## 7. Blocked scenarios

2 of 15 scenarios are blocked:

- **TC-SVC-HIS-012** — sort probe ran against an empty grid and timed out. Unblocked when a clean probe on a populated grid captures both before and after first-row values for at least one column.
- **TC-SVC-HIS-013** — no save-then-History observation performed. Unblocked when a live run confirms: the new row appears at the top, its Modified By GUID matches the automation account, and the applicable save dialog is identified.

## 8. Bug-evidence cases (expected to fail against current build)

Three cases are deliberately authored to fail as evidence vehicles for known defects. A red result
on these is expected and correct — it is not a broken test.

| TC | Defect | Ticket |
|---|---|---|
| TC-SVC-HIS-001 (Step 3) | Page `<h1>` does not include the selected office name | NM-3300 |
| TC-SVC-HIS-010 | `Modified By` renders a raw GUID instead of a display name | No ticket found at walk time |
| TC-SVC-HIS-014 | Navigating away from unsaved Basic Information edits does not trigger an Unsaved Changes modal | NM-3285 |

## 9. Coverage summary

| Area | Scenarios | Count |
|---|---|---|
| Render-state (tab heading, column headers, read-only census, no filter, no pagination, office context) | TC-SVC-HIS-001, TC-SVC-HIS-007, TC-SVC-HIS-008, TC-SVC-HIS-009, TC-SVC-HIS-015 | 5 |
| Empty-vol (grid populates, all cells non-empty) | TC-SVC-HIS-002, TC-SVC-HIS-003 | 2 |
| Format (percentage format, date format) | TC-SVC-HIS-004, TC-SVC-HIS-005 | 2 |
| Sorting (default sort order, interactive sort) | TC-SVC-HIS-006, TC-SVC-HIS-012 | 2 |
| Result-fidelity (Modified By GUID defect, per-office isolation, after-save row) | TC-SVC-HIS-010, TC-SVC-HIS-011, TC-SVC-HIS-013 | 3 |
| Bug-evidence / modal (unsaved-changes modal) | TC-SVC-HIS-014 | 1 |

**Total: 15 cases.** Counted by listing TC-SVC-HIS-001 through TC-SVC-HIS-015 in the case file
(15 `## TC-SVC-HIS-` headings). Automatable now: 12. Blocked: 2. Expected-to-fail: 3 (overlap
with automatable — they run, they fail, they record defect evidence).

**Deferred to DEEP** (from case file):
- Sort exhaustive — asc/desc toggle per column, sort-by-type (numeric vs lexical for Percentage), sort persists across navigation
- Volume — History grid with a very large number of audit rows (virtualization integrity)
- Combination — filter + sort compose correctly (if filter controls exist)
- Cross-tab dirty-state deep coverage
- Error state on History load failure (NM-2210 AC8)
