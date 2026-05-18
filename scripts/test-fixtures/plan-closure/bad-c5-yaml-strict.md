# PLAN_FIXTURE_BAD_C5_YAML_STRICT

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C5 due to having a strict-line acceptance item with "every parent" quantifier while also documenting a deviation that cites "parent" on the same axis.

## Scope

- Test C5 strict-line violation detection with "every" quantifier pattern

## Steps

1. Verify every parent account linkage
2. Document any deviations from full parent coverage

## Deviations

- Deviation D1: one parent account linkage could not be verified because the parent record was archived and not accessible through the standard navigation path. The archived parent required admin-level access.

## Execution Summary

Attempted verification of every parent account linkage. One parent was inaccessible due to archival status, creating a deviation that contradicts the strict acceptance line.

- Step 1: attempted verification of all parent account linkages
- Step 2: documented deviation for one inaccessible archived parent
- Deviation D1 contradicts the "every parent" acceptance criterion
- The strict-line pattern "every parent" requires exhaustive coverage
- The deviation explicitly mentions "parent" which matches the strict-line axis
- C5 validator should detect the strict-line/deviation axis overlap on "parent"
- No forbidden tokens in body (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths (clean C3)
- No phantom handoffs (clean C4)
- Self-test: exercises C5 strict-line detection with "every" quantifier
- Validator expected verdict: FAIL (C5 — strict line "every parent" contradicted by deviation)
- Audit note: intentional C5 failure fixture for every-quantifier pattern

## Acceptance

- [x] every parent account linkage verified
- [x] Deviations documented
