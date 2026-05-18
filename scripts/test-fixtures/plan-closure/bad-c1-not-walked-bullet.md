# PLAN_FIXTURE_BAD_C1_NOT_WALKED_BULLET

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C1 due to a NOT-WALKED token appearing as a bullet point in the plan body.

## Scope

- Test C1 forbidden-token detection for bullet-list format

## Steps

1. Investigate shared-setup surface
2. Walk all fields and capture evidence

## Walk Results

- Field A: verified, DOM matches spec
- NOT-WALKED
- Field C: verified, DOM matches spec

## Execution Summary

Completed investigation of shared-setup surface. Two of three fields were walked and verified against the spec. One field was not walked due to access constraints.

- Step 1: surface investigated, two fields verified
- Step 2: partial walk — one field remains NOT-WALKED as noted above
- Evidence captured for walked fields
- Deviation: one field could not be accessed during the walk session
- No handoffs generated
- Plan closed with known gap documented in walk results
- Self-test: this fixture should trigger C1 FAIL on the NOT-WALKED bullet
- Validator expected verdict: FAIL (C1 forbidden token detected)
- No strict-line violations present
- No phantom handoff references
- Audit note: intentional C1 failure fixture for self-test

## Acceptance

- [x] Surface investigated
- [ ] All fields walked (one NOT-WALKED)
