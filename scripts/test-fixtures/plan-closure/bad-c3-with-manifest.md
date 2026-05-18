# PLAN_FIXTURE_BAD_C3_WITH_MANIFEST

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C3 — cites a file path that does not exist on disk. A hypothetical manifest SHA entry could authorize it, but for self-test purposes no real manifest is loaded, so the check fails.

## Scope

- Test C3 manifest fallback path (no manifest available scenario)

## Steps

1. Walk shared-setup surface
2. Record evidence with path that has a hypothetical manifest entry

## Walk Results

- Evidence screenshot: test-results/walk/shared-setup/manifest-evidence.png
- SHA256: a1b2c3d4e5f6 (hypothetical manifest entry)

## Execution Summary

Walked the shared-setup surface and recorded evidence citing a path that does not exist on disk. A hypothetical manifest SHA is noted but no real manifest file is available for the self-test environment.

- Step 1: shared-setup surface accessed and inspected
- Step 2: evidence path and hypothetical SHA recorded in walk results above
- Cited path: test-results/walk/shared-setup/manifest-evidence.png (does not exist on disk)
- Hypothetical manifest SHA: a1b2c3d4e5f6 (no real manifest loaded in self-test)
- Without a manifest file, the C3 validator cannot resolve the SHA fallback
- Disk existence check fails (file not present)
- Manifest fallback check fails (no manifest loaded)
- Result: C3 FAIL even though a SHA is documented
- No forbidden tokens in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 manifest fallback path in no-manifest scenario
- Validator expected verdict: FAIL (C3 — no disk file, no manifest resolution)

## Acceptance

- [x] Surface walked
- [ ] Evidence resolvable via disk or manifest (neither available)
