# SUBPLAN: Test Infrastructure Audit

**Status**: SUPERSEDED
**Superseded by**: plans/pending/PLAN_LOSSLESS_DEEP_TRIM.md (2026-06-12 deep-trim disposition; per-item table in SUBPLAN_TRIM_02 Execution Summary)
**Priority**: P1-CYCLE-2
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Excludes**: website/, node_modules/, tests/examples/ (moved to .claude/ by SP-03) — out of scope per user directive.

---

## Goal

Audit the test infrastructure — specs, setup, test-data, fixtures — for consistency, dead artifacts, and organizational issues. Test code is where AI agents pile the most slop because every session adds tests without cleaning up.

## Scope

### specs/
- `tests/locations/*.spec.ts` — location module specs
- `tests/local-office/*.spec.ts` — local office specs
- **Check**: are all spec files properly organized by module?
- **Check**: any orphaned spec files not referenced by playwright.config?
- **Check**: consistent patterns across specs (imports, fixture usage, timeout handling)

### src/infra/
- `fixtures.ts` — the main fixture file with authenticatedSession
- `global-setup.ts`, `global-teardown.ts` — lifecycle hooks
- `custom-matchers.ts` — custom Playwright matchers
- **Check**: are fixtures consistent with how specs use them?
- **Check**: dead fixtures that no spec imports?
- **Check**: global setup/teardown — is everything there still needed?

### src/data/
- Per-module `.data.ts` files with test constants
- **Check**: unused test data constants (defined but never referenced in any spec)
- **Check**: hardcoded values that should be dynamic or configurable
- **Check**: inconsistent data patterns between modules

### tests/seed.spec.ts
- Auth smoke test (17 lines)
- **Check**: still accurate? Still needed? Does it match current auth flow?

## What to Look For

1. **Fixture inconsistencies**: some specs import from `../../../setup/fixtures`, others differently. Pattern should be uniform.
2. **Unused test data**: constants defined in .data.ts files that no spec ever references. Dead weight.
3. **Spec organization**: files in wrong directories? Specs that test module X living in module Y's folder?
4. **Pattern drift**: early specs follow one pattern, later specs follow another. Should be consistent.
5. **Missing custom matchers**: if 5+ specs do the same assertion pattern manually, it should be a custom matcher.
6. **Timeout inconsistencies**: some tests set 120s, others don't. Is there a policy?
7. **Setup/teardown bloat**: global setup doing things no test needs anymore.

## Direction

Start by listing all spec files and cross-referencing their imports against fixtures and test-data. Then check for unused exports in test-data files. Session has freedom to refactor for consistency.

## Verification

- `npx playwright test --list` — same spec count (or more if dead specs were renamed/moved, not deleted)
- `npx playwright test tests/seed.spec.ts --project=chrome` — still passes
- `npm run typecheck` — no new errors in tests/
