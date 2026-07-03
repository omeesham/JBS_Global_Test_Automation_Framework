# PLAN: Coverage Remediation -- Per-Module DQU + Centralized History (Pivot v5)

**Status**: SUPERSEDED
**Superseded-By**: PLAN_DQU_V6.md (2026-05-12)
**Priority**: P0-EMERGENCY
**Created**: 2026-05-12
**Body version**: v5 (saved 2026-05-12 after ultrathink review of v4 — adds 3-agent routing, Phase 0 intake, Matrix C/D, pilots-only scope, parent-persistence rule)
**Identity**: OWNER (planning) -> HUNTER + GIVER + BUILDER + WATCHDOG (execution, per pilot/module)
**Parent**: `plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md`
**Depends on**: none
**Blocks**: every per-module DQU + 2 HIST submodule plans + Notes redo
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: cli (HUNTER + GIVER live walks); BUILDER uses @playwright/test runner
**Skills (this plan)**: `/planning`. Per-pilot + per-module: `/execute`, `/audit`, `/find-bugs`, `/regression-guard`, `/encore-questions`, `/final-q`.

---

## Context

DQU (Deliverable Quality Upgrade) was audit-of-existing-TCs-and-fix-specs. It assumed documented TCs were the universe and improved their fidelity. It never systematically walked Nav2 archetype-by-archetype to discover what was MISSING -- which is why the Local Office Settings asswhoop happened and why this remediation plan exists. The first remediation attempt (catalog-first) was the second miss: it re-indexed knowledge instead of executing per module. The Notes pilot shape was the third miss: HIST TCs authored INSIDE source-submodule files. v4 fixed the HIST architecture but missed two structural failure modes:

- (a) **Docs-for-paperweight gap.** REQUIREMENTS.md / MODULE_REGISTRY.md / Jira not used as scenario sources; Matrix B was archetype-only, requirements-blind. The user's frustration ("what are docs even for?") was structurally justified.
- (b) **Cross-field gap.** Field-state dependencies, validation dependencies, conditional visibility, limit dependencies, cascading options, save combinations — none enumerated as a mandatory scenario class in Track A. v4 named "save combinations" only in Track B (HIST), Track A was silent.

v5 closes both. Five corrections this version carries:

1. **No catalog-first.** Reuse `bug-archetypes.md` (12 archetypes today, +ARCH-013/014 authored inline during Shared Setup pilot), `_TEMPLATE.md`, `field-inventory-spec.md`, `.claude/rules/baseline.md` (LR-045). `bug-archetypes.md` stays primary -- NOT superseded.

2. **HIST architecture correction (from v4, unchanged).** HIST TCs MUST NOT live inside root-submodule files. Only 2 HIST specs exist, period:
   - `clients/encore/tests/specs/setup/locations/location-management-history.spec.ts` (87 columns)
   - `clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts` (~42 columns) -- note: `setup/local-office/`, NOT `setup/locations/`; glob-verified 2026-05-12
   Each is the single authoritative source for its History submodule. Per-module DQU plans NEVER author HIST tests. Current state breaches this: Notes pilot authored `clients/encore/tests/specs/setup/locations/history/location-hist-notes.spec.ts` (TC-028..032 at col 69) AND added TC-028..032 to `locations_notes_test_cases.md`. These migrate out as part of the Notes redo. Same rule applies if any other source module has pre-existing HIST artifacts.

3. **3-agent routing with Phase 0 intake (NEW in v5).** Each pilot/module routes through HUNTER (Phase 1a/1b exploration) → GIVER (Phase 3 archetype + Phase 4 matrices) → BUILDER (Phase 5 spec authoring + Phase 6 self-runs) → WATCHDOG (Phase 7 fresh `/audit`, AUD-017 compliant). HEALER not invoked — BUILDER handles its own failures within 2 fix cycles before escalating as obstacle row per LR-039. Each agent starts with mandatory Phase 0: Extract → Inventory → Gap-name → Update-upstream.

4. **Matrix C + Matrix D in Phase 4 (NEW in v5).** Matrix B (field × archetype) catches field-level archetypal gaps. Matrix C (REQUIREMENTS-to-coverage trace) catches requirements-driven gaps. Matrix D (cross-field interactions, 6 sub-dimensions) catches state/validation/visibility/limit/cascading/save-combinations gaps. All 4 matrices mandatory; zero unclassified cells = closure.

5. **Pilots-only scope + parent-persistence (NEW in v5).** Track A pilots = Shared Setup FIRST, Notes SECOND. Other 10 Track A modules (Currency, Pricing, Legal, Account, Auto-Addon, Left Panel, Local Information) FROZEN until BOTH pilots pass WATCHDOG GREEN. PLAN_DQU_COVERAGE_REMEDIATION.md stays in `plans/pending/` until ALL 14 child plans (2 pilots + 10 modules + 2 HIST submodule plans) are in `plans/done/`. Overrides LR-027 parent-cascade default. Why: pilots template every downstream module; if pilots ship with broken template, breakage compounds 10x.

Direct file evidence (`location-notes.spec.ts`, verified 2026-05-12):
- `:235` TC-016 -- TAUTOLOGY `getDeleteButtonCount()).toBeGreaterThanOrEqual(0)` (always passes).
- `:92` TC-005, `:141` TC-009, `:290` TC-023 -- weak inequality assertions where exact values are known.
- `:270` TC-022 -- private-API leak `locationNotesPage['getElement']` (bracket bypass).
- TCs 008/012/017/024/026 encode the BUG-LOC-NTS-001/002 workaround as expected contract; no bug-regression specs.

Direct file evidence (`history/location-hist-notes.spec.ts`):
- `:149` boolean `expect(matchedNotes === formA || matchedNotes === formB).toBe(true)` loses rich diff on failure. Replace with `expect([formA, formB]).toContain(matchedNotes)`.
- Spec filters by `Date.now() - 5000` but never asserts the matched row's `Modified On` is within the expected window.
- Cleanup uses `ensureEmptyState()` which inherits page-object defects (raw `deleteAllRows` lacks clear-before-delete per BUG-LOC-NTS-001 mandate).
- This entire file migrates out per the HIST architecture correction.

Direct file evidence (`location-notes.page.ts`):
- `:105 deleteRow(row)` clicks Delete with no `.fill("")` first.
- `:112 deleteAllRows()` while-loop clicks Delete with no `.fill("")` first.
- `:254 ensureEmptyState()` calls `deleteAllRows()` then reloads + retries -- still no clear-before-delete; reload-retry masks the symptom, does not implement the workaround.
- TC file `:35` mandates: "must clear textarea.value via input event FIRST, then Delete + Save".

Goal: improve real coverage per Track A (per-module DQU: Nav2 walk + archetype probe + functional TC audit + missing-scenario gap-fill across 4 matrices) and Track B (centralized HIST: column-by-column from root); audit existing TCs without forcibly deleting good ones; fix page-object defects honestly (raw methods stay raw; cleanup gets a self-describing persistent variant); add bug-regression specs that assert CORRECT behavior; close with explicit bug-debt accounting; migrate any pre-existing HIST TCs out of source-module files; **upgrade upstream knowledge artifacts (REQUIREMENTS.md, MODULE_REGISTRY.md, bug-archetypes.md, catalogs) as first-class outputs alongside TCs**.

---

## Pivot

### 1. Drop the catalog-first step

Reuse `bug-archetypes.md`, `_TEMPLATE.md`, `field-inventory-spec.md`, `baseline.md`. `bug-archetypes.md` stays primary. ARCH-013 (save-cycle) and ARCH-014 (cross-field-interaction) authored INLINE during Shared Setup pilot's GIVER section — shapes derived from real UI exploration, not guessed upfront.

### 2. HIST lives only in 2 dedicated submodule specs

- `clients/encore/tests/specs/setup/locations/location-management-history.spec.ts` -- single source for LM-History columns (87).
- `clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts` -- single source for LO-History columns (~42). Path is `setup/local-office/`, NOT `setup/locations/` (glob-verified 2026-05-12).

No per-source-module HIST spec files. No HIST TCs in source-module TC markdown. Per-module DQU plans discover form fields and emit field-inventory artifacts; History plans CONSUME those inventories to drive saves from root and byte-exact verify each column. Data flow: source-module emits -> History plan consumes (not History tests shoehorned into source-module files).

### 3. Three-Agent Routing (NEW in v5)

Each pilot/module is a single-file plan with 3 identity-bounded sections + an end-cap WATCHDOG audit:

| Phase | Agent | Identity Loaded | Inputs | Outputs |
|---|---|---|---|---|
| 0 (intake) | All three | per-agent | Existing artifacts (REQUIREMENTS, REGISTRY, baselines, inventories, archetypes, BUGs, TCs, specs, activity-log) | Dated intake artifact per agent per module |
| 1a/1b (exploration) | HUNTER | `/identity HUNTER` | Phase 0 intake + Nav2 + E2E | Baseline + field-inventory artifacts + REQUIREMENTS/REGISTRY upstream upgrades |
| 3 + 4 (matrices) | GIVER | `/identity GIVER` | HUNTER output | Matrices A/B/C/D + new archetypes (ARCH-013/014) + catalog upgrades |
| 5 + 6 (specs + runs) | BUILDER | `/identity BUILDER` | GIVER matrices | Fixed + new specs + page-object updates + 3 fresh-run results + bug-regression specs |
| 7 (audit) | WATCHDOG | `/audit` in fresh session per AUD-017 | All intake artifacts + matrices + run results | Verdict GREEN/YELLOW/RED + Execution Summary |

Section breaks in pilot/module plans = `/clear` + `/identity` boundary. WATCHDOG is fresh session (different from BUILDER's session), not a section of the pilot file.

HEALER not invoked. BUILDER attempts 2 fix cycles on a failing test it just wrote. If still failing, surfaces as obstacle row in pilot's handoff per LR-039 (no auto-skip; no auto-fail to HEALER pipeline; user decides).

### 4. Phase 0 — Extract → Inventory → Gap-name → Update-upstream (NEW in v5)

Mandatory entry gate for every agent on every module. Replaces v4's "Phase 0 — Context load."

**Step A — Extract.** Read every existing artifact relevant to this agent's phase:

- HUNTER reads: REQUIREMENTS.md module section, MODULE_REGISTRY.md entry, all baseline artifacts (`old-site-baseline/<module>-*.md`), all field-inventory artifacts (`field-inventories/<module>-*.md`), bug-archetypes.md, all `BUG-*.json` tagged with module, all TC markdown files for module, all spec files for module, Jira artifacts (if exist), agent-activity-log entries for module, prior intake artifacts.
- GIVER reads: All HUNTER reads + HUNTER's current-cycle output + Matrix B/C/D from prior cycles (if any).
- BUILDER reads: GIVER's matrices + page-object library (`clients/encore/src/pages/`) + existing spec pattern files.

**Step B — Inventory "what's known."** Tabulate per-dimension knowledge (default, options/range, limits, state-deps, validation-deps, visibility-deps, save-deps) with `investigated: YYYY-MM-DD` markers. Anything <14 days old = SKIP. Older or missing = WORK for this cycle.

**Step C — Gap-name "what's missing or stale."** Three buckets:
- (i) Missing-from-canonical-docs (live DOM shows behavior REQUIREMENTS/REGISTRY don't have).
- (ii) Stale-vs-live (artifact says X, live DOM says Y).
- (iii) Cross-artifact contradictions (REGISTRY says required, REQUIREMENTS says optional).

**Step D — Update-upstream as FIRST-CLASS output.** Every agent leaves the knowledge base more correct than they found it:
- HUNTER updates REQUIREMENTS.md and MODULE_REGISTRY.md inline when live DOM exposes undocumented rules.
- GIVER updates catalogs (cross-field interaction map, field-validation map) + bug-archetypes.md (new archetypes ARCH-013/014 discovered during probe).
- BUILDER updates page-object library + spec pattern docs.

**TCs are ONE output; upstream-doc upgrades are co-equal outputs.** Acceptance per phase lists count of upstream artifact updates made.

**Intake artifact class.** `clients/encore/specs_planning/_internal/intake/<module>-<agent>-<YYYY-MM-DD>.md` — dated per agent per module per cycle. Contains:

- Frontmatter: module, agent, date, parent plan, freshness window (14 days).
- Section A — Extracted artifacts: path + last-modified date + relevance.
- Section B — Inventory: dimension × known/stale/missing × `investigated:<date>`.
- Section C — Gap-name: 3 buckets with cited evidence (DOM eval / code-read / cross-artifact diff).
- Section D — Upstream updates: artifact path + section + reason + before/after diff summary.

Directory `clients/encore/specs_planning/_internal/intake/` created during step 2.5 disposition pass execution (one-time mkdir).

### 5. Track A — per-module DQU workflow (8 phases, no HIST, 3-agent routed)

Sequential within a module. Modules run one at a time; you call the order.

**Phase 0 — Extract+Inventory+Gap-name+Update-upstream** per Section 4 above. Each agent (HUNTER/GIVER/BUILDER) does this independently at start of its section. Mandatory artifact gate.

**Phase 1a — Nav2 walk** (HUNTER, CLI, unattended). Emit `old-site-baseline/<module>-<YYYY-MM-DD>.md` per LR-045. Skipped per-dimension when intake artifact's freshness markers show dimension <14 days old. Discoveries: any rule in live Nav2 not in REQUIREMENTS.md → updated inline in REQUIREMENTS.md as part of Phase 0 step D.

**Phase 1b — E2E walk** (HUNTER, CLI). Emit/refresh `field-inventories/<module>-<YYYY-MM-DD>.md` per `field-inventory-spec.md`. Same freshness rule. **Cross-field interactions discovered during walk (state-dep, validation-dep, visibility-dep, limit-dep, cascading-options, save-combinations) captured in field-inventory's "cross-field" section + flagged for GIVER Matrix D population.**

**Phase 2 — Diff** (HUNTER → handoff to GIVER). Row-by-row Nav2 vs E2E. Each mismatch resolves to ONE of: bug filed (LR-034) | intentional UX change (cite REQUIREMENTS.md / Jira) | baseline-absent (LR-ENC-001). HUNTER's Execution Summary records: count of mismatches per disposition + REQUIREMENTS.md updates made.

**Phase 3 — Archetype probe** (GIVER). Run the standing archetypes (ARCH-001..012) against the module + author NEW archetypes inline when probe surfaces a pattern not covered. First pilot (Shared Setup) authors ARCH-013 (save-cycle: dirty-state, save-then-discard, sequential-save, cross-tab) and ARCH-014 (cross-field-interaction: state/validation/visibility/limit/cascading/save-combinations). Append coverage matrix (field × archetype → yes/no/N/A) to the field-inventory artifact. GIVER's Execution Summary records: count of new archetypes authored + bug-archetypes.md sections added.

**Phase 4 — Four matrices** (GIVER; audit-first; one suite run, NOT N greps).

**Closure rule (load-bearing):** *All documented TCs having specs is NOT closure.* Closure requires Matrices A + B + C + D populated and every cell classified. The original DQU defect this remediation exists to fix was exactly "27 TCs have specs, ship it" — and Phase 4 must structurally prevent re-committing the mistake. v5 adds Matrix C + Matrix D to close two additional gap shapes v4's Matrix B alone missed.

Phase 4 produces FOUR matrices. ALL are mandatory.

**Matrix A — Existing TC Quality.** Run once:
```
npx playwright test --grep "@<module-tag>" --retries=0 --reporter=json > .reports/<module>-audit.json
```
Parse JSON to populate. Every documented FUNCTIONAL TC = one row (HIST TCs not in this matrix -- they live in Track B):

| Column | Content |
|---|---|
| TC ID | TC-LOC-{MOD}-NNN |
| Spec | file:line |
| Last-run | pass / fail / not-run |
| Quality issue | tautology / weak-assertion / private-access / encodes-workaround / boolean-collapse / none |
| Action | KEEP / FIX (describe) / DELETION-CANDIDATE (reason) / BLOCKED-BY-BUG-{ID} / MIGRATE-TO-HISTORY-PLAN |

DELETION-CANDIDATE rows flag for reviewer; do NOT delete unilaterally. MIGRATE-TO-HISTORY-PLAN rows enumerate HIST TCs that wrongly live in this module and must move to LM-History or LO-History per Phase 5e.

**Matrix B — Missing Scenario Gap Audit (field × archetype).** Cross Phase 3's archetype coverage matrix with Phase 1b's field inventory. Rows = every field in the module's field inventory. Columns = ARCH-001..012 (+ ARCH-013/014 once authored). Each cell = one of:

| Cell value | Meaning |
|---|---|
| `COVERED -- TC-LOC-{MOD}-NNN` | Existing TC exercises this archetype on this field. |
| `GAP -- new TC needed` | No existing TC covers this archetype-on-field combination. Phase 5d authors new TC. |
| `N/A -- <reason cited from archetype def or field type>` | Archetype doesn't apply. Reason MUST cite archetype scope or field-type rule (e.g., `N/A -- ARCH-002 numeric-revert scope, textarea per bug-archetypes.md`). |
| `BLOCKED-BY-BUG-{ID} -- <reason>` | Scenario reproduces but app broken; tracked via BUG. |
| `NOT-AUTOMATABLE -- <reason>` | Manual-only scenario; recorded for human QA. |

**Matrix C — Requirements-to-Coverage Trace (NEW in v5).** Rows = every business rule in `clients/encore/docs/REQUIREMENTS.md` section for this module + every open Jira ticket tagged with module + every `BUG-*.json` filed against module. Columns = (TC covering | scope | classification). Each cell = one of:

| Cell value | Meaning |
|---|---|
| `COVERED -- TC-LOC-{MOD}-NNN` | Existing TC exercises this requirement / Jira issue / bug-regression. |
| `GAP -- new TC needed` | Documented rule with no TC. Phase 5d authors TC + CSV row + spec. |
| `NOT-IN-SCOPE-FOR-MODULE -- <reason>` | Rule is cross-module (auth, app-level); not this module's burden. |
| `NO-REQUIREMENT -- <HUNTER-update-ref>` | Live behavior discovered in HUNTER Phase 1b had no documented rule; HUNTER added rule to REQUIREMENTS.md; row cites HUNTER's update. |
| `BLOCKED-BY-BUG-{ID}` | Requirement is real but app broken; bug filed. |

Closure: zero unclassified cells. This Matrix is the structural answer to "what are docs even for?" — REQUIREMENTS.md / Jira / BUGs become coverage drivers, not paperweights.

**Matrix D — Cross-Field Interactions (NEW in v5).** Six sub-matrices, consolidated into one per-module artifact:

| Sub-dimension | Rows | Cell |
|---|---|---|
| D1 State dependencies | field-pairs (gating, gated) | COVERED-TC / GAP / N/A-INDEPENDENT |
| D2 Validation dependencies | field-pairs (validator, validated) | COVERED-TC / GAP / N/A |
| D3 Conditional visibility | field-pairs (trigger, target) | COVERED-TC / GAP / N/A |
| D4 Limit dependencies | field-pairs (source, dependent-max) | COVERED-TC / GAP / N/A |
| D5 Cascading options | field-pairs (parent-select, child-options) | COVERED-TC / GAP / N/A |
| D6 Save combinations | field tuples (saved-together) | COVERED-TC / GAP / N/A-INDEPENDENT |

For Notes (1 field) → Matrix D mostly N/A-INDEPENDENT. For Shared Setup or Local Office Basic Info (multi-field) → Matrix D becomes dominant gap discoverer.

Closure: zero unclassified cells. Cell `N/A -- INDEPENDENT-FIELDS` requires a one-line justification (no implicit fields).

Matrix B + C + D are the gap-discovery outputs the original DQU never produced. They are the structural counter-rule to "27 TCs already audited, done." They do NOT skip on modules where every existing TC has a spec.

**Phase 5 — Gap and fix work** (BUILDER).

5a. **Fix FIX-action TCs.** Replace weak assertions with exact values, remove tautologies, replace private-access with public methods, replace boolean-collapse with array `.toContain` for rich diff.

5b. **Add bug-regression specs (NEW file per module).** For every filed BUG-* on the module, add a spec that asserts CORRECT behavior. Annotation rules:
- Bug reliably reproduces AND product contract is clear → `test.fail()` with `// BUG-LOC-{MOD}-NNN -- expected to pass once app fixed`.
- Bug observed but product contract pending confirmation → `test.fixme()` with `// pending /encore-questions confirmation: <question>`; queue the question.
- Bug reproduces intermittently → `test.fixme()` with intermittency note (do NOT use `test.fail()`).

Cleanup helpers may use workarounds; product specs do not normalize broken behavior.

5c. **Page-object defects -- preserve API honesty.**
- Keep `deleteRow(row)` raw (clicks Delete only); same for `deleteAllRows()`. Bug-regression specs use raw methods to exercise the actual bug.
- ADD `clearThenDeleteRow(row)` and `deleteAllRowsPersistently()` for cleanup paths. The name encodes the workaround.
- `ensureEmptyState()` migrates internal calls from `deleteAllRows()` to `deleteAllRowsPersistently()`.
- Keep `saveAndConfirm()` focused (click Save → confirm → wait pristine). No history anchoring inside the save helper.
- Add `getNoteRowCountExcludingAutoRow()` (BUG-LOC-NTS-003 auto-row).
- Add `getCharCountAndMax(): {used, max}` — spec asserts `max === 4000` (locks soft limit).
- Add `focusNoteRow(row)` public method to replace TC-022 `['getElement']` bracket bypass.
- `confirmSaveDialog()` keeps polymorphic resilience.

5d. **Author every Matrix-B/C/D GAP cell into a real TC + CSV row + spec.** Every Phase 4 matrix cell with value `GAP -- new TC needed` becomes:
- A new TC entry in `clients/encore/specs_planning/test-cases/setup/<section>/<module>_test_cases.md` with next available `TC-LOC-{MOD}-NNN` ID, citing the source (ARCH-NNN for Matrix B; REQUIREMENTS section / Jira ticket / BUG-* for Matrix C; field-pair + sub-dimension for Matrix D).
- A new spec in the module's existing spec file (or a new `<module>-gaps.spec.ts` if the module's main spec is closed for additions).
- A regenerated CSV row in `clients/encore/exports/<module>_test_cases.csv` via the existing CSV regeneration pipeline (one run after all TCs are added; do not regenerate per TC).

"No gaps found" is valid Phase 4 outcome ONLY when every cell of every matrix is classified COVERED / N/A / BLOCKED-BY-BUG / NOT-AUTOMATABLE / NOT-IN-SCOPE / NO-REQUIREMENT (with HUNTER-update ref) — never as default. Phrases like "Notes already has 27 TCs, no probe needed" are structurally forbidden.

5e. **HIST migration cleanup (LR-050 stale-slop in-scope).** If the module's pre-existing TC/spec files contain HIST TCs:
- Move TC definitions from `locations_<module>_test_cases.md` to the appropriate history TC file.
- Move spec tests from per-module HIST spec file to the consolidated `location-management-history.spec.ts` or `local-office-history.spec.ts`.
- Delete the per-module HIST spec file once empty.
- Update parent pilot Execution Summary with provenance line.
- Grep verifies: 0 HIST TCs in source-module TC/spec files; N HIST TCs in History submodule files.
- Activity-log row per LR-028.

**Phase 6 — Determinism** (BUILDER, self-runs). Run `npx playwright test --grep "@<module-tag>" --retries=0` three fresh times. All non-bug-regression tests pass each run. `test.fail()` cases continue to fail; `test.fixme()` stay skipped. Per LR-018/LR-024. **BUILDER 2-cycle fix budget**: if a test fails twice after BUILDER's fix attempts, surface as obstacle row in handoff — do not escalate to HEALER, do not auto-skip.

**Phase 7 — Honest closure with explicit bug-debt accounting** (WATCHDOG, fresh session per AUD-017).

Execution Summary MUST report (per LR-027):
```
Phase 6 run counts:
- passing: X
- expected_fail (test.fail, bug-regression): Y    open BUG IDs: BUG-..., BUG-...
- pending_confirmation (test.fixme): Z            open questions: <list>
- total runnable: X + Y + Z

TC delta:
- KEEP: <count>
- FIX (assertions strengthened): <count> -- TC IDs
- DELETION-CANDIDATE: <count> -- TC IDs + reasons
- MIGRATE-TO-HISTORY-PLAN: <count> -- TC IDs moved out
- new TCs from Matrix B gaps: <count> -- each cites ARCH-NNN + field name
- new TCs from Matrix C gaps: <count> -- each cites REQUIREMENTS section / Jira / BUG
- new TCs from Matrix D gaps: <count> -- each cites sub-dimension (D1..D6) + field pair
- CSV regenerated: yes/no -- path

Matrix breakdown:
- Matrix A rows: <count>
- Matrix B cells: <fields x archetypes>; COVERED/GAP/N/A/BLOCKED/NOT-AUTOMATABLE counts
- Matrix C cells: <rules+jira+bugs>; COVERED/GAP/NOT-IN-SCOPE/NO-REQUIREMENT/BLOCKED counts
- Matrix D cells: <field-pairs x 6 sub-dimensions>; COVERED/GAP/N/A-INDEPENDENT counts
- unclassified: 0 (HARD requirement; non-zero = HALT)

Phase 0 intake artifacts:
- HUNTER: intake/<module>-hunter-<date>.md
- GIVER: intake/<module>-giver-<date>.md
- BUILDER: intake/<module>-builder-<date>.md

Upstream knowledge-base delta:
- REQUIREMENTS.md sections added: <count> with paths
- MODULE_REGISTRY.md entries added: <count>
- bug-archetypes.md archetypes added: <count> (ARCH-NNN list)
- catalog rows added: <count>
- field-inventory dimensions added: <count>

HIST migration check (Phase 5e):
- HIST TCs in source-module files: 0 (grep verify)
- HIST TCs in history-submodule files: N (grep verify)
- per-module HIST spec files deleted: <list>

Bugs filed / closed / re-verified per LR-044.
LR-040 closure: every planned item classified (a)/(b)/(c).
```

Plus: `regression-guard` before/after; external `/audit` GREEN in DIFFERENT session per AUD-017; activity-log row per LR-028.

### 6. Track B — centralized History submodule plans (NEW, 2 plans only)

Two dedicated plans, NOT bundled with any source module:

**PLAN_LM_HISTORY_COVERAGE.md** -- Location Management History (87 columns).
- Single spec file: `location-management-history.spec.ts`.
- Depends on column-root catalogs being complete for the columns under test. Catalogs done: Local Office, ECT, Currency, Pricing, Notes (col 69). Catalogs pending: Local Info, Account, Legal, Shared Setup, Auto-Addon, Top-Level. Author can run the plan against any subset of done-catalog columns; pending-catalog columns get authored as their catalogs land via Phase 1b inline catalog production.
- For each column: identify root submodule + root field (from catalog) → author scenarios → navigate to root → save scenario → navigate to History → byte-exact verify column (use `.toContain([formA, formB])` for valid-form-set assertions; assert `Modified On` within `sinceMs` window).
- **Per-column scenario depth — no laziness.** Each column gets exhaustive scenarios driven by the archetype × column matrix (Phase 3). At minimum, every applicable archetype produces a TC; additionally walk: empty → content; boundary (max-length, min-length); special chars; unicode; newlines/whitespace; multi-row " | " encoding if applicable; partial-delete impact; sequential-save accumulation (ARCH-013); update-existing-value; empty-after-delete-all; cross-tab save isolation (ARCH-013); auto-row trailing artifact (BUG-LOC-NTS-003 style). N/A archetypes recorded with reason. Current 5-at-col-69 baseline is floor we are leaving behind.
- HIST submodule plan follows same 8-phase template with 3-agent routing.

**PLAN_LO_HISTORY_COVERAGE.md** -- Local Office History (~42 columns).
- Single spec file: `local-office-history.spec.ts`.
- LO catalogs are already done (`hist-root-map-local-office.md` exists, glob-verified 2026-05-12). Can run anytime.
- Same per-column workflow + same no-laziness scenario depth as LM-History.

Cross-track dependency: each HIST TC cites the source-module field-inventory it consumed; HIST tests drive saves through the existing source-module page objects.

### 7. Pilots-only scope + parent persistence (NEW in v5)

**Pilots = Shared Setup FIRST, Notes SECOND.** Other 10 Track A modules (Currency, Pricing, Legal, Account, Auto-Addon, Left Panel, Local Information) are FROZEN until BOTH pilots pass WATCHDOG GREEN.

**Why Shared Setup first**: multi-field module → stress-tests Matrix D (cross-field interactions). Notes has 1 field → Matrix D mostly N/A; Notes can't validate the cross-field gap-discovery shape. If Matrix D template has a bug, we discover it in Shared Setup before Notes inherits.

**Why both must pass before thaw**: pilots template every downstream module. Broken template ships → breakage compounds 10x.

**Parent plan persistence rule (overrides LR-027 cascade default).** `PLAN_DQU_COVERAGE_REMEDIATION.md` stays in `plans/pending/` until ALL 14 child plans are in `plans/done/`:
- Both pilots (Shared Setup + Notes)
- 10 Track A module DQU plans
- 2 Track B HIST submodule plans (LM + LO)

At that point parent plan flips to `done/` with Execution Summary listing all 14 child plans + their WATCHDOG verdicts. Override of LR-027 documented as plan-specific override per LR-040 (c) — discretionary, scoped to this multi-month rollout.

### 8. Notes redo specifically

Author `plans/pending/PLAN_NOTES_AUDIT_AND_STABILIZE.md` AFTER Shared Setup pilot passes WATCHDOG GREEN. Notes inherits validated 3-agent template + 4-matrix design. Track A only (DQU functional + HIST migration). Skip Phase 1a/1b per-dimension when intake artifact's freshness markers show dimension <14 days old (Notes pilot artifacts fresh).

**First work item — Phase 0 intake + Phase 4 Matrix B/C/D gap audit on Notes.** Notes is NOT exempt from gap-fill. 27 functional TCs already having specs is evidence that Matrix A (quality) has rows; says nothing about whether Matrix B/C/D have GAP cells. Run the archetype probe against each Notes field per the field inventory; populate Matrices B, C, D. Every GAP cell → new TC + CSV row + spec in Phase 5d. Worker MUST NOT skip Phase 4 citing "Notes already has specs."

**Phase 4 Matrix A (functional only; HIST 028-032 are MIGRATE not KEEP):**

| TC ID | Spec line | Quality issue | Action |
|---|---|---|---|
| TC-LOC-NTS-001 | `:30` | -- | KEEP |
| TC-LOC-NTS-002 | `:46` | -- | KEEP |
| TC-LOC-NTS-003 | `:56` | -- | KEEP |
| TC-LOC-NTS-004 | `:68` | -- | KEEP |
| TC-LOC-NTS-005 | `:84` | weak `:92 toBeGreaterThan(0)` | FIX → exact `toBe(1)` |
| TC-LOC-NTS-006 | `:96` | -- | KEEP |
| TC-LOC-NTS-007 | `:106` | -- | KEEP |
| TC-LOC-NTS-008 | `:121` | polymorphic dialog confirm; no observed-label assertion | KEEP; observed label asserted in bug-regression for BUG-LOC-NTS-002 |
| TC-LOC-NTS-009 | `:134` | weak `:141 toBeGreaterThanOrEqual(15)` | FIX → exact `toBe(15)` |
| TC-LOC-NTS-010 | `:147` | -- | KEEP |
| TC-LOC-NTS-011 | `:158` | -- | KEEP |
| TC-LOC-NTS-012 | `:168` | uses `ensureEmptyState` cleanup → migrates to persistent variant in 5c | KEEP (after page-object migration) |
| TC-LOC-NTS-013 / -018 / -019 / -020 | `:181` (SPECIAL loop) | -- | KEEP |
| TC-LOC-NTS-014 | `:198` | -- | KEEP |
| TC-LOC-NTS-015 | `:214` | -- | KEEP |
| TC-LOC-NTS-016 | `:230` | TAUTOLOGY `:235 toBeGreaterThanOrEqual(0)` | FIX → exact assertion or drop line |
| TC-LOC-NTS-017 | `:242` | uses `ensureEmptyState` cleanup | KEEP (after page-object migration) |
| TC-LOC-NTS-021 | `:257` | -- | KEEP |
| TC-LOC-NTS-022 | `:267` | private access `:270 ['getElement']` | FIX → use new public `focusNoteRow(0)` |
| TC-LOC-NTS-023 | `:280` | weak `:290 toBeGreaterThanOrEqual(20)` | FIX → exact `toBe(20)` |
| TC-LOC-NTS-024 | `:300` | `:316 getNoteRowCount().toBe(3)` ignores auto-row | FIX → use `getNoteRowCountExcludingAutoRow().toBe(3)` |
| TC-LOC-NTS-025 | `:325` | -- | KEEP |
| TC-LOC-NTS-026 | `:343` | `:356/:363 getNoteRowCount().toBe(2)` ignores auto-row | FIX → use `getNoteRowCountExcludingAutoRow().toBe(2)` |
| TC-LOC-NTS-027 | `:370` | -- | KEEP |
| TC-LOC-NTS-028..032 | `history/location-hist-notes.spec.ts` | wrongly placed in per-module HIST spec | MIGRATE-TO-HISTORY-PLAN → move to LM-History TC file + spec; delete `location-hist-notes.spec.ts`; apply `:149` boolean-collapse fix and timestamp-anchoring fix during migration |

**Phase 5b — bug-regression specs** (`clients/encore/tests/specs/setup/locations/notes-bug-regressions.spec.ts`, NEW file):
- `BUG-LOC-NTS-001` — `test.fail()`. Add row → type → raw `deleteRow(0)` (no clear) → `clickSaveButton` → `confirmSaveDialog` → reload → assert note NOT present.
- `BUG-LOC-NTS-002` — `test.fixme()`. Type → `clickSaveButton` → assert dialog confirm button text === `"Save"`. Comment: pending /encore-questions confirmation.
- `BUG-LOC-NTS-003` — `test.fixme()` (intermittent). Type 1 row → `saveAndConfirm` → reload → assert exactly 1 textarea row visible.

**Phase 5c — page-object changes** (`location-notes.page.ts`):

| Method | Change |
|---|---|
| `deleteRow(row)` `:105` | KEEP RAW |
| `deleteAllRows()` `:112` | KEEP RAW |
| NEW `clearThenDeleteRow(row)` | `.fill('')` — wait — click Delete |
| NEW `deleteAllRowsPersistently()` | while-loop: clear first row → click first Delete |
| `ensureEmptyState()` `:254` | replace internal `deleteAllRows()` with `deleteAllRowsPersistently()` |
| `saveAndConfirm()` `:188` | KEEP FOCUSED (no history anchoring) |
| `getNoteRowCount()` `:139` | KEEP raw |
| NEW `getNoteRowCountExcludingAutoRow()` | skip trailing empty row |
| `getCharCount()` `:149` | KEEP |
| NEW `getCharCountAndMax(): {used, max}` | lock `max === 4000` |
| `confirmSaveDialog()` `:235` | KEEP polymorphic |
| NEW `focusNoteRow(row)` | public wrapper for TC-022 bracket-bypass fix |

**Phase 5e — HIST migration for Notes:**
- Move TC-028..032 from `locations_notes_test_cases.md` to LM-History TC file.
- Move test bodies from `history/location-hist-notes.spec.ts` to `location-management-history.spec.ts` (in a `@notes-col-69` `test.describe` block).
- Migrate `runCol69Assertion` helper — apply `:149` `.toContain([formA, formB])` fix and `Modified On >= sinceMs` timestamp assertion during the move.
- Delete `history/location-hist-notes.spec.ts`.
- Update PLAN_PILOT_NOTES_DISCOVERY/TESTS Execution Summaries with provenance pointer.
- Grep verify per Phase 5e general rule.

### 9. Track shape — two parallel tracks, dependency required

- **Track A — per-module DQU**: 12 modules total. Pilots: Shared Setup → Notes. Frozen: 10 others. Each module = single-file plan with HUNTER/GIVER/BUILDER sections + WATCHDOG end-cap.
- **Track B — centralized HIST**: 2 plans (LM + LO). Run as catalogs become available.

Cross-track dependency: Track B HIST tests cite Track A field-inventories. No within-track ceremony.

### 10. Pending HIST plan disposition (LR-050 enumeration, IN-SCOPE)

**Exact pending count (glob-verified 2026-05-12)**: **32 HIST-related plans in `plans/pending/`**: 1 master (`PLAN_HIST_COLUMN_FIRST_PIVOT.md`) + 1 admin (`PLAN_HIST_COMMIT_HISTORY_WORK.md`) + 1 pilot-tests (`PLAN_PILOT_SHARED_TESTS.md`) + 1 evidence (`SUBPLAN_HISTORY_01_MCP_FINDINGS.md`) + 27 `SUBPLAN_HIST_PIVOT_*` numbered 10-40 (10,11,12,13,16,17,18,19,20,21,22,23,24,25,26,27,30,31,32,33,34,35,36,37,38,39,40) + 1 DQU (`SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md`) = **32**.

**Worker-trap evidence** (direct file reads 2026-05-12):
- SP-D1 (`SUBPLAN_HIST_PIVOT_22_*.md:49`) creates forbidden `location-hist-currency.spec.ts`.
- SP-PILOT-SHARED-TESTS (`PLAN_PILOT_SHARED_TESTS.md:22,77`) creates forbidden `location-hist-shared-setup.spec.ts`.
- SP-J final-audit (`SUBPLAN_HIST_PIVOT_38_*.md:47`) permits `tests/specs/setup/locations/history/`.
- Master (`PLAN_HIST_COLUMN_FIRST_PIVOT.md:15-20`) instructs workers to pick lowest-numbered pending subplan.
- Every subplan opens with `🤖 SESSION BOOTSTRAP -- Just invoke with /execute <this-filename>` — frontmatter annotation does NOT stop self-bootstrap, only physical move to `done/` does.

LR-050 requires this enumeration to live in the restructure plan body. Both align: **no HIST plan stays in `pending/` after step 2.5**.

**Disposition vocabulary**:
- **SUPERSEDED-BY** — replaced by a named central plan; move to `done/`, set `Status: SUPERSEDED` + `**Superseded by**:`.
- **FOLDED-INTO** — scenario list / catalog artifact absorbed into a named central plan; move to `done/`, set `Status: FOLDED` + `**Folded into**:` + `**Salvage**:`.
- **ARCHIVED-REFERENCE** — not executable, evidence-only; move to `done/`, set `Status: ARCHIVED-REFERENCE` + `**Archived for**:` + leave body intact.

No KEEP-AS-INPUT, no DEFER.

| # | Plan / Subplan | Disposition | Successor / Salvage target |
|---|---|---|---|
| 1 | `PLAN_HIST_COLUMN_FIRST_PIVOT.md` | ARCHIVED-REFERENCE | Sections 1-3 (rationale + KEEP list) cite-able from `done/`; 40-subplan execution table no longer authoritative. Consumer: this plan v5. |
| 2 | `PLAN_HIST_COMMIT_HISTORY_WORK.md` | ARCHIVED-REFERENCE | Stale WIP/admin; historical context only. Consumer: none active. |
| 3 | `PLAN_PILOT_SHARED_TESTS.md` | SUPERSEDED-BY | `PLAN_SHARED_SETUP_DQU.md` (Track A pilot #1) + `PLAN_LM_HISTORY_COVERAGE.md` (col-69 + Shared-Setup-rooted cols). Creates forbidden `location-hist-shared-setup.spec.ts` — not salvaged as a file; scenario list folds into the two named plans. |
| 4 | `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` | ARCHIVED-REFERENCE | LR-036 boolean-render evidence (Unicode vs SVG). Consumer: `PLAN_LM_HISTORY_COVERAGE` + `PLAN_LO_HISTORY_COVERAGE` Phase 5 page-object work. |
| 5 | `SUBPLAN_HIST_PIVOT_10_LOCAL_INFO_PART_A.md` | FOLDED-INTO | `PLAN_LM_HISTORY_COVERAGE` Phase 1b discovery. |
| 6 | `SUBPLAN_HIST_PIVOT_11_LOCAL_INFO_PART_B.md` | FOLDED-INTO | Same as row 5. |
| 7 | `SUBPLAN_HIST_PIVOT_12_ACCOUNT_ADDRESS_CATALOG.md` | FOLDED-INTO | Same — catalog rows for Account & Address. |
| 8 | `SUBPLAN_HIST_PIVOT_13_LEGAL_CATALOG.md` | FOLDED-INTO | Same — Legal. |
| 9 | `SUBPLAN_HIST_PIVOT_16_AUTO_ADDON_CATALOG.md` | FOLDED-INTO | Same — Auto Add-On. |
| 10 | `SUBPLAN_HIST_PIVOT_17_TOP_LEVEL_CATALOG.md` | FOLDED-INTO | Same — Top-Level fields. |
| 11 | `SUBPLAN_HIST_PIVOT_18_B_LM_R_RECONCILE.md` | FOLDED-INTO | `PLAN_LM_HISTORY_COVERAGE` Phase 2 diff. |
| 12 | `SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md` | FOLDED-INTO | `PLAN_LM_HISTORY_COVERAGE` + `PLAN_LO_HISTORY_COVERAGE` Phase 5. |
| 13 | `SUBPLAN_HIST_PIVOT_20_LO_BASIC_INFO_TESTS.md` | FOLDED-INTO | `PLAN_LO_HISTORY_COVERAGE`. |
| 14 | `SUBPLAN_HIST_PIVOT_21_LO_ECT_TESTS.md` | FOLDED-INTO | Same. |
| 15 | `SUBPLAN_HIST_PIVOT_22_LM_CURRENCY_TESTS.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE`. Creates forbidden spec — not salvaged as file. |
| 16 | `SUBPLAN_HIST_PIVOT_23_LM_PRICING_TESTS.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE`. |
| 17 | `SUBPLAN_HIST_PIVOT_24_LM_LOCAL_INFO_PART_A_TESTS.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE`. |
| 18 | `SUBPLAN_HIST_PIVOT_25_LM_LOCAL_INFO_PART_B_TESTS.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE`. |
| 19 | `SUBPLAN_HIST_PIVOT_26_LM_ACCOUNT_ADDRESS_TESTS.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE`. |
| 20 | `SUBPLAN_HIST_PIVOT_27_LM_LEGAL_TESTS.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE`. |
| 21 | `SUBPLAN_HIST_PIVOT_30_LM_AUTO_ADDON_TESTS.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE`. |
| 22 | `SUBPLAN_HIST_PIVOT_31_LM_TOP_LEVEL_TESTS.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE`. |
| 23 | `SUBPLAN_HIST_PIVOT_32_LM_ORPHANS_TESTS.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE`. |
| 24 | `SUBPLAN_HIST_PIVOT_33_ANOMALY_WRITER.md` | FOLDED-INTO | `PLAN_LM_HISTORY_COVERAGE` + `PLAN_LO_HISTORY_COVERAGE` Phase 7. |
| 25 | `SUBPLAN_HIST_PIVOT_34_AUTO_FILER.md` | FOLDED-INTO | Same. |
| 26 | `SUBPLAN_HIST_PIVOT_35_E_LO_BUGS.md` | FOLDED-INTO | `PLAN_LO_HISTORY_COVERAGE` Phase 7 closure. |
| 27 | `SUBPLAN_HIST_PIVOT_36_E_LM_CUR_BUGS.md` | FOLDED-INTO | `PLAN_LM_HISTORY_COVERAGE` Phase 7. |
| 28 | `SUBPLAN_HIST_PIVOT_37_E_LM_OTHER_BUGS.md` | FOLDED-INTO | `PLAN_LM_HISTORY_COVERAGE` Phase 7. |
| 29 | `SUBPLAN_HIST_PIVOT_38_FINAL_AUDIT.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE` + `PLAN_LO_HISTORY_COVERAGE` Phase 7 closure + external `/audit` per AUD-017. |
| 30 | `SUBPLAN_HIST_PIVOT_39_K1_RULES_SWEEP.md` | FOLDED-INTO | `PLAN_LM_HISTORY_COVERAGE` Phase 7. |
| 31 | `SUBPLAN_HIST_PIVOT_40_K2_PROMPTS_SWEEP.md` | FOLDED-INTO | Same. |
| 32 | `SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md` | SUPERSEDED-BY | `PLAN_LM_HISTORY_COVERAGE` Phase 5b/7. |

**Disposition tally**: ARCHIVED-REFERENCE 3 / SUPERSEDED-BY 12 / FOLDED-INTO 17 / **Total to `plans/done/`: 32**.

**Hard rule for workers** (enforced by Stale-cleanup acceptance + AUD-017):

After step 2.5, `find clients/encore/tests/specs -name "*hist-*.spec.ts"` returns zero matches. The only legitimate History spec files are:
- `clients/encore/tests/specs/setup/locations/location-management-history.spec.ts`
- `clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts`

**Disposition pass execution** (in-scope per LR-050, runs as step 2.5 of Order of execution):
1. For each of the 32 rows in `plans/pending/`: edit the file's frontmatter to set `Status: SUPERSEDED | FOLDED | ARCHIVED-REFERENCE`, add `**Superseded by**:` / `**Folded into**:` / `**Archived for**:`, `git mv` to `plans/done/`.
2. Strip or replace `🤖 SESSION BOOTSTRAP` block in those 32 pending files with `> ARCHIVED -- DO NOT EXECUTE. See <successor>.`
3. **Done/ banner sweep (Patch 8 — scope extension, 2026-05-12)** — For the **16 HIST-related plans already in `plans/done/`** that still carry intact `🤖 SESSION BOOTSTRAP` blocks, replace each block with `> ARCHIVED -- DO NOT EXECUTE. Completed work, historical reference only.` NO frontmatter status change (already in done/). NO `git mv` (already in done/). Closes the cross-grep worker-trap that a HEALER/WATCHDOG could match if they grep across `plans/` without folder discrimination. Concrete file list (verified 2026-05-12 via `grep -lE "SESSION BOOTSTRAP" plans/done/SUBPLAN_HIST_PIVOT_*.md plans/done/PLAN_SP_B_LM_2*.md`):
   - 15 `SUBPLAN_HIST_PIVOT_*`: `02_A2_PURGE_LO_SPECS`, `03_A3_PURGE_MDS_CSVS`, `04_H_DOCS_LANG`, `05_B_LO_1_BASIC_INFO_CATALOG`, `05b_B_LO_1b_BASIC_INFO_RESIDUAL`, `06_B_LO_2_ECT_CATALOG`, `06B_B_LO_2b_ECT_DIRECT_VERIFY`, `07_B_LO_R_RECONCILE`, `08_B_LM_1_CURRENCY_CATALOG`, `09_B_LM_2_PRICING_CATALOG`, `14_B_LM_6_NOTES_CATALOG`, `15_B_LM_7_SHARED_SETUP_CATALOG`, `28_D6_LM_NOTES_TESTS`, `29_D7_LM_SHARED_SETUP_TESTS`, `41_B_LO_V_JIRA_VERIFY`.
   - 1 closure plan: `PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE`.
   - Out-of-scope: 5 non-HIST done plans with intact banners (`PLAN_54_LOCAL_FULL_CHROMIUM_RUN_4W`, `PLAN_AAA_CLIENT_DELIVERABLE_REMAINING`, `PLAN_BUNDLE_OPERATIONAL_HARDENING`, `PLAN_CLIENT_HANDOFF_VALIDATION`, `PLAN_BROWSER_TOOL_SELECTION`) — different domain, different risk surface, surface as follow-up if a worker actually trips on one.
4. `npm run plans:reindex` once at end.
5. Single LR-028 activity-log row enumerating all 48 file paths (32 pending/ disposition + 16 done/ banner-sweep), terminating with `[DONE-BANNER-SWEEP] count=16 reason=residual-cross-grep-worker-trap scope=hist-only` as the final descriptor segment.
6. Grep-verify acceptance criteria before claiming step 2.5 complete.

**Step 2.5 grep-verify acceptance** (LR-046 strict — ALL must return zero hits):
- `grep -rn --exclude=PLAN_DQU_COVERAGE_REMEDIATION.md "location-hist-" plans/pending/` → 0
- `grep -rn --exclude=PLAN_DQU_COVERAGE_REMEDIATION.md "tests/specs/setup/locations/history" plans/pending/` → 0
- `grep -rn --exclude=PLAN_DQU_COVERAGE_REMEDIATION.md "one spec file per root-tab" plans/pending/` → 0
- `find plans/pending/ -name "SUBPLAN_HIST_PIVOT_*.md"` → 0 matches
- `find plans/pending/ -name "PLAN_HIST*.md"` → 0 matches
- `find plans/pending/ -name "PLAN_PILOT_SHARED_TESTS.md"` → 0 matches
- `find plans/pending/ -name "SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md"` → 0 matches
- `find plans/pending/ -name "SUBPLAN_HISTORY_01_MCP_FINDINGS.md"` → 0 matches
- `grep -lE "SESSION BOOTSTRAP" plans/done/SUBPLAN_HIST_PIVOT_*.md plans/done/PLAN_HIST*.md plans/done/PLAN_HISTORY*.md plans/done/PLAN_SP_B_LM_2*.md` → 0 matches (**Patch 8 — done/ banner sweep gate; closes the cross-grep worker-trap on 16 HIST done plans**).

Any non-zero hit = step 2.5 NOT complete → HALT.

**Patch 9 — `--exclude` flag on 3 self-reference greps (wording cleanup, 2026-05-12)**: criteria 1–3 (the `grep -rn "location-hist-" / "tests/specs/setup/locations/history" / "one spec file per root-tab"`) were originally authored without an exclusion, but the parent plan body itself necessarily contains those literal strings to DEFINE the criteria — so a naive grep always returned 1 hit (the parent self-reference). The 2026-05-12 step-2.5 execution passed only by interpreting them as "excluding parent self-reference"; that interpretation is now made explicit via `--exclude=PLAN_DQU_COVERAGE_REMEDIATION.md` on all 6 occurrences (3 criteria × 2 locations — Step 2.5 grep-verify acceptance block + §Stale-cleanup acceptance block). Same fix applied symmetrically; literal zero now reachable. No re-disposition; wording-only cleanup. Activity-log row 270 documents.

This disposition section is in-scope for THIS plan; does not get deferred (LR-050).

---

## Order of execution (v5)

1. Approve v5.
2. Overwrite `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md` body with v5. Run `npm run plans:reindex`.
2.3. **Create directory** `clients/encore/specs_planning/_internal/intake/` (one-time mkdir for Phase 0 intake artifacts).
2.4. **Author `PLAN_LM_HISTORY_COVERAGE.md` stub** (frontmatter + Phase 1b section header only). Closes LR-040 phantom-handoff window for step 2.5 disposition recipients pointing at LM-History.
2.5. **Disposition pass** per the table in section 10 — ALL 32 HIST-related plans move from `plans/pending/` to `plans/done/`, PLUS **Patch 8 scope extension (2026-05-12)**: bootstrap banners neutralized on 16 HIST-related plans already in `plans/done/` (15 `SUBPLAN_HIST_PIVOT_*` + `PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE`). 9 grep-verify acceptance criteria gate completion (8 pending/ + 1 done/). Single activity-log row per LR-028 enumerating 48 file paths. `npm run plans:reindex`.
3. **Author + execute `PLAN_SHARED_SETUP_DQU.md`** (Track A pilot #1, authored as part of v5 approval). Uses 3-agent routing: HUNTER → GIVER → BUILDER. WATCHDOG fresh-session `/audit` after BUILDER. WATCHDOG GREEN required before step 4.
4. **Author + execute `PLAN_NOTES_AUDIT_AND_STABILIZE.md`** (Track A pilot #2, authored after Shared Setup GREEN). Uses 3-agent routing + Notes-specific content (§8 above). WATCHDOG GREEN required before step 5.
5. **Author + execute `PLAN_LO_HISTORY_COVERAGE.md`** (Track B #1). LO catalogs already exist.
6. **Author template stub** `plans/pending/_TEMPLATE_MODULE_DQU.md` (3-agent routing + 4 matrices + Phase 0 intake). Derived from validated pilot template.
7. **Thaw 10 frozen modules.** Order: user names next module(s). Default queue: Currency → Pricing → Legal → Account & Address → Auto Add-On → Left Panel → Local Information. Each module = instance of template.
8. **Author + execute `PLAN_LM_HISTORY_COVERAGE.md`** (Track B #2, full body — Phase 1b fills catalog gaps inline).
9. **Parent plan flip to `done/`** ONLY when all 14 child plans are in `plans/done/`.

---

## Files

**New (this v5 cycle):**
- `plans/pending/PLAN_SHARED_SETUP_DQU.md` — Track A pilot #1.
- `plans/pending/PLAN_LM_HISTORY_COVERAGE.md` — stub authored at step 2.4 (full body at step 8).
- `clients/encore/specs_planning/_internal/intake/` — directory created at step 2.3.

**Authored after Shared Setup pilot GREEN:**
- `plans/pending/PLAN_NOTES_AUDIT_AND_STABILIZE.md` — Track A pilot #2.
- `plans/pending/_TEMPLATE_MODULE_DQU.md` — stub for downstream module instances.
- `plans/pending/PLAN_LO_HISTORY_COVERAGE.md` — Track B #1.

**Modified during pilots (Phase 0 step D upstream-update outputs):**
- `clients/encore/docs/REQUIREMENTS.md` — HUNTER inline additions.
- `clients/encore/docs/MODULE_REGISTRY.md` — HUNTER inline additions.
- `clients/encore/specs_planning/_internal/bug-archetypes.md` — GIVER adds ARCH-013 (save-cycle) + ARCH-014 (cross-field-interaction) during Shared Setup pilot.
- `clients/encore/specs_planning/_internal/field-inventories/<module>-<date>.md` — HUNTER emits per pilot/module.
- `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<date>.md` — HUNTER emits per pilot/module.
- `clients/encore/specs_planning/_internal/intake/<module>-{hunter,giver,builder}-<date>.md` — Phase 0 intake artifacts (3 per pilot/module).

**Modified during Notes Phase 5** (preserved from v4):
- `clients/encore/tests/specs/setup/locations/location-notes.spec.ts` — fix 5 weak/tautology/private-access lines.
- `clients/encore/src/pages/setup/locations/location-notes.page.ts` — add new methods; migrate `ensureEmptyState`.
- `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md` — append Phase 4 functional matrix; remove TC-028..032.
- `clients/encore/specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md` — create/append TC-028..032.
- `clients/encore/tests/specs/setup/locations/location-management-history.spec.ts` — create/extend with migrated col 69 tests.
- DELETE: `clients/encore/tests/specs/setup/locations/history/location-hist-notes.spec.ts`.
- `plans/done/PLAN_PILOT_NOTES_DISCOVERY.md`, `plans/done/PLAN_PILOT_NOTES_TESTS.md` — provenance pointer added.
- `reports/bugs/BUG-LOC-NTS-{001,002,003}.json` — `verificationLog` entries appended.

**Reused as-is — NOT modified up front**:
- `bug-archetypes.md` (ARCH-001..012 stable; ARCH-013/014 added inline during Shared Setup GIVER), `_TEMPLATE.md`, `field-inventory-spec.md`, `baseline.md`.
- Pending SP-DQU-12..19 — lazy-migrate to Track A template per module when picked up. SP-DQU-20 SUPERSEDED in step 2.5.

**Modified in step 2.5 disposition pass** (per section 10 table):
- **32 HIST-related plans** in `plans/pending/` (3 ARCHIVED-REFERENCE + 12 SUPERSEDED-BY + 17 FOLDED-INTO): frontmatter Status + successor/folded/archived field set; `🤖 SESSION BOOTSTRAP` block replaced with `> ARCHIVED -- DO NOT EXECUTE` banner; `git mv` to `plans/done/`.
- **16 HIST-related plans already in `plans/done/`** (Patch 8 scope, 2026-05-12): `🤖 SESSION BOOTSTRAP` block replaced with `> ARCHIVED -- DO NOT EXECUTE. Completed work, historical reference only.` NO frontmatter status change. NO `git mv`. Files: 15 `SUBPLAN_HIST_PIVOT_*` (02, 03, 04, 05, 05b, 06, 06B, 07, 08, 09, 14, 15, 28, 29, 41) + `PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE`.
- Single LR-028 activity-log row enumerating all 48 file paths (32 pending/ + 16 done/) with `[DONE-BANNER-SWEEP] count=16 scope=hist-only` final descriptor.
- `plans/INDEX.md` regenerated via `npm run plans:reindex`.

---

## Acceptance

**Per agent (Phase 0 intake, NEW in v5):**
- [ ] Phase 0 intake artifact authored and dated at `intake/<module>-<agent>-<date>.md`.
- [ ] Skipped-because-known list with `investigated: <date>` citation per dimension.
- [ ] Investigated-because-missing/stale list with discovery method (MCP / code-read / live-DOM).
- [ ] Upstream knowledge-base delta listed: count of REQUIREMENTS.md sections added, MODULE_REGISTRY entries, inventory dimensions, archetypes, catalog rows.

**Per Track A module DQU (v4 + v5):**
- [ ] Phase 1a baseline <= 14 days old.
- [ ] Phase 1b field-inventory <= 14 days old, 8 keys + 7 sections + archetype matrix appended + cross-field section populated.
- [ ] Phase 2: every Nav2-vs-E2E mismatch resolves to (bug | intentional | baseline-absent) per LR-040.
- [ ] Phase 3: archetype coverage matrix attached; ARCH-013/014 authored inline during Shared Setup pilot (one-time inheritance for downstream modules).
- [ ] Phase 4 Matrix A: existing-TC quality matrix populated by ONE suite run with JSON reporter. Functional TCs only. HIST TCs marked MIGRATE-TO-HISTORY-PLAN.
- [ ] Phase 4 Matrix B: field × archetype gap matrix populated. EVERY cell classified COVERED / GAP / N/A / BLOCKED-BY-BUG / NOT-AUTOMATABLE. Zero unclassified. N/A cells cite archetype scope or field-type rule.
- [ ] **Phase 4 Matrix C (v5)**: REQUIREMENTS + Jira + BUG rows populated. EVERY cell classified COVERED / GAP / NOT-IN-SCOPE / NO-REQUIREMENT (with HUNTER-update ref) / BLOCKED-BY-BUG. Zero unclassified.
- [ ] **Phase 4 Matrix D (v5)**: 6 sub-dimensions populated. EVERY cell classified COVERED / GAP / N/A-INDEPENDENT. Zero unclassified. N/A-INDEPENDENT cells cite one-line justification.
- [ ] Phase 5: 5a fixes applied; 5b bug-regression file added; 5c page-object raw methods preserved + persistent variants added; 5d **every Matrix B+C+D GAP cell** authored as new TC + CSV row + spec; 5e HIST migration grep-verified clean.
- [ ] CSV regenerated once after Phase 5d. Path cited in Execution Summary.
- [ ] Phase 6: 3 consecutive fresh runs, retries=0, runnable subset green; `test.fail` cases fail as expected; `test.fixme` stay skipped. BUILDER 2-cycle fix budget respected.
- [ ] **Phase 7 (WATCHDOG, fresh session per AUD-017)**: closure summary reports passing / expected_fail / pending_confirmation / total_runnable; Matrix A/B/C/D cell breakdowns; new TC count + CSV regen; HIST migration grep results; Phase 0 intake artifacts present; upstream delta tally; regression-guard before/after; activity-log row per LR-028.

**Per Track B History submodule plan (v4, unchanged):**
- [ ] Single spec file (no per-source-module split).
- [ ] Every column owned by the submodule has TC + spec coverage (or NOT-AUTOMATABLE / DEFERRED / BLOCKED-BY-BUG mark). "Coverage" = exhaustive per archetype × column matrix.
- [ ] Each column TC: navigate to root → save scenario → navigate to History → byte-exact verify. Uses array `.toContain` for valid-form-set; `Modified On >= sinceMs` anchored.
- [ ] Per-column scenario depth covers every applicable archetype (empty → content, boundaries, special chars, unicode, newlines, multi-row, partial-delete, sequential-save, update-existing, empty-after-delete, cross-tab, auto-row). Non-applicable archetypes recorded with reason.
- [ ] Cross-track: each TC cites source-module field-inventory + column-root catalog row.
- [ ] Phases 6 + 7 identical to Track A acceptance.

**Pilots-only (NEW in v5):**
- [ ] Shared Setup pilot WATCHDOG GREEN before Notes redo begins.
- [ ] Both pilots WATCHDOG GREEN before any of 10 frozen modules thaws.
- [ ] PLAN_DQU_COVERAGE_REMEDIATION.md stays in `plans/pending/` until all 14 child plans in `plans/done/`. Premature parent-flip = LR-027 violation.

## Stale cleanup (LR-050, IN-SCOPE)

**Step 2.5 disposition-pass acceptance** (LR-046 strict — ALL zero/exact match before step 3):
- [ ] All **32 dispositioned plans** physically moved from `plans/pending/` to `plans/done/` per section 10 table. Count verify: `ls plans/done/ | grep -E "(PLAN_HIST|SUBPLAN_HIST_PIVOT_|SUBPLAN_HISTORY_01|PLAN_PILOT_SHARED_TESTS|SUBPLAN_DQU_20_F1i)" | wc -l` returns >= 32.
- [ ] Bootstrap-block neutralized in pending/: `grep -rn "🤖 SESSION BOOTSTRAP" plans/pending/` returns ZERO hits among 32 files.
- [ ] **Patch 8 — Bootstrap-block neutralized in 16 HIST done/**: `grep -lE "SESSION BOOTSTRAP" plans/done/SUBPLAN_HIST_PIVOT_*.md plans/done/PLAN_HIST*.md plans/done/PLAN_HISTORY*.md plans/done/PLAN_SP_B_LM_2*.md` returns ZERO matches. (Out-of-scope: 5 non-HIST done plans — `PLAN_54_LOCAL_FULL_CHROMIUM_RUN_4W`, `PLAN_AAA_CLIENT_DELIVERABLE_REMAINING`, `PLAN_BUNDLE_OPERATIONAL_HARDENING`, `PLAN_CLIENT_HANDOFF_VALIDATION`, `PLAN_BROWSER_TOOL_SELECTION`.)
- [ ] `grep -rn --exclude=PLAN_DQU_COVERAGE_REMEDIATION.md "location-hist-" plans/pending/` returns ZERO.
- [ ] `grep -rn --exclude=PLAN_DQU_COVERAGE_REMEDIATION.md "tests/specs/setup/locations/history" plans/pending/` returns ZERO.
- [ ] `grep -rn --exclude=PLAN_DQU_COVERAGE_REMEDIATION.md "one spec file per root-tab" plans/pending/` returns ZERO.
- [ ] `find plans/pending/ -name "SUBPLAN_HIST_PIVOT_*.md"` returns ZERO matches.
- [ ] `find plans/pending/ -name "PLAN_HIST*.md"` returns ZERO matches.
- [ ] `find plans/pending/ -name "PLAN_PILOT_SHARED_TESTS.md"` returns ZERO matches.
- [ ] `find plans/pending/ -name "SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md"` returns ZERO matches.
- [ ] `find plans/pending/ -name "SUBPLAN_HISTORY_01_MCP_FINDINGS.md"` returns ZERO matches.
- [ ] `npm run plans:reindex` runs clean; `plans/INDEX.md` reflects the move.
- [ ] Single LR-028 activity-log row enumerating 48 file paths (32 pending/ + 16 done/) with `[DONE-BANNER-SWEEP] count=16 scope=hist-only` final descriptor.

**Per-module HIST migration acceptance** (runs inside Notes redo Phase 5e + each future Track A module):
- [ ] Source-module HIST artifacts migrated: TCs moved; specs moved; per-module HIST spec file deleted.
- [ ] Grep verify: `grep -r "TC-LOC-.*HIST" clients/encore/specs_planning/test-cases/setup/locations/` returns rows ONLY in history TC file(s).
- [ ] Grep verify: `find clients/encore/tests/specs -name "*hist-*.spec.ts"` returns ZERO matches.
- [ ] Grep verify: `find clients/encore/tests/specs -name "*-history.spec.ts"` returns EXACTLY 2 files.
- [ ] Activity-log row per LR-028.
- [ ] PLAN_PILOT_NOTES_DISCOVERY/TESTS Execution Summaries carry provenance pointer.

---

## What this plan explicitly DOES NOT do

- Does NOT build a new field-type case catalog upfront. Existing artifacts already encode field-type scenario knowledge. `bug-archetypes.md` NOT superseded; ARCH-013/014 authored inline during Shared Setup GIVER, not upfront.
- Does NOT rewrite Notes pilot Execution Summaries as YELLOW/RED. Provenance pointer only.
- Does NOT mass-rewrite pending SP-DQU-12..19. Lazy-migrate per module. (SP-DQU-20 SUPERSEDED in step 2.5.)
- Does NOT delete client-facing TCs unilaterally. DELETION-CANDIDATE flagged with reason; reviewer approves.
- Does NOT assert bug-workaround as expected contract. Bug-regression specs assert CORRECT behavior.
- Does NOT rename raw page-object methods to hide workarounds. `deleteRow` stays raw; cleanup uses an explicitly-named persistent variant.
- Does NOT bake history-table anchoring into save helpers.
- Does NOT count `test.fail()` / `test.fixme()` as "green coverage". Phase 7 reports them separately.
- Does NOT author HIST tests in per-module DQU plans.
- Does NOT keep per-source-module HIST spec files.
- Does NOT run 32 individual `--grep` invocations to populate matrices. ONE suite run with JSON reporter per module.
- Does NOT leave ANY HIST plan in `plans/pending/` after approval. Section-10 disposition pass physically moves all 32 to `plans/done/` in step 2.5.
- Does NOT execute pending HIST_PIVOT catalog subplans standalone. Catalog gaps filled inline by Phase 1b.
- Does NOT treat "all documented TCs have specs" as closure. Phase 4 Matrices B + C + D mandatory; zero unclassified cells.
- **Does NOT invoke HEALER pipeline (NEW v5)**. BUILDER attempts 2 fix cycles; failure beyond that = obstacle row in handoff per LR-039.
- **Does NOT thaw the 10 frozen modules before both pilots pass WATCHDOG GREEN (NEW v5)**. Pilots template every downstream module.
- **Does NOT move parent plan to `done/` until all 14 child plans are in `done/` (NEW v5)**. Overrides LR-027 cascade.
- **Does NOT treat REQUIREMENTS.md / MODULE_REGISTRY.md / Jira / bug-archetypes.md / catalogs as read-only (NEW v5)**. Phase 0 step D mandates upstream updates as first-class outputs.
- **Does NOT skip Phase 0 intake on any agent/module (NEW v5)**. Intake artifact is a structural gate; missing = HALT.

---

## Verification

Per agent / per module / per history-submodule plan:
1. Phase 0 intake artifact exists at `intake/<module>-<agent>-<date>.md`; freshness markers present; upstream-update section non-empty when discoveries were made.
2. `npm run plans:reindex` after each plan move.
3. `git diff`: matrices A/B/C/D appended; weak/tautology/private/boolean-collapse assertions replaced; bug-regression spec added; page-object raw helpers preserved + persistent variants added; HIST migration applied where in scope; upstream docs (REQUIREMENTS.md / MODULE_REGISTRY.md / bug-archetypes.md / catalogs) reflect discoveries.
4. `npx playwright test --grep "@<scope>" --retries=0` — 3 consecutive fresh runs all green for runnable subset; `test.fail` cases continue to fail; `test.fixme` stay skipped.
5. `regression-guard` before/after diff.
6. External `/audit` (WATCHDOG) GREEN in fresh session (AUD-017).
7. Activity-log row per LR-028.
8. Execution Summary breaks out counts (passing / expected_fail / pending_confirmation) + Matrix A/B/C/D breakdown + Phase 0 intake artifacts + upstream delta tally + HIST migration grep results.

---

## Why this works

- **One workflow per Track A module** — eight phases, 3-agent routing, twelve modules, no per-module reinvention.
- **One workflow per Track B history submodule** — same eight phases at History-submodule scope.
- **HIST architecture honest** — HIST tests live where the feature lives (History submodules), not glued onto root modules.
- **Pilots template the system** — Shared Setup proves Matrix D; Notes proves Matrix C; downstream 10 modules + 2 HIST plans inherit validated template.
- **Gap audit closes the DQU defect** — Matrices B + C + D force enumeration. "27 TCs have specs, done" structurally forbidden.
- **Page-object honesty** — `deleteRow` represents user clicking Delete; cleanup uses explicit `deleteAllRowsPersistently`.
- **Bug-debt visible** — `test.fail()` and `test.fixme()` counts appear separately in Phase 7.
- **No artifact slop** — zero new templates / catalogs / reference docs upfront; ARCH-013/014 authored inline during real exploration.
- **TC deletion gated** — flag-with-reason; no unilateral removal.
- **Stale cleanup in-scope** — 32-plan disposition pass physically clears `plans/pending/`.
- **No worker trap** — after step 2.5, `plans/pending/` contains zero HIST plans; self-bootstrap blocks neutralized.
- **Three-agent routing matches the framework's pipeline (NEW v5)** — HUNTER/GIVER/BUILDER/WATCHDOG identities already exist with scoped checklists; v5 routes pilot/module work through them.
- **Phase 0 intake = compounding knowledge improvement (NEW v5)** — module 1's HUNTER updates REQUIREMENTS.md; module 12's HUNTER reads upgraded REQUIREMENTS.md and skips 60% of rediscovery.
- **Matrix C closes the docs-for-paperweight gap (NEW v5)** — REQUIREMENTS.md becomes a coverage driver, not a Phase 2 footnote.
- **Matrix D closes the cross-field gap (NEW v5)** — field-state / validation / visibility / limit / cascading / save-combinations are first-class scenarios.
- **Pilots-only scope prevents 10x template compounding (NEW v5)** — broken template caught in Shared Setup before Notes inherits; broken template caught in Notes before 10 modules inherit.
- **Parent-persistence rule prevents premature closure (NEW v5)** — plan #1 doesn't move to `done/` until all 14 child plans done.
- **Upstream-update as first-class output (NEW v5)** — REQUIREMENTS.md / MODULE_REGISTRY.md / bug-archetypes.md / catalogs upgrade with each agent run; knowledge base monotonically improves.
- **Honest closure** — LR-027 / LR-028 / LR-040 / LR-046 / LR-050 / AUD-017 enforce no-rubber-stamp.
