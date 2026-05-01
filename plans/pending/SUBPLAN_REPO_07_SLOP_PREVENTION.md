# SUBPLAN: Slop Prevention Guardrails

**Status**: PENDING
**Priority**: P1-CYCLE-2
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

## Goal

Prevent future AI slop with structural enforcement. Fix the slop MAKERS, not just the slop.

## Root Causes to Fix

1. **No file placement rules** — agents create files wherever convenient
2. **No agent completion verification** — agents claim "done" without producing required artifacts
3. **No ephemeral cleanup** — .playwright-mcp, reports, allure accumulate forever
4. **No structural health check** — nobody checks if the repo is in a valid state

## Direction

1. **File placement**: Extend `.githooks/pre-commit` with warnings for files in wrong locations. Add canonical file location documentation to CLAUDE.md or REPO_STRUCTURE.md.
2. **Agent verification**: Create `scripts/verify-agent-completion.ts` — planner must create TCs, generator must create specs, healer must show spec status change. Integrate into post-complete hooks.
3. **Ephemeral cleanup**: Extend `npm run clean` to cover all junk locations identified by SP-04.
4. **Health check**: Create `scripts/verify-repo-health.ts` — validates file placement, SHARED_PATHS resolution, no duplicates, no oversized files in tracked dirs.

Design guardrails AFTER SP-02 through SP-06 establish canonical locations. Session has freedom to choose enforcement mechanisms (hooks, scripts, CI checks, rules).
