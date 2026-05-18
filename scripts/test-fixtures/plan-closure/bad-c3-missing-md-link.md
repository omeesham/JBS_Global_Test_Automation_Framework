# PLAN_FIXTURE_BAD_C3_MISSING_MD_LINK

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C3 due to citing a file path via markdown link syntax where the target file does not exist on disk.

## Scope

- Test C3 cited-path existence validation for markdown link references

## Steps

1. Walk shared-setup surface
2. Capture evidence and link in markdown format

## Walk Results

- Evidence screenshot: [evidence](test-results/walk/shared-setup/missing.png)
- Field B verified against baseline spec

## Execution Summary

Walked shared-setup surface and recorded evidence using markdown link syntax. The linked file does not exist on disk.

- Step 1: shared-setup surface accessed and inspected
- Step 2: evidence link created in markdown format above
- Cited path (markdown link): test-results/walk/shared-setup/missing.png (does not exist)
- The C3 validator should extract the path from `[evidence](...)` markdown link syntax
- After extraction, the existence check should fail for the referenced file
- No forbidden tokens present in body (clean C1)
- No phantom handoffs (clean C4)
- No strict-line violations (clean C5)
- Self-test: exercises C3 markdown-link path extraction and existence validation
- Validator expected verdict: FAIL (C3 — markdown-linked path missing from disk)
- Deviation: none from plan scope
- Audit note: intentional C3 failure fixture for markdown link path format

## Acceptance

- [x] Surface walked
- [ ] Evidence file exists on disk (intentionally missing)
