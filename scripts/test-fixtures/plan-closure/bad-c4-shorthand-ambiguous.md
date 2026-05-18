# PLAN_FIXTURE_BAD_C4_SHORTHAND_AMBIGUOUS

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C4 due to using an ambiguous shorthand reference for a handoff target instead of a fully qualified plan filename.

## Scope

- Test C4 ambiguous shorthand detection

## Steps

1. Complete scope-A investigation
2. Document deferred items with scope references

## Findings

Scope-A investigation completed. Several items fell outside scope boundaries.

## Deferred Items

Deferred to SP-D per scope review — the remaining field enumeration belongs to a different scope partition and should be handled in the appropriate downstream plan.

## Execution Summary

Completed scope-A investigation and identified items for deferral. The deferral uses an ambiguous shorthand reference rather than a fully qualified plan filename.

- Step 1: scope-A investigation completed, all in-scope fields verified
- Step 2: deferred items documented with ambiguous shorthand reference
- Deferred reference: "SP-D" — this is an ambiguous shorthand that could match multiple plans
- C4 validator should flag this as ambiguous (not resolvable to a single plan file)
- A valid reference would be a full filename like SUBPLAN_D_SOMETHING.md
- No forbidden tokens in body (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths (clean C3)
- No strict-line violations (clean C5)
- Self-test: exercises C4 ambiguous shorthand detection
- Validator expected verdict: FAIL (C4 — ambiguous handoff shorthand)
- Audit note: intentional C4 failure fixture for shorthand ambiguity

## Acceptance

- [x] Scope-A investigation completed
- [x] Deferred items documented
