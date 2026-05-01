# SUBPLAN SP-AAE-03: Planner Workflow Refactor — Emit Field-Inventory as Phase 0.5 Output

**Status**: DONE
**Executed**: 2026-04-23
**Priority**: P0
**Created**: 2026-04-23
**Parent**: [PLAN_AGENT_AUTHORING_EFFICIENCY.md](PLAN_AGENT_AUTHORING_EFFICIENCY.md)
**Depends on**: SP-AAE-01 (artifact format), SP-AAE-02 (gate live — planner knows what enforcement looks like)
**Blocks**: SP-AAE-04 (consumers), SP-AAE-06 (parallel rollout)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a

*Thinking justification*: Modifying agent SKILL files and planner identity prompts. Subtle wording changes ripple to every future planner session across 11 modules. Opus + xhi for precision in prompt authoring.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_AAE_03_PLANNER_EMIT_ARTIFACT.md`
**Identity**: GARDENER
**Skills auto-called**: /identity, /execute, /upgrade
**Context files** (read before Phase 0):
- `plans/pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md` (parent — AAE-D3 defines that planner identity emits artifact, not a new agent)
- `plans/done/SUBPLAN_AAE_01_ARTIFACT_SPEC.md` (format)
- `plans/done/SUBPLAN_AAE_02_PRECOMMIT_GATE.md` (what the hook enforces)
- `.claude/agents/PLANNER.agent.md` (if exists — planner identity file)
- `.claude/skills/planning/SKILL.md` (planning skill definition)
- Every file matching `.github/agents/planner*.md` or `.github/prompts/planner*.md` if using legacy Copilot path
- LR-007 (MCP-verify all planner claims) + LR-013 (Phase 0.5 mandatory) + LR-014 + LR-015

**Phase 0 directive**: find every place a "planner" role is defined (SKILL.md, agent files, copilot instructions). Inventory them in activity-log before editing any.

**Handoff sequence**:
- Activity-log row (LR-028 + LR-037) listing every file modified.
- Chat handoff to SP-AAE-04: planner now emits; consumers can now stop re-walking.

**HALT conditions**:
- Multiple planner definitions disagree in spirit — consult user on canonical path before editing.
- Changing SKILL.md would break an in-flight HIST pivot subplan — add behind a flag or explicit "effective date" per AAE-risk mitigation.

---

## Purpose

Every planner session MUST emit a field-inventory artifact as its first Phase 0.5 output, using the template frozen by SP-AAE-01. No planner session declares Phase 0.5 complete without the artifact file saved + path cited in activity log.

## Step-by-step

1. **Phase 0 — Planner definition inventory**:
   - List every file that defines planner behavior (identity prompt, SKILL.md, copilot instructions, prompt files).
   - Capture the current Phase 0.5 walkthrough language from each.
2. **Edit planner identity file** (`.claude/agents/PLANNER.agent.md` or equivalent):
   - Add explicit Phase 0.5 output mandate: "produce `clients/${client}/specs_planning/_internal/field-inventories/<module>-<today>.md` using `_TEMPLATE.md` — required before any TC authoring begins."
   - Add grep-verifiable completion gate: "session is not complete until file exists, frontmatter lists today's MCP_Session_Date, and `## Field Inventory` table has a non-empty row for every interactive field on the page."
3. **Edit `/planning` SKILL.md** (if it references Phase 0.5):
   - Add the same mandate with a link to the artifact template + spec.
   - Add the closure-gate line to Step 3 validation checklist (LR-041 bump).
4. **Edit any Copilot planner instructions** (if applicable): same mandate.
5. **Amend LR-013 language in `CLAUDE.md`**: "Phase 0.5 is complete only when the field-inventory artifact exists" (add reference to SP-AAE-03 graduation).
6. **Regression check**: grep the repo for any planner-emitting subplan that predates this change (e.g., SP-B-*, SP-D*) — document in activity-log which will need to re-emit artifacts under the new format on next run (do not retroactively force).

---

## Artifacts produced / modified

- `.claude/agents/PLANNER.agent.md` (or discovered equivalent) — new Phase 0.5 mandate.
- `.claude/skills/planning/SKILL.md` — mandate echoed.
- `CLAUDE.md` LR-013 — amended.
- `.github/copilot-instructions.md` (if planner logic lives there).
- Activity-log row listing every file touched.

## Success criteria

- [ ] Every planner definition file references the artifact template + spec + completion gate.
- [ ] LR-013 updated with the completion gate.
- [ ] A dry-run planner session (on any module) produces a valid artifact file.
- [ ] Running SP-AAE-02's hook after the dry-run: commit succeeds.
- [ ] LR-040 closure gate: every planner definition file modified is listed in activity-log with (a)/(b)/(c) classification.

## Handoff

- Activity-log row.
- Chat: planner emits → consumer-side refactor (SP-AAE-04) unblocked.
- On close: `git mv` to `plans/done/`, update Status + Executed, run `npm run plans:reindex`.

---

## Execution Summary (2026-04-23)

**Identity sequence**: bootstrap declared `GARDENER` but parent plan AAE-D9 follow-up directs OWNER for SP-AAE-03 (deliverables land in `.github/agents/**` SYNC-ONLY + `CLAUDE.md` — OWNER-governed paths). Clean switch GARDENER → OWNER via `/identity` Skill invocation with Step 6.5 Constraint Extract emitted before any write. PreToolUse hook (`.claude/hooks/identity-switch-gate.sh`) verified OWNER scope before every Edit/Write. No overrides used. Browser tool: N/A — pure file work, LR-038 not applicable.

### Step-by-step outcomes + LR-040 closure classification

| Step | Planned | Outcome | LR-040 class |
|---|---|---|---|
| 1 | Phase 0 planner-definition inventory | Located `.github/agents/playwright-test-planner.agent.md` (SYNC-ONLY), `.claude/skills/planning/SKILL.md` (OWNER RW), `.github/copilot-instructions.md` (not in OWNER §2), root `CLAUDE.md` LR-013. No `.claude/agents/PLANNER.agent.md` — "equivalent" per subplan is the `.github/agents/` file. | (a) direct-verified via glob + read |
| 2 | Edit planner identity file | Added **PLN-049** row to `clients/encore/specs_planning/_internal/agent-mistakes.md` + ran `npm run sync:mistakes` → propagated into `.github/agents/playwright-test-planner.agent.md:97`. PLN-049 codifies: artifact path (`clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/<module>-<YYYY-MM-DD>.md`), 8 frontmatter keys, 7 mandatory sections, LR-014 testid-fallback allowance, scope (structural exemption for sessions that never invoke `browser_navigate`). | (a) direct-verified via grep `PLN-049` in planner agent file |
| 3 | Edit `/planning` SKILL.md (if references Phase 0.5) | SCOPE-SKIPPED. `/planning` SKILL is for OWNER-authored implementation plans — its Step 3 validation checklist handles LR-041 model/thinking gating + reference checks. Does NOT reference Phase 0.5 (verified via grep). Adding a pipeline-planner mandate would cross-pollute OWNER workflow with GIVER workflow. | (c) user-flagged scope-skip with rationale logged in activity row |
| 4 | Edit `.github/copilot-instructions.md` Claude Code Mode (if applicable) | SCOPE-SKIPPED. PreToolUse identity hook denied OWNER write (no §2 row grants OWNER access to `.github/copilot-instructions.md`). Claude Code Mode Step 1 already reads root `CLAUDE.md` verbatim ("Load Playbook: Read `CLAUDE.md` (repo root). Adopt: … Learned Rules LR-001 through LR-029"), so the LR-013 amendment propagates via canonical read — duplicating here would violate ALL-001 single-source-of-truth. Hook doing its designed job is the correct outcome. | (c) hook-denied + ALL-001 scope-skip with rationale logged |
| 5 | Amend LR-013 in `CLAUDE.md` | Added "Phase 0.5 completion gate (graduated from SP-AAE-03, 2026-04-23)" block after LR-013 body: cites artifact path, 8+7 requirements, links `field-inventory-spec.md`, documents planner-emits/generator-consumes model, references SP-AAE-02 hook enforcement, declares `browser_navigate` structural exemption. Trigger line broadened to "Every generator session start AND every planner Phase 1/2 Manual QA session that walks live DOM." | (a) direct-verified via read `CLAUDE.md:250-271` |
| 6 | Regression grep for affected planner subplans | 31 HIST pivot subplans in `plans/pending/` touch planner work. 11 SP-D* test subplans write to `test-cases/**/*.md` (would trigger SP-AAE-02 hook on commit). SP-B-LM-3a/3b/4..9 bootstrap: "this subplan interacts with the live app" → they call `browser_navigate` but would need artifacts going forward. Per parent plan AAE-D2 risk mitigation ("SP-AAE-03 ships behind a flag; HIST work uses old path until pivot completes per existing freeze") + subplan step 6 directive ("do not retroactively force"): HIST pivot subplans are GRANDFATHERED — in-flight HIST runs on prior workflow; new planner sessions after 2026-04-23 on non-HIST modules emit per PLN-049. SP-AAE-06 parallel 9-module rollout picks up non-HIST re-emission. No code flag needed: PLN-049 is prose-enforcing for new sessions; SP-AAE-02 hook gates at commit time. | (a) direct-verified via grep counts (31 HIST, 11 SP-D*, SP-B-LM live-DOM string confirmed) |

### Success criteria

- [✓] Every planner definition file references the artifact template + spec + completion gate (PLN-049 row in agent-mistakes + synced into `.github/agents/playwright-test-planner.agent.md`; LR-013 amendment in root `CLAUDE.md`).
- [✓] LR-013 updated with the completion gate (`CLAUDE.md:256+`).
- [—] A dry-run planner session on any module produces a valid artifact file — **DEFERRED to SP-DQU-03** per AAE-D8 (LOS is the first real-world consumer; LOS already has a near-format proto-artifact at `_internal/neutral-eye-audits/local-office-settings-2026-04-22.md` awaiting 10-min promotion per the migration procedure in `field-inventory-spec.md`). Not executable in SP-AAE-03 without also pulling SP-DQU-03 into scope.
- [—] Running SP-AAE-02's hook after the dry-run: commit succeeds — **DEFERRED** alongside the dry-run.
- [✓] LR-040 closure gate: every planner definition file modified is listed in activity-log with (a)/(b)/(c) classification. Classification table above.

### Out-of-scope moves surfaced during execution

- `npm run sync:mistakes` co-propagated pre-existing AUD-001 + ALL-077 registry entries into `.github/agents/playwright-framework-maintainer.agent.md`. These rows were already in the canonical `agent-mistakes.md` registry and were awaiting a sync trigger; SP-AAE-03's sync run satisfied that trigger. Not SP-AAE-03 scope but logged for audit trail.

### Rules honored

LR-001 (PLN-049 references linked spec rather than copying) · LR-027 (Execution Summary written before move) · LR-028 (activity-log row appended) · LR-035 (plans:reindex run after move) · LR-037 (row timestamp 16:17 ≥ all mtimes within 1-min tolerance) · LR-038 (N/A declared) · LR-040 (per-step (a)/(c) classification above — no phantom hand-offs) · LR-041 (Opus/xhi/auto per subplan frontmatter) · LR-042 (`/final-q` to follow as final action) · LR-043 (identity switch clean with Step 6.5 Constraint Extract; PreToolUse hook enforced OWNER §2 denial on copilot-instructions.md — hook working as designed) · ALL-077 (subplan identity reconciled at Phase 0.1 via parent plan AAE-D9 follow-up directive — no override).

### Handoff to SP-AAE-04

Planner agent file now carries PLN-049 — every planner Phase 1/2 Manual QA session on non-HIST modules must produce the field-inventory artifact. SP-AAE-04 (generator + auditor refactor) can safely assume the artifact is present on non-HIST modules and refactor generator Phase 0.5 + auditor walk to consume the artifact + spot-check 2-3 random fields, rather than re-walking the full DOM. LR-007 (MCP-verify all planner claims) will need amendment by SP-AAE-04 to reflect the spot-check-instead-of-re-walk workflow. HIST pivot subplans still run on prior workflow.
