# PLAN 49E: Audit Agent Triage Mode (Mode 5)

## Context
When tests fail, instead of silently routing to Healer, the Audit agent should run first to collect professional-grade RCA data, verify failures on live app via MCP, and produce a triage report for user review on the dashboard.

## What to Build
1. **Audit agent prompt update**: Add Mode 5 (Triage) to `playwright-pipeline-audit.agent.md`
   - Read `reports/failure-summary.json`
   - For each failure: read test case expected values, read failure evidence
   - MCP-verify: navigate to pageUrl, snapshot, confirm issue exists NOW on live app
   - Cross-reference `agent-mistakes.md` for known patterns
   - Classify: BUG / FEATURE_CHANGE / TEST_DEFECT / UNCERTAIN with confidence + reasoning
   - Write plain English RCA summary per failure (non-technical users must understand)
   - Group similar failures by root cause
   - Produce `reports/triage-report-{runId}.json`

2. **Type definitions**: Add TriageReport, TriageItem, TriageGroup interfaces to diagnostics.ts

## Files to Modify
- `.github/agents/playwright-pipeline-audit.agent.md` — add Mode 5 protocol
- `src/framework-contracts/diagnostics.ts` — add triage interfaces

## Agent Research Directives
- Read existing Healer Phase 0 triage signals (HLR-015..017) — Audit should use SAME signal taxonomy for consistency
- Read all RCA data sources: failure-summary.json structure (agent-reporter.ts), diagnostics-collector.ts capabilities
- Research professional QA RCA standards — what data should production-grade bug reports contain?
- Check Audit agent's MCP tools (browser_snapshot, browser_navigate, browser_evaluate)
- Verify ALL diagnostic data needed is already captured (console errors, network failures, auth chain, DOM snapshot, screenshots, traces)
- Research plain English failure description patterns for non-technical users
- Check Audit agent budget ($0.05 Haiku) — is this enough for triage mode? May need Sonnet ($0.15) for quality RCA

## Edge Cases to Audit
- App is down during triage verification (MCP navigate fails) — fallback to artifact-only classification
- Flaky test that passes on MCP re-verification but failed during test run — classify as TIMING, not bug
- Same failure classified differently by Healer vs Audit — need consistent taxonomy
- Very large number of failures (20+ tests fail) — grouping essential, budget may exceed Haiku limits
- Triage report file size (with DOM snippets, network traces) — set size limits
- Clean pass (failedCount = 0) — skip triage mode entirely, proceed to standard audit

## Effort
~140 lines (100 in agent prompt, 40 in diagnostics.ts)
