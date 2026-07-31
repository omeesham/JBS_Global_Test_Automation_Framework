---
name: project-unaccounted-repo-writer
description: RESOLVED 2026-07-30 — the two unattributed edits to scripts/walk-coverage/critic-prompt.md were written by a PARALLEL Claude Code session running a repo-wide slop wave; it committed them itself in c2b0e339
metadata: 
  node_type: memory
  type: project
  originSessionId: 0a493e2b-a8df-4b02-8548-f6d52e6fbf95
  modified: 2026-07-30T18:08:10.272Z
---

**RESOLVED.** `scripts/walk-coverage/critic-prompt.md` was edited twice on 2026-07-30 by an actor two
blind investigations could not name. The writer was a **parallel Claude Code session in the same repo**,
running a "q123 read/decide/apply" slop wave. It committed the file itself at 22:55 in `c2b0e339`,
and its own commit message names the edit:

> *"scripts + docs — … an unsatisfiable sampling quota restated as a floor …"*

That is exactly the Step 3 DOM spot-check sampling paragraph both edits improved. The file is clean in
git now; no action was ever needed.

**Why two blind seats missed it.** Both investigated *mechanical* writers — generators, hooks, the
dispatch wrapper, formatters, CRLF normalisation — and correctly ruled every one out. Neither
considered **another agent session sharing the working tree**, because nothing in the repo makes
concurrent sessions visible. The ruled-out list was sound; the hypothesis space was too small.

**How to apply:**
- **Add "a concurrent session in the same working tree" to the candidate list before spending a
  council on file provenance.** It is cheap to check (`git log --stat` on the file, plus recent commits
  on sibling branches) and it explains the whole shape: deliberate, improving, unclaimed.
- **A file being clean in `git status` does not mean it was never touched** — it may have been
  committed by someone else since you looked.
- **Read the commit message, not just the diff.** This one confessed in prose; the diff alone would
  have stayed ambiguous.
- **Concurrent sessions are the normal state of this repo, not the exception.** On this night four
  sessions held the same tree, HEAD had been moved to a checkpoint branch by one of them, and ~125
  files were dirty. Assume company. Stage paths explicitly, never `git add -A`, and never switch
  branches or run `git checkout`/`stash`/`restore` on a shared tree.

Related: [[feedback_worker_report_claims_need_own_grep]],
[[feedback_verify_provenance_before_scope_dismissal]], [[feedback_dont_destroy_user_data]],
[[feedback_worker_ticket_mechanics]].
