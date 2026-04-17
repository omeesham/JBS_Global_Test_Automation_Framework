# SUBPLAN MT-03: Move Docs, specs_planning, Exports, Client Config

**Status**: PENDING
**Priority**: P0
**Parent**: PLAN_MULTI_TENANT_RESTRUCTURE
**Created**: 2026-04-16
**Depends on**: SP-MT-02 (test content already moved; imports resolve)
**Blocks**: SP-MT-04 (scripts must adopt client-aware paths before pipeline is usable)

---

## Goal

Relocate every remaining encore-specific content category: product requirements, module registry, planning artifacts (test-cases, test-plans, audits), agent-internal state (mistakes, queue, activity-log, performance, escalations, learnings, test-id-registry), exports, environment config, allure config.

**Known interim breakage**: pipeline scripts will fail during SP-MT-03 because they hardcode `specs_planning/_internal/...` paths. That's expected and gets fixed in SP-MT-04. The test suite (`npm test`) must still pass.

---

## Scope

### 1. `git mv` file relocations

**Docs**:
- `docs/REQUIREMENTS.md` → `clients/encore/docs/REQUIREMENTS.md`
- `docs/MODULE_REGISTRY.md` → `clients/encore/docs/MODULE_REGISTRY.md`
- `docs/read_only_docs/Encore-Requirements-V2.docx` → `clients/encore/docs/read_only_docs/Encore-Requirements-V2.docx`

**Keep at framework root**:
- `docs/ARCHITECTURE.md`, `docs/COMMENTING_STANDARDS.md`, `docs/FIX_DIAGNOSIS_TEMPLATE.md`
- `docs/read_only_docs/MCP_BROWSER_GUIDE.md`
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (splits in SP-MT-05, not this session)

**specs_planning/**:
- `specs_planning/_internal/agent-mistakes.md` → `clients/encore/specs_planning/_internal/`
- `specs_planning/_internal/agent-queue.json` → client
- `specs_planning/_internal/agent-activity-log.md` → client
- `specs_planning/_internal/agent-performance.json` → client
- `specs_planning/_internal/agent-escalations.json` → client
- `specs_planning/_internal/agent-learnings.md` → client
- `specs_planning/_internal/test-id-registry.json` → client
- `specs_planning/test-cases/` → `clients/encore/specs_planning/test-cases/`
- `specs_planning/test-plans/` → `clients/encore/specs_planning/test-plans/`
- `specs_planning/audits/` → `clients/encore/specs_planning/audits/`

**COPY (not move) — framework templates**:
- `specs_planning/_internal/test-case-template.md` → copy to `clients/encore/specs_planning/_internal/` AND keep at root (template for future clients).
- `specs_planning/_internal/agent-queue.schema.json` → stays at root (schema, not data).
- `specs_planning/_internal/example-login-plan.md`, `example-login-test-cases.md` → stay at root (framework examples).

**Config**:
- `config/environments/.env.example` → `clients/encore/config/environments/.env.example`
- `config/environments/.env.development` → `clients/encore/config/environments/.env.development`
- `config/environments/.env.server.example` → `clients/encore/config/environments/.env.server.example`
- `config/environments/.env.local` → stays at root if present (personal overrides; gitignored). Decide during session whether to symlink/document.
- `config/allure/categories.json` → `clients/encore/config/allure/categories.json`

**Keep at root (framework-level config)**:
- `config/mcp/`, `config/pipeline-config.json`, `config/pipeline-definition.json`
- `config/context-builder-prompts.json`, `config/dry-run-prompt.md`

**Exports**:
- `exports/*.csv` → `clients/encore/exports/` (all 11 CSVs)

### 2. `playwright.config.ts` updates

- dotenv path: `clients/${ACTIVE_CLIENT}/config/environments/`
- Allure reporter config path: `clients/${ACTIVE_CLIENT}/config/allure/categories.json`
- `BASE_URL` fallback: unchanged (encore URL as default; env override wins for other clients)

### 3. Agent file documentation updates

`.github/agents/*.agent.md` embed doc references like "update docs/REQUIREMENTS.md". In this subplan we update those references to use placeholder paths:
- `docs/REQUIREMENTS.md` → `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md`
- `docs/MODULE_REGISTRY.md` → `clients/${ACTIVE_CLIENT}/docs/MODULE_REGISTRY.md`
- `specs_planning/_internal/*` → `clients/${ACTIVE_CLIENT}/specs_planning/_internal/*`
- `specs_planning/test-cases/` → `clients/${ACTIVE_CLIENT}/specs_planning/test-cases/`
- `specs_planning/test-plans/` → `clients/${ACTIVE_CLIENT}/specs_planning/test-plans/`
- `exports/` → `clients/${ACTIVE_CLIENT}/exports/`

This is STRING-LEVEL updates in MD files only. Scripts still hardcode old paths; they break. SP-MT-04 fixes scripts. SP-MT-06 fully parameterizes agents.

### 4. `.claude/skills/*/SKILL.md` documentation updates

Skills that reference `specs_planning/_internal/*` in their instructions: update to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/*`. The skill logic itself remains generic.

Affected skills (per exploration): `audit`, `execute`, `reflect`, `compile-learnings`, `bugfix`, `find-bugs`, `chain`, `ultrathink`, `standup`, `end-day`, `planning`, `identity`.

### 5. Activity log handling

Historical rows in `specs_planning/_internal/agent-activity-log.md` (now at `clients/encore/specs_planning/_internal/agent-activity-log.md`) reference paths like `tests/specs/setup/...` that no longer exist.

**Decision (recommend)**: leave historical rows unchanged — they're an audit trail. Any path validator must treat pre-SP-MT-02 rows as archival. Future rows use new paths.

Update `scripts/validate-activity-log.mjs` (in SP-MT-04) to skip path-existence checks for rows before the SP-MT-02 commit date.

### 6. `package.json` script paths

Most scripts reference `scripts/*.ts` by filename — unaffected. But any script invocation embedding `specs_planning/`, `tests/`, `src/`, `exports/`, `docs/` needs updating:
- `"check:tc-parity"` references `specs_planning/test-cases/` and `exports/` — update via shared-paths.ts in SP-MT-04.
- For SP-MT-03: don't rewrite `package.json`. Scripts still hardcode old paths; we accept the interim break.

---

## Verification

```
# 1. Moves completed cleanly
ls clients/encore/docs/REQUIREMENTS.md \
   clients/encore/specs_planning/_internal/agent-mistakes.md \
   clients/encore/specs_planning/test-cases \
   clients/encore/exports \
   clients/encore/config/environments/.env.example

# 2. Specs still pass (test runner reads env via updated playwright.config)
npm test

# 3. Expected pipeline-script breakage documented
npm run validate:activity-log:preflight
# Expected: FAILS (hardcoded path). Document exact failure in the SP-MT-03 commit message.

# 4. Agent file references updated
grep -r "docs/REQUIREMENTS.md\b\|specs_planning/_internal\b\|docs/MODULE_REGISTRY.md\b" .github/agents/ .claude/skills/
# Should show only placeholder-style references: clients/${ACTIVE_CLIENT}/...

# 5. Framework still runs a generic pipeline step (e.g., npm run plans:reindex)
npm run plans:reindex:check
```

---

## Out of scope

- Refactoring any pipeline script to use shared-paths.ts — SP-MT-04.
- Splitting CLAUDE.md / AGENT_SHARED_RULES.md — SP-MT-05.
- Parameterizing agent hardcodes (Office 1604, Navigator URL) — SP-MT-06.

---

## Risks

- **Pipeline-wide breakage during this session**: all agent hook scripts (generator-pre-run, healer-pre-run, audit-pre-run, etc.) will fail until SP-MT-04 lands. Communicate this in commit message and update team (don't run pipeline tasks between SP-MT-03 and SP-MT-04).
- **Do not hand off to colleague between SP-MT-03 and SP-MT-04**: user directive is we ship the whole restructured repo to colleague. A mid-restructure state (SP-MT-03 merged, SP-MT-04 pending) ships a broken pipeline. Either (a) bundle SP-MT-03 + SP-MT-04 into a single merge, or (b) delay colleague handoff until SP-MT-04 verifies green. Prefer (b).
- **`.env.local` (personal)**: gitignored, may exist on developer machines at old path. Document migration instructions in the SP-MT-03 PR description.
- **Allure reporter coupling**: playwright-allure reads `config/allure/categories.json` by relative path from CWD. Verify that the moved path resolves correctly after `playwright.config.ts` update.
- **Audit folder**: `specs_planning/audits/*.md` is gitignored by `.gitignore` rule `specs_planning/audits/*.md`. After moving to `clients/encore/specs_planning/audits/`, verify gitignore covers the new path OR intentionally flip it (might want audits tracked per-client now).

---

## Critical files (touch list)

**Moved** (~200+ files via `git mv`).

**Edited**:
- `playwright.config.ts`
- `.github/agents/*.agent.md` (6 files, docs-string updates)
- `.claude/skills/*/SKILL.md` (~12 files, docs-string updates)
- `.gitignore` (update audit folder rule if needed)

**New**: none.

---

## Session checklist

- [ ] Move docs, then specs_planning, then exports, then config/environments, then config/allure. Typecheck after each.
- [ ] Verification 1, 2, 5 green. Verification 3 confirms expected failure of pipeline preflight (document it).
- [ ] Agent + skill docstring references updated via grep+edit.
- [ ] Activity log entry (LR-028, LR-037). Use NEW path `clients/encore/specs_planning/_internal/agent-activity-log.md`.
- [ ] Status DONE, move to `plans/done/` (LR-027).
- [ ] `npm run plans:reindex`.
- [ ] Commit message explicitly calls out "PIPELINE BROKEN UNTIL SP-MT-04 — do not run pipeline tasks".
