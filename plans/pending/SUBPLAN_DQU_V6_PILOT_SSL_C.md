# SUBPLAN_DQU_V6_PILOT_SSL_C — Gap Consolidation + TC Authoring

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-15
**Identity**: OWNER
**Parent**: plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md
**Depends on**: plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_A.md (walk-evidence Section A + Section A.1 + Section A.Index)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none
**Justification**: spec authoring + page-object additions + /simplify + /slop + POM grep — pure file work, no live DOM. /audit + /regression-guard wrap. Opus xhi per LR-041 (multi-rule judgment over gaps).

---

## Context

Gap consolidation + TC authoring arm of the v5.1-chunked PLAN_DQU_V6_PILOT_SHARED_SETUP execution. Owns Step 4 + Step 5 of the parent plan.

Consumes SP-A's `walk-evidence-shared-setup-2026-05-15.md` Section A (with 11-field gap evidence schema per CLOSURE-3) and `tc-coverage-map-shared-setup-2026-05-15.md`. Produces extended `location-shared-setup-locations.spec.ts` with N new TCs + updated `location-shared-setup-locations.page.ts` if walk reveals existing PO API can't handle a pattern.

---

## Phase 0 dependency gate

- **HARD GATE**: SP-A `Status: DONE` AND `walk-evidence-shared-setup-2026-05-15.md` exists with Section A (deep walk + 11-field schema) AND Section A.Index (complete) AND Section A.1 (COVERED-SMOKE-PASS). If SP-A not done OR walk-evidence missing/incomplete → HALT, ask user.
- Verify Section A.Index gap count: if > 30 AND index complete → parent-plan Step 4 HALT-at-30 fires; surface to user before continuing.

---

## Bootstrap

- Parent plan: `plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md` (v5.1)
- SP-A: `plans/done/SUBPLAN_DQU_V6_PILOT_SSL_A.md` (read for handoff context)
- `clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` (SP-A output)
- `clients/encore/specs_planning/_internal/tc-coverage-map-shared-setup-2026-05-15.md` (SP-A output)
- `clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts` (target — extend with N new TCs)
- `clients/encore/src/pages/setup/locations/location-shared-setup-locations.page.ts` (target — extend if needed)
- `clients/encore/src/selectors/setup/locations/shared-setup-locations.ts` (extend if new testids needed)
- `clients/encore/tests/test-data/setup/locations/location-shared-setup-locations.data.ts` (update if new fixtures needed)
- `.claude/rules/specs.md` (LR-024 + LR-052)
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-046, LR-048, LR-050)
- `.claude/rules/angular.md` (LR-026 Angular dirty-state — e2e-only, applies in spec since runner is e2e)
- `.claude/skills/regression-guard/SKILL.md` (pre+post snapshot)
- `.claude/skills/simplify/SKILL.md` + `.claude/skills/audit/SKILL.md` (slop mode)

---

## Phase 0 — bootstrap ceremonies

1. Identity OWNER confirmed.
2. `/relevant` scan.
3. LR-020: verify SP-A outputs exist + parent at v5.1.
4. **No browser tool** — declare `BrowserTool: none` in first output.
5. `/regression-guard` pre-snapshot (structural fingerprint via the SKILL invocation — audit-note #2: NOT stat).

## Phase 0.5b — Baseline-first walk

Title doesn't include "audit"/"find-bugs"/"neutral-eye"; subplan does drive TC corrections via Step 5 spec writes. Phase 0.5b consumed SP-A's `walk-evidence-shared-setup-2026-05-15.md` (Section A + index) as baseline; no fresh walk required in this subplan since SP-A produced it 2026-05-15.

---

## Step 4 — Gap consolidation (no cap)

Aggregate inputs:
- SP-A Section A findings (11-field gap schema, indexed) — the discovery source.
- SP-A Section B classifications — informs Step 6 (SP-D) unlock decisions, NOT direct TC-write input.
- SP-B HIST findings — pointer for any HIST-related new TCs.

Produce missing-TC list per gap: `{id (TC-LOC-SSL-NNN draft), title (from Section A.proposed-TC-title), surface-area, source-evidence-pointer (Section A:GAP-NNN at file:line)}`.

**Anti-checklist (parent plan)**: cross-check fresh-walk gaps against HUNTER's G01-G12 + D6-01..03 (14 items). Confirm fresh walk found at least all 14; flag additional gaps fresh walk found that HUNTER missed.

**HALT-gates (v5.1 CLOSURE-3 + parent)**:
- Missing TCs > 30 AND Section A.Index complete → HALT, ask user (multi-session split or scope-cut).
- Missing TCs > 30 with incomplete-evidence entries → HALT, ask user; agent must re-walk to complete evidence first (SP-A re-open).
- "covered-probe-divergence" from Section A.1 → already HALTed at SP-A; if user direction unclear at this point, HALT-and-ask.
- CHANGED-SYMPTOM classifications in SP-A Section B not resolved (no code-update done per CLOSURE-4) → HALT-and-ask SP-A re-open.

**Audit-note #6 (token-budget reality)**: if single-session burn approaches 200k tokens during Step 5 spec authoring, narrow scope to LR-046 strict line (parent's "every UNCOVERED gap has NEW TC") and surface remaining gaps for SP-C-followup. No silent rescoping — explicit handoff to user.

---

## Step 5 — Write tests + code quality

For every missing TC in the gap-consolidation list:

1. **Write spec TC** in `clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts`. Each cites walk-evidence probe ID: `// Traces to walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-NNN`.
2. **Use existing PO methods** where they cover the pattern. Add new methods only if walk reveals existing API can't handle a pattern.
3. **Update test-data** if new fixtures needed.
4. **Update selectors** if new testids needed (e2e PO only — nav2 baseline has no testids).

**Forbidden (FORBIDDEN LOOPHOLE #3)**: adding `test.fixme()` to a new TC because it's flaky. New TCs MUST pass x2 cycles or NOT be added (verified in SP-D Step 7).

### Code quality pass

- `/simplify` scan on all existing 24 + new TCs (tautology removal, private-access, boolean-collapse).
- `/slop` binary DROP/KEEP audit on new TCs.
- POM violation grep: `grep -nE 'authenticatedSession\.page\.(locator|getByTestId|getByRole)' clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts` — any hit → add PO method, replace inline.
- Page object honesty: new methods follow raw-vs-persistent naming convention.

---

## Acceptance Criteria

### Strict (LR-046 — inherits from parent v5.1)

- [ ] ⚠ **PARENT-STRICT-LINE** EVERY UNCOVERED-surface gap from SP-A Section A has a NEW TC in the spec at Step 5 (no skipped gaps). Cross-verified with `grep -c "GAP-" walk-evidence-shared-setup-2026-05-15.md` matching count of new `test(` in the spec.
- [ ] ⚠ **PARENT-STRICT-LINE** NO cap on new TC count (discovered count = the count).
- [ ] ⚠ **PARENT-STRICT-LINE (CLOSURE-3)** HALT-at-30 path satisfied per evidence completeness: either ≤30 gaps OR >30 gaps with complete index AND user-acknowledged scope decision.
- [ ] ⚠ **FORBIDDEN LOOPHOLE #3**: zero new `test.fixme()` introduced on Step 5 TCs.
- [ ] No POM violations in the spec (grep clean).

### Ceremony (LR-050)

- [ ] Phase 0 context loaded.
- [ ] Identity OWNER confirmed.
- [ ] /relevant scan run.
- [ ] /regression-guard pre-snapshot via skill invocation.
- [ ] /simplify pass on existing + new TCs.
- [ ] /slop binary pass on new TCs.
- [ ] /regression-guard post-snapshot via skill invocation; silent-breakage diff captured.
- [ ] LR-028 activity-log row.
- [ ] LR-027 SP-C Execution Summary + git mv + parent-cascade check.

### Outputs

- [ ] Extended `clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts` with N new TCs (each cites walk-evidence probe ID).
- [ ] Updated `clients/encore/src/pages/setup/locations/location-shared-setup-locations.page.ts` if new PO methods needed.
- [ ] Updated `clients/encore/src/selectors/setup/locations/shared-setup-locations.ts` if new testids needed.
- [ ] Updated `clients/encore/tests/test-data/setup/locations/location-shared-setup-locations.data.ts` if new fixtures needed.

---

## Handoff (LR-039)

**GREEN**: every gap has a TC; spec runs `--list` lints clean; POM grep clean → SP-C moves to `done/`. Hand off to SP-D (Step 6 unlock + Step 7 test runs). Specific count of new TCs + per-TC walk-evidence pointer printed in chat.

**RED**: gap-to-TC count mismatch / POM violations present / /simplify or /slop findings unresolved / new fixme introduced → HALT, blockers in CHAT.
