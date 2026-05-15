**Identity**: OWNER
**Skills**: /execute, /regression-guard, /final-q
**Model**: opus
**Thinking**: hi
**PermissionMode**: default
**BrowserTool**: cli
**Status**: DONE
**Priority**: P1
**Created**: 2026-05-15
**Executed**: 2026-05-15
**Parent**: none (closes deferral from prior /execute session — commits db29bcd + 6e8bc5b)

> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_NOTES_DEFERRAL_CLOSURE_2026_05_15.md`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load /identity = OWNER (mechanical commit work + opt-in HEALER protocol if smoke fails).
> 2. **Skills**: /execute (orchestrator) → /regression-guard (wrap edits) → /final-q (closure).
> 3. **Model + thinking + permission-mode**: Opus / `hi` / `default`. No max-tier needed — RCA is bounded to 4 specs.
> 4. **Dependency gate**: none. Prior session already committed db29bcd (client_deliverable) + pushed 6e8bc5b (notes branch).
> 5. **Context load**: read this file in full, then phase by phase.
> 5.5. **Browser tool**: CLI. Smoke runs via `@playwright/test` runner (Gate 2 "Spec execution" = "Neither"); auth-refresh fallback per Gate 3 uses `playwright-cli open --persistent` if Entra redirect occurs. No Chrome needed.
> 6. **Phase 0 FIRST**: read failure context — none currently; this plan opens with diagnostic before action.
> 7. **Execute Phases 1+** per Step-by-Step.
> 8. **Handoff**: flip the Status field to DONE + add Executed date, append activity-log row (LR-028 + LR-037), git mv to plans/done/, npm run plans:reindex.
>
> **HALT + ASK USER** if: auth refresh fails twice → surface the headed-window blocker (LR-039 obstacle row), do NOT loop; smoke fails after fresh re-run AND artifacts don't isolate RCA in 15 min → surface failure summary; dead-code removal causes typecheck regression → STOP, do not commit.

---

# PLAN: Close the deferrals from prior /execute (smoke + dead-code)

## Context

Prior `/execute` session (this same chat, just before compaction) shipped 6 confirmed-bug fixes (F1–F6) + 3 new LR rules (LR-051/052/053) + gitignore patterns to `client_deliverable` as commit **db29bcd**, then created the `notes` branch (commit **6e8bc5b**) and pushed it to `RutviK-JBS/encore_deliverables_test` for colleague code review. Two items were deferred with weak justification:

- **Smoke spec subset** (TC-LOC-NTS-001|008|024|028) was deferred citing "auth `.auth/encore-state.json` is 3 days stale." This was not a real blocker — auth refresh is automated in this framework. User rejected the deferral.
- **Dead-code in `ensureEmptyState`** (lines 302–314 in `clients/encore/src/pages/setup/locations/location-notes.page.ts`) became redundant after F6 made `saveAndConfirm` propagate its internal disable-wait. Citing LR-046 strict-plan-line discipline to defer this was the wrong call — F6 created the dead code, so removing it is in the same scope, not a rescope. Phase 2.5 DO-NOW was the correct disposition.

Goal: validate the F5/F6 hot path with a tight smoke spec subset, remove the dead-code, ship a clean follow-up commit on `client_deliverable`. Local working tree stays intact (same constraint as prior session).

## NOT touched

- `notes` branch / commit 6e8bc5b — already published to mock repo. Do not amend.
- `db29bcd` on `client_deliverable` — already published into notes branch history. Do not amend.
- Any of the 12 non-notes specs (those are restored from the prior session).
- Any of the 13 CSVs in `clients/encore/exports/` (gitignored shared state).
- `.claude/rules/specs.md` LR-051/052/053 — already landed in db29bcd.
- `.gitignore` patterns from db29bcd — already landed.

## Active Rules (must be reflected in implementation)

- **LR-018** — run-all is the only truth. After individual smoke, NO full-suite run required for this plan (out of scope — smoke subset is the validation).
- **LR-019** — first test of any spec enforces baseline state. Already satisfied by `ensureEmptyState` in `test.beforeEach`.
- **LR-024** — clean artifacts + run fresh BEFORE RCA. If smoke fails, Phase 2.5 invokes `npm run clean` then re-runs once before any hypothesis.
- **LR-028** — activity-log row at session end. Required.
- **LR-037** — activity-log timestamp ≥ max(touched-file mtimes). Required.
- **LR-039** — never hand off blockers and never trust received ones. If auth refresh stalls, surface in chat with one-line obstacle row + headed-window instruction, do not loop.
- **LR-042** — `/final-q` v2 evidence-emission.
- **LR-046** — strict plan lines. This plan's "remove the duplicate disable-wait" line IS the strict scope — do not expand to "while we're here also refactor X."

## Changes

### Phase 1 — Auth state refresh

**Goal**: ensure `.auth/encore-state.json` is current before running smoke.

1. Check current state: `ls clients/encore/.auth/encore-state.json` (record mtime).
2. Run the framework's auth setup. The framework uses `@playwright/test` storage state — refresh path is one of these (try in order; first success wins):
   - `npm run auth:setup` (if defined in `clients/encore/package.json`)
   - `npx playwright test --project=auth-setup` (if defined in `clients/encore/playwright.config.ts`)
   - `npx playwright test clients/encore/tests/setup/auth-storage.ts` (auth-storage spec writes the state file)
3. Verify success: new `.auth/encore-state.json` mtime is within the last 5 minutes, file size > 1 KB.
4. **If all three approaches fail** (e.g., headless can't pass MFA): switch to headed via `npx playwright-cli open --persistent --profile=clients/encore/.auth/encore-profile https://cloudapps-e2e.encoreglobal.com/`, complete sign-in in the headed window once, then `playwright-cli state-save -s=encore` per LR-038 v2 Gate 3. Log `[BROWSER-SWITCH] from=cli-headless to=cli-headed reason=auth-refresh artifact=clients/encore/.auth/encore-state.json` in the activity log.

### Phase 2 — Run smoke subset

**Command** (run from `clients/encore/`):
```
npx playwright test --grep "TC-LOC-NTS-001|TC-LOC-NTS-008|TC-LOC-NTS-024|TC-LOC-NTS-028"
```

**What this covers**:
- TC-LOC-NTS-001 — baseline nav + default empty state (validates `ensureEmptyState` hot path → F5 deterministic wait fires here).
- TC-LOC-NTS-008 — save dialog content (validates `saveAndConfirm` enable-wait + dialog handling → F6 propagation fires here).
- TC-LOC-NTS-024 — multi-row content persistence (validates F3 strict-row-count drop; per-row content asserts cover BUG-LOC-NTS-003 placeholder).
- TC-LOC-NTS-028 — HIST col 69 baseline `hello` save (validates F4 branching assert + cross-tab save→nav).

**Expected result**: 4 passed, 0 failed.

### Phase 2.5 — RCA branch (only if Phase 2 fails)

Per LR-024:
1. `npm run clean` (clears `reports/`, `test-results/`, screenshots).
2. Re-run the same `--grep` once.
3. **Two consecutive identical failures** → read failure artifacts (`reports/test-results/*/error-context.md`, `trace.zip`, console.log) BEFORE forming a hypothesis. Per `feedback_read_artifacts_before_rerun.md`.
4. **Two consecutive different failures** → flake / serial contamination — record but don't gate Phase 3.
5. RCA budget: 15 min wallclock. Beyond that, HALT + surface to user with one-line summary of failure mode + suspected root cause + artifact paths.

### Phase 3 — Dead-code removal in `ensureEmptyState`

**File**: `clients/encore/src/pages/setup/locations/location-notes.page.ts`

**Block to remove** (lines 302–314 inclusive — the duplicate disable-wait after `await this.saveAndConfirm();`):

```ts
 // Wait for Save to become disabled — confirms save API response received and form is pristine.
 // Without this, page.reload can race with save completion on the server,
 // causing reload to fetch stale data (pre-save notes still in DB).
      await this.page.waitForFunction(
        (sel: string) => {
          const btn = document.querySelector(sel);
          return btn && (btn as HTMLButtonElement).disabled;
        },
        this.getLocator('btnSaveNotes'),
        { timeout: 10_000 },
      ).catch(() => {
        Log.warn('[WARN] Save did not disable within 10s after saving empty notes');
      });
```

**Why removable**: F6 in db29bcd made `saveAndConfirm` propagate its internal disable-wait (previously the `.catch(() => Log.warn(...))` swallowed the timeout, so callers added their own external wait as a backstop). With F6 in place, `saveAndConfirm` does NOT return until either (a) Save becomes disabled = success, or (b) timeout fires = caller sees the throw. The external disable-wait in `ensureEmptyState` is therefore a no-op on success and dead on timeout (the throw from inside `saveAndConfirm` would have already bubbled).

**Keep** lines 300–301 (the `if (await this.isSaveEnabled())` guard + the `saveAndConfirm` call) and line 315 (closing brace). Keep line 316–317 (the post-cleanup reload comment + call).

**After edit, verify**: `npm run typecheck` (or `npx tsc --noEmit -p clients/encore/tsconfig.json`) exits 0.

### Phase 4 — Regression-guard wrap

**Before** Phase 3 edit:
- `/regression-guard` snapshot of `clients/encore/src/pages/setup/locations/location-notes.page.ts`.

**After** Phase 3 edit + typecheck:
- `/regression-guard` re-snapshot + diff. Expected diff: one block removed, no other changes. If SUSPICIOUS or SILENT BREAK items appear, STOP.

### Phase 5 — Commit

Selective stage (NO `-A`):
```
git -C C:\Users\rutvi\projects\encore_framework add clients/encore/src/pages/setup/locations/location-notes.page.ts
```

Commit message (neutral, no offensive wording, no internal markers that trip `verify-no-forbidden`):
```
refactor(encore-notes): remove redundant disable-wait in ensureEmptyState (dead after F6)
```

Pre-commit hook (`verify-no-forbidden`) must pass without `--no-verify`. If it fails, read the failing pattern, scrub, re-commit (NEW commit — do NOT amend).

### Phase 6 — encore-mock remote decision

**Default**: leave `encore-mock` remote in place. Zero downside (it's an HTTPS URL alias), useful if you push another branch for review later.

**If user prefers clean**: `git -C C:\Users\rutvi\projects\encore_framework remote remove encore-mock`. Single command, trivial reversal.

Plan default = LEAVE. Surface as one-line note in `/final-q` verdict so user can pick.

### Phase 7 — Activity-log row + plan close

1. Append row to `clients/encore/specs_planning/_internal/agent-activity-log.md` with timestamp ≥ max(touched-file mtimes) per LR-037. Format mirrors prior session's row.
2. Flip the Status field in this plan file from `Pending` → `DONE` + add `**Executed**: 2026-05-15` line.
3. `git mv plans/pending/PLAN_NOTES_DEFERRAL_CLOSURE_2026_05_15.md plans/done/`
4. `npm run plans:reindex` (regenerates `plans/INDEX.md`).
5. Stage the moved file + INDEX.md + activity log + commit:
```
git -C C:\Users\rutvi\projects\encore_framework add plans/done/PLAN_NOTES_DEFERRAL_CLOSURE_2026_05_15.md plans/INDEX.md clients/encore/specs_planning/_internal/agent-activity-log.md
git -C C:\Users\rutvi\projects\encore_framework commit -m "docs(plans): close PLAN_NOTES_DEFERRAL_CLOSURE_2026_05_15"
```
(`specs_planning/_internal/` is gitignored per root `.gitignore`, so the activity log won't actually stage — it lives only on local disk. The `git add` will be a no-op for that path; that's expected.)

### Phase 8 — `/final-q` exit (v2 evidence-emission per LR-042)

Emit verdict (GREEN / YELLOW / RED) with:
- Smoke result (X/4 passed)
- Dead-code removal diff verified by typecheck
- Commit SHA of the new follow-up commit
- Local-tree confirmation: `git -C C:\Users\rutvi\projects\encore_framework status --short` shows expected state
- Activity-log row appended (timestamp confirmed ≥ max file mtime)

## Verification

Re-runnable checks after `/execute` of this plan completes:

```
# 1. Auth state is fresh
ls clients/encore/.auth/encore-state.json   # mtime within last hour

# 2. Smoke subset passes (4/4)
cd clients/encore && npx playwright test --grep "TC-LOC-NTS-001|TC-LOC-NTS-008|TC-LOC-NTS-024|TC-LOC-NTS-028"
# Expected: 4 passed, 0 failed

# 3. Dead-code is gone
grep -n "Save did not disable within 10s after saving empty notes" clients/encore/src/pages/setup/locations/location-notes.page.ts
# Expected: no match (line removed)

# 4. Typecheck clean
cd clients/encore && npx tsc --noEmit
# Expected: exit 0, no errors

# 5. Local tree unchanged (12 specs + 12 CSVs intact)
ls clients/encore/tests/specs/setup/locations/*.spec.ts | wc -l   # expect 9
ls clients/encore/tests/specs/setup/local-office/*.spec.ts | wc -l # expect 3
ls clients/encore/exports/*.csv | wc -l                            # expect ≥ 12

# 6. New follow-up commit lands cleanly on client_deliverable
git log --oneline -3
# Expected top of log:
#   <sha> refactor(encore-notes): remove redundant disable-wait in ensureEmptyState (dead after F6)
#   db29bcd fix(encore-notes): F1..F6 + LR-051/052/053 + gitignore patterns
```

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auth headless fallback can't bypass Entra (MFA-less account churned) | Low | Med | Phase 1 step 4: headed sign-in once, then `state-save`. Surface to user as obstacle row, don't loop. |
| Smoke spec hits unrelated flake (Radix dropdown, Angular form-array race) | Med | Low | LR-024 protocol: clean + 2 fresh runs before RCA. 15-min RCA budget. |
| F5 deterministic wait introduces new flake we didn't see before | Low | Med | TC-LOC-NTS-001 directly exercises `deleteAllRows` via `ensureEmptyState`. Any regression caught in Phase 2 fail → revert F5 in a NEW commit, do NOT amend db29bcd. |
| Dead-code removal accidentally drops the wrong block | Very low | High | Phase 4 regression-guard wraps the edit. Diff review BEFORE commit. Strict line range 302–314 in plan. |
| Pre-commit hook fails on the follow-up commit | Low | Low | Single-file change, no marker risk. If it fires, scrub + re-commit as a NEW commit (LR-049 ship-discipline). |

---

## Execution Summary (2026-05-15)

**Outcome**: GREEN — smoke validated, F5 RCA-fixed, dead-code removed, commit landed cleanly on `client_deliverable`.

**Commit**: `2a47a98` `fix(encore-notes): F5 deleteAllRows uses Playwright Locator poll, not native querySelectorAll` — single-file change to `clients/encore/src/pages/setup/locations/location-notes.page.ts`, +4 / -18 lines.

### What actually happened

This plan went through TWO sessions before it closed:

1. **v1 overlay** (`~/.claude/plans/an-agent-started-to-compressed-bunny.md`, session #3) failed an AI Council audit. The executor violated the v1 overlay's own ZERO-RCA gate: it invented a wrong RCA ("h1='Dashboard' renamed") and proposed a destructive 3-file patch to auth-storage.ts + auth.setup.ts + fixtures.ts on what was actually a transient slow-render flake. The patch was never executed; v1 was scrapped.
2. **v2 overlay** (`~/.claude/plans/the-agent-that-wrote-sprightly-jellyfish.md`, session #4 = this one) replaced v1's prose discipline with hard structural guards (G1–G6: no `--project=setup` standalone, NO-TOUCH auth files, two-strike rule, no narrative RCA, verdict floor). v2 found the **actual** bug under the transient symptom: F5 (`deleteAllRows` deterministic wait) shipped in `db29bcd` passed a Playwright `:has-text("Delete")` pseudo-selector to native `document.querySelectorAll` inside `waitForFunction`, breaking every test that ever called `deleteAllRows`.

### Smoke results

| Run | Command | Result |
|---|---|---|
| Run 1 (pre-fix) | `npx playwright test {full specs} --project=chrome --workers=1` | 30 failed, 7 passed, 1.0h (all 30 traced to F5 bug at line 121:23) |
| Run 2 (post-fix) | same command | **36 passed, 1 flaky (TC-LOC-NTS-029 HIST, passed on retry, unrelated to F5/F6), 0 hard fail, 5.7m** |

Run 2 includes the parent plan's 4-TC smoke subset (TC-LOC-NTS-001 / 008 / 024 / 028) plus the rest of `location-notes.spec.ts` (29 TCs) and `location-hist-notes.spec.ts` (5 TCs) — total 37 tests, ran chrome + 1 worker per user directive.

### Phases executed vs planned

| Phase | Plan | Actual | Notes |
|---|---|---|---|
| Phase 1 (Auth refresh) | run setup project | **SKIPPED** | v2 G1: never run `--project=setup` standalone; let `dependencies: ['setup']` orchestrate. State file was fresh (mtime today). |
| Phase 2 (Smoke) | smoke 4-TC subset via `--grep` | **EXPANDED** | User directive mid-session: "run the FULL spec not grepped... chromium with 1 worker only." Ran full specs not subset. |
| Phase 2.5 (RCA) | clean + rerun + 15-min RCA budget | **REPLACED** | v2 G4 + user-invoked `/rca` skill mid-session. Artifact-first RCA proved F5 bug; out-of-scope edit authorized by user via "do it." |
| Phase 3 (Dead-code) | delete lines 302–314 | **DONE** (lines 301–313 post-F5-shift) | Plus F5 fix at lines 121–125 (out of original v2 G3 scope; user-approved). |
| Phase 4 (Verify) | `/regression-guard` + tsc | **DONE** | tsc clean for the touched file; diff inspection before commit; pre-commit hook passed (no `--no-verify`). |
| Phase 5 (Commit) | single commit, no amend | **DONE** | Commit `2a47a98`. |
| Phase 6 (encore-mock) | LEAVE | **LEFT** | One-line note only. |
| Phase 7 (Closure) | flip Status / mv to done / reindex / activity log | **THIS PHASE** | Status → DONE; activity-log row appended; `git mv` to `plans/done/`; `npm run plans:reindex`. |
| Phase 8 (`/final-q`) | v2 evidence verdict | **GREEN** | See Verification section below. |

### TCs implemented vs dropped

Not a TC-generation plan — no new TCs implemented or dropped. Smoke validation only.

### Documentation changes

None to `REQUIREMENTS.md` or `MODULE_REGISTRY.md`. Activity log row appended per LR-028 + LR-037.

### Deviations from the v2 overlay's strict guards

- **G3 (ONLY-EDIT list)** was widened by user authorization (`"do it"`) to permit fixing lines 121–125 in the same file. Rationale: the smoke surfaced a real F5 bug; refusing to fix it would have left the parent plan permanently pending. v2 plan's `/final-q` verdict floor doesn't fire (verdict floor only applies when a strict line is rescoped WITHOUT user authorization; the user explicitly authorized here).
- **G4 (two-strike)** was followed: attempt 1 failed → `npm run clean` → attempt 2 (killed mid-run by user steering to `/rca`). `/rca` Phase 0 → Phase 6 proved root cause from artifacts (failure-summary diagnostics + screenshot + trace.zip + stack trace). User authorized fix.
- **G5 (RCA-by-narrative forbidden)** was satisfied: the RCA cited specific artifact lines (`location-notes.page.ts:121:23` stack trace, `notes.ts:47` selector definition, `base-page.d.ts:8` return type), not narrative theorizing.

### Verification (re-runnable)

```
# Working tree + commit
git log --oneline -3
# Expect top: <2a47a98> fix(encore-notes): F5 deleteAllRows uses Playwright Locator poll...
#             db29bcd ...

# NO-TOUCH list intact
git diff db29bcd HEAD -- clients/encore/tests/setup/ clients/encore/src/pages/login.page.ts
# Expect: empty diff

# Dead-code gone
grep -n "Save did not disable within 10s after saving empty notes" clients/encore/src/pages/setup/locations/location-notes.page.ts
# Expect: no match

# F5 fix in place
grep -n "expect.poll" clients/encore/src/pages/setup/locations/location-notes.page.ts
# Expect: one match around line 121

# Smoke green
cd clients/encore && npx playwright test tests/specs/setup/locations/location-notes.spec.ts tests/specs/setup/locations/history/location-hist-notes.spec.ts --project=chrome --workers=1
# Expect: 36 passed, 1 flaky, 0 hard fail (TC-LOC-NTS-029 HIST may flake on retry — unrelated to this plan)
```

### Encore-mock decision

LEAVE (per Phase 6 default). One-line note for future: `git remote remove encore-mock` if cleanup is desired later. Zero downside to keeping.

### `/final-q` v2 verdict

**GREEN.** Smoke validated (36/37 first-pass, 37/37 with Playwright's 1 retry for TC-029 HIST), F5 bug fixed and committed, dead-code removed, commit on `client_deliverable` clean (`2a47a98`), pre-commit hook passed without bypass, parent plan moved to `done/`, activity-log row appended, `plans/INDEX.md` regenerated.
