# SUBPLAN SP-L1: TC Authoring Rules — Install & Propagate

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 0 (Prerequisite — must be in force before Group 3 starts)
**Status**: DONE
**Priority**: P0 (gates clean TC generation for every downstream TC-authoring subplan)
**Created**: 2026-04-22
**Executed**: 2026-04-22
**Depends on**: none (can run immediately; applies retroactively to any downstream TC-authoring subplan)
**Identity**: OWNER
**Skills**: `/execute` + `/identity`
**Estimated**: one session (~30 min — doc install + subplan patches + reindex)

---

## Cause

Client reviewer flagged **two classes of defects** in delivered TCs that no existing subplan prevented:

1. **Formatting leaks** (reviewer feedback, 2026-04-21) — tick / check / arrow symbols as step-result separators, markdown bold around UI labels, jargon in Expected Results (`tabpanel renders`, `spinner`, `DataTable`).
2. **Bug-descriptor leaks** (reviewer feedback, 2026-04-22) — internal bug commentary pasted into client-visible TC text. [TC-LOC-MGH-002](../../clients/encore/specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md:118) Step 4 reads `(known bug — not translated)`; [TC-LOC-MGH-038](../../clients/encore/specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md:305) is an entire TC authored to assert the buggy state (`bugBehavior=untranslated i18n key rendered`).

Both classes are "TC text a human reviewer would not have written." They are the same problem — authoring without a hygiene rule.

This subplan installs a single canonical rules doc, wires every TC-authoring subplan (C1, C2, D1–D10, J, master plan) to load and enforce it at Phase 0, and records the sweep obligation for existing leaks.

---

## Scope

**File created** (canonical rules doc — single source of truth):
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (~160 lines, 4 rules + Phase 0 grep + sweep obligation + known-leaks inventory + scope exclusions + graduation path)

**Subplans patched** (bootstrap load + Phase 0 grep + verification item):
- [SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS.md) (SP-C1)
- [SUBPLAN_HIST_PIVOT_21_C2_LO_ECT_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_21_C2_LO_ECT_TESTS.md) (SP-C2)
- [SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) (SP-D1 — includes template-extraction carry obligation)
- [SUBPLAN_HIST_PIVOT_23_D2_LM_PRICING_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_23_D2_LM_PRICING_TESTS.md) (SP-D2)
- [SUBPLAN_HIST_PIVOT_24_D3a_LM_LOCAL_INFO_PART_A_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_24_D3a_LM_LOCAL_INFO_PART_A_TESTS.md) (SP-D3a)
- [SUBPLAN_HIST_PIVOT_25_D3b_LM_LOCAL_INFO_PART_B_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_25_D3b_LM_LOCAL_INFO_PART_B_TESTS.md) (SP-D3b)
- [SUBPLAN_HIST_PIVOT_26_D4_LM_ACCOUNT_ADDRESS_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_26_D4_LM_ACCOUNT_ADDRESS_TESTS.md) (SP-D4)
- [SUBPLAN_HIST_PIVOT_27_D5_LM_LEGAL_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_27_D5_LM_LEGAL_TESTS.md) (SP-D5)
- [SUBPLAN_HIST_PIVOT_28_D6_LM_NOTES_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_28_D6_LM_NOTES_TESTS.md) (SP-D6)
- [SUBPLAN_HIST_PIVOT_29_D7_LM_SHARED_SETUP_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_29_D7_LM_SHARED_SETUP_TESTS.md) (SP-D7)
- [SUBPLAN_HIST_PIVOT_30_D8_LM_AUTO_ADDON_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_30_D8_LM_AUTO_ADDON_TESTS.md) (SP-D8)
- [SUBPLAN_HIST_PIVOT_31_D9_LM_TOP_LEVEL_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_31_D9_LM_TOP_LEVEL_TESTS.md) (SP-D9)
- [SUBPLAN_HIST_PIVOT_32_D10_LM_ORPHANS_TESTS.md](../pending/SUBPLAN_HIST_PIVOT_32_D10_LM_ORPHANS_TESTS.md) (SP-D10)

**Audit gate patched** (adds TC-authoring-rules audit item):
- [SUBPLAN_HIST_PIVOT_38_J_FINAL_AUDIT.md](../pending/SUBPLAN_HIST_PIVOT_38_J_FINAL_AUDIT.md) (SP-J) — audit checklist item #25

**Master plan patched** (execution-order row + UPDATE #4 block):
- [PLAN_HIST_COLUMN_FIRST_PIVOT.md](../pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md)

---

## KEEP list — DO NOT TOUCH

- All existing TC MDs in `clients/encore/specs_planning/test-cases/**` — LEAK-FIXING is a sweep obligation deferred to whichever D-series subplan next touches each file. This subplan does not edit existing TC text.
- All existing BUG-*.json files — no edits.
- `reports/bugs/BUG-HIS-CDWNA-001.json` (CalcDamageWaiverOnNetAmount i18n gap) — NOT yet filed; filing is owned by the next subplan to touch `locations_management_history_test_cases.md`.
- All spec code (`.ts` files) — rules explicitly scoped to client-facing MDs only.
- LR-041 in root `CLAUDE.md` — NOT authored today; graduation is deferred to SP-K1 when rules have survived 3+ executions.
- SP-D0 (shared utils) — not patched; it authors TypeScript, not TC MDs.

---

## Step-by-Step Execution (as performed in this session)

1. `/identity OWNER`.
2. Created canonical rules doc at `clients/encore/specs_planning/_internal/tc-authoring-rules.md`.
3. Patched SP-C1, SP-C2, SP-D1–D10, SP-J with a uniform block inserted between the bootstrap block and `## Cause`:
   - Bootstrap-level load directive: read `clients/encore/specs_planning/_internal/tc-authoring-rules.md` before writing any TC text.
   - Phase 0 grep obligation: run the four forbidden-pattern greps from the rules doc on every edited TC MD. HALT on hit.
   - Verification obligation: the four greps must return zero hits across all TC MDs this subplan produces.
   - Sweep obligation: if the subplan touches an existing TC MD that contains leaked language, file the missing BUG-*.json and rewrite per rules doc §Sweep obligation.
4. Patched SP-D1 additionally: template-extraction substep (Step 11) now requires the template to carry a verbatim reference to the rules doc so SP-D2..D10 inherit.
5. Patched SP-J: added audit checklist item #25 (grep across all TC MDs, zero hits required).
6. Updated master plan: added row 42 (SP-L1) to Execution Order table; added UPDATE #4 block summarizing the directive and pointing at the rules doc.
7. Ran `npm run plans:reindex` to regenerate `plans/INDEX.md`.
8. Appended activity-log row per LR-028 + LR-037.
9. Ran `npm run validate:activity-log:preflight` to confirm timestamp cleanliness.

---

## Verification (executed)

1. `ls clients/encore/specs_planning/_internal/tc-authoring-rules.md` → exists.
2. `grep -n '## Bug-Language Hygiene\|tc-authoring-rules.md' plans/pending/SUBPLAN_HIST_PIVOT_20_C1*.md plans/pending/SUBPLAN_HIST_PIVOT_21_C2*.md plans/pending/SUBPLAN_HIST_PIVOT_22_D1*.md plans/pending/SUBPLAN_HIST_PIVOT_23_D2*.md plans/pending/SUBPLAN_HIST_PIVOT_24_D3a*.md plans/pending/SUBPLAN_HIST_PIVOT_25_D3b*.md plans/pending/SUBPLAN_HIST_PIVOT_26_D4*.md plans/pending/SUBPLAN_HIST_PIVOT_27_D5*.md plans/pending/SUBPLAN_HIST_PIVOT_28_D6*.md plans/pending/SUBPLAN_HIST_PIVOT_29_D7*.md plans/pending/SUBPLAN_HIST_PIVOT_30_D8*.md plans/pending/SUBPLAN_HIST_PIVOT_31_D9*.md plans/pending/SUBPLAN_HIST_PIVOT_32_D10*.md plans/pending/SUBPLAN_HIST_PIVOT_38_J*.md` → hits in every file.
3. `grep -n 'SP-L1\|SP-42\|tc-authoring-rules' plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → ≥1 hit.
4. `plans/INDEX.md` regenerated post-reindex; this subplan appears under done/.
5. Activity-log preflight clean.

---

## Execution Summary

**Outcome**: Complete. All 14 subplan patches applied uniformly; rules doc installed; master plan updated; reindex run; activity-log row appended with preflight-clean timestamp.

**Files created**: 2
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (canonical rules)
- `plans/done/SUBPLAN_HIST_PIVOT_42_L1_TC_AUTHORING_RULES.md` (this file)

**Files edited**: 15
- 13 TC-authoring subplans (SP-C1, SP-C2, SP-D1–D10) in `plans/pending/`
- SP-J final audit subplan
- Master plan PLAN_HIST_COLUMN_FIRST_PIVOT.md (Execution Order + UPDATE #4)

**Files auto-regenerated**: 1 (`plans/INDEX.md` via `npm run plans:reindex`)

**TCs edited**: 0 (deferred per sweep obligation — the next subplan to touch each leaky TC MD owns its cleanup).

**Bugs filed**: 0 (deferred — BUG-HIS-CDWNA-001 for the CalcDamageWaiverOnNetAmount i18n gap owned by next subplan touching `locations_management_history_test_cases.md`).

**Rules honored**:
- LR-020 (verified every patched file exists before editing)
- LR-027 (this execution summary present before file moves to done/ status)
- LR-028 (activity-log row appended)
- LR-034 (referenced by Rule 4 as the bug-filing destination)
- LR-035 (`npm run plans:reindex` run after subplan creation)
- LR-037 (activity-log timestamp ≥ mtime of every touched file)
- LR-038 (no browser tool used in this session — pure doc install; LR-038 N/A)
- LR-040 (every planned scope item classified: 15 direct-executed files (a), 0 grep-verifiable-deferred (b), 0 user-flagged (c); sweep obligation for existing leaks tracked in rules-doc §Known Leaks as (b) — grep-verifiable line items in this subplan's §KEEP list + rules-doc table)

**Unblocks**: every Group-3 TC-authoring subplan (SP-C1 / SP-C2 / SP-D1–D10) can now produce client-clean TC MDs on first run; SP-J has an audit gate to detect regressions; known-leak sweep obligations are discoverable by the next subplan to touch each affected file.

---

## Context for Cold-Start Audit (future sessions)

- If you're executing SP-C1 / SP-C2 / SP-D1–D10 / SP-J and your bootstrap block references `tc-authoring-rules.md`: this is the subplan that installed it. Don't re-install. Just load the rules doc and apply.
- If you're executing a NEW subplan that edits any file under `clients/encore/specs_planning/test-cases/**`: add the same bootstrap load + Phase 0 grep + verification to your own file, cite this subplan's ID in the header, and you inherit the rule chain.
- If you discover a new leak class not covered by the 4 rules: append a 5th rule to `tc-authoring-rules.md` (do NOT create a parallel doc) and update the §Revision history block.
- Graduation to LR-041 in root `CLAUDE.md` happens via SP-K1 when the rules have survived 3+ subplan executions without new leak discoveries.

---

## Dependencies

- None upstream (installation-only subplan).
- Unblocks downstream: SP-C1, SP-C2, SP-D1..D10, SP-J.
