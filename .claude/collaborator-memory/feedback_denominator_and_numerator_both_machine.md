---
name: feedback-denominator-and-numerator-both-machine
description: A completeness gate must machine-own the numerator as well as the denominator — self-asserted coverage rebuilds the hole the denominator fix closed
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6f9e6715-c380-4ff0-8482-cea2d7a28dcf
  modified: 2026-07-22T06:33:16.284Z
---

A coverage gate that machine-enumerates the **denominator** but lets the agent **self-assert the numerator**
has only closed half the hole. Both halves must be machine-owned.

**Why:** 2026-07-21. The LR-062 breadth fix made the element denominator machine-enumerated — agents could no
longer under-declare what existed. The follow-up depth-gate design (rev1) repeated the same mistake one level
down: it machine-derived the *case* denominator but accepted `covered-by-TC:<id>` as the numerator with no
verification. A judgment seat produced the cheapest path through in five steps — cite one oracle-calling test
across all eleven boundary rows, pick `"abc"` as the value so the actual trap value (`>100`) is never probed,
cite the Equipment test id in the Labor rows — rebuilding a 28-slot hole gate-green with ~8 one-liner tests.
Its sentence: *"It eliminated agent-defined denominators; it left agent-asserted numerators fully intact."*

Two further generalisations from the same review:

- **Counting containers ≠ counting contents.** Elements and states are containers; values-per-field and
  assertion strength are contents. A gate that counts one will report 100% while the other is empty. Say which
  one a gate measures, out loud, or people will assume it measures both.
- **A detector cannot catch an absent assertion.** Anti-pattern detectors (unfailable/vacuous/swallowed) find
  known-bad shapes. Requiring known-good shapes is a *floor* and is a different mechanism — see
  [[feedback-gate-fix-floor-design]]. Both are needed; neither substitutes.

**How to apply:** when designing or reviewing any completeness gate, ask both questions separately — *who
defines the denominator?* and *who asserts the numerator?* If either answer is "the agent," name it as an open
hole in the design's own residuals before anyone else has to. Bind evidence to the specific slot (a runtime
receipt keyed by case id, a title token), never to a container that can be cited many times. Related:
[[feedback-recurrence-convicts-prior-fix]], [[feedback-real-verification]].
