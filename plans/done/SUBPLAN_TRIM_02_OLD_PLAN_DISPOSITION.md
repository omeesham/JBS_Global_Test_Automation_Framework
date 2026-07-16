# SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION — per-item disposition of the stale cleanup-plan family (supersede with audit trail)

**Status**: DONE
**Executed**: 2026-07-16
**Priority**: P0
**Created**: 2026-06-12
**Identity**: OWNER
**Parent**: PLAN_LOSSLESS_DEEP_TRIM.md
**Depends on**: SUBPLAN_TRIM_01_COMMIT_PENDING_DELETIONS.md
**Blocks**: SUBPLAN_TRIM_03_PLAN_CORPUS_HYGIENE.md, SUBPLAN_TRIM_04_SCRIPTS_DEADWEIGHT.md, SUBPLAN_TRIM_05_EXPORT_CONVERTERS.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

A stale cleanup-plan family in `plans/pending/` predates the 2026-04-30 client rebuild and the 2026-06-05 POM restructure; much of what they target moved or vanished. Per user decision (2026-06-12): supersede with a per-item audit trail — Status flips + provenance pointers only, NO plan file is ever deleted. Disposition must precede the execution wave so exactly one plan governs each deletion category (otherwise e.g. SUBPLAN_REPO_04/11 and RCD_B/C both claim `scripts/`). Ledger row 2 of the parent.

**Disposition set (12 files)**: PLAN_MASTER_REPO_CLEANUP, SUBPLAN_REPO_03_AGENT_FILE_RESTRUCTURE, SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE, SUBPLAN_REPO_05_DEAD_CODE_REUSABILITY, SUBPLAN_REPO_06_DOC_MD_SLOP_AUDIT, SUBPLAN_REPO_07_SLOP_PREVENTION, SUBPLAN_REPO_10_SOURCE_CODE_QUALITY, SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT, SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT, PLAN_CODEBASE_CLEANUP, PLAN_MAINTAINER_SWEEP, PLAN_FULL_CHAIN_AUDIT (cleanup-relevant Category A slice only — Categories C/D are code-bug findings, untouched).

**Explicitly NOT dispositioned**: SUBPLAN_REPO_08_RENAME_JBS (annotate "parked — out of trim scope per user 2026-06-12", stays PENDING); SP-DQU-26/27/28 (own chain); SUBPLAN_RCD_B/C (live, adopted by parent).

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` · `/regression-guard` · `/relevant` · `/final-q`

**Context files**:
- `plans/done/PLAN_LOSSLESS_DEEP_TRIM.md` (§Re-Proof Protocol, §Untouchables, §Ledger row 2)
- `.claude/rules/pipeline.md` (LR-020/027/035/046/048/050)
- `.claude/rules/plan-closure.md` (LR-055 — flips here are to SUPERSEDED, not DONE, so the closure gate does not fire; verify no file is flipped to DONE in this session)
- `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm SUBPLAN_TRIM_01 is in `plans/done/`.
2. Read `.claude/context/navigation.md` + `agent-mistakes.md` (ALL-*). LR scan. BrowserTool=none.

(Phase 0.5b not applicable — disposition of plan files, no live-app or TC-correction output.)

---

## Phase 1 — Per-plan disposition (the audit trail)

For EACH of the 12 files:

1. Read the plan fully. Build a **per-line-item disposition table** in this subplan's Execution Summary: each concrete target/claim → `already-done (by <plan/commit>)` | `target-gone (restructure: <which>)` | `still-valid → migrated to <TRIM_xx/RCD_x ledger row or next-batch ledger>` | `unverifiable (note)`. Spot-verify each `still-valid` with a live grep/glob (LR-020) — survey verdicts are hypotheses.
2. **Decision rule (pre-approved by user)**: <50% of items still-valid → flip `**Status**:` to `SUPERSEDED` + add provenance line `Superseded by plans/done/PLAN_LOSSLESS_DEEP_TRIM.md (2026-06-12 deep-trim disposition; per-item table in SUBPLAN_TRIM_02 Execution Summary)`. ≥50% still-valid → surgical path-patch instead (update stale paths, keep PENDING) and flag in handoff.
3. `still-valid` orphan items that NO existing ledger row covers → record in `## Next-batch ledger` (no action; user approval round required).
4. PLAN_FULL_CHAIN_AUDIT: disposition ONLY Category A (rule-registry integrity) items; annotate the plan that A-items moved/were-checked, leave C/D untouched and Status unchanged unless wholly stale.

## Phase 2 — Annotations

5. SUBPLAN_REPO_08_RENAME_JBS: add one line under Context — "Parked: out of deep-trim scope per user decision 2026-06-12 (see PLAN_LOSSLESS_DEEP_TRIM)". Status stays PENDING.
6. SUBPLAN_RCD_C_ENV_REPORTS_CRUFT: verify the provenance amendment exists (added at trim authoring 2026-06-12): counts stale → regenerate in-session from `git ls-files`/`git status`; Re-Proof Protocol governs. Add it if missing.

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW only for parent-ledger items; everything else → next-batch ledger (no bare "out of scope" — LR-040/LR-046).

---

## Acceptance criteria (LR-040 closure gate)

- [ ] All 12 files dispositioned — each has a per-line-item table in the Execution Summary; every `still-valid` item names its migration target (grep-verifiable) or sits in the next-batch ledger. (LR-040 (b) classification for every enumerated item.)
- [ ] Zero plan files deleted; zero Status flips to DONE (SUPERSEDED/annotation edits only).
- [ ] REPO_08 annotated parked; RCD_C provenance note verified present.
- [ ] `npm run plans:reindex` run after flips (LR-035) — INDEX regenerates clean.
- [ ] Activity-log row per LR-028; `/final-q` verdict per LR-042.

## Verification

```bash
grep -l "SUPERSEDED" plans/pending/PLAN_MASTER_REPO_CLEANUP.md plans/pending/SUBPLAN_REPO_0*.md plans/pending/SUBPLAN_REPO_1*.md plans/pending/PLAN_CODEBASE_CLEANUP.md   # lists the flipped subset
grep -c "disposition" plans/pending/SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md   # Execution Summary tables present
npm run plans:reindex:check 2>/dev/null || npm run plans:reindex -- --check   # INDEX not stale
```

## Handoff (post-execution)

Chat-only. Outcome: per-plan disposition tables, which plans flipped SUPERSEDED vs path-patched, migrated items per ledger row, next-batch ledger contents. TRIM_03 inherits the flip list for its move pass.

---

## Execution Summary

**Executed**: 2026-07-16 (disposition work complete). This session applied SUPERSEDED flips + annotations only — **zero DONE flips** (per Bootstrap LR-055 note). Status flip of THIS subplan to DONE + `git mv` to `done/` + `npm run plans:reindex` are reserved for the dispatcher at acceptance per session instructions.

**Method (LR-020)**: every staleness citation was re-verified against the live tree (globs/greps, 2026-07-16) before its disposition was written — survey verdicts treated as hypotheses. Repo state re-confirmed: root `src/` is now shared-framework-only (`src/utils`, `src/data/adapters`, `src/framework-contracts`, `src/common`); the client POM lives at `clients/encore/src/`; `pipeline/` (NOT `.claude/pipeline/`) is the runtime; agent files + the mistake registry moved to `clients/encore/specs_planning/_internal/`; `.github/agents/` is gone (agent prompts at `.claude/agents/*.md`). Confirmed ABSENT at root: `tests/`, `src/core`, `src/infra`, `src/orchestrator`, `src/worker`, `src/pages`, `src/selectors`, `.playwright-mcp/`, `logs/`, `allure-report/`, `allure-results/`, `cli and mcp in our repo.md`, `encore_delivery/`, `REQUIREMENTS.md`. Confirmed PRESENT at root: `export_test_cases/`, `dist/`, `.tmp/`, `jest.config.ts`, `docker-compose.yml`, `render.yaml`, `tsconfig.json`, `tsconfig.build.json`, `reports/allure-results/`.

**Decision rule (pre-approved by user 2026-06-12)**: <50% items still-valid → flip Status SUPERSEDED + provenance line; ≥50% → path-patch + keep PENDING. Outcome: 11 → SUPERSEDED; PLAN_FULL_CHAIN_AUDIT → Category-A annotate-only (Status unchanged); SUBPLAN_REPO_08 → parked-annotation (not one of the 12 dispositions; Status stays PENDING). Verdict vocabulary: `already-done` | `target-gone` | `still-valid → <ledger>` | `unverifiable`. Governing master: plans/done/PLAN_LOSSLESS_DEEP_TRIM.md (ledger row 2).

### 1. PLAN_MASTER_REPO_CLEANUP → SUPERSEDED (~0% still-valid)

| Item / claim | Disposition | Evidence (2026-07-16) |
|---|---|---|
| Whole framing: `encore_delivery/` folder to unblock colleague; multi-tenant restructure as a FUTURE peer plan | target-gone | `encore_delivery/` absent; the multi-tenant / client-deliverable rebuild already landed (2026-04-30) — the tracker's premise is history |
| SP-01, SP-09 | already-done | both already marked SUPERSEDED in the tracker body |
| SP-02/03/04/05/06/07/10/11/12/13 remaining-cleanup roadmap | target-gone / superseded | children dispositioned rows 2–9 below; live dead-weight now governed by the Approved Candidate Ledger (TRIM_04/05, RCD_B/C, DQU-26/27/28) |
| Plan Disposition table (ABSORB CODEBASE_CLEANUP/MAINTAINER_SWEEP/FULL_CHAIN_AUDIT into SP-05) | superseded | those 3 plans dispositioned directly (rows 10–12) |

### 2. SUBPLAN_REPO_03_AGENT_FILE_RESTRUCTURE → SUPERSEDED (0% still-valid)

| Item | Disposition | Evidence |
|---|---|---|
| Move agent files from `specs_planning/_internal/` → `.claude/pipeline/` | target-gone | root `specs_planning/` absent; agent files already relocated to `clients/encore/specs_planning/_internal/`; `.claude/pipeline/` never created (runtime is top-level `pipeline/`) |
| Keep example-login/test-case-template/test-id-registry in `_internal/` | target-gone | root `_internal/` gone; those artifacts relocated/retired by the client rebuild |
| Move `tests/examples/` → `.claude/examples/` | target-gone | root `tests/` gone (client specs now `clients/encore/tests/`); no `tests/examples/` |
| Update `scripts/shared-types.ts` SHARED_PATHS nerve center | target-gone | `scripts/shared-types.ts` still exists, but the path layout it points at was rebuilt entirely; the specific move is moot |

### 3. SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE → SUPERSEDED (<50% still-valid)

| Item | Disposition | Evidence |
|---|---|---|
| 3 allure locations (root `allure-report/`, `allure-results/`, `reports/allure-results/`) | already-done | 2 root allure dirs absent; canonical `reports/allure-results/` present = the single location the item wanted |
| Rename `export_test_cases/` → `tools/export-test-cases/` | still-valid → next-batch | `export_test_cases/` still at root; `tools/export-test-cases/` absent. NOT covered by any ledger row (TRIM_05 deletes dead converters, does not rename the dir) → Next-batch |
| Reports bloat (`.pre-*`, `sp5-*.log`, `test-results.json`) | still-valid → RCD_C | RCD_C ledger row 9 governs root `reports/` relocation + cruft sweep |
| Root trash `cli and mcp in our repo.md` | already-done | absent |
| Root trash `.tmp/` (empty dir) | still-valid → next-batch | `.tmp/` still present; tiny; no ledger row |
| `.playwright-mcp/` cache | already-done | absent |
| `logs/` accumulation | already-done | absent at root |
| Stale `dist/` | still-valid → next-batch | `dist/` still present at root; no ledger row (RCD_C handoff lists `dist/` as a KEEP = framework build) |
| Absorbed PLAN_PLANS_INDEX_AUTOREGEN (reindex automation) | already-done | `npm run plans:reindex` automation live (used across sessions) |

### 4. SUBPLAN_REPO_05_DEAD_CODE_REUSABILITY → SUPERSEDED (<50% still-valid)

| Item | Disposition | Evidence |
|---|---|---|
| Re-verify + execute PLAN_CODEBASE_CLEANUP items | target-gone | dispositioned directly (row 10); its targets pre-restructure |
| Re-verify + execute PLAN_MAINTAINER_SWEEP 3 items | target-gone | dispositioned directly (row 11); root `src/pages`/`src/core` gone |
| Re-verify + execute PLAN_FULL_CHAIN_AUDIT code findings | superseded | Category C/D untouched (row 12); code-bug findings, out of trim scope |
| Grep for new duplicated patterns (5+ occ) in current tree | still-valid (generic) → covered | live dead-code sweep governed by TRIM_04/05 + the DQU `/simplify`+`/cleanup` sweeps (DQU-26/27/28) |

### 5. SUBPLAN_REPO_06_DOC_MD_SLOP_AUDIT → SUPERSEDED (<50% still-valid)

| Item | Disposition | Evidence |
|---|---|---|
| Audit root `REQUIREMENTS.md` | target-gone | root `REQUIREMENTS.md` absent (client copy is `clients/encore/docs/REQUIREMENTS.md`, gitignored) |
| Audit `specs_planning/test-cases/*` + `test-plans/*` (root) | target-gone | root `specs_planning/` gone; relocated under `clients/encore/specs_planning/` |
| Audit `.github/agents/*.agent.md` (6 files) | target-gone | `.github/agents/` absent; agent prompts at `.claude/agents/*.md` |
| Pre-decontamination path-staleness (`locations/`→`setup/locations/`) checks | target-gone | that decontamination + two later restructures superseded the path scheme |
| Generic "audit current docs for slop" | still-valid (generic) → covered | current-doc slop governed by DQU `/cleanup` sweep (DQU-28); broader repo-doc slop → Next-batch if a dedicated pass is wanted |

### 6. SUBPLAN_REPO_07_SLOP_PREVENTION → SUPERSEDED (0% still-valid — intent over-delivered by a different architecture)

| Item | Disposition | Evidence |
|---|---|---|
| Create `scripts/verify-agent-completion.ts` | target-gone | never created; the completion-verification role is filled by the current hook/gate system (closure gates, execution-completion Stop hook) |
| Create `scripts/verify-repo-health.ts` | target-gone | never created; superseded by the fleet check `scripts/validate-plan-layout.mjs` + dozens of `.claude/hooks/**` + `scripts/check-*` gates |
| Extend `.githooks/pre-commit` for file placement; add REPO_STRUCTURE.md rules | already-done (superior form) | slop-prevention massively over-delivered post-authoring: LR-069 severity policy, `.claude/hooks/**`, pre-commit spec-quality battery, closure gates. The specific 4 deliverables are the wrong architecture now |

### 7. SUBPLAN_REPO_10_SOURCE_CODE_QUALITY → SUPERSEDED (<50% still-valid)

| Item | Disposition | Evidence |
|---|---|---|
| Audit `src/pages/`, `src/core/`, `src/selectors/` (root) | target-gone | absent from root; the page objects/selectors moved to `clients/encore/src/` |
| Exclude `src/orchestrator/`, `src/worker/` | target-gone | both absent from root (moved into `pipeline/`) |
| Client-facing page-object/selector quality sweep | still-valid (relocated) → covered | now lives at `clients/encore/src/`; governed by DQU `/simplify`+`/cleanup` (DQU-26/27/28) |
| Root shared-framework `src/` quality (`src/utils`, `src/data/adapters`, `src/framework-contracts`) | still-valid → next-batch | these root slices survive; no ledger row audits their quality |

### 8. SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT → SUPERSEDED (<50% still-valid)

| Item | Disposition | Evidence |
|---|---|---|
| `scripts/` dead-script audit | still-valid → TRIM_04 | TRIM_04 ledger rows 5–6 (dead scripts + dead npm scripts) |
| Root archive scripts + dead allure npm scripts | still-valid → RCD_B | RCD_B ledger row 8 |
| `tsconfig.json` / `tsconfig.build.json` "are both needed?" | still-valid → RCD_C | RCD_C ledger row 9 (root tsconfig demotion) |
| `.env.server` / `config/environments/` | still-valid → RCD_C | RCD_C Phase 2 |
| `jest.config.ts` "is Jest dead?" | still-valid → next-batch | `jest`+`ts-jest`+`@types/jest` installed, `jest.config.ts` present, `src/data/adapters/__tests__/*.spec.ts` present, but NO root jest run script — deadness unresolved; no ledger row |
| `docker-compose.yml` / `render.yaml` deadness | still-valid → next-batch | referenced ONLY in `plans/**` + `.claude/context/CURRENT_STATE.md` (doc-only); no live script/CI wiring found → likely vestigial; no ledger row |
| `start*.sh` relevance | still-valid → next-batch | `start-dev.sh`/`start-dev.bat` present; RCD_C handoff lists them as root KEEP but relevance unaudited |
| `.gitignore` junk coverage | already-done (largely) | root junk dirs already absent/ignored |

### 9. SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT → SUPERSEDED (0% path-anchors survive)

| Item | Disposition | Evidence |
|---|---|---|
| Audit `tests/locations/*`, `tests/local-office/*` (root) | target-gone | root `tests/` absent; specs at `clients/encore/tests/` |
| Audit `src/infra/fixtures.ts`, `global-setup.ts` | target-gone | `src/infra/` absent; fixtures at `clients/encore/src/fixtures/`, setup at `clients/encore/src/setup/` |
| Audit `src/data/*.data.ts` unused constants | target-gone | the `.data.ts` suffix was dropped in the POM restructure; data now `clients/encore/src/data/<module>/` |
| `tests/seed.spec.ts` accuracy | target-gone | absent (auth now via `clients/encore/tests/auth.setup.ts`) |
| Generic test-infra consistency | still-valid (generic) → covered | governed by DQU `/simplify`+`/cleanup` (DQU-26/27/28) on the current `clients/encore/tests/` + `src/` |

### 10. PLAN_CODEBASE_CLEANUP → SUPERSEDED (0% still-valid)

| Item | Disposition | Evidence |
|---|---|---|
| A1: delete 8 orphan files (`src/utils/dom-diff.ts`, `selector-registry-validator.ts`, `src/worker/progress-extractor.ts`, `src/utils/bug-hunt-classifier.ts`, 4 `website/` files) | target-gone / already-done | `src/utils/dom-diff.ts`, `selector-registry-validator.ts`, `bug-hunt-classifier.ts` all ABSENT (root `src/utils` now holds only agent-reporter/logger/retry-telemetry/common-methods); `src/worker/` gone; `website/` out of scope (dead) |
| A2: surgical removals in `src/core/ui-common.ts`, `src/core/base-page.ts`, `src/utils/agent-notification-writer.ts`, `src/selectors/locations/account-address.ts` | target-gone | `src/core/`, root `src/selectors/` absent; files relocated/retired |
| B1: 4 `as any` casts in `src/orchestrator/`, `src/server/routes/` | target-gone | `src/orchestrator/`, `src/server/` gone from root (moved to `pipeline/`) — file:line anchors stale |
| B3/B4/B5: SELECTOR_PREFIXES dedup, CheckboxState move, safeLoadJson extract | target-gone | all cite pre-restructure `src/` paths; the `custom-matchers`/`global-teardown` false-positives already note 2026-06-03 removals |

### 11. PLAN_MAINTAINER_SWEEP → SUPERSEDED (mixed vintage — see FLAG)

| Item | Disposition | Evidence |
|---|---|---|
| SP-05: waitForNetworkIdle extraction (25 occ / 9 files, `src/pages/base.page.ts` etc.) | target-gone | root `src/pages/` absent; the exact file:line grep evidence is against the pre-POM layout (`clients/encore/src/pages/base.page.ts` exists but the enumeration is stale) |
| SP-06: CheckboxState/SpinState → framework-contracts (`src/pages/base.page.ts:15` circular import) | target-gone | root `src/pages/base.page.ts` absent; the circular-import anchors are pre-restructure |
| SP-09: write MNT-013/MNT-014 to `agent-mistakes.md` | target-gone | registry relocated + the MNT-/GEN-/HLR- ID scheme reworked at `clients/encore/specs_planning/_internal/agent-mistakes.md` |
| SP-MNT-FCC-01 (2026-05-25): patch/decommission `scripts/sync-agent-mistakes.ts` | **still-valid → next-batch (FLAG)** | script present + wired to `npm run sync:mistakes` (package.json:31); post-2026-04-27 Copilot-eviction rationale still holds; LR-040 §b recipient for PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE |
| SP-MNT-FCC-02 (2026-05-25): add `--module` flag to `scripts/check-tc-parity.ts` | **still-valid → next-batch (FLAG)** | `scripts/check-tc-parity.ts` present; the perf enhancement is unbuilt; LR-040 §b recipient for the same FCC-cure plan |

### 12. PLAN_FULL_CHAIN_AUDIT → ANNOTATE-ONLY (Status unchanged; Category-A pass; C/D untouched)

| Category-A item | Disposition | Evidence |
|---|---|---|
| A-01: GEN-028 duplicate ID at lines 172/176 | target-gone | `rg "GEN-028"` on current registry → 0 hits; the GEN- ID scheme no longer exists there |
| A-02: master-count 134 vs ~155 | target-gone | `rg "master...134|155"` / `^\| GEN-` → 0 hits (no such master-count comment in the current registry) |
| A-03/A-04: GEN-029 missing / GEN-033–037 orphaned in generator agent file | target-gone | the `.github/agents/` generator-agent file `playwright-test-generator.agent.md` is absent (agents at `.claude/agents/GENERATOR.md`); those GEN IDs absent from the registry |
| A-05: HLR-015..022 registry verification | target-gone | `^\| HLR-` → 0 hits; the HLR- scheme is not in the current registry |
| Category B (MAINTAINER_SWEEP dialog defects), C (code bugs), D (structural) | UNTOUCHED | left as-is per disposition scope; `website/` = dead, `src/worker`/`src/orchestrator` relocated to `pipeline/` — a fresh code-bug pass, not a trim concern |

Plan body annotated in-place (note under `## Category A`). Status stays `pending` (NOT wholly stale — C/D are separate code-bug findings). `npm run sync:mistakes` / `validate:sync` scripts survive; only the specific IDs do not.

---

## Next-batch ledger (no action — future user-approval round required, per master plan decision #3)

These are `still-valid` orphan items surfaced during disposition that **no existing Approved Candidate Ledger row covers**. Recorded only; nothing acted on.

| # | Orphan item | Source plan | Verified state (2026-07-16) | Notes |
|---|---|---|---|---|
| NB-1 | Rename root `export_test_cases/` → `tools/export-test-cases/` | REPO_04 | dir present at root; `tools/export-test-cases/` absent | TRIM_05 deletes dead converters but does not rename the dir |
| NB-2 | Root `.tmp/` empty dir | REPO_04 | present | tiny; delete-after-grep candidate |
| NB-3 | Stale root `dist/` freshness | REPO_04 | present | RCD_C handoff currently lists `dist/` as a framework-build KEEP — reconcile intent first |
| NB-4 | Root shared-framework `src/` quality audit (`src/utils`, `src/data/adapters`, `src/framework-contracts`, `src/common`) | REPO_10 | present | client POM src/ is covered by DQU-26/27/28; the ROOT shared slice is not |
| NB-5 | `jest.config.ts` deadness | REPO_11 | jest installed + config present; adapter `__tests__` present; no root jest run script | resolve live vs vestigial |
| NB-6 | `docker-compose.yml` + `render.yaml` deadness | REPO_11 | referenced only in `plans/**` + `.claude/context/CURRENT_STATE.md`; no live wiring found | likely vestigial (dead-website/deploy era) |
| NB-7 | `start-dev.sh` / `start-dev.bat` relevance | REPO_11 | present | RCD_C lists as root KEEP but relevance unaudited |
| NB-8 | **SP-MNT-FCC-01** patch/decommission `scripts/sync-agent-mistakes.ts` | MAINTAINER_SWEEP | script present + wired (`npm run sync:mistakes`) | **FLAG**: was an LR-040 §b named recipient for PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE (now in done/). Superseding MAINTAINER_SWEEP changes this from PENDING-actionable to SUPERSEDED-recorded. The §b linkage is preserved (file not deleted, line item still greppable), but user should confirm this does not undercut that FCC-cure plan's intent, or re-home the 2 items to a fresh pending recipient |
| NB-9 | **SP-MNT-FCC-02** add `--module` flag to `scripts/check-tc-parity.ts` | MAINTAINER_SWEEP | script present; enhancement unbuilt | **FLAG**: same LR-040 §b recipient linkage as NB-8 |
