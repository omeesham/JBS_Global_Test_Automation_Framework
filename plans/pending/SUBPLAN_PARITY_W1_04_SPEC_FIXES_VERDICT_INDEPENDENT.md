# SUBPLAN_PARITY_W1_04 — Spec Fixes (Verdict-Independent, File-Only)

> **REBASE NOTE (2026-06-11 · PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT):** this subplan's verification recipe cites `Automation Execution=Pass` and `If Failed Reason of Failure=<empty>` and recommends `xlsx:build:with-run`. All three changed: the column is now **`Automation Status`** (Pass/Fail/Skipped/Blocked), the reason lives in the merged **`Notes / Reason`** cell (a `Blocked — ` segment), and `--with-run` now performs a REAL `npx playwright test --reporter=json` run that can stamp `Fail`. Update the recipe to the merged column names + real with-run semantics before executing.

**Status**: PENDING
**Priority**: P0
**Created**: 2026-05-26

> **XLSX-migration disposition (Phase C, 2026-05-27): REWRITE-light.** Spec fixes are format-agnostic and preserved as-is. Any body reference to "targeted CSV refresh" or `to-csv.ts` re-export flips to **"targeted XLSX rebuild via `npm run xlsx:build`"** (or `xlsx:build:with-run` after a fresh suite run). Source-of-truth deliverable is now `clients/encore/testcases/encore_test_cases.xlsx`; legacy `clients/encore/test_cases_csv/` is deleted in Phase D of `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md`. See [triage ledger](../../clients/encore/specs_planning/_internal/plan-triage-ledger-2026-05-27.md).

**Identity**: BUILDER
**Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
**Depends on**: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase 0 + Phases A+B complete — MD prereqs + workbook reader cutover), SUBPLAN_PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT.md, SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE.md
**Blocks**: SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md (consumes W1-04 state)
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

W1-04 merges the verdict-INDEPENDENT spec fixes from former SP04/SP05/SP06 into one file-only subplan. Verdict-DEPENDENT items (anything requiring B.5 live-walk classification from W2-06) are deferred to W2-08.

**Items included in W1-04** (file-only):
- account_address: TC-015 wording reconciliation + TC-021/024 DROPPED comments
- auto_addon: typecheck verification (no spec change expected)
- notes: explicit Notes ID/FCC reconciliation per GP-4 (resolve duplicate TC-LOC-NTS-035 + MD/CSV/spec ID alignment)
- local_information: verify LI-EXTRA parity (already done per audit; no MD authoring needed)
- BAS-068: add to spec; workbook auto-rebuilds via `npm run xlsx:build` on planner-post-complete (file-only addition; intent confirmed by W1-01 E6)
- HIS-7: replace bare `>0` column count with 42-column enumeration (deterministic file edit)
- ECT-018: implement (file-only addition)
- smoke_seed: execute per W1-01 E5 decision outcome (restore or delete)
- Comment/MD sanity + exhaustive discovery passes

**Items EXCLUDED from W1-04** (moved to W2-08):
- LGL-015: requires left-panel Country selector (verified missing from `left-panel.ts`); W2-08 owns discovery + selector addition
- LGL-016/017 Jira citations: depend on W2-06 confirming bug reproducibility
- CUR shady-pass classification: requires W2-06 verdict
- PRI TC-018/019/022 rewrite: requires W2-06 verdict (HONEST vs SHADY)
- MGH TC-013/014 rewrite: requires W2-06 verdict (bug fixed vs bug present)
- MGH TC-006/007/019 un-skip: requires e2e for RCA
- SSL fixmes (TC-031/032/007/026/030): requires e2e to un-skip + RCA
- BAS-048 un-skip: requires e2e
- ECT-001/010 verdict: requires W2-06 verdict

**Post-W1-04 XLSX rebuild** (per PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION supersession): W1-04 adds BAS-068 + ECT-018 to specs AFTER XLSX plan Phase A workbook build. New TCs flow into the workbook on next `npm run xlsx:build` (auto-invoked by planner-post-complete). No targeted update script needed — workbook reads from MD source of truth; SP00 augmentation re-runs on full build.

Provenance: restructured from `SUBPLAN_PARITY_04_SPEC_FIXES_EASY_MODULES.md` + `SUBPLAN_PARITY_05_SPEC_FIXES_INVESTIGATIVE.md` + `SUBPLAN_PARITY_06_SPEC_FIXES_LOCAL_OFFICE_TRIO_AND_SMOKE.md` (verdict-independent items only) per Wave 1/Wave 2 split (2026-05-26).

---

## Bootstrap

**Identity**: BUILDER (spec authoring/fixing — Opus for FCC reconciliation judgment)

**Skills auto-called**:
- `/identity`, `/regression-guard` (wrap), `/relevant`, `/final-q`

**Context files**:
- `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §B per-module rows for the modules in scope
- `clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-<date>.md` — E5 smoke_seed decision, E6 BAS-068 confirmation
- `clients/encore/tests/locations/location-notes.spec.ts` — Notes spec with duplicate TC-LOC-NTS-035
- `clients/encore/tests/local-office/local-office-{basic-info,history,ect}.spec.ts` — post-W1-03 split specs
- `.claude/rules/specs.md` (LR-019 baseline, LR-021 un-skip, LR-022 no hardcoded counts)
- `.claude/rules/angular.md` (LR-009..011, LR-026 dirty-state)
- `clients/encore/CLAUDE.md` (LR-036 boolean render formats)

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm W1-01, W1-02, W1-03 all closed GREEN.
2. Confirm B.5 pre-triage rows W1-04 needs (BAS-068, HIS-7, ECT-018, LI-EXTRA, smoke_seed) are classified `OBVIOUS-from-source` or `ALREADY-RESOLVED-by-SP00` in W1-01's artifact.
3. Read navigation.md, agent-mistakes.md per `/execute` Phase 0.
4. **BrowserTool announcement**: `BrowserTool=none`. Reason: every item in W1-04 is verdict-independent file work.

---

## Phase 1+ — Actual work

### Phase 1 — Drift Check (MANDATORY)

1. Re-Glob each spec in scope.
2. Re-Grep for each parent §B claim per module (verify against current state).
3. Cross-check W1-01's pre-triage artifact — confirm classification still applies.
4. Read activity log since 2026-05-26.
5. Emit Drift Note. >30% stale → HALT.

### Phase 2 — account_address (file-only)

1. Verify TC-015 spec wording matches MD wording (per W1-02 reconciliation choice).
2. Add inline `// DROPPED: <reason from MD>` comment near where TC-021 / TC-024 would have lived in `location-account-address.spec.ts`.

### Phase 3 — auto_addon (file-only)

1. `npx tsc --noEmit` against `location-auto-addon.spec.ts` — expect clean.
2. Verify 20/20 TCs present (count `test('TC-LOC-AAO-` matches).
3. No code changes expected unless drift surfaced.

### Phase 4 — notes: GP-4 reconciliation

Critical auditor finding — Notes module has duplicate TC-LOC-NTS-035 (lines 425 + 1085) and three-way ID drift (MD has FCC IDs, spec uses normalized; post-XLSX migration the workbook auto-inherits from MD so spec-side normalization is the only manual reconciliation needed).

1. **Resolve duplicate TC-LOC-NTS-035**:
   - Line 425: `test.fixme('TC-LOC-NTS-035: Delete one of one (single row) — empty state persists', ...)` — blocked by BUG-LOC-NTS-004
   - Line 1085: `test('TC-LOC-NTS-035: Save empty row — persists as empty textarea, not No Notes Available', ...)` — passing test
   - Recommended: rename line 425 to next available TC ID (e.g., TC-LOC-NTS-062 or whatever next slot per SP00's renaming ledger). Update the fixme + the `id:` field + any BUG references.
   - **Confirm with user before mass-rename** (per `feedback_question_style.md` — single chat question).
2. **MD ↔ XLSX ↔ spec alignment** (per LR-ENC-002):
   - XLSX migration Phase 0 already reconciled MD FCC IDs → normalized IDs in the MD source. Verify here.
   - Verify spec has corresponding test for every MD TC.
   - Verify workbook `locations_notes` sheet has corresponding row for every MD TC (use `npm run xlsx:dump | grep TC-LOC-NTS-`).
3. Run `npm run check:tc-parity` — must exit 0 (now uses `getXlsxTcIds()` reader per XLSX plan Phase B).

### Phase 5 — local_information (verify only)

Auditor confirmed LI-064/077/SKIP-BILLING already exist in MD/XLSX/spec. Verify parity:
- `grep -c "TC-LOC-LI-064\|TC-LOC-LI-077\|SKIP-BILLING" clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` — expect >= 3
- `npm run xlsx:dump | grep -c "TC-LOC-LI-064\|TC-LOC-LI-077\|SKIP-BILLING"` — expect >= 3 (workbook `locations_local_information` sheet)
- Same grep on spec

No MD authoring needed (was originally in SP05 scope; superseded by audit).

### Phase 6 — BAS-068 (file-only addition, intent confirmed by W1-01 E6)

1. Read BAS-068 section in `local_office_basic_info_test_cases.md` (already split — confirmed via Glob in XLSX plan Phase 0).
2. Author `test('TC-LOS-BAS-068: ...', ...)` in `clients/encore/tests/local-office/local-office-basic-info.spec.ts` (post-W1-03 split) — mirror neighbor TC pattern.
3. Workbook row auto-emitted on next `npm run xlsx:build` from MD source of truth (no manual row authoring needed post-XLSX migration).

### Phase 7 — HIS-7 (deterministic enumeration)

In `clients/encore/tests/local-office/local-office-history.spec.ts`, find TC-002 assertion:
- Current: `expect(count).toBeGreaterThan(0)` for column header count
- Replace with: `expect(columns).toEqual([<42 column names from MD>])`

Read the 42 column names from `local_office_history_test_cases.md` (already split — confirmed via Glob in XLSX plan Phase 0). Use an array literal in the spec.

Per LR-036: confirm boolean readers use the correct render format detection for HIS table (Unicode ✔ vs SVG lucide-check). HIS uses Unicode per LR-036; LOS HIS uses SVG. Verify the spec's existing helpers use the right detection per table.

### Phase 8 — ECT-018 (file-only addition)

Read `local_office_ect_test_cases.md` TC-018 (sub-section-headings). Author `test('TC-LOS-ECT-018: ...', ...)` in `clients/encore/tests/local-office/local-office-ect.spec.ts` mirroring neighbor TC patterns.

### Phase 9 — smoke_seed (per W1-01 E5 decision)

If E5 = "restore":
1. Copy `seed.spec.ts` content from `.claude/worktrees/loving-allen-408532/clients/encore/tests/specs/smoke/seed.spec.ts` (or wherever the worktree mirror lives) to `clients/encore/tests/smoke/seed.spec.ts`
2. Update imports for the new path structure (post-2026-05-19 restructure)

If E5 = "delete":
1. Grep `seed.spec.ts` repo-wide
2. Delete every reference (fixture entries, dependencyGate edges, MD mentions, plan references)
3. Confirm `git grep "seed.spec.ts"` returns empty

### Phase 10 — Post-W1-04 XLSX rebuild (per PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION supersession)

After Phases 6 + 8 add BAS-068 + ECT-018 to specs, rebuild workbook:
1. Run `npm run xlsx:build` — full rebuild (sub-second; no full-suite test run needed). New TCs auto-included from MD + `--list` enumeration.
2. For each new TC, verify column values: `Coverage Status=Automated`, `Automation Execution=Pass` (assumed-pass per `--list`-only mode; for authoritative Pass/Fail run `npm run xlsx:build:with-run`), `If Failed Reason of Failure=<empty>`.
3. Workbook is the single source of truth post-migration — no targeted column scripts.

### Phase 11 — Comment/MD sanity + exhaustive discovery passes

For every spec touched in W1-04:
1. Run `node clients/encore/scripts/ci/check-comment-sanity.mjs <files>` (script authored in W1-05 — absorbed from defunct W1-02)
2. Manual scan beyond catalog
3. Every new pattern → append to `red-flag-patterns.json`
4. Re-run scripts — must exit 0

---

## Per-Identity Satisfaction Matrix (LR-048 v2)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) — no new behavior | n/a |
| GIVER | test-cases.md, test-plans.md, XLSX workbook | Notes ID reconciliation in MD + XLSX rebuild for BAS-068/ECT-018 via `npm run xlsx:build` | `npm run check:tc-parity` exit 0 (now reads from XLSX per PLAN_CSV_TO_XLSX) |
| BUILDER | specs/<module>/*.spec.ts | account_address comments + Notes ID rename + BAS-068 test + HIS-7 enumeration + ECT-018 test + smoke_seed restore/delete + sanity passes | `npx playwright test --list` resolves all changed TCs |
| HEALER | per-fix MD update | Notes MD Status sync if rename changes anything | grep MD for current state |
| WATCHDOG | findings table | (none) | n/a |
| GARDENER | refactor citation | (none) — code logic changes only, no structural refactor | n/a |

All non-(none) cells classified (a) MCP-proven per LR-040.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed: DO-NOW / SPAWN / APPEND. Bare "out of scope" = HALT.

---

## Acceptance criteria

- [ ] account_address: TC-015 wording aligned with MD; TC-021/024 DROPPED comments inline
- [ ] auto_addon: `npx tsc --noEmit` clean; 20 TCs present
- [ ] Notes: zero duplicate TC IDs (`grep -c "TC-LOC-NTS-035" location-notes.spec.ts` = 1); MD/XLSX/spec ID parity confirmed via `check:tc-parity`
- [ ] local_information: LI-064/077/SKIP-BILLING parity verified (no edits needed)
- [ ] BAS-068: test present in `local-office-basic-info.spec.ts`; workbook row present in `local_office_settings` sheet (verify via `npm run xlsx:dump`)
- [ ] HIS-7: TC-002 enumerates 42 columns (no bare `>0`)
- [ ] ECT-018: test present in `local-office-ect.spec.ts`
- [ ] smoke_seed: per E5 outcome — either present in `specs/smoke/` or zero references repo-wide
- [ ] XLSX workbook rebuilt via `npm run xlsx:build`; BAS-068 + ECT-018 rows present in respective module sheets with `Coverage Status=Automated`
- [ ] Comment sanity script exits 0 on all touched files
- [ ] `/regression-guard` snapshot diff matches expectation
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes
- [ ] `/final-q` verdict block emitted

---

## Verification

```bash
# No duplicate TC-LOC-NTS-035
grep -c "TC-LOC-NTS-035" clients/encore/tests/locations/location-notes.spec.ts  # expect: 1

# BAS-068 and ECT-018 present
grep -c "TC-LOS-BAS-068" clients/encore/tests/local-office/local-office-basic-info.spec.ts  # expect: >= 1
grep -c "TC-LOS-ECT-018" clients/encore/tests/local-office/local-office-ect.spec.ts  # expect: >= 1

# HIS-7 enumerates columns (no bare >0)
grep -A 5 "TC-LOS-HIS-002" clients/encore/tests/local-office/local-office-history.spec.ts | grep -c "toBeGreaterThan(0)"  # expect: 0

# smoke_seed per decision
[ -f clients/encore/tests/smoke/seed.spec.ts ] || git grep "seed.spec.ts" clients/encore/ | wc -l  # expect: file exists OR 0 refs

# Parity check
npm run check:tc-parity  # expect: exit 0

# XLSX rebuild for new TCs (post PLAN_CSV_TO_XLSX migration)
npm run xlsx:build
npm run xlsx:dump | grep "TC-LOS-BAS-068\|TC-LOS-ECT-018"  # expect: both present with Coverage Status=Automated
```

---

## Handoff (post-execution)

File-only spec fixes complete. W2-08 inherits: clean spec state, deterministic edits done, verdict-dependent items remain (LGL-015, PRI, MGH, ECT-001/010, SSL fixmes, BAS-048).
