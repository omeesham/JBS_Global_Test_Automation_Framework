# SUBPLAN: Bug Reports — Consolidation + Client-Ready Packaging (Deliverable #4)

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-05 (LI bugs), SP-AAE-06 (9-module parallel rollout — produces all module bug artifacts; supersedes individual SP-DQU-12..20)
**Blocks**: SP-DQU-34 (handoff package)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_31_J2_BUG_REPORTS_PACKAGING.md`
**Identity**: HUNTER
**Skills auto-called**: /identity, /cleanup
**Model + thinking**: Sonnet + medium
**Dependency gate**: All Track B/F subplans that file bugs `Status: DONE`
**Context files**:
- `reports/bugs/*.json` (all filed bugs)
- LR-034 (bug filing schema)

## Purpose

Consolidate every `reports/bugs/BUG-*.json` into a single client-readable index. Sort by module + severity. Translate internal fields into client-friendly prose where needed.

## Step-by-step

1. List all `reports/bugs/*.json` files. Expect 3+ from LOS (SP-03) + LI bugs (SP-05) + any new from Track F.
2. Validate each against LR-034 schema. Missing required fields → patch.
3. Produce a bug report file (path does not resolve — file was never committed) with table: ID, title, module, severity, status, discovered-date, affected-tests, one-line summary.
4. Produce client-readable a bug report file (path does not resolve — file was never committed):
   - Group by module.
   - Per bug: plain-English problem statement, steps to reproduce (as a user would do them), expected vs actual, impact, severity.
   - Hide internal metadata (mcpEvidence URLs if client doesn't need them).
5. Activity-log row.

## Acceptance criteria

- [ ] All bug JSONs LR-034 compliant.
- [ ] INDEX.md covers every bug.
- [ ] CLIENT_PACKAGE.md ready to ship.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-34 (final handoff package includes bugs as deliverable #4).
