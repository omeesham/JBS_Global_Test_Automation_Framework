---
name: Read failure artifacts before re-running specs
description: NEVER re-run a failing spec before reading failure-summary.json and error-context.md — destroys evidence
type: feedback
---

NEVER re-run a failing spec before reading its failure artifacts (failure-summary.json, error-context.md).

**Why:** DiagnosticsCollector already captures all 4xx/5xx responses in `networkFailures[]` and writes them to failure-summary.json. Re-running the spec (even with skips) overwrites these artifacts, destroying the evidence. In the pricing TC-026-030 RCA (2026-04-02), re-running before reading artifacts forced a multi-hour investigation that a 30-second artifact read would have solved — the 500 from `update-location-pricing` was already captured.

**How to apply:** When any spec fails:
1. Step 0.1: Read `failure-summary.json` and `error-context.md` from the test artifacts FIRST
2. Check `networkFailures[]` for 4xx/5xx responses — this catches API errors instantly
3. Only THEN form hypotheses and consider re-running with diagnostics
4. If you must re-run, copy/save the original artifacts before the new run overwrites them
