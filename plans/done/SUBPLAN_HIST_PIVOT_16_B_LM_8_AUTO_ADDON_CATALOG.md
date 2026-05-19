> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Auto Add-On catalog rows)

---

# SUBPLAN SP-B-LM-8: MCP Catalog — Auto Add-On Tab → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Auto Add-On catalog rows)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-A1 complete
**Model**: claude-opus-4-7
**Thinking**: max
**PermissionMode**: auto
**Justification**: MCP live-DOM catalog session per parent plan rubric
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (~5 parents — 5 Auto Add-On checkboxes)

---

## Cause

Map Auto Add-On tab's 5 checkbox fields to 87-col LM History. SP1 §8 declared all 5 NOT-TRACKED. TC-LOC-AAO-HIST bifurcated on "0 rows vs >0 rows" (now deleted by SP-A1). This session CONFIRMS save-level tracking and documents which bifurcation is correct.

## Scope

**Target tab**: Location Management → Auto Add-On.
**Parents (~5)**: 5 Auto Add-On checkbox fields (independent checkboxes).
**Target surface**: 87-col LM History.
**Critical test**: Do Auto Add-On saves produce ANY row? If yes, what's in the row? If no, save-level NOT-TRACKED bug.

## Method

1. MCP navigate to Auto Add-On tab.
2. Capture 87-col baseline.
3. Per checkbox:
   a. Toggle it.
   b. Save.
   c. Check: new row? If yes — diff. If no — save-level NOT-TRACKED.
4. Test all 5 checkboxes ON → save. All OFF → save. Mixed states → save.
5. Document: is the bifurcation "all AAO saves produce a Modified-By/On-only row" OR "AAO saves produce zero rows"?

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-auto-addon.md` with mandatory Save-level tracking table for each of 5 checkboxes.

## KEEP list

Office 1604 baseline + SP1 artifact.

## Step-by-Step

Standard catalog procedure + save-level tracking.

## Verification

Catalog file exists + save-level tracking answered per checkbox + office restored.

## Handoff Signals

Status DONE + Executed. Activity log:
```
| YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-auto-addon.md | SP-B-LM-8 — MCP catalog: Auto Add-On → 87-col hist. Bifurcation resolved: <0 rows | Modified-By-only rows>. |
```
`git mv` to done/. Reindex.

## Context for Cold-Start Session

- Candidate bulk bug: AAO-BUG-A ("all 5 AAO fields NOT-TRACKED").
- Encoding: Unicode ✔.

## Dependencies

SP-A1. Unblocks SP-B-LM-R + SP-D8.
