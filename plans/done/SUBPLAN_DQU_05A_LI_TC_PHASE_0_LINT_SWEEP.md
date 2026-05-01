# SUBPLAN: LI Test-Case MD — Phase 0 Lint Sweep

**Status**: SUPERSEDED
**Superseded by**: SUBPLAN_DQU_05B_STRICT_PLAN_LINE_REMEDIATION.md (folded scope; verified DONE 2026-04-28; structural field reformatted from non-standard `SUPERSEDED-BY:` glued syntax by 2026-04-28 supersession-integrity sweep)
**Executed**: never (folded scope)
**Priority**: P2-CYCLE-1
**Created**: 2026-04-27
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Spawned by**: SP-DQU-05 (Phase 2.5 Adjacent-Sweep — APPEND disposition per LR-040)
**Depends on**: SP-DQU-05 (`Status: DONE`)
**Blocks**: nothing (cleanup is non-gating; SP-DQU-08 tag rollout does not require lint-clean MD)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_DQU_05A_LI_TC_PHASE_0_LINT_SWEEP.md`
**Identity**: GIVER
**Skills auto-called**: /identity, /regression-guard (before + after)
**Model + thinking**: Sonnet + hi (mechanical text rewrites; deterministic; no live DOM needed)
**Dependency gate**: SP-DQU-05 `Status: DONE` (this subplan picks up the file in its post-DQU-05 state).
**Context files** (read before Phase 0):
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (Rules 1–5; Phase 0 greps at §124).
- `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` (the file under sweep).
- `plans/done/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md` Execution Summary (lists pre-existing leak counts).
**Phase 0 directive**: snapshot regression fingerprint; run all 4 Phase 0 greps + record baseline counts.
**HALT conditions**:
- A grep returns >1000 hits (file scale exceeds expectation; re-scope).
- A leak rewrite would change a TC's documented behavior (rewrite must preserve test contract; if rewriting a step would change what's being asserted, HALT and ask user).

---

## Purpose

Bring `locations_local_information_test_cases.md` to **zero hits** on all four Phase 0 greps, file-wide. SP-DQU-05 fixed the TCs it touched (per Sweep obligation §140) but the rest of the file carries pre-rules-installation leaks that have escaped earlier sweeps.

## Pre-existing leak baseline (measured 2026-04-27 at SP-DQU-05 close, before this subplan)

| Rule | Pattern | Hit count |
|---|---|---|
| 1 | special chars (`✓✔✅✗✘❌→⇒▶►⚠️ℹ️❗`) | **66** |
| 2 | bold UI labels (`**Pascal[…]**`) | **407** |
| 3 | jargon (`DataTable\|tabpanel\|spinner\|aria-invalid\|data-testid\|shadow DOM\|selector`) | **4** (TC-075, 076, 077 — all use word "spinner" instead of "spinbutton") |
| 4 | bug language (`known bug\|not translated\|...`) | **0** ✓ already clean |

Total pre-existing hits to resolve: **477** (Rules 1+2+3).

## Step-by-step

1. Regression fingerprint snapshot (TC MD line count, CSV line count).
2. Rule 3 sweep (4 hits): replace literal "spinner" → "spinbutton" in TC-075, TC-076, TC-077 (preserve "C&C Percentage spinbutton" / "Resort Tax Percentage spinbutton" / "ETS Percentage spinbutton" wording). Verify Rule 3 grep returns 0.
3. Rule 1 sweep (66 hits): walk every `✓` / `✔` / `→` / `⚠️` / `ℹ️` mark. Strategy:
   - Inline `✓` after a step verb ("Field accepts value ✓" / "Save completes ✓") → drop the trailing ✓ entirely.
   - `⚠️ CLAIMED VERIFIED` annotations from old audits → drop the warning marker; if the claim is still uncertain, replace with prose "verification pending".
   - `→` in the steps' arrow-style flows → replace with `;` or rewrite to two sentences.
   - `▶`, `►` (rare) → drop.
4. Rule 2 sweep (407 hits): replace `**Apply LDW**` style bold-around-UI-label with un-bolded "Apply LDW" or use surrounding quotes (`"Apply LDW"`). Bold metadata keys (`**Steps**:`, `**Expected**:`, `**Data**:`, `**Notes**:`, `**MCP_VERIFICATION_LOG**:`, `**Status**:`) are NOT Rule 2 violations because they are not UI labels — verify after sweep that grep still returns 0 against the metadata-key-aware pattern (the grep regex matches any `**[A-Z]…**` so the simplest path is to keep metadata keys un-bolded too: `Steps:`, `Expected:`, etc., file-wide). Decide on one consistent style and apply it to the whole file.
5. Re-run all 4 Phase 0 greps — must each return zero hits.
6. Re-export CSV (`npx ts-node export_test_cases/to-csv.ts ...`); verify CSV row count change is reasonable (some bold-stripping may shorten rows but should not change TC count).
7. Regression fingerprint after.
8. Activity-log row.

## Acceptance criteria

- [ ] Rule 1 grep: 0 hits.
- [ ] Rule 2 grep: 0 hits.
- [ ] Rule 3 grep: 0 hits.
- [ ] Rule 4 grep: 0 hits (already clean — assert maintained).
- [ ] Every TC's documented behavior is preserved (no test contract changed by lint sweep).
- [ ] CSV re-exported, row count delta documented.
- [ ] Activity-log row appended.

## Why this is a separate subplan, not part of SP-DQU-05

SP-DQU-05's plan body lists 9 step-by-step items focused on TC drift fixes from SP-DQU-04 findings + filing BUG-LI-002 + re-exporting CSV. Step 5 says "Run Phase 0 greps — zero hits required." Read strictly, that means cleaning all 477 pre-existing leaks, which:

1. Is ~3 hours of mechanical text rewrites (407 bold-UI-label substitutions alone).
2. Would dwarf the actual SP-DQU-05 scope (TC drift + bug filing).
3. Does not depend on SP-DQU-04 findings — it's pure mechanical compliance work.
4. Is exactly the kind of incremental sweep the tc-authoring-rules.md §140 Sweep obligation describes ("Subplans that edit or regenerate existing TC MDs own the cleanliness of what they touch").

SP-DQU-05 cleaned the leaks **it touched** (the rewritten TC-008A had 3 jargon leaks introduced by the rewrite — those are now resolved). The file-wide cleanup is a separate, mechanical task whose risk profile and scope is fundamentally different. Per LR-040 Adjacent-Sweep APPEND disposition, this subplan IS the concrete destination for the leftover leaks.

---

## Execution Summary (SUPERSEDED-BY: SP-DQU-05B)

**Status flipped to SUPERSEDED on 2026-04-28 by SP-DQU-05B Phase 5.**

This subplan was authored 2026-04-27 as the APPEND-recipient for SP-DQU-05's 470 pre-existing Phase 0 lint leaks (LR-040 (b) form). SP-DQU-05's close used this subplan's existence to satisfy the closure-gate requirement.

Subsequent RCA (2026-04-27, captured in `C:\Users\rutvi\.claude\plans\effervescent-wandering-thunder.md`) found that SP-DQU-05's strict Step 5 ("zero hits required") was a STRICT plan-line that should not have been incrementally rescoped via APPEND, regardless of whether the recipient subplan was grep-verifiable. That RCA spawned **SP-DQU-05B** (Strict-Step-5 Remediation + Anti-Phantom-Handoff Guard), whose Phase 1 (β-decision, Rutvik-locked 2026-04-28) folded SP-DQU-05A's lint-sweep scope into SP-DQU-05B Phase 2.

SP-DQU-05B Phase 2 (2026-04-28) executed THIS subplan's Step-by-step body inline:
- Rule 1 grep: 65 → 0
- Rule 2 grep: 406 → 0 (full file-wide cleanup including 9 >40-char bolds beyond strict regex)
- Rule 3 grep: 5 → 0
- Rule 4 grep: 0 → 0 (maintained)
- CSV re-exported (77 TCs preserved, 436 → 481 lines)
- Style convention paragraph added to `tc-authoring-rules.md` (Rutvik picked (ii) double-quotes for UI labels)

This file is preserved in `plans/done/` for audit-trail completeness — it documents the original APPEND disposition and the subsequent supersession. No execution actually happened against this plan body directly.

**Why preserved, not deleted**: per Rutvik's `feedback_dont_destroy_user_data.md` preference. Renaming to a SUPERSEDED-BY marker preserves the historical decision chain (SP-DQU-05 close → APPEND → SP-DQU-05B remediation → folded) for future audits.
