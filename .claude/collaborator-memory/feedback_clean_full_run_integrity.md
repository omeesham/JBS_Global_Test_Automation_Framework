---
name: a-clean-run-must-be-actually-clean-and-verified-intent-must-survive-execution
description: "On a clean/full run request, run via npm run test:cli (it cleans), VERIFY the clean happened, and report counts only from the deduped summary.json confirmed to be THIS run. Never assume cleaned."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f0d1c86f-3b02-4bb4-b4a4-ddac65bb99d7
---

When Rutvik asks for a **clean run** or **full run**, the intent is trustworthy numbers from a fresh run. Losing that intent in execution — a contaminated run, or counts quoted from the wrong source — is the worst failure, and **full runs are the most critical of all**.

**Clean means clean — verified, never assumed:**
1. Run via `npm run test:cli` (stash-history → clean → restore → run → generate). It performs the clean. Do NOT use bare `npx playwright test` for a clean/full run — it leaves `reports/allure-results/` polluted with the prior run's files.
2. After clean, VERIFY `reports/allure-results`, `reports/allure-report`, `reports/test-results` are gone before the run proceeds. "Clean" is a checked fact, not an assumption.

**Report only from the deduped report, confirmed to be THIS run:**
- Quote `reports/allure-report/widgets/summary.json` (deduped by historyId). NOT raw `allure-results/*-result.json` (every retry + any uncleaned prior run = inflated counts). NOT background-task stdout (may be a different run).
- Before quoting any count, confirm the source is the run being asked about. After a context compaction, a remembered task-ID/output path is NOT proof. (2026-05-28: quoted "331 passed" from stale stdout; live Allure showed 170 passed; user caught it.)

**Do not over-fix:** `test:cli`, the config, and the `clean` script work. The fix is discipline + verification, NEVER changing that machinery — do not "fix" by introducing a new bug.
