# SUBPLAN: Allure Report — Client Deliverable #3

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-25 (clean full-suite run required — Allure needs good data)
**Blocks**: SP-DQU-34 (handoff package)
**Model**: claude-sonnet-4-6
**Thinking**: mid
**PermissionMode**: auto
**Justification**: Deterministic Allure report run + packaging — mechanical script ops (LR-041 mid example)

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_30_J1_ALLURE_DELIVERABLE.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /research
**Model + thinking**: Sonnet + medium (deterministic report ops)
**Dependency gate**: SP-DQU-25 `Status: DONE`
**Context files**:
- `package.json` scripts for `npm run allure:report`
- `feedback_allure_accumulates.md` memory file (Allure accumulates across runs)
- `feedback_report_commands.md`
- `reports/allure-results/` + `reports/allure-report/` paths

## Purpose

Produce clean Allure report from the SP-25 full-suite clean run. Ship as deliverable #3 to client.

## Step-by-step

1. Per user memory: Allure accumulates by default. To ship "last run only": `rm -rf reports/allure-results reports/allure-report` → run `npm test` → `npm run allure:report`.
2. But user rule: "NEVER delete reports/results without asking". Ask user first if they want last-run-only vs full-history.
3. Based on user answer:
   - Last-run only: clean then run test + allure.
   - Full history: generate Allure from current accumulated results.
4. Open generated report; verify:
   - All specs visible.
   - Pass/fail counts match SP-25 outcome.
   - Trend chart shows improvement if full history.
5. Package report folder for client handoff (zip + hosted link if applicable).
6. Activity-log row.

## Acceptance criteria

- [ ] Allure report generated.
- [ ] Pass/fail counts accurate.
- [ ] Report packaged for client.
- [ ] User confirmation before any `rm -rf` of reports.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-31 (bug reports packaging).
