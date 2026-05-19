# SUBPLAN_DQU_V6_PILOT_SSL_E — Adjacent-Sweep + Closure Ceremonies

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-15
**Identity**: OWNER
**Parent**: plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md
**Depends on**: plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_D.md (Step 7 green runs + zero flakes)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none
**Justification**: mechanical ceremony work (TC-MD header fix per audit-note #4, CSV re-export, MODULE_REGISTRY update, activity-log row, Execution Summary, git mv, plans:reindex, parent-cascade evaluation, /reflect, /final-q) — file mutations + standard scripts; no live DOM, no RCA, no multi-rule judgment ⇒ Sonnet hi per LR-041.

---

## Context

Closure arm of the v5.1-chunked PLAN_DQU_V6_PILOT_SHARED_SETUP execution. Owns Step 8 + Step 9 of the parent plan. Critically: owns the **audit-note #4 fix** (TC-MD header file currently `**Total**: 25`; spec has 24 `test(`; reset to `24 + N` where N = SP-C's new TC count).

After SP-E closes, the parent plan PLAN_DQU_V6_PILOT_SHARED_SETUP.md auto-closes via LR-027 parent-cascade clause (it has no own execution body left).

---

## Phase 0 dependency gate

- **HARD GATE 1**: SP-D `Status: DONE` AND Run 1 + Run 2 both green AND zero flakes AND all 6 fixme'd TCs in unlocked-or-properly-annotated state.
- **HARD GATE 2**: SP-B `Status: DONE` (HIST catalog at `clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md`).
- If any gate fails → HALT, ask user.

---

## Bootstrap

- Parent plan: `plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md` (v5.1)
- All siblings: SP-A/B/C/D in `plans/done/`
- `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md` (TC-MD; header reset from `Total: 25` to `Total: 24 + N`)
- `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.csv` (CSV — regenerate from TC-MD with Tags column)
- `clients/encore/CLAUDE.md (was MODULE_REGISTRY.md, removed 2026-05-19 per unified-matsumoto plan)` (Shared Setup row update)
- `.claude/context/navigation.md` (§C SSL row update — Last updated 2026-05-15 + nav2-first walk pattern if novel)
- `clients/encore/specs_planning/_internal/agent-activity-log.md` (LR-028 row append)
- `.claude/rules/pipeline.md` (LR-027, LR-028, LR-030, LR-046, LR-050)
- `.claude/skills/audit/SKILL.md` (adjacent-sweep mode)
- `.claude/skills/reflect/SKILL.md`
- `.claude/skills/final-q/SKILL.md`

---

## Phase 0 — bootstrap ceremonies

1. Identity OWNER confirmed.
2. `/relevant` scan.
3. LR-020: verify SP-D + SP-B done.
4. `BrowserTool: none` declared in first output.
5. `/regression-guard` pre-snapshot via skill invocation (audit-note #2 compliance — structural fingerprint, NOT stat).

---

## Step 8 — Adjacent-sweep + REQUIREMENTS contradiction protocol

`/audit` adjacent-sweep per SP00 Fix 1 — produces DO-NOW / SPAWN / APPEND dispositions for any in-scope cleanup adjacent to the spec/PO/selectors touched by SP-C/SP-D.

**LR-030 contradiction protocol**: for every nav2 finding (from SP-A `walk-evidence-shared-setup-2026-05-15.md` Section A) that contradicts `clients/encore/CLAUDE.md (was REQUIREMENTS.md, removed 2026-05-19 per unified-matsumoto plan)`, file `BUG-DOC-NNN.json` — NOT a silent doc update. List in parent plan Execution Summary.

Update `.claude/context/navigation.md` §C SSL row — `Last updated 2026-05-15` + add nav2-first walk pattern note if novel.

---

## Step 9 — Closure ceremonies

### 9.1 — TC-MD count header (audit-note #4 — owned here)

**Audit-note #4 fix**: the TC-MD file `locations_shared_setup_locations_test_cases.md` currently reads `**Total**: 25` (per SP-A's Step 0 grep finding). Spec has 24 `test(` calls baseline + N from SP-C. Reset header to `**Total**: 24 + N` (final integer).

Append new TC rows for each new TC from SP-C (TC-LOC-SSL-025 onward).

### 9.2 — CSV re-export with Tags column

Regenerate `locations_shared_setup_locations_test_cases.csv` from TC-MD with Tags column. Ensure Tags reflect any new TC categorization from SP-C.

### 9.3 — MODULE_REGISTRY.md SSL row

Update `clients/encore/CLAUDE.md (was MODULE_REGISTRY.md, removed 2026-05-19 per unified-matsumoto plan)` Shared Setup row — pass count + last-updated 2026-05-15.

### 9.4 — Activity-log row (LR-028)

Append to `clients/encore/specs_planning/_internal/agent-activity-log.md`:
```
| 2026-05-15Thh:mm | OWNER | done | <comma-separated touched files> | SP-E closure: TC-MD header fix + CSV + MODULE_REGISTRY + sweep + REQUIREMENTS contradictions + parent-cascade |
```

### 9.5 — Execution Summary (LR-027)

Write `### Execution Summary` section in parent plan body. Roll up SP-A/B/C/D/E summaries:
- TCs implemented (count + IDs)
- TCs dropped (count + IDs + per-TC justification — should be 0 per strict line, otherwise NOT-AUTOMATABLE/DEFERRED/APP BUG)
- All 6 fixme'd TC unlock outcomes (PASS-LIVE / FAIL-FRAMEWORK / FAIL-APP / CHANGED-SYMPTOM per TC + Section B/C evidence pointer)
- MCP findings (nav2 walk + nav2 HIST)
- Bugs filed (new BUG-LOC-SHR-NNN list) + bugs closed (BUG-001 status update) + minimized repros
- REQUIREMENTS contradictions filed as BUG-DOC-NNN
- Deviation log (LR-046 strict-line decisions, scope discussions with user)
- Hours-actual per subplan
- v5.1 closure-evidence verification: 4 CLOSURE-N greps passed

### 9.6 — git mv + reindex (LR-027)

```bash
git mv plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md plans/done/
npm run plans:reindex
```

### 9.7 — Parent cascade (LR-027 parent-cascade clause)

Grep `plans/pending/` for sibling subplans whose `**Parent**:` field points at `PLAN_DQU_V6.md` (the parent's parent). If zero pending PLAN_DQU_V6_PILOT_*, close `PLAN_DQU_V6.md` too — write its own Execution Summary citing the pilot chain (Notes + SSL).

### 9.8 — /regression-guard post-snapshot

Run `/regression-guard` skill post-snapshot. Diff vs pre-snapshot from Phase 0; flag any silent breakage.

### 9.9 — /reflect

Run `/reflect` skill. Capture mistakes (especially HUNTER-trust failure mode from v5; audit-note revert mistake from v5.1). Graduate if 3+ recurrences.

### 9.10 — /final-q v2 evidence-emission

Run `/final-q` skill. Reconstruct todos, tag each done/partial/skipped, gate at 400k/500k. Verdict floor: any strict-line breach = RED.

---

## Acceptance Criteria

### Strict (LR-046 — inherits from parent v5.1)

- [ ] ⚠ **PARENT-STRICT-LINE (audit-note #4)** TC-MD header reset to `**Total**: 24 + N` where N = SP-C's new TC count (file currently `**Total**: 25` — must be corrected).
- [ ] ⚠ **PARENT-STRICT-LINE (LR-027)** Parent plan in `plans/done/` with `### Execution Summary` written.
- [ ] ⚠ **PARENT-STRICT-LINE (LR-027 parent-cascade)** Parent's parent (`PLAN_DQU_V6.md`) cascade evaluated.
- [ ] ⚠ **PARENT-STRICT-LINE (LR-030)** Every nav2 finding contradicting REQUIREMENTS.md filed as BUG-DOC-NNN.
- [ ] ⚠ **PARENT-STRICT-LINE (LR-028)** Activity-log row appended at SP-E close.
- [ ] ⚠ **PARENT-STRICT-LINE (LR-046)** /final-q verdict is GREEN. If RED → SP-E stays PENDING, escalate to user. YELLOW is NOT acceptable per LR-046 (strict lines don't yield to YELLOW).

### Ceremony (LR-050)

- [ ] Phase 0 context loaded.
- [ ] Identity OWNER confirmed.
- [ ] /relevant scan run.
- [ ] /audit adjacent-sweep run.
- [ ] /regression-guard pre + post snapshot via skill invocation.
- [ ] /reflect run.
- [ ] /final-q v2 evidence-emission exit gate.
- [ ] LR-028 activity-log row appended.
- [ ] LR-027 parent + parent-cascade closures evaluated.

### Outputs

- [ ] `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md` with header `**Total**: 24 + N`
- [ ] `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.csv` regenerated with Tags
- [ ] `clients/encore/CLAUDE.md (was MODULE_REGISTRY.md, removed 2026-05-19 per unified-matsumoto plan)` Shared Setup row updated
- [ ] `.claude/context/navigation.md` §C SSL row updated
- [ ] `clients/encore/specs_planning/_internal/agent-activity-log.md` row appended
- [ ] `reports/bugs/BUG-DOC-NNN.json` files (count depends on REQUIREMENTS contradictions found)
- [ ] `plans/done/PLAN_DQU_V6_PILOT_SHARED_SETUP.md` (moved from pending; Status DONE; Execution Summary written)
- [ ] `plans/done/SUBPLAN_DQU_V6_PILOT_SSL_E.md` (moved from pending; Status DONE)
- [ ] `plans/INDEX.md` regenerated via `npm run plans:reindex`

---

## Handoff (LR-039)

**GREEN**: parent plan in `done/` with full Execution Summary; parent-cascade evaluated; /final-q GREEN → SP-E closes. Pilot complete. User decides which frozen modules to thaw next under PLAN_DQU_V6.

**RED**: any strict-line breach (TC-MD header still 25, Execution Summary missing, /final-q RED, parent-cascade skipped) → HALT, write blockers in CHAT with concrete evidence per LR-039.
