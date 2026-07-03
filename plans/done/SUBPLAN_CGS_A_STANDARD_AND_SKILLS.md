# SUBPLAN_CGS_A_STANDARD_AND_SKILLS — Case-Generation Standard + /coverage + /ultracoverage

**Status**: DONE
**Executed**: 2026-06-24
**Priority**: P1
**Created**: 2026-06-24
**Identity**: OWNER
**Parent**: PLAN_CASE_GENERATION_STANDARD.md
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

Pillar A of PLAN_CASE_GENERATION_STANDARD. We have no codified case-generation technique — `field-case-generation.md` §2 is field-input only, so grid/behavior cases are never generated (verified: zero pagination/sort/link tests across corp-pricing specs). This subplan codifies the technique as a lean, reusable, framework-level Standard, instantiates it for Encore (surface families), wires it into the pipeline so it fires by default, and exposes the two delivery tiers as skills producing two subplans per module (QUICK + DEEP). It also makes an unknown type a brain-first live-exploration trigger, not a dead HALT.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (BEFORE + AFTER snapshots — agents/rules/skills are exports)
- `/relevant` (Phase 0 — skill + LR + agent-mistakes injection)
- `/research` (Phase 0 — ISTQB/SFDPOT completeness diff)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files**:
- `PLAN_CASE_GENERATION_STANDARD.md` (parent)
- `~/.claude/plans/refactor-cascade-incident.md` (full design + verified facts)
- `.claude/rules/inventory.md` (LR-062/LR-064/LR-057, LR-065 lands here)
- `.claude/rules/pipeline.md` (LR-048/LR-041/LR-040/LR-027)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` · `docs/read_only_docs/LEARNED_RULES.md`
- `clients/encore/CLAUDE.md` (LR-ENC-002 FCC parity, LR-036, LR-057)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. `Depends on:` = none.
2. Read `.claude/context/navigation.md` Exploration Registry.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` (ALL-* / PLN-* / GEN-*).
4. Read `.claude/context/patterns.md`.
5. LR scan (LR-062/064/057/048/041/040/027, LR-ENC-002).
6. **BrowserTool=none** — this subplan builds the technique + skills; live module application is downstream (the skills generate their own module subplans).
7. **[GATE] ISTQB/SFDPOT completeness diff (the deferred verification):** run `/research` to diff the proposed 7 surface families (result-fidelity, pagination, sorting, combination, render-state, empty-vol, persistence) against canonical ISTQB techniques (EP/BVA/decision-table/state-transition/error-guessing) + SFDPOT. Add any missing family BEFORE authoring the Standard. **Do not skip — this is the same "incomplete taxonomy" disease the subplan fixes.**

## Phase 0.5b — Baseline-first walk

N/A — framework infrastructure; no live module behavior is classified in this subplan. `baselineScope: not-applicable`. (First module application — Corp Pricing — runs downstream via `/coverage`, which carries its own Phase 0.5b.)

---

## Phase 1+ — Actual work (OWNER, framework)

1. **Author the Standard (lean, reusable, read-only):** `docs/read_only_docs/CASE_GENERATION_STANDARD.md` — Axis 1 (field families, by reference to §2) + Axis 2 (the surface families confirmed by Phase 0 GATE) + methods (ISTQB + pairwise; SFDPOT stays in `/find-bugs`) + depth model L0 (walk-time presence) / L1 (QUICK) / L2-L3 (DEEP). Client-agnostic; promotion clause for additional families.
2. **Encore instance:** edit `clients/encore/specs_planning/_internal/field-case-generation.md` — re-title as the Encore instance of the Standard; keep §1/§2/§2.1; add **§3 — Surface-Family Templates** (each family × QUICK/DEEP rows: trigger + case + oracle; Encore specifics: LR-036 boolean render, currency badge, virtualization; render-state oracle = link-cell navigates → non-link is a *potential* bug, never blind auto-file). Re-label FCC as a delivery scope. TC namespaces: `TC-<MOD>-SBC-*` (QUICK) / `TC-<MOD>-SBC-MAX-*` (DEEP).
3. **LR-065 (`.claude/rules/inventory.md`):** grid/list/table archetype rows carry a `behavior-cases:<families>` disposition token; ≥1 QUICK TC per applicable family; inapplicable → `out-of-scope:<family>=<reason ≥20ch>`; folds into the LR-062 100% gate. Amend LR-064 Stage-1 so Opus classifies grid archetypes → §3 families (not just §2). Amend **LR-057 no-taxonomy-row clause**: unknown type → **brain-first live probe** (SFDPOT-style: click/junk/valid/empty/tab/save/reload) → write cases from observed behavior → `/research` confirms standard angles → HALT only if hands-on truly can't crack it.
4. **Enumerator:** extend `scripts/walk-coverage/` disposition vocabulary with `behavior-cases:` (grid→surface cases; link-cell→render assertion; file-control→file-I/O).
5. **Agent embeds** — extend each existing `## FCC Paradigm` section with the surface axis: REQUIREMENTS.md:46 (classify grids by §3 in FCC-lens divergences), PLANNER.md:52 (catalog gains an SBC section; closure XLSX count = FCC+SBC+main), GENERATOR.md:44 (SBC describe block; HARD-STOP no SBC spec without catalog SBC; `check:tc-parity` covers SBC TCs — no new script), AUDIT.md:49 (FCC-Completeness mode gains surface-completeness — missing applicable family = HIGH).
6. **Skills:** author `.claude/skills/coverage/SKILL.md` (GIVER; default for unqualified "create test cases"; authors `SUBPLAN_<MODULE>_COVERAGE_QUICK.md` = field FCC + L1 surface must-asserts; reuses existing page-object helpers; render-fail → RCA → classify) and `.claude/skills/ultracoverage/SKILL.md` (GIVER; auto-calls `/coverage`; authors `SUBPLAN_<MODULE>_COVERAGE_DEEP.md`, depth-chunked `_DEEP_L2`/`_DEEP_L3` if large — N subplans = N levels). Register both in `.claude/skills/INDEX.md`.
7. **Cleanup:** graduate + retire `plans/done/PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md` (now closed; findings → Standard/LR-065); read-before-touch `SUBPLAN_PRICING_EDGE_P3.md` + `SUBPLAN_CORP_PRICING_EDGE_P3.md` + `_PRE_EDGE.md` — merge pairwise/edge seeds into the DEEP model, retire stubs with cross-refs (never naive-delete).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Any adjacent fix noticed during Phase 1+ → DO-NOW / SPAWN / APPEND with a grep-verifiable recipient. Bare "out of scope" = HALT + ask (LR-040 + LR-046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | none | (none) | — |
| GIVER | none (skills are authored, not run, here) | (none) | — |
| BUILDER | none | (none) | — |
| HEALER | none | (none) | — |
| WATCHDOG | none | (none) | — |
| GARDENER | none | (none) | — |
| OWNER | new Standard + skills + rule + agent embeds | `docs/read_only_docs/CASE_GENERATION_STANDARD.md`<br>`.claude/skills/coverage/SKILL.md`<br>`.claude/skills/ultracoverage/SKILL.md` | `node scripts/plans-reindex.mjs --check` |

---

## Acceptance criteria

- [ ] Phase 0 ISTQB/SFDPOT completeness diff ran; surface family list finalized (no missing family).
- [ ] Standard doc + `field-case-generation.md` §3 + LR-065 landed; agent `## FCC Paradigm` sections extended (grep confirms surface-axis text in all four).
- [ ] `/coverage` + `/ultracoverage` SKILL.md exist + registered in INDEX.
- [ ] `check:tc-parity` exit 0 covers SBC TCs (no new parity script created — verified).
- [ ] Cleanup: PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX graduated; edge stubs reconciled (read-before-touch).
- [ ] `/regression-guard` before/after = no silent breakage on touched agent/rule/skill files.
- [ ] Activity-log row per LR-028 (timestamp ≥ touched-file mtimes).
- [ ] `/final-q` verdict block (GREEN | YELLOW | RED).

## Verification

```bash
node scripts/check-subplan-identity.mjs plans/pending/SUBPLAN_CGS_A_STANDARD_AND_SKILLS.md   # identity cross-check
test -f docs/read_only_docs/CASE_GENERATION_STANDARD.md && echo STANDARD-OK
grep -l "Surface" .claude/agents/REQUIREMENTS.md .claude/agents/PLANNER.md .claude/agents/GENERATOR.md .claude/agents/AUDIT.md
npm run check:tc-parity   # expect exit 0 (SBC TCs ride existing parity)
```

---

## Handoff (post-execution)

Chat-only per `feedback_handoff_in_chat_only.md`. Describes what landed (Standard, §3, LR-065, agent embeds, both skills, cleanup) and what Pillar B / the first module run inherit.

---

## Execution Summary

Executed 2026-06-24 (OWNER). Pillar A of PLAN_CASE_GENERATION_STANDARD. Framework-only subplan — no specs/TCs produced (N/A); no MCP/browser (BrowserTool=none).

### Phase 0 GATE — ISTQB/SFDPOT completeness diff (the deferred verification)
Ran the completeness diff via `/research` (3 web searches: ISTQB black-box techniques, SFDPOT/HTSM product elements, data-grid testing checklist). Result: the 7 active surface families + Axis-1 field families + the methods cover every canonical ISTQB technique (EP / BVA / decision-table / state-transition / use-case / pairwise) and every SFDPOT element **except `platform`** (cross-browser / responsive) — added to the deferred set {rbac, concurrency, platform}. **State-transition** surfaced as a **method** (save/dirty/navigate-away/validation-error model), not a new family — closes the 2026-06-19 coverage-audit Part-2 gap. No active family missing; surface-family list finalized at 7.

### What landed (per Phase-1 item)
1. **Standard** — NEW `docs/read_only_docs/CASE_GENERATION_STANDARD.md` (lean ~1pg, client-agnostic; Axis 1 by-reference + Axis 2 seven families + methods + L0–L3 depth + promotion clause + brain-first unknown-type).
2. **Encore instance** — `clients/encore/specs_planning/_internal/field-case-generation.md` re-titled as the Encore instance; §1/§2/§2.1 kept; NEW **§3 Surface-Behavior templates** (7 families × QUICK/DEEP, Encore specifics LR-036/currency/virtualization); FCC re-labelled a delivery scope; old §3 Cross-refs→§4, §4 Promotion→§5 (renumber clean — no external stale refs, verified).
3. **LR-065** appended to `.claude/rules/inventory.md` (`behavior-cases:<families>` folds into the LR-062 100% gate); **LR-064 Stage-1** amended (Opus classifies grid archetypes → §3); **LR-057 no-taxonomy clause** amended (unknown type → brain-first live probe → `/research` → HALT last resort; §4→§5 ref fixed).
4. **Enumerator** — `scripts/walk-coverage/lib/deep-pierce.mjs` `renderManifest` disposition vocabulary gains `behavior-cases:` (grid→surface; link-cell→render; file-control→file-I/O). Self-tests green (12/12 + 20/20), exports unchanged, syntax OK.
5. **Agent embeds** — surface axis added to `## FCC Paradigm` of REQUIREMENTS / PLANNER / GENERATOR / AUDIT (grep "Surface" = all 4). PLANNER closure count → FCC+SBC+main; GENERATOR SBC describe + no-SBC-without-catalog HARD STOP; AUDIT FCC-Completeness gains surface-completeness (missing family = HIGH).
6. **Skills** — NEW `.claude/skills/coverage/SKILL.md` (GIVER QUICK, default for "create test cases") + `.claude/skills/ultracoverage/SKILL.md` (GIVER DEEP, auto-calls `/coverage`, depth-chunks). Both registered in `.claude/skills/INDEX.md` (count 29→31).
7. **Cleanup** — `PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md` graduated (Parts 1–4 → already-consumed by Pricing FCC; Part-5 systemic insight → Standard + LR-065; the Part-5 open decision resolved) + moved to `plans/done/` (closure gate PASS, manifest written). The 3 EDGE stubs (SUBPLAN_PRICING_EDGE_P3, SUBPLAN_CORP_PRICING_EDGE_P3, SUBPLAN_CORP_PRICING_PRE_EDGE) — seed classes absorbed into the Standard DEEP model + §3; each given a **superseded-in-method** cross-ref; **kept PENDING** (LR-040(b) recipients for closed plans, AND CORP_PRICING_EDGE_P3 is the last gating child of PLAN_CORP_PRICING_MASTER — moving it would falsely cascade-close that master). Never naive-deleted.

### Acceptance criteria — all met
- Phase 0 ISTQB/SFDPOT diff ran; surface family list finalized (platform→deferred). ✓
- Standard + §3 + LR-065 landed; 4 agent FCC sections extended (grep ✓). ✓
- `/coverage` + `/ultracoverage` exist + registered in INDEX. ✓
- `check:tc-parity` exit 0 (SBC rides existing parity; no new parity script — verified). ✓
- Cleanup: audit plan graduated; edge stubs reconciled (read-before-touch). ✓
- `/regression-guard` before/after: no silent breakage (exports identical, self-tests green). ✓

### Scope adherence (deliberate non-actions)
- HEALER.md / MAINTAINER.md NOT touched — scope item 5 + acceptance name only the 4 pipeline agents.
- `coverage_mode` / `test_status_mode` NOT flipped to `deny` — that is Pillar B (SUBPLAN_CGS_B), out of scope here.
- No new surface-parity script — `/slop` DROP; SBC rides `check:tc-parity`.
- PLN-043..047 NOT minted as literal rules — `/slop` DROP, folded into LR-065 (documented in the graduated audit plan).

### Verification (re-runnable)
```bash
test -f docs/read_only_docs/CASE_GENERATION_STANDARD.md && echo STANDARD-OK
grep -l "Surface" .claude/agents/REQUIREMENTS.md .claude/agents/PLANNER.md .claude/agents/GENERATOR.md .claude/agents/AUDIT.md | wc -l   # expect 4
node scripts/walk-coverage/lib/test-coverage-manifest.mjs; node scripts/walk-coverage/lib/test-enumerate-fixtures.mjs   # green
npm run check:tc-parity   # exit 0
```
