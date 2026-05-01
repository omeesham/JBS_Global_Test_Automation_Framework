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

# SUBPLAN SP-B-LM-7: MCP Catalog — Shared Setup Locations Tab → 87-col LM History

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
