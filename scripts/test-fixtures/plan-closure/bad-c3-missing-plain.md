# PLAN_FIXTURE_BAD_C3_MISSING_PLAIN

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C3 due to citing a file path (plain text, no markdown link) that does not exist on disk.

## Scope

- Test C3 cited-path existence validation for plain text references

## Steps

1. Walk shared-setup surface
2. Capture screenshot evidence

## Walk Results

- Screenshot captured: test-results/walk/shared-setup/screenshot-01.png
- Field A DOM verified against spec baseline

## Execution Summary

Walked the shared-setup surface and captured screenshot evidence. The cited screenshot path references a file that does not exist on disk.

- Step 1: shared-setup surface accessed and fields inspected
- Step 2: screenshot reference recorded in walk results above
- Cited path: test-results/walk/shared-setup/screenshot-01.png (does not exist)
- The C3 validator should detect this non-existent plain-text file reference
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 plain-text path detection and existence check
- Validator expected verdict: FAIL (C3 — cited path missing from disk)
- Deviation: none from plan scope
- Audit note: intentional C3 failure fixture for missing plain-text path

## Acceptance

- [x] Surface walked
- [ ] Evidence file exists on disk (intentionally missing)
