# False-Green Sweep — Launcher Dialog Gaps (Pay To + Master Bill To)

**Date**: 2026-06-11
**Identity**: WATCHDOG
**Scope**: ONLY the Pay To assertions (left panel) + the Master Bill To assertions (account-address) — these two surfaces, per user scope decision 2026-06-11. No other modules swept.
**Patterns**: the master's 11 sweeps + the **12th this subplan introduces — `UNPROBED-AFFORDANCE`** (a passing assertion on a field whose label/launcher affordance — or whose per-launcher select-cycle — was never exercised).
**Subplan**: SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC Phase 0.5fg

---

## Findings

| # | TC | Assertion (file:line) | What it proves | Classification | Disposition |
|---|---|---|---|---|---|
| 1 | TC-LOC-LP-004 | `isFieldDisabled('txtPayToAddress')).toBe(true)` + value (`spec:68-69`), title "Pay To Address field is always disabled" | the disabled DISPLAY input is disabled (true) | **UNPROBED-AFFORDANCE** (the title's "always disabled" implies non-interactive — masks the clickable label launcher; the launcher was never probed) | KEEP the ID + the input-disabled assertion (TRUE), but **correct the title/steps** to state the launcher affordance; assertion unchanged. Net-new launcher TCs cover the dialog. |
| 2 | TC-LOC-LP-001 | `getPayToAddress()).toBe(LP_DEFAULTS.payToAddress)` (`spec:52`) | the display shows the Pay To **name** "Encore" | **UNPROBED-AFFORDANCE** (asserts display value only; launcher never exercised) | KEEP (the value assertion is correct); launcher coverage is net-new, not a fix to this TC. |
| 3 | TC-LOC-LP-023 | incidental `isFieldDisabled('txtPayToAddress')).toBe(true)` inside the Live Date test (`spec:243`) | incidental disabled re-check | **UNPROBED-AFFORDANCE (incidental)** | KEEP unchanged (incidental, not the unit under test). |
| 4 | TC-LOC-ACC-012 | `openMasterAddressDialog()` → dialog visible (`spec:208-210`), title "Master Address button opens same Select Customer Address dialog" | the shared dialog OPENS from the Master launcher | **UNPROBED-AFFORDANCE** (open-only; never selects via Master, never checks Master `dd` update, never measures Master persistence) | KEEP the ID + open assertion; **extend the block notes**; net-new Master select/persist TCs close the per-launcher gap. |
| 5 | TC-LOC-ACC-014 | Master display fields read-only (`spec:224-227`) | the Master `dd` display fields are read-only in place | **PARTIAL / UNPROBED-AFFORDANCE** (true that you can't type in them, but the LAUNCHER changes them — "read-only" understates) | KEEP; note that the values are launcher-mutable (net-new TC proves it). |

## The other 11 master sweeps (scoped to these assertions)

| Pattern | Result |
|---|---|
| FALSE-GREEN (asserts a wrong/absent thing as pass) | none beyond the UNPROBED-AFFORDANCE rows above (those assertions are individually TRUE — they don't assert anything false; they're blind, not wrong) |
| PARTIAL (covers a slice, claims the whole) | TC-LOC-ACC-014 (read-only claim understates launcher-mutability) — folded into #5 |
| FLAKY-MASK | none |
| STALE-SKIP | none |
| INFLATED (count claims > real) | none |
| STATE-LEAK | none (both specs carry `ensureDefaultState()` in `beforeEach`, LR-019) |
| (remaining master patterns) | CLEAN for this scope |

## Verdict

**5 UNPROBED-AFFORDANCE findings** (the 12th-pattern class this subplan exists to catch), **0 FALSE-GREEN in the strict sense** (every flagged assertion is individually true — the defect is blindness/conflation, not falsity). All 5 are resolved by the Phase 2/3 plan: keep the existing true assertions + IDs, correct the launcher-blind wording (TC-LP-004, TC-ACC-012/014 notes), and add the net-new per-launcher dialog/select/persist TCs. **No assertion needs to flip RED** — the live walk confirmed the underlying app behaviors (Pay To persists, Master persists, displays read-only). The gap is purely coverage, not correctness.

**Resolution tracking**: the wording corrections + net-new TCs are owned by Phase 2 (GIVER MD) + Phase 3 (BUILDER specs). This sweep has **no finding that requires a HEALER RED-fix** — every finding is a coverage-add, not a broken assertion.
