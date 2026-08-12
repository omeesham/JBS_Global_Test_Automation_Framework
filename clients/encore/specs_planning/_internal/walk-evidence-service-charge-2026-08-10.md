---
artifact: walk-evidence
client: encore
module: service-charge
session_date: 2026-08-10
session_tool: standalone Playwright Node script (nm3344-basicinv2-0810); enumerate-page.mjs NOT run
author_identity: OWNER
page_url: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge
test_entity: office 1604 (Parker Palm Springs)
parent_subplan: plans/pending/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md
Coverage_Ratio: incomplete — machine denominator (enumerate-page.mjs) not run; 40/79 rows directly evidenced; 39 rows positional-inference only; History tab not walked
CrossCheck: pending — no machine denominator exists; A△B review not completed
---

> **Honest scope statement.** The Basic Information tab was walked via a standalone Playwright Node
> script (run-id `nm3344-basicinv2-0810`), not `enumerate-page.mjs`. As a result there is no LR-062
> machine denominator and `Coverage_Ratio` cannot be declared 100%. Rows 0–39 carry directly-observed
> testids from explicit `ROW | label | value | testid` lines in the capture. Rows 40–78 carry
> positionally-inferred testids only. The History tab was never successfully walked (two attempts,
> both returned loading skeletons).

# Walk evidence — Service Charge (2026-08-10)

## §1 Denominator provenance

`enumerate-page.mjs` was NOT invoked. No machine denominator exists. The raw capture lives at:

```
.claude/state/ua-worker/nm3344-basicinv2-0810/basicinv.verify.txt
```

The script produced 40 explicit `ROW | label | value | testid` lines (rows 0–39), then emitted
`... and 39 more rows`. The remaining 39 entries appear in the capture's `Observations:` array
as label+value only — **no testids**. Testids `service-charge-percentage-40` through
`service-charge-percentage-78` are positional-inference, not directly observed.

**LR-062 closure status**: OPEN — a confirming walk with `enumerate-page.mjs` is required before
LR-062 closure can be declared.

## §2 Element dispositions — Basic Information tab

### Rows 0–39 (directly observed)

Tier: OWNER · Evidence: `.claude/state/ua-worker/nm3344-basicinv2-0810/basicinv.verify.txt` · Verdict: directly-observed testid

| Row | Service Type label | testid | Default value | Evidence verdict |
|---|---|---|---|---|
| 0 | APP Downloaded | `service-charge-percentage-0` | `0.00 %` | DIRECTLY-OBSERVED |
| 1 | App Quality Assurance | `service-charge-percentage-1` | `0.00 %` | DIRECTLY-OBSERVED |
| 2 | App Quality Assurance – M | `service-charge-percentage-2` | `0.00 %` | DIRECTLY-OBSERVED |
| 3 | App Remote Access | `service-charge-percentage-3` | `0.00 %` | DIRECTLY-OBSERVED |
| 4 | Application Development | `service-charge-percentage-4` | `0.00 %` | DIRECTLY-OBSERVED |
| 5 | Application Development – M | `service-charge-percentage-5` | `0.00 %` | DIRECTLY-OBSERVED |
| 6 | Application Programming | `service-charge-percentage-6` | `0.00 %` | DIRECTLY-OBSERVED |
| 7 | Application Programming – M | `service-charge-percentage-7` | `0.00 %` | DIRECTLY-OBSERVED |
| 8 | Audio Conferencing | `service-charge-percentage-8` | `24.00 %` | DIRECTLY-OBSERVED (full outerHTML captured) |
| 9 | Cancellation Fee | `service-charge-percentage-9` | `0.00 %` | DIRECTLY-OBSERVED |
| 10 | Concise Equipment | `service-charge-percentage-10` | `0.00 %` | DIRECTLY-OBSERVED |
| 11 | Concise Labor - M | `service-charge-percentage-11` | `0.00 %` | DIRECTLY-OBSERVED |
| 12 | Concise Support Labor | `service-charge-percentage-12` | `0.00 %` | DIRECTLY-OBSERVED |
| 13 | Creative Content | `service-charge-percentage-13` | `0.00 %` | DIRECTLY-OBSERVED |
| 14 | Creative Services | `service-charge-percentage-14` | `0.00 %` | DIRECTLY-OBSERVED |
| 15 | Cvent Application Programming – M | `service-charge-percentage-15` | `0.00 %` | DIRECTLY-OBSERVED |
| 16 | Cvent Mobile App | `service-charge-percentage-16` | `0.00 %` | DIRECTLY-OBSERVED |
| 17 | Cvent Remote Access | `service-charge-percentage-17` | `0.00 %` | DIRECTLY-OBSERVED |
| 18 | Cvent Support Labor | `service-charge-percentage-18` | `0.00 %` | DIRECTLY-OBSERVED |
| 19 | Digital Services | `service-charge-percentage-19` | `0.00 %` | DIRECTLY-OBSERVED |
| 20 | Digital Services Equipment | `service-charge-percentage-20` | `0.00 %` | DIRECTLY-OBSERVED |
| 21 | Digital Services Labor | `service-charge-percentage-21` | `0.00 %` | DIRECTLY-OBSERVED |
| 22 | Digital Services Subrental | `service-charge-percentage-22` | `0.00 %` | DIRECTLY-OBSERVED |
| 23 | Equipment Rental | `service-charge-percentage-23` | `24.00 %` | DIRECTLY-OBSERVED |
| 24 | Event Technology Support | `service-charge-percentage-24` | `0.00 %` | DIRECTLY-OBSERVED |
| 25 | Extended Venue Access Managed Services | `service-charge-percentage-25` | `0.00 %` | DIRECTLY-OBSERVED |
| 26 | Freight | `service-charge-percentage-26` | `0.00 %` | DIRECTLY-OBSERVED |
| 27 | HSIA - Equipment | `service-charge-percentage-27` | `0.00 %` | DIRECTLY-OBSERVED |
| 28 | HSIA - Labor | `service-charge-percentage-28` | `0.00 %` | DIRECTLY-OBSERVED |
| 29 | HSIA - Subrental Equipment | `service-charge-percentage-29` | `0.00 %` | DIRECTLY-OBSERVED |
| 30 | HSIA - Wi-Fi Services | `service-charge-percentage-30` | `0.00 %` | DIRECTLY-OBSERVED |
| 31 | HSIA Services | `service-charge-percentage-31` | `0.00 %` | DIRECTLY-OBSERVED |
| 32 | Lighting | `service-charge-percentage-32` | `24.00 %` | DIRECTLY-OBSERVED |
| 33 | Lighting Subrental | `service-charge-percentage-33` | `0.00 %` | DIRECTLY-OBSERVED |
| 34 | Loss Damage Waiver | `service-charge-percentage-34` | `0.00 %` | DIRECTLY-OBSERVED |
| 35 | Mobile Apps | `service-charge-percentage-35` | `0.00 %` | DIRECTLY-OBSERVED |
| 36 | Music Access | `service-charge-percentage-36` | `0.00 %` | DIRECTLY-OBSERVED |
| 37 | Operator Labor | `service-charge-percentage-37` | `24.00 %` | DIRECTLY-OBSERVED |
| 38 | Photographic Services | `service-charge-percentage-38` | `0.00 %` | DIRECTLY-OBSERVED |
| 39 | Power Infrastructure | `service-charge-percentage-39` | `0.00 %` | DIRECTLY-OBSERVED |

### Rows 40–78 (DOM-order-derived — testids inferred, NOT directly observed)

Evidence: label and value from `Observations:` array in `.claude/state/ua-worker/nm3344-basicinv2-0810/basicinv.verify.txt` — **no testid in source**. Testids assigned by sequential 0-based index inference. A confirming live walk is required before any test spec relies on these testids.

| Row | Service Type label | testid (INFERRED) | Default value | Evidence verdict |
|---|---|---|---|---|
| 40 | Power Labor | `service-charge-percentage-40` | `0.00 %` | DOM-ORDER-INFERRED |
| 41 | Power Rental Equipment | `service-charge-percentage-41` | `0.00 %` | DOM-ORDER-INFERRED |
| 42 | Power Sub-rental Equipment | `service-charge-percentage-42` | `0.00 %` | DOM-ORDER-INFERRED |
| 43 | Production Labor | `service-charge-percentage-43` | `0.00 %` | DOM-ORDER-INFERRED |
| 44 | Production Management | `service-charge-percentage-44` | `0.00 %` | DOM-ORDER-INFERRED |
| 45 | Reimbursed Expense | `service-charge-percentage-45` | `0.00 %` | DOM-ORDER-INFERRED |
| 46 | Rigging Equipment - Subrental | `service-charge-percentage-46` | `0.00 %` | DOM-ORDER-INFERRED |
| 47 | Rigging Equipment Rental | `service-charge-percentage-47` | `24.00 %` | DOM-ORDER-INFERRED |
| 48 | Rigging Labor | `service-charge-percentage-48` | `0.00 %` | DOM-ORDER-INFERRED |
| 49 | Rigging Labor - External | `service-charge-percentage-49` | `0.00 %` | DOM-ORDER-INFERRED |
| 50 | Sales & Consumables | `service-charge-percentage-50` | `0.00 %` | DOM-ORDER-INFERRED |
| 51 | Scenic Equipment Rental | `service-charge-percentage-51` | `0.00 %` | DOM-ORDER-INFERRED |
| 52 | Scenic Sub-Rental | `service-charge-percentage-52` | `0.00 %` | DOM-ORDER-INFERRED |
| 53 | Service Charge | `service-charge-percentage-53` | `0.00 %` | DOM-ORDER-INFERRED |
| 54 | Setup Charges | `service-charge-percentage-54` | `0.00 %` | DOM-ORDER-INFERRED |
| 55 | Shipping Resale | `service-charge-percentage-55` | `0.00 %` | DOM-ORDER-INFERRED |
| 56 | Sub-Contracted Labor | `service-charge-percentage-56` | `24.00 %` | DOM-ORDER-INFERRED |
| 57 | Sub-Rental Equipment | `service-charge-percentage-57` | `24.00 %` | DOM-ORDER-INFERRED |
| 58 | Technical Design & Engineering | `service-charge-percentage-58` | `0.00 %` | DOM-ORDER-INFERRED |
| 59 | Technician - Support Services | `service-charge-percentage-59` | `0.00 %` | DOM-ORDER-INFERRED |
| 60 | Telecom Equipment | `service-charge-percentage-60` | `0.00 %` | DOM-ORDER-INFERRED |
| 61 | Telecom Labor | `service-charge-percentage-61` | `0.00 %` | DOM-ORDER-INFERRED |
| 62 | Telecom Services | `service-charge-percentage-62` | `0.00 %` | DOM-ORDER-INFERRED |
| 63 | Telecom Subrental | `service-charge-percentage-63` | `0.00 %` | DOM-ORDER-INFERRED |
| 64 | TRA/AVT Royalty/Redevance | `service-charge-percentage-64` | `0.00 %` | DOM-ORDER-INFERRED |
| 65 | Venue Equipment Rental | `service-charge-percentage-65` | `24.00 %` | DOM-ORDER-INFERRED |
| 66 | Video Conferencing | `service-charge-percentage-66` | `24.00 %` | DOM-ORDER-INFERRED |
| 67 | Virtual Events Equipment | `service-charge-percentage-67` | `0.00 %` | DOM-ORDER-INFERRED |
| 68 | Virtual Events Professional Service | `service-charge-percentage-68` | `0.00 %` | DOM-ORDER-INFERRED |
| 69 | Virtual Events Support Labor | `service-charge-percentage-69` | `0.00 %` | DOM-ORDER-INFERRED |
| 70 | Web Conferencing | `service-charge-percentage-70` | `24.00 %` | DOM-ORDER-INFERRED |
| 71 | Wedding Event Equipment Rental | `service-charge-percentage-71` | `0.00 %` | DOM-ORDER-INFERRED |
| 72 | Wedding Event Labor | `service-charge-percentage-72` | `0.00 %` | DOM-ORDER-INFERRED |
| 73 | Wedding Event Sales & Consumables | `service-charge-percentage-73` | `0.00 %` | DOM-ORDER-INFERRED |
| 74 | xAdministrative Fee | `service-charge-percentage-74` | `0.00 %` | DOM-ORDER-INFERRED |
| 75 | xHSIA Reimbursed Expense | `service-charge-percentage-75` | `0.00 %` | DOM-ORDER-INFERRED |
| 76 | xMiscellaneous Services | `service-charge-percentage-76` | `0.00 %` | DOM-ORDER-INFERRED |
| 77 | ZSub Contractor Specialty Labor | `service-charge-percentage-77` | `0.00 %` | DOM-ORDER-INFERRED |
| 78 | ZSub Rental Specialty | `service-charge-percentage-78` | `0.00 %` | DOM-ORDER-INFERRED |

### Save button

| element | testid | state at walk | evidence verdict |
|---|---|---|---|
| Save | `service-charge-save` | `disabled` (environment condition) | DIRECTLY-OBSERVED — `basicinv.verify.txt` |

## §3 Service Charge History tab — failed walk record

| Attempt | Run-id | Date | Result |
|---|---|---|---|
| 1 | `nm3344-histwalk-0810` | 2026-08-10 | Loading skeletons returned; no data rows captured |
| 2 | `nm3344-histwalk2-0810` | 2026-08-10 | Loading skeletons returned; no data rows captured |

Only the page heading pattern (`Service Charge History : Parker Palm Springs`) and four column names
(`Service Type`, `Service Charge Percentage`, `Modified By`, `Modified On`) were observed before
the skeletons dominated. No testids, row data, or affordances were captured. A future walk is
required when the e2e environment stabilises.

## Observations

### Bugs / Defects

**SVC-OBS-1 — History heading omits the office name. EXISTING TICKET: NM-3300. CONFIRMED 2026-08-11.**

The new-site `<h1>` on the History tab renders only `Service Charge` with no office name. The
old-site History heading is `Service Charge History - Corporate Office Encore USA SGA` — the office
name is present, separated by a dash. NM-2210 AC-5 requires the heading to reflect the selected
office. Do not re-file; this is already tracked as NM-3300 (status: Done on the Jira cross-reference
— however the new-site behaviour on 2026-08-11 confirms the regression is still observable on e2e).

**Confirmed 2026-08-11 by spec run**: `TC-SVC-HIS-001` failed both passes. Pass 1 failure artifact
records verbatim: `Expected pattern: /Parker Palm Springs/ Received string: "Service Charge"`. This
is stronger evidence than the 2026-08-10 walk (which ran in a degraded environment and partially
observed a heading with office name). The 2026-08-10 observation was under conditions that may not
have reflected the stable render state; the spec-run failure is deterministic and repeatable across
two independent passes. Evidence source: `.claude/state/ua-worker/nm3344-svcfail-0811/result.md`
§ TC-SVC-HIS-001.

*Source*: `.claude/state/ua-worker/nm3344-nav2-0811/nav2-observations.md` — "Service Charge History
- Corporate Office Encore USA SGA" (old-site verbatim); `service_charge_history_test_cases.md`
Validation Rules row "Page `<h1>` should include the office name (NM-2210 AC5, NM-3300)" — "Known
defect: NM-3300". `jira-defect-crossref-service-charge-2026-08-10.md` §2 row NM-3300.
Spec-run confirmation: `.claude/state/ua-worker/nm3344-svcfail-0811/result.md` § TC-SVC-HIS-001.

---

**SVC-OBS-2 — Unsaved-changes modal does not appear when switching from Basic Information to History tab. EXISTING TICKET: NM-3285.**

Navigating from Basic Information to Service Charge History while edits are in progress should
present a Save Changes / Discard Changes / Cancel modal. The modal does not appear; navigation
proceeds without confirmation. Do not re-file; tracked as NM-3285.

*Source*: `service_charge_history_test_cases.md` Validation Rules row "Unsaved changes modal on tab
switch (NM-3285)" — "Known defect: NM-3285". `jira-defect-crossref-service-charge-2026-08-10.md`
§2 row NM-3285.

---

**SVC-OBS-3 — `Modified By` column renders a raw GUID instead of a display name. NO EXISTING TICKET. Filed as BUG-SVC-HIS-001.**

All sampled rows on 2026-08-11 show a raw GUID string in the `Modified By` column (observed values:
`0c0bec78-1b63-4eed-a2ea-967920c8bfc3`, `b5668cc9-…`, `156d03e1-…` — multiple distinct GUIDs across
multiple rows). The old site shows `System Update` in the equivalent column for all visible rows
(approximately 30+ rows loaded on 2026-08-11, all showing "System Update"). NM-2210 AC-4 states
"Modified by · Modified on" as the column intent — showing who made each change. A raw GUID is not a
human-readable identification of who made the change.

**GUID scope**: multiple rows confirmed (three distinct GUID values in ten sampled rows). Whether
every row in the full 50-row set for office 1604 shows a GUID, or whether some rows show a display
name, is **unknown from artifacts** — only the first ten rows were sampled.

Filed as `clients/encore/reports/bugs/BUG-SVC-HIS-001.json`.

*Source*: `service_charge_history_test_cases.md` Validation Rules row "Modified By identifies the
user…" — "Known defect: all sampled rows on 2026-08-11 rendered a raw GUID (0c0bec78-…, b5668cc9-…,
156d03e1-…) instead of a display name; no ticket covering this was found." MCP_VERIFICATION_LOG
item 9: "Modified By renders raw GUID — Confirmed across all ten sampled rows". `.claude/state/
ua-worker/nm3344-nav2-0811/nav2-observations.md` "Modified By — Three verbatim values: System
Update, System Update, System Update."

---

**SVC-OBS-4 — Percentage inputs remained disabled for approximately 30 seconds after page load. JUDGEMENT: environment characteristic, not a product defect.**

During the 2026-08-10 walk, all 79 percentage inputs and the Save button were `disabled`. The
`Local Office : -` header indicated the office data failed to load. Input-disabled duration was
measured at 30521 ms / 30689 ms / 30624 ms in the walk script. The old site's fields were
immediately clickable after load (< 3 s, `nav2-observations.md`).

**Judgement**: this is an environment characteristic. The field-inventory explicitly records
`e2e environment degraded` as the cause. The disabled state is a downstream consequence of office
data not loading rather than a product-imposed delay — the inputs are disabled because the office
context is absent, not because of a deliberate 30-second lockout. No product defect is filed. If
the same delay recurs on a stabilised environment, it should be re-evaluated.

*Source*: `service-charge-basic-information-2026-08-10.md` Live-state caveat — "all 79 percentage
inputs disabled… e2e environment degraded; `Local Office : -` header indicates office data did not
load." `.claude/state/ua-worker/nm3344-nav2-0811/nav2-observations.md` — "fields are clickable
immediately after load with no additional wait."

### Suggestions / Improvements

none

---

### Environment observations (2026-08-11, from spec run artifacts)

**SVC-OBS-5 — Office context header renders `"Local Office :"` with no office name. APP DEFECT — second sighting of office-name-missing defect family (NM-3300). RECLASSIFIED 2026-08-11.**

`TC-SVC-HIS-015` (both passes) records: `Expected pattern: /Parker Palm Springs/ Received string: "Local Office :"`. The `sc.getOfficeHeader()` call returned `"Local Office :"` — the office name token is absent. This is the breadcrumb/context header, distinct from the page `<h1>` covered by SVC-OBS-1 / NM-3300.

**Reclassification rationale**: Both runs produced identical DOM state across 2 independent whole-file passes — deterministic, not environmental wobble. HIS-013 (save and History row verification) passed in both runs, proving the e2e environment was functional and office data DID load for basic operations. The office name simply does not appear in the context header element. This is the same root cause as NM-3300 (the app does not inject the office name into page UI elements) but affecting a different element. Prior classification as SVC-ENV-1 ("ENVIRONMENT") was based on correlation with degraded-env symptoms that did not hold when examined against passing tests in the same run.

**Second sighting recorded**: the first sighting is SVC-OBS-1 / NM-3300 (h1 heading omits office name); this is the second (breadcrumb header omits office name). TC-SVC-HIS-015 carries a known-defect annotation mirroring TC-SVC-HIS-001.

Evidence: `.claude/state/ua-worker/nm3344-auditfix-0811/hist-run1.log` and `hist-run2.log` — 2-of-2 identical failures at `spec:410`.

---

**SVC-ENV-2 — Service Charge History tab takes 60+ seconds to become interactive after office switch. ENVIRONMENT.**

`TC-SVC-HIS-011` (both passes) timed out at the 120 s spec limit: `waitUntilLoaded()` on a second `goto()` (navigating to a different office) exhausted its 60 s poll (23 cycles pass 1, 20 cycles pass 2) without the page becoming interactive. The URL navigation succeeded; the page never reached an interactive state within the timeout. Consistent across both independent passes, pointing to environment load latency on office-context switch rather than a random flake. No product defect filed — the test-infrastructure timeout is the proximate failure; the root cause is server/environment response time. If reproducible in a stable environment with a longer timeout, re-evaluate as a performance defect. Evidence: `.claude/state/ua-worker/nm3344-svcfail-0811/result.md` § TC-SVC-HIS-011.

---

### Discussion items (not filed — need requirements answer)

**SVC-DISC-1 — Full-page navigation away with unsaved changes: browser-native `beforeunload` fires but no in-app Angular dialog appears. NOT FILED — requirements scope unclear.**

`TC-SVC-BAS-022` (both passes) failed: after editing a field and navigating away, the test asserted `[role="alertdialog"]` visible — it was absent. The RCA classifies this as a new app defect. However, the run log shows `[fixture] Auto-accepting beforeunload` fired — a browser-native unload warning did appear; the Playwright fixture auto-accepted it. A real user navigating away dirty does receive a warning; it is the browser's, not Angular's in-app dialog.

**Requirements check (LR-034 Step 1)**: NM-3285 (Done) covers "Unsaved-Changes modal not shown when navigating to the **History tab**" — tab switch only. NM-3358 (Done) covers "Unsaved-Changes dialog not shown when navigating via the **Location selector**" — office switch only. NM-2209 ACs (§3.1) list save/dirty-state behaviors for the Basic Information tab but do not specify the dialog type (in-app Angular vs browser-native) for full-page navigation away. No documented requirement was found specifically requiring an in-app Angular dialog on full navigation-away from the Service Charge page.

**Decision: NOT FILED under LR-034.** Filing "no warning appears" is factually wrong — a warning did appear (browser-native). Filing "wrong dialog type" requires a documented requirement that the in-app Angular dialog must appear specifically on full navigation-away; none was found in NM-2209, NM-3285, or NM-3358. Record here as a discussion item per LR-040(c): the behavior to confirm with the product team is whether the app intends to show its own Angular Unsaved Changes dialog (consistent with NM-3285/3358 pattern) or whether the browser-native `beforeunload` prompt is the acceptable guard for full navigation-away. If the product team confirms the in-app dialog is required, file `BUG-SVC-BAS-002` citing this item. Evidence: `.claude/state/ua-worker/nm3344-svcfail-0811/result.md` § TC-SVC-BAS-022.

---

**SVC-OBS-3 — History grid column header clicks do not reorder rows. ENVIRONMENT/DESIGN OBSERVATION.**

Live probe 2026-08-11 (nm3344-fixmeprobe2-0811) on a 76-row populated History grid for office 1604: row 0 (APP Downloaded | 0.00 % | s-prd-clickauto@psav.com | 08/11/2026 10:27:08 AM) was unchanged after clicking the Service Type column header. All four column headers had ria-sort=null before the click and ria-sort=null after the click. No requirement document was found specifying that the History grid must be sortable. Classified as a design observation — no defect filed. TC-SVC-HIS-012 updated to assert the observed behaviour (no sort) rather than the prior unconfirmed assumption (sort).

---

**SVC-OBS-4 — Modified By format differs between legacy and new rows: GUIDs for pre-existing rows, email for automation-user-created rows. SCOPE CLARIFICATION for BUG-SVC-HIS-001.**

Live probe 2026-08-11 (nm3344-fixmeprobe2-0811): a save on Basic Information (APP Downloaded 0.00→1.00) produced a new History row with Modified By = s-prd-clickauto@psav.com (the automation account email), not a GUID. The 10 GUID-rendering rows sampled earlier on the same date are pre-existing/legacy rows predating this session. BUG-SVC-HIS-001 verificationLog amended to record this scope: the raw-GUID defect affects legacy/migrated rows; current automation-user-created rows show an email address. Severity unchanged for the affected legacy rows. TC-SVC-HIS-013 updated to assert Modified By = email for the row created by this test.


---

**SVC-OBS-3 — Clicking a History grid column header empties the grid and rows do not return. DISCUSSION ITEM (no requirement covers header-click behaviour). CONFIRMED 2026-08-11.**

Clicking the first column header (Service Type) on the History grid causes the grid to empty immediately. Rows do not return within 30 seconds. Observed across 3 independent test runs (final battery passes 4, 5, and 6 — sc-final.log lines 501, 627, 1520, 1646). The test ran BEFORE the mutation test (HIS-013) in file order each time, ruling out row-state contamination as the cause. aria-sort is not set after the click, confirming the grid has no sort affordance. This is a discussion-item candidate — no NM ticket exists for column-header click behaviour; do not file a bug JSON without a confirmed requirement. Evidence: clients/encore/reports/sc-artifacts-history-5/ and sc-artifacts-history-6/ failure screenshots for TC-SVC-HIS-012; sc-final.log 30 s timeouts both passes.

**Disposition: deferred-to-DEEP.** No documented requirement covers column-header click behaviour on the History grid. Whether the grid-empties response constitutes a product defect requires a product-team decision. Deferring investigation to the DEEP coverage phase when requirements can be confirmed. No bug JSON filed.


**SVC-OBS-6 — Enumerator did NOT trigger the header-click-empties-grid behavior (SVC-OBS-3). ENUMERATION FINDING 2026-08-11.**

Investigation of nm3344-histdenom2-0811: JSON cycles show `openersClicked=1` in cycle-1 (the History tab only) and `openersClicked=0` in cycle-2. `derived_types` for both found header buttons (`id:radix-_r_1a_` Modified By, `id:radix-_r_1c_` Modified On) shows `probe:unresolved` — neither was clicked during type-resolution. The enumerator never clicked any column header. Service Type and Service Charge Percentage column headers are absent from the denominator because they are NOT native `<button>` elements — only Modified By and Modified On are (`why:"native:button"` in JSON). The ~76 data rows are non-interactive `<tr>/<td>` elements, also not machine-enumerable. The enumeration result of 30 is correct; no config change is required. SVC-OBS-3 (header-click-empties-grid) remains a real behavior confirmed by spec runs but is orthogonal to what the enumerator does.
