> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 5.5. **Browser tool selection**: this subplan interacts with the live app. Select Claude in Chrome vs Playwright MCP per **LR-038** (root CLAUDE.md). Default for Claude Code: **Claude in Chrome** (auth-heavy, catalog work, token-efficient). Announce choice + reason in your first output and activity-log row.
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

# SUBPLAN SP-B-LM-7: MCP Catalog — Shared Setup Locations Tab → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-A1 complete
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (~3 parents — Action, ID, Name)

---

## Cause

Map Shared Setup Locations tab → 87-col LM History. Prior investigation flagged that snapshot-model "doesn't populate these" (per SP6 findings) — this session confirms whether SSL saves produce rows AT ALL.

## Scope

**Target tab**: Location Management → Shared Setup Locations.
**Parents (~3)**: Action, ID, Name (or whichever are the edit-affecting parents).
**Target surface**: 87-col LM History.
**Critical test**: does a save on this tab produce ANY new row?

## Method

1. MCP navigate to Shared Setup Locations.
2. Capture 87-col baseline.
3. For each parent:
   a. Edit value.
   b. Save.
   c. Check FIRST: did a new history row appear? If no → bug candidate SSL-SAVE-BUG-A.
   d. If yes: diff → find target column(s).
4. Document findings — expect: no rows, or rows with only Modified By/On.

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md` with mandatory "Save-level tracking" section.

## KEEP list

Office 1604 baseline + SP1 artifact.

## Step-by-Step

Standard catalog procedure, plus save-level tracking check (like SP-B-LO-2 for ECT).

## Verification

Catalog file exists + save-level tracking answered per parent + office restored.

## Handoff Signals

Status DONE + Executed. Activity log:
```
| YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md | SP-B-LM-7 — MCP catalog: Shared Setup → 87-col hist. Save-level tracking verified. |
```
`git mv` to done/. Reindex.

## Context for Cold-Start Session

- This tab may produce ZERO rows under snapshot-model. Test save-level tracking first.
- Encoding: Unicode ✔.

## Dependencies

SP-A1. Unblocks SP-B-LM-R + SP-D7.
