# SUBPLAN_CORP_PRICING_RCA_PREVENTION — Fix the root causes (positive-control, enumeration, no-red-close, empty-surface) + keep identities current

**Status**: DONE
**Executed**: 2026-06-23
**Priority**: P0
**Created**: 2026-06-19
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_REWALK_REMEDIATION.md
**Depends on**: none
**Blocks**: SUBPLAN_CORP_PRICING_REWALK_AUDIT.md
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: multi-rule judgment + closure-gate authoring across rules/hooks/agent-prompts (Opus max per LR-041).

---

## Context

The Corporate Pricing misses (drag false-negative, stale toolbar, override picker/Labor never seen, empty-state accepted) share one deepest cause: **negative/terminal claims had no machine oracle requiring positive proof, and advisory rules weren't enforced or synced into the 5 identities** (RCA 2026-06-19, see parent §RCA). This subplan lands the permanent, slop-free guards — in **announce** mode so they govern the re-walk + remediation without retroactively blocking in-flight work — and embeds each guard at point-of-action in every owning identity, plus a parity check so identities can't fall behind again. Runs FIRST so A–D execute under the new regime.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/upgrade` (anti-slop — self-referential rule applicability, BEFORE any mint)
- `/slop` (DROP/KEEP on every proposed rule/prompt edit)
- `/regression-guard` (wrap — scripts touched)
- `/relevant` (Phase 0.5 injection)
- `/review` (post-edit)
- `/final-q` (exit per LR-042)

**Context files**:
- `PLAN_CORP_PRICING_REWALK_REMEDIATION.md` (parent — §RCA table is the spec)
- `.claude/rules/pipeline.md` (LR-040, LR-046, LR-060)
- `.claude/rules/specs.md` (LR-019, LR-061)
- `.claude/rules/inventory.md` (LR-029, LR-057, LR-062)
- `.claude/rules/plan-closure.md` (LR-055 C1–C6 + the ramp-knob precedent)
- `.claude/rules/browser-tool.md` (LR-038/LR-054 — for the LR-061 click-primitive embed)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-*)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)
- `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT}.md`
- `scripts/walk-coverage/enumerate-page.mjs`, `scripts/validate-plan-closure.mjs`, `.claude/closure-config.json`

**Anti-Assumption Gates**:
- [x] Phase 0.5b — baseline-absent (governance/framework subplan, no live UI; `baselineScope: baseline-absent` per LR-ENC-001).
- [x] No new rule minted without a recorded `/upgrade` "already-solved?" check (anti-slop, Gate spirit) — verdicts recorded in Execution Summary (all EXTEND / apply-existing; one NET parity script).
- [x] All guards land in **announce** mode (no premature hard-block = no self-inflicted slop) — `test_status_mode: announce`; Ct/C6/Cx all verdict-neutral.
- [x] All phases complete (no Deferral Authorization needed); the live enumerator denominator run is the keystone re-walk (Subplan A), not a deferral of THIS subplan's scope (`BrowserTool: none`).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)
1. `Depends on: none` → proceed.
2. Read `.claude/context/navigation.md` Exploration Registry (LR-062 walk-enumerator row ~110; Corp Pricing rows ~102–108).
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` (ALL-*, the 2026-06-18 RC-1..RC-7 entries, the override false-negative).
4. Read `.claude/context/patterns.md` (un-drivable / corrupt / control-does-nothing decision trees).
5. LR scan: LR-040, LR-046, LR-055, LR-060, LR-061, LR-062, LR-029, LR-057.
6. Browser-tool announcement: `BrowserTool=none` (framework edits only).

## Phase 0.5b — Baseline-first walk
`baselineScope: baseline-absent` — this subplan edits framework rules/hooks/agent-prompts/scripts, touches no live website. No baseline walk applies (declared per LR-ENC-001, NOT a silent skip).

## Phase 1 — Anti-slop gate FIRST (per proposed change)
For M1/M3/M4 + META, run `/upgrade` (does an equivalent rule already exist?) + `/slop` DROP/KEEP. Record each verdict (EXTEND vs MINT) in the Execution Summary. Prefer EXTEND. No rule lands without this record.

## Phase 2 — M2 apply-existing (lands BEFORE Subplan A)
1. Add 5 Corp Pricing entries to `scripts/walk-coverage/enumerate-page.mjs` MODULE_CONFIG: `corporate-pricing-search`, `corporate-pricing-strategy`, `corporate-pricing-detail`, `corporate-pricing-new-pricebook`, `corporate-pricing-override` (paths + content markers + opener patterns; override needs a specific-currency precondition note per NM-1472).
2. `/regression-guard` + `npm run typecheck` on the script.

## Phase 3 — M1 positive-control guard (EXTEND LR-061)
1. Extend `LR-061` in `.claude/rules/specs.md`: positive-control corollary (prove the same primitive mutates a known-positive case before any inert/defensive/un-drivable verdict) + raw-JS-vs-Playwright-`.click()` React rule + ban `.dragTo()` for DnD (full pointer-sequence required).
2. Embed at point-of-action in all 5 agent prompts (HEALER first — it has no inline embed today).

## Phase 4 — M3 no-red-close guard (NET, reuse ramp infra)
1. Add a test-status check to `scripts/validate-plan-closure.mjs`: no `Status: DONE` flip while owned spec tests are red unless a `## Deferral Authorization` names the red TC IDs **and** points to a PENDING recipient subplan (never a task chip).
2. Add a `test_status_mode` knob to `.claude/closure-config.json` (default **announce**; mirrors `c6_mode`/`coverage_mode`).
3. Extend `LR-060` to forbid task-chip test-status deferral; embed in GENERATOR/HEALER/AUDIT prompts + reference in `/final-q`.
4. Companion: a minimal staleness refresh-trigger note (field-inventory §7 → planner/generator load check).

## Phase 5 — M4 empty-surface guard (EXTEND LR-040(c))
1. Extend `LR-040(c)` in `.claude/rules/pipeline.md` with c.1 (record HOW the surface populates: UI path / Jira ID / admin setup / which office has data), c.2 (classify data-blocked vs feature-blocked vs by-design), c.3 (escalate via `/encore-questions` if unknown).
2. Embed as a HARD STOP in `.claude/agents/REQUIREMENTS.md` + `.claude/agents/PLANNER.md`.

## Phase 6 — META identity-currency parity check
1. Add a small LR-embed parity check (script or `/compile-learnings` step) flagging any LR that names an owning agent but is not embedded in that agent's prompt.
2. Run it; close any gap it reports.

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)
Any adjacent rule/prompt drift noticed → DO-NOW (same file, <30 min) / SPAWN / APPEND with grep-verified line. Bare "out of scope" = HALT + ask.

## Per-Identity Satisfaction
| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | rules + hooks + agent prompts + scripts (governance) | `.claude/rules/specs.md`<br>`.claude/rules/pipeline.md`<br>`scripts/validate-plan-closure.mjs`<br>`.claude/closure-config.json`<br>`scripts/walk-coverage/enumerate-page.mjs`<br>`scripts/check-lr-embed-parity.mjs`<br>`.claude/agents/REQUIREMENTS.md`<br>`.claude/agents/PLANNER.md`<br>`.claude/agents/GENERATOR.md`<br>`.claude/agents/HEALER.md`<br>`.claude/agents/AUDIT.md` | `npm run typecheck` exit 0; `node scripts/validate-plan-closure.mjs --self-test` 26/26; `npm run check:lr-embed-parity` exit 0 |

## Acceptance criteria
- [x] Every fix is EXTEND or a mint with a recorded `/upgrade` "already-solved?" verdict (anti-slop) — M1/M4 EXTEND, M2 apply-existing, M3 EXTEND LR-060 + NET Ct (reuses ramp infra), META one NET parity script (verdicts in Execution Summary).
- [x] M2: 5 Corp Pricing MODULE_CONFIG entries present (search/strategy/detail/new-pricebook/override); structurally validated (node --check + 20/20 fixture self-test). The live `walk:enumerate --module=corporate-pricing-override` denominator run is carried by the keystone re-walk `SUBPLAN_CORP_PRICING_REWALK_AUDIT.md` (lines 70+105) per `BrowserTool: none` — not deferred work of this subplan.
- [x] M1/M3/M4 guards present in **announce** mode; embedded in their owning agent prompts (LR-061 in all 5; LR-060 in GENERATOR/HEALER/AUDIT; LR-040(c) in REQUIREMENTS/PLANNER).
- [x] META parity check exits 0 (18/18 embed-mandated (lr,agent) pairs present).
- [x] `/regression-guard` before/after on scripts = no silent breakage (self-test 26/26, fixtures 20/20, function inventory additive-only); `npm run typecheck` exit 0.
- [x] Activity-log row appended per LR-028; `/final-q` verdict emitted (Phase 4).

## Verification
```bash
npm run walk:enumerate -- --office=1604 --module=corporate-pricing-override  # expect: enumerated denominator
node scripts/validate-plan-closure.mjs --dry-run                            # expect: exit 0
grep -n "positive-control" .claude/rules/specs.md                          # expect: LR-061 corollary present
grep -n "test_status_mode" .claude/closure-config.json                     # expect: announce
```

## Execution Summary

**Executed**: 2026-06-23 (OWNER, single session). All six work-streams (M1–M4 + META + M2 apply-existing) landed in **announce** mode; deny-ramp deferred to Subplan D per design.

**Anti-slop verdicts (Phase 1 `/upgrade` + `/slop`, recorded per the no-mint-without-check gate):**
- M1 → **EXTEND `LR-061`** (LR-061-B was "try harder", not "prove the primitive fires on a known-positive"). KEEP.
- M2 → **APPLY-EXISTING** (LR-062 enumerator already built; only 5 MODULE_CONFIG entries added). KEEP.
- M3 → **EXTEND `LR-060`** (obligation 3) + **NET check `Ct`** reusing the C6/Cx ramp infra (no parallel mechanism). KEEP.
- M4 → **EXTEND `LR-040(c)`** (the rule permitted "flag empty + refresh later"). KEEP.
- META → **one NET script** `scripts/check-lr-embed-parity.mjs` (`sync-agent-mistakes.ts` is a no-op; no existing parity mechanism). KEEP-minimal.

**M2 — enumerator config (`scripts/walk-coverage/enumerate-page.mjs`):** added 5 entries — `corporate-pricing-search`/`-strategy`/`-detail`/`-new-pricebook`/`-override` (paths + text/role content markers since these screens ship near-zero data-testids; override carries the NM-1472 currency-gated-picker precondition note + the Labor-on-1101/NM-1881 note at point-of-action). `node --check` clean; `npm run walk:enumerate:test` 20/20. The live denominator run is the keystone re-walk `SUBPLAN_CORP_PRICING_REWALK_AUDIT.md` (lines 70 + 105 invoke `walk:enumerate` per-page + on override), per `BrowserTool: none`.

**M1 — positive-control (`.claude/rules/specs.md` LR-061 §C):** added the positive-control corollary (prove the same primitive mutates a known-positive case before any inert/un-drivable/does-not-add verdict) + the raw-JS-`.click()`-vs-Playwright-`.click()` React rule + the ban on `.dragTo()` for DnD (full pointer sequence required). Embedded in all 5 agent prompts — HEALER (new HARD STOP #9) and PLANNER (new #21) had no LR-061 embed; REQUIREMENTS/GENERATOR/AUDIT augmented their existing embeds.

**M3 — no-red-close:** new closure-check **Ct** in `scripts/validate-plan-closure.mjs` (`resolveTestStatusMode` + `checkCt`, folds into the verdict only under `deny`) — negative-tested: FAIL on a task-chip + red-test line, FAIL on a test-status `## Deferral Authorization` missing TC IDs / a PENDING recipient, PASS on a clean body. Knob `test_status_mode: announce` added to `.claude/closure-config.json`. `LR-060` extended with obligation 3 (no DONE flip with red tests routed to a task chip) + embedded in GENERATOR (#15) / HEALER (#10) / AUDIT (#1.6) + referenced in `/final-q` (Step 6.0.6). Companion staleness note added to `field-inventory-spec.md` §7 (Refresh triggers is a load-check input, not decoration).

**M4 — empty-surface (`.claude/rules/pipeline.md` LR-040(c)):** added the (c) empty-surface extension (c.1 population path / c.2 data-blocked-vs-feature-blocked-vs-by-design / c.3 escalate-if-unknown) + embedded as HARD STOP in REQUIREMENTS (#12) and PLANNER (#22).

**META — parity (`scripts/check-lr-embed-parity.mjs`, `npm run check:lr-embed-parity`):** curated registry of embed-mandated (LR, agent) pairs; run → `[PASS] all 18 pairs present`, exit 0. Zero gaps to close (the M1/M3/M4 embeds satisfy it).

**Verification (regression-guard before/after — no silent breakage):** closure-validator self-test 26/26; enumerator fixtures 20/20; LR-embed parity 18/18; `npm run typecheck` exit 0; `node --check` clean on all three `.mjs`; closure-validator function inventory additive-only (added `checkCt` + `resolveTestStatusMode`, removed none); `.claude/closure-config.json` parses. Dry-run closure on this plan: C1/C3/C4/C5/C6/Cx/Ct all PASS (the new guards do not false-positive on this subplan).

**Deviations from plan:** none in scope. The only acceptance line not met IN this subplan is the *live* `walk:enumerate` denominator — by design carried by the keystone re-walk (named PENDING recipient, grep-verified), not deferred work of this `BrowserTool: none` governance subplan.

## Handoff
Lands the four permanent guards (positive-control, enumeration-applied-to-Corp-Pricing, no-red-close, empty-surface) in announce mode plus the identity-parity check; Subplan A inherits the enumerator config and runs its re-walk under the new oracle. Deny-ramp is deferred to Subplan D after the guards are negative-tested.
