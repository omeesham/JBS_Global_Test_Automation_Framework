---
name: feedback_verify_synthesis_refutations
description: "In multi-agent do-or-die Workflows, independently verify every skeptic-DEFECT the synthesis overturns against ground truth — synthesis is not an oracle"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: bb2809de-a309-4c49-acca-6bc60e5d3210
---

In a multi-agent `Workflow` do-or-die audit, the final **synthesis/aggregator** agent can auto-refute concrete `DEFECT` findings raised by its own skeptics and emit a false `VERIFIED-CLEAN`. Observed 2026-06-09 (Corp Pricing W15-99 closure, `wf_b89ba07d`): 2 skeptics returned `file:line` DEFECTs (LR-019 baseline; a broken `:text-is` sr-only selector); the synthesis refuted both — one with a **categorically false** claim ("the Override screen has no Grid Options control", when it was at `override.ts:82-83`). Trusting the synthesis would have shipped a known-broken selector and falsely closed a do-or-die gate.

**Why:** AUD-017 ("auditor never self-grades its own authoring") has a blind spot — it doesn't cover the synthesis stage grading its own *sub-agents*. A synthesis is a single fallible agent summarizing others; it has no special authority to overturn a peer's evidence-backed finding.

**How to apply:** Before accepting any do-or-die Workflow verdict, the orchestrator **manually reads the cited `file:line` for every skeptic `DEFECT` the synthesis overturned**. Treat a refutation that rests on a *categorical* claim ("X does not exist", "no such control", "out of scope") as a red flag — those are the cheapest to disprove and the most often wrong. Never rubber-stamp the synthesis; it reports, it does not adjudicate. Reinforces [[feedback_claim_vs_artifact_crosscheck]] and [[feedback_override_cannot_convert_missing_to_evidence]]. Logged per-session in Encore `agent-mistakes.md`; graduate to an `AUD-NNN` framework rule if it recurs.

**Mirror case — the REVIEWER's categorical claim can be the false one (2026-07-11, S2D)**: a read-mode copilot reviewer (shell denied) raised a BLOCKER "claimed test harness is absent" while the T0 verifier had RUN that exact harness minutes earlier. One dispatcher-side `ls` settled it: file present, reviewer's read-only tooling simply couldn't see it. Same principle both directions — **when reviewer and verifier contradict each other on a file-existence/categorical claim, settle it yourself with one read-only command before bouncing anyone**; a read-mode agent's "absent/doesn't exist" is evidence about its sandbox, not about the disk.
