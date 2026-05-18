# PLAN_FIXTURE_BAD_C4_PHANTOM_RECIPIENT

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C4 due to a handoff targeting a plan file that does not exist in the repository.

## Scope

- Test C4 phantom handoff detection for nonexistent recipient plans

## Steps

1. Complete primary investigation
2. Defer remaining work to downstream subplan

## Findings

Primary investigation completed. Remaining scope deferred to downstream plan.

## Handoffs

- handoff-target: SUBPLAN_NONEXISTENT_PLAN.md
- handoff-reason: remaining field enumeration deferred per scope boundary
- handoff-status: pending

## Execution Summary

Completed primary investigation and deferred remaining work to a downstream subplan. The handoff target does not exist in the repository.

- Step 1: primary investigation completed successfully
- Step 2: handoff created targeting SUBPLAN_NONEXISTENT_PLAN.md
- The handoff target file does not exist anywhere in the plans directory
- C4 validator should detect this as a phantom handoff (nonexistent recipient)
- No forbidden tokens in body (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths requiring existence checks (clean C3)
- No strict-line acceptance violations (clean C5)
- Self-test: exercises C4 phantom recipient detection
- Validator expected verdict: FAIL (C4 — handoff target does not exist)
- Audit note: intentional C4 failure fixture for phantom handoff detection

## Acceptance

- [x] Primary investigation completed
- [x] Handoff documented with target and reason
