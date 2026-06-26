# Excel Revert Recovery — Per-Cell Decision & Deviation Log
**Date**: 2026-06-10 · **Plan**: PLAN_EXCEL_REVERT_RECOVERY · **Identity**: OWNER
**Recovery scope (user-chosen, AskUserQuestion 2026-06-10)**: Option 1 — clean-recoverable + jargon scrub; leave cosmetic step formatting; log every per-cell decision.
**Backup**: ~/encore_backups/recover_20260610-141027/ (all MD + 3 xlsx + blocked-reasons.json + wiring + CD oracle x_45be5528.xlsx)

## Phase 1 — Notes structural fix (locations_notes_test_cases.md)
- Deleted 6 HIST col-69 blocks (was NTS-028,029,030,031,032,038) — coverage already relocated to TC-LOC-MGH-020..025 (verified present in management_history sheet). 64→58 blocks.
- Renumbered: 033-037 → 028-032 (−5); 039-064 → 033-058 (−6). Result: contiguous 001-058, numeric order (matches CD-0608 row order).
- Titles: every block title set to spec test() title (54) else CD-0608 title (4: 013/018/019/020). 0 spec≠CD mismatches.
- Reordered post-divider FCC blocks to numeric order (ex-062/063/064 were mid-document → moved to 056/057/058 tail).
- Stale-prose fixes: HIST section header+intro removed; "Numbering gaps" line replaced (no gaps now); loose SUBPLAN_XLSX_PREP_01 meta paragraph removed; NTS-053 Expected ref "TC-LOC-NTS-038 in the History spec" → "TC-LOC-MGH-025 in the Location Management History spec"; header Total 63→58.
- Content conserved: Steps/Expected/Data markers 64→58 (exactly the 6 HIST removed).

## DEVIATIONS FROM PLAN (what + why)
1. **Plan said "restore steps/expected from backup-MD-0605"** → NO-OP discovered: backup-0605 MD is byte-identical to current MD for steps (verified BAS-053). Backup recovers nothing; clean 06-08 MD is gone (gitignored+reverted). Title authority = spec test() titles (==CD), not backup MD.
2. **Plan said "delete locations_left_panel SHEET_NAMES entry in to-xlsx.ts"** → no such entry exists (only locations_left_panel_basic_information). Orphan resolved by default fall-through; removed via MD delete + sheet-name test ref.
3. **cur↔CD step/expected diffs are build-pipeline (parser) formatting, NOT MD-content reversions** (parser unchanged commit-wise, but CD's clean 06-08 MD had different bullet indentation). Left as-is per user Option 1 (cosmetic, no client-visible word difference).

## Phase 2 — left_panel orphan removal
- Deleted `locations_left_panel_test_cases.md` (24 TCs TC-LOC-LP-001..024 — full subset-duplicate of `locations_left_panel_basic_information_test_cases.md`'s 27; produced all 24 cross-sheet dup IDs in BEFORE fingerprint).
- Removed its assertion in `scripts/to-xlsx-sheet-name.test.ts` (line 37) + stale "13 current sheet names" comment; test re-run PASS.
- `to-xlsx.ts` doc-comment sheet list corrected (left_panel → left_panel_basic_info; corp sheets noted). NO SHEET_NAMES entry existed (plan deviation #2).

## Phase 3 — title restoration (43 titles, all spec==CD verified, 0 mismatches)
- SSL ×17, local_office BAS ×6, LGL-019, ACC-021, PRI-035, LI ×11, MGH-020..025 ×6 — every block header set to spec test() title (where spec exists) else CD-0608 title. Evidence: .recover-scratch/TITLE-PLAN.txt.

## Phase 3/4 — content cells (per-cell decisions, Option 1 scope)
| Cell | Decision | Why |
|---|---|---|
| LGL-019 Steps/Expected/Data/Notes | REWRITTEN to CD-clean text | Revert restored the internal FCC-pilot block (sentinel names, runner calls, "Negative enumeration"/"dom tamper" jargon). CD-0608 cells prove the clean 06-08 form; internal rationale stays in field-case-catalogs/legal-2026-05-27.md §TC-019 (HTML comment pointer left in MD). |
| legal "Execution Notes:" trailing section | RENAMED to "Execution reference:" | Parser's loose `Notes:` regex swallowed this section into LGL-019's xlsx Notes cell (selector/test-id leak into client deliverable). Rename kills the leak class. |
| PRI-002 Notes | "Verified live:" prefix dropped → CD text | process-language scrub |
| PRI-033 Notes | → CD text ("Not yet verified - pending resolution of a server error on save.") | test-implementation jargon ("the assertion will fail") scrubbed |
| LI-NE-044..047 Notes | RESTORED CD text ("Kept as a manual check - ...") ×4 | blank-vs-content = data loss, exact CD text known; plan matrix says LI notes ← CD |
| ACC-029 reason | RESTORED via blocked-reasons.json (Blocked + Phone-2 reason) | spec still test.fixme with this exact reason; blank was revert damage |
| NTS-056 reason | RESTORED via blocked-reasons.json (Blocked + Delete-control reason) | spec NTS-056 still test.fixme; pre-fix the blank+Blocked sat on the WRONG row (ID-join skew between spec clean numbering and reverted 64-numbering — resolved by the renumber) |
| SSL-007/030 reasons | KEEP current | cur==CD, already correct (5f21f0e2) |
| LI Automation-Execution + If-Failed-Reason (10+10) | KEEP current | 06-09 blocked-reason work, lives in blocked-reasons.json, newer than CD |
| MGH-020..025 Steps/Expected | KEEP current | CD's are garbled ("2. 3. Make…"); current is the 06-09 rework — plan-verified |
| LGL-010 Expected, SSL steps/notes wording (001/004/012/030/044), LI newline-vs-space Exp cells, NTS "row 0" phrasing, LI-007/060 canEditLoc | LEAVE as-is | cosmetic wording/formatting, no jargon delta vs CD, CD itself carries same or equivalent phrasing; Option 1 scope excludes wording reconstruction |

## Phase 6 — TestRail deviation
4. **Plan said "surgical — add, not regenerate"** → executed as full regen via `scripts/_gen-testrail.ts` (the script the plan itself names; its SHEET_META was pre-extended with the 3 corp sheets). Justification: the existing TestRail file was generated 06-08 from the CLEAN deliverable, so regen-from-recovered-deliverable reproduces it; verified post-regen that ALL 16 prior sheets' TC-ID sets are byte-identical to the before-snapshot (.recover-scratch/testrail-before-ids.json), 11-col uniform, Notes=58, and the only new content is the 3 corp sheets (30/28/17) grouped with the existing corp block. Substance of "leave other sheets as-is" preserved; cell text refreshed only by the recovery deltas this plan mandates.

## Phase 7 — guardrail implementation notes
- Guardrail (a) cross-sheet-dup = CRITICAL/exit-1; (b) content-mismatch = FLAG (non-fatal) per module, escalating to CRITICAL only on the combined revert signature (≥50% of shared titles grossly divergent AND ≥5 TCs AND workbook numbering exceeding spec max). Thresholds: overlap<0.34 = gross.
- NEGATIVE-TESTED against the actual broken pre-recovery workbook: guardrail (a) fired (24 LP dups), guardrail (b) fired CRITICAL (TC-LOC-NTS 31/58 divergent + 6 IDs beyond spec max). Recovered workbook: PASS with 9 benign FLAGs (spot-checked 4: xlsx==CD golden; divergence is spec-side shorthand vs client-facing titles — intentional).
- Self-test embedded (assertContentMismatchDetectorWorks) following the existing assertHeaderRegexCovers3SegmentPrefixes pattern.

## Adjacent-Sweep dispositions (Phase 2.5)
| Item | Disposition |
|---|---|
| "Execution Notes:" parser-leak class (legal MD) | DO-NOW — renamed to "Execution reference:"; repo-wide grep: 0 other instances |
| CPR-523 Blocked-no-reason C3 warn | DO-NOW — blocked-reasons.json entry from spec fixme title; lint now 0 warnings |
| build-framework-vendor.ts pre-existing typecheck errors (deprecated file, untouched) | LR-040(b) — already grep-verifiable in plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md:122,168 |
| "new site" wording in 5 LI cells (CD golden carries it too — net-new cleanup) | SPAWN — task_e8126404 |
| encore-qa-tracker.xlsx stale refs | checked — 0 hits, no action |
