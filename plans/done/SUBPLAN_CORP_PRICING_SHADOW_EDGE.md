# SUBPLAN_CORP_PRICING_SHADOW_EDGE — Corporate Pricing residual edge / stress / module-wide coverage (shadow tier)

> **⚠ SBC ID correction (2026-06-24):** surface/behavior cases use **ordinary 3-segment IDs** (`TC-CPR-<SUB>-NNN`, the page's existing band) + a `**Surface_Family**: <family> (QUICK|DEEP)` line — **NOT** the 4-segment `-SBC-` / `-SBC-MAX-` infix this plan body references (that shape is rejected by `check-tc-parity` G6). Same coverage, grammar-safe. Canonical: LR-065 (`.claude/rules/inventory.md`) + `docs/read_only_docs/CASE_GENERATION_STANDARD.md`.

> **Shadow re-home (2026-06-24, PLAN_CORP_PRICING_JIRA_DELIVERY):** renamed from `SUBPLAN_CORP_PRICING_EDGE_P3.md` (git history preserved). Re-pointed to the Jira-delivery parent as **shadow-tier** residual coverage — runs AFTER the 8 ticket deliverables, held back from deliverable pushes. Items that moved INTO ticket deliverables are stripped from the seed list below and replaced with cross-refs (no duplication, no loss): real file-I/O round-trips → NM-2262/2264/2305/2265; create-mode drag-add → NM-2263; New-Pricebook NM-2022/2057 validations → NM-2263. Residual edge/stress/module-wide coverage stays here.

**Status**: SUPERSEDED (2026-07-17 — absorbed item-for-item into the six per-ticket plans SUBPLAN_CORP_PRICING_NM2268..NM2273; proof: .claude/state/ua-worker/chips/delegation-temp/out-ticket-split/ABSORPTION-MANIFEST.md)
**Priority**: P3
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Depends on**: SUBPLAN_CORP_PRICING_SHADOW_INTEGRATION.md, SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md, SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md, SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md, SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md
**Blocks**: SUBPLAN_CORP_PRICING_SHADOW_FRAMEWORK_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-3 STUB (F18).** Edge / stress / cross-cutting coverage for the Corporate Pricing module, priority P3 per Doctrine 1 (P1 → P2 → P3). Exists NOW so any edge-class deferral from earlier waves points at a grep-verifiable recipient (LR-040(b)). Full design is authored **after Wave-2 (FCC) closes** — detailing now = assumptions (Doctrine 1).

**Activation trigger**: Wave-2 FCC subplans closed.

> **Superseded-in-method (2026-06-24, SUBPLAN_CGS_A):** the edge seed classes below (compound
> multi-filter, virtualization stress, pairwise, a11y, file-I/O round-trip, cross-field) are now
> codified generically in the [Case-Generation Standard](../../docs/read_only_docs/CASE_GENERATION_STANDARD.md)
> L2/L3 **DEEP model** + `field-case-generation.md` §3. On activation, **regenerate the DEEP coverage via
> `/ultracoverage corporate-pricing`** (it auto-calls `/coverage` and emits QUICK+DEEP from the live
> inventory + the Wave-2.5 dependency-map) rather than hand-authoring the seed list. **This stub is NOT
> deleted or moved** — it REMAINS the grep-verifiable LR-040(b) recipient for the Wave-1.5 deferrals AND
> the **last gating child of `PLAN_CORP_PRICING_MASTER.md` (F16)**; moving/closing it would falsely
> cascade-close that master plan, so it stays PENDING here. Superseded-in-*method*, not
> retired-from-existence.

---

## Bootstrap

**Identity**: GIVER → BUILDER → HEALER → WATCHDOG on activation. Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/find-bugs` (adversarial edge), `/rca` (if failures), `/final-q`.
**Bug doctrine (master Doctrine 2 — applies while field-testing every case below)**: if any behavior looks suspicious or buggy (a control that won't react, a Save that silently no-ops, a field that accepts a negative/invalid value), follow the doctrine — record it as an `/encore-questions` clarification when the cause is unclear (permission-locked? interaction step missing?), or file per LR-034 once it reproduces in the runner (LR-044). Never silently absorb it; at minimum catch the bugs visible in these cases. (W15-0 modeled this — it raised Q-WV15-1 instead of false-filing.)
**Jira defect cross-ref (UNVERIFIED leads — prove each on the live site before it becomes a test expectation OR a filing, LR-044)**: check `clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md` — it supplies the cross-field edges to cover (NM-1675 computed Current Price, NM-2068 strategy "Locations Using" not updated), the RBAC gate (NM-2126), and the two New-Pricebook items carried forward from the already-done 1440 (NM-2022, NM-2057 — see seed list). External AI Jira-search output — reproduce live first, cite the `NM-#`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, the 3 Wave-2 FCC subplans, the Wave-1.5 subplans (`SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC.md`, `SUBPLAN_CORP_PRICING_W15_B_TOOLBAR_IO_FCC.md` — this stub holds their deferred real-I/O round-trip), all 3 field-inventories + the Wave-1.5 inventories, `field-case-generation.md`.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm the 3 Wave-2 FCC subplans DONE. 2. LR scan: LR-ENC-002, LR-022 (no hardcoded counts — F8), LR-051/052, LR-040, LR-034/LR-030/LR-044 (bug doctrine). 3. `BrowserTool=cli`, `-s=cpr-edge`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume S0 baseline-absent artifact. `## Baseline diff` = "baseline-absent; intent oracle = DOCX + SFDPOT edge heuristics".

---

## Phase 1+ — Scope + seed list (full edge design on activation)

**Seed edge cases — grep-verifiable residual items (shadow tier; items that moved into ticket deliverables are cross-reffed, not duplicated):**
- **Compound multi-filter STRESS** (Search): many filters + Search together at scale; order independence; reset from compound state. *(filter→details-grid validation is owned by NM-2260; this is the heavy stress/order-independence residual only.)*
- **591-row virtualization stress** + content-anchored read integrity (scroll far, read off-screen rows via content anchor; LR-022, F8).
- **Cross-field**: strategy×detail interactions; currency consistency header↔grid — **author from the `SUBPLAN_CORP_PRICING_SHADOW_INTEGRATION` dependency-map artifact (`corporate-pricing-dependency-map-*.md`); cover every `depends-on` edge it lists (no cherry-picking).**
- **Accessibility**: keyboard nav, ARIA roles on grid/dialogs.
- **RBAC**: Revenue Management role gate (read-only vs edit) where applicable — cross-ref NM-2126 (non-RM users wrongly retaining export/import).
- **Module-wide false-green + Excel-drift sweep (WATCHDOG — FINAL gate before SHADOW_FRAMEWORK_CLOSURE)**: run the **same B2.5 check as `SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md`** across the ENTIRE Corp Pricing spec suite (all done waves + the 8 NM ticket deliverables) — the 11 false-green patterns (`PLAN_BIG_PIVOT_FCC_MASTER.md` §False-Green Sweep Doctrine) + assert-matches-XLSX-intent (no spec weakened to pass green). W15_99 covered Wave-1.5 only; THIS is the module-wide final sweep. Any false-green or Excel-drift finding = DEFECT → blocks closure.
- **MOVED TO TICKET DELIVERABLES (cross-ref, NOT covered here — conservation, no duplication):** Export/Import real file-I/O round-trip → NM-2262/2264/2305/2265; create-mode drag-add (Detail/New-Pricebook) → NM-2263; New-Pricebook validations NM-2022/2057 → NM-2263.
- TC band: residual edge TCs extend the existing per-surface `TC-CPR-<SRC|STR|DET|OVR|NPB|TIO>-` bands (next-free numbers); the cross-surface / module-wide surface-family residue (below) uses the **module-level `TC-CPR-SBC-MAX-*`** band (no page token — no single page owns it) per the CGS-residue note.

**Axis-2 surface-family residue (CGS — what shadow-tier owns AFTER the 8 deliverables):** each of the 8 Jira deliverables now authors ITS OWN surface's 7 families as `TC-CPR-<page>-SBC-*` (QUICK) + `TC-CPR-<page>-SBC-MAX-*` (DEEP) per the [Case-Generation Standard](../../docs/read_only_docs/CASE_GENERATION_STANDARD.md). What is NOT a single ticket's surface stays HERE, authored as module-level `TC-CPR-SBC-MAX-*`:
- **Cross-surface `combination` + cross-page `persistence`** — authored from the `SUBPLAN_CORP_PRICING_SHADOW_INTEGRATION` dependency-map (every `depends-on` cross-page edge → an integration TC). Each per-ticket SBC table sees only its OWN surface; the inter-surface layer is shadow-only (this is the integration coverage that spans features — the existing "Cross-field" seed item IS this family).
- **Module-wide `empty-vol` volume/virtualization STRESS** — cross-surface load residue. **Conservation cross-ref (NO duplication):** single-surface virtualization stress (Search 591 / Detail 2430 / Override picker 3358·420 / New-Pricebook catalog 3707·547) now lives in each ticket's `empty-vol` `-SBC-MAX-` band — do NOT re-author it here; this stub keeps only the cross-surface / module residue (supersedes the standalone "591-row virtualization stress" + "Compound multi-filter STRESS" seed items, which now ride the per-ticket `empty-vol` / `combination` SBC-MAX bands — keep only the order-independence-across-surfaces residual).
- **Deferred-family PROMOTION (Standard promotion clause):** `rbac` (NM-2126 Revenue-Management role gate — read-only vs edit), `accessibility` (keyboard nav + ARIA roles on grids/dialogs), and `platform` (responsive/viewport) carry ZERO §3 templates today (the Standard DEFERS them). Promoting any here adds a `field-case-generation.md` §3 family row FIRST (per the Standard's promotion clause), THEN authors its cases — these are exactly the families the active-7 deliverable SBC tables defer (the existing "Accessibility" + "RBAC" seed items ARE these deferred families).
- **Disposition:** each authored item folds into the LR-062/LR-065 Cx gate like the deliverables; the module-wide false-green sweep below ALSO verifies the deliverables' `-SBC-`/`-SBC-MAX-` bands assert real surface behavior (not a weakened green).

Full catalog + MD + test-plan + specs on activation.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY on activation)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: stub — reuses S0 baseline-absent artifact; net-new on activation)` | grep baseline artifact |
| GIVER | edge test-cases/test-plan/XLSX (on activation) | `(skipped: stub — edge catalog + MD + test-plan authored on activation after Wave-2; seed list above is the grep-verifiable LR-040(b) recipient)` | `npm run check:tc-parity` exit 0 (on activation) |
| BUILDER | edge spec block (on activation) | `(skipped: stub — edge specs authored on activation only)` | n/a until activation |
| HEALER | (none until activation) | `(none)` | n/a |
| WATCHDOG | (none until activation) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] (STUB) Holds edge-class deferrals as a grep-verifiable recipient (LR-040(b)) — satisfied by Phase 1+.
- [ ] (ON ACTIVATION) Wave-2 FCC closed; full GIVER→WATCHDOG cycle; `check:tc-parity` exit 0; suite green.
- [ ] (ON ACTIVATION) **Axis-2 surface-family residue dispositioned (LR-065 → LR-062 Cx)**: cross-surface `combination` + cross-page `persistence` authored from the SHADOW_INTEGRATION dependency-map as module-level `TC-CPR-SBC-MAX-*`; single-surface virtualization/compound stress confirmed already-in-deliverables (cross-ref, NOT duplicated); each item folds into the Cx gate.
- [ ] (ON ACTIVATION) **Deferred-family promotion explicit**: any `rbac` (NM-2126) / `accessibility` / `platform` coverage promotes a `field-case-generation.md` §3 family row FIRST (Standard promotion clause) before authoring cases; a family left uncovered is recorded as `out-of-scope:<family>=<reason ≥20 chars>`, never a silent gap.
- [ ] (ON ACTIVATION) **No forced green, module-wide** — the ENTIRE Corp Pricing spec suite passes the B2.5 false-green + Excel-drift sweep (per W15_99 B2.5 / BIG_PIVOT 11 patterns); one finding blocks closure (master cannot flip DONE).

---

## Handoff

Wave-3 edge stub. The LAST gating child — when this closes, the master parent flips to DONE (F16). Activates after Wave-2 FCC closes.
