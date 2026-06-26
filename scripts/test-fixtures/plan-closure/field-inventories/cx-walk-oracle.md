---
MCP_Session_Date: 2026-06-25
Coverage_Ratio: 2/2 (100%)
CrossCheck: clean
---
# Fixture walk artifact (ORACLE) — SUBPLAN_CGS_B_WALK_INTEGRITY Cx negative test

Not a real walk. A closure-gate fixture: its Coverage Manifest is complete on conditions 1–4
(ratio 100%, crosscheck clean, no PARTIAL, no undispositioned rows) but one observation-claiming
row is `provenance: oracle` (classified-from-spec, never live-observed) — the LR-062 condition-5
violation. `coverageVerdict` must return `complete: false` + `provenanceFail: true` for an artifact
dated on/after the provenance landing date (2026-06-24).

## Coverage Manifest (machine-enumerated)

| # | key | role | disposition |
|---|---|---|---|
| 1 | `testid:fixture-btn-save` | button | covered-by-TC: TC-CXFIX-001 |
| 2 | `testid:fixture-input-name` | input | read-only-verified: display field; provenance: oracle |
