# PLAN_FIXTURE_BAD_C3_GITIGNORED_NO_MANIFEST

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-08-18
**Executed**: 2026-08-18
**expected_verdict**: FAIL

---

## Objective

Fixture that FAILS C3: cites a `.log` path that is gitignored and absent, and the plan has no closure manifest.

## Steps

1. Cite a gitignored `.log` path with no manifest existing for this plan

## Execution Summary

Cited path: out-e2e/legacy-no-manifest.log — this path is gitignored (matches `*.log` in root `.gitignore`) and does not exist on disk. This plan has no closure manifest, so C3 must fail because no tracked voucher can prove the artifact existed on the closing machine.

- Step 1: gitignored path cited above, no manifest for this plan
- The validator looks for plans/_closure_manifests/good-c3-gitignored-no-manifest.md.manifest.json
- That manifest file does not exist, so manifest is null
- C3 sees gitignored + no manifest → unvouched failure
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 universal vouching for plans without manifests
- Deviation: none from plan scope
- Audit note: intentional C3 fail fixture for gitignored path without manifest
