---
name: trust-vector-and-zero-burn
description: "Gates aim at copilot's claims, never at Claude's dispatch path (Rutvik trusts Claude, Claude distrusts copilot); and NEVER burn credits waiting on a dispatched worker — end the turn"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d1a3be89-0a3f-47f3-b756-2d6a2a028b84
---

2026-07-14, Rutvik — two standing laws for the delegation layer:

**1. Trust vector.** *"we trust claude, we do not trust copilot… this thing proves we != trust claude, which is false."* A parallel session's hardgate demanded his explicit go before Claude could even WRITE a delegation ticket file. That is the trust model inverted: the gate frictioned the exact behavior (delegating) that all doctrine demands.

**Why:** distrust belongs on copilot's CLAIMS (fabrication-prone, no harness — *"claude was made a harness where it cannot cheat; copilot agents are not using the same harness, due to which they are allowed to cheat"*), never on Claude's DISPATCH actions. The one boundary that stays: Tier-2 (hooks/settings/gate configs/seats/verifier/corpus) stays gated for everyone including Claude — no self-laundering.

**How to apply:** Claude writes tickets, invokes `copilot-worker.sh`, runs envelope/verify tooling autonomously — zero permission asks. If any gate prompts on a dispatch-path action, that gate is defective: flag it, stage an allowlist patch (Tier-2, Rutvik applies). Enforcement on copilot lives at the boundary — machine facts (disk hashes, CLI logs, re-execution), never prompt-level instructions inside their runtime.

**2. Zero-burn waiting.** *"make sure claude doesnt burn credits while waiting for delegation to return in ANY COST… i have seen this happen!"*

**How to apply:** dispatch in background → END THE TURN immediately. Forbidden while workers run: polling, sleep loops, reading interim output, "checking on" runs, filler analysis. Wake only on task-notification; batch all interrogation on wake; fire multiple dispatches in ONE turn.

Structural encoding: PLAN_DELEGATION_CHEATPROOF.md Phase 2 §4 (zero-burn law) + Phase 3b (trust-vector correction). Related: [[agent-cost-frugality]], [[feedback_two_chiefs_always_default]], [[project_copilot_takeover_system]].
