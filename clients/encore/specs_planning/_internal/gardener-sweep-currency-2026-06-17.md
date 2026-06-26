# GARDENER Code-Quality Sweep — Currency

**Subplan**: SUBPLAN_CURRENCY_FCC.md (Phase 4 — runs unconditionally per full-identity-sweep mandate)
**Identity**: GARDENER
**Date**: 2026-06-17
**Touched shipped files**: `clients/encore/src/pages/locations/location-currency.page.ts` (+3 methods), `clients/encore/tests/locations/location-currency.spec.ts` (+beforeEach baseline, +TC-028)

This is a REAL dated deliverable (not an inlined `(skipped)` cell). Each check + outcome below; no business-logic change (GARDENER scope — structural only).

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | `npx tsc --noEmit -p clients/encore/tsconfig.json` | **PASS** | exit 0 |
| 2 | Lint (no new warnings) | **PASS** | `npx eslint` (from `clients/encore`, using client tsconfig) on both touched files → exit 0. NOTE: root `npm run lint` (`eslint . --ext .ts`) reports a *parser* error for client files — the root `tsconfig.json` does not include `clients/encore/**`; this is a pre-existing repo lint-config gap (not introduced by this change) — the client files lint clean under the client config |
| 3 | JSDoc on new public methods | **PASS** | `saveAndConfirm()`, `ensureDefaultState()`, `isAtDefaultState()` each carry a plain-English doc block (page object L255-279, L264-279, L302) |
| 4 | Dedup — no new `BasePage` duplicate / no copy-pasted scaffolding | **PASS** | `saveAndConfirm` thinly wraps the existing `clickSave()` (which delegates to `BasePage.clickSaveWithDialog`); `ensureDefaultState` orchestrates existing `checkCheckbox`/`uncheckCheckbox`/`getMerchantValue`/`selectMerchantOption`/`isSaveEnabled`/`reloadAndNavigateToCurrencyTab`; `isAtDefaultState` composes existing `getCheckboxState`/`getMerchantValue`. No new method re-implements a `BasePage` primitive; no FCC-scaffold copy-paste (TC-028 is a plain behavior test, not the runner) |
| 5 | Barrel export — currency selectors still re-exported | **PASS** | `clients/encore/src/selectors/index.ts:32` → `export { SetupCurrencySelectors } from './locations/currency';` (also spread at :52, imported :5) — intact |
| 6 | LR-058 jargon spot-check on touched shipped files | **PASS** | grep `LR-[0-9]\|SUBPLAN_\|HUNTER\|GIVER\|BUILDER\|HEALER\|WATCHDOG\|GARDENER\|_internal\|field-inventor\|§` on both files → **0 hits**. New comments are plain English ("no-net-change", "enforce the known default grid state", "void-returning wrapper") |
| 7 | `npm run check:tc-parity` exit 0 | **DEFERRED — workbook locked** | `encore_test_cases.xlsx` is open in Excel (`~$encore_test_cases.xlsx` owner-lock present) → `xlsx:build` hit EBUSY and `check:tc-parity` (reads the workbook, guardrail 5) cannot validate the new TC-028 row. Runs as the gate to Phase 6 once the workbook is closed. typecheck (the structural half) is already PASS |

## Refactors

None. No structural refactor was needed — the three additions compose cleanly over existing primitives. Business logic unchanged.

## Verdict

**GREEN (structural)** — typecheck clean, lint clean (client config), JSDoc present, no dedup violation, barrel intact, zero jargon. The only open item is `check:tc-parity`, blocked solely by the external Excel file-lock (not a code defect) — it is the Phase 6 closure gate and runs once the workbook is released + rebuilt.
