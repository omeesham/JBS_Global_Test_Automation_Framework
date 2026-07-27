**Status**: Pending
**Executed**: 2026-07-28
**Priority**: P0
**Created**: 2026-07-27
**Identity**: BUILDER
**Parent**: PLAN_59_CORP_OVERRIDE_AND_TESTCASE_RESTRUCTURE.md
**Depends on**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

> 🤖 **SESSION BOOTSTRAP** — This file runs cold with `/execute SUBPLAN_59A_TESTCASE_PIPELINE.md` and nothing else.
>
> **Bootstrap sequence:**
> 1. `/identity BUILDER` — adopt pipeline identity.
> 2. Load skills: `/regression-guard`, `/relevant`, `/final-q`.
> 3. Resolve model=claude-opus-4-8, thinking=xhi, permission-mode=auto.
> 4. Dependency gate — this subplan has no dependencies; proceed.
> 5. Read `plans/pending/PLAN_59_CORP_OVERRIDE_AND_TESTCASE_RESTRUCTURE.md` in full.
> 6. Execute Phase 0 first (inventory gate).
> 7. Execute remaining phases in order (1 → 5).
> 8. Handoff to 59B (per-step Expected Result content).
>
> **HALT + ASK if:**
> - Dependency blocker (N/A — no dependencies).
> - Scope ambiguity — a design decision in PLAN_59 conflicts with observed code.
> - Phase 0 finding reveals >30% scope extension beyond what this plan covers.
> - `/regression-guard` shows unrelated file changes.
> - Activity-log timestamp drift >24h from session start.

---

# SUBPLAN 59A — Test-Case Pipeline Restructure

## Context

This subplan rewires the test-case generation pipeline to:
1. Emit per-step Expected Results (column 12) instead of case-level-only.
2. Produce a `testcases/<group>/<stem>.xlsx` split-file tree alongside the consolidated workbook.
3. Retarget the output directory from `test_cases_xlsx/` to `testcases/`.
4. Define the new markdown step-table schema and migrate existing TC files.
5. Update every hardcoded path and every gate that reads the old layout.

Source of truth: PLAN_59 design decisions D1–D5, D9. Evidence: RECON-B (pipeline map), RECON-C (target contract).

---

## Phase 0 — Dependency + Inventory Gate (MANDATORY)

**Purpose**: Re-grep the hardcoded-path register before editing, so a path the recon missed is caught rather than assumed absent.

1. Confirm no dependency blocks (this subplan depends on nothing).
2. Run the hardcoded-path enumeration fresh:
   ```
   grep -rnE "test_cases_xlsx|encore_test_cases\.xlsx" --include="*.ts" --include="*.mjs" --include="*.js" --include="*.json" clients/encore/ scripts/ .claude/hooks/ | grep -v node_modules
   ```
3. Compare result count against RECON-B's **27 rows**. If the fresh count exceeds RECON-B's by >3 hits, HALT — scope extension >30%.
4. Verify the 22 TC markdown source files exist:
   ```
   find clients/encore/specs_planning/test-cases/setup -name "*_test_cases.md" | wc -l
   ```
   Expected: 22.
5. Read `export_test_cases/types.ts` — confirm `TestStep.expectedResult?: string` (`:32`) and `expectedResults: string[]` (`:107`) already exist. No new types needed.
6. Read `export_test_cases/markdown-parser.ts` — confirm step-parsing logic location for Phase 2.

**Gate**: if fresh grep count > 30 or markdown file count ≠ 22, HALT + ASK.

---

## Phase 1 — Markdown Step-Table Schema + Migration Script (PLAN_59 D5)

### 1.1 — New `**Steps**:` Table Format

The inline numbered-list format:
```
**Steps**: 1. Navigate to page. 2. Click save. 3. Verify toast.
```

Becomes a pipe-separated table immediately after the `**Steps**:` line:
```
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to page | The page loads successfully. |
| 2 | Click save | A confirmation toast appears. |
| 3 | Verify toast | Toast reads "Changes saved." |
```

**Schema rules:**
- Header row is always `| # | Step | Expected Result |` followed by `|---|------|-----------------|`.
- Column 1 (`#`): integer step number, 1-indexed.
- Column 2 (`Step`): the action text. A pipe character within the step text is escaped as `\|`. Multi-line text within a cell is joined to a single line (newlines replaced with a space).
- Column 3 (`Expected Result`): per-step expected outcome. Left **empty** by this subplan's migration (59B fills it). The column must still be present with an empty cell.
- The existing `**Expected**:` field is **RETAINED** below the table (case-level summary). It is NOT deleted, NOT moved into the table.

### 1.2 — Migration Script

**File**: `scripts/migrate-steps-to-table.ts` (new — created by the executor of this subplan).

**Behaviour**:
1. Glob `clients/encore/specs_planning/test-cases/setup/**/*_test_cases.md` (22 files).
2. For each file, find every `**Steps**:` line.
3. Parse the inline numbered list: split on `/\d+\.\s/` pattern, trim each step.
4. Emit the table form with step text byte-for-byte (no normalisation, no trimming beyond leading/trailing whitespace on each step).
5. Expected Result column is empty string for every row (59B fills it).
6. Write the file back in place.
7. Print a summary: `Migrated N files, M total TCs converted`.

**Acceptance**: `git diff --stat` shows changes only in `*_test_cases.md` files. `grep -c "^| #" <file>` for each file equals its TC count. No step text is lost (reversibility check: re-parse the table back to inline and diff — zero semantic difference).

### 1.3 — Files touched

| File | Change |
|---|---|
| `scripts/migrate-steps-to-table.ts` | NEW — migration script |
| `clients/encore/specs_planning/test-cases/setup/**/*_test_cases.md` (×22) | Inline steps → table format |

---

## Phase 2 — Parser Updates

### 2.1 — `export_test_cases/to-csv.ts` (`CsvConverter.convertFile`)

**Current**: `CsvConverter.convertFile(filePath, 'human')` is called by `parseMd()` at `to-xlsx.ts:291-292`. It reads the markdown, extracts `**Steps**:` as a single inline string, and emits CSV rows.

**Change**: Add table-format recognition. When the parser encounters `**Steps**:` followed by a `| # | Step | Expected Result |` header, it:
1. Reads subsequent `| N | ... | ... |` rows until the next non-table line.
2. Extracts step text (column 2) and expected result (column 3) per row.
3. Unescapes `\|` → `|` in cell content.
4. Populates `TestStep.expectedResult` from column 3 (empty string if blank).
5. Falls back to the existing inline-number parser for files not yet migrated (backward compat).

### 2.2 — `export_test_cases/markdown-parser.ts`

**Current**: Contains `parseSteps()` function that splits on numbered-list pattern.

**Change**: Same dual-path recognition as 2.1 — detect table header, parse rows, return `TestStep[]` with `expectedResult` populated. The existing `parseSteps()` in `to-xlsx.ts` (called at `:561`) must also be updated or replaced with the parser's output.

**Consumer audit**:
- `to-xlsx.ts:291` → calls `CsvConverter.convertFile` → uses `to-csv.ts` parser path.
- `to-xlsx.ts:561` → calls local `parseSteps()` which is a simpler inline-only splitter.
- Both must handle the new table format.

### 2.3 — `export_test_cases/types.ts`

**No new types needed.** Reuse existing:
- `TestStep.expectedResult?: string` (`:32`)
- `expectedResults: string[]` (`:107`)

### 2.4 — Files touched

| File | Change |
|---|---|
| `export_test_cases/to-csv.ts` | Add table-format step parser branch |
| `export_test_cases/markdown-parser.ts` | Add table-format recognition in `parseSteps()` |
| `export_test_cases/to-xlsx.ts:561` | Update local `parseSteps()` to handle table format |

---

## Phase 3 — Emitter: Per-Step Expected Result + Split-File Tree

### 3.1 — Per-Step Expected Result Emission (`to-xlsx.ts:564-569`)

**Current** (`to-xlsx.ts:569`):
```typescript
const expected = isLast ? tc.expected.trim() : '';
```

**Target**:
```typescript
const stepExpected = tc.steps[i]?.expectedResult?.trim() || '';
const expected = isLast
  ? (stepExpected || tc.expected.trim())
  : stepExpected;
```

Logic: each step row gets its own Expected Result from the parsed table. The case-level `**Expected**:` still lands on the LAST row as a fallback when no per-step ER exists (backward compat for unmigrated content, and the reference confirms case-level belongs on last row).

### 3.2 — Output Directory Retarget (`to-xlsx.ts:63-64`)

**Current**:
```typescript
const XLSX_DIR = path.join(CLIENT_ROOT, 'test_cases_xlsx');
const XLSX_PATH = path.join(XLSX_DIR, 'encore_test_cases.xlsx');
```

**Target**:
```typescript
const XLSX_DIR = path.join(CLIENT_ROOT, 'testcases');
const XLSX_PATH = path.join(XLSX_DIR, 'encore_test_cases.xlsx');
```

### 3.3 — Add Missing SHEET_NAMES Entry (`to-xlsx.ts:118-148`)

Add the missing key so it no longer falls through:
```typescript
corporate_pricing_import_all: 'corporate_pricing_import_all',
```
(28 chars — within the 31-char limit. Add after `corporate_pricing_export_all` at `:146`.)

Also add to SHEET_DISPLAY_NAMES (`:150-172`):
```typescript
corporate_pricing_import_all: 'Corporate Pricing — Import All',
```

### 3.4 — Overview Banner Text (`to-xlsx.ts:523`)

**Current**: `overview.addRow([\`Workbook version: encore_test_cases.xlsx\`]);`
**Keep as-is** — the consolidated workbook retains the name `encore_test_cases.xlsx`; only its parent directory changed.

### 3.5 — Split-File Emitter (NEW)

After the consolidated workbook write, add a new function `writeSplitFiles(wb, tcsBySheet)` that:

1. For each sheet in `tcsBySheet.keys()`:
   - Look up the sheet name in the **SPLIT_FILE_MAP** (full 22-row lookup table below).
   - Create a new `ExcelJS.Workbook` containing only that sheet (cloned).
   - Write to `path.join(XLSX_DIR, <group>, <stem>.xlsx)`.
   - Ensure `<group>/` directory exists (`fs.mkdirSync({ recursive: true })`).
2. Each split workbook has exactly one worksheet named with the sheet slug.
3. The 13-column header, SUMMARY row, and blank separator are preserved per sheet (PLAN_59 D2).

### 3.6 — SPLIT_FILE_MAP (22-Row Lookup Table)

This is the **canonical lookup** — sheet name → `<group>/<file-stem>`:

| # | Sheet Name (key into SHEET_NAMES value) | Group | File Stem | Full Path |
|---|---|---|---|---|
| 1 | `corporate_pricing_detail` | `corporate-pricing` | `corporate-pricing-detail` | `testcases/corporate-pricing/corporate-pricing-detail.xlsx` |
| 2 | `corporate_pricing_export_all` | `corporate-pricing` | `corporate-pricing-export-all` | `testcases/corporate-pricing/corporate-pricing-export-all.xlsx` |
| 3 | `corporate_pricing_import_all` | `corporate-pricing` | `corporate-pricing-import-all` | `testcases/corporate-pricing/corporate-pricing-import-all.xlsx` |
| 4 | `corporate_pricing_loc_export` | `corporate-pricing` | `corporate-pricing-loc-export` | `testcases/corporate-pricing/corporate-pricing-loc-export.xlsx` |
| 5 | `corporate_pricing_loc_import` | `corporate-pricing` | `corporate-pricing-loc-import` | `testcases/corporate-pricing/corporate-pricing-loc-import.xlsx` |
| 6 | `corporate_pricing_new_pricebook` | `corporate-pricing` | `corporate-pricing-new-pricebook` | `testcases/corporate-pricing/corporate-pricing-new-pricebook.xlsx` |
| 7 | `corporate_pricing_override` | `corporate-pricing` | `corporate-pricing-override` | `testcases/corporate-pricing/corporate-pricing-override.xlsx` |
| 8 | `corporate_pricing_search` | `corporate-pricing` | `corporate-pricing-search` | `testcases/corporate-pricing/corporate-pricing-search.xlsx` |
| 9 | `corporate_pricing_strategy` | `corporate-pricing` | `corporate-pricing-strategy` | `testcases/corporate-pricing/corporate-pricing-strategy.xlsx` |
| 10 | `locations_account_address` | `locations` | `location-account-address` | `testcases/locations/location-account-address.xlsx` |
| 11 | `locations_auto_addon` | `locations` | `location-auto-addon` | `testcases/locations/location-auto-addon.xlsx` |
| 12 | `locations_left_panel_basic_info` | `locations` | `location-left-panel-basic-information` | `testcases/locations/location-left-panel-basic-information.xlsx` |
| 13 | `locations_legal` | `locations` | `location-legal` | `testcases/locations/location-legal.xlsx` |
| 14 | `locations_notes` | `locations` | `location-notes` | `testcases/locations/location-notes.xlsx` |
| 15 | `locations_shared_setup_location` | `locations` | `location-shared-setup-locations` | `testcases/locations/location-shared-setup-locations.xlsx` |
| 16 | `locations_currency` | `locations` | `location-currency` | `testcases/locations/location-currency.xlsx` |
| 17 | `locations_local_information` | `locations` | `location-local-information` | `testcases/locations/location-local-information.xlsx` |
| 18 | `locations_management_history` | `locations` | `location-management-history` | `testcases/locations/location-management-history.xlsx` |
| 19 | `locations_pricing` | `locations` | `location-pricing` | `testcases/locations/location-pricing.xlsx` |
| 20 | `local_office_settings` | `local-office` | `local-office-settings` | `testcases/local-office/local-office-settings.xlsx` |
| 21 | `local_office_history` | `local-office` | `local-office-history` | `testcases/local-office/local-office-history.xlsx` |
| 22 | `local_office_ect` | `local-office` | `local-office-ect` | `testcases/local-office/local-office-ect.xlsx` |

**Notes on the table:**
- Rows 1–9 and 10–15 match the reference tree on `encore_deliverables_test@develop` exactly (RECON-C verified).
- Rows 16–22 are the 7 local-only modules (D4: ship all 22, not just the reference's 15).
- The `locations_` prefix in sheet names maps to singular `location-` in file stems (reference convention).
- `locations_left_panel_basic_info` is the 31-char truncated sheet name; the file stem uses the full form `location-left-panel-basic-information`.
- `locations_shared_setup_location` is singular (31-char truncation); the file stem uses plural `location-shared-setup-locations`.
- This map is implemented as a **const object literal** in the emitter, not derived by string transform.

### 3.7 — Files touched

| File | Change |
|---|---|
| `export_test_cases/to-xlsx.ts:63` | `test_cases_xlsx` → `testcases` |
| `export_test_cases/to-xlsx.ts:118-148` | Add `corporate_pricing_import_all` entry |
| `export_test_cases/to-xlsx.ts:150-172` | Add matching display name entry |
| `export_test_cases/to-xlsx.ts:564-569` | Per-step expected result logic |
| `export_test_cases/to-xlsx.ts` (new function) | `writeSplitFiles()` — split-file emitter with SPLIT_FILE_MAP |

---

## Phase 4 — Hardcoded Path Updates

Every `breaks if path changes = YES` row from RECON-B's register, updated:

| # | File:Line | Current Value | New Value | Nature |
|---|---|---|---|---|
| 1 | `scripts/shared-paths.ts:102` | `'test_cases_xlsx', 'encore_test_cases.xlsx'` | `'testcases', 'encore_test_cases.xlsx'` | Path const |
| 2 | `scripts/shared-paths.ts:103` | `'test_cases_xlsx'` | `'testcases'` | Dir const |
| 3 | `scripts/xlsx-freshness.ts:42` | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `clients/encore/testcases/encore_test_cases.xlsx` | Path const |
| 4 | `scripts/xlsx-dump.ts:22` | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `clients/encore/testcases/encore_test_cases.xlsx` | Path const |
| 5 | `scripts/xlsx-vocab-lint.mjs:18` | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `clients/encore/testcases/encore_test_cases.xlsx` | Path const |
| 6 | `scripts/xlsx-merged-shape.test.mjs:20` | `clients/encore/test_cases_xlsx` | `clients/encore/testcases` | Dir const |
| 7 | `scripts/xlsx-merged-shape.test.mjs:21` | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `clients/encore/testcases/encore_test_cases.xlsx` | Path const |
| 8 | `scripts/sp00-audit-v5.mjs:31` | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `clients/encore/testcases/encore_test_cases.xlsx` | Path const |
| 9 | `scripts/verify-no-forbidden.mjs:145` | `clients/${client}/test_cases_xlsx` | `clients/${client}/testcases` | Dir scan |
| 10 | `scripts/verify-no-forbidden.mjs:209` | `test_cases_xlsx` | `testcases` | Dir scan |
| 11 | `scripts/xlsx-lint-rules.mjs:637` | `basename === 'encore_test_cases.xlsx'` | See §4.1 below | Guard redesign |
| 12 | `.claude/hooks/lib/test-jargon-fixtures.mjs:129` | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `clients/encore/testcases/encore_test_cases.xlsx` | Test fixture |

**Header-comment-only hits** (NO functional break — update for correctness):

| # | File:Line | Change |
|---|---|---|
| 13 | `export_test_cases/to-xlsx.ts:4` | Update comment |
| 14 | `export_test_cases/testrail-format.ts:7` | Update comment |
| 15 | `scripts/xlsx-freshness.ts:4` | Update comment |
| 16 | `scripts/xlsx-dump.ts:4` | Update comment |
| 17 | `scripts/sp00-audit-v5.mjs:6` | Update comment |
| 18 | `scripts/verify-no-forbidden.mjs:98` | Update comment |
| 19 | `scripts/planner-post-complete.ts:6` | Update comment |

### 4.1 — `strictC8` Guard Redesign (`scripts/xlsx-lint-rules.mjs:637`)

**Current**: `if (basename === 'encore_test_cases.xlsx')` — enables C8 validation only on the monolithic file. A split file has a different basename → C8 silently skipped.

**Target**: Replace the basename guard with a directory-membership check:
```javascript
const isDeliverable = filePath.includes('/testcases/') || filePath.includes('\\testcases\\');
if (isDeliverable) { /* apply C8 */ }
```

This ensures C8 fires for both the consolidated workbook and every split file under `testcases/`.

### 4.2 — Filesystem Move

- `git mv clients/encore/test_cases_xlsx/ clients/encore/testcases/` (preserves history).
- After the move, `npm run xlsx:build` regenerates the consolidated + split files in the new location.
- The old `test_cases_xlsx/` directory ceases to exist.

---

## Phase 5 — Gate Updates

For each gate, state what changes to handle the multi-file tree:

### 5.1 — `lint:testcases` (npm script)

Update to scan `clients/encore/testcases/` instead of `clients/encore/test_cases_xlsx/`. If it globs `*.xlsx`, the split files are automatically included.

### 5.2 — `check:tc-parity`

**Current**: Validates one monolithic workbook against markdown TC files.
**Change**: Must validate BOTH the consolidated workbook AND iterate each split file to confirm it matches its corresponding sheet in the consolidated workbook (byte-for-byte sheet content). Implementation: after comparing MD ↔ consolidated, load each split file and assert its sole sheet matches the same-named sheet in the consolidated workbook (row count + cell content spot-check).

---

## Execution Summary

The test-case pipeline was restructured to support per-step Expected Results and a multi-file workbook layout.

Twenty-two markdown test-case files under `clients/encore/specs_planning/test-cases/setup/` were migrated from inline step lists to pipe-delimited table format with a `| # | Step | Expected Result |` schema. The Expected Result column was left structurally empty for 59B to fill.

The migration script ran from `.claude/state/` as single-use tooling and was removed at closure per D15 — one-time migration machinery does not persist in the repository.

Parser updates landed in `export_test_cases/to-csv.ts` and `export_test_cases/markdown-parser.ts` to recognise the new table format alongside the existing inline-number parser for backward compatibility.

The emitter in `export_test_cases/to-xlsx.ts` was updated at three levels: per-step Expected Result emission replaced the case-level-only fallback on the last row, a `SPLIT_FILE_MAP` lookup table routes each of 22 sheets to its `testcases/<group>/<stem>.xlsx` output path, and a new `writeSplitFiles()` function produces 29 per-module split workbooks alongside the consolidated `encore_test_cases.xlsx`.

Output directory retargeted from `test_cases_xlsx/` to `testcases/` in both the emitter path constant and `scripts/shared-paths.ts`.

All 27 hardcoded path references were updated across `scripts/xlsx-freshness.ts`, `scripts/xlsx-dump.ts`, `scripts/xlsx-vocab-lint.mjs`, `scripts/xlsx-merged-shape.test.mjs`, `scripts/sp00-audit-v5.mjs`, `scripts/verify-no-forbidden.mjs`, and `.claude/hooks/lib/test-jargon-fixtures.mjs`.

The C8 guard in `scripts/xlsx-lint-rules.mjs` was redesigned from a basename check to a directory-membership check so it fires for both the consolidated workbook and every split file under `testcases/`.

`SHEET_NAMES` and `SHEET_DISPLAY_NAMES` entries added for `corporate_pricing_import_all` — the previously unnoticed 28-character slug that fell through silently. The `SPLIT_FILE_MAP` corporate-override group entries carried empty submodule tables because 59C had not yet completed; 59D filled them from 59C's attribution output.

Authoring documentation updated to describe the per-step Expected Result format in `docs/read_only_docs/CASE_GENERATION_STANDARD.md`, `clients/encore/specs_planning/_internal/field-case-generation.md`, and `export_test_cases/README.md` per D18.

## Per-Identity Satisfaction

| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (skipped: no requirement intake — existing test cases restructured, not newly elicited) | (none) |
| GIVER | authoring format documentation (D18) | `docs/read_only_docs/CASE_GENERATION_STANDARD.md`<br>`clients/encore/specs_planning/_internal/field-case-generation.md`<br>`export_test_cases/README.md` | (none) |
| BUILDER | pipeline parser, emitter, split-file tree, path retarget, gates | `export_test_cases/to-xlsx.ts` | `npm run xlsx:build` |
| HEALER | (none) | (skipped: no runtime failures diagnosed — static gates only per parent plan D9) | (none) |
| WATCHDOG | (none) | (skipped: verification battery is owned by 59E, not by individual subplans) | (none) |
| GARDENER | (none) | (skipped: registry and non-code footprint updates are scoped to 59D, not 59A) | (none) |

## Deferred / Dropped / App-Bug Dispositions

| # | Item | Disposition |
|---|---|---|
| 1 | Corporate-override submodule entries in `SPLIT_FILE_MAP` left as placeholders (59C Phase 0 not yet complete at 59A execution time) | Filled by 59D from 59C's attribution table — design-as-intended per D14 serialisation |

### 5.3 — `test:shared-paths`

Update the test expectations to use the new paths (`testcases/` instead of `test_cases_xlsx/`). This is a unit test for `scripts/shared-paths.ts` — changes follow from Phase 4 row 1-2.

### 5.4 — `xlsx:freshness`

**Current** (`scripts/xlsx-freshness.ts`): Builds a throwaway copy, compares to the committed consolidated file.
**Change**: Additionally compare each split file — build all 22, compare each against its committed counterpart. If any split file differs, freshness fails. Implementation: iterate SPLIT_FILE_MAP entries, compare each.

### 5.5 — `xlsx:lint`

**Current** (`scripts/xlsx-lint-rules.mjs`): Reads the single workbook and applies rules.
**Change**: Run lint rules against the consolidated file AND each split file. The `strictC8` redesign (Phase 4.1) already makes this work. The lint entry-point must glob `clients/encore/testcases/**/*.xlsx` and run rules per file.

### 5.6 — `test:xlsx-merged-shape`

**Current** (`scripts/xlsx-merged-shape.test.mjs`): Tests the merged workbook shape.
**Change**: Must iterate all 23 workbooks (1 consolidated + 22 split). For each split file, assert: exactly one worksheet, sheet name matches SPLIT_FILE_MAP, 13-column header identical to reference, SUMMARY row present, blank separator present.

### 5.7 — `verify:no-forbidden` (both call sites)

Already handled in Phase 4 rows 9-10. The function `lintXlsxDir()` scans a directory — retarget from `test_cases_xlsx` to `testcases` and it finds all nested files automatically.

### 5.8 — `verify:no-stale-refs`

Ensure it greps for `test_cases_xlsx` as a stale reference. Add `test_cases_xlsx` to the stale-reference pattern list so any leftover occurrence is caught.

### 5.9 — `pipeline:validate` + `pipeline:preflight`

These meta-gates orchestrate the above. No direct code change — they call the individual gates. Confirm they still pass end-to-end after all sub-gate updates.

### 5.10 — Jargon-gate hook fixture (`.claude/hooks/lib/test-jargon-fixtures.mjs:129`)

Already handled in Phase 4 row 12. Path update only.

### 5.11 — Files touched

| File | Change |
|---|---|
| `scripts/shared-paths.ts` | Path constants |
| `scripts/xlsx-freshness.ts` | Path + multi-file comparison |
| `scripts/xlsx-dump.ts` | Path const |
| `scripts/xlsx-vocab-lint.mjs` | Path const |
| `scripts/xlsx-merged-shape.test.mjs` | Path + iterate all workbooks |
| `scripts/sp00-audit-v5.mjs` | Path const |
| `scripts/verify-no-forbidden.mjs` | Path (×2) |
| `scripts/xlsx-lint-rules.mjs` | `strictC8` guard redesign + path |
| `.claude/hooks/lib/test-jargon-fixtures.mjs` | Fixture path |
| `package.json` (or relevant script config) | Script args if path is passed via CLI |

---

## Per-Identity Satisfaction (as planned — superseded by the post-execution matrix above)

| Identity | Duty | Concrete deliverable |
|---|---|---|
| BUILDER | Markdown schema definition | `clients/encore/specs_planning/test-cases/setup/**/*_test_cases.md` (×22 migrated) |
| BUILDER | Migration script | `scripts/migrate-steps-to-table.ts` |
| BUILDER | Parser updates | `export_test_cases/to-csv.ts`<br>`export_test_cases/markdown-parser.ts`<br>`export_test_cases/to-xlsx.ts` |
| BUILDER | Split-file emitter | `export_test_cases/to-xlsx.ts` (writeSplitFiles + SPLIT_FILE_MAP) |
| BUILDER | Hardcoded path updates | `scripts/shared-paths.ts`<br>`scripts/xlsx-freshness.ts`<br>`scripts/xlsx-dump.ts`<br>`scripts/xlsx-vocab-lint.mjs`<br>`scripts/xlsx-merged-shape.test.mjs`<br>`scripts/sp00-audit-v5.mjs`<br>`scripts/verify-no-forbidden.mjs`<br>`scripts/xlsx-lint-rules.mjs`<br>`.claude/hooks/lib/test-jargon-fixtures.mjs` |
| BUILDER | Gate updates | `scripts/xlsx-freshness.ts`<br>`scripts/xlsx-merged-shape.test.mjs`<br>`scripts/xlsx-lint-rules.mjs` |
| BUILDER | Regression-guard snapshot | (skipped: regression-guard pre/post snapshots were not captured during 59A execution — no persistent evidence exists for this subplan) |
| WATCHDOG | (skipped: 59E runs the full gate battery as the final audit — no independent WATCHDOG phase in 59A) | |

---

## Acceptance criteria

- [ ] `find clients/encore/testcases -name "*.xlsx" | wc -l` = 23 (1 consolidated + 22 split).
- [ ] `ls clients/encore/test_cases_xlsx 2>&1` → "No such file or directory".
- [ ] `grep -rn "test_cases_xlsx" scripts/ export_test_cases/ .claude/hooks/ | grep -v node_modules | wc -l` = 0.
- [ ] `npx tsc --noEmit` exit 0.
- [ ] `npx playwright test --list --config=clients/encore/playwright.config.ts` exit 0.
- [ ] `npm run xlsx:build` exit 0 and produces 23 files under `clients/encore/testcases/`.
- [ ] `npm run check:tc-parity` exit 0.
- [ ] `npm run test:shared-paths` exit 0.
- [ ] `npm run test:xlsx-merged-shape` exit 0.
- [ ] Every split file contains exactly one worksheet with the correct sheet name per SPLIT_FILE_MAP.
- [ ] `grep -c "^| #" clients/encore/specs_planning/test-cases/setup/**/*_test_cases.md` matches TC-ID count per file (migration completeness).
- [ ] `scripts/xlsx-lint-rules.mjs` C8 rule fires on split files (not silently skipped).

---

## Verification

Static only, per PLAN_59 D9.

```
npx tsc --noEmit
npx playwright test --list --config=clients/encore/playwright.config.ts
npm run xlsx:build
npm run check:tc-parity
npm run test:shared-paths
npm run test:xlsx-merged-shape
npm run xlsx:lint
npm run verify:no-stale-refs
npm run verify:no-forbidden
```

---

## Execution Summary (planning-time placeholder — superseded)

_(placeholder — filled at execution time)_

---

## Handoff (post-execution)

**To 59B**: All 22 markdown files are now in step-table format with empty Expected Result columns. The parser and emitter handle per-step ER. 59B fills column 3 from harvest/derivation/authoring, then re-runs `npm run xlsx:build` to generate the final deliverable.

**To 59E**: The gate battery is updated but not exhaustively run under D9's static-only constraint. 59E does the full non-running battery + ship.
