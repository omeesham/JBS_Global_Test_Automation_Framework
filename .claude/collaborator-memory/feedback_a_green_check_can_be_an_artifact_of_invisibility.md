---
name: feedback_a_green_check_can_be_an_artifact_of_invisibility
description: "A check that scans tracked files passes vacuously against evidence git cannot see — verify guardrails AFTER staging the artifact that would trip them, and expect a guardrail's own fixtures to trip it"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 97fc2a8f-d682-49e5-ad02-431273e486b4
  modified: 2026-07-31T06:16:39.363Z
---

Most repo guardrails enumerate **tracked** files (`git ls-files`). So a check run against a new,
unstaged artifact reports green — not because the artifact is clean, but because the check never saw it.

**Two shapes of this, both hit in one night (2026-07-31):**

1. **A guardrail's own fixtures trip the guardrail.** `verify-no-stale-live-refs.mjs` was fixed, and its
   new test file contained stale paths *as test data*. The worker ran the gate, got exit 0, and reported
   "gate passes" — true only because its test file was still untracked. `git add` it and the gate found
   six hits in it. Fix: build such strings at runtime from fragments so no literal appears in the source.
   Excluding the fixture from the scan also works but is a hole; prefer removing the problem to agreeing
   not to look at it.

2. **A `.gitignore` addition silently broke a payload builder.** `scripts/ship-branch.sh` writes a blank
   `.env.local` into the payload, then runs `git add -A` in a scratch repo that inherits the *shipped*
   `.gitignore`. Adding an explicit `.env.local` line made `add -A` skip it — the file never reached the
   commit the builder archives and verifies. `add -A` had been quietly depending on the file being
   tracked. Fix: `git add -f` the file; never relax the gate that caught it.

**Why:** in both cases the green result was produced by absence of evidence, and in both cases the real
answer was one `git add` away. A worker reported a false PASS on this in its own acceptance section.

**How to apply:**
- Any acceptance check on a file-scanning guardrail must be run **after** staging the artifact under
  test, and the ticket must say so. "Run it, then `git add`, then run it again" is the shape.
- When adding a line to any `.gitignore`, grep for `add -A` / `add .` in build and packaging scripts —
  an ignore rule reaches every scratch repo that inherits that file.
- Related: [[feedback_gitignore_listed_not_untracked]] (the inverse trap — ignore-listed files can still
  be tracked), [[feedback_worker_report_claims_need_own_grep]] (this false PASS was caught only by
  re-running it), [[feedback_gate_fix_floor_design]].
