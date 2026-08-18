> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_75_DELEGATION_BURN_AND_LOSSLESS_GUARANTEE.md`. All context below.**
>
> 1. **Identity**: load `/identity OWNER`. This plan governs the delegation system itself; no pipeline role owns it.
> 2. **Skills**: `/delegation-temp` (read in full — it is the subject), `/execute`, `/audit` for Phase 4.
> 3. **Model + thinking + permission**: read the frontmatter below.
> 4. **Dependency gate**: none. This plan is independently runnable.
> 5. **Context load**: `.claude/skills/delegation-temp/SKILL.md`, `.claude/skills/ultra-agents/worker-ext.md`, `.claude/state/ua-worker/ledger.jsonl`, and §2 of this plan.
> 6. **Phase 0 FIRST** — the measurement. No change lands before the baseline exists.
> 7. **Two-session structure (AUD-017)**: Phases 0–3 run in session A; Phase 4 + the DONE flip run in a SEPARATE session. Ending session A with the plan PENDING and a checkpoint row in §8 is the designed flow, not a silent checkpoint (LR-060 note) — hand off in chat naming Phase 4 as next.
> 8. **Handoff (Phase-4 session only)**: flip the Status field to DONE, add the Executed date, append an activity-log row, move to `plans/done/`, run `npm run plans:reindex`.
>
> **HALT + ASK RUTVIK** if: a proposed change touches a protected control file · a burn reduction cannot be paired with a quality check that would catch its regression · Phase 0's measurement contradicts §2's observed corpus by more than a third.
>
> **NOT a HALT**: Phase 1's missing go — record the ask, skip Phase 1, continue (see Phase 1's GO handling).
> **Review freshness**: §9's review covered the 2026-08-16 draft; this plan was materially edited 2026-08-17 (§9b) and again 2026-08-18 (§2b — the truth-failure corpus and mechanism set, authored by Fable at Rutvik's direction), so the §0 cross-family attack MUST be re-run on the current text before Phase 1 — a recorded review does not survive material edits.

---

# PLAN 75: Cut Claude's own burn without losing a single point of quality

**Status**: Pending
**Priority**: High
**Created**: 2026-08-16
**Parent**: none
**Depends on**: none — independently runnable. Two collision guards: gate defects belong to `plans/pending/PLAN_74_FAKE_GREEN_ROOT_CAUSE_AND_GATE.md` (§6); B1-class fixes extend PLAN_61's landed death machinery (§6), never fork it.
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none
**CoverageMode**: quick
**Skills**: `/delegation-temp` → `/execute` → `/audit` (Phase 4)

---

## §0 Delegation Contract (binding — Rutvik, 2026-08-16)

Council covers **planning, execution, review and iteration**. Not one of the four is exempt. This plan
was drafted by Claude and must be adversarially reviewed cross-family before Phase 1 begins; every phase
below is dispatched, never self-executed; every review goes **back to its author to defend** before any
result reaches the CEO.

**No agent, including a future Claude, may weaken or remove this section.** If a phase seems to justify
an exception, that is a finding to report, not a licence to proceed.

**Reading note (2026-08-17 audit — reconciliation, not a weakening)**: §0's "every phase below is
dispatched" composes with Phase 1–3's "Claude authors / Claude classifies" exactly as §9 findings 5–6
(accepted cross-family) resolved it: the *doing* of every phase — evidence gathering, measurement,
attack rounds, re-execution — is dispatched; the *judgment core* — classification, fix synthesis,
accept/reject — stays with Claude per the north star; and every stage's output still receives a
cross-family adversarial pass with author defence. Nothing in this note exempts any stage from
council review.

---

## §1 The goal, stated exactly

**Reduce the tokens Claude itself spends per unit of work, with zero quality loss.**

Both halves are load-bearing and the second is the hard one. Delegating more is trivially cheaper for
Claude and trivially worse for quality if done blindly — a worker starts with a fraction of Claude's
context, so work pushed down without its doctrine comes back thinner. The rule this plan must respect is
the existing north star: **Claude thinks, workers do.** Any change that pushes *judgment* down, or pulls
*doing* up, fails regardless of what it saves.

So every proposed reduction must arrive as a pair:
1. **The saving** — what Claude stops doing, measured.
2. **The guarantee** — the specific check that would catch it if that saving degraded the output.

**A saving with no paired guarantee is rejected**, however obviously safe it looks. That rule exists
because "obviously safe" is what every defect this framework has caught looked like beforehand.

### What a guarantee must contain (added after adversarial review — the rule was unfalsifiable as first written)

A cross-family review found the pairing rule "directionally right but not yet falsifiable": it demanded a
guarantee without saying what one is made of, which makes it decoration. A guarantee is only accepted
when it names all four of:

- **The mechanism** — the executable check, not a description of one.
- **The threshold** — the number at which it fails. Not "if quality drops"; a figure.
- **The baseline** — what it compares against, and where that baseline comes from.
- **The sample** — how much work it inspects, and how those items are chosen.

**Worked example**, using B7 (reports read in full where a verdict line would do):
- *Saving*: reports become verdict-first; Claude reads one line rather than the whole report.
- *Mechanism*: a validator that fails any worker report lacking `## VERDICT` within its first 10 lines.
- *Threshold*: zero tolerated on the structural check. For the parity audit, **any** case where reading the full report would have flipped the accept/reject decision is a failure of the saving.
- *Baseline*: the accept/reject decision Claude reaches from the verdict line alone.
- *Sample*: every report for the first ten dispatches, then one in five.

That is the shape. A proposal that cannot be written this way has not identified a real guarantee, and its
saving does not ship.

---

## §2 The observed corpus — one session's real burn (2026-08-16)

Not hypotheses. Each was observed during a single session that closed two plans and dispatched fourteen
workers. Phase 0 replaces this list with machine measurement; it is recorded here so a reviewer can
check whether the measurement found the same things, and **say so loudly if it did not** — a measurement
that disagrees with lived experience is either a better instrument or a broken one, and which matters.

| # | Where Claude burned | What happened | Suspected class |
|---|---|---|---|
| B1 | **Worker deaths from oversized tickets** | Three separate runs (`closeverify-0816`, `blinda-0816`, `f7walk-0816`) hit the wall clock and returned empty or partial reports. Each death cost a re-read, a re-diagnosis and a fresh ticket. | Ticket sizing has no wall-clock model. |
| B2 | **Re-verifying what a worker already proved** | Run files re-read, greps re-run, counting code read directly. Some was the guarantor duty and correct; some was re-doing a job already done well. | **Reworded after review.** As first written this blurred a necessary duty with waste, and in that form it is an invitation to under-verify. The framework's own rules require spot-auditing worker claims against disk. So the finding is *not* "verify less" — it is that no criterion distinguishes a claim already backed by a re-runnable artifact from one backed only by a worker's prose. Any fix must cut the second and keep the first. |
| B3 | **Encoding blindness** | Test output is UTF-16; a plain `grep` silently returns nothing. This produced a wrong "the test did not run" report, later corrected. Cost: several turns. | A known failure mode with no helper. |
| B4 | **Repeated partial file reads** | The same plan files read in chunks across many turns rather than once with structure. | **Downgraded after review — this was an excuse.** A reviewer pointed out that bounded section reads and reading a file's structure before its body are behaviours already available; nothing was missing but the discipline to use them. Recorded as an operator-behaviour finding, not a tooling gap. It stays in the table because deleting an entry that turned out to be self-serving would hide the more useful fact that it was written that way. |
| B5 | **Ticket authoring length** | Every ticket hand-written at 100–150 lines. Much is invariant boilerplate — doctrine, constraints, acceptance, verify shape. | No template-plus-delta path. |
| B6 | **Tooling defects burning Claude time** | A stray line printed above the validator's JSON made a closure gate fail with a misleading error, costing multiple diagnosis turns before the cause was found. | Bad error messages are a Claude-burn tax. |
| B7 | **Reading whole reports for one verdict** | Worker reports read in full where a single verdict line was the decision input. | No verdict-first report contract enforced at read time. |
| B8 | **The forbidden fight shape** | Two seats dispatched as a "council" that were the same provider and never fought; the protocol violation was found only on re-reading the skill. Wasted a full round. | The skill's own rules are not checked at dispatch time. |
| B9 | **Workers cannot spawn bash — and every ticket example assumes they can** | Added 2026-08-17 from a second session (PLAN_68 wave 1), and **corrected the same day after a second death disproved the first diagnosis.** Attempt 1, `p68-lotA-0817`: died at 46s producing nothing (`exit:0 ok:false exit_reason:no-deliverable death_class:C3 report_sections:0`); its report shows it planned to "execute them with `bash -lc` from PowerShell", narrated that intent three times, and never crossed the boundary. First diagnosis was "the ticket was written in the wrong shell dialect", so the dispatcher wrote a finished bash script to disk and the ticket said only "run this file". Attempt 2, `p68-lotA2-0817`, died anyway — `exit_reason:wall_ceiling` at 605s — and returned the real cause: **`"Permission denied and could not request permission from user"`. A worker on this machine cannot spawn bash AT ALL.** Not a dialect problem, not a missing binary: the runtime refuses the spawn and cannot prompt, so it denies, and the worker burned its entire wall clock finding that out. `node`, `npm` and `git` spawn normally — every other lot in the wave used them. Attempt 3 replaced the control with a Node script and stopped mentioning bash entirely. **Distinct from B1**: attempt 1 died in 46 seconds with credits untouched, nowhere near any clock. | Ticket-authoring examples throughout the doctrine use `tee`, `${PIPESTATUS[0]}`, `sha256sum`, `set -o pipefail` — all bash. A worker that follows the examples faithfully cannot execute them. Two candidate fixes, both control-surface: state the executable shell contract in the ticket template, or have the wrapper announce the available interpreters at dispatch. **Needs Rutvik's go, so it is recorded here rather than applied.** The transferable lesson is cheaper than either fix: **prepared controls are Node, never shell.** |

**Why B9 is worth more than one row**: the first diagnosis was wrong, and it was wrong in the direction that flatters the diagnostician — "I wrote the script in the wrong dialect" is a fixable authoring slip, while "workers cannot run shell scripts at all" invalidates a whole class of ticket. The cheap fix was tried first and cost a second death. A burn measurement that only records the final cause will under-count this class; the wasted attempt belongs in the number.

**Recurrence note on B3 (2026-08-17)**: encoding blindness fired again in the same wave — run
`p68-lotB-0817` produced a UTF-16 run log, and a plain read of it shows spaced-out characters that a
naive grep would return nothing for. B3 is therefore not a one-off; it is a standing tax on this
machine. Per LR-069 §3.5 a recurrence puts the prior fix on trial, and B3's prior fix was prose only
("a known failure mode with no helper") — which is to say there was no mechanism to convict. Any B3 fix
this plan proposes must be a helper or a wrapper behaviour, not another note telling the next session to
remember.

**Second-order observation worth more than either row**: both B9 and the B3 recurrence are *invisible to
exit codes*. The harness reported "exit code 0" for a run that produced nothing, and a UTF-16 log greps
clean as "no matches". Any burn measurement built on exit codes will score both of these as successes.
Phase 0's instrument must read the ledger's `ok` / `exit_reason` fields, never the process exit code.

**A reviewer should treat this table as a claim.** It was written by the session that produced the burn,
which is the least reliable narrator available.

### What this table cannot see (added after adversarial review — and this is the bigger half)

A reviewer's most valuable finding was not about any row. It was that **every row describes a delegated
run, because the ledger is the only mirror this session had.** The costs that fall on Claude directly
leave no ledger row at all:

- **Dispatch and bootstrap overhead** — authoring, preflighting and reading back every dispatch.
- **Context-window and compaction cost** — carrying a long session, and re-reading after a compaction.
- **Retry price** — what a bounce costs *Claude*, separately from what it costs the worker.
- **The reviewer-defence loop** — the fight protocol is the right mechanism and it is not free; two rounds on one question cost real orchestrator turns.
- **Ceremony** — status flips, activity-log rows, hashes, index regeneration.

**The plan as first drafted measured the delegated side and called it the burn.** That is measuring the
half that happens to be instrumented. Phase 0 is corrected below to cover both, and to state plainly
where the orchestrator side cannot be machine-measured rather than quietly omitting it.

---

## §2b The truth-failure corpus (goal g78, 2026-08-17/18) — wrong claims crossing three layers

§2 measures where Claude burned tokens. This section measures where the chain burned **truth**. Authored
by Fable (advisory seat, final-approval gate) at Rutvik's explicit direction — *"learn how to not let
the fighters fuck up and you urself as opus fuckup… not trusting and submitting the fuckups that copilot
does directly to me as nice work done by copilot! when its all a slop fuckup chain!"* — from the g78
two-audience ship audit. The chain being named: CEO writes a ticket carrying a gap → worker fills the
gap confidently and wrongly → CEO verifies sub-facts but not the conclusion → the false finding reaches
Rutvik ranked and confident. Ten cases, with who said what and who caught it. Two were caught by nobody
in the machine; Rutvik caught them, and his two were the biggest. That is the defect this section ends.

### The ten cases

| # | Claim as relayed | Copilot seats | Fable | Truth | Caught by |
|---|---|---|---|---|---|
| 1 | "SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md exists nowhere on disk" — a Prior-Fix-Trial row convicted a mechanism on the strength of it | F1 attacker: **AGREE** | `git ls-files '*<name>*'` → `plans/done/…` — it moved pending→done | Stale `pending/` cite in a skill; file exists, tracked | Fable |
| 2 | K1 "deliverable BREAKS on the client's first `npm test` — ship `.env.local.example`, highest priority" | F2 attacker: **AGREE**; F2 defence (disagreeing on everything else): "I still rank K1 first" | Cold-start persona invented; the shipped README itself documents the human channel ("Ask the QA automation team for a test account") — none of three seats read it | Delivery is human; "PURE SLOP" (Rutvik, verbatim) | **Rutvik** |
| 3 | "7 workbooks damaged" → corrected to "5 DEGRADED" | W1b2 invented a width-count metric + verdict; F2 attacker escalated ("destroyed"); F2 **defence measured** with a firing control: `lostWidthDefs=0`, columns 23→80 — widened, not damaged | (moot by then) | **1** workbook damaged, not 7, not 5 | Copilot — the seat asked to *measure* |
| 4 | "The 122-row client report is gone and unrecoverable — we undershipped" | F1 attacker authored it; CEO re-verified every sub-fact (absent from disk, untracked, zero history with firing control, builder discarded by design) — **all true** — and escalated to "the finding of the audit" | Named it the archetype: absence-in-git read as world-failure | Rutvik hand-delivered it. The verification was flawless and the conclusion false; the deciding input was outside the repo | **Rutvik** |
| 5 | "The fence was breached this sprint" | F2 attacker asserted it from a dated code comment | — | One atomic commit (`1a9f8d6d1`) — never an unfenced window. CEO checked history **before** relaying; nothing wrong reached Rutvik | CEO — the counter-example |
| 6 | L2 "a whole capability is absent for colleagues — TRACK it" | F1: **AGREE** | Private-by-design reporting stack; the tracked *reference* is the anomaly | A deliberate privacy decision read as an accident | Fable |
| 7 | L3 "SETUP.md requires copying a file that exists nowhere" | F1: **AGREE**; lot D "independently confirmed" | Read the actual line: `# cp … (if available)` — commented, optional, self-hedged | Everyone propagated a paraphrase; nobody opened the file | Fable |
| 8 | L10 "stale index — likely downstream of L1" (labelled a guess) | F1 attacker: **DISAGREE** — re-ran in a clean clone, still `STALE` | — | Independent defect. The hedge drew the attack | Copilot |
| 9 | G1 census: 25,360 rows, 10,232 "exist nowhere", `.bak` files ranked "halts first, SHOULD TRAVEL" | G1 authored it | — | Mechanical classification in judgment's costume; 28 usable rows in 1.4 MB | CEO |
| 10 | Fable: "K7 = live credentials one empty exclusion list from shipping" | — | Severity escalated | CEO checked: `ship-client.sh` has `set -euo pipefail` (line 7) and two `verify-no-forbidden.mjs --target` aborts (lines 82, 100) — the ship dies before creds leave. Disposition survives; severity does not | CEO **catching Fable** |

Score by layer: Copilot caught two of the CEO's errors; the CEO caught three (one *before* it shipped,
one of Fable's); Fable caught four plus the pattern; **Rutvik caught two, and his were the biggest.**
Every layer — including the advisory seat — produced at least one wrong confident claim. The design
target is therefore a chain where every layer is checkable, never a chain with a trusted top.

### What the corpus proves

1. **Cross-family agreement never once functioned as validation.** Cases 1, 2, 6, 7: the attacker
   agreed and was wrong. Seats consumed the CEO's framing embedded in the ticket and graded the
   paraphrase, not the artifact.
2. **Confidence suppresses attack.** The one disposition written as a guess (case 8) drew the one real
   per-item attack. The author's certainty is currently a shield — backwards.
3. **One command against the primary artifact decided it** in three of Fable's four overturns
   (`git ls-files`; opening the cited file). Chains of two to four seats reasoned from a summary;
   none ran the command.
4. **Measurement beat judgment both times it was tried** (cases 3, 8). A seat handed a metric and a
   control corrected a seat handed a question.
5. **The two Rutvik-only catches share one shape**: the decisive input existed outside the repo (a
   hand delivery; a documented human handover). No quantity of in-repo verification reaches it — case
   4's checks all passed. An existence/experience claim needs the out-of-repo channel *named and ruled
   out*, not more in-repo probes.

### Prior-fix trial (LR-069 §3.5 — run before proposing anything new)

| Prior fix (already doctrine) | Why it failed here | Verdict |
|---|---|---|
| Skill §Fight-Protocol "aligned joint result" | `AGREE` costs one token and satisfies alignment — rubber-stampable | **CONVICTED as worded** → rewired by M-B; §0's author-defends loop is untouched |
| Skill §Acceptance "spot-audit ≥3 claims against disk" | Scoped to sub-facts inside the repo; silent on the conclusion layer and the out-of-repo channel — case 4 *passed* it | SURVIVES for its class; **extended** by M-A |
| Skill §Acceptance "trap questions before reading" | Fired, but traps were authored from the same framing the ticket embedded | SURVIVES; the canary (M-B) is its falsifiable form |
| PLAN_78 Evidence laws 3/4 (counts carry scope; absences name where they looked) | Prose in one plan; nothing keys on them at acceptance; "where it looked" never required the whole tree or the human channel | SURVIVES; M-A is the durable, schema-keyed home |
| `## ASK` acceptance gate (LR-070 wave-1) | `ask_open: "missing-section"` on 16 of 17 g78 runs — including a report visibly carrying `ASK: none`. Either universal non-compliance or a broken detector; either way the uplink channel is decorative and nothing alarmed | **CONVICTED dead/never-fired** → F7 RCA rider below |

### The nine failure types (F1–F9) — named so they are recognizable before, not after

| Type | Signature | Cases | §3 class |
|---|---|---|---|
| F1 ABSENCE LEAP | A probe's silence about X promoted to "X is gone / never existed / nobody can" | 1, 4, 7 (2 as persona variant) | machinery + operator |
| F2 PARAPHRASE CASCADE | Seats consume the ticket's framing; `AGREE` scored as verification | 1, 2, 6, 7 | machinery |
| F3 JUDGMENT COSTUME | A worker invents a metric/classification and returns verdict words | 3, 9 | machinery |
| F4 TICKET STARVATION | The dispatch encodes less than the CEO knows — stages, tools, blocking mode, wall clock, provenance, log dir | 4 wall-ceiling deaths; a1/a1r; 3 null session-ids; 2 lost tee logs | machinery + tooling |
| F5 TRUNCATION BLINDNESS | A partial capture read as a total ("209 of 241") | A2 | tooling |
| F6 UNCONTROLLED PROBE | Zero-hit or all-hit probe with no same-primitive control (`reports.bugs` dot-regex; missing slash; case-glob; UTF-16 = §2 B3) | probe incidents | operator + tooling |
| F7 DEAD SENSOR | A monitored field that never varies, alarming no one | `ask_open` 16/17 | machinery |
| F8 BURIED METHOD SWAP | Denial → workaround → findings presented under the original method's authority, disclosed only in trailing BLOCKERS | F1 clone substitution; F2d in-memory blobs | machinery |
| F9 CATHEDRAL SCOPE | Worklist inflation and priority rankings on invented problems, asserted confidently | 27 items → 6; K1 "highest priority" | operator |

### The mechanism set (preference order: wrapper refusal > preflight > mandatory ticket section > acceptance gate > rule)

Each is written in §1's four-component guarantee shape. Each enters Phase 3's council attack like any
other proposal — pre-authored here, exempt from nothing.

**M-A — the Findings Contract** (kills F1, F5, F6 — the answer to "what stops a wrong number reaching
Rutvik"). Every findings-bearing report (lot, fight, census) and every finding the CEO writes into a
tracked plan types each row with a declared claim class from a closed enum: `EXISTENCE` · `COUNT` ·
`CAUSAL` · `OBSERVATION`. Two classes carry mandatory cells, refused at acceptance when empty:
- `EXISTENCE` ("X missing / gone / nowhere / unrecoverable / breaks on arrival"): **probe** (exact
  command) + **whole-tree cross-check** (`git ls-files '*<name>*'` move-search, plus history where
  relevant) + **channel** (the out-of-repo route ruled out *by name* — who could have done this by
  hand; for claims about a person's experience, the artifact's own documented channel counts and must
  be quoted) + **control** (a same-primitive probe that fires).
- `COUNT`: **enumeration command** + **scope** + the source's own **totals line quoted** (never a
  re-grep of a capture that already carries totals — case 3's 7-vs-5).
Every report ends with a terminal sentinel `## END-OF-REPORT <N sections>`; a report whose last line
is not the sentinel is truncated and bounced unread (F5, mechanically).
Deliberately **NOT** a lexical detector scanning prose for "does not exist" — that is the
detector-a-description-can-trigger failure. The author declares the class; an undeclared row later
shown to be an existence claim is itself an S1 mistake (LR-069 §3.2).
*Mechanism*: schema fields + acceptance refusal (verify-run schema where wired, CEO refusal otherwise).
*Threshold*: zero EXISTENCE/COUNT rows with empty cells reaching a plan or Rutvik. *Baseline*: four
false existence claims reached plan text in g78. *Sample*: every report for the first 10 dispatches,
then 1-in-5 — plus every row the CEO writes into a tracked plan, self-applied and Fable-spot-checked.

**M-B — the fight rewire** (kills F2, F3 — the answer to "what makes an attacker attack a confident
claim as hard as a hedged one").
1. Fight tickets carry `## CLAIMS-UNDER-TEST`: each claim with its primary-artifact path, the probe
   command that produced it, and the author's confidence tag. Claims and context never mix; no seat
   may treat a claims-table row as ground truth.
2. Legal per-claim verdicts: `RE-DERIVED-CONFIRM` (own command + output) · `RE-DERIVED-REFUTE` (same) ·
   `ABSTAIN` (did not re-run). **`AGREE` is not a verdict.** An all-ABSTAIN review earns no credit and
   does not count as the §0 adversarial pass. Alignment = both seats aligned on *re-derived evidence*;
   the author-defends loop is unchanged.
3. **The canary**: the CEO seeds ≥1 deliberately-false claim per fight ticket, recorded in a sealed
   local note before dispatch. A review that fails to REFUTE the canary is invalid — bounced, no
   credit, failure logged. This generalizes the only control that worked in g78 (W1b's seeded tracker)
   and removes confidence-as-shield structurally: some confident claims are known-false by
   construction, so a seat can no longer treat the author's certainty as evidence.
4. **Measure, don't judge**: verdict vocabulary is reserved. A worker may emit verdict tokens only
   when the ticket attached a rubric plus one control per verdict class; otherwise it returns
   measurements and the CEO applies verdicts (case 3's defence is the model). Findings tables carry an
   output budget (≤40 rows; remainder to an appendix file) — the G1 lesson.
*Mechanism*: ticket sections (skill text — GO-gated) + acceptance refusal + canary check at read time.
*Threshold*: canary refuted in 100% of fights; zero `AGREE` tokens accepted. *Baseline*: 4
rubber-stamped agreements, 0 canaries, in g78. *Sample*: every fight.

**M-C — the preflight refusal bundle** (kills F4 — mechanically removes the classes that killed 4
workers and voided 3 runs' provenance). Extend `scripts/dispatch-preflight.mjs` (unprotected;
council-reviewed edit; lands announce → refuse per LR-069 §3.3):
1. Refuse dispatch when `--timeout` is not explicitly passed — `--work-type` silently setting the wall
   clock killed 4 g78 workers; the same ticket re-run with `--timeout 1800` finished.
2. Refuse `--session-id` empty or unset — 3 ledger rows carry `session_id: null`.
3. Create-or-refuse the tee/log directory — 2 runs lost their logs silently.
4. Grep the ticket for required sections (`OUTPUT` anchor already checked; add `## EXECUTION MODE` —
   blocking-foreground statement + bulk-runners-available line — `## DENOMINATOR` on census/count
   work, `## MEASUREMENT CONTRACT` on verify/review/walk, `## CLAIMS-UNDER-TEST` on fights,
   `## METHOD DELTA` placed above FINDINGS): WARN until the skill text lands, then refuse.
5. WARN — never refuse; gameable and false-positive-prone — when a ticket carries >2 sequential stages
   or any single command's estimate exceeds 0.6× the effective ceiling; always print the effective
   wall clock so the work-type coupling is visible at dispatch time.
*Threshold*: zero dispatches lacking 1–3. *Baseline*: g78's 17 runs — 4 wall-ceiling deaths, 3 null
session-ids, 2 lost logs. *Sample*: every dispatch, automatic.

**Riders** (one line each, riding M-B/M-C's edits): `## METHOD DELTA` (intended method → actual method
→ why results still hold, or downgraded) must precede FINDINGS — a substitution disclosed only in
trailing BLOCKERS is a schema fail (F8). The Exit Receipt gains one **dead-sensor line**: any ledger
field with zero variance across the goal's runs is named (F7). One-off RCA ticket on the `ask_open`
detector — is `## ASK` parsing broken, or is compliance actually 0/17? — filed under this plan
(boundary: if the RCA convicts a closure/safety *gate* implementation, the fix routes to PLAN_74 per
§6; the detector-vs-compliance question itself is delegation machinery and lands here).

**F9 stays un-mechanized, stated plainly.** No wrapper can refuse scope inflation — it is the judgment
layer, and pretending otherwise would violate this plan's own north star. Two rules govern it: any
worklist >10 items or any priority ranking bound for Rutvik passes a slop gate (Fable or `/slop`)
**before** implementation dispatch (Rutvik's standing order, 2026-08-18); and the write-order rule from
case 5 — a finding enters a tracked plan only WITH its M-A cells complete. Verify-then-write, never
record-then-verify (the "fence breached" framing was written into a plan before the history check
refuted it).

**Killed as slop** (proposed during this work, rejected here so nobody rebuilds them): a lexical
verdict-linter over report prose (detector-a-description-can-trigger); a standing zero-variance
monitoring service (one receipt line suffices); hard refusal on stage-count (WARN only); any new
PreToolUse/Stop hook for this corpus (everything lands in an existing script, ticket text, and
acceptance behavior); and **more fight rounds** — rounds multiply paraphrase-consensus; the corpus
shows a second round without re-derivation validates nothing.

### The 80/20 verdict

M-A + M-B + M-C cover cases 1–4, 6, 7, 9 and all four dispatch-mechanics classes — roughly eighty
percent of the corpus by incident count, and all of it by severity. The rest is one-line riders or
honestly un-mechanizable judgment. If only three things land, land those three.

### Conflicts flagged (not silently layered)

1. **Skill §Fight-Protocol (protected)**: M-B redefines *alignment* (re-derived evidence; canary; no
   `AGREE` token). Amendment requires the same recorded Rutvik GO as Phase 1 — one GO can cover both
   skill deltas. §0 is strengthened, not weakened: review still never terminal, author still defends.
2. **Skill §Acceptance**: "spot-audit ≥3 claims" survives, extended by M-A. §2 B2's open criterion —
   "no criterion distinguishes a claim backed by a re-runnable artifact from one backed by prose" —
   is **answered by M-A's typed cells**; Phase 3 must not draft a second, parallel criterion.
3. **PLAN_78 §Evidence law**: laws 3/4 are M-A's session-local ancestors. Once M-A lands, plans cite
   the skill instead of restating private evidence laws.
4. **Evidence-rides-the-ticket vs primary-artifact forcing**: no conflict, one clarification M-B
   depends on — embedding *claims* stays (workers cannot read untracked scratch); embedding the CEO's
   *framing as context* is what produced F2. The claims table quotes artifact lines with `file:line`
   and carries re-runnable commands against the repo.
5. **PLAN_61 boundary (§6)**: M-C extends `dispatch-preflight.mjs`, which PLAN_61 Phase 6 landed —
   extension, never fork; the wall-clock refusal complements PLAN_61's credit floors (credits are not
   seconds).
6. **LR-070**: the `ask_open` finding is a wave-1 regression of the uplink law. The rider RCA is
   scoped to the detector/compliance question only — not a redesign of the uplink.

---

## §3 The trap this plan must avoid

The obvious conclusion from §2 is "delegate even more." **That conclusion is wrong on its own**, and the
plan must not reach for it reflexively.

Three of the eight entries (B1, B6, B8) are burn caused by *delegation failing*, not by Claude doing too
much. More delegation makes those worse, not better. Two more (B3, B4) are tooling gaps that cost Claude
tokens no matter who does the work.

So the honest decomposition is:
- **Burn from Claude doing what a worker should do** → delegate it.
- **Burn from delegation going wrong** → fix the delegation machinery; delegating harder amplifies it.
- **Burn from bad tooling** → fix the tool; it is not a delegation question at all.

**A plan that lumps all three together and prescribes "delegate more" is the failure mode.** Every finding
is classified before anything is proposed.

**These classes do not partition, and pretending otherwise misroutes fixes** (corrected after review —
the first draft demanded "exactly one" and its own examples broke that rule immediately). B1 is both a
machinery failure *and* a tooling gap: ticket sizing has no wall-clock model, and nothing measures the
wall clock to build one from. B8 is both a protocol failure *and* an absent gate: the fight shape was
wrong, and nothing checks the shape at dispatch time.

So a finding carries **every** class that applies, and **a fix must address each class it carries.**
A B1 fix that only teaches better ticket sizing, without the measurement that makes sizing knowable,
addresses half the finding and will read as complete. That half-fix is the specific failure this
correction exists to prevent.

---

## §4 Phases

### Phase 0 — Measure before touching anything (delegated, read-only)

Machine-enumerate, do not model-judge:
- Per goal in `.claude/state/ua-worker/ledger.jsonl`: dispatch count, deaths by `exit_reason` and `death_class`, wall-clock seconds, retry count.
- The death rate attributable to wall-ceiling specifically, and the median run duration for runs that survived — the gap between them is the ticket-sizing error.
- Every run whose declared OUTPUT file came back a skeleton or stub, with its ticket's length and its work-type.

**Ledger vocabulary (machine-read 2026-08-17, 2708 rows — re-derive at run time, do not trust this
snapshot)**: fields include `run_id, session_id, parent_run_id, ticket_id, work_type, secs, exit, ok,
exit_reason, stall_warns, attempt, death_class, model, effort, tokens_in, tokens_out, cost_usd, ts,
ts_end` — with PARTIAL coverage (≈500 early rows lack `ts`/`tokens`/`cost`; `exit_reason` absent on
≈200; `death_class` present on 561 only). Observed `exit_reason` enum: `success` 2109 ·
`no-report-schema` 178 · `no-deliverable` 70 · `wall_ceiling` 64 · `error` 44 · `no-declared-output` 32 ·
`budget-exhausted` 6 · `network` 4. **There is NO goal field** — "per goal" means: group by
`session_id`, with `parent_run_id` for nesting, and say so in the output. Every ratio states its
field-coverage denominator; a ratio over a field only half the rows carry must say so.

**The orchestrator side, which the ledger cannot see** (added after review — the first draft measured only
the delegated half). From the session transcript rather than the ledger — transcripts live under
`~/.claude/projects/C--Users-RutvikKhorasiya-projects-encore-framework/` as per-session `.jsonl` files;
if the transcript for a completed goal cannot be located, every orchestrator-side cell is reported
`unmeasured` — count for a completed goal:
tool calls made by Claude directly, distinguishing ticket-authoring from reading from verification;
turns spent on bounce or re-diagnosis after a worker death; turns spent inside the reviewer-defence loop;
turns spent on closure ceremony.

**Where a figure cannot be machine-derived, report it as unmeasured.** Do not substitute an estimate. An
honest gap in the baseline is worth more than a number nobody can reproduce — a fabricated denominator
would poison every saving computed against it.

**Outputs (literal paths — create the directory)**: the re-runnable measurement script at
`.claude/state/plan75/phase0-measure.mjs`, and the table it emits at
the Phase-0 burn-baseline table (the artifact this cited is gone; the claim is unverified).
**Acceptance**: the table carries counts for **both** sides, reproduces by re-running the script, and
labels every unmeasured cell as such.
**Dispatch shape**: read-only research ticket(s) per `/delegation-temp` §Dispatch discipline — preflight
via `node scripts/dispatch-preflight.mjs --ticket <t> --run-id <id> --model <m> --work-type research`,
`--max-credits` at 2× estimate, cross-provider reviewer seat.
**HALT** if neither source can support a measurement — say so plainly rather than substituting judgement.

### Phase 1 — Fix the skill gap that started this (Claude authors, council attacks)

`/delegation-temp` covers dispatch, acceptance, failure, closure and the fight protocol. **It says nothing
about planning.** Rutvik's directive of 2026-08-16 — *council on planning, execution, review and
iteration* — currently survives only as a `§0` block copied into four individual plans. Any plan authored
by anyone who did not copy that block inherits nothing.

Add the planning stage to the skill: what a council-reviewed plan requires, who reviews it, and that a
plan drafted without an adversarial cross-family pass is incomplete.

**`.claude/skills/delegation-temp/SKILL.md` is a protected control file. This phase needs Rutvik's
explicit go before the edit, and the go must be recorded in the plan.**

**GO handling (not a HALT)**: if Rutvik's recorded go does not exist when Phase 1 is reached, record
the ask as a §8 row, skip Phase 1, and continue Phases 2–3; land Phase 1 in any later session once the
go — the verbatim quote plus its date — is recorded in this section.

**Deterministic anchor for §7**: the Phase-1 edit adds a section to the skill whose header line is
exactly `## §Planning — council covers plan authoring`. That exact string is what §7's first check
greps for; as of 2026-08-17 the word "planning" appears **zero** times in the skill (machine-checked),
so the check can only pass if this phase actually landed.

### Phase 2 — Classify every burn finding (**Claude classifies; workers gather evidence**)

Each Phase-0 finding, each §2 row, **and each §2b type (F1–F9)** carries every applicable class from §3:
*Claude doing a worker's job*, *delegation machinery failing*, *tooling defect*.

**This phase was drafted as "delegated, cross-family" and that was wrong.** A reviewer caught it, and the
catch is worth recording because the plan had already argued against the very thing it then did: §3 warns
about reflexively delegating, and Phase 2 proceeded to push down the classification — which is the
judgment that decides whether every subsequent fix is a delegation change, a machinery change, or a tool
change. That is the decision core, and the framework's own rule is explicit that novel design and
synthesis stay with the model in the loop while workers feed it evidence.

It is also the exact failure mode this plan exists to guard against, committed inside the plan itself. A
model proposing how to spend fewer of its own tokens will reach for delegation without noticing. Left
standing, it would have been a plan about avoiding over-delegation that over-delegated its own centre.

So: **workers gather the evidence for each finding — what happened, where, how often, with what cost.
Claude does the classification and the fix synthesis.** A cross-family seat then attacks the finished
classification, which is review, not authorship.

**Output**: Phase-2 classification table under the run's plan75 state area — one row per finding:
the finding × every class it carries × the evidence pointer a worker gathered for it.

### Phase 3 — Propose fixes in saving-plus-guarantee pairs (Claude authors, council attacks)

Every proposal names the saving **and** the check that catches its regression. Unpaired proposals are
rejected on sight. Order by saving-per-unit-of-risk, not by size of saving.

**Design constraint**: no fix may move judgment to a worker. If a saving requires a worker to decide
something rather than observe something, it is out of scope — that is the north star, not a preference.

**§2b input (2026-08-18, Fable)**: the mechanism set M-A / M-B / M-C plus riders enters Phase 3 as
pre-authored proposals — attacked by the council like every other proposal, exempt from nothing. A
§2b mechanism may be reshaped or rejected only with the refutation recorded; none may be silently
dropped. Skill-text deltas (M-B ticket sections, §Fight-Protocol amendment) ride the same recorded
Rutvik GO as Phase 1 — one GO may cover both.

**Output**: Phase-3 proposals table under the run's plan75 state area — every proposal written in the
§1 four-component guarantee shape (mechanism · threshold · baseline · sample), ordered
saving-per-unit-of-risk with the ordering rationale recorded.

### Phase 4 — Prove losslessness (delegated, adversarial, separate session)

The hard phase, and the one most likely to be skipped or faked.

For every landed fix, demonstrate on real work that quality did not drop. Not "the tests still pass" —
that is the shape of the fake green this framework has spent a whole plan family eliminating. The
demonstration must be capable of **failing**: run the same class of task both ways and compare what each
caught.

**If losslessness cannot be demonstrated for a fix, that fix is reverted, not shipped with a caveat.**

**Separate session is AUD-017, not preference** — the Phase-4 session must not be the session that
landed the fixes. **Output**: Phase-4 losslessness verdict under the run's plan75 state area —
per landed fix: the both-ways comparison, what each way caught, and the keep/revert verdict. The plan
stays PENDING until this file exists; only the Phase-4 session flips Status to DONE.

---

## §5 Per-Identity Satisfaction

| Identity | Duty | Concrete deliverable |
|---|---|---|
| OWNER | Measurement, classification, the fixes, the skill edit | `plans/pending/PLAN_75_DELEGATION_BURN_AND_LOSSLESS_GUARANTEE.md`<br>`.claude/state/plan75/phase0-burn-baseline.md`<br>`.claude/state/plan75/phase2-classification.md`<br>`.claude/state/plan75/phase3-proposals.md`<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` |
| WATCHDOG | Phase 4 losslessness proof, separate session | `.claude/state/plan75/phase4-losslessness-verdict.md` |
| HUNTER | — | (skipped: no module intake, baseline walk or client surface falls inside this plan's scope) |
| GIVER | — | (skipped: no test cases or test plans are authored or modified by this plan) |
| BUILDER | — | (skipped: no spec files are authored or modified by this plan) |
| HEALER | — | (skipped: no failing spec is being diagnosed or repaired by this plan) |
| GARDENER | — | (skipped: no framework refactor or dead-code sweep falls inside this plan's scope) |

---

## §6 NOT touched

- Any client spec, page object, test case or test plan. This plan is about the delegation system, not the product under test.
- Any closure or safety gate. Gate defects found today belong to `plans/pending/PLAN_74_FAKE_GREEN_ROOT_CAUSE_AND_GATE.md`; this plan must not quietly absorb them.
- PLAN_61's landed death machinery (dispatch-time stub, per-work-type budget floors, stall bounce, `death_class` census — `plans/pending/PLAN_61_WORKER_DEATH_PERMAFIX.md`). B1-class fixes build on it, never fork or duplicate it.
- The north star. Rules that push thinking down or pull doing up are rejected, whatever they save.
- Protected control files, without Rutvik's recorded go — `/delegation-temp`, `worker-ext.md`, the dispatch wrapper, `.claude/settings.json`.

---

## §7 Verification artifact

```bash
grep -c "## §Planning — council covers plan authoring" .claude/skills/delegation-temp/SKILL.md
```
Expected: `0` before Phase 1 (machine-confirmed 2026-08-17 — the word "planning" appears nowhere in
the skill today), exactly `1` after. The first draft of this check counted the loose word "planning"
and terminated in a judgment clause ("hits describe the duty"), which cannot fail deterministically —
replaced with the exact anchor header Phase 1 is required to add.

```bash
node -e "const l=require('fs').readFileSync('.claude/state/ua-worker/ledger.jsonl','utf8').trim().split('\n').map(JSON.parse); const w=l.filter(r=>r.exit_reason==='wall_ceiling'); console.log('wall-ceiling deaths:', w.length, 'of', l.length);"
```
Expected: a falling ratio after Phase 3's ticket-sizing fix lands. Establish the number in Phase 0 first —
a ratio with no baseline proves nothing. Cross-check for the Phase-0 reviewer: the 2026-08-17
whole-ledger snapshot was **64 wall-ceiling deaths of 2708 rows** — Phase 0 re-derives this scoped per
goal/session; a Phase-0 number wildly off that order needs explaining, in either direction.

---

## §7.5 Acceptance criteria (the DONE-flip checklist — every box, no exceptions)

- [ ] Phase 0: `.claude/state/plan75/phase0-measure.mjs` re-runs clean; `.claude/state/plan75/phase0-burn-baseline.md` covers both sides; every unmeasured cell labelled.
- [ ] Phase 0 reviewed against §2 loudly; a >⅓ contradiction fired the recorded HALT.
- [ ] Phase 1: the skill carries the exact `## §Planning — council covers plan authoring` section AND Rutvik's go is recorded verbatim in Phase 1 — OR the phase is open with the ask recorded in §8.
- [ ] Phase 2: `.claude/state/plan75/phase2-classification.md` — every Phase-0 finding and every §2 row carries every applicable class; classification attacked by a cross-family seat, author defended.
- [ ] Phase 3: `.claude/state/plan75/phase3-proposals.md` — every proposal in the four-component guarantee shape; zero unpaired proposals.
- [ ] Phase 4 (separate session): `.claude/state/plan75/phase4-losslessness-verdict.md` — every landed fix proven lossless or reverted.
- [ ] §0 held: every stage's output got a cross-family adversarial pass with author defence, including the fresh pass on the 2026-08-18 text (§2b included) before Phase 1.
- [ ] §2b: every mechanism (M-A, M-B, M-C, riders) dispositioned in Phase 3 — landed, reshaped, or rejected with the refutation recorded; zero silently dropped. Skill deltas carry Rutvik's recorded GO or an open §8 ask row.
- [ ] §2b rider: the `ask_open` detector RCA ran; verdict (broken detector vs zero compliance) + fix route recorded.
- [ ] §8 reflects reality; closure ceremony per bootstrap item 8.

---

## §8 Plan-Deviations log

| # | Deviation | Reason | Disposition |
|---|---|---|---|
| — | none yet | — | — |

---

## §9 Adversarial review record (2026-08-16, cross-family, gpt-5.5)

Verdict: **DEFECTS-FOUND** — *"the plan knows the over-delegation trap, but its own Phase 2 delegates the
classification/judgment core and §1's guarantee rule is under-specified for several claimed savings."*

All six findings were accepted and fixed in the body above. None were argued down.

| # | Finding | Fix landed |
|---|---|---|
| 1 | §2 sees only delegated runs; the orchestrator's own costs — dispatch overhead, context and compaction, retry price, the reviewer-defence loop, ceremony — leave no ledger row, and Phase 0 measured the ledger alone | §2 gained "What this table cannot see"; Phase 0 now measures both sides and must label unmeasured cells rather than estimate |
| 2 | B4 was an excuse for an available behaviour; B2 blurred necessary verification with waste, in a form that invites under-verifying | Both rows rewritten. B4 downgraded to an operator-behaviour finding and **kept visible** rather than deleted; B2 restated so the fix cuts prose-backed claims and keeps artifact-backed ones |
| 3 | The saving-plus-guarantee rule named no mechanism, threshold, baseline or sample — rigorous-sounding, unfalsifiable | §1 gained the four required components plus a worked example carried through on B7 |
| 4 | The three classes do not partition; B1 and B8 each fit two | §3 now requires every applicable class, and a fix must address each class it carries — the half-fix is named as the failure mode |
| 5 | **Phase 2 delegated the classification — the judgment core — inside a plan warning against exactly that** | Phase 2 rewritten: workers gather evidence, Claude classifies and synthesises, a cross-family seat attacks the result |
| 6 | This is novel governance work, so the anti-over-delegation law applies: evidence may be delegated, synthesis may not | Recorded in Phase 2's rationale and in §6 |

**Why finding 5 is kept in the plan rather than quietly corrected**: it is the strongest available
evidence that the bias this plan exists to counter is real and operates below notice. The plan argued
against reflexive delegation on one page and delegated its own centre two pages later. A future session
reading only the corrected text would learn the rule; reading this row, it learns the rule is hard to
follow even while writing it down.

---

## §9b Claude-layer audit (2026-08-17, /audit review + machine verification — the auditing session did not author this plan)

Machine checks run against the live repo, each reproducible:

| Check | Result | Plan change |
|---|---|---|
| `wall_ceiling` is a real ledger token | CONFIRMED — 64 of 2708 rows | §7 check kept; dated baseline snapshot recorded beside it |
| B1's three cited run-ids exist in the ledger | CONFIRMED — `closeverify-0816` ×2, `blinda-0816` ×1, `f7walk-0816` ×1 | none needed |
| "planning" absent from the skill | CONFIRMED — 0 word-matches | Phase 1's premise holds; §7 check 1 hardened to a deterministic anchor header |
| "per goal" is machine-derivable from the ledger | **REFUTED — the ledger has no goal field** | Phase 0 now groups by `session_id` and must say so |
| Cited files exist (`worker-ext.md`, ledger, `dispatch-preflight.mjs`, `ticket-skill-scan.mjs`) | CONFIRMED | none needed |
| `PLAN_74` resolves to a real pending file | CONFIRMED — `PLAN_74_FAKE_GREEN_ROOT_CAUSE_AND_GATE.md` | §6 cites the exact path |

Findings fixed in the body — all additive; no §0/§9 reviewed text weakened:

1. **No phase named its output artifact** — a dumb agent cannot satisfy C3/C6 closure without literal
   paths. All five phases now carry `.claude/state/plan75/*` outputs; the §5 matrix cites them.
2. **§0 "every phase dispatched" read as contradicting Phase 1–3 "Claude authors/classifies"** —
   reading note added under §0, resolving per §9 findings 5–6.
3. **A missing Phase-1 go would have halted the whole plan** — skip-and-continue wired; the ask
   becomes a §8 row, not a dead stop.
4. **Two-session Phase 4 collided silently with LR-060's no-silent-checkpoint** — bootstrap item 7
   now declares the split as designed flow.
5. **`Model: opus` was not the LR-041 canonical value** — corrected to `claude-opus-4-8`; `Depends on`
   frontmatter added per LR-048.
6. **§7 check 1 terminated in a judgment clause** — replaced with an exact anchor header the grep can
   fail on.
7. **Review freshness unstated** — a recorded review does not survive material edits; the fresh
   cross-family attack on this 2026-08-17 text is now a named precondition of Phase 1.
8. **PLAN_61 scope collision unguarded** — §6 row added: B1-class fixes extend its landed death
   machinery, never fork it.
9. **No acceptance-criteria checklist existed** (LR-048 item 7) — §7.5 added; it is the DONE-flip
   checklist.
