# SUBPLAN_SSL_FCC

**Status**: PENDING
**Priority**: P0
**Created**: 2026-05-22
**Identity**: OWNER (multi-identity within phases — HUNTER → GIVER → BUILDER → WATCHDOG)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: SUBPLAN_NOTES_FCC_PILOT.md (DONE 2026-05-22 — paradigm infra: `clients/encore/src/core/field-case-runner.ts`)
**Blocks**: future per-module FCC subplans that want SSL as their reference pattern
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: multi-identity work (HUNTER walk + GIVER catalog + BUILDER spec + WATCHDOG audit) + ~12–14 net-new tests + LR-040 closure manifest. Default Opus tier per LR-041 (`max` reserved for closure-gate RCA).
**Author**: Rutvik (via Claude Opus 4.7)
**ActiveClient**: encore

---

## Naming policy (Rutvik directive 2026-05-26)

> TC IDs use **submodule** naming, NEVER plan/concept naming. This subplan still uses "FCC" in its filename (it's a plan name), but generated TC IDs MUST be sequential `TC-LOC-SSL-NN` with **no segment carrying the methodology shortname**. The "FCC" methodology concept survives only in describe tags (`@fcc`) and prose. When GIVER produces the gap-analysis table below, dispositions should read `net-new TC-LOC-SSL-NN` (with NN being the next-available canonical number after the current high-water mark of SSL-044). If older subplan templates still surface IDs in the deprecated module-shortname-with-extra-segment form, treat them as pre-2026-05-26 placeholders and emit canonical submodule-only IDs at GIVER/BUILDER time.

---

## Context

The retroactive audit (2026-05-22) found that PLAN_BIG_PIVOT_FCC_MASTER.md:20-22,83 marks SSL "done" — but that "done" refers to the DQU-pilot completion + 2026-05-22 false-green sweep, NOT FCC-Doctrine conversion. SSL was grandfathered, exempt from the `field-case-runner.ts` paradigm. Granularity audit confirmed 30 planned TCs = 30 `test()` blocks (1:1, LR-019 baseline-first met by existing TC-LOC-SSL-001), but every test uses ad-hoc lifecycle, not §Doctrine `saveAndVerifyCase()`.

Coverage gap analysis against the FCC taxonomy (`clients/encore/specs_planning/_internal/field-case-generation.md`) shows ~50% of prescribed cases for SSL's field types already hit by the existing 30 TCs. The gap concentrates in:

- **Plain-text Search input (Add dialog)** — BVA / special-chars / whitespace / edit-cycle. Existing hits ~3 of ~10 prescribed cases.
- **Multi-row FormArray (locations table)** — delete-middle / edit-row-preserve / N-row-boundary. Existing hits ~5 of ~12.
- **Checkbox SI** — cross-row-independence / toggle-off-save+reload. Existing hits ~4 of ~5.
- **Dialog/button** — already ~5 of ~6 (no significant gap).

**Rutvik's steering (2026-05-22 chat)**:
1. Mirror the Notes FCC pilot pattern — add a new `'Location Shared Setup — FCC'` describe block **above** the existing `'Location Shared Setup Locations'` describe; populate only with the ~12–14 net-new gap cases; leave existing 30 untouched.
2. Bug-blocked cases authored as `test.fixme()` with BUG-ref comment (matches Notes pilot's FCC-005 deferral pattern).
3. PermissionMode: acceptEdits — subplan stops after authoring + per-phase Rutvik review. Not /chain.

---

## Bootstrap

**Identity**: OWNER (sub-phases tagged HUNTER/GIVER/BUILDER/WATCHDOG via per-phase `/identity X`).
**Skills auto-called**: `/identity` (each phase boundary), `/regression-guard` (pre+post BUILDER), `/relevant` (session start).
**Context files (load order)**:
1. `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` §Doctrine + §Roadmap
2. `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` §Phase 2–7 (canonical reference structure)
3. `clients/encore/specs_planning/_internal/field-case-generation.md` (FCC taxonomy — 8 field types)
4. `clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md` (SSL field inventory — 7 fields, freshness <14d)
5. `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md` (existing 30 TCs source)
6. `clients/encore/src/core/field-case-runner.ts` (runner API — `saveAndVerifyCase(c: FieldCase)`)
7. `clients/encore/specs/locations/location-notes.spec.ts` lines 27–657 (canonical FCC describe pattern)
8. `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` (target spec — 552 lines, 30 tests)
9. `.claude/rules/specs.md` (LR-018 spec-fixing-workflow, LR-019 baseline-first, LR-053 no-strict-row-count)
10. `.claude/rules/angular.md` (LR-009 dirty-tracking, LR-010 cross-field async, LR-011 numeric-reload, LR-026 dirty-revert)
11. `.claude/rules/inventory.md` (LR-013 Phase 0.5 walkthrough — 14-day field-inventory freshness gate)
12. `clients/encore/CLAUDE.md` (LR-008, LR-012 shared-save-dialog, LR-017 selector namespaces, LR-036 boolean render, LR-ENC-001 baseline truth)

---

## Phase 0 — Dependency + browser-tool gate (LR-048 mandatory)

**[GATE-D0]** Before any work begins, verify:

- [ ] `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` frontmatter `Status: DONE` (paradigm infra is shipped)
- [ ] `clients/encore/src/core/field-case-runner.ts` exists and exports `saveAndVerifyCase(c: FieldCase): Promise<void>` (sig verified from prior audit)
- [ ] `clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md` is <14 days old per LR-013 (today 2026-05-22, inventory 2026-05-12 → 10 days, OK)
- [ ] `clients/encore/specs/locations/location-notes.spec.ts` FCC describe block (lines 27–657) compiles + tests pass green (sanity reference for pattern fidelity)
- [ ] Browser tool selection: **CLI** (default per LR-038 v2 — no fresh-MFA, no visual/CSS work, no `pause:` step required)

**HALT** if any gate fails → escalate to Rutvik in chat.

---

## Phase 1 — HUNTER: SSL state freshness walk

**Identity**: HUNTER (via `/identity HUNTER`)
**Output artifact**: `clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-22.md` (module slug `shared-setup` matches existing 3-of-4 walk-evidence files)

Light DOM walk via Playwright CLI (no Chrome — no MFA needed; SSL is post-auth).

Steps:
1. Navigate to Location Settings → Shared Setup Locations tab
2. Verify SI checkbox renders + accepts toggle (DOM check before/after click)
3. Open Add dialog → verify Search input present + accepts keystroke + dropdown rows render
4. Verify Save dialog structure unchanged since 2026-05-12 inventory (selectors: `dlgSaveChanges`, `btnSaveChangesConfirm` per LR-012)
5. Capture one CLI screenshot of SSL table + Add-dialog state

Write `walk-evidence-shared-setup-2026-05-22.md` per `feedback_walk_evidence_artifacts.md` — sections: page URL, fields seen, deltas vs 2026-05-12 inventory, BUG-LOC-SHR-001 reproduction confirmation.

**HALT** if SI/Search/Save/dialog structure has changed materially → field-inventory must be refreshed (separate subplan) before Phase 2.

---

## Phase 2 — GIVER: FCC granular case catalog + TC additions

**Identity**: GIVER (via `/identity GIVER`)
**Output artifact**: append a "### FCC Granular Cases (2026-05-22)" section to `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md`

### Gap-analysis table (GIVER produces, format below)

| FCC taxonomy case | Field type | Covered by existing TC? | Disposition |
|---|---|---|---|
| Search: 1-char filter | plain-text positive | No | net-new TC-LOC-SSL-NN (canonical submodule numbering — see naming policy above) |
| Search: max-length filter | plain-text BVA | No | net-new TC-LOC-SSL-NN (canonical submodule numbering) |
| Search: name search | plain-text positive | Yes — SSL-010 (fixme BUG-LOC-SHR-001) | LR-040(b) covered |
| ... | ... | ... | ... |

**[STRICT-LINE-A]** Every FCC taxonomy case applicable to SSL's field types (plain-text Search, multi-row FormArray, checkbox SI, dialog/button) MUST be classified per LR-040 (a) authored as net-new `TC-LOC-SSL-NN` (canonical submodule-only form per the naming policy above), (b) marked "covered by `TC-LOC-SSL-NNN`" with grep-verifiable cite into the existing test-case file, or (c) explicitly deferred with bug-ID + "Pending decisions" entry. Phantom hand-offs are forbidden (LR-040, LR-046).

### Net-new TC catalog (target ~12–14; final count = GIVER's gap-table verdict)

Expected categorical breakdown (subject to GIVER's verification against the existing 30 TCs):

- **α — Search BVA** (~3 cases): 1-char filter shows ≥1 result; max-length filter (200+ chars); max+1 paste (if upper bound exists — MCP verify)
- **β — Search special / whitespace** (~3 cases): whitespace-only filter; leading-trailing whitespace; special chars (`&`, `"`, `'`)
- **γ — Search edit-cycle** (~2 cases): edit-overwrite (type → clear → retype); clear-via-X-button restores all rows
- **δ — Multi-row delete variants** (~2 cases): delete-middle row + save + reload; delete-all-non-self + save + reload
- **ε — Multi-row edit / N-row boundary** (~2 cases): edit-row-1 toggle SI preserves row-0 state; 5-row add + save + reload boundary
- **ζ — Checkbox cross-row** (~2 cases): toggle non-self SI off → save + reload persists off; cross-row independence (toggle row 1 leaves row 0 untouched)

Each TC entry declares: ID, label, FCC group (α/β/γ/δ/ε/ζ), field type from taxonomy, expected outcome, bug-ref if fixme'd.

**[STRICT-LINE-B]** No duplication. Every net-new TC must hit a (field-type × FCC-case) cell NOT covered by the existing 30 TCs. If GIVER finds a proposed FCC case is already covered, drop it from the net-new list and cite the covering existing TC ID in the gap table (LR-040(b) classification).

### Fixme policy (per Rutvik 2026-05-22 steering — write all, fixme bug-blocked)

- **BUG-LOC-SHR-001** (Miami name-search 0 results / phantom row): use non-Miami test data wherever possible → most cases avoid fixme. Where Miami is required by the test scenario, mark `test.fixme()` with comment `// FIXME(BUG-LOC-SHR-001): <reason>`
- **LR-026** (Angular dirty-state revert): SI toggle-revert FCC case is fixme'd (parallel to existing SSL-007)
- **SSL-030-class app bug** (Delete non-clickable post-reload, possibly intermittent): multi-row delete-middle + reload FCC case → if reproduces on first author-and-run, fixme; otherwise leave green

---

## Phase 3 — BUILDER: Spec implementation

**Identity**: BUILDER (via `/identity BUILDER`)
**Target file**: `clients/encore/specs/locations/location-shared-setup-locations.spec.ts`
**Possible secondary edits**:
- `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts` (page-object — actual path per LR-017 module convention `src/pages/{module}/`). MUST ADD: `saveAndConfirm()` — wrapper around `openSaveDialog()` + dialog confirm click + wait-for-Save-disabled. Any new dialog-search helpers (search-edit-cycle, search-clear-via-X) — enumerate each new method in execution summary.
- `clients/encore/src/data/testdata/locations/location-shared-setup-locations.data.ts` (test-data — per LR-017 module convention `src/data/testdata/{module}/`). Add new constants for FCC inputs: search strings (1-char, max-length, special chars, whitespace variants), non-Miami location codes for multi-row tests.

### Spec layout (post-edit)

```
// imports + helpers (unchanged)
// existing test.beforeEach (unchanged)

test.describe('Location Shared Setup — FCC @locations @shared-setup @fcc', () => {
  // new FCC-paradigm tests at canonical TC-LOC-SSL-NN form (~12–14 blocks; -FCC- segment retired)
  // each: saveAndVerifyCase({ id, label, baseline, act, expectBeforeSave?, saveAndConfirm, expectAfterSave?, reload, expectAfterReload, cleanup })
});

test.describe('Location Shared Setup Locations @locations @shared-setup', () => {
  // existing 30 TCs UNTOUCHED (verbatim tag from spec line 10)
});
```

### Per-test pattern (verbatim from `location-notes.spec.ts:42-61`)

```typescript
test('TC-LOC-SSL-NN: <label>', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  dependencyGate([]);
  test.setTimeout(60_000);
  await saveAndVerifyCase({
    id: 'TC-LOC-SSL-NN',
    label: '<label>',
    baseline: () => pg.ensureCleanSSLTable(),
    act: () => /* the one field-level change */,
    expectBeforeSave: async () => { /* optional: counter, dirty flag, button enable */ },
    saveAndConfirm: () => pg.saveAndConfirm(),  // NEW METHOD — see Phase 3 page-object additions
    expectAfterSave: async () => { /* optional: dialog closed, save disabled */ },
    reload: () => pg.reloadAndNavigateToSSLTab(),
    expectAfterReload: async () => { /* persisted-value assertion */ },
    cleanup: () => pg.ensureCleanSSLTable(),
  });
});
```

### Hard requirements

- Every new test calls `saveAndVerifyCase()` imported from `clients/encore/src/core/field-case-runner.ts` (verbatim import per `location-notes.spec.ts:16`: `import { saveAndVerifyCase } from '../../src/core/field-case-runner';`)
- Fixture parameter is `locationSharedSetupLocationsPage` (per `clients/encore/src/infra/fixtures.ts:46,340` — NOT the shorter `locationSharedSetupPage`); destructure-and-rename via `: pg` alias matches the existing 30 TCs' pattern (e.g. spec line 20)
- BUILDER MUST add `saveAndConfirm()` to the SSL page-object before authoring any FCC test that depends on it. Suggested impl: `await this.openSaveDialog(); await this.getElement('btnSaveChangesConfirm').click(); await this.waitForSaveDisabled();`. Cite the new method in the execution summary.
- Each test owns its `baseline()` + `cleanup()` — no shared `beforeEach` inside the FCC describe block (§Doctrine: own baseline, own cleanup)
- `dependencyGate([])` per test — independent chain, no `dependencyGate(['TC-...'])` refs
- **LR-019 first-test-baseline**: the FIRST test in the FCC describe (which becomes the first test in the file) MUST satisfy LR-019 steps 1–5. The existing `ensureCleanSSLTable()` page-object method already covers (1) navigate fresh, (2) read state, (3) reset dirty, (4) save if needed, (5) re-navigate. Verify behavior before relying on it.
- Bug-blocked tests use `test.fixme(...)` with one-line `// FIXME(BUG-LOC-SHR-NNN): <reason>` comment above each
- Page-object additions in `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts` (correct path — see Phase 3 secondary edits above) — every new method cited in execution summary
- LR-012 shared-save-dialog: reuse `dlgSaveChanges` / `btnSaveChangesConfirm` from `shared.ts`; do NOT introduce per-tab Save selectors
- LR-053 no strict row-count: if any documented auto-empty-row bug applies to SSL multi-row tests, assert "≥ N rows" not "= N rows"
- Existing 30-TC describe block untouched

**[STRICT-LINE-C]** Net-new spec growth: ~12–14 new `test()` blocks (matching GIVER's catalog count). If BUILDER ends with >15% deviation from GIVER's planned count, **HALT** and escalate (LR-046).

**[STRICT-LINE-D]** Existing 30-TC describe block UNTOUCHED. `git diff` lines for that describe = 0. Any drift → HALT.

---

## Phase 4 — WATCHDOG: Audit + run

**Identity**: WATCHDOG (via `/identity WATCHDOG`)

### Read-only audit checks (all required green before run)

1. Grep new FCC describe block: `grep -c "saveAndVerifyCase" location-shared-setup-locations.spec.ts` ≥ new TC count
2. Grep `dependencyGate(\[` inside FCC describe — verify only `dependencyGate([])` (no chain refs)
3. `git diff clients/encore/specs/locations/location-shared-setup-locations.spec.ts` — verify existing 30-TC describe shows zero mutations (STRICT-LINE-D)
4. Cross-check GIVER's gap table vs final spec: every catalogued TC has a corresponding `test()` block (1:1)
5. Cross-check LR-040: every applicable FCC taxonomy case classified (a)/(b)/(c) in the gap table
6. Verify each `test.fixme()` has `// FIXME(BUG-LOC-SHR-NNN): <reason>` comment

### Run order (per `feedback_always_run_individual_first.md` + LR-018 spec-fixing workflow)

1. `npx playwright test location-shared-setup-locations.spec.ts --grep "@fcc"` — new FCC tests only
2. If green (or only documented fixmes), run full spec: `npx playwright test location-shared-setup-locations.spec.ts`
3. If full spec green, run wider suite: `npx playwright test specs/locations/`

**HALT** if individual FCC run is RED with non-fixme'd failures → trigger `/rca` + `/bugfix` (do NOT mass-fixme to force green — that violates `feedback_skip_discipline.md`).

---

## Phase 5 — Closure (LR-027 + LR-040 cascade)

**[STRICT-LINE-E]** Status flip to DONE requires ALL of:

- Per-TC justification table for every planned FCC TC: implemented (a) / collapsed-into-existing (b) / deferred-with-bug (c)
- Verification commands + outputs (test pass counts, fixme counts, file:line manifest)
- LR-046 strict-line audit: STRICT-LINE-A/B/C/D/E each marked ✓ + cite of evidence
- LR-027 parent-cascade decision: `PLAN_BIG_PIVOT_FCC_MASTER.md` remains PENDING (many modules un-shipped); do NOT auto-close parent

Move `SUBPLAN_SSL_FCC.md` from `plans/pending/` to `plans/done/`. Author closure manifest at `plans/_closure_manifests/SUBPLAN_SSL_FCC.md.manifest.json` (matches the existing 12-file directory convention `<plan>.md.manifest.json`, verified via `ls plans/_closure_manifests/`). Manifest content mirrors `SUBPLAN_SSL_FALSE_GREEN_SWEEP.md.manifest.json` shape (findings table, artifacts manifest, strict-line audit, parent-cascade, verdict).

Status flip to DONE additionally requires **LR-055** machine-gated PASS — run `node scripts/validate-plan-closure.mjs --enforce --plan plans/done/SUBPLAN_SSL_FCC.md --json` and confirm all 5 checks (C1–C5) pass, OR a per-plan entry in `.claude/closure-overrides.json` (C1-only override is the only overridable check; C2–C5 require remediation).

---

## Acceptance Criteria (checkboxes)

- [ ] Phase 0 dep+browser gate passed (4 sub-checks)
- [ ] Phase 1 `walk-evidence-shared-setup-2026-05-22.md` written at `clients/encore/specs_planning/_internal/`
- [ ] Phase 2 gap table + ~12–14 net-new TCs catalogued in `locations_shared_setup_locations_test_cases.md`
- [ ] Phase 2 STRICT-LINE-A: every FCC taxonomy case for SSL field types classified (a)/(b)/(c)
- [ ] Phase 2 STRICT-LINE-B: zero net-new TCs duplicate existing 30
- [ ] Phase 3 new FCC describe block added ABOVE existing 30-TC describe in `location-shared-setup-locations.spec.ts`
- [ ] Phase 3 every new test uses `saveAndVerifyCase()` with own baseline + cleanup, `dependencyGate([])`
- [ ] Phase 3 STRICT-LINE-D: existing 30-TC describe block UNTOUCHED (git-diff = 0 lines for that block)
- [ ] Phase 4 individual FCC `--grep "@fcc"` run green (or only documented fixmes)
- [ ] Phase 4 full spec run green
- [ ] Phase 5 LR-027 execution summary + LR-040 per-TC justification authored
- [ ] Phase 5 closure manifest at `plans/_closure_manifests/SUBPLAN_SSL_FCC.md.manifest.json` + LR-055 `validate-plan-closure.mjs` PASS
- [ ] Phase 5 STRICT-LINE-A/B/C/D/E each marked ✓ with evidence cite

---

## Handoff (chat-only per `feedback_handoff_in_chat_only.md`)

Rutvik will:
1. Trigger `/execute SUBPLAN_SSL_FCC` (manual, NOT `/chain`) per his run-mode decision
2. Watch chat for `/final-q` verdict from WATCHDOG after each phase boundary

If any STRICT-LINE-A/B/C/D/E fires HALT → Claude pauses, Rutvik decides next step in chat.

---

## Verification (how to test end-to-end, post-execution)

1. `git diff clients/encore/specs/locations/location-shared-setup-locations.spec.ts` — confirm new FCC describe added at top, existing 30-TC describe untouched
2. `grep -c "saveAndVerifyCase" clients/encore/specs/locations/location-shared-setup-locations.spec.ts` — count = new TC count
3. `npx playwright test location-shared-setup-locations.spec.ts --list` — full TC list shows existing 30 + new ~12–14
4. `npx playwright test location-shared-setup-locations.spec.ts --grep "@fcc"` — runs only new FCC tests; all green except documented fixmes
5. `npx playwright test location-shared-setup-locations.spec.ts` — full file green (existing 30 + new FCC; fixmes skipped)
6. Open Allure report — confirm new FCC TC IDs traceable to gap table

---

## Out of scope (anti-rescope guard per LR-046, LR-050)

- FCC conversion of the existing 30 TCs to `saveAndVerifyCase()` lifecycle — separate future subplan if Rutvik authorizes
- Bug fixes for BUG-LOC-SHR-001 / LR-026 / SSL-030 app issues — app-team domain, not framework
- Cross-module FCC catalog (other tabs in Location Settings) — separate per-module subplans per `PLAN_BIG_PIVOT_FCC_MASTER.md` §Roadmap
- Renumbering existing `TC-LOC-SSL-001..030` — explicitly forbidden by STRICT-LINE-D
