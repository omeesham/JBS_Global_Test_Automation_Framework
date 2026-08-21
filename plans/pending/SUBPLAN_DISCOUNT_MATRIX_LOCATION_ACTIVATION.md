> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute SUBPLAN_DISCOUNT_MATRIX_LOCATION_ACTIVATION.md`. All context below.**
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
> **HALT + ASK** if: NM-3342 is open · the location grid turns out to be volume-class (see Context) and the quick tier cannot honestly cover it · two workers' `## ASSUMPTIONS-MADE` conflict · LR-040 closure-completeness fails on any planned item.

---

# SUBPLAN_DISCOUNT_MATRIX_LOCATION_ACTIVATION — Location Activation tab, QUICK coverage, delegated

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
**Jira**: NM-3343 · NM-2221 (Location Activation delivery spec) · NM-1681 (`GET /api/DiscountMatrix/Location`) · NM-1668 (parent MFE story)

---

## Context

Location Activation is the smallest of the three Discount Matrix tabs: a single grid of locations, each
with an activation toggle, driven by the header's `Country`. It owns **2 of the 22** rows in the parent's
regression bank — both dirty-state / guard defects.

**This subplan is independently runnable and independently closeable.** It does not require its two
siblings. If it runs first it also founds the shared registry + `CRT` header band per the parent's
`## Shared Foundation`; if a sibling already did, it consumes that with a spot-check.

### Why this one is the cheapest first pick

If the goal is to prove the delegation machinery end-to-end before committing to the big tab, this is the
one to take: two bank rows, one grid, one toggle type, and the smallest case set. It exercises every
phase — baseline, denominator, harvest, inventory, cases, build, fight, iteration — at roughly a third of
Company Matrix's volume. **Its risk is not complexity, it is volume** (below).

### This tab's regression bank (2 rows — both re-verified live in Phase 4)

| Ticket | Status @ authoring | Claim |
|---|---|---|
| NM-3253 | QA | Save allowed despite grid validation errors |
| NM-3232 | Done | Discard-confirmation dialog reappears on returning to the tab after discarding |

Two rows is a small bank, and that is a reason to probe **harder**, not to close faster. A tab with only
two filed defects has either genuinely fewer, or fewer people have looked. **Zero new suspicions on a
surface nobody has walked before is a bare-minimum-pass signal to interrogate, not a clean bill.** The
Phase-4 harvest here carries proportionally more weight than on the other two tabs, because the bank
cannot do the work for it.

If this subplan founds the shared foundation it additionally owns the `CRT` rows NM-3235, NM-3440,
NM-3441 and NM-3256 (see the parent's `## Shared Foundation`) — which would make it roughly the same size
as Region Weekly Peaks.

### This tab's header dependency (hypothesis — Phase 3 confirms or corrects it)

Per NM-2221 / NM-1681 the grid is loaded by `GET /api/DiscountMatrix/Location?countryId=` and
**`countryId` must be above 0** — so `Country` is the confirmed driver and there is a documented
precondition to assert. **`Currency`, `Business Tier` and `GAV Discount Threshold` are unverified for this
tab and must be probed.** If they do nothing here while they gate Company Matrix's load, that asymmetry
is exactly what the owner's header×submodule requirement exists to catch. A proven no-op is a legitimate
case; an assumed one is not.

### The real risk here is volume, not complexity

The sibling Discount Optimization surface's locations grid holds **2154 rows with no pagination**
(documented at `clients/encore/src/selectors/discount-optimization/discount-optimization.ts:8`). If this
tab's location list is similarly sized, three things follow and must be handled rather than discovered
late:

1. **The enumerator's row archetype will be large.** Confirm it resolves to a non-zero live match count
   and collapses sanely; do not enumerate 2154 rows individually.
2. **Row lookup must be content-anchored by location name, never by index** — the sibling file records
   this as a hard rule at `:21-22`.
3. **`pagination` and volume behaviour are DEEP** (parent D3), not quick. If the grid is large, the quick
   disposition is `deferred-to-DEEP: <grid> (<reason ≥20 chars>)` for the volume family — **not** a
   silently reduced sample. If the tab turns out to be volume-class in a way that makes an honest quick
   claim impossible, HALT and ask rather than shrinking the claim quietly.

### Traps

All three parent traps apply, with reduced weight:

- **Trap 1 (UI↔DB off-by-one)** — no percentage matrix here, but the activation toggle still persists a
  value. Capture the save payload; if a sibling already recorded the mapping verdict in the parent,
  consume it rather than re-litigating.
- **Trap 2 (enumerator blindness)** — run the same branch check and non-zero match-count gate. Lower risk
  (no percentage archetype) but the volume archetype above is this tab's version of the same class.
- **Trap 3 (Jira self-contradiction)** — neither of this tab's rows is contradicted, so trap 3 is inert
  here unless the walk surfaces a new one.

---

## Bootstrap

**Identity**: OWNER shell (CEO). Adopt `/identity HUNTER` before Phase 0.5b–6 artifacts, `/identity GIVER`
before any test-case / test-plan / catalog write, `/identity BUILDER` before any spec / page-object write,
`/identity WATCHDOG` for Phase 9.

**Context files**:
- `plans/pending/PLAN_DISCOUNT_MATRIX_AUTOMATION.md` — **the parent. Read `## Context`, `## Shared Foundation`, `## Delegation doctrine` in full.**
- `.claude/skills/delegation-temp/SKILL.md` · `.claude/skills/ultra-agents/worker-ext.md` · `~/.claude/delegation/ticket-template.md`
- **`clients/encore/src/selectors/discount-optimization/discount-optimization.ts`** — the sibling locations grid. Its header comment records the 2154-row/no-pagination fact, the `radix-*` id ban, the content-anchored row-lookup rule, and the container-exists-before-data ready-gate trap. **This tab is the closest analogue in the repo; read it before writing a single selector.**
- `.claude/agents/REQUIREMENTS.md` — **HUNTER HARD STOPS.** Phases 0.5b–6 are HUNTER phases.
- `.claude/agents/PLANNER.md` (GIVER) · `.claude/agents/GENERATOR.md` (BUILDER) · `.claude/agents/AUDIT.md` (WATCHDOG)
- `.claude/skills/coverage/SKILL.md` — the QUICK contract (Axis 1 floor, Axis 2 L1, TDW-Q, §20-Q)
- `docs/read_only_docs/CASE_GENERATION_STANDARD.md` · `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2, §4, §20, ALL-024, ALL-045, ALL-071, ALL-091) · `docs/read_only_docs/LEARNED_RULES.md` · `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (§2 Table 2 — LR-054)
- `clients/encore/CLAUDE.md` — **LR-036 is load-bearing on this tab** (the activation toggle's render format), plus LR-012, LR-017, LR-ENC-001 through LR-ENC-006
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` · `field-case-generation.md` (§2, §2.1, §3)
- `clients/encore/specs_planning/_internal/agent-mistakes.md`
- The Jira reference doc named in the parent, with its branch caveat.
- `.claude/rules/`: `inventory.md` (LR-013, LR-029, LR-057, LR-062, LR-064, LR-065, LR-072) · `pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-046, LR-048, LR-060) · `guardrail-policy.md` (LR-074) · `browser-tool.md` · `baseline.md` · **`angular.md` (LR-009 / LR-026 — the dirty-state rules NM-3232 sits on)** · `specs.md` · `data.md` · `deliverable.md` (LR-058, LR-073) · `plan-closure.md` · `no-wrappers.md`

**Anti-Assumption Gates**:
- [ ] Baseline walk EXECUTED before any behaviour classification or bug filing (Gate 1).
- [ ] No generalization on fewer than 2 evidence sources (Gate 2 — LR-061-A).
- [ ] No inert verdict without a positive control (Gate 3 — LR-061-C).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block (Gate 5).
- [ ] Every DEEP deferral named in the parent's `## Deferred to DEEP` (Gate 6, LR-072).
- [ ] **No disposition written from an unverified worker report (Gate 7 — LR-062 condition 5 + LR-064 Stage 3).**
- [ ] **No quietly-shrunk claim on a volume-class grid (Gate 8 — this tab's specific risk; defer the family by name or HALT, never sample silently).**

---

## Phase 0 — Gate + delegation activation

1. **Dependency**: NM-3342 closed. **Still PENDING as of 2026-08-18 with 16 unticked criteria** — HALT and
   ask if it has not moved. Note that NM-3342 covers the sibling locations grid, so its closure also
   makes its selectors and page objects available as reuse targets here.
2. Read `.claude/context/navigation.md`, `agent-mistakes.md`, `.claude/context/patterns.md`.
3. **Invoke `/delegation-temp`**; emit the Activation Block. Confirm the agent profiles exist.
4. **Branch check (trap 2)**: `grep -n "inputmode" scripts/walk-coverage/enumerate-page.mjs`. No hit =
   `main` side; port the rule before any walk and record it as a tooling fix, not a coverage step.
5. **Volume reconnaissance — do this before sizing any ticket.** Load the tab and read the row count once.
   A small grid (tens of rows) means ordinary sizing; a sibling-scale grid (thousands) means every walk
   and probe ticket needs a generous explicit `--timeout` and 2× credits, and the volume family gets
   deferred by name per the Context risk note.
6. Browser-tool announcement per the parent's Phase 0 step 5.
7. Tier announcement: `CoverageMode: quick`.

---

## Phase 0.5b — Baseline-first walk (LR-048 conditional: REQUIRED — Skills includes `/find-bugs`)

**Delegated** (ledger D-02). Observation only — HARD STOP #4 + #10.

1. `https://navigator2.training.psav.com/#/`, office 1604. The reference doc names the legacy component
   `location-activation.component.ts` and the legacy route `/setup/discount-pricing/matrix` — search
   hints, not addresses.
2. **No mutations.** The HARD STOP #9 carve-out permits opening a picker and Cancel/Esc to read an
   affordance — never Select or Save. **An activation toggle is a mutation: do not touch it on the old
   site.**
3. Artifact: `clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-location-activation-<DATE>.md`.
4. No counterpart → `baselineScope: baseline-absent`. **Not a HALT.**
5. Classify every divergence (a) regression-from-baseline, (b) intentional UX change with a citation,
   (c) baseline-absent. Emit `## Baseline diff`. **Classification is CLAUDE-ONLY.**
6. **N of at least 2 before any generalization** (LR-061-A).

---

## Phase 1 — Shared Foundation: claim-or-consume

Run the parent's `## Shared Foundation` gate verbatim. `FOUNDATION-ABSENT` → **FOUNDER** (mint `DSM` + all
four codes, author the `CRT` band; this roughly doubles this subplan's size — plan for it).
`FOUNDATION-PRESENT` → **CONSUMER** (LR-013 spot-check 3 random `CRT` fields × 4 checks; any disagreement
= `DRIFT_DETECTED` → refresh first, and say so in the Execution Summary). Verify `npm run check:tc-parity`
exit 0.

---

## Phase 2 — Jira bank verification (LR-ENC-004)

1. **Re-fetch the live status of both rows** (+4 `CRT` rows if founding) — **CLAUDE-ONLY**, workers cannot
   reach Claude's Jira MCP.
2. Worker drafts the crossref skeleton (ledger D-01); Claude fills the statuses. Artifact:
   `clients/encore/specs_planning/_internal/jira-defect-crossref-discount-matrix-location-activation-<DATE>.md`.
3. Add `jira_tickets: [...]` to the baseline artifact frontmatter. Rovo unavailable → `rovo_available: false`
   and consume the committed reference doc; never silently skip.
4. **Retrieve NM-2221's business-rules attachment** if one exists; unretrievable →
   `businessRulesDoc: unavailable` with the reason. Also confirm the NM-1681 endpoint contract
   (`countryId` must be above 0) against a live network capture, not against the ticket text alone.
5. Every Jira fact is a **LEAD** re-verified against DOM (ALL-024); divergence classified per REQ-014.

---

## Phase 3 — Machine denominator + header-effect probes (LR-062, TDW-Q)

1. **Enumerate** (ledger D-03) against this tab in each state that changes the control set: no country
   selected, country selected with locations rendered, grid empty, validation-error state (NM-3253's
   habitat), Unsaved-Changes / discard-confirmation prompt (NM-3232's habitat), and the post-discard
   return state. **The live page enumerates itself.**
2. **Archetype sanity gate** — the location rows collapse into a row archetype. Confirm it resolves to a
   **non-zero live match count** and that the activation toggle resolves to a real type. A 0-match
   archetype is a **tooling defect**, not an empty grid — RCA before walking further. **On a
   sibling-scale grid, confirm the archetype collapsed rather than enumerating thousands of rows
   individually.**
3. **Independent enumeration control** (ledger D-04) — a cross-family worker re-runs one state; Claude
   diffs the counts. This is the CONTROL the findings contract requires.
4. **§20-Q profile**: LANDING state plus any opener hosting in-scope fields. Others →
   `deferred-to-DEEP: <opener> (<reason ≥20 chars>)`. Un-openable = a named blocker row, never a silent gap.
5. **Guard probe (NM-3253)** — drive the grid into a validation-error state, then attempt Save. Capture
   the Save button's enabled state, the network request (fired or not), and the response. **"Save was
   allowed" is only a finding if the request actually fired and was accepted** — a disabled-but-clickable
   button is a different defect from a permissive server.
6. **Header-effect probes** (ledger D-07) — with this tab active, change each of `Country`, `Currency`,
   `Business Tier`, `GAV Discount Threshold` and capture the BEFORE/AFTER delta. `Country` is expected to
   re-drive the location list; **the other three are unverified and a null result must be proven, not
   assumed** — a no-delta outcome gets `DIFFERENTIAL-DATA-REQUIRED`, not a "no effect" case. Additionally
   assert the documented `countryId` above-0 precondition. **Claude writes the parent's dependency-matrix
   update.**
7. `cross-check.mjs` → `CrossCheck: clean`, `Coverage_Ratio` 100%. `coverageScope: PARTIAL` is not a
   stopping point.
8. Emit `scripts/walk-coverage/interaction-maps/discount-matrix-location-activation-<DATE>.json` —
   `ARTIFACTS_DIR` at `scripts/check-interaction-coverage.mjs:39`; read the sibling
   `discount-optimization-2026-08-11.json` first, which maps the closest-analogue grid in the repo.
   Classify against the nine `PROBE_DEFINITIONS` control classes (`filter`, `sort`, `pagination`,
   `editable-cell`, `guard`, `io`, `menu-disclosure`, `add-picker`, `context-selector`; the other three
   keys are Kernel oracles, not control classes). Expected mapping — **confirm, do not assume**: any
   search/filter input → `filter`; the activation toggle → `editable-cell`; tab `Save` → `guard`; tab
   strip → `context-selector`; column headers → `sort` **only if they prove sortable** (the sibling grid's
   selector file records that header-click sorting was never confirmed there — do not inherit that
   uncertainty, resolve it here).
9. Unclassifiable control → LR-071.1: add a **class-level** `PROBE_DEFINITIONS` entry, never an instance
   hack; re-run `node scripts/check-interaction-coverage.mjs --self-test`.
10. Drive `node scripts/check-interaction-coverage.mjs --file <map>` to PASS.
11. **Positive control before any inert verdict** (LR-061-C) — raw-JS `.click()` does not reliably fire
    React `onClick`. Prove the toggle primitive fires on a known-good row before recording any toggle as
    unresponsive.
12. **BeforeUnload trap** (HARD STOP #8 / ALL-052) — dialog-accept before `goto`, navigate
    `about:blank → target`, never reload the same URL. **NM-3232 is a discard-dialog defect, so this tab
    is the most likely of the three to strand a probe behind a prompt.**
13. **Zero-delta = a data need** (LR-040-D) — `DIFFERENTIAL-DATA-REQUIRED` firing Rung 1 SELF-PRODUCE →
    Rung 2 SELF-SERVE → Rung 3 ESCALATE by name. **No case asserts a zero-effect as expected behaviour**
    until ground truth disambiguates. This is the live rule for the Currency / Business Tier / GAV probes.

---

## Phase 4 — Manual-QA bug harvest (ALL-045)

**Quick-mode decoupling**: no forced SFDPOT sweep; the pattern sweep fires on **CRITICAL/HIGH** finds
only. **But this tab's bank is only 2 rows, so the harvest carries more weight here than on the other two
tabs** — the bank cannot substitute for looking.

1. **Walk the bank deliberately** (ledger D-05):
   - **Save-with-errors (NM-3253)** — drive a validation error, attempt Save, and capture Save's enabled
     state, whether the network request fired, and the response. Distinguish a permissive client from a
     permissive server; they are different bugs with different owners.
   - **Discard-and-return (NM-3232)** — make an edit, navigate away, Discard on the prompt, then return
     to the tab and assert the dialog does NOT reappear. **LR-009 / LR-026: Angular's dirty flag survives
     a save/discard the button state suggests is finished** — that is exactly this defect's shape.
2. **Then look beyond the bank.** Toggle a row and reload; toggle several and Save; toggle and Cancel;
   search/filter then toggle then clear the filter (does the pending change survive?); sort if sortable
   then toggle. These are ordinary manual-QA moves and this tab has had the least eyes on it.
3. Record `## Observations` in the walk-evidence artifact **before handoff**, both buckets per ALL-045.
   Nothing to report = the literal `none` under each. **An absent section is an incomplete walk.**
4. A render-state defect must be **SEEN** — element screenshot or `boundingBox` geometry, never inferred
   from `aria-invalid`.
5. **Do not file DOM/markup accessibility findings as bugs** (owner standing rule). Behaviour only.
6. **Triage is CLAUDE-ONLY**: regression-from-baseline → `BUG-DSM-LOA-NNN` with `baselineComparison` +
   `baselineEvidence` (LR-034) and numbered `stepsToReproduce`; baseline-absent → `/encore-questions`;
   by-design → documented with its citation; empty-everywhere + no-UI-path + no-Jira → discussion-item.
7. **A `Done` ticket that still reproduces is a reopened regression, not a duplicate** — NM-3232 is `Done`.
8. **Close the loop**: every confirmed bug's repro edge-case becomes a **required TC** in Phase 7 as a
   failing bug-evidence case. Any skip citing one of these bugs names the bug ID.
9. Artifact: `clients/encore/specs_planning/_internal/walk-evidence-discount-matrix-location-activation-<DATE>.md`
   with dated screenshots beside it.
10. Bugs are filed and evidenced here, not fixed here.

---

## Phase 5 — Empty-surface and data variety (LR-040(c))

This tab has a documented empty state: **`countryId` at or below 0**, i.e. before a country is selected.
That is `by-design` and must be classified rather than left blank. A country with zero configured
locations is a different, likely `data-blocked` empty. Record all three sub-items **per empty surface
found**:

- **c.1 population path** — which Country yields zero location rows, and the empty-state string
  **verbatim** (that string is the `empty-vol` L1 must-assert). Re-check offices **1101** (LR-ENC-005) and
  **1605**. "Empty on 1604" is a data-state observation, never a population path.
- **c.2 classification** — exactly one of `data-blocked`, `feature-blocked`, `by-design`.
- **c.3 escalate-if-unknown** — unknown after a real dig → `/encore-questions`. Never close on
  "empty / refresh later".

**Data variety for the Header-Effect block**: at least two Countries with different location sets, and one
Country with zero locations. **Confirm live option lists rather than seeding from this paragraph** —
LR-015.

---

## Phase 6 — Field inventory (LOA)

`clients/encore/specs_planning/_internal/field-inventories/discount-matrix-location-activation-<DATE>.md`:

1. Frontmatter: `jira_tickets:`, `baselineScope:`, `Coverage_Ratio`, `CrossCheck`, **`Walk_Mode: quick`**
   (LR-072 dual-home — Cx FAILS on mismatch with this subplan's `CoverageMode`).
2. One row per machine-enumerated element, every one dispositioned, no blanks. Non-L1 rows get
   `deferred-to-DEEP: <element/launcher id> (<reason ≥20 chars>)` — **G1: no other token beside it.** On a
   volume-class grid the row archetype is dispositioned once, not per row — record the archetype's live
   match count as the evidence.
3. Per in-scope field: its §2 type and exact case-set, **with the §2.1 rejection-affordance oracle on
   every Negative and BVA case** — proven both **announced** (polled per LR-010) and **escapable**.
4. `behavior-cases:<families>` on the grid naming applicable §3 families, or
   `out-of-scope:<family>=<reason ≥20 chars>` (LR-065). **On a large grid, `pagination` and volume go to
   `deferred-to-DEEP`, never to a quietly reduced sample.** Neither token = undispositioned = Cx FAIL.
5. **`affordance:` token per row** (LR-057) — field, label, and container click-probed.
6. Every observation row carries `provenance: live` + a dated `evidence:` pointer. **`provenance: oracle`
   on an observation-claiming row is FABRICATION-class**: it fails the whole closure and writes an
   integrity strike to `.claude/state/integrity-strikes.jsonl`.
7. **Boolean render format — LR-036, load-bearing on this tab.** Before any boolean-reader helper is
   written, MCP-verify which of the three render formats the `isActivated` toggle uses (Unicode check /
   SVG `lucide-check` / empty cell). **Verify it independently for this table** even if a sibling subplan
   already proved its own control — LR-036 exists precisely because two tables in the same app differ.
   The sibling Discount Optimization grid reads its toggle via `aria-checked` with a `Yes`/`No` text
   fallback (`discount-optimization.ts:111-115`); **that is a lead, not this table's answer.**
8. **Missing-testid report** (LR-029) — live-DOM verified per element, never a static grep. The sibling
   surface carried **exactly one** testid on the whole page; expect similar. A missing testid never
   justifies a skip (LR-014): next-best stable locator, run the test, record the gap in
   `clients/encore/specs_planning/_internal/testid-gap-reports/discount-matrix-location-activation-<DATE>.md`,
   rolled up to ONE module-level client ask.

**LR-064 TDW quick profile**: Opus owns recon, the denominator, the taxonomy assignment, the per-element
verify, and every disposition. Only deterministic input-trials delegate down. **Stage-3 blind independent
re-drive retained** at `min(3, live-row count)` — ledger D-08. **Never disposition from an unverified
worker report.**

---

## Phase 7 — Case authoring, QUICK tier (GIVER)

TC IDs use `TC-DSM-LOA-NNN`. **Do not mint `TC-DSM-FCC-*`** — `FCC` is not a registered submodule code and
`check-tc-parity` G6c rejects it. Surface cases carry `**Surface_Family**: <family> (QUICK)` **in the body
only** — never on a `## TC-…:` heading (ALL-091).

### 7a — Axis 1: field cases (the quick floor — not reduced)

- The per-row **`isActivated` toggle** — on, off, on-then-reload, on-then-Cancel, multiple rows in one
  save cycle. Full §2 boolean set.
- **Any search / filter control the walk finds** — full §2 set with the §2.1 oracle, including the
  filter-then-toggle-then-clear interaction from Phase 4 step 2.

**Required regression cases**: Save-with-validation-errors (NM-3253) asserting the button state, the
network request, and the response; and discard-then-return (NM-3232) asserting the dialog does not
reappear.

### 7b — Axis 2: L1 surface must-asserts

Applicability is decided by the Phase-3 walk, not this list. Expected:
`result-fidelity` (the selected Country returns exactly its locations) · `render-state` (the activation
toggle renders its state in the format proven in Phase 6 step 7) · `empty-vol` (the Phase-5 verbatim
string) · `persistence` (a toggle dirties the form and enables Save; a save survives reload; a revert
returns Save to disabled — revert is not pristine, LR-009 / LR-026). `pagination` / `sorting` /
`combination` apply **only if the walk proves the affordances exist**; on a volume-class grid with no
paginator the honest disposition is `deferred-to-DEEP` for volume plus
`out-of-scope:pagination=<reason ≥20 chars>` for the absent control.

### 7c — Header-Effect block (the owner's requirement)

For each of `Country`, `Currency`, `Business Tier`, `GAV Discount Threshold`, with this tab active:

1. **Re-drive** — `Country` must repopulate the location list. For the other three, assert the **walked**
   outcome — a re-drive or a proven no-op. A proven no-op is a legitimate case; an assumed one is not.
2. **Load gate** — assert the documented `countryId` above-0 precondition (NM-2221 / NM-1681): with no
   country selected the grid shows its empty state and no request fires with a non-positive `countryId`.
3. **Dirty-state interaction** — change a header control while this tab has unsaved toggles; assert the
   Unsaved-Changes prompt and that Cancel/Discard/Save each behave. **NM-3232 lives at exactly this
   boundary** — discard, then change the header, then return.
4. **No cross-contamination** — changing the header must not silently mutate another tab's unsaved state.

**`CRT` does not duplicate these.** `CRT` owns the header's intrinsic field behaviour; this block owns the
header→tab effect.

### 7d — Data discipline

SELF-PRODUCE → SELF-SERVE → escalate. No "no data" skip without both rungs evidenced (§20.4). **Every
mutating case restores state** — an activation toggle left flipped changes real discount eligibility for
that location and corrupts the next run's baseline.

---

## Phase 8 — BUILDER artifacts

1. **Selectors** `clients/encore/src/selectors/discount-matrix/location-activation.ts` (+ `shared.ts` if
   founding). **Model it on `selectors/discount-optimization/discount-optimization.ts`** — the closest
   analogue in the repo. Carry over its four hard rules: near-zero testids so anchor on role + name /
   `aria-label` / visible text; **never reference a `radix-*` id**; **row lookup content-anchored by
   location name, never by index**; and the container exists before data arrives so it is not a ready-gate.
2. **Page object** `clients/encore/src/pages/discount-matrix/location-activation.page.ts` extending
   `base.page.ts`, per-method `@step`. **No `Proxy`** — retired in `48d5933f`; use decorators.
3. **Plain-English step labels** (LR-ENC-006) — `npm run check:step-labels`.
4. **No internal jargon in shipped source** (LR-058). `NM-####` is permitted.
5. **Ready-gate discipline** — gate on a **non-zero row count**, never on the container. This is the exact
   mistake that produced three false "grid is empty" findings on the sibling surface.
6. **Spec** `clients/encore/tests/discount-matrix/location-activation.spec.ts` with the field-case
   describe, an `SBC — discount matrix location activation` describe, and a **Header-Effect describe**.
7. **Save dialog** — LR-012 says Location Settings dialogs are shared **unless MCP-proven otherwise**;
   prove it. If it is `<div role="alertdialog">` with unnamed buttons, target
   `[role="alertdialog"] button:text-is("Save")` (`.claude/context/navigation.md:34`).
8. **Boolean reader** — branch on the LR-036 format proven in Phase 6 step 7 for **this** table.
9. **Reuse mandate** — reuse the sibling's grid row-lookup and content-anchor helpers where they fit; a
   missing helper is added **to the page object**, never as a new runner or standalone script.
10. No `networkidle`. No `page.waitForTimeout`.
11. Every mutating case restores state — re-runs are idempotent.
12. `npx playwright test --list` resolves every authored TC ID.

**Render-fail rule (binding on Phases 7–10)**: a failing surface assertion triggers **RCA, then
classification** — regression-from-baseline → `BUG-DSM-LOA-NNN` with `baselineComparison`;
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
   no-cross-contamination, with the Currency / Business Tier / GAV outcomes **proven** rather than assumed,
   and the `countryId` above-0 precondition asserted.
4. **Tier discipline** — every `deferred-to-DEEP` row names a specific element/launcher with a reason of
   at least 20 characters and no other classification token (G1); `Walk_Mode: quick` matches
   `CoverageMode: quick`.
5. **Regression-bank closure** — both rows are a named TC, a documented not-applicable with its reason, or
   an `/encore-questions` entry.
6. **Harvest depth** — **because the bank is only 2 rows, the audit specifically checks that Phase 4 step
   2 (looking beyond the bank) actually happened.** A `## Observations` section reading `none` on a
   never-before-walked surface is interrogated, not accepted at face value.
7. **Volume honesty** — if the grid is volume-class, confirm the volume family was **deferred by name**
   and not covered by a quietly reduced sample (Gate 8).
8. **Boolean render format proven independently for this table** (LR-036) — not inherited from the sibling
   Discount Optimization grid, whose `aria-checked` pattern is a lead only.
9. Missing-testid report emitted with live-DOM evidence (LR-029).
10. `npm run check:spec-quality` on the **working tree** before any done/green/verified claim (LR-060
    obligation 4).
11. Suite green **twice consecutively** on office 1604; any 1101/1605 consultation recorded as an
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
  route to Claude) · worker-defect (the classic bounce).
- **A worker stranded behind the NM-3232 discard dialog is a ticket defect, not a worker defect** — the
  ticket should have carried the BeforeUnload recipe. Fix the ticket, redispatch, no bounce charged.
- **At attempt ≥2, stop and fix the TICKET** before spending attempt 3.
- **Re-dispatches carry `--attempt N+1`** and reassemble the full prompt from scratch including the
  hop-context header. A bounce that omits it carries stale context; refuse to send it.
- **Never self-rescue a stalled worker** — wait for the timeout or dispatch a fresh worker with the same
  ticket plus stall context.
- **Every worker death gets a cause row** routed to the right layer, never a prose-only note.
- Loop until the suite is green ×2 and Phase 9 items 1–9 pass.

---

## Phase 11 — Registration, sweep, closure

1. `.claude/context/navigation.md` §C Exploration Registry row.
2. `clients/encore/docs/MODULE_REGISTRY.md` + `REQUIREMENTS.md` updated for this tab's behaviours.
3. **Adjacent-Sweep ritual** — DO-NOW / SPAWN / APPEND with a grep-verified line item. Bare "out of
   scope" with no recipient = HALT and ask.
4. **File this tab's DEEP rows** into `plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md` — **create it
   if this is the first child to close.** LR-040(b): a deferral with no recipient file is a phantom
   hand-off and blocks closure. **If the grid was volume-class, its volume row is mandatory here.**
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
| **D-01** | Jira crossref skeleton (Status left `UNVERIFIED`) | T0 / `draft` | `grep -c '^| NM-' <crossref>` equals the bank count; every Status cell reads `UNVERIFIED` pre-fill | Any missing row, or a Status the worker filled itself = bounce | The parent's 22-row bank table | 100% — closed set of 2 (+4 if founding) |
| **D-02** | Old-site baseline walk (`OFF-REPO: yes`, `CLARIFY: yes`) | T2 / `walk` | Independent agent re-executes verbatim in `--mode edit` and pastes its own raw output; verdict diffs claims vs re-execution | Any divergence on a **classification-bearing** observation = bounce. **Any toggle mutation on the old site = instant bounce and a worker-profile lesson** | The new-site observation captured in the same session | Re-execute 100% of navigation steps + ≥3 field observations |
| **D-03** | Machine enumeration across 6 tab states | T1 / `walk` | `cross-check.mjs` → `CrossCheck: clean`; the location-row archetype resolves to a **non-zero** live match count AND collapsed (not thousands of individual rows) | 0-match archetype = **HALT, not bounce** — tooling defect (PLAN_75-TEMP §2). An uncollapsed archetype on a large grid = re-ticket, not accept | Sibling map `discount-optimization-2026-08-11.json` — the closest-analogue grid | 100% of the 6 states |
| **D-04** | Independent enumeration CONTROL (different provider than D-03) | T0 / `verify` | Claude diffs the two runs' element counts for one shared state | Counts differ at all = both runs suspect, investigate before dispositioning | D-03's own output for the same state | 1 state — proves the probe is not structurally blind |
| **D-05** | Bank trials (save-with-errors, discard-and-return) + beyond-bank toggle trials | T2 / `probe` | Each trial returns raw values — Save enabled state, **whether the network request fired**, the response status, post-reload toggle state; report ends `## END-OF-REPORT <N>` | Prose instead of a raw value, a missing END-OF-REPORT, or a "Save was allowed" claim with no captured request = bounce | NM-3253 / NM-3232 repro steps + the §2 boolean set Claude assigned | 100% of assigned trials, batches of ~2 for live save-tests |
| **D-06** | Volume reconnaissance + row-archetype confirmation | T1 / `probe` | Live row count captured once; archetype match count captured; both pasted raw | A row count reported without the raw capture = bounce | The sibling grid's documented 2154-row/no-pagination shape | 1 capture — it only needs to establish the order of magnitude |
| **D-07** | Header-effect probes, 4 controls × BEFORE/AFTER delta + the `countryId` precondition | T2 / `probe` | Each control returns a captured delta, not a description of one; the precondition probe captures the actual request query string | A control with no captured delta and no `DIFFERENTIAL-DATA-REQUIRED` tag = bounce | The parent's dependency-matrix hypothesis for the LOA column + NM-1681's endpoint contract | 100% — 4 controls + 1 precondition |
| **D-08** | **Blind Stage-3 re-drive** (LR-064) — a different worker, never shown the first worker's answers | T1 or T2 / `probe` | Re-drive output diffed against the originally cited evidence | Any contradiction = that disposition CANNOT close; escalate one tier | The first worker's raw evidence, withheld | `min(3, live-row count)` rows, randomly chosen by Claude |
| **D-09** | Selectors + page object | T2 / `build` | `check:step-labels`, `check:structural-names`, `typecheck` exit 0; zero `radix-`, zero `new Proxy(`, zero index-based row lookups, and no container-only ready-gate in the diff | Any non-zero exit or forbidden pattern = bounce | `selectors/discount-optimization/discount-optimization.ts` — the closest analogue, including its four documented hard rules | 100% machine-gated |
| **D-10** | Test-case MD + test plan + XLSX sheet | T2 / `draft` | `check:tc-parity`, `lint:testcases`, `xlsx:lint` exit 0; authored TC count equals Claude's case-list count | Count mismatch, or a `(QUICK)` marker on a `## TC-…:` heading = bounce | Claude's authored case list, pasted into the ticket's ACCEPTANCE | Claude spot-reads 3 random TCs against the inventory rows they claim to cover |
| **D-11** | Spec authoring | T2 / `build` | `npx playwright test --list` resolves every `TC-DSM-LOA-*`; `check:spec-quality` exits 0 on the working tree | Any unresolved ID or gate failure = bounce | The Phase-7 case list + `discount-optimization` spec house style | 100% machine-gated |
| **D-12** | Verification battery (all gates, one bundled ticket) | T0 / `verify` | `verify-run.mjs` JSON **`verdict` field** — never the exit code, never report prose. Commands tee'd with sha256, re-hashed and re-executed | `FABRICATED` = hard bounce with `reasons[]`. **`UNPROVABLE` = route to Claude, never auto-bounce** | The envelope manifest snapshotted pre-dispatch | 100% of gate commands |
| **D-13** | Cross-family adversarial review — the fight | T4 / `review`, `--mode edit` | Verdicts limited to `RE-DERIVED-CONFIRM` / `RE-DERIVED-REFUTE` / `ABSTAIN`; a seeded canary must be caught; worker DEFENDS before the result reaches Claude. **The reviewer is explicitly tasked to challenge a `none` Observations section** | Plain "AGREE", all-ABSTAIN, or a missed canary = INVALID review, bounce with no credit | Claude's claims table: each claim + its artifact path + the probe that produced it | Every material claim gets a claim-level status; confident claims attacked hardest |

**Not delegated — the quality floor** (full list in the parent's `## Delegation doctrine`). For this tab
the load-bearing ones are: whether a **null header effect** is real or a data gap; whether "Save was
allowed" is a **client or server** defect; the **LR-036 boolean-format verdict**; whether a `none`
Observations section on a never-walked surface is honest; the **volume-class deferral decision** (Gate 8);
every per-element disposition and `Coverage_Ratio` call; the §2/§3 taxonomy assignment; RCA verdicts; the
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
| HUNTER | Jira crossref · baseline · interaction map · walk evidence · field inventory · testid gap report | `clients/encore/specs_planning/_internal/jira-defect-crossref-discount-matrix-location-activation-<DATE>.md`<br>`clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-location-activation-<DATE>.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-discount-matrix-location-activation-<DATE>.md`<br>`clients/encore/specs_planning/_internal/field-inventories/discount-matrix-location-activation-<DATE>.md`<br>`clients/encore/specs_planning/_internal/testid-gap-reports/discount-matrix-location-activation-<DATE>.md`<br>`scripts/walk-coverage/interaction-maps/discount-matrix-location-activation-<DATE>.json` | `node scripts/check-interaction-coverage.mjs --file scripts/walk-coverage/interaction-maps/discount-matrix-location-activation-<DATE>.json` |
| GIVER | field-case catalog · test-case MD · test plan · XLSX workbook | `clients/encore/specs_planning/_internal/field-case-catalogs/discount-matrix-location-activation-<DATE>.md`<br>`clients/encore/specs_planning/test-cases/setup/discount-matrix/discount_matrix_location_activation_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/discount-matrix/discount_matrix_location_activation_test_plan.md`<br>`clients/encore/testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` |
| BUILDER | selectors · page object · test data · spec | `clients/encore/src/selectors/discount-matrix/location-activation.ts`<br>`clients/encore/src/pages/discount-matrix/location-activation.page.ts`<br>`clients/encore/src/data/discount-matrix/location-activation.ts`<br>`clients/encore/tests/discount-matrix/location-activation.spec.ts` | `npx playwright test --list` |
| HEALER | (none) — no pre-existing failing specs on this tab | (none) | (none) |
| WATCHDOG | completeness + header-effect + bank + volume-honesty findings | `clients/encore/specs_planning/_internal/audit-discount-matrix-location-activation-<DATE>.md` | `npm run check:spec-quality` |
| GARDENER | (none) | (none) | (none) |
| OWNER | registry *(founder-only)* · navigation · module registry · DEEP plan · parent annotation | `export_test_cases/module-codes.json`<br>`export_test_cases/types.ts`<br>`.claude/context/navigation.md`<br>`plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md`<br>`plans/pending/PLAN_DISCOUNT_MATRIX_AUTOMATION.md` | `npm run check:tc-parity` |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] NM-3342 confirmed closed before execution began, or a user-signed `## Deferral Authorization` recorded.
- [ ] Branch check ran — the `inputmode: decimal` signature rule is present, or was ported before any walk.
- [ ] **Volume reconnaissance ran before any ticket was sized**, and its row count is recorded.
- [ ] Phase 1 recorded FOUNDER or CONSUMER, and — if consumer — the 3-field × 4-check LR-013 spot-check log, or a `DRIFT_DETECTED` refresh.
- [ ] Jira crossref exists; both bank rows (+4 CRT if founding) carry a re-fetched status and a post-walk verdict; the baseline artifact carries `jira_tickets:`.
- [ ] The NM-1681 endpoint contract (`countryId` above 0) confirmed against a live network capture, not ticket text alone.
- [ ] NM-2221's business-rules attachment retrieved and summarised, or `businessRulesDoc: unavailable` with the reason.
- [ ] Baseline artifact exists with a `## Baseline diff` section, or an explicit `baselineScope: baseline-absent`. **No toggle was mutated on the old site.**
- [ ] Enumeration covers all 6 tab states; `Coverage_Ratio` 100%, `CrossCheck: clean`, opener frontier resolved (walked or `deferred-to-DEEP`).
- [ ] The location-row archetype resolved to a non-zero live match count **and collapsed**; the D-04 independent control agreed.
- [ ] Interaction map PASSES `check-interaction-coverage` — no `unclassified-element`, no `claim-census` residual.
- [ ] Walk evidence carries `## Observations` with both buckets filled or the literal `none` — **and if `none`, the Phase-9 interrogation of that claim is recorded.**
- [ ] **Phase 4 step 2 (looking beyond the 2-row bank) demonstrably happened** — the beyond-bank toggle trials are in the evidence artifact.
- [ ] **Both bank rows dispositioned** — named TC, documented not-applicable, or `/encore-questions` entry.
- [ ] **The NM-3253 finding distinguishes a permissive client from a permissive server** — the captured network request and response status are in the evidence.
- [ ] Every confirmed bug filed per LR-034 with `baselineComparison` + numbered `stepsToReproduce`, and has a required TC; every skip names its bug ID. No DOM/markup-accessibility finding filed as a bug.
- [ ] Every empty surface carries c.1 / c.2 / c.3, and the empty-state string is captured verbatim. The no-country-selected state is classified `by-design`, not left blank.
- [ ] Every zero-delta probe on a mandatory-effect class carries `DIFFERENTIAL-DATA-REQUIRED` with rung-1 and rung-2 evidence. **No case asserts the Currency / Business Tier / GAV no-op as expected behaviour without that evidence.**
- [ ] Every claimed row carries an `affordance:` token, `provenance: live`, and dated evidence; no inert verdict without a positive control.
- [ ] **The D-08 blind re-drive ran on `min(3, live-row count)` rows and contradicted nothing.**
- [ ] **Boolean render format MCP-proven independently for the `isActivated` toggle** (LR-036) — the sibling grid's `aria-checked` pattern treated as a lead, not an answer.
- [ ] **Volume honesty (Gate 8)** — if the grid is volume-class, the volume family is `deferred-to-DEEP` by name with a reason of at least 20 characters and appears in the DEEP recipient plan. No quietly reduced sample.
- [ ] Missing-testid report emitted with live-DOM evidence per element; nothing skipped for a missing testid.
- [ ] Axis-1 §2 set complete for every in-scope field, each Negative/BVA carrying the §2.1 oracle.
- [ ] Axis-2 L1 must-assert present per applicable §3 family, or `out-of-scope:<family>=<reason ≥20 chars>`.
- [ ] **Header-Effect block covers all four header controls** across re-drive / load-gate / dirty-state / no-cross-contamination, including the `countryId` above-0 precondition; the parent's dependency matrix LOA column updated with walked results.
- [ ] Row lookup is content-anchored by location name — zero index-based lookups; the ready-gate waits on a non-zero row count, never on the container.
- [ ] Every `deferred-to-DEEP` row names a specific element/launcher with a reason of at least 20 characters and no other classification token (G1).
- [ ] `Walk_Mode: quick` in the field inventory matches `CoverageMode: quick` here.
- [ ] This tab's DEEP rows are grep-verifiable line items in `plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md`.
- [ ] No `(QUICK)`/`(DEEP)` marker on any `## TC-…:` heading (ALL-091); no ticket ID in a structural name on a shippable path (LR-073); no internal jargon in shipped source (LR-058).
- [ ] `check:tc-parity`, `lint:testcases`, `xlsx:lint`, `check:step-labels`, `check:structural-names`, `typecheck` all exit 0.
- [ ] `npm run check:spec-quality` passes on the working tree before any done/green/verified claim.
- [ ] Suite green twice consecutively on office 1604; **every activation toggle restored to its original state.**
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
npx playwright test clients/encore/tests/discount-matrix/location-activation.spec.ts --retries=0
```

```bash
node scripts/check-interaction-coverage.mjs --self-test
```

---

## Handoff (post-execution)

The Location Activation tab is covered at QUICK depth: a machine denominator at 100% with every element
either claimed at full rigor or named in a DEEP deferral, a baseline verdict, and a manual-QA harvest that
deliberately went beyond its thin 2-row bank because a small bank means fewer eyes, not fewer defects.
Axis-1 covers the activation toggle and any filter with the rejection-affordance oracle; Axis-2 carries the
L1 must-asserts with volume deferred by name rather than sampled quietly; and the Header-Effect block
proves which header controls re-drive this tab, which provably do not, and that the documented
`countryId` precondition holds. If this subplan founded the shared registry and `CRT` band, its two
siblings can now run as consumers with a spot-check. The parent stays PENDING with its remaining children
outstanding — by design.
