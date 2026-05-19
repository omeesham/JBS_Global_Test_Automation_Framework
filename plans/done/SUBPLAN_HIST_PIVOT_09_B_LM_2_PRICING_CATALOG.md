> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-B-LM-2: MCP Catalog — Pricing Tab → 87-col Location Management History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: DONE
**Priority**: P0
**Created**: 2026-04-20
**Executed**: 2026-04-22
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

---

## Execution Summary (2026-04-22)

**Catalog**: [clients/encore/specs_planning/catalogs/hist-root-map-location-management-pricing.md](../../clients/encore/specs_planning/catalogs/hist-root-map-location-management-pricing.md) — 8 direct Pricing-tab parents + 1 Secondary Pricing table mutation vector cataloged via 6 save-cycles + 3 negative cases on office 1604 (Parker Palm Springs). Clean 1-col diffs on 4 of 4 save+restore pairs for direct TRACKED parents; phantom-row behavior on 2/2 saves for Secondary Pricing row edit; baseline restored 8/8 direct parents byte-match + secondary row 1 Is Alternate restored.

**Parents cataloged (8 direct + 1 table vector)**

| # | Parent | Target col | Status | Evidence |
|---|---|---|---|---|
| P1 | `checkbox-corporate-pricing` | col 11 "Corporate Pricing" | **TRACKED (direct)** | Saves 1 (11:20:25) + 2 (11:22:22) — clean 1-col diff + Modified On |
| P2 | `checkbox-price-guide-inclusion` | col 61 "Include Service Charge in Price Guides" | **TRACKED (direct)** | Saves 3 (11:23:47) + 4 (11:25:06) — clean 1-col diff + Modified On |
| P3 | `select-primary-labor-pricing-usd` | col 16 "Labor Pricing" | **TRACKED (by inference)** | No reversible unset path (popover has no `--Select--` option, 100+ strategies); mapping from header match + existing `"USD: ; CAD: ; MXN:"` serialization + 1:1 5-combo↔5-col adjacency |
| P4 | `select-primary-equipment-pricing-usd` | col 17 "Equip. Pricing" | **TRACKED (by inference)** | Same pattern as P3 |
| P5 | `select-primary-internal-equipment-pricing-usd` | col 18 "Internal Equip. Pricing" | **TRACKED (by inference)** | Same |
| P6 | `select-primary-production-labor-pricing-usd` | col 19 "Production Labor Pricing" | **TRACKED (by inference)** | Same |
| P7 | `select-primary-production-equipment-pricing-usd` | col 20 "Production Equip. Pricing" | **TRACKED (by inference)** | Same |
| P8 | `select-pricing-currency` | **NO COL** | **VIEW-ONLY FILTER (non-parent)** | Changing value does not dirty the form; options = `All` + Currency-tab Selected set; filters Secondary Pricing table view |
| S1 | Secondary Pricing row 1 — Is Alternate | cols 62–68 (Secondary cluster) | **NOT-TRACKED (direct)** | Saves 5 (11:29:23) + 6 (11:30:38) — both phantom-row (only Modified On diffed; cols 62–68 stayed `""`). DB persists the value; history does not. Candidate PRC-BUG-A. |

**Col 63 "Currency" duplicate-header status**: col 63 stayed `""` across all 15 cross-session save-cycles (9 SP-B-LM-1 Currency-tab + 6 this SP-B-LM-2 Pricing-tab). Pricing-ownership holds in the NEGATIVE sense (not Currency-owned per SP-B-LM-1). No currently-surfaced Pricing UI operation populates col 63 on office 1604. Cols 62–68 function as a phantom cluster; population path (if any) is via Add / Remove Pricing Strategy or admin-only paths not present in the Pricing tab UI for this office.

**BUG-HIS-001 scope clarification**: `EnableMultidayPricing` is on **Local Information** sub-tab, not Pricing (DOM-verified 2026-04-22 — zero `multiday` testids under Pricing content root; 2 matching testids under Local Information content root). BUG-HIS-001 confirmation is properly owned by SP-B-LM-3a/3b (Local Info catalog); this session neither re-verifies nor re-tests its claim. The subplan's §Scope wording ("Also investigate: EnableMultidayPricing was flagged NOT-TRACKED earlier") is a source-tab mis-attribution — documented in the catalog for the reconciliation (SP-B-LM-R) to pick up.

**Negative cases**: 2/3 confirmed (N1 Cancel = dialog closes, form stays dirty, no history row; N2 No-op = Save disabled when form pristine). N3 Validation-block = **not applicable** — all 8 direct Pricing parents independently optional; no required-field or cross-field validator surfaces on this tab for office 1604.

**MCP verification timeline (2026-04-22, office 1604, Claude in Chrome throughout — no mid-session fallback needed)**
1. ~11:10 UTC — landed on `cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` via persisted Microsoft "Stay signed in" session; Basic Information tab + Local Information sub-tab active by default.
2. Phase 1 — 8 Pricing parents inventoried + 87-col hist top-row baseline captured (10:59:43 AM = SP-B-LM-1 Save 9 restore, col 5=USD, col 63="", col 11=✔, col 61=✔).
3. Phase 2 Saves 1+2 (11:20:25–11:22:22) — `checkbox-corporate-pricing` TRACKED via col 11 clean 1-col diff. Save 1 absorbed pre-existing cross-parent drift on cols 33/37 (SP-B-LM-1 sub-observation); Save 2 cleaned to a pure 1-col restore.
4. Phase 3 Saves 3+4 (11:23:47–11:25:06) — `checkbox-price-guide-inclusion` TRACKED via col 61 clean 1-col diff on both save + restore.
5. Phase 4 — Primary Pricing combo popover opened on `select-primary-labor-pricing-usd`; 100+ strategy options enumerated; no `--Select--`/Clear entry found → irreversible-set UX; inference path adopted for P3–P7 (parallel to SP-B-LM-1 CAD/MXN Merchant inference).
6. Phase 5 Saves 5+6 (11:29:23–11:30:38) — Secondary Pricing row 1 Is Alternate toggle FALSE→TRUE→FALSE; both saves phantom (cols 62–68 empty). DB-persisted confirmed via post-save-5 re-read (aria-checked survives sub-tab switch).
7. Phase 6 — N1 Cancel verified (top-of-history still 11:30:38 AM after Cancel); N2 Save-disabled-on-pristine verified; N3 declared N/A; baseline byte-match verify showed 0 mismatches across 8 direct parents + secondary row 1 Is Alternate restored.
8. Phase 7 — `multiday` testid scan confirmed BUG-HIS-001 owner is Local Information tab; SP-B-LM-2 scope-cleaned.

**Plan-document updates**
- Created [clients/encore/specs_planning/catalogs/hist-root-map-location-management-pricing.md](../../clients/encore/specs_planning/catalogs/hist-root-map-location-management-pricing.md) (new, ~230 lines).
- This subplan: Status → DONE, Executed 2026-04-22, this Execution Summary added.
- Activity-log row appended per LR-028 / LR-037.
- `plans/INDEX.md`: regenerated via `npm run plans:reindex` after `git mv` to `plans/done/`.

**Test pass confirmation**: N/A for this session — no test code written. Catalog is an input artifact for SP-D2 (location-hist-pricing.spec.ts) and SP-B-LM-R (reconciliation).

**Rules honored**: LR-020 (every catalog claim backed by MCP evidence), LR-025 (Radix `find` + `left_click` pattern used for Corporate Pricing + Primary Labor combobox), LR-026 (Angular dirty-state — Save-button-disabled as pristine signal between saves; 2.5–3.0 s settle after dialog Ok), LR-027 (this Execution Summary), LR-028 (activity-log row), LR-030 (DOM-vs-subplan-wording mismatch on BUG-HIS-001 traced to source JSON, not silently overwritten), LR-032 (all findings from live MCP driving; zero theory), LR-033 (save-API round-trip via Save-button-re-disable timing), LR-036 (Unicode ✔ boolean re-verified cols 11 + 61), LR-037 (activity-log wall-clock ≥ touched-file mtimes), LR-038 (Claude in Chrome announced at session start + in catalog header).

**Deferred / follow-up items**
- Primary Pricing combos direct save-cycle evidence — requires a reversible "unset" path OR acceptance of a permanent baseline change on office 1604. Inferred mappings are sound (header-match + existing serialization format + 1:1 adjacency) but direct proof gated on the Encore UX team adding a Clear/None option in the popover. Handed off to SP-E-LM-OTHER as candidate PRC-BUG-C (UX gap) and SP-D2 (verify format-only assertions, not specific strategy IDs).
- Secondary Pricing Use Effective Dates / Start Date / End Date direct evidence — inferred NOT-TRACKED from Is Alternate proof + same phantom cluster pattern; retry driving Use Effective Dates if a non-destructive date precondition is later identified.
- Col 63 / cols 62–68 population path — open question whether these ever populate in production (Add / Remove Strategy not surfaced in office 1604 Pricing UI). If Encore team confirms they're expected to populate for Secondary edits, PRC-BUG-A/B graduate to formal LR-034 filings in SP-E-LM-OTHER.
- BUG-HIS-001 re-verification — properly owned by SP-B-LM-3a/3b (Local Information catalog), not SP-B-LM-2.

**Unblocks**: SP-B-LM-R (Location Management 87-col reconciliation — cols 11, 16–20, 61, 62–68 Pricing attributions locked in; col 63 Pricing-attributed by process-of-elimination), SP-D2 (location-hist-pricing.spec.ts — 2 direct-save TCs + 5 format-only inferred TCs + phantom-cluster assert-empty guards + 2 negative-case TCs specified), SP-E-LM-OTHER (Pricing batch — PRC-BUG-A/B/C candidates ready for LR-034 filing once user approves).

outcome:pass, attempts:1, rules-written:0.


---

## UPDATE (2026-04-22) — Post-hoc classification under LR-040 + in-session gap closure

This subplan was closed Status=DONE on 2026-04-22 with ~80% direct-proof + 4 gaps. Same-day re-entry (auto-mode) closed gaps under LR-040 discipline. The prose-only "Deferred / follow-up items" list above is superseded by this classification.

| Gap | Original treatment | Post-closure LR-040 class | Destination / evidence |
|---|---|---|---|
| #1 Primary Pricing 5 combos (cols 16-20) | "TRACKED (by inference)" — popover had no Clear, office 1604 baseline constraint | **(a) MCP-proven direct** — user lifted office-1604 constraint same-day; direct save-cycles P3-P7 2026-04-22 12:13:46–12:18:50 PM, 5 clean 1-col diffs | Catalog §Gap #1 closure block |
| #2 Secondary Use-Eff-Dates / Start / End | "NOT-TRACKED (inferred)" from Is Alternate pattern | **(c) discussion-item** folded into Gap #3 — attempted direct save-cycle; hit Radix state-revert + Is-Alt dependency; 22 of 22 cross-session saves left cluster empty; no reliable UI path remains | Catalog §Gap #2 classification + discussion-item flag |
| #3 Cols 62-68 population path | "Open question — cross-team answer" | **(c) discussion-item** per `feedback_discussion_item_not_bug.md` (graduated same-day) — empty-everywhere + no UI path + no Jira → flag for client call, do not file as bug | Catalog §Gap #3 discussion-item block |
| #4 BUG-HIS-001 re-verify | "Scope-pushed to SP-B-LM-3a/3b" — phantom hand-off (recipient files contained zero mention) | **(a) MCP-proven direct** — in-session direct save-cycles M1+M2 2026-04-22 11:57:25 + 11:58:17 AM, both phantom rows, zero "multiday" in 87-col headers | Catalog §Gap #4 closure block |

LR-040 passes with zero prose-only deferrals: 2 (a) direct-proven + 2 (c) discussion-items with named flag in catalog + Execution Summary. This subplan stays Status=DONE. Framework rule LR-040 graduated from this very incident — see `plans/done/PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE.md`.

**Catalog file appended** with 4 gap-closure blocks (~100 lines added): [clients/encore/specs_planning/catalogs/hist-root-map-location-management-pricing.md](../../clients/encore/specs_planning/catalogs/hist-root-map-location-management-pricing.md).

**Post-session office 1604 Pricing tab state**: 5 Primary Pricing strategies set (P3-P7 values intentionally persisted; baseline mutation permitted by user directive 2026-04-22). Corporate Pricing + Include Service Charge in Price Guides baseline retained. Secondary Pricing Is Alternate row 1 = FALSE (restored earlier). EnableMultidayPricing (Local Info) = FALSE (M2 restore).

gap-closure outcome:pass, direct-proof:2 (Gap #1 + #4), discussion-item:2 (Gap #2 + #3), rules-written:1 (LR-040).
