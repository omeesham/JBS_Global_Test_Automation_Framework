# Discount Matrix — Region Weekly Peaks Test Plan

**Module**: discount-matrix
**Submodule**: RWP
**Page**: Location Settings → Discount Matrix (`/locations/{office}/settings/discount-matrix`) — Region Weekly Peaks tab
**Test Entity**: Office 1604
**Governing Requirement**: NM-3530 (build spec NM-2220)
**Updated**: 2026-08-27
**Total Scenarios**: 26
**Test Cases**: `discount_matrix_region_weekly_peaks_test_cases.md`

---

## 1. Purpose

Cover the Region Weekly Peaks tab: a Year and a Region selector over a 52-week grid where each
week carries exactly one of three peak classifications (Non-Peak / Standard / Peak), plus a
toolbar (Add Year, Export, Import, Cancel, Save) that is disabled until the grid is dirty.

## 2. Scope

**In scope**: default selections at open (the tab rests on the newest configured year); both
selector option sets (a growing, newest-first year list with the three seed years as its fixed
tail; 28 regions) with each seed year exercised and both ends of the region list; grid shape
(five columns, 52 rows, weekly start dates in sequence); the one-classification-per-row data
rule; the measured mutual-exclusivity model including the clear-to-zero behaviour; toolbar
disabled states; dirty-tracking undo; one save-and-reload persistence proof; the two-stage load
where the grid renders 52 placeholder rows and `Count: 0` for ~40s before real data arrives;
the three io flows — year creation (permanent, owner-authorized 2026-08-26), export download
(name and size), and the import round-trip on a non-default region proving the file both
applies and persists with no Save click. Added 2026-08-27, closing the shared-bar interaction
gap: the country re-scope of this tab (Canada context with its own region list, currency
following the country, full United States state restored on switch-back) and a real bar save
committed while this tab is open, proving the bar's Save and the panel's Save never couple
(TC-DSM-RWP-025 / -026, contracts measured in `reports/walk-coverage/dsm-critbar-rwp-probe.json`).

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| All 28 regions exercised individually | Deep-pass sweep; the quick pass proves the resting selection, one mid-list switch, and the last option |
| Export file content | Cell-level read-back of the workbook belongs to the deep pass; the quick pass pins the download event, the file name, and a non-trivial size (the irreversibility block on the io flows was lifted 2026-08-26 when the owner authorized data changes on offices 1604/1101 — year creation, export, and import are now covered by TC-DSM-RWP-022/023/024) |
| Server acceptance of a zero-classification week | The quick pass stops before Save on that state; recorded as an observation for product triage |

## 3. Environment and data

Office 1604, criteria at rest (`United States` / `USD` / `Standard`), tab resting on the newest
configured year with `Atlanta` (the year list grows one per full run — TC-DSM-RWP-022 creates the
next year each time, which is permanent by design and owner-authorized; date-exact cases pin the
reference year `2027`). NM-3293 reports the `LA / AL` region failing to display data — switch
cases use `Austin` and `VA / W PA` instead, and the option-set case only proves `LA / AL` exists.
The import case runs on `Austin` and restores its own change by re-importing the exported
snapshot; the export case runs on `VA / W PA`.

## Shared execution constraints

These bind every spec that runs against this page; they come from measured behaviour, not convention.

| Constraint | Consequence for execution |
|---|---|
| The page hydrates in stages; the criteria bar's threshold input resolves at t≈91–100s, Region Weekly Peaks data at tab-click +40s (~134s total) | Specs raise their per-test timeout ceilings and gate readiness on the loading-placeholder census reaching zero — never on row count, which reads 52 in both the loading and loaded states |
| The threshold input is a formatted numeric | It is typed character by character; a single programmatic fill silently writes a different number |
| Save disables optimistically on click | Persistence is proven only by reload-and-read; a disabled Save button proves nothing |
| Non-numeric entry corrupts the underlying form model | Every case that types a non-numeric value ends with a reload; retyping a good value is not a reliable repair |
| Office 1604 is live shared data | Every mutating case restores what it changed and proves the restore by reload; re-runs are idempotent |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-DSM-RWP-001 | The tab opens on the newest year with a region selected | Surface — render-state (QUICK) | Yes |
| TC-DSM-RWP-002 | Select Year lists the configured years, newest first | Field (Axis 1) | Yes |
| TC-DSM-RWP-003 | Region offers the full set of 28 regions | Field (Axis 1) | Yes |
| TC-DSM-RWP-004 | The grid shows the five weekly-peak columns | Surface — render-state (QUICK) | Yes |
| TC-DSM-RWP-005 | A loaded year shows 52 week rows and a matching footer count | Surface — empty-vol (QUICK) | Yes |
| TC-DSM-RWP-006 | The grid is still loading while the footer reads zero | Surface — empty-vol (QUICK) | Yes |
| TC-DSM-RWP-007 | Each week row carries exactly one peak classification | Field (Axis 1) | Yes |
| TC-DSM-RWP-008 | Week rows are numbered in sequence with weekly start dates | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-RWP-009 | Data actions are open and edit actions closed at rest | Field (Axis 1) | Yes |
| TC-DSM-RWP-010 | Cancel and Save stay disabled while nothing has been edited | Field (Axis 1) | Yes |
| TC-DSM-RWP-011 | Switching region reloads the grid for that region | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-RWP-012 | Switching year reloads the grid with that year's dates | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-RWP-013 | Region Weekly Peaks keeps the criteria bar above it | Surface — render-state (QUICK) | Yes |
| TC-DSM-RWP-014 | A ticked classification can be cleared, leaving the week unclassified | Field (Axis 1) | Yes — mutating, self-restoring |
| TC-DSM-RWP-015 | Selecting 2025 reloads the grid with that year's dates | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-RWP-016 | Selecting the last region in the list reloads the grid | Surface — result-fidelity (QUICK) | Yes |
| TC-DSM-RWP-017 | Choosing a different classification moves it off the previous one | Field (Axis 1) | Yes — mutating, self-restoring |
| TC-DSM-RWP-018 | Undoing a classification change returns Save to disabled | Field (Axis 1) | Yes |
| TC-DSM-RWP-019 | A classification change survives a save and reload | Surface — persistence (QUICK) | Yes — mutating, saves then restores through the same path |
| TC-DSM-RWP-020 | Switching to the LA / AL region loads that region's complete weekly grid | Surface — empty-vol (QUICK) | Yes — read-only; restores Atlanta |
| TC-DSM-RWP-021 | Cancel discards a pending classification change and closes the toolbar | Surface — persistence (QUICK) | Yes — client-side edit discarded via Cancel; nothing saved |
| TC-DSM-RWP-022 | Add Year creates the next year as a full copy of the previous one | Surface — io (QUICK) | Yes — mutating; creation is permanent by design (owner-authorized 2026-08-26); always creates the year after the newest, so runs stay repeatable |
| TC-DSM-RWP-023 | Export downloads the full peak workbook without any window | Surface — io (QUICK) | Yes — read-only download from the last region |
| TC-DSM-RWP-024 | Import applies an exported workbook and persists it without Save | Surface — io (QUICK) | Yes — mutating on `Austin`; the exported snapshot is the restore vehicle, so the case ends where it started |
| TC-DSM-RWP-025 | Changing Country re-scopes the weekly grid and switching back restores it | Cross-tab (bar × this tab) | Yes — view switch only, nothing saved; ends back on United States |
| TC-DSM-RWP-026 | The threshold saves from this tab, independent of the tab's own Save | Cross-tab (bar × this tab) | Yes — mutating; restores the prior threshold through a verified save |
