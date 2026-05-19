> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Local Info Part B catalog rows)

---

# SUBPLAN SP-B-LM-3b: MCP Catalog — Local Information Tab (Part B, remaining parents) → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Local Info Part B catalog rows)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LM-3a complete (consumes its "Deferred to Part B" list)
**Model**: claude-opus-4-7
**Thinking**: max
**PermissionMode**: auto
**Justification**: MCP live-DOM catalog session per parent plan rubric
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session, HARD CAP at 15 parents

---

## Cause

Continue cataloging Local Information parents deferred by SP-B-LM-3a.

---

## Scope

**Input**: "Deferred to Part B" list in SP-B-LM-3a's catalog file.
**Parent budget**: up to 15 parents this session. If still more remain, spawn SP-B-LM-3c.
**Target surface**: 87-col Location Management History.

---

## Method

Read SP-B-LM-3a's output file. Pick next 15 parents from deferred list. Catalog per standard procedure.

---

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-local-info-b.md`. Same format. If further deferral needed, list it.

---

## KEEP list

- Office 1604 baseline.
- SP-B-LM-3a's file — do not modify.

---

## Step-by-Step

Read 3a file. Select next batch. Run catalog procedure. Stop at 15 or 2.5h.

---

## Verification

1. Catalog file exists.
2. Deferred list from 3a fully consumed OR explicitly deferred to 3c.
3. Office 1604 restored.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity-log row:
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-local-info-b.md | SP-B-LM-3b — MCP catalog: Local Info Part B (N parents). |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Part A file is the ONLY input for scope selection. Read it first.
- Don't re-catalog parents already mapped in 3a — check carefully.

---

## Dependencies

- Requires SP-B-LM-3a.
- Unblocks SP-B-LM-R + SP-D3a/D3b.
