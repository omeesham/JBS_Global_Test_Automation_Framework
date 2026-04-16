# SUBPLAN: Agent File Restructure

**Status**: PENDING
**Priority**: P1
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Absorbs**: PLAN_ACTIVITY_LOG_TIMESTAMP_GATE
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

## Goal

All agent infrastructure in `.claude/pipeline/`, not scattered across `specs_planning/_internal/`. Agent shit belongs in agent space, not test planning space.

## Problem

`specs_planning/_internal/` has 7 agent files (agent-activity-log.md 97K, agent-mistakes.md 57K, agent-queue.json 110K, agent-performance.json 14K, agent-escalations.json, agent-learnings.md, agent-metrics-report.md) that are pipeline infrastructure, NOT test planning artifacts.

Also `tests/examples/` has 3 agent learning files (basic-test-pattern.spec.ts, data-driven-pattern.spec.ts, session-reuse-pattern.spec.ts) that interfere with Playwright test discovery.

## Direction

1. Create `.claude/pipeline/`
2. Move agent files from `specs_planning/_internal/` there
3. Keep in `specs_planning/_internal/`: example-login-plan.md, example-login-test-cases.md, test-case-template.md, test-id-registry.json (actual planning artifacts)
4. Move `tests/examples/` to `.claude/examples/`
5. Update ALL references — `scripts/shared-types.ts` SHARED_PATHS is the CRITICAL nerve center
6. Update: CLAUDE.md (LR-028), copilot-instructions.md, .gitignore, AGENT_SCHOOL.md, agent files
7. Run `npm run validate:sync` after every path change

## Risk

`scripts/shared-types.ts` has ~6 paths pointing to `_internal/`. Update incrementally, verify after each.
