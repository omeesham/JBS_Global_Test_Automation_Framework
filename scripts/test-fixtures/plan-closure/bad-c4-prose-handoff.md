# PLAN_FIXTURE_BAD_C4_PROSE_HANDOFF

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should WARN on C4 (before 2026-06-18 grace period) due to using prose-form handoff rather than structured handoff format. The plan references a real-looking subplan name but in unstructured prose.

## Scope

- Test C4 prose-form handoff detection and grace-period WARN behavior

## Steps

1. Complete primary scope work
2. Document deferral in prose format

## Findings

Primary scope work completed. Remaining enumeration is out of scope for this plan.

Deferred to SUBPLAN_SOME_EXISTING_PLAN.md per scope — the local-info fields require a separate walk session that was not budgeted in this plan's scope allocation.

## Execution Summary

Completed primary scope and deferred remaining work using prose-form notation instead of structured handoff fields. The reference uses a full plan filename but in unstructured prose.

- Step 1: primary scope work completed successfully
- Step 2: deferral documented in prose format in findings section
- Prose handoff: "Deferred to SUBPLAN_SOME_EXISTING_PLAN.md per scope"
- This is not a structured handoff (no handoff-target/handoff-reason/handoff-status fields)
- C4 validator should detect prose-form handoff and issue WARN (before grace period 2026-06-18)
- After grace period, this would become a FAIL requiring structured format
- No forbidden tokens in body (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths (clean C3)
- No strict-line violations (clean C5)
- Self-test: exercises C4 prose-form detection and WARN grace period
- Validator expected verdict: WARN (C4 — prose handoff, pre-grace-period)
- Audit note: intentional C4 WARN fixture for prose handoff format

## Acceptance

- [x] Primary scope completed
- [x] Deferral documented (prose format)
