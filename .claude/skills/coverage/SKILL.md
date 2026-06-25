---
name: coverage
description: Author a QUICK test-coverage subplan for a module — field FCC (Axis 1) + L1 surface/behavior must-asserts (Axis 2) per the Case-Generation Standard. DEFAULT for an unqualified "create test cases" / "cover this module". Produces plans/pending/SUBPLAN_<MODULE>_COVERAGE_QUICK.md; does NOT run it.
user-invocable: true
auto-calls: identity
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TaskCreate, TaskUpdate, TaskList
---

# /coverage — QUICK Coverage Subplan Authoring (GIVER)

Authors a **QUICK** coverage subplan for one module using the two-axis [Case-Generation Standard](../../../docs/read_only_docs/CASE_GENERATION_STANDARD.md): every field (Axis 1, FCC) + the L1 must-assert per applicable surface/behavior family (Axis 2, SBC). It produces a runnable subplan; it does **not** execute it.

## When to Use

**Identity**: authoring runs as **OWNER** — `/coverage` writes a `SUBPLAN_<MODULE>_COVERAGE_QUICK.md` plan file, which is OWNER-owned territory (`plans/**`), so the authoring is honestly an OWNER action. (This is NOT "auto-loaded GIVER" — no hook structurally loads GIVER for a skill invocation; that claim was false.) What GIVER contributes here is **judgment, not file ownership**: apply **GIVER's HARD-STOP checklist** — FCC field taxonomy (`field-case-generation.md` §2), affordance probe (LR-057), empty-surface investigation (LR-040(c)), TC↔plan sync, the TDW walk — when deciding the case set. **Structural identity enforcement fires later, at `/execute` time**: when the authored subplan's GIVER phase writes the real test-cases / field-inventories / catalogs, the Layer-1 write-gate (PLAN_IDENTITY_ENFORCEMENT) requires `/identity GIVER` to be adopted first, so the role's HARD STOPs actually govern the artifacts.

- User says "create test cases", "cover this module", "coverage", "test cases for <module>" with **no depth qualifier** → `/coverage` is the **default**.
- User wants the cheap, fast first pass (field cases + the surface must-asserts that were structurally missing).
- For exhaustive depth (math/matrices/pairwise/a11y/file-I/O/integration), use `/ultracoverage` instead — it auto-calls `/coverage` first, so you get BOTH a QUICK and a DEEP subplan.

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/coverage`. No-op if compatible identity active.

## Step 1: Resolve the module + its surfaces

1. Resolve the target module (arg, or ask ONE question if ambiguous).
2. Check `.claude/context/navigation.md` §C Exploration Registry for the module — if mapped, read the findings file(s); do NOT re-explore.
3. Read the module's latest `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/<module>-*.md` + `field-case-catalogs/<module>-*.md` if present. If none exists (or >30d stale per LR-013), the authored subplan's Phase 0.5b runs the LR-064 Tiered Delegated Walk to produce one — do NOT walk live from this authoring skill.
4. **Classify surfaces**: does the module have a **grid / list / table / result** view? If yes → Axis 2 (SBC) applies; enumerate the applicable §3 families. If no → Axis 2 is `out-of-scope` and the subplan is field-FCC only (record the reason).

## Step 2: Decide the case set (per the Standard)

- **Axis 1 (FCC, `TC-<MOD>-FCC-*`)**: every field's `field-case-generation.md` §2 templates + the §2.1 rejection-affordance oracle.
- **Axis 2 (SBC QUICK)**: per applicable §3 family, the **L1 must-assert** only (pagination moves; one sort flips; a link-cell navigates; "no results" shows; a filter returns matching rows; sort/page-size survives reload). Each is an **ordinary 3-segment TC** (`TC-<MOD>-<SUB>-NNN`) carrying a `**Surface_Family**: <family> (QUICK)` line — no `-SBC-` ID infix (3-segment grammar; rides `check:tc-parity`). Inapplicable family → `out-of-scope:<family>=<reason ≥20 chars>` (LR-065).
- L2/L3 (math/matrices/pairwise/a11y/file-I/O/integration/volume) are **out of scope for QUICK** — they belong to `/ultracoverage`'s DEEP subplan. Note them as deferred-to-DEEP.

## Step 3: Author `SUBPLAN_<MODULE>_COVERAGE_QUICK.md`

Write to `plans/pending/SUBPLAN_<MODULE>_COVERAGE_QUICK.md`, copying the structure from `plans/pending/_TEMPLATE_SUBPLAN.md` and satisfying **LR-048** (structural minimum) + **LR-041** (Model/Thinking/PermissionMode) + the **SESSION BOOTSTRAP** block (per `/planning` Step 6):

- **Frontmatter**: Status PENDING · Priority · Created · Identity (OWNER shell; GIVER→BUILDER→AUDIT by phase) · Parent (the module's master plan if any, else `none`) · Depends on · Model `claude-opus-4-8` (or `claude-sonnet-4-6` for mechanical) · Thinking · PermissionMode · BrowserTool (`cli` if a walk/save-cycle is needed, else `none`).
- **Phases**: Phase 0 (dep + browser-tool gate) · Phase 0.5b (baseline-first walk / consume-or-emit field-inventory per LR-062/LR-064) · Phase 1 GIVER (FCC + SBC-QUICK catalog + TC-MD + test-plan + XLSX rebuild; `check:tc-parity` exit 0) · Phase 2 BUILDER (FCC describe + `SBC — <module>` describe at TOP, reusing existing page-object grid helpers — **NO new runner**) · Phase 3 AUDIT (FCC-Completeness + **surface-completeness**) · Phase 4 closure.
- **Per-Identity Satisfaction matrix** (LR-048 v3) — GIVER (catalog + MD + test-plan + XLSX), BUILDER (spec + page object), AUDIT, others `(none)`/`(skipped:…)`.
- **Render-fail rule (embed in Phase 2/3)**: a surface render-state assertion that fails (a link-cell that does NOT navigate, a wrong boolean/badge) → **RCA → classify**: regression-from-baseline → file `BUG-*` with `baselineComparison` (LR-034); baseline-absent → `/encore-questions`; by-design → documented skip with reason. **Never blind auto-file.**
- **Reuse mandate**: the subplan reuses existing page-object pagination/sort/row-count/content-anchored helpers (navigation.md §B). If a needed grid helper is missing, the subplan adds it in the page object (not a new runner).

## Step 4: Validate + register

1. Run the `/planning` Step-3 LR-041 + LR-038 v2 frontmatter gate (greps for Model/Thinking/PermissionMode/BrowserTool; HALT on a forbidden combo).
2. `node scripts/check-subplan-identity.mjs plans/pending/SUBPLAN_<MODULE>_COVERAGE_QUICK.md` if it declares artifact paths.
3. `npm run plans:reindex` (LR-035 — never hand-edit INDEX.md).
4. Present a concise summary: module, applicable §3 families, FCC + SBC-QUICK TC-ID namespaces, what was deferred to DEEP.

## Rules
- `/coverage` **authors**, it does not run — execution is a separate `/execute SUBPLAN_<MODULE>_COVERAGE_QUICK.md`.
- Never invent field/surface coverage the live inventory doesn't support — the authored subplan's walk produces the denominator (LR-062).
- Unknown field/surface type → the Standard's brain-first live probe (LR-057 no-taxonomy clause), authored as a Phase-0.5b instruction; never a HALT in the catalog.
- SBC TCs ride `check:tc-parity` — do NOT create a new parity script.

## Verification Artifact (D23)
`plans/pending/SUBPLAN_<MODULE>_COVERAGE_QUICK.md` exists with Status PENDING, an LR-048 structural skeleton, an SBC section listing ≥1 QUICK TC per applicable §3 family (or `out-of-scope:<family>`), and `node scripts/plans-reindex.mjs --check` clean.
