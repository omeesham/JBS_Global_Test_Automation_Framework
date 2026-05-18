# PLAN_FIXTURE_BAD_C5_ALL_ELEVEN_SPACED

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C5 due to having a strict-line acceptance item referencing "all 11 columns" while also documenting a deviation that mentions "columns" — the deviation contradicts the strict acceptance line.

## Scope

- Test C5 strict-line violation detection with "all N" pattern

## Steps

1. Verify all 11 history columns
2. Document any deviations from full column coverage

## Deviations

- Deviation D1: 2 columns were not verifiable due to rendering differences in the history grid. The date-format and timezone columns displayed inconsistent values across sessions, preventing reliable assertion.

## Execution Summary

Attempted verification of all 11 history columns. Two columns could not be reliably verified due to rendering inconsistencies, creating a deviation that contradicts the strict acceptance line.

- Step 1: attempted verification of all 11 history columns in the grid
- Step 2: documented deviation for 2 columns with rendering issues
- Deviation D1 contradicts the "all 11 columns verified" acceptance item
- The strict-line pattern "all 11 columns" requires complete coverage
- The deviation mentions "columns" which matches the strict-line axis
- C5 validator should detect the strict-line/deviation axis overlap
- No forbidden tokens in body (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths (clean C3)
- No phantom handoffs (clean C4)
- Self-test: exercises C5 strict-line detection with "all N" quantifier pattern
- Validator expected verdict: FAIL (C5 — strict line contradicted by deviation)
- Audit note: intentional C5 failure fixture for all-N-columns pattern

## Acceptance

- [x] all 11 columns verified
- [x] Deviations documented
