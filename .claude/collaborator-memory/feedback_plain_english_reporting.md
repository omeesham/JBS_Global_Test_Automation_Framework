---
name: plain-english reporting across all 4 reporting skills
description: Kill-list additions + jargon translation table + format rules for /next-this-week, /standup, /end-day, /end-week. Graduated from Thu 2026-04-23 /next-this-week iteration.
type: feedback
originSessionId: c993b0e5-23d5-41fe-9516-75b8d3cc9386
---
All four reporting skills (`/next-this-week`, `/standup`, `/end-day`, `/end-week`) must pass the 5-year-old-reader test: a non-technical reader with zero product knowledge must be able to picture what a user does or sees.

**Why:** Rutvik's colleagues and clients are non-technical. Internal jargon (DQU-03, slate clear, tag rollout, H1 sweep, neutral-eye audit, ripple sync, re-export, handoff package) reads as nonsense to them. Previous outputs got rejected with "too technical, no one would understand, simplify" and "useless, no one knows anything".

**How to apply (all 4 skills, before printing):**

1. **Strip every plan-ID code** — DQU-, SP-, LR-, HIST-, REPO-, AAE-, F1, H1/H2/H3. Keep the human action; drop the label.

2. **Apply the jargon translation table** baked into each skill's KILL LIST section. Representative rewrites:
   - audit → review
   - re-export → re-share the updated file
   - slate clear → make sure each test starts from a clean state
   - tag rollout → add proper tags across the tests
   - reqs sampling/verification → spot-check test cases against original requirements
   - QA benchmark → short note comparing our approach to standard QA practice
   - simplify/cleanup sweep → clean up and simplify the repo
   - handoff package → final bundle for the client

3. **Bullets, not prose.** No "Honestly —", no "Spent real time on…", no sentences that sound spoken. One bullet = one task.

4. **Day-wise = 1 line per task (granular). Week-wise = 1 line per GROUP of tasks.** Collapse N similar subplans into one grouped bullet (e.g. 8 per-module audits → "Review the rest of the modules one by one").

5. **Buffer: 5 bullets default per section**, up to 10 in ARMOR. Don't overcommit — creates "lagging behind" perception.

6. **Realistic day-math.** Count actual working days left. If only 2 days remain, don't plan 5 days of work.

7. **/next-this-week specifically emits TWO sections in one prompt:**
   ```
   Today focusing on these one by one:
   - <granular in-flight bullet>
   ...

   Pending tasks up next
   - <grouped future bullet>
   ...
   ```

8. **Preserve each skill's output shape** — /standup keeps DID/DOING/THEN/AND, /end-day keeps its reconciliation flow, /end-week keeps weekly composition. ONLY the vocabulary + jargon-stripping upgrades apply to them, not shape changes.

**Gold standard example (Thu 2026-04-23, /next-this-week SHIELD):**

```
Today focusing on these one by one:

- Fix the Local Office Settings test cases and re-share the updated file
- Fix the Local Information test cases and re-share the updated file
- Fresh-eyes review of the Local Information test cases
- Update our internal rules doc
- Add proper tags across the Local Office + Local Information tests

Pending tasks up next

- Finish fixing and re-sharing test cases for Local Office Settings and Local Information
- Start reviewing the next 1–2 modules (Pricing, Legal)
- Review the rest of the modules one by one
- Clean-start fix for tests
- Repo cleanup and simplification
- Final client handoff bundle
- History-page checks across location tabs
- Bug write-ups and final review
```

**Enforcement:** every skill's KILL LIST + translation table was updated 2026-04-23. Re-read them at invocation; don't regress to jargon.
