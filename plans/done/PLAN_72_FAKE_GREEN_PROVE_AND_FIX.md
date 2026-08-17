> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_72_FAKE_GREEN_PROVE_AND_FIX.md`. All context below.**
>
> 1. **Identity**: load `/identity` per the Identity field. Phases adopt GENERATOR / WATCHDOG at write-time.
> 2. **Skills**: load every skill in the Skills field.
> 3. **Model + thinking + permission-mode**: read the frontmatter below (all three present per LR-041).
> 4. **Dependency gate**: Phase B must not start while `PLAN_71`'s TC-SVC-HIS-012 work is still in flight on `service-charge-history.spec.ts`. Check before dispatching. HALT if it is.
> 5. **Context load**: read §1 and §2 in full. §2 is the proof standard and it governs every phase.
> 6. **Execute phases in order.** Phase B fixes only what Phase A proved. A finding Phase A could not prove does not get "fixed" — it gets dropped with a reason.
> 7. **Handoff**: flip the Status field to DONE, add the Executed date, append an activity-log row (LR-028 + LR-037), `git mv` to `plans/done/`, `npm run plans:reindex`, commit.
>
> **HALT + ASK RUTVIK** if: a Phase-A proof shows a finding is NOT fake (the list was wrong) / a fix would change what a test is testing rather than how strictly it checks / Phase C shows a fix did not actually close the hole / any phase would touch a file outside §6.

---

# PLAN 72: Prove every fake green, then fix it — and install the proof standard the last sweep lacked

**Status**: DONE
**Executed**: 2026-08-16
**Priority**: High
**Created**: 2026-08-16
**Parent**: none
**Identity**: OWNER (orchestrator); phases adopt GENERATOR / WATCHDOG at write-time
**Model**: opus
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli
**CoverageMode**: quick
**Skills**: `/execute` → `/regression-guard` (wrap Phase B), `/audit` (Phase D)

---

## §0 Delegation Contract (binding — Rutvik, 2026-08-16)

**Council at all four stages: planning, execution, review, iteration.** No agent may remove, narrow, or
override this section — including a future session of Claude. Only Rutvik changes it, in chat.

- **Planning**: the design is Claude-authored; the plan document is council-drafted and adversarially reviewed by a different family before execution.
- **Execution**: every phase is delegated. Claude writes tickets, reads verdicts, judges. Claude does not write product code.
- **Review**: output is reviewed by a different family than produced it, and the reviewer's findings go back to the author to defend before reaching Claude. A review that arrives undefended goes back.
- **Iteration**: defects bounce to the originating seat. Claude self-fixes only after a bounce fails, and logs it as a routing failure.

Evidence rules at every stage: machine facts over prose · a claim needs something re-runnable · denominators are machine-derived · a worklist's paths are claims until re-resolved · no silent caps · disproving a finding is a win.

---

## §1 Context

An adversarial council pass over the Service Charge module returned **8 confirmed fake greens** — tests
that pass and prove nothing. The list, with each finding's proof and repair status, is at
`clients/encore/specs_planning/_internal/fake-green-proof-service-charge-2026-08-16.md`.

Two facts make this plan necessary rather than a simple fix-list:

**Only one of the eight has been independently verified.** The CEO re-checked the TC-SVC-HIS-012
swallow against source. The other seven rest on the adjudicator's own reading. A list is not evidence.

**This module was already swept for fake greens on 2026-08-10 and 2026-08-11, and that sweep cleared
six of these eight lines.** A prior pass looked at the same code and called it fine. So the failure
being fixed here is not eight bad assertions — it is that **the sweep had no standard of proof.** A
model read the code and formed an opinion. Opinions disagree; that is exactly what happened.

This plan therefore does two things in order: install a proof standard, then apply it.

---

## §2 The proof standard (this governs everything below)

> **A test is a fake green only when a runnable demonstration shows a concrete wrong value satisfying
> its assertion. No demonstration, no finding.**

Nothing here is settled by reading code and forming a view. Every claim produces something that can be
executed and re-executed by someone who trusts nobody.

Three proof classes cover the eight findings. Each finding is assigned exactly one.

**Class P1 — evaluation proof.** The assertion's expected value is a pure predicate over a string or
value. Prove it by evaluating the predicate against the wrong value.
Example: finding 4 asserts `expect(value).toContain('24.00')` to prove two-decimal rounding.
`'24.005 %'.includes('24.00')` evaluates to `true`. The wrong value passes. **Proven.**
This class needs no application, no browser, no spec run — a few lines of Node.

**Class P2 — swallow proof.** The assertion's input is produced by an error swallow. Prove it in two
parts: (a) the swallow's fallback is exactly the value the assertion demands, and (b) the swallowed
call has a real failure path. Both parts are shown from source plus an evaluation of the fallback.

**Class P3 — omission proof.** The assertion runs and can fail, but never touches the property the
test claims to check. Prove it by exhaustive enumeration: list every value the test asserts on, and
show the claimed property is not among them. An omission proof must enumerate, not assert — "it does
not check the label" is a claim; "here are all four asserted values, none is the label" is a proof.

**A finding whose assigned class cannot produce its proof is NOT-FAKE-PROVEN.** That is a real
outcome, recorded, and the finding is dropped from the fix list. Being unable to prove a finding is
information, not failure — and dropping it is how this plan avoids repeating the last sweep's mistake
in the opposite direction.

---

## §3 Prior-Fix Trial (recurrence-class gate)

Three prior defences existed against exactly this failure class. All three were in place and all three
let these eight through.

| # | Prior fix | Why it did not fire | Verdict |
|---|---|---|---|
| PF-1 | `scripts/check-unfailable-assertions.mjs`, wired into pre-commit | **Not a discovery failure** — CEO-verified it walks all 33 spec files and exits 1 on empty discovery. The real gap is its pattern: `BENIGN_CATCH_RE` matches only `'' \| "" \| `` \| [] \| 0` and **omits `null` and `false`** — the two fallbacks that produced findings 1 and 8. It also has no check for a `toContain` used where an exact value is knowable, which is findings 4, 5 and 6. `scoped-wrong`. | **CONVICTED** — rewired in Phase D |
| PF-2 | The standing rule that an unconfirmed expectation must be marked `fixme`, never asserted as a tautology | Memory-file prose only. No gate, no write-time check, no agent hard stop. `prose-not-mechanism`. Second observed failure, so it graduates. | **CONVICTED** — graduated in Phase D |
| PF-3 | The 2026-08-10 / 2026-08-11 fake-green sweeps of this same module | The sweep had **no proof standard**. It recorded model judgement about code and cleared six lines that a later pass says are broken. Nothing in its output could be re-executed to settle the disagreement. `rubber-stampable`. | **CONVICTED** — §2 is its replacement |

PF-3 is the load-bearing one. Phase D does not add a fourth opinion-based sweep on top of three failed
ones; it replaces the standard those sweeps ran under.

---

## §4 The eight findings and their assigned proof class

Source: `clients/encore/specs_planning/_internal/fake-green-proof-service-charge-2026-08-16.md`. Line numbers are as-adjudicated and are re-resolved in Phase A
before use — a line number in a worklist is a claim, not a location.

| # | test | file | class | the wrong value to demonstrate |
|---|---|---|---|---|
| 1 | TC-SVC-HIS-012 `:289` | history | P2 | `.catch(() => null)` feeding `toBeNull()` — passes when the header is gone |
| 2 | TC-SVC-HIS-012 `:271` | history | P3 | rows captured before the click, never compared after |
| 3 | TC-SVC-BAS-029 `:623` | basic-info | P3 | row 8 is not Audio Conferencing; only its index is read |
| 4 | TC-SVC-BAS-007 `:219` | basic-info | P1 | `24.005 %` satisfies `toContain('24.00')` — rounding untested |
| 5 | TC-SVC-BAS-012 `:290` | basic-info | P1 | `024.00 %` satisfies `toContain('24.00')` — leading zero untested |
| 6 | TC-SVC-BAS-014 `:326` | basic-info | P1 | `10.00 %` and `100.00 %` satisfy `toContain('0.00')` — clear-to-zero untested |
| 7 | TC-SVC-BAS-030 `:642` | basic-info | P3 | the document's sort-affordance expectation is never asserted |
| 8 | TC-SVC-BAS-025 `:588` | basic-info | P2 | `.catch(() => false)` feeding `toBe(false)` plus an instant snapshot |

**Findings 1 and 2 are already repaired** by PLAN_71's TC-SVC-HIS-012 rewrite. Phase A proves they
*were* fake against the committed baseline; Phase C proves the rewrite closed them. They get no
separate fix work.

**Findings 3–8 all live in one file**, `service-charge-basic-information.spec.ts`. One worker owns that
file for the whole of Phase B — no parallel dispatch may touch it.

---

## §5 Phases — council only, minimum dispatches

Every phase is delegated. The CEO writes tickets, reads verdicts, and judges. Cross-family is a hard
constraint on every verification seat: no provider grades its own work.

### Phase A — PROVE (2 seats, parallel, cross-family)

**A1** produces a runnable proof for all eight per §2, in one executable file plus a results table.
**A2**, a different provider, **re-executes A1's proofs from scratch** and independently attempts
findings A1 marked NOT-FAKE-PROVEN. A2's stance is that A1 is wrong until its demos run.

Both work read-only. Neither fixes anything — a repair here destroys the baseline the proof is against.

Output per finding: `FAKE-PROVEN` with its runnable demo, or `NOT-FAKE-PROVEN` with what was tried.

**Gate**: a finding proceeds to Phase B only on `FAKE-PROVEN` from A1 **and** confirmed by A2.
Disagreement between the seats routes to the CEO, never to a majority vote of two.

### Phase B — FIX (1 seat, owns the file exclusively)

Fix only the `FAKE-PROVEN` findings in `service-charge-basic-information.spec.ts`.

The fix is always to **strengthen the oracle, never to change what the test is testing**:
- Findings 4, 5, 6 — replace `toContain` with the exact value, since the true value is knowable. `24.00 %` is either the whole value or the app is wrong.
- Finding 3 — anchor on the row's own label content, not its index.
- Finding 7 — assert the sort affordance the companion document promises, or, if it should not be that test's job, move it and say where it went.
- Finding 8 — replace the swallow and the instant snapshot with a bounded wait for the dialog's absence.

Companion documents land parity in the same change — test cases, test plan, and workbook if one exists.
No deferral.

Each fixed test is run solo (`--grep`), twice, tee'd separately. Never the full file, never the suite —
runs share one authentication state and truncate each other. Expect several minutes per run; the grid
renders 22–30 s after navigation.

### Phase C — MUTATION VERIFY (1 seat, cross-family to Phase B)

**This is what proves the fix, and it is the phase that cannot be skipped.**

For each fixed test, take the exact wrong value Phase A demonstrated and show the **rewritten**
assertion now rejects it. A fix is proven only when the value that used to pass now fails.

Same treatment for findings 1 and 2 against PLAN_71's rewrite: the wrong values that satisfied the old
TC-SVC-HIS-012 must fail the new one.

A fix whose mutation still passes is not a fix. It goes back to Phase B.

### Phase D — CLOSE THE RECURRENCE (1 seat drafting, CEO owns the mechanism)

- **PF-1**: add `null` and `false` to the swallow pattern, and a kind for `toContain` where an exact
  value is knowable. **Fail-green discipline** — confirm zero hits across all 33 spec files on the clean
  tree before wiring it to block, so the gate wedges no legitimate work. A guard's corpus must contain
  what it must *not* block, not only what it must catch.
- **PF-2**: graduate the tautology rule from memory prose into a numbered rule with a trigger.
- **PF-3**: record §2 as the standard any future fake-green sweep runs under, and mark the 2026-08-10 /
  2026-08-11 sweeps as superseded — they are not deleted, they are labelled with what they missed and why.

Every new gate kind must catch the eight findings in this plan. That is its acceptance test: a gate
that cannot catch the bugs that motivated it is decoration.

---

## §6 Files this plan may touch

- `clients/encore/tests/service-charge/service-charge-basic-information.spec.ts`
- its companion test-case, test-plan and workbook entries
- `scripts/check-unfailable-assertions.mjs` (Phase D only)
- the rule and sweep-record files named in Phase D

## §7 NOT touched

- `service-charge-history.spec.ts` — PLAN_71 owns it. Phase A reads it; nothing here writes it.
- Any test outside the eight findings. A test nobody proved fake stays exactly as it is.
- Any page object, unless a Phase-B fix genuinely requires a helper — and then only the method it needs.
- The prior sweep artifacts' content. They are annotated as superseded, never rewritten — they are the
  record of how this was missed.
- Git history.

## §8 Per-Identity Satisfaction

| Identity | Duty | Concrete deliverable |
|---|---|---|
| OWNER | Tickets, dispatch, verdicts, the Phase-D mechanism | `plans/pending/PLAN_72_FAKE_GREEN_PROVE_AND_FIX.md`<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` |
| GENERATOR | Phase B fixes + solo runs | `clients/encore/tests/service-charge/service-charge-basic-information.spec.ts` |
| PLANNER | Companion document parity | `clients/encore/specs_planning/test-cases/setup/service-charge/service_charge_basic_information_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/service-charge/service_charge_basic_information_test_plan.md` |
| WATCHDOG | Phase C mutation verify + Phase D gate acceptance | `clients/encore/specs_planning/_internal/fake-green-proof-service-charge-2026-08-16.md`<br>`clients/encore/specs_planning/_internal/fake-green-proofs/mutate-verify.mjs` |
| HUNTER | — | (skipped: no new module intake or baseline walk falls inside this plan's scope) |
| HEALER | — | (skipped: no spec is being healed from a failure; oracles are being strengthened by GENERATOR) |
| GARDENER | — | (skipped: the only framework file touched is one guard script, owned by Phase D) |

## §9 Duty coverage — phase-owner HARD STOPs

**GENERATOR** — #1 tests must actually run and return a pass/fail count; #2 mistakes-first; #5 no root
framework edits (Phase D's guard script is OWNER's, dispatched separately, not GENERATOR's); #10 exact
matching, never substring — which is literally findings 4, 5 and 6. *Excused*: #0 Phase-0.5 walkthrough
— no new field coverage is authored here; existing assertions are strengthened against values already
observed.

**WATCHDOG** — #0a no self-audit: Phase C's seat must not be the seat that wrote the fix, and Phase D's
gate acceptance must not be graded by whoever drafted it. #3 assume errors exist — zero findings in
Phase C on eight fixes requires explicit justification. #4 every claimed fix cites an artifact.

## §10 Verification artifact

```bash
node clients/encore/specs_planning/_internal/fake-green-proofs/prove-fake-greens.mjs
```
Expected before Phase B: every finding prints its wrong value satisfying the current assertion.

```bash
node clients/encore/specs_planning/_internal/fake-green-proofs/mutate-verify.mjs
```
Expected after Phase B: every one of those same wrong values now **fails**. Any that still passes is an
unfixed finding.

```bash
node scripts/check-unfailable-assertions.mjs
```
Expected after Phase D: exits non-zero listing the pre-fix shapes when run against the pre-fix tree, and
clean against the fixed tree. A gate that is clean on both is not doing anything.

## §11 Plan-Deviations log

| # | Deviation | Reason | Disposition |
|---|---|---|---|
| D-1 | §8 originally named the mutation report inside the worker chips directory as a concrete deliverable, and §2/§4/§10 cited the adjudication list and proof scripts from the same place. That directory is excluded from version control, so the entire evidentiary basis of this plan was untracked and would not survive a routine cleanup. | A worker's own output directory was treated as a durable location. It is not. | All proof promoted into tracked paths under `clients/encore/specs_planning/_internal/` before closure, and every citation repointed. The three proof scripts were re-run from their new location to confirm the move did not break them. |
| D-2 | `TC-SVC-BAS-030` was left failing after Phase B and needed a separate diagnosis round. | Its failure was a timeout during the test's own cleanup, not an assertion problem — the same `beforeEach` clock-pinning defect found in PLAN_71. Phase B correctly declined to weaken an assertion to force a pass. | Fixed by moving the suite limit to `test.describe.configure` and giving that one test its own budget. Passes twice. |

---

## Execution Summary

**Executed**: 2026-08-16 · **Verdict**: eight tests passed while accepting values that should have failed. Seven now reject them. One is honestly recorded as uncovered.

### The standard this plan ran under

A test counts as a fake green only when a **runnable demonstration** shows a concrete wrong value
satisfying its assertion. Not a code review, not an opinion — an executable file that prints the wrong
value and the assertion that accepted it. Three classes were used: **P1** a comparison that is too weak
(a substring where an exact value is known), **P2** an error swallowed into a value that happens to
satisfy the check, **P3** the expectation the test's own name promises never being asserted at all.

The two prior sweeps, on 2026-08-10 and 2026-08-11, had no such standard and returned false clears. That
is why this one was written differently.

### Phase A — proof

Two seats from different providers, working independently, each produced a runnable file. Both are now at
`clients/encore/specs_planning/_internal/fake-green-proofs/`, and **both were executed by the orchestrator
directly** rather than accepted from a report. All eight findings: `FAKE-PROVEN`.

Representative: `expect(value).toContain('0.00')` accepts `"10.00 %"` and `"100.00 %"`, because
`toContain` on a string is `String.prototype.includes`. A field that should read zero could read one
hundred and the test stayed green.

### Phase B — repair

| # | Test | Was | Is |
|---|---|---|---|
| F3 | BAS-029 | row identified by index only | row anchored on `toBe('Audio Conferencing')` |
| F4 | BAS-007 | `toContain('24.00')` | `toBe('24.00 %')` |
| F5 | BAS-012 | `toContain('24.00')` | `toBe('24.00 %')` |
| F6 | BAS-014 | `toContain('0.00')` | `toBe('0.00 %')` |
| F7 | BAS-030 | sort affordance never asserted | **still not asserted — deliberate**, see below |
| F8 | BAS-025 | `.catch(() => false)` swallow | `not.toBeVisible({ timeout: 3000 })` |

Findings 1 and 2 live in the History spec and were repaired under PLAN_71.

### Phase C — mutation verification

The only proof a repair works is that **the exact value which used to pass now fails**. A cross-family
seat built `mutate-verify.mjs`, reading assertions from the working tree rather than from `HEAD` — the
repairs are uncommitted, so reading `HEAD` would have made every mutation trivially "pass".

**Seven CLOSED. One CHANGED-SHAPE.**

The CHANGED-SHAPE is F7, and it is deliberate. `TC-SVC-BAS-030` is named for surface persistence and does
not assert the absence of a sort affordance, because **nobody has confirmed against the running
application whether one exists**. Inventing an assertion to satisfy a checklist would have created a fresh
fake green inside the work that was fixing fake greens. It carries a `FIXME` naming what would close it:
probe the Basic Information grid live for a sort affordance and assert what is actually observed.

**F7 is an open gap, not a fix.** Any summary reading otherwise is wrong.

### Test results, 2026-08-16

All six Basic Information tests pass, each verified from raw run output by the orchestrator rather than
from a worker's summary:

| Test | Result |
|---|---|
| BAS-007 | pass, 53.1s |
| BAS-012 | pass, 53.2s |
| BAS-014 | pass, 53.3s |
| BAS-025 | pass, 50.4s |
| BAS-029 | pass, 54.8s |
| BAS-030 | pass, 3.1m — and a second time at 3.6m |

### Phase D — not landed here, with a named destination (LR-040)

`plans/pending/PLAN_74_FAKE_GREEN_ROOT_CAUSE_AND_GATE.md` owns the gate work. It exists and carries the
line items; this is not a phantom handoff. Two concrete inputs go to it from this plan:

1. **The swallow pattern has a hole.** `scripts/check-unfailable-assertions.mjs` matches `.catch(() => '')`, `[]` and `0`, but **not** `null` and **not** `false` — and finding F8 was a `.catch(() => false)`. Verified by reading the pattern directly.
2. **A gate exists for exactly this class and cannot fire.** `scripts/check-reject-oracle.mjs` demands machine evidence that an assertion rejects a wrong value — precisely this defect. It fails for three independent reasons at once: it reads `clients/encore/.machine-evidence/reject-oracle` while the only producer writes to `clients/encore/.test-evidence/rejected-inputs` (different directory, neither exists); no Service Charge test calls the producer at all; and it runs in announce mode, returning 0 regardless. Landed 2026-07-22, has never blocked anything. **A gate that cannot fail is the same defect as a test that cannot fail.**

### Verification at closure

```bash
node clients/encore/specs_planning/_internal/fake-green-proofs/prove-fake-greens.mjs
node clients/encore/specs_planning/_internal/fake-green-proofs/prove-fake-greens-b.mjs
node clients/encore/specs_planning/_internal/fake-green-proofs/mutate-verify.mjs
```
Expected, and confirmed at closure: eight `FAKE-PROVEN` from each proof, then seven `CLOSED` and one
`CHANGED-SHAPE` from the mutation run.

### Honest limits

- **F7 is uncovered**, by choice, and needs a live probe to close.
- The prior sweeps of 2026-08-10 and 2026-08-11 are superseded but were **not** relabelled in this plan — they remain as written. That relabelling belongs to PLAN_74 alongside the standard itself.
- `npm run check:spec-quality` exits 1 on this tree from a doctrine-ledger check unrelated to spec files, reporting 3 rules with no ledger entry. The four checks governing spec quality all pass in enforce mode on the working tree.
- These eight were the Service Charge module only. Every other module is unswept; `plans/pending/PLAN_73_FAKE_GREEN_FLEET_SWEEP.md` holds that work and is deliberately left pending.
