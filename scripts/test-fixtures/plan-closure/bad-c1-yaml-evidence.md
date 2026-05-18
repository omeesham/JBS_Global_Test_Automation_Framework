# PLAN_FIXTURE_BAD_C1_YAML_EVIDENCE

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C1 with multiple forbidden token matches in YAML-style evidence blocks.

## Scope

- Test C1 multi-match detection across YAML evidence values

## Steps

1. Walk shared-setup fields
2. Capture evidence in structured YAML format

## Field Evidence

```yaml
fields:
  - name: Currency Code
    evidence: "(not captured)"
    dom-snippet: "NOT-WALKED"
    status: incomplete
  - name: Office Name
    evidence: "verified — matches spec"
    dom-snippet: "<span>London</span>"
    status: complete
```

## Execution Summary

Walked shared-setup fields and recorded evidence in structured YAML format. One field has placeholder evidence values indicating incomplete walk coverage.

- Step 1: shared-setup surface accessed, fields enumerated
- Step 2: evidence captured in YAML block above
- Currency Code field has "(not captured)" evidence and "NOT-WALKED" dom-snippet
- Office Name field fully verified with DOM evidence
- Deviation: Currency Code field was inaccessible during walk session
- No phantom handoffs present
- No strict-line violations in acceptance
- Self-test: should trigger C1 FAIL with multi-match (both "(not captured)" and "NOT-WALKED")
- Validator expected verdict: FAIL (C1 multi-match on forbidden tokens)
- Closed with documented evidence gaps
- Audit note: intentional multi-match C1 failure fixture

## Acceptance

- [x] Fields enumerated
- [ ] All evidence captured (Currency Code incomplete)
