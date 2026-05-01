# SUBPLAN: /cleanup Sweep — Dead Code, Duplicates, Orphaned Files

**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-27
**Blocks**: none (terminal in Track H)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_28_H3_CLEANUP_SWEEP.md`
**Identity**: GARDENER
**Skills auto-called**: /identity, /cleanup, /regression-guard (before + after)
**Model + thinking**: Sonnet + medium
**Dependency gate**: SP-DQU-27 `Status: DONE`
**Context files**:
- Scope file
- `.claude/skills/cleanup/SKILL.md`

## Purpose

Hygiene: dead code, unused imports, orphaned files, duplicate helpers, stale references. Whitelist only.

## Step-by-step

1. Regression fingerprint.
2. Run `/cleanup` skill logic on whitelist:
   - Find unused exports.
   - Find unused imports.
   - Find orphaned files (no importers).
   - Find duplicate helpers (DRY candidates — but don't over-consolidate; if only 2 callers, keep inline).
   - Find stale references (comments referencing files that no longer exist).
3. Apply deletions in small commits (1-5 files per commit) so regression attribution is easy.
4. Full test run after each batch.
5. Regression fingerprint after. Only whitelist files changed.
6. Activity-log row.

## Acceptance criteria

- [ ] Dead code + unused imports + orphaned files removed from whitelist.
- [ ] Zero test regressions.
- [ ] Regression fingerprint matches.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-29 (identity ripple sync — verify each agent's owned artifacts still describe reality).
