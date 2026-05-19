# SUBPLAN_SHARED_SETUP_DQU_BUILDER — Shared Setup DQU pilot, § BUILDER (gap-fill TCs + fixes + page-objects + bug-regressions + determinism)

**Status**: SUPERSEDED
**Superseded-By**: PLAN_DQU_V6.md → PLAN_DQU_V6_PILOT_SHARED_SETUP.md (2026-05-12)
**Priority**: P0-EMERGENCY
**Created**: 2026-05-12
**Identity**: BUILDER
**Parent**: PLAN_SHARED_SETUP_DQU.md
**Depends on**: SUBPLAN_SHARED_SETUP_DQU_GIVER.md (GIVER acceptance gate complete; ARCH-013/014 authored + Matrices A/B/C/D fully classified + zero unclassified cells)
**Blocks**: WATCHDOG (fresh `/audit` session — closure gate of parent plan; not a subplan file per AUD-017)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**BrowserToolJustification**: n/a (BUILDER uses `@playwright/test` runner for spec execution; no exploratory browser interaction. If a spec author needs MCP verification of a single selector mid-authoring, log a `[BROWSER-SWITCH] from=none to=cli reason=<one-line>` row per browser-tool.md mid-subplan-switch protocol.)

---

## Context

This is the BUILDER section of `PLAN_SHARED_SETUP_DQU` (Track A Pilot #1), split into its own subplan file on 2026-05-12 per user authorization. The parent plan retains overall pilot context, plan-level acceptance criteria, WATCHDOG end-cap, and Execution Summary; this file holds the executable § BUILDER body and runs as its own session.

BUILDER's role: convert GIVER's Matrix-classified gaps into runnable spec coverage + fix Matrix-A FIX rows + author bug-regression specs for HUNTER's filed `BUG-LOC-SHR-*` + apply page-object honesty rules + demonstrate 3-consecutive-fresh-run determinism. No exploration, no archetype authoring (those closed in HUNTER + GIVER). HEALER pipeline is NOT invoked — BUILDER carries a 2-cycle fix budget; beyond that surfaces obstacle row per parent plan line 266.

Provenance: split from `plans/pending/PLAN_SHARED_SETUP_DQU.md` (v1, lines 213–286) on 2026-05-12; parent body has SPLIT NOTICE pointing here.

---

## Bootstrap

**Identity**: BUILDER (load via `/identity BUILDER` at session start — fresh session per parent plan's section-boundary clause `/clear` + `/identity BUILDER`)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/regression-guard` (wrap Phase 5 spec + page-object edits per parent plan line 268)
- `/encore-questions` (Phase 5b `test.fixme()` annotations cite this skill's queue)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files** (Read at Phase 0 step A):
- `plans/pending/PLAN_SHARED_SETUP_DQU.md` (parent)
- `plans/pending/SUBPLAN_SHARED_SETUP_DQU_HUNTER.md` (predecessor — for bug filings + REQUIREMENTS upstreams)
- `plans/pending/SUBPLAN_SHARED_SETUP_DQU_GIVER.md` (predecessor — for matrices + archetypes)
- GIVER's outputs:
  - `clients/encore/specs_planning/_internal/intake/shared-setup-giver-2026-05-12.md` (matrices)
  - `clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md` (matrices appended)
  - `clients/encore/specs_planning/_internal/bug-archetypes.md` (ARCH-013/014 newly authored)
  - `.reports/shared-setup-audit.json` (suite-run baseline)
- HUNTER's outputs:
  - `clients/encore/specs_planning/_internal/intake/shared-setup-hunter-2026-05-12.md`
  - `clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-2026-05-12.md`
  - `reports/bugs/BUG-LOC-SHR-*.json`
- Existing Shared Setup page objects + specs (discover via Glob: `clients/encore/src/pages/setup/locations/shared-setup*.page.ts` + `clients/encore/tests/specs/setup/locations/*shared*setup*.spec.ts`)
- `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_test_cases.md`
- `clients/encore/exports/locations_shared_setup_test_cases.csv`
- `clients/encore/CLAUDE.md`
- `.claude/rules/pipeline.md` (LR-018, LR-024, LR-027, LR-028, LR-040, LR-046, LR-048)
- `.claude/rules/specs.md` (LR-018, LR-019, LR-024, LR-026, dependency-gate annotation note)
- `.claude/rules/angular.md` (LR-009, LR-010, LR-026)
- `.claude/rules/data.md` (LR-001..006)
- `.claude/rules/inventory.md` (LR-007)
- `.claude/context/navigation.md` (R00, §B routing — Angular save/dialog helpers, Radix retry per LR-025)
- `clients/encore/specs_planning/_internal/agent-mistakes.md` (filter BUILDER → GEN-* / ALL-*; GEN-034 mandatory)

---

## Phase 0 — Per-agent intake (Extract → Inventory → Gap-name → Update-upstream)

Mandatory entry gate. Output: `clients/encore/specs_planning/_internal/intake/shared-setup-builder-2026-05-12.md`.

**Step A — Extract.** GIVER's intake + matrices A/B/C/D + page-object library + spec patterns + HUNTER's bug filings + REQUIREMENTS/REGISTRY upstreams. Tag relevance HIGH/MEDIUM/LOW.

**Step B — Inventory.** Tabulate per-page-object + per-spec status with `investigated: YYYY-MM-DD` markers. Skip-known threshold: 14 days.

**Step C — Gap-name.** Three buckets — (i) missing page-object helper, (ii) stale page-object API, (iii) cross-spec inconsistency.

**Step D — Update-upstream.** Edit canonical artifacts INLINE (REQUIREMENTS.md if Matrix C surfaced a NO-REQUIREMENT gap GIVER scoped to BUILDER, page-object library shared helpers if discovered reusable patterns). List every edit.

**Intake artifact frontmatter** (required, parseable):
```yaml
---
module: shared-setup
agent: builder
date: 2026-05-12
parent_plan: plans/pending/PLAN_SHARED_SETUP_DQU.md
parent_subplan: plans/pending/SUBPLAN_SHARED_SETUP_DQU_BUILDER.md
freshness_window_days: 14
upstream_updates_made: <count>
---
```

**Intake artifact gate**: Missing intake artifact at section start = HALT.

**Browser-tool announcement** (LR-038 v2): emit `Browser tool: none. Reason: @playwright/test runner for spec execution; no exploratory browser interaction.`

---

## Phase 5a — Fix FIX-action TCs

Per Matrix A's FIX rows from GIVER: replace weak assertions with exact values, remove tautologies, replace private-access (`page['_helper']`) with public methods, replace boolean-collapse with array `.toContain` for rich diff. Diff cites TC IDs.

## Phase 5b — Bug-regression specs (NEW file)

Discover existing path via Glob: `clients/encore/tests/specs/setup/locations/shared-setup-*.spec.ts`. Author NEW file `clients/encore/tests/specs/setup/locations/shared-setup-bug-regressions.spec.ts` (or appropriate path if structure differs).

For every `BUG-LOC-SHR-*.json` filed in HUNTER Phase 2:
- Bug reliably reproduces + product contract clear → `test.fail()` with `// BUG-LOC-SHR-NNN -- expected to pass once app fixed`.
- Bug observed + contract pending → `test.fixme()` with `// pending /encore-questions confirmation: <question>`.
- Bug intermittent → `test.fixme()` with intermittency note.

## Phase 5c — Page-object work

Read existing Shared Setup page objects via Glob (`clients/encore/src/pages/setup/locations/shared-setup*.page.ts` or similar). Apply API-honesty rule per grandparent v5 §5 Phase 5c:
- Raw methods stay raw (no silent dialog-handling injected into `fillX()`).
- Cleanup paths get explicitly-named persistent variants (`fillXAndSave`, `fillXAndConfirmDialog`).
- Private-API leaks replaced with public methods.

Update shared helpers in `clients/encore/src/pages/setup/` if BUILDER discovers reusable patterns. List in intake section D.

## Phase 5d — Author every GAP cell

Every cell of Matrix B / C / D with value `GAP -- new TC needed` becomes:
- New TC entry in `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_test_cases.md` with next `TC-LOC-SHR-NNN`. Cite source per cell:
  - Matrix B GAP → cite `ARCH-NNN + field name`.
  - Matrix C GAP → cite `REQUIREMENTS.md §X.Y / Jira-NNN / BUG-LOC-SHR-NNN`.
  - Matrix D GAP → cite `sub-dimension D1..D6 + field pair`.
- New spec test in the module's existing spec file (or `shared-setup-gaps.spec.ts` if main is closed for size).
- CSV row in `clients/encore/exports/locations_shared_setup_test_cases.csv` — regenerated ONCE after all TCs added (NOT per-TC; parent plan line 247).

## Phase 5e — HIST migration (if applicable)

If `locations_shared_setup_test_cases.md` contains HIST TCs OR if any per-module HIST spec exists for Shared Setup:
- Move TCs to `locations_management_history_test_cases.md` or `local_office_history_test_cases.md` as appropriate.
- Move spec bodies to `location-management-history.spec.ts` or `local-office-history.spec.ts` in a `@shared-setup-cols-NN..MM` describe block.
- Delete the per-module HIST spec file.
- Grep-verify per parent line 363–364:
  - `find clients/encore/tests/specs -name "*hist-*.spec.ts"` → 0 matches.
  - `find clients/encore/tests/specs -name "*-history.spec.ts"` → exactly 2 files.

## Phase 6 — Determinism (BUILDER self-runs)

Run 3 consecutive fresh times:
```bash
npx playwright test --grep "@shared-setup" --retries=0
```

All non-bug-regression tests pass each run. `test.fail()` continues to fail (expected); `test.fixme()` stays skipped. Per LR-018 + LR-024.

**BUILDER 2-cycle fix budget** (parent plan line 266): if any test fails twice after BUILDER's fix attempts, surface as obstacle row in this subplan's Handoff. Do NOT auto-skip. Do NOT auto-fail to HEALER pipeline. User decides.

`/regression-guard` snapshots before + after BUILDER's spec/page-object edits.

---

## Phase 2.5 — Adjacent-Sweep (MANDATORY)

For every adjacent fix noticed during Phase 5 / 6 that is (same identity = BUILDER) + (same file/module) + (5–30 min) + (no user input needed), pick exactly one of DO-NOW / SPAWN / APPEND with grep verification per parent Phase 2.5 ritual. Bare "out of scope" with no recipient = HALT + ask user (LR-040 + LR-046).

---

## Acceptance criteria (gate to WATCHDOG; LR-040 closure)

- [ ] Phase 0 intake artifact present at `clients/encore/specs_planning/_internal/intake/shared-setup-builder-2026-05-12.md`.
- [ ] Phase 5a fixes applied; diff cites TC IDs.
- [ ] Phase 5b bug-regression file present; one test per `BUG-LOC-SHR-*.json` (or zero tests if zero bugs filed by HUNTER — document that explicitly).
- [ ] Phase 5c page-object diff: raw methods preserved; persistent variants added with self-describing names; private-access leaks replaced.
- [ ] Phase 5d: EVERY Matrix B + C + D GAP cell authored as TC + CSV row + spec. Cite source per cell.
- [ ] Phase 5e: HIST migration grep-verified clean (if applicable); otherwise document "no HIST artifacts to migrate".
- [ ] CSV regenerated ONCE; path cited; row count matches TC count.
- [ ] Phase 6: 3 consecutive fresh runs green for runnable subset; counts cited (passing / expected_fail / pending_confirmation).
- [ ] LR-046 strict-line audit: every "every GAP cell authored" / "3 consecutive fresh runs green" / "zero HIST leftover" line met exactly; non-zero remainder = HALT, not APPEND-and-close.
- [ ] `/regression-guard` before/after diff present.
- [ ] Upstream updates listed in intake section D.
- [ ] Phase 2.5 Adjacent-Sweep: every adjacent item dispositioned.
- [ ] Handoff chat-only per LR-039.
- [ ] Activity-log row per LR-028 with LR-037 timestamp gate.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042 v2 evidence-emission.

---

## Verification

```bash
# Intake artifact present
ls clients/encore/specs_planning/_internal/intake/shared-setup-builder-2026-05-12.md

# Bug-regression spec present (if HUNTER filed any bugs)
ls clients/encore/tests/specs/setup/locations/shared-setup-bug-regressions.spec.ts 2>/dev/null

# New TCs added (count should match Matrix B/C/D GAP cell total)
grep -c "^TC-LOC-SHR-" clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_test_cases.md

# CSV regenerated; row count matches
wc -l clients/encore/exports/locations_shared_setup_test_cases.csv

# 3 consecutive fresh runs (run manually; capture exit codes)
npx playwright test --grep "@shared-setup" --retries=0; echo "RUN1=$?"
npx playwright test --grep "@shared-setup" --retries=0; echo "RUN2=$?"
npx playwright test --grep "@shared-setup" --retries=0; echo "RUN3=$?"

# HIST migration grep checks (if applicable)
find clients/encore/tests/specs -name "*hist-*.spec.ts"          # expect: zero
find clients/encore/tests/specs -name "*-history.spec.ts"        # expect: 2 files

# Activity-log row
tail -5 clients/encore/specs_planning/_internal/agent-activity-log.md
```

---

## Handoff (post-execution)

Chat-only per `feedback_handoff_in_chat_only.md` + LR-039. One paragraph stating outcomes: Phase 6 run counts (passing / expected_fail / pending_confirmation), new TC count by source matrix (B/C/D), CSV path, page-object diff summary, HIST migration result. Obstacle rows allowed ONLY for genuine 2-cycle-budget failures (parent plan line 266) — surface as plain rows, not as blocker prose.

WATCHDOG (parent plan § WATCHDOG — fresh `/audit` session, not a subplan file per AUD-017) inherits state via:
- All 3 intake artifacts (HUNTER + GIVER + BUILDER).
- Baseline + field-inventory + matrices.
- ARCH-013/014 in archetypes.
- Bug-regression spec + filed `BUG-LOC-SHR-*.json`.
- `.reports/shared-setup-audit.json` + 3 fresh-run exit codes.
- `regression-guard` before/after diff.
- REQUIREMENTS / REGISTRY git diff.

WATCHDOG records GREEN / YELLOW / RED into the parent plan's Execution Summary. GREEN flips parent to `plans/done/`; YELLOW/RED holds parent in `plans/pending/`.
