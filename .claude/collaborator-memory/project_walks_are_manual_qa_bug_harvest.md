---
name: project_walks_are_manual_qa_bug_harvest
description: "Walks = the pipeline's only manual-QA pass — dual product (interaction-map + bug harvest); every walk-found bug's edge-case becomes a required TC"
metadata: 
  node_type: memory
  type: project
  originSessionId: d3adf543-4d4f-4a51-b6ef-25e71e2759eb
---

Rutvik's vision (2026-07-17): a walk IS a manual QA run — the ONLY chance to find bugs before
automation code is written around the app's current behavior. Walks connect agents to the real
surface; if a walk is flawed in any form, everything downstream (TCs, specs, coverage claims) is
poisoned.

Two first-class walk products, never one: (1) the interaction-map/enumeration, (2) the **bug
harvest** — adversarial per-element probing (boundaries, invalid input, rapid double-actions,
save/cancel races, state transitions), anomalies filed as structured suspicions → triaged → filed
bugs. **Closing the loop**: every confirmed walk-found bug's repro edge-case becomes a required TC
(regression armor). Zero suspicions on a non-trivial surface = bare-minimum-pass signal to
interrogate, not a clean bill.

Encoded structurally in `plans/pending/PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md` (§Walks are
MANUAL QA). Pairs [[feedback_surface_coverage_gaps_loudly]], [[feedback_self_produce_test_data]],
LR-062/LR-064/LR-065.
