# SUBPLAN: Rename jbs_framework

**Status**: PENDING
**Priority**: P2-CYCLE-3
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

> **Parked: out of deep-trim scope per user decision 2026-06-12 (see PLAN_LOSSLESS_DEEP_TRIM).** Status stays PENDING — this subplan is intentionally NOT superseded by the deep-trim disposition (SUBPLAN_TRIM_02); the framework/folder rename is a separate, user-coordinated decision (breaks absolute paths in settings + memory), not stale slop.

## Goal

Rename framework from `encore_framework` to `jbs_framework` across all references.

## Problem

Three different names exist: folder `encore_framework`, GitHub remote `qa_agentic_framework_global`, package.json `playwright-typescript-framework`. Confusing.

## Direction

1. Update `package.json` name field
2. Grep for "encore_framework" (case-insensitive, ~79 occurrences across ~20 files) and replace
3. DO NOT rename: client-supplied `.docx` files, `encore_delivery/` folder
4. GitHub remote rename is a separate decision — coordinate with Rutvik
5. Local folder rename (`mv encore_framework jbs_framework`) affects absolute paths in `.claude/settings.local.json` and memory files — coordinate timing with Rutvik

## Risk

The local folder rename breaks every absolute path in Claude memory, settings, and plan files. Must be done carefully with user coordination.
