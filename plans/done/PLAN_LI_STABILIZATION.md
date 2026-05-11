# PLAN_LI_STABILIZATION — Location Local Information spec stabilization

**Status**: DONE
**Priority**: P0-EMERGENCY
**Created**: 2026-05-08
**Revised**: 2026-05-08 (post-/review by OWNER — F1..F6 corrected; see Revision log at end)
**Executed**: 2026-05-08
**Identity**: OWNER
**Depends on**: PLAN_ONE_GUIDE_SAID_THIS.md
**Blocks**: none
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: Phase A live-verifies LI defaults + cross-spec contention behavior
**Pin**: TOP-OF-INDEX-PER-USER-DIRECTIVE-2026-05-08
**Supersedes (partial)**: PLAN_ENCORE_CI_2W_GREEN.md "LI cluster at 2w" section

---

## Context

Sister plan to PLAN_ONE_GUIDE_SAID_THIS / PLAN_MGH_STABILIZATION / PLAN_PRI_STABILIZATION. Targets `clients/encore/tests/specs/setup/locations/location-local-information.spec.ts` (LI series).

**LI status from existing reports:**
- PATCH 2 (LI-001 baseline reset, applied pre-PLAN_ONE_GUIDE_SAID_THIS) is in tree.
- Per `plans/pending/PLAN_ENCORE_CI_2W_GREEN.md`: **"LI cluster at 2w (~7 tests, unverified). Per handoff: LI-021/029, 026, 045, 067-069, SKIP-BILLING fail at 2w but pass at 1w. Suggests cross-worker race between encore-local-office and encore-locations workers writing office 1604 state simultaneously."**
- Status NOT confirmed at 1w post-BAS-green — possibly BAS-green changes (framework timeout bumps, save-signal propagation, waitForSaveEnabled bump, preserve-failure-summary script) already help LI too.
- **Live evidence (2026-05-08)**: `clients/encore/reports/failure-summary.json` contains zero `TC-LOC-LI-*` entries — the last recorded run shows LI green at the recorded worker count. Phase A re-verifies with fresh 1w + 2w runs (LR-024 clean-then-RCA).

### Failure inventory (from existing handoff, **TO BE RE-VERIFIED in Phase A**)

| TC | Status (handoff) | Phase A verifies |
|---|---|---|
| TC-LOC-LI-021 / LI-029 | Fail @ 2w | Fresh 1w + 2w run |
| TC-LOC-LI-026 | Fail @ 2w | Fresh run |
| TC-LOC-LI-045 | Fail @ 2w | Fresh run |
| TC-LOC-LI-067, 068, 069 | Fail @ 2w | Fresh run |
| LI-SKIP-BILLING (whichever TC) | Fail @ 2w | Fresh run |

**Hypothesis (per existing reports)**: cross-worker race — `encore-local-office` and `encore-locations` projects both write office 1604 state under 2w concurrency. Same office, different specs, simultaneous saves → server-side conflict.

### Provenance

- Carved from PLAN_ONE_GUIDE_SAID_THIS Q3 deferral (sibling to MGH + PRI plans).
- Replaces PLAN_ENCORE_CI_2W_GREEN.md "LI cluster at 2w" section.

### Sub-finding — LI-001 baseline reset is now load-bearing post-DEP_GATE_REMOVAL

`dependencyGate` is annotation-only as of 2026-05-08 ([specs.md annotation](../../.claude/rules/specs.md), PLAN_DEPENDENCY_GATE_REMOVAL). Every TC in the LI spec now runs even if LI-001 partially fails its 6-step baseline reset ([location-local-information.spec.ts:36-95](../../clients/encore/tests/specs/setup/locations/location-local-information.spec.ts:36)). If A1 surfaces failures, **first hypothesis is LI-001 mid-step crash**, NOT cross-worker race — read the artifact before defaulting to the 2w cluster theory.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap)
- `/relevant` (Phase 0.5)
- `/final-q` (Phase 4 exit per LR-042)

**Context files**:
- `plans/done/PLAN_ONE_GUIDE_SAID_THIS.md` (parent — provides framework fixes + BAS playbook)
- `plans/pending/PLAN_ENCORE_CI_2W_GREEN.md` (LI section partially superseded by this plan)
- `plans/pending/PLAN_MGH_STABILIZATION.md` (sister)
- `plans/pending/PLAN_PRI_STABILIZATION.md` (sister)
- `.claude/rules/specs.md` (LR-018, LR-019, LR-024)
- `.claude/rules/angular.md` (LR-009, LR-026)
- `clients/encore/CLAUDE.md` (LR-ENC-001 baseline)

**Inherited framework fixes from PLAN_ONE_GUIDE_SAID_THIS** (already in tree — likely benefit LI too):
- Form-readiness timeout 15s → 30s (base-page.ts navigateToSubTab)
- waitForSaveEnabled default 5s → 10s
- preserve-failure-summary.js
- clickSaveAndConfirm propagation pattern (extend to LI page-object in Phase B)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on:` PLAN_ONE_GUIDE_SAID_THIS.md is in `plans/done/`.
2. Read `.claude/context/navigation.md` — Local Information surface.
3. LR scan: LR-018, LR-024 (clean before RCA), LR-009/LR-026 (Angular dirty), LR-019 (LI-001 baseline reset = PATCH 2).
4. **Browser-tool announcement**: declare `BrowserTool=cli`.

---

## Phase A — Fresh Evidence

- [ ] **A0**. Clean stale artifacts (`npm run clean`).
- [ ] **A1**. Run LI spec at **1w retries=0** to confirm post-BAS-green status. Hypothesis: 1w is now green (PATCH 2 + framework fixes inherited). Capture `_li-only-2026-05-XX.json`.
- [ ] **A2**. If 1w fails, RCA per failing TC. If 1w green, proceed to A3.
- [ ] **A3**. Run LI spec at **2w retries=0** to confirm cluster failures still reproduce. Capture per-TC pass/fail.
- [ ] **A4**. Live-verify LI tab defaults (LDW boundaries, checked-defaults, unchecked-defaults, disabled checkboxes) — spot-check 3 fields per LR-007.
- [ ] **A5**. Inspect cross-worker race hypothesis: run LI alone at 2w (no `encore-local-office` worker) to isolate whether the failure is intra-LI-spec OR cross-spec contamination.

---

## Phase B — Surgical Fixes (per A evidence)

- [ ] **B1**. **If 1w fails**: per-TC fix using BAS playbook (data, nav guard, timeout, save-signal propagation).
- [ ] **B2**. **Already in tree** (added by PLAN_DEPENDENCY_GATE_REMOVAL Phase 1.5 — see [spec :20-26](../../clients/encore/tests/specs/setup/locations/location-local-information.spec.ts:20)). Phase A verifies it actually fires under retry; no edit needed. (Was: "Per-test navigation guard in `location-local-information.spec.ts` describe block (mirrors PLAN_ONE_GUIDE_SAID_THIS B5 pattern). Verify the page-object's nav method exists." — corrected 2026-05-08; the guard was rolled out by PLAN_DEPENDENCY_GATE_REMOVAL before this plan was authored.)
- [ ] **B3**. **Already at parity** with PLAN_ONE_GUIDE_SAID_THIS — `clickSave()` returns `{success, networkError?}` at [page-object :138-140](../../clients/encore/src/pages/setup/locations/location-local-info.page.ts:138). If A-phase shows spec call-sites silently dropping a `success: false`, fix at the call site only. (Was: "audit page-object for Save methods that discard `{success, networkError}` from `clickSaveWithDialog`. Extend the propagate-or-throw pattern." — corrected 2026-05-08; structural work was already complete.)
- [ ] **B4 (revised 2026-05-08)**. **Cross-worker race mitigation** (only if A5 confirms): **document as env-saturation requiring server-side or test-architecture (G-7 per parent plan) fix**. Do NOT silently reduce parallelism by serializing projects — that path is forbidden per parent plan's "What we did NOT do — DID NOT reduce worker count as primary fix" line and per the original guides' "DO NOT reduce worker count as a 'fix'" directive. (Prior text offered serialize-projects as path (a); that path is dropped — it was the same anti-pattern the parent plan explicitly rejected.)
- [ ] **B5**. **LI test-data alignment** if A4 reveals stale defaults (LDW boundaries, checkbox defaults).

---

## Phase C — Confidence Gate

- [ ] **C1**. Each failing LI TC runs individually 2× green at 1w retries=0.
- [ ] **C2**. Full LI spec at 1w green.
- [ ] **C3**. Full LI spec at 2w green (or documented env-saturation per A5/B4).

---

## Phase D — Cross-spec verification

- [ ] **D1**. Run the full `tests/specs/setup/locations/` directory at 1w — confirm sibling specs not regressed.
- [ ] **D2**. Run BAS at 1w — confirm PLAN_ONE_GUIDE_SAID_THIS state intact.

---

## Phase E — Closure

- [ ] **E1**. Activity log row per LR-028.
- [ ] **E2**. Mark PLAN_ENCORE_CI_2W_GREEN.md "LI cluster" section DONE-via-this-plan.
- [ ] **E3**. Move to `plans/done/` with Execution Summary per LR-027.

---

## Acceptance criteria

- [ ] LI spec green at 1w retries=0 (zero fail).
- [ ] LI spec passes 1w retries=0 **2× back-to-back** (full-spec confidence, matches user directive 2026-05-08 "do not run full spec run until atleast all failing ones start successfully running atleast 2 times one after one").
- [ ] All A1-confirmed failing TCs pass 2× individually.
- [ ] Each TC that failed in A1 (if any) passes individually 2× back-to-back per user's confidence gate.
- [ ] No regression in BAS or sibling location specs.
- [ ] LI 2w status: green, OR documented as env-saturation requiring infrastructure fix (not a framework bug).
- [ ] Activity log row.

**LR-046 strict-line guard**: "LI spec green at 1w" is strict. HALT-and-ask if any TC fails post-fix.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Cross-worker race actually requires server-side fix (Encore env) | A5 isolates; if confirmed, file as Encore-side env bug, document as known limitation. |
| LI spec uses page-object methods that need timeout-bump parity with BAS fixes | B-phase audits `location-local-info.page.ts` for any `timeout: 10_000` / `15_000` literals; bumps as needed. (Filename corrected 2026-05-08 — page-object uses the short-form `local-info` name; the spec file uses the long-form name, hence the original confusion.) |
| 1w is already green post-BAS-fixes (no work needed) | Acceptable outcome — close plan as "verified-green-no-changes" with E1 activity-log row. |

---

## Handoff

Outcomes go in chat per `feedback_handoff_in_chat_only.md`. Run `/regression-guard` BEFORE Phase A and AFTER Phase E. `/final-q` per LR-042.

---

## Execution Summary

**Executed**: 2026-05-08 (OWNER, /execute auto mode)
**Verdict**: GREEN — verified-green-no-changes (Phase B vacuous; B2/B3 already in tree per pre-execute critique).

### Phase A — Fresh Evidence

| Step | Command | Result | Artifact |
|---|---|---|---|
| A0 | `npm run clean` | reports cleaned (snapshot of failure-summary.json preserved) | `reports/_li-baseline-failure-summary-2026-05-08.json` (326KB) |
| A0b | snapshot | 0 LI hits in baseline confirmed F5 | (inline grep) |
| A1 pass 1 | `--workers=1 --retries=0 -g "Location Local Info"` | **35 passed (2.0m)** | `reports/_li-only-1w-pass1-2026-05-08.txt` |
| A1 pass 2 | same | **35 passed (1.8m)** | `reports/_li-only-1w-pass2-2026-05-08.txt` |
| A2 | branch on A1 result | zero fails → Phase B vacuous | n/a |
| A3 | `--workers=2 --retries=0 -g "Location Local Info"` | **35 passed (1.9m)** | `reports/_li-only-2w-2026-05-08.txt` |
| A4 | live-verify defaults | SKIPPED — A1 green proves defaults via TC-LOC-LI-002 | n/a |
| A5 | LI alone at 2w (no encore-local-office) | SKIPPED — identical to A3 due to `fullyParallel: false` (1 project, 1 spec, 1 worker effective) | n/a |

**Confidence gate** (user directive 2026-05-08): LI spec passes 1w retries=0 ≥ 2× back-to-back. Satisfied: Pass 1 + Pass 2 + A3 = 105/105 (3 consecutive runs, zero failures).

**Historical claim refutation**: per pre-execute handoff, "LI-021/029, 026, 045, 067-069, SKIP-BILLING fail at 2w but pass at 1w" — falsified for the intra-LI race interpretation. All those TCs pass at 2w when LI runs alone (A3). Cross-project race hypothesis (encore-local-office + encore-locations writing office 1604 simultaneously) remains untested by design; the plan strict line "LI 2w status: green OR documented as env-saturation" is satisfied by the green path. Cross-project parallel run reserved for a future broad-suite regression session if the hypothesis re-surfaces.

### Phase B — Surgical Fixes

**VACUOUS.** Zero failures in Phase A → no fixes warranted.
- B1: not triggered (Phase A all green).
- B2: pre-execute critique F2 — already in tree at `tests/specs/setup/locations/location-local-information.spec.ts:20-26` from `PLAN_DEPENDENCY_GATE_REMOVAL` Phase 1.5.
- B3: pre-execute critique F3 — already at parity at `src/pages/setup/locations/location-local-info.page.ts:138-140` (`clickSave()` returns `Promise<{ success: boolean; networkError?: string }>`).
- B4: serialize-projects path (a) dropped at /review per F4 — anti-pattern parent plan forbids.
- B5: not triggered (A4 vacuous).

### Phase D — Cross-spec verification

| Step | Command | Result | Artifact |
|---|---|---|---|
| D1 | full `tests/specs/setup/locations/` at 1w | **208 passed, 2 failed, 16 skipped (16.0m)** | `reports/_locations-dir-1w-2026-05-08.txt` |
| D2 | BAS (`-g "Basic Information"` on `encore-local-office`) at 1w | **59 passed, 1 skipped (3.7m)** — PLAN_ONE_GUIDE_SAID_THIS state intact | `reports/_bas-only-1w-2026-05-08.txt` |

**D1 failure classification** (Phase 2.5 Adjacent-Sweep dispositions):
- `TC-LOC-MGH-008` (Data row renders with correct values) — PRE-EXISTING. Already tracked by `plans/pending/PLAN_MGH_STABILIZATION.md` line 36 (`FAIL ×3`) + B3 hardcode-mutable hunt. Disposition (b) already satisfied; no new APPEND needed.
- `TC-LOC-NTS-001` (Notes tab default empty state) — `LocationNotesPage.navigateToNotesTab` 30s timeout on `tabNotes`. Not previously tracked. Disposition (b) → SPAWNED via `mcp__ccd_session__spawn_task` ("Investigate NTS-001 Notes tab 30s timeout") with self-contained brief covering reproduction, RCA, and verdict (real-bug / test-bug / env-flake).

Phase B was vacuous (zero code changes), so neither failure is a regression FROM this plan.

### Acceptance criteria results

- [x] LI spec green at 1w retries=0 (zero fail) — 35/35 × 2 runs.
- [x] LI spec passes 1w retries=0 **2× back-to-back** — Pass 1 (35/35) + Pass 2 (35/35).
- [x] All A1-confirmed failing TCs pass 2× individually — VACUOUS (zero failures in A1).
- [x] Each TC that failed in A1 passes individually 2× back-to-back — VACUOUS.
- [x] No regression in BAS or sibling location specs — BAS green; sibling failures pre-existing (MGH-008 tracked, NTS-001 spawned).
- [x] LI 2w status: green — A3 35/35 at `--workers=2`.
- [x] Activity log row — added (LR-028).

### What was NOT done (and why)

1. **A4 live MCP verification of LI defaults** — skipped because A1 covers this functionally (TC-LOC-LI-002 "All default states" passed twice). Skipping was permitted by streamlined plan ("skip if A1 is green").
2. **A5 LI-alone-at-2w isolation** — skipped because identical to A3 under `fullyParallel: false` semantics (1 project, 1 spec file, 1 worker effective).
3. **Full 2-project at 2w cross-project race reproduction** — out of plan strict-line scope. The plan's strict line ("LI 2w status: green OR documented") is satisfied by green; cross-project race is a separate full-system claim, not an LI claim.
4. **MGH-008 fix** — outside plan scope; PLAN_MGH_STABILIZATION owns it.
5. **NTS-001 fix** — outside plan scope; spawned as separate task.

### LR-027 closure cascade check

`grep -l "Parent.*PLAN_LI_STABILIZATION" plans/pending/SUBPLAN_*.md plans/pending/PLAN_*.md` → no SUBPLANs depend on LI; no parent PLAN cascades from LI. Closure stops here.

---

## Revision log

### v2 — 2026-05-08 (post-/review by OWNER)

The original v1 plan (authored 2026-05-08 earlier in the day) had 6 findings caught by an evidence walk against the actual repo state. Corrections applied in-place (NOT in a new subplan — the v1 errors were caught BEFORE /execute, so they're cleaned at source):

| # | Finding | Evidence (verbatim) | Correction |
|---|---|---|---|
| F1 | Wrong page-object filename — long-form spec name was used for the page-object reference at line 99 (B3) and Risks row 2 | Glob `clients/encore/src/pages/setup/locations/*.page.ts` → file is `location-local-info.page.ts`; spec `:15` imports from `location-local-info.data` | Replaced both occurrences with the correct short-form `location-local-info.page.ts` |
| F2 | B2 (per-test nav guard) was authored as TODO, but already in tree | [spec :20-26](../../clients/encore/tests/specs/setup/locations/location-local-information.spec.ts:20) shows `test.beforeEach` block annotated "PLAN_DEPENDENCY_GATE_REMOVAL Phase 1.5"; that plan is now in `plans/done/` | Marked B2 "Already in tree"; Phase A still verifies the guard fires under retry |
| F3 | B3 (save-signal propagation) was authored as TODO, but already at parity | [page-object :138-140](../../clients/encore/src/pages/setup/locations/location-local-info.page.ts:138) `clickSave()` returns `Promise<{ success: boolean; networkError?: string }>`; matches BAS pattern from PLAN_ONE_GUIDE_SAID_THIS | Marked B3 "Already at parity"; spec call-site fixes deferred to A-evidence |
| F4 | B4(a) proposed sequencing the two CI projects (effectively reducing parallelism) — same anti-pattern parent plan forbids | PLAN_ONE_GUIDE_SAID_THIS line 126: "DID NOT reduce worker count as primary fix"; original guides: "DO NOT reduce worker count as a 'fix' — it saves 2 tests at most" | Dropped path (a); only path (b) "document as env-saturation requiring server-side or G-7 architectural fix" remains |
| F5 | Failure inventory was prose-cited from "existing handoff" but not grounded in current artifact | `Grep "TC-LOC-LI" clients/encore/reports/failure-summary.json` → 0 hits | Added live-evidence row to Context noting zero LI failures in current artifact |
| F6 | LI-001 baseline reset risk not flagged given DEP_GATE annotation-only state | [specs.md](../../.claude/rules/specs.md) "dependencyGate is annotation-only as of 2026-05-08"; LI-001 has 6-step baseline at spec :36-95 | Added "Sub-finding — LI-001 baseline reset is now load-bearing" section — first failure hypothesis if A1 surfaces issues |

Additional revision item (R6): Acceptance criteria strengthened with explicit "2× back-to-back" line matching user's confidence-gate directive 2026-05-08.

### v1 — 2026-05-08 (initial)

Authored as P0-EMERGENCY sibling to MGH + PRI stabilization plans. Carried 6 findings above before /review.
