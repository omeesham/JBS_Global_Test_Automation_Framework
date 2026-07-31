---
name: No readiness questions when given a subplan + /execute
description: When user invokes /execute on a named subplan file, skip procedural readiness questions (auth / user-at-machine / scope confirmation / retry protocol) and just run until done or blocked
type: feedback
originSessionId: 39bc46c5-994f-4f0b-91df-8a5252838e09
---
When the user invokes `/execute <SUBPLAN_FILENAME>` (optionally with `/ultrathink`), do NOT ask procedural readiness questions like:
- "Is Chrome authenticated right now?"
- "Are you at the machine?"
- "OK to modify shared test state?"
- "Full scope or subset?"
- "HALT-first or try-N-then-halt?"

These are all answered by: "the subplan exists, user named it, user invoked /execute — GO." The adversarial audit (ultrathink Step 3) produces concrete findings that sharpen the execution, it does not produce questions back to the user.

**Why**: Rutvik explicitly called them "bullshit questions" (2026-04-22 session, SP-B-LM-1 Currency catalog). His model: if the subplan's bootstrap + dependency-gate + KEEP-list already encode the answers, then any readiness question to the user is filler that fails the HIGH-IMPACT STEERING filter.

**How to apply**:
- On `/execute SUBPLAN_*` invocation: run adversarial audit internally, record findings in-line, then IMMEDIATELY proceed to Phase 1 (baseline / first real action).
- Only HALT + ASK when a blocker actually materializes mid-execution (auth prompt, missing dependency, scope ambiguity surfacing from DOM state, regression-guard diff drift). Never pre-emptively.
- Live-MCP sessions default to Claude in Chrome per LR-038; that IS the answer, not a question.
- Prior-session findings (e.g. 2026-04-17 NOT-TRACKED claims) get re-verified by running the save cycles fresh, not by asking user "should I re-verify?".

**Corollary**: the /questionnaire discipline (feedback_question_quality.md) applies to PLANNING, not to EXECUTION of an already-signed-off subplan. During execution, questions are a signal of cowardice or lack of context-absorption, not of rigor.
