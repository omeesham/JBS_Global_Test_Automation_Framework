# CSV-Reference Triage Ledger — 2026-05-27

Generated for Phase C of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION (the generating
helper `scripts/triage-plans-csv-references.mjs` was a one-shot, retired 2026-06-06
once its job was complete).

**Plans scanned**: 90 (in `plans/pending/`)
**Plans mentioning CSV**: 34

> **PHASE C COMPLETED 2026-06-06.** The body rewrites the "Suggested" column proposed
> were executed for every plan still live in `plans/pending/` that carried a
> `test_cases_csv/` directory reference or a dead `to-csv.ts` CLI invocation:
> dead `npx ts-node …/to-csv.ts … .csv` re-export commands flipped to
> `npm run xlsx:build`; deliverable / bundle / scope refs repointed to the single
> `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` workbook; the
> "`to-csv.ts` git rm'd" claims corrected (the file was retained as the in-memory
> parity oracle). PRESERVE / REVIEW plans and dated historical records left intact.
> Verified: `grep -rn "ts-node export_test_cases/to-csv.ts" plans/pending/` → 0 hits.

## Per-plan triage table

| Plan | CSV hits | Suggested | Action (fill in) |
|---|---|---|---|
| `PLAN_AGENT_AUTHORING_EFFICIENCY.md` | 2 | REVIEW | _ |
| `PLAN_BIG_PIVOT_FCC_MASTER.md` | 1 | PRESERVE | _ |
| `PLAN_CLOSURE_GATE_V6_PARENT.md` | 1 | REVIEW | _ |
| `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` | 140 | SELF | _ |
| `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` | 20 | REWRITE-light | _ |
| `PLAN_LM_HISTORY_COVERAGE.md` | 1 | REVIEW | _ |
| `PLAN_MAINTAINER_SWEEP.md` | 1 | REWRITE-light | _ |
| `PLAN_MASTER_REPO_CLEANUP.md` | 1 | REVIEW | _ |
| `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` | 49 | DROP-AS-SUPERSEDED | _ |
| `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` | 23 | REWRITE-light | _ |
| `PLAN_PUSH_NOTES_LATEST_TO_DELIVERABLES_TEST.md` | 1 | REVIEW | _ |
| `PLAN_TEST_DATA_CSV_CONVERSION.md` | 78 | REVIEW | _ |
| `PLAN_VERTICAL_RESTRUCTURE_PENDING.md` | 1 | REVIEW | _ |
| `SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md` | 6 | REWRITE-light | _ |
| `SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md` | 11 | REWRITE-light | _ |
| `SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md` | 1 | REWRITE-light | _ |
| `SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` | 2 | REWRITE-light | _ |
| `SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md` | 2 | REWRITE-light | _ |
| `SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md` | 2 | REWRITE-light | _ |
| `SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md` | 2 | REWRITE-light | _ |
| `SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md` | 2 | REWRITE-light | _ |
| `SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md` | 3 | REWRITE-light | _ |
| `SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md` | 1 | REWRITE-light | _ |
| `SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md` | 3 | REVIEW | _ |
| `SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md` | 1 | REVIEW | _ |
| `SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md` | 6 | REWRITE-light | _ |
| `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` | 8 | REWRITE-light | _ |
| `SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md` | 11 | REWRITE | _ |
| `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md` | 7 | PRESERVE | _ |
| `SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md` | 3 | PRESERVE | _ |
| `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` | 5 | REWRITE-light | _ |
| `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` | 16 | REWRITE | _ |
| `SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md` | 2 | REWRITE-light | _ |
| `_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md` | 20 | REWRITE | _ |

## Per-plan detail

### `PLAN_AGENT_AUTHORING_EFFICIENCY.md` — suggested **REVIEW**

Path: `plans/pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md`

Dependency edges:
- Parent: (root — system-level mega plan)
- Depends on: SP-DQU-02 (done — neutral-eye findings file proves the artifact format works for one module)
- Blocks: SP-DQU-03 + every SP-DQU-04..21 (LOS fixes onward consume the new gate; 9 remaining modules ride the new rails)

CSV mentions (2):

```
  39: Client review of `local_office_settings_test_cases.csv` surfaced 11 defects. Root cause analysis (this session, 2026-04-23) found the failure was **systemic**, not module-specific:
 110: | SP-AAE-06 | Parallel 9-module rollout orchestration under new system | OWNER | /chain, /audit | 9 parallel field-inventory artifacts + 9 corrected MDs + re-exported CSVs |
```

### `PLAN_BIG_PIVOT_FCC_MASTER.md` — suggested **PRESERVE**

Path: `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md`

Dependency edges:
- Depends on: none
- Blocks: per-module FCC subplans (named in §Roadmap below)
- Parent: PLAN_BIG_PIVOT_FCC_MASTER.md` (per LR-048 schema — singular key). Reference false-green doctrine in prose as `co-doctrine: §False-Green Sweep Doctrine (this file)`, NOT as a second parent.
- Depends on: `; CLEANUP closes first; both must close before module is shipped.
- Parent: PLAN_BIG_PIVOT_FCC_MASTER.md` may return zero pending siblings — this would normally trigger LR-027's parent-cascade clause and auto-close the master.

CSV mentions (1):

```
  98: - `SUBPLAN_LEFT_PANEL_FCC.md` — 24 TCs planned (MD + CSV + test plan + selectors), 0% automated, dropped from parity restructure per user 2026-05-26 ("do not create it"). File NOT yet authored; this roadmap line preserves the work so it isn't lost. Routed here from `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` SP07. Note: LGL-015 (Country cascade) depends on left-panel Country selector — if W2-08's MCP discovery confirms no Country dropdown exists in the app left panel, LGL-015 is also deferred here.
```

### `PLAN_CLOSURE_GATE_V6_PARENT.md` — suggested **REVIEW**

Path: `plans/pending/PLAN_CLOSURE_GATE_V6_PARENT.md`

CSV mentions (1):

```
 151: | B11 | C3 extension set extended (`.log`/`.txt`/`.har`/`.xml`/`.md`/`.csv`/`.diff`/`.patch`) | v6-C |
```

### `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` — suggested **SELF**

Path: `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md`

Dependency edges:
- Parent: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` or that lists this plan as their parent in body. This plan has no subplans (its work was inlined as Phase 0/A/A.5/B/C/D — no child subplans were spawned), so the cascade is a no-op.

CSV mentions (140):

```
   2: title: Replace 11 per-module CSVs with one multi-sheet XLSX workbook (encore_test_cases.xlsx)
  12: target_repo_location: clients/encore + repo root + plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md
  15: # Plan — Replace 11 per-module CSVs with one multi-sheet XLSX workbook (`encore_test_cases.xlsx`)
  19: > **⚠ HARD WARNING — W1-02 retirement (auditor pass 3)**: Do NOT execute `SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` as written. Its CSV-specific phases (Phase 2 schema reconciliation, Phase 9 CSV cleansing, Phase 10 LO CSV split, Phase 11 CSV re-export, Phase 12 `check-csv-sanity.mjs`) are SUPERSEDED by this XLSX migration. W1-02's MD-side work (A1 path updates, A2 header counts, A3 Status sync, GP-4 Notes ID reconciliation) is absorbed into Phase 0 below. Any agent that runs W1-02 as-written rebuilds the obsolete CSV deliverable and undoes this plan. Phase C explicitly retires W1-02.
  23: > 2. **This plan Phase 0** — absorbs W1-02 MD-only work (Phases A1/A2/A3/GP-3/GP-4/duplicate-035-resolution); does NOT do CSV-side work
  25: > 4. **W1-04** (file-only spec fixes — format-agnostic; replace "targeted CSV refresh" with "targeted XLSX rebuild" in its body during Phase C)
  29: > 8. **This plan Phase C** — manual per-plan triage (REWRITE/DROP/PRESERVE/REVIEW); W1-02 dropped-as-superseded; W1-05 + W2-09 retargeted; W1-04 + W2-08 CSV-refresh refs flipped to XLSX
  30: > 9. **This plan Phase D** — delete CSVs (gated on fresh row-parity check)
  57: 9. **excelAdapter.ts boundary guard** (auditor finding #6): confirm zero files under `clients/encore/src/data/testdata/` are `.csv` format AND no test-case caller of `excelAdapter.load()` passes a `.csv` path. Adapter's dual-format capability STAYS (test-data layer is a separate concern from test-case workbook). If a `.csv` test-data fixture exists, decide: (a) convert to `.xlsx`, OR (b) accept the boundary and add a 1-line docstring clarification on the adapter. Either way, document the decision in the activity log.
  62: - Exporters: `export_test_cases/{to-csv,to-json,to-jira,to-testmo,markdown-parser,types,index}.ts`
  64: - Queue data: `clients/encore/specs_planning/_internal/agent-queue.json` (11 active `csvExport` paths + 12 history rows to migrate)
  66: - Pre-existing CSVs (Phase D deletes): `clients/encore/test_cases_csv/*.csv` (11 files, 474 rows total)
  67: - Legacy CSVs (Phase D deletes): `export_test_cases/exports/*.csv` (11 stale files Feb–Mar 2026)
  73: /execute plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md
  85: - Phase C: bulk find-replace touches a plan body in a way that breaks its semantic meaning (e.g., changes a historical "CSV format" reference to "XLSX format" where the original meaning was specifically about CSV-the-format)
  86: - Phase D: dry-run ship shows `test_cases_csv/` OR `export_test_cases/exports/` present in the archive
  91: After ExitPlanMode approval, this file moves from `C:\Users\rutvi\.claude\plans\this-is-how-the-crystalline-flask.md` (scratch) to `C:\Users\rutvi\projects\encore_framework\plans\pending\PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` (repo). `plans/INDEX.md` regenerated to list it. The scratch copy is deleted.
 101: Current state: **11 per-module CSVs** in `clients/encore/test_cases_csv/` with **474 total data rows** (verified — not 485 as initially claimed):
 103: | CSV | Rows | Schema variant |
 105: | `local_office_settings_test_cases.csv` | 85 | col 5 = `Tags` |
  ... 120 more elided
```

### `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` — suggested **REWRITE-light**

Path: `plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md`

Dependency edges:
- Parent: (root — mega plan)
- Depends on: none
- Blocks: HIST column-first pivot (all 31 SUBPLAN_HIST_PIVOT_* subplans paused until this plan closes)

CSV mentions (20):

```
   1: # PLAN: Deliverable Quality Upgrade — CSV, Specs, Cleanup, Reporting
  15: Client colleague audited `clients/encore/test_cases_csv/local_office_settings_test_cases.csv` and flagged **11 specific TC defects** (values violating field constraints, stale defaults, wrong section labels, 3 likely APP bugs that slipped through). Root cause: initial TCs (drafted by copilot/agent early in the project) were authored from an idealized spec, not from live-DOM observation.
  26: 8. **Ship-first ordering** — CSV quality lands before anything else. Client sees clean CSVs even if deeper work (bulletproof specs, cleanup) is still running behind the scenes.
  33: - Deliverables in strict priority: **CSVs (1) → specs clean full-suite (2) → Allure report (3) → bug reports (4, nice-to-have)**.
  35: ### The 11 locked reviewer defects (Local Office Settings CSV)
  58: | D2 | Tag placement: rename existing `Specific Field` column → `Tags` in CSV. Zero schema growth. | `Specific Field` is auto-derived from Title by `extractSpecificField()` in `export_test_cases/to-csv.ts:686` — pure redundancy. |
  64: | D8 | Ship-first: Track 1 (CSV quality) closes before any other track blocks on it. Other tracks proceed in parallel behind the scenes. | User explicit: "prio in a way to save ass by delivering the things they really care about first". |
  65: | D9 | /simplify and /cleanup scope: Encore deliverables + Encore-specific runtime code ONLY. Whitelist: specs under `specs/`, page objects under `src/pages/`, selectors under `src/selectors/`, test data under `src/data/testdata/`, test-case MDs under `clients/encore/specs_planning/test-cases/`, exports under `clients/encore/test_cases_csv/`, export script `export_test_cases/to-csv.ts`. Out of scope: `.github/agents/`, `.claude/`, website/, tools/, config/, orchestrator, pipeline. | User explicit. |
  87: | SP-DQU-03 | LOS CSV fixes (11 reviewer flags) + re-export + file 3 APP bugs | HEALER | /bugfix, /regression-guard | Updated MD + CSV + 3 BUG-*.json |
  89: | SP-DQU-05 | LI CSV fixes + re-export + file any LI APP bugs | HEALER | /bugfix, /regression-guard | Updated MD + CSV + BUG-LI-*.json (count TBD) |
  90: | **SP-DQU-05E** | **LOS + LI deep coverage retro-audit (baseline-first walk + ISTQB depth-grid + gap-fill TCs)** | WATCHDOG → HEALER | /find-bugs, /bugfix, /regression-guard | 2 baseline artifacts + coverage matrix doc + N gap-fill TCs + BUG-* for any regression-from-baseline + 2 re-exported CSVs. **BLOCKS HIST pivot on LOS + LI specs.** |
  96: | SP-DQU-06 | Converter: rename `Specific Field` → `Tags`; read from metadata table | BUILDER | /simplify, /regression-guard | Modified `export_test_cases/to-csv.ts` |
  98: | SP-DQU-08 | Tag rollout: LOS + LI MD files + re-export | BUILDER | none (mechanical) | Tagged MDs + re-exported CSVs |
 129: Each produces its own findings MD + CSV fix subplan folded into that subplan's execute phase. File bugs via LR-034.
 179: | SP-DQU-34 | Client handoff package: CSVs + Allure + bug reports | OWNER | /deploy, /audit |
 219: After SP-08 closes, LOS + LI CSVs are client-ready with:
 232: 1. **Client-facing**: LOS + LI CSVs reviewed by colleague return zero format or semantic defects.
 233: 2. **Schema**: every CSV row has a non-empty `Tags` cell (formerly Specific Field).
 242: 11. **Deliverable package**: `clients/encore/test_cases_csv/` + Allure report + bug reports bundled for client.
 282: - `export_test_cases/to-csv.ts` — converter (modified in SP-06).
```

### `PLAN_LM_HISTORY_COVERAGE.md` — suggested **REVIEW**

Path: `plans/pending/PLAN_LM_HISTORY_COVERAGE.md`

Dependency edges:
- Parent: `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md`
- Depends on: column-root catalogs (Local Office, ECT, Currency, Pricing, Notes col 69 done; Local Info, Account, Legal, Shared Setup, Auto-Addon, Top-Level pending — filled inline by Phase 1b per parent §6)
- Blocks: parent plan flip to `done/` (one of 14 child plans per parent §7 parent-persistence rule)

CSV mentions (1):

```
 181: - [ ] CSV regenerated once after Phase 5d. Path cited in Execution Summary.
```

### `PLAN_MAINTAINER_SWEEP.md` — suggested **REWRITE-light**

Path: `plans/pending/PLAN_MAINTAINER_SWEEP.md`

CSV mentions (1):

```
 247: **Implementation**: add `--module=<id>` arg parsing; restrict scan to `clients/${ACTIVE_CLIENT}/specs/<module>/`, `test-cases/<module>_test_cases.md`, `test-plans/<module>.md`, `test_cases_csv/<module>_test_cases.csv`. Default (no flag) preserves full-repo behavior.
```

### `PLAN_MASTER_REPO_CLEANUP.md` — suggested **REVIEW**

Path: `plans/pending/PLAN_MASTER_REPO_CLEANUP.md`

Dependency edges:
- Parent: none (master)

CSV mentions (1):

```
  80: PLAN_HISTORY_INTEGRATION_*, PLAN_TEST_DATA_CSV_CONVERSION, PLAN_GENERATOR_AUDIT_AUTO_ADDON,
```

### `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — suggested **DROP-AS-SUPERSEDED**

Path: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`

CSV mentions (49):

```
   1: # Parity Fix Plan — MD ↔ CSV ↔ Spec for Encore Test Cases
  10: - **2026-05-25 (v13 pivot, same day, post-colleague-ask)** — SP00 PIVOTED again from throwaway+revert (v11/v12) to PERMANENT AUGMENT + PUSH (v13) per colleague's Excel-format request + user directive "preserve added lines in future". New design: augment all 10 source CSVs with 3 new columns (Automated/Automation Execution/If Failed Reason of Failure) → permanent commit to working branch → push to `csv-spec-demo-2026-05-25` (renamed from `notes-SSL-csv` per Y3, avoids confusion with existing `notes-SSL` branch on remote). NO revert; augmented CSVs become permanent. 100% mapping accuracy via Playwright JSON `--list --reporter=json` primary + source-file regex secondary for `test.fixme(true, '<reason>')` text not exposed in JSON (verified non-exposure). Hybrid reuse: `scripts/scan-fixmes.ts` registry for `// FIXME` reasons. Auto-wipe trigger acknowledged: `scripts/planner-post-complete.ts:21` re-imports `CsvConverter` on Planner queue completion → wipes augmented data on regen; permanent schema preserved via `export_test_cases/to-csv.ts` COLUMNS array update (3 new entries; 12-col schema everywhere); refresh = re-run SP00. Cross-platform Node file ops throughout (no shell `cmp`/`cp`/`find` — Windows-safe). Sibling edits this session: this PLAN Phase 0 description + Patch-vs-Real-Work subsection + Change Log; `SUBPLAN_PARITY_03_TOOLING_MD_AND_CSV_REEXPORT.md:54` (9-column → 12-column); `export_test_cases/to-csv.ts` COLUMNS array (+3 entries); `export_test_cases/README.md:247` (sample header staleness). Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.
  12: - **2026-05-25** — SP00 cross-thread integration (DIRECTIONAL REWRITE + CONSOLIDATION, same day). Prior 2026-05-25 design (specs adapt to CSV via `.fixme` stubs marked `BLOCKED-BY-PARITY-PATCH-SP00`; split into SP00 + SP00b for publish workflow) was directionally reversed AND consolidated into a single SP00. New direction: specs are SOT for TC-ID set; SP00 generates demo CSVs in-place, swaps source CSVs temporarily for user review, pushes `client:ship` bundle to `notes-SSL-csv` on `RutviK-JBS/encore_deliverables_test`, then restores source CSVs from `/tmp/orig-csvs-<ts>/` backup. Framework repo returns byte-identical pre/post-SP00; zero footprint outside `clients/encore/test_cases_csv/` during run. SP07 D18/D19 (zero-leftover + git-blame) removed (no stubs exist); D7 reverted (no SP00 marker); SP04/SP05/SP06 MUTATE sub-steps removed (no stubs to mutate); SP01 .fixme-classification note removed; SP02 stub-routing language removed (specs-already-split factual note preserved as standalone); SP03 post-export re-run removed; SP07 SP00 cross-ref dropped entirely; Phase 7 MUTATE language reverted; Phase 8 D18/D19 removed; Phase 9 zero-stub verification removed; §Patch-vs-Real-Work subsection rewritten. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`. No existing scope removed from sibling subplans; only prior 2026-05-25 stub-direction additions reverted.
  26: 1. **No coverage loss** — when MD/CSV/spec disagree on a TC's existence, default = **IMPLEMENT the missing side**. "Drop the TC" or "mark Manual-only" is allowed **only** when there's a documented external blocker (real app bug with filed Jira ID, or a feature that physically does not exist in the e2e env). No silent deletions, no "Deferred" as an escape hatch.
  28: 2. **No shady passes** — when a spec's assertion is EASIER than what the MD/CSV says the TC should verify, the spec is faking a pass. Examples of shady patterns to hunt:
  29: - Spec asserts existence (`toBeVisible()`) where MD/CSV says "enter invalid value, verify error message"
  30: - Spec asserts readonly state where MD/CSV says "test the validation"
  31: - Spec asserts `toBeGreaterThan(0)` row count where MD/CSV says "exactly N rows"
  32: - Spec uses `test.skip` / `test.fixme` where MD/CSV says Automated
  41: Every subplan that opens a spec / page-object / selector / data file / MD / CSV / script MUST do a quality audit of that artifact while it's open — not just the narrow parity fix. **Do not tunnel-vision**. If you spot any of the following while working on TC-015, fix it in the same session:
  70: 2. **Permanent prevention via catalog graduation** — every NEW red-flag pattern you discover MUST be appended to the canonical catalog file at `clients/encore/scripts/ci/red-flag-patterns.json` (created in SP03) BEFORE the subplan closes. The CI scripts (`check-csv-sanity.mjs`, `check-comment-sanity.mjs`) read from this catalog at runtime, so every new entry locks out that pattern forever. The catalog grows monotonically — never delete entries, only add. Each entry carries: `{pattern, category, discovered_by_subplan, discovered_date, allow_list_paths?}`.
 164: | Module | MD | CSV | Spec | Verdict | Gap | Routed to |
 167: | legal | ✓ | ✓ | ✓ | ⚠ | MD header 19→18; CSV has TC-015/016/017; spec omits 016/017 (APP BUG) + 015 (needs left-panel Country) | W1-02 (MD), W2-08 (LGL-015 + LGL-016/017 Jira citations) |
 169: | account_address | ✓ | ✓ | ✓ | ⚠ | MD header 29→28; no Automation File line; CSV TC-028 missing step 1 | W1-02 (MD + CSV), W1-04 (TC-015 wording + DROPPED comments) |
 171: | local_information | ✓ | ✓ | ✓ | **RESOLVED-by-AUDIT** | LI-EXTRA verified already in MD/CSV/spec (TC-LOC-LI-064/077/SKIP-BILLING) | W1-04 verifies parity only |
 172: | management_history | ✓ | ✓ | ✓ | ⚠ | Spec TC-013/014 invert MD/CSV bug expectations; TC-006/007/019 skipped | W2-08 (MGH verdict + un-skip RCA) |
 174: | local_office_settings | ⚠ | ⚠ | ⚠ | ⚠ | **MERGED** CSV (83 TCs); BAS-068 missing from CSV/spec; BAS-048 skipped | W1-02 (CSV split into 3), W1-03 (code split), W1-04 (BAS-068 add), W2-08 (BAS-048 un-skip) |
 176: | notes | ✓ | **RESOLVED-by-SP00** | ✓ | ⚠ | CSV restored by SP00 (12-col schema); **duplicate TC-LOC-NTS-035 found at spec lines 425+1085**; MD has 27 FCC IDs, CSV/spec use normalized | W1-02 (GP-4 reconciliation in MD), W1-04 (resolve duplicate + verify parity) |
 177: | local_office_history | ✓ | ✗ | ✓ | ⚠ | CSV absent (folded); HIS-7 TC-002 bare `>0` | W1-02 (CSV split — emit `local_office_history_test_cases.csv`), W1-04 (HIS-7 42-column enumeration) |
 178: | local_office_ect | ✓ | ✗ | ✓ | ⚠ | CSV absent (folded); ECT-018 missing from spec; ECT-001/010 verdict needed | W1-02 (CSV split — emit `local_office_ect_test_cases.csv`), W1-04 (ECT-018 add), W2-08 (ECT-001/010 verdict-dependent) |
  ... 29 more elided
```

### `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` — suggested **REWRITE-light**

Path: `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md`

Dependency edges:
- Depends on: `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-11.csv` (Cat 3 CSV — already written this session)

CSV mentions (23):

```
   7: **Estimated session**: MEDIUM-LARGE (CSV ships in 0 hrs — already written; ~4-5 hrs of RCA + filing work spread across cycles; Encore reply gates closure)
   8: **Depends on**: `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-11.csv` (Cat 3 CSV — already written this session)
  25: **This plan is the SINGLE MASTER TRACKER** for the Encore-QA bug handoff. The Cat 3 CSV (already written) is the externally-shareable artifact. This plan tracks everything around it — what's in the CSV, what's NOT in the CSV, what questions we have for Encore, what RCAs we need to run ourselves, and what decisions Rutvik needs to make.
  27: **⚠ PRIORITY NOTE (2026-05-13, status updated 2026-05-14)**: ~~A fresh 4-worker full-suite run today produced **27 hard failures (2.2%)**. RCA on those failures is the **next first action** before R1-R6, before sending the CSV, before any other work in this plan.~~ **CLOSED 2026-05-14 by §3.8**: the workers=4 → workers=2 re-run collapsed 27 hard failures to 7. Of the 7, 1 is a confirmed app behavior change (filed BUG-LOS-BAS-065), 1 is our-end test design (TC-LOS-BAS-021 pollution carryover, defer fix), 1 is inconclusive (TC-LOC-NTS-030 new spec, defer live-MCP), and 4 are environmental (backend storm in the 2026-05-14 08:00–08:30 UTC window). Worker-race hypothesis confirmed: 26 of 27 §3.7 hard failures were workers=4 contention artifacts. See §3.7 + §3.8 for full breakdown; R1-R6 + Cat 1/Cat 2 deep RCA + CSV refresh remain DEFERRED to next session per user scope.
  31: ## §1 — Cat 3 (10 bugs, shared via CSV)
  33: Confirmed from our end. Shared with Encore QA via `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-11.csv`. Source-of-truth JSONs in `reports/bugs/`.
  51: **Action**: Rutvik shares the CSV with Encore QA. We wait for disposition. On reply, flip each `BUG-*.json` status field to `confirmed`, `closed-as-intentional`, or `fixed` per their answer.
  97: **Cat 3 CSV row count**: 10 → **11** (was: 10 rows in `bugs-for-encore-qa-2026-05-11.csv`; now 11 rows in `bugs-for-encore-qa-2026-05-12.csv`).
 104: **NEXT-ACTION GATE (priority over everything else in this plan)**: RCA the failures below FIRST — before R1-R6, before sending the CSV, before answering Q1-Q9. Goal: drive failure rate to 0% by classifying each as (a) confirmed app bug → file `BUG-*.json` + append to §1 CSV, (b) test-isolation artifact → fix spec/worker setup, or (c) environmental flake → document and move on. No shortcuts; LR-044 verbatim → exact → minimize per failure.
 138: - **NA-4** — Append new BUG-*.json rows to `bugs-for-encore-qa-2026-05-13.csv` (refresh of the 2026-05-12 CSV).
 148: **Purpose**: Re-run the spec suite from §3.7 with workers reduced from 4 → 2 to isolate worker-race from real bugs (per §3.7 NA-1). User scope (2026-05-14 directive): classify each failure verbatim per LR-044, file bugs for confirmed app issues, defer R1–R6 + Cat 1 / Cat 2 deep RCA + CSV refresh to next session.
 220: - **NA-4** (refresh CSV to `bugs-for-encore-qa-2026-05-14.csv`) — **addressed** — see PLAN_P0_EXPORT_REFRESH_2026_05_14 (executed 2026-05-14). New file at `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-14.csv` contains all 12 Cat 3 bugs + Q1–Q9 + Q-NEW-1 questions section. Old CSV preserved unchanged.
 359: **Total RCA budget**: ~4-5 hours (parallelizable; not blocking the Encore CSV ship).
 367: | D1 | Send Cat 3 CSV now (before any of R1-R6), or run RCAs first? | Send now | Many Cat 2 questions can ONLY be answered by Encore (intent questions Q1, Q2, Q3). Pre-RCA delays the handoff without changing the questions. |
 371: | D5 | Run R6 (file LOS-ECT-BUG-A as BUG-LOS-ECT-002) before sending the CSV? | Yes — file first | So we can mention it alongside BUG-LOC-ECT-001 in the same ECT discussion bucket. |
 372: | D6 | Keep BUG-LS-001 (data-testid ask) in the Cat 3 CSV, or split out as a separate dev-team ask? | Keep in CSV | Rutvik asked for "all bugs we collected"; LS-001 is in `reports/bugs/`. Encore will route appropriately. |
 380: | 1 | Run R6 — file LOS-ECT-BUG-A → `reports/bugs/BUG-LOS-ECT-002.json` (per LR-034) | Before CSV ship | 20 min |
 381: | 2 | Rutvik composes cover note + shares Cat 3 CSV with Encore QA contact (mentions BUG-LI-001 as FYI; mentions LO-001/002/003 as discussion items; lists Q1-Q9 as open questions) | After Step 1 | 1.5 hrs |
 395: - [x] Cat 3 CSV at `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-11.csv` with 10 rows + 6 columns (DONE 2026-05-11).
 396: - [x] `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-14.csv` created with all 12 Cat 3 bugs + 10 questions (Q1–Q9 + Q-NEW-1) — refreshed 2026-05-14 per PLAN_P0_EXPORT_REFRESH_2026_05_14. Old CSV preserved unchanged.
  ... 3 more elided
```

### `PLAN_PUSH_NOTES_LATEST_TO_DELIVERABLES_TEST.md` — suggested **REVIEW**

Path: `plans/pending/PLAN_PUSH_NOTES_LATEST_TO_DELIVERABLES_TEST.md`

CSV mentions (1):

```
 124: - clients/encore/ test data + CSVs + auth.setup + fixtures + playwright.config + workflow
```

### `PLAN_TEST_DATA_CSV_CONVERSION.md` — suggested **REVIEW**

Path: `plans/pending/PLAN_TEST_DATA_CSV_CONVERSION.md`

Dependency edges:
- Depends on: PLAN_TEST_DATA_PERFECTION (all TS data must be perfected first)
- Blocks: None

CSV mentions (78):

```
   1: # PLAN: Test Data CSV Conversion
  12: After PLAN_TEST_DATA_PERFECTION completes, all test data will be properly centralized in `src/data/testdata/` with full spec-traceability comments. This plan converts the storage format from TypeScript to CSV so non-technical team members can read and edit test data without touching code. The approach preserves the existing `import { X } from '...'` pattern in specs via thin TypeScript shim files that load CSV at module evaluation time.
  16: ## Architecture: CSV + TypeScript Shim
  18: ### Why not pure CSV?
  19: - Specs use synchronous `import { X } from` — CSV requires a loader
  21: - Programmatic data (`'A'.repeat(4000)`) can't exist in CSV
  26: CSV files (data lives here, humans edit this)
  28: csv-loader.ts (synchronous parser with comment stripping, nesting, repeat directives)
  37: ## CSV Format Conventions
  39: ### Comment Header (every CSV file)
  40: ```csv
  49: ```csv
  59: ```csv
  67: ```csv
  74: ```csv
  82: ```csv
  83: # One-column CSV for SelectorKey[] arrays
  94: Each `.data.ts` becomes a directory with one CSV per dataset:
  98: common.data.csv
  99: csv-loader.ts                              ← NEW: synchronous CSV parser
  ... 58 more elided
```

### `PLAN_VERTICAL_RESTRUCTURE_PENDING.md` — suggested **REVIEW**

Path: `plans/pending/PLAN_VERTICAL_RESTRUCTURE_PENDING.md`

Dependency edges:
- Depends on: none (no Encore confirmation needed; index/plan-shape changes only)
- Blocks: per-submodule execution cadence (cycles run via existing subplans once Plan A finalises the queue) and `PLAN_VERTICAL_DELIVERY_SOX.md`'s push cycle

CSV mentions (1):

```
 113: | 2. Apply audit fixes — CSV/MD test cases | folded into the audit subplan's fix phase | Re-export to CSV |
```

### `SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-DQU-03 (LOS fixes DONE), SP-DQU-05 (LI fixes DONE), LR-045 row 4 amendment (DONE 2026-04-29)
- Blocks: HIST column-first pivot — any HIST subplan touching LOS or LI specs (SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS, SUBPLAN_HIST_PIVOT_24/25 LI tests, etc.)
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md`. If zero → close parent PLAN. Otherwise → leave open.

CSV mentions (6):

```
 126: 4. Re-export CSVs (LOS now ships as 3 sibling files post-2026-05-05 split):
 127: - `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md clients/encore/test_cases_csv/local_office_settings_test_cases.csv`
 128: - `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/local-office/local_office_history_test_cases.md clients/encore/test_cases_csv/local_office_history_test_cases.csv`
 129: - `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/local-office/local_office_ect_test_cases.md clients/encore/test_cases_csv/local_office_ect_test_cases.csv`
 130: - `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md clients/encore/test_cases_csv/locations_local_information_test_cases.csv`
 149: - [ ] Both CSVs re-exported with new TC counts visible. Phase 0 greps return zero hits on edited TCs.
```

### `SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-DQU-03 (LOS fixes), SP-DQU-05 (LI fixes), SP-DQU-05D (LI new-bug fixes — BUG-LI-003 + 6 ARCH drift items + ~30 NEGATIVE TCs; MUST land before tag rollout per PLAN_FIND_BUGS_LI_FOLLOWUP Fork A reroute 2026-04-28), SP-DQU-06 (converter ready), SP-DQU-07 (rules doc live)
- Blocks: SP-DQU-34 (client handoff — CSVs must be tagged before shipping)

CSV mentions (11):

```
   1: # SUBPLAN: Tag Rollout — LOS + LI MD Files + Re-Export CSVs
   8: **Blocks**: SP-DQU-34 (client handoff — CSVs must be tagged before shipping)
  36: Add the `Tags` column to every TC's metadata table in LOS + LI MDs. Populate per Rule 5. Re-export both CSVs. Top-down layering: the 10-15 most business-critical TCs get `SMOKE`; others get the right combo of positive/negative/UI/regression.
  52: 6. Re-export CSVs (LOS now ships as 3 siblings post-2026-05-05 split):
  53: - `npx ts-node export_test_cases/to-csv.ts ... local_office_settings_test_cases.csv`
  54: - `npx ts-node export_test_cases/to-csv.ts ... local_office_history_test_cases.csv`
  55: - `npx ts-node export_test_cases/to-csv.ts ... local_office_ect_test_cases.csv`
  56: - `npx ts-node export_test_cases/to-csv.ts ... locations_local_information_test_cases.csv`
  57: 7. Open both CSVs in verification:
  61: 8. Regression fingerprint after. Should show only 2 MD files + 2 CSV files changed.
  69: - [ ] CSVs re-exported; Tags column visible; zero empty Tags cells.
```

### `SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-DQU-01
- Blocks: none (feeds recommendations to downstream subplans)

CSV mentions (1):

```
  25: - `clients/encore/test_cases_csv/local_office_settings_test_cases.csv` (sample CSV)
```

### `SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05

CSV mentions (2):

```
 102: ## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV
 108: 5. Re-export CSV: `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/locations/locations_pricing_test_cases.md clients/encore/test_cases_csv/locations_pricing_test_cases.csv`. Verify Tags column populated (SP-DQU-06 format).
```

### `SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05

CSV mentions (2):

```
  96: ## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV
 102: 5. Re-export CSV: `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/locations/locations_legal_test_cases.md clients/encore/test_cases_csv/locations_legal_test_cases.csv`. Verify Tags column populated.
```

### `SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05

CSV mentions (2):

```
  92: ## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV
  98: 5. Re-export CSV: `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/locations/locations_currency_test_cases.md clients/encore/test_cases_csv/locations_currency_test_cases.csv`. Verify Tags column.
```

### `SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05

CSV mentions (2):

```
  93: ## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV
  99: 5. Re-export CSV: `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/locations/locations_account_address_test_cases.md clients/encore/test_cases_csv/locations_account_address_test_cases.csv`. Verify Tags column.
```

### `SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05

CSV mentions (2):

```
  91: ## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV
  97: 5. Re-export CSV: `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/locations/locations_auto_addon_test_cases.md clients/encore/test_cases_csv/locations_auto_addon_test_cases.csv`. Verify Tags column.
```

### `SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05

CSV mentions (3):

```
  92: - Create `clients/encore/test_cases_csv/ect_settings_test_cases.csv` (initial export).
 132: ## Phase 2 — HEALER: diff new TC MD, file bugs, re-export CSV (only on Branch B)
 138: 5. Re-export CSV with Tags column (SP-DQU-06 format).
```

### `SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-DQU-01
- Blocks: SP-DQU-27 (simplify sweep), SP-DQU-28 (cleanup sweep)

CSV mentions (1):

```
  40: - `clients/encore/test_cases_csv/**/*.csv` (CSV exports — but read-only, no code simplification needed)
```

### `SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md` — suggested **REVIEW**

Path: `plans/pending/SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-DQU-08 (CSVs tagged), SP-DQU-25 (specs clean), SP-DQU-09 (REQUIREMENTS.md trusted)
- Blocks: SP-DQU-34 (handoff package should reflect re-synced state)

CSV mentions (3):

```
   7: **Depends on**: SP-DQU-08 (CSVs tagged), SP-DQU-25 (specs clean), SP-DQU-09 (REQUIREMENTS.md trusted)
  30: Each identity owns specific artifacts. After this plan's changes (CSV renames, MD edits, new bugs, new utils, new rules), each agent's task lists and "done" claims may be stale. Re-verify per identity:
  34: - BUILDER (specs + page objects + selectors + test data) — owns `src/pages/`, `src/selectors/`, `specs/`, `src/data/testdata/`. Verify: new slate-clear utility wired; tags applied in CSVs it produces; no dangling references.
```

### `SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md` — suggested **REVIEW**

Path: `plans/pending/SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-DQU-01
- Blocks: none

CSV mentions (1):

```
  51: Next week I will finish the Local Information neutral-eye audit and apply the fixes to the CSV.
```

### `SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md`

Dependency edges:
- Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
- Depends on: SP-DQU-08 (CSVs tagged), SP-DQU-30 (Allure), SP-DQU-31 (bug reports package), SP-DQU-29 (identity ripple sync)
- Blocks: SP-DQU-35 (exit audit)

CSV mentions (6):

```
   1: # SUBPLAN: Client Handoff Package — CSVs + Allure + Bug Reports + README
   7: **Depends on**: SP-DQU-08 (CSVs tagged), SP-DQU-30 (Allure), SP-DQU-31 (bug reports package), SP-DQU-29 (identity ripple sync)
  23: - `clients/encore/test_cases_csv/*.csv` (all 11 modules)
  30: Assemble the 4 client deliverables in priority order: **CSVs (1) > specs clean (2, documented via Allure) > Allure report (3) > bug reports (4)**. Produce a handoff folder with README that the colleague can open cold.
  36: - `test-cases/` → all 11 CSVs from `clients/encore/test_cases_csv/`.
  41: - How to read the CSVs (explain Tags column).
```

### `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md`

Dependency edges:
- Parent: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
- Depends on: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase 0 + Phases A+B complete — MD prereqs + workbook reader cutover), SUBPLAN_PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT.md, SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE.md
- Blocks: SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md (consumes W1-04 state)

CSV mentions (8):

```
   7: **Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
   8: **Depends on**: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase 0 + Phases A+B complete — MD prereqs + workbook reader cutover), SUBPLAN_PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT.md, SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE.md
  25: - notes: explicit Notes ID/FCC reconciliation per GP-4 (resolve duplicate TC-LOC-NTS-035 + MD/CSV/spec ID alignment)
  44: **Post-W1-04 XLSX rebuild** (per PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION supersession): W1-04 adds BAS-068 + ECT-018 to specs AFTER XLSX plan Phase A workbook build. New TCs flow into the workbook on next `npm run xlsx:build` (auto-invoked by planner-post-complete). No targeted update script needed — workbook reads from MD source of truth; SP00 augmentation re-runs on full build.
  58: - `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §B per-module rows for the modules in scope
 153: ### Phase 10 — Post-W1-04 XLSX rebuild (per PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION supersession)
 175: | GIVER | test-cases.md, test-plans.md, XLSX workbook | Notes ID reconciliation in MD + XLSX rebuild for BAS-068/ECT-018 via `npm run xlsx:build` | `npm run check:tc-parity` exit 0 (now reads from XLSX per PLAN_CSV_TO_XLSX) |
 228: # XLSX rebuild for new TCs (post PLAN_CSV_TO_XLSX migration)
```

### `SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md` — suggested **REWRITE**

Path: `plans/pending/SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md`

Dependency edges:
- Parent: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
- Depends on: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase D — full XLSX cutover complete, CSVs deleted)
- Blocks: SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md (consumes the validators)

CSV mentions (11):

```
   7: **Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
   8: **Depends on**: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase D — full XLSX cutover complete, CSVs deleted)
  26: **Absorbed micro-phases from defunct W1-02** (per PLAN_CSV_TO_XLSX supersession):
  27: - **check-xlsx-sanity.mjs** (was `check-csv-sanity.mjs`) — sanity gate target flips CSV → XLSX. Authored fresh here, not consumed from W1-02.
  31: (LR-050 stale-path grep sweep originally scoped to W1-02 was absorbed into PLAN_CSV_TO_XLSX Phase 0 A1 — not in W1-05's scope.)
  45: - `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §D3-D11 (this subplan owns D3-D10, D12-D14)
  46: - `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` — Phase D completion is prereq; XLSX workbook is sanity-check input
  47: - `plans/done/SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` — closed-as-superseded; lists original task routing for sanity-script absorption
  54: 1. Confirm PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase D closed GREEN (CSVs deleted, workbook is canonical, `npm run check:tc-parity` exits 0 with XLSX reader).
 127: Author `clients/encore/scripts/ci/check-xlsx-sanity.mjs` (renamed from W1-02's `check-csv-sanity.mjs`; target flipped CSV → XLSX per supersession):
 151: - Flags every comment against `spec-comment`-scoped entries from `red-flag-patterns.json` (stale CSV refs, TODO without ticket, FIXME without ticket, etc.)
```

### `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md` — suggested **PRESERVE**

Path: `plans/pending/SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md`

Dependency edges:
- Parent: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
- Depends on: ALL OF WAVE 1 — SUBPLAN_PARITY_W1_01, W1_03, W1_04, W1_05 (W1-02 closed-as-superseded by PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION; Wave 0 XLSX migration must also be GREEN before live audit)
- Blocks: SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md

CSV mentions (7):

```
   7: **Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
   8: **Depends on**: ALL OF WAVE 1 — SUBPLAN_PARITY_W1_01, W1_03, W1_04, W1_05 (W1-02 closed-as-superseded by PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION; Wave 0 XLSX migration must also be GREEN before live audit)
  23: - `ALREADY-RESOLVED-by-SP00` (resolved by SP00's CSV augmentation)
  40: - `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §B.5 shady-pass rows
  95: - **MD/CSV stale** → app behavior changed. Mark MD+CSV for update.
 121: | GIVER | test-cases.md, test-plans.md, CSV | (none) — verdict capture only; MD/CSV edits are W2-08 | n/a |
 161: git diff --stat clients/encore/specs/ clients/encore/src/ clients/encore/test_cases_csv/  # expect: empty
```

### `SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md` — suggested **PRESERVE**

Path: `plans/pending/SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md`

Dependency edges:
- Parent: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
- Depends on: ALL OF WAVE 1 — W1-01, W1-03, W1-04, W1-05 (W1-02 closed-as-superseded by PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION; Wave 0 XLSX migration must also be GREEN before live walks)
- Blocks: SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md

CSV mentions (3):

```
   7: **Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
   8: **Depends on**: ALL OF WAVE 1 — W1-01, W1-03, W1-04, W1-05 (W1-02 closed-as-superseded by PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION; Wave 0 XLSX migration must also be GREEN before live walks)
  43: - `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §C4, §C5
```

### `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md`

Dependency edges:
- Parent: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
- Depends on: SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md, SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md
- Blocks: SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md

CSV mentions (5):

```
   7: **Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
  30: - **MGH TC-013/014**: rewrite per MGH verdict (if SHADY, expect-bug; if MD-stale, update MD — workbook auto-rebuilds via `npm run xlsx:build` per PLAN_CSV_TO_XLSX)
  52: - `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §B per-module rows
 109: If MD stale (bug fixed): update MD to match fixed-headers expectation; workbook auto-rebuilds via `npm run xlsx:build` (no manual CSV/sheet edit per PLAN_CSV_TO_XLSX supersession).
 163: | GIVER | test-cases.md, test-plans.md, XLSX workbook | MD Status updates (SSL Partial→honest count, MGH if bug-fixed); workbook auto-rebuilds via `npm run xlsx:build` (planner-post-complete hook) | `npm run check:tc-parity` exit 0 (now uses `getXlsxTcIds()` reader per PLAN_CSV_TO_XLSX Phase B) |
```

### `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` — suggested **REWRITE**

Path: `plans/pending/SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md`

Dependency edges:
- Parent: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
- Depends on: ALL previous — W1-01..05 + W2-06, W2-07, W2-08
- Blocks: none (last subplan — closes parent plan)

CSV mentions (16):

```
   7: **Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
  45: - `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §D11, §D15-D17, §Phase 9
  71: 1. Run `node clients/encore/scripts/ci/check-xlsx-sanity.mjs clients/encore/test_cases_xlsx/encore_test_cases.xlsx` — must exit 0 (CSV target retired per PLAN_CSV_TO_XLSX Phase D).
 118: - Deliverable format migration: 11 per-module CSVs → 1 multi-sheet `encore_test_cases.xlsx` workbook (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION executed; W1-02 superseded; CSV dir + `to-csv.ts` + `--fix-csv` flag retired)
 120: - LO split: 3 separate sheets natively in workbook + 3 page-objects + 3 selectors (CSV-side split obviated by XLSX structure)
 128: 1. Edit `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`:
 131: - Append `### Execution Summary` per LR-027 — cite every subplan: **Wave 0 (XLSX migration) — PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION** (replaces W1-02; absorbs MD prereqs A1/A2/A3/GP-3/GP-4/duplicate-035) + Wave 1 W1-01/W1-03/W1-04/W1-05 (W1-02 closed-as-superseded) + Wave 2 W2-06..09 + Wave 0 SP00 augmentation. Cite every closed §B row, every Jira filed, every test count delta, and the deliverable format flip (CSV→XLSX).
 132: 2. Also flip `plans/done/SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` Status confirmation (already done-superseded; verify the parent-cascade closure-manifest references the supersession).
 133: 3. Run `node scripts/validate-plan-closure.mjs --enforce --write-manifest plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — must exit 0.
 134: 4. `git mv plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md plans/done/`.
 149: | GARDENER | refactor + CI infra | CI wired (pre-commit + PR check + weekly cron + PR template + catalog-append-only check) + Phase 9 run + final report + parent plan closure | `git log --oneline -5 plans/done/PLAN_MD_CSV*` + `cat .husky/pre-commit` + `ls .github/workflows/parity-*.yml` |
 184: grep -E "check-md-|check-xlsx-|check-comment-" .husky/pre-commit  # expect: multiple matches (xlsx-sanity replaces csv-sanity post-PLAN_CSV_TO_XLSX)
 201: ls plans/done/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md  # expect: file exists
 202: [ ! -f plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md ] && echo OK  # expect: OK
 205: node scripts/validate-plan-closure.mjs --enforce plans/done/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md && echo OK  # expect: OK
 208: grep "PLAN_MD_CSV_SPEC_PARITY" plans/INDEX.md  # expect: lists as DONE
```

### `SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md` — suggested **REWRITE-light**

Path: `plans/pending/SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md`

Dependency edges:
- Parent: MASTER_REPO_CLEANUP

CSV mentions (2):

```
  19: - **2 export folders**: `export_test_cases/` (scripts + stale CSVs) and `test_cases_csv/` (active CSVs, renamed from `exports/` 2026-05-19) — scripts are tools, output is the renamed CSVs dir
  29: 2. Rename `export_test_cases/` to `tools/export-test-cases/` (it's a tool, not test cases). Verify `to-csv.ts` outputs to `test_cases_csv/`. Update package.json scripts.
```

### `_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md` — suggested **REWRITE**

Path: `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`

CSV mentions (20):

```
   4: **Updated**: 2026-05-26 (added Wave 0 — PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION supersession of W1-02)
  12: **Plan**: [PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md](PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md)
  14: **Trigger**: JBS colleague's deliverable target flipped from "11 per-module CSVs" to "one multi-sheet `encore_test_cases.xlsx` workbook" (Overview tab + per-module tabs + trailing summary rows). CSV physically cannot host sheets per RFC 4180.
  20: - GP-3 CSV content cleansing → XLSX plan Phase 0 (MD-side scrub only; CSV dies in Phase D)
  24: **Wave 0 drops (CSV-side W1-02 work, no destination)**:
  25: - D1/D2 exporter fix — exporter rewrites wholesale to `to-xlsx.ts`; old `to-csv.ts` `git rm`'d in Phase D
  26: - A4/A5 CSV re-export — CSV deliverable retired
  27: - C3 local-office CSV split — XLSX has 3 separate native sheets; merged CSV dies with the dir in Phase D
  30: - `check-csv-sanity.mjs` → renamed `check-xlsx-sanity.mjs`, authored fresh by W1-05
  57: | C3: split CSV | ~~W1-02~~ → **Wave 0** (DROPPED — XLSX has 3 native sheets; merged CSV dies in Phase D) | superseded by XLSX structure |
  65: ### SP03 — Tooling + MD + CSV Re-Export
  69: | D1: exporter fix (one CSV per MD) | ~~W1-02~~ → **Wave 0** Phase A (rewrites to `to-xlsx.ts`) + Phase D (`git rm to-csv.ts`) | exporter format flips wholesale |
  74: | A4-A5: CSV re-export | ~~W1-02~~ → **Wave 0** DROPPED (CSV retired Phase D) | superseded |
  76: | `check-csv-sanity.mjs` authoring | ~~W1-02~~ → **W1-05** (renamed `check-xlsx-sanity.mjs`) | target flipped + author home flipped |
 102: | LI-EXTRA MD add-back | **DEFERRED — ALREADY DONE per audit** | TC-LOC-LI-064/077/SKIP-BILLING already in MD/CSV/spec; W1-04 verifies parity only |
 109: | BAS-068 add to spec + CSV | W1-04 (spec) + W1-04 Phase 10 (targeted CSV refresh) | file-only |
 121: | 24 TCs / MD / CSV / test plan / selectors / spec | **FCC master roadmap line** (`SUBPLAN_LEFT_PANEL_FCC`) | USER-AUTHORIZED drop 2026-05-26: "do not create it" |
 135: | D12: CSV cleanliness CI script | W1-05 (script) + W2-09 (wire) | split |
 149: - **9 source subplans** → **8 destination subplans** (W1-02 closed-as-superseded → tasks redistributed to Wave 0 + W1-05) + **1 FCC roadmap line** (SP07) + **Wave 0 PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION** (replaces W1-02 CSV-side; absorbs MD-side prereqs)
 152: - **W1-02 supersession (2026-05-26)**: CSV-deliverable work retired in favor of XLSX workbook. MD-side prereqs absorbed by Wave 0 Phase 0; sanity-script authoring rehomed at W1-05; downstream subplans' depends-on updated to Wave 0 + Phase D.
```
