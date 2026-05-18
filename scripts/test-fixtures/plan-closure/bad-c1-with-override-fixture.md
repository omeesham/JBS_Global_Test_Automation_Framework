# PLAN_FIXTURE_BAD_C1_WITH_OVERRIDE

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that contains a NOT-WALKED forbidden token but has a matching override entry in `_overrides.json`. When tested WITH the override file loaded, this should PASS. When tested WITHOUT the override file, this should FAIL C1.

## Scope

- Test C1 override lookup flow
- Validate that authorized overrides suppress C1 failures

## Steps

1. Walk the target surface
2. Document findings including any unwalked fields

## Walk Results

- Field A: verified against spec
- NOT-WALKED
- Field C: verified against spec

## Execution Summary

Surface investigation completed with one field remaining unwalked. An override has been granted in the closure-overrides file authorizing this specific gap for the fixture plan.

- Step 1: target surface accessed and two of three fields walked
- Step 2: walk results documented above with NOT-WALKED token for Field B
- Override authorization: entry exists in `_overrides.json` for this plan and token
- Override grants permanent exemption (expires 2099-12-31) for self-test validation
- With override loaded: C1 check should resolve to PASS (token is authorized)
- Without override loaded: C1 check should resolve to FAIL (token is forbidden)
- No other forbidden tokens present in plan body
- No phantom handoffs or strict-line violations
- Self-test: exercises the override lookup and suppression path
- Validator expected verdict: PASS (with overrides) or FAIL (without overrides)
- Audit note: dual-mode fixture for override system validation

## Acceptance

- [x] Surface investigated
- [x] Override entry created and validated
