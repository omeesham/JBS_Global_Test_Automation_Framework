# Cross-vendor audit of the Discount Optimization delivery — synthesis

**Date**: 2026-08-12 · **Ticket**: NM-3342 · **Branch**: `NM-3342`
**Auditors**: five independent GPT-5.5 seats, read-only, no shared context between them
**Work audited**: authored by Claude. No seat reviewed its own work; no vendor graded its own homework.

Raw reports: `.claude/state/ua-worker/chips/discount-optimization/gpt-fleet/out/`

---

## Why this audit was run

The delivery looked finished. Thirty-six cases, full suite green twice, every quality gate measured.
The fleet was commissioned to answer one question the green did not: **do these tests actually test what
the client is told they test?**

The answer was no, in four places. That is the headline result.

## Raw verdicts

| Seat | Scope | Verdict |
|---|---|---|
| G1 | Plan contract — promised vs delivered | 3 blocker, 6 major, 2 minor |
| G2 | Case integrity — does the spec do what the case says? | 2 blocker, 9 major, 3 minor |
| G3 | Code quality — will it survive another machine? | 0 blocker, 8 major, 2 minor |
| G4 | Deliverable parity — four-way ID consistency | 4 blocker, 4 major, 1 minor |
| G5 | Evidence audit — are our own claims true? | 3 blocker |

**Every finding below was independently re-verified against disk before being accepted.** Several were
downgraded on inspection; one was upgraded. A seat's severity was never taken at face value.

## What was real, and fixed

### Cases that asserted the opposite of their documentation

- **`TC-DOP-OPT-004`** — the case said office 1604 is *absent* from its own locations list; the spec
  asserted it is *present*. Observation settled it: the office **is** listed. The markdown was wrong,
  including a row-count rationale ("2155 vs 2154") that reality does not support. Case rewritten; no
  product defect.
- **`TC-DOP-OPT-051`** — titled as the NM-3063 regression guard. The spec opened Add, cancelled
  everything, and asserted Save was *disabled* — the opposite of the documented expectation, and it
  never added a location. Investigation across offices 1604, 1605 and 1101 found the location picker
  returns "No results." on all three, so the add path cannot be driven here. The case is now honestly
  **Not Automated** with that blocker recorded, and the cancel-path test it was really running was given
  its own identifier, `TC-DOP-OPT-091`.

### Cases that could not fail for the reason they claimed

- **`TC-DOP-OPT-090`** asserted `errorSurfaced || saveStillEnabled || changeStillPresent`. The last
  disjunct is true merely because the toggle was changed and nothing reverted it, so a silently
  swallowed save failure would still pass. Tightened to require real evidence of failure — and it still
  passes, which means the application genuinely does surface a rejected save. That is now proven rather
  than assumed.
- **`TC-DOP-OPT-012` / `013`** — titled for sorting, asserted only that a menu opened. Broken sorting
  would have passed. Now assert real row reordering.
- **`TC-DOP-OPT-070`** — titled for Active/Inactive filtering, only searched a text fragment. It was
  also the sole coverage claimed for defect NM-3210, which is consequently recorded `NOT-COVERED`.
- **`TC-DOP-OPT-005`** — accepted any decrease in row count and any non-zero restore. A wrong filter
  result or a partial restore would have passed.

### Reliability defects

Ten tests mutate the same grid row (`The Abbey Resort`); several had no `finally` restore, so one
mid-test failure would poison every later test touching it. `TC-DOP-OPT-052` and `053` both selected
"the first non-reserved rows" and could silently collide. `TC-DOP-OPT-050` restored a hardcoded date
rather than the value it had captured. All corrected.

### Client-facing document quality

Forty implementation references — `aria-label`, `aria-checked`, `role="checkbox"`, `data-testid`,
`.spec.ts` — sat in documents written for a non-technical reader. The exporter's vocabulary lint catches
prose like "in the DOM" but has no rule for attribute names, so they passed the gate that exists to stop
exactly this. Now zero. The case files also claimed all 2154 rows render at once, which is false — the
grid keeps roughly 37 loaded and recycles them — and a tester chasing that would hunt a phantom bug.

### Our own claims

G5 audited the delivery's account of itself and found three statements disk contradicts, all in the
plan's Execution Summary: "every case is Automated" (one is not, as the header three lines above already
said), an isolated-run tally of "5 of 5" against three artifacts, and an interaction-map PASS with no
retained artifact to re-check. All three corrected, and the verification table rewritten to show the
real arc — 37 passed, then 35 with 3 failures once assertions were strengthened, then 38 after the
oracles were fixed. The dip is the most informative row in that table.

## What was reported but did not survive verification

- **G4 called `TC-DOP-OPT-041` a blocker** on the grounds that the markdown contradicted the spec. Only
  the *title* did; the steps and expected result matched the spec exactly. Downgraded to a misleading
  title and fixed as such.
- **G4 required restoring two sheets to the master workbook.** Measurement showed the opposite: with
  them absent the freshness gate passes, and re-adding them would put a 34-sheet workbook against a
  32-sheet rebuild and block every commit. Their content is intact in their own tracked split workbooks.
- **G4 undercounted the jargon** at 31; the real figure was 40. Upgraded, not dismissed.

## What is still not verified, stated plainly

- **NM-3210** (Active/Inactive filter) — `NOT-COVERED`. The case named for it never drove the control.
- **NM-3063** (Save after adding a location) — `UNVERIFIABLE`. No office in this environment offers a
  selectable location to add. Explicitly *not* marked confirmed-fixed.
- **NM-1672** — metadata and attachment inventory captured; the requirement text inside two Word
  attachments was never extracted.
- **Multi-worker execution** — not certified. One search test failed at `--workers=4`; the repository
  defaults to one worker and documents an unresolved conflict on shared application state.
- **Terms and Conditions / Service Charge Text** — 170 cases whose markdown is absent from this working
  copy. Proven pre-existing, untouched by this work, and the reason the specs and workbook cannot be
  committed. Not this ticket's to fix.

## The lesson worth keeping

Four cases were passing while testing materially less than their titles claimed, and two asserted the
opposite of the documented behaviour. Every prior verification pass had confirmed the tests *ran and
passed* — which was true, and which was not the same question.

When the assertions were strengthened, the suite went green → red → green. The red was the point. A
suite that only ever goes green is not evidence of correctness; it may only be evidence that nothing is
being asked of it.
