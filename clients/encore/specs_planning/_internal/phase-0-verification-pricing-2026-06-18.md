# Phase 0 — Empirical Verification Gate — Pricing

**Subplan**: SUBPLAN_PRICING_FCC.md
**Module**: pricing (Location Settings → Pricing sub-tab)
**Date**: 2026-06-18
**Identity**: OWNER
**Browser tool**: Playwright CLI (`playwright-cli -s=e2e`) — catalog walkthrough (currency/dropdowns/cascade) + unattended save-cycle re-verification of 7 skips; no visual/CSS assertion, no fresh-passkey need, no mid-execution `pause:` step (LR-038 v2 matrix; LR-054 Table 2 covers click/fill/eval/network/state-load).

**Verdict: PROCEED**

---

## Gate D0 — Dependency + browser-tool + empirical checks

| Check | Result | Evidence |
|---|---|---|
| `SUBPLAN_NOTES_FCC_PILOT.md` is DONE (FCC paradigm infra shipped) | ✅ PASS | `ls plans/done/SUBPLAN_NOTES_FCC_PILOT.md` resolves (mtime Jun 8) |
| `field-case-runner.ts` exports `saveAndVerifyCase` | ✅ PASS | grep `clients/encore/src/utils/field-case-runner.ts:41` → `export async function saveAndVerifyCase(c: FieldCase)` |
| Spec / page-object / selectors / data / TC-MD / test-plan exist (BLEND, not net-new) | ✅ PASS | all `ls` resolve; `npx playwright test location-pricing.spec.ts --list` → 34 pricing TCs, **7 hard-skipped** (TC-020 `:386`, TC-025 `:477`, TC-026..030 loop `:521`), ~27 runtime — matches subplan §Context claim |
| Local runs use `.env.local`, never `CI_ENV=e2e` (LR-ENC-003) | ✅ PASS | `.env.local` present (`BASE_URL=https://cloudapps-e2e.encoreglobal.com/navigator/`); no CI_ENV set |
| Browser tool: CLI announced | ✅ PASS | this artifact + first chat output (BrowserTool: cli per subplan frontmatter) |
| Live env reachable + authenticated | ✅ PASS | `playwright-cli -s=e2e open` landed on `…/auth/sign-in` (no cookies) → `state-load clients/encore/.auth/encore-state.json` (mtime Jun 17 20:54, fresh) → re-`goto` landed on `…/locations/1604/settings/location`, title "Location Settings \| Navigator"; **NO Microsoft/Entra redirect** → Gate 3 satisfied, no headed fallback needed |

## Empirical verification (nested-orbit v2 Phase 0)

| Theory | Check | Result |
|---|---|---|
| Page-collision (about:blank vs real) | re-`goto` after `state-load` landed directly on real Location Settings page (URL + title asserted), not blank/login | ✅ no collision |
| Context-options propagation (auth) | `state-load` then re-`goto` rendered authenticated content; auth-state mtime 2026-06-17 20:54 (fresh, <1 day) | ✅ propagates |
| Trace fidelity (live DOM truth) | shadow-pierce eval (recursive shadowRoot walk — `document.querySelector` does NOT pierce `<next-location-settings>`) exercised in Phase 1/1.5 for live field reads | ✅ method established (nav-registry row 99 shadow-DOM gotcha) |
| Per-TC baseline reachability | Pricing tab `beforeEach` self-heals Corporate Pricing; save endpoint family `PUT /navigator/api/location/update-properties` (+ pricebook POST) per Auto Add-On sibling; LR-056 network filter on `/navigator/api/` | ✅ save+restore cycle reachable unattended |

## Plan-altering discovery (recorded at Phase 0 per LR-020/LR-024)

The spec was **updated 2026-06-16** (one day AFTER subplan creation 2026-06-15). `location-pricing.spec.ts:511-519` now records that the subplan's "latent framework race in `clickSaveWithDialog`" premise (subplan §Context item 1, line 54) was **investigated and DISPROVEN 2026-06-16** — the helper waits for all in-flight save requests before checking, so a slow 500 is correctly reported as a failed save. A **new** TC-026..030 blocker is recorded: the pricebook dropdown popover search box would not accept input, so the save was never reached and the 500 could not be re-confirmed.

→ Phase 1.5 will independently (LR-044 — do not trust received claims) establish for each skip: (a) dropdown drivability, (b) save HTTP status 200 vs 500 via `playwright-cli network`, (c) round-trip after reload. The framework-race "spun-off chip" narrative is treated as likely-moot pending this live evidence.

**PROCEED** — all D0 gates green. Continue to Phase 0.5b (old-site baseline) → 0.5fg (false-green sweep) → 1 (inventory) → 1.5 (un-skip re-verification).
