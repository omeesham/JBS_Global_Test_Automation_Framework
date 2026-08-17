---
**Status**: DONE
**Executed**: 2026-08-17
---
# FIXTURE: Cx scoping matrix owner plan

This fixture uses the Per-Identity Satisfaction matrix to declare ownership of `scripts/test-fixtures/cx-scoping/old-site-baseline/citer-only-incomplete.md`.

## Execution Summary

This fixture plan declares matrix ownership of scripts/test-fixtures/cx-scoping/old-site-baseline/citer-only-incomplete.md.
The artifact is intentionally incomplete, so Cx must fail when coverage deny mode is active.
The matrix row is a concrete deliverable, not a background citation.
The fixture proves matrix-owned walk artifacts remain under Cx completeness enforcement.
The old-site baseline has one undispositioned manifest row.
The expected failing check is Cx.
C1 through C6 should remain clean for this fixture.
The second matrix row exists because the C6 parser requires at least two data rows.
If this fixture passes, the ownership filter skipped a true owner.
The path is repeated here so C2 sees a cited file path in the summary.

## Per-Identity Satisfaction

| Identity | Concrete deliverable |
|---|---|
| OWNER | scripts/test-fixtures/cx-scoping/old-site-baseline/citer-only-incomplete.md |
| WATCHDOG | (none) |

