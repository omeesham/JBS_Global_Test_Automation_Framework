# SUBPLAN 7: Validation — Full Suite Run + Cleanup

**Parent**: PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md
**Agent**: Copilot (BUILDER + HEALER if failures)
**Phase**: 3A
**Status**: TEMPLATE-DRAFT — flesh out before execution
**Depends on**: SUBPLAN_HISTORY_04 + 05 + 06 all complete

---

## Context

All integration tests are written. Now verify everything works together — individual runs, full suite, no serial contamination, all tooling updated.

---

## Session Start Protocol

```
/identity BUILDER
```

Read master plan Phase 3A for full checklist.

---

## Tasks

### 1. Type Check
```bash
npm run typecheck
```
Fix any errors before proceeding.

### 2. Individual Spec Runs (LR-018 step 3-4)

Run EACH spec with a new integration test individually:
```bash
npx playwright test local-office-settings.spec.ts
npx playwright test local-office-ect.spec.ts
npx playwright test location-local-information.spec.ts
npx playwright test location-pricing.spec.ts
npx playwright test location-currency.spec.ts
npx playwright test location-legal.spec.ts
npx playwright test location-account-address.spec.ts
npx playwright test location-shared-setup-locations.spec.ts
npx playwright test location-notes.spec.ts
npx playwright test location-auto-addon.spec.ts
```

For each failure:
- Read failure artifacts FIRST (LR-024) — `reports/allure-results/`, `failure-summary.json`
- Diagnose: wrong format? wrong column header? stale table? timing?
- Fix and re-run individually before moving on

### 3. Full Suite Run (LR-018 step 5)

Run ALL specs together:
```bash
npx playwright test --project=chrome
```

If a spec passes individually but fails in suite → RCA is serial contamination, timing, or auth.

### 4. Fix Serial Contamination

If failures in full suite only:
```
/identity HEALER
/bugfix
```

### 5. Tooling Updates
```bash
npm run planner:export-all    # Regenerate CSVs with new integration TCs
npm run selectors:catalog     # Update selector catalog
```

### 6. Activity Log

Entry in `specs_planning/_internal/agent-activity-log.md` per LR-028.

---

## Session End Protocol

**COMPLETION GATE**: Before marking DONE, pass the 5-point Sub-Plan Completion Gate in the master plan.

```
/regression-guard
/reflect
```

Report: total tests passing, any failures, any NOT-TRACKED findings, any bugs discovered.
