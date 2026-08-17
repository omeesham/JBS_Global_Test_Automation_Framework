# SUBPLAN: REQUIREMENTS.md — Sampling-Verification Loop (Probabilistic Clean)

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-01
**Blocks**: SP-DQU-29 (identity ripple needs REQUIREMENTS.md trusted before re-syncing)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_09_D1_REQS_SAMPLING_VERIFICATION.md`
**Identity**: WATCHDOG
**Skills auto-called**: /identity, /audit, /research
**Model + thinking**: Opus + high (needs judgment on defect classification)
**Dependency gate**: SP-DQU-01 `Status: DONE`
**Context files**:
- `clients/encore/CLAUDE.md (was REQUIREMENTS.md, removed 2026-05-19 per unified-matsumoto plan)`
- `clients/encore/CLAUDE.md (was MODULE_REGISTRY.md, removed 2026-05-19 per unified-matsumoto plan)`
- `clients/encore/docs/read_only_docs/Functional Requirement -v1.docx`
- `clients/encore/docs/read_only_docs/Encore-Requirements-V2.docx`
**Phase 0 directive**: announce browser tool — Chrome Claude (LR-038: exploratory, auth-heavy, sampling-verification needs live DOM).
**HALT conditions**:
- 5 iterations without convergence (2 consecutive clean sets) → HARD HALT, escalate to user for scope re-decision on REQUIREMENTS.md as a separate plan.

---

## Purpose

Probabilistic-clean verification of REQUIREMENTS.md. Random-sample requirement items, verify each on live DOM. Iterate until two consecutive sample sets return zero defects. Convergence = confidence without 100% verification cost.

Per user directive: "verify a set of items, larger the better, then check if any mistake, if yes, this repeats, checks go on until a couple or so sets have no errors of anytype".

## Step-by-step (iterative loop)

**Round 1 (sample size 10)**

1. List every discrete verifiable claim in REQUIREMENTS.md (field rule, default, constraint, behavior). Target: ~100+ claims across all modules.
2. Randomly pick 10 (use `Math.random()` or index list + random indices; document the indices in findings).
3. For each sampled claim: navigate to its module via Chrome Claude; verify on live DOM; mark PASS / DEFECT.
4. If zero defects → proceed to Round 2 with set=10 still (two consecutive clean rounds required — do not skip).
5. If any defect → record defect, fix REQUIREMENTS.md inline, go back to step 2 with a fresh random sample.

**Round 2 (sample size 20)**

6. Larger sample (20 items). Same verification loop.
7. If zero defects after both Round 1 (clean) AND Round 2 (clean) → convergence. Stop.
8. If defect → fix, restart at Round 1 (fresh 10).

**Round 3+ (sample size 30)**

9. Only enter Round 3 if user escalates scope after 5 iterations without Round-2 convergence.

**Per iteration**

- Log to the requirements sampling verification artifact dated 2026-04-22 (the artifact this cited is gone; the claim is unverified as file evidence):
  - Iteration number.
  - Sample indices + claims.
  - PASS/DEFECT per claim.
  - Fixes applied to REQUIREMENTS.md (with old/new text).

## Acceptance criteria

- [ ] Verification log exists for the requirements sampling verification artifact dated 2026-04-22 (the artifact this cited is gone; the claim is unverified as file evidence).
- [ ] Two consecutive clean sample rounds recorded (sample sizes 10 and 20, or larger).
- [ ] All defects found were fixed inline in REQUIREMENTS.md with evidence.
- [ ] Activity-log row appended.
- [ ] (If escalated) HALT escalation recorded in log + chat.

## Handoff

Next depends on ordering. REQUIREMENTS.md is now trusted at probabilistic-clean level. Tell SP-DQU-29 owner: "REQUIREMENTS.md probabilistic-clean as of <date>; use as reference for identity ripple sync."
