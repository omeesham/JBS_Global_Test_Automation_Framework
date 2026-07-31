---
name: Clean artifacts before RCA
description: Never diagnose from stale test diagnostics — always clean and run fresh first
type: feedback
---

Always clean all test artifacts and run the failing spec fresh BEFORE doing any RCA.
Stale diagnostics from accumulated prior runs will point to wrong root causes.

**Why:** Session 2026-04-02 — stale diagnostics said LGL-010 was SSO reload issue. Planned wrong fix. Fresh run showed actual failure was Radix dropdown instability in LGL-013 (run 1) and LGL-010 (run 2) — completely different root cause. Wasted the entire initial plan on wrong diagnosis.

**How to apply:** On every spec-fixing session: (1) `npm run clean` + clear `.auth/`, (2) run spec fresh TWICE, (3) only THEN read diagnostics and do RCA. The two runs confirm whether the failure is deterministic or intermittent. Graduated as LR-024.
