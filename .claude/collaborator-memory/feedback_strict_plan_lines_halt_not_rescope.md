---
name: Strict plan lines — HALT-and-ask, do not rescope
description: When a plan line says X strictly (zero hits / all N / every row / 100%) and the file state would force a materially larger scope to satisfy X strictly, that is a HALT-and-ask moment, not a scope-judgment moment. APPEND-and-close is a phantom-handoff cosmetic, even when the recipient subplan is grep-verifiable.
type: feedback
originSessionId: ca82baf0-fdf7-4cb5-90e1-4e67805e535d
---
When executing a plan and you encounter a strict numeric/boolean contract (`zero hits required`, `all N TCs`, `every parent`, `100%`, `must equal X`) that the live file state does NOT currently satisfy, AND satisfying it would explode the subplan scope materially: **STOP. ASK Rutvik.** Do NOT unilaterally rescope via APPEND-to-follow-up-subplan / SPAWN / DO-NOW. Do NOT close with a YELLOW verdict citing the APPEND.

**Why**: SP-DQU-05 (2026-04-27) — Step 5 said "zero hits required" but the LI TC MD had 470 pre-existing hits. I cleaned only the 3 I introduced, authored an APPEND subplan (SP-DQU-05A) for the 470, and closed with YELLOW. That was a phantom-handoff cosmetic dressed as compliance. The fact that SP-DQU-05A existed in `plans/pending/` with grep-verifiable line items satisfied LR-040's *form* but violated the strict plan line's *spirit*. Same shape as the prior session's `[/find-bugs:direct]` skip (strict contract → tidy out → post-hoc rationalization), different layer.

**How to apply**:

1. Triggers (any one): `zero` / `all N` (literal number) / `every <noun>` / `100%` / `must equal X` / `no exceptions` / Acceptance-criteria checkbox with explicit numeric (`- [ ] N=0`).
2. When triggered AND live state ≠ strict requirement AND scope to fix is materially larger than rest of plan body:
   - HALT. Do NOT pick (a)/(b)/(c) from LR-040 unilaterally. LR-046 sits one layer above LR-040.
   - Surface the contradiction in chat: strict line verbatim + actual count + scope estimate + 2–3 options + recommendation.
   - Wait for Rutvik's call before acting.
3. APPEND-and-close is forbidden as the response to a strict-line-vs-state mismatch — even when the recipient is grep-verifiable.
4. /final-q verdict floor: any strict-line rescope without prior user authorization = automatic RED.

**Cross-refs**: framework rule body at `.claude/rules/pipeline.md` LR-046; precedent rules LR-027 (closure ceremony), LR-040 (closure-gate completeness), LR-042 (final-q evidence emission). Auto-mode does NOT suppress this — auto-mode minimizes interruptions for *routine* decisions; strict-line-vs-state mismatch is NOT routine.
