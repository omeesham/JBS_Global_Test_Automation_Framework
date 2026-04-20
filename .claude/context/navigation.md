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
| Drive an Angular input (type, fill, validate) | `clients/${ACTIVE_CLIENT}/src/pages/setup/{module}/{page}.page.ts` → `fillAndTab` / `clearAndTab` / `fillWithValidation` | GEN-008; ALL-073 |
| Toggle a Radix UI checkbox | same page object → `setRadixCheckbox(key, bool)` / `checkCheckbox` / `uncheckCheckbox` | — |
| Click Save + confirm the "Save Changes" dialog | same page object → `clickSaveAndConfirm(key, dlg, confirm)` / `clickSaveWithDialog` | LR-012 |
| Wait for Save enabled / disabled (Angular dirty race) | same page object → `waitForSaveEnabled` / `waitForSaveDisabled` | LR-026 |
| Dismiss "Unsaved changes" alertdialog | same page object → `dismissAlertDialogIfVisible()` | LR-026 |
| Sort a Radix table column (large-option retry) | `clients/${ACTIVE_CLIENT}/src/pages/setup/locations/location-management-history.page.ts` → `clickSortColumn` | LR-025 |
| Wait for page/data ready in Angular SPA | any page object → `waitForAngularStable()` (NEVER `networkidle`) | LR-023 |
| Find a testid / selector | `clients/${ACTIVE_CLIENT}/src/selectors/setup/{module}/{page}.ts`; naming `{module}-{section}-{kind}-{field}` | LR-017 |
| Know a field's baseline / invalid / default value | `clients/${ACTIVE_CLIENT}/tests/test-data/setup/{module}/{page}.data.ts` | — |
| Understand history schema (LO 42-col, LM 87-col) | `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §1 §2 | — |
| Understand history boolean encoding per table | LR-036 (Unicode vs SVG `lucide-check`); MCP findings §2 | LR-036 |
| Understand async cross-field validation | LR-010; page object `expectInvalid` / `expectValid` polling helpers | LR-010 |
| Understand date-offset validation constraints | LR-008; NM-1264 (Delivery ≥ Prep) | LR-008 |
| Understand Angular form dirty state persistence across saves | LR-026; defensive handling patterns in page objects | LR-026 |
| File a bug | LR-034 protocol → `reports/bugs/BUG-{MODULE}-{NNN}.json` (dedup first) | LR-034 |
| Understand module boundary (LOS ≠ LS) | `clients/${ACTIVE_CLIENT}/docs/MODULE_REGISTRY.md`; `REQUIREMENTS.md` | LR-017, MOD-001 |
| Look up a framework rule `LR-NNN` | root `CLAUDE.md` "Learned Rules" section | — |
| Look up a client rule `LR-ENC-NNN` | `clients/${ACTIVE_CLIENT}/CLAUDE.md` | — |
| Look up an agent-mistake by type | `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` — ALL-* shared, GEN-* generator, HLR-* healer, AUD-* audit, PLN-* planner, HUNTER, GIVER | ALL-072 |
| See every spec for a module | `clients/${ACTIVE_CLIENT}/tests/specs/setup/{module}/` | — |
| See the plan queue | `plans/pending/` (current) + `plans/done/` (history); `plans/INDEX.md` auto-regenerated | LR-035 |
| Find MCP catalog (root→column mappings) | `clients/${ACTIVE_CLIENT}/specs_planning/catalogs/hist-root-map-*.md` | — |
| Get authenticated test session | `config/environments/.env.development` + `authenticatedSession` fixture in `clients/${ACTIVE_CLIENT}/tests/setup/fixtures.ts` | — |
| MCP browser tool guide (when to use which) | `docs/read_only_docs/MCP_BROWSER_GUIDE.md` | — |
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
| Local Office Settings → Basic Information → Date offsets (validation, masks, fillAndTab pattern) | Complete | `clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts`; `local-office-settings.page.ts:215` (`fillAndTab`); `local-office-settings.data.ts` | pre-2026-03 | 2026-04-08 |
| Local Office Settings → ECT → BenefitsMultiplier / LaborCost / HistoricalSubrental | Complete | `local-office-ect.spec.ts`; `local-office-settings.page.ts` (ECT methods); LR-026 notes | pre-2026-03 | 2026-04-09 |
| Location Management → save dialog button variant (Cancel/Ok vs Cancel/Save) | Complete | MCP findings §1 §2; LR-012 | 2026-04-13 | 2026-04-13 |
| Location Management → Shared Setup Locations spec (24/24 passing) | Complete | `location-shared-setup-locations.spec.ts`; `project_ssl_fix_handoff.md` | 2026-04-07 | 2026-04-07 |
| Local Office Settings → Save Changes AlertDialog (`location-settings-modal-save-changes`) — behavior, selectors, helper | Complete | `clients/encore/src/common/base-page.ts:350` (`clickSaveWithDialog`), `clients/encore/src/pages/setup/local-office/local-office-settings.page.ts:138` (`clickSaveAndConfirm`), `clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts` (15+ usages), LR-012, ALL-076 | pre-2026-03 | 2026-04-21 |
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
