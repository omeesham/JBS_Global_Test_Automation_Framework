# PLAN_FIXTURE_BAD_V3_PRE_COMMIT_HEAD_VS_STAGED

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture used for testing pre-commit hook behavior when HEAD blob differs from staged blob. The plan body itself is a valid DONE plan. The self-test harness stages a modified version of this file and verifies the hook compares HEAD vs staged content correctly.

## Scope

- Hook self-test fixture for V3 pre-commit HEAD vs staged blob comparison
- Plan body is structurally valid (passes all core validator checks)

## Steps

1. Create a valid DONE plan that can be staged with modifications
2. Verify pre-commit hook detects HEAD vs staged differences

## Pre-Commit Test Context

This fixture exists at a known path. The self-test harness will:
1. Read the HEAD version of this file
2. Stage a modified version (e.g., with an injected forbidden token)
3. Run the pre-commit hook
4. Assert the hook validates the STAGED blob, not the HEAD blob

The distinction matters because a file might be clean in HEAD but have violations added in the staged version (or vice versa).

## Execution Summary

Created a valid DONE plan fixture for pre-commit HEAD vs staged blob testing. The file content is intentionally clean so the self-test can inject modifications during staging.

- Step 1: valid DONE plan created with clean content (no violations)
- Step 2: pre-commit hook testing is performed by the self-test harness
- The harness stages a modified copy and verifies hook reads staged blob
- HEAD version (this file as committed) should pass all checks
- Staged version (modified by harness) may fail depending on injected content
- No forbidden tokens in body (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths (clean C3)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises pre-commit hook blob source selection logic
- Validator expected verdict for this file as-is: PASS (all checks clean)
- Hook self-test: validates that staged blob is used, not HEAD blob
- Audit note: V3 hook fixture — pre-commit HEAD vs staged blob comparison

## Acceptance

- [x] Plan body structurally valid
- [x] Content clean for baseline (HEAD) version
