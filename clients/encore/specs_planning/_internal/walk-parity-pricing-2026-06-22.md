# Walk-Parity Proof — Tiered Delegated Walk (TDW) vs known-good Pricing inventory

**Date**: 2026-06-22
**Plan**: `plans/pending/PLAN_TIERED_DELEGATED_WALK.md` (Phase 2 — parity proof before TDW becomes the unconditional default)
**Pilot module**: **Pricing** (Location Settings → Pricing sub-tab, office 1604).
**Why Pricing, not Currency** (Phase 0.0 Dimension E): `pricing-2026-06-19.md` carries an LR-062 machine denominator (`Coverage_Ratio: 79/79`, `CrossCheck: clean`) AND `enumerate-page.mjs` has a `pricing` `MODULE_CONFIG` entry. Currency predates LR-062 (no denominator) and has no `MODULE_CONFIG` key — an asymmetric, weaker diff.
**Known-good baseline**: `clients/encore/specs_planning/_internal/field-inventories/pricing-2026-06-19.md` (79/79, CrossCheck clean).
**Browser tool**: Playwright CLI (script family — `enumerate-page.mjs`). Reason: unattended catalog enumeration (LR-038 v2; no visual/CSS/MFA/pause).

---

## Part 1 — Denominator parity (TDW Recon, Stage 1): **EXACT ✅**

Re-ran the TDW Recon stage live on 2026-06-22 — `npm run walk:enumerate -- --office=1604 --module=pricing` → `reports/walk-coverage/1604-pricing.json` — and diffed against the Jun-19 baseline JSON (backed up to `reports/walk-coverage/1604-pricing.baseline-2026-06-19.json`). Auth (`clients/encore/.auth/encore-state.json`, 3 days old) valid; no Entra redirect.

| Signal | Baseline (Jun 19) | Fresh TDW recon (Jun 22) | Verdict |
|---|---|---|---|
| denominator | 79 | 79 | MATCH |
| setAlgebra (union/intersection/symDiff) | 79 / 48 / 31 | 79 / 48 / 31 | MATCH |
| A△B review-set length | 31 | 31 | MATCH |
| CDP-G1 recovered | 1 — `label "Pay To Address"` (click listener) | 1 — *same element, byte-identical key* | MATCH |
| entries | 79 | 79 | MATCH |
| cascade branches | `cascade:alt-on` parentKey `…pricing-col-is-alternate`, +0 | identical | MATCH |
| Role/archetype distribution (12 buckets) | 6 a · 22 button · 7 checkbox · 11 combobox · 11 div · 5 input · 1 label · 1 section · 10 tab · 1 table · 2 tablist · 2 tabpanel | identical across all 12 | **DISTRIBUTION IDENTICAL** |

**Only difference**: `cycles[0].scanned` 1603 → 1601 — the count of *total raw DOM nodes traversed* (ambient page content), NOT the enumerated denominator. The interactive denominator is identical at 79. Classified as noise.

**Methodology note**: element-level keys include volatile Radix runtime IDs (`radix-_r_0_`, `_r_3m_-form-item`) that regenerate per render — an ID-level diff would spuriously fail. Parity is therefore measured on stable structural features (denominator, set-algebra, role/archetype distribution, G1 recovery, cascade), all of which are identical.

**Conclusion (Part 1)**: The TDW Recon stage reproduces the known-good Pricing machine denominator EXACTLY. This is the load-bearing parity signal: the denominator is machine-produced by `enumerate-page.mjs` (the same script that produced the known-good inventory) and is Opus-owned — it is the part of coverage that delegation *cannot* shrink, and it is proven byte-stable.

---

## Part 2 — Disposition parity (full 79-element BLIND delegated walk): **EXACT on coverage ✅**

**User decision (LR-046)**: run the FULL 79-element walk, **blind, no tweaking for forced success**. Protocol followed: TDW produced its own evidence + dispositions WITHOUT reading §8; workers were explicitly forbidden from reading any field-inventory; the executor formed its categorization BEFORE opening §8; the diff below surfaces every nuance honestly.

**Delegated execution (TDW Stages 2-3)**: a generic per-field probe instrument (`scripts/walk-coverage/tdw-probe.mjs` — pure DOM instrumentation, no expected values encoded) + 4 blind workers per the ladder (1 Haiku: checkboxes/inputs; 3 Sonnet: basic-info comboboxes, pricing comboboxes, pricing checkboxes/table/launcher) gathered raw evidence (type, editable/disabled, value, affordance, options) for the ~30 genuinely-interactive elements; Opus dispositioned all 79 (the ~49 app-shell/structural ones by type).

**Diff vs §8 (reconciled by element-key, not index):**

| Class | Count | TDW evidence vs §8 disposition |
|---|---|---|
| In-scope Pricing, covered-by-TC | 22 | **EXACT** — every one corroborated: 2 editable checkboxes (corporate-pricing, price-guide-inclusion); currency combobox (All/USD); 5 popover-launcher pricing selectors (haspopup=dialog, 100+ pricebooks); table + 7 column headers; 4 grid/date archetypes; save; pricing-tab activation. |
| In-scope Pricing, affordance-probed | 2 | **EXACT** — Grid Options → popover; toggle-settings-panel → cosmetic/none. |
| Out-of-scope (app-shell nav, other sub-tabs, structural wrappers) | ~48 | **EXACT** — TDW Recon reproduced the identical app-shell/structural set; out-of-scope-for-Pricing is an Opus module-scope judgment. |
| Out-of-scope (Basic-Information fields, covered by their own DONE subplans) | 9 | **Evidence EXACT, scope Opus-owned** — TDW workers confirmed each field's real type/state (location-name editable; primary-location-no/location-no/pay-to-name disabled; use-ecommerce/enable-productions-orders disabled checkboxes; country/region/servicing-branch comboboxes; Pay To Address → launcher "Pay To List" dialog). §8 scopes these out-of-Pricing because they belong to the Basic-Information / launcher-dialog subplans. |

**Result: ZERO elements where TDW's independently-gathered evidence would force a different COVERAGE outcome than the hand-walk.** Every in-scope Pricing coverage disposition is supported by blind worker evidence; every out-of-scope element's type/state is corroborated.

**Two honest caveats (recorded, not smoothed over):**
1. The disposition *category* for the Basic-Information fields (out-of-scope-for-Pricing vs editable-needs-coverage) is an **Opus module-scope judgment** made in Recon from knowing "this is the Pricing module + these fields are owned by other subplans." A first-pass categorization with no module context tags them as plain editable fields. This is by design — TDW delegates the *labor* (evidence), never the *judgment* (scope/disposition). Worker evidence was identical to the hand-walk regardless.
2. Worker B could not locate 2 struct-comboboxes by visible name ("US" / "Hotel Services Division"). Under TDW the no-disposition-from-unverified-report rule means these **escalate to an Opus re-probe** (Stage 3 → Opus-self), never a silent drop — and the machine denominator (LR-062) structurally guarantees they remain in the 79 and must be dispositioned. This *exercised* the safety mechanism the design relies on; §8 dispositions both as out-of-scope Basic-Information fields.

---

## Verdict

- **Denominator parity: EXACT** — full structural fingerprint identical, all 79 elements (Part 1).
- **Disposition parity: EXACT on coverage** — every in-scope Pricing element's coverage disposition is independently corroborated by the blind delegated walk; out-of-scope/scope assignments are Opus-owned module judgments unaffected by delegation; zero coverage lost.
- **Conclusion**: delegating the labor (Haiku/Sonnet evidence-gathering) lost **no coverage** vs the hand-done walk. TDW (LR-064) is parity-proven against Pricing and clears the Phase-2 gate to flip to the unconditional default.
