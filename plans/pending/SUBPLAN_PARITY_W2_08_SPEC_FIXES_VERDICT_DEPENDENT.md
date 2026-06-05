# SUBPLAN_PARITY_W2_08 — Spec Fixes (Verdict-Dependent + Test Runs)

**Status**: GATED (blocked until W2-06 + W2-07 close)
**Priority**: P0
**Created**: 2026-05-26

> **XLSX-migration disposition (Phase C, 2026-05-27): REWRITE-light.** E2e spec fixes are format-agnostic and preserved as-is. Any post-fix "regenerate CSV" / "CSV re-export" reference in the body flips to **"regenerate XLSX via `npm run xlsx:build`"** (or `:with-run` after fresh suite runs). The XLSX workbook is the canonical deliverable post-Phase-B of `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md`; legacy `clients/encore/test_cases_csv/` retires in Phase D. See [triage ledger](../../clients/encore/specs_planning/_internal/plan-triage-ledger-2026-05-27.md).

**Identity**: BUILDER + HEALER
**Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
**Depends on**: SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md, SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md
**Blocks**: SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: Live verification of un-skip results + per-fix `npx playwright test --grep` runs + RCA on failures. CLI sufficient for headless runs.
**Justification**: Opus xhi required for shady-pass rewrite judgment + RCA + per-bug Jira filings + verdict-vs-implementation reasoning across 5+ modules.

---

## Context

W2-08 executes the verdict-DEPENDENT spec fixes that file-only W1-04 deferred. Every fix here requires either:
- A W2-06 shady-pass verdict (HONEST vs SHADY vs MD-stale)
- A W2-07 field-inventory or neutral-eye finding
- A live un-skip + RCA cycle to determine current bug state

**Items in W2-08 scope**:
- **CUR shady-pass**: rewrite per CUR verdict from W2-06
- **PRI TC-018/019/022**: rewrite per PRI verdict (if SHADY, test invalid-date entry; if HONEST, document adaptation)
- **MGH TC-013/014**: rewrite per MGH verdict (if SHADY, expect-bug; if MD-stale, update MD — workbook auto-rebuilds via `npm run xlsx:build` per PLAN_CSV_TO_XLSX)
- **MGH TC-006/007/019**: un-skip + RCA + implement OR Jira-cite
- **ECT TC-001/010**: rewrite per ECT verdict (if SHADY codifying silent-revert, file Jira + flip assertion)
- **SSL fixmes TC-031/032/007/026/030** (current state, all BUG-LOC-SHR-001): un-skip per LR-021 + RCA per LR-024 + implement OR Jira-cite per TC
- **BAS-048**: un-skip + RCA + implement OR Jira-cite
- **LGL-015**: live MCP discovery of Country selector → add to `left-panel.ts` → implement TC. If no Country selector exists in the app UI either, escalate via `/encore-questions` and defer LGL-015 to FCC master.
- **LGL-016/017**: Jira citations confirmed by W2-06; inline `// OMITTED-BUG: NM-NNNN` comments

**All `npx playwright test` runs** happen in W2-08 (W1 wave used `--list` only).

Provenance: restructured from `SUBPLAN_PARITY_04_SPEC_FIXES_EASY_MODULES.md` + `SUBPLAN_PARITY_05_SPEC_FIXES_INVESTIGATIVE.md` + `SUBPLAN_PARITY_06_SPEC_FIXES_LOCAL_OFFICE_TRIO_AND_SMOKE.md` (verdict-dependent + e2e items only) per Wave 1/Wave 2 split (2026-05-26).

---

## Bootstrap

**Identity**: BUILDER + HEALER (mid-subplan handoff allowed per Phase 0.1 option (c) — BUILDER for spec authoring, HEALER for un-skip RCA cycles)

**Skills auto-called**:
- `/identity`, `/regression-guard` (wrap), `/relevant`, `/bugfix` (per LR-034 for confirmed app bugs), `/rca` (for un-skip cycles), `/final-q`

**Context files**:
- `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §B per-module rows
- `clients/encore/specs_planning/_internal/shady-pass-verdicts-<date>.md` (W2-06 output)
- `clients/encore/specs_planning/_internal/field-inventories/local-office-{history,ect}-<date>.md` (W2-07 output)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-{history,ect}-<date>.md` (W2-07 output)
- `clients/encore/src/selectors/locations/left-panel.ts` — current state (Country selector verified missing 2026-05-26)
- `.claude/rules/specs.md` (LR-021 un-skip-before-rewrite, LR-024 clean-before-RCA)
- `.claude/rules/angular.md` (LR-009..011, LR-026)

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm W2-06 + W2-07 closed GREEN.
2. Confirm e2e environment reachable.
3. Read navigation.md, agent-mistakes.md per `/execute` Phase 0.
4. **BrowserTool announcement**: `BrowserTool=cli`. Reason: spec runs + live verification.

---

## Phase 1+ — Actual work

### Phase 1 — Drift Check (MANDATORY)

1. Re-Read W2-06 verdict artifact + W2-07 inventories/audits.
2. Confirm verdicts still apply to current spec state (W1-04 may have changed neighboring code).
3. Cross-check Jira for any ticket state changes since W2-06 filed them.
4. Read activity log since W2-06/W2-07 closure.
5. Emit Drift Note. >30% stale → HALT.

### Phase 2 — currency (per CUR verdict)

If SHADY: rewrite affected assertions to content-anchored matchers (column header names, not just count).
If HONEST: confirm MD documents adaptation; no spec change.
Run `npx playwright test --grep "TC-LOC-CUR-"` — must pass.

### Phase 3 — legal: LGL-015 + LGL-016/017

**LGL-015** (Country cascade):
1. Live MCP walk: navigate to Office 1604 → Location → check if a Country dropdown exists in the left panel.
2. If YES (selector just not registered): add `drpCountry` selector to `clients/encore/src/selectors/locations/left-panel.ts`. Use testid if present, else CSS path.
3. Implement `test('TC-LOC-LGL-015: ...', ...)` in `clients/encore/specs/locations/location-legal.spec.ts`. Remove the existing OMITTED comment at `location-legal.spec.ts:173`.
4. If NO Country selector in the app UI: escalate via `/encore-questions` + defer LGL-015 to FCC master `SUBPLAN_LEFT_PANEL_FCC` roadmap line.

**LGL-016/017** (OMITTED-BUG):
Add inline `// OMITTED-BUG: NM-NNNN` comments where the tests would have lived, citing the Jira tickets from W2-06.

Run `npx playwright test --grep "TC-LOC-LGL-"` — must pass.

### Phase 4 — pricing TC-018/019/022 (per PRI verdict)

If SHADY: rewrite to `await page.fill(dateInput, '13/45/2026')` + assert error indicator per MD intent.
If HONEST (field is readOnly): keep current spec; ensure MD documents the adaptation.

Run `npx playwright test --grep "TC-LOC-PRI-018\|TC-LOC-PRI-019\|TC-LOC-PRI-022"`.

### Phase 5 — management_history TC-013/014 (per MGH verdict)

If MD stale (bug fixed): update MD to match fixed-headers expectation; workbook auto-rebuilds via `npm run xlsx:build` (no manual CSV/sheet edit per PLAN_CSV_TO_XLSX supersession).
If SHADY (bug present, spec adapted): rewrite spec to assert raw i18n key / duplicate label as expected; tag `// EXPECT-BUG: NM-NNNN`.

Run `npx playwright test --grep "TC-LOC-MGH-013\|TC-LOC-MGH-014"`.

### Phase 6 — management_history TC-006/007/019 un-skip

Per LR-021:
1. Remove `test.skip` from each.
2. Run original test logic via `npx playwright test --grep "TC-LOC-MGH-006|TC-LOC-MGH-007|TC-LOC-MGH-019"`.
3. If passes: keep as is (bug was silently fixed).
4. If fails: RCA per LR-024 (clean artifacts → re-run → read failure-summary). Implement fix OR file Jira + re-skip with `// BLOCKED-BY: NM-NNNN`.

### Phase 7 — ECT TC-001/010 (per ECT verdict)

If SHADY (codifying silent-revert bug): rewrite assertions; file Jira; tag `// EXPECT-BUG: NM-NNNN`.
If HONEST: document adaptation in MD.

Run `npx playwright test --grep "TC-LOS-ECT-001\|TC-LOS-ECT-010"`.

### Phase 8 — SSL fixmes TC-031/032/007/026/030 (all BUG-LOC-SHR-001)

Per LR-021 per TC:
1. Remove `test.fixme`.
2. Run original logic.
3. If passes: bug fixed; keep as test.
4. If fails: RCA per LR-024. The BUG-LOC-SHR-001 may or may not still be present — verify per TC. If still bug: re-fixme with `// BLOCKED-BY: NM-NNNN` (use current Jira state). If bug fixed: implement.

Update MD SSL Status field per honest pass/fail count.

Run `npx playwright test --grep "TC-LOC-SSL-"`.

### Phase 9 — BAS-048 un-skip

Same protocol as SSL fixmes. Read existing skip reason, un-skip, RCA, implement OR Jira-cite.

Run `npx playwright test --grep "TC-LOS-BAS-048"`.

### Phase 10 — Comment sanity + exhaustive discovery

For every spec touched: run `check-comment-sanity.mjs` (from W1-05). Manual scan beyond catalog. Append new patterns to `red-flag-patterns.json`. Re-run — exit 0.

### Phase 11 — Per-spec run + multi-spec run

For every module touched: `npx playwright test --grep "TC-LOC-{MOD}-"` — must pass.
Then `npx playwright test clients/encore/specs/locations/ clients/encore/specs/local-office/` — must pass overall (or have only-justified-skip).

---

## Per-Identity Satisfaction Matrix (LR-048 v2)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) — baseline already captured in W2-06/W2-07 | n/a |
| GIVER | test-cases.md, test-plans.md, XLSX workbook | MD Status updates (SSL Partial→honest count, MGH if bug-fixed); workbook auto-rebuilds via `npm run xlsx:build` (planner-post-complete hook) | `npm run check:tc-parity` exit 0 (now uses `getXlsxTcIds()` reader per PLAN_CSV_TO_XLSX Phase B) |
| BUILDER | specs/<module>/*.spec.ts | LGL-015 implementation + selector add + verdict-driven rewrites + un-skip cycles for MGH/SSL/BAS-048 | `npx playwright test clients/encore/specs/locations/ clients/encore/specs/local-office/` 0 failed |
| HEALER | per-fix MD update + Jira filings | Jira NM-NNNN tickets filed for confirmed bugs; MD Status synced | grep MD for current state + Jira ticket list |
| WATCHDOG | findings table | (none) — verdicts consumed from W2-06 | n/a |
| GARDENER | refactor citation | (none) — code logic + selector additions, no structural refactor | n/a |

All non-(none) cells classified (a) MCP-proven per LR-040.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during un-skip cycles (e.g., dead helpers, missing fixtures, broken selectors surfaced by RCA): DO-NOW / SPAWN / APPEND.

---

## Acceptance criteria

- [ ] CUR shady-pass: rewritten per verdict OR MD documents adaptation
- [ ] LGL-015: implemented OR escalated + deferred (with Jira escalation evidence)
- [ ] LGL-016/017: inline `// OMITTED-BUG: NM-NNNN` comments present
- [ ] PRI TC-018/019/022: rewritten OR MD documents adaptation
- [ ] MGH TC-013/014: rewritten OR MD updated (workbook auto-rebuilds via `npm run xlsx:build`)
- [ ] MGH TC-006/007/019: green OR carry `// BLOCKED-BY: NM-NNNN`
- [ ] ECT TC-001/010: rewritten + Jira-cited if SHADY OR MD-documented if HONEST
- [ ] SSL TC-031/032/007/026/030: green OR carry Jira citation
- [ ] BAS-048: green OR carries Jira citation
- [ ] Zero `test.skip` / `test.fixme` without adjacent `// BLOCKED-BY: NM-NNNN` or `// OMITTED-BUG: NM-NNNN` comment
- [ ] `npx playwright test clients/encore/specs/locations/ clients/encore/specs/local-office/` exits 0 (or only-justified-skip)
- [ ] Comment sanity script exits 0 on all touched files
- [ ] `/regression-guard` snapshot diff matches expectation
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes
- [ ] `/final-q` verdict block emitted

---

## Verification

```bash
# Zero unjustified skips
node clients/encore/scripts/ci/check-no-unjustified-skip.mjs clients/encore/specs/  # expect: exit 0

# LGL-015 implemented (or deferred with escalation)
grep -c "test('TC-LOC-LGL-015" clients/encore/specs/locations/location-legal.spec.ts  # expect: >= 1 (or escalation evidence in /encore-questions log)

# Country selector added (if LGL-015 path taken)
grep "drpCountry\|country" clients/encore/src/selectors/locations/left-panel.ts  # expect: at least 1 match if LGL-015 implemented

# All target specs green
npx playwright test clients/encore/specs/locations/ clients/encore/specs/local-office/ --reporter=line  # expect: 0 failed
```

---

## Handoff (post-execution)

All verdict-dependent fixes complete. Test suite green (or only-justified-skip). W2-09 inherits clean state for full-suite verification + CI wiring + final parity report.
