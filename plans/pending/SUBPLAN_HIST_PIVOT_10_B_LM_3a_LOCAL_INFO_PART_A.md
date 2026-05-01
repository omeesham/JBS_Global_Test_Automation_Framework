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

# SUBPLAN SP-B-LM-3a: MCP Catalog — Local Information Tab (Part A, ~20 parents) → 87-col LM History

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
