---
name: canary-must-be-disjoint-from-permitted-set
description: "A blind-run canary string must not exist in any file the ticket permits, or it fires on the permitted read and proves nothing"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0a493e2b-a8df-4b02-8548-f6d52e6fbf95
  modified: 2026-07-30T05:41:05.916Z
---

When running a **blind** worker (an agent that must rediscover findings by driving the app, not by
reading the repo's answer key), the canary — the string whose presence in the output proves a leak —
**must be disjoint from the set of files the ticket permits the worker to read.**

Live failure, 2026-07-30, run `close2-blind-drone2`: the ticket declared the canary as any
`NM-\d+` / `NAV-\d+` ID, asserting *"those strings do not appear in the application UI — they exist
only in files you are forbidden to read."* That assertion was false. `clients/encore/CLAUDE.md` was
listed in the ticket's own DOCTRINE section as a **permitted** read, and it contains `NM-1264` and
`NM-1881` in the LR-008 line. The sweep reported 508 canary occurrences in the run log and the run
looked voided. It was not — the worker was clean.

**Why:** the ticket both permitted a file and declared its contents a leak signal. Prompt context is
re-sent every turn, so 5 occurrences in one permitted file became 508 in the process log.

**How to apply:**
- Before writing a canary into a ticket, grep every permitted file for the canary pattern. A non-zero
  count means the canary is invalid — pick a different one or drop the file from the permitted set.
- Prefer a canary of **specific answer-key identifiers** (the exact bug IDs the blind run is meant to
  rediscover) over a broad pattern. Specific IDs are verifiable as disjoint; a regex family is not.
- A canary hit is a **prompt to investigate**, never an automatic void. Confirm the string's route
  into the log — grep the surrounding context and check the permitted files first — before calling a
  run dirty. Voiding a clean run costs the whole dispatch.
- Pair the canary with the structural check that does not share this weakness: extract the actual path
  arguments the worker passed to read tools and test those against the forbidden list. Raw text grep
  over the log false-positives on the prohibition list, which the ticket itself echoes into the prompt.

Related: [[feedback_gate_trip_probes_need_valid_payloads]] — same family of error, a check whose
trip condition does not actually discriminate. [[feedback_never_conclude_from_redacted_or_name_only_match]].
