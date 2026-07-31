---
name: scope-the-fix-to-the-measured-distribution
description: "Design a prevention control against the COMPLETED measurement, not the first-noticed instance — and match the instrument to the failure's time-shape. Built a fence for 0.1% of the problem and called it the deliverable."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0a493e2b-a8df-4b02-8548-f6d52e6fbf95
  modified: 2026-07-30T18:59:58.380Z
---

**Incident (2026-07-31, `PLAN_CLIENT_SURFACE_PURGE_AND_WRITE_FENCE`).** Rutvik saw `clients/encore/`
was bloated. A partial `du` surfaced `.auth` (63 MB), `.playwright-cli` (40 MB) and a doubled
`clients/` path. I wrote the whole plan around those — a PreToolUse path-allowlist fence, labelled
"the actual deliverable." The full sweep finished afterwards: the folder is **2.2 GB**, and
`specs_planning` (1.1 GB) + `reports` (927 MB) are **92%** of it. My three headline causes were
**4.7%**. The fence I designed would have stopped **0.1%** of what was measured.

Worse: all four big directories are gitignored, so `git archive` already excluded them and none of
that 2.0 GB could ever have reached the client. I had framed it as a *delivery-quality* problem. It
was a *retention* problem the whole time.

**Why:** I had already commissioned the machine measurement — and then designed the control before
reading it, on the sample I happened to have seen first. The machine-denominator law says the
denominator must be machine-enumerated; it does not help if the fix is scoped while the enumeration
is still running. Availability, not evidence, set the scope.

**How to apply:**
- **Do not design a prevention control until the measurement is complete.** If a plan must be filed
  first, say in the plan which numbers are partial and treat every design decision resting on them as
  provisional. (My plan did carry a "Not yet measured" note — and I still built Phase 4 on the
  measured 5%. The note is not the safeguard; waiting is.)
- **Report the control's coverage as a fraction of the measured failure.** "Arm A stops 0.1% of what
  we measured" is a sentence that makes the gap impossible to miss. If you cannot state that
  fraction, you do not yet know whether the fix is the fix.
- **Match the instrument to the failure's time-shape.** A per-write gate can only see what is wrong
  *in a single write*. Accumulation is slow and every individual item is innocuous — a UUID-named
  `result.json` in an `allure-results/` dir is a legitimate file in a legitimate place. No per-call
  signal exists, and walking a 1 GB tree to find one blows the 200 ms PreToolUse budget. Slow
  failures need a **periodic look** (Stop-hook governor that measures once per session and reports),
  not a faster gate. The failure was never "a bad write happened" — it was that **nothing ever
  looked**.
- **Shape-denial covers only shapes you have already imagined.** Say that out loud in the plan
  instead of implying generality; the general net is the periodic measurement, precisely because it
  needs no foreknowledge.
- **Try the prior fix honestly before convicting it.** The two `.gitignore` rules did their job —
  keeping this content out of the deliverable. They were never retention controls. Blaming them
  would have hidden the fact that the missing control is one nobody ever built.

Related: [[denominator-and-numerator-both-machine]], [[gate-fix-floor-design]],
[[invented-thresholds-are-the-next-defect]], [[recurrence-convicts-prior-fix]].
