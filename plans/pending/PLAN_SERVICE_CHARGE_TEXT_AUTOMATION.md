# PLAN_SERVICE_CHARGE_TEXT_AUTOMATION — intake, walk, bug-harvest and L1/L2/L3 automation of the Service Charge Text surface

**Status**: PENDING
**Priority**: P1
**Created**: 2026-08-03
**Identity**: OWNER
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: both
**BrowserToolJustification**: Playwright CLI is the default for the enumeration walk and every deterministic probe (unattended, >10 controls, grep-over-disk snapshots per LR-038 v2). Claude in Chrome is declared up-front — not switched into mid-run — for the two things CLI structurally cannot settle: the LR-036 per-table boolean render format, and the HARD STOP #13 / ALL-045 rule that a render-state defect must be SEEN (element screenshot / `boundingBox` geometry), never inferred from `aria-invalid`.
**Justification**: Opus `max` per LR-041 — this plan is simultaneously RCA-class (walk-found anomalies get triaged before they are called bugs), closure-gate-class (four independent phase gates plus the LR-062 100% denominator gate), and multi-rule-judgment-class (LR-062 / LR-064 / LR-065 / LR-057 / LR-061 / LR-040(c) / LR-029 / LR-036 / ALL-045 / ALL-052 arbitrate against each other on almost every row).

---

## Context

The Service Charge Text surface has **no automation, no module directory, no module code, no baseline artifact and no test cases**. `clients/encore/docs/MODULE_REGISTRY.md` already lists **Service Charge** under *"Not-yet-automated sections → Setup (other)"*, so this is a genuine new-module intake, not a new tab on an existing page. Per LR-017 and the registry's own rule (*"Different URLs (or different URL suffixes) → DIFFERENT modules"*), `/settings/service-charge-text` is its own flat module directory — the same shape as `corporate-pricing`, which also lives under `/locations/<office>/settings/…` and is its own module.

**Environment — resolved, not inherited (Rutvik decision 2026-08-03, now graduated to `LR-ENC-007` in `clients/encore/CLAUDE.md`).** The request arrived as a `cloudapps-dev` / office `1609` URL. `cloudapps-dev` appears **nowhere in this repository** (zero hits repo-wide); `.env.local`, `.env.e2e`, `playwright.config.ts`, the saved SSO state and `scripts/walk-coverage/enumerate-page.mjs`'s hard-coded `BASE` all target `cloudapps-e2e`. Rutvik's ruling: **the dev environment is dead — do not build for it, do not reference it, do not create an env profile for it.** The only two environments in scope are:

- **New site (automation target)**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge-text`
- **Old site (baseline truth, observation-only)**: `https://navigator2.training.psav.com/#/` per LR-ENC-001

The dev URL survives in this plan only as the provenance of the request. **No phase, command, config, selector or assertion below may name `cloudapps-dev` or office `1609`.** Acceptance criterion A9 enforces this with a grep.

Because the surface has never been walked on e2e/1604, **its existence there is an open question, not an assumption** — Phase 0.4 is a hard existence gate with an LR-040(c) + LR-ENC-005 ladder and a HALT, before any other phase is allowed to run.

**Provenance**: authored by `/ultracoverage` under `/ultrathink`, single-file per Rutvik's 2026-08-03 directive (Intake / L1 / L2 / L3 are phases inside this file, never separate subplan files; `/ultracoverage`'s "N subplans = N levels deep" line is retired for this plan). A screenshot, if one accompanied the request, is an **unverified observation** — Phase A's machine-enumerated denominator is the only denominator.

---

## Bootstrap

**Identity**: OWNER orchestrates. Each phase adopts its owning pipeline identity **before its first artifact write** — the PLAN_IDENTITY_ENFORCEMENT Layer-1 write-gate (`.claude/hooks/lib/check-identity-switch.mjs`) blocks an OWNER write into pipeline-role-owned territory inside `/execute` until `/identity <ROLE>` is adopted. Phase ownership:

| Phase | Identity to adopt | Rulebook to load IN FULL first |
|---|---|---|
| 0, 0.4 | OWNER | this file + `.claude/rules/pipeline.md` |
| 0.45, 0.5b, A | **HUNTER** | `.claude/agents/REQUIREMENTS.md` **HARD STOPS 0–13 verbatim** |
| B-cases, C, D (case authoring) | **GIVER** | `.claude/agents/PLANNER.md` **HARD STOPS 0–23 verbatim** |
| B-build, C-build, D-build (spec authoring) | **BUILDER** | `.claude/agents/GENERATOR.md` **HARD STOPS 0–16 verbatim** |
| Tooling edits under `scripts/**` | **OWNER** | BUILDER HARD STOP #5 forbids BUILDER touching `scripts/*` — the walk-config edit in Phase 0.6 is an OWNER action, never a BUILDER one |

> **Do not author a phase off the wrong role's checklist.** A walk/baseline/intake phase is HUNTER's; authoring it from GIVER's checklist alone is the documented way the last module's plan shipped broken.

**Skills auto-called**:
- `/identity` (Step 1.5 gate at every phase boundary listed above)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/regression-guard` (wrap — BEFORE + AFTER, around every phase that writes `.spec.ts` / page objects / selectors)
- `/find-bugs` (**Phase A, non-optional** — the walk is the pipeline's only manual-QA pass; see Phase A6)
- `/rca` (Phase A7 triage — fires on any walk anomaly before it is called a bug; LR-044 governs anything already filed)
- `/encore-questions` (escalation channel for c.3 empty-surface and unresolved-intent items)
- `/final-q` (mandatory exit per LR-042)

**Context files** (every rule this plan depends on):
- `CLAUDE.md` (root) + `clients/encore/CLAUDE.md` (**LR-ENC-007 two-environments-only**, LR-ENC-001/002/003/004/005/006, LR-008, LR-012, LR-017, LR-036)
- `.claude/agents/REQUIREMENTS.md` · `.claude/agents/PLANNER.md` · `.claude/agents/GENERATOR.md`
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-046, LR-048, LR-050, LR-060)
- `.claude/rules/inventory.md` (LR-007, LR-013, LR-014, LR-015, LR-029, LR-057, LR-062, LR-064, LR-065)
- `.claude/rules/browser-tool.md` (LR-038 v2, LR-054) · `.claude/rules/plan-closure.md` (LR-055 C1–C6)
- `.claude/rules/baseline.md` · `.claude/rules/guardrail-policy.md` (LR-069 §3.5 prior-fix trial, LR-070)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — **§20 Walk Doctrine v2 in full**, §2 ownership, §8, §12, §13, §16, ALL-024, ALL-045, ALL-049, ALL-052, ALL-071, ALL-078, ALL-091
- `docs/read_only_docs/CASE_GENERATION_STANDARD.md` (two axes, depth model L0/L1/L2/L3)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§2 field templates, §2.1 rejection-affordance oracle, §3 surface families, §5 interaction-axis taxonomy)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` (8 mandatory frontmatter keys, 7 mandatory sections, Coverage Manifest keys)
- `clients/encore/docs/MODULE_REGISTRY.md` · `clients/encore/docs/REQUIREMENTS.md` · `.claude/context/navigation.md`
- `clients/encore/specs_planning/_internal/agent-mistakes.md` (REQ-* / PLN-* / GEN-* / ALL-*)

**Anti-Assumption Gates** (binding — this plan corrects TCs, files bugs, and drives a baseline):
- [ ] Gate 1 — Phase 0.5b baseline walk **EXECUTED** before any divergence classification or bug filing (LR-045 / LR-ENC-001 / LR-048 §5). Never `(pending)`.
- [ ] Gate 2 — no "corrupt / atypical / app-wide / regression" claim on <2 independent sources (LR-061-A).
- [ ] Gate 3 — no control marked inert / un-drivable without overlay-clear + reload + PO-selector-vs-live-DOM diff + DOM inspect **and a positive control** (LR-061-B/C).
- [ ] Gate 4 — no env-rationalized deferral of env-independent work; env defers only the env-blocked step (LR-060).
- [ ] Gate 5 — un-skip + LR-019 per-test baseline harden applied atomically in the same change.
- [ ] Gate 6 — all phases complete OR a **user-signed** `## Deferral Authorization` block. No silent PENDING checkpoint (LR-060).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. `Depends on: none` — nothing to confirm in `plans/done/`.
2. Read `.claude/context/navigation.md` §C Exploration Registry. **Verified 2026-08-03: zero entries for `service-charge` or `1609`.** If an entry has appeared since, consume its findings instead of re-exploring.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md`, filtered by the identity active for the phase you are entering (HUNTER → `REQ-*`/`ALL-*`; GIVER → `PLN-*`/`ALL-*`; BUILDER → `GEN-*`/`ALL-*`).
4. Read `.claude/context/patterns.md`; match decision-tree patterns to the phase's subtasks.
5. LR scan — every rule listed in Bootstrap whose Trigger fires.
6. **Browser-tool announcement (LR-038 v2)**: emit `BrowserTool=both` plus the reason from frontmatter as the session's first output. Log any actual switch with the canonical `[BROWSER-SWITCH] from=… to=… reason=… tokens_so_far=… artifact=…` row (LR-028). Declaring `both` up-front is what keeps the switch budget clean — do not treat it as licence for ≥3 switches.
7. **Auth**: `clients/encore/.env.local` is TRACKED and carries the automation credentials; the account has **no second factor**, so sign-in is unattended. If a `playwright-cli` call redirects to `login.microsoftonline.com`, do **not** retry headless — `playwright-cli open --persistent --profile=.auth\e2e-profile`, sign in, `state-save -s=e2e`, resume (browser-tool.md Gate 3). Asking a human to log in is a defect.

---

## Phase 0.4 — Surface-existence + office gate (HARD GATE — nothing proceeds past a failure)

The dev URL proved the page exists **somewhere**. It did not prove the page exists on the automation target. Resolve this from live evidence before a single path, selector or TC ID is written.

1. `about:blank` → target (never reload the same URL; ALL-052) and open
   `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge-text`.
2. Record, verbatim: HTTP status, final URL after any redirect, page heading, and whether the left-nav exposes a Service Charge Text entry for 1604. Snapshot to disk (`playwright-cli snapshot -o …`) — this snapshot is Phase A's starting evidence, not a throwaway.
3. Classify into exactly one:
   - **PRESENT-AND-POPULATED** → proceed to Phase 0.45.
   - **PRESENT-BUT-EMPTY** → this is a *data-state observation, never a conclusion*. Fire the full **LR-040(c) ladder before proceeding**: **c.1 population path** (which UI affordance creates a row / which governing NM ticket / which admin step / **which office actually has data**) — re-check **office 1101** first per LR-ENC-005, and one further office; **c.2 classification** (`data-blocked` | `feature-blocked` | `by-design`); **c.3 escalate** via `/encore-questions` if the path is still unknown after a real dig. Also evidence **both rungs of the §20.4 data ladder** — rung 1 SELF-PRODUCE the state via a reversible UI write on a designated office; rung 2 SELF-SERVE mine existing artifacts (tenant exports, `reports/walk-coverage/*.json`, prior walk evidence) for an office that already has it. A skip with neither rung evidenced is a bounce.
   - **ABSENT / 404 / route-not-registered on 1604** → **HALT and ask Rutvik.** Do not silently retarget to another office, and do not resurrect the dev environment. Present: the observed status, the 1101 and second-office results, and the two options (nominate a different authorized office, or park the module).
4. Whatever the outcome, write it into the Phase 0.4 block of the walk-evidence artifact. "It didn't load" is never a closing state.

**Phase 0.4 closure criteria**
- [ ] Live status + final URL + heading recorded from a dated `playwright-cli` snapshot on e2e/1604.
- [ ] If empty: c.1 / c.2 / c.3 all three recorded, **and** rung-1 + rung-2 evidence attached.
- [ ] If absent: HALT recorded, Rutvik asked, no downstream phase started.

---

## Phase 0.45 — Jira / Rovo intake (LR-ENC-004 — runs BEFORE the old-site walk)

1. Canary `getVisibleJiraProjects`. If Rovo is not connected, log `[ROVO-SKIP: MCP not connected]`, set `rovo_available: false`, consume any committed `jira-defect-crossref-*` file, and continue — **never skip silently**.
2. Resolve the cloudId for `encore.atlassian.net`; `searchJiraIssuesUsingJql` for Service Charge / Service Charge Text NM tickets; `searchConfluenceUsingCql` for the governing spec. Read the top hits.
3. Emit `clients/encore/specs_planning/_internal/jira-defect-crossref-service-charge-text-2026-08-03.md`, and add a `jira_tickets: [NM-####, …]` frontmatter key to the Phase 0.5b baseline artifact — that key is the greppable enforcement point for LR-ENC-004.
4. **Every Jira fact is a LEAD, not a verdict.** Jira/Confluence is intent-truth; live DOM (old site > new site) is render-truth. A DOM-vs-Jira divergence is *signal* — classify it `intentional-UX` / `app-bug` / `stale-ticket` per REQ-014. There is no automatic "Jira wins."
5. **HALT** if an in-flight behavioural-change ticket would change what "correct" means for this surface — surface it to Rutvik before walking.
6. **Watch for a predecessor system**: a Confluence page or ticket naming "Service Charge" may describe the *old* Navigator surface rather than this one. Verify which system a spec describes before treating it as the requirement.

**Phase 0.45 closure criteria**
- [ ] `jira-defect-crossref-service-charge-text-2026-08-03.md` exists, or `[ROVO-SKIP]` logged with `rovo_available: false`.
- [ ] `jira_tickets:` key present in the baseline artifact frontmatter (empty list allowed only with an explicit "searched, none found" line).
- [ ] Every ticket classified as lead / in-flight-blocker, with the in-flight case HALTed.

---

## Phase 0.5b — Baseline-first walk (OLD SITE / nav2 — OBSERVATION-ONLY)

Non-deletable: this plan drives TC authoring and files bugs (LR-048 §5, Anti-Assumption Gate 1).

1. Navigate to `https://navigator2.training.psav.com/#/`, office 1604, and locate the Service Charge / Service Charge Text equivalent.
2. **HARD STOP #4 — observation-only. No clicks that change value. No typing. No saves. Old-site state is NEVER mutated.** The **HARD STOP #9 carve-out** is the only permitted interaction: a launcher may be opened to read its affordance and then **Cancel/Esc only — never Select/Save**. Opening-then-cancelling is observation; anything that commits a value is a violation.
3. Emit `clients/encore/specs_planning/_internal/old-site-baseline/service-charge-text-2026-08-03.md`, shaped after `OSB-ACCESS-VERIFY-2026-04-24.md`. Frontmatter: `artifact`, `client`, `session_date`, `session_tool`, `author_identity`, `page_url_old`, `page_url_new_equivalent`, `test_entity`, `parent_subplan`, `jira_tickets`, `baselineScope`. Body §1 Access · §2 Selector-style notes · §3 Tab/feature inventory (present-on-both / absent-on-baseline / absent-on-new) · §4 Field-level baseline (defaults, labels, **validation text verbatim**, **save-dialog text verbatim**) · §5 Schema observations (booleans per LR-036) · §6 Divergence candidates · **FCC-lens divergences** (which `field-case-generation.md` §2 field families and §3 surface families the new site will need).
4. If the surface genuinely does not exist on nav2 → `baselineScope: baseline-absent`. That is **NOT a HALT** (ALL-078) — record it, route the intent question to `/encore-questions`, continue.
5. Classify every old-vs-new divergence as `BUG-CANDIDATE` (file per LR-034) / `INTENTIONAL-UX-CHANGE` / `REQUIREMENT-GAP` / `BASELINE-ABSENT`. **LR-057 baseline-divergence clause**: a divergence of class *"interactive on baseline / static on new"* may **never** be closed as intentional-UX without a **new-site click-probe** — that unprobed close is exactly how Pay To Address / BL-DIV-4 was missed.

**Phase 0.5b closure criteria**
- [ ] Baseline artifact exists at the dated path with all frontmatter keys and §1–§6 populated, or `baselineScope: baseline-absent` recorded with its `/encore-questions` route.
- [ ] Zero mutations on nav2 — no save, no committed value, dialogs closed via Cancel/Esc only.
- [ ] Every divergence carries one of the four classifications; no "interactive→static" row closed without a new-site probe.

---

## Phase 0.6 — Walk tooling prerequisite (OWNER — do this BEFORE Phase A, it is a silent-corruption trap)

**Verified 2026-08-03 against `scripts/walk-coverage/enumerate-page.mjs`.** Running the enumerator with `--url=` alone does **not** give a config-free walk: `moduleName` defaults to `'pricing'` (line 465–466), so `cfg` resolves to the **pricing** config and the run then applies `activateTabs: ['location-settings-sub-tab-pricing']` and pricing's `contentMarker` / opener / cascade patterns to a completely different page (lines 521–524, 579, 622). Line 790 dereferences `cfg` unguarded. The result is a *silently contaminated denominator that still prints a success line* — the exact "a green result can lie" failure class.

1. Add a `'service-charge-text'` entry to **both** files (they are deliberately split and must stay in sync):
   - `scripts/walk-coverage/enumerate-page.mjs` `MODULE_CONFIG` — `path: (office) => `${BASE}/locations/${office}/settings/service-charge-text``, plus `activateTabs` / `contentMarker` / `openerTestidPatterns` / `cascadeParentTestidPatterns` **populated from Phase 0.4's recon snapshot, not invented**.
   - `scripts/walk-coverage/lib/module-config.mjs` `MODULE_CONFIG` — `requiredStates`, `dependencyPairs`, `editableFields`.
2. A **resting-only** `requiredStates` declaration MUST carry an `evidence:` field citing the enumeration run that found zero openers (`enumeration:2026-08-03:zero-openers-found`). A comment is not evidence — `verify-denominator.mjs` fails a bare resting-only entry.
3. The `[TOOTHLESS-SURFACE]` meta-gate fires when a module declares no non-resting state **and** no opener patterns. `toothless_surface_mode` is currently **absent** from `.claude/guardrail-config.json`, so `readGuardrailMode()` fail-safes to `announce` — it will **warn, not block**. A warning here means the denominator is unverifiable: treat it as a defect in the config, not as a pass.
4. This edit is under `scripts/**`. **BUILDER HARD STOP #5 forbids BUILDER from making it** — adopt OWNER.

**Phase 0.6 closure criteria**
- [ ] `service-charge-text` present in both MODULE_CONFIG objects, values sourced from Phase 0.4 recon.
- [ ] `node scripts/walk-coverage/verify-denominator.mjs` accepts the new module (no resting-only-without-evidence failure).
- [ ] No `[TOOTHLESS-SURFACE]` warning on the Phase A enumeration run.

---

## Phase A — INTAKE: exhaustive new-site walk + bug harvest (HUNTER)

> Phases 0.4 + 0.45 + 0.5b + 0.6 + A together constitute the **INTAKE phase**. Its closure criteria are the union of each block's criteria plus Phase A's own, below.

**A walk has two first-class products, never one: (1) the machine-enumerated denominator, and (2) a manual-QA bug harvest.** A walk with a denominator and no `## Observations` section is an incomplete walk. This is the only pass where a human-grade tester sees the product before automation code calcifies around its current behaviour — automate first and today's defects become tomorrow's expected behaviour.

### A1 — Machine denominator (LR-062 — the page enumerates itself; never self-count)

```bash
node scripts/walk-coverage/enumerate-page.mjs --office=1604 --module=service-charge-text --state=1604-service-charge-text
```

Emits the service-charge-text walk-coverage JSON plus its manifest under the run reports area. **Pass `--module`** — `--url` alone inherits the pricing config (Phase 0.6). The agent does not define what counts as walkable; it only assigns a disposition to every enumerated element.

### A2 — Opener-frontier recursion (HARD STOP #11b / §20.1) — the single biggest miss class

The A1 denominator covers the **LANDING state only**. Every element that reveals a new UI state — opens a dialog, menu or popover, switches a tab, expands a row, enters an edit mode — is an **opener**. Every revealed state gets **its own enumeration + probe pass, recursively (BFS over UI states, cycle-safe via state fingerprints), until the opener frontier is EMPTY.** "All elements on the landing page probed" is NOT done. An opener that cannot be opened (permission / data / crash) is a **named blocker row**, never silence. The graduating incident is the Active checkbox *inside* the Change Local Office dialog — missed by every agent on every prior walk, found by Rutvik from a screenshot.

Each revealed state is re-enumerated by adding it to `requiredStates` and re-running A1 with a distinct `--state=` label, so each state's denominator has its own machine provenance file.

### A3 — Effect delta per control (§20.2) — presence is not a walk

For **every** filter / toggle / sort / pagination / editable cell / guard / io control, record a **BEFORE/AFTER observable delta**: row count *and row identity*, first-cell value, page indicator, dirty-flag / Save-enable state, prompt appearance, download fired. **An options-list or a presence check is NOT a walked control** — that exact rubber-stamp shipped the 2026-07-17 Override gaps (`SILENT-OMISSION` ×4).

**Zero-delta handling.** A control that produces no observable delta is a **suspicion by definition**, not a passed control. Disposition it `DIFFERENTIAL-DATA-REQUIRED` and fire the data ladder by name: **rung 1 SELF-PRODUCE** the other-side state via a reversible write on a designated office; **rung 2 SELF-SERVE** hunt an existing other-side entity **across all surfaces and artifacts**, not just the control's own API (the 1222 miss: the picker's own lookup was queried six ways, all-active, while the Location Settings admin surface showing the inactive status was never consulted); **rung 3 ESCALATE** only with rungs 1–2 evidenced. **Anti-calcification: until ground truth disambiguates, NO test case may assert the zero-effect as expected behaviour.** The only legal outputs are `BUG-CONFIRMED`, `BY-DESIGN` (with evidence the control's purpose is different), or the still-open `DIFFERENTIAL-DATA-REQUIRED` disposition, which blocks closure exactly like an undispositioned element.
> *Provenance note (honest citation):* this ladder is specified in `plans/pending/PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md` §1–4, which is **PENDING — not a landed LR rule**. The landed rule it rests on is **AGENT_SHARED_RULES §20.4** (data-need ladder, no "no data" skips). Cite both; do not cite a rule number that does not exist.

### A4 — Per-element disposition vocabulary (LR-062 + LR-065)

Every union (A∪B) element gets exactly one of — **no blanks**:
`covered-by-TC: <TC-ID>` · `affordance-probed: <LR-057 token>` · `read-only-verified` · `out-of-scope: <reason ≥20 chars>` · `DIFFERENTIAL-DATA-REQUIRED` (open, blocks closure).

- **LR-057 affordance probe**: a disabled / read-only / static classification is NOT covered until **the control, its label, AND its row/container** have each been click-probed live. Record an `affordance:` token per row — `none` | `launcher → "<dialog title verbatim>"` | `navigation → <target>` | `popover → <name>`. A non-editable display input is not proof of non-interactivity; the affordance frequently lives on the **label**, which a disabled-input `for=` association can hide from a naive click.
- **Per-launcher, never per-dialog (LR-057 / LR-012)**: when one dialog serves multiple launchers, coverage dedups **per launcher**. Each launcher needs its own `select → field-update (→ persist)` proof. "The dialog is tested" via launcher X does not discharge launcher Y — proven 2026-06-11, the shared Select Customer Address dialog persisted from Master Bill To but not from Venue. Separately, **LR-012**: assume the shared `dlgSaveChanges` / `btnSaveChangesConfirm` save dialog until MCP proves a custom one exists — never invent custom dialog selectors.
- **LR-065 grid surfaces**: any element that *is* — or is contained by — a grid / list / table / result surface additionally carries `behavior-cases:<families>` naming which `field-case-generation.md` §3 families apply (`result-fidelity`, `pagination`, `sorting`, `combination`, `render-state`, `empty-vol`, `persistence`), or `out-of-scope:<family>=<reason ≥20 chars>`. A grid archetype with **neither** is an undispositioned surface → `Coverage_Ratio` < 100% → closure gate FAIL.
- **No-taxonomy-row → brain-first, not a dead HALT**: a control type or surface behaviour with no matching §2/§3 template gets a live SFDPOT probe (click / junk input / valid input / empty / Tab-blur / Save / reload) → cases written from observed behaviour → `/research` to confirm standard angles → append the template row per `field-case-generation.md` §5. HALT only as a genuine last resort.

### A5 — Evidence, provenance and verification discipline

- **Provenance is machine-bound (LR-062 condition 5).** Every disposition that *claims observation* (`affordance-probed`, `read-only-verified`, live `covered-by-TC`) carries `provenance: live` **and** a cited machine-emitted `evidence:` artifact (a `playwright-cli` network row with endpoint + 200 + server timestamp, a snapshot, or a screenshot). `provenance: oracle` on an observation row is **FORBIDDEN** and is FABRICATION-class — it fails the whole plan closure and writes an integrity strike. If it was never live-observed, move it to `out-of-scope: <reason>`; honest inference is always available, mis-claiming a probe never is. Evidence files under `.playwright-cli/` are **emitted by the tool, never hand-authored** — a PreToolUse gate denies agent writes there.
- **Tiered Delegated Walk (LR-064)**: Opus owns recon, the machine denominator, the §2/§3 case-set and every per-field disposition. Haiku (simple deterministic fields) / Sonnet (cascading dropdown, multi-row FormArray, launcher dialog, or Haiku's failed report) run only **pre-specified** deterministic probes via Bash `playwright-cli` — never the MCP browser, never scope decisions. **Stage 3 verify is strict and non-droppable**: for every worker report, check that all required inputs were tried, evidence is *raw values* not prose, the §2.1 rejection-affordance oracle is satisfied, and no rubber-stamp smells ("looks fine", missing inputs, "couldn't find", no raw DOM value). Write a **one-line Opus verdict per field**. A lazy report triggers a re-do or one-tier escalation — never a silent close. **Never disposition an element from an unverified delegated report.**
- **Blind independent re-drive (LR-064 Stage 3, non-droppable)**: a second cheap worker — **blind**: given the field and exact inputs but **not** the first worker's answer, disposition or cited evidence — re-drives a random sample of the `provenance: live` rows and captures its own raw evidence. Any contradiction rejects that disposition. Never tweak a re-drive toward agreement.
- **Positive control before any inert verdict (LR-061-C)**: never record a control as inert / static / un-drivable / "does not add" without first proving the **same primitive** fires on a known-positive case. A raw-JS `element.click()` does **not** reliably fire a React `onClick` — drive with Playwright `.click()`. Never conclude "drag does not add" from `.dragTo()` — require the full `mouse.move → down → move(steps) → up` sequence, verified against a mode where the action *does* add. A no-op with no positive control is unsound evidence and may not enter the inventory, a catalog, or a TC.
- **N≥2 before any generalisation (LR-061-A)**: any behaviour claim about the app needs two independent sources — two offices, or new-site + baseline. One office is a data point, never a conclusion.
- **Missing testids via LIVE DOM only (LR-029)**: run `document.querySelectorAll('[data-testid]')` on each state and cross-reference against our selectors. **A static grep of selector files is not proof** — selector files show what we use, not what exists. Per **LR-014**, a genuinely-absent testid is recorded as `(MISSING — using <locator-kind>; tracked in testid-gap-report)`, the test **runs on the next-best stable locator**, and the gap rolls up into one module-level client ask. A missing testid is never a reason to skip or `fixme`.
- **Boolean render format per table (LR-036)**: verify the render format for **each** table before any boolean-reading helper is written — Unicode `✔` readable via `textContent`; SVG `lucide-check` where `textContent` is EMPTY for **both** states (empty cell = FALSE); old-site Bootstrap Glyphicon likewise empty for TRUE. Never assume two tables share a format.
- **`beforeunload` (ALL-052)**: after any field edit, call dialog-accept **before** `goto`. Use `about:blank → target`. **Never reload the same URL.**
- **Restore after every interaction (ALL-049)**; reload to a fresh state before documenting any default (PLN-023: defaults come from DOM, never from memory or REQUIREMENTS.md).
- **Enumerate every Save button (PLN-024)** — shared vs tab-specific testid and disabled state. **Test revert (PLN-025)** — change → revert → observe Save state. **Verify dropdown search (PLN-026)** — open and look; never assume a search input exists.

### A6 — Bug harvest (`/find-bugs`, §20.3, ALL-045) — non-optional

Probe adversarially per element class: boundary values, invalid input, rapid double-actions, save/cancel + dirty-navigation races, empty↔populated transitions, concurrent edits. Route **every** anomaly — console error, failed/5xx request, wrong render, stuck state — into the artifact's Observations.

The walk-evidence artifact carries a top-level **`## Observations`** section with two buckets:
- **`### Bugs / Defects`** (HIGH) — any UI/UX/layout/rendering/behaviour/accessibility defect noticed, even with no failing test and no documented requirement → `BUG-CANDIDATE`, then filed per LR-034.
- **`### Suggestions / Improvements`** (LOW) — enhancement / missing-feature ideas, plus ambiguous discussion-items (empty-everywhere + no-UI-path + no-Jira are **discussion items, not bugs**).

**Nothing to report = the literal `none` under each bucket. An ABSENT section is an incomplete walk.** Zero suspicions on a non-trivial surface is a signal to interrogate the walk, not a clean bill.

**Render-state defects must be SEEN (HARD STOP #13):** when driving any validation or boundary path, capture the error state's **render** — the invalid / over-max cell must be observed to render legibly (no overflow, no reflow, icon in-bounds) via Chrome, an element screenshot, or `boundingBox` geometry. An `aria-invalid`-only assertion is a false-green over a possibly-broken layout (WCAG ARIA21) — this is the exact gap that hid BUG-CPR-DET-001.

### A7 — Triage before anything is called a bug

Every finding is triaged before it earns the word "bug": `/rca` for the mechanism, LR-044 verbatim-repro discipline for anything already filed, and REQ-014 classification (`intentional-UX` / `app-bug` / `stale-ticket`) for DOM-vs-Jira contradictions. **Every CONFIRMED walk-found bug's reproduction edge-case becomes a REQUIRED test case** in Phase B's case set — that loop-closure is the point of harvesting.

### A8 — Artifacts

- `clients/encore/specs_planning/_internal/walk-evidence-service-charge-text-2026-08-03.md` — per-element worker tier, raw evidence, `anomaly:` notes, Opus verdict, and the `## Observations` section. No `walk-probes/` directory and no `walk-judgment-*` file; those were over-engineering and must not reappear.
- the service-charge-text field inventory dated 2026-08-03 (the artifact this cited is gone; the claim is unverified as file evidence) — all 8 mandatory frontmatter keys (`Module`, `Client`, `MCP_Session_Date` = filename date, `MCP_Session_Tool`, `MCP_Tool_Reason`, `Author_Identity`, `Page_URL`, `Test_Entity`) + `Baseline_Artifact`; the 7 mandatory sections; the 8-column Field Inventory table; and the `## Coverage Manifest` block with `Coverage_Ratio: N/N (100%)`, `Walk_State:`, `CrossCheck: clean`.

**Phase A (INTAKE) closure criteria**
- [ ] `Coverage_Ratio` = **100%**, zero undispositioned rows, `CrossCheck: clean` — verified by `node scripts/walk-coverage/cross-check.mjs`, not by assertion.
- [ ] **Opener frontier empty** — every revealed state has its own `reports/walk-coverage/<state>.json`; every un-openable opener is a named blocker row.
- [ ] Every filter/toggle/sort/pagination/edit/guard/io control has a recorded BEFORE/AFTER delta; zero-delta rows carry `DIFFERENTIAL-DATA-REQUIRED` + rung-1/rung-2 evidence.
- [ ] Every observation-claiming row carries `provenance: live` + a non-stale `evidence:` pointer naming that control; zero `provenance: oracle` on observation rows.
- [ ] Blind re-drive sample run; contradictions rejected and escalated, none silently reconciled.
- [ ] Every grid/list/table surface carries `behavior-cases:` or an explicit per-family `out-of-scope:`.
- [ ] `## Observations` present with **both** buckets filled or the literal `none`; every confirmed bug filed per LR-034 with `baselineComparison` + `baselineEvidence`, and its repro edge-case listed as a required TC for Phase B.
- [ ] Testid gaps recorded from live DOM (LR-029) and rolled into one module-level ask; boolean render format recorded per table (LR-036).
- [ ] If the walk cannot be finished: **HALT and report the un-walked remainder** (LR-064 delegation-down HALT). Closing an unfinishable walk by classifying-from-spec is forbidden.

---

## Phase B — L1 QUICK: field FCC + surface must-asserts + first green spec

**Depends on Phase A closing at 100%.** Do not author a case for a control the walk did not see.

### B0 — ID grammar minting (GIVER; nothing downstream may reference a TC ID before this lands)

1. **Mint the module code in `export_test_cases/module-codes.json`** — `"SCT": { "name": "service-charge-text", "display": "Service Charge Text", "dir": "service-charge-text" }`.
2. **Mint submodule codes ONLY for surfaces the walk actually found.** Reconcile to Phase A's manifest — **never register a code for a surface the walk did not see.** If the walk found a single surface, `CORE` is the code (it already exists in `KNOWN_SUB_CODES`, so no `types.ts` edit is needed and set-parity still holds). If the walk found multiple tabs/surfaces, mint one code per surface and add each **new** code to `export_test_cases/types.ts` `KNOWN_SUB_CODES` — `check-tc-parity` guardrail 6 asserts set-parity between that list and the registry, so drift fails the commit gate.
3. **Sheet names ≤31 chars** (hard Excel cap). `service_charge_text_core` = 24 ✓. Any longer submodule must be shortened at mint time and its truncation recorded in `sheetNameNotes`.
4. Register `mdBasename` per submodule (e.g. `service_charge_text_core_test_cases`).
5. TC grammar is exactly 3 segments: `TC-SCT-<SUB>-NNN`. **Field cases ride the ordinary band** — no separate ID space. A 4th segment fails `check-tc-parity` G6.

### B1 — Registry + directory registration

Add a flat module row to `clients/encore/docs/MODULE_REGISTRY.md` (`service-charge-text` | Service Charge Text | `/settings/service-charge-text` | the surfaces the walk found) and **remove Service Charge from the "Not-yet-automated → Setup (other)" row** if and only if this is the same surface — verify, do not assume; "Service Charge" and "Service Charge Text" may be two different pages.

### B2 — Field-case catalog (GIVER)

`clients/encore/specs_planning/_internal/field-case-catalogs/service-charge-text-2026-08-03.md`:
- **Axis 1 (§2)** — per-field-type case templates for every inventoried field type (plain text · numeric · password · checkbox · dropdown/combobox · cascading dropdown · multi-row FormArray · date/offset · file upload · rich text · lookup launcher), each with positive / BVA / negative / save-cycle cases **and the §2.1 rejection-affordance oracle on every Negative and BVA case** — the rejection must be *announced* and *escapable*.
- **Axis 2 (§3) — `## Surface-Behavior Cases (SBC)`** — for every grid/list/table/result surface, ≥1 **QUICK** must-assert per applicable family; inapplicable families get `out-of-scope:<family>=<reason ≥20 chars>`.
- Map each case to EXISTING coverage vs gap; list the net-new TC IDs.

### B3 — Test cases + test plan (GIVER, sole owner of test-case files)

- `clients/encore/specs_planning/test-cases/setup/service-charge-text/service_charge_text_core_test_cases.md`
- `clients/encore/specs_planning/test-plans/setup/service-charge-text/service_charge_text_core_test_plan.md`

Rules: `## FIELD INVENTORY`, `## Validation Rules`, `## MCP_VERIFICATION_LOG` sections present (STRUCT-001/002/003); step **pipe-table** with a per-step Expected Result on every row including the last, header matched literally as `| # | Step | Expected Result |`, pipes escaped `\|`; `**Automatable**:` on every TC (AUT-001); no selector code-names in Steps (PLN-018); no uncertain language (PLN-015); no `DISCOVER_` placeholders (AUD-005); no arrows in Data sections (PLN-021); header TC count == actual count (HARD STOP #9). **ALL-071 / HARD STOP #8**: every TC ID appears in the test plan with matching content.

**Surface TCs are ordinary TCs** carrying a `**Surface_Family**: <family> (QUICK)` line. **ALL-091 — the `(QUICK)`/`(DEEP)` marker goes ONLY on the `Surface_Family` line, NEVER on the `## TC-…:` heading**, because the heading ships verbatim as the reviewer-facing Title column; `scripts/xlsx-lint-rules.mjs` hard-blocks the marker, `SBC`, `Surface_Family` and `FLAG` at build/commit/ship.

**Every CONFIRMED Phase-A bug's repro edge-case is a REQUIRED TC here** — not optional, not deferred.

### B4 — Spec + page object (BUILDER)

- `clients/encore/src/selectors/service-charge-text/service-charge-text.ts`
- `clients/encore/src/pages/service-charge-text/service-charge-text.page.ts`
- `clients/encore/src/data/service-charge-text/service-charge-text.ts`
- `clients/encore/tests/service-charge-text/service-charge-text.spec.ts`

- HARD STOP #11 mirror: **no spec before** the test-cases MD block, the test-plan Scenario rows, and the ≤14-day catalog all exist. Any missing → HALT and escalate to GIVER.
- FCC `describe` at the TOP using `saveAndVerifyCase()` from `src/utils/field-case-runner.ts`; `SBC — service-charge-text` describe below it using **existing** grid helpers — **no new runner**.
- `test.describe(...)` not `.serial`; `dependencyGate([])` as the first line of each independent test body.
- **LR-019 / HARD STOP #16**: any describe that mutates+saves resets baseline **per-test** in `test.beforeEach` (or via `saveAndVerifyCase({ baseline })`), and the spec is registered in `scripts/check-per-test-baseline.mjs` **in the same change**. A reset living only in the first test's body is insufficient.
- `clickSaveAndConfirm` for save flows (LR-012); `expectInvalid`/`expectValid` polling for cross-field (LR-010); **no `networkidle`** (LR-023).
- **LR-058 / HARD STOP #12**: everything under `clients/encore/{src,tests,config,README.md}` ships to the customer. Zero internal vocab — no `LR-###`, no `PLAN_*`/`SUBPLAN_*`, no identity codenames, no `_internal/` or `walk-evidence` paths. Reasons in plain English. **LR-ENC-006**: every public page-object action renders as a ≤12-word plain-English step.
- **GEN-045**: an expected value not sourced from a GIVER artifact is verified against Jira/Confluence first; if no story governs it, tag `// DOM-only — no Jira story`. Never invent an expected value; never assert a DOM-observed value *as* the requirement.
- Run it: `npx playwright test clients/encore/tests/service-charge-text --project=chromium` must return a real pass/fail count (GEN-028). Green **×2**.

**Phase B (L1) closure criteria**
- [ ] `SCT` in `module-codes.json`; every new sub code in `types.ts`; every registered code maps to a surface the walk saw; all sheet names ≤31 chars.
- [ ] `npm run lint:testcases` exit 0 · `npm run check:tc-parity` exit 0 (0 spec-orphan, 0 MD-orphan, 0 XLSX-orphan) · `npm run check:step-labels` exit 0 · `npm run check:per-test-baseline` exit 0 · `npm run check:spec-quality` exit 0 on the **working tree** (LR-060 obligation 4 — a commit-time-only gate is not a substitute).
- [ ] `npm run planner:post-complete <id>` → `selfAuditPassed=true`, `xlsxRebuilt=true`, and the XLSX sheet row count == MD TC count (FCC + SBC + main).
- [ ] `npx playwright test --list` resolves every new TC ID; spec green ×2.
- [ ] Every applicable §3 family has ≥1 QUICK TC or an explicit `out-of-scope:<family>=<reason ≥20 chars>`.
- [ ] MODULE_REGISTRY.md row added.

---

## Phase C — L2 DEEP (Case-Generation Standard L2)

**Depends on Phase B closing green.** DEEP cases are ordinary 3-segment TCs numbered past B's high-water mark, blended at the TOP of the existing describe, reusing B's page-object helpers.

1. **Persistence math / matrices** — save-cycle correctness across every field combination the surface supports; values survive reload and browser-back.
2. **Date-BVA exotica** (only if the walk found date/offset fields) — leap-year, year-rollover, Start = End, ±1 day. Where offset fields exist, respect **LR-008** sign constraints per field type (relative-to-start ≤ 0; relative-to-end ≥ 0; Delivery additionally ≥ Prep per NM-1264) — test values must satisfy **all** constraints for the field under test.
3. **Pairwise / covering-array grid combinations** — bounded matrix over the multi-parameter controls the walk actually found.
4. **Decision-table full enumeration** for the `combination` family (multi-filter AND, Reset clears all).
5. **State-transition save-flow model** — `Clean → Dirty → Saving → Save-OK | Save-Failed`, `Dirty → Navigate-Away-Prompt → Stay | Leave`, `Dirty → Tab-Switch → (preserved?)`, `Validation-Error → Fix → Dirty`, `Edit-to-original-value → Save-disabled` (revert ≠ pristine). Every transition maps to ≥1 case or a documented skip. **Angular trap**: the Save button disabling does not clear the dirty flag — tab-nav can still trigger Unsaved. Assert the flag, not the button.
6. Each carries `**Surface_Family**: <family> (DEEP)` on the Surface_Family line **only** (ALL-091).

**Phase C (L2) closure criteria**
- [ ] Every L2 family above either has TCs or a recorded `out-of-scope:<family>=<reason ≥20 chars>` citing the walk.
- [ ] `check:tc-parity` exit 0 · `check:spec-quality` exit 0 on the working tree · L2 specs green ×2.
- [ ] Zero TCs asserting a `DIFFERENTIAL-DATA-REQUIRED` zero-effect as expected behaviour.

---

## Phase D — L3 DEEP (Case-Generation Standard L3)

1. **File-I/O round-trip** (if the walk found file controls) — real download via `waitForEvent('download')` + real upload fixture → validation/success. Download-dir and fixture-file scaffolding added here.
2. **Integration / cross-field** — consume any dependency-map artifact; cover **every** `depends-on` edge. No cherry-picking.
3. **Full accessibility audit** — tab order, focus trap, label association, error-guidance, hover-only-action failures.
4. **Error-guessing** — rapid double-click race, concurrent edits, save-failure injection + retry, dropdown-load-failure recovery.
5. **Tier-2 network-payload structural validation** — the response body reflects the committed payload. (Tier-3 DB query is out of framework scope.)
6. **Volume / virtualization stress** — 0 / 1 / N rows; off-screen rows read by **content anchor, never row index** (shared save handlers pollute row 0).
7. **Deferred families** (`rbac` / `concurrency` / `platform`) stay deferred unless the walk proves this module genuinely needs one — then promote per the Standard's promotion clause with a template row, rather than faking coverage.

**Phase D (L3) closure criteria**
- [ ] Every L3 item above has TCs or a recorded `out-of-scope:<item>=<reason ≥20 chars>`.
- [ ] Every `depends-on` edge in the dependency map is covered — enumerate them and show the count.
- [ ] `check:tc-parity` exit 0 · `check:spec-quality` exit 0 on the working tree · full module suite green ×2 from a **cleaned** `allure-results` (`rm -rf` first — it accumulates forever).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during Phases 0–D that is (same identity) + (same file/module) + (5–30 min) + (no user input needed), pick exactly one: **DO-NOW** · **SPAWN** (`mcp__ccd_session__spawn_task`, self-contained prompt + acceptance criteria) · **APPEND** (edit a named pending plan with a grep-verifiable line item, then `grep -F "<the line>" plans/pending/<file>` to verify). Bare "out of scope" with no recipient = HALT + ask Rutvik (LR-040 + LR-046).

**Known candidate, pre-identified:** `scripts/walk-coverage/enumerate-page.mjs` defaults `moduleName` to `'pricing'`, so a `--url`-only invocation silently walks any page under the pricing config and still prints success (line 465–466 vs 521–524, 790). That is a live footgun for every future new-module walk, not just this one. Disposition it explicitly — do not let it pass as noticed-and-forgotten.

---

## Execution Deviations Log (recorded as they happened, 2026-08-03)

Per `feedback_plan_deviations_log` — deviations are logged when they occur, not reconstructed at closure.

| # | Plan said | What actually happened | Disposition |
|---|---|---|---|
| **DEV-1** | Phase 0.6 closure criterion: "`verify-denominator.mjs` accepts the new module" | The command **cannot** evaluate a module until a walk report exists — with no report it exits 0 having printed 0 bytes and never naming the module. Unsatisfiable AT Phase 0.6. | Criterion re-sequenced to after Phase A1, where it becomes meaningful. Root defect = **D3** in `SUBPLAN_WALK_TOOLING_SILENT_GREEN`. |
| **DEV-2** | Phase 0.4 step 2: "`playwright-cli snapshot -o …`" | The flag is `--filename`; `-o` is rejected (`Unknown option: --o`). | Corrected in every probe, verified against the CLI's own `--help`, not memory. |
| **DEV-3** | Phase B1: remove "Service Charge" from the not-yet-automated row "if and only if this is the same surface" | It is **NOT** the same surface — `/settings/service-charge` renders `H1: Service Charge` with a different testid hash (`4f545e3d…` vs `f2fa1f1a…`). | Row **kept**. Verified before editing, so no false coverage claim was made. |
| **DEV-4** | Acceptance **A4**: `npm run lint:testcases` exit 0 | Exits **1 before any change from this plan** — 126 pre-existing `AUT-001` violations in `local-office` + `AUD-010` warnings in `corporate-pricing`. Proven pre-existing by stashing this session's edits and re-running: still exit 1, **zero** hits naming `service-charge-text`. | **A4 is not satisfiable by this plan.** Fixing other modules' TCs is out of scope. Recorded as a stated deviation rather than a silent green. |
| **DEV-5** | Phase 0.45 anticipated a possible `[ROVO-SKIP]` | Rovo **was** connected. Intake found **NM-1728** carrying the complete governing acceptance criteria — a materially better input than planned. | Full Jira intake performed; 3 divergences found, probed, classified. |
| **DEV-6** | Phase 0.5b expected a clean baseline verdict | nav2 shows Service Charge only as *calculation settings*; `#/setup` rendered an **empty DOM** (`BODY_LEN: 0`), so the Setup page asserted by NAV-4106 could not be evaluated. | `baselineScope: baseline-inconclusive` — deliberately NOT `baseline-absent`, since an empty render cannot prove absence. Escalated via `/encore-questions`; not a HALT per ALL-078. |
| **DEV-8** | Phase A6/A7 assumed a red test proves an application defect | Five spec failures were reported upward as five application defects **without anyone opening the application**. The user then photographed the app behaving correctly for the first one. A live re-verification under LR-044 overturned **three of five**: TC-005 (the app does announce a duplicate — `aria-invalid` + red icon + tooltip "Duplicate Service Charge Name for this language.") and TC-007 (the 300-char value is retained and reachable; truncation is ordinary narrow-column display) were **test defects**; TC-057 is a **discussion item** (simple table — WCAG 1.3.1 does not require `scope` where structure already determines the header relationship). Only TC-056 and TC-058 are genuine. | Test cases + test plan corrected; the three false claims withdrawn. Root cause = inferring "app is broken" from "test is red". **Superseded by DEV-11 — the owner rejected all five accessibility/markup findings as out of scope; nothing from this row remains filed.** |
| **DEV-11** | Phase A6/B2 treated "does every control carry a programmatic name" as a coverage obligation, producing accessibility test cases and bug filings | Owner ruling 2026-08-04: markup-level accessibility findings are **not in scope for this client** and are not wanted as bugs, test cases, or observations — *"why are you finding bugs in dom, don't waste my time."* | All of it removed: `BUG-SCT-CORE-001` and `BUG-SCT-CORE-002` deleted; TC-056, TC-057 and TC-058 dropped from the test cases and the test plan (**64 → 61** scenarios, expected failures → **0**); the corresponding spec tests removed. **Standing scope rule for this client: do not raise DOM/markup accessibility findings as defects.** |
| **DEV-9** | Acceptance **A1** + the Verification block: `node scripts/walk-coverage/cross-check.mjs` → `CrossCheck: clean` | That invocation **cannot** emit a verdict — with no arguments the tool prints its usage banner and **exits 0**, evaluating nothing. The real command is `--manifest <path>`. Separately, `crossCheckVerdict()` (`cross-check.mjs:41`) counts an entry as dispositioned iff the field is a **non-empty string**, so any filler produces `clean`. | A1 is unsatisfiable as written. Run with `--manifest`; the walk closed `clean` on the real invocation, and the 42 dispositions were spot-audited as specific and externally corroborated. Both tool holes filed as **D10** in `SUBPLAN_WALK_TOOLING_SILENT_GREEN` (grep-verified). |
| **DEV-10** | Acceptance **A11**: `npx playwright test … --project=chromium` green ×2 | There is no `chrome` project. `playwright.config.ts` defines `setup`, `chromium`, `encore-local-office`, `encore-locations`. The criterion was never runnable as written with `--project=chrome`. | Corrected to `--project=chromium`. |
| **DEV-7** | Phase A1/A2 assumed a walk denominator is cheap | The enumerator captured the page's **loading skeleton** 3/3 times (`contentMarker` never awaited on a flat page) while reporting `status:"complete"`. After the tool fix, the declared opener frontier is **114 row-comboboxes + 114 rich-text cells**. | Tool fixed (D1/D9). **Open design decision for A2**: the frontier must be walked by **archetype** (one representative row + boundary rows), not per-element — 114 identical per-row comboboxes are ONE archetype, not 114 states. The enumerator already supports archetype collapse; A2 must declare it rather than enumerate ~228 near-identical openers. |

---

## Execution Summary

**Outcome**: 61 → 83 tests; 83/83 green in a single run (9 batches, 2026-08-04); four gates pass (`tc-parity` clean for this module, `per-test-baseline` PASS, `step-labels` PASS, `spec-quality` OK with 0 violations); workbook rebuilt to 83 at 100%.

**Evidence**: `clients/encore/reports/run-evidence/service-charge-text-2026-08-04/` (b1–b9 verify files + 4 gate verify files + SUMMARY.md). Raw Allure output at `clients/encore/reports/allure-results/` (5009 files, timestamps 23:27–00:08).

**Phases completed**:
- **Phase A (INTAKE)**: walk evidence at `clients/encore/specs_planning/_internal/walk-evidence-service-charge-text-2026-08-03.md`; field inventory at `clients/encore/specs_planning/_internal/field-inventories/service-charge-text-2026-08-03.md`; Jira crossref at `clients/encore/specs_planning/_internal/jira-defect-crossref-service-charge-text-2026-08-03.md`.
- **Phase B (L1 QUICK)**: test cases at `clients/encore/specs_planning/test-cases/setup/service-charge-text/service_charge_text_core_test_cases.md`; test plan at `clients/encore/specs_planning/test-plans/setup/service-charge-text/service_charge_text_core_test_plan.md`; spec at `clients/encore/tests/service-charge-text/service-charge-text.spec.ts`; page object at `clients/encore/src/pages/service-charge-text/service-charge-text.page.ts`.
- **Phase C (L2 DEEP)**: field-case catalog at `clients/encore/specs_planning/_internal/field-case-catalogs/service-charge-text-2026-08-03.md`.
- **Phase D (L3 DEEP)**: completed — integration/cross-field and concurrency families covered in the spec.

**Defects found and fixed this execution (5)**:
1. The language-filter helper waited on a response the app may never send (TC-051).
2. An editor-dirty dialog blocking save (TC-069).
3. A navigation guard deregistering after the Save button disables (TC-074).
4. Seven arbitrary sleeps in the spec replaced with deterministic waits.
5. Ten hardcoded per-language row-count assertions replaced with a partition invariant.

**Scope calls**: date-BVA, multi-filter/Reset, file-I/O and deferred families ruled out with walk-cited evidence; markup accessibility excluded by owner ruling (behaviour-only kept); integration/cross-field ALREADY-COVERED across six enumerated edges (multi-row save, revert-after-edit, language-change + name-edit, concurrent-session conflict, filter-then-edit, add-row-then-save).

**Known open items**:
1. The suite permanently grows office-1604 data — the UI has no delete, so row-creating tests leave rows behind (114 → 117 observed). Owner decision pending.
2. `service_charge_text_core` is absent from `SPLIT_FILE_MAP` (`export_test_cases/to-xlsx.ts:194`), so this module ships no per-module workbook while four other modules do. Owner decision pending.
3. The page object carries 13 `waitForTimeout` calls; `check-spec-sleeps` scans specs only, so no gate sees them.
4. ~~Acceptance criteria A11 and the BUILDER matrix row still name `--project=chrome`, which does not exist; DEV-10 dispositions this but the criterion text was never corrected.~~ **RESOLVED 2026-08-06: A11, BUILDER matrix, and Verification block corrected to `--project=chromium`; DEV-10 updated.**
5. `check:spec-quality` exits 0 while `check-reject-oracle` prints failures in announce mode — a vacuous-green edge in another module's data.

---

## Per-Identity Satisfaction

> **Closure obligation (DISCHARGED 2026-08-03)**: every dated-artifact placeholder below has been replaced with the actual session date `2026-08-03`. Closure-check C6 greps these cells literally, so an unreplaced placeholder would be a DENY; acceptance A10 re-verifies that none remain.

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site baseline · Jira crossref · walk evidence · REQUIREMENTS.md | `clients/encore/specs_planning/_internal/old-site-baseline/service-charge-text-2026-08-03.md`<br>`clients/encore/specs_planning/_internal/jira-defect-crossref-service-charge-text-2026-08-03.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-service-charge-text-2026-08-03.md`<br>`clients/encore/docs/REQUIREMENTS.md` | `node scripts/walk-coverage/cross-check.mjs` → `CrossCheck: clean`; `grep -c "^## Observations" <walk-evidence>` = 1 |
| GIVER | field inventory · field-case catalog · test cases · test plan · XLSX | `clients/encore/specs_planning/_internal/field-inventories/service-charge-text-2026-08-03.md`<br>`clients/encore/specs_planning/_internal/field-case-catalogs/service-charge-text-2026-08-03.md`<br>`clients/encore/specs_planning/test-cases/setup/service-charge-text/service_charge_text_core_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/service-charge-text/service_charge_text_core_test_plan.md` | `npm run check:tc-parity` exit 0; `npm run lint:testcases` exit 0 |
| BUILDER | selectors · page object · test data · spec | `clients/encore/src/selectors/service-charge-text/service-charge-text.ts`<br>`clients/encore/src/pages/service-charge-text/service-charge-text.page.ts`<br>`clients/encore/src/data/service-charge-text/service-charge-text.ts`<br>`clients/encore/tests/service-charge-text/service-charge-text.spec.ts` | `npx playwright test clients/encore/tests/service-charge-text --project=chromium` green ×2; `npm run check:spec-quality` exit 0 |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | ID registry · walk tooling config · module registry · this plan | `export_test_cases/module-codes.json`<br>`export_test_cases/types.ts`<br>`scripts/walk-coverage/enumerate-page.mjs`<br>`scripts/walk-coverage/lib/module-config.mjs`<br>`clients/encore/docs/MODULE_REGISTRY.md`<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` | `node scripts/plans-reindex.mjs --check` reports INDEX.md current; `npm run check:tc-parity` exit 0 |

---

## Acceptance criteria (LR-040 closure gate)

Every enumerated item — element, field, surface family, TC — closes as **(a)** directly proven with cited evidence, **(b)** inference-classified with a grep-verifiable line item in a named plan that exists in `plans/pending/` or `plans/done/`, or **(c)** user-flagged with a named bug ID / discussion-item flag (and, for any empty surface, the c.1/c.2/c.3 record). Anything that fits none of the three = **HALT and ask Rutvik**.

- [ ] **A1** — `node scripts/walk-coverage/cross-check.mjs` → `CrossCheck: clean`, `Coverage_Ratio 100%`, zero undispositioned rows.
- [ ] **A2** — `grep -c "provenance: oracle" clients/encore/specs_planning/_internal/field-inventories/service-charge-text-2026-08-03.md` on observation rows = **0**.
- [ ] **A3** — `grep -A4 "^## Observations" clients/encore/specs_planning/_internal/walk-evidence-service-charge-text-2026-08-03.md` shows both buckets populated or the literal `none`.
- [ ] **A4** — `npm run lint:testcases` exit 0.
- [ ] **A5** — `npm run check:tc-parity` exit 0.
- [ ] **A6** — `npm run check:step-labels` exit 0.
- [ ] **A7** — `npm run check:per-test-baseline` exit 0.
- [ ] **A8** — `npm run check:spec-quality` exit 0, run on the **working tree** before any "done / green / verified" claim.
- [ ] **A9** — `grep -rn "cloudapps-dev\|1609" plans/pending/PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md clients/encore/src clients/encore/tests clients/encore/specs_planning` returns **only** this plan's Context paragraph. Zero hits in code, config, selectors, specs or artifacts.
- [ ] **A10** — `grep -cE '<[A-Z-]+-DATE>' plans/pending/PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md` returns **0** at the Status flip (the regex is written so this line cannot match itself).
- [ ] **A11** — `npx playwright test clients/encore/tests/service-charge-text --project=chromium` green ×2, from a cleaned `allure-results`.
- [ ] **A12** — `node scripts/validate-plan-closure.mjs plans/pending/PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md` → PASS (C1–C6).
- [ ] **A13** — `node scripts/plans-reindex.mjs --check` reports INDEX.md current.
- [ ] **A14** — MODULE_REGISTRY.md carries the `service-charge-text` row; `clients/encore/docs/REQUIREMENTS.md` carries the surface's behaviours.
- [ ] **A15** — `/regression-guard` before/after: no silent breakage on touched files.
- [ ] **A16** — Activity-log row appended per LR-028, timestamp ≥ every touched file's mtime (LR-037); the log is committed this session or the timestamps lie.
- [ ] **A17** — `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042, with the mandatory mistakes attestation (`**Mistakes this session:** <N> (IDs + Sev)` or `none — 6 triggers checked`).

---

## Verification

```bash
node scripts/walk-coverage/enumerate-page.mjs --office=1604 --module=service-charge-text --state=1604-service-charge-text  # expect: denominator>0, no [TOOTHLESS-SURFACE] warning
```
```bash
node scripts/walk-coverage/cross-check.mjs  # expect: CrossCheck: clean, Coverage_Ratio 100%
```
```bash
npm run lint:testcases && npm run check:tc-parity && npm run check:step-labels && npm run check:per-test-baseline && npm run check:spec-quality  # expect: all exit 0
```
```bash
npx playwright test clients/encore/tests/service-charge-text --project=chromium  # expect: pass count > 0, 0 failed
```
```bash
node scripts/validate-plan-closure.mjs plans/pending/PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md  # expect: PASS
```

---

## Handoff (post-execution)

Chat-only per `feedback_handoff_in_chat_only.md`; describes outcomes per LR-039.

On completion, the Service Charge Text surface is a registered module with a machine-proven 100% walk denominator, a dated old-site baseline, a triaged bug harvest whose confirmed findings are covered by required test cases, and L1/L2/L3 coverage running green — leaving the next session a fully registered module whose ID grammar, walk config and registry rows are already reconciled to what the walk actually found.
