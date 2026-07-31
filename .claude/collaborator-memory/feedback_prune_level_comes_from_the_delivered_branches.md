---
name: feedback_prune_level_comes_from_the_delivered_branches
description: "Before designing what a client deliverable strips, read the already-delivered branches — they define the approved shape. Prune test cases only; ship source, barrels, fixtures and config even for undelivered modules"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 97fc2a8f-d682-49e5-ad02-431273e486b4
  modified: 2026-07-30T19:40:32.512Z
---

The Encore deliverable's approved prune level is **test cases only** — spec files under `tests/` and
the matching sheets in `testcases/*.xlsx`. Everything else ships, **including page objects, test data,
selectors, the selectors barrel, `pages.fixture.ts` and `playwright.config.ts` for modules the client
was never delivered.**

Measured from the owner-approved reference branches on `encore-mock`, 2026-07-31:

| | `locations` | `corporate-pricing` |
|---|---|---|
| specs under `tests/` | only its 6 delivered | only its 9 delivered |
| workbook sheets | only its 6 delivered + Overview | only its 9 delivered + Overview |
| withheld modules' `src/` files | **21 present** | **13 present** |
| withheld imports in `src/selectors/index.ts` | **12 present, untouched** | present |
| `encore-local-office` project in `playwright.config.ts` | **present, untouched** | present |
| `encore-qa-tracker.xlsx` | **shipped** (44 rows) | shipped |
| `tests/_unit/` | absent | absent |
| `.env.local` | absent (only `.env.e2e`) | absent |

Rutvik: *"anything more than this … is over pruning = chances of breaking cases that are delivered …
anything it ships which is for the undelivered items, is fine to ship, no one cares."* `.env.local`
ships deliberately, blank — the copy on `main` has zero populated values and is fine.

**Why:** on 2026-07-30/31 I designed a prune that deleted 21 withheld source files, then pruned the
selectors barrel and fixture to fix the imports that deletion broke, then needed a symbol-level pass to
fix the orphaned spreads that pruning left, then a config pass for the project pointing at the deleted
directory. Four tickets, ~2h of worker time, and the payload would have **crashed on load** for the
client — every delivered locations spec, not just withheld ones. None of it was needed. The already-
delivered branches had the answer the whole time and I never looked at them before designing.

**How to apply:**
- **The approved shape is an artifact, not a judgement.** Before designing any deliverable filter, read
  what was already delivered and diff it against the full tree. That diff *is* the spec.
- **Prune at one level, at the leaf.** A prune that requires a second prune to repair what it broke is
  the signal you cut too deep — stop and re-derive the level, don't add another pass.
- **Over-pruning is a defect with the same weight as leaking.** Removing what the client needs breaks
  their suite; both directions get checked. Related: [[feedback_check_who_owns_the_identifier]] — the
  same failure shape, one layer up.
- Never delete a file the approved shape ships (`encore-qa-tracker.xlsx` was a live over-prune caught
  only by this comparison). Credentials are the one exception that always goes.
