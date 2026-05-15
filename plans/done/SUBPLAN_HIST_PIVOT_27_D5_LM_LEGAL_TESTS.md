> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (MANDATORY — 4 authoring rules, Phase 0 grep, sweep obligation; installed by SP-L1 at `plans/done/SUBPLAN_HIST_PIVOT_42_L1_TC_AUTHORING_RULES.md`) + this subplan in full.
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
> - This subplan edits any `clients/encore/specs_planning/test-cases/**/*.md` file AND the Phase 0 grep from `tc-authoring-rules.md` returns ANY hit (symbols, markdown-bold around UI labels, jargon in Expected, bug-descriptor phrases). Rewrite to compliance before saving; file BUG-*.json per LR-034 if a real defect is discovered. See SP-L1 §Sweep obligation for known leaks.

---

# SUBPLAN SP-D5: Location Management HIST Per-Column Tests — Legal Root-Tab

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R + SP-D0 + SP-D1 (template)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session

---

## Cause

Per-column tests for Legal tab root parents (~4).

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-legal.spec.ts`
**Source**: `hist-root-map-location-management.md` filter `Tab == Legal`.

## KEEP list

- Sibling specs untouched.

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Baseline-absent feature (ECT Settings, EnableMultidayPricing, Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md`) → record `baselineScope: baseline-absent`, flag for `/encore-questions` escalation — do NOT HALT.

Mirror SP-D1. Write. Run. Commit.

Commit: `feat(hist-pivot): SP-D5 — Location Mgmt HIST Legal per-column tests`.

## Verification

All TCs pass. Zero soft asserts.

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-legal.spec.ts | SP-D5 — Location Mgmt HIST Legal tests. |
```

## Context for Cold-Start Session

Template: SP-D1. Encoding: Unicode ✔.

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-E-LM-OTHER.
