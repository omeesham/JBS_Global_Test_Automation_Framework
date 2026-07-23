# PLAN — Unique-Case Coverage Floor (right unit + reachable states + doctrine enforcement)

**Status**: Pending
**Priority**: Critical
**Created**: 2026-07-22
**Identity**: OWNER (framework code + rules); GIVER for the §2 taxonomy additions
**Parent**: (none — peer of `PLAN_WALK_DEPTH_GATE.md`)
**Depends on**: `PLAN_WALK_DEPTH_GATE.md` closure (Phases 3–4 landed; gate proven 8/8 on the NM-2271 replay)
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: multi-rule judgment across LR-062/LR-065/LR-069/§20 + a convicted-prior-fix trial + a closure gate that changes what "100% covered" means repo-wide.
**PermissionMode**: acceptEdits
**BrowserTool**: playwright-cli (Phase 5 live re-walk only; Phases 1–4 are repo-local)

---

## Context

`PLAN_WALK_DEPTH_GATE.md` proved its own machinery against the real NM-2271 artifact: 8/8 replay
matched, all five mutants caught, the four named gaps (Labor 28 · MaxDisc 11 · Price 8 · 38 missing
receipts) fire. That work is sound and stays.

Then a live walk of the same surface was run, and the numbers it produced are the reason this plan
exists. Office 4107, location 1101 driven, non-ALL currency — machine denominator **504**:

| bucket | count | share |
|---|---|---|
| grid rows (`tr`) | 414 | 82% |
| buttons | 57 | 11% |
| table chrome (`th`) | 19 | 4% |
| nav links | 7 | 1% |
| **genuine editable form fields** | **6** | **1.2%** |
| static text | 1 | 0.2% |

Six editable fields, on a surface whose entire purpose is editing Override Price, Max Discount,
currency, location and per-tab Equipment/Labor pricing. Four independent read-only research seats
were dispatched to establish why. Their findings, each with `file:line` provenance:

| # | Finding | Evidence |
|---|---|---|
| F1 | The blocking gate counts **control archetypes** (DOM elements after collapse). The case-row emitter counts **case classes**. They are different units and the wrong one blocks. | verdict `coverage-manifest.mjs:825`; emitter `emit-case-rows.mjs:242` |
| F1b | **Correction to F1, found by the audit seat.** `checkCaseRowDisposition()` **is** called unconditionally and **is** wired into the blocking verdict (`coverage-manifest.mjs:893-896`, under a comment that says so at `:886`; failures push into `reasons`, which decides `complete` at `:941`). It is not unwired — it is **neutered by the ramp**: `pass = reasons.length === 0 \|\| rampMode === 'announce'` (`:737`), and `depth_gate_mode` is `"announce"`. The right check runs, in the right place, and is structurally forbidden from ever failing. | `coverage-manifest.mjs:886, 893-896, 737, 941`; `.claude/guardrail-config.json:43` |
| F2 | **490 of 504 entries are `probe: 'unresolved'`, `evidence: ''`** — and that costs the walk nothing. `entryKeyToSelector()` resolves only `testid:` / `id:` / `name:` keys; every `struct:` key returns null, so the field-type probe can never target it. | `enumerate-page.mjs:312-318` |
| F3 | The primary editable controls **do not exist in the resting DOM**. Override Price / Max Discount are `div[role="button"]` cells that reveal a `spinbutton` on click. The resting enumeration never sees them; `struct:` key dedup collapses identical-valued cells into one entry. | `deep-pierce.mjs:170-178`; page-object docstring `:23-27` |
| F4 | **40 of 55 prescriptive rules in this repo have no machine enforcement** (8 floor / 7 detector / 40 none). Top unenforced by blast radius: LR-065 surface-family coverage, §20 state-graph exhaustion, FCG §2 taxonomy, §20 effect-observation. *Corrected by the audit seat: the census worker's narrative said 32-of-47 and its `census.json` carries 55 rows with 55 unique IDs. The gap is **8 rules missing from the narrative**, not duplicates — so the honest number is worse than first reported.* | `dc-t1-01/census.json`; `dc-audit-02/task2-census.verify.txt` |
| F4b | **The census is not yet a trustworthy seed.** Of 5 spot-checked `enforced_by` claims: 2 correct, 2 partially correct (no `:line`), **1 flatly wrong** — LR-034 claims `scripts/check-bug-baseline.mjs`, which **does not exist**; the real gate is `.claude/hooks/lib/check-bug-baseline.mjs` via `bug-baseline-gate.sh`. A ledger seeded from this without re-verification would enshrine a false "enforced" claim. | `dc-audit-02/task2-spotchecks.verify.txt` |
| F5 | Walks are gated for **denominator completeness, never defect-harvest completeness**. The doctrine already demands a findings section in **8 separate places**; enforcement is `NONE` in all five candidate scripts. Result: `## Known App Bugs` present in 23 artifacts, `## Observations` in 5, and **19 of 47 have neither** — a written rule violated in 40% of artifacts at zero cost. | doctrine `inventory.md:125`, `field-inventory-spec.md:110-114`, `AUDIT.md:17` + 5 more; enforcement `dc-t3-01/task2-no-bugsection-check.verify.txt`; census `task3-format-profile.verify.txt` |
| F6 | The comfortable explanation — "the surface is clean" — is **refuted**: `corporate-pricing-override` has both with-findings and without-findings artifacts, and the split tracks neither author nor tooling. | `dc-t3-01/task3-surface-mix.verify.txt` |
| F7 | **11 of 12 ramp knobs in this repo have never been armed.** Exactly one gate ever reached `deny` (`coverage_mode`, `coverage_ramp_complete: true`). Every other gate — depth, reject-oracle, toothless-surface, md-first, mistake-ledger, uplink, reviewer-skill, pinj ×2, test-status, identity — sits in `announce` with `ramp_complete: false`. LR-069 §3.3 mandates landing at `announce`; **nothing anywhere forces the promotion.** | `.claude/guardrail-config.json`, `closure-config.json`, `identity-gate-config.json` — mode + `ramp_complete` census |
| F8 | **The self-expiring ramp exists, works, and nothing calls it.** `scripts/check-ramp-expiry.mjs` correctly reads `*_ramp_target`, derives `_mode` + `_ramp_complete`, and fails a ramp past due and incomplete. It is exposed as `npm run check:ramp-expiry` (`package.json:120`) and invoked by **zero** callers — absent from `pipeline:validate` (`:53`), from `check:spec-quality` (`:118`), from `.githooks/`, and from `.claude/hooks/`. Not a dead export: a **live gate outside every chain**. | `scripts/check-ramp-expiry.mjs:76-95`; `package.json:53,118,120`; `dc-audit-01b/task1-ramp-consumer.verify.txt` |
| F8-corr | *Correction, on the record.* This plan first claimed the ramp checker had no consumer at all, from `grep -rln ramp_started scripts/ .claude/hooks/` returning empty. The checker keys on `*_ramp_target`, not `ramp_started` — so the grep was true and the conclusion was false. An audit seat refuted it. **Concluding absence from one key's absence is the same error class this plan exists to prevent**, and it is recorded rather than quietly patched. | `dc-audit-01b/result.md:6` |

### The diagnosis

The unit is wrong — the guarantee counts what is **cheap to enumerate** (DOM elements at rest) instead
of what must be **tested** (unique case classes across reachable states), so it can read 100% while the
primary editable controls were never seen, never typed into, and never observed for effect.

But F1b, F7 and F8 expose something larger, and it is the real disease. **This repo reliably produces
enforcement artifacts and reliably fails to arm them.** The same shape at three successive layers:

| Layer | Leak | Evidence |
|---|---|---|
| 1. Doctrine → mechanism | 40 of 55 prescriptive rules have no mechanism at all | F4 |
| 2. Mechanism → armed | 11 of 12 ramp knobs never promoted; one gate in the entire repo has ever reached `deny` | F7 |
| 3. Ramp metadata → consumer | `ramp_started` written for 8 gates, read by zero code — the "self-expiring ramp" expires nothing | F8 |

`checkCaseRowDisposition` is the specimen that proves all three are one disease: **the correct check,
counting the correct unit, wired into the correct verdict path, permanently forbidden from failing.**
Writing it was not the hard part. Arming it is, and nothing in this repo has ever made that happen.

A gate that cannot fail is indistinguishable from no gate. An `announce` ramp with no forcing function
is not a cautious rollout — it is a gate that was built, celebrated, and switched off.

### The principle this plan adds

`PLAN_WALK_DEPTH_GATE.md` established: *the machine owns every denominator AND every numerator.*
That principle was correct and is not being revised. What it left open is the **unit**:

> **The unit of coverage is a unique case class, not a DOM element. A grid with 100 rows earns the
> grid's unique behaviours — not one test repeated 100 times. A numeric field earns its full case-class
> set — not a single presence check.**

Two seats independently computed the honest unique-case denominator for this surface and **disagreed**:
`dc-t2` says ~37 test-generating units, `dc-t4` says 41–107 (likely ~79). Both are grounded in real
artifacts; they are 2× apart. **This plan does not adjudicate that in prose.** Adjudicating it in prose
would rebuild the exact hole it exists to close. The machine computes both paths and Phase 3 requires
them to reconcile — a disagreement is a gate failure, not a judgement call.

### Ambiguity must cost more work, never less

F2 is the sharpest instance of the failure shape: 97% of entries carry `probe: unresolved`, and an
unresolved probe currently costs the walk **nothing** — it passes as silently as a resolved one. Every
mechanism in this plan inverts that. Unknown, unreachable, and unprobed states must all be *more*
expensive to leave than to resolve.

---

## §Prior-Fix Trial (LR-069 §3.5 — mandatory; this is a recurrence)

Walk completeness has now failed **three times** in areas that already carried a "permanent" fix. Each
prior fix goes on trial before any new mechanism lands. Layering on an unconvicted-but-failed fix is
forbidden.

| # | Prior fix | (1) What it did to prevent this class | (2) Why it failed HERE | Verdict |
|---|---|---|---|---|
| P1 | **LR-062 machine denominator** (`9e0b47d3`) | Made the machine enumerate the denominator; forbade self-asserted coverage | `scoped-wrong` — it fixed *who owns* the denominator (machine — correct, keep) but never *what unit it counts*. Element-at-rest census; 490/504 unresolved at zero cost | **CONVICTED** — rewired in Ph1+Ph2, principle survives |
| P2 | **`checkCaseRowDisposition()`** (depth-gate Ph2) | Added a check counting the correct unit (case classes), correctly wired into the blocking verdict | `dead/never-fired` — **but not for the reason first assumed.** The wiring is correct (`:893-896`). The check is neutered by `depth_gate_mode: announce`, under which `pass` is hard-coded true (`:737`). It has never been capable of failing anything | **CONVICTED** — mechanism and wiring both sound; the *arming* never happened. Fixed in Ph1 by completing the ramp, not by rewiring |
| P6 | **The "self-expiring ramp"** (depth-gate Ph6, authored this session) | Makes an un-promoted ramp expire rather than idle forever — and it genuinely does this correctly | `dead/never-fired` — **not because it is wrong, but because nothing calls it.** `check-ramp-expiry.mjs` is a working gate sitting outside `pipeline:validate`, `check:spec-quality`, and every hook | **CONVICTED — narrowly.** The logic SURVIVES intact; only the wiring is convicted. Fixed in Ph1.3 by adding it to a chain, which is a one-line change. *(An earlier draft of this plan convicted the logic itself on a bad grep — see F8-corr.)* |
| P3 | **FCG §2.1 rejection oracle** | Prescribed the rejection-affordance oracle | `prose-not-mechanism` — shipped carrying `ENFORCED BY CODE: no` verbatim | **CONVICTED — already rewired** by depth-gate Ph3 receipts. No new work; cited as the precedent that prose alone never fires |
| P4 | **LR-065 surface-family coverage** | Prescribed grid/list/table behaviour cases folding into the 100% gate | `prose-not-mechanism` — census ranks it the #1 unenforced rule by blast radius | **CONVICTED** — rewired in Ph3 |
| P5 | **AGENT_SHARED §20 state-graph exhaustion** | Prescribed opener BFS into dialogs / menus / popovers / edit modes | `prose-not-mechanism` — nothing enforces the BFS; edit-mode controls never enter the DOM, so they never enter the denominator | **CONVICTED** — rewired in Ph2 |

Nothing here is retired-and-removed: every convicted fix had the right *intent* and a rewireable form.
What IS removed is the wiring that let them idle — enumerated in §Stale-cleanup.

---

## Phase 1 — Arm the gate that already exists

**Defect**: F1b + F7 + F8. The correct check is written, wired, and switched off — and the mechanism
meant to prevent exactly that is itself dead.

**This phase writes almost no new logic.** That is the point. The expensive work was already done and
then left disarmed; the fix is arming it and making disarmament visible.

1. **Complete the depth-gate ramp.** Flip `depth_gate_mode` `announce` → `deny` against its own recorded
   criterion (`depth_gate_ramp_note`: zero false positives across 5 clean sessions). Record
   `ramp_flipped` and set `depth_gate_ramp_complete: true`. If the criterion is not yet met, the gate
   stays `announce` **and** Phase 1.3's forcing function makes that state visible and dated rather than
   permanent — a ramp may be incomplete; it may not be silent.

   **Correction (council 2026-07-22)**: the defense seats were right that these gates are NOT
   neglected — `depth_gate_ramp_started` is `2026-07-21`, one day before this plan, with a real
   `2026-08-11` target. LR-069 §3.3 *mandates* landing at `announce`. So the honest label for the 7
   short-circuited checks is `INERT-IN-RAMP`, not `INERT-UNARMABLE`, and this item is a *ramp
   completion*, not a rescue. What makes the difference between the two is item 3 actually landing —
   which is why its acceptance is now mechanical.

1b. **The ramp target gets a ratchet.** (Council finding — missed by BOTH the prosecution and the
   defense's first pass.) `depth_gate_ramp_target` is a hand-written string in a file any agent can
   edit. `git commit -m "extend ramp 30 days"` moves every deadline, and `check-ramp-expiry.mjs` fires
   on `today > target` with no memory of what the target used to be. **A deadline that the deadline's
   subject can move is not a deadline.** Add to `check-ramp-expiry.mjs`: a target may only move
   *earlier*, never later, unless `*_ramp_extended_by` + a reason ≥20 chars is recorded alongside it;
   and `ramp_target − ramp_started` may not exceed 30 days. Both are mechanical, both fail the script.

1c. **Word-valued ramp targets are a silent hole.** `check-ramp-expiry.mjs:78` skips any target that
   is not `YYYY-MM-DD`. Four live ramps (`ramp_target: "deny"`, `mistake_ledger_ramp_target: "deny"`,
   `stall_guard_ramp_target: "kill"`, `reviewer_skill_compliance_ramp_target: "bounce"`) are therefore
   invisible to the checker **forever** — worse than the walk gates, which at least have dates. Either
   give each a date target or make a non-date `*_ramp_target` a hard failure of the script. Silently
   skipping them is the behaviour that let them sit 9–12 days unexamined.
2. **Retire the `off` state.** A knob that can disable the primary coverage gate is the hole, not the
   ramp. Remaining states: `announce` | `deny`. (Six checks currently branch on `rampMode === 'off'`;
   each becomes unreachable and is removed, not left as sediment.)
3. **Put the ramp forcing function into a chain — it already exists.** `check-ramp-expiry.mjs` already
   fails a ramp past its `*_ramp_target` with `*_ramp_complete` unset. It is wired to nothing. Add
   `check:ramp-expiry` to `pipeline:validate` (`package.json:53`) and to this plan's own acceptance
   command. **This is a one-line change and it is the highest-leverage line in the plan** — every other
   gate in the repo inherits a deadline the moment it lands. Un-promoted is an acceptable state;
   un-promoted *and unexamined* is not.
4. **Demote the element Coverage_Ratio** from proof-of-completion to a reported supporting signal. Rewire
   the verdict line rather than leaving a computed number nobody blocks on.
5. **Silent-pass guard**: a case-class check evaluating **zero case rows** on a subject surface FAILS,
   regardless of ramp mode. Absent (`undefined`) and empty (`[]`) are distinct and both fail, with
   distinct messages — they have different causes.

**Acceptance**: a synthetic manifest with 100% element disposition and **zero** case rows FAILS (it
passes today, because `pass` is hard-coded true under `announce`). The NM-2271 Class-1 replay still
reports 8/8 and all four named gaps. And item 3's wiring is verified **mechanically, not by grep**:

```bash
node -e "const p=require('./package.json'); if(!p.scripts['pipeline:validate'].includes('check:ramp-expiry')) { console.error('FAIL: check:ramp-expiry not in pipeline:validate'); process.exit(1); } console.log('OK')"
```

> **This acceptance line was itself a defect until 2026-07-22 (council finding).** It previously read
> "`grep -rln ramp_started scripts/ .claude/hooks/` returns at least one consumer." That test was
> **unsatisfiable by the correct fix and trivially satisfiable by a fake**: `check-ramp-expiry.mjs`
> contains zero occurrences of `ramp_started` (it keys on `*_ramp_target`), so wiring the real checker
> would never make the grep pass — while any cosmetic mention of `ramp_started` anywhere under
> `scripts/` would. The root cause is recorded as **F8-corr**: an earlier draft convicted the ramp on a
> bad `ramp_started` grep, the conviction was corrected on the record, and the *dead claim was then
> encoded into an acceptance criterion anyway*. A refuted claim must be purged from every downstream
> artifact, not just the finding that stated it.

---

## Phase 2 — Reachable states enter the denominator, and unresolved costs work

**Defect**: F2 + F3. The highest-risk controls are invisible, and invisibility is free.

1. **Unresolved-probe ratio becomes a failing condition.** Any surface whose entries exceed a configured
   unresolved fraction FAILS with the count and the offending keys named. Lands `announce` per LR-069
   §3.3 with `ramp_started` / `ramp_target` / `ramp_note` recorded in `.claude/guardrail-config.json`;
   ramp criterion is stated in the note, not left to memory.
2. **`struct:` keys become resolvable or become a finding.** Extend `entryKeyToSelector()` to resolve
   structural keys via their recorded DOM path. Where a key genuinely cannot resolve, it is recorded as
   an explicit `unresolvable` disposition with a reason — never a silent skip. This is the F2 inversion:
   the walk pays for what it could not reach.
3. **§20 state-graph exhaustion becomes a denominator input.** Edit-mode, dialog, menu and popover states
   are enumerated by machine and their controls join the denominator. A registered surface that declares
   no reachable-state expansion, and whose enumeration finds interactive containers it never opened, FAILS.
4. **Per-cell granularity survives collapse.** Archetype collapse must not merge two cells that differ in
   *column* (Override Price vs Max Discount) merely because they display the same value. Collapse keys
   incorporate column identity; the existing value-based dedup stays for genuine data-volume repetition.

5. **Break the required-states tautology.** (Council finding — the sharpest hole found, and no phase
   of this plan addressed it before.) Three defects compose into a check that *cannot fail*:
   - `enumerate-page.mjs:853` hardcodes `resting` into the walked set:
     `['resting', ...report.branches.filter(b => b.ok && b.branch)]`. Resting is **asserted, never
     observed** — a walk that begins on an already-open dialog still reports `resting` as walked.
   - `module-config.mjs:17-28` declares `corporate-pricing-strategy`, `-detail`, and `-new-pricebook`
     as `requiredStates: [{ label: 'resting' }]`, justified only by a hand-written comment.
   - The toothless-surface meta-gate (`enumerate-page.mjs:449`) fires only on
     `rs.length === 0 && openerCount === 0` — so a one-state surface **passes the very gate built to
     catch unverifiable denominators**.

   Net effect: for those three surfaces, `verify-denominator` compares an auto-inserted `resting`
   against a hand-declared `resting`. It is a tautology. Fixes, all mechanical: (a) `resting` enters
   the walked set only when the enumerator observed it, same as every other branch; (b) the meta-gate
   threshold becomes "no *non-resting* required state AND no opener patterns" so resting-only counts
   as toothless; (c) a hand-written justification comment is not evidence — a resting-only declaration
   must cite the enumeration run that found zero openers, or it fails.

6. **An unregistered module fails instead of skipping.** `verify-denominator.mjs:292` reads
   `MODULE_REQUIRED_STATES[moduleName]?.requiredStates ?? null` and then performs no check when the
   result is null — the code comment says so outright: *"no check performed."* A module nobody added
   to the map is a module with no required-state verification at all, which is vacuous-on-zero at the
   surface level. Unknown module → FAIL naming the module, never a silent pass.

**Acceptance**: a re-enumeration of Corporate Pricing Override surfaces Override Price, Max Discount and
per-row Active as typed, probeable controls. The unresolved fraction on that surface drops from **97%**
and the residue is explicitly dispositioned. Both numbers are recorded from a real run, not asserted.

---

## Phase 3 — The denominator is computed on two paths and must reconcile

**Defect**: the 37-vs-79 disagreement, and F4's #1 unenforced rule.

1. **Path A — archetype expansion**: for each control archetype, expand to its case classes per the
   `field-case-generation.md` §2 taxonomy.
2. **Path B — case-row census**: count the case rows the emitter actually produced.
3. **Parity check**: A and B must agree **exactly — tolerance is zero**. Disagreement FAILS and names
   both numbers and the archetypes that differ. Neither seat's figure is written into the plan or the
   code as a constant — the machine computes it and the machine reconciles it.

   **Both providers convicted the earlier wording** ("agree within a declared tolerance"), and they
   were right: it named no number and no one to declare it, so an executor could set the tolerance to
   whatever made the run pass. It is now zero, and a zero tolerance needs no declarer. If a genuine
   archetype legitimately expands to a different count on the two paths, that is a **taxonomy defect
   to fix**, not slack to budget for — record it as a named exemption with a reason, which Phase 4's
   ledger then has to carry. Exemptions are visible and counted; tolerance was invisible and free.
4. **LR-065 surface axis becomes a computed denominator component** (Path A term two): grid / list / table
   surfaces contribute their behaviour cases — sort, filter, paginate, empty state, single row, overflow,
   selection, row action — as first-class denominator entries. This is the 414-row correction: the grid
   earns its behaviours once, not one test per row.
5. **Two new §2 templates** (GIVER identity — the taxonomy is a pipeline artifact):
   - **Click-to-edit grid cell** — activation (click non-input) → input materializes → commit (Enter/Tab)
     → revert (Escape) → dirty-state interaction. The existing spinbutton template covers *values*; it
     does not cover this *lifecycle*, and the lifecycle is the primary user action on this surface.
   - **Drag-and-drop source row** — drop target, rejected drop, ordering, cancel.
   - Column-resize handles are deliberately **not** templated: no data mutation, LOW severity — recorded
     as an explicit unenforced decision per Phase 4 rather than silently omitted.

**Acceptance**: `Path A == Path B` **exactly** (zero tolerance; any divergence is a named, counted
exemption per item 3, never slack) on Corporate Pricing Override, with both numbers
printed. An archetype present on the surface with no §2 template FAILS the parity check rather than
contributing zero case rows silently.

---

## Phase 4 — Every prescriptive rule carries an enforcement decision

**Defect**: F4 + F4b — 40 of 55 rules unenforced, the census that found them is itself partly wrong, and
nothing prevents a 41st.

> An independent audit seat judged this phase **GAMEABLE** as first written, with the cheapest bypass
> being *"classify a new MUST-rule as `UNENFORCED: S3` (self-assigned) and ship without wiring any
> blocking gate."* Items 2–5 and 7 below are that seat's four hatches closed. The verdict is recorded
> rather than quietly fixed, because a plan about unenforced doctrine should show its own audit trail.

1. **Doctrine-enforcement ledger.** Every prescriptive rule (any statement constraining what counts as
   complete or correct work) carries exactly one of:
   - `ENFORCED BY: <check-file>:<line>` — subject to the **three-part call-site test** in item 2.
   - `UNENFORCED: <Sev> — <reason>` — an honest, recorded decision, **constrained by items 3–5**.

2. **The call-site test has three parts, and the third is the one everything fails.** An audit seat
   found `ENFORCED BY` is fakeable by wrong anchors, unreachable paths, or non-blocking modes. So the
   ledger check verifies all three, and a claim passing only the first two is `UNENFORCED`:
   - **(a) the anchor exists** — the file and line are real. *Already violated: the census claims
     `scripts/check-bug-baseline.mjs` for LR-034; that file does not exist (F4b).*
   - **(b) it is reachable** from a real entrypoint — `package.json` script, `.githooks/*`,
     `.claude/settings.json` hook, or a closure-gate import. *Dead export ≠ enforcement, shipped twice.*
   - **(c) it can actually fail the parent verdict in its current mode.** A check wired into the verdict
     but pinned to `announce` returns `pass: true` unconditionally and enforces nothing — that is F1b,
     found independently by the dispatcher and by the audit seat. **A gate that cannot fail is not a
     gate**, and the ledger records it as `UNENFORCED (disarmed)`, not as enforced.

3. **`UNENFORCED` is not a free-text escape hatch.** A reason string any prose satisfies would let an
   agent mark all 40 rules unenforced and pass — rebuilding the exact trust vector this plan removes.
   The marker is bound to the LR-069 §3.1 severity rubric:
   - **S3 only** (judgment / heuristic / false-positive-prone / genuinely unenforceable) may be
     `UNENFORCED` **permanently**. LR-068 is the standing precedent for a deliberate no-gate rule.
   - **S0 / S1 / S2** with no enforcement must name a **pending recipient** — a `plans/pending/` file
     with a grep-verifiable line item per LR-040(b). Not a reason; an owner.

4. **Close the two hatches inside item 3** — the audit seat's cheapest bypass was
   *"self-assign `UNENFORCED: S3` and ship"*, and it is right that LR-069 §3.1 lets the same agent that
   logs a rule assign its severity (`guardrail-policy.md:26`):
   - **S3 is not self-assignable by the rule's own author.** It requires a second, cross-provider
     adjudication — the same two-chiefs posture used everywhere else in this repo.
   - **The S3 share is a monitored ratio, not just a printed one.** A census whose S3 count suddenly
     explains everything is the signature of gaming; a spike past a declared threshold FAILS.
   - **Recipients expire.** LR-040(b) checks that a recipient *exists*, never that it *moves* — and
     today exactly **one** `SUBPLAN_GUARDRAIL_*` stub exists, pending 5 days. A recipient stale past its
     SLA fails the same gate that accepted it. Otherwise "name an owner" is just debt relocation.

5. **Scope cannot be dodged by wording.** "Prescriptive rule" defined in prose lets a MUST-statement
   escape the census by phrasing. Rules carry explicit metadata (`rule-id`, `prescriptive: true|false`);
   a modal constraint (MUST / MUST NOT / required / forbidden) with no metadata FAILS rather than being
   silently uncounted.
6. **The floor**: a prescriptive rule with neither marker FAILS the ledger check. **Adding doctrine
   without an enforcement decision fails the gate.** This is what generalizes past NM-2271 — the
   alternative is bolting on one more incident-shaped detector and waiting for the next incident.

7. **Doctrine retires too — the ratchet turns both ways.** The audit seat found this plan as first
   written was **add-only**: LR-069 §3.4 demotes and deletes *gates* on fire telemetry, but nothing ever
   removes *stale prescriptive prose*, so doctrine accumulates forever while gates churn. LR-069 §3.4
   explicitly forbids mechanisms that only grow — *"gates exist to make quality CHEAP, not to make work
   slow."* So the ledger carries the symmetric trigger: a rule whose enforcement has not fired in the
   §3.4 window, with no class recurrence, is demoted or deleted along with its check. **A rule nobody
   has broken in 90 days is not proof the rule works; it is a candidate for removal.**

8. **Stale-`yes` sweep.** A stale `ENFORCED BY CODE: yes` is worse than a `no`, because it stops anyone
   looking. Every existing marker is verified against its claimed call site; unverifiable ones are
   corrected to `UNENFORCED` with a severity and reason.
9. **Re-verify the census before seeding — it is NOT sound as-is.** The audit seat spot-checked 5
   `enforced_by` claims: 2 correct, 2 missing the `:line` the ledger contract requires, **1 pointing at a
   file that does not exist**. Seeding from it unmodified would enshrine a false "enforced" claim, which
   is worse than a known gap because it stops anyone looking. Every one of the 55 rows re-runs through
   the item-2 three-part test before entering the ledger. The 47-vs-55 narrative gap is resolved (cause:
   8 rules omitted from the summary, confirmed — not duplicates).
10. **Resolve the contradiction the census found**: `clients/encore/CLAUDE.md:55-57` (`.env.e2e` CI-only,
   `.env.local` gitignored) vs `:130` (`.env.local` tracked and ships). Two documents prescribing
   incompatible things is its own silent failure. `.env.local` **is** deliberately tracked so colleagues
   get a working setup — `:55-57` is the stale statement.

**Acceptance**: the ledger check runs in `check:spec-quality`; every prescriptive rule resolves to
`ENFORCED BY` (with a verified call site) or `UNENFORCED` (with a reason); the count of each is printed.

---

## Phase 5 — Observations are captured and escalated (NOT a bug quota)

**Defect**: F5 + F6. The doctrine is already written in 8 places and enforced in none, so 19 of 47
artifacts carry neither required section.

**The distinction that governs this phase, verbatim from the owner directive**: *bugs are not something
that are always to be caught — if there are no bugs, they won't be caught. But an agent seeing bugged
behaviour must be forced to remember and escalate.* A bug quota would manufacture findings; that is
worse than none. What gets enforced is **capture and escalation of what was observed**.

**This phase authors no new doctrine.** `.claude/rules/inventory.md:125` already mandates `## Observations`
with `### Bugs / Defects` + `### Suggestions / Improvements` and an explicit `none`;
`field-inventory-spec.md:110-114` already mandates `## Known App Bugs`; `AUDIT.md:17` already says zero
findings on non-trivial work must be justified. Every word needed already exists. Only the enforcement is
missing — which is precisely the F4 pattern, and the reason Phase 4 is the durable fix and this phase is
its first instance.

1. **Enforce the section that already exists.** A walk artifact missing its required findings section
   FAILS validation. `none` remains a valid and expected value — typed explicitly, never blank. Blank
   fails; a walk that observed nothing says so on the record and is answerable for it.
2. **Normalize the two competing formats.** 23 artifacts use `## Known App Bugs`, 5 use `## Observations`,
   19 use neither, and ad-hoc `BUG-` references appear in body text. The validator accepts one canonical
   shape; existing artifacts are migrated, not grandfathered into permanent ambiguity.
3. **Record the effect signals that are already available.** Branch-level `ok:false` / `error` and
   `addedKeys` deltas already exist for configured opener probes (`enumerate-page.mjs:551, 556, 583, 667`)
   — that is "control did not respond," detectable **today**, and currently discarded. Surface it into
   Observations instead of dropping it.
4. **Escalation path.** An observation with a defect signature routes to the existing bug-filing path, or
   to an explicit `flagged — not filed` disposition with a reason (per `feedback_discussion_item_not_bug.md`:
   empty-everywhere + no-UI-path + no-Jira = flag, don't file). An observation recorded and then going
   nowhere is the same hole one level up.
5. **Honest detectability boundary**, recorded in the artifact spec rather than hidden — an automated
   harvest that finds only trivia while claiming to replace manual QA is worse than one that states its
   limit:

   | Defect class | Status | Note |
   |---|---|---|
   | Control does not respond to interaction | **detectable today** | limited to configured opener scope; signal exists and is discarded |
   | Out-of-range value accepted without rejection | **covered** | depth-gate Phase 3 rejection receipts |
   | Value does not persist across reload | **needs new probe — structurally blocked** | the click denylist (`enumerate-page.mjs:340`) deliberately blocks `save\|submit\|confirm\|delete`. A persistence probe needs a scoped, opt-in mutation path, not a denylist hole. Out of scope here; recorded, not hand-waved |
   | State change fails to propagate to a dependent control | needs new probe | only key-count deltas tracked today, not semantic dependency |
   | Control permanently disabled with no explanation | needs new probe | `disabled` is captured; "no explanation" is not |
   | Error appears with no associated field | **human-only** | requires contextual judgement; marked as such, never claimed |

**Acceptance**: a live re-walk of Corporate Pricing Override emits an artifact whose findings section is
populated with a typed disposition; an artifact with a blank or missing section FAILS validation; the
19-of-47 non-conforming artifacts are migrated to the canonical shape.

---

## Phase 6 — The dependent-effect probe (the audit's named next miss)

**Defect**: an adversarial seat was asked to name one plausible coverage failure that **all five phases
would pass green**, and it found one:

> Edit Override Price / Max Discount → save → reload. The value persists, but the displayed **Current
> Price**, or the downstream **Location Pricing export/import** value, does not update consistently.
> Phase 1 checks case-row disposition ✓. Phase 2 sees typed controls ✓. Phase 3 counts case classes ✓.
> Phase 4 records doctrine decisions ✓. Phase 5 **explicitly scopes dependent propagation out** as
> needs-new-probe. Five green phases, real defect shipped.

That is a correct finding, and Phase 5's honesty about the limit does not make the hole smaller. On a
surface whose entire purpose is pricing that propagates, "we deliberately don't check propagation" is
the gap, not a mitigation. So it comes in scope.

1. **A scoped, opt-in mutation path.** The click denylist (`enumerate-page.mjs:340`) blocks
   `save|submit|confirm|delete` for a good reason and is **not** loosened. Instead a dependent-effect
   probe runs as a distinct, explicitly-invoked mode against **designated test data only** — the six
   e2e offices (4104 / 4107 / 9220 / 9311 / 2463 / 8843). Enumeration stays read-only; this is a
   separate, consenting operation.
2. **The assertion is before/after on a *different* control than the one edited.** Edit the source
   field, save, reload, and compare the dependent value. A probe that only re-reads the field it just
   wrote proves persistence and nothing about propagation — that is the weaker check wearing this
   check's name.
3. **Declared dependency pairs.** Each surface declares its `source → dependent` pairs (Override Price →
   Current Price; Override/Max Discount → Location Pricing export value). A surface with editable
   pricing fields and **no declared pairs** FAILS — the same fail-closed posture as Phase 2: an
   undeclared dependency costs work, never silence.
4. **A broken pair is an Observation, routed via Phase 5.** This is where the two halves meet: Phase 6
   produces the signal, Phase 5's capture-and-escalate path carries it. Neither is useful alone.

**Acceptance**: the probe runs against office 4107, drives one real dependency pair end-to-end, and
records the before/after on the dependent control. A surface with editable pricing and zero declared
pairs FAILS. The probe never runs outside the six designated offices.

---

## Stale-cleanup (LR-050 — in-scope, not deferred)

Changing what the gate counts makes specific machinery stale. Each is removed or rewired in this plan,
per LR-069 §3.5 (a convicted fix is never left idling as sediment):

| Stale item | Disposition |
|---|---|
| `depth_gate_mode: off` state + the **six** `rampMode === 'off'` early-return branches in `coverage-manifest.mjs` (`:376, :563, :610, :694, :998` + type-binding) | **Removed** — Phase 1.2. A knob that disables the primary gate is the hole. The branches go with it; unreachable code that documents a removed escape hatch is how the hatch comes back |
| `check:ramp-expiry` — a working gate with zero callers | **Wired into `pipeline:validate`** — Phase 1.3. The logic is sound and stays; only its absence from every chain is the defect |
| Element `Coverage_Ratio` as verdict input | **Rewired** — Phase 1.2, demoted to reported signal; the verdict line is changed, not left computing a dead number |
| Any check passing on zero rows | **Swept** — two were fixed during depth-gate work (`check-reject-oracle.mjs`, `validate-plan-closure.mjs`); Phase 1.3 sweeps the rest and the silent-pass guard becomes the standing rule |
| `ENFORCED BY CODE: no` markers superseded by depth-gate receipts | **Corrected** — Phase 4.3, to `ENFORCED BY: <file>:<line>` with a verified call site |
| `clients/encore/CLAUDE.md:55-57` `.env.local` statement | **Corrected** — Phase 4.5, contradicts `:130` |
| 19 walk artifacts carrying neither required findings section, + 2 competing formats (`Known App Bugs` ×23 / `Observations` ×5) + ad-hoc in-body `BUG-` refs | **Migrated** — Phase 5.2, to one canonical shape. Not grandfathered: a permanently-exempt legacy tier is how the next census finds the same 19 |
| Research artifacts under `.claude/state/ua-worker/dc-t*/` | **Retained** — they are this plan's evidence base and are cited by `file:line` throughout |

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | walk-evidence artifact from the Phase 5 re-walk + Phase 6 dependent-effect probe (office 4107) | `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-22-DEPEND.md`<br>*(executor updates the date suffix to the actual run date; the path is the deliverable, not a placeholder)* | artifact exists and its findings section carries a typed disposition |
| GIVER | `field-case-generation.md` §2 taxonomy additions (Phase 3.5) | `clients/encore/specs_planning/_internal/field-case-generation.md` | `node scripts/check-reject-oracle.mjs` exit 0 |
| BUILDER | `(none)` — no `.spec.ts` authored by this plan; it changes the gate, not the tests | `(none)` | n/a |
| HEALER | `(none)` | `(none)` | n/a |
| WATCHDOG | `(none)` — adversarial audit of this plan runs as a cross-provider seat, emitting no owned artifact | `(skipped: audit runs as an independent cross-provider judgment seat per two-chiefs; its verdict is recorded in this plan's §Judgment, not as a WATCHDOG-owned file)` | n/a |
| GARDENER | `(none)` — no structural refactor; stale-cleanup is rewiring inside existing files | `(none)` | n/a |
| OWNER | walk-coverage verdict path + rules + config + client CLAUDE.md correction | `scripts/walk-coverage/lib/coverage-manifest.mjs`<br>`scripts/walk-coverage/enumerate-page.mjs`<br>`scripts/walk-coverage/lib/deep-pierce.mjs`<br>`.claude/guardrail-config.json`<br>`.claude/rules/inventory.md`<br>`clients/encore/CLAUDE.md` | `npm run check:spec-quality` exit 0 |

---

## Acceptance criteria

- [ ] A manifest with **100% element disposition and zero case rows** FAILS. (It passes today — this is
      the single sharpest proof the unit changed.)
- [ ] The NM-2271 Class-1 replay still reports **8/8** and all four named gaps (Labor 28 · MaxDisc 11 ·
      Price 8 · 38 missing receipts). No regression on proven ground.
- [ ] Override Price, Max Discount and per-row Active appear as **typed, probeable controls** in a real
      re-enumeration of the surface.
- [ ] The unresolved-probe fraction on that surface is recorded from a real run (baseline: **490/504 =
      97%**) and its residue is explicitly dispositioned.
- [ ] `Path A == Path B` **exactly** (zero tolerance), **both numbers printed**. Neither 37 nor 79 is hard-coded
      anywhere.
- [ ] **All 55** prescriptive rules resolve to `ENFORCED BY: <call site passing all three parts — exists,
      reachable, can-fail-in-current-mode>` or `UNENFORCED: <Sev> — <reason>`; a rule with neither FAILS.
- [ ] A check pinned to `announce` is recorded `UNENFORCED (disarmed)`, **never** as enforced — a gate
      that cannot fail is not a gate.
- [ ] Every S0/S1/S2 `UNENFORCED` names a grep-verified `plans/pending/` recipient **within its SLA**;
      a stale recipient fails the gate that accepted it.
- [ ] S3 is **not** self-assigned by the rule's author; the S3 share is thresholded, not merely printed.
- [ ] A modal MUST/MUST-NOT statement with no `prescriptive:` metadata FAILS rather than going uncounted.
- [ ] All 5 audit-spot-checked census anchors re-verified — including LR-034, whose claimed
      `scripts/check-bug-baseline.mjs` **does not exist**.
- [ ] The doctrine-retirement trigger exists and is symmetric with LR-069 §3.4 gate demotion — this plan
      may not leave the repo add-only.
- [ ] A walk artifact with a **blank or missing** findings section FAILS validation; an explicit `none`
      passes. All **19** artifacts currently carrying neither section are migrated to the canonical shape.
- [ ] Every new gate lands `announce` with `ramp_started` / `ramp_target` / `ramp_note` recorded
      (LR-069 §3.3). No S1 gate lands straight at `deny`.
- [ ] **`check:ramp-expiry` runs in a chain.** `grep -c "check:ramp-expiry" package.json` returns ≥2
      (its definition plus at least one caller); it returns **1** today — definition only, zero callers.
- [ ] The `off` state is gone from `depth_gate_mode`, and all **six** `rampMode === 'off'` branches in
      `coverage-manifest.mjs` are removed, not left unreachable.
- [ ] The repo-wide ramp census is printed at close: how many gates armed vs `announce`. Baseline is
      **1 of 12**. This plan does not get to claim success while that number is unchanged.
- [ ] Every check added by this plan is proven **called by a production verdict path** — call site cited,
      not declaration. (Dead-export has shipped twice on this class.)
- [ ] Each convicted prior fix (P1, P2, P4, P5, P6) is rewired or removed — none left idling.
- [ ] **The named next miss is closed, not documented.** The dependent-effect probe drives one real
      `source → dependent` pair end-to-end on office 4107 and records the before/after on the dependent
      control. A surface with editable pricing fields and zero declared dependency pairs FAILS.
- [ ] The probe never mutates outside the six designated e2e offices
      (4104 / 4107 / 9220 / 9311 / 2463 / 8843), and the enumerator's click denylist is **unchanged**.

---

## Verification artifact

```bash
node scripts/walk-coverage/replay-nm2271.mjs && npm run check:spec-quality && npm run check:ramp-expiry
```

Expected: replay reports `8/8 matched`, Class 2 PASS, Class 3 FAIL with each cheat caught, mutants m1–m5
each failing on their intended catcher; `check:spec-quality` exits 0 with the doctrine-ledger check
reporting its enforced/unenforced counts; `check:ramp-expiry` exits 0 with no ramp past its target.

**`check:ramp-expiry` is in this command deliberately** — an audit seat's cheapest bypass of the whole
plan was *"never run it, since it's only a standalone script."* A gate absent from the acceptance
command is a gate nobody runs.

---

## Provenance

Four read-only cross-provider research seats, dispatched 2026-07-22, each forbidden from proposing fixes:

| Seat | Model | Output | Headline |
|---|---|---|---|
| `dc-t1-01` | gpt-5.5 | `.claude/state/ua-worker/dc-t1-01/` | 47 prescriptive rules — 8 floor / 7 detector / **32 unenforced** (55-vs-47 row count self-flagged, reconciled in Phase 4.4) |
| `dc-t2-01` | claude-opus-4.6 | `.claude/state/ua-worker/dc-t2-01/` | 12 archetypes — 3 missing from taxonomy / 3 invisible to the enumerator; root cause of 6-of-504 |
| `dc-t3-01` | gpt-5.3-codex | `.claude/state/ua-worker/dc-t3-01/` | **(C) no-mechanism** — bug-harvest doctrine written in 8 places, enforced in none; 19 of 47 artifacts carry neither required section; `ASK: none` |
| `dc-t4-01` | claude-opus-4.6 | `.claude/state/ua-worker/dc-t4-01/` | The blocking gate counts elements; the correct unit is computed but ramp-controlled |
