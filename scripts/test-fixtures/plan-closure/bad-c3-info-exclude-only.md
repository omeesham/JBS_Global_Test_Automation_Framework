# PLAN_FIXTURE_BAD_C3_INFO_EXCLUDE_ONLY

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-08-18
**Executed**: 2026-08-18
**expected_verdict**: FAIL

---

## Objective

Fixture that FAILS C3: cites a missing path that should be ignored only by `.git/info/exclude` during the targeted proof, never by a portable `.gitignore`.

## Steps

1. Cite a missing artifact path used by the info-exclude-only proof

## Execution Summary

Cited path: out-info-exclude/local-only-c3-info-exclude-g78.txt â€” this file does not exist on disk and is intentionally not matched by the repository `.gitignore` rules.

- Step 1: missing path cited above
- The targeted proof appends the path to `.git/info/exclude`
- C3 should still fail because local-only ignore sources are not portable between clones
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 local-only exclude fallback
- Deviation: none from plan scope
- Audit note: intentional C3 fail fixture for info-exclude-only path
