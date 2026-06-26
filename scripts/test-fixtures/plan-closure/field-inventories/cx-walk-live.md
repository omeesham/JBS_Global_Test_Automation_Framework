---
MCP_Session_Date: 2026-06-25
Coverage_Ratio: 2/2 (100%)
CrossCheck: clean
---
# Fixture walk artifact (LIVE) — SUBPLAN_CGS_B_WALK_INTEGRITY Cx positive test

The oracle row from `cx-walk-oracle.md` flipped to `provenance: live` with a cited machine-emitted
evidence artifact (`cx-evidence-input-name.json`) that (a) exists, (b) embeds a date ≥ the session
date (not stale/reused), and (c) names the control. `coverageVerdict` must return `complete: true`
+ `provenanceFail: false`.

## Coverage Manifest (machine-enumerated)

| # | key | role | disposition |
|---|---|---|---|
| 1 | `testid:fixture-btn-save` | button | covered-by-TC: TC-CXFIX-001 |
| 2 | `testid:fixture-input-name` | input | read-only-verified: display field; provenance: live; evidence: cx-evidence-input-name.json |
