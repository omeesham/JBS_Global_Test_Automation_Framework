---
name: failing-tc-as-bug-evidence-vehicle
description: User authorizes deliberately-failing TCs (no test.fixme) when the failure is the bug-report evidence for an upstream divergence-from-baseline
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 362055c8-d4c7-4496-a642-e7173b72176c
---

When walk-evidence specifies a TC assertion that matches the nav2 baseline truth but is known to fail on e2e (per a filed bug), write the TC verbatim per walk-evidence — DO NOT adapt it to a passing variant and DO NOT add `test.fixme()`. The failing TC IS the bug-report evidence vehicle for Encore-side review.

**Why:** User direction (2026-05-20 on SUBPLAN_DQU_V6_PILOT_SSL_C): "its probably a bug, so keep it as it... we will report to encore about it.. it works fine in the baseline nav2, but in new e2e env it doesnt which means nav2 is probably not bugged". Applies user's LR-ENC-001 truth-hierarchy principle ("for any behavior uncertainty on Encore, old site decides") to TC authoring even when the spec will fail on e2e.

**How to apply:** When SP-C / generator / planner is about to write a TC from walk-evidence and notices the proposed assertion will cascade into a known filed bug (e.g., BUG-LOC-SHR-001 Miami catalog filter): write the TC verbatim per walk-evidence proposed-TC-assertion + cite the BUG-NNN inline + add a comment explaining "expected fail on e2e — evidence vehicle for Encore bug-report". DO NOT add `test.fixme()` (violates FORBIDDEN LOOPHOLE #3). Surface the expected-fail in the Execution Summary's "Known Risks for SP-D Step 7" section so the downstream agent classifies correctly per the 4-class table (PASS-LIVE / FAIL-FRAMEWORK / FAIL-APP / CHANGED-SYMPTOM) instead of treating it as an unexpected new failure.

**Tension acknowledgment:** This overrides FORBIDDEN LOOPHOLE #3's strict reading ("new TCs MUST pass x2 cycles or NOT be added"). The override is user-authorization-driven and per-case, not a general license. Apply only when (a) walk-evidence proposed assertion is correct per nav2 baseline AND (b) a filed bug already exists explaining the e2e failure AND (c) user has explicitly authorized OR the bug-001-cascade pattern is unambiguous AND TC count matches walk-evidence GAP count strictly.

**Related:** [[feedback_baseline_truth_source]] (general nav2-IS-truth principle), LR-046 strict-line discipline (user authorization is the proper rescope path), FORBIDDEN LOOPHOLE #3 (the rule overridden), BUG-LOC-SHR-001 (the canonical cascade example).
