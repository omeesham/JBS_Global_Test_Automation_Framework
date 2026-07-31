---
name: feedback_two_chiefs_always_default
description: "The 2 assistant seats = DEV-TL + QA-TL (opposite families, swap per task); QA critically verifies at EVERY stage; never 1 seat, never judgment-dependent"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a6ff7624-89fa-4e88-96be-901ee0327bf0
---

**v3 org model (Rutvik, 2026-07-15 — supersedes the blind-duel framing):** Claude = **BA** — takes intent from Rutvik, delegates, judges. Claude has exactly **two assistants**: a **DEV agent (TL)** who executes and delegates to its own subagent tree, and a **QA agent (TL)** who critically verifies at **every stage of development** (not end-only) and has the SAME delegation depth. They **collaborate** like a real team: dev's output is QA's input, QA bounces defects back to dev. *"a dev agent assistant and a qa assistant agent… just like real teams perform."*

**Canonical top-level seats (default):** **opus = DEV-TL (worker)**, **gpt = QA-TL (reviewer)**. But this is only the default identity of Claude's two direct assistants — NOT a fixed model rule.

**THE LOAD-BEARING INVARIANT (Rutvik, 2026-07-15 — no provider grades its own homework):** each DEV-TL and QA-TL has its **own team and may call ANY LLM** (opus/gpt/sonnet/haiku/…). The hard, RECURSIVE rule at every level of the tree: **every unit of work is TAGGED with the model-provider that executed it; the provider that REVIEWS it must be DIFFERENT from the provider that produced it.** Concrete: if the DEV side delegated a chunk to gpt (so that chunk's tag = OpenAI), the QA side may NOT use gpt to review it — it must pick a non-OpenAI provider. Cross-PROVIDER (not just cross-seat) is the anti-self-review floor; it holds down through every subagent delegation, keyed on the provenance tag, not on which seat is nominally "dev" vs "qa". Structural need: the tag + a reviewer-provider≠executor-provider check must be wired into the delegation harness (PLAN_DELEGATION_CHEATPROOF / PARITY scope).

**Anti-collusion floor (kept from v2):** collaboration is across ROLES, never a shared verdict — the QA seat's green must be grounded in machine facts (the verify-run script, disk truth, re-execution) that Claude re-runs itself; the script is QA's instrument, not QA's replacement (real teams: QA runs the test suite; the suite doesn't replace QA). Separate output files always (shared-file contamination incident 2026-07-14).

**Unchanged invariant:** **NEVER one seat, never "depends on task type"** — no work is accepted without the opposite-family QA seat's verification, down to a one-line edit. The lone-chief incident stands as precedent: dev-only rounds fabricated a green (claimed FIXED on a file it never edited); every round with the second seat caught real defects. Token-thrift ([[agent-cost-frugality]]) never drops the QA seat.

**Blind-duel variant** (both seats build the same thing independently) is now the SPECIAL case — used when Claude wants two independent designs to referee; the DEFAULT shape is dev+QA pairing.

**Everyone gets their own harness:** each layer (dev TL, QA TL, their subagents) needs its own guardrails/framework/engineering — *"to make them optimum… just like real teams"* — this is PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY (context/rules injection per agent) + PLAN_DELEGATION_CHEATPROOF (machine-fact verification at acceptance) + PLAN_DELEGATION_GOVERNOR_AND_STEERING (context caps + steering downlink through the tree).

**How to apply:** every substantive delegation = dispatch dev seat + opposite-family QA seat (per-stage, not post-hoc); QA verdicts must cite machine facts; Claude re-runs the script layer on acceptance. Related: [[feedback_best_of_best_assistant_seats]], [[project_assistant_approval_authority_model]], [[project_copilot_takeover_system]], [[feedback_trust_vector_and_zero_burn]].
