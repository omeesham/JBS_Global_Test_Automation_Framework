# PLAN_HIST_RUN_SP3_SP4_SPECS

**Status**: PENDING
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action H-2, Findings SP3-F6 + SP4-F2/F4)
**Priority**: P1 (HIGH — without this, SP3 + SP4 are claimed-done but never proven)
**Created**: 2026-04-15
**Identity**: BUILDER → HEALER (if failures)
**Estimated session**: MEDIUM-LARGE (90-180 min, depending on failures)
**Depends on**: PLAN_HIST_SP3_STATUS_RECONCILE + PLAN_HIST_SP3_MISSING_TCS (clean baseline first)

---

## Context

Both SP3 and SP4 produced specs that have **never been executed**:
- `tests/specs/setup/locations/location-management-history.spec.ts` (19 TCs per `grep -c "test(" = 19`; plan text previously said 14 — corrected 2026-04-15 post-audit) — net new, never run
- `tests/specs/setup/local-office/local-office-settings.spec.ts` — TC-LOS-BAS-HIST appended, never run
- `tests/specs/setup/local-office/local-office-ect.spec.ts` — TC-LOS-ECT-HIST appended, never run

Activity log claims "typecheck clean" only. No spec execution evidence.

LR-018 (spec-fixing workflow) requires individual + full-suite runs. LR-024 requires clean artifacts before RCA.

---

## Goal

All HIST-related specs run successfully against live Office 1604 in BOTH (a) individual mode and (b) full-suite mode. Failures are diagnosed via artifact-first RCA (LR-033) and either fixed or filed as APP_BUG (LR-034).

---

## Tasks

### Phase 0: Clean baseline (LR-024)
1. `npm run clean` (or rm -rf reports/, .auth/ if needed) — clear stale diagnostics
2. `npm run typecheck` — confirm clean baseline
3. Verify Office 1604 is reachable: `npx playwright test tests/seed.spec.ts --project=chrome`

### Phase 1: Individual spec runs (LR-018 step 2)
4. `npx playwright test tests/specs/setup/locations/location-management-history.spec.ts --project=chrome`
   - Record pass/fail count, note any TCs that consistently fail
5. `npx playwright test tests/specs/setup/local-office/local-office-settings.spec.ts --project=chrome`
   - **DO NOT use `--grep "HIST"`** — TC-LOS-BAS-HIST asserts ≥24 rows saved today; isolating it skips the prior TC-LOS-BAS-001..067 saves and fails with false "APP_BUG" signature. Run the whole spec.
   - Note: HIST test has `test.setTimeout(120_000)`.
6. `npx playwright test tests/specs/setup/local-office/local-office-ect.spec.ts --project=chrome`
   - Same rule as step 5 — must run full spec so ECT-001..013 saves fire before TC-LOS-ECT-HIST.

**LR-024 corollary**: if a spec fails on first run, rerun it ONCE before opening RCA. Distinguishes deterministic (same failure twice) from intermittent (different failure or pass).

### Phase 2: RCA per failure (LR-018 step 3 + LR-033)
7. For each failure:
   - Read `reports/failure-summary.json` networkFailures[] FIRST (LR-033)
   - 5xx → file APP_BUG via LR-034 protocol
   - 4xx on auth → escalate, not test fix
   - Selector miss → DOM check, may be test fix
   - Timing → review timeouts
8. Apply fixes only after RCA evidence (no guess-patch-rerun, ALL-046)

### Phase 3: Re-run individually after fix (LR-018 step 4)
9. Re-run each fixed spec individually until pass

### Phase 4: Scoped suite run (LR-018 step 5 — scoped)
10. `npx playwright test tests/specs/setup/locations/ tests/specs/setup/local-office/ --project=chrome`
    - Scoped to locations + local-office (the two modules that contain HIST-relevant specs and share Office 1604 state). Running the full repo would take 1-3h with noise from unrelated modules (Pricing, SSL, Currency, etc).
11. Note any failures that pass individually but fail in scoped suite → LR-018 step 7 (serial contamination).

### Phase 5: Report
12. Append to activity log:
    - Total tests run, total pass, total fail
    - List of NOT-TRACKED findings (per SP1 conditional logic, e.g., ECT in Local Office History)
    - Any APP_BUGS filed (BUG IDs)
13. Update SP3 + SP4 with `## Verification Run` sections including pass/fail counts and date

---

## Verification

- All HIST specs have at least one passing run logged
- Any failures have RCA evidence + classification (TEST-DEFECT / APP-BUG / FLAKY)
- agent-activity-log.md has new `verification` row for both SP3 and SP4
- Any new bugs filed exist in `reports/bugs/BUG-*.json`

---

## Acceptance Criteria

- [ ] Phase 0 clean baseline confirmed
- [ ] All 3 specs run individually
- [ ] Failures diagnosed via artifacts (not theory)
- [ ] Full suite runs without serial contamination
- [ ] Activity log updated
- [ ] SP3 + SP4 verification sections added
- [ ] Any NOT-TRACKED findings documented (don't just skip)
