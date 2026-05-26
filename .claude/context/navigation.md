# Agent Navigation — First-Step Lookup (Universal, Framework-Level)

**Every agent reads this FIRST at session start. Before any `grep`, before any MCP, before any exploration.**

This file answers two questions:
1. **Has this area been explored before?** → skip rediscovery, read the findings.
2. **How do I efficiently solve problem X?** → routing table maps problem → file.

Stale map = repeated mistakes. Every agent owns keeping this current (see §Maintenance below).

---

## §A. First-Step Decision Tree (BEFORE any exploration)

1. Identify the **surface** your task touches (module + page + tab + feature).
2. Search §C Exploration Registry for that surface.
3. **Decision**:
   - ✅ **FOUND in registry** → read the listed findings file(s). Use documented knowledge. Skip rediscovery. Only re-explore if the registry's "Last updated" date is stale vs. your expected app state AND you need fresh data.
   - ❌ **NOT in registry** → you are the first explorer. Proceed with live MCP or code inspection. At session end (in `/reflect`), **add a registry entry** so the next agent benefits.

**Why this matters**: re-exploration burns tokens and drifts from documented findings. Wasted tokens and inconsistent source-of-truth hurt every downstream agent.

---

## §B. Routing Table — "I need to..." → "Read this first"

Paths use `${ACTIVE_CLIENT}` placeholder. For Encore: `${ACTIVE_CLIENT}` = `encore`.

| "I need to..." | Read first | Rule / Trigger |
|---|---|---|
| Drive an Angular input (type, fill, validate) | `clients/${ACTIVE_CLIENT}/src/pages/{module}/{page}.page.ts` → `fillAndTab` / `clearAndTab` / `fillWithValidation` | GEN-008; ALL-073 |
| Toggle a Radix UI checkbox | same page object → `setRadixCheckbox(key, bool)` / `checkCheckbox` / `uncheckCheckbox` | — |
| Click Save + confirm the "Save Changes" dialog | same page object → `clickSaveAndConfirm(key, dlg, confirm)` / `clickSaveWithDialog` | LR-012 |
| Author / modify a network listener that asserts save behavior (`page.on('request', ...)`, `waitForRequest`, `waitForResponse`) | Filter on the backend API endpoint (e.g., `req.url().includes('/navigator/api/')`) — NEVER substring-match the page URL (`/settings/location`). Next.js App-Router fires server-component-render POSTs to the page URL for 0-8s after `page.reload()`; a page-URL filter captures these as false-positive saves. | LR-056; ALL-086 |
| Wait for Save enabled / disabled (Angular dirty race) | same page object → `waitForSaveEnabled` / `waitForSaveDisabled` | LR-026 |
| Dismiss "Unsaved changes" alertdialog | same page object → `dismissAlertDialogIfVisible()` | LR-026 |
| Sort a Radix table column (large-option retry) | `clients/${ACTIVE_CLIENT}/src/pages/locations/location-management-history.page.ts` → `clickSortColumn` | LR-025 |
| Activate a Radix UI tab (top-tab or sub-tab) via direct JS in MCP/Chrome | Use Playwright's `.click()` OR dispatch FULL pointer event sequence (`pointerdown`+`pointerup`+`click`) on the `button[role="tab"]`. Plain raw-JS `.click()` alone does NOT flip `aria-selected="true"` — Radix listens for the full event sequence. **MCP/Chrome JS helper**: `nt.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true,...})); nt.dispatchEvent(new PointerEvent('pointerup', {bubbles:true,...})); nt.click()`. Playwright `.click()` already does this. Reproduced 2026-05-11 on Location Settings sub-tabs (Notes, Basic Info, Location Management History). | (no LR yet — pattern-quality, file Phase 1a finding) |
| Wait for page/data ready in Angular SPA | any page object → `waitForAngularStable()` (NEVER `networkidle`) | LR-023 |
| Find a testid / selector | `clients/${ACTIVE_CLIENT}/src/selectors/{module}/{page}.ts`; naming `{module}-{section}-{kind}-{field}` | LR-017 |
| Know a field's baseline / invalid / default value | `clients/${ACTIVE_CLIENT}/src/data/testdata/{module}/{page}.data.ts` | — |
| Understand history schema (LO 42-col, LM 87-col) | `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §1 §2 | — |
| Understand history boolean encoding per table | LR-036 (Unicode vs SVG `lucide-check`); MCP findings §2 | LR-036 |
| Understand async cross-field validation | LR-010; page object `expectInvalid` / `expectValid` polling helpers | LR-010 |
| Understand date-offset validation constraints | LR-008; NM-1264 (Delivery ≥ Prep) | LR-008 |
| Understand Angular form dirty state persistence across saves | LR-026; defensive handling patterns in page objects | LR-026 |
| File a bug | LR-034 protocol → `reports/bugs/BUG-{MODULE}-{NNN}.json` (dedup first) | LR-034 |
| Understand module boundary (LOS ≠ LS) | `clients/${ACTIVE_CLIENT}/docs/MODULE_REGISTRY.md`; `REQUIREMENTS.md` | LR-017, MOD-001 |
| Look up a framework rule `LR-NNN` | path-scoped: `.claude/rules/<topic>.md` (angular, specs, hooks-identity, browser-tool, pipeline, baseline, data, inventory) — auto-loads on matching file edits. Cross-cutting: `docs/read_only_docs/LEARNED_RULES.md`. | — |
| Look up a client rule `LR-ENC-NNN` | `clients/${ACTIVE_CLIENT}/CLAUDE.md` | — |
| Look up an agent-mistake by type | `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` — ALL-* shared, GEN-* generator, HLR-* healer, AUD-* audit, PLN-* planner, HUNTER, GIVER | ALL-072 |
| See every spec for a module | `clients/${ACTIVE_CLIENT}/specs/{module}/` | — |
| See the plan queue | `plans/pending/` (current) + `plans/done/` (history); `plans/INDEX.md` auto-regenerated | LR-035 |
| Invoke/resume/stop autonomous chain execution | `/chain` (start), `/chain resume`, `/chain status`, `/chain stop`, `/chain skip`, `/chain reset`; state lives at `.claude/state/chain.json` | `.claude/skills/chain/SKILL.md`; LR-041 |
| Pick Model + Thinking + PermissionMode for a new subplan | `PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md` §Model + Thinking Selection Rubric (D17) | LR-041 |
| Flip `**Status**: PENDING → DONE` on a plan that cites its OWN pending/-location path (or any backward self-reference) | Pre-mv: grep plan body for `plans/pending/<SELF>.md`, rewrite prose hits to `plans/done/<SELF>.md` + `(e.g.)` exemption. Post-mv (if caught late): temporarily revert Status to PENDING (hook skips C-check for PENDING) → fix all citations → restore Status to DONE → `validate-plan-closure --enforce --write-manifest`. See [feedback_closure_gate_verify_paths_first.md](../../../../.claude/projects/C--Users-rutvi-projects-encore-framework/memory/feedback_closure_gate_verify_paths_first.md) §Inward-self-reference sub-pattern + ALL-087 chicken-egg workaround. | LR-055; ALL-083; ALL-087 |
| Find MCP catalog (root→column mappings) | `clients/${ACTIVE_CLIENT}/specs_planning/catalogs/hist-root-map-*.md` | — |
| Author or consume a field-inventory artifact (per-module DOM walk) | `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventory-spec.md` (format) + `_internal/field-inventories/_TEMPLATE.md` (skeleton) + per-module `_internal/field-inventories/<module>-<YYYY-MM-DD>.md` | AAE-D9; ALL-077; LR-014/015/038/040 |
| Author a restructure plan (rebuild / migrate / vendor / split / multi-tenant / deliverable / promote / consolidate) | `.claude/rules/pipeline.md` LR-050 — MUST enumerate stale-slop cleanup IN-SCOPE; never defer to "discover later" subplans. Taxonomy reference: [PLAN_ROOT_CLIENT_DEDUPE.md](../../plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md). | LR-050 |
| Look up identity-switch protocol (mid-session) | [feedback_identity_switch_protocol.md](../../../../.claude/projects/C--Users-rutvi-projects-encore-framework/memory/feedback_identity_switch_protocol.md) — clean re-load, no override | ALL-077; /identity Step 6 |
| Get authenticated test session | `clients/${ACTIVE_CLIENT}/config/environments/.env.e2e` + `authenticatedSession` fixture in `clients/${ACTIVE_CLIENT}/src/infra/fixtures.ts` | — |
| Establish baseline truth for TC authoring (Encore) | `https://navigator2.training.psav.com/#/setup/locationdetail/1604` (old UI) + `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md` + `OSB-ACCESS-VERIFY-2026-04-24.md` as reference artifact. Old site = baseline truth; new site = observed truth; divergence = signal. Observation-only (zero selector parity — old UI uses `name=`/`id=`, not `data-testid`). Baseline-absent (ECT, EnableMultidayPricing, Merchant Currency column) → `/encore-questions` escalation, not HALT. | LR-ENC-001, LR-045, ALL-024, ALL-078, REQ-014, PLN-049 |
| Browser tool guide — CLI vs Chrome selection matrix | `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (V2 — LR-038 v2; MCP_BROWSER_GUIDE.md archived to `docs/read_only_docs/_archive/`) | LR-038 |
| Shared rules for ALL agents | `docs/read_only_docs/AGENT_SHARED_RULES.md` | R01–R22 |
| Client-specific agent rules (Encore) | `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` | — |

---

## §C. Exploration Registry — What's been mapped

When "Status" column says **Complete** or **Partial**, an agent already burned tokens discovering this. USE THE FINDINGS FILE. Do not re-explore.

| Surface | Status | Findings file(s) | First explored | Last updated |
|---|---|---|---|---|
| Local Office Settings → History table schema (42 cols, headers, pagination, booleans) | Complete | `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §2 | 2026-04-13 | 2026-04-15 |
| Location Management History table schema (87 cols, headers, booleans, duplicates) | Complete | `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §1 | 2026-04-13 | 2026-04-13 |
| Local Office Settings → ECT causality (ECT saves create NO history rows) | Complete | `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §3.5 | 2026-04-15 | 2026-04-15 |
| Local Office Settings → Basic Information → root-to-column mapping | Partial (8/15 parents for first session; remainder P9–P15 + other fields) | `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` (pending creation — SP-B-LO-1 continues in new session) | 2026-04-20 | 2026-04-20 |
| Location Management → Currency tab (NOT-TRACKED fields) | Partial (6 of 9 parents silently dropped) | `reports/bugs/BUG-HIS-001.json`, `BUG-HIS-002.json`, `locations_currency_test_cases.md` | 2026-04-01 | 2026-04-17 |
| Local Office Settings → Basic Information → Date offsets (validation, masks, fillAndTab pattern) | Complete | `clients/encore/specs/local-office/local-office-settings.spec.ts`; `local-office-settings.page.ts:215` (`fillAndTab`); `local-office-settings.data.ts` | pre-2026-03 | 2026-04-08 |
| Local Office Settings → ECT → BenefitsMultiplier / LaborCost / HistoricalSubrental | Complete | `local-office-ect.spec.ts`; `local-office-settings.page.ts` (ECT methods); LR-026 notes | pre-2026-03 | 2026-04-09 |
| Location Management → save dialog button variant (Cancel/Ok vs Cancel/Save) | Complete | MCP findings §1 §2; LR-012 | 2026-04-13 | 2026-04-13 |
| Location Settings → Shared Setup Locations tab (30 TCs after SP-C added TC-025..030; PLAN_DQU_V6_PILOT_SHARED_SETUP v5.1 closure 2026-05-20 — 5 fixme'd TCs unlocked via per-TC alt-queries (Chicago/Boston/Dallas/Denver/Atlanta), TC-016 body rewritten + cancel-dialog assertions added, TC-026 + TC-030 remain fixme'd as app-bug evidence vehicles per BUG-LOC-SHR-001 + per-row Delete-after-reload bug) + Nav2 baseline + Phase 2 diff (6 divergences classified — 3 INTENTIONAL-UX-CHANGE [SHR-DIV-003/004/005], 2 PARITY-WITH-INTERACTION-OR-TRIGGER-DIVERGENCE [SHR-DIV-001/002], 1 CONFIRMED REGRESSION filed as BUG-LOC-SHR-001 [SHR-DIV-006]). **Nav2-first walk pattern** (LR-ENC-001): walk baseline FIRST (Section A.Index of walk-evidence), classify divergences against e2e, file BUG-DOC-NNN only when nav2 contradicts REQUIREMENTS.md (vs intentional UX change). | Complete | `clients/encore/specs/locations/location-shared-setup-locations.spec.ts`; `clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-2026-05-12.md` (LR-045 baseline + Path C cross-field section); `clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md` (Sections A.Index + A walked-gaps + A.1 COVERED-SMOKE-PASS); `reports/bugs/BUG-LOC-SHR-001.json` (CONFIRMED-REGRESSION verificationLog 2026-05-19); `plans/done/PLAN_DQU_V6_PILOT_SHARED_SETUP.md` (v5.1 closure); `plans/done/SUBPLAN_DQU_V6_PILOT_SSL_A.md` / `..._B.md` / `..._C.md` / `..._D.md` / `..._E.md` (chunked execution) | 2026-04-07 | 2026-05-20 |
| Local Office Settings → Save Changes AlertDialog (`location-settings-modal-save-changes`) — behavior, selectors, helper | Complete | `clients/encore/src/core/base-page.ts:350` (`clickSaveWithDialog`), `clients/encore/src/pages/local-office/local-office-settings.page.ts:138` (`clickSaveAndConfirm`), `clients/encore/specs/local-office/local-office-settings.spec.ts` (15+ usages), LR-012, ALL-076 | pre-2026-03 | 2026-04-21 |
| Chain orchestration (per-subplan background sessions, Stop-hook /final-q gating, daily/resume caps) | Complete | [PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md](../../plans/pending/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md) (authoritative design); `.claude/hooks/chain-orchestrator.sh`, `.claude/hooks/lib/chain-state.sh`, `.claude/hooks/lib/chain-guards.sh`; `.claude/skills/chain/SKILL.md` | 2026-04-23 | 2026-04-23 |
| Field-inventory artifact format (frozen contract — frontmatter + 7 mandatory sections + optional sections + grep rules for SP-AAE-02 hook) | Complete | [`field-inventory-spec.md`](../../clients/encore/specs_planning/_internal/field-inventory-spec.md) (spec) + [`field-inventories/_TEMPLATE.md`](../../clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md) (skeleton); `PLAN_AGENT_AUTHORING_EFFICIENCY.md` AAE-D9 (access matrix); `agent-mistakes.md` ALL-077 (subplan identity assignment) | 2026-04-23 | 2026-04-23 |
| Encore old-site baseline (navigator2.training.psav.com) — access + Local Office + Location Management History surfaces + Oracle Bundle verdicts | Complete | [`OSB-ACCESS-VERIFY-2026-04-24.md`](../../clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md) (full baseline artifact: §1 access GREEN, §2 selector-parity YELLOW zero testids, §3 tab roam + architectural divergence, §4 Oracle Bundle verdicts per LR-044 for BUG-HIS-001/002/LI-001/LOC-ECT-001, §5 LM History 87-col schema + Glyphicon boolean render); client CLAUDE.md LR-ENC-001; root CLAUDE.md LR-045; agent-mistakes.md ALL-024 amended + ALL-078 added | 2026-04-24 | 2026-04-24 |
| dependency-gate refactor: skip-cascade removed; per-test nav-guard rolled out across 12 specs; `dependencyGate(['TC-...'])` is annotation-only via `dependsOn` | Complete | [`plans/done/PLAN_DEPENDENCY_GATE_REMOVAL.md`](../../plans/done/PLAN_DEPENDENCY_GATE_REMOVAL.md) (4 framework files + 12 specs + 1 dup-helper cleanup; all 281 dep-gate calls preserved as annotations); pre-flight skip inventory: [`preflight-skip-inventory-2026-05-08.md`](../../clients/encore/specs_planning/_internal/preflight-skip-inventory-2026-05-08.md); dep-gate classification: [`dep-gate-inventory-2026-05-08.md`](../../clients/encore/specs_planning/_internal/dep-gate-inventory-2026-05-08.md); .claude/rules/specs.md annotation note | 2026-05-08 | 2026-05-08 |
| Location Settings → Notes sub-tab (Jira 1712 vertical pilot) — full architecture: 13 fields, single-parent FormArray, col 69 of LM History, `MM/DD/YYYY - <text> \| ...` encoding rule + nav2 baseline + 3 APP bugs (delete-persistence, dialog Ok-vs-Save, auto-empty-row) + Radix tablist activation quirk | Complete | [PLAN_PILOT_NOTES_DISCOVERY.md](../../plans/done/PLAN_PILOT_NOTES_DISCOVERY.md) parent; field-inventory [`notes-2026-05-11.md`](../../clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md); HIST catalog [`hist-root-map-location-management-notes.md`](../../clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md); baseline [`notes-2026-05-11.md`](../../clients/encore/specs_planning/_internal/old-site-baseline/notes-2026-05-11.md); bugs `reports/bugs/BUG-LOC-NTS-{001,002,003}.json` | 2026-05-11 | 2026-05-11 |
| Location Settings 10-tab dialog-label inventory + BUG-MGH-001 R1 bisection — all 8 Location Settings sub-tabs use "Ok" confirm button (`/settings/location`); LO Basic Information uses "Save" (`/settings/local-office`); ECT Settings uses NO dialog (direct save). MGH Country populated on all 8 sub-tab saves — empty-Country rows correlate with CI-bot rapid-fire bursts, NOT with WHICH tab/endpoint (revised hypothesis supersedes original endpoint-correlated guess) | Complete | [`walk-evidence-location-settings-2026-05-14.md`](../../clients/encore/specs_planning/_internal/walk-evidence-location-settings-2026-05-14.md); `clients/encore/reports/bugs/BUG-MGH-001.json` (verificationLog appended, rcaDeferred flipped to false, revised hypothesis recorded); `reports/bugs/BUG-LOC-NTS-002.json` (verificationLog appended, deferredChecks resolved) | 2026-05-14 | 2026-05-14 |
| (add new surfaces below when first-explored) | | | | |

**Schema for adding a row** (do this in `/reflect` at end of any session that explored new territory):

```
| {Module / page / tab / feature} | Complete \| Partial ({what fraction}) \| Deferred | {findings file paths, comma-separated} | YYYY-MM-DD | YYYY-MM-DD |
```

---

## §D. Stuck Protocol (2+ failed attempts on the same problem)

1. **STOP re-exploring.** You are burning tokens repeating what the repo already knows.
2. **Re-check §B Routing Table** above — did you miss the right entry?
3. `grep -rn "<testid-or-symptom>" clients/${ACTIVE_CLIENT}/src/pages/ clients/${ACTIVE_CLIENT}/src/selectors/` — 95% of proven patterns live here.
4. `grep "<symptom>" clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` — someone hit this before; the rule ID will tell you what to do.
5. Ask the user ONE specific question — include: what you tried, what failed, what file you consulted. Don't burn more tokens on exploration.

---

## §E. Maintenance (keep this file alive)

**Triggers for updating this file** (agents MUST do this in `/reflect`):
- Created a new findings file, catalog, or discovery artifact → add row to §C Exploration Registry.
- Re-discovered a pattern that HAS a helper but wasn't listed → add row to §B Routing Table.
- Found that a registry entry is stale (app changed, docs moved) → update "Last updated" column + the linked file.
- Caught yourself re-exploring → add an §D Stuck Protocol lesson OR a §B row that would have prevented it.

**Ownership**: every agent. No gatekeeping. Treat like `agent-mistakes.md`: append-only, evidence-first.

**Review cadence**: `/compile-learnings` (weekly) scans this file for routing entries that duplicate `agent-mistakes.md` rules and consolidates.
