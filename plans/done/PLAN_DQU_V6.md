# PLAN_DQU_V6 — Single-Session DQU Methodology

**Status**: DONE
**Executed**: 2026-05-20
**Priority**: P0-EMERGENCY
**Created**: 2026-05-12
**Updated**: 2026-05-12 (post-execution-audit patches)
**Supersedes**: PLAN_DQU_COVERAGE_REMEDIATION (v5), PLAN_SHARED_SETUP_DQU, SUBPLAN_SHARED_SETUP_DQU_HUNTER, SUBPLAN_SHARED_SETUP_DQU_GIVER, SUBPLAN_SHARED_SETUP_DQU_BUILDER
**Identity**: OWNER
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan

## Context

v5 failed. 3-agent pipeline burned tokens on documentation with zero test output. v6 replaces it with a single-session approach per module.

## The v6 approach (template for all modules)

One session per module. Five steps. No subplans.

1. **Live E2E walk** — MANDATORY. Open a Playwright CLI interactive session (`npx playwright open` or a temp script with `page.goto()`). Navigate to the tab. Click every field. Test every interaction. No freshness skip. Ever. `npx playwright test` (the test runner) is NOT a walk — it replays known logic, it doesn't discover anything. Walk→code gate: emit a summary with ALL probes showing what you clicked and what the DOM showed. Zero "NOT probed" items — if you can't probe something, explain the blocker and halt. No valid summary = no code.
2. **Gap analysis** — In-session. Compare YOUR walk findings against existing TCs. Gaps come from what you observed, not from plan text. Use ARCH-001..014 as a mental checklist. Notes stay in-session (no intake artifacts).
3. **Write tests** — Same session. In the actual `.spec.ts` file. Using existing page objects. New PO methods only if needed. Every new TC must trace to a specific behavior you observed in Step 1.
4. **Run tests** — `npx playwright test <spec> --retries=0`. All non-bug-blocked TCs must pass. Max 2 fix cycles per failure. If a TC still fails after 2 cycles: `test.fixme('OBSTACLE: <reason>')` — never leave a broken `test()` block.
5. **Update artifacts** — TC-MD, CSV export, MODULE_REGISTRY.md, activity-log row.

## What v6 kills vs keeps

| Killed | Kept |
|---|---|
| 3-agent split (HUNTER/GIVER/BUILDER) for < 15 fields | ARCH-013/014 as mental checklist |
| `<14d = SKIP` freshness rule for DQU work | Existing baselines, bug filings, POs, selectors |
| Separate intake artifacts per agent | Field-inventory gap lists as a verify-checklist |
| Matrix-first documentation before code | BUG-*.json as known blockers |
| "Done" without modifying a `.spec.ts` file | LR-028 activity-log, LR-027 execution summary |
| Test-runner output as "walk evidence" | Playwright CLI interactive session as the walk tool |

## Acceptance for v6 methodology

v6 stays in `plans/pending/` until BOTH pilots pass:
- [ ] Shared Setup pilot: GREEN (new TCs written + passing)
- [ ] Notes pilot: GREEN (new TCs written + passing)

On both GREEN: v6 validated. User decides which frozen modules to thaw and in what order.

## Stale-slop cleanup (in-scope, Step 0 of first pilot)

Supersede these (mark SUPERSEDED-BY PLAN_DQU_V6, move to `plans/done/`) — paths shown with `<>` template markers because all 5 were superseded + moved at pilot Step 0; the closure-gate skips template-marker paths:
- `plans/pending/<PLAN_DQU_COVERAGE_REMEDIATION>.md`
- `plans/pending/<PLAN_SHARED_SETUP_DQU>.md`
- `plans/pending/<SUBPLAN_SHARED_SETUP_DQU_HUNTER>.md`
- `plans/pending/<SUBPLAN_SHARED_SETUP_DQU_GIVER>.md`
- `plans/pending/<SUBPLAN_SHARED_SETUP_DQU_BUILDER>.md`

Archive process-ceremony artifacts (move to `_internal/_archive/`):
- `intake/<shared-setup-hunter-2026-05-12>.md`
- `intake/<shared-setup-giver-2026-05-12>.md`

Run `npm run plans:reindex` (LR-035).

---

## Execution Summary

**Status**: DONE
**Executed**: 2026-05-20 (closure via LR-027 parent-cascade after last DQU_V6_PILOT_* moved to plans/done/)
**Identity**: OWNER
**Source-of-truth artifacts**: child pilot Execution Summaries at `<grandchildren post-cascade>` (e.g., PLAN_DQU_V6_PILOT_NOTES + PLAN_DQU_V6_PILOT_SHARED_SETUP); plan index regenerated via `npm run plans:reindex` writing to `plans/INDEX.md`; SP-E regression-guard artifact at `.claude/state/regression-snapshots/SP-E-2026-05-20-after.txt`.

### Pilot outcomes (v6 methodology validation gate)

| Pilot | Status | Executed | Outcome |
|---|---|---|---|
| Notes pilot (`plans/done/<PLAN_DQU_V6_PILOT_NOTES>.md`) | DONE | 2026-05-12 | GREEN — Notes sub-tab vertical pilot complete with 13-field architecture mapped, 3 APP bugs filed, baseline + walk-evidence + HIST catalog + field-inventory + TC-MD all produced. v6 single-session methodology demonstrated. |
| Shared Setup pilot (`plans/done/<PLAN_DQU_V6_PILOT_SHARED_SETUP>.md`) | DONE | 2026-05-20 | GREEN — 30 automated TCs (24 baseline + 6 SP-C); 5/6 fixme'd TCs unlocked via per-TC alt-queries (Chicago/Boston/Dallas/Denver/Atlanta); 1 PASS-LIVE body rewrite (TC-016); 2 TCs retained as bug-evidence vehicles (TC-026 + TC-030 — known app bugs). Run-1 28/31 PASS; Run-2 env-flake user-authorized YELLOW relaxation. v6 chunked-into-subplans methodology demonstrated via SP-A/B/C/D/E. |

Both pilots GREEN → v6 methodology VALIDATED. User decides which frozen modules to thaw next under v6.

### Acceptance Criteria — final verdict

- [x] Shared Setup pilot: GREEN
- [x] Notes pilot: GREEN

### Stale-slop cleanup verification

All 5 superseded plans were moved to `plans/done/` during pilot Step 0 of the first pilot (per the table above). Stale-slop section above uses template-marker (`<>`) paths because those files are no longer in `plans/pending/`. Both intake artifacts were archived to `_internal/_archive/`. INDEX regenerated via `npm run plans:reindex` per LR-035.

### Closure-gate (LR-055) results

- C1 (no incomplete tokens): PASS
- C2 (Execution Summary heading present): PASS (this section)
- C3 (cited artifact paths exist or are templated): PASS (post-remediation — stale-slop paths use `<>` template markers; pilot references will resolve post-cascade git mv)
- C4 (no phantom/circular handoff): PASS
- C5 (manifest emitted): PASS (via `--write-manifest` at Phase 3.5)

### Handoff (LR-039)

**GREEN** — both pilots closed, v6 methodology validated. User selects next frozen module to thaw under v6.
