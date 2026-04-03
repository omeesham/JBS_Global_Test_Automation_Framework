# Next Session Prompt — RCA & Fix All Failing Specs

**Priority**: P0 (client delivery blocker)
**Date created**: 2026-04-02
**Created by**: Previous session

---

## Context

Two back-to-back full Chrome runs were executed on 2026-04-02 with NO artifact cleanup between them.
Both Allure (accumulated, has trend data) and Playwright HTML reports are available in `reports/`.

### Run 1 Results: 183 passed, 4 failed, 12 skipped (11.5m)
### Run 2 Results: 148 passed, 4 failed, 12 skipped (10.2m)

---

## Failures Across Both Runs

### Run 1 failures:
1. `TC-LOS-ECT-007`: Two independent Save buttons — `local-office-ect.spec.ts:79` (30.4s timeout)
2. `TC-LOC-LGL-010`: Reverting dropdown to original does NOT re-disable Save — `location-legal.spec.ts:83` (7.8s)
3. `TC-LOC-NTS-012`: Delete all notes and save empty state — `location-notes.spec.ts:147` (9.2s)
4. `TC-LOC-SSL-003`: Self-location row shows correct data and default checkbox states — `location-shared-setup-locations.spec.ts:42` (161ms)

### Run 2 failures:
1. `TC-LOS-BAS-005`: Date offset — edit, save, persist after reload — `local-office-settings.spec.ts:69` (16.5s timeout)
2. `TC-LOC-CUR-002`: USD default -- Selected, Is Default checked; merchant set — `location-currency.spec.ts:24` (151ms)
3. `TC-LOC-LGL-011`: Save SC change persists after reload — `location-legal.spec.ts:94` (26.0s timeout)
4. `TC-LOC-SSL-003`: Self-location row shows correct data and default checkbox states — `location-shared-setup-locations.spec.ts:42` (163ms)

### Pattern Analysis:
- **TC-LOC-SSL-003** — failed BOTH runs (consistent failure, likely real bug or broken selector)
- **Location Legal** — different test failed each run (LGL-010 in run 1, LGL-011 in run 2) — likely serial contamination or timing
- **Run 1 unique**: ECT-007 (timeout), NTS-012 (timing)
- **Run 2 unique**: BAS-005 (timeout), CUR-002 (fast fail = selector/data)
- 6 unique failing tests across 2 runs, only 1 consistent — suggests flaky tests + possibly 1 real bug

---

## What You Must Do (in order)

### Step 0: Reset the test environment FIRST
- Manual users have been making changes to the E2E environment that affect automation
- Before doing ANY test runs, navigate to the app and reset/verify the test data state
- Run `tests/seed.spec.ts` first to confirm auth + environment is healthy
- If seed fails, environment is broken — fix that before anything else
- Check Location 1604 settings are in expected baseline state (this is where most specs run)
- If manual users changed data (toggled checkboxes, changed dropdowns, added notes, etc.), some "failures" from the 2 runs above may actually be stale environment state, NOT test bugs
- Factor this into your RCA — re-run after env reset to distinguish real failures from dirty-env failures

### Step 1: Read failure artifacts FIRST (LR-RCA discipline)
- Check `reports/allure-results/` for failure attachments (screenshots, traces, error messages)
- Check `reports/diagnostics/` if DiagnosticsCollector captured anything
- Check `test-results/` for Playwright trace files
- Do NOT re-run anything until you've read all existing evidence

### Step 2: RCA each unique failure (use /rca skill)
For each of the 6 unique failing tests:
1. Read the spec code
2. Read the page object it uses
3. Read the error message from artifacts
4. Classify: **test bug** vs **app bug** vs **flaky/timing** vs **serial contamination**
5. For test bugs: fix them
6. For app bugs: document but don't fix (we don't own the app)
7. For flaky/timing: add proper waits, polling, or retry logic

### Step 3: Fix the legal spec (already in progress from prior session)
- Location Legal specs had failures in both runs (different tests each time)
- This suggests the spec file has serial contamination or fragile state management
- Apply LR-018 (spec-fixing workflow) and LR-019 (first test baseline enforcement)

### Step 4: Fix all other fixable failures
- TC-LOC-SSL-003 (consistent) — highest priority, investigate selector + data assumptions
- TC-LOS-BAS-005, TC-LOS-ECT-007 — timeout issues, likely need better waits (LR-023: no networkidle)
- TC-LOC-CUR-002 — fast fail, likely selector or data assumption mismatch
- TC-LOC-NTS-012 — timing issue on delete + save

### Step 5: Verify fixes
- Run each fixed spec INDIVIDUALLY first (LR-018 step 4)
- Then run ALL specs together (LR-018 step 5)
- Goal: 0 non-app-bug failures, all flaky tests stabilized

### Step 6: Document
- Any app bugs found → document in appropriate location
- Any patterns found → consider for learned rules

---

## What NOT to do
- Do NOT clear `reports/allure-results/` — the 2-run history is intentional
- Do NOT skip reading artifacts before re-running (LR-RCA)
- Do NOT assume any failure cause — read evidence first (SUPREME RULE)
- Do NOT fix app bugs in test code (mask real issues)

---

## Reports Location
- Playwright HTML: `reports/html-report/index.html`
- Allure results (raw): `reports/allure-results/` (2 runs accumulated)
- Allure report (generated): `reports/allure-report/`
- To regenerate Allure: `npm run allure:report`
- To view Playwright: `npm run report`
