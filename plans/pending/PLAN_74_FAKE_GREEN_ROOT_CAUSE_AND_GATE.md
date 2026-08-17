> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_74_FAKE_GREEN_ROOT_CAUSE_AND_GATE.md`. All context below.**
>
> 1. **Identity**: load `/identity`. Phases 3–4 touch enforcement — those need Rutvik's explicit go before any write.
> 2. **Skills**: `/audit`, `/research`, `/regression-guard` (wrap Phase 4).
> 3. **Model + thinking + permission-mode**: read the frontmatter below (LR-041).
> 4. **Dependency gate**: Phase 1 needs the proven fixture corpus from PLAN_72 Phase A. It exists. PLAN_73's shape-frequency output sharpens Phase 3 but does not block it.
> 5. **Context load**: §2 is the root-cause chain and §4 is the design. Read both before touching anything.
> 6. **Phase 0 first** — machine-enumerate every existing defence. Never work from a recalled list.
> 7. **Handoff**: flip Status, activity-log row, `git mv` to done, reindex, commit.
>
> **HALT + ASK RUTVIK** if: any phase would write to a gate, hook, or settings file without his prior in-chat go / the new gate flags anything on the clean tree / a defence turns out to be dead rather than merely narrow.

---

# PLAN 74: Why every existing defence let the fake greens through — and the gate that would have stopped them

**Status**: Pending
**Priority**: High
**Created**: 2026-08-16
**Parent**: none
**Identity**: OWNER
**Model**: opus
**Thinking**: max
**Justification**: multi-rule root-cause judgement across the full defence surface, plus the design of a new blocking gate — the class of work where a wrong call is expensive and hard to reverse.
**PermissionMode**: auto
**BrowserTool**: none
**CoverageMode**: quick
**Skills**: `/audit`, `/research`, `/regression-guard`

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

## §1 The question

Eight tests were proven — by two independent providers, with runnable demonstrations — to pass while
proving nothing. This repository already carries a pre-commit gate for unfailable assertions, four
learned rules about assertion strength, agent hard stops, a case-generation taxonomy, and a documented
fake-green sweep process.

**All of it was in place. All of it failed.** This plan finds out why, and closes it at the layer where
the fake green is actually born.

---

## §2 The root-cause chain (four links, each verifiable on disk)

Three of these are confirmed by the orchestrator reading source this session. The fourth is the design
consequence. Phase 1 and 2 re-verify all of them independently — none is taken on this section's word.

### Link 1 — the rule that forbids it exists, is correct, and was deliberately left ungated

`.claude/rules/specs.md` LR-068 corollary (a) says, in plain words: *literal over comparison when the
true value is KNOWN* — assert `toBe(0)`, never a weaker relative check. Findings F4, F5 and F6 are
exactly that violation.

The rule was graduated **2026-07-07**. The offending tests were written **2026-08-11** — a month later.

LR-068's own text explains why nothing stopped them:

> **Deliberately no gate/hook**: detecting "this test should have asserted field X" from static analysis
> is heuristic and false-positive prone … This rule is enforced by agent awareness at authoring time,
> not a structural gate.

**That reasoning is sound — for the omission sub-class.** "Did this test forget to check field X?" genuinely
is heuristic. But it was applied to the *whole rule*, including corollary (a), which is **not** heuristic
at all: a claim of "rounds to two decimals" checked with a substring match is mechanically detectable.

**The root cause of links 1 is a correct judgement about a hard sub-class, over-generalised to an easy one.**
Awareness was chosen over mechanism, and awareness lasted under a month.

### Link 2 — the one gate that does exist has a two-value hole

`scripts/check-unfailable-assertions.mjs` **is healthy** — orchestrator-verified this session: it walks
all 33 spec files, and it exits 1 rather than passing when discovery finds nothing. It is not blind.

Its pattern is the problem:
```js
const BENIGN_CATCH_RE = /\.catch\s*\(\s*\(\s*\)\s*=>\s*(?:''|""|``|\[\]|0)\s*\)/;
```
It matches `''`, `""`, `` ` ` ``, `[]` and `0`. It **omits `null` and `false`** — which are precisely the
fallbacks in findings F1 and F8. A blocklist of literal fallback values will always be one value behind
the next test that is written.

Its summary line also reads `0 across 0 file(s)` on a clean run, where the second number is
files-with-findings, not files-scanned. That is not a defect, but it reads as one, and it caused a
worker on this very investigation to report the gate as blind. **A gate whose clean output looks like a
failure will eventually be believed when it says nothing.**

### Link 3 — the right question exists, but it is scoped narrowly and self-graded

LR-068 also mandates:

> **Mandatory adversarial self-pass** … re-read each assertion and ask "what wrong value would STILL
> pass this?"

That is *exactly* the question this investigation used to prove all eight findings. The framework
already had the right idea. Two things blunted it:

1. **Scope** — it fires only for exports, CSV rows, structured records and captured requests. A
   percentage input's rounding check is none of those, so the question never fired on F4, F5 or F6.
2. **Self-grading** — it is a *self*-pass. The author who wrote the weak assertion is asked to spot
   that it is weak. The eight findings needed two independent providers to surface, and one earlier
   sweep had already looked at six of them and cleared them.

### Link 4 — the detective sweep had no standard of proof

The 2026-08-10 and 2026-08-11 fake-green sweeps examined six of the eight and cleared all six. Nothing
in their output could be re-executed, so when a later pass disagreed there was no way to settle it
except by re-doing the work. A process that records opinions cannot converge.

### Link 5 — a gate built for exactly this class exists and cannot fire (found 2026-08-16, PLAN_72 closure)

This is the sharpest link, and it was found last. `scripts/check-reject-oracle.mjs` exists to demand
machine evidence that a test's assertion **rejects a wrong value** — the precise defect all eight findings
share. It landed 2026-07-22. It has never blocked anything, and in its current wiring it never can, for
three independent reasons at once:

1. **It reads a directory nothing writes.** The check looks in `clients/encore/.machine-evidence/reject-oracle` (`scripts/check-reject-oracle.mjs:331-332`). The only producer, `assertRejectionOracle`, writes to `clients/encore/.test-evidence/rejected-inputs` (`clients/encore/src/utils/field-case-runner.ts:40-42`). Different directory on both path segments. **Neither exists on disk.**
2. **No Service Charge test calls the producer.** `grep -rn "assertRejectionOracle" clients/encore/tests/service-charge/` returns nothing. Even a corrected path would find no receipts for this module.
3. **It cannot fail by configuration.** `const exitCode = allFindings.length > 0 && mode === 'deny' ? 1 : 0;` (`:405`), with mode `announce` in `.claude/guardrail-config.json:44`. It printed 206 findings across 127 test identifiers and exited 0.

Verified by direct read of both sources, not from a report.

**Why this outranks the other four.** Links 1 through 4 are gaps — a rule ungated, a pattern too narrow,
a question mis-scoped, a sweep without a standard. Link 5 is worse than a gap: it is a **defence that
appears to be present**. Anyone auditing this repository would find a reject-oracle check in the
spec-quality chain and reasonably conclude the class was covered. A green check that is an artifact of
invisibility is more dangerous than no check, because it stops the search.

This makes Link 5 a **prior fix on trial** under LR-069 §3.5, and the verdict is `CONVICTED` —
`dead/never-fired`. Per that rule it must be rewired into a firing mechanism **or removed** in the same
change. Leaving it idling is forbidden: it would keep manufacturing the same false assurance.

**Scope note:** the eight repaired tests mostly do **not** appear in its missing-receipt list, so
correcting the path alone would not have caught them. Rewiring must cover which tests are required to
carry a receipt, not only where receipts are read from.

### Link 6 — the closure gate cannot tell an artifact's owner from its reader (found 2026-08-16)

Check `Cx` in `scripts/validate-plan-closure.mjs` extracts every path in a plan body (`:313-341`) and
fires on any matching `field-inventories|old-site-baseline` (`:801-807`, `:822-823`). It does **not**
distinguish a plan that *owns* a walk artifact's coverage from one that merely *cites it as a fact
source* (`:822-838`).

Consequence, live: `PLAN_71_HISTORY_SORT_TRUTH_AND_TAUTOLOGY_TEST.md` repairs one test's oracle and
authors no coverage. It cites `clients/encore/specs_planning/_internal/old-site-baseline/service-charge-2026-08-11.md`
exactly once, at line 117, to ask whether the predecessor application sorted on header click. On that
citation alone `Cx` judges it against 23 unresolved controls and denies closure, not overridably.

**This plan owns the fix.** The gate must key on ownership — a plan that authors or updates an artifact —
not on the mere appearance of a path in prose. Until then, citing a walk artifact as evidence is
penalised, which pushes authors toward *not citing their sources*. That is the opposite of what every
other rule here demands.

Two constraints on the fix, both learned today:
- **Do not weaken `coverage_mode` to unblock a plan.** `.claude/closure-config.json` is agent-writable and `.claude/closure-overrides.json` is not, precisely so a rollout knob cannot be used to launder a closure. Flipping `deny` to `announce` to pass a specific plan is that laundering.
- **The gate is right about the debt.** See the artifact defect immediately below. Fixing the scoping must not erase the real finding underneath it.

### Link 7 — a walk artifact declares itself complete while carrying unresolved controls (found 2026-08-16)

`clients/encore/specs_planning/_internal/old-site-baseline/service-charge-2026-08-11.md:170-179` states:

```
Coverage_Ratio: 29/29 (100%)
CrossCheck: clean
Completion_Record: reports/walk-coverage/service-charge-basic-info.json (status=complete, elements=29)
```

Its own provenance JSON carries unresolved controls (`the walk-coverage report (exists locally, untracked runtime artifact):624-700`),
and the closure check reports **23 of 29 unresolved after allowlist** — Radix-generated ids and structural
keys including `Order Search`, `DRO Search` and `Payment` buttons.

An artifact asserting `CrossCheck: clean` over machine data that disagrees is the same defect as a test
asserting a condition it never checks. It is a fake green wearing an artifact's clothes, and it is the
reason the sort-affordance count could sit wrong for days inside a document that read as complete.

**What the 23 actually are** (from `reports/walk-coverage/service-charge-basic-info.json`, cross-family
verified 2026-08-16). They are not 23 untested Service Charge controls:

| Group | Examples | JSON lines |
|---|---|---|
| Radix-generated ids | `id:radix-_r_0_`, `_r_4_`, `_r_7_`, `_r_a_`, `_r_d_`, `_r_g_`, `_r_t_` | 552-599, 660-664 |
| Global nav / search buttons | Order Search, DRO Search, Payment, ECT, Event Agendas, Navigator Assistant | 600-658 |
| Page shell | "Click to restore sidebar", `trigger-button`, "More information" | 666-682 |
| **Genuine module controls** | Basic Information / History tabs, the tabpanel, `service-charge-save`, the percentage archetype, Notifications | 684-725 |

Only the last group is real module surface. The rest is application chrome the enumerator swept up.

**And the artifact's two halves already disagree about them.** The markdown manifest dispositions many of
the early rows as `out-of-scope: outside-module` (`:183-204`) and marks the tab and form rows
read-only-verified (`:205-210`) — while the JSON still carries those same rows as `probe: "unresolved"`.
The gate reads the JSON.

**Settled 2026-08-16 by a two-seat cross-family fight, with the computing lines read directly: the block
is a FALSE POSITIVE, not coverage debt.**

The count is computed from the JSON alone (`scripts/walk-coverage/verify-denominator.mjs:221-248`):

```js
const allKeys = Object.keys(data.derived_types);
const unresolvedKeys = allKeys.filter(k => {
  const dt = data.derived_types[k];
  return (dt.probe === 'unresolved' || dt.probe === 'unresolvable') && !allowlist.has(k);
});
```

`allKeys` comes from the JSON's `derived_types`, and the only filter is the allowlist. **A markdown
`out-of-scope: outside-module` disposition never reduces this count.** The markdown manifest path is
separately parsed for completeness (`coverage-manifest.mjs:151-199`) and this artifact **passes** it;
`Cx` then calls `verifyDenominator` (`validate-plan-closure.mjs:847-856`) which re-derives an unresolved
count from raw enumeration output that never consumed those dispositions.

So the 23 are rows a human already dispositioned — global search buttons, sidebar controls, the tablist
and tabs, the save button, the percentage fields — being counted as unresolved because one half of the
artifact never learned what the other half decided.

**This is LR-069 §3.4 territory, explicitly**: a gate with confirmed false positives is *demoted or
fixed, never evaded*, and gates exist "to make quality CHEAP, not to make work slow". Two links in this
chain now describe the same failure from opposite ends — Link 5 is a gate that can never fire, Link 6/7
is a gate that fires when it should not. Both erode trust in the layer, and a gate nobody trusts is one
people route around.

**Three fixes are available and this plan must choose deliberately, not incidentally:**
1. **Make `verifyDenominator` consult the markdown dispositions**, so one artifact has one answer. Most correct, largest blast radius — every plan's count changes.
2. **Fix the `Cx` scoping** (Link 6) so a plan that merely cites an artifact is never evaluated against it. Narrower, and it fixes a second real defect at the same time.
3. **Owner-reviewed allowlist entries** for the dispositioned keys. Smallest, but it treats a systemic sync defect one key at a time and leaves the next artifact to hit it.

**Do not fix this by editing the JSON to match the markdown.** The finding would vanish and the sync
defect would survive to recur on the next artifact. Fix the reader, not the reading.

**Two separable jobs, and they must not be conflated**: correct the artifact so it states what its own
data says, and then decide what to do about the genuine coverage debt that honesty exposes. Correcting
the header alone, without dispositioning the 23, would replace a false green with a quieter one.

### Link 8 — the closure hook fails closed on its own validator's output (found 2026-08-16)

`scripts/validate-plan-closure.mjs` in `--json` mode prints a human-readable line to standard output
**before** the JSON:

```
DENOMINATOR PARITY: PathA=3741 PathB=3741 grids=0 … NOTE: 29/29 controls unresolved …
{ "plan": …
```

The line is returned by `scripts/walk-coverage/lib/case-parity.mjs:215-219` and printed by its caller
`scripts/walk-coverage/verify-denominator.mjs:333-345` (`console.log` at `:344`), which `Cx` invokes at
`validate-plan-closure.mjs:847-856` — before the JSON is written at `:1313-1314`. There is no
machine-readable channel on stderr; both the JSON and the human logs share stdout.

The hook parses stdout as JSON (`.claude/hooks/lib/check-plan-closure.mjs:250-259`), fails, and — per the
deliberate fail-closed policy — denies. **The message the user sees is `Validator output not JSON:
DENOMINATOR PARITY…`, which names neither the real failure nor the real cause.**

Scope: not every closure is affected. A plan whose citations never reach the parity print emits clean
JSON and closes normally (PLAN_72 did). Any closure that *does* reach it is blocked by a parse error
regardless of its actual verdict — so a plan can be denied without a single check having failed.

**This is why PLAN_71 could not be closed by tooling at all**, and why it was ultimately closed under an
owner override rather than a gate pass: the block was never a `Cx` verdict reaching the user, it was a
parse failure wearing one. Fixing Link 6 or Link 7 alone would not have unblocked it.

**The fix is small and should not wait for the rest of this plan**: send human-readable output to stderr,
or suppress it under `--json`. A gate whose failure message misidentifies its own cause trains people to
distrust and route around the whole layer — the same end state as Link 5's gate that cannot fire.

### Consequence carried from PLAN_71 — coverage sized from a wrong count

The Service Charge History sort-affordance count was recorded as two; the live walk found four
(`clients/encore/specs_planning/_internal/walk-evidence-service-charge-history-sort-2026-08-16.md`).
`plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md:413` carries a forward correction admitting the
coverage derived from that figure was undersized. **The number was corrected; the coverage it should have
produced was never authored.** This plan owns deciding whether that coverage is authored here or gets its
own destination — it must not evaporate a third time.

### The chain, stated once

*The correct rule was written but deliberately not gated · the one gate that exists blocklists fallback
values instead of reasoning structurally · the correct adversarial question exists but fires on the
wrong scope and is graded by its own author · the detective backstop produced false clears because
it had no re-runnable standard · and the one mechanism built for this exact class was wired to a
directory nothing writes, called by nothing, in a mode that cannot fail.*

Every layer was present. Every layer was narrow in a different direction, and the gaps lined up.

---

## §3 Phases

### Phase 0 — Machine-enumerate the defence surface (delegated, read-only)

Never work from a recalled list. Enumerate by command:
- `git ls-files 'scripts/check-*'` and `git ls-files '.claude/hooks/**'`
- every rule in `.claude/rules/*.md` and `docs/read_only_docs/LEARNED_RULES.md` whose trigger touches spec authoring
- every agent `HARD STOPS` entry mentioning assertions, oracles, coverage or skips
- the case-generation surface: `/coverage`, `/ultracoverage`, `field-case-generation.md`
- the pre-commit and pre-push wiring that decides which of the above actually run

Output: one table, every defence, what it claims to prevent, and whether it is **blocking**, **warn-only**,
or **prose-only**. That last column is the one that matters.

### Phase 1 — Fire every defence at the proven corpus (delegated, cross-family)

**The eight proven findings are the fixture corpus.** They are real, they are proven, and they shipped.

Run every enumerated defence against them and record, per defence per finding: **catches** / **misses**.

The expected result is that almost everything misses. That expectation must not soften the measurement —
a defence that catches something is as important to record as one that does not.

**Then run the inverse**, which is the check that stops this plan from making things worse: fire every
defence at the *clean* tree and confirm zero flags. A gate cannot be tuned toward catching these eight
if nobody knows what it currently passes.

### Phase 2 — Classify each miss (delegated, cross-family reviewer)

Per defence, one verdict: `scoped-wrong` · `prose-not-mechanism` · `rubber-stampable` · `dead/never-fired` ·
`different-sub-class`. Each verdict cites the file and line that proves it.

A defence classified `dead/never-fired` is a separate and more serious finding than a narrow one —
surface it immediately rather than folding it into a table.

### Phase 3 — Design the generative-time contract (Claude authors; council drafts and attacks)

The design core is in §4. Council expands it into a specification and a different family attacks it
before any code is written.

### Phase 4 — Build, ramp, prove (delegated; **needs Rutvik's explicit go — touches enforcement**)

Acceptance is fixed in advance and is not negotiable after the fact:
1. **The new gate catches all eight proven findings.** A gate that cannot catch the bugs that motivated it is decoration.
2. **The new gate flags nothing on the clean tree.** Fail-green discipline — a guard's corpus must contain what it must *not* block, not only what it must catch. A gate that wedges legitimate work will be switched off, and then it protects nothing.
3. It ships **warn-only first**, promoting to blocking only after a clean live period. Ramp, never a flag-day.

---

## §4 The design (authored here; this is the part that must not be delegated)

### 4.1 The structural law that replaces the blocklist

Do not add `null` and `false` to the pattern. That fixes two values and leaves the class open.

> **An assertion's expected value must not be reachable through the failure path of its own input.**

If `x` is produced by something that yields `V` when it fails, then `expect(x).toBe(V)` is unfailable —
whatever `V` is. `null`, `false`, `''`, `0`, `-1`, `'unknown'`, a sentinel object. The gate compares the
fallback on the variable's production path against the assertion's expected literal. Same variable, same
value, therefore no signal.

It needs no list of magic values and can never be one value behind. **But it is not fully decidable, and
the plan must not pretend otherwise** — an adversarial review corrected an earlier draft that claimed it
was simply "mechanically checkable".

Reachability is statically decidable only for **bounded syntactic shapes**. It becomes undecidable, or
merely heuristic, as soon as the value passes through a helper method, a `try/catch` assignment, a `??`
or `||` default, a `Promise.all` element fallback, a transformation like `Number()`, `Boolean()`, `trim()`
or `.length`, an object or array sentinel, or a swallow buried inside a page object.

So the gate ships in three buckets, and the third is the one that matters:

- **DECIDABLE-VIOLATION** — direct shapes it can prove: a `.catch(() => V)` on the same expression that
  feeds `expect(x).toBe(V)`, including one hop into a named page-object method in the same repository.
  These block.
- **CLEAN** — no swallow on the input's path at all.
- **UNKNOWN** — the input's failure path leaves what the gate can follow. **These are surfaced for
  review, never silently passed.** An UNKNOWN is not a failure of the gate; it is the gate correctly
  saying it cannot tell, which is the honest answer and the one that gets a human or a council seat to
  look. Silently passing what it cannot analyse is precisely how the current gate's blocklist behaves.

Start with the syntactic subset that catches the eight proven findings, and let the UNKNOWN bucket carry
the rest rather than overclaiming coverage the analysis does not have.

### 4.2 The claim-to-oracle contract at generation time

This is the layer that does not exist today, and it is where fake greens are actually born.

A test case's Expected clause makes a **claim**. Claims have strength. The assertion must match.

| The claim says | Required oracle | `toContain` is |
|---|---|---|
| exactly / equals / rounds to / strips / clears to / normalises to | exact matcher on the whole value | **a violation** |
| contains / includes / is among | containment | fine |
| does not X / no X appears | a positive control proving the check can see X when X is present | insufficient alone |
| is absent / null / empty | §4.1 applies — the value must be unreachable via the input's failure path | suspect by default |

`toContain('24.00')` under a claim of *"rounds to two decimals"* is a contract violation detectable from
the test-case document and the spec together, with no heuristics and no live application.

**This is what "harden the gate so it never allows fake greens through in future case generation" means
concretely**: the case-generation taxonomy gains an oracle-strength column, and the claim class the case
declares determines which matchers are legal for it.

### 4.3 Promote the adversarial question, and take it away from the author

LR-068's self-pass asks the right question — *what wrong value would still pass this?* — of the wrong
person, about too few things.

- **Widen the scope** from exports and structured records to **any assertion whose test-case document
  makes a claim of exactness**. That is where it was needed and never fired.
- **Make it a council pass, not a self-pass.** A different seat asks the question. The author who wrote
  the weak assertion is the last person likely to see it is weak — and an earlier sweep proved that even
  a fresh reader, without a proof standard, clears real defects.
- **Require the answer to be re-runnable.** The output is the runnable demonstration this investigation
  used, not a paragraph of reassurance.

### 4.4 Fix the misleading summary

`0 across 0 file(s)` must read as files **scanned**, not files with findings. A gate whose healthy output
looks like a malfunction trains people to disbelieve it, and a disbelieved gate is worse than no gate
because it also carries false assurance. One line, and it prevented a real misdiagnosis today.

---

## §5 NOT touched

- Any test file. This plan changes defences, never the code under test. PLAN_72 and PLAN_73's successor own the tests.
- The prior sweep artifacts. Annotated as superseded, never rewritten — they are the record of how this was missed.
- Any gate or hook, until Rutvik's explicit in-chat go. Phase 4 is fenced behind that, and the fence is not a formality.
- The rules that are already correct. LR-068 corollary (a) does not need rewording — it needed a mechanism, and that is what this plan builds.

## §6 Per-Identity Satisfaction

| Identity | Duty | Concrete deliverable |
|---|---|---|
| OWNER | The §4 design, the go/no-go on enforcement, final judgement | `plans/pending/PLAN_74_FAKE_GREEN_ROOT_CAUSE_AND_GATE.md`<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` |
| WATCHDOG | Phases 0–2: enumerate, fire at the corpus, classify every miss | worker chip output (ephemeral — not tracked in git) |
| GARDENER | Phase 4 build and ramp of the gate and its fixtures | `scripts/check-unfailable-assertions.mjs`<br>`scripts/lib/` fixture corpus for the eight proven findings |
| GENERATOR | The case-generation oracle-strength column | `clients/encore/specs_planning/_internal/field-case-generation.md` |
| PLANNER | — | (skipped: no test cases are authored and no live walk is performed in this plan) |
| HUNTER | — | (skipped: no module intake or baseline work falls inside a defence-surface audit) |
| HEALER | — | (skipped: no failing spec is being diagnosed here) |

## §7 Duty coverage — WATCHDOG HARD STOPs

#0a no self-audit — Phase 1's measurement seat must not be the seat that enumerated in Phase 0, and Phase
4's acceptance must not be graded by whoever built the gate. #3 assume errors exist — "every defence is
fine, the tests were just bad" is a rejected conclusion; eight proven findings shipped through all of
them. #4 every claimed miss cites the file and line that proves it.

## §8 Verification artifact

```bash
node scripts/check-unfailable-assertions.mjs
```
Expected after Phase 4: **exits non-zero against the pre-fix corpus, listing all eight shapes** — and
**clean against the current tree**. A gate that is quiet on both has changed nothing; a gate that is loud
on both will be turned off within a week.

```bash
node scripts/lib/fixtures/fake-green-corpus/run-corpus.mjs
```
The eight proven findings are **checked into the repository as a fixture corpus**, not referenced by a
commit hash. Phase 4's first task is to extract them from the pre-fix source into
`scripts/lib/fixtures/fake-green-corpus/` — each fixture carrying the original assertion, the wrong value
that satisfied it, and the finding it came from.

A placeholder commit hash was what an earlier draft of this plan carried, and the review was right to
call it fatal: once the tests are repaired the live evidence is gone, and an acceptance test that points
at a hash nobody recorded is an acceptance test that will never be run again. Checked-in fixtures survive
the repair, survive a rebase, and can be extended every time a new shape is found.

Expected: every one of the eight fixtures is flagged by the gate. A gate that cannot catch the bugs that
motivated it is decoration.

## §9 Plan-Deviations log

| # | Deviation | Reason | Disposition |
|---|---|---|---|
| — | none yet | — | — |

## §10 Links 6 + 7 — FIXES LANDED 2026-08-17 in `1bbcd592c` (review still owed)

Both defects this plan documented were fixed ahead of the rest of the plan, because they were
blocking a collaborator's commits and the owner set a 30-minute ceiling.

- **Link 6 (scope)** — fixed in `scripts/validate-plan-closure.mjs`. `Cx` now evaluates a plan
  against a walk artifact **only when the plan declares ownership** of it: the path appears in a
  Per-Identity Satisfaction deliverable cell, or in a checklist item declaring emission/authorship.
  Design chosen deliberately from this plan's three candidates (option 2), with blast radius
  machine-measured across 648 plans, not estimated. Evasion is closed by the existing C6 interlock.
- **Link 7 (sync)** — fixed in `scripts/walk-coverage/verify-denominator.mjs`. The unresolved-probe
  count now subtracts keys the markdown Coverage Manifest already dispositions with a **valid**
  token, instead of reading `derived_types[k].probe` alone. Only valid dispositions subtract;
  malformed rows and short `out-of-scope` reasons do not.
- **The debt this plan feared was measured and is zero.** Per-key analysis of `PLAN_NM3344`'s three
  artifacts found 23 of 23 and 24 of 24 unresolved keys already dispositioned in markdown, with
  **zero** genuinely undispositioned controls. This plan's Link 7 text says correcting the artifact
  would expose "genuine coverage debt that honesty exposes" — measurement says there is none for
  these artifacts. The artifact's `Coverage_Ratio: 29/29` / `CrossCheck: clean` header is therefore
  consistent with its own data once the reader is fixed; the header is not a fake green.
- **Link 8 was already fixed** before this session — the parity line now goes to stderr and
  `--json` stdout parses cleanly. Verified 2026-08-17. Do not re-fix it.

**Cross-family review — COMPLETE, verdict ACCEPT** (`p76-cxreview-0817b`, opus-4.6, 2026-08-17; first attempt died on a GitHub 503 and was retried).

The reviewer was told to attack the laundering path directly, and did. Its strongest attempt: a plan
owns artifact X; X carries 5 unresolved controls whose manifest rows say `affordance-probed: none`
with **no** `provenance: live` token. Change B does subtract those 5 (they satisfy
`validManifestDisposition`), so the unresolved-probe count goes clean — **but the plan still fails**,
because `Cx` aggregates two independent findings (`validate-plan-closure.mjs:863,878`): the coarse
"is this control addressed at all" count, and `coverageVerdict` (`coverage-manifest.mjs:567-572`),
which independently sets `provenanceFail` on an observation-claiming row lacking provenance. The
gates are layered — a fabricated observation passes the subtraction and dies at the provenance
sub-gate. **No laundering path reaches green.** This answers the condition-5 question that was open
when the fixes were pushed.

**Residual, accepted knowingly**: `isArtifactOwner` detects checklist ownership via the verbs
`Emit|Update|Author|Produce`. A plan using "Generate" / "Create" / "Write", or declaring ownership
in prose, is not detected by that function. The C6 interlock covers it — a genuinely-owned artifact
must appear in the Per-Identity matrix as a concrete deliverable, and dropping it there to dodge Cx
trips C6 instead (proven by the `evasion-c6-plan.md` fixture). Worth widening the verb set if a real
plan ever slips through; not worth a gate change on speculation.

Owner verification that also happened, so the review was a second opinion rather than the only net:
   per-plan re-runs, the guard fixture (15/15, including a real-data case where 4 undispositioned
   sort buttons still fire the gate), validator self-test 72/72, and a settled-tree re-measure
   after an earlier measurement was invalidated for being taken mid-write.
