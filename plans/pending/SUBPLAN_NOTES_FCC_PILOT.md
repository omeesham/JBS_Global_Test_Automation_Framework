# SUBPLAN_NOTES_FCC_PILOT — Paradigm install + Notes pilot (32 net-new FCC tests)

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-19
**Identity**: OWNER (multi-identity execution — each phase tagged)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: none
**Blocks**: every future per-module FCC subplan named in PLAN_BIG_PIVOT_FCC_MASTER.md §Roadmap (paradigm install lands here, then other modules reuse)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: multi-identity restructure spanning 6 agent prompts + framework rule edits + ~30 net-new tests + runner abstraction + paradigm doc. Default Opus tier per LR-041 (`max` reserved for RCA/closure gates).
**Author**: Rutvik (via Claude Opus 4.7)
**ActiveClient**: encore

---

## Context

Per [PLAN_BIG_PIVOT_FCC_MASTER.md](PLAN_BIG_PIVOT_FCC_MASTER.md), Notes is the pilot module for the framework-wide Field-Case Coverage (FCC) paradigm. This subplan is the **first executable** in the master's roadmap and carries TWO bundled responsibilities:

1. **Paradigm install** (Phase 1, one-time framework-wide): create the runner, the taxonomy doc, the catalog directory; update CLAUDE.md @-refs + AGENT_SHARED_RULES.md §2 + all 6 pipeline agent prompts. Every future module FCC subplan reuses this work without reinstalling.
2. **Notes pilot** (Phases 2–7, module-specific): comprehensive granular per-field-case coverage for Notes — 32 net-new FCC tests under the per-case `baseline → act → save → reload → verify → cleanup` lifecycle. Existing 37 main-spec TCs and 5 HIST-spec TCs remain untouched.

The "shiny as fuck" mandate from the user: no case should be findable after this pilot ships. Coverage spans all applicable cells of the Multi-row FormArray row in the taxonomy (positive / BVA / negative / save-cycle), plus archetype probes (ARCH-013 save-cycle 6-state, ARCH-014 cross-field where applicable), plus the 3 known BUGs' regression watches.

SSL is **explicitly out of scope** — user-owned, separate session.

---

## Bootstrap

**Identity**: OWNER orchestrates; pipeline identities execute their scoped phases. Each phase below tags `[IDENTITY: X]` so `/execute` Phase 0.1 (LR-043 §D / SP-IDS-04) cross-checks correctly.

**Skills auto-called**:
- `/identity` (each phase boundary — context-switch into the phase's identity)
- `/regression-guard` (wrap BEFORE Phase 4 + AFTER Phase 4 — structural snapshot diff)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/audit` (Phase 5 — WATCHDOG completeness audit, separate session per AUD-017)
- `/cleanup` (Phase 6 — GARDENER hygiene)
- `/final-q` (Phase 7 — mandatory closure verdict per LR-042)
- `/reflect` (post-closure — capture learnings)

**Context files** (mandatory reads before Phase 1):
- `PLAN_BIG_PIVOT_FCC_MASTER.md` (this subplan's parent)
- `CLAUDE.md` (project root)
- `clients/encore/CLAUDE.md`
- `docs/read_only_docs/LEARNED_RULES.md`
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership table)
- `.claude/rules/{angular,specs,inventory,baseline,pipeline,hooks-identity,browser-tool,plan-closure}.md`
- `.claude/skills/identity/SKILL.md`
- `clients/encore/specs_planning/_internal/{tc-authoring-rules,bug-archetypes,field-inventory-spec,test-case-template}.md`
- `clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md`
- `clients/encore/specs_planning/_internal/old-site-baseline/notes-2026-05-11.md`
- `clients/encore/specs_planning/_internal/walk-evidence-location-settings-2026-05-14.md`
- `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md`
- `clients/encore/specs/locations/location-notes.spec.ts`
- `clients/encore/specs/locations/history/location-hist-notes.spec.ts`
- `clients/encore/src/pages/locations/location-notes.page.ts`
- `clients/encore/src/selectors/locations/notes.ts`
- `clients/encore/src/selectors/locations/shared.ts`
- `clients/encore/src/data/testdata/locations/location-notes.data.ts`
- `clients/encore/src/core/base-page.ts`
- `reports/bugs/BUG-LOC-NTS-00{1,2,3}.json`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

**[IDENTITY: OWNER]**

1. Parent dependency: confirm `PLAN_BIG_PIVOT_FCC_MASTER.md` exists in `plans/pending/` (it does — created same day; this subplan does NOT block on master closure since master is a long-running tracker).
2. `/execute` Phase 0.1 — runs `node scripts/check-subplan-identity.mjs plans/pending/SUBPLAN_NOTES_FCC_PILOT.md`. Multi-identity plans need each phase's `[IDENTITY: X]` tag verified against §2 ownership.
3. `/relevant` Phase 0.5 — auto-inject skill + LR + agent-mistakes + patterns context.
4. Browser tool announcement: **none** (field-inventory 2026-05-11 is 8 days fresh per LR-013; walk-evidence 2026-05-14 confirms dialog conventions; no live UI work needed).
5. `npm run typecheck` — clean baseline (no pre-existing TS errors).
6. `npm run validate:sync` — agent-mistakes / agent-prompt drift baseline clean.
7. `git status` — clean working tree, on appropriate branch.
8. `/regression-guard snapshot` — capture pre-Phase-1 exports / imports / route maps / function signatures.

If any step fails: HALT, surface to user, do not proceed.

---

## Phase 1 — OWNER: Build paradigm infrastructure (one-time framework-wide)

**[IDENTITY: OWNER]**

Goal: install the FCC paradigm so all future module subplans consume it. Notes is the first consumer in Phase 2–6; every subsequent module reuses without reinstalling.

### Step 1.1 — Create the FCC taxonomy doc

**Create**: `clients/encore/specs_planning/_internal/field-case-generation.md` (~110 lines). Sibling to bug-archetypes.md, tc-authoring-rules.md, field-inventory-spec.md, test-case-template.md.

Content (copy verbatim):

```markdown
# Field-Case Generation Templates

> Per-field-type case taxonomy for authoring FCC (Field-Case Coverage) blocks.
> Companion to bug-archetypes.md (probe → bug) and tc-authoring-rules.md (text hygiene).
> Synthesized 2026-05-19 from external QA framework guide + existing ARCH-NNN archetypes.

## How to use
1. Read the field-inventory artifact for your module to enumerate field types.
2. For each field, look up its type in §2 → grab the case-template row.
3. Drop each case into your spec's FCC describe block via `saveAndVerifyCase()` (clients/encore/src/core/field-case-runner.ts).
4. Run each case as its own independent test. Each: baseline → act → save → reload → verify → cleanup.
5. Existing module TCs stay at the BOTTOM of the spec — FCC is additive, not destructive.

## §1 — The 3-tier save verification framing
- **Tier 1** (BASELINE, always required): UI cache invalidation via page reload + re-navigation + DOM read of persisted value. Implemented today via `reloadAndNavigateTo*Tab()` page-object helpers.
- **Tier 2** (RECOMMENDED, partial today): Network response check — POST/PUT/PATCH returned 2xx, response body reflects committed payload, server-generated metadata (timestamps, version hashes) present. `clickSaveWithDialog()` captures errors; explicit payload-structure assertions are an FCC follow-up.
- **Tier 3** (FUTURE, out-of-scope now): Direct DB query. Framework has no DB access from test suite. Note as aspirational.

## §2 — Per-Field-Type Case Templates

| Field type | Positive cases | BVA cases | Negative cases | Save-cycle cases |
|---|---|---|---|---|
| Plain text | 1-char, mid, max-1 chars | empty, max, max+1 (paste) | special chars, whitespace-only, newline, leading/trailing space | new fill, edit overwrite, append, prepend, partial-replace, clear |
| Numeric / spinbutton | min, mid, max | min-1, max+1, decimal-step boundary | "abc", "1.2.3", "-5" if positive-only, leading-zero, scientific notation | new fill, edit, revert-to-original-disables-Save (LR-009) |
| Password | meets all policy criteria | min length, max length | missing-lower, missing-upper, missing-digit, missing-special; copy-paste in confirm | typically no per-field save — covered in user creation flow |
| Checkbox (native + Radix) | check, uncheck | n/a | n/a | toggle on→save, toggle off→save, toggle-then-revert (Save stays disabled per LR-009) |
| Dropdown / combobox (Radix) | each documented option | first option, last option (LR-025 retry for 50+ options) | invalid value via DOM tamper → server rejection | each-option save+reload |
| Cascading dropdown | parent→child population | empty child when no parent | invalid pair via API bypass | parent A → child A1 save; switch parent A→B, verify child resets |
| Multi-row FormArray (e.g. Notes) | 1 row, 2 rows, N rows | empty row, max-row content, +1 over limit (paste) | special chars, newlines, unicode, html-as-text | add+save, edit+save, delete-first/middle/last+save, clear+save, delete-all+save |
| Date / offset | valid range mid | min boundary, max boundary, ±1 day | invalid format, negative offset where positive-only (LR-008), Delivery < Prep (NM-1264) | each constraint-violation reverts; valid saves+reloads |
| File upload | valid file at half-max size | empty file, exact-max byte count, +1 byte | spoofed-extension (.exe→.png), invalid MIME, cancellation mid-stream | (future — no current Encore module uses) |
| Rich text / WYSIWYG | plain text save | formatting combinations (bold/italic/list) | XSS script tag (stored as literal), oversized payload | (future — no current Encore module uses) |

## §3 — Cross-refs (probe / rule companions)
- Archetypes (probe form): bug-archetypes.md ARCH-002 (non-numeric), ARCH-005 (parent-child cascade), ARCH-009 (missing-cascade), ARCH-010 (boundary/format), ARCH-013 (save-cycle 6-state), ARCH-014 (cross-field 6-dim)
- LR rules: LR-008 (date positivity), LR-009 (revert-to-original Save state), LR-010 (async cross-field validation poll), LR-011 (NaN reload), LR-022 (no hardcoded counts), LR-025 (Radix large-dropdown retry), LR-026 (dirty-state defensive reload), LR-051 (no OR-expression asserts), LR-052 (no fixed waitForTimeout in poll), LR-053 (no strict row count w/ placeholder bug)
- Authoring hygiene: tc-authoring-rules.md Rules 1–5
- Runner: clients/encore/src/core/field-case-runner.ts
- Source: external QA framework guide (digested 2026-05-19 — see PLAN_BIG_PIVOT_FCC_MASTER and SUBPLAN_NOTES_FCC_PILOT)

## §4 — Promotion criteria
- When a second client lands → promote this doc to `docs/read_only_docs/FIELD_CASE_GENERATION.md` (framework level).
- When a new field type appears in any module → append a row to §2 with positive/BVA/negative/save-cycle templates.
- When a new ARCH-NNN archetype lands in bug-archetypes.md and overlaps a row in §2 → cross-link.
```

### Step 1.2 — Update CLAUDE.md @-references table

**Edit**: `CLAUDE.md` (project root). Locate the `@`-References table; insert ONE new row after the existing field-inventory-spec row:

```
| Per-field-type case generation taxonomy (FCC reference) | `@clients/encore/specs_planning/_internal/field-case-generation.md` |
```

### Step 1.3 — Update AGENT_SHARED_RULES.md §2 ownership

**Edit**: `docs/read_only_docs/AGENT_SHARED_RULES.md`. Locate §2 ownership table; add a row for `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-case-catalogs/`:
- GIVER (PLANNER): RW
- All other pipeline identities: READ
- OWNER: RW (per OWNER definition catch-all)

Add a row for `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-case-generation.md`:
- GIVER (PLANNER): RW (sibling to other _internal/ specs PLANNER owns)
- Others: READ

### Step 1.4 — Update each pipeline agent prompt

**Edit each of the 6 files at `.claude/agents/*.md`**. Insertion: append a new section titled `## FCC Paradigm (2026-05-19)` AFTER the existing `## Workflow` section. After all 6 edits land, run `npm run sync:mistakes` (Step 1.5) to propagate to `.github/agents/*.agent.md`.

**`.claude/agents/REQUIREMENTS.md`** (HUNTER):
```
## FCC Paradigm (2026-05-19)

When emitting a baseline artifact, include a `## FCC-lens divergences` subsection that
classifies any field-type behaviors needing FCC coverage on the new site (per `field-case-generation.md` §2).
For modules already baseline-walked, no re-walk required if the artifact is ≤14 days fresh (LR-013) —
add the FCC subsection as an in-place edit citing the existing dated artifact.
Cross-ref: `field-case-generation.md`, master plan PLAN_BIG_PIVOT_FCC_MASTER.
```

**`.claude/agents/PLANNER.md`** (GIVER):
```
## FCC Paradigm (2026-05-19)

For every module entering the pipeline post-2026-05-19, emit a dated field-case-catalog at
`clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-case-catalogs/<module>-<YYYY-MM-DD>.md`.
The catalog enumerates per-field-type cases (per `field-case-generation.md` §2), maps each to
EXISTING TC coverage vs FCC-gap, and lists the net-new FCC test IDs to be added.

Test-case file extension: append a `## Field-Case Coverage (FCC) — TC-<MOD>-FCC-NNN` block
at the END of the module's test-cases markdown (NEW namespace, not renumbering).
Each FCC TC follows the same template as a standard TC.

Selector + page-object hygiene MUST verify the runner's expected helpers exist (saveAndConfirm,
reloadAndNavigateTo*, ensureEmptyState equivalents). File a GENERATOR escalation if missing.
Cross-ref: `field-case-generation.md`, master plan PLAN_BIG_PIVOT_FCC_MASTER.
```

**`.claude/agents/GENERATOR.md`** (BUILDER):
```
## FCC Paradigm (2026-05-19)

For every spec generation under FCC paradigm:
1. Use `clients/${ACTIVE_CLIENT}/src/core/field-case-runner.ts` `saveAndVerifyCase()` for ALL FCC tests.
2. Place the FCC `test.describe(...)` block at the TOP of the spec (above existing TC blocks).
3. EVERY FCC test is independent — own `baseline()` (ensureEmptyState equivalent), own `cleanup()`,
   no shared state. `dependencyGate([])` for FCC tests.
4. Existing TCs at BOTTOM remain untouched (preserve prior coverage).
5. Per-field-type test data lives in the module's data file; reuse constants where possible.
Cross-ref: `field-case-generation.md`, runner at `src/core/field-case-runner.ts`,
master plan PLAN_BIG_PIVOT_FCC_MASTER.
```

**`.claude/agents/AUDIT.md`** (WATCHDOG): add a new mode + workflow note.
```
## FCC Paradigm (2026-05-19)

New audit mode: **FCC Completeness** (trigger: "audit FCC", "/audit fcc <module>"):
- Cross-check every applicable case template in `field-case-generation.md` §2 against the
  module's spec FCC describe block. Missing-template = HIGH severity finding.
- Verify FCC block at TOP of spec, existing TCs at BOTTOM untouched, all FCC tests independent
  (no shared baseline state, own cleanup).
- Verify no `.toBe(true)` on OR-expressions (LR-051), no strict row-count assertions where
  placeholder bugs documented (LR-053), no fixed `waitForTimeout` in polling loops (LR-052).
- Probe ARCH-010 / ARCH-013 / ARCH-014 from `bug-archetypes.md` against the new spec for
  archetype coverage.
Cross-ref: `field-case-generation.md`, master plan PLAN_BIG_PIVOT_FCC_MASTER.
```

**`.claude/agents/MAINTAINER.md`** (GARDENER):
```
## FCC Paradigm (2026-05-19)

Periodic sweep additions:
- Verify `saveAndVerifyCase()` is the single runner for FCC across all modules — dedupe any
  per-module re-implementations (escalate to BUILDER if found).
- Verify each module's field-case-catalog ≤30 days old; STALENESS_WARNING at 14–30, HALT-and-flag at >30.
- Verify `field-case-generation.md` §2 table has rows for every field type used in any module
  (grep selectors files for types).
- JSDoc discipline (ALL-006) extends to `field-case-runner.ts` and all per-module page-object
  helpers introduced by FCC (appendTo*, prependTo*, replaceSliceIn*, clear* patterns).
Cross-ref: `field-case-generation.md`, master plan PLAN_BIG_PIVOT_FCC_MASTER.
```

**`.claude/agents/HEALER.md`** (HEALER):
```
## FCC Paradigm (2026-05-19)

FCC tests are designed for per-case failure isolation. When debugging:
- One FCC test failing does NOT block others. Run `--grep "FCC-<id>"` for the single case first
  (per LR-018 + GEN-018 grep discipline). Do NOT run the whole FCC describe block to "see how
  many fail" — that obscures the per-case RCA.
- The `saveAndVerifyCase()` lifecycle has 6 anchor points (baseline / act / expectBeforeSave /
  save / reload / expectAfterReload / cleanup). Failure-summary.json should localize to one of
  these anchors — cite the anchor in your first RCA response.
- Per-FCC-case cleanup failures (cleanup leaves DB dirty) cascade into the NEXT FCC test's
  baseline failure. If you see two adjacent FCC failures, suspect cleanup-cascade first.
Cross-ref: `field-case-generation.md`, runner at `src/core/field-case-runner.ts`,
master plan PLAN_BIG_PIVOT_FCC_MASTER.
```

### Step 1.5 — Sync agent prompts

```bash
npm run sync:mistakes
```

Propagates `.claude/agents/*.md` → `.github/agents/*.agent.md`. If sync fails, HALT and surface the error.

### Step 1.6 — Verify framework health post-paradigm-install

```bash
npm run typecheck
npm run validate:sync
```

Both must pass before Phase 2.

---

## Phase 2 — HUNTER: Notes baseline freshness check (no live walk)

**[IDENTITY: HUNTER]** — switch via `/identity HUNTER`. Read `.claude/agents/REQUIREMENTS.md` per Step 2 of `/identity` skill.

### Step 2.1 — Confirm baseline artifact freshness
Read `clients/encore/specs_planning/_internal/old-site-baseline/notes-2026-05-11.md`. At session execution, calculate age: target is ≤14 days for FRESH per LR-013. If between 14 and 30, emit `STALENESS_WARNING`. If >30, fall through to full Phase 0.5b walk per `.claude/rules/baseline.md`.

As of subplan authoring (2026-05-19) the artifact is 8 days old — FRESH.

### Step 2.2 — Field-inventory drift check
Read `clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md` §Field Inventory table. **Known drift** discovered during plan authoring: the inventory comment claims `btnNotesAdd` has "no data-testid" but `clients/encore/src/selectors/locations/notes.ts:45` shows `btnNotesAdd: '[data-testid="location-settings-btn-add-note"]'`. Same applies to `lblNotesCharCounter` (`location-settings-label-note-character-counter`) and `barNotesProgress` (`location-settings-label-note-character-progress`). Flag for GIVER refresh in Phase 3.3.

### Step 2.3 — Emit FCC-lens addendum (in-place edit)
Append a `## FCC-lens divergences` subsection to the existing baseline artifact (in-place edit, do NOT emit a new dated artifact since fields haven't changed). Content:

```markdown
## FCC-lens divergences (added 2026-05-19, OWNER directive SUBPLAN_NOTES_FCC_PILOT)

Field type per `field-case-generation.md` §2: **Multi-row FormArray** (the only input field on Notes).
Case templates applicable: positive (1 row, N rows), BVA (empty, max=4000, max+1=4001 via paste),
negative (newlines, whitespace, HTML literal), save-cycle (add+save, edit+save with all 4 edit ops:
overwrite/append/prepend/partial-replace/clear; delete-first/middle/last+save; delete-all+save).

Display-only sub-fields (counter, progress bar, empty-state): NOT save-cycle; covered by existing TCs.

Save-cycle archetypes per ARCH-013 — applicable:
1. Dirty-state preserved across in-page tab switch (TC-010 exists)
2. Save-then-discard rollback (TC-027 exists — Cancel dialog)
3. Save-then-reload server persistence (TC-009 exists — and 12 others)
4. Navigate-away unsaved-changes alertdialog (TC-011 exists — beforeunload)
5. Sequential-save HIST row count (TC-033 exists)
6. Cross-tab save isolation (NOT covered today — FCC gap)

Cross-field archetypes per ARCH-014 — applicable: D3 (conditional visibility — Delete button) only;
D1/D2/D4/D5/D6 N/A (Notes has no in-Notes cross-field dependency).

Net-new FCC gaps vs existing coverage: see field-case-catalog (PLANNER deliverable, Phase 3).
```

### Step 2.4 — Activity log row
No queue entry (pipeline manual mode for this work). Activity log per LR-028:

```
| 2026-05-19Thh:mm | requirements | done | _internal/old-site-baseline/notes-2026-05-11.md | FCC-lens addendum per SUBPLAN_NOTES_FCC_PILOT Phase 2 |
```

---

## Phase 3 — GIVER: Notes field-case catalog + TC additions + drift fixes

**[IDENTITY: GIVER]** — `/identity GIVER`. Read `.claude/agents/PLANNER.md` (now includes FCC Paradigm section from Phase 1.4).

### Step 3.1 — Create the Notes field-case catalog
**Create**: `clients/encore/specs_planning/_internal/field-case-catalogs/notes-2026-05-19.md`.

Frontmatter:
```
---
artifact: field-case-catalog
client: encore
module: notes
session_date: 2026-05-19
author_identity: GIVER
parent_plan: SUBPLAN_NOTES_FCC_PILOT
source_inventory: ../field-inventories/notes-2026-05-11.md
source_baseline: ../old-site-baseline/notes-2026-05-11.md
source_walk_evidence: ../walk-evidence-location-settings-2026-05-14.md
related_bugs: [BUG-LOC-NTS-001, BUG-LOC-NTS-002, BUG-LOC-NTS-003]
stale_after: 2026-06-18
---
```

Body sections:

**§ Field-type assessment** — Single input field type: **Multi-row FormArray** (textarea per row, FormArray name `notes.notes.{i}.note`). Per `field-case-generation.md` §2, this type warrants 4 columns of cases (positive / BVA / negative / save-cycle).

**§ Existing coverage map (37 main spec TCs + 5 HIST TCs)** — table mapping each existing TC ID to its FCC category. Filled in by GIVER reading `locations_notes_test_cases.md` row-by-row.

**§ Net-new FCC test inventory (32 tests)**:

| TC ID | Group | Title (catalog form) |
|---|---|---|
| TC-LOC-NTS-FCC-001 | α (BVA) | 1-char persist (BVA min) |
| TC-LOC-NTS-FCC-002 | α (BVA) | 3999-char persist (BVA -1) |
| TC-LOC-NTS-FCC-003 | α (BVA) | 4000-char persist (BVA exact — explicit) |
| TC-LOC-NTS-FCC-004 | α (BVA) | 4001-char persist (BVA +1, paste, soft-limit) |
| TC-LOC-NTS-FCC-005 | α (defer) | 10000-char persist (DEFERRED — file `/encore-questions` for server max) |
| TC-LOC-NTS-FCC-006 | β (special) | Whitespace-only "   " persist |
| TC-LOC-NTS-FCC-007 | β (special) | Leading whitespace "  hello" persist (NOT trimmed) |
| TC-LOC-NTS-FCC-008 | β (special) | Trailing whitespace "hello  " persist (NOT trimmed) |
| TC-LOC-NTS-FCC-009 | β (special) | Tab character "a\tb" persist |
| TC-LOC-NTS-FCC-010 | β (special) | Newline "line1\nline2\nline3" persist (MAIN spec; HIST col 69 already covered) |
| TC-LOC-NTS-FCC-011 | β (special) | HTML entity literals "&amp; &#039; &lt;" persist (NOT decoded) |
| TC-LOC-NTS-FCC-012 | γ (edit) | Edit append |
| TC-LOC-NTS-FCC-013 | γ (edit) | Edit prepend |
| TC-LOC-NTS-FCC-014 | γ (edit) | Edit partial-replace (slice middle) |
| TC-LOC-NTS-FCC-015 | γ (edit) | Edit clear-to-empty (fill "" — row stays with empty value) |
| TC-LOC-NTS-FCC-016 | δ (multi) | 2-row positive (smallest multi-row save+reload) |
| TC-LOC-NTS-FCC-017 | δ (multi) | 5-row positive (smoke at moderate count) |
| TC-LOC-NTS-FCC-018 | δ (multi) | Mixed-content (row 0 = 1-char, row 1 = 4000-char) save+reload |
| TC-LOC-NTS-FCC-019 | δ (multi) | Edit row 1 of 2 — row 0 value unchanged after save+reload |
| TC-LOC-NTS-FCC-020 | ε (delete) | Delete first of 2 rows → row 1 becomes sole remaining row |
| TC-LOC-NTS-FCC-021 | ε (delete) | Delete last of 3 rows → rows 0+1 remain |
| TC-LOC-NTS-FCC-022 | ε (delete) | Delete one of one (single row) → empty state persists |
| TC-LOC-NTS-FCC-023 | ζ (dialog) | Save → Cancel → edit → Save → Ok → final value persists (re-save flow) |
| TC-LOC-NTS-FCC-024 | ζ (dialog) | Save → dialog opens → reload page mid-dialog → no persist, no error |
| TC-LOC-NTS-FCC-025 | ζ (dialog) | Save → Escape key on dialog → dialog closes, dirty preserved, no persist |
| TC-LOC-NTS-FCC-026 | ζ (dialog) | Save → click outside dialog → behavior (verify whether dialog dismisses or stays) |
| TC-LOC-NTS-FCC-027 | ζ (dialog) | Idempotent save (save → state pristine → save attempt → button stays disabled, no API call) |
| TC-LOC-NTS-FCC-028 | η (state) | Sequential save → 2 HIST rows (one per save, NOT one merged row) |
| TC-LOC-NTS-FCC-029 | η (state) | Save Notes → switch to Currency tab → verify Currency NOT dirty (cross-tab isolation) |
| TC-LOC-NTS-FCC-030 | θ (BUG-001) | Delete row WITH explicit clearNote() first → persists (BUG-LOC-NTS-001 workaround happy-path) |
| TC-LOC-NTS-FCC-031 | θ (BUG-001) | Delete row WITHOUT clearNote() first → asserts current behavior (BUG-LOC-NTS-001 regression watch) |
| TC-LOC-NTS-FCC-032 | θ (BUG-003) | Post-save row count = N+1 placeholder check — assert content of rows 0..N-1 NOT total count (LR-053) |

**§ Cases EXPLICITLY DEFERRED** (out of pilot, documented for follow-up):
- FCC-005 (10000-char): file `/encore-questions` entry naming server max question.
- A11y aria-required gap (ARCH-007): pre-existing a11y gap with `discussion-item` disposition; not a new TC.
- FCC-026 click-outside-dialog: if behavior is intentional UX, deferred; if a defect, file `/find-bugs` follow-up.

**§ Drift fixes (PLANNER scope, this catalog session)**:
1. `notes-2026-05-11.md` field-inventory row for `Add button`: claims "no data-testid" — actual is `location-settings-btn-add-note`. Edit the row.
2. Same file `Character counter` row: claims no testid — actual is `location-settings-label-note-character-counter`. Edit.
3. Same file `Progress bar` row: claims no testid — actual is `location-settings-label-note-character-progress`. Edit.
4. MCP_VERIFICATION_LOG row "Strict mode risks" — confirm selectors file uses `txtNoteInputAll` already (it does — `'[data-testid="location-settings-section-notes"] textarea'`). No edit needed.
5. CRITICAL CORRECTIONS table — corrections still valid. No edit.

**§ Save dialog convention (per BUG-LOC-NTS-002 verification 2026-05-14)** — all `/settings/location` sub-tabs (8 tabs including Notes) use **"Ok"** as the dialog confirm button. Local Office Settings tabs use "Save". This is a page-scoped convention. The shared selector `btnSaveChangesConfirm` in `clients/encore/src/selectors/locations/shared.ts` is the load-bearing identifier — verify (Phase 3.4) it correctly handles "Ok" for this page; if it currently targets `has-text("Save")`, escalate to BUILDER.

### Step 3.2 — Append FCC TC block to test-cases markdown
**Edit**: `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md`.

After the existing HIST per-column tests block (after TC-032), append a new section:

```markdown
---

## Field-Case Coverage (FCC) — TC-LOC-NTS-FCC-001..032

**Derived_From**: `_internal/field-case-catalogs/notes-2026-05-19.md`
**Paradigm**: Per-field-case save+reload+verify per `_internal/field-case-generation.md` §2
**Runner**: `clients/encore/src/core/field-case-runner.ts` `saveAndVerifyCase()`
**Source**: SUBPLAN_NOTES_FCC_PILOT (2026-05-19)
```

For each of the 32 FCC TCs, emit a standard TC block following the existing template:

```
## TC-LOC-NTS-FCC-NNN: <title from catalog>
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none (each FCC test is independent — see SUBPLAN_NOTES_FCC_PILOT discipline)
**Steps**: 1. ensureEmptyState 2. <act per catalog> 3. saveAndConfirm 4. reloadAndNavigateToNotesTab 5. <verify per catalog>
**Expected**: <persisted value match per catalog>
**Data**: office=1604 | <constants per catalog>
**Cleanup**: ensureEmptyState
```

Each TC follows tc-authoring-rules.md (no bold for UI labels — quote with `"…"` instead; no symbols; plain English; no jargon).

### Step 3.3 — Fix drift in field-inventory
**Edit**: `clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md`. Fix the 3 testid drifts identified in Step 3.1. Add CORRECTIONS row at the top:

```
| **2026-05-19** | testid drift correction (SUBPLAN_NOTES_FCC_PILOT Phase 3.3): btnNotesAdd, lblNotesCharCounter, barNotesProgress now correctly listed with data-testids per selectors file. No behavioral change. |
```

This is a metadata fix (no behavioural content change) — no new MCP walk required per LR-013 amendment.

### Step 3.4 — Verify save dialog convention vs shared selector
**Read**: `clients/encore/src/selectors/locations/shared.ts` (the `btnSaveChangesConfirm` selector). 

- If it correctly handles "Ok" for `/settings/location` (e.g., text-match disjunction or page-scoped variant): record in catalog §Save-dialog-convention; skip escalation.
- If it targets `has-text("Save")` only: file a GENERATOR escalation in `clients/encore/specs_planning/_internal/agent-escalations.json`:

```json
{
  "from": "planner",
  "to": "generator",
  "rule": "PLN-024",
  "evidence": "BUG-LOC-NTS-002 verification log 2026-05-14 confirms ALL /settings/location sub-tabs use 'Ok'. shared.ts btnSaveChangesConfirm targets 'Save' only — spec helpers will time out.",
  "remediation": "Update btnSaveChangesConfirm to a page-aware variant or text-match disjunction. Follow-up plan: PLAN_LOC_SETTINGS_OK_DIALOG_HELPER."
}
```

**Do NOT modify the selector here** — selectors are GIVER RW but cross-page impact warrants explicit BUILDER work in a separate plan.

### Step 3.5 — Self-audit + activity log
- Catalog frontmatter has 8 mandatory keys.
- TC IDs in FCC block don't collide with existing 001–037 numbering.
- Drift fixes saved.
- TC-parity sanity: `npm run check:tc-parity` shows new TCs not yet in spec (expected; BUILDER fills them in Phase 4).
- Activity log row per LR-028.

---

## Phase 4 — BUILDER: Notes spec implementation

**[IDENTITY: BUILDER]** — `/identity BUILDER`. Read `.claude/agents/GENERATOR.md` (now includes FCC Paradigm section from Phase 1.4).

### Step 4.0 — Pre-implementation regression-guard snapshot
```
/regression-guard snapshot
```

Captures current exports / imports / function signatures for diff at Phase 4 close.

### Step 4.1 — Create the runner
**Create**: `clients/encore/src/core/field-case-runner.ts`.

Content (final, no placeholders):

```typescript
/**
 * Field-Case (FCC) lifecycle runner. Orchestrates the per-field-case discipline:
 *   baseline → act → expectBeforeSave? → save → expectAfterSave? → reload → expectAfterReload → cleanup
 *
 * Each FCC test calls saveAndVerifyCase() once with the case's spec. The runner is page-agnostic —
 * the spec passes the page-object's `saveAndConfirm` and `reload` callbacks, so SSL / other modules
 * reuse this same runner unchanged.
 *
 * See:
 *  - clients/encore/specs_planning/_internal/field-case-generation.md — taxonomy
 *  - PLAN_BIG_PIVOT_FCC_MASTER + SUBPLAN_NOTES_FCC_PILOT — paradigm origin
 */

export interface FieldCase {
  /** TC ID for traceability, e.g. "TC-LOC-NTS-FCC-001". */
  id: string;
  /** Human-readable label for logs and Allure. */
  label: string;
  /** Bring the page to a known starting state (DB-clean equivalent). REQUIRED. */
  baseline: () => Promise<void>;
  /** Perform the one field-level change the case is testing. REQUIRED. */
  act: () => Promise<void>;
  /** Optional pre-save assertions (UI state: counter, dirty flag, button enable). */
  expectBeforeSave?: () => Promise<void>;
  /** Page-object's save-and-confirm-dialog method. REQUIRED. */
  saveAndConfirm: () => Promise<void>;
  /** Optional post-save assertions BEFORE reload (button disabled, dialog closed). */
  expectAfterSave?: () => Promise<void>;
  /** Page-object's reload-and-renavigate method. REQUIRED. */
  reload: () => Promise<void>;
  /** The persisted-value assertion AFTER reload. REQUIRED. */
  expectAfterReload: () => Promise<void>;
  /** Restore the page/DB to empty for the next case. RECOMMENDED. */
  cleanup?: () => Promise<void>;
}

/**
 * Execute one FCC case end-to-end. Throws on any step failure (Playwright assertions
 * propagate naturally — no catch/swallow). Each test() block calls this exactly once.
 *
 * Failure isolation: cleanup runs in a finally-equivalent — even if expectAfterReload
 * throws, cleanup still attempts to restore state for the next case. If cleanup itself throws,
 * the original assertion error is preserved (Playwright still reports the test failure).
 */
export async function saveAndVerifyCase(c: FieldCase): Promise<void> {
  let primaryError: unknown = null;
  try {
    await c.baseline();
    await c.act();
    if (c.expectBeforeSave) await c.expectBeforeSave();
    await c.saveAndConfirm();
    if (c.expectAfterSave) await c.expectAfterSave();
    await c.reload();
    await c.expectAfterReload();
  } catch (err) {
    primaryError = err;
    throw err;
  } finally {
    if (c.cleanup) {
      try {
        await c.cleanup();
      } catch (cleanupErr) {
        if (!primaryError) throw cleanupErr;
        // Suppress cleanup error in favor of primary assertion error.
      }
    }
  }
}
```

### Step 4.2 — Extend page object with edit helpers
**Edit**: `clients/encore/src/pages/locations/location-notes.page.ts`. Add 4 methods AFTER the existing `pasteIntoNote` (~line 100). Reuse the same Angular-friendly input-event pattern.

```typescript
/** Append text to row N's existing value via Angular-friendly input event. */
async appendToNote(row: number, suffix: string): Promise<void> {
  const textarea = this.getElement('txtNoteInputAll').nth(row);
  await textarea.focus();
  await textarea.evaluate((el: HTMLTextAreaElement, s: string) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(el, el.value + s);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, suffix);
  await textarea.press('Tab');
}

/** Prepend text to row N's existing value via Angular-friendly input event. */
async prependToNote(row: number, prefix: string): Promise<void> {
  const textarea = this.getElement('txtNoteInputAll').nth(row);
  await textarea.focus();
  await textarea.evaluate((el: HTMLTextAreaElement, p: string) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(el, p + el.value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, prefix);
  await textarea.press('Tab');
}

/** Replace [start, end) of row N's value with newText via Angular-friendly input event. */
async replaceSliceInNote(row: number, start: number, end: number, newText: string): Promise<void> {
  const textarea = this.getElement('txtNoteInputAll').nth(row);
  await textarea.focus();
  await textarea.evaluate((el: HTMLTextAreaElement, args: { s: number; e: number; n: string }) => {
    const v = el.value;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(el, v.slice(0, args.s) + args.n + v.slice(args.e));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { s: start, e: end, n: newText });
  await textarea.press('Tab');
}

/** Clear row N's textarea via Angular-friendly input event (LR-026 + BUG-LOC-NTS-001 workaround pattern). */
async clearNote(row: number): Promise<void> {
  const textarea = this.getElement('txtNoteInputAll').nth(row);
  await textarea.focus();
  await textarea.evaluate((el: HTMLTextAreaElement) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await textarea.press('Tab');
}
```

### Step 4.3 — Extend test data with FCC constants
**Edit**: `clients/encore/src/data/testdata/locations/location-notes.data.ts`. Append at end:

```typescript
// ---- FCC (Field-Case Coverage) constants — SUBPLAN_NOTES_FCC_PILOT ----
export const NOTE_1_CHAR = 'a';
export const NOTE_3999_CHARS = 'A'.repeat(3999);
export const NOTE_WHITESPACE_ONLY = '   ';
export const NOTE_LEADING_WS = '  hello';
export const NOTE_TRAILING_WS = 'hello  ';
export const NOTE_TAB_CHAR = 'a\tb';
export const NOTE_NEWLINE_MULTI = 'line1\nline2\nline3';
export const NOTE_HTML_ENTITY = '&amp; &#039; &lt;';
export const NOTE_APPEND_BASE = 'Base text';
export const NOTE_APPEND_SUFFIX = ' — appended';
export const NOTE_PREPEND_PREFIX = 'Prepended — ';
export const NOTE_REPLACE_BASE = 'Hello world there';
export const NOTE_REPLACE_SLICE = { start: 6, end: 11, replacement: 'EARTH' };
export const NOTE_2ROW_A = 'Row Alpha-2row';
export const NOTE_2ROW_B = 'Row Beta-2row';
export const NOTE_5ROW = ['r1', 'r2', 'r3', 'r4', 'r5'];
export const NOTE_MIXED_SHORT = 'a';
export const NOTE_MIXED_LONG = 'B'.repeat(4000);
export const NOTE_CANCEL_RESAVE_INITIAL = 'Initial draft';
export const NOTE_CANCEL_RESAVE_FINAL = 'Final saved';
export const NOTE_ESCAPE_DIALOG = 'Escape test';
export const NOTE_IDEMPOTENT = 'Idempotent test';
export const NOTE_SEQUENTIAL_HIST_A = 'HIST seq A';
export const NOTE_SEQUENTIAL_HIST_B = 'HIST seq B';
export const NOTE_DELETE_WORKAROUND_BASE = 'Delete with clear';
```

### Step 4.4 — Add FCC describe block at TOP of spec
**Edit**: `clients/encore/specs/locations/location-notes.spec.ts`. Insert a NEW `test.describe` block ABOVE the existing `test.describe('Location Notes @locations @notes', ...)` block.

Imports to add at top of file:
```typescript
import { saveAndVerifyCase, type FieldCase } from '../../../../src/core/field-case-runner';
import {
  NOTE_1_CHAR, NOTE_3999_CHARS, NOTE_WHITESPACE_ONLY, NOTE_LEADING_WS, NOTE_TRAILING_WS,
  NOTE_TAB_CHAR, NOTE_NEWLINE_MULTI, NOTE_HTML_ENTITY,
  NOTE_APPEND_BASE, NOTE_APPEND_SUFFIX, NOTE_PREPEND_PREFIX,
  NOTE_REPLACE_BASE, NOTE_REPLACE_SLICE,
  NOTE_2ROW_A, NOTE_2ROW_B, NOTE_5ROW, NOTE_MIXED_SHORT, NOTE_MIXED_LONG,
  NOTE_CANCEL_RESAVE_INITIAL, NOTE_CANCEL_RESAVE_FINAL, NOTE_ESCAPE_DIALOG,
  NOTE_IDEMPOTENT, NOTE_SEQUENTIAL_HIST_A, NOTE_SEQUENTIAL_HIST_B,
  NOTE_DELETE_WORKAROUND_BASE,
} from '../../../test-data/setup/locations/location-notes.data';
```

FCC describe block scaffold (one `test()` per case — 32 total):

```typescript
test.describe('Location Notes — FCC @locations @notes @fcc', () => {
  test.beforeEach(async ({ locationNotesPage }) => {
    const url = locationNotesPage.getCurrentUrl();
    if (!url.includes('settings/location')) {
      await locationNotesPage.navigateToNotesTab(OFFICE_NO);
    }
  });

  // ─── Group α — Content BVA + length ──────────────────────────────────────
  test('TC-LOC-NTS-FCC-001: 1-char persist (BVA min)', async ({ locationNotesPage }) => {
    await saveAndVerifyCase({
      id: 'TC-LOC-NTS-FCC-001',
      label: 'Notes row 0 — 1-char persist (BVA min)',
      baseline: () => locationNotesPage.ensureEmptyState(),
      act: () => locationNotesPage.fillNote(0, NOTE_1_CHAR),
      expectBeforeSave: async () => {
        expect(await locationNotesPage.getCharCount()).toBe(1);
        expect(await locationNotesPage.isSaveEnabled()).toBe(true);
      },
      saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
      reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
      expectAfterReload: async () => {
        expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_1_CHAR);
      },
      cleanup: () => locationNotesPage.ensureEmptyState(),
    });
  });

  // ... 31 more test() blocks: FCC-002 through FCC-032 ...
});
```

Patterns by group (executor expands one `test()` per catalog row):
- α (FCC-001..004): single `fillNote` → check `getNoteValue`. FCC-005 deferred (file `/encore-questions` entry).
- β (FCC-006..011): single `fillNote` or `pasteIntoNote` for newlines → exact value match.
- γ (FCC-012..015): baseline saves NOTE_APPEND_BASE then `appendToNote` / `prependToNote` / `replaceSliceInNote` / `clearNote`.
- δ (FCC-016..019): multiple `fillNote` with `clickAdd` between rows.
- ε (FCC-020..022): baseline saves N rows, `clearNote(i)` then `deleteRow(i)` per BUG-LOC-NTS-001 workaround.
- ζ (FCC-023..027): `clickSaveButton` then `cancelSaveDialog` / Escape via `page.keyboard.press('Escape')` / mid-dialog `page.reload()`.
- η (FCC-028..029): sequential save with reload between, or cross-tab switch + assert other-tab pristine.
- θ (FCC-030..032): explicit BUG-001/-003 regression watches. FCC-032 asserts content of rows 0..N-1 NOT total row count (LR-053).

Existing 37-TC describe block — **DO NOT MODIFY**. It stays untouched below the FCC block.

### Step 4.5 — Run typecheck + targeted FCC tests
```bash
npm run typecheck

# Individual FCC tests first per LR-018 + feedback_always_run_individual_first.md
npx playwright test location-notes.spec.ts --grep "FCC-001" --project=chrome --headed
# Repeat for FCC-002..FCC-032
```

Any failure → 7-step RCA per `.claude/agents/GENERATOR.md` Phase 3. Max 2 fix cycles per failure.

### Step 4.6 — Run-all verification
```bash
npx playwright test location-notes.spec.ts --project=chrome --headed
```

Expect: 32 FCC + 37 existing main TCs = **69 tests, all green**. HIST spec untouched (run separately).

If any existing 37 TC regresses → HALT. "Preserve existing hard work" constraint violated; revert and diagnose.

### Step 4.7 — Pass-rate sanity check
Deliberately break one FCC test (e.g., wrong expected value in FCC-001's `expectAfterReload`). Run all 32 FCC + 37 existing. Confirm: only that 1 FCC fails, remaining 31 FCC + 37 existing still pass. Proves the per-case independence guarantee the user asked for. Restore the change.

### Step 4.8 — Regression-guard diff
```
/regression-guard diff
```

Compare against Step 4.0 snapshot. Expected new exports: `saveAndVerifyCase`, `FieldCase`; 4 new methods on `LocationNotesPage`; ~25 new constants. No removed exports.

### Step 4.9 — Self-audit + activity log
Per `.claude/agents/GENERATOR.md` Workflow Step 8. Activity log row per LR-028.

---

## Phase 5 — WATCHDOG: FCC Completeness audit (SEPARATE SESSION per AUD-017)

**[IDENTITY: WATCHDOG]** — **CRITICAL**: per AUD-017 (no self-audit), Phase 5 MUST execute in a separate Claude Code session from Phase 4. The `/execute` orchestrator pauses Phase 5 and writes a handoff plan at `plans/pending/PLAN_NOTES_FCC_EXTERNAL_AUDIT.md`. Resume in a fresh session.

Audit checklist (Mode: FCC Completeness):
1. **Taxonomy coverage**: cross-check every applicable row in `field-case-generation.md` §2 against the FCC describe block. Multi-row FormArray has 4 columns; verify ≥1 test per non-empty cell.
2. **Independence**: each FCC test has its own `baseline()` and `cleanup()`. No shared state. No `dependencyGate(['TC-...'])` chain in FCC block.
3. **Block placement**: FCC `test.describe` at TOP of spec (line < existing block). Existing 37 TCs UNCHANGED at BOTTOM.
4. **Anti-pattern scan**:
   - No `.toBe(true)` on OR-expressions in FCC asserts (LR-051).
   - No strict row-count assertions where BUG-LOC-NTS-003 fires (LR-053). FCC-032 explicitly uses content-based assertion.
   - No fixed `waitForTimeout` inside polling loops (LR-052).
   - No bare integer assertions on row counts post-save+reload (LR-022).
5. **Archetype probe**: ARCH-010 (boundary/format), ARCH-013 (save-cycle 6-state), ARCH-014 (cross-field) covered by FCC groups α/β/γ/δ/ε/ζ/η.
6. **BUG-LOC-NTS-001 workaround applied**: Group ε delete cases use `clearNote()` before `deleteRow()`. FCC-031 explicitly tests the NO-clearNote path as a regression watch.
7. **BUG-LOC-NTS-002 convention**: dialog confirm button selector handles "Ok" (verify Phase 3.4 escalation closed or noted).
8. **BUG-LOC-NTS-003 placeholder**: FCC-032 asserts content not count.
9. **Test data hygiene**: all FCC-referenced constants exist in data file; no inline magic strings/numbers in FCC tests.
10. **Pass log**: 32 FCC + 37 existing = 69 tests passed in Step 4.6 run-all. Audit cites Allure/Playwright HTML report path + date.
11. **Pass-rate isolation test from Step 4.7**: confirmed.

Audit output: structured findings table per AUDIT.md Workflow Step 3. **Verdict**: GREEN | YELLOW | RED.

If GREEN: proceed to Phase 6. If YELLOW/RED: emit remediation prompts; pause for user to either approve fixes (cycle back through Phase 4) or accept findings + move on.

---

## Phase 6 — GARDENER: Code-quality post-sweep

**[IDENTITY: GARDENER]** — `/identity GARDENER`. Read `.claude/agents/MAINTAINER.md` (now includes FCC Paradigm section).

### Step 6.1 — Type-check + lint baseline
```bash
npm run typecheck
npm run lint:testcases
npm run validate:sync
```

All clean.

### Step 6.2 — JSDoc verification
- `field-case-runner.ts` exports have JSDoc (already from Step 4.1).
- 4 new methods on `LocationNotesPage` have 1-line JSDoc each (add if missing).

### Step 6.3 — Dedup check
Grep for duplicate `Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')` patterns across page objects. If 2+ modules use the same pattern, file a MAINTAINER escalation against BUILDER to extract a `BasePage.setTextareaValueViaEvent(locator, value)` helper. **Do NOT auto-refactor — escalate only.**

### Step 6.4 — Barrel exports
Verify any `index.ts` barrels in `src/core/` re-export `field-case-runner`. Per LR-017, no cross-module flattening.

### Step 6.5 — TC-parity check
```bash
npm run check:tc-parity
```

Confirms TC-LOC-NTS-FCC-001..032 in test-cases markdown match the spec's `test()` names.

### Step 6.6 — Self-audit + activity log
Per `.claude/agents/MAINTAINER.md`. Activity log row.

---

## Phase 7 — OWNER: Closure

**[IDENTITY: OWNER]** — `/identity OWNER`.

### Step 7.1 — Execution Summary (LR-027)
Append to this subplan:
- TCs implemented: 32 (FCC-001..032; FCC-005 documented DEFERRED with `/encore-questions` ref)
- TCs dropped: 0
- Verification: Phase 4.6 + Phase 5 GREEN with dated report paths
- Documentation: field-case-generation.md created; CLAUDE.md @-refs updated; AGENT_SHARED_RULES.md §2 extended; 6 agent prompts updated + synced; field-inventory drift corrected; BUG-LOC-NTS-002 escalation filed
- Test pass confirmation: Playwright report path + date

### Step 7.2 — Move subplan to done/
```bash
git mv plans/pending/SUBPLAN_NOTES_FCC_PILOT.md plans/done/
npm run plans:reindex
```

### Step 7.3 — Parent-cascade check
Grep `plans/pending/SUBPLAN_*` for any with `Parent: PLAN_BIG_PIVOT_FCC_MASTER.md`. If zero (this is the last child to close): note in chat — but per master's §Roadmap, future module subplans + SSL are still pending, so master stays open. Do NOT close master from this subplan; master closes only when ALL module FCC subplans are in done/ AND SSL is delivered AND DQU is triaged.

### Step 7.4 — Activity log final row
Per LR-028.

### Step 7.5 — /final-q audit
Run `/final-q`. Expect GREEN verdict (all phases passed + Phase 5 GREEN). If YELLOW/RED, surface to user before closing.

### Step 7.6 — /reflect
Capture session learnings: any FCC patterns to promote to base-page (MNT-* if 3+ occurrences across modules); BUG-LOC-NTS-002 follow-up status.

---

## Phase 2.5 — Adjacent-Sweep ritual (per LR-046 / SP00 Fix 1)

For every adjacent fix noticed during Phases 1–6 that is (same identity) + (same file/module) + (5–30 min) + (no user input needed), pick exactly ONE:
- **DO-NOW** — execute before phase closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan to add a grep-verifiable line item.

Examples already anticipated:
- BUG-LOC-NTS-002 selector helper: **APPEND** target = new file `PLAN_LOC_SETTINGS_OK_DIALOG_HELPER.md` to be authored if Phase 3.4 escalation triggers spec failures (otherwise SPAWN a tracking task only).
- Field-inventory drift on other modules: **SPAWN** a sweep task — if other modules have similar testid drift, gather into `clients/encore/specs_planning/_internal/field-inventories-drift-sweep-2026-05-19.md`.

Bare "out of scope" / "flagged for follow-up" with no recipient = HALT + ask user (per LR-040 + LR-046).

---

## Acceptance criteria (LR-040 closure gate)

Every enumerated deliverable classified (a) MCP/grep-proven, (b) inference-classified with grep-verifiable line item in a named recipient, or (c) user-flagged.

- [a] **field-case-generation.md created** — `ls clients/encore/specs_planning/_internal/field-case-generation.md` returns the file.
- [a] **CLAUDE.md @-refs row added** — `grep -F "field-case-generation.md" CLAUDE.md` returns ≥1.
- [a] **AGENT_SHARED_RULES.md §2 row added** — `grep -F "field-case-catalogs" docs/read_only_docs/AGENT_SHARED_RULES.md` returns ≥1.
- [a] **6 agent prompts updated** — `grep -l "## FCC Paradigm (2026-05-19)" .claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md` returns 6 paths. Post-sync, same grep against `.github/agents/*.agent.md` also returns 6.
- [a] **field-case-catalog at notes-2026-05-19.md** — file exists with 32-case inventory table + frontmatter.
- [a] **32 FCC TCs appended to locations_notes_test_cases.md** — `grep -c "TC-LOC-NTS-FCC-" clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md` returns ≥32.
- [a] **Field-inventory drift corrected** — `grep -F "2026-05-19" clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md` matches CORRECTIONS row.
- [a] **src/core/field-case-runner.ts exists** — `grep -n "export async function saveAndVerifyCase" clients/encore/src/core/field-case-runner.ts` returns 1.
- [a] **4 new methods on LocationNotesPage** — `grep -cE "appendToNote|prependToNote|replaceSliceInNote|clearNote" clients/encore/src/pages/locations/location-notes.page.ts` returns ≥4.
- [a] **FCC describe block at TOP of spec** — `awk '/Location Notes — FCC/{print NR; exit}'` line number < `awk '/Location Notes @locations @notes/{print NR; exit}'` line number.
- [a] **Existing 37 TCs unchanged** — `git diff` shows zero changes within the existing describe block's body.
- [a] **Run-all pass** — 32 FCC + 37 existing green. Allure/Playwright report path cited in Step 7.1 Execution Summary.
- [a] **Pass-rate sanity confirmed** — Step 4.7 deliberate-break/restore experiment passed.
- [a] **Phase 5 WATCHDOG audit GREEN** — separate-session report path cited in Step 7.1.
- [a] **Phase 6 GARDENER sweep clean** — no escalations against this subplan's deliverables.
- [b] **BUG-LOC-NTS-002 Ok-vs-Save escalation** — filed in `clients/encore/specs_planning/_internal/agent-escalations.json` (Phase 3.4); recipient: BUILDER. Grep target file post-Phase 3: `grep -F "BUG-LOC-NTS-002" clients/encore/specs_planning/_internal/agent-escalations.json` returns ≥1.
- [c] **FCC-005 (10000-char persist) DEFERRED** — `/encore-questions` entry filed naming server-max question. Catalog § "Cases EXPLICITLY DEFERRED" documents the deferral with the question ID.
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes (per phase).
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification (runnable from any future session post-closure)

```bash
# Paradigm doc + runner exist
ls clients/encore/specs_planning/_internal/field-case-generation.md
grep -n "export async function saveAndVerifyCase" clients/encore/src/core/field-case-runner.ts

# All 6 agent prompts + their synced copies have the section
grep -l "## FCC Paradigm" .claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md  # expect 6
grep -l "## FCC Paradigm" .github/agents/playwright-*.agent.md  # expect 6 post-sync

# Notes catalog exists
ls clients/encore/specs_planning/_internal/field-case-catalogs/notes-2026-05-19.md

# 32 FCC TCs land in test-cases markdown
grep -c "TC-LOC-NTS-FCC-" clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md  # expect ≥32

# FCC describe block at TOP of spec
grep -n "Location Notes — FCC" clients/encore/specs/locations/location-notes.spec.ts

# Run-all pass
npx playwright test location-notes.spec.ts --project=chrome --reporter=line  # expect 69 passed, 0 failed
```

---

## Handoff (chat-only per feedback_handoff_in_chat_only.md)

This subplan installs the FCC paradigm framework-wide (one-time) and ships the Notes pilot with 32 net-new granular per-field-case tests. After closure: every other module's FCC subplan reuses the runner, taxonomy, agent prompts, and §2 ownership rows installed here. SSL is delivered by the user in a separate session. DQU stays paused per master directive. Master plan (PLAN_BIG_PIVOT_FCC_MASTER) remains open until all module FCC subplans close.
