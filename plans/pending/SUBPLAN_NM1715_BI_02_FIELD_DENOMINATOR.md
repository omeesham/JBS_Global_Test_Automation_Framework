# SUBPLAN_NM1715_BI_02_FIELD_DENOMINATOR — find out how many fields Basic Information actually has

**Status**: PENDING
**Priority**: P0
**Created**: 2026-08-13
**Identity**: GIVER
**Parent**: PLAN_NM1715_LOC_BASIC_INFO_COVERAGE.md
**Depends on**: SUBPLAN_NM1715_BI_01_REQUIREMENTS_HARVEST.md
**Blocks**: SUBPLAN_NM1715_BI_03_OLDSITE_BASELINE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**CoverageMode**: quick
**CompactionBudget**: ~1

---

## Context

This is the gate the entire NM-1715 effort hangs on.

37 test cases (`TC-LOC-LP-001`…`037`) exist for this sub-module with clean markdown↔spec parity. They
were authored against `_internal/field-inventories/left-panel-basic-information-2026-06-11.md`, which
documents **exactly one field** — Pay To Address. Verified directly on 2026-08-13, not taken on a
worker's word.

So nobody knows how many fields this panel has. "37 test cases" is a count of tests, not a measure of
coverage, and it cannot become one until there is a denominator to divide by. That artifact is 63
days old — past the LR-013 staleness HALT threshold — so it cannot simply be refreshed in place.

**This subplan's primary product is a number.** Everything downstream is sized from it: how many
chunks `SP-04` splits into, and whether the parent's merge-down clause collapses SP-5+SP-6.

Rutvik's warning is the operating constraint: *"its a big page, and lots of features and lots of
interconnectivity exists between the fields, a lot of fields depend on other fields… some fields
lightup when other field lights up… so be very careful during walks."*

**Structure only here.** Per-field behavior probing belongs to `SP-04`. Mixing them is what produces
a walk that runs out of budget halfway and leaves a partial denominator, which is worse than none —
a partial denominator looks complete.

---

## Bootstrap

**Identity**: GIVER

**Skills auto-called**: `/identity`, `/relevant`, `/regression-guard` (wrap), `/final-q` (exit, LR-042)

**Context files**:
- `plans/pending/PLAN_NM1715_LOC_BASIC_INFO_COVERAGE.md` (parent)
- `plans/pending/SUBPLAN_NM1715_BI_01_REQUIREMENTS_HARVEST.md` (predecessor output)
- `.claude/rules/inventory.md` (LR-013 staleness, **LR-014 testid completeness**, LR-029 live DOM, **LR-062 denominator**, LR-065 grid surfaces)
- `.claude/rules/browser-tool.md` (LR-038 v2, **LR-054** — `playwright-cli` ≠ `npx playwright`)
- `.claude/rules/angular.md` (LR-009 dirty tracking, LR-011 non-numeric reload)
- `clients/encore/CLAUDE.md` (**LR-ENC-005** office 1101 vs 1604)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` (artifact schema)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§2 taxonomy)
- `clients/encore/specs_planning/_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md` (**read this before walking** — it records the exact launcher miss this walk must not repeat)

**Anti-Assumption Gates**:
- [ ] Gate 2 — no "corrupt / atypical / app-wide / regression" claim on <2 evidence sources (LR-061).
- [ ] Gate 3 — no control marked un-drivable without overlay-clear + reload + PO-selector-vs-live-DOM diff + DOM inspect.
- [ ] Gate 4 — env defers only the env-blocked step.
- [ ] Gate 6 — all phases complete or a user-signed `## Deferral Authorization`.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `SUBPLAN_NM1715_BI_01_REQUIREMENTS_HARVEST.md` is in `plans/done/`.
2. Read `.claude/context/navigation.md` Exploration Registry for this surface.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md`, filtered to `PLN-*` / `ALL-*`.
4. Read `.claude/context/patterns.md` — in particular the "un-drivable control" and "corrupt/atypical" trees.
5. LR scan — LR-013, LR-014, LR-029, LR-054, LR-062, LR-065, LR-ENC-005.
6. **Browser-tool announcement**: `BrowserTool=cli`. New site is testid-rich; `playwright-cli` is the LR-038 default. Consult LR-054 Table 2 before claiming any CLI limit.

---

## Phase 0.5b — Baseline-first walk

**Deferred by design, not skipped.** The old-site baseline is owned by
`SUBPLAN_NM1715_BI_03_OLDSITE_BASELINE.md`, which depends on this subplan — the baseline walk needs a
denominator to compare against, so it must run second. This subplan classifies **no** behavior, files
**no** bugs, and corrects **no** test cases; it only enumerates structure. Declared explicitly per
LR-048 §5.

---

## Phase 1 — Machine enumeration (LR-062)

Target: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location`, the
**Basic Information sub-module** (left panel). It is a sub-module, not a route — there is no
`/basic-info` URL.

1. Run `scripts/walk-coverage/enumerate-page.mjs` to produce the union denominator. **A model-judged
   list of "the fields I saw" is not acceptable** and is the precise failure this subplan exists to
   correct.
2. For every element in the union, record: `data-testid`, accessible label, control type, section /
   group, and **initial** state (enabled / disabled / hidden / readonly).
3. **LR-014 — the testid column must be complete.** A control with no testid is recorded as
   `NO TESTID — <the selector actually used>`. Never blank. Pay To Address is the known instance.
4. **LR-065** — any grid / list / table surface inside the panel carries behavior-cases and folds
   into the same 100% gate. Enumerate its columns too; a grid is not one element.

---

## Phase 2 — Launcher and affordance probe (the miss this walk must not repeat)

`field-case-catalogs/launcher-dialogs-2026-06-11.md` records that the 2026-06-03 walk classified Pay
To Address as "a plain disabled textbox" and was wrong. The visible input is `[disabled]` and is only
a *display*; the **label** is a clickable launcher that opens the "Pay To List" dialog. Playwright
`.click()` on that label is blocked — the label is bound to a disabled input, so actionability fails
with "element is not enabled". It must be driven via `dispatchEvent('click')`, `click({force:true})`,
or JS `label.click()`.

Therefore, for **every** control that reads disabled or inert:

1. Probe its label and its container for a click affordance before recording it as disabled (LR-057).
2. If a dialog opens, it is a **launcher**, not a disabled field — record the dialog, its filters, and
   its selection contract as part of this field's row.
3. Apply Gate 3 before writing "un-drivable": overlay-clear + reload + PO-selector-vs-live-DOM diff +
   DOM inspect. "Not clickable" nearly always means "driven wrong".

---

## Phase 3 — Empty-surface discipline (LR-040 (c) extension, LR-ENC-005)

If any surface reads empty on office 1604, do **not** record "empty" and move on. Record all three:

- **c.1 population path** — what concretely makes it populate: a UI path, a governing Jira ID, an
  admin/super-admin setup step, or **which office actually has data**. Office **1101** ("Corporate
  Office") is the corporate master/superset — check it before declaring corporate-only data absent.
- **c.2 classification** — `data-blocked` / `feature-blocked` / `by-design`.
- **c.3 escalate-if-unknown** — after a real dig (affordance probe + Jira per LR-ENC-004 + a second
  office), escalate via `/encore-questions`. Never close on "empty / refresh later".

---

## Phase 4 — Emit the artifact

Write `clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-<YYYY-MM-DD>.md`
per `field-inventory-spec.md`, superseding the one-field 2026-06-11 artifact. Include the Coverage
Manifest: machine-enumerated union, every element dispositioned, `CrossCheck: clean`,
`Coverage_Ratio 100%`.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Per adjacent fix noticed: **DO-NOW**, **SPAWN**, or **APPEND** with `grep -F` verification. Bare "out
of scope" = HALT + ask (LR-040 / LR-046).

---

## Per-Identity Satisfaction

Dated cells are refreshed to the actual emission date at closure (C6).

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | `(none)` | — |
| GIVER | field inventory | `clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-08-13.md` | `grep -c "Coverage_Ratio" clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-08-13.md` exit > 0 |
| BUILDER | (none) | `(none)` | — |
| WATCHDOG | (none) | `(none)` | — |
| HEALER | (none) | `(none)` | — |
| GARDENER | (none) | `(none)` | — |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Dated field inventory exists at the path above, superseding the 2026-06-11 artifact.
- [ ] Coverage Manifest present: machine-enumerated via `scripts/walk-coverage/enumerate-page.mjs`, every union element dispositioned, `CrossCheck: clean`, `Coverage_Ratio 100%` (LR-062 / closure Cx).
- [ ] **Field count is > 1.** If the walk genuinely yields one field, that is a HALT — it means the walk failed, not that the panel has one field.
- [ ] Testid column complete — zero blanks; every testid-less control carries `NO TESTID — <selector>` (LR-014).
- [ ] Every disabled-looking control carries an affordance-probe result (launcher or genuinely disabled), with Pay To Address recorded as a launcher.
- [ ] Every empty surface carries c.1 / c.2 / c.3.
- [ ] `/regression-guard` before/after — no silent breakage.
- [ ] Activity-log row per LR-028, timestamp ≥ all touched-file mtimes (LR-037).
- [ ] `/final-q` verdict per LR-042.

### Handoff obligation — this subplan's primary product

The Handoff section **MUST** state, as a bare number, the **field count**, and the resulting decision:

- SP-04 chunk count (≥25 fields → split as the 2-compaction law requires; 10–24 → single chunk).
- Whether the parent's merge-down clause fires (<10 fields → merge SP-5+SP-6).

A Handoff without that number does not close this subplan.

---

## Verification

```bash
# The new inventory exists and supersedes the one-field artifact
ls -t clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-*.md | head -1

# Coverage manifest reached 100%
grep -n "Coverage_Ratio\|CrossCheck" $(ls -t clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-*.md | head -1)

# No blank testid cells survived (LR-014)
grep -c "NO TESTID" $(ls -t clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-*.md | head -1)
```

---

## Handoff (post-execution)

Basic Information gains a real denominator for the first time: every control enumerated by machine,
every testid recorded or explicitly absent with the selector that works, every disabled-looking
control probed for a launcher affordance rather than assumed inert, and every empty surface carrying
its population path. The field count sets the shape of everything downstream —
`SUBPLAN_NM1715_BI_03_OLDSITE_BASELINE.md` inherits the denominator to diff the old site against, and
the parent plan reads the count to decide SP-04's split and whether the merge-down clause fires.
