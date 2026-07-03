# SUBPLAN: Remaining 9 Modules — Neutral-Eye Audit Planner

**Status**: SUPERSEDED
**Priority**: P2-CYCLE-3
**Created**: 2026-04-22
**Executed**: 2026-04-25
**Superseded by**: SP-AAE-06 (parallel rollout of all 9 remaining modules under the new field-inventory system; no need for a separate planner step)
**Vision-preservation note** (2026-04-28): SP-AAE-06 itself was cancelled (`plans/done/SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md`, Status: CANCELLED) on 2026-04-28 after the user rejected `/chain` orchestration ("no chain, i dont trust it"). The planner-vision (ordering + prioritization of the 9 module audits) is preserved by direct revival of SP-DQU-12..20 as standalone subplans for manual one-by-one `/execute`. Each revived subplan carries the original Why-line in its `## Provenance` section, so the audit goals from the user's original DQU subplan table travel with the files. SP-DQU-11's planner step is therefore unnecessary — the manual workflow doesn't require it. SP-DQU-11 stays in `plans/done/` as the historical record.
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-08 (tag convention + rules finalized — so every new audit produces tag-ready output)
**Blocks**: SP-DQU-12..20 (the 9 per-module audits)

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_11_F1_REMAINING_MODULES_PLANNER.md`
**Identity**: WATCHDOG
**Skills auto-called**: /identity, /planning
**Model + thinking**: Opus + high (planning + prioritization)
**Dependency gate**: SP-DQU-08 `Status: DONE`
**Context files**:
- `clients/encore/docs/MODULE_REGISTRY.md` (module → URL mapping)
- All 9 existing module CSVs under `clients/encore/exports/`
- `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md`
- `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md` (pattern reference)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-22.md` (pattern reference)
- `clients/encore/specs_planning/_internal/qa-benchmark-2026-04-22.md` (if SP-10 done; else proceed without)
- `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` (existing v1-gap catalog to cross-reference)

## Purpose

Order the 9 remaining-module audits by (defect-likelihood × client-impact). Refine per-module audit steps based on what SP-02/04 taught us. Confirm batch ordering so downstream SP-DQU-12..20 execute in the right sequence.

## Step-by-step

1. Score each module on:
   - Defect likelihood (from `PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` — Pricing has 3 gaps, Legal 2, Account&Address 1, Currency 0, Notes 0, SharedSetup ~6% RT, AutoAddOn 100% RT, ECT 100% RT, Mgmt History — needs audit).
   - Client impact (is this a client-visible money/billing screen? Pricing + Account&Address rank high; History pages rank medium; Notes/AutoAddOn rank low).
   - Complexity (field count; Pricing + Account&Address + Auto Add-On high; Currency + Notes low).
2. Produce ordered list in `clients/encore/specs_planning/_internal/neutral-eye-audits/_ORDER-2026-04-22.md`:
   - Batch 1 (highest priority): Pricing, Legal, Account & Address.
   - Batch 2 (medium): Auto Add-On, Shared Setup Locations, Management History.
   - Batch 3 (lowest): Currency, Notes, ECT standalone.
3. Adjust `_TEMPLATE.md` with any SP-02/04 learnings (e.g., if neutral-eye discovered network-inspection is essential for silent-no-op bugs, lift that to the template's standard steps).
4. For each of the 9 modules, confirm the existing SP-DQU-12..20 file's Dependency field reflects the ordering (if Batch 1 blocks Batch 2 or not — default: all 9 can run in parallel after SP-11; but recommend sequential within a Chrome Claude session).
5. Write summary section in this subplan's own file (appended) with the ordering + per-module expected effort estimate.
6. Activity-log row.

## Acceptance criteria

- [ ] Ordering file exists.
- [ ] Each of the 9 downstream SP files referenced with its relative priority.
- [ ] Template updated if needed.
- [ ] Activity-log row.

## Handoff

Next: user decides whether to run batches sequentially or in parallel. Default: execute Batch 1 first (SP-12, SP-13, SP-16), then Batch 2 (SP-18, SP-17, SP-20), then Batch 3 (SP-14, SP-15, SP-19).
