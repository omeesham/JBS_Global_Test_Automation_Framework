# PLAN — Service Charge input-race: one root cause hunt, delegated and evidence-forced

**Status**: PENDING
**Created**: 2026-08-14
**Owner**: OWNER (mama judges; Copilot seats do all legwork per /delegation-temp)
**Model**: gpt-5.5 xhigh (live/probe seats) + claude-opus-4.6 max (artifact seat) — no other tiers
**Thinking**: ultrathink on mama's synthesis steps only
**PermissionMode**: default (probes are read-only against the app; no source edits in Phases 0–2)
**BrowserTool**: cli (workers drive standalone Playwright scripts; headed)

---

## Goal (one sentence)

Prove the SINGLE mechanism behind every Service Charge Basic Information failure this week — a typed
percentage that sometimes never registers — deep enough to (a) hand Encore a defect package with a
measured rate, and (b) design a test-side posture that fails loudly on the defect instead of hiding it.

## Why this is ONE bug, not many (evidence already on disk)

| Symptom | Where | Artifact |
|---|---|---|
| Save stayed disabled 10s after an edit → click timeout | TC-SVC-BAS-004, full run 1 | `reports/run-basic-final-0814-r2/01-run.verify.txt` |
| Typed 34, saved, reloaded → read 24 (one of two edited fields reverted) | TC-SVC-BAS-023, full run 2 | `reports/run-basic-final-0814-r3/01-run.verify.txt` |
| Keyboard-typed valid value survived blur only 1 of 3 | live walk, positive control | `reports/rca-alpha-0814/seatB/RESULT.md` |
| Both failing tests pass 3/3 solo | determinism probe | `reports/bas004-determinism-0814/RESULT.md` |
| Invalid text: flagged while focused, flag/value unstable after blur | 11-case walk + owner replication | seatB RESULT + `ground-truth-service-charge-manual-2026-08-14.md` |

A different test fails each full run because the loss is probabilistic per keystroke-entry, not
attached to any one test. Fixing tests one at a time is whack-a-mole — that stops here.

## The one open question

**Which layer drops the edit?**
- **H-app**: the app re-renders the grid (late XHR / polling) and overwrites uncommitted input + dirty state → real users lose typed values → app defect.
- **H-synthetic**: the app is fine for humans; Angular's form model intermittently misses OUR synthetic input events → automation artifact → page-object redesign.

Neither may be assumed. Each hypothesis has a discriminating observation, and the phases below force
workers to capture observations, never conclusions (worker FACTS, mama DIAGNOSES — enforced wording
in every ticket, headline-vs-blindSpots gate applies on receipt).

## Phase 0 — inputs already running (consume, don't redo)

- `stick-rate-0814` probe (in flight): 10 identical typed edits, counts of value-stuck / Save-enabled /
  **value-correct-but-Save-disabled**. That third count is the H-synthetic smoking gun if non-zero.
- Rutvik accelerator (30 seconds, optional but decisive for H-app): by hand on office 1604, type
  `34.00` into Audio Conferencing, press Tab, repeat ~5×. If Save lights up 5/5 for human hands while
  automation loses 1/3, H-synthetic is proven; if his hands also lose edits, H-app is proven.

## Phase 1 — mechanism hunt (two blind seats, cross-provider)

**Ticket A — live instrumented timeline (gpt-5.5 xhigh, rca, headed, 350cr).** Standalone script, 10
iterations of type-34-Tab on one row. Per iteration capture a timestamped timeline: every network
request/response on the backend API (LR-056 endpoint filter), every DOM mutation on the input's row
(MutationObserver), input value + Save disabled state sampled at 0/250/500/1000/2000ms after Tab.
Deliverable: `timelines.json` + per-iteration verdict-free summary. Explicit ban: no cause language.
Key fact to force: when a value reverts, WHAT happened in the 250ms before (XHR completed? mutation
storm? nothing?).

**Ticket B — extraction-only trace read (claude-opus-4.6 max, rca, 300cr).** Unzip the traces of BOTH
full-run failures (BAS-004 r2, BAS-023 r3). Extract quoted, timestamped facts only: value shown after
each fill, Save disabled state at each step, network entries between fill and assert. Per the RCA
skill's extraction-seat contract: classification field must be `unclear`; any missing fact is listed,
never inferred.

Mama compares A×B×Phase-0: the mechanism must explain ALL five evidence rows or it is rejected.

## Phase 2 — blast radius across ALL specs (machine denominator, LR-062)

1. Mama enumerates by machine: `grep` all `clients/encore/tests/**/*.spec.ts` + page objects for the
   exposed primitives (percentage/numeric `fill(`/`type(`/`pressSequentially(` + save-after-type
   flows, all `setPercentageByIndex`/`ensureDefaultState` callers). The list, not judgment, is the
   denominator.
2. **Ticket C — exposure cross-ref (gpt-5.5 xhigh, research, 250cr)**: for each enumerated site,
   record: does it type-then-assert-registration? does it save? what happens on a silent no-register
   (timeout? wrong-value? false-green?). Output: exposure table, one row per site, no opinions.
   False-green rows (a lost edit that still passes) are flagged loudest — those are lying tests today.

## Phase 3 — verdict + fix design (mama only, CLAUDE-ONLY)

1. Classification with the Phase 1 mechanism + Phase 0 rate. H-app → defect package for Encore
   (rate, timelines, repro steps, screenshots) filed as bug-evidence; H-synthetic → page-object input
   primitive redesigned around the registration signal (Save/dirty state), one place, not per-test.
2. REJECT bucket enforced on any fix: no retry-until-green that hides a real defect, no assertion
   weakening, no sleeps. If the defect is real, tests assert the app's acknowledgment (Save enabled)
   as a named precondition and fail with a distinct, countable message — visibility, not suppression.
3. Full-file run ×2 green (or failing ONLY on the named defect signal) before any "done" claim; MD
   parity for any spec whose behavior wording changes.

## Ticket discipline (applies to every dispatch above)

Preflight 9/9 · `--max-credits` per figures above (2× estimates) · OUTPUT literal absolute ·
`## ASSUMPTIONS-MADE` + `## ASK` mandatory · blind seats never see each other · all facts tee'd ·
mama spot-checks raw files, never trusts report prose.

## Done means

One mechanism statement that explains all five evidence rows, a measured loss rate, an exposure table
over a machine denominator, Encore-facing evidence if app-side, and a single-point framework posture —
with zero tests rewritten to look away.
