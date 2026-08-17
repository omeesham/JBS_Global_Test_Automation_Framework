# PLAN_SUITE_CRASH_RESILIENCE — one crashed run must not cost the rest of the suite

> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_SUITE_CRASH_RESILIENCE.md`. All context below.**
>
> The agent self-bootstraps from the frontmatter and sections in this file, without further user prompting:
>
> 1. **Identity**: load `/identity` per the Identity field below.
> 2. **Skills**: load every skill in the Bootstrap section (the leading skill auto-calls its chain).
> 3. **Model + thinking + permission mode**: read `**Model**:`, `**Thinking**:`, `**PermissionMode**:` below (all three required per LR-041).
> 4. **Dependency gate**: verify every item in Depends-on is closed or N/A. HALT if blocked.
> 5. **Context load**: read this file in full, plus the evidence artifacts named in §Re-derivation.
> 6. **Browser tool**: `cli` — Phase 3 drives real Playwright runs. Announce the choice in the first output.
> 7. **Phase 0 FIRST**: re-verify every file:line anchor in §Evidence before changing anything. Anchors drift.
> 8. **Execute Phases 1+** in order. Phase 2 is gated on Rutvik's approval and must not be started without it. Phase 4's full run is gated on Rutvik's explicit GO (standing no-full-suite-runs rule — the GO is the authorized exception).
> 9. **Handoff**: flip the Status field, add the executed date, append the activity-log row (LR-028 + LR-037), `git mv` to `plans/done/`, run `npm run plans:reindex`, commit.
>
> **HALT + ASK** if: Phase-0 re-verification finds an anchor moved and the surrounding code no longer matches the described mechanism / the Phase-0 census greps do not reproduce §Evidence E18–E22 within ±2 / Phase 3's isolation proof does not reproduce / any step would edit `playwright.config.ts`, `pages.fixture.ts`, or `package.json` dependency pins without the Phase-2 approval on record.

**Status**: PENDING
**Priority**: P0
**Created**: 2026-08-11
**Updated**: 2026-08-11 (rev 2 — master-planner rewrite after a 3-worker verification wave overturned two evidence rows and re-based the root-cause chain; rev 1 preserved in git history. Rev 2.1 same day — cross-plan collision pass vs 12 pending plans, census `nm3344-collide-0811`: B1 made order-aware vs PLAN_TIMEOUT_CENTRALIZATION, office-isolation handoff corrected from CI_2W_GREEN to the OPI family, Phase 5 consumes OPI_B's inventory, §Cross-plan coordination added. Rev 2.2 same day — Rutvik-dictated worker policy promoted into Phase 1 (A3): per-module/per-file worker counts + optional per-shard fully-parallel, policy file is the sole authority, safety warnings advisory-only; Phase 5 reframed to an advisory validation layer)
**Identity**: OWNER
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli

---

## Context

On 2026-08-11 the delivered regression suite was run end to end for the first time: 18 spec files,
618 tests, `--workers=1 --retries=0`. It ran for **4 hours 7 minutes** and produced 82 passed, 96 failed,
16 skipped, and **424 tests that never executed**. The report was unusable.

Rev 1 of this plan blamed "one browser process that is never recycled". A source-verification wave
(2026-08-11, three workers + dispatcher census — see §Re-derivation) disproved that specific mechanism:
Playwright 1.60 **discards the worker after any failing file-group and forks a fresh one**, so with 96
failures the run actually churned through many fresh browsers. What is actually proven is worse and
simpler: from run index 171 onward, **eleven consecutive freshly-forked workers died at 0 ms with the
same Windows process-init failure and the machine never recovered for the rest of the run** — a
machine-level resource exhaustion that builds up inside the run's own process session, kills every new
worker once it trips, and clears only when the run exits (solo re-runs pass afterwards).

Two design consequences survive unchanged from rev 1, now on corrected reasoning:

- **Process-tree isolation per shard** — a fresh `npx playwright test` invocation per bounded slice, so
  accumulation resets and a cascade costs one slice, not the tail of the whole suite.
- **Honest reporting under partial failure** — a crashed slice must be visible, mergeable, and must not
  destroy the evidence of the slices before it.

This matters beyond our own reporting: the client runs this suite themselves. A suite that only produces
a valid result when invoked one file at a time is not a working deliverable.

### The incident, precisely

| | |
|---|---|
| When | 2026-08-11, 05:50:24 → 09:57:48 (+05:30). **4 h 07 m 24 s** |
| Command | `npx playwright test <18 explicit spec files> --workers=1 --retries=0 --output=reports/delivered-artifacts-0811 --reporter=list,html` |
| Scope | Specs already delivered on `encore-mock/main`, excluding `locations` (known broken Save) and `service-charge` (in-flight) |
| Scheduled | 618 tests |
| Outcome | 82 passed · 96 failed · 16 skipped · **424 never executed** |
| Machine | Windows 11, single run, nothing else using the browser |

### The failure census (machine-derived, replaces rev 1's groups A–E)

Every one of the 96 failures has a detail block in the log. Per-block co-occurrence census
(dispatcher-run awk over `delivered-run.log`, command in §Re-derivation; verified counts:
`x=96 ok=82 dash=440` where 440 = 16 skipped + 424 did-not-run):

| Blocks | Signature combination | Reading |
|---|---|---|
| 59 | 30s test-timeout **+** `corporate-override.page.ts:118` poll frame **+** `toBe` **+** tracing-teardown error | **The squeeze**: test hits the 30 s local budget while inside the `:118` poll. Rev 1 counted 29 of these; the true count is 59 |
| 14 | tracing-teardown error ONLY | Real failure **masked** — the only visible error is `Must start tracing before stopping`; the underlying cause is unreadable |
| 11 | none of the signatures | The worker crashes (`code=3221225794` = `0xC0000142` `STATUS_DLL_INIT_FAILED`, all at 0 ms) |
| 6 | `:118` poll + `toBe` + tracing error, NO timeout | Same poll failing fast (wrong value, under budget) |
| 4 | `toBe` + tracing error | Other assertion failures with teardown contamination |
| 2 | 30s timeout + tracing error | Timeouts outside the poll (click / waitFor class) |

Headline ratios: **61/96 failures carry the 30 s test-timeout** (the environment-vs-budget squeeze, cf.
the known 22–30 s render time); **85/96 failures carry a `Must start tracing before stopping` teardown
throw** (the per-test trace-chunk teardown in `pages.fixture.ts` fails under failure conditions, losing
the trace and, in 14 cases, masking the real error entirely).

The 11 crashes are the resilience problem this plan owns: 11 consecutive spec files from index 171
onward, each dying on arrival in a **freshly forked worker**, zero recoveries, 424 queued tests
mass-abandoned.

### Why this is a P0 and not a housekeeping item

- **The client runs this suite themselves.** Config default is `retries: 1` locally, which softens but
  does not survive the cascade (see §Reasoning step 5).
- **The failure is silent in the worst way.** The run exits, a report generates, and it reads as a
  test-quality disaster rather than an infrastructure failure.
- **It gets worse as coverage grows.** The full suite is 1 018 tests today (E19), not 618 — the incident
  run was already the *reduced* scope.

---

## Evidence (rev 2 — every row re-verified or newly sourced 2026-08-11)

Status column: **STANDS** (rev 1 row confirmed), **CORRECTED** (rev 1 row wrong in a way that changes
design), **RETIRED** (rev 1 row's claim withdrawn), **NEW** (this wave). Sources: `cfgrisk` =
a worker-state file under `.claude/state/` (untracked — per-machine ephemeral output), `runnersrc` = `…/a worker result file (path does not resolve — worker output is ephemeral)`,
`lognum` = `…/a worker result file (path does not resolve — worker output is ephemeral)`, `census` = dispatcher greps/awk quoted in §Re-derivation.

| # | Status | Finding | Anchor |
|---|---|---|---|
| E1 | STANDS | Logged-in session fixture is worker-scoped; ONE context + ONE page serve every test a worker runs; `storageState` from `.auth/encore-state.json`; built-in `page` fixture overridden to throw | `pages.fixture.ts:184–296` (`{ scope: 'worker', timeout: 300_000 }`), `:323–330` (cfgrisk Q6) |
| E2 | STANDS | Files run sequentially in one worker *slot*; `fullyParallel: false`, `workers: parseMaxWorkers(...) ?? 1` | `playwright.config.ts:58`, `:63` |
| E3 | RE-BASED | Rev 1's "failure rate rises with position" quarter-numbers came from the retired forensics pass; what IS machine-proven: zero crashes before index 171, then 11/11 fresh workers dead 171→532 with zero recovery | lognum Q2 crash table |
| E4 | CORRECTED | The `:118`-poll/30s-squeeze class is real but UNDER-counted in rev 1: **59** full-signature blocks (+2 timeout-elsewhere), not 29 | census co-occurrence table |
| E5 | STANDS | Worker death code `3221225794` = `0xC0000142` `STATUS_DLL_INIT_FAILED`, first at index 171 (TC-CPR-DET-005), all 11 at 0 ms | lognum Q2/Q5, log lines 5872–5882 |
| E6 | **CORRECTED** | Rev 1 claimed `--retries` can NEVER recover crash-lost tests. Source-read disproves it for retries>0: crash victims go through `_failTestWithErrors → _failedTests.add()` and are NOT marked non-retriable, so they ARE retry candidates. With `--retries=0` (the incident run) nothing retries — that part stands | `node_modules/playwright/lib/runner/index.js:5391–5465` (runnersrc Q7) |
| E7 | STANDS (narrowed) | No worker-relaunch cap exists to raise; a crashed worker's queued tests are mass-marked via `_massSkipTestsFromRemaining` and only a retry pass (if enabled) can re-queue them | same region (runnersrc Q7) |
| E8 | STANDS | Playwright-project sharding achieves nothing here; but note the suite has THREE test-bearing projects — `chromium` (testIgnores locations + local-office), `encore-locations`, `encore-local-office` — all depending on `setup`. A shard runner must be project-aware | `playwright.config.ts:111–163` (cfgrisk Q7) |
| E9 | STANDS | Disk was never a factor (748 GB free) | rev 1 measurement |
| E10 | STANDS | Cross-test contamination disproved by controlled pair | `.claude/state/ua-worker/nm3344-suiterepro-0811b/` |
| E11 | STANDS | Installed Playwright 1.60.0; `package.json` declares `^1.58.2` (range, not pin) | cfgrisk Q8, runnersrc pw-version.verify.txt |
| E12 | RETIRED | Rev 1's failure groups (A=29 poll / B=4 export-120s / C=5 import-120s) were a narrative classification from the retired forensics pass; replaced by §Context census. D (4× DET click-10s) and E (11 crashes) survive inside the census | census + lognum Q1 |
| E13 | STANDS | Timeout knobs: test 60s CI / 30s local (config:48), expect 5s (:49), action 10s (:107), navigation 30s (:108); `globalTimeout` CI-only 15min×spec-count, **local = none** (:50); NO `maxFailures`; `retries: CI?2:1` (:61) | cfgrisk Q3 |
| E14 | NEW | **Worker churn on failure**: `result.didFail → worker.stop(true)`; next group in the slot sees `didSendStop()`, destroys the worker, forks fresh (`child_process.fork`, runner/index.js:1841). One browser did NOT serve the whole run once failures began | runnersrc Q1/Q2 (`runner/index.js:5136`, `:1841`) |
| E15 | NEW | Every `npx playwright test` invocation WIPES its `outputDir` at startup unless `preserveOutputDir` (`createRemoveOutputDirsTask`, runner/index.js:5919–5932). Sequential shards sharing an outputDir destroy each other's failure artifacts | runnersrc Q3 |
| E16 | NEW | CLI `--reporter` REPLACES the config reporter array (runner/index.js:301); NO additive mechanism, NO `PLAYWRIGHT_JSON_OUTPUT_*` / `PLAYWRIGHT_JUNIT_OUTPUT_*` / `PLAYWRIGHT_BLOB_OUTPUT_*` env vars exist in 1.60 (only `PLAYWRIGHT_HTML_OPEN`). Per-shard reporter paths require config edits OR runner-side file moves | runnersrc Q4 |
| E17 | NEW | `--no-deps` exists in 1.60 (program.js:183); `merge-reports` accepts a directory of blob zips, no version gate in source | runnersrc Q5/Q6 |
| E18 | NEW | Reporter outputs are FIXED-PATH except allure: `reports/html-report`, `reports/test-results.json`, `reports/junit-results.xml`, agent-reporter's `reports/failure-summary.json` all overwritten per invocation; `reports/allure-results` ACCUMULATES; agent-reporter's a failure history file (path does not resolve — file was never committed) survives `npm run clean` and accumulates across runs | cfgrisk Q1/Q8, agent-reporter.ts:69–70 |
| E19 | NEW | Full-suite size today: **1 018 tests / 33 files**. locations=303, corporate-pricing=281, corporate-override=162, local-office=81, service-charge-text=81, terms-conditions=77, service-charge=33. The crash tripped at ~165 executed tests under heavy churn — module-sized shards (303, 281) would EXCEED the observed kill threshold | cfgrisk Q9 |
| E20 | NEW | 61/96 failures carry the 30s test-timeout; 59 are the full `:118`-poll squeeze signature | census |
| E21 | NEW | 11/11 fresh workers died at 0 ms from index 171 to run end — the exhausted state persisted within the run session. "Cleared after exit" is evidenced by two post-incident passes on the same machine: the DET-001 solo run (`nm3344-crashdisc-0811`) and the suiterepro control pair (`nm3344-suiterepro-0811b`, TC-TNC-CORE-001 passing 34.8 s) — two runs, not a resource measurement; the Phase 1 sampler closes the gap | lognum Q2 + those two artifacts |
| E22 | NEW | 85/96 failure blocks carry `Must start tracing before stopping` from the per-test trace-chunk teardown (`pages.fixture.ts:75/92/97` on the worker-long tracing session started at `:281`); 14 blocks show ONLY that error — their real failure is masked. Traces themselves largely SURVIVED (85 trace.zip files on disk across the 166 artifact dirs), so B3 targets the error masking, not trace recovery | census + cfgrisk Q5/Q6 + dispatcher trace.zip count |
| E23 | NEW | Auth-expiry hypothesis DEAD for this incident: 10/10 sampled failure artifacts (incl. all four DET click-timeouts) sat on the correct app URL, zero Entra redirects | lognum Q4 |
| E24 | NEW | Each shard invocation re-runs `auth.setup.ts` automatically (`chromium`/`encore-locations`/`encore-local-office` all declare `dependencies: ['setup']`) — fresh login per shard is the default behavior, `--no-deps` opts out | cfgrisk Q7 + runnersrc Q5 |
| E25 | NEW | Per-invocation worker control needs ZERO infra: `-j, --workers <workers>` CLI flag (program.js:204) and `--fully-parallel` (program.js:174) both exist in 1.60, and the config's workers line is already env-driven (`MAX_WORKERS`, config:63). Nuance: with `fullyParallel: false`, workers parallelize FILES — a single-file shard gains nothing from N>1 unless that shard opts into `--fully-parallel` (which parallelizes at TEST level and drops in-file ordering) | dispatcher greps 2026-08-11 |

---

## The reasoning chain (evidence → conclusion)

1. **The run churned browsers, it did not nurse one.** E14: after any failing group, the worker is
   destroyed and a fresh one forked. With 96 failures, fresh workers spawned throughout. Rev 1's
   "browser that ran test 1 ran test 618" is false from the first failure onward.
2. **The dominant failure mode is the environment-vs-budget squeeze, not decay of one browser.** E20:
   61/96 failures hit the 30 s local test budget, 59 of them inside the same `:118` poll — consistent
   with the known 22–30 s render time leaving 0–8 s of budget. These failures are the churn *generator*:
   each one kills and re-forks a worker (E14).
3. **At index 171 the machine tripped a resource wall and never recovered inside the run.** E21: eleven
   consecutive freshly-forked workers died at 0 ms with `STATUS_DLL_INIT_FAILED` — a process-creation
   failure, before any test code ran. Fresh processes dying at init means the exhausted resource lives
   OUTSIDE the workers: the runner's own process session and/or process trees that outlive stopped
   workers (orphaned browsers). It cleared when the run exited.
4. **What exactly is exhausted is UNMEASURED** — memory, handles, desktop-heap, process count. Rev 1
   admitted this; rev 2 stops guessing and adds instrumentation (Phase 1 sampler + Phase 3/4 census)
   so the next run answers it.
5. **Retries are containment, not recovery, and the config already has them locally.** E6-corrected:
   with retries≥1, crash victims re-queue in fresh workers — good for an isolated crash. But in THIS
   incident every fresh worker died for the rest of the run (E21); retries would have re-queued 424
   tests into the same dead machine, adding hours. Sharding attacks the cascade; retries mop up isolated
   crashes; neither substitutes for the other.
6. **Blast radius is total because nothing resets the session.** Mass-skip per crashed group (E7) +
   permanent exhausted state (E21) = 424 abandoned. A per-slice process exit is the only proven reset
   we have (post-run solo passes, E21).
7. **Therefore**: (a) shard the suite into separate `npx playwright test` invocations sized WELL UNDER
   the observed ~165-test kill threshold (E19), (b) reap and census orphan processes between shards,
   (c) make the runner exit-code-honest and artifact-preserving under partial failure (E15/E16/E18),
   (d) keep retries≥1 inside each shard, (e) measure the resource curve so the mechanism stops being a
   hypothesis.

**Where this chain is weakest**, stated plainly:

- Step 3's "leak lives in the session / orphaned trees" is the best-fit reading of E21, not a
  measurement. The Phase 1 sampler exists precisely to convict or acquit it. A reviewer should attack
  here first.
- Server-side degradation over the 4 hours is still not excluded for the *squeeze* failures (step 2) —
  but it cannot explain 0 ms process-init deaths on the local machine (step 3).
- The 59-block squeeze count keys on string co-occurrence within numbered log blocks (§Re-derivation
  awk). A different block parser could shift counts by a few; direction is robust (59±2 ≫ 29).

---

## What was ruled out, and how (rev 2 additions at bottom)

| Hypothesis | Why plausible | What killed it | How to re-check |
|---|---|---|---|
| Cross-test contamination | Classic "passes alone, fails together"; LR-026 history | Controlled pair passed in both orders | `.claude/state/ua-worker/nm3344-suiterepro-0811b/` VERIFY_ARTIFACTS |
| Serial-mode cascade | Would explain "1 failed, rest gone" | Zero `mode: 'serial'` in the 18 files | `grep -rn "describe.serial\|mode: 'serial'" clients/encore/tests/` |
| Disk exhaustion | `0xC0000142` is a documented full-disk symptom | 748 GB free with all artifacts present | `df -h /c` |
| One broken page crashes the browser | 4 consecutive DET failures | DET-001 solo on idle machine: ordinary timeout, no crash | solo `--grep "TC-CPR-DET-001"` run |
| **One long-lived browser degrades over 4 h** (rev 1's root cause) | Worker-scoped fixture + `workers=1` | 1.60 forks a fresh worker after every failing group (E14); crashes hit FRESH workers at 0 ms (E21) | `runner/index.js:5136`, `:1841`; lognum crash table |
| **Auth/token expiry causes the late-run failures** | 4 h run vs Entra session lifetime | 10/10 sampled failure artifacts on correct app URLs, zero Entra redirects (E23) | re-read the 10 `error-context.md` files in lognum Q4 |
| **"~42 failures unaccounted"** (rev 1 open question) | Summary said 96, forensics accounted 54 | All 96 have detail blocks; census classifies 96/96 | census greps in §Re-derivation |

---

## Three wrong answers this investigation produced before landing here

1. **"All 18 files failed, 0 passed."** Grep artifact (`✓` vs `ok`). Lesson: verify counts against the
   log's own markers.
2. **"TC-CPR-DET-001..004 crashed the worker."** They failed on ordinary 10 s click timeouts; DET-005
   crashed at 0 ms. Lesson: quote the line, don't summarize.
3. **"The failure groups are 29× poll-timeout + 4× export-120s + 5× import-120s"** (rev 1 E12) — and its
   mirror error, a rev 2 worker's *"the poll class does not exist, it's 65 plain assertion failures"*.
   Both single-line classifications of multi-line error blocks. The co-occurrence census shows one block
   carries timeout + poll-frame + assertion + teardown-throw SIMULTANEOUSLY. Lesson: classify failure
   blocks by co-occurrence over the whole block, never by whichever line a reader keys on. Both passes
   are preserved for comparison (`lognum` result vs §Re-derivation awk).

---

## Open questions this plan does NOT answer (and how it makes them answerable)

- **Which resource runs out** — memory, handles, process count, desktop heap. Unmeasured. Phase 1's
  sampler + Phase 3/4 census produce the curve; the falsifier table says what each outcome means.
- **Whether orphaned browser trees actually accumulate** on Windows after `worker.stop(true)`. The
  between-shard census (Phase 1) measures exactly this.
- **Whether the server also slowed** across 4 h (would inflate the squeeze count, not the 0 ms deaths).
  Phase 4's per-shard failure-rate-over-time comparison gives a first signal (same modules, fresh
  processes, different wall-clock).
- **What the 14 masked failures actually are** (E22). Unanswerable until the teardown stops eating the
  evidence — B3. Their RCA belongs to the failing-specs workstream, not here.

---

## Independent re-derivation — every raw artifact

| Artifact | What it proves |
|---|---|
| a worker-state file under `.claude/state/` (untracked — per-machine ephemeral output) | Primary record (6 036 lines) |
| `clients/encore/reports/delivered-artifacts-0811/` | Per-failure error-context/screenshots/traces (167 dirs) |
| `clients/encore/reports/_preserved/delivered-regression-0811/` | Preserved HTML report. **Do not overwrite** |
| local nm3344 config-risk worker result (gitignored) | Config/fixture/reporter/script census, per-module test counts (rev 2) |
| a worker-state file under `.claude/state/` (untracked — per-machine ephemeral output) | 1.60 runner-source verification: worker churn, outputDir wipe, reporter replacement, `--no-deps`, merge-reports, E6/E7 re-read (rev 2) |
| a worker-state file under `.claude/state/` (untracked — per-machine ephemeral output) | 96/96 failure census, crash table, final-URL census (rev 2) |
| `.claude/state/ua-worker/nm3344-suiterepro-0811b/` | Contamination-kill differential experiment (rev 1) |
| a worker-state file under `.claude/state/` (untracked — per-machine ephemeral output) | Static state-leak audit; mutation table seed for Phase 5 (rev 1) |
| Superseded, kept for the record: `nm3344-logfor-0811` (forensics — E12 retired), `nm3344-fixdesign2-0811` (design — E6 corrected), `nm3344-crashdisc-0811` (partial) | rev 1 lineage |

**Commands to re-derive the rev 2 headline numbers** (run from repo root):

```
grep -c "^  x " .claude/state/nm3344-runs/delivered-run.log        # 96
grep -c "^  ok " .claude/state/nm3344-runs/delivered-run.log       # 82
grep -c "^  - " .claude/state/nm3344-runs/delivered-run.log        # 440 (= 16 skipped + 424 not run)
grep -c "worker process exited unexpectedly" .claude/state/nm3344-runs/delivered-run.log   # 11
awk '/^  [0-9]+\) \[chromium\]/{if(n>0){print t" "p" "tr" "tb};n++;t=0;p=0;tr=0;tb=0} /Test timeout of 30000ms/{t=1} /corporate-override\.page\.ts:118/{p=1} /Must start tracing before stopping/{tr=1} /toBe\(/{tb=1} END{print t" "p" "tr" "tb}' .claude/state/nm3344-runs/delivered-run.log | sort | uniq -c | sort -rn
# → 59 "1 1 1 1" · 14 "0 0 1 0" · 11 "0 0 0 0" · 6 "0 1 1 1" · 4 "0 0 1 1" · 2 "1 0 1 0"
```

---

## What would falsify this plan's root cause

1. **A single shard, sized ≤120 tests, still hits 0 ms worker deaths on a clean machine** → the
   exhaustion is not cumulative-per-session; the design needs rework, not adjustment.
2. **The Phase 1 sampler shows a FLAT process/memory/handle curve across a failing shard, yet a later
   shard still cascades** → the leak hypothesis is wrong; look outside the run session (OS, AV,
   scheduled tasks).
3. **The between-shard census never finds an orphan process across the whole Phase 4 run, and the
   cascade still recurs** → orphan-reaping is not the mechanism; the leak is inside the live runner
   process.
4. **The `0xC0000142` deaths recur at the same wall-clock time regardless of how many tests ran** →
   something time-based outside the suite; sharding will not help.
5. **`corporate-pricing-detail` reproducibly crashes a fresh browser from cold** → "one broken page"
   returns; different fix entirely.
6. ~~"Playwright's runner relaunches crashed workers / retries recover crash losses — read the source"~~
   — resolved: it does not relaunch (E7), and retries>0 DO re-queue crash victims (E6-corrected). Both
   halves are now source-verified; this falsifier is spent.

---

## Prior art — what this repo already knows

(Unchanged from rev 1 — sweep of 624 plans found one relative.)

### `plans/pending/PLAN_ENCORE_CI_2W_GREEN.md`

Origin of `workers: 1` (commit `bebec0dd8`) — a mitigation for concurrent-write collisions on office
1604, not a fix. Its G-7 finding ("every spec writes to office 1604… no two parallel writers can
coexist") is the constraint Phase 5 designs around.

**Recurrence check (LR-069 §3.5).** The `workers: 1` default goes on trial:

| Question | Answer |
|---|---|
| What did it do? | Eliminated concurrent-write collisions by serializing |
| Why didn't it prevent this incident? | `different-sub-class` — write-collisions vs machine-level exhaustion cascade. Serialization arguably *enabled* the 4-hour runtime that let exhaustion build |
| Verdict | **SURVIVES** — not retired; this plan does not remove it |

Rev 2 addendum: the retired rev 1 *analysis* artifacts (`nm3344-logfor-0811` groups, `nm3344-fixdesign2-0811`
retries claim) are corrected by this file's E12/E6 rows — they were analyses, not fixes, so no LR-069
retire-or-rewire obligation attaches; they stay on disk as lineage.

### What has no prior art at all

Browser/worker crash resilience, sharding the run, merging reports, **and inter-shard process reaping** —
all new ground. No parallel-safety matrix exists anywhere yet (Phase 5 builds the per-spec half;
`SUBPLAN_OPI_B` will produce the per-constant office inventory — see §Cross-plan coordination).

---

## Cross-plan coordination (collision census 2026-08-11, `nm3344-collide-0811`)

Twelve pending plans were censused against this plan's touch-set. Full quoted matrix in the census
result. What matters at execution time:

**Hot files — one plan at a time, later lander rebases (all edits are small):**

| File | Who touches it | Keys |
|---|---|---|
| `playwright.config.ts` | TIMEOUT_CENTRALIZATION (timeout/expect/action/nav + adds globalTimeout) · OPI_A (workers expression) · OPI_Z (workers defaults restore) · OURS B1 (timeout) + B2 (reporter array) | Different keys — semantic overlap only on B1×TIMEOUT_CENTRALIZATION (resolved: B1 is order-aware) |
| `pages.fixture.ts` | TIMEOUT_CENTRALIZATION (`:276–288` region — contains the `tracing.start` line) · OPI_A (office WorkerFixture) · CI_2W_GREEN Phase 6 (`:241–250` goto) · OURS B3 (trace teardown) | Different regions; B3 rebases if it lands second |
| `reports/failure-summary.json` | OPI_A changes the entry schema · OUR runner moves + merges it | Resolved: merge is schema-agnostic (§A2) |
| `docs/read_only_docs/LEARNED_RULES.md` | OPI_Z graduates a rule · OUR Phase 4 adds one | Append-only, no conflict |

**Confirmed clean**: OPI_C–G (pure spec/data refactors — zero overlap), OPI_B (setup/capture only),
WAIT_PATTERN_CLEANUP (page-object waits; does not name the `:118` poll, but if it later rewrites that
poll the §Context census baselines shift — re-run the §Re-derivation awk before comparing), scripts
directories (OPI_A creates root `scripts/`, we create `clients/encore/scripts/` — disjoint).

**Workers semantics across the waves**: our runner passes `--workers=1` explicitly per shard, which
overrides the config default through every OPI stage (OPI_A's `resolveWorkers()` clamp, OPI_Z's
CI=4/local=2 restore). After OPI_Z flips defaults up, a plain `npm test` runs parallel by default —
one more reason the README names `test:sharded` as THE full-suite entry point.

**Ordering that falls out**: TIMEOUT_CENTRALIZATION → THIS PLAN (B1 via constants) → WAIT_PATTERN →
OPI wave A→B→C→{D,E,F,G}→Z. This plan does not depend on any of them to land; the ordering only
changes WHERE B1 applies and WHEN Phase 5's matrix can consume OPI_B.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5 injection)
- `/final-q` (mandatory exit per LR-042)

**Delegation**: delegation-first. Runner authoring, verification runs, and doc edits are worker tickets;
Claude decides, reviews, and holds the Phase-2 and Phase-4 gates.

---

## Phase 0 — Anchor re-verification (before any edit)

- [ ] Re-run the five §Re-derivation commands; HALT if any headline count drifts by more than ±2.
- [ ] Re-read each NEW/CORRECTED anchor in §Evidence (E13–E24) and confirm the described code is still
      there. Report drift.
- [ ] `npx playwright --version` still 1.60.0. A different version invalidates E6/E7/E14/E15/E16 and
      Phase 1 must stop until re-derived from that version's source. Note `package.json` carries
      `^1.58.2` — if `node_modules` was reinstalled, the version may have MOVED silently (B4 exists
      because of this).
- [ ] Confirm `clients/encore/scripts/` exists, or note that Phase 1 creates it.
- [ ] Confirm nothing already provides sharding (`package.json` scripts + `clients/encore/scripts/`).
- [ ] Confirm the three worker result.md files still exist at their §Re-derivation paths (evidence
      outlives the run: if purged, re-derive before relying on E14–E24).

---

## Phase 0.5b — Baseline

`baselineScope: baseline-absent` — this plan changes how our own suite is invoked; no product surface,
no old-site comparison. Recorded per LR-ENC-001.

---

## Phase 1 — Half A: the shard runner (no protected-file edits)

Everything here is ours to change. No `playwright.config.ts` / `pages.fixture.ts` / dependency-pin edit
appears anywhere in this phase.

### A1 — shard manifest, sized by TEST COUNT (E19), not module count

- [ ] Create a shard manifest (path does not resolve — file was never committed): explicit ordered shards, each an array of
      spec paths + the owning Playwright project. **Budget: ≤120 tests per shard** (observed kill
      threshold ~165 under churn; 120 leaves margin). Authoring-time seed from E19 (≈11 shards):
      corporate-override → 2 · corporate-pricing → 3 · locations (`encore-locations` project) → 3 ·
      local-office (`encore-local-office`) → 1 · service-charge + service-charge-text → 1 ·
      terms-conditions → 1. Re-derive counts at authoring time; do NOT copy these numbers blind.
- [ ] The runner verifies each shard's size at run time via `npx playwright test --list` and **REFUSES
      to start an over-budget shard** (override: `--allow-oversize`, which logs the breach into
      `run-summary.json`) — the manifest cannot silently rot as specs are added (machine denominator,
      not model-judged; a warn-only check drifts, a refusal doesn't).
- [ ] The 120 budget is PROVISIONAL — derived from one incident's ~165-test kill point under churn.
      Phase 4's resource curve either validates it or re-derives it; the manifest carries a comment
      saying exactly that.

### A2 — `clients/encore/scripts/run-sharded.js`

- [ ] Runs shards **sequentially** as separate `npx playwright test` child processes — fresh process
      tree per shard. (Design note to honour, not re-litigate: sequential because parallel Playwright
      invocations corrupt the shared auth state.)
- [ ] **Windows spawn discipline**: spawn via `process.execPath` + a resolved Playwright CLI path (or
      `shell: true`) — bare `spawn('npx', …)` throws `EINVAL` on Node ≥18.20/Windows. `engines` says
      node ≥18 (cfgrisk Q8); the client machine is Windows. Must work from a clean checkout.
- [ ] **Per-shard `--output=reports/test-results/shard-<NN>`** — E15: sharing an outputDir means each
      shard DELETES the previous shard's failure artifacts at startup. Non-negotiable.
- [ ] **Auth**: let each shard re-run `setup` (E24 — free freshness, bounds token age to shard length).
      Expose `--no-deps` pass-through for single-shard re-runs when state is known-fresh.
- [ ] **Per-shard workers/retries**: worker count comes from the A3 policy (default 1); retries follow
      config default (local 1). An explicit `--retries` pass-through exists for diagnostics runs
      (`--retries=0` reproduces incident conditions).
- [ ] **Continue past a failed or crashed shard** — a shard's non-zero exit is RECORDED, never fatal to
      the run.
- [ ] **Exit-code honesty**: the runner's own exit code is non-zero if ANY shard failed/crashed. A
      wrapper that always exits 0 is a false-green generator for the client's CI.
- [ ] **Watchdog**: per-shard timeout (default 90 min — E13: local runs have NO `globalTimeout`); on
      breach, kill the shard's process tree, record `TIMED-OUT`, continue.
- [ ] **Reporter preservation under E16/E18** (no env vars, no additive reporter in 1.60):
      - after each shard, MOVE the fixed-path outputs into `reports/sharded/<runstamp>/shard-<NN>/`:
        `test-results.json`, `junit-results.xml`, `failure-summary.json`, `html-report/` (rename, not
        copy). The agent-reporter/healer contract is preserved by ALSO writing a merged
        `failure-summary.json` at the end (concatenate per-shard `failures[]`). The merge is
        SCHEMA-AGNOSTIC — pass entries through untouched, never whitelist fields —
        because `SUBPLAN_OPI_A` changes the FailureEntry schema (adds parallelIndex/office); a
        field-aware merge would silently drop OPI's additions.
      - `reports/allure-results` ACCUMULATES across shards by design — the runner must NOT clean between
        shards, and MUST clean it (plus any blob dir) ONCE at run start, so a merged report can never
        silently contain a previous run's shards (stale-mix guard). **CI caveat**: the config drops the
        allure reporter entirely when `CI` is set (config:77), so the one-merged-Allure outcome is
        LOCAL-ONLY; on CI the surviving outputs are JSON/JUnit/HTML — the runner's summary must say
        which mode it ran in.
      - `reports/failure-history.json` (agent-reporter cross-run memory, survives `npm run clean`) is
        left untouched by default and documented in the README; `--fresh-history` deletes it at run
        start for a clean-slate run.
      - if B2 (blob env-flag) is approved, each shard also emits a blob into `reports/blob/<runstamp>/`
        and the runner finishes with `npx playwright merge-reports --reporter=html` → ONE merged HTML.
        Without B2, the per-shard `html-report` folders (moved above) are the fallback and the runner
        says so in its summary — stated plainly, not quietly shipped.
- [ ] **Between-shard process census + reap**: after each shard's child exits, enumerate surviving
      `chrome.exe` / `node.exe` descendants of that shard (Windows: `wmic`/PowerShell CIM by parent
      PID chain), LOG the count into the run summary, and kill them (`--no-reap` flag to observe
      without killing). This is both the fresh-shard guarantee AND the measurement that convicts or
      acquits the orphan-leak hypothesis (falsifier 3).
- [ ] **Resource sampler**: a `--sample` mode records once per minute: total process count, chromium
      process count, their summed RSS, and (best-effort) handle count into
      `reports/sharded/<runstamp>/resource-log.csv`. Default ON for Phase 3/4 runs; the falsifier table
      consumes this curve.
- [ ] **Machine-readable summary**: `reports/sharded/<runstamp>/run-summary.json` — per shard: exit
      code, pass/fail/skip counts (parsed from the shard's moved `test-results.json`), duration, orphan
      count, `TIMED-OUT` flag; plus totals and the runner's own exit code. Print a human table too, one
      line per shard, so a crashed shard is obvious.
- [ ] **Shard filter argument** (`--shard 04` / `--shard corporate-pricing-2`) so one shard re-runs
      alone after a failure.
- [ ] Add `"test:sharded": "node scripts/run-sharded.js"` to `clients/encore/package.json` (scripts
      block only — no dependency changes; `child_process` + Playwright CLI only).

### A3 — Rutvik-dictated worker policy (OWNER-AUTHORITY — added rev 2.2)

The operator's dictation is THE authority on worker counts. The runner supports every combination —
from today's global 1 to per-file assignments — so a one-line instruction ("locations = 1, corp
pricing = 3") becomes a one-file edit, never an infra build. Mechanism is free: E25 (CLI flags +
env-driven config).

- [ ] Create a worker policy config (path does not resolve — file was never committed), read by the runner at start:

      ```json
      {
        "default": 1,
        "modules":       { "corporate-pricing": 3, "locations": 1 },
        "files":         { "corporate-pricing/corporate-pricing-import-all.spec.ts": 1 },
        "fullyParallel": { "corporate-pricing": false }
      }
      ```

      Resolution per shard, MOST-SPECIFIC WINS: `files` entry (any file in the shard → that shard's
      count is the MINIMUM of its file entries) > `modules` entry > `default`. An empty policy `{}`
      = global 1 worker = today's behavior, byte-identical.
- [ ] Runner passes the resolved count as `--workers=N` to that shard's invocation, and appends
      `--fully-parallel` when the policy's `fullyParallel` map says true for that shard (E25 nuance:
      required for single-file shards to go wider than 1; drops in-file test ordering — the policy
      file's comment says so in plain English).
- [ ] **Policy is never blocked, only advised.** When a shard resolved to >1 worker contains specs on
      the known shared-office-writer list (seeded from `nm3344-leakaudit-0811b`'s mutation table), the
      runner prints one WARN line naming the specs and offices — and runs exactly what the policy
      says. Same-user concurrent-session caveat printed once per run when any shard is >1. No matrix
      gate, no refusal.
- [ ] `run-summary.json` records the resolved worker count + fullyParallel flag per shard, so a
      parallel run is never mistaken for a serial one when reading results.
- [ ] Policy file ships to the client (LR-049) with plain-English comments: what each knob does, the
      file>module>default precedence, and the fully-parallel trade-off.
- [ ] Ships to the client (LR-049): survives `git archive clients/encore/`, no absolute paths, no
      references outside `clients/encore/`, plain-English comments explaining sharding = crash
      isolation (not parallelism) and the reap/census steps — no internal jargon, no ticket numbers
      (LR-058).

---

## Phase 2 — Half B: protected-surface changes (each GATED on Rutvik's explicit approval, quoted in the execution summary)

**If approval is withheld on any item, Phase 1 stands alone and that item closes as declined — a
legitimate outcome, not a blocker.**

- [ ] **B1 — raise the local per-test timeout.** ORDER-AWARE (collision census): if
      `PLAN_TIMEOUT_CENTRALIZATION` (P1, scheduled first) has landed, the timeout keys live in
      `src/utils/constants.ts` TEST_BUDGETS and the raise is applied THERE — do not re-edit the config
      expression it wired. If it has NOT landed, edit `playwright.config.ts:48` directly and leave a
      one-line note in that plan's body so centralization carries the raised value forward.
      The raise either way: `timeout: process.env.CI ? 60 * 1000 : 30 * 1000` → `process.env.CI ? 90 * 1000 : 60 * 1000`.
      Evidence rev 2: **61 of 96 failures carry the 30 s squeeze** (E20) against a 22–30 s render time —
      stronger than rev 1's count of 29. What this is NOT: a crash fix. It reduces false reds (and,
      second-order, reduces the failure churn that feeds the cascade, E14). Cost: a genuinely-hung test
      now burns 60 s locally instead of 30 s.
- [ ] **B2 — conditional blob reporter in config** (E16 proved there is no other route to ONE merged
      HTML): append `...(process.env.PW_BLOB ? [['blob', { outputDir: process.env.PW_BLOB }]] : [])`
      to the reporter array. Inert unless the runner sets `PW_BLOB`. Without B2 the per-shard-HTML
      fallback applies (one `html-report` folder per shard, ~11 of them at current manifest size).
- [ ] **B3 — fixture teardown hardening** (`pages.fixture.ts` diagnosticsHandler): wrap the per-test
      `tracing.stopChunk` teardown in try/catch with a one-line logged warning. Evidence: **85/96
      failure blocks** carry `Must start tracing before stopping`; **14 failures' real errors are
      completely masked** by it, and those tests' trace.zips are lost (E22). This is an
      evidence-quality fix for every future failure triage (traces themselves largely survive — E22 —
      the throw's harm is error masking), smallest possible diff, no behavior change on the pass path.
      Fixture file is sensitive → gated like B1/B2.
- [ ] **B4 — pin `@playwright/test`** to the exact verified version (currently 1.60.0) instead of
      `^1.58.2` (E11). Everything in this plan's source-verified behavior (E6/E7/E14/E15/E16) is
      version-specific; a silent minor bump on the client's `npm install` invalidates it. Alternative
      if declined: a README note recording the verified version.

---

## Phase 3 — Prove it (BrowserTool: cli)

A design that has not been run is a hypothesis. Run with two cheap shards unless stated.

- [ ] Two-shard run: confirm from output + `run-summary.json` that each shard was its own OS process
      and setup ran per shard (E24).
- [ ] **Isolation proof — load-bearing.** Force one shard to fail (a deliberately failing spec via a
      temp manifest entry; induce a real crash instead if one can be made safely) and show the
      following shard still runs to completion. The report must state WHICH was demonstrated (crash or
      failure) — do not claim crash isolation on the strength of a plain failure.
- [ ] **Artifact-preservation proof (E15/E18)**: after shard 2 completes, shard 1's failure artifacts
      AND its moved `html-report`/`test-results.json`/`junit-results.xml`/`failure-summary.json` still
      exist on disk. This is the check rev 1 did not know it needed.
- [ ] **Exit-code proof**: with one failing shard, `npm run test:sharded`'s exit code is non-zero; with
      all-green shards it is 0.
- [ ] **Allure accumulation proof**: after two shards, `npm run allure:generate`; the report contains
      tests from BOTH shards. If it contains only the last, the §A2 fallback posture applies — record
      which happened.
- [ ] **Merged report** (only if B2 approved): `merge-reports` HTML contains every shard including the
      failed one.
- [ ] **Merged failure-summary proof**: the merged `failure-summary.json` carries failures from both
      shards (healer contract intact).
- [ ] **Census/sampler proof**: `resource-log.csv` populated; between-shard orphan counts logged
      (whatever the number is — 0 is a finding too, see falsifier 3).
- [ ] **Worker-policy proof (A3)**: with a test policy setting one shard to 2 workers, the shard's
      output shows Playwright's "using 2 workers" banner and `run-summary.json` records it; with an
      empty policy `{}`, every shard runs 1 worker (today's behavior). Most-specific-wins resolution
      demonstrated with a `files` entry overriding a `modules` entry.
- [ ] Record wall-clock per shard vs the 4 h 07 m baseline. **Honest expectation**: sharding buys
      isolation, not speed; ~1 018 tests at 22–30 s render is still hours. A large speedup would be a
      surprise to investigate, not celebrate.

---

## Phase 4 — Full sharded regression + closure (GATED on Rutvik's explicit GO)

The standing rule (2026-08-07) is **never run full suites** — fix worthwhile specs, verify solo. This
phase is the one legitimate exception class (suite-infrastructure verification is the deliverable), and
it still fires ONLY on Rutvik's explicit GO in chat, quoted in the execution summary.

- [ ] Full sharded run (sampler ON), merged report preserved to a NEW folder under
      `clients/encore/reports/_preserved/`. Existing preserved reports untouched.
- [ ] Headline result: **of the 424 previously-unrun tests, how many ran this time** — report the
      number plainly.
- [ ] Secondary analyses from `run-summary.json` + `resource-log.csv`: resource curve across shards
      (falsifiers 1–3); failure-rate per shard vs shard start-time (first server-degradation signal);
      orphan counts per shard boundary.
- [ ] Update `docs/read_only_docs/LEARNED_RULES.md` with the corrected rule: a long single-invocation
      Playwright run on this stack cascades after enough failure churn, `0xC0000142` deaths hit FRESH
      workers (the leak outlives workers), retries>0 CAN re-queue crash victims but cannot survive the
      cascade, and `--reporter`/outputDir semantics destroy prior shards' evidence unless the runner
      preserves it. (Replaces the rev 1 draft wording, which restated the retired one-browser theory.)
- [ ] `clients/encore/README.md`: document `npm run test:sharded` as THE way to run the full suite
      (one-line reason: crash isolation), the per-shard re-run flag, and — if B4 declined — the
      verified-version note.
- [ ] Activity-log row (LR-028, LR-037 timestamp gate). `/final-q` exit.

---

## Phase 5 — Parallelism VALIDATION layer (advisory; reframed rev 2.2)

**Authority moved**: rev 2 gated worker raises behind a matrix ("a shard has to earn a higher
number"). Rev 2.2 inverts that — the A3 policy file is Rutvik's dictation and is never gated. Phase 5
is now the ADVISORY layer that makes his dictation better-informed: it builds the evidence, flags the
risks, and offers proof-runs on request. It still starts only after Phase 3 has proven shard isolation
(two variables at once make the next failure undiagnosable) — but the A3 mechanism itself ships in
Phase 1 and is usable immediately.

**The constraint that decides everything** (prior art G-7): every spec writes to office 1604 — two
writers collide because they share DATA, not a module. The unit of isolation is the office.

- [ ] Build the parallel-safety matrix that does not exist: per spec file — writes? (save / create /
      import / office switch) → which office? Seed from `nm3344-leakaudit-0811b`'s static mutation
      table; verify against the specs. **Collision note**: `SUBPLAN_OPI_B` produces a per-CONSTANT
      office-access inventory (78 constants) — if OPI_B has landed, CONSUME it and build only the
      per-SPEC write-classification delta; do not re-derive what it captured.
- [ ] Classify each shard `read-only` / `writes-shared-office` / `writes-isolated`.
- [ ] **New axis (rev 2)**: same-user concurrent sessions. Two workers = two live sessions for the same
      automation user (worker-scoped fixture per worker, same `storageState`). Before any raise, verify
      the app tolerates N concurrent sessions for one user (no session-invalidation, no "logged in
      elsewhere") — a cheap 2-worker probe on a read-only shard answers it.
- [ ] **New caveat (rev 2)**: shard boundaries and worker interleaving change test ORDER. Specs that
      accidentally depend on a predecessor's leftover 1604 state may flip either way. Any
      new-failure-on-raise is first triaged as an order-dependency suspect, not auto-filed as flake.
- [ ] Keep the ADVISORY loop honest: when a policy raise is in effect, offer (never require) the
      two-identical-runs proof at that count; record wall-clock saving per raise; report raises that
      buy little — the decision to keep or revert stays with the policy's author.
- [ ] Feed findings back as data: matrix rows become the runner's WARN-list seed (A3), so the advisory
      warnings sharpen as the matrix grows.
- [ ] Anything requiring per-worker office isolation is handed to
      `PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (OPI master, currently parked) — the OPI
      family owns structural office isolation. Rev 1's handoff to `PLAN_ENCORE_CI_2W_GREEN.md` was
      WRONG: that plan explicitly disclaims G-7 remediation ("quarter-scale work, not in this plan").

Honesty requirements: "passed twice at 2 workers on <date>", never "parallel-safe"; if the matrix says
almost everything writes 1604, say the ceiling is low rather than raising numbers to show progress; do
not repeat the prior plan's `MAX_WORKERS=2` move without acknowledging it was a mitigation.

---

## Per-Identity Satisfaction (LR-048 v3)

| Identity | Duty | Concrete deliverable | Verification |
|---|---|---|---|
| OWNER | shard manifest + runner + npm script + docs | `clients/encore/scripts/shard-manifest.json`<br>`clients/encore/scripts/run-sharded.js`<br>`clients/encore/package.json`<br>`clients/encore/README.md`<br>`docs/read_only_docs/LEARNED_RULES.md` | Phase 3 checklist recorded incl. artifact-preservation + exit-code proofs; merged/fallback reporting stated plainly |
| HUNTER | (none) | (skipped: no product surface is walked — this plan changes suite invocation, nothing in the app) | n/a |
| GIVER | (none) | (skipped: no test cases authored or changed; suite contents untouched) | n/a |
| BUILDER | (none) | (skipped: no spec/page-object logic changes; B3 is a teardown try/catch inside a fixture, executed only under Phase-2 approval and shipped as the smallest possible diff) | n/a |
| HEALER | (none) | (skipped: the 85 genuine non-crash failures are a separate workstream — see §Out of scope; the merged failure-summary.json keeps their triage contract intact) | n/a |
| WATCHDOG | isolation + preservation claims audited, not self-graded | `.claude/state/ua-worker/<run-id>/result.md` (cross-family reviewer verdict on Phase 3) | reviewer confirms crash-vs-failure honesty AND the artifact-preservation check ran |
| GARDENER | (none) | (skipped: runner is net-new; no refactor of existing source) | n/a |

---

## Acceptance

- [ ] Phase 0 re-derivation commands reproduce E18–E22 counts within ±2; drift reported
- [ ] `shard-manifest.json` exists; every shard ≤120 tests by `--list` count; runner warns on breach
- [ ] `run-sharded.js` runs shards as separate processes, continues past failure/crash, and its OWN exit
      code reflects shard outcomes (non-zero on any failure)
- [ ] Shard N+1 does not destroy shard N's artifacts (per-shard `--output` + post-shard moves proven in
      Phase 3)
- [ ] Allure verified to accumulate across shards (or fallback recorded); allure/blob cleaned at run
      START only — no cross-run mixing
- [ ] JSON, JUnit, per-shard HTML, and merged `failure-summary.json` all present after a sharded run
- [ ] Between-shard orphan census + reap runs and logs counts; sampler CSV produced
- [ ] Watchdog kills a hung shard and the run continues (provable with a temp infinite spec in Phase 3
      or explicitly deferred with reason)
- [ ] `worker-policy.json` honored end-to-end: file > module > default resolution, per-shard
      `--fully-parallel` opt-in, empty policy = serial baseline, resolved counts in `run-summary.json`,
      shared-office WARN lines advisory-only (never block)
- [ ] Isolation demonstrated with an honest crash-vs-failure statement
- [ ] `npm run test:sharded` works from a clean checkout of the shipped client folder (Windows spawn
      discipline included)
- [ ] B1–B4 each either applied with Rutvik's quoted approval, or recorded as declined
- [ ] Phase 4 runs only on Rutvik's quoted GO; count of previously-unrun tests reported; resource curve
      + orphan counts analyzed against falsifiers 1–3
- [ ] No `playwright.config.ts` / `pages.fixture.ts` / dependency-pin edit without Phase-2 approval on
      record
- [ ] Existing preserved reports untouched; LEARNED_RULES + client README updated
- [ ] Phase 5 (if reached): matrix covers every spec file (consuming OPI_B's inventory if landed);
      every raise justified by a matrix row + proven twice; same-user concurrency probed before any
      raise; wall-clock savings recorded; office isolation handed to the OPI master plan

---

## Out of scope (deliberately)

- **The 85 genuine non-crash failures** (96 − 11 crashes). They need their own RCA workstream — with the
  honest coupling stated: every failure churns a worker (E14) and churn feeds the cascade, so fixing
  them ALSO reduces crash pressure. Folding them in here would hide whether the sharding fix worked.
  The 14 masked failures (E22) become triageable only after B3.
- **Making a single test faster.** The 22–30 s render time is the environment's. Phase 5 attacks
  wall-clock via concurrency, not per-test speed.
- **Per-worker office isolation** — the OPI family owns it
  (`PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` + subplans A–Z, parked for a later wave).
  `PLAN_ENCORE_CI_2W_GREEN.md` explicitly disclaims this scope and keeps only its independent
  loud-save/goto items.
- **Changing the session fixture from worker scope to test scope.** Rev 1 rejected it (blast radius);
  rev 2 adds the stronger reason: the crash mechanism is not inside one browser's lifetime (E14/E21),
  so the fixture's scope is not the lever. B3 touches only the teardown's error handling, not the scope.
- **Server-side degradation investigation.** Phase 4's per-shard timing analysis produces the first
  signal; acting on it is a separate plan if the signal is real.

---

## Handoff

On completion: flip the Status field, add the executed date, append the activity-log row, `git mv` this
file to `plans/done/`, run `npm run plans:reindex`, and commit. Do not hand-edit `plans/INDEX.md` (LR-035).
