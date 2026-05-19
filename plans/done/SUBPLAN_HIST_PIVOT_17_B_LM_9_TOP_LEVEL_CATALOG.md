> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Top-Level catalog rows)

---

# SUBPLAN SP-B-LM-9: MCP Catalog — Top-level Basic Info Fields → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Top-Level catalog rows)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-A1 complete
**Model**: claude-opus-4-7
**Thinking**: max
**PermissionMode**: auto
**Justification**: MCP live-DOM catalog session per parent plan rubric
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (~12 top-level parents)

---

## Cause

Top-level Basic Info fields on Location Settings page (NOT inside any sub-tab) share the Save button with every sub-tab. No dedicated spec isolates their saves. Under the new pivot, per-column tests need the same parent→column map for these fields.

## Scope

**Target area**: Location Settings top-level fields (above the sub-tabs). ~12 fields:
Local Office Name, Active, Live Date, Tax Mode, Country, Region, Servicing Branch Office, Line Of Business, Pay To Address, Union, eCommerce Active, Enable Productions Orders.

**Target surface**: 87-col LM History.

## Method

1. MCP navigate to Location Settings (office 1604 parent page).
2. Capture baseline (87-col top row + current values of 12 fields).
3. For each field:
   a. Change value.
   b. Save (use whichever sub-tab's Save is active — typically Basic Info/Local Information).
   c. Diff 87-col top row → record target column.
4. For boolean fields (Active, eCommerce Active, etc.): record Unicode ✔ encoding.
5. For comboboxes (Country, Region, Tax Mode, etc.): record equivalence classes + each selected value.

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-top-level.md`.

## KEEP list

Office 1604 baseline + SP1 artifact.

## Step-by-Step

Standard catalog procedure.

## Verification

Catalog file exists + all 12 parents mapped + office restored.

## Handoff Signals

Status DONE + Executed. Activity log:
```
| YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-top-level.md | SP-B-LM-9 — MCP catalog: Top-level Basic Info → 87-col hist. 12 parents mapped. |
```
`git mv` to done/. Reindex.

## Context for Cold-Start Session

- These fields share Save with every sub-tab. Be careful about which sub-tab you're on when saving.
- Encoding: Unicode ✔.
- Per master plan risk note, dedicated isolated-save coverage for these fields is unique to this subplan.

## Dependencies

SP-A1. Unblocks SP-B-LM-R + SP-D9.
