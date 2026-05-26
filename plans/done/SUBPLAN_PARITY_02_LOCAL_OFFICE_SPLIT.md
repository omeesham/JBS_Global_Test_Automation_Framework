# SUBPLAN_PARITY_02 — Local-Office Structural Split (BAS / HIS / ECT) [SUPERSEDED]

**Status**: SUPERSEDED
**Superseded by**: `SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` (CSV split — C3) + `SUBPLAN_PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT.md` (code-side C1/C2/C6/C7/C8/C9) + `SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md` (e2e C4/C5)
**Superseded date**: 2026-05-26
**Reason**: Restructured into Wave 1/Wave 2. CSV split (C3) ownership clarified per auditor — W1-02 owns CSV; W1-03 only consumes. Live walks (C4/C5) moved to Wave 2.

### Execution Summary (LR-027)

- Tasks: C1-C9 (page-object split, selector split, CSV split, HIS/ECT walks + audits, catalog rename, fixtures, spec imports, anti-pattern sweep)
- Implemented: 0 (none executed; restructured before run)
- Routed to W1-02: C3 (CSV split) — owns end-to-end
- Routed to W1-03: C1 (page-object split), C2 (selector split), C6 (catalog rename), C7 (fixtures), C8 (spec imports), C9 (anti-pattern sweep list)
- Routed to W2-07: C4 (HIS+ECT field-inventory live walks), C5 (HIS+ECT neutral-eye audits)
- Traceability artifact: `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`

---

**Parent**: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`
**Phase**: 3 of parent (SUPERSEDED)
**PermissionMode**: auto
**BrowserTool**: cli
**BrowserToolJustification**: Walk HIS + ECT tabs live for the missing field-inventories (C4) and neutral-eye audits (C5).
**Skills**: /execute, /regression-guard
**Identity**: GARDENER (structural restructure; framework code)
**Created**: 2026-05-20

## Change Log (for future audit)

- **2026-05-25 (same-day revert, factual note preserved)** — Prior 2026-05-25 SP00 stub-routing additions reverted. SP00 was directionally reversed + consolidated in the same session: no `.fixme` stubs are added to specs at any time; SP00 generates throwaway demo CSVs and reverts. Drift Check "SP00 awareness" subsection (per-prefix LOS routing for stubs) is no longer applicable and was removed. **Preserved as standalone factual update**: the "Specs are ALREADY split" scope clarification (lines covering settings/history/ect split) remains — that's independent factual truth about the LOS specs structure, useful to SP02 regardless of SP00's design. Original pre-2026-05-25 SP02 content unchanged. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.

---

## Bootstrap (read first)

1. `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — section "C. Local-office split"
2. `clients/encore/CLAUDE.md` — LR-017 (separate selector namespaces), LR-012 (shared save dialog), LR-036 (boolean render formats per table)
3. `clients/encore/src/pages/local-office/local-office-settings.page.ts` — full read; identify HIS + ECT methods to extract
4. `clients/encore/src/selectors/local-office/local-office-settings.ts` — full read; identify HIS + ECT selectors to extract
5. `clients/encore/specs/local-office/local-office-{history,ect}.spec.ts` — understand current imports to migrate
6. `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md` — schema reference for HIS + ECT inventories
7. `clients/encore/specs_planning/_internal/field-inventory-spec.md` — schema canon
8. `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md` — pattern for HIS + ECT audits

## Drift Check (MANDATORY FIRST STEP — do not skip)

**Evidence discipline binding (per parent §rule 4)**: every claim in this session needs proof — fresh Read/Grep/playwright-cli output captured this session, cited with file:line or artifact path. Banned phrases: "I assume", "should be", "probably", "seems to", etc. Re-Read every file before Edit; spot-Read after Edit. After 2 failed attempts at same problem → STOP, switch to artifact-first RCA. Closure requires an Evidence Audit table.

Authored 2026-05-21. Other plans may have landed since. Before any edit:

1. **Re-Glob** `clients/encore/src/pages/local-office/`, `clients/encore/src/selectors/local-office/`, `clients/encore/test_cases_csv/`, `clients/encore/specs_planning/_internal/field-inventories/`, `clients/encore/specs_planning/_internal/neutral-eye-audits/`, `clients/encore/specs_planning/catalogs/` — confirm the "1 file where 3 expected" state from parent §P1–P6 still holds. If any directory already has 3 files, that part of scope is RESOLVED.
2. **Re-Grep** for stale references to `local-office-settings` selectors/pages from `local-office-{history,ect}.spec.ts` — confirm imports still merged.
3. **Cross-check parent's P1–P6 table** + read activity log for any `local-office` work since 2026-05-21.
4. **Emit a Drift Note** per P1–P6: VERIFIED / ALREADY-FIXED / DRIFTED-FURTHER / NEW.
5. If >30% of scope is stale → HALT and request re-planning. Otherwise proceed with updated scope.

---

## Scope (IN)

**Scope clarification (factual update preserved from 2026-05-25 revert)**: SP02 owns CSV split + page-object split + selector split + inventory/audit/catalog work. **Specs are ALREADY split** (`local-office-settings.spec.ts`, `local-office-history.spec.ts`, `local-office-ect.spec.ts` all exist). SP02 does NOT split specs.

- C1: split page object — `local-office-history.page.ts` + `local-office-ect.page.ts` created; HIS/ECT methods moved out of settings
- C2: split selectors — `local-office-history.ts` + `local-office-ect.ts` created; HIS/ECT selectors moved out
- C3: split CSV — emit 3 separate CSVs once D1 (exporter fix) lands; for this subplan, manually carve the existing merged CSV into 3 if exporter isn't ready
- C4: walk HIS + ECT live; emit `local-office-history-2026-05-20.md` + `local-office-ect-2026-05-20.md` in `specs_planning/_internal/field-inventories/`
- C5: neutral-eye audit pass on HIS + ECT specs; emit twin files in `specs_planning/_internal/neutral-eye-audits/`
- C6: rename `hist-root-map-local-office.md` → `hist-root-map-local-office-history.md`; update all references
- C7: register `localOfficeHistoryPage` + `localOfficeEctPage` in `src/infra/fixtures.ts`
- C8: update HIS + ECT spec imports to use new split page objects + selectors
- C9: enumerate same-anti-pattern candidates under `src/pages/locations/` + `src/selectors/locations/` — produce a list (not fixes — list only)
- LR-050: enumerate stale-slop cleanup IN-SCOPE (catch every reference to old merged paths and rewrite/remove in this subplan)
- `/regression-guard` snapshot before + after; structural fingerprint diff must show: 2 new pages, 2 new selectors, 3 new CSVs, 0 broken imports, 0 dead exports

## Scope (OUT)

- No spec body edits beyond import rewrites (Phase 7 territory)
- No new TC implementations (SUBPLAN_PARITY_07 left_panel; SUBPLAN_PARITY_06 LOS trio)
- No exporter changes (SUBPLAN_PARITY_03 owns D1)
- No same-anti-pattern fixes in `locations/` (C9 is a list, not a fix)

## Step-by-step

1. **`/regression-guard` snapshot** before any edit
2. **C1**: extract HIS methods from `local-office-settings.page.ts` → new `local-office-history.page.ts`. Class name `LocalOfficeHistoryPage`. Extends `LocalOfficeSharedPage` (or whatever base BAS uses).
3. **C1 cont.**: same for ECT → new `local-office-ect.page.ts`, class `LocalOfficeEctPage`.
4. **C2**: extract HIS selectors → `local-office-history.ts`; same for ECT → `local-office-ect.ts`. Update `src/selectors/index.ts` to export both.
5. **C7**: register both new pages in `src/infra/fixtures.ts` alongside `localOfficeSettingsPage`.
6. **C8**: update `local-office-history.spec.ts` + `local-office-ect.spec.ts` import statements to pull from new page + selector files.
7. **Typecheck**: `npx tsc --noEmit` — must pass before continuing.
8. **C3**: if D1 exporter is ready, run it; else carve `local_office_settings_test_cases.csv` into 3 CSVs by TC ID prefix (BAS / HIS / ECT). Output to `test_cases_csv/`.
9. **C4**: playwright-cli walk HIS tab (Office 1604 → Local Office → History), emit field-inventory MD with frontmatter per spec.
10. **C4 cont.**: same for ECT tab; emit twin file.
11. **C5**: neutral-eye audit walk on `local-office-history.spec.ts` and `local-office-ect.spec.ts`; emit twin audit MDs.
12. **C6**: `git mv hist-root-map-local-office.md hist-root-map-local-office-history.md`; grep repo for any file referencing the old name; rewrite references.
13. **C9**: enumerate `src/pages/locations/` + `src/selectors/locations/` files; identify any 1-file-where-2+-modules-expected; emit list as artifact under `specs_planning/_internal/c9-anti-pattern-candidates-2026-05-20.md`.
14. **Run specs**: `npx playwright test clients/encore/specs/local-office/` — all 3 LOS specs must still pass after the structural move.
15. **CSV sanity check** (if SP03's `check-csv-sanity.mjs` exists): `node clients/encore/scripts/ci/check-csv-sanity.mjs clients/encore/test_cases_csv/local_office_*.csv` — must exit 0 on the 3 split CSVs. If SP03 hasn't landed yet, manual check: grep the 3 new CSVs for agent strings (HUNTER/BUILDER/etc), plan refs (`PLAN_`/`SUBPLAN_`/`SP-`), framework paths (`.claude/`), smart quotes, BOM, leftover markdown — fix in MD + re-emit.
15a. **Comment / MD sanity check + exhaustive discovery** (per parent §"In-depth quality" + §"Mission: find all + permanent prevention"): for every file touched (3 new page objects, 3 new selectors, fixtures.ts, both LOS spec import-rewrites, 2 new field-inventory MDs, 2 new neutral-eye-audit MDs, renamed catalog MD):
  - **(A)** Run `node clients/encore/scripts/ci/check-comment-sanity.mjs <files>` — note what catalog catches
  - **(B)** Manual scan beyond catalog — look for NOVEL patterns (agent prompt fragments, console.log/debug leftovers, base64 strings, internal feature-flag names, screenshot paths, stale session IDs, commented-out code blocks, unreached `if (false)` blocks)
  - **(C)** Every NEW pattern found → append to `clients/encore/scripts/ci/red-flag-patterns.json` with provenance `{discovered_by_subplan: "SP02", discovered_date}`
  - **(D)** Re-run scripts (now updated) — confirm they catch the new patterns
  - **(E)** Clean the artifacts
  - **(F)** Re-run scripts — must exit 0
  - **Closure**: report `Catalog growth: +N patterns` in subplan close.
16. **`/regression-guard` diff**: confirm fingerprint matches expected.

## Verification

- `clients/encore/src/pages/local-office/` has 3 files (settings, history, ect)
- `clients/encore/src/selectors/local-office/` has 3 files (settings, history, ect)
- `clients/encore/test_cases_csv/` has 3 LOS CSVs (settings, history, ect)
- `clients/encore/specs_planning/_internal/field-inventories/` has `local-office-{history,ect}-2026-05-20.md`
- `clients/encore/specs_planning/_internal/neutral-eye-audits/` has `local-office-{history,ect}-2026-05-20.md`
- `clients/encore/specs_planning/catalogs/hist-root-map-local-office.md` renamed; zero stale references
- `src/infra/fixtures.ts` exports `localOfficeHistoryPage` + `localOfficeEctPage`
- `npx tsc --noEmit` passes
- `npx playwright test clients/encore/specs/local-office/` passes (all 3 specs green)
- `/regression-guard` post-snapshot diff matches expectation

## Reflect + Graduate (mandatory before /final-q)

Per parent §rule 5. Workflow per root-cause mistake found:

1. **Reflection seed for SP02** — likely mistakes to investigate:
   - Why was LOS crammed into one page object + one selectors file despite LR-017 ("Different pages MUST have separate selector namespaces and directories")? Did LR-017 fire on the original authoring session? If yes, why was it overridden? If no, why didn't its trigger match? LR-017 may need sharper trigger + a pre-commit check that flags any `local-office-settings.page.ts` file that contains HIS/ECT method names.
   - Why did the catalog name drift (`hist-root-map-local-office.md` instead of `-history`)? No existing convention rule? Or convention exists but wasn't auto-checked?

2. **Pre-graduate check** — Grep agent-mistakes.md / LEARNED_RULES.md / .claude/rules/ / feedback_*.md / clients/encore/CLAUDE.md for each mistake.

3. **Decision**: existing learning → structural escalation (almost certainly LR-017 needs a CI hook); no existing → add ONE with `Graduated from: SUBPLAN_PARITY_02`.

4. **Emit Reflection table** in `/final-q`:

   | Root-cause mistake | Already-existing learning? | Action taken |
   |---|---|---|

5. **Anti-duplicate check** — Grep similarity; >70% → rollback + structural escalation.

Closure-gate rejects if Reflection table missing, near-duplicate added, or mistake mapped to "more reading" actions.

## Closure

- LR-028 activity log entry
- LR-050 cleanup roster appended to subplan as "stale-slop cleanup completed" list
- `/final-q` GREEN required before moving to `plans/done/`
