---
name: feedback-report-state-not-activity
description: "Status means what exists on disk, not what workers are doing — \"dispatched\" is never \"done\""
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ea127a18-8e6e-4a6d-8fdb-d4c6d11049d9
  modified: 2026-07-29T10:05:16.791Z
---

Every status line to Rutvik reports **state**, not **activity**. "Worker dispatched", "review running", "in flight" describe motion. He needs the count: what exists, what does not.

2026-07-29: I reported dispatch activity for hours across a five-piece task while only one piece existed. He read it as finished — *"i thought u pushed and we are done!"*. Twice more the same day a dispatch returned exit code 0 while doing nothing (once an invalid `--work-type`, once a stale working directory from an earlier `cd`), and both times I announced the dispatch before checking the disk.

**Why:** exit 0 from a wrapper means the wrapper ran, not that the work happened. A status built from tool activity is a status that cannot detect its own failure — and he plans his day around it.

**How to apply:**
- Never report a dispatch as an outcome. Report the disk after it lands: file exists / does not, grep count, exit code of the real check.
- Multi-piece task → always give N-of-M explicitly. "3 of 5 done, 2 blocked on X" beats any description of what is happening.
- After every background dispatch, run the acceptance greps yourself before saying anything — see [[feedback-worker-report-claims-need-own-grep]].
- `cd` inside a Bash call persists to later calls. A dispatch writing to a relative path after an earlier `cd` silently targets the wrong tree. Use absolute paths in dispatch commands.
- Bad news goes in line 1, always. Compaction may drop detail; it never drops the failure.

Related: [[feedback-never-reinstate-rejected-design]], [[feedback-chat-simple-compaction]], [[feedback-claim-vs-artifact-crosscheck]].
