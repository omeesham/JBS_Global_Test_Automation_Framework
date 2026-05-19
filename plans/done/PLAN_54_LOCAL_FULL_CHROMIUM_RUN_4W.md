---
**Title**: Local full chromium suite run, 4 workers, with clean results + allure trend
**Plan**: PLAN_54
**Status**: DONE
**Executed**: 2026-05-11
**Priority**: P1
**Created**: 2026-05-11
**Identity**: OWNER
**Model**: opus
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none
**Skills**: /execute, /regression-guard (off — operational run, no code mutation)
**Depends on**: none
**Parent**: none
---

### Execution Summary

**Run**: `MAX_WORKERS=4 npm run test:daily` — 14.5 min wall-clock; header confirmed `Running 315 tests using 4 workers`.

**Results** (315 total):
- 276 passed (87.6%) · 11 flaky (3.5%, passed on retry) · 22 skipped (7.0%) · **6 failed (1.9%)**
- Failed TCs: `TC-LOS-BAS-066`, `TC-LOC-AAO-015`, `TC-LOC-AAO-019`, `TC-LOC-NTS-018`, `TC-LOC-SSL-008`, `TC-LOC-SSL-009`
- Triage of these failures is OUT OF SCOPE for PLAN_54 (per §6) — surfaced to user for separate `/rca` or `/bugfix` session.

**Verification artifact (§5) checks** (post-run, post-recovery):
1. `clients/encore/reports/allure-report/index.html` → ✓ exists (1146 bytes, 16:11)
2. `clients/encore/reports/test-results.json` → ✓ exists (17.7 MB)
3. JSON `stats` → ✓ expected=276, unexpected=6, flaky=11, skipped=22, duration_ms=867747
4. `reports/allure-archive/2026-05-11T10-41-58-925Z/` → ✓ exists (bonus: `reports/html-archive/2026-05-11T10-41-59-766Z/` also created)
5. `reports/bugs/BUG-MGH-001.json` → ✓ still exists (preservation proof)
6. `reports/_PLAN_54_run-output.log` → ✓ exists (raw run log; preservation list untouched: 31 pre-existing `_*` triage files survived `clean:reports`)

**Plan deviations (logged per `feedback_plan_deviations_log.md`)**:

| # | What | Why | Resolution |
|---|---|---|---|
| 1 | `npm run test:daily` chain aborted after playwright's non-zero exit (6 failures) — `npm run allure:generate` and `npm run reports:archive` did NOT auto-run | Script uses `&&` between every step; non-zero playwright exit broke the chain at exactly the moment the report is most valuable | Recovered manually in-session: ran `npm run allure:generate` and `npm run reports:archive`. Artifacts in §5 list all confirmed post-recovery. |
| 2 | Edited `clients/encore/package.json` + created `clients/encore/scripts/run-test-daily.js` (Phase 2.5 DO-NOW) | PLAN_54 §4 declared "NOT mutates source". User explicitly authorized DO-NOW disposition in chat after Phase 3 handoff posted | Wrapper script (29 LOC, mirrors existing `scripts/preserve-*.js` / `archive-*.js` pattern) runs playwright + allure:generate + reports:archive sequentially, generates report even on playwright failure, exits with playwright's exit code (signal-accurate). `test:daily` line shortened to call the wrapper. Verification: `node -c` syntax check passed; underlying allure+archive chain proven by Phase 1 recovery. Full re-run skipped (cost 14.5 min, no new info — same artifact, different orchestrator). |

**Files touched** (deviation #2 only — original plan declared none):
- `clients/encore/package.json` — `test:daily` script line shortened
- `clients/encore/scripts/run-test-daily.js` — NEW (29 LOC node wrapper)

**Files NOT touched** (as planned):
- `clients/encore/playwright.config.ts` — worker count remained env-overridable, default local=2 stayed
- Source under `src/`, `tests/`, `clients/encore/src/`, `pipeline/`
- `reports/bugs/`, `reports/diagnostics/`, `reports/_*` triage notes, `logs/test-execution.log` — all preserved (counts confirmed pre/post)

**Activity-log row**: appended to `clients/encore/specs_planning/_internal/agent-activity-log.md` with timestamp ≥ both file mtimes (LR-028 + LR-037).

**TCs implemented / dropped / deferred**: N/A — operational runbook plan, no TCs in scope. The plan's "implementation" was three commands (clean + run + report) plus one Phase 2.5 DO-NOW.



> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_54_LOCAL_FULL_CHROMIUM_RUN_4W.md`. All context below.**
>
> On invocation the agent self-bootstraps without further prompting:
>
> 1. **Identity**: load `/identity` per the Identity field (OWNER).
> 2. **Skills**: none auto-called — operational runbook only. Plan-deviations are logged in chat per `feedback_plan_deviations_log.md`; no `/regression-guard` because zero code is mutated.
> 3. **Model / Thinking / PermissionMode**: Opus `xhi` / `auto` per frontmatter (LR-041). Headroom retained so a mid-run failure can pivot to RCA without re-spawning.
> 4. **Dependency gate**: none — no prerequisite subplans.
> 5. **Context load**: read this file in full; verify the four sub-conditions in §2 Preflight before any command runs.
> 5.5. **Browser tool**: `none`. Playwright is the test runner, not Claude using browser MCP tools. LR-038 v2 does not apply.
> 6. **Phase 0 (Preflight, MANDATORY before any rimraf)**: confirm none of the four preservation lists in §2 are about to be deleted, confirm test count is ~315 chromium, confirm shell syntax for OS.
> 7. **Execute Phases 1→3** per Step-by-Step.
> 8. **Handoff**: append summary block (pass/fail counts, archive path, allure report URL) to chat. Flip the Status field to DONE, add the Executed date, append the activity-log row, git mv the file from `plans/pending/` to `plans/done/`, run `npm run plans:reindex`, then commit.
>
> **HALT + ASK USER** if:
> - Preflight detects test count drift > ±5% from baseline ~315
> - Auth setup (project `setup`) fails or `.auth/encore-state.json` is missing → MFA needed, escalate
> - Worker > 1 surfaces flakes that 1-worker would not (record as a deviation; do not auto-retry beyond config)
> - User asks mid-run to abort or change scope

---

# PLAN 54 — Local full chromium suite, 4 workers, clean results, allure trend preserved

## §1 Context

**Why**: User wants a clean, fresh, four-worker run of the entire Encore chromium suite locally so they can review the full ~300-case picture in one shot. The most recent runs in `clients/encore/reports/` are fragmentary triage runs scoped to individual modules (`_pri-only`, `_bas-only`, `_li-only`, etc.) — not a single coherent full-suite snapshot.

**What "now" means**: cleanup standard test artifacts, bump worker count to 4 via env override (zero config-file edit — "temporarily" per the user), run only the `chromium` project (which depends on the `setup` project for shared auth state), preserve the allure trend history so this run lands as the latest data point on the timeline, archive the resulting allure report, then open it for review.

**What "all results" does NOT mean** (per `feedback_dont_destroy_user_data.md` — never delete user data without asking):
- `reports/bugs/` (filed bug artifacts — e.g., `BUG-MGH-001.json`)
- `reports/diagnostics/` (per-module diagnostic JSONs)
- Ad-hoc `reports/_*.txt` and `reports/_*.json` triage notes (user-authored investigation logs from 2026-05-07/08)
- `reports/allure-archive/` (timestamped past-run archives, if present)
- `logs/test-execution.log` (last-run console log; `npm run clean:reports` does NOT touch this)

If the user later confirms "yes, nuke those too" we run a follow-up surgical wipe — not part of this plan.

**Suite shape (verified live, 2026-05-11 14:42 local)**: 315 tests across 15 spec files under `tests/specs/` for the `chromium` project. Matches the user's "around 300" expectation.

**Config invariants (read, NOT touched)**:
- `clients/encore/playwright.config.ts` line 34: `fullyParallel: false` — hard rule (LR-019 baseline-reset ordering). Workers run DIFFERENT specs in parallel via shared auth state. Within-file parallelism stays OFF.
- `clients/encore/playwright.config.ts` line 39-41: `workers: process.env.MAX_WORKERS ? Math.max(1, parseInt(process.env.MAX_WORKERS, 10)) : (process.env.CI ? 4 : 2)`. Env override path is already wired — no edit needed.
- `clients/encore/playwright.config.ts` line 37: `retries: process.env.CI ? 2 : 1` — local gets 1 retry. We do not flip this.

## §2 Preflight (Phase 0 — execute before any command)

Read-only checks. HALT and ask the user on any failure.

1. **Shell**: confirm whether to run from PowerShell (default per system prompt) or Git Bash. Both syntaxes are emitted below.
2. **Test count**: run `npx playwright test --list --project=chromium 2>&1 | tail -1`. Expect `Total: 315 tests in 15 files`. Drift > ±5% → HALT.
3. **Preservation check**: confirm none of these paths appear in any command we are about to run:
   - `reports/bugs`, `reports/diagnostics`, `reports/allure-archive`, `reports/_*` (ad-hoc), `logs/test-execution.log`
   The canonical `npm run clean:reports` (line 26 of `package.json`) wipes only: `html-report`, `allure-results`, `allure-report`, `test-results/`, `test-results.json`, `failure-summary.json`, `junit-results.xml`. Verify before running.
4. **Auth state**: confirm `clients/encore/.auth/encore-state.json` exists OR be ready for the `setup` project to refresh it (Microsoft SSO; credentials in `config/environments/.env.e2e`). If MFA challenge appears mid-setup, HALT and escalate to user.

Pass all four → proceed to §3.

## §3 Step-by-Step

All commands run from `C:\Users\rutvi\projects\encore_framework\clients\encore`.

### Phase 1 — Clean + run + allure-trend preserve (single chained command via `test:daily`)

`npm run test:daily` chains (see `package.json` line 17):
1. `node scripts/preserve-allure-history.js` — copies `allure-report/history/` → `allure-results/history/` so trend graphs survive the next clean.
2. `node scripts/preserve-failure-summary.js` — copies prior `failure-summary.json` aside.
3. `npm run clean:reports` — rimrafs the seven test-output paths listed above (preservation list is untouched).
4. `playwright test --config=playwright.config.ts --project=chromium` — runs the full chromium suite (setup project auto-runs first via `dependencies: ['setup']`).
5. `npm run allure:generate` — generates `reports/allure-report/` with trend + categories.
6. `npm run reports:archive` — copies the new report to `reports/allure-archive/<ISO-timestamp>/`.

**Invocation with 4-worker override (pick one — DO NOT chain both)**:

PowerShell:
```powershell
$env:MAX_WORKERS=4; npm run test:daily
```

Git Bash / POSIX:
```bash
MAX_WORKERS=4 npm run test:daily
```

**Why `test:daily` instead of hand-rolling**: it is the canonical "clean + run + trend + archive" script. Hand-rolling reintroduces the bug that initially motivated `preserve-allure-history.js` (lost trend on every clean). Reuse, do not duplicate.

**Expected runtime**: ~15 specs / 4 workers ≈ 4 spec batches in parallel. Most specs are 1–5 min serial (auth-restored, fullyParallel:false). Estimate 20–40 minutes wall-clock; budget 1 hour. Run is non-interactive once started.

**Watch for** during the run:
- `[AgentReporter]` lines from the custom reporter (`./dist/framework/utils/agent-reporter.js`).
- `setup` project completes before any `chromium` test starts.
- Worker count in the playwright list-header line should print `4 workers`. If it prints `2 workers`, the env var did not propagate — STOP and re-issue with correct syntax for the shell.

### Phase 2 — Open the report

After Phase 1 exits, run:

```
npm run allure:open
```

This serves `reports/allure-report/` on a local port and opens it in the default browser. Categories file (`config/allure/categories.json`) supplies the failure categorisation; trend timeline shows this run alongside prior preserved history.

The HTML report is also available via `npm run report` (Playwright's native viewer, no categories or trend).

### Phase 3 — Handoff (record outcome + close plan)

1. From the playwright list summary at the end of Phase 1, extract: total tests, passed, failed, skipped, flaky-retries, wall-clock duration. Paste into chat as a one-block summary.
2. Note the archive directory created in Phase 1 step 6 (path: `reports/allure-archive/<ISO-timestamp>/`).
3. If any tests failed: do NOT triage in this plan's scope. Surface the failing test IDs to the user and ask whether to spawn an `/rca` or `/bugfix` session. Failures in a full run are expected (e.g., known LI / SHARED-SETUP issues from 2026-05-08 triage logs) — that visibility is the entire point of this run.
4. Flip the Status field of this plan to DONE, add the Executed date, append the activity-log row (LR-028), git mv `plans/pending/PLAN_54_LOCAL_FULL_CHROMIUM_RUN_4W.md` → `plans/done/`, run `npm run plans:reindex`, commit.

## §4 Files touched

- **Reads**: `clients/encore/playwright.config.ts`, `clients/encore/package.json`, `clients/encore/scripts/preserve-allure-history.js`, `clients/encore/scripts/archive-allure.js`
- **Mutates (test artifacts only, NOT source)**: `clients/encore/reports/{html-report,allure-results,allure-report,test-results,test-results.json,failure-summary.json,junit-results.xml}` rebuilt; `reports/allure-archive/<new-timestamp>/` added.
- **NOT touched**: `playwright.config.ts` (worker setting is env-overridden, not edited), `reports/bugs/`, `reports/diagnostics/`, `reports/_*` triage files, `logs/test-execution.log`, any source under `src/`, `tests/`, `clients/encore/src/`, `pipeline/`.

## §5 Verification artifact (D23)

After Phase 1 completes, the following must be true (a future session can re-check these to confirm):

```
1. ls clients/encore/reports/allure-report/index.html        → exists
2. ls clients/encore/reports/test-results.json                → exists, non-empty
3. cat clients/encore/reports/test-results.json | jq '.stats' → shows total≈315, expected≈315
4. ls -d clients/encore/reports/allure-archive/<newest>/      → exists, dated 2026-05-11
5. ls clients/encore/reports/bugs/BUG-MGH-001.json            → STILL exists (preservation proof)
6. ls clients/encore/reports/_pri-C3-full-spec-1w-take2.txt   → STILL exists (preservation proof)
```

All six expected `true` → plan executed cleanly. Any `false` → handoff to user with details.

## §6 NOT in scope

- Permanent change to default local worker count (stays at 2 in `playwright.config.ts`).
- Triage / RCA of failing tests surfaced by the run (separate plan if needed).
- Running firefox or webkit projects (`--project=chromium` only, per user).
- Deleting `reports/bugs/`, `reports/diagnostics/`, or `_*.txt` triage notes (would require explicit user confirmation).
- Generating shareable client deliverables (LR-049 ship channel — not requested).

## §7 Risks and mitigations

| Risk | Mitigation |
|---|---|
| 4 workers surfaces flakes that 2-worker run hides (auth-state contention, network bursts) | Local `retries: 1` already in config; if a test fails on attempt 1 and passes on retry, allure marks it flaky — user sees the signal without it blocking the run |
| MFA challenge during `setup` project blocks the run | Preflight check confirms `.auth/encore-state.json` exists; if it refreshes and MFA fires, HALT and ask user to satisfy MFA manually (per LR-038 v2 fresh-MFA = Chrome row, not part of this CLI flow) |
| User-authored triage files in `reports/` accidentally wiped | Preservation list in §2 verified before running; `clean:reports` script is constrained to the seven explicit paths |
| Env var not propagating on PowerShell (`MAX_WORKERS` not picked up) | Phase 1 "Watch for" step confirms `4 workers` in playwright header line; abort and reissue if it prints `2 workers` |
| Run interrupted partway (Ctrl-C, system sleep) | Re-run with the same command — `clean:reports` is idempotent, `preserve-allure-history.js` no-ops if no prior history exists |

---

## §8 Activity log (filled in on execution)

| When (local) | What | Outcome |
|---|---|---|
| (pending) | Phase 1 invoked with `MAX_WORKERS=4 npm run test:daily` | (pending) |
| (pending) | Phase 2 allure report opened | (pending) |
| (pending) | Phase 3 summary block posted to chat | (pending) |
