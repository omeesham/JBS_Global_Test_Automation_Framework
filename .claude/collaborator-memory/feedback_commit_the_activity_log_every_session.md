---
name: feedback-commit-the-activity-log-every-session
description: "Let the activity log go uncommitted for days and every row lands as \"new\" in one commit, so the timestamp gate checks old honest rows against today's file times"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ea127a18-8e6e-4a6d-8fdb-d4c6d11049d9
  modified: 2026-07-29T12:12:06.687Z
---

Commit `agent-activity-log.md` at the end of every session. Not weekly, not "when convenient".

**Why:** the LR-037 gate runs in `--staged` mode, which checks the rows ADDED in the staged diff.
That mode is correct precisely because a row is normally committed alongside the files it names. Let
the log sit uncommitted for 8 days and 475 rows land as "new" in a single commit — so every row from
last week gets compared against today's file times, and any file a later session legitimately
re-touched turns a truthful row into a violation. It read like a gate design flaw; it was a backlog.

**How to apply:** if the log is already backlogged, the fix is a point-in-time lookup
(`git log -1 --until=<row-timestamp>`) so a row is judged against the file's state when the claim was
made, not its latest state. That is the real fix and it cleared most of the rows. What it cannot
clear: rows naming files with no committed state at all at the claimed time — git holds no evidence
either way there, and mtime only ever reports the last edit. Do not tune a threshold to silence
those; missing evidence must not convict, and it must not acquit either.

Related: [[feedback-invented-thresholds-are-the-next-defect]], [[feedback-owner-activity-log]]
