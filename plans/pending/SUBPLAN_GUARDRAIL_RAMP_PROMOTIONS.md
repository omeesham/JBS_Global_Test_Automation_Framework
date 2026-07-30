# SUBPLAN_GUARDRAIL_RAMP_PROMOTIONS

**Status**: PENDING
**Priority**: Medium — calendar-gated custodian for every in-flight LR-069 announce→deny ramp
**Created**: 2026-07-29
**Identity**: OWNER
**Parent**: (none — standalone custodian stub per LR-069 §3.3.3)
**Depends on**: `.claude/guardrail-config.json` ramp keys; `scripts/check-ramp-expiry.mjs` (machine deadline); `.claude/state/gate-fires.log` (fire telemetry)
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

## Context

LR-069 §3.3 forbids landing an S1 gate straight at `deny`: every one lands `announce` and is promoted
only after its ramp criterion is met — typically ≥10 clean sessions with zero false positives. That
criterion is **elapsed-time gated**: no amount of work closes it on the day the gate is built.

This creates a structural problem the repo has already suffered. A plan that has finished all of its
buildable work still cannot flip DONE, because one acceptance box waits on the calendar. The plan then
rots in `plans/pending/` for weeks, indistinguishable from plans with real outstanding work, and the
promotion decision has no durable owner once the building session ends.

This subplan is the LR-040(b) recipient for that class. It owns the promotion decision for **every**
in-flight ramp, so each building plan can close its body on evidence and hand exactly one thing here:
*"flip this key when its criterion is met."* One custodian replaces N rotting parents.

**Provenance**: created 2026-07-29 as the recipient named in
`plans/pending/SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md`'s Execution Summary, per the adjudicated ruling
that a completed body plus a durable recipient beats a month-long calendar marker.

## Bootstrap

- **Identity**: OWNER
- **Skills auto-called**: `/identity`; `/execute` when run
- **Context files**: this file; `.claude/rules/guardrail-policy.md` (LR-069 §3.3 ramp discipline, §3.4 bloat governor + demotion review); `.claude/guardrail-config.json`; `scripts/check-ramp-expiry.mjs`; `plans/pending/SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md`

## Phase 0 — Inventory gate

Run `node scripts/check-ramp-expiry.mjs` and record every key it reports. Do not work from the table
below without re-running it first — ramps land and promote continuously, so this list is a snapshot,
not a source of truth.

**Snapshot 2026-07-29** (`check-ramp-expiry.mjs`, CEO-run) — 9 keys in an active announce window:

| ramp key | days remaining at snapshot |
|---|---|
| `ramp_target` | 11 |
| `mistake_ledger_ramp_target` | 11 |
| `depth_gate_ramp_target` | 13 |
| `reject_oracle_ramp_target` | 13 |
| `toothless_surface_ramp_target` | 13 |
| `reviewer_skill_compliance_ramp_target` | 14 |
| `unresolved_probe_ramp_target` | 23 |
| `recurrence_trial_ramp_target` | 26 |
| `interaction_coverage_ramp_target` | 26 |

Not in an announce window at snapshot: `stall_guard` and `uplink` (mode undefined),
`doctrine_ledger` (already at `deny`).

## Phase 1 — Define "clean session" mechanically

The ≥10-clean-sessions criterion is unusable while "clean" is prose. Land a written, checkable
definition covering at minimum:

- what counts as a session in which the gate was actually exercised (it must have run — a session where
  the gate never fired is not evidence of cleanliness, it is absence of evidence);
- what counts as a false positive versus a true positive, adjudicated against `.claude/state/gate-fires.log`;
- where the running count lives, so it survives the session that increments it.

**Do not invent a threshold beyond the ≥10 that LR-069 §3.3 already sets.** If a gate's own plan named
a different criterion, that criterion governs for that gate.

## Phase 2 — Per-gate promotion

For each key whose criterion is met: flip its mode to `deny` in `.claude/guardrail-config.json`, record
`ramp_complete: true` and the `ramp_flipped` date per §3.3.2, and note the evidence that satisfied the
criterion. A key whose window expires without its criterion being met is **not** auto-promoted — it goes
to the §3.4 demotion review instead, which may demote or delete it.

## Phase 3 — Retire this stub

When every key in the Phase 0 inventory has been promoted, demoted, or deleted, and no new announce-mode
ramp is in flight, close this subplan. If new ramps land while this is open, append them to Phase 0
rather than spawning a sibling — one custodian is the point.

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | ramp keys + the clean-session definition | .claude/guardrail-config.json | node scripts/check-ramp-expiry.mjs |

## Acceptance criteria

- [ ] Phase 0 inventory re-run and recorded (not inherited from the snapshot above)
- [ ] "Clean session" defined mechanically, with the count stored somewhere that survives a session
- [ ] Every inventoried key promoted, demoted, or deleted — none silently expired
- [ ] `node scripts/check-ramp-expiry.mjs` reports no key past its target without a disposition

## Inherited ramp obligations

- **`recurrence_trial_mode`** — from `plans/done/SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md`. That plan's
  body closed on evidence 2026-07-29 (detector hardened over six adversarial rounds, self-test 130/130,
  zero false positives across 604 plan files). Its AC4 — *"Zero false positives across ≥10 sessions
  before any deny promotion"* — is the only criterion outstanding and is time-gated. The count restarts
  from the hardened detector per the reviewer ruling recorded in that plan; it does not resume from 1.
  Doctrine-ledger rule `3-5-recurrence-convicts-the-prior-fix-owner-doctrine-2026-07` — this ramp
  promotion is the outstanding enforcement obligation for that rule (S1 UNENFORCED until deny lands).
- **`interaction_coverage_mode`** — from `plans/pending/PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md`,
  which remains PENDING on unbuilt work. Listed here so the ramp is not orphaned when that plan closes;
  its promotion is this subplan's regardless of when the parent lands.

## Handoff

Chat-only per LR-039. Outcomes, not obstacles.
