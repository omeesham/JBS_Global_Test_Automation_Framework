---
title: Replace 11 per-module CSVs with one multi-sheet XLSX workbook (encore_test_cases.xlsx)
permissionMode: bypassPermissions
model: opus
thinking: max
identity: OWNER
client: encore
scope: framework + clients/encore/
phases: A, B, C, D (atomic-safe; do not collapse)
author: Rutvik
created: 2026-05-26
target_repo_location: clients/encore + repo root + plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md
---

# Plan — Replace 11 per-module CSVs with one multi-sheet XLSX workbook (`encore_test_cases.xlsx`)

> **Auditor pass-back state**: 3 audit passes folded in (covering 7+7+7 findings). Plan is locked, executable, with hard row-parity gates and explicit W1/W2 dependency handling.

> **⚠ HARD WARNING — W1-02 retirement (auditor pass 3)**: Do NOT execute `SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` as written. Its CSV-specific phases (Phase 2 schema reconciliation, Phase 9 CSV cleansing, Phase 10 LO CSV split, Phase 11 CSV re-export, Phase 12 `check-csv-sanity.mjs`) are SUPERSEDED by this XLSX migration. W1-02's MD-side work (A1 path updates, A2 header counts, A3 Status sync, GP-4 Notes ID reconciliation) is absorbed into Phase 0 below. Any agent that runs W1-02 as-written rebuilds the obsolete CSV deliverable and undoes this plan. Phase C explicitly retires W1-02.

> **Merged execution sequence with the W1/W2 wave** (auditor finding 7):
> 1. **W1-01** (decisions — most already resolved per its body)
> 2. **This plan Phase 0** — absorbs W1-02 MD-only work (Phases A1/A2/A3/GP-3/GP-4/duplicate-035-resolution); does NOT do CSV-side work
> 3. **W1-03** (LO code split — page objects + selectors + fixtures + spec imports) — format-agnostic; parallel-safe with Phase 0
> 4. **W1-04** (file-only spec fixes — format-agnostic; replace "targeted CSV refresh" with "targeted XLSX rebuild" in its body during Phase C)
> 5. **This plan Phase A** — build workbook from cleaned MDs + playwright list
> 6. **This plan Phase A.5** — N1 semantic rename (sibling exporters protected)
> 7. **This plan Phase B** — rewire readers/rules/agents/scripts
> 8. **This plan Phase C** — manual per-plan triage (REWRITE/DROP/PRESERVE/REVIEW); W1-02 dropped-as-superseded; W1-05 + W2-09 retargeted; W1-04 + W2-08 CSV-refresh refs flipped to XLSX
> 9. **This plan Phase D** — delete CSVs (gated on fresh row-parity check)
> 10. **W1-05** (CI validators — now XLSX-targeted)
> 11. **W2-06 / W2-07** (e2e walks — format-agnostic; whenever e2e is back)
> 12. **W2-08** (verdict-dependent spec rewrites; trigger XLSX rebuild after spec edits land)
> 13. **W2-09** (CI wire + full-suite + final parity report → cites XLSX-orphans; close parent plan)

---

## Bootstrap (read FIRST in a new session — self-contained execution context)

**Repo**: `C:\Users\rutvi\projects\encore_framework` (Windows; both PowerShell and Bash tools available)
**Active client**: encore (`clients/encore/`)
**Active branch**: `client_deliverable` (verify with `git branch --show-current`)
**Identity**: OWNER (cross-cutting framework change — touches agent prompts, rules, pipeline scripts, exporters, plans)
**Plan-execution skill**: `/execute` (auto-routes; runs adversarial audit before mutating files)

**SUPREME RULE — NEVER ASSUME** (from `CLAUDE.md`): REMEMBER → ASK → AUDIT → EXECUTE. Every ambiguity → ASK Rutvik first. This plan already locked all known decisions; if a NEW ambiguity surfaces mid-execution (e.g., a file the audit missed), HALT and ask before mutating.

**Pre-execution sanity checks** (run before Phase A):
1. `git status` — working tree must be clean (or only this plan file dirty)
2. `git branch --show-current` — expect `client_deliverable`
3. `npm install` — ensures `exceljs ^4.4.0` + `xlsx ^0.18.5` from `package.json` are present
4. Read `clients/encore/CLAUDE.md` (active-client rules, LR-ENC-002 in particular)
5. Read `.claude/rules/pipeline.md` (LR-041 / LR-046 / LR-048 / LR-049 / LR-050)
6. Read `export_test_cases/README.md:246-253` (confirms SP00 augment provenance — `playwright --list --reporter=json` + source-file regex)
7. Verify XLSX libs: `node -e "require('exceljs'); require('xlsx'); console.log('OK')"`
8. Run `npm run check:tc-parity` baseline — record current orphan counts (should be 0; if non-zero, fix BEFORE starting migration)
9. **excelAdapter.ts boundary guard** (auditor finding #6): confirm zero files under `clients/encore/src/data/testdata/` are `.csv` format AND no test-case caller of `excelAdapter.load()` passes a `.csv` path. Adapter's dual-format capability STAYS (test-data layer is a separate concern from test-case workbook). If a `.csv` test-data fixture exists, decide: (a) convert to `.xlsx`, OR (b) accept the boundary and add a 1-line docstring clarification on the adapter. Either way, document the decision in the activity log.

**Key reference files** (read on demand, not all upfront):
- Agent prompts: `.claude/agents/{GENERATOR,PLANNER,AUDIT,HEALER,MAINTAINER}.md` + `.claude/agents/{RUTVIK,COLLEAGUE}.agent.md`
- Rules: `.claude/rules/pipeline.md`, `clients/encore/CLAUDE.md`, `docs/read_only_docs/AGENT_SHARED_RULES.md`
- Exporters: `export_test_cases/{to-csv,to-json,to-jira,to-testmo,markdown-parser,types,index}.ts`
- Pipeline scripts: `scripts/{check-tc-parity,planner-post-complete,generator-post-complete,validate-queue-integrity,sync-agent-mistakes,shared-paths,shared-types,sp00-audit-v5,ship-client}.{ts,sh,mjs}`
- Queue data: `clients/encore/specs_planning/_internal/agent-queue.json` (11 active `csvExport` paths + 12 history rows to migrate)
- Pre-commit hook: `.githooks/pre-commit`
- Pre-existing CSVs (Phase D deletes): `clients/encore/test_cases_csv/*.csv` (11 files, 474 rows total)
- Legacy CSVs (Phase D deletes): `export_test_cases/exports/*.csv` (11 stale files Feb–Mar 2026)

**How to execute (new session)**:

```
# From a clean working tree, in the repo root:
/execute plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md
# (path after repo-move; if reading directly from scratch dir, use the .claude path)
```

`/execute` runs `pre-research → gap-analysis → adversarial-audit → implement → post-execute audit`. The four phases below MUST each land as their own commit (Phase A, then B, then C, then D) — Gate A in `.githooks/pre-commit` runs `check:tc-parity`, and collapsing phases into one commit causes the migration commit to self-trip. Do not bypass `--no-verify` (LR-049 / §16 violation).

**Stop conditions** (HALT immediately + ask Rutvik):
- Phase A: `npm run xlsx:build` fails or produces a workbook missing the Overview sheet OR any module sheet
- Phase A: any of 11 module sheets has 0 data rows when source MD is non-empty
- Phase A: cross-tool open (Excel + Google Sheets + Numbers) shows broken styling or missing tabs
- Phase B: `npm run check:tc-parity` returns non-zero after the XLSX-reader switch
- Phase B: pre-commit Gate A fires false-positive (test commit blocked when XLSX IS fresh)
- Phase C: bulk find-replace touches a plan body in a way that breaks its semantic meaning (e.g., changes a historical "CSV format" reference to "XLSX format" where the original meaning was specifically about CSV-the-format)
- Phase D: dry-run ship shows `test_cases_csv/` OR `export_test_cases/exports/` present in the archive
- Phase D: mock-repo workflow turns red after push
- Any phase: a file mutation that wasn't enumerated in the Files Inventory below — HALT, treat as missed surface, audit, and ASK before continuing

**Repo-move on accept**:
After ExitPlanMode approval, this file moves from `C:\Users\rutvi\.claude\plans\this-is-how-the-crystalline-flask.md` (scratch) to `C:\Users\rutvi\projects\encore_framework\plans\pending\PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` (repo). `plans/INDEX.md` regenerated to list it. The scratch copy is deleted.

---

---

## Context

A JBS colleague sent a screenshot showing the deliverable they want: a single Excel workbook with an `Overview` tab first (quantitative summary for CEO/CTO consumption) and one tab per module/submodule, each module tab ending with a trailing summary row repeating those quantities plus the date the workbook was last updated.

Current state: **11 per-module CSVs** in `clients/encore/test_cases_csv/` with **474 total data rows** (verified — not 485 as initially claimed):

| CSV | Rows | Schema variant |
|---|---|---|
| `local_office_settings_test_cases.csv` | 85 | col 5 = `Tags` |
| `locations_account_address_test_cases.csv` | 28 | col 5 = `Specific Field` |
| `locations_auto_addon_test_cases.csv` | 20 | `Specific Field` |
| `locations_currency_test_cases.csv` | 27 | `Specific Field` |
| `locations_left_panel_test_cases.csv` | 24 | `Specific Field` |
| `locations_legal_test_cases.csv` | 18 | `Specific Field` |
| `locations_local_information_test_cases.csv` | 114 | `Specific Field` |
| `locations_management_history_test_cases.csv` | 19 | `Specific Field` |
| `locations_notes_test_cases.csv` | 61 | `Specific Field` |
| `locations_pricing_test_cases.csv` | 34 | `Specific Field` |
| `locations_shared_setup_locations_test_cases.csv` | 44 | `Specific Field` |
| **Total** | **474** | |

CSV format CANNOT have sheets (RFC 4180 = one flat table per file). The colleague's screenshot is unambiguously Excel. `exceljs ^4.4.0` and `xlsx ^0.18.5` are already in `package.json` — zero new dependencies.

This plan switches the deliverable to XLSX **permanently**: CSVs deleted, every reader/writer/agent/rule/script/plan rewired to the workbook.

---

## Locked decisions (all 7 original + auditor corrections)

| # | Decision | Choice (final) |
|---|---|---|
| 1 | CSV fate | Delete entirely. Rewrite `to-csv.ts`, `check-tc-parity.ts`, `sp00-audit-v5.mjs`, and 6 agent HARD STOPs to read XLSX |
| 2 | Overview shape | **Automation-team metric set** (per auditor): `Sheet` · `Total` · `Automated` · `Pending Automation` · `Pass` · `Fail` · `Skipped` · `Blocked` · `% Pass of Total` · `% Pass of Executed` · `% Automation Coverage` · `Last Updated`. Word "Manual" never appears anywhere in workbook. |
| 3 | Workbook lifecycle | Committed at `clients/encore/test_cases_xlsx/encore_test_cases.xlsx`; auto-rebuilt by `npm run planner:post-complete` |
| 4 | Trailing row | Visually separated (blank row + bold + light gray fill); same metric set as Overview entry for that sheet + `Last Updated` |
| 5 | Filename | `encore_test_cases.xlsx` (stable; date inside file, not in filename) |
| 6 | Sheet naming | Truncated full names — drop `_test_cases` suffix from CSV basenames |
| 7 | Styling | Minimal — bold header row, freeze pane row 1, autosize columns. No conditional fills |
| **F1** | Per-row `Automated` column | **Keep** the column. Rename header `Automated` → `Coverage Status`. Values `Yes` → `Automated`, `No` → `Pending Automation`. **Never** "Manual" anywhere. |
| **F2** | `% Pass` denominator | Show **both**: `% Pass of Total` and `% Pass of Executed (Total − Skipped − Blocked)`. CTO sees both perspectives. |
| **F3** | Per-row Last Run Date | **Skip.** Repo has no per-TC run-date evidence. Workbook-level `Last Updated` in Overview + summary rows is enough. |
| **U1** | Augment script origin | Already documented in `export_test_cases/README.md:246-253`: SP00 reads `playwright --list --reporter=json` for `Coverage Status` + `Automation Execution`, source-file regex `test.fixme(true, '<reason>')` for failure reason. **Inline into `to-xlsx.ts`** so single command = MD + playwright list → workbook. No hand-edit collision risk. |
| **P1** | Parent plan + 36 pending plans | Repo-wide pending-plan triage — bulk find-replace `csv`→`xlsx` + manual structural review across all 36 hits. `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT` closes as superseded by this plan; `plans/INDEX.md` regenerated with migration-date header |
| **M1** | User-memory feedback files | Leave alone — user-preference layer, not framework code |
| **S1** | `Tags` vs `Specific Field` | Canonical **13-column XLSX schema** with BOTH `Specific Field` AND `Tags` as separate columns; empty cells where N/A. Uniform sheet shape, slight bloat, no information loss. |
| **PL1** | Pending-plan pass scope | Phase C below — automated find-replace + manual structural review pass across all 36 pending plans + INDEX regeneration |
| **N1** | `Manual` rename scope (REVISED per auditor) | **Targets classification/metric framing only — NOT the word "manual" in ordinary English or external-tool vocab.** IN SCOPE: `automationStatus: Manual` union literal (`types.ts:98`), `metadata.manual: number` field name (`types.ts:137`), `validateAutomationStatus()` default (`markdown-parser.ts:382-384`), `manual` metadata key in JSON output (`to-json.ts`), Overview classification labels. OUT OF SCOPE: TC prose like "manually re-selected", "user manually clicked"; variable/function names not matching classification context; Jira `Test Type: Manual` external vocab (preserved via `to-jira.ts` mapping layer); historical document text. MD source needs no migration (verified: zero MD files contain `Automation Status: Manual` literal). |
| **N2** | Website CSV surfaces | **Out of scope.** 12 files under `website/` (chatbot.service.ts, ChatPage.tsx, test-cases.routes.ts, TestCaseResults.tsx, types/index.ts, plus `dist/`) are a different feature (chatbot UI for a different audience). No changes in this plan. |

---

## Verified facts (from this session's reads)

- **Row count**: 474 total (per `Import-Csv` count). Prior plan's "485" was wrong.
- **Schema variant**: `local_office_settings_test_cases.csv` col 5 = `Tags`; all 10 locations CSVs col 5 = `Specific Field`. All other 11 columns identical across files.
- **SP00 augment provenance**: documented in `export_test_cases/README.md:246-253`.
- **`export_test_cases/exports/` exists**: 11 stale CSVs (Feb–Mar 2026 mtimes). Plan now says delete explicitly.
- **36 pending plans mention CSV** (not 7). Includes PARITY series (W1/W2/00–08), DQU series, repo-cleanup, restructure-pending, master-cleanup, big-pivot-FCC, agent-authoring-efficiency, vertical-restructure, more.
- **12 website files mention CSV**. Separate concern — pending **N2** answer.

---

## Overview sheet — final column shape (12 columns, per auditor)

| Col | Header | Source / formula |
|---|---|---|
| A | `Sheet` | sheet name (hyperlink to that sheet) |
| B | `Total` | data-row count in that sheet (excludes header + blank + trailing summary) |
| C | `Automated` | count `Coverage Status = Automated` |
| D | `Pending Automation` | count `Coverage Status = Pending Automation` |
| E | `Pass` | count `Automation Execution = Pass` |
| F | `Fail` | count `Automation Execution = Fail` |
| G | `Skipped` | count `Automation Execution = Skipped` |
| H | `Blocked` | count `Automation Execution = Blocked` |
| I | `% Pass of Total` | Pass / Total |
| J | `% Pass of Executed` | Pass / (Total − Skipped − Blocked) |
| K | `% Automation Coverage` | Automated / Total |
| L | `Last Updated` | workbook build ISO date (same for all rows in a build) |

Row 1 = bold header, frozen. Rows 2..12 = one per module sheet. No grand-total row.

Above the header (row 0 area / sheet-level): `Generated on YYYY-MM-DD` + `Workbook version: encore_test_cases.xlsx v<build-tag>`.

---

## SP00 augmentation mapping (exact rules — auditor finding 4)

`playwright --list --reporter=json` proves TC PRESENCE, not last-run Pass/Fail. The Overview metrics inherit this limitation. Explicit mapping rules:

| Column | Derivation source | Exact rule |
|---|---|---|
| `Coverage Status` | `playwright --list` TC-ID enumeration | TC ID present in `--list` output → `Automated`. TC ID present in MD but absent from `--list` → `Pending Automation` |
| `Automation Execution` | `playwright --list` mode field, default mode + `--with-run` flag | **Default (`xlsx:build`)**: `--list` mode = test → `Pass` (ASSUMED — see caveat). mode = skip → `Skipped`. mode = fixme → `Blocked`. TC absent from `--list` → empty cell. **With `--with-run` flag (`xlsx:build:with-run`)**: actual pass/fail from `playwright test --reporter=json` run output |
| `If Failed Reason of Failure` | source-file regex `test.fixme(true, '<reason>')` per TC ID | Match the literal `test.fixme(true, ...)` call site for the TC; extract the second-arg string. Empty when no fixme. Fallback: `// FIXME: <reason>` line above the test, via `scripts/scan-fixmes.ts` registry |

**Caveat in plain English (must appear in deliverable README + `xlsx:build` startup log)**: in default mode, `Pass` means "automated and not skipped/fixme; last run results require a fresh `playwright test` invocation to be authoritative." The `--with-run` flag rebuilds with actual run results. CI invocations of `xlsx:build:with-run` produce the authoritative Pass/Fail numbers.

**Why two modes**: `--with-run` requires a full suite run (~10–20 min); default mode is sub-second. Day-to-day rebuilds use default; the CI workflow that ships to the colleague uses `--with-run`. Documented in the workbook's `Overview` sheet header as `Generated on YYYY-MM-DD HH:MM (mode: list-only|with-run)` so the colleague knows which kind of build they're looking at.

**Failure-reason inputs already in repo** (verified): the augmentation logic re-uses `scripts/scan-fixmes.ts` registry pattern. New module `export_test_cases/sp00-augment-logic.ts` consolidates the playwright-list parse + fixme regex + scan-fixmes integration into one testable surface.

---

## Per-module sheet — canonical 13-column schema

**Header row** (row 1, bold, frozen):
`TC ID` | `Title` | `Module` | `Submodule` | `Specific Field` | `Tags` | `Preconditions` | `Steps` | `Expected Result` | `Notes` | `Coverage Status` | `Automation Execution` | `If Failed Reason of Failure`

(Both `Specific Field` AND `Tags` present; empty cells where N/A — only `local_office_settings` populates `Tags` today.)

**Data rows**: rows 2..N+1, one TC per row.

**Blank row**: row N+2 (visual separator).

**Trailing summary row**: row N+3, bold + light gray fill.
- `TC ID` = `SUMMARY` · `Title` = module display name · same metric values as Overview row for this sheet · last cell = `Last Updated: YYYY-MM-DD`.

---

## Sheet-name table (13 module sheets + Overview = 14 tabs)

| MD source basename | New sheet name | Length |
|---|---|---|
| `local_office_settings_test_cases.md` | `local_office_settings` | 21 |
| `local_office_history_test_cases.md` | `local_office_history` | 20 |
| `local_office_ect_test_cases.md` | `local_office_ect` | 16 |
| `locations_account_address_test_cases.md` | `locations_account_address` | 25 |
| `locations_auto_addon_test_cases.md` | `locations_auto_addon` | 20 |
| `locations_currency_test_cases.md` | `locations_currency` | 18 |
| `locations_left_panel_test_cases.md` | `locations_left_panel` | 20 |
| `locations_legal_test_cases.md` | `locations_legal` | 15 |
| `locations_local_information_test_cases.md` | `locations_local_information` | 27 |
| `locations_management_history_test_cases.md` | `locations_management_history` | 28 |
| `locations_notes_test_cases.md` | `locations_notes` | 15 |
| `locations_pricing_test_cases.md` | `locations_pricing` | 17 |
| `locations_shared_setup_locations_test_cases.md` | `locations_shared_setup_locations` | **31 (cap)** |

13 module sheets + `Overview` (first tab) = **14 tabs total**. `toSheetName(slug): string` helper HALTs on overflow + unit tests for all 13 current sheet names + a synthetic 32-char case.

---

## Phased sequencing — 0 → A → A.5 → B → C → D (atomic-safe; sibling exporters protected; row-parity gated)

Pre-commit Gate A runs `check:tc-parity`. If XLSX-reader lands same commit as CSV deletion, the migration commit self-trips. Six phases instead. Phase 0 prereq absorbs the MD-side of W1-02 (auditor finding: subplan-overlap). Phase A.5 isolates the N1 semantic rename so sibling exporters (`to-jira`, `to-testmo`, `to-json`) get an independent verification step (auditor finding 5).

### Phase 0 — MD prerequisites (absorb W1-02 MD-side work — NOT CSV side)

Workbook quality is bounded by source-MD quality. Before Phase A can produce a clean XLSX, the following from W1-02 must land first (W1-02 itself gets retired in Phase C):

- **A1 — MD `Automation File:` path updates** (9 MDs): rewrite stale `tests/specs/setup/...` → `specs/...`
- **A2 — MD header count fixes** (5 modules): currency 28→27, legal 19→18, pricing 35→33, account_address 29→28, shared_setup_locations 25→24
- **A3 — MD Status sync** (3 modules): auto_addon Manual→Automated, pricing mixed→honest, shared_setup_locations Automated→Partial
- **GP-4 — Notes ID/FCC reconciliation**: **ABSORBED by SUBPLAN_XLSX_PREP_01 (2026-05-26)** — no-op confirmation. The 25 NTS rename + 14 SSL rename + 1 FCC-028 drop + 3 collision-resolution IDs (NTS-062/063/064) + 1 NTS-059 MD backfill all landed in the upstream subplan's Phase 3. This GP-4 line item is preserved here as audit trail; no work to do.
- **Duplicate `TC-LOC-NTS-035` resolution**: spec lines 425 + 1085 both use this ID — rename one (default: line 425, since it's the older fixme; confirm with user before rename)
- **GP-3 — CSV content cleansing** (light pass): scrub hardcoded e2e URL leaks (`cloudapps-e2e.encoreglobal.com`) from `Preconditions`/`Steps` cells in source MD (so XLSX inherits clean text)
- **Local-office MD verification (NOT split — auditor finding 2)**: The 3 local-office MDs **already exist** (confirmed via `Glob`): `local_office_settings_test_cases.md`, `local_office_history_test_cases.md`, `local_office_ect_test_cases.md`. Phase 0 only verifies they are clean and scope-pure (BAS-only / HIS-only / ECT-only content). The MERGED file is on the CSV side — `clients/encore/test_cases_csv/local_office_settings_test_cases.csv` (85 rows = BAS + HIS + ECT mixed). The merged CSV disappears with the entire CSV directory in Phase D. No MD split work needed.

After Phase 0: **13 source MDs** total (10 locations + 3 local-office), all clean, all properly counted. Workbook will have **14 tabs** (Overview + 13 module sheets).

### Phase A — Build XLSX from MDs + playwright (isolated workbook code only; row-parity hard gate)
- **CREATE** `export_test_cases/to-xlsx.ts` (new emitter, uses `exceljs`). Reads MDs via local parser fork that does NOT touch shared `types.ts` / `markdown-parser.ts` (N1 rename deferred to Phase A.5).
- **CREATE** `export_test_cases/sp00-augment-logic.ts` — extracted SP00 augmentation per the explicit mapping below
- **CREATE** `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` (first build, committed)
- **CREATE** `scripts/xlsx-freshness.ts`, `scripts/xlsx-dump.ts`, `scripts/xlsx-vs-csv-parity.mjs`, `scripts/migrate-queue-csv-to-xlsx.mjs`
- **ADD** `package.json` scripts: `xlsx:build`, `xlsx:build:with-run`, `xlsx:freshness`, `xlsx:dump`, `xlsx:vs-csv-parity`. Old `planner:post-complete` unchanged in Phase A.
- **SHARED PARSER FILES UNTOUCHED** in Phase A: `export_test_cases/types.ts`, `markdown-parser.ts`, `to-json.ts`, `to-jira.ts`, `to-testmo.ts`, `index.ts` (N1 rename moves to Phase A.5; auditor finding 5)
- **VERIFY (HARD GATE — auditor finding 3)**:
  1. `npm run xlsx:build` produces workbook; opens cleanly in Excel + Google Sheets + Numbers; **14 tabs** (Overview + 13 module: 10 locations + 3 local-office); trailing rows visible
  2. `npm run xlsx:vs-csv-parity` exits 0 — XLSX→CSV dump matches all current CSV data rows (474 total, or post-Phase-0 corrected count after MD header fixes) modulo: (a) new schema cells (added `Tags`/`Specific Field` empties + summary rows + `Coverage Status` rename from `Automated`), (b) the merged `local_office_settings.csv` (85 rows) splits across 3 sheets — comparison logic must group BAS/HIS/ECT rows by TC ID prefix and match against the corresponding sheet. Per-row hash comparison required within each group. Any unexplained drift = HALT.
  3. Sheet-name helper unit-tests pass (all 11 current + LO split 3 + synthetic 32-char overflow)
  4. Sibling exporters (`to-json`, `to-jira`, `to-testmo`) still produce valid output unchanged (no Phase A touched them)
  5. Pre-commit gate still passes (still CSV-based)

### Phase A.5 — N1 semantic rename (isolated; sibling exporters verified independently)

Per auditor finding 5: Phase A.5 is a separate landing for the N1 framework semantic rename. Lands in its own commit so sibling exporters can be tested in isolation.

- **MODIFY** `export_test_cases/types.ts:98` — `automationStatus: 'Automated' | 'Manual' | 'In Progress'` → `automationStatus: 'Automated' | 'Pending Automation' | 'In Progress'`
- **MODIFY** `export_test_cases/types.ts:137` — `metadata.manual: number` → `metadata.pendingAutomation: number`
- **MODIFY** `export_test_cases/markdown-parser.ts:22,29,382-384` — validation default literal `'Manual'` → `'Pending Automation'`; count field reference `manual:` → `pendingAutomation:`; `validateAutomationStatus` union type
- **MODIFY** `export_test_cases/to-json.ts` — rename `manual` metadata key in JSON output
- **MODIFY** `export_test_cases/to-jira.ts:26,32,44,50,95` — add internal→external mapping layer. Internal type is `Pending Automation` but Jira CSV column + API field `customfield_testtype` still emit `'Manual'` for external consumers. Mapping rule: `tc.automationStatus === 'Pending Automation' ? 'Manual' : tc.automationStatus`. Comment cites N1 rationale.
- **MODIFY** `export_test_cases/to-testmo.ts:68` — internal value reference update only. Existing `mapStatus()` already translates to TestMo vocab (ready/in_progress/draft).
- **MODIFY** `export_test_cases/to-xlsx.ts` — switch from local parser fork to shared `markdown-parser.ts` now that types are aligned
- **N1 SCOPE GUARD (auditor finding 2)**: this rename touches ONLY classification/metric framing. The word "manual" in ordinary TC prose (e.g., "manually re-selected", "user manually clicked"), variable/function names not matching classification context, historical doc text — all UNTOUCHED. Pre-rename grep produces an exclusion-allowlist.
- **VERIFY**:
  1. `npm run export:json` produces valid output; metadata key is `pendingAutomation`
  2. `npm run export:jira` produces valid Jira CSV; `Test Type` column still emits `Manual` for non-Automated TCs (external compat)
  3. `npm run export:testmo` produces valid TestMo JSON
  4. `npm run xlsx:build` still passes parity check (now using shared parser)
  5. `npm run xlsx:vs-csv-parity` still exits 0
  6. Grep for naked literal `'Manual'` in framework code (excluding allowlist + sibling-exporter mapping + Jira/TestMo external vocab in tests) returns 0 hits

### Phase B — Cut over readers + rules (CSVs still exist as fallback)
- **MODIFY** `scripts/shared-paths.ts:102` — ADD `workbook` key pointing at `clientPath('test_cases_xlsx/encore_test_cases.xlsx')`; keep `exports` for one phase
- **MODIFY** `scripts/check-tc-parity.ts` — `getCsvTcIds()` → `getXlsxTcIds()`; CSV path = legacy fallback. **Lines 130-142 `--fix-csv` codepath** (auditor finding #1 — BLOCKER): rewire `execSync('npx ts-node export_test_cases/to-csv.ts ...')` invocation to call `npm run xlsx:build` instead. Phase D removes `--fix-csv` flag entirely (along with CSV fallback branches) since post-Phase-D there are no CSVs to re-export to.
- **MODIFY** `scripts/sp00-audit-v5.mjs` — scan XLSX sheets
- **MODIFY** `scripts/planner-post-complete.ts` — call workbook builder; emit `xlsxRebuilt=true` (keep `csvExported=true` alias for one phase)
- **MODIFY** `scripts/generator-post-complete.ts:65` — read `xlsxArtifact` (fallback `csvExport`)
- **MODIFY** `scripts/shared-types.ts:23` — add `xlsxArtifact?`, mark `csvExport?` deprecated
- **MODIFY** `scripts/validate-queue-integrity.ts:87-90` — change history action filter from `'csv_export'` → `'xlsx_rebuild'` (with one-phase alias)
- **MODIFY** `scripts/sync-agent-mistakes.ts:169` — change description `"Export CSV + validate checklist"` → `"Rebuild XLSX + validate checklist"`
- **RUN** `scripts/migrate-queue-csv-to-xlsx.mjs` — rewrite `clients/encore/specs_planning/_internal/agent-queue.json` (11 active `csvExport` paths + 12 history rows)
- **MODIFY** `.githooks/pre-commit` Gate A — XLSX freshness check (MD↔XLSX)
- **MODIFY** `scripts/ship-client.sh` — XLSX preflight + post-ship smoke (asserts XLSX present, CSV dir absent in archive)
- **MODIFY** `pipeline/worker/progress-extractor.ts:23` — regex includes `xlsx`
- **MODIFY** 7 agent prompts (6 HARD STOPs + RUTVIK/COLLEAGUE prompts):
  - `.claude/agents/GENERATOR.md` lines 37, 49, 50
  - `.claude/agents/PLANNER.md` lines 10, 23–24, 57–60
  - `.claude/agents/AUDIT.md` lines 25, 35
  - `.claude/agents/HEALER.md` line 43
  - `.claude/agents/MAINTAINER.md` lines 19, 27, 59, 61, 71, 75
  - `.claude/agents/RUTVIK.agent.md` line 50
  - `.claude/agents/COLLEAGUE.agent.md` line 27
- **MODIFY** rules:
  - `clients/encore/CLAUDE.md` — LR-ENC-002 (lines 72–86): "MD/CSV/test-plan" → "MD/XLSX/test-plan"
  - `.claude/rules/pipeline.md` — LR-048 v2 (lines 267, 274, 277), LR-050 (line 285)
  - `docs/read_only_docs/AGENT_SHARED_RULES.md` — R20 (line 30): "Auto-export CSV" → "Auto-rebuild XLSX"
- **MODIFY** docs:
  - `export_test_cases/README.md` — full rewrite for XLSX (current 385 lines)
  - `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md` — update if CSV mentioned (grep first)
  - `docs/read_only_docs/ARCHITECTURE.md` lines 43, 111
  - `.claude/skills/standup/SKILL.md` lines 89, 118, 143
  - `clients/encore/specs_planning/_internal/agent-mistakes.md` lines 102, 134, 142 (COP-005, PLN-006, PLN-014 stale references)
- **VERIFY**: `npm run planner:post-complete` rebuilds XLSX; `npm run check:tc-parity` → 0 orphans; pre-commit Gate A fires; dry-run ship — XLSX in archive, CSVs still present in repo

### Phase C — Plan triage + dependency-graph rewrite (manual, NO bulk regex per auditor finding 6+7)

**Per auditor finding 6**: bulk `csv`→`xlsx` regex across 45 plans risks corrupting historical/technical meaning ("colleague originally asked for CSV format" must NOT become "colleague originally asked for XLSX format"). Replace with per-plan triage.

- **CREATE** `scripts/triage-plans-csv-references.mjs` — produces a per-plan action ledger at `_internal/plan-triage-ledger-<YYYY-MM-DD>.md`. For each of the 45 plans: (a) file path, (b) raw CSV-mention lines with context, (c) suggested classification, (d) blank action cell for manual review
- **MANUAL CLASSIFICATION PASS** — every plan gets exactly one action from: **REWRITE** (CSV refs are framework-state — update inline) / **DROP-AS-SUPERSEDED** (this plan replaces it — move to done/ with closure note) / **PRESERVE** (CSV is historical/technical context — leave untouched) / **REVIEW** (ambiguous — surface to user before acting)

**Per-plan triage table (the 9 W1/W2 subplans + key parents — explicit per auditor finding 7)**:

| Plan | Action | Rationale |
|---|---|---|
| `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` | DROP-AS-SUPERSEDED | This XLSX migration plan supersedes it. Move to `done/` with closure note + back-link |
| `_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md` | REWRITE | Update traceability table — W1-02 retired, W1-05 partial, W2-09 retargeted |
| `SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE.md` | PRESERVE | Decisions still needed; format-agnostic |
| `SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` | **REWRITE** | Drop CSV-side work (already absorbed into this plan's Phase 0); keep MD parity + LO split + Notes reconciliation as the W1-02-MD-only subplan. Or DROP-AS-SUPERSEDED if Phase 0 fully covers — decide at execute time |
| `SUBPLAN_PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT.md` | PRESERVE | Code-side LO split; format-agnostic |
| `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` | **REWRITE (light)** | Spec fixes are format-agnostic and preserved as-is, BUT body references "Phase 10 targeted CSV refresh" (e.g., for BAS-068 add) — those refs flip to "targeted XLSX rebuild via `npm run xlsx:build`". Auditor finding 4 |
| `SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md` | REWRITE | `check-csv-sanity.mjs` script becomes `check-xlsx-sanity.mjs`; MD parity + spec parity validators reusable as-is |
| `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md` | PRESERVE | E2e walks; format-agnostic |
| `SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md` | PRESERVE | E2e walks; format-agnostic |
| `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` | **REWRITE (light)** | E2e spec fixes are format-agnostic, BUT any post-fix "regenerate CSV" / "CSV re-export" refs in its body must flip to "regenerate XLSX via `npm run xlsx:build`" (or `:with-run` after fresh suite runs). Auditor finding 4 |
| `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` | REWRITE | CI wiring retargets XLSX; final parity report cites XLSX-orphans not CSV-orphans |
| `SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md` | DROP-AS-SUPERSEDED (if still pending) | Augmentation logic now inlined into `to-xlsx.ts`; subplan obsolete |
| `SUBPLAN_PARITY_01_*` through `SUBPLAN_PARITY_08_*` | DROP-AS-SUPERSEDED (per parent plan §Findings note — already archived) | Verify archive state; close any stragglers |
| `PLAN_TEST_DATA_CSV_CONVERSION.md` | REVIEW | Title ambiguous — different feature? Surface to user |
| `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` + `SUBPLAN_DQU_*` (12 files) | REVIEW per file | Mix of in-flight DQU work; CSV refs may be incidental |
| `PLAN_BIG_PIVOT_FCC_MASTER.md` | PRESERVE | FCC architecture; CSV refs are downstream artifact |
| Other plans (~17 remaining) | per-plan triage via ledger | Manual classification |

**Dependency-graph rewrite (auditor finding 7)**: every `Depends on:` / `Blocks:` / `Parent:` field that referenced now-superseded CSV work gets rewritten. The triage script produces a side-output `_internal/plan-dependency-graph-<date>.md` listing every affected edge for manual review.

- **REGENERATE** `plans/INDEX.md` (auto-script, never hand-edit per LR-035): `npm run plans:reindex`. Add migration header in the script's template, not by hand-editing the output.
- **VERIFY**:
  1. `Grep csv plans/pending/` returns only PRESERVE-classified hits (every remaining `csv` mention is intentional and ledger-cited)
  2. No plan has a `Depends on:` / `Blocks:` field pointing at a `done/` superseded plan
  3. `npm run plans:reindex` exits 0; INDEX header notes migration date

### Phase D — Delete CSVs + dead code (gated on final fresh row-parity check)

**Pre-delete hard gate (auditor finding 3)**: `npm run xlsx:vs-csv-parity` must exit 0 on a FRESH build (clean `npm run xlsx:build` immediately before). Any unexplained row diff = HALT. Do not delete CSVs while the workbook drifts from them.

- `npm run xlsx:build && npm run xlsx:vs-csv-parity` — must exit 0
- `git rm -r clients/encore/test_cases_csv/`
- `git rm -r export_test_cases/exports/` (CONFIRMED EXISTS, 11 stale CSVs Feb–Mar 2026)
- `git rm export_test_cases/to-csv.ts`
- `git rm scripts/patch-csv-export-bold-optional.mjs`
- `git rm scripts/xlsx-vs-csv-parity.mjs` (now obsolete — no CSVs to compare against)
- Remove `exports` key from `scripts/shared-paths.ts`
- Remove `csvExport` typedef from `scripts/shared-types.ts`
- Remove `csvExported=true` alias from `scripts/planner-post-complete.ts`
- Remove CSV fallback branches AND `--fix-csv` flag entirely from `check-tc-parity.ts` (auditor finding #1) + remove CSV fallback from `sp00-audit-v5.mjs`
- Remove `'csv_export'` alias from `validate-queue-integrity.ts`
- Remove `export_test_cases/exports/` line from `.gitignore`
- **VERIFY**: full pipeline end-to-end; 6 HARD STOPs reject CSV wording; dry-run ship → mock repo workflow green; `Grep csv clients/encore/test_cases_csv/` returns ENOENT

### Phase 3.5 — Plan closure (LR-027 + LR-055) — **added 2026-05-26 per user authorization**

After Phase D commits, close THIS plan with the same closure discipline every other plan follows. Added as an explicit section because the original locked plan referenced Phase 3.5 only in passing ("[ceremony] tag") — the actual closure step deserves its own enumerated phase given the size of this migration.

**Closure steps (sequential)**:

1. **Edit frontmatter**: flip plan's frontmatter to include `**Status**: DONE` and `**Executed**: 2026-MM-DD` (the actual completion date).
2. **Write `### Execution Summary` section** at the bottom of the plan body per LR-027. Required content (cite real file paths so LR-055 C3 passes):
   - Per-phase outcomes (Phase 0/A/A.5/B/C/D — what was done, what was skipped-with-justification)
   - Files created (count + 2-3 representative paths): `export_test_cases/to-xlsx.ts`, `export_test_cases/sp00-augment-logic.ts`, `clients/encore/test_cases_xlsx/encore_test_cases.xlsx`, etc.
   - Files deleted (CSVs + dead code paths)
   - Plans triaged in Phase C (count by REWRITE/DROP/PRESERVE/REVIEW)
   - Deviation log (every choice that differed from the locked plan body — per `feedback_plan_deviations_log.md`)
   - MCP/verification findings (xlsx-vs-csv-parity exit codes; cross-tool open verdicts)
   - Hours actual
3. **Run `validate-plan-closure`** standalone before staging:
   ```
   node scripts/validate-plan-closure.mjs --plan plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md --enforce
   ```
   Expected: `[PASS]`. If any check fails:
   - **C1 (OVERRIDABLE)**: add an entry to `.claude/closure-overrides.json` `overrides[]` array with this plan's filename + one-line justification (FILE-ONLY override per LR-055). User edits the JSON; agent does not.
   - **C2/C3/C4/C5 (NOT OVERRIDABLE)**: remediate the underlying issue:
     - C2 (Execution Summary heading + ≥10 content lines): expand the summary text.
     - C3 (cited paths must exist on disk): use real, current paths — every file mentioned in the summary must exist at HEAD (or be enumerated in this plan's DELETE list for paths deleted in Phase D).
     - C4 (Depends-on phantom hand-off): every `Depends on:` / `Blocks:` reference must resolve to an existing plan file with required tokens.
     - C5 (no structural drift): subplan list / phase boundaries unchanged from authoring.
4. **`git mv` plan to `plans/done/`**: `git mv plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md plans/done/`.
5. **`npm run plans:reindex`** — regenerate `plans/INDEX.md` (LR-035 — never hand-edit). Migration-date header injected via script template (already part of Phase C).
6. **Parent-cascade check (LR-027)** — grep `plans/pending/` for any `SUBPLAN_*.md` with `**Parent**: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` or that lists this plan as their parent in body. This plan has no subplans (its work was inlined as Phase 0/A/A.5/B/C/D — no child subplans were spawned), so the cascade is a no-op.
7. **LR-028 activity log row**: append a row to `clients/encore/specs_planning/_internal/agent-activity-log.md` per LR-028 + LR-037 (timestamp ≥ all touched-file mtimes). Names every file touched + the parity / ship outcomes.
8. **Commit closure**: single closure commit containing the plan body edits (Status DONE + Execution Summary) + INDEX regen + activity-log row + closure manifest. Pre-commit Gate C runs `validate-plan-closure --staged --enforce`; this commit MUST PASS that gate.

**Stop conditions for the closure step itself**:

- Validator fails C2/C3/C4/C5 and the remediation would expand scope beyond the migration's body → HALT, ask user.
- C1 fails and user has not edited `.claude/closure-overrides.json` → HALT, surface; do not commit closure.
- Parent-cascade reveals an unexpected child subplan → HALT, audit; do not close blindly.

---

## Files inventory — full CRUD (post-audit additions in **bold**)

### CREATE
| Path | Purpose |
|---|---|
| `export_test_cases/to-xlsx.ts` | New emitter (`exceljs`); consumes cleaned MDs from Phase 0 |
| `export_test_cases/sp00-augment-logic.ts` | Isolated SP00 augmentation per the explicit mapping section above (playwright `--list --reporter=json` + source-file `test.fixme` regex) |
| `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | First committed workbook (14 tabs) |
| `scripts/xlsx-freshness.ts` | mtime check (XLSX > all MD) |
| `scripts/xlsx-dump.ts` | Plain-text dump for PR review |
| `scripts/xlsx-vs-csv-parity.mjs` | Row-for-row parity check (Phase A acceptance + Phase D pre-delete gate). Removed in Phase D after CSVs deleted (it has no comparison target left). |
| `scripts/migrate-queue-csv-to-xlsx.mjs` | One-shot `agent-queue.json` path rewrite |
| **`scripts/triage-plans-csv-references.mjs`** | Per-plan **audit ledger** generator (NOT a bulk mutator — auditor finding 5). Produces `_internal/plan-triage-ledger-<date>.md` for manual REWRITE/DROP/PRESERVE/REVIEW classification |

### MODIFY — code
| Path | Change |
|---|---|
| `package.json` | Add `xlsx:build`, `xlsx:freshness`, `xlsx:dump`; repoint planner/check scripts |
| `scripts/shared-paths.ts:102` | Add `workbook` (B); remove `exports` (D) |
| `scripts/shared-types.ts:23` | Add `xlsxArtifact?`; remove `csvExport?` (D) |
| `scripts/planner-post-complete.ts` | Call workbook builder; emit `xlsxRebuilt` |
| `scripts/generator-post-complete.ts:65` | Read `xlsxArtifact` |
| `scripts/check-tc-parity.ts` | `getCsvTcIds()` → `getXlsxTcIds()` + rewire `--fix-csv` codepath at lines 130-142 to call `npm run xlsx:build` (B); remove `--fix-csv` flag entirely (D) |
| `scripts/sp00-audit-v5.mjs` | Scan XLSX sheets |
| **`scripts/validate-queue-integrity.ts:87`** | Replace `'csv_export'` action filter |
| **`scripts/sync-agent-mistakes.ts:169`** | Replace `"Export CSV"` description |
| `scripts/ship-client.sh` | Preflight + post-ship smoke |
| `.githooks/pre-commit` | Gate A → MD↔XLSX freshness |
| `pipeline/worker/progress-extractor.ts:23` | Regex adds `xlsx` |
| **`export_test_cases/index.ts:21-22`** | Replace `CsvConverter` + `ExportType` exports with `XlsxBuilder` |
| **`export_test_cases/markdown-parser.ts:22,29,382-384`** | N1 — rename `Manual` literal default, `manual` count field, validation union |
| **`export_test_cases/types.ts:98,137`** | N1 — `automationStatus` union, `metadata.manual` → `metadata.pendingAutomation` |
| **`export_test_cases/to-json.ts`** | N1 — rename `manual` metadata key in JSON output |
| **`export_test_cases/to-jira.ts:26,32,44,50,95`** | N1 mapping layer — keep Jira's `Manual` external vocab in emitted CSV/API; source becomes `tc.automationStatus === 'Pending Automation' ? 'Manual' : tc.automationStatus` |
| **`export_test_cases/to-testmo.ts:68`** | N1 — internal value reference update; existing `mapStatus()` translates to TestMo vocab (ready/in_progress/draft), no Jira-style mapping needed |

### MODIFY — agent prompts
GENERATOR · PLANNER · AUDIT · HEALER · MAINTAINER · RUTVIK · COLLEAGUE (line numbers in Phase B above)

### MODIFY — rules
`clients/encore/CLAUDE.md` LR-ENC-002 · `.claude/rules/pipeline.md` LR-048 v2 + LR-050 · `docs/read_only_docs/AGENT_SHARED_RULES.md` R20

### MODIFY — docs
`export_test_cases/README.md` (full rewrite) · `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md` (if CSV mentioned) · `docs/read_only_docs/ARCHITECTURE.md` lines 43,111 · `.claude/skills/standup/SKILL.md` lines 89,118,143 · **`clients/encore/specs_planning/_internal/agent-mistakes.md` lines 102,134,142**

### MODIFY — data
**`clients/encore/specs_planning/_internal/agent-queue.json`** — 11 active `csvExport` paths + 12 history rows (Phase B, via migrate script)

### MODIFY — pending plans (45 hits, Phase C, automated + manual)
Bulk-rewrite + structural review across:
- PARITY series: `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`, `SUBPLAN_PARITY_00–08`, `SUBPLAN_PARITY_W1_01–05`, `SUBPLAN_PARITY_W2_06–09`, `_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`
- DQU series: `PLAN_DELIVERABLE_QUALITY_UPGRADE.md`, `SUBPLAN_DQU_05E/08/10/12/13/14/16/18/19/26/29/33/34`
- Big-pivot / repo cleanup: `PLAN_BIG_PIVOT_FCC_MASTER.md`, `PLAN_MAINTAINER_SWEEP.md`, `PLAN_MASTER_REPO_CLEANUP.md`, `SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md`, `PLAN_VERTICAL_RESTRUCTURE_PENDING.md`
- Other: `PLAN_TEST_DATA_CSV_CONVERSION.md` (review obsolete), `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md`, `PLAN_LM_HISTORY_COVERAGE.md`, `PLAN_PUSH_NOTES_LATEST_TO_DELIVERABLES_TEST.md`, `PLAN_CLOSURE_GATE_V6_PARENT.md`, `PLAN_AGENT_AUTHORING_EFFICIENCY.md`

### MODIFY — INDEX
`plans/INDEX.md` regenerated after Phase C with migration header

### OUT OF SCOPE — website CSV surfaces (per N2(b))
12 files under `website/` left untouched: `website/backend/src/services/chatbot.service.ts`, `website/backend/src/routes/test-cases.routes.ts`, `website/frontend/src/pages/ChatPage.tsx`, `website/frontend/src/types/index.ts`, `website/frontend/src/components/chat/TestCaseResults.tsx`, plus `dist/` artifacts and `website/plan.md`. Different audience (chatbot UI). No follow-up plan filed.

### DELETE (Phase D, explicit)
| Path | State |
|---|---|
| `clients/encore/test_cases_csv/` (entire dir, 11 CSVs) | CONFIRMED present |
| **`export_test_cases/exports/` (11 stale CSVs, Feb–Mar 2026 mtimes)** | **CONFIRMED present — was "if exists", now mandatory delete** |
| `export_test_cases/to-csv.ts` | After parser extraction |
| `scripts/patch-csv-export-bold-optional.mjs` | Obsolete |
| `.gitignore` line 158 (`export_test_cases/exports/`) | Dead pattern |

### LEAVE ALONE (M1)
`~/.claude/projects/.../memory/feedback_endday_*.md` and similar — user-preference layer; not framework code.

---

## Verification (end-to-end after Phase D)

```
# Build
npm run xlsx:build
# → clients/encore/test_cases_xlsx/encore_test_cases.xlsx created
# Open in Excel + Google Sheets + Apple Numbers → 14 tabs (Overview + 10 locations + 3 local-office), Overview first

# Row-parity (Phase A + Phase D gate)
npm run xlsx:vs-csv-parity
# → exit 0 (XLSX dump matches all current CSV data rows modulo schema/summary rows + LO 3-sheet split)

# Round-trip
npm run planner:post-complete
# → workbook rebuilt; planner emits xlsxRebuilt=true
npm run check:tc-parity
# → 0 spec-orphan, 0 MD-orphan, 0 xlsx-orphan
npm run xlsx:freshness
# → exit 0

# Pre-commit gate
git add clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md
git commit -m "test: edit MD"
# → blocked unless XLSX also restaged

# Ship
npm run client:ship -- --client=encore --out=/tmp/encore-deliv
ls /tmp/encore-deliv/test_cases_xlsx/encore_test_cases.xlsx   # present
ls /tmp/encore-deliv/test_cases_csv/                           # ENOENT
ls /tmp/encore-deliv/export_test_cases/exports/                # ENOENT

# Push to mock
gh repo clone RutviK-JBS/encore_deliverables_test /tmp/mock
cp /tmp/encore-deliv/* /tmp/mock/ -r
# (per existing SHIP_TO_ENCORE.md runbook)
# → workflow green

# Regression sweep
Grep csv plans/pending/                  # only intentional false-positives
Grep csv .claude/agents/                 # zero
Grep csv .claude/rules/                  # zero
Grep csv clients/encore/CLAUDE.md        # zero
Grep csv docs/read_only_docs/            # zero
Grep csv scripts/                        # zero
Grep csv export_test_cases/              # zero (post-deletion)
```

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Binary XLSX diffs unreadable in PRs | `npm run xlsx:dump > dump.txt` → reviewers diff text |
| Merge conflicts on workbook | post-merge git hook auto-rebuilds; resolution = `git checkout HEAD -- workbook.xlsx && npm run xlsx:build` |
| Sheet-name overflow on new modules | `toSheetName()` HALTs with message; explicit short-code mapping required |
| Done-plans reference old CSV paths | Don't touch — history is history. INDEX header notes migration date |
| 45-plan bulk-rewrite breaks intentional CSV references (e.g., historical context) | Regex bounded; manual structural review pass; commit-by-commit |
| Agent muscle memory still types "CSV" | 6 HARD STOPs reject; activity-log gate enforces XLSX wording |
| exceljs features don't round-trip Google Sheets / Numbers | Decision #7 minimal styling — bold + freeze + autosize only |
| Sibling exporters (`to-jira`, `to-testmo`, `to-json`) share `to-csv.ts` parser | Phase A imports-audit first; extract `parse-md.ts` if shared |
| Website CSV references stay stale (N2(b)) | Documented out-of-scope; no risk to framework migration. If website team later needs same migration, separate plan |
| N1 cascade — renaming `Manual` in `types.ts` could break `to-jira` consumers (Jira expects `Manual`) | Mitigated — `to-jira.ts:44,50,95` add internal→external mapping at the boundary: emits Jira's `Manual` vocab while internal type is `Pending Automation`. `to-testmo.ts` unaffected (already maps to ready/in_progress/draft). `to-json.ts` is internal-only — clean rename |
| MD source files have hidden `Manual` literals that migration misses | Verified — zero MD files under `clients/encore/specs_planning/test-cases/` contain `Automation Status: Manual` literal. Parser default change handles all implicit cases. No migration script needed |
| N1 rename accidentally touches ordinary English `manual` in TC prose (auditor finding 2) | Phase A.5 N1 scope guard: pre-rename grep produces exclusion-allowlist. Rename targets ONLY classification literal `'Manual'` in `automationStatus` union + `metadata.manual` field + `validateAutomationStatus` default. TC prose like "manually re-selected" / variable names / Jira external vocab UNTOUCHED |
| Phase A workbook drifts from current CSV deliverable (auditor finding 3) | HARD GATE — `scripts/xlsx-vs-csv-parity.mjs` produces a per-row hash diff between XLSX dump and current 11 CSVs (modulo schema-add columns + summary rows). Phase A acceptance + Phase D pre-delete BOTH require exit 0 |
| SP00 augmentation silently lies (Pass column = "assumed pass") (auditor finding 4) | Documented two-mode build: default `xlsx:build` is list-only (Pass = assumed-pass), `xlsx:build:with-run` runs full suite and reports actual results. Overview header line cites which mode was used |
| Plan triage bulk-regex corrupts historical/technical CSV references (auditor finding 6) | Phase C uses `scripts/triage-plans-csv-references.mjs` to produce a per-plan action ledger; every plan classified REWRITE / DROP-AS-SUPERSEDED / PRESERVE / REVIEW manually. No automated mass-replace |
| Agents execute obsolete CSV work after migration (auditor finding 7) | Phase C dependency-graph rewrite: every `Depends on:` / `Blocks:` / `Parent:` field pointing at a now-superseded plan gets rewritten; side-output `_internal/plan-dependency-graph-<date>.md` enumerates affected edges |
| Phase A.5 breaks `to-jira.ts` for external Jira import | Mapping layer at boundary: internal type is `Pending Automation`, Jira CSV column + API `customfield_testtype` still emit `'Manual'`. Verified by Phase A.5 acceptance `npm run export:jira` smoke |

---

## Out of scope (explicit)

- Multi-client XLSX (this plan is encore-only)
- Color coding / conditional formatting (per #7)
- Charts / pivot tables
- Real-time workbook updates (build-on-demand only)
- Migrating done-plan history bodies (only INDEX note)
- `src/data/adapters/excelAdapter.ts` test-data loader (different concern — test data, not test cases)
- **Website chatbot CSV surfaces (N2(b))** — 12 files under `website/` left untouched
- **MD test-case file migration** — verified zero MD files contain `Automation Status: Manual` literal; parser default change handles all implicit cases
- **Ordinary English "manual" in TC prose, variable names, historical doc text** (auditor finding 2 clarification) — N1 rename touches classification labels only
- **Jira / TestMo external vocab** — `to-jira.ts` keeps emitting `Manual` for external compat via mapping layer
- **Actual Pass/Fail accuracy in default `xlsx:build`** — auditor finding 4: default build assumes Pass for automated non-skip/non-fixme TCs. Authoritative Pass/Fail requires `xlsx:build:with-run`. Documented in deliverable README and workbook Overview header
- **W1-03, W1-04, W2-06/07/08, partial W1-05** — format-agnostic, preserved per Phase C triage. The "PARITY restructure" is NOT made obsolete by this plan; only its CSV-side (W1-02) is absorbed
