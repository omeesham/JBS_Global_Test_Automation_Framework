# SUBPLAN: Duplicate & Junk Purge

**Status**: PENDING
**Priority**: P1-CYCLE-2
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Absorbs**: PLAN_PLANS_INDEX_AUTOREGEN
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

## Goal

Kill duplicate folders, consolidate scattered files, clean accumulated junk. One canonical location for each thing.

## What's Botched

- **3 allure locations**: `allure-report/` (root, 5.2M), `allure-results/` (root, 354K), `reports/allure-results/` (46M) — all gitignored but locally messy
- **Export tooling**: `export_test_cases/` holds the converter scripts (`to-xlsx.ts` + its `to-csv.ts` parity oracle). The former `test_cases_csv/` output dir was deleted in the 2026-05-27 CSV→XLSX migration; the deliverable is now the single `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` workbook
- **Reports bloat**: 124M with backup files (`.pre-*`), accumulated logs (`sp5-*.log`), 29M test-results.json
- **Root trash**: `cli and mcp in our repo.md` (random doc), `.tmp/` (empty dir)
- **MCP cache**: `.playwright-mcp/` 15M, 213 files, never cleaned
- **Logs**: `logs/` accumulated Playwright console logs, never cleaned
- **Stale dist**: `dist/` build artifacts not rebuilt since P0 decontamination (renamed locations/ → setup/locations/)

## Direction

1. Consolidate allure config to point to `reports/allure-results/` only. Verify `npm run allure:report` reads from canonical location.
2. Rename `export_test_cases/` to `tools/export-test-cases/` (it's a tool, not test cases). Verify `npm run xlsx:build` still emits `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` after the move. Update package.json scripts.
3. Extend `npm run clean` to purge: `.pre-*` backups, `sp*-*.log` files, root allure dirs, `.playwright-mcp/`, `.tmp/`
4. Delete root trash: `cli and mcp in our repo.md`, `.tmp/`
5. Verify `.gitignore` coverage for all junk locations
6. Absorbed: PLAN_PLANS_INDEX_AUTOREGEN — ensure `npm run plans:reindex` automation is working
