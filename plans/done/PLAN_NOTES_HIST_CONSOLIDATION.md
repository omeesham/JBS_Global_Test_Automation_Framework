# PLAN: Notes → Location-Management-History consolidation (full separation)

**Status**: DONE
**Executed**: 2026-06-05
**Priority**: P1
**Identity**: OWNER (BUILDER owns the spec move; GIVER owns the markdown/workbook)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli (live smoke via `@playwright/test` runner; no MCP browser)
**Skills**: `/execute`, `/regression-guard`

---

## Context

Carved out of `plans/pending/PLAN_LM_HISTORY_COVERAGE.md` **Phase 5e** on 2026-06-05. The parent is
P0 but GATED (full 87-column body locked behind its parent's pilots); Phase 5e — the Notes col-69
HIST consolidation — was independently executable but **stale and unsafe as authored**:

- It assumed **5** tests; the live file held **6** (`TC-LOC-NTS-038` was added after authoring). Its
  `git rm` of the whole file would have **deleted** TC-038 rather than moving it.
- Its proposed `expect.poll` race-fix snippet ended in `expect(a === x || a === y).toBe(true)` — an
  **LR-051 violation**; the live file was already LR-051-clean.
- Its line refs and `--project=chrome` were wrong (the tests run only under `encore-locations`;
  `chromium` ignores `specs/locations`; `firefox`/`webkit` have empty `testMatch`).

User directive (2026-06-05): **complete separation** — after this, no "notes" artifact references the
hist tests in any corner; hist-notes becomes hist-only. Confirmed decisions: **full separation** of the
markdown case-defs + data constants (consciously overriding the prior line-893 "notes stay in Notes
module" directive recorded in the notes catalog), and a **verbatim move** (no race-fix — its firefox
justification cannot occur in this config).

A pre-execution deep dependency sweep (3 Explore agents + direct reads) confirmed the move was safe and
overturned the authoring plan's premises (TC-038 already had a markdown row; project/browser facts).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline / REQUIREMENTS.md | `(none)` — no behavior change, pure relocation | n/a |
| GIVER | test-cases markdown + workbook | clients/encore/specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md<br>clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md<br>clients/encore/test_cases_xlsx/encore_test_cases.xlsx | `npm run check:tc-parity` exit 0 |
| BUILDER | specs/locations/*.spec.ts + test data | clients/encore/specs/locations/location-management-history.spec.ts<br>clients/encore/specs/locations/location-notes.spec.ts<br>clients/encore/src/data/testdata/locations/location-notes.data.ts | `npx playwright test --project=encore-locations --list` resolves all 6 IDs |
| HEALER | per-fix MD sync | `(none)` — not RCA-driven | n/a |
| WATCHDOG | findings table | `(none)` — not audit-driven | n/a |
| GARDENER | refactor citation | `(none)` — no structural refactor | n/a |

---

## Execution Summary

### TCs moved (6 + IDs)
`TC-LOC-NTS-028`, `029`, `030`, `031`, `032`, `038` — the Notes column-69 Location-Management-History
tests. Moved verbatim (3 helpers `todayMMDDYYYY` / `expectedCol69Forms` / `runCol69Assertion`, the
payload constant, the 3-retry baseline `beforeEach`, and the header doc-comment) from the former
`clients/encore/specs/locations/history/location-hist-notes.spec.ts` into a new
`@notes-hist` describe at the tail of `clients/encore/specs/locations/location-management-history.spec.ts`.

### TCs dropped
None. (The prior authoring plan's 5-vs-6 staleness was corrected — TC-038 was carried, not dropped.)

### Full-separation changes
- **Markdown relocate**: the 6 col-69 case-defs were cut from `locations_notes_test_cases.md` (former
  `## HIST per-column tests (col 69)` section) and pasted into a new "Notes column (col 69) — History"
  section in `locations_management_history_test_cases.md`. The stale line-893 directive note was removed.
- **Data rename**: `NOTE_SEQUENTIAL_HIST_A/B` → `NOTE_SEQUENTIAL_A/B` (values `'HIST seq A/B'` →
  `'Sequential A/B'`) in `location-notes.data.ts`; call-sites updated in the moved TC-038 and in the
  notes-spec `TC-LOC-NTS-059`.
- **Notes-spec scrub**: `location-notes.spec.ts` Group-η header, TC-059 title + comment de-referenced
  the hist tests. Notes-catalog TC-059 title/steps/expected/data + the "Numbering gaps" note scrubbed.
- **Deletion**: `git rm` of the source spec + the now-empty `specs/locations/history/` directory.

### Verification results (evidence-emission)
1. `npx tsc --noEmit --project clients/encore/tsconfig.json` → **exit 0** (move + rename compile).
2. `npm run check:tc-parity` → **PASS, exit 0** (443 spec TCs present in markdown + XLSX).
3. `npm run xlsx:build` → **OK + lint PASS** (0 vocab hits, 0 integrity violations). Sheet deltas:
   `locations_management_history` 19→**25 rows**, `locations_notes` 64→**58 rows** (6 moved).
4. `find clients/encore/specs -name '*hist-*.spec.ts'` → **0** (strict line satisfied);
   `find … -path '*history*' -name '*.spec.ts'` → **2** (local-office-history + location-management-history).
5. `npx playwright test --project=encore-locations --list --grep "TC-LOC-NTS-02[89]|03[012]|038"` →
   all **6** resolve from `location-management-history.spec.ts` (lines 384–452).
6. Grep: **0** `NOTE_SEQUENTIAL_HIST` / `HIST seq` in source; **0** moved-TC-IDs left in the notes catalog.

### Test pass confirmation (2026-06-05)
`npx playwright test --project=encore-locations --grep "TC-LOC-NTS-028:|TC-LOC-NTS-059:" --workers=1 --retries=0`
→ **3 passed** (auth setup + both tests). `TC-LOC-NTS-028` (moved) ok 14.8s from the new file;
`TC-LOC-NTS-059` (renamed constants) ok 20.4s — the rename did not break the notes test.

### Documentation changes
- `PLAN_LM_HISTORY_COVERAGE.md` Phase 5e marked **EXTRACTED** (parent stays GATED; strict acceptance
  line "zero per-source-module HIST spec files" now satisfied here).
- `plans/INDEX.md` regenerated via `npm run plans:reindex` (never hand-edited, LR-035).

### Known out-of-scope follow-up (surfaced, not actioned)
~8 other pending plans (e.g. `SUBPLAN_OPI_E_MIGRATE_SSL_AND_HISTORY.md`, `PLAN_RCA_NOTES_SPEC_2026-05-21.md`)
carry now-stale references to the deleted `location-hist-notes.spec.ts` path. Left intact (editing
unrelated pending plans' acceptance logic is out of this task's scope); flagged for the owner to decide.
Frozen `plans/done/` + internal audit-trail references were deliberately left as historical record.

---

## Acceptance criteria

- [x] All 6 Notes col-69 HIST tests live in `location-management-history.spec.ts`; resolve under `encore-locations`.
- [x] Zero per-source-module HIST spec files (`find … -name '*hist-*.spec.ts'` → 0).
- [x] `specs/locations/history/` directory removed.
- [x] Markdown case-defs relocated to the LM-History catalog; notes catalog carries no hist tests.
- [x] `NOTE_SEQUENTIAL_HIST_*` renamed hist-neutral; zero "HIST" token in any notes file.
- [x] Workbook rebuilt clean; parity exit 0.
- [x] tsc clean; live smoke (moved TC-028 + renamed TC-059) passes.
- [x] Parent Phase 5e marked EXTRACTED; parent stays GATED.
