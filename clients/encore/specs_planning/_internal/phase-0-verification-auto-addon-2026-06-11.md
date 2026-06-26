# Phase 0 — Empirical Verification Gate — Auto Add-On

**Subplan**: SUBPLAN_AUTO_ADDON_FCC.md
**Module**: auto-addon (Location Settings → Basic Information → Auto Add-On sub-tab)
**Date**: 2026-06-11
**Identity**: OWNER
**Browser tool**: Playwright CLI (`playwright-cli -s=e2e`) — catalog walkthrough (5 checkboxes) + unattended save-cycles; no visual/CSS assertion, no fresh-passkey need, no mid-execution `pause:` step (LR-038 v2 matrix; LR-054 Table 2 covers click/fill/eval/network/state-load).

**Verdict: PROCEED**

---

## Gate D0 — Dependency + browser-tool + empirical checks

| Check | Result | Evidence |
|---|---|---|
| `SUBPLAN_NOTES_FCC_PILOT.md` is DONE (paradigm infra shipped) | ✅ PASS | `ls plans/done/SUBPLAN_NOTES_FCC_PILOT.md` resolves |
| `field-case-runner.ts` exports `saveAndVerifyCase` | ✅ PASS | grep `clients/encore/src/utils/field-case-runner.ts:41` → `export async function saveAndVerifyCase(c: FieldCase)` |
| Spec / page-object / selectors / data exist (BLEND, not net-new) | ✅ PASS | all 4 `ls` resolve; `npx playwright test location-auto-addon.spec.ts --list` → 19 runtime TCs (TC-LOC-AAO-001..015, 017..020) |
| Local runs use `.env.local`, never `CI_ENV=e2e` (LR-ENC-003) | ✅ PASS | `.env.local` present; no CI_ENV set |
| Browser tool: CLI announced | ✅ PASS | this artifact + first chat output |
| Live env reachable + authenticated | ✅ PASS | `playwright-cli -s=e2e open .../1604/settings/location` → title "Location Settings \| Navigator"; deep-pierce returned full tablist incl. `location-settings-sub-tab-auto-add-on`; NO Microsoft-login redirect |

## Empirical verification (nested-orbit v2 Phase 0)

| Theory | Check | Result |
|---|---|---|
| Page-collision (about:blank vs real) | `open` landed directly on real Location Settings page (title asserted), not blank/login | ✅ no collision |
| Context-options propagation (auth) | `state-load clients/encore/.auth/encore-state.json` then re-`goto` rendered authenticated content (auth state mtime 2026-06-11 01:18, fresh) | ✅ propagates |
| Trace fidelity (live DOM truth) | Deep shadow-pierce eval returned 5 Auto Add-On checkboxes with live `aria-checked` matching `AUTO_ADDON_DEFAULTS` exactly | ✅ faithful |
| Per-TC baseline reachability | Toggled ECDS → Save enabled → Save dialog "Save Changes"/Cancel·Ok → Ok → `PUT /navigator/api/location/update-properties` 200 → reload persisted → restored to default | ✅ full save+restore cycle reachable unattended |

## Notes
- Auth via `state-load` requires the browser to be opened first (`open` before `state-load`); the initial `open` already lands authenticated on a persistent profile.
- Sub-tab activation: the Radix tab needs a real Playwright `click` (`playwright-cli click "[data-testid=...]"`), not raw-JS `.click()` (navigation.md §B Radix-tab quirk; raw pointer-event dispatch did NOT flip `aria-selected`).
- Post-`goto` render is async — poll for the sub-tab/checkbox testid before clicking (LRN-002 near-empty-first-snapshot).

**PROCEED** — all gates green. Continue to Phase 0.5b.
