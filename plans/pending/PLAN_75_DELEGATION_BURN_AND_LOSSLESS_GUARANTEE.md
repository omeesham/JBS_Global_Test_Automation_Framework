> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_75_DELEGATION_BURN_AND_LOSSLESS_GUARANTEE.md`. All context below.**
>
> 1. **Identity**: load `/identity OWNER`. This plan governs the delegation system itself; no pipeline role owns it.
> 2. **Skills**: `/delegation-temp` (read in full — it is the subject), `/execute`, `/audit` for Phase 4.
> 3. **Model + thinking + permission**: read the frontmatter below.
> 4. **Dependency gate**: none. This plan is independently runnable.
> 5. **Context load**: `.claude/skills/delegation-temp/SKILL.md`, `.claude/skills/ultra-agents/worker-ext.md`, `.claude/state/ua-worker/ledger.jsonl`, and §2 of this plan.
> 6. **Phase 0 FIRST** — the measurement. No change lands before the baseline exists.
> 7. **Handoff**: flip the Status field to DONE, add the Executed date, append an activity-log row, move to `plans/done/`, run `npm run plans:reindex`.
>
> **HALT + ASK RUTVIK** if: a proposed change touches a protected control file · a burn reduction cannot be paired with a quality check that would catch its regression · Phase 0's measurement contradicts §2's observed corpus by more than a third.

---

# PLAN 75: Cut Claude's own burn without losing a single point of quality

**Status**: Pending
**Priority**: High
**Created**: 2026-08-16
**Parent**: none
**Identity**: OWNER
**Model**: opus
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

**The orchestrator side, which the ledger cannot see** (added after review — the first draft measured only
the delegated half). From the session transcript rather than the ledger, count for a completed goal:
tool calls made by Claude directly, distinguishing ticket-authoring from reading from verification;
turns spent on bounce or re-diagnosis after a worker death; turns spent inside the reviewer-defence loop;
turns spent on closure ceremony.

**Where a figure cannot be machine-derived, report it as unmeasured.** Do not substitute an estimate. An
honest gap in the baseline is worth more than a number nobody can reproduce — a fabricated denominator
would poison every saving computed against it.

**Acceptance**: a table with counts, produced by a command that can be re-run, covering **both** sides.
Any unmeasured cell explicitly labelled as such.
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

### Phase 2 — Classify every burn finding (**Claude classifies; workers gather evidence**)

Each Phase-0 finding, and each §2 row, carries every applicable class from §3: *Claude doing a worker's
job*, *delegation machinery failing*, *tooling defect*.

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

### Phase 3 — Propose fixes in saving-plus-guarantee pairs (Claude authors, council attacks)

Every proposal names the saving **and** the check that catches its regression. Unpaired proposals are
rejected on sight. Order by saving-per-unit-of-risk, not by size of saving.

**Design constraint**: no fix may move judgment to a worker. If a saving requires a worker to decide
something rather than observe something, it is out of scope — that is the north star, not a preference.

### Phase 4 — Prove losslessness (delegated, adversarial, separate session)

The hard phase, and the one most likely to be skipped or faked.

For every landed fix, demonstrate on real work that quality did not drop. Not "the tests still pass" —
that is the shape of the fake green this framework has spent a whole plan family eliminating. The
demonstration must be capable of **failing**: run the same class of task both ways and compare what each
caught.

**If losslessness cannot be demonstrated for a fix, that fix is reverted, not shipped with a caveat.**

---

## §5 Per-Identity Satisfaction

| Identity | Duty | Concrete deliverable |
|---|---|---|
| OWNER | Measurement, classification, the fixes, the skill edit | `plans/pending/PLAN_75_DELEGATION_BURN_AND_LOSSLESS_GUARANTEE.md`<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` |
| WATCHDOG | Phase 4 losslessness proof, separate session | (skipped: the artifact path is unknown until Phase 3 decides which fixes land; Phase 4 names it at that point) |
| HUNTER | — | (skipped: no module intake, baseline walk or client surface falls inside this plan's scope) |
| GIVER | — | (skipped: no test cases or test plans are authored or modified by this plan) |
| BUILDER | — | (skipped: no spec files are authored or modified by this plan) |
| HEALER | — | (skipped: no failing spec is being diagnosed or repaired by this plan) |
| GARDENER | — | (skipped: no framework refactor or dead-code sweep falls inside this plan's scope) |

---

## §6 NOT touched

- Any client spec, page object, test case or test plan. This plan is about the delegation system, not the product under test.
- Any closure or safety gate. Gate defects found today belong to PLAN_74; this plan must not quietly absorb them.
- The north star. Rules that push thinking down or pull doing up are rejected, whatever they save.
- Protected control files, without Rutvik's recorded go — `/delegation-temp`, `worker-ext.md`, the dispatch wrapper, `.claude/settings.json`.

---

## §7 Verification artifact

```bash
grep -c "planning" .claude/skills/delegation-temp/SKILL.md
```
Expected after Phase 1: non-zero, and the hits describe the council's planning duty rather than merely
mentioning the word.

```bash
node -e "const l=require('fs').readFileSync('.claude/state/ua-worker/ledger.jsonl','utf8').trim().split('\n').map(JSON.parse); const w=l.filter(r=>r.exit_reason==='wall_ceiling'); console.log('wall-ceiling deaths:', w.length, 'of', l.length);"
```
Expected: a falling ratio after Phase 3's ticket-sizing fix lands. Establish the number in Phase 0 first —
a ratio with no baseline proves nothing.

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
