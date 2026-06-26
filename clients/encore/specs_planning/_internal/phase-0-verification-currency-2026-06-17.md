# Phase 0 — Empirical Verification Gate — Currency

**Subplan**: SUBPLAN_CURRENCY_FCC.md
**Module**: currency (Location Settings → Basic Information → Currency sub-tab)
**Date**: 2026-06-17
**Identity**: WATCHDOG (pre-build half; the Phase 5 FCC-completeness audit is a SEPARATE session per AUD-017)
**Browser tool**: Playwright CLI (`playwright-cli`) — 3×4 grid walkthrough (Radix checkboxes + comboboxes + read-only cells) + 3 cross-field rule probes; no visual/CSS assertion, no fresh-passkey need, no mid-execution `pause:` step (LR-038 v2 matrix; LR-054 Table 2 covers click/eval/state-load).

**Verdict: PROCEED**

> Date note: the subplan body was authored 2026-06-15 expecting same-day execution; execution is 2026-06-17. Per LR-015 (session-date = filename-date), every dated artifact in this run carries **2026-06-17** (the real walk date). The plan's references/matrix/verification block + closure-C3 paths are updated to 2026-06-17 at Phase 6 (recorded as an execution deviation, not a silent rename — an artifact cannot be honestly dated to a day it was not produced).

---

## Gate D0 — Dependency + browser-tool + empirical checks

| Check | Result | Evidence |
|---|---|---|
| `SUBPLAN_NOTES_FCC_PILOT.md` is DONE (paradigm infra shipped) | PASS | `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` frontmatter `**Status**: DONE` |
| `field-case-runner.ts` exports `saveAndVerifyCase` | PASS | `clients/encore/src/utils/field-case-runner.ts:41` → `export async function saveAndVerifyCase(c: FieldCase): Promise<void>` |
| Spec compiles; 25 literal `test()` + `UNSELECTED_CURRENCY_STATES` loop = 27 runtime | PASS | grep `test('TC-LOC-CUR-` = 25; loop at `location-currency.spec.ts:44` (`for (const cur of UNSELECTED_CURRENCY_STATES)`) parametrizes TC-003/004 = +2 → 27 runtime |
| Fixture `locationCurrencyPage` present (type + impl) | PASS | `pages.fixture.ts:49` (type), `:346-348` (impl) |
| MD per-TC `Status` column read (manual-TC reconciliation, steering #1) | PASS | all 27 TC rows = `✅ Automated`; header "2 manual" is stale arithmetic (the 2 are loop-parametrized TC-003/004) → fix to 27/27/0 in Phase 2 |
| Local runs use `.env.local`, never `CI_ENV=e2e` (LR-ENC-003) | PASS | `.env.local` present (mtime 2026-05-28); no `CI_ENV` set; setup project ran local |
| Browser tool: CLI announced | PASS | this artifact + first chat output (`BrowserTool: cli`) |
| Live env reachable + authenticated | PASS | initial 30-day-old root state was stale (redirected to app `/navigator/auth/sign-in`) → ran framework SSO setup project (`npx playwright test --project=setup`) → fresh `clients/encore/.auth/encore-state.json` (login succeeded attempt 1/3, landed `/locations/1604/home`) → `state-load` → `goto .../settings/location` rendered authenticated content, NO Microsoft-login redirect |

## Empirical verification (nested-orbit v2 Phase 0)

| Theory | Check | Result |
|---|---|---|
| Page-collision (about:blank vs real) | after fresh-state load, `goto` landed directly on real Location Settings page (URL `.../settings/location`, title "Location Settings \| Navigator"), not blank/login | no collision |
| Context-options propagation (auth) | initial stale state redirected to `/navigator/auth/sign-in` (caught honestly); SSO setup refresh → `state-load clients/encore/.auth/encore-state.json` → re-`goto` rendered authenticated grid | propagates after refresh |
| Trace fidelity (live DOM truth) | deep shadow-pierce eval (open `<next-location-settings>` root) returned 3 rows, 4 headers, 6 checkboxes + 3 comboboxes with live `aria-checked`/`disabled`/values matching the test-data constants exactly | faithful |
| Per-TC baseline reachability | exercised all 3 grid rules live (cascade-enable, single-default mutual-exclusion, at-least-one Save-disable) + restored to net-zero pristine — full read/probe/restore cycle reachable unattended (NO Save issued; server untouched) | reachable |
| `clickSave()` ≠ proof-of-persist | confirmed page-object `clickSave()` → shared `clickSaveWithDialog` returns `{success:true}` even when Save is DISABLED → `ensureDefaultState()` (Phase 3) MUST reload+re-read to prove the reset landed | risk noted → Phase 3 hardening |

## Notes
- Auth via `state-load` requires the browser to be opened first (`open` before `state-load`).
- Sub-tab activation: the Radix tab needs a real Playwright `click` (`playwright-cli click "[data-testid=location-settings-sub-tab-currency]"`), not raw-JS `.click()` (navigation.md §B Radix-tab quirk — raw dispatch did NOT flip `aria-selected`; grid content stayed unrendered until the real click).
- Post-`goto` render is async — polled for the sub-tab testid before clicking (near-empty-first-snapshot guard).
- Dirty-form navigation raises a native `beforeunload` modal that blocks `eval`/`goto` until `dialog-accept` — handled during the walk; never required a Save.

**PROCEED** — all gates green. Continue to Phase 0.5 false-green sweep.
