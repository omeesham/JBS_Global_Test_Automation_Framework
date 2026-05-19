> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-B-LM-6: MCP Catalog — Notes Tab → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: SUPERSEDED-2026-05-11
**Superseded-by**: PLAN_PILOT_NOTES_DISCOVERY.md
**Executed**: 2026-05-11

### Execution Summary (2026-05-11 supersession)

SUPERSEDED-2026-05-11 by `PLAN_PILOT_NOTES_DISCOVERY.md` (vertical-pilot derivative). Merges this plan's HIST catalog work with `SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md` (DQU 2-phase audit) into one Opus/max session — single nav2 baseline + single auth + single live-DOM walk emits both the HIST 87-col catalog AND the DQU field-inventory.

- **TCs implemented**: 0 (work folded into successor plan; no `/execute` invocation occurred against this plan).
- **MCP verification**: not performed (superseded before execution).
- **Documentation changes**: none — file body preserved verbatim per `feedback_dont_destroy_user_data.md` + LR-035 INDEX hygiene.
- **Test pass confirmation**: n/a.
- **Note on 2026-04-22 sibling-pair audit-rec**: the in-body recommendation to merge with `SUBPLAN_HIST_PIVOT_15_B_LM_7_SHARED_SETUP_CATALOG.md` is also superseded by this pilot — on a **different axis** (per-submodule vertical bundle, not sibling-pair catalog).

(Original plan body follows below.)
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
