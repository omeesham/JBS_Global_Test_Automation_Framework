---
name: Allure results accumulate — MUST clean before generating for specific run
description: Critical lesson — allure-results/ accumulates all runs forever. Must rm -rf before running tests if you want a clean single-run report.
type: feedback
---

**Rule**: Before generating an Allure report for a specific test run, ALWAYS clean `reports/allure-results/` and `reports/allure-report/` FIRST, then run tests, then generate.

**Why:** Allure results accumulate across ALL runs (17K+ files, 400MB+). Generating without cleaning produces a report combining all historical runs — wrong test count, mixed pass/fail data, misleading metrics. This caused a presentation-blocking incident on 2026-03-27.

**How to apply:**
- Clean single-run Allure: `rm -rf reports/allure-results reports/allure-report && <run tests> && npm run allure:report`
- Quick last-run view (no Allure): `npm run report` (Playwright HTML, auto-overwrites)
- NEVER open Allure HTML as file:// — it needs HTTP server (`allure open` or `http-server`)
- NEVER delete allure-results without running tests first if user needs that data
