# PLAN_FIXTURE_BAD_C3_WINDOWS_BACKSLASH

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C3 due to citing a file path with Windows-style backslashes. The validator should normalize backslashes to forward slashes before checking existence.

## Scope

- Test C3 backslash normalization and subsequent existence check

## Steps

1. Walk shared-setup surface
2. Record evidence path using Windows backslash notation

## Walk Results

- Screenshot captured: test-results\walk\shared-setup\screenshot.png
- Fields inspected against spec baseline

## Execution Summary

Walked the shared-setup surface and recorded evidence using Windows-style backslash path separators. The validator must normalize these before checking disk existence.

- Step 1: shared-setup surface accessed and fields reviewed
- Step 2: evidence path recorded with backslash separators above
- Cited path: test-results\walk\shared-setup\screenshot.png (backslash format)
- After normalization: test-results/walk/shared-setup/screenshot.png (does not exist)
- C3 validator should normalize backslashes to forward slashes before stat check
- Post-normalization existence check should fail (file not on disk)
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 Windows path normalization logic
- Validator expected verdict: FAIL (C3 — normalized path missing from disk)
- Audit note: intentional C3 failure fixture for backslash normalization

## Acceptance

- [x] Surface walked
- [ ] Evidence file exists after normalization (intentionally missing)
