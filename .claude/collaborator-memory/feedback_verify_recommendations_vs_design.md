---
name: feedback_verify_recommendations_vs_design
description: "A bug-hunt/audit recommendation can conflict with existing DESIGNED behavior — verify against tests/architecture before implementing, or you ship a regression that breaks a tested feature."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 93ce0a56-81f6-41ce-991b-520bffdbcd17
---

When acting on a recommendation from an adversarial bug hunt / audit (even a thorough, multi-agent, verified one), do NOT implement it blindly — first check whether the codebase INTENTIONALLY supports the behavior the recommendation would forbid.

**Why:** During the IntelliQE "Login to Claude" bug sweep (2026-06-19), the hunt's BUG-040 recommendation said "bind a username↔connectorId at most once (reject a second active connector)". I implemented it as a register-time rejection. It broke a *designed, tested* feature: multiple connectors per user (laptop + desktop) with per-connector token isolation — the exact thing `sandbox-tests/last-mile.mjs` RTE-02a asserts ("a valid token for one connectorId can't drive another"). The per-connector token IS the intended mitigation (which is why the hunt itself downgraded the root BUG-037 from critical to medium). My "defense-in-depth" contradicted the architecture. Caught only because the sandbox suite turned red; I reverted it.

**How to apply:**
1. Before implementing an audit recommendation that ADDS a constraint, grep the test suite + read the relevant module for whether the soon-to-be-forbidden behavior is an intentional design (a test asserts it, a comment explains it, an architecture exists for it).
2. If it conflicts, the recommendation is wrong-for-this-codebase — note the conflict honestly, prefer the existing mitigation, and classify the root as deferred rather than shipping a feature-breaking "fix".
3. Run the full existing test suite after lifecycle/security changes; a red test that encodes a DESIGNED behavior means revert, not "update the test to match my change". (Contrast: a red test that encodes the OLD buggy behavior I intentionally changed → update the test to the new correct contract. Distinguish the two by reading what the test is actually asserting and why.)

Pairs with [[feedback_real_verification]] (LR-059): real E2E drive (launching the actual connector) also found a bug the 44-item hunt AND all sandbox tests missed — re-pair after Disconnect was bricked by a stale on-disk token suppressing the fresh pairing code. Sims/tests didn't exercise "stale token + deleted server row + fresh code". Related: [[feedback_verify_synthesis_refutations]], [[feedback_claim_vs_artifact_crosscheck]].
