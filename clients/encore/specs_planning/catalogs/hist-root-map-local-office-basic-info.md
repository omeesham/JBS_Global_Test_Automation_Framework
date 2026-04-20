# Hist Root Map — Local Office Settings History / Basic Information Tab

**Session**: 2026-04-20
**Agent**: HUNTER (rutvik)
**Office**: 1604
**Scope**: Basic Information tab parents → 42-col Local Office Settings History
**Reference**: SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2 for 42-col header list; SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md for method

## Session note — plan correction

The subplan's §Scope enumerated Location Management fields (Name, Active, Live Date, Tax Mode, Country, Region, LOB, eCommerce Active, Enable Productions Orders). Those fields live on **Location Management → Basic Information**, not on **Local Office Settings → Basic Information** (different page). Local Office Settings → Basic Information exposes date offsets, service-type / logo / section checkboxes, phone numbers, default-job / default-order toggles, and combobox/note/logo sub-references. This session cataloged 15 of the actual Local Office Basic Info parents via MCP; remaining Basic Info parents (roughly 7 more, see **Deferred** section below) will be cataloged in SP-B-LO-1b.

Every MCP save was confirmed by a clean 1-col-plus-Modified-On diff between top-row (r0) and prior-row (r1) of the 42-col history table. No cascades, no spurious columns. Baseline restored at end of session (all 40 non-timestamp columns byte-match pre-session baseline).

## Parent → Column Map

| # | Parent field | Parent testid | Control type | State space | Target col (0-idx, header) | Status | Encoding | Evidence (change save → row timestamp) |
|---|---|---|---|---|---|---|---|---|
| P1 | Prep Date Offset | `local-office-settings-input-prep-date-offset` | integer | any signed int | col 1 "Prep Date Offset" | TRACKED | plain int | 12:59:48 `-1 → -2` → row 12:59:48 |
| P2 | Return Date Offset | `local-office-settings-input-return-date-offset` | integer | any signed int | col 2 "Return Date Offset" | TRACKED | plain int | 13:02:30 `1 → 2` → row 13:02:30 |
| P3 | Set Date Offset | `local-office-settings-input-set-date-offset` | integer | any signed int | col 3 "Set Date Offset" | TRACKED | plain int | 13:06:58 `-1 → -5` → row 13:06:58 |
| P4 | Strike Date Offset | `local-office-settings-input-strike-date-offset` | integer | any signed int | col 4 "Strike Date Offset" | TRACKED | plain int | 13:08:29 `1 → 2` → row 13:08:29 |
| P5 | Delivery Date Offset | `local-office-settings-input-delivery-date-offset` | integer | any signed int | col 6 "Delivery Date Offset" | TRACKED | plain int | 13:10:46 `0 → -1` → row 13:10:46 |
| P6 | Pickup Date Offset | `local-office-settings-input-pickup-date-offset` | integer | any signed int | col 5 "Pickup Date Offset" | TRACKED | plain int | 13:11:55 `0 → 1` → row 13:11:55 |
| P7 | Use Fulfillment | `local-office-settings-checkbox-use-fulfillment` | checkbox | {true, false} | col 7 "Use Fulfillment" | TRACKED | svg `lucide-check` | 13:13:02 `FALSE → TRUE` → row 13:13:02 |
| P8 | Use Availability | `local-office-settings-checkbox-use-availability` | checkbox | {true, false} | col 8 "Use Availability" | TRACKED | svg `lucide-check` | 13:14:22 `TRUE → FALSE` → row 13:14:22 (restore 13:21:14) |
| P9 | Print Description | `local-office-settings-checkbox-print-description` | checkbox | {true, false} | col 10 "Print Desc" | TRACKED | svg `lucide-check` | 13:23:32 `TRUE → FALSE` → row 13:23:32 |
| P10 | Use Subrent Service Type | `local-office-settings-checkbox-use-subrent-service-type` | checkbox | {true, false} | col 11 "Use Subrent" | TRACKED | svg `lucide-check` | 13:24:17 `TRUE → FALSE` → row 13:24:17 |
| P11 | Phone 1 | `local-office-settings-input-phone-1` | text | free-text phone | col 12 "Phone1" | TRACKED | plain text | 13:25:46 `"760-883-1957" → "760-883-1958"` → row 13:25:46 |
| P12 | Phone 2 | `local-office-settings-input-phone-2` | text | free-text phone (optional) | col 13 "Phone2" | TRACKED | plain text | 13:27:35 `"" → "555-1234"` → row 13:27:35 |
| P13 | Use Section | `local-office-settings-checkbox-use-section` | checkbox | {true, false} | col 14 "Use Sect." | TRACKED | svg `lucide-check` | 13:29:23 `TRUE → FALSE` → row 13:29:23 |
| P14 | Use On Quote (Logo) | `local-office-settings-checkbox-use-quote-logo` | checkbox | {true, false} | col 18 "Use On Quote" | TRACKED | svg `lucide-check` | 13:30:15 `TRUE → FALSE` → row 13:30:15 |
| P15 | Use On Rental (Logo) | `local-office-settings-checkbox-use-rental-logo` | checkbox | {true, false} | col 19 "Use On Rental" | TRACKED | svg `lucide-check` | 13:31:11 `TRUE → FALSE` → row 13:31:11 |

## Orphan columns (not mapped this session)

| Col index | Header | Suspected source | Follow-up |
|---|---|---|---|
| 0 | Local Office | Derived — office ID for the row (not a parent field). | KEEP as derived; no TC needed. |
| 9 | Use Equipment QC | Basic Info checkbox (likely testid `local-office-settings-checkbox-use-equipment-qc`) | SP-B-LO-1b |
| 15 | Section Name | Basic Info → Section sub-table (pipe-joined row summary) | SP-B-LO-1b (sub-table cataloging) |
| 16 | Sect. Action | Basic Info → Section sub-table record action column; this session confirmed it always reads "Update" across every save regardless of whether sections changed. | Flagged — see **Sub-table Action columns** note below. |
| 17 | Logo Name | Basic Info → Company Logo combobox (parent selection reflects here) | SP-B-LO-1b |
| 20 | Service Type - Exempt | Basic Info → Service Type Exemption sub-table (pipe-joined row summary) | SP-B-LO-1b (sub-table cataloging) |
| 21 | ST Action | Basic Info → Service Type Exemption sub-table record action column; always reads "Update" this session. | Flagged — see **Sub-table Action columns** note below. |
| 22 | Action | Basic Info top-level record action column; always reads "Update" this session. | Derived — not a parent-driven column. |
| 23 | Notes | Basic Info → Notes textarea | SP-B-LO-1b |
| 24 | Marriott PMS Account Enabled | Basic Info checkbox (likely testid `local-office-settings-checkbox-marriott-pms`) | SP-B-LO-1b |
| 25 | Default Job to 1 day for Event Orders | Basic Info checkbox — part of Default Job 1-day group | SP-B-LO-1b |
| 26 | Default Job to 1 day for Outside Orders | Basic Info checkbox — part of Default Job 1-day group | SP-B-LO-1b |
| 27 | Default Job to 1 day for Internal Orders | Basic Info checkbox — part of Default Job 1-day group | SP-B-LO-1b |
| 28 | Default Labor to Hourly | Basic Info checkbox | SP-B-LO-1b |
| 29 | Allow tentative and confirmed Status to have the same priority | Basic Info checkbox (testid likely `local-office-settings-checkbox-same-priority`) | SP-B-LO-1b |
| 30 | Items Filled from Requests Return to Availability | Basic Info checkbox | SP-B-LO-1b |
| 31 | Default Order Type | Basic Info combobox — baseline value "Event" | SP-B-LO-1b |
| 32 | Regular Hours | ECT tab (not Basic Info) — baseline 24 | SP-B-LO-2 (ECT tab) |
| 33 | Regular Hours Multiplier | ECT tab — baseline 1 | SP-B-LO-2 |
| 34 | Over Time Hours | ECT tab — baseline 24 | SP-B-LO-2 |
| 35 | OverTime Hours Multiplier | ECT tab — baseline 1.5 | SP-B-LO-2 |
| 36 | Double Time Hours | ECT tab — baseline 24 | SP-B-LO-2 |
| 37 | DoubleTime Hours Multiplier | ECT tab — baseline 2 | SP-B-LO-2 |
| 38 | Holiday Multiplier | ECT tab — baseline 0 | SP-B-LO-2 |
| 39 | Recalc Labor Hours | ECT tab checkbox — baseline FALSE | SP-B-LO-2 |
| 40 | Modified By | Derived — authenticated user email. | KEEP as derived; no TC needed. |
| 41 | Modified On | Derived — save timestamp. | KEEP as derived; no TC needed. |

## NOT-TRACKED registry (feeds SP-E-LO)

_None this session._ All 15 parents produced a visible column change that matched the parent's target column. No parent edit failed to register in the history table.

## Duplicate-header flag

_None._ All 42 column headers are unique in this reading (headers captured 2026-04-20 13:21).

## Boolean-encoding registry (per LR-036)

| Col index | Header | Encoding | Detection pattern |
|---|---|---|---|
| 7 | Use Fulfillment | svg | `td.innerHTML.includes('lucide-check')` |
| 8 | Use Availability | svg | `td.innerHTML.includes('lucide-check')` |
| 9 | Use Equipment QC | svg (inferred — same histogram as 7/8/10/11) | `td.innerHTML.includes('lucide-check')` |
| 10 | Print Desc | svg | `td.innerHTML.includes('lucide-check')` |
| 11 | Use Subrent | svg | `td.innerHTML.includes('lucide-check')` |
| 14 | Use Sect. | svg | `td.innerHTML.includes('lucide-check')` |
| 18 | Use On Quote | svg | `td.innerHTML.includes('lucide-check')` |
| 19 | Use On Rental | svg | `td.innerHTML.includes('lucide-check')` |
| 24 | Marriott PMS Account Enabled | svg (inferred) | `td.innerHTML.includes('lucide-check')` |
| 25 | Default Job to 1 day for Event Orders | svg (inferred) | `td.innerHTML.includes('lucide-check')` |
| 26 | Default Job to 1 day for Outside Orders | svg (inferred) | `td.innerHTML.includes('lucide-check')` |
| 27 | Default Job to 1 day for Internal Orders | svg (inferred) | `td.innerHTML.includes('lucide-check')` |
| 28 | Default Labor to Hourly | svg (inferred) | `td.innerHTML.includes('lucide-check')` |
| 29 | Allow tentative and confirmed Status to have the same priority | svg (inferred) | `td.innerHTML.includes('lucide-check')` |
| 30 | Items Filled from Requests Return to Availability | svg (inferred) | `td.innerHTML.includes('lucide-check')` |
| 39 | Recalc Labor Hours | svg (inferred) | `td.innerHTML.includes('lucide-check')` |

`assertBooleanCell` should use `encoding: 'svg'` for every Local Office Basic Info boolean column. Rows 9, 24–30, 39 are inferred (not directly verified this session) — SP-B-LO-1b / SP-B-LO-2 must confirm before those columns get per-column TCs.

## Sub-table Action columns (non-parent-driven)

Cols 16 "Sect. Action", 21 "ST Action", 22 "Action" always read literal string `"Update"` across every save in this session, regardless of whether sub-table content changed. Per-column TCs on these three columns must NOT treat `"Update"` as evidence of a change — the column is a type label, not a state signal. Confirmed at every save 12:59–13:31 on 2026-04-20.

## Deferred to SP-B-LO-1b (Basic Info residual)

Remaining Basic Info parents not cataloged this session (estimate ~7, out of plan's ≤15 cap):

- Use Equipment QC checkbox → col 9
- Marriott PMS Account checkbox → col 24
- Default Job to 1 day Event/Outside/Internal checkbox group → cols 25/26/27
- Default Labor to Hourly checkbox → col 28
- Same Priority checkbox → col 29
- Items Filled checkbox → col 30
- Default Order Type combobox → col 31
- Notes textarea → col 23
- Company Logo combobox → col 17 ("Logo Name")
- Section sub-table row operations → cols 15/16
- Service Type Exempt sub-table row operations → cols 20/21
- PO Number / PO Number Label / Room Config parents — not present on this 42-col history (possibly captured in a different history surface — SP-B-LO-1b to confirm via MCP)

ECT tab parents → cols 32–39 belong to SP-B-LO-2 per master plan scope split.

## Method notes / learnings fed back to master plan

1. **Native-typing pattern** required for Angular text inputs on Radix forms. DOM setter (`Object.getOwnPropertyDescriptor + dispatchEvent`) corrupts the Angular FormControl mid-session (P1/P2 worked, then P3 broke until page reload). Use `triple_click → type → Tab` via native click tool (matches [`fillAndTab`](../../src/pages/setup/local-office/local-office-settings.page.ts:215) pattern in the page object).
2. **Radix tab switches** do NOT fire from a plain `element.click()`. Use `find` → native left_click (Claude in Chrome), OR dispatch full pointerdown / mousedown / pointerup / mouseup / click sequence with pointerType:'mouse' and correct clientX/clientY. A plain `.click()` appears to succeed (no error) but leaves `data-state="inactive"` on the tab.
3. **History table lives only in the History tab panel** — `document.querySelector('table')` without panel scoping will return the Basic Info Section sub-table first. The driver's `readHistoryDiff2()` now scopes to `[data-testid="local-office-settings-tab-content-history"]` before querying `table`.
4. **History table may not refresh immediately after save+switch** — a tab cycle (Basic Info → History) sometimes needed a second cycle to see the new top row. Not a data problem, but timing-sensitive. Post-save: switch to Basic Info briefly then back to History to force refresh.
5. **Baseline-preserving cycle** (change → save → diff → restore → save) takes ~30s per parent. 15-parent cap is appropriate.
6. **No cascades observed**: Use Section FALSE did not change Section Name col 15 or Sect. Action col 16. Use On Quote / Use On Rental FALSE did not change Logo Name col 17. Every Basic Info parent edit produced exactly one parent column + Modified On + Modified By (Modified By same user all session, so shows as no-diff).

## Baseline row (post-session verify)

End-of-session top row (2026-04-20 13:31:30) byte-matches pre-session baseline across all 40 non-timestamp columns. Office 1604 is safe to hand off.

| Col | Baseline value |
|---|---|
| 0 Local Office | 1604 |
| 1 Prep Date Offset | -1 |
| 2 Return Date Offset | 1 |
| 3 Set Date Offset | -1 |
| 4 Strike Date Offset | 1 |
| 5 Pickup Date Offset | 0 |
| 6 Delivery Date Offset | 0 |
| 7 Use Fulfillment | FALSE |
| 8 Use Availability | TRUE |
| 9 Use Equipment QC | FALSE |
| 10 Print Desc | TRUE |
| 11 Use Subrent | TRUE |
| 12 Phone1 | 760-883-1957 |
| 13 Phone2 | *(empty)* |
| 14 Use Sect. | TRUE |
| 15 Section Name | Projection - true \| Audio - true \| Lighting - true \| Flipcharts - true \| Labor - true \| Video - true \| Scenic - true \| Hybrid Meeting - true \| Presenter Support - true |
| 16 Sect. Action | Update |
| 17 Logo Name | Encore New Logo |
| 18 Use On Quote | TRUE |
| 19 Use On Rental | TRUE |
| 20 Service Type - Exempt | HSIA - Labor - true \| HSIA - Subrental Equipment - true \| Loss Damage Waiver - true \| Operator Labor - true |
| 21 ST Action | Update |
| 22 Action | Update |
| 23 Notes | *(empty)* |
| 24 Marriott PMS Account Enabled | FALSE |
| 25 Default Job to 1 day for Event Orders | FALSE |
| 26 Default Job to 1 day for Outside Orders | FALSE |
| 27 Default Job to 1 day for Internal Orders | FALSE |
| 28 Default Labor to Hourly | FALSE |
| 29 Allow tentative and confirmed Status to have the same priority | FALSE |
| 30 Items Filled from Requests Return to Availability | FALSE |
| 31 Default Order Type | Event |
| 32 Regular Hours | 24 |
| 33 Regular Hours Multiplier | 1 |
| 34 Over Time Hours | 24 |
| 35 OverTime Hours Multiplier | 1.5 |
| 36 Double Time Hours | 24 |
| 37 DoubleTime Hours Multiplier | 2 |
| 38 Holiday Multiplier | 0 |
| 39 Recalc Labor Hours | FALSE |
| 40 Modified By | v-rutvik.khosariya@psav.com |

## Follow-on plans unblocked

- SP-B-LO-1b: residual Basic Info parents (Use Equipment QC, Marriott PMS, Default Job group, Same Priority, Items Filled, Default Order Type, Notes, Logo combobox, Section/ST sub-tables).
- SP-B-LO-2: ECT tab → cols 32–39.
- SP-B-LO-R: reconciliation across SP-B-LO-1, 1b, 2.
- SP-C1: Basic Info per-column TC implementation (can start on the 15 parents mapped here).
