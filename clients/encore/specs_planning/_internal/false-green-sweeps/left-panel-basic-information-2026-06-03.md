---
module: left-panel-basic-information
phase: 0.5fg (False-Green pre-audit)
date: 2026-06-03
identity: WATCHDOG
subplan: plans/pending/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md
verdict: CLEAN (touch-surface) + baseline-absent (net-new spec, forward-looking obligation)
---

# False-Green Pre-Audit — Left Panel (Basic Information)

Per False-Green Doctrine §3. No `location-left-panel*.spec.ts` exists yet → the audit target is
(a) the existing `captureLeftPanelBaseline()` consumer in `location-local-information.spec.ts` and
(b) any bare-`page` destructure in sibling `specs/locations/*` the new spec will sit beside. The
binding obligation for the new spec is **forward-looking** (Phase N below).

## Touch-surface scan (11 sweeps)

| # | Sweep | Finding | Class |
|---|---|---|---|
| 1 | **Bare-`page` destructure** (test uses `@playwright/test` `page` instead of custom fixture) | grep `async (\{ page \}` across `specs/locations/**` → **0 hits**. All 10 sibling specs import `{ test, expect }` from `../../src/infra/fixtures` and destructure page-object fixtures (`locationLocalInfoPage`, `locationLegalPage`, …). | CLEAN |
| 2 | **`captureLeftPanelBaseline()` consumer** | `location-local-information.spec.ts:139` calls `locationLocalInfoPage.captureLeftPanelBaseline()` (via fixture, not bare page). Reads 5 read-only fields for cross-tab invariance. Reuse target — do NOT duplicate. | CLEAN |
| 3 | **Missing-await on async assertions** | n/a — no left-panel spec yet | baseline-absent |
| 4 | **No-assertion / soft-pass tests** | n/a — no left-panel spec yet | baseline-absent |
| 5 | **try/catch swallow** (LR-003) | n/a — no left-panel spec yet | baseline-absent |
| 6 | **Conditional-skip / `test.skip` without reason** | n/a — no left-panel spec yet | baseline-absent |
| 7 | **Fixed `waitForTimeout` inside poll** (LR-052) | n/a — no left-panel spec yet | baseline-absent |
| 8 | **Hardcoded structural counts** (LR-022) | The 24-TC MD hardcodes Region=59 / Servicing=215 / Tax=2 / Country=4. Live: Servicing=**218** (not 215). New spec MUST assert via `.toContain`/`.toBeGreaterThan`, NOT `.toBe(215)`. | FORWARD-OBLIGATION |
| 9 | **OR-expression `.toBe(true)` asserts** (LR-051) | n/a — no left-panel spec yet | baseline-absent |
| 10 | **`networkidle` usage** (LR-023) | n/a — no left-panel spec yet; new spec uses `waitForAngularStable()`. Network listeners (if any) MUST filter `/navigator/api/` not the page URL (LR-056). | FORWARD-OBLIGATION |
| 11 | **State-leak across tests** (STATE-LEAK) | The Country-cascade case mutates 1604 Country/TaxMode/Region + cross-tab Job-Costing/Remit-PST/Legal. New spec MUST restore via `ensureDefaultState` per-test (LR-019) — highest state-leak risk. | FORWARD-OBLIGATION |

## Forward-looking obligations (Phase N — binding on the new spec)

The new `location-left-panel-basic-information.spec.ts` MUST, on pain of Phase 4 false-green RED:
1. `import { test, expect } from '../../src/infra/fixtures'` — NO bare `@playwright/test` `page` destructure.
2. Per-test `ensureDefaultState` baseline (LR-019), NOT first-test-only.
3. Country-cascade + every save-persist case restores 1604 defaults on cleanup (no STATE-LEAK).
4. No `.toBe(<count>)` on dropdown sizes (LR-022) — `.toContain`/`.toBeGreaterThan`.
5. No OR-expression `.toBe(true)` (LR-051); no fixed-timeout polls (LR-052).
6. Any save-behavior network listener filters `/navigator/api/` (LR-056), not `/settings/location`.

## Verdict

Touch-surface **CLEAN** (zero existing false-greens). New-spec obligations recorded as
forward-looking; re-audited in Phase 4 against the authored spec.
