# PLAN_FIXTURE_BAD_V6_FINAL_Q_NO_MANIFEST_WRITE

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture used to assert that running the validator with `--enforce` (without `--write-manifest`) produces no manifest file and no .tmp file on disk. The plan body itself is a valid DONE plan that should pass all core checks.

## Scope

- Hook self-test fixture for V6 enforce-only mode (no manifest write)
- Plan body is structurally valid (passes all core validator checks)

## Steps

1. Create a valid DONE plan for enforce-mode testing
2. Verify that --enforce alone does not produce manifest or tmp artifacts

## Enforce Mode Context

The validator supports two flags:
- `--enforce`: runs all checks and returns pass/fail verdict
- `--write-manifest`: additionally writes a manifest file recording the verdict

When `--enforce` is used alone (without `--write-manifest`), the validator should:
1. Run all C1-C5 checks against the plan
2. Return the verdict (PASS or FAIL)
3. NOT create any manifest file on disk
4. NOT leave any .tmp files behind

## Execution Summary

Created a valid DONE plan fixture for enforce-only mode testing. The self-test harness runs the validator with --enforce flag and asserts no file artifacts are produced.

- Step 1: valid DONE plan created with clean content
- Step 2: artifact-free execution verified by self-test harness
- The harness runs: validator --enforce bad-v6-final-q-no-manifest-write.md
- Expected: verdict returned (PASS), zero new files created on disk
- Asserts: no .manifest file, no .tmp file, no side-effect artifacts
- No forbidden tokens in body (clean C1)
- Execution summary content lines exceed threshold (clean C2)
- No cited evidence paths (clean C3)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises V6 enforce-only mode artifact-free assertion
- Validator expected verdict: PASS (all checks clean)
- Hook self-test: validates no manifest or tmp files produced
- Audit note: V6 hook fixture — enforce mode no-manifest-write assertion

## Acceptance

- [x] Plan body structurally valid
- [x] Content passes all C1-C5 checks
