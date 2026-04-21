> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
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

# SUBPLAN SP-D7: Location Management HIST Per-Column Tests — Shared Setup Root-Tab

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R + SP-D0 + SP-D1 (template)
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session

---

## Cause

Per-column tests for Shared Setup Locations tab root parents (~3: Action, ID, Name). Save-level tracking bifurcation expected.

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts`
**Source**: `hist-root-map-location-management.md` filter `Tab == Shared Setup Locations`.
**TC variants based on catalog's save-level tracking finding**:
- If saves produce rows: standard per-column template.
- If saves produce ZERO rows: save-level NOT-TRACKED hard assertions + BUG candidate feeds SP-E-LM-OTHER.

## KEEP list

- Sibling specs untouched.

## Step-by-Step Execution

Check catalog first. Branch on save-level finding. Write. Run. Commit.

Commit: `feat(hist-pivot): SP-D7 — Location Mgmt HIST Shared Setup per-column tests`.

## Verification

Save-level tracking enforced per catalog. Zero soft asserts.

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts | SP-D7 — Location Mgmt HIST Shared Setup tests. Save-level tracking: <result>. |
```

## Context for Cold-Start Session

- Per SP6 / snapshot model, this tab may produce zero rows. Catalog will tell you.
- Template: SP-D1. Encoding: Unicode ✔.

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-E-LM-OTHER.
