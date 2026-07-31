---
name: Browser interaction — verify DOM before pivoting to complex solutions
description: After any UI keyboard interaction, check el.value via JS before concluding it failed. Never accept prior-session "X won't work" claims without re-testing.
type: feedback
originSessionId: 86c85db6-6cf4-4523-b171-0564ec50af3f
---
After any click/type/Tab sequence, run `javascript_tool: document.querySelector('[data-testid="..."]').value` BEFORE concluding the interaction failed and pivoting to JS engineering.

**Why:** Angular percentage inputs display the formatted unfocused value in screenshots (e.g. "25.0%") even after the underlying value changed. Zoom screenshots are unreliable failure signals. On 2026-04-22, triple_click + type + Tab DID work on the BM input — but a zoom showing "25.0%" caused a pivot to Angular NgControl / `__ngContext__` investigation wasting ~20 tool calls. User had to manually intervene.

**How to apply:**
1. Do the simple thing: triple_click (or click + Ctrl+A) → type → Tab
2. Immediately run `javascript_tool: el.value` — 1 call, definitive answer
3. Only if JS confirms the value is UNCHANGED, investigate further
4. Never accept a prior session's "this input won't dirty" claim without re-testing in the current session — page state, auth, and prior probes all vary

**Corollary — browser_batch fragility:**
`browser_batch` fails with "Another debugger attached" / "No tab available" when DevTools is open or a prior batch errored. Use individual sequential tool calls for critical interaction sequences.
