# PLAN_FIXTURE_BAD_C3_MISSING_NOT_IGNORED

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-08-18
**Executed**: 2026-08-18
**expected_verdict**: FAIL

---

## Objective

Fixture that FAILS C3: cites a missing path that is not ignored by a portable `.gitignore` rule.

## Steps

1. Cite a missing non-ignored artifact path

## Execution Summary

Cited path: docs/no-such-c3-artifact-g78.txt — this path does not exist on disk and is not ignored by a portable `.gitignore` rule.

- Step 1: missing non-ignored path cited above
- C3 should classify the citation as missing, not gitignored-unvouched
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 absent and not ignored path detection
- Deviation: none from plan scope
- Audit note: intentional C3 fail fixture for absent non-ignored path
