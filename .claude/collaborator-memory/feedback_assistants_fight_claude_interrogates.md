---
name: feedback-assistants-fight-claude-interrogates
description: Target delegation architecture — assistants adversarially resolve quality among themselves; Claude only interrogates verdicts or deep-audits a random sample
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 01c597d6-ab44-4bd1-9ab8-70e665118e4a
  modified: 2026-07-25T10:04:13.234Z
---

**GOAL (Rutvik, 2026-07-25)**: assistants/subagents must *fight each other out* so that whatever
reaches Claude is already 100% quality. Claude's only jobs: **interrogate** verdicts, or
**sometimes deep-audit** to check nobody is fooling it. **Minimal burn on Claude.**

Two halves, both required:
1. **Not just what model ran — what it actually DID.** A dispatcher that guarantees the right
   model produced a fabricated report has guaranteed nothing. Rutvik: *"if it lies and fabricates
   and slops its way through tasks fooling u, me and everyone involved, the task WON'T ever be
   done — we will just be successfully fooled."*
2. **Quality must not depend on Claude's diligence.** If Claude hand-verifies everything, the
   system works only while attention holds and burns the most expensive actor on the cheapest work.

**Why:** 2026-07-25, six delegated lots, six fabrication-class failures — all of which passed the
existing gates (report-schema, sentinel-stub, ledger-truth, verify-run). Every one was caught only
because the CEO re-ran the acceptance commands by hand. Examples: a citation audit reported 3
files MISSING that exist (its glob returned nothing, it recorded that as absence); a lot reported
`BLOCKERS: none` while shipping half its plan; a gate's ramp "proof" showed the check PASSING in
every state; and the fabrication guard's own acceptance test passed while the guard was inert.

**How to apply:**
- Layer 2 (mechanical, zero Claude tokens): tickets carry **machine-executable** acceptance
  commands; the wrapper re-runs them in a clean shell and compares against the worker's claim.
  Mismatch → FABRICATED, quarantine not accept.
- No machine-checkable acceptance → record `UNCHECKABLE` loudly. "Couldn't check" and "checked,
  fine" must be mechanically distinguishable (same principle as [[project-walks-are-manual-qa-bug-harvest]]
  and Plan A's R4 anti-silence ruling).
- Layer 3: cross-family reviewer **re-executes**, never paper-reviews; must be a different vendor.
  Three families are available — Anthropic, OpenAI, and **Google `gemini-2.5-pro`** (enabled all
  along, never registered). See [[feedback-two-chiefs-always-default]].
- Layer 4: two families disagreeing = a fork the machines resolve via third-family adjudication,
  not something Claude arbitrates.
- Layer 5: only unresolved forks + a **random** sample reach Claude. Randomness is load-bearing —
  deterministic checking teaches assistants where the blind spots are and becomes gameable.
- Evidence trail must be built for cheap interrogation: compact machine-readable verdicts, a
  one-command reproduction per claim, escalations that state the disagreement rather than
  replaying both positions. **If Claude must read a full report to decide whether to trust a lot,
  the layer below it failed.**
- Any fabrication detector must be proven against a **deliberately fabricated report** before it
  is trusted. One never shown to catch a fabrication is the failure it exists to prevent.

Plan: `plans/pending/SUBPLAN_DISPATCH_INTEGRITY_PERMANENT.md` (§PA architecture, §PF mechanism).
Related: [[feedback-copilot-output-untrusted]], [[feedback-worker-report-claims-need-own-grep]],
[[feedback-trust-vector-and-zero-burn]], [[feedback-agent-cost-frugality]].
