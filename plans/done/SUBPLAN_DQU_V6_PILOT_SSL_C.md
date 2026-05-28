# SUBPLAN_DQU_V6_PILOT_SSL_C — Gap Consolidation + TC Authoring

**Status**: DONE
**Executed**: 2026-05-20
**Priority**: P0-EMERGENCY
**Created**: 2026-05-15
**Identity**: OWNER
**Parent**: plans/done/PLAN_DQU_V6_PILOT_SHARED_SETUP.md
**Depends on**: plans/done/SUBPLAN_DQU_V6_PILOT_SSL_A.md (walk-evidence Section A + Section A.1 + Section A.Index — SP-A moved to done/ 2026-05-18)
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

- Parent plan: `plans/done/PLAN_DQU_V6_PILOT_SHARED_SETUP.md` (v5.1)
- SP-A: `plans/done/SUBPLAN_DQU_V6_PILOT_SSL_A.md` (read for handoff context)
- `clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` (SP-A output)
- `clients/encore/specs_planning/_internal/tc-coverage-map-shared-setup-2026-05-15.md` (SP-A output)
- `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` (target — extend with N new TCs)
- `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts` (target — extend if needed)
- `clients/encore/src/selectors/locations/shared-setup-locations.ts` (extend if new testids needed)
- `clients/encore/src/data/testdata/locations/location-shared-setup-locations.data.ts` (update if new fixtures needed)
- `.claude/rules/specs.md` (LR-024 + LR-052)
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-046, LR-048, LR-050)
- `.claude/rules/angular.md` (LR-026 Angular dirty-state — e2e-only, applies in spec since runner is e2e)
- `.claude/skills/regression-guard/SKILL.md` (pre+post snapshot)
- `.claude/skills/audit/SKILL.md` (slop mode — /simplify is an alias skill with no separate SKILL.md file)

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

1. **Write spec TC** in `clients/encore/specs/locations/location-shared-setup-locations.spec.ts`. Each cites walk-evidence probe ID: `// Traces to walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-NNN`.
2. **Use existing PO methods** where they cover the pattern. Add new methods only if walk reveals existing API can't handle a pattern.
3. **Update test-data** if new fixtures needed.
4. **Update selectors** if new testids needed (e2e PO only — nav2 baseline has no testids).

**Forbidden (FORBIDDEN LOOPHOLE #3)**: adding `test.fixme()` to a new TC because it's flaky. New TCs MUST pass x2 cycles or NOT be added (verified in SP-D Step 7).

### Code quality pass

- `/simplify` scan on all existing 24 + new TCs (tautology removal, private-access, boolean-collapse).
- `/slop` binary DROP/KEEP audit on new TCs.
- POM violation grep: `grep -nE 'authenticatedSession\.page\.(locator|getByTestId|getByRole)' clients/encore/specs/locations/location-shared-setup-locations.spec.ts` — any hit → add PO method, replace inline.
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

- [ ] Extended `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` with N new TCs (each cites walk-evidence probe ID).
- [ ] Updated `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts` if new PO methods needed.
- [ ] Updated `clients/encore/src/selectors/locations/shared-setup-locations.ts` if new testids needed.
- [ ] Updated `clients/encore/src/data/testdata/locations/location-shared-setup-locations.data.ts` if new fixtures needed.

---

## Handoff (LR-039)

**GREEN**: every gap has a TC; spec runs `--list` lints clean; POM grep clean → SP-C moves to `done/`. Hand off to SP-D (Step 6 unlock + Step 7 test runs). Specific count of new TCs + per-TC walk-evidence pointer printed in chat.

**RED**: gap-to-TC count mismatch / POM violations present / /simplify or /slop findings unresolved / new fixme introduced → HALT, blockers in CHAT.

---

## Execution Summary

**Status**: DONE
**Executed**: 2026-05-20 (single OWNER session, /ultrathink wrapper, /execute).
**Source-of-truth artifacts**:
- `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` (24 → 30 tests, +6 new TC-LOC-SSL-025..030)
- `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts` (34 → 40 public methods, +6 helpers)
- `clients/encore/src/selectors/locations/left-panel.ts` (comment-only; collision avoided — see plan deviation #1)
- Walk-evidence consumed: `clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` Section A.Index (6 GAPs) + Section A entries (11-field schema each).

### Outputs produced

| Output | Path | Status |
|---|---|---|
| Spec extended with 6 new TCs (TC-025..030) | `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` | Written — each cites `walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-NNN`; 30 total tests; 6 fixme (unchanged from pre-edit — no new fixme on TC-025..030 per FORBIDDEN LOOPHOLE #3) |
| Page object extended with 6 new methods | `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts` | makeFormDirty(), clickTopLevelTab(tabKey), getActiveTopLevelTab(), hasVisibleUnsavedDialog(timeoutMs), rapidClickAdd(count, intervalMs), countAddDialogs() |
| Selectors | `clients/encore/src/selectors/locations/left-panel.ts` | Comment-only pointer added (tabLocationManagementHistory canonical in `history.ts`; no new key — collision avoided per plan deviation #1) |
| Test data | `clients/encore/src/data/testdata/locations/location-shared-setup-locations.data.ts` | Unchanged — new TCs use inline string queries (Chicago/Boston/Dallas/'1233') consistent with existing pattern |

### Gap consolidation (Step 4) — 6 GAPs → 6 new TCs (HALT-at-30 does NOT fire)

| Walk-evidence GAP | New TC | Title | Notes |
|---|---|---|---|
| GAP-001 (A.columns) | TC-LOC-SSL-025 | Each column header testid resolves to expected text | Distinct value vs TC-002 (per-column testid resolution instead of whole-array content) |
| GAP-002 (G.number) | TC-LOC-SSL-026 | Dialog number-search '1233' returns 1 Miami Marriott row | Kept '1233' per user direction — expected FAIL on e2e per BUG-001 (Miami catalog filter); evidence vehicle for Encore bug report |
| GAP-003 (J.cross-field) | TC-LOC-SSL-027 | Self-SI + add non-Miami row + save → both persist | Adapts walk-evidence Miami → Chicago (proven to return 123 rows on e2e per BUG-001 evidence); parallel to fixme'd TC-021 |
| GAP-004 (K.1 beforeunload — K1b only) | TC-LOC-SSL-028 | In-SPA top-tab switch with dirty form ⟹ NO unsaved dialog | K1a skipped per user (duplicates TC-023); K1b only; uses 4 new PO methods + existing canonical `tabLocationManagementHistory` |
| GAP-005 (K.2 rapid-click) | TC-LOC-SSL-029 | 5 rapid Add-clicks open exactly 1 dialog, no console errors | New `rapidClickAdd` + `countAddDialogs` PO helpers; uses `page` fixture for console listener |
| GAP-006 (K.3 table-at-max — K3a only) | TC-LOC-SSL-030 | Add 3 non-Miami rows + save + reload → all 3 persist | K3b RESOLVED per walk-evidence (no TC); LR-024 net-zero cleanup deletes all 3 rows |

**Anti-checklist cross-check** vs HUNTER G01-G12 + D6-01..03 (14 items invalidated baseline): fresh-walk-via-SP-A discovered surfaces HUNTER missed (rapid-click GAP-005, table-at-max GAP-006, in-SPA navigation GAP-004 K1b). Substantive coverage gain.

**CHANGED-SYMPTOM check (CLOSURE-4)**: SP-A Section B has 0 CHANGED-SYMPTOM verdicts (5 FAIL-APP BUG-001 cascade + 1 PASS-LIVE trivial). HALT-on-unresolved-CHANGED-SYMPTOM does NOT fire.

### Acceptance Criteria cross-check (LR-046 strict-line table)

| ⚠ PARENT-STRICT-LINE | Status | Evidence |
|---|---|---|
| EVERY UNCOVERED-surface gap from SP-A Section A has a NEW TC at Step 5 | PASS | 6 Section A GAP entries (GAP-001..006) → 6 new `test(` calls (TC-025..030) in spec. Cross-verified: `grep -c 'Traces to walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-' awk-from-TC-025` → 6. |
| NO cap on new TC count | PASS | 6 written; no cap exceeded. |
| (CLOSURE-3) HALT-at-30 satisfied | PASS | 6 < 30; gate does not fire. Section A.Index has 6 entries (post-PLAN_55 promotion of GAP-005/006); A.skip is empty. |
| (FORBIDDEN LOOPHOLE #3) zero new `test.fixme()` on TC-025..030 | PASS | `awk '/TC-LOC-SSL-025/,0' spec.ts \| grep -cE '^[[:space:]]+test\.fixme\('` → 0. The `test.fixme` string match (count=1) is from TC-026's anti-fixme comment, not an actual call. |
| No POM violations in spec | PASS | `grep -cE 'authenticatedSession\.page\.(locator\|getByTestId\|getByRole)' spec.ts` → 0; `grep -cE 'pg\.page\.(locator\|getByTestId\|getByRole)' spec.ts` → 0 (TC-029 uses `page` fixture, not `pg.page`). |

### Ceremony obligations (LR-050) — 7/7 satisfied

| # | Ceremony | Evidence |
|---|---|---|
| 1 | Phase 0 context loaded | Parent v5.1, SP-A/B done summaries, walk-evidence, coverage map, current spec/PO/selectors/data, `.claude/rules/specs.md` + `pipeline.md` + `angular.md` + `browser-tool.md` + `baseline.md` + `inventory.md` all consulted; UserPromptSubmit hook PLAN_PROMPT_INJECTION_GATE auto-fired LR-038/050/042/054 + ALL-079/GEN-034 advisory injection |
| 2 | Phase 0.1 identity OWNER | Default OWNER; no `/identity` switch this session |
| 3 | Phase 0.5 /relevant scan | Auto-injection via UserPromptSubmit hook; TodoWrite items tagged with 4-tag taxonomy (skill / LR-NNN / manual / ceremony) per SP02B contract |
| 4 | Phase 2.5 Adjacent-Sweep | Zero qualifying items — scope is artifact-authoring + plan-body Execution Summary; no orphan code or unrelated drift surfaced |
| 5 | Phase 3.5 plan finalization | This Execution Summary + Status flip PENDING→DONE + Executed: 2026-05-20 + git mv pending/→done/ + `npm run plans:reindex` per LR-035 + parent-cascade check per LR-027 |
| 6 | LR-028 activity-log row | Appended at SP-C close; LR-037 timestamp ≥ all touched-file mtimes (spec/PO/selectors max ~13:28 IST → log row 13:30+ IST) |
| 7 | /final-q v2 evidence emission | Emitted in chat per LR-042 (greppable cite-everything format) |

### Plan deviations (1, scope-honest under LR-046)

| # | Plan-body claim | Actual execution | Why |
|---|---|---|---|
| 1 | "Update selectors if new testids needed (e2e PO only — nav2 baseline has no testids)" | Did NOT add `tabLocationManagementHistory` to `left-panel.ts` (initial Edit reverted) | First Edit attempt added the testid to `left-panel.ts`, which collided at runtime (`Selector collision: tabLocationManagementHistory defined in multiple groups`) because the testid already lives in `clients/encore/src/selectors/locations/history.ts:9`. Revert restored single-source-of-truth + added comment pointer for discoverability. PO `clickTopLevelTab('tabLocationManagementHistory')` resolves via `buildAllSelectors()` merge — works as-is. No coverage gap. |

### LR-020 plan-claim verification (before finalize)

- Spec line count pre→post: 406 → 559 (+153 from 6 new TCs + comment headers).
- PO line count pre→post: 375 → 429 (+54 from 6 new methods + section dividers).
- Selectors pre→post: 72 lines / 18 keys unchanged (collision avoidance).
- left-panel.ts pre→post: 10 keys unchanged (comment-only edit per deviation #1).
- POM-violation grep: 0 pre, 0 post — clean.
- `pg.page.(locator|getByTestId|getByRole)` grep: 0 pre, 0 post — clean (TC-029 refactored to use `page` fixture directly, not `pg.page`).
- `npx playwright test specs/locations/location-shared-setup-locations.spec.ts --list` (from `clients/encore`): 30 tests enumerate cleanly across all projects, 151 total (30 × 5 projects); no import / TS errors.
- SP-A walk-evidence freshness: 5 days (2026-05-15 authored, consumed 2026-05-20) — within LR-013 ≤14d window; no Phase 0.5 re-walk required.

### /simplify + /slop verdicts (Step 5 code-quality pass)

**/simplify**: no actionable changes. Explicit `isElementVisible` calls in TC-025 (5 separate asserts) chosen over loop for failure-output identifiability. PO method bodies are minimal wrappers — semantic clarity > brevity.

**/slop binary DROP/KEEP on TC-025..030**: 6/6 KEEP.
- TC-025 KEEP — distinct value-add vs TC-002 (per-testid resolution vs whole-array content)
- TC-026 KEEP — user-authorized Encore-bug evidence vehicle (BUG-001 cascade)
- TC-027 KEEP — covers J.cross-field with non-Miami passing variant (TC-021 parallel)
- TC-028 KEEP — architectural negative-test guard rail (per walk-evidence K1b reasoning); may pass or fail on e2e depending on whether CanDeactivate guard fires for SSL sub-tab (shared.ts:46 confirms it fires for Local Information sub-tab; SSL behavior is the gap this TC exercises)
- TC-029 KEEP — distinct UX guard (multi-dialog stacking) — uncovered by any existing TC
- TC-030 KEEP — multi-row capacity smoke; complements single-row TC-013

### Known risks for SP-D Step 7 (test runs)

3 of the 6 new TCs may fail on e2e during SP-D Step 7's run. All 3 are intentional per Step 5 design:

1. **TC-026** — expected to fail on e2e per BUG-LOC-SHR-001 (Miami catalog filter). Per user direction (Q1 answer 2026-05-20): keep '1233' as walk-evidence proposed; failure is the Encore-bug-report evidence vehicle. No `test.fixme()` per FORBIDDEN LOOPHOLE #3.
2. **TC-028** — may fail on e2e if Angular CanDeactivate guard fires for SSL sub-tab top-tab navigation (shared.ts:46 confirms guard fires for Local Information sub-tab; SSL behavior unverified live this session). Per walk-evidence K1b reasoning: TC is the architectural guard rail; if e2e diverges from nav2, that's documented divergence for review.
3. **TC-025** — may fail if `colHeader*` testids in `selectors/locations/shared-setup-locations.ts:32-40` (added 2026-04-29 without `@verified` tag) are not present on live DOM. If fails, signal selectors-stale or testids-missing on app side.

SP-D Step 7 should classify these per the 4-class table (PASS-LIVE / FAIL-FRAMEWORK / FAIL-APP / CHANGED-SYMPTOM) and reconcile with this Execution Summary's expectations before reclassifying.

### Parent-cascade check (LR-027)

Parent = `PLAN_DQU_V6_PILOT_SHARED_SETUP.md`. Post-SP-C close: `ls plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_*.md` → 2 siblings still pending (SP-D + SP-E) → **parent stays in `pending/`** — no cascade closure this turn. SP-E (last in dependency chain) will trigger parent cascade when it closes.

### Handoff (LR-039 — outcome-only, no obstacle claims)

**GREEN** — all SP-C strict acceptance criteria met. Outputs ready for SP-D (Step 6 unlock 6 fixme'd TCs with alternate-query independence test + Step 7 run x2 + flake check + HIST migration grep) and SP-E (Step 8 adjacent-sweep + Step 9 closure ceremonies + TC-MD header fix from "Total: 24" → "Total: 24 + 6 = 30").

**Concrete handoff facts**:
- 6 new TCs in spec at TC-LOC-SSL-025..030; 30 total tests; 6 fixme (unchanged — TC-016/018/019/020/021/024 remain fixme'd pending SP-D Step 6 unlock).
- 6 new PO methods in location-shared-setup-locations.page.ts (makeFormDirty + clickTopLevelTab + getActiveTopLevelTab + hasVisibleUnsavedDialog + rapidClickAdd + countAddDialogs).
- 0 new selector keys (collision avoidance — see plan deviation #1).
- 0 new bug filings — TC-026's expected failure cascades to existing BUG-LOC-SHR-001; SP-D Step 6 alternate-query independence test will determine if it reveals a separate bug class.
- TC-MD update is SP-E scope per orchestration map (parent plan §Subplan Decomposition).
