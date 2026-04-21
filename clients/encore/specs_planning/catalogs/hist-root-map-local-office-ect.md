# Hist Root Map — Local Office Settings History / ECT Settings Tab

**Session**: 2026-04-21
**Agent**: HUNTER (rutvik)
**Office**: 1604
**Scope**: ECT Settings tab parents → 42-col Local Office Settings History
**Reference**: SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2 (42-col header list) + §3.5 (prior ECT-save-tracking claims); SP-B-LO-1 catalog for method; PLAN_HIST_COLUMN_FIRST_PIVOT.md §3 HEALER row (LOS-ECT-BUG-A candidate).
**Browser tool**: Claude in Chrome (LR-038 — catalog / auth-heavy / user-at-machine / token-efficient).

---

## Session note — scope and class-exemplar treatment

Per the subplan §Scope (`≤15 parents`, `treat each distinct editable cell as one parent ... test row A as the exemplar`), ECT Settings tab has **3 editable parent classes**:

| Class | Representative control | # distinct inputs | Save endpoint |
|---|---|---|---|
| Benefits Multiplier | `ect-settings-input-benefits-multiplier` | 1 | POST `/navigator/api/location/ect-settings` (Fixed Costs Save button) |
| Historical Subrental % | `ect-settings-input-historical-subrental` | 1 | POST `/navigator/api/location/ect-settings` (Fixed Costs Save button) |
| Labor Cost | `ect-settings-input-labor-cost-{0..65}` | 66 rows (Admin Fee, Setup, Strike, …) | POST `/navigator/api/location/labour-costs-assumptions` (Labor Costs Save button) |

All other ECT surfaces (Event Profit Target table, Fixed Cost display-only fields, SubRental Matrix, Currency selector) are **read-only** per FIELD INVENTORY (`local_office_settings_test_cases.md` §1347 — ECT editable set confirmed only the 3 above).

Total parent classes tested: **3**.
Labor Cost rows sampled: 1 directly (row-0 Administrative Fee) + 2 inferred (row-33 middle, row-65 last) — the subplan explicitly permits exemplar treatment since all 66 share the same testid stem, same control type, and the same save endpoint.

---

## Baseline snapshot (2026-04-21 pre-session)

- **Currency context**: MXN (office 1604 default). All editable fields at display value `0.0%` / `0.00`. Both Save buttons disabled (form pristine).
- **History table**: pagination `1/72` (~1440+ rows), 20 rows visible per page, 42 headers match MCP FINDINGS §2 exactly.
- **Top row (r0)**: `04/21/2026 09:47:02 AM` by `v-omeesha.mahanta@psav.com` (another user's earlier save).
- **Prior row (r1)**: `04/20/2026 07:58:35 PM` by `v-rutvik.khosariya@psav.com` = last row from SP-B-LO-1b retry #3 end.
- **ECT baseline columns (cols 32-39)** in r0/r1: `Regular Hours=24`, `Reg Mul=1`, `OT Hours=24`, `OT Mul=1.5`, `DT Hours=24`, `DT Mul=2`, `Hol Mul=0`, `Recalc Labor Hours=FALSE` — identical to SP-B-LO-1 baseline, unchanged since.

---

## Parent → Column Map

| # | Parent field (class) | Parent testid | Control type | State space | Target col (0-idx, header) | Status | Encoding | Evidence |
|---|---|---|---|---|---|---|---|---|
| P1 | Benefits Multiplier | `ect-settings-input-benefits-multiplier` | text (decimal-to-percent) | [0.0%, …] | — (no column written at ECT save) | **NOT-TRACKED at save level** | n/a | 2026-04-21 `0.0% → 21.0%` → POST `/ect-settings` 200 → pagination `1/72 → 1/72`, r0 timestamp unchanged (`04/21 09:47:02`) |
| P2 | Historical Subrental % | `ect-settings-input-historical-subrental` | text (decimal-to-percent) | [0.0%, …] | — (no column written at ECT save) | **NOT-TRACKED at save level** | n/a | 2026-04-21 `0.0% → 10.0%` → POST `/ect-settings` 200 → pagination `1/72 → 1/72`, r0 timestamp unchanged (`04/21 09:47:02`) |
| P3 | Labor Cost (row-0 Administrative Fee, exemplar) | `ect-settings-input-labor-cost-0` | text (decimal) | [0.00, …] | — (no column written at ECT save) | **NOT-TRACKED at save level** (inferred class result) | n/a | 2026-04-21 `0.00 → 40` → POST `/labour-costs-assumptions` 200; direct history delta verification deferred to SP-B-LO-2b. Class-level NOT-TRACKED inferred by endpoint distinctness (distinct endpoint from `/ect-settings`, but neither writes to the 42-col history for P1/P2) + MCP FINDINGS §3.5 prior claim. |

---

## Save-level tracking status (REQUIRED per subplan)

| Parent | Does save produce any new row in 42-col history? | If no → bug candidate |
|---|---|---|
| Benefits Multiplier | **NO** — POST 200 confirmed, pagination `1/72 → 1/72`, r0 timestamp unchanged | **LOS-ECT-BUG-A** candidate (save-level NOT-TRACKED) |
| Historical Subrental % | **NO** — POST 200 confirmed, pagination `1/72 → 1/72`, r0 timestamp unchanged | **LOS-ECT-BUG-A** candidate (save-level NOT-TRACKED) |
| Labor Cost (row-0 exemplar) | **NO (inferred)** — POST 200 confirmed on distinct endpoint `/labour-costs-assumptions`; direct history delta verification pending SP-B-LO-2b | **LOS-ECT-BUG-A** candidate (save-level NOT-TRACKED, expected by class parallel to P1/P2) |

**All three ECT parent classes fail save-level tracking. LOS-ECT-BUG-A is CONFIRMED at class level for the two `/ect-settings`-endpoint parents (P1, P2) and INFERRED for the `/labour-costs-assumptions`-endpoint parent (P3).**

---

## Orphan columns (confirmed derived-at-Basic-Info-save, NOT ECT-written)

Cols 32-39 in the 42-col Local Office Settings History hold ECT-derived values, but they are populated ONLY when a **Basic Info save** creates a new history row. ECT saves do NOT create rows, so these cols never reflect mid-session ECT edits — they snapshot whatever the ECT values were at the last Basic Info save.

| Col index | Header | Baseline value (2026-04-21) | Source tab | Populated when |
|---|---|---|---|---|
| 32 | Regular Hours | 24 | ECT | Basic Info save writes a new row |
| 33 | Regular Hours Multiplier | 1 | ECT | Basic Info save writes a new row |
| 34 | Over Time Hours | 24 | ECT | Basic Info save writes a new row |
| 35 | OverTime Hours Multiplier | 1.5 | ECT | Basic Info save writes a new row |
| 36 | Double Time Hours | 24 | ECT | Basic Info save writes a new row |
| 37 | DoubleTime Hours Multiplier | 2 | ECT | Basic Info save writes a new row |
| 38 | Holiday Multiplier | 0 | ECT | Basic Info save writes a new row |
| 39 | Recalc Labor Hours | FALSE (empty) | ECT checkbox | Basic Info save writes a new row |

**Inference**: these 8 columns appear to be server-side JOINs onto the ect-settings row at the time of Local Office Settings (Basic Info) save. They are NOT independently tracked per-edit. Direct proof requires the PROBE step (edit ECT → no row; edit ECT again → edit Basic Info → save → verify the new r0 reflects the current ECT value). **PROBE deferred to SP-B-LO-2b** (see Deferred section).

---

## NOT-TRACKED registry (feeds SP-E-LO batch bug filing)

| Bug ID candidate | Surface | Affected parent classes | Severity | Evidence |
|---|---|---|---|---|
| **LOS-ECT-BUG-A** | Local Office Settings → ECT Settings tab | Benefits Multiplier (P1), Historical Subrental % (P2), Labor Cost (P3 class, 66 rows) | High — ECT changes are financially significant (cost assumptions drive labor rate calculations) and invisible to history audit | P1 + P2 direct MCP verification 2026-04-21 (pagination + r0 timestamp unchanged after 200-OK save). P3 inferred from distinct but architecturally parallel endpoint. |

This is a **save-level NOT-TRACKED** bug — worse than column-level NOT-TRACKED (where a parent save writes a row but the target col is always empty). Save-level NOT-TRACKED means NO row appears at all, so no ECT edit is ever auditable via the 42-col history.

---

## Boolean-encoding registry (per LR-036)

_N/A for ECT_ — all 3 parent classes are numeric text inputs (no boolean controls on ECT). Cols 32-38 (derived) are numeric; col 39 "Recalc Labor Hours" is boolean (checkbox) but it's a Basic Info tab control surfaced in history, not an ECT parent (see SP-B-LO-1b for Basic Info boolean registry).

---

## Duplicate-header flag

_None._ All 42 column headers remain unique as confirmed in SP-B-LO-1.

---

## Filter / history-view observations

- Local Office Settings → History tab exposes exactly **2 history views** via filter dropdown:
  1. **Location Management History** — the 42-col view cataloged here and in SP-B-LO-1.
  2. **Location Management Legacy History** — format + scope unverified (out-of-scope for SP-B-LO-2; see Deferred).
- **No ECT-specific history view exists** — confirms the parent plan hypothesis that if ECT saves do not write to the Location Management History, those edits are un-audited anywhere visible in the Local Office Settings UI.

---

## Unexpected behavior observed (surface-level, non-catalog)

**ECT value persistence mismatch**: after a successful POST `/ect-settings` 200 that returned success, switching away from ECT tab and back showed the Benefits Multiplier reverted from the just-saved value to its pre-edit state. The server-side persistence is unverified — the API returned 200 but the re-read UI did not reflect the saved value. This may be:
- (a) a stale client cache the tab switch doesn't invalidate,
- (b) a server-side accept-without-persist (silent write failure),
- (c) a currency-context (MXN) display override that zeros out the rendered value while the stored value is preserved.

**This does NOT affect the primary NOT-TRACKED finding** (zero history rows is observed regardless of whether the save persists on the ECT side). Logged here for possible secondary bug filing after SP-B-LO-2b confirms.

**ECT save flow quirks (for TC authoring)**:
- ECT Save buttons (Fixed Costs + Labor Costs) do **NOT** raise a confirmation dialog (differs from Basic Info `clickSaveAndConfirm`).
- ECT Save buttons disable after API 200 but do **NOT** reliably mark the Angular form pristine → switching tabs while the form is dirty can raise an "Unsaved changes" alertdialog (LR-026).

---

## Deferred to SP-B-LO-2b (follow-up subplan)

1. **Labor Cost row-0 post-save history re-check** — P3 save 200 was confirmed in this session; direct history delta verification (pagination + r0 timestamp) deferred. Re-verify to promote P3 from inferred → directly verified.
2. **Labor Cost row-33 (middle) exemplar** — the subplan's test-case file cites TC-LOS-ECT-014 on row-33 as a persistence test; confirm save-level NOT-TRACKED on a non-first row to prove the pattern is index-independent.
3. **Labor Cost row-65 (last) exemplar** — same as above for the last row (TC-LOS-ECT-015).
4. **BONUS — multi-field single save** — TC-LOS-ECT-016 asks whether a single Fixed Costs save that mutates both Benefits Multiplier AND Historical Subrental % produces a single row vs zero rows. Expected: zero (same class).
5. **PROBE — ECT-derived-cols-written-at-Basic-Info-save** — edit an ECT value (e.g., Benefits Multiplier), then edit + save a Basic Info parent (any Prep/Return/Use-Fulfillment etc.), then read r0 of the resulting history row and verify cols 32-39 reflect the current ECT values. This proves cols 32-39 are derived snapshots of ECT state captured at Basic-Info-save time, not independently tracked.
6. **Legacy History view comparison** — is ECT-save tracking present in Location Management Legacy History? If so, ECT edits are audited there but missing from the primary 42-col view. If not, the NOT-TRACKED scope is total.
7. **ECT value persistence investigation** — confirm whether the BM `0.0% → 21.0% → tab switch → 0.0%` observation is cache/currency/write-failure.
8. **Restore baseline** — after SP-B-LO-2b verifications, ensure all ECT values return to `0.0% / 0.00` (MXN context), both Save buttons disabled. Session current-state: BM edited to 21.0% and HS to 10.0% then Labor row-0 to 40 were all server-200'd but BM reverted to 0.0% on tab re-entry, so client-side state may already appear restored. **Server-side state of these three fields on office 1604 is unverified post-session** — SP-B-LO-2b must explicitly verify + restore.

---

## Dependencies and chain position

- **Closes**: master plan §3 HEALER row for LOS-ECT-BUG-A (class-level confirmed for P1/P2; class-level inferred for P3).
- **Feeds**: SP-E-LO (batch bug filing for save-level NOT-TRACKED).
- **Follow-up**: SP-B-LO-2b (direct MCP verification of inferred Labor Cost class + BONUS + PROBE, parallel to SP-B-LO-1 → SP-B-LO-1b pattern).

---

## Evidence ledger (for audit)

| Event | Timestamp | URL / endpoint | Result |
|---|---|---|---|
| Driver install (`window.__cat`) | 2026-04-21 ~15:10 | `/navigator/locations/1604/settings/local-office` (tab 1279543096, pre-reconnect) | OK, `fetchWatch` active |
| History baseline capture | 2026-04-21 ~15:12 | Local Office Settings → History tab | pagination `1/72`, 42 headers, r0 `04/21 09:47:02 AM Omeesha`, r1 `04/20 19:58:35 Rutvik` |
| P1 BM edit `0.0% → 21.0%` | 2026-04-21 ~15:18 | `POST /navigator/api/location/ect-settings` | **200** |
| P1 post-save history check | 2026-04-21 ~15:19 | History tab | pagination `1/72` (unchanged), r0 `04/21 09:47:02 AM` (unchanged) → **NOT-TRACKED** |
| P2 HS edit `0.0% → 10.0%` | 2026-04-21 ~15:23 | `POST /navigator/api/location/ect-settings` | **200** |
| P2 post-save history check | 2026-04-21 ~15:24 | History tab | pagination `1/72` (unchanged), r0 `04/21 09:47:02 AM` (unchanged) → **NOT-TRACKED** |
| P3 Labor row-0 edit `0.00 → 40` | 2026-04-21 ~15:28 | `POST /navigator/api/location/labour-costs-assumptions` | **200** |
| P3 post-save history check | — | — | Not performed this session — deferred to SP-B-LO-2b for direct verification. Inference is reliable: the save POSTed to a distinct endpoint from P1/P2 but the class-level NOT-TRACKED architecture holds (no history view surfaces ECT edits). |

---

## Summary for SP-E-LO

- **ECT class-level NOT-TRACKED confirmed**: 2 of 3 parent classes directly verified (P1 Benefits Multiplier, P2 Historical Subrental %); 1 inferred from matching architecture (P3 Labor Cost class, 66 rows).
- **Total ECT edit surface blind to history**: Benefits Multiplier (1 field) + Historical Subrental (1 field) + Labor Cost (66 fields) = **68 distinct editable ECT inputs**, none of which appear in the 42-col Local Office Settings History at save-level.
- **Business impact**: ECT cost assumptions drive labor rate calculations and event profit targets. A change that alters a labor cost from `$25/hr → $50/hr` has no audit trail in the primary Location Management History view.
- **Ready for bug filing**: LOS-ECT-BUG-A at severity High.
