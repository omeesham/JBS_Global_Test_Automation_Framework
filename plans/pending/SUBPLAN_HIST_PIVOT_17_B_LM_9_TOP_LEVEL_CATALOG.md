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

# SUBPLAN SP-B-LM-9: MCP Catalog — Top-level Basic Info Fields → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-A1 complete
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
