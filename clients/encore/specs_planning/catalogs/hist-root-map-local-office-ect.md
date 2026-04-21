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
| P3 | Labor Cost (row-0 Administrative Fee, exemplar) | `ect-settings-input-labor-cost-0` | text (decimal) | [0.00, …] | — (no column written at ECT save) | **NOT-TRACKED at save level** (CONFIRMED 2026-04-21 SP-B-LO-2b) | n/a | 2026-04-21 SP-B-LO-2 `0.00 → 40` → POST `/labour-costs-assumptions` 200. SP-B-LO-2b 2026-04-21T10:33:37Z direct re-check: `40 → 0.00` → POST 200, response `{success:true}`, post-save r0 timestamp 04/21 10:31:39 (Omeesha) PRE-DATES my save → zero rows added by my save → direct verification CONFIRMED. |
| P3-r33 | Labor Cost row-33 (Labor Brokering, middle exemplar) | `ect-settings-input-labor-cost-33` | text (decimal) | [0.00, …] | — | **NOT-TRACKED at save level** (CONFIRMED 2026-04-21 SP-B-LO-2b) | n/a | 2026-04-21T10:34:57Z `0.00 → 12.50` → POST 200, post-save r0 timestamp 04/21 10:34:15 (Omeesha) PRE-DATES my save → zero rows added by my save. Confirms row-index-independence (same class result as row-0). |
| P3-r65 | Labor Cost row-65 (zzzFinishing Service, last exemplar) | `ect-settings-input-labor-cost-65` | text (decimal) | [0.00, …] | — | **NOT-TRACKED at save level** (CONFIRMED 2026-04-21 SP-B-LO-2b) | n/a | 2026-04-21T10:36:10Z `0.00 → 7.25` → POST 200, post-save r0 timestamp 04/21 10:34:15 (Omeesha) PRE-DATES my save → zero rows added. Confirms class-wide row-index-independence (rows 0, 33, 65 all NOT-TRACKED at save level). |
| P-BONUS | Multi-field single Fixed Costs save (BM 0.0%→11.0% + HS 0.0%→8.0% in one POST) | composite | composite | composite | — | **NOT-TRACKED at save level** (CONFIRMED 2026-04-21 SP-B-LO-2b) | n/a | 2026-04-21T10:37:54Z single POST `/ect-settings` body `{locationId:1604, currencyId:3, subrentalPercent:0.08, benefitMultiplier:0.11, internalLaborCost:0, externalLaborCost:0}` → 200 `{success:true}`. Post-save r0 timestamp 04/21 10:37:22 (Omeesha) PRE-DATES my save → zero rows added by my save. Multi-field composition does not change save-level result. |

---

## Save-level tracking status (REQUIRED per subplan)

| Parent | Does save produce any new row in 42-col history? | If no → bug candidate |
|---|---|---|
| Benefits Multiplier | **NO** — POST 200 confirmed, pagination `1/72 → 1/72`, r0 timestamp unchanged | **LOS-ECT-BUG-A** candidate (save-level NOT-TRACKED) |
| Historical Subrental % | **NO** — POST 200 confirmed, pagination `1/72 → 1/72`, r0 timestamp unchanged | **LOS-ECT-BUG-A** candidate (save-level NOT-TRACKED) |
| Labor Cost (rows 0, 33, 65 — exemplar set) | **NO** — POST 200 confirmed on distinct endpoint `/labour-costs-assumptions` for all 3 sampled rows; direct history delta CONFIRMED 2026-04-21 SP-B-LO-2b (post-save r0 timestamp pre-dates my save in every case) | **LOS-ECT-BUG-A** candidate (save-level NOT-TRACKED, class-wide directly verified) |
| BONUS — multi-field single Fixed Costs save (BM + HS in one POST) | **NO** — single POST `/ect-settings` 200 with both fields in body, zero rows added | **LOS-ECT-BUG-A** candidate (save-level NOT-TRACKED at save composition level) |

**All three ECT parent classes fail save-level tracking. LOS-ECT-BUG-A is CONFIRMED at class level for all 3 parents — `/ect-settings` endpoint (P1 BM, P2 HS) and `/labour-costs-assumptions` endpoint (P3 LC class, rows 0/33/65 directly verified). Multi-field composition does not change the result.**

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

**Inference (now CONFIRMED — see SP-B-LO-2b PROBE below)**: these 8 columns appear to be server-side JOINs onto an ECT-related projection at the time of Local Office Settings (Basic Info) save. They are NOT independently tracked per-edit. The 3 editable ECT parent classes (BM, HS, LC) do NOT map to any of cols 32–39 — those columns reflect a different ECT-derived surface (likely the read-only Event Profit Target labor-hour assumptions). PROBE evidence: even with HS=8.0%, LC0=0.00, LC33=12.50, LC65=7.25 active in the form (i.e. server-persisted ECT class state mutated from baseline), a subsequent Basic Info save at 2026-04-21T10:47:11 produced a new r0 with cols 32-39 IDENTICAL to baseline `[24, 1, 24, 1.5, 24, 2, 0, ""]` — proving (a) Basic Info saves DO write a row that reflects the CURRENT ECT-derived projection, and (b) the editable ECT class state does NOT participate in that projection. The orphan-column inference is now CONFIRMED on the structural side; the JOIN target is a different ECT surface than the editable inventory.

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

- **ECT class-level NOT-TRACKED confirmed**: 3 of 3 parent classes directly verified (P1 Benefits Multiplier, P2 Historical Subrental %, P3 Labor Cost — exemplar rows 0/33/65 + BONUS multi-field composition). SP-B-LO-2b promoted P3 from INFERRED → CONFIRMED.
- **Total ECT edit surface blind to history**: Benefits Multiplier (1 field) + Historical Subrental (1 field) + Labor Cost (66 fields) = **68 distinct editable ECT inputs**, none of which appear in the 42-col Local Office Settings History at save-level. Also confirmed absent from Location Management Legacy History (no headers for these fields and the table returns "No results." for office 1604).
- **Business impact**: ECT cost assumptions drive labor rate calculations and event profit targets. A change that alters a labor cost from `$25/hr → $50/hr` has no audit trail in the primary Location Management History view.
- **Ready for bug filing**: LOS-ECT-BUG-A at severity High (save-level NOT-TRACKED, class-wide). Plus a separately filed field-level bug **`BUG-LOC-ECT-001`** (silent write-failure for Benefits Multiplier — the API accepts the value, returns `{success:true}`, but never persists it; sibling `subrentalPercent` in the same request body DOES persist; per LR-034 filed 2026-04-21).

---

## Direct Verification Session (SP-B-LO-2b — 2026-04-21)

**Session**: 2026-04-21
**Agent**: HUNTER (rutvik)
**Browser tool**: Claude in Chrome (LR-038 — same reasons as parent SP-B-LO-2 session: catalog/exploratory, auth-heavy, user at machine, token-efficient).
**Driver**: re-installed `window.__cat` after each navigation; `fetchWatch` wrapper around `window.fetch` to capture request/response bodies (limitation: did NOT capture the Basic Info save during PROBE — that endpoint uses XMLHttpRequest, not `fetch`; verified via post-save history-row delta instead).
**Outcome**: all 8 deferred items closed.

### Items closed

| # | Item | Result | Evidence anchor |
|---|---|---|---|
| 1 | P3 Labor Cost row-0 direct re-check (promote INFERRED → CONFIRMED) | NOT-TRACKED CONFIRMED | 2026-04-21T10:33:37Z `lc0:40 → 0.00` POST 200, post-save r0=04/21 10:31:39 (Omeesha) PRE-DATES my save |
| 2 | Labor Cost row-33 (TC-LOS-ECT-014) middle exemplar | NOT-TRACKED CONFIRMED | 2026-04-21T10:34:57Z `lc33:0.00 → 12.50` POST 200, post-save r0=04/21 10:34:15 (Omeesha) PRE-DATES my save |
| 3 | Labor Cost row-65 (TC-LOS-ECT-015) last exemplar | NOT-TRACKED CONFIRMED | 2026-04-21T10:36:10Z `lc65:0.00 → 7.25` POST 200, post-save r0=04/21 10:34:15 (Omeesha) PRE-DATES my save |
| 4 | BONUS multi-field BM+HS in single Fixed Costs save (TC-LOS-ECT-016) | NOT-TRACKED CONFIRMED | 2026-04-21T10:37:54Z single POST `/ect-settings` body `{subrentalPercent:0.08, benefitMultiplier:0.11, …}` → 200 `{success:true}`, post-save r0=04/21 10:37:22 (Omeesha) PRE-DATES my save |
| 5 | PROBE — ECT-derived cols 32–39 written at Basic-Info-save time | CONFIRMED — orphan-column inference holds | 2026-04-21T10:47:11Z Basic Info save (toggle P18 Default Job 1-day Event Orders FALSE→TRUE) wrote new r0 by my user `v-rutvik.khosariya@psav.com`. Col 25 (Event Orders) `lucide-check` = TRUE (toggle landed). Cols 32-39 = `[24, 1, 24, 1.5, 24, 2, 0, ""]` — IDENTICAL to baseline despite active server-persisted ECT class state (HS=8.0%, LC0=0.00, LC33=12.50, LC65=7.25) at moment of Basic Info save. The 3 editable ECT classes do NOT map to cols 32–39. Also captured: BM does not appear in any of the 42 columns at all. |
| 6 | Legacy History view comparison | ECT NOT TRACKED in Legacy view either | Switched filter combobox `local-office-settings-history-select-type` to `Location Management Legacy History`. View has 44 headers (vs. 42 in primary). NO BM/HS/Labor Cost columns. Same Regular Hours / OT / DT / Holiday columns are present (44-col view's projection of the same JOIN target). For office 1604 the Legacy table returned `No results.` (zero rows) — definitive: ECT save tracking is absent across BOTH visible Location Management History views. |
| 7 | ECT value persistence RCA (cache vs silent write-failure vs MXN currency override) | **Silent server-side write-failure for `benefitMultiplier` field specifically** — bug filed `BUG-LOC-ECT-001` per LR-034 | (a) NOT a client cache: hard reload (`/navigator/locations/1604/settings/local-office` full navigation) at ~2026-04-21T10:42 still shows BM=0.0%. (b) NOT a currency override: sibling `subrentalPercent:0.08` in the SAME request body DID persist as HS=8.0% across the same hard reload. (c) IS a silent write-failure: server returned 200 + `{success:true}` for `benefitMultiplier:0.11`, but the value was never durable. The other 5 fields in the payload (`subrentalPercent`, `currencyId`, `locationId`, `internalLaborCost`, `externalLaborCost`) all behaved correctly. Filed at `reports/bugs/BUG-LOC-ECT-001.json`, severity HIGH. |
| 8 | Explicit baseline restore + post-reload verification | Restored & verified server-side | Restored sequence: Basic Info P18 toggle TRUE → FALSE → save (handles shared `Save Changes` dialog) → 200; ECT HS 8.0% → 0.0% via Fixed Costs save (POST `/ect-settings` 200, body `{…subrentalPercent:0, benefitMultiplier:0…}`); ECT LC33 12.50 → 0.00 + LC65 7.25 → 0.00 in single Labor Costs save (POST `/labour-costs-assumptions` 200). Hard reload at 2026-04-21T10:55 confirms server-side: BM=0.0%, HS=0.0%, LC0=0.00, LC33=0.00, LC65=0.00, both ECT Save buttons disabled, P18/Outside/Internal all unchecked, Basic Info Save disabled. Office 1604 byte-matches pre-session baseline (modulo the BM silent-write-failure which makes BM permanently un-mutable from this UI surface). |

### ECT persistence RCA section

**Classification**: silent server-side write-failure, scoped to `benefitMultiplier` field only.

**Evidence chain**:
1. Two independent saves attempted (SP-B-LO-2 parent BM 0.0%→21.0% AND SP-B-LO-2b BONUS BM 0.0%→11.0%). Both returned HTTP 200 + `{"success":true}` from POST `/navigator/api/location/ect-settings`. fetchWatch captured the request body in both cases — `benefitMultiplier:0.21` and `benefitMultiplier:0.11` respectively were definitely sent.
2. Tab-switch revert (BM → 0.0%, HS → unchanged-from-edit) is reproducible. So is the post-hard-reload revert.
3. The HS field rides the same POST request and DOES persist correctly through both tab switches and hard reloads. This rules out cache/network/currency theories (any of those would also affect HS).
4. The Labor Cost edits go to a DIFFERENT endpoint (`/labour-costs-assumptions`) and persist correctly. So the bug is endpoint-and-field-scoped — only `benefitMultiplier` on `/ect-settings`.

**Bug ticket**: `reports/bugs/BUG-LOC-ECT-001.json` — severity HIGH (financial field; cost assumptions drive billing). Distinct from class-level LOS-ECT-BUG-A (which is the absence of history rows).

**Compounding effect**: because LOS-ECT-BUG-A means ECT saves write zero history rows, the BM silent-write-failure also has zero audit trail. A field-level fix would still leave it un-auditable until LOS-ECT-BUG-A is also addressed (history-row tracking added, or ECT moved to a tracked save endpoint).

### Legacy History comparison section

| View | Header count | BM column? | HS column? | Labor Cost columns? | Office 1604 row count |
|---|---|---|---|---|---|
| Location Management History (primary, 42-col) | 42 | NO | NO | NO | 1440+ rows (1/72 pages × 20/page); ECT saves contribute zero rows |
| Location Management Legacy History (44-col) | 44 | NO | NO | NO | **0 (No results)** for office 1604 |

Conclusion: ECT save-tracking is absent across BOTH history views. There is no fall-back audit surface in the Local Office Settings UI. Combined with the BM silent-write-failure (BUG-LOC-ECT-001), a financially-significant field can be silently edited, silently lost, and silently un-recorded — the worst possible audit posture.

### Boolean-encoding registry update

_Still N/A for the 3 editable ECT classes — they remain numeric._ However, the PROBE incidentally re-confirmed LR-036 boolean encoding for the Local Office Settings primary 42-col history table: col 25 (Default Job 1-day Event Orders) renders TRUE as inline `<svg class="lucide lucide-check">` (textContent empty), FALSE as fully empty cell (also textContent empty). Detection requires `(await cell.innerHTML()).includes('lucide-check')` per LR-036, NOT `textContent`-based reads.

### Driver discovery (additions to parent session notes)

- ECT numeric inputs require **`computer.triple_click` → `computer.type` → `computer.key('Tab')` sequence** for the Angular FormControl to mark dirty. JS-level `setter + input/change/blur` event dispatch (the `__cat.typeNumber` driver pattern) does NOT trigger Angular's dirty state on the BM/HS/Labor Cost inputs — Save button stays disabled. The `triple_click` selects the existing value, `type` overwrites + dispatches the input event Angular listens for, and `Tab` triggers blur which finalizes the format mask (e.g. `0.00` → `0.00`, `8.0%` → `8.0%`).
- Tab switching on Radix tabs is **flaky** when the page is freshly reloaded — both `__cat.pointerClick` (full pointerdown/pointerup/click sequence on the tab element) and `computer.left_click` via element ref repeatedly failed to switch from Basic Info → ECT after a hard reload during this session. The reliable fallback was **`computer.left_click` at the visible screen coordinate** (e.g. (580, 65) for the ECT Settings tab on a 1568×710 viewport — note: the viewport-pixel coordinate is roughly 0.83× the DOM bounding-rect coordinate, suggesting devicePixelRatio≈1.2 or a viewport-scaling layer). When DOM-coord clicks fail post-reload, take a screenshot, eyeball the visible coordinate, and click that.
- Basic Info save uses **XMLHttpRequest, not fetch** — `__cat.fetchWatch` does NOT capture it. To verify a Basic Info save fired, observe the Save button transitioning from enabled → disabled (no click handler swallow) AND check the History tab for a new r0 timestamped at the save moment by my user. ECT Fixed Costs and Labor Costs saves DO use `fetch` — fetchWatch captures them cleanly.
- Save button disable after API 200 is reliable on Basic Info AND ECT — but Angular form pristine state is still NOT marked. LR-026 still applies: tab switches mid-session may surface an "Unsaved Changes" alertdialog. None did this session because saves were all completed before tab switches.

### Updated Deferred list

_Empty._ All 8 items closed. SP-B-LO-2b complete. SP-B-LO-R (Local Office reconciliation) and SP-C2 (ECT per-column TC implementation) are unblocked.

### Updated evidence ledger (session events appended)

| Event | Timestamp | URL / endpoint | Result |
|---|---|---|---|
| Driver re-install + ECT tab open + Phase 0 read | 2026-04-21 ~10:30 (UTC stamps in section above) | `/navigator/locations/1604/settings/local-office` ECT tab | OK; baseline reconcile: server-side BM=0.0%, HS=10.0% (parent SP-B-LO-2 HS save persisted), LC0=40 (parent persisted) |
| Legacy History combobox switch + read | 2026-04-21 ~10:31 | History tab → filter `Location Management Legacy History` | 44 headers, no BM/HS/LC cols, **No results** for office 1604 |
| P3 LC0 restore + direct verify (Item 1) | 2026-04-21T10:33:37Z | POST `/labour-costs-assumptions` | 200 `{success:true}`, post-save r0=04/21 10:31:39 Omeesha (PRE-DATES my save) → CONFIRMED NOT-TRACKED |
| LC33 edit + verify (Item 2) | 2026-04-21T10:34:57Z | POST `/labour-costs-assumptions` | 200, post-save r0=10:34:15 Omeesha → CONFIRMED |
| LC65 edit + verify (Item 3) | 2026-04-21T10:36:10Z | POST `/labour-costs-assumptions` | 200, post-save r0=10:34:15 Omeesha → CONFIRMED |
| BONUS BM+HS single Fixed Costs save (Item 4) | 2026-04-21T10:37:54Z | POST `/ect-settings` body w/ both fields | 200 `{success:true}`, post-save r0=10:37:22 Omeesha → CONFIRMED multi-field NOT-TRACKED |
| Tab-switch revert observation (Item 7 part A) | 2026-04-21 ~10:38 | History → ECT round-trip | BM reverted 11.0%→0.0%, HS persisted 8.0%, LC values persisted |
| Hard reload (Item 7 part B) | 2026-04-21 ~10:42 | full URL navigation | Server-side: BM=0.0% (NOT 11.0%), HS=8.0% (PERSISTED), LC0/33/65 PERSISTED → silent BM write-failure CONFIRMED |
| PROBE Basic Info P18 toggle + save (Item 5) | 2026-04-21T10:47:11Z | Basic Info save (XMLHttpRequest, not fetch) | NEW r0 by `v-rutvik.khosariya`, col 25 lucide-check TRUE, cols 32-39 IDENTICAL to baseline → ECT class state does NOT propagate into cols 32-39 |
| Restore: P18 → FALSE save (Item 8a) | 2026-04-21 ~10:48 | Basic Info save | 200, P18 unchecked, save disabled |
| Restore: HS → 0.0% save (Item 8b) | 2026-04-21 ~10:50 | POST `/ect-settings` `{…subrentalPercent:0, benefitMultiplier:0…}` | 200 |
| Restore: LC33 + LC65 → 0.00 save (Item 8c) | 2026-04-21 ~10:52 | POST `/labour-costs-assumptions` | 200 |
| Final hard reload baseline confirmation (Item 8d) | 2026-04-21 ~10:55 | full URL navigation | All ECT fields = 0.0% / 0.00, both saves disabled, Basic Info P18/Outside/Internal all unchecked → office 1604 fully restored to pre-session baseline |
| Bug filed | 2026-04-21 | `reports/bugs/BUG-LOC-ECT-001.json` | severity HIGH, status open |
