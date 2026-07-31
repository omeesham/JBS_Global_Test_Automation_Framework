---
name: Debug methodology - trace the actual error path, don't guess
description: When debugging, trace the exact error from UI → network → backend logs → code, not hypothesize
type: feedback
---

Follow the error trace, don't hypothesize root causes.

**Why:** In this session I spent massive time on the wrong root cause. The original screenshot showed "AI assistant failed to respond" but I jumped to "must be Claude CLI env vars" without first checking:
- What HTTP status the frontend actually received (403, not a CLI error)
- What the backend logs said at that moment
- Whether the user's auth token was even valid

The REAL error chain was: encoreqa user → clientId:null → tenant middleware 403 → frontend catch → "Failed to reach the AI". The Claude CLI fix was also needed but was ROOT CAUSE #2, not #1.

**How to apply:**
1. Start from the UI error message
2. Check network tab → what HTTP status? what endpoint?
3. Check backend logs → what error was logged?
4. Trace to exact line in code
5. ONLY THEN form a hypothesis
6. Never skip steps. Never assume.
