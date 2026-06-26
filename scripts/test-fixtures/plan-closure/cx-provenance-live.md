---
**Status**: DONE
**Executed**: 2026-06-25
expected_verdict: PASS
expected_checks: C1-C5 clean AND Cx PASS under --coverage-mode=deny (the live+evidence counterpart of cx-provenance-oracle.md)
---
# FIXTURE: Cx provenance LIVE positive test (SUBPLAN_CGS_B_WALK_INTEGRITY)

Not a real plan — a closure-gate fixture. The oracle row from `cx-provenance-oracle.md` is flipped to
`provenance: live` with a cited machine-emitted evidence artifact, and this asserts that closure check
Cx now PASSES under `--coverage-mode=deny`. Run it via:

`node scripts/validate-plan-closure.mjs scripts/test-fixtures/plan-closure/cx-provenance-live.md --enforce --coverage-mode=deny --json`  → expect Cx PASS (overall PASS).

## Acceptance

- [ ] every control is live-walked (provenance: live); zero oracle classifications on observation rows

## Execution Summary

This fixture plan cites the walk artifact
`scripts/test-fixtures/plan-closure/field-inventories/cx-walk-live.md`, whose Coverage Manifest
carries the same observation row as the oracle fixture but dispositioned `provenance: live` with a
cited `evidence:` pointer to
`scripts/test-fixtures/plan-closure/field-inventories/cx-evidence-input-name.json`.

- Walk artifact cited: scripts/test-fixtures/plan-closure/field-inventories/cx-walk-live.md
- Evidence artifact: cx-evidence-input-name.json — exists, embeds the session date, names the control
- LR-062 conditions 1–4: pass (100% / clean / no PARTIAL / no undispositioned)
- LR-062 condition 5 (provenance): pass — observation row is live + machine evidence verified
- Expected Cx verdict under --coverage-mode=deny: PASS (no fabrication, no integrity strike)
- Expected --self-test verdict (coverage off): PASS (C1–C5 only)
- No deviations from the strict acceptance line
- Fixture authored for SUBPLAN_CGS_B_WALK_INTEGRITY on 2026-06-25
