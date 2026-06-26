---
name: Plan-Deviation Logging During /execute
description: During any /execute run, maintain a running "deviations from plan" log; emit consolidated summary before /final-q so user can audit each what+why decision.
type: feedback
originSessionId: 849dfb50-6af8-469d-9172-2f9f4035fcdf
---
When executing a plan, every action I take that is **not literally in the plan** must be captured with a one-line **what + why** so Rutvik can audit the call after the fact (right or wrong decision).

**Why:** Rutvik wants traceability for every autonomous decision an agent makes mid-execution — additions, scope shrinks, substitutions, skips, or defensive choices. Without a deviations log, the post-execution audit can only see "was the plan followed" — not "where did the agent deviate and was that right?". Stated 2026-05-01 during PLAN_CLIENT_DELIVERABLE_REBUILD execution: "whatever u do thats not in plan, i want a summary of what and why, at the end without fail, add to todo... so i can audit what u deviated was right or wrong decision."

**How to apply:**
- At `/execute` Phase 0.5 todo build, ALWAYS add: `[ceremony] Deviations log — track every plan-deviation during execution + emit consolidated summary before /final-q`
- During Phase 2 execution, every time the agent does something not literally in the plan (added step, scope shrink, substitution, skip, defensive code beyond plan, fix to plan-bug discovered live), append to a running scratch log (chat-resident OR a per-plan file at `clients/${ACTIVE_CLIENT}/specs_planning/_internal/<PLAN-ID>-deviations.md`).
- At Phase 3 audit, emit the consolidated deviations table BEFORE /final-q so Rutvik sees it inline.
- Format: `| # | Plan ref | What I did differently | Why |` — each row one deviation, max 1-2 line per cell.
- Counts ALL of these as deviations: (a) added a step/file not in plan, (b) shrunk a step's scope (e.g., 7 files → 3 because pre-state changed), (c) substituted a different approach for a plan step, (d) skipped a step entirely, (e) fixed a real plan bug (syntax error, stale claim) inline, (f) wrote defensive code beyond plan spec.
- Does NOT count as deviation: (a) following plan verbatim, (b) running ceremonies (Phase 0/0.1/0.5/2.5/3.5/activity-log/final-q) — those are universal.
- Distinct from `/reflect` (captures learnings) and `/final-q` (todo ledger reconstruction) — this is decision-trace specifically.
