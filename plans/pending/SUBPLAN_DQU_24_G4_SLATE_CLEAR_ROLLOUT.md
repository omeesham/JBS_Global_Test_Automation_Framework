# SUBPLAN: Slate-Clear — Rollout to All 11 Specs

**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-22, SP-DQU-23
**Blocks**: SP-DQU-25 (full-suite clean run + RCA)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_24_G4_SLATE_CLEAR_ROLLOUT.md`
**Identity**: HEALER
**Skills auto-called**: /identity, /bugfix, /regression-guard (before + after)
**Model + thinking**: Sonnet + medium (mechanical spec edits)
**Dependency gate**: SP-DQU-22 + SP-DQU-23 both `Status: DONE`
**Context files**:
- `src/utils/slate-clear.ts`
- All 11 spec files
- State matrix from SP-21

## Purpose

Apply slate-clear pre/post-hooks to all 11 specs. Convert ad-hoc CLEANUP REQUIRED notes to utility calls. Remove duplicate cleanup code from specs.

## Step-by-step

1. Regression fingerprint.
2. For each spec:
   - Import `slateClear` from `src/utils/slate-clear.ts`.
   - Add `beforeAll(() => slateClear.beforeSpec(page, 'module-name'))`.
   - Add `afterAll(() => slateClear.afterSpec(page, 'module-name'))`.
   - For any test with per-test state dependency, add `beforeEach` + `afterEach` calls with test ID.
   - Delete ad-hoc cleanup code that's now covered by utility.
3. Run each spec individually: `npx playwright test <spec>`. Must pass.
4. Run all specs together: `npm test`. Must pass clean.
5. Regression fingerprint after. Diff should show 11 specs + utility file changed; no functional regressions.
6. Activity-log row.

## Acceptance criteria

- [ ] All 11 specs use slateClear.
- [ ] Individual runs pass.
- [ ] Full-suite run passes clean.
- [ ] No functional regressions.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-25 (RCA any intermittent failures).
