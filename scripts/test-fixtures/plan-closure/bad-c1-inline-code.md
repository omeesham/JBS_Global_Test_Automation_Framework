# PLAN_FIXTURE_BAD_C1_INLINE_CODE

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-18
**Closed**: 2026-05-18

---

## Objective

Fixture that should FAIL C1 due to a forbidden token inside inline backticks (not a fenced code block). The B3 fix established that inline backticks DO NOT filter out forbidden tokens — only fenced code blocks do.

## Scope

- Test C1 inline-code detection (B3 fix validation)

## Steps

1. Document design blocker in inline code format
2. Verify that inline backticks are not treated as fenced blocks

## Findings

The pricing surface has a known design issue tracked as `BLOCKED-BY-FIXME-DESIGN` that prevents full field enumeration. This blocker was identified during the walk session and documented inline.

## Execution Summary

Investigated pricing surface and documented the design blocker. The token appears in inline code context which per the B3 fix should still be detected by the C1 scanner.

- Step 1: design blocker documented using inline backtick notation
- Step 2: confirmed that inline backticks are single-backtick format, not fenced triple-backtick
- The forbidden token `BLOCKED-BY-FIXME-DESIGN` appears in inline code above
- Per B3 fix: inline backticks DO NOT exempt tokens from C1 scanning
- Only triple-backtick fenced code blocks provide exemption
- No phantom handoffs present in this plan
- No strict-line violations in acceptance criteria
- Self-test: should trigger C1 FAIL on the inline-code forbidden token
- Validator expected verdict: FAIL (C1 — inline backticks do not filter)
- Closed with design blocker documented
- Audit note: B3 fix regression test fixture

## Acceptance

- [x] Design blocker documented
- [ ] Pricing surface fully enumerated (blocked)
