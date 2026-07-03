---
name: feedback_general_quality_prompt_intent
description: "How to read Rutvik's reused \"no cut corners / full identity sweep / feel free for subplans / /review /audit\" prompt — it's a general-purpose boilerplate, extract intent not literal clauses"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ee95b1cd-9055-48e0-aeae-7a3dbb53a682
---

Rutvik keeps a **general-purpose quality prompt** he pastes onto many tasks: *"feel free for whatever subplans … full identity sweeps not surface-level … /review /audit … do not assume, read before you think you got it, do not rush, no cut corners … each /identity job satisfied … nothing causes regressions due to partial work."* On 2026-06-15 (drafting SUBPLAN_CURRENCY_FCC) he clarified: **"don't take that prompt too seriously, it's a general-purpose prompt … for bigger plans, no subplans needed for this small task. Main goal = identity coverage, no code-level mistakes."**

**Why:** the prompt is boilerplate scaled for large multi-subplan work; applying every clause literally to a small task = over-engineering (e.g. splitting into sub-subplans nobody wanted).

**How to apply:** when that prompt appears, extract the *operative* intent for the task's actual size:
- The two non-negotiables every time: **(1) full `/identity` coverage** — every one of the 7 pipeline identities (HUNTER/GIVER/BUILDER/HEALER/WATCHDOG/GARDENER/OWNER) has a real, executed job + its own dated deliverable in the plan, **zero `(skipped)` matrix cells** (upgrade the cells the standard FCC pattern would skip — HEALER, GARDENER — to real dated artifacts); and **(2) no code-level mistakes** — verify every path/count/method-signature against the live tree before asserting (LR-020), never carry a sibling plan's stale path.
- **Don't** auto-split into subplans for a small/single-module task just because the prompt says "feel free for subplans" — only split if genuinely >~400 lines or multi-module (master two-subplan variant).
- `/review` `/audit` mean *author it audit-proof* (LR-048 structural minimum, LR-041 frontmatter, LR-048 v3 all-real-path matrix → passes C6 `deny`), and run an adversarial self-audit before saving — not necessarily a literal skill invocation.
- "Do not assume, read before you got it" → reconcile claims against reality even when an artifact header looks authoritative (e.g. a stale "2 manual TCs" MD header that the live spec actually automates via a loop). Convert assumptions into explicit reconciliation tasks in the plan. See [[feedback_consult_artifacts_before_asking]], [[feedback_self_first_research]].
