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

# SUBPLAN SP-B-LM-2: MCP Catalog — Pricing Tab → 87-col Location Management History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-A1 complete
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (~2 hours, Pricing has ~2-5 parents)

---

## Cause

Map Pricing tab's parents to 87-col Location Management History. Col 63 "Currency" is the suspected Pricing-owned duplicate of col 5. Also investigate: EnableMultidayPricing was flagged NOT-TRACKED earlier (BUG-HIS-001).

---

## Scope

**Target tab**: Location Management → Pricing.
**Parents (~2-5)**: Identify via MCP walkthrough of tab — typically includes pricing toggles (EnableMultidayPricing suspected), multi-day pricing options, any Pricing-specific fields.
**Target surface**: 87-col Location Management History, specifically col 63 "Currency" (Pricing duplicate).
**Known pre-finding**: BUG-HIS-001 declares EnableMultidayPricing NOT-TRACKED. Confirm.

---

## Method

Standard SP-B-LO-1 procedure scoped to Pricing tab. Plus:
1. Confirm col 63 is Pricing-owned (mutate a Pricing field that should map to it → verify col 63 changes, col 5 does not).
2. Verify EnableMultidayPricing NOT-TRACKED (re-confirms BUG-HIS-001 evidence).
3. Document any other Pricing parents + their mapping.

---

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-pricing.md`.

Add "Duplicate-header contribution" section documenting Pricing's ownership of col 63.

---

## KEEP list

- Office 1604 baseline restored.
- BUG-HIS-001 file — kept.
- SP1 findings artifact.

---

## Step-by-Step Execution

Standard catalog procedure. ~2-5 parents.

---

## Verification

1. Catalog file exists.
2. Col 63 ownership explicitly tested + documented.
3. EnableMultidayPricing NOT-TRACKED evidence recorded.
4. Office 1604 restored.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity-log row:
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-pricing.md | SP-B-LM-2 — MCP catalog: Pricing → 87-col hist. Col 63 Pricing-owned confirmed. N NOT-TRACKED. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Master plan §3 for context on col 5 vs col 63 duplicate-header handling.
- BUG-HIS-001 is pre-existing — this session confirms the finding.
- Encoding: Unicode ✔ (Location Mgmt hist).

---

## Dependencies

- SP-A1.
- Unblocks SP-B-LM-R + SP-D2.
