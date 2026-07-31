---
name: Report commands — Allure vs Playwright HTML
description: Use npm run report for most recent run, not allure:report which accumulates all historical results
type: feedback
---

**Rule**: When asked to "open the report for the last run", use `npm run report` (Playwright HTML report), NOT `npm run allure:report`.

**Why:** Allure results in `reports/allure-results/` accumulate from ALL runs (17K+ files). `allure:generate` builds from ALL of them, showing 233+ tests. The Playwright HTML report at `reports/html-report/` is overwritten each run and shows ONLY the most recent run.

**How to apply:**
- "Open last run report" → `npm run report` (Playwright HTML, most recent only)
- "Open allure report" → `npm run allure:report` (all historical data, trends)
- To get Allure for ONLY the last run: `npm run clean:reports && npm run allure:report` (clean first)
