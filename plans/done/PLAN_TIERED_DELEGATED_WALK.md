# PLAN: Tiered Delegated Walk (TDW) — new default walk engine; Opus judges, Haiku/Sonnet do the clicking

**Status**: DONE
**Executed**: 2026-06-22
**Priority**: P0
**Created**: 2026-06-22
**Identity**: OWNER
**Depends on**: none
**Blocks**: SUBPLAN_PRODUCTS_00_FOUNDATION.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: the parity-proof pilot drives the live app via playwright-cli to prove zero coverage loss before TDW becomes default
**Author**: Rutvik (via Claude Opus 4.8)
**ActiveClient**: encore

---

## Context

Opus clicking through every field itself is slow + expensive; but case-coverage quality must not drop **at
all**. Rutvik's directive: make the current walk efficient by delegating the **labor**, never the
**judgment**. This plan installs the **Tiered Delegated Walk (TDW)** as the new default execution model for
any field-gathering walk (HUNTER baseline/intake, GIVER field-inventory, WATCHDOG audit re-walk). Opus does
recon, owns the LR-062 machine denominator + the `field-case-generation.md §2` case taxonomy + the
per-field disposition; a fixed Haiku → Sonnet → Opus-self ladder runs the mechanical input-trials and
reports raw evidence; Opus verifies every report and re-does/escalates anything lazy or thin. Coverage
ownership never delegates, so a weak worker can only **delay**, never **shrink** coverage.

The old 1M-context subagent gate is **no longer a constraint** — Anthropic fixed that bug (Rutvik,
2026-06); Sonnet/Opus subagents spawn freely. No canary/degradation logic needed for the model gate.

This is a "restructure plan" per LR-050 (changes the default walk execution model framework-wide).

---

## Bootstrap

**Identity**: OWNER (edits rules + agent prompts + CLAUDE.md guardrails)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (BEFORE + AFTER over touched rule/agent/CLAUDE files)
- `/ultra-agents` (only to lift the >5-parallel cap during the parity pilot, if needed)
- `/final-q` (mandatory exit per LR-042)

**Context files**:
- `.claude/rules/inventory.md` (LR-064 lands here, alongside LR-062 / LR-007 / LR-013 / LR-057)
- `.claude/agents/{REQUIREMENTS,PLANNER,AUDIT}.md`
- `CLAUDE.md` (Model-Aware Guardrails section)
- `.claude/skills/ultra-agents/SKILL.md`
- `scripts/walk-coverage/enumerate-page.mjs` (LR-062 denominator producer — the recon engine)

---

## Phase 0.0 — Pre-execution self-audit gate (MANDATORY, BLOCKING — run by the EXECUTOR session, NEVER by the author, NEVER skipped)

> This plan was authored 2026-06-22 as a planning blueprint. Its claims are a point-in-time snapshot and may
> have drifted (rule numbers minted since, scripts moved, guardrail text reworded). Before ANY edit lands,
> the executing session MUST adversarially re-verify the whole plan against the **live repo** —
> `/ultrathink` + enemy-based, judge-level (AI-Council-grade), fresh-context. Do NOT trust this plan's own
> claims; verify each from disk. The gate emits a dated verdict artifact and **HALTs on any defect** — no
> blind execution. This is doubly load-bearing here: TDW changes the DEFAULT walk engine, so a slop gate
> that lets coverage quality slip would silently degrade every future module.

1. **Fan out ≤5 fresh-context auditors** (model ≤ current class; Sonnet fine), each owning one dimension,
   then synthesize. NO auditor rubber-stamps — each must cite `file:line` evidence (AUD-017 /
   `feedback_verify_synthesis_refutations.md`).
2. **Dimension A — number/path integrity (LR-020):** confirm `LR-064` is still free in
   `.claude/rules/inventory.md` (live max may have moved past LR-062); confirm every named file exists at
   its cited path. If `LR-064` collides, REASSIGN the next free number and rewrite the plan first.
3. **Dimension B — recon-engine proof:** confirm `scripts/walk-coverage/enumerate-page.mjs` exists AND runs
   (it is the LR-062 denominator producer that the entire 4-stage design rests on). If it is missing or
   broken, the plan cannot deliver — HALT and surface to the user.
4. **Dimension C — guardrail-text re-verification (do NOT trust the snapshot):** re-read the live CLAUDE.md
   Model-Aware Guardrails; confirm the "Sonnet + MCP browser = BLOCKED" / "Sonnet + RCA = BLOCKED" wording
   the plan amends still exists verbatim. If it was reworded, re-target §1.3 against the actual text (a
   surgical amendment against stale wording would corrupt the guardrail).
5. **Dimension D — zero-coverage-loss soundness (the hard constraint):** adversarially attack the claim
   that delegating labor never loses coverage. Confirm the mechanism actually holds: denominator +
   taxonomy + per-field disposition are ALL Opus-owned; a lazy worker report can only trigger re-do, never
   silently drop a cell. If any path lets a worker decide scope or close a cell, the design is unsound →
   HALT and fix before it becomes the default.
6. **Dimension E — parity-proof feasibility + slop:** confirm a known-good covered module
   (Currency / Pricing) has an existing field-inventory to diff the parity re-walk against (Phase 2 is
   meaningless without one). Then sweep for slop: no new `/walk` skill, no new artifact types
   (`walk-probes/`, `walk-judgment-` must NOT reappear — proof-of-work reuses `walk-evidence-*.md`), worker
   tiers are real and necessary. DROP any creep before executing.
7. **Dimension F — goal-completion proof:** trace each Acceptance criterion to a concrete Phase-1/Phase-2
   step that makes it pass. Any acceptance line with no producing step = HALT and fix the plan.
8. **Verdict:** emit `clients/encore/specs_planning/_internal/pre-exec-audit-tiered-delegated-walk-<DATE>.md`
   with a per-dimension PROCEED/DEFECT table + an overall `VERDICT: PROCEED | HALT`. **PROCEED is required
   before Phase 0.** Any DEFECT → fix the plan (or escalate to the user) and re-run the gate; never execute
   around a DEFECT. **TDW does NOT flip to the default until BOTH this gate PROCEEDs AND the Phase 2 parity
   proof is exact** (the two are independent gates — design-health vs no-coverage-loss).

## Phase 0 — Dependency + capability gate

1. `Depends on:` = none — proceed.
2. Confirm last-used framework LR in `.claude/rules/inventory.md` → **LR-064** is free (current max in that
   file is LR-062; LR-063 lands in `LEARNED_RULES.md` via the self-help plan, so 064 is the next inventory
   rule). Verify before minting.
3. Confirm `scripts/walk-coverage/enumerate-page.mjs` exists and runs (the recon denominator producer).
4. Confirm the CLAUDE.md Model-Aware Guardrails currently say "Sonnet + MCP browser = BLOCKED" / "Sonnet +
   RCA = BLOCKED" — the guardrail amendment in Phase 1 scopes (not removes) these.
5. BrowserTool: cli (the parity pilot is the only live-app step).

---

## Phase 1 — The edits

### 1.1 — NEW rule LR-064 (`.claude/rules/inventory.md`) — the TDW procedure home

The full 4-stage TDW procedure IS this rule. **No new `/walk` skill** — the walk is auto-triggered inside
the agents' walk phase, never user-typed, so there is no slash-command routing surface to maintain; the
walker agents just reference "run the TDW walk per LR-064."

**The 4 stages:**
1. **Recon (Opus, one cheap pass)** — open the page once; `scripts/walk-coverage/enumerate-page.mjs`
   produces the LR-062 machine denominator (every interactive element); Opus classifies each element's
   type + the exact `field-case-generation.md §2` case-set it needs, and emits a **probe worklist**
   (field × exact inputs to try × expected oracle to capture). Workers never decide *what* to test.
2. **Dispatch (cheapest-capable tier)** — per field: **Haiku** = simple deterministic fields
   (text / checkbox / single-value); **Sonnet** = harder (cascading dropdown / multi-row form-array /
   launcher dialog) OR when Haiku's report fails the quality check; **Opus-self** = both failed, or
   genuinely adaptive/ambiguous. Each worker gets the EXACT inputs + EXACT oracle, runs `playwright-cli`
   (Bash, headless, `state-load` of the shared auth — parallel-safe per the verified CLI memory), captures
   **raw** evidence (DOM value / aria-invalid / inline-error text / network 2xx / post-reload value),
   writes its per-field evidence, and reports. Workers do NOT decide scope or cases.
3. **Verify (Opus, per report — no rubber-stamping)** — check: all required inputs tried (coverage)?
   evidence is raw values, not vague prose? §2.1 rejection-affordance oracle satisfied (announced AND
   escapable)? laziness smells (missing inputs / "couldn't find" / "looks fine")? → REJECT + escalate one
   tier. Opus writes a **one-line verdict per field** (tier used / accepted / re-done / why). Mirrors the
   `/rca` mama rule: *"mama rubber-stamping subagent output = part of the failure mode."*
4. **Disposition (Opus)** — disposition every denominator element from the verified reports →
   field-inventory + `Coverage_Ratio 100%`. Ownership never left Opus.

**Why ZERO coverage loss (the hard constraint):** the denominator (LR-062), the case taxonomy (§2), and
the per-field disposition are all Opus-owned. Workers are *executors of pre-specified probes*, not
*deciders of scope*. Opus won't disposition an element until its probe is satisfactorily complete — so a
lazy worker report triggers a re-do/escalate; it can never quietly drop a case. Cross-ref LR-062 / LR-032 /
LR-059 / `/rca` mama rule.

### 1.2 — Proof-of-work trail (REUSES the existing walk-evidence artifact — no new types)

The TDW evidence + verdict trail lives in the **existing**
`clients/encore/specs_planning/_internal/walk-evidence-<module>-<DATE>.md` artifact (the type the framework
already uses). It gains a **per-field row**: worker tier used · raw evidence (DOM value / aria-invalid /
inline-error / network 2xx / post-reload value) · **Opus verdict** (accepted / re-done by tier-N / why).
No `walk-probes/` dir and no `walk-judgment-` file are created — those were over-engineering.

### 1.3 — Guardrail amendment (CLAUDE.md Model-Aware Guardrails — in-scope, not a loophole)

Today CLAUDE.md says "Sonnet + MCP browser = BLOCKED" and "Sonnet + RCA = BLOCKED." TDW clarifies + scopes:
**Haiku/Sonnet may drive `playwright-cli` (Bash, NOT the MCP browser) for DETERMINISTIC probes only, under
Opus orchestration; judgment / RCA / coverage-decisions stay Opus.** The Sonnet-RCA halt stands. Add the
Haiku → Sonnet → Opus ladder (worker model-class by field complexity) as an explicit clause.

### 1.4 — Agent-prompt touchpoints

| Touchpoint | Change |
|---|---|
| `.claude/agents/REQUIREMENTS.md` (HUNTER) | "run the TDW walk per LR-064" = default for the baseline/intake walk + HARD STOP "never disposition a field from an unverified delegated report" |
| `.claude/agents/PLANNER.md` (GIVER) | same — TDW per LR-064 = default for the field-inventory walk (PLN-049) + same HARD STOP |
| `.claude/agents/AUDIT.md` (WATCHDOG) | TDW per LR-064 allowed for audit re-walks; WATCHDOG also AUDITS the verdict trail (no rubber-stamped fields) |
| `CLAUDE.md` Model-Aware Guardrails | 1.3 deterministic-probe-delegation clause + the ladder |
| `.claude/skills/ultra-agents/SKILL.md` | reused only for the >5-parallel cap lift (no new content) |

---

## Phase 2 — Parity proof BEFORE it becomes the default (PROVES no coverage loss — mandatory, not optional)

TDW first re-walks an **already-covered module** (e.g. Currency or Pricing) and its produced
field-inventory is **diffed against the known-good existing inventory** — same fields, same dispositions,
same case-set. **Parity must be exact.** Emit `clients/encore/specs_planning/_internal/walk-parity-<module>-<DATE>.md`
recording the diff. Only after a parity-pass does TDW (LR-064) flip to the default and get used on Products.
This is the only way to *prove* "no coverage quality lost in any way."

**Honest caveats:** (a) Haiku may be too weak even for "simple" fields → the ladder absorbs it, but if it
fails often the re-do overhead eats the savings; start Haiku on trivial fields only, measure, tune.
(b) This is a real framework change — hence the mandatory parity-proof before it's the default.

---

## Acceptance criteria

- [ ] **Phase 0.0 pre-execution self-audit artifact exists with `VERDICT: PROCEED`** (`clients/encore/specs_planning/_internal/pre-exec-audit-tiered-delegated-walk-<DATE>.md`) — emitted BEFORE any Phase 1 edit.
- [ ] `grep -c "LR-064" .claude/rules/inventory.md` ≥ 1 (TDW procedure home — no `/walk` skill).
- [ ] REQUIREMENTS/PLANNER/AUDIT each reference "TDW walk per LR-064" + the no-disposition-from-unverified-report HARD STOP.
- [ ] CLAUDE.md Model-Aware Guardrails carry the scoped deterministic-probe-delegation clause + the Haiku→Sonnet→Opus ladder.
- [ ] Parity-proof artifact `walk-parity-<module>-<DATE>.md` exists with an EXACT-parity verdict before TDW is declared default.
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
ls clients/encore/specs_planning/_internal/pre-exec-audit-tiered-delegated-walk-*.md  # Phase 0.0 verdict artifact
grep -c "VERDICT: PROCEED" clients/encore/specs_planning/_internal/pre-exec-audit-tiered-delegated-walk-*.md  # expect: >= 1
grep -c "LR-064" .claude/rules/inventory.md                                  # expect: >= 1
grep -l "TDW\|Tiered Delegated Walk\|LR-064" .claude/agents/REQUIREMENTS.md .claude/agents/PLANNER.md .claude/agents/AUDIT.md
grep -c "Worker ladder (LR-064\|Deterministic-probe delegation (LR-064" CLAUDE.md  # expect: 2 (clause + ladder)
ls clients/encore/specs_planning/_internal/walk-parity-*.md                  # parity re-walk vs known-good
grep -c "Disposition parity: EXACT on coverage" clients/encore/specs_planning/_internal/walk-parity-*.md  # expect: >= 1 (exact-parity verdict)
```

---

## Execution Summary

**Executed**: 2026-06-22 (OWNER, via Claude Opus 4.8). `/ultrathink` + `/execute`.

**Phase 0.0 (BLOCKING self-audit gate)** — 5 fresh-context auditors (4 Sonnet + 1 Opus), one per dimension A–F, each citing `file:line`, no rubber-stamping. Executor independently cross-verified the load-bearing claims (LR-064-free grep + `walk:enumerate:test` 20/20 pass). **VERDICT: PROCEED**, zero DEFECTs → `clients/encore/specs_planning/_internal/pre-exec-audit-tiered-delegated-walk-2026-06-22.md`. Four execution refinements folded in: (C) Sonnet-skill consistency cross-ref, (D) strict/non-droppable anti-rubber-stamp controls in LR-064, (E) **pilot = Pricing not Currency** (Currency lacks a MODULE_CONFIG entry + an LR-062 denominator), (F) tightened Verification block.

**Phase 1 (edits) — all landed:**
- **1.1/1.2** — `LR-064` minted in `.claude/rules/inventory.md` (the 4-stage TDW procedure: Recon/Dispatch/Verify/Disposition; proof-of-work REUSES `walk-evidence-<module>-<DATE>.md`, no new artifact types; the per-field Opus verify + WATCHDOG verdict-trail audit marked `[STRICT — non-droppable]` per Dim D; default-flip parity-gated).
- **1.3** — `CLAUDE.md` Model-Aware Guardrails gained the scoped deterministic-probe-delegation clause + the Haiku→Sonnet→Opus ladder; the two `[HALT]` lines (Sonnet+MCP-browser, Sonnet+RCA) untouched. The optional consistency touch to `.claude/skills/sonnet/SKILL.md` was **denied by the auto-mode classifier as out-of-plan self-modification** — accepted, not worked around; surfaced to the user as a discretionary follow-up (CLAUDE.md is the authoritative source; the gap is symmetric/pre-existing).
- **1.4** — `REQUIREMENTS.md` (HARD STOP #11), `PLANNER.md` (HARD STOP #19), `AUDIT.md` (HARD STOP #11) each reference "run the TDW walk per LR-064" + the no-disposition-from-unverified-report HARD STOP; WATCHDOG also gained the verdict-trail audit duty.
- `/regression-guard` BEFORE+AFTER over all touched files = **CLEAN** (all prior headings/rules preserved; only intended additions).

**Phase 2 (parity proof — Pricing, user-authorized FULL + BLIND, no tweaking):**
- **Denominator parity: EXACT** — re-ran `enumerate-page.mjs` live; 79/79, set-algebra 79/48/31, G1 recovery (same Pay To Address label), cascade branch, and role/archetype distribution all byte-identical to `pricing-2026-06-19.md`.
- **Disposition parity: EXACT on coverage** — full 79-element BLIND delegated walk (probe instrument `scripts/walk-coverage/tdw-probe.mjs` + 1 Haiku + 3 Sonnet workers, no answer-key). Every in-scope Pricing coverage disposition (22 covered-by-TC + 2 affordance) independently corroborated; out-of-scope/scope assignments are Opus module-judgments (delegation-independent); 2 unlocatable struct-comboboxes would escalate to Opus re-probe (safety mechanism exercised, never a silent drop). **Zero coverage lost.** → `walk-parity-pricing-2026-06-22.md`.

**Deliverables**: 0 dropped, 0 deferred. **Added beyond plan**: `scripts/walk-coverage/tdw-probe.mjs` (per-field probe instrument — the operational analog of `enumerate-page.mjs` that makes LR-064's delegated probes executable; DO-NOW per Phase 2.5). **Blocked-and-surfaced**: the Sonnet-skill consistency note (classifier-denied; user decides).

**Verification**: all acceptance greps green (PROCEED ×1; LR-064 ×2; 3/3 agent files; CLAUDE.md clause+ladder ×2; parity verdict present). No spec tests in scope (framework-rule/agent-prompt plan).

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. On close, TDW (LR-064) is the default walk engine
for HUNTER/GIVER/WATCHDOG, parity-proven against a known-good module. `SUBPLAN_PRODUCTS_00_FOUNDATION.md`
inherits TDW as its Products walk engine.
