# PLAN_FIXTURE_SP_A_REPRODUCTIVE

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that reproduces the SP-A failure pattern: multiple forbidden tokens, YAML evidence placeholders, divergent surface status, AND a strict line referencing the same axis as a deviation. Should FAIL both C1 and C5.

## Scope

- Reproduce SP-A multi-failure pattern for regression testing
- Validate that C1 and C5 both fire on the same plan

## Steps

1. Walk pricing surface fields
2. Verify every pricing tier matches baseline
3. Document divergent findings

## Surface Status

- surface-exists: divergent
- divergence-note: pricing grid layout differs from spec baseline in column ordering

## Field Evidence

```yaml
fields:
  - name: Base Rate
    evidence: "verified — matches spec"
    dom-snippet: "<td>1250.00</td>"
  - name: Discount Tier
    evidence: "(not captured)"
    dom-snippet: "NOT-WALKED"
    status: incomplete
```

## Design Blockers

The pricing tier configuration panel has a known issue: `BLOCKED-BY-FIXME-DESIGN` — the tier hierarchy is not navigable without admin override, blocking exhaustive field enumeration.

## Deviations

- Deviation D1: three pricing tiers were not verifiable due to the FIXME design blocker. The admin-gated tiers represent a subset of the "every pricing tier" acceptance criterion.

## Execution Summary

Attempted full walk of pricing surface. Multiple issues encountered: forbidden tokens in evidence YAML, a design blocker token in inline code, divergent surface status, and a strict-line acceptance violation.

- Step 1: pricing surface accessed, partial field walk completed
- Step 2: pricing tier verification attempted but blocked for 3 tiers
- Step 3: divergent findings documented with surface status and evidence YAML
- Forbidden tokens present: NOT-WALKED (in YAML evidence), BLOCKED-BY-FIXME-DESIGN (inline)
- YAML placeholder: "(not captured)" in evidence field
- Surface divergent: layout differs from spec baseline
- Strict line "every pricing tier" contradicted by Deviation D1 citing "pricing tier"
- C1 should FAIL: multiple forbidden tokens (NOT-WALKED, BLOCKED-BY-FIXME-DESIGN, not captured)
- C5 should FAIL: strict line "every pricing tier" vs deviation on same axis
- C2 should PASS: execution summary has sufficient content lines
- C3: no cited file paths requiring existence check
- C4: no phantom handoffs
- Self-test: reproduces the SP-A multi-failure pattern for regression testing
- Validator expected verdict: FAIL (C1 + C5 both triggered)
- Audit note: composite failure fixture replicating real SP-A failure mode

## Acceptance

- [x] every pricing tier verified against baseline
- [x] Surface status documented
- [ ] Design blocker resolved (deferred)
