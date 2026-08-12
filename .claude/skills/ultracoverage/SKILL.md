---
name: ultracoverage
description: Author the DEEP (max-depth) test-coverage subplan(s) for a module — L2/L3 exhaustive surface coverage (math/matrices/persistence, pairwise grids, date-BVA, full accessibility, file-I/O round-trip, integration/cross-field, Tier-2 network, volume/virtualization) per the Case-Generation Standard. Auto-calls /coverage first, so a grid-bearing module yields BOTH a QUICK and a DEEP subplan. Depth-chunks into _DEEP_L2 / _DEEP_L3 when large.
user-invocable: true
auto-calls: identity, coverage
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TaskCreate, TaskUpdate, TaskList
---

# /ultracoverage — DEEP Coverage Subplan Authoring (GIVER)

Authors the **DEEP** coverage subplan(s) for one module — the L2/L3 exhaustive tail of the two-axis [Case-Generation Standard](../../../docs/read_only_docs/CASE_GENERATION_STANDARD.md). It first auto-calls `/coverage` (so the QUICK L1 subplan also lands), then authors the DEEP subplan staged behind it.

## When to Use

**Identity**: authoring runs as **OWNER** — `/ultracoverage` writes `SUBPLAN_<MODULE>_COVERAGE_DEEP*.md` plan files, which are OWNER-owned territory (`plans/**`), so the authoring is honestly an OWNER action. (NOT "auto-loaded GIVER" — no hook structurally loads GIVER for a skill invocation; that claim was false.) GIVER contributes **judgment, not file ownership**: apply **GIVER's HARD-STOP checklist** (FCC field taxonomy, the L2/L3 surface families, affordance probe per LR-057, empty-surface investigation per LR-040(c), TC↔plan sync, the TDW walk) when deciding the DEEP case set. **Structural identity enforcement fires later, at `/execute` time**: when the DEEP subplan's GIVER phase writes the real test-cases / field-inventories / catalogs, the Layer-1 write-gate (PLAN_IDENTITY_ENFORCEMENT) requires `/identity GIVER` adopted first.

- User says "ultracoverage", "deep coverage", "exhaustive test cases", "max coverage for <module>", or "cover <module> fully / thoroughly".
- A grid-bearing module that needs the heavy tail: math/matrices, pairwise combinations, date-BVA exotica, full W3C accessibility audit, file-I/O round-trip, cross-field/integration, Tier-2 network-payload validation, volume/virtualization stress.

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/ultracoverage`. No-op if compatible identity active.

## Step 0.5: Seed DEEP worklist from prior quick walk

If a QUICK subplan for this module has already been executed (walk artifact exists in `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/`), grep it for `deferred-to-DEEP` rows:

```bash
grep -n "deferred-to-DEEP" clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/<module>-*.md
```

Each matching row names a specific launcher/element the quick run explicitly deferred. Use these rows as the **DEEP worklist seed** for Step 1 scope resolution — they are already machine-enumerated and denominator-counted, so the DEEP subplan picks up exactly where the quick run left off with zero overlap and zero silent skipping.

**CoverageMode stamp (LR-072)**: Every subplan authored by `/ultracoverage` MUST include `**CoverageMode**: deep` in its frontmatter.

## Step 0: Auto-call `/coverage` (QUICK first)

Invoke `/coverage <module>` first. It authors `SUBPLAN_<MODULE>_COVERAGE_QUICK.md` (field FCC + L1 surface must-asserts). A grid-bearing module request therefore yields **two** subplans: QUICK (run now) + DEEP (staged behind it). If a QUICK subplan for the module already exists in `plans/pending/`, skip re-authoring it and depend on it.

## Step 1: Resolve the DEEP scope (per the Standard's L2/L3)

Read the same module field-inventory + catalog + navigation.md registry as `/coverage`. The DEEP scope is everything the Standard defers from L1:

- **L2** (DEEP surface cases): persistence math/matrices; **date-BVA exotica** (leap-year, year-rollover, Start=End, ±1-day); **pairwise / covering-array** grid combinations (multi-row Is-Alt + Use-Effective-Date + dates + mixed currency); decision-table full enumeration.
- **L3** (DEEP surface cases): **file-I/O round-trip** (real download `waitForEvent('download')` + real upload fixture → validation/success); **integration / cross-field** (consume any dependency-map artifact; cover every `depends-on` edge — no cherry-picking); **full accessibility audit** (tab order, focus trap, label association, error-guidance, hover-only-action failures); **error-guessing** (rapid double-click race, concurrent edits, save-failure injection + retry, dropdown-load-failure recovery); **Tier-2 network-payload** structural validation (response body reflects committed payload). Tier-3 DB query is out of framework scope (aspirational).

Map each to a depth level. Deferred families (`rbac`/`concurrency`/`platform`) stay deferred unless the module genuinely needs them — then promote per the Standard §promotion.

## Step 2: Author `SUBPLAN_<MODULE>_COVERAGE_DEEP.md` — depth-chunk if large

- **If the DEEP set is small** → one file `SUBPLAN_<MODULE>_COVERAGE_DEEP.md` (`Depends on:` the QUICK subplan).
- **If large** → split **by depth level**: `SUBPLAN_<MODULE>_COVERAGE_DEEP_L2.md` then `SUBPLAN_<MODULE>_COVERAGE_DEEP_L3.md`, each `Depends on:` the level below (L2 depends on QUICK; L3 depends on L2). **N subplans = N levels deep** — never one mega-subplan.
- Each file satisfies **LR-048** + **LR-041** + the SESSION BOOTSTRAP block (per `/planning` Step 6), with a Per-Identity Satisfaction matrix (LR-048 v3).
- BUILDER phase blends DEEP cases at the TOP of the existing describe (sequential IDs past the QUICK high-water mark), reusing page-object helpers + adding any a11y / error-injection / download-dir / fixture-file scaffolding the DEEP cases need.
- Same render-fail rule as `/coverage` (RCA → regression/baseline-absent/by-design; never blind auto-file).

## Step 3: Validate + register

1. Run the `/planning` Step-3 LR-041 + LR-038 v2 frontmatter gate on every DEEP file authored.
2. `node scripts/check-subplan-identity.mjs <each DEEP file>` if it declares artifact paths.
3. `npm run plans:reindex`.
4. Present: QUICK subplan (from Step 0) + DEEP subplan(s) authored, the depth-chunk boundaries, and the `Depends on:` chain (QUICK ← L2 ← L3).

## Rules
- `/ultracoverage` **authors** (QUICK via `/coverage` + DEEP) — it does not run them.
- Never collapse multiple depth levels into one subplan when the set is large — depth-chunk so each level executes and closes independently (LR-060 no-silent-checkpoint friendliness).
- DEEP surface cases are ordinary 3-segment TCs (`TC-<MOD>-<SUB>-NNN`) with a `**Surface_Family**: <family> (DEEP)` line — no `-SBC-MAX-` ID infix (3-segment grammar); they ride `check:tc-parity`, no new parity script. **The `(DEEP)` marker goes ONLY on the `**Surface_Family**:` line — NEVER on the `## TC-…:` heading (the heading ships as the reviewer Title; ALL-091).**
- Reuse the QUICK subplan's walk/inventory; do NOT re-walk from this authoring skill.

## Verification Artifact (D23)
`plans/pending/SUBPLAN_<MODULE>_COVERAGE_QUICK.md` AND `..._COVERAGE_DEEP.md` (or `_DEEP_L2.md` + `_DEEP_L3.md`) exist, each Status PENDING with an LR-048 skeleton; the DEEP `Depends on:` chain resolves to the QUICK subplan; `node scripts/plans-reindex.mjs --check` clean.
