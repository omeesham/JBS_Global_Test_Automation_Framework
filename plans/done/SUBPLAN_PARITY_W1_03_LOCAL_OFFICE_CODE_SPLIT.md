# SUBPLAN_PARITY_W1_03 — Local-Office Code-Side Split (page objects + selectors + fixtures + spec imports)

**Status**: PENDING
**Priority**: P1
**Created**: 2026-05-26
**Identity**: GARDENER
**Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
**Depends on**: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase A workbook build — 3 native local-office sheets exist; W1-02 superseded; CSV-side LO split obviated by XLSX structure)
**Blocks**: SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md (W1-04 references new split selectors/pages)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: Sonnet-safe deterministic refactor — page-object extraction, selector splits, fixture registration, import rewrites, typecheck. The HIS/ECT live walks (C4 field-inventories, C5 neutral-eye audits) are e2e-dependent and moved to W2-07.

---

## Context

W1-03 owns the CODE side of the local-office split. The original SP02 also touched CSVs (C3), which the auditor flagged as overlap with SP03/W1-02. This restructure resolves: W1-02 owns CSV split + re-export; W1-03 only does code-side work — page objects, selectors, fixtures, spec imports, typecheck.

The e2e-dependent half (C4 HIS/ECT field-inventory walks, C5 neutral-eye audits) is moved to W2-07.

Provenance: restructured from `SUBPLAN_PARITY_02_LOCAL_OFFICE_SPLIT.md` per Wave 1/Wave 2 split (2026-05-26).

---

## Bootstrap

**Identity**: GARDENER (structural refactor; framework code; no business logic changes)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5)
- `/final-q` (Phase 4)

**Context files**:
- `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §C local-office split (C1, C2, C6, C7, C8, C9)
- `clients/encore/CLAUDE.md` (LR-017 selector namespaces, LR-012 shared save dialog, LR-036 boolean render formats)
- `clients/encore/src/pages/local-office/local-office-settings.page.ts` — full read; identify HIS + ECT methods
- `clients/encore/src/selectors/local-office/local-office-settings.ts` — full read; identify HIS + ECT selectors
- `clients/encore/specs/local-office/local-office-{history,ect}.spec.ts` — current imports
- `clients/encore/specs_planning/catalogs/` — catalog files (hist-root-map-local-office naming drift)

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm W1-02 closed GREEN; split CSVs exist (`ls clients/encore/test_cases_csv/local_office_*.csv` returns 3 files: basic_info, history, ect).
2. Read navigation.md, agent-mistakes.md per `/execute` Phase 0.
3. **BrowserTool announcement**: `BrowserTool=none`. Reason: pure structural refactor; HIS/ECT live walks are W2-07.

---

## Phase 1+ — Actual work

### Phase 1 — Drift Check (MANDATORY)

1. Re-Glob `clients/encore/src/pages/local-office/`, `src/selectors/local-office/`, `specs_planning/catalogs/` — confirm "1 file where 3 expected" still holds for pages + selectors.
2. Re-Grep for any imports from `local-office-history.spec.ts` / `local-office-ect.spec.ts` to settings page/selectors — confirm merged state.
3. Cross-check parent's P1–P6 table.
4. Read activity log since 2026-05-26.
5. Emit Drift Note. >30% stale → HALT.

### Phase 2 — C1: Page-object split

1. Read full `local-office-settings.page.ts`. Identify methods grouped by tab/responsibility:
   - **BAS methods** (Basic Info tab) — stay in `local-office-settings.page.ts` (or rename to `local-office-basic-info.page.ts` for parity)
   - **HIS methods** (History tab) — extract to new `local-office-history.page.ts`
   - **ECT methods** (ECT Settings tab) — extract to new `local-office-ect.page.ts`
2. Each new page class extends the same base as Settings (likely `LocalOfficeSharedPage` or `BasePage`).
3. Preserve all method signatures so spec imports break cleanly (caught by tsc).

### Phase 3 — C2: Selector split (per LR-017)

1. Read full `src/selectors/local-office/local-office-settings.ts`. Identify selector groups per tab.
2. Extract HIS selectors → `src/selectors/local-office/local-office-history.ts`.
3. Extract ECT selectors → `src/selectors/local-office/local-office-ect.ts`.
4. Update `src/selectors/index.ts` to export the new selector groups.
5. Verify no cross-page selector contamination (LR-017: different pages = different namespaces).

### Phase 4 — C6: Catalog naming drift fix

`git mv clients/encore/specs_planning/catalogs/hist-root-map-local-office.md hist-root-map-local-office-history.md`. Then grep repo for any reference to the old filename; rewrite references in MDs / plans / docs.

### Phase 5 — C7: Fixture registration

Update `clients/encore/src/infra/fixtures.ts`:
- Register `localOfficeHistoryPage` fixture (instantiates `LocalOfficeHistoryPage`)
- Register `localOfficeEctPage` fixture (instantiates `LocalOfficeEctPage`)
- Both alongside existing `localOfficeSettingsPage`

### Phase 6 — C8: Spec import rewrites

Update `local-office-history.spec.ts` + `local-office-ect.spec.ts`:
- Replace imports from `local-office-settings.page.ts` with imports from the new split files
- Replace selector imports likewise
- Use the new fixtures (`localOfficeHistoryPage` instead of `localOfficeSettingsPage`)

### Phase 7 — Typecheck

`npx tsc --noEmit` — must exit 0 before continuing.

### Phase 8 — C9: Anti-pattern sweep (list-only, no fixes)

Enumerate `src/pages/locations/` + `src/selectors/locations/`:
- For each directory, list files
- Identify any 1-file-where-2+-modules-expected pattern (LR-017 violation candidates)
- Emit list at `clients/encore/specs_planning/_internal/c9-anti-pattern-candidates-<YYYY-MM-DD>.md`

NOT a fix — just a list. Fixes are out-of-scope for this subplan.

### Phase 9 — Run LO specs (smoke test only)

`npx playwright test --list clients/encore/specs/local-office/` — should report 3 specs loaded with all TCs. This is `--list`, not a run, since BrowserTool=none.

**Note**: actual `npx playwright test` run is W2-08/W2-09 (e2e wave).

---

## Per-Identity Satisfaction Matrix (LR-048 v2)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) | n/a |
| GIVER | test-cases.md, test-plans.md, CSV | (none) — W1-02 owns CSV side | n/a |
| BUILDER | specs/<module>/*.spec.ts | spec import rewrites only — no test logic changes | `npx playwright test --list clients/encore/specs/local-office/` resolves all TCs |
| HEALER | per-fix MD update | (none) | n/a |
| WATCHDOG | findings table | C9 anti-pattern candidates list | grep new artifact exists |
| GARDENER | refactor — page-object + selector + fixture split | 2 new page-object files + 2 new selector files + fixtures.ts updated + 1 catalog renamed | `npx tsc --noEmit` clean |

All non-(none) cells classified (a) MCP-proven per LR-040.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed (e.g., dead exports surfaced by typecheck): DO-NOW / SPAWN / APPEND.

---

## Acceptance criteria

- [ ] `src/pages/local-office/` has 3 files (settings/basic-info, history, ect)
- [ ] `src/selectors/local-office/` has 3 files (settings/basic-info, history, ect)
- [ ] `src/infra/fixtures.ts` exports `localOfficeHistoryPage` + `localOfficeEctPage`
- [ ] `hist-root-map-local-office-history.md` exists; zero stale references to the old `hist-root-map-local-office.md`
- [ ] `npx tsc --noEmit` passes
- [ ] `npx playwright test --list clients/encore/specs/local-office/` resolves all 3 specs + all TCs
- [ ] C9 anti-pattern candidates list emitted at `_internal/c9-anti-pattern-candidates-<date>.md`
- [ ] `/regression-guard` snapshot diff matches: 2 new pages, 2 new selectors, 1 fixtures edit, 2 spec import rewrites, 1 catalog rename
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes
- [ ] `/final-q` verdict block emitted

---

## Verification

```bash
# 3 page-object files
ls clients/encore/src/pages/local-office/*.page.ts | wc -l  # expect: 3

# 3 selector files
ls clients/encore/src/selectors/local-office/*.ts | wc -l  # expect: 3

# Fixtures has both new entries
grep -c "localOfficeHistoryPage\|localOfficeEctPage" clients/encore/src/infra/fixtures.ts  # expect: >= 2

# Catalog rename done
ls clients/encore/specs_planning/catalogs/hist-root-map-local-office-history.md  # expect: file exists
[ ! -f clients/encore/specs_planning/catalogs/hist-root-map-local-office.md ] && echo OK  # expect: OK

# Typecheck clean
npx tsc --noEmit && echo OK  # expect: OK

# Anti-pattern list emitted
ls clients/encore/specs_planning/_internal/c9-anti-pattern-candidates-*.md  # expect: 1 file
```

---

## Handoff (post-execution)

Local-office code split complete. 3 page-objects, 3 selectors, 3 specs all aligned. W1-04 can now safely edit local-office specs without ambiguity about which page-object/selector to import.
