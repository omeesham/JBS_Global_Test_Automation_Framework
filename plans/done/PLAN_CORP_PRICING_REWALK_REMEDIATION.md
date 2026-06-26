# PLAN_CORP_PRICING_REWALK_REMEDIATION — Re-walk, remediate, complete & permanently prevent the Corporate Pricing miss-class  [SUPERSEDED]

> **SUPERSEDED (2026-06-24) by [PLAN_CORP_PRICING_JIRA_DELIVERY.md](PLAN_CORP_PRICING_JIRA_DELIVERY.md).** The keystones RCA_PREVENTION + REWALK_AUDIT are DONE and remain valid. The remaining remediation children were re-sequenced into Jira-aligned deliverables + a shadow tier under the new parent (conservation restructure, LR-050): B1 toolbar → split across NM-2262/2264/2305/2265/2267/2263/2260; B2 detail-drag → NM-2263 + NM-2260; B3 override-gaps → NM-2267; REMEDIATION_CLOSURE → SHADOW_FRAMEWORK_CLOSURE. No work lost. Retained for history.

**Status**: SUPERSEDED
**Superseded-by**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Priority**: P0
**Created**: 2026-06-19
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

Corporate Pricing is the most-automated Encore module (this master + the Wave-1/1.5 done subplans + the pending FCC-P2/EDGE stubs), but three independent signals proved the coverage can no longer be trusted as-is, and an evidence-first RCA (5 parallel investigators, 2026-06-19) proved the misses are **systemic, not one-offs**:

1. **App drift** — ~2026-06-10 a live change broke the toolbar I/O suite (10 of 17 `TC-CPR-TIO-*` red: `Export ▾` no longer fires the direct request; `Import ▾` is now a Year+Currency dialog). A one-off task was spawned but never run.
2. **Unsound false-negative evidence** — `TC-CPR-DET-008/009/010` "prove" drag/double-click do NOT add in Pricing Detail using `.dragTo()` (a primitive that frequently never fires React/HTML5 DnD). Same failure class as the Override "inert cells" false-negative (raw-JS `.click()` not firing React).
3. **Real coverage holes** — `Pricing Override` link (zero coverage); `New ▾` dropdown (reached by URL, never clicked); **override-page Grid Options** (uncovered); **override add-via-Picker** (never seen — walks used `Currency=ALL`, which hides the currency-gated picker per NM-1472); **Labor tab** (empty, never investigated); location-picker modal controls; the `TC-CPR-OVR-023` fixme; multi-currency editing.

**Deepest single root cause:** negative/terminal claims — "control does nothing", "surface is empty", "suite is done" — had no machine oracle requiring positive proof, and advisory rules weren't enforced or synced into the 5 agent identities. `LR-062`'s walk-enumerator (2026-06-19) fixed ONE slice (enumeration) with a machine gate; this plan gives the other three the same treatment.

**Intended outcome:** every Corporate Pricing surface + control + dropdown value live-verified against the current app under a machine completeness gate; every drifted / false-negative / missed item fixed; the pending deep-passes executed; the suite green ×2 with parity/lint/typecheck clean; and **permanent, slop-free guards embedded in all 5 identities** so the miss-class is structurally prevented.

---

## Root-Cause Analysis & permanent prevention (evidence-based; LR-020-verified 2026-06-19)

**Anti-slop discipline:** each fix was chosen by checking "already solved?" first; `EXTEND` beats minting a new LR; any mint is gated by `/upgrade` + `/slop` before landing.

| # | Miss | Exact root cause | Already guarded? / why it didn't fire | Permanent slop-free fix | Owner identities |
|---|---|---|---|---|---|
| **M1** | Detail drag / Override inert-cells / `New ▾`-by-URL false negatives | Weak primitive (`.dragTo()`, raw-JS `.click()`) no-op accepted as APP behavior; no positive control proving the primitive can fire | PARTIAL — `LR-061-B` verify-before-blocked exists but is "try harder", not "prove the same primitive mutates a known-positive case"; §2.1 oracle covers rejected-INPUT only; both misses predate the rule; HEALER lacks the embed | **EXTEND `LR-061`** (positive-control corollary + raw-JS-vs-Playwright-`.click()` React rule + ban `.dragTo()` for DnD); embed in all 5 prompts. `/upgrade` decides extend-vs-new-LR | REQUIREMENTS, PLANNER, GENERATOR, HEALER, WATCHDOG |
| **M2** | Override Grid Options / `Pricing Override` link / cross-page confusion | Walk was author-judgment, no machine denominator forcing 100% disposition | **YES — already built** (`LR-062` enumerator + Cx gate, 2026-06-19) but 10 days AFTER the Corp Pricing walks closed; artifacts grandfathered; enumerator MODULE_CONFIG only has Location-Settings Pricing | **APPLY-EXISTING (no new rule):** add 5 Corp Pricing pages to `enumerate-page.mjs`; run in the re-walk; Cx gate enforces 100% | PLANNER (+ Subplan A) |
| **M3** | 10 red toolbar tests; plan flipped DONE deferring to a transient task chip; staleness unenforced | `LR-040(b)` only needs the recipient to exist (a task chip isn't a plan file); closure C1–C6 check artifacts not test-status; `LR-060` forbids env-deferral, not test-status deferral; staleness §7 is doc-only | **NO — real structural hole** (user-authorized close, but framework had no gate) | **NET guard reusing ramp infra:** test-status check in `validate-plan-closure.mjs` (no DONE flip with red owned-tests sans a `## Deferral Authorization` naming TC IDs + a PENDING recipient, never a task chip); EXTEND `LR-060` | GENERATOR, HEALER, WATCHDOG |
| **M4** | Labor empty-state accepted; no Jira/data dig | `LR-040(c)` lets you flag empty + "refresh later" without investigating how it populates | PARTIAL — rule permits the silent punt | **EXTEND `LR-040(c)`** (record population path + classify data/feature/by-design + escalate-if-unknown) | REQUIREMENTS, PLANNER |
| **META** | Identities drift behind new LRs | No automated sync keeps agent prompts current (`sync-agent-mistakes.ts` is a no-op post-Copilot-eviction) | NO mechanism | **LR-embed parity check** flagging any LR naming an owning agent but not embedded there | OWNER |

---

## Jira ground-truth (Rovo research, 2026-06-19 — `encore.atlassian.net`)

- **[NM-1472](https://encore.atlassian.net/browse/NM-1472)** (Done, Blocker) — the override screen HAS an add affordance: a Product-Group Picker (double-click + drag add), visible **only once a specific location AND currency are selected**. Walks used `Currency=ALL` → picker never rendered → the suite's "no add affordance" (NM-1961 close) is **WRONG**. New rows init Dirty + GUID + default Inactive.
- **[NM-1463](https://encore.atlassian.net/browse/NM-1463)** (Done, Blocker) — override management spec: currencies are **location-gated**; selecting a location forces back to Equipment; **Override Price auto-activates the row; Override Discount (0–100) cannot exist without an Override Price** (= the designed NM-1932 validation, NOT "blocked-data"); "New" location list **excludes locations that already have an override**.
- **[NM-1443](https://encore.atlassian.net/browse/NM-1443)** (Done, Blocker) — Pricing Detail by design: **management mode = double-click/drag NOT allowed (no add); create mode = add allowed.** The agent's no-add-in-mgmt conclusion matches design, but was "proven" via `.dragTo()` (unsound) — and the human tester's contra-observation must be settled live (a real drag that adds in mgmt = an app-vs-spec bug).
- **[NM-1881](https://encore.atlassian.net/browse/NM-1881)** (Done) — Labor product groups exist in override (repro office **1101**). **Labor is testable** by adding a Labor row via the picker — the open "Labor test-data" question is resolved.
- **Live bugs the walk must expect (not treat as "no data"):** [NM-2206](https://encore.atlassian.net/browse/NM-2206) override goes blank / "red-circle" after an MFE-created pricebook + import (Blocker); [NM-2165](https://encore.atlassian.net/browse/NM-2165) import network error but PGs still update; [NM-2301](https://encore.atlassian.net/browse/NM-2301) Max Discount NULL→0.00 on UI price update.

---

## Current-state ledger (seed for the re-walk)

| Surface / control | Status | Disposition |
|---|---|---|
| Search / Strategy / Detail(edit-save) / New-Pricebook / Override-grid FCC | ✅ green | re-verify only |
| Pricing Detail drag/dbl-click (mgmt) | ⚠️ spec-correct conclusion, unsound evidence | **UNFUCK** (real drag + positive control; settle vs NM-1443) |
| Toolbar Export ▾ / Import ▾ / Loc Pricing | 🔴 10 STALE/RED | **UNFUCK** |
| `New ▾` dropdown values | ⚠️ via URL, never clicked | **MISSED** |
| `Pricing Override` link | ❌ zero coverage | **MISSED** |
| Override-page Grid Options | ❌ not covered | **MISSED** |
| Override add-via-Picker (currency-gated) | ❌ never seen (`Currency=ALL`) | **MISSED** (NM-1472) |
| Override Labor tab | ⚠️ empty-state only | **RESOLVED path** — add via picker (1101, NM-1881) |
| Override discount-requires-price (NM-1932) | ⏸️ "blocked-data" | **MISSED** — designed validation (NM-1463) |
| Override location-picker modal controls | ⚠️ partial | **MISSED** |
| `OVR-023` fixme / override Export-Import | ⏸️ deferred | **FINISH / re-verify** |
| 1441 Strategy FCC P2 / 1443 Detail FCC P2 / PRE_EDGE / EDGE_P3 | ⏳ pending stubs | **FINISH** (ledger-driven) |
| 1444 History | ⛔ gated (tab not built live) | leave gated |

---

## Decomposition — execution order

```
E  SUBPLAN_CORP_PRICING_RCA_PREVENTION.md      (OWNER — guards in ANNOUNCE mode FIRST)
        ▼
A  SUBPLAN_CORP_PRICING_REWALK_AUDIT.md         (keystone — re-walk under the enumerator → drift/gap ledger)
        ├─► B1 SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md
        ├─► B2 SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION.md
        └─► B3 SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION.md
        ▼
C  FINISH existing pending stubs (extended in place per LR-050/LR-040b):
   SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2 · _1443_DETAIL_FCC_P2 · _PRE_EDGE · _EDGE_P3
        ▼
D  SUBPLAN_CORP_PRICING_REMEDIATION_CLOSURE.md  (do-or-die audit + NEGATIVE-TEST the new guards; then ramp gates announce→deny)
```

**Children (this master annotates each on closure per LR-027):**
- [x] [SUBPLAN_CORP_PRICING_RCA_PREVENTION.md](../done/SUBPLAN_CORP_PRICING_RCA_PREVENTION.md) — **DONE 2026-06-23**, M1–M4 + META guards landed in announce mode (LR-061 positive-control corollary embedded in all 5 prompts; 5 Corp Pricing enumerator entries; Ct no-red-close gate + LR-060 obligation 3; LR-040(c) empty-surface; LR-embed parity check exit 0).
- [x] [SUBPLAN_CORP_PRICING_REWALK_AUDIT.md](../done/SUBPLAN_CORP_PRICING_REWALK_AUDIT.md) — **DONE 2026-06-23**, keystone FULL e2e walk — **every** Corp Pricing surface/control driven live (LR-064 proof trail `walk-evidence-corporate-pricing-2026-06-23.md`): NM-1472 currency-gated Picker (USD 3358 / CAD 1 / MXN 1; double-click+drag both ADD — "no add affordance" was a FALSE NEGATIVE, M4 closed); **Override cell-edit validations LIVE** — auto-activate NM-1463 (bidirectional), OVR-023 Max-Discount min0/max100 reject+block-Save, discount↔price coupling NM-1932, Export=direct-CSV / Import=file-chooser; **Toolbar post-Continue LIVE** — Export▾→Year+Currency gate→`pricing-export` [200], Import▾→gate→file-chooser (B1); **Strategy New-Strategy dialog**, **New-Pricebook create-mode** (double-click+drag add = positive control), **Detail inline-edit** all driven; **History LIVE-ABSENT** (feature-blocked, NM-1444); Detail mgmt no-add CONFIRMED defensive (NM-1443). Drift ledger + override inventory + baseline + walk-evidence emitted for B1/B2/B3.
- [ ] `SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md`
- [ ] `SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION.md`
- [ ] `SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION.md`
- [ ] `SUBPLAN_CORP_PRICING_REMEDIATION_CLOSURE.md`

**Existing pending stubs absorbed (not duplicated — extended with ledger line items):** `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md`, `SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md`, `SUBPLAN_CORP_PRICING_PRE_EDGE.md`, `SUBPLAN_CORP_PRICING_EDGE_P3.md`. **Excluded:** `SUBPLAN_CORP_PRICING_1444_HISTORY.md` (gated — tab not built live).

---

## Anti-Assumption Gates (binding on every child subplan)
1. Baseline-first executes before any classification. 2. N≥2 before "regression/corrupt/app-wide". 3. **Verify-before-blocked + positive-control (extended LR-061): never assert a control inert/defensive/un-drivable without proving the same primitive fires on a known-positive case.** 4. No env-rationalized deferral of env-independent work. 5. Atomic un-skip + LR-019 harden. 6. No silent checkpoint (complete phases or a user-signed `## Deferral Authorization`).

## Acceptance criteria (whole effort)
- [ ] Root causes fixed slop-free: M1–M4 + META guards landed; every rule chosen via `/upgrade` (extend-over-mint recorded); all 5 identities carry their owned embeds; LR-embed parity check exits 0.
- [ ] Prevention proven: each new guard negative-tested to DENY/flag its original miss (Subplan D).
- [ ] Every ledger surface classified; non-green items fixed or named-and-deferred to a PENDING subplan (never a task chip).
- [ ] Toolbar: every button + every dropdown value live-verified and tested (incl. `Pricing Override`, both Grid Options, `New ▾` clicks).
- [ ] Override add-via-Picker covered on Equipment + Labor; discount-requires-price + auto-activate validations covered.
- [ ] Pricing Detail drag verdict carries positive-control evidence (not a `.dragTo()` no-op); any spec divergence filed.
- [ ] Full `corporate-pricing` suite green ×2; `check:tc-parity` / `xlsx:lint` / `typecheck` exit 0; no `(skipped)` matrix cells without a ≥20-char reason.
- [ ] Closure gates ramped announce→deny only after the remediation proves clean.

## Verification
```bash
ls plans/pending/SUBPLAN_CORP_PRICING_{RCA_PREVENTION,REWALK_AUDIT,TOOLBAR_REMEDIATION,DETAIL_DRAGDROP_REMEDIATION,OVERRIDE_GAPS_REMEDIATION,REMEDIATION_CLOSURE}.md  # expect: all 6 exist
npx playwright test corporate-pricing --workers=1  # expect (post-remediation): 0 failed/flaky/skipped, ×2
npm run check:tc-parity && npm run typecheck       # expect: exit 0
```

## Closure rule (this master)
Stays **PENDING** until all 6 children + the 4 absorbed stubs are DONE; then close per LR-027 with an Execution Summary citing the child chain. Each child annotates its DONE line in this body on closure (LR-027 parent-cascade).

## Handoff
Execute children in the order above (E first — it lands the guards that govern the rest; D last — it proves the guards and ramps them to deny). `/chain` can drive them; `Depends on` fields enforce ordering.
