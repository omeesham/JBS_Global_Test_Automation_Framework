# PLAN_DISCOUNT_MATRIX_AUTOMATION — automate Location Settings › Discount Matrix, cold intake to L3 depth

**Status**: GATED
**Priority**: P1
**Created**: 2026-07-31
**Identity**: OWNER (CEO — decomposes into worker tickets; adopts HUNTER / GIVER / BUILDER / WATCHDOG at the phase boundaries that write role-owned artifacts)
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**CoverageMode**: quick
**BrowserTool**: cli
**BrowserToolJustification**: n/a
**Skills**: /identity, /relevant, /find-bugs, /rca, /regression-guard, /encore-questions, /final-q

---

## Context

`https://cloudapps-e2e.encoreglobal.com/navigator/locations/<office>/settings/discount-matrix` has
never been intaken. As of 2026-07-31 the repo carries **zero** Discount Matrix assets — no `DSM` code
in `export_test_cases/module-codes.json`, no submodule codes in `export_test_cases/types.ts`
`KNOWN_SUB_CODES`, no `clients/encore/src/pages/discount-matrix/`, no selectors, no
`clients/encore/tests/discount-matrix/`, no `specs_planning/test-cases/setup/discount-matrix/`, no
field inventory, no old-site baseline. (Verified 2026-07-31: `git ls-files | grep -i discount`
returns only Corporate Pricing's Max-Discount cells and their fixtures.)

**This is one plan on purpose.** Claude executes it as CEO and delegates the labour to Copilot
workers per `.claude/skills/ultra-agents/worker-ext.md`; the plan is a *delegation spec*, not a
context container. Splitting it into per-depth subplan files would multiply LR-048 skeletons, closure
gates, Per-Identity matrices and activity rows five-fold for zero execution benefit — the phases below
already close independently.

### Surface as observed 2026-07-31 (screenshot evidence — NOT verified fact)

Office **1604 (Parker Palm Springs)**:

| Zone | Observed controls |
|---|---|
| Header | Title `Discount Matrix` + info icon; left-panel collapse toggle |
| Criteria bar | `Country` dropdown (`United States`, renders greyed) · `Currency` dropdown (`USD`) · `Business Tier` dropdown (**empty**) · `GAV Discount Threshold` text input (empty) · `Save` button (renders greyed) |
| Tab strip | `Company Matrix` (active) · `Region Weekly Peaks` · `Location Activation` |
| Company Matrix toolbar | `Export` button |
| Grid | Grouped headers — a first group occluded by the open Setup menu ending in `… Windows Days`, then `Standard Booking Windows Days`, then `Peak Booking Windows Days`; each carries day buckets `0-15 · 16-30 · 31-60 · 61-90 · 91-180 · 181-365 · 365 +` |
| Grid body | `No data found for selected search criteria` |
| Bottom-right | Partially cut-off element, shape unidentified (paginator candidate) |

**Every row is a screenshot observation, not a fact.** Phase 2's machine walk re-derives all of it,
and that walk's output — not this table — is the denominator everything downstream consumes (LR-062).

The same screenshot's open Setup menu also showed **four further un-intaken surfaces** — `Corporate
PG Pricing Override`, `Discount Optimization Settings`, `Price Guide`, `Service Charge Text`. Out of
this plan's scope; recorded here so the observation is not lost. Each needs its own intake.

---

---

## Scope lock — 2026-08-25 (supersedes "one plan on purpose" for this execution)

This execution covers **CRT · RWP · LOA only**, at **L1 (QUICK)** depth.

**`CMX` (Company Matrix) is OUT OF SCOPE and owned by NM-3343**, which already has work in
flight. Company Matrix artifacts are untouchable in this plan’s execution: no reading, editing,
moving, refactoring or regenerating of CMX specs, page objects, selectors, fixtures, workbook
rows or test IDs — not even formatting or lint fixes. If an in-scope file imports from a CMX
file, the CMX side is left alone and the in-scope side adapts. `CMX` is therefore **not
registered** by Phase 6a here; NM-3343 owns that registration.

L2/L3 depth (Phase 7b/7c) is deferred pending a depth decision after L1 lands. Owner-authorised
2026-08-25.

### Carve-out — 2026-08-25 (NM-3530)

**L1 (QUICK) coverage for CRT / RWP / LOA has moved to `PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK.md`**, which
binds the work to Jira ticket NM-3530 and inherits this plan's completed Phases 0-6a (Jira crossref, old-site
baseline, walk evidence, machine denominators, registry mint) rather than repeating them.

This plan is therefore **GATED** on that plan landing. What remains here:

- **L2/L3 depth** (Phases 7b/7c) for CRT / RWP / LOA - cell round-trips per bucket, pairwise / covering arrays,
  volume, network response-body assertions, exhaustive file-I/O.
- **Module-level closure** (Phase 10) once both depths are covered.
- **CMX**, if and only if NM-3343 ever hands it back. It is not this plan's to take.

Nothing in Phases 6b-10 of this plan is executed while it is GATED. The acceptance criteria below still demand
L1+L2+L3 per family; the L1 half is discharged by the NM-3530 plan, not re-done here.

## Bootstrap

**Identity**: OWNER shell. Adopt `/identity HUNTER` before Phase 2–4 artifacts, `/identity GIVER`
before any test-case / test-plan / catalog write, `/identity BUILDER` before any spec / page-object
write, `/identity WATCHDOG` for Phase 9. Frontmatter declares; the PLAN_IDENTITY_ENFORCEMENT Layer-1
write-gate enforces at write time.

**Context files**:
- `.claude/agents/REQUIREMENTS.md` — **HUNTER HARD STOPS 0–13. Phases 1–4 are HUNTER phases; read all fourteen before the first browser call.**
- `.claude/agents/PLANNER.md` (GIVER) · `.claude/agents/GENERATOR.md` (BUILDER) · `.claude/agents/AUDIT.md` (WATCHDOG)
- `.claude/skills/ultra-agents/worker-ext.md` — what to delegate, what never to, how to write a finishable ticket
- `docs/read_only_docs/CASE_GENERATION_STANDARD.md` — two axes, depth model, TC namespaces, step-table format, linter rules
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — §2 ownership, §4 POM naming, §20 Walk Doctrine v2, ALL-024, ALL-045, ALL-071, ALL-091
- `docs/read_only_docs/LEARNED_RULES.md` · `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (§2 Table 2 — LR-054)
- `clients/encore/CLAUDE.md` — LR-008, LR-012, LR-017, LR-036, LR-ENC-001..005
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` · `field-case-generation.md` (§2, §2.1, §3)
- `.claude/rules/`: `inventory.md` (LR-013, LR-029, LR-057, LR-062, LR-064, LR-065) · `pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-046, LR-048, LR-060) · `browser-tool.md` · `baseline.md` · `angular.md` · `specs.md` · `data.md` · `deliverable.md` · `plan-closure.md` · `guardrail-policy.md`

**Anti-Assumption Gates**:
- [ ] Baseline walk EXECUTED before any behaviour classification or bug filing (Gate 1).
- [ ] No "corrupt / atypical / app-wide / regression" claim on <2 evidence sources (Gate 2 — LR-061-A).
- [ ] No control marked inert / un-drivable without a positive control on a known-good case first (Gate 3 — LR-061-C).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] Un-skip + LR-019 harden applied atomically (Gate 5).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block recorded (Gate 6).

---

## Phase 0 — Gate

1. `Depends on: none`.
2. Read `.claude/context/navigation.md` — Discount Matrix is absent from the Exploration Registry as
   of 2026-07-31; Phase 10 registers it.
3. Read `agent-mistakes.md` (`REQ-*`, `PLN-*`, `BLD-*`, `ALL-*`) and `.claude/context/patterns.md`.
4. LR scan per the Context files list.
5. **Browser-tool announcement**: `BrowserTool=cli` — multi-tab catalog walk, deterministic probe
   batteries, unattended, grep-over-disk on the snapshot YAML. On an Entra redirect, follow
   `.claude/rules/browser-tool.md` Gate 3 (headed `--persistent --profile=.auth\e2e-profile` →
   sign-in → `state-save -s=e2e` → resume) and log the `[BROWSER-SWITCH]` row.
6. **Execution model**: plan-driven (LR-060 / LR-027 closure), NOT the pipeline queue — no
   `agent-queue.json` entry is created and `autoInvoke` does not apply; pipeline identities are
   adopted as skins per phase. (Prevents a strict executor treating HUNTER workflow step 6 —
   queue-entry creation — as an obligation here.)

---

## Phase 1 — Jira-first intake (LR-ENC-004 — before the old-site walk)

1. Rovo-search `encore.atlassian.net` for the module name, the three tab names, `GAV Discount
   Threshold`, `Business Tier`, `Booking Windows`.
2. Write `clients/encore/specs_planning/_internal/jira-defect-crossref-discount-matrix-<DATE>.md`:
   every `NM-####`, its status, its one-line claim.
3. Add `jira_tickets: [NM-####, …]` to the baseline artifact's frontmatter — that key is the
   greppable structural proof this pass ran. Rovo unavailable → record `rovo_available: false` and
   consume any committed prior crossref; never silently skip.
4. Every Jira fact is a **LEAD**. Re-verify against DOM truth (ALL-024) before it enters any
   artifact. A Jira-vs-DOM divergence is signal, classified per REQ-014 (intentional-UX / app-bug /
   stale-ticket) — never an automatic "Jira wins".

---

## Phase 2 — Old-site baseline walk (LR-ENC-001 — observation only, HARD STOP #4 + #10)

1. `https://navigator2.training.psav.com/#/`, office 1604, locate the Discount Matrix counterpart.
2. **Observation only**: no clicks, no typing, no saves on the old site. The HARD STOP #9 carve-out
   permits opening a picker and Cancel/Esc to read an affordance — never Select or Save.
3. Emit `clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-<DATE>.md`.
4. No old-site counterpart → record `baselineScope: baseline-absent`. **Not a HALT** — the artifact is
   still written, stating what was searched and what was found.
5. New site next; classify every divergence as (a) regression-from-baseline, (b) intentional UX change
   citing REQUIREMENTS.md or the Phase-1 crossref, (c) baseline-absent. Emit a `## Baseline diff`
   section.
6. **N≥2 before any generalization** (LR-061-A): a behaviour claim needs two independent sources —
   two offices, or new-site plus baseline. One office is a data point, never a conclusion.

---

## Phase 3 — Machine-enumerated denominator + interaction map (LR-062, HARD STOP #11 + #11b)

1. Run `node scripts/walk-coverage/enumerate-page.mjs` against each tab state and the criteria bar.
   **The live page enumerates itself — do not self-count from the Context screenshot table.**
2. **Walk Doctrine v2 (§20)**: the denominator covers the LANDING state only. Every opener revealed
   during the walk — dialog, menu, popover, tab, edit-mode — spawns its own enumeration and probe
   pass, recursively, until the opener frontier is empty. Un-openable = a named blocker row, not a
   silent gap.
3. Every filter / toggle / sort / pagination / edit / guard / io control needs a **BEFORE/AFTER effect
   delta**. Presence and an options-list are not a walk.
4. `node scripts/walk-coverage/cross-check.mjs` → `CrossCheck: clean`, `Coverage_Ratio` 100%. A
   self-labelled `coverageScope: PARTIAL` is not a stopping point.
5. Emit `scripts/walk-coverage/interaction-maps/discount-matrix-<DATE>.json` (that directory is
   `ARTIFACTS_DIR` at `scripts/check-interaction-coverage.mjs:39`; **it does not exist yet** — create
   it). Classify each control against `scripts/walk-coverage/drone-probes.mjs` `PROBE_DEFINITIONS`
   (`filter`, `sort`, `pagination`, `editable-cell`, `guard`, `io`, `menu-disclosure`, `add-picker`,
   `context-selector`). Expected mapping — confirm, do not assume: criteria controls → `filter`,
   `Save` → `guard`, `Export` → `io`, tab strip → `context-selector`, columns → `sort` if sortable,
   the bottom-right element → `pagination` if that is what it is.
6. A control matching no class is the LR-071.1 residual: add a **class-level** entry to
   `PROBE_DEFINITIONS`, never an instance hack; re-run `node scripts/check-interaction-coverage.mjs
   --self-test`.
7. Drive `node scripts/check-interaction-coverage.mjs --file <map>` to PASS.
8. **Positive control before any inert verdict** (LR-061-C): never record a control as inert or
   un-drivable without proving the same primitive fires on a known-good case — raw-JS `.click()` does
   not reliably fire React `onClick`; `.dragTo()` frequently never fires DnD.
8b. **BeforeUnload trap** (HARD STOP #8 / ALL-052): after any field edit, call dialog-accept **before**
   `goto`, and navigate via the `about:blank → target` pattern. Never reload the same URL — the
   beforeunload prompt swallows the navigation and the next probe reads a stale page.
8c. **Simple tools** (HARD STOP #7): `snapshot` before `eval`; never an `eval` script over 5 lines.
9. **Zero-delta = a data need** (LR-040-D): a probe on a mandatory-effect class returning no delta gets
   `DIFFERENTIAL-DATA-REQUIRED`, firing the ladder by name — Rung 1 SELF-PRODUCE (create the
   other-side state reversibly), Rung 2 SELF-SERVE (hunt an existing other-side entity across **all**
   surfaces and artifacts, not just this control's own API), Rung 3 ESCALATE (legal only with 1 and 2
   evidenced). Until ground truth disambiguates, **no case may assert the zero-effect as expected
   behaviour.**

---

## Phase 4 — Manual-QA bug harvest (HARD STOP #11b + #13 / ALL-045 — the walk's second first-class product)

**A walk is a manual QA run.** It is the only pass where a tester looks at the product before
automation code is written around its current behaviour. A walk that produced only a denominator has
delivered half its output, and automating first bakes today's defects in as tomorrow's expected
behaviour.

1. Run `/find-bugs` across all three tabs, every opener, and the criteria bar. Adversarial probing:
   boundaries, invalid input, empty submit, rapid double-click on `Save` and `Export`, save/cancel
   races, tab-switch while dirty, navigate-away while dirty, browser-back after save, criteria changed
   mid-load, `Export` on an empty grid, session expiry mid-edit.
2. Record a `## Observations` section in the walk-evidence artifact **before handoff**, with both
   buckets, per ALL-045:
   - **Bugs/Defects** (HIGH) — any UI/UX/layout/rendering/behaviour/accessibility defect noticed, even
     with no failing test and no documented requirement → `BUG-CANDIDATE`, then filed per LR-034.
   - **Suggestions/Improvements** (LOW) — enhancement ideas and ambiguous discussion-items.
   - Nothing to report = the literal `none` under each bucket. **An absent section is an incomplete
     walk.**
3. A render-state defect must be **SEEN** — Chrome, element screenshot, or `boundingBox` geometry.
   Never inferred from `aria-invalid` alone (false-green, WCAG ARIA21).
4. Triage before filing: regression-from-baseline → file `BUG-DSM-<SUB>-NNN` under
   `clients/encore/reports/bugs/` with `baselineComparison` + `baselineEvidence` (LR-034) and a
   numbered `stepsToReproduce`; baseline-absent → `/encore-questions`, do not file; by-design →
   documented with its citation; empty-everywhere + no-UI-path + no-Jira → **discussion-item**, flagged
   loudly by name, no bug filed.
5. **Close the loop**: every confirmed walk-found bug's repro edge-case becomes a **required TC** in
   Phase 6, authored as a failing bug-evidence case — never a silent skip, never a case rewritten to
   assert the buggy behaviour as correct. Any skip citing one of these bugs names the bug ID.
6. **Zero suspicions on a non-trivial surface is a bare-minimum-pass signal to interrogate, not a
   clean bill.**
7. Artifact: `clients/encore/specs_planning/_internal/walk-evidence-discount-matrix-<DATE>.md`, with
   dated screenshots beside it.
8. Bugs are filed and evidenced here, not fixed here.

---

## Phase 5 — Empty-surface investigation (HARD STOP #12 / LR-040(c))

The screenshot shows `No data found for selected search criteria` on 1604. Record all three in the
field inventory, per empty surface (repeat for `Region Weekly Peaks` and `Location Activation`):

- **c.1 population path** — the concrete enabler. Test in order: select a `Business Tier` value; vary
  `Country` / `Currency`; re-check office **1101** ("Corporate Office", LR-ENC-005) which carries whole
  feature areas 1604 lacks; re-check **1605** which holds the currency/pricing variety; look for a
  create/import affordance on the surface. "Empty on 1604" is a data-state observation, never a
  population path.
- **c.2 classification** — exactly one of `data-blocked`, `feature-blocked`, `by-design`. An
  unclassified "empty" is not a disposition.
- **c.3 escalate-if-unknown** — still unknown after a real dig (LR-057 affordance probe + Jira per
  LR-ENC-004 + a second office) → `/encore-questions`. Never close on "empty / refresh later".

---

## Phase 6 — Field inventory + ID registry (the artifacts everything downstream consumes)

### 6a — Registry mint (required before any TC ID can pass `check-tc-parity` G6a/G6c)

1. `export_test_cases/module-codes.json` — add to `modules`:
   `"DSM": { "name": "discount-matrix", "display": "Discount Matrix", "dir": "discount-matrix" }`
2. Add a `DSM` submodule block. **Proposed** — reconcile against the tab names Phase 3 observed; the
   walk wins:

   | Code | name | display | sheet (≤31 chars) | mdBasename |
   |---|---|---|---|---|
   | `CRT` | `criteria` | Search Criteria | `discount_matrix_criteria` | `discount_matrix_criteria_test_cases` |
   | ~~`CMX`~~ | ~~`company_matrix`~~ | Company Matrix — **OUT OF SCOPE, owned by NM-3343; do not register here** | — | — |
   | `RWP` | `region_weekly_peaks` | Region Weekly Peaks | `discount_matrix_region_peaks` | `discount_matrix_region_weekly_peaks_test_cases` |
   | `LOA` | `location_activation` | Location Activation | `discount_matrix_loc_activation` | `discount_matrix_location_activation_test_cases` |

   Sheet names are shortened deliberately — the literal tab names exceed Excel's 31-char cap. Add a
   `sheetNameNotes` entry per shortened name, matching the `locations_shared_setup_location` precedent.

   **Tab-divergence rule**: if the Phase-3 walk's tab set differs from this table — a tab missing on
   this office, renamed, or extra — reconcile the code table to the walk BEFORE registering anything.
   Registering a code for a surface the walk did not find is forbidden.
3. `export_test_cases/types.ts` — append `'CRT'`, `'RWP'`, `'LOA'` to `KNOWN_SUB_CODES` under
   (`'CMX'` deliberately omitted — NM-3343 owns it per the Scope lock)
   a `// discount-matrix (DSM)` comment (file grouping style at `:162–197`).
4. Create `clients/encore/specs_planning/test-cases/setup/discount-matrix/` and
   `.../test-plans/setup/discount-matrix/`.
5. `npm run check:tc-parity` exits 0 — green with zero `DSM` TCs proves the edit is well-formed, not
   merely present.

### 6b — Field inventory

`clients/encore/specs_planning/_internal/field-inventories/discount-matrix-<DATE>.md`, per
`field-inventory-spec.md`:

1. Frontmatter: `jira_tickets:`, `baselineScope:`, `Coverage_Ratio`, `CrossCheck`.
2. One row per machine-enumerated element, every one dispositioned, no blanks.
3. Per field: its `field-case-generation.md` §2 type and exact case-set, **including the §2.1
   rejection-affordance oracle on every Negative and BVA case**.
4. Per grid/list/result surface: a `behavior-cases:<families>` disposition naming the applicable §3
   families, or `out-of-scope:<family>=<reason ≥20 chars>` (LR-065). Neither = an undispositioned
   surface = closure-gate Cx FAIL.
5. **`affordance:` token per row** (LR-057): a disabled / read-only / static classification is not
   "covered" until field, label, and container are click-probed. A baseline interactive→static
   divergence may never close as intentional-UX without a new-site click-probe. Shared dialogs are
   covered **per launcher** (LR-012).
6. Every observation row carries machine evidence with provenance — an `evidence:` pointer to the
   machine-emitted artifact (snapshot YAML / walk log) dated ≥ the session date. A
   `provenance: oracle` row, a missing-provenance row, or a stale-evidence row is
   **FABRICATION-class**: it fails the whole plan closure and writes an integrity strike to
   `.claude/state/integrity-strikes.jsonl`.
6b. **Boolean render format** (LR-036): before any boolean-column reader helper is written, MCP-verify
   per table which of the three render formats the grid uses (Unicode ✔ / SVG lucide-check /
   empty-cell) — `Location Activation` status cells are the likely candidate. Never author a boolean
   reader on assumption.
7. **Missing-testid report** (LR-029): record every interactive element lacking a `data-testid`, with
   live-DOM verification per element — never from a static grep. Route per
   `feedback_missing_testid_report_policy.md`.

**Delegation shape (LR-064 TDW)**: Opus owns recon, the denominator, the §2/§3 taxonomy assignment,
the per-element verify, and every disposition. Only deterministic input-trials delegate down —
Haiku for simple clicks, Sonnet for cascading or multi-row sequences, Opus-self when both fail or the
probe turns adaptive. **Never disposition from an unverified worker report**; worker facts are usable,
worker diagnoses are not — re-derive every cause.

---

## Phase 7 — Case authoring, L1 → L2 → L3 (GIVER)

TC IDs use the registered bands (`TC-DSM-CRT-NNN`, `-CMX-`, `-RWP-`, `-LOA-`), numbered sequentially.
**Do not mint `TC-DSM-FCC-*`** — the Standard names that namespace at `CASE_GENERATION_STANDARD.md:89`
but `FCC` is not a registered submodule code and `check-tc-parity` G6c rejects it; field cases ride
the ordinary band, matching `corporate_pricing_detail_test_cases.md`.

Surface cases carry `**Surface_Family**: <family> (QUICK|DEEP)` **in the body only**. The marker never
appears on a `## TC-…:` heading (ALL-091) — the heading ships verbatim as the reviewer-facing Title,
and `scripts/xlsx-lint-rules.mjs` hard-blocks the marker, `SBC`, `Surface_Family`, and `FLAG` at
build, commit, and ship.

### 7a — L1 (QUICK)

**Axis 1** — every inventoried field's §2 template set (positive · BVA · negative · save-cycle), each
Negative and BVA case carrying the §2.1 rejection-affordance oracle (the rejection must be *surfaced*,
not merely non-persistent). Expected types, confirmed against the inventory rather than assumed:
`Country` and `Currency` dropdown or **cascading** dropdown; `Business Tier` dropdown; `GAV Discount
Threshold` numeric; matrix cells `editable-cell` **or read-only — if read-only, the case is that they
are read-only**; tabs 2 and 3 per inventory.

**Axis 2** — one L1 must-assert per applicable §3 family: `result-fidelity` (criteria return exactly
the matching rows) · `pagination` (paginator moves, row set changes) · `sorting` (one header flips
order, asserted on values not on an icon) · `combination` (filter and sort compose; Reset clears both)
· `render-state` (numeric/percentage/currency formats; any link-cell navigates) · `empty-vol` (the
exact empty-state string) · `persistence` (edit dirties and enables Save; save survives reload; revert
returns Save to disabled). Inapplicable → `out-of-scope:<family>=<reason ≥20 chars>`.

### 7b — L2 (DEEP: math, persistence, BVA exotica, pairwise)

1. **Cell round-trip** per day bucket (`0-15` … `365 +`) per column group — save, reload, exact
   persistence, no rounding drift.
2. **Bucket-boundary independence** per column group, and **cross-group independence** between
   `Standard` and `Peak` unless the inventory proves a dependency. This is the classic grouped-column
   defect.
3. **Batch save** — several buckets changed, one save, committed as a unit; not first-cell-only, not a
   silent partial.
4. **Save-failure path** — inject failure via route interception; the error surfaces, the form stays
   dirty, retry succeeds.
5. **Numeric BVA exotica** on `GAV Discount Threshold` and every editable cell: min, min−1, max, max+1,
   zero, empty, negative, non-numeric, leading zeros, decimal precision at and beyond scale, thousands
   separators, scientific notation — each with the §2.1 oracle.
6. **Date BVA only if the inventory found date fields** (an effective/activation date on `Location
   Activation` is the candidate): leap-year 29 Feb, year rollover, Start = End, Start > End, ±1 day on
   every boundary. No date field → `out-of-scope:date-bva=<reason ≥20 chars>`. **Do not invent a date
   case to look thorough.**
7. **Pairwise covering array** over `Country` × `Currency` × `Business Tier` × active tab × (populated
   / empty). Every pair of values appears at least once. Record the array in the catalog so it
   regenerates. Cap the count explicitly and **log what the cap dropped** — silent truncation reads as
   full coverage.
8. **Decision table** for `Save` enablement — every row a case or a documented skip.
9. **State-transition model**, every edge mapped: `Clean → Dirty → Saving → Save-OK | Save-Failed`,
   `Dirty → Navigate-Away-Prompt → Stay | Leave`, `Dirty → Tab-Switch → (preserved?)`,
   `Validation-Error → Fix → Dirty`, and `Edit-to-original-value → Save-disabled` (revert ≠ pristine —
   the most-missed edge).

### 7c — L3 (DEEP: I/O, integration, a11y, error-guessing, network, volume)

1. **Export round-trip** — real `waitForEvent('download')` capture; filename pattern, non-empty, opens
   as the format claimed; **parsed content asserted against the on-screen grid** (an export that
   downloads fine but exports the wrong data is the defect this catches); export reflects criteria
   changes; export on an empty grid asserted against a baseline or Jira oracle, or routed to
   `/encore-questions` — never blessed from observation alone.
2. **Import** only if the inventory found an import affordance: real fixture through to success, plus a
   malformed fixture through to a surfaced validation error. Fixtures at
   `clients/encore/src/data/discount-matrix/fixtures/`. No affordance →
   `out-of-scope:file-upload=<reason ≥20 chars>`.
3. **Integration / cross-field** — consume the inventory's dependency map and cover **every**
   `depends-on` edge, no cherry-picking. Likely edges to confirm: `Country` → `Currency` cascade;
   `Currency` / `Business Tier` → grid content; `GAV Discount Threshold` → whether it constrains or is
   independent of cell values; tab switch → criteria persistence and dirty-state survival. A
   cross-module edge to a sibling Setup surface is covered **only** if the inventory or Jira proves one
   exists.
4. **Error-guessing** (`/find-bugs`, second adversarial pass now that specs exist) — double-click
   races, concurrent edits across two tabs of the same office, save-failure retry, dropdown-load
   failure recovery, criteria changed mid-flight, session expiry mid-edit, browser-back after save.
5. **Full accessibility audit**, per surface and per dialog — logical tab order; focus trap in modals
   with focus restored to the invoker on close; every input label-associated (`for`/`id` or
   `aria-labelledby`); every validation error programmatically associated and announced
   (`aria-describedby` / `role="alert"`); no hover-only actions; visible focus indicator; correct ARIA
   state on the tab strip, sortable headers, and paginator. **`platform` stays a deferred family — do
   not smuggle cross-browser / responsive / dark-mode in under the a11y banner.**
6. **Tier-2 network payload** — per save path, capture request and response with `playwright-cli
   network` and assert the **response body reflects the committed payload**. Tier-3 database
   verification is outside framework scope; do not claim it.
7. **Volume / virtualization** — drive to the largest row count SELF-PRODUCE or SELF-SERVE can reach;
   off-screen rows reachable by content anchor not index; sort and filter correct at volume; last page
   correct; no dupes or drops across page boundaries. If the reachable volume was too small to stress
   virtualization, **state the row count reached** — never report it as a pass.

### 7d — Data discipline

SELF-PRODUCE → SELF-SERVE → escalate. Produce a needed state reversibly and restore it, or find an
existing entity on 1101 / 1605 per LR-ENC-005. No "no data" skip without both rungs evidenced (§20.4).

---

## Phase 8 — BUILDER artifacts

1. **Selectors** `clients/encore/src/selectors/discount-matrix/` — one file per tab plus `shared.ts`
   for the criteria bar, following the `selectors/locations/` layout.
2. **Page objects** `clients/encore/src/pages/discount-matrix/` extending `base.page.ts`, with
   per-method `@step` annotations — the step Proxy was removed in `48d5933f`; do not reintroduce it.
3. **Reuse mandate** — reuse existing grid pagination / sort / row-count / content-anchored helpers.
   A missing helper is added **to the page object**, never as a new runner or standalone script.
4. **Specs** `clients/encore/tests/discount-matrix/`, one per submodule, with the field-case describe
   and an `SBC — discount-matrix` describe at the top.
5. **Save dialog** — LR-012 says Location Settings save dialogs are shared **unless MCP-proven
   otherwise**; prove it here. If the dialog is `<div role="alertdialog">` with unnamed buttons, the
   base `getByRole` confirm helper silently no-ops — target
   `[role="alertdialog"] button:text-is("Save")` (the Override precedent, `navigation.md:34`).
6. No `networkidle`. No `page.waitForTimeout`. Downloads via `waitForEvent('download')`, never a
   filesystem wait.
7. Every mutating case restores state — re-runs are idempotent.
8. `npx playwright test --list` resolves every authored TC ID.

**Render-fail rule (binding on Phases 7–9)**: a failing surface assertion — a link-cell that does not
navigate, a wrong boolean or badge — triggers **RCA, then classification**: regression-from-baseline →
`BUG-DSM-<SUB>-NNN` with `baselineComparison` (LR-034); baseline-absent → `/encore-questions`;
by-design → documented skip with the reason. Never blind auto-file, never a silent skip.

---

## Phase 9 — WATCHDOG audit

1. FCC completeness — every inventory field has its §2 set; every Negative/BVA carries the §2.1 oracle.
2. Surface completeness — every applicable §3 family has L1, L2, and L3 coverage or an explicit
   `out-of-scope:` at each level. Anything still open is a HALT-and-ask, not a further deferral.
3. Bug-loop closure — every `BUG-DSM-*` from Phase 4 has its TC; every skip names its bug ID.
4. Covering-array pair-coverage verified **mechanically**, and the cap's dropped count logged.
5. Dependency-edge count stated; a11y criteria checked per surface and per dialog; network assertions
   check the **response body**, not the status code; the volume case states its row count.
6. `npm run check:spec-quality` on the **working tree** before any done / green / verified claim
   (LR-060 obligation 4 — commit-time gates do not cover uncommitted work).
7. Suite green ×2 consecutively.

---

## Phase 10 — Registration, sweep, closure

1. `.claude/context/navigation.md` §C Exploration Registry row → field inventory, baseline,
   walk-evidence, interaction map.
2. `clients/encore/docs/MODULE_REGISTRY.md` + `REQUIREMENTS.md` updated for the new module's
   behaviours.
3. **Adjacent-Sweep ritual** — each adjacent fix noticed gets exactly one of DO-NOW / SPAWN / APPEND
   with a grep-verified line item. Bare "out of scope" with no recipient = HALT and ask.
4. LR-028 activity-log row with an LR-037 timestamp ≥ every touched-file mtime.
5. LR-027 Execution Summary, then `git mv` to `plans/done/` and `npm run plans:reindex`.

---

## Per-Identity Satisfaction

> **Closure instruction**: at DONE-flip, replace every `<DATE>` placeholder below with the real dated
> filenames — closure check C6 greps the literal cell paths, and a placeholder cell DENIES the flip.
> The acceptance commands are per-identity quick checks; the suite-green ×2 acceptance criterion
> still binds BUILDER beyond its `--list` cell.

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | Jira crossref · old-site baseline · walk evidence | `clients/encore/specs_planning/_internal/jira-defect-crossref-discount-matrix-<DATE>.md`<br>`clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-<DATE>.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-discount-matrix-<DATE>.md` | `ls clients/encore/specs_planning/_internal/walk-evidence-discount-matrix-<DATE>.md` |
| GIVER | field inventory · field-case catalog · test-case MD · test plan · XLSX workbook | `clients/encore/specs_planning/_internal/field-inventories/discount-matrix-<DATE>.md`<br>`clients/encore/specs_planning/_internal/field-case-catalogs/discount-matrix-<DATE>.md`<br>`clients/encore/specs_planning/test-cases/setup/discount-matrix/`<br>`clients/encore/specs_planning/test-plans/setup/discount-matrix/`<br>`clients/encore/testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` |
| BUILDER | selectors · page objects · fixtures · specs | `clients/encore/src/selectors/discount-matrix/`<br>`clients/encore/src/pages/discount-matrix/`<br>`clients/encore/src/data/discount-matrix/`<br>`clients/encore/tests/discount-matrix/` | `npx playwright test --list` |
| HEALER | (none) — no pre-existing failing specs on this module | (none) | (none) |
| WATCHDOG | completeness + bug-loop-closure findings | `clients/encore/specs_planning/_internal/audit-discount-matrix-<DATE>.md` | `npm run check:spec-quality` |
| GARDENER | (none) | (none) | (none) |
| OWNER | ID registry · navigation registry · module registry · interaction map | `export_test_cases/module-codes.json`<br>`export_test_cases/types.ts`<br>`.claude/context/navigation.md`<br>`scripts/walk-coverage/interaction-maps/discount-matrix-<DATE>.json` | `npm run check:tc-parity` && `node scripts/check-interaction-coverage.mjs --file scripts/walk-coverage/interaction-maps/discount-matrix-<DATE>.json` |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Jira crossref exists; the baseline artifact carries `jira_tickets:` (or `rovo_available: false`).
- [ ] Old-site baseline artifact exists with a `## Baseline diff` section or an explicit
      `baselineScope: baseline-absent`.
- [ ] Coverage manifest machine-enumerated, every union element dispositioned, `CrossCheck: clean`,
      `Coverage_Ratio` 100%, opener frontier empty (LR-062 / §20 / Cx).
- [ ] Interaction map PASSES `check-interaction-coverage`, with no `unclassified-element` and no
      `claim-census` residual outstanding.
- [ ] Walk-evidence artifact carries a `## Observations` section with **both** buckets filled or the
      literal `none` (ALL-045). An absent section fails this plan.
- [ ] Every walk-found bug is triaged, filed per LR-034 with `baselineComparison` + numbered
      `stepsToReproduce`, and has a corresponding TC; every skip names its bug ID.
- [ ] Every empty surface carries c.1 / c.2 / c.3 (LR-040(c)).
- [ ] Every zero-delta probe on a mandatory-effect class carries `DIFFERENTIAL-DATA-REQUIRED` with
      rung-1 and rung-2 evidence (LR-040-D); no case asserts a zero-effect as expected behaviour.
- [ ] Every row carries an `affordance:` token; no inert verdict without a positive control.
- [ ] Missing-testid findings recorded with live-DOM verification per element (LR-029).
- [ ] `DSM` + its four submodule codes registered in both `module-codes.json` and `KNOWN_SUB_CODES`.
- [ ] Every applicable §3 family carries L1 + L2 + L3 coverage or `out-of-scope:<family>=<reason ≥20
      chars>` at each level.
- [ ] Date BVA covered or explicitly `out-of-scope:date-bva=<reason>` — never faked.
- [ ] Covering array recorded, pair-coverage machine-verified, cap's dropped count logged.
- [ ] Export asserted on parsed **content**, not on a click that raised no error.
- [ ] Every save path has a Tier-2 response-body assertion; no Tier-3 database claim anywhere.
- [ ] Volume case states the row count actually reached.
- [ ] No `(QUICK)`/`(DEEP)` marker on any `## TC-…:` heading (ALL-091).
- [ ] `npm run check:tc-parity`, `lint:testcases`, `xlsx:lint`, `typecheck` all exit 0.
- [ ] `npm run check:spec-quality` passes on the working tree before any done/green/verified claim.
- [ ] Suite green ×2 consecutively; every mutating case restores state.
- [ ] `/regression-guard` before/after = no silent breakage.
- [ ] LR-028 activity-log row with an LR-037 timestamp ≥ every touched-file mtime.
- [ ] `/final-q` verdict block emitted per LR-042.

---

## Verification

```bash
npm run check:tc-parity && npm run lint:testcases && npm run xlsx:lint && npm run typecheck
```

```bash
node scripts/check-interaction-coverage.mjs --self-test
```

```bash
npx playwright test clients/encore/tests/discount-matrix --retries=0
```

---

## Handoff (post-execution)

The Discount Matrix module is covered end to end: a registered ID grammar, a machine-enumerated
denominator at 100% with an empty opener frontier, a baseline verdict, a manual-QA bug harvest whose
findings each carry a regression-armour TC, and field plus surface coverage at L1, L2 and L3 with an
honest out-of-scope record wherever a family does not apply. The module joins the standing regression
suite and its registry row lands in the Exploration Registry for the next session.
