# SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL

**Status**: PENDING
**Priority**: High — machine layer of the recurrence-convicts-prior-fix law (owner doctrine 2026-07-17)
**Created**: 2026-07-17
**Identity**: OWNER
**Parent**: (none — standalone guardrail stub per LR-069 §3.3.3)
**Depends on**: guardrail-policy.md §3.5 + /rca Prior-Fix Trial phase + /planning Step 3 recurrence gate (all landed 2026-07-17, same session)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

## Context

Owner law (2026-07-17): when a failure class recurs in an area already carrying a "permanent" fix,
the prior fix goes on trial (3 questions → SURVIVES/CONVICTED); a CONVICTED fix is rewired or
retired-AND-removed — never layered over, never left idling as dead sediment. The prose/skill layers
landed same-session (§3.5, /rca phase, /planning gate). This stub is the LR-069 §3.3.3 required
recipient for the MACHINE layer — Sev S1, land `announce`, ramp to `deny` per §3.3.

## Bootstrap

- **Identity**: OWNER
- **Skills auto-called**: `/identity`, `/execute` when run
- **Context files**: this file; `.claude/rules/guardrail-policy.md` (§3.5 + LR-069 budgets/telemetry); `.claude/skills/rca/SKILL.md` (Prior-Fix Trial section); `scripts/validate-plan-closure.mjs` (C1-C6 pattern); memory `feedback_recurrence_convicts_prior_fix.md`

## Phase 0 — Dependency gate

Verify §3.5 + both skill sections exist on disk (grep). BrowserTool: none.

## Phase 1 — Detector

`scripts/check-recurrence-trial.mjs`: given a plan/RCA file, detect recurrence-class markers —
(a) body cites an existing LR-NNN / gate / HARD STOP as failed/insufficient/recurred, or (b) names a
module+class pair already present in agent-mistakes.md rows, or (c) contains the literal tokens
`recur`/`again`/`still happened` adjacent to a fix proposal. If recurrence-class AND no
`## Prior-Fix Trial` section with per-fix verdict enum → verdict FAIL. Include fire-telemetry append
per LR-069 §3.4 (`gate-fires.log`) — no dark gate.

**Fake-fix claim check (added 2026-07-17 — the meta-pattern from the 1222 incident)**: the detector
ALSO fails any plan/RCA whose fix claim cites a machine artifact as the prevention ("gate", "hook",
"script X blocks Y", "permanent solution via <path>") where the cited artifact either (a) does not
exist on disk, or (b) exists but is not wired (not referenced by any hook registration, closure
config, or check:* npm script). This is LR-042 claim-vs-artifact as a machine check — it catches the
exact 2026-07-17 shape where "it's permanently fixed" pointed at prose in a pending plan. A fix that
lives only in a PENDING plan must say so explicitly ("fixed when PLAN_X runs") to pass.

## Phase 1b — Human-Catch Reflex (owner mandate 2026-07-17: the trigger must not depend on the human asking)

A human reporting a bug/miss the agents should have found IS a recurrence-class event by definition —
the machine layer already failed once. The reflex fires on DETECTION, never on the human saying
"make sure this never happens again" (2026-07-17 proof: the 1222 catch, the dialog-checkbox
screenshot, the walk-gap explosion — every never-again response this repo has was human-DEMANDED;
zero were agent-initiated).

**Detection (belt + braces, honestly layered):**
- (a) Heuristic layer: user message reports an app behavior/bug on a surface that HAS a
  walk-evidence/coverage artifact NOT containing that finding (grep-able) — or carries explicit
  markers ("u missed", "why didn't you find", "i just saw", screenshot + bug observation).
- (b) Mandated-question layer (catches what heuristics miss): `/reflect` and `/final-q` each carry a
  REQUIRED question — "did the human surface any miss this session?" — a YES without a completed
  reflex block = verdict floor RED. Judgment is forced to run even when regex fails.

**The reflex (runs FIRST, before/alongside fixing the bug itself):**
1. Append to `.claude/state/human-catches.jsonl` (append-only ledger): `{date, what, surface,
   pattern_class, should_have_caught: crud-derivable|domain-rule|novel-control-type|undocumented-intent,
   why_machine_missed, never_again: {oracle, fixture, tc, rule}}`.
2. Classify the miss pattern → §3.5 Prior-Fix Trial if ANY prior mechanism claimed this ground.
3. **Classify the catch by which layer SHOULD have caught it (mandatory — prevents the flat-list
   fake-fix)** — the ledger entry carries a `should_have_caught` enum, and step-3 encoding differs by
   value:
   - `crud-derivable` — the miss is a CRUD invariant the generative oracle
     (PLAN_FORCED_DISCOVERY, I1–I11) SHOULD have emitted from the surface's shape (the 1222 /
     dialog-checkbox / 1604 / round-trip class). Encoding is NOT a one-off fixture — it CONVICTS the
     generator: the generator's metamodel vocabulary or invariant algebra was incomplete, and the fix
     extends the GENERATOR so the whole class is covered on every surface. Appending only a single
     regression fixture here, without asking "should the generator have derived this?", is itself the
     fake-fix pattern (Phase 1 check) wearing a reflex costume.
   - `domain-rule` — a documented business rule the domain-oracle harvest missed; fix = add the
     `domain-invariants.json` input + name its source (Jira/spec/baseline).
   - `novel-control-type` — a metamodel-feature type the extractor could not classify; fix = extend
     the extractor vocabulary (residual-1) so the LOUD-UNKNOWN floor becomes an auto-generated
     invariant next time.
   - `undocumented-intent` — irreducible (residual-2); fix = capture the adjudicated intent AS a
     domain-invariant so it is documented from now on.
   In every value the pattern becomes a named oracle/gate extension + a fixture proving the gate
   catches it + a required regression TC (recipient must EXIST — plan file or landed check, never
   prose); `crud-derivable` additionally requires the generator-extension diff, not just the fixture.
4. An entry with any empty `never_again` field OR a missing `should_have_caught` value = the reflex is
   INCOMPLETE — closure/reflect refuses.

**Detector extension**: `check-recurrence-trial.mjs` validates the ledger — a session whose
transcript/evidence shows a human-catch (layer-a signals) with no same-day ledger entry, or an entry
with unfilled `never_again` fields, → FAIL. Fire-telemetry per LR-069 as with the main detector.

## Phase 2 — Wiring (announce-first)

Wire the detector as a closure sub-check (validate-plan-closure Cr — computed on Status: DONE flips
of plan files) + optionally into the /planning Step 3 shell gate. Ramp keys (`recurrence_trial_mode:
off|announce|deny`) in `.claude/guardrail-config.json` with `ramp_started`/`ramp_note` per §3.3.2.
Land `announce`; promote to `deny` after ≥10 clean sessions / zero false positives.

## Phase 3 — Sediment sweep (the CONVICTED-removal teeth)

A CONVICTED verdict row must name the file:line of the old fix and the same plan must show its
rewire-or-removal diff; the detector flags a CONVICTED row with no matching removal/rewire evidence
as FAIL. This enforces "never left idling as a pile of dead harness."

**Protection-parity clause (owner mandate 2026-07-17: slop drops ≠ feature drops)**: removing or
retiring ANYTHING (a convicted fix, superseded prose, a "redundant" check) requires a parity table
in the same change — enumerate every protective function the removed thing performed, and map each
to the surviving mechanism that now covers it (file/gate/rule, named). An unmapped function = the
removal is BLOCKED — dropping it would open a hole, which is a fuckup wearing a cleanup costume.
The detector flags a removal diff with no parity table as FAIL. "It was slop" is a verdict about
REDUNDANCY (something else provably covers it), never about effort saved.

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | closure checks | scripts/check-recurrence-trial.mjs | node scripts/check-recurrence-trial.mjs --self-test exits 0 |
| GARDENER | (none) | (none) | (none) |
| OWNER | this stub + ramp keys + telemetry | .claude/guardrail-config.json recurrence_trial_mode key | grep recurrence_trial_mode .claude/guardrail-config.json |

## Acceptance criteria

- [ ] Detector exists with fire-telemetry (no dark gate) and a --self-test
- [ ] Wired announce-first with ramp keys per LR-069 §3.3.2; budgets respected (§3.4)
- [ ] CONVICTED-without-removal-evidence FAILs (Phase 3)
- [ ] Zero false positives across ≥10 sessions before any deny promotion

## Handoff

Chat-only per LR-039.
