# SUBPLAN: Identity Ripple Sync — Re-Sync All 7 Agents' Owned Artifacts

**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-08 (CSVs tagged), SP-DQU-25 (specs clean), SP-DQU-09 (REQUIREMENTS.md trusted)
**Blocks**: SP-DQU-34 (handoff package should reflect re-synced state)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md`
**Identity**: OWNER (coordinator for all 7 identities)
**Skills auto-called**: /identity, /audit
**Model + thinking**: Opus + high (coordination + judgment)
**Dependency gate**: SP-DQU-08 + SP-DQU-25 + SP-DQU-09 all `Status: DONE`
**Context files**:
- `.claude/agents/COLLEAGUE.agent.md` (template)
- `.github/agents/*.agent.md` (agent prompts)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (ownership §2)
- Per-identity file-ownership rules

## Purpose

Each identity owns specific artifacts. After this plan's changes (CSV renames, MD edits, new bugs, new utils, new rules), each agent's task lists and "done" claims may be stale. Re-verify per identity:

- HUNTER (bugs) — owns `reports/bugs/*.json`. Verify new BUG-*.json files follow LR-034 schema; index or log updated.
- GIVER (TBD — verify which artifacts this identity owns from agent file).
- BUILDER (specs + page objects + selectors + test data) — owns `src/pages/`, `src/selectors/`, `specs/`, `src/data/`. Verify: new slate-clear utility wired; tags applied in CSVs it produces; no dangling references.
- HEALER (spec fixes, test failures) — owns test-failure RCA. Verify: RCA log up to date; no unresolved failures.
- WATCHDOG (audits) — owns audit reports. Verify: neutral-eye audit files indexed; qa-benchmark doc present; LR-040 gate log.
- GARDENER (cleanup, rule graduation) — owns `tc-authoring-rules.md`, agent-mistakes.md. Verify: Rules 5+6 present; known-leaks table current.
- OWNER (strategy, INDEX) — owns `plans/INDEX.md`, mega-plan status. Verify: INDEX regen clean; mega plan status reflects execution state.

## Step-by-step

1. For each of 7 identities, read the agent file + its task list.
2. Build re-sync checklist per identity (5-10 items each).
3. Run each identity's re-sync step by step:
   - Verify owned artifacts match current state.
   - Update any stale task list.
   - File activity-log row per identity.
4. Produce a dated internal identity-ripple sync artifact (planned; not present yet) with per-identity outcomes.
5. Final activity-log row (OWNER summary).

## Acceptance criteria

- [ ] All 7 identities re-synced.
- [ ] Per-identity outcome documented.
- [ ] 7 activity-log rows (one per identity's re-sync).
- [ ] 1 OWNER summary row.

## Handoff

Next: SP-DQU-34 (handoff package). Chat summary: any stale-done claims found + resolved per identity.

## Inherited doctrine-ledger item (PLAN_UNIQUE_CASE_COVERAGE_FLOOR Phase 4)

- **Rule id `d-execute-phase-0-1-cross-check-halt-claude-skills-execute-s`** (`.claude/rules/hooks-identity.md`, LR-043 §D) — adjudicated **UNENFORCED: S1**. The `/execute` Phase 0.1 identity ↔ §2 cross-check HALT is skill prose; nothing blocks an execute run that never ran `check-subplan-identity.mjs`. Recorded by `.claude/doctrine-ledger.json`, which fails until this line exists (LR-040(b)).
