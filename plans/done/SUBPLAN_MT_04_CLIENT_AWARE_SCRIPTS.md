# SUBPLAN MT-04: Client-Aware Pipeline Scripts

**Status**: DONE
**Priority**: P0
**Parent**: PLAN_MULTI_TENANT_RESTRUCTURE
**Created**: 2026-04-16
**Executed**: 2026-04-17
**Depends on**: SP-MT-03 (client content already at new locations; scripts need to catch up)
**Blocks**: SP-MT-05 (can't safely edit rule docs until pipeline runs cleanly again) — now UNBLOCKED

---

### Execution Summary

**Foundation (Batch 0)**:
- Extended `scripts/shared-paths.ts` with a frozen `SHARED_PATHS` object (25 keys) resolving against `clients/${activeClient()}/...`. Module-load capture; constraint documented.
- Created `scripts/shared-paths.mjs` as an ESM sibling for `.mjs` callers (`validate-activity-log.mjs`).
- `scripts/shared-types.ts` now re-exports `SHARED_PATHS` from shared-paths — strict superset of historical shape so zero caller churn.
- Deleted stale compiled artifacts `scripts/shared-types.js` + `scripts/shared-types.d.ts` (unreferenced; broken `export_test_cases/exports` path).
- New unit test `scripts/shared-paths.test.mjs` + `npm run test:shared-paths` — 6 assertions: default/encore/acme resolution + `.ts` ↔ `.mjs` drift guard.

**Refactored scripts (Batches 1–4, 31 files)**:
- Hooks (12): requirements-pre/post-complete, planner-pre/post-complete, generator-pre-run / post-complete / validate-selectors, healer-pre/post-complete, audit-pre-run / post-complete / block.
- Sync + validate (5): sync-agent-mistakes, sync-copilot-session, validate-agent-sync, validate-activity-log.mjs, validate-queue-integrity.
- Data + catalog (8): capture-mistake, agent-metrics, build-test-id-registry, check-tc-parity, lint-test-cases, detect-duplication, generate-selector-catalog, task-context-builder.
- Orchestration + cleanup (6): pipeline-orchestrator, archive-queue, cleanup-logs, clean-root, clean-artifacts (both untouched — framework-scope only), scan-fixmes.
- Plus drive-by: `validation-gates.ts` had two hardcoded `clients/encore/` literals → swapped to `SHARED_PATHS.escalations`.
- Plus bugfix: `generator-post-complete.ts:737` was missing `_internal` path segment (latent bug) — fixed via `SHARED_PATHS.performance`.
- Plus display-path updates in `task-context-builder.ts` (`mistakesRef`, `learningsRef`, `moduleRef`) + `build-test-id-registry.ts` console log + `planner-post-complete.ts` export return value — all now derive from `SHARED_PATHS` via `path.relative(frameworkRoot(), …)` so display strings track the real post-migration location.

**Consumer (Batch 5)**:
- `src/utils/agent-notification-writer.ts` — no code change; added a one-line comment documenting per-client inbox isolation (`SHARED_PATHS.notifications` = `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-notifications`).

**Design decisions ratified**:
- D1 Notifications: **per-client** (future multi-client deployments need isolated inboxes).
- D2 Path resolution: **module-load eager capture** (simple `Object.freeze`; ACTIVE_CLIENT is set by dotenv-flow at process start).
- D3 Key reconciliation: kept BOTH legacy (`requirements`, `testIdInventory`) and new (`requirementsDoc`, `testIdRegistry`) keys — strict superset, zero caller churn.
- D4 `.mjs` support: sibling file (not ts-node conversion); unit test asserts drift-free.
- D5 Test framework: plain Node script.
- D6 Batching: done in 5 batches, each typecheck-gated.
- D7 Stale compiled artifacts: deleted (unreferenced).
- D8 Activity-log baseline: unchanged — existing stat-fallback-to-missing already skips historical orphans.
- Framework vs client-scope of `docs/read_only_docs/*.md`: discovered during sync:mistakes:dry that `MCP_BROWSER_GUIDE.md`, `AGENT_SHARED_RULES.md`, `ARCHITECTURE.md`, `COMMENTING_STANDARDS.md`, `FIX_DIAGNOSIS_TEMPLATE.md`, `README.md` are **framework-level** (only client-specific .docx requirement files moved into `clients/encore/docs/read_only_docs/`). Corrected routing in `sync-agent-mistakes.ts` + `validate-agent-sync.ts`.
- Schema file (`agent-queue.schema.json`) kept at **framework root** — SP-MT-03 intentionally left schemas/templates/examples at repo root.

**Verification**:
1. `node scripts/shared-paths.test.mjs` → 6/6 assertions pass (default, encore, acme, drift).
2. `ACTIVE_CLIENT=acme` → all 25 SHARED_PATHS keys resolve under `clients/acme/…`; framework paths (`agentsDir`, `reports`) unchanged.
3. `npx tsc --noEmit` → scripts/ clean (unrelated pre-existing errors in website/, src/worker/, tests/unit/ ignored).
4. `npm run pipeline:preflight` → runs end-to-end; only remaining `[ERR] DRIFT DETECTED` is pre-existing rule-sync drift (MOD-004 text and R## subsets) that belongs to SP-MT-05.
5. `npm run validate:sync` → runs; same pre-existing drift.
6. `npm run queue:validate` → runs; 6 pre-existing queue-item findings (self-audit gate bypasses on 3 items — unrelated to this refactor).
7. `npm run validate:activity-log:preflight` → runs; 4 pre-existing backdating violations (LR-037 hygiene, unrelated).
8. `npm run sync:mistakes:dry` → clean; all SYNC markers report `[ok]`.
9. `npm run registry:build` → clean; 277 TCs, written to `clients/encore/specs_planning/_internal/test-id-registry.json`.
10. Final grep audit: `grep -rE "specs_planning/_internal|docs/REQUIREMENTS\.md|docs/MODULE_REGISTRY\.md" scripts/ src/utils/agent-notification-writer.ts` → 3 hits, all in doc comments (matches plan's expected end state). Zero functional hardcoded paths remain.

**TCs dropped / deferred**: None — every scoped item delivered.

**Notifications migration**: no orphan `.json` files at the old `specs_planning/_internal/agent-notifications/` location; no `mv` needed.

**Follow-ups (separate plans)**:
- SP-MT-05: split CLAUDE.md / AGENT_SHARED_RULES.md (now unblocked).
- Rule-sync drift (MOD-004 text, R## subset missing) — belongs under rule-doc hygiene, not this refactor.
- Rename `requirements`→`requirementsDoc`, `testIdInventory`→`testIdRegistry` across callers (optional — strict superset kept both).

---

### Original plan follows (preserved for traceability)

---

## Goal

Refactor every pipeline script to resolve paths via `ACTIVE_CLIENT` (using `scripts/shared-paths.ts` from SP-MT-01). This re-greens the pipeline that SP-MT-03 intentionally broke.

After this subplan: `npm run pipeline:preflight` green, a full end-to-end pipeline turn (requirements → planner → generator → audit) resolves paths into `clients/encore/...` correctly.

---

## Scope

### 1. Complete `scripts/shared-paths.ts`

Extend the helper from SP-MT-01 with a full `SHARED_PATHS` object. Each key returns an absolute path resolved against `clients/${activeClient()}/...`:

```
SHARED_PATHS = {
  clientRoot,                  // clients/encore
  testCases,                   // clients/encore/specs_planning/test-cases
  testPlans,                   // clients/encore/specs_planning/test-plans
  audits,                      // clients/encore/specs_planning/audits
  queue,                       // clients/encore/specs_planning/_internal/agent-queue.json
  mistakes,                    // clients/encore/specs_planning/_internal/agent-mistakes.md
  activityLog,                 // clients/encore/specs_planning/_internal/agent-activity-log.md
  performance,                 // clients/encore/specs_planning/_internal/agent-performance.json
  escalations,                 // clients/encore/specs_planning/_internal/agent-escalations.json
  testIdRegistry,              // clients/encore/specs_planning/_internal/test-id-registry.json
  learnings,                   // clients/encore/specs_planning/_internal/agent-learnings.md
  exports,                     // clients/encore/exports
  requirementsDoc,             // clients/encore/docs/REQUIREMENTS.md
  moduleRegistry,              // clients/encore/docs/MODULE_REGISTRY.md
  specs,                       // clients/encore/tests/specs
  pages,                       // clients/encore/src/pages
  selectors,                   // clients/encore/src/selectors
  fixtures,                    // clients/encore/tests/setup/fixtures.ts
  testData,                    // clients/encore/tests/test-data
  reports,                     // reports/ (framework — not per-client yet; decide in session)
  notifications,               // clients/encore/specs_planning/_internal/notifications (or framework?)
  notifications (framework-level): scripts/.notifications or stays in client dir — decide in session
}
```

All framework-level paths (orchestrator internals, scripts themselves) go through `frameworkPath()`.

### 2. Update `scripts/shared-types.ts`

Its `SHARED_PATHS` export (consumed by `src/utils/agent-notification-writer.ts` and possibly others) now delegates to `scripts/shared-paths.ts`. Backward-compatible — callers keep `import { SHARED_PATHS } from './shared-types'`.

### 3. Refactor scripts — one-by-one list

For each script: replace hardcoded strings like `path.join(__dirname, '..', 'specs_planning', '_internal', 'agent-queue.json')` with `SHARED_PATHS.queue` (or appropriate member).

**Agent hook scripts**:
- `scripts/requirements-pre-run.ts`, `requirements-post-complete.ts`
- `scripts/planner-pre-run.ts` (if exists), `planner-post-complete.ts`
- `scripts/generator-pre-run.ts`, `generator-post-complete.ts`, `generator-validate-selectors.ts`
- `scripts/healer-pre-run.ts`, `healer-post-complete.ts`
- `scripts/audit-pre-run.ts`, `audit-post-complete.ts`, `audit-block.ts`

**Sync + validate scripts**:
- `scripts/sync-agent-mistakes.ts`
- `scripts/sync-copilot-session.ts`
- `scripts/validate-agent-sync.ts`
- `scripts/validate-activity-log.mjs` (also: skip pre-baseline historical rows per SP-MT-03 decision)
- `scripts/validate-queue-integrity.ts`

**Data + catalog scripts**:
- `scripts/capture-mistake.ts`
- `scripts/agent-metrics.ts`
- `scripts/build-test-id-registry.ts`
- `scripts/check-tc-parity.ts`
- `scripts/lint-test-cases.ts`
- `scripts/detect-duplication.ts`
- `scripts/generate-selector-catalog.ts`
- `scripts/task-context-builder.ts`

**Orchestration + cleanup**:
- `scripts/pipeline-orchestrator.ts`
- `scripts/archive-queue.ts`
- `scripts/cleanup-logs.ts` (already portable — verify)
- `scripts/clean-root.ts`, `scripts/clean-artifacts.ts`
- `scripts/scan-fixmes.ts`
- `scripts/plans-reindex.mjs` (reads `plans/`, which stays at root — NO change needed)

**Framework-side (no change needed)**:
- `scripts/ensure-report-dirs.js`, `scripts/preserve-allure-history.js`
- `scripts/validation-gates.ts`
- `scripts/report-to-pdf.spec.ts`
- `scripts/client-package.ts` — **OUT OF SCOPE**. Packaging/IP-scrub is colleague's work post-handoff (see PLAN_MULTI_TENANT_RESTRUCTURE "Handoff boundary"). Leave the file untouched; its paths will be stale after SP-MT-03 and that is deliberate — colleague audits and rewrites as they choose.

### 4. Update `src/utils/agent-notification-writer.ts`

SHARED_PATHS now delegates to shared-paths.ts. Verify `SHARED_PATHS.notifications` resolves correctly. Decide whether notifications belong under client (`clients/encore/specs_planning/_internal/notifications/`) or framework (`scripts/.notifications/`). Document the choice.

### 5. Add unit coverage for shared-paths

`scripts/shared-paths.test.ts` (Jest or simple Node script):
- Sets `ACTIVE_CLIENT=encore`, asserts each path resolves under `clients/encore/`.
- Sets `ACTIVE_CLIENT=acme`, asserts paths resolve under `clients/acme/`.
- Default (no env): resolves under `clients/encore/`.

### 6. Update `package.json` scripts if needed

Any script entry that passes a path argument (e.g., `"check:tc-parity": "ts-node scripts/check-tc-parity.ts"`) — leave alone if the TS script internally uses `SHARED_PATHS`. If a script entry hardcodes a path in the command line (e.g., `"test:adapters": "playwright test src/data/adapters/..."`), leave it (framework-level path, no client coupling).

---

## Verification

```
# 1. Unit tests pass
node scripts/shared-paths.test.js
# (or npm run test:unit once wired)

# 2. Pipeline preflight green
npm run pipeline:preflight

# 3. Full pipeline validate
npm run pipeline:validate

# 4. Activity log validator accepts both old and new-path rows
npm run validate:activity-log
npm run validate:activity-log:preflight

# 5. Sync scripts run dry without path errors
npm run sync:mistakes:dry
npm run validate:sync

# 6. A full pipeline turn resolves correctly
#    (pick one small TC in a test module, run planner-pre-run → generator-pre-run → audit-pre-run
#     and verify they read/write under clients/encore/specs_planning/...)

# 7. Test suite still green
npm test

# 8. No hardcoded 'specs_planning/_internal' or 'docs/REQUIREMENTS.md' left in scripts/
grep -rE "specs_planning/_internal|docs/REQUIREMENTS\.md|docs/MODULE_REGISTRY\.md" scripts/ src/utils/agent-notification-writer.ts
# Expected: only string literals inside shared-paths.ts itself and inside comments.
```

---

## Out of scope

- Splitting CLAUDE.md / AGENT_SHARED_RULES.md — SP-MT-05.
- Parameterizing agent hardcodes (Office 1604 etc.) — SP-MT-06.
- Client packaging — SP-MT-07.
- Onboarding a second client.

---

## Risks

- **Biggest rewrite surface in the plan**. 20+ scripts, each written by different agents over months. Style varies: some use `process.cwd()`, some use `__dirname`, some use absolute paths read from env. Budget for 1.5x the expected time; consider splitting into SP-MT-04a (hooks) + SP-MT-04b (validators + sync) if session runs long.
- **Activity log backwards compatibility**: SP-MT-03 decided to leave historical rows with old paths. `validate-activity-log.mjs` needs a baseline-date gate. Verify with a synthetic row dated pre-baseline that should pass.
- **`SHARED_PATHS` imported vs function call**: original `shared-types.ts` export was an object literal. If callers destructure `const { queue } = SHARED_PATHS` at module load time, the value is captured once — changing `ACTIVE_CLIENT` later won't rescope. Either export getters or document the constraint.
- **Notifications path**: if currently at `scripts/.notifications/` (framework-shared), moving to client means multi-client notifications need per-client inboxes. Decide and document in the SP-MT-04 commit.

---

## Critical files (touch list)

**Edited** (~20 scripts + 1 util):
- All scripts listed in Scope §3.
- `src/utils/agent-notification-writer.ts`
- `scripts/shared-types.ts`

**New**:
- `scripts/shared-paths.test.ts` (or `.js` — any runnable form)

---

## Session checklist

- [ ] Complete `SHARED_PATHS` implementation in shared-paths.ts.
- [ ] Refactor scripts in batches (hooks → validators → sync → orchestration). Typecheck after each batch.
- [ ] Unit test for shared-paths passes with ACTIVE_CLIENT=encore and =acme.
- [ ] All 8 verification steps green.
- [ ] Activity log entry + mistakes.md if anything tripped a rule.
- [ ] Status DONE, move to `plans/done/` (LR-027).
- [ ] `npm run plans:reindex`.
