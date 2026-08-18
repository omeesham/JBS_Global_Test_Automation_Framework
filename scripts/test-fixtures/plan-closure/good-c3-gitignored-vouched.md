# PLAN_FIXTURE_GOOD_C3_GITIGNORED_VOUCHED

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-08-18
**Executed**: 2026-08-18
**expected_verdict**: PASS

---

## Objective

Fixture that PASSES C3: cites a `.log` path that is gitignored and absent, and the plan's closure manifest vouches for it. Exercises the narrowed gitignore-pass (TICKET-g78-V27).

## Steps

1. Cite a gitignored `.log` path that IS in the manifest

## Execution Summary

Cited path: out-e2e/vouched-evidence.log — this path is gitignored (matches `*.log` in root `.gitignore`) and does not exist on disk. The plan has a closure manifest that lists this path in its artifacts array, so the narrowed C3 check should PASS.

- Step 1: gitignored path cited above and vouched in manifest
- Validator expected verdict: PASS (C3 — gitignored, vouched by manifest)
- The manifest file is at plans/_closure_manifests/good-c3-gitignored-vouched.md.manifest.json
- It contains an artifacts entry for out-e2e/vouched-evidence.log
- C3 loads the manifest, finds the path, and marks it gitignored-vouched (INFO)
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 gitignored+vouched path detection
- Deviation: none from plan scope
- Audit note: intentional C3 pass fixture for gitignored vouched path
