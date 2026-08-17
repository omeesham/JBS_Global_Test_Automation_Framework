# SUBPLAN_PARITY_W2_09 — Full-Suite Run + CI Wire + Final Parity Report

**Status**: GATED (blocked until W2-08 closes — last subplan in the parity restructure)
**Priority**: P0
**Created**: 2026-05-26

> **XLSX-migration disposition (Phase C, 2026-05-27): REWRITE.** CI wiring retargets the XLSX deliverable. Final parity report cites **XLSX-orphans** (not CSV-orphans). `npm run check:tc-parity` already reads the workbook post-Phase-B of `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md`; CI workflows that invoke it inherit the new vocabulary. The ship-pipeline (`scripts/ship-client.sh`) now asserts the XLSX deliverable is present in the archive. See [triage ledger](../../clients/encore/specs_planning/_internal/plan-triage-ledger-2026-05-27.md).

**Identity**: GARDENER
**Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
**Depends on**: ALL previous — W1-01..05 + W2-06, W2-07, W2-08
**Blocks**: none (last subplan — closes parent plan)
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: Full-suite `npx playwright test clients/encore/tests/` final verification run. CLI sufficient (headless full run).

---

## Context

W2-09 closes the parity restructure. It wires the CI scripts authored in W1-05 into pre-commit + GH Actions + cron + PR enforcement, runs the full-suite Playwright test as Phase 9 verification, performs the D17 drift-back sweep across the entire `clients/encore/` deliverable, and emits the final parity report.

**Items in W2-09 scope** (per auditor R2-P2-3 — moved from W1-05):
- **D11** weekly cron — GH Actions workflow at `.github/workflows/parity-drift-weekly.yml`
- **D15** PR template — repository PR checklist template (planned artifact; not present yet)
- **D16** catalog-growth tracking — CI check that `red-flag-patterns.json` is append-only; weekly review log
- **D17** drift-back prevention sweep — run sanity scripts against ENTIRE deliverable (not just touched files)
- **CI wiring** — `.husky/pre-commit` + GH Actions PR check; runs all W1-05 validators
- **Phase 9** — `npx playwright test clients/encore/tests/` full-suite run
- **Final parity report** — `clients/encore/specs_planning/audits/parity-final-<YYYY-MM-DD>.md`
- **Parent plan closure** — flip PARENT plan to Status: DONE; git mv to `done/`; reindex

Provenance: restructured from `SUBPLAN_PARITY_08_CI_GUARDRAILS_AND_VERIFICATION.md` (D11/D15/D16/D17 + CI wire + Phase 9 + final report) per Wave 1/Wave 2 split (2026-05-26).

---

## Bootstrap

**Identity**: GARDENER (CI + framework hygiene + repo-wide drift-back sweep + closure)

**Skills auto-called**:
- `/identity`, `/regression-guard` (wrap), `/relevant`, `/audit` (final verification mode), `/final-q`

**Context files**:
- `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §D11, §D15-D17, §Phase 9
- W1-05 closure artifact — list of validator scripts available
- `.husky/`, `.github/workflows/`, `clients/encore/scripts/preflight.*` — CI hosts

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm ALL previous subplans closed GREEN (W1-01..05 + W2-06, W2-07, W2-08).
2. Confirm e2e environment reachable for Phase 9 full-suite run.
3. Read navigation.md, agent-mistakes.md per `/execute` Phase 0.
4. **BrowserTool announcement**: `BrowserTool=cli`. Reason: full-suite test run.

---

## Phase 1+ — Actual work

### Phase 1 — Drift Check (MANDATORY)

1. Re-Read every prior subplan's `/final-q` artifact — confirm GREEN per subplan.
2. Re-Read parent plan §Findings — confirm every row resolved (implemented / Jira-cited / MD-documented-honest).
3. Read activity log since W2-08 closure.
4. Emit Drift Note. If any upstream subplan incomplete or any §B row still open → HALT.

### Phase 2 — D17: Drift-back sweep (RUNS FIRST — catches anything Wave 1 + Wave 2 missed)

1. Run `node clients/encore/scripts/ci/check-xlsx-sanity.mjs clients/encore/testcases/encore_test_cases.xlsx` — must exit 0 (CSV target retired per PLAN_CSV_TO_XLSX Phase D).
2. Run `node clients/encore/scripts/ci/check-comment-sanity.mjs` against the ENTIRE `clients/encore/` deliverable (not just files touched in Wave 1/2) — must exit 0.
3. Run every other W1-05 validator against `clients/encore/tests/` + `clients/encore/specs_planning/test-cases/` — all must exit 0.
4. If any residual red flag exists outside this plan's touched-files set: file a follow-up subplan to clean it; do NOT close W2-09 with phantom-handoff per LR-040.

### Phase 3 — D16: Catalog-growth tracking

1. Author `clients/encore/scripts/ci/check-catalog-append-only.mjs`: CI check that any PR which DELETES an entry from `red-flag-patterns.json` exits 1.
2. Author per-PR diff inspector that reports `Catalog growth: +N patterns`.
3. Author weekly review log emitter at `clients/encore/reports/red-flag-catalog-growth-<YYYY-WW>.json`.

### Phase 4 — D15: PR template

Edit `.github/PULL_REQUEST_TEMPLATE.md` (or create if missing) with checklist:
- [ ] Every artifact touched scanned for in-depth-quality red flags
- [ ] Findings cleaned inline (not deferred)
- [ ] `check-xlsx-sanity.mjs`, `check-comment-sanity.mjs`, `check-md-*.mjs` all exit 0 locally

### Phase 5 — D11: Weekly drift cron

Author `.github/workflows/parity-drift-weekly.yml`:
- Trigger: `cron: '0 13 * * 1'` (Monday 1pm UTC)
- Steps: checkout, install, run D3/D4/D5/D6 validators, diff spec-count vs prior commit per module
- Emit findings to `clients/encore/reports/parity-drift-<YYYY-WW>.json`
- Slack/email notify (optional — confirm with user)

### Phase 6 — CI wire: pre-commit + PR check

1. Update `.husky/pre-commit` (or `clients/encore/scripts/preflight.mjs`) to invoke every W1-05 validator + the new D16 catalog check.
2. Add GH Actions parity workflow (planned artifact; not present yet) triggered on PR — runs all validators + reports findings as PR comment.
3. Both must exit 1 on any validator failure (block merge).

### Phase 7 — Phase 9: Full-suite Playwright run

1. Clean prior artifacts: `npm run clean` (or equivalent).
2. Run `npx playwright test clients/encore/tests/` — capture output.
3. Confirm `0 failed` in summary line.
4. Spot-check 5 random TCs across modules to confirm meaningful pass (not just `--list`).
5. Re-run if intermittent failures appear (LR-024: clean before RCA).

### Phase 8 — Final parity report

Emit `clients/encore/specs_planning/audits/parity-final-<YYYY-MM-DD>.md`:
- Pre-fix vs post-fix counts per module
- Every parent §B row → closed state (implemented / Jira-cited / MD-documented-honest)
- Residual blockers (with Jira IDs, expected resolution)
- W1 wave summary + W2 wave summary
- Deliverable format migration: 11 per-module CSVs → 1 multi-sheet `encore_test_cases.xlsx` workbook (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION executed; W1-02 superseded; CSV dir + the `to-csv.ts` CLI + `--fix-csv` flag retired — `to-csv.ts` retained as the in-memory parity oracle)
- Workbook structure: 14 tabs total (Overview + 10 locations sheets + 3 local-office sheets); 13-column canonical per-module schema
- LO split: 3 separate sheets natively in workbook + 3 page-objects + 3 selectors (CSV-side split obviated by XLSX structure)
- N1 rename: framework `Manual` classification literal → `Pending Automation`; Jira/TestMo external vocab preserved via mapping layer
- LGL-015 status (implemented / deferred to FCC master)
- SP07 deferred to FCC master roadmap line

### Phase 9 — Parent plan closure (per LR-027 parent-cascade)

After all W2-09 acceptance criteria met:
1. Edit `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`:
   - Add `**Executed**: <YYYY-MM-DD>`
   - Flip `**Status**:` to `DONE`
   - Append `### Execution Summary` per LR-027 — cite every subplan: **Wave 0 (XLSX migration) — PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION** (replaces W1-02; absorbs MD prereqs A1/A2/A3/GP-3/GP-4/duplicate-035) + Wave 1 W1-01/W1-03/W1-04/W1-05 (W1-02 closed-as-superseded) + Wave 2 W2-06..09 + Wave 0 SP00 augmentation. Cite every closed §B row, every Jira filed, every test count delta, and the deliverable format flip (CSV→XLSX).
2. Also flip `plans/done/SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` Status confirmation (already done-superseded; verify the parent-cascade closure-manifest references the supersession).
3. Run `node scripts/validate-plan-closure.mjs --enforce --write-manifest plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — must exit 0.
4. `git mv plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md plans/done/`.
5. Run `npm run plans:reindex`.
6. Append activity-log row per LR-028 with LR-037 timestamp gate.

---

## Per-Identity Satisfaction Matrix (LR-048 v2)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) | n/a |
| GIVER | test-cases.md, test-plans.md, XLSX workbook | (none) — read-only verification | n/a |
| BUILDER | specs/<module>/*.spec.ts | (none) — read-only verification | n/a |
| HEALER | per-fix MD update | (none) | n/a |
| WATCHDOG | findings table | final parity report | `ls clients/encore/specs_planning/audits/parity-final-<date>.md` |
| GARDENER | refactor + CI infra | CI wired (pre-commit + PR check + weekly cron + PR template + catalog-append-only check) + Phase 9 run + final report + parent plan closure | `git log --oneline -5 plans/done/PLAN_MD_CSV*` + `cat .husky/pre-commit` + `ls .github/workflows/parity-*.yml` |

All non-(none) cells classified (a) MCP-proven per LR-040.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during D17 sweep: DO-NOW / SPAWN / APPEND.

---

## Acceptance criteria

- [ ] All W1-05 validators wired into `.husky/pre-commit` + GH Actions PR check
- [ ] `.github/workflows/parity-drift-weekly.yml` exists; first manual trigger green
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` has in-depth quality checklist
- [ ] `check-catalog-append-only.mjs` authored; deleting a `red-flag-patterns.json` entry fails the check
- [ ] D17 drift-back sweep clean (all scripts exit 0 on entire `clients/encore/`)
- [ ] `npx playwright test clients/encore/tests/` reports `0 failed`
- [ ] Final parity report exists at `clients/encore/specs_planning/audits/parity-final-<date>.md`
- [ ] Parent plan flipped to Status: DONE + Executed date + Execution Summary
- [ ] Parent plan moved to `plans/done/` via `git mv`
- [ ] `npm run plans:reindex` run successfully
- [ ] LR-055 closure validator exits 0 on parent plan
- [ ] `/regression-guard` snapshot diff matches expectation
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes
- [ ] `/final-q` verdict block emitted
- [ ] Path correction (routed 2026-07-10 from PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT Phase 2 Step 1): the CI required-check wiring must reference the repo's actual git-hooks dir `.githooks/` — earlier drafts referenced `.husky/`, which does not exist in this repo. When wiring the required check, correct any `.husky` reference to `.githooks` and verify `git config core.hooksPath` agrees.

---

## Verification

```bash
# CI wired
grep -E "check-md-|check-xlsx-|check-comment-" .husky/pre-commit  # expect: multiple matches (xlsx-sanity replaces csv-sanity post-PLAN_CSV_TO_XLSX)
ls .github/workflows/parity-*.yml  # expect: at least 2 files (parity-check + parity-drift-weekly)

# PR template updated
grep -i "xlsx-sanity\|comment-sanity\|red flag" .github/PULL_REQUEST_TEMPLATE.md  # expect: matches

# D17 sweep clean
node clients/encore/scripts/ci/check-xlsx-sanity.mjs clients/encore/testcases/encore_test_cases.xlsx && echo OK  # expect: OK
node clients/encore/scripts/ci/check-comment-sanity.mjs clients/encore/  # expect: exit 0

# Full suite green
npx playwright test clients/encore/tests/ --reporter=line | tail -3  # expect: "0 failed"

# Final parity report exists
ls clients/encore/specs_planning/audits/parity-final-*.md  # expect: 1 file

# Parent plan moved
ls plans/done/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md  # expect: file exists
[ ! -f plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md ] && echo OK  # expect: OK

# Closure validator green
node scripts/validate-plan-closure.mjs --enforce plans/done/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md && echo OK  # expect: OK

# Plans index regenerated
grep "PLAN_MD_CSV_SPEC_PARITY" plans/INDEX.md  # expect: lists as DONE
```

---

## Handoff (post-execution)

Parent plan closed. Parity restructure complete. CI guardrails locked in for future drift prevention. Final parity report shows every §B row resolved.
