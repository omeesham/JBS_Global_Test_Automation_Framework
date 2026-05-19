# SUBPLAN_SHARED_SETUP_DQU_GIVER — Shared Setup DQU pilot, § GIVER (archetype probe + ARCH-013/014 inline + Matrices A/B/C/D)

**Status**: SUPERSEDED
**Superseded-By**: PLAN_DQU_V6.md → PLAN_DQU_V6_PILOT_SHARED_SETUP.md (2026-05-12)
**Priority**: P0-EMERGENCY
**Created**: 2026-05-12
**Identity**: GIVER
**Parent**: PLAN_SHARED_SETUP_DQU.md
**Depends on**: SUBPLAN_SHARED_SETUP_DQU_HUNTER.md (HUNTER acceptance gate complete; intake + baseline + field-inventory + cross-field section + Phase-2 diff dispositioned)
**Blocks**: SUBPLAN_SHARED_SETUP_DQU_BUILDER.md
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a (single tool — cli for Phase 3 archetype probe + targeted live verifications)

---

## Context

This is the GIVER section of `PLAN_SHARED_SETUP_DQU` (Track A Pilot #1), split into its own subplan file on 2026-05-12 per user authorization. The parent plan retains overall pilot context, plan-level acceptance criteria, WATCHDOG end-cap, and Execution Summary; this file holds the executable § GIVER body and runs as its own session.

GIVER's pilot-unique role: this is the **only** pilot that authors NEW archetypes inline. **ARCH-013 (save-cycle state machine)** + **ARCH-014 (cross-field-interaction)** get authored into `clients/encore/specs_planning/_internal/bug-archetypes.md` during Phase 3 — shapes derived from real Shared Setup UI exploration HUNTER surfaced, not guessed upfront. Downstream modules (Notes redo + 10 frozen Track A + Track B HIST) inherit these archetypes; if the pilot ships broken archetypes, every downstream module copies the bug. Closure-rule strictness reflects that risk: zero unclassified cells across Matrices A/B/C/D.

Provenance: split from `plans/pending/PLAN_SHARED_SETUP_DQU.md` (v1, lines 142–211) on 2026-05-12; parent body has SPLIT NOTICE pointing here.

---

## Bootstrap

**Identity**: GIVER (load via `/identity GIVER` at session start — fresh session per parent plan's section-boundary clause `/clear` + `/identity GIVER`)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/regression-guard` (wrap edits to `bug-archetypes.md` + field-inventory append + intake artifact)
- `/find-bugs` (available during Phase 3 archetype probe)
- `/encore-questions` (queue user questions if ambiguity surfaces during Phase 4 cell classification)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files** (Read at Phase 0 step A):
- `plans/pending/PLAN_SHARED_SETUP_DQU.md` (parent)
- `plans/pending/SUBPLAN_SHARED_SETUP_DQU_HUNTER.md` (predecessor, for handoff outcomes)
- `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md` v5 (grandparent — §5 Phase 4 four-matrix schema, Phase 7 execution summary template)
- HUNTER's outputs:
  - `clients/encore/specs_planning/_internal/intake/shared-setup-hunter-2026-05-12.md`
  - `clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-2026-05-12.md`
  - `clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md`
  - Any `reports/bugs/BUG-LOC-SHR-*.json` filed by HUNTER
- `clients/encore/CLAUDE.md` (Encore-specific rules)
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-046, LR-048, LR-050)
- `.claude/rules/baseline.md` (LR-045)
- `.claude/rules/browser-tool.md` (LR-038 v2)
- `clients/encore/specs_planning/_internal/bug-archetypes.md` (ARCH-001..012 standing; ARCH-013/014 authored this phase)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md`
- `clients/encore/docs/REQUIREMENTS.md` (Shared Setup section — for Matrix C)
- `clients/encore/docs/MODULE_REGISTRY.md`
- `.claude/context/navigation.md`
- `clients/encore/specs_planning/_internal/agent-mistakes.md` (filter GIVER → PLN-* / ALL-*)

---

## Phase 0 — Per-agent intake (Extract → Inventory → Gap-name → Update-upstream)

Mandatory entry gate per parent plan's shared Phase 0 contract. Output: `clients/encore/specs_planning/_internal/intake/shared-setup-giver-2026-05-12.md`.

**Step A — Extract.** Pull HUNTER's outputs (intake + baseline + field-inventory + bug filings) + bug-archetypes.md + REQUIREMENTS Shared Setup + MODULE_REGISTRY Shared Setup + every Jira ticket tagged Shared Setup + every `BUG-*.json` with module tag. Tag relevance HIGH/MEDIUM/LOW.

**Step B — Inventory.** Tabulate per-dimension knowledge with `investigated: YYYY-MM-DD` markers. Skip-known threshold: 14 days.

**Step C — Gap-name.** Three buckets — (i) missing-from-canonical-docs, (ii) stale-vs-live, (iii) cross-artifact contradictions.

**Step D — Update-upstream.** Edit canonical artifacts INLINE. List every edit (path + section + before/after summary + reason).

**Intake artifact frontmatter** (required, parseable):
```yaml
---
module: shared-setup
agent: giver
date: 2026-05-12
parent_plan: plans/pending/PLAN_SHARED_SETUP_DQU.md
parent_subplan: plans/pending/SUBPLAN_SHARED_SETUP_DQU_GIVER.md
freshness_window_days: 14
upstream_updates_made: <count>
---
```

**Intake artifact gate**: Missing intake artifact at section start = HALT.

**Browser-tool announcement** (LR-038 v2): emit `Browser tool: Playwright CLI. Reason: archetype probe steps + Matrix-D cross-field live verification, unattended.`

---

## Phase 3 — Archetype probe + author ARCH-013 / ARCH-014

Run all standing archetypes ARCH-001..012 against Shared Setup per `bug-archetypes.md` probe steps. Record outcome per archetype × field cell.

**Inline archetype authoring** (pilot-unique — only pilot that authors new archetypes):

### ARCH-013 — save-cycle state machine

Probe steps (6):
1. Dirty-state preserved across tab switch within page (modify field A, navigate to tab X, return to tab containing field A, verify content preserved).
2. Save-then-discard rolls back to last saved value (modify, click Cancel/Discard, verify reset).
3. Save-then-reload persists server-side (modify, save, reload page, verify content present).
4. Save-then-navigate-away-without-saving + return + verify state (modify, click another route, "Unsaved changes — leave?" dialog, click Leave, return, verify discarded).
5. Sequential-save (save A, then save B without reload) → HIST gains 2 rows not 1.
6. Cross-tab save isolation (modify in tab 1, save in tab 1, switch to tab 2 — verify tab 2 unaffected unless explicitly cross-linked).

### ARCH-014 — cross-field-interaction

Probe steps (6):
1. State dependency: change field A, observe whether field B's enabled/disabled state changes correctly.
2. Validation dependency: change field A to invalid value, observe whether field B's validity / Save-button-disabled state propagates.
3. Conditional visibility: change field A, observe whether field B appears/disappears.
4. Limit dependency: change field A (a quantity/range), observe whether field B's max/min updates.
5. Cascading options: change parent dropdown A, observe child dropdown B's option list updates.
6. Save combinations: modify A + B + C together, save, verify HIST shows correct combined row (all 3 values present, none dropped).

**Author both archetypes** into `clients/encore/specs_planning/_internal/bug-archetypes.md` with `## ARCH-013` and `## ARCH-014` headers + scope description + 6-step probe per archetype. Update intake section D with the addition.

Append coverage matrix (field × archetype, including ARCH-013/014) to the field-inventory artifact's archetype section.

---

## Phase 4 — Matrices A / B / C / D (mandatory all four)

**One suite run, NOT N greps** (per grandparent v5):
```bash
npx playwright test --grep "@shared-setup" --retries=0 --reporter=json > .reports/shared-setup-audit.json
```
(If `@shared-setup` tag doesn't exist yet because no specs are tagged → run all setup-locations specs and filter manually; document gap + add tag in BUILDER subplan.)

### Matrix A — Existing TC Quality

Every existing functional Shared Setup TC = one row. Cite spec file:line. Assign Action per grandparent v5 §5 Phase 4: KEEP / FIX / DELETE / MIGRATE-TO-HISTORY-PLAN.

### Matrix B — Field × Archetype (12 standing + 2 new = 14 columns)

Rows = every field from HUNTER's inventory. Cells: `COVERED-TC` (cite TC ID) / `GAP` (becomes new TC in BUILDER) / `N/A` (cite archetype scope or field-type) / `BLOCKED-BY-BUG` (cite BUG ID) / `NOT-AUTOMATABLE` (cite reason).

### Matrix C — Requirements-to-Coverage Trace

Rows = every business rule in `clients/encore/docs/REQUIREMENTS.md` Shared Setup section + every open Jira ticket tagged Shared Setup + every `BUG-*.json` with module tag. Cells: `COVERED-TC` / `GAP` / `NOT-IN-SCOPE-FOR-MODULE` / `NO-REQUIREMENT` (cite HUNTER-update ref) / `BLOCKED-BY-BUG`.

### Matrix D — Cross-Field Interactions (6 sub-matrices D1..D6)

Rows per sub-matrix per grandparent v5 §5 Phase 4 table. Cells: `COVERED-TC` / `GAP` / `N/A-INDEPENDENT` (one-line justification). D1..D6 = state-dep / validation-dep / visibility-dep / limit-dep / cascading-options / save-combinations — same vocabulary as HUNTER's cross-field section.

**Closure rule**: zero unclassified cells across A / B / C / D. Non-zero = HALT and ask user. "No gaps found" is valid only when every cell is classified non-GAP.

Persist matrices to BOTH `clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md` (append) AND `intake/shared-setup-giver-2026-05-12.md` section.

Upstream updates this phase (per intake step D): bug-archetypes.md additions (ARCH-013/014); cross-field interaction catalog under `clients/encore/specs_planning/catalogs/` if such organization helps downstream modules (GIVER decides during the work).

---

## Phase 2.5 — Adjacent-Sweep (MANDATORY)

For every adjacent fix noticed during Phase 3 / 4 that is (same identity = GIVER) + (same module = Shared Setup) + (5–30 min) + (no user input needed), pick exactly one of DO-NOW / SPAWN / APPEND with grep verification per parent line 287–290 (Phase 2.5 ritual). Bare "out of scope" with no recipient = HALT + ask user (LR-040 + LR-046).

---

## Acceptance criteria (gate to BUILDER; LR-040 closure)

- [ ] Phase 0 intake artifact present at `clients/encore/specs_planning/_internal/intake/shared-setup-giver-2026-05-12.md`.
- [ ] `bug-archetypes.md` has `## ARCH-013` + `## ARCH-014` with scope + 6 probe steps each.
- [ ] Phase 3 archetype coverage matrix appended to field-inventory artifact.
- [ ] Matrix A populated (one row per functional TC); JSON suite run cited at `.reports/shared-setup-audit.json`.
- [ ] Matrix B populated (every cell classified; N/A cells cite archetype scope or field-type).
- [ ] Matrix C populated (every cell classified; NO-REQUIREMENT cells cite HUNTER's upstream-update ref).
- [ ] Matrix D populated (D1..D6; every cell classified; N/A-INDEPENDENT cells cite one-line justification).
- [ ] LR-040 classification: every enumerated item (TC, field, requirement, sub-dimension) classified (a) MCP-proven / (b) grep-verifiable line in named recipient subplan / (c) user-flagged with named bug-ID or discussion-item flag.
- [ ] LR-046 strict-line audit: if any Matrix closure required `zero unclassified` and a non-zero remainder remains, HALT — do not APPEND-and-close.
- [ ] Matrices stored in field-inventory artifact + intake artifact (both locations).
- [ ] Upstream updates listed in intake section D (count + paths).
- [ ] Open questions for Phase 5b `test.fixme()` annotations queued via `/encore-questions` (if any).
- [ ] Phase 2.5 Adjacent-Sweep: every adjacent item dispositioned.
- [ ] Handoff chat-only per LR-039 (outcomes only).
- [ ] Activity-log row per LR-028 with LR-037 timestamp gate.
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched tracked files.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042 v2 evidence-emission.

---

## Verification

```bash
# Intake artifact present
ls clients/encore/specs_planning/_internal/intake/shared-setup-giver-2026-05-12.md

# ARCH-013 + ARCH-014 authored
grep -E "^## ARCH-01[34] " clients/encore/specs_planning/_internal/bug-archetypes.md

# Matrices A/B/C/D appended to field-inventory
grep -E "^##? Matrix [ABCD]" clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md

# JSON suite run artifact present
ls .reports/shared-setup-audit.json

# Zero unclassified cells (LR-046 strict-line check; this grep must return 0)
grep -c "unclassified\|TBD\|TODO\|<fill>" clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md

# Activity-log row
tail -5 clients/encore/specs_planning/_internal/agent-activity-log.md
```

---

## Handoff (post-execution)

Chat-only per `feedback_handoff_in_chat_only.md` + LR-039. One paragraph stating outcomes: ARCH-013/014 authored, Matrix A/B/C/D cell counts per disposition class, new TC count needed (from Matrix B/C/D GAP cells), upstream updates count, `/encore-questions` queued count. No obstacle / blocker prose. True blockers (auth refresh, network down) → surface to user and HALT.

BUILDER inherits state via files only — intake + matrices in inventory + ARCH-013/014 in archetypes + JSON suite run + `BUG-LOC-SHR-*.json` set + REQUIREMENTS/REGISTRY git diff. No in-session state crosses sections.
