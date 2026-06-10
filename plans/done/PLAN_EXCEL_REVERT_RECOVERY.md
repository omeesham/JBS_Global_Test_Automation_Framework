# PLAN — Recover latest-clean data per sheet in both Encore excels + sync TestRail

> **Status**: DONE
> **Executed**: 2026-06-10
> **Owner**: OWNER · **PermissionMode**: acceptEdits · **Model**: Opus · **Thinking**: ultrathink
> **Created:** 2026-06-09 · Scratch origin: `~/.claude/plans/fancy-plotting-seahorse.md`
> **Self-review:** plan claims red-flag-audited against live artifacts this session (corrections folded in — see *Plan-claim verification* footer).

## Context (why) — evidence-backed
A restore overwrote the **gitignored** test-case markdown with an older snapshot. Because the MD is
gitignored, git could not track the rollback — so the damage rode silently into the **committed**
workbook. Verified live this session (not inferred):

- **Last clean full workbook = commit `45be5528` (2026-06-08, "CD")** — Notes 58 contiguous
  (NTS-001..058, 0 HIST), **no `locations_left_panel` orphan**, clean §3 titles. Local ancestor of
  HEAD (`git show 45be5528:…`), no remote needed. The 06-06 per-module deliverable branches
  (notes verified cell-identical; ssl/legal/account/corp confirmed by row-count + sampled titles)
  corroborate it. **Caveat:** CD is not flawless — its MGH-020..025 steps are garbled (`"2. 3. Make…"`),
  so CD is the golden target for *reverted* modules only, never a blind whole-workbook source.
- The revert landed **between `45be5528` (06-08) and `75e27daa` (06-09)**. `75e27daa` rebuilt the
  workbook from the reverted MD → baked **Notes=64 + HIST-col-69 cases (028-032/038) + the
  `locations_left_panel` orphan** into the committed file. `check:tc-parity` stayed green because it
  is **ID-set only** (content/title blind).
- **Current working tree = `75e27daa` + the `5f21f0e2` blocked-reason updates + 2 new corp sheets**
  (override 28, toolbar_io 17; new_pricebook 30 already in HEAD). Verified delta vs `75e27daa`:
  SSL-007/030 gained the correct **Blocked + reason** (keep); **but ACC-029 + NTS-056 reasons went
  blank** where `75e27daa` had real text → **2 possibly-dropped reasons to verify**. Workbook is
  **vocab-lint CLEAN** (live `lintWorkbook`: 0 vocab, 0 integrity, 3 non-fatal C3 warns).
- **The state is a hybrid**, not a clean rollback: structure + titles + many Steps reverted, BUT the
  06-09 improvements (MGH-020..025 rework, LI/SSL blocked-reasons, vocab scrubs, 3 new corp sheets)
  are present. So we can neither blind-restore from CD nor keep current — it is a per-sheet,
  partly per-cell merge.

**Goal:** for **each sheet use the latest *clean* data** — recover the maximum (even minor title/step
changes), fix the revert damage, preserve every legit 06-09 change, finish the TestRail update, then
guardrail so it cannot recur.

## Recovery sources (ranked) + what each is authoritative for
| Source | Date | Authoritative for |
|---|---|---|
| **CD `45be5528`** (last clean full workbook, local) | 06-08 | clean **target** for REVERTED sheets (titles/steps/structure) — except its garbled MGH-020..025 |
| Per-module branches `encore_deliverables_test` (notes/ssl/legal/account/corp) | 06-06 | corroborate CD for shipped modules (tie-break) |
| **Spec files** `clients/encore/tests/**/*.spec.ts` (git-tracked, NOT reverted) | live | clean **title** authority + the parity oracle (note: 54/58 Notes cases have a spec test; the other 4 use CD) |
| **Backup MD** `~/encore_backups/testrail_20260605-204340/md_setup/` (16 files) | 06-05 | full-fidelity **Steps/Expected** restore reference (its Notes is intermediate — use spec/CD for Notes) |
| **blocked-reasons.json** `export_test_cases/` (git-tracked) | 06-09 | source-of-truth for Blocked reason text (resolves the ACC-029/NTS-056/SSL-007/030 cells) |
| **Current MD + xlsx** (working tree) | 06-09 | the **06-09 overlays to KEEP** (MGH rework content, LI/SSL reasons, vocab-clean cells, 3 new corp sheets) |

## Per-sheet decision matrix (the core of "latest per sheet")
*107 shared rows differ CD↔current, +75 new-corp rows, +24 orphan rows, +6 ex-HIST notes rows.*

| Sheet | Δ rows (CD↔cur) | Direction | Action |
|---|---|---|---|
| `locations_notes` | 43 + 6 orphan-of-HIST | **CD clean / cur reverted** | remap 64→58, delete 6 HIST blocks, titles ← spec (else CD) |
| `locations_left_panel` (orphan) | +24 only-in-cur | absent in every clean source | **remove** sheet + MD + wiring |
| `locations_shared_setup_location` (SSL) | 20 (17 title,3 step,2 note) | CD clean | restore titles/steps ← CD+backup; **keep** SSL-007/030 06-09 Blocked reason |
| `local_office_settings` | 6 (6 title,2 step) | CD clean | restore titles/steps ← CD+backup |
| `locations_legal` | 2 (title,step,expected,note) | CD clean | restore ← CD+backup |
| `locations_account_address` | 2 (1 title,1 reason) | title ← CD; **reason = verify** | restore title; **verify ACC-029 blank** (dropped vs `75e27daa`) against blocked-reasons.json |
| `locations_pricing` | 3 (1 title,2 note) | CD clean | restore ← CD+backup |
| `locations_local_information` (LI) | 24 (11 title,8 exp,5 note / **10 exec,10 reason**) | **MIXED** | titles/expected/notes ← CD; **exec+reason = keep cur** (06-09 blocked-reason work) |
| `locations_management_history` (MGH) | 7 (all cols) | **cur content newer; CD titles cleaner** | **keep cur Steps/Expected** (CD garbled); reconcile MGH-020..025 **titles** to spec/§3 ("Verify " prefix) |
| `corporate_pricing_new_pricebook/override/toolbar_io` | +75 only-in-cur | cur new | **keep**; add override+toolbar to TestRail |
| `locations_notes` NTS-056 reason | (cell) | **verify** | NTS-056 reason blank vs `75e27daa` → confirm against blocked-reasons.json (restore if dropped) |
| corp detail/search/strategy, currency, auto_addon, ect, history, left_panel_basic_info | 0 | identical | untouched |

## Phases

**Phase 0 — SAVE PROGRESS FIRST (hard gate before any edit).** Timestamped backup so nothing is lost:
copy both `test_cases_xlsx/*.xlsx`, every current `specs_planning/test-cases/setup/**/*_test_cases.md`,
`export_test_cases/blocked-reasons.json`, and the to-xlsx wiring files into `~/encore_backups/recover_<ts>/`;
also snapshot the extracted oracles (`x_45be5528.xlsx`, 06-06 branch xlsx). **No edit proceeds until this exists.**

**Phase 1 — Fix Notes MD (structural).** On `locations_notes_test_cases.md`: delete the 6 HIST blocks
(028-032/038), apply the validated remap (033-037→028-032, 039-064→033-058) to block IDs + `Depends_On`
+ in-text refs, fix the stale "(HIST … deferred to NTS-038)" parentheticals, set each survivor title to
the **spec** title where a spec test exists (else CD). Result: 58 contiguous, 0 HIST. Golden = CD/notes-branch.

**Phase 2 — Remove left_panel orphan.** Delete `locations_left_panel_test_cases.md` + its `SHEET_NAMES`
entry in `export_test_cases/to-xlsx.ts` + the `scripts/to-xlsx-sheet-name.test.ts` ref (`_basic_info`
superset + its spec untouched).

**Phase 3 — Restore reverted titles/steps (SSL, legal, account, local_office_settings, pricing).**
For each CD-clean row, restore the clean title/step/expected/notes into the MD, sourcing exact text from
**backup MD** (full Steps/Expected — avoids importing CD's humanized garbles) and confirming title against
CD + spec. These are the "even minor changes" recoveries. Do **not** touch the 06-09 reason cells.

**Phase 4 — Resolve the MIXED / verify cells per-cell.**
- LI: restore titles/expected/notes ← CD; **keep** current Automation-Execution + If-Failed-Reason.
- MGH-020..025: keep current Steps/Expected (CD garbled); reconcile titles to spec/§3.
- **Reason-cell verifies (4):** SSL-007/030 = keep current Blocked (correct, `5f21f0e2`). ACC-029 + NTS-056
  blank vs `75e27daa` → check `blocked-reasons.json` + the spec's `test.fixme`: if still blocked, restore
  the reason; if genuinely no longer blocked, blank is correct. Decide from evidence, log each decision.
- Every per-cell decision recorded in a plan-deviation log (what + why) for audit.

**Phase 5 — Rebuild + golden-gate.** `npm run xlsx:build` → `xlsx:lint` → `check:tc-parity`. **Golden
acceptance:** rebuilt **REVERTED-module** sheets == CD-0608 (id→title→steps→expected); MGH/LI mixed-cells
match their per-cell decision (NOT blanket ==CD); Notes == spec (58, 0 HIST); new corp sheets + 06-09
overlays preserved; **0 cross-sheet dup IDs**; no `locations_left_panel` sheet; lint clean (0 vocab/0
integrity). Any residual cell equal to neither a clean target nor a documented overlay = investigate.

**Phase 6 — Update TestRail (surgical — add, not regenerate).** Add the 3 new corp sheets (New Pricebook /
Override / Toolbar) via `scripts/_gen-testrail.ts`, grouped after existing corp sheets; keep the uniform
11-col schema. Verify TestRail Notes reconciles to the fixed 58; leave all other TestRail sheets as-is.

**Phase 7 — Guardrail + regression matrix.** New validator wired into `check:tc-parity`: (a) **fail on any
TC ID in >1 sheet** (catches the orphan class); (b) **flag gross spec↔xlsx content mismatch** (low
token-overlap + id-set drift — catches the Notes class). Then re-verify the regression matrix below.

## Regression matrix (issues fixed in past-week plans — confirm none reappeared)
| Fixed issue (plan/commit) | Check |
|---|---|
| Notes re-ID 6 HIST→MGH-020..025 + renumber (`PLAN_TESTRAIL_DEMO…RETITLE`, 06-05) | **REGRESSED** → Phase 1; assert MGH-020..025 not in Notes ID space |
| left_panel cross-sheet dup IDs | **REGRESSED** → Phase 2; guardrail (a) asserts 0 dups |
| §3 clean titles, all 16 modules (review-comment driven) | **REGRESSED** (titles reverted) → Phases 1,3,4; golden == CD-0608 |
| 27 vocab-lint hits scrub (`SUBPLAN_…1440`, `75e27daa`) | NOT regressed (live lint ok=true) → re-assert post-rebuild |
| blocked-reasons SSL-007/030 Blocked + LI reasons (`5f21f0e2`) | keep + assert present; **also re-check ACC-029/NTS-056** (blank vs 75e27daa) |
| TestRail uniform 11-col schema (`1a08278e`) | assert still 11-col after corp add |
| corp React-input / Max-Discount-cap-100 / custom import dialog (`W15_A`/`W15_B`) | spec-level → assert corp sheets present + `playwright --list` compiles |

## Files
- **Edit (MD):** `locations_notes_test_cases.md`, `locations_shared_setup_locations_test_cases.md`,
  `locations_legal_test_cases.md`, `locations_account_address_test_cases.md`,
  `local_office_settings_test_cases.md`, `locations_pricing_test_cases.md`,
  `locations_local_information_test_cases.md`, `locations_management_history_test_cases.md` (titles).
- **Edit (wiring):** `export_test_cases/to-xlsx.ts` (SHEET_NAMES), `scripts/to-xlsx-sheet-name.test.ts`.
- **Delete:** `locations_left_panel_test_cases.md`.
- **Rebuild (generated):** `encore_test_cases.xlsx`, `encore_test_cases_testrail.xlsx`.
- **Add:** guardrail validator (+ package.json wire-in). **Reuse:** `scripts/_gen-testrail.ts`.
- **Keep untouched:** corp new sheets, byte-identical modules, the kept 06-09 reason cells.
- **Process:** activity-log row per LR-028 (edits touch pipeline-owned paths); no `cp -r`/ship/commit/push unless asked (LR-049).

## Verification (re-runnable)
1. `npm run xlsx:build && npm run xlsx:lint` → clean (0 vocab / 0 integrity).
2. `npm run check:tc-parity` → PASS; Notes 58; no `locations_left_panel`.
3. Golden: rebuilt reverted-module sheets == CD-0608 (id→title→steps→expected); Notes == spec; MGH/LI
   per-cell decisions honored; corp new sheets + 06-09 reasons preserved.
4. Guardrail: 0 cross-sheet dup IDs; 0 gross spec↔xlsx mismatches.
5. TestRail: New Pricebook/Override/Toolbar present; uniform 11-col; Notes 58; existing corp unchanged.
6. `npx playwright test --list` compiles (no broken TC refs).

## Out of scope / preserve
Spec files (the authority we align to); every legit 06-09 change (corp pricing, MGH-020..025 content,
LI/SSL blocked-reasons, vocab scrubs); the 8 byte-identical modules.

---
## Plan-claim verification (red-flag audit, 2026-06-09)
Each non-obvious claim was checked against a live artifact this session:
- CD `45be5528` = clean (Notes 58, no orphan): `git show` + `XLSX.readFile` ✓
- Revert window 06-08→06-09 baked Notes 64/HIST/orphan into `75e27daa`: per-cell diff ✓
- Working tree ≠ "75e27daa cell-for-cell" — **corrected** to "+ 5f21f0e2 reasons + 2 corp sheets"; ACC-029/NTS-056 blank flagged ✓
- MGH "keep current" — **verified** (CD MGH steps garbled), refined to keep-steps / reconcile-titles ✓
- Working tree vocab-clean: live `lintWorkbook` ok=true ✓
- Backup MD set (16 files) exists for full-fidelity step restore ✓

---
## Execution Summary
**Executed**: 2026-06-10 · **Identity**: OWNER · **Session**: interactive /execute (Opus) · **Recovery scope**: user-selected Option 1 (clean-recoverable + jargon scrub; cosmetic step-formatting left; every per-cell decision logged).

**Phase outcomes (all 8 phases executed)**
- **Phase 0 backup (hard gate)**: `~/encore_backups/recover_20260610-141027/` — 21 MD + 3 workbooks + blocked-reasons.json + wiring + CD oracle `x_45be5528.xlsx` (1.2 MB) — created BEFORE any edit.
- **Phase 1 Notes**: 6 HIST blocks (ex-NTS-028..032/038) deleted (coverage lives at TC-LOC-MGH-020..025); remap 033-037→028-032, 039-064→033-058; all 58 titles ← spec (54) else CD (4); post-divider FCC blocks reordered numeric; stale meta-prose fixed. Verified: 58 contiguous, 0 HIST, Depends_On targets all valid, Steps/Expected/Data markers 64→58 (content conserved).
- **Phase 2 orphan**: `locations_left_panel_test_cases.md` deleted (24 TCs, full subset of left_panel_basic_information's 27 — source of ALL 24 cross-sheet dup IDs); sheet-name test assertion removed (re-run PASS); to-xlsx doc-comment corrected. NO SHEET_NAMES entry existed (plan-claim deviation, logged).
- **Phase 3 titles**: 43/43 reverted titles restored from spec test() titles (==CD where spec exists — verified 0 spec≠CD mismatches); SSL×17, BAS×6, LGL×1, ACC×1, PRI×1, LI×11, MGH×6.
- **Phase 4 per-cell**: LGL-019 Steps/Expected/Data/Notes rewritten to CD-clean (sentinel/dom-tamper/runner jargon removed; internal rationale pointer left as MD comment → plans/done/SUBPLAN_LEGAL_FCC.md; the legal field-case-catalog file itself was lost to the same gitignored-MD restore); legal trailing "Execution Notes:" section renamed "Execution reference:" (kills the parser Notes:-swallow leak class); PRI-002/PRI-033 notes ← CD; LI-NE-044..047 notes restored ×4; LI-065 "new site"→"live site" (CD text); ACC-029 + NTS-056 Blocked reasons restored via blocked-reasons.json (both specs still test.fixme — evidence-verified); SSL-007/030 kept (cur==CD); MGH-020..025 steps/expected/preconditions kept (CD garbled — plan-verified); LI exec/reason cells kept (06-09 work). Full per-cell log: `clients/encore/specs_planning/_internal/excel-revert-recovery-deviations-2026-06-10.md`.
- **Phase 5 rebuild + golden gate**: `xlsx:build` OK (20 sheets, 622 rows, Notes 58); `xlsx:lint` PASS (0 vocab / 0 integrity / 0 warnings); `check:tc-parity` PASS (518 spec ⊆ 622 MD == 622 XLSX). Golden acceptance: 0 cross-sheet dup IDs (was 24); 0 undocumented cell diffs vs CD-0608 across all 7 reverted/mixed sheets; Notes titles == spec; 4 reason spot-checks OK; `npx playwright test --list` = 534 tests / 20 files.
- **Phase 6 TestRail**: regenerated via `scripts/_gen-testrail.ts` → 19 sheets (16 + New Pricebook 30 / Override 28 / Toolbar 17, grouped with the corp block), 11-col uniform, Notes 58; ALL 16 prior sheets' TC-ID sets verified identical to the before-snapshot. (Deviation from "surgical add" — justified + logged: prior file was generated from the same clean 06-08 source.)
- **Phase 7 guardrails**: `scripts/check-tc-parity.ts` now carries guardrail-4 (CRITICAL on any TC ID on >1 sheet) + guardrail-5 (per-module FLAG on gross spec↔xlsx title divergence; CRITICAL on the combined revert signature ≥50% divergent + ≥5 TCs + numbering past spec max). Self-test embedded; NEGATIVE-TESTED against the actual broken pre-recovery workbook (fired both: 24 LP dups; TC-LOC-NTS 31/58 divergent + 6 IDs past spec max) and PASS on the recovered workbook.

**Regression matrix (7/7 re-verified)**: Notes re-ID fixed; left_panel dups 0 + guarded; §3 titles == CD golden; vocab-lint 0 hits; blocked-reasons all present (SSL-007/030, ACC-029, NTS-056, LI set); TestRail 11-col holds; corp specs compile (534 listed).

**Plan-claim deviations (4, all evidence-logged)**: (1) backup-MD-0605 steps restore was a no-op (byte-identical to current — the clean 06-08 MD is unrecoverable; titles came from spec instead); (2) no left_panel SHEET_NAMES entry existed; (3) cur↔CD step diffs were build-formatting, not MD reversions — left per Option 1; (4) TestRail full-regen instead of surgical add (ID-set-identical proof). Details + Adjacent-Sweep dispositions (2 DO-NOW, 1 SPAWN task_e8126404, 1 already-tracked in PLAN_ROOT_CLIENT_DEDUPE.md): `clients/encore/specs_planning/_internal/excel-revert-recovery-deviations-2026-06-10.md`.

**TCs**: no TCs created/dropped — recovery plan. Every planned phase item executed or evidence-logged as no-op; nothing deferred.

**Learnings captured**: 2 entries in `clients/encore/specs_planning/_internal/agent-mistakes.md` (parser Notes:-swallow leak class; ID-set-only parity blindness); `.claude/context/navigation.md` §C XLSX-pipeline registry row updated 2026-06-10.
