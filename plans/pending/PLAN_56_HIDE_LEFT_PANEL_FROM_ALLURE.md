**Status**: Pending
**Priority**: P2
**Created**: 2026-06-03
**Identity**: OWNER
**Type**: Ad-hoc ops (report-artifact only — NOT a pipeline subplan)

# PLAN_56 — Hide "Location Left Panel — Basic Information" from the Allure report (only)

## Context
The 2026-06-03 full run (363 passed / 5 failed / 7 flaky / 21 skipped, 396 total) produced an
Allure report at `clients/encore/reports/allure-report`. The user wants the **Location Left Panel —
Basic Information** spec hidden from **the Allure report only** — confirmed twice: *"our goal is to
hide it from allure report only, nothing else."* No other artifact, no source, no xlsx is touched.

This is reversible by design (files are **moved to a backup**, not deleted — per
agent-mistakes `LR-024-COROLLARY-001`: never destroy allure-results evidence that can only be
recreated by a full re-run).

## Verified facts (by inspection, no assumptions)
- Spec: `clients/encore/tests/locations/location-left-panel-basic-information.spec.ts`
  - `test.describe` = `Location Left Panel — Basic Information @locations @left-panel-basic-information`
  - 26 automated tests (TC-LOC-LP-001..023, 025..027).
- In `reports/allure-results/`: each test = a `<uuid>-result.json` carrying
  `labels[].name=="package"` → `value=="location-left-panel-basic-information.spec.ts"`.
  - **53** matching `-result.json` (26 skipped + 26 passed + 1 failed — the dup/retry rows Allure
    dedupes by `historyId` in the report).
  - **57** attachment files referenced by those results (`attachments[].source` at test-level and
    nested `steps[].attachments[].source`), each a uuid-named `-attachment.*` used ONLY by LP.
- `allure generate ... --clean` rebuilds `allure-report` from whatever remains in `allure-results`.
- `history/`, `categories.json`, `environment.properties` live in `allure-results` and must be kept
  (history/ preserves the trend chart).

## Decisions (locked via Q&A 2026-06-03)
- Scope/mechanism: **Allure ONLY** (surgical strip of allure-results + regenerate). Nothing else.
- xlsx deliverable: **untouched** (`locations_left_panel_basic_info` sheet stays).
- Source code: **untouched** (spec / page object / selectors / test-case MD stay).

## Changes (exact)
All paths under `clients/encore/`. Run from `clients/encore/`.

1. **Backup (reversible safety)** — create `reports/.lp-allure-backup-2026-06-03/` and **move** into it
   the 53 LP `-result.json` files + their 57 referenced attachment files. A single Node script does
   the matching (by `package` label) + collects attachment `source`s recursively through steps.
2. **Stop the running Allure server** (background task `bl8gla1f7` is serving the old report from the
   `allure-report` dir — it holds the folder; regenerate must not race it).
3. **Regenerate** — `npx allure generate reports/allure-results --clean -o reports/allure-report`
   (history rolls forward; LP no longer in the source results → absent from the report).
4. **Reopen** — `npm run allure:open` (background) so the user sees the cleaned report.

## NOT touched (explicit)
- `reports/test-results.json`, `reports/junit-results.xml`, `reports/failure-summary.json`,
  `reports/html-report/`, `reports/diagnostics/` — left exactly as the run produced them.
- `clients/encore/testcases/*.xlsx` — untouched.
- `specs/`, `src/pages/`, `src/selectors/`, `specs_planning/test-cases/` — untouched.
- `allure-results/history/`, `categories.json`, `environment.properties` — kept.

## Pipeline-scaffolding N/A (deliberate right-sizing)
SESSION BOOTSTRAP block, LR-041 Model/Thinking/PermissionMode gate, LR-048 satisfaction matrix,
LR-028 activity-log, LR-ENC-002 FCC parity → **all N/A**. This is OWNER-inline ops that touches only
gitignored `reports/` artifacts, spawns no agents, and edits no spec/test-case/selector/xlsx. Those
gates trigger on pipeline subplans that mutate tracked test artifacts; none apply here.

## Verification (runnable)
After step 3, all of these must hold:
```bash
cd clients/encore
# (a) zero LP results remain in the source results dir
node -e 'const fs=require("fs"),d="reports/allure-results";let n=0;for(const f of fs.readdirSync(d).filter(f=>f.endsWith("-result.json"))){const j=JSON.parse(fs.readFileSync(d+"/"+f));if((j.labels||[]).some(l=>l.name==="package"&&l.value==="location-left-panel-basic-information.spec.ts"))n++;}console.log("LP results remaining (expect 0):",n)'
# (b) LP absent from the regenerated report data
grep -rl "left-panel-basic-information" reports/allure-report/data 2>/dev/null | wc -l   # expect 0
# (c) other specs still present (sample) — expect >0
grep -rl "location-currency.spec.ts\|location-notes.spec.ts" reports/allure-report/data 2>/dev/null | wc -l
# (d) backup holds the moved files — expect ~110 (53 + 57)
ls reports/.lp-allure-backup-2026-06-03 | wc -l
```
Expected: (a)=0, (b)=0, (c)>0, (d)≈110. Report served fresh at the new allure:open URL.

## Rollback
`mv reports/.lp-allure-backup-2026-06-03/* reports/allure-results/` then re-run step 3 → LP returns.
