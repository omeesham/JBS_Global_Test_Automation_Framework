# SUBPLAN: /simplify Sweep — On Whitelist Only

**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-26 (scope required)
**Blocks**: SP-DQU-28 (cleanup after simplify)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_27_H2_SIMPLIFY_SWEEP.md`
**Identity**: GARDENER
**Skills auto-called**: /identity, /simplify, /regression-guard (before + after)
**Model + thinking**: Sonnet + medium (mechanical simplification with tests as guardrail)
**Dependency gate**: SP-DQU-26 `Status: DONE`; `simplify-cleanup-scope-2026-04-22.md` exists.
**Context files**:
- Scope file from SP-26
- `.claude/skills/simplify/SKILL.md` (rules for what counts as "simple")

## Purpose

Apply `/simplify` discipline to the whitelist: reduce line count, consolidate duplicate logic, replace over-engineered abstractions with direct code. User preference: "humans write basic bare min code, but u are better than them, but u have to write simple code of best quality".

## Step-by-step

1. Regression fingerprint snapshot (whitelist only).
2. For each file in scope:
   - Run `/simplify` skill logic: identify over-engineering, unused branches, duplicate helpers, unnecessary abstractions.
   - Apply simplifications one file at a time.
   - After each file: run tests that cover that file (or the full spec that uses that page object).
3. Bound: do NOT change public API without `/regression-guard` showing zero imports break.
4. Bound: do NOT touch agent/pipeline/website code (per scope file EXCLUDE list).
5. Bound: do NOT simplify by deleting working edge-case handlers — confirm "unused" via grep + dynamic test.
6. Regression fingerprint after. Diff should show only whitelist files changed.
7. Run full suite once. Zero regressions.
8. Activity-log row.

## Acceptance criteria

- [ ] Every whitelist file reviewed; simplifications applied where beneficial.
- [ ] Zero test regressions.
- [ ] Regression fingerprint matches.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-28 (cleanup sweep — dead code + unused imports + orphaned files).
