# PLAN_TERMS_CONDITIONS_AUTOMATION — automate Location Settings › Terms and Conditions (NM-3346)

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
**Jira**: NM-3346 (Story, Highest, In Progress) · Epic NM-1731
**Skills**: /identity, /relevant, /find-bugs, /rca, /regression-guard, /encore-questions, /final-q

---

## Context

`https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/terms-conditions` has never
been intaken. As of 2026-08-04 the repo carries **zero** Terms and Conditions assets — `git ls-files
| grep -iE "terms|conditions"` returns nothing, no `TNC`/`TAC` module code in
`export_test_cases/module-codes.json`, no submodule codes in `KNOWN_SUB_CODES`, no page objects, no
selectors, no specs, no test-case directory, no field inventory, no old-site baseline.

**This is one plan on purpose (LR-073).** Claude executes it as CEO and delegates the labour to
Copilot workers per `.claude/skills/ultra-agents/worker-ext.md`; the plan is a *delegation spec*, not
a context container. Intake, L1, L2 and L3 depth are phases below, each with its own closure
criteria — not separate subplan files.

### The Jira mandate is a screenshot with no words

**NM-3346** = "Automate → Setup → Terms and Conditions", Story, **Highest**, In Progress, reporter
Aruna Yaganti, created 2026-08-03. Its entire description is one embedded image; **zero written
acceptance criteria, zero comments, zero linked issues, zero components**. The ticket authorises the
work and sets priority — it does not define scope. Scope therefore comes from the walk plus the
sibling-ticket corpus below, and anything still ambiguous routes to `/encore-questions` rather than
being invented.

### Sibling-ticket leads (2026-08-04 sweep, `project = NM AND summary ~ "terms"`, 28 hits, 14 relevant)

**Every row is a LEAD, re-verified against DOM truth before it enters any artifact (ALL-024 /
LR-ENC-004).** A Jira-vs-DOM divergence is signal, classified per REQ-014 (intentional-UX / app-bug /
stale-ticket) — never an automatic "Jira wins".

| Ticket | State | Lead — what it implies for coverage |
|---|---|---|
| **NM-1731** | Epic, To Do | The parent epic. Read it first; it may carry the acceptance criteria NM-3346 omits. |
| **NM-1736** | Story, **QA** | "TC - UI: Terms and Conditions page" — the primary page story, still in QA. Its acceptance criteria are the closest thing to a spec. |
| **NM-2191** | Story, **QA (OPEN)** | "Unsaved changes warning modal is not displayed while leaving the page or editing another…" — **the dirty-navigation guard may be BROKEN OR UNBUILT right now.** Do NOT author a state-transition case asserting the prompt fires until the walk proves it does; if it does not, that is a known-gap case, not a passing test. |
| **NM-3338** | QA Defect, Done | "Users without **CORP_LEGAL** permission cannot access Terms & Conditions from the Setup menu but ca…" — **documented role-gating.** See the RBAC promotion decision below. |
| **NM-3162** | QA Defect, Done | "HTML Editor Does Not Clear After Selecting a Non-HTML Column" — there is an **HTML editor panel** with a documented cross-selection state-leak class. Free regression armour. |
| **NM-3163** | QA Defect, Done | "Tooltip displays `&nbsp;` instead of spaces for records containing non-breaking…" — **HTML-entity rendering** in tooltips. Free regression armour. |
| **NM-2315** | Story, Done | "API: get Terms & Conditions Text by **Language Id**" — the data is **language-keyed**; every case is language-scoped, and multi-language is a first-class axis, not an edge case. |
| **NM-645** | Story, Done | "Core — Terms and Conditions options endpoint" — the options/dropdown source. |
| **NM-2189 / NM-2331** | Story / Sub-task, Done | Standalone web component (Client) — the surface is an **MFE web component**, not plain monolith Angular. Expect shadow/portal DOM; `enumerate-page.mjs` is shadow-piercing, hand-written selectors are not. |
| **NM-1758** | Story, Done | "Angular Monolith Redirect (Host)" — routing may bounce host↔MFE; confirm the URL above is the terminal route. |
| **NM-1200** | QA Defect, Done | "'Terms and Conditions' Column Missing in Location Management History" — **T&C edits are expected to surface in Location Management History.** That is a cross-module integration edge, and `location-management-history.page.ts` already exists to assert it. |
| **NM-825 / NM-664** | Story, Done | "Legal Tab — Terms/Conditions and Service Charge are **required for each language**" — a second consumer surface (Legal tab) and a per-language required-ness rule. `location-legal.page.ts` already exists. |
| **NM-1839** | Story, Done | "Auto-assign `ShowQuote_TermsConditionID` for en-US locations when new location is created" — a defaulting rule that may explain pre-populated rows. |
| **NM-1735** | Story, QA | "Kafka consumer: Sync to Helioscorp" — downstream sync. **Explicitly out of scope** for UI automation (no UI oracle); record as `out-of-scope:integration-kafka=downstream Helioscorp sync has no UI-observable oracle in this surface`. |
| **NM-1544** | QA Defect, To Do | "Location; Legal Updates are not saving to the database" — an OPEN persistence defect on the adjacent Legal tab. If a T&C save appears not to persist, check this before filing a new bug. |

### RBAC promotion — evidenced, not faked

The Case-Generation Standard lists `rbac` as a **deferred family with zero templates**, promotable
"the first time a module genuinely needs one". **NM-3338 is that evidence**: access to this surface is
gated on the `CORP_LEGAL` permission. Phase 7 therefore **promotes `rbac` to an active family for
this module** per the Standard's promotion clause — adding a real template row to
`field-case-generation.md` §3, not asserting coverage. `concurrency` and `platform` stay deferred.

**If a second credentialed role is not available in `.env.local`**, the promotion still stands but
its cases are `DATA-BLOCKED` with the unlock named (which role, who provisions it) per
`feedback_blocked_reasons_name_the_unlock.md` — never silently dropped.

### Office scope — 1604 is the target

The target office is **1604**, the standing test office (`clients/encore/CLAUDE.md`). Specs are
authored against 1604 and must run there.

**1101 is a fallback, not a target.** The `CORP_LEGAL` gate (NM-3338) means this surface may be
corporate-scoped, and LR-ENC-005 says an empty or absent result on a corporate-flavoured surface must
be re-checked on 1101 ("Corporate Office") before concluding the data is missing. So: walk 1604 first;
consult 1101 only as evidence when 1604 comes up empty, and record what 1101 showed. Moving the specs
off 1604 is a decision for the user, not an executor — if 1604 genuinely cannot host them, HALT and
ask rather than silently re-pointing the suite.

---

## Bootstrap

**Identity**: OWNER shell. Adopt `/identity HUNTER` before Phase 1–5 artifacts, `/identity GIVER`
before any test-case / test-plan / catalog write, `/identity BUILDER` before any spec / page-object
write, `/identity WATCHDOG` for Phase 9. Frontmatter declares; the PLAN_IDENTITY_ENFORCEMENT Layer-1
write-gate enforces at write time.

**Context files**:
- `.claude/agents/REQUIREMENTS.md` — **HUNTER HARD STOPS 0–13. Phases 1–5 are HUNTER phases; read all fourteen before the first browser call (LR-072).**
- `.claude/agents/PLANNER.md` (GIVER) · `.claude/agents/GENERATOR.md` (BUILDER) · `.claude/agents/AUDIT.md` (WATCHDOG)
- `.claude/skills/ultra-agents/worker-ext.md` — what to delegate, what never to, how to write a finishable ticket
- `docs/read_only_docs/CASE_GENERATION_STANDARD.md` — two axes, depth model, **promotion clause**, TC namespaces, step-table format, linter rules
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — §2 ownership, §4 POM naming, §20 Walk Doctrine v2, ALL-024, ALL-045, ALL-071, ALL-091
- `docs/read_only_docs/LEARNED_RULES.md` · `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (§2 Table 2 — LR-054)
- `clients/encore/CLAUDE.md` — LR-008, LR-012, LR-017, LR-036, LR-ENC-001..005
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` · `field-case-generation.md` (§2, §2.1, §3)
- `.claude/rules/`: `inventory.md` (LR-013, LR-029, LR-057, LR-062, LR-064, LR-065, LR-040-D) · `pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-048, LR-060, **LR-072, LR-073**) · `browser-tool.md` · `baseline.md` · `angular.md` · `specs.md` · `data.md` · `deliverable.md` · `plan-closure.md` · `guardrail-policy.md`

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
2. Read `.claude/context/navigation.md` — Terms and Conditions is absent from the Exploration
   Registry as of 2026-08-04; Phase 10 registers it.
3. Read `agent-mistakes.md` (`REQ-*`, `PLN-*`, `BLD-*`, `ALL-*`) and `.claude/context/patterns.md`.
4. LR scan per the Context files list.
5. **Browser-tool announcement**: `BrowserTool=cli` — multi-control catalog walk, an HTML-editor
   panel, deterministic probe batteries, unattended, grep-over-disk on the snapshot YAML. On an Entra
   redirect follow `.claude/rules/browser-tool.md` Gate 3 (headed `--persistent
   --profile=.auth\e2e-profile` → sign-in → `state-save -s=e2e` → resume) and log the
   `[BROWSER-SWITCH]` row.
6. **Execution model**: plan-driven (LR-060 / LR-027 closure), NOT the pipeline queue — no
   `agent-queue.json` entry is created and `autoInvoke` does not apply; pipeline identities are
   adopted as skins per phase.

---

## Phase 1 — Jira deep-read (LR-ENC-004 — the corpus above is a starting point, not the finish)

1. Read **NM-1731** (epic) and **NM-1736** (page story) in full, including attachments and the
   NM-3346 description image, for acceptance criteria the summaries do not carry.
2. Read **NM-2191**, **NM-3162**, **NM-3163**, **NM-3338** in full — these four define concrete,
   already-observed behaviours and become regression-armour TCs in Phase 7.
3. Search Confluence for a Terms & Conditions spec page.
4. Write `clients/encore/specs_planning/_internal/jira-defect-crossref-terms-conditions-<DATE>.md`
   with every ticket, its status, its one-line claim, and its **verification verdict after the walk**
   (confirmed / diverged / stale). The table in this plan's Context seeds it — expand, do not merely
   copy.
5. Add `jira_tickets: [NM-3346, NM-1731, NM-1736, NM-2191, NM-3338, NM-3162, NM-3163, NM-2315, …]`
   to the baseline artifact frontmatter — that key is the greppable structural proof this pass ran.
   Rovo unavailable → record `rovo_available: false` and consume the committed crossref; never
   silently skip.

---

## Phase 2 — Old-site baseline walk (LR-ENC-001 — observation only, HARD STOP #4 + #10)

1. `https://navigator2.training.psav.com/#/`, locate the Terms and Conditions counterpart.
2. **Observation only**: no clicks, no typing, no saves on the old site. The HARD STOP #9 carve-out
   permits opening a picker and Cancel/Esc to read an affordance — never Select or Save.
3. Emit `clients/encore/specs_planning/_internal/old-site-baseline/terms-conditions-<DATE>.md`.
4. No old-site counterpart → record `baselineScope: baseline-absent`. **Not a HALT** — the artifact is
   still written, stating what was searched and what was found. Given NM-2189/NM-2331 rebuilt this as
   a standalone web component, a genuine architectural divergence from the old site is likely; that
   is a classification, not a blocker.
5. New site next; classify every divergence as (a) regression-from-baseline, (b) intentional UX change
   citing the Phase-1 crossref, (c) baseline-absent. Emit a `## Baseline diff` section.
6. **N≥2 before any generalization** (LR-061-A): a behaviour claim needs two independent sources —
   two offices, or new-site plus baseline. One office is a data point, never a conclusion.

---

## Phase 3 — Machine-enumerated denominator + interaction map (LR-062, HARD STOP #11 + #11b)

1. Run `node scripts/walk-coverage/enumerate-page.mjs` against the surface. **The live page
   enumerates itself — never self-count.** Per NM-2189/NM-2331 this is a standalone web component:
   expect shadow/portal DOM. The enumerator is shadow-piercing and self-expands to a fixpoint; a
   hand-written selector sweep is not, and is forbidden as the denominator.
2. **Walk Doctrine v2 (§20)**: the denominator covers the LANDING state only. Every opener revealed
   during the walk — dialog, menu, popover, tab, edit-mode, the HTML-editor panel, any row expander —
   spawns its own enumeration and probe pass, recursively, until the opener frontier is empty.
   Un-openable = a named blocker row, not a silent gap.
3. Every filter / toggle / sort / pagination / edit / guard / io control needs a **BEFORE/AFTER effect
   delta**. Presence and an options-list are not a walk.
4. `node scripts/walk-coverage/cross-check.mjs` → `CrossCheck: clean`, `Coverage_Ratio` 100%. A
   self-labelled `coverageScope: PARTIAL` is not a stopping point.
5. Emit `scripts/walk-coverage/interaction-maps/terms-conditions-<DATE>.json` (that directory is
   `ARTIFACTS_DIR` at `scripts/check-interaction-coverage.mjs:39`). Classify each control against
   `scripts/walk-coverage/drone-probes.mjs` `PROBE_DEFINITIONS` (`filter`, `sort`, `pagination`,
   `editable-cell`, `guard`, `io`, `menu-disclosure`, `add-picker`, `context-selector`). A control
   matching no class is the LR-071.1 residual: add a **class-level** entry to `PROBE_DEFINITIONS`,
   never an instance hack, then re-run `node scripts/check-interaction-coverage.mjs --self-test`.
6. Drive `node scripts/check-interaction-coverage.mjs --file <map>` to PASS.
7. **Positive control before any inert verdict** (LR-061-C): never record a control as inert or
   un-drivable without proving the same primitive fires on a known-good case — raw-JS `.click()` does
   not reliably fire React/Angular handlers; `.dragTo()` frequently never fires DnD. A rich-text
   editor especially: typing into a contenteditable via `fill()` may no-op where `type()` works.
8. **BeforeUnload trap** (HARD STOP #8 / ALL-052): after any field edit, call dialog-accept **before**
   `goto`, and navigate via `about:blank → target`. Never reload the same URL. Note NM-2191 says the
   unsaved-changes modal may not fire at all — do not assume either behaviour; probe it.
9. **Simple tools** (HARD STOP #7): `snapshot` before `eval`; never an `eval` script over 5 lines.
10. **Zero-delta = a data need** (LR-040-D): a probe on a mandatory-effect class returning no delta
    gets `DIFFERENTIAL-DATA-REQUIRED`, firing the ladder by name — Rung 1 SELF-PRODUCE (create the
    other-side state reversibly), Rung 2 SELF-SERVE (hunt an existing other-side entity across **all**
    surfaces and artifacts — Legal tab and Location Management History both touch T&C data per
    NM-825/NM-1200), Rung 3 ESCALATE (legal only with 1 and 2 evidenced). Until ground truth
    disambiguates, **no case may assert the zero-effect as expected behaviour.**
11. **Office scope**: the enumeration runs on **1604** — that is the target and the denominator's
    home. Only if 1604 renders the surface empty or absent do you re-enumerate on **1101** as
    LR-ENC-005 evidence, and then you record both results side by side. Never let 1101's richer data
    become the denominator for specs that must run on 1604.

---

## Phase 4 — Manual-QA bug harvest (HARD STOP #11b + #13 / ALL-045 — the walk's second first-class product)

**A walk is a manual QA run.** It is the only pass where a tester looks at the product before
automation code is written around its current behaviour. A walk that produced only a denominator has
delivered half its output, and automating first bakes today's defects in as tomorrow's expected
behaviour.

1. Run `/find-bugs` across the surface, every opener, and the HTML-editor panel. Adversarial probing:
   boundaries, invalid input, empty submit, rapid double-click on Save, save/cancel races,
   navigate-away while dirty, browser-back after save, language switched mid-edit, session expiry
   mid-edit.
2. **Targeted probes seeded by the closed defects** — each is a known failure shape, so probe it
   deliberately rather than hoping to stumble on it:
   - **NM-3162 shape**: select an HTML column, then select a non-HTML column — does the editor clear?
     Then the reverse, then rapid alternation.
   - **NM-3163 shape**: a record containing `&nbsp;` / non-breaking spaces / other HTML entities —
     how does the tooltip render it, and how does the grid cell render it?
   - **NM-3338 shape**: the `CORP_LEGAL` permission gate — Setup-menu visibility versus direct-URL
     access. A menu item hidden while the URL still resolves is the exact defect shape that ticket
     recorded.
   - **NM-2191 shape**: leave the page dirty, and edit a different row while dirty — does the warning
     modal appear?
3. Record a `## Observations` section in the walk-evidence artifact **before handoff**, with both
   buckets, per ALL-045: **Bugs/Defects** (HIGH — any UI/UX/layout/rendering/behaviour/accessibility
   defect noticed, even with no failing test and no documented requirement → `BUG-CANDIDATE`, then
   filed per LR-034) and **Suggestions/Improvements** (LOW). Nothing to report = the literal `none`
   under each bucket. **An absent section is an incomplete walk.**
4. A render-state defect must be **SEEN** — Chrome, element screenshot, or `boundingBox` geometry.
   Never inferred from `aria-invalid` alone (false-green, WCAG ARIA21).
5. Triage before filing: regression-from-baseline → file `BUG-TNC-<SUB>-NNN` under
   `clients/encore/reports/bugs/` with `baselineComparison` + `baselineEvidence` (LR-034) and a
   numbered `stepsToReproduce`; baseline-absent → `/encore-questions`, do not file; by-design →
   documented with its citation; empty-everywhere + no-UI-path + no-Jira → **discussion-item**, flagged
   loudly by name, no bug filed. **A re-fired closed defect (NM-3162/3163/3338) is a REGRESSION —
   file it against the original ticket, do not open a naive duplicate.**
6. **Close the loop**: every confirmed walk-found bug's repro edge-case becomes a **required TC** in
   Phase 7, authored as a failing bug-evidence case — never a silent skip, never a case rewritten to
   assert the buggy behaviour as correct. Any skip citing one of these bugs names the bug ID.
7. **Zero suspicions on a non-trivial surface is a bare-minimum-pass signal to interrogate, not a
   clean bill** — and this surface has four documented defect shapes already.
8. Artifact: `clients/encore/specs_planning/_internal/walk-evidence-terms-conditions-<DATE>.md`, with
   dated screenshots beside it.
9. Bugs are filed and evidenced here, not fixed here.

---

## Phase 5 — Empty-surface + permission investigation (HARD STOP #12 / LR-040(c))

If the grid, any language, or any panel renders empty, record all three:

- **c.1 population path** — the concrete enabler. Test in order: switch `Language`; check office
  **1101** (LR-ENC-005 corporate fallback) and **1605** (currency/pricing variety); look for an
  add/create affordance on the surface; check whether NM-1839's
  `ShowQuote_TermsConditionID` auto-assignment pre-populates en-US only. "Empty on 1604" is a
  data-state observation, never a population path.
- **c.2 classification** — exactly one of `data-blocked`, `feature-blocked`, `by-design`.
- **c.3 escalate-if-unknown** — still unknown after a real dig (LR-057 affordance probe + Jira per
  LR-ENC-004 + a second office) → `/encore-questions`. Never close on "empty / refresh later".

**Permission axis**: establish which credentialed roles exist in `.env.local` and whether any lacks
`CORP_LEGAL`. If none does, the RBAC cases are `DATA-BLOCKED` with the unlock named (which role, who
provisions it) — recorded, never silently dropped.

---

## Phase 6 — Field inventory + ID registry

### 6a — Registry mint (required before any TC ID can pass `check-tc-parity` G6a/G6c)

1. `export_test_cases/module-codes.json` — add to `modules`:
   `"TNC": { "name": "terms-conditions", "display": "Terms and Conditions", "dir": "terms-conditions" }`
2. Add a `TNC` submodule block. **The Phase-3 walk defines the split — do not pre-commit to a shape.**
   Mint one submodule per distinct tab or panel the walk actually found; at minimum one. Naming rules:
   `sheet` ≤31 chars with the `terms_conditions_` prefix (17 chars, leaving 14), `mdBasename` =
   `terms_conditions_<name>_test_cases`, and a `sheetNameNotes` entry for any shortened sheet name
   (`locations_shared_setup_location` precedent). **Registering a code for a surface the walk did not
   find is forbidden.**
3. `export_test_cases/types.ts` — append the new codes to `KNOWN_SUB_CODES` under a
   `// terms-conditions (TNC)` comment, matching the file's grouping style (`:162–197`).
4. Create `clients/encore/specs_planning/test-cases/setup/terms-conditions/` and
   `.../test-plans/setup/terms-conditions/`.
5. `npm run check:tc-parity` exits 0 — green with zero `TNC` TCs proves the edit is well-formed.

### 6b — Field inventory

`clients/encore/specs_planning/_internal/field-inventories/terms-conditions-<DATE>.md`, per
`field-inventory-spec.md`:

1. Frontmatter: `jira_tickets:`, `baselineScope:`, `Coverage_Ratio`, `CrossCheck`.
2. One row per machine-enumerated element, every one dispositioned, no blanks.
3. Per field: its `field-case-generation.md` §2 type and exact case-set, **including the §2.1
   rejection-affordance oracle on every Negative and BVA case**. The HTML editor is a **rich-text**
   field — if §2 has no row that fits what the walk found, apply the Standard's brain-first clause
   (probe live → write cases from observed behaviour → `/research` the standard angles → append a new
   template row to the client instance §2). **HALT is the last resort, not the first move** (LR-057
   no-taxonomy clause).
4. Per grid/list/result surface: a `behavior-cases:<families>` disposition naming the applicable §3
   families, or `out-of-scope:<family>=<reason ≥20 chars>` (LR-065). Neither = an undispositioned
   surface = closure-gate Cx FAIL.
5. **`affordance:` token per row** (LR-057): a disabled / read-only / static classification is not
   "covered" until field, label, and container are click-probed. A baseline interactive→static
   divergence may never close as intentional-UX without a new-site click-probe. Shared dialogs are
   covered **per launcher** (LR-012 — Location Settings save dialogs are shared *unless MCP-proven
   otherwise*; prove it here).
6. **Boolean render format** (LR-036): before any boolean-column reader helper is written,
   MCP-verify per table which of the three render formats the grid uses (Unicode ✔ / SVG lucide-check
   / empty-cell). Never author a boolean reader on assumption.
7. Every observation row carries machine evidence with provenance — an `evidence:` pointer to the
   machine-emitted artifact (snapshot YAML / walk log) dated ≥ the session date. A `provenance:
   oracle` row, a missing-provenance row, or a stale-evidence row is **FABRICATION-class**: it fails
   the whole plan closure and writes an integrity strike to `.claude/state/integrity-strikes.jsonl`.
8. **Missing-testid report** (LR-029): record every interactive element lacking a `data-testid`, with
   live-DOM verification per element — never from a static grep. Route per
   `feedback_missing_testid_report_policy.md`. A freshly-built web component (NM-2189/NM-2331) is a
   likely offender; this report is the deliverable that gets testids added.

**Delegation shape (LR-064 TDW)**: Opus owns recon, the denominator, the §2/§3 taxonomy assignment,
the per-element verify, and every disposition. Only deterministic input-trials delegate down — Haiku
for simple clicks, Sonnet for cascading or multi-row sequences, Opus-self when both fail or the probe
turns adaptive. **Never disposition from an unverified worker report**; worker facts are usable,
worker diagnoses are not — re-derive every cause.

---

## Phase 7 — Case authoring, L1 → L2 → L3 (GIVER)

TC IDs use the registered `TNC` bands, numbered sequentially. **Do not mint `TC-TNC-FCC-*`** —
`CASE_GENERATION_STANDARD.md:89` marks that namespace opt-in-by-registration and `FCC` is not a
registered submodule code, so `check-tc-parity` G6c rejects it; field cases ride the ordinary band.

Surface cases carry `**Surface_Family**: <family> (QUICK|DEEP)` **in the body only**. The marker never
appears on a `## TC-…:` heading (ALL-091) — the heading ships verbatim as the reviewer-facing Title,
and `scripts/xlsx-lint-rules.mjs` hard-blocks the marker, `SBC`, `Surface_Family`, and `FLAG` at
build, commit, and ship.

**Language is an axis, not a case.** Per NM-2315 the data is language-keyed and per NM-825/NM-664 T&C
is required per language. Every persistence, render, and validation case declares which language it
operates in, and the multi-language dimension is covered explicitly at L2 — not represented by a
single en-US sample.

### 7a — L1 (QUICK)

**Axis 1** — every inventoried field's §2 template set (positive · BVA · negative · save-cycle), each
Negative and BVA case carrying the §2.1 rejection-affordance oracle. Field types come from the
inventory, not from assumption.

**Axis 2** — one L1 must-assert per applicable §3 family: `result-fidelity` · `pagination` ·
`sorting` (asserted on values, never on an icon) · `combination` · `render-state` · `empty-vol` (the
exact empty-state string) · `persistence` (edit dirties and enables Save; save survives reload; revert
returns Save to disabled). Inapplicable → `out-of-scope:<family>=<reason ≥20 chars>`.

**`rbac` (promoted)** — L1 must-assert: the surface's accessibility under a role holding `CORP_LEGAL`
versus one lacking it, covering **both** the Setup-menu affordance and direct-URL access (the NM-3338
shape). Blocked on credentials → `DATA-BLOCKED` with the unlock named.

**Regression armour** — one case each for the NM-3162, NM-3163, NM-3338 and NM-2191 shapes. These are
not optional; they are the cheapest coverage in the whole plan because the failure mode is already
documented.

### 7b — L2 (DEEP: persistence, BVA exotica, pairwise, state machine)

1. **Rich-text round-trip**: content authored in the HTML editor persists byte-exact across save +
   reload — entities (`&nbsp;`, `&amp;`, `&lt;`), tags, nested markup, empty content, whitespace-only
   content, very long content. The NM-3163 entity class gets full BVA treatment here, in both the
   grid cell and the tooltip.
2. **Editor state isolation** (NM-3162 generalized): switching selection between any two columns/rows,
   in both directions and under rapid alternation, never leaks the prior selection's content.
3. **Cross-language independence**: content saved under one language does not alter another's.
4. **Batch/partial save semantics**: multiple rows edited, one save, committed as a unit — not
   first-row-only, not a silent partial.
5. **Save-failure path**: inject failure via route interception; the error surfaces, the form stays
   dirty, retry succeeds.
6. **Numeric/text BVA** on every non-rich field per the inventory, each with the §2.1 oracle.
7. **Date BVA only if the inventory found date fields**; otherwise
   `out-of-scope:date-bva=<reason ≥20 chars>`. **Do not invent a date case to look thorough.**
8. **Pairwise covering array** over language × row/record × column-type (HTML vs non-HTML) × data
   state. Every pair appears at least once. Record the array in the catalog so it regenerates. Cap the
   count explicitly and **log what the cap dropped** — silent truncation reads as full coverage.
9. **State-transition model**, every edge mapped: `Clean → Dirty → Saving → Save-OK | Save-Failed`,
   `Dirty → Navigate-Away-Prompt → Stay | Leave`, `Dirty → Edit-Another-Row → (warned?)`,
   `Validation-Error → Fix → Dirty`, `Edit-to-original-value → Save-disabled` (revert ≠ pristine — the
   most-missed edge). **NM-2191 says two of these edges may not exist yet** — the walk decides, and a
   missing guard is authored as a known-gap case citing NM-2191, never as a passing assertion.

### 7c — L3 (DEEP: integration, a11y, error-guessing, network, volume)

1. **Cross-module integration — cover every edge the inventory's dependency map records**, no
   cherry-picking. Two are already evidenced and have existing page objects to assert against:
   - **Location Management History** (NM-1200) — a T&C edit surfaces as a history row.
     `location-management-history.page.ts` exists; reuse it.
   - **Legal tab** (NM-825 / NM-664) — T&C required per language; changes here reflect there.
     `location-legal.page.ts` exists; reuse it.
   - **NM-1544 caveat**: an OPEN defect says Legal updates may not save to the database. If a Legal
     assertion fails, check NM-1544 before filing anything new.
2. **Out of scope, recorded**: `out-of-scope:integration-kafka=downstream Helioscorp sync (NM-1735)
   has no UI-observable oracle on this surface`.
3. **Error-guessing** (`/find-bugs`, second adversarial pass now that specs exist) — double-click
   races, concurrent edits across two tabs, save-failure retry, options-load failure recovery, language
   switched mid-flight, session expiry mid-edit, browser-back after save.
4. **Full accessibility audit**, per surface and per dialog — logical tab order; focus trap in modals
   with focus restored to the invoker on close; every input label-associated; every validation error
   programmatically associated and announced (`aria-describedby` / `role="alert"`); no hover-only
   actions; visible focus indicator; correct ARIA state on sortable headers and any paginator. **The
   rich-text editor gets explicit keyboard-operability coverage** — a contenteditable that cannot be
   reached or exited by keyboard is a real WCAG failure and a common one. **`platform` stays deferred
   — do not smuggle cross-browser / responsive / dark-mode in under the a11y banner.**
5. **Tier-2 network payload** — per save path, capture request and response with `playwright-cli
   network` and assert the **response body reflects the committed payload**, including the rich-text
   content and its language id (NM-2315). Tier-3 database verification is outside framework scope; do
   not claim it.
6. **Volume / virtualization** — drive to the largest row count SELF-PRODUCE or SELF-SERVE can reach;
   off-screen rows reachable by content anchor not index; sort and filter correct at volume; no dupes
   or drops across page boundaries. If the reachable volume was too small to stress virtualization,
   **state the row count reached** — never report it as a pass.

### 7d — Data discipline

SELF-PRODUCE → SELF-SERVE → escalate. Produce a needed state reversibly and restore it, or find an
existing entity on 1604 first, then 1101 / 1605 per LR-ENC-005. No "no data" skip without both rungs evidenced
(§20.4).

---

## Phase 8 — BUILDER artifacts

1. **Selectors** `clients/encore/src/selectors/terms-conditions/`, following the
   `clients/encore/src/selectors/locations/` layout.
2. **Page objects** `clients/encore/src/pages/terms-conditions/` extending `base.page.ts`, with
   per-method `@step` annotations — the step Proxy was removed in `48d5933f`; do not reintroduce it.
   A dedicated rich-text-editor helper belongs here (set / read / clear content), not inline in specs.
3. **Reuse mandate** — reuse existing grid pagination / sort / row-count / content-anchored helpers,
   and the existing `location-management-history.page.ts` + `location-legal.page.ts` for the
   integration edges. A missing helper is added **to the page object**, never as a new runner.
4. **Specs** `clients/encore/tests/terms-conditions/`, one per submodule, with the field-case describe
   and an `SBC — terms-conditions` describe at the top.
5. **Save dialog** — prove the LR-012 shared-dialog assumption for this surface. If the dialog is
   `<div role="alertdialog">` with unnamed buttons, the base `getByRole` confirm helper silently
   no-ops — target `[role="alertdialog"] button:text-is("Save")` (`navigation.md:34`).
6. **Shadow/portal DOM** (NM-2189/NM-2331): if the component's controls sit in shadow roots, Playwright
   pierces open shadow DOM natively — but `getByRole` may miss portal-nested nodes. Where a role query
   returns zero on a visibly-present control, fall back to attribute/text selectors and record the
   reason in the page object.
7. No `networkidle`. No `page.waitForTimeout`.
8. Every mutating case restores state — re-runs are idempotent. Rich-text content especially: capture
   the original HTML before edit and write it back in cleanup.
9. `npx playwright test --list` resolves every authored TC ID.

**Render-fail rule (binding on Phases 7–9)**: a failing surface assertion triggers **RCA, then
classification**: regression-from-baseline → `BUG-TNC-<SUB>-NNN` with `baselineComparison` (LR-034);
baseline-absent → `/encore-questions`; by-design → documented skip with the reason. Never blind
auto-file, never a silent skip.

---

## Phase 9 — WATCHDOG audit

1. FCC completeness — every inventory field has its §2 set; every Negative/BVA carries the §2.1 oracle.
2. Surface completeness — every applicable §3 family (including the promoted `rbac`) has L1, L2 and L3
   coverage or an explicit `out-of-scope:` at each level. Anything still open is a HALT-and-ask.
3. **Jira-lead closure** — every ticket in the Phase-1 crossref carries a verification verdict
   (confirmed / diverged / stale). An unverified lead is an open item, not a footnote.
4. Bug-loop closure — every `BUG-TNC-*` from Phase 4 has its TC; every skip names its bug ID; every
   re-fired closed defect was filed as a regression against its original ticket.
5. Covering-array pair-coverage verified **mechanically**, and the cap's dropped count logged.
6. Dependency-edge count stated; a11y criteria checked per surface and per dialog; network assertions
   check the **response body**; the volume case states its row count.
7. `npm run check:spec-quality` on the **working tree** before any done / green / verified claim
   (LR-060 obligation 4 — commit-time gates do not cover uncommitted work).
8. Suite green ×2 consecutively.

---

## Phase 10 — Registration, sweep, closure

1. `.claude/context/navigation.md` §C Exploration Registry row → field inventory, baseline,
   walk-evidence, interaction map, Jira crossref.
2. `clients/encore/docs/MODULE_REGISTRY.md` + `REQUIREMENTS.md` updated for the new module.
3. **Adjacent-Sweep ritual** — each adjacent fix noticed gets exactly one of DO-NOW / SPAWN / APPEND
   with a grep-verified line item. Bare "out of scope" with no recipient = HALT and ask.
4. **NM-3346 updated** with the outcome: TCs authored, specs landed, bugs filed. Jira stays READ-ONLY
   for everything else — no status transitions without Rutvik.
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
| HUNTER | Jira crossref · old-site baseline · interaction map · walk evidence · field inventory | `clients/encore/specs_planning/_internal/jira-defect-crossref-terms-conditions-<DATE>.md`<br>`clients/encore/specs_planning/_internal/old-site-baseline/terms-conditions-<DATE>.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-terms-conditions-<DATE>.md`<br>`clients/encore/specs_planning/_internal/field-inventories/terms-conditions-<DATE>.md`<br>`scripts/walk-coverage/interaction-maps/terms-conditions-<DATE>.json` | `node scripts/check-interaction-coverage.mjs --file scripts/walk-coverage/interaction-maps/terms-conditions-<DATE>.json` |
| GIVER | field-case catalog · §3 rbac template row · test-case MD · test plan · XLSX workbook | `clients/encore/specs_planning/_internal/field-case-catalogs/terms-conditions-<DATE>.md`<br>`clients/encore/specs_planning/_internal/field-case-generation.md`<br>`clients/encore/specs_planning/test-cases/setup/terms-conditions/`<br>`clients/encore/specs_planning/test-plans/setup/terms-conditions/`<br>`clients/encore/testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` |
| BUILDER | selectors · page objects · specs | `clients/encore/src/selectors/terms-conditions/`<br>`clients/encore/src/pages/terms-conditions/`<br>`clients/encore/tests/terms-conditions/` | `npx playwright test --list` |
| HEALER | (none) — no pre-existing failing specs on this module | (none) | (none) |
| WATCHDOG | completeness + Jira-lead + bug-loop closure findings | `clients/encore/specs_planning/_internal/audit-terms-conditions-<DATE>.md` | `npm run check:spec-quality` |
| GARDENER | (none) | (none) | (none) |
| OWNER | ID registry · navigation registry · module registry | `export_test_cases/module-codes.json`<br>`export_test_cases/types.ts`<br>`.claude/context/navigation.md` | `npm run check:tc-parity` |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Jira crossref exists, every listed ticket carries a post-walk verification verdict, and the
      baseline artifact carries `jira_tickets:` (or `rovo_available: false`).
- [ ] NM-1731 (epic) and NM-1736 (page story) read in full; the NM-3346 description image read.
- [ ] Old-site baseline artifact exists with a `## Baseline diff` section or an explicit
      `baselineScope: baseline-absent`.
- [ ] Coverage manifest machine-enumerated, every union element dispositioned, `CrossCheck: clean`,
      `Coverage_Ratio` 100%, opener frontier empty (LR-062 / §20 / Cx).
- [ ] Interaction map PASSES `check-interaction-coverage`, no `unclassified-element`, no
      `claim-census` residual outstanding.
- [ ] Walk-evidence artifact carries a `## Observations` section with **both** buckets filled or the
      literal `none` (ALL-045). An absent section fails this plan.
- [ ] All four seeded defect shapes (NM-3162, NM-3163, NM-3338, NM-2191) probed deliberately, each
      with a recorded verdict, and each carrying a regression-armour TC.
- [ ] Every walk-found bug triaged, filed per LR-034 with `baselineComparison` + numbered
      `stepsToReproduce`, and carrying a TC; every skip names its bug ID; re-fired closed defects
      filed as regressions against their original tickets.
- [ ] Every empty surface carries c.1 / c.2 / c.3 (LR-040(c)); permission axis resolved or
      `DATA-BLOCKED` with the unlock named.
- [ ] `rbac` promoted to an active family with a real §3 template row appended to
      `field-case-generation.md` — promotion, not asserted coverage.
- [ ] Every zero-delta probe on a mandatory-effect class carries `DIFFERENTIAL-DATA-REQUIRED` with
      rung-1 and rung-2 evidence (LR-040-D); no case asserts a zero-effect as expected behaviour.
- [ ] Every row carries an `affordance:` token; no inert verdict without a positive control; shared
      dialogs covered per launcher (LR-012 proven, not assumed).
- [ ] Boolean render format MCP-verified per table before any boolean reader (LR-036).
- [ ] Missing-testid findings recorded with live-DOM verification per element (LR-029).
- [ ] Denominator and specs are on office **1604**; any 1101 consultation is recorded as LR-ENC-005
      evidence only, and any proposal to move the specs off 1604 was HALTed to the user, not decided.
- [ ] `TNC` + its walk-reconciled submodule codes registered in both `module-codes.json` and
      `KNOWN_SUB_CODES`; no code registered for a surface the walk did not find.
- [ ] Rich-text round-trip byte-exact incl. HTML entities; editor state isolation asserted in both
      directions; cross-language independence asserted.
- [ ] Both evidenced integration edges covered (Location Management History, Legal tab); Kafka sync
      recorded `out-of-scope:` with reason.
- [ ] Date BVA covered or explicitly `out-of-scope:date-bva=<reason>` — never faked.
- [ ] Covering array recorded, pair-coverage machine-verified, cap's dropped count logged.
- [ ] Rich-text editor keyboard operability asserted; `platform` remains deferred.
- [ ] Every save path has a Tier-2 response-body assertion incl. language id; no Tier-3 database claim.
- [ ] Volume case states the row count actually reached.
- [ ] No `(QUICK)`/`(DEEP)` marker on any `## TC-…:` heading (ALL-091).
- [ ] `npm run check:tc-parity`, `lint:testcases`, `xlsx:lint`, `typecheck` all exit 0.
- [ ] `npm run check:spec-quality` passes on the working tree before any done/green/verified claim.
- [ ] Suite green ×2 consecutively; every mutating case restores state (rich-text content restored).
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
npx playwright test clients/encore/tests/terms-conditions --retries=0
```

---

## Handoff (post-execution)

Terms and Conditions is covered end to end: a registered ID grammar, a machine-enumerated denominator
at 100% with an empty opener frontier, a baseline verdict, a manual-QA harvest whose findings each
carry a regression-armour TC, an `rbac` family promoted on documented evidence, and field plus surface
coverage at L1, L2 and L3 with an honest out-of-scope record wherever a family does not apply. Every
ticket in the NM-3346 corpus carries a post-walk verdict, the two evidenced cross-module edges are
exercised, and the module joins the standing regression suite.
