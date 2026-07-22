# SUBPLAN — Surface-behaviour case axis (§3) for the depth gate

**Status**: Pending
**Priority**: Medium
**Created**: 2026-07-21
**Identity**: OWNER (framework code)
**Parent**: `plans/pending/PLAN_WALK_DEPTH_GATE.md` (Phase 5, deferred via its 5.3 clause)
**Depends on**: PLAN_WALK_DEPTH_GATE Phases 2–4 (the §2 field-value machinery + the replay harness must exist first)
**Model**: Opus
**Thinking**: ultrathink
**PermissionMode**: acceptEdits
**BrowserTool**: playwright-cli (live re-verify only)

---

## Context

`PLAN_WALK_DEPTH_GATE` closes the **field-value** depth hole (§2 of the case taxonomy). It deliberately does NOT
close the **surface-behaviour** axis (§3). This subplan is the named recipient for that gap, filed per LR-040(b)
in the same session the deferral was taken — it is not a prose "follow-up".

### Why it was deferred (recorded so the decision can be argued with, not just inherited)

The parent plan's falsifiability spine is its Phase 4 replay: the gates must fail a historical non-compliant
submission AND a shallow-but-compliant red-team artifact, and must fail five mutants. **Every one of those
replay classes and mutants is a §2 field-value attack.** Landing §3 machinery inside that plan would have shipped
it with **zero mutation coverage** — enforcement-shaped prose wearing a green checkmark, which is the exact
failure mode (`THEATER`) that plan's rev1 was judged for. Nothing load-bearing waits on this: the cross-instance
citation cheat it was partly meant to close is already killed by the parent's field-carrying runtime receipt.

### The measured gap this closes

From the NM-2271 review (67 uncovered slots of ~151), the ~12 slots outside §2 are all §3 surface behaviours:

| Pattern | Slots |
|---|---|
| Import content behaviours (one empty price rejects whole file; import stalls at 50% but applies server-side) | 2 |
| Currency-filter correct-row-set | 3 |
| Labor-specific pagination / filter+sort / dirty-guard | 3 |
| Rows-per-page each-option re-render | 4 |

LR-065 already makes the surface axis part of the LR-062 100% gate, so this is doctrine, not scope creep.

---

## Bootstrap

- **Identity**: OWNER.
- **Skills auto-called**: `/execute`, `/regression-guard`, `/final-q`.
- **Context files**:
  - `plans/pending/PLAN_WALK_DEPTH_GATE.md` (parent — read its §Judgment and Known-residuals sections first)
  - `.claude/rules/inventory.md` — LR-062, LR-065 (the surface axis)
  - `.claude/rules/guardrail-policy.md` — LR-069 §3.3 (ramp keys)
  - `.claude/rules/data.md` — LR-003
  - `clients/encore/specs_planning/_internal/field-case-generation.md` §3
  - `docs/read_only_docs/CASE_GENERATION_STANDARD.md` (methodology; the 7 families + depth L0–L3)

---

## Phase 0 — Dependency gate (mandatory)

- [ ] `scripts/walk-coverage/lib/field-case-parser.mjs` exists and already parses §3 — it exports
      `surfaceFamilies` today (verified 2026-07-21: 7 families parse). This subplan **reuses** that parser; it
      must not add a second one.
- [ ] The parent plan's Phase 4 replay harness exists. If it does not, STOP — this subplan's own acceptance
      depends on it.

---

## Phase 1 — Surface case slots

- [ ] **1.1** Emit per-surface case rows from the parser's `surfaceFamilies`, using the same generated-not-authored
      mechanism as the parent's field-case rows. The 7 families: `result-fidelity`, `pagination`, `sorting`,
      `combination`, `render-state`, `empty-vol`, `persistence`.
- [ ] **1.2** Adopt the shipped vocabulary — `**Surface_Family**: <family> (QUICK|DEEP)` and
      `TC-<MOD>-<SUB>-NNN`. Do NOT invent a parallel id scheme (the parent plan already rejected one).
- [ ] **1.3** Depth is a readable per-case attribute (`QUICK|DEEP`); the gate enforces QUICK at minimum and
      records DEEP separately, so a QUICK-only walk is honest rather than silently partial.

## Phase 2 — Bind surface cases to their surface INSTANCE

- [ ] **2.1** A Labor-grid case may not be disposed by an Equipment-grid TC. This is the parent's numerator
      problem on the surface axis: a case must be bound to the specific surface instance it was observed on,
      not merely to the module.
- [ ] **2.2** Reuse the parent's binding mechanism (title token + runtime receipt carrying the instance
      identifier). Do not invent a second evidence dialect.

## Phase 3 — Ramp

- [ ] **3.1** Land at `announce` with a `surface_axis_mode` key in `.claude/guardrail-config.json` carrying
      `ramp_started`, `ramp_target`, `ramp_note`, per LR-069 §3.3. `scripts/check-ramp-expiry.mjs` already fails
      the build when a ramp target passes while still in `announce` — this key inherits that automatically.

## Phase 4 — Falsifiable replay (REQUIRED — this subplan is rejected without it)

This clause exists because the parent plan's judgment seat insisted on it: *"the filed subplan must carry its own
Phase-4-style shallow-mutant replay requirement, or the surface axis eventually lands as exactly the unfalsified
machinery this rev2 exists to forbid."*

- [ ] **4.1** Extend the parent's replay with a **§3 shallow-but-compliant** artifact: surface case rows all
      disposed, but by TCs that assert only presence (e.g. "the rows-per-page list contains 10/20/30/40/50")
      without exercising each option's re-render. The gate MUST fail it.
- [ ] **4.2** Mutants the §3 gate must also fail: (a) a Labor surface case disposed by an Equipment TC;
      (b) a QUICK case marked DEEP to dodge a stricter check; (c) a surface case with no receipt;
      (d) a receipt replayed from a stale run after the spec was edited.
- [ ] **4.3** If the replay passes any of these, STOP and report plainly. Never tune the replay to manufacture
      a failure.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | `(none)` | (none) |
| GIVER | (none) — consumes existing TCs read-only | `(none)` | (none) |
| BUILDER | (none) — no `.spec.ts` authored by this subplan | `(none)` | (none) |
| HEALER | (none) | `(none)` | (none) |
| WATCHDOG | (none) | `(none)` | (none) |
| GARDENER | (none) | `(none)` | (none) |
| OWNER | surface-axis emitter + gate + ramp key | `scripts/walk-coverage/lib/field-case-parser.mjs` (reuse, no new parser)<br>`.claude/guardrail-config.json` | `npm run check:ramp-expiry` exit 0 + the Phase 4 replay exits non-zero on the §3 shallow artifact |

---

## Acceptance criteria

- [ ] All 7 surface families emit case rows; QUICK enforced, DEEP recorded separately.
- [ ] A surface case cannot be disposed by a TC bound to a different surface instance.
- [ ] Ramp key present and inherited by the existing self-expiry check.
- [ ] Phase 4 replay **fails** the §3 shallow-but-compliant artifact and all four mutants.
- [ ] `npm run check:spec-quality`, `check:tc-parity`, `check:dead-exports`, `check:untracked-knowledge` green.

## Known residuals

1. Assertion depth for §3 *positive* cases stays unenforced, exactly as on the field axis — this raises the floor,
   it does not guarantee quality.
2. The §3 taxonomy itself becomes load-bearing and is machine-unaudited; a thin family definition will be
   enforced with full confidence.

## Handoff

Outcomes only, in chat, per `feedback_handoff_in_chat_only.md`.
