---
name: split-big-tickets-parallel-workers
description: "Owner directive 2026-07-16 — never overload one worker with a big ticket; split into multiple parallel workers on disjoint surfaces, with clash-avoidance"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 92727b65-1382-486e-bdfd-5504c81a7ca5
---

Rutvik (2026-07-16): "dont be shy of multiple workers.... big tasks on one employee = mental health burn... similar applies to ai — and make sure the coworkers dont clash it out."

**Why:** 12 cap-deaths on 2026-07-16 were mostly one-worker-carrying-a-multi-target-build (LCD_07: 4 staged files + 8 probes on one 180cr ticket died twice). A big ticket burns a worker's credits/context exactly like burnout; two small tickets each finish clean.

**How to apply:**
- At ticket-authoring time: if a build has ≥3 independent targets or its probe battery is a separate concern, SPLIT into multiple tickets and dispatch them in PARALLEL (one turn, multiple dispatches, then end turn).
- Clash-avoidance is structural, not hopeful: disjoint OUTPUT DIRs per run (already standard), disjoint file lots per surface, staging-only tickets (live applies stay with the dispatcher), and never two concurrent workers writing the same staged file. If two lots must touch the same file, sequence them.
- Standing cap stays: >5 concurrent workers needs Rutvik's consent ([[project-copilot-takeover-system]] subagent rule); up to 5 is encouraged, not just allowed.
- Reviewer fan-out follows the same rule: per-lot reviewers in parallel, cross-provider per lot.
