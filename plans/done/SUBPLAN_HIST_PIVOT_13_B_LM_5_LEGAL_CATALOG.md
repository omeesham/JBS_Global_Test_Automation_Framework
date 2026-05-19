> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Legal catalog rows)

---

# SUBPLAN SP-B-LM-5: MCP Catalog — Legal Tab → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Legal catalog rows)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-A1 complete
**Model**: claude-opus-4-7
**Thinking**: max
**PermissionMode**: auto
**Justification**: MCP live-DOM catalog session per parent plan rubric
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (~4 parents)

---

## Cause

Map Legal tab parents to 87-col LM History.

## Scope

**Target tab**: Location Management → Legal.
**Parents (~4)**: Legal entity name, status corp format, any other Legal fields per walkthrough.
**Target surface**: 87-col LM History.

## Method

Standard SP-B-LO-1 procedure.

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-legal.md`.

## KEEP list

Office 1604 baseline + SP1 artifact.

## Step-by-Step

Standard catalog procedure.

## Verification

Catalog file exists + all LGL parents mapped + office restored.

## Handoff Signals

Status DONE + Executed. Activity log:
```
| YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-legal.md | SP-B-LM-5 — MCP catalog: Legal → 87-col hist. N parents mapped. |
```
`git mv` to done/. Reindex.

## Context for Cold-Start Session

Encoding: Unicode ✔.

## Dependencies

SP-A1. Unblocks SP-B-LM-R + SP-D5.
