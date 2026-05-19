> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-B-LM-7: MCP Catalog — Shared Setup Locations Tab → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: SUPERSEDED-2026-05-11
**Superseded-by**: PLAN_PILOT_SHARED_DISCOVERY.md
**Executed**: 2026-05-11

### Execution Summary (2026-05-11 supersession)

SUPERSEDED-2026-05-11 by `PLAN_PILOT_SHARED_DISCOVERY.md` (vertical-pilot derivative). Merges this plan's HIST catalog work (with save-level NOT-TRACKED probe / SSL-SAVE-BUG-A risk) with `SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md` (DQU 2-phase audit) into one Opus/max session. The save-level probe is preserved verbatim in the successor's Phase 1a as a critical gate that branches Plan 4 (TESTS).

- **TCs implemented**: 0 (no `/execute` invocation).
- **MCP verification**: not performed.
- **Documentation changes**: none — file body preserved per `feedback_dont_destroy_user_data.md`.
- **Test pass confirmation**: n/a.
- **Note on 2026-04-22 sibling-pair audit-rec**: the in-body recommendation to merge with `SUBPLAN_HIST_PIVOT_14_B_LM_6_NOTES_CATALOG.md` is also superseded — on a **different axis** (per-submodule vertical, not sibling-pair catalog).

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

---

## UPDATE (2026-04-22) — AUDIT RECOMMENDATION (append-only; original plan above is intact)

> **Execution-agent directive — read BEFORE Phase 0 runs.**
> This subplan now has TWO candidate paths:
> - **(a) Original plan** — everything above this section (standalone session).
> - **(b) Audit recommendation** — this section (optional merge with SP-B-LM-6 Notes).
> Do NOT default to either. Verify live before choosing:
> 1. Read both paths in full.
> 2. Live-DOM check: count actual parent fields on Notes and Shared Setup tabs. If either tab grew past ~8 parents since 2026-04-20, keep SEPARATE (path a).
> 3. **Critical check for this tab**: does a save on Shared Setup produce ANY history row? If zero rows (SSL-SAVE-BUG-A pattern) → keep SEPARATE so the bug investigation gets a dedicated session.
> 4. If path (b) and bug risk is low: produce BOTH catalog files in one session. Whichever of SP-B-LM-6/7 runs second becomes a no-op.
> 5. Log disposition in activity-log row.
> Never pick newer just because newer. Evidence wins.

**Audited by**: /ultrathink + /audit + /planning (Opus, 2026-04-22)
**Audit plan**: `~/.claude/plans/3-shared-utils-temporal-kahan.md`

### Finding
B-LM-7 Shared Setup (~3 parents) + B-LM-6 Notes (~1 aggregate parent) combined ≤4 parents — well under 15-parent session cap. Per-subplan cold-start ceremony may exceed the parent-level work.

**But with a caveat specific to this tab**: SP-B-LM-7's original §Method says "Critical test: does a save on this tab produce ANY new row?" — this is a bug-hunting session, not just a catalog. If save produces zero rows (SSL-SAVE-BUG-A), that discovery deserves isolated attention, which favors path (a).

### Proposed alternative path — optional merge with B-LM-6
Run Notes + Shared Setup in one MCP session. Produce BOTH catalog files:
- `clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md`
- `clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md`

Whichever of SP-14/SP-15 runs second becomes a no-op: verify catalog file exists → mark DONE.

### Evidence
- Original scope: Shared Setup = "~3 parents" (Action, ID, Name). Notes = "1 aggregate parent." Combined ≤4.
- But: SSL-SAVE-BUG-A risk makes this tab's session potentially a bug-investigation rather than routine catalog.

### Risk of blindly following path (a)
- ~45 min session for ~3 parents if no bug is found.

### Risk of blindly following path (b)
- If SSL save produces zero rows, merged session may mix bug investigation with Notes catalog; Notes work may be cut short or diluted.

### What execution agent must check before picking
- Live count on both tabs.
- **SSL save probe FIRST**: before committing to merged session, do ONE save on Shared Setup. If zero rows appear in history → path (a), isolate the bug investigation.
- If SSL produces rows normally + parent count low → path (b) is safe.
