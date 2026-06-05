# PLAN — Spec Baseline-State Enforcement (fix + rule, no static gate)

**Plan ID**: PLAN_SPEC_BASELINE_ENFORCEMENT
**Status**: Pending
**Date**: 2026-05-28
**Author**: OWNER session (reworked after an independent audit + /slop pass — see §6 Decision Record)
**PermissionMode**: execution (one page-object method + spec `beforeEach` wiring + one rule-prose edit + one stale-comment fix)
**Depends-on**: PLAN_LEGAL_BASELINE_FIX (DONE — committed `5c081c9`; legal is the proven pilot)
**On approval**: this file lives at `plans/pending/`; run `node scripts/plans-reindex.mjs` (LR-035).

---

## 1. Context — why this exists

The 2026-05-28 run surfaced a **net-zero-on-stale-state** test-isolation defect: a spec sets a value
from a **fixed set** (combobox option / checkbox state) then asserts `isSaveEnabled().toBe(true)` or
persistence-after-reload — but if office 1604 starts dirty (a prior crashed run, or a per-test retry
that re-runs one failed test without TC-001), the "change" is a net-zero no-op → Save stays disabled →
the assertion fails.

Root cause (verified against live code):
- **LR-019** (`.claude/rules/specs.md:26-37`) mandates baseline only on **the first test (TC-001)**.
- Serial + `dependencyGate` are gone (annotation-only since 2026-05-08, `specs.md:72-74`); tests run
  with per-test `beforeEach` nav-guards.
- `playwright.config.ts:37` = `retries: CI ? 2 : 1`. A retry re-runs the failed test **and its
  `beforeEach`**, NOT TC-001's body — so first-test-only baseline does not protect retries.
- **legal is already fixed + committed** (`5c081c9`): per-test `ensureDefaultState` wired in
  `beforeEach` (`location-legal.spec.ts:115`), TC-001 inline baseline collapsed (`:121`). It is the
  proven template (bounded retry wraps the whole read→re-select→save→reload→re-verify cycle,
  `location-legal.page.ts:175-201`).

## 2. Intent

Fix the remaining net-zero-vulnerable specs the way legal was fixed, and upgrade LR-019 prose so future
authors target per-test. **Deliberately NO static lint / pre-commit gate** — see §6.

## 3. Scope — all 13 specs accounted for

**Fix now (net-zero-vulnerable; the non-legal specs flagged in the 2026-05-28 triage):**
- `location-auto-addon` — TC-001-only inline baseline (`spec:15-36`); checkbox-array shape
  (`AUTO_ADDON_DEFAULTS`); **toast** save (`clickSaveButton`+`clickSaveOk`+`waitForToast`), NOT
  legal's dialog path — the legal method is a *pattern*, not a copy.
- `location-shared-setup-locations` — non-FCC 30-TC describe lacks a per-test reset; `ensureCleanSSLTable`
  already exists and backs the FCC block's `baseline`/`cleanup`.

**Already protected — no change:**
- `location-legal` — DONE (`5c081c9`).
- `location-pricing` — **already self-heals per-test** in `beforeEach` (`spec:32-49`, restores
  `chkCorporatePricing`). NOT latent; leave as-is.

**Latent, NOT fixed this pass (accepted residual — see §6):**
- `location-currency` (TC-001 inline `spec:20-28`), `location-local-information` (TC-001 inline
  `spec:33-94`), `local-office-settings` (TC-001 inline `spec:43-94`) — each carries a TC-001-only
  baseline; none has failed.
  - Only the **fixed-set (checkbox/combobox)** tests in these specs are net-zero-vulnerable. The
    **numeric/date-offset** tests (e.g. local-office date offsets) are free-numeric → LR-009
    recovery-value class, a different defect class — explicitly NOT in scope.

**Out of class (not vulnerable):**
- `location-account-address`, `local-office-ect` — free-text/numeric (LR-009 class).
- `location-notes`, `location-hist-notes` — already baseline via `ensureEmptyState`.
- `location-management-history`, `local-office-history` — read-only history tables (no set-and-save,
  no `isSaveEnabled`; verified).
- All FCC describes — `baseline` is a REQUIRED field of `saveAndVerifyCase` (`field-case-runner.ts:18`).

## 4. Changes (concrete)

1. **Upgrade LR-019 in place** (`.claude/rules/specs.md:26-37`): reword "the first test (TC-001) must…"
   → "a net-zero-vulnerable spec (sets a fixed-set value then asserts Save-enable / persistence) MUST
   reset field state to defaults **per-test in `beforeEach`**, not first-test-only." State why
   (non-serial + per-test retries since 2026-05-08). Cross-ref LR-009/LR-026. No new LR number.
2. **`location-auto-addon`**: add `ensureDefaultState()` to the page object — checkbox-array over
   `AUTO_ADDON_DEFAULTS`, using auto-addon's **toast** save + the legal hardening pattern (bounded
   retry wrapping read→toggle→save→reload→re-verify; reuse base-page primitives). Wire it per-test in
   `beforeEach`; collapse the TC-001 inline restore (`spec:21-35`) so there's no redundant double-reset.
3. **`location-shared-setup-locations`**: wire `ensureCleanSSLTable(OFFICE_NO)` into the non-FCC
   describe's `beforeEach` (verify that block's current `beforeEach` at execution); remove any
   now-redundant TC-001-only reset.
4. **Fix the stale cross-ref** (LR-050): `playwright.config.ts:28-33` still says "each spec's TC-001
   baseline-reset (per LR-019) runs first in source order" — update so the comment doesn't contradict
   the upgraded per-test rule.

## 5. Verification (runnable)

1. Dirty office 1604, then `npx playwright test location-auto-addon --project=encore-locations
   --retries=0` → all pass (self-heal). Repeat for `location-shared-setup-locations`.
2. `npm run typecheck` clean.
3. Rule reworded: `.claude/rules/specs.md` no longer contains "the first test (TC-001) must".
4. No new infrastructure: no `scripts/check-spec-baseline.mjs`, no `.githooks/pre-commit` "Gate 8".

## 6. Decision Record — why NO static lint / pre-commit gate (/slop verdict, 2026-05-28)

The first draft proposed an 80–120 line `check-spec-baseline.mjs` + pre-commit Gate 8. Dropped:
- **A static lint can only check a proxy** ("a method named `ensureDefaultState` exists" / "a signature
  matches"), never the real property ("this test actually resets state per-test"). A no-op
  `ensureDefaultState` satisfies the proxy — so the "foolproof gate" isn't.
- **It duplicates run-all** (LR-018 — run-all is the only truth). A missing per-test baseline surfaces
  as a run-all failure; that's exactly what run-all catches.
- **The 80–120 line analyzer is the over-engineering** — it must parse describe↔`beforeEach`
  associations to infer a runtime property statically.
- **Name-based detection contradicted its own design** — the draft claimed it keyed off the save-side
  signal "NOT a setter-name allowlist," yet its baseline-clear condition WAS a name allowlist that
  would **false-flag pricing** (already self-heals inline).
- **Backstop instead**: upgraded LR-019 (guidance) + run-all (LR-018, structural truth). A future
  net-zero spec without a per-test baseline fails run-all — loudly, no proxy ambiguity.

**Accepted residual**: the 3 latent specs keep TC-001-only baselines. Risk = a per-test retry of a
non-TC-001 test could net-zero-fail. Accepted because (a) none has failed, (b) the fix is the same
small pattern, applied opportunistically when each spec is next touched, (c) speculatively rewriting
passing specs is exactly the churn this plan avoids.

## 7. Out of scope

Static lint + Gate 8 (DROPPED, §6); latent-spec per-test upgrades (accepted residual, §3);
`TC-LOS-BAS-049` rename class; generic field-default framework / auto-fixture wrapper (proxy-value, no
reuse win). `/reflect` + LR-028 activity-log row at execution.
