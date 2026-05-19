# PLAN_DQU_V6 — Single-Session DQU Methodology

**Status**: PENDING
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

Supersede these (mark SUPERSEDED-BY PLAN_DQU_V6.md, move to `plans/done/`):
- `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md`
- `plans/pending/PLAN_SHARED_SETUP_DQU.md`
- `plans/pending/SUBPLAN_SHARED_SETUP_DQU_HUNTER.md`
- `plans/pending/SUBPLAN_SHARED_SETUP_DQU_GIVER.md`
- `plans/pending/SUBPLAN_SHARED_SETUP_DQU_BUILDER.md`

Archive process-ceremony artifacts (move to `_internal/_archive/`):
- `intake/shared-setup-hunter-2026-05-12.md`
- `intake/shared-setup-giver-2026-05-12.md`

Run `npm run plans:reindex` (LR-035).
