---
name: feedback-dispatch-must-record-provenance
description: "Always pass --session-id and --parent-run-id when dispatching — without them cross-vendor independence is asserted, never proven"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8e8a38b6-2071-4cbd-a694-d72b98d4f1c9
  modified: 2026-07-25T13:33:52.299Z
---

**Every `copilot-worker.sh` dispatch must carry `--session-id`, and every `review`/`verify` dispatch
must also carry `--parent-run-id` naming the run it reviews.** Both flags already exist. Omitting them
costs nothing at dispatch time and destroys the audit trail permanently.

**Measured 2026-07-25 by `scripts/check-agent-provenance.mjs --all` across 1,239 real run dirs:**
- `session_id` present on **143** (11.5%)
- `parent_run_id` present on **61** (4.9%)
- **100% of review pairs resolved `ASSUMED` / `author_run_id: UNRESOLVED`**

So no review in the entire history can be mechanically linked to the work it reviewed. Every
"two seats, cross-provider, no provider grades its own homework" claim rests on the dispatcher's
word. The reviews may well have been genuinely cross-vendor — mine that day were, because I picked
the models — but **nothing on disk proves it**, and "I chose correctly" is exactly the assurance the
whole delegation-integrity effort exists to replace.

Second-order damage: PT4 (teaming detection — "is every seat in this session the same vendor?")
groups by session. With `session_id` null it cannot group, so it reports *"No single-vendor sessions
detected"* — **a vacuous pass that reads identically to a clean result.**

**Root cause was the dispatcher, not the wrapper.** ~15 dispatches in one session, including two
cross-vendor review seats and three defense rounds, passed `--dispatcher CEO` and neither provenance
flag. The wrapper accepted them silently.

**How to apply:**
```
--session-id "$CLAUDE_SESSION_ID"        # every dispatch, always
--parent-run-id <run-id-being-reviewed>  # every review / verify / bounce / defense round
```
Grab the parent run-id from the prior dispatch's `result.md` path — it is the directory name under
`.claude/state/ua-worker/`. Related: [[feedback-two-chiefs-always-default]] (the independence claim
this makes provable), [[feedback-copilot-output-untrusted]],
[[feedback-worker-credit-budget-is-the-real-killer]].
