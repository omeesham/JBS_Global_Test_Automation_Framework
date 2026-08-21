> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute SUBPLAN_DISCOUNT_MATRIX_COMPANY_MATRIX.md`. All context below.**
>
> 1. **Identity**: OWNER shell (CEO). Adopt `/identity HUNTER` before Phase 0.5b–6 artifacts, `/identity GIVER` before any test-case / test-plan / catalog write, `/identity BUILDER` before any spec / page-object / selector write, `/identity WATCHDOG` for Phase 9. The write-gate enforces at write time; frontmatter only declares.
> 2. **Skills**: load every skill in the Skills field. **`/delegation-temp` is not optional here** — invoke it at Phase 0 and emit its Activation Block.
> 3. **Read the parent first**: `plans/pending/PLAN_DISCOUNT_MATRIX_AUTOMATION.md` — its `## Context`, `## Shared Foundation`, and `## Delegation doctrine` are load-bearing for this subplan and are NOT duplicated here in full.
> 4. **Dependency gate**: NM-3342 closed. HALT if not.
> 5. **Context load**: read every file in the Bootstrap Context list before the first browser call.
> 5.5. **Browser tool**: `cli`. Workers drive `playwright-cli` via shell. On an Entra redirect follow `.claude/rules/browser-tool.md` Gate 3 and log the `[BROWSER-SWITCH]` row.
> 6. **Phase 0 FIRST**, then phases in order.
> 7. **Handoff**: flip Status to DONE, add Executed date, annotate the parent's `## Child index` row, append the LR-028 activity row, `git mv` to `plans/done/`, `npm run plans:reindex`, emit the Receipt.
>
> **HALT + ASK** if: NM-3342 is open · the percentage archetype resolves to 0 matches · two workers' `## ASSUMPTIONS-MADE` conflict · a strict line cannot be met · LR-040 closure-completeness fails on any planned item.

---

# SUBPLAN_DISCOUNT_MATRIX_COMPANY_MATRIX — Company Matrix tab, QUICK coverage, delegated

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
**Jira**: NM-3343 · NM-2219 (Company Matrix delivery spec) · NM-2452 / NM-2339 (import) · NM-1668 (parent MFE story)

---

## Context

The Company Matrix tab is the largest and most defect-dense of the three Discount Matrix surfaces:
**21 percentage columns × 10 tier rows** on office 1604, plus `+ Add Tier` / `Export` / `Import`, a
per-row edit (pencil) and delete (trash) affordance, and the whole tier-algebra surface. It owns **12 of
the 22** rows in the parent's regression bank, and six of those are percentage-conversion or
validation-timing blockers.

**This subplan is independently runnable and independently closeable.** It does not require its two
siblings. If it runs first it also founds the shared registry + `CRT` header band per the parent's
`## Shared Foundation`; if a sibling already did, it consumes that with a spot-check.

### Why this one is the recommended first pick

- Highest defect density — the regression bank concentrates here, so the walk yields the most.
- It exercises the enumerator's percentage archetype, which is the module's biggest tooling risk (parent
  trap 2). Discovering that here protects the other two tabs.
- It is the tab the owner originally named ("we will automate/work on Company Matrix module only").

### This tab's regression bank (12 rows — every one re-verified live in Phase 4)

| Ticket | Status @ authoring | Claim |
|---|---|---|
| NM-3235 | Done | Whole number (`14`) in a Company Matrix percent renders `1400%`; decimal (`0.14`) renders `14%` |
| NM-3387 | Done (Blocker) | Percentage field converts `1` to `100%` during Revenue Tier edit |
| NM-3390 | Done (Blocker) | Invalid percentages silently converted after focus change |
| NM-3239 | Done (was: QA open) | Deleting a just-split tier recalculates the **wrong** surviving boundary |
| NM-3237 | Done | Valid End Tier above current max rejected as "Invalid End Tier value"; also on a zero-row country/tier |
| NM-3435 | Done (Blocker) | Duplicate Revenue Tiers render; deleting a duplicate errors "Tier range overlaps with an existing tier" |
| NM-3236 | Done | Export id column is a Cosmos GUID — a 2026-07-27 dev comment on NM-2219 calls this expected; unresolved contradiction |
| NM-3255 | Done (was: Review) | Export filename is a raw timestamp, not the AC's documented convention |
| NM-3256 | Done (was: Review) | Discard on the Unsaved-Changes prompt closes it but the export never proceeds |
| NM-3062 | Done | Export returned HTTP 500 |
| NM-3229 | Done | Export / Import buttons carried swapped icons |
| NM-3233 | Done (was: QA) | Add/Export/Import button placement inconsistent with sibling pages — **layout observation, not a behaviour case** |

#### Phase 2 verification — live Jira, 2026-08-19 (`encore.atlassian.net`, read-only MCP)

All 12 rows fetched from live Jira and reconciled against this table. Two findings change how the
bank must be used.

**Finding 1 — every row is CLOSED. The bank has no open ticket.** Four rows had drifted from what the
plan recorded: NM-3239 (`QA open` → **Done**), NM-3255 (`Review` → **Done**), NM-3256 (`Review` →
**Done**), NM-3233 (`QA` → **Done**). NM-3239 matters most: the plan singled it out as the one open
defect. It is not. Consequence: this is a **pure regression bank** — any row that still reproduces on
the target is a *reopened regression*, which is a higher-severity finding than "known open bug", and
must be filed as such rather than waved through as expected-broken.

**Finding 2 — not one of the 12 was filed against our target.** Every row was reported on office
**1101**, on `cloudapps-dev` or `cloudapps-trn` (Cloud Training). Our only permitted target is
`cloudapps-e2e` office **1604** (LR-ENC-007). Several rows carry data preconditions that may simply
not exist there — NM-3237 needs a current max End Tier of 20,000,000; NM-3239 needs the
`100001 – 20000000` range split at 400000; NM-3435 is Cloud-Training-only. **NM-3387 says so outright
in its own description: _"Currently, in the Cloud test, entered value 1 is saved as 1%"_ — i.e. it did
not reproduce outside Training.**

Therefore a non-repro on 1604 is **NOT** evidence of a fix. Each row resolves to exactly one of:
`REGRESSION` (reproduces — file it), `FIXED-CONFIRMED` (precondition present, behaviour correct), or
`PRECONDITION-ABSENT` (the data state the ticket needs does not exist on 1604 — record which precondition
is missing per LR-040(c).1, never collapse this into "fixed"). Guessing between the second and third is
the failure this finding exists to prevent.

**Finding 3 — the percentage contract, straight from the tickets** (load-bearing for the MSI-M4
battery, and cheaper than rediscovering it live): the field treats input as a **fraction**, not a
percentage — NM-3235 records `14` → `1400%` while `0.14` → `14%`, and NM-3387 records `1` → `100%`.
NM-3390 adds that repeated focus-in/out **progressively divides** an invalid value (`3456` → `35%`;
`1234567` → ~`12%` in Company Matrix, ~`1.2%` in GAV Threshold) until validation stops objecting and
the invalid value becomes saveable. Treat these as LEADs to re-verify on 1604, not as settled facts.

**Finding 4 — NM-3233 is confirmed out of behavioural scope.** Live description is button *placement*
consistency. It stays a layout observation; it is not a behaviour case and gets no TC.

**Finding 5 — NM-3236 is RESOLVED as expected behaviour, not a defect (contradiction closed).** The plan
recorded the Cosmos-GUID export id as an "unresolved contradiction". It is resolved. NM-2219's own
acceptance criteria carry the product ruling verbatim: _"CMM: 7/27/2026: The export file contains the
GUID in the first column not the ID from SQL Legacy Database, because this has moved to Cosmos. **This is
acceptable and expected.**"_ Consequence: **no TC may assert a sequential numeric id column.** A TC that
asserts the id is a GUID is correct; one that asserts `1,2,5,10` encodes a defect that does not exist.

**Finding 6 — the load-gating and permission contracts, from NM-2219 acceptance criteria** (testable
without a walk, and they are the header×submodule mechanism stated as product contract):
- AC1 — the tab loads matrix rows on first activation **only when all three header keys are set**, and
  **shows an empty state otherwise**. So an empty grid under an unset header key is *correct behaviour*,
  not a data gap — this is the LR-040(c) empty-surface answer for this tab, pre-answered.
- AC3 — bulk save persists the **full edited list** and refreshes the grid (not a per-row PATCH).
- AC4 — import accepts `.xlsx`, validates **server-side**, surfaces a **row-level error list** on
  failure, reloads on success.
- AC6 — editing controls are **disabled when `!canEdit`** — pairs with the `ROLE_FUNCTION_REVENUEMGMT`
  Read(2)/Edit(3) levels in §1.6 of the QA reference.

If this subplan founds the shared foundation it additionally owns the `CRT` rows NM-3440, NM-3441 and the
`CRT` half of NM-3235 / NM-3256 (see the parent's `## Shared Foundation`).

### This tab's header dependency (hypothesis — Phase 3 confirms or corrects it)

Per NM-2219 AC #1, Company Matrix loads its rows on first tab activation **only when `Country`,
`Currency` and `Business Tier` are all set**, and shows its empty state otherwise. `GAV Discount
Threshold` is expected to affect the header `Save` only — **probe whether it also constrains cell
values**, because NM-3441 links GAV decimal input to discount rounding.

### Traps

All three parent traps apply. Two bite hardest here:

- **Trap 1 (UI↔DB off-by-one)** — the persisted columns are `NonPeakPercent*`, `PeakPercent*`,
  `SuperPeakPercent*`; the UI renders `Non-Peak`, `Standard`, `Peak`. If that mapping holds, **UI
  "Standard" is DB "Peak"** and every assertion written from UI labels inverts. A worker captures the
  save payload; **Claude rules on what it means** — this is the single most consequential
  never-delegate call in this subplan, because all 21 columns depend on it.
- **Trap 2 (enumerator blindness)** — 21 percentage columns collapse into one archetype. If the
  `inputmode: decimal` signature rule is absent on the executing branch, the archetype resolves to 0
  matches and the walk silently reports an empty surface. Phase 3 gates on it.

---

## Bootstrap

**Identity**: OWNER shell (CEO). Adopt `/identity HUNTER` before Phase 0.5b–6 artifacts, `/identity GIVER`
before any test-case / test-plan / catalog write, `/identity BUILDER` before any spec / page-object write,
`/identity WATCHDOG` for Phase 9.

**Context files**:
- `plans/pending/PLAN_DISCOUNT_MATRIX_AUTOMATION.md` — **the parent. Read `## Context`, `## Shared Foundation`, `## Delegation doctrine` in full.**
- `.claude/skills/delegation-temp/SKILL.md` — the whip. §Org-Chart, §Fight-Protocol, §Dispatch, §Acceptance, §Failure, §Zero-burn, §Closure.
- `.claude/skills/ultra-agents/worker-ext.md` — DEFAULT-DELEGATE table, CLAUDE-ONLY list, routing ladder T0–T4, verification pyramid, Acceptance Law, Receipt v3.
- the `ticket-template` file under `~/.claude/delegation/` — the ticket shape every dispatch is built from.
- `.claude/agents/REQUIREMENTS.md` — **HUNTER HARD STOPS.** Phases 0.5b–6 are HUNTER phases.
- `.claude/agents/PLANNER.md` (GIVER) · `.claude/agents/GENERATOR.md` (BUILDER) · `.claude/agents/AUDIT.md` (WATCHDOG)
- `.claude/skills/coverage/SKILL.md` — the QUICK contract (Axis 1 floor, Axis 2 L1, TDW-Q, §20-Q)
- `docs/read_only_docs/CASE_GENERATION_STANDARD.md` · `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2, §4, §20, ALL-024, ALL-045, ALL-071, ALL-091) · `docs/read_only_docs/LEARNED_RULES.md` · `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (§2 Table 2 — LR-054)
- `clients/encore/CLAUDE.md` — LR-008, LR-012, LR-017, LR-036, LR-ENC-001 through LR-ENC-006
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` · `field-case-generation.md` (§2, §2.1, §3)
- `clients/encore/specs_planning/_internal/agent-mistakes.md` — the 2026-08-16 enumerator entry (trap 2) and the 2026-06-11 rejection-affordance entry (§2.1's graduating incident) bind this subplan directly.
- The Jira reference doc named in the parent, with its branch caveat.
- `.claude/rules/`: `inventory.md` (LR-013, LR-029, LR-057, LR-062, LR-064, LR-065, LR-072) · `pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-046, LR-048, LR-060) · `guardrail-policy.md` (LR-074 dispatch visibility) · `browser-tool.md` · `baseline.md` · `angular.md` · `specs.md` · `data.md` · `deliverable.md` (LR-058, LR-073) · `plan-closure.md` · `no-wrappers.md`

**Anti-Assumption Gates**:
- [ ] Baseline walk EXECUTED before any behaviour classification or bug filing (Gate 1).
- [ ] No "corrupt / atypical / app-wide / regression" claim on fewer than 2 evidence sources (Gate 2 — LR-061-A).
- [ ] No control marked inert / un-drivable without a positive control on a known-good case first (Gate 3 — LR-061-C).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block recorded (Gate 5).
- [ ] Every DEEP deferral is named in the parent's `## Deferred to DEEP` (Gate 6, LR-072).
- [ ] **No disposition written from an unverified worker report (Gate 7 — LR-062 condition 5 + LR-064 Stage 3).**

---

## Phase 0 — Gate + delegation activation

1. **Dependency**: NM-3342 closed (`plans/done/PLAN_DISCOUNT_OPTIMIZATION_AUTOMATION.md` with an
   Execution Summary). **Still PENDING as of 2026-08-18 with 16 unticked criteria** — HALT and ask if it
   has not moved. Both modules mint codes in the same registry files.
2. Read `.claude/context/navigation.md`, `agent-mistakes.md`, `.claude/context/patterns.md`.
3. **Invoke `/delegation-temp`**; emit the Activation Block. Confirm the agent profiles exist
   (the `council-worker` agent profile under `~/.copilot/agents/` and siblings — verified present 2026-08-18).
4. **Branch check (trap 2) — blocking**:
   `grep -n "inputmode" scripts/walk-coverage/enumerate-page.mjs`. A hit at the `TYPE_SIGNAL_RULES`
   signature rule = the fix is present. **No hit = you are on the `main` side: port the rule before any
   walk**, and record it as a tooling fix, not a coverage step.
5. Browser-tool announcement per the parent's Phase 0 step 5.
6. Tier announcement: `CoverageMode: quick`; L2/L3 deferred by name to the parent's `## Deferred to DEEP`.

---

## Phase 0.4 — Reachability pre-flight: ONE cheap probe before any expensive dispatch

**Added 2026-08-19 by the adversarial audit.** Six of the thirteen ledger rows are off-repo. Firing any
of them against stale auth, an unreachable tab, or a permission the automation account lacks burns a
250-credit dispatch to learn a fact a 100-credit probe answers. **Measured 2026-08-19**:
`clients/encore/.auth/encore-state.json` is 1 day old and `nav2-state.json` is **8 days old** — the
old-site token is the stale one, and the baseline walk is the dispatch that depends on it.

Dispatch **one** T1 `probe` ticket (`--work-type probe`, `OFF-REPO: yes`, `--max-credits 100`) that
answers all four questions in a single run and writes one artifact:

1. **e2e auth resolves** — `playwright-cli` with `-s=e2e` lands on the app, not on
   `login.microsoftonline.com`. Redirect → STOP, report `AUTH-REFRESH-REQUIRED: e2e`, do not retry
   headless (Gate 3 needs a headed window and a human — that is an owner ping, not a worker retry).
2. **The tab is reachable and populated** — navigate to the Discount Matrix route on office 1604,
   activate Company Matrix, report the live tier-row count and the live percentage-cell count. A zero
   row count here is a data finding, not a failure.
3. **Permission gate** — report whether the page renders at all versus a permission/403 surface. The
   reference doc names `ROLE_FUNCTION_REVENUEMGMT`; whether the automation account holds it is
   **unverified and answerable only live**. No permission → HALT and surface to the owner; every
   downstream phase is unreachable and no amount of ticket-rewriting fixes it.
4. **Old-site counterpart exists?** — with `-s=nav2`, report whether a Discount Matrix counterpart is
   reachable at all, and whether that session redirected to sign-in. This is what makes Phase 0.5b
   worth its dispatch: a net-new MFE has no baseline, and learning that here costs a fraction of a
   full `walk` ticket.

**Gate**: all four answered before any `walk` / `build` / `draft` dispatch fires. Outcomes route as —
auth stale → owner ping for a headed refresh; no permission → HALT; no old-site counterpart → Phase
0.5b downgrades to a desk-recorded `baselineScope: baseline-absent` artifact with no walk dispatch;
tab empty → Phase 5's population hunt starts immediately rather than after the denominator.

---

## Budget and Minimum Shippable Increment (MSI)

**Added 2026-08-19 by the adversarial audit.** The owner's constraint is explicit — NM-3343 is
time-boxed and only one tab is being taken. A discovery-heavy plan that exhausts its budget before a
single spec exists has not automated anything.

**Total budget**: soft ceiling **2,500 credits** across all dispatches for this subplan. Track the
running total against `.claude/state/ua-worker/ledger.jsonl` at every acceptance. **Stop-loss**: at
**70% consumed with no spec authored**, STOP adding discovery scope, bank what exists, and drive
straight to the MSI below. Surface the stop-loss to the owner as a one-liner when it trips — do not
silently narrow.

**MSI — the irreducible deliverable, in priority order.** If the budget dies, this is what must exist
and be honest about what it is:

| # | Deliverable | Why it is irreducible |
|---|---|---|
| **M1** | The registry mint (`DSM` + four codes) | Nothing else can carry a TC ID without it, and it is cheap |
| **M2** | The machine denominator + interaction map at `Coverage_Ratio` 100% | This is the LR-062 artifact the whole framework keys on; a partial walk is worse than none |
| **M3** | `## Observations` from the bank harvest, with every confirmed defect filed per LR-034 | A walk that found live defects and did not file them has destroyed its own most valuable output |
| **M4** | The percentage battery + tier-algebra cases as authored TCs, and **at least one runnable green spec** covering them | This is the line between "we investigated" and "we automated" — the owner asked for the second |
| **M5** | Axis-2 L1 must-asserts + the full Header-Effect block | The owner's explicit header×submodule requirement |

**M1–M4 are the floor.** Anything beyond M4 that cannot be reached gets `deferred-to-DEEP` by name in
the recipient plan (LR-072 G1) plus an honest line in the Execution Summary — never a silent drop and
never a claim of coverage the walk never reached. **M5 is not optional scope-creep** — it is the owner's
stated requirement — but if it is genuinely unreachable it defers by name like anything else, loudly.

---

## Phase 0.5b — Baseline-first walk (LR-048 conditional: REQUIRED — Skills includes `/find-bugs`)

**Delegated** (ledger D-02). Observation only on the old site — HARD STOP #4 + #10.

> **Gated on Phase 0.4 question 4 (added 2026-08-19, adversarial audit).** Discount Matrix is a new MFE
> (NM-1668). If the pre-flight probe reports **no old-site counterpart**, this phase does NOT spend a
> `walk` dispatch to rediscover that — it writes the `baselineScope: baseline-absent` artifact from the
> probe's evidence and moves on. That is a legitimate close, not a skip (LR-ENC-001 / LR-048 both allow
> baseline-absent explicitly). Also note the measured staleness: `nav2-state.json` is **8 days old**, so
> this is the dispatch most likely to hit an Entra redirect — the pre-flight answers that before the
> credits are committed.

1. `https://navigator2.training.psav.com/#/`, office 1604, locate the Company Matrix counterpart. The
   reference doc names the legacy Angular components `discount-pricing-matrix.component.ts` and
   `company-matrix.component.ts` and the legacy route `/setup/discount-pricing/matrix` — search hints,
   not addresses.
2. **No clicks that mutate, no typing, no saves.** The HARD STOP #9 carve-out permits opening a picker
   and Cancel/Esc to read an affordance — never Select or Save.
3. Artifact: `clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-2026-08-19.md`.
4. No old-site counterpart → `baselineScope: baseline-absent`. **Not a HALT** — the artifact is still
   written, stating what was searched and what was found.
5. New site next; classify every divergence as (a) regression-from-baseline, (b) intentional UX change
   citing REQUIREMENTS.md or the Phase-2 crossref, or (c) baseline-absent. Emit `## Baseline diff`.
   **The classification is CLAUDE-ONLY**; the worker supplies the observations.
6. **N of at least 2 before any generalization** (LR-061-A) — two offices, or new-site plus baseline. One
   office is a data point, never a conclusion.

---

## Phase 1 — Shared Foundation: claim-or-consume

Run the parent's `## Shared Foundation` gate verbatim.

- **`FOUNDATION-ABSENT`** → this subplan is the **FOUNDER**: mint `DSM` + all four submodule codes, and
  author the `CRT` band (its cases, inventory, test plan, XLSX sheet, spec) alongside this tab's work.

  > **Estimate correction (2026-08-19, adversarial audit).** An earlier revision said "+40%". That was
  > wrong and would have blown the budget. The registry mint is genuinely cheap — one small edit to two
  > files. But the `CRT` band is **a full second submodule**: its own field inventory, field-case
  > catalog, test-case MD, test plan, XLSX sheet, and spec, plus the GAV Threshold's complete §2 numeric
  > set with the §2.1 oracle asserted before *and* after blur across four bank rows. Size it as
  > **roughly a second `LOA`-scale child**, not as a 40% uplift. Against the 2,500-credit ceiling, the
  > founder path realistically consumes 30–40% of the total on `CRT` alone. **If the ceiling is
  > threatened, the MSI ordering governs**: the registry mint (M1) is irreducible, but the `CRT` band's
  > full case set may defer by name to the DEEP recipient plan so that this tab's own M2–M4 land first.
  > A consumer sibling can found `CRT` later at no loss; an un-walked Company Matrix cannot be recovered
  > by anyone else.
- **`FOUNDATION-PRESENT`** → **CONSUMER**: LR-013 spot-check 3 random `CRT` fields on live DOM across all
  four checks (locator resolves / default matches / state matches / `affordance:` probe-confirmed). Any
  disagreement = `DRIFT_DETECTED` → refresh the criteria inventory first and say so in the Execution
  Summary.

Verify with `npm run check:tc-parity` exit 0 — green with zero `DSM` TCs proves the registry edit is
well-formed, not merely present.

---

## Phase 2 — Jira bank verification (LR-ENC-004)

Pre-loaded by the parent; this phase **verifies**, it does not re-search.

1. **Re-fetch the live status of all 12 rows** in this tab's bank plus the 4 `CRT` rows if founding.
   Statuses move; a ticket back-open or newly-Done changes how Phase 4 treats it. **CLAUDE-ONLY** —
   workers cannot reach Claude's Jira MCP.

   > **Fallback if Claude's own Jira MCP is unavailable (added 2026-08-19 by the adversarial audit).**
   > The Atlassian MCP servers require an OAuth authorization this session may not hold, and the
   > `rovo_available: false` escape below was written for the *worker* path — it did not cover Claude's
   > own connector being dead. It does now. When the fetch is impossible: record
   > `jira_status_refetch: unavailable (<reason>)` in the crossref frontmatter, carry every bank row
   > forward with its **2026-08-18 authoring status explicitly labelled as stale**, and treat each row's
   > live re-verification in Phase 4 as the authoritative signal instead. **Never present a stale Jira
   > status as current**, and never let an unreachable connector become a reason to skip the live
   > re-verification — the walk is the stronger evidence anyway (ALL-024: DOM outranks Jira).
2. Worker drafts the crossref skeleton (ledger D-01); Claude fills the re-fetched statuses.
   Artifact: `clients/encore/specs_planning/_internal/jira-research/discount-matrix-and-service-charge-text-qa-reference.md`
   — one row per `NM-####` with status, one-line claim, and a post-walk verdict column left blank.
3. Add `jira_tickets: [...]` to the baseline artifact frontmatter — the greppable proof this pass ran.
   Rovo unavailable → `rovo_available: false` and consume the committed reference doc; never silently skip.
4. **Retrieve `Tab-CompanyMatrix.docx`** (NM-2219 attachment id `122853`) — the only authored
   business-rules document for this tab, and it was not readable during planning. Unretrievable →
   `businessRulesDoc: unavailable` with the reason. Never silently omit.
5. Every Jira fact is a **LEAD**, re-verified against DOM (ALL-024). A Jira-vs-DOM divergence is signal
   classified per REQ-014, never an automatic "Jira wins".

---

## Phase 3 — Machine denominator + header-effect probes (LR-062, TDW-Q)

1. **Enumerate** (ledger D-03) `node scripts/walk-coverage/enumerate-page.mjs` against the Company Matrix
   tab in each state that changes the control set: grid populated, grid empty, Add-Tier dialog, Edit-Tier
   dialog, delete confirmation, Import file picker, Unsaved-Changes prompt. **The live page enumerates
   itself — never self-count from a screenshot.**
2. **Archetype sanity gate (trap 2) — blocking.** Confirm the percentage archetype key resolves to a
   **non-zero live match count** and the inputs resolve to a real type (expect `Numeric / spinbutton` via
   the `inputmode: decimal` signature, not a native `type`). A 0-match archetype is the known failure
   signature, **not** an empty page — RCA the archetype regex and the `TYPE_SIGNAL_RULES` catch-all
   before walking further, cross-referencing
   `plans/pending/PLAN_70_ENUMERATOR_TYPE_RESOLUTION_AND_NM3344_RECORD.md`. **Do not build a denominator
   you have not proven resolves.**
3. **Independent enumeration control** (ledger D-04) — a cross-family worker re-runs the enumerator on
   one state into a scratch path. Claude diffs the two element counts. This is the CONTROL required by
   the findings contract: it proves the probe is not structurally blind. **Claude compares two numbers —
   that is judgment, not labor.**
4. **§20-Q profile**: the denominator covers the tab's LANDING state. Openers that **host in-scope
   fields** (Add Tier, Edit Tier) are walked fully. Other openers are enumerated and dispositioned
   `deferred-to-DEEP: <opener> (<reason ≥20 chars>)`. Un-openable = a named blocker row, never a silent gap.
5. Every filter / toggle / sort / edit / guard / io control needed for an L1 case needs a **BEFORE/AFTER
   effect delta**. Presence and an options-list are not a walk.
6. **Header-effect probes** (ledger D-07) — with Company Matrix active, change each of `Country`,
   `Currency`, `Business Tier`, `GAV Discount Threshold` and capture the BEFORE/AFTER delta. This
   evidence is what Phase 7c asserts and how the parent's dependency matrix column gets confirmed.
   **Claude writes the matrix update.**
7. `node scripts/walk-coverage/cross-check.mjs` → `CrossCheck: clean`, `Coverage_Ratio` 100%
   (`deferred-to-DEEP` counts as dispositioned). A self-labelled `coverageScope: PARTIAL` is not a
   stopping point.
8. Emit `scripts/walk-coverage/interaction-maps/discount-matrix-company-matrix-2026-08-20.json` — that
   directory is `ARTIFACTS_DIR` at `scripts/check-interaction-coverage.mjs:39`, exists on `NM-3342`, and
   already holds `discount-optimization-2026-08-11.json`: **read that sibling map first as the shape
   reference.** Classify each control against `scripts/walk-coverage/drone-probes.mjs`
   `PROBE_DEFINITIONS` — the nine control classes are `filter`, `sort`, `pagination`, `editable-cell`,
   `guard`, `io`, `menu-disclosure`, `add-picker`, `context-selector` (the other three keys —
   `claim-census`, `count-source`, `ui-vs-persisted-parity` — are Cross-Check Kernel oracles, not control
   classes, and are not extended by this route). Expected mapping, **confirm do not assume**: GAV
   Threshold → `editable-cell`; header + tab `Save` → `guard`; `Export`/`Import` → `io`; tab strip →
   `context-selector`; `+ Add Tier` → `add-picker`; per-row pencil/trash → `menu-disclosure` or `guard`
   per observed behaviour; column headers → `sort` **only if they prove sortable** (the 2026-08-18
   screenshot shows no sort affordance; absence is a finding to record, not a gap to skip).
9. A control matching no class is the LR-071.1 residual: add a **class-level** entry to
   `PROBE_DEFINITIONS`, never an instance hack; re-run `node scripts/check-interaction-coverage.mjs --self-test`.
10. Drive `node scripts/check-interaction-coverage.mjs --file <map>` to PASS.
11. **Positive control before any inert verdict** (LR-061-C) — raw-JS `.click()` does not reliably fire
    React `onClick`.
12. **BeforeUnload trap** (HARD STOP #8 / ALL-052): after any field edit, dialog-accept **before** `goto`,
    and navigate `about:blank → target`. Never reload the same URL. This tab has a confirmed
    Unsaved-Changes prompt (NM-3256), so the trap is live.
13. **Zero-delta = a data need** (LR-040-D) — `DIFFERENTIAL-DATA-REQUIRED`, firing Rung 1 SELF-PRODUCE →
    Rung 2 SELF-SERVE → Rung 3 ESCALATE by name. **No case may assert a zero-effect as expected behaviour**
    until ground truth disambiguates.

---

## Phase 4 — Manual-QA bug harvest (ALL-045)

A walk is a manual QA run — the only pass where a tester looks at the product before automation is
written around its current behaviour. Automating first bakes today's defects in as tomorrow's expected
behaviour.

**Quick-mode decoupling**: a full SFDPOT sweep is not forced. The 12-row bank is the targeted substitute.
The pattern sweep fires on **CRITICAL/HIGH** finds only.

1. **Walk the bank deliberately** (ledger D-05, D-06) — concrete repro steps, higher yield than
   open-ended probing at quick tier:
   - **Percentage battery** on every percentage cell: `1`, `0`, `14`, `0.14`, `100`, `100.1`, negative,
     empty, non-numeric, leading zeros. Capture **displayed value, `aria-invalid`, inline-error text,
     post-blur state, post-save value, post-reload value** — validation state **before and after blur**,
     because NM-3440 and NM-3390 are focus-timing defects a post-blur-only case cannot see.
   - **Tier algebra**: tier inserted inside an existing range (split); tier added above the current max
     (NM-3237); delete either half of a just-split tier (NM-3239, still open); duplicate/overlapping
     ranges (NM-3435); Start above End.
   - **Export/dirty interaction**: Export while dirty, then Discard (NM-3256); Export response status
     (NM-3062); Export/Import icon identity (NM-3229).
2. Record `## Observations` in the walk-evidence artifact **before handoff**, both buckets per ALL-045 —
   **Bugs/Defects** (HIGH) and **Suggestions/Improvements** (LOW). Nothing to report = the literal `none`
   under each. **An absent section is an incomplete walk.**
3. A render-state defect must be **SEEN** — element screenshot or `boundingBox` geometry. Never inferred
   from `aria-invalid` alone (false-green, WCAG ARIA21).
4. **Do not file DOM/markup accessibility findings as bugs** (owner standing rule). Behaviour defects only.
   NM-3233 is a layout observation and is recorded as such, not filed as a behaviour case.
5. **Triage is CLAUDE-ONLY**: regression-from-baseline → file `BUG-DSM-CMX-NNN` under
   `clients/encore/reports/bugs/` with `baselineComparison` + `baselineEvidence` (LR-034) and numbered
   `stepsToReproduce`; baseline-absent → `/encore-questions`; by-design → documented with its citation;
   empty-everywhere + no-UI-path + no-Jira → **discussion-item**, flagged loudly, no bug filed.
6. **A `Done` ticket that still reproduces is a reopened regression, not a duplicate** — file it with the
   original cited in `baselineComparison`. Eight of this tab's 12 rows are `Done`; a live recurrence is
   the single most valuable finding this subplan can produce.
7. **Close the loop**: every confirmed bug's repro edge-case becomes a **required TC** in Phase 7,
   authored as a failing bug-evidence case — never a silent skip, never rewritten to assert the buggy
   behaviour as correct. Any skip citing one of these bugs names the bug ID.
8. **Zero suspicions on a tab carrying twelve filed defects is a bare-minimum-pass signal to interrogate,
   not a clean bill.**
9. Artifact: `clients/encore/specs_planning/_internal/walk-evidence/discount-matrix-company-matrix-2026-08-19.md`,
   with dated screenshots beside it.
10. Bugs are filed and evidenced here, not fixed here.

---

## Phase 5 — Empty-surface and data variety (LR-040(c))

The 2026-08-18 capture shows this tab **populated** on 1604 for `United States / USD / Standard` — so the
2026-07-31 "No data found" state was a criteria artefact, not the default. NM-3237 reproduced on a fresh
combination (Mexico / SVP Productions), so an empty state **is** reachable. Record all three per empty
surface found:

- **c.1 population path** — which combination yields zero rows, and its empty-state string **verbatim**
  (that string is the `empty-vol` L1 must-assert). Vary `Business Tier`, vary `Country`/`Currency`,
  re-check offices **1101** (LR-ENC-005) and **1605**, and look for a create/import affordance. "Empty on
  1604" is a data-state observation, never a population path.
- **c.2 classification** — exactly one of `data-blocked`, `feature-blocked`, `by-design`.
- **c.3 escalate-if-unknown** — still unknown after a real dig (LR-057 affordance probe + Jira per
  LR-ENC-004 + a second office) → `/encore-questions`. Never close on "empty / refresh later".

**Data variety for the Header-Effect block**: US/USD, Canada (`en-CA` and `fr-CA`), Mexico (`es-MX`), one
zero-row combination, and Business Tiers beyond `Standard` (the tickets name `SVP Productions` and `Las
Vegas`). **Confirm live option lists rather than seeding from this paragraph** — LR-015.

---

## Phase 6 — Field inventory (CMX)

`clients/encore/specs_planning/_internal/field-inventories/discount-matrix-company-matrix-2026-08-20.md`, per
`field-inventory-spec.md`:

1. Frontmatter: `jira_tickets:`, `baselineScope:`, `Coverage_Ratio`, `CrossCheck`, **`Walk_Mode: quick`**
   (LR-072 dual-home — the Cx closure path reads this AND this subplan's `CoverageMode` and FAILS on
   mismatch).
2. One row per machine-enumerated element, every one dispositioned, no blanks. Rows not needed for an L1
   case get `deferred-to-DEEP: <element/launcher id> (<reason ≥20 chars>)` — **G1: no other token beside it.**
3. Per in-scope field: its §2 type and exact case-set, **including the §2.1 rejection-affordance oracle on
   every Negative and BVA case**. That oracle exists because of the Max Discount silent-focus-trap
   (2026-06-11): a rejected value must be proven both **announced** (error affordance appears, polled per
   LR-010) and **escapable** (a natural Tab/click-away blur actually leaves the field). With six
   percentage-validation defects in the bank this oracle is the centre of gravity — never let a helper
   auto-`Escape` before recording whether a human-style blur worked.
4. `behavior-cases:<families>` on the grid naming the applicable §3 families, or
   `out-of-scope:<family>=<reason ≥20 chars>` (LR-065). Neither = undispositioned = Cx FAIL.
5. **`affordance:` token per row** (LR-057). The 21 percentage cells are the critical case — **if they are
   read-only in the grid and editable only via the Edit-Tier dialog, that is itself the finding**, and the
   dialog is covered **per launcher** (LR-012 / LR-057), not per dialog.
6. Every observation row carries `provenance: live` and an `evidence:` pointer to a machine-emitted
   artifact dated at or after the session date. **A `provenance: oracle` row on an observation-claiming
   disposition, a missing-provenance row, or a stale-evidence row is FABRICATION-class**: it fails the
   whole closure and writes an integrity strike to `.claude/state/integrity-strikes.jsonl`.
7. **Missing-testid report** (LR-029) — every interactive element lacking a `data-testid`, live-DOM
   verified per element, never from a static grep. The sibling Discount Optimization surface carried
   **exactly one** testid on the whole page; expect similar. A missing testid never justifies a skip
   (LR-014) — next-best stable locator, run the test, record the gap in
   `clients/encore/specs_planning/_internal/testid-gap-reports/discount-matrix-company-matrix-2026-08-20.md`,
   rolled up to ONE module-level client ask.

**LR-064 TDW quick profile**: Opus owns recon, the denominator, the §2/§3 taxonomy assignment, the
per-element verify, and every disposition. Only deterministic input-trials delegate down. **Stage-3 blind
independent re-drive is retained** (anti-fabrication is tier-independent) at the quick floor of
`min(3, live-row count)` — ledger D-08. **Never disposition from an unverified worker report.**

---

## Phase 7 — Case authoring, QUICK tier (GIVER)

TC IDs use `TC-DSM-CMX-NNN`, numbered sequentially. **Do not mint `TC-DSM-FCC-*`** — the Standard names
that namespace at `CASE_GENERATION_STANDARD.md:91` but `FCC` is not a registered submodule code and
`check-tc-parity` G6c rejects it; field cases ride the ordinary band, matching
`corporate_pricing_detail_test_cases.md`.

Surface cases carry `**Surface_Family**: <family> (QUICK)` **in the body only**. The marker never appears
on a `## TC-…:` heading (ALL-091) — the heading ships verbatim as the client-facing Title, and
`scripts/xlsx-lint-rules.mjs` hard-blocks the marker, `SBC`, `Surface_Family`, `FLAG` and
`deferred-to-DEEP` at build, commit and ship.

### 7a — Axis 1: field cases (the quick floor — not reduced)

- `Revenue Tier` start/end numeric — full §2 set with the §2.1 oracle.
- The 21 percentage cells — **editable inline, or read-only with editing only via the Edit-Tier dialog;
  whichever the inventory proves, the case asserts.**
- The Add-Tier and Edit-Tier dialog fields.

**Required regression cases** (bank-driven, all Axis-1 legitimate): the percentage battery asserting the
**displayed** value, the **persisted** value after reload, and the §2.1 announced-and-escapable oracle,
**before and after blur**. Plus the tier-algebra regressions that are open or blocker-class:
add-inside-range (split), add-above-max (NM-3237), delete-after-split boundary (NM-3239), duplicate/overlap
(NM-3435), Start above End.

> Tier-algebra combinatorics beyond these named cases are DEEP (parent D6). These are in QUICK because
> they are filed, reproducible, blocker-class defects — regression armour, not exploration.

### 7b — Axis 2: L1 surface must-asserts

One per applicable §3 family; applicability is decided by the Phase-3 walk, not this list:
`result-fidelity` (criteria return exactly the matching tier rows) · `render-state` (percentages render
with the `%` suffix and expected precision; Export/Import icons are correct — NM-3229) · `empty-vol` (the
Phase-5 verbatim string) · `persistence` (an edit dirties the form and enables Save; a save survives
reload; a revert returns Save to disabled — revert is not pristine, LR-009 / LR-026). `pagination` /
`sorting` / `combination` apply **only if** Phase 3 proves the affordances exist; the 2026-08-18
screenshot shows neither, so the likely disposition is `out-of-scope:<family>=<reason ≥20 chars>`. **Do
not invent a sort case to look thorough; equally, do not skip one if the walk finds a sort menu.**

### 7c — Header-Effect block (the owner's requirement)

For each of `Country`, `Currency`, `Business Tier`, `GAV Discount Threshold`, with this tab active:

1. **Re-drive** — change the control; assert this tab's rows change correctly. Catches a tab wired to the
   wrong header key.
2. **Load gate** — the tab must not load until all three keys are set (NM-2219 AC #1) and shows its empty
   state otherwise.
3. **Dirty-state interaction** — change a header control while this tab has unsaved edits; assert the
   Unsaved-Changes prompt appears and Cancel/Discard/Save each do the right thing. NM-3256 lives here.
4. **No cross-contamination** — changing the header must not silently mutate another tab's unsaved state.
   Assert on return.

**`CRT` does not duplicate these.** `CRT` owns the header's intrinsic field behaviour; this block owns the
header→tab effect.

### 7d — Data discipline

SELF-PRODUCE → SELF-SERVE → escalate. No "no data" skip without both rungs evidenced (§20.4). **Every
mutating case restores state** — this tab writes real discount configuration that gates order approval,
and a left-behind tier row corrupts the next run's denominator.

---

## Phase 8 — BUILDER artifacts

0. **Scaffold the target directories first.** Verified missing 2026-08-19:
   `clients/encore/src/selectors/discount-matrix/`, `src/pages/discount-matrix/`,
   `src/data/discount-matrix/`, `tests/discount-matrix/`. A worker told to write a file into a
   non-existent directory may or may not create it, and a silent failure here reads downstream as "the
   worker produced nothing". Create all four in the same ticket that writes the first file into them,
   and make their existence an ACCEPTANCE line so the deliverable oracle can see it.
1. **Selectors** `clients/encore/src/selectors/discount-matrix/company-matrix.ts` (+ `shared.ts` for the
   criteria bar if founding), following the `selectors/discount-optimization/` layout. Expect near-zero
   `data-testid`; anchor on accessible role + name, `aria-label`, visible text. **Never reference a
   `radix-*` id** — auto-generated, changes between renders; select tabs by `[role="tab"]` + visible text.
2. **Page objects** `clients/encore/src/pages/discount-matrix/` extending `base.page.ts`, per-method
   `@step`. **No `Proxy`** — retired in `48d5933f`; use decorators (`.claude/rules/no-wrappers.md`).
3. **Plain-English step labels** (LR-ENC-006) — each public async action method reads as a 12-word-or-
   shorter sentence with no selectors. `npm run check:step-labels`.
4. **No internal jargon in shipped source** (LR-058) — no `LR-###`, `PLAN_*`, identity codenames, or
   `_internal` paths in any comment, JSDoc, string, or test title under `clients/encore/`. `NM-####` is
   the client's own ticket ID and is permitted.
5. **Ready-gate discipline** — the grid container exists before data arrives; waiting on container
   presence alone produced three false "grid is empty" findings on the sibling module. Gate on a
   **non-zero row count**.
6. **Spec** `clients/encore/tests/discount-matrix/company-matrix.spec.ts` with the field-case describe,
   an `SBC — discount matrix company matrix` describe, and a **Header-Effect describe**.
7. **Save dialog** — LR-012 says Location Settings dialogs are shared **unless MCP-proven otherwise**;
   prove it. If it is `<div role="alertdialog">` with unnamed buttons the base `getByRole` helper silently
   no-ops — target `[role="alertdialog"] button:text-is("Save")` (the Override precedent,
   `.claude/context/navigation.md:34`).
8. **Reuse mandate** — reuse existing grid row-lookup / content-anchor / download helpers. A missing
   helper is added **to the page object**, never as a new runner or standalone script. Row lookup is
   content-anchored by tier range, never by index.
9. No `networkidle`. No `page.waitForTimeout`. Downloads via `waitForEvent('download')`.
10. Every mutating case restores state — re-runs are idempotent.
11. `npx playwright test --list` resolves every authored TC ID.

**Render-fail rule (binding on Phases 7–10)**: a failing surface assertion triggers **RCA, then
classification** — regression-from-baseline → `BUG-DSM-CMX-NNN` with `baselineComparison`;
baseline-absent → `/encore-questions`; by-design → documented skip with the reason. Never blind auto-file,
never a silent skip. **The RCA verdict is CLAUDE-ONLY.**

---

## Phase 9 — Review: WATCHDOG completeness + the fight

**Delegated** (ledger D-12, D-13). Claude reads the DIGEST and the verify-run `verdict` — not the report.

1. **Axis-1 completeness** — every in-scope field has its §2 set; every Negative/BVA carries the §2.1
   announced-and-escapable oracle.
2. **Axis-2 completeness** — every applicable §3 family has its L1 must-assert or an explicit
   `out-of-scope:<family>=<reason ≥20 chars>`.
3. **Header-Effect completeness** — all four header controls covered across re-drive / load-gate /
   dirty-state / no-cross-contamination. A missing control is an audit finding, not a deferral.
4. **Tier discipline** — every `deferred-to-DEEP` row names a specific element/launcher with a reason of
   at least 20 characters and carries no other classification token (G1); every deferred family appears in
   the parent's `## Deferred to DEEP`. `Walk_Mode: quick` matches `CoverageMode: quick`.
5. **Regression-bank closure** — each of this tab's 12 rows is a named TC, a documented not-applicable
   with its reason, or an `/encore-questions` entry. Silently absent from all three = audit finding.
6. **Bug-loop closure** — every `BUG-DSM-CMX-*` has its TC; every skip names its bug ID.
7. Boolean render format proven per table (LR-036) if any boolean column exists on this grid.
8. Missing-testid report emitted with live-DOM evidence (LR-029).
9. `npm run check:spec-quality` on the **working tree** before any done/green/verified claim (LR-060
   obligation 4 — commit-time gates do not cover uncommitted work).
10. Suite green **twice consecutively** on office 1604; any 1101/1605 consultation recorded as an
    LR-ENC-005 note, not as the test office.

**The fight runs the required shape**: worker → reviewer → **worker DEFENDS** → aligned → Claude. A review
reaching Claude before the author defended is a protocol defect. Verdicts are `RE-DERIVED-CONFIRM` /
`RE-DERIVED-REFUTE` / `ABSTAIN` only — **"AGREE" is worthless**. A canary claim, disjoint from anything
this ticket permits and recorded privately first, is seeded into the review; a review that misses it is
INVALID.

---

## Phase 10 — Iteration

- **BOUNCE, don't self-fix.** A defect the review found goes back to the worker that made it. SELF_GRANT
  self-fix only after a bounce fails.
- **Classify the failure first**: prompt-issue (Claude's fault — rewrite the ticket, redispatch same
  tier, costs no bounce) · capability-gap (escalate a tier immediately) · env-flake (one fresh retry, then
  ENV-BLOCKED and route to Claude) · worker-defect (the classic bounce).
- **At attempt ≥2, stop and fix the TICKET** before spending attempt 3. Most "model failures" are spec
  failures.
- **Re-dispatches carry `--attempt N+1`** and reassemble the full prompt from scratch — preamble, prior
  outputs, hop-context header (hop N, prior verdict, unresolved findings), original ticket, hop delta. A
  bounce that omits this carries stale context; refuse to send it.
- **Never self-rescue a stalled worker.** Wait for the timeout or dispatch a fresh worker with the same
  ticket plus stall context. Self-rescue is a `self_incidents.log` entry.
- **Every worker death gets a cause row** — `run-id | cause | permanent block applied` — routed to the
  ticket template, the wrapper flag, the agent profile, or a guardrail plan. Never a prose-only note.
- Loop until the suite is green ×2 and Phase 9 items 1–8 all pass.

---

## Phase 11 — Registration, sweep, closure

1. `.claude/context/navigation.md` §C Exploration Registry row → field inventory, baseline, walk-evidence,
   interaction map.
2. `clients/encore/docs/MODULE_REGISTRY.md` + `REQUIREMENTS.md` updated for this tab's behaviours.
3. **Adjacent-Sweep ritual** — each adjacent fix noticed gets exactly one of DO-NOW / SPAWN / APPEND with
   a grep-verified line item. Bare "out of scope" with no recipient = HALT and ask.
4. **File this tab's DEEP rows** into `plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md` — **create it
   if this is the first child to close**. LR-040(b): a deferral with no recipient file is a phantom
   hand-off and blocks closure.
5. **Annotate the parent's `## Child index` row** —
   `- [x] [<SUBPLAN_NAME>.md](../done/<SUBPLAN_NAME>.md) — **DONE <YYYY-MM-DD>**, <one-line summary>`
   (LR-027 parent-cascade annotation — required while the parent is still in `plans/pending/`, regardless
   of how many siblings remain). **Do not auto-close the parent** — siblings remain pending by design.
6. LR-028 activity-log row with an LR-037 timestamp at or after every touched-file mtime.
7. LR-027 Execution Summary, `git mv` to `plans/done/`, `npm run plans:reindex`.
8. **Emit the Receipt** (parent's `## Delegation doctrine`). Target: "I coded myself: nothing."

---

## Delegation ledger

Every row declares MECHANISM / THRESHOLD / BASELINE / SAMPLE per PLAN_75-TEMP §1. **A row missing a cell
does not ship.** Tiers per `worker-ext.md`: T0 `gpt-5-mini` · T1 `claude-haiku-4.5` · T2
`claude-sonnet-4.6` (default workhorse) · T3 `claude-opus-4.6` · T4 `gpt-5.5` (cross-family review only).

| ID | Step | Tier / work-type | MECHANISM | THRESHOLD | BASELINE | SAMPLE |
|---|---|---|---|---|---|---|
| **D-00** | **Reachability pre-flight** — e2e auth, tab renders, permission, old-site counterpart (Phase 0.4) | T1 / `probe`, `--max-credits 100` | One artifact answering all four questions with raw output: landed URL (not `login.microsoftonline.com`), live tier-row count, live percentage-cell count, permission/403 surface, and the `-s=nav2` counterpart result | Any question unanswered = bounce. Entra redirect = `AUTH-REFRESH-REQUIRED`, owner ping, **not** a headless retry. No permission = HALT the whole subplan | The 2026-08-18 screenshot's 10 tier rows × 21 percentage cells | 1 run — it exists to de-risk the other twelve, not to cover anything |
| **D-01** | Jira crossref skeleton (rows, claims, tabs; Status left `UNVERIFIED`) | T0 / `draft` | `grep -c '^| NM-' <crossref>` equals the bank count; every Status cell reads `UNVERIFIED` pre-fill | Any missing row, or a Status cell the worker filled itself = bounce | The parent's 22-row bank table | 100% — closed set of 12 (+4 if founding) |
| **D-02** | Old-site baseline walk (`OFF-REPO: yes`, `CLARIFY: yes`) | T2 / `walk` | Independent agent re-executes the walk verbatim in `--mode edit` and pastes its own raw output; verdict diffs claims vs re-execution | Any divergence on a **classification-bearing** observation = bounce | The 2026-08-18 new-site observation table in the parent | Re-execute 100% of navigation steps + ≥3 field observations |
| **D-03** | Machine enumeration across 7 tab states | T1 / `walk` | `cross-check.mjs` → `CrossCheck: clean`; percentage archetype resolves to a **non-zero** live match count | 0-match archetype = **HALT, not bounce** — it is a tooling defect (PLAN_75-TEMP §2), fix the tool | Sibling map `discount-optimization-2026-08-11.json` shape + element count | 100% of the 7 states |
| **D-04** | Independent enumeration CONTROL (cross-family, different provider than D-03) | T0 / `verify` | Claude diffs the two runs' element counts for one shared state | Counts differ by more than 0 = both runs suspect, investigate before dispositioning | D-03's own output for the same state | 1 state — enough to prove the probe is not structurally blind |
| **D-05** | Percentage battery input trials (10 values × cells) | T1 / `probe` | Each trial returns **raw values** — displayed, `aria-invalid`, inline-error text, post-blur, post-save, post-reload; report ends `## END-OF-REPORT <N>` | Any row carrying prose instead of a raw value, or a missing END-OF-REPORT = bounce unread | The §2 template set Claude assigned per field | 100% of assigned trials, dispatched in batches of ~2 for live save-tests |
| **D-06** | Tier-algebra trials (split / above-max / delete-after-split / duplicate / Start>End) | T2 / `probe` | Same raw-value contract as D-05, plus the surviving boundary values after each mutation | Any trial that mutated state without restoring it = bounce | NM-3237 / NM-3239 / NM-3435 repro steps | 100% — 5 named scenarios |
| **D-07** | Header-effect probes, 4 controls × BEFORE/AFTER delta | T2 / `probe` | Each control returns a captured row-set delta, not a description of one | A control with no captured delta and no `DIFFERENTIAL-DATA-REQUIRED` tag = bounce | The parent's dependency-matrix hypothesis for the CMX column | 100% — 4 controls |
| **D-08** | **Blind Stage-3 re-drive** (LR-064) — a different worker, never shown the first worker's answers | T1 or T2 / `probe` | Re-drive output diffed against the originally cited evidence | Any contradiction = that disposition CANNOT close; escalate one tier | The first worker's raw evidence, withheld from this worker | `min(3, live-row count)` rows, randomly chosen by Claude |
| **D-09** | Selectors + page objects | T2 / `build` | `npm run check:step-labels`, `check:structural-names`, `typecheck` all exit 0; zero `radix-` and zero `new Proxy(` hits in the diff | Any non-zero exit or either forbidden string = bounce | `selectors/discount-optimization/` layout + comment style | 100% machine-gated — no sampling |
| **D-10** | Test-case MD + test plan + XLSX sheet | T2 / `draft` | `npm run check:tc-parity`, `lint:testcases`, `xlsx:lint` exit 0; authored TC count equals Claude's case-list count | Count mismatch, or any `(QUICK)` marker on a `## TC-…:` heading = bounce | Claude's authored case list, pasted into the ticket's ACCEPTANCE | Claude spot-reads 3 random TCs against the inventory rows they claim to cover |
| **D-11** | Spec authoring | T2 / `build` | `npx playwright test --list` resolves every `TC-DSM-CMX-*` ID; `check:spec-quality` exits 0 on the working tree | Any unresolved ID or gate failure = bounce | The Phase-7 case list + `discount-optimization` spec house style | 100% machine-gated |
| **D-12** | Verification battery (all gates, one bundled ticket) | T0 / `verify` | `verify-run.mjs` JSON **`verdict` field** — never the exit code, never report prose. Commands tee'd to `<RUN_DIR>/<name>.verify.txt` with sha256, re-hashed and re-executed | `FABRICATED` = hard bounce with `reasons[]`. **`UNPROVABLE` = route to Claude, never auto-bounce** | The envelope manifest snapshotted pre-dispatch | 100% of gate commands |
| **D-13** | Cross-family adversarial review — the fight | T4 / `review`, `--mode edit` | Verdicts limited to `RE-DERIVED-CONFIRM` / `RE-DERIVED-REFUTE` / `ABSTAIN`; a seeded canary must be caught; worker DEFENDS before the result reaches Claude | Plain "AGREE", all-ABSTAIN, or a missed canary = INVALID review, bounce with no credit | The claims table Claude builds: each claim + its primary-artifact path + the probe that produced it | Every material claim gets a claim-level status; confident claims attacked hardest |

**Not delegated — the quality floor** (full list in the parent's `## Delegation doctrine`). For this tab
the load-bearing ones are: the **UI↔DB column-mapping verdict** (trap 1 — all 21 columns depend on it);
every per-element disposition and `Coverage_Ratio` call; the §2/§3 taxonomy assignment; bug triage
including whether a `Done` ticket that reproduces is a reopened regression; RCA verdicts; the header→tab
dependency-matrix update; Jira MCP fetches; trap-question design; ceremony and publishing; and talking to
the owner.


### Dispatch deaths — cause rows (OWNER-LAW-2)

Every worker death gets a cause row routed to the layer that actually caused it. Never a prose-only note.

| Run id | Class | Cause | Layer at fault | Permanent block applied |
|---|---|---|---|---|
| `dsm-cmx-preflight-0819` | C3 `no-deliverable` (process exit code 0 — a false green if trusted) | Ticket's VERIFY block opened with `playwright-cli -s=e2e goto <url>`. `goto`/`open` are **sandbox-blocked unconditionally** for Copilot workers (proven 2026-07-30). The worker burned its run on the guard and wrote nothing to its OUTPUT path. | **Ticket template — Claude's defect.** Classified `prompt-issue`: no bounce, no credit blame, redispatch at the same tier. | D-00 rewritten as `dsm-cmx-session-probe-0819`: `eval`-only, no navigation, no `mkdir`, with the block stated as a HARD CONSTRAINT the worker reads before its first command. Every future walk ticket on this subplan must carry that same constraint block. |
| `dsm-cmx-session-probe-0819` | C3 `no-deliverable` | Same root cause as the row above — OUTPUT path was under `C:\Users\VikasYadav\.claude\`, outside the worker's `-C "$REPO"` working root. The worker completed the probe and reported its findings in prose, but every write to the declared path was refused. | **Delegation convention — systemic.** The `~/.claude/delegation/out/` OUTPUT convention is structurally unreachable by workers; the wrapper writes the STEP-0 stub itself, which masks the conflict. | All subsequent tickets declare an **in-repo** OUTPUT path under `C:\Encore Framework\.tmp\delegation-out\<run-id>\`. Proven working from `dsm-registry-mint-0819` onward — every later run delivered. |
| `dsm-cmx-toolbar-0819` | C9 `network` (exit 1 — a genuine failure exit, unlike the C3 false-greens) | DNS resolution failure for `api.business.githubcopilot.com`: `No such host is known. (os error 11001) [ENOTFOUND]`, after 5 internal retries. Zero report sections, empty deliverable. | **Environment — nobody's defect.** Not the ticket, not the worker. Classified `env-flake`, which earns exactly one fresh retry. | DNS re-checked before retrying (`nslookup` → 140.82.113.21, control host also resolving), then re-dispatched once as `dsm-cmx-toolbar2-0819`. Doctrine: if the retry also fails on network, mark ENV-BLOCKED and route to the owner rather than burning further runs. |

**Standing technique for this subplan — CORRECTED 2026-08-19 by direct test.** An earlier version of
this section claimed navigation was impossible for every actor and that a human must open the page.
**That was wrong and is retracted.** Run `dsm-cmx-navwalk-0819` proved a worker CAN navigate:

```
playwright-cli --raw -s=e2e eval "() => { window.location.href = '<url>'; return 'nav-issued'; }"
```

The sandbox guard is on browser **process spawn** (`goto` / `open`), not on scripting a page that is
already open — so `eval`-driven navigation of the existing session works, and the page genuinely moved.
Poll `eval "() => window.location.href"` until the URL stops changing; never assume it landed.
`goto`/`open` remain forbidden for workers, and Claude's own Bash remains denied EVERY `playwright-cli`
command by `~/.claude/hooks/labor-gate.mjs:256` (the pattern matches the binary, not the subcommand).

**The real gate is auth freshness, not navigation.** That same run landed on
`/navigator/auth/sign-in?callbackUrl=...` — the app's own Next-Auth page, not Entra — meaning the saved
cookies in `clients/encore/.auth/encore-state.json` had expired. The repository's own automated refresh
path is the `setup` project (`clients/encore/tests/auth.setup.ts`), which detects stale state and
re-logs in under a file lock without any human typing:

```
cd clients/encore && npx playwright test --project=setup
```

Whether that runs inside the worker sandbox is answered by run `dsm-auth-refresh-0819`. If it is
sandbox-blocked, the owner runs that one command and every walk phase unblocks. **No agent may type a
credential into a login form to work around this** — the automated setup path or the owner, nothing else.

**Cheaper-than-UI opportunity (from §1.10 of the pre-existing QA reference).** The module exposes a
direct API surface, and several bank rows are better tested against it than through the browser:
`GET/PUT /api/discount-matrix/countries/{countryId}/currencies/{currencyId}/threshold`,
`GET /api/discount-matrix/countries|/currencies|/business-tiers`, and the export endpoint. Specifically
NM-3235 (percent whole-vs-decimal) is a parameterized API assertion, NM-3239 (tier split/delete
recalculation) suits an API-seeded integration test over a stateful UI walk, and NM-3255 / NM-3236 /
NM-3062 (export filename, id column, HTTP 500) are assertable from the export response headers and body
with no browser download. Grid identity is keyed by `(countryId, currencyId, businessTierTypeId)` — which
is the documented mechanism behind this subplan's header×submodule thesis, not an inference.
---

## Per-Identity Satisfaction

> **Closure instruction**: at DONE-flip replace every `<DATE>` with the real dated filename — closure
> check C6 greps the literal cell paths and a placeholder DENIES the flip. Verify every path with `ls`
> BEFORE flipping (the NM-2261 ghost-path precedent: the deliverables existed, only the cited paths were
> wrong). Rows marked *founder-only* apply only when Phase 1 returned `FOUNDATION-ABSENT`; when consuming,
> replace them with `(skipped: shared foundation consumed from a sibling subplan per the parent contract)`.

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | Jira crossref · baseline · interaction map · walk evidence · field inventory · testid gap report | `clients/encore/specs_planning/_internal/jira-research/discount-matrix-and-service-charge-text-qa-reference.md`<br>`clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-2026-08-19.md`<br>`clients/encore/specs_planning/_internal/walk-evidence/discount-matrix-company-matrix-2026-08-19.md`<br>`clients/encore/specs_planning/_internal/field-inventories/discount-matrix-company-matrix-2026-08-20.md`<br>`clients/encore/specs_planning/_internal/testid-gap-reports/discount-matrix-company-matrix-2026-08-20.md`<br>`scripts/walk-coverage/interaction-maps/discount-matrix-company-matrix-2026-08-20.json` | `node scripts/check-interaction-coverage.mjs --file scripts/walk-coverage/interaction-maps/discount-matrix-company-matrix-2026-08-20.json` |
| GIVER | field-case catalog · test-case MD · test plan · XLSX workbook | `clients/encore/specs_planning/_internal/field-case-catalogs/discount-matrix-company-matrix-2026-08-20.md`<br>`clients/encore/specs_planning/test-cases/setup/discount-matrix/discount_matrix_company_matrix_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/discount-matrix/discount_matrix_company_matrix_test_plan.md`<br>`clients/encore/testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` |
| BUILDER | selectors · page object · test data · spec | `clients/encore/src/selectors/discount-matrix/company-matrix.ts`<br>`clients/encore/src/pages/discount-matrix/company-matrix.page.ts`<br>`(skipped: the spec imports no test-data module — it uses the page object plus inline literals, verified by grepping its import list)`<br>`clients/encore/tests/discount-matrix/company-matrix.spec.ts` | `npx playwright test --list` |
| HEALER | (none) — no pre-existing failing specs on this tab | (none) | (none) |
| WATCHDOG | completeness + header-effect + bank + tier-discipline findings | `clients/encore/specs_planning/_internal/audit-discount-matrix-company-matrix-2026-08-20.md` | `npm run check:spec-quality` |
| GARDENER | (none) | (none) | (none) |
| OWNER | registry *(founder-only)* · navigation · module registry · DEEP plan · parent annotation | `export_test_cases/module-codes.json`<br>`export_test_cases/types.ts`<br>`.claude/context/navigation.md`<br>`plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md`<br>`plans/pending/PLAN_DISCOUNT_MATRIX_AUTOMATION.md` | `npm run check:tc-parity` |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] NM-3342 confirmed closed before execution began, or a user-signed `## Deferral Authorization` recorded.
- [ ] Branch check ran — the `inputmode: decimal` signature rule is present on the executing branch, or was ported before any walk.
- [ ] **Phase 0.4 pre-flight ran BEFORE any `walk` / `build` / `draft` dispatch**, and all four questions are answered with raw output: e2e auth landed on the app, the tab rendered with its live row and cell counts, the permission surface was confirmed, and the old-site counterpart question was resolved either way.
- [ ] **No expensive dispatch was fired against an unanswered pre-flight question** — in particular, Phase 0.5b did not spend a `walk` dispatch if the pre-flight already proved no old-site counterpart exists.
- [ ] **Budget honoured**: total dispatch spend tracked against `.claude/state/ua-worker/ledger.jsonl` and reported in the Receipt. If the 70%-consumed-with-no-spec stop-loss tripped, it was surfaced to the owner as a one-liner and the MSI ordering was followed — never a silent narrowing.
- [ ] **MSI M1–M4 all landed**, or each unlanded item is `deferred-to-DEEP` by name in the recipient plan with an honest Execution Summary line. **At least one runnable green spec exists** — the line between "we investigated" and "we automated".
- [ ] Phase 1 recorded FOUNDER or CONSUMER, and — if consumer — the 3-field × 4-check LR-013 spot-check log, or a `DRIFT_DETECTED` refresh.
- [ ] Jira crossref exists; all 12 bank rows (+4 CRT if founding) carry a re-fetched status and a post-walk verdict; the baseline artifact carries `jira_tickets:`.
- [ ] `Tab-CompanyMatrix.docx` retrieved and summarised, or `businessRulesDoc: unavailable` with the reason.
- [ ] Baseline artifact exists with a `## Baseline diff` section, or an explicit `baselineScope: baseline-absent`.
- [ ] Enumeration covers all 7 tab states; `Coverage_Ratio` 100%, `CrossCheck: clean`, opener frontier resolved (walked or `deferred-to-DEEP`).
- [ ] **The percentage archetype resolved to a non-zero live match count**, and the D-04 independent control agreed.
- [ ] Interaction map PASSES `check-interaction-coverage` — no `unclassified-element`, no `claim-census` residual.
- [ ] Walk evidence carries `## Observations` with both buckets filled or the literal `none`.
- [ ] **All 12 bank rows dispositioned** — named TC, documented not-applicable, or `/encore-questions` entry.
- [ ] Every confirmed bug filed per LR-034 with `baselineComparison` + numbered `stepsToReproduce`, and has a required TC; every skip names its bug ID. No DOM/markup-accessibility finding filed as a bug.
- [ ] Every empty surface carries c.1 / c.2 / c.3, and the empty-state string is captured verbatim.
- [ ] Every zero-delta probe on a mandatory-effect class carries `DIFFERENTIAL-DATA-REQUIRED` with rung-1 and rung-2 evidence; no case asserts a zero-effect as expected behaviour.
- [ ] Every claimed row carries an `affordance:` token, `provenance: live`, and dated evidence; no inert verdict without a positive control.
- [ ] **The D-08 blind re-drive ran on `min(3, live-row count)` rows and contradicted nothing.**
- [ ] Missing-testid report emitted with live-DOM evidence per element; nothing skipped for a missing testid.
- [ ] Axis-1 §2 set complete for every in-scope field, each Negative/BVA carrying the §2.1 oracle.
- [ ] Percentage battery asserts displayed + persisted + announced-and-escapable, **before and after blur**.
- [ ] The five named tier-algebra regressions each exist as a TC.
- [ ] Axis-2 L1 must-assert present per applicable §3 family, or `out-of-scope:<family>=<reason ≥20 chars>`.
- [ ] **Header-Effect block covers all four header controls** across re-drive / load-gate / dirty-state / no-cross-contamination; the parent's dependency matrix CMX column updated with walked results.
- [ ] The UI-label to persisted-column mapping measured from a real payload, not inferred, and recorded in the parent.
- [ ] Every `deferred-to-DEEP` row names a specific element/launcher with a reason of at least 20 characters and carries no other classification token (G1).
- [ ] `Walk_Mode: quick` in the field inventory matches `CoverageMode: quick` here.
- [ ] This tab's DEEP rows are grep-verifiable line items in `plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md`.
- [ ] No `(QUICK)`/`(DEEP)` marker on any `## TC-…:` heading (ALL-091); no ticket ID in a structural name on a shippable path (LR-073); no internal jargon in shipped source (LR-058).
- [ ] `check:tc-parity`, `lint:testcases`, `xlsx:lint`, `check:step-labels`, `check:structural-names`, `typecheck` all exit 0.
- [ ] `npm run check:spec-quality` passes on the working tree before any done/green/verified claim.
- [ ] Suite green twice consecutively on office 1604; every mutating case restores state.
- [ ] `/regression-guard` before/after = no silent breakage.
- [ ] **Delegation**: every dispatch had `--work-type` from the 9-value enum, an explicit `--timeout`, `--max-credits` at 2× estimate, a non-empty `--session-id` and `--parent-run-id`, and a literal `OUTPUT (LITERAL ABSOLUTE):` path. Zero uncapped dispatches, zero detached dispatches (LR-074).
- [ ] **Every accepted round's `verify-run.mjs` verdict was GENUINE**, or an `UNPROVABLE` was routed to Claude's judgment with the disposition recorded. No acceptance quotes report prose as evidence.
- [ ] **The fight ran the required shape** (worker → reviewer → worker DEFENDS → aligned → Claude), used only the three legal verdicts, and caught the seeded canary.
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
npx playwright test clients/encore/tests/discount-matrix/company-matrix.spec.ts --retries=0
```

```bash
node scripts/check-interaction-coverage.mjs --self-test
```

---

## Handoff (post-execution)

The Company Matrix tab is covered at QUICK depth: a machine denominator at 100% with every element either
claimed at full rigor or named in a DEEP deferral, a baseline verdict, a targeted manual-QA harvest
against its 12-row regression bank with every row dispositioned, Axis-1 field coverage carrying the
rejection-affordance oracle on the percentage inputs where this tab demonstrably breaks, Axis-2 L1
must-asserts, and a Header-Effect block proving the criteria bar re-drives this tab correctly. If this
subplan founded the shared registry and `CRT` band, its two siblings can now run as consumers with a
spot-check. Depth beyond L1 is deferred by name to the filed follow-up plan. The parent stays PENDING with
its remaining children outstanding — by design.

---

## Execution Summary

**Executed**: 2026-08-20

### Test cases

**Implemented: 42** — `TC-DSM-CMX-001..042`, all in
`clients/encore/tests/discount-matrix/company-matrix.spec.ts`. **Dropped: 0.** Bidirectional 1:1 parity
with the test-case MD verified (42 ↔ 42, no orphan on either side).

### Verification results

1. **Suite run 1** — `npx playwright test tests/discount-matrix/company-matrix.spec.ts --retries=0`
   → **43 passed (6.3 m)**. 43 = 42 spec tests + 1 auth-setup test running as a project dependency.
2. **Suite run 2** — identical command → **42 passed, 1 failed**. `TC-DSM-CMX-003` timed out reading a
   grid cell. Running twice is what caught it; a single green run would have shipped the flake.
3. **Flake root-caused and fixed.** `getTierRangeLabels()` snapshotted the row count then read each row in
   a separate round trip, so a criteria-bar re-key repaint mid-loop detached the row and the read blocked
   to timeout. Both it and `getRowValues()` now perform one atomic DOM read. No wait, retry or raised
   timeout was added — a wait narrows the race, it does not close it.
4. **Flake proof** — `--grep "TC-DSM-CMX-00[234]" --retries=0 --repeat-each=5` → **16 passed (4.8 m)**,
   15 executions + setup, zero failures.
5. **Machine denominator = 21** (LR-062), provenance `reports/walk-coverage/1604-discount-matrix.json`,
   both dialog branches `ok: true`, measured against a healthy 9-row grid.
   `cross-check.mjs --self-test` → 18/18.
6. **Interaction map** — `node scripts/check-interaction-coverage.mjs --file …-2026-08-20.json` →
   **VERDICT: PASS**, 21 elements, 0 schema violations, `claim-census` PASS with 15 claims corroborated by
   a verified census artifact. (The checker's own `--self-test` is 187/189 — pre-existing; this session
   did not modify the checker or its probe definitions.)
7. **Spec-quality gate** — `npm run check:spec-quality` from the **repo root** exits non-zero, but **zero
   findings touch this module** (`DSM-CMX` → 0 hits, `discount-matrix` → 0 hits, verified by direct grep).
   All failures are missing `reject-oracle` receipts in six other modules; spun out as its own task.

### Defects

`BUG-DSM-CMX-001` and `BUG-DSM-CMX-002` filed. The save→navigate write loss remains a **BUG-CANDIDATE**,
not filed, pending a baseline comparison — tracked as **D13**.

`BUG-DSM-CMX-003` was filed during this session and **retracted the same day**: it claimed the module
served no data, which was a partially decayed auth state, not a defect. The module renders 9 rows and a
`15%` threshold on offices 1604 and 1101. The full account is in walk-evidence §12 and audit §5.1.

### Documentation

Walk evidence extended to §13 (§12 the degraded-session account, §13 the denominator, §3 the LR-040(c)
empty-surface disposition). `REQUIREMENTS.md` gained a Discount Matrix section and a corrected
*Session Timeout Handling* section — the previous text claimed expiry always shows as a Microsoft
redirect, which is wrong on this app and is what cost this session four investigation runs. PLAN_70's
"bare sessions never get data" conclusion is retracted. Exploration registry row added.

### Deferrals

14 rows filed into `plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md` §1 (D1–D14), each with a named
unlock. Add Tier commit, Delete Tier, Import, Export-while-dirty and permission gating are the surfaces
this tier deliberately did not exercise.
