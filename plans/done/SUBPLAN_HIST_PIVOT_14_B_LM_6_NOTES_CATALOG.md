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

# SUBPLAN SP-B-LM-6: MCP Catalog — Notes Tab → 87-col LM History

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
**Estimated**: one session (Notes is typically 1 aggregate parent — snapshot col 69)

---

## Cause

Map Notes tab → col 69 (aggregate snapshot). Notes uses a SINGLE column that snapshots the full notes blob, not per-field.

## Scope

**Target tab**: Location Management → Notes.
**Parents**: Notes textarea (single aggregate blob). May include rich-text formatting.
**Target surface**: 87-col LM History, expected: col 69 "Notes" (or similar single snapshot column).

## Method

1. MCP navigate to Notes tab.
2. Capture baseline Notes content + history top row.
3. Test state-space:
   - Empty → "hello"
   - "hello" → "hello world"
   - Long text (equivalence class)
   - Special chars
   - Newlines, unicode
4. After each save, confirm col 69 (or equivalent) matches the saved blob.
5. Verify unchanged col behavior for other columns.

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md`.

## KEEP list

Office 1604 baseline + SP1 artifact.

## Step-by-Step

Standard catalog procedure with emphasis on text equivalence classes.

## Verification

Catalog file exists + aggregate col mapping confirmed + office restored.

## Handoff Signals

Status DONE + Executed. Activity log:
```
| YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md | SP-B-LM-6 — MCP catalog: Notes → 87-col hist (aggregate col). |
```
`git mv` to done/. Reindex.

## Context for Cold-Start Session

- Unique tab: single aggregate col, not per-field.
- Encoding for textareas: `text` (not boolean).
- Check truncation / HTML escaping behavior if applicable.

## Dependencies

SP-A1. Unblocks SP-B-LM-R + SP-D6.

---

## UPDATE (2026-04-22) — AUDIT RECOMMENDATION (append-only; original plan above is intact)

> **Execution-agent directive — read BEFORE Phase 0 runs.**
> This subplan now has TWO candidate paths:
> - **(a) Original plan** — everything above this section (standalone session).
> - **(b) Audit recommendation** — this section (optional merge with SP-B-LM-7 Shared Setup).
> Do NOT default to either. Verify the audit's claims live before choosing:
> 1. Read both paths in full.
> 2. Live-DOM check: navigate to Notes and Shared Setup tabs, count actual parent fields. If either tab has grown past ~8 parents since 2026-04-20, keep SEPARATE (path a).
> 3. If path (b) chosen: produce BOTH catalog files in one session. SP-B-LM-7 becomes a no-op (verify file exists, mark DONE).
> 4. Log disposition in activity-log row.
> Never pick newer just because newer. Evidence wins.

**Audited by**: /ultrathink + /audit + /planning (Opus, 2026-04-22)
**Audit plan**: `~/.claude/plans/3-shared-utils-temporal-kahan.md`

### Finding
B-LM-6 Notes (~1 aggregate parent) + B-LM-7 Shared Setup (~3 parents) combined ≤4 parents — well under 15-parent session cap. Per-subplan cold-start ceremony (auth, navigation, baseline capture, teardown) may exceed the parent-level work. LR-018 context-isolation argument applies weakly when work per subplan is this small.

### Proposed alternative path — optional merge with B-LM-7
Run Notes + Shared Setup in one MCP session under whichever of SP-14 / SP-15 is invoked first. Produce BOTH output files:
- `clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md`
- `clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md`

The second subplan becomes a no-op: verify catalog file exists → mark DONE → activity-log row notes `"merged into SP-B-LM-{first-invoked}"`.

### Evidence
- Original scope: Notes = "1 aggregate parent" (col 69 blob). Shared Setup = "~3 parents" (Action, ID, Name). Combined ≤4.
- MCP session cost is dominated by auth + navigation (~10 min); per-parent work is ~5 min each. Ceremony ≥ actual work when parent count is this low.

### Risk of blindly following path (a)
- 2 full cold-start sessions (~90 min total) for ≤4 parents.

### What execution agent must check before picking
- Live count on Notes tab: if >1 parent field (rich-text toolbar adds fields, etc.), reassess.
- Live count on Shared Setup: if >5 parents or save produces zero rows (SSL-SAVE-BUG-A risk from SP-B-LO-2 precedent), keep separate — that investigation deserves isolation.
- If either has a "zero rows on save" discovery moment, path (a) with dedicated session is safer.
