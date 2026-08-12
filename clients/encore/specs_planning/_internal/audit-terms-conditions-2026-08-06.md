---
module: terms-conditions
client: encore
date: 2026-08-06
auditor: gpt-5.5
verdict: PARTIAL_WITH_BLOCKERS
---

# Terms and Conditions Phase 9 Completeness Audit

## Deliverable existence

All contracted deliverables exist; `ls -la` proof is in `.claude/state/ua-worker/chips/tnc-intake/out-audit/ls-deliverables.verify.txt`.

## Phase 0 — Gate

**DONE** — plan exists at `plans/pending/PLAN_TERMS_CONDITIONS_AUTOMATION.md`; navigation now has a T&C row at `.claude/context/navigation.md:121` and correctly flags the RTE-toolbar denominator gap. Note: `.claude/context/navigation.md`, `clients/encore/docs/MODULE_REGISTRY.md`, and `clients/encore/docs/REQUIREMENTS.md` were already modified before this audit read them.

## Phase 1 — Jira deep-read

**PARTIAL** — crossref exists at `clients/encore/specs_planning/_internal/jira-defect-crossref-terms-conditions-2026-08-06.md`, but `NM-1731` is still **unverified** at line 31, `NM-3162` was still `pending-probe` in crossref line 35 despite later walk evidence, and multiple integration/Legal leads remain unverified at lines 42-47 and 94-101. Remediation: refresh crossref from the later walk evidence and keep unverified Jira leads as open gaps.

## Phase 2 — Old-site baseline walk

**PARTIAL** — baseline evidence exists only under `.claude/state/ua-worker/chips/tnc-intake/out-baseline/terms-conditions-2026-08-05.md` and `out-baseline2/BASELINE2.md`; the plan-named path `clients/encore/specs_planning/_internal/old-site-baseline/terms-conditions-2026-08-05.md` is missing, while the inventory points to it in frontmatter line 10. Remediation: either restore/copy the baseline artifact into the canonical old-site-baseline folder or repoint all citations to the actual out-baseline artifact.

## Phase 3 — Machine denominator + interaction map

**NOT-DONE** — the inventory has a `⚠ KNOWN INCOMPLETENESS` block at lines 21-50 proving 9 toolbar controls (`rte-font-family-dropdown`, `rte-bold`, `rte-italic`, `rte-underline`, `rte-align-left`, `rte-align-center`, `rte-align-right`, `rte-align-justify`, `rte-save`) are outside the 42-element denominator. The required interaction map `scripts/walk-coverage/interaction-maps/terms-conditions-2026-08-06.json` is missing. Remediation: fix/enhance the enumerator state coverage, re-enumerate editor-open state, regenerate manifest and interaction map.

## Phase 4 — Manual-QA bug harvest

**PARTIAL** — walk evidence exists at `clients/encore/specs_planning/_internal/walk-evidence-terms-conditions-2026-08-06.md` with `## Observations` at lines 111-139 and confirms NM-3162 plus DEF-TNC-005. No `clients/encore/reports/bugs/BUG-TNC*.json` files exist, so the bug filing loop required by plan lines 244-251 and acceptance lines 535-537 is not closed. Remediation: file or explicitly defer each TNC defect with the required bug artifact and affected TC list.

## Phase 5 — Empty-surface + permission investigation

**PARTIAL** — RBAC was not investigated; crossref line 34 says the permission axis was dropped and cases are data-blocked pending a second credentialed role. This is an explicit scope reduction, but not a completed permission investigation against `CORP_LEGAL`. Remediation: either add a signed deferral/owner decision to the plan or provide the role-unlock evidence and data-blocked TC disposition.

## Phase 6 — Field inventory + ID registry

**PARTIAL** — TNC is registered in `export_test_cases/module-codes.json` and `export_test_cases/types.ts`; field inventory exists, but it self-invalidates completeness at lines 21-50. The `field-case-generation.md` RBAC promotion also was not done: it still lists `rbac` as deferred at lines 109 and 163. Remediation: promote RBAC or remove the plan's claim that promotion was required/completed; rebuild inventory after denominator fix.

## Phase 7 — Case authoring L1-L3

**PARTIAL** — 92 markdown cases exist and 68 spec tests exist, exactly 34 in grid and 34 in content (`audit-data.json`). The 24 unautomated IDs are: `TC-TNC-CORE-033`, `046`, `051`, `052`, `053`, `054`, `055`, `056`, `057`, `058`, `069`, `072`, `081`, `082`, `083`, `084`, `085`, `086`, `087`, `088`, `089`, `090`, `091`, `092`. Silent gaps in the two fix reports by strict ID mention are `TC-051`, `TC-052`, `TC-053`, `TC-054`, and `TC-081` (`fix-report-declarations.verify.txt`); broad range references cover the rest. Remediation: either automate or explicitly declare each omitted TC by full ID with an evidence-backed reason.

## Phase 8 — Builder artifacts

**PARTIAL** — selector, page object, and two spec files exist, but builder scope is not complete because `TC-TNC-CORE-046` is described as automated in inventory lines 52-53 while no test title exists for it; grid `TC-036` is skipped at `terms-conditions-grid.spec.ts:209`; and content spec uses `tnc.page.route` at `terms-conditions-content.spec.ts:607`, which breaks the page-object-only pattern. Remediation: add PO methods for missing RTE toolbar controls and automate or honestly declare the gaps in the case catalog.

## Phase 9 — WATCHDOG audit

**PARTIAL** — this audit exists. The plan's Phase 9 line 483 requires "Suite green ×2 consecutively", but that is a plan defect: `TC-044`, `TC-045`, and related `TC-062`/`TC-074` assert correct behavior against known defects and must fail until the app is fixed. Correct acceptance: all non-bug-evidence tests pass; named bug-evidence tests fail with documented signatures; no test is skipped except explicit declared gaps.

## Phase 10 — Registration, sweep, closure

**PARTIAL** — navigation, MODULE_REGISTRY, and REQUIREMENTS contain T&C entries and correctly carry the known incompleteness caveat, but those three files were mid-edit before this audit and were not written by this audit. Plan closure cannot proceed while Phase 3/4/6/7/8 blockers remain.

## Gaps

1. **BLOCKER — denominator incomplete**: inventory lines 21-50 prove 9 RTE toolbar controls are absent from the 42-element denominator; interaction map is missing. Fix enumerator/editor-open state and rebuild inventory/map before closure.
2. **BLOCKER — canonical baseline path missing**: `clients/encore/specs_planning/_internal/old-site-baseline/terms-conditions-2026-08-05.md` is cited but absent. Restore the canonical artifact or repoint citations.
3. **BLOCKER — unfiled TNC defects**: no `BUG-TNC*.json` exists although walk evidence lines 115-128 lists defects. File bug artifacts or explicitly mark dispatcher-owned deferrals.
4. **MAJOR — unautomated TC reconciliation has silent IDs**: 24/92 cases are not automated; `TC-051`, `TC-052`, `TC-053`, `TC-054`, and `TC-081` are not explicitly named in either fix report. Add full-ID declarations or automate.
5. **MAJOR — RBAC promotion not done**: `field-case-generation.md` still defers RBAC, contradicting plan Phase 6/7. Promote RBAC or update the plan with a real owner deferral.
6. **MAJOR — Jira closure stale**: crossref still marks NM-3162 pending even though later walk evidence confirms regression; NM-1200/NM-825/NM-664 remain unverified. Refresh crossref and close or carry gaps.
7. **MAJOR — false clean-completeness claims remain**: `field-inventory:11`, `field-inventory:14`, `jira-crossref:16`, and test cases line 12 cite 42/42 or clean status without the caveat in the same statement. Rewrite as "known undercount, not closure evidence."
8. **MAJOR — TC-046 inconsistency**: inventory lines 52-53 say TC-046 asserts bold round-trip, but no TC-046 spec test exists and content header lines 25-29 calls it a gap. Align inventory, markdown, and spec.
9. **MAJOR — bug-evidence set is broader than ticket states**: TC-044/045 are present and unskipped with defect names, but grid TC-061/062/074 are also deliberate failure vehicles. Update acceptance to name every intended failing test, not just 044/045/046.
10. **MINOR — `check:spec-quality` prints repo-wide announce findings**: command exits 0 but emits unrelated missing receipt warnings; keep artifact with exit code and do not count as TNC pass/fail.

## Claims that are no longer true

- `clients/encore/specs_planning/_internal/field-inventories/terms-conditions-2026-08-05.md:52-53` says bold is automatable and TC-046 asserts round-trip; no TC-046 spec exists and persistence is still unresolved.
- `clients/encore/specs_planning/_internal/walk-evidence-terms-conditions-2026-08-06.md:18` carries "bold persistence" as a carried-forward fact; inventory line 84 and REQUIREMENTS line 1484 say bold persistence is unresolved.
- `clients/encore/specs_planning/_internal/field-inventories/terms-conditions-2026-08-05.md:169` states malformed/extreme residue rows trigger the 500; the offending row was never isolated, so this must remain observed correlation.
- `clients/encore/specs_planning/_internal/field-inventories/terms-conditions-2026-08-05.md:170` generalizes DEF-TNC-005 to any non-2xx/all save failures; accepted precision is one observed HTTP 500 only.
- `clients/encore/specs_planning/test-cases/setup/terms-conditions/terms_conditions_core_test_cases.md:12` says verified against `Coverage_Ratio: 42/42, CrossCheck: clean`; the same inventory says those are not trustworthy.
- `plans/pending/PLAN_TERMS_CONDITIONS_AUTOMATION.md:589-594` handoff says covered end-to-end; this audit finds Phase 3, 4, 6, 7, and 8 gaps.

## Verification command outputs

- `ls-deliverables.verify.txt` — all contracted deliverables exist.
- `check-spec-quality.verify.txt` — `npm run check:spec-quality`, real exit `0`; tail includes reject-oracle announce warnings.
- `tsc.verify.txt` — `npx tsc --noEmit -p clients/encore/tsconfig.json`, real exit `0`.
- `audit-data.json` — 92 markdown IDs, 68 test titles, 24 unautomated IDs.
- `fix-report-declarations.verify.txt` — strict ID declarations, with five missing explicit IDs.
