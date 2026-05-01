# SUBPLAN: Post-Test Slate-Clear — Pattern Design + Shared Utility

**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-22
**Blocks**: SP-DQU-24 (rollout)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_23_G3_POST_TEST_SLATE_CLEAR.md`
**Identity**: BUILDER
**Skills auto-called**: /identity, /planning, /simplify
**Model + thinking**: Opus + high
**Dependency gate**: SP-DQU-22 `Status: DONE`
**Context files**:
- `src/utils/slate-clear.ts` (from SP-22)
- State matrix from SP-21
- Existing `CLEANUP REQUIRED` notes in test-case MDs

## Purpose

Design + implement the mirror utility: restores known-good baseline after each test. Paired with pre-test clear, means other people (or prior tests) can't leave office 1604 in a broken state that flakes the next run.

## Step-by-step

1. Extend `src/utils/slate-clear.ts` with:
   - `slateClear.afterSpec(page, module)` — reset to baseline (matches beforeSpec; idempotent).
   - `slateClear.afterTest(page, test)` — per-test cleanup if TC wrote state that doesn't recover via reload alone.
2. Implementation: whenever possible, use reload + known-default-value re-type. Avoid API restores that depend on credentials the test doesn't have.
3. Handle Angular dirty-state: afterEach must handle the "Unsaved changes" alertdialog if a test saved without restoring (LR-026). Dismiss "Discard".
4. Read every `CLEANUP REQUIRED` note in test-case MDs as requirements input. The utility's per-module helpers should cover every noted cleanup automatically.
5. Smoke-test on the same spec as SP-22. Run spec in isolation, then run again — verify baseline before second run.
6. Activity-log row.

## Acceptance criteria

- [ ] `slateClear.afterSpec()` + `afterTest()` implemented.
- [ ] Every `CLEANUP REQUIRED` MD note mapped to a utility call.
- [ ] Smoke-test on same spec; 2 consecutive runs pass.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-24 (rollout to all 11 specs).
