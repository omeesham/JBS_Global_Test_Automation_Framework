# PLAN_FIXTURE_BAD_C3_ABSOLUTE_PATH

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C3 due to citing an absolute Windows path. The validator should normalize this to a repo-relative path before checking existence.

## Scope

- Test C3 absolute-to-relative path normalization and existence check

## Steps

1. Walk target surface
2. Record evidence using absolute path notation

## Walk Results

- Evidence captured: C:\Users\RutvikKhorasiya\projects\encore_framework\nonexistent\file.png
- Surface fields reviewed against baseline

## Execution Summary

Walked target surface and recorded evidence using an absolute Windows file path. The validator must strip the repo root prefix to produce a relative path before checking disk existence.

- Step 1: target surface accessed and fields inspected
- Step 2: evidence path recorded with absolute Windows path above
- Cited path: C:\Users\RutvikKhorasiya\projects\encore_framework\nonexistent\file.png
- After normalization: nonexistent/file.png (relative to repo root)
- Post-normalization existence check should fail (directory and file do not exist)
- C3 validator should handle absolute path stripping for the repo root prefix
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 absolute path normalization and repo-root stripping
- Validator expected verdict: FAIL (C3 — normalized relative path missing from disk)
- Audit note: intentional C3 failure fixture for absolute path handling

## Acceptance

- [x] Surface walked
- [ ] Evidence file exists after normalization (intentionally missing)
