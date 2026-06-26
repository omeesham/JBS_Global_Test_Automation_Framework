# False-Green Sweep — Auto Add-On

**Subplan**: SUBPLAN_AUTO_ADDON_FCC.md (Phase 0.5fg + Phase 1.5)
**Identity**: WATCHDOG
**Date**: 2026-06-11
**Targets**: `clients/encore/tests/locations/location-auto-addon.spec.ts` (19 runtime TCs) + `clients/encore/src/pages/locations/location-auto-addon.page.ts`
**Method**: 11-sweep grep (master §False-Green Sweep table) + live-walk corroboration (Playwright CLI, office 1604)

## Verdict summary

**Zero confirmed FALSE-GREEN.** One STATE-LEAK (the LR-019 exposure — the subplan's named load-bearing gap) + one PARTIAL/LR-052 (page-object fixed-sleep poll). Both → Phase 3 fixes. All other sweeps CLEAN. Matches the Legal-sweep precedent (GREEN).

## 11-sweep classification

| # | Pattern | Spec hits | Page-object hits | Verdict | Evidence / reasoning |
|---|---|---|---|---|---|
| 1 | `.catch(() => {})` / `.catch(() => false)` on action | 0 | 12 (L25,80,83,90,115,120,124,130,135,152,165,170) | **CLEAN** | All 12 are visibility/state **probes** (`isVisible`/`isDisabled`/`getAttribute`) or dialog-dismiss `waitFor({state:'hidden'})` **cleanups** — none swallow a load-bearing assertion. L80 `clickSave` dialog-visible branch is best-effort, but persistence TCs (009/011/017/018/020) assert checkbox state **after navigateFresh**, so a swallowed save surfaces as a failed post-reload assertion — the catch cannot mask a false GREEN. (Matches GENERATOR_AUDIT F5 note: "all 27 are probes, not save ops.") |
| 2 | bare `page` destructure alongside custom fixture | 0 | — | **CLEAN** | every test destructures `{ locationAutoAddonPage, dependencyGate }` only; no bare `page` |
| 3 | `.toBeHidden()` / `.toHaveCount(0)` on missing element | 0 | — | **CLEAN** | none present |
| 4 | `.isVisible()` / `.isEnabled()` in `if`/ternary | 0 | 1 (L135 `clickSidebarHome`) | **CLEAN** | `if (!await homeLink.isVisible().catch(()=>false))` expands viewport then `waitFor({timeout:5_000})` which **throws** if the link is still absent — wrong-page fails loudly at L138, not a vacuous pass |
| 5 | `force: true` + `.catch()` | 0 | 0 | **CLEAN** | none present |
| 6 | all-negative-assertion tests | n/a | — | **CLEAN** | spec carries positive proof: TC-002 asserts positive default states; TC-009/011/017/018/020 assert positive persistence after reload |
| 7 | stale `test.skip` / `test.fixme` | 0 | 0 | **CLEAN** | no skip/fixme anywhere (confirms subplan's "no fixme/skip") |
| 8 | `page.on()` listener on built-in `page` | 0 | 0 | **CLEAN** | the L142 `page.evaluate(beforeunload suppression)` is not a `page.on`; fixture-level dialog auto-accept is out of scope |
| 9 | `page.waitForTimeout` as sole sync | 0 | 1 (L92 `clickSave` poll loop) | **PARTIAL / LR-052** | `while (Date.now()<deadline){ if(!isDisabled) break; await page.waitForTimeout(500); }` — fixed-sleep poll waiting for the first checkbox to re-enable after save. Bounded at 15s so it does NOT mask a failure (not false-green), but it IS the LR-052 anti-pattern → replace with `waitForFunction`/locator-wait in Phase 3 (BUILDER, mechanical) |
| 10 | assertions after `page.*` setup checking via `<pageObject>.*` | 0 | — | **CLEAN** | setup + assertions both go through `locationAutoAddonPage.*` consistently; no mixed-surface mismatch |
| 11 | `expect.poll()` timeout > 10s | 0 | 0 | **CLEAN** | max poll timeout is 10_000ms (L196, `=`10s not `>`10s); all others 5_000ms |

## STATE-LEAK finding (the load-bearing gap — subplan's "single biggest structural gap")

| Finding | Class | Evidence | Disposition |
|---|---|---|---|
| Default-state restore lives ONLY in TC-001 body (spec L21-35); `beforeEach` (L9-13) has only a nav-guard, no `ensureDefaultState` | **STATE-LEAK** (LR-019 exposure) | per-test retry re-runs `beforeEach` but NOT TC-001's body; serial blocks + `dependencyGate` are annotation-only since 2026-05-08 → TC-001 no longer guarantees-runs-first. A net-zero-vulnerable assertion (e.g. TC-003 toggle-then-Save-enables) fails against correct app behavior on a dirty start. Same shape as the 2026-05-27 Legal incident (LR-019 graduating case). | **Phase 3 (BUILDER)**: add hardened `ensureDefaultState(AUTO_ADDON_DEFAULTS)` (reuse Legal bounded-retry pattern), wire into `beforeEach` after nav-guard; slim TC-001's inline restore. |

## Phase 1.5 — Stale-claims re-verification (PLAN_GENERATOR_AUDIT_AUTO_ADDON, 2026-03-25)

Re-verified every code-level claim against CURRENT code + the 2026-06-11 live walk. The plan targets **evicted Copilot `.github/agents/*.agent.md`** files (pipeline now runs on Claude Code `.claude/agents/`) — its rule-add deliverables (GEN-042..045, ALL-057, PLN-043) are stale-by-construction; only its CODE claims are re-checked.

| Finding (2026-03-25) | Verdict | Evidence |
|---|---|---|
| **F1** selector collision architecture (cross-ref to PLAN_MAINTAINER_SWEEP) | **STALE-IRRELEVANT** | the P0-DECONTAMINATION dedup already landed — `auto-addon.ts` L59-66 comments show `btnSave`/`toastLocalInfoUpdated`/`dlgSaveChanges`/`btnSaveChangesCancel` REMOVED (canonical in left-panel/local-info/shared); no live collision |
| **F2** `beforeunload` ↔ fixture race | **ALREADY-FIXED** | suppression present at page-object L140-145 (`clickSidebarHome`: `window.onbeforeunload=null` + `stopImmediatePropagation`). TC-013/014/015 exercise it; verified live during Phase 1 walk (unsaved-changes dialog reachable on navigate-away). To be re-confirmed green in Phase 3/4 run. |
| **F3** shared.ts wrong button labels (Ok/Cancel vs Stay/Discard) | **STALE-IRRELEVANT / ALREADY-LANDED** | `auto-addon.ts` L77-80 already uses `btnUnsavedChangesStay`/`btnUnsavedChangesDiscard` with correct `Stay`/`Discard` text-anchored selectors |
| **F4** sub-tab-switch resets dirty-flag (hypothesis) | **CONFIRMED-real-behavior, MITIGATED — no new work** | TC-012 confirms sub-tab switch with dirty form is SILENT (no dialog) — this is real, asserted behavior. The "corrupts dirty tracking for the next nav-away test" worry is already handled: TC-013 (L161-162) does `navigateFresh` before the nav-away assertion. No architectural fix needed. |
| **F5** blind `toggleCheckbox` override (plain `.click()`) | **CONFIRMED-STILL-REAL → KEEP with justification** | present at page-object L45-48 (`toggleCheckbox` = plain `.click({timeout:30_000})`). Live walk: plain click reliably toggles these Radix checkboxes. The F5 harm (cleanup blind-toggle wrong-direction after a silent save failure) is **mitigated by the Phase-3 `ensureDefaultState`** per-test baseline (a dirty start is now self-healed regardless of cleanup correctness). Disposition per subplan Phase 1.5 ("replace with smart setter / keep with justification") = **KEEP** + clarifying comment; the explicit `checkCheckbox`/`uncheckCheckbox` (smart, `setRadixCheckbox`) already exist for deterministic set-state and the spec uses them where direction matters (TC-011/017/018/020). |
| **F6** async URL check after dialog nav | **ALREADY-FIXED** | TC-015 (L196) uses `expect.poll(() => getCurrentUrl(), {timeout:10_000}).toContain('/home')` after Discard. TC-013/014 use synchronous `getCurrentUrl()` but those are **Stay** (no navigation) so sync is correct. |
| **F7** generator didn't discover existing patterns (process meta-finding) | **STALE-IRRELEVANT** | process/Copilot-era finding; `clickSidebarHome` now embeds the suppression pattern. No live code defect. |

**Only CONFIRMED-STILL-REAL → Phase 3 work**: F5 (KEEP+justify) + the STATE-LEAK (ensureDefaultState) + the Sweep-9/LR-052 poll fix. F2 to be re-confirmed green in the Phase 3/4 run.

## TC MD / test-plan stale-claim diff (2026-03-24 doc vs 2026-06-11 inventory)

| Stale claim in `locations_auto_addon_test_cases.md` | Live truth (2026-06-11) | Fix in Phase 2 |
|---|---|---|
| Header `**Status**: Partial`; empty `Updated`/`Date` | dated walk done | refresh header + MCP_VERIFICATION_LOG date |
| "Items vary per location — location-specific" (MCP log + TC-016 premise) | item list is **country-scoped** (`auto-addon-types?countryId=1`), constant within a country; 5 for US incl. 1604; nav2 parity = same 5 | correct TC-016 body (keep ID); correct MCP-log "Items vary" line |
| Incomplete sentences ("Note: Sub-tab behavior may also have changed —") | sub-tab switch is silent (TC-012 confirmed live) | clean the dangling notes |
| testids, dialog labels, nav paths | all still accurate (re-verified live) | no change |
