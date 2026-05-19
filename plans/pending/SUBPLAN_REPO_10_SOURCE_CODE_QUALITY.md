# SUBPLAN: Source Code Quality Sweep

**Status**: PENDING
**Priority**: P1-CYCLE-2
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

## Goal

Fresh sweep of all `src/` code for AI slop — duplicated patterns, dead code, verbose implementations, inconsistent approaches, broken type safety. Previous cleanup plans (SP-05) only cover findings from 3 specific absorbed plans. This is a FRESH whole-src audit.

## Scope

| Directory | What's there | Why audit |
|-----------|-------------|-----------|
| `src/pages/` | Page objects for each module (login, home, setup/locations/*, setup/local-office/*) | Duplicated dialog handling, tab navigation, save patterns across POs |
| `src/utils/` | logger, common-methods, diagnostics-collector, app-constants, agent-reporter | Utility bloat, dead functions, overlap between utils |
| `src/core/` | base-page.ts, credential-loader.ts, ui-common | Base class methods that might be dead or duplicated in child POs |
| `src/selectors/` | All selector files (static + dynamic + per-module) | Unused selectors, naming inconsistencies, stale references |
| `src/framework-contracts/` | IConfig, diagnostics types | Dead types, over-engineered interfaces |
| `src/data/` | Adapters (Excel, JSON, DB, S3) | Which adapters are actually used vs dead weight? |

**Excludes from src/**: `src/orchestrator/`, `src/worker/` — agent pipeline IP, separate concern, not client-facing code.

## What to Look For

1. **Duplicated patterns across page objects**: dialog handling (every PO reimplements Save dialog?), tab click + wait, form field read/write, reload + navigate + wait. If 5+ POs do the same thing, extract to base-page or utility.
2. **Dead exports**: functions/classes exported but never imported by any spec, PO, or utility. Use grep to verify.
3. **Inconsistent patterns**: one PO uses `expect.poll` for async assertions while another uses raw `await` + `getAttribute`. One PO has `waitForAngularStable`, another doesn't.
4. **AI slop code**: verbose implementations where 10 lines would do but AI wrote 50. Unnecessary comments explaining obvious code. Over-abstracted helpers used once.
5. **Type safety**: unnecessary `as any` casts, untyped function returns, missing generics.
6. **Reusability opportunities**: if the same 10-line block appears in 5+ files, it should be a helper.

## Direction

Session has full freedom to decide what's slop vs legitimate complexity. Walk through each src/ subdirectory systematically. Can create sub-subplans per directory if scope is too large.

**Do NOT change src/orchestrator/ or src/worker/**. Those are separate concerns.

## Verification

After cleanup:
- `npm run typecheck` — no new errors in src/ or tests/
- `npx playwright test --list` — same spec count as before
- Run at least one spec per module to verify nothing broke
