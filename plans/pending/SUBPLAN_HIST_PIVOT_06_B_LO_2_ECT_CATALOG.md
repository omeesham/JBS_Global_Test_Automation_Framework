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

# SUBPLAN SP-B-LO-2: MCP Catalog — Local Office ECT → 42-col History Mapping

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-A2 complete
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (≤15 parents)

---

## Cause

Map the ECT Settings tab's root fields to the 42-col Local Office Settings History. Prior MCP investigation flagged all ECT editable rows (BenefitsMultiplier, HistoricalSubrental, LaborCost) as candidate NOT-TRACKED — this session confirms per-row and per-field.

---

## Scope

**Target tab**: Local Office Settings → ECT Settings tab.
**Parent field budget**: ≤15 ECT rows / fields. ECT has editable cells per row; treat each distinct editable cell as one parent (so "BenefitsMultiplier for row A" + "BenefitsMultiplier for row B" share control type but test row A as the exemplar).
**Target surface**: 42-col Local Office Settings History.

---

## Method

1. MCP to office 1604 → Local Office → ECT Settings tab.
2. Capture 42-col history baseline.
3. For each ECT parent:
   a. Edit the cell (ECT-005, 009, 013, 014, 015, 016 etc. per test case MD).
   b. Save.
   c. Check whether a NEW row appears in the 42-col history at all (ECT may produce ZERO new rows — candidate bug LOS-ECT-BUG-A).
   d. If new row: diff vs baseline → record target column.
   e. If NO new row: record as NOT-TRACKED at save-level (not column-level). Flag for SP-E-LO batch bug filing.
4. Restore ECT values to baseline.

---

## Output Format

Same template as SP-B-LO-1 but file at:
`clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md`

Additional required section:
```
## Save-level tracking status
| Parent | Does save produce any new row? (yes/no) | If no → bug candidate |
|---|---|---|
```

Because ECT edits may not create history rows at all, this is captured at save-level, not column-level.

---

## KEEP list

- All Basic Info tab state (don't cross-contaminate).
- Office 1604 — restore to baseline.
- SUBPLAN_HISTORY_01_MCP_FINDINGS.md.

---

## Step-by-Step Execution

1. `/identity HUNTER`.
2. MCP to ECT tab.
3. Read current ECT table state.
4. For each parent: edit → save → check history for any new row. Document save-level and column-level findings.
5. Restore baseline.
6. Write catalog file.
7. Commit: `docs(hist-pivot): SP-B-LO-2 — catalog Local Office ECT → 42-col history mapping`.

---

## Verification

1. Catalog file at the specified path.
2. Each ECT parent has "save-level tracking" answered (yes/no new row) + column-level if applicable.
3. Office 1604 ECT state restored.
4. Bug candidates flagged for save-level NOT-TRACKED rows (expected: all ECT editable rows).

---

## Handoff Signals

1. Status DONE + Executed date.
2. Activity-log row:
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md | SP-B-LO-2 — MCP catalog: ECT → 42-col history. Save-level tracking verified per parent. |
   ```
3. `git mv` subplan to `plans/done/`.
4. `npm run plans:reindex`.

---

## Context for Cold-Start Session

- Master plan §3 HEALER row: LOS-ECT-BUG-A candidate is "all ECT editable rows NOT-TRACKED at save level".
- The 42-col Local Office Settings History is SHARED between Basic Info and ECT — both write (if they write) into the same table. Isolating ECT's contributions requires comparing against SP-B-LO-1's Basic Info findings.
- If ECT saves produce ZERO rows at all, this is a SAVE-LEVEL NOT-TRACKED bug, worse than column-level.

---

## Dependencies

- SP-A2.
- Unblocks SP-B-LO-R + SP-C2.
