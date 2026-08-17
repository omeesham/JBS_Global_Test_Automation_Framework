# PLAN_NM1715_LOC_BASIC_INFO_ULTRACOVERAGE — L2/L3 depth for Location Settings → Basic Information, continuing exactly where COVERAGE stopped

**Status**: PENDING
**Priority**: P1
**Created**: 2026-08-13
**Identity**: OWNER
**Depends on**: none — execution gate only: run after PLAN_NM1715_LOC_BASIC_INFO_COVERAGE closes. See Phase 0.
**Optional**: yes — time-permitting; Rutvik decides. Skipping is a legal outcome (see ## NOT-EXECUTED closure path).
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: plan
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**CoverageMode**: deep
**Jira**: NM-1715 — same story; this plan carries the depth its *Field Validation, save* scope implies once cross-field behavior is known.

---

## Context

`PLAN_NM1715_LOC_BASIC_INFO_COVERAGE.md` establishes the field denominator, a fresh old-site
baseline, per-field behavior evidence, a dispositioned test-case set, and a green QUICK spec. It
deliberately stops at FCC Axis 1 + L1 Axis 2, and every case it could not carry at that depth is
tagged `deferred-to-DEEP` (LR-072 — legal only under `CoverageMode: quick`).

This plan consumes those tokens. **It authors nothing that PLAN A already covered** — its input is
PLAN A's cross-field dependency table (SP-4) and its `deferred-to-DEEP` list (SP-6).

Rutvik's framing is the whole reason this plan exists separately:

> "lots of interconnectivity exists between the fields, a lot of fields depend on other fields…
> some fields lightup when other field lights up… its the most complex one out of all locations"

Per-field cases cannot express that. A field that is individually correct and wrong in combination
passes Axis 1 and fails the user. L2 is where that gets caught.

Jira already names the mechanisms: **NM-1090** (sync all tab data and validate all rules on *each
save* — cross-tab, not just cross-field), **NM-980** (`canEdit` permission gating across all location
settings children), **NM-1146** (a field conditionally disabled with an explanatory tooltip driven by
an API response), **NM-977 / NM-3358** (unsaved-changes modal on navigation).

---

## NOT-EXECUTED closure path

If Rutvik declares no time for DEEP coverage, PLAN B closes as SKIPPED-BY-OWNER without executing
SP-9…SP-13. Every entry in `clients/encore/specs_planning/_internal/nm1715-deferred-to-deep-ledger.md`
is re-dispositioned `wont-do-at-quick (Rutvik, <date of declaration>)`, an activity-log row records
the skip, and no Jira obligation transfers back to PLAN A beyond what its own delivery clause states.
Reopening later requires a fresh Rutvik go; this plan stays in `plans/pending/` until then.

---

## Chunk-sizing law

Same law as PLAN A: no subplan may require more than **2×** compaction to orchestrate. SP-13 is
light (~1). SP-9 through SP-12 are shaped to land at ~2. **SP-9's split, if any, is set from the
dependency-pair count PLAN A's SP-4 actually produces** — not guessed here. If that table yields a
large pair set, SP-9 splits by dependency cluster and this plan is amended before execution.

### Merge-down clause (MANDATORY — mirrors PLAN A)

This plan's size is a function of the dependency graph, which does not exist yet. If PLAN A's SP-4
produces a sparse graph, five subplans here is over-subplanning and must collapse:

| SP-4 dependency edges | Required action |
|---|---|
| ≥ 20 | Keep all five; split SP-9 by dependency cluster. |
| 6–19 | Keep all five; SP-9 stays single. |
| < 6 | **Merge** SP-9+SP-10+SP-11 into one authoring subplan. Three subplans, not five. |
| 0 | **HALT and tell Rutvik.** A page he describes as heavily interconnected yielding zero edges means the SP-4 walk failed to probe, not that the page is flat. Send SP-4 back; do not proceed on a null graph. |

As in PLAN A, a merge is recorded with the number that justified it, and every acceptance criterion
survives into the host subplan. The zero-edge row is not a sizing decision — it is a stop.

---

## Bootstrap

**Identity**: OWNER (orchestrator); each subplan declares its own.

**Skills auto-called**: `/identity`, `/relevant`, `/regression-guard` (wrap), `/final-q` (exit, LR-042).
Per-subplan: `/ultracoverage`, `/find-bugs`, `/rca` as declared below.

**Context files**: everything PLAN A loads, plus
`clients/encore/specs_planning/_internal/field-case-generation.md` (§2 taxonomy — L2/L3 rows) and the
SP-4 cross-field dependency table.

---

## Phase 0 — Dependency gate (MANDATORY)

1. Confirm `PLAN_NM1715_LOC_BASIC_INFO_COVERAGE.md` is in `plans/done/` — OR a Rutvik skip declaration exists, in which case route to `## NOT-EXECUTED closure path` instead of executing.
2. Read PLAN A's SP-4 dependency table + SP-6 deferral ledger (`clients/encore/specs_planning/_internal/nm1715-deferred-to-deep-ledger.md`).
3. LR scan — LR-072, LR-062, LR-041.
4. **Browser-tool announcement**: `BrowserTool=cli`.

---

## Subplans

### SP-9 — `SUBPLAN_NM1715_BI_09_CROSSFIELD_MATRIX`
**Identity** GIVER · **Model** opus-4-8 · **Thinking** max · **Browser** cli · ~2 compactions
**Depends on** PLAN A SP-4 · **CoverageMode** deep
**Justification**: pairwise judgment across a dependency graph; the highest-risk authoring in either plan.

The core of this plan. Turn SP-4's dependency observations into an executable matrix.

1. Build the **dependency graph**: for every field pair (A, B) where SP-4 observed A affecting B,
   record the trigger (value? empty? specific option? permission?), the effect (enable / disable /
   show / hide / clear / repopulate / revalidate), and whether it is one-way or mutual.
2. Generate **pairwise cases** over that graph — not a full cross-product. Cover every recorded edge
   at least once, plus the boundary of each trigger.
3. **Cascade cases**: where A→B and B→C, assert the two-hop effect explicitly. Cascades are where
   per-field suites are blindest — a two-hop break shows up as neither field's bug.
4. **Negative dependency cases**: assert that fields with *no* recorded edge genuinely do not move.
   An unasserted independence claim is how a future regression hides.

Binding: an edge SP-4 recorded as "no dependency observed" without a probe is **not** admissible as
a negative case — send it back rather than encode an unproven independence.

**Acceptance**: every edge in the dependency table maps to ≥1 authored case; every two-hop path has a
cascade case; zero cases asserting independence without a cited SP-4 probe.

---

### SP-10 — `SUBPLAN_NM1715_BI_10_PERSISTENCE_AND_SAVE`
**Identity** OWNER (multi-identity within phases — GIVER for case authoring, BUILDER for spec implementation) · **Model** opus-4-8 · **Thinking** xhi · **Browser** cli · ~2 compactions
**Depends on** SP-9 · **CoverageMode** deep

Save is where NM-1715's stated scope actually bites, and NM-1090 makes it cross-tab.

- **Round-trip**: set → save → reload → assert persisted, per field and per dependency cluster.
- **Cross-tab validation on save** (NM-1090): a save from Basic Information validates rules owned by
  other tabs. Assert both directions — a Basic Information save blocked by another tab's invalid
  state, and a Basic Information field's invalidity surfacing on another tab's save.
- **API payload** where observable: the Pay To case is the precedent — the display shows a *name*
  while `financial.payToId` carries the truth, and two rows share the name "Encore". A UI-only
  assertion cannot distinguish them. Assert the ID.
- **Unsaved-changes modal** (NM-977, NM-3358): navigate away dirty, assert the prompt; confirm and
  discard paths both asserted. NM-3358 is a filed defect on exactly this — apply LR-044 before
  asserting expected behavior.
- **LR-009**: Save-enable is never tested by reverting to the original value.

**Acceptance**: every field has a round-trip case; every cross-tab rule from NM-1090 has a case in
both directions; every launcher-backed field asserts its underlying ID, not just its display text.

---

### SP-11 — `SUBPLAN_NM1715_BI_11_L3_EDGES`
**Identity** GIVER · **Model** opus-4-8 · **Thinking** xhi · **Browser** cli · ~2 compactions
**Depends on** SP-10 · **CoverageMode** deep

L3, scoped strictly to what the denominator proves applies — **do not author a category with no
matching field**. Candidates, each conditional on SP-2's inventory:

- **Date-BVA** where date fields exist: boundaries, invalid formats, cross-field ordering.
- **Permission states** (NM-980): `canEdit` false — assert read-only rendering rather than absence,
  and that no dependency edge fires while gated.
- **Conditional-disable + tooltip** (NM-1146): assert the tooltip content, not merely the disabled state.
- **Accessibility**: label association, keyboard reachability. The Pay To launcher is the standing
  case — a label bound to a disabled input that must still be operable is an accessibility question,
  not only a Playwright one.
- **Volume / virtualization** in the lookup dialogs (NM-3322 touches active/inactive filtering).

**Acceptance**: each L3 category is either covered or explicitly recorded `(not applicable: <reason>)`
against the denominator. A silently skipped category is an audit finding (LR-068).

---

### SP-12 — `SUBPLAN_NM1715_BI_12_IMPLEMENTATION_DEEP`
**Identity** BUILDER · **Model** sonnet-4-6 · **Thinking** max · **Browser** cli · ~2 compactions
**Depends on** SP-11

Implement SP-9…SP-11 into the spec. Green ×2. Rebuild XLSX.

**LR-060 obligation 4 again**: `npm run check:spec-quality` passes on the **working tree** before any
green claim. Deep cases are longer and more conditional than QUICK ones, which is exactly where weak
and silently-swallowed assertions accumulate.

**Acceptance**: `npx playwright test --list` resolves every DEEP TC ID; two consecutive green runs;
`check:spec-quality`, `check:tc-parity`, `typecheck` all clean.

---

### SP-13 — `SUBPLAN_NM1715_BI_13_CLOSURE_AUDIT`
**Identity** WATCHDOG · **Model** opus-4-8 · **Thinking** max · **Browser** none · ~1 compaction
**Depends on** SP-12
**Justification**: closure-gate + multi-rule judgment across both plans.

Terminal audit across **both** plans.

- Every `deferred-to-DEEP` token from PLAN A SP-6 deferral ledger (`clients/encore/specs_planning/_internal/nm1715-deferred-to-deep-ledger.md`) is closed here or carries a named recipient
  (LR-072 + LR-040(b) — a task chip is **not** a valid recipient, per LR-060 obligation 3).
- Per-Identity Satisfaction matrices in both plans: every non-`(none)` cell resolves to a real file.
- LR-046: no strict plan line was rescoped without Rutvik's authorization.
- LR-027 parent-cascade: annotate each child's DONE line, close parents when the last child closes.
- NM-1715 is transitioned in Jira **only** on Rutvik's explicit go — publishing stays with him.
- Emit closure audit to `clients/encore/specs_planning/_internal/nm1715-basic-information-closure-audit-2026-08-13.md`.

**Acceptance**: zero open `deferred-to-DEEP`; both plans' matrices fully resolved; `/final-q` GREEN.

---

## Per-Identity Satisfaction

Dated cells are refreshed to the actual emission date at closure (C6).

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) — baseline is PLAN A SP-3 | `(none)` | — |
| GIVER | deep test cases + test plan + XLSX | `clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/locations/locations_left_panel_basic_information_test_plan.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | deep specs | `clients/encore/tests/locations/location-left-panel-basic-information.spec.ts` | `npx playwright test --list` resolves all DEEP TC IDs |
| WATCHDOG | closure audit findings | `clients/encore/specs_planning/_internal/nm1715-basic-information-closure-audit-2026-08-13.md` | `/final-q` verdict GREEN |
| HEALER | (none) | `(none)` | — |
| GARDENER | (none) | `(none)` | — |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] SP-9…SP-13 all `Status: DONE` with Execution Summaries per LR-027.
- [ ] Every edge in the SP-4 dependency table has ≥1 authored and passing case.
- [ ] Every two-hop dependency path has an explicit cascade case.
- [ ] No case asserts field independence without a cited SP-4 probe.
- [ ] Every L3 category is covered or recorded `(not applicable: <reason>)`.
- [ ] Zero open `deferred-to-DEEP` tokens across both plans.
- [ ] `check:spec-quality`, `check:tc-parity`, `typecheck` clean; two consecutive green runs.
- [ ] Activity-log row per LR-028; `/final-q` verdict per LR-042.

---

## Verification

```bash
# No deferred-to-DEEP tokens survive closure
grep -rn "deferred-to-DEEP" clients/encore/specs_planning/test-cases/setup/locations/ | wc -l

# Deep TC IDs are real and runnable
npx playwright test --list clients/encore/tests/locations/location-left-panel-basic-information.spec.ts

# Working-tree gates before any green claim
npm run check:spec-quality && npm run check:tc-parity && npm run typecheck
```

---

## Handoff (post-execution)

The module's cross-field behavior becomes asserted rather than assumed: every observed dependency
edge carries a case, every two-hop cascade is explicit, independence claims are backed by probes
rather than by silence, and save behavior is verified against the persisted record instead of the
rendered label. NM-1715 becomes closable, with the Jira transition left to Rutvik.
