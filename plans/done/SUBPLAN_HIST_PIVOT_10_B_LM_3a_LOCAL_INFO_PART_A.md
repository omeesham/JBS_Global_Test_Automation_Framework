> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Local Info Part A catalog rows)

---

# SUBPLAN SP-B-LM-3a: MCP Catalog — Local Information Tab (Part A, ~20 parents) → 87-col LM History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Local Info Part A catalog rows)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-A1 complete
**Model**: claude-opus-4-7
**Thinking**: max
**PermissionMode**: auto
**Justification**: MCP live-DOM catalog session per parent plan rubric
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session, HARD CAP at 15 parents (if Local Info has 40+, Part B handles the rest)

---

## Cause

Local Information tab has ~40 parent fields — the largest root-tab on Location Management. Catalog-ing in one session would certainly hallucinate. Split into 3a (first ~15–20 parents) and 3b (remaining ~15–20).

---

## Scope

**Target tab**: Location Management → Local Information.
**Parent budget (this session)**: up to 15 parents. Prioritize:
- Billing Type (radio Master/Direct — col 12)
- Billing Cycle, Billing Way, Billing Way Active
- Labor/Equip Pricing fields
- Allow DPCD, Exclude Implied Discount, Prompt For Approval, Threshold
- Enable LDW, LDW Percentage, Calculate LDW on Net Amount, Apply LDW (→ col 25)
- Corporate Pricing
- Any other top-priority fields per walkthrough

**Target surface**: 87-col Location Management History.

---

## Method

Standard SP-B-LO-1 procedure scoped to Local Information first-half parents. Walk the tab, pick ≤15 parents, map each. If fewer than 15 cataloged, document which are deferred to 3b.

---

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-local-info-a.md`

At end of file, add "Deferred to Part B" section listing parents NOT covered in this session.

---

## KEEP list

- Office 1604 baseline.
- SP1 artifact.
- Any parents not in scope this session → note for 3b.

---

## Step-by-Step

Standard catalog procedure. Hard stop at 15 parents or 2.5 hours, whichever first.

---

## Verification

1. Catalog file exists.
2. ≤15 parents mapped with evidence.
3. "Deferred to Part B" section lists remaining parents.
4. Office 1604 restored.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity-log row:
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-local-info-a.md | SP-B-LM-3a — MCP catalog: Local Info Part A (N parents). Deferred list passed to SP-B-LM-3b. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Local Info has ~40 parents. Do NOT try to do them all. Stop at 15.
- The "Deferred to Part B" section is mandatory — SP-B-LM-3b uses it as its input scope.

---

## Dependencies

- SP-A1.
- Unblocks SP-B-LM-3b + SP-B-LM-R (partially; reconciliation waits for 3b too).
