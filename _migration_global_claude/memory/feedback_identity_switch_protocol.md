---
name: Identity-switch protocol (proper, no override)
description: When a task spans multiple identities' permissions, switch identities cleanly mid-session — do NOT use override. Re-LOAD the new identity's full prompt/rules every switch; relabeling the banner is not switching.
type: feedback
originSessionId: 2ab77cbd-56f9-4e32-b1f3-753708c1ff4c
---
When a task crosses identity boundaries (e.g., research as GARDENER → write artifacts as OWNER), the right move is a clean mid-session switch, NOT `override`. Override is a one-shot break-glass for an unexpected single action — not a workflow tool.

**Why:** Rutvik directive 2026-04-23 during SP-AAE-01 execution. Original instinct was "OWNER + override" to plow through GARDENER's read-only block on `_internal/field-inventories/`. Rutvik corrected: identity is a *constraint set*, not a label. Switching means re-reading the new identity's system prompt / rules / file ownership, then operating under the new constraints — not just changing the banner. Override leaves no audit trail of *why* the constraint was bypassed; a clean switch with rule update creates permanent, greppable governance.

**How to apply** (every mid-session identity switch):

1. **Stay disciplined in current identity** — do NOT touch anything outside current identity's §2 scope, even if it would save a step. If a write is blocked, that's a signal to switch, not to override.
2. **Complete current identity's self-audit checklist FIRST** — extracted from the agent file or /identity Step 8 (OWNER). Log result.
3. **Log the switch explicitly**: `IDENTITY SWITCH: [OLD] -> [NEW] | Self-audit: [pass/fail]`
4. **Invoke `/identity <NEW>`** — this RE-loads the new identity's full agent file (or Step 8 inline for OWNER). Do NOT skip this step "because you remember" — re-reading is the point.
5. **Extract from the re-load** before doing any work: HARD STOPS, file ownership matrix (§2 column for the new identity), tools list, self-audit items. Memorize these as the new constraint set.
6. **Emit the new identity banner** at the start of every subsequent response (`[OWNER | ALL-* LR-*] >`).
7. **If the new identity ALSO can't write the target paths**: either update §2 first (preferred for governance — creates permanent grants for future subplans) or use override (only if the path will never be written again).

**Trigger:** any moment during /execute, /chain, /audit, etc. where the current identity's §2 ownership blocks a planned write AND the work is legitimately part of the assigned task.

**Companion rule:** ALL-077 (agent-mistakes.md) — subplan identity assignment must match §2 ownership at authoring time, so this whole switch dance can often be avoided.

**Companion upgrade (deferred):** SP-AAE-01 surfaced this as a structural gap in the /identity skill — there's no hook today that *blocks* override-without-cause or *enforces* identity re-load on switch. The follow-up upgrade work in TodoWrite covers adding such a hook + /identity skill changes so this discipline is enforced, not just documented.
