---
name: verify-provenance-before-scope-dismissal
description: "A worker's \"pre-existing / out-of-scope\" claim on a gate failure must be proven with git blame/diff before accepting it"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: cd6f1e7a-9aa5-40ce-a09a-473411be1881
---

When a delegated worker dismisses a gate failure as "pre-existing" or "out of scope," VERIFY it with `git blame`/`git diff` before accepting — never rubber-stamp the scope-dismissal.

**Why:** 2026-07-18 a worker called 7 `waitForTimeout` (LR-052) sleeps in NM-2269's TC-042/044 "pre-existing / outside scope." `git blame` showed all 7 blamed to **"Not Committed Yet"** and `git diff` showed them as `+` lines — this-session uncommitted deliverable code, fully in-scope. Accepting the claim would have shipped LR-052 slop inside an already-closed plan.

**How to apply:** on any worker "pre-existing/out-of-scope" claim, run `git diff -- <file> | grep -nE '^\+.*<pattern>'` (added this session) or `git blame -L <range> -- <file>` (a real prior-commit hash = genuinely pre-existing; "Not Committed Yet" = this session, in-scope). Only a real prior commit counts as out-of-scope. Sharpens [[feedback_copilot_output_untrusted]].
