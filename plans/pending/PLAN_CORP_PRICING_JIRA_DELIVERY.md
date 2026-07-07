# PLAN_CORP_PRICING_JIRA_DELIVERY — Jira-aligned delivery re-sequencing of all remaining Corporate Pricing work (conservation restructure)

**Status**: PENDING
**Priority**: P0
**Created**: 2026-06-24
**Identity**: OWNER
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: plan
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

Two overlapping Corp Pricing parents currently hold all remaining work — `PLAN_CORP_PRICING_MASTER` (net-new module; Waves 0/1/1.5 DONE; Wave-2 FCC / 2.5 dep-map / 3 edge / 1444 gated PENDING) and `PLAN_CORP_PRICING_REWALK_REMEDIATION` (E+A DONE; B1/B2/B3/closure PENDING, absorbing the FCC-P2 + edge stubs). The current shape is "finish the whole module, then ship as a whole." Teammates want the opposite: **fast, streamlined, Jira-ticket-by-ticket delivery.**

This plan **re-sequences and re-packages** that remaining work into 8 Jira-aligned deliverables + a held-back shadow tier. It is a **conservation restructure** (LR-050) — *same work, same depth, same audit rigor; only the order and the deliverable boundary change.* No work item is dropped and no depth is reduced; every original item is re-homed with a grep-verifiable destination.

**The 8 sprint stories = the official Corp Pricing features to ultracover (all *Highest*, To-Do):**

| Ticket | Feature to ULTRACOVER | Surface |
|---|---|---|
| [NM-2260](https://encore.atlassian.net/browse/NM-2260) | Filters + search + details-grid validations *(legacy entry-nav NOT automated — deep-link only)* | Search + Detail |
| [NM-2261](https://encore.atlassian.net/browse/NM-2261) | Create multiple Pricing Strategies | Strategy |
| [NM-2263](https://encore.atlassian.net/browse/NM-2263) | Create New Price Books + update existing (Equipment + Labor) | New-Pricebook |
| [NM-2267](https://encore.atlassian.net/browse/NM-2267) | Override screen (navigation + full override coverage) | Override |
| [NM-2262](https://encore.atlassian.net/browse/NM-2262) | Location Pricing Export + verify exported file | Toolbar I/O |
| [NM-2305](https://encore.atlassian.net/browse/NM-2305) | Location Pricing Import + update file + post-import validation | Toolbar I/O |
| [NM-2264](https://encore.atlassian.net/browse/NM-2264) | Pricing Export All (Export ▾ 4 variants) | Toolbar I/O |
| [NM-2265](https://encore.atlassian.net/browse/NM-2265) | Pricing Import All (Import ▾ 4 variants) | Toolbar I/O |

**Two-stream strategy (user-directed 2026-06-24):**
1. **Deliverable stream** — each ticket = **full `/ultracoverage` of its feature** (deep, proper, not simple taps): L0 presence → L1 must-asserts → L2/L3 deep (BVA / matrices / persistence / pairwise / real file-I/O / within-feature integration). Quick-wins-first order; each subplan self-contained and independently hand-in-able (one ticket as it completes, to keep a steady delivery cadence).
2. **Shadow stream** — the **remaining corp-pricing ultracoverage not tied to any ticket** (cross-field integration, module-wide stress/a11y/RBAC, framework gate-ramp, gated History). Done "simple, ideal, efficient" AFTER the 8 ship, and **held back from deliverable pushes** so future tickets can be delivered instantly from already-done work.

**Grounding (LR-020-verified 2026-06-24):** live truth = DONE keystone [SUBPLAN_CORP_PRICING_REWALK_AUDIT.md](../done/SUBPLAN_CORP_PRICING_REWALK_AUDIT.md) (2026-06-23) + `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` + `corp-pricing-drift-ledger-2026-06-19.md`. Current state = 6 specs / ~144 TCs green (2026-06-09); TC namespace = `TC-CPR-<SRC|STR|DET|OVR|NPB|TIO>-NNN`; **Export ▾/Import ▾ drifted RED** (Year+Currency gate); real file-I/O round-trip + override picker-add/Labor/validations/nav-link still uncovered.

---

## Bootstrap

**Identity**: OWNER (plan orchestration; child subplans run their own pipeline identities per frontmatter).

**Skills auto-called**: `/identity` (gate), `/execute` (per child), `/ultracoverage` (depth model per feature), `/audit` (conservation + closure), `/final-q` (each child exit).

**Context files**:
- `.claude/rules/pipeline.md` (LR-020/027/040/041/046/048/050/060)
- `.claude/rules/plan-closure.md` (LR-055 C1–C6)
- `.claude/rules/inventory.md` (LR-062/064/065/057, LR-029)
- `.claude/rules/baseline.md` (LR-045 / LR-ENC-001 baseline-absent)
- `.claude/rules/browser-tool.md` (LR-038 v2 / LR-054 — CLI default)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/LEARNED_RULES.md` (LR-059)
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/004, LR-036)
- DONE keystone walk-evidence + drift-ledger (above)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (FCC taxonomy)

---

## Conservation contract — every original work item has exactly one home (nothing dropped, no depth loss)

Each pending subplan is **(R) retired** with work re-homed (cross-ref, never naive-delete per LR-050), **(S) shadowed** (renamed + re-pointed, run after deliverables), or **(G) gated/untouched**. Each item moves with a **grep-verifiable line item** (LR-040(b)) at the SAME depth. The deep work (B3, deep FCC) now ships INSIDE the deliverables.

| Original pending subplan | Disposition | Work re-homed to (depth preserved) |
|---|---|---|
| `SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION` (B1) | **R — split** | Export▾ drift-fix→NM-2264; Import▾ drift-fix→NM-2265; Loc-Export re-verify→NM-2262; Loc-Import re-verify→NM-2305; New▾ Eq/Labor→NM-2263; Pricing-Override link + override Grid-Options→NM-2267; Search Grid-Options→NM-2260 |
| `SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION` (B2) | **R — split** | create-mode drag-add positive-control→NM-2263; Detail mgmt no-add TC-correction (DET-008/009/010)→NM-2260; NM-2301 watch→NM-2260 |
| `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2` | **R — fold** | all FCC (FormArray multi-row, save-revert, each strategy-type, dup-name, NM-2047/2059)→NM-2261 |
| `SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2` | **R — fold** | all numeric-BVA/format/fallback + CPR-DETAIL-BUG-A + NM-1874/2094/2095/1967→NM-2260 |
| `SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION` (B3) | **R — fold (now DELIVERABLE)** | full deep override (picker-add Eq+Labor, NM-1463/1932 validations, grid-options, location-picker modal, multi-currency, OVR-023, override Export/Import)→NM-2267 |
| `SUBPLAN_CORP_PRICING_EDGE_P3` | **S/R — split** | real file-I/O round-trips→NM-2262/2305/2264/2265; New-Pricebook validations NM-2022/2057→NM-2263; module-wide residue (compound-filter, virtualization stress, a11y, RBAC NM-2126, false-green sweep)→SHADOW_EDGE |
| `SUBPLAN_CORP_PRICING_PRE_EDGE` (dependency map) | **S — rename→SHADOW_INTEGRATION** | whole dep-map artifact + cross-field edges (NM-1675/2068) preserved |
| `SUBPLAN_CORP_PRICING_REMEDIATION_CLOSURE` | **S — rename→SHADOW_FRAMEWORK_CLOSURE (runs LAST)** | negative-test guards + announce→deny ramp preserved |
| `SUBPLAN_CORP_PRICING_1444_HISTORY` | **G — gated, untouched** | stays gated (tab not built; not in any ticket) |
| `SUBPLAN_OPI_G_MIGRATE_CORP_PRICING` | **out of scope** | separate initiative (per-office parallelism) — flagged, not touched |

**Conservation acceptance:** `/audit` must confirm every item above resolves to exactly one destination subplan with a grep-verifiable line, and no destination reduces the source's depth (FCC rigor / positive-control / mutation-safety / parity / ×2 green / do-or-die audit bars all carried forward).

---

## Children — Stream 1 (deliverables, quick-wins-first)

Each = full `/ultracoverage` of its feature, LR-048-structured, `baselineScope: baseline-absent`, FCC parity in-change (LR-ENC-002), ×2 green + per-ticket do-or-die audit, independently hand-in-able. Entry-nav stays deep-linked (NM-2260 legacy-nav constraint).

- [x] [`SUBPLAN_CORP_PRICING_NM2260_FILTERS_DETAIL.md`](../done/SUBPLAN_CORP_PRICING_NM2260_FILTERS_DETAIL.md) — filters/search/detail-grid (Depends: none) — **DONE 2026-06-25**: 61 ultracoverage TCs (DET-021..055 + SRC-031..056) implemented + green ×2.
- [x] [`SUBPLAN_CORP_PRICING_NM2261_STRATEGY.md`](../done/SUBPLAN_CORP_PRICING_NM2261_STRATEGY.md) — create-multiple strategies (Depends: none) — **DONE 2026-06-26**: 38 deep ultracoverage TCs (TC-CPR-STR-026..063) + 2 legacy-test fixes; full Strategy band 63 green ×2.
- [x] [`SUBPLAN_CORP_PRICING_NM2263_NEW_PRICEBOOKS.md`](../done/SUBPLAN_CORP_PRICING_NM2263_NEW_PRICEBOOKS.md) — new pricebooks Eq+Labor + update (Depends: none) — **DONE 2026-06-30**: 19 net-new TCs (TC-CPR-NPB-032..050) extending the NM-1440 band — drag-add positive control, New ▾ Eq/Labor menu clicks, update-existing mgmt-mode entry, NM-2022/NM-2057 dispositions (NM-2057 not-reproduced), Axis-2 SBC band; 50 green ×2, parity clean.
- [x] [`SUBPLAN_CORP_PRICING_LABOR_SAVE_AND_ROUTE_PARITY_GATE.md`](../done/SUBPLAN_CORP_PRICING_LABOR_SAVE_AND_ROUTE_PARITY_GATE.md) — Labor Save coverage gap (NM-2263 follow-up) + Save-route-parity prevention gate (Depends: NM2263) — **DONE 2026-06-30**: TC-CPR-NPB-051/052 (Labor dialog→Cancel + commit→persist→found-in-Search) green ×2; surfaced the `isLabor` Search-filter divergence; LR-066 rule + `scripts/check-save-route-parity.mjs` gate + pre-commit Gate 5d + WATCHDOG audit step.
- [ ] `SUBPLAN_CORP_PRICING_NM2267_OVERRIDE.md` — override nav + full override coverage (Depends: none)
- [x] [`SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md`](../done/SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md) — **DONE 2026-07-07**: real Loc Pricing Export download round-trip — TC-CPR-TIO-018..024 (018–023 green ×2, 024 data-blocked skip) + TC-012 re-verified; reusable `captureCsvDownload` helper handed off to NM-2264.
- [x] [`SUBPLAN_CORP_PRICING_NM2262_DATE_AND_COVERAGE_HARDENING.md`](../done/SUBPLAN_CORP_PRICING_NM2262_DATE_AND_COVERAGE_HARDENING.md) — **DONE 2026-07-07**: TC-023 hardened to assert the 3 previously-unasserted date columns (UseDate domain + StartDate/EndDate cross-field window invariant); LR-068 "no silent partial coverage" rule + paired memory note authored; TC-024 skip re-justified as tenant-wide; NM-1997/1998/2005 regression coverage tracked into NM2264.
- [x] [`SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md`](../done/SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md) — Export ▾ 4 variants, drift-fix + real download (Depends: NM2262) — **DONE 2026-07-07**: TC-CPR-TIO-002..005 corrected to the Year(s)+Currency dialog gate; 16 new TCs (025-040) — dialog contract, 1-3 year cap (4th refused), currencyId map USD=1/CAD=2/MXN=3 (live), 4 real per-variant downloads with NM-1997/1998/2005 regressions, Axis-2 combination/result-fidelity/empty-vol DEEP; 22 Export TCs green ×2; reused + extended the NM-2262 download helper (concrete HTTP status). Import ▾ 007-011 drift remains with NM2265.
- [x] [`SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md`](../done/SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT.md) — loc import real upload + validation (Depends: none; builds upload infra) — **DONE 2026-07-07**: TC-CPR-TIO-041..047 real upload round-trip green ×2 (workers=1) + TC-048 documented large-file boundary; live-verified findings CORRECTED the plan's assumptions — the app auto-submits on file-choose (no Upload click), the import is a per-LOCATION replace (omitted rows deleted, not a per-row merge), and the full-file failure is HTTP 500 "Failed to replace document" / NM-2407 (not the 503/504 timeout tickets); NM-2165/2206 leads classified; upload primitive `uploadFileToOpenDialog` exported for NM2265 reuse (R2 note appended).
- [ ] `SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md` — Import ▾ 4 variants, drift-fix + real upload (Depends: NM2305)

**Order:** surface tickets first (most already green → fastest to ultracoverage → guaranteed early hand-ins), then the 4 file-I/O tickets as one block (download infra in NM2262 reused by NM2264; upload infra in NM2305 reused by NM2265). Surface order adjustable by Phase-0 sizing — lead with whichever is closest-to-complete for the daily survival hand-in.

## Children — Stream 2 (shadow tier, held back from deliverable pushes; run after the 8)

- [ ] `SUBPLAN_CORP_PRICING_SHADOW_INTEGRATION.md` — dep-map artifact + cross-field/cross-page edges (from PRE_EDGE)
- [ ] `SUBPLAN_CORP_PRICING_SHADOW_EDGE.md` — compound multi-filter, virtualization stress, a11y, RBAC, module-wide false-green sweep (from EDGE_P3 residue)
- [ ] `SUBPLAN_CORP_PRICING_SHADOW_FRAMEWORK_CLOSURE.md` — **runs last**: negative-test guards + ramp closure gates announce→deny (from REMEDIATION_CLOSURE)
- [ ] `SUBPLAN_CORP_PRICING_1444_HISTORY.md` — stays gated, untouched

**Hide mechanism (the "behind-the-back" requirement) — finalize at first shadow execution Phase-0 with `/slop`:** shadow TCs carry a `@shadow` Playwright tag AND live in `*.shadow.spec.ts` files; per-ticket deliverable manifest includes only that ticket's TC IDs; shadow specs excluded from any deliverable archive via a one-line glob, verified against the LR-049 ship deny-list (`verify-no-forbidden.mjs`). Alternatives (separate internal branch; gitignore-from-archive) compared at Phase-0; pick the one that survives `/audit` + LR-049.

---

## Per-Identity Satisfaction

(Orchestrator — authors no test artifacts itself; every identity's concrete work is delegated to a child subplan and proven by C6 at that child's closure, per LR-048 v3 / C6.)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (delegated to children) | `(skipped: baseline-absent reused from REWALK_AUDIT keystone; children carry their own Phase 0.5b)` | child closure C6 |
| GIVER | (delegated to children) | `(skipped: test-cases + test-plans + XLSX delivered by each NM/SHADOW child; parent authors none)` | `npm run check:tc-parity` exit 0 |
| BUILDER | (delegated to children) | `(skipped: selectors/pages/specs delivered by each child; parent authors no code)` | `npm run typecheck` exit 0 |
| HEALER | (delegated to children) | `(skipped: conditional RCA/fix by each child on first-run failures; parent authors none)` | child suite green |
| WATCHDOG | (delegated to children) | `(skipped: per-child do-or-die audit + SHADOW_EDGE module-wide false-green sweep; parent authors no findings)` | per-child acceptance |
| GARDENER | (delegated to children) | `(skipped: dedup per ALL-026 within each child if 2+ repetition; parent authors no refactor)` | `npm run typecheck` exit 0 |
| OWNER | parent plan + conservation contract + LR-050 cleanup | `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` | LR-027 Execution Summary present at DONE-flip |

---

## Stale-cleanup (LR-050 — enumerated in-scope)

1. **Retire (R)** `B1`, `B2`, `1441_STRATEGY_FCC_P2`, `1443_DETAIL_FCC_P2`, `B3`: `Status: SUPERSEDED` + cross-ref block naming each re-homed item's destination NM-subplan; move to `done/` via reindex (closure-gate SUPERSEDED behavior verified at cleanup; never naive-delete).
2. **Rename→shadow (S)** `PRE_EDGE`→`SHADOW_INTEGRATION`, `EDGE_P3`→`SHADOW_EDGE` (strip the real-I/O + NM-2022/2057 items pulled into tickets; leave grep-verifiable cross-ref), `REMEDIATION_CLOSURE`→`SHADOW_FRAMEWORK_CLOSURE`; re-point `Parent:` to this plan; keep all residual depth.
3. **Supersede parents:** `PLAN_CORP_PRICING_REWALK_REMEDIATION` + `PLAN_CORP_PRICING_MASTER` (pending tail) get a supersession note → this plan owns remaining closure; DONE children untouched.
4. **Verify:** `npm run plans:reindex` clean; grep every original work item resolves to exactly one destination (conservation check); no orphaned `Parent:` refs; `1444_HISTORY` gated + `OPI_G` untouched.

---

## Acceptance criteria

- [ ] Parent + 8 deliverable subplans authored + 3 shadow subplans renamed/re-pointed, all LR-048-valid (`/planning` Step-3 + C6).
- [ ] **Conservation proof:** `/audit` confirms zero dropped items + no depth reduction vs the 10 original pending subplans (the conservation table above).
- [ ] Each deliverable = full ultracoverage of its feature (L0→L3), ×2 green, parity, per-ticket do-or-die audit, independently closeable + hand-in-able.
- [ ] Delivery order = quick-wins-first; file-I/O infra reuse declared (NM2264⇐NM2262, NM2265⇐NM2305).
- [ ] Shadow tier preserves PRE_EDGE/EDGE_P3/REMEDIATION_CLOSURE depth; hide-mechanism chosen + LR-049-verified at first shadow execution.
- [ ] LR-050 cleanup: 5 retired (cross-ref), 3 renamed-shadow, 2 parents superseded, 1444 gated, OPI_G untouched; reindex clean.
- [ ] `npm run plans:reindex` clean; activity-log row (LR-028); `/final-q` verdict at parent closure.

## Verification

```bash
node scripts/plans-reindex.mjs --check                                                    # INDEX reflects new tree, 0 orphans
ls plans/pending/SUBPLAN_CORP_PRICING_NM{2260,2261,2263,2267,2262,2264,2305,2265}_*.md     # 8 deliverables
ls plans/pending/SUBPLAN_CORP_PRICING_SHADOW_{INTEGRATION,EDGE,FRAMEWORK_CLOSURE}.md       # 3 shadow
node scripts/validate-plan-closure.mjs plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md --dry-run   # structural
```

## Closure & parent-cascade (LR-027)

Stays **PENDING** until all 8 deliverables + 3 shadow children + `1444_HISTORY` are DONE/closed; then close per LR-027 with an Execution Summary citing the child chain + conservation-audit result. Each child annotates its DONE line in this body on closure (LR-027 parent-cascade). Supersedes `PLAN_CORP_PRICING_REWALK_REMEDIATION` and the pending tail of `PLAN_CORP_PRICING_MASTER`.

## Execution Summary (when Status: DONE)

**Executed**: <YYYY-MM-DD>

<Per LR-027: children completed, conservation-audit result, TCs implemented per ticket (count + ID ranges), deliveries handed in, shadow coverage held back, deviations.>
