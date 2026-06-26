# PLAN: Pricing Incident Audit → Permanent Assumption-Prevention → FCC-Source Hardening

**Status**: DONE
**Executed**: 2026-06-19
**Priority**: P0-EMERGENCY
**Created**: 2026-06-18
**Identity**: OWNER
**Depends on**: none
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: auto
**Justification**: multi-rule judgment + framework-gate authoring + closure-gate work — Opus `max` per LR-041.
**BrowserTool**: none
**BrowserToolJustification**: Stages 1–2 (this plan's scope) are framework authoring + hook/rule work — no live browser. Stage 3 (the pricing closure, tracked by SUBPLAN_PRICING_FCC.md) carries its own `BrowserTool: cli`.

---

## Provenance

Migrated 2026-06-19 from a home-directory scratch plan (`~/.claude/plans/`) into the repository per
`feedback_save_plan_location.md` (every plan lives in `plans/`, never only in the scratch dir). The
original scratch name used profanity; renamed to professional wording per the user's 2026-06-19
instruction. **Scope of THIS plan = Part 0 (audit verdict) + Stage 1 + Stage 2 (the permanent
prevention), all DONE.** Stage 3 (finishing the pricing FCC work itself) is a separate, still-open
piece tracked by `SUBPLAN_PRICING_FCC.md` (see Handoff) — it is not claimed complete here.

---

## Context

Executing the pricing FCC work produced a cluster of avoidable defects the user caught by hand:
- "Office 1604 may be corrupt" was asserted without isolating office-specific data from an app-wide
  issue (no second office, no baseline).
- The primary-pricing dropdown was declared "un-drivable" after a few failed clicks — the real causes
  were a stuck overlay plus a **stale page-object selector** (`'Search pricebooks...'` vs the live
  `'Search pricing strategies...'`), never checked against the live DOM.
- The disabled date-grid fields were observed but never baseline-compared.
- The mandatory baseline walk was skipped silently; a bug was filed with an invalid
  `baselineComparison` value, inverting the truth hierarchy.
- Env instability was used to defer env-INDEPENDENT work (baseline walk, catalog, spec hardening,
  review), while the session was presented as a "checkpoint" with the plan left PENDING.

**Root mechanism failure:** the framework HAS anti-assumption rules (NEVER ASSUME, LR-045
baseline-first, LR-ENC-001, LR-021, LR-032, LR-057) but they were behavioral or authoring-time only.
None fired at execution/exit time, and **every closure gate (LR-055 C1–C6, the Per-Identity Matrix
audit, LR-040) keys on the `Status: DONE` flip** — so a "checkpoint as PENDING" silently bypassed all
of them. This plan converts that behavioral discipline into structural enforcement.

---

## Part 0 — Audit verdict (durable record)

### Root causes (the exact defects)

| ID | Mistake | Exact root cause |
|---|---|---|
| RC-1 | "1604 corrupt" asserted from one office | Generalized from a single observation; no second-office isolation, no baseline. |
| RC-2 | Dropdown declared "un-drivable" | Gave up after a few failed clicks: stuck modal overlay + never diffed the page object's selector against the live DOM. |
| RC-3 | Baseline walk skipped silently | Mandatory phase; LR-048 checks it exists at authoring, nothing verified it executed. |
| RC-4 | Disabled date-grid + empty dropdowns never baseline-compared | Observed atypical/disabled states recorded as fact without the LR-ENC-001/LR-045 baseline check. |
| RC-5 | Env used to defer env-independent work; checkpoint-as-stopping-point | Only the full-suite run is env-blocked; baseline/catalog/spec/review are not. |
| RC-6 | Bug filed before baseline, with an invalid `baselineComparison` value | No validator enforced the enum or tied bug-filing to a baseline artifact. |
| RC-7 | Un-skipped tests without LR-019 hardening | No corollary requiring un-skip + per-test-baseline harden as one atomic change. |

### Framework gaps and how they were closed

| Gap | Hole | Closed by |
|---|---|---|
| GAP-A | No execution-time / exit-time phase-completion gate; closure machinery only runs on the `Status: DONE` flip → a silent checkpoint bypassed everything | Stage 2.1 execution-completion Stop-hook + LR-060 |
| GAP-B | Baseline walk mandated at authoring (LR-048) but never verified executed | Stage 2.1 hook checks mandated-phase artifacts exist; Stage 1 doctrine makes baseline a hard gate |
| GAP-C | Bug JSON accepted free-text `baselineComparison`; no baseline-before-filing tie | Stage 2.2 bug-baseline PreToolUse validator (DENY-capable) + LR-034 enforcement |
| GAP-D | No "N≥2 evidence before generalization" rule | Stage 2.3 LR-059 + FCC doctrine + reflection |
| GAP-E | No "verify-before-blocked" rule (overlay-clear + page-object-selector-vs-live-DOM) | Stage 2.3 LR-059 + patterns.md node + LR-021 link |
| GAP-F | Deferral discipline (LR-050) was restructure-only, not FCC/test-automation | Stage 2.4 LR-060 |
| GAP-G | Un-skip-without-harden had no corollary | Stage 2.4 LR-021 corollary |

---

## Stage 1 — FCC source plan + subplan template hardening (DONE)

- `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` gained a binding **§Anti-Assumption Gates** doctrine
  block (baseline-first hard gate; N≥2 evidence before generalization; verify-before-blocked;
  no env-rationalized deferral of env-independent work; atomic un-skip + harden; no silent
  checkpoint) plus the `ASSUMPTION-UNISOLATED` sweep row.
- `plans/pending/_TEMPLATE_SUBPLAN.md` promoted the baseline-first walk from an optional section to a
  non-deletable gate when the subplan drives TC corrections or files bugs, and carries the
  Anti-Assumption Gates checklist.

## Stage 2 — Permanent prevention (DONE)

- **2.1 Execution-completion Stop-hook** (GAP-A/B, detective + forcing-function):
  `.claude/hooks/execution-completion-gate.sh` + `.claude/hooks/lib/check-execution-completion.mjs`
  + `.claude/hooks/lib/test-execution-completion-fixtures.mjs`, registered in the Stop array. Warns
  when a session ends inside an `/execute` of a plan file whose mandated artifact is missing and no
  `## Deferral Authorization` block exists.
- **2.2 Bug-baseline PreToolUse validator** (GAP-C, DENY-capable):
  `.claude/hooks/lib/check-bug-baseline.mjs` + `.claude/hooks/lib/test-bug-baseline-fixtures.mjs`
  enforce the `baselineComparison` enum and the baseline-evidence tie on every `BUG-*.json` write.
- **2.3 / 2.4 Rules**: LR-059 (single-observation generalization ban + verify-before-blocked) in
  `.claude/rules/specs.md`; LR-060 (execution-completion / no-silent-checkpoint / FCC deferral
  discipline) in `.claude/rules/pipeline.md`; the un-skip+harden corollary on LR-021; a
  `.claude/context/patterns.md` decision-tree node.
- **2.5 Reflection**: dated `ALL-*` entries appended to
  `clients/encore/specs_planning/_internal/agent-mistakes.md` (one per RC family).
- **2.6 Defense-in-depth**: agent HARD STOPs mirroring the gates in the relevant `.claude/agents/*.md`.

## Stage 3 — Finish the pricing FCC work (tracked separately)

Stage 3 (baseline-first pricing walk → bug reclassification → catalog/spec/×2-green closure) is the
distinct, still-open piece. It is owned and tracked by the subplan below and is NOT claimed complete
in this plan.

handoff-target: SUBPLAN_PRICING_FCC.md

---

## Execution Summary

**Executed**: 2026-06-19 (Part 0 + Stage 1 + Stage 2). Stage 3 remains open under SUBPLAN_PRICING_FCC.md.

Delivered (all verified present on disk):
- Execution-completion Stop-hook: `.claude/hooks/lib/check-execution-completion.mjs` + `.claude/hooks/execution-completion-gate.sh` + `.claude/hooks/lib/test-execution-completion-fixtures.mjs`.
- Bug-baseline validator: `.claude/hooks/lib/check-bug-baseline.mjs` + `.claude/hooks/lib/test-bug-baseline-fixtures.mjs`.
- Rules: LR-059 in `.claude/rules/specs.md`; LR-060 in `.claude/rules/pipeline.md`; LR-021 un-skip+harden corollary.
- Patterns node: `.claude/context/patterns.md`.
- FCC doctrine: §Anti-Assumption Gates in `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` + `plans/pending/_TEMPLATE_SUBPLAN.md`.
- Reflection: `clients/encore/specs_planning/_internal/agent-mistakes.md` RC entries.
- Bug enum corrected: `clients/encore/reports/bugs/BUG-LOC-PRI-001.json` set to a valid enum value (Stage 3 reclassifies after the baseline walk).
- Note: this prevention plan is itself a precedent for `PLAN_EXHAUSTIVE_WALK_GUARANTEE` (LR-062), which closes the residual "partial-walk-taken-as-done" hole that the execution-completion hook (existence-only) did not.

TCs dropped: none (this plan is framework prevention, not test authoring; TC work lives in Stage 3 / SUBPLAN_PRICING_FCC.md).

Documentation changes: the audit verdict (Part 0) is preserved durably here rather than chat-only.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline (Stage 3) | `(skipped: Stage 3 baseline walk owned + tracked by SUBPLAN_PRICING_FCC.md)` | grep artifact freshness in SUBPLAN_PRICING_FCC |
| GIVER | test-cases / test-plan / XLSX (Stage 3) | `(skipped: Stage 3 catalog + parity owned by SUBPLAN_PRICING_FCC.md)` | `npm run check:tc-parity` exit 0 (Stage 3) |
| BUILDER | pricing spec (Stage 3) | `(skipped: Stage 3 spec hardening owned by SUBPLAN_PRICING_FCC.md)` | `npx playwright test --list` (Stage 3) |
| HEALER | `clients/encore/reports/bugs/BUG-LOC-PRI-001.json` | `clients/encore/reports/bugs/BUG-LOC-PRI-001.json` | `node .claude/hooks/lib/check-bug-baseline.mjs` PASS |
| WATCHDOG | Part 0 audit verdict | `(none)` | this plan §Part 0 |
| GARDENER | structural sweep (Stage 3) | `(skipped: Stage 3 structural sweep + typecheck owned by SUBPLAN_PRICING_FCC.md)` | `npm run typecheck` clean (Stage 3) |
| OWNER | hooks + rules + FCC doctrine + reflection | `.claude/hooks/execution-completion-gate.sh`<br>`.claude/hooks/lib/check-execution-completion.mjs`<br>`.claude/hooks/lib/check-bug-baseline.mjs`<br>`.claude/rules/specs.md`<br>`.claude/rules/pipeline.md`<br>`.claude/context/patterns.md`<br>`plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md`<br>`plans/pending/_TEMPLATE_SUBPLAN.md`<br>`clients/encore/specs_planning/_internal/agent-mistakes.md` | files exist + `.claude/settings.json` registers the hook |

---

## Acceptance criteria

- [x] **Stage 1**: FCC master has §Anti-Assumption Gates + the `ASSUMPTION-UNISOLATED` sweep; template carries the gates.
- [x] **Stage 2**: both hooks landed + registered; each has a passing `lib/test-*-fixtures.mjs`; LR-059 + LR-060 + the LR-021 corollary written; patterns node added; agent-mistakes RC entries present; bug enum valid.
- [x] **Stage 2 negative test**: the bug-baseline validator DENIES the invalid value and ALLOWS the valid enum (proven by its fixtures).
- [x] Part 0 audit verdict preserved durably in-repo.
- [ ] **Stage 3** (tracked by SUBPLAN_PRICING_FCC.md): baseline artifact + bug reclassification + Phases 2–6 + full-suite ×2 green — NOT in this plan's scope.

---

## Verification

```bash
# Stage 1 — gates present in FCC source + template
grep -c "Anti-Assumption Gates" plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md     # expect: >=1
grep -c "Anti-Assumption" plans/pending/_TEMPLATE_SUBPLAN.md                   # expect: >=1
# Stage 2 — hooks + rules landed + tested
node .claude/hooks/lib/test-execution-completion-fixtures.mjs                  # expect: all pass
node .claude/hooks/lib/test-bug-baseline-fixtures.mjs                          # expect: all pass
grep -c "LR-059" .claude/rules/specs.md                                        # expect: >=1
grep -c "LR-060" .claude/rules/pipeline.md                                     # expect: >=1
# Stage 3 (tracked separately by SUBPLAN_PRICING_FCC.md — NOT verified here):
#   ls clients/encore/specs_planning/_internal/old-site-baseline/pricing-<DATE>.md
#   npm run check:tc-parity
```

---

## Handoff

This plan turned the pricing-session defects into permanent, mostly-structural prevention: Stage 1
protects every future FCC subplan (baseline-first, N≥2, verify-before-blocked, no silent checkpoint);
Stage 2 added the execution-completion Stop-hook and the DENY-capable bug-baseline validator plus the
LR-059/LR-060 rules and reflection. The remaining pricing closure (Stage 3) is tracked by the subplan
named in the structured handoff above; it resumes baseline-first and drives the pricing suite to a
clean double-green close under the new gates.
