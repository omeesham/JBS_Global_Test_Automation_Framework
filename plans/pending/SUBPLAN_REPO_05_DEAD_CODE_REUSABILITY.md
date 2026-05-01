# SUBPLAN: Dead Code & Reusability

**Status**: PENDING
**Priority**: P1-CYCLE-2
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Absorbs**: PLAN_CODEBASE_CLEANUP, PLAN_MAINTAINER_SWEEP (3 remaining items), PLAN_FULL_CHAIN_AUDIT (code quality findings)
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

## Goal

Delete identified dead code, extract duplicated patterns into reusable helpers, address stale audit findings.

## What the Absorbed Plans Say

- **PLAN_CODEBASE_CLEANUP** (HIGH, created 2026-03-26): 8 orphan files ~1,150 lines, 5 surgical removals in live files, 4 unnecessary `as any` casts. All triple-grep verified.
- **PLAN_MAINTAINER_SWEEP** (LOW, created 2026-03-24): 3 remaining items — waitForNetworkIdle extraction (25 occurrences, 9 files), selector naming, import consistency.
- **PLAN_FULL_CHAIN_AUDIT** (HIGH, created 2026-03-24): 14 findings across 4 categories. Code quality subset relevant here.

## CRITICAL WARNING

All 3 plans are 21-23 days stale. P0 Decontamination (commit f721e15, 2026-03-25) renamed `locations/` to `setup/locations/`. RE-VERIFY all file paths and grep evidence before touching anything. Plans are CLAIMS, not FACTS.

## Direction

1. Read all 3 absorbed plans in full
2. Re-verify every file path and grep claim against current codebase
3. Execute the verified cleanup items
4. Grep for additional duplicated patterns (dialog handling, tab navigation, save patterns) — extract if 5+ occurrences
5. Move all 3 absorbed plans to `plans/done/` with execution summary per LR-027
