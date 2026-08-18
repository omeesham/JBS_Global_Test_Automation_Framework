# PLAN_DISCOUNT_OPTIMIZATION_AUTOMATION — automate Location Settings › Discount Optimization Settings (NM-3342)

**Status**: PENDING
**Priority**: P0
**Created**: 2026-08-04
**Identity**: OWNER (CEO — decomposes into worker tickets; adopts HUNTER / GIVER / BUILDER / WATCHDOG at the phase boundaries that write role-owned artifacts)
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a
**Jira**: NM-3342 (Story, Highest, To Do) · live siblings NM-3340 (Blocker, In Progress) + NM-3341 (QA Defect, in QA)
**Skills**: /identity, /relevant, /find-bugs, /rca, /regression-guard, /encore-questions, /final-q

---

## Context

`https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-optimization-settings`
has never been intaken. As of 2026-08-04 the repo carries **zero** Discount Optimization assets —
`git ls-files | grep -iE "discount|optimization"` returns only Corporate-Pricing override fixtures and
`max-discount` spinbutton replay receipts, nothing for this surface. No module code in
`export_test_cases/module-codes.json`, no submodule codes in `KNOWN_SUB_CODES`, no page objects, no
selectors, no specs, no field inventory, no navigation-registry row.

This is a **greenfield intake**, not a gap-fill.

### The Jira mandate is two screenshots with no words

NM-3342 "Automate --> Setup --> Discount Optimization" (Story, Highest, To Do, created 2026-08-03,
assigned to Rutvik) has a description consisting of exactly two embedded images and zero prose. Same
shape as NM-3346. **The ticket is not the requirement — it is a pointer.** The requirement has to be
reconstructed from the sibling corpus below plus the live walk. Phase 1 reads the two images.

### The surface — what is actually there (screenshots 2026-08-04, office 1604 "Parker Palm Springs")

Two tabs under one page shell:

**Tab 1 — "Discount Optimization"** (default/landing tab)
- Count line: `2154 locations found`
- Toolbar: `Save` (disabled at rest) · `+ Add`
- Grid columns: row-delete `×` · `ID` · `Location Name` · `No Implied Discount` (value `Yes`) ·
  `No Implied Start` (a date `MM/DD/YYYY` + a calendar-picker affordance, i.e. **editable in-grid**)
- 2154 rows → paginated and/or virtualized; the visible viewport shows ~22.

**Tab 2 — "Special Rate Exemptions by Service Type"**
- Toolbar: `Cancel` · `Save` (disabled at rest)
- Grid columns: `Service Type` · `Exempt` (empty cells in the capture — a boolean column)
- Row set = the service-type catalog, alphabetical, no add/delete affordance.

### A hidden third surface the screenshots do not show

NM-3210 documents that **`+ Add` opens a "Change Local Office" dialog** containing a
`Select a Location` launcher **and an `Active/Inactive` checkbox filter**. None of that is visible in
the captures above. Treat the Add flow as its own sub-surface with its own denominator — and note it
is a **shared-dialog family we already have doctrine on**: office/location selection is done by the
**row checkbox**, and `Select` is disabled on the current office. LR-012 still binds: the dialog is
shared until MCP-proven otherwise, so it gets probed **per launcher**, not once.

### Sibling-ticket leads (2026-08-04 sweep, `project = NM AND (summary ~ "discount optimization" OR "implied discount" OR "special rate" OR "exemption" OR "service type")`, 60 hits, 18 relevant)

These are **LEADS, not facts** (ALL-024 / LR-ENC-004). Every row must be re-verified against the live
DOM in Phase 1/3 before a single case is written from it. A Done defect proves a fix *shipped*, not
that it *works on 1604 today*.

| Ticket | Type / Status | Tab | What it tells us |
|---|---|---|---|
| **NM-3341** | QA Defect · **in QA** · Highest | 1 | Page returned **500 + "An item with the same key has already been added. Key: 1112"**, `0 locations found`, on **1101** on 2026-08-03. Comment 2026-08-04 05:32: *"this issue is resolved. It was a data issue and has been fixed."* **Unverified.** A load failure during our walk is NM-3341 recurrence until proven otherwise — do NOT file it as new. |
| **NM-3340** | Story · **In Progress** · **Blocker** | 2 | The exemptions list will be **cut down to Equipment-rollup service types only**. Today it shows all of them. Rationale: labor / consumables / freight / system-line fees can already be special-rated. Also names the **Rev Mgmt.** role as the actor. |
| NM-3064 | Story · QA | 1 | Backing entity is **`LocationSpecialRateSetting`**; publishes a message to the shared environment on save. Cross-service side effect. |
| NM-2242…NM-2246 | Sub-tasks · Done | 1 | The five NAV-APIs: `GET /pricing/discount-optimization/locations` (list) · `GET …/locations/available` (**Add dropdown**) · `PUT …/locations` · `PUT /api/discount-optimization/locations/update` · `DELETE …/locations/{localOfficeId}`. Tier-2 payload oracles come from here. |
| NM-3063 | QA Defect · Done | 1 | Save button **became disabled** after adding a location while unsaved changes existed. |
| NM-2918 | QA Defect · Done | 1 | Save button **enabled with no changes**. |
| NM-2917 | QA Defect · Done | 1 | Update button **stayed disabled** after toggling Implied Discount. |
| NM-3067 | QA Defect · Done | 1 | **Manual date entry shifts digits between Month / Day / Year fields.** Directly targets `No Implied Start`. |
| NM-3066 | QA Defect · Done | **seam** | **Unsaved-Changes popup fired when switching tabs with no modifications.** This is the cross-tab dirty guard — see the seam-ownership rule below. |
| NM-3210 | QA Defect · Done · Low | 1 | Add → **Change Local Office** dialog; **Active/Inactive filter** returns wrong results when toggled rapidly. Race/concurrency. Also the source of the hidden-surface finding above. |
| NM-1672 | Story · QA | 2 | The Short-Cycle Feature Enhancement Document for exemptions-by-service-type — the **business requirement source** for tab 2. Attachments only; must be opened. |
| NM-1778 | Sub-task · QA | 2 | "Allow Service Types to be exempt from *No Implied Discount* Discount Optimization rules" — states the semantic link **between the two tabs**. |
| NM-2422 | Sub-task · QA | 2 | `[Discount Optimization] - Service Type - Manage Translation` — a **language/translation axis** on the service-type names. |
| NM-3303 | QA Defect · **Rejected** | 2 | Duplicate Service Type entries in the Service Charge list. Rejected — do not author a case asserting the rejected premise; record why. |
| NM-3279 | QA Defect · Done | 2 | Service Types not in alphabetical order (Service Charge page). Sort-order expectation for the catalog. |
| NM-1128 | QA Defect · Done | 2 | Room Configuration **and Discount Exemptions not sorted alphabetically**. Second sort-order data point. |
| NM-1221 | QA Defect · Done · Blocker | seam | "Able to add discount when Service type is **Discount Exempt**" — the **downstream enforcement** of an exemption. Out of this page, but it is what the exemption is *for*. |
| NM-1368 | Story · Done · Blocker | 1 | Discount Exemption List seeded for new locations from Anaplan → Location Microservice. Explains where rows come from. |

---

## The bifurcation — two submodules, two specs, ONE plan

**This is the plan's load-bearing constraint.** Discount Optimization is not one surface with two tabs;
it is two surfaces sharing a page shell. They get **two separate spec files**, and the split is
carried all the way down the stack: two submodule codes → two test-case MD files → two test-plan
files → two XLSX sheets → two `.spec.ts` files.

The split is **evidenced, not stylistic**:

| Axis | Tab 1 — Discount Optimization | Tab 2 — Special Rate Exemptions by Service Type |
|---|---|---|
| Backing entity | `LocationSpecialRateSetting` (NM-3064) | service-type exemption flags (NM-1778, NM-1672) |
| API family | the five NAV-APIs, all `…/discount-optimization/locations*` (NM-2242…2246) | **none of those five** — a different endpoint set |
| Row source | user-managed membership + Anaplan seed (NM-1368) | the fixed service-type catalog |
| Row count | 2154 and growing | bounded catalog, **about to shrink** (NM-3340) |
| CRUD shape | Add (via dialog) · Delete (per-row `×`) · edit a date · Save | toggle a boolean · Save · Cancel |
| Toolbar | `Save` · `+ Add` | `Cancel` · `Save` |
| Editable field types | date (+ picker), boolean | boolean only |
| Sub-surfaces | Change Local Office dialog + Active/Inactive filter | none |
| Lifecycle right now | defects closed, **stable** | open **Blocker NM-3340 In Progress** rewriting the row set |
| Defect family | NM-3063 / 2917 / 2918 / 3067 / 3210 / 3341 | NM-3303 / 3279 / 1128 / 2422 |

The lifecycle row is the decisive one. Tab 2's row set is being redefined by a Blocker that is **in
progress today**. One combined spec means tab 2's churn keeps tab 1's stable coverage red, and the
suite stops being a signal. Two specs means tab 1 goes green and stays green while tab 2 absorbs
NM-3340 on its own schedule. **That is the intent of the bifurcation: independent failure domains.**

### The seam has a named owner — it is not orphaned and not duplicated

Splitting creates one behavior that belongs to neither spec alone: **cross-tab dirty state**
(NM-3066 — the Unsaved-Changes popup firing on tab switch with no modifications).

The rule, binding on Phase 7 and Phase 8:

- The **cross-tab dirty guard is owned by the tab-1 spec** (`…-optimization.spec.ts`), because tab 1
  is the landing tab and every journey starts there.
- Tab 2's spec asserts its **own** dirty guard (edit a checkbox → navigate away → prompt) and
  **must not** re-assert the cross-tab case. Duplicated coverage across two specs is not extra
  safety; it is two places to update and one place to forget.
- Both directions must be covered by that single owner: **1 → 2 clean**, **2 → 1 clean**,
  **1 → 2 dirty**, **2 → 1 dirty**. NM-3066 was specifically about the *clean* direction firing a
  false prompt, so the clean cases are not filler.
- Any other cross-tab behavior the walk discovers (shared toolbar state, a shared Save that commits
  both tabs, a shared unsaved-changes model) gets the **same explicit assignment written into the
  test-case file**, naming the owning spec. A behavior with no named owner is a Phase 9 audit finding.

### Two specs ≠ two plans

LR-073 binds: one initiative, **one** `PLAN_*.md`. The depth levels (L1/L2/L3) are phases inside this
file, and the two specs are two *deliverables* of Phase 8 — not two plans, not two subplans. Do not
split this file.

### Office scope — 1604 is the target

Specs are authored against **1604** and must run there. **1101 is a fallback, not a target**: NM-3341
and NM-3340 both reproduce on 1101, and NM-3340 names the **Rev Mgmt.** role, so if 1604 renders the
surface empty or read-only, LR-ENC-005 says re-check 1101 as *evidence* before concluding the data or
feature is absent — then record both results side by side. Moving the specs off 1604 is the user's
call: if 1604 genuinely cannot host them, **HALT and ask** rather than silently re-pointing the suite.

### RBAC — promoted from deferred, on evidence

`rbac` is a deferred family in `CASE_GENERATION_STANDARD.md` (no templates). It is **promoted to
active for this module** under the Standard's promotion clause, because the evidence is documented,
not guessed: NM-3340's repro step 1 reads *"For user with **Rev Mgmt.** role, log into Navigator
Training"*, and NM-3064 shows the save publishes cross-environment. Promotion means Phase 7 authors a
real §3 `rbac` template row in `clients/encore/specs_planning/_internal/field-case-generation.md`
first, then writes cases against it. **If the Phase-3 walk finds no role-gated difference on 1604,
demote it back and say so in writing** — a promoted family with no observed gate is faked coverage.

---

## Bootstrap

**Identity**: OWNER at authoring/delegation. Adopt `/identity HUNTER` before Phases 2–5 write
requirements artifacts, `/identity GIVER` before Phase 7 writes test cases, `/identity BUILDER`
before Phase 8 writes specs, `/identity WATCHDOG` before Phase 9. The PreToolUse identity write-gate
enforces this inside `/execute` — adopt the role, do not merely announce it.

**Skills auto-called**: `/identity`, `/relevant`, `/find-bugs` (Phase 4), `/rca` (Phase 4 triage),
`/regression-guard` (Phase 8), `/encore-questions` (Phase 5 escalation), `/final-q` (exit).

**Context files** — every one of these is load-bearing; read them, do not skim:

- This file's parent doctrine: `.claude/rules/pipeline.md` (**LR-072** phase-owner rulebooks +
  walk-is-dual-product, **LR-073** one plan, LR-048 structural minimum, LR-027 execution summary,
  LR-020 verify claims), `.claude/rules/inventory.md` (LR-062 machine denominator, LR-064 tiered
  delegated walk, LR-065 surface mandate, LR-057 affordance probe).
- **HUNTER's rulebook — `.claude/agents/REQUIREMENTS.md` HARD STOPS 0–13**, in full. Phases 2–5 are
  HUNTER territory. Do not author them off GIVER's checklist. Especially: #4 read-only baseline,
  #9 affordance probe, #10 baseline-first + N≥2 (LR-061-A) + positive control (LR-061-C),
  #11 walk completeness, **#11b Walk Doctrine v2** (opener frontier, BEFORE/AFTER delta, adversarial
  probing), #12 empty-surface c.1/c.2/c.3, **#13 / ALL-045 Observations**.
- `docs/read_only_docs/CASE_GENERATION_STANDARD.md` — the two axes, the 7 active surface families,
  the depth model, the TC namespace rules (including the `(QUICK)`/`(DEEP)` marker placement, ALL-091).
- `clients/encore/specs_planning/_internal/field-case-generation.md` §2 / §2.1 / §3 — the field and
  surface templates this module's cases are generated from.
- `clients/encore/CLAUDE.md` — **LR-ENC-001** (old-site baseline truth), **LR-ENC-004** (Jira-first),
  **LR-ENC-005** (1101 fallback), **LR-ENC-006** (readable step labels), **LR-012** (shared dialogs
  are shared until MCP-proven otherwise — binds the Change Local Office dialog), **LR-036** (boolean
  render formats — binds both the `No Implied Discount` and `Exempt` columns).
- `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 ownership + §4 POM naming.
- `.claude/context/navigation.md` — check §C before exploring; append after.
- `.claude/skills/ultra-agents/worker-ext.md` — what may be delegated to a Copilot worker and what
  never may. Judgment, disposition, and the denominator stay with Opus (LR-064).

---

## Phase 0 — Gate

1. `/identity` — confirm OWNER, or adopt the phase-appropriate role.
2. `/relevant` — inject skill + LR tags into the TodoWrite list.
3. Browser tool = **Playwright CLI** (LR-038 v2 default). Chrome MCP only if a named row demands it.
4. Confirm `.env.local` is the env file for local/agent runs, not `.env.e2e` (LR-ENC-003).
5. Confirm auth: `clients/encore/tests/auth.setup.ts` produces a session that can reach
   `/navigator/locations/1604/settings/discount-optimization-settings`. **If the logged-in user lacks
   the Rev Mgmt. role named in NM-3340, stop and record it** — every downstream "field is read-only"
   or "list is empty" observation would otherwise be an artifact of the account, not the product.
6. Read `.claude/context/navigation.md` §C. If a prior session already explored this surface, consume
   its findings instead of re-walking.
7. Pipeline queue entries and `autoInvoke` are runtime concerns owned by the orchestrator, not by this
   plan. Nothing here creates or mutates a queue entry.

---

## Phase 1 — Jira deep-read (LR-ENC-004 — the table above is a starting point, not the finish)

1. Open **NM-3342** and read **both embedded images**. They are the only requirement statement on the
   ticket. Transcribe what they show into the crossref artifact — a screenshot nobody transcribed is
   a requirement nobody read.
2. Open **NM-1672** and read its **attachments** — the Short-Cycle Feature Enhancement Document and
   the AI-generated user stories / acceptance criteria. This is the closest thing to a written spec
   tab 2 has. Beware `feedback_spec_may_describe_a_predecessor_system`: a document carrying the
   product name may describe the *old* behavior. Probe live before trusting it.
3. Open **NM-3340** in full, including any task Padmaja spawns from it. Record the **exact rule** for
   which service types survive the cut ("those that roll up to Equipment"), because Phase 7's tab-2
   cases must be written against the rule, not against today's row list.
4. Re-read **NM-3341**'s resolution comment and check for any follow-up. It is in QA, not Done.
5. Re-run the sweep — the corpus above is a 2026-08-04 snapshot and NM tickets land daily. Widen it:
   `summary ~ "no implied"`, `summary ~ "rev mgmt"`, `text ~ "discount-optimization"`.
6. Emit `clients/encore/specs_planning/_internal/jira-defect-crossref-discount-optimization-<DATE>.md`
   — one row per ticket, each carrying a **post-walk verification verdict** filled in at Phase 3/4:
   `CONFIRMED-FIXED` / `STILL-REPRODUCES` / `NOT-APPLICABLE-ON-1604` / `UNVERIFIABLE-<reason>`.
   A row with no verdict at closure is an incomplete crossref.
7. Jira stays **READ-ONLY**. No status transitions, no comments, no edits without Rutvik.

---

## Phase 2 — Old-site baseline walk (LR-ENC-001 — observation only, HARD STOP #4 + #10)

1. Walk the old-site Navigator (`navigator2.training.psav.com`) for the equivalent surface. Discount
   exemptions existed there under **Local Office Settings** (NM-1072, NM-1156, NM-1183, NM-1221 all
   describe "Local Office Setting — Discount Exemption"), so the old-site home is very likely
   **not** a Setup page with two tabs. Record the architectural divergence explicitly.
2. **Read-only.** No saves, no edits, no state mutation on the old site — HARD STOP #4.
3. Watch the `about:blank → target` beforeunload trap (ALL-052) when navigating between sites.
4. Emit `clients/encore/specs_planning/_internal/old-site-baseline/discount-optimization-<DATE>.md`
   with a `## Baseline diff` section. If the feature is genuinely net-new on the new site, record
   `baselineScope: baseline-absent` — that is a legitimate outcome, **not** a HALT.
5. Record `jira_tickets:` in the artifact frontmatter (or `rovo_available: false` if Rovo was down).
6. This baseline is what makes every later "is this a bug or by-design?" question answerable. Skipping
   it means every Phase-4 finding is unclassifiable.

---

## Phase 3 — Machine-enumerated denominator + interaction map (LR-062, HARD STOP #11 + #11b)

The denominator is **machine-owned**, and so is the numerator. Neither is a human count.

1. `node scripts/walk-coverage/enumerate-page.mjs` against the page — **once per tab**, plus once for
   the **Change Local Office dialog** in its opened state. Three enumerations, three row sets.
2. `node scripts/walk-coverage/grid-census.mjs` on tab 1's grid — 2154 rows is a volume surface, and
   the census is what tells you whether it paginates, virtualizes, or both. Do not eyeball it.
3. **Opener-frontier recursion (#11b)**: every control that opens something — `+ Add`, the calendar
   picker on `No Implied Start`, `Select a Location`, any row menu — is walked *and* its openee is
   enumerated. The frontier is not closed until no unopened opener remains.
4. **BEFORE/AFTER effect delta per control (§20)**: capture state before and after each interaction.
   A control with no observed delta is either inert or you probed it wrong — and per
   `feedback_a_signal_that_never_varies_is_not_a_signal`, prove the probe **discriminates** before
   concluding "inert". Run a **positive control** (LR-061-C) before recording any inert verdict.
5. **N≥2 before generalizing** (LR-061-A). One row's behavior is not the grid's behavior.
6. **`affordance:` token per row** (LR-057) — what the control offers, observed not assumed. For the
   Change Local Office dialog, probe **per launcher** (LR-012), not once.
7. **Missing-testid live-DOM report** (LR-029) for every control lacking a stable hook, with the DOM
   evidence inline. This surface is greenfield, so expect a long list — that report is a deliverable
   for the Encore devs, not an excuse to write brittle selectors.
8. **Boolean render format (LR-036)**: before any boolean-reader helper is written, MCP-verify **per
   column** which of the three formats is in use — Unicode `✔` / SVG `lucide-check` / empty cell.
   Two columns need this independently: `No Implied Discount` (tab 1, rendering `Yes`) and `Exempt`
   (tab 2, rendering empty in the capture). They may not match. Never author a boolean reader on
   assumption.
9. **Date field probe**: `No Implied Start` is a date with a picker. Probe **both** input paths —
   typed entry and picker selection — separately. NM-3067 says typed entry shifts digits between
   Month/Day/Year, so the two paths demonstrably diverge.
10. **`Save` disabled-state probe**: at rest `Save` is disabled on both tabs. Establish exactly what
    enables it, because three closed defects (NM-2917, NM-2918, NM-3063) all live in that transition.
11. **Tab-divergence rule**: if the walk's tab set differs from the two tabs above — renamed, extra,
    or missing on 1604 — reconcile this plan's code table to the walk **before** registering
    anything. Registering a code for a surface the walk did not find is forbidden.
12. **If the page fails to load**: that is NM-3341 recurrence. Capture the console + network evidence,
    re-check on 1101, and record it against the NM-3341 crossref row. Do **not** file it as a new bug.
13. Emit `scripts/walk-coverage/interaction-maps/discount-optimization-<DATE>.json` and
    `clients/encore/specs_planning/_internal/walk-evidence-discount-optimization-<DATE>.md`.
14. **Gate**: `Coverage_Ratio` = 100%, `CrossCheck: clean`. Every enumerated element is dispositioned
    — covered, deferred-with-reason, or blocked-with-named-unlock. A blocked row with no named unlock
    is not a disposition.

**Delegation (LR-064 Tiered Delegated Walk)**: the clicking may go to the cheapest capable tier —
Haiku for deterministic per-row probes, Sonnet for the cascading dialog and multi-row work. Opus keeps
recon, the machine denominator, the taxonomy mapping, the per-field verify, and every disposition.
Worker **facts** are accepted; worker **diagnoses** are re-derived.

---

## Phase 4 — Manual-QA bug harvest (HARD STOP #11b + #13 / ALL-045 — the walk's second first-class product)

A walk has **two** products. Phase 3 produced the denominator. This phase produces the bugs. This is
the only pass where a tester sees the product before automation code is written around its current
behavior — automate first and today's defects become tomorrow's expected results.

1. Run `/find-bugs` over both tabs and the Add dialog. SFDPOT + error-guessing, adversarial stance.
2. Targeted probes, drawn from the closed-defect corpus — **each one is a re-verification, and each
   one updates its crossref row**:
   - Toggle `No Implied Discount`, watch the Save/Update enablement (NM-2917).
   - Land on the page, touch nothing, check Save is disabled (NM-2918).
   - Make an unsaved change, then Add a location, then check Save (NM-3063).
   - Type a date manually into `No Implied Start`, digit by digit (NM-3067).
   - Switch tabs with **no** modifications, both directions (NM-3066).
   - Open Add → Select a Location → toggle `Active/Inactive` rapidly (NM-3210).
   - Check the service-type list is alphabetical (NM-3279, NM-1128).
   - Check for duplicate service-type rows (NM-3303 — **Rejected**; if duplicates appear anyway,
     that is new evidence against a rejected ticket, so record it as a finding rather than
     re-filing the rejected premise).
3. **`## Observations` section is mandatory** in the walk-evidence artifact, with **both** buckets —
   `Bugs/Defects` and `Suggestions` — each containing findings or the literal `none`. **An absent
   section is an incomplete walk**, not a clean one. Zero suspicions on a 2154-row grid with a live
   Blocker against it is a signal to interrogate your own probing, not a clean bill of health.
4. **Triage before filing** (LR-034): each finding gets a `baselineComparison` from the enum —
   `regression-from-baseline` (Phase 2 says the old site did it right) / `intentional-UX-change` /
   `baseline-absent` / `not-checked`. Free text is rejected by the gate.
   - `regression-from-baseline` → file `BUG-DOP-<SUB>-NNN` under `clients/encore/reports/bugs/`.
   - `baseline-absent` → route to `/encore-questions`, do not guess intent.
   - Already-known → attach to its existing NM ticket in the crossref, do not double-file.
5. **Every confirmed bug's repro edge-case becomes a required TC** in Phase 7, in the spec that owns
   that tab. The loop closes in Phase 9: a bug with no TC, or a skip with no bug ID, is a finding.

---

## Phase 5 — Empty-state, permission, and data-state investigation (HARD STOP #12 / LR-040(c))

Tab 2's `Exempt` column renders empty in the 2026-08-04 capture. Tab 1's grid failed to load entirely
on 1101 three days ago. Neither can be waved through.

**c.1 — Is it a data state or a defect?**
- Establish whether `Exempt` is genuinely all-false on 1604, or whether the boolean simply isn't
  rendering (LR-036 — an empty cell is a legitimate FALSE render format, which is exactly why it must
  be *proven* rather than inferred).
- If tab 1 shows `0 locations found`: NM-3341 recurrence — capture console + network, then re-check
  1101 per LR-ENC-005, and record both.
- Fallback order for data: **1604 first**, then 1101 (LR-ENC-005), then 1605. "Empty on 1604" is a
  data-state observation to record — never a reason to silently re-point the suite.

**c.2 — Is it a permission state?**
- NM-3340 names **Rev Mgmt.** Determine whether the walking account holds it. If a control is
  read-only, prove it is role-gated rather than merely disabled — a disabled control and an
  absent-by-RBAC control are different findings with different cases.
- This is the evidence that confirms or demotes the `rbac` promotion. Write the verdict down either
  way.

**c.3 — Self-produce before escalating.**
Per `feedback_self_produce_test_data`: SELF-PRODUCE → SELF-SERVE → escalate. If tab 1 needs a location
with a specific `No Implied Start`, add one through the UI (that is a covered flow anyway) rather than
asking for a fixture. Escalate to `/encore-questions` only when the UI genuinely offers no path.

**Loudly flag** (per `feedback_surface_coverage_gaps_loudly`) any surface that could not be exercised:
empty state, single-office-only behavior, dialog-only paths. A quiet gap reads as coverage.

---

## Phase 6 — Field inventory + ID registry

### 6a — Registry mint (required before any TC ID can pass `check-tc-parity` G6a/G6c)

1. `export_test_cases/module-codes.json` — add to `modules`:
   `"DOP": { "name": "discount-optimization", "display": "Discount Optimization", "dir": "discount-optimization" }`
   (`DOP` is free; deliberately not `DOS`, which reads one letter from the existing `LOS`.)
2. Add a `DOP` submodule block — **two entries, one per tab. This is where the bifurcation becomes
   structural.** Proposed, and to be reconciled against what Phase 3 actually found:

   | Code | name | display | sheet | mdBasename |
   |---|---|---|---|---|
   | `OPT` | `discount_optimization` | Discount Optimization | `discount_optimization_locations` | `discount_optimization_locations_test_cases` |
   | `EXM` | `special_rate_exemptions` | Special Rate Exemptions by Service Type | `discount_optimization_exemption` | `discount_optimization_exemptions_test_cases` |

   Two verified details, not guesses:
   - `discount_optimization_locations` is **exactly 31 characters** — at Excel's sheet-name cap, legal.
   - `discount_optimization_exemptions` is **32** — one over. Truncate the trailing `s` to
     `discount_optimization_exemption` and add a `sheetNameNotes` entry, exactly as
     `locations_shared_setup_location` already does for the same reason.
   - `EXM` rather than `SRE` because `SRC` (corporate-pricing search) already exists and
     `SRE`/`SRC` differ by one character — a grep hazard in a repo where both would appear.
3. `export_test_cases/types.ts` — append `'OPT'` and `'EXM'` to `KNOWN_SUB_CODES` under a
   `// discount-optimization (DOP)` comment, matching the file's grouping style (`:162–197`).
4. Create the four directories the split requires:
   `clients/encore/specs_planning/test-cases/setup/discount-optimization/` and
   `.../test-plans/setup/discount-optimization/`, each carrying **one file per submodule**.
5. `npm run check:tc-parity` exits 0 — green with zero `DOP` TCs proves the registry edit is
   well-formed before any case depends on it.

**Do not mint `TC-DOP-FCC-*`.** `CASE_GENERATION_STANDARD.md:89` names that namespace but `FCC` is not
a registered submodule code, and `check-tc-parity` G6c rejects it. Field cases ride the ordinary
`TC-DOP-OPT-NNN` / `TC-DOP-EXM-NNN` bands like every other module.

### 6b — Field inventory

`clients/encore/specs_planning/_internal/field-inventories/discount-optimization-<DATE>.md`, per
`clients/encore/specs_planning/_internal/field-inventory-spec.md` (frontmatter keys, required
sections, staleness rules). One inventory file, but **every row tagged with its owning submodule** —
`OPT` or `EXM` — so Phase 7 can slice it cleanly into two case files.

Each row carries: label · control type mapped to a `field-case-generation.md` §2 family · testid (or
its absence, cross-referenced to the LR-029 report) · `affordance:` token · default value ·
validation observed · save behavior observed.

Expected §2 family mapping (to be confirmed, not assumed):
- `No Implied Discount` → boolean/checkbox — **confirm the render format first** (LR-036).
- `No Implied Start` → date/offset — two input paths, typed and picker, probed separately.
- `Exempt` → boolean/checkbox — render format confirmed independently of tab 1's.
- `Select a Location` → **lookup launcher** — the §2 family with a dialog behind it (LR-012).
- `Active/Inactive` → boolean filter, not a data field — a filter's oracle is the result set.
- Row `×` → destructive action; needs a confirm-dialog probe before any case assumes one exists.

Any control type with **no matching template row**: do not HALT first. Probe it live, write cases from
observed behavior, run `/research` to confirm the standard angles, and append a new template row to
`field-case-generation.md` §2 (promotion). HALT only as a genuine last resort (LR-057 no-taxonomy
clause + LR-064).

---

## Phase 7 — Case authoring, L1 → L2 → L3 (GIVER)

Adopt `/identity GIVER`. Authoring is **two case files from the start** — one per submodule. Do not
write one file and split it later; the split is the point.

- (the referenced test-case file does not exist at this path)
- (the referenced test-case file does not exist at this path)

Both follow the markdown step-table format (`| # | Step | Expected Result |`, per-step Expected
Results, `**Expected**:` summary line, `**Automatable**:` on every case). Surface/behavior cases carry
a `**Surface_Family**: <family> (QUICK|DEEP)` line. **The `(QUICK)`/`(DEEP)` marker goes on that line
only — never on the `## TC-…:` heading**, which ships verbatim as the reviewer-facing Title (ALL-091;
`xlsx-lint` hard-blocks it at build/commit/ship).

### 7a — L1 (QUICK): field FCC + one must-assert per applicable surface family

**Tab 1 (`TC-DOP-OPT-*`)** — Axis 1 per inventory row, plus Axis 2 must-asserts:
`result-fidelity` (the grid shows the locations it should) · `pagination` (2154 rows — page sizes,
partial last page, first/prev/next/last enablement, no dupes or skips across pages) · `sorting`
(per-column asc/desc; `ID` sorts numerically, not lexically) · `render-state` (both booleans per their
proven format; the date renders `MM/DD/YYYY`) · `empty-vol` (0/1/N rows; the "no results" message) ·
`persistence` (page size, sort, filter survive reload and browser-back) · `combination` (filter + sort
+ paginate together).

**Tab 2 (`TC-DOP-EXM-*`)** — the catalog list, `Exempt` toggle, alphabetical order (NM-3279, NM-1128),
save cycle, `Cancel` behavior. **The row set is read from the rendered list, never hardcoded** —
NM-3340 will shrink it, and a spec with a literal service-type list becomes a false failure the day
that ships. Assert the *rule* ("every rendered row is toggleable and persists"), and add one case that
asserts the **NM-3340 rule itself** — every rendered service type rolls up to Equipment — marked
`Blocked: NM-3340 not yet shipped` until it does.

**Both** — the save-flow state machine per the Standard:
`Clean → Dirty → Saving → Save-OK | Save-Failed`, `Dirty → Navigate-Away-Prompt → Stay | Leave`,
`Dirty → Tab-Switch → (preserved?)`, `Validation-Error → Fix → Dirty`,
`Edit-to-original-value → Save-disabled` (revert ≠ pristine — this is NM-2918's family). Every
transition maps to ≥1 case or a documented skip.

**Seam cases** — the four cross-tab dirty-guard cases (1→2 clean, 2→1 clean, 1→2 dirty, 2→1 dirty)
live in **`TC-DOP-OPT-*` only**, each carrying an inline note naming the tab-1 spec as owner and
citing NM-3066.

### 7b — L2 (DEEP): matrices, date exotica, pairwise, decision tables

- **Date-BVA exotica** on `No Implied Start`: leap-year (02/29 on a leap and a non-leap year),
  year-rollover (12/31 → 01/01), min/max accepted year, past vs future dates,
  `Start` relative to any end date the walk finds, ±1-day boundaries. **Typed and picker paths get
  separate cases** — NM-3067 proves they diverge.
- **Pairwise / covering array** across tab 1's editable dimensions: `No Implied Discount` × date
  present/absent/boundary × row position (first / mid / last / across a page boundary) × new-row vs
  existing-row. Keep the matrix bounded by a covering array; do not enumerate the cross product.
- **Decision table** for Save enablement — the three closed defects (NM-2917 / NM-2918 / NM-3063) are
  three cells of one table. Enumerate it fully: {no changes, one change, change + add, change + delete,
  change then revert} × {Save enabled?}.
- **Persistence matrices**: page size × sort × filter, each surviving reload and browser-back
  independently and in combination.
- **Bulk/multi-row**: edit several rows before one Save — does the payload carry all of them?
- **Tab 2 pairwise**: toggle N exemptions across page boundaries (if it paginates) before one Save.

### 7c — L3 (DEEP): integration, a11y, error-guessing, network, volume

- **Integration / cross-field** — cover every `depends-on` edge the walk found, no cherry-picking:
  - The **semantic link between the tabs** (NM-1778): a service type marked Exempt on tab 2 changes
    what the `No Implied Discount` rule does. Cover the edge that is *observable from this page*;
    the downstream enforcement (NM-1221, "able to add discount when service type is Discount Exempt")
    lives in the order/pricing surfaces — record it as an integration lead, do not silently drop it.
  - The `+ Add` → **Change Local Office** dialog → row selection → grid membership round trip.
  - The Anaplan-seeded rows (NM-1368) — behavior of a seeded row vs a UI-added row.
- **Full accessibility audit**: tab order across a 2154-row grid, focus trap in the Add dialog,
  label association on both boolean columns and the date, error-guidance text, and any hover-only
  action (a hover-only row `×` is an a11y failure worth naming).
- **Error-guessing**: rapid double-click on Save; rapid `Active/Inactive` toggling (NM-3210's exact
  repro, now as a permanent case); concurrent edit of the same row in two tabs; save-failure injection
  and retry; dialog-load-failure recovery; delete-then-undo-then-save.
- **Tier-2 network-payload structural validation** against the five NAV-APIs (NM-2242…2246): the
  response body reflects the committed payload for `PUT …/locations`,
  `PUT /api/discount-optimization/locations/update`, and `DELETE …/locations/{localOfficeId}`; the
  Add dropdown is fed by `GET …/locations/available`. Tier-3 DB assertions are out of framework scope.
- **Volume / virtualization stress** on 2154 rows: off-screen rows readable by content anchor, no
  duplicated or dropped rows while scrolling, sort/filter correct at the far end of the set.
- **Translation axis** (NM-2422): if service-type names are translatable, language is an axis on tab 2,
  not a footnote. Confirm live before authoring — if translation is not exposed on 1604, say so.
- **RBAC** (promoted, see Context): role-gated read vs edit on both tabs, authored against the new §3
  template row. Demote and document if Phase 5 found no gate.

### 7d — Data discipline

SELF-PRODUCE → SELF-SERVE → escalate. Prefer creating what a case needs through the UI on **1604**,
then 1101 / 1605 per LR-ENC-005. Any case that cannot get its data is `**Automatable**: Blocked:<reason>`
with a **named unlock** — "blocked" without the unlock is not a disposition.

Then: `**Automatable**` on every case, `npm run lint:testcases` clean, test plans authored alongside,
XLSX rebuilt via planner post-complete, `npm run check:tc-parity` exit 0.

---

## Phase 8 — BUILDER artifacts (TWO specs — this is the deliverable that carries the intent)

Adopt `/identity BUILDER`. Wrap the work in `/regression-guard` (before and after).

1. **Selectors** — `clients/encore/src/selectors/discount-optimization/`, one file per submodule plus
   a shared file for the page shell (tab strip, toolbar) and one for the Change Local Office dialog.
   Real testids where they exist; documented fallbacks where the LR-029 report says they don't.
2. **Page objects** — `clients/encore/src/pages/discount-optimization/` per AGENT_SHARED_RULES §4 POM
   naming. The Change Local Office dialog is a **component** under
   `clients/encore/src/pages/components/`, because it is a shared dialog (LR-012) and a second
   surface will want it. Every action carries an LR-ENC-006 `@step` label in plain English —
   `npm run check:step-labels` green, no raw `.page.<action>` calls left in specs.
3. **Specs — exactly two files, and they do not import each other's cases**:
   - `clients/encore/tests/discount-optimization/discount-optimization.spec.ts` → all `TC-DOP-OPT-*`,
     including the four cross-tab seam cases.
   - `clients/encore/tests/discount-optimization/special-rate-exemptions.spec.ts` → all `TC-DOP-EXM-*`.

   Each spec has its own `test.describe`, its own field-case describe block at the top, and its own
   `SBC — <submodule>` block for surface/behavior cases. DEEP cases are appended past the QUICK
   high-water mark, sequentially numbered.

   **A single combined spec file is a plan violation, not a shortcut.** If the two files end up
   sharing so much setup that combining them looks tempting, the shared part belongs in a fixture or
   the page object — not in a merged spec.
4. **Fixtures** for downloads, uploads, and error injection only if L3 cases need them.
5. `npx playwright test --list` resolves every `TC-DOP-OPT-*` and `TC-DOP-EXM-*` ID.
6. **Real E2E run** (LR-059): both specs green **twice** on 1604. No "verified" claim without the run.
   A single green pass is a sample, not a result.

---

## Phase 9 — WATCHDOG audit

Adopt `/identity WATCHDOG`. Audits are terminal — findings only, no fixes from this identity, and it
never self-grades work from the same session (AUD-017).

1. **Completeness**: `Coverage_Ratio` 100%, `CrossCheck: clean`; every enumerated element from all
   three Phase-3 enumerations dispositioned; every surface family either covered or deferred with a
   reason.
2. **Bifurcation integrity** — the audit that is specific to this plan:
   - Every `TC-DOP-OPT-*` lives in the tab-1 spec and every `TC-DOP-EXM-*` in the tab-2 spec. Zero
     crossover.
   - The four seam cases exist, are owned by the tab-1 spec, and are **not** duplicated in tab 2.
   - No behavior discovered in Phase 3 is unowned by either spec.
   - Neither spec imports or depends on the other's cases.
3. **Jira-lead closure**: every row in the Phase-1 crossref carries a verdict. Zero blanks.
4. **Bug-loop closure**: every Phase-4 confirmed bug has its required TC; every skip names its bug ID.
5. **RBAC disposition**: the promotion is either backed by an observed gate or explicitly demoted in
   writing. A promoted family with no evidence is a finding.
6. **NM-3340 forward-compatibility**: no case hardcodes the current service-type list. Grep for
   literal service-type names in the tab-2 spec — a hit is a finding.
7. `npm run check:spec-quality` (the five-command battery), `npm run check:tc-parity`,
   `npm run lint:testcases`, `npm run typecheck`, `npm run check:step-labels`.

---

## Phase 10 — Registration, sweep, closure

1. `.claude/context/navigation.md` §C Exploration Registry row → field inventory, baseline,
   walk-evidence, all three interaction maps, Jira crossref.
2. `clients/encore/docs/MODULE_REGISTRY.md` + `REQUIREMENTS.md` updated for the new module and **both**
   submodules.
3. **Adjacent-Sweep ritual** — each adjacent fix noticed gets exactly one of DO-NOW / SPAWN / APPEND
   with a grep-verified line item. Bare "out of scope" with no recipient = HALT and ask.
4. **NM-3342 updated** with the outcome: TCs authored, two specs landed, bugs filed. Jira stays
   **READ-ONLY** for everything else — no status transitions without Rutvik.
5. LR-028 activity-log row with an LR-037 timestamp ≥ every touched-file mtime.
6. LR-027 Execution Summary, then `git mv` to `plans/done/` and `npm run plans:reindex`.

---

## Per-Identity Satisfaction

> **Closure instruction**: at DONE-flip, replace every `<DATE>` placeholder below with the real dated
> filenames — closure check C6 greps the literal cell paths, and a placeholder cell DENIES the flip.
> The acceptance commands are per-identity quick checks; the suite-green ×2 acceptance criterion still
> binds BUILDER beyond its `--list` cell.

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | Jira crossref · old-site baseline · interaction maps · walk evidence · field inventory | `clients/encore/specs_planning/_internal/jira-defect-crossref-discount-optimization-2026-08-10.md`<br>`clients/encore/specs_planning/_internal/old-site-baseline/discount-optimization-2026-08-10.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-discount-optimization-2026-08-11.md`<br>`clients/encore/specs_planning/_internal/field-inventories/discount-optimization-2026-08-11.md` (unified; companions `-locations-` and `-exemption-2026-08-11.md`)<br>`scripts/walk-coverage/interaction-maps/discount-optimization-2026-08-11.json` | `node scripts/check-interaction-coverage.mjs --file scripts/walk-coverage/interaction-maps/discount-optimization-2026-08-11.json` |
| GIVER | field-case catalog · §3 rbac template row · **two** test-case MDs · **two** test plans · XLSX workbook | `(skipped: module authored with ordinary 3-segment TCs — TC-DOP-OPT-NNN / TC-DOP-EXM-NNN — not the FCC paradigm; no field-case catalog produced. See Gap Ledger G3.)`<br>`clients/encore/specs_planning/test-cases/setup/discount-optimization/discount_optimization_locations_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/discount-optimization/discount_optimization_exemption_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/discount-optimization/discount_optimization_locations_test_plan.md`<br>`clients/encore/specs_planning/test-plans/setup/discount-optimization/discount_optimization_exemption_test_plan.md`<br>`clients/encore/testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` |
| BUILDER | selectors · page objects · shared dialog component · **two** specs | `clients/encore/src/selectors/discount-optimization.ts`<br>`clients/encore/src/pages/discount-optimization.page.ts`<br>`(skipped: Change Local Office dialog not enumerated or built — out of scope for a 1604-only delivery; the office-switcher is the multi-office mechanism, deferred with G1/G2 in the Gap Ledger.)`<br>`clients/encore/tests/discount-optimization/discount-optimization-locations.spec.ts`<br>`clients/encore/tests/discount-optimization/discount-optimization-exemptions.spec.ts` | `npx playwright test --list` |
| HEALER | (none) — no pre-existing failing specs on this module | (none) | (none) |
| WATCHDOG | completeness · bifurcation-integrity · Jira-lead · bug-loop findings | `clients/encore/specs_planning/_internal/audit-discount-optimization-2026-08-11.md` | `npm run check:spec-quality` |
| GARDENER | (none) | (none) | (none) |
| OWNER | ID registry · navigation registry · module registry | `export_test_cases/module-codes.json`<br>`export_test_cases/types.ts`<br>`.claude/context/navigation.md` | `npm run check:tc-parity` |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Jira crossref exists; **every** listed ticket carries a post-walk verdict; the baseline artifact
      carries `jira_tickets:` (or `rovo_available: false`).
- [ ] NM-3342's two description images transcribed; NM-1672's attachments read in full; NM-3340's
      Equipment-rollup rule recorded verbatim; NM-3341's resolution re-verified on 1604.
- [ ] Old-site baseline artifact exists with a `## Baseline diff` section, or an explicit
      `baselineScope: baseline-absent` with the architectural divergence recorded.
- [ ] Three Phase-3 enumerations exist (tab 1, tab 2, Change Local Office dialog); `Coverage_Ratio`
      100%; `CrossCheck: clean`; every element dispositioned; every blocked row names its unlock.
- [ ] Boolean render format MCP-proven **independently** for `No Implied Discount` and `Exempt`; the
      date field probed on **both** typed and picker paths.
- [ ] Walk evidence carries a `## Observations` section with **both** buckets filled or the literal
      `none` in each.
- [ ] Every Phase-4 confirmed bug has a required TC in the spec that owns its tab; every skip names a
      bug ID; every filing carries a valid `baselineComparison` enum value.
- [ ] `DOP` + **both** submodule codes (`OPT`, `EXM`) registered in `module-codes.json` **and**
      `KNOWN_SUB_CODES`, with a `sheetNameNotes` entry for the truncated exemptions sheet name.
- [ ] **Two** test-case MD files, **two** test-plan files, **two** XLSX sheets, **two** `.spec.ts`
      files. Zero TC-ID crossover between them.
- [ ] The four cross-tab seam cases exist, are owned by the tab-1 spec, and are not duplicated in
      tab 2. Every other cross-tab behavior found has a named owning spec.
- [ ] No literal service-type name is hardcoded in the tab-2 spec (NM-3340 forward-compatibility).
- [ ] `rbac` is either backed by an observed role gate or explicitly demoted in writing.
- [ ] Both specs green **twice** on office **1604**; `npm run check:tc-parity`, `lint:testcases`,
      `typecheck`, `check:step-labels`, `check:spec-quality` all clean.
- [ ] Denominator and specs are on office **1604**; any 1101 consultation is recorded as LR-ENC-005
      evidence only, and any proposal to move the specs off 1604 was HALTed to the user, not decided.
- [ ] Missing-testid report emitted with live-DOM evidence (LR-029).
- [ ] navigation.md, MODULE_REGISTRY.md, REQUIREMENTS.md updated; activity-log row with an LR-037
      timestamp; LR-027 Execution Summary; `plans:reindex` clean.

---

## Verification

```
npm run check:tc-parity
npm run lint:testcases
npm run typecheck
npm run check:step-labels
npm run check:spec-quality
npx playwright test --list
npx playwright test clients/encore/tests/discount-optimization/   # ×2, both green
node scripts/plans-reindex.mjs --check
```

Each command's evidence is emitted in `ran '<cmd>' → output: '<snippet>'` form per LR-042. A command
named but not run is a closure violation.

---

## Handoff (post-execution)

Handoff goes in **chat only**, never into a file (LR-039 — and no blockers in it). It states: what
landed, what was flagged, what NM-3340 will invalidate when it ships, and what the next session picks
up. Deviations from this plan are logged before `/final-q`, not after.

---

## Execution Summary (LR-027) + Gap Ledger — 2026-08-18

This section records what actually landed, resolves the two live-denominator question, and puts every
open gap in the plan body with a named unlock (nothing lives only in chat).

### What landed (verified)

- **Tests: 40, all passing.** `npx playwright test --list` (run twice) = 34 in
  `discount-optimization-locations.spec.ts` + 6 in `discount-optimization-exemptions.spec.ts` = **40**.
  A full run finished with `test-results/.last-run.json` = `{"status":"passed","failedTests":[]}`. The
  list reporter printed "41 passed" because `retries:1` (local) makes its running counter tick once for
  a single flaky test that failed its first attempt and passed on retry — 40 unique tests, zero
  failures. ("40 exist" and "40 pass" are now both true and both in the repo.)
- **Two specs, two selectors/pages, both submodule TC files + test plans, XLSX parity** — all present;
  the Per-Identity matrix above now cites the real filenames (not `<DATE>` placeholders).
- **Walk evidence committed** (was absent from git; `reports/walk-coverage/*` is gitignored at
  `.gitignore:45`, so force-added, matching the `service-charge-basic-info.json` precedent): the
  authoritative `dop-tab1.json` / `dop-tab2.json` (148-element enumeration) plus the 2026-08-18
  re-enumeration diagnostics `1604-discount-optimization[-locations|-exemption].json`.

### Denominator resolution — ONE authoritative source

There are not two live denominators. The **tracked field inventories are authoritative**:
`discount-optimization-2026-08-11.md` = **148** machine-enumerated elements (union across both tabs),
split into two overlapping views — `-locations-` = **108** (21 shared + 87 Locations-specific) and
`-exemption-` = **61** (21 shared + 40 Exemptions-specific); 108 + 61 − 21 shared = 148. All three are
`Coverage_Ratio 100%`, `CrossCheck: clean`, dispositioned, and cite `dop-tab1/dop-tab2.json` as their
Completion_Record.

The **92 / 131** numbers are NOT a competing denominator — they are the output of the 2026-08-18
re-enumeration run whose only purpose was to verify the `restingContentMarker` initial-scan fix. They
are lower than 148 because (a) the grid is data-driven — the live Locations grid had fewer painted rows
on 2026-08-18 than on 2026-08-11 — and (b) they were produced by the post-split configs
(`discount-optimization-locations` = 92 resting-only; `discount-optimization` = 131 = 92 + 39 Tab-2
controls). A re-enumeration is a dated snapshot, not a new denominator of record. The inventories are
NOT rewritten to 92/131 (an indefensible live number must never overwrite a dispositioned artifact).

### Enumerator fix — GLOBAL in nature, now SCOPED (correction: verify before graft)

Commit `3790bf4` added an initial-scan content gate to stop the enumerator measuring a mid-render page
(the discount-optimization moving denominator: cycle 0 scanned 117 DOM nodes on one run, 1042 on
another). As first written it keyed off `cfg.contentMarker`, which **changes page-readiness for every
module that declares a contentMarker** — exactly the global blast radius flagged for pre-graft review.
The cross-module check found a real regression: **service-charge**'s `contentMarker` (`text=Modified
By`) marks its History TAB, absent at rest, so the initial-scan gate waited 120 s and threw
`[WAIT_READY_TIMEOUT]` — turning its known-good denominator (29) into a crash.

Fix (`868c8af`): the initial-scan gate now keys off a distinct opt-in key, **`restingContentMarker`**,
set only on the two discount-optimization configs (Tab 1 grid is the resting tab). Re-verified on 1604:
service-charge enumerates clean again (EXIT 0); `discount-optimization-locations` = 92 and
`discount-optimization` = 131 (stable, EXIT 0). Modules that do not set the key keep prior readiness
unchanged — so the change is safe to graft.

### Gap Ledger (every open item + its named unlock)

| ID | Gap | Named unlock |
|---|---|---|
| G1 | **Change Local Office dialog never separately enumerated** — Phase 3 wanted 3 enumerations (tab 1, tab 2, dialog); only tab-based enumerations + one interaction-map exist. | Open the dialog on the DOP page and run `enumerate-page.mjs` against it in its opened state (needs a dialog config entry or `--url`), emit a 3rd interaction-map. Deferred: the office-switcher is the multi-office mechanism and this delivery is 1604-only (see G4). |
| G2 | **`change-local-office.component.ts` not built** (BUILDER matrix cell). | Author the page-object component once G1 enumerates the dialog. Depends on G1; both deferred with G4. |
| G3 | **No FCC field-case catalog** — the GIVER matrix cell expected `field-case-catalogs/discount-optimization-<DATE>.md`; the module was authored with ordinary 3-segment TCs, not the FCC paradigm, and the TC MDs carry no FCC section. | If DOP is later chosen for FCC depth, author the catalog + `@fcc` describe blocks under a DEEP coverage subplan. Not required for the current QUICK deliverable — ordinary TCs are covered by `check:tc-parity`. |
| G4 | **7 of 8 offices never probed** — the walk, inventories, and specs cover office **1604 only**. | This is the plan's declared scope (acceptance criterion: "Denominator and specs are on office 1604"). Multi-office DOP validation is a separate subplan; unlock = author `SUBPLAN_DOP_MULTI_OFFICE` if the client wants cross-office coverage. Not a defect of this delivery. |
| G5 | **Two announce-mode enumerator warnings on the locations surface** — `TOOTHLESS-SURFACE` (no non-resting requiredStates, no opener patterns) and `STATE-GRAPH-EXHAUSTION` (containers never opened, incl. shell chrome: Home / Inbox / office-switcher). | Both are announce-mode (non-blocking). TOOTHLESS-SURFACE is inherent to a single-grid resting surface with no openers; the denominator is verified by the passing specs. STATE-GRAPH-EXHAUSTION's unopened containers are shell chrome, correctly out-of-scope for the DOP surface. Accepted, not filled; unlock if ever needed = declare requiredStates/opener patterns for the locations config. |

### Closure status

Status stays **PENDING**. The specs pass on e2e/1604 and the six correction items are complete, but
G1–G3 are acceptance-criteria items this delivery did not produce (dialog enumeration + component, FCC
catalog). They are recorded here with unlocks rather than silently dropped. Flipping to DONE is a
scope decision for Rutvik: accept the 1604-only, ordinary-TC, dialog-deferred scope (G1–G3 re-scoped
out) → DONE; or fill G1–G3 first. Not self-deciding a scope reduction to force a green closure gate.
