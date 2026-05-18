# PLAN_FIXTURE_BAD_C4_CIRCULAR

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C4 due to a self-referential handoff (the plan hands off to itself, creating a circular reference).

## Scope

- Test C4 circular/self-referential handoff detection

## Steps

1. Complete initial investigation
2. Defer remaining items

## Findings

Initial investigation completed. Remaining scope requires a follow-up pass.

## Handoffs

- handoff-target: bad-c4-circular.md
- handoff-reason: remaining fields require a second walk pass
- handoff-status: pending

## Execution Summary

Completed initial investigation and created a handoff that references the same plan file (self-referential circular handoff). This is an invalid handoff pattern.

- Step 1: initial investigation completed
- Step 2: handoff created but targets this same file (bad-c4-circular.md)
- The handoff-target is the plan's own filename, creating a circular reference
- C4 validator should detect self-referential handoffs as invalid
- A valid handoff must target a different plan file
- No forbidden tokens in body (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths (clean C3)
- No strict-line violations (clean C5)
- Self-test: exercises C4 circular reference detection
- Validator expected verdict: FAIL (C4 — self-referential handoff)
- Audit note: intentional C4 failure fixture for circular handoff detection

## Acceptance

- [x] Investigation completed
- [x] Handoff documented (intentionally circular)
