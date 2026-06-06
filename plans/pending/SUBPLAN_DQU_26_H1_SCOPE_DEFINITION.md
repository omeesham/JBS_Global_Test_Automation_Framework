# SUBPLAN: Scope Definition — Whitelist Encore Deliverable + Runtime Code

**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-01
**Blocks**: SP-DQU-27 (simplify sweep), SP-DQU-28 (cleanup sweep)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md`
**Identity**: GARDENER
**Skills auto-called**: /identity, /simplify, /audit
**Model + thinking**: Sonnet + medium
**Dependency gate**: SP-DQU-01 `Status: DONE`
**Context files**:
- Repo root tree
- Mega plan D9 (scope decision)
- `clients/encore/CLAUDE.md (was MODULE_REGISTRY.md, removed 2026-05-19 per unified-matsumoto plan)`
**Phase 0 directive**: no browser needed.

## Purpose

Per D9: scope of /simplify + /cleanup sweeps is Encore deliverables + Encore-specific runtime code only. NOT agents/pipeline/orchestrator/website. This subplan produces the explicit whitelist file that downstream sweeps read.

## Step-by-step

1. Build whitelist:
   - `specs/**/*.spec.ts` (spec files)
   - `src/pages/**/*.ts` (page objects)
   - `src/selectors/**/*.ts` (selectors)
   - `src/data/**/*.ts` (test data)
   - `clients/encore/specs_planning/test-cases/**/*.md` (test case MDs)
   - `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` (XLSX deliverable — a binary build artifact, no code simplification needed; per-module CSVs retired in PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase D)
   - `export_test_cases/**/*.ts` (export script — converter)
   - `src/utils/**/*.ts` (shared utilities IF used only by Encore specs; check import graph)
2. Build explicit EXCLUDE list:
   - `.github/agents/**` (agent prompts)
   - `.claude/**` (Claude Code skills + configs)
   - `website/**` (QA SaaS frontend/backend)
   - `tools/**` (if exists — tooling)
   - `config/**` (config files — not code)
   - `orchestrator/**` or `pipeline/**` (if exists)
   - `scripts/**` (utility scripts — user dependent, confirm with user first)
3. For each whitelist path, list file count + line count. Sanity-check scope manageable (expect ~40-80 files total).
4. Write to `clients/encore/specs_planning/_internal/simplify-cleanup-scope-2026-04-22.md`: INCLUDE + EXCLUDE tables + rationale for ambiguous paths + sign-off-with-user prompt.
5. Activity-log row.

## Acceptance criteria

- [ ] Scope file exists with INCLUDE + EXCLUDE tables.
- [ ] File counts per include path reasonable (not 500+ per path).
- [ ] Any ambiguous path flagged for user confirmation.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-27 (simplify sweep) + SP-DQU-28 (cleanup sweep). Both read this scope file.
