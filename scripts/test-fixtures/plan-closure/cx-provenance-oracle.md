---
**Status**: DONE
**Executed**: 2026-06-25
expected_verdict: PASS
expected_checks: C1-C5 clean — this fixture demonstrates Cx FAIL only under --coverage-mode=deny (the --self-test harness runs coverage off, so it is a clean C1-C5 plan there)
---
# FIXTURE: Cx provenance ORACLE negative test (SUBPLAN_CGS_B_WALK_INTEGRITY)

Not a real plan — a closure-gate fixture. It cites a walk artifact whose Coverage Manifest carries a
`provenance: oracle` observation row, and asserts that closure check Cx rejects it under
`--coverage-mode=deny`. Run it via:

`node scripts/validate-plan-closure.mjs scripts/test-fixtures/plan-closure/cx-provenance-oracle.md --enforce --coverage-mode=deny --json`  → expect Cx FAIL.

Under `--self-test` (coverage off) only C1–C5 are evaluated, so the harness expects PASS.

## Acceptance

- [ ] every control is live-walked (provenance: live); zero oracle classifications on observation rows

## Execution Summary

This fixture plan cites the walk artifact
`scripts/test-fixtures/plan-closure/field-inventories/cx-walk-oracle.md`, whose Coverage Manifest
contains one `read-only-verified` row marked `provenance: oracle`. Conditions 1–4 of LR-062 (ratio
100%, crosscheck clean, no PARTIAL, no undispositioned rows) all pass; only the provenance condition
(5) is violated, because an observation-claiming disposition was classified-from-spec rather than
live-observed.

- Walk artifact cited: scripts/test-fixtures/plan-closure/field-inventories/cx-walk-oracle.md
- LR-062 conditions 1–4: pass (100% / clean / no PARTIAL / no undispositioned)
- LR-062 condition 5 (provenance): FAIL — one oracle observation row
- Expected Cx verdict under --coverage-mode=deny: FAIL (fabrication-class)
- Side effect under deny: an integrity strike is appended to .claude/state/integrity-strikes.jsonl
- Expected --self-test verdict (coverage off): PASS (C1–C5 only)
- No deviations from the strict acceptance line within self-test scope
- Fixture authored for SUBPLAN_CGS_B_WALK_INTEGRITY on 2026-06-25
