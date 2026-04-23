# SUBPLAN: Converter — Rename `Specific Field` → `Tags` Column

**Status**: DONE
**Executed**: 2026-04-23
**Priority**: P0
**Created**: 2026-04-22
**Parent**: [PLAN_DELIVERABLE_QUALITY_UPGRADE.md](../pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md)
**Depends on**: SP-DQU-01 (can run parallel to SP-02/03/04/05 — converter work is independent until tag rollout)
**Blocks**: SP-DQU-08 (tag rollout needs converter ready)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: acceptEdits

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_06_E1_CONVERTER_RENAME_TAGS.md`
**Identity**: BUILDER
**Skills auto-called**: /identity, /simplify, /regression-guard (before + after)
**Model + thinking**: Sonnet + medium (deterministic code edit)
**Dependency gate**: SP-DQU-01 `Status: DONE`
**Context files**:
- `export_test_cases/to-csv.ts` (the converter — lines 41-59 COLUMNS config, lines 686-715 extractSpecificField)
- `export_test_cases/types.ts` (ColumnConfig + Audience types if present)
- `export_test_cases/markdown-parser.ts` (metadata-table parsing for Priority/Status/Type row)
- Sample MD at `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` (for metadata table shape)
**Phase 0 directive**: regression fingerprint snapshot (exports, imports, signatures). Then study the metadata table parsing logic at `to-csv.ts:178-191`.
**HALT conditions**:
- Metadata table has no `Type` column in any MD → adding `Tags` as 4th column is still OK; converter should default Tags to empty if absent.
- `types.ts` has type constraints that break adding new `tags` field → extend types, don't hack around.

---

## Purpose

Rename CSV column 5 from `Specific Field` to `Tags`. Remove `extractSpecificField(title)` derivation. Add `parseTagsFromMetadataTable()` that reads 4th column of each TC's `| Priority | Status | Type | Tags |` table. Fallback: empty string if absent (Rule 5 grep gate catches empty Tags later).

## Step-by-step

1. Regression fingerprint snapshot of `export_test_cases/` directory.
2. In `to-csv.ts`:
   - Update `COLUMNS` config (line 41-59): rename `{ key: 'specificField', label: 'Specific Field', audience: 'both' }` to `{ key: 'tags', label: 'Tags', audience: 'both' }`.
   - Update `SimpleTestCase` interface (line 19-34): rename `specificField: string` to `tags: string`.
   - Update `parseSimpleFormat()` (line 158-310): delete `extractSpecificField()` call at line ~300; add `tags` extraction from metadata table (extend the 4th column pull at line ~185).
   - Extend metadata-table parsing: read 4th cell if present, trim, assign to `tags`. If absent, empty string.
   - Keep `extractSpecificField()` as a private helper only (NOT called) for one release cycle in case client tooling regresses — or delete it (user prefers minimal code; default = delete).
3. If `types.ts` has `ColumnConfig.key` as string-literal union, update it: `'specificField'` → `'tags'`.
4. Run TypeScript compile: `npx tsc --noEmit -p tsconfig.json` (or whatever check script exists). Zero errors.
5. Smoke-test exporter on LOS MD: `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md /tmp/los-smoke.csv`.
6. Open `/tmp/los-smoke.csv`: verify header reads `TC ID,Title,Module,Submodule,Tags,Preconditions,Steps,Expected Result,Notes`. Column 5 is now `Tags` (empty for all rows — will be filled in SP-08).
7. Regression fingerprint after. Any unexpected signature/import diff → investigate.
8. Activity-log row.

## Acceptance criteria

- [x] `to-csv.ts` COLUMNS has `tags` key with label `Tags`.
- [x] `parseSimpleFormat()` reads Tags from metadata table (header-name-aware lookup).
- [x] `extractSpecificField()` deleted.
- [x] TypeScript compile clean (export_test_cases/ — pre-existing errors in website/ are unrelated).
- [x] Smoke-test CSV header correct; column 5 is Tags, all rows empty (SP-08 fills them).
- [x] Regression fingerprint matches (only `to-csv.ts` changed; `types.ts` unchanged — `key: string` not a literal union).
- [x] Activity-log row.

## Execution Summary

### Changes implemented
- `export_test_cases/to-csv.ts` — 5 edits:
  1. `SimpleTestCase.specificField` → `tags`
  2. `COLUMNS[4]` key/label: `specificField`/`Specific Field` → `tags`/`Tags`
  3. `parseSimpleFormat()` metadata parsing: added header-aware Tags column extraction (reads header row at `j-1`, finds `Tags` column by name, extracts from data row at that index — fallback empty string if column absent)
  4. Replaced `extractSpecificField(title)` call with `tags` variable in push block
  5. `convertFile()` rowData: `specificField: tc.specificField` → `tags: tc.tags`
- `extractSpecificField()` method (lines 686–715 original) deleted
- `types.ts` unchanged — `ColumnConfig.key` is `string`, no literal union

### Plan deviation (improvement)
Plan said "read 4th column (positional)". MCP finding: existing MD files already have `| Priority | Status | Type | Automatable |` (Automatable at position 4). Positional read would have incorrectly populated Tags with "Yes"/"No" automatable values. Implemented header-name lookup instead — reads the header row, finds `Tags` by name, returns empty string when absent. Forward-compatible with SP-08's tag rollout regardless of column order.

### MCP verification
- Smoke test on `local_office_settings_test_cases.md` (83 TCs): header = `TC ID,Title,Module,Submodule,Tags,...` ✅
- All Tags cells `""` (empty) — correct; no MD has a `Tags` column yet ✅

### Test pass confirmation
Smoke test passed 2026-04-23. TypeScript compile (export_test_cases scope) clean.

## Handoff

Next: SP-DQU-07 (rules doc update). Converter is ready — all remaining work is authoring tags in MD files (SP-08).
