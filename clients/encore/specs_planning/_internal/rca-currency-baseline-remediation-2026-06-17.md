# RCA + Remediation — Currency Baseline / False-Green

**Subplan**: SUBPLAN_CURRENCY_FCC.md (Phase 1.5 — HEALER, runs unconditionally per full-identity-sweep mandate)
**Identity**: HEALER
**Date**: 2026-06-17
**Targets**: `clients/encore/tests/locations/location-currency.spec.ts` + `clients/encore/src/pages/locations/location-currency.page.ts`
**Inputs**: `false-green-sweeps/currency-2026-06-17.md` (Phase 0.5 verdict), `field-inventories/currency-2026-06-17.md` (live walk)

This is a REAL deliverable even though the sweep found zero FALSE-GREEN: it documents the one STATE-LEAK finding + its RCA + the LR-021 skip-audit + the verdict. Per `feedback_override_cannot_convert_missing_to_evidence`, the report states exactly what was found with the grep/read evidence that establishes it.

---

## 1. False-green / STATE-LEAK remediation

### Finding (from Phase 0.5 sweep)

**STATE-LEAK / LR-019 net-zero exposure** — the only non-CLEAN sweep result.

### RCA (5-Whys / IS-IS-NOT)

- **IS**: the enforced default-state baseline lives ONLY in `TC-LOC-CUR-001`'s body (`spec L20-30`: check USD Selected+IsDefault, set USD merchant, uncheck CAD/MXN, `clickSave`). The shared `beforeEach` (`L9-13`) does ONLY a DOM-presence nav-guard (`isOnCurrencyTab` → `navigateToCurrencyTab`); it does NOT reset grid state.
- **IS** (compounding): 21 literal `dependencyGate(['TC-LOC-CUR-001'])` calls (grep-confirmed; ~22 runtime tests incl. the `UNSELECTED_CURRENCY_STATES` loop) declare a dependency on TC-001 that is **annotation-only since 2026-05-08** (PLAN_DEPENDENCY_GATE_REMOVAL — `dependencyGate` never gates execution; it only annotates Allure `dependsOn`).
- **IS-NOT**: this is NOT a currently-failing-suite repair — a clean single-worker run shows no baseline failures today. It is a *latent* exposure.
- **Why does it rot?** (1) Playwright `retries` re-run a single failed test **plus its `beforeEach` but NOT TC-001's body** → a retried TC-015/021/etc. starts from whatever dirty state the prior failure left. (2) Parallel/sharded execution does not guarantee TC-001 runs first in a worker. (3) A prior crashed run can leave 1604 dirty.
- **Failure mode**: a net-zero-vulnerable assertion fails against *correct* app behavior. Examples in this spec: TC-015 (check CAD → expect Save enabled) is net-zero if CAD is already checked from a leaked state; TC-021/023/024 (select-then-persist) assume a known starting grid. Same shape as the 2026-05-27 Legal incident (TC-LGL-009/011/013), the LR-019 graduating case.

### Fix (RCA-owned; code lands in Phase 3 BUILDER)

The structural fix is a **per-test enforced baseline** in `beforeEach` (LR-019 preferred non-FCC path):

1. Add `ensureDefaultState(): Promise<void>` to `location-currency.page.ts` — modelled on `location-legal.page.ts` / `location-account-address.page.ts` `ensureDefaultState`: **bounded retry (max 3)** wrapping read-grid → if drifted, set USD Selected+IsDefault, CAD/MXN unselected, USD Merchant = `MERCHANT_DATA.usd`, `saveAndConfirm()`, **reload via `reloadAndNavigateToCurrencyTab()`**, re-verify; **THROWS** if still drifted after 3 cycles. The reload+re-read is mandatory because `clickSave()` returns `{success:true}` even when Save is DISABLED (confirmed Phase 0.5) — save-success alone never proves the reset landed. No-ops when already clean.
2. Add `saveAndConfirm(): Promise<void>` — wraps `clickSave()`; `if (!r.success) throw` (the runner / baseline need a `void`-throwing save, not the `{success}` shape).
3. Wire `await locationCurrencyPage.ensureDefaultState();` into `beforeEach` AFTER the nav-guard.

**Effect on the net-zero class**: every test now starts from the enforced known baseline regardless of run order, retry, or prior crash → the net-zero-vulnerable assertions (TC-015/021/023/024/027) can no longer fail against correct behavior. TC-001's inline reset stays unchanged (STRICT-LINE-D) but is relieved of *sole* responsibility; the 21 annotation-only `dependencyGate` calls remain as Allure annotations (harmless, not removed — STRICT-LINE-D).

### Per-test before/after (net-zero-vulnerable tests this fix protects)

| Test | Before (vulnerable) | After (protected) |
|---|---|---|
| TC-015 (Save enables after change) | net-zero if CAD pre-checked from leak | `beforeEach` resets CAD unchecked → CAD-check is a real change |
| TC-021 (Selected persists) | assumes CAD starts unchecked | enforced unchecked baseline |
| TC-023 (IsDefault cascade persists) | assumes USD default set | enforced USD default baseline |
| TC-024 (combined changes persist) | assumes USD merchant = usd | enforced USD merchant baseline |
| TC-027 (no-default persists) | assumes USD IsDefault checked | enforced USD IsDefault baseline |

---

## 2. LR-021 skip-audit

| Check | Result | Evidence |
|---|---|---|
| `test.skip` / `test.fixme` / `.skip(` / `.fixme(` in spec | **0** | `grep -cE "test\.(skip\|fixme)\|\.skip\(\|\.fixme\(" location-currency.spec.ts` → `0` |
| `@fcc` tag present | **0** | `grep -c "@fcc"` → `0` (correct — net-new blends at top with no `@fcc`, existing suite has none) |

**0 stale skips.** Nothing to un-skip (LR-021 N/A — no skipped test to try-original-logic-first). No newly-needed skip surfaced from the sweep (no app bug found during the live walk → no `BUG-LOC-CUR-NNN` filed).

---

## 3. Verdict

- **Phase 0.5 findings**: 1 STATE-LEAK (classified, fix specified above, lands in Phase 3) + 0 FALSE-GREEN. All other sweeps CLEAN.
- **Skip-audit**: 0 skips, 0 fixmes — clean.
- **Zero unfixed false-green** — the gate to Phase 2 is satisfied (the STATE-LEAK has a concrete Phase-3 fix, not an open hole).
- **MD sync** (HEALER HARD STOP #6): no test-case row changes from this remediation (the fix is `beforeEach` + page-object methods, not a TC-body edit) → no MD row Status flip required from HEALER. The Phase-2 GIVER header reconciliation (27/27/0) is separate.

**VERDICT: GREEN** — remediation specified, skip-audit clean, no blocker to Phase 2.
