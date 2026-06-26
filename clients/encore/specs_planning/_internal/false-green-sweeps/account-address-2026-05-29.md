---
artifact: false-green-sweep
module: account-address
client: encore
sweep_date: 2026-05-29
baseline_artifact: clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-05-29.md (emitted in Phase 1 of this subplan)
walk_evidence_artifacts:
  - clients/encore/specs_planning/_internal/walk-evidence-location-settings-2026-05-14.md
  - clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29.md (emitted in Phase 1 of this subplan)
parent_subplan: plans/pending/SUBPLAN_ACCOUNT_ADDRESS_FCC.md
parent_plan: plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md
target_spec: clients/encore/specs/locations/location-account-address.spec.ts
spec_state_at_sweep: 26 implemented TCs (TC-LOC-ACC-001..028; 021 DROPPED-NOT-AUTOMATABLE, 024 never authored — both gaps, not skips)
target_page_object: clients/encore/src/pages/locations/location-account-address.page.ts
target_selectors: clients/encore/src/selectors/locations/account-address.ts
author_identity: WATCHDOG
verdict: GREEN (zero unfixed FALSE-GREEN findings; zero STALE-SKIP entries)
---

# 11-Sweep False-Green Audit — Account & Address Spec — 2026-05-29

WATCHDOG-led pre-FCC audit per `SUBPLAN_ACCOUNT_ADDRESS_FCC.md` Phase 0.5 (master plan `§False-Green Sweep Doctrine`, canonical 11 patterns). Scope: all 26 existing tests + page object (`location-account-address.page.ts`) + selectors (`account-address.ts`). Read line-by-line; classifications cite line numbers.

## Sweep index

| # | Pattern | Hit count (spec) | Hit count (page-object) | FALSE-GREEN | Classification |
|---|---|---|---|---|---|
| 1 | `.catch(() => {})` on action (silent swallow) | 0 | 4 (po:213, 389, 424, 452) | 0 | CLEAN — all on `waitFor({state:'hidden'})` after a Cancel click (213/389/424) or the tolerant `getLocationDetail` hydration listener (452 `.catch(() => null)`); none swallow an action/assertion. See §Per-hit. |
| 2 | `,\s*page\s*[,}]` bare-`page` destructure alongside custom fixture | 0 | n/a | 0 | **CLEAN ×0** (master strict-zero gate ✓ — every one of the 26 tests destructures `{ locationAccountAddressPage, dependencyGate }`; zero built-in `page`). |
| 3 | `.toBeHidden()` / `.toHaveCount(0)` on missing element | 0 | 0 | 0 | CLEAN ×0 |
| 4 | `.isVisible()` / `.isEnabled()` inside `if`/ternary branch | 1 (beforeEach:22) | 0 | 0 | CLEAN — spec:22 `if (!(await isOnAccountAndAddressTab()))` is the sanctioned per-test **nav-guard** (D-2 refactor); the predicate reads `aria-selected` (po:28), not `isVisible`. TC-018:183 / TC-028:317 `if` branches compare field *values* (getPhone2Value / getVenueNameValue), not visibility/enabled state — not Pattern-4 vectors. |
| 5 | `force: true` + `.catch()` combined | 0 | 0 | 0 | CLEAN ×0 |
| 6 | All-negative-assertion tests (no positive `expect`) | 3 PARTIAL | n/a | 0 | TC-016, TC-017, TC-011 are negative/invariant-only (see §Negative-only). Semantically valid (optional-field-no-error / save-disabled-at-rest / address-Save-always-disabled), each with a positive control elsewhere. PARTIAL, **not** FALSE-GREEN. |
| 7 | Stale `test.skip` / `test.fixme` | 0 | n/a | 0 | **CLEAN ×0** — zero skip/fixme directives. TC-021 (DROPPED, NOT-AUTOMATABLE) + TC-024 (never authored) are inline-comment gaps tracked in the test-cases MD, **not** runtime skips. |
| 8 | `page.on()` listener on built-in `page` | 0 | 1 (po:449 `waitForResponse`) | 0 | CLEAN — `this.page.waitForResponse((r) => r.url().includes('/navigator-legacy/getLocationDetail') && r.status()===200)` is on the authenticated page handle and filters the **backend endpoint** (LR-056-compliant — NOT a page-URL substring). Positive finding. |
| 9 | `page.waitForTimeout` as sole sync | 0 | 1 (po:267) | 0 | **FLAKY-MASK (advisory, LR-052)** — `searchAccountByFilter` loops `waitForTimeout(500)` ×30 to poll cell text. Preceded by a real `firstDataCell.waitFor({state:'visible'})` (po:263) so not *sole* sync, but the fixed-sleep content-population loop is the LR-052 forbidden shape. Page-object only; cannot make any test vacuously pass (flake/slowness only). NOT FALSE-GREEN. → Phase 2.5 DO-NOW candidate (convert to `waitForFunction`). |
| 10 | Setup via `page.*` checked via `<pageObject>.*` (misalignment) | 0 | n/a | 0 | CLEAN ×0 — every test uses `locationAccountAddressPage.*` for both setup and assertions; zero raw `page.*` in the spec. |
| 11 | `expect.poll()` with timeout > 10s | 4 PARTIAL-JUSTIFIED | 0 | 0 | TC-004/025/026/028 use 20s polls — **all** on the Account List server-search (documented slow under load, master Pattern-11 note says classify don't reflex-flag). Each has a positive assertion (`accountListResultsContain(expected)`). JUSTIFIED. TC-018/019/020/022/027 use 5s polls (within budget). |

**Totals**: 11 sweeps × 26 tests = 286 sweep-cells inspected. **0 FALSE-GREEN findings.**

## Per-hit classification (page-object `.catch` analysis)

- **po:213 / 389 / 424** — `await this.getElement('dlg...').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})` after a Cancel click. CLEAN: tolerant close-wait; if the dialog is already hidden, `waitFor` would throw race-noise that must not fail the predicate. The downstream assertion is on the next user-visible state, not on this wait.
- **po:452** — `this.page.waitForResponse(... getLocationDetail ...).catch(() => null)` in `reloadAndNavigate`. CLEAN: the hydration listener is a safety wait; `.catch(() => null)` covers cached/early-return cases. The caller asserts on the hydrated value (e.g., `getPhone2Value`), not on this promise.
- **po:404** — `isSaveEnabled()` = `await this.getElement('btnSaveAccountAddress').isDisabled().catch(() => true)`. Defensive predicate read (returns disabled=true → enabled=false on error). Borderline for TC-017 (negative-only) — see §Negative-only; mitigated because `beforeEach` guarantees tab + Phone-1 hydration, so the Save button is reliably present.

## Negative-only / invariant tests (Pattern 6 PARTIAL)

- **TC-016** — `expect(isPhone2Invalid()).toBe(false)`: single negative assertion. Semantically correct ("optional field shows no validation error when empty"); `aria-invalid=false` is the genuine signal. PARTIAL.
- **TC-017** — `expect(isSaveEnabled()).toBe(false)`: single negative + relies on po:404 defensive `.catch(() => true)`. Could in principle vacuously pass if the Save button were absent — but `beforeEach`'s `navigateToAccountAndAddressTab` waits for the tab panel + Phone-1 hydration before any test, so button presence is guaranteed. PARTIAL.
- **TC-011** — Address dialog Save asserted disabled before AND after checking a row (invariant test). Positive control = TC-009 proves the *Select* button DOES enable on row-check. PARTIAL (acceptable invariant).

## Additional finding — STATE-LEAK (serial coupling, advisory)

**TC-019 → TC-020 coupling.** TC-019 fills Phone 2 = `TEST_PHONE2_VALUE`, saves, and does **not** restore. TC-020 then asserts Phone 2 persisted (depends on TC-019's mutation) and only afterward clears Phone 2 + saves (the cleanup). If TC-020 is filtered out, or a `--retries` re-run executes TC-019 alone (post-dependencyGate-removal, no test is guaranteed to run first/last), office 1604's Phone 2 is left mutated → cross-spec contamination.

- Verdict: **STATE-LEAK (serial-coupling)** — advisory, NOT FALSE-GREEN (both tests' assertions are real).
- This is the strongest empirical argument for the Phase-3 BUILDER deliverable: wiring a hardened `ensureDefaultState()` into the describe `beforeEach` (LR-019 2026-05-29 per-test baseline) resets Phone 2 to a known baseline before every test, dissolving the TC-019→TC-020 coupling and the retry-contamination risk.

## Additional finding — SELECTOR-DRIFT (advisory, re-verify in HUNTER walk)

`account-address.ts:74-76` + `:98-100` carry `FIXME (2026-04-29)`: the **Select Customer Address** dialog (6 selectors) and the **Save Changes** message fell back to `[role="dialog"]:has-text(...)` / `[role="alertdialog"]:has-text(...)` because their `data-testid`s were absent in the live DOM at that time. The Account List dialog testid (`location-settings-modal-account-list`) IS present.

- This is **not** a false-green (the role+text selectors resolve real elements; the dialog tests pass). It is a selector-freshness item: per LR-029, testids may have *landed since 2026-04-29*. The Phase-1 HUNTER walk must re-verify whether the Select-Address / Save-Changes testids now exist → if so, file a Phase-2.5 Adjacent-Sweep DO-NOW to upgrade the role-based selectors; if still absent, record `baselineScope`/as-is in the field inventory.

## Conclusion

**Verdict: GREEN.** Zero unfixed FALSE-GREEN findings. Zero STALE-SKIP entries.

- **HALT condition NOT triggered** (>3 FALSE-GREEN would force material remediation before FCC layering — none found).
- **Master strict-zero gate (bare-`page` destructure)**: ✓ MET — zero hits across all 26 tests.
- **Phase 1.5 (HEALER)**: `(skipped)` — 0 FALSE-GREEN means no remediation is required (the conditional fires only on 1–3 findings).

**Advisory carry-forward (none block FCC layering):**
1. FLAKY-MASK po:267 `searchAccountByFilter` fixed-sleep loop → Phase 2.5 DO-NOW (LR-052 → `waitForFunction`).
2. STATE-LEAK TC-019→TC-020 Phone-2 coupling → cured by Phase-3 `ensureDefaultState()` `beforeEach` (LR-019).
3. SELECTOR-DRIFT Select-Address / Save-Changes role-based fallback → re-verify testids in Phase-1 HUNTER walk (LR-029).

Proceed to Phase 1 (HUNTER state-freshness walk + field-inventory + old-site baseline).
