# PLAN_NM1715_LOC_BASIC_INFO_COVERAGE — establish a real field denominator for Location Settings → Basic Information, then cover it QUICK (FCC Axis 1 + L1 Axis 2)

**Status**: PENDING
**Priority**: P0
**Created**: 2026-08-13
**Identity**: OWNER
**Depends on**: none
**Blocks**: PLAN_NM1715_LOC_BASIC_INFO_ULTRACOVERAGE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: plan
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**CoverageMode**: quick
**Jira**: NM-1715 — "Automate Local Office --> Basic Information" (Story, Highest, To Do, scope *Field Validation, save*)

---

## Context

NM-1715 asks for automated field-validation + save coverage of the **Basic Information sub-module**
— the left panel of `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location`.
It is a sub-module, **not a route**: there is no `/basic-info` URL.

Coverage already exists on paper — 37 test cases (`TC-LOC-LP-001`…`037`) with clean markdown↔spec
parity, a page object, selectors, test data and a test plan. Rutvik does not trust any of it: it was
authored by a prior worker fleet when the framework was far less mature. A repo census run on
2026-08-13 via a worker chip inventory (scratch; not tracked) turned that distrust into
evidence.

**The finding that justifies this whole plan:** the 37 test cases were authored against a field
inventory that documents **exactly one field** (Pay To Address). The denominator was never
established, so the number 37 carries no information about coverage. That inventory is 63 days old;
the old-site baseline is 63–71 days old. Both are past the LR-013 staleness HALT threshold.

Worse — and better — prior agents already caught themselves. `clients/encore/specs_planning/_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md`
describes the Pay To Address launcher, cites `SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC`, a false-green sweep,
and an RCA on launcher-dialog misses, and names `left-panel-basic-information-2026-06-03.md` verbatim
as *"the walk that MISSED Pay To"*. One concrete defect is already confirmed: `TC-LOC-LP-004`'s
"click → no focus" oracle was fooled by launcher-blindness, because the Pay To Address label has no
testid and Playwright `.click()` on it is blocked (the label is bound to a `[disabled]` input).

Jira carries the requirements this module never had written down locally. **NM-956 "UI: Local Office
Settings — Basic Information Validations"** (Done, 2026-08-05) is the validations spec. Supporting:
NM-977 + NM-3358 (unsaved-changes modal), NM-980 (`canEdit` permission gating on all location
settings children), NM-1090 (sync all tab data + validate all rules on **each save** — cross-tab),
NM-1146 (billing cycle conditionally disabled + tooltip), NM-933 (Account List lookup launcher),
NM-845 + NM-1455 (Pay To Address retrieval / `GetLocationPayToList`).

This plan does the QUICK half. `PLAN_NM1715_LOC_BASIC_INFO_ULTRACOVERAGE.md` continues into L2/L3.

### Provenance of the evidence base

| Claim | Source | Verified how |
|---|---|---|
| 37 distinct TC IDs, MD↔spec parity clean | census §TEST-CASE CENSUS | re-verified: `grep -o "TC-LOC-LP-[0-9]\{3\}" … \| sort -u \| wc -l` = 37 |
| Field inventory documents 1 field | census §FIELD SIGNAL | re-verified by reading the artifact directly |
| `clients/encore` identical across old/new profile paths | dispatcher | 61,211 files both sides |
| `launcher-dialogs-2026-06-11.md` exists and is on-target | dispatcher | census MISSED it — see next row |

### Known defect in the census — do not inherit it

The census built its denominator from a **filename regex** (`location|local.?office|basic.?info`).
Any on-topic artifact named by *concern* rather than *module* was invisible to it — which is exactly
how it missed `launcher-dialogs-2026-06-11.md` and how it reported the field-case-catalog as MISSING
when `left-panel-basic-information-2026-06-03.md` exists. **Its `## STALENESS` broken-ref section is
therefore unreliable and is NOT carried into this plan.** SP-1 re-establishes the denominator by
content, not filename, using `git ls-files` (which works on this path; 2,192 tracked files).

---

## Chunk-sizing law (Rutvik, 2026-08-13)

> Claude orchestrates one subplan, then the next, such that it does not compact more than **2×**
> within any single subplan.

Applied: SP-1 and SP-8 are light (~1 compaction). SP-2, SP-3, SP-5, SP-6, SP-7 are shaped to land at
~2. **SP-4 is deliberately NOT pre-split** — its split count is set from SP-2's machine-enumerated
field count. Guessing that number now would be the exact assumption this plan exists to eliminate.
SP-2's Handoff MUST state the split.

### Merge-down clause (MANDATORY — the sizing law cuts both ways)

Eight subplans is correct for a large field set and **wrong for a small one**. Rutvik's instruction
was "do not over or under subplan it" — running eight ceremonies over a six-field panel is
over-subplanning, and the ceremony cost would exceed the work.

At SP-2's close, the orchestrator MUST re-check the split against the real denominator and, if the
field count is small enough that a merged subplan still fits inside the 2-compaction law, **merge and
record it**:

| SP-2 field count | Required action |
|---|---|
| ≥ 25 | Keep all eight; split SP-4 into as many chunks as the law requires. |
| 10–24 | Keep all eight; SP-4 stays a single chunk. |
| < 10 | **Merge** SP-5+SP-6 into one, and SP-2+SP-4 into one. Five subplans, not eight. |

A merge is recorded in this plan's body with the field count that justified it — never done silently.
Merging is a sizing decision, not a scope cut: every acceptance criterion of a merged subplan
survives into its host. Dropping a criterion during a merge is an LR-046 violation and requires
Rutvik's authorization.

---

## Bootstrap

**Identity**: OWNER (orchestrator). Each subplan declares its own pipeline identity.

**Skills auto-called**: `/identity`, `/relevant`, `/regression-guard` (wrap), `/final-q` (exit).
Per-subplan: `/coverage`, `/find-bugs`, `/rca` as declared below.

**Context files**:
- `.claude/rules/pipeline.md` (LR-027/028/040/041/046/048/050/060)
- `.claude/rules/inventory.md` (LR-013 staleness, LR-014 testid completeness, LR-029, LR-062 denominator)
- `.claude/rules/specs.md` (LR-068 no silent partial coverage)
- `.claude/rules/baseline.md` (LR-034 / LR-045 baseline artifacts)
- `.claude/rules/browser-tool.md` (LR-038 v2)
- `clients/encore/CLAUDE.md` (LR-ENC-001 old-site baseline, LR-ENC-004 Jira-first, LR-ENC-005 office 1101 vs 1604)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md`
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§2 taxonomy)
- `docs/read_only_docs/LEARNED_RULES.md`, `docs/read_only_docs/AGENT_SHARED_RULES.md`

---

## Phase 0 — Gate

1. Confirm no `Depends on:` (none).
2. Read `.claude/context/navigation.md` Exploration Registry for this surface — pull findings, do not re-explore.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md`, filtered by the executing identity.
4. LR scan per subplan.
5. Declare `BrowserTool=cli` (LR-038 v2) — `playwright-cli`, not MCP, for all walks.

---

## Subplans

Each row below is the authoring spec for one subplan file under `plans/pending/`.

### SP-1 — `SUBPLAN_NM1715_BI_01_REQUIREMENTS_HARVEST`
**Identity** HUNTER · **Model** sonnet-4-6 · **Thinking** hi · **Browser** none · ~1 compaction

Two jobs, both read-only.
1. **Jira/Confluence harvest (LR-ENC-004, LR-063).** Pull NM-956 in full — it is the validations
   spec. Then NM-977, NM-3358, NM-980, NM-1090, NM-1146, NM-933, NM-845, NM-1455, NM-3133, NM-3322,
   NM-1481. Paginate past 50 results — the dispatcher's scan hit the cap and there may be more.
   Output: a dated internal NM-1715 Basic Information requirements harvest artifact (planned; not present yet),
   one row per stated requirement, each with its Jira key, so every future TC can cite a source.
2. **Content-based artifact sweep.** Re-enumerate every artifact touching this sub-module by
   **content**, not filename — `git ls-files` for the denominator, then grep for
   `left-panel-basic-information|TC-LOC-LP|Pay To|payToId|basic information`. This catches the
   concern-named files the census missed. Output: a corrected artifact table replacing census §7 and
   §STALENESS.

3. **Fold into the canonical requirements doc.** The repo's requirements of record live at
   `clients/encore/docs/REQUIREMENTS.md` (verified 2026-08-13 — note this is under `docs/`, **not**
   `specs_planning/`, which is where an earlier draft of this plan wrongly pointed). Any NM-956
   behavior that is a durable product requirement — not a one-off test note — is added there with its
   Jira key. The `_internal/requirements-nm1715-*.md` file is the working harvest; `docs/REQUIREMENTS.md`
   is the record. Do not let the harvest become a second source of truth.

**Acceptance**: requirements doc exists with ≥1 row per harvested ticket, every row carrying a Jira
key; artifact table includes `launcher-dialogs-2026-06-11.md`, `left-panel-basic-information-2026-06-03.md`,
and any false-green-sweep / RCA / walk-evidence file that mentions this module; `git ls-files` count
stated; every durable NM-956 requirement present in `clients/encore/docs/REQUIREMENTS.md` with its key.

---

### SP-2 — `SUBPLAN_NM1715_BI_02_FIELD_DENOMINATOR`
**Identity** GIVER · **Model** opus-4-8 · **Thinking** xhi · **Browser** cli · ~1 compaction
**Depends on** SP-1

**This is the gate the whole plan hangs on.** Machine-enumerate every control in the Basic
Information sub-module on office 1604: `data-testid`, accessible label, control type, section
grouping, and **initial** enabled/disabled/hidden/readonly state. Structure only — **no per-field
behavior probing** (that is SP-4).

- Use `scripts/walk-coverage/enumerate-page.mjs` for the union denominator per LR-062. A
  model-judged list is not acceptable.
- LR-014: the testid column must be complete. A control with no testid is recorded as
  `NO TESTID — <the selector actually used>`, never left blank. Pay To Address is the known case.
- Record every launcher/affordance (LR-057): a control whose visible element is `[disabled]` but
  whose label opens a dialog is a **launcher**, not a disabled field. This is the exact miss that
  produced the 06-03 walk defect.
- Re-check office 1101 for any surface that reads empty on 1604 (LR-ENC-005), and record the
  population path per LR-040 (c.1/c.2/c.3) before calling anything empty.

**Output**: `clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-<YYYY-MM-DD>.md`
per `field-inventory-spec.md`, superseding the 1-field 2026-06-11 artifact.

**Acceptance**: Coverage Manifest present, machine-enumerated, every union element dispositioned,
`CrossCheck: clean`, `Coverage_Ratio 100%` (LR-062 / closure Cx). **Handoff MUST state the field
count and the resulting SP-4 split** — that number is this subplan's primary product.

---

### SP-3 — `SUBPLAN_NM1715_BI_03_OLDSITE_BASELINE`
**Identity** HUNTER · **Model** opus-4-8 · **Thinking** xhi · **Browser** cli · ~2 compactions
**Depends on** SP-2

FULL old-site baseline walk (Rutvik's explicit call — not targeted). Baseline truth source is the
old Navigator UI per LR-ENC-001 / `.claude/rules/baseline.md` row 4.

**Access is already established and recorded — do not re-litigate it, and do not ask Rutvik for it.**
Everything below comes from `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` and
LR-ENC-001 in `clients/encore/CLAUDE.md`:

| Fact | Value |
|---|---|
| Baseline URL | `https://navigator2.training.psav.com/#/setup/locationdetail/1604` |
| Auth | **No manual login.** Live Chrome inherits the user's Microsoft SSO cookies. Access verdict GREEN (2026-04-24). |
| Test entity | office 1604 |
| Structure | Old site = **one** page with embedded tabs. New site = **two** pages at different URLs. **Not a 1:1 path match** — the "corresponding page" often does not exist at the same path. |
| Selectors | Old site has **zero `data-testid`**; it uses `name=` / `id=`. |
| Prior art | The 2026-06-11 basic-info baseline artifact already recorded `Baseline_URL` as exactly the URL above. |

**Browser tool is `playwright-cli` — everywhere, including the old site** (Rutvik, 2026-08-13:
"playwright-cli. only!!!"). The access record describes a live-Chrome session inheriting SSO, but
that documents how it was done once, not a CLI limitation. Per **LR-054**, `playwright-cli` is not
`npx playwright` — check Table 2 in `.claude/rules/browser-tool.md` before claiming any CLI limit,
and raise a genuine gap with the exact command and error rather than falling back to Chrome. Keeping
CLI also keeps SP-3 delegable, which a Chrome-MCP walk would not have been.

**FLAG-01 (from the access record, binding):** the instruction is *visit + observe*. Never "reuse
selectors on old site" and never "navigate to the corresponding page" — record observed behavior into
`old-site-baseline/<module>-<date>.md`.

Walk the corresponding Basic Information surface on the old site and emit
`clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-<YYYY-MM-DD>.md`,
superseding the 63/71-day-old pair. Then classify **every** divergence against SP-2's denominator as
(a) regression-from-baseline, (b) intentional UX change — cite REQUIREMENTS.md or the Jira key from
SP-1, or (c) `baselineScope: baseline-absent` (not a HALT).

**Acceptance**: dated baseline artifact exists; a `## Baseline diff` section dispositions every field
in SP-2's denominator into (a)/(b)/(c) with zero unclassified rows; every (b) cites a Jira key.

---

### SP-4 — `SUBPLAN_NM1715_BI_04_BEHAVIOR_WALK` *(splits into 04a…04n — count set by SP-2)*
**Identity** GIVER · **Model** opus-4-8 · **Thinking** xhi · **Browser** cli · ~2 compactions **each**
**Depends on** SP-3

The careful walk Rutvik warned about. Per field, from SP-2's denominator: default value, validation
rules and messages, enable/disable/visibility triggers, **which other fields it depends on and which
depend on it**, and save behavior.

Split by page section, one subplan per chunk, sized so each stays inside the 2-compaction law.

Binding constraints:
- **Cross-field first.** The interconnectivity is the point. For every field, actively probe what
  changes elsewhere when it changes — do not record a field in isolation and infer independence.
  "No dependency observed" is only valid after a probe; record the probe.
- **LR-040-D zero-delta law.** A probe on a filter/sort/guard/pagination/io control that produces no
  observable delta is `DIFFERENTIAL-DATA-REQUIRED`, and fires the ladder by name: rung 1
  self-produce, rung 2 self-serve across **all** surfaces (not just the control's own API — the
  admin surface counts), rung 3 escalate. **No test case may assert the zero-effect as expected
  behavior** until ground truth disambiguates.
- **LR-061 / Gate 3.** Nothing is marked un-drivable without overlay-clear + reload + PO-selector-vs-live-DOM
  diff + DOM inspect. The Pay To launcher is the standing proof that "not clickable" usually means
  "driven wrong": use `dispatchEvent('click')` / `click({force:true})` / JS `label.click()`.
- **LR-011.** Reload after any non-numeric input into a numeric field.
- **LR-009.** Never test Save-enables by reverting a field to its original value.

**Output** per chunk: `clients/encore/specs_planning/_internal/walk-evidence-basic-information-<section>-<YYYY-MM-DD>.md`,
plus a running cross-field dependency table that SP-9 (PLAN B) inherits.

**Acceptance**: every field in SP-2's denominator appears in exactly one chunk's walk evidence; zero
fields unwalked; every zero-delta probe carries rung-1/rung-2 evidence or an open
`DIFFERENTIAL-DATA-REQUIRED` disposition.

---

### SP-5 — `SUBPLAN_NM1715_BI_05_TC_AUDIT_AND_CATALOG_RECONCILE`
**Identity** OWNER (multi-identity within phases — WATCHDOG for the TC audit phases, GIVER for the catalog reconcile/write) · **Model** opus-4-8 · **Thinking** max · **Browser** cli · ~2 compactions
**Depends on** SP-4 (all chunks)
**Justification**: multi-rule judgment across 37 TCs + 3 catalogs + a documented false-green lineage.

The forensics subplan. Diff the existing 37 TCs against the real denominator and disposition **each**
as KEEP / FIX / KILL, plus enumerate MISSING (fields with no TC at all).

- `TC-LOC-LP-004` is pre-confirmed FIX — its "click → no focus" oracle was defeated by
  launcher-blindness. Treat it as the worked example, not an exception.
- Reconcile the three catalogs that exist: `left-panel-basic-information-2026-06-03.md`,
  `launcher-dialogs-2026-06-11.md`, and whatever SP-1's sweep surfaces. Read the false-green sweep
  and the launcher-dialog RCA the catalog cites — prior agents recorded their own blind spot and it
  must not be re-walked from zero.
- Apply LR-044 to any TC that references a filed bug: read `stepsToReproduce` verbatim, follow it
  exactly, then minimize.
- Every KILL needs a reason; a TC deleted without one is an audit finding.

**Acceptance**: a disposition table covering all 37 TC IDs with zero unclassified rows; a MISSING
list keyed to SP-2 field names; a reconciled field-case-catalog dated today.

---

### SP-6 — `SUBPLAN_NM1715_BI_06_TC_AUTHORING_QUICK`
**Identity** GIVER · **Model** opus-4-8 · **Thinking** xhi · **Browser** none · ~2 compactions
**Depends on** SP-5 · **CoverageMode** quick

Author the QUICK layer per `/coverage`: FCC **Axis 1** (per-field cases from the
`field-case-generation.md` §2 taxonomy, per field type) + **Axis 2** L1 surface/behavior must-asserts.
Anything deeper carries the `deferred-to-DEEP` token (legal only under `quick`, per LR-072) and is
recorded in the NM-1715 deferred-to-deep ledger (planned internal artifact created by
this SP; one row per deferred item: TC ID, field, reason, PLAN B as recipient). **LR-072 G3**: the
`deferred-to-DEEP` token lives only in internal artifacts and plan bodies — it MUST NOT appear in
`locations_left_panel_basic_information_test_cases.md` (the deliverable-source MD whose token-free
state is enforced by `scripts/xlsx-lint-rules.mjs`). Deferred items are recorded only in the ledger
and referenced from plan bodies.

Update `locations_left_panel_basic_information_test_cases.md` and the matching test plan with QUICK
TCs only (no deferral tokens). Every TC cites its requirement source (SP-1 Jira key) or its walk
evidence (SP-4). LR-068: an asserted record's fields are all covered or all explained.

**Acceptance**: `npm run check:tc-parity` exit 0; every SP-5 FIX and MISSING item is resolved or
recorded in the deferral ledger; no TC without a cited source; deferral ledger exists and names PLAN B
as recipient for every deferred item.

---

### SP-7 — `SUBPLAN_NM1715_BI_07_IMPLEMENTATION_QUICK`
**Identity** BUILDER · **Model** sonnet-4-6 · **Thinking** max · **Browser** cli · ~2 compactions
**Depends on** SP-6

Implement in `location-left-panel-basic-information.spec.ts`, its page object, selectors and test
data. Run green ×2. Rebuild the XLSX deliverable (`npm run xlsx:build`).

**LR-060 obligation 4 is binding**: run `npm run check:spec-quality` on the **working tree** and see
it pass *before* any "done / green / verified" claim. The commit-time gates do not cover uncommitted
work. Six weak assertions shipped past a "green ×2" claim once already (NM-2264).

**Acceptance**: `npx playwright test --list` resolves every new TC ID; two consecutive green runs;
`npm run check:spec-quality` exit 0 on the working tree; `npm run check:tc-parity` exit 0;
`npm run typecheck` clean.

---

### SP-8 — `SUBPLAN_NM1715_BI_08_BUG_HUNT`
**Identity** WATCHDOG · **Model** opus-4-8 · **Thinking** max · **Browser** cli · ~1–2 compactions
**Depends on** SP-7 · **Skills** `/find-bugs`
**Justification**: adversarial hypothesis work; Sonnet is HALT-blocked from RCA/hypothesis.

Rutvik: *"bug hunt = gold."* Zero bugs have ever been filed against this sub-module — that is a gap,
not a clean bill of health. Runs last, when the tester knows the page cold.

Adversarial SFDPOT pass over everything SP-2/SP-3/SP-4 exposed: boundary values, cross-field
contradiction, save/unsaved-changes edge cases (NM-977 / NM-3358), permission-gated states (NM-980),
cross-tab validation on save (NM-1090), conditional disable + tooltip (NM-1146).

Phase 0.5b is **NON-DELETABLE** here (files bugs → Anti-Assumption Gate 1). Every `BUG-*.json` carries
`baselineComparison` + `baselineEvidence` per LR-034, citing SP-3's baseline. LR-061 / Gate 2: no
"corrupt / atypical / app-wide / regression" claim on fewer than 2 evidence sources.

**Acceptance**: every candidate is either a filed `BUG-*.json` with a minimized repro (LR-044 step 3),
or a recorded not-a-bug with its disposition. **`/find-bugs` finds; it does not fix.**

**SCOPE LOCK (Rutvik, 2026-08-13 — settled, not open):** **Basic Information ONLY.** Do not sweep the
adjacent Locations tabs, however tempting it is while the tester is warm. A bug noticed in a
neighbouring tab is recorded via the Phase 2.5 SPAWN path for a separate session — it is never
pursued, minimized, or filed inside this subplan.

---

## Per-Identity Satisfaction

Dated cells are refreshed to the actual emission date at closure (C6).

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site baseline, requirements doc | planned dated old-site baseline and requirements harvest artifacts (not present yet; produced by SP-1/SP-3) | artifact freshness grep (≤14 days per LR-013) |
| GIVER | test cases, test plan, XLSX, catalog | `clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/locations/locations_left_panel_basic_information_test_plan.md`<br>planned dated field-case catalog (not present yet; produced by SP-5/SP-6) | `npm run check:tc-parity` exit 0 |
| BUILDER | spec, page object, selectors, data | `clients/encore/tests/locations/location-left-panel-basic-information.spec.ts` | `npx playwright test --list` resolves all FCC TC IDs |
| WATCHDOG | TC disposition table, bug hunt summary | planned NM-1715 bug-hunt summary (not present yet; produced by SP-8) | per-mode acceptance; LR-034 schema check |
| HEALER | (none) — no RCA-driven fix is scoped here | `(none)` | — |
| GARDENER | (none) — no refactor is scoped here | `(none)` | — |

---

## Ticket delivery at QUICK depth

NM-1715 is deliverable when SP-1…SP-8 are DONE — the Jira transition happens on Rutvik's explicit
go at QUICK depth. The `clients/encore/specs_planning/_internal/nm1715-deferred-to-deep-ledger.md`
created by SP-6 names `PLAN_NM1715_LOC_BASIC_INFO_ULTRACOVERAGE.md` (pending) as recipient, which
satisfies LR-040(b) by existence. If PLAN B later runs, its SP-13 audits both plans. PLAN B remaining
pending does not block this plan's closure.

---

## Acceptance criteria (LR-040 closure gate)

- [ ] SP-1…SP-8 all `Status: DONE` in `plans/done/`, each with an Execution Summary per LR-027.
- [ ] A dated field inventory exists whose field count is **> 1** and whose Coverage Manifest reports `Coverage_Ratio 100%`.
- [ ] All 37 legacy TC IDs carry a KEEP / FIX / KILL disposition; zero unclassified.
- [ ] Every TC in the module cites either a Jira requirement key or walk evidence.
- [ ] `npm run check:tc-parity` exit 0; `npm run check:spec-quality` exit 0 on the working tree; `npm run typecheck` clean.
- [ ] Two consecutive green suite runs on the module spec.
- [ ] Every deferred-deeper item carries `deferred-to-DEEP` and appears in PLAN B (LR-072).
- [ ] `/regression-guard` before/after shows no silent breakage.
- [ ] Activity-log row per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict emitted per LR-042.

---

## Verification

```bash
# Field denominator is real, not the 1-field artifact this plan replaces
ls -t clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-*.md | head -1

# All 37 legacy TC IDs still resolve or are documented as KILLed
# expect: 37 total — every ID dispositioned survive/correct/KILL; KILLs must cite the SP-5 audit artifact
grep -o "TC-LOC-LP-[0-9]\{3\}" clients/encore/tests/locations/location-left-panel-basic-information.spec.ts | sort -u | wc -l

# Working-tree spec quality — LR-060 obligation 4, must pass BEFORE any green claim
npm run check:spec-quality

# MD <-> spec <-> XLSX parity
npm run check:tc-parity
```

---

## Handoff (post-execution)

Basic Information moves from paper coverage to evidence-backed coverage: a machine-enumerated field
denominator replaces a one-field inventory, a fresh old-site baseline replaces a two-month-old one,
every legacy test case is dispositioned against reality rather than inherited, and the module's
requirements are written down locally with Jira keys attached for the first time.
`PLAN_NM1715_LOC_BASIC_INFO_ULTRACOVERAGE.md` inherits the cross-field dependency table from SP-4 and
every `deferred-to-DEEP` token from SP-6.
