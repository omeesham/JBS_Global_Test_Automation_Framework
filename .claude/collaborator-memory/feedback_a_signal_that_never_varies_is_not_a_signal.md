---
name: a-signal-that-never-varies-is-not-a-signal
description: "Before trusting a gate that keys on a flag, check the flag DISCRIMINATES. ask_open was true on 20/20 ledger rows — the ASK acceptance gate had been inert the whole time."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0a493e2b-a8df-4b02-8548-f6d52e6fbf95
  modified: 2026-07-31T06:52:46.845Z
---

**Incident (2026-07-31).** The delegation acceptance rule says a worker report with a non-empty
`## ASK` cannot be accepted until every item is dispositioned, and the ledger carries `ask_open` as
the machine surface for it. A returning worker's row said `ask_open: true`, so I went to disposition
the asks — and its `## ASK` section was empty. Checking the last 20 ledger rows, **including other
sessions' runs**: `ask_open` was `true` on 20 of 20. The field never varies, so it carries zero
information, and the ASK gate it feeds has been inert for as long as that's been true.

**Why this matters more than one bad field:** the gate *looked* enforced. It has a rule, a named
machine surface, and a documented disposition. Everything the framework normally treats as proof of
enforcement was present. The only thing missing was that the signal was constant — which no amount
of reading the rule, or the hook, or the ledger schema would reveal.

**How to apply:**
- **Check discrimination before trusting any flag-driven gate.** One cheap command: read the last
  N rows and count how many carry each value. All-true or all-false = broken detector, and say so;
  do not treat the constant value as the finding it purports to be.
- **Sample across sessions, not just your own.** My own rows alone could have been explained by my
  own tickets. Twenty rows spanning several sessions is what made it unambiguous.
- **A constant-true flag fails OPEN in the worst way**: it makes every run look like it has an open
  question, so the gate either blocks everything (and gets ignored) or, as here, gets waved through
  by habit until it means nothing. Both outcomes end with an unenforced rule that reads as enforced.
- Generalises past this field: any boolean in a ledger, any `verdict` that is always the same value,
  any check whose PASS arm nothing has ever exercised. Ask what the *other* value looks like and when
  it last appeared. If you cannot find one, the check is not a check.

Related: [[gate-trip-probes-need-valid-payloads]] (absence-of-deny proves nothing),
[[a-green-check-can-be-an-artifact-of-invisibility]], [[gate-fix-floor-design]],
[[scope-the-fix-to-the-measured-distribution]].
