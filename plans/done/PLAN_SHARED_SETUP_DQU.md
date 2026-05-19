# PLAN: Shared Setup DQU — Track A Pilot #1 (3-Agent Routed) [SUPERSEDED]

**Status**: SUPERSEDED
**Superseded-By**: PLAN_DQU_V6.md → PLAN_DQU_V6_PILOT_SHARED_SETUP.md (2026-05-12)

> **SPLIT NOTICE (2026-05-12)** — § HUNTER / § GIVER / § BUILDER bodies extracted into three sibling subplan files for per-session execution (no `/chain`; user runs each manually). This file is now the **orchestration shell**: pilot context, identity sequence, shared Phase 0 / Bootstrap contract, WATCHDOG end-cap, plan-level Acceptance, Verification, Execution Summary, and Cross-references. Section bodies live in:
>
> - HUNTER → [SUBPLAN_SHARED_SETUP_DQU_HUNTER.md](SUBPLAN_SHARED_SETUP_DQU_HUNTER.md) (Phase 1a + 1b + 2 — Exploration)
> - GIVER → [SUBPLAN_SHARED_SETUP_DQU_GIVER.md](SUBPLAN_SHARED_SETUP_DQU_GIVER.md) (Phase 3 + 4 — Archetype probe + ARCH-013/014 + Matrices A/B/C/D)
> - BUILDER → [SUBPLAN_SHARED_SETUP_DQU_BUILDER.md](SUBPLAN_SHARED_SETUP_DQU_BUILDER.md) (Phase 5 + 6 — Gap-fill + fixes + page-objects + bug-regressions + determinism)
> - WATCHDOG → unchanged (fresh `/audit` session per AUD-017; remains a § of THIS file)
>
> Execution order: HUNTER closes (GREEN /final-q) → user `/clear` + invokes GIVER subplan → GIVER closes → user `/clear` + invokes BUILDER subplan → BUILDER closes → user opens fresh session + runs `/audit` against THIS file as the closure gate. `/chain` is intentionally NOT used per user authorization 2026-05-12.

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Priority-note**: pilot — blocks Notes redo + 10 frozen Track A modules + 2 HIST submodule plans
**Created**: 2026-05-12
**Body version**: v1.1 (split 2026-05-12 — body unchanged, section bodies extracted to sibling subplans)
**Identity sequence**: OWNER (this file — orchestration only) → HUNTER (subplan) → GIVER (subplan) → BUILDER (subplan) → WATCHDOG (fresh `/audit` session post-BUILDER, AUD-017)
**Parent**: `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md` (v5)
**Depends on**: Step 2.5 disposition pass complete (32 HIST plans physically in `plans/done/`); `intake/` directory created.
**Blocks**: `PLAN_NOTES_AUDIT_AND_STABILIZE.md` authoring + `_TEMPLATE_MODULE_DQU.md` authoring + thaw of 10 frozen modules + Track B HIST plans.
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli (HUNTER + GIVER live walks); BUILDER uses `@playwright/test` runner
**Skills**: `/execute`, `/find-bugs`, `/regression-guard`, `/encore-questions`, `/final-q` (BUILDER pre-handoff); `/audit` (WATCHDOG end-cap, fresh session)

---

## Context

Shared Setup is the first pilot for the v5 3-agent DQU template. It is multi-field — the structural reason it runs FIRST (before Notes). Multi-field stress-tests Matrix D (Cross-Field Interactions: state-dep, validation-dep, visibility-dep, limit-dep, cascading-options, save-combinations). If the Matrix D template has a bug, we discover it here, BEFORE Notes (1-field) inherits a broken pattern, and BEFORE the 10 frozen Track A modules thaw and copy the broken template 10x.

This pilot also authors ARCH-013 (save-cycle) and ARCH-014 (cross-field-interaction) inline into `clients/encore/specs_planning/_internal/bug-archetypes.md` during the GIVER section — shapes derived from real Shared Setup UI exploration, not guessed upfront. Downstream modules inherit those archetypes.

Pilot success = WATCHDOG GREEN verdict. Pilot failure (YELLOW/RED) = template patch needed before Notes runs.

---

## Bootstrap

**Identity** loaded per section (`/identity HUNTER` at top of § HUNTER, etc.). Section boundary = `/clear` + `/identity <next>`. WATCHDOG is fresh session, not a section.

**Skills auto-called per phase**: `/regression-guard` wraps BUILDER's spec edits. `/find-bugs` available to all 3 agents. `/encore-questions` queued during GIVER if ambiguity. `/final-q` at end of BUILDER section. `/audit` runs fresh post-BUILDER (WATCHDOG).

**Context files (every agent must Read at Phase 0 step A):**
- This plan file.
- `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md` v5 (parent — read §3, §4, §5, §7 in particular).
- `clients/encore/CLAUDE.md` (Encore-specific rules).
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-046, LR-048, LR-050).
- `.claude/rules/baseline.md` (LR-045).
- `.claude/rules/browser-tool.md` (LR-038 v2).
- `clients/encore/docs/REQUIREMENTS.md` (Shared Setup section — agent-extracted at Phase 0 step A).
- `clients/encore/docs/MODULE_REGISTRY.md` (Shared Setup entry).
- `clients/encore/specs_planning/_internal/bug-archetypes.md`.
- `clients/encore/specs_planning/_internal/field-inventory-spec.md`.

---

## Phase 0 (per agent) — Extract → Inventory → Gap-name → Update-upstream

Mandatory entry gate. Identical structure for HUNTER, GIVER, BUILDER. Each agent produces a dated intake artifact at `clients/encore/specs_planning/_internal/intake/shared-setup-<agent>-<YYYY-MM-DD>.md`.

**Step A — Extract.** Pull every existing artifact relevant to this agent's phase (per parent v5 §4 step A list). Include `relevance` score per artifact (HIGH/MEDIUM/LOW) so downstream phases can prioritize.

**Step B — Inventory.** Tabulate per-dimension knowledge with `investigated: YYYY-MM-DD` markers:

| Dimension | Per-field rows | Status |
|---|---|---|
| Default value | one row per field | known (<14d) / stale / missing |
| Allowed values / options | one row per field | known / stale / missing |
| Min/max/length limits | one row per field | known / stale / missing |
| Format restrictions | one row per field | known / stale / missing |
| State dependencies (gates other fields?) | one row per field | known / stale / missing |
| Validation dependencies (depends on other fields?) | one row per field | known / stale / missing |
| Visibility dependencies (shown when?) | one row per field | known / stale / missing |
| Save behavior (alone? combined?) | one row per field | known / stale / missing |

Dimensions <14 days old = SKIP. Older or missing = WORK this cycle.

**Step C — Gap-name.** Three buckets:
- (i) Missing-from-canonical-docs (live DOM shows behavior REQUIREMENTS/REGISTRY don't have).
- (ii) Stale-vs-live (artifact says X, live DOM says Y).
- (iii) Cross-artifact contradictions.

**Step D — Update-upstream.** Edit canonical artifacts inline as you discover. List every edit in the intake artifact's section D with: file path + section + before/after summary + reason.

**Intake artifact frontmatter** (required, parseable):
```yaml
---
module: shared-setup
agent: hunter | giver | builder
date: YYYY-MM-DD
parent_plan: plans/pending/PLAN_SHARED_SETUP_DQU.md
freshness_window_days: 14
upstream_updates_made: <count>
---
```

**Intake artifact gate**: Missing intake artifact at section start = HALT. WATCHDOG verifies all 3 intake files present in Phase 7.

---

## § HUNTER — extracted

Section body lives in [SUBPLAN_SHARED_SETUP_DQU_HUNTER.md](SUBPLAN_SHARED_SETUP_DQU_HUNTER.md). Identity: HUNTER. Phase 1a + 1b + 2 (Exploration). Acceptance gate to GIVER documented inline in the subplan. To execute: `/clear` then `/identity HUNTER` then `/execute SUBPLAN_SHARED_SETUP_DQU_HUNTER.md`.

---

## § GIVER — extracted

Section body lives in [SUBPLAN_SHARED_SETUP_DQU_GIVER.md](SUBPLAN_SHARED_SETUP_DQU_GIVER.md). Identity: GIVER. Phase 3 (archetype probe + ARCH-013/014 inline) + Phase 4 (Matrices A/B/C/D). Depends on HUNTER GREEN. Acceptance gate to BUILDER documented inline in the subplan. To execute: `/clear` then `/identity GIVER` then `/execute SUBPLAN_SHARED_SETUP_DQU_GIVER.md`.

---

## § BUILDER — extracted

Section body lives in [SUBPLAN_SHARED_SETUP_DQU_BUILDER.md](SUBPLAN_SHARED_SETUP_DQU_BUILDER.md). Identity: BUILDER. Phase 5 (gap-fill + fixes + page-objects + bug-regressions) + Phase 6 (determinism). Depends on GIVER GREEN. Acceptance gate to WATCHDOG documented inline in the subplan. To execute: `/clear` then `/identity BUILDER` then `/execute SUBPLAN_SHARED_SETUP_DQU_BUILDER.md`.

---

## § WATCHDOG — Phase 7 (fresh session per AUD-017)

**NOT a section of this plan file** — runs in a separate session after BUILDER closes. Invoked via:

```
/audit
```

with this plan + all 3 intake artifacts + all 4 matrices + `.reports/shared-setup-audit.json` + 3 fresh-run results as inputs.

WATCHDOG verdict GREEN = pilot template validated; Notes redo authoring unblocks; LM_HISTORY stub can be promoted to full plan; 10 frozen modules still frozen until Notes also passes GREEN.

WATCHDOG verdict YELLOW = template patches needed before Notes runs. Patches authored in v6 of parent plan; pilot may need re-execution.

WATCHDOG verdict RED = pilot fundamentally broken; pivot to v6 design before any downstream work.

### WATCHDOG Acceptance (this plan's closure gate)

- [ ] All 3 intake artifacts present and dated.
- [ ] All 4 matrices populated; zero unclassified cells.
- [ ] ARCH-013 + ARCH-014 present in `bug-archetypes.md` with scope + 6 probe steps each.
- [ ] REQUIREMENTS.md / MODULE_REGISTRY.md upstream updates verifiable via git diff.
- [ ] 3 fresh runs green for runnable subset.
- [ ] Bug-regression file present with correct annotations.
- [ ] Page-object diff honors raw-vs-persistent rule.
- [ ] HIST migration grep checks pass (if applicable).
- [ ] CSV regenerated.
- [ ] Activity-log rows from all 3 agents.
- [ ] `regression-guard` before/after diff clean.
- [ ] Verdict (GREEN / YELLOW / RED) recorded in this plan's Execution Summary.

---

## Acceptance Criteria (overall plan)

Each agent's section has its own Acceptance gate (above). Plan-level closure requires:

- [ ] HUNTER acceptance complete.
- [ ] GIVER acceptance complete.
- [ ] BUILDER acceptance complete.
- [ ] WATCHDOG verdict recorded; GREEN required to flip this plan to `plans/done/`.
- [ ] Execution Summary per LR-027 + parent v5 Phase 7 schema (passing / expected_fail / pending_confirmation; Matrix A/B/C/D breakdown; new TC counts cited by source; Phase 0 intake artifact list; upstream knowledge-base delta; HIST migration grep results; regression-guard diff; WATCHDOG verdict).
- [ ] On GREEN: this plan moves to `plans/done/`. **PARENT `PLAN_DQU_COVERAGE_REMEDIATION.md` STAYS IN `plans/pending/`** (13 child plans still incomplete: Notes + 10 modules + 2 HIST submodule plans).
- [ ] On YELLOW/RED: this plan stays in `plans/pending/`; v6 template patches required.

---

## What this plan explicitly DOES NOT do

- Does NOT author HIST tests in Shared Setup. HIST work lives in `PLAN_LM_HISTORY_COVERAGE.md` / `PLAN_LO_HISTORY_COVERAGE.md`.
- Does NOT skip Phase 0 intake on any of the 3 agents. Missing intake = HALT.
- Does NOT invoke HEALER pipeline. BUILDER 2-cycle fix budget; beyond = obstacle row in handoff.
- Does NOT thaw the 10 frozen Track A modules. Even on GREEN, only Notes redo unblocks; frozen modules require BOTH pilots GREEN.
- Does NOT regenerate CSV per TC. ONE regen after Phase 5d.
- Does NOT mark cells unclassified. Closure rule = zero unclassified across A/B/C/D.
- Does NOT skip cross-field section in Phase 1b field-inventory. Cross-field section is mandatory per parent v5.
- Does NOT close this plan on BUILDER's self-grade. WATCHDOG (different session, AUD-017) is the closure gate.

---

## Verification

- `clients/encore/specs_planning/_internal/intake/shared-setup-{hunter,giver,builder}-<date>.md` — 3 files present, dated, frontmatter parseable.
- `clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-<date>.md` — present, LR-045 schema.
- `clients/encore/specs_planning/_internal/field-inventories/shared-setup-<date>.md` — present, `field-inventory-spec.md` schema + cross-field section + archetype matrix + Matrices B/C/D appended.
- `clients/encore/specs_planning/_internal/bug-archetypes.md` — `## ARCH-013` + `## ARCH-014` present with scope + 6 steps.
- `clients/encore/docs/REQUIREMENTS.md` — git diff shows Shared Setup section additions if HUNTER made updates.
- `clients/encore/docs/MODULE_REGISTRY.md` — git diff shows Shared Setup entry updates if HUNTER made updates.
- `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_test_cases.md` — Matrix A table appended; new TCs from B/C/D gaps appended with source citations.
- `clients/encore/exports/locations_shared_setup_test_cases.csv` — regenerated once; row count matches TC count.
- `clients/encore/tests/specs/setup/locations/shared-setup-bug-regressions.spec.ts` — present if BUGs filed.
- `clients/encore/src/pages/setup/locations/shared-setup*.page.ts` — git diff shows raw-method preservation + persistent variant additions.
- `npx playwright test --grep "@shared-setup" --retries=0` — 3 consecutive runs green for runnable subset.
- `clients/encore/specs_planning/_internal/agent-activity-log.md` — 3 rows added (one per agent + WATCHDOG).
- `find clients/encore/tests/specs -name "*hist-*.spec.ts"` — ZERO matches (no per-module HIST spec leaked).
- `find clients/encore/tests/specs -name "*-history.spec.ts"` — EXACTLY 2 files (canonical HIST specs only).

---

## Execution Summary (filled at plan close)

```
Phase 6 run counts:
- passing: <X>
- expected_fail (test.fail, bug-regression): <Y>    open BUG IDs: BUG-LOC-SHR-...
- pending_confirmation (test.fixme): <Z>            open questions: <list>
- total runnable: <X + Y + Z>

TC delta:
- KEEP: <count>
- FIX: <count> -- TC IDs
- DELETION-CANDIDATE: <count> -- TC IDs + reasons
- MIGRATE-TO-HISTORY-PLAN: <count> -- TC IDs (if any)
- new TCs from Matrix B gaps: <count>
- new TCs from Matrix C gaps: <count>
- new TCs from Matrix D gaps: <count>
- CSV regenerated: yes -- clients/encore/exports/locations_shared_setup_test_cases.csv

Matrix breakdown:
- Matrix A rows: <count>
- Matrix B cells: <fields x 14>; COVERED/GAP/N/A/BLOCKED/NOT-AUTOMATABLE counts
- Matrix C cells: <rules+jira+bugs>; COVERED/GAP/NOT-IN-SCOPE/NO-REQUIREMENT/BLOCKED counts
- Matrix D cells: <pairs x 6 sub-dimensions>; COVERED/GAP/N/A-INDEPENDENT counts
- unclassified: 0

Phase 0 intake artifacts:
- HUNTER: intake/shared-setup-hunter-<date>.md
- GIVER: intake/shared-setup-giver-<date>.md
- BUILDER: intake/shared-setup-builder-<date>.md

Upstream knowledge-base delta:
- REQUIREMENTS.md sections added: <count>
- MODULE_REGISTRY.md entries added: <count>
- bug-archetypes.md archetypes added: 2 (ARCH-013, ARCH-014)
- catalog rows added: <count>
- field-inventory dimensions added: <count>

HIST migration check (if applicable):
- HIST TCs in source-module files: 0
- HIST TCs in history-submodule files: <N>
- per-module HIST spec files deleted: <list>

Bugs filed / closed / re-verified per LR-044.
LR-040 closure: every planned item classified (a)/(b)/(c).

WATCHDOG verdict: <GREEN / YELLOW / RED>
WATCHDOG session ID: <session-id from fresh /audit>
WATCHDOG report: <path to /audit output if persisted>
```

---

## Handoff (chat-only per LR-039)

Each agent ends its section with one-line handoff in chat: outcomes only, no obstacle/blocker prose. If a true blocker occurred (auth refresh, network down, undeniable HALT condition), surface immediately to user and HALT — do NOT proceed.

Section-to-section: `/clear` + `/identity <next>` is the boundary. No state passed in-session; only files (intake artifacts, baselines, inventories, matrices, specs) carry state.

Plan-to-plan: this pilot's WATCHDOG verdict unlocks Notes redo authoring. Notes redo authoring is OWNER's task (you), not this pilot's task.

---

## Cross-references

- Parent plan: [PLAN_DQU_COVERAGE_REMEDIATION.md](PLAN_DQU_COVERAGE_REMEDIATION.md) — §3 (3-agent routing), §4 (Phase 0 intake), §5 Phase 4 (4 matrices), §7 (pilots-only scope + parent persistence).
- Pipeline rules: `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-046, LR-048, LR-050).
- Baseline rule: `.claude/rules/baseline.md` (LR-045).
- Browser tool: `.claude/rules/browser-tool.md` (LR-038 v2 — CLI default).
- Archetypes: `clients/encore/specs_planning/_internal/bug-archetypes.md` (ARCH-001..012 today; ARCH-013/014 authored by GIVER section of this plan).
- Field-inventory schema: `clients/encore/specs_planning/_internal/field-inventory-spec.md`.
- AUD-017: WATCHDOG runs in different session from BUILDER per agent-mistakes catalog.
