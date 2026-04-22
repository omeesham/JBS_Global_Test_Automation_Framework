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

# SUBPLAN SP-B-LM-1: MCP Catalog — Currency Tab → 87-col Location Management History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-A1 complete
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (≤15 parents, Currency has 9 parents)

---

## Cause

Map Currency tab's 9 parent fields to the 87-col Location Management History. A prior MCP session (2026-04-17) found 6 of 9 parents are silently NOT-TRACKED (all 3 Merchant, all 3 IsDefault). This subplan formalizes that finding, plus handles col 5 "Currency" multi-checkbox state-space (7 valid combos) and col 63 "Currency" duplicate.

---

## Scope

**Target tab**: Location Management → Currency tab (office 1604).
**Parents (9 total)**: USD Selected, CAD Selected, MXN Selected, USD Is Default, CAD Is Default, MXN Is Default, USD Merchant, CAD Merchant, MXN Merchant.
**Target surface**: 87-col Location Management History.
**Known findings to verify/formalize** (from 2026-04-17 MCP):
- Col 5 "Currency" tracks Selected set as comma-separated list ("USD", "USD, CAD", "USD, CAD, MXN"). TRACKED.
- Col 63 "Currency" (duplicate header) — Pricing-owned. Stays "" for all Currency saves. Cross-contamination guard target.
- Merchant + IsDefault — NOT-TRACKED (all 6 fields). Candidate CUR-BUG-A, CUR-BUG-B.

---

## Method

1. MCP navigate to office 1604 → Location Settings → Currency tab.
2. Capture 87-col history top row baseline.
3. Record current state of all 9 Currency parents (baseline).
4. For each state in the 7-valid-combo matrix of Selected (USD only, CAD only, MXN only, USD+CAD, USD+MXN, CAD+MXN, USD+CAD+MXN):
   a. Set the combo + a valid default.
   b. Save. Wait for dirty-state cleared (LR-026).
   c. Diff 87-col top row. Confirm col 5 = expected string.
   d. Confirm col 63 unchanged (should stay "").
   e. Confirm no other col accidentally changes.
5. For each of 6 NOT-TRACKED parents (3 Merchants + 3 IsDefault):
   a. Change the parent value (e.g., USD Merchant 316370 → 316426).
   b. Save.
   c. Scan FULL 87-col row for any substring match (`316370`, `316426`, `Bahamas`, `PSAV US`, `Merchant`, `Default`). Expect ZERO matches outside Modified By column.
   d. Record as NOT-TRACKED with evidence.
6. Negative cases to record:
   - Cancel save → row count unchanged.
   - No-op save (clean form) → Save button disabled → 0 rows.
   - Validation-block (all 3 unchecked) → Save disabled → 0 rows.
7. Restore office 1604 Currency state to baseline.

---

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-currency.md` per format in SP-B-LO-1. Plus add a "State-space coverage matrix" section for col 5 with all 7 combos mapped to expected values.

---

## KEEP list

- Office 1604 final state = baseline restored.
- SP1 MCP findings artifact.
- All other root-tab catalogs — do not touch.

---

## Step-by-Step Execution

Standard catalog procedure from SP-B-LO-1 adapted for Currency. State-space matrix is REQUIRED output for col 5.

---

## Verification

1. Catalog file exists.
2. 7 state-space combos tested + captured for col 5.
3. 6 NOT-TRACKED parents confirmed with phantom-row evidence.
4. Col 63 cross-contamination proved zero across all 7 Currency saves.
5. Negative cases (cancel, no-op, validation-block) documented.
6. Office 1604 baseline restored.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity-log row:
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-currency.md | SP-B-LM-1 — MCP catalog: Currency → 87-col hist. 3 TRACKED (Selected), 6 NOT-TRACKED (Merchant+IsDefault). 7-combo state matrix complete. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Prior MCP 2026-04-17 already proved Merchant + IsDefault NOT-TRACKED. This session re-verifies + formalizes per the new catalog format.
- 87-col Location Management History uses Unicode ✔ for booleans (LR-036, encoding: `unicode`).
- LR-025 Radix retry for sort buttons if needed — helpers exist on `location-management-history.page.ts`.
- Currency tab is the PROOF-OF-PATTERN tab. SP-D1 (currency hist spec) consumes this catalog directly.

---

## Dependencies

- SP-A1 complete.
- Unblocks SP-B-LM-R + SP-D1.
