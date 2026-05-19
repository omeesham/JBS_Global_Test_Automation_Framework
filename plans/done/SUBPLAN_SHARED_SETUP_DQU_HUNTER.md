# SUBPLAN_SHARED_SETUP_DQU_HUNTER — Shared Setup DQU pilot, § HUNTER (Exploration: nav2 baseline + e2e walk + diff)

**Status**: SUPERSEDED
**Superseded-By**: PLAN_DQU_V6.md → PLAN_DQU_V6_PILOT_SHARED_SETUP.md (2026-05-12)
**Priority**: P0-EMERGENCY
**Created**: 2026-05-12
**Identity**: HUNTER
**Parent**: PLAN_SHARED_SETUP_DQU.md
**Depends on**: none (parent plan verified `intake/` dir present + 32 HIST plans physically in `plans/done/` at split time 2026-05-12)
**Blocks**: SUBPLAN_SHARED_SETUP_DQU_GIVER.md
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a (single tool — cli for unattended nav2 + e2e walks)

---

## Context

This is the HUNTER section of `PLAN_SHARED_SETUP_DQU` (Track A Pilot #1 — 3-Agent Routed), split into its own subplan file on 2026-05-12 per user authorization. The parent plan retains overall pilot context, plan-level acceptance criteria, WATCHDOG end-cap, and Execution Summary; this file holds the executable § HUNTER body and runs as its own session.

Pilot rationale (from parent): Shared Setup is multi-field — first pilot for v5 3-agent DQU template. Stress-tests Matrix D (Cross-Field Interactions). If Matrix D template has a bug, we discover it here BEFORE Notes (1-field) inherits it and BEFORE 10 frozen Track A modules thaw + copy it 10×. HUNTER's job in the pilot is exploration only — baseline + inventory + Nav2-vs-E2E diff. No matrices, no archetypes, no specs (those are GIVER + BUILDER).

Provenance: split from `plans/pending/PLAN_SHARED_SETUP_DQU.md` (v1, lines 94–140) on 2026-05-12; parent body has SPLIT NOTICE pointing here.

---

## Bootstrap

**Identity**: HUNTER (load via `/identity HUNTER` at session start — this is a fresh session per parent plan's section-boundary clause `/clear` + `/identity HUNTER`)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/regression-guard` (wrap any artifact writes that touch tracked files outside `_internal/intake/`, `_internal/old-site-baseline/`, `_internal/field-inventories/`)
- `/find-bugs` (available during Phase 1a / 1b / 2 for nav2-vs-e2e divergence triage)
- `/encore-questions` (queue user questions if ambiguity surfaces)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files** (Read at Phase 0 step A):
- `plans/pending/PLAN_SHARED_SETUP_DQU.md` (parent — Context, Bootstrap, Acceptance, Verification, Execution Summary frame)
- `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md` v5 (grandparent — §3 routing, §4 Phase 0 intake, §5 Phase 1b cross-field mandate, §7 pilots-only scope)
- `clients/encore/CLAUDE.md` (Encore-specific rules, LR-ENC-* + LR-008/012/017/036)
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-046, LR-048, LR-050)
- `.claude/rules/baseline.md` (LR-045 — old-site-baseline artifact schema)
- `.claude/rules/browser-tool.md` (LR-038 v2 — CLI default)
- `clients/encore/docs/REQUIREMENTS.md` (Shared Setup section — extract during Phase 0 step A)
- `clients/encore/docs/MODULE_REGISTRY.md` (Shared Setup entry)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md`
- `clients/encore/specs_planning/_internal/bug-archetypes.md` (read for archetype probe vocabulary; ARCH-013/014 not yet authored — that's GIVER)
- `.claude/context/navigation.md` (R00 — §C Exploration Registry for Shared Setup; §B routing for live-DOM walks)
- `clients/encore/specs_planning/_internal/agent-mistakes.md` (filter HUNTER → REQ-* / ALL-*)
- `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` (reference baseline-artifact)

---

## Phase 0 — Per-agent intake (Extract → Inventory → Gap-name → Update-upstream)

Mandatory entry gate per parent plan's shared Phase 0 contract. Output: `clients/encore/specs_planning/_internal/intake/shared-setup-hunter-2026-05-12.md`.

**Step A — Extract.** Pull every existing artifact relevant to HUNTER's phase (baseline + field inventory + REQUIREMENTS Shared Setup + MODULE_REGISTRY Shared Setup + relevant bug-archetypes + open `BUG-LOC-SHR-*.json` if any). Tag each with `relevance: HIGH | MEDIUM | LOW`.

**Step B — Inventory.** Tabulate per-dimension knowledge with `investigated: YYYY-MM-DD` markers (Default / Allowed values / Min/max/length / Format / State-dep / Validation-dep / Visibility-dep / Save-behavior). Dimensions <14 days old = SKIP. Older or missing = WORK this cycle.

**Step C — Gap-name.** Three buckets — (i) missing-from-canonical-docs, (ii) stale-vs-live, (iii) cross-artifact contradictions.

**Step D — Update-upstream.** Edit canonical artifacts INLINE as you discover (REQUIREMENTS.md, MODULE_REGISTRY.md). List every edit in intake artifact section D with file path + section + before/after summary + reason.

**Intake artifact frontmatter** (required, parseable):
```yaml
---
module: shared-setup
agent: hunter
date: 2026-05-12
parent_plan: plans/pending/PLAN_SHARED_SETUP_DQU.md
parent_subplan: plans/pending/SUBPLAN_SHARED_SETUP_DQU_HUNTER.md
freshness_window_days: 14
upstream_updates_made: <count>
---
```

**Intake artifact gate**: Missing intake artifact at section start = HALT (parent plan's Phase 0 gate).

**Browser-tool announcement** (LR-038 v2): emit `Browser tool: Playwright CLI. Reason: nav2 baseline walk + e2e walkthrough, unattended, multi-field catalog.` as the first activity-log line of the session.

---

## Phase 0.5b — Baseline-first walk (REQUIRED — Phase 1a IS this)

Trigger: HUNTER subplan output directly drives downstream TC corrections + bug filings. Phase 1a below IS the LR-045-compliant baseline-first walk.

---

## Phase 1a — Nav2 walk (CLI, unattended)

Emit `clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-2026-05-12.md` per LR-045 row 4 schema. Skip per-dimension when intake step B markers show dimension <14 days old (intake authoritative — do not double-walk).

**Discoveries**: any rule in live Nav2 not in `clients/encore/docs/REQUIREMENTS.md` Shared Setup section → updated INLINE in REQUIREMENTS.md as part of Phase 0 step D. Log the update in intake artifact section D.

Baseline-absent fields (feature net-new on Nav4, never existed on Nav2): record `baselineScope: baseline-absent` per LR-ENC-001 — NOT a HALT, escalate via `/encore-questions` if ambiguous.

---

## Phase 1b — E2E walk (CLI)

Emit / refresh `clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md` per `field-inventory-spec.md`. Same `<14 days` skip rule as Phase 1a.

**Cross-field section MANDATORY** (per grandparent v5 §5 Phase 1b clause + parent line 110). For each discovered field, record:
- State dependencies: does this field's state change based on another field's value? Which?
- Validation dependencies: does this field's validity depend on another field?
- Visibility dependencies: when is this field shown / hidden?
- Limit dependencies: does this field's max/min depend on another field's value?
- Cascading options: if dropdown — are its options filtered by another field?
- Save behavior: saved alone or with others? Which save-button covers it?

These map 1:1 to Matrix D sub-dimensions D1..D6 in GIVER section. Missing cross-field section = GIVER cannot populate Matrix D = pilot fails. Treat as Acceptance criterion blocker.

---

## Phase 2 — Nav2-vs-E2E diff

Row-by-row comparison. Each mismatch resolves to ONE of:
- **Bug filed** (LR-034 + LR-044): create `reports/bugs/BUG-LOC-SHR-NNN.json` with `stepsToReproduce` as numbered array, `baselineComparison` + `baselineEvidence` per LR-034 baseline.md auto-load.
- **Intentional UX change**: cite REQUIREMENTS.md / Jira / MODULE_REGISTRY.md row.
- **Baseline-absent**: LR-ENC-001 (feature net-new on Nav4).

Record mismatch counts per disposition class + REQUIREMENTS.md upstream updates made in the intake artifact's Section D + this subplan's Handoff.

---

## Phase 2.5 — Adjacent-Sweep (MANDATORY)

For every adjacent fix noticed during Phase 1a / 1b / 2 that is (same identity = HUNTER) + (same module = Shared Setup) + (5–30 min) + (no user input needed), pick exactly one of:

- **DO-NOW** — execute before Phase 3 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan to add a grep-verifiable line item; verify with `grep -F "<the line>" plans/pending/<file>` before continuing.

Bare "out of scope" / "flagged for follow-up" with no recipient = HALT + ask user (LR-040 + LR-046). Discussion-items (empty-everywhere + no-UI-path + no-Jira) per `feedback_discussion_item_not_bug.md` are allowed as a 4th disposition with a named flag in the intake artifact.

---

## Acceptance criteria (gate to GIVER)

- [ ] Phase 0 intake artifact present at `clients/encore/specs_planning/_internal/intake/shared-setup-hunter-2026-05-12.md` with Steps A/B/C/D populated.
- [ ] Baseline artifact at `clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-2026-05-12.md` per LR-045 schema.
- [ ] Field-inventory at `clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md` per `field-inventory-spec.md` schema, including cross-field section for every field (state/validation/visibility/limit/cascading-options/save-behavior).
- [ ] Phase 2 diff resolves every mismatch to (bug-filed | intentional | baseline-absent | discussion-item) with counts cited.
- [ ] REQUIREMENTS.md / MODULE_REGISTRY.md upstream updates listed in intake section D (count + paths + reasons).
- [ ] Phase 2.5 Adjacent-Sweep: every adjacent item dispositioned (DO-NOW | SPAWN | APPEND | discussion-item flag).
- [ ] Handoff line in this subplan: outcomes only per LR-039, no obstacle/blocker prose.
- [ ] Activity-log row per LR-028 with LR-037 timestamp gate (When ≥ all touched-file mtimes).
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched tracked files.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042 v2 evidence-emission.

---

## Verification

```bash
# Intake + baseline + inventory files present
ls clients/encore/specs_planning/_internal/intake/shared-setup-hunter-2026-05-12.md
ls clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-2026-05-12.md
ls clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md

# Cross-field section present in inventory (every field has all 6 sub-keys)
grep -c "state-dep\|validation-dep\|visibility-dep\|limit-dep\|cascading-options\|save-behavior" \
  clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md

# REQUIREMENTS.md upstream updates (if any)
git diff --stat clients/encore/docs/REQUIREMENTS.md clients/encore/docs/MODULE_REGISTRY.md

# Bug filings (if any)
ls reports/bugs/BUG-LOC-SHR-*.json 2>/dev/null || echo "no bugs filed"

# Activity-log row
tail -5 clients/encore/specs_planning/_internal/agent-activity-log.md
```

---

## Handoff (post-execution)

Chat-only per `feedback_handoff_in_chat_only.md` + LR-039. One paragraph stating outcomes: baseline + inventory at paths above, N bugs filed, M REQUIREMENTS sections added, K REGISTRY entries added, cross-field sub-key counts per field. No obstacle / blocker prose. If a true blocker occurred (auth refresh, network down), surface immediately to user and HALT — do NOT write into handoff.

GIVER inherits state via files only — intake artifact + baseline + field-inventory (with cross-field section) + filed `BUG-LOC-SHR-*.json` + REQUIREMENTS/REGISTRY git diff. No in-session state crosses sections per parent plan's Bootstrap clause.
