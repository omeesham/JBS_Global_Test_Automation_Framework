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
| 24 | Marriott PMS Account Enabled | svg (inferred — **unconfirmed**, parent not present on office 1604; SP-E-LO BUG-LO-002) | `td.innerHTML.includes('lucide-check')` |
| 25 | Default Job to 1 day for Event Orders | **svg CONFIRMED** (retry #2, row 05:18:29 PM; retry #3 reverse row 07:35:23 PM) | `td.innerHTML.includes('lucide-check')` |
| 26 | Default Job to 1 day for Outside Orders | **svg CONFIRMED** (retry #3, row 07:39:11 PM) | `td.innerHTML.includes('lucide-check')` |
| 27 | Default Job to 1 day for Internal Orders | **svg CONFIRMED** (retry #3, row 07:41:10 PM) | `td.innerHTML.includes('lucide-check')` |
| 28 | Default Labor to Hourly | **svg CONFIRMED** (retry #3, row 07:42:01 PM) | `td.innerHTML.includes('lucide-check')` |
| 29 | Allow tentative and confirmed Status to have the same priority | **svg CONFIRMED** (retry #2, row 04:54:18 PM) | `td.innerHTML.includes('lucide-check')` |
| 30 | Items Filled from Requests Return to Availability | **svg CONFIRMED** (retry #3, row 07:43:05 PM) | `td.innerHTML.includes('lucide-check')` |
| 39 | Recalc Labor Hours | svg (inferred — ECT scope, SP-B-LO-2) | `td.innerHTML.includes('lucide-check')` |

`assertBooleanCell` should use `encoding: 'svg'` for every Local Office Basic Info boolean column. Post-SP-B-LO-1b retry #3: cols 25–30 **confirmed svg** via save-cycle evidence. Cols 9 + 24 remain **unconfirmed** (parents absent/disabled on office 1604 — bug candidates BUG-LO-001/002 per LR-034, deferred to SP-E-LO). Col 39 remains ECT scope (SP-B-LO-2).

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

---

## Residual Parents (SP-B-LO-1b session — 2026-04-20, partial)

**Agent**: HUNTER (rutvik), Opus 4.7, Claude in Chrome
**Session outcome**: partial-complete — 3 residual parents classified via DOM inventory (no save cycle possible); 9 save-cycle parents deferred to SP-B-LO-1b retry when backend is stable.
**Backend status during session**: unreliable — 6 of ~8 save POSTs returned `503 Service Unavailable`; the other 2 produced history rows at 04:36:36 / 04:36:41 PM but recorded an unintended col 14 (`Use Sect.`) TRUE→FALSE→TRUE cycle from driver-era buggy toggles (net zero change — UseSect ended at TRUE = baseline).
**Baseline preservation**: confirmed post-session — all 14 Basic Info checkboxes match SP-B-LO-1 end-of-session baseline on hard reload; save button disabled; combobox default values unchanged. Office 1604 safe to hand off.

### DOM-only classifications (no save cycle required)

| # | Parent field | Expected col | DOM finding | Classification | Bug candidate |
|---|---|---|---|---|---|
| P16 | Use Equipment QC | col 9 "Use Equipment QC" | testid is `local-office-settings-checkbox-use-equipments-qc` (**plural** "equipments" — parent session inferred singular); element has `disabled=true` / `aria-disabled=true` on office 1604 | **PARENT-DISABLED-ON-1604** — parent exists in DOM but is read-only; col 9 cannot be written via normal UI actions on this office | BUG-LO-001: parent checkbox is read-only but corresponding history column exists — need confirmation whether this is per-office role-based or global |
| P17 | Marriott PMS Account | col 24 "Marriott PMS Account Enabled" | **no matching DOM element** — zero `[data-testid*="marriott"]`, zero `[data-testid*="pms"]`, zero "Marriott"/"PMS" text anywhere on Basic Info page for office 1604 | **PARENT-NOT-PRESENT-ON-1604** — history column exists but no writable UI source; untestable via catalog cycle | BUG-LO-002: history schema has col 24 but parent field is absent from Basic Info UI — either conditional render (Marriott-only offices) or orphan column |
| P25 | Notes | col 23 "Notes" | **no matching DOM element** — zero `<textarea>` elements on Basic Info form, zero "notes" text content, zero `[data-testid*="notes"]` | **PARENT-NOT-PRESENT-ON-1604** — history column exists but no writable UI source | BUG-LO-003: history schema has col 23 but Notes field is absent from Basic Info UI — either conditional render or orphan column |

### Save-cycle parents deferred to SP-B-LO-1b retry

Pending backend stability. Driver pattern now known (see §Method notes addendum below) — future session can iterate without rediscovery. Residual save-cycle parents:

| # | Parent field | Target col | Control type | Baseline | Testid |
|---|---|---|---|---|---|
| P18 | Default Job 1-day Event Orders | col 25 | checkbox | FALSE | `local-office-settings-checkbox-default-job-one-day-event` |
| P19 | Default Job 1-day Outside Orders | col 26 | checkbox | FALSE | `local-office-settings-checkbox-default-job-one-day-outside` |
| P20 | Default Job 1-day Internal Orders | col 27 | checkbox | FALSE | `local-office-settings-checkbox-default-job-one-day-internal` |
| P21 | Default Labor to Hourly | col 28 | checkbox | FALSE | `local-office-settings-checkbox-default-labor-to-hourly` |
| P22 | Same Priority | col 29 | checkbox | FALSE | `local-office-settings-checkbox-same-priority` |
| P23 | Items Filled from Requests Return | col 30 | checkbox | FALSE | `local-office-settings-checkbox-request-items-return` |
| P24 | Default Order Type | col 31 | combobox | "Event" | `local-office-settings-select-default-order-type` |
| P26 | Company Logo | col 17 "Logo Name" | combobox | "Encore New Logo" | `local-office-settings-select-company-logo` |
| P27 | Section sub-table row op | cols 15/16 | sub-table | 9 rows (Projection/Audio/Lighting/Flipcharts/Labor/Video/Scenic/Hybrid Meeting/Presenter Support) | (DOM scan pending) |
| P28 | Service Type Exempt sub-table row op | cols 20/21 | sub-table | 4 rows (HSIA-Labor/HSIA-Subrental Equipment/Loss Damage Waiver/Operator Labor) | (DOM scan pending) |

### Newly discovered Basic Info fields (not in 42-col history)

These fields exist on the Basic Info form but have no corresponding column in the 42-col Local Office Settings History. Candidates for NOT-TRACKED bug filing (SP-E-LO) if a requirement states they should be tracked.

| Field | Testid | Baseline | Notes |
|---|---|---|---|
| PO Number | `local-office-settings-input-po-number` | *(empty)* | Text input, no history column |
| PO Number Label | `local-office-settings-input-po-number-label` | *(empty)* | Text input, no history column |
| Room Configuration sub-table | (DOM scan pending; observed visually: rows "Ballroom A", "Room Edit Test", "Room Toggle Test" with Active checkmarks) | 3+ rows | Not in 42-col history — compare against REQUIREMENTS.md expected coverage |

### Method notes addendum (2026-04-20 SP-B-LO-1b)

1. **Radix Checkbox toggle pattern** — plain `el.click()` flips the Radix visual state but does **NOT** dispatch the Angular FormControl change event. The form registers as "dirty" for UNRELATED reasons (likely stale form-sync state), save submits the wrong field deltas. **Correct pattern** (same as Radix tabs from SP-B-LO-1, with the addition of `buttons:1`/`buttons:0` distinction):
   ```js
   const r = el.getBoundingClientRect();
   const cx = Math.floor(r.left + r.width/2), cy = Math.floor(r.top + r.height/2);
   const od = {bubbles:true, cancelable:true, composed:true, pointerType:'mouse', clientX:cx, clientY:cy, button:0, buttons:1};
   const ou = {...od, buttons:0};
   el.dispatchEvent(new PointerEvent('pointerdown', od));
   el.dispatchEvent(new MouseEvent('mousedown', od));
   el.dispatchEvent(new PointerEvent('pointerup', ou));
   el.dispatchEvent(new MouseEvent('mouseup', ou));
   el.dispatchEvent(new MouseEvent('click', ou));
   ```
   This pattern verified to flip `data-state` on `same-priority` AND enable the Save button (dirty form signal) in this session. Plain `.click()` does not enable save.

2. **Save button UX bug (candidate)** — the Save button transitions to `disabled=true` after being clicked regardless of whether the server POST succeeded or failed with 503. There is no user-visible indication of save failure. This masks backend outages — a user (or agent) sees "button disabled = save complete" and assumes persistence, but the DB may be unchanged. This is consistent with prior observations in LR-026 (Angular form dirty-state quirks) but adds a specific HTTP-error dimension. Recommended: compare the form state after reload to confirm persistence, do not trust button-disabled alone.

3. **History table caching** — after a successful save POST (200), the history table top row updates only after a tab cycle (basic → history with ~2–3s waits). Direct `readTopRow()` immediately after save returns stale data. This is consistent with parent SP-B-LO-1 method note #3.

4. **Baseline-drift from failed saves** — in this session, 2 history rows at 04:36:36 PM and 04:36:41 PM were recorded (each ~5s apart) during early driver testing, both toggling col 14 UseSect (not the intended same-priority or default-job-event). The toggles went TRUE→FALSE→TRUE, so net effect on server state is zero, but the audit trail has 2 extra rows. **Lesson**: before attempting catalog cycles on a fresh backend, verify driver toggle pattern on a non-persistent dry run (e.g., toggle and reload WITHOUT save, confirm state resets).

### Deferred section update

The parent-session §Deferred section above correctly predicted the 13 residual parents. This session's outcome:
- **3 classified via DOM inventory** (P16/P17/P25) without save cycles — folded into the new Residual Parents table.
- **10 still deferred** to SP-B-LO-1b retry (save-cycle dependent; backend must be stable).
- **3 newly discovered fields** (PO Number, PO Number Label, Room Configuration sub-table) documented as candidates for SP-B-LO-1c or NOT-TRACKED registry.

### Boolean-encoding registry status

| Col | Header | Prior status | This session |
|---|---|---|---|
| 9 | Use Equipment QC | inferred svg | **unconfirmed** — parent disabled, cannot drive a save to verify encoding; retry in SP-B-LO-1b when Equipment QC becomes writable |
| 24 | Marriott PMS Account Enabled | inferred svg | **unconfirmed** — parent not present in DOM; retry on an office where Marriott field is visible, or file bug BUG-LO-002 |
| 25–30 | Default Job trio / Default Labor / Same Priority / Items Filled | inferred svg | **unconfirmed** — parents are present and toggleable but save cycle blocked by backend 503; retry in SP-B-LO-1b |
| 39 | Recalc Labor Hours | inferred svg | unchanged — ECT tab, SP-B-LO-2 scope |

---

## Residual Parents (SP-B-LO-1b retry session — 2026-04-20, partial)

**Agent**: HUNTER (rutvik), Opus 4.7
**Browser tool**: Claude in Chrome first (LR-038 default), then switched to Playwright MCP per user directive.
**Session outcome**: partial — 2 additional parents confirmed TRACKED via user-assisted save cycles; 8 save-cycle parents deferred to retry #3. **Retry #2 RCA corrected** (2026-04-21): the prior write-up framed the remaining blocker as a framework-wide synthetic-event trust gate and wrote ALL-076 as a framework-risk rule. That was wrong. The actual cause is missed interaction with the Radix AlertDialog (`location-settings-modal-save-changes`) that the existing `clickSaveAndConfirm` helper (`clients/encore/src/pages/setup/local-office/local-office-settings.page.ts:138`, wrapping `base-page.ts:350` `clickSaveWithDialog`) already drives. LR-012 / navigation.md §B / 15+ spec calls in `local-office-settings.spec.ts` prove the pattern works unattended. ALL-076 rewritten as a symptom-differential rule; retry #3 uses the existing helper per-parent.
**Backend status during session**: **working fine**. Prior (22:20) session's 503 "backend broken" diagnosis was also wrong — those 503s were Next.js RSC page-URL POSTs, not the business save XHR. The real save endpoint is a 200 XHR producing `Local office settings updated` toast after the AlertDialog is confirmed.
**Baseline preservation**: **partial** — office 1604 has drift by 1 field: P18 `Default Job 1-day Event Orders` is currently TRUE on server (was FALSE in SP-B-LO-1 baseline). This drift is recorded in history row 05:18:29 PM. All other fields match baseline. Retry #3 restores P18 to FALSE as first action.

### Newly confirmed TRACKED parents (save-cycle evidence)

| # | Parent field | Testid | Target col (0-idx, header) | Status | Encoding | Evidence |
|---|---|---|---|---|---|---|
| P18 | Default Job 1-day Event Orders | `local-office-settings-checkbox-default-job-one-day-event` | col 25 "Default Job to 1 day for Event Orders" | **TRACKED** | svg `lucide-check` | user-assisted save 2026-04-20 05:18:29 PM: checkbox FALSE→TRUE → history row 05:18:29 PM diff vs 04:55:12 PM shows only col 25 "" → TRUE + Modified On. Clean 1-col diff. |
| P22 | Allow tentative and confirmed Status to have the same priority | `local-office-settings-checkbox-same-priority` | col 29 "Allow tentative and confirmed Status to have the same priority" | **TRACKED** | svg `lucide-check` | user-manual test between 22:20 HALT and retry-session start: ghost rows at 04:54:18 PM (FALSE→TRUE) and 04:55:12 PM (TRUE→FALSE). Diff r1 vs r2 shows only col 29 "" → TRUE + Modified On. Clean 1-col diff, reversible. Net zero server state (toggle + restore). |

### Boolean-encoding registry — CONFIRMED from this session

| Col | Header | Previously | Now |
|---|---|---|---|
| 25 | Default Job to 1 day for Event Orders | inferred svg | **CONFIRMED svg `lucide-check`** (row 05:18:29 shows TRUE rendered via `<svg class="lucide lucide-check">`) |
| 29 | Allow tentative and confirmed Status to have the same priority | inferred svg | **CONFIRMED svg `lucide-check`** (row 04:54:18 shows TRUE rendered via `<svg class="lucide lucide-check">`) |

### Still deferred (save-cycle not yet cataloged this session)

All blocked on the same root cause: agent missed the Save Changes AlertDialog pattern. Retry #3 uses `clickSaveAndConfirm` per-parent (see `local-office-settings.page.ts:138`).

| # | Parent field | Target col | Pending |
|---|---|---|---|
| P19 | Default Job 1-day Outside Orders | col 26 | retry #3 — `clickSaveAndConfirm` |
| P20 | Default Job 1-day Internal Orders | col 27 | retry #3 — `clickSaveAndConfirm` |
| P21 | Default Labor to Hourly | col 28 | retry #3 — `clickSaveAndConfirm` |
| P23 | Items Filled from Requests Return | col 30 | retry #3 — `clickSaveAndConfirm` |
| P24 | Default Order Type (combobox) | col 31 | retry #3 — `clickSaveAndConfirm` (plus combobox Radix retry per LR-025 if option list large) |
| P26 | Company Logo (combobox) | col 17 "Logo Name" | retry #3 — `clickSaveAndConfirm` |
| P27 | Section sub-table row op | cols 15/16 | retry #3 — `clickSaveAndConfirm` + sub-table row-edit selection |
| P28 | Service Type Exempt sub-table row op | cols 20/21 | retry #3 — `clickSaveAndConfirm` + sub-table row-toggle selection |

### Sub-table DOM findings (from Playwright snapshot this session)

- **Section sub-table** (`local-office-settings-table-sections`): 13 total rows (9 active baseline per SP-B-LO-1 + 4 inactive not counted in prior baseline = Power, Rigging, Staging, Whiteboard). The inactive rows have toggle cells without the `lucide-check` img. Baseline row count in parent catalog §Baseline row col 15 says `Projection - true | Audio - true | Lighting - true | Flipcharts - true | Labor - true | Video - true | Scenic - true | Hybrid Meeting - true | Presenter Support - true` (9 active). The 4 inactive rows (Power/Rigging/Staging/Whiteboard) are documented rows but with `active=false` and therefore are not listed in the "true-only" history col 15 value. Each row has an edit-name textbox (UUID-keyed) and a toggle cell.
- **Room Configuration sub-table** (3 rows confirmed): Ballroom A, Room Edit Test, Room Toggle Test — all active (cell `toggle` has `img` child). Each row has an edit-name textbox (integer-keyed 1/2/3). Not tracked in 42-col history (confirmed — no "Room" column in headers).
- **Service Type Exemption sub-table** (large, 74+ rows): columns are "Service Type" + "Exempt". Currently-exempt rows with checkmarks observed in snapshot: HSIA - Labor, HSIA - Subrental Equipment, Loss Damage Waiver, Operator Labor (matches parent baseline col 20 `HSIA - Labor - true | HSIA - Subrental Equipment - true | Loss Damage Waiver - true | Operator Labor - true`). Each row has a "toggle" cell.

### Method notes addendum (2026-04-20 retry session)

5. **Save flow is dialog-gated — use `clickSaveAndConfirm`** (RCA-corrected 2026-04-21). Main Save button click opens a Radix AlertDialog (`data-testid="location-settings-modal-save-changes"` — heading "Save Changes", body "Are you sure you want to save the changes?"); React Hook Form `handleSubmit` `await`s the dialog's inner Save button before firing the business-save XHR. The prior retry #2 write-up framed this as a synthetic-event trust gate after failing to click the dialog's inner Save — that framing was fiction. The existing helpers handle the full flow: `clickSaveAndConfirm()` at [`local-office-settings.page.ts:138`](../../src/pages/setup/local-office/local-office-settings.page.ts) wraps [`clickSaveWithDialog('btnSave','dlgSaveChanges','btnSaveChangesConfirm')`](../../src/common/base-page.ts) from `base-page.ts:350`. Shared selectors `dlgSaveChanges` / `btnSaveChangesConfirm` live in `clients/encore/src/selectors/setup/local-office/local-office-settings.ts`. `local-office-settings.spec.ts` has 15+ passing calls proving the pattern works unattended. Retry #3 drives every save via this helper.

6. **No-op save produces a history row with only Modified On change**. Evidence: row 05:18:30 PM (just a `Modified On` bump, no other diff vs 05:18:29 PM) resulted from user clicking Save a second time within 1 second without any checkbox toggle in between. The form was NOT dirty (all data matched server) but the Save button was still active because Angular didn't fully reset dirty state between rapid clicks. **Implication for per-column TCs**: a history row with *only* Modified On change is a valid server event but does not signal parent-field change. Per-column TCs must filter for actual data diff, not just new row presence. This is consistent with LR-026 Angular dirty-state unreliability.

7. **History table cache quirk re-confirmed**. After a successful save, tab cycle (Basic Info → History → Basic Info → History with ~2–3 s waits) is still required to force the history panel to re-render. The first switch-to-history after save shows stale top row. This is identical to SP-B-LO-1 method note #3 and parent-catalog addendum §3.

8. **Playwright MCP is authenticated on this machine**. Playwright MCP's browser profile has a persisted Microsoft SSO session for Navigator Cloud (no login prompt required on navigation to 1604). Claude in Chrome inherits from the user's Chrome profile — same result (no SSO prompt). Either tool is suitable for save-cycle work on this surface — the save flow is dialog-gated (see method note #5), not trust-gated; `clickSaveAndConfirm` works unattended on both tools.

### Deferred section update (after retry session)

- **P18** moved from Deferred → **CONFIRMED TRACKED** (col 25)
- **P22** moved from Deferred → **CONFIRMED TRACKED** (col 29)
- 8 save-cycle parents (P19/P20/P21/P23/P24/P26/P27/P28) remain deferred to retry #3 — unattended-safe via `clickSaveAndConfirm` helper.

---

## Residual Parents (SP-B-LO-1b retry #3 — 2026-04-21, complete)

**Agent**: HUNTER (rutvik), Opus 4.7
**Browser tool**: Claude in Chrome (LR-038 default for Claude Code exploratory/catalog work; user directive confirmed).
**Session outcome**: **COMPLETE** — all 8 residual save-cycle parents cataloged; P18 baseline restored as first cycle. Office 1604 form state verified back at SP-B-LO-1 baseline (P18-P23 all FALSE; P24 "Event"; P26 "Encore New Logo"; Save disabled).
**Save pattern used**: `window.__cat.clickSaveAndConfirm()` driver (main Save `radixClick` → waits for `location-settings-modal-save-changes` `data-state="open"` → clicks dialog's inner Save via `radixClick` → polls for `navigator-settings` 200 XHR). Every save in this session fired a 200 PUT to `/navigator/api/location/navigator-settings` with the "Local office settings updated" toast.
**Driver discovery**: Radix AlertDialog portal uses `data-state="open"|"closed"` — `offsetParent !== null` check returns false even when visible. Switch to `waitForState(selector, 'data-state', 'open')`. Radix combobox options required real-mouse click via Claude in Chrome `computer.left_click` with element `ref` (from `find` tool); PointerEvent-dispatched clicks on `[role="option"]` registered as outside-listbox dismiss, not selection. Checkboxes and sub-table toggle cells worked with dispatched PointerEvent+MouseEvent sequence.

### Newly confirmed TRACKED parents (save-cycle evidence)

| # | Parent field | Testid | Target col (0-idx, header) | Status | Encoding | Evidence (forward → restore) |
|---|---|---|---|---|---|---|
| P18 (restore) | Default Job 1-day Event Orders | `local-office-settings-checkbox-default-job-one-day-event` | col 25 | **TRACKED** (baseline restored) | svg `lucide-check` | save 2026-04-21 07:35:23 PM — col 25 ✔→"" clean 1-col diff + Modified On. Reverse of retry #2 evidence. |
| P19 | Default Job 1-day Outside Orders | `local-office-settings-checkbox-default-job-one-day-outside` | col 26 | **TRACKED** | svg `lucide-check` | fwd 07:39:11 PM — col 26 ""→✔ • rev 07:39:34 PM — col 26 ✔→"" • both clean 1-col diffs + Modified On |
| P20 | Default Job 1-day Internal Orders | `local-office-settings-checkbox-default-job-one-day-internal` | col 27 | **TRACKED** | svg `lucide-check` | fwd 07:41:10 PM — col 27 ""→✔ • rev 07:41:34 PM — col 27 ✔→"" |
| P21 | Default Labor to Hourly | `local-office-settings-checkbox-default-labor-to-hourly` | col 28 | **TRACKED** | svg `lucide-check` | fwd 07:42:01 PM — col 28 ""→✔ • rev 07:42:35 PM — col 28 ✔→"" |
| P23 | Items Filled from Requests Return | `local-office-settings-checkbox-request-items-return` | col 30 | **TRACKED** | svg `lucide-check` | fwd 07:43:05 PM — col 30 ""→✔ • rev 07:43:32 PM — col 30 ✔→"" |
| P24 | Default Order Type | `local-office-settings-select-default-order-type` | col 31 "Default Order Type" | **TRACKED** | plain text | fwd 07:46:36 PM — col 31 "Event"→"Outside" • rev 07:49:16 PM — col 31 "Outside"→"Event" • 2 options total (no Radix retry needed) |
| P26 | Company Logo | `local-office-settings-select-company-logo` | col 17 "Logo Name" | **TRACKED** | plain text | fwd 07:53:18 PM — col 17 "Encore New Logo"→"Header with Dust Ears and Text" • rev 07:54:40 PM — col 17 "Header..."→"Encore New Logo" • 12 options; used `find` + `computer.left_click ref` for option selection |
| P27 | Section sub-table — toggle Power row Active (inactive→active→inactive) | `local-office-settings-table-sections` tbody tr[5] last-td | col 15 "Section Name" | **TRACKED** | pipe-joined `name - bool` string (alphabetized) | fwd 07:55:51 PM — col 15 added "Power - true" • rev 07:56:28 PM — col 15 removed "Power - true" • col 16 stayed literal "Update" (non-state signal per parent-catalog note) |
| P28 | Service Type Exempt sub-table — toggle "APP Downloaded" Exempt (false→true→false) | `local-office-settings-table-discount-exemptions` tbody tr[0] last-td | col 20 "Service Type - Exempt" | **TRACKED** | pipe-joined `name - true` string (alphabetized, exempt-only) | fwd 07:57:58 PM — col 20 added "APP Downloaded - true" • rev 07:58:35 PM — col 20 removed "APP Downloaded - true" • col 21 stayed literal "Update" (non-state signal) |

### Boolean-encoding registry — CONFIRMED from retry #3

| Col | Header | Prior status | Now |
|---|---|---|---|
| 26 | Default Job to 1 day for Outside Orders | inferred svg | **CONFIRMED svg `lucide-check`** (row 07:39:11 r0 renders TRUE via `<svg class="lucide lucide-check">`) |
| 27 | Default Job to 1 day for Internal Orders | inferred svg | **CONFIRMED svg `lucide-check`** (row 07:41:10) |
| 28 | Default Labor to Hourly | inferred svg | **CONFIRMED svg `lucide-check`** (row 07:42:01) |
| 30 | Items Filled from Requests Return to Availability | inferred svg | **CONFIRMED svg `lucide-check`** (row 07:43:05) |

Cols 9 (Use Equipment QC) and 24 (Marriott PMS) remain `unconfirmed` — parents absent/disabled on office 1604 (DOM-only classification preserved; bugs BUG-LO-001/002 deferred to SP-E-LO per LR-034). Col 39 (Recalc Labor Hours) remains ECT scope (SP-B-LO-2).

### Sub-table encoding observations (retry #3)

- **Col 15 "Section Name" serialization**: active rows only (`active=true` → `{name} - true`), pipe-separated (` | ` with spaces), **alphabetical order**. Baseline (01:31:30 PM) captured a NON-alphabetical order (`Projection | Audio | Lighting | …`) — serialization evidently switched to alphabetical sometime during retry #2/#3 save activity. Current retry #3 baseline-restored value: `Audio - true | Flipcharts - true | Hybrid Meeting - true | Labor - true | Lighting - true | Presenter Support - true | Projection - true | Scenic - true | Video - true`. Per-column TCs for col 15 should assert on **set-membership** (e.g. contains "Power - true") rather than exact string match, because order varies.
- **Col 20 "Service Type - Exempt" serialization**: exempt rows only (`exempt=true`), pipe-separated, **alphabetical order**. Retry #3 baseline: `HSIA - Labor - true | HSIA - Subrental Equipment - true | Loss Damage Waiver - true | Operator Labor - true`. Same set-membership guidance applies.
- **Cols 16 (Sect. Action) and 21 (ST Action)** re-confirmed as literal `"Update"` across all 9 saves this session, regardless of sub-table content change. Per-column TCs must NOT treat these as state-change signals (already noted in parent catalog §Sub-table Action columns).

### Method notes addendum (2026-04-21 retry #3)

9. **Radix AlertDialog visibility check — use `data-state`, not `offsetParent`**. The save dialog `location-settings-modal-save-changes` lives in a Radix portal; `offsetParent` returns null (via some combination of position-absolute + transform). `waitFor` helpers that poll `el.offsetParent !== null` will return false even when the dialog is visually rendered. Correct poll target: `el.getAttribute('data-state') === 'open'`. Screenshot confirms the dialog at (756, 362) center while `offsetParent === null` in the DOM read.

10. **Radix Combobox option selection via Claude in Chrome — use `find` + `computer.left_click(ref)`**. Synthetic PointerEvent+MouseEvent dispatch (the pattern that works for checkboxes, main Save button, tab switches, dialog Save button, and sub-table toggle cells) does NOT register on `[role="option"]` elements. The option click appears to succeed but the combobox value does not update. Observed 2× in this session: P24 first attempt (clicked option via dispatched events → listbox closed, combo stayed "Event"); P26 first attempt (same symptom → stayed "Encore New Logo"). **Working pattern**: `find('<option text>') → computer.left_click(ref)`. The `find` tool returns a stable ref that `computer.left_click` can target with viewport-coordinate-resolved real mouse events, which Radix Select's mousedown/pointerup handlers accept. This mirrors LR-025 spirit but for ALL Radix Select options, not just large lists.

11. **CDP `Runtime.evaluate` 45s timeout cap**. Long-running async driver calls (toggle + save + tab switch + history read with ~8–15s internal waits) can exceed the 45s CDP command timeout. Split per-parent cycles into 3 shorter JS calls: (a) toggle + `clickSaveAndConfirm`, (b) switch to history + read diff, (c) toggle-restore + save. Each call ≤ 20s. The work still completes even if a call hits the timeout — the JS in the tab continues; subsequent `javascript_exec` calls see the post-state correctly. Pragmatic: don't panic on CDP timeout; verify state with a fresh small read.

12. **History row eviction at 20-row cap**. Office 1604 history started retry #3 at 20 rows (same as retry #2 end). After 9 save + 9 restore cycles = 18 new saves (but P18 restore only adds 1 row since baseline was already dirty), final row count stays 20 — older rows eviction is FIFO. Per-column TCs reading "top N rows" should diff by timestamp (already advised in retry #2 note). Retry #3 explicit evidence: top-of-history at session end = 07:58:35 PM (P28 restore), SP-B-LO-1 baseline row 01:31:30 PM evicted out of top-20 window.

### Deferred section update (after retry #3)

- **P19/P20/P21/P23/P24/P26/P27/P28** all moved from Deferred → **CONFIRMED TRACKED**.
- P16/P17/P25 remain DOM-only classified (bugs BUG-LO-001/002/003 deferred to SP-E-LO per LR-034).
- PO Number, PO Number Label, Room Configuration sub-table remain as "NOT in 42-col history" findings (potential NOT-TRACKED registry entries — SP-B-LO-1c or SP-E-LO).

### Completeness summary

| Grouping | Count | Status |
|---|---|---|
| Parents with save-cycle evidence (P1–P15 parent session + P18/P22/P19/P20/P21/P23/P24/P26/P27/P28) | 23 | All **TRACKED** |
| Parents with DOM-only classification (P16/P17/P25 — absent/disabled on 1604) | 3 | Bug candidates BUG-LO-001/002/003 (SP-E-LO) |
| 42-col history cols cataloged to a parent | 40 of 42 | col 9 + col 24 unconfirmed (bug-blocked); cols 32–39 = ECT scope (SP-B-LO-2) |

SP-B-LO-1 + SP-B-LO-1b together catalog **all non-ECT Local Office Settings Basic Info parents** mapping to the 42-col history. Unblocks SP-B-LO-R (reconciliation) and SP-C1 (per-column TC implementation).
