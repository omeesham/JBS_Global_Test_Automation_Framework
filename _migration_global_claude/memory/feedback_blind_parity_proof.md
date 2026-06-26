---
name: blind-parity-proof
description: "When proving parity/equivalence (e.g. TDW walk vs known-good), run BLIND — no answer-key, form your own result first, then diff; never tweak for forced success"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 19fa88c7-667b-4f98-b2fc-369f51d8ca89
---

When asked to prove parity/equivalence between a new system and a known-good baseline (e.g. the Tiered Delegated Walk vs a hand-done field-inventory), run the proof **blind and full**: the new system (and any delegated workers) must NOT see the baseline answer-key; form the independent result first, then diff; report every mismatch honestly as a real finding (either side could be the one that's wrong). Rutvik's exact words: "run system on full, be blind, do not tweak for forced success."

**Why:** letting the system see the expected answer makes it conform to it — a circular, self-fulfilling pass that hides real divergence. This is the AUD-017 / real-verification discipline applied to parity proofs specifically. A green that was steered is worse than an honest red.

**How to apply:** (1) gather the new system's evidence/dispositions without reading the baseline's answer section; workers get probe instructions only, never the expected values; (2) commit your independent conclusion BEFORE opening the answer-key; (3) diff and surface every nuance — including where your own first pass differed — rather than smoothing it. For machine-comparable parity, diff on STABLE features (counts, structure, dispositions), not volatile runtime IDs (e.g. Radix `_r_x_` IDs regenerate per render). Pairs with [[feedback_real_verification]] and [[feedback_verify_synthesis_refutations]]. First applied 2026-06-22 on PLAN_TIERED_DELEGATED_WALK Phase-2 Pricing parity proof.
