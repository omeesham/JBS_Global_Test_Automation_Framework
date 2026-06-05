# SUBPLAN: Full-Suite Clean Run + RCA Any Random Failures

**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-24
**Blocks**: SP-DQU-30 (Allure deliverable needs clean run as input)
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: auto
**Justification**: RCA = judgment-heavy multi-rule analysis (LR-041 Opus max criteria)

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_25_G5_FULL_SUITE_RCA.md`
**Identity**: HEALER
**Skills auto-called**: /identity, /rca, /regression-guard
**Model + thinking**: Opus + high (RCA needs judgment)
**Dependency gate**: SP-DQU-24 `Status: DONE`
**Context files**:
- LR-024 (clean artifacts + run fresh before RCA)
- LR-033 (network RCA checklist)
- LR-018 (spec-fixing workflow)
- `reports/html/` + `reports/allure-results/` (fresh run outputs)

## Purpose

Run full suite twice (freshly, per LR-024). Identify any test that fails ONLY in full-suite run (vs passing individually). RCA every such failure. Fix root cause (not symptom).

Goal: "specs only break on real issues, never on residual human-dirty state."

## Step-by-step

1. Clean all artifacts (LR-024): `npm run clean`; clear `.auth/`.
2. First full-suite run: `npm test`. Collect failures.
3. Clean again. Second full-suite run. Collect failures.
4. Classify failures:
   - Fails in both runs → deterministic; RCA.
   - Fails in one, not the other → intermittent; RCA per LR-024 Corollary (run twice to confirm).
5. For each failing test:
   - Read `failure-summary.json` → `networkFailures[]` (LR-033).
   - Run individually: does it pass alone? → indicates serial contamination → RCA the cause (shared state, auth, timing).
6. Fix root causes. Not patches.
7. Re-run full suite. Target: 100% pass, zero intermittent flakes on 3 consecutive runs.
8. Document RCA outcomes in `clients/encore/specs_planning/_internal/agent-mistakes.md` and/or add new LR-NNN if pattern repeats 3+ times (graduation via `/compile-learnings`).
9. Activity-log row.

## Acceptance criteria

- [ ] 3 consecutive fresh full-suite runs pass with zero intermittent failures.
- [ ] Every RCA documented.
- [ ] Regression fingerprint matches.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-30 (Allure deliverable). Chat summary: pass/fail counts, any bugs filed from RCA, any new LR-NNN drafted.
