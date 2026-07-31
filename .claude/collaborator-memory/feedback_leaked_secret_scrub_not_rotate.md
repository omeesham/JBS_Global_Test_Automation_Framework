---
name: feedback_leaked_secret_scrub_not_rotate
description: "For low-stakes/training leaked credentials, Rutvik wants a HEAD-only scrub + placeholder, NOT rotation and NOT a history rewrite/force-push"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 92727b65-1382-486e-bdfd-5504c81a7ca5
---

**Preference (2026-07-19)**: When the audit finds a committed credential that is low-stakes (training/test instance, private repo), Rutvik's default is: **scrub it at HEAD** (blank the value → env-var placeholder, commit isolated) and move on. Explicitly NO rotation, and NO git-history rewrite / force-push unless he says so.

**Why**: rotation + force-push over a shared/deep history is high-collateral for a throwaway key; he'd rather "make it like it never happened" cheaply than treat it as a security incident. He called it "not the leak of the century."

**How to apply**:
- Surface the finding with the real footprint (tracked? pushed? how deep? public vs private? real vs training?) — masked, never echo the value.
- Offer HEAD-only (recommend) vs full-history-rewrite+force-push, with blast radius stated. Default to HEAD-only.
- Do the scrub via in-place sed/edit without printing the secret; verify the token prefix count is 0; commit only that file.
- History-rewrite/force-push is a safety gate — still needs his explicit "B"/GO (see [[feedback_no_asks_fable_decides.md]] boundary). One-time example: Atlassian key in `website/frontend/src/data/jiraconfig.txt`, scrubbed HEAD-only, commit 2a37d1bf.
- Handling secret *values* in plaintext stays prohibited — scrubbing (removing) is fine; reproducing the value is not.
