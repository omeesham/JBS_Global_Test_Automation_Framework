# PLAN — Legal Baseline Fix (the 7 location-legal hard failures)

**Plan ID**: PLAN_LEGAL_BASELINE_FIX
**Status**: DONE
**Date**: 2026-05-28
**Executed**: 2026-05-28
**Author**: OWNER session
**PermissionMode**: execution (file edits to one page object + one spec)
**Depends-on**: none (this is the tactical fix; the sibling generalisation plan PLAN_SPEC_BASELINE_ENFORCEMENT, still in the scratch queue, generalises it)
**On approval**: persisted to the repo plan queue + reindexed per LR-035 (never hand-edit INDEX.md). Done 2026-05-28 (e.g., this plan now lives under `plans/done/`).

---

## 1. What triggered this (for a blind auditor)

On **2026-05-28** a full Playwright suite run finished with **10 hard failures** (failed on both
attempts). **7 of them were in `clients/encore/specs/locations/location-legal.spec.ts`**:
TC-LOC-LGL-009, 010, 011, 012, 013, 014, 018 — all save/revert/persist tests on office 1604's
"Legal" tab (Service Charge + Terms & Conditions dropdowns). The user invoked `/rca` on these 7.

A mama-led `/rca` (artifact subagent + HEADED live-walk subagent, both Opus, blind to each other)
was run. Verdict: **test-isolation defect, NOT an app bug** — proven two ways (live reproduction +
17/17 pass in isolation). This plan implements the fix the RCA pointed to.

## 2. Intent

Make the 7 legal tests pass **deterministically, even when office 1604 starts a run in a dirty
(non-default) state** — without weakening any assertion (no spec drift). Prove the app itself is
untouched (it was never broken).

## 3. Root cause (proven, with evidence)

The Legal describe block is **non-serial** and its `beforeEach` (`location-legal.spec.ts:108-112`)
only guards *navigation*, not *state*. When a prior interrupted run left office 1604 on the **alt**
values (SC=`Administrative Fee`, Terms=`Encore Terms and Conditions`), each test's "select the alt
value → assert Save enables / persists" becomes a **net-zero change** → Angular form stays pristine →
Save never enables → assertion fails. (TC-013's `clickSaveAndGetDialog` returns `'none'` because the
disabled Save button short-circuits — `location-legal.page.ts:217`.)

**Evidence chain:**
- TC-009 retry0 (captured during the `/rca`): option `'Encore Terms and Conditions'` was clicked
  successfully, then `expect(isSaveEnabled()).toBe(true)` failed in **448ms** → a click that produced
  no state change (maps to `location-legal.spec.ts:187`). NOTE: the full-run `failure-summary.json` has
  since been **overwritten by the isolation re-run** (now `passed:17, failed:0, failures:[]`), so a
  blind auditor re-reading that file will NOT find this row — the durable on-disk proof of the
  underlying flake is `failure-summary.json.retryStats.radix {recoveredAtAttempt:{2:7}}` (7 selects
  no-op'd then recovered on attempt 2), which survives.
- error-context.md page snapshots (RCA subagent A): TC-009/011/013 at failure show SC=`Administrative
  Fee`, Terms=`Encore Terms and Conditions`, Save `[disabled]` — both dropdowns already on the alt
  values *before* the act.
- Live HEADED walk (RCA subagent B): re-selecting an already-current Terms value left Save disabled
  (reproduces the 448ms fail); a *genuine* Terms-from-default change DID enable Save and DID persist
  across reload (**app is healthy**); the spec passes **17/17 in isolation** twice (the lighter
  single-spec load lets the baseline select land — see the keystone below for the isolation-vs-full-run
  differential).
- `playwright.config.ts:34` `fullyParallel:false` → intra-file tests run serially in one worker; only
  this spec **writes** the Legal SC/Terms dropdowns (verified: `location-management-history.spec.ts`
  has zero `selectServiceCharge`/`selectTerms` calls) → the dirt came from a **prior interrupted run**,
  not from a concurrent worker in this run.

**Why TC-001's baseline didn't save the full run (the keystone — answers "if TC-001 restores first,
why did it still fail?"):** TC-001 is the first baseline *within the non-FCC describe*, but it is NOT
the first test in the file — the FCC describe (`spec:29-102`, TC-019) precedes it and its `cleanup:`
(`spec:98`) calls the SAME un-hardened `ensureDefaultState`. So there are **two** restore points before
the value-tests, and both (a) drive the 114-option Radix SC select — documented-flaky (LR-025;
`retryStats.radix {2:7}`), able to "click successfully" yet leave the Angular model unchanged, and
(b) finish with `clickSave()`, which returns `{success:true}` even when Save is disabled
(`base-page.ts:360-363`). Under full-run contention the select silently no-ops → the disabled Save is a
silent no-op → the restore never lands. Critically, **TC-001's assertions (`spec:132-134`) check only
URL / column-headers / row-count — never SC/Terms == default** — so the silent failure is invisible:
TC-001 PASSES while leaving 1604 on the alt values, and TC-009+ inherit the dirt. In isolation the
lighter load lets the select land, so the baseline holds and the spec passes 17/17. This is exactly why
the fix must make the baseline (i) run per-test and (ii) THROW when it cannot reach default (changes
#1+#2).

## 4. Scope

In: `location-legal.spec.ts` (non-FCC describe, lines 104-298) + `location-legal.page.ts`.
Note: change #1 hardens the **shared** `ensureDefaultState`, which the FCC describe (lines 29-102) also
uses as TC-019's `baseline:`/`cleanup:` (`spec:80,98`) — so FCC's baseline/cleanup inherit the same
silent-no-op protection for free (a positive side effect; no change to FCC's assertions or test logic).
Out: no NEW test logic in the FCC describe; all other specs (covered by PLAN_SPEC_BASELINE_ENFORCEMENT);
the app (no app change).

## 5. Changes (concrete)

1. **Harden `LocationLegalPage.ensureDefaultState`** — `location-legal.page.ts:180-194`.
   Currently calls `clickSave()` unchecked (`page:191`), so a silent no-op restore passes unnoticed.
   Replace the best-effort body with a **bounded retry (max 3) that wraps the WHOLE cycle —
   read → re-select → save → reload → re-verify** — modelled on the proven precedent
   `location-hist-notes.spec.ts:91` (which retries the flaky *action* `ensureEmptyState()`, not just the
   save). Per attempt: if SC or Terms ≠ default, re-select it; if anything was dirtied, call the EXISTING
   `saveAndConfirm()` (`page:168-173`, already does `if(!result.success) throw` on a real 4xx/5xx)
   instead of raw `clickSave()`; reload; re-read SC + Terms; **return** if both now equal default, else
   loop. After 3 attempts still not default → **throw** a descriptive error.
   - **Why the retry wraps the select, not just save+reload** (the critical correction): the flaky step
     is the 114-option Radix SC select (LR-025; `retryStats.radix {2:7}`), which can "click successfully"
     yet leave the Angular model unchanged. Retrying only save+reload would re-save the *unchanged* value
     forever and throw after N attempts without ever healing.
   - **Why throw:** `base-page.ts:360-363` returns `{success:true}` when Save is disabled — a silent
     no-op restore must fail loudly, else it re-rots.
   - **Reuse scope:** `saveAndConfirm()` covers the save+throw step only; the re-select + post-reload
     re-verify is net-new logic in this method (partial reuse, not a drop-in).
2. **Wire baseline into the non-FCC `beforeEach`** — `location-legal.spec.ts:108-112`. After the
   nav-guard, add: `await locationLegalPage.ensureDefaultState(LEGAL_DEFAULTS);` (`LEGAL_DEFAULTS`
   already imported, `spec:4`). **This single line fixes all 7 failures** — every test now starts from
   defaults, so the alt selection is always a real change. Precedent: `location-hist-notes.spec.ts:92`
   already wires a baseline call in `beforeEach`.
3. **Collapse TC-001's inline baseline** — `location-legal.spec.ts:118-131` → call the now-robust
   `ensureDefaultState` (dedupe; TC-001 keeps its header/row-count assertions).
4. **Two correctness fixes** (from `/review`):
   - `clickSaveAndGetDialog` (`page:214-222`): throw a descriptive error when Save is disabled but a
     dialog was expected, instead of returning opaque `'none'`. **Diagnostic-only, NOT a stabiliser:**
     after change #2 baselines every test, TC-013 starts clean → the dialog appears → it passes without
     this fix. #4a only converts a *future* disabled-Save into a loud throw rather than a misleading
     `'none'`. Kept as cheap defense-in-depth; drop it if this plan should touch only
     stabiliser-critical lines (your call).
   - Delete dead `getCheckedOption` (`page:146-157`, `@deprecated`, zero callers — grep-verified: only
     the definition matches, no callers).

## 6. Why this approach (not the alternatives)

- **Baseline reset, not assertion weakening** — the app is healthy, so we fix test isolation, never
  the assertions (would be REJECT-bucket spec drift).
- **`beforeEach` one-liner, not a fixture** — navigation already happens in `beforeEach`; baseline
  naturally follows it there. (Full DROP/KEEP evidence is in PLAN_SPEC_BASELINE_ENFORCEMENT §6.)

## 7. Verification (runnable — blind auditor can re-run)
- Reproduce-then-fix: live-set 1604 Legal to alt values + Save, then
  `npx playwright test specs/locations/location-legal.spec.ts --project=encore-locations --retries=0`
  → **17 passed** (self-heals from the exact dirty start that failed). Run a 2nd time → still 17.
- `npm run typecheck` clean.
- (Restore 1604 to defaults at the end — the RCA live-walk already left it clean.)

## 8. Audit notes / risks
- `ensureDefaultState` runs in every Legal test's `beforeEach` now (incl. read-only tests like TC-002
  default-values, TC-007 save-disabled) — that's intended (they benefit from a guaranteed-clean start)
  and adds only 2 field reads when already clean.
- The baseline saves, and its Radix SC select **IS documented-flaky** (LR-025 — 114 options;
  `failure-summary.json.retryStats.radix {recoveredAtAttempt:{2:7}}` = 7 no-op-then-recover selects this
  run; cf. also `location-hist-notes.spec.ts:77`, BUG-LOC-NTS-001). That flake is precisely what change
  #1's whole-cycle retry + final throw is built to contain — it is the modelled risk, not an unmodelled
  one. (An earlier draft wrongly called this "combobox-only … no documented flakiness" — struck: it was
  false and contradicted §3's own root cause.)
- **Change #4a is diagnostic-only, not a stabiliser** (see §5.4) — listed here so the scope is honest:
  the 7 failures are fixed by changes #1+#2 alone.

## 9. Audit corrections folded in (2026-05-28, second-pass `/audit`)
All claims re-verified against live code/artifacts this session. Corrections applied above:
- **F1 (critical):** §5.1 retry now wraps the whole **read→select→save→reload→verify** cycle, not just
  save+reload — the flaky step is the Radix select; retrying save alone never heals.
- **F2:** struck §8's false "no documented flakiness" clause (contradicted LR-025 + `retryStats.radix`).
- **F3:** added the §3 keystone — TC-001 (and TC-019's `cleanup:`) restore can silently no-op under
  load, and TC-001's assertions never check SC/Terms==default, so the failure is invisible.
- **F4:** §5.1 now reuses the existing `saveAndConfirm()` for the save+throw (partial reuse noted).
- **F5:** §4 scope corrected — change #1 also hardens FCC's shared `ensureDefaultState` baseline/cleanup.
- **F6:** §3 first bullet flags that `failure-summary.json` was overwritten by the isolation run (now
  17/0); the durable flake proof is `retryStats.radix {2:7}`.
- **F7:** §5.4 labels change #4a diagnostic-only (your call whether to keep it).

---

## Execution Summary

_2026-05-28, OWNER session via `/execute`._

All 4 changes implemented exactly as specified. No app change. No assertion weakened (zero spec drift).

**Changes made:**
1. **Change #1 — `ensureDefaultState` hardened** (`clients/encore/src/pages/locations/location-legal.page.ts:175-201`): best-effort body replaced with a max-3 bounded retry wrapping the WHOLE cycle (read → re-select → `saveAndConfirm()` → reload → re-verify against the persisted DOM); returns when both SC+Terms == default, throws after 3 attempts. Reuses the existing `saveAndConfirm()` (page:155-160) for the save+throw step (partial reuse per F4). The retry wraps the flaky Radix select (LR-025), not just save+reload (F1).
2. **Change #2 — per-test baseline wired** (`clients/encore/specs/locations/location-legal.spec.ts:111-116`): `await locationLegalPage.ensureDefaultState(LEGAL_DEFAULTS);` added to the non-FCC `beforeEach` after the nav-guard.
3. **Change #3 — TC-001 inline baseline collapsed** (`location-legal.spec.ts:118-125`): removed the redundant `navigateToLegalTab` + 14-line inline restore block (now covered by the per-test `beforeEach`); TC-001 keeps its URL / column-header / row-count assertions.
4. **Change #4a — `clickSaveAndGetDialog` throw-on-disabled** (`location-legal.page.ts:221-234`): `return 'none'` on disabled Save replaced with a descriptive throw (diagnostic-only per F7; only caller TC-013 always expects `'save-changes'`). **Change #4b — dead `getCheckedOption` deleted** (was `@deprecated`, grep-verified zero live callers).

**Verification results:**
1. `npm run typecheck` (`tsc --noEmit`) → clean, 0 errors.
2. Reproduce-then-fix (the meaningful proof — a clean-state run is vacuously green): live-set office 1604 Legal to the alt values (SC=`Administrative Fee`, Terms=`Encore Terms and Conditions`) via a throwaway spec + Save (confirmed persisted), then `npx playwright test specs/locations/location-legal.spec.ts --project=encore-locations --retries=0` → **17 passed (2.4m)**. The run log captured the documented Radix flake firing (`[RETRY 1/3] Option click failed for "Resort Service Charge" — Escape and reopen`) and the whole-cycle retry containing it — the modeled risk (F1 / LR-025 / `retryStats.radix {2:7}`) materialized and the design held.
3. Second run, same command, `--retries=0` → **17 passed (2.4m)** — deterministic self-heal confirmed.
4. Throwaway dirtying spec deleted; `git status` shows only the 2 intended files modified. Office 1604 left at defaults (TC-018 + TC-019 cleanup restore).

**TC disposition:** No TCs added, dropped, or deferred. The 7 originally-failing TCs (TC-LOC-LGL-009/010/011/012/013/014/018) now pass with **unchanged assertions** — fixed by per-test baseline (changes #1+#2). FCC TC-019 inherits the hardened shared `ensureDefaultState` via its `baseline:`/`cleanup:` hooks (F5 positive side-effect; no FCC test-logic change).

**Out of scope (untouched, as planned):** the FCC `beforeEach`; the 3 sibling net-zero failures (auto-addon TC-AAO-020, shared-setup TC-SSL-021, local-office TC-LOS-BAS-049) and the latent specs — all owned by the named sibling plan PLAN_SPEC_BASELINE_ENFORCEMENT. No app change.

**Docs/artifacts touched:** `.claude/context/navigation.md` Legal-row updated (per-test baseline self-heal noted; Last-updated → 2026-05-28). Regression-guard before/after snapshots at `.claude/state/regression-snapshots/PLAN_LEGAL_BASELINE_FIX-{before,after}.json`.
