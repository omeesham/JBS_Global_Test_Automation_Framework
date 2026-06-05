# Plan — clients/encore restructure: kill `setup/` + `tests/` wrappers + move test-data + infra to src/ + delete seed spec → ship to encore_deliverables_test:notes-latest

**Date**: 2026-05-19
**Author**: OWNER (Claude Opus 4.7)
**PermissionMode**: acceptEdits
**BrowserTool**: none
**Skills used**: /planning + /review + /audit (Phase 1 review-mode audit complete)
**Canonical home (post-approval)**: `plans/pending/PLAN_DELIVERABLE_RESTRUCTURE_2026_05_19.md`
**Phase 1 audit**: complete, 8 findings folded back in (see § Audit Findings Folded). Phase 2 external audit deferred per user (post-A8, fresh session).

---

## Context

Encore deliverable for demo on `github.com/RutviK-JBS/encore_deliverables_test:notes-latest`. Six directives:

1. **Move test-data out of `tests/` into `src/`** → `clients/encore/src/data/testdata/`.
2. **Move test-infra out of `tests/` into `src/`** → `clients/encore/src/infra/`.
3. **Drop the `tests/` wrapper entirely** → specs live at `clients/encore/specs/` directly.
4. **Kill the `setup/` folder wrapper everywhere** in `src/pages/`, `src/selectors/`, the new `src/data/testdata/`.
5. **Delete seed spec** (`tests/specs/smoke/seed.spec.ts`, 17 lines) — defense fails on 4 angles.
6. **Ship-ready deliverable** — full spec run + Allure + Playwright HTML reports MUST work on a fresh clone via a one-line command.

Goal: ship for demo ASAP. Hold FCC pilot + history coverage + BUG-LOC-NTS-002 for Phase B.

Inherits all cleanup from the 6-commit PLAN_UNIFIED_MATSUMOTO closeout. Will NOT re-touch.

---

## Audit Findings Folded (Phase 1)

Phase 1 `/audit review` against current codebase + recently-done plans surfaced 8 items, all addressed below:

| # | Finding | Action |
|---|---|---|
| F1 | `README.md:28` smoke command (`npx playwright test tests/specs/smoke/seed.spec.ts`) will break post-delete | A5 replaces with `npm run test:grep -- "TC-LOC-CUR-001"` (fast single-test SSO verification) |
| F2 | One-line clone+run command missing from plan & deliverable | A5 inserts into README + A8 emits to chat |
| F3 | Plan A2 had spec→infra up-count direction inverted (was "1 more up", actually "1 less up") | A2 corrected below |
| F4 | Infra-internal imports were "TBD" — actually 28 across 6 files | A2 enumerates per-file |
| F5 | 14 `tests/test-data/*.data.ts` have stale `Consumed by: tests/specs/setup/...` JSDoc | A4 mass-rewrite |
| F6 | Allure + HTML report generation not explicitly verified in A7 | A7 adds report-existence gates |
| F7 | `src/utils/diagnostics-collector.ts:4` JSDoc references `tests/infra/fixtures.ts` | A4 single-line fix |
| F8 | `README.md:134` says "do not edit `tests/**`" — tests/ won't exist | A5 line update |

Cleared as no-action: `scripts/test-cli.js`, `scripts/share-for-debugging.js`, `agent-reporter.ts`, `walks/` (gitignored), `docs/REQUIREMENTS.md`+`MODULE_REGISTRY.md`+`AGENT_RULES_ENCORE.md` (gitignored), `package.json` scripts, Allure+HTML reporter config, `global-setup.ts` __dirname resolution (depth-identical happy accident).

---

## Interpretation locked + MNT-006 override

"Setup anywhere" = **folder-path segment**. Playwright conventions stay:
- `setup` project NAME (`playwright.config.ts:92`) — KEEP
- `auth.setup.ts`, `global-setup.ts`, `global-teardown.ts` filenames — KEEP
- TypeScript export names like `SetupLeftPanelSelectors` — KEEP

**MNT-006 advisory override**: specs at `clients/encore/specs/` (top-level). Satisfies spirit (not in src/), violates letter (no tests/). User directed; documented for Phase B graduation.

---

## Final structure (post-restructure deliverable tree)

```text
clients/encore/
├── src/
│   ├── core/                              (unchanged)
│   ├── data/testdata/                     ← NEW (was tests/test-data/)
│   │   ├── common.data.ts
│   │   ├── downloads/.gitkeep
│   │   ├── local-office/  (3 .data.ts)    ← flattened
│   │   └── locations/     (9 .data.ts)    ← flattened
│   ├── infra/                             ← NEW (was tests/infra/, 7 files)
│   │   ├── auth-storage.ts
│   │   ├── auth.setup.ts
│   │   ├── custom-matchers.ts
│   │   ├── dependency-gate.ts
│   │   ├── fixtures.ts
│   │   ├── global-setup.ts
│   │   └── global-teardown.ts
│   ├── pages/{auth, local-office, locations}/
│   ├── selectors/{auth, local-office, locations}/ + index.ts + SELECTOR_CATALOG.md (gitignored)
│   ├── types/                             (unchanged)
│   └── utils/                             (unchanged — agent-reporter.ts + others)
├── specs/                                 ← NEW location (NO tests/ wrapper)
│   ├── local-office/  (3 specs)
│   └── locations/                         (9 specs + history/ nested with 1 spec)
├── config/                                (unchanged)
├── package.json
├── playwright.config.ts                   (5 lines updated)
├── tsconfig.json                          (1 line updated)
├── .gitignore                             (audited)
└── README.md                              (smoke replacement + one-line cmd + tests/** wording)
```

**Zero `tests/`, zero `setup/`, zero `smoke/`, zero `seed.spec.ts` after Phase A.**

---

## Seed spec verdict — DELETE (defense fails)

(Same 4 angles as before — dead code, no CI dependency, no spec import, redundant with auth.setup.ts's three SSO verifications.) Action: `git rm tests/specs/smoke/seed.spec.ts` + drop 12 stale `// seed:` comments + delete README:28-29 verify block.

---

## Phase A — ship-now scope

### A1. File moves (`git mv`, 57 files)

| Move | Count | From | To |
|---|---|---|---|
| Test data | 14 | `tests/test-data/{common.data.ts, downloads/.gitkeep, setup/local-office/*, setup/locations/*}` | `src/data/testdata/{common.data.ts, downloads/.gitkeep, local-office/*, locations/*}` |
| Infra | 7 | `tests/infra/{auth-storage, auth.setup, custom-matchers, dependency-gate, fixtures, global-setup, global-teardown}.ts` | `src/infra/*` |
| Specs (local-office) | 3 | `tests/specs/setup/local-office/*.spec.ts` | `specs/local-office/*` |
| Specs (locations) | 9 | `tests/specs/setup/locations/*.spec.ts` | `specs/locations/*` |
| Specs (history) | 1 | `tests/specs/setup/locations/history/location-hist-notes.spec.ts` | `specs/locations/history/location-hist-notes.spec.ts` _(later consolidated 2026-06-05 → location-management-history.spec.ts; file removed — PLAN_NOTES_HIST_CONSOLIDATION)_ |
| Pages (local-office) | 1 | `src/pages/setup/local-office/*` | `src/pages/local-office/*` |
| Pages (locations) | 10 | `src/pages/setup/locations/*` | `src/pages/locations/*` |
| Selectors (local-office) | 1 | `src/selectors/setup/local-office/*` | `src/selectors/local-office/*` |
| Selectors (locations) | 11 | `src/selectors/setup/locations/*` | `src/selectors/locations/*` |

### A2. Import rewrites (corrected via audit — paths SIMPLIFY)

| Class | Files | Pattern OLD → NEW |
|---|---|---|
| Spec → test-data | 13 specs × ~2 imports | normal: `../../../test-data/setup/<m>/<f>.data` (3 ups) → `../../src/data/testdata/<m>/<f>.data` (**2 ups** — 1 less); history: `../../../../test-data/...` (4) → `../../../src/data/testdata/...` (3) |
| Spec → infra | 13 specs × 1 import | normal: `../../../infra/fixtures` (3) → `../../src/infra/fixtures` (**2 ups** — 1 less); history: `../../../../infra/...` (4) → `../../../src/infra/...` (3) |
| Spec → page (direct, not via barrel) | 13 specs × ~1 import | `../../../../src/pages/setup/<m>/<f>.page` (4) → `../../src/pages/<m>/<f>.page` (**2 ups** — 2 less + setup-wrapper drop) |
| **Infra-internal — `fixtures.ts`** | 18 imports | `../../src/pages/setup/<m>/<f>` → `../pages/<m>/<f>` (11 × setup-drop + depth-shorten); `../../src/utils/<u>` → `../utils/<u>` (5×); `../../src/types` → `../types` (1×); `./custom-matchers`, `./auth-storage`, `./dependency-gate` UNCHANGED |
| **Infra-internal — `auth.setup.ts`** | 5 | `../../src/pages/auth/login.page` → `../pages/auth/login.page`; `../../src/utils/{common-methods, credential-loader, retry-telemetry}` → `../utils/*` (3×); `./auth-storage` UNCHANGED |
| **Infra-internal — `global-setup.ts`** | 2 | `../../src/utils/{logger, credential-loader}` → `../utils/*`. ⓘ `__dirname` config path stays correct (depth-identical accident). |
| **Infra-internal — `global-teardown.ts`** | 1 | `../../src/utils/logger` → `../utils/logger` |
| **Infra-internal — `auth-storage.ts`** | 1 | `../../src/utils/retry-telemetry` → `../utils/retry-telemetry` |
| **Infra-internal — `custom-matchers.ts`** | 1 | `../../src/core/app-constants` → `../core/app-constants` |
| **Infra-internal — `dependency-gate.ts`** | 0 | (only `@playwright/test`) |
| Page → selector | 11 pages × ~1-2 imports | `../../selectors/setup/<m>/<f>` → `../../selectors/<m>/<f>` (segment swap, ups unchanged — both pages and selectors stay at same depth) |
| Barrel `src/selectors/index.ts` | 1 file × 26 paths | `./setup/<m>/<f>` → `./<m>/<f>` (13 imports + 13 re-exports) |
| Anything else importing `tests/...` (utils, agent-reporter, scripts) | grep-verified zero | — |

**Total import edits: ~130 lines across ~32 files.** `tsc --noEmit` gates everything.

### A3. Config edits

`clients/encore/playwright.config.ts` (5 lines):
- L22: `testMatch: ['tests/**/*.spec.ts']` → `['specs/**/*.spec.ts']`
- L154: `testDir: './tests/specs/setup/local-office'` → `'./specs/local-office'`
- L161: `testDir: './tests/specs/setup/locations'` → `'./specs/locations'`
- L171: `globalSetup: require.resolve('./tests/infra/global-setup')` → `require.resolve('./src/infra/global-setup')`
- L172: `globalTeardown: require.resolve('./tests/infra/global-teardown')` → `require.resolve('./src/infra/global-teardown')`

Setup project's testMatch regex `/auth\.setup\.ts/` over `testDir=__dirname` finds the file under `src/infra/`. No change to that project.

`clients/encore/tsconfig.json` (1 line):
- L45: `"tests/**/*.ts"` → `"specs/**/*.ts"` (src/**/*.ts already covers the moved infra + data)

`clients/encore/.gitignore`: audited, no stale patterns.

### A4. Deletes + comment / docstring cleanup + empty folders

- `git rm clients/encore/tests/specs/smoke/seed.spec.ts`
- Remove 12 stale `// seed: tests/specs/smoke/seed.spec.ts` lines from spec files (grep confirmed locations)
- **F5 fix**: Update 14 `tests/test-data/**/*.data.ts` JSDoc `Consumed by: tests/specs/setup/<m>/<f>.spec.ts` → `Consumed by: specs/<m>/<f>.spec.ts` (mass sed-style replace)
- **F7 fix**: `src/utils/diagnostics-collector.ts:4` — `tests/infra/fixtures.ts` → `src/infra/fixtures.ts`
- `location-hist-notes.spec.ts:32-35` JSDoc — `tests/infra/fixtures.ts` → `src/infra/fixtures.ts` (3 comment lines)
- After moves, these auto-purge from git:
  - `tests/specs/smoke/`, `tests/specs/setup/{local-office, locations/history, locations, ""}/`
  - `tests/test-data/{setup/{local-office, locations}, setup, downloads, ""}/`
  - `tests/infra/`
  - `tests/` itself (fully empty)
  - `src/pages/setup/{local-office, locations, ""}/`
  - `src/selectors/setup/{local-office, locations, ""}/`

### A5. README rewrite (specific lines, not generic grep)

`clients/encore/README.md`:

**Line 28-29 (F1 fix)** — replace seed-spec verify block:

```diff
-Verify the setup with the auth smoke test (~30 seconds):
-
-```bash
-npx playwright test tests/specs/smoke/seed.spec.ts --project=chromium
-```
+Verify the setup with a single short spec (~60 seconds, exercises auth + a real module):
+
+```bash
+npm run test:grep -- "TC-LOC-CUR-001" --project=encore-locations
+```
```

**Line ~134 (F8 fix)** — `src/**` or `tests/**` → `src/**` or `specs/**`.

**NEW section near top — "Running on a fresh clone"** (F2 fix):

```bash
git clone -b notes-latest https://github.com/RutviK-JBS/encore_deliverables_test.git && cd encore_deliverables_test && npm install && npx playwright install chromium && npm run test:cli
```

Then describe report viewing: `npm run report` (HTML) or `npm run allure:open` (Allure).

Also grep README for `tests/specs/`, `tests/test-data/`, `tests/infra/` — rewrite any stragglers.

Update `clients/encore/CLAUDE.md` + root `CLAUDE.md` likewise (paths only — content unchanged).

### A6. Plan-file path patches (prevents Phase B breakage)

Mass-find-replace in `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` + `plans/pending/SUBPLAN_NOTES_FCC_PILOT.md`:
- `tests/specs/setup/<m>/` → `specs/<m>/`
- `tests/test-data/setup/<m>/` → `src/data/testdata/<m>/`
- `tests/infra/` → `src/infra/`
- `src/pages/setup/<m>/` → `src/pages/<m>/`
- `src/selectors/setup/<m>/` → `src/selectors/<m>/`

### A7. Verification gate (must pass before A8)

Sequence (`npm run clean` between runs per LR-024):

1. `npx tsc --noEmit -p clients/encore/tsconfig.json` — **zero errors required**
2. `npm run clean`
3. `npx playwright test --project=setup` — auth.setup.ts writes `.auth/encore-state.json` (verify file exists post-run)
4. `npx playwright test --project=encore-local-office` — 3 specs pass
5. `npm run clean`
6. `npx playwright test --project=encore-locations` — 10 specs (incl. history) pass
7. `npm run clean`
8. `npx playwright test --project=encore-local-office --project=encore-locations` — combined CI-shape run, all green
9. **Report-generation gates (F6 fix)** — verify after step 8:
   - `clients/encore/reports/html-report/index.html` exists and opens
   - `clients/encore/reports/allure-results/` non-empty (≥1 result file)
   - `clients/encore/reports/failure-summary.json` exists (even if zero failures — agent-reporter writes empty list)
   - `clients/encore/reports/junit-results.xml` exists
   - `clients/encore/reports/test-results.json` exists
10. `npm run allure:generate` — confirm `reports/allure-report/index.html` exists post-generate

If ANY fails, RCA per LR-018 + LR-024 (artifact-first); do NOT proceed to A8.

### A8. Ship + smoke-check on fresh clone

Per LR-049 — ship via `git archive`:

```
npm run client:ship -- --client=encore --out=../tmp/encore-ship-2026-05-19/
```

Output dir smoke-checks:
- `find . -type d -name tests` → empty
- `find . -type d -name setup` → empty
- `find . -name "seed*"` → empty
- `specs/` exists with `local-office/` + `locations/` only
- `src/infra/` exists with 7 files
- `src/data/testdata/` has `common.data.ts` + `downloads/` + `local-office/` + `locations/`
- `README.md` contains the one-line clone command (grep for `git clone -b notes-latest`)

Then push to `encore_deliverables_test:notes-latest` per `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md`.

**Fresh-clone smoke (post-push, before declaring done)**:
1. In a clean temp dir: `git clone -b notes-latest https://github.com/RutviK-JBS/encore_deliverables_test.git && cd encore_deliverables_test`
2. `npm install && npx playwright install chromium` (≤2 min)
3. `npm run test:grep -- "TC-LOC-CUR-001" --project=encore-locations` (≤90 s — proves auth + module-spec flow works)
4. `npm run report` opens HTML report; `npm run allure:report` opens Allure (with one entry).
5. Tear down temp dir.

If step 3 fails, the ship is incomplete — debug + re-push before declaring done.

### A9. Emit one-line command to user (deliverable artifact)

After A8 succeeds, post to chat:

```
Ship complete. One-line for end users:
git clone -b notes-latest https://github.com/RutviK-JBS/encore_deliverables_test.git && cd encore_deliverables_test && npm install && npx playwright install chromium && npm run test:cli

View reports after run: `npm run report` (HTML) or `npm run allure:open` (Allure).
```

---

## Phase B — held until after demo push

- `SUBPLAN_NOTES_FCC_PILOT.md` execution (FCC paradigm rollout, 32 field-case tests)
- `PLAN_BIG_PIVOT_FCC_MASTER.md` continuation
- `BUG-LOC-NTS-002` dialog helper (if surfaces)
- `clients/encore/specs_planning/_internal/` artifact path corrections (gitignored)
- `.claude/agents/*.md` path patches (non-shipping)
- TypeScript export-name cleanup (`SetupNotesSelectors` → `NotesSelectors`) — only if user wants
- MNT-006 graduation: if cross-client convention adopts "specs at root, no tests/", lift to LR rule
- **Phase 2 audit** (deferred per user): fresh-session `/audit` external pass on the executed result + `/find-bugs` adversarial run

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Import rewrite misses a file → compile error | `tsc --noEmit` gate in A7.1 |
| Infra-internal imports tangled (paths shorten by 1) | F4 enumerates exact counts per file; tsc catches misses |
| Spec passes individually but fails in run-all | A7.4-A7.8 covers both modes; LR-018 + LR-024 RCA |
| Setup-project auth.setup.ts discovery breaks after move | Regex testMatch over `testDir=__dirname` finds file under `src/infra/`; A7.3 explicitly tests this |
| Report-generation regression (Allure/HTML) silent | A7.9-A7.10 explicit gates on `reports/*` files |
| Fresh-clone command fails on a clean machine | A8 final step physically does this in a temp dir before declaring done |
| `git mv` history loss on Windows | Proven on this repo (Matsumoto Commit 2 = 89-file rename, history intact) |
| `.claude/` agent prompts leak into deliverable | `.claude/` at repo root, not under `clients/encore/` → `git archive HEAD clients/encore/` excludes it |
| FCC pilot resumes Phase B with broken paths | A6 patches both pending plans |
| MNT-006 advisory violated (specs not under tests/) | Documented + Phase B graduation candidate |
| TypeScript strict mode (`noUncheckedIndexedAccess`) surfaces NEW errors unrelated to path moves | If any surface in A7.1, file as bugfix follow-up; do NOT mix into restructure scope (preserve clean diff) |
| Encore_deliverables_test repo has divergent history from notes-latest | A8 ship docs (`SHIP_TO_ENCORE.md`) handles branch reset / force-push protocol — follow as-written |

---

## Out-of-scope (explicit)

- TypeScript export-name renames — keep, "Setup" = Encore product nav area
- Field-inventory artifact path corrections (gitignored)
- Agent-mistakes / LEARNED_RULES path text (cross-cutting, separate pass)
- `package.json` scripts (none reference these paths — audited clean)
- `.github/workflows/*.yml` (references `--project=` names, not paths)
- The 6-commit Matsumoto closeout slop (already cleared)
- Phase 2 audit (deferred per user; fresh-session external pass post-A8)

---

## LR compliance

- **LR-018** (spec-fix workflow): A7 runs individual + combined, clean between.
- **LR-019** (first-test baseline): unchanged — HARD RULE in `playwright.config.ts:27-32` preserved.
- **LR-024** (clean before RCA): `npm run clean` between every A7 step.
- **LR-027** (exec summary mandatory before done/): emitted at plan close (post-A9).
- **LR-049** (ship-via-git-archive only): A8 uses `npm run client:ship` exclusively.
- **LR-050** (restructure plans enumerate stale-slop in-scope): A4 + A5 + A6 enumerate all empty folders, all comment refs, all docstring fixes, all plan-file patches. Phase B explicitly listed.
- **LR-020** (verify plan claims): all counts verified by 3 Explore agents + direct reads of `playwright.config.ts`, `package.json`, `README.md`, `tsconfig.json`, `src/selectors/index.ts`, `seed.spec.ts`, 7 infra files, 2 sample spec files, `agent-reporter.ts`, 2 script files, sample data file.
- **MNT-006** (specs in tests/, not src/): OVERRIDDEN with user authorization; documented.
- **AUD-017** (no self-grading from same session): Phase 1 audit produced finding-set in same session BUT against a different file class (codebase audit vs. plan-self-audit); Phase 2 external pass deferred to fresh session per user.
- **AUD-014** (audit with the agent's checklist): /audit review mode used canonical Step 1-5 chain.

---

## Verification artifact (D23)

Post-A8, anyone can rerun this exact one-liner to verify the ship works:

```bash
# In a clean directory:
git clone -b notes-latest https://github.com/RutviK-JBS/encore_deliverables_test.git && \
  cd encore_deliverables_test && \
  npm install && \
  npx playwright install chromium && \
  npm run test:grep -- "TC-LOC-CUR-001" --project=encore-locations && \
  ls reports/html-report/index.html reports/allure-results/ && \
  echo "VERIFIED"
```

If `VERIFIED` prints, restructure + ship is correct.
