> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 5.5. **Browser tool selection**: this subplan interacts with the live app. Select Playwright CLI vs Claude in Chrome per **LR-038 v2** task-class matrix (root CLAUDE.md). For deep catalog walkthroughs (>10 fields, repeated snapshots) the default is **Playwright CLI** (YAML-on-disk, ~4× token savings); for auth-heavy / live-RCA / visual assertions the default is **Claude in Chrome**. Announce choice + reason in your first output and activity-log row.
> 6. **Phase 0 FIRST (if present in Step-by-Step)**: execute the "Phase 0 — Date-Forensic Self-Discovery" step before any code or doc edits. Document findings (with dispositions) in your activity-log row.
> 7. **Execute Phases 1+** per Step-by-Step in order.
> 8. **Handoff**: on success, apply the Handoff Signals block — set the file's Status field to DONE + Executed date in this file, append activity-log row (LR-028 + LR-037 wall-clock time ≥ mtime of every touched file), `git mv` this file to `plans/done/`, run `npm run plans:reindex`, commit (one commit per LR-027 boundary).
>
> **HALT + ASK USER** (do NOT silently proceed) if:
> - Any `**Depends on**` item is not DONE.
> - Phase 0 uncovers scope extension >30% beyond the listed starting point (user confirms before acting on unscoped items).
> - Genuine ambiguity in scope beyond the master plan §3 KEEP list.
> - `/regression-guard` diff shows changes unrelated to this subplan's stated scope.
> - Activity-log preflight (`npm run validate:activity-log:preflight`) would fail for your row.

---

# SUBPLAN SP-B-LM-8: MCP Catalog — Auto Add-On Tab → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: Pending
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
