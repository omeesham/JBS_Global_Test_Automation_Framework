---
artifact: W1-01-decisions-and-pretriage
subplan: SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE
parent: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT
date: 2026-05-26
agent: WATCHDOG
permissionMode: plan
browserTool: none
input_for:
  - SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT (E5/E6 + HIS-7 file-only)
  - SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT (NEEDS-LIVE-WALK row list)
companion_artifacts:
  - drift-note-W1-01-2026-05-26.md
  - b5-pretriage-W1-01-2026-05-26.md
---

# W1-01 — Decisions + B.5 Pre-Triage (2026-05-26)

Single consolidated handoff artifact. Companion artifacts: drift note (Phase 1 evidence) + B.5 pre-triage table (Phase 3 evidence) at same `_internal/` path.

---

## 1. E1–E7 decision answers

| ID | Decision | Status | Source / Notes |
|---|---|---|---|
| **E1** | `left_panel` implementation timing | **RESOLVED 2026-05-26 — DROP per user** ("do not create it") → routed to FCC master roadmap line `SUBPLAN_LEFT_PANEL_FCC` | Cited at `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md:98` + `_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md` row "SP07 → FCC master roadmap line (USER-AUTHORIZED drop 2026-05-26)" |
| **E2** | `local_information` spec-only TCs (LI-064..077, SKIP-BILLING) | **MOOT — ALREADY-RESOLVED** | LI-EXTRA is already aligned across MD (14 entries), CSV (14 entries), spec (13 tests at 11 listed line refs). Parent §Findings marks "RESOLVED-by-AUDIT". W1-04 verifies parity only — no add-back work. |
| **E3** | `management_history` TC-013/014 — bug fixed or present? | **DEFER to W2-06** | File-only cannot determine current app behavior. Spec asserts fixed-headers expectation (col28=`Calculate LDW on Net Amount`, col37=`Calculate CAC on Net Amount`, col38=`Terms and Conditions`). W2-06 reads live column text to classify. |
| **E4** | `shared_setup_locations` 5 fixme'd tests (TC-031/032/007/026/030) — blocker status? | **RESOLVED 2026-05-26 — HAS-BUG-CITATION, skip W2-06 live walks** | User authorized (Phase 2 questionnaire 2026-05-26). All 5 cite `BUG-LOC-SHR-001` family with 2026-05-22 user manual-probe verification embedded as comments. Fixmes remain until Encore-side bug fix. |
| **E5** | `smoke_seed` — origin? | **RESOLVED 2026-05-26 — SCAFFOLDING; W1-04 deletes references** | User authorized (Phase 2 questionnaire 2026-05-26). File-only evidence overwhelming: worktree mirror at `.claude/worktrees/loving-allen-408532/clients/encore/tests/seed.spec.ts` (one dir different from parent plan's claimed path); current tree has zero `smoke/` dir; zero references in `clients/encore/src/`, `config/`, `playwright.config.ts`; `git log` returns no commits. |
| **E6** | `local_office_settings` BAS-068 — confirm intent? | **RESOLVED 2026-05-26 — ADD to spec + CSV in W1-04** | User authorized (Phase 2 questionnaire 2026-05-26). MD has it at `local_office_settings_test_cases.md:291` (`Date Offset — Return Rejects Negative Values`); spec has zero hits. Plan governing principle default = IMPLEMENT missing side. |
| **E7** | Pricing TC-018/019/022 + ECT TC-001/010 shady-pass candidates — live verification? | **DEFER to W2-06** | File-only cannot decide HONEST vs SHADY. Spec adapts to readOnly (PRI) and codifies silent-revert (ECT-010). W2-06 verifies live behavior + reconciles MD intent. |

---

## 2. B.5 row pre-triage summary

Full table at companion artifact `b5-pretriage-W1-01-2026-05-26.md`. Summary counts:

| Verdict | Count | Rows |
|---|---|---|
| OBVIOUS-from-source (HONEST) | 1 | CUR (TC-001) |
| OBVIOUS-from-source (file-only fix in W1-04) | 1 | HIS-7 (TC-002) |
| ALREADY-RESOLVED-by-SP00 | 1 | LI-EXTRA (14 TCs) |
| USER-AUTHORIZED-SKIP | 1 | SSL (5 fixmes: 031/032/007/026/030) |
| NEEDS-LIVE-WALK (W2-06 scope) | 5 | PRI (018/019/022), MGH (013/014), ECT (001/010), LGL (016/017), BAS-048 |
| **Total** | **9 rows** |  |

**W2-06 scope**: 5 of 9 rows. 4 rows do NOT need live walks.

---

## 3. Jira citation status (Phase 4 file-only audit)

This W1-01 session does NOT file Jira tickets (file-only scope; agent has no Jira API). All gaps are flagged for user follow-up via `/encore-questions`:

### 3a. Tickets / bug-report files ALREADY cited (no action)

| Module | TC(s) | Reference type | Reference value |
|---|---|---|---|
| shared_setup_locations | TC-031/032/007/026/030 (5 fixmes) | Framework bug-report file | `reports/bugs/BUG-LOC-SHR-001.json` — cited in all 5 spec `test.fixme` reasons; user-authorized HAS-BUG-CITATION; no Encore `NM-NNNN` needed per E4 |

### 3b. NEEDS Jira `NM-NNNN` filing (no current ticket cited; W2-06 or `/encore-questions` to file)

| Module | TC(s) | Current evidence in spec | Action |
|---|---|---|---|
| legal | TC-016/017 | `location-legal.spec.ts:176-178` cites "Logged as APP BUG in REQUIREMENTS.md and master plan" but **no `NM-NNNN`** | W2-06 verifies bug still present (dropdowns unsorted); files Jira; updates spec comment with ticket ID |
| local_office_settings | BAS-048 | `local-office-settings.spec.ts:770-772` cites "Save button stays disabled… dirty-tracking wiring on the Active toggle cell is fixed" but **no `NM-NNNN`** | W2-06 re-verifies dirty-tracking bug; files Jira OR user applies SSL-precedent HAS-BUG-CITATION skip (flag for user) |
| management_history | TC-019 | `location-management-history.spec.ts:209-211` cites "pagination bar collapses to 2-button mode … Go to first/last buttons vanish from DOM; click times out at 15s. Re-enable when bug is fixed" but **no `NM-NNNN`** | W2-06 re-verifies; files Jira |

### 3c. Test-data limitations (NOT bugs — `/encore-questions` route)

| Module | TC(s) | Reason cited | Action |
|---|---|---|---|
| management_history | TC-006 | `location-management-history.spec.ts:85` "Office 1604 has 2900+ rows -- always multi-page. Requires a location with <= 20 history rows." | `/encore-questions` — request a small-history test office OR mark Manual-only |
| management_history | TC-007 | `:93` "Requires a location with zero history rows -- 1604 has 2900+ rows" | `/encore-questions` — request a new-empty test office OR mark Manual-only |

**No phantom handoffs** (per LR-040): every entry in 3b + 3c has a concrete destination (W2-06 or `/encore-questions`).

---

## 4. Inputs to downstream subplans

### 4a. W1-04 (file-only spec fixes)

W1-04 consumes:

- **E5 decision** — delete every `smoke_seed` reference (none expected per file-only sweep; W1-04 still runs the sweep as belt-and-suspenders).
- **E6 decision** — add `TC-LOS-BAS-068: Date Offset — Return Rejects Negative Values` to `clients/encore/specs/local-office/local-office-settings.spec.ts` + targeted CSV refresh.
- **HIS-7 verdict** — replace 3 bare `toBeGreaterThan(0)` assertions in `clients/encore/specs/local-office/local-office-history.spec.ts:31/52/63` with content-based assertions enumerating the 42 LOH column names (source: `local-office-settings-2026-04-27.md` field-inventory + `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §2).
- **CUR verdict** — no W1-04 action; spec is HONEST.
- **LI-EXTRA verdict** — no W1-04 action; already aligned.

### 4b. W2-06 (e2e live walks)

W2-06 walks ONLY the 5 NEEDS-LIVE-WALK rows. Per-row scope:

1. **PRI (TC-018/019/022)** — type `13/45/2026` into Start Date / End Date inputs at the Pricing tab. Classify HONEST (readOnly blocks text input) vs SHADY (input accepts text but spec dodges via popover-only check). Update spec accordingly + MD adaptation note if HONEST.
2. **MGH (TC-013/014)** — read live column 28 / 37 / 38 header text from LM History table. If matches spec assertions → MD/CSV stale (update MD+CSV). If raw i18n key or duplicate label → SHADY (rewrite spec to assert bug + file Jira).
3. **ECT (TC-001/010)** — type `abc` into Labor Cost field at ECT tab. Confirm silent-revert is current behavior. Reconcile with MD's "Blocked / No-Automatable" intent (file Jira for the silent-revert bug; rewrite spec to assert visible rejection if that's the spec'd intent).
4. **LGL (TC-016/017)** — open Legal tab; inspect 2 dropdowns' sort order. If still unsorted → file Jira `NM-NNNN` + update spec/REQUIREMENTS.md OMITTED comments with ticket ID. If sorted → bug fixed; implement TC-016/017 in spec.
5. **BAS-048** — re-verify dirty-tracking bug on Active toggle. File Jira `NM-NNNN` OR escalate to user: "Apply SSL-precedent HAS-BUG-CITATION skip pattern? Current in-spec bug citation is detailed and matches SSL convention." If user approves SSL precedent → reclassify as USER-AUTHORIZED-SKIP, status quo. If user wants Jira → file.

### 4c. `/encore-questions` route

- MGH TC-006/007: test-data office provisioning question.
- BAS-048 (optional): SSL-precedent HAS-BUG-CITATION reuse decision.

---

## 5. Drift summary (Phase 1 result)

Stale ratio ≈ 7.7% (1 DRIFTED out of 13 claims). Below 30% HALT threshold. Drift detail:

- **smoke_seed worktree path off-by-one-dir** (`tests/seed.spec.ts` vs parent's claimed `tests/specs/smoke/seed.spec.ts`) — does not affect verdict (E5 resolved scaffolding).
- **Plan body line 102 typo** ("6 fixmes" header where 5 TC IDs are listed; line 106 explicit "5 fixmes") — informational; does not affect verdict.

All 9 B.5 row claims verified; SP00 work (CSV 12-col augmentation) confirmed in place.

---

## 6. Acceptance criteria checklist

- [x] E1–E7 all have written answers OR explicit "deferred to W2-06" classification
- [x] All 9 B.5 rows have a pre-triage verdict + file:line evidence (companion artifact)
- [x] Jira-status flagged for every skip/OMITTED row (3 NEEDS-JIRA + 1 already-cited + 2 test-data-limitations)
- [x] Decision + pre-triage artifact exists at named path (this file)
- [x] `/regression-guard` snapshot before/after — read-only subplan; diff = only the 3 new artifact files
- [x] Activity-log row to be appended per LR-028 (Phase 3.5 closure)
- [x] `/final-q` verdict block to be emitted per LR-042 (Phase 3.5 closure)

---

## 7. Handoff

**Read-only subplan complete.** Three artifacts emitted to `clients/encore/specs_planning/_internal/`:

1. `drift-note-W1-01-2026-05-26.md` — Phase 1 drift evidence (13 claims re-verified)
2. `b5-pretriage-W1-01-2026-05-26.md` — Phase 3 pre-triage table (9 rows classified)
3. `W1-01-decisions-and-pretriage-2026-05-26.md` (this file) — Phase 5 consolidated handoff

**Downstream consumers**:

- `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT` consumes §4a (E5/E6 + HIS-7).
- `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT` consumes §4b (5 NEEDS-LIVE-WALK rows).
- `/encore-questions` consumes §4c (test-data + SSL-precedent reuse questions).

No live DOM accessed; PermissionMode `plan` honored throughout; BrowserTool `none` per LR-038 v2.
