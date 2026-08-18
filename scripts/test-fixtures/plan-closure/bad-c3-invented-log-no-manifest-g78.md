# PLAN_FIXTURE_BAD_C3_INVENTED_LOG_NO_MANIFEST_G78

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-08-18
**Executed**: 2026-08-18
**expected_verdict**: FAIL

---

## Objective

Fixture that FAILS C3: cites the invented gitignored log path named by TICKET-g78-V29 and has no closure manifest.

## Steps

1. Cite a missing gitignored `.log` path without a closure manifest

## Execution Summary

Cited path: reports/this-never-existed-ever-g78.log — this file does not exist on disk and is ignored by the repository `reports/*` rule.

- Step 1: invented log path cited above
- The validator looks for plans/_closure_manifests/bad-c3-invented-log-no-manifest-g78.md.manifest.json
- That manifest file does not exist for this fixture
- C3 must fail because a missing ignored artifact has no tracked voucher
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises the exact no-manifest invented-log hole
- Deviation: none from plan scope
- Audit note: intentional C3 fail fixture for invented ignored log without manifest
