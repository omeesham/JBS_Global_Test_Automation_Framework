# ASKING_DOCTRINE.md
**SOFT layer (UPLINK_DOCTRINE §5). Read by the Worker AT TRIP TIME ONLY** — embedded into the CLARIFY dispatch + the `--interrogate` consult prompt. NOT prepended to every ticket (prompt-bloat kill). Mirror of `uplink-policy.json` (HARD layer). Both-halves rule: edit both together.

> Provenance: PLAN_UPLINK_PROTOCOL Phase 0.2 (2026-07-12). ≤80 lines by contract.

## What a good ask is

1. **One precise question beats ten vague ones.** If you have many, ask the one whose answer unblocks the most.
2. **State your hypothesis + what you ruled out.** "I think X because Y; I already tried A and B and they failed because Z." A question with no ruled-out list reads as "do my thinking for me."
3. **Pick a class** (see below). The class routes the question to the cheapest oracle that can answer it.
4. **Never ask what the ticket or the cited DOCTRINE already answers.** Re-read them first. Asking an answered question wastes a consult and trains the ratchet on noise.
5. **Never ask for the work product.** The oracle constrains your next move; it does not write your code/content/deliverable (§4 no-labor). "Should I do A or B?" is legal; "write A for me" is not.
6. **A question that won't fit the packet cap is not a question — it's an undecomposed task.** Split it or escalate it; never pad it.

## Question classes (the closed taxonomy)

| Class | Ask it when |
|---|---|
| `clarify-scope` | the ticket is ambiguous BEFORE you start (pre-flight CLARIFY round) |
| `diagnose` | you have a failing state and a hypothesis but can't confirm the cause |
| `unstick` | you are repeating without progress (stall / same-error loop) |
| `choose-between` | two defensible next moves, and the choice materially changes the outcome |
| `safety-review` | your next action touches a protected path / is irreversible / high blast radius |
| `contract-fix` | the TICKET itself looks wrong (missing context, contradictory acceptance) — the fix is above you |

## Your chain position (Rutvik intent, verbatim requirement)

Your oracle is the dispatcher; the dispatcher can escalate above itself — ask what you actually need answered, and **flag when you believe the real answer lives above your manager** (worker → Claude → Rutvik). You never hold a mid-run trigger; you surface the ask, dumb code decides if it fires.

## Your sub-agents' unknowns are YOUR unknowns

If you spawn sub-agents: instruct every one to return its open questions and assumptions, and fold them into your own `## ASK`. A sub-agent assumption you didn't surface is your defect.

## Claude tier (asks that go up to Rutvik)

When Claude itself must ask Rutvik: **one-liner, dead simple, + options + a recommendation, batched where possible. Depth is pull-only** — never push a wall of context. Self-serve first is mandatory (LR-063 ladder: introspect → repo → Rovo/Jira → web → Rutvik). Rutvik is the TOP of the ladder, not the first stop. Ask-classes that reach him: vision-fork (both options defensible under the vision), scope-change >30%, protected-file / self-modification go, strict-line conflict (LR-046), budget-park notification. Same signature asked 3× → graduate it into memory/rule (Phase 4.1) so he is never asked twice.
