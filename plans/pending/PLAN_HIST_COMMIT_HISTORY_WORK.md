# PLAN_HIST_COMMIT_HISTORY_WORK

**Status**: PENDING
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action CR-1, Finding F-001)
**Priority**: P0 (CRITICAL — work is one `git stash` from oblivion)
**Created**: 2026-04-15
**Identity**: OWNER (commits) — no agent identity owns commits, this is human-driven
**Estimated session**: SMALL (15-30 min)
**Depends on**: NONE (can run first as checkpoint) OR after CR-3 + CR-4 + H-2 for clean commit

---

## Context

The audit found that **EVERY** history-integration file is uncommitted to git:
- 14 untracked paths (`??`): all `SUBPLAN_HISTORY_*`, `PLAN_HISTORY_INTEGRATION_*`, `SUBPLAN_HISTORY_01_MCP_FINDINGS.md`, plus 5 source files (page object, selectors, spec, test data)
- 3 modified paths (`M`): `local-office-settings.spec.ts`, `local-office-ect.spec.ts`, `local-office-settings.page.ts`

Last commit `cb26fa1` (2026-04-13) does NOT touch any history files. Activity log claims "DONE" but reality is uncommitted = unshipped.

---

## Goal

All history-integration work is in git history. A future `git clean -fd` cannot delete it. Specifically:
1. All untracked history files staged + committed
2. All modified history-related files staged + committed
3. Activity log updated with the commit SHA

---

## Decision Required Up-Front

**Should we commit before verification (CR-3, CR-4, H-2) or after?**

| Option | Pros | Cons |
|---|---|---|
| **A: Commit now as WIP** | Work is safe immediately. Subsequent fixes get clean history. | History contains an unverified commit. Bisects may land here. |
| **B: Verify first, then commit** | Clean history. Single commit per logical unit. | Work at risk for the duration of verification (1-3 days?). |

**Recommendation**: **Option A** — commit WIP with explicit `[wip] SP3+SP4 history infra — UNVERIFIED, see audit` message. Then CR-3/CR-4/H-2 produce verification follow-up commits. The risk of work loss outweighs the bisect concern (these files are net-new, not refactors).

---

## Tasks

1. **Verify nothing is staged yet**
   - `git status --short` → confirm only `??` and `M` lines, no `A`/`MM`
2. **Stage in two logical groups**
   - Group A — plans + findings:
     ```
     git add plans/done/SUBPLAN_HISTORY_02_REQUIREMENTS_AND_TCS.md
     git add plans/pending/PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md
     git add plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md
     git add plans/pending/SUBPLAN_HISTORY_*.md
     ```
   - Group B — code (SP3 infra + SP4 integration tests):
     ```
     git add src/pages/setup/locations/location-management-history.page.ts
     git add src/pages/setup/local-office/local-office-settings.page.ts
     git add src/selectors/setup/locations/history.ts
     git add src/selectors/setup/locations/index.ts
     git add src/selectors/index.ts
     git add tests/setup/fixtures.ts
     git add tests/specs/setup/locations/location-management-history.spec.ts
     git add tests/specs/setup/local-office/local-office-settings.spec.ts
     git add tests/specs/setup/local-office/local-office-ect.spec.ts
     git add tests/test-data/setup/locations/location-management-history.data.ts
     ```
3. **Also stage the legitimately-related test-case + test-plan modifications** (these were edited by SP2):
   - `git add docs/REQUIREMENTS.md specs_planning/test-cases/setup/ specs_planning/test-plans/setup/`
   - **STOP first** and `git diff --cached docs/REQUIREMENTS.md` to confirm only HIST-related changes
4. **DO NOT include unrelated** `M` files: `.claude/skills/execute/SKILL.md`, `.claude/skills/ultrathink/SKILL.md`, `export_test_cases/*.ts`, `agent-performance.json`, `agent-queue.json`, `src/common/base-page.ts`, `src/selectors/SELECTOR_CATALOG.md` — these are separate work, leave for separate commit
5. **Commit (two commits)**:
   ```
   git commit -m "wip(history): SP1 MCP discovery + SP2 reqs/TCs + plan files [unverified]

   - SP1: 87-col Loc Mgmt + 42-col Local Office history MCP findings
   - SP2: REQUIREMENTS.md updates + 9 HIST TCs added
   - SP3-08: subplan stubs created
   - All work UNVERIFIED — see audit expressive-booping-fountain.md, action items CR-2..CR-4, H-2..H-4
   "
   ```
   ```
   git commit -m "wip(history): SP3 infra + SP4 local office integration tests [unverified]

   - SP3: location-management-history page object + spec (14 TCs vs 19 claimed — see CR-4)
   - SP4: TC-LOS-BAS-HIST + TC-LOS-ECT-HIST appended (untested — see H-2)
   - History selectors barrel + LocalOfficeSettingsPage history methods
   "
   ```
6. **Append activity log entry** with commit SHAs (LR-028)

---

## Verification

- `git status --short | grep -E "history|HISTORY|SUBPLAN_HISTORY"` returns NOTHING (all committed)
- `git log --oneline -3` shows two new `wip(history)` commits
- `git show --stat HEAD~1` and `git show --stat HEAD` confirm the right files in each commit

---

## Acceptance Criteria

- [ ] All 14 untracked history paths now tracked
- [ ] All 3 modified history-related code paths committed
- [ ] Two clearly-labeled `[wip]` `[unverified]` commits exist
- [ ] Activity log appended with SHAs
- [ ] No unrelated files swept into the commits
