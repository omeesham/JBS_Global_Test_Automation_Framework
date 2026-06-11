# SUBPLAN_PARITY_W1_05 — CI Local Validators (file-only, no CI wiring)

> **REBASE NOTE (2026-06-11 · PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT):** this subplan plans to fold validators into `scripts/sp00-audit-v5.mjs`. That workbook is now **TestRail step-expanded** — a case spans 1 first-row + N continuation step-rows (blank TC ID). `sp00-audit-v5.mjs` was updated to count distinct `/^TC-/` IDs (not raw rows) and read the merged columns (`Automation Status`, `Notes / Reason`, `Steps (Step)`/`Steps (Expected Result)`). Any new validator must key cases on `/^TC-/` and re-derive the reason segment via the `Blocked — ` marker (see `splitNotesReason` in `scripts/xlsx-lint-rules.mjs`).

**Status**: PENDING
**Priority**: P1
**Created**: 2026-05-26

> **XLSX-migration disposition (Phase C, 2026-05-27): REWRITE.** The `check-csv-sanity.mjs` validator referenced in this subplan body becomes `check-xlsx-sanity.mjs` (or is folded into the existing `scripts/sp00-audit-v5.mjs` which post-Phase-B reads the XLSX workbook). MD↔XLSX parity remains the contract; the CSV-parity wrapper retires when `clients/encore/test_cases_csv/` is deleted in Phase D of `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md`. See [triage ledger](../../clients/encore/specs_planning/_internal/plan-triage-ledger-2026-05-27.md).

**Identity**: GARDENER
**Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
**Depends on**: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase D — full XLSX cutover complete, CSVs deleted)
**Blocks**: SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md (consumes the validators)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: Sonnet-safe deterministic script authoring. CI wiring + cron + PR enforcement (D11/D15/D16/D17) are moved to W2-09 per auditor R2-P2-3 finding.

---

## Context

W1-05 authors the LOCAL validator scripts only — file-level invariant checks that any developer can run from their machine. CI wiring (pre-commit + GH Actions + cron + PR enforcement) is moved to W2-09 where the full-suite verification also lives. This separates "authoring" from "wiring" cleanly:

- **W1-05 (this subplan)**: author D3, D4, D5, D6, D7, D8, D9, D10, D12, D13, D14 scripts. Unit-test each against known-good and known-bad fixtures. Scripts MUST NOT invoke `npx playwright test` or playwright-cli or touch any e2e surface.
- **W2-09 (Wave 2)**: wire scripts into `.husky/pre-commit` + GH Actions + cron + PR template + repo-wide drift-back sweep. W2-09 also runs full-suite `npx playwright test` for Phase 9 verification.

**Absorbed micro-phases from defunct W1-02** (per PLAN_CSV_TO_XLSX supersession):
- **check-xlsx-sanity.mjs** (was `check-csv-sanity.mjs`) — sanity gate target flips CSV → XLSX. Authored fresh here, not consumed from W1-02.
- **check-comment-sanity.mjs** — authored fresh here, not consumed from W1-02 (W1-02 is closed-as-superseded).
- **red-flag-patterns.json** catalog — authored fresh here as input to the sanity scripts.

(LR-050 stale-path grep sweep originally scoped to W1-02 was absorbed into PLAN_CSV_TO_XLSX Phase 0 A1 — not in W1-05's scope.)

Provenance: restructured from `SUBPLAN_PARITY_08_CI_GUARDRAILS_AND_VERIFICATION.md` (D3-D10/D12-D14 only) per Wave 1/Wave 2 split (2026-05-26) + supersession-absorption of W1-02 sanity-script authoring (2026-05-26).

---

## Bootstrap

**Identity**: GARDENER (CI tooling + framework hygiene)

**Skills auto-called**:
- `/identity`, `/regression-guard` (wrap), `/relevant`, `/final-q`

**Context files**:
- `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §D3-D11 (this subplan owns D3-D10, D12-D14)
- `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` — Phase D completion is prereq; XLSX workbook is sanity-check input
- `plans/done/SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` — closed-as-superseded; lists original task routing for sanity-script absorption
- `clients/encore/scripts/ci/` — directory may not yet exist; W1-05 authors fresh scripts here (red-flag-patterns.json + check-xlsx-sanity.mjs + check-comment-sanity.mjs + 8 others)

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase D closed GREEN (CSVs deleted, workbook is canonical, `npm run check:tc-parity` exits 0 with XLSX reader).
2. Confirm `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` exists and `npm run xlsx:build` is wired.
3. Read navigation.md, agent-mistakes.md per `/execute` Phase 0.
4. **BrowserTool announcement**: `BrowserTool=none`. Reason: pure script authoring + unit testing against fixture files.

---

## Phase 1+ — Actual work

### Phase 1 — Drift Check (MANDATORY)

1. Re-Glob `clients/encore/scripts/ci/` — list current scripts; deduplicate against this subplan's scope.
2. Re-Read parent §D3-D11 — confirm scope still matches what each script does.
3. Read activity log since 2026-05-26.
4. Emit Drift Note. >30% stale → HALT.

### Phase 2 — D3: MD header count validator

Author `clients/encore/scripts/ci/check-md-header-count.mjs`:
- Reads each MD at `clients/encore/specs_planning/test-cases/setup/**/*.md`
- Extracts `Test Cases: N` from frontmatter or first 30 lines
- Counts `## TC-` body sections
- Exit 1 if mismatch

Unit-test fixtures:
- `clients/encore/scripts/ci/fixtures/header-count-good.md` (matching count)
- `clients/encore/scripts/ci/fixtures/header-count-bad.md` (mismatching count)

### Phase 3 — D4: MD `Automation File:` resolver

Author `check-md-automation-path.mjs`:
- Parses every `**Automation File**:` line
- `fs.existsSync` each path (relative to repo root)
- Exit 1 on missing

### Phase 4 — D5 + D6: MD↔spec bijection

Author `check-md-spec-bijection.mjs`:
- Bijective check: every MD `## TC-XXX-NNN:` has matching `test('TC-XXX-NNN:` in the named spec; reverse direction too
- Per-module: walk each MD's `**Automation File**:` to its named spec; cross-check TC IDs
- Exit 1 on any orphan in either direction
- Output: per-module orphan list

### Phase 5 — D7: Unjustified skip detector

Author `check-no-unjustified-skip.mjs`:
- Regex scan `clients/encore/tests/**/*.spec.ts` for `test\.(skip|fixme)\(`
- For each hit: check the preceding 3 lines OR next 3 lines for `// BLOCKED-BY: NM-\d+` OR `// OMITTED-BUG: NM-\d+`
- Exit 1 on any unjustified skip/fixme
- Output: file:line of each violation

### Phase 6 — D8: Bare count assertion detector

Author `check-no-bare-count-asserts.mjs`:
- Regex scan for `\.toBeGreaterThan\(0\)` and `\.toBeLessThan\(99999\)` (and similar weak boundaries)
- Cross-reference TC ID context: if the MD for that TC declares an exact count, flag the assertion as a violation
- Exit 1 on flagged hits

### Phase 7 — D9: No-op assertion detector

Author `check-no-no-op-asserts.mjs`:
- Regex scan for empty `catch\s*\{\s*\}` and `expect\(true\)\.toBe\(true\)` and `expect\(false\)\.toBe\(false\)`
- Exit 1 on any hit (these are tests that prove nothing)

### Phase 8 — D10: Assertionless test detector

Author `check-test-has-assertion.mjs`:
- For each `test\('TC-` block in `clients/encore/tests/**/*.spec.ts`, parse the body
- Require ≥1 `expect(` OR `expect.poll(` OR `await expect(`
- Exit 1 on assertionless tests

### Phase 9 — D12: XLSX cleanliness CI script (absorbed from defunct W1-02)

Author `clients/encore/scripts/ci/check-xlsx-sanity.mjs` (renamed from W1-02's `check-csv-sanity.mjs`; target flipped CSV → XLSX per supersession):
- Reads workbook at `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` via `exceljs`
- For every per-module sheet, validate cell content against `red-flag-patterns.json` (see Phase 9.5 below)
- Flag: hardcoded e2e URL leaks (`cloudapps-e2e.encoreglobal.com`), placeholder TODO/FIXME inside `Preconditions`/`Steps`/`Expected Result` cells, empty `TC ID` cells, malformed `Steps` (less than 1 step)
- Exit 1 on findings

### Phase 9.5 — Author `red-flag-patterns.json` catalog (absorbed from defunct W1-02)

Author `clients/encore/scripts/ci/red-flag-patterns.json`:
- JSON array of pattern objects: `{id, regex, severity, scope, message}`
- Scopes: `xlsx-cell` / `spec-comment` / `md-body` — sanity scripts consume the entries matching their scope
- Append-only invariant enforced by W2-09's `check-catalog-append-only.mjs`

### Phase 10 — D13: MD cleanliness CI script

Author `check-md-sanity.mjs`:
- Reads each MD at `clients/encore/specs_planning/test-cases/setup/**/*.md`
- Same content/character/formatting checks as D12 but applied to MD sources
- Consumes `md-body`-scoped entries from `red-flag-patterns.json`

### Phase 11 — D14: Comment sanity CI script (absorbed from defunct W1-02)

Author `clients/encore/scripts/ci/check-comment-sanity.mjs` (fresh authoring; W1-02 supersession means this is no longer "already authored"):
- Walks `clients/encore/tests/**/*.spec.ts`, `clients/encore/src/pages/**/*.page.ts`, `clients/encore/src/selectors/**/*.ts`, `clients/encore/src/data/**/*.ts`, and `clients/encore/scripts/**/*.mjs`
- Flags every comment against `spec-comment`-scoped entries from `red-flag-patterns.json` (stale CSV refs, TODO without ticket, FIXME without ticket, etc.)
- Exit 1 on findings

### Phase 12 — Unit-test all scripts

For each script: author known-good fixture + known-bad fixture. Run script against both. Confirm exit 0 on good, exit 1 on bad. Store fixtures under `clients/encore/scripts/ci/fixtures/`.

### Phase 13 — Document in README

Author `clients/encore/scripts/ci/README.md` listing every script + its purpose + how to invoke + what triggers it.

**BANNED in W1-05**:
- No `.husky/pre-commit` edits (W2-09 owns)
- No `.github/workflows/*.yml` edits (W2-09 owns)
- No `npx playwright test` invocations
- No playwright-cli or live DOM
- No D11 weekly cron (W2-09)
- No D15 PR template (W2-09)
- No D16 catalog growth tracking (W2-09)
- No D17 drift-back sweep (W2-09)

---

## Per-Identity Satisfaction Matrix (LR-048 v2)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) | n/a |
| GIVER | test-cases.md, test-plans.md, XLSX workbook | (none) — sanity scripts READ the workbook; no GIVER mutations | n/a |
| BUILDER | specs/<module>/*.spec.ts | (none) — script authoring only, no spec edits | n/a |
| HEALER | per-fix MD update | (none) | n/a |
| WATCHDOG | findings table | (none) | n/a |
| GARDENER | refactor citation | 10 CI scripts authored + fixtures + README; all exit 0 on current codebase | `for s in clients/encore/scripts/ci/check-*.mjs; do node $s || exit 1; done` exits 0 |

All non-(none) cells classified (a) MCP-proven per LR-040.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed: DO-NOW / SPAWN / APPEND.

---

## Acceptance criteria

- [ ] 10 CI scripts authored (D3, D4, D5/D6 combined, D7, D8, D9, D10, D12 `check-xlsx-sanity.mjs`, D13 `check-md-sanity.mjs`, D14 `check-comment-sanity.mjs`)
- [ ] `red-flag-patterns.json` catalog authored (absorbed from defunct W1-02)
- [ ] Each script has known-good + known-bad fixture in `scripts/ci/fixtures/`
- [ ] Each script exits 0 on known-good, exit 1 on known-bad
- [ ] All 10 scripts exit 0 on the current codebase (state post-W1-04)
- [ ] README at `clients/encore/scripts/ci/README.md` documents every script
- [ ] No `.husky/` or `.github/workflows/` edits in this subplan's diff
- [ ] `/regression-guard` snapshot diff matches: 10 new scripts + 20 fixture files + 1 README
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes
- [ ] `/final-q` verdict block emitted

---

## Verification

```bash
# 10 scripts exist
ls clients/encore/scripts/ci/check-*.mjs | wc -l  # expect: >= 10

# All scripts pass on current state
for s in clients/encore/scripts/ci/check-*.mjs; do
  node $s || { echo "FAIL: $s"; exit 1; }
done
echo "ALL GREEN"  # expect: ALL GREEN

# No CI wiring in W1-05 diff
git diff --name-only main...HEAD | grep -E "\.husky|\.github/workflows" | wc -l  # expect: 0

# README exists
ls clients/encore/scripts/ci/README.md  # expect: file present
```

---

## Handoff (post-execution)

10 local validators authored + unit-tested + documented. W2-09 inherits: scripts ready to wire into pre-commit + GH Actions + cron + PR enforcement. No CI changes yet.
