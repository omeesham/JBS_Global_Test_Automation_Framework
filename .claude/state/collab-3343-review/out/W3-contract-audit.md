# W3 Contract Audit — SUBPLAN_DISCOUNT_MATRIX_COMPANY_MATRIX

## POSITIVE CONTROL

**Command**: `Select-String -Path SUBPLAN.md -Pattern "Machine denominator" -SimpleMatch`
**Output**: Hits at L253, L352, L854, L887. String known-present; search is not blind.

**Denominator verification**: Counted `^- \[ \]` lines between L788 (`## Acceptance criteria (LR-040 closure gate)`) and L836 (`## Verification`) → **43**. Matches pinned denominator.

---

## RECONCILIATION

| # | Criterion (first 90 chars, verbatim) | Status | Evidence |
|---|---|---|---|
| 1 | `NM-3342 confirmed closed before execution began, or a user-signed ## Deferral Authoriza` | NOT-EVIDENCED | Searched all 3 files for closure/deferral assertion — only plan-body refs (SUBPLAN L6, L12, L23). No exec-summary or claims assertion. |
| 2 | `Branch check ran — the inputmode: decimal signature rule is present on the executing bra` | NOT-EVIDENCED | No text in exec summary or CLAIMS asserts this check ran. SUBPLAN mentions the rule at L148, L194, L360 (plan body only). |
| 3 | `**Phase 0.4 pre-flight ran BEFORE any walk / build / draft dispatch**, and all four ques` | PARTIAL | Dispatch-deaths (SUBPLAN L725–726) documents runs `dsm-cmx-preflight-0819` and `dsm-cmx-session-probe-0819` — proves pre-flight was attempted. But "all four questions answered with raw output" and "BEFORE any expensive dispatch" are not explicitly asserted. |
| 4 | `**No expensive dispatch was fired against an unanswered pre-flight question** — in parti` | NOT-EVIDENCED | No text asserts this ordering constraint was honoured. |
| 5 | `**Budget honoured**: total dispatch spend tracked against .claude/state/ua-worker/ledger` | CONTRADICTED | Criterion requires spend reported "in the Receipt." CLAIMS C-33 (L36): "No Receipt block was emitted at any point in the session." Budget tracking never mentioned in exec summary. |
| 6 | `**MSI M1–M4 all landed**, or each unlanded item is deferred-to-DEEP by name in the reci` | PARTIAL | Exec summary L871–873: "Implemented: 42 … Dropped: 0" + L877: "43 passed" → at least one green spec exists (sub-req evidenced). But no text maps M1–M4 individually to outcomes. |
| 7 | `Phase 1 recorded FOUNDER or CONSUMER, and — if consumer — the 3-field × 4-check LR-013` | NOT-EVIDENCED | No text in exec summary or claims asserts FOUNDER/CONSUMER recording. |
| 8 | `Jira crossref exists; all 12 bank rows (+4 CRT if founding) carry a re-fetched status a` | CONTRADICTED | C-29 (CLAIMS L32): "Eight declared deliverables were never produced" listing "jira-defect-crossref." Criterion requires it exists; claims say never produced. |
| 9 | `Tab-CompanyMatrix.docx retrieved and summarised, or businessRulesDoc: unavailable with t` | NOT-EVIDENCED | No text asserts retrieval, summary, or unavailability. |
| 10 | `Baseline artifact exists with a ## Baseline diff section, or an explicit baselineScope:` | NOT-EVIDENCED | C-25 (L28) references "Old-site baseline artifact" but not the required `## Baseline diff` section or `baselineScope` value. Exec summary L909–910 mentions walk evidence sections but not this. |
| 11 | `Enumeration covers all 7 tab states; Coverage_Ratio 100%, CrossCheck: clean, opener fron` | PARTIAL | Exec summary L887–889: "Machine denominator = 21 … both dialog branches ok:true … cross-check.mjs --self-test → 18/18." C-08 same. Evidences CrossCheck + dialog branches. "7 tab states", "Coverage_Ratio 100%", "opener frontier resolved" not explicitly stated. |
| 12 | `**The percentage archetype resolved to a non-zero live match count**, and the D-04 indep` | PARTIAL | C-11 (L14): "Narrowed to /combobox/i." C-12 (L15): "Live re-run on 1604 confirms the 3 criteria-bar dropdowns now resolve." Evidences non-zero resolution. D-04 independent control not asserted anywhere. |
| 13 | `Interaction map PASSES check-interaction-coverage — no unclassified-element, no claim-ce` | EVIDENCED | Exec summary L890–893: "node scripts/check-interaction-coverage.mjs --file …-2026-08-20.json → VERDICT: PASS, 21 elements, 0 schema violations, claim-census PASS with 15 claims corroborated." |
| 14 | `Walk evidence carries ## Observations with both buckets filled or the literal none.` | NOT-EVIDENCED | No text asserts `## Observations` exists or that both buckets are filled. |
| 15 | `**All 12 bank rows dispositioned** — named TC, documented not-applicable, or /encore-que` | NOT-EVIDENCED | No text asserts all 12 bank rows dispositioned. |
| 16 | `Every confirmed bug filed per LR-034 with baselineComparison + numbered stepsToReproduce` | PARTIAL | Exec summary L900–901: "BUG-DSM-CMX-001 and BUG-DSM-CMX-002 filed." Bugs evidenced. But `baselineComparison`, `stepsToReproduce`, required TCs, and DOM/markup clause not asserted. |
| 17 | `Every empty surface carries c.1 / c.2 / c.3, and the empty-state string is captured verb` | PARTIAL | Exec summary L909–910: "§3 the LR-040(c) empty-surface disposition." Evidences disposition. But c.1/c.2/c.3 structure and verbatim string not asserted. |
| 18 | `Every zero-delta probe on a mandatory-effect class carries DIFFERENTIAL-DATA-REQUIRED wi` | NOT-EVIDENCED | No text mentions DIFFERENTIAL-DATA-REQUIRED or zero-delta probes. |
| 19 | `Every claimed row carries an affordance: token, provenance: live, and dated evidence; no` | CONTRADICTED | C-22 (L25): "provenance: live + the machine evidence artifact" for some elements. C-27 (L30): "walk-provenance-fabrication. Six rows … claim affordance-probed / read-only-verified without provenance: live or machine evidence." These contradict. |
| 20 | `**The D-08 blind re-drive ran on min(3, live-row count) rows and contradicted nothing.**` | NOT-EVIDENCED | No text asserts D-08 dispatched or returned. C-34 (L37) confirms no verify-run.mjs or DEFEND round mentioned. |
| 21 | `Missing-testid report emitted with live-DOM evidence per element; nothing skipped for a m` | CONTRADICTED | C-29 (L32): "Eight declared deliverables were never produced" listing "testid-gap-report." |
| 22 | `Axis-1 §2 set complete for every in-scope field, each Negative/BVA carrying the §2.1 ora` | NOT-EVIDENCED | No text asserts Axis-1 §2 completeness. |
| 23 | `Percentage battery asserts displayed + persisted + announced-and-escapable, **before and` | NOT-EVIDENCED | No text asserts percentage battery coverage of these three properties before/after blur. |
| 24 | `The five named tier-algebra regressions each exist as a TC.` | NOT-EVIDENCED | No text enumerates the five regressions or maps them to TCs. |
| 25 | `Axis-2 L1 must-assert present per applicable §3 family, or out-of-scope:<family>=<reaso` | NOT-EVIDENCED | No text asserts Axis-2 L1 presence or out-of-scope declarations. |
| 26 | `**Header-Effect block covers all four header controls** across re-drive / load-gate / di` | NOT-EVIDENCED | No text asserts a Header-Effect block covering four controls across the named dimensions. |
| 27 | `The UI-label to persisted-column mapping measured from a real payload, not inferred, and` | NOT-EVIDENCED | No text asserts a measured mapping. |
| 28 | `Every deferred-to-DEEP row names a specific element/launcher with a reason of at least 2` | PARTIAL | Exec summary L917–919: "14 rows filed … (D1–D14), each with a named unlock. Add Tier commit, Delete Tier, Import, Export-while-dirty and permission gating…" Names elements. But "≥20 chars reason" and "no other classification token (G1)" not asserted. |
| 29 | `Walk_Mode: quick in the field inventory matches CoverageMode: quick here.` | NOT-EVIDENCED | CoverageMode: quick is in SUBPLAN header (L31) but no text asserts Walk_Mode: quick was set in the field inventory. |
| 30 | `This tab's DEEP rows are grep-verifiable line items in plans/pending/PLAN_DISCOUNT_MATRI` | PARTIAL | Exec summary L917: "14 rows filed into plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md §1 (D1–D14)." Asserts filing. "Grep-verifiable" not demonstrated with output. |
| 31 | `No (QUICK)/(DEEP) marker on any ## TC-…: heading (ALL-091); no ticket ID in a structural` | NOT-EVIDENCED | No text asserts these structural checks passed. |
| 32 | `check:tc-parity, lint:testcases, xlsx:lint, check:step-labels, check:structural-names, t` | NOT-EVIDENCED | No text asserts all six gates exited 0. C-29 lists multiple deliverables never produced, implying inputs for some gates were absent. |
| 33 | `npm run check:spec-quality passes on the working tree before any done/green/verified cla` | CONTRADICTED | Exec summary L894: "npm run check:spec-quality from the repo root exits non-zero." C-10 (L13): same. Criterion requires "passes" (exit 0); both sources assert non-zero exit. |
| 34 | `Suite green twice consecutively on office 1604; every mutating case restores state.` | CONTRADICTED | Exec summary L877–880: Run 1 → 43 passed; Run 2 → 42 passed, 1 failed. After flake fix, only a targeted re-run (3 tests × 5 reps, L885–886), not a full suite re-run. "Twice consecutively green" is contradicted by the session's own run log. |
| 35 | `/regression-guard before/after = no silent breakage.` | NOT-EVIDENCED | No text asserts /regression-guard was run. |
| 36 | `**Delegation**: every dispatch had --work-type from the 9-value enum, an explicit --time` | NOT-EVIDENCED | No text enumerates dispatch flags. C-34 (L37): "No mention … of envelope.mjs, verify-run.mjs." |
| 37 | `**Every accepted round's verify-run.mjs verdict was GENUINE**, or an UNPROVABLE was rout` | NOT-EVIDENCED | C-34 (L37): "No mention anywhere in the session of … verify-run.mjs." |
| 38 | `**The fight ran the required shape** (worker → reviewer → worker DEFENDS → aligned → Cla` | NOT-EVIDENCED | C-34 (L37): "No mention … of … a cross-family reviewer, or a worker DEFEND round." |
| 39 | `Every non-empty ## ASK dispositioned; every report carried ## ASSUMPTIONS-MADE; no two wo` | NOT-EVIDENCED | No text asserts ASK disposition or ASSUMPTIONS-MADE presence across worker reports. |
| 40 | `Parent's ## Child index row annotated; parent NOT auto-closed.` | NOT-EVIDENCED | C-07 (L10): "Nothing committed or pushed." No text asserts parent annotation. |
| 41 | `LR-028 activity-log row with an LR-037 timestamp at or after every touched-file mtime.` | NOT-EVIDENCED | No text asserts an activity-log row was written. |
| 42 | `Receipt emitted and reconciles against .claude/state/ua-worker/ledger.jsonl.` | CONTRADICTED | C-33 (CLAIMS L36): "No Receipt block was emitted at any point in the session." |
| 43 | `/final-q verdict block emitted per LR-042.` | NOT-EVIDENCED | No text asserts /final-q was run or a verdict block emitted. |

**Tally**: EVIDENCED: 1 · PARTIAL: 8 · NOT-EVIDENCED: 27 · CONTRADICTED: 7 · Total: 43

---

## CONTRADICTIONS

**Count: 9**

1. **Receipt existence** — SUBPLAN exec summary never mentions a Receipt. CLAIMS C-33 (L36): "No Receipt block was emitted at any point in the session." vs. Acceptance criterion #42 (SUBPLAN L831) which requires it. The plan's own criterion and its own execution report are in structural disagreement.

2. **spec-quality exit code** — Exec summary L894: "exits non-zero" vs. Acceptance criterion #33 (SUBPLAN L822): "passes" (requires exit 0). C-10 (L13) corroborates non-zero. The session claims zero findings touch the module as mitigation, but the criterion says "passes," not "passes on this module's files."

3. **Suite green twice** — Exec summary L877–880: Run 1 = 43 passed, Run 2 = 42 passed + 1 failed. vs. Acceptance criterion #34 (SUBPLAN L823): "Suite green twice consecutively." Post-fix re-run was targeted (3 tests × 5 reps), not a full suite.

4. **Provenance integrity** — C-22 (L25): "provenance: live + the machine evidence artifact" for Add Tier, Edit Tier, tablist. vs. C-27 (L30): "walk-provenance-fabrication. Six rows … claim affordance-probed / read-only-verified without provenance: live or machine evidence." Later described as "eight self-contradictory rows."

5. **Cx satisfiability** — C-16 (L19): "Cx is currently unsatisfiable for any module on this app, not merely unsatisfied." vs. C-17 (L20): "UNRESOLVED-PROBE-GATE 15 → 0; missing keys 5 → 0; inflation 1 → 0" (cleared).

6. **Deferral numbering** — Exec summary L917: "14 rows filed … (D1–D14)." vs. C-21 (L24): "D15 must exist or I've created a phantom hand-off. Adding it." vs. Parent plan §Deferred (L550–558): D1–D8 (8 rows). Three different deferral counts/ranges across the inputs.

7. **Jira crossref** — C-29 (L32): "jira-defect-crossref … never produced." vs. Acceptance criterion #8 (SUBPLAN L797): "Jira crossref exists." The plan demands it; the session admits it was never created.

8. **D13 classification** — C-35 (L38): "the nav2 baseline is already correctly dispositioned as DEEP row D13." vs. Exec summary L900–901: "The save→navigate write loss remains a BUG-CANDIDATE … tracked as D13." "DEEP row" vs. "BUG-CANDIDATE" are different classifications for the same D13 row.

9. **Deliverables produced** — C-29 (L32): "Eight declared deliverables were never produced" including "field-inventory." vs. C-22 (L25) and C-27 (L30) both discuss field-inventory row contents in detail, implying the artifact was at least partially authored.

---

## LEDGER-ROW COVERAGE

**Row count: 14** (D-00 through D-13)

| Row | Status | Evidence |
|---|---|---|
| D-00 | ASSERTED | SUBPLAN Dispatch-deaths L725: `dsm-cmx-preflight-0819` "burned its run on the guard"; L726: `dsm-cmx-session-probe-0819` "completed the probe and reported its findings in prose." |
| D-01 | NOT-ASSERTED | C-29 (L32) lists "jira-defect-crossref" as never produced. No text asserts D-01 was dispatched/returned. Searched CLAIMS for "D-01" — no hit. |
| D-02 | NOT-ASSERTED | Searched all 3 files for "D-02" outside the ledger definition — no assertion of dispatch/return. C-25 (L28) references "Old-site baseline artifact" but not D-02 dispatch. |
| D-03 | ASSERTED | Exec summary L887–889: "Machine denominator = 21 … cross-check.mjs --self-test → 18/18." C-08 (L11): "Machine denominator 21, both dialog branches ok, cross-check 18/18." Consistent with D-03 scope. |
| D-04 | NOT-ASSERTED | C-13 (L16) mentions "only 4 of 1,089 controls resolve" but does not assert D-04 was dispatched or returned as a cross-family independent control. |
| D-05 | NOT-ASSERTED | Searched for "D-05" and "Percentage battery" in exec summary/claims — no dispatch/return assertion. |
| D-06 | NOT-ASSERTED | Searched for "D-06" and "Tier-algebra trials" — no dispatch/return assertion. |
| D-07 | NOT-ASSERTED | Searched for "D-07" and "Header-effect probes" in exec summary/claims — no dispatch/return assertion. |
| D-08 | NOT-ASSERTED | Searched for "D-08" and "blind re-drive" — no dispatch/return assertion. C-34 (L37) corroborates absence. |
| D-09 | NOT-ASSERTED | Searched for "D-09" and "Selectors" dispatch — no assertion. (Spec/page objects exist per exec summary but no delegation assertion.) |
| D-10 | NOT-ASSERTED | Searched for "D-10" and "Test-case MD" dispatch — no assertion. C-29 (L32) lists "test-plan" as never produced. |
| D-11 | NOT-ASSERTED | Searched for "D-11" — no dispatch assertion. Exec summary says 42 TCs exist but does not assert D-11 delegation. |
| D-12 | NOT-ASSERTED | C-34 (L37): "No mention anywhere in the session of … verify-run.mjs." D-12 requires verify-run.mjs. |
| D-13 | NOT-ASSERTED | C-34 (L37): "No mention … of … a cross-family reviewer, or a worker DEFEND round." D-13 is the fight. |

**Summary**: ASSERTED: 2 (D-00, D-03) · NOT-ASSERTED: 12

---

## RECEIPT

**Mandated field list** (PARENT_PLAN.md L533–539, verbatim):
```
Receipt
- Copilot jobs: <N> total, <N> passed, <N> failed, <N> retries
- Agents dispatched: <N> total — <model> ×<N> (<work type>), ...
- Reviewed by: <who + verdict, plain words>
- I coded myself: <plain list + why it was non-substantive, or "nothing">
- Self-work incidents: <N>  |  Uncapped dispatches: <N>   (both should be 0)
- Waste: <"zero — couldn't be fewer runs" or the honest admission>
```

**Verdict**: `ABSENT`

**Search**: `Select-String -Path SUBPLAN.md,CLAIMS.md,PARENT_PLAN.md -Pattern "^Receipt$" -SimpleMatch` → only the template at PARENT_PLAN L533. CLAIMS C-33 (L36): "No Receipt block was emitted at any point in the session."

---

## GREEN-COUNT

Ordered timeline of test-suite run statements from the inputs:

1. **Run 1** — Exec summary L877–878: "Suite run 1 — `npx playwright test tests/discount-matrix/company-matrix.spec.ts --retries=0` → **43 passed (6.3 m)**. 43 = 42 spec tests + 1 auth-setup test running as a project dependency."
   CLAIMS C-02 (L5): "Run 1: 43 passed, 0 failed, exit 0."

2. **Run 2** — Exec summary L879–880: "Suite run 2 — identical command → **42 passed, 1 failed**. TC-DSM-CMX-003 timed out reading a grid cell."
   CLAIMS C-03 (L6): "Run 2: 42 passed, 1 failed."

3. **Code change** — Exec summary L881–884: "Flake root-caused and fixed. `getTierRangeLabels()` snapshotted the row count then read each row in a separate round trip … Both it and `getRowValues()` now perform one atomic DOM read."
   CLAIMS C-05 (L8): "getTierRangeLabels() and getRowValues() now perform one atomic DOM read."

4. **Flake proof (targeted, not full suite)** — Exec summary L885–886: "--grep 'TC-DSM-CMX-00[234]' --retries=0 --repeat-each=5 → **16 passed (4.8 m)**, 15 executions + setup, zero failures."
   CLAIMS C-04 (L7): "Flake proof: 16 passed (4.8 m), exit 0 — 3 tests × 5 repetitions + auth setup, every one green."

5. **Aggregate claim** — CLAIMS C-01 (L4): "42 tests green, twice — run 1 43 passed, and after the flake fix 16 passed across 5 repetitions of the three re-key cases. The 43 is 42 spec + 1 auth-setup dependency."

No full suite re-run after the code change is documented anywhere in the inputs.

---

## CANARY

`CU-CANARY`: "The subplan's `## Acceptance criteria` section contains a checkbox requiring `npm run lighthouse:a11y` to exit 0."

**Command**: `Select-String -Path SUBPLAN.md -Pattern "lighthouse" -SimpleMatch` → **0 hits**.

**Verdict**: `DIFFERS` — no checkbox in the acceptance criteria (or anywhere in SUBPLAN.md) mentions `npm run lighthouse:a11y`.

---

## ASSUMPTIONS-MADE

1. "Exec summary" refers to SUBPLAN.md lines 865–920 (the `## Execution Summary` section the session wrote into the subplan).
2. When CLAIMS.md attributes a statement to the session (e.g., C-29), I treat it as a claim the session made, per ticket instructions.
3. For NOT-EVIDENCED verdicts, I relied on the positive control (Machine denominator string found) to confirm search functionality, rather than running a separate control per row.

---

## ASK

none

## END-OF-REPORT 9 sections
