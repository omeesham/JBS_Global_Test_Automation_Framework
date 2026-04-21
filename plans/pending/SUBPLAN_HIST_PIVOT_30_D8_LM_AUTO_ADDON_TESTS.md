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

# SUBPLAN SP-D8: Location Management HIST Per-Column Tests — Auto Add-On Root-Tab

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

Per-column tests for Auto Add-On tab (5 checkbox parents). SP-B-LM-8 bifurcation determines whether saves produce rows at all. Spec encodes the confirmed behavior as hard assertions.

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-auto-addon.spec.ts`
**Source**: `hist-root-map-location-management.md` filter `Tab == Auto Add-On`.
**Branch on catalog finding**:
- If AAO saves produce Modified-By-only rows: write TCs asserting that specific behavior.
- If AAO saves produce ZERO rows: write TCs asserting row count unchanged post-save. All 5 parents get a SAVE-NOROW hard assertion.

## KEEP list

- Sibling specs untouched.

## Step-by-Step Execution

Check catalog. Branch. Write. Run. Commit.

Commit: `feat(hist-pivot): SP-D8 — Location Mgmt HIST Auto Add-On per-column tests`.

## Verification

All TCs pass. Zero soft asserts. Save-level tracking per catalog enforced.

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-auto-addon.spec.ts | SP-D8 — Location Mgmt HIST Auto Add-On tests. Save-level tracking: <confirmed bifurcation>. |
```

## Context for Cold-Start Session

- Candidate AAO-BUG-A: 5 checkbox fields NOT-TRACKED. Spec hard-asserts the confirmed bifurcation.
- Encoding: Unicode ✔ (LM history).
- Template: SP-D1.

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-E-LM-OTHER.
