> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_73_FAKE_GREEN_FLEET_SWEEP.md`. All context below.**
>
> 1. **Identity**: load `/identity`. This plan writes no test and fixes nothing — OWNER throughout.
> 2. **Skills**: `/ultra-agents` (cap lift, already authorised for this goal), `/find-bugs` (hunting methodology).
> 3. **Model + thinking + permission-mode**: read the frontmatter below (LR-041).
> 4. **Dependency gate**: none. This plan is read-only and cannot collide with PLAN_71 or PLAN_72.
> 5. **Context load**: read §2 (why "already swept" is not a reason to skip) and §3 (the proof standard) before dispatching anything.
> 6. **Phase 0 first** — the machine denominator. Lots are assigned from it, never from the list in §4.
> 7. **Handoff**: this plan produces a report and a follow-on fix plan. It never fixes.
>
> **HALT + ASK RUTVIK** if: Phase 0's file count differs materially from 33 / a lot's findings exceed what one fix plan can carry / any worker proposes a fix.

---

# PLAN 73: Fleet sweep — find and prove every fake green in the remaining 31 spec files

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
**Skills**: `/ultra-agents`, `/find-bugs`

---

## §0 Delegation Contract (binding — Rutvik, 2026-08-16)

**Council at all four stages: planning, execution, review, iteration.** No agent may remove, narrow, or
override this section — including a future session of Claude. Only Rutvik changes it, in chat.

- **Planning**: the design is Claude-authored; the plan document is council-drafted and adversarially reviewed by a different family before the fleet launches.
- **Execution**: every lot is delegated. Claude writes tickets, runs the demo files, judges. Claude does not hunt or prove inline.
- **Review**: every lot's output is adjudicated by a different family than produced it, and the adjudicator's findings go back to the lot to defend before reaching Claude.
- **Iteration**: defects bounce to the originating lot. Claude self-fixes only after a bounce fails, and logs it as a routing failure.

Evidence rules at every stage: machine facts over prose · a claim needs something re-runnable · denominators are machine-derived · a worklist's paths are claims until re-resolved · no silent caps · disproving a finding is a win.

---

## §1 What this plan is, and what it deliberately is not

A council pass over the Service Charge module found **8 fake greens** — tests that pass and prove
nothing — and two independent providers each built a runnable demonstration confirming all 8. That
method worked. This plan runs it across the rest of the suite.

**This plan collects and proves. It fixes nothing.** Every fix lands in a follow-on plan authored from
this plan's output. A worker that "helpfully" repairs a test here destroys the baseline the proof is
measured against and blinds the second reviewer.

**BrowserTool is `none` and that is a feature.** Every proof in this plan is a pure evaluation or a
source enumeration. No application, no browser, no spec run. That is why a sweep this wide is cheap.

---

## §2 The decision that shapes this plan: "already swept" is the opposite of "already safe"

Eleven modules carry prior fake-green sweep artifacts under
`clients/encore/specs_planning/_internal/false-green-sweeps/`.

The instinct is to skip them. **The evidence says do the reverse.**

The Service Charge sweeps of 2026-08-10 and 2026-08-11 examined six of the eight findings we later
proved real — and **cleared all six**. A prior sweep is therefore not evidence of cleanliness. It is
evidence that a module was inspected under a standard that we now know produces false clears.

So: **previously-swept modules are ranked HIGHER risk, not lower.** They carry a false assurance that
an unswept module does not, and someone has already decided they were fine once.

This is a deliberate departure from "don't redo work". It is recorded here so it is not mistaken for
an oversight, and §5 Lot 9 turns it into a product: an explicit audit of what those sweeps missed.

---

## §3 The proof standard (inherited from PLAN_72 §2 — unchanged, non-negotiable)

> **A test is a fake green only when a runnable demonstration shows a concrete wrong value satisfying
> its assertion. No demonstration, no finding.**

Three proof classes:
- **P1 evaluation** — evaluate the assertion's predicate against the wrong value; show it returns true.
- **P2 swallow** — show the swallow's fallback is exactly what the assertion demands, **and** that the swallowed call has a real failure path. Both halves.
- **P3 omission** — enumerate every value the test asserts on, and show the claimed property is not among them. Enumeration, never assertion.

Every lot ships **one runnable `.mjs` file** printing one line per finding. The orchestrator runs these
files directly; a worker's prose is not read as evidence.

**A candidate that cannot be proven is reported as NOT-FAKE-PROVEN and dropped.** Dropping is a
success condition. The last sweep's failure was calling things clean without proof; the opposite
failure — calling things broken without proof — is the same disease pointed the other way.

---

## §4 The known shape (a claim — Phase 0 replaces it with fact)

33 spec files were enumerated by an independent walk and the count independently confirmed by the
orchestrator. Two are done (`service-charge/*`), leaving **31**.

Expected distribution: corporate-override 7 · corporate-pricing 9 · locations 10 · local-office 3 ·
service-charge-text 1 · terms-conditions 1.

**These numbers are a claim, not a worklist.** Phase 0 re-derives them.

---

## §5 Phases

### Phase 0 — Machine denominator (orchestrator, one command, no dispatch)

```bash
git ls-files 'clients/*/tests/**/*.spec.ts'
```
Plus a full-disk walk, because a tracked-file listing cannot see an untracked spec. The two must agree;
a disagreement is itself a finding. Lots are assigned from **this** output, never from §4.

Record the total. It is the denominator every coverage claim in this plan is measured against.

### Phase 1 — Hunt and prove (9 lots, parallel, disjoint files)

Each lot: one worker, ~4 spec files, nobody else touching them. Each worker hunts using the taxonomy
in §6, then **proves every candidate it reports** per §3, shipping its runnable file.

| Lot | Scope |
|---|---|
| L1 | corporate-override: core, export, filters, grid-sort |
| L2 | corporate-override: import, labor-grid, location-picker · local-office: ect |
| L3 | corporate-pricing: detail, export-all, import-all, loc-export |
| L4 | corporate-pricing: loc-import, new-pricebook, override-nav, search |
| L5 | corporate-pricing: strategy · local-office: history, settings |
| L6 | locations: account-address, auto-addon, currency, left-panel-basic-information |
| L7 | locations: legal, local-information, management-history, notes |
| L8 | locations: pricing, shared-setup-locations · service-charge-text · terms-conditions |

**Every lot reports its denominator**: how many tests exist in its files, how many it examined, how
many it flagged. A findings list without a denominator cannot be distinguished from a lazy skim.

**Zero findings in a lot is a legitimate result** — but per WATCHDOG discipline it requires an explicit
justification, not silence.

**Every lot ships a raw-candidate ledger.** List every candidate considered, including the ones dropped
as NOT-FAKE-PROVEN, with the reason each was dropped. Without this, a hunter that both finds and proves
gets to decide what the adjudicator is ever allowed to see — the drops become invisible, and a lot could
quietly bury a real finding it failed to prove. The ledger is what keeps folding the proof into the hunt
from costing independence.

### Phase 1b — The prior-sweep audit (1 lot, different contract — do not fold into Phase 1)

The 11 artifacts under `false-green-sweeps/` are **not spec files**, so this work cannot satisfy Phase
1's denominator-and-proof contract and must not pretend to. It gets its own deliverable.

Per sweep artifact: what did it examine, what did it clear, and does §6's taxonomy find something it
cleared? Every hit is a `CONTRADICTS-PRIOR` — a case where a prior pass looked at real code and called
it fine. Those are the highest-value output of this plan, because each one is direct evidence about how
much the remaining sweeps can be trusted.

Its denominator is artifacts examined and clearances re-checked, not tests scanned.

### Phase 2 — Cross-family adjudication (2 seats)

Two adjudicators of a **different provider** than the hunters, each taking roughly half the lots. They
re-execute every lot's demo file and independently attempt the P3 omission proofs, where enumeration
completeness is the real risk and where a second pair of eyes actually earns its cost.

**They also review the drops.** Every lot's raw-candidate ledger is read, and every candidate dropped as
NOT-FAKE-PROVEN is either re-attempted or sampled. A lot reporting zero findings across four spec files
gets its ledger read in full, not sampled — that is the single likeliest shape for a lazy lot to take,
and it looks identical to a clean one from the outside.

**Deliberate allocation**: P1 and P2 proofs are mechanical — substring arithmetic and fallback
identity — and the orchestrator verifies those by running the files. Adjudicator attention goes to P3,
which is the only class where judgement lives. Spending a cross-family seat re-deriving
`'24.005 %'.includes('24.00')` is waste.

### Phase 3 — Synthesis (1 seat)

Dedupe across lots, rank by how badly each finding misleads, and produce:
1. The confirmed register — every proven fake green, with its runnable proof and its module.
2. The `CONTRADICTS-PRIOR` register from L9 — where a prior sweep cleared something real.
3. **Shape frequency** — which taxonomy shapes recur most across the suite. This is the input PLAN_74 needs to know what to gate.
4. A recommended lot structure for the follow-on fix plan.

---

## §6 The hunting taxonomy (proven on the Service Charge module)

**Structural — the assertion cannot fail:**
M1 error swallow feeds the expectation · M2 always-true predicate (`>= 0` on a length, `toContain('')`) ·
M3 assertion inside a branch that can be skipped, so the test can pass having asserted nothing ·
M4 no real assertion, or only on a value the test itself set up · M5 self-referential oracle ·
M6 nullish rescue turns a missing element into a passing value · M7 loose locator where a
wrong-but-present element satisfies the claim · M8 swallowed action failure the later assertions depend on.

**Semantic — the assertion runs, can fail, and measures the wrong thing:**
S1 the oracle does not measure the claim · S2 weak oracle where a strong one is available (comparison
where a literal is knowable; length where values carry the meaning) · S3 a comment admitting an
assertion was removed, weakened, or narrowed · S4 the signal never varies — true in both the working
and broken worlds · S5 a defect asserted as correct behaviour, with no ticket and no `fixme` ·
S6 silent partial coverage of a structured record · S7 the name promises more than the body checks.

**The highest-yield check, and it is cheap**: for every test, compare its title, its test-case
document's Expected, and what the code actually asserts. Where those three disagree, something is
wrong. That single comparison produced the majority of the Service Charge findings.

---

## §7 Fleet sizing and why not fewer

12 agents: 8 hunt-and-prove lots + 1 prior-sweep audit + 2 adjudicators + 1 synthesiser.

- **Fewer than 8 hunt lots** puts too many files behind one context and invites skimming; the sweep this plan is correcting failed exactly that way.
- **Proving is folded into hunting** rather than given its own wave — it halves the dispatch count, and a hunter that must build a runnable demo cannot report a vague suspicion in the first place. The discipline is the point, not the stage.
- **Two adjudicators, not nine**, because the orchestrator re-runs every demo directly. Machine verification of a runnable file is free; a model re-deriving it is not.

## §8 NOT touched

- Every spec file. This plan is read-only over the entire suite.
- `clients/encore/tests/service-charge/*` — already done under PLAN_71 and PLAN_72; L9 may read their sweep artifacts as evidence.
- The prior sweep artifacts' content. They are audited and annotated, never rewritten — they are the record of how this was missed.
- Any gate or rule. Hardening belongs to PLAN_74 and must not be started here.

## §9 Per-Identity Satisfaction

| Identity | Duty | Concrete deliverable |
|---|---|---|
| OWNER | Denominator, lots, dispatch, running every demo, final register | a worker-state file under `.claude/state/` (untracked — per-machine ephemeral output)<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` |
| WATCHDOG | Phase 2 adjudication; zero-findings justification per lot | `.claude/state/ua-worker/chips/fleet-sweep/out-ADJ-1/`<br>`.claude/state/ua-worker/chips/fleet-sweep/out-ADJ-2/` |
| GENERATOR | — | (skipped: this plan writes no test and fixes nothing — that is its defining constraint) |
| PLANNER | — | (skipped: no test cases are authored and no live walk is performed here) |
| HUNTER | — | (skipped: no new module intake or Jira baseline work falls inside a read-only sweep) |
| HEALER | — | (skipped: no failing spec is being diagnosed; these tests all pass, which is the problem) |
| GARDENER | — | (skipped: no framework hygiene work is in scope) |

## §10 Duty coverage — WATCHDOG HARD STOPs

#0a no self-audit — Phase 2 adjudicators must be a different provider and a different dispatch from the
hunters whose lots they grade. #3 assume errors exist — a lot reporting zero findings across four spec
files must justify it explicitly; silence is not a result. #4 every claimed finding cites an artifact,
which here means its line in a runnable demo file.

## §11 Verification artifact

```bash
git ls-files 'clients/*/tests/**/*.spec.ts' | wc -l
```
Expected: the denominator every lot's coverage is measured against. Lot scopes must sum to it minus the
two finished Service Charge files.

```bash
for f in .claude/state/ua-worker/chips/fleet-sweep/out-L*/prove-*.mjs; do node "$f"; done
```
Expected: every lot's demo runs clean and prints one verdict line per finding. **A lot whose demo does
not run has produced no evidence, whatever its report says.**

## §12 Plan-Deviations log

| # | Deviation | Reason | Disposition |
|---|---|---|---|
| — | none yet | — | — |
