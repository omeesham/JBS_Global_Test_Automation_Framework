> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute SUBPLAN_DISCOUNT_MATRIX_REGION_WEEKLY_PEAKS.md`. All context below.**
>
> 1. **Identity**: OWNER shell (CEO). Adopt `/identity HUNTER` before Phase 0.5b–6 artifacts, `/identity GIVER` before any test-case / test-plan / catalog write, `/identity BUILDER` before any spec / page-object / selector write, `/identity WATCHDOG` for Phase 9.
> 2. **Skills**: load every skill in the Skills field. **`/delegation-temp` is not optional here** — invoke it at Phase 0 and emit its Activation Block.
> 3. **Read the parent first**: `plans/pending/PLAN_DISCOUNT_MATRIX_AUTOMATION.md` — its `## Context`, `## Shared Foundation`, and `## Delegation doctrine` are load-bearing and are NOT duplicated here in full.
> 4. **Dependency gate**: NM-3342 closed. HALT if not.
> 5. **Context load**: read every file in the Bootstrap Context list before the first browser call.
> 5.5. **Browser tool**: `cli`. Workers drive `playwright-cli` via shell. On an Entra redirect follow `.claude/rules/browser-tool.md` Gate 3 and log the `[BROWSER-SWITCH]` row.
> 6. **Phase 0 FIRST**, then phases in order.
> 7. **Handoff**: flip Status to DONE, add Executed date, annotate the parent's `## Child index` row, append the LR-028 activity row, `git mv` to `plans/done/`, `npm run plans:reindex`, emit the Receipt.
>
> **HALT + ASK** if: NM-3342 is open · two workers' `## ASSUMPTIONS-MADE` conflict · a strict line cannot be met · LR-040 closure-completeness fails on any planned item.

---

# SUBPLAN_DISCOUNT_MATRIX_REGION_WEEKLY_PEAKS — Region Weekly Peaks tab, QUICK coverage, delegated

**Status**: PENDING
**Priority**: P1
**Created**: 2026-08-18
**Identity**: OWNER (CEO — decomposes into worker tickets; adopts HUNTER / GIVER / BUILDER / WATCHDOG at the phase boundaries that write role-owned artifacts)
**Parent**: PLAN_DISCOUNT_MATRIX_AUTOMATION.md
**Depends on**: NM-3342 (Discount Optimization) fully closed
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a
**CoverageMode**: quick
**Delegation**: /delegation-temp — DEFAULT-DELEGATE active; ledger in `## Delegation ledger`
**Skills**: /identity, /relevant, /coverage, /delegation-temp, /find-bugs, /rca, /regression-guard, /encore-questions, /final-q
**Jira**: NM-3343 · NM-2220 (Region Weekly Peaks delivery spec) · NM-2452 (import) · NM-1668 (parent MFE story)

---

## Context

Region Weekly Peaks is the middle-sized Discount Matrix tab: a **Year** dropdown, a **Region** dropdown,
an **Add Year** launcher, and a per-week grid whose rows carry a Peak / Standard / Non-Peak selection.
It owns **8 of the 22** rows in the parent's regression bank, clustered on two themes — dirty-state and
cancel behaviour, and result-fidelity between what the grid shows, what the footer counts, and what the
export contains.

**This subplan is independently runnable and independently closeable.** It does not require its two
siblings. If it runs first it also founds the shared registry + `CRT` header band per the parent's
`## Shared Foundation`; if a sibling already did, it consumes that with a spot-check.

### This tab's regression bank (8 rows — every one re-verified live in Phase 4)

| Ticket | Status @ authoring | Claim |
|---|---|---|
| NM-3485 | Done | Cancel reverts previously-**SAVED** values and leaves Save enabled |
| NM-3238 | Done | Peak/Standard/Non-Peak checkbox could not be un-checked once selected |
| NM-3234 | Code Review | "Add Year" enabled before Year/Region are chosen |
| NM-3435 | Done (Blocker) | Duplicate Region names render; deleting a duplicate errors "Tier range overlaps with an existing tier" |
| NM-3475 / NM-3275 | Done / Rejected | Export contains a region absent from the Region dropdown; re-importing the untouched export fails validation |
| NM-3230 | Rejected | Footer record count does not match the visible week rows |
| NM-3062 | Done | Export returned HTTP 500 |
| NM-3074 | QA | Region Peak import / Add-Year are slow |

Two rows need care rather than a reflex TC:

- **NM-3230 is `Rejected`** — a rejected ticket is not automatically wrong. Re-verify it live; if the
  footer count still disagrees with the visible week rows, that is a `count-source` disagreement and the
  Cross-Check Kernel has an oracle for exactly this class. A live recurrence on a Rejected ticket is a
  **discussion-item plus an `/encore-questions` entry**, not a silent skip and not an auto-file.
- **NM-3074 is a performance observation**, not a behaviour defect. It does not become a timing
  assertion (no `waitForTimeout`, no flaky duration threshold). It DOES set the walk's expectations:
  size the Add-Year and import worker tickets with generous `--timeout`, because a slow surface kills
  under-budgeted workers.

If this subplan founds the shared foundation it additionally owns the `CRT` rows NM-3235, NM-3440,
NM-3441 and NM-3256 (see the parent's `## Shared Foundation`).

### This tab's header dependency (hypothesis — Phase 3 confirms or corrects it)

Per NM-2220 AC #1, the **Year and Region dropdowns populate when the tab activates for the current
`countryId`** — so `Country` is the confirmed driver. **`Currency` and `Business Tier` are unverified for
this tab and must be probed**: if changing them does nothing here while they re-drive Company Matrix,
that asymmetry is exactly what the owner's header×submodule requirement exists to catch, and it must be
proven rather than assumed either way. A control whose effect cannot be resolved becomes an
`/encore-questions` item, never a guessed case.

### Traps

All three parent traps apply. Their weight differs here:

- **Trap 1 (UI↔DB off-by-one)** — this tab has no percentage matrix, but it does carry Peak / Standard /
  Non-Peak naming, and the persisted vocabulary is `NonPeakPercent*` / `PeakPercent*` /
  `SuperPeakPercent*`. **The same off-by-one risk applies to the peak-type control's persisted value.**
  Capture the save payload and let Claude rule on the mapping. If the sibling Company Matrix subplan
  already recorded the verdict in the parent, consume it — do not re-litigate.
- **Trap 2 (enumerator blindness)** — lower risk here (no 21-column percentage archetype), but the
  weekly grid still collapses into row archetypes. Run the same branch check and the same non-zero
  match-count gate.
- **Trap 3 (Jira self-contradiction)** — NM-3475 `Done` versus NM-3275 `Rejected` on the same
  export/import symptom is a third contradiction on top of the parent's two. Settle it by observation.

---

## Bootstrap

**Identity**: OWNER shell (CEO). Adopt `/identity HUNTER` before Phase 0.5b–6 artifacts, `/identity GIVER`
before any test-case / test-plan / catalog write, `/identity BUILDER` before any spec / page-object write,
`/identity WATCHDOG` for Phase 9.

**Context files**:
- `plans/pending/PLAN_DISCOUNT_MATRIX_AUTOMATION.md` — **the parent. Read `## Context`, `## Shared Foundation`, `## Delegation doctrine` in full.**
- `.claude/skills/delegation-temp/SKILL.md` · `.claude/skills/ultra-agents/worker-ext.md` · `~/.claude/delegation/ticket-template.md`
- `.claude/agents/REQUIREMENTS.md` — **HUNTER HARD STOPS.** Phases 0.5b–6 are HUNTER phases.
- `.claude/agents/PLANNER.md` (GIVER) · `.claude/agents/GENERATOR.md` (BUILDER) · `.claude/agents/AUDIT.md` (WATCHDOG)
- `.claude/skills/coverage/SKILL.md` — the QUICK contract (Axis 1 floor, Axis 2 L1, TDW-Q, §20-Q)
- `docs/read_only_docs/CASE_GENERATION_STANDARD.md` · `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2, §4, §20, ALL-024, ALL-045, ALL-071, ALL-091) · `docs/read_only_docs/LEARNED_RULES.md` · `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (§2 Table 2 — LR-054)
- `clients/encore/CLAUDE.md` — **LR-036 is load-bearing on this tab** (per-table boolean render format), plus LR-008, LR-012, LR-017, LR-ENC-001 through LR-ENC-006
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` · `field-case-generation.md` (§2, §2.1, §3)
- `clients/encore/specs_planning/_internal/agent-mistakes.md`
- The Jira reference doc named in the parent, with its branch caveat.
- `.claude/rules/`: `inventory.md` (LR-013, LR-029, LR-057, LR-062, LR-064, LR-065, LR-072) · `pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-046, LR-048, LR-060) · `guardrail-policy.md` (LR-074) · `browser-tool.md` · `baseline.md` · **`angular.md` (LR-009 / LR-026 — the dirty-state rules NM-3485 sits on)** · `specs.md` · `data.md` · `deliverable.md` (LR-058, LR-073) · `plan-closure.md` · `no-wrappers.md`

**Anti-Assumption Gates**: identical to the parent's set —
- [ ] Baseline walk EXECUTED before any behaviour classification or bug filing (Gate 1).
- [ ] No generalization on fewer than 2 evidence sources (Gate 2 — LR-061-A).
- [ ] No inert verdict without a positive control (Gate 3 — LR-061-C).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block (Gate 5).
- [ ] Every DEEP deferral named in the parent's `## Deferred to DEEP` (Gate 6, LR-072).
- [ ] **No disposition written from an unverified worker report (Gate 7 — LR-062 condition 5 + LR-064 Stage 3).**

---

## Phase 0 — Gate + delegation activation

1. **Dependency**: NM-3342 closed. **Still PENDING as of 2026-08-18 with 16 unticked criteria** — HALT
   and ask if it has not moved.
2. Read `.claude/context/navigation.md`, `agent-mistakes.md`, `.claude/context/patterns.md`.
3. **Invoke `/delegation-temp`**; emit the Activation Block. Confirm the agent profiles exist.
4. **Branch check (trap 2)**: `grep -n "inputmode" scripts/walk-coverage/enumerate-page.mjs`. No hit =
   `main` side; port the rule before any walk and record it as a tooling fix, not a coverage step.
5. Browser-tool announcement per the parent's Phase 0 step 5. **Budget note**: NM-3074 reports this
   surface is slow — give every walk/probe dispatch a generous explicit `--timeout` (start at the
   work-type ceiling, not the default) and 2× credits.
6. Tier announcement: `CoverageMode: quick`.

---

## Phase 0.5b — Baseline-first walk (LR-048 conditional: REQUIRED — Skills includes `/find-bugs`)

**Delegated** (ledger D-02). Observation only — HARD STOP #4 + #10.

1. `https://navigator2.training.psav.com/#/`, office 1604. The reference doc names the legacy component
   `region-weekly-peak.component.ts` and the legacy route `/setup/discount-pricing/matrix` — search
   hints, not addresses.
2. **No mutations.** The HARD STOP #9 carve-out permits opening a picker and Cancel/Esc to read an
   affordance — never Select or Save.
3. Artifact: `clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-region-weekly-peaks-<DATE>.md`.
4. No counterpart → `baselineScope: baseline-absent`. **Not a HALT.**
5. Classify every divergence (a) regression-from-baseline, (b) intentional UX change with a citation,
   (c) baseline-absent. Emit `## Baseline diff`. **Classification is CLAUDE-ONLY.**
6. **N of at least 2 before any generalization** (LR-061-A).

---

## Phase 1 — Shared Foundation: claim-or-consume

Run the parent's `## Shared Foundation` gate verbatim. `FOUNDATION-ABSENT` → **FOUNDER** (mint `DSM` + all
four codes, author the `CRT` band; add ~40% to effort and every credit cap). `FOUNDATION-PRESENT` →
**CONSUMER** (LR-013 spot-check 3 random `CRT` fields × 4 checks; any disagreement = `DRIFT_DETECTED` →
refresh first, and say so in the Execution Summary). Verify `npm run check:tc-parity` exit 0.

---

## Phase 2 — Jira bank verification (LR-ENC-004)

1. **Re-fetch the live status of all 8 rows** (+4 `CRT` rows if founding) — **CLAUDE-ONLY**, workers
   cannot reach Claude's Jira MCP. Pay particular attention to NM-3230 (`Rejected`) and NM-3275
   (`Rejected`): a rejected ticket that still reproduces is a discussion-item, not an auto-file.
2. Worker drafts the crossref skeleton (ledger D-01); Claude fills the statuses. Artifact:
   `clients/encore/specs_planning/_internal/jira-defect-crossref-discount-matrix-region-weekly-peaks-<DATE>.md`.
3. Add `jira_tickets: [...]` to the baseline artifact frontmatter. Rovo unavailable → `rovo_available: false`
   and consume the committed reference doc; never silently skip.
4. **Retrieve NM-2220's business-rules attachment** if one exists; unretrievable →
   `businessRulesDoc: unavailable` with the reason.
5. Every Jira fact is a **LEAD** re-verified against DOM (ALL-024); divergence classified per REQ-014.

---

## Phase 3 — Machine denominator + header-effect probes (LR-062, TDW-Q)

1. **Enumerate** (ledger D-03) against this tab in each state that changes the control set: Year/Region
   unselected, Year+Region selected with weeks rendered, grid empty, Add-Year dialog, Import file picker,
   Unsaved-Changes prompt, and the post-Cancel state (NM-3485's habitat). **The live page enumerates
   itself.**
2. **Archetype sanity gate** — the weekly rows collapse into a row archetype. Confirm it resolves to a
   **non-zero live match count** and that the peak-type control resolves to a real type. A 0-match
   archetype is a **tooling defect**, not an empty page — RCA before walking further.
3. **Independent enumeration control** (ledger D-04) — a cross-family worker re-runs one state; Claude
   diffs the counts. This is the CONTROL the findings contract requires.
4. **§20-Q profile**: LANDING state plus openers that host in-scope fields (**Add Year** does — walk it
   fully). Other openers → `deferred-to-DEEP: <opener> (<reason ≥20 chars>)`. Un-openable = a named
   blocker row, never a silent gap.
5. **Count-source probe (NM-3230)** — capture the footer record count AND the visible week-row count in
   the same snapshot. Disagreement is a `count-source` finding for the Cross-Check Kernel, and the
   interaction map records it as such.
6. **Header-effect probes** (ledger D-07) — with this tab active, change each of `Country`, `Currency`,
   `Business Tier`, `GAV Discount Threshold` and capture the BEFORE/AFTER delta. `Country` is expected to
   re-drive the Year and Region lists; **the other three are unverified and a null result must be proven,
   not assumed** — a no-delta outcome gets `DIFFERENTIAL-DATA-REQUIRED`, not a "no effect" case.
   **Claude writes the parent's dependency-matrix update.**
7. `cross-check.mjs` → `CrossCheck: clean`, `Coverage_Ratio` 100%. `coverageScope: PARTIAL` is not a
   stopping point.
8. Emit `scripts/walk-coverage/interaction-maps/discount-matrix-region-weekly-peaks-<DATE>.json` —
   `ARTIFACTS_DIR` at `scripts/check-interaction-coverage.mjs:39`; read the sibling
   `discount-optimization-2026-08-11.json` first as the shape reference. Classify against the nine
   `PROBE_DEFINITIONS` control classes (`filter`, `sort`, `pagination`, `editable-cell`, `guard`, `io`,
   `menu-disclosure`, `add-picker`, `context-selector`; the other three keys are Kernel oracles, not
   control classes). Expected mapping — **confirm, do not assume**: `Year` / `Region` → `filter`;
   `Add Year` → `add-picker` (and its pre-selection enablement is the NM-3234 `guard` question);
   peak-type control → `editable-cell`; tab `Save` / `Cancel` → `guard`; `Export`/`Import` → `io`; the
   footer counter → `count-source` cross-check, not a control class.
9. Unclassifiable control → LR-071.1: add a **class-level** `PROBE_DEFINITIONS` entry, never an instance
   hack; re-run `node scripts/check-interaction-coverage.mjs --self-test`.
10. Drive `node scripts/check-interaction-coverage.mjs --file <map>` to PASS.
11. **Positive control before any inert verdict** (LR-061-C) — raw-JS `.click()` does not reliably fire
    React `onClick`. This matters directly for NM-3238 (a checkbox that would not un-check): **prove the
    un-check primitive fires on a known-good control before recording the checkbox as stuck.**
12. **BeforeUnload trap** (HARD STOP #8 / ALL-052) — dialog-accept before `goto`, navigate
    `about:blank → target`, never reload the same URL.
13. **Zero-delta = a data need** (LR-040-D) — `DIFFERENTIAL-DATA-REQUIRED` firing Rung 1 SELF-PRODUCE →
    Rung 2 SELF-SERVE → Rung 3 ESCALATE by name. **No case asserts a zero-effect as expected behaviour**
    until ground truth disambiguates. This is the live rule for the Currency / Business Tier probes.

---

## Phase 4 — Manual-QA bug harvest (ALL-045)

**Quick-mode decoupling**: no forced SFDPOT sweep; the 8-row bank is the targeted substitute; the pattern
sweep fires on **CRITICAL/HIGH** finds only.

1. **Walk the bank deliberately** (ledger D-05, D-06):
   - **Dirty-state cluster** — save a week's peak values, then Cancel; assert whether previously-SAVED
     values revert and whether Save stays enabled (NM-3485). Then navigate away with unsaved edits and
     exercise Cancel / Discard / Save on the prompt. **LR-009 / LR-026 say Angular gets revert-to-pristine
     wrong; a revert is not the same as pristine.**
   - **Peak-type control** — select each of Peak / Standard / Non-Peak; assert mutual exclusivity; then
     **un-check** (NM-3238), with the positive control from Phase 3 step 11 already established.
   - **Add Year guard** — assert enablement before Year/Region are chosen (NM-3234), then the dialog's
     year and week-start-date fields.
   - **Duplicate regions** — create/observe a duplicate Region name and attempt deletion (NM-3435).
   - **Export/import** — Export response status (NM-3062); whether the export contains a region absent
     from the dropdown (NM-3475); re-import of the untouched export (NM-3275, `Rejected`). Content parity
     beyond "the download fired and was not a 500" is **DEEP** (parent D2) — do not expand into it here.
   - **Footer count** — the NM-3230 disagreement, captured in the same snapshot as the row count.
2. Record `## Observations` in the walk-evidence artifact **before handoff**, both buckets per ALL-045.
   Nothing to report = the literal `none` under each. **An absent section is an incomplete walk.**
3. A render-state defect must be **SEEN** — element screenshot or `boundingBox` geometry, never inferred
   from `aria-invalid`. This tab's peak-type colour coding is a render-state assertion, so look at it.
4. **Do not file DOM/markup accessibility findings as bugs** (owner standing rule). Behaviour only.
5. **Triage is CLAUDE-ONLY**: regression-from-baseline → `BUG-DSM-RWP-NNN` with `baselineComparison` +
   `baselineEvidence` (LR-034) and numbered `stepsToReproduce`; baseline-absent → `/encore-questions`;
   by-design → documented with its citation; empty-everywhere + no-UI-path + no-Jira → discussion-item.
   **A `Rejected` ticket that still reproduces is a discussion-item plus an `/encore-questions` entry** —
   neither an auto-file nor a silent skip.
6. **A `Done` ticket that still reproduces is a reopened regression, not a duplicate.** Five of this
   tab's 8 rows are `Done`.
7. **Close the loop**: every confirmed bug's repro edge-case becomes a **required TC** in Phase 7 as a
   failing bug-evidence case. Any skip citing one of these bugs names the bug ID.
8. Artifact: `clients/encore/specs_planning/_internal/walk-evidence-discount-matrix-region-weekly-peaks-<DATE>.md`
   with dated screenshots beside it.
9. Bugs are filed and evidenced here, not fixed here.

---

## Phase 5 — Empty-surface and data variety (LR-040(c))

This tab has a natural empty state: **before Year and Region are chosen**. That is `by-design` and must
be classified as such rather than left blank. Separately, a Country with no configured regions is a
different, `data-blocked` empty. Record all three sub-items **per empty surface found**:

- **c.1 population path** — which Country/Year/Region combination yields zero week rows, and the
  empty-state string **verbatim** (that string is the `empty-vol` L1 must-assert). Re-check offices
  **1101** (LR-ENC-005) and **1605**. "Empty on 1604" is a data-state observation, never a population path.
- **c.2 classification** — exactly one of `data-blocked`, `feature-blocked`, `by-design`.
- **c.3 escalate-if-unknown** — unknown after a real dig → `/encore-questions`. Never close on
  "empty / refresh later".

**Data variety for the Header-Effect block**: at least two Countries with different region sets, at least
two Years (one requiring `Add Year`), and one Country/Region combination with zero weeks. **Confirm live
option lists rather than seeding from this paragraph** — LR-015.

---

## Phase 6 — Field inventory (RWP)

`clients/encore/specs_planning/_internal/field-inventories/discount-matrix-region-weekly-peaks-<DATE>.md`:

1. Frontmatter: `jira_tickets:`, `baselineScope:`, `Coverage_Ratio`, `CrossCheck`, **`Walk_Mode: quick`**
   (LR-072 dual-home — Cx FAILS on mismatch with this subplan's `CoverageMode`).
2. One row per machine-enumerated element, every one dispositioned, no blanks. Non-L1 rows get
   `deferred-to-DEEP: <element/launcher id> (<reason ≥20 chars>)` — **G1: no other token beside it.**
3. Per in-scope field: its §2 type and exact case-set, **with the §2.1 rejection-affordance oracle on
   every Negative and BVA case** — proven both **announced** (polled per LR-010) and **escapable** (a
   natural Tab/click-away blur actually leaves the field). Never let a helper auto-`Escape` before
   recording whether a human-style blur worked.
4. `behavior-cases:<families>` on the weekly grid naming applicable §3 families, or
   `out-of-scope:<family>=<reason ≥20 chars>` (LR-065). Neither = undispositioned = Cx FAIL.
5. **`affordance:` token per row** (LR-057) — field, label, and container click-probed. The Add-Year
   launcher is covered **per launcher** (LR-012 / LR-057), not per dialog.
6. Every observation row carries `provenance: live` + a dated `evidence:` pointer. **`provenance: oracle`
   on an observation-claiming row is FABRICATION-class**: it fails the whole closure and writes an
   integrity strike to `.claude/state/integrity-strikes.jsonl`.
7. **Boolean render format — LR-036, load-bearing on this tab.** Before any boolean-reader helper is
   written, MCP-verify which of the three render formats the peak-type control uses (Unicode check / SVG
   `lucide-check` / empty cell). **Verify it independently for this table** even if the sibling Location
   Activation subplan already proved its own toggle — LR-036 exists precisely because two tables in the
   same app differ.
8. **Missing-testid report** (LR-029) — live-DOM verified per element, never a static grep. A missing
   testid never justifies a skip (LR-014): next-best stable locator, run the test, record the gap in
   `clients/encore/specs_planning/_internal/testid-gap-reports/discount-matrix-region-weekly-peaks-<DATE>.md`,
   rolled up to ONE module-level client ask.

**LR-064 TDW quick profile**: Opus owns recon, the denominator, the taxonomy assignment, the per-element
verify, and every disposition. Only deterministic input-trials delegate down. **Stage-3 blind independent
re-drive retained** at `min(3, live-row count)` — ledger D-08. **Never disposition from an unverified
worker report.**

---

## Phase 7 — Case authoring, QUICK tier (GIVER)

TC IDs use `TC-DSM-RWP-NNN`. **Do not mint `TC-DSM-FCC-*`** — `FCC` is not a registered submodule code and
`check-tc-parity` G6c rejects it. Surface cases carry `**Surface_Family**: <family> (QUICK)` **in the body
only** — never on a `## TC-…:` heading (ALL-091); `scripts/xlsx-lint-rules.mjs` hard-blocks the marker at
build, commit and ship.

### 7a — Axis 1: field cases (the quick floor — not reduced)

- `Year` dropdown and `Region` dropdown — option lists, defaults, and the **cascade** from `Country`.
- The per-week **Peak / Standard / Non-Peak** control — mutual exclusivity is a case, and **un-check is a
  case** (NM-3238).
- The **Add Year** dialog's year and week-start-date fields — full §2 set with the §2.1 oracle.

**Required regression cases**: Cancel-after-save (NM-3485), un-check (NM-3238), Add-Year enablement before
Year/Region are chosen (NM-3234), duplicate Region deletion (NM-3435), and Export fires without a 500
(NM-3062). The footer-count disagreement (NM-3230) becomes a TC only if it reproduces; otherwise it is a
recorded discussion-item.

### 7b — Axis 2: L1 surface must-asserts

Applicability is decided by the Phase-3 walk, not this list. Expected:
`result-fidelity` (the selected Country/Year/Region returns exactly the matching week rows — and the
export's region set does not exceed the dropdown's, NM-3475) · `render-state` (peak-type colour coding
renders; Export/Import icons are correct) · `empty-vol` (the Phase-5 verbatim string) ·
`persistence` (an edit dirties the form and enables Save; a save survives reload; **Cancel does not revert
previously-saved values** — NM-3485; revert is not pristine, LR-009 / LR-026) · `pagination` **only if
the walk proves a paginator exists** — the NM-3230 footer counter is a `count-source` cross-check, not by
itself proof of pagination. Families the walk disproves get
`out-of-scope:<family>=<reason ≥20 chars>`. **Do not invent a family to look thorough; do not skip one the
walk found.**

### 7c — Header-Effect block (the owner's requirement)

For each of `Country`, `Currency`, `Business Tier`, `GAV Discount Threshold`, with this tab active:

1. **Re-drive** — `Country` must repopulate the Year and Region lists (NM-2220 AC #1). For `Currency`,
   `Business Tier` and `GAV Threshold`, assert the **walked** outcome — whether that is a re-drive or a
   proven no-op. A proven no-op is a legitimate case; an assumed one is not.
2. **Load gate** — assert the tab's documented precondition: the country must be set before Year/Region
   populate.
3. **Dirty-state interaction** — change a header control while this tab has unsaved week edits; assert
   the Unsaved-Changes prompt and that Cancel/Discard/Save each behave. This is where NM-3485 and the
   header interact and it must be asserted here, not inherited from a sibling.
4. **No cross-contamination** — changing the header must not silently mutate another tab's unsaved state.

**`CRT` does not duplicate these.** `CRT` owns the header's intrinsic field behaviour; this block owns the
header→tab effect.

### 7d — Data discipline

SELF-PRODUCE → SELF-SERVE → escalate. No "no data" skip without both rungs evidenced (§20.4). **Every
mutating case restores state** — a left-behind Year or Region row corrupts the next run's denominator.

---

## Phase 8 — BUILDER artifacts

1. **Selectors** `clients/encore/src/selectors/discount-matrix/region-weekly-peaks.ts` (+ `shared.ts` if
   founding), following the `selectors/discount-optimization/` layout. **Never reference a `radix-*` id**;
   select tabs by `[role="tab"]` + visible text. Row lookup is **content-anchored by region and week
   date, never by index.**
2. **Page object** `clients/encore/src/pages/discount-matrix/region-weekly-peaks.page.ts` extending
   `base.page.ts`, per-method `@step`. **No `Proxy`** — retired in `48d5933f`; use decorators.
3. **Plain-English step labels** (LR-ENC-006) — `npm run check:step-labels`.
4. **No internal jargon in shipped source** (LR-058). `NM-####` is permitted.
5. **Ready-gate discipline** — gate on a **non-zero week-row count**, never on the container.
6. **Spec** `clients/encore/tests/discount-matrix/region-weekly-peaks.spec.ts` with the field-case
   describe, an `SBC — discount matrix region weekly peaks` describe, and a **Header-Effect describe**.
7. **Save dialog** — LR-012 says Location Settings dialogs are shared **unless MCP-proven otherwise**;
   prove it. If it is `<div role="alertdialog">` with unnamed buttons, target
   `[role="alertdialog"] button:text-is("Save")` (`.claude/context/navigation.md:34`).
8. **Boolean reader** — branch on the LR-036 format proven in Phase 6 step 7 for **this** table.
9. **Reuse mandate** — reuse existing grid row-lookup / content-anchor / download helpers; a missing
   helper is added **to the page object**, never as a new runner or standalone script.
10. No `networkidle`. No `page.waitForTimeout` — **including for NM-3074's slowness**; use
    `waitForEvent('download')` and proper state polling, never a duration threshold.
11. Every mutating case restores state — re-runs are idempotent.
12. `npx playwright test --list` resolves every authored TC ID.

**Render-fail rule (binding on Phases 7–10)**: a failing surface assertion triggers **RCA, then
classification** — regression-from-baseline → `BUG-DSM-RWP-NNN` with `baselineComparison`;
baseline-absent → `/encore-questions`; by-design → documented skip with the reason. Never blind auto-file,
never a silent skip. **The RCA verdict is CLAUDE-ONLY.**

---

## Phase 9 — Review: WATCHDOG completeness + the fight

**Delegated** (ledger D-12, D-13). Claude reads the DIGEST and the verify-run `verdict` — not the report.

1. **Axis-1 completeness** — every in-scope field has its §2 set; every Negative/BVA carries the §2.1
   announced-and-escapable oracle.
2. **Axis-2 completeness** — every applicable §3 family has its L1 must-assert or an explicit
   `out-of-scope:<family>=<reason ≥20 chars>`.
3. **Header-Effect completeness** — all four header controls across re-drive / load-gate / dirty-state /
   no-cross-contamination, with the Currency / Business Tier outcomes **proven** rather than assumed.
4. **Tier discipline** — every `deferred-to-DEEP` row names a specific element/launcher with a reason of
   at least 20 characters and no other classification token (G1); `Walk_Mode: quick` matches
   `CoverageMode: quick`.
5. **Regression-bank closure** — each of this tab's 8 rows is a named TC, a documented not-applicable with
   its reason, or an `/encore-questions` entry. The two `Rejected` rows carry an explicit re-verification
   verdict rather than being dropped because Jira rejected them.
6. **Bug-loop closure** — every `BUG-DSM-RWP-*` has its TC; every skip names its bug ID.
7. **Boolean render format proven independently for this table** (LR-036) — not inherited from a sibling.
8. Missing-testid report emitted with live-DOM evidence (LR-029).
9. `npm run check:spec-quality` on the **working tree** before any done/green/verified claim (LR-060
   obligation 4).
10. Suite green **twice consecutively** on office 1604; any 1101/1605 consultation recorded as an
    LR-ENC-005 note, not as the test office.

**The fight runs the required shape**: worker → reviewer → **worker DEFENDS** → aligned → Claude. Verdicts
are `RE-DERIVED-CONFIRM` / `RE-DERIVED-REFUTE` / `ABSTAIN` only — **"AGREE" is worthless**. A canary claim,
disjoint from anything this ticket permits and recorded privately first, is seeded; a review that misses
it is INVALID.

---

## Phase 10 — Iteration

- **BOUNCE, don't self-fix.** SELF_GRANT self-fix only after a bounce fails.
- **Classify the failure first**: prompt-issue (Claude's fault — rewrite the ticket, same tier, no bounce
  cost) · capability-gap (escalate a tier immediately) · env-flake (one fresh retry, then ENV-BLOCKED and
  route to Claude) · worker-defect (the classic bounce). **NM-3074's slowness makes env-flake genuinely
  likely here — do not bounce a worker for a slow surface.**
- **At attempt ≥2, stop and fix the TICKET** before spending attempt 3.
- **Re-dispatches carry `--attempt N+1`** and reassemble the full prompt from scratch including the
  hop-context header. A bounce that omits it carries stale context; refuse to send it.
- **Never self-rescue a stalled worker** — wait for the timeout or dispatch a fresh worker with the same
  ticket plus stall context.
- **Every worker death gets a cause row** routed to the right layer, never a prose-only note.
- Loop until the suite is green ×2 and Phase 9 items 1–8 pass.

---

## Phase 11 — Registration, sweep, closure

1. `.claude/context/navigation.md` §C Exploration Registry row.
2. `clients/encore/docs/MODULE_REGISTRY.md` + `REQUIREMENTS.md` updated for this tab's behaviours.
3. **Adjacent-Sweep ritual** — DO-NOW / SPAWN / APPEND with a grep-verified line item. Bare "out of
   scope" with no recipient = HALT and ask.
4. **File this tab's DEEP rows** into `plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md` — **create it
   if this is the first child to close.** LR-040(b): a deferral with no recipient file is a phantom
   hand-off and blocks closure.
5. **Annotate the parent's `## Child index` row** (LR-027 parent-cascade annotation — required while the
   parent is still in `plans/pending/`). **Do not auto-close the parent.**
6. LR-028 activity-log row with an LR-037 timestamp at or after every touched-file mtime.
7. LR-027 Execution Summary, `git mv` to `plans/done/`, `npm run plans:reindex`.
8. **Emit the Receipt.** Target: "I coded myself: nothing."

---

## Delegation ledger

Every row declares MECHANISM / THRESHOLD / BASELINE / SAMPLE per PLAN_75-TEMP §1. **A row missing a cell
does not ship.** Tiers: T0 `gpt-5-mini` · T1 `claude-haiku-4.5` · T2 `claude-sonnet-4.6` · T3
`claude-opus-4.6` · T4 `gpt-5.5` (cross-family review only).

| ID | Step | Tier / work-type | MECHANISM | THRESHOLD | BASELINE | SAMPLE |
|---|---|---|---|---|---|---|
| **D-01** | Jira crossref skeleton (Status left `UNVERIFIED`) | T0 / `draft` | `grep -c '^| NM-' <crossref>` equals the bank count; every Status cell reads `UNVERIFIED` pre-fill | Any missing row, or a Status the worker filled itself = bounce | The parent's 22-row bank table | 100% — closed set of 8 (+4 if founding) |
| **D-02** | Old-site baseline walk (`OFF-REPO: yes`, `CLARIFY: yes`) | T2 / `walk` | Independent agent re-executes verbatim in `--mode edit` and pastes its own raw output; verdict diffs claims vs re-execution | Any divergence on a **classification-bearing** observation = bounce | The new-site observation captured in the same session | Re-execute 100% of navigation steps + ≥3 field observations |
| **D-03** | Machine enumeration across 7 tab states | T1 / `walk` | `cross-check.mjs` → `CrossCheck: clean`; the weekly-row archetype resolves to a **non-zero** live match count | 0-match archetype = **HALT, not bounce** — tooling defect (PLAN_75-TEMP §2) | Sibling map `discount-optimization-2026-08-11.json` shape | 100% of the 7 states |
| **D-04** | Independent enumeration CONTROL (different provider than D-03) | T0 / `verify` | Claude diffs the two runs' element counts for one shared state | Counts differ at all = both runs suspect, investigate before dispositioning | D-03's own output for the same state | 1 state — proves the probe is not structurally blind |
| **D-05** | Dirty-state + peak-type trials (save→Cancel, un-check, mutual exclusivity) | T2 / `probe` | Each trial returns raw values — control state, Save enabled/disabled, post-Cancel values, post-reload values; report ends `## END-OF-REPORT <N>` | Prose instead of a raw value, or a missing END-OF-REPORT = bounce unread | NM-3485 / NM-3238 repro steps + the §2 set Claude assigned | 100% of assigned trials, batches of ~2 for live save-tests |
| **D-06** | Add-Year guard + duplicate-region + export trials | T2 / `probe` | Enablement state captured **before and after** each precondition is met; export HTTP status captured from the network log | Any trial that mutated state without restoring it = bounce | NM-3234 / NM-3435 / NM-3062 / NM-3475 repro steps | 100% — 4 named scenarios |
| **D-07** | Header-effect probes, 4 controls × BEFORE/AFTER delta | T2 / `probe` | Each control returns a captured delta, not a description of one | A control with no captured delta and no `DIFFERENTIAL-DATA-REQUIRED` tag = bounce | The parent's dependency-matrix hypothesis for the RWP column | 100% — 4 controls |
| **D-08** | **Blind Stage-3 re-drive** (LR-064) — a different worker, never shown the first worker's answers | T1 or T2 / `probe` | Re-drive output diffed against the originally cited evidence | Any contradiction = that disposition CANNOT close; escalate one tier | The first worker's raw evidence, withheld | `min(3, live-row count)` rows, randomly chosen by Claude |
| **D-09** | Selectors + page object | T2 / `build` | `check:step-labels`, `check:structural-names`, `typecheck` exit 0; zero `radix-` and zero `new Proxy(` in the diff; zero index-based row lookups | Any non-zero exit or forbidden pattern = bounce | `selectors/discount-optimization/` layout + comment style | 100% machine-gated |
| **D-10** | Test-case MD + test plan + XLSX sheet | T2 / `draft` | `check:tc-parity`, `lint:testcases`, `xlsx:lint` exit 0; authored TC count equals Claude's case-list count | Count mismatch, or a `(QUICK)` marker on a `## TC-…:` heading = bounce | Claude's authored case list, pasted into the ticket's ACCEPTANCE | Claude spot-reads 3 random TCs against the inventory rows they claim to cover |
| **D-11** | Spec authoring | T2 / `build` | `npx playwright test --list` resolves every `TC-DSM-RWP-*`; `check:spec-quality` exits 0 on the working tree; zero `waitForTimeout` | Any unresolved ID, gate failure, or timing-threshold assertion = bounce | The Phase-7 case list + `discount-optimization` spec house style | 100% machine-gated |
| **D-12** | Verification battery (all gates, one bundled ticket) | T0 / `verify` | `verify-run.mjs` JSON **`verdict` field** — never the exit code, never report prose. Commands tee'd with sha256, re-hashed and re-executed | `FABRICATED` = hard bounce with `reasons[]`. **`UNPROVABLE` = route to Claude, never auto-bounce** | The envelope manifest snapshotted pre-dispatch | 100% of gate commands |
| **D-13** | Cross-family adversarial review — the fight | T4 / `review`, `--mode edit` | Verdicts limited to `RE-DERIVED-CONFIRM` / `RE-DERIVED-REFUTE` / `ABSTAIN`; a seeded canary must be caught; worker DEFENDS before the result reaches Claude | Plain "AGREE", all-ABSTAIN, or a missed canary = INVALID review, bounce with no credit | Claude's claims table: each claim + its artifact path + the probe that produced it | Every material claim gets a claim-level status; confident claims attacked hardest |

**Not delegated — the quality floor** (full list in the parent's `## Delegation doctrine`). For this tab
the load-bearing ones are: whether a **`Rejected` ticket that still reproduces** is a discussion-item or a
bug; whether a **null header effect** is real or a data gap; the **LR-036 boolean-format verdict**; every
per-element disposition and `Coverage_Ratio` call; the §2/§3 taxonomy assignment; RCA verdicts; the
header→tab dependency-matrix update; Jira MCP fetches; trap-question design; ceremony and publishing; and
talking to the owner.

---

## Per-Identity Satisfaction

> **Closure instruction**: at DONE-flip replace every `<DATE>` with the real dated filename — C6 greps the
> literal cell paths and a placeholder DENIES the flip. Verify every path with `ls` BEFORE flipping. Rows
> marked *founder-only* apply only when Phase 1 returned `FOUNDATION-ABSENT`; when consuming, replace them
> with `(skipped: shared foundation consumed from a sibling subplan per the parent contract)`.

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | Jira crossref · baseline · interaction map · walk evidence · field inventory · testid gap report | `clients/encore/specs_planning/_internal/jira-defect-crossref-discount-matrix-region-weekly-peaks-<DATE>.md`<br>`clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-region-weekly-peaks-<DATE>.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-discount-matrix-region-weekly-peaks-<DATE>.md`<br>`clients/encore/specs_planning/_internal/field-inventories/discount-matrix-region-weekly-peaks-<DATE>.md`<br>`clients/encore/specs_planning/_internal/testid-gap-reports/discount-matrix-region-weekly-peaks-<DATE>.md`<br>`scripts/walk-coverage/interaction-maps/discount-matrix-region-weekly-peaks-<DATE>.json` | `node scripts/check-interaction-coverage.mjs --file scripts/walk-coverage/interaction-maps/discount-matrix-region-weekly-peaks-<DATE>.json` |
| GIVER | field-case catalog · test-case MD · test plan · XLSX workbook | `clients/encore/specs_planning/_internal/field-case-catalogs/discount-matrix-region-weekly-peaks-<DATE>.md`<br>`clients/encore/specs_planning/test-cases/setup/discount-matrix/discount_matrix_region_weekly_peaks_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/discount-matrix/discount_matrix_region_weekly_peaks_test_plan.md`<br>`clients/encore/testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` |
| BUILDER | selectors · page object · test data · spec | `clients/encore/src/selectors/discount-matrix/region-weekly-peaks.ts`<br>`clients/encore/src/pages/discount-matrix/region-weekly-peaks.page.ts`<br>`clients/encore/src/data/discount-matrix/region-weekly-peaks.ts`<br>`clients/encore/tests/discount-matrix/region-weekly-peaks.spec.ts` | `npx playwright test --list` |
| HEALER | (none) — no pre-existing failing specs on this tab | (none) | (none) |
| WATCHDOG | completeness + header-effect + bank + tier-discipline findings | `clients/encore/specs_planning/_internal/audit-discount-matrix-region-weekly-peaks-<DATE>.md` | `npm run check:spec-quality` |
| GARDENER | (none) | (none) | (none) |
| OWNER | registry *(founder-only)* · navigation · module registry · DEEP plan · parent annotation | `export_test_cases/module-codes.json`<br>`export_test_cases/types.ts`<br>`.claude/context/navigation.md`<br>`plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md`<br>`plans/pending/PLAN_DISCOUNT_MATRIX_AUTOMATION.md` | `npm run check:tc-parity` |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] NM-3342 confirmed closed before execution began, or a user-signed `## Deferral Authorization` recorded.
- [ ] Branch check ran — the `inputmode: decimal` signature rule is present, or was ported before any walk.
- [ ] Phase 1 recorded FOUNDER or CONSUMER, and — if consumer — the 3-field × 4-check LR-013 spot-check log, or a `DRIFT_DETECTED` refresh.
- [ ] Jira crossref exists; all 8 bank rows (+4 CRT if founding) carry a re-fetched status and a post-walk verdict; the baseline artifact carries `jira_tickets:`.
- [ ] **Both `Rejected` rows (NM-3230, NM-3275) carry an explicit live re-verification verdict** — not dropped because Jira rejected them.
- [ ] NM-2220's business-rules attachment retrieved and summarised, or `businessRulesDoc: unavailable` with the reason.
- [ ] Baseline artifact exists with a `## Baseline diff` section, or an explicit `baselineScope: baseline-absent`.
- [ ] Enumeration covers all 7 tab states; `Coverage_Ratio` 100%, `CrossCheck: clean`, opener frontier resolved (walked or `deferred-to-DEEP`). `Add Year` walked fully.
- [ ] The weekly-row archetype resolved to a non-zero live match count, and the D-04 independent control agreed.
- [ ] **The footer record count and the visible week-row count were captured in the same snapshot** and their agreement or disagreement recorded (NM-3230).
- [ ] Interaction map PASSES `check-interaction-coverage` — no `unclassified-element`, no `claim-census` residual.
- [ ] Walk evidence carries `## Observations` with both buckets filled or the literal `none`.
- [ ] **All 8 bank rows dispositioned** — named TC, documented not-applicable, or `/encore-questions` entry.
- [ ] **The un-check finding (NM-3238) was preceded by a positive control** proving the un-check primitive fires on a known-good control.
- [ ] Every confirmed bug filed per LR-034 with `baselineComparison` + numbered `stepsToReproduce`, and has a required TC; every skip names its bug ID. No DOM/markup-accessibility finding filed as a bug.
- [ ] Every empty surface carries c.1 / c.2 / c.3, and the empty-state string is captured verbatim. The pre-selection empty state is classified `by-design`, not left blank.
- [ ] Every zero-delta probe on a mandatory-effect class carries `DIFFERENTIAL-DATA-REQUIRED` with rung-1 and rung-2 evidence. **No case asserts the Currency or Business Tier no-op as expected behaviour without that evidence.**
- [ ] Every claimed row carries an `affordance:` token, `provenance: live`, and dated evidence; no inert verdict without a positive control.
- [ ] **The D-08 blind re-drive ran on `min(3, live-row count)` rows and contradicted nothing.**
- [ ] **Boolean render format MCP-proven independently for the peak-type control** (LR-036) — not inherited from a sibling tab.
- [ ] Missing-testid report emitted with live-DOM evidence per element; nothing skipped for a missing testid.
- [ ] Axis-1 §2 set complete for every in-scope field, each Negative/BVA carrying the §2.1 oracle.
- [ ] Axis-2 L1 must-assert present per applicable §3 family, or `out-of-scope:<family>=<reason ≥20 chars>`.
- [ ] **Header-Effect block covers all four header controls** across re-drive / load-gate / dirty-state / no-cross-contamination; the parent's dependency matrix RWP column updated with walked results.
- [ ] Row lookup is content-anchored by region and week date — zero index-based lookups in the spec or page object.
- [ ] Zero `waitForTimeout` and zero duration-threshold assertions, despite NM-3074's slowness.
- [ ] Every `deferred-to-DEEP` row names a specific element/launcher with a reason of at least 20 characters and no other classification token (G1).
- [ ] `Walk_Mode: quick` in the field inventory matches `CoverageMode: quick` here.
- [ ] This tab's DEEP rows are grep-verifiable line items in `plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md`.
- [ ] No `(QUICK)`/`(DEEP)` marker on any `## TC-…:` heading (ALL-091); no ticket ID in a structural name on a shippable path (LR-073); no internal jargon in shipped source (LR-058).
- [ ] `check:tc-parity`, `lint:testcases`, `xlsx:lint`, `check:step-labels`, `check:structural-names`, `typecheck` all exit 0.
- [ ] `npm run check:spec-quality` passes on the working tree before any done/green/verified claim.
- [ ] Suite green twice consecutively on office 1604; every mutating case restores state.
- [ ] `/regression-guard` before/after = no silent breakage.
- [ ] **Delegation**: every dispatch had `--work-type` from the 9-value enum, an explicit `--timeout`, `--max-credits` at 2× estimate, a non-empty `--session-id` and `--parent-run-id`, and a literal `OUTPUT (LITERAL ABSOLUTE):` path. Zero uncapped dispatches, zero detached dispatches (LR-074).
- [ ] **Every accepted round's `verify-run.mjs` verdict was GENUINE**, or an `UNPROVABLE` was routed to Claude's judgment with the disposition recorded.
- [ ] **The fight ran the required shape**, used only the three legal verdicts, and caught the seeded canary.
- [ ] Every non-empty `## ASK` dispositioned; every report carried `## ASSUMPTIONS-MADE`; no two workers' assumptions left in conflict.
- [ ] Parent's `## Child index` row annotated; parent NOT auto-closed.
- [ ] LR-028 activity-log row with an LR-037 timestamp at or after every touched-file mtime.
- [ ] Receipt emitted and reconciles against `.claude/state/ua-worker/ledger.jsonl`.
- [ ] `/final-q` verdict block emitted per LR-042.

---

## Verification

```bash
npm run check:tc-parity && npm run lint:testcases && npm run xlsx:lint && npm run typecheck
```

```bash
npx playwright test clients/encore/tests/discount-matrix/region-weekly-peaks.spec.ts --retries=0
```

```bash
node scripts/check-interaction-coverage.mjs --self-test
```

---

## Handoff (post-execution)

The Region Weekly Peaks tab is covered at QUICK depth: a machine denominator at 100% with every element
either claimed at full rigor or named in a DEEP deferral, a baseline verdict, a targeted manual-QA harvest
against its 8-row regression bank — including explicit live verdicts on the two `Rejected` tickets rather
than silent drops — Axis-1 field coverage with the rejection-affordance oracle, Axis-2 L1 must-asserts,
and a Header-Effect block that proves which header controls actually re-drive this tab and which
provably do not. If this subplan founded the shared registry and `CRT` band, its two siblings can now run
as consumers with a spot-check. Depth beyond L1 is deferred by name to the filed follow-up plan. The
parent stays PENDING with its remaining children outstanding — by design.
