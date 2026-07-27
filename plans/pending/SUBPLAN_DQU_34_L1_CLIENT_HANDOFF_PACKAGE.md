# SUBPLAN: Client Handoff Package — CSVs + Allure + Bug Reports + README

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-08 (CSVs tagged), SP-DQU-30 (Allure), SP-DQU-31 (bug reports package), SP-DQU-29 (identity ripple sync)
**Blocks**: SP-DQU-35 (exit audit)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /deploy, /audit
**Model + thinking**: Opus + high (final-shipping judgment)
**Dependency gate**: SP-DQU-08 + SP-DQU-30 + SP-DQU-31 + SP-DQU-29 all `Status: DONE`
**Context files**:
- `clients/encore/testcases/encore_test_cases.xlsx` (single multi-sheet workbook — all modules)
- `reports/allure-report/` (Allure output)
- `reports/bugs/CLIENT_PACKAGE-*.md` (bug reports)
- `reports/bugs/INDEX-*.md`

## Purpose

Assemble the 4 client deliverables in priority order: **XLSX workbook (1) > specs clean (2, documented via Allure) > Allure report (3) > bug reports (4)**. Produce a handoff folder with README that the colleague can open cold.

## Step-by-step

1. Create `deliverables/2026-04-22/` directory (or use existing convention if project has one).
2. Copy (or link) into deliverables folder:
   - `test-cases/` → the `encore_test_cases.xlsx` workbook from `clients/encore/testcases/` (one sheet per module).
   - `allure-report/` → full allure output.
   - `bugs/` → `CLIENT_PACKAGE-*.md` + `INDEX-*.md`.
3. Write `deliverables/2026-04-22/README.md`:
   - What this package contains.
   - How to read the workbook (one sheet per module; explain the Tags column).
   - How to open the Allure report (static HTML).
   - How to read the bug reports (grouped by module).
   - Known limitations (NOT-AUTOMATABLE items flagged).
   - Point of contact (Rutvik).
4. Verify every filed APP bug from Track B/F has an entry in the bugs INDEX.
5. Sanity-check: open README.md in a markdown preview — reads like a colleague can follow cold.
6. Optional: `/deploy` skill pipeline for any git-commit / push steps required.
7. Activity-log row.

## Acceptance criteria

- [ ] `deliverables/2026-04-22/` contains 4 deliverables.
- [ ] README.md explains each and how to use.
- [ ] Every filed bug appears in INDEX.
- [ ] Colleague-readable cold.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-35 (exit audit — confirm all 8 user asks satisfied + LR-040 closure gate).
