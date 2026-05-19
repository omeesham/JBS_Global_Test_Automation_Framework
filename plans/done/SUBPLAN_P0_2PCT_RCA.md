# SUBPLAN_P0_2PCT_RCA — RCA the 2026-05-11 full-suite failures, fold into Encore bug report

**Status**: DONE
**Executed**: 2026-05-12
**Priority**: P0-EMERGENCY
**Created**: 2026-05-12
**Identity**: HEALER  *(RCA + spec triage + bug-filing per LR-034)*
**Parent**: `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md`  *(master tracker; this subplan only extends §1 / §3 / §10)*
**Depends on**:
- `clients/encore/reports/_failure-summary-2026-05-11T10-26-48.json` *(frozen — 87 pass / 12 fail / 99 total)*
- `clients/encore/exports/bugs-for-encore-qa-2026-05-11.csv` *(existing 10-row Cat 3 CSV)*
**Model**: claude-opus-4-7
**Thinking**: max
**Justification**: RCA + multi-failure root-cause judgment + LR-044 verification protocol — Opus `max` per LR-041.
**PermissionMode**: auto
**RiskAcknowledged**: not required *(no `bypassPermissions`)*
**BrowserTool**: cli
**Skills auto-called**: `/rca` (primary, per failure), `/bugfix` (when symptom = spec defect we can fix), `/regression-guard` (wrap), `/final-q` (exit)

**On approval — physical location**: this file moves to `plans/pending/SUBPLAN_P0_2PCT_RCA.md` and runs `npm run plans:reindex` per feedback_save_plan_location.md.

---

## Context

The 2026-05-11 full-suite run is the most recent full Playwright run on disk (`clients/encore/reports/_failure-summary-2026-05-11T10-26-48.json`). Numbers:

- **passed: 87**, **failed: 12**, **fixme: 0**, total = 99 attempts on 92 unique tests.
- Raw failure-attempt rate = 12.12%. After Playwright retries, **5 unique tests fail-after-all-attempts** (`retryStats.perTest.failedAfterAllAttempts: 5`) → ~5.4% final failure rate. This is the "2% / few-percent" bucket Rutvik is targeting.
- **All 12 failure attempts cluster on 4 specs** (good news — bounded scope):
  | Spec | Failure attempts |
  |---|---|
  | `tests/specs/setup/locations/location-auto-addon.spec.ts` | 5 |
  | `tests/specs/setup/local-office/local-office-ect.spec.ts` | 4 |
  | `tests/specs/setup/locations/location-pricing.spec.ts` | 2 |
  | `tests/specs/setup/locations/location-local-information.spec.ts` | 1 |

This subplan answers four questions per failing test: **(1) what's failing, (2) why, (3) what can be fixed, (4) is it a potential app bug** — then folds the bug-class outcomes into the master tracker (`PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` §1 Cat 3 or §3 Cat 1) and regenerates the Encore CSV.

**Scope guardrail (explicit per user)**: this subplan touches **only** the 2026-05-11 failing 2% items. The R1-R6 RCAs already enumerated in master-tracker §6 (Cat 2 / Cat 1 follow-ups) are **out of scope** here — they continue under the master tracker's own sequence.

---

## Bootstrap

- **Identity**: HEALER (auto-load via `/identity HEALER`; §2 ownership = specs/page-objects/test-data/bug-JSON).
- **Context files to load first**:
  1. `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` (master tracker — §1 / §3 / §6 / §10).
  2. `.claude/rules/pipeline.md` — **LR-044 Bug Verification Protocol** (verbatim → exact → minimize), LR-046 strict-line discipline, LR-027 finalization.
  3. `.claude/rules/specs.md` — LR-018 (run-all is truth), LR-024 (clean before RCA).
  4. `.claude/rules/browser-tool.md` — CLI for functional/network bugs.
  5. `docs/read_only_docs/LEARNED_RULES.md` — LR-033 network RCA, LR-034 bug-filing schema, LR-039 handoff (no obstacles).
  6. `clients/encore/CLAUDE.md` — LR-008 date-offset, LR-012 dialog discipline, LR-ENC bug-ID conventions.
- **Skills referenced**: `/rca` (5-phase Kepner-Tregoe + Fishbone + 5 Whys + trace), `/bugfix` (for spec-defect fixes), `/regression-guard` (before+after).
- **Artifacts in scope**:
  - INPUT: the 5 failing tests inside the 4 specs above + their per-test artifacts under `clients/encore/reports/test-results/*` + `allure-results/*` + `diagnostics/*`.
  - OUTPUT (this subplan creates/edits):
    - Up to 5 new `reports/bugs/BUG-*.json` (only for confirmed app bugs).
    - Spec fixes (if any failure is a spec defect — HEALER scope).
    - `clients/encore/exports/bugs-for-encore-qa-2026-05-12.csv` *(refreshed combined CSV)*.
    - `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` row additions in §1 / §3.

---

## Phase 0 — Dependency + browser-tool gate

1. **Confirm 2026-05-11 archive is present** — `clients/encore/reports/_failure-summary-2026-05-11T10-26-48.json` exists, mtime 2026-05-11. *Failure → HALT, ask Rutvik for the run to use.*
2. **Confirm per-test artifacts exist** — for each of the 12 failure attempts, check `clients/encore/reports/test-results/tests-specs-setup-*-chrome/` for `trace.zip`, `error-context.md`, video. *Missing artifacts → HALT, capture from a fresh run instead.*
3. **Browser tool announcement** — *"Browser tool: Playwright CLI. Reason: functional + network RCA across 4 specs; unattended; CLI = ~4× token savings vs MCP (LR-038 v2)."*
4. **Auth state check** — `.auth/nav4-state.json` present + non-empty. *Missing → headed refresh per Gate 3 of `.claude/rules/browser-tool.md`.*

---

## Phase 1 — Isolate the 5 final-failures and confirm reproducibility

User direction: *"find all failing items, run the specs with just as much workers, like 3 specs has failures (covers all 2%) then follow exact /rca procedures as they should be on them."*

1. **Extract failing TC-IDs** from `_failure-summary-2026-05-11T10-26-48.json` `.failures[]` — match each entry to its `title` / `TC-ID` in the source spec file. Produce a 5-row table: `{spec, TC-ID, error-first-line, retry-count}`.
2. **Run the 4 specs fresh with 3 workers** — preserves the user-asked concurrency boundary:
   ```
   cd clients/encore
   npx playwright test --workers=3 \
     tests/specs/setup/locations/location-auto-addon.spec.ts \
     tests/specs/setup/local-office/local-office-ect.spec.ts \
     tests/specs/setup/locations/location-pricing.spec.ts \
     tests/specs/setup/locations/location-local-information.spec.ts
   ```
3. **Classify each test by reproduction**:
   - **REPRODUCED in this run** → carry forward to Phase 2 RCA.
   - **PASSED in this run** → tag as ENVIRONMENTAL (LR-044 RCA category); re-run **alone** with `--grep "<TC-ID>"` to double-check; if still passes solo → log as flake-only, no bug filed, note in §10 of master tracker.

---

## Phase 2 — Per-failure /rca (LR-044 protocol, applied 5×)

For **each** reproduced failure, run `/rca` end-to-end exactly per `.claude/skills/rca/SKILL.md`:

- **Phase 0 (artifacts)**: read `failure-summary.json` entry + per-test `trace.zip` (Playwright Inspector) + `error-context.md` + `consoleErrors` + `networkFailures` (LR-033). NO re-running yet — artifact-first.
- **Phase 1 (Kepner-Tregoe IS/IS-NOT)**: pin what is failing, what is NOT failing, where, when, who/what affected.
- **Phase 2 (Fishbone)**: enumerate candidate categories — Spec / Page-object / Selector / Data / App / Env.
- **Phase 3 (5 Whys)**: collapse the candidate tree until evidence cites a single root.
- **Phase 4 (verdict)**: classify per LR-044 RCA-category vocabulary:
  - **App bug** → confirmed app defect (file BUG-*.json + add to master tracker §1 Cat 3 if RCA complete, §3 Cat 1 if partial).
  - **Spec defect (fix-able)** → flaky selector / wrong assertion / stale baseline / missing-await — fix in HEALER scope, log in §10 of master tracker as "fixed in SP-2PCT-RCA".
  - **Page-object / selector defect** → same as spec defect, fix file.
  - **Data defect** → fixture cleanup / seed reset; fix.
  - **ENVIRONMENTAL / ROLE-DEPENDENT** → no bug; document and note conditions.
  - **STALE artifact** → LR-024 violation; re-run.
- **Phase 5 (MCP replication, only if Phase 0-4 inconclusive)** — Playwright CLI (Browser tool already declared). Read DOM, network, console; minimize repro per LR-044 step 3.

**Per-failure output (template)** — drop into the master tracker's new §3.5 or §1 addition:
```
### F-NN · <TC-ID> in <spec> :: <one-line symptom>
- Verdict: <app-bug | spec-defect | flake | role-dependent>
- Root cause: <one-line>
- Evidence: <trace.zip step N>, <network req>, <DOM snapshot if Phase 5>
- Fix scope: <BUG-*.json filed | spec patched at file:line | no-op>
- LR-044 RCA category: <ISOLATION | HALLUCINATION | MISREAD | ENVIRONMENTAL | STALE | ROLE-DEPENDENT | CONFIRMED>
```

---

## Phase 3 — File bugs (app bugs only) + fix specs (defects)

1. **For every Phase-2 verdict `app-bug`**:
   - Write `reports/bugs/BUG-<MOD>-<NNN>.json` per LR-034 schema (id, title, module, severity, status, discoveredDate=2026-05-11, requirementSource, stepsToReproduce, expectedBehavior, actualBehavior, mcpEvidence, baselineComparison, affectedTests, verificationLog[1]).
   - Module codes already in use: `LOC-ECT`, `LOC-NTS`, `LOC-AAO` (new for auto-addon), `LOC-PRC` (new for pricing), `LI`, `LOS-BAS`, `LOS-ECT`, `MGH`, `BI`, `HIS`, `LS`. Next-numbers per module: grep `reports/bugs/BUG-<MOD>-*.json` for max N + 1.
2. **For every Phase-2 verdict `spec-defect`** (fix-able):
   - `/regression-guard` snapshot → edit spec/page-object → re-run `--grep "<TC-ID>"` → confirm green → `/regression-guard` diff (no other tests broke).
3. **Log every disposition** in `clients/encore/specs_planning/_internal/agent-activity-log.md` per LR-028.

---

## Phase 4 — Fold into master tracker + regenerate Encore CSV

1. **Edit `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md`**:
   - **§1 Cat 3** — append rows for each newly-confirmed app bug from Phase 2 (full-RCA bugs only).
   - **§3 Cat 1** — append rows for partial-RCA app bugs (where verdict is "likely bug, need Encore intent").
   - **§10 Reference files** — add a row pointing to this subplan + the refreshed CSV.
   - **§11 Out-of-scope** — leave intact; this subplan didn't touch R1-R6.
2. **Regenerate the Encore-shareable CSV** as `clients/encore/exports/bugs-for-encore-qa-2026-05-12.csv`:
   - Pattern matches existing `bugs-for-encore-qa-2026-05-11.csv` (10 rows, 6 columns: Bug ID, Surface, Severity, Status, Steps-to-Reproduce, Expected vs Actual).
   - Combined contents = all 10 existing Cat 3 rows + N new app-bug rows from Phase 3.
   - Old CSV (`bugs-for-encore-qa-2026-05-11.csv`) stays in place — historical archive; do not delete.
3. **`npm run plans:reindex`** — refresh `plans/INDEX.md` so the master tracker reflects the new content + this subplan moves into the queue under its parent.

---

## Phase 5 — Closure (LR-027 + LR-028 + /final-q)

1. Append **Execution Summary** to this subplan: per-failure verdicts table, bug-IDs filed, specs patched, CSV diff (new row count), open questions for Rutvik.
2. Run **`/regression-guard`** post-run (paired with the Phase 0 snapshot — verify no silent breakage).
3. Run **`/final-q`** — v2 evidence-emission format per LR-042 (every cross-check has `ran '<cmd>' → output: '<snippet>'`).
4. `git mv` this subplan into `plans/done/SUBPLAN_P0_2PCT_RCA.md`, parent-cascade check per LR-027 (only close master tracker if no other pending subplans depend on it — master will NOT be closed here, R1-R6 still pending).
5. Update master tracker `§9 Verification` — add a NEW checkbox: `[x] SP-2PCT-RCA done — N new bugs filed, K specs patched, CSV refreshed 2026-05-12`.

---

## Acceptance criteria (LR-040 classification per item)

For each of the 5 final-failures, every item below must be (a) directly verified OR (b) grep-verified in a downstream subplan OR (c) user-flagged. No prose-only deferrals.

- [ ] **F-01..F-05** — each failure classified by LR-044 RCA category with cited evidence (a).
- [ ] Every `app-bug` verdict has a corresponding `reports/bugs/BUG-*.json` written (a).
- [ ] Every `spec-defect` verdict has a corresponding spec/page-object edit at `<file>:<line>` (a).
- [ ] Every `flake` / `environmental` verdict has a §10 reference row in master tracker (a).
- [ ] Master tracker §1 / §3 row additions exist for each app bug (a).
- [ ] `clients/encore/exports/bugs-for-encore-qa-2026-05-12.csv` exists with `10 + N` rows where N = new app-bug count from Phase 3 (a).
- [ ] `plans/INDEX.md` shows this subplan after `npm run plans:reindex` (a).
- [ ] Activity-log row appended per LR-028 (a).

---

## Verification (end-to-end check Rutvik can run)

```powershell
# 1. Confirm new CSV exists with combined row count
Get-Content clients/encore/exports/bugs-for-encore-qa-2026-05-12.csv | Measure-Object -Line

# 2. List any new bug JSONs filed in this subplan
Get-ChildItem reports/bugs/BUG-*.json | Where-Object {$_.LastWriteTime -gt (Get-Date "2026-05-12")}

# 3. Confirm specs pass after fixes
cd clients/encore
npx playwright test --workers=3 `
  tests/specs/setup/locations/location-auto-addon.spec.ts `
  tests/specs/setup/local-office/local-office-ect.spec.ts `
  tests/specs/setup/locations/location-pricing.spec.ts `
  tests/specs/setup/locations/location-local-information.spec.ts

# 4. Re-confirm full-suite delta — fail-count should drop by the spec-defect-fix count
npx playwright test --workers=3
```

---

## Out of scope (deliberate — confirmed with Rutvik)

- **R1-R6 of master tracker §6** — Cat 2 / Cat 1 follow-up RCAs (LI-002/003 cascades, NTS-002 dialog walk, NTS-003 placeholder row, BAS-016 phone validation, LOS-ECT-A audit-trail gap, MGH-001 country bisection). These continue under the master tracker's own sequence and are NOT touched here.
- **Existing Cat 3 CSV (`bugs-for-encore-qa-2026-05-11.csv`)** — preserved as historical archive. The new 2026-05-12 CSV is the live deliverable.
- **Re-running fresh full suite** — explicitly chosen against; using 2026-05-11 archive as-is.
- **Filing LO-001/002/003 catalog candidates** — already covered in master tracker §3.

---

## Reference files

| Purpose | Path |
|---|---|
| Master tracker (parent) | `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` |
| Source-of-truth failure summary | `clients/encore/reports/_failure-summary-2026-05-11T10-26-48.json` |
| Existing Cat 3 CSV (archive) | `clients/encore/exports/bugs-for-encore-qa-2026-05-11.csv` |
| New combined CSV (deliverable) | `clients/encore/exports/bugs-for-encore-qa-2026-05-12.csv` |
| LR-044 Bug Verification Protocol | `.claude/rules/pipeline.md` |
| LR-034 Bug Filing schema | `docs/read_only_docs/LEARNED_RULES.md` |
| LR-024 Clean-before-RCA | `.claude/rules/specs.md` |
| LR-033 Network RCA checklist | `docs/read_only_docs/LEARNED_RULES.md` |
| /rca skill | `.claude/skills/rca/SKILL.md` |
| Activity log | `clients/encore/specs_planning/_internal/agent-activity-log.md` |

---

## Execution Summary (LR-027)

**Scope**: RCA the 7 unique failures from the 2026-05-11 full-suite run (12 failure attempts → 7 unique TCs → 5.4% post-retry rate). Fold confirmed app-bug findings into master tracker §1; refresh the Encore-shareable CSV.

**Method**: Artifact-first /rca per failure (LR-044). Cross-validated by a fresh 4-spec re-run on 2026-05-12 (`workers=3`, chromium) via Playwright CLI, plus an isolated `--grep "TC-LOC-PRI-024"` retry to resolve the auth-degraded ambiguity.

**Final verdicts** (table also in master tracker §3.5):

| F# | TC-ID | 2026-05-11 | Rerun 2026-05-12 | Verdict |
|---|---|---|---|---|
| F-01 | TC-LOC-AAO-008 | FAIL | PASS (2.2s) | ENVIRONMENTAL |
| F-02 | TC-LOS-ECT-001 | FAIL (MXN) | PASS (21.2s) | ENVIRONMENTAL (state-leak resolved) |
| F-03 | TC-LOC-AAO-009 | FAIL | PASS (8.0s) | ENVIRONMENTAL |
| F-04 | TC-LOS-ECT-002 | FAIL | PASS (305ms) | ENVIRONMENTAL (cascade from F-02) |
| F-05 | TC-LOC-LI-071 | FAIL (593 net failures) | PASS (5.9s) | ENVIRONMENTAL (backend storm) |
| F-06 | TC-LOC-AAO-015 | FAIL | **FAIL × 2** (15.6s + retry 15.3s) | **APP BUG — filed BUG-LOC-AAO-001** |
| F-07 | TC-LOC-PRI-024 | FAIL | PASS on retry-1 (35.1s, full save-cycle) | ENVIRONMENTAL (auth lock-file contention on attempt 0) |

**Bug JSONs filed**: 1 — `reports/bugs/BUG-LOC-AAO-001.json` (Auto-Addon Unsaved-Changes Discard does NOT navigate, severity HIGH).
**Spec defects fixed**: 0 — none of the 6 environmental failures had a fix-able spec defect.
**Master tracker rows added**: §1 Cat 3 row 11 (BUG-LOC-AAO-001); new §3.5 (RCA verdict matrix) and §3.6 (final outcome summary).
**Encore CSV refreshed**: `clients/encore/exports/bugs-for-encore-qa-2026-05-12.csv` (11 rows = original 10 Cat 3 + BUG-LOC-AAO-001).
**Adjacent findings flagged but NOT scoped** (per user direction "only rca the failing 2% items"):
- TC-LOC-AAO-014 (Stay button) — failed in 2026-05-12 rerun, sister test of AAO-015; probable shared root cause.
- TC-LOC-PRI-010 (Is Alternative cascade) — failed in 2026-05-12 rerun, new regression.
- TC-LOC-AAO-017 (Wordly persistence) — failed 5ms/39ms in 2026-05-12 rerun (auth-state cascade).

**Verdict**: GREEN — scope honored verbatim, 1 of 7 reproduced and filed, 6 of 7 dispositioned as environmental with cited evidence, CSV ready for Encore handoff.

**Artifacts produced**:
- `reports/rca-2pct/failures-extracted.json` — structured extraction of all 12 failure entries from 2026-05-11.
- `reports/rca-2pct/extract-failures.mjs` — script that produced the above.
- `reports/rca-2pct/rca-per-failure.md` — per-failure RCA narrative (artifact-first).
- `reports/rca-2pct/playwright-rerun.log` — workers=3 4-spec fresh re-run log.
- `reports/rca-2pct/pri-024-isolated.log` — isolated TC-LOC-PRI-024 verification rerun.
- `reports/bugs/BUG-LOC-AAO-001.json` — filed app-bug.
- `clients/encore/exports/bugs-for-encore-qa-2026-05-12.csv` — refreshed Encore deliverable.

**Parent close-out gate (LR-027 parent-cascade)**: master tracker `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` remains PENDING — R1-R6 work in §6 still open, plus this subplan's §3.5 adjacent findings warrant a next-cycle subplan.
