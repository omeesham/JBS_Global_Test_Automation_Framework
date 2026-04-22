# MASTER PLAN — HIST Column-First Pivot ("Column-First Pivot Plan")

> **⚠️ DO NOT EXECUTE THIS FILE. Reference only.**
> This is a plan-of-plans. The actual work lives in **40 subplans** named `SUBPLAN_HIST_PIVOT_01_*` through `SUBPLAN_HIST_PIVOT_40_*` in this same `plans/pending/` directory.
>
> **🎯 INVOCATION PATTERN (zero-prompt execution)**: Every subplan carries a **SESSION BOOTSTRAP** block at its very top. To execute any subplan, the user just needs to say `/execute <subplan-filename>` — nothing else. The bootstrap block tells the agent exactly what identity to load, which skills to chain, what model + thinking tier to use, how to gate on dependencies, and when to halt-and-ask. No prompting from the user is required beyond picking the filename.
>
> **⚠️ ADDENDUM (2026-04-20 post-SP-01)**: Every cleanup and audit subplan now carries a **Phase 0 — Date-Forensic Self-Discovery** directive at the top of its Step-by-Step section. Don't skip it. The principle:
> > *Scope in this subplan is a STARTING POINT, not an exhaustive recipe. Run `git log --since=2026-04-13 --until=2026-04-18` in your sphere, find every file touched during HIST integration, use your own brain to classify DELETE / KEEP / REVISE. Document findings + dispositions in your activity-log row. Don't blindly follow the written scope — that's how the old pattern got built in the first place.*
>
> SP-02 ALSO picks up SP-01's sweep-up responsibility (SP-01 was executed before this directive existed). Subsequent subplans each own their own sphere's forensic sweep.
>
> **Cold-start session instructions**:
> 1. Do NOT treat this master as an executable task.
> 2. Pick the **lowest-numbered** `SUBPLAN_HIST_PIVOT_NN_*.md` file still in `plans/pending/`. That is your task.
> 3. Read that subplan's `**Dependencies**` section. If a prerequisite isn't DONE yet, work the prerequisite first.
> 4. Use the model + thinking tier from the execution-order table below.
> 5. Only read THIS master file for context (§1–§3 for pivot rationale, §3 for KEEP list, §5 for subplan details).
>
> **Total scope**: 40 subplans, organized into 6 groups. Start at SP-01 (SP-A1 purge). Do NOT skip ahead.

**Working ID**: PLAN_HIST_COLUMN_FIRST_PIVOT
**Location**: `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` (this file)
**Created**: 2026-04-20
**Status**: Pending
**Priority**: P0 (client delivery — supersedes every in-flight HIST plan)

---

## EXECUTION ORDER (read before invoking any session)

Subplans are numbered `SUBPLAN_HIST_PIVOT_01_*` → `SUBPLAN_HIST_PIVOT_40_*`. Pick the lowest-numbered subplan still in `plans/pending/` — that is the next task. The numeric prefix = execution order. Do NOT skip ahead; dependencies apply (see §6 Dependency Graph).

**Model + thinking level per subplan**:

| SP # | Subplan ID + short name | Group | Mode | Model | Thinking |
|---|---|---|---|---|---|
| 01 | SP-A1 — Purge Location specs (8 files) | 1 | /execute | Sonnet | think hard |
| 02 | SP-A2 — Purge Local Office specs (2 files) | 1 | /execute | Sonnet | think hard |
| 03 | SP-A3 — Strip HIST sections from 10 MDs + re-export CSVs | 1 | /execute | Sonnet | think hard |
| 04 | SP-H — REQUIREMENTS.md §History language revision | 1 | /execute | Sonnet | think hard |
| 05 | SP-B-LO-1 — MCP catalog Local Office Basic Info | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 05b | SP-B-LO-1b — MCP catalog Local Office Basic Info (residual 7 parents) | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 06 | SP-B-LO-2 — MCP catalog Local Office ECT | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 07 | SP-B-LO-R — Reconcile Local Office 42-col catalog | 2 | /execute | Opus | think harder |
| 08 | SP-B-LM-1 — MCP catalog LM Currency | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 09 | SP-B-LM-2 — MCP catalog LM Pricing | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 10 | SP-B-LM-3a — MCP catalog LM Local Info (Part A) | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 11 | SP-B-LM-3b — MCP catalog LM Local Info (Part B) | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 12 | SP-B-LM-4 — MCP catalog LM Account & Address | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 13 | SP-B-LM-5 — MCP catalog LM Legal | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 14 | SP-B-LM-6 — MCP catalog LM Notes | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 15 | SP-B-LM-7 — MCP catalog LM Shared Setup | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 16 | SP-B-LM-8 — MCP catalog LM Auto Add-On | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 17 | SP-B-LM-9 — MCP catalog LM Top-level fields | 2 | /execute (MCP) | **Opus** | **ultrathink** |
| 18 | SP-B-LM-R — Reconcile LM 87-col catalog | 2 | /execute | Opus | think harder |
| 19 | SP-D0 — Create hist-reader.ts shared utils + tests | 3 | /execute | Sonnet | think harder |
| 20 | SP-C1 — Local Office Basic Info column tests | 3 | /execute | Sonnet | think harder |
| 21 | SP-C2 — Local Office ECT column tests | 3 | /execute | Sonnet | think harder |
| 22 | SP-D1 — LM Currency column tests (proof-of-pattern) | 3 | /execute | **Opus** | think harder |
| 23 | SP-D2 — LM Pricing column tests | 3 | /execute | Sonnet | think harder |
| 24 | SP-D3a — LM Local Info column tests (Part A) | 3 | /execute | Sonnet | think harder |
| 25 | SP-D3b — LM Local Info column tests (Part B) | 3 | /execute | Sonnet | think harder |
| 26 | SP-D4 — LM Account & Address column tests | 3 | /execute | Sonnet | think harder |
| 27 | SP-D5 — LM Legal column tests | 3 | /execute | Sonnet | think harder |
| 28 | SP-D6 — LM Notes column tests | 3 | /execute | Sonnet | think harder |
| 29 | SP-D7 — LM Shared Setup column tests | 3 | /execute | Sonnet | think harder |
| 30 | SP-D8 — LM Auto Add-On column tests | 3 | /execute | Sonnet | think harder |
| 31 | SP-D9 — LM Top-level column tests | 3 | /execute | Sonnet | think harder |
| 32 | SP-D10 — LM Orphan column guard tests (conditional) | 3 | /execute | Sonnet | think harder |
| 33 | SP-F1 — Anomaly writer utility + afterEach hook | 4 | /execute | Sonnet | think hard |
| 34 | SP-F2 — Auto-bug-filer dry-run script + dedup | 4 | /execute | Sonnet | think hard |
| 35 | SP-E-LO — File LO NOT-TRACKED bugs (GATED) | 5 | /execute + /find-bugs | **Opus** | think harder |
| 36 | SP-E-LM-CUR — File Currency NOT-TRACKED bugs (GATED) | 5 | /execute + /find-bugs | **Opus** | think harder |
| 37 | SP-E-LM-OTHER — File remaining LM bugs (GATED) | 5 | /execute + /find-bugs | **Opus** | think harder |
| 38 | SP-J — Final cross-pivot audit | 5 | /audit | **Opus** | **ultrathink** |
| 39 | SP-K1 — Framework rules sweep | 6 | /audit | Sonnet | think hard |
| 40 | SP-K2 — Agent prompts sweep | 6 | /audit | Sonnet | think hard |

**Rule of thumb**:
- **Opus + ultrathink**: MCP live-DOM catalog sessions + final adversarial audit (12 subplans — sessions 05–17, 38).
- **Opus + think harder**: Catalog reconciliation, proof-of-pattern spec (D1), all bug-filing (judgment calls) — 5 subplans.
- **Sonnet + think harder**: Template-driven spec writing + shared utils — 13 subplans.
- **Sonnet + think hard**: Cleanup, doc edits, scaffolding, rule/prompt sweeps — 10 subplans.

**⚠️ Model bump for forensic-heavy subplans**: SP-02, SP-03, SP-04 (H), SP-19 (D0), SP-38 (J), SP-39/40 (K1/K2) now include Phase 0 date-forensic analysis that requires judgment. Bump thinking tier one notch if executing on Sonnet (think hard → think harder); Opus subplans can stay at their listed tier.

**Group → what it achieves**:
- **Group 1 (01–04)** — Cleanup: remove dead integration-per-spec code + docs. Unblocks everything else.
- **Group 2 (05–18)** — Discovery: build authoritative root→column catalogs via batched MCP (≤15 parents per session). Feeds all test writing.
- **Group 3 (19–32)** — Implementation: per-column hist test suites for both modules. This is the actual new coverage.
- **Group 4 (33–34)** — Infrastructure: anomaly logging + auto-filer scaffold (dry-run). Closes the loop from spec failure → bug candidate.
- **Group 5 (35–38)** — Bug filing + final audit: gated LR-034 filings + WATCHDOG acceptance gate.
- **Group 6 (39–40)** — Sanity sweep: confirm no framework rules or agent prompts still endorse old pattern. Low priority, non-blocking.

---

**Author intent (Rutvik, 2026-04-20)**: Pivot HIST testing from "check hist in every spec after each save" to "test hist directly in dedicated hist specs: go to root, change it, read hist column, repeat per hist column."
**Per-identity inventory**: conducted — see §Inventory-By-Identity below.
**Subplan sizing principle**: every subplan is sized for ONE focused session (no multi-hour sprawl that invites hallucination). More, smaller subplans are preferred over fewer big ones.
**Cleanup principle**: only delete what is JUNK under the pivot. Everything else (page objects, selectors, data, helpers, rules, structural specs, exporter, fixtures, audit records) is kept. KEEP-lists are explicit per subplan so a cleanup agent can't over-reach.

---

## 1. Context — Why This Pivot Exists

### What we built last 2 weeks (SP HISTORY 01–07, done)
Each save-producing spec (Currency, Pricing, Local Info, Account/Address, Legal, Notes, Shared Setup, Auto Add-On on Location Mgmt; Basic Info + ECT on Local Office) got an appended `TC-*-HIST` test at the end of its `describe.serial`. Re-navigates to the matching history tab and asserts saves produced rows. 10 specs + 10 test-case MDs + 10 CSV exports carry this pattern today.

### Why this is thrown out (three compounding problems)
1. **Every non-HIST spec pays a HIST tax** — `navigateToHistoryTab` + read table + parse timestamps, appended to every basic-info spec. Across 10 specs, a constant overhead in regression runs.
2. **Coverage is still smoke-only** — every `TC-*-HIST` asserts `row count > 0` + set-membership, all `expect.soft()`. Live MCP probe 2026-04-17 confirmed 6 of 9 Currency parents are silently dropped by the app — every HIST test still passes. Expensive AND ineffective.
3. **Per-spec orientation is the wrong unit** — history columns are the unit of behavior. Testing from each parent-tab's perspective re-learns the schema per spec, mis-maps under duplicate headers (col 5 vs col 63 "Currency"), and gives zero coverage of columns no current spec writes.

### The pivot, stated plainly (Rutvik, verbatim)
> "We test hist directly once per hist spec run. Increases speed of other specs and only checks hist when hist spec runs, in which hist spec goes to root, changes, checks hist, repeats for each test case in hist spec."

**Operational meaning:**
- Non-HIST specs contain ZERO history code.
- Each of the **2 history surfaces** (Local Office Settings History 42-col, Location Management History 87-col) owns its own dedicated test suite.
- Tests organized **by hist column**. Per column: locate root, drive root through its states, save, read column, assert value.
- Discovery is batched MCP (one scoped session per root-tab group), never one mega-session — hallucinates.

---

## 2. Scope

**IN scope:** Local Office Settings History (42 cols), Location Management History (87 cols), 10 appended `TC-*-HIST` tests, helpers used exclusively by them, planning artifacts (test-case MDs, CSV exports, REQUIREMENTS.md §History language), 3 pending HIST plans, anomaly logging + auto-filer scaffold.

**OUT of scope:** Legacy History table, new history UI features, any module outside Local Office + Location Management, the structural hist specs (kept untouched).

---

## 3. Inventory-By-Identity — What Exists, Classified

### HUNTER (Requirements Agent)

| Artifact | Path + Lines | Classification | Notes |
|---|---|---|---|
| §Location Management History | [clients/encore/docs/REQUIREMENTS.md:826-961](clients/encore/docs/REQUIREMENTS.md) | **REVISE** | 87-col schema, snapshot model, NOT-TRACKED registry = domain knowledge, STAYS. Only the "integration-per-spec" language needs revision to reflect new pivot. |
| §Local Office Settings History | [REQUIREMENTS.md:1176-1273](clients/encore/docs/REQUIREMENTS.md) | **REVISE** | 42-col schema + LR-036 SVG rule = domain knowledge, STAYS. Language update only. |
| AGENT_RULES_ENCORE.md §E5, §E-UI-002, §E-MCP-001 | `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` | **KEEP** | Boolean rendering, sort behavior, click event gotchas. Domain-level, unchanged under pivot. |

### GIVER (Planner)

| Artifact | Path | Classification | Notes |
|---|---|---|---|
| 10 TC-*-HIST sections in test-case MDs | `clients/encore/specs_planning/test-cases/setup/**/*.md` (8 Location + 2 Local Office) | **DELETE** | Integration-per-spec sections, dead under pivot. Leave rest of each file intact. |
| `locations_management_history_test_plan.md` | `specs_planning/test-plans/setup/locations/` | **KEEP + EXTEND** | Structural 19-TC plan for dedicated hist tab. New per-column TC plan APPENDED under pivot — not replacing. |
| `local_office_settings_test_plan.md` (HIST section) | `specs_planning/test-plans/setup/local-office/` | **KEEP + EXTEND** | 42-col history section kept; extended with per-column plan. |
| 10 HIST rows in CSV exports | `clients/encore/exports/*.csv` | **DELETE (auto)** | Regenerated after MD strips via `to-csv.ts`. No exporter edits. |
| `to-csv.ts` exporter | `export_test_cases/to-csv.ts` | **KEEP** | No HIST-specific logic — generic CSV generator. No refactor needed. |
| `locations_management_history_test_cases.md` (19 structural TCs) | `specs_planning/test-cases/setup/locations/` | **KEEP + EXTEND** | Structural TCs stay; per-column TCs appended under pivot. |

### BUILDER (Generator)

| Artifact | Path + Lines | Classification | Notes |
|---|---|---|---|
| 10 TC-*-HIST test bodies | specs listed in §3.A | **DELETE** | Entire test block + imports of history page object + `suiteStartTime` module var. |
| `location-management-history.spec.ts` (19 TCs) | `tests/specs/setup/locations/` | **KEEP + EXTEND** | Structural only. New per-column tests added alongside (or in sibling files per root-tab). |
| `local-office-history.spec.ts` (7 TCs) | `tests/specs/setup/local-office/` | **KEEP + EXTEND** | Structural only. |
| `location-management-history.page.ts` (472 lines, full reader) | `src/pages/setup/locations/` | **KEEP ALL** | Every method re-used under new pivot. `parseModifiedOnMs`, `getRowsSinceTimestamp`, `waitForRecentTopRow`, `clickSortColumn` (Radix retry per LR-025) — critical for per-column tests. |
| History methods in `local-office-settings.page.ts` | `src/pages/setup/local-office/` | **KEEP ALL** | `navigateToHistoryTab`, `getHistoryColumnHeaderCount`, `isHistoryTableEmpty`, etc. Still needed. |
| `src/selectors/setup/locations/history.ts` | `src/selectors/setup/locations/` | **KEEP ALL** | Every selector used by structural + new per-column tests. |
| `location-management-history.data.ts` (column headers, row-1 baseline, options) | `tests/test-data/setup/locations/` | **KEEP ALL** | 87-col reference list is exactly what new per-column tests need. |
| `local-office-history.data.ts` | `tests/test-data/setup/local-office/` | **KEEP ALL** | Same reasoning. |
| `locationManagementHistoryPage` fixture (line 56) | `tests/setup/fixtures.ts` | **KEEP** | Just loses the 10 basic-info spec callsites. New hist specs use it. |
| `suiteStartTime` module vars (10 basic-info specs) | inline in each basic-info spec | **DELETE** | Exclusive to deleted TC-*-HIST tests. |
| Shared helpers (`parseModifiedOnMs`, `getRowsSinceTimestamp`, `waitForRecentTopRow`) | inside `location-management-history.page.ts` (methods, lines 197-359) | **KEEP (already on page object)** | Already lives on the page object — no migration needed. Basic-info specs just stop importing the page object. |

### HEALER

| Artifact | Location | Classification | Notes |
|---|---|---|---|
| Radix retry pattern in `clickSortColumn` | `location-management-history.page.ts` (method) | **KEEP** | LR-025 instance. Generalizable + still needed for new hist specs. |
| Reloaded Angular-dirty handling around HIST saves | `local-office-ect.spec.ts` TC-LOS-ECT-HIST | **DELETE-INSITU** (moves out when TC deletes) | Deletion is natural via SP-A2. The dirty-handling pattern is general (LR-026) and already generalized. |
| BUG-HIS-001 (EnableMultidayPricing NOT-TRACKED) | `reports/bugs/BUG-HIS-001.json` | **KEEP** | Valid bug; still holds under pivot. Feeds SP-E. |
| BUG-HIS-002 (Merchant NOT-TRACKED) | `reports/bugs/BUG-HIS-002.json` | **KEEP** | Same. |
| BUG-LOC-LOS-001 (Room Active save no-op) | `reports/bugs/` | **KEEP** | Unrelated to pivot. |
| `agent-mistakes.md` entries for HIST (GEN-042, PLN-048) | `specs_planning/_internal/` | **KEEP** | Domain knowledge (duplicate headers, MCP-verify-upfront) — valid under new pivot. |

### WATCHDOG (Audit)

| Artifact | Location | Classification | Notes |
|---|---|---|---|
| `PLAN_HIST_EXTERNAL_SP1_AUDIT.md` (done) | `plans/done/` | **KEEP** | Historical audit record. NF-001/NF-002 (sort aria + Radix trigger) are domain knowledge. |
| `PLAN_HIST_SP2_PER_TC_MCP_AUDIT.md` (done) | `plans/done/` | **KEEP** | MCP_VERIFICATION_LOG methodology — generalizable pattern, keep. |
| SP1 MCP_FINDINGS deliverable | `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` | **KEEP** | 87 + 42 column header lists + data-format rules = input for SP-B. |

### GARDENER

| Artifact | Classification | Notes |
|---|---|---|
| `plans/INDEX.md` | **KEEP (auto-regenerated)** | `npm run plans:reindex` rebuilds it. No manual work. |
| `scripts/plans-reindex.mjs` | **KEEP** | Not HIST-specific. |

### Framework Rules (root CLAUDE.md) + Agent Prompts

All **KEEP** — no rule or prompt tells agents to "append HIST per spec". They convey domain knowledge valid under either pattern:

| Rule/Prompt | What it conveys | Stays valid because |
|---|---|---|
| LR-034 (bug filing protocol) | How to file LR-034-compliant bugs | Used more under pivot (20–30 NOT-TRACKED bugs coming) |
| LR-036 (SVG vs Unicode boolean) | Branch helper by encoding | Per-column tests need this branching |
| GEN-042 (duplicate column headers) | Index-based access when header names repeat | Col 5 vs col 63 "Currency" — still needed |
| PLN-048 (MCP-verify history model upfront) | Don't design tests without MCP-proof | ACTUALLY ENDORSES the pivot (batched catalog approach) |
| HLR-010 (targeted test runs) | Running single HIST TC for RCA | Unchanged |
| AUD-015 (MCP_VERIFICATION_LOG completeness) | Every TC cites MCP evidence | Unchanged; stronger under pivot |
| LR-025 (Radix large-option retry) | Pattern in `clickSortColumn` | Unchanged |
| LR-026 (Angular dirty state) | Defensive handling around saves | Unchanged |

### NET DELETE LIST (short — the only things that are junk)

1. **10 TC-*-HIST test bodies** in 10 basic-info spec files
2. **10 `suiteStartTime` module vars** + their initializations in those 10 specs
3. **10 imports** of history page objects in those 10 specs (where added only for the HIST TC)
4. **10 TC-*-HIST sections** in 10 test-case MDs
5. **10 HIST rows in 10 CSV exports** (regenerated automatically, not manually stripped)
6. **3 pending plans marked SUPERSEDED + moved to done/**: `PLAN_HIST_INTEGRITY_HARDENING.md`, `PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md`, `SUBPLAN_HISTORY_08_BUG_REPORTS.md`
7. **Integration-per-spec language** (not the schema content) in REQUIREMENTS.md §History Tracking sections

**Nothing else gets deleted.** Every other artifact either stays untouched or is extended.

---

## 4. Top-Priority Subplan Index (TODAY'S DELIVERABLE)

**Group-1 (TOP PRIORITY — unblock everything):** Cleanup, plan disposition, doc language revision.
**Group-2:** Discovery — batched MCP catalog sessions (one per root-tab group).
**Group-3:** Implementation — per-column tests, per module/root-tab.
**Group-4:** Infrastructure — anomaly logging + auto-filer scaffold (parallel to Group-3).
**Group-5:** Bug filing + final audit.
**Group-6:** Framework rule/prompt sweep (low-priority sanity check).

```
GROUP 1 (TOP PRIORITY) — runs first, unblocks everything
  ├─ SP-A1  Purge: strip HIST TCs from 8 Location specs
  ├─ SP-A2  Purge: strip HIST TCs from 2 Local Office specs
  ├─ SP-A3  Purge: strip HIST sections from 10 test-case MDs + re-export CSVs
  ├─ SP-G   Plan disposition: supersede + move 3 pending plans + reindex
  └─ SP-H   Language revision: REQUIREMENTS.md §History Tracking (schema kept, "integration-per-spec" wording rewritten)

GROUP 2 — discovery, batched, sequential per surface
  Local Office (2-3 sessions):
    ├─ SP-B-LO-1  MCP catalog: Local Office Basic Info roots → 42-col mapping (first 15 parents)
    ├─ SP-B-LO-1b MCP catalog: Local Office Basic Info residual ~7 parents (spawned 2026-04-20 after SP-B-LO-1 hit 15-cap)
    ├─ SP-B-LO-2  MCP catalog: Local Office ECT roots → 42-col mapping
    └─ SP-B-LO-R  Reconcile Local Office orphan columns + write hist-root-map-local-office.md
  Location Management (10-11 sessions):
    ├─ SP-B-LM-1  MCP catalog: Currency tab roots → 87-col mapping
    ├─ SP-B-LM-2  MCP catalog: Pricing tab roots
    ├─ SP-B-LM-3a MCP catalog: Local Information tab roots (first half, ~20 parents)
    ├─ SP-B-LM-3b MCP catalog: Local Information tab roots (second half)
    ├─ SP-B-LM-4  MCP catalog: Account & Address roots
    ├─ SP-B-LM-5  MCP catalog: Legal roots
    ├─ SP-B-LM-6  MCP catalog: Notes roots
    ├─ SP-B-LM-7  MCP catalog: Shared Setup Locations roots
    ├─ SP-B-LM-8  MCP catalog: Auto Add-On roots
    ├─ SP-B-LM-9  MCP catalog: Top-level Basic Info roots (Name, Active, Live Date, etc.)
    └─ SP-B-LM-R  Reconcile Location Mgmt orphan columns + write hist-root-map-location-management.md

GROUP 3 — implementation, per module/root-tab, gated by respective catalogs
  Shared prep:
    └─ SP-D0  Create shared hist-test utilities (hist-reader.ts, assertBooleanCell, assertNoTrackedFor)
  Local Office (grows existing local-office-history.spec.ts):
    ├─ SP-C1  Basic Info column tests (TC-LOSH-*-STATE/FID/MOD/ORPH per column)
    └─ SP-C2  ECT column tests (same template)
  Location Management (new files under tests/specs/setup/locations/history/):
    ├─ SP-D1  location-hist-currency.spec.ts
    ├─ SP-D2  location-hist-pricing.spec.ts
    ├─ SP-D3a location-hist-local-info.spec.ts (part A)
    ├─ SP-D3b location-hist-local-info.spec.ts (part B)
    ├─ SP-D4  location-hist-account-address.spec.ts
    ├─ SP-D5  location-hist-legal.spec.ts
    ├─ SP-D6  location-hist-notes.spec.ts
    ├─ SP-D7  location-hist-shared-setup.spec.ts
    ├─ SP-D8  location-hist-auto-addon.spec.ts
    ├─ SP-D9  location-hist-top-level.spec.ts
    └─ SP-D10 location-hist-orphans.spec.ts (columns with no clear root)

GROUP 4 — infrastructure (can run parallel to Group 3)
  ├─ SP-F1  Anomaly writer utility + JSON schema + Playwright afterEach wiring
  └─ SP-F2  Auto-bug-filer script + dedup logic + dry-run digest

GROUP 5 — audit & bug filing (gated on user approval per LR-034)
  ├─ SP-E-LO   File LO NOT-TRACKED bugs (batch)
  ├─ SP-E-LM-CUR File Currency NOT-TRACKED bugs (CUR-BUG-A/B/C)
  ├─ SP-E-LM-OTHER File remaining Location NOT-TRACKED bugs (grouped)
  └─ SP-J      WATCHDOG final cross-pivot audit

GROUP 6 — sanity sweep (low-priority, non-blocking)
  ├─ SP-K1  Framework rules sweep: confirm no OLD-pattern language remains
  └─ SP-K2  Agent prompts sweep: confirm no OLD-pattern instructions remain
```

---

## 5. Subplan Catalog — Session-Sized, Cause-Stated

Each subplan below is designed to fit one focused session (1–3 hours max, bounded scope, clear deliverable). Expanding each into its own `plans/pending/SUBPLAN_HIST_PIVOT_*.md` file happens at the start of SP-G.

---

### SP-A1 — Purge HIST TCs from 8 Location specs
- **Cause**: Non-HIST specs must not carry HIST code under the pivot.
- **Skills**: /cleanup, /regression-guard (before+after)
- **Scope (one session)**: 8 spec files. Delete ONLY the test block + `suiteStartTime` var + history page object import.
  - `location-currency.spec.ts` lines 11, 36, 331-377 + import line 26
  - `location-local-information.spec.ts` lines 22, 27, 419-485 + import
  - `location-pricing.spec.ts` lines 25, 30, 610-670 + import
  - `location-account-address.spec.ts` lines 13, 18, 301-348 + import
  - `location-legal.spec.ts` lines 14, 19, 198-244 + import
  - `location-notes.spec.ts` lines 20, 25, 371-410 + import
  - `location-shared-setup-locations.spec.ts` lines 14, 19, 393-443 + import
  - `location-auto-addon.spec.ts` lines 9, 14, 264-303 + import
- **KEEP list (DO NOT touch)**: any non-HIST test, any page object import unrelated to HIST, any fixture param unrelated to HIST, surrounding describe.serial structure.
- **Guard**: `/regression-guard` fingerprint before first edit; re-run after; diff must show ONLY the HIST deletions.
- **Deliverable**: 8 specs cleaned, all prior non-HIST tests still passing.
- **Estimated**: one session.

---

### SP-A2 — Purge HIST TCs from 2 Local Office specs
- **Cause**: Same as SP-A1, scoped to Local Office.
- **Skills**: /cleanup, /regression-guard
- **Scope**:
  - `local-office-settings.spec.ts` TC-LOS-BAS-HIST line 839 + fixture references + any `suiteStartTime` var
  - `local-office-ect.spec.ts` TC-LOS-ECT-HIST line 248 + same
- **KEEP list**: all prior TCs, Angular dirty-state handling (LR-026) unless exclusive to the deleted TC, Save button pollwait helpers.
- **Guard**: same as SP-A1.
- **Estimated**: one session.

---

### SP-A3 — Strip HIST sections from 10 test-case MDs + re-export CSVs
- **Cause**: Test-case MDs must match the surviving spec code. CSVs are a mirror of MDs.
- **Skills**: /cleanup
- **Scope**: 10 markdown files. Delete the `## TC-*-HIST: ...` section + any sub-bullets. Do NOT touch any other TC sections.
  - `locations_account_address_test_cases.md:387`
  - `locations_auto_addon_test_cases.md:474`
  - `locations_currency_test_cases.md:406`
  - `locations_legal_test_cases.md:448`
  - `locations_local_information_test_cases.md:1144`
  - `locations_notes_test_cases.md:393`
  - `locations_pricing_test_cases.md:497`
  - `locations_shared_setup_locations_test_cases.md:552`
  - `local_office_settings_test_cases.md:1709` (TC-LOS-BAS-HIST)
  - `local_office_settings_test_cases.md:1741` (TC-LOS-ECT-HIST)
- **Then**: run the CSV exporter to regenerate `clients/encore/exports/*.csv`.
- **KEEP list**: `locations_management_history_test_cases.md` (19 dedicated TCs) — untouched.
- **Guard**: diff exports before/after — should show only HIST row removals.
- **Estimated**: one session.

---

### SP-G — Plan disposition (supersede 3 pending HIST plans)
- **Cause**: In-flight plans documenting the OLD approach mislead future agents. Stamp them SUPERSEDED, move to done/, reindex.
- **Skills**: /planning (leaf task)
- **Scope**:
  1. `PLAN_HIST_INTEGRITY_HARDENING.md` — add header note: `**Status**: SUPERSEDED by PLAN_HIST_COLUMN_FIRST_PIVOT. D5/D6 inherited as SP-F.`
  2. `PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md` — same. Note Phase 0 artifacts still valid, Phase 2 retired.
  3. `SUBPLAN_HISTORY_08_BUG_REPORTS.md` — same. Folded into SP-E.
  4. `git mv` all three from pending/ to done/.
  5. This master plan: copy from `C:\Users\rutvi\.claude\plans\load-up-knowledge-on-structured-sonnet.md` to `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md`.
  6. For each SP-A…SP-K entry, author its own `plans/pending/SUBPLAN_HIST_PIVOT_*.md` by copying its section from this master.
  7. Run `npm run plans:reindex`.
  8. Append LR-028 activity-log row with current wall-clock time (LR-037 preflight).
- **KEEP list**: `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` — stays as artifact. All done/ plans — stay historical.
- **Estimated**: one session.

---

### SP-H — REQUIREMENTS.md §History Tracking language revision
- **Cause**: Docs describe the integration-per-spec pattern. Language, not content, needs updating so future agents don't re-create the old flow.
- **Skills**: /planning
- **Scope**: Two sections, language-only edits:
  - §Location Management History (lines 826-961): keep 87-col schema, snapshot model, NOT-TRACKED registry, cross-system independence. Rewrite any sentence that says "verified by each spec on save" → "verified by `location-hist-*.spec.ts` per-column tests driven by the hist-root-map catalog".
  - §Local Office Settings History (lines 1176-1273): same pattern. Keep the LR-036 SVG note + 42-col schema + TC-LOS-HIS-003 correction note.
  - Add a pointer to the forthcoming `clients/encore/specs_planning/catalogs/hist-root-map-*.md` files.
- **KEEP list**: all schema content, all NOT-TRACKED registries, all data-format rules, all MCP-verification dates, all cross-system independence rules.
- **Estimated**: one session.

---

### SP-B-LO-1..2 + SP-B-LO-R — Local Office discovery (3 sessions)
Each session template:
- **Cause**: Catalog root→column mappings for one scoped area without context-overflow or hallucination.
- **Skills**: /research (MCP-driven), /planning
- **Per-session scope**: one tab or sub-scope (≤15 parent fields). Walk each parent → alter state → save → diff 42-col row → record mapping + evidence.
- **Per-session output**: `clients/encore/specs_planning/catalogs/hist-root-map-local-office-{tab}.md`
- **SP-B-LO-R** merges per-session files into `hist-root-map-local-office.md`, reconciles orphan columns, produces final registry (TRACKED / NOT-TRACKED / DUPLICATE / BOOLEAN-ENCODED).
- **KEEP list**: existing `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` 42-col header list — input, not output.
- **Estimated**: one session each.

---

### SP-B-LM-1..9 + SP-B-LM-R — Location Management discovery (11 sessions)
Identical template to SP-B-LO-*, one session per root-tab group. SP-B-LM-3 splits into 3a/3b because Local Info has ~40 parents. SP-B-LM-R is the merge + orphan reconciliation session.

Per-session outputs: `catalogs/hist-root-map-location-management-{tab}.md`. Final: `hist-root-map-location-management.md`.

- **Hard rule per session**: ≤15 parent fields per session; if a tab has more, split further. Never let one session attempt the full 87 cols.
- **KEEP list**: `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` 87-col list.

---

### SP-D0 — Shared hist-test utilities
- **Cause**: SP-C/D files will re-implement the same helpers without this.
- **Skills**: /execute
- **Scope (one session)**: create `clients/encore/src/utils/hist-reader.ts` exporting:
  - `readHistoryRowSince(page, sinceMs, headerList)` (thin wrapper over page-object helper)
  - `diffRowsByCol(row, priorRow)` → `{col, header, prev, now}[]`
  - `assertNoTrackedFor(row, substrings[])` → hard-fails if any substring matches any cell
  - `assertBooleanCell(cell, expected, encoding: 'unicode' | 'svg')` (LR-036 aware)
  - `assertRowCountUnchanged(before, after)` for negative cases
- **KEEP list**: all existing page object methods. This file is NEW, no overlap.
- **Deliverable**: `hist-reader.ts` + unit tests against DOM fixtures.
- **Estimated**: one session.

---

### SP-C1 — Local Office HIST column tests: Basic Info columns
- **Cause**: Per-column coverage for the Basic Info root-tab subset of the 42-col Local Office history.
- **Skills**: /execute, /regression-guard, /find-bugs
- **Scope (one session)**: add per-column `describe()` blocks to existing `local-office-history.spec.ts` for each Basic-Info-rooted column in the catalog. Template:
  ```ts
  describe('Col N — <HeaderName> [root: <RootField>]', () => {
    // State-space TCs per control-type taxonomy
    // Metadata TC
    // NOT-TRACKED/orphan TC (if applicable)
    // Fidelity TC (other unrelated saves don't mutate col N)
  });
  ```
- **KEEP list**: existing 7 structural TCs (untouched), page object methods (re-used).
- **Estimated**: one session if Basic Info accounts for ≤15 columns. Otherwise split C1a/C1b.

---

### SP-C2 — Local Office HIST column tests: ECT columns
- Same template as SP-C1, scoped to ECT-rooted columns.
- **Estimated**: one session.

---

### SP-D1..D10 — Location Management HIST per-column tests (one spec file per root-tab)
Each session template:
- **Cause**: Per-column coverage for one root-tab, one new spec file.
- **Skills**: /execute, /regression-guard, /find-bugs
- **Scope (one session)**: create `tests/specs/setup/locations/history/location-hist-<tab>.spec.ts`. One describe() per column whose root lives on <tab>. Template identical to SP-C1.
- **File size rule**: if a tab drives >20 columns (e.g., Local Info), split into -a/-b files OR describe blocks, whichever keeps session under ~1500 LOC.
- **KEEP list**: structural `location-management-history.spec.ts` untouched. Page object untouched. Selectors untouched.
- **D10 (orphans)**: columns with no clear root anywhere. Pure NOT-TRACKED / phantom-row guard tests.
- **Estimated**: one session each (10-11 total sessions).

---

### SP-F1 — Anomaly writer utility + schema + afterEach wiring
- **Cause**: Inherited D5 from superseded plan. Structured failure artifacts enable auto-filing later.
- **Skills**: /execute
- **Scope (one session)**:
  - Create `src/utils/hist-anomaly-writer.ts` with `emitAnomaly(spec, tc, anomaly)` writing to `reports/bugs/anomalies/{YYYY-MM-DD}/{testId}-{seq}.json`.
  - JSON schema copied verbatim from superseded PLAN_HIST_INTEGRITY_HARDENING D5 (still correct).
  - Wire into Playwright `afterEach` for hist spec files only.
  - Add `reports/bugs/anomalies/` to `.gitignore`.
- **KEEP list**: existing diagnostics collector — untouched.
- **Estimated**: one session.

---

### SP-F2 — Auto-bug-filer script + dedup + dry-run digest
- **Cause**: Inherited D6. Closes the loop from anomaly JSON → LR-034 bug candidate. Ships dry-run only.
- **Skills**: /execute
- **Scope (one session)**:
  - Create `scripts/anomaly-to-bug.mjs` (dry-run default).
  - Dedup against existing `reports/bugs/BUG-*.json`.
  - Emit `reports/bugs/auto-filer-dryrun-{date}.md` digest.
  - Wire `npm run hist:anomaly-filer`.
  - Document `HIST_AUTO_FILE=true` flag for future live mode.
  - Unit tests against synthetic anomaly fixtures.
- **KEEP list**: LR-034 protocol unchanged; script respects its dedup rules.
- **Estimated**: one session.

---

### SP-E-LO + SP-E-LM-CUR + SP-E-LM-OTHER — Bug filings (gated)
Each session template:
- **Cause**: File LR-034-compliant bugs for catalog-confirmed NOT-TRACKED roots + same-parent-duplicate columns. Batched per surface so user triage is bounded.
- **Skills**: /find-bugs, /audit
- **Gate**: explicit user approval per LR-034 before any BUG-*.json write.
- **Scope per session**: one cohesive batch (Local Office, Currency, or other-Location). Each bug cites catalog evidence + MCP session date. Dedup check against existing bugs first.
- **KEEP list**: existing BUG-HIS-001, BUG-HIS-002, BUG-LOC-LOS-001 — new bugs dedup against these.
- **Estimated**: one session per batch.

---

### SP-J — WATCHDOG final cross-pivot audit
- **Cause**: After SP-A through SP-E complete, audit that (a) no HIST code remains in basic-info specs, (b) every catalog column has a test, (c) every NOT-TRACKED parent has a bug or a documented exemption, (d) structural hist specs still pass, (e) anomaly writer emits correctly on a seeded failure.
- **Skills**: /audit
- **Scope (one session)**: grep-based structural audit + run full HIST test suite + seed a known corruption to prove failure → anomaly JSON path.
- **Deliverable**: audit report in `plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md`.
- **Estimated**: one session.

---

### SP-K1 — Framework rules sweep (sanity)
- **Cause**: Confirm no LR-* or LR-ENC-* rule endorses OLD pattern. Current inventory says none do — this is a sanity check.
- **Skills**: /audit
- **Scope (one session)**: grep root CLAUDE.md, `clients/encore/CLAUDE.md`, `AGENT_SHARED_RULES.md` for HIST-related rules. Verify each is domain-knowledge, not process-directive. Document findings.
- **Expected deliverable**: a report that reads "no revisions needed" — or, if anything is found, the specific rule + proposed replacement wording.
- **Estimated**: one session.

---

### SP-K2 — Agent prompts sweep (sanity)
- **Cause**: Same, for agent prompt files.
- **Skills**: /audit
- **Scope (one session)**: grep `.github/agents/*.agent.md`, `.github/copilot-instructions.md`, `.claude/agents/*.agent.md` for HIST / "integration per spec" / TC-*-HIST. Flag any prompt language that directs agents to re-append HIST to basic-info specs. Expected: none found.
- **Estimated**: one session.

---

## 6. Dependency Graph

```
[SP-G, SP-H] (Group 1: plan + docs disposition) ─┐
[SP-A1, SP-A2, SP-A3] (Group 1: code cleanup)    │
                                                   ├─→ [SP-B-LO-*] ─┬─→ [SP-B-LO-R] ─→ [SP-C1, SP-C2]  ──┐
                                                   │                 │                                      ├─→ [SP-E-LO] ─┐
                                                   ├─→ [SP-B-LM-*] ─┴─→ [SP-B-LM-R] ─→ [SP-D0] ─→ [SP-D1..D10] ─→ [SP-E-LM-*] ─┤
                                                   │                                                                            │
                                                   │                                       [SP-F1, SP-F2] (parallel) ─────────┤
                                                   │                                                                            │
                                                   └─→ [SP-K1, SP-K2] (parallel, low priority) ─────────────────────────────────┴─→ [SP-J] (final audit)
```

---

## 7. Verification — End-to-End Acceptance

1. `grep -rn "TC-.*-HIST" clients/encore/tests/specs/setup/ --include="*.spec.ts"` returns zero hits outside of `tests/specs/setup/locations/history/` and `local-office-history.spec.ts`.
2. `location-management-history.spec.ts` (structural 19 TCs) passes unchanged.
3. `local-office-history.spec.ts` (structural 7 TCs) passes unchanged.
4. `hist-root-map-local-office.md` and `hist-root-map-location-management.md` cover 42/42 and 87/87 columns respectively; zero unresolved `UNKNOWN_ROOT`.
5. Every column has at least one state-space TC + one metadata TC + one fidelity or orphan TC.
6. Seeding a known app corruption (e.g., API writes a field, skips save-hook) causes exactly one HIST TC to fail AND emits one anomaly JSON.
7. `scripts/anomaly-to-bug.mjs` dry-run on that anomaly produces a sensible digest.
8. REQUIREMENTS.md §History Tracking regenerated matches catalogs exactly; no mention of "each spec verifies" remains.
9. All 10 basic-info specs run faster (HIST tax removed).
10. Activity-log rows all pass `npm run validate:activity-log:preflight`.
11. `npm run plans:reindex:check` reports clean.

---

## 8. Adversarial Audit (/ultrathink)

**Q1. User worries about over-delete. Does the KEEP list cover everything useful?**
Yes — §3 classifies every identity's deliverable. The NET DELETE LIST is 7 bounded items. Everything else is KEEP or KEEP+EXTEND. Each subplan includes its own KEEP list reminder to block over-reach.

**Q2. User worries about hallucination in agent sessions. Are subplans small enough?**
Group-2 discovery sessions capped at ≤15 parents per session (3a/3b split for Local Info). Group-3 implementation sessions capped at ~20 columns per file or split. Group-1 cleanup sessions scoped to discrete file sets (8 specs / 2 specs / 10 MDs). No session attempts multi-hour sprawling work.

**Q3. Catalog sessions still hallucinate root→column mappings. Mitigation?**
Each mapping row cites: MCP session date, specific save timestamp, before/after row diff. Downstream Group-3 tests verify each mapping — if hallucinated, the test fails and catalog gets corrected. Bounded blast radius.

**Q4. What about the structural hist specs — could SP-A3 accidentally strip the dedicated `locations_management_history_test_cases.md`?**
SP-A3 scope explicitly names the 10 files + exact `## TC-*-HIST` section. `locations_management_history_test_cases.md` is NOT in that list. KEEP list reiterates it.

**Q5. Shared helpers (`parseModifiedOnMs`, `getRowsSinceTimestamp`) — will SP-A mistakenly delete them?**
They live ON the page object `location-management-history.page.ts`, not in basic-info specs. SP-A1 only deletes imports and test bodies. Page object is untouched. KEEP list confirms.

**Q6. What if a basic-info spec uses `locationManagementHistoryPage` for something OTHER than the HIST TC?**
SP-A1 includes a guard step: before removing the import, grep the file for all usages of the page object. If only the TC uses it, remove. If other usages exist, keep the import. Regression-guard confirms post-state.

**Q7. Framework rule SP-K1/K2 marked low priority — what if they're actually critical?**
Current inventory reports ZERO OLD-pattern prompts/rules. SP-K1/K2 are sanity sweeps — ≤1 session each, near-zero effort. If anything is found, it's trivial to revise at that point.

**Q8. Anomaly writer SP-F1 — could it slow every HIST spec run?**
Writer only runs in `afterEach` on test failure (not on pass). Writes one JSON file per failure. Zero overhead on green runs.

**Q9. Per-identity inventory — did I cover all identities?**
HUNTER ✓ GIVER ✓ BUILDER ✓ HEALER ✓ WATCHDOG ✓ GARDENER ✓. OWNER not a pipeline role; no OWNER-specific HIST artifacts.

**Q10. Bug filings gated on user approval — what if user approves one batch, not another?**
Each SP-E-* is an independent batch with its own gate. User can greenlight Local Office but defer Location Mgmt. No forced all-or-nothing.

**Q11. SP-D10 orphan spec — what if there are no orphans?**
Then SP-D10 becomes a no-op session (or the file never exists). Zero harm. Catalog reconciliation (SP-B-LM-R) determines if it's needed.

**Q12. /relevant skill usage — is every subplan tagged with correct skills?**
Every subplan lists its primary skill(s). /cleanup + /regression-guard for purges, /research + /planning for discovery, /execute + /find-bugs for implementation, /audit for final + rule/prompt sweeps, /planning for doc disposition.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Catalog session drifts past scope (attempts too much) | Per-session cap of ≤15 parent fields; session template enforces scope discipline |
| Basline office 1604 state pollution between sessions | SP-A adds no new pollution; SP-B sessions each restore start state before exiting; per-spec LR-019 baselines |
| App adds columns mid-pivot | Catalogs are dated; re-run single affected SP-B-* session |
| Shared helper SP-D0 ships late and blocks SP-C/D | SP-D0 is session 1 of Group-3; block is ~3 hours max; workable |
| Anomaly writer SP-F1 emits on test-logic bugs | Ships dry-run only through SP-F2; manual triage until dedup validated |
| Framework rule/prompt sweep (SP-K1/K2) surprises us with a real find | Non-blocking — can be patched inline; doesn't gate Group-3 |
| Cleanup SP-A reveals unexpected spec coupling | /regression-guard diff catches it; fix forward |
| User changes mind mid-pivot | Everything is git-recoverable. Superseded plans in done/. |

---

## 10. Out-of-Band Notes

- Master plan currently at plan-mode-required path `C:\Users\rutvi\.claude\plans\load-up-knowledge-on-structured-sonnet.md`. SP-G moves it to `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` and splits every SP-* entry into its own `plans/pending/SUBPLAN_HIST_PIVOT_*.md`.
- SUPREME RULE compliance: every major design decision cites a Rutvik answer (file layout per-module-subplan, batched discovery, full delete, session-sized subplans, KEEP-list discipline). No silent assumptions.
- Identity while planning: OWNER. Execution subplans each auto-load correct identity via Identity Gate.
- LR-028/LR-037: activity-log row appended at session end with current wall-clock time.
- Naming: "PLAN_HIST_COLUMN_FIRST_PIVOT" picked for unmistakable index visibility. Open to rename at SP-G time.

---

## UPDATE (2026-04-22) — AUDIT RECOMMENDATION (append-only; original plan above is intact)

> **Execution-chain directive** — every subplan that has received an `## UPDATE (2026-04-22)` block must be treated as having TWO candidate paths. Execution agents read the original plan AND the UPDATE, verify claims independently against the live codebase, and choose by evidence — not by recency. See the standard "Execution-agent directive" at the top of each amended subplan.

**Audited by**: /ultrathink + /audit + /planning (Opus, 2026-04-22)
**Audit plan**: `~/.claude/plans/3-shared-utils-temporal-kahan.md`

### Finding
Cross-pivot audit reviewed all 40 subplans against existing codebase artifacts + prior reusable utilities. Core architecture (column-first test pivot, anomaly pipeline, WATCHDOG final gate) is sound. Three packaging adjustments recommended — none change the 129-column test deliverable or the chain order.

### Amendments (see each subplan's UPDATE block for evidence)

| Subplan | Recommendation | Reason |
|---|---|---|
| [SP-19 D0 SHARED_UTILS](SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md) | Kill `hist-reader.ts`; replace with 15-LOC patch on `location-management-history.page.ts`. No new file, no helper unit tests. | Readers already exist on page objects. 3 of 5 proposed helpers duplicate existing methods. Unit tests on Playwright test helpers = meta-testing. |
| [SP-14 B-LM-6 NOTES](SUBPLAN_HIST_PIVOT_14_B_LM_6_NOTES_CATALOG.md) + [SP-15 B-LM-7 SHARED_SETUP](SUBPLAN_HIST_PIVOT_15_B_LM_7_SHARED_SETUP_CATALOG.md) | Optional merge into single MCP session (≤4 parents combined). Second subplan becomes no-op. | Ceremony overhead ≥ work when parent count is ≤4. Retain bug-investigation isolation if SSL save produces zero rows. |
| [SP-38 J FINAL_AUDIT](SUBPLAN_HIST_PIVOT_38_J_FINAL_AUDIT.md) | Extend §Scope checklist from 22 to 24 items — absorb K1 + K2 as grep items #23 + #24. | Both K1 and K2 self-describe as "expected outcome: zero revisions needed." Greps belong inside J. |
| [SP-39 K1](SUBPLAN_HIST_PIVOT_39_K1_RULES_SWEEP.md) + [SP-40 K2](SUBPLAN_HIST_PIVOT_40_K2_PROMPTS_SWEEP.md) | Conditional-on-J-grep. Default: SKIP (mark DONE-conditional-skipped) if J's §23/§24 report zero hits. Execute full sweep only if J finds hits. | Standalone sessions to re-confirm precomputed null are ceremony. |

### NOT changing (user steered green on keeping separate — 2026-04-22)
- **D2..D10 per-column test subplans** — cold-start per subplan protects context budget (LR-018). Merging into one multi-phase subplan accumulates 6+ tabs of catalog + spec context, risks past 200k tokens and compaction.
- **E-LO / E-LM-CUR / E-LM-OTHER bug-filing subplans** — same cold-start argument + already user-gated. Merging bloats context per batch.
- **B-LM-5 Legal, B-LM-8 Auto Add-On, B-LM-9 Top-level catalog subplans** — kept separate despite 4-parent counts; cold-start discipline wins here too.

### Floor revised
- Original: 40 subplans.
- Post-audit: **37 effective subplans** if all 3 recommendations taken (K1/K2 skipped, B-LM-6+7 merged).
- Chain order, dependency graph, and 129-column test coverage UNCHANGED.

### Execution protocol
Each amended subplan has:
1. A top-of-file "Execution-agent directive" requiring verification before choosing path (a) or (b).
2. A dated Finding + Proposed alternative path + Evidence + Risk sections.
3. Cross-references to this master plan's UPDATE and to `~/.claude/plans/3-shared-utils-temporal-kahan.md`.

Agents must never silently adopt either path — always read both, spot-check claims, document the disposition in activity-log.

---

## UPDATE #2 (2026-04-22) — USER PRE-APPROVED EXECUTION DECISIONS

Two execution-time decisions pre-approved by user (2026-04-22) — downstream agents do NOT re-deliberate:

### 1. SP-D0 path = forced to (b)
[SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md](SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md) has a second UPDATE block closing the path-choice. Agent executes the 15-LOC patch on `location-management-history.page.ts` directly; does NOT create `src/utils/hist-reader.ts` or helper unit tests. Still runs LR-020 grep to confirm the 4 function refs exist; HALTs if any have moved since 2026-04-22 (do not silently fall back to path a).

### 2. SP-D1 template location = forced to `_internal/`
[SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md](SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) has a dated UPDATE block redirecting template creation from `clients/encore/docs/hist-spec-template.md` to `clients/encore/specs_planning/_internal/hist-spec-template.md`. Reason: `clients/encore/docs/` does not exist in this repo; creating it would orphan a top-level folder with no convention anchor. `_internal/` already houses agent-facing internal artifacts.

### Downstream ripple
- Any SP-D2..D10 subplan that references the template resolves it at the `_internal/` path.
- [SUBPLAN_HIST_PIVOT_38_J_FINAL_AUDIT.md](SUBPLAN_HIST_PIVOT_38_J_FINAL_AUDIT.md) §Scope item 19 ("Template exists at `clients/encore/docs/hist-spec-template.md`") MUST be reinterpreted as `clients/encore/specs_planning/_internal/hist-spec-template.md` during the audit. If the grep/exists check is run against the old path, it will report a false fail.
- All downstream import statements in per-column spec files stay unaffected — the template is a doc, not code; nothing imports from it.

### Why these approvals are pushed into subplan UPDATE blocks (not here only)
To save downstream execution-agent time. Forcing the decision at the subplan-level means Phase 0 skips deliberation. Audit evidence + user approval live with the decision, not in a separate channel.


## UPDATE #3 (2026-04-22) — LR-040 graduation (append-only)

SP-B-LM-2 premature-DONE incident graduated **LR-040** (root CLAUDE.md) — subplan closure completeness gate. Every remaining SP-B-*, SP-C-*, SP-D-* must classify gaps as (a) MCP-proven / (b) grep-verifiable recipient / (c) user-flagged discussion-item or bug-candidate. Full context: `plans/done/PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE.md`.
