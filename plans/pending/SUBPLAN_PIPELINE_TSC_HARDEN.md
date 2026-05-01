# SUBPLAN: Pipeline tsc Compilation — Harden Build Mode

**Status**: PENDING
**Priority**: P2-NORMAL
**Created**: 2026-05-01
**Identity**: OWNER
**Parent**: PLAN_CLIENT_DELIVERABLE_REBUILD.md
**Depends on**: PLAN_CLIENT_DELIVERABLE_REBUILD must reach Status: DONE first (this subplan post-dates that closure)
**Blocks**: production deployment of pipeline server/worker via compiled `dist-pipeline/` artifacts (ts-node mode unaffected)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: none
**Skills**: /research (Phase 1), /planning (Phase 2 if Option B chosen — references-config drafting), /execute (Phase 3)

---

## Context

After `PLAN_CLIENT_DELIVERABLE_REBUILD` moved `src/{orchestrator,server,worker,utils/agent-notification-writer}/` to `pipeline/{...}/`, `npx tsc --noEmit -p pipeline/tsconfig.json` reports 5 errors. Mechanical post-move import fixes were applied during R3 (deviations #29-30 of the parent plan), reducing from "Cannot find" errors to **rootDir violations** + 1 pre-existing `Type 'never'` issue. The runtime pipeline (`npm run server:start` / `npm run worker:start`) works under ts-node — module resolution at runtime ignores tsconfig rootDir. But `npm run build:server` cannot produce a clean `dist-pipeline/` for production deployment.

**Why this is a separate subplan, not inline R3 work**: choosing the rootDir architecture is a real design decision with multi-file consequences. Three candidate paths (B / C / D below); each has tradeoffs that need evaluation. Lumping it into R3 commit-prep would either rush the decision or stall the parent plan finalize.

**What broke**: `pipeline/utils/agent-notification-writer.ts` imports `../../src/framework-contracts/diagnostics` (post-R3-fix path) and `../../scripts/shared-types` — both exist on disk, both resolve at runtime, both fail tsc rootDir check because they live outside `pipeline/`. Same shape: `pipeline/scripts/healer-post-complete.ts` imports `../../scripts/{shared-types,validation-gates}`.

**Why option A (move framework-contracts/ to pipeline/) is invalid**: `src/framework-contracts/` is used by FRAMEWORK code (`src/utils/agent-reporter.ts`, `src/utils/diagnostics-collector.ts`) that ships to clients via `vendor:build`. Moving it to `pipeline/` would orphan the vendored framework at clients. framework-contracts/ MUST stay in src/.

---

## Bootstrap

- **Identity**: OWNER (non-pipeline, framework-level refactor)
- **Skills auto-called**: `/identity` (universal gate), `/regression-guard` (BEFORE+AFTER), `/audit` (Phase 4 closure), `/reflect`, `/final-q`
- **Context files** (all must be loaded):
  - `.claude/context/navigation.md` (R00)
  - `clients/encore/specs_planning/_internal/agent-mistakes.md` (ALL-* / GEN-* / etc.)
  - `.claude/rules/pipeline.md` (LR-027, LR-028, LR-046, LR-049)
  - `plans/pending/PLAN_CLIENT_DELIVERABLE_REBUILD.md` (parent — deviations #22, #29, #30 set up this subplan)
  - `clients/encore/specs_planning/_internal/PLAN_CLIENT_DELIVERABLE_REBUILD-deviations.md` (#22+#29+#30+#32)
  - TypeScript handbook: project references — https://www.typescriptlang.org/docs/handbook/project-references.html

---

## Phase 0: Dependency + Browser-Tool Gate

- [ ] Confirm parent plan PLAN_CLIENT_DELIVERABLE_REBUILD has reached `Status: DONE` (move to `plans/done/`).
- [ ] Confirm `npm run build:server` is currently broken (5 tsc errors) — do NOT proceed if it's mysteriously green now (something changed; re-baseline).
- [ ] Confirm `npm run server:start` and `npm run worker:start` STILL bootstrap cleanly under ts-node (R1.9 baseline).
- [ ] Browser-tool: NONE (this is purely a build-system refactor).

## Phase 1: Evaluate the 3 candidate architectures

Read each candidate's tradeoffs. Pick ONE based on the criteria; the picked path goes to Phase 2.

### Option B — TypeScript project references

Make `pipeline/tsconfig.json` `composite: true` and reference a shared types config covering `src/framework-contracts/` + relevant `scripts/` files. tsc compiles each project independently; cross-project imports go through `.d.ts` files that the upstream project emits.

**Pros**:
- Idiomatic TypeScript pattern for monorepo-style cross-tree imports.
- Builds become incremental (`tsc -b`).
- Each project keeps its own clean rootDir.

**Cons**:
- Requires `composite: true` in the upstream tsconfigs (forces `declaration: true` + `declarationMap: true`).
- Build command shape changes (`tsc -b pipeline/tsconfig.json` instead of `tsc -p`).
- Adds a `tsconfig.types.json` (or similar) at repo root; one more file to maintain.

### Option C — Widen `pipeline/tsconfig.json` rootDir to repo root

Set `rootDir: '..'` (repo root) and adjust `include` to enumerate the cross-tree files explicitly. tsc compiles all of them under one project.

**Pros**:
- Simple — no new config file, no new build command.
- Single tsc project; predictable output path.

**Cons**:
- `outDir` structure becomes deeper (`dist-pipeline/pipeline/server/index.js` instead of `dist-pipeline/server/index.js`) UNLESS `rootDirs` is used carefully.
- Pipeline tsc now type-checks `src/framework-contracts/` and `scripts/` files — a slow build, and any unrelated error in those trees breaks the pipeline build.
- Harder to maintain boundary between pipeline/ and src/.

### Option D — Skip tsc entirely; rely on ts-node at runtime

Remove `build:server` script; document that pipeline server/worker are deployed via ts-node-on-demand or via a runtime bundler (esbuild / swc) rather than tsc-compiled artifacts.

**Pros**:
- Zero config burden.
- ts-node already works (R1.9 PASS).

**Cons**:
- No build-time type validation for pipeline code.
- Production deploys lose the cleanly-typed `dist-pipeline/` artifact.
- Drifts further from the "pipeline is a real production artifact" thesis.

### Decision criteria

Pick **B** if: production deployments run `tsc`-compiled artifacts AND the team values build-time typecheck for pipeline code. Most idiomatic; recommended unless C or D wins on simplicity.

Pick **C** if: project references feel heavyweight for a small cross-tree dependency (we only have 4 cross-tree imports total across 2 files).

Pick **D** if: production deployments will use a different runtime build tool (esbuild/swc/Bun) that handles cross-tree imports natively.

**Default recommendation** (subject to Phase 1 evidence): **C**. Smallest change, predictable output, only 4 imports cross the boundary. If the boundary grows (>20 cross-tree imports), revisit and pick B.

## Phase 2: Apply the chosen architecture

(Filled in after Phase 1 picks an option. Each option has its own checklist.)

### If Option B chosen
- Author `tsconfig.types.json` at repo root with `composite: true`, `include: ['src/framework-contracts/**/*.ts', 'scripts/shared-types.ts', 'scripts/shared-paths.ts', 'scripts/validation-gates.ts']`.
- Modify `pipeline/tsconfig.json`: add `references: [{ path: '../tsconfig.types.json' }]`, set `composite: true`.
- Update `package.json:91 build:server`: `tsc -b pipeline/tsconfig.json && node -e "..."` (preserve schema.sql copy step).
- Run `tsc -b pipeline/tsconfig.json --verbose` and verify clean.
- Verify `npm run server:start` still works.

### If Option C chosen
- Modify `pipeline/tsconfig.json`: `rootDir: ".."`, expand `include` to add `"../src/framework-contracts/**/*.ts"`, `"../scripts/shared-types.ts"`, `"../scripts/shared-paths.ts"`, `"../scripts/validation-gates.ts"`. Keep `outDir: "../dist-pipeline"` but expect deeper output structure OR use `rootDirs` to flatten.
- Run `npx tsc --noEmit -p pipeline/tsconfig.json` and confirm 0 errors.
- Update `package.json:91 build:server` only if outDir structure changed.
- Verify `node dist-pipeline/server/index.js` (or new path) finds `schema.sql` via `__dirname` resolution.

### If Option D chosen
- Remove `build:server` script from `package.json`.
- Document in pipeline/README.md: "Pipeline runs under ts-node only. Production deployment uses [esbuild/swc/Bun] separately — see deployment doc."
- Remove the `dist-pipeline/` reference from root `.gitignore` (no longer needed).
- Verify ts-node mode still works.

## Phase 2.5: Resolve the pre-existing `Type 'never'` error

`pipeline/worker/progress-extractor.ts:85`: `error TS2349: This expression is not callable. Type 'never' has no call signatures.`

This error is unrelated to the move — it's pre-existing pipeline code. Read the file, identify the type-narrowing issue, fix at the source. Common shape: `arr.filter(...).find(...)` where the filter returns `[]` so find returns `undefined` and the subsequent call breaks. Fix with explicit type annotation or refactor.

## Phase 3: Validation

- [ ] `npx tsc --noEmit -p pipeline/tsconfig.json` returns 0 errors.
- [ ] `npm run build:server` produces `dist-pipeline/server/index.js` AND `dist-pipeline/server/db/schema.sql` (post-tsc copy step from parent plan deviation #18).
- [ ] `node dist-pipeline/server/index.js` starts without import-resolution crash (DB-connect failure expected in dev — same gate as R1.9).
- [ ] `npm run server:start` (ts-node mode) STILL works.
- [ ] `npm run worker:start` (ts-node mode) STILL works.
- [ ] **Strict — must equal zero**: any new tsc errors introduced by the chosen option.

## Phase 3.5: Plan finalization

- [ ] Status flip: PENDING → DONE.
- [ ] `### Execution Summary` section appended (which option chosen + why + what changed).
- [ ] `git mv plans/pending/SUBPLAN_PIPELINE_TSC_HARDEN.md plans/done/`.
- [ ] `npm run plans:reindex`.
- [ ] LR-027 parent-cascade — **check** if any other pending subplans depend on PLAN_CLIENT_DELIVERABLE_REBUILD; if zero, the parent plan's closure is already done by the time this subplan finalizes (this subplan post-dates parent finalize per dependency).

## Acceptance criteria

- [ ] Phase 1 produces a written decision (B / C / D) with rationale.
- [ ] Phase 2 implements the decision with all listed sub-steps complete.
- [ ] Phase 2.5 resolves the pre-existing `Type 'never'` error.
- [ ] Phase 3 validation gates ALL pass.
- [ ] Activity-log entry per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] Deviation rows in `clients/encore/specs_planning/_internal/PLAN_CLIENT_DELIVERABLE_REBUILD-deviations.md` (linked-by-reference; this subplan is a child of that deviation log).

## Handoff

Chat-only per `feedback_handoff_in_chat_only.md`. Outcome: pipeline build mode now produces clean artifacts; production deployment unblocked. ts-node mode unchanged.
