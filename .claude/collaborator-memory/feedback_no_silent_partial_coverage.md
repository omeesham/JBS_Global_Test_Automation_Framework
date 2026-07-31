---
name: feedback-no-silent-partial-coverage
description: "When a test validates a structured record, every field must be asserted or explicitly explained — never silently left out of an otherwise-green test"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 05aeccba-a77b-4466-b404-595cbbec5697
---

Never leave part of a structured record (CSV row, JSON object, API response) silently unasserted in a
test that otherwise reports green. Every field gets either a real assertion or a written, evidence-based
reason for being excluded (data-blocked — no sample exists yet; domain-unknown — checked live data +
Jira/Confluence and still couldn't confirm meaning). "I don't know this field's format" is a trigger to
go look at a real sample or the spec doc — not a free pass to quietly skip it.

**Why**: TC-CPR-TIO-023 (NM-2262 Loc Pricing Export) asserted 8 of 11 CSV columns and silently dropped
the 3 date columns. It surfaced only because Rutvik asked directly — no structural check caught it,
because the test was green the whole time. Rutvik's framing: the failure isn't "an offered follow-up
went unconfirmed," it's "why wasn't this automatic in the first place, before anyone had to ask?" LR-031
(SKIP requires exhaustive investigation) has a blind spot: it only catches an explicit `test.skip` /
`NOT-AUTOMATABLE`, never silent under-assertion inside a test that never skips anything.

**How to apply**: before finalizing any assertion over a structured record, enumerate every field the
live sample actually carries (not just the fields a plan mentioned) and account for each one out loud —
asserted, or excluded with the one-line reason next to the assertion. Graduated to framework rule
[[LR-068]] in `.claude/rules/specs.md` (deliberately no gate/hook — heuristic detection of "should have
asserted field X" is false-positive prone; this is an authoring-time awareness rule, not a structural
gate). Sibling of [[feedback_bug_pattern_learning.md]] (sweep after any bug) and LR-031.

**Assertion-strength corollary (2026-07-07, NM-2264 Export-All council review).** Green ≠ strong.
Covering a field with a WEAK oracle is only cosmetic coverage — a regression still slips through. Assert
the strongest KNOWN oracle: (a) **literal over comparison** when the true value is knowable — an empty
scope is `toBe(0)`, not `toBeLessThan(other)` (a "CAD Equipment has no pricebooks" test whose oracle is
`cad < usd` passes when CAD wrongly returns columns); (b) **collection value, not just length** — a
`getAll(...)` / repeated-param / array oracle asserts membership or the exact sorted set, never only
`.toHaveLength(n)` (wrong values, right count = a passing lie); (c) **every field of the record** (the
core rule above). Run an adversarial self-pass — "what wrong value would STILL pass this?" — the exact
pass a cross-vendor reviewer runs, which I skipped on NM-2264. And run `npm run check:spec-quality` on the
**working tree** before any done/verified claim — the pre-commit gates don't fire on uncommitted work, so
"green" from a spec run is not a strong-assertion audit ([[LR-060]] obligation 4). No self-built or
count-only proof substitutes for driving the real thing ([[feedback_real_verification]] / LR-059).
