> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Account & Address catalog rows)

---

# SUBPLAN SP-B-LM-4: MCP Catalog — Account & Address Tab → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Account & Address catalog rows)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-A1 complete
**Model**: claude-opus-4-7
**Thinking**: max
**PermissionMode**: auto
**Justification**: MCP live-DOM catalog session per parent plan rubric
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (~6 parents, under 2 hours)

---

## Cause

Map Account & Address tab parents (~6 fields) to 87-col Location Management History.

## Scope

**Target tab**: Location Management → Account and Address.
**Parents (~6)**: Account Number, Address lines, City, State, Zip, Phone 1/2 (exact set per tab walkthrough).
**Target surface**: 87-col LM History.

## Method

Standard SP-B-LO-1 procedure. Text fields get equivalence-class coverage ({empty, valid, at-max, special chars, over-max}).

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-account-address.md`.

## KEEP list

Office 1604 baseline + SP1 artifact + existing bug files.

## Step-by-Step

Standard catalog procedure.

## Verification

Catalog file exists + all ACC parents mapped + office restored.

## Handoff Signals

Status DONE + Executed. Activity log:
```
| YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-account-address.md | SP-B-LM-4 — MCP catalog: Account & Address → 87-col hist. N parents mapped. |
```
`git mv` to done/. Reindex.

## Context for Cold-Start Session

Encoding: Unicode ✔ (LM history).

## Dependencies

SP-A1. Unblocks SP-B-LM-R + SP-D4.
