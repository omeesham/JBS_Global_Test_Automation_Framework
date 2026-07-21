# Hist Root Map — Local Office Settings History (Authoritative, 42 cols)

**Reconciled**: 2026-04-22
**Agent**: HUNTER (rutvik)
**Source sessions**: SP-B-LO-1 (Basic Info — 2026-04-20) + SP-B-LO-1b residual + SP-B-LO-1b retry #3 (2026-04-21) + SP-B-LO-2 (ECT — 2026-04-21) + SP-B-LO-2b direct verification (2026-04-21)
**Coverage**: 42/42 columns classified · 0 multi-writer conflicts · 0 unresolved orphans · 5 NOT-TRACKED bug candidates carried forward to SP-E-LO

## Indexing convention

This file uses **1-indexed columns (Col 1 … Col 42)** to match [SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2](../../../../plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md) (the authoritative 42-col header source). Source per-tab catalogs ([basic-info](hist-root-map-local-office-basic-info.md), [ect](hist-root-map-local-office-ect.md)) used **0-indexed cols (col 0 … col 41)**. Translation: `output_col_N == catalog_col_(N-1)`.

## Source-file status note

Both per-tab session catalogs are **superseded by this file** for downstream consumption (SP-C1, SP-C2). They remain on disk as historical evidence — do NOT delete; they hold per-parent timestamped MCP evidence that this file summarises but does not duplicate.

---

## Column-by-column Map

| Col # | Header | Primary parent | Tab | Control type | Status | Encoding |
|---|---|---|---|---|---|---|
| 1 | Local Office | (derived — office ID for the row) | n/a | n/a | DERIVED | plain int |
| 2 | Prep Date Offset | Prep Date Offset (P1) | Basic Information | integer text | TRACKED | plain int |
| 3 | Return Date Offset | Return Date Offset (P2) | Basic Information | integer text | TRACKED | plain int |
| 4 | Set Date Offset | Set Date Offset (P3) | Basic Information | integer text | TRACKED | plain int |
| 5 | Strike Date Offset | Strike Date Offset (P4) | Basic Information | integer text | TRACKED | plain int |
| 6 | Pickup Date Offset | Pickup Date Offset (P6) | Basic Information | integer text | TRACKED | plain int |
| 7 | Delivery Date Offset | Delivery Date Offset (P5) | Basic Information | integer text | TRACKED | plain int |
| 8 | Use Fulfillment | Use Fulfillment (P7) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 9 | Use Availability | Use Availability (P8) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 10 | Use Equipment QC | Use Equipment QC (P16) | Basic Information | checkbox | **PARENT-DISABLED-ON-1604** (BUG-LO-001) | svg (inferred — unconfirmed) |
| 11 | Print Desc | Print Description (P9) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 12 | Use Subrent | Use Subrent Service Type (P10) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 13 | Phone1 | Phone 1 (P11) | Basic Information | text | TRACKED | plain text |
| 14 | Phone2 | Phone 2 (P12) | Basic Information | text | TRACKED | plain text |
| 15 | Use Sect. | Use Section (P13) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 16 | Section Name | Section sub-table row op (P27) | Basic Information | sub-table | TRACKED | pipe-joined `name - true` (alphabetical, active rows only — see §Sub-table serialisation) |
| 17 | Sect. Action | (sub-table action label — non-state signal) | Basic Information | n/a | SUB-TABLE-ACTION | literal `"Update"` (always) |
| 18 | Logo Name | Company Logo (P26) | Basic Information | combobox | TRACKED | plain text |
| 19 | Use On Quote | Use On Quote / Logo (P14) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 20 | Use On Rental | Use On Rental / Logo (P15) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 21 | Service Type - Exempt | Service Type Exempt sub-table row op (P28) | Basic Information | sub-table | TRACKED | pipe-joined `name - true` (alphabetical, exempt rows only — see §Sub-table serialisation) |
| 22 | ST Action | (sub-table action label — non-state signal) | Basic Information | n/a | SUB-TABLE-ACTION | literal `"Update"` (always) |
| 23 | Action | (top-level record action label — non-state signal) | Basic Information | n/a | DERIVED / RECORD-ACTION | literal `"Update"` (always) |
| 24 | Notes | Notes textarea (P25) | Basic Information | textarea | **PARENT-NOT-PRESENT-ON-1604** (BUG-LO-003) | plain text (inferred — unconfirmed) |
| 25 | Marriott PMS Account Enabled | Marriott PMS Account (P17) | Basic Information | checkbox | **PARENT-NOT-PRESENT-ON-1604** (BUG-LO-002) | svg (inferred — unconfirmed) |
| 26 | Default Job to 1 day for Event Orders | Default Job 1-day Event Orders (P18) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 27 | Default Job to 1 day for Outside Orders | Default Job 1-day Outside Orders (P19) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 28 | Default Job to 1 day for Internal Orders | Default Job 1-day Internal Orders (P20) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 29 | Default Labor to Hourly | Default Labor to Hourly (P21) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 30 | Allow tentative and confirmed Status to have the same priority | Same Priority (P22) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 31 | Items Filled from Requests Return to Availability | Items Filled (P23) | Basic Information | checkbox | TRACKED | svg `lucide-check` |
| 32 | Default Order Type | Default Order Type (P24) | Basic Information | combobox | TRACKED | plain text |
| 33 | Regular Hours | (ECT-derived projection — written at Basic-Info-save) | (system) | (read-only projection) | SYSTEM-POPULATED at Basic-Info-save (LOS-ECT-BUG-A) | plain int |
| 34 | Regular Hours Multiplier | (ECT-derived projection) | (system) | (read-only projection) | SYSTEM-POPULATED at Basic-Info-save (LOS-ECT-BUG-A) | plain decimal |
| 35 | Over Time Hours | (ECT-derived projection) | (system) | (read-only projection) | SYSTEM-POPULATED at Basic-Info-save (LOS-ECT-BUG-A) | plain int |
| 36 | OverTime Hours Multiplier | (ECT-derived projection) | (system) | (read-only projection) | SYSTEM-POPULATED at Basic-Info-save (LOS-ECT-BUG-A) | plain decimal |
| 37 | Double Time Hours | (ECT-derived projection) | (system) | (read-only projection) | SYSTEM-POPULATED at Basic-Info-save (LOS-ECT-BUG-A) | plain int |
| 38 | DoubleTime Hours Multiplier | (ECT-derived projection) | (system) | (read-only projection) | SYSTEM-POPULATED at Basic-Info-save (LOS-ECT-BUG-A) | plain decimal |
| 39 | Holiday Multiplier | (ECT-derived projection) | (system) | (read-only projection) | SYSTEM-POPULATED at Basic-Info-save (LOS-ECT-BUG-A) | plain decimal |
| 40 | Recalc Labor Hours | (ECT-derived projection — checkbox surface lives on ECT tab) | (system) | (read-only projection of ECT checkbox) | SYSTEM-POPULATED at Basic-Info-save (LOS-ECT-BUG-A) | svg (inferred — unconfirmed) |
| 41 | Modified By | (derived — authenticated user email) | n/a | n/a | DERIVED | plain text |
| 42 | Modified On | (derived — save timestamp) | n/a | n/a | DERIVED | timestamp |

**Status legend**:
- **TRACKED**: parent edit produces a clean 1-col-plus-Modified-On diff in the history table (timestamped MCP evidence in the source per-tab catalog).
- **PARENT-DISABLED-ON-1604** / **PARENT-NOT-PRESENT-ON-1604**: parent control either disabled or absent on the test office; column exists in the schema but cannot be exercised via UI on this office. Bug candidate.
- **SUB-TABLE-ACTION**: column is a literal record-action label (`"Update"`) and never carries state-change signal. Per-column TCs MUST NOT treat its value as evidence of change.
- **DERIVED** / **DERIVED / RECORD-ACTION**: column is system-derived (office ID, top-level action label, auth user, timestamp) and not a parent-driven write.
- **SYSTEM-POPULATED at Basic-Info-save**: column reflects an ECT-derived projection captured at Basic-Info-save time. ECT saves do NOT write to this column (LOS-ECT-BUG-A — class-wide save-level NOT-TRACKED for the 3 editable ECT classes).

---

## Multi-writer columns (one column written by multiple parents from different tabs)

_None._ Reconciliation pass found zero columns claimed by parents from different tabs. The 8 ECT-related columns (33–40) are written ONLY by the system at Basic-Info-save time; the 3 editable ECT parent classes (Benefits Multiplier, Historical Subrental %, Labor Cost) do NOT write to any of cols 33–40 — confirmed by SP-B-LO-2b PROBE 2026-04-21T10:47:11Z (Basic Info save with active server-persisted ECT class state still produced cols 33–40 IDENTICAL to baseline).

---

## Orphan / System-populated columns

| Col | Header | Classification | Notes |
|---|---|---|---|
| 1 | Local Office | DERIVED | Office ID for the row — not a parent-driven column. |
| 17 | Sect. Action | SUB-TABLE-ACTION | Always literal `"Update"`; never a state-change signal. Per-column TCs filter out. |
| 22 | ST Action | SUB-TABLE-ACTION | Always literal `"Update"`. Same handling as col 17. |
| 23 | Action | DERIVED / RECORD-ACTION | Top-level record action label, always literal `"Update"`. Same handling as col 17/22. |
| 33 | Regular Hours | SYSTEM-POPULATED at Basic-Info-save | ECT-derived projection. ECT saves do NOT write. LOS-ECT-BUG-A. |
| 34 | Regular Hours Multiplier | SYSTEM-POPULATED at Basic-Info-save | Same as col 33. |
| 35 | Over Time Hours | SYSTEM-POPULATED at Basic-Info-save | Same as col 33. |
| 36 | OverTime Hours Multiplier | SYSTEM-POPULATED at Basic-Info-save | Same as col 33. |
| 37 | Double Time Hours | SYSTEM-POPULATED at Basic-Info-save | Same as col 33. |
| 38 | DoubleTime Hours Multiplier | SYSTEM-POPULATED at Basic-Info-save | Same as col 33. |
| 39 | Holiday Multiplier | SYSTEM-POPULATED at Basic-Info-save | Same as col 33. |
| 40 | Recalc Labor Hours | SYSTEM-POPULATED at Basic-Info-save | ECT-tab checkbox surface; never written by ECT save. |
| 41 | Modified By | DERIVED | Authenticated user email — same value across all rows of one user's session. |
| 42 | Modified On | DERIVED | Save timestamp — used as primary sort key for history reads. |

14 of 42 cols are derived / sub-table-action / system-populated. 28 of 42 are parent-driven (25 TRACKED via Basic Info parents + 3 PARENT-ABSENT-ON-1604 bug candidates). Subplan §Method ≤3-orphan rule does NOT apply here — all 14 orphans have explicit, evidenced provenance from the upstream catalog sessions; none requires a hunt (SP-B-LO-3 is NOT spawned).

---

## NOT-TRACKED registry (FINAL — feeds SP-E-LO)

| Bug ID | Surface | Affected col(s) / parent | Severity | Source | Required-by-LR-034 fields available |
|---|---|---|---|---|---|
| **BUG-LO-001** | Local Office Settings → Basic Information tab | Col 10 "Use Equipment QC" / parent `local-office-settings-checkbox-use-equipments-qc` (note **plural** "equipments") | medium (need scope confirmation — per-office role-based or global?) | [hist-root-map-local-office-basic-info.md §Residual Parents (SP-B-LO-1b)](hist-root-map-local-office-basic-info.md) row P16 | id, title, module, severity, status, discoveredDate, requirementSource (MODULE_REGISTRY 42-col header schema), stepsToReproduce, expectedBehavior, actualBehavior, mcpEvidence (DOM `disabled=true / aria-disabled=true` on office 1604) |
| **BUG-LO-002** | Local Office Settings → Basic Information tab | Col 25 "Marriott PMS Account Enabled" / parent (no DOM element on 1604) | medium (conditional-render vs orphan-column hypothesis) | [hist-root-map-local-office-basic-info.md §Residual Parents (SP-B-LO-1b)](hist-root-map-local-office-basic-info.md) row P17 | full LR-034 set available; `mcpEvidence` = zero `[data-testid*="marriott"]` / zero `[data-testid*="pms"]` / zero "Marriott"/"PMS" text on Basic Info page for office 1604 |
| **BUG-LO-003** | Local Office Settings → Basic Information tab | Col 24 "Notes" / parent (no DOM element on 1604) | medium (conditional-render vs orphan-column hypothesis) | [hist-root-map-local-office-basic-info.md §Residual Parents (SP-B-LO-1b)](hist-root-map-local-office-basic-info.md) row P25 | full LR-034 set available; `mcpEvidence` = zero `<textarea>` on Basic Info form, zero "notes" text content, zero `[data-testid*="notes"]` |
| **LOS-ECT-BUG-A** | Local Office Settings → ECT Settings tab | All 3 editable ECT parent classes (Benefits Multiplier 1 field + Historical Subrental % 1 field + Labor Cost 66 fields = **68 distinct editable inputs**) — none surface in 42-col history at save level | high (financial — labor rate / cost assumptions un-audited) | [hist-root-map-local-office-ect.md §Save-level tracking status](hist-root-map-local-office-ect.md) | full LR-034 set available; `mcpEvidence` = SP-B-LO-2 + SP-B-LO-2b sessions — every ECT save returns 200 + `{success:true}` to POST `/navigator/api/location/ect-settings` (BM, HS) or POST `/navigator/api/location/labour-costs-assumptions` (LC), pagination `1/72 → 1/72`, post-save r0 timestamp ALWAYS pre-dates the save timestamp; class-wide directly verified via row-0/row-33/row-65 Labor Cost exemplars + multi-field BONUS save; Legacy Location Management History view also empty for office 1604 (no fall-back audit surface) |
| **BUG-LOC-ECT-001** *(cross-link only — already filed)* | Local Office Settings → ECT Settings tab → Fixed Costs Save | `benefitMultiplier` field on POST `/navigator/api/location/ect-settings` | high (silent server-side write-failure for a financial field — API returns 200 + `{success:true}` but value is never durable; sibling `subrentalPercent` in same payload DOES persist) | [reports/bugs/BUG-LOC-ECT-001.json](../../../../reports/bugs/BUG-LOC-ECT-001.json), [hist-root-map-local-office-ect.md §ECT persistence RCA section](hist-root-map-local-office-ect.md) | already-filed bug; cross-listed here because (a) it shares the ECT surface with LOS-ECT-BUG-A, and (b) it compounds with LOS-ECT-BUG-A — even when the value would persist, no history row would be written, so the silent-failure has zero audit trail |

### Newly discovered Basic Info fields with no 42-col history column (NOT-TRACKED candidates pending requirement check)

These three Basic Info fields exist on the form but do NOT map to any of the 42 history columns. They are CANDIDATE NOT-TRACKED bugs — must cross-check `clients/encore/docs/REQUIREMENTS.md` to confirm whether the requirement is "should be tracked"; if yes, they need their own bug IDs filed in SP-E-LO.

| Field | Testid | Baseline (1604) | Source |
|---|---|---|---|
| PO Number | `local-office-settings-input-po-number` | *(empty)* | [hist-root-map-local-office-basic-info.md §Newly discovered Basic Info fields (not in 42-col history)](hist-root-map-local-office-basic-info.md) |
| PO Number Label | `local-office-settings-input-po-number-label` | *(empty)* | same |
| Room Configuration sub-table | `local-office-settings-table-room-configurations` (testid pattern; per snapshot 3+ rows: Ballroom A / Room Edit Test / Room Toggle Test) | 3 active rows | same |

These are deliberately NOT given final bug IDs in this reconciliation — SP-E-LO must do the requirement cross-check first.

---

## Duplicate-header registry

_None._ Re-checked all 42 headers across the merged catalog. Both source per-tab catalogs declared "no duplicates" in their respective sessions; the union view confirms zero identical-text duplicates among Local Office Settings History headers. (Note: header text for cols 26/27/28 are similar — "Default Job to 1 day for Event Orders" / "…Outside Orders" / "…Internal Orders" — but each is DISTINCT text, not a duplicate. Per-column TCs disambiguate by matching the FULL header text.)

---

## Boolean-encoding registry (per LR-036)

All boolean Local Office Settings History cells use **SVG encoding** (`<svg class="lucide lucide-check">` for TRUE, fully empty `<td>` for FALSE). Detection pattern (per LR-036): `(await cell.innerHTML()).includes('lucide-check')` for TRUE; `(await cell.innerHTML()).trim() === ''` for FALSE. `textContent` returns empty string for BOTH states and MUST NOT be used.

| Col | Header | Encoding | Confirmation status |
|---|---|---|---|
| 8 | Use Fulfillment | svg | **CONFIRMED** (SP-B-LO-1 P7 evidence row 13:13:02) |
| 9 | Use Availability | svg | **CONFIRMED** (SP-B-LO-1 P8 evidence row 13:14:22) |
| 10 | Use Equipment QC | svg | **unconfirmed** — parent disabled on 1604 (BUG-LO-001); inference is the histogram match against confirmed cols 8/9/11/12 |
| 11 | Print Desc | svg | **CONFIRMED** (SP-B-LO-1 P9 evidence row 13:23:32) |
| 12 | Use Subrent | svg | **CONFIRMED** (SP-B-LO-1 P10 evidence row 13:24:17) |
| 15 | Use Sect. | svg | **CONFIRMED** (SP-B-LO-1 P13 evidence row 13:29:23) |
| 19 | Use On Quote | svg | **CONFIRMED** (SP-B-LO-1 P14 evidence row 13:30:15) |
| 20 | Use On Rental | svg | **CONFIRMED** (SP-B-LO-1 P15 evidence row 13:31:11) |
| 25 | Marriott PMS Account Enabled | svg | **unconfirmed** — parent absent on 1604 (BUG-LO-002); inference only |
| 26 | Default Job to 1 day for Event Orders | svg | **CONFIRMED** (SP-B-LO-1b retry #2 P18 evidence row 05:18:29 PM; SP-B-LO-1b retry #3 reverse row 07:35:23 PM; SP-B-LO-2b PROBE re-confirmation row 10:47:11Z) |
| 27 | Default Job to 1 day for Outside Orders | svg | **CONFIRMED** (SP-B-LO-1b retry #3 P19 evidence row 07:39:11 PM) |
| 28 | Default Job to 1 day for Internal Orders | svg | **CONFIRMED** (SP-B-LO-1b retry #3 P20 evidence row 07:41:10 PM) |
| 29 | Default Labor to Hourly | svg | **CONFIRMED** (SP-B-LO-1b retry #3 P21 evidence row 07:42:01 PM) |
| 30 | Allow tentative and confirmed Status to have the same priority | svg | **CONFIRMED** (SP-B-LO-1b retry #2 P22 evidence row 04:54:18 PM) |
| 31 | Items Filled from Requests Return to Availability | svg | **CONFIRMED** (SP-B-LO-1b retry #3 P23 evidence row 07:43:05 PM) |
| 40 | Recalc Labor Hours | svg | **unconfirmed** — ECT scope; never directly verified because (a) cols 33–40 are SYSTEM-POPULATED at Basic-Info-save and (b) ECT save itself doesn't write here; inference rests on the LR-036 surface-wide rule for Local Office Settings History |

`assertBooleanCell` MUST use `encoding: 'svg'` for every Local Office Basic Info boolean column. Two cells (10, 25) are unconfirmed pending bug resolution; one cell (40) is unconfirmed pending an ECT-write-path future test (likely won't materialise unless LOS-ECT-BUG-A is fixed). Per-column TCs for cols 10, 25, 40 may need to be `test.skip` with bug-blocked annotations until parent visibility / write-path is restored.

---

## Sub-table serialisation (cols 16, 21)

- **Col 16 "Section Name"**: active rows only (`active=true` → `{name} - true`), pipe-separated (` | ` with spaces around the pipe), **alphabetical order**. Per-column TCs MUST assert on **set membership** (e.g. `value.includes("Power - true")`) rather than exact-string match because order varies AND new rows can be added/removed via sub-table operations.
- **Col 21 "Service Type - Exempt"**: exempt rows only (`exempt=true`), pipe-separated, **alphabetical order**. Same set-membership guidance applies.
- See [hist-root-map-local-office-basic-info.md §Sub-table encoding observations (retry #3)](hist-root-map-local-office-basic-info.md) for full evidence including baseline values.

---

## Coverage summary

| Grouping | Count | % of 42 |
|---|---|---|
| TRACKED — parent-driven, save-cycle MCP-evidenced | 25 | 60% |
| PARENT-DISABLED / PARENT-NOT-PRESENT on 1604 — bug candidates BUG-LO-001/002/003 | 3 | 7% |
| SYSTEM-POPULATED at Basic-Info-save — ECT-derived projection (LOS-ECT-BUG-A surface) | 8 | 19% |
| DERIVED / SUB-TABLE-ACTION / RECORD-ACTION | 6 | 14% |
| **TOTAL** | **42** | **100%** |

ECT save-level NOT-TRACKED scope: **68 distinct editable ECT inputs** (BM 1 + HS 1 + LC 66) — none of which appear in the 42-col history at save level (LOS-ECT-BUG-A). This is parallel to (not double-counted with) the 8 SYSTEM-POPULATED cols above; SYSTEM-POPULATED cols project a DIFFERENT ECT-related read-only surface, NOT the editable inventory.

---

## Gate Check

- [x] All 42 columns classified
- [x] Zero conflicts unresolved (zero multi-writer; all orphans evidenced)
- [x] NOT-TRACKED entries have bug candidate IDs (BUG-LO-001, BUG-LO-002, BUG-LO-003, LOS-ECT-BUG-A; BUG-LOC-ECT-001 cross-linked; PO Number / PO Number Label / Room Configuration carried as candidates pending REQUIREMENTS cross-check)
- [x] Every boolean column has encoding tag (svg confirmed for 12 cols; svg unconfirmed-but-tagged for 3 cols with stated bug-blocked / inference rationale)

---

## Downstream consumption

- **SP-C1** (Local Office Basic Info per-column TC implementation): consumes cols 1–32 + 41–42 from this file. Cols 10/24/25 → `test.skip('bug-blocked: BUG-LO-001/003/002')`. Cols 17/22/23 → no per-column TC needed (literal label). Col 1/41/42 → derived, no per-column TC needed.
- **SP-C2** (Local Office ECT per-column TC implementation): cols 33–40 are SYSTEM-POPULATED — TCs assert that a Basic-Info save snapshots current ECT state (PROBE pattern). The 3 editable ECT classes are NOT-TRACKED at save level — covered as negative TCs (`assert no new history row after ECT save`, per LOS-ECT-BUG-A).
- **SP-E-LO** (batch bug filing): receives BUG-LO-001/002/003 + LOS-ECT-BUG-A; cross-links BUG-LOC-ECT-001 (already filed); evaluates PO Number / PO Number Label / Room Configuration after REQUIREMENTS cross-check.

---

## Audit anchors

| Claim | Evidence file | Section |
|---|---|---|
| 42-col header list (1-indexed) | [SUBPLAN_HISTORY_01_MCP_FINDINGS.md](../../../../plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md) | §2 Local Office Settings History |
| 23 Basic Info parents TRACKED + 3 DOM-only (P16/P17/P25) | [hist-root-map-local-office-basic-info.md](hist-root-map-local-office-basic-info.md) | §Parent → Column Map (P1–P15), §Residual Parents (SP-B-LO-1b) (P16/P17/P25), §Residual Parents (SP-B-LO-1b retry session) (P18/P22), §Residual Parents (SP-B-LO-1b retry #3) (P19/P20/P21/P23/P24/P26/P27/P28) |
| 3 ECT classes class-level NOT-TRACKED + cols 33–40 PROBE-confirmed | [hist-root-map-local-office-ect.md](hist-root-map-local-office-ect.md) | §Save-level tracking status, §Direct Verification Session (SP-B-LO-2b) Items 1–5 |
| BUG-LOC-ECT-001 silent write-failure for `benefitMultiplier` | [reports/bugs/BUG-LOC-ECT-001.json](../../../../reports/bugs/BUG-LOC-ECT-001.json) | (file in full) |
| Boolean encoding = svg `lucide-check` (per LR-036) | [clients/encore/CLAUDE.md](../../../CLAUDE.md) | LR-036 |
