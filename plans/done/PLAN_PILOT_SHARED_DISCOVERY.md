# PLAN_PILOT_SHARED_DISCOVERY — Vertical Pilot — Shared Location Setup (Jira 1713) — Discovery + Audit

**Status**: SUPERSEDED
**Superseded-By**: PLAN_DQU_V6.md → PLAN_DQU_V6_PILOT_SHARED_SETUP.md (2026-05-12). HIST save-level probe (Phase 1a) transfers to PLAN_LM_HISTORY_COVERAGE.md.
**Priority**: P0-EMERGENCY
**Created**: 2026-05-11
**Identity**: WATCHDOG → HEALER
**Parent**: PLAN_VERTICAL_RESTRUCTURE_PENDING.md
**Supersedes**: SUBPLAN_HIST_PIVOT_15_B_LM_7_SHARED_SETUP_CATALOG.md, SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md
**Depends on**: PLAN_PILOT_NOTES_TESTS.md (cross-bundle review gate)
**Blocks**: PLAN_PILOT_SHARED_TESTS.md
**Model**: claude-opus-4-7
**Thinking**: max
**Justification**: Largest RT gap among 9 modules (6% → >50% target) + save-level NOT-TRACKED bifurcation probe + multi-rule HEALER judgment — max thinking warranted per LR-041
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: both
**BrowserToolJustification**: CLI primary for catalog + field-inventory walk (LR-038 v2 catalog-walkthrough row, grep-over-disk); Chrome for Phase 0.5b nav2 auth-heavy baseline (LR-038 v2 auth-heavy row); exactly one mid-subplan switch
**Resumable**: true
**Skills**: /identity, /find-bugs, /bugfix, /regression-guard, /final-q

---

## Context

Shared Location Setup vertical-pilot DISCOVERY plan — Opus / max session producing the HIST 87-col catalog AND the DQU baseline + field-inventory AND the HEALER bug/CSV pass for Location → Shared Setup Locations (Jira 1713). This is the **largest RT-gap audit (6% → >50% target)** of the 9 module DQU audits per SP-DQU-17 provenance.

**Supersession axis**: merges SP-B-LM-7 (HIST catalog with save-level NOT-TRACKED probe) + SP-DQU-17 (DQU 2-phase audit) into one plan. Same hot-context win as Notes Discovery, with the **critical bifurcation preserved from SP-B-LM-7**: probe save-level tracking FIRST — does a save on Shared Setup produce ANY history row?

**Different axis from prior 2026-04-22 audit-rec**: SP-B-LM-7's audit-rec also suggested sibling-pair merger with SP-B-LM-6 Notes catalog. This pilot supersedes on a **different axis** — per-submodule vertical bundle (catalog + audit + HEALER for Shared alone), not Notes+Shared catalog pairing.

**Departure from master**: per PLAN_VERTICAL_RESTRUCTURE_PENDING Phase 2.2, Shared Setup is at order #7. This pilot ships it as #2 (after Notes) at P0-EMERGENCY priority by user direction (2026-05-11).

**Prerequisites — verified live 2026-05-11** (same set as PLAN_PILOT_NOTES_DISCOVERY):
- SP-A1 — DONE.
- SP-AAE-01..05 — DONE (all 5).
- SP-DQU-03, SP-DQU-04, SP-DQU-05 — DONE.
- All inherited deps from SP-DQU-17 satisfied. SP-B-LM-R relaxed.

**SSL-SAVE-BUG-A risk** preserved from SP-B-LM-7 §Audit-recommendation: Shared Setup save may produce zero history rows under snapshot model. If confirmed by Phase 1a probe → file as bug + branch Plan 4 (TESTS) to write hard NOT-TRACKED assertions instead of standard per-column template.

---

## Bootstrap

**Identity**: WATCHDOG (Phases 0.5b, 1a, 1b) → HEALER (Phase 2). `/identity` switch executed between Phase 1b and Phase 2.

**Skills auto-called**:
- `/identity` (Step 1.5 gate + mid-subplan switch)
- `/find-bugs` (Phase 1 WATCHDOG)
- `/bugfix` + `/regression-guard` (Phase 2 HEALER)
- `/final-q` (mandatory exit)

**Context files**:
- Parent: `plans/pending/PLAN_VERTICAL_RESTRUCTURE_PENDING.md`
- Superseded inputs (preserved for reference):
  - `plans/done/SUBPLAN_HIST_PIVOT_15_B_LM_7_SHARED_SETUP_CATALOG.md`
  - `plans/done/SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md`
- Field-inventory spec: `clients/encore/specs_planning/_internal/field-inventory-spec.md`
- Field-inventory template: `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md`
- Existing reference inventory: `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md`
- Target test-cases (Phase 2 only): `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md`
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-044, LR-046, LR-048, LR-050)
- `.claude/rules/browser-tool.md` (LR-038 v2)
- `.claude/rules/baseline.md` (LR-045)
- `clients/encore/CLAUDE.md` (LR-ENC-001, LR-026)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `PLAN_PILOT_NOTES_TESTS.md` Status: DONE (cross-bundle review gate) + spot-check Context §Prerequisites prereqs same as Notes Discovery.
2. Run `npm run validate:fieldinventory-staleness`:
   - No artifact yet for Shared Setup → fall through to Phase 1b emit-new path per LR-013 (b). NOT a HALT.
   - Artifact ≤14d fresh → spot-check OK.
   - Artifact >30d stale → HALT.
3. Browser-tool announcement: `Browser tool: both. Reason: Chrome for Phase 0.5b nav2 auth-heavy baseline; CLI for catalog + save-level probe + field-inventory walk thereafter; exactly one mid-subplan switch.`
4. Read `.claude/context/navigation.md` Exploration Registry — pull prior Shared Setup findings.
5. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter WATCHDOG entries + SSL-SAVE-BUG-A reference.
6. LR scan.

---

## Phase 0.5b — Baseline-first walk (REQUIRED — WATCHDOG per LR-048)

1. **Chrome Claude**: `navigate` to `https://navigator2.training.psav.com/#/setup/locationdetail/1604`. Locate the equivalent Shared Setup Locations sub-tab.
2. Walk every interactive field, location-list filter, selection cascade. Capture `name=` / `id=` attrs, defaults, validation, dependencies.
3. Emit baseline artifact: `clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-locations-<TODAY>.md` per LR-045.
4. Frontmatter `baselineScope:` value: `full | baseline-partial | baseline-absent`. Shared Setup may be net-new on nav4 → `baseline-absent` is OK (per LR-ENC-001), do NOT HALT.
5. Phase 1b's field-inventory frontmatter sets `Baseline_Artifact: old-site-baseline/shared-setup-locations-<TODAY>.md`.
6. **HALT gate**: regression-from-baseline count > 5 → STOP per LR-040.

**Browser-switch boundary** — emit `[BROWSER-SWITCH] from=chrome to=cli reason=catalog-walk-post-auth tokens_so_far=<N> artifact=clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-locations-<TODAY>.md`.

**Context-budget gate**: if ≥300k → checkpoint to `~/.claude/state/pilot-resume-shared-discovery.json` + halt + resume from disk.

---

## Phase 1a — HIST 87-col catalog with save-level probe (CLI, WATCHDOG; replaces SP-B-LM-7 content)

**CRITICAL — save-level probe FIRST** (preserved from SP-B-LM-7 §Method):

1. Authenticate to new site via `.auth/nav4-state.json` (CLI).
2. Navigate to `/navigator/locations/1604/settings/location` and click the **Shared Setup Locations** tab.
3. Capture 87-col history baseline (top N rows).
4. **Probe**: edit ONE shared-setup parent (Action / ID / Name), save, immediately check if a new history row appeared.
   - **If zero rows appear** → flag `SSL-SAVE-BUG-A` bug-candidate, file `reports/bugs/BUG-SSL-SAVE-A.json` per LR-034. Set catalog frontmatter `saveLevelTracking: NOT-TRACKED`. **Skip per-parent edits** (no point); proceed to Phase 1b on whatever fields exist. Plan 4 (TESTS) will write hard NOT-TRACKED assertions.
   - **If rows appear** → set catalog frontmatter `saveLevelTracking: TRACKED`. Proceed to standard per-parent walk below.
5. **Standard per-parent walk** (only when `saveLevelTracking: TRACKED`):
   - For each of ~3 parents (Action, ID, Name — confirm live count):
     - Edit value.
     - Save.
     - Check FIRST: did a new history row appear? (per-parent confirmation).
     - If yes: diff → find target column(s).
6. Restore office 1604 to its pre-test Shared Setup state.
7. Emit catalog: `clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md` with sections:
   - **Save-level tracking** (TRACKED or NOT-TRACKED with row-zero evidence).
   - **Tab → Column mapping** (per parent if tracked; else "n/a").
   - **Parent classification** (~3 parents).
   - **LR-040 closure**: every parent classified (a)/(b)/(c).
   - **Encoding note**: Unicode ✔ (preserved from SP-B-LM-7).

**Acceptance for Phase 1a**: save-level tracking answered + (if tracked) per-parent mapping confirmed + office restored + LR-040 classification.

**Context-budget gate** at exit.

---

## Phase 1b — WATCHDOG field-inventory artifact (CLI, same session; replaces SP-DQU-17 Phase 1)

**Output**: `clients/encore/specs_planning/_internal/field-inventories/shared-setup-locations-<TODAY>.md`

1. Continue on same new-site Shared Setup tab.
2. Walk live DOM via Playwright CLI (grep-over-disk). Capture every interactive field, location-list filter, selection cascade.
3. Emit artifact per `field-inventory-spec.md`. **8 mandatory frontmatter keys**:
   1. `Module: shared-setup-locations`
   2. `Client: encore`
   3. `MCP_Session_Date: <today's ISO date>`
   4. `MCP_Session_Tool: Playwright MCP` (legacy enum)
   5. `MCP_Tool_Reason: <one-line>`
   6. `Author_Identity: WATCHDOG`
   7. `Page_URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` (Shared Setup tab)
   8. `Test_Entity: Office 1604`
4. **7 mandatory sections**: URL(s) visited, Field Inventory, Labels + Section Names, Live-state caveat, Known App Bugs, Save-cycle observations, Staleness signal.
5. **Priority focus fields** (preserved from SP-DQU-17):
   - Location-list filtering UX + selection behavior.
   - Save round-trip on any mutable shared-setup state (RT-gap-discovery objective: 6% → >50%).
   - Cross-location cascade (does a change here propagate to other offices?).
   - Identify candidate fields for adding round-trip TCs to close the >50% RT target.
6. **LR-014/015 compliance**: data-testid + live defaults.
7. Reference `Baseline_Artifact: old-site-baseline/shared-setup-locations-<TODAY>.md`.
8. Pre-commit hook validates on `git add`.
9. **HALT gates**: >5 new APP bugs → ask user. Drift → log.

**Context-budget gate** at exit.

---

## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV (file-only; replaces SP-DQU-17 Phase 2)

1. **Identity switch**: `/identity HEALER`.
2. Diff Phase 1b artifact vs `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md`.
3. Apply fixes with `**MCP_VERIFICATION_LOG**: shared-setup-locations-<date>.md §<section> "<field>" — <evidence>` citations.
4. File `reports/bugs/BUG-SS-NNN.json` per LR-034. (`BUG-SSL-SAVE-A.json` may already be filed from Phase 1a probe.)
5. **Baseline-diff section** in `shared-setup-locations-<TODAY>.md`: classify divergences.
6. Re-export CSV:
   ```bash
   npx ts-node export_test_cases/to-csv.ts \
     clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md \
     clients/encore/exports/locations_shared_setup_locations_test_cases.csv
   ```
   Verify Tags column.
7. `/regression-guard` fingerprint.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Same disposition rules as Notes Discovery (DO-NOW / SPAWN / APPEND; bare "out of scope" → HALT).

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Phase 0.5b baseline artifact emitted with `baselineScope:`.
- [ ] Phase 1a save-level probe answered (`saveLevelTracking: TRACKED | NOT-TRACKED` in catalog frontmatter).
- [ ] Phase 1a catalog file exists with ~3-parent classification (a)/(b)/(c).
- [ ] If NOT-TRACKED: `BUG-SSL-SAVE-A.json` filed under `reports/bugs/`.
- [ ] Phase 1b field-inventory artifact emitted with 8 frontmatter keys + 7 sections + 4 priority focus fields covered.
- [ ] Phase 2 diff applied with `MCP_VERIFICATION_LOG` citations on every fix.
- [ ] Bug JSONs filed for true defects per LR-034 (BUG-SS-NNN + any from probe).
- [ ] CSV re-exported with Tags column verified.
- [ ] `/regression-guard` snapshot = no silent breakage.
- [ ] Activity-log row appended per LR-028.
- [ ] `/final-q` v2 verdict block emitted.

**LR-046 strict-line acknowledgments** (preserved from SP-DQU-17):
- "Every TC cites MCP_VERIFICATION_LOG" — strict.
- "Heuristic runs clean" — strict.
- ">5 new APP bugs" — strict HALT.

---

## Verification

```bash
TODAY=$(date +%Y-%m-%d)

# Baseline + catalog + field-inventory all exist
test -f "clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-locations-${TODAY}.md"
test -f clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md
test -f "clients/encore/specs_planning/_internal/field-inventories/shared-setup-locations-${TODAY}.md"

# Save-level probe answered
grep -E '^saveLevelTracking: (TRACKED|NOT-TRACKED)$' clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md

# CSV with Tags
head -1 clients/encore/exports/locations_shared_setup_locations_test_cases.csv | grep -c 'Tags'
# expect: 1
```

---

## Why no `## Artifacts produced` section (intentional)

Same as PLAN_PILOT_NOTES_DISCOVERY — `check-subplan-identity.mjs` captures WATCHDOG only; mid-subplan `/identity HEALER` shifts at runtime.

---

## Hook-compatibility note (catalog under WATCHDOG)

Same as PLAN_PILOT_NOTES_DISCOVERY — if catalog-file Write under WATCHDOG identity is blocked at runtime, agent applies LR-043 §A one-shot override-handshake. Recurring blocks → file as separate subplan.

---

## Handoff

Chat-only per `feedback_handoff_in_chat_only.md`. Summary:
- Baseline artifact path + `baselineScope:`.
- Catalog path + save-level tracking outcome + parent count.
- Field-inventory path + field count + priority-focus coverage + RT-gap estimate.
- Diff outcome + BUG-SS-NNN count + BUG-SSL-SAVE-A status.
- CSV re-export confirmation.
- `/regression-guard` verdict.

No obstacle claims (LR-039). Next: `PLAN_PILOT_SHARED_TESTS.md` (BUILDER writes spec; branches on save-level finding).

Activity-log row format:
```
| YYYY-MM-DDThh:mm | watchdog | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md, clients/encore/specs_planning/_internal/field-inventories/shared-setup-locations-<DATE>.md, clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-locations-<DATE>.md, clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md, clients/encore/exports/locations_shared_setup_locations_test_cases.csv, reports/bugs/BUG-SSL-SAVE-A.json | PLAN_PILOT_SHARED_DISCOVERY — Shared Setup vertical pilot: HIST catalog (save-level probed) + DQU baseline + field-inventory + HEALER fix/CSV. |
```
