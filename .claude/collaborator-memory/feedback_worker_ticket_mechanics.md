---
name: feedback-worker-ticket-mechanics
description: "Three ticket mechanics that cost hours when omitted — absolute paths, blocking runs, tee'd raw output"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e1001be8-214b-4595-8e09-2ddfcb84e658
  modified: 2026-07-30T16:47:58.813Z
---

Three dispatch mechanics. Each was omitted once on 2026-07-22 and each cost a full round.

**1. Absolute paths for every doctrine file — always.**
Relative refs like `` `RCA-LAW.md` (this directory) `` are unresolvable to a worker, and **glob tools skip
dot-directories**, so `.claude/state/...` is invisible to any search. Workers reported
`NOT FOUND ON DISK` for four law files and proceeded without them. Say explicitly: *"read by absolute path,
do NOT glob."*

**2. Long runs must be ONE blocking foreground command.**
A worker that starts a suite run, says "waiting for the run to complete", and ends its turn gets killed —
the harness treats end-of-turn as success. Two shards died this way with `exit 0 / ok=true / success` in the
ledger and **zero bytes written**. Spell it out in the ticket.

**3. `tee` the raw output to an absolute path BEFORE any analysis.**
A Playwright run is one atomic call, so "write your report incrementally" is impossible *during* it. The raw
file is what survives a dead worker — and it did: `fs-D-raw.txt` (59KB) let the next round start from
evidence instead of nothing.

**4. `set -o pipefail` on the DISPATCH command, or `tee` eats the exit code.**
`bash copilot-worker.sh ... | tee log.txt` reports **tee's** exit status, so every wrapper rejection —
invalid `--work-type`, invalid `--effort` tier, missing ticket file — arrives as `exit 0` and the
job-completion notification says success. On 2026-07-30 this cost two dispatches and produced a false bug
report against the wrapper: the wrapper's `exit 2` was correct all along, mechanic #3 was hiding it.
Dispatch as `set -o pipefail && bash ... | tee <log>; echo "DISPATCH_EXIT=${PIPESTATUS[0]}"` and read that
line before believing any completion.

**5. A completion notification does not mean the filesystem settled — re-run before calling a defect.**
On 2026-07-30 a worker's edit was visible in `git diff` while a command run in the same breath still
executed the pre-edit file, printing a stale table. The near-conclusion was "the proof doesn't read the
array it claims to read" — a serious false defect. A clean re-run one step later showed the correct
output. **Any surprising result immediately after a worker completes gets re-run once before it becomes
a finding.**

**6. `ls` every path and re-verify every state claim BEFORE it goes in a ticket. This is the CEO's most
expensive recurring error.**
On 2026-07-30 the same mistake burned a whole evening in three forms:
- A walk ticket asserted *"the session is already on 1137"*. It was on 1169, with the grid holding 4107's
  data. Every number that run produced was void, and the next run inherited the wreckage. **Four more runs
  died downstream of that one unverified sentence.**
- A build ticket named `scripts/walk-coverage/kernel-oracle-fixtures.json`. The real path is
  `scripts/walk-coverage/fixtures/kernel-oracle-fixtures.json`. The worker quietly found it; the next one
  might not.
- A walk ticket *referenced* a working dialog sequence in another run's report instead of embedding it. The
  worker improvised, hit anchor rows that hard-navigated the page, and destroyed the session.

**A ticket's factual claims are load-bearing — the worker cannot check them and will build on them.** Before
dispatch: `ls` every path, re-read live state rather than remembering it, and embed exact sequences instead
of citing where they live ([[feedback_embed_not_reference]]).

**7. Parallel tickets collide on files they RUN, not just files they EDIT.**
Four tickets were dispatched as "four different files, no collision" — but one *edited* the checker while
another *ran* it for its own verification. That run's self-test results are unreliable and need a clean
re-verify. **Check what each ticket executes, not only what it writes.**

**Why:** the harness kill and the glob blindness are both invisible from the CEO side — the ledger says
success either way. Only the artifact on disk distinguishes them. Mechanic #4 is the same failure one layer
up — the shell itself lying about whether the dispatch even started. Mechanic #5 is the mirror image: the
disk telling the truth a moment too late. Mechanics #6 and #7 are the CEO's own: a ticket that asserts an
unverified fact, or a fan-out that ignores read-collisions, poisons work the worker did correctly.

**How to apply:** put all three in the ticket body, and verify the JOB on disk (report file exists, mtime is
after the run started), never the exit code.

Related: [[feedback_ticket_literal_paths]], [[feedback_worker_report_claims_need_own_grep]]


## Worker Pointer Files for Ticket DOCTRINE
Full annotated list (feedback_*.md unless noted):
skip_discipline, always_run_individual_first, bug_pattern_learning, history_content_anchored_lookup, no_silent_partial_coverage (LR-068), read_artifacts_before_rerun, clean_before_rca (LR-024), spec_fixing_no_overplan, angular_save_dirty_race, clean_full_run_integrity, browser_interaction_verify_first, testid_golden_rule (ENCODED §5/§10+LR-014), reference_playwright_cli_auth_refresh (clients/encore/.auth/encore-state.json), no_hardcoded_env_in_selectors, verify_on_preview, debug_methodology, windows_cli_args, preview_reuse_check, chat_not_blocked
