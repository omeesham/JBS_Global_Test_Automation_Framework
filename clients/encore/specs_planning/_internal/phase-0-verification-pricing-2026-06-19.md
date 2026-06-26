# Phase 0 — Empirical Verification Gate — Pricing (resume session)

**Subplan**: SUBPLAN_PRICING_FCC.md
**Module**: pricing (Location Settings → Pricing sub-tab)
**Date**: 2026-06-19
**Identity**: OWNER
**Browser tool**: Playwright CLI (`playwright-cli -s=e2e`) — catalog walkthrough (currency/dropdowns/cascade, ~79-element machine-enumerated denominator) + unattended save-cycle re-verification of the 7 historical skips; no visual/CSS assertion, no fresh-passkey need, no mid-execution `pause:` step (LR-038 v2 matrix; LR-054 Table 2 covers click/fill/eval/network/state-load).

**Verdict: PROCEED**

This session RESUMES the subplan at Phase 0.5b per the 2026-06-18 `## Deferral Authorization` block (user: "defer stage 3, give put a chip for it to continue in next session" — resume via `/execute SUBPLAN_PRICING_FCC.md`). Supersedes `phase-0-verification-pricing-2026-06-18.md` (gates re-confirmed today; the dependency `PLAN_EXHAUSTIVE_WALK_GUARANTEE` is now DONE, which it was not at the prior pass).

---

## Gate D0 — Dependency + browser-tool + empirical checks

| Check | Result | Evidence |
|---|---|---|
| `SUBPLAN_NOTES_FCC_PILOT.md` DONE (FCC infra) | PASS | `ls plans/done/SUBPLAN_NOTES_FCC_PILOT.md` resolves |
| `PLAN_EXHAUSTIVE_WALK_GUARANTEE.md` DONE (Depends-on; run FIRST) | PASS | `ls plans/done/PLAN_EXHAUSTIVE_WALK_GUARANTEE.md` resolves; Phases 1–6 BUILT + live-validated 2026-06-19 (navigation.md §C row 110); `npm run walk:enumerate -- --office=1604 --module=pricing` runs `scripts/walk-coverage/enumerate-page.mjs` |
| `field-case-runner.ts` exports `saveAndVerifyCase` | PASS | grep `clients/encore/src/utils/field-case-runner.ts:41` → `export async function saveAndVerifyCase(c: FieldCase)` |
| Spec / page-object / selectors / data / TC-MD / test-plan exist (BLEND, not net-new) | PASS | all `ls` resolve; `npx playwright test location-pricing.spec.ts --list` → 33 runtime pricing TCs, **1 hard-skipped** (TC-025 `:480`). The prior pass already re-enabled TC-020 + TC-026..030 (un-hardened — RC-7 to remediate in Phase 3). |
| Local runs use `.env.local`, never `CI_ENV=e2e` (LR-ENC-003) | PASS | `.env.local` present (`BASE_URL=https://cloudapps-e2e.encoreglobal.com/navigator/`); no `CI_ENV` set |
| Browser tool: CLI announced | PASS | this artifact + first chat output (BrowserTool: cli per subplan frontmatter) |
| Live env reachable + authenticated (Gate 3) | PASS | `playwright-cli -s=e2e open …/navigator/` landed on `Sign in \| Navigator` (no cookies) → `state-load clients/encore/.auth/encore-state.json` (mtime 2026-06-18 17:44) → re-`goto …/locations/1604/settings/location` → title "Location Settings \| Navigator", URL = the pricing tab; **NO Microsoft/Entra redirect** → Gate 3 satisfied, no headed fallback needed |

## Empirical verification (nested-orbit v2 Phase 0)

| Theory | Check | Result |
|---|---|---|
| Page-collision (about:blank vs real) | re-`goto` after `state-load` landed directly on real Location Settings page (URL + title asserted), not blank/login | no collision |
| Context-options propagation (auth) | `state-load` then re-`goto` rendered authenticated content; auth-state mtime 2026-06-18 17:44 (<1 day) | propagates |
| Trace fidelity (live DOM truth) | content renders inside `<next-location-settings>` shadow root — Playwright locators + the machine enumerator (`enumerate-page.mjs`, shadow-piercing + CDP) read live DOM; `document.querySelector` does NOT pierce (nav-registry row 99) | method established |
| Per-TC baseline reachability | save endpoint family `POST /navigator/api/location/pricebook/upsert-location-pricebook` + `PUT /navigator/api/location/update-properties` (live-captured 2026-06-18); LR-056 network filter on `/navigator/api/`; the documented `POST update-location-pricing` name is STALE | save+restore cycle reachable unattended |

## Plan-altering discoveries carried into the resume (LR-020/LR-024)

1. **The 7-skip set is already 6/7 re-enabled (un-hardened).** Current spec = 33 runtime tests, only `TC-025` skipped (BUG-LOC-PRI-001, Corp-Pricing app-wide revert). Phase 3 must harden TC-020 + TC-026..030 atomically (RC-7 / LR-021 corollary), not re-discover them.
2. **Machine-enumerator now mandatory (LR-062).** Both the Phase 0.5b baseline walk and the Phase 1 field inventory must be driven by `enumerate-page.mjs` (1604 pricing denominator ≈ 79–86), every element dispositioned, `Coverage_Ratio: N/N (100%)`. The 2026-06-18 inventory (`coverageScope: PARTIAL`) is superseded.
3. **BUG-LOC-PRI-001 baselineComparison = `not-checked`** (honest, per RC-6) pending the Phase 0.5b old-site walk — reclassify after.
4. **`POST update-location-pricing` endpoint name is STALE** in spec comments — real save = pricebook upsert + update-properties (both 200).

**PROCEED** — all D0 gates green. Continue Phase 0.5b (old-site baseline, RC-3 remediation) → 0.5fg (false-green sweep refresh) → 1 (exhaustive inventory) → 1.5 (un-skip re-verification) → 2 → 3 → 4 → 5 → 6.
