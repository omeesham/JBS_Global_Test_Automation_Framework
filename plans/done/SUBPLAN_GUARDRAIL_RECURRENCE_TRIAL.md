# SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL

**Status**: DONE
**Executed**: 2026-07-29
**Priority**: High — machine layer of the recurrence-convicts-prior-fix law (owner doctrine 2026-07-17)
**Created**: 2026-07-17
**Identity**: OWNER
**Parent**: (none — standalone guardrail stub per LR-069 §3.3.3)
**Depends on**: guardrail-policy.md §3.5 + /rca Prior-Fix Trial phase + /planning Step 3 recurrence gate (all landed 2026-07-17, same session)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

> **Relevance re-audit 2026-07-24 (council + cross-family review, read-only): KEEP-AS-IS.**
> All deliverables 0% implemented; dependencies 100% met (§3.5 at guardrail-policy.md:77, /rca
> Prior-Fix Trial, /planning recurrence gate all live); doctrine-ledger rates the class S1 UNENFORCED.
> No rebase needed — wiring targets (validate-plan-closure.mjs, guardrail-config.json) still match.
> CEO-verified same day: zero recurrence-trial checker on disk; `.claude/state/human-catches.jsonl`
> (3 entries) is WRITE-ONLY — nothing consumes it until this plan runs. Evidence:
> `.claude/state/ua-worker/chips/delegation-temp/out-plan-relevance/verdict-plan-B.md` + TOPLINE.md.

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
| OWNER | this stub + ramp keys + telemetry | .claude/guardrail-config.json | grep recurrence_trial_mode .claude/guardrail-config.json |

## Acceptance criteria

- [x] Detector exists with fire-telemetry (no dark gate) and a --self-test
- [x] Wired announce-first with ramp keys per LR-069 §3.3.2; budgets respected (§3.4)
- [x] CONVICTED-without-removal-evidence FAILs (Phase 3)
- [ ] Zero false positives across ≥10 sessions before any deny promotion — **1 of 10, time-gated**

## ⚠ CORRECTION — 2026-07-25 21:10. THE "95% / just needs the ramp flip" STATUS WAS WRONG.

The detector had **never been reviewed by anyone but the party who commissioned it.** Its first
cross-vendor adversarial pass returned **RED / NOT-SAFE-TO-RAMP** with 1 blocker and 4 majors.

**A claim in the earlier status was false and is retracted**: this plan reported that the detector's
"exit codes separate clean/fail/uncheckable". **There was no `exit(2)` path in the file at all**, and
CEO reproduction confirmed the gate returned **exit 0 for an empty file, a file with no `Status:`
line, and binary content.** That claim was carried forward from the goal statement and never
verified — the exact claim-vs-artifact failure this workstream enforces on workers, committed by the
dispatcher, and it survived precisely because the file never faced a rival seat.

### What the review found, and the fixed state (every row CEO-verified)

| finding | before | after |
|---|---|---|
| **CONVICTED teeth are regex-only** — 4 payloads PASSED citing nothing real: `does/not/exist.mjs:99999` + *"No removal was needed, see the diff"* + an empty parity heading; a real `file:line` + *"Removal diff noted"* + an empty parity table | PASS | **FAIL** — *"file:line does not resolve to a real file and valid line"*, *"Protection-parity table has no populated data rows"* |
| **not fail-closed** — empty / binary input | exit 0 | **exit 2** |
| **false positives on real closed plans** | **2/10** (`PIPELINE_FIX_PLAN.md`, `PLAN_04_CODE_REUSABILITY.md` — legacy paths that MOVED in the 2026-04-30 restructure) | **0/10** |
| markdown evasion — `CONVICTED` in code block / quote / `~~struck~~` / table cell accepted as a verdict; `### Prior-Fix Trial` accepted as h2 | accepted | fixed |
| `fake-fix` silently skipped absolute paths, directories, globs → false PASS | skipped | rejected explicitly |
| self-test | 18/18 | **41/41** |
| staged escalation (prose→file:line→diff→parity) | held | **still ends PASS/0** |

**One sub-case accepted, not bounced**: a file with no `Status:` line still exits 0. The gate's
contract is *"fires on `Status: DONE` plans"*, and `validate-plan-closure` only invokes it on DONE
plans — so "not a DONE plan → not applicable" is consistent scoping rather than a hole. Recorded as a
judgement call, not an oversight.

**The 20% false-positive rate was the real ramp danger.** At `deny` it would have blocked legitimate
closure on plans that were accurate when they closed, because the cited files legitimately moved.
Ramping an un-attacked detector to `deny` would have been exactly the failure this plan exists to
prevent — a "permanent fix" nobody tried to break.

**Reviewer's ramp ruling, accepted**: NOT-SAFE at the time of review; fix all five, then **restart**
the ≥10-clean-session / zero-false-positive count rather than relaxing it. The fixes have landed and
are verified, so the count restarts from the hardened detector — it does not resume from 1.

---

## Prior-Fix Trial

Filed 2026-07-26 because this plan is itself recurrence-class and owes the section its own gate
demands. The gate flagged this file (`recurrence: FAIL — Recurrence-class without ## Prior-Fix
Trial`) and the flag is **correct**: the ⚠ CORRECTION above documents a "permanent fix" that failed,
which is exactly the trigger condition in LR-069 §3.5. Writing this section is compliance, not
gaming — the finding stands until the trial exists.

### Prior fix 1 — LR-069 §3.5 doctrine + `/rca` Prior-Fix Trial phase + `/planning` Step 3 gate (all landed 2026-07-17)

1. **What it did to prevent this class**: mandated, in prose, that any recurrence-class RCA or plan
   carry a three-question trial of the prior fix before a new mechanism lands.
2. **Why it failed to prevent THIS instance**: `prose-not-mechanism`. All three surfaces were
   instructions an agent reads and may comply with. Nothing computed whether a recurrence-class plan
   actually carried a trial section, so a plan could assert compliance and no artifact contradicted
   it. This plan is the proof: it cites §3.5 six times in prose and shipped for nine days with **no
   trial section at all** — including through a session that read the rule.
3. **What the new mechanism does differently**: `scripts/check-recurrence-trial.mjs` computes it.
   `hasPriorFixTrial()` (`:254-264`) requires a literal `^## Prior-Fix Trial$` h2 whose section body
   contains `SURVIVES` or `CONVICTED` — prose mentions, `### h3`, backticked references, and
   struck-through text do not satisfy it. That is why this file failed the gate while containing the
   string "Prior-Fix Trial" six times.

**Verdict: CONVICTED.** Old fix location: .claude/rules/guardrail-policy.md:77 (§3.5 doctrine body).
Rewired into machine-enforced form in this same change, not left idling as sediment per §3.5.

> **Note for future authors — write these anchors WITHOUT backticks.** `stripMarkdownNoise`
> (scripts/check-recurrence-trial.mjs:138) removes all inline code before `checkConvictedTeeth`
> scans, so a `file:line` in backticks — the idiomatic markdown form — is deleted and reads as
> "CONVICTED without file:line of old fix". The strip exists to stop `CONVICTED` being smuggled
> inside a code block; it is over-broad for the evidence anchors. Recorded as a gate defect below.

**Rewire diff** — the change that removed the prose-only enforcement path: the recurrence-class
determination moved out of agent judgement and into scripts/check-recurrence-trial.mjs:254
(hasPriorFixTrial) and scripts/check-recurrence-trial.mjs:494 (checkConvictedTeeth). The prose
mandate is retained as doctrine only; it no longer functions as the gate, so no dead harness remains.

**Protection-parity table** — every protective function the convicted fix claimed, and where it lives now:

| Protective Function (old fix) | Surviving Mechanism |
|---|---|
| Require a Prior-Fix Trial on recurrence-class work | `scripts/check-recurrence-trial.mjs:254` — literal `## Prior-Fix Trial` h2 + `SURVIVES`/`CONVICTED` token required |
| Require the three-question trial to name a real prior fix | `scripts/check-recurrence-trial.mjs:494` — `checkConvictedTeeth` demands a resolving `file:line` for the old fix |
| Forbid layering a new fix over an unconvicted failed one | `scripts/check-recurrence-trial.mjs:494` — CONVICTED without a rewire/removal diff → FAIL |
| Forbid the fix claiming artifacts that do not exist | `checkFakeFix` — cited artifact absent → FAIL; untracked-but-present → UNCHECKABLE |
| Detect recurrence class without relying on self-declaration | `isRecurrenceClass` — requires a named prior remediation that failed, not a bare `LR-NNN` citation |

### Prior fix 2 — the detector's own "95% / just needs the ramp flip" status

1. **What it did to prevent this class**: asserted the detector was complete and verified, with only
   an owner ramp decision outstanding.
2. **Why it failed**: `rubber-stampable`. The status was self-graded — the file had never faced a
   rival seat. Its first cross-vendor adversarial pass returned RED with 1 blocker + 4 majors, and a
   specific claim in the status ("exit codes separate clean/fail/uncheckable") was **false**: there
   was no `exit(2)` path in the file at all.
3. **What the new mechanism does differently**: adversarial rounds by a cross-provider seat, plus
   CEO re-measurement of every claim against the corpus rather than against the report. Four rounds
   ran; each found real defects the prior round's fix had created or missed.

**Verdict: CONVICTED.** The "95%" figure is retracted above and replaced with measured state.

### Measured state at trial close (CEO-verified 2026-07-26, all commands re-run)

| axis | at "95%" claim | now |
|---|---|---|
| corpus false-positive rate | unmeasured (asserted 0) | **2.5%** — 15 FAIL of 595, **every one a true positive** |
| `exit(2)` UNCHECKABLE path | claimed present, **absent** | present; 20 plans correctly UNCHECKABLE |
| self-test | 18/18 | **79/79** |
| adversarial passes by a rival seat | 0 | 4 |
| ramp status | "just needs the flip" | `announce`, **time-gated** — 1 of ≥10 clean sessions |

The ≥10-clean-session count restarts from the hardened detector per the reviewer ruling above. The
gate is NOT flipped to `deny` in this change: LR-069 §3.3 makes S1 promotion conditional on elapsed
clean sessions, and flipping today on a same-day build would repeat exactly the failure this plan
exists to prevent — a "permanent fix" nobody let run long enough to break.

---

## VERIFIED STATE — 2026-07-25 19:35 (CEO re-ran every command) — SUPERSEDED IN PART BY THE CORRECTION ABOVE

**3 of 4 acceptance items MET and verified. The 4th cannot be completed by work — only by elapsed
clean sessions.**

**AC1 — detector, telemetry, self-test: MET.** `scripts/check-recurrence-trial.mjs` — `--self-test`
**18/18, exit 0**; `gate-fires.log` referenced (**not** a dark gate, unlike the ≥8 dark gates the
LR-069 §3.4 KNOWN-GAP admits).

**AC2 — announce-first + ramp keys: MET.** `recurrence_trial_mode: announce` with
`ramp_started 2026-07-25` / `ramp_target 2026-08-24` / `ramp_note`. Deadline is machine-enforced —
`node scripts/check-ramp-expiry.mjs` reports *"recurrence_trial_ramp_target: inside window (30 days
remaining)"*, so the ramp cannot be silently forgotten (the LR-062 failure mode).

**AC3 — CONVICTED teeth: MET, and proven not to be a wall.** The check enforces a three-part
contract; CEO built each stage as a real plan file and measured the exit code:

| CONVICTED evidence supplied | `convicted-teeth` | exit |
|---|---|---|
| prose removal claim only | FAIL — *"without file:line of old fix; without rewire-or-removal diff"* | 1 |
| + `file:line` of the old fix | FAIL — *"Removal diff without protection-parity table"* | 1 |
| + removal diff, no parity table | FAIL — same | 1 |
| + protection-parity table (**honest control**) | **PASS — "CONVICTED evidence complete"** | **0** |

Contract (`scripts/check-recurrence-trial.mjs:239-263`): `FILE_LINE_RX` = `path.ext:NNN`;
`REMOVAL_DIFF_RX` = a removal/rewire word co-located with diff/change/patch/hunk;
`PARITY_TABLE_RX` = a protection-parity / protective-function→surviving-mechanism table. That is
§3.5 with teeth: a convicted fix cannot be layered over, and a removal must map every protective
function it carried onto something that survives.

**AC4 — ramp evidence so far: 1 session, 2 findings, 2 true positives, 0 false positives.**
Live run against `plans/done/SYSTEMS_AUDIT_RCA.md` produced two findings, both CEO-verified as
genuine: no `## Prior-Fix Trial` section (grep count 0) and two cited artifacts absent from the
`scripts/` path they claim (`validate-queue-integrity.ts`, `generator-pre-run.ts` — present only
inside a git worktree).

**Ramp caveat for whoever closes this — do not read the corpus sweep as false positives.** A sweep
of all 464 `plans/done/*.md` fires broadly, mostly `fake-fix: Cited artifact absent` on pre-2026-04-30
plans whose cited files MOVED in the client-deliverable restructure. Those plans were accurate when
they closed. Cr only fires at DONE-flip time on the plan being closed, so legacy firings are **not**
representative of ramp risk and must not be counted as false positives — measure the rate on plans
closed after the restructure.

**Not flipped, deliberately.** The criterion is ≥10 clean sessions; we have 1. Flipping today would
be exactly the rationalisation LR-069 §3.3 forbids (never straight to deny for an S1). Unlike the
`doctrine_ledger` precedent — whose criterion was *coverage* and so armed the moment the corpus was
fully adjudicated — this criterion is session-count based and cannot be short-circuited by effort.

## Execution Summary

**Executed**: 2026-07-29

### What this session found

The plan's own status was wrong on two counts, both caught by measurement rather than by reading it:

1. **The self-test was RED.** The body claimed `79/79`; the actual result was **75/79, exit 1**. Four
   git-tracking-sensitive cases were failing. Root cause: the suite hardcoded
   `.claude/skills/ultra-agents/copilot-worker.sh` as a "git-excluded" example, but that file is tracked.
2. **The fake-fix check was half-implemented.** Phase 1 of this plan specifies that a fix claim citing an
   artifact must fail when that artifact *"exists but is not wired."* Clause (a) — artifact absent — worked.
   Clause (b) — wiredness — did not exist. A plan could claim *"the gate at X blocks this permanently"*
   while X was wired to nothing, and pass clean. A fake-fix detector that could not detect a fake fix.

Defect 2 was proven, not inferred: `scripts/check-dead-exports.test.mjs` is tracked (confirmed by
`git ls-files --error-unmatch`) and wired nowhere (confirmed by two independent searches — repo-wide and
home-directory, covering `package.json`, `.claude/settings.json`, `.githooks/`, `.claude/hooks/`,
`~/.claude/settings.json`, `~/.claude/hooks/`, and the closure/guardrail configs). A plan citing it as a
blocking gate returned PASS, exit 0.

### What was built

Six adversarial rounds against `scripts/check-recurrence-trial.mjs`, each defect surfaced by measurement:

| round | change | what the next round's measurement found |
|---|---|---|
| 1 | fixed the four git-sensitive self-test cases | self-test 75/79 → 79/79 |
| 2 | implemented clause (b) wiredness | applied to **every** cited path — ~20 legitimate plans began failing for citing page objects and spec files |
| 3 | scoped it to fix-claim context | false positives 20+ → **0 across 604 plan files**, but narrowed to one sentence template |
| 4 | widened the phrasings | still template-based: `hook`-form, passive voice, and an interposed adverb each slipped through, all emitting a false *"no fix-claim paths cited"* message |
| 5 | replaced templates with a structural discriminator | fires when a **gate-shaped path** and a **stemmed prevention lemma** share a sentence (negation-guarded, honest-pending-exempt) — deletes word order, adjacency and inflection as attack surface. Re-introduced 14 firings |
| 6 | wiredness redefined as **reachability** from an enforcement entry point | a module imported by a wired gate is now wired; the direct-reference reading had false-positived on every `lib/` module |

Round 5's battery was written **RED first** and the pre-fix run captured as evidence: 110/126 with
exactly the sixteen `*-UNWIRED` assertions failing. Round 6's remaining five firings were each traced
to an actual search proving unreachability, after a claimed "zero false positives" in round 5 was
disproved by checking a single row (`scripts/xlsx-lint-rules.mjs` is imported by
`scripts/verify-no-forbidden.mjs:109`, a live pre-commit gate).

### Measured final state (every command re-run by the dispatcher, not quoted from a worker report)

| axis | before | after |
|---|---|---|
| `--self-test` | 75/79, exit 1 | **130/130, exit 0** |
| clause-(b) wiredness | absent | implemented, reachability-based |
| spec-named claim forms caught | 0 of 4 | 4 of 4, across syntactic perturbations |
| false positives, 604 plan files | n/a | **0** — the 5 remaining firings are traced true positives |
| this plan against its own gate | UNCHECKABLE (checker untracked) | **PASS**, all four sub-checks green |
| hermeticity under tracked fixtures | untested | **proven** — 130/130 with fixtures staged as tracked |

Honest controls held throughout: fix claims citing a genuinely wired gate still PASS; a non-gate-shaped
path in a sentence with a prevention verb still PASSes; a negated claim still PASSes. Without these the
suite could not distinguish "did not fire" from "did not run."

**Stated residual**: lemma-free prevention claims ("this script makes recurrence impossible",
"handled by `scripts/x.mjs`") are still not detected. Recorded rather than implied solved.

### Artifacts

- `scripts/check-recurrence-trial.mjs` — the detector (committed 2026-07-29, `c38b0e71`)
- `scripts/human-catch-reflex.mjs` — Phase 1b reflex (committed, same)
- `scripts/walk-coverage/fixtures/recurrence-trial/` — 20 fixtures including the perturbation battery (committed, same)
- `.claude/guardrail-config.json` — `recurrence_trial_mode: announce` with `ramp_started` / `ramp_target` / `ramp_note`

Committing was load-bearing, not bookkeeping: while the checker was untracked, the committed wiring in
`validate-plan-closure.mjs` referenced a file git did not have, and this plan self-checked UNCHECKABLE
for exactly that reason. The commit turned its own gate PASS.

### Acceptance criteria disposition (LR-040)

- AC1 detector + telemetry + self-test — **(a) directly proven**: 130/130 exit 0; `gate-fires.log` append present.
- AC2 announce-first + ramp keys — **(a) directly proven**: `node scripts/check-ramp-expiry.mjs` reports `recurrence_trial_ramp_target: inside window`.
- AC3 CONVICTED-without-removal-evidence FAILs — **(a) directly proven**: `convicted-teeth: PASS — CONVICTED evidence complete` on this file, with the staged-escalation contract intact.
- AC4 zero false positives across ≥10 sessions — **(b) named recipient**: [SUBPLAN_GUARDRAIL_RAMP_PROMOTIONS.md](SUBPLAN_GUARDRAIL_RAMP_PROMOTIONS.md), which carries `recurrence_trial_mode` as a grep-verifiable inherited obligation. This criterion is **elapsed-time gated** and cannot be closed by effort; the count restarts from the hardened detector per the reviewer ruling above. The substantive constraint is unweakened — no `deny` promotion before the criterion is met — and it is now owned by a durable plan file plus the machine deadline in `scripts/check-ramp-expiry.mjs`, rather than by prose in a plan nobody is reading.

**Disposition authorization**: the owner's standing instruction for this work was to drive both plans to
completion, with open questions routed to the adjudication seat rather than to him. That seat ruled
SPLIT — close the body on evidence, hand the calendar criterion to a named recipient per LR-040(b) —
on the grounds that parking a finished body as a month-long calendar marker is the plans-rot pattern
LR-027's cascade clause exists to kill. Recorded here as the LR-046 disposition record.

## Handoff

Chat-only per LR-039.

## Inherited doctrine-ledger item (PLAN_UNIQUE_CASE_COVERAGE_FLOOR Phase 4)

- **Rule id `3-5-recurrence-convicts-the-prior-fix-owner-doctrine-2026-07`** (`.claude/rules/guardrail-policy.md` §3.5) — adjudicated **UNENFORCED: S1**. The prior-fix trial is prose-only today (`/rca` + `/planning` skill steps); the machine closure-check that §3.5 itself names as its enforcement companion is this subplan and has not landed. This subplan is the recorded owner. Recorded by the doctrine ledger (`.claude/doctrine-ledger.json`), which fails until this line exists — a recipient nobody can grep is a phantom handoff (LR-040(b)).
