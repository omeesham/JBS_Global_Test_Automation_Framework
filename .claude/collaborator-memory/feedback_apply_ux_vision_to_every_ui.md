---
name: apply-the-ux-vision-proactively-to-every-ui-built
description: "Progressive disclosure, contextual actions, and optimistic feedback are defaults to apply unprompted on every UI — not features to add only when the user asks"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 93ce0a56-81f6-41ce-991b-520bffdbcd17
---

The guiding-vision UX principles ("easy to use, simple to understand", progressive disclosure, "show only what's needed") are DEFAULTS to apply to every UI I build, proactively — not things to wait for the user to request.

**Why:** 2026-06-18 (IntelliQE) — I shipped Disconnect / Remove / Manage buttons that were ALWAYS visible whenever the connector was paired, even in states where they did nothing (useless when offline / transient / already-disconnected). Rutvik: "why are the buttons persistent? they should be only visible when they are needed, not when they are useless." The principle was already in the vision + MEMORY.md; I just failed to apply it.

**How to apply (checklist for every control I add):**
1. **Contextual visibility:** show each action ONLY in the state where it does something; hide it otherwise (don't disable-and-leave-it unless the disabled state itself teaches something).
2. **Optimistic feedback:** every action gives immediate visual response (transient "…ing" state), then a clear terminal state.
3. **Progressive disclosure:** primary action up front; advanced / destructive tucked away (collapsed / danger zone / confirm).
4. **Honest terminal confirmation:** the user must be able to SEE that an action succeeded — especially destructive ones.

Sits under [[user_vision]]. Pairs with [[feedback_server_authoritative_lifecycle]].
