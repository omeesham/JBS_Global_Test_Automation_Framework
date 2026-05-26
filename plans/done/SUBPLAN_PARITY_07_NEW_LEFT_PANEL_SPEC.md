# SUBPLAN_PARITY_07 — New `location-left-panel.spec.ts` (24 TCs from scratch) [SUPERSEDED — USER-AUTHORIZED DROP]

**Status**: SUPERSEDED
**Superseded by**: FCC master roadmap line `SUBPLAN_LEFT_PANEL_FCC` (in `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` §Roadmap)
**Superseded date**: 2026-05-26
**Reason**: USER-AUTHORIZED scope reduction. Rutvik 2026-05-26: "do not create it, just keep a note in FCC parent plan that this one doesn't exist." 24 TCs deferred outside the parity restructure family.

### Execution Summary (LR-027)

- Tasks: 24 left-panel TCs (MD authoring + CSV + test plan + selectors + spec)
- Implemented: 0 (USER-AUTHORIZED drop — never executed)
- Routed to: FCC master `SUBPLAN_LEFT_PANEL_FCC` roadmap entry (placeholder; file not yet authored)
- Note: LGL-015 (Country cascade test in legal module) depends on left-panel Country selector. W2-08's MCP discovery will determine if Country selector exists in app UI — if not, LGL-015 also deferred here.
- Traceability artifact: `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`

---

**Parent**: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`
**Phase**: 7 (partial — new spec authoring) of parent (SUPERSEDED)
**PermissionMode**: auto
**BrowserTool**: cli
**BrowserToolJustification**: Live walk every left-panel field for Phase 0.5 walkthrough artifact (LR-013) before spec authoring.
**Skills**: /execute, /regression-guard
**Identity**: GIVER (Phase 0.5 walkthrough) + BUILDER (spec authoring)
**Created**: 2026-05-20

## Change Log (for future audit)

- **2026-05-25 (same-day revert, full drop of SP00 cross-ref)** — Prior 2026-05-25 SP00 cross-thread additions reverted. SP00 was directionally reversed + consolidated in the same session: it generates throwaway demo CSVs (in `/tmp/`) and reverts — no durable gap-summary file exists in framework repo for SP07 to reference. Drift Check "SP00 awareness" subsection (claiming SP00 logged left-panel as gap) is no longer applicable and was removed entirely. SP07 authors `location-left-panel.spec.ts` from scratch as originally planned — independent of any SP00 artifact. Original pre-2026-05-25 SP07 content unchanged. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.

---

## Bootstrap (read first)

1. `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — left_panel row in §B
2. `clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_test_cases.md` — full read (24 TCs)
3. `clients/encore/test_cases_csv/locations_left_panel_test_cases.csv` — confirm 24 TC IDs
4. `clients/encore/src/selectors/locations/left-panel.ts` — selectors already exist! Use them.
5. `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts` — closest existing page object (left panel is part of locations shared shell)
6. `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` — pattern reference for spec structure
7. `.claude/rules/specs.md` — LR-019 (first TC = baseline), LR-022 (no hardcoded counts)
8. `.claude/rules/inventory.md` — LR-013 (Phase 0.5 mandatory before code)

## Drift Check (MANDATORY FIRST STEP — do not skip)

**Evidence discipline binding (per parent §rule 4)**: every claim needs proof. Phase 0.5 walkthrough is MANDATORY before code (LR-013) — every field walked live and snapshotted. Selector + page-object decisions backed by actual DOM observations, not MD-only reading. Every one of the 24 TC implementations requires individual `--grep` PASS evidence in closure. Banned: "I assume", "should be", "probably", "seems to". 2-failure stop → artifact-first RCA. Closure requires an Evidence Audit table.

Authored 2026-05-21. Other plans may have landed since. Before any authoring:

1. **Re-Glob** `clients/encore/specs/locations/location-left-panel.spec.ts` — confirm it STILL doesn't exist (another plan may have authored it already).
2. **Re-Read** `clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_test_cases.md` — confirm 24 TCs still listed (could have been edited).
3. **Re-Glob** `clients/encore/src/selectors/locations/left-panel.ts` — confirm selectors still exist for the new spec to import.
4. **Re-Read** `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts` — confirm it's still the closest reference pattern.
5. **Read activity log** since 2026-05-21 for any work touching left-panel selectors or shared-setup specs.
6. **Emit a Drift Note**. If spec already exists (RESOLVED) → HALT and request closure. If MD TC count has changed → update Scope inline. If >30% of scope is stale → HALT and request re-planning.

---

## Scope (IN)

- Phase 0.5 walkthrough of left-panel UI via playwright-cli; emit `clients/encore/specs_planning/_internal/walk-evidence-left-panel-2026-05-20.md`
- Decide page object location: extend `location-shared-setup-locations.page.ts` OR create new `location-left-panel.page.ts` — pick based on whether left panel has independent URL or shares with shared-setup
- Author new spec `clients/encore/specs/locations/location-left-panel.spec.ts` with `test()` for all 24 MD TCs (TC-LOC-LP-001..024)
- First TC enforces baseline per LR-019
- Register page fixture (if new) in `src/infra/fixtures.ts`
- Add test data file `src/data/testdata/locations/location-left-panel.data.ts` if needed
- Update MD's `**Automation File**:` to `specs/locations/location-left-panel.spec.ts` after authoring
- All 24 TCs must run green individually + together

## Scope (OUT)

- Other module specs (SUBPLANs 04/05/06)
- Local-office structural split (SUBPLAN_PARITY_02)
- CI guardrails (SUBPLAN_PARITY_08)

## Step-by-step

1. **`/regression-guard` snapshot**
2. **Read MD** `locations_left_panel_test_cases.md` end-to-end; understand the 24 TCs, intent, dependencies
3. **Phase 0.5 walkthrough** (LR-013):
   - `playwright-cli open --persistent` against Office 1604
   - Walk every left-panel element; snapshot each
   - Cross-check selectors in `src/selectors/locations/left-panel.ts` (existing) against live DOM
   - Emit `walk-evidence-left-panel-2026-05-20.md` with frontmatter + per-field section
4. **Decide page-object home**: if left panel is purely DOM within shared-setup page → extend `location-shared-setup-locations.page.ts`; else → new `location-left-panel.page.ts`
5. **Page object work**:
   - Add methods matching MD's required actions per TC
   - Reuse selectors from existing `left-panel.ts`
6. **Test data**: create `location-left-panel.data.ts` if MD references constants (defaults, expected counts, etc.)
7. **Spec authoring**:
   - `describe('Location Left Panel @locations @left-panel', () => { ... })`
   - LR-019 baseline TC-001 first
   - 24 `test('TC-LOC-LP-NNN: <title>', async ({ ... }) => { ... })` blocks in MD order
   - Use `dependencyGate(['TC-LOC-LP-...'])` annotation per MD's Depends_On
   - No `test.skip` / `test.fixme` without Jira comment
   - Per LR-022: no hardcoded structural counts in assertions
8. **Fixture register** (if new page object): add to `src/infra/fixtures.ts`
9. **MD update**: set `**Automation File**: specs/locations/location-left-panel.spec.ts`; flip Status to Automated
10. **CSV re-export**: rerun exporter (SUBPLAN_03's D1) to refresh CSV with new MD state
11. **Per-TC run**: `npx playwright test --grep "TC-LOC-LP-"` — confirm all 24 green
12. **Full module run**: `npx playwright test clients/encore/specs/locations/location-left-panel.spec.ts`
13. **CSV sanity check**: `node clients/encore/scripts/ci/check-csv-sanity.mjs clients/encore/test_cases_csv/locations_left_panel_test_cases.csv` — must exit 0 (newly re-exported CSV)
13a. **Comment / MD sanity + exhaustive discovery** (per parent §"In-depth quality" + §"Mission: find all + permanent prevention"): the new spec, new page object (if created), new data file (if created), walk-evidence MD, and the left_panel MD edit — ALL net-new content, so highest authoring risk for leaks.
  - **(A)** Run `node clients/encore/scripts/ci/check-comment-sanity.mjs <files>` — catalog catches
  - **(B)** Manual scan for NOVEL patterns — net-new MD/spec authoring is highest source of AI-tics, agent dialogue, and untracketed TODOs
  - **(C)** Every new pattern → append to `red-flag-patterns.json` with `{discovered_by_subplan: "SP07", discovered_date}`
  - **(D)** Re-run scripts — confirm catches
  - **(E)** Clean inline
  - **(F)** Re-run — must exit 0
  - **Closure**: report `Catalog growth: +N patterns`.
14. **`/regression-guard` diff**: expect new spec file, possibly new page object + data file, 1 MD edit, 1 CSV re-export, 1 walk-evidence artifact, 1 CSV sanity report, 1 comment sanity report

## Verification

- `clients/encore/specs/locations/location-left-panel.spec.ts` exists with 24 `test()` blocks
- `npx playwright test --grep "TC-LOC-LP-"` reports `24 passed`
- Spec contains zero `test.skip` / `test.fixme`
- LR-019 first-TC baseline enforced
- Walk-evidence artifact exists with current date
- MD `**Automation File**:` points at the new spec; Status reflects 24/24

## Reflect + Graduate (mandatory before /final-q)

Per parent §rule 5. Workflow per root-cause mistake found:

1. **Reflection seed for SP07** — likely mistakes to investigate:
   - Why was `location-left-panel.spec.ts` never authored despite MD+CSV existing with 24 TCs? Likely no existing rule that says "every MD+CSV trio MUST have a spec" — that's exactly what D5/D6 CI checks (SP08 territory) will lock in. Cross-link the new LR-NNN to those CI checks so future MD/CSV-without-spec triggers a build failure, not just a memory rule.
   - Why did the MD claim Manual-only without an explicit decision in any prior plan? Process gap: maybe no "every Manual-only TC needs a documented automation decision" convention.
   - Selectors already existed (`src/selectors/locations/left-panel.ts`) but no consuming spec — orphan selectors not flagged. Likely no rule against orphan selectors. Worth a new LR-NNN + a CI check that every exported selector is imported by ≥1 spec.

2. **Pre-graduate check** — Grep agent-mistakes.md / LEARNED_RULES.md / .claude/rules/ / feedback_*.md / clients/encore/CLAUDE.md.

3. **Decision**: this subplan likely surfaces 2 net-new learnings (MD+CSV-without-spec gap; orphan-selector gap). Add each ONCE in canonical location with `Graduated from: SUBPLAN_PARITY_07`. Structural enforcement = D5/D6 CI checks + a new "orphan selector" CI check (escalate to SP08 if needed).

4. **Emit Reflection table** in `/final-q`:

   | Root-cause mistake | Already-existing learning? | Action taken |
   |---|---|---|

5. **Anti-duplicate check** — Grep similarity; >70% → rollback + structural escalation.

Closure-gate rejects if Reflection table missing, near-duplicate added, or mistake mapped to "more reading" actions.

## Closure

- LR-028 activity log
- LR-050 cleanup roster (none expected — net-new spec)
- `/final-q` GREEN
