---
name: Always verify on live preview, never just curl
description: Never declare a fix "working" based on curl alone — always verify on the actual live preview UI
type: feedback
---

Always verify code changes on the live preview (localhost:5173), not just via curl.

**Why:** In this session I "fixed" the chatbot and declared victory after curl returned 200. But the actual UI was showing "Failed to reach the AI" because:
1. The demo user (encoreqa) had `clientId: null` → 403 from tenant middleware
2. The frontend's generic catch handler showed a misleading error message
3. PostgreSQL wasn't running → 500 errors on DB-dependent endpoints
None of these showed up in my curl test because I used superadmin with a fresh token bypassing tenant middleware, and the chatbot's gatherContext() uses Promise.allSettled (DB failures are silent).

**How to apply:** After ANY backend change:
1. Check preview_network for failed requests FIRST
2. Check preview_console_logs for errors
3. Actually interact with the UI (fill form, click button, read response)
4. Only THEN declare it working
5. Never test with a different user/role than what the UI is actually using
