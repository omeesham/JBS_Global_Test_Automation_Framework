---
name: commit-gate-battery-before-pushready
description: "green x2 + review are necessary but NOT sufficient for push-ready — run the full commit-gate battery (esp. check:spec-quality), it catches passing-but-slop code"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: cd6f1e7a-9aa5-40ce-a09a-473411be1881
---

Before declaring a deliverable push-ready, run the FULL commit-gate battery — especially `npm run check:spec-quality` (spec-sleeps, swallowed-failures, unfailable-assertions, reload-wait, vacuous-grid-assertions). green x2 + cross-family review prove the tests PASS; they do NOT catch code that passes while still being slop.

**Why:** 2026-07-18 NM-2269 was closed (green x2 + gpt-5.5 review) yet still carried 7 LR-052 fixed-timeout sleeps + an unannotated swallowed `.catch(()=>{})`. Neither the green x2 runs nor the per-plan reviews flagged them — only `check:spec-quality` (which is NOT in the pre-push hook, so it never fires on `git push`) caught them, at push-prep time.

**How to apply:** push-readiness = green x2 AND every commit gate: `check:spec-quality`, `check:tc-parity`, `verify-no-forbidden` (LR-058), `xlsx:freshness`, `check:step-labels`. Run the battery as its own explicit gate before saying "ready to push." Pairs with [[feedback_gate_push_on_denylist]] and [[feedback_verify_provenance_before_scope_dismissal]].
