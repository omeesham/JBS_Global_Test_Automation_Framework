# PLAN — Walk Depth Gate (value-coverage + rejection-oracle + config teeth)

**Status**: Pending
**Priority**: High
**Created**: 2026-07-21
**Revised**: 2026-07-21 (rev2 — after two independent judgment seats returned THEATER and PARTIAL; see §Judgment)
**Identity**: OWNER (framework code); GARDENER for structural refactor steps
**Depends on**: `9e0b47d3` (walk BREADTH enforcement — LR-062 completeness holes closed)
**Model**: Opus
**Thinking**: ultrathink
**PermissionMode**: acceptEdits
**BrowserTool**: playwright-cli (Phases 1 + 4 live runs; Phases 2–3 are repo-local)

---

## Context

Commit `9e0b47d3` closed the LR-062 **breadth** holes: the machine enumerates the element denominator, portal
menus are captured, required states hard-fail, and the grandfather ramp can no longer be backdated. Done and
live-verified.

It does **not** close the NM-2271 Corporate Pricing Override gap — ~44% of the denominator uncovered (67 of
~151 slots). An independent auditor judged the breadth fix "would not have stopped agents from being lazy" on
that miss. Verified against disk before writing this plan:

| Claim | Verdict | Evidence |
|---|---|---|
| The walk gate counts elements/states, not values-per-field | **TRUE** | manifest rows are per-`controlRef`, disposed by a single TC id |
| The walk gate never judges assertion quality | **TRUE** | `spotAudit` validates the TC id's *shape*, never reads the test body |
| The override surface's forcing powers never fire | **TRUE (premise corrected)** | the surface *is* registered — but `openerTestidPatterns: []`, no `openerRoleTextPatterns`, no `requiredStates` |
| Spec-side assertion enforcement is absent | **FALSE — corrected** | `check:spec-quality` runs 5 detectors. Enforcement exists, but it is *anti-pattern detection*, and **no detector references `aria-invalid` / reject / escapable / focus** (grep: zero hits) |
| A rejection-affordance oracle already exists | **TRUE — and unenforced** | `field-case-generation.md:50-60` §2.1, `ENFORCED BY CODE: no` |

Two facts sharpen the diagnosis:

1. **4 of 6 registered surfaces are toothless** — only `pricing` and `corporate-pricing-search` carry a
   `...MC_DATA` requiredStates spread. A resting-only denominator *looks* complete.
2. **The knowledge was already written and did nothing.** The override config comment says a re-walk "MUST drive
   a location + a non-ALL currency." §2.1 predicts the exact NM-2271 failure verbatim: *"a field can reject input
   silently and trap the user, and a presence-only `expect()` will read that as a clean pass."* Both are prose.

### The principle

> **The machine owns every denominator AND every numerator. The agent supplies evidence, never assertions about
> its own coverage.**

Rev1 of this plan said only "…owns every denominator; the agent may only dispose slots." A judgment seat correctly
observed that **disposing is the numerator**, and that rev1 left it entirely self-asserted — so the principle was
half-implemented and the design re-created the very trust vector it claimed to remove. Rev2 closes the numerator.

| Axis | Denominator owner | Numerator owner | Status |
|---|---|---|---|
| 1. Elements / states | machine | machine (element seen or not) | fixed in `9e0b47d3` |
| 2. Values per field | **agent** (via `Control Type` text) | **agent** (self-asserted `covered-by-TC`) | Phase 2 |
| 3. Assertion strength | **agent** | **agent** | Phase 3 |
| 4. Surface behaviours (grid/filter/pagination) | **agent** | **agent** | Phase 5 (LR-065 makes this doctrine already) |

---

## §Judgment — what the two seats found (rev1 → rev2)

Two independent seats reviewed rev1. Claude authored rev1 and therefore did not grade it.

**Adversarial seat (gpt-5.5): `THEATER` — 5/5 attacks found holes.** Two claims spot-audited on disk by the
orchestrator and **confirmed**: the OOS cap is a *global* 15% ratio (`coverage-manifest.mjs`, comment reads
"15% global cap") with no per-category reservation — on 151 slots that permits 22 exemptions, and the expensive
numeric slots total 19, so they fit; and `guardrail-policy.md` §3.3 requires `ramp_started` / `ramp_target` /
`ramp_note` / `ramp_complete` / `ramp_flipped`, none of which rev1 named.

**Judgment seat (fable): `PARTIAL — ~55 of 67 (82%)`.** All four HIGH-severity patterns caught; the historical
submission *would* have failed loudly (it carried no case rows at all). The ~12 misses are all MED/LOW and all
§3 surface-behaviour, not §2 field-value.

**These are not contradictory — they answer different questions.** Fable asked *would it have caught the
historical miss* (yes). The adversary asked *can a lazy agent game it going forward* (yes, cheaply). The
forward-looking question is the one that matters, so rev2 is built against the adversary.

**The gaming path both seats converged on** (fable's version, verified against disk: `coverage-manifest.mjs:64`
— "`covered-by-TC` … is not evidence-gated"; the LR-064 blind re-drive samples only `provenance: live` rows;
`spotAudit` validates TC-id shape only):

1. Run `walk:cases`; the machine hands over the full case list. Free.
2. Write **one** test per neg-bearing field, entering **one** invalid value, calling the oracle helper once.
3. Cite that single TC id across **all 11** Max Discount neg/BVA rows — and choose `"abc"` as the value, which
   satisfies the gate while **never probing `>100`, the exact historical trap value**.
4. Cite the **Equipment** boundary TC in the **Labor** case rows — nothing binds a TC to a tab or a field.
   The 28-slot hole is rebuilt, gate-green, with zero new Labor tests.
5. Cost: ~6–8 one-liner tests against ~67 honest slots. Ratio 100%, oracle gate green.

Rev2's Phases 2.7, 3.2 and 3.5 exist specifically to kill steps 3 and 4.

### rev3 — three design forks resolved (judgment seat, all grounded in verified repo code)

- **Fork A — how the machine derives field type.** Resolved: **edit-mode archetype probe, escape-only**, with
  fail-closed-widest as the remainder (Phase 2.2). The mutation objection conflates probing with committing;
  the cost objection is sunk because `collapseArchetypes` + the existing archetype click at
  `enumerate-page.mjs:409` already do this. A frozen per-surface type registry was rejected as relocating the
  author's claim rather than removing it.
- **Fork B — runtime receipts vs. a static gate.** Resolved: **mandatory, hash-bound** receipts (Phase 3.2).
  The key correction: the existing evidence check is *date*-bound; a receipt must be *code*-bound, so
  `spec_sha256` is the tooth. Advisory receipts were rejected as fence-sitting — presence-greps cannot see
  execution, which is the whole point.
- **Fork C — Phase 5 scope.** Resolved: **defer** via 5.3, because landing it would ship machinery with no
  mutation coverage.
- **Accepted cost, stated plainly**: editing a spec — even a comment — invalidates its receipts and forces a
  re-run of that file. That is real friction, and it is the correct shape of friction. Receipts still cannot
  prove the *app* hasn't drifted since the run; no static gate can.

---

## Bootstrap

- **Identity**: OWNER (framework); `/identity GARDENER` for Phase 1 structural-only edits.
- **Skills auto-called**: `/execute`, `/regression-guard` (wrap each phase), `/final-q` (closure).
- **Context files** (read before Phase 1):
  - `.claude/rules/inventory.md` — LR-062, LR-064, LR-065 (the §3 surface axis — governs Phase 5)
  - `.claude/rules/specs.md` — LR-068
  - `.claude/rules/guardrail-policy.md` — LR-069 §3.3 (ramp keys — Phase 6 depends on this verbatim)
  - `.claude/rules/plan-closure.md` — LR-055 · `.claude/rules/data.md` — LR-003
  - `clients/encore/specs_planning/_internal/field-case-generation.md` — §2 taxonomy + §2.1 oracle
  - `clients/encore/specs_planning/_internal/field-inventory-spec.md` — artifact schema
  - Parent commit `9e0b47d3`

---

## Phase 0 — Dependency + tool gate (mandatory)

- [ ] Confirm `9e0b47d3` is an ancestor of HEAD — `git merge-base --is-ancestor 9e0b47d3 HEAD`.
- [ ] Confirm `coverage-manifest.mjs` exports `isSubjectToMandate` — this plan **reuses** the hardened
      non-forgeable grandfather rather than inventing a second ramp.

---

## Phase 1 — Config teeth (axis 1 residual; smallest, ships first)

- [ ] **1.1** Add `requiredStates` + opener patterns to `scripts/walk-coverage/lib/module-config.mjs` for
      `corporate-pricing-override`, `-strategy`, `-detail`, `-new-pricebook`. For override, at minimum:
      `resting`, `tab:labor`, `expand:currency`, `expand:rows-per-page`, plus the location + non-ALL-currency
      precondition. Source control names from `clients/encore/src/selectors/corporate-override/override.ts` —
      do not invent state names.
- [ ] **1.2** Convert the override entry's prose comment into machine requiredStates; delete the now-redundant
      *instruction* (keep the *why*). Prose duplicating an enforced rule rots into a contradiction.
- [ ] **1.3** **Meta-gate** — a `MODULE_CONFIG` surface with zero `requiredStates` **and** zero opener patterns
      fails the enumerator with `TOOTHLESS-SURFACE`. Without this, every future surface re-enters the silence.
- [ ] **1.4** Acceptance: live-run against the override surface; `Walk_State` must list the Labor tab and the
      currency / rows-per-page expansions; record resting-only vs forced denominator counts.

---

## Phase 2 — Value-coverage gate (axis 2)

- [ ] **2.1** **Single-source taxonomy** — parse the concrete case table **directly at runtime**. Source
      confirmed by research: `docs/read_only_docs/CASE_GENERATION_STANDARD.md` is *methodology* and explicitly
      delegates concrete field cases to the client instance, so the parser reads
      `clients/encore/specs_planning/_internal/field-case-generation.md`, keyed on
      `## §2 — Per-Field-Type Case Templates` (fixed 5-column header), `## §2.1 — Rejection-affordance oracle`,
      and `## §3 — Surface / Behavior Case Templates`. Fail closed on any parse error.
      *(rev1 proposed a separate `.mjs` table plus a drift-guard script — three artifacts where one suffices. The
      stronger cure for dual-source drift is **not making a second copy**.)*
- [ ] **2.2** **Machine-derived field type via an edit-mode archetype probe.**
      **The resting DOM is NOT sufficient** — on the very surface that motivated this plan, `Override Price` and
      `Max Discount %` render at rest as `div[role="button"]` click-to-edit cells; the real `spinbutton` appears
      only after a click. A resting-only attribute scan (rev2's wording) is unimplementable there.
      Mechanism: the enumerator clicks **one archetype representative per column**, reads the revealed control's
      tag / `type` / `role` / `inputmode` / aria attributes, then presses `Escape` **having typed nothing** and
      never touching Save. Probing is not committing — no data mutates on the shared environment.
      Cost is already sunk: `collapseArchetypes` (`enumerate-page.mjs:31,438`) reduces homogeneous grid columns to
      one representative, and the enumerator **already performs exactly this kind of live archetype click** at
      `enumerate-page.mjs:409` (`// pilot: row-0 Is-Alternate represents the column archetype`). ~2–3 probes per
      surface, not per cell.
      Derived types are written into the **`Completion_Record` JSON**, so they inherit the existing
      `content_sha256` anti-tamper for free — **no new registry artifact**.
      Unresolved control → fail closed to the **widest applicable case set** (ambiguity must always cost the agent
      *more* work, never less).
      *(Rejected: a per-surface type registry decided once at recon — it relocates the author's claim into a
      better-dressed author and then freezes it; an immutable wrong registry rots silently when the app changes.
      Rejected: fail-closed-widest as the *primary* mechanism — on a grid every click-to-edit cell is unresolved
      at rest, so "widest" becomes the norm and generates meaningless cases (newline-in-a-spinbutton), producing
      exactly the exemption pressure residual 6 warns about. Its incentive only holds when ambiguity is the
      exception — which the probe makes true.)*
- [ ] **2.3** **Extend the EXISTING catalog — do not invent a parallel artifact.**
      `clients/encore/specs_planning/_internal/field-case-catalogs/*.md` already maps field → case-template
      classes → owning TCs. A real row (`override-2026-06-09.md:22`):
      `Override Price | numeric | edit reveals + commits | 0, large, decimal | non-numeric → coerced | edit→save→reload→persist | 517, 518, 519, 520, 521, 522, 525`
      **The hole is that TCs are listed per-ROW, not per-CASE** — nothing says which TC covers `max+1` versus
      `"abc"`, so seven ids make the whole BVA column read as covered. Phase 2 makes that binding explicit and
      machine-checked, generated not hand-authored.
      **Adopt the shipped vocabulary** — `TC-<MOD>-FCC-*`, `TC-<MOD>-<SUB>-NNN`, and
      `**Surface_Family**: <family> (QUICK|DEEP)`. Internal parser keys only where they map back to shipped IDs.
      *(rev2 invented `num.neg.sci-notation`-style ids — that would have been a third naming system beside two
      that already ship.)*
- [ ] **2.4** **Manifest ↔ inventory parity** — every machine-enumerated control must appear in the Field
      Inventory table, and vice versa. Mismatch = FAIL.
      *(Closes a hole neither rev1 nor the adversary caught: `walk:cases` reads the **inventory table**, while
      `verify-denominator.mjs` binds machine keys to the **Coverage Manifest**. No parity check exists between
      them, so a field simply omitted from the inventory gets zero case rows while its manifest row is disposed —
      a silent denominator hole that violates this plan's own doctrine sentence.)*
- [ ] **2.5** **Gate** — `Case_Coverage_Ratio` required at 100% alongside the element ratio.
- [ ] **2.6** **Per-category exemption budget** — the existing global 15% OOS cap lets an agent spend the entire
      budget on precisely the expensive rows (19 of 22 permitted exemptions = every named numeric neg/BVA slot).
      Negative + BVA categories get their own, far tighter budget; exemptions there additionally require a
      human-approved `walk-exemptions.json` entry.
- [ ] **2.7** **One case_id, one disposition** — a `case_id` row may not be disposed by a TC id already disposing
      another `case_id` **unless** that TC demonstrably parameterises over both (Phase 3.2's token rule).
      Enforce a hard ceiling on how many case rows a single TC id may dispose.
- [ ] **2.8** **Grandfather** — subject/not-subject via the existing `isSubjectToMandate` (git-first-commit date +
      completion record; never mtime, never author-declared dates).

---

## Phase 3 — Rejection-oracle floor (axis 3)

- [ ] **3.1** **GENERALIZE the oracle that already exists — do not write a new one.**
      `probePricebookBoundary` (`clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts:330-345`)
      already implements §2.1's subtle part correctly: it focuses the field, records the active element **before**
      a natural `Tab`, and **never presses `Escape`** — so it cannot mask a focus-trap with its own teardown.
      Lift it into a sanctioned `assertRejectionOracle(page, field, { caseId, value })`, fixing the two defects
      that block generalization:
      **(a) "announced" is `aria-invalid`-only** — §2.1 also admits inline error text, tooltip, or toast.
      Precedent for reading inline text: `corporate-pricing-new-pricebook.page.ts:306-324`.
      **(b) escapability identifies the focused element by `placeholder` string comparison** — fragile and
      pricebook-bound; replace with real element identity.
      Host: `clients/encore/src/utils/field-case-runner.ts` (it already defines the `FieldCase` lifecycle —
      baseline / act / expects / save / reload / cleanup — but has **no** rejection-oracle field; its interface
      needs extending).
- [ ] **3.2** **Bind the assertion to the case, not just the TC.** Two requirements, both deterministic:
      **(a) token binding** — the disposing test's title must contain the literal case id, so one TC cannot
      silently dispose eleven distinct case rows;
      **(b) hash-bound runtime receipt** — the helper emits `{case_id, field, value, announced, escapable,
      spec_sha256}` and the gate requires **one receipt per neg/BVA case**.
      **The `spec_sha256` is load-bearing and is NOT what the existing evidence check does.** The coverage gate's
      `checkEvidenceArtifact` (`coverage-manifest.mjs:164`) is **date-bound** — it cannot tell a receipt from
      three commits ago from a fresh one. A receipt must be bound to **code state**: the gate recomputes the
      disposing spec file's hash and fails on mismatch.
      This kills three cheats at once — dead branch (`if (process.env.NEVER === "1") await …`) emits no receipt;
      stale run fails the hash; and cross-tab citation dies because the receipt carries `field`, so an Equipment
      receipt cannot dispose a Labor row.
      **Anti-forgery is mandatory, not optional**: put the receipts directory under the existing
      `isEvidenceDirTarget` agent-write-deny (`.claude/hooks/lib/check-todo-injection.mjs:179`) and reuse the
      `content_sha256` self-hash pattern. Without that, receipts are hand-forgeable markdown and this whole floor
      is theater.
      **`--grep` narrowing is explicitly NOT a cheat** — a narrowed run that emits every required receipt did
      genuinely run those tests, which is exactly the evidence wanted. Do not mandate a full-suite run to prove
      something a targeted run already proves.
- [ ] **3.3** **Host (pinned, verified on disk)** — append to the `check:spec-quality` chain in `package.json`:
      `check-unfailable-assertions --enforce && check-swallowed-failures --enforce && check-spec-sleeps --enforce && check-reload-wait --enforce && check-vacuous-grid-assertions`.
      **Design distinction to state in the script header**: all five existing members are *detectors* (recognise
      known-bad shapes); `check-reject-oracle` is a *floor* (requires a known-good assertion). A detector cannot
      catch an assertion that is merely **absent** — which is exactly how the `>100` focus-trap passed as GREEN.
      Do not let a future reader "simplify" the floor into a detector.
- [ ] **3.4** **Value coverage, not just oracle presence** — the receipts for a field must collectively cover the
      case_ids' distinct input values. Passing `"abc"` cannot satisfy `max+1`.

---

## Phase 4 — Falsifiable replay + mutation controls

**This plan is rejected if this phase does not fail both the historical submission and the shallow-but-compliant
mutant.**

- [ ] **4.1** **Freeze the inputs** — pin the NM-2271 artifact + TC set by commit SHA **and** sha256. A replay
      whose inputs can drift proves nothing later.
- [ ] **4.2** **Cross-provider authorship** — the replay is built by a different provider than the one that
      implements Phases 2–3 (two-chiefs; no provider grades its own homework).
- [ ] **4.3** **Class 1 — wholesale non-compliant (must FAIL)**: the colleague's shipped 65-TC set. Named failures
      must include Labor-tab fields (28), `Max Discount %` BVA+neg (11), `Override Price` BVA+neg (8), and
      rejection-oracle omissions (~10 cases × 2 assertions).
- [ ] **4.4** **Class 2 — genuinely complete (must PASS)**: no false-positive storm.
- [ ] **4.5** **Class 3 — shallow-but-compliant red-team artifact (must FAIL)** — built by walking the §Judgment
      gaming path deliberately: one TC cited across many case rows, `"abc"` standing in for `>100`, Equipment TC
      ids disposing Labor rows.
      *(rev1 tested only classes 1 and 2. The judgment seat noted this tests the wrong adversary — the whole point
      is the artifact that is shallow yet passes, and rev1's own "if it passes, it's theater" self-check could
      never fire on it.)*
- [ ] **4.6** **Mutation controls** — the gates must also fail **five** synthetic mutants: wrong machine type,
      TC-id reuse across case rows, oracle call behind a dead branch, exemptions concentrated on neg/BVA, and
      **a receipt replayed from a stale run after the spec was edited**.
      *(The fifth was added on judgment: once receipts exist, replaying a stale one becomes the cheapest
      forward-looking cheat, and the original four cannot see it.)*
      Passing any mutant proves incapability, not compliance.
- [ ] **4.7** If a required failure does not occur, **stop and report plainly**. Never tune the replay to
      manufacture a failure.

---

## Phase 5 — §3 surface-behaviour axis — **DEFERRED by decision (5.3 path)**

The ~12 historically-missed slots outside §2 are all §3 surface-family behaviours: import content behaviours (2),
currency-filter correct-row-set (3), Labor-specific pagination/filter+sort/dirty-guard (3), rows-per-page
each-option re-render (4). LR-065 makes the surface axis doctrine, so this is not scope creep — but it is
deliberately **not landing in this plan**.

**Why deferred** (judgment call, recorded so it can be argued with later): Phase 4 is this plan's falsifiability
spine, and every replay class and mutant in it is a **§2 field-value** attack. Phase 5's machinery would
therefore ship with **zero mutation coverage** — enforcement-shaped prose wearing a green checkmark, which is
precisely the rev1 `THEATER` failure this revision exists to avoid. Nothing load-bearing waits on it either: 5.2
is meaningless without 5.1, and the cross-instance citation cheat it was meant to close is **already killed** by
Phase 3.2's field-carrying receipt. The "pending plans rot" fear is also mis-aimed — the LR-062 precedent rotted
as an **unowned ramp knob**, not as a pending plan; pending plans sit under LR-048 / LR-040 / INDEX discipline.
The 7 surface families are `result-fidelity`, `pagination`, `sorting`, `combination`, `render-state`,
`empty-vol`, `persistence` (`CASE_GENERATION_STANDARD.md:31-44`).

- [ ] **5.3** File `plans/pending/SUBPLAN_SURFACE_CASE_AXIS.md` **in the same session as this plan's execution**,
      with grep-verifiable line items per LR-040(b). It must carry, as a required line item, **its own
      Phase-4-style shallow-but-compliant mutant replay** — otherwise the surface axis eventually lands as exactly
      the unfalsified machinery rev2 exists to forbid. Record the deferral in residual 2.

---

## Phase 6 — Ramp discipline (LR-069 §3.3, verbatim)

- [ ] **6.1** Both gates land at `announce` with keys in `.claude/guardrail-config.json` — `depth_gate_mode` and
      `reject_oracle_mode`, each carrying `ramp_started`, `ramp_target`, `ramp_note` (same shape as the proven
      `c6_mode` / `coverage_mode` knobs — one shared file).
- [ ] **6.2** **Self-expiring ramp** — a check that **FAILS** when `today > ramp_target` while the mode is still
      `announce`. Named flip owner + criterion in `ramp_note`.
      *(Without this the failure mode is exact-precedent: LR-062 was opt-in, nobody flipped it, and that is the
      entire reason this plan exists. An unowned ramp is the original bug wearing a new name.)*
- [ ] **6.3** On promotion record `ramp_complete: true` + `ramp_flipped` date.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | `(none)` | (none) |
| GIVER | (none) — replay consumes existing TCs read-only | `(none)` | (none) |
| BUILDER | (none) — Phase 3.1 adds a util helper, not a spec | `(none)` | (none) |
| HEALER | (none) | `(none)` | (none) |
| WATCHDOG | (none) | `(none)` | (none) |
| GARDENER | framework structural change (Phase 1 config data) | `scripts/walk-coverage/lib/module-config.mjs` | `npm run typecheck` clean |
| OWNER | gate scripts + taxonomy parser + artifact schema + ramp config | `scripts/walk-coverage/lib/field-case-parser.mjs`<br>`scripts/check-reject-oracle.mjs`<br>`scripts/walk-coverage/replay-nm2271.mjs`<br>`.claude/guardrail-config.json`<br>`clients/encore/specs_planning/_internal/field-inventory-spec.md` | `node --check` each + `node scripts/walk-coverage/replay-nm2271.mjs` exits non-zero on BOTH the historical submission and the shallow-but-compliant mutant |

---

## Acceptance criteria

- [ ] Phase 1: zero toothless registered surfaces; override walk records Labor tab + currency + rows-per-page.
- [ ] Phase 2: case denominator machine-derived from **DOM-observed** type; manifest↔inventory parity enforced;
      per-category exemption budget; one-case-one-disposition ceiling.
- [ ] Phase 3: every neg/BVA case_id has a runtime receipt with its own distinct value; title-token binding holds.
- [ ] Phase 4: replay **fails** class 1 and class 3, **passes** class 2, and fails all four mutants.
- [ ] Phase 5: §3 axis covered, or `SUBPLAN_SURFACE_CASE_AXIS.md` filed with grep-verifiable items (LR-040(b)).
- [ ] Phase 6: ramp keys present; self-expiry check fails a stale `announce`.
- [ ] `check:spec-quality`, `check:tc-parity`, `check:dead-exports`, `check:untracked-knowledge` green.

---

## Known residuals (rev2 — expanded after judgment; this plan does NOT claim to end laziness)

1. **Positive / save-cycle assertion depth stays unenforced.** The oracle floor bites only neg/BVA cases. An
   agent can still write shallow positive tests. The floor rises from "one shallow test per field" to "the full
   case set, with negatives asserting properly against distinct values" — a real improvement, not a cure.
2. **Honest score: ~55 of 67 historical slots (82%)** before Phase 5; all four HIGH-severity patterns, with every
   miss in MED/LOW surface-behaviour. Phase 5 targets the remainder; if 5.3 defers it, that number stands.
3. **Numerator honesty is only as strong as Phase 3.2's binding.** Token + receipt kill the cheap reuse path.
   A determined agent can still write a technically-parameterised but semantically thin test. This design raises
   the cost of faking from ~8 one-liners to roughly the honest cost — it does not make faking impossible.
4. **Cross-instance citation** (Labor rows disposed by Equipment TCs) is closed only where Phases 2.7 / 5.2 land.
   Until 5.2, surface-axis cases remain citable across instances.
5. **The §2/§3 taxonomies become load-bearing and are machine-unaudited.** A thin case list is now enforced with
   full confidence. Taxonomy quality is a first-class risk with no gate of its own.
6. **Machine type-derivation will not classify everything.** Exotic/custom controls fail closed, which is correct
   but adds friction and a human-approval path that can itself be rubber-stamped.
7. **Phase 4 proves capability against known attacks only.** Mutants encode the attacks we thought of. An
   unimagined attack passes — which is precisely how rev1 reached `THEATER` with a straight face.

---

## Handoff

Outcomes only, in chat, per `feedback_handoff_in_chat_only.md`.
