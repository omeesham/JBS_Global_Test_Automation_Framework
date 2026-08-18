# PLAN_FIXTURE_BAD_C3_GITIGNORED_UNVOUCHED

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-08-18
**Executed**: 2026-08-18
**expected_verdict**: FAIL

---

## Objective

Fixture that FAILS C3: cites a `.log` path that is gitignored and absent, but the plan's closure manifest does NOT vouch for it. Exercises the narrowed gitignore-pass (TICKET-g78-V27).

## Steps

1. Cite a gitignored `.log` path that is not in the manifest

## Execution Summary

Cited path: out-e2e/fabricated-evidence.log — this path is gitignored (matches `*.log` in root `.gitignore`) and does not exist on disk. The plan has a closure manifest at plans/_closure_manifests/bad-c3-gitignored-unvouched.md.manifest.json but the manifest does not list this path. The narrowed C3 check should FAIL because the gitignored path is unvouched.

- Step 1: gitignored path cited above
- The manifest exists but only lists the fixture file itself, not the .log path
- C3 sees gitignored + manifest present + path NOT in manifest.artifacts → FAIL
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 gitignored+unvouched path detection
- Deviation: none from plan scope
- Audit note: intentional C3 failure fixture for gitignored unvouched path
